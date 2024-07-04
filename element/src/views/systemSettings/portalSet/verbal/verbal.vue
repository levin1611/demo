<template>
    <div class="verbalflag">
        <!-- 正体 -->
        <Row>
            <!-- 左侧组织架构 -->
            <Col :span="5" style="padding-left: 30px;border-right: 1px solid #e8eaec;">
                <!-- 标题 -->
                <div class="title">{{$t('portal_set.verbal_classification')}}</div>

                <!-- 部门筛选 -->
                <Select class="verbalSelect" v-model="selected_department_label" filterable @change="search_tree" style="padding-right: 30px; margin-bottom: 12px;"
                        :placeholder="$t('portal_set.classificationName')">
                    <Option v-for="item in all_department" :value="item.value" :key="item.value" :label="item.label"></Option>
                </Select>

                <!-- 部门tree -->
                <div :style="{ height: `${table_height + 22}px`, overflow:'hidden', width: '100%' }">
                    <div :style="{ height: `${table_height - 26}px`, overflow: 'auto' ,fontSize: '12px'}">
                        <Tree :data="organization_structure"
                              :render-content="renderContent"
                              node-key="id"
                              :default-expanded-keys="expandedIdList"
                              :expand-on-click-node="false"
                              @node-expand="tree_node_expand"
                              @node-collapse="tree_node_collapse"></Tree>
                    </div>
                </div>
            </Col>

            <!-- 右侧用户列表 -->
            <Col :span="19" style="padding: 0 30px;">
                <!-- 操作栏 -->
                <div class="datewrap" style="height: 50px;line-height: 50px;position: relative;">
                    <!-- 多选操作视图 -->
                    <template v-if="visible_batch_operate">
                        <div style="display: inline-block;color: rgba(0, 0, 0, .8);margin-bottom: -15px;">{{
                            $t('crm.Table.selected') }} <span style="font-weight: bolder;color: #4285F4;">{{ selected_users.length }}</span>
                            {{ selected_users.length > 1 ? $t('crm.Table.item_users') : $t('crm.Table.item_user') }}
                            <!-- 编辑用户 -->
                            <Button v-if="selected_users.length === 1" customIcon="custom custom-field-edit" type='text'
                                    @click="open_update_modal(false)"
                                    class="tree_icon">{{$t('portal_set.edit_verbal')}}
                            </Button>
                            <Button customIcon="custom custom-field-delete" type='text'
                                    @click="delete_script(true)"
                                    class="tree_icon">{{$t('portal_set.delete_verbal')}}
                            </Button>
                        </div>

                        <!-- 清空已选 -->
                        <span class="_btns_text_ml">
                            <Button type="text" @click="clear_selected_users">
                                <Icon type="md-close" size="18"></Icon>
                            </Button>
                        </span>
                    </template>

                    <!-- 正常视图 -->
                    <template v-else>
                        <!-- 标题 -->
                        <span class="title" style="font-weight: bold;">
                            {{$t('portal_set.verbal_list')}}
                        </span>
                        &nbsp;&nbsp;&nbsp;
                        <!-- 筛选标签 -->
                        <FilterTags
                                :order_column="order_column"
                                :order_type="order_type"
                                :storageName_orderColumn="storageName_orderColumn"
                                :filterConObj.sync="config_tableFilter"
                                :langObj="langObj"
                                :width="600"
                                :removeWidth="850"
                                :minWidth="700"
                                @change_filter_tag="change_filter_tag"
                                @emptySort="empty_sort"
                                @removeCon="remove_filter_tag"></FilterTags>

                        <!-- 新版按钮 -->
                        <div class="_btns_text_ml verbalStyle">
                            <!-- 新建客户 -->
                            <Button type='primary'
                                    @click='add_user'>{{$t('portal_set.add_script')}}</Button>
                        </div>
                    </template>
                </div>

                <!-- 表格页 -->
                <div class="table verbal_table">
                    <Table
                            ref="table"
                            v-if="flag_refreshColumn"
                            :data="tableData"
                            v-loading="loading"
                            :height="table_height"
                            highlight-current-row
                            :row-class-name="row_class_name"
                            :header-cell-class-name="cellClass"
                            :isCustom="true"
                            :customEmptyText="customEmptyTextLang"
                            customEmptyButtonText=""
                            :customClearMethod="clearFilterConditionByInitView"
                            :border="true"
                            @selection-change="handleSelectionChange"
                            @row-click="clickRow"
                            @mousemove.native="handleTableColHover"
                            @mousedown.native="handleTableColResizeStart"
                            @header-dragend="handleTableColResizeEnd"
                            class="tabmain noBoxShadow-right noborder-table resizable-table">
                            <!-- 选择列 -->
                            <TableColumn type="selection" width="55" :selectable='checkboxDisabled'></TableColumn>
                            <!-- 序号列 -->
                            <TableColumn type="index" :label="$t('portal_set.index')" width="110" prop="index"></TableColumn>
                            <!-- 正常列 -->
                                 <!-- :min-width="item.width || 64" -->
                            <TableColumn v-for="item in currentColumns"
                                 :key="item.key"
                                 align="left"
                                 :prop="item.key"
                                 :min-width="item.width"
                                 :label="item.title"
                                 :render-header="item.renderHeader"
                                 :show-overflow-tooltip="item.key !== 'name'">
                                <template slot-scope="scope">
                                    <template v-if="item.key === 'name'">
                                        <div v-if="scope.row.name">
                                            <span style="color:#495060; display:inline-block; white-space: break-spaces;">{{ scope.row.name }}</span>
                                        </div>
                                    </template>
                                    <template v-else>
                                        {{ scope.row[item.key] }}
                                    </template>
                                </template>
                            </TableColumn>
                            <!-- 末列字段配置按钮 -->
                            <!-- <TableColumn
                            align="center"
                            width="30"
                            fixed="right"
                            :resizable="false"
                            :render-header="renderHeader_editColumn"
                            class-name="no-padding-cell"
                            ></TableColumn> -->
                    </Table>
                    <div style="margin-right: 30px;overflow: hidden">
                        <Page :page-size="pageSize" :page-sizes="pageSizeOpts"
                              @size-change="pageSizeChange"
                              :total="totalNum" class="pageWrap-right"
                              :current-page="curPage" @current-change="changePage"
                              layout="total, prev, pager, next, sizes, jumper"
                              placement="top"></Page>
                    </div>
                </div>
            </Col>
        </Row>

        <!-- 模态框 -->
        <!-- 添加用户 -->
        <add_modal :modal="add_modal"
                   :get_department="get_department"
                   height="100%"
                   :orgId="enterpriseId"
                   :createOrEditUser="selected_users.length > 0"
                   @change_add_modal="change_add_modal"
                   @get_add_user="get_add_user">
        </add_modal>

        <!-- 编辑用户 -->
        <updata_modal :modal="updata_modal"
                      :get_updata_info="get_updata_info"
                      :get_department="get_department"
                      height="100%"
                      :orgId="enterpriseId"
                      @change_updata_modal="change_updata_modal"
                      @get_add_user="get_add_user">
        </updata_modal>

        <!-- 添加部门 -->
        <add_tree :modal="add_tree"
                  :loading="tree_modal_loading"
                  :get_add_form="get_add_form"
                  @change_add_tree="change_add_tree"
                  @change_tree_loading="change_tree_loading"
                  @set_add_tree="set_add_tree">
        </add_tree>

        <!-- 编辑部门 -->
        <updata_tree :modal="updata_tree"
                     :loading="tree_updata_loading"
                     :get_updata_tree_info="get_updata_tree_info"
                     @change_updata_tree="change_updata_tree"
                     @change_tree_updata="change_tree_updata"
                     @set_updata_tree="set_updata_tree">
        </updata_tree>

        <!-- 删除部门 -->
        <delete_modal :modal="delete_modal"
                      :loading="delete_loading"
                      :delete_title="delete_title"
                      @change_delete_modal="change_delete_modal"
                      @change_delete_loading="change_delete_loading"
                      @set_remove="set_remove">
        </delete_modal>

        <!-- 修改字段 -->
        <EditColumns
                :visible.sync="visible_edit_columns"
                :columnType="columnType"
                :id.sync="id_column_show_order"
                :allColumns="allColumns"
                :allGroup="allGroup"
                :group.sync="group"></EditColumns>

        <!--删除话术-->
        <Modal
                :title="$t('portal_set.del_script')"
                :visible.sync="delete_script_modal"
                :modal-append-to-body="false"
                :close-on-click-modal="false"
        >
            <div>
                <div style="font-size: 16px;color: rgb(51, 51, 51);text-align: center;}">
                    {{$t('portal_set.can_delete')}}
                </div>
            </div>
            <div slot="footer">
                <Button  @click="delete_script(false)">{{$t('cancel')}}</Button>
                <Button type="primary" @click="lock_account(lock_target_account)">{{$t('confirm')}}</Button>
            </div>
        </Modal>

    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import add_modal from './add_modal';
    import add_tree from './add_tree';
    import updata_modal from './updata_modal';
    import updata_tree from './updata_tree';
    import delete_modal from './delete_modal';
    import EditColumns from '@/views/crm/Table/Components/Modal/editColumns';
    import FilterTags from '@/views/main-components/filter-tags';
    // import UserDetail from './components/user-datail.vue';
    import resetInitComponents from '@/mixins/resetComponentViewData';
    import tableColResize from '@/mixins/tableColResize';

    export default {
        mixins: [resetInitComponents, tableColResize],
        name: 'verbal',
        components: {
            add_modal,
            updata_modal,
            add_tree,
            updata_tree,
            delete_modal,
            EditColumns,
            FilterTags
            // UserDetail
        },
        computed: {
            ...mapState([
                'userId',
                'userName',
                'fullName',
                'enterpriseId',
                'window_height'
            ]), // 从 vuex 中获取属性
            visible_batch_operate() {
                return this.selected_users.length;
            },
            table_height() {
                let temp = this.window_height ? this.window_height - 156 : document.body.clientHeight - 156;
                if (temp < 200) {
                    temp = 200;
                }
                // 转 element-ui 时, 表格样式错误, 加上这句后解决, 具体错误原因暂时未看
                temp += this.loading ? 1 : 0;
                return temp;
            },
            allGroup() {
                return this.allColumns.map(item => item.key);
            }
        },
        data() {
            return {
                /* 多语言 */
                langObj: {
                    id: 'ID',
                    abbr: this.$t('portal_set.abbr'),
                    name: this.$t('portal_set.verbal_content'),
                    parentName: this.$t('portal_set.classification')
                },

                /* 部门tree */
                // 部门筛选
                all_department: [],
                // tree
                organization_structure: [
                    {
                        title: '全部话术',
                        expand: true,
                        id: 0,
                        num: null,
                        selected: true,
                        hierarchy: 0,
                        children: []
                    }
                ],
                get_tree_data: '',
                tree_expand: {},
                selected_department_id: 0,
                selected_department_label: '', // select必须要绑定的值，确认是否可以简化逻辑
                expandedIdList: [0], // 展开树节点的key的数组

                /* 表格数据处理 */
                loading: true, // 加载图标
                flag_refreshColumn: true, // 使用 v-if 刷新列表列顺序
                totalNum: 0,
                curPage: 1,
                pageSize: 50,
                maxPageNum: 1,
                pageSizeOpts: [50, 100, 200],
                tableData: [],
                currentColumns: [],
                allColumns: [
                    // {
                    //     title: this.$t('portal_set.index'),
                    //     key: 'index',
                    //     type: 'index',
                    //     width: 50,
                    //     align: 'center',
                    //     ellipsis: true
                    //     // fixed: 'left'
                    // },
                    {
                        title: this.$t('portal_set.abbr'),
                        key: 'abbr',
                        width: 170,
                        align: 'center',
                        ellipsis: true
                        // fixed: 'left'
                    },
                    {
                        title: this.$t('portal_set.verbal_content'),
                        key: 'name',
                        width: 280,
                        align: 'center',
                        ellipsis: true
                    },
                    {
                        title: this.$t('portal_set.classification'),
                        key: 'parentName',
                        width: 200,
                        align: 'center',
                        ellipsis: true
                    }
                ], // 表格全部列

                /* 多选操作 */
                selected_users: [],
                delete_script_modal: false,

                /* 新版表头筛选 */
                // 筛选配置
                config_tableFilter: {
                    id: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    abbr: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    name: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    }
                    // 'parentName': {
                    //     sort: false, // 是否允许排序
                    //     filter: true, // 是否允许筛选
                    //     filterType: 'string', // 筛选类型
                    //     query: '', // 筛选值
                    //     allList: null, // 所有可能的筛选条件
                    // },
                },
                // 表头筛选条件
                queryData: {},
                // 排序
                order_column: '',
                order_type: '',
                storageName_orderColumn: '',

                /* 修改字段 */
                visible_edit_columns: false,
                columnType: 14, // 字段所属模块 1客户2联系人3询盘4公海客户5线索6公海线索7fbleads8权限部门用户管理
                id_column_show_order: undefined,
                group: [],
                // 保存到后端的字段属性, 目前只有 width
                fieldStyle: {},

                /* 新建用户 */
                add_modal: false,
                get_department: [],

                /* 编辑用户 */
                updata_modal: false,
                get_updata_info: {},

                /* 添加部门 */
                add_tree: false,
                tree_modal_loading: false,
                get_add_form: {},

                /* 编辑部门 */
                updata_tree: false,
                tree_updata_loading: false,
                get_updata_tree_info: {},

                /* 删除部门 */
                delete_modal: false,
                delete_loading: false,
                delete_title: {},

                /* 分配权限 */
                allocation_modal: false,
                get_functional: {},
                get_user_list: [],


                /* 用户列表详情页 */
                showDetail: false, // 是否显示用户详情页
                currentRow: {}, // 当前点击行的数据
                currentUserId: 0 // 当前选中用户的id
            };
        },
        methods: {
            // 末列字段配置按钮
            renderHeader_editColumn(h) {
                return h('div', {
                    style: {
                        'margin-bottom': '17px'
                    }
                }, [
                    h('Icon', {
                        props: {
                            custom: 'custom-table-edit-columns',
                            size: 18,
                            color: '#c3cdd9'
                        },
                        class: 'cursor-pointer',
                        nativeOn: {
                            click: this.edit_columns
                        }
                    })
                ]);
            },
            // 给全选框加类名
            cellClass({ column, columnIndex }) {
                const result = [];
                // 如果可调整列宽, 则设置相应 class
                if (column.resizable) {
                    result.push('resizable-col');
                }

                if (columnIndex === 0) {
                    result.push('DisableSelection');
                }

                return result.join(' ');
            },
            // 复选框是否禁用
            checkboxDisabled(row, index) {
                if (row.common === '1') {
                    return false; // 禁用
                } else {
                    return true; // 不禁用
                }
            },
            handleSelectionChange(val) {
                this.selected_users = val;
            },
            delete_script(flag) {
                this.delete_script_modal = flag;
            },
            /* 部门tree */
            // 部门筛选
            search_tree(val) {
                this.selected_department_id = val;
                this.expandedIdList.push(val);
                this.change_selected();
                this.refreshData({ clearSelected: true });
            },
            // 部门树渲染
            renderContent(h, { root, node, data }) {
                return h('span', {
                    class: 'verbal-node'
                }, [
                    h('span', [
                        h('span', {
                            style: {
                                cursor: 'pointer',
                                padding: '0 0 0 4px',
                                color: data.selected ? '#4285f4' : '#333'
                            },
                            on: {
                                click: (event) => {
                                    data.selected = true;
                                    this.selected_department_id = data.id;
                                    this.curPage = 1;
                                    this.change_selected();
                                    this.refreshData({ clearSelected: true });
                                }
                            }
                        }, [
                            data.title.replace(/[^\x00-\xff]/gi, '--').length > 12 ? h('Tooltip', {
                                props: {
                                    placement: 'bottom-start',
                                    transfer: true,
                                    content: data.title,
                                    maxWidth: '100px'
                                }
                            }, [
                                h('span', `${this.extractChar(data.title, 12)}...`)
                            ]) : h('span', data.title)

                        ])
                    ]),
                    h('span', {
                        class: 'verbal-node-operate'
                    }, [
                        // 最多增加到10个层级, 基本信息是一级分类
                        data.hierarchy < 3 && h('span', {
                            on: {
                                click: () => {
                                    this.append(data);
                                }
                            }
                        }, [
                            h('Icon', {
                                props: Object.assign({}, {
                                    custom: 'custom custom-add'
                                }),
                                style: {
                                    marginRight: '8px',
                                    cursor: 'pointer'
                                },
                                class: 'tree_icon'
                            })
                        ]),
                        h('span', {
                            on: {
                                click: () => {
                                    this.edit(data);
                                }
                            }
                        }, [
                            h('Icon', {
                                props: Object.assign({}, {
                                    custom: 'custom custom-field-edit'
                                }),
                                style: {
                                    marginRight: '8px',
                                    cursor: 'pointer',
                                    display: data.common === '1' ? 'none' : 'auto'
                                },
                                class: 'tree_icon'
                            })
                        ]),
                        h('span', {
                            on: {
                                click: () => {
                                    this.remove(data);
                                }
                            }
                        }, [
                            h('Icon', {
                                props: Object.assign({}, {
                                    custom: 'custom custom-field-delete'
                                }),
                                style: {
                                    cursor: 'pointer',
                                    display: data.common === '1' ? 'none' : 'auto'
                                },
                                class: 'tree_icon'
                            })
                        ])
                    ])
                ]);
            },
            // 提取前多少个字
            extractChar(str, length) {
                let result = '';
                for (let i = 0; i < str.length; i++) {
                    if (length > 0) {
                        // 双字节字符, 算两位
                        if (/[^\x00-\xff]/gi.test(str[i])) {
                            length -= 2;
                        } else {
                            length -= 1;
                        }
                        result += str[i];
                    } else {
                        break;
                    }
                }
                return result;
            },
            // 树节点状态改变
            change_tree_expand(val) {
                this.tree_expand[val.title] = val.expand;
            },
            // 树节点展开
            tree_node_expand(val) {
                this.tree_expand[val.title] = val.expand;
                this.expandedIdList.push(val.id);
            },
            // 树节点收起
            tree_node_collapse(val) {
                this.tree_expand[val.title] = val.expand;

                // 使用递归获取该节点及其子节点id数组
                const allChildrenIdArr = [];
                function getAllChildrenId(node) {
                    allChildrenIdArr.push(node.id);
                    if (node.children != null) {
                        node.children.forEach(item => {
                            getAllChildrenId(item);
                        });
                    }
                }
                getAllChildrenId(val);

                // 收起时要去掉该节点及其子节点
                const expandedIdArr = [0];
                this.expandedIdList.forEach(item => {
                    if (allChildrenIdArr.indexOf(item) === -1) {
                        expandedIdArr.push(item);
                    }
                });
                this.expandedIdList = expandedIdArr;
            },
            // 部门树添加事件
            append(data) {
                this.get_tree_data = data;
                this.get_add_form = {};
                this.add_tree = true;
            },
            // 删除部门树节点
            remove(val) {
                this.get_tree_data = val;
                const obj = {};
                obj.title = val.title;
                obj.id = val.id;
                obj.count = val.replyCount;
                this.delete_title = obj;
                this.delete_modal = true;
            },
            // 修改部门树节点名称
            edit(data) {
                this.get_tree_data = data;
                const obj = {};
                obj.name = data.title;
                obj.sortNo = data.sortNo;
                obj.remark = data.remark;
                this.get_updata_tree_info = obj;
                this.updata_tree = true;
            },
            change_selected() {
                this.get_tree_children(this.organization_structure, this.selected_department_id, [this.organization_structure]);
            },
            get_tree_children(data, id, parentNodes) {
                data.forEach(item => {
                    if (item.children) {
                        if (item.id == id) {
                            parentNodes.forEach(parent => {
                                this.tree_expand[parent.title] = true;
                                parent.expand = true;
                            });
                            item.selected = true;
                            // return true;
                        } else {
                            item.selected = false;
                        }
                        // 这里放在外面是为了吧之前的选中结点 selected 置为 false
                        this.get_tree_children(item.children, id, parentNodes.concat(item));
                    } else {
                        if (item.id == id) {
                            parentNodes.forEach(parent => {
                                this.tree_expand[parent.title] = true;
                                parent.expand = true;
                            });
                            item.selected = true;
                            return true;
                        } else {
                            item.selected = false;
                        }
                    }
                });
            },
            // 部门树初始化
            set_tree() {
                util.ajax({
                    url: '/cuss-login/replyType/getReplyTypeList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const arr = response.data.data.list;
                        const val = this.get_tree(arr); // 一级列表
                        console.log(val);
                        const arr1 = this.set_tree_children(val);
                        console.log(arr1);
                        this.organization_structure[0].children = [];
                        for (let i = 0; i < arr1.length; i++) {
                            this.organization_structure[0].children.push(arr1[i]);
                        }
                        // this.organization_structure[0].title = response.data.data.orgName;
                        this.organization_structure[0].num = response.data.data.companyUserCount;
                        this.get_department = [];
                        this.get_department = this.get_all_department(this.organization_structure[0].children);
                        if (JSON.stringify(this.tree_expand) == '{}') {
                            for (let i = 0; i < this.get_department.length; i++) {
                                this.tree_expand[this.get_department[i].label] = false;
                            }
                        }
                        this.refreshData({ clearSelected: true });
                    } else {
                        this.$Message.error(this.$t('portal_set.verbalErr'));
                        this.organization_structure = [];
                        this.loading = false;
                    }
                });
            },
            // 部门树遍历 处理
            get_tree(arr) {
                const temp = {};
                const tree = {};
                // id为键,值为id对应的对象
                for (const i in arr) {
                    temp[arr[i].id] = arr[i];
                }
                // 建立树结构
                for (const i in temp) {
                    // 判断是否有parentId
                    if (temp[i].parentId) {
                        // console.log(temp[temp[i].parentId].children);
                        // 找二级列表的一级列表是否有children 有的话置空（举例）
                        if (!temp[temp[i].parentId].children) {
                            temp[temp[i].parentId].children = {};
                        }
                        // 重新给一级列表添加二级列表（举例）
                        temp[temp[i].parentId].children[temp[i].id] = temp[i];
                    } else {
                        // 没有 parentId 说明是一级列表
                        tree[temp[i].id] = temp[i];
                    }
                }
                return tree;
            },
            // 遍历部门树的子节点
            set_tree_children(val) {
                const arr = [];
                let arr1 = [];

                for (const i in val) {
                    let arr2 = [];

                    arr2 = this.build_tree(val[i], 0);
                    arr.push(arr2[0]);
                }
                console.log(arr);
                arr1 = this.sort_tree(arr);
                return arr1;
            },
            // 部门树按照sortNo排序
            sort_tree(val) {
                for (let i = 0; i < val.length; i++) {
                    if (val[i].children) {
                        val[i].children = this.sort_tree(val[i].children);
                    }
                }
                val = val.sort(this.sortBy('sortNo'));
                return val;
            },
            // 按照键值排序
            sortBy(property, sortType = 'asc') {
                console.log(property);
                return function(a, b) {
                    const value1 = a[property];
                    const value2 = b[property];
                    return sortType === 'desc' ? value2 - value1 : value1 - value2;
                };
            },
            // 公司部门处理
            build_tree(val, hierarchy, obj = {}) {
                hierarchy++;
                const sel = this.selected_department_id === val.id;
                const arr = [];
                obj.title = val.name;
                obj.id = val.id;
                obj.sortNo = val.sortNo;
                obj.parentId = val.parentId;
                obj.remark = val.remark;
                obj.num = val.personCount;
                obj.type = val.type;
                obj.expand = this.tree_expand[val.name];
                obj.selected = sel;
                obj.children = [];
                obj.hierarchy = hierarchy;
                obj.common = val.common;
                obj.replyCount = val.replyCount;
                arr.push(obj);
                const hiera = obj.hierarchy;
                if (val.children) {
                    for (const i in val.children) {
                        obj.children.push(this.build_tree(val.children[i], hiera)[0]);
                    }
                }
                return arr;
            },
            // 获取所有部门
            get_all_department(val, arr = []) {
                for (let i = 0; i < val.length; i++) {
                    const obj = {};
                    obj.value = val[i].id;
                    obj.label = val[i].title;
                    obj.selected = val[i].selected;
                    obj.hierarchy = val[i].hierarchy;
                    arr.push(obj);
                    if (val[i].children.length !== 0) {
                        this.get_all_department(val[i].children, arr);
                    }
                }
                this.all_department = arr;
                return arr;
            },

            /* 表格 */
            // 数据处理
            // 刷新表格数据
            refreshData(paramsObj = {}) {
                // 清空已选中的询盘
                if (paramsObj.clearSelected) {
                    this.selected_users = [];
                }

                this.loading = true;
                util.ajaxJson({
                    url: '/cuss-login/reply/getReplyList',
                    method: 'get',
                    params: Object.assign({
                        pageNo: this.curPage,
                        pageSize: this.pageSize,
                        orgId: this.enterpriseId,
                        typeId: parseInt(this.selected_department_id)
                    }, this.queryData),
                    timeout: 60000
                }).then(response => {
                    if (response.data.code === '1') {
                        this.tableData = response.data.data.list;
                        console.log(this.tableData);
                        // this.initData();
                        this.totalNum = response.data.data.total;
                        this.maxPageNum = Math.ceil(this.totalNum / this.pageSize);

                        if (this.tableData.some(item => item.departmentId !== this.tableData[0].departmentId)) {
                            this.organization_structure.selected = true;
                        } else {
                            this.tableData[0] && (this.tableData[0].selected = true);
                        }
                    } else {
                        this.tableData = [];
                        this.selected_users = [];
                        this.totalNum = 0;
                        this.maxPageNum = 0;
                        // this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                    }
                    this.loading = false;
                });
            },
            // 初始化数据
            initData() {
                let arr1 = [];
                const arr2 = [];
                const arr3 = [];
                this.tableData = this.tableData.forEach(item => {
                    const obj = {
                        id: item.id,
                        name: item.fullname,
                        ename: item.realName,
                        email: item.email,
                        tel: item.phone,
                        lname: item.username,
                        passwd: item.password,
                        sex: item.gender ? this.$t('authority.male') : this.$t('authority.female'),
                        department: item.departmentName,
                        departmentId: item.departmentId,
                        has_chat: item.canChat === 1 ? this.$t('authority.yes') : this.$t('authority.no'),
                        has_inquiries: item.canGetInquiry === 1 ? this.$t('authority.yes') : this.$t('authority.no'),
                        has_fb_service: item.canFbManage === 1 ? this.$t('authority.yes') : this.$t('authority.no'),
                        isselect: item.isLock,
                        isDelete: item.isDelete,
                        isLoading: false,
                        roleId: item.roleId,
                        manageId: item.manageId,
                        fieldId: item.fieldId,
                        fields: item.fields,
                        manages: item.manages,
                        functional_permissions: item.roleName,
                        administrative_authority: item.manageName,
                        field_permissions: item.fieldName,
                        _disabled: item.isDelete,
                        remark: item.remark,
                        createDate: item.createDate
                    };

                    if (obj.isDelete) {
                        arr2.push(obj);
                    } else if (obj.isselect) {
                        arr3.push(obj);
                    } else {
                        arr1.push(obj);
                    }
                });
                arr1 = arr1.sort(this.sortBy('id', 'desc'));
                this.tableData = arr1.concat(arr3).concat(arr2);
            },

            // 列相关
            // 修改列
            edit_columns() {
                this.visible_edit_columns = true;
            },
            changeGroups(selCol) {
                this.flag_refreshColumn = false;
                const orderObj = Object.assign({}, ...selCol.map((item, index) => {
                    const temp = {};
                    temp[item] = index;
                    return temp;
                }));
                this.currentColumns = this.allColumns.filter(col => selCol.includes(col.key)).sort((a, b) => {
                    return orderObj[a.key] - orderObj[b.key];
                });
                this.$nextTick(() => {
                    this.flag_refreshColumn = true;
                });
            },

            // 获取检索字段名称对应的数据库字段名
            getSearchCon(str) {
                switch (str) {
                    case 'parentName':
                        return 'typeId';
                    default:
                        return str;
                }
            },
            // 返回字段筛选渲染函数
            renderHeader_filter(colIndex) {
                return (h) => {
                    const column = this.allColumns[colIndex];
                    /* DOM */
                    // 标题
                    const title = h('div', {
                        attrs: {
                            title: column.title
                        },
                        class: 'table-filter-title'
                    }, column.title);
                    // 排序组件
                    let order_column = this.getSearchCon(column.key);
                    if (order_column === 'create_user_id') {
                        order_column = 'create_user';
                    }
                    const sortIcons = h('span', {
                        class: {
                            'ivu-table-sort': true
                        }
                    }, [
                        h('Icon', {
                            class: {
                                'icon-custom-on': true,
                                'icon-custom-on-active': this.order_column === order_column && this.order_type === 'asc'
                            },
                            props: {
                                type: 'md-arrow-dropup'
                            }
                        }),
                        h('Icon', {
                            class: {
                                'icon-custom-on': true,
                                'icon-custom-on-active': this.order_column === order_column && this.order_type === 'desc'
                            },
                            props: {
                                type: 'md-arrow-dropdown'
                            }
                        })
                    ]);
                    // 筛选组件
                    const filterPop = h('FilterBox', {
                        props: Object.assign({
                            showPopper: this.allColumns[colIndex].show_filter_content,
                            filtering: this.allColumns[colIndex].filtering,
                            columnKey: column.key,
                            columnCon: order_column,
                            order_type: this.order_type,
                            order_column: this.order_column,
                            storageName_orderColumn: this.storageName_orderColumn
                        }, this.config_tableFilter[column.key]),
                        on: {
                            updateList: () => {
                                const temp = this.config_tableFilter[column.key];
                                if (temp) {
                                    /* 处理筛选 */

                                    // 判断是否有值, 调整 sqlList
                                    const con = this.getSearchCon(column.key);
                                    if (temp.query.length) {
                                        switch (temp.filterType) {
                                            case 'string':
                                                this.$set(this.queryData, con, temp.query);
                                                break;
                                            case 'selectSingle':
                                                this.$set(this.queryData, con, temp.query[0].value);
                                                break;
                                        }
                                        this.allColumns = this.allColumns.map((item, index) => {
                                            if (index === colIndex) {
                                                item.filtering = true;
                                            }
                                            return item;
                                        });
                                    } else {
                                        this.$delete(this.queryData, con);
                                        this.allColumns = this.allColumns.map((item, index) => {
                                            if (index === colIndex) {
                                                item.filtering = false;
                                            }
                                            return item;
                                        });
                                    }

                                    /* 刷新列表 */
                                    this.curPage = 1;
                                    this.refreshData({ clearSelected: true });
                                }
                            },
                            'update:showPopper': (val) => {
                                this.allColumns = this.allColumns.map((item, index) => {
                                    if (index === colIndex) {
                                        item.show_filter_content = val;
                                    } else if (val) {
                                        item.show_filter_content = false;
                                    }
                                    return item;
                                });
                            },
                            'update:query': (val) => {
                                if (this.config_tableFilter[column.key]) {
                                    this.$set(this.config_tableFilter[column.key], 'query', val);
                                }
                            },
                            'update:order_column': (val) => {
                                this.order_column = val;
                            },
                            'update:order_type': (val) => {
                                this.order_type = val;
                            },
                            'update:storageName_orderColumn': (val) => {
                                this.storageName_orderColumn = val;
                            }
                        }
                    });

                    /* 返回 DOM */
                    return h('div', {
                        class: 'table-filter-container'
                    }, [title, (this.order_column === order_column && this.order_type) ? sortIcons : undefined, column.hasOwnProperty('show_filter_content') ? filterPop : undefined]);
                };
            },
            // 纯文本表头, 不换行 + 省略号 + title 提示
            renderHeader_text(colIndex) {
                return h => {
                    const column = this.allColumns[colIndex];
                    /* DOM */
                    // 标题
                    const title = h('div', {
                        attrs: {
                            title: column.title
                        },
                        class: 'table-filter-title'
                    }, column.title);

                    /* 返回 DOM */
                    return h('div', {
                        class: 'table-filter-container'
                    }, [title]);
                };
            },

            /* 筛选 tag */
            // close tag 时去掉对应的筛选条件并刷新
            remove_filter_tag(key) {
                // 清空筛选条件
                const temp = this.config_tableFilter[key];
                if (temp) {
                    switch (temp.filterType) {
                        case 'string':
                            temp.query = '';
                            break;
                        case 'selectSingle':
                            temp.query = [];
                            break;
                    }
                    this.$set(this.config_tableFilter, key, temp);
                }

                // 设置表格 filtering 为 false , 并从表头筛选条件对象中去掉对应筛选项
                const index = this.allColumns.findIndex(item => item.key === key);
                if (index !== -1) {
                    const col = this.allColumns[index];
                    col.filtering = false;
                    this.$set(this.allColumns, index, col);
                    this.changeGroups(this.group);

                    this.$delete(this.queryData, this.getSearchCon(col.key));
                }

                this.curPage = 1;
                this.refreshData({ clearSelected: true });
            },

            // filterTags 组件内部修改筛选值后触发的方法, 由下方的 updateList 改造而成
            change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    /* 处理筛选 */

                    // 判断是否有值, 调整 sqlList
                    const con = this.getSearchCon(key);
                    if (temp.query.length) {
                        switch (temp.filterType) {
                            case 'string':
                                this.$set(this.queryData, con, temp.query);
                                break;
                            case 'selectSingle':
                                this.$set(this.queryData, con, temp.query[0].value);
                                break;
                        }
                        this.allColumns = this.allColumns.map((item, index) => {
                            if (index === colIndex) {
                                item.filtering = true;
                            }
                            return item;
                        });
                    } else {
                        this.$delete(this.queryData, con);
                        this.allColumns = this.allColumns.map((item, index) => {
                            if (item.key === key) {
                                item.filtering = false;
                            }
                            return item;
                        });
                    }

                    /* 刷新列表 */
                    this.curPage = 1;
                    this.refreshData({ clearSelected: true });
                } else {
                    this.remove_filter_tag(key);
                }
            },
            // 删掉 sort tag
            empty_sort() {
                // 清空
                this.order_column = '';
                this.order_type = '';

                // 刷新
                this.curPage = 1;
                this.refreshData();
            },

            // 离职账号表格样式
            row_class_name(row, index) {
                if (row.isDelete) {
                    return 'demo-table-info-row';
                }
                for (const i in this.selected_users) {
                    if (row.lname === this.selected_users[i].lname) {
                        return 'table-selected';
                    }
                }
            },

            /* 表格操作 */
            // 编辑用户
            open_update_modal(currentUser) {
                const val = currentUser || this.selected_users[0];
                const obj = {};
                for (const i in val) {
                    obj[i] = val[i];
                }
                this.get_department = this.get_all_department(this.organization_structure[0].children);
                this.updata_modal = true;
                let flag = false;
                for (let i = 0; i < this.get_department.length; i++) {
                    if (this.get_department[i].value == obj.typeId) {
                        flag = true;
                        break;
                    }
                }
                if (flag) {
                    this.get_updata_info = obj;
                } else {
                    obj.typeId = null;
                    this.get_updata_info = obj;
                }
                // this.get_updata_info = obj
            },
            // 分配权限
            set_permission(currentUser) {
                const val = currentUser || this.selected_users;
                const arr = [];
                for (let i = 0; i < val.length; i++) {
                    const obj = {};
                    obj.id = val[i].id;
                    obj.name = val[i].name;
                    arr.push(obj);
                }
                this.get_user_list = currentUser || [...this.selected_users];
                this.allocation_modal = true;
            },
            lock_account() {
                const arr = [];
                const val = this.selected_users.length > 0 ? this.selected_users : this.lock_target_account;
                for (let i = 0; i < val.length; i++) {
                    arr.push(val[i].id);
                }
                this.lock_accountIds = arr;
                this.lock_accountIds = this.lock_accountIds.join(',');
                util.ajaxJson({
                    url: '/cuss-login/reply/delete',
                    method: 'post',
                    params: {
                        ids: this.lock_accountIds
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.refreshData({ clearSelected: true });
                        this.set_tree();
                        this.$Message.success(this.$t('portal_set.del_success'));
                        this.delete_script_modal = false;
                    } else {
                        this.$Message.error(response.data.message);
                        this.refreshData({ clearSelected: true });
                    }
                    // this.change_lock_modal(false)
                });
            },
            // 改变账号状态
            state_change(val1, val2) {
                if (val1) {
                    util.ajaxJson({
                        url: '/new-privilege/user/unlock',
                        method: 'post',
                        data: {
                            operatorName: this.userName,
                            user: {
                                id: val2.id
                            },
                            orgId: this.enterpriseId
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.$Message.success(this.$t('authority.userManagement.typeSuccess'));
                            this.refreshData({ clearSelected: true });
                        } else {
                            this.$Message.error(response.data.message);
                            this.refreshData({ clearSelected: true });
                        }
                    });
                } else {
                    const arr = [];
                    arr.push(val2.id);
                    util.ajaxJson({
                        url: '/new-privilege/user/lock',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            userIdList: arr
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.$Message.success(this.$t('authority.userManagement.typeSuccess'));
                            this.refreshData({ clearSelected: true });
                        } else {
                            this.$Message.error(response.data.message);
                            this.refreshData({ clearSelected: true });
                        }
                    });
                }
            },
            // 清空已选
            clear_selected_users() {
                this.selected_users = [];
                this.$refs.table.clearSelection([]);
            },
            // 获取公司信息
            get_info() {
                util.ajaxJson({
                    url: '/new-privilege/org/getOrgList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.used_number = response.data.data.list[0].usedNum;
                        this.user_limit = response.data.data.list[0].userLimit;
                    } else {
                        this.$Message.error(response.data.message);
                    }
                });
            },
            // 新建用户
            add_user() {
                this.get_department = [];
                this.get_department = this.get_all_department(this.organization_structure[0].children);
                this.add_modal = true;
            },

            /* 底部页码 */
            // 改变每页条数
            pageSizeChange(pageSize) {
                this.curPage = 1;
                this.pageSize = pageSize;
                this.refreshData();
            },
            // 改变页码
            changePage(page) {
                if (page <= this.maxPageNum) {
                    this.curPage = page;
                    this.refreshData();
                }
            },

            /* 模态框--新建用户 */
            change_add_modal(modal) {
                this.add_modal = modal;
            },
            // 添加用户后，更新用户列表
            get_add_user() {
                this.set_tree();
            },

            /* 模态框--编辑用户 */
            change_updata_modal(data) {
                this.updata_modal = data;
            },

            /* 模态框--添加部门 */
            change_add_tree(val) {
                this.add_tree = val;
            },
            change_tree_loading(val) {
                this.tree_modal_loading = val;
            },
            set_add_tree(val) {
                this.get_add_form = val;
                util.ajax({
                    url: '/cuss-login/replyType/save',
                    method: 'post',
                    data: {
                        name: val.name,
                        type: this.get_tree_data.type,
                        remark: val.remark,
                        sortNo: val.sortNo,
                        parentId: this.get_tree_data.id,
                        createPerson: this.fullName,
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    this.tree_modal_loading = false;
                    if (response.data.code === '1') {
                        this.$Message.success(this.$t('authority.userManagement.addSuccess'));
                        this.get_add_form = {};
                        this.set_tree();
                        this.add_tree = false;
                    } else {
                        this.$Message.error(response.data.message);
                    }
                }).catch(err => {
                    console.error(err);
                    this.tree_modal_loading = false;
                });
            },

            /* 模态框--编辑部门 */
            change_updata_tree(val) {
                this.updata_tree = val;
            },
            change_tree_updata(val) {
                this.tree_updata_loading = val;
            },
            set_updata_tree(val) {
                const obj = {};
                obj.name = val.name;
                obj.remark = val.remark;
                obj.sortNo = val.sortNo;
                obj.id = this.get_tree_data.id;
                obj.updatePerson = this.fullName;
                obj.orgId = this.enterpriseId;
                util.ajax({
                    url: '/cuss-login/replyType/update',
                    method: 'post',
                    data: obj
                }).then(response => {
                    if (response.data.code === '1') {
                        this.tree_updata_loading = false;
                        this.$Message.success(this.$t('authority.userManagement.editSuccess'));
                        this.set_tree();

                        this.updata_tree = false;
                    } else {
                        this.$Message.error(response.data.message);
                    }
                });
            },

            /* 模态框--删除部门 */
            set_remove(val) {
                util.ajax({
                    url: '/cuss-login/replyType/delete',
                    method: 'post',
                    params: {
                        id: val.id,
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.delete_loading = false;
                        this.$Message.success(this.$t('authority.userManagement.delSuccess'));
                        this.delete_modal = false;
                        this.set_tree();
                    } else {
                        this.delete_loading = false;
                        this.$Message.error(response.data.message);
                        this.delete_modal = false;
                    }
                });
            },
            change_delete_modal(val) {
                this.delete_modal = val;
            },
            change_delete_loading(val) {
                this.delete_loading = val;
            },

            // 重新获取用户列表
            change_permission(isDeleteAccount) {
                isDeleteAccount && (this.showDetail = false);
                this.refreshData({ clearSelected: true });
            },
            change_account_loading(val) {
                this.delet_account_loading = val;
            },

            // 点击表格行
            clickRow(data, column, event) {
                const explorer = window.navigator.userAgent;
                let selector = '';
                // 复制数据, 不弹出详情页
                if (explorer.indexOf('MSIE') >= 0 || explorer.indexOf('Opera') >= 0) {
                    const selected = document.selection.createRange();
                    selector = selected.text;
                } else {
                    selector = window.getSelection();
                }
                if (selector.type === 'Range' || document.activeElement.tagName === 'INPUT') {
                    return;
                }

                // 否则显示详情页
                this.currentUserId = data.id;
                const res = this.tableData.find(item => item.id === this.currentUserId);
                if (!res._disabled) {
                    this.currentRow = res;
                    this.showDetail = true;
                }
            }
        },
        created() {
            this.set_tree();
            /** 页面中未用到获取公司信息的相关数据，暂时注掉 */
            // this.get_info();
        },
        mounted() {
            /* 配置表头筛选 */
            this.allColumns = this.allColumns.map((col, index) => {
                if (this.config_tableFilter.hasOwnProperty(col.key)) {
                    col.show_filter_content = false;
                    col.filtering = false;
                    col.renderHeader = this.renderHeader_filter(index);
                } else {
                    col.renderHeader = this.renderHeader_text(index);
                }
                return col;
            });
            this.group = this.allGroup.slice();
            /* 配置表格显示项 */
            // util.ajaxJson({
            //     url: '/crm/commonField/getFieldOrderList',
            //     method: 'post',
            //     data: {
            //         orgId: this.enterpriseId,
            //         userId: this.userId,
            //         type: this.columnType
            //     }
            // }).then(response => {
            //     if (response.data.code === '1') {
            //         if (response.data.data) {
            //             // 解构数据
            //             const { id, showField, fieldStyle } = response.data.data;
            //             this.id_column_show_order = id;

            //             // 处理字段顺序
            //             if (typeof showField === 'string') {
            //                 const fields = showField.split(',');
            //                 this.group = fields.filter(item => this.allGroup.includes(item));
            //             } else {
            //                 this.group = this.allGroup.slice();
            //             }

            //             // 处理字段宽度
            //             this.fieldStyle = fieldStyle ? JSON.parse(fieldStyle) : {};
            //             Object.entries(this.fieldStyle).forEach(([fieldKey, fieldObj]) => {
            //                 const column = this.allColumns.find(item => item.key === fieldKey);
            //                 if (column && fieldObj.width) {
            //                     column.width = fieldObj.width;
            //                 }
            //             });
            //         } else {
            //             this.group = this.allGroup.slice();
            //         }
            //     } else {
            //         this.$Message.error(this.$t('crm.Table.getTableColumnOrder'));
            //         this.group = this.allGroup.slice();
            //     }
            // });
        },
        watch: {
            group: {
                handler(val) {
                    this.changeGroups(val);
                },
                immediate: true
            },
            tableData: {
                handler() {
                    const res = this.tableData.find(item => item.id === this.currentUserId);
                    if (res && !res._disabled) {
                        this.currentRow = res;
                        this.showDetail = true;
                    }
                },
                deep: true
            },
            lock_target_account() {
                const arr = [];
                const val = this.selected_users.length > 0 ? this.selected_users : this.lock_target_account;
                for (let i = 0; i < val.length; i++) {
                    arr.push(val[i].id);
                }
                this.lock_accountIds = arr;
            },
            showDetail() {
                !this.showDetail && (this.currentUserId = 0);
            }
        }
    };
</script>

<style lang="scss">
    @import "~@/styles/moduleScss/portal-set/common";
</style>

<style lang="less" scoped>
    * /deep/ .demo-table-info-row td {
        background-color: #fcfcfc;
        color: #ccc;
    }

    .title {
        margin: 10px 0;
        font-size: 16px;
        line-height: 24px;
        color: rgba(0, 0, 0, 0.80);
    }

    .newCreate-btn-group .newCreate-btn-group-newCreate {
        border-radius: 4px;
    }

    .verbalStyle {
        top: 7px;
    }

    .datewrap ._btns_text_ml {
        position: absolute;
        right: 0;
    }
</style>

<style lang="less">
    .el-table .DisableSelection .cell .el-checkbox__inner{
        display: none !important;
        position: relative;
    }
    .el-table .DisableSelection .cell:before{
        content: "";
        position: absolute;
    }
    .el-tooltip__popper{
        max-width: 250px;
    }
    .tree_icon {
        &:hover {
            color: #4285F4;
        }
    }

    .verbalflag .filter-tags-container {
        margin-top: 10px !important;
    }
    .verbalflag {
        .el-tree-node >.el-tree-node__children {
            overflow: visible;
        }
        .el-tree-node__content {
            background: transparent!important;
            display: block;
            .verbal-node {
                display: inline-block;
                padding-right: 65px;
                height: 25px;
                position: relative;
            }

            .verbal-node-operate {
                display: none;
                margin-left: 10px;
                overflow: hidden;
                position: absolute;
                top: -1px;
            }

            &:hover {
                background: transparent;
                .verbal-node-operate {
                    display: inline-block;
                }
            }
        }
    }
</style>
