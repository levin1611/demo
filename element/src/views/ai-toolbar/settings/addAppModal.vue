<template>
  <Modal class="add-app-modal" :visible.sync="visible" :title="$t('aiToolBar.addModal.title')" :append-to-body="true"
    :modal-append-to-body="false" :close-on-click-modal="false" @close="onClose" :destroy-on-close="true"
    width="1000px">
    <div class="add-app-content" v-loading="oprationLoading">
      <Row>
        <Col class="left-section" :span="17" v-loading="loading">
        <div class="search-title">
          <Input class="search-input" v-model="searchKeyWords" @keyup.enter.native="handleSearch"
            :placeholder="$t('aiToolBar.addModal.placeholder')">
          <Icon style="cursor: pointer" slot="suffix" custom="custom custom-journey-search mail-search" size="14"
            @click="handleSearch"></Icon>
          </Input>
          <Select v-model="searchGroupId" class="search-select-group" clearable @change="onSelectChange"
            :placeholder="$t('aiToolBar.group.placeholder')">
            <Option key="null" :label="$t('aiToolBar.group.all')" :value="null">{{ $t('aiToolBar.group.all')
              }}</Option>
            <Option key="-1" :label="$t('aiToolBar.group.ungrouped')" :value="-1">{{ $t('aiToolBar.group.ungrouped')
              }}</Option>
            <Option v-for="optionItem in groupOptions" :key="optionItem.id" :label="optionItem.groupName"
              :value="optionItem.id">{{ optionItem.groupName }}</Option>
          </Select>
        </div>
        <div v-if="total === 0 && !loading" class="no-app-list">
          <img src="@/svg/no-data.svg" :alt="$t('crm.Table.customerColumnsNoData')" />
          <p v-if="searchKeyWords">
            {{ $t('aiToolBar.addModal.noData', { name: recordKeyWords }) }}
          </p>
          <p v-else>
            {{ $t('aiToolBar.group.noData') }}
          </p>
        </div>
        <div v-else class="app-list">
          <CheckboxGroup v-model="checkedApps">
            <Checkbox class="check-box-item" v-for="item in appList" :label="item.id" :key="item.id">
              {{ item.scenarioName }}
            </Checkbox>
          </CheckboxGroup>
        </div>
        </Col>
        <Col class="right-section" :span="7">
        <div>{{ $t('aiToolBar.addModal.selectedApp') }}</div>
        <div class="selected-apps">
          <selectedItem v-for="item in selectedApps" :name="item.scenarioName" :id="item.id" @onDelete="handleDelete"
            :key="item.id"></selectedItem>
        </div>
        </Col>
      </Row>
      <div class="add-app-footer">
        <div class="footer-pagination">
          <Page :page-size="page.pageSize" :total="total" :current-page="page.pageNum" :page-sizes="[45, 60, 90]"
            layout="total, prev, pager, next, sizes, jumper" @current-change="onCurrentChange"
            @size-change="onSizeChange" transfer />
        </div>
        <div class="footer-btns">
          <Button @click="onClose">{{ $t('aiToolBar.cancel') }}</Button>
          <Button type="primary" @click="onConfirm">{{
            $t('aiToolBar.confirm')
          }}</Button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapState } from 'vuex'
import selectedItem from './component/selectedItem'
import { queryScenarioList, saveToolbarScenarioConfig, queryGroupList } from '../api'
import { triggerType } from '../utils/data'
import { storage } from '../api/store'

export default {
  name: 'addAppModal',
  components: {
    selectedItem,
  },
  props: {
    visible: Boolean,
    data: [],
    type: '',
    stage: '',
  },
  data() {
    return {
      loading: false,
      oprationLoading: false,
      searchKeyWords: '',
      searchGroupId: '',
      groupOptions: [],
      recordKeyWords: '',
      checkedApps: [],
      appList: [],
      displayList: [],
      total: 0,
      page: {
        pageNum: 1,
        pageSize: 45,
      },
    }
  },
  methods: {
    onSelectChange() {
      this.$nextTick(() => {
        this.getAppList()
      })
    },
    handleSearch() {
      this.recordKeyWords = this.searchKeyWords
      this.$set(this, 'page', {
        pageNum: 1,
        pageSize: 45,
      })
    },
    handleDelete(id) {
      const checkedApps = new Set(this.checkedApps)
      checkedApps.delete(id)
      this.checkedApps = [...checkedApps]
    },
    onClose() {
      this.checkedApps = []
      this.oprationLoading = false
      this.$emit('onClose')
    },
    onCurrentChange(num) {
      this.$set(this.page, 'pageNum', num)
    },
    onSizeChange(size) {
      const currentPage = {
        pageNum: 1,
        pageSize: size,
      }
      this.page = currentPage
    },
    onConfirm() {
      this.oprationLoading = true
      const data = this.selectedApps.map((a) => {
        return {
          scenarioId: a.id,
          showCondition: this.$t('aiToolBar.addModal.condition'),
        }
      })
      this.saveScenarioConfig(data)
    },
    initData(v) {
      if (v && v.length > 0) {
        const formatedList = v.map((i) => {
          return i.scenarioId
        })
        this.checkedApps = formatedList
      }
    },
    getAppList() {
      this.loading = true
      queryScenarioList({
        orgId: this.enterpriseId,
        userId: this.userId,
        searchKey: this.searchKeyWords,
        groupId: this.searchGroupId,
        ...this.page,
      })
        .then((res) => {
          this.$set(this, 'appList', res.data.list)
          this.total = res.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    getAllAppList() {
      // init data for first time
      queryScenarioList({
        orgId: this.enterpriseId,
        userId: this.userId,
        pageNum: 1,
        pageSize: 9999,
      })
        .then((res) => {
          this.$set(this, 'displayList', res.data.list)
          this.initData(this.data)
        })
    },
    // 分组
    getGroupList() {
      queryGroupList({
        userId: this.userId,
        orgId: this.enterpriseId,
        pageNum: 1,
        pageSize: 100
      }).then((res) => {
        if (res.code === 1) {
          this.$set(this, 'groupOptions', res.data.list)
        } else {
          this.$Message.error(this.$t('GPT.group.gitGroupsFailed'));
        }
      }).catch(() => { this.$Message.error(this.$t('GPT.group.gitGroupsFailed')) })
    },
    saveScenarioConfig(data) {
      saveToolbarScenarioConfig({
        orgId: this.enterpriseId,
        userId: this.userId,
        stage: this.stage,
        triggerType: triggerType[this.type],
        toolbarScenarioList: data,
      })
        .then((res) => {
          if (res.code === 1) {
            this.$Message.success(this.$t('aiToolBar.addModal.saveSuccess'))
            storage.remove(
              `${this.enterpriseId}${this.userId}${triggerType[this.type]}${this.stage
              }`
            )
          }
          this.$emit('onConfirm')
          this.onClose()
        })
        .catch(() => {
          this.oprationLoading = false
          this.$Message.error(this.$t('aiToolBar.addModal.saveFailed'))
        })
    },
  },
  watch: {
    page: {
      handler() {
        this.getAppList()
      },
      immediate: true,
      deep: true,
    },
  },
  computed: {
    ...mapState(['enterpriseId', 'userId']),
    selectedApps() {
      const list = []
      this.checkedApps.forEach((a) => {
        const item = this.displayList.find((i) => i.id === a)
        if (item) {
          list.push(item)
          return
        }
      })
      return list
    },
  },
  mounted() {
    this.getAllAppList()
    this.getGroupList()
  },
}
</script>

<style lang="less" scoped>
.add-app-content {
  margin-bottom: 16px;

  .el-row {
    height: 500px;
    border-top: 1px rgba(228, 231, 237, 1) solid;
    border-bottom: 1px rgba(228, 231, 237, 1) solid;
  }

  .left-section,
  .right-section {
    height: 100%;
  }

  .left-section {
    padding-top: 12px;
    border-right: 1px rgba(228, 231, 237, 1) solid;
    overflow-y: auto;

    .search-title {
      .search-input {
        width: 200px;

        .mail-search {
          vertical-align: bottom;
        }
      }

      .search-select-group {
        margin-left: 20px;
      }
    }

    .no-app-list {
      padding-top: 120px;

      img {
        display: block;
        margin: 0 auto;
      }

      p {
        margin-top: 40px;
        font-size: 12px;
        text-align: center;
        color: rgba(153, 153, 153, 1);
      }
    }

    .app-list {
      margin-top: 12px;

      .check-box-item {
        width: 180px;
        color: #303133;

        /deep/ .el-checkbox__input {
          vertical-align: middle;
        }

        /deep/ .el-checkbox__label {
          font-size: 14px;
          vertical-align: middle;
          overflow-x: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          width: 100%;
          height: 20px;
        }
      }
    }
  }

  .right-section {
    padding: 16px 12px;

    .selected-apps {
      margin-top: 10px;
      height: calc(100% - 20px);
      overflow-y: auto;
    }
  }
}

.add-app-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  align-items: center;
}
</style>
