<template>
  <Poptip
    :width="width_popper"
    placement="top"
    trigger="hover"
    popper-class="quoteKeywordItem-popper"
    ref="poptip"
    class="quoteKeywordItem"
  >
    <!-- 按钮, Poptip 触发器 -->
    <div slot="reference" class="quoteKeywordItem-text">
      {{ keywordData.keywordName }}
    </div>

    <!-- 悬浮显示按钮组 -->
    <div class="quoteKeywordItem-operateBtns">
      <div
        v-for="btn in btnList"
        :key="btn"
        :class="{
          'quoteKeywordItem-operateBtn': true,
          'quoteKeywordItem-operateBtn__active':
            (btn === 'like' && keywordData.feedbackType === 1) ||
            (btn === 'dislike' && keywordData.feedbackType === 2),
        }"
      >
        <!-- 查看 -->
        <Icon
          v-if="btn === 'view'"
          custom="custom-eye"
          @click.native="viewKeyword"
        ></Icon>

        <!-- 点赞 -->
        <Icon
          v-else-if="btn === 'like'"
          :custom="
            keywordData.feedbackType === 1 ? 'custom-like1' : 'custom-zan'
          "
          @click.native="likeKeyword"
        ></Icon>

        <!-- 点踩 -->
        <Icon
          v-else-if="btn === 'dislike'"
          :custom="
            keywordData.feedbackType === 2 ? 'custom-unlike' : 'custom-cai'
          "
          @click.native="dislikeKeyword"
        ></Icon>
      </div>
    </div>
  </Poptip>
</template>

<script>
export default {
  name: 'quoteKeywordItem',
  props: {
    keywordData: {
      type: Object,
      default() {
        return {}
      },
    },
    btnList: {
      type: Array,
      default() {
        return ['view', 'like', 'dislike']
      },
    },
  },
  computed: {
    width_popper() {
      return this.btnList.length * 42 + 22
    },
  },
  data() {
    return {
      /* 全局 */
    }
  },
  methods: {
    /* 按钮操作 */
    // 查看
    viewKeyword() {
      this.$emit('viewKeyword')
    },
    // 点赞
    likeKeyword() {
      this.$emit('likeKeyword')
    },
    // 点踩
    dislikeKeyword() {
      this.$emit('dislikeKeyword')
    },
  },
}
</script>

<style lang="less">
.quoteKeywordItem {
  display: inline-block;
  margin-right: 10px;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 20px;
  position: relative;

  .quoteKeywordItem-text {
    max-width: 110px;
    overflow-x: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.quoteKeywordItem-popper {
  padding: 0;
  min-width: 64px;
  z-index: 3405 !important;
  & + .v-modal {
    z-index: 3399 !important;
  }
}

.quoteKeywordItem-operateBtns {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0px 0.5px 4px #dde1e4;
  white-space: nowrap;
  padding: 0 11px;
}

.quoteKeywordItem-operateBtn {
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 8px 5.5px;
  margin: 3px 5.5px;
  display: inline-block;
  line-height: 0;

  &:hover,
  &__active {
    color: #ff752a;
  }
}
</style>
