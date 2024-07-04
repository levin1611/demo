<!-- 文件夹筛选通用组件 -->
<template>
  <Poptip
    width="300"
    placement="bottom-end"
    popper-class="folder-filter-popper"
    ref="poptip"
    @show="handleShow"
    @hide="cancel"
  >
    <!-- 按钮, Poptip 触发器 -->
    <div slot="reference" class="folder-filter-trigger">
      <!-- 标题 -->
      <Tooltip :disabled="true" :content="title" effect="dark" placement="top">
        <span class="folder-filter-title">
          <!-- placeholder -->
          <span v-if="!title" class="folder-filter-placeholder">{{
            $t('aiToolBar.frontAi.placeholder_selectFolder')
          }}</span>
          <!-- 标题 -->
          <template v-else>{{ title }}</template>
        </span>
      </Tooltip>

      <!-- 下拉按钮 -->
      <template>
        <span class="el-select">
          <span class="el-input">
            <i class="el-select__caret el-input__icon el-icon-arrow-up"></i>
          </span>
        </span>
      </template>
    </div>

    <!-- Poptip 内容 -->
    <div class="folder-filter-content">
      <!-- 文件夹树 -->
      <FolderTree
        :flag_refreshFolderTree="flag_refreshFolderTree"
        :defaultCheckedKeys="folderIdList"
        :checkable="true"
        :checkAll="checkAll"
        :expandAll="expandAll"
        ref="folderTree"
        @checkFolder="handleCheckFolder"
        @defaultCheckAll="handleDefaultCheckAll"
        class="folder-filter-tree"
      ></FolderTree>

      <!-- 底部按钮 -->
      <div class="folder-filter-footer">
        <Button @click="resetChecked" type="minor" size="small">{{
          $t('aiToolBar.claer')
        }}</Button>
        <Button @click="cancel" type="minor" size="small">{{
          $t('aiToolBar.cancel')
        }}</Button>
        <Button type="success" size="small" @click="confirm">{{
          $t('aiToolBar.confirm')
        }}</Button>
      </div>
    </div>
  </Poptip>
</template>

<script>
import FolderTree from './folderTree.vue'

export default {
  name: 'folderFilter',
  components: {
    FolderTree,
  },
  props: {
    // 已选中的文件夹列表
    folderIdList: {
      type: Array,
      default: () => [],
    },
    // 是否必选
    mustInput: {
      type: Boolean,
      default: false,
    },
    // 是否展开所有文件夹
    expandAll: {
      type: Boolean,
      default: false,
    },
    // 是否默认选中所有文件夹
    checkAll: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      /* 全局 */
      // 筛选标题
      title: '',
      // 搜索词
      // keywords: '',

      /* 文件夹树 */
      // 树选中结点
      checkFolderIds: [],
      // 控制文件夹树刷新
      flag_refreshFolderTree: 1,
    }
  },
  methods: {
    /* 全局 */
    // 弹出显示回调
    handleShow() {
      // 刷新文件夹树
      // this.flag_refreshFolderTree++;
    },

    // 文件夹树选中结点
    handleCheckFolder(checkedNodes) {
      // 需要过滤掉全选中的节点下面的子结点
      // checkedNodes 来源于 el-tree 的 getCheckedNodes 方法返回, 它不会返回半选中的结点
      // 但手动选中父结点的所有子结点后, 它会连同选中的子结点和父结点一起返回
      // 与产品(邓朋)确认了, 此时只需要选中父结点, 以后父结点下再有新增的子结点, 自动勾选也没问题

      // 暂存所有结点的 id
      const checkedNodeIds = checkedNodes.map((item) => item.id)
      // 过滤掉数组中的子结点(半选中结点不会返回, 因此直接去掉所有父结点也在选中节点数组中的子结点)
      const filteredNodes = checkedNodes.filter(
        (item) => !checkedNodeIds.includes(item.parentDirId)
      )

      // 更新数据
      this.checkFolderIds = filteredNodes.map((item) => item.id)
      this.title = filteredNodes.map((item) => item.fileName).join(',')
    },
    // 处理文件夹树默认全选事件
    // 默认全选后, 触发了 checkFolder , 经过 handleCheckFolder 得到了全选后的数据, 直接以此数据更新选中数据, 达到 confirm 效果
    handleDefaultCheckAll() {
      if (this.checkFolderIds.length) {
        this.$emit('update:folderIdList', this.checkFolderIds.slice())
      }
    },

    /* footer */
    confirm() {
      // 如果是必填, 但是没有选中任何文件夹, 则提示, return
      if (this.mustInput && !this.checkFolderIds.length) {
        this.$Message.warning(
          this.$t('aiToolBar.frontAi.placeholder_selectFolder')
        )
        return
      }

      this.$emit('update:folderIdList', this.checkFolderIds.slice())
      this.closePoptip()
    },
    cancel() {
      this.$emit('update:folderIdList', this.folderIdList.slice())
      // 关闭弹窗
      this.closePoptip()
    },
    // 清空
    resetChecked() {
      this.$refs.folderTree.$refs.tree.setCheckedKeys([])
    },
    closePoptip() {
      this.$refs.poptip.doClose()
    },
  },
  created() {},
  mounted() {
    if (this.folderIdList.length) {
      this.title = this.folderIdList.join(',')
    }
  },
}
</script>

<style lang="less">
.folder-filter-popper {
  z-index: 3500 !important;
}

.folder-filter-trigger {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #cbd6e2;
  border-radius: 4px;
  padding: 0 8px;
  line-height: 32px;
  font-size: 12px;
  cursor: pointer;
}

.folder-filter-title {
  color: #333;
  line-height: 18px;
  padding: 0px 8px;
  width: 100%;
}

.folder-filter-tree {
  height: 321px;
  overflow: auto;
}

.folder-filter-footer {
  margin-top: 20px;
  text-align: right;
}
</style>
