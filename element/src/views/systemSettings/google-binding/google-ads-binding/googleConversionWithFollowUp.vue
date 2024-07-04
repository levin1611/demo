<template>
    <div class="googleConversionWithFollowUp">
        <!-- header -->
        <div class="googleConversionWithFollowUp-header">
            <!-- 标题 -->
<!--            <div class="googleConversionWithFollowUp-title">{{ $t('googleAdsBinding.conversionList.title') }}</div>-->

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
                        class="googleConversionWithFollowUp-filterTags"></FilterTags>

            <!-- 新建关联关系 -->
            <Button type="primary"
                    @click="handleCreateRelation">{{ $t('googleAdsBinding.conversionList.createRelation') }}</Button>
        </div>

        <!-- 初始化 loading -->
        <Spin v-if="total === -1"
              fix></Spin>

        <!-- 无数据 -->
        <div v-else-if="!total"
             class="googleConversionWithFollowUp-noData"
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
               size="medium"
               highlight-current-row
               ref="table"
               class="tabmain">
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
                        <!-- 编辑 -->
                        <Button v-if="scope.row.adsAccountId"
                                type="text"
                                icon="custom custom-field-edit"
                                @click="handleEditRelation(scope.row)"
                                class="googleConversionWithFollowUp-operateBtn"></Button>
                        <!-- 删除 -->
                        <Button type="text"
                                icon="custom custom-field-delete"
                                @click="handleDeleteRelation(scope.row)"
                                class="googleConversionWithFollowUp-operateBtn"></Button>
                    </template>

                    <!-- 其他正常列 -->
                    <template v-else-if="item.formatter">{{ (item.formatter)(scope.row) || '--' }}</template>
                    <template v-else>{{ scope.row[item.key] || '--' }}</template>
                </template>
            </TableColumn>
        </Table>

        <!-- 删除确认 -->
        <Modal :visible.sync="visible_delete"
               :title="$t('googleAdsBinding.conversionList.title_deleteRelation')"
               width="450px"
               :append-to-body="true"
               :modal-append-to-body="false">
            <Spin v-if="loading_delete"
                  fix></Spin>

            <div>{{ $t('googleAdsBinding.conversionList.tip_deleteRelation') }}</div>

            <div slot="footer">
                <Button size="large"
                        @click="visible_delete = false">{{ $t('cancel') }}</Button>
                <Button type="primary"
                        size="large"
                        @click="deleteRelation">{{ $t('confirm') }}</Button>
            </div>
        </Modal>

        <!-- 新建/编辑框 -->
        <ConversionModal :visible.sync="visible_operate"
                         :type="operateType"
                         :data="editingRowData"
                         @saveSuccess="handleSaveSuccess"></ConversionModal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import ConversionModal from '@/views/systemSettings/google-binding/google-ads-binding/conversion-operation/components/conversionModal';
    import FilterTags from '@/views/main-components/filter-tags';
    import { googleAdsBind } from '@/api/google/index';
    const { getConversionListFromLeadsCloud, deleteGoogleConversion } = googleAdsBind;

    export default {
        name: 'googleConversionWithFollowUp',
        components: {
            ConversionModal,
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
                let temp = this.window_height ? this.window_height - 185 : document.body.clientHeight - 185;

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
                        title: this.$t('crm.UniSet.followUp'),
                        key: 'followup',
                        width: 140,
                        className: 'pointer',
                        formatter: row => {
                            return row.followup || '--';
                        }
                    },
                    {
                        title: this.$t('googleAdsBinding.conversionOperation.title'),
                        key: 'conversionName',
                        width: 150,
                        className: 'pointer'
                    },
                    {
                        title: this.$t('googleAdsBinding.accountList.adsAccountName'),
                        key: 'adsAccountName',
                        width: 250,
                        formatter: row => {
                            return row.adsAccountName || row.adsAccountId || '--';
                        }
                    },
                    {
                        title: this.$t('googleAdsBinding.conversionOperation.updateDate'),
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
                        title: this.$t('crm.Table.operate'),
                        key: 'operate',
                        width: 70
                    }
                ],

                /* 表头筛选 */
                // 筛选配置
                order_column: '',
                order_type: '',
                storageName_orderColumn: '',
                conObj: {},
                config_tableFilter: {
                    followup: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    conversionName: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    adsAccountName: {
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
                    followup: this.$t('crm.UniSet.followUp'),
                    conversionName: this.$t('googleAdsBinding.conversionOperation.title'),
                    adsAccountName: this.$t('googleAdsBinding.accountList.adsAccountName'),
                    bindTime: this.$t('googleAdsBinding.accountList.bindTime'),
                    operator: this.$t('googleAdsBinding.accountList.operator')
                },

                /* 删除确认框 */
                editingRowData: {},
                visible_delete: false,
                loading_delete: false,

                /* 新建/编辑转化操作 */
                // 操作类型, new || edit
                operateType: '',
                visible_operate: false
            };
        },
        methods: {
            /* 表格数据请求 */
            refreshData() {
                this.loading_table = true;

                getConversionListFromLeadsCloud(Object.assign({
                    orgId: this.enterpriseId,
                    isAll: 1,
                    needName: 1
                }, this.conObj)).then(res => {
                    if (res.code === '1') {
                        // 处理表格数据
                        const dataList = Array.isArray(res.data) ? res.data : [];
                        this.tableData = this.handleData(dataList);

                        // 保存不加任何筛选条件时, 数据总条数, 用以判断是否显示"无数据"页面
                        this.total = dataList.length || 0;
                    } else {
                        this.$Message.error(this.$t('crm.WorkBench.error_getTableData'));
                    }
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
                            followup,
                            followupId,
                            conversionName,
                            conversionId,
                            adsCustomerName: adsAccountName,
                            customerId: adsAccountId,
                            updateDate: bindTime,
                            userName: operator
                        } = item;

                        return {
                            id,
                            followup,
                            followupId,
                            conversionName,
                            conversionId,
                            adsAccountName,
                            adsAccountId,
                            bindTime,
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
                    followup: 'followup',
                    conversionName: 'conversionName',
                    adsAccountName: 'adsAccountName',
                    adsAccountId: 'adsAccountId',
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

            // 新建关联关系
            async handleCreateRelation() {
                this.operateType = 'new';
                this.editingRowData = {};
                this.visible_operate = true;
            },
            // 编辑关联关系
            handleEditRelation(rowData) {
                this.operateType = 'edit';
                this.editingRowData = rowData;
                this.visible_operate = true;
            },
            handleSaveSuccess() {
                this.refreshData_filter();
            },
            // 删除关联关系
            async handleDeleteRelation(rowData) {
                // 打开确认删除弹框
                this.editingRowData = rowData;
                this.visible_delete = true;
            },
            deleteRelation() {
                this.loading_delete = true;
                deleteGoogleConversion({
                    id: this.editingRowData.id,
                    updateUser: this.userId
                }).then(res => {
                    if (res.code === '1') {
                        this.visible_delete = false;
                        this.refreshData_filter();
                    } else {
                        this.$Message.error(this.$t('googleAdsBinding.conversionList.error_deleteRelation'));
                    }
                    this.loading_delete = false;
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
    .googleConversionWithFollowUp {
        &-header {
            display: flex;
            align-items: center;
            margin: 4px 0;
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
            font-size: 12px;

            &:not(:first-child) {
                margin-left: 18px;
            }
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
</style>
