<template>
  <transition name="chatSettingArea">
    <div
      class="chatSettingArea"
      :style="settingPos"
      v-if="visible"
      key="chat-setting-area"
    >
      <div
        class="setting-mask"
        @touchmove.stop.prevent
        @click="onClickClose"
      ></div>
      <div class="setting-content">
        <chatSet :chatSettings="config"></chatSet>
        <i class="close-btn el-icon-close" @click="onClickClose"></i>
      </div>
    </div>
  </transition>
</template>

<script>
import chatSet from './aiComponent/chatSet.vue'
import { getChatSet } from '../api/aiApi'
import store from '../../../store'

export default {
  name: 'chatSettingArea',
  components: {
    chatSet,
  },
  data() {
    return {
      config: {},
    }
  },
  methods: {
    onClickClose() {
      this.$emit('update:visible', false)
    },

    queryChatConfig() {
      const { enterpriseId: orgId, userId } = store.state
      getChatSet({
        orgId,
        userId,
        scenarioConfigId: this.scenarioConfigId,
      }).then((res) => {
        if (res.code === 1) {
          this.$set(this, 'config', res.data)
        }
      })
    },
  },
  props: {
    visible: false,
    refPosition: {},
    scenarioConfigId: '',
    settingPos: '',
  },
  watch: {
    visible(v) {
      if (v && this.scenarioConfigId) {
        this.queryChatConfig()
      }
    },
    scenarioConfigId(v) {
      if (v) {
        this.queryChatConfig()
      }
    },
  },
}
</script>

<style lang="less" scoped>
.chatSettingArea {
  position: absolute;

  width: 420px;
  height: 520px;

  background: rgba(255, 255, 255, 1);
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .setting-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
  }
  .setting-content {
    position: absolute;
    height: 100%;
    padding: 0 20px;
    overflow-y: scroll;
    z-index: 10;
    .el-icon-close {
      position: absolute;
      top: 20px;
      right: 20px;
      cursor: pointer;
      font-size: 18px;
    }
  }
}
/*过渡效果*/
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.chatSettingArea-enter-active {
  animation: fadeIn 0.2s;
}
.chatSettingArea-leave-active {
  transition: opacity 0.1s linear;
  opacity: 0;
}
</style>
