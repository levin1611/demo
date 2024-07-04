<template>
    <div class="conversion-operation">
        <div class="tips">{{$t('googleAdsBinding.conversionOperation.tips')}}</div>
        <div class="date-picker clearfloat">
            <!--     筛选标签 -->
            <FilterTags
                    :order_column="order_column"
                    :order_type="order_type"
                    :storageName_orderColumn="storageName_orderColumn"
                    :filterConObj.sync="config_tableFilter"
                    :langObj="lang_company"
                    :width="600"
                    @emptySort="empty_sort"
                    @removeCon="remove_filter_tag"
                    @change_filter_tag="change_filter_tag"></FilterTags>

<!--            <Button v-if="isGoogleBind"-->
            <Button type="primary"
                    @click="createOperation"
                    class="float-right">{{ $t('googleAdsBinding.conversionOperation.createOperation') }}</Button>
        </div>

        <!-- 修改字段 -->
        <EditColumns
                :visible.sync="visible_edit_columns"
                :columnType="columnType"
                :id.sync="id_column_show_order"
                :allColumns="allColumns"
                :allGroup="allGroup"
                :group.sync="group">
        </EditColumns>

        <Table v-if="refreshColumn"
               :data="showTableData"
               :height="table_height"
               v-loading="loading"
               size="medium"
               :isCustom="true"
               :customEmptyText="customEmptyTextLang"
               customEmptyButtonText=""
               :customClearMethod="clearFilterConditionByInitView"
               :header-cell-class-name="headerCellClass"
               :border="true"
               @row-click="editOperation"
               @mousemove.native="handleTableColHover"
               @mousedown.native="handleTableColResizeStart"
               @header-dragend="handleTableColResizeEnd"
               style="width: 100%"
               class="tabmain noBoxShadow-right noborder-table resizable-table">
            <TableColumn v-for="item in tableColumns"
                         :key="item.key"
                         :prop="item.key"
                         :label="item.title"
                         :width="item.width"
                         :min-width="item.width || 64"
                         :formatter="item.formatter"
                         :render-header="item.renderHeader"
                         :show-overflow-tooltip="true">
            <template slot-scope="scope">
                <template v-if="item.formatter">
                    {{(item.formatter)(scope.row)}}
                </template>
                <template v-else-if=" item.key === 'status' ">
                    <p>
                        <el-switch @click.stop
                                   :value="scope.row.status === 'ENABLED'"
                                   active-color="#409EFF"
                                   inactive-color="#DCDFE6"
                                   @change="handleToggleStatus(scope.row)"></el-switch>
                    </p>
                </template>
                <template v-else>
                    {{scope.row[item.key]}}
                </template>
            </template>
            </TableColumn>
            <!-- 末列字段配置按钮 -->
            <TableColumn width="35"
                         align="center"
                         :resizable="false"
                         :render-header="renderHeader_editColumn"
                         class-name="no-padding-cell">
            </TableColumn>
        </Table>

        <!-- 新建转化操作 -->
        <OperationModal :createModal.sync="createModal"
                        :title="title"
                        :followups="followups"
                        :customerId="customerId"
                        :adsCustomerName="adsCustomerName"
                        ref="operation"
                        @updateList="getList()"></OperationModal>

        <!-- 编辑转化操作 -->
        <UpdateModal :visible.sync="visible_updateModal"
                     :title="title"
                     :followups="followups"
                     :customerId="customerId"
                     :adsCustomerName="adsCustomerName"
                     :currentRow="currentRow"
                     @updateList="getList"></UpdateModal>

        <Modal width="520px"
               :visible.sync="confirmModal"
               :title="$t('googleAdsBinding.conversionOperation.updateStatus')"
               :modal-append-to-body="false">
            <Spin v-if="loading_changeStatus"
                  fix></Spin>
            {{ $t('googleAdsBinding.conversionOperation.changeStatusConfirm') }}
            <div slot="footer">
                <Button :loading="loading_changeStatus"
                        @click="resetStatus">{{ $t('cancel') }}</Button>
                <Button type="primary"
                        :loading="loading_changeStatus"
                        @click="changeStatus">{{ $t('confirm') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import OperationModal from './components/operationModal';
    import util from '@/libs/util.js';
    import { mapState } from 'vuex';
    import UpdateModal from './components/updateModal';
    import FilterTags from '@/views/main-components/filter-tags';
    import EditColumns from '@/views/crm/Table/Components/Modal/editColumns';
    import resetInitComponents from '@/mixins/resetComponentViewData';
    import tableColResize from '@/mixins/tableColResize';

    export default {
        mixins: [resetInitComponents, tableColResize],
        name: 'ConversionOperation',
        components: {
            OperationModal,
            UpdateModal,
            FilterTags,
            EditColumns
        },
        props: {
            activeTab: String,
            activeName: String,
            customerId: String,
            adsCustomerName: String
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                isGoogleBind: state => state.google.isGoogleBind
            }),
            table_height() {
                const temp = this.window_height ? this.window_height - 276 : document.body.clientHeight - 276;
                return temp > 200 ? temp : 200;
            },
            // 所有表格列对应的 column.key
            allGroup() {
                return this.allColumns.map(item => item.key);
            },
            showTableData() {
                let temp = [];
                // 处理筛选
                temp = this.tableData.filter(item => {
                    // 筛选关联时间
                    const filterCon_updateDate = this.config_tableFilter.updateDate.query;
                    if (Array.isArray(filterCon_updateDate) && filterCon_updateDate.length) {
                        const start = filterCon_updateDate[0].getTime();
                        const end = filterCon_updateDate[1].getTime() + 24 * 60 * 60 * 1000 - 1;
                        if (!(item.updateDate && item.updateDate >= start && item.updateDate <= end)) {
                            return false;
                        }
                    }
                    // 筛选转化价值
                    const filterCon_conversionValue = this.config_tableFilter.valueType.query;
                    if (filterCon_conversionValue.length) {
                        if (!item.valueType.includes(filterCon_conversionValue)) {
                            return false;
                        }
                    }

                    return true;
                });

                // 处理排序
                if (this.order_column && this.order_type) {
                    if (this.order_column === 'updateDate') {
                        // 关联时间排序
                        if (this.order_type === 'asc') {
                            temp = temp.sort((a, b) => {
                                const tempA = a.updateDate || 0;
                                const tempB = b.updateDate || 0;
                                return tempA - tempB;
                            });
                        } else if (this.order_type === 'desc') {
                            temp = temp.sort((a, b) => {
                                const tempA = a.updateDate || 0;
                                const tempB = b.updateDate || 0;
                                return tempB - tempA;
                            });
                        }
                    } else if (this.order_column === 'valueType') {
                        // 价值排序
                        if (this.order_type === 'asc') {
                            temp = temp.sort((a, b) => a.CNYValue - b.CNYValue);
                        } else if (this.order_type === 'desc') {
                            temp = temp.sort((a, b) => b.CNYValue - a.CNYValue);
                        }
                    }
                }

                return temp;
            }
        },
        created() {
            this.tableColumns = this.tableColumns.map((col, index) => {
                if (this.config_tableFilter.hasOwnProperty(col.key)) {
                    col.show_filter_content = false;
                    col.filtering = false;
                    col.renderHeader = this.renderHeader_filter(index);
                } else {
                    col.renderHeader = this.renderHeader_text(index);
                }
                return col;
            });
            this.allColumns = this.tableColumns.concat();
            this.getFieldOrderList();
            this.init_filter_table();
        },
        watch: {
            activeName(val) {
                console.log('val=', val);
            },
            activeTab(val) {
                if (val === 'conversionOperation') {
                    this.tableColumns = this.tableColumns.map((col, index) => {
                        if (this.config_tableFilter.hasOwnProperty(col.key)) {
                            col.show_filter_content = false;
                            col.filtering = false;
                            col.renderHeader = this.renderHeader_filter(index);
                        } else {
                            col.renderHeader = this.renderHeader_text(index);
                        }
                        return col;
                    });
                    this.allColumns = this.tableColumns.concat();
                    this.getFieldOrderList();
                    this.init_filter_table();
                }
            },
            group: {
                handler(val) {
                    this.changeGroups(val);
                }
                // immediate: true
            }
        },
        data() {
            return {
                refreshColumn: true,
                transfer: true,
                date: [],
                texts: '',
                tableColumns: [
                    {
                        title: this.$t('googleAdsBinding.conversionOperation.title'),
                        key: 'name',
                        width: 120,
                        className: 'pointer'
                    },
                    {
                        title: this.$t('googleAdsBinding.conversionOperation.category'),
                        key: 'category',
                        width: 140,
                        className: 'pointer',
                        formatter: row => {
                            let str = row.category;
                            if (['CONVERTED_LEAD', 'IMPORTED_LEAD', 'QUALIFIED_LEAD'].includes(row.category)) {
                                str = this.$t(`googleAdsBinding.conversionOperation.types.${row.category}`);
                            }
                            return str;
                        }
                    },
                    {
                        title: this.$t('googleAdsBinding.conversionOperation.status'),
                        className: 'pointer',
                        width: 100,
                        key: 'status',
                        slot: 'status'
                    },
                    {
                        title: this.$t('googleAdsBinding.conversionOperation.statisticalMethods'),
                        key: 'countingType',
                        className: 'pointer',
                        width: 120,
                        formatter: row => {
                            switch (row.countingType) {
                                case 'ONE_PER_CLICK':
                                    return this.$t('googleAdsBinding.conversionOperation.onlyOnce');
                                case 'MANY_PER_CLICK':
                                    return this.$t('googleAdsBinding.conversionOperation.everyTime');
                                default:
                                    return '';
                            }
                        }
                    },
                    {
                        title: this.$t('googleAdsBinding.conversionOperation.conversionTimeRange'),
                        key: 'ctcLookbackWindow',
                        width: 120,
                        className: 'pointer'
                    },
                    {
                        title: this.$t('googleAdsBinding.conversionOperation.valueType'),
                        key: 'valueType',
                        tooltip: true,
                        className: 'pointer',
                        width: 125
                    },
                    {
                        title: this.$t('googleAdsBinding.conversionOperation.conversionTimesColumn'),
                        key: 'excludeFromBidding',
                        width: 150,
                        className: 'ellipsis',
                        // 这个字段是反的  true 显示否
                        formatter: row => {
                            return row.excludeFromBidding === true ? this.$t('no') : this.$t('yes');
                        }
                    },
                    {
                        title: this.$t('googleAdsBinding.conversionOperation.allConversions'),
                        key: 'allConversions',
                        width: 120,
                        className: 'pointer',
                        formatter: row => {
                            return row.allConversions || '0.00';
                        }
                    },
                    {
                        title: this.$t('googleAdsBinding.conversionOperation.allConversionValue'),
                        key: 'allConversionValue',
                        width: 120,
                        className: 'pointer',
                        formatter: row => {
                            return row.allConversionValue || '0.00';
                        }
                    }
                    // {
                    //     title: this.$t('googleAdsBinding.conversionOperation.followupStatus'),
                    //     key: 'followup',
                    //     width: 120,
                    //     className: 'pointer',
                    //     formatter: row => {
                    //         return row.followup || '--';
                    //     }
                    // },
                    // {
                    //     title: this.$t('googleAdsBinding.conversionOperation.updateDate'),
                    //     key: 'updateDate',
                    //     width: 120,
                    //     className: 'pointer',
                    //     formatter: row => {
                    //         let updateDate = '';
                    //         if (row.updateDate) {
                    //             const date = new Date(row.updateDate);
                    //             updateDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                    //         } else {
                    //             updateDate = '--';
                    //         }
                    //         return updateDate;
                    //     }
                    // }
                ],
                tableData: [],
                currentRow: {},
                title: this.$t('googleAdsBinding.conversionOperation.createOperation'),
                followups: [],
                createModal: false,
                visible_updateModal: false,
                confirmModal: false,
                loading_changeStatus: false,
                createButton: false,
                loading: false,
                queryData: {
                    $and: []
                },
                lang_company: {
                    // 默认字段
                    updateDate: this.$t('googleAdsBinding.conversionOperation.updateDate'),
                    valueType: this.$t('googleAdsBinding.conversionOperation.valueType')

                },
                // 表头筛选条件
                storageName_orderColumn: '',
                /* 筛选 */
                order_column: '',
                order_type: '',
                config_tableFilter: {
                    valueType: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null
                    },
                    updateDate: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型, string / date / select / countryArea
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
                        query: [], // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    followup: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null
                    }
                },

                /* 修改字段 */
                visible_edit_columns: false, // 显隐
                columnType: 13, // 字段所属模块 1客户2联系人3询盘4公海客户5线索6公海线索 7fbleads  11网站留言 12产品管理 13Google Ads绑定
                id_column_show_order: undefined, // 获取和更新字段顺序所需的 ID
                group: [], // 所有 column 的已排序的 key
                // 保存到后端的字段属性, 目前只有 width
                fieldStyle: {},

                allColumns: []// 表格全部列
            };
        },
        methods: {
            // 表格表头单元格 class 方法
            headerCellClass({ column }) {
                const result = [];
                // 如果可调整列宽, 则设置相应 class
                if (column.resizable) {
                    result.push('resizable-col');
                }

                // 有 tip 提示的 column , 指定特殊 class , 修改 cell 的 padding 以容纳 tip 和筛选按钮
                if (['followup', 'updateDate'].includes(column.property)) {
                    const filterSet = this.config_tableFilter[column.property];
                    if (filterSet && filterSet.filter) {
                        result.push('hasTipAndFilterCell');
                    }
                }

                return result.join(' ');
            },
            // filterTags 组件内部修改筛选值后触发的方法, 由下方的 updateList 改造而成
            change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    const column = this.allColumns.find(item => item.key === key);
                    if (column) {
                        // 判断是否有值, 调整 filtering
                        if (temp.query.length) {
                            this.allColumns = this.allColumns.map(item => {
                                if (item.key === key) {
                                    item.filtering = true;
                                }
                                return item;
                            });
                        } else {
                            this.allColumns = this.allColumns.map(item => {
                                if (item.key === key) {
                                    item.filtering = false;
                                }
                                return item;
                            });
                        }
                    } else {
                        this.remove_filter_tag(key);
                    }
                } else {
                    this.remove_filter_tag(key);
                }
            },
            // 初始化筛选条件
            init_filter_table() {
                this.getList();
            },
            // 设定初始筛选条件
            init_filter(key, title, val) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    this.$set(this.config_tableFilter[key], 'query', val);
                    return true;
                } else {
                    return false;
                }
            },
            empty_sort() {
                // 清空
                this.order_column = '';
                this.order_type = '';

                // 刷新
                this.curPage = 1;
                this.getList();
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
                        case 'select':
                        case 'countryArea':
                        case 'date':
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
                }
            },

            // 返回字段筛选渲染函数
            renderHeader_filter(colIndex) {
                return h => {
                    const column = this.allColumns[colIndex];
                    const config = this.config_tableFilter[column.key];
                    /* DOM */
                    // 标题
                    const title = h('div', {
                        attrs: {
                            title: column.title
                        },
                        class: 'table-filter-title'
                    }, column.title);

                    // 系统 tips
                    const helpTip = ['followup', 'updateDate'].includes(column.key)
                        ? h('HelpTip', {
                            props: {
                                title: (key => {
                                    switch (key) {
                                        case 'followup':
                                            return this.$t('helpTip.customerFollowupStatus');
                                        case 'updateDate':
                                            return this.$t('helpTip.relatedTime');
                                    }
                                })(column.key)
                            },
                            class: 'table-head-tip'
                        })
                        : undefined;

                    // 排序组件
                    const order_column = column.key;
                    const sortIcons = config.sort
                        ? h('span', {
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
                        ])
                        : undefined;

                    // 筛选组件
                    const filterPop = config.filter
                        ? h('FilterBox', {
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
                                        // 判断是否有值, 调整 filtering
                                        if (temp.query.length) {
                                            this.allColumns = this.allColumns.map((item, index) => {
                                                if (index === colIndex) {
                                                    item.filtering = true;
                                                }
                                                return item;
                                            });
                                        } else {
                                            this.allColumns = this.allColumns.map((item, index) => {
                                                if (index === colIndex) {
                                                    item.filtering = false;
                                                }
                                                return item;
                                            });
                                        }
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
                        })
                        : undefined;

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

            renderHeader_editColumn(h) {
                return h('div', [
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

            createOperation() {
                this.title = this.$t('googleAdsBinding.conversionOperation.createOperation');
                this.currentRow = {};
                this.createModal = true;
            },
            // 判断是否绑定了google账号

            editOperation(row, column, event) {
                // 先赋值 currentRow , 因为 switch 切换状态和点击表格行进行编辑都要用到 currentRow
                this.currentRow = row;
                // 部分特定 class 元素, 点击不弹出编辑框
                const excludeClassNames = [
                    'el-switch',
                    'el-switch__core'
                ];
                if (event && event.target && event.target.classList) {
                    const classList = event.target.classList;
                    if (excludeClassNames.some(item => classList.contains(item))) {
                        return;
                    }
                }

                // 否则弹出编辑框
                this.title = this.$t('googleAdsBinding.conversionOperation.editOperation');
                this.visible_updateModal = true;
            },
            getList() {
                this.loading = true;
                this.tableData = [];
                util.axios.all([this.getConversion(), this.getConversionTimes(), this.getFollowStatus()]).then(util.axios.spread((...responses) => {
                    // 任一接口报错则停止向下执行
                    // 修正: 后端要去第二个接口返回 code 0 时不报错
                    // if (responses[0].data.code !== '1' || responses[2].data.code !== '1') {
                    if (responses[0].data.code !== '1') {
                        if (responses[0].data.code !== '1') {
                            switch (responses[0].data.message) {
                                case '没有 google adwords 配置！':
                                    this.$Message.error(this.$t('googleAdsBinding.conversionOperation.error_haveNoGASettings'));
                                    break;
                                case 'google广告账号有误，不能使用！！！':
                                    this.$Message.error(this.$t('googleAdsBinding.conversionOperation.error_GAAccount'));
                                    break;
                                case '获取账号列表失败，请检查是否创建账号列表！！！':
                                    this.$Message.error(this.$t('googleAdsBinding.conversionOperation.error_getAccountList'));
                                    break;
                                default:
                                    this.$Message.error(this.$t('googleAdsBinding.conversionOperation.error_getData'));
                            }
                            // 获取表格数据出错, 精确提示错误原因
                        } else {
                            // 其他请求错误, 提示默认错误提示语
                            this.$Message.error(this.$t('googleAdsBinding.conversionOperation.error_getData'));
                        }

                        this.loading = false;
                        return false;
                    }

                    // getConversion
                    let res = responses[0];
                    const result = res.data.data.map(item => {
                        // 处理"价值"字段
                        let valueType = ''; // 最终显示的"价值"文字
                        let CNYValue = -1; // 转化后的价值数额, 默认为 -1 , 排序用
                        if (item.alwaysUseDefaultRevenueValue === true && item.defaultRevenueValue === 0) {
                            // 不使用价值
                            valueType = this.$t('googleAdsBinding.conversionOperation.unusedValue');
                        } else if (item.alwaysUseDefaultRevenueValue === true) {
                            // 使用相同价值
                            if (item.defaultRevenueCurrencyCode) {
                                valueType = item.defaultRevenueCurrencyCode === 'CNY' ? `￥${item.defaultRevenueValue}` : `$${item.defaultRevenueValue}`;
                                CNYValue = item.defaultRevenueCurrencyCode === 'CNY' ? item.defaultRevenueValue : 7 * item.defaultRevenueValue;
                            }
                        } else if (item.alwaysUseDefaultRevenueValue === false) {
                            // 使用不同价值
                            if (item.defaultRevenueCurrencyCode) {
                                valueType = item.defaultRevenueCurrencyCode === 'CNY' ? `${this.$t('googleAdsBinding.conversionOperation.useDifferentValues')}￥${item.defaultRevenueValue}` : `${this.$t('googleAdsBinding.conversionOperation.useDifferentValues')}$${item.defaultRevenueValue}`;
                                CNYValue = item.defaultRevenueCurrencyCode === 'CNY' ? item.defaultRevenueValue : 7 * item.defaultRevenueValue;
                            }
                        }
                        item.valueType = valueType;
                        item.CNYValue = CNYValue;
                        return item;
                    });

                    // getConversionTimes
                    res = responses[1];
                    if (res.data.code === '1') {
                        res.data.data.forEach((report) => {
                            result.forEach(item => {
                                if (report.conversionTrackerId == item.id) {
                                    this.$set(item, 'allConversionValue', report.allConversionValue);
                                    this.$set(item, 'allConversions', report.allConversions);
                                }
                            });
                        });
                    }

                    // getFollowups
                    res = responses[2];
                    if (res.data.code === '1') {
                        const expiredCRMData = [];
                        this.followups = res.data.data || [];
                        this.followups.forEach(follow => {
                            result.some(item => {
                                if (follow.conversionId == item.id) {
                                    this.$set(item, 'followup', follow.followup);
                                    this.$set(item, 'followupId', follow.followupId);
                                    this.$set(item, 'bindFollowupId', follow.id);
                                    this.$set(item, 'updateDate', follow.updateDate);

                                    // 对比此接口和表格主体数据接口的数据, 转化名称等属性应以后者为准, 先暂存不一致数据, 之后一起发给后端, 让其更新数据库
                                    // useRevenueValue 是 CRM 独有的字段, 根据此逻辑计算而来
                                    let google_useRevenueValue;
                                    if (item.alwaysUseDefaultRevenueValue === true && item.defaultRevenueValue === 0) {
                                        // 不使用价值
                                        google_useRevenueValue = 3;
                                    } else if (item.alwaysUseDefaultRevenueValue === true) {
                                        // 使用相同价值
                                        google_useRevenueValue = 1;
                                    } else if (item.alwaysUseDefaultRevenueValue === false) {
                                        // 使用不同价值
                                        google_useRevenueValue = 2;
                                    }
                                    // 对比数据, 判断是否需要更新
                                    if (follow.conversionName !== item.name ||
                                        follow.defaultRevenueValue !== item.defaultRevenueValue ||
                                        follow.alwaysUseDefault !== item.alwaysUseDefaultRevenueValue ||
                                        follow.useRevenueValue !== google_useRevenueValue) {
                                        expiredCRMData.push({
                                            conversionId: item.id,
                                            conversionName: item.name,
                                            defaultRevenueValue: item.defaultRevenueValue,
                                            alwaysUseDefault: item.alwaysUseDefaultRevenueValue,
                                            useRevenueValue: google_useRevenueValue,
                                            followup: follow.followup,
                                            followupId: follow.followupId
                                        });
                                    }
                                }
                            });
                        });

                        // CRM 存的转化数据过期, 发送 Google 转化数据(目前只有: 转化名, 默认价值)给后端更新数据
                        if (expiredCRMData.length) {
                            // 接口请求
                            expiredCRMData.forEach(item => {
                                this.updateConversionConfig(item);
                            });
                        }
                    }

                    // // 对结果排序, 赋值给表格数据
                    // // 有关联跟进状态的, 以关联时间倒序排序
                    // const list_haveFollowupId = result.filter(item => item.hasOwnProperty('followupId')).sort((a, b) => {
                    //     return (b.updateDate || 0) - (a.updateDate || 0);
                    // });
                    // // 无关联跟进状态的, 以创建时间排序
                    // const list_haveNoFollowupId = result.filter(item => !item.hasOwnProperty('followupId')).sort((a, b) => {
                    //     return (b.id || 0) - (a.id || 0);
                    // });
                    // // 优先显示有关联跟进状态的
                    // this.tableData = [].concat(list_haveFollowupId).concat(list_haveNoFollowupId);

                    this.tableData = result;
                    this.loading = false;
                })).catch(error => {
                    console.log(error);
                    this.$Message.error(this.$t('googleAdsBinding.conversionOperation.error_getData'));
                    this.loading = false;
                });
            },
            // 更新转化数据(从 Google 获取转化数据时, 如果发现 CRM 存的转化数据不准, 更新数据)
            updateConversionConfig(data) {
                util.ajax({
                    url: '/crm/conversionRelation/update',
                    method: 'post',
                    data: Object.assign({
                        orgId: this.enterpriseId,
                        customerId: this.customerId
                    }, data)
                });
            },
            // 获取转化操作表格数据
            getConversion() {
                return util.ajaxInternational({
                    url: '/oversea/adsConversion/getList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        customerId: this.customerId
                    }
                });
            },
            // 获取转化次数和转化价值
            getConversionTimes() {
                return util.ajaxInternational({
                    url: '/oversea/adsReport/getReport',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        reportType: 8
                    }
                });
            },
            // 获取转化操作对应的跟进状态
            getFollowStatus() {
                return util.ajax({
                    url: '/crm/conversionRelation/getList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        customerId: this.customerId
                    }
                });
            },
            // 若取消修改状态操作  就还原switch按钮
            resetStatus() {
                this.confirmModal = false;
            },
            changeStatus() {
                const { id, name } = this.currentRow;
                this.loading_changeStatus = true;
                const params = {
                    orgId: this.enterpriseId,
                    id,
                    customerId: this.customerId
                    // status:  DISABLED/ENABLED
                };
                if (this.currentRow.status === 'ENABLED') {
                    params.status = 'DISABLED';
                } else {
                    params.status = 'ENABLED';
                }
                util.ajaxInternational({
                    url: '/oversea/adsConversion/modifyConversion',
                    method: 'post',
                    data: params
                }).then(res => {
                    if (res.data.code === '1') {
                        // 产品要求, 新增变更状态成功提示, 同时给出的提示语里只有"启用成功", 之后如果 api 放开限制, 允许停用, 提示语还要调整
                        this.$Message.success(this.$t('googleAdsBinding.conversionOperation.success_changeStatus').replace('$conversionName', name));
                        this.getList();
                        this.$store.commit('get_associated_followUpStatus_list', this.enterpriseId);
                    } else {
                        this.$Message.error(this.$t('googleAdsBinding.conversionOperation.error_changeStatus'));
                    }
                    this.confirmModal = false;
                    this.loading_changeStatus = false;
                }).catch(error => {
                    this.loading_changeStatus = false;
                });
            },
            deleteFollowup(conversionId) {
                util.ajax({
                    url: '/crm/conversionRelation/delete',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        updateUser: this.userId,
                        conversionId,
                        customerId: this.customerId,
                        followupId: 0
                    }
                }).then(res => {
                    if (res.data.code == 1) {
                        this.getList();
                        this.$store.commit('get_associated_followUpStatus_list', this.enterpriseId);
                    }
                });
            },
            // 显示模态框
            edit_columns() {
                this.visible_edit_columns = true;
            },
            /* watch group , 当 group 发生变化时调用此方法来刷新表格视图 */
            changeGroups(selCol) {
                this.refreshColumn = false;
                const orderObj = Object.assign({}, ...selCol.map((item, index) => {
                    const temp = {};
                    temp[item] = index;
                    return temp;
                }));
                this.tableColumns = this.allColumns.filter(col => selCol.includes(col.key)).sort((a, b) => {
                    return orderObj[a.key] - orderObj[b.key];
                });
                this.$nextTick(() => {
                    this.refreshColumn = true;
                });
            },
            // 请求表头字段顺序
            getFieldOrderList() {
                /* 配置表格显示项 */
                util.ajaxJson({
                    url: '/crm/commonField/getFieldOrderList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        type: this.columnType
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        if (response.data.data) {
                            // 解构数据
                            const { id, showField, fieldStyle } = response.data.data;
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
                            this.id_column_show_order = undefined;
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Table.getTableColumnOrder'));
                        this.group = this.allGroup.slice();
                        this.id_column_show_order = undefined;
                    }
                });
            },

            // 切换转化操作已启用未启用状态
            handleToggleStatus(rowData) {
                // Google API 升级后, 只允许启用, 停用必须在 Google 平台操作
                if (rowData.status === 'ENABLED') {
                    this.$Message.error(this.$t('googleAdsBinding.conversionOperation.disabled_toggleStatus'));
                } else {
                    this.confirmModal = true;
                }
            }
        }
    };
</script>

<style lang="less">
    .conversion-operation {
        .tips {
            font-size: 12px;
        }

        .date-picker {
            margin: 10px 0 20px;
        }

        .float-right {
            float: right;
        }

        .pointer {
            cursor: pointer;
        }

        .ellipsis {
            cursor: pointer;

            .ivu-table-cell {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

        }

        .ivu-table-cell {
            padding-left: 12px;
            padding-right: 24px;

            span {
                /*overflow: visible;*/
            }
        }

    }
</style>
