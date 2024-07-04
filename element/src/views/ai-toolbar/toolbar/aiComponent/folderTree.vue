<template>
  <div class="folderTree">
    <div>
      <!-- 新建根节点文件夹 -->
      <div
        v-if="
          operateType === 'new' &&
          operatingNodeData &&
          operatingNodeData.id === -1
        "
        class="folderTree-addNewRootNode el-tree-node is-focusable"
      >
        <div class="el-tree-node__content" style="padding-left: 0px">
          <span
            class="is-leaf el-tree-node__expand-icon custom custom-menu-arrow-forward"
          ></span>
          <span class="folderTree-treeNode">
            <svg class="svg-icon custom folderTree-treeNode-icon">
              <use xlink:href="#custom-fp-paper-file"></use>
            </svg>
            <div class="folderTree-treeNode-title">
              <Input
                v-model="editingFolderName"
                size="mini"
                :id="editingInputElId"
                @click.native.stop
              ></Input>
            </div>
            <div class="folderTree-treeNode-editInput-operate">
              <Icon
                custom="custom-queren"
                @click.stop="handle_submit"
                class="folderTree-treeNode-operateBtn"
              ></Icon>
              <Icon
                custom="custom-shanchu"
                @click.stop="handle_cancelEdit"
                class="folderTree-treeNode-operateBtn"
              ></Icon>
            </div>
          </span>
        </div>
      </div>

      <Tree
        v-if="!loadingTree"
        :data="treeData"
        :props="treeProps"
        lazy
        :load="loadData"
        :render-content="renderContent"
        node-key="id"
        :default-expanded-keys="defaultExpandedKeys"
        :expand-on-click-node="false"
        :show-checkbox="checkable"
        :default-expand-all="expandAll"
        :default-checked-keys="defaultCheckedKeys"
        :draggable="draggable"
        :allow-drop="allowDrop"
        :allow-drag="allowDrag"
        icon-class="custom custom-menu-arrow-forward"
        ref="tree"
        @node-drop="handleDrop"
        @node-expand="handleExpand"
        @node-collapse="handleCollapse"
        @check-change="handleCheckChange"
      ></Tree>
    </div>

    <!-- 删除文件夹 -->
    <DeleteFolder
      :visible.sync="visible_delete"
      :folderData="operatingNodeData"
      @deleteSuccess="handleRemoveSuccess"
    ></DeleteFolder>
  </div>
</template>

<script>
import {
  getFolderList,
  moveFolder,
  newFolder,
  editFolder,
} from '../../api/aiApi'
import DeleteFolder from './deleteFolder.vue'
import store from '../../../../store'

export default {
  name: 'folderTree',
  components: {
    DeleteFolder,
  },
  props: {
    // 是否选中第一个文件夹
    selectFirst: {
      type: Boolean,
      default: false,
    },
    // 控制文件夹树刷新
    flag_refreshFolderTree: {
      type: Number,
      default: 0,
    },
    // 是否显示复选框
    checkable: {
      type: Boolean,
      default: false,
    },
    // 是否默认选中所有文件夹
    checkAll: {
      type: Boolean,
      default: false,
    },
    // 默认选中节点数组
    defaultCheckedKeys: {
      type: Array,
      default: () => [],
    },
    expandAll: {
      type: Boolean,
      default: false,
    },
    // 外部传入 flag , 指定要求添加根目录文件夹
    flag_addRootFolder: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    // 按钮权限集合
    authorized_button() {
      const buttonIds = BUTTON_IDS.enterpriseGPT.knowledgeBase
      return {
        newFolder: !HANDLE_BUTTON(buttonIds.newFolder, this.button_list),
        editFolder: !HANDLE_BUTTON(buttonIds.editFolder, this.button_list),
        deleteFolder: !HANDLE_BUTTON(buttonIds.deleteFolder, this.button_list),
      }
    },
  },
  data() {
    return {
      /* 部门tree */
      loadingTree: false,
      // 部门筛选
      allFolderList: [],
      // tree
      treeData: [],
      treeProps: {
        label: 'fileName',
        isLeaf(data, node) {
          return data.hasChildren !== 1
        },
      },
      // 暂存已加载的全部数据, nodeId: node.children 形式
      allLoadedData: {},
      // 当前操作的数据
      operatingNodeData: null,
      // 操作类型, 新增/编辑
      operateType: '',
      // 当前正在编辑的文件夹名称
      editingFolderName: '',
      selectedNodeData: null,
      // 默认展开树节点的key的数组
      defaultExpandedKeys: [],
      // 当前展开的树节点的key的数组
      expandedIdList: [],

      /* 添加/编辑部门 */
      loading: false,
      visible_new: false,

      /* 删除部门 */
      visible_delete: false,

      // new
      userId: '',
      userName: '',
      enterpriseId: '',
      window_height: '',
      button_list: '',
    }
  },
  methods: {
    /* 数据加载 */
    // 部门树初始化
    async refreshData() {
      this.loadingTree = true
      // 设置当前展开的节点为树的默认展开节点, 保持节点的展开状态
      this.defaultExpandedKeys = this.expandedIdList.slice()
      this.treeData = await this.getFolderData(-1)
      this.loadingTree = false
    },
    getFolderData(parentId, pageNo = 1, pageSize = 15) {
      return new Promise((resolve, reject) => {
        getFolderList({
          orgId: this.enterpriseId,
          userId: this.userId,
          parentDirId: parentId,
          pageNum: pageNo,
          pageSize: pageSize,
        })
          .then(async (res) => {
            if (res.code === 1) {
              const result = Array.isArray(res.data.list) ? res.data.list : []
              if (res.data.pages > pageNo) {
                const afterArr = await this.getFolderData(
                  parentId,
                  pageNo + 1,
                  pageSize
                )
                resolve(result.concat(afterArr))
              } else {
                // 当前节点的数据请求完毕后, 将它从默认展开节点数据中去掉, 避免节点无法收起
                this.defaultExpandedKeys = this.defaultExpandedKeys.filter(
                  (item) => item !== parentId
                )
                resolve(result)
              }
            } else {
              // 当前节点的数据请求完毕后, 将它从默认展开节点数据中去掉, 避免节点无法收起
              this.defaultExpandedKeys = this.defaultExpandedKeys.filter(
                (item) => item !== parentId
              )
              this.$Message.error(
                '获取文件夹数据出错，文件夹树为空或数据不完整，请稍后重试'
              )
              resolve([])
            }
          })
          .catch((error) => {
            console.error(error)
            // 当前节点的数据请求完毕后, 将它从默认展开节点数据中去掉, 避免节点无法收起
            this.defaultExpandedKeys = this.defaultExpandedKeys.filter(
              (item) => item !== parentId
            )
            this.$Message.error(
              '获取文件夹数据出错，文件夹树为空或数据不完整，请稍后重试'
            )
            resolve([])
          })
      })
    },
    // 数据节点懒加载
    async loadData(node, resolve) {
      let data = []
      if (node.level === 0) {
        // 等于 0 就是初始化
        data = await this.getFolderData(-1)
        this.allLoadedData[-1] = data

        // 如果没有已选中的文件夹, 又要求默认勾选所有文件夹, 则直接选中所有一级文件夹
        let checkAllFlag = false
        if (!this.defaultCheckedKeys.length && this.checkAll) {
          this.$refs.tree.setCheckedKeys(data.map((item) => item.id))
          checkAllFlag = true
        }

        // 初始化完成后, 手动触发 checkChange 处理方法
        // 避免默认选中结点中只有父节点, el-tree 不 emit check-change 事件, 外部仍然显示为选中结点 id 而不是 name 字符串
        this.$nextTick(() => {
          this.handleCheckChange()

          // 触发默认全选文件夹事件, 通知父组件直接 confirm 更新数据
          // (上面的 handleCheckChange 已经更新了 folderFilter 组件暂存数据, 在它之后触发 confirm 让父组件向外 $emit 保存数据)
          if (checkAllFlag) {
            this.$emit('defaultCheckAll')
          }
        })

        // 如果当前没有选中结点, 且指定要求默认选中第一个文件夹, 则自动选中第一个文件夹
        if (
          !(this.selectedNodeData && this.selectedNodeData.id) &&
          this.selectFirst &&
          data.length > 0
        ) {
          this.selectedNodeData = data[0]
          this.selectFolder()
        }
      }
      if (node.level >= 1) {
        data = await this.getFolderData(node.data.id)
        this.allLoadedData[node.data.id] = data
      }

      // 如果此时正在该 node 下新建文件夹
      if (
        this.operateType === 'new' &&
        this.operatingNodeData &&
        this.operatingNodeData.id === node.data.id
      ) {
        // 插入待新建的文件夹临时节点
        const newFolderNodeData = {
          id: 'new',
          hasChildren: 0,
        }
        data.unshift(newFolderNodeData)
        if (node.data.hasChildren === 0) {
          node.data.hasChildren = 1
        }
      }

      return resolve(data)
    },

    // 部门树渲染
    renderContent(h, { root, node, data }) {
      // 新建编辑文件夹时, 显示输入框
      let editFolderInput
      if (
        (this.operateType === 'edit' &&
          this.operatingNodeData &&
          this.operatingNodeData.id === data.id) ||
        (this.operateType === 'new' &&
          this.operatingNodeData &&
          data.id === 'new')
      ) {
        this.editingInputElId = `editingInput${Date.now()}`
        editFolderInput = h('Input', {
          props: {
            value: this.editingFolderName,
            size: 'mini',
          },
          attrs: {
            id: this.editingInputElId,
          },
          on: {
            input: (val) => {
              this.editingFolderName = val
            },
            // blur: () => {
            //     this.handle_submit(data);
            // }
          },
          nativeOn: {
            click: (e) => {
              e.stopPropagation()
            },
          },
        })
        setTimeout(() => {
          this.focusInput()
        }, 100)
      }

      return h(
        'span',
        {
          on: {
            click: (event) => {
              // 当前显示复选框, 处于非编辑状态, 不允许对结点做操作
              if (this.checkable) {
                return false
              }

              // 点击新增文件夹节点, 不做任何操作
              if (data.id === 'new') {
                return false
              }

              this.selectedNodeData = data
              this.selectFolder()
            },
          },
          class: {
            'folderTree-treeNode': true,
            'folderTree-treeNode__active':
              this.selectedNodeData && this.selectedNodeData.id === data.id,
          },
        },
        [
          h(
            'svg',
            {
              class: 'svg-icon custom folderTree-treeNode-icon',
              'aria-hidden': true,
            },
            [
              h('use', {
                attrs: {
                  'xlink:href': '#custom-fp-paper-file',
                },
              }),
            ]
          ),
          h(
            'div',
            {
              class: 'folderTree-treeNode-title',
            },
            [
              editFolderInput ||
                h(
                  'TooltipAuto',
                  {
                    props: {
                      placement: 'bottom-start',
                      content: data.fileName,
                    },
                  },
                  [h('span', data.fileName)]
                ),
            ]
          ),
          editFolderInput ||
          this.checkable ||
          !(
            this.authorized_button.newFolder ||
            this.authorized_button.editFolder ||
            this.authorized_button.deleteFolder
          )
            ? undefined
            : h(
                'div',
                {
                  class: 'folderTree-treeNode-operate',
                },
                [
                  this.authorized_button.editFolder ||
                  this.authorized_button.deleteFolder
                    ? h(
                        'Poptip',
                        {
                          props: {
                            trigger: 'hover',
                            openDelay: 500,
                            placement: 'bottom-start',
                            popperClass: 'folderTree-treeNode-operate-pop',
                          },
                        },
                        [
                          h('Icon', {
                            slot: 'reference',
                            props: {
                              custom: 'custom custom-gengduo3',
                              size: 26,
                            },
                            class: 'folderTree-treeNode-operateBtn',
                          }),
                          h('div', [
                            h('ul', [
                              this.authorized_button.editFolder
                                ? h(
                                    'li',
                                    {
                                      on: {
                                        click: (e) => {
                                          e.stopPropagation()
                                          this.handleEdit(data)
                                        },
                                      },
                                    },
                                    '编辑'
                                  )
                                : undefined,
                              this.authorized_button.deleteFolder
                                ? h(
                                    'li',
                                    {
                                      on: {
                                        click: (e) => {
                                          e.stopPropagation()
                                          this.handleRemove(data)
                                        },
                                      },
                                    },
                                    '删除'
                                  )
                                : undefined,
                            ]),
                          ]),
                        ]
                      )
                    : undefined,
                  this.authorized_button.newFolder
                    ? h('Icon', {
                        props: Object.assign(
                          {},
                          {
                            custom: 'custom custom-add',
                          }
                        ),
                        nativeOn: {
                          click: (e) => {
                            e.stopPropagation()
                            this.handleNew(data, node)
                          },
                        },
                        class: 'folderTree-treeNode-operateBtn',
                      })
                    : undefined,
                  // h('Icon', {
                  //     props: Object.assign({}, {
                  //         custom: 'custom custom-field-edit'
                  //     }),
                  //     nativeOn: {
                  //         click: (e) => {
                  //             e.stopPropagation();
                  //             this.handleEdit(data);
                  //         }
                  //     },
                  //     class: 'folderTree-treeNode-operateBtn'
                  // }),
                  // h('Icon', {
                  //     props: Object.assign({}, {
                  //         custom: 'custom custom-field-delete'
                  //     }),
                  //     nativeOn: {
                  //         click: (e) => {
                  //             e.stopPropagation();
                  //             this.handleRemove(data);
                  //         }
                  //     },
                  //     class: 'folderTree-treeNode-operateBtn'
                  // })
                ]
              ),
          editFolderInput
            ? h(
                'div',
                {
                  class: 'folderTree-treeNode-editInput-operate',
                },
                [
                  h('Icon', {
                    props: {
                      custom: 'custom-queren',
                    },
                    nativeOn: {
                      click: (e) => {
                        e.stopPropagation()
                        this.handle_submit()
                      },
                    },
                    class: 'folderTree-treeNode-operateBtn',
                  }),
                  h('Icon', {
                    props: {
                      custom: 'custom-shanchu',
                    },
                    nativeOn: {
                      click: (e) => {
                        e.stopPropagation()
                        this.handle_cancelEdit()
                      },
                    },
                    class: 'folderTree-treeNode-operateBtn',
                  }),
                ]
              )
            : undefined,
        ]
      )
    },
    // 节点展开
    handleExpand(data, node, instance) {
      this.expandedIdList.push(data.id)
    },
    // 节点收起
    handleCollapse(data, node, instance) {
      this.expandedIdList = this.expandedIdList.filter(
        (item) => item !== data.id
      )
    },
    // 添加子节点
    handleNew(data, node) {
      // 如果当前已处于操作状态, 则不允许触发新建
      if (this.operateType && this.operatingNodeData) {
        this.focusInput()
        return
      }

      // 最多只能添加 8 层文件夹
      if (
        data.parentDirPath.split('/').filter((item) => item !== '').length + 2 >
        8
      ) {
        this.$Message.warning('添加失败，最多添加8级文件夹')
        return
      }

      this.operatingNodeData = data
      this.operateType = 'new'
      // this.visible_new = true;
      this.editingFolderName = ''

      // 插入待新建的文件夹临时节点
      const newFolderNodeData = {
        id: 'new',
        hasChildren: 0,
      }
      if (this.allLoadedData[data.id] && this.allLoadedData[data.id][0]) {
        // 已经加载有子结点数据, 直接在首个子结点前插入临时节点
        this.$refs.tree.insertBefore(
          newFolderNodeData,
          this.allLoadedData[data.id][0].id
        )
      } else {
        // 重新展开节点, 触发 load 请求子结点数据, 在此过程中插入临时节点
        node.loaded = false
        node.expand()
      }
    },
    // 修改节点
    handleEdit(data) {
      // 如果当前已处于操作状态, 则不允许触发编辑
      if (
        this.operateType &&
        this.operatingNodeData &&
        this.operatingNodeData.id
      ) {
        this.focusInput()
        return
      }

      this.operatingNodeData = data
      this.editingFolderName = data.fileName
      this.operateType = 'edit'
      // this.visible_new = true;
    },
    handleRemove(delNode) {
      this.operateType = 'delete'
      this.operatingNodeData = delNode
      this.visible_delete = true
    },
    // 复选框选中状态变更
    // 此处主要是为了获取到所有节点后发送给父组件, 让父组件拼装 name 字符串
    handleCheckChange() {
      this.$emit('checkFolder', this.$refs.tree.getCheckedNodes())
    },

    // 选中文件夹
    selectFolder() {
      if (this.selectedNodeData && this.selectedNodeData.id) {
        setTimeout(() => {
          this.$refs.tree.setCurrentKey(this.selectedNodeData.id)
        }, 0)
      }
      this.$emit('selectFolder', this.selectedNodeData)
    },

    /* 拖拽相关 */
    // 是否开启拖拽节点功能
    draggable() {
      // 无拖拽权限, 不允许拖拽
      if (!this.authorized_button.editFolder) {
        return false
      }

      // 当前显示复选框, 处于非编辑状态, 不允许对结点做操作
      if (this.checkable) {
        return false
      }

      return true
    },
    // 节点是否允许被拖拽
    allowDrag(draggingNode) {
      // 无拖拽权限, 不允许拖拽
      if (!this.authorized_button.editFolder) {
        return false
      }

      // 当前显示复选框, 处于非编辑状态, 不允许对结点做操作
      if (this.checkable) {
        return false
      }

      return true
    },
    // 拖拽时判定目标节点能否被放置
    allowDrop(draggingNode, dropNode, type) {
      // 无拖拽权限, 不允许拖拽
      if (!this.authorized_button.editFolder) {
        return false
      }

      // 当前显示复选框, 处于非编辑状态, 不允许对结点做操作
      if (this.checkable) {
        return false
      }

      return true
    },
    // 拖拽完毕
    // 被拖拽节点, 目标节点, 拖拽类
    handleDrop(draggingNode, dropNode, dropType, ev) {
      // 无拖拽权限, 不允许拖拽
      if (!this.authorized_button.editFolder) {
        return false
      }

      // 暂存节点数据
      const draggingNodeData = draggingNode.data
      const dropNodeData = dropNode.data

      // 拼接数据
      const postData = {
        orgId: this.enterpriseId,
        userId: this.userId,
        fileId: draggingNodeData.id,
        sourceParentId: draggingNodeData.parentDirId,
        sourcePreId: draggingNodeData.preId,
        isDir: 1,
        version: draggingNodeData.version + 1,
        // 待移动的文件夹名称
        fileName: draggingNodeData.fileName,
      }
      switch (dropType) {
        case 'before':
          // 拖拽到目标节点前面
          postData.targetParentId = dropNodeData.parentDirId
          postData.targetParentDirPath = dropNodeData.parentDirPath
          postData.targetPreId =
            dropNodeData.preId === -1 ? -1 : dropNodeData.preId
          break
        case 'after':
          // 拖拽到目标节点后面
          postData.targetParentId = dropNodeData.parentDirId
          postData.targetParentDirPath = dropNodeData.parentDirPath
          postData.targetPreId = dropNodeData.id
          break
        case 'inner':
          // 拖拽到目标节点内部
          postData.targetParentId = dropNodeData.id
          postData.targetParentDirPath = dropNodeData.parentDirPath
          postData.targetPreId = dropNodeData.id

          // 加入父级结点到展开结点列表中, 避免拖拽完毕后结点不直接显示出来
          this.expandedIdList.push(dropNodeData.id)
          break
      }

      // 请求接口, 调整顺序成功后刷新树结构
      this.loadingTree = true
      moveFolder(postData)
        .then(async (res) => {
          if (res.code !== 1) {
            switch (res.code) {
              case 1013:
                this.$Message.error('文件级别超过8级，无法拖动。')
                break
              default:
                this.$Message.error('移动文件夹失败，文件夹树结构可能已变动。')
                break
            }
          }

          // 成功失败, 都重新刷新树结构
          this.refreshData()
        })
        .catch((error) => {
          console.error(error)
          this.$Message.error('移动文件夹失败，文件夹树结构可能已变动。')
          this.refreshData()
        })
    },

    /* 新增/编辑文件夹 */
    // 确认
    handle_submit() {
      // 如果输入内容为空, 弹出提示, 停止向下继续执行
      if (!this.editingFolderName.trim()) {
        this.$Message.error('文件夹名称不能为空')
        this.focusInput()
        return
      }
      // 如果输入内容长度超过字符数限制, 弹出提示, 停止向下继续执行
      if (this.editingFolderName.length > 30) {
        this.$Message.error('文件夹名称长度超过30字符上限')
        this.focusInput()
        return
      }

      // 发送请求
      this.loading = true
      let req_folder
      let type
      let postData = {
        orgId: this.enterpriseId,
        userId: this.userId,
        fileName: this.editingFolderName,
      }
      if (this.operateType === 'edit') {
        // 编辑
        type = 'edit'
        postData = Object.assign({}, postData, {
          parentDirId: this.operatingNodeData.parentDirId,
          fileId: this.operatingNodeData.id,
          version: this.operatingNodeData.version,
        })
        req_folder = editFolder(postData)
      } else {
        // 新建
        postData = Object.assign({}, postData, {
          parentDirId: this.operatingNodeData ? this.operatingNodeData.id : -1,
          preId: this.operatingNodeData ? this.operatingNodeData.id : -1,
          isDir: 1,
          version: 1,
        })
        req_folder = newFolder(postData)
      }
      req_folder
        .then((res) => {
          if (res.code === 1) {
            this.$Message.success(type === 'edit' ? '编辑成功' : '添加成功')
            this.handleSaveSuccess(postData)
          } else if (res.code === 1020) {
            // 文件夹名称已存在
            this.$Message.error('该文件夹名称已存在，请重新调整名称')
            this.focusInput()
          } else {
            this.$Message.error(type === 'edit' ? '编辑失败' : '添加失败')
            this.focusInput()
          }
          this.loading = false
        })
        .catch((err) => {
          console.error(err)
          this.$Message.error(type === 'edit' ? '编辑失败' : '添加失败')
          this.loading = false
          this.focusInput()
        })
    },
    // 新建/编辑输入框, 重新获取焦点
    focusInput() {
      const inputEl = document.getElementById(this.editingInputElId)
      inputEl && inputEl.focus()
    },
    // 保存成功
    handleSaveSuccess(newNodeData) {
      // // 更新数据
      // this.operatingNodeData.children.push(newNodeData);

      // // 更新树结构
      // this.$refs.tree.append(this.operatingNodeData, newNodeData);

      // 新增时, 加入父级结点到展开结点列表中, 避免新增完毕后结点不直接显示出来
      if (newNodeData && newNodeData.parentDirId) {
        this.expandedIdList.push(newNodeData.parentDirId)
      }

      // 直接整个更新树结构
      this.refreshData()

      // 清空操作数据
      this.operatingNodeData = null
    },
    // 取消新增/编辑
    handle_cancelEdit() {
      // 取消新增, 则需要删除临时插入的新增节点
      if (this.operateType === 'new') {
        // 删除节点
        this.$refs.tree.remove('new')
        // 删除 allLoadedData 中的数据
        if (
          this.operatingNodeData &&
          this.operatingNodeData.id &&
          this.allLoadedData[this.operatingNodeData.id]
        ) {
          this.allLoadedData[this.operatingNodeData.id] = this.allLoadedData[
            this.operatingNodeData.id
          ].filter((item) => item.id !== 'new')
        }
      }

      // 取消新增/编辑, 统一清空操作数据
      this.operatingNodeData = null
      this.operateType = ''
      this.editingFolderName = ''
    },

    /* 删除文件夹 */
    handleRemoveSuccess(delNode) {
      // 数据暂存
      // 被删除节点的 id
      const delNodeId = this.operatingNodeData.id
      // 被删除节点的父节点的 id
      const delNodeParentId = this.operatingNodeData.parentDirId
      // 父级文件夹的所有子文件夹
      const siblings = this.allLoadedData[delNodeParentId]

      // 如果要删除的文件夹是当前正在显示的文件夹或是它的父级
      if (
        this.selectedNodeData &&
        (delNodeId === this.selectedNodeData.id ||
          this.selectedNodeData.parentDirPath
            .split('/')
            .includes(`${delNodeId}`))
      ) {
        // 优先显示同级文件夹, 无则显示父级文件夹, 还是无则显示父级的同级文件夹, 优先显示后面的文件夹, 无则显示第一个

        // flag: 是否成功切换节点
        let updated = false
        // 获取要删除的文件夹在同级文件夹中的位置
        const delNodeIndex = siblings.findIndex((item) => item.id === delNodeId)
        if (delNodeIndex !== -1) {
          if (delNodeIndex !== siblings.length - 1) {
            // 不是同级最后一个文件夹, 选中同级的下一个文件夹

            // 选中结点
            this.selectedNodeData = siblings[delNodeIndex + 1]
            this.selectFolder()
            // 设置 flag
            updated = true
          } else if (delNodeIndex !== 0) {
            // 不是同级第一个文件夹, 选中同级的第一个文件夹

            // 选中结点
            this.selectedNodeData = siblings[0]
            this.selectFolder()
            // 设置 flag
            updated = true
          } else if (delNodeParentId !== -1) {
            // 同级就这一个文件夹, 选中父文件夹

            const parentNode = this.$refs.tree.getNode(delNodeParentId)
            if (parentNode) {
              // 选中结点
              this.selectedNodeData = parentNode.data
              this.selectFolder()
              // 设置 flag
              updated = true
            }
          }
        }

        if (!updated) {
          // 未成功切换节点

          // 清空数据
          this.selectedNodeData = null
          this.selectFolder()
          // 直接整个更新树结构
          this.refreshData()
        }
      }

      // 删除节点
      this.$refs.tree.remove(this.operatingNodeData.id)
      // 删除节点数据
      siblings.splice(
        siblings.findIndex((item) => item.id === delNodeId),
        1
      )
      // 清空操作数据
      this.operatingNodeData = null
      this.operateType = ''
    },
  },
  created() {
    const { userId, userName, enterpriseId, window_height } = store.state
    this.userId = userId
    this.userName = userName
    this.enterpriseId = enterpriseId
    this.window_height = window_height
    this.button_list = store.state.app.button_list
  },
  mounted() {},
  watch: {
    flag_refreshFolderTree(val) {
      this.refreshData()
    },
    defaultCheckedKeys: {
      handler(val) {
        if (Array.isArray(val)) {
          setTimeout(() => {
            this.$refs.tree.setCheckedKeys(val)
          }, 0)
        }
      },
      immediate: true,
    },
    flag_addRootFolder(val) {
      // 如果当前已处于操作状态, 则不允许触发新建
      if (this.operateType && this.operatingNodeData) {
        this.focusInput()
        return
      }

      this.editingInputElId = `editingInput${Date.now()}`
      this.operatingNodeData = {
        id: -1,
      }
      this.operateType = 'new'
      this.editingFolderName = ''
      setTimeout(() => {
        this.focusInput()
      }, 100)
    },
  },
}
</script>

<style lang="less">
.folderTree {
  .el-tree {
    min-width: 100%;
    display: inline-block !important;
  }

  .el-tree-node {
    width: 245px;

    &.is-current {
      > .el-tree-node__content {
        background-color: #f5f6f9 !important;
      }
    }
  }

  .el-tree-node__content {
    height: 28px;
    display: flex;
  }

  .el-tree-node__expand-icon {
    padding: 3px;
    color: #7b98b6;
    font-size: 12px;
    transform: scale(0.83);

    &.is-leaf {
      color: transparent;
    }

    &.expanded {
      transform: scale(0.83) rotate(90deg);
    }
  }

  &-treeNode {
    flex: 1;
    display: flex;
    align-items: center;
    position: relative;

    &-icon {
      font-size: 16px;
      margin: 0 4px 0 2px;
    }

    &-title {
      flex: 1;
      width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #333;
      font-size: 14px;
      line-height: 22px;

      .el-input {
        height: 31px;
      }
    }

    &-operate {
      display: none;
      overflow: hidden;
    }

    &-operate-pop {
      min-width: 80px;
      margin-top: 0 !important;
      padding: 10px 0;

      li {
        padding: 6px 12px;
        cursor: pointer;

        &:hover {
          background-color: #f3f4f7;
        }
      }
    }

    &-operateBtn {
      font-size: 14px;
      color: #677f99;
      cursor: pointer;
      display: inline-block;
      margin-right: 8px;

      &:not(:last-child) {
        margin-right: 8px;
      }
    }

    &__active {
      .folderTree-treeNode-title {
        color: #4285f4;
      }
    }

    &:hover {
      .folderTree-treeNode-operate {
        display: block;
      }
    }
  }
}

.folderTree-treeNode-operate-pop {
  color: #333;
}

.folderTree-treeNode-editInput-operate {
  margin-left: 13px;

  .folderTree-treeNode-operateBtn {
    &:not(:last-child) {
      margin-right: 14px;
    }
  }
}
</style>
