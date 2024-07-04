<template>
  <div class="chatFooterWrapper">
    <Button v-if="type === 'inputBoxSlash'" class="mainBtn" type="primary" @click="onConfirm"
      :disabled="isGenerating">{{ $t('aiToolBar.confirm') }}</Button>
    <Button v-if="type === 'inputBoxSelect'" class="mainBtn cover-btn" type="primary" @click="onCover"
      :disabled="isGenerating">{{ $t('aiToolBar.chat.cover') }}</Button>
    <Button v-if="type === 'inputBoxSelect'" class="mainBtn insert-btn" type="primary" @click="onInsert"
      :disabled="isGenerating">{{ $t('aiToolBar.chat.insert') }}</Button>
    <Divider v-if="type !== 'pageSelect'" direction="vertical"></Divider>
    <div class="oprationArea">
      <Button class="retryBtn" @click="onRetry" type="text" icon="custom custom-icon_update icon-btn"
        :disabled="isGenerating">{{ $t('aiToolBar.chat.retry') }}</Button>
      <Button class="copyBtn" @click="onCopy" type="text" icon="custom custom-copy1 icon-btn"
        :disabled="isGenerating">{{ $t('aiToolBar.chat.copy') }}</Button>
      <Button class="abandonBtn" @click="onAbort" type="text" icon="custom custom-trash1 icon-btn"
        :disabled="isGenerating">{{ $t('aiToolBar.chat.abort') }}</Button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'chatFooter',
  props: {
    type: '',
    isGenerating: false,
    isFinished: false,
  },
  methods: {
    blurButton(e) {
      let target = e.target;
      if (target.nodeName == "SPAN") {
        target = e.target.parentNode;
      }
      target.blur();
    },

    onConfirm() {
      this.$emit('onConfirm')
    },
    onCover() {
      this.$emit('onCover')
    },
    onInsert() {
      this.$emit('onInsert')
    },
    onRetry(e) {
      this.blurButton(e)
      this.$emit('onRetry')
    },
    onCopy(e) {
      this.blurButton(e)
      this.$emit('onCopy')
    },
    onAbort(e) {
      this.blurButton(e)
      this.$emit('onAbort')
    },
  },
}
</script>

<style lang="less">
.chatFooterWrapper {

  .mainBtn,
  .oprationArea {
    display: inline-block;

    .retryBtn,
    .copyBtn,
    .abandonBtn {
      font-size: 14px !important;
      margin-right: 20px;
      margin-left: 0;

      .icon-btn {
        vertical-align: text-bottom !important;
        color: #606266;
        font-size: 18px;
      }

      &:hover {
        color: #4285f2;

        .icon-btn {
          color: #4285f2;
        }
      }

      &:active {
        color: #606266;
      }
    }
  }

  .mainBtn {
    padding-left: 15px;
    padding-right: 15px;
    background-color: #ff752a;
    border-color: #ff752a;
  }

  .el-divider--vertical {
    margin: 0 20px;
  }
}
</style>
