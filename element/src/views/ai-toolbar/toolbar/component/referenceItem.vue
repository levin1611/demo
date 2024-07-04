<template>
  <div class="referenceItem">
    <div class="ref-contnet">{{ item.chunkDetail }}</div>
    <div class="ref-footer">
      <Tooltip :content="item.fileName"
        ><a @click.prevent="startPreview">
          {{ item.fileName }}
        </a></Tooltip
      >
      <Icon
        class="download-btn"
        custom="custom custom-import1"
        @click="onDownload"
      ></Icon>
      <div class="ref-page">
        {{ $t('aiToolBar.ref.page', { value: item.pageNum }) }}
      </div>
      <div class="ref-feed-back">
        <feedBackButtons
          :feedBack="feedBack"
          @onFeedback="onUpdateFeedback"
        ></feedBackButtons>
      </div>
    </div>
  </div>
</template>

<script>
import feedBackButtons from './feedBackButtons.vue'
import { feedbackOnReference } from '../../api'
import store from '../../../../store'

export default {
  name: 'referenceItem',
  components: {
    feedBackButtons,
  },
  inject: ['calcScenarioType'],
  props: {
    item: {
      type: Object,
    },
  },
  emits: ['showFilePreview'],
  data() {
    return {
      feedBack: 0,
    }
  },
  methods: {
    startPreview() {
      const fileInfo = {
        id: this.item.fileId,
        name: this.item.fileName,
        url: this.item.fileUrl,
        page: this.item.pageNum,
        isDeleted: this.item.fileIsDeleted,
      }
      this.$emit('showFilePreview', fileInfo)
    },
    onDownload() {
      window.open(this.item.fileUrl, '_blank')
    },

    onUpdateFeedback(params) {
      const { enterpriseId: orgId, userId } = store.state
      const { operationId, chunkId, chunkType } = this.item
      feedbackOnReference({
        operationId,
        orgId,
        userId,
        referenceDataId: chunkId,
        referenceDataType: chunkType,
        scenarioType: this.calcScenarioType(),
        ...params,
      }).then((res) => {
        if (res && res.code === 1) {
          this.feedBack = params.feedbackType
        }
      })
    },
  },
  watch: {
    item(i) {
      const { feedbackType } = i
      if (feedbackType) {
        this.feedBack = feedbackType
      }
    },
  },
}
</script>

<style lang="less" scoped>
.referenceItem {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  margin-top: 15px;
  background: rgba(250, 251, 255, 1);
  border-radius: 8px;
  &:last-child {
    margin-bottom: 15px;
  }
  .ref-contnet {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
    font-size: 14px;
  }
  .ref-footer {
    display: flex;
    align-items: baseline;
    margin-top: 10px;
    font-size: 12px;
    a {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 150px;
      margin-right: 12px;
    }
    .ref-page {
      color: rgb(144, 146, 153);
    }
    .download-btn {
      cursor: pointer;
      margin-right: 12px;
    }
    .ref-feed-back {
      margin-left: auto;
      .feedBackButtons {
        .custom {
          font-size: 18px;
        }
      }
    }
  }
}
</style>
