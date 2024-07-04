<template>
    <div>
        <!-- 部门与用户管理-正体 -->
        <Row>
            <!-- 左侧组织架构 -->
            <Col :span="5" style="padding-left: 30px;border-right: 1px solid #e8eaec;">
                <!-- 标题 -->
                <div class="title">{{$t('authority.userManagement.organ')}}</div>

                <!-- 部门筛选 -->
                <Select filterable @change="search_tree" style="padding-right: 30px; width: 100%; margin-bottom: 10px;" v-model="selected_department_label"
                        :placeholder="$t('authority.userManagement.organInput')">
                    <Option v-for="item in all_department" :value="item.value" :key="item.value" :label="item.label"></Option>
                </Select>

                <!-- 部门tree -->
                <div :style="{ height: `${table_height + 26}px`, overflow:'hidden', width: '100%' }" class="user-management-tree">
                    <div :style="{ height: `${table_height - 26}px`, overflow: 'auto' }">
                        <Tree :data="organization_structure"
                              v-if="!loadingTree"
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
                <div class="datewrap" style="height: 38px;line-height: 35px;position: relative;">
                    <!-- 多选操作视图 -->
                    <template v-if="visible_batch_operate">
                        <div style="display: inline-block;color: rgba(0, 0, 0, .8);margin-bottom: -15px;">{{
                            $t('crm.Table.selected') }} <span style="font-weight: bolder;color: #4285F4;">{{ selected_users.length }}</span>
                            {{ selected_users.length > 1 ? $t('crm.Table.item_users') : $t('crm.Table.item_user') }}
                            <!-- 编辑用户 -->
                            <Button v-if="selected_users.length === 1"  icon="custom custom-field-edit" type='text'
                                    @click="open_update_modal(false)"
                                    class="tree_icon operation_button">{{$t('authority.userManagement.edit')}}
                            </Button>

                            <!-- 分配权限 -->
                            <Button  icon="custom custom-authority-distribution" type='text'
                                    @click="set_permission(false)"
                                    class="tree_icon operation_button">{{$t('authority.userManagement.allocaPermis')}}
                            </Button>

                            <!-- 禁用 -->
                            <Button v-show="showLock==='lock' && !isSuperAdmin"  icon="custom custom-disabled" type='text'
                                    @click='change_lock_modal(true, 0)' class="tree_icon operation_button">
                                {{$t('authority.userManagement.lock')}}
                            </Button>

                            <!-- 解禁 -->
                            <Button v-show="showLock==='unlock' && !isSuperAdmin"
                                    type='text'
                                    icon="custom custom-disabled"
                                    @click="state_change(true, selected_users)"
                                    class="tree_icon operation_button">{{ $t('authority.userManagement.unlock') }}</Button>

                            <!-- 离职 -->
                            <Button v-if="!isSuperAdmin"  icon="custom custom-dimission" type='text'
                                    @click='delete_account_batch(false)'
                                    class="tree_icon operation_button">{{$t('authority.userManagement.setTurnover')}}
                            </Button>
                        </div>

                        <!-- 清空已选 -->
                        <span>
                            <Button type="text" icon="md-close" @click="clear_selected_users"></Button>
                        </span>
                    </template>

                    <!-- 正常视图 -->
                    <template v-else>
                        <!-- 标题 -->
                        <div class="title" style="display: inline-block;">
                            {{$t('authority.userManagement.userList')}}
                        </div>
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
                            @removeCon="remove_filter_tag"
                            style="left:16px;height:36px"></FilterTags>

                        <!-- 新版按钮 -->
                        <!-- <div class="table-operate-btns _btns_text_ml"> -->
                        <div class="table-operate-btns">
                            <!-- 登录安全设置 -->
                            <span @click="visible_loginSecuritySet = true"
                                  class="loginSecuritySet-btn">{{ $t('login.security.loginSecuritySet') }}</span>

                            <!-- 按钮组 -->
                            <span class="newCreate-btn-group">
                                <!-- 批量新增 -->
                                <Button type='text'
                                        @click='add_user'
                                        class="newCreate-btn-group-newCreate">{{$t('authority.addUser')}}</Button>
                                <Dropdown placement="bottom-end">
                                    <Button icon="custom custom-menu-arrow"
                                            class="dropIcon">
                                        <span style="display: none;">_</span>
                                    </Button>
                                    <DropdownMenu slot="dropdown">
                                        <DropdownItem @click.native.stop="show_import_data=true">
                                            <!-- 导入数据 -->
                                            <span>{{ $t('authority.userManagement.importData') }}</span>
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </span>
                        </div>
                    </template>
                </div>

                <!-- 表格页 -->
                <div class="table">
                    <Table v-if="flag_refreshColumn"
                           :data="tableData"
                           v-loading="loading"
                           :height="table_height"
                           :highlight-current-row="true"
                           :isCustom="true"
                           :customEmptyText="$t('crm.Table.noData')"
                           customEmptyButtonText=""
                           :customClearMethod="clearFilterConditionByInitView"
                           :row-class-name="row_class_name"
                           :header-cell-class-name="headerCellClass"
                           :border="true"
                           ref="table"
                           @selection-change="handleSelectionChange"
                           @row-click='clickRow'
                           @mousemove.native="handleTableColHover"
                           @mousedown.native="handleTableColResizeStart"
                           @header-dragend="handleTableColResizeEnd"
                           class="tabmain noBoxShadow-right noborder-table resizable-table">
                            <TableColumn type="selection" width="55" :selectable='checkboxDisabled'></TableColumn>
                            <template v-for="item in currentColumns">
                                <!-- :width="item.width"
                                 :min-width="item.minWidth"  -->
                                <TableColumn v-if="item.key ==='name'" show-overflow-tooltip :key="item.key" :prop="item.key" :label="item.title" :min-width="item.width" :render-header="item.renderHeader">
                                    <template slot-scope="scope">
                                        {{scope.row.name}}
                                        <i v-if="scope.row.superAdmin" class="custom custom-chaoguanzhanghao"></i>
                                    </template>
                                </TableColumn>
                                <!-- 状态按钮 -->
                                <TableColumn v-else-if="item.key === 'state'" :key="item.key" :width="item.width" :min-width="item.minWidth" :prop="item.key" :label="item.title" :render-header="item.renderHeader">
                                    <template slot-scope="scope">
                                        <el-switch
                                            @change="(value) => {
                                                if (!value) {
                                                    scope.row.isselect = true;
                                                    lock_target_account = [scope.row];
                                                    change_lock_modal(true, 1);
                                                } else if(!scope.row.superAdmin) {
                                                    state_change(value, [scope.row]);
                                                }
                                            }"
                                            :value="!scope.row.isselect"
                                            :disabled="scope.row.isDelete || scope.row.superAdmin"
                                            active-color="#409EFF"
                                            inactive-color="#DCDFE6">
                                        </el-switch>
                                    </template>
                                </TableColumn>
                                <TableColumn v-else show-overflow-tooltip :key="item.key" :prop="item.key" :label="item.title" :min-width="item.width" :render-header="item.renderHeader">
                                </TableColumn>
                            </template>
                             <!-- 右侧字段管理按钮 -->
                            <TableColumn
                                width="40"
                                fixed="right"
                                align="center"
                                :resizable="false"
                                :render-header="computed_currentColumns"
                                ></TableColumn>
                    </Table>
                    <div style="margin-right: 30px;overflow: hidden">
                        <Page :page-size="pageSize"
                                :page-sizes="pageSizeOpts"
                              @size-change="pageSizeChange"
                              layout="total, prev, pager, next, sizes, jumper"
                              :total="totalNum" class="pageWrap-right"
                              :current-page="curPage" @current-change="changePage"></Page>
                    </div>
                </div>
            </Col>
        </Row>

        <!-- 模态框 -->
        <!-- 添加用户 -->
        <addModal :modal="add_modal"
            :get_department="get_department"
            height="100%"
            :orgId="enterpriseId"
            :functional_list="authority_function"
            :admin_list="authority_manage"
            :field_list="authority_field"
            :createOrEditUser="selected_users.length"
            @change_add_modal="change_add_modal"
            @get_add_user="get_add_user">
        </addModal>

        <!-- 编辑用户 -->
        <updataModal :modal="updata_modal"
            :get_updata_info="get_updata_info"
            :get_department="get_department"
            height="100%"
            :orgId="enterpriseId"
            :functional_list="authority_function"
            :admin_list="authority_manage"
            :field_list="authority_field"
            @change_updata_modal="change_updata_modal"
            @get_add_user="get_add_user">
        </updataModal>

        <!-- 添加部门 -->
        <addTree :modal="add_tree"
                  :loading="tree_modal_loading"
                  :get_add_form="get_add_form"
                  @change_add_tree="change_add_tree"
                  @change_tree_loading="change_tree_loading"
                  @set_add_tree="set_add_tree">
        </addTree>

        <!-- 编辑部门 -->
        <updataTree :modal="updata_tree"
                     :loading="tree_updata_loading"
                     :get_updata_tree_info="get_updata_tree_info"
                     @change_updata_tree="change_updata_tree"
                     @change_tree_updata="change_tree_updata"
                     @set_updata_tree="set_updata_tree">
        </updataTree>

        <!-- 分配权限 -->
        <allocationPermissions :modal.sync="allocation_modal"
                               :get_functional="get_functional"
                               :user="get_user_list"
                               :functional_list="authority_function"
                               :admin_list="authority_manage"
                               :field_list="authority_field"
                               @change_permission="change_permission"></allocationPermissions>

        <!--禁用账号-->
        <Modal
                :title="$t('authority.userManagement.lockAccount')"
                :visible.sync="lock_account_modal"
                :append-to-body="true"
                :modal-append-to-body="false"
                @close="change_lock_modal(false)"
                width="520px"
                >
            <div>
                {{$t('authority.userManagement.lockAccountConfirm')}}
                <div style="font-size: 14px;color:red;margin:20px 100px;">{{lock_accountIds.join(', ')}}</div>
                {{$t('authority.userManagement.lockAccountTip')}}
            </div>
            <span slot="footer" class="dialog-footer">
                <Button @click="dialogVisible = false;change_lock_modal(false)">{{$t('cancel')}}</Button>
                <Button type="primary" @click="dialogVisible = false;lock_account(lock_target_account)">{{$t('confirm')}}</Button>
            </span>
        </Modal>

        <!-- 设置离职 -->
        <deleteAccount :modal="delete_account_modal"
                        :loading="delet_account_loading"
                        :delete_account_title="delete_account_title"
                        :delete_account_id="delete_account_id"
                        :delete_account_table="delete_account_table"
                        height="100%"
                        @change_delete_account="change_delete_account"
                        @change_account_loading="change_account_loading"
                        @set_delete_account="change_permission"
                        v-on="$listeners"
                        v-bind="$attrs">
        </deleteAccount>

        <!-- 修改字段 -->
        <!-- 编辑显示字段 -->
        <EditColumns
                :visible.sync="visible_edit_columns"
                :columnType="columnType"
                :id.sync="id_column_show_order"
                :allColumns="allColumns"
                :allGroup="allGroup"
                :group.sync="group"></EditColumns>

        <!-- 登录安全设置 -->
        <Modal :visible.sync="visible_loginSecuritySet"
               :title="$t('login.security.loginSecuritySet')"
               :append-to-body="true"
               :modal-append-to-body="false"
               width="520px"
               @open="toggle_loginSecuritySet(true)"
               @close="toggle_loginSecuritySet(false)">
            <!-- loading -->
            <spin v-if="loading_loginSecuritySet"
                  fix></spin>

            <!-- 开关 -->
            <div>
                <div style="font-size: 14px; font-weight: bold; margin-bottom: 17px;">{{ $t('login.security.title_loginSecuritySet') }}</div>
                <el-switch v-model="value_loginSecuritySet"></el-switch>
                <div style="font-size: 12px; margin-top: 17px;">{{ $t('login.security.tip_loginSecuritySet') }}</div>
            </div>

            <!-- 底部按钮 -->
            <span slot="footer">
                <Button @click="visible_loginSecuritySet = false;">{{ $t('cancel') }}</Button>
                <Button type="primary"
                        @click="ok_loginSecuritySet">{{ $t('save') }}</Button>
            </span>
        </Modal>

        <!--用户详情页-->
        <AuthorityDrawerList
                :row="currentRow"
                type="user"
                :showDetail.sync="showDetail"
                :columns="currentColumns"
                :loading="loading"
                :id="currentUserId"
                :authority_function="authority_function"
                :anyModalShow="updata_modal || allocation_modal || delete_account_modal || lock_account_modal"
                @open_update_modal="open_update_modal"
                @set_permission="set_permission"
                @lock_account="lock_account"
                @state_change="state_change"
                @delete_account_batch="delete_account_batch"
                @updateLockTargetAccount="updateLockTargetAccount"
        ></AuthorityDrawerList>
        <!-- 导入数据 -->
        <ImportData v-show="show_import_data"
                    :visible.sync="show_import_data"
                    type="userManagement"
                    @refreshData="refreshData"></ImportData>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import addModal from './add_modal';
    import addTree from './add_tree';
    import updataModal from './updata_modal';
    import updataTree from './updata_tree';
    import deleteAccount from './delete_account';
    import allocationPermissions from './allocation_permissions';
    import EditColumns from '@/views/crm/Table/Components/Modal/editColumns';
    import FilterTags from '@/views/main-components/filter-tags';
    import AuthorityDrawerList from '@/views/authority/authorityDrawerList';
    import resetInitComponents from '@/mixins/resetComponentViewData';
    import tableColResize from '@/mixins/tableColResize';
    import ImportData from '@/views/crm/Table/Components/Modal/importData';
    import { saveSecuritySet, getSecuritySet } from '@/api/login';
    import { userManagement } from '@/api/systemSettings/authority-management/index';
    const { selectDeleteUserList, lockOrUnlockAccount, departmentAdd, departmentUpdate, getFieldOrderList, departmentDelete } = userManagement;

    export default {
        name: 'user-management',
        mixins: [resetInitComponents, tableColResize],
        components: {
            addModal,
            updataModal,
            addTree,
            updataTree,
            allocationPermissions,
            deleteAccount,
            EditColumns,
            FilterTags,
            // UserDetail,
            AuthorityDrawerList,
            ImportData
        },
        computed: {
            ...mapState([
                'userId',
                'userName',
                'enterpriseId',
                'window_height',
                'app'
            ]), // 从 vuex 中获取属性
            visible_batch_operate() {
                return this.selected_users.length;
            },
            table_height() {
                let temp = this.window_height ? this.window_height - 216 : document.body.clientHeight - 216;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            },
            allGroup() {
                return this.allColumns.map(item => item.key);
            },
            // 为表格列数组添加上右侧字段管理模态框和左侧多选框
            computed_currentColumns() {
                return h => {
                    return h(
                        'div',
                        {
                            style: {
                                'margin-right': '-24px'
                            }
                        },
                        [
                            h('Icon', {
                                props: {
                                    custom: 'custom custom-table-edit-columns',
                                    size: 18,
                                    color: '#c3cdd9'
                                },
                                class: 'cursor-pointer',
                                nativeOn: {
                                    click: this.edit_columns
                                }
                            })
                        ]
                    );
                };
            }
        },
        data() {
            return {
                /* 全局 */
                authority_function: [],
                authority_manage: [],
                authority_field: [],

                /* 多语言 */
                langObj: {
                    id: 'ID',
                    lname: this.$t('authority.userManagement.lname'),
                    name: this.$t('authority.userManagement.name'),
                    ename: this.$t('authority.userManagement.ename'),
                    has_chat: this.$t('authority.userManagement.hasChat'),
                    has_inquiries: this.$t('authority.userManagement.hasInquiries'),
                    has_fb_service: this.$t('authority.userManagement.isfbService'),
                    has_WABA_service: this.$t('authority.userManagement.isWABAService'),
                    isDeptManager: this.$t('authority.userManagement.isDeptManager'),
                    functional_permissions: this.$t('authority.userManagement.functionalPermis'),
                    administrative_authority: this.$t('authority.userManagement.adminPermis'),
                    field_permissions: this.$t('authority.userManagement.fieldPermis'),
                    department: this.$t('authority.userManagement.department'),
                    email: this.$t('authority.userManagement.email'),
                    tel: this.$t('authority.userManagement.tel'),
                    sex: this.$t('authority.userManagement.sex'),
                    remark: this.$t('authority.remark'),
                    state: this.$t('authority.userManagement.state')
                },

                /* 部门tree */
                // 部门筛选
                all_department: [],
                // tree
                organization_structure: [
                    {
                        title: '',
                        expand: true,
                        id: 0,
                        num: null,
                        selected: true,
                        hierarchy: 0, // 部门等级
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
                loadingTree: false,
                flag_refreshColumn: true, // 使用 v-if 刷新列表列顺序
                totalNum: 0,
                curPage: 1,
                pageSize: 50,
                maxPageNum: 1,
                pageSizeOpts: [50, 100, 200],
                tableData: [],
                currentColumns: [],
                allColumns: [
                    {
                        title: 'ID',
                        key: 'id',
                        width: 100,
                        align: 'center',
                        ellipsis: true
                        // fixed: 'left'
                    },
                    {
                        title: this.$t('authority.userManagement.lname'),
                        key: 'lname',
                        width: 150,
                        align: 'center',
                        ellipsis: true
                        // fixed: 'left'
                    },
                    {
                        title: this.$t('authority.userManagement.name'),
                        key: 'name',
                        width: 100,
                        align: 'center',
                        ellipsis: true
                    },
                    {
                        title: this.$t('authority.userManagement.ename'),
                        key: 'ename',
                        width: 100,
                        align: 'center',
                        ellipsis: true
                    },
                    {
                        title: this.$t('authority.userManagement.state'),
                        key: 'state',
                        width: 100,
                        render: (h, params) => {
                            return h('el-switch', {
                                props: {
                                    value: !params.row.isselect,
                                    loading: params.row.isLoading,
                                    disabled: Boolean(params.row.isDelete)
                                },
                                style: {
                                    overflow: 'visible'
                                },
                                on: {
                                    'on-change': (value) => {
                                        if (!value) {
                                            params.row.isselect = true;
                                            this.lock_target_account = [params.row];
                                            this.change_lock_modal(true, 1);
                                        } else {
                                            this.state_change(value, [params.row]);
                                        }
                                    }
                                }
                            }, [
                                h('span', {
                                    slot: 'open'
                                }),
                                h('span', {
                                    slot: 'close'
                                })
                            ]);
                        }
                    },
                    {
                        title: this.$t('authority.userManagement.hasChat'),
                        key: 'has_chat',
                        width: 100,
                        align: 'center',
                        ellipsis: true
                    },
                    {
                        title: this.$t('authority.userManagement.hasInquiries'),
                        key: 'has_inquiries',
                        width: 100,
                        align: 'center',
                        ellipsis: true
                    },
                    {
                        title: this.$t('authority.userManagement.isfbService'),
                        key: 'has_fb_service',
                        width: 150,
                        align: 'center',
                        ellipsis: true
                    },
                    {
                        title: this.$t('authority.userManagement.isWABAService'),
                        key: 'has_WABA_service',
                        width: 150,
                        align: 'center',
                        ellipsis: true
                    },
                    {
                        title: this.$t('authority.userManagement.isDeptManager'),
                        key: 'isDeptManager',
                        width: 150,
                        align: 'center',
                        ellipsis: true
                    },
                    {
                        title: this.$t('authority.userManagement.functionalPermis'),
                        key: 'functional_permissions',
                        width: 200,
                        align: 'center',
                        ellipsis: true
                    },
                    {
                        title: this.$t('authority.userManagement.adminPermis'),
                        key: 'administrative_authority',
                        width: 200,
                        align: 'center',
                        ellipsis: true
                    },
                    {
                        title: this.$t('authority.userManagement.fieldPermis'),
                        key: 'field_permissions',
                        width: 200,
                        align: 'center',
                        ellipsis: true
                    },
                    {
                        title: this.$t('authority.userManagement.department'),
                        key: 'department',
                        width: 150,
                        align: 'center',
                        ellipsis: true
                    },
                    {
                        title: this.$t('authority.userManagement.email'),
                        key: 'email',
                        width: 200,
                        align: 'center',
                        ellipsis: true
                    },
                    {
                        title: this.$t('authority.userManagement.tel'),
                        key: 'tel',
                        width: 200,
                        align: 'center',
                        ellipsis: true
                    },
                    {
                        title: this.$t('per_setting.personalPhone'),
                        key: 'phoneNumber',
                        width: 200,
                        align: 'center',
                        ellipsis: true
                    },
                    {
                        title: this.$t('authority.userManagement.sex'),
                        key: 'sex',
                        width: 70,
                        align: 'center',
                        ellipsis: true
                    },
                    {
                        title: this.$t('authority.remark'),
                        key: 'remark',
                        width: 200,
                        align: 'center',
                        ellipsis: true
                    }
                ], // 表格全部列

                /* 多选操作 */
                selected_users: [],
                // 禁用
                showLock: true,
                isSuperAdmin: false,
                lock_account_modal: false,
                lock_target_account: [],
                lock_accountIds: [],
                operateSource: 0, // 触发禁用弹窗的操作来源 0--表头禁用按钮  1--switch开关  2--详情页禁用按钮

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
                    lname: {
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
                    },
                    ename: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    has_chat: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'selectSingle', // 筛选类型
                        query: [], // 筛选值
                        allList: [
                            {
                                value: 1,
                                label: this.$t('authority.yes')
                            },
                            {
                                value: 2,
                                label: this.$t('authority.no')
                            }
                        ] // 所有可能的筛选条件
                    },
                    has_inquiries: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'selectSingle', // 筛选类型
                        query: [], // 筛选值
                        allList: [
                            {
                                value: 1,
                                label: this.$t('authority.yes')
                            },
                            {
                                value: 2,
                                label: this.$t('authority.no')
                            }
                        ] // 所有可能的筛选条件
                    },
                    has_fb_service: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'selectSingle', // 筛选类型
                        query: [], // 筛选值
                        allList: [
                            {
                                value: 1,
                                label: this.$t('authority.yes')
                            },
                            {
                                value: 2,
                                label: this.$t('authority.no')
                            }
                        ] // 所有可能的筛选条件
                    },
                    has_WABA_service: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'selectSingle', // 筛选类型
                        query: [], // 筛选值
                        allList: [
                            {
                                value: 1,
                                label: this.$t('authority.yes')
                            },
                            {
                                value: 2,
                                label: this.$t('authority.no')
                            }
                        ] // 所有可能的筛选条件
                    },
                    isDeptManager: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'selectSingle', // 筛选类型
                        query: [], // 筛选值
                        allList: [
                            {
                                value: 1,
                                label: this.$t('authority.yes')
                            },
                            {
                                value: 2,
                                label: this.$t('authority.no')
                            }
                        ] // 所有可能的筛选条件
                    },
                    functional_permissions: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'selectSingle', // 筛选类型
                        query: [], // 筛选值
                        allList: [] // 所有可能的筛选条件
                    },
                    administrative_authority: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'selectSingle', // 筛选类型
                        query: [], // 筛选值
                        allList: [] // 所有可能的筛选条件
                    },
                    field_permissions: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'selectSingle', // 筛选类型
                        query: [], // 筛选值
                        allList: [] // 所有可能的筛选条件
                    },
                    // 'department': {
                    //     sort: false, // 是否允许排序
                    //     filter: true, // 是否允许筛选
                    //     filterType: 'selectSingle', // 筛选类型
                    //     query: [], // 筛选值
                    //     allList: [], // 所有可能的筛选条件
                    // },
                    email: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    tel: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    sex: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'selectSingle', // 筛选类型
                        query: '', // 筛选值
                        allList: [
                            {
                                value: 1,
                                label: this.$t('crm.Modal.male')
                            },
                            {
                                value: 0,
                                label: this.$t('crm.Modal.female')
                            }
                        ] // 所有可能的筛选条件
                    },
                    remark: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    state: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'selectSingle', // 筛选类型
                        query: [], // 筛选值
                        allList: [
                            {
                                value: 1,
                                label: this.$t('authority.userManagement.unlock')
                            },
                            {
                                value: 2,
                                label: this.$t('authority.userManagement.lock')
                            },
                            {
                                value: 3,
                                label: this.$t('authority.userManagement.workType1')
                            }
                        ] // 所有可能的筛选条件
                    }
                },
                // 表头筛选条件
                queryData: {},
                // 排序
                order_column: '',
                order_type: '',
                storageName_orderColumn: '',

                /* 修改字段 */
                visible_edit_columns: false,
                columnType: 8, // 字段所属模块 1客户2联系人3询盘4公海客户5线索6公海线索7fbleads8权限部门用户管理
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

                /* 分配权限 */
                allocation_modal: false,
                get_functional: {},
                get_user_list: [],

                /* 设置离职 */
                delete_account_modal: false,
                delet_account_loading: false,
                delete_account_title: [],
                delete_account_id: [],
                delete_account_table: [],

                /* 登录安全设置弹框 */
                visible_loginSecuritySet: false,
                loading_loginSecuritySet: false,
                value_loginSecuritySet: false,

                /* 用户列表详情页 */
                showDetail: false, // 是否显示用户详情页
                currentIndex: -1, // 当前点击行的下标
                currentRow: {}, // 当前点击行的数据
                currentUserId: 0, // 当前选中用户的id
                show_import_data: false
            };
        },
        methods: {
            /* 全局 */
            // 功能权限分类
            get_all_functional() {
                this.$commonApi.getRoleAllByPage({
                    category: 2,
                    orgId: this.enterpriseId
                }).then(response => {
                    if (response.code === '1') {
                        const val = response.data.data;
                        const arr = [];
                        for (let i = 0; i < val.length; i++) {
                            const obj = {};
                            obj.label = val[i].name;
                            obj.value = val[i].id;
                            arr.push(obj);
                        }
                        this.authority_function = arr;
                    } else {
                        this.$Message.error(response.message);
                    }
                });
            },
            // 管理权限分类
            get_all_manage() {
                this.$commonApi.getManageAllByPage({
                    orgId: this.enterpriseId
                }).then(response => {
                    if (response.code === '1') {
                        const val = response.data.data;
                        const arr = [];
                        for (let i = 0; i < val.length; i++) {
                            const obj = {};
                            obj.label = val[i].name;
                            obj.value = val[i].id;
                            arr.push(obj);
                        }
                        this.authority_manage = arr;
                    } else {
                        this.$Message.error(response.message);
                    }
                });
            },
            // 字段权限分类
            get_all_field() {
                this.$commonApi.getFieldAllByPage({
                    orgId: this.enterpriseId
                }).then(response => {
                    if (response.code === '1') {
                        const val = response.data.data;
                        const arr = [];
                        for (let i = 0; i < val.length; i++) {
                            const obj = {};
                            obj.label = val[i].name;
                            obj.value = val[i].id;
                            arr.push(obj);
                        }
                        this.authority_field = arr;
                    } else {
                        this.$Message.error(response.message);
                    }
                });
            },

            /* 部门tree */
            // 部门筛选
            search_tree(val) {
                this.expandedIdList.push(val);
                this.selected_department_id = val;
                this.change_selected();
                this.curPage = 1;
                this.refreshData({ clearSelected: true });
            },
            // 部门树渲染
            renderContent(h, { root, node, data }) {
                return h('span', {
                    class: 'user_manage-department-node'
                }, [
                    h('span', [
                        h('span', {
                            style: {
                                cursor: 'pointer',
                                padding: '0 70px 0 4px',
                                color: data.selected ? '#4285f4' : '#333'
                            },
                            on: {
                                click: (event) => {
                                    data.selected = true;
                                    this.selected_department_id = data.id;
                                    this.change_selected();
                                    this.curPage = 1;
                                    this.refreshData({ clearSelected: true });
                                }
                            }
                        }, [
                            data.title.replace(/[^\x00-\xff]/gi, '--').length > 16 ? h('Tooltip', {
                                props: {
                                    placement: 'bottom-start',
                                    content: data.title
                                }
                            }, [
                                h('span', `${this.extractChar(data.title, 16)}...`)
                            ]) : h('span', data.title),
                            h('span', `（${data.num}）`)
                        ])
                    ]),
                    h('span', {
                        class: 'user_manage-department-node-operate'
                    }, [
                        h('span', {
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
                                    marginRight: data.id === 0 ? '36px' : '8px',
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
                                    display: data.id === 0 ? 'none' : 'inline-block'
                                },
                                class: 'tree_icon'
                            })
                        ]),
                        h('span', {
                            on: {
                                click: () => {
                                    // this.remove(data);
                                    this.set_remove(data);
                                }
                            }
                        }, [
                            h('Icon', {
                                props: Object.assign({}, {
                                    custom: 'custom custom-field-delete'
                                }),
                                style: {
                                    cursor: 'pointer',
                                    display: data.id === 0 ? 'none' : 'inline-block'
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
                        if (item.id === id) {
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
                        if (item.id === id) {
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
                this.loadingTree = true;
                this.$commonApi.getDepartmentTree({
                    orgId: this.enterpriseId
                }).then(response => {
                    this.loadingTree = false;
                    if (response.code === '1') {
                        const arr = response.data.list;
                        // 处理部门树 遍历
                        const val = this.get_tree(arr);
                        // 传入一级列表，
                        const arr1 = this.set_tree_children(val);
                        // 置空最外级列表的children
                        this.organization_structure[0].children = [];
                        for (let i = 0; i < arr1.length; i++) {
                            // 存一级列表
                            this.organization_structure[0].children.push(arr1[i]);
                        }
                        // 最外级列表标题
                        this.organization_structure[0].title = response.data.orgName;
                        // 最外级列表个数
                        this.organization_structure[0].num = response.data.companyUserCount;
                        this.get_department = [];
                        this.get_department = this.get_all_department(this.organization_structure[0].children);
                        if (JSON.stringify(this.tree_expand) === '{}') {
                            for (let i = 0; i < this.get_department.length; i++) {
                                this.tree_expand[this.get_department[i].label] = false;
                            }
                        }
                        this.refreshData({ clearSelected: true });
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.departmentErr'));
                        this.organization_structure = [];
                    }
                }).catch(erro => {
                    this.loadingTree = false;
                    this.$Message.error(this.$t('authority.userManagement.departmentErr'));
                    this.organization_structure = [];
                });
            },
            // 部门树遍历 处理
            get_tree(arr) {
                /**
                 * 每一个对象有一个id和parentId
                 * parentId === 0 为一级列表
                 * parentId === id 为二级到多级列表
                 */
                const temp = {};
                const tree = {};
                // 遍历传入的数组
                for (const i in arr) {
                    temp[arr[i].id] = arr[i];
                }
                for (const i in temp) {
                    // parentId === 0的被过滤掉
                    if (temp[i].parentId) {
                        // 找当前的对象的父亲并且它的children为空
                        if (temp[temp[i].parentId] && !temp[temp[i].parentId].children) {
                            // 当前对象的children置为空对象
                            temp[temp[i].parentId].children = new Object();
                        }
                        temp[temp[i].parentId].children[temp[i].id] = temp[i];
                    } else {
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
                    // 给二级列表添加等级参数
                    arr2 = this.build_tree(val[i], 0);
                    arr.push(arr2[0]);
                }
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
                return function(a, b) {
                    const value1 = a[property];
                    const value2 = b[property];
                    return sortType === 'desc' ? value2 - value1 : value1 - value2;
                };
            },
            // 公司部门处理 就是给二级列表及列表下的children添加等级参数
            build_tree(val, hierarchy, obj = {}) {
                hierarchy++; // 等级参数
                const sel = this.selected_department_id === val.id;
                const arr = [];
                obj.title = val.name;
                obj.id = val.id;
                obj.sortNo = val.sortNo;
                obj.parentId = val.parentId;
                obj.remark = val.remark;
                obj.num = val.personCount;

                obj.expand = this.tree_expand[val.name];
                obj.selected = sel;
                obj.children = [];
                obj.hierarchy = hierarchy;
                arr.push(obj);
                const hiera = obj.hierarchy;
                if (val.children) {
                    for (const i in val.children) {
                        obj.children.push(this.build_tree(val.children[i], hiera)[0]);
                    }
                }
                return arr;
            },
            // 获取所有部门  处理下级列表
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
                const curPage = this.curPage;
                // 获取当前页的数据（50个数据）
                this.$commonApi.getUserDataList({
                    ...Object.assign({
                        pageNo: this.curPage,
                        pageSize: this.pageSize,
                        orgId: this.enterpriseId,
                        departmentId: parseInt(this.selected_department_id)
                    }, this.queryData)
                }).then(response => {
                    if (response.code === '1') {
                        this.tableData = response.data.list;
                        // 初始化数据
                        this.initData();
                        this.totalNum = response.data.total;
                        if (this.totalNum > 0 && this.tableData.length === 0 && curPage > 1) {
                            this.curPage = 1;
                            this.refreshData(paramsObj);
                            return;
                        }
                        this.maxPageNum = Math.ceil(this.totalNum / this.pageSize);

                        if (this.tableData.some(item => item.departmentId !== this.tableData[0].departmentId)) {
                            this.organization_structure.selected = true;
                        } else {
                            this.tableData[0] ? this.tableData[0].selected = true : undefined;
                        }
                    } else {
                        this.tableData = [];
                        this.selected_users = [];
                        this.totalNum = 0;
                        this.maxPageNum = 0;
                        this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                    }
                    this.loading = false;
                }).catch(erro => {
                    this.tableData = [];
                    this.selected_users = [];
                    this.totalNum = 0;
                    this.maxPageNum = 0;
                    this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                });
            },
            // 初始化数据
            initData() {
                const arr1 = [];
                const arr2 = [];
                const arr3 = [];
                this.tableData.forEach(item => {
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
                        has_WABA_service: item.canWabaService === 1 ? this.$t('authority.yes') : this.$t('authority.no'),
                        isDeptManager: item.isDeptManager === 1 ? this.$t('authority.yes') : this.$t('authority.no'),
                        isselect: item.isLock,
                        isDelete: item.isDelete,
                        isLoading: false,
                        roleId: item.roleId,
                        roles: item.roles,
                        manageId: item.manageId,
                        fieldId: item.fieldId,
                        fields: item.fields,
                        manages: item.manages,
                        functional_permissions: item.roleName,
                        administrative_authority: item.manageName,
                        field_permissions: item.fieldName,
                        _disabled: item.isDelete,
                        remark: item.remark,
                        createDate: item.createDate,
                        superAdmin: item.superAdmin,
                        phoneNumber: item.phoneStatus ? item.phoneNumber : ''
                    };

                    if (obj.isDelete) {
                        arr2.push(obj);
                    } else if (obj.isselect) {
                        arr3.push(obj);
                    } else {
                        arr1.push(obj);
                    }
                });
                // arr1 = arr1.sort(this.sortBy('id', 'desc'));
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
                    this.selected_users = [];
                });
            },
            // 单选、多选
            handleSelectionChange(val) {
                this.selected_users = val; // 选中数据
                const allOn = this.selected_users.every(item => !item.isselect); // 全部都为"启用"
                const allOff = this.selected_users.every(item => item.isselect); // 全部都为"禁用"
                const superAdmin = this.selected_users.some(item => item.superAdmin); // 包含超管用户
                if (allOn) {
                    this.showLock = 'lock';
                } else if (allOff) {
                    this.showLock = 'unlock';
                } else {
                    this.showLock = '';
                }
                if (superAdmin) {
                    this.isSuperAdmin = true;
                } else {
                    this.isSuperAdmin = false;
                }
            },
            // 表格表头单元格 class 方法
            headerCellClass({ column, columnIndex }) {
                const result = [];
                // 如果可调整列宽, 则设置相应 class
                if (column.resizable) {
                    result.push('resizable-col');
                }

                // 不显示首列( checkbox 列)的表头 checkbox
                if (columnIndex === 0) {
                    result.push('DisableSelection');
                    return result.join(' ');
                }
                // 有 tip 提示的 column , 指定特殊 class , 修改 cell 的 padding 以容纳 tip 和筛选按钮
                if (['has_chat', 'has_inquiries', 'has_fb_service'].includes(column.property)) {
                    const filterSet = this.config_tableFilter[column.property];
                    if (filterSet && filterSet.filter) {
                        result.push('DisableSelection');
                    }
                }

                return result.join(' ');
            },
            // 复选框是否禁用
            checkboxDisabled(row, index) {
                if (row.isDelete === true) {
                    return false; // 禁用
                } else {
                    return true; // 不禁用
                }
            },

            // 获取检索字段名称对应的数据库字段名
            getSearchCon(str) {
                switch (str) {
                    case 'id':
                        return 'id';
                    case 'name':
                        return 'fullname';
                    case 'ename':
                        return 'realName';
                    case 'email':
                        return 'email';
                    case 'lname':
                        return 'username';
                    case 'password':
                        return 'password';
                    case 'tel':
                        return 'phone';
                    case 'department':
                        return 'departmentId';
                    case 'has_chat':
                        return 'canChat';
                    case 'has_inquiries':
                        return 'canGetInquiry';
                    case 'has_fb_service':
                        return 'canFbManage';
                    case 'has_WABA_service':
                        return 'canWabaService';
                    case 'functional_permissions':
                        return 'roleName';
                    case 'administrative_authority':
                        return 'manageName';
                    case 'field_permissions':
                        return 'fieldName';
                    case 'sex':
                        return 'gender';
                    case 'remark':
                        return 'remark';
                    case 'state':
                        return 'userStatus';
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

                    // 系统 tips
                    const helpTip = ['has_chat', 'has_inquiries', 'has_fb_service'].includes(column.key)
                        ? h('HelpTip', {
                            props: {
                                title: (key => {
                                    switch (key) {
                                        case 'has_chat':
                                            return this.$t('helpTip.hasChat');
                                        case 'has_inquiries':
                                            return this.$t('helpTip.hasInquiries');
                                        case 'has_fb_service':
                                            return this.$t('helpTip.isfbService');
                                    }
                                })(column.key)
                            },
                            class: 'table-head-tip'
                        })
                        : undefined;

                    // 排序组件
                    let order_column = this.getSearchCon(column.key);
                    if (order_column === 'create_user_id') {
                        order_column = 'create_user';
                    }
                    const sortIcons = h('span', {
                        class: {
                            'table-sort-icon-container': true
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
                            // nativeOn: {
                            //     click: () => {
                            //         if (this.order_column === order_column && this.order_type === 'asc') {
                            //             this.order_column = '';
                            //             this.order_type = '';
                            //         } else {
                            //             this.order_column = order_column;
                            //             this.order_type = 'asc';
                            //         }
                            //         this.refreshData();
                            //     }
                            // }
                        }),
                        h('Icon', {
                            class: {
                                'icon-custom-on': true,
                                'icon-custom-on-active': this.order_column === order_column && this.order_type === 'desc'
                            },
                            props: {
                                type: 'md-arrow-dropdown'
                            }
                            // nativeOn: {
                            //     click: () => {
                            //         if (this.order_column === order_column && this.order_type === 'desc') {
                            //             this.order_column = '';
                            //             this.order_type = '';
                            //         } else {
                            //             this.order_column = order_column;
                            //             this.order_type = 'desc';
                            //         }
                            //         this.refreshData();
                            //     }
                            // }
                        })
                    ]);

                    // 筛选组件
                    const filterPop = h('FilterBox', {
                        style: {
                            right: '-20px'
                        },
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
                    }, [
                        title,
                        (this.order_column === order_column && this.order_type) ? sortIcons : undefined,
                        column.hasOwnProperty('show_filter_content') ? filterPop : undefined,
                        helpTip
                    ]);
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
            row_class_name({ row, rowIndex }) {
                // 把每一行的索引放进row
                row.index = rowIndex;
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
                this.get_department =
                    this.get_all_department(this.organization_structure[0].children);
                this.updata_modal = true;

                obj.sex = val.sex == this.$t('authority.male') ? 1 : 0;
                obj.has_chat = val.has_chat == this.$t('authority.yes') ? 1 : 2;
                obj.has_inquiries = val.has_inquiries == this.$t('authority.yes') ? 1 : 2;
                obj.has_fb_service = val.has_fb_service == this.$t('authority.yes') ? 1 : 2;
                obj.has_WABA_service = val.has_WABA_service == this.$t('authority.yes') ? 1 : 2;
                obj.isDeptManager = val.isDeptManager == this.$t('authority.yes') ? 1 : 2;
                this.get_updata_info = obj;
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
            // 批量设置离职
            delete_account_batch(currentUser) {
                const arr = [];
                const getId = [];
                const val = currentUser || this.selected_users;
                for (let i = 0; i < val.length; i++) {
                    const obj = {};
                    obj.id = val[i].id;
                    obj.name = val[i].name;
                    arr.push(obj);
                    getId.push(obj.id);
                }
                this.delete_account_title = arr;

                selectDeleteUserList({
                    orgId: this.enterpriseId,
                    userIdList: getId
                }).then(response => {
                    if (response.code === '1') {
                        this.delete_account_id = response.data.success;
                        this.delete_account_table = response.data.fail;
                    } else {
                        this.$Message.error(response.message);
                    }
                });
                this.delete_account_modal = true;
            },
            // 禁用
            updateLockTargetAccount(currentUser) {
                this.change_lock_modal(true, 2);
                this.lock_target_account = currentUser;
            },
            change_lock_modal(flag, operateSource) {
                flag ? this.operateSource = operateSource : '';
                this.lock_account_modal = flag;
                operateSource === 0 ? this.lock_target_account = this.selected_users : '';
                if (!flag && this.operateSource === 1) {
                    this.$set(this.lock_target_account[0], 'isselect', false);
                }
            },
            // 账号禁用
            lock_account() {
                /* let arr = []
                  let val = this.selected_users.length > 0 ? this.selected_users : this.lock_target_account
                  for (let i = 0; i < val.length; i++) {
                      arr.push(val[i].id)
                  }
                this.lock_accountIds = arr; */
                lockOrUnlockAccount({
                    data: {
                        orgId: this.enterpriseId,
                        userIdList: this.lock_accountIds
                    }
                }).then(response => {
                    if (response.code === '1') {
                        this.refreshData({ clearSelected: true });
                        this.$Message.success(this.$t('authority.userManagement.typeSuccess'));
                    } else {
                        this.$Message.error(response.message);
                        this.refreshData({ clearSelected: true });
                    }
                    this.change_lock_modal(false);
                });
            },
            // 改变账号状态
            state_change(boo, users) {
                // 获取 userIdList
                const userIdList = users.map(item => item.id);

                // userIdList 为空判断
                if (!userIdList.length) {
                    this.$Message.error(this.$t('crm.Table.errorOccurred'));
                    return;
                }

                lockOrUnlockAccount({
                    data: {
                        operatorName: this.userName,
                        orgId: this.enterpriseId,
                        userIdList
                    },
                    boo
                }).then(response => {
                    if (response.code === '1') {
                        this.$Message.success(this.$t('authority.userManagement.typeSuccess'));
                        this.refreshData({ clearSelected: true });
                    } else {
                        if (response.message === '本企业的已启用账号数已达上限，请联系负责人购买更多账号') {
                            // this.$Message.error(response.message);
                            this.$Message.error(this.$t('authority.userManagement.userNumLimitTip'));
                        }
                        this.refreshData({ clearSelected: true });
                    }
                });
            },
            // 清空已选
            clear_selected_users() {
                this.selected_users = [];
            },
            // 新建用户
            async add_user() {
                // 派发action获取公司信息
                await this.$store.dispatch('getCompanyInformation');
                this.get_department = [];
                this.get_department = this.get_all_department(this.organization_structure[0].children);
                /**
                 * 离职的账号，不会被真的删除，在获取部门树是会显示出来，但是不能操作
                 */
                // 账号共多少个和账号启用了多少作对比  1000<80
                if (this.user_limit <= this.used_number) {
                    this.$Message.error(this.$t('authority.userManagement.userNumLimitTip'));
                } else {
                    this.add_modal = true;
                }
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
                // 获取部门树
                this.set_tree();
                // 刷新数据
                // this.refreshData({ clearSelected: true });
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
            // 新增部门
            set_add_tree(val) {
                const obj = {};
                this.get_add_form = val;
                obj.name = val.name;
                obj.remark = val.remark;
                obj.sortNo = val.sortNo;
                obj.parentId = this.get_tree_data.id;
                obj.createPerson = this.userName;
                obj.orgId = this.enterpriseId;
                departmentAdd(obj).then(response => {
                    this.tree_modal_loading = false;
                    if (response.code === '1') {
                        this.$Message.success(this.$t('authority.userManagement.addSuccess'));
                        this.get_add_form = {};
                        // 获取部门树的数据
                        this.set_tree();
                        this.add_tree = false;
                    } else {
                        if (response.data === 1201) {
                            this.$Message.error(this.$t('authority.userManagement.addFail1'));
                        } else {
                            this.$Message.error(response.message);
                        }
                    }
                }).catch((err) => {
                    console.log(err);
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
            // 更新部门
            set_updata_tree(val) {
                const obj = {};
                obj.name = val.name;
                obj.remark = val.remark;
                obj.sortNo = val.sortNo;
                obj.id = this.get_tree_data.id;
                obj.updatePerson = this.userName;
                obj.orgId = this.enterpriseId;
                departmentUpdate(obj).then(response => {
                    if (response.code === '1') {
                        this.tree_updata_loading = false;
                        this.$Message.success(this.$t('authority.userManagement.editSuccess'));
                        // 获取部门树
                        this.set_tree();

                        this.updata_tree = false;
                    } else {
                        this.$Message.error(response.message);
                    }
                });
            },

            /* 模态框--删除部门 */
            set_remove(val) {
                this.get_tree_data = val;
                this.$confirm(`确定删除 ${val.title} 部门吗？`, this.$t('editSure'))
                    .then(_ => {
                        departmentDelete({
                            id: val.id
                        }).then(response => {
                            if (response.code === '1') {
                                this.$Message.success(this.$t('authority.userManagement.delSuccess'));
                                this.set_tree();
                            } else {
                                this.$Message.error(response.message);
                            }
                        });
                    });
            },

            /* 模态框--分配权限 */
            // 权限更改时重新获取用户列表
            change_permission(isDeleteAccount) {
                isDeleteAccount ? this.showDetail = false : '';
                this.refreshData({ clearSelected: true });
            },

            /* 模态框--设置离职 */
            change_delete_account(val) {
                this.delete_account_modal = val;
            },
            change_account_loading(val) {
                this.delet_account_loading = val;
            },

            /* 模态框--登录安全设置 */
            // 弹框显隐回调
            toggle_loginSecuritySet(boo) {
                if (boo) {
                    // 显示, 请求设置项
                    this.get_loginSecuritySet();
                } else {
                    // 关闭, 取消 loading
                    this.loading_loginSecuritySet = false;
                }
            },
            // 保存设置项
            ok_loginSecuritySet() {
                saveSecuritySet({
                    orgId: this.enterpriseId,
                    editUserId: this.userId,
                    isVerify: this.value_loginSecuritySet ? 1 : 0
                }).then(res => {
                    if (res.code === '1') {
                        this.$Message.success(this.$t('crm.Table.success_save'));
                        this.visible_loginSecuritySet = false;
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_save'));
                        this.loading_loginSecuritySet = false;
                    }
                });
            },
            // 获取设置项
            get_loginSecuritySet() {
                // 先把设置项恢复初始状态
                this.value_loginSecuritySet = false;

                // 请求设置
                this.loading_loginSecuritySet = true;
                getSecuritySet({
                    orgId: this.enterpriseId
                }).then(res => {
                    if (res.code === '1') {
                        this.value_loginSecuritySet = res.data === 1;
                    } else {
                        // 失败提示
                        this.$Message.error(this.$t('mail.writeLetter.addContactModal.requestErrorTip'));
                    }
                    this.loading_loginSecuritySet = false;
                });
            },

            // 点击表格行
            clickRow(data, index) {
                /* data--选中行的数据  index-点击表格行选中行的下标 */
                const event = window.event || { target: {} };
                const explorer = window.navigator.userAgent;
                let selector = '';
                // 判断浏览器
                if (explorer.indexOf('MSIE') >= 0 || explorer.indexOf('Opera') >= 0) {
                    const selected = document.selection.createRange();
                    selector = selected.text;
                } else {
                    selector = window.getSelection();
                }
                // 返回一个  Selection 对象，表示用户选择的文本范围或光标的当前位置。
                /*
                 None: 当前没有选择。
                 Caret: 选区已折叠（即 光标在字符之间，并未处于选中状态）。
                 Range: 选择的是一个范围。
                 */
                this.currentIndex = data.index;
                if (selector.type !== 'Range' && document.activeElement.tagName !== 'INPUT' && event.target.className.indexOf('el-switch') === -1) {
                    this.currentUserId = data.id;
                    const res = this.tableData.find(item => item.id === this.currentUserId);
                    if (!res._disabled) {
                        this.currentRow = res;
                        this.showDetail = true;
                    }
                }
            }
        },
        created() {
            this.set_tree();
        },
        mounted() {
            // 获取部分筛选下拉选项
            this.get_all_functional();
            this.get_all_manage();
            this.get_all_field();

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

            /* 配置表格显示项 */
            getFieldOrderList({
                orgId: this.enterpriseId,
                userId: this.userId,
                type: this.columnType
            }).then(response => {
                if (response.code === '1') {
                    if (response.data) {
                        // 解构数据
                        const { id, showField, fieldStyle } = response.data;
                        this.id_column_show_order = id;

                        // 处理字段顺序
                        if (typeof showField === 'string') {
                            const fields = showField.split(',');
                            this.group = fields.filter(item => this.allGroup.includes(item));
                        } else {
                            this.group = this.allGroup.slice();
                        }

                        // 处理字段宽度
                        this.fieldStyle = fieldStyle ? JSON.parse(fieldStyle) : {};
                        Object.entries(this.fieldStyle).forEach(([fieldKey, fieldObj]) => {
                            const column = this.allColumns.find(item => item.key === fieldKey);
                            if (column && fieldObj.width) {
                                column.width = fieldObj.width;
                            }
                        });
                    } else {
                        this.group = this.allGroup.slice();
                    }
                } else {
                    this.$Message.error(this.$t('crm.Table.getTableColumnOrder'));
                    this.group = this.allGroup.slice();
                }
            }).catch(erro => {
                this.$Message.error(this.$t('crm.Table.getTableColumnOrder'));
                this.group = this.allGroup.slice();
            });
        },
        watch: {
            'app.companyInformation'(val) {
                if (val) {
                    // 储存公司信息,并处理
                    const companyInformation = this.app.companyInformation;
                    if (companyInformation) {
                        this.used_number = companyInformation.list[0].usedNum;
                        this.user_limit = companyInformation.list[0].userLimit;
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getCompanyTableData'));
                    }
                }
            },
            group: {
                handler(val) {
                    this.changeGroups(val);
                },
                immediate: true
            },
            authority_function: {
                handler(val) {
                    const temp = this.config_tableFilter.functional_permissions;
                    /* 直接对val做浅拷贝会使得this.authority_function原来的值发生改变，因此此处改为深拷贝 */
                    /* temp.allList = (Array.isArray(val) && val.length) ? val.map(item => Object.assign(item, {value: item.label})) : []; */
                    const newArr = JSON.parse(JSON.stringify(val));
                    temp.allList = (Array.isArray(newArr) && newArr.length) ? newArr.map(item => Object.assign(item, { value: item.label })) : [];
                    this.$set(this.config_tableFilter, 'functional_permissions', temp);
                },
                immediate: true
            },
            authority_manage: {
                handler(val) {
                    const temp = this.config_tableFilter.administrative_authority;
                    /* 直接对val做浅拷贝会使得this.authority_function原来的值发生改变，因此此处改为深拷贝 */
                    /* temp.allList = (Array.isArray(val) && val.length) ? val.map(item => Object.assign(item, {value: item.label})) : []; */
                    const newArr = JSON.parse(JSON.stringify(val));
                    temp.allList = (Array.isArray(newArr) && newArr.length) ? newArr.map(item => Object.assign(item, { value: item.label })) : [];
                    this.$set(this.config_tableFilter, 'administrative_authority', temp);
                },
                immediate: true
            },
            authority_field: {
                handler(val) {
                    const temp = this.config_tableFilter.field_permissions;
                    /* 直接对val做浅拷贝会使得this.authority_function原来的值发生改变，因此此处改为深拷贝 */
                    /* temp.allList = (Array.isArray(val) && val.length) ? val.map(item => Object.assign(item, {value: item.label})) : []; */
                    const newArr = JSON.parse(JSON.stringify(val));
                    temp.allList = (Array.isArray(newArr) && newArr.length) ? newArr.map(item => Object.assign(item, { value: item.label })) : [];
                    this.$set(this.config_tableFilter, 'field_permissions', temp);
                },
                immediate: true
            },
            // all_department: {
            //     handler(val) {
            //         let temp = this.config_tableFilter['department'];
            //         temp.allList = (Array.isArray(val) && val.length) ? val.map(item => {
            //             return {
            //                 value: item.value,
            //                 label: item.label
            //             }
            //         }) : [];
            //         this.$set(this.config_tableFilter, 'department', temp);
            //     },
            //     immediate: true
            // },
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
                this.showDetail ? '' : this.currentUserId = 0;
            }
        }
    };
</script>

<style lang="less" scoped>
    .user-management-tree {
        /deep/ .el-tree {
            font-size: 12px;
        }
        /deep/ .el-tree>.el-tree-node{
            min-width:100%;
            display: inline-block;
        }
    }
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
        border-radius: 4px 0 0 4px !important;
    }

    .loginSecuritySet-btn {
        font-size: 12px;
        line-height: 17px;
        color: #3B78DE;
        cursor: pointer;

        &:hover {
            color: #2D63BC;
        }
    }
    .custom-chaoguanzhanghao {
        color:#FBBC04;
        margin-left:4px;
        font-size: 14px;
    }
</style>

<style lang="less">
    .table-head-tip{
        position: relative;
        right: 0;
    }
    .el-tooltip__popper{
        max-width: 250px;
    }
    .el-table .DisableSelection .cell .el-checkbox__inner{
        display: none !important;
        position: relative;
    }
    .el-table .DisableSelection .cell:before{
        content: "";
        position: absolute;
    }
    .operation_button {
        color: rgba(0,0,0,.8);
        font-size: 12px;
        margin: 0 20px;
        .custom {
            color: #677F99;
            margin: 4px;
        }

        &:hover {
            color: #4285F4;
        }
    }

    .el-tree-node__content {
        .user_manage-department-node {
            display: inline-block;
            padding-right: 10px;
            height: 25px;
            position: relative;
        }

        .user_manage-department-node-operate {
            display: none;
            margin-left: 32px;
            overflow: hidden;
            position: absolute;
            right: 20px;
        }

        &:hover {
            .user_manage-department-node-operate {
                display: inline-block;
            }
        }
    }
</style>
