<template>
  <div :class="`selectDropDown ${loading ? 'loading' : ''} ${!loading && appList.length === 0 ? 'select-hidden' : ''}`"
    v-loading="loading">
    <div class="select-dropdown">
      <div v-for="item in appList" class="dropdown-section" :key="item.id">
        <div class="title-item">
          {{ item.groupId === -1 ? $t('aiToolBar.group.ungrouped') : item.groupName }}
        </div>
        <Poptip v-for="item in item.list" trigger="hover" width="200" class="select-dropdown-popper"
          popper-class="dropdown-popper" placement="right-start"
          :disabled="!hasSubMenu(item) || type === 'inputBoxSlash'" :visible-arrow="false">
          <subDropDown v-if="hasSubMenu(item)" @onClickSubDopDown="(v) => handelClickSubDopDown(v, item)"
            :selectScenario="getSelectScenario(item)" />
          <div slot="reference" class="dropdown-item" :key="item.id" @click="onClickItem(item)">
            {{ item.scenarioName }}
            <i v-if="hasSubMenu(item) && type !== 'inputBoxSlash'" class="custom custom-a-Property1arrow-rightProperty2linear" />
          </div>
        </Poptip>
        <div class="section-divider" />
      </div>
    </div>
  </div>
</template>

<script>
import { queryToolbarScenarioConfig } from '../api/index'
import store from '../../../store'
import { triggerType, stage } from '../utils/data'
import subDropDown from './component/subDropDown.vue'
import { selectScenario, selectScenarioList } from '../utils/data'

export default {
  name: 'selectDropDown',
  components: { subDropDown },
  props: {
    type: '',
  },
  data() {
    return {
      loading: false,
      appList: [],
    }
  },
  methods: {
    onClickItem(item) {
      if (!this.hasSubMenu(item) || this.type === 'inputBoxSlash') {
        this.$emit('onClickApp', item)
      }
    },
    handelClickSubDopDown(v, item) {
      const params = {
        ...item,
        extraValue: v,
      }
      this.$emit('onClickApp', params)
    },
    getSelectScenario(item) {
      const menu = selectScenario.find((s) => s.scenarioName === item.scenarioName)
      if (menu) {
        return menu
      }
    },
    hasSubMenu(item) {
      return selectScenarioList.includes(item.scenarioName)
    },
    getAppList() {
      this.loading = true
      const { enterpriseId, userId } = store.state
      queryToolbarScenarioConfig({
        orgId: enterpriseId,
        userId: userId,
        triggerType: triggerType[this.type],
        stage: stage.inputSetting,
      })
        .then((res) => {
          if (res) this.appList = res.data
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
  mounted() {
    this.getAppList()
  },
}
</script>

<style lang="less">
.selectDropDown {
  display: block;
  width: max-content;
  padding: 4px 0;
  background-color: #fff;
  border: 1px solid rgba(227, 231, 237, 1);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  max-height: 200px;
  overflow-y: auto;

  &.loading {
    min-height: 80px;
  }

  &.select-hidden {
    display: none;
  }

  .select-dropdown {
    width: 200px;

    .dropdown-section {
      &:last-child {
        .section-divider {
          display: none;
        }
      }
    }

    .title-item {
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 600;
      color: #FF752A;
    }

    .dropdown-item {
      padding: 5px 8px;
      font-size: 14px;
      color: #303133;
      cursor: pointer;

      .custom-a-Property1arrow-rightProperty2linear {
        float: right;
        margin-top: 6px;
        color: rgba(0, 0, 0, 0.3)
      }

      &:hover {
        background-color: rgba(245, 247, 250, 1);
      }
    }

    .section-divider {
      height: 1px;
      width: calc(100% - 10px);
      margin: 5px auto;
      background-color: #E3E7ED;
    }
  }
}
</style>
