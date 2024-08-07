<template>
    <div class="boundSiteList">
        <!-- header -->
        <div class="boundSiteList-header">
            <!-- 标题 -->
            <div class="boundSiteList-title">{{ $t('googleAdsBinding.searchConsoleBinding.googleSearchConsoleSite') }}</div>

            <!-- 筛选标签 -->
            <FilterTags :order_column="order_column"
                        :order_type="order_type"
                        :storageName_orderColumn="storageName_orderColumn"
                        :filterConObj.sync="config_tableFilter"
                        :langObj="langObj"
                        :width="600"
                        @removeCon="remove_filter_tag"
                        @change_filter_tag="change_filter_tag"
                        @emptySort="empty_sort"
                        class="boundSiteList-filterTags"></FilterTags>

            <!-- 绑定按钮 -->
            <Button type="primary"
                    @click="bindNewAccount">{{ $t('googleAdsBinding.searchConsoleBinding.bindNewAccount') }}</Button>
        </div>

        <!-- 初始化 loading -->
        <Spin v-if="total === -1"
              fix></Spin>

        <!-- 无数据 -->
        <div v-else-if="!total"
             class="boundSiteList-noData"
             :style="`height: ${table_height}px`">
            <!-- 无数据图片 -->
            <img src="@/svg/no-data.svg"
                 :alt="$t('crm.Table.noData')">
            <p>{{ $t('crm.Table.noData') }}</p>
        </div>

        <!-- 表格 -->
        <Table v-else
               :data="tableData"
               v-loading="loading_table"
               :height="table_height"
               :header-cell-class-name="headerCellClass"
               size="medium"
               highlight-current-row
               stripe
               ref="table"
               class="tabmain boundSiteList-table new-common-table">
            <!-- 正常列 -->
            <TableColumn v-for="item in tableColumns"
                         :key="item.key"
                         :prop="item.key"
                         :label="item.title"
                         :min-width="item.width || 64"
                         :formatter="item.formatter"
                         :render-header="item.renderHeader"
                         :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <!-- 操作栏 -->
                    <template v-if="item.key === 'operate'">
                        <!-- 解绑 -->
                        <Button type="text"
                                @click.stop="unbindAccountConfirm(scope.row)"
                                class="boundSiteList-operateBtn">{{ $t('googleAdsBinding.accountList.unbind') }}</Button>
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

        <!-- 解绑确认 -->
        <Modal :visible.sync="visible_unbind"
               :title="$t('googleAdsBinding.accountList.title_unbindAccount')"
               width="487px"
               :append-to-body="true"
               :modal-append-to-body="false">
            <Spin v-if="loading_unbind"
                  fix></Spin>

            <div class="multiple-line-confirmBox">{{ tip_confirmUnbind }}</div>

            <div slot="footer">
                <Button size="large"
                        @click="visible_unbind = false">{{ $t('cancel') }}</Button>
                <Button type="primary"
                        size="large"
                        @click="unbindAccount">{{ $t('confirm') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import FilterTags from '@/views/main-components/filter-tags';
    import { searchConsoleBinding } from '@/api/google/index';

    export default {
        name: 'boundSiteList',
        components: {
            FilterTags
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                window_height: 'window_height'
            }),
            // 表格高度
            table_height() {
                let temp = this.window_height ? this.window_height - 123 : document.body.clientHeight - 123;

                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            }
        },
        data() {
            return {
                /* 全局 */
                // 不加任何筛选条件时, 表格总条数, 用来判断是否显示空白页
                total: -1,

                /* 表格 */
                loading_table: true,
                tableData: [],
                tableColumns: [
                    {
                        title: this.$t('googleAdsBinding.searchConsoleBinding.googleSearchConsoleAccount'),
                        key: 'googleSearchConsoleAccount',
                        width: 150
                    },
                    {
                        title: this.$t('googleAdsBinding.searchConsoleBinding.siteProperty'),
                        key: 'siteProperty',
                        width: 250
                    },
                    {
                        title: this.$t('googleAdsBinding.accountList.bindTime'),
                        key: 'bindTime',
                        width: 150,
                        formatter: row => {
                            return this.$options.filters.timeFormat(row.bindTime, 'DateTime');
                        }
                    },
                    {
                        title: this.$t('googleAdsBinding.accountList.operator'),
                        key: 'operator',
                        width: 100
                    },
                    {
                        title: this.$t('googleAdsBinding.accountList.validStatus'),
                        key: 'status',
                        width: 100,
                        formatter: row => {
                            if (`${row.status}` === '2') {
                                return this.$t('googleAdsBinding.accountList.invalid');
                            }

                            return this.$t('googleAdsBinding.accountList.valid');
                        }
                    },
                    {
                        title: this.$t('crm.Table.operate'),
                        key: 'operate',
                        width: 100
                    }
                ],

                /* 表头筛选 */
                // 筛选配置
                order_column: '',
                order_type: '',
                storageName_orderColumn: '',
                conObj: {},
                config_tableFilter: {
                    // 固定字段
                    googleSearchConsoleAccount: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    siteProperty: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    bindTime: {
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
                    operator: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'users', // 筛选类型
                        query: [], // 筛选值
                        allList: [] // 所有可能的筛选条件
                    }
                },
                langObj: {
                    googleSearchConsoleAccount: this.$t('googleAdsBinding.searchConsoleBinding.googleSearchConsoleAccount'),
                    siteProperty: this.$t('googleAdsBinding.searchConsoleBinding.siteProperty'),
                    bindTime: this.$t('googleAdsBinding.accountList.bindTime'),
                    operator: this.$t('googleAdsBinding.accountList.operator')
                },

                /* 解绑弹框 */
                tip_confirmUnbind: '',
                data_confirmUnbind: {},
                visible_unbind: false,
                loading_unbind: false
            };
        },
        methods: {
            /* 表格数据请求 */
            refreshData() {
                this.loading_table = true;

                searchConsoleBinding.getBoundSiteList(Object.assign({
                    orgId: this.enterpriseId
                }, this.conObj)).then(res => {
                    if (res.code === '1') {
                        // 处理表格数据
                        this.tableData = this.handleData(res.data);

                        // 保存不加任何筛选条件时, 数据总条数, 用以判断是否显示"无数据"页面
                        this.total = this.tableData.length || 0;
                    } else {
                        this.$Message.error(this.$t('crm.WorkBench.error_getTableData'));
                    }
                    this.loading_table = false;
                }).catch(e => {
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
                            configId,
                            googleAccount: googleSearchConsoleAccount,
                            siteUrl: siteProperty,
                            createTime: bindTime,
                            validStatus: status,
                            operatorName: operator
                        } = item;

                        return {
                            id,
                            configId,
                            googleSearchConsoleAccount,
                            siteProperty,
                            bindTime,
                            status,
                            operator
                        };
                    });
                }

                return result;
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
                        }
                    });

                    /* 返回 DOM */
                    return h('div', {
                        class: 'table-filter-container'
                    }, [
                        title,
                        (this.order_column === column.key && this.order_type) ? sortIcons : undefined,
                        column.hasOwnProperty('show_filter_content') ? filterPop : undefined
                    ]);
                };
            },
            // 表格表头单元格 class 方法
            headerCellClass({ column }) {
                const result = [];
                // 如果可调整列宽, 则设置相应 class
                if (column.resizable) {
                    result.push('resizable-col');
                }

                return result.join(' ');
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
                            case 'selectSingle':
                                result[filterKey] = config.query.map(item => item.value)[0];
                                break;
                            case 'select':
                                result[filterKey] = config.query.map(item => item.value);
                                break;
                            case 'date':
                                if (key === 'bindTime') {
                                    result.startTime = `${this.$options.filters.timeFormat(config.query[0])} 00:00:00`;
                                    result.endTime = `${this.$options.filters.timeFormat(config.query[1])} 23:59:59`;
                                }
                                break;
                            case 'countryArea':
                                result[filterKey] = (config.query[0] || '').replace('unknown', ''); // [code, name]
                                break;
                            case 'users':
                                if (key === 'operator') {
                                    result.userIdList = config.query.map(item => item.value);
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
                    googleSearchConsoleAccount: 'googleSearchConsoleAccount',
                    siteProperty: 'siteProperty',
                    bindTime: 'bindTime',
                    operator: 'operator'
                };

                return conObj[key] || '';
            },
            // 检索并刷新表格
            refreshData_filter() {
                this.merge_query_list();
                this.refreshData();
            },

            // 绑定/解绑
            async bindNewAccount() {
                // 获取已绑定的 google 账号
                const res_getAccountList = await searchConsoleBinding.getAccountList({
                    orgId: this.enterpriseId
                });

                // 如果有账号, 直接跳转到绑定页面让客户选账号
                if (res_getAccountList.code === '1') {
                    if (Array.isArray(res_getAccountList.data) && res_getAccountList.data.length) {
                        this.$emit('changeView', 'SearchConsoleBinding');
                        return;
                    }
                }

                // 否则直接获取绑定 url 新窗口打开 Google 授权页面, 再跳转到绑定页面
                searchConsoleBinding.getGoogleBindUrl({
                    orgId: this.enterpriseId,
                    operatorId: this.userId,
                    operatorName: this.fullName
                }).then(res => {
                    if (res.code === '1') {
                        this.$Message.info(this.$t('bind.info_beforeAuthorized'));
                        window.setTimeout(() => {
                            window.open(res.data);
                            this.$emit('changeView', 'SearchConsoleBinding');
                            sessionStorage.setItem('openBindModal', '1');
                        }, 2000);
                    } else {
                        this.$Message.error(this.$t('bind.error_getFailed'));
                    }
                });
            },
            // 确认解绑弹框
            async unbindAccountConfirm(rowData) {
                // 打开确认解绑弹框
                this.tip_confirmUnbind = this.$t('googleAdsBinding.searchConsoleBinding.tip_unbindSite').replace('$site', rowData.siteProperty);
                this.data_confirmUnbind = rowData;
                this.visible_unbind = true;
            },
            // 解绑账户
            unbindAccount() {
                const rowData = this.data_confirmUnbind;
                this.loading_unbind = true;
                searchConsoleBinding.unbindSite({
                    orgId: this.enterpriseId,
                    id: rowData.id,
                    bindingStatus: 2 // 无效 2
                }).then(res => {
                    if (res.code === '1') {
                        this.visible_unbind = false;
                        this.refreshData_filter();
                    } else {
                        this.$Message.error(this.$t('googleAdsBinding.accountList.error_unbindAccount'));
                    }
                    this.loading_unbind = false;
                });
            }
        },
        mounted() {
            // 配置表格筛选
            this.handleConfigureTableFilter();
            this.refreshData_filter();
        }
    };
</script>

<style lang="less" scoped>
    .boundSiteList {
        padding: 10px 30px;

        &-header {
            display: flex;
            align-items: center;
            margin: 10px 0;
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

        &-operateBtn {
            cursor: pointer;
            color: #3b78de;
            font-size: 14px;
        }

        &-noData {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            p {
                margin-top: 13px;

                a {
                    color: #3B78DE;
                    cursor: pointer;
                }
            }
        }
    }
</style>

<style lang="less">
    .multiple-line-confirmBox {
        white-space: break-spaces;
        color: #333;
    }

    .boundSiteList-table {
        table {
            .cell {
                padding-left: 0;
            }
        }
    }
</style>
