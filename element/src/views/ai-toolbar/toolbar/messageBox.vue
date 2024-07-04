<template>
  <div class="messageBox" ref="messageBox" @scroll.capture="handleScroll">
    <div v-if="isAnalyzing" class="content-text">
      {{ $t('aiToolBar.stage.analyzeProblem') }}
    </div>
    <div v-if="stage === 'failTOEnd'" class="content-text">
      {{ $t('aiToolBar.stage.failTOEnd') }}
    </div>
    <div v-if="outputText && outputText.length > 0" class="output-text content-text"
      :style="isSticky ? { marginBottom: `${infoHeight}px` } : null">
      {{ outputText }}
    </div>

    <transition name="extraInfo">
      <div v-show="isShowExtraInfo" :class="{ 'extra-info': true, 'sticky-info': isSticky && isBottomShow }"
        ref="extraInfo">
        <!-- key words -->
        <div class="key-words" v-if="isFinished && keywords && keywords.length > 0">
          {{ $t('aiToolBar.messageBox.keywords') }}
          <keywordsArea :keywordList="keywords" />
        </div>

        <!-- reference -->
        <div class="reference-info" v-if="isFinished && referenceTotal > 0">
          {{ $t('aiToolBar.messageBox.ref') }}
          <div class="expand-reference-btn" @click="onExpand">
            {{
              isShowRefChild()
                ? $t('aiToolBar.messageBox.retractRef')
                : $t('aiToolBar.messageBox.expandRef')
            }}
            <i class="el-icon-arrow-right"></i>
          </div>
        </div>

        <!-- feed back section -->
        <div v-if="isFinished" class="feed-back">
          <div class="aiTip">{{ $t('aiToolBar.messageBox.tip') }}</div>
          <feedBackButtons :feedBack="feedBack" @onFeedback="onUpdateFeedback"></feedBackButtons>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import websocketData from '../api/webSocketData'
import { updateFeedback, queryChunks, queryKeywords } from '../api'
import store from '../../../store'
import feedBackButtons from './component/feedBackButtons.vue'
import keywordsArea from './keywordsArea.vue'

export default {
  name: 'messageBox',
  components: {
    feedBackButtons,
    keywordsArea,
  },
  data() {
    return {
      anaArry: [
        'queryKB',
        'analyzeProblem',
        'queryKG',
        'referenceReady',
        'polishAnswers',
        'generateAnswers',
        'queryInternet',
      ],

      // web socket config
      stage: '',
      outputText: '',
      currentOperationId: '',

      //reference
      keywords: [],
      referenceChunks: [],
      referenceTotal: 0,

      // feedBack
      feedBack: 0,

      // scroll event
      infoHeight: 0,
      isSticky: false,
      isBottomShow: true,
      scrollTimeout: null,
    }
  },
  props: {
    isGenerating: true,
    operationId: '',
    chatOperationId: 0,
    chatListId: '',
    isUseGraph: 0,

    isFinished: false,
  },
  inject: ['isShowRefChild'],
  methods: {
    // maybe from props ?
    resetChat() {
      this.stage = ''
      this.currentOperationId = ''
      this.infoHeight = 0
      this.isBottomShow = true
    },
    scrollBottom() {
      const box = this.$refs.messageBox
      box.scrollTop = box.scrollHeight
    },
    onExpand() {
      this.$emit('onOpenRef', this.referenceChunks)
    },

    onQueryChunks() {
      const { enterpriseId: orgId, userId } = store.state
      queryChunks({
        orgId,
        userId,
        chatListId: this.chatListId,
        scenarioType: 1,
        pageNum: 1,
        pageSize: 100,
      }).then((res) => {
        if (res && res.code === 1) {
          this.referenceChunks = res.data.list
          this.referenceTotal = res.data.total
        }
      })
    },
    onQueryKeywords() {
      const { enterpriseId: orgId, userId } = store.state
      queryKeywords({
        orgId,
        userId,
        chatListId: this.chatListId,
        scenarioType: 1,
      }).then((res) => {
        if (res && res.code === 1) {
          this.keywords = res.data
        }
      })
    },

    onUpdateFeedback(params) {
      const { enterpriseId: orgId, userId } = store.state
      updateFeedback({
        orgId,
        userId,
        operationId: this.operationId || this.currentOperationId,
        ...params,
      }).then((res) => {
        if (res?.code === 1) {
          this.feedBack = params.feedbackType
        }
      })
    },

    // web socket function
    handleMessage(data) {
      // when user stop genrating finish receving message
      if (this.isFinished) {
        this.stage = 'finish'
        this.$emit('onFinish', this.outputText)
        return
      }

      const { historyOperationId, stage } = data
      if (historyOperationId && stage) {
        if (!this.currentOperationId && this.anaArry.includes(stage)) {
          // first message
          this.currentOperationId = data.historyOperationId
          this.stage = data.stage
          this.outputText = ''
        } else if (
          this.currentOperationId &&
          this.currentOperationId === historyOperationId
        ) {
          // other message
          switch (data.stage) {
            // 查询中
            case 'queryKB':
              this.stage = data.stage
              this.outputText = ''
              break
            case 'streamAnswers':
              // 答案生成中
              if (this.stage !== 'streamAnswers') {
                this.stage = data.stage
              }
              this.outputText += data.output
              break
            case 'finish':
            case 'failTOEnd':
              this.stage = data.stage
              this.$emit('onFinish', data.output)
              break
            default:
              this.stage = data.stage
              this.outputText = ''
              break
          }
        }
      }
      this.scrollBottom()
    },

    handleScroll(e) {
      clearTimeout(this.scrollTimeout)
      this.scrollTimeout = setTimeout(() => {
        this.isBottomShow = true
      }, 250)

      const { scrollTopMax, scrollTop } = e.target
      const offSet = scrollTopMax - scrollTop
      if (this.infoHeight && offSet > this.infoHeight) {
        this.isSticky = true
        this.isBottomShow = false
      } else {
        this.isSticky = false
        this.isBottomShow = true
      }
    },
  },
  watch: {
    isGenerating(v) {
      if (v) this.resetChat()
    },
    isFinished(v) {
      if (v) {
        const _this = this
        setTimeout(() => {
          _this.scrollBottom()
        }, 100)
      }
    },
    chatOperationId(v) {
      if (v) {
        this.currentOperationId = v
      }
    },

    // reference query
    stage(v) {
      if (v === 'referenceReady') {
        this.onQueryChunks()
        if (this.isUseGraph) this.onQueryKeywords()
      }
    },
  },
  computed: {
    isAnalyzing() {
      return this.anaArry.includes(this.stage)
    },
    isShowExtraInfo() {
      const val = this.isFinished && !this.isGenerating && this.isBottomShow
      if (val) {
        this.$nextTick(() => {
          const height = this.$refs.extraInfo.clientHeight
          if (this.infoHeight !== height) {
            this.infoHeight = height
          }
        })
      }
      return val
    },
  },
  mounted() {
    websocketData.onMessage((data) => {
      this.handleMessage(data)
    })
  },
}
</script>

<style lang="less">
.messageBox {
  flex: 1;
  border: 1px solid rgba(220, 222, 224, 1);
  border-radius: 10px;
  margin: 16px 0;
  padding: 8px 16px 8px 16px;
  overflow-y: scroll;
  white-space: pre-wrap;

  .content-text {
    font-size: 14px;
    color: #303133;
  }

  .output-text {
    font-size: 14px;
  }

  .extra-info {
    background: #fff;
    margin-top: 20px;

    &.sticky-info {
      position: sticky;
      bottom: -8px;
      padding: 8px 0;
    }

    .key-words,
    .reference-info {
      font-size: 14px;
      margin-left: -4px;
    }

    .key-words {
      margin-bottom: -2px;
    }

    .reference-info {
      .expand-reference-btn {
        display: inline-block;
        cursor: pointer;
        color: rgba(59, 120, 222, 1);
      }
    }

    .feed-back {
      display: flex;
      justify-content: space-between;
      color: rgb(144, 146, 153);
      font-size: 12px;

      .likeBtn,
      .dislikeBtn {
        font-size: 20px;
        cursor: pointer;

        &:hover {
          color: #ff752a;
        }

        &.active {
          color: #ff752a;
        }
      }

      .dislikeBtn {
        margin-left: 10px;
      }
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

.extraInfo-enter-active {
  animation: fadeIn 0.2s;
}
</style>
