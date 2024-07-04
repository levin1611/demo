<template>
  <Table :data="tableData" :row-key="id" :show-header="false" ref="sortTable" class="sortTable"
    header-cell-class-name="sort-table-header"
    :row-class-name="`sort-table-row ${isFromScenario ? 'move-row-cursor' : ''}`" cell-class-name="sort-table-cell">
    <TableColumn :class-name="`drag-drop-column ${isFromGroup ? 'hide-right' : ''}`" :width="isFromGroup ? 40 : 35">
      <template slot-scope="props">
        <Icon custom="custom-yidong" :size="14" />
      </template>
    </TableColumn>
    <TableColumn v-if="isFromGroup" class-name="sort-column" prop="groupName">
    </TableColumn>
    <TableColumn v-if="isFromScenario" class-name="sort-column" prop="scenarioName">
    </TableColumn>
    <TableColumn v-if="isFromScenario" class-name="sort-column" prop="showCondition">
    </TableColumn>
    <TableColumn v-if="isFromScenario && canOperate" :label="$t('aiToolBar.settings.opration')">
      <template slot-scope="props">
        <a class="opration-btn" @click="handleDelete(props.row.id)">{{
          $t('aiToolBar.settings.delete')
        }}</a>
      </template>
    </TableColumn>
  </Table>
</template>

<script>
import { mapState } from 'vuex'
import Sortable from 'sortablejs';
import { sortGroupInToolbar, sortScenarioInToolbar } from '../../api/index'
import { triggerType } from '../../utils/data'
import { storage } from '../../api/store'

export default {
  name: 'sortTable',
  emits: ['refreshData'],
  props: {
    from: '',
    tableData: [],
    canOperate: true,

    type: '',
    stage: '',
  },
  computed: {
    ...mapState(['enterpriseId', 'userId']),
    isFromGroup() {
      return this.from === 'group'
    },
    isFromScenario() {
      return this.from === 'scenario'
    },
  },
  data() {
    return {
      // sort
      sortInstance: null,
      scrollPosition: 0,
    }
  },

  methods: {
    handleDelete(id) {
      this.$emit('onDelete', id)
    },

    sortSuccess() {
      this.$Message.success(this.$t('aiToolBar.group.sortSuccess'))
      storage.remove(
        `${this.enterpriseId}${this.userId}${triggerType[this.type]}${this.stage}`
      )
    },

    sortItems(item, prevOrderId, nextOrderId) {
      const {
        // for sort group
        groupId,
        // for sort scenario
        id, scenarioId, stage
      } = item
      let requestFunc = null
      const params = {
        orgId: this.enterpriseId,
        userId: this.userId,
        triggerType: triggerType[this.type],
        prevOrderId,
        nextOrderId,
      }
      if (this.isFromGroup) {
        requestFunc = sortGroupInToolbar({
          ...params,
          groupId,
        })
        this.scrollPosition = document.querySelector('.sort-group-content').scrollTop
      }
      if (this.isFromScenario) {
        requestFunc = sortScenarioInToolbar({
          ...params,
          id,
          scenarioId,
          stage,
        })
      }

      if (requestFunc) {
        requestFunc.then((res) => {
          if (res.code === 1) {
            this.sortSuccess()
          } else {
            this.$Message.error(this.$t('aiToolBar.group.sortFailed'))
          }
        }).catch(() => { }).finally(() => {
          this.$emit('refreshData')
        });
      }
    },

    onSort(e) {
      const { newIndex, oldIndex } = e;

      if (oldIndex === newIndex) {
        return;
      }

      const sortId = this.isFromGroup ? 'orderIdInTriggerType' : 'orderId';

      const currentItem = this.tableData[oldIndex];
      let nextItem = this.tableData[newIndex] || {};
      if (newIndex === 0) {
        this.sortItems(currentItem, 0, nextItem[sortId])
        return
      }
      if (newIndex === this.tableData.length - 1) {
        this.sortItems(currentItem, nextItem[sortId], null)
        return
      }

      let previousItem = this.tableData[newIndex - 1]
      if (oldIndex < newIndex) {
        previousItem = this.tableData[newIndex]
        nextItem = this.tableData[newIndex + 1];
      }
      this.sortItems(currentItem, previousItem[sortId], nextItem[sortId] || null)
    },
    initSort() {
      if (this.sortInstance) {
        this.sortInstance.destroy();
      }

      const handle = this.isFromScenario ? '.sort-table-row' : '.custom-yidong';

      const _this = this;
      this.sortInstance = Sortable.create(this.$refs.sortTable.$el.querySelector('.el-table__body > tbody'), {
        handle,
        filter: ".opration-btn",
        animation: 120,
        forceFallback: true,
        chosenClass: 'drag-item',
        onEnd: _this.onSort,
      });
    },
  },
  watch: {
    tableData: {
      handler(val) {
        if (val && val.length > 0) {
          this.$nextTick(() => {
            this.initSort()
            if (this.scrollPosition) {
              setTimeout(() => {
                document.querySelector('.sort-group-content').scrollTop = this.scrollPosition
              }, 0);
            }
          })
        }
      },
      immediate: true,
      deep: true
    },
  },
  beforeDestroy() {
    this.sortInstance.destroy();
  },
  mounted() {
    this.initSort();
  }
}
</script>

<style lang="less" scoped>
.sortTable {
  .drag-drop-column {
    .custom-yidong {
      color: #909299;
      vertical-align: text-bottom;
      cursor: move;

      &:hover {
        color: #4285F2;
      }
    }
  }

  .opration-btn {

    &:hover,
    &:active {
      color: #4285f2;
    }
  }
}
</style>

<style lang="less">
.sortTable {
  .sort-table-row {
    &:last-child {
      .sort-table-cell {
        border-bottom: none;
      }
    }

    &.move-row-cursor {
      cursor: move;
    }
  }

  .sort-table-cell {
    &.drag-drop-column {
      padding-left: 10px;
    }

    &.hide-right {
      padding-right: 5px;
    }

    .cell {
      font-size: 14px;
      font-weight: 400;
      color: #000000CC;
    }
  }
}

.drag-item {
  .drag-drop-column {
    .cell {
      width: auto;
    }
  }

  .cell {
    width: 358px;
  }

  &:hover {
    cursor: move;
  }
}
</style>