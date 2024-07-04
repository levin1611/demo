<template>
  <div class="main-page">
    <div class="ai-setting-header">
      <h3>{{ $t('aiToolBar.aiToolBar') }}</h3>
      <span>{{ $t('aiToolBar.aiToolBarTip') }}</span>
    </div>
    <div>
      <vxe-table stripe :data="tableData" class="main-page-table">
        <vxe-column field="title" :title="$t('aiToolBar.settings.timing')" width="300"></vxe-column>
        <vxe-column :title="$t('aiToolBar.settings.status')" width="400">
          <template #default="{ row }">
            <el-switch class="status-switch" v-model="aiToolBar[row.type]" @change="(v) => handleChange(row.type, v)" />
          </template>
        </vxe-column>
        <vxe-column field="age" :title="$t('aiToolBar.settings.setting')">
          <template #default="{ row }">
            <a class="opration-btn" @click="handleClickInput(row.type)">{{
              $t('aiToolBar.settings.input')
              }}</a>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
  </div>
</template>

<script>
import { queryToolbarTriggerConfig, setToolbarTriggerConfig } from '../api'
import { mapState } from 'vuex'

export default {
  name: 'mainPage',
  methods: {
    handleClickInput(type) {
      this.$emit('clickInputSettings', type)
    },
    handleClickOutput(type) {
      this.$emit('clickOutputSettings', type)
    },
    handleChange(type, v) {
      const result = {
        ...this.aiToolBar,
        [type]: v,
      }
      this.$store.dispatch('updateToolbarTriggerConfig', result)
      this.setStatus(result)
    },
    getList() {
      queryToolbarTriggerConfig({
        orgId: this.enterpriseId,
        userId: this.userId,
      }).then((res) => {
        const { data } = res
        const { inputBoxSelect, inputBoxSlash, pageSelect } = data
        this.tableState = {
          inputBoxSelect,
          inputBoxSlash,
          pageSelect,
        }
      })
    },
    setStatus(status) {
      setToolbarTriggerConfig({
        orgId: this.enterpriseId,
        userId: this.userId,
        ...status,
      }).then((res) => {
        if (res.code === 1)
          this.$Message.success(this.$t('aiToolBar.settings.updateSuccess'))
      })
    },
  },
  data() {
    return {
      tableState: {
        inputBoxSlash: false,
        inputBoxSelect: false,
        pageSelect: false,
      },
      tableData: [
        {
          type: 'inputBoxSlash',
          title: this.$t('aiToolBar.triggerType.inputSlash'),
          text: this.$t('aiToolBar.triggerType.inputSlashText'),
        },
        {
          type: 'inputBoxSelect',
          title: this.$t('aiToolBar.triggerType.inputSelect'),
          text: this.$t('aiToolBar.triggerType.inputSelectText'),
        },
        {
          type: 'pageSelect',
          title: this.$t('aiToolBar.triggerType.pageSelect'),
          text: this.$t('aiToolBar.triggerType.pageSelectText'),
        },
      ],
    }
  },
  computed: {
    ...mapState(['enterpriseId', 'userId', 'aiToolBar']),
  },
}
</script>

<style lang="less" scoped>
.main-page {
  .ai-setting-header {
    padding: 18px 20px;
    color: #303133;

    h3 {
      display: inline-block;
      margin-right: 10px;
    }

    span {
      font-size: 12px;
      color: #999;
    }
  }

  .status-switch {
    margin-right: 16px;
  }

  .btn-setting {
    display: inline-block;
    margin-left: 20px;
  }

  /deep/ .main-page-table {
    .opration-btn {

      &:hover,
      &:active {
        color: #4285f2;
      }
    }

    .vxe-table--header,
    .vxe-table--body-wrapper {
      color: #303133;
    }
  }
}
</style>
