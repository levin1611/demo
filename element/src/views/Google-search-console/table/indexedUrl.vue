<template>
    <div class="indexedUrl-table">
        <!-- header -->
        <div class="indexedUrl-table-header">
            <!-- 筛选标签 -->
            <FilterTags :order_column="order_column"
                        :order_type="order_type"
                        :storageName_orderColumn="storageName_orderColumn"
                        :filterConObj.sync="config_tableFilter"
                        :langObj="lang_googleSearchConsole"
                        :width="600"
                        @removeCon="remove_filter_tag"
                        @change_filter_tag="change_filter_tag"
                        @emptySort="empty_sort"
                        class="indexedUrl-table-filterTags"></FilterTags>

            <!-- 文件导出 -->
            <Tooltip :content="$t('crm.Table.exportData')"
                     effect="dark"
                     placement="bottom">
                <Button type="text"
                        icon="custom custom-file-download"
                        @click="exportData"
                        class="googleSearchConsole-exportData"></Button>
            </Tooltip>
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
                             :formatter="item.formatter"
                             :render-header="item.renderHeader"
                             :show-overflow-tooltip="true">
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
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { searchConsole } from '@/api/google/index';
    import FilterTags from '@/views/main-components/filter-tags';

    export default {
        name: 'indexedUrlTable',
        components: {
            FilterTags
        },
        props: {
            currSite: {
                type: Object,
                default() {
                    return {};
                }
            },
            filterDate: {
                type: Array,
                default() {
                    return [];
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
                let temp = this.window_height ? this.window_height - 155 : document.body.clientHeight - 155;

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
                /* 表格 */
                loading_table: true,
                initTable: false,
                tableData: [],
                tableColumns: [
                    {
                        title: this.$t('googleSearchConsole.url'),
                        key: 'url',
                        width: 350,
                        sortable: true
                    },
                    {
                        title: this.$t('googleSearchConsole.lastCrawlTime'),
                        key: 'lastCrawlTime',
                        width: 50,
                        sortable: true
                    }
                ],

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
                conObj: {},
                config_tableFilter: {
                    // 固定字段
                    url: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    lastCrawlTime: {
                        sort: true, // 是否允许排序
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
                    }
                },
                lang_googleSearchConsole: {
                    url: this.$t('googleSearchConsole.url'),
                    lastCrawlTime: this.$t('googleSearchConsole.lastCrawlTime')
                }
            };
        },
        methods: {
            /* 表格数据请求 */
            refreshData() {
                this.loading_table = true;
                searchConsole.getIndexedUrlTableData(Object.assign({
                    siteUrl: this.currSite.siteUrl,
                    startDate: this.filterDate[0],
                    endDate: this.filterDate[1],
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    page: this.curPage,
                    pageSize: this.pageSize,
                    orderColumn: this.get_search_con(this.order_column),
                    orderType: this.order_type
                }, this.conObj)).then(res => {
                    if (res.code === '1') {
                        // 处理表格数据
                        if (res.data && Array.isArray(res.data.items)) {
                            this.tableData = this.handleData(res.data.items);
                            this.totalNum = res.data.total || 0;
                        } else {
                            this.tableData = [];
                            this.totalNum = 0;
                        }
                    } else {
                        this.$Message.error(this.$t('crm.WorkBench.error_getTableData'));
                    }
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
                            inspectionUrl: url,
                            lastCrawlDate: lastCrawlTime
                        } = item;

                        return {
                            url,
                            lastCrawlTime
                        };
                    });
                }

                return result;
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
                        case 'countryArea':
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
                            case 'date':
                                if (config.query[0] && config.query[1]) {
                                    result[filterKey] = config.query.map(item => this.$options.filters.timeFormat(item)).join('~');
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
                    url: 'inspectionUrlKey',
                    lastCrawlTime: 'lastCrawlDateKey'
                };

                return conObj[key] || '';
            },
            // 检索并刷新表格
            refreshData_filter() {
                this.merge_query_list();
                this.curPage = 1;
                this.refreshData();
            },

            // 文件下载
            exportData() {
                window.open(`${this.$util.internationalUrl}/oversea/siteIndex/downloadIUD?query=${encodeURIComponent(JSON.stringify(Object.assign({
                    siteUrl: this.currSite.siteUrl,
                    startDate: this.filterDate[0],
                    endDate: this.filterDate[1],
                    orderColumn: this.get_search_con(this.order_column),
                    orderType: this.order_type
                }, this.conObj)))}`, '_blank');
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
            }
        },
        watch: {
            'currSite.id': {
                handler(val) {
                    if (val) {
                        this.refreshData_filter();
                    }
                }
            },
            filterDate() {
                this.refreshData_filter();
            }
        },
        mounted() {
            // 配置表格筛选
            this.handleConfigureTableFilter();
            // 初始数据请求
            this.refreshData_filter();
        }
    };
</script>

<style scoped lang="less">
    .indexedUrl-table {
        position: relative;

        &-header {
            height: 48px;
            line-height: 48px;
            display: flex;
        }

        &-filterTags {
            flex: 1;
            padding: 0 15px 0 0;
        }

        .googleSearchConsole-exportData {
            margin-top: 9px;
        }
    }
</style>
