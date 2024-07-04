<template>
  <div class="settings">
    <Row class="settings-header">
      <Col :span="12">
      <h3 class="header-title">
        <Button type="text" @click="handleGoBack"><i class="el-icon-back"></i></Button>
        {{ generateTitle }}
      </h3>
      </Col>
      <Col :span="12" class="right-section">
      <Button v-if="!!tableData && tableData.length > 1" @click="onClickSort" class="sort-group-btn">
        {{ $t('aiToolBar.group.sort') }}
      </Button>
      <Button v-if="canOperate" type="primary" @click="openModal">
        {{ $t('aiToolBar.settings.addScenario') }}
      </Button>
      </Col>
    </Row>
    <Row class="settings-content">
      <Col :span="24" class="ai-list">
      <Table :data="tableData" v-loading="loading" :row-key="id" :default-expand-all="true" ref="aiSettingTable"
        class="ai-tool-bar-setting-table" header-cell-class-name="setting-header" row-class-name="setting-row"
        cell-class-name="setting-cell">
        <TableColumn type="expand" :width="35">
          <template slot-scope="props">

            <sortTable from="scenario" :tableData="props.row.list" :canOperate="canOperate" @refreshData="getDataList"
              @onDelete="handleDelete" :type="type" :stage="stage" />

          </template>
        </TableColumn>
        <TableColumn :label="$t('aiToolBar.settings.groupName')" class-name="scenario-name-column">
          <template slot-scope="scope">
            {{ scope.row.groupId === -1 ? $t('aiToolBar.group.ungrouped') : scope.row.groupName }}
          </template>
        </TableColumn>
        <TableColumn :label="$t('aiToolBar.settings.showCondition')" class-name="condition-column">
          -
        </TableColumn>
        <TableColumn v-if="canOperate" :label="$t('aiToolBar.settings.opration')">
          -
        </TableColumn>
        <template #empty>
          <div class="no-data">
            <img src="@/svg/no-data.svg" :alt="$t('crm.Table.customerColumnsNoData')" />
            <p>{{ $t('aiToolBar.settings.noData') }}</p>
          </div>
        </template>
      </Table>
      </Col>
    </Row>
    <!-- 添加新ai应用 -->
    <template v-if="isVisible">
      <addAppModal :visible="isVisible" @onClose="closeModal" @onConfirm="getDataList" :data="selectedData" :type="type"
        :stage="stage" />
    </template>

    <!-- 分组排序 -->
    <template v-if="sortModalVisible">
      <sortGroupModal :visible="sortModalVisible" :tableData="sortData" @refreshData="getDataList"
        @onClose="closeSortModal" :type="type" :stage="stage" />
    </template>
  </div>
</template>

<script>
import addAppModal from './addAppModal'
import sortGroupModal from './sortGroupModal'
import sortTable from './component/sortTable.vue'
import { triggerType } from '../utils/data'
import { mapState } from 'vuex'
import {
  deleteToolbarScenarioConfig,
  queryToolbarScenarioConfig,
} from '../api/index'
import { storage } from '../api/store'

export default {
  name: 'settings',
  components: {
    sortGroupModal,
    addAppModal,
    sortTable,
  },
  props: {
    type: '',
    stage: '',
  },
  mounted() {
    this.getDataList()
  },
  computed: {
    ...mapState(['enterpriseId', 'userId']),
    generateTitle() {
      let titleType = ''
      let titleStage =
        this.stage === 1
          ? this.$t('aiToolBar.settings.input')
          : this.$t('aiToolBar.settings.output')
      switch (this.type) {
        case 'inputBoxSlash':
          titleType = this.$t('aiToolBar.triggerType.inputSlash')
          break
        case 'inputBoxSelect':
          titleType = this.$t('aiToolBar.triggerType.inputSelect')
          break
        case 'pageSelect':
          titleType = this.$t('aiToolBar.triggerType.pageSelect')
          break
        default:
          break
      }
      return `${titleType} - ${titleStage}`
    },

    selectedData() {
      let data = []
      this.tableData.forEach(i => data = [...data, ...i.list]);
      return data
    },
    canOperate() {
      return this.type === 'inputBoxSlash'
    },
    sortData() {
      return this.tableData.filter((item) => {
        return item.groupId !== -1
      })
    },
  },
  methods: {
    handleGoBack() {
      this.$emit('onClickGoBack')
    },
    handleDelete(id) {
      this.loading = true
      this.deleteScenario(id)
    },
    openModal() {
      this.isVisible = true
    },
    closeModal() {
      this.isVisible = false
    },

    onClickSort() {
      this.sortModalVisible = true
    },
    closeSortModal() {
      this.sortModalVisible = false
    },

    getDataList() {
      this.loading = true
      const _this = this;
      queryToolbarScenarioConfig({
        orgId: this.enterpriseId,
        userId: this.userId,
        triggerType: triggerType[this.type],
        stage: this.stage,
      })
        .then((res) => {
          if (res.code === 1) {
            const scrollPosition = document.querySelector('.single-page').scrollTop
            this.tableData = []
            this.$nextTick(() => {
              _this.$set(_this, 'tableData', res.data)
              setTimeout(() => {
                if (res.data.length > 0) document.querySelector('.single-page').scrollTop = scrollPosition
              }, 0);
            })
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    deleteScenario(id) {
      deleteToolbarScenarioConfig({
        orgId: this.enterpriseId,
        userId: this.userId,
        scenarioMappingId: id,
      })
        .then((res) => {
          if (res.code === 1) {
            this.$Message.success(this.$t('aiToolBar.settings.deleteSuccess'))
            storage.remove(
              `${this.enterpriseId}${this.userId}${triggerType[this.type]}${this.stage}`
            )
            this.getDataList()
          }
        })
        .catch(() => {
          this.loading = false
          this.$Message.error(this.$t('aiToolBar.settings.deleteFailed'))
        })
    },
  },
  data() {
    return {
      isVisible: false,
      tableData: [],
      loading: false,

      // 分组排序
      sortModalVisible: false,
    }
  },
}
</script>

<style lang="less" scoped>
.settings {
  display: flex;
  flex-direction: column;
  height: 100%;

  .settings-header {
    padding: 18px 20px 18px 16px;

    .header-title {
      line-height: 36px;
      color: #303133;

      button {
        font-size: 18px;
      }
    }

    .right-section {
      text-align: right;

      .sort-group-btn {
        margin-right: 10px;
      }
    }
  }

  .settings-content {
    flex: 1;
    height: 100%;
    border-top: 1px solid #e8eaec;
    border-bottom: 1px solid #e8eaec;

    .ai-list {
      height: 100%;
      border-right: 1px solid #e8eaec;

      .no-data {
        padding-top: 100px;
      }
    }
  }

  .settings-footer {
    padding: 18px 36px;
  }

  .ai-tool-bar-setting-table {
    .setting-row {
      background-color: #F6F6F6;
    }

    .opration-btn {

      &:hover,
      &:active {
        color: #4285f2;
      }
    }
  }
}
</style>

<style lang="less">
.settings {

  .ai-tool-bar-setting-table {
    .setting-header {
      .cell {
        font-size: 14px;
        font-weight: 500;
        color: #000000CC;
      }
    }

    .setting-row {
      background-color: #F6F6F6;

      .scenario-name-column {
        .cell {
          color: #333333;
          font-weight: 500;
        }
      }
    }

    .el-table__expanded-cell {
      padding: 0;
      border-bottom: none;
    }

    .setting-cell {
      .cell {
        font-size: 14px;
        font-weight: 400;
        color: #000000CC;
      }

      &.el-table__expand-column {
        padding-left: 17px;
      }
    }

    &::before {
      height: 0;
    }
  }
}
</style>
