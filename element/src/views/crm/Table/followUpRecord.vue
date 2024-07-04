<template>
    <div class="followUp_record crm-table-page">
        <div class="followUp_record-header">
            <div class="followUp_record_left">
                <Dropdown trigger="click" @command="changeMyOrAll" style="line-height: 36px; vertical-align:middle;">
                    <h1 class="switch-title">
                        {{page_title}}
                        <Icon custom="custom custom-menu-arrow" class="switch-title-icon" color="#7B98B6" size="10"></Icon>
                    </h1>
                    <DropdownMenu slot="dropdown">
                        <DropdownItem command="3">{{$t('crm.followUpRecord.allFollowUpRecord')}}
                        </DropdownItem>
                        <DropdownItem command="2">{{$t('crm.followUpRecord.myFollowUpRecord')}}
                        </DropdownItem>
                        <DropdownItem command="4">{{$t('crm.followUpRecord.subordinateFollowUp')}}
                        </DropdownItem>
                        <DropdownItem command="5">{{$t('crm.followUpRecord.followingUp')}}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <FilterTags
                        style="top: 2px;left: 16px; height: 36px;"
                        :order_column="sort"
                        :order_type="sortType"
                        :filterConObj.sync="config_tableFilter"
                        :langObj="lang_followup"
                        :storageName_orderColumn="sort"
                        :width="600"
                        :removeWidth="1100"
                        :minWidth="390"
                        :tagMaxWidth="300"
                        @change_filter_tag="change_filter_tag"
                        @emptySort="empty_sort"
                        @removeCon="remove_filter_tag"
                ></FilterTags>
            </div>
            <div class="table-operate-btns">
                <!-- 文件导出 -->
                <Tooltip :content="$t('crm.Table.exportData')" effect="dark" placement="bottom">
                    <Button v-if="authorized_button['exportData']"
                        type="text"
                        icon="custom custom-file-download"
                        @click="exportData"
                        class="piwik_download_table_followUpRecord customer-filedownload custom-file-download-border"></Button>
                </Tooltip>
                <HelpTip :title="$t('helpTip.exportData')"></HelpTip>

                 <!-- 按钮组 -->
                <span v-if="authorized_button['newFolloUp'] || authorized_button['importData']"
                        class="newCreate-btn-group">
                    <!-- 外部按钮 -->
                    <template v-if="authorized_button['newFolloUp']">
                        <!-- 新建客户 -->
                        <Button type="text"
                                @click="createFolloUp"
                                class="newCreate-btn-group-newCreate">{{ $t('crm.Table.newCompany') }}</Button>
                    </template>
                    <!-- 导入数据 -->
                    <template v-else>
                        <Button type="text"
                                @click.stop="show_import_data=true"
                                class="newCreate-btn-group-import">{{ $t('crm.Table.importData') }}</Button>
                    </template>

                    <!-- 下拉 导入数据 -->
                    <template v-if="authorized_button['newFolloUp'] && authorized_button['importData']">
                        <Dropdown placement="bottom-end">
                            <Button icon="custom custom-menu-arrow"
                                    class="dropIcon">
                                <span style="display: none;">_</span>
                            </Button>
                            <DropdownMenu slot="dropdown">
                                <DropdownItem @click.native.stop="show_import_data=true">
                                    <span v-if="authorized_button['importData']">{{ $t('crm.Table.importData') }}</span>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </template>
                </span>
            </div>
        </div>
        <div>
            <Table
                v-if="reset_header_flag"
                :data="tableList"
                :height="tableHeight"
                ref="multipleTable"
                :isCustom="true"
                :border="true"
                stripe
                v-loading="tableLoading"
                :row-class-name="getRowClassName"
                :header-cell-class-name="headerCellClass"
                highlight-current-row
                :customEmptyText="customEmptyTextLang"
                :customEmptyButtonText="customEmptyButtonTextLang"
                :customClearMethod="clearFilterConditionByInitView"
                @mousemove.native="handleTableColHover"
                @mousedown.native="handleTableColResizeStart"
                @header-dragend="handleTableColResizeEnd"
                class="tabmain noBoxShadow-right noborder-table resizable-table">
                <TableColumn
                        v-for="(item, index) in currentColumns"
                        :width="item.width"
                        :min-width="item.minWidth || 64"
                        :key="index"
                        :prop="item.key"
                        :class-name="item.class"
                        :label="item.title"
                        :formatter="item.formatter"
                        :render-header="item.renderHeader"
                        :show-overflow-tooltip="true"
                >
                    <template slot-scope="scope">
                        <template v-if="item.key === 'followupContent'">
                            <div class="followupContent_flex">
                                <span @click.stop="handleClick(item,scope.row)">
                                    {{scope.row[item.key]}}
                                </span>
                                <Icon v-if="scope.row.isPictures" custom="custom-icon_appendix" size="14" color="#A9B9C9"></Icon>
                            </div>
                        </template>
                        <template v-else-if="item.formatter">{{ (item.formatter)(scope.row) }}</template>
                        <template v-else>
                            <span @click.stop="handleClick(item,scope.row)">
                                {{ scope.row[item.key] ? scope.row[item.key] : '-' }}
                            </span>
                        </template>
                    </template>
                </TableColumn>
                <!-- 末列字段配置按钮 -->
                <TableColumn fixed="right"
                    width="35"
                    align="center"
                    :resizable="false"
                    class-name="no-padding-cell">
                    <template slot="header" slot-scope="scope">
                        <Icon custom="custom-table-edit-columns" size="18" color="#c3cdd9" class="cursor-pointer" @click.native.prevent="editColumns()"></Icon>
                    </template>
                </TableColumn>
            </Table>
            <div>
                <Page
                    :total="total"
                    :current-page.sync="currentPageNum"
                    :page-size="pageSize"
                    :page-sizes="[20, 50, 100]"
                    class="pageWrap-right"
                    layout="total, prev, pager, next, sizes, jumper"
                    @current-change="pageChange"
                    @size-change="pageSizeChange"
                >
                </Page>
            </div>
        </div>
        <!-- 编辑表头 -->
        <EditColumns
            :visible.sync="visible_edit_columns"
            fieldDisableAndFixed="followupContent"
            :columnType="columnType"
            :id.sync="id_column_show_order"
            :allColumns="allColumns"
            :allGroup="allHeaders"
            :group.sync="headerDisplayItem">
        </EditColumns>
        <!-- 导入数据 -->
        <ImportData
            :visible.sync="show_import_data"
            type="followUpRecord"
            @refreshData="getListData"></ImportData>
        <!-- 详情弹窗 -->
        <detailDrawer
            :visible.sync="show_detail"
            :detailId="detailId"
            :change_flag_new_followUp="change_flag_new_followUp"
            @editFollowup="editFollowup">
        </detailDrawer>
        <followUpRecordModal
            v-if="add_followup_modal"
            :visible.sync="add_followup_modal"
            :detail="editDetail"
            @changeFollowUp="changeFollowUp"
            @refresh="getListData">
        </followUpRecordModal>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import resetComponentViewData from '@/mixins/resetComponentViewData';
    import tableColResize from '@/mixins/tableColResize';
    import ImportData from '@/views/crm/Table/Components/Modal/importData';
    import FilterTags from '@/views/main-components/filter-tags';
    import EditColumns from '@/views/crm/Table/Components/Modal/editColumns';
    import detailDrawer from '@/views/crm/Table/Components/Html/followUpRecord/detailDrawer';
    import followUpRecordModal from '@/views/crm/Table/Components/Modal/followUpRecord/followUpRecordModal';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { crmCommon, crmFollowupRecord } from '@/api/crm/index';
    export default {
        name: 'followUpRecord',
        mixins: [resetComponentViewData, tableColResize],
        components: {
            FilterTags,
            EditColumns,
            ImportData,
            detailDrawer,
            followUpRecordModal
        },
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height',
                button_list: state => state.app.button_list,
                followupTypes: state => state.crm.followUpType
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            tableHeight() {
                return this.window_height - 174;
            },
            authorized_button() {
                const ids = BUTTON_IDS.followUpRecord;
                return {
                    newFolloUp: !HANDLE_BUTTON(ids.newFollowUp, this.button_list),
                    exportData: !HANDLE_BUTTON(ids.dataExport, this.button_list),
                    importData: !HANDLE_BUTTON(ids.dataImport, this.button_list)
                };
            },
            page_title() {
                if (this.type === 3) return this.$t('crm.followUpRecord.allFollowUpRecord');
                if (this.type === 2) return this.$t('crm.followUpRecord.myFollowUpRecord');
                if (this.type === 4) return this.$t('crm.followUpRecord.subordinateFollowUp');
                return this.$t('crm.followUpRecord.followingUp');
            },
            allHeaders() {
                return this.allColumns.map(item => item.key);
            }
        },
        data() {
            return {
                cancelFunc: null,
                total: 0, // 列表数据总条数
                currentPageNum: 1, // 当前页码
                type: 5,
                pageSize: 20, // 当前页显示条数
                tableLoading: true, // 表格loading
                // 列表数据
                tableList: [],
                // 表头筛选条件初始化
                config_tableFilter: {
                    followupContent: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值, 对应上述类型
                        allList: null
                    },
                    companyName: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值, 对应上述类型
                        allList: null
                    },
                    createUser: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        selectAll: true, // 增加选项 全选
                        query: [], // 筛选值, 对应上述类型
                        allList: []
                    },
                    followupType: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        selectAll: true, // 增加选项 全选
                        query: [], // 筛选值, 对应上述类型
                        allList: []
                    },
                    updateTime: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型
                        query: [], // 筛选值, 对应上述类型
                        allList: null
                    },
                    followupTime: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型
                        query: [], // 筛选值, 对应上述类型
                        allList: null
                    },
                    createTime: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型
                        query: [], // 筛选值, 对应上述类型
                        allList: null
                    },
                    targetType: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        query: [], // 筛选值, 对应上述类型
                        allList: [
                            { value: 1, label: this.$t('crm.Table.customer') },
                            { value: 2, label: this.$t('crm.Html.contact') },
                            { value: 3, label: this.$t('crm.Table.inquiry') }
                        ]
                    },
                    site: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值, 对应上述类型
                        allList: null
                    }
                },
                queryData: {
                    $and: []
                },
                // sortType: '', // 排序方式
                // sort: '',
                sort: localStorage.getItem('followUpRecord_sort') ? localStorage.getItem('followUpRecord_sort') : '',
                sortType: localStorage.getItem('followUpRecord_sortType') ? localStorage.getItem('followUpRecord_sortType') : '',
                lang_followup: {
                    followupContent: this.$t('crm.followUpRecord.followUpContent'),
                    companyName: this.$t('crm.followUpRecord.associatedCustomers'),
                    createUser: this.$t('crm.followUpRecord.createUser'),
                    followupType: this.$t('crm.followUpRecord.followUpStatus'),
                    updateTime: this.$t('crm.followUpRecord.updateTime'),
                    followupTime: this.$t('crm.followUpRecord.followUpTime'),
                    createTime: this.$t('crm.followUpRecord.createTime'),
                    targetType: this.$t('crm.followUpRecord.followUpObject'),
                    site: this.$t('crm.followUpRecord.address')
                },
                // 编辑列表显示相关
                visible_edit_columns: false,
                id_column_show_order: undefined,
                // 设置字段宽度时的值
                columnType: 34,
                // 用户设置过的字段显示长度
                fieldStyle: {},
                reset_header_flag: true,
                companyName: '',
                allColumns: [
                    {
                        title: this.$t('crm.followUpRecord.followUpContent'),
                        key: 'followupContent',
                        class: 'canClick'
                    },
                    {
                        title: this.$t('crm.followUpRecord.associatedCustomers'),
                        key: 'companyName',
                        class: 'canClick'
                    },
                    {
                        title: this.$t('crm.followUpRecord.createUser'),
                        key: 'createUser'
                    },
                    {
                        title: this.$t('crm.followUpRecord.followUpStatus'),
                        key: 'followupType',
                        formatter: row => {
                            return this.followupTypeFilter(row.followupType);
                        }
                    },
                    {
                        title: this.$t('crm.followUpRecord.updateTime'),
                        key: 'updateTime',
                        formatter: row => {
                            return row.updateTime ? this.$options.filters.timeFormat(row.updateTime, 'yyyy-MM-dd hh:mm') : '-';
                        }
                    },
                    {
                        title: this.$t('crm.followUpRecord.followUpTime'),
                        key: 'followupTime',
                        formatter: row => {
                            return this.$options.filters.timeFormat(row.followupTime, 'yyyy-MM-dd hh:mm');
                        }
                    },
                    {
                        title: this.$t('crm.followUpRecord.createTime'),
                        key: 'createTime',
                        formatter: row => {
                            return this.$options.filters.timeFormat(row.createTime, ' yyyy-MM-dd hh:mm');
                        }
                    },
                    {
                        title: this.$t('crm.followUpRecord.followUpObject'),
                        key: 'targetType',
                        formatter: row => {
                            return this.targetTypeFilter(row.targetType);
                        }
                    },
                    {
                        title: this.$t('crm.followUpRecord.address'),
                        key: 'site'
                    }
                ],
                currentColumns: [],
                headerDisplayItem: [],
                show_import_data: false,
                change_flag_new_followUp: false,
                // 详情相关
                show_detail: false,
                detailId: null,
                // 新建
                add_followup_modal: false,
                // 编辑时
                editDetail: null
            };
        },
        filters: {
        },
        created() {
            // 获取跟进方式数据
            this.$store.dispatch('getFollowUpType');
            // 获取全部用户
            this.get_user_list();
            this.init();
        },
        mounted() {
        },
        methods: {
            // 指定表格行 class name
            getRowClassName({ row, rowIndex }) {
                // if (rowIndex % 2 === 0) {
                //     return 'one_row_background';
                // } else if (rowIndex % 2 === 1) {
                //     return 'pair_row_background';
                // }
                // return '';
            },
            // 表格表头单元格 class 方法
            headerCellClass({ column }) {
                // 如果可调整列宽, 则设置相应 class
                if (column.resizable) {
                    return 'resizable-col';
                }
            },
            // 获取全部用户 包含离职、禁用的
            get_user_list() {
                this.$commonApi.getUserDataList({
                    departmentId: 0,
                    orgId: this.enterpriseId,
                    pageNo: 1,
                    pageSize: 2000
                }).then((data) => {
                    if (data.code === this.ERR_CODE) {
                        const allList = data.data.list.map(item => {
                            const { fullname: label, id: value } = item;
                            return { label, value };
                        });
                        this.$set(this.config_tableFilter.createUser, 'allList', allList);
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                    }
                }).catch(erro => {
                    this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                });
            },
            setFollowupTypes() {
                this.config_tableFilter.followupType.allList = this.followupTypes;
            },
            // 编辑显示列
            editColumns() {
                this.visible_edit_columns = true;
            },
            resetHeader(col) {
                this.reset_header_flag = false;
                this.currentColumns = this.allColumns.filter(item => col.includes(item.key)).sort((prev,next) => {
                    return col.indexOf(prev.key) - col.indexOf(next.key)
                });
                this.$nextTick(() => {
                    this.reset_header_flag = true;
                });
            },
            // 切换全部和自创
            changeMyOrAll(command) {
                this.type = Number(command);
                // 切换我的、全部 刷新列表
                this.refreshData_filter();
            },
            handleClick(column, row) {
                if (column.key === 'followupContent') {
                    this.detailId = row.id;
                    this.show_detail = true;
                    this.$refs.multipleTable.setCurrentRow(row);
                    return;
                }
                if (column.key === 'companyName') {
                    // 判断是否有"我的客户"页面权限
                    if (!this.isContainsMenu('myCustomer')) {
                        // 没有"我的客户"页面权限, 弹出提示并退出流程
                        this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                        return;
                    }
                    this.$viewCustomer(row.companyId);
                }
            },
            // 翻页
            pageChange(num) {
                this.currentPageNum = num;
                this.getListData();
                this.$refs.multipleTable.$el.querySelector('.el-table__body-wrapper').scrollTop = 0;
            },
            /** 改变表格每页展示数据量 */
            pageSizeChange(size) {
                this.pageSize = size;
                const data = {
                    orgId: this.orgId,
                    userId: this.userId,
                    key: 'followUpRecord',
                    value: size.toString()
                };
                crmCommon.userconfigUpdate(data);
                this.getListData();
            },
            // 初始化表头的筛选项
            init() {
                const expandTemp = [
                    // 'followupContent'
                ];
                this.allColumns = this.allColumns.map((col, index) => {
                    col.show_filter_content = false;
                    col.filtering = false;
                    if (col.key && !expandTemp.includes(col.key)) {
                        col.renderHeader = this.renderHeader_filter(index);
                    }
                    return col;
                });
                const data = {
                    orgId: this.orgId,
                    userId: this.userId,
                    type: this.columnType,
                    parentId: -1,
                    key: 'followUpRecord'
                };
                crmCommon.getCommonConfig(data).then(res => {
                    if (res.code === '1') {
                        if (res.data.fieldOrder) {
                            // 解构数据
                            const { id, showField, fieldStyle } = res.data.fieldOrder;
                            this.id_column_show_order = id;
                            if (typeof showField === 'string') {
                                const fields = showField.split(',');
                                this.headerDisplayItem = fields.filter(item => this.allHeaders.includes(item));
                            } else {
                                this.headerDisplayItem = this.allHeaders;
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
                            this.headerDisplayItem = this.allHeaders;
                        }
                        //  用户当前设置页数 开始
                        if (res.data.userConfig && res.data.userConfig.value) {
                            const size = parseInt(res.data.userConfig.value);
                            this.pageSize = size;
                        } else {
                            this.pageSize = 20;
                            // 没有设置过要 新增下
                            const data = {
                                orgId: this.orgId,
                                userId: this.userId,
                                key: 'followUpRecord',
                                value: this.pageSize.toString()
                            };
                            crmCommon.userconfigAdd(data);
                        }
                        const followupType = JSON.parse(localStorage.getItem('leadsCloud-followUpRecord-followup-type'));
                        const followupTime = JSON.parse(localStorage.getItem('leadsCloud-followUpRecord-followup-time'));
                        const followupCreateType = JSON.parse(localStorage.getItem('leadsCloud-followUpRecord-followup-createType'));
                        if (followupType) {
                            this.type = followupCreateType;
                            localStorage.removeItem('leadsCloud-followUpRecord-followup-type');
                            localStorage.removeItem('leadsCloud-followUpRecord-followup-time');
                            localStorage.removeItem('leadsCloud-followUpRecord-followup-createType');
                            this.config_tableFilter.followupType.query[0] = this.config_tableFilter.followupType.allList.find(v => v.attrTypeValue === followupType.followupType);
                            this.config_tableFilter.followupTime.query = followupTime;
                        }
                        this.getListData();
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                        this.tableLoading = false;
                    }
                });
            },
            /** 表头渲染 */
            renderHeader_filter(colIndex) {
                return h => {
                    const column = this.allColumns[colIndex];
                    // 渲染表头
                    const title = h(
                        'div',
                        {
                            attrs: {
                                title: column.title
                            },
                            class: 'table-filter-title'
                        },
                        column.title
                    );
                    // 排序组件
                    const sortIcons = h(
                        'span',
                        {
                            class: {
                                'ivu-table-sort': true
                            }
                        },
                        [
                            h('Icon', {
                                class: {
                                    on: this.sort === column.key && this.sortType === 'asc'
                                },
                                props: {
                                    type: 'md-arrow-dropup'
                                }
                            }),
                            h('Icon', {
                                class: {
                                    on: this.sort === column.key && this.sortType === 'desc'
                                },
                                props: {
                                    type: 'md-arrow-dropdown'
                                }
                            })
                        ]
                    );
                    // 筛选组件
                    const filterPop = h('FilterBox', {
                        ref: `tableHeaderFilterBox${colIndex}`,
                        props: Object.assign(
                            {
                                showPopper: this.allColumns[colIndex].show_filter_content,
                                columnCon: this.allColumns[colIndex].key,
                                order_column: column.key,
                                columnKey: column.key,
                                order_type: column.key,
                                filtering: this.allColumns[colIndex].filtering
                            },
                            this.config_tableFilter[column.key]
                        ),
                        on: {
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
                                    this.$set(
                                        this.config_tableFilter[column.key],
                                        'query',
                                        val
                                    );
                                }
                            },
                            'update:order_type': (val) => {
                                this.sortType = val;
                            },
                            'update:order_column': (val) => {
                                this.sort = val;
                            },
                            updateList: (checkAll) => {
                                this.refreshData_filter(checkAll);
                            }
                        }
                    });
                    return h(
                        'div',
                        {
                            class: 'table-filter-container'
                        },
                        [
                            title,
                            this.sort === column.key && this.sortType ? sortIcons : undefined,
                            column.hasOwnProperty('show_filter_content') ? filterPop : undefined
                        ]
                    );
                };
            },
            /** 删掉 sort tag */
            empty_sort() {
                // 清空
                this.sort = '';
                this.sortType = '';
                localStorage.removeItem('followUpRecord_sort');
                localStorage.removeItem('followUpRecord_sortType');
                this.refreshData_filter();
            },
            // filterTags 组件内部修改筛选值后触发的方法, 由下方的 updateList 改造而成
            change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    const column = this.allColumns.find((item) => item.key === key);
                    if (column) {
                        // 判断是否有值, 调整 sqlList
                        if (temp.query.length) {
                            const result = {};
                            switch (temp.filterType) {
                                case 'string':
                                    break;
                                case 'select':
                                    // 表头筛选中只能有单个选项值的(单选型字段 + 创建人这种表格才有的字段)属性, 筛选时使用 $eq 等于, 其他用 $regex 包含
                                    result.$or = temp.query.map((item) => {
                                        const temp = {};
                                        temp[key] = {};
                                        item.value === null
                                            ? (temp[key].$null = -1)
                                            : (temp[key].$regex = item.value);
                                        return temp;
                                    });
                                    break;
                                case 'date':
                                    if (temp.query[0] && temp.query[1]) {
                                        result.$and = [];
                                        const start = {};
                                        start[key] = {};
                                        start[key].$gte = temp.query[0];
                                        result.$and.push(start);

                                        const end = {};
                                        end[key] = {};
                                        end[key].$lte = temp.query[1];
                                        result.$and.push(end);
                                    } else {
                                        this.config_tableFilter[key].query = [];
                                    }
                                    break;
                            }
                            this.allColumns = this.allColumns.map((item) => {
                                if (item.key === key) {
                                    item.filtering = true;
                                }
                                return item;
                            });
                        } else {
                            this.allColumns = this.allColumns.map((item) => {
                                if (item.key === key) {
                                    item.filtering = false;
                                }
                                return item;
                            });
                        }
                        this.refreshData_filter();
                    } else {
                        this.remove_filter_tag(key);
                    }
                } else {
                    this.remove_filter_tag(key);
                }
            },
            /** 筛选 tag close tag 时去掉对应的筛选条件并刷新 */
            remove_filter_tag(key) {
                // 清空筛选条件
                const temp = this.config_tableFilter[key];
                if (temp) {
                    switch (temp.filterType) {
                        case 'string':
                            temp.query = '';
                            break;
                        case 'select':
                        case 'date':
                            temp.query = [];
                            break;
                    }
                    this.$set(this.config_tableFilter, key, temp);
                }

                // 设置表格 filtering 为 false , 并从表头筛选条件对象中去掉对应筛选项
                const index = this.allColumns.findIndex((item) => item.key === key);
                if (index !== -1) {
                    const col = this.allColumns[index];
                    col.filtering = false;
                    this.$set(this.allColumns, index, col);
                }
                // 刷新
                this.refreshData_filter();
            },
            refreshData_filter(checkAll = null) {
                this.currentPageNum = 1;
                this.getListData(checkAll);
            },
            /** 获取跟进记录列表 */
            getListData(checkAll = null) {
                // 取消之前的表格数据请求
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }
                this.handleQuerys(checkAll);
                const data = {
                    orgId: this.orgId,
                    userId: this.userId,
                    pageNo: this.currentPageNum,
                    pageSize: this.pageSize,
                    orderColumn: this.sort,
                    orderType: this.sortType,
                    query: this.queryData.$and.length ? JSON.stringify(this.queryData) : undefined,
                    companyName: this.companyName,
                    createUserId: this.type === 2 ? this.userId : this.createUserId,
                    listType: this.type
                };
                const vm = this;
                const cancelToken = new this.$util.axios.CancelToken(function executor(c) {
                    // An executor function receives a cancel function as a parameter
                    vm.cancelFunc = c;
                });
                this.tableLoading = true;
                crmFollowupRecord.getFollowupList(data, cancelToken).then(response => {
                    this.tableLoading = false;
                    if (response.code === '1') {
                        // 表格数据赋值
                        this.tableList = response.data.list;
                        this.total = response.data.total;
                        if (!response.data.list.length && this.currentPageNum > 1) {
                            this.currentPageNum--;
                            this.getListData();
                        }
                    } else {
                        this.$Message.error(response.msg);
                    }
                });
            },
            /** 处理筛选条件 */
            handleQuerys(checkAll) {
                const query = {};
                this.companyName = '';
                this.createUserId = '';
                for (const key in this.config_tableFilter) {
                    if (!this.config_tableFilter.hasOwnProperty(key)) continue;
                    let result = {};
                    const temp = this.config_tableFilter[key];
                    temp.checkAll = checkAll;
                    if (temp.query && temp.query.length) {
                        switch (temp.filterType) {
                            case 'string':
                                if (key === 'companyName') {
                                    this.companyName = temp.query;
                                } else {
                                    result = { $regex: temp.query };
                                }
                                break;
                            case 'select':
                                if (key === 'createUser') {
                                    this.createUserId = temp.query.map(item => item.value).join(',');
                                } else {
                                    result.$or = temp.query.map((item) => {
                                        const child = {};
                                        child[key] = {
                                            $eq: Number(item.value)
                                        };
                                        return child;
                                    });
                                }

                                break;
                            case 'date':
                                if (temp.query[0] && temp.query[1]) {
                                    result.$and = [];
                                    const start = {};
                                    start[key] = {};
                                    start[key].$gte = temp.query[0];
                                    result.$and.push(start);

                                    const end = {};
                                    end[key] = {};
                                    end[key].$lte = temp.query[1];
                                    result.$and.push(end);
                                }
                                break;
                        }
                        // 公司名称和 创建人 单独传，此处过滤
                        if (!['companyName', 'createUser'].includes(key)) {
                            query[key] = result;
                        }
                        this.allColumns = this.allColumns.map((item, index) => {
                            if (item.key === key) {
                                item.filtering = true;
                            }
                            return item;
                        });
                    } else {
                        this.allColumns = this.allColumns.map((item, index) => {
                            if (item.key === key) {
                                item.filtering = false;
                            }
                            return item;
                        });
                    }
                }
                this.queryData.$and = this.computed_sqlList_tableFilter(query);
            },
            computed_sqlList_tableFilter(query) {
                return Object.entries(query).map(([key, val]) => {
                    const temp = {};
                    // 数组型 - 日期型 - 字符串型/国家地区
                    if (val.hasOwnProperty('$or')) {
                        temp.$or = val.$or;
                    } else if (val.hasOwnProperty('$and')) {
                        const timeArr = val.$and;
                        if (timeArr[0] && timeArr[1] && timeArr[0][key].$gte && timeArr[1][key].$lte) {
                            timeArr[0][key].$gte = this.$options.filters.timeFormat(timeArr[0][key].$gte);
                            timeArr[1][key].$lte = `${this.$options.filters.timeFormat(timeArr[1][key].$lte)} 23:59:59.999`;
                        }
                        temp.$and = timeArr;
                    } else {
                        temp[key] = val;
                    }
                    return temp;
                });
            },
            // 新建
            createFolloUp() {
                this.editDetail = null;
                this.add_followup_modal = true;
            },
            // 编辑
            editFollowup(item) {
                this.editDetail = item;
                this.add_followup_modal = true;
            },
            // 导出
            exportData() {
                window.open(`${this.$util.ajaxUrl}/crm-transfer/followupDownloadOrUpload/exportExcel?orgId=${this.orgId}&userId=${this.userId}&orderColumn=${this.sort}&orderType=${this.sortType}&companyName=${this.companyName}&createUserId=${this.type === 2 ? this.userId : this.createUserId}&listType=${this.type}&query=${this.queryData.$and.length ? encodeURIComponent(JSON.stringify(this.queryData)) : ''}`, '_blank');
            },
            // 编辑新增后 列表与详情页的数据变更
            changeFollowUp() {
                if (this.editDetail) {
                    this.change_flag_new_followUp = !this.change_flag_new_followUp;
                }
                this.getListData();
            },
            targetTypeFilter(val) {
                if (val === 1) {
                    return this.$t('crm.Table.customer');
                } else if (val === 2) {
                    return this.$t('crm.Html.contact');
                } else if (val === 3) {
                    return this.$t('crm.Table.inquiry');
                } else {
                    return '-';
                }
            },
            followupTypeFilter(val) {
                if (val) {
                    const temp = this.followupTypes.find(item => Number(item.value) === Number(val));
                    return temp ? temp.label : val;
                } else {
                    return '-';
                }
            }
        },
        watch: {
            followupTypes: {
                handler(val) {
                    if (val) {
                        // 设置全部人员列表以供筛选
                        this.setFollowupTypes();
                    }
                }
            },
            headerDisplayItem: {
                handler(val) {
                    this.resetHeader(val);
                },
                immediate: true,
                deep: true
            },
            show_detail: {
                handler(val) {
                    if (!val) {
                        this.$refs.multipleTable.setCurrentRow();
                    }
                }
            },
            sort: {
                handler(val) {
                    localStorage.setItem('followUpRecord_sort', val);
                },
                immediate: true
            },
            sortType: {
                handler(val) {
                    localStorage.setItem('followUpRecord_sortType', val);
                },
                immediate: true
            }
        },
        beforeDestroy() { }
    };
</script>
<style lang="less">
    @import "Components/less/tablePage.less";

    .followUp_record.crm-table-page {
        .tabmain {
            &.el-table--border{
                th:first-child{
                    .cell {
                        padding-right: 24px;
                    }
                }
            }

            &.el-table--border {
                td:first-child{
                    .cell {
                        padding-right: 24px;
                    }
                }
            }
        }
    }
</style>
<style lang="less" scoped>
    .followUp_record {
        .followUp_record-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            // height: 60px;
            padding: 8px 30px 8px 20px;
            background: #fff;
            box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
            border-radius: 4px 0 0 4px;
            margin-bottom: 8px;
            .followUp_record_left {
                width: 80%;
            }
            .switch-title {
                font-size: 16px;
                color: #2d2f2e;
                cursor: pointer;
                font-weight: 500;

                .switch-title-icon{
                    margin-left: 6px;
                }
            }
            .table-operate-btns{
                position: relative;
            }
        }
    }
    .canClick span{
        color: #3B78DE;
        cursor: pointer;
    }
    .custom-file-download-border{
        margin: 0 8px 0 20px;
        height: 30px;
        padding: 0 8px;
        border: 1px solid #ABBFD5;
        border-radius: 4px;
    }
    .followupContent_flex {
        display: flex;
        justify-content: space-between;
        align-items: center;
        span{
            width: calc(100% - 20px);
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: normal;
        }
    }
</style>
