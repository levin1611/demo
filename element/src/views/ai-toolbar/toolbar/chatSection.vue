<template>
  <transition name="chatSection" appear>
    <div class="chatSection" v-loading="loading">
      <div class="mainContent" v-if="!loading">
        <div class="chatSection-header">
          <div class="header-title">{{ scenario.scenarioName }}</div>
          <stopButton @onClickStop="stopGenerating" v-if="isGenerating && type !== 'inputBoxSlash'" />
        </div>
        <chatForm v-if="type === 'inputBoxSlash'" :promptTask="promptTask" :promptRequirement="promptRequirement"
          :isGenerating="isGenerating" @onSend="onSend" @onClickStop="stopGenerating"></chatForm>

        <messageBox v-show="isShowOutput" :isGenerating="isGenerating" :isFinished="isFinished"
          :operationId="data.operationId" :chatOperationId="historyOperationId" :chatListId="data.chatListId"
          :isUseGraph="data.isUseGraph" @onFinish="onFinish" @onOpenRef="onOpenRef"></messageBox>

        <chatFooter v-if="isFinished" :type="type" :isGenerating="isGenerating" :isFinished="isFinished"
          @onConfirm="onConfirm" @onCover="onCover" @onInsert="onInsert" @onRetry="onRetry" @onCopy="onCopy"
          @onAbort="onAbort"></chatFooter>
      </div>
    </div>
  </transition>
</template>

<script>
import { addNewGenerateScenario, generateNewContent } from '../api'
import chatForm from './chatForm'
import messageBox from './messageBox'
import chatFooter from './component/chatFooter.vue'
import stopButton from './component/stopButton'
import store from '../../../store'
import { copyTextToClipboard } from '../utils/tools'

export default {
  name: 'chatSection',
  components: {
    chatForm,
    messageBox,
    chatFooter,
    stopButton,
  },
  data() {
    return {
      loading: false,
      data: {},
      promptTask: [],
      promptRequirement: [],
      isShowOutput: false,
      historyOperationId: 0,

      // web socket config
      requestData: {},
      isGenerating: false,
      isFinished: false,
      fullText: '',
    }
  },
  props: {
    type: '',
    value: '',
    scenario: {},
  },
  methods: {
    genegrateScenario() {
      this.loading = true
      const { enterpriseId: orgId, userId } = store.state
      addNewGenerateScenario({
        orgId,
        scenarioId: this.scenario.scenarioId,
        userId,
      })
        .then((res) => {
          if (res && res.code === 1) {
            this.data = res.data
            this.promptTask = res.data.promptVariables?.promptTask
            this.promptRequirement = res.data.promptVariables?.promptRequirement

            // auto generate content
            if (this.type !== 'inputBoxSlash') {

              let obj = {
                promptRequirement: [
                  {
                    name: res.data.promptVariables?.promptRequirement[
                      res.data.promptVariables?.promptRequirement.length - 1
                    ].varName,
                    value: this.value,
                  },
                ],
                promptTask: [],
              }

              if (this.scenario.extraValue) {
                if (this.scenario.extraValue.promptRequirement) {
                  obj.promptRequirement.push(this.scenario.extraValue.promptRequirement[0])
                } else {
                  obj.promptTask.push(this.scenario.extraValue.promptTask[0])
                }
              }
              this.onSend(obj)
            }
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    resetChat() {
      this.isGenerating = true
      this.isFinished = false
      this.fullText = ''
    },
    generateNew(data) {
      this.isShowOutput = true
      generateNewContent(data).then((res) => {
        if (res && res.code === 1) {
          this.historyOperationId = res.data.historyOperationId
          this.$emit('onSendChat')
          this.resetChat()
        } else {
          this.isGenerating = false
          this.isFished = true
          this.$emit('onSendChatFailed')
        }
      })
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
      this.onSend(this.requestData)
    },
    onCopy() {
      copyTextToClipboard(this.fullText)
    },
    onAbort() {
      this.$aiToolBar.destroy()
      this.$emit('onAbort')
    },
    onSend(obj) {
      const { enterpriseId: orgId, userId } = store.state
      const { chatListId, scenarioConfigId, promptVersion } = this.data
      const param = {
        orgId,
        userId,
        chatListId,
        scenarioConfigId,
        promptVersion,
        inputDetail: obj,
        isUseAdditionalTask: obj.additionalTask ? 1 : 0,
      }
      this.requestData = obj
      this.$emit('onOpenRef')
      this.generateNew(param)
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
  mounted() {
    this.genegrateScenario()
  },
}
</script>

<style lang="less" scoped>
.chatSection {
  width: 800px;
  min-height: 60px;
  padding: 16px;
  background-color: #fff;
  border: 1px solid rgba(227, 231, 237, 1);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 10px;

  .mainContent {
    display: flex;
    flex-direction: column;
    max-height: 520px;
    transition: height 0.2s linear;

    .chatSection-header {
      .header-title {
        font-weight: 700;
        color: #303133;
      }

      /* stop button for page select */
      .stopButton {
        top: 42px;
        right: 16px;
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.chatSection-enter-active {
  animation: fadeIn 0.2s;
}
</style>
