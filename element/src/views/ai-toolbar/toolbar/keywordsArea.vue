<template>
  <div class="keywordsArea" key="keywords-area">
    <QuoteKeywordItem
      v-for="(keywordData, index) in keywordList"
      v-if="index < maxCount || isShowMore"
      :key="keywordData.keywordId"
      :keywordData="keywordData"
      @viewKeyword="handleViewKeyword(keywordData)"
      @likeKeyword="handleRateKeyword(keywordData, 1)"
      @dislikeKeyword="handleRateKeyword(keywordData, 2)"
      :style="keywordColorObj[index % 5]"
      class="chatRelatedInfo-keyword"
    ></QuoteKeywordItem>
    <div
      v-if="leftCount > 0 && !isShowMore"
      class="more-btn"
      @click="onClickMore"
    >
      +{{ leftCount }}
    </div>

    <TipModal
      :visible.sync="isViewDetail"
      :title="currKeywordData.keywordName"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      width="600px"
      :tipContent="currKeywordData.keywordSummary"
      :footerBtns="[]"
      @cancel="isViewDetail = false"
    />
    <feedBackModal
      :visible="isFeedBackModal"
      @onClose="handleClose"
      @onSubimt="handleSubmit"
    />
  </div>
</template>

<script>
import QuoteKeywordItem from './aiComponent/quoteKeywordItem.vue'
import TipModal from './aiComponent/tipModal.vue'
import feedBackModal from './component/feedBackModal.vue'
import { feedbackOnReference } from '../api'
import store from '../../../store'

export default {
  name: 'keywordsArea',
  components: { QuoteKeywordItem, TipModal, feedBackModal },
  props: {
    keywordList: [],
  },
  inject: ['calcScenarioType'],
  data() {
    return {
      isShowMore: false,

      maxCount: 4,
      keywordColorObj: [
        { color: '#4E7FFF', backgroundColor: '#F0F3FF' },
        { color: '#FF752A', backgroundColor: '#FFF3ED' },
        { color: '#00A8D0', backgroundColor: '#E9FBFF' },
        { color: '#7268FF', backgroundColor: '#F5F2FF' },
        { color: '#00A900', backgroundColor: '#EFFCEF' },
      ],

      currKeywordData: {},
      isViewDetail: false,
      isFeedBackModal: false,
    }
  },
  methods: {
    onClickMore() {
      this.isShowMore = true
    },

    handleViewKeyword(keywordData) {
      this.$set(this, 'currKeywordData', keywordData)
      this.isViewDetail = true
    },
    handleRateKeyword(data, clickVal) {
      const { enterpriseId: orgId, userId } = store.state
      // 评价值与当前值一致, 则取消评价, 否则改为评价值
      const val = data.feedbackType === clickVal ? 0 : clickVal

      // 发送请求
      const postData = {
        orgId,
        userId,
        // 历史记录的 id
        operationId: data.operationId,
        // 业务场景类型：1-ai 生成, 2-ai 聊天, 3-ai 搜索
        scenarioType: this.calcScenarioType(),
        // 引用的数据 id
        referenceDataId: data.keywordId,
        // 引用的数据类型：1-关键词, 2-文本块
        referenceDataType: 1,
        // 反馈的类型：0-取消评价, 1-点赞, 2-点踩
        feedbackType: val,
        feedbackReason: data.feedbackReason,
      }
      feedbackOnReference(postData)
        .then((res) => {
          if (res.code === 1) {
            // 点赞成功, 更新数据
            data.feedbackType = val

            // 如果是点踩, 要求用户填写反馈原因
            if (val === 2) {
              this.$set(this, 'currKeywordData', data)
              this.isFeedBackModal = true
            }
          }
        })
        .catch((err) => {
          console.error(err)
        })
    },
    handleSubmit(feedbackReason) {
      this.handleRateKeyword({ feedbackReason, ...this.currKeywordData }, 2)
      this.isFeedBackModal = false
    },
  },
  computed: {
    leftCount() {
      return this.keywordList.length - this.maxCount
    },
  },
  watch: {},
}
</script>

<style lang="less" scoped>
.keywordsArea {
  display: inline-block;
  width: calc(100% - 65px);
  vertical-align: top;
  .more-btn {
    display: inline-block;
    padding: 2px 4px;
    border: 1px solid rgba(205, 214, 226, 1);
    border-radius: 6px;
    font-size: 13px;
    line-height: 17px;
    vertical-align: top;
    cursor: pointer;
  }
}
</style>
