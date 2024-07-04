<template>
    <div :style="{ minHeight: `${table_height + 100}px`}"
         class="submittedSitemaps">
        <!-- header -->
        <div class="submittedSitemaps-header">
            <!-- 标题 -->
            <div class="submittedSitemaps-title">{{ $t('googleSearchConsole.submittedSitemaps') }}</div>

            <!-- 筛选标签 -->
            <FilterTags :order_column="order_column"
                        :order_type="order_type"
                        :storageName_orderColumn="storageName_orderColumn"
                        :filterConObj.sync="config_tableFilter"
                        :langObj="lang_sitemap"
                        :width="600"
                        @removeCon="remove_filter_tag"
                        @change_filter_tag="change_filter_tag"
                        @emptySort="empty_sort"
                        class="submittedSitemaps-filterTags"></FilterTags>
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
                   @row-click="clickRow"
                   class="tabmain new-common-table">
                <!-- 正常列 -->
                <TableColumn v-for="item in tableColumns"
                             :key="item.key"
                             :prop="item.key"
                             :label="item.title"
                             :min-width="item.width"
                             :formatter="item.formatter"
                             :render-header="item.renderHeader"
                             :show-overflow-tooltip="item.key !== 'autoCommitCycle'">
                    <template slot-scope="scope">
                        <!-- 特殊列 - 点击对单元格数据做操作(比如弹出编辑框编辑) -->
                        <template v-if="item.key === 'autoCommitCycle'">
                            <div class="submittedSitemaps-autoCommitCycle">
                                <!-- 显示内容 -->
                                <TooltipAuto v-if="scope.row.autoCommitCycle"
                                             :content="scope.row.autoCommitCycleLang">
                                    <span class="submittedSitemaps-autoCommitCycle-content">{{ scope.row.autoCommitCycleLang }}</span>
                                </TooltipAuto>

                                <!-- 操作按钮 -->
                                <Icon custom="custom-remark-edit"
                                      size="14"
                                      @click.native.stop="editAutoCommitCycle($event, scope.row)"
                                      class="submittedSitemaps-autoCommitCycle-editBtn"/>
                            </div>
                        </template>

                        <!-- 特殊列 - 操作栏 -->
                        <template v-else-if="item.key === 'operate'">
                            <!-- 提交站点地图 -->
                            <Button v-if="scope.row.status === '成功'"
                                    type="text"
                                    @click.stop="submitSitemap(scope.row)"
                                    class="submittedSitemaps-operateBtn">{{ $t('googleSearchConsole.submitSitemap') }}</Button>
                        </template>

                        <!-- 其他正常列 -->
                        <template v-else-if="item.formatter">
                            {{ (item.formatter)(scope.row) || '--' }}
                        </template>
                        <template v-else>
                            {{ scope.row[item.key] || '--' }}
                        </template>
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

        <!-- 编辑自动提交周期 Popper -->
        <Poptip v-model="visibleEdit"
                :key="popperFlag"
                placement="top"
                :visible-arrow="false"
                :reference="prevTarget"
                :width="170"
                :popper-options="popperOptions"
                popper-class="autoCommitCycle-popper"
                @hide="clearEditPopperComponent"
                ref="editPopover">
            <div>
                <!-- loading -->
                <Spin v-if="loading_editAutoCommitCycle"
                      fix></Spin>

                <!-- checkbox -->
                <div>
                    <Checkbox :indeterminate="indeterminate"
                              :value="checkAll"
                              @click.prevent.native="handleCheckAll"
                              style="margin-bottom:5px;">{{ $t('crm.Modal.daily') }}</Checkbox>
                    <CheckboxGroup v-model="editingCycle"
                                   @change="changeCycle">
                        <Checkbox v-for="item in cycle_options"
                                  :key="item.value"
                                  :label="item.value">{{ item.label }}</Checkbox>
                    </CheckboxGroup>
                </div>

                <!-- 底部按钮 -->
                <div style="margin-top: 10px; text-align: right;">
                    <Button type="minor"
                            size="small"
                            @click="clearEditPopperComponent">{{ $t("cancel") }}</Button>
                    <Button type="success"
                            size="small"
                            @click="confirm_editAutoCommitCycle">{{ $t("confirm") }}</Button>
                </div>
            </div>
        </Poptip>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { searchConsole } from '@/api/google/index';
    import FilterTags from '@/views/main-components/filter-tags';
    import tableQuickEdit from '@/mixins/tableQuickEdit';

    export default {
        name: 'submittedSitemaps',
        mixins: [tableQuickEdit],
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
            refreshFlag: Boolean
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height'
            }),
            // 表格高度
            table_height() {
                let temp = this.window_height ? this.window_height - 360 : document.body.clientHeight - 360;

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
                        title: this.$t('googleSearchConsole.sitemap'),
                        key: 'sitemap',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('googleSearchConsole.type'),
                        key: 'type',
                        width: 100,
                        // formatter: row => {
                        //     switch (row.status) {
                        //         case '~~case 1':
                        //             return this.$t('googleSearchConsole.sitemap');
                        //         case '~~case 2':
                        //             return this.$t('googleSearchConsole.sitemapIndex');
                        //         case '~~case 3':
                        //             return this.$t('googleSearchConsole.RSS');
                        //         case '~~case 4':
                        //             return this.$t('googleSearchConsole.Atom');
                        //         default:
                        //             return this.$t('googleSearchConsole.unknown');
                        //     }
                        // },
                        sortable: true
                    },
                    {
                        title: this.$t('googleSearchConsole.lastReadTime'),
                        key: 'lastReadTime',
                        width: 170,
                        formatter: row => {
                            return this.$options.filters.timeFormat(row.lastReadTime);
                        },
                        sortable: true
                    },
                    {
                        title: this.$t('googleSearchConsole.status'),
                        key: 'status',
                        width: 100,
                        // formatter: row => {
                        //     switch (row.status) {
                        //         case '~~case 1':
                        //             return this.$t('googleSearchConsole.success');
                        //         case '~~case 2':
                        //             return this.$t('googleSearchConsole.haveError');
                        //         case '~~case 3':
                        //             return this.$t('googleSearchConsole.unableToCrawl');
                        //         default:
                        //             return this.$t('googleSearchConsole.fail');
                        //     }
                        // },
                        sortable: true
                    },
                    {
                        title: this.$t('googleSearchConsole.discoveredPages'),
                        key: 'discoveredPages',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('googleSearchConsole.discoveredVideos'),
                        key: 'discoveredVideos',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('googleSearchConsole.autoCommitCycle'),
                        key: 'autoCommitCycle',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('crm.Table.operate'),
                        key: 'operate',
                        width: 200,
                        sortable: false
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
                    sitemap: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    type: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'select', // 筛选类型, string / date / select / countryArea
                        query: [], // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: [
                            {
                                value: '~~value1',
                                label: this.$t('googleSearchConsole.sitemap')
                            },
                            {
                                value: '~~value2',
                                label: this.$t('googleSearchConsole.sitemapIndex')
                            },
                            {
                                value: '~~value3',
                                label: this.$t('googleSearchConsole.RSS')
                            },
                            {
                                value: '~~value4',
                                label: this.$t('googleSearchConsole.Atom')
                            },
                            {
                                value: '~~value5',
                                label: this.$t('googleSearchConsole.unknown')
                            }
                        ] // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    lastReadTime: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
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
                    status: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'select', // 筛选类型, string / date / select / countryArea
                        query: [], // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: [
                            {
                                value: '~~value1',
                                label: this.$t('googleSearchConsole.success')
                            },
                            {
                                value: '~~value2',
                                label: this.$t('googleSearchConsole.haveError')
                            },
                            {
                                value: '~~value3',
                                label: this.$t('googleSearchConsole.unableToCrawl')
                            },
                            {
                                value: '~~value4',
                                label: this.$t('googleSearchConsole.fail')
                            }
                        ] // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    discoveredPages: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'number', // 筛选类型,              string / number / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: null
                    },
                    discoveredVideos: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'number', // 筛选类型,              string / number / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: null
                    }
                },
                lang_sitemap: {
                    sitemap: this.$t('googleSearchConsole.sitemap'),
                    type: this.$t('googleSearchConsole.type'),
                    lastReadTime: this.$t('googleSearchConsole.lastReadTime'),
                    status: this.$t('googleSearchConsole.status'),
                    discoveredPages: this.$t('googleSearchConsole.discoveredPages'),
                    discoveredVideos: this.$t('googleSearchConsole.discoveredVideos'),
                    autoCommitCycle: this.$t('googleSearchConsole.autoCommitCycle')
                },

                // 当前正在操作的表格行数据
                currRow: null,

                /* 弹出框 */
                loading_editAutoCommitCycle: false,
                cycle_options: [
                    { value: 1, label: this.$t('crm.Modal.Monday') },
                    { value: 2, label: this.$t('crm.Modal.Tuesday') },
                    { value: 3, label: this.$t('crm.Modal.Wednesday') },
                    { value: 4, label: this.$t('crm.Modal.Thursday') },
                    { value: 5, label: this.$t('crm.Modal.Friday') },
                    { value: 6, label: this.$t('crm.Modal.Saturday') },
                    { value: 7, label: this.$t('crm.Modal.Sunday') }
                ],
                indeterminate: false,
                checkAll: false,
                editingCycle: []
            };
        },
        methods: {
            /* 表格数据请求 */
            refreshData() {
                this.loading_table = true;
                searchConsole.getSitemapTableData(Object.assign({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    configId: this.currSite.configId,
                    siteUrl: this.currSite.siteUrl,
                    page: this.curPage,
                    pageSize: this.pageSize,
                    orderColumn: this.order_column,
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
                            path: sitemap,
                            type,
                            lastDownloaded: lastReadTime,
                            status,
                            webNum: discoveredPages,
                            videoNum: discoveredVideos,
                            dayOfWeek: autoCommitCycle
                        } = item;
                        const autoCommitCycleLang = this.translateAutoCommitCycle(autoCommitCycle);

                        return {
                            id: sitemap,
                            sitemap,
                            type,
                            lastReadTime,
                            status,
                            discoveredPages,
                            discoveredVideos,
                            autoCommitCycle,
                            autoCommitCycleLang
                        };
                    });
                }

                return result;
            },
            translateAutoCommitCycle(arr) {
                // 未设置
                if (!Array.isArray(arr)) {
                    return this.$t('googleSearchConsole.noSet');
                }

                // 每天
                if (arr.length === this.cycle_options.length || arr.includes(8)) {
                    return this.$t('crm.Modal.daily');
                }

                return this.cycle_options.filter(item => arr.includes(item.value)).map(item => item.label).join(', ');
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
                            storageName_orderColumn: this.storageName_orderColumn,
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
                        }
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
                            case 'select':
                                result[filterKey] = config.query.map(item => item.value);
                                break;
                            case 'number':
                                result.$and = [];
                                if (config.query) {
                                    const start = {};
                                    start[filterKey] = {};
                                    start[filterKey].$gte = Number(config.query.slice(0, config.query.indexOf('-')));
                                    result.$and.push(start);

                                    const end = {};
                                    end[filterKey] = {};
                                    end[filterKey].$lte = Number(config.query.slice(config.query.indexOf('-') + 1, config.query.length));
                                    result.$and.push(end);
                                }
                                break;
                            case 'date':
                                result.startTime = `${this.$options.filters.timeFormat(config.query[0])} 00:00:00`;
                                result.endTime = `${this.$options.filters.timeFormat(config.query[1])} 23:59:59`;
                                break;
                        }
                    }
                });

                this.conObj = result;
            },
            // 根据筛选列的 key , 返回接口所需要的查询参数名
            get_search_con(key) {
                const conObj = {
                    sitemap: 'sitemapIndex',
                    type: 'type',
                    lastReadTime: 'lastReadTime',
                    status: 'status',
                    discoveredPages: 'discoveredPages',
                    discoveredVideos: 'discoveredVideos',
                    autoCommitCycle: 'autoCommitCycle'
                };

                return conObj[key] || '';
            },
            // 检索并刷新表格
            refreshData_filter() {
                this.merge_query_list();
                this.curPage = 1;
                this.refreshData();
            },

            // 更新表格数据
            updateRow(id, updateObj) {
                // 以传入数据更新, 如果需要更准确的, 可以再加一层接口请求, 请求最新数据
                this.tableData.some(item => {
                    if (item.id === id) {
                        Object.entries(updateObj).forEach(([key, value]) => {
                            item[key] = value;
                        });
                        return true;
                    }
                });
            },

            // 点击表格行
            clickRow(rowData) {
                // 点击状态为“成功”、类型为“站点地图索引”的数据行后，进入子站点地图行
                if (rowData.status === '成功' && rowData.type === '站点地图索引') {
                    this.$emit('showDetail', rowData);
                }
            },

            // 编辑自动提交周期
            editAutoCommitCycle(e, rowData) {
                this.currRow = rowData;
                const cycle = rowData.autoCommitCycle || [];
                if (cycle.includes(8)) {
                    this.editingCycle = this.cycle_options.map(item => item.value);
                } else {
                    this.editingCycle = cycle;
                }
                this.changeCycle(this.editingCycle);

                const path = e.path || (e.composedPath && e.composedPath());
                const currentTarget = Array.isArray(path) ? path[3] : e.srcElement.offsetParent; // 赋值当前点击的编辑
                if (this.prevTarget === currentTarget) {
                    this.visibleEdit = !this.visibleEdit;
                } else {
                    if (this.prevTarget) {
                        this.clearEditPopperComponent();
                    }
                    this.$nextTick(() => {
                        this.prevTarget = currentTarget;
                        this.visibleEdit = true;
                    });
                }
            },
            confirm_editAutoCommitCycle() {
                this.loading_editAutoCommitCycle = true;
                let dayOfWeek = this.editingCycle.slice();
                if (dayOfWeek.length === this.cycle_options.length) {
                    dayOfWeek = [8];
                }
                searchConsole.editAutoCommitCycle({
                    orgId: Number(this.enterpriseId),
                    configId: this.currSite.configId,
                    siteUrl: this.currSite.siteUrl,
                    feedPath: `${this.currSite.siteUrl}${this.currRow.sitemap}`,
                    dayOfWeek: dayOfWeek.join(',')
                }).then(res => {
                    if (res.code === '1') {
                        // 处理表格数据
                        this.updateRow(this.currRow.id, {
                            autoCommitCycle: dayOfWeek,
                            autoCommitCycleLang: this.translateAutoCommitCycle(this.editingCycle)
                        });
                        this.clearEditPopperComponent();
                        this.$Message.success(this.$t('googleSearchConsole.success_editAutoCommitCycle'));
                    } else {
                        this.$Message.error(this.$t('googleSearchConsole.error_editAutoCommitCycle'));
                    }
                    this.loading_editAutoCommitCycle = false;
                }).catch(e => {
                    this.$Message.error(this.$t('googleSearchConsole.error_editAutoCommitCycle'));
                    this.loading_editAutoCommitCycle = true;
                });
            },

            // 全选
            handleCheckAll() {
                if (this.indeterminate) {
                    this.checkAll = false;
                } else {
                    this.checkAll = !this.checkAll;
                }
                this.indeterminate = false;

                if (this.checkAll) {
                    this.editingCycle = this.cycle_options.map(i => i.value);
                } else {
                    this.editingCycle = [];
                }
            },
            // 单选
            changeCycle(cols) {
                if (cols.length === this.cycle_options.length) {
                    this.indeterminate = false;
                    this.checkAll = true;
                } else if (cols.length > 0) {
                    this.indeterminate = true;
                    this.checkAll = false;
                } else {
                    this.indeterminate = false;
                    this.checkAll = false;
                }
            },

            // 手动提交站点地图
            submitSitemap(rowData) {
                searchConsole.submitSitemap({
                    orgId: this.enterpriseId,
                    configId: this.currSite.configId,
                    siteUrl: this.currSite.siteUrl,
                    feedpath: `${this.currSite.siteUrl}${rowData.sitemap}`
                }).then(res => {
                    if (res.code === '1') {
                        this.$Message.success(this.$t('googleSearchConsole.success_submitSitemap'));
                        // 刷新表格
                        this.refreshData_filter();
                    } else {
                        this.$Message.error(this.$t('googleSearchConsole.error_submitSitemap'));
                    }
                });
            }
        },
        watch: {
            // 外部变动 Flag , 触发表格数据刷新
            refreshFlag() {
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
    .submittedSitemaps {
        position: relative;

        &-header {
            height: 48px;
            line-height: 48px;
            display: flex;
            color: #333;
        }

        &-title {
            display: inline-block;
            font-weight: 500;
            font-size: 16px;
            color: #2d2f2e;
        }

        &-filterTags {
            flex: 1;
            padding: 0 15px;
        }

        &-autoCommitCycle {
            display: flex;
            align-items: center;
            min-height: 23px;

            &-content {
                flex: 1;
            }

            &-editBtn {
                display: none;
                cursor: pointer;
                color: #666;

                &:not(:first-child) {
                    margin-left: 10px;
                }

                &:hover {
                    color: #FF752A;
                }
            }

            &:hover {
                .submittedSitemaps-autoCommitCycle-editBtn {
                    display: inline-block;
                }
            }
        }

        &-operateBtn {
            cursor: pointer;
            color: #3b78de;

            &:hover {
                color: #2D63BC;
            }
        }
    }
</style>

<style lang="less">
    .autoCommitCycle-popper {
        .el-checkbox {
            display: block;
        }
    }
</style>
