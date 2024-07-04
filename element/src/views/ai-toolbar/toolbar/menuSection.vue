<template>
  <div class="menuSection">
    <div
      :class="`aiChatArea ${isShowOutput ? 'withOutput' : ''}`"
      ref="aiChatArea"
    >
      <div class="ai-input-area">
        <Input
          class="ai-chat-input"
          v-model="searchKeyWords"
          type="textarea"
          :autosize="{ maxRows: 10 }"
          resize="none"
          @keydown.enter.native="onTriggerChat"
          @focus="isInputFocus = true"
          @blur="onBlur"
          :placeholder="$t('aiToolBar.chat.placeholder')"
          ref="aiChatInput"
        >
        </Input>
        <stopButton v-if="isGenerating" @onClickStop="stopGenerating" />
        <div class="btn-areas" v-else>
          <i
            :class="`icon-btn el-icon-error ${
              isInputFocus && !!searchKeyWords ? 'visible' : ''
            }`"
            @click="onClearInput"
          ></i>
          <i
            class="icon-btn custom custom-setting-2"
            @click="onClickSetting"
          ></i>
          <Divider direction="vertical"></Divider>
          <sendButton
            @onClick="onTriggerChat"
            :disabled="btnDisable"
          ></sendButton>
        </div>
      </div>
      <chatSettingArea
        :visible.sync="settingVisible"
        :scenarioConfigId="chatInfo.scenarioConfigId"
        :settingPos="settingPos"
      ></chatSettingArea>
      <messageBox
        v-show="isShowOutput"
        :isGenerating="isGenerating"
        :isFinished="isFinished"
        :operationId="chatInfo.operationId"
        :chatListId="chatInfo.chatListId"
        :isUseGraph="chatInfo.isUseGraph"
        @onFinish="onFinish"
        @onOpenRef="onOpenRef"
      ></messageBox>

      <chatFooter
        v-if="isFinished"
        :type="type"
        :isGenerating="isGenerating"
        :isFinished="isFinished"
        @onConfirm="onConfirm"
        @onCover="onCover"
        @onInsert="onInsert"
        @onRetry="onRetry"
        @onCopy="onCopy"
        @onAbort="onAbort"
      ></chatFooter>
    </div>
    <selectDropDown
      v-if="!searchKeyWords && !isShowOutput"
      @onClickApp="onClickApp"
      :type="type"
    ></selectDropDown>
  </div>
</template>

<script>
import { addChat, removeChat, triggerChat } from '../api/index'
import { copyTextToClipboard, getReferencePosition } from '../utils/tools'
import store from '../../../store'
import sendButton from './component/sendButton.vue'
import selectDropDown from './selectDropDown.vue'
import messageBox from './messageBox.vue'
import chatFooter from './component/chatFooter.vue'
import chatSettingArea from './chatSettingArea.vue'
import stopButton from './component/stopButton'

export default {
  name: 'menuSection',
  components: {
    sendButton,
    selectDropDown,
    messageBox,
    chatFooter,
    chatSettingArea,
    stopButton,
  },
  props: {
    type: '',
    value: '',

    isAbove: '',
  },
  data() {
    return {
      loading: false,
      searchKeyWords: '',
      isInputFocus: false,
      chatInfo: {},

      // web socket config
      isShowOutput: false,
      isGenerating: false,
      isFinished: false,
      fullText: '',

      // settings
      settingVisible: false,
      isSettingsLeft: false,
    }
  },
  methods: {
    onClearInput() {
      this.$refs.aiChatInput.clear()
    },
    onBlur() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.isInputFocus = false
        }, 0)
      })
    },
    onClickSetting() {
      this.$emit('onOpenRef')
      this.settingVisible = !this.settingVisible
    },

    onClickApp(item) {
      this.$emit('onClickApp', item)
    },

    generateAiChat() {
      this.loading = true
      const { enterpriseId: orgId, userId } = store.state

      addChat({ orgId, userId })
        .then((res) => {
          if (res) {
            this.$set(this, 'chatInfo', res.data)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },

    deleteAiChat() {
      const { enterpriseId: orgId, userId } = store.state
      const { scenarioConfigId, chatListId } = this.chatInfo
      removeChat({ orgId, userId, chatListId, scenarioConfigId })
    },

    onTriggerChat(e) {
      if (!this.searchKeyWords || this.isGenerating) return
      if (e) e.preventDefault()
      const { enterpriseId: orgId, userId } = store.state
      const { chatListId, scenarioConfigId } = this.chatInfo
      this.$emit('onOpenRef')
      const chatInput = `${this.searchKeyWords}${this.value ? `"${this.value}"` : ''}`
      this.isShowOutput = true
      triggerChat({
        orgId,
        userId,
        chatListId,
        scenarioConfigId,
        chatInput,
      }).then((res) => {
        if (res && res.code === 1) {
          this.$emit('onSendChat')
          this.resetChat()
        } else {
          this.isGenerating = false
          this.isFished = true
          this.$emit('onSendChatFailed')
        }
      })
    },

    // web socket
    resetChat() {
      this.isGenerating = true
      this.isFinished = false
      this.fullText = ''
    },
    onConfirm() {
      this.$emit('onConfirm', this.fullText)
    },
    onCover() {
      this.$emit('onCover', this.fullText)
    },
    onInsert() {
      this.$emit('onInsert', this.fullText)
    },
    onRetry() {
      this.onTriggerChat()
    },
    onCopy() {
      copyTextToClipboard(this.fullText)
    },
    onAbort() {
      this.$aiToolBar.destroy()
      this.$emit('onAbort')
    },
    onFinish(text) {
      this.isGenerating = false
      this.isFinished = true
      this.fullText = text
    },
    onOpenRef(v) {
      this.$emit('onOpenRef', v)
    },

    stopGenerating() {
      this.isGenerating = false
      this.isFinished = true
    },
  },
  computed: {
    settingPos() {
      if (this.settingVisible) {
        return getReferencePosition(this.$refs.aiChatArea, this.isAbove)
      }
    },
    btnDisable() {
      return this.loading || !this.searchKeyWords || this.isGenerating
    },
  },
  watch: {
    settingVisible(v) {
      this.$nextTick(() => {
        if (v) {
          const pos = this.settingPos
          this.isSettingsLeft = Boolean(pos.left)
          this.$emit('onOpenRefPos', {
            isLeft: Boolean(pos.left),
            isShort: !this.isShowOutput,
          })
        } else {
          this.$emit('onOpenRefPos', {
            isLeft: this.isSettingsLeft,
            isShort: !this.isShowOutput,
          })
        }
      })
    },
  },
  mounted() {
    // genrate ai chat
    this.generateAiChat()
    if (this.type === 'inputBoxSlash') {
      this.$refs.aiChatInput.focus()
    }
  },
  beforeDestroy() {
    this.deleteAiChat()
  },
}
</script>

<style lang="less">
.menuSection {
  .aiChatArea {
    background-color: #fff;
    &.withOutput {
      width: 800px;
      padding: 16px;
      border: 1px solid rgba(227, 231, 237, 1);
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      max-height: 520px;
    }
  }
  .ai-input-area {
    position: relative;
    width: 480px;
    .ai-chat-input {
      width: 100%;
      .el-textarea__inner {
        border-color: #ff752a;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        padding: 8px 124px 8px 15px;
        line-height: 26px;
        &:focus,
        &:hover {
          border-color: #ff752a;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        }
      }
      .el-input__suffix {
        right: 10px;
        top: 4px;
      }
    }
    .stopButton {
      right: 12px;
    }
    .btn-areas {
      position: absolute;
      bottom: 8px;
      right: 12px;
      .el-divider--vertical {
        margin: 0 12px;
      }
      .icon-btn {
        font-size: 16px;
        color: rgba(144, 144, 144, 1);
        vertical-align: middle;
        cursor: pointer;
        &.el-icon-error {
          visibility: hidden;
          margin-right: 12px;
          &.visible {
            visibility: visible;
          }
          &:hover {
            color: rgba(121, 127, 140, 1);
          }
        }
        &.custom-setting-2 {
          &:hover {
            color: rgba(66, 133, 242, 1);
          }
        }
      }
    }

    // &:hover {
    //   .btn-areas {
    //     .icon-btn {
    //       &.el-icon-error {
    //         visibility: visible;
    //       }
    //     }
    //   }
    // }
  }
}
</style>
