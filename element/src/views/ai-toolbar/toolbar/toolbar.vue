<template>
  <transition name="loading">
    <div class="ai-toolbar-wrap" v-if="visible" :key="`aiTool`">
      <div class="mask" @touchmove.stop.prevent @click="onClose"></div>
      <div class="main-content" ref="aiTool" :style="contentStyle">
        <component
          :is="current_compo"
          @onClickAi="handleClickAi"
          @onClickApp="handleClickApp"
          @onSendChat="handleSendMessage"
          @onSendFailed="isChatting = false"
          :type="type"
          :value="value"
          :scenario="scenario"
          :isAbove="isAbove"
          @onConfirm="onConfirm"
          @onCover="onCover"
          @onInsert="onInsert"
          @onAbort="onAbort"
          @onOpenRef="handleOpenRef"
          @onOpenRefPos="handleOpenRefPosition"
        />
        <referenceArea
          :visible="isShowReference"
          :refPosition="refPosition"
          :referenceChunks="referenceChunks"
          @onCloseReference="resetRef"
          @showFilePreview="showFilePreview"
        />
      </div>

      <Modal
        v-if="previewing"
        :visible.sync="previewing"
        :title="fileInfo.name"
        class="preview-modal"
      >
        <!-- 自定义关闭按钮 -->
        <i class="custom custom-modal-close" @click="closePreview" />
        <FilePreview :visible="visible" :fileInfo="fileInfo" />
      </Modal>
    </div>
  </transition>
</template>

<script>
import websocketData from '../api/webSocketData'
import menuSection from './menuSection.vue'
import chatSection from './chatSection.vue'
import referenceArea from './referenceArea.vue'
import commonFilePreview from '@/views/main-components/filePreview.vue'
import buttonSection from './buttonSection.vue'
import {
  getRePosition,
  getReferencePosition,
  getOpenRefPos,
} from '../utils/tools'
import store from '../../../store'

export default {
  name: 'toolbar',
  components: {
    menuSection,
    chatSection,
    referenceArea,
    FilePreview: commonFilePreview,
    buttonSection,
  },
  data() {
    return {
      value: '',
      type: '',
      visible: false,
      position: {},
      current_compo: 'menuSection',
      isChatting: false,

      scenario: '',

      // event
      onConfirm: undefined,
      onCover: undefined,
      onInsert: undefined,
      onAbort: undefined,

      // reference
      isShowReference: false,
      referenceChunks: [],
      previewing: false,
      fileInfo: {},
      isRefLeft: false,
    }
  },
  provide() {
    return {
      isShowRefChild: () => this.isShowReference,
      calcScenarioType: () => {
        return this.current_compo === 'menuSection' ? 2 : 1
      },
    }
  },
  methods: {
    onClose() {
      if (!this.isChatting) {
        this.$aiToolBar.destroy()
        if (this.onAbort) this.onAbort()
      }
    },
    handleSendMessage() {
      this.handleRePosition()
      this.isChatting = true
    },
    handleClickAi() {
      this.current_compo = 'menuSection'
      this.handleRePosition(true)
    },
    handleClickApp(v) {
      this.current_compo = 'chatSection'
      this.$set(this, 'scenario', v)
      this.handleRePosition()
    },
    handleRePosition(isShort = false) {
      const rePosition = getRePosition(this.position, isShort)
      const { top, bottom, left } = rePosition
      if (rePosition) {
        this.position.top = top
        this.position.bottom = bottom
        this.position.left = left
      }
    },
    handleOpenRefPosition(params) {
      const { isLeft, isShort } = params
      const pos = getOpenRefPos(this.position, isLeft, isShort)
      if (pos) {
        const { top, bottom, left } = pos
        this.position.top = top
        this.position.bottom = bottom
        this.position.left = left
      }
    },
    handleOpenRef(v) {
      if (!v) {
        this.resetRef()
      } else {
        this.isShowReference = !this.isShowReference
        this.$set(this, 'referenceChunks', v)
      }
    },
    resetForm() {
      this.current_compo = 'menuSection'
      this.value = ''
    },

    // ref
    resetRef() {
      this.isShowReference = false
      this.referenceChunks = []
    },
    showFilePreview(fileInfo) {
      this.$set(this, 'fileInfo', fileInfo)
      this.previewing = true
    },
    closePreview() {
      this.previewing = false
    },
  },
  props: {},
  computed: {
    contentStyle() {
      const { left, top, bottom } = this.position || {
        left: 0,
        top: 0,
        bottom: 0,
      }
      return {
        left: `${left}px`,
        top: top ? `${top}px` : 'auto',
        bottom: `${bottom}px`,
      }
    },
    refPosition() {
      if (this.isShowReference) {
        return getReferencePosition(
          this.$refs.aiTool,
          this.position.top === 'auto' || !Boolean(this.position.top)
        )
      }
    },
    isAbove() {
      return this.position.top === 'auto' || !Boolean(this.position.top)
    },
  },
  watch: {
    visible(v) {
      if (v) {
        this.isChatting = false
        const { enterpriseId, userId } = store.state
        websocketData.init(enterpriseId, userId)
      } else {
        this.resetForm()
        this.resetRef()
        websocketData.instance.socket.closeWs()
      }
    },
    isShowReference(v) {
      this.$nextTick(() => {
        if (v) {
          const pos = this.refPosition
          this.isRefLeft = Boolean(pos.left)
          this.handleOpenRefPosition({ isLeft: Boolean(pos.left) })
        } else {
          this.handleOpenRefPosition({ isLeft: this.isRefLeft })
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
.ai-toolbar-wrap {
  z-index: 3200;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  .main-content {
    height: auto;
    width: auto;
    position: absolute;
    transition: all 0.2s linear;
  }

  .preview-modal {
    width: 100vw;
    height: 100vh;

    /deep/ .el-dialog {
      width: 100%;
      height: 100%;
      margin: unset !important;
    }

    /deep/ .el-dialog__body {
      height: 100%;
      padding: unset !important;
    }

    /deep/ .el-dialog__header {
      display: none;
    }

    .custom-modal-close {
      position: absolute;
      font-size: 16px;
      right: 65px;
      top: 17px;
      color: #999;
      opacity: 0.8;
      cursor: pointer;
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
.loading-enter-active {
  animation: fadeIn 0.2s;
}
.loading-leave-active {
  transition: opacity 0.1s linear;
  opacity: 0;
}
</style>
