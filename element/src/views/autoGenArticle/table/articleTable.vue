<template>
    <div class="articleTable">
        <!-- header -->
        <div class="articleTable-header">
            <!-- 筛选标签 -->
            <FilterTags :order_column="order_column"
                        :order_type="order_type"
                        :storageName_orderColumn="storageName_orderColumn"
                        :filterConObj.sync="config_tableFilter"
                        :langObj="lang_articleTable"
                        :width="600"
                        @removeCon="remove_filter_tag"
                        @change_filter_tag="change_filter_tag"
                        @emptySort="empty_sort"
                        class="articleTable-filterTags"></FilterTags>
        </div>

        <!-- loading -->
        <Spin v-if="loading_table"
              fix></Spin>

        <!-- table + page -->
        <template v-if="initTable">
            <!-- 表格 -->
            <Table :data="tableData"
                   :height="table_height"
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
                             :show-overflow-tooltip="true">
                </TableColumn>

                <!-- 操作列 -->
                <TableColumn :label="$t('portal_set.operation')"
                             fixed="right"
                             class-name="articleTable-operateCol"
                             :min-width="110">
                    <template slot-scope="{ row }">
                        <div class="articleTable-operateBtns">
                            <!-- 编辑 -->
                            <!-- 已生成, 草稿, 审核完毕, 待发布 -->
                            <span v-if="['1', '2', '3', '5'].includes(row.status)"
                                  @click="handleEdit(row)">{{ $t('edit') }}</span>

                            <!-- 删除 -->
                            <!-- 已生成, 草稿, 审核完毕, 待发布 -->
                            <span v-if="['1', '2', '3', '5'].includes(row.status)"
                                  @click="handleDelete(row)">
                                {{ $t('autoGenArticle.delete') }}
                            </span>

                            <!-- 还原 -->
                            <!-- 已删除 -->
                            <span v-if="row.status === '0'"
                                  @click="handleRevert(row)">{{ $t('autoGenArticle.recover') }}</span>
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
        </template>

        <!-- 删除任务二次确认 -->
        <Modal :visible.sync="deleteConfirm"
               :title="$t('autoGenArticle.deleteConfirm')"
               :modal-append-to-body="false"
               :close-on-click-modal="false"
               width="487px"
               v-loading="loading_delete">
            <p>{{ ['1', '2', '3', '4', '5'].includes(currRow.status) ? $t('autoGenArticle.tip_deleteGeneratedArt') : $t('autoGenArticle.tip_deleteArt') }}</p>

            <div slot="footer">
                <Button @click="deleteConfirm = false">{{ $t('cancel') }}</Button>
                <Button type="primary"
                        @click="deleteArt">{{$t('confirm') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import FilterTags from '@/views/main-components/filter-tags';
    import { getArticleTableData, deleteArticle, recoverArticle } from '@/api/seo';

    export default {
        // 此组件是多个表格通用的组件, 外部多次引入此组件使用 component 切换, 此组件如果有 name 会出问题, 它们会被视作同一个组件, 表现: 表头筛选数据切换 tab 后仍保留
        // name: 'articleTable',
        components: {
            FilterTags
        },
        props: {
            // 当前正在操作的任务数据
            currTaskData: {
                type: Object,
                default() {
                    return {};
                }
            },
            // 当前选中 tab(任务状态)
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
            // 网站
            selectedSiteList: {
                type: Array,
                default() {
                    return [];
                }
            },
            currArtType: {
                type: String,
                default: ''
            },
            // 时间
            filterDate: {
                type: Array,
                default() {
                    return [];
                }
            },
            // 外部组件传入参数, 控制表格刷新用
            flag_refreshArtTable: {
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
                let temp = this.window_height ? this.window_height - 286 : document.body.clientHeight - 286;

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
                loading_table: true,
                initTable: false,
                tableData: [],
                tableColumns: [
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
                        title: this.$t('autoGenArticle.artTitle'),
                        key: 'artTitle',
                        width: 300,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.keyword'),
                        key: 'keyword',
                        width: 300,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.description'),
                        key: 'description',
                        width: 300,
                        sortable: true
                    },
                    {
                        title: 'URL',
                        key: 'URL',
                        width: 300,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.publishTime'),
                        key: 'publishTime',
                        width: 175,
                        sortable: true,
                        formatter: row => {
                            if (!row.publishTime) {
                                return '-';
                            }
                            return this.$options.filters.timeFormat(new Date(row.publishTime), 'DateTime');
                        }
                    },
                    // {
                    //     title: 'tokens',
                    //     key: 'tokens',
                    //     width: 150,
                    //     sortable: true
                    // },
                    // {
                    //     title: this.$t('autoGenArticle.spentAmount'),
                    //     key: 'spentAmount',
                    //     width: 150,
                    //     sortable: true
                    // },
                    {
                        title: this.$t('autoGenArticle.isIndexed'),
                        key: 'isIndexed',
                        width: 175,
                        sortable: true,
                        formatter: row => {
                            switch (`${row.isIndexed}`) {
                                case '1':
                                    return this.$t('yes');
                                case '0':
                                    return this.$t('no');
                                default:
                                    return '-';
                            }
                        }
                    },
                    {
                        title: this.$t('autoGenArticle.impressions'),
                        key: 'impressions',
                        width: 100,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.clicks'),
                        key: 'clicks',
                        width: 100,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.avgRanking'),
                        key: 'avgRanking',
                        width: 100,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.visitorNum'),
                        key: 'visitorNum',
                        width: 100,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.hasChatVisitorNum'),
                        key: 'hasChatVisitorNum',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.leaveMsgVisitorNum'),
                        key: 'leaveMsgVisitorNum',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.clueNum'),
                        key: 'clueNum',
                        width: 100,
                        sortable: true
                    },
                    {
                        title: this.$t('autoGenArticle.lastUpdateTime'),
                        key: 'lastUpdateTime',
                        width: 175,
                        sortable: true,
                        formatter: row => {
                            if (!row.lastUpdateTime) {
                                return '-';
                            }
                            return this.$options.filters.timeFormat(new Date(row.lastUpdateTime), 'DateTime');
                        }
                    },
                    {
                        title: this.$t('autoGenArticle.createTime'),
                        key: 'createTime',
                        width: 175,
                        sortable: true,
                        formatter: row => {
                            if (!row.createTime) {
                                return '-';
                            }
                            return this.$options.filters.timeFormat(new Date(row.createTime), 'DateTime');
                        }
                    },
                    {
                        title: this.$t('autoGenArticle.operator'),
                        key: 'operator',
                        width: 150,
                        sortable: true
                    }
                ],
                defaultFormatter: (row, column, cellValue) => {
                    return [null, undefined].includes(cellValue) ? '-' : cellValue;
                },
                // 文章状态 0回收站 1草稿 2已生成 3待发布 4已发布 5审核完毕 6生成中 7待生成
                statusLangObj: {
                    7: this.$t('autoGenArticle.pendingGenerate'),
                    6: this.$t('autoGenArticle.generating'),
                    2: this.$t('autoGenArticle.generated'),
                    1: this.$t('autoGenArticle.draft'),
                    5: this.$t('autoGenArticle.reviewed'),
                    3: this.$t('autoGenArticle.pendingPublish'),
                    4: this.$t('autoGenArticle.published'),
                    0: this.$t('autoGenArticle.deleted')
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
                    status: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        query: [], // 筛选值
                        allList: [
                            {
                                value: 7,
                                label: this.$t('autoGenArticle.pendingGenerate')
                            },
                            {
                                value: 6,
                                label: this.$t('autoGenArticle.generating')
                            },
                            {
                                value: 2,
                                label: this.$t('autoGenArticle.generated')
                            },
                            {
                                value: 1,
                                label: this.$t('autoGenArticle.draft')
                            },
                            {
                                value: 5,
                                label: this.$t('autoGenArticle.reviewed')
                            },
                            {
                                value: 3,
                                label: this.$t('autoGenArticle.pendingPublish')
                            },
                            {
                                value: 4,
                                label: this.$t('autoGenArticle.published')
                            },
                            {
                                value: 0,
                                label: this.$t('autoGenArticle.deleted')
                            }
                        ]// 所有可能的筛选条件
                    },
                    artTitle: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    keyword: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    description: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    URL: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    publishTime: {
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
                    tokens: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    spentAmount: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'number', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    isIndexed: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        query: [], // 筛选值
                        allList: [
                            {
                                value: '1',
                                label: this.$t('yes')
                            },
                            {
                                value: '0',
                                label: this.$t('no')
                            }
                        ]// 所有可能的筛选条件
                    },
                    impressions: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'number', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    clicks: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'number', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    avgRanking: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'number', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    visitorNum: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'number', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    hasChatVisitorNum: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'number', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    leaveMsgVisitorNum: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'number', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    clueNum: {
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
                    createTime: {
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
                    }
                },
                lang_articleTable: {
                    status: this.$t('autoGenArticle.status'),
                    artTitle: this.$t('autoGenArticle.artTitle'),
                    keyword: this.$t('autoGenArticle.keyword'),
                    description: this.$t('autoGenArticle.description'),
                    URL: 'URL',
                    publishTime: this.$t('autoGenArticle.publishTime'),
                    tokens: 'tokens',
                    spentAmount: this.$t('autoGenArticle.spentAmount'),
                    isIndexed: this.$t('autoGenArticle.isIndexed'),
                    impressions: this.$t('autoGenArticle.impressions'),
                    clicks: this.$t('autoGenArticle.clicks'),
                    avgRanking: this.$t('autoGenArticle.avgRanking'),
                    visitorNum: this.$t('autoGenArticle.visitorNum'),
                    hasChatVisitorNum: this.$t('autoGenArticle.hasChatVisitorNum'),
                    leaveMsgVisitorNum: this.$t('autoGenArticle.leaveMsgVisitorNum'),
                    clueNum: this.$t('autoGenArticle.clueNum'),
                    lastUpdateTime: this.$t('autoGenArticle.lastUpdateTime'),
                    createTime: this.$t('autoGenArticle.createTime'),
                    operator: this.$t('autoGenArticle.operator')
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
                if (!this.currTaskData.id) {
                    return;
                }

                this.loading_table = true;
                getArticleTableData({
                    taskId: this.currTaskData.id, // 任务 ID
                    statusList: this.convertArtStatusToVal(this.currArtType), // 文章状态 0回收站 1草稿 2已生成 3待发布 4已发布 5审核完毕 6生成中 7待生成
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
                    this.initTable = true;
                }).catch(e => {
                    // 失败

                    console.error(e);
                    this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    this.loading_table = false;
                    this.initTable = true;
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
                            task_id,
                            status,
                            title: artTitle,
                            keywords: keyword,
                            description,
                            page_url: URL,
                            release_time: publishTime,
                            is_index: isIndexed,
                            update_time: lastUpdateTime,
                            create_time: createTime,
                            operator_user: operator,
                            tokens,
                            amount: spentAmount,
                            impressions,
                            hits: clicks,
                            average_rank: avgRanking,
                            visitors: visitorNum,
                            chat_visitors: hasChatVisitorNum,
                            message_visitors: leaveMsgVisitorNum,
                            leads: clueNum
                        } = item;

                        return {
                            id,
                            task_id,
                            status: `${status}`,
                            artTitle,
                            keyword,
                            description,
                            URL,
                            publishTime,
                            tokens,
                            spentAmount,
                            isIndexed,
                            impressions,
                            clicks,
                            avgRanking,
                            visitorNum,
                            hasChatVisitorNum,
                            leaveMsgVisitorNum,
                            clueNum,
                            lastUpdateTime,
                            createTime,
                            operator
                        };
                    });
                }

                return result;
            },
            // 转化任务状态为数字值
            convertArtStatusToVal(str) {
                const obj = {
                    all: [1, 2, 3, 4, 5, 6, 7],
                    pendingGenerate: [7],
                    generating: [6],
                    generated: [2],
                    draft: [1],
                    reviewed: [5],
                    pendingPublish: [3],
                    published: [4],
                    trash: [0]
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
                                    } else if (filterKey === 'publishTime') {
                                        result.releaseTimeStart = `${this.$options.filters.timeFormat(config.query[0])} 00:00:00`;
                                        result.releaseTimeEnd = `${this.$options.filters.timeFormat(config.query[1])} 23:59:59.999`;
                                    } else if (filterKey === 'createTime') {
                                        result.createTimeStart = `${this.$options.filters.timeFormat(config.query[0])} 00:00:00`;
                                        result.createTimeEnd = `${this.$options.filters.timeFormat(config.query[1])} 23:59:59.999`;
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
                    status: 'statusList',
                    artTitle: 'title',
                    keyword: 'keyword',
                    description: 'seoDescription',
                    URL: 'pageUrl',
                    publishTime: 'publishTime',
                    tokens: 'tokens',
                    spentAmount: 'spentAmount',
                    isIndexed: 'isIndexed',
                    impressions: 'impressions',
                    clicks: 'clicks',
                    avgRanking: 'avgRanking',
                    visitorNum: 'visitorNum',
                    hasChatVisitorNum: 'hasChatVisitorNum',
                    leaveMsgVisitorNum: 'leaveMsgVisitorNum',
                    clueNum: 'clueNum',
                    lastUpdateTime: 'lastUpdateTime',
                    createTime: 'createTime',
                    operator: 'operatorUserIds'
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
                    console.error(e);
                }
            },

            /* 表格操作 */
            // 删除
            handleDelete(row) {
                this.loading_delete = false;
                this.currRow = row;
                this.deleteConfirm = true;
            },
            deleteArt() {
                this.loading_delete = true;
                deleteArticle({
                    id: this.currRow.id
                }).then(res => {
                    switch (res.code) {
                        case '1':
                            this.$emit('refreshArtTable');
                            this.refreshData();
                            this.$Message.success(this.$t('deleteSuccess'));
                            this.deleteConfirm = false;
                            break;
                        case '10006':
                            this.$Message.error(this.$t('autoGenArticle.error_othersOperatingArticle'));
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
            // 编辑
            handleEdit(row) {
                this.$emit('editArticle', row);
            },
            // 还原
            handleRevert(row) {
                recoverArticle({
                    id: row.id
                }).then(res => {
                    switch (res.code) {
                        case '1':
                            this.$emit('refreshArtTable');
                            this.refreshData();
                            this.$Message.success(this.$t('mail.moveRestoreSuccTip'));
                            break;
                        case '10007':
                            this.$Message.error(this.$t('autoGenArticle.error_othersOperatingArticle'));
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
            currTaskData: {
                handler(val) {
                    if (val && val.id) {
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
            // filterDate() {
            //     this.refreshData_filter();
            // },
            flag_refreshArtTable: {
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
    .articleTable {
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
    .articleTable-operateCol {
        .cell {
            padding: 0 10px !important;
        }
    }
</style>
