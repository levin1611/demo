<template>
    <div class="taskTable">
        <!-- header -->
        <div class="taskTable-header">
            <!-- 筛选标签 -->
            <FilterTags :order_column="order_column"
                        :order_type="order_type"
                        :storageName_orderColumn="storageName_orderColumn"
                        :filterConObj.sync="config_tableFilter"
                        :langObj="lang_taskTable"
                        :width="600"
                        @removeCon="remove_filter_tag"
                        @change_filter_tag="change_filter_tag"
                        @emptySort="empty_sort"
                        class="taskTable-filterTags"></FilterTags>
        </div>

        <!-- 表格 -->
        <Table v-if="initTable"
               :data="tableData"
               :height="table_height"
               v-loading="loading_table"
               size="medium"
               stripe
               ref="table"
               class="tabmain new-common-table">
            <!-- 正常列 -->
            <TableColumn v-for="item in tableColumns"
                         :key="item.key"
                         :prop="item.key"
                         :label="item.title"
                         :min-width="item.width"
                         :formatter="item.formatter || defaultFormatter"
                         :render-header="item.renderHeader"
                         :show-overflow-tooltip="true"></TableColumn>

            <!-- 操作列 -->
            <TableColumn :label="$t('portal_set.operation')"
                         fixed="right"
                         class-name="taskTable-operateCol"
                         :min-width="110">
                <template slot-scope="{ row }">
                    <div class="taskTable-operateBtns">
                        <!-- 编辑 -->
                        <!-- 草稿, 待开始 -->
                        <span v-if="['1', '3'].includes(row.status)"
                              @click="handleEdit(row)">
                            {{ $t('edit') }}
                        </span>

                        <!-- 详情 -->
                        <!-- 进行中, 已完成, 已取消 -->
                        <span v-if="['4', '2', '5'].includes(row.status)"
                              @click="handleShowDetail(row)">
                            {{ $t('autoGenArticle.details') }}
                        </span>

                        <!-- 删除 -->
                        <!-- 草稿, 待开始 -->
                        <span v-if="['1', '3'].includes(row.status)"
                              @click="handleDelete(row)">
                            {{ $t('autoGenArticle.delete') }}
                        </span>

                        <!-- 还原 -->
                        <!-- 已删除 -->
                        <span v-if="row.status === '0'"
                              @click="handleRevert(row)">
                            {{ $t('autoGenArticle.recover') }}
                        </span>
                    </div>
                </template>
            </TableColumn>
        </Table>

        <!-- page -->
        <div style="margin-right: 30px;overflow: hidden">
            <Page :page-size="pageSize"
                  :page-sizes="pageSizeOpts"
                  :total="totalNum"
                  :current-page="curPage"
                  layout="total, prev, pager, next, sizes, jumper"
                  @current-change="changePage"
                  @size-change="pageSizeChange"
                  class="pageWrap-right"></Page>
        </div>

        <!-- 删除任务二次确认 -->
        <Modal :visible.sync="deleteConfirm"
               :title="$t('autoGenArticle.deleteConfirm')"
               :modal-append-to-body="false"
               :close-on-click-modal="false"
               width="487px"
               v-loading="loading_delete">
            <p>{{ (currRow.status === '4') ? $t('autoGenArticle.tip_deleteProgressingTask') : $t('autoGenArticle.tip_deleteTask') }}</p>

            <div slot="footer">
                <Button @click="deleteConfirm = false">{{ $t('cancel') }}</Button>
                <Button type="primary"
                        @click="deleteTask">{{$t('confirm') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import FilterTags from '@/views/main-components/filter-tags';
    import { getGenArtTaskTableData, deleteGenArtTask, revertDeleteGenArtTask } from '@/api/seo';

    export default {
        // 此组件是多个表格通用的组件, 外部多次引入此组件使用 component 切换, 此组件如果有 name 会出问题, 它们会被视作同一个组件, 表现: 表头筛选数据切换 tab 后仍保留
        // name: 'taskTable',
        components: {
            FilterTags
        },
        props: {
            // 当前选中的 tab(任务状态)
            currTaskStatus: {
                type: String,
                default: ''
            },
            // 任务类型(全部任务, 我的任务, 下属任务)
            currTaskType: {
                type: String,
                default: ''
            },
            // 用户
            userIdList: {
                type: Array,
                default() {
                    return [];
                }
            },
            // 网站 Id
            selectedSiteList: {
                type: Array,
                default() {
                    return [];
                }
            },
            // 时间
            filterDate: {
                type: Array,
                default() {
                    return [];
                }
            },
            // 外部组件传入参数, 控制表格刷新用
            flag_refreshTaskTable: {
                type: Number
            },
            // 不同 tab 之间保持统一的筛选条件
            filterCon: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height'
            }),
            // 表格高度
            table_height() {
                let temp = this.window_height ? this.window_height - 165 : document.body.clientHeight - 165;

                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            },
            // 最大页码
            maxPageNum() {
                return this.pageSize ? Math.ceil(this.totalNum / this.pageSize) : 1;
            }
        },
        data() {
            return {
                /* 全局 */
                // 切换 tab 时是否需要重新加载
                needRefresh: false,

                /* 表格 */
                initTable: false,
                loading_table: true,
                tableData: [],
                tableColumns: [
                    {
                        title: this.$t('autoGenArticle.taskName'),
                        key: 'taskName',
                        width: 300,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.status'),
                        key: 'status',
                        width: 100,
                        sortable: true,
                        formatter: row => {
                            return this.statusLangObj[row.status] || row.status;
                        }
                    },
                    {
                        title: this.$t('autoGenArticle.website'),
                        key: 'website',
                        width: 300,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.allArticlesNum'),
                        key: 'allArticlesNum',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.generatedArticlesNum'),
                        key: 'generatedArticlesNum',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.draftArticlesNum'),
                        key: 'draftArticlesNum',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.pendingPublishArticlesNum'),
                        key: 'pendingPublishArticlesNum',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.publishedArticlesNum'),
                        key: 'publishedArticlesNum',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.lastUpdateTime'),
                        key: 'lastUpdateTime',
                        width: 175,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.operator'),
                        key: 'operator',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.creator'),
                        key: 'creator',
                        width: 150,
                        sortable: true
                    }
                ],
                defaultFormatter: (row, column, cellValue) => {
                    return [null, undefined].includes(cellValue) ? '-' : cellValue;
                },
                // 任务状态 0回收站 1草稿 2已完成 3待开始 4生成中 5已取消
                statusLangObj: {
                    0: this.$t('autoGenArticle.deleted'),
                    1: this.$t('autoGenArticle.draft'),
                    2: this.$t('autoGenArticle.completed'),
                    3: this.$t('autoGenArticle.unstarted'),
                    4: this.$t('autoGenArticle.progressing'),
                    5: this.$t('autoGenArticle.canceled')
                },

                /* 分页 */
                totalNum: 0,
                curPage: 1,
                pageSize: 20,
                pageSizeOpts: [20, 50, 100],

                /* 表头筛选 */
                // 筛选配置
                order_column: '',
                order_type: '',
                storageName_orderColumn: '',
                conObj: [],
                config_tableFilter: {
                    taskName: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    status: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        query: '', // 筛选值
                        allList: [
                            {
                                value: 1,
                                label: this.$t('autoGenArticle.draft')
                            },
                            {
                                value: 3,
                                label: this.$t('autoGenArticle.unstarted')
                            },
                            {
                                value: 4,
                                label: this.$t('autoGenArticle.progressing')
                            },
                            {
                                value: 2,
                                label: this.$t('autoGenArticle.completed')
                            },
                            {
                                value: 0,
                                label: this.$t('autoGenArticle.deleted')
                            },
                            {
                                value: 5,
                                label: this.$t('autoGenArticle.canceled')
                            }
                        ]// 所有可能的筛选条件
                    },
                    website: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    allArticlesNum: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'number', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    generatedArticlesNum: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'number', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    draftArticlesNum: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'number', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    pendingPublishArticlesNum: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'number', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    publishedArticlesNum: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'number', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    lastUpdateTime: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型
                        dateOptions: {
                            shortcuts: [
                                {
                                    text: this.$t('crm.Table.today'),
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        picker.$emit('pick', [start, end]);
                                    }
                                },
                                {
                                    text: this.$t('crm.Table.yesterday'),
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        start.setTime(start.getTime() - 3600 * 1000 * 24);
                                        end.setTime(end.getTime() - 3600 * 1000 * 24);
                                        picker.$emit('pick', [start, end]);
                                    }
                                },
                                {
                                    text: this.$t('crm.Table.thisWeek'),
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        let dayNo = start.getDay();
                                        dayNo = dayNo ? dayNo - 1 : 6;
                                        start.setTime(start.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                        picker.$emit('pick', [start, end]);
                                    }
                                },
                                {
                                    text: this.$t('crm.Table.lastWeek'),
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        let dayNo = start.getDay();
                                        dayNo = dayNo || 7;
                                        end.setTime(end.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                        start.setTime(end.getTime() - 6 * 24 * 60 * 60 * 1000);
                                        picker.$emit('pick', [start, end]);
                                    }
                                },
                                {
                                    text: this.$t('crm.Table.thisMonth'),
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        start.setTime(new Date(start.getFullYear(), start.getMonth(), 1).getTime());
                                        picker.$emit('pick', [start, end]);
                                    }
                                },
                                {
                                    text: this.$t('crm.Table.lastMonth'),
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() - 24 * 60 * 60 * 1000);
                                        start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                                        picker.$emit('pick', [start, end]);
                                    }
                                }
                            ]
                        }, // 时间选项
                        query: [], // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    operator: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'users', // 筛选类型
                        withRole: true, // 筛选需要与当前用户权限挂钩
                        query: [], // 筛选值
                        allList: [] // 所有可能的筛选条件
                    },
                    creator: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'users', // 筛选类型
                        withRole: true, // 筛选需要与当前用户权限挂钩
                        query: [], // 筛选值
                        allList: [] // 所有可能的筛选条件
                    }
                },
                lang_taskTable: {
                    taskName: this.$t('autoGenArticle.taskName'),
                    status: this.$t('autoGenArticle.status'),
                    website: this.$t('autoGenArticle.website'),
                    allArticlesNum: this.$t('autoGenArticle.allArticlesNum'),
                    generatedArticlesNum: this.$t('autoGenArticle.generatedArticlesNum'),
                    draftArticlesNum: this.$t('autoGenArticle.draftArticlesNum'),
                    pendingPublishArticlesNum: this.$t('autoGenArticle.pendingPublishArticlesNum'),
                    publishedArticlesNum: this.$t('autoGenArticle.publishedArticlesNum'),
                    lastUpdateTime: this.$t('autoGenArticle.lastUpdateTime'),
                    operator: this.$t('autoGenArticle.operator'),
                    creator: this.$t('autoGenArticle.creator')
                },

                /* 删除确认弹框 */
                currRow: {},
                deleteConfirm: false,
                loading_delete: false
            };
        },
        methods: {
            /* 表格数据请求 */
            refreshData() {
                this.loading_table = true;
                getGenArtTaskTableData({
                    taskFilter: this.convertTaskTypeToVal(this.currTaskType),
                    orgId: Number(this.enterpriseId),
                    sitePairs: this.selectedSiteList.map(val => {
                        return {
                            siteId: Number(val.split('-')[0]),
                            siteType: Number(val.split('-')[1])
                        };
                    }),
                    createUserIds: this.userIdList,
                    statusList: this.convertTaskStatusToVal(this.currTaskStatus), // 任务状态 0回收站 1草稿 2已完成 未完成（3待开始 4生成中）传3，4逗号分隔 5已取消
                    // createTimeStart: `${this.$options.filters.timeFormat(this.filterDate[0])} 00:00:00`,
                    // createTimeEnd: `${this.$options.filters.timeFormat(this.filterDate[1])} 23:59:59.999`,
                    page: this.curPage,
                    pageSize: this.pageSize,
                    query: this.conObj
                }).then(res => {
                    if (res.code === '1') {
                        // 成功

                        // 处理表格数据
                        if (res.data && Array.isArray(res.data.items)) {
                            this.tableData = this.handleData(res.data.items);
                            this.$emit('updateTabCount', res.data.tab_count_vo);
                            this.totalNum = res.data.total || 0;
                        } else {
                            this.tableData = [];
                            this.totalNum = 0;
                        }

                        // 请求数据成功后, 去掉"下次进入页面需要重新请求"标记
                        this.needRefresh = false;
                    } else {
                        // 失败

                        this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    }
                    this.loading_table = false;
                }).catch(e => {
                    // 失败

                    console.error(e);
                    this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    this.loading_table = false;
                });
            },
            // 表格数据处理
            handleData(data) {
                let result = [];

                if (Array.isArray(data)) {
                    result = data.map(item => {
                        // 数据提取
                        const {
                            id,
                            name: taskName,
                            status,
                            site_url: website,
                            post_count: allArticlesNum,
                            generated_post_count: generatedArticlesNum,
                            draft_post_count: draftArticlesNum,
                            pending_publish_post_count: pendingPublishArticlesNum,
                            published_post_count: publishedArticlesNum,
                            update_time: lastUpdateTime,
                            operator_user: operator,
                            create_user: creator
                        } = item;

                        return {
                            id,
                            taskName,
                            status: `${status}`,
                            website,
                            allArticlesNum,
                            generatedArticlesNum,
                            draftArticlesNum,
                            pendingPublishArticlesNum,
                            publishedArticlesNum,
                            lastUpdateTime,
                            operator,
                            creator
                        };
                    });
                }

                return result;
            },
            // 转化任务状态为数字值
            convertTaskStatusToVal(str) {
                const obj = {
                    all: [1, 2, 3, 4, 5],
                    completed: [2],
                    undone: [3, 4],
                    draft: [1],
                    canceled: [5],
                    trash: [0]
                };

                return obj[str];
            },
            convertTaskTypeToVal(str) {
                const obj = {
                    allTask: 1,
                    myTask: 2,
                    subTask: 3
                };

                return obj[str];
            },

            /* 分页 */
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

            /* 表头筛选 */
            // 返回字段筛选渲染函数
            renderHeader_filter(colIndex) {
                return h => {
                    const column = this.tableColumns[colIndex];
                    /* DOM */
                    // 标题
                    const title = h('div', {
                        attrs: {
                            title: column.title
                        },
                        class: 'table-filter-title'
                    }, column.title);
                    // 排序组件
                    const sortIcons = h('span', {
                        class: {
                            'table-sort-icon-container': true
                        }
                    }, [
                        h('Icon', {
                            class: {
                                'icon-custom-on': true,
                                'icon-custom-on-active': this.order_column === column.key && this.order_type === 'asc'
                            },
                            props: {
                                type: 'md-arrow-dropup'
                            }
                        }),
                        h('Icon', {
                            class: {
                                'icon-custom-on': true,
                                'icon-custom-on-active': this.order_column === column.key && this.order_type === 'desc'
                            },
                            props: {
                                type: 'md-arrow-dropdown'
                            }
                        })
                    ]);
                    // 筛选组件
                    const filterPop = h('FilterBox', {
                        props: Object.assign({
                            showPopper: this.tableColumns[colIndex].show_filter_content,
                            filtering: this.tableColumns[colIndex].filtering,
                            columnKey: column.key,
                            columnCon: column.key,
                            order_type: this.order_type,
                            order_column: this.order_column,
                            storageName_orderColumn: this.storageName_orderColumn
                        }, this.config_tableFilter[column.key]),
                        on: {
                            updateList: () => {
                                const temp = this.config_tableFilter[column.key];
                                if (temp) {
                                    // 对当前筛选项数据格式化 + 判断是否处于筛选状态, 更改 filtering 属性
                                    if (temp.query.length) {
                                        switch (temp.filterType) {
                                            case 'date':
                                                if (!(temp.query[0] && temp.query[1])) {
                                                    this.config_tableFilter[column.key].query = [];
                                                }
                                                break;
                                        }
                                        this.tableColumns = this.tableColumns.map((item, index) => {
                                            if (index === colIndex) {
                                                item.filtering = true;
                                            }
                                            return item;
                                        });
                                    } else {
                                        this.tableColumns = this.tableColumns.map((item, index) => {
                                            if (index === colIndex) {
                                                item.filtering = false;
                                            }
                                            return item;
                                        });
                                    }

                                    // 刷新列表
                                    this.refreshData_filter();
                                }
                            },
                            'update:showPopper': (val) => {
                                this.tableColumns = this.tableColumns.map((item, index) => {
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
                                    if (this.config_tableFilter[column.key].filterType === 'number') {
                                        if (val) {
                                            this.$set(this.config_tableFilter[column.key], 'query', `${val.$gte}-${val.$lte}`);
                                        } else {
                                            this.$set(this.config_tableFilter[column.key], 'query', '');
                                        }
                                    } else {
                                        this.$set(this.config_tableFilter[column.key], 'query', val);
                                    }
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
                        },
                        directives: [
                            {
                                name: 'outer-scroll',
                                value: this.handleScroll
                            }
                        ]
                    });

                    /* 返回 DOM */
                    return h('div', {
                        class: 'table-filter-container'
                    }, [
                        title, // 标题
                        (this.order_column === column.key && this.order_type) ? sortIcons : undefined, // 排序图标
                        column.hasOwnProperty('show_filter_content') ? filterPop : undefined // 筛选组件
                    ]);
                };
            },
            // close tag 时去掉对应的筛选条件并刷新
            remove_filter_tag(key) {
                // 清空筛选条件
                const temp = this.config_tableFilter[key];
                if (temp) {
                    switch (temp.filterType) {
                        case 'string':
                        case 'number':
                            temp.query = '';
                            break;
                        case 'date':
                        case 'select':
                        case 'selectSingle':
                        case 'country':
                        case 'users':
                            temp.query = [];
                            break;
                    }
                    this.$set(this.config_tableFilter, key, temp);
                }

                // 设置表格 filtering 为 false , 并从表头筛选条件对象中去掉对应筛选项
                const index = this.tableColumns.findIndex(item => item.key === key);
                if (index !== -1) {
                    const col = this.tableColumns[index];
                    col.filtering = false;
                    this.$set(this.tableColumns, index, col);
                }

                this.refreshData_filter();
            },
            // filterTags 组件内部修改筛选值后触发的方法, 由下方的 updateList 改造而成
            change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    const column = this.tableColumns.find(item => item.key === key);
                    if (column) {
                        // 对当前筛选项数据格式化 + 判断是否处于筛选状态, 更改 filtering 属性
                        if (temp.query.length) {
                            switch (temp.filterType) {
                                case 'date':
                                    if (!(temp.query[0] && temp.query[1])) {
                                        this.config_tableFilter[key].query = [];
                                    }
                                    break;
                            }
                            this.tableColumns = this.tableColumns.map(item => {
                                if (item.key === key) {
                                    item.filtering = true;
                                }
                                return item;
                            });
                        } else {
                            this.tableColumns = this.tableColumns.map(item => {
                                if (item.key === key) {
                                    item.filtering = false;
                                }
                                return item;
                            });
                        }

                        // 刷新列表
                        this.refreshData_filter();
                    } else {
                        this.remove_filter_tag(key);
                    }
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
                this.refreshData_filter();
            },
            // 配置表头筛选
            handleConfigureTableFilter() {
                this.tableColumns.forEach((col, index) => {
                    const headSet = this.config_tableFilter[col.key];
                    if (headSet && (headSet.sort || headSet.filter)) {
                        col.show_filter_content = false;
                        col.filtering = false;
                        col.renderHeader = this.renderHeader_filter(index);
                    }
                    this.$set(this.tableColumns, index, col);
                });
                this.initTable = true;
            },
            // 处理检索条件
            merge_query_list() {
                const result = {};

                Object.entries(this.config_tableFilter).forEach(([key, config]) => {
                    if (config.filter && config.query.length) {
                        const filterKey = this.get_search_con(key);
                        if (!filterKey) {
                            return;
                        }

                        switch (config.filterType) {
                            case 'string':
                                result[filterKey] = config.query;
                                break;
                            case 'select':
                            case 'users':
                                result[filterKey] = config.query.map(item => item.value);
                                break;
                            case 'date':
                                if (config.query[0] && config.query[1]) {
                                    if (filterKey === 'lastUpdateTime') {
                                        result.updateTimeStart = `${this.$options.filters.timeFormat(config.query[0])} 00:00:00`;
                                        result.updateTimeEnd = `${this.$options.filters.timeFormat(config.query[1])} 23:59:59.999`;
                                    }
                                }
                                break;
                        }
                    }
                });

                this.conObj = result;
            },
            // 根据筛选列的 key , 返回接口所需要的查询参数名
            get_search_con(key) {
                const conObj = {
                    taskName: 'name',
                    status: 'statusList',
                    website: 'sitePairs',
                    // allArticlesNum: 'allArticlesNum',
                    // generatedArticlesNum: 'generatedArticlesNum',
                    // draftArticlesNum: 'draftArticlesNum',
                    // pendingPublishArticlesNum: 'pendingPublishArticlesNum',
                    // publishedArticlesNum: 'publishedArticlesNum',
                    createTime: 'createTime',
                    lastUpdateTime: 'lastUpdateTime',
                    operator: 'operatorUserIds',
                    creator: 'createUserIds'
                };

                return conObj[key] || '';
            },
            // 检索并刷新表格
            refreshData_filter() {
                this.merge_query_list();
                this.curPage = 1;
                this.refreshData();
            },

            // 从 filterBox 自身触发, 在外部发生滚动时, 同步滚动显示中的 filterBox Popper
            handleScroll(vnode) {
                try {
                    const _filterCompo = vnode.componentInstance;
                    if (_filterCompo.showPopper) {
                        // 更新弹窗位置
                        _filterCompo.$refs.poptip.updatePopper();
                    }
                } catch (e) {
                }
            },

            /* 表格操作 */
            // 编辑
            handleEdit(row) {
                this.$emit('editTask', row);
            },
            // 展示详情
            handleShowDetail(row) {
                this.$emit('showTaskDetail', row);
            },
            // 删除
            handleDelete(row) {
                this.loading_delete = false;
                this.currRow = row;
                this.deleteConfirm = true;
            },
            deleteTask() {
                this.loading_delete = true;
                deleteGenArtTask({
                    id: this.currRow.id
                }).then(res => {
                    switch (res.code) {
                        case '1':
                            this.$emit('refreshTaskTable');
                            this.refreshData();
                            this.$Message.success(this.$t('deleteSuccess'));
                            this.deleteConfirm = false;
                            break;
                        case '10004':
                            this.$Message.error(this.$t('autoGenArticle.error_othersOperatingTask'));
                            break;
                        default:
                            this.$Message.error(this.$t('deleteFail'));
                    }
                    this.loading_delete = false;
                }).catch(e => {
                    console.error(e);
                    this.loading_delete = false;
                    this.$Message.error(this.$t('deleteFail'));
                });
            },
            // 还原
            handleRevert(row) {
                revertDeleteGenArtTask({
                    id: row.id
                }).then(res => {
                    switch (res.code) {
                        case '1':
                            this.$emit('refreshTaskTable');
                            this.refreshData();
                            this.$Message.success(this.$t('mail.moveRestoreSuccTip'));
                            break;
                        case '10005':
                            this.$Message.error(this.$t('autoGenArticle.error_othersOperatingTask'));
                            break;
                        default:
                            this.$Message.error(this.$t('mail.moveRestoreErrorTip'));
                    }
                }).catch(e => {
                    console.error(e);
                    this.$Message.error(this.$t('mail.moveRestoreErrorTip'));
                });
            },

            // 更新表头筛选条件
            updateFilterConfigObj() {
                const tempColumns = this.tableColumns;
                tempColumns.forEach(item => {
                    const configObj = this.config_tableFilter[item.key];
                    // 更新当前表头筛选数据
                    if (configObj && this.filterCon[item.key]) {
                        configObj.query = this.filterCon[item.key].query;
                        configObj.sort = this.filterCon[item.key].sort;
                    }
                    // 更新表格列 filtering 属性
                    item.filtering = Boolean(configObj.query.length);
                });
                this.tableColumns = tempColumns;
            }
        },
        watch: {
            currTaskType: {
                handler(val) {
                    if (val) {
                        this.refreshData_filter();
                    }
                }
            },
            selectedSiteList: {
                handler(val) {
                    if (val) {
                        this.refreshData_filter();
                    }
                }
            },
            userIdList() {
                this.refreshData_filter();
            },
            // filterDate() {
            //     this.refreshData_filter();
            // },
            currTaskStatus() {
                this.refreshData_filter();
            },
            flag_refreshTaskTable: {
                handler() {
                    this.needRefresh = true;
                }
            }
        },
        deactivated() {
            this.$emit('update:filterCon', JSON.parse(JSON.stringify(this.config_tableFilter)));
        },
        activated() {
            // 如果筛选条件发生变化, 则刷新列表
            if (JSON.stringify(this.config_tableFilter) !== JSON.stringify(this.filterCon)) {
                this.updateFilterConfigObj();
                this.needRefresh = true;
            }

            if (this.needRefresh) {
                this.refreshData_filter();
            }
        },
        mounted() {
            // 配置表格筛选
            this.handleConfigureTableFilter();

            // 如果 activated 没有触发表格数据请求, 则在 mounted 中触发
            this.$nextTick(() => {
                if (!this.needRefresh) {
                    this.refreshData_filter();
                }
            });
        }
    };
</script>

<style scoped lang="less">
    .taskTable {
        position: relative;
        min-height: 200px;

        &-header {
            line-height: 0;
        }

        &-filterTags {
            margin-top: 3px;
        }

        /deep/ &-operateBtns {
            color: #3B78DE;
            font-size: 14px;

            >span {
                cursor: pointer;

                &:not(:last-child) {
                    margin-right: 10px;
                }
            }
        }

        .new-common-table {
            /deep/ th, /deep/ td {
                &:first-child .cell {
                    padding-left: 20px;
                }
            }
        }

        .pageWrap-right {
            margin-bottom: 0;
        }
    }
</style>

<style lang="less">
    .taskTable-operateCol {
        .cell {
            padding: 0 10px !important;
        }
    }
</style>
