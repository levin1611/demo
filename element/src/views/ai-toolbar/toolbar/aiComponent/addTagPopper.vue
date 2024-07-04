<template>
  <Poptip
    :trigger="trigger"
    :width="width"
    :popper-class="popperClass"
    :placement="placement"
    ref="poptip"
    @show="handlePopperShow"
    @hide="handlePopperHide"
    class="addTagPop"
  >
    <!-- trigger -->
    <div slot="reference" class="addTagPop-trigger">
      <slot></slot>
    </div>

    <!-- content -->
    <div class="addTagPop-content">
      <!-- loading -->
      <Spin v-if="loading" fix></Spin>

      <!-- 标题 -->
      <div
        v-if="isTableFilterMode"
        style="font-size: 12px; height: 36px; line-height: 36px"
      >
        <Icon
          custom="custom-table-filter"
          color="#7d9abe"
          style="margin-right: 8px"
        ></Icon>
        <span>{{ $t('tableFilter.contentFilter') }}</span>
      </div>

      <!-- 筛选框 -->
      <Input
        v-model="filterInputVal"
        clearable
        @clear="triggerSearch"
        @keyup.enter.native="triggerSearch"
        class="addTagPop-search"
      >
        <Icon
          slot="suffix"
          custom="custom custom-journey-search"
          color="#7B98B6"
          size="14"
          @click.native="triggerSearch"
          class="addTagPop-search-icon"
        ></Icon>
      </Input>

      <!-- 搜索无数据提示 -->
      <div
        v-if="filterCon.tagName && !allTagData.length"
        :style="{ height: `${scrollHeight + 32}px` }"
        class="addTagPop-noTagTip"
      >
        <p>
          {{
            $t('aiToolBar.frontAi.noResultForSearch', {
              name: filterCon.tagName,
            })
          }}
        </p>
      </div>

      <!-- 标签列表 -->
      <div v-else class="addTagPop-tagList">
        <Scroll
          :on-reach-bottom="loadEnd ? undefined : loadMore"
          :distance-to-edge="10"
          :loading-text="$t('crm.Html.loading')"
          :height="scrollHeight"
          ref="tagListScroll"
        >
          <!-- 内容显示 -->
          <div
            v-for="tag in allTagData"
            :key="tag.id"
            @click="toggleCheckBox(!selectedTagIds.includes(tag.id), tag)"
            class="addTagPop-tagItem"
          >
            <!-- checkbox -->
            <Checkbox
              :value="selectedTagIds.includes(tag.id)"
              class="addTagPop-tagItem-checkbox"
              :style="{ marginRight: '5px' }"
            ></Checkbox>

            <!-- 色彩小样 -->
            <span
              :style="{ borderColor: tag.tagColor }"
              class="addTagPop-tagItem-colorChip"
            ></span>

            <!-- 标签名 -->
            <span class="addTagPop-tagItem-tagName">{{ tag.tagName }}</span>
          </div>
        </Scroll>
      </div>
    </div>

    <!-- footer -->
    <div class="addTagPop-footer">
      <!-- left -->
      <div class="addTagPop-footer-left">
        <!-- 清空 -->
        <Button type="text" @click="empty" class="addTagPop-emptyBtn">{{
          $t('filter_box.empty')
        }}</Button>
      </div>

      <!-- right -->
      <div class="addTagPop-footer-right">
        <!-- 取消 -->
        <Button type="minor" size="small" @click="cancel">{{
          $t('cancel')
        }}</Button>

        <!-- 确定 -->
        <Button
          type="success"
          size="small"
          :disabled="disabled_confirm"
          @click="ok"
          :class="{ 'addTagPop-btn__disabled': disabled_confirm }"
          >{{ $t('confirm') }}</Button
        >
      </div>
    </div>
  </Poptip>
</template>

<script>
import store from '../../../../store'
import { getTagTableData } from '../../api/aiApi'

export default {
  name: 'addTagPopper',
  props: {
    // 外部传入的, 当前已选中的标签数组
    oldTagList: {
      type: Array,
      default: () => [],
    },
    // 外部传入的按钮点击请求方法, 其应当直接返回接口调用的 Promise 对象
    saveFunc: {
      type: Function,
    },
    // trigger
    trigger: {
      type: String,
      default: 'click',
      // 坑爹, 使用 hover 时, 输入框输入文字, 鼠标移动到输入法的候选词上, 会触发 popper 的 mouseleave 事件, 导致弹框消失...
    },
    // 弹窗宽度
    width: {
      type: Number,
      default: 332,
    },
    // 弹窗位置
    placement: {
      type: String,
      default: 'top-start',
    },
    // 滚动加载高度
    scrollHeight: {
      type: Number,
      default: 260,
    },
    // 是否处于表头筛选框模式
    isTableFilterMode: {
      type: Boolean,
      default: false,
    },
    // 是否显示弹窗
    showPopper: {
      type: Boolean,
      default: false,
    },
    // 不选中标签时, 是否可以确定
    canConfirmWithoutTag: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    // 所有选中标签数组
    selectedTagIds() {
      const oldTagIds = this.selectedOldTagList.map((item) => item.id)
      const newTagIds = this.selectedTags.map((item) => item.id)
      return oldTagIds.concat(newTagIds)
    },
    popperClass() {
      const result = ['addTag-popper']
      if (this.isTableFilterMode) {
        result.push('tagTableFilter-popper')
      }
      return result.join(' ')
    },
    // 确定按钮是否可用
    disabled_confirm() {
      // 1. 不选中标签时, 是否可以确定
      // 2. 如果是表头筛选框模式, 不选中标签也可以确定
      if (this.canConfirmWithoutTag || this.isTableFilterMode) {
        return false
      }

      // 否则, 必须选中标签才能确定
      return !this.selectedTagIds.length
    },
  },
  data() {
    return {
      /* 全局 */
      loading: true,

      /* 筛选 */
      // 输入框当前显示内容
      filterInputVal: '',
      // 当前实际筛选条件
      filterCon: {},

      /* 标签数据加载 */
      allTagData: [],
      // 是否显示数据变更提示
      showChangeTip: false,
      // 分页
      totalNum: 0,
      curPage: 0,
      pageSize: 100,
      // 滚动加载
      loadEnd: false,

      /* 标签选中 */
      // 旧标签数组 -- 外部传入的标签数组, 有可能切换选中状态
      selectedOldTagList: [],
      // 不包括旧标签数组在内的, 手动选中的标签数组
      selectedTags: [],

      enterpriseId: 'enterpriseId',
      userId: 'userId',
    }
  },
  methods: {
    /* 全局 */
    // popper 显示
    handlePopperShow() {
      // 表头筛选框模式下, 弹框显示时主动更新外部 props: showPopper
      if (!this.showPopper) {
        this.$emit('update:showPopper', true)
      }
      // 获取最新标签数据
      this.refreshData_filter()
      // 重置数据
      this.resetData()
    },
    // popper 隐藏
    handlePopperHide() {
      // 表头筛选框模式下, 弹框隐藏时主动更新外部 props: showPopper
      if (this.showPopper) {
        this.$emit('update:showPopper', false)
      }
      // 重置数据
      this.resetData()
    },
    // 数据重置
    resetData() {
      this.filterInputVal = ''
      this.filterCon = {}
      this.selectedOldTagList = this.oldTagList.slice()
      this.selectedTags = []
      // 其他数据交由 refreshData_filter 清空
    },

    /* 表格数据请求 */
    // 滚动加载
    loadMore() {
      return this.getTagData()
    },
    // 请求标签数据
    getTagData() {
      // 正在请求, 直接退出
      if (this.loading) {
        return
      }

      // 否则开始请求
      this.loading = true
      // 设置请求页数
      this.curPage++
      return new Promise((resolve, reject) => {
        getTagTableData(
          Object.assign(
            {
              orgId: this.enterpriseId,
              userId: this.userId,
              pageNum: this.curPage,
              pageSize: this.pageSize,
            },
            this.filterCon
          )
        )
          .then((res) => {
            if (res.code === 1) {
              // 处理表格数据
              // 引用内容返回是 list , 关键词直接是 data
              const dataList = this.handleData(res.data.list || res.data)

              // 记录数据总条数
              const totalNum = res.data.total || 0
              // 判断数据总条数是否有变更, 如果有, 需要提示用户, 当前数据视图已发生变化
              if (this.totalNum && this.totalNum !== totalNum) {
                this.totalNum = totalNum
                this.showChangeTip = true
              }

              // 有旧数据 + 接口返回数据为空, 提示已加载完毕
              if (this.allTagData.length && !dataList.length) {
                this.curPage--
                this.loading = false
                this.loadEnd = true
                this.$Message.info(this.$t('facebook.adAccountBinding.noMore'))
                return
              }

              // 去除原有 allTagData 中和传入的新获取数据 dataList id 一致的部分
              let allTagData = this.allTagData.filter(
                (item) =>
                  dataList.findIndex((data) => data.id === item.id) === -1
              )
              // 拼接新传入数据
              allTagData = allTagData.concat(dataList)

              // 接口返回数据去重后数据为空, 继续请求下一页
              const prevTableDataLength = this.allTagData.length
              const nowTableDataLength = allTagData.length
              if (
                prevTableDataLength === nowTableDataLength &&
                prevTableDataLength > 0
              ) {
                this.getTagData()
                return
              }

              // 否则, allTagData 赋值
              this.allTagData = allTagData
            } else {
              this.curPage--
              this.$Message.error(this.$t('crm.WorkBench.error_getTableData'))
            }
            this.loading = false
          })
          .catch((e) => {
            console.error(e)
            this.curPage--
            this.$Message.error(this.$t('crm.WorkBench.error_getTableData'))
            this.loading = false
          })
      })
    },
    // 表格数据处理
    handleData(data) {
      let result = []

      if (Array.isArray(data)) {
        result = data.map((item) => {
          // 数据提取
          const {
            id,
            tagName,
            tagColor,
            createUserName: creator,
            createTime,
            updateUserName,
            updateTime,
            // 前一个 id，用于自定义排序
            preId,
          } = item

          return {
            id,
            tagName,
            tagColor,
            creator,
            createTime,
            updateUserName,
            updateTime,
            // 前一个 id，用于自定义排序
            preId,
          }
        })
      }

      return result
    },

    /* 筛选 */
    // 点击筛选按钮
    triggerSearch() {
      if (!this.filterInputVal) {
        this.filterCon = {}
      } else {
        this.filterCon = {
          tagName: this.filterInputVal,
        }
      }
      this.refreshData_filter()
    },
    // 检索并刷新标签数据
    refreshData_filter() {
      this.loadEnd = false
      this.totalNum = 0
      this.curPage = 0
      this.allTagData = []
      this.loading = false
      this.showChangeTip = false
      this.getTagData()
    },

    /* 选中 */
    toggleCheckBox(isCheck, tagData) {
      if (isCheck) {
        // 选中

        // 加入手动选中标签数组中
        this.selectedTags.push(tagData)
      } else {
        // 取消选中

        let index = this.selectedOldTagList.findIndex(
          (item) => item.id === tagData.id
        )
        if (index !== -1) {
          // 从旧标签数组中移除

          this.selectedOldTagList.splice(index, 1)
        } else {
          // 旧标签数组中不存在, 从手动选中标签数组中移除

          index = this.selectedTags.findIndex((item) => item.id === tagData.id)
          this.selectedTags.splice(index, 1)
        }
      }
    },

    /* footer */
    // 清空所有选中标签
    empty() {
      this.selectedTags = []
      this.selectedOldTagList = []
    },
    // 保存
    async ok() {
      // UI 要求，如果没有选中标签，可以点击确定按钮，会有以下两种情况：
      // 1. 原来有标签, 但是清除了所有标签（类似标签全部清除）
      // 2. 原来没标签，点了确定按钮

      // loading 中, 直接退出
      if (this.loading) {
        return
      }

      const allSelectedTagList = this.selectedOldTagList
        .map((item) => {
          // 旧标签数组中的标签, 如果在新请求的数据中存在, 则使用新数据, 否则使用旧数据
          const newTag = this.allTagData.find((tag) => tag.id === item.id)
          return newTag || item
        })
        .concat(this.selectedTags.slice())
      this.loading = true
      const res = await this.saveFunc(allSelectedTagList)
      switch (`${res.code}`) {
        case '1':
          // 情况 1：原来有标签, 但是清除了所有标签（类似标签全部清除）
          if (res.notice !== 'none') {
            if (this.canConfirmWithoutTag && !allSelectedTagList.length) {
              this.$Message.success(this.$t('deleteSuccess'))
            } else {
              // 请求成功
              this.$Message.success('添加标签成功')
            }
          }
          // 向外部传递选中标签数据
          this.$emit('updateTagList', allSelectedTagList)
          // 关闭弹窗
          this.cancel()
          break
        case '10':
          // 情况 2：原来没标签，点了确定按钮
          // 向外部传递选中标签数据
          this.$emit('updateTagList')
          // 关闭弹窗
          this.cancel()
          break
        case 'else':
        default:
          // 请求失败
          this.$Message.error('标签添加失败')
          break
      }
      this.loading = false
    },
    // 取消
    cancel() {
      // 关闭弹窗
      this.$refs.poptip.doClose()
      // 保险起见, 加个"update:visible", 外部如果通过 visible 控制弹框显示, 也能关闭
      this.$emit('update:visible', false)
    },
  },
  watch: {
    // 表头筛选模式下, 外部传参要求弹框变为消失状态, 关闭弹框
    showPopper(val) {
      if (!val) {
        if (this.isTableFilterMode) {
          this.cancel()
        }
      }
    },
  },
  created() {
    const { userId, enterpriseId } = store.state
    this.userId = userId
    this.enterpriseId = enterpriseId
  },
}
</script>

<style scoped lang="less">
.addTagPop {
  &-trigger {
    display: inline-block;
  }

  &-content {
    position: relative;
  }

  &-noTagTip {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    text-align: center;
    font-size: 12px;
    line-height: 18px;
    color: #999;
  }

  &-tagList {
    overflow-y: auto;
    margin: 8px 0 24px;
  }

  &-tagItem {
    display: flex;
    margin-bottom: 12px;
    cursor: pointer;

    &-checkbox {
      margin-right: 8px;
      pointer-events: none;
    }

    &-colorChip {
      position: relative;
      top: 2px;
      margin-right: 4px;
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid transparent;
      flex-shrink: 0;
    }

    &-tagName {
      color: rgba(0, 0, 0, 0.8);
      font-size: 12px;
      line-height: 18px;
      flex: 1;
      white-space: nowrap;
    }
  }

  &-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-left {
    }

    &-right {
      float: right;
    }
  }

  &-btn {
    &__disabled {
      color: #a6aaae;
      background: #e7ecf2;
      border-color: #e7ecf2;
      cursor: not-allowed;

      &:hover {
        color: #a6aaae;
        background: #e7ecf2;
        border-color: #e7ecf2;
      }
    }
  }

  &-emptyBtn {
    color: #3b78de;
    font-size: 12px;
    line-height: 18px;
  }
}
</style>

<style lang="less">
.addTag-popper {
  padding: 16px;
  z-index: 3500 !important;
}

.tagTableFilter-popper {
  padding: 10px 16px 16px;
}

.addTagPop-search-icon {
  display: inline-block;
  width: 25px;
  height: 100%;
  line-height: 32px;
  cursor: pointer;
  float: right;

  &::after {
    clear: both;
  }
}
</style>
