<template>
  <div class="feedBackButtons">
    <Icon
      :class="`like-btn ${feedBack === 1 && 'active'}`"
      :custom="feedBack === 1 ? 'custom-like1' : 'custom-zan'"
      @click="onLike"
    ></Icon>
    <Icon
      :class="`dislike-btn ${feedBack === 2 && 'active'}`"
      :custom="feedBack === 2 ? 'custom-unlike' : 'custom-cai'"
      @click="onDisLike"
    ></Icon>
    <feedBackModal
      :visible="modalVisible"
      @onClose="handleClose"
      @onSubimt="handleSubmit"
    ></feedBackModal>
  </div>
</template>

<script>
import feedBackModal from './feedBackModal.vue'

export default {
  name: 'feedBackButtons',
  components: {
    feedBackModal,
  },
  data() {
    return {}
  },
  props: {
    feedBack: 0,
    modalVisible: false,
  },
  methods: {
    onLike() {
      const feedbackType = this.feedBack === 1 ? 0 : 1
      this.$emit('onFeedback', { feedbackType })
    },
    onDisLike() {
      this.modalVisible = true
    },
    handleClose() {
      this.modalVisible = false
    },
    handleSubmit(val) {
      const feedbackType = this.feedBack === 2 ? 0 : 2
      this.$emit('onFeedback', { feedbackType, feedbackReason: val })
      this.modalVisible = false
    },
  },
  watch: {},
  computed: {},
}
</script>

<style scoped lang="less">
.feedBackButtons {
  font-size: 12px;
  .like-btn,
  .dislike-btn {
    font-size: 20px;
    cursor: pointer;
    &:hover {
      color: #ff752a;
    }
    &.active {
      color: #ff752a;
    }
  }
  .dislike-btn {
    margin-left: 10px;
  }
}
</style>
