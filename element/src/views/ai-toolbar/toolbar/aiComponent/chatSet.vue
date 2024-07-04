<template>
  <div class="chatSet">
    <!-- 模型设置 -->
    <div class="chatSet-title">
      {{ $t('aiToolBar.frontAi.modelSettings') }}
    </div>
    <div class="chatSet-content">
      <!-- 选择模型 -->
      <div class="chatSet-item">
        <div class="chatSet-item-title">
          {{ $t('aiToolBar.frontAi.selectModel') }}
        </div>

        <div class="chatSet-item-content model-type">
          <RadioGroup v-model="model">
            <Radio :label="1">{{
              $t('aiToolBar.frontAi.modelType_3p5')
              }}</Radio>
            <Radio :label="2">{{ $t('aiToolBar.frontAi.modelType_4') }}</Radio>
            <Radio :label="6">{{ $t('aiToolBar.frontAi.modelType_6') }}</Radio>
            <Radio :label="7">{{ $t('aiToolBar.frontAi.modelType_7') }}</Radio>
            <Radio :label="4">{{
              $t('aiToolBar.frontAi.modelType_hunyuan1')
              }}</Radio>
            <Radio :label="5">{{
              $t('aiToolBar.frontAi.modelType_hunyuan2')
              }}</Radio>
            <Radio v-if="['1001', '10110', '10304'].includes(`${enterpriseId}`)" :label="3">{{
              $t('aiToolBar.frontAi.modelType_pangu') }}</Radio>
          </RadioGroup>
        </div>
      </div>

      <!-- 选择模型创造力 -->
      <div class="chatSet-item">
        <div class="chatSet-item-title">
          {{ $t('aiToolBar.frontAi.selectModelCreativity') }}
        </div>

        <div class="chatSet-item-content">
          <div class="chatSet-btnGroup">
            <div @click="changeModelCreativity(1)" :class="{
              'chatSet-btnGroup-btn': true,
              'chatSet-btnGroup-btn__active': modelCreativity === 1,
            }">
              {{ $t('aiToolBar.frontAi.strictMode') }}
            </div>
            <div @click="changeModelCreativity(2)" :class="{
              'chatSet-btnGroup-btn': true,
              'chatSet-btnGroup-btn__active': modelCreativity === 2,
            }">
              {{ $t('aiToolBar.frontAi.standardMode') }}
            </div>
            <div @click="changeModelCreativity(3)" :class="{
              'chatSet-btnGroup-btn': true,
              'chatSet-btnGroup-btn__active': modelCreativity === 3,
            }">
              {{ $t('aiToolBar.frontAi.creativeMode') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 调用知识库内容 -->
    <div class="chatSet-title">
      <!-- 总开关 -->
      <div class="chatSet-switch">
        <div class="chatSet-switch-label">
          {{ $t('aiToolBar.frontAi.useKnowledgeBaseContent') }}
        </div>

        <div class="chatSet-switch-content">
          <el-switch v-model="isUseKnowledgeBaseContent" :active-value="1" :inactive-value="0"></el-switch>
        </div>
      </div>
    </div>
    <div v-if="isUseKnowledgeBaseContent" class="chatSet-content">

      <!-- 按回复偏好 -->
      <responsePrefer class="response-prefer" :responsePrefer.sync="responsePrefer" />

      <!-- 知识图谱 -->
      <div class="chatSet-switch">
        <div class="chatSet-switch-label">
          {{ $t('aiToolBar.frontAi.knowledgeMap') }}
        </div>

        <div class="chatSet-switch-content">
          <Tooltip :disabled="isGraphExist" content="企业还未生成知识图谱，暂不可用">
            <el-switch v-model="isUseGraph" :disabled="!isGraphExist" :active-value="1" :inactive-value="0"></el-switch>
          </Tooltip>
        </div>
      </div>

      <!-- 按文件筛选 -->
      <div class="chatSet-item">
        <div class="chatSet-item-title">
          {{ $t('aiToolBar.frontAi.filterByFile') }}
        </div>

        <div class="chatSet-item-content">
          <!-- 全部/指定 单选 radio -->
          <RadioGroup v-model="filterFolderType">
            <Radio :label="0">{{ $t('aiToolBar.frontAi.allFolder') }}</Radio>
            <Radio :label="1">{{
              $t('aiToolBar.frontAi.specificFolder')
              }}</Radio>
          </RadioGroup>

          <!-- 指定文件夹选框 -->
          <div v-if="filterFolderType === 1" class="chatSet-folder">
            <div class="chatSet-folder-select">
              <FolderFilter :folderIdList.sync="filterFolderIds" :expandAll="true" :mustInput="true"></FolderFilter>
            </div>
          </div>
        </div>
      </div>

      <!-- 按标签筛选 -->
      <div class="chatSet-item">
        <div class="chatSet-item-title">
          {{ $t('aiToolBar.frontAi.filterByTag') }}
        </div>

        <div class="chatSet-item-content">
          <!-- 全部/指定 单选 radio -->
          <RadioGroup v-model="filterTagType">
            <Radio :label="0">{{ $t('aiToolBar.frontAi.allTag') }}</Radio>
            <Radio :label="1">{{ $t('aiToolBar.frontAi.specificTag') }}</Radio>
          </RadioGroup>

          <!-- 指定文件夹选框 -->
          <div v-if="filterTagType === 1" class="chatSet-tags setTag-container">
            <!-- <div v-for="item in tagList"
                             :key="item.id"
                             @click="handleClickTag(item)"
                             :class="{ 'chatSet-tag': true, 'chatSet-tag__active': filterTagIds.includes(item.id) }">{{ item.tagName }}</div> -->

            <CommonTag v-for="item in tagList" :key="item.id" :color="item.tagColor" class="setTag-tagItem">
              <!-- 文本 -->
              <span>{{ item.tagName }}</span>

              <!-- 删除按钮 -->
              <!-- <Icon custom="custom-close-circle"
                                  size="18"
                                  @click.native="handleRemoveTag(row, item)"
                                  class="setTag-tagItem-closeBtn"></Icon> -->
            </CommonTag>

            <!-- 添加 -->
            <AddTagPopper :oldTagList="tagList" :canConfirmWithoutTag="true" :saveFunc="saveTag">
              <div class="setTag-tagItem-add">
                {{ $t('aiToolBar.frontAi.add') }}
              </div>
            </AddTagPopper>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { saveChatSettings } from '../../api/aiApi'
import FolderFilter from './folderFilter.vue'
import AddTagPopper from './addTagPopper.vue'
import CommonTag from './commonTag.vue'
import responsePrefer from './responsePrefer.vue';
import store from '../../../../store'

export default {
  name: 'chatSet',
  components: {
    FolderFilter,
    AddTagPopper,
    CommonTag,
    responsePrefer,
  },
  props: {
    chatSettings: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      /* 全局 */
      loading: false,
      isInit: true,

      /* 数据 */
      // 模型类别: 1-GPT3.5, 0.2/1K, 2-GPT4, 1/1K
      model: '',
      // 模型创造力: 1-精准模式, 2-标准模式, 3-创造模式
      modelCreativity: '',
      // 调用知识库内容相关
      isUseKnowledgeBaseContent: 0,
      filterFolderType: 0,
      filterFolderIds: [],
      filterTagType: 0,
      tagList: [],
      filterTagIds: [],
      // 引用会话消息
      quoteMsgNum: 0,
      // 是否深度优化答案: 0-否, 1-是
      isDeepOptimizeAnswer: '',
      isUseGraph: 0,
      isGraphExist: 0,
      responsePrefer: 0,

      enterpriseId: '',
      userId: '',
    }
  },
  methods: {
    // 获取设置数据
    refreshData() {
      this.$emit('refreshSet')
    },
    // 数据处理
    handleData(data) {
      const {
        modelType,
        modelCreativity,
        isUseKg,
        isSpecifyDir,
        folderIds,
        isSpecifyTag,
        selectedTags,
        quoteChatTotal,
        isRefine,
        isUseGraph,
        isGraphExist,
        responsePrefer,
      } = data
      this.model = modelType
      this.modelCreativity = modelCreativity
      this.isUseKnowledgeBaseContent = isUseKg
      this.filterFolderType = isSpecifyDir
      this.filterFolderIds = Array.isArray(folderIds) ? folderIds : []
      this.filterTagType = isSpecifyTag
      this.tagList = (Array.isArray(selectedTags) ? selectedTags : []).map(
        (item) => {
          const { id, tagName, tagColor } = item

          return {
            id,
            tagName,
            tagColor,
          }
        }
      )
      this.filterTagIds = this.tagList.map((item) => item.id)
      this.quoteMsgNum = quoteChatTotal
      this.isDeepOptimizeAnswer = isRefine
      this.isUseGraph = isUseGraph
      this.isGraphExist = isGraphExist
      this.responsePrefer = responsePrefer

      // 返回原始数据
      return data
    },

    // 切换模型创造力
    changeModelCreativity(val) {
      this.modelCreativity = val
    },

    // // 选中指定标签
    // handleClickTag(tagData) {
    //     // 如果已选中, 则取消选中, return
    //     if (this.filterTagIds.includes(tagData.id)) {
    //         this.filterTagIds = this.filterTagIds.filter(item => item !== tagData.id);

    //         return;
    //     }

    //     // 否则选中(此处使用 = , 避免 watch 监听到的新旧数据一致)
    //     this.filterTagIds = this.filterTagIds.concat(tagData.id);
    // },
    // 保存选中标签
    saveTag(tagList) {
      return new Promise((resolve, reject) => {
        this.tagList = tagList
        this.filterTagIds = tagList.map((item) => item.id)

        resolve({
          code: 1,
          notice: 'none',
        })
      })
    },

    // 保存
    handleSave(data) {
      // 聊天设置未请求完毕, return
      if (!this.chatSettings.scenarioConfigId) {
        this.$Message.warning(this.$t('aiToolBar.frontAi.error_noChatSettings'))
        return
      }

      const { enterpriseId: orgId, userId } = store.state
      // 发送请求
      const sendData = Object.assign(
        {
          orgId,
          userId,
          scenarioConfigId: this.chatSettings.scenarioConfigId,
        },
        data
      )
      saveChatSettings(sendData)
        .then((res) => {
          if (res.code === 1) {
            this.refreshData()
          } else {
            this.$Message.error(this.$t('aiToolBar.addModal.saveSuccess'))
            this.loading = false
          }
        })
        .catch((e) => {
          console.error(e)
          this.$Message.error(this.$t('aiToolBar.addModal.saveFailed'))
          this.loading = false
        })
    },
  },
  watch: {
    chatSettings: {
      handler(val) {
        if (val) {
          // 数据处理
          // 重置初始化状态为 true
          this.isInit = true
          // 处理数据
          this.handleData(val)
          // 初始化完成, 重置初始化状态为 false
          this.$nextTick(() => {
            this.isInit = false
          })
        }
      },
      immediate: true,
    },
    // 保存模型设置
    model: {
      handler(val) {
        // 初始化导致的数据更新, 不用响应, return
        if (this.isInit) {
          return
        }

        // 保存数据
        this.handleSave({
          modelType: val,
        })
      },
    },
    // 保存模型创造力设置
    modelCreativity: {
      handler(val) {
        // 初始化导致的数据更新, 不用响应, return
        if (this.isInit) {
          return
        }

        // 保存数据
        this.handleSave({
          modelCreativity: val,
        })
      },
    },
    // 保存启用知识库内容设置
    isUseKnowledgeBaseContent: {
      handler(val) {
        // 初始化导致的数据更新, 不用响应, return
        if (this.isInit) {
          return
        }

        // 保存数据
        this.handleSave({
          isUseKg: val,
        })
      },
    },
    // 保存启用知识图谱设置
    isUseGraph: {
      handler(val) {
        // 初始化导致的数据更新, 不用响应, return
        if (this.isInit) {
          return
        }

        // 保存数据
        this.handleSave({
          isUseGraph: val,
        })
      },
    },
    // 文件夹选中情况变化时, 自动保存设置
    // 处理"全部文件夹"
    filterFolderType: {
      handler(val) {
        // 初始化导致的数据更新, 不用响应, return
        if (this.isInit) {
          return
        }

        if (val === 0) {
          // 切换到"全部文件夹", 保存数据
          this.handleSave({
            isSpecifyDir: 0,
            folderIds: [],
          })
        } else {
          // 切换到"指定文件夹", 默认全选
          this.filterFolderIds = (
            Array.isArray(this.chatSettings.allFolders)
              ? this.chatSettings.allFolders
              : []
          )
            .filter((item) => item.parentDirId === -1)
            .map((item) => item.folderId)
        }
      },
    },
    // 处理"指定文件夹"
    filterFolderIds: {
      handler(val, oldVal) {
        // 初始化导致的数据更新, 不用响应, return
        if (this.isInit) {
          return
        }

        if (val && val.length) {
          // 如果选中的标签和之前的一样, 则不用响应, return
          if (
            oldVal &&
            JSON.stringify(val.slice().sort()) ===
            JSON.stringify(oldVal.slice().sort())
          ) {
            return
          }
          this.handleSave({
            isSpecifyDir: 1,
            folderIds: val,
          })
        }
      },
      // deep: true
    },
    // 标签选中情况变化时, 自动保存设置
    // 处理"全部标签"
    filterTagType: {
      handler(val) {
        // 初始化导致的数据更新, 不用响应, return
        if (this.isInit) {
          return
        }

        if (val === 0) {
          // 切换到"全部标签", 保存数据
          this.handleSave({
            isSpecifyTag: 0,
            tagIds: [],
          })
        } else {
          // 切换到"指定标签", 设置标签数组为空, 触发标签数组保存机制
          // "指定标签"允许为空, 为空是筛选"没有标签"的数据
          this.filterTagIds = []
        }
      },
    },
    // 处理"指定标签"
    filterTagIds: {
      handler(val, oldVal) {
        // 初始化导致的数据更新, 不用响应, return
        if (this.isInit) {
          return
        }

        if (val) {
          // 如果数组不为空的情况下, 选中的标签和之前的一样, 则不用响应, return
          if (
            oldVal &&
            val.length &&
            oldVal.length &&
            JSON.stringify(val.slice().sort()) ===
            JSON.stringify(oldVal.slice().sort())
          ) {
            return
          }

          // 保存数据
          this.handleSave({
            isSpecifyTag: 1,
            tagIds: val,
          })
        }
      },
      deep: true,
    },
    // 保存引用会话消息
    quoteMsgNum: {
      handler(val) {
        // 初始化导致的数据更新, 不用响应, return
        if (this.isInit) {
          return
        }

        // 保存数据
        this.handleSave({
          quoteChatTotal: val,
        })
      },
    },
    // 保存引用会话消息
    isDeepOptimizeAnswer: {
      handler(val) {
        // 初始化导致的数据更新, 不用响应, return
        if (this.isInit) {
          return
        }

        // 保存数据
        this.handleSave({
          isRefine: val,
        })
      },
    },

    // 处理"responsePrefer"
    responsePrefer: {
      handler(val) {
        // 初始化导致的数据更新, 不用响应, return
        if (this.isInit) {
          return;
        }

        this.handleSave({
          responsePrefer: val
        });
      },
      deep: true
    },
  },
  created() {
    const { userId, enterpriseId } = store.state
    this.userId = userId
    this.enterpriseId = enterpriseId
  },
}
</script>

<style lang="less" scoped>
.chatSet {
  overflow: auto;

  &-title {
    color: #333;
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    margin: 20px 0 8px;
  }

  &-content {
    padding: 20px 20px 10px;
    background: #fafbff;
    border-radius: 6px;

    &:last-child {
      margin-bottom: 20px;
    }

    /deep/.el-radio-group {
      display: flex;
      flex-wrap: wrap;
    }

    /deep/ .el-radio {
      width: 40%;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    /deep/ .el-radio__label {
      color: rgba(0, 0, 0, 0.8);
      font-size: 12px;
      line-height: 18px;
      padding-left: 8px;
    }

    .response-prefer {
      margin-top: -20px;
      margin-bottom: 8px;
    }

    .chatSet-switch {
      margin-bottom: 8px;

      /deep/ .el-switch {
        vertical-align: top;
      }
    }
  }

  &-item {
    &-title {
      color: #333;
      font-size: 14px;
      font-weight: 500;
      line-height: 18px;
      margin-bottom: 12px;
    }

    &-content {
      margin-bottom: 10px;

      &.model-type {
        margin-bottom: 12px;
      }
    }

    &-tip {
      color: #666;
      font-size: 12px;
      line-height: 18px;
      margin-top: 8px;
    }
  }

  &-btnGroup {
    display: inline-block;
    padding: 6px 8px;
    border-radius: 6px;
    background-color: #fff;
    box-shadow: 0px 0.5px 4px #dde1e4;

    &-btn {
      display: inline-block;
      padding: 4px 16px;
      cursor: pointer;
      color: #333;
      margin-right: 20px;
      font-size: 13px;
      line-height: 20px;

      &:last-child {
        margin-right: 0;
      }

      &__active {
        font-weight: 600;
        color: #fff;
        border-radius: 6px;
        background: #ff752a;
        box-shadow: 0px 4px 4px 0px rgba(255, 117, 45, 0.15);
      }
    }
  }

  &-switch {
    display: flex;

    &-label {
      flex: 1;
      color: #333;
      font-size: 14px;
      font-weight: 500;
      line-height: 18px;
    }
  }

  &-folder {
    margin-top: 10px;

    &-select {
      display: inline-block;
      // width: 300px;
    }
  }

  &-tags {
    margin-top: 10px;
  }

  &-tag {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 18px;
    border: 1px solid #f1f1f1;
    background: #f1f1f1;
    margin-right: 12px;

    color: #333;
    font-size: 12px;
    line-height: 18px;
    cursor: pointer;

    &:last-child {
      margin-right: 0;
    }

    &__active {
      padding: 1px 8px;
      border-radius: 6px;
      border: 1px solid rgba(250, 124, 35, 0.5);
      background: #fff;

      color: #ff752a;
    }
  }
}

.setTag-container {
  white-space: normal;
  overflow-y: auto;
}

.setTag-tagItem {
  position: relative;
  margin: 5px 10px 5px 0;

  &-closeBtn {
    display: none;
    position: absolute;
    right: -9px;
    top: -9px;
    cursor: pointer;
    color: #666;
  }

  &-add {
    display: inline-block;
    margin: 5px 0;
    padding: 1px 8px;
    border-radius: 6px;
    border: 1px dashed #666;
    background: #fff;
    cursor: pointer;
    color: #666;
    text-align: center;
    font-size: 12px;
    line-height: 18px;
  }

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    .setTag-tagItem-closeBtn {
      display: block;
    }
  }
}
</style>
