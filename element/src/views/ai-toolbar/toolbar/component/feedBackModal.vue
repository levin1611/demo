<template>
  <Modal
    :visible.sync="visible"
    :title="$t('aiToolBar.feedBack.title')"
    :append-to-body="true"
    :modal-append-to-body="false"
    :close-on-click-modal="false"
    width="680px"
    :destroy-on-close="true"
    @close="onCancel"
    class="feedBackModal"
  >
    <div class="feed-back-content">
      <Input
        v-model="dislikeReason"
        type="textarea"
        :placeholder="$t('aiToolBar.feedBack.placeholder')"
        maxlength="500"
        show-word-limit
        :rows="9"
        style="width: 100%"
      ></Input>

      <div class="quick-text-wrapper">
        <div
          v-for="item in quickTextArr"
          :key="item"
          @click="appendQuickText(item)"
          class="quick-text-item"
        >
          {{ item }}
        </div>
      </div>
    </div>

    <div slot="footer">
      <Button @click="onCancel">{{ $t('aiToolBar.cancel') }}</Button>
      <Button type="primary" @click="onSubmit">{{
        $t('aiToolBar.confirm')
      }}</Button>
    </div>
  </Modal>
</template>

<script>
export default {
  name: 'feedBackModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dislikeReason: '',

      quickTextArr: [
        this.$t('aiToolBar.feedBack.feedbackQuickText1'),
        this.$t('aiToolBar.feedBack.feedbackQuickText2'),
        this.$t('aiToolBar.feedBack.feedbackQuickText3'),
        this.$t('aiToolBar.feedBack.feedbackQuickText4'),
        this.$t('aiToolBar.feedBack.feedbackQuickText5'),
      ],
    }
  },
  methods: {
    appendQuickText(text) {
      this.dislikeReason = (this.dislikeReason + text).slice(0, 500)
    },
    resetForm() {
      this.dislikeReason = ''
    },

    onSubmit() {
      if (this.dislikeReason.length > 500) {
        this.$Message.error(this.$t('aiToolBar.feedBack.overLength'))
        return
      }
      this.$emit('onSubimt', this.dislikeReason)
    },
    onCancel() {
      this.$emit('onClose')
    },
  },
  watch: {
    visible() {
      this.resetForm()
    },
  },
}
</script>

<style lang="less">
.feedBackModal {
  z-index: 3400 !important;
  .feed-back-content {
    margin: 30px 0 20px;
    .quick-text-wrapper {
      margin-top: 10px;
      .quick-text-item {
        padding: 2px 8px;
        text-align: center;
        margin: 0 10px 10px 0;
        cursor: pointer;
        border-radius: 6px;
        display: inline-block;
        background: #f3f3f3;

        color: #333;
        font-size: 12px;
        line-height: 22px;
      }
    }
  }
}
.feedBackModal + .v-modal {
  z-index: 3399 !important;
}
</style>
