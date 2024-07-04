<template>
    <div class="crm-table-page">
        <div style="min-width: 700px;padding: 20px 30px 0;">
            <!-- 操作栏 -->
            <div class="table-top-container">
                <!-- 改版顶部筛选 -->
                <TopFilter
                        :title.sync="title_topFilter"
                        type="myContact"
                        :flag_topFilter="flag_topFilter"
                        :type_topFilter="type_topFilter"
                        :allUsers="allUsers"
                        :allColumns="allColumns"
                        :selectOptions="selectOptions"
                        :columnType="columnType"
                        :filtering.sync="filtering"
                        :custom_conditions.sync="addCondition"
                        :common_conditions.sync="common_conditions"
                        :conditionList1="conditionList1"
                        :conditionList2="conditionList2"
                        :getSearchCon="getSearchCon"
                        :addChangeCon1="addChangeCon1"
                        :addChangeCon2="addChangeCon2"
                        sql_manager="inquiryManagers"
                        ref="topFilter"
                        @refreshData="refreshData_filter">
                </TopFilter>
                &nbsp;&nbsp;&nbsp;
                <!-- 筛选标签 -->
                <FilterTags
                        :order_column="order_column"
                        :order_type="order_type"
                        :storageName_orderColumn="storageName_orderColumn"
                        :filterConObj.sync="config_tableFilter"
                        :langObj="lang_contact"
                        :width="600"
                        ref="filterTags"
                        @change_filter_tag="change_filter_tag"
                        @emptySort="empty_sort"
                        @removeCon="remove_filter_tag"></FilterTags>

                <!-- 新版按钮 -->
                <div class="table-operate-btns _btns_text_ml">
                    <!-- 文件导出 -->
                    <Button v-if="authorized_button['exportData']" type="text" icon="custom custom-file-download"
                            class="piwik_download_table_contact contact-filedownload"
                            @click="exportData">{{ $t('crm.Table.exportData') }}
                    </Button>
                    <HelpTip :title="$t('helpTip.exportData')"></HelpTip>
                </div>
            </div>
            <div v-loading="loading" class="_min_height_100" :style="{minHeight:table_height-100+'px'}">
            <!-- 表格 -->
            <div class="table"  v-show="initTable">
                <Table v-if="flag_refreshColumn"
                       size="medium"
                       :data="tableData"
                       v-loading="loading"
                       :height="table_height"
                       :isCustom="true"
                       :customEmptyText="customEmptyTextLang"
                       :customEmptyButtonText="customEmptyButtonTextLang"
                       :customClearMethod="clearFilterConditionByInitView"
                       :border="true"
                       :header-cell-class-name="headerCellClass"
                       highlight-current-row
                       ref="table"
                       @scroll.native.capture="close_popper"
                       @row-click="clickRow"
                       @contextmenu.native.prevent="$copyTableCellValue"
                       @mousemove.native="handleTableColHover"
                       @mousedown.native="handleTableColResizeStart"
                       @header-dragend="handleTableColResizeEnd"
                       class="tabmain noBoxShadow-right noborder-table resizable-table">
                    <!-- 正常列 -->
                    <TableColumn v-for="item in currentColumns"
                                 :key="item.key"
                                 :prop="item.key"
                                 :label="item.title"
                                 :align="item.align"
                                 :width="item.width"
                                 :min-width="item.width || 64"
                                 :formatter="item.formatter"
                                 :render-header="item.renderHeader"
                                 :show-overflow-tooltip="true"></TableColumn>
                    <!-- 末列字段配置按钮 -->
                    <TableColumn fixed="right"
                                 width="35"
                                 align="center"
                                 :resizable="false"
                                 :render-header="renderHeader_editColumn"
                                 class-name="no-padding-cell"></TableColumn>
                </Table>
                <div style="margin-right: 30px;overflow: hidden">
                    <Page :page-size="pageSize"
                          :page-sizes="pageSizeOpts"
                          :total="totalNum"
                          :current-page="curPage"
                          class="pageWrap-right"
                          layout="total, prev, pager, next, sizes, jumper"
                          @current-change="changePage"
                          @size-change="pageSizeChange"></Page>
                </div>
            </div>

            </div>

        </div>

        <!-- 修改字段 -->
        <EditColumns
                :visible.sync="visible_edit_columns"
                :columnType="columnType"
                :id.sync="id_column_show_order"
                :allColumns="allColumns"
                :allGroup="allGroup"
                :group.sync="group"></EditColumns>

        <!-- 详情页 -->
        <CRMDrawerList
                :visible.sync="show_contact_detail"
                :id.sync="contactId"
                type="contact"
                originalType="contact"
                :corp_columns_authorized="corp_columns_authorized"
                :contact_columns_authorized="contact_columns_authorized"
                :inquiry_columns_authorized="inquiry_columns_authorized"
                :selectOptions="selectOptions"
                @refreshData="refreshData"
                @refreshCheck="refreshCheck">
        </CRMDrawerList>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { mapState, mapGetters } from 'vuex';
    import TopFilter from '@/views/crm/Table/Components/Html/topFilter';
    import EditColumns from '@/views/crm/Table/Components/Modal/editColumns';
    import CRMDrawerList from '@/views/crm/Detail/CRMDrawerList';
    import FilterTags from '@/views/main-components/filter-tags';
    import resetInitComponents from '@/mixins/resetComponentViewData';
    import tableColResize from '@/mixins/tableColResize';
    const addChangeCon1 = function(index) {
        this.addCondition[index].condition2 = '';
        this.addCondition[index].condition3 = '';
        switch (this.addCondition[index].condition1) {
            // 字符串型
            case 'seqNumber':
            case 'companyName':
            case 'nickName':
            case 'email':
            case 'jobTitle':
            case 'jobGrade':
            case 'phone':
            case 'whatsApp':
            case 'instagram':
            case 'remark':
                this.addCondition[index].conditionList2 = [
                    {
                        value: '$eq',
                        label: this.$t('crm.Table.con_equal')
                    },
                    {
                        value: '$ne',
                        label: this.$t('crm.Table.con_unequal')
                    },
                    {
                        value: '$regex',
                        label: this.$t('crm.Table.con_include')
                    },
                    {
                        value: '$nregex',
                        label: this.$t('crm.Table.con_exclude')
                    }
                ];
                this.addCondition[index].condition2 = '$regex';
                this.addCondition[index].inputType = 'string';
                break;
            case 'socialNetworkingPlatform':
                this.addCondition[index].conditionList2 = [
                    {
                        value: '$regex',
                        label: this.$t('crm.Table.con_include')
                    },
                    {
                        value: '$nregex',
                        label: this.$t('crm.Table.con_exclude')
                    }
                ];
                this.addCondition[index].condition2 = '$regex';
                this.addCondition[index].inputType = 'string';
                break;
            // 单选型
            case 'createUser':
                this.addCondition[index].conditionList2 = [
                    {
                        value: '$eq',
                        label: this.$t('crm.Table.con_equal')
                    },
                    {
                        value: '$ne',
                        label: this.$t('crm.Table.con_unequal')
                    }
                ];
                this.addCondition[index].condition2 = '$eq';
                this.addCondition[index].inputType = 'select';
                this.addCondition[index].condition3 = '';
                this.addCondition[index].conditionList3 = [].concat(
                    [{ label: '询盘云', value: -2 }],
                    this.allUsers.map(item => {
                        const { fullname: label, id: value } = item;
                        return { label, value };
                    })
                );
                break;
            // Boolean
            case 'gender':
                this.addCondition[index].conditionList2 = [
                    {
                        value: '$eq',
                        label: this.$t('crm.Table.con_equal')
                    }
                ];
                this.addCondition[index].condition2 = '$eq';
                this.addCondition[index].inputType = 'boolean';
                this.addCondition[index].condition3 = 1;
                this.addCondition[index].condition2 = '$eq';
                break;
            // 时间类
            case 'birthday':
            case 'createTime':
            case 'updateTime':
                this.addCondition[index].conditionList2 = [
                    {
                        value: 'dateRange',
                        label: this.$t('crm.Table.con_periodOfTime')
                    },
                    {
                        value: '$lt',
                        label: this.$t('crm.Table.con_lessThan')
                    },
                    {
                        value: '$gt',
                        label: this.$t('crm.Table.con_greaterThan')
                    }
                ];
                this.addCondition[index].condition2 = 'dateRange';
                this.addCondition[index].inputType = 'dateRange';
                this.$nextTick(() => {
                    const end = new Date();
                    const start = new Date();
                    end.setTime(end.getTime() - 3600 * 1000 * 24);
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                    this.addCondition[index].condition3 = [start, end];
                });
                break;
            // 负责人, 数组
            case 'inquiryManagers':
                this.addCondition[index].conditionList2 = [
                    {
                        value: '$eq',
                        label: this.$t('crm.Table.con_equal')
                    }
                ];
                this.addCondition[index].condition2 = '$eq';
                this.addCondition[index].inputType = 'array';
                this.addCondition[index].condition3 = [];
                this.addCondition[index].conditionList3 = this.allUsers.map(item => {
                    const { fullname: label, id: value } = item;
                    return { label, value };
                });
                break;
            // 自定义字段
            default:
                const temp = this.allColumns.find(item => item.key === this.addCondition[index].condition1);
                if (temp) {
                    switch (temp.colType) {
                        case 'date':
                        case 'date+time':
                            this.addCondition[index].conditionList2 = [
                                {
                                    value: 'dateRange',
                                    label: this.$t('crm.Table.con_periodOfTime')
                                },
                                {
                                    value: '$lt',
                                    label: this.$t('crm.Table.con_lessThan')
                                },
                                {
                                    value: '$gt',
                                    label: this.$t('crm.Table.con_greaterThan')
                                }
                            ];
                            this.addCondition[index].condition2 = 'dateRange';
                            this.addCondition[index].inputType = 'dateRange';
                            this.$nextTick(() => {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                                this.addCondition[index].condition3 = [start, end];
                            });
                            break;
                        case 'selectMultiple':
                            this.addCondition[index].conditionList2 = [
                                {
                                    value: '$regex',
                                    label: this.$t('crm.Table.con_include')
                                },
                                {
                                    value: '$nregex',
                                    label: this.$t('crm.Table.con_exclude')
                                }
                            ];
                            this.addCondition[index].condition2 = '$regex';
                            this.addCondition[index].inputType = 'array';
                            this.addCondition[index].condition3 = [];
                            this.addCondition[index].conditionList3 = temp.option.split('?').map(item => {
                                return { value: item, label: item };
                            });
                            break;
                        case 'select':
                            this.addCondition[index].conditionList2 = [
                                {
                                    value: '$eq',
                                    label: this.$t('crm.Table.con_equal')
                                },
                                {
                                    value: '$ne',
                                    label: this.$t('crm.Table.con_unequal')
                                }
                            ];
                            this.addCondition[index].condition2 = '$eq';
                            this.addCondition[index].inputType = 'select';
                            this.addCondition[index].condition3 = '';
                            this.addCondition[index].conditionList3 = temp.option.split('?').map(item => {
                                return { value: item, label: item };
                            });
                            break;
                        case 'text':
                        case 'textarea':
                            this.addCondition[index].conditionList2 = [
                                {
                                    value: '$eq',
                                    label: this.$t('crm.Table.con_equal')
                                },
                                {
                                    value: '$ne',
                                    label: this.$t('crm.Table.con_unequal')
                                },
                                {
                                    value: '$regex',
                                    label: this.$t('crm.Table.con_include')
                                },
                                {
                                    value: '$nregex',
                                    label: this.$t('crm.Table.con_exclude')
                                }
                            ];
                            this.addCondition[index].condition2 = '$regex';
                            this.addCondition[index].inputType = 'string';
                            break;
                        default:
                            this.addCondition[index].conditionList2 = [
                                {
                                    value: '$eq',
                                    label: this.$t('crm.Table.con_equal')
                                },
                                {
                                    value: '$ne',
                                    label: this.$t('crm.Table.con_unequal')
                                },
                                {
                                    value: '$regex',
                                    label: this.$t('crm.Table.con_include')
                                },
                                {
                                    value: '$nregex',
                                    label: this.$t('crm.Table.con_exclude')
                                }
                            ];
                            this.addCondition[index].inputType = 'string';
                    }
                } else {
                    this.addCondition[index].conditionList2 = [
                        {
                            value: '$eq',
                            label: this.$t('crm.Table.con_equal')
                        },
                        {
                            value: '$ne',
                            label: this.$t('crm.Table.con_unequal')
                        },
                        {
                            value: '$regex',
                            label: this.$t('crm.Table.con_include')
                        },
                        {
                            value: '$nregex',
                            label: this.$t('crm.Table.con_exclude')
                        }
                    ];
                    this.addCondition[index].inputType = 'string';
                }
        }
    };
    const addChangeCon2 = function(index) {
        switch (this.addCondition[index].condition1) {
            // 字符串型
            case 'seqNumber':
            case 'companyName':
            case 'nickName':
            case 'email':
            case 'jobTitle':
            case 'jobGrade':
            case 'phone':
            case 'whatsApp':
            case 'instagram':
            case 'remark':
            case 'socialNetworkingPlatform':
                this.addCondition[index].condition3 = '';
                break;
            // 单选型
            case 'createUser':
                this.addCondition[index].condition3 = '';
                break;
            // Boolean
            case 'gender':
                this.addCondition[index].condition3 = 1;
                break;
            // 时间类
            case 'birthday':
            case 'createTime':
            case 'updateTime':
                this.addCondition[index].inputType = 'date';
                this.addCondition[index].condition3 = '';
                if (this.addCondition[index].condition2 === 'dateRange' || this.addCondition[index].condition2 === this.$t('crm.Table.con_periodOfTime')) {
                    this.addCondition[index].inputType = 'dateRange';
                    this.addCondition[index].condition3 = [];
                }
                break;
            // 负责人, 数组
            case 'inquiryManagers':
                this.addCondition[index].condition3 = [];
                break;
            // 自定义字段
            default:
                const temp = this.allColumns.find(item => item.key === this.addCondition[index].condition1);
                if (temp) {
                    switch (temp.colType) {
                        case 'date':
                        case 'date+time':
                            this.addCondition[index].inputType = 'date';
                            this.addCondition[index].condition3 = '';
                            if (this.addCondition[index].condition2 === 'dateRange') {
                                this.addCondition[index].inputType = 'dateRange';
                                this.addCondition[index].condition3 = [];
                            }
                            break;
                        case 'selectMultiple':
                            this.addCondition[index].condition3 = [];
                            break;
                        case 'select':
                        case 'text':
                        case 'textarea':
                        default:
                            this.addCondition[index].condition3 = '';
                    }
                } else {
                    this.addCondition[index].condition3 = '';
                }
        }
    };

    export default {
        mixins: [resetInitComponents, tableColResize],
        name: 'myContact',
        components: {
            TopFilter,
            EditColumns,
            CRMDrawerList,
            FilterTags
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height',
                button_list: state => state.app.button_list
            }), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu'
            ]),
            table_height() {
                let temp = this.window_height ? this.window_height - 176 : document.body.clientHeight - 176;
                if (temp < 200) {
                    temp = 200;
                }
                // 转 element-ui 时, 表格样式错误, 加上这句后解决, 具体错误原因暂时未看
                temp += this.loading ? 1 : 0;
                return temp;
            },
            allGroup() {
                return this.allColumns.map(item => item.key);
            },
            authorized_button() {
                const ids = BUTTON_IDS.CRM.contact;
                return {
                    exportData: !HANDLE_BUTTON(ids.dataExport.documentDownload, this.button_list)
                };
            },

            // 转换筛选条件数组
            computed_addCondition() {
                return this.addCondition.filter(item => item.condition1 && item.condition2 && ((item.condition3 && item.condition3.length) || item.condition3 instanceof Date || (typeof item.condition3 === 'number' && !isNaN(item.condition3)))).map(item => {
                    const temp = {};
                    const con = this.getSearchCon(item.condition1);
                    // let type = this.getSearchType(item.condition2);
                    const type = item.condition2;
                    switch (item.inputType) {
                        case 'string':
                        case 'boolean':
                        case 'select':
                            temp[con] = {};
                            temp[con][type] = item.condition3;
                            return temp;
                        case 'date':
                            temp[con] = {};
                            temp[con][type] = this.$options.filters.timeFormat(item.condition3);
                            if (type === '$gt') {
                                temp[con][type] = `${temp[con][type]} 23:59:59.999`;
                            }
                            return temp;
                        case 'dateRange':
                            if (item.condition3[0] && item.condition3[1]) {
                                temp.$and = [];

                                const start = {};
                                start[con] = {};
                                start[con].$gte = this.$options.filters.timeFormat(item.condition3[0]);
                                temp.$and.push(start);

                                const end = {};
                                end[con] = {};
                                end[con].$lte = `${this.$options.filters.timeFormat(item.condition3[1])} 23:59:59.999`;
                                temp.$and.push(end);

                                return temp;
                            }
                            break;
                        case 'array':
                            switch (con) {
                                case 'inquiryManagers':
                                    temp[con] = {};
                                    temp[con].$regex = item.condition3;
                                    break;
                                default:
                                    temp.$or = item.condition3.map(val => {
                                        const temp = {};
                                        temp[con] = {};
                                        temp[con][type] = val;
                                        return temp;
                                    });
                            }
                            return temp;
                    }
                }).filter(item => !(!item || item === ''));
            },
            computed_sqlList_tableFilter() {
                return Object.entries(this.sqlList_tableFilter).map(([key, val]) => {
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
            }
        },
        data() {
            return {
                /* 全局 */
                cancelFunc: null,

                /* 多语言 */
                lang_contact: {
                    nickName: this.$t('crm.Modal.contact_nickName'),
                    jobTitle: this.$t('crm.Modal.contact_jobTitle'),
                    email: this.$t('crm.Modal.contact_email'),
                    phone: this.$t('crm.Modal.contact_phone'),
                    whatsApp: 'WhatsApp',
                    instagram: 'Instagram',
                    jobGrade: this.$t('crm.Modal.contact_jobGrade'),
                    socialNetworkingPlatform: this.$t('crm.Modal.contact_socialNetworkingPlatform'),
                    birthday: this.$t('crm.Modal.contact_birthday'),
                    gender: this.$t('crm.Modal.contact_gender'),
                    picture: this.$t('crm.Modal.contact_picture'),
                    remark: this.$t('crm.Modal.contact_remark'),

                    // 自定义字段 - 无

                    // 其他字段
                    seqNumber: this.$t('crm.Table.col_seqNumber'),
                    companyName: this.$t('crm.Table.col_companyName'),

                    inquiryManagers: this.$t('crm.Table.col_inquiryManagers'),
                    createUser: this.$t('crm.WorkBench.col_followUpCreateUser'),
                    createTime: this.$t('crm.Table.col_createTime'),
                    updateTime: this.$t('crm.Table.col_updateTime')
                },
                lang_inquiry: {
                    productCategory: this.$t('crm.Modal.inq_productCategory'),
                    demandProducts: this.$t('crm.Modal.inq_demandProducts'),
                    inquiryScore: this.$t('crm.Modal.inq_inquiryScore'),
                    label: this.$t('crm.Modal.inq_label'),
                    sourceChannel: this.$t('crm.Modal.inq_sourceChannel'),
                    sourceWay: this.$t('crm.Modal.inq_sourceWay'),
                    grouping: this.$t('crm.Modal.inq_grouping'),
                    followUp: this.$t('crm.Modal.inq_followUp'),
                    remark: this.$t('crm.Modal.inq_remark')
                },
                lang_company: {
                    companyName: this.$t('crm.Modal.corp_companyName'),
                    starLevel: this.$t('crm.Modal.corp_starLevel'),
                    shortName: this.$t('crm.Modal.corp_shortName'),
                    countryArea: this.$t('crm.Modal.corp_countryArea'),
                    mainProduct: this.$t('crm.Modal.corp_mainProduct'),
                    scale: this.$t('crm.Modal.corp_scale'),
                    clientType: this.$t('crm.Modal.corp_clientType'),
                    homePage: this.$t('crm.Modal.corp_homePage'),
                    phone: this.$t('crm.Modal.corp_phone'),
                    fax: this.$t('crm.Modal.corp_fax'),
                    contactAddress: this.$t('crm.Modal.corp_contactAddress'),
                    relatedCompany: this.$t('crm.Modal.corp_relatedCompany'),
                    companyPicture: this.$t('crm.Modal.corp_companyPicture'),
                    companyRemark: this.$t('crm.Modal.corp_companyRemark')
                },

                /* 表格 */
                loading: true, // 加载图标
                initTable: false,
                flag_refreshColumn: true, // 使用 v-if 刷新列表列顺序
                currentColumns: [], // 表格列名称
                allColumns: [], // 表格全部列
                tableData: [],
                totalNum: 0,
                curPage: 1,
                pageSize: null,
                maxPageNum: 1,
                pageSizeOpts: [20, 50, 100],
                close_popper: this.$debounce(() => {
                    // document.body.click();

                    // 关闭表头筛选框浮层
                    if (this.allColumns.some(item => item.show_filter_content)) {
                        this.allColumns = this.allColumns.map(item => {
                            item.show_filter_content = false;
                            return item;
                        });
                    }
                    // 关闭顶部 topFilter 浮层
                    if (this.$refs.topFilter) {
                        this.$refs.topFilter.doClose();
                    }
                    // 关闭表头筛选标签浮层
                    if (this.$refs.filterTags) {
                        this.$refs.filterTags.doClose();
                    }
                }, 100, true),

                /* 日期选择 */
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
                },
                // startDate: (new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).format('yyyy-MM-dd'),
                // endDate: (new Date()).format('yyyy-MM-dd'),

                /* 筛选 */
                title_topFilter: this.$t('crm.Table.allContact'),
                flag_topFilter: false,
                type_topFilter: '',
                addChangeCon1: addChangeCon1,
                addChangeCon2: addChangeCon2,
                order_column: '',
                order_type: '',
                storageName_orderColumn: '',
                conditionList1: [],
                conditionList2: [
                    {
                        value: '$eq',
                        label: this.$t('crm.Table.con_equal')
                    },
                    {
                        value: '$ne',
                        label: this.$t('crm.Table.con_unequal')
                    },
                    {
                        value: '$regex',
                        label: this.$t('crm.Table.con_include')
                    },
                    {
                        value: '$nregex',
                        label: this.$t('crm.Table.con_exclude')
                    }
                ],
                addCondition: [],
                common_conditions: [],
                filtering: false,
                id_selected_commonSearch: -1,
                selected_filter_tab: 'search', // 检索 or 常用检索 // 检索
                custom_search_name: '',
                list_commonSearch: [],
                queryData: {
                    $and: []
                },
                subUserIds: '',

                /* 新版表头筛选 */
                // 筛选配置
                config_tableFilter: {
                    // 固定字段
                    nickName: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    email: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    jobGrade: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    jobTitle: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    phone: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    whatsApp: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    instagram: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    socialNetworkingPlatform: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    birthday: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型
                        query: [], // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    gender: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        query: [], // 筛选值
                        allList: [
                            {
                                value: 1,
                                label: this.$t('crm.Modal.male')
                            },
                            {
                                value: 2,
                                label: this.$t('crm.Modal.female')
                            }
                        ] // 所有可能的筛选条件
                    },
                    remark: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    // 自定义字段 - 获取授权字段时赋值
                    // 其他字段
                    seqNumber: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    companyName: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },

                    inquiryManagers: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'users', // 筛选类型
                        query: [], // 筛选值
                        allList: [] // 所有可能的筛选条件
                    },
                    createUser: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        query: [], // 筛选值
                        allList: [] // 所有可能的筛选条件
                    },
                    createTime: {
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
                    },
                    updateTime: {
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
                // 表头筛选条件
                sqlList_tableFilter: {},

                /* 修改字段 */
                visible_edit_columns: false,
                columnType: 2,
                id_column_show_order: undefined,
                group: [],
                // 保存到后端的字段属性, 目前只有 width
                fieldStyle: {},

                /* 编辑联系人 */
                selectOptions: {},
                allUsers: [],

                /* 对接权限系统 */
                contact_columns_authorized: {}, // 联系人所有字段
                corp_columns_authorized: {}, // 公司所有字段
                inquiry_columns_authorized: {}, // 询盘所有字段

                /* 联系人详情 */
                show_contact_detail: false,
                rowIndex: -1,
                contactId: 0,
                drawer_list: []
            };
        },
        created() {
            this.getPageSize();
        },
        mounted() {
            // 获取筛选项
            this.getSelectOptions(); // 获取大部分下拉选项
            this.getAllUsers(); // 获取销售人员列表以供筛选

            // 获取授权字段
            this.get_corp_columns_authorized();
            this.get_inquiry_columns_authorized();

            util.ajax({
                url: '/crm/columnConfig/getFields',
                method: 'get',
                params: {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    parentId: 2
                }
            }).then(resCol => {
                this.loading = true;
                if (resCol.data.code === '1') {
                    this.contact_columns_authorized = resCol.data.data ? resCol.data.data : {};
                    this.allColumns = [];
                    this.conditionList1 = [];
                    this.addCondition = [];

                    // 要在表格中显示的其它字段
                    const column_before = [
                        {
                            title: this.$t('crm.Table.col_seqNumber'),
                            key: 'seqNumber',
                            width: 160
                        },
                        {
                            title: this.$t('crm.Table.col_companyName'),
                            key: 'companyName',
                            width: 270
                        }
                    ];
                    const column_after = [
                        {
                            title: this.$t('crm.Table.col_inquiryManagers'),
                            key: 'inquiryManagers',
                            width: 180
                        },
                        {
                            title: this.$t('crm.WorkBench.col_followUpCreateUser'),
                            key: 'createUser',
                            width: 110
                        },
                        {
                            title: this.$t('crm.Table.col_createTime'),
                            key: 'createTime',
                            width: 150
                        },
                        {
                            title: this.$t('crm.Table.col_updateTime'),
                            key: 'updateTime',
                            width: 150
                        }
                    ];

                    /* 存放顺序数组 */
                    // 存放 colOrder 正常的字段名
                    let arr_haveNoColOrder = [];
                    // 存放 colOrder 正常的字段名
                    let arr_sort = [];
                    // 存放 colOrder 1000 或重复的 colOrder
                    const arr_renew = [];

                    /* 处理默认字段 */
                    if (Array.isArray(this.contact_columns_authorized.default)) {
                        // 如果没有邮箱, 把邮箱加进来
                        if (this.contact_columns_authorized.default.every(item => item.storageName !== 'email')) {
                            this.contact_columns_authorized.default.unshift({
                                cname: this.$t('crm.Table.col_email'),
                                colType: 'email',
                                mustInput: 1,
                                storageName: 'email',
                                manually: true // 此属性表示: 本来没有权限, 是前端手动加上的
                            });
                        }
                        // 字段显示为多语言
                        this.contact_columns_authorized.default.forEach(item => {
                            if (this.lang_contact.hasOwnProperty(item.storageName)) {
                                item.cname = this.lang_contact[item.storageName];
                            }
                        });
                        // 分析处理授权字段
                        const contact_default_keys = this.contact_columns_authorized.default.map(item => item.storageName);
                        this.allColumns = [
                            {
                                title: this.$t('crm.Table.col_nickName'),
                                key: 'nickName',
                                width: 180
                            },
                            {
                                title: this.$t('crm.Table.col_email'),
                                key: 'email',
                                width: 180
                            },
                            {
                                title: this.$t('crm.Table.col_jobGrade'),
                                key: 'jobGrade',
                                width: 180
                            },
                            {
                                title: this.$t('crm.Table.col_jobTitle'),
                                key: 'jobTitle',
                                width: 180
                            },
                            {
                                title: this.$t('crm.Table.col_phone'),
                                key: 'phone',
                                width: 180,
                                formatter: row => {
                                    return Array.isArray(row.phone) ? row.phone.join(', ') : undefined;
                                }
                            },
                            {
                                title: 'WhatsApp',
                                key: 'whatsApp',
                                width: 180
                            },
                            {
                                title: 'Instagram',
                                key: 'instagram',
                                width: 180
                            },
                            {
                                title: this.$t('crm.Table.col_socialNetworkingPlatform'),
                                key: 'socialNetworkingPlatform',
                                width: 180,
                                formatter: row => {
                                    return Array.isArray(row.socialNetworkingPlatform) && row.socialNetworkingPlatform.filter(item => item.attrValue).length ? row.socialNetworkingPlatform.map(item => {
                                        return `${item.attrName}: ${item.attrValue}`;
                                    }).join(', ') : undefined;
                                }
                            },
                            {
                                title: this.$t('crm.Table.col_birthday'),
                                key: 'birthday',
                                width: 180
                            },
                            {
                                title: this.$t('crm.Table.col_gender'),
                                key: 'gender',
                                width: 180,
                                formatter: row => {
                                    let gender = '';
                                    switch (`${row.gender}`) {
                                        case '1':
                                            gender = this.$t('crm.Modal.male');
                                            break;
                                        case '2':
                                            gender = this.$t('crm.Modal.female');
                                            break;
                                    }
                                    return gender;
                                }
                            },
                            {
                                title: this.$t('crm.Table.col_contactRemark'),
                                key: 'remark',
                                width: 180
                            }
                        ].filter(item => contact_default_keys.includes(item.key));
                        // 为已授权字段添加顺序属性和"默认字段"标识
                        this.allColumns.forEach(col => {
                            const temp = this.contact_columns_authorized.default.find(item => item.storageName === col.key);
                            if (temp) {
                                if (temp.colOrder) {
                                    if (arr_sort[temp.colOrder]) {
                                        arr_renew.push(temp.storageName);
                                    } else {
                                        arr_sort[temp.colOrder] = temp.storageName;
                                    }
                                } else {
                                    arr_haveNoColOrder.push(temp.storageName);
                                }

                                col.fieldType = 'default';
                            }
                        });
                        // 删除 config_tableFilter 中未授权的默认字段, 不删除 column_before 和 column_after 里的
                        Object.keys(this.config_tableFilter).forEach(item => {
                            if (!contact_default_keys.includes(item) && ![column_before, column_after].some(colArr => colArr.find(col => col.key === item))) {
                                this.$delete(this.config_tableFilter, item);
                            }
                        });
                    }

                    /* 延续字段设置的逻辑, 一旦发现有默认字段 colOrder 为空, 则默认字段不参与排序, 全部顺序展示 */
                    if (arr_haveNoColOrder.length) {
                        arr_sort = [];
                        arr_haveNoColOrder = this.allColumns.map(item => item.key);
                    }

                    /* 处理自定义字段 + 添加自定义类型的 config_tableFilter */
                    if (Array.isArray(this.contact_columns_authorized.custom)) {
                        this.contact_columns_authorized.custom.forEach(item => {
                            if (`${item.colOrder}` === '1000' || !item.colOrder) {
                                arr_renew.push(item.storageName);
                            } else {
                                if (arr_sort[item.colOrder]) {
                                    arr_renew.push(item.storageName);
                                } else {
                                    arr_sort[item.colOrder] = item.storageName;
                                }
                            }

                            switch (item.colType) {
                                case 'text':
                                    this.allColumns.push(Object.assign({}, item, {
                                        title: item.cname,
                                        key: item.storageName,
                                        width: 130,
                                        fieldType: 'custom'
                                    }));

                                    this.$set(this.config_tableFilter, item.storageName, {
                                        sort: true, // 是否允许排序
                                        filter: true, // 是否允许筛选
                                        filterType: 'string', // 筛选类型
                                        query: '', // 筛选值
                                        allList: null // 所有可能的筛选条件
                                    });
                                    this.$set(this.lang_contact, item.storageName, item.cname);
                                    break;
                                case 'textarea':
                                    this.allColumns.push(Object.assign({}, item, {
                                        title: item.cname,
                                        key: item.storageName,
                                        width: 200,
                                        fieldType: 'custom'
                                    }));

                                    this.$set(this.config_tableFilter, item.storageName, {
                                        sort: true, // 是否允许排序
                                        filter: true, // 是否允许筛选
                                        filterType: 'string', // 筛选类型
                                        query: '', // 筛选值
                                        allList: null // 所有可能的筛选条件
                                    });
                                    this.$set(this.lang_contact, item.storageName, item.cname);
                                    break;
                                case 'date':
                                    this.allColumns.push(Object.assign({}, item, {
                                        title: item.cname,
                                        key: item.storageName,
                                        width: 130,
                                        fieldType: 'custom'
                                    }));

                                    this.$set(this.config_tableFilter, item.storageName, {
                                        sort: true, // 是否允许排序
                                        filter: true, // 是否允许筛选
                                        filterType: 'date', // 筛选类型
                                        query: [], // 筛选值
                                        allList: null // 所有可能的筛选条件
                                    });
                                    this.$set(this.lang_contact, item.storageName, item.cname);
                                    break;
                                case 'date+time':
                                    this.allColumns.push(Object.assign({}, item, {
                                        title: item.cname,
                                        key: item.storageName,
                                        width: 130,
                                        fieldType: 'custom'
                                    }));

                                    this.$set(this.config_tableFilter, item.storageName, {
                                        sort: true, // 是否允许排序
                                        filter: true, // 是否允许筛选
                                        filterType: 'date', // 筛选类型
                                        query: [], // 筛选值
                                        allList: null // 所有可能的筛选条件
                                    });
                                    this.$set(this.lang_contact, item.storageName, item.cname);
                                    break;
                                case 'select':
                                    this.allColumns.push(Object.assign({}, item, {
                                        title: item.cname,
                                        key: item.storageName,
                                        width: 130,
                                        fieldType: 'custom'
                                    }));

                                    this.$set(this.config_tableFilter, item.storageName, {
                                        sort: true, // 是否允许排序
                                        filter: true, // 是否允许筛选
                                        filterType: 'select', // 筛选类型
                                        query: [], // 筛选值
                                        allList: item.option.split('?').map(option => {
                                            return { value: option, label: option };
                                        }) // 所有可能的筛选条件
                                    });
                                    this.$set(this.lang_contact, item.storageName, item.cname);
                                    break;
                                case 'selectMultiple':
                                    this.allColumns.push(Object.assign({}, item, {
                                        title: item.cname,
                                        key: item.storageName,
                                        width: 130,
                                        formatter: row => {
                                            return this.$options.filters.parseArray(row[item.storageName]).join(', ');
                                        },
                                        fieldType: 'custom'
                                    }));

                                    this.$set(this.config_tableFilter, item.storageName, {
                                        sort: false, // 是否允许排序
                                        filter: true, // 是否允许筛选
                                        filterType: 'select', // 筛选类型
                                        query: [], // 筛选值
                                        allList: item.option.split('?').map(option => {
                                            return { value: option, label: option };
                                        }) // 所有可能的筛选条件
                                    });
                                    this.$set(this.lang_contact, item.storageName, item.cname);
                                    break;
                                default:
                                    this.allColumns.push(Object.assign({}, item, {
                                        title: item.cname,
                                        key: item.storageName,
                                        width: 130,
                                        fieldType: 'custom'
                                    }));
                            }
                        });
                    }

                    /* 字段排序 */
                    const allKeys = arr_haveNoColOrder.concat(arr_sort.filter(item => !(!item || item === '')), arr_renew);
                    this.allColumns = this.allColumns.filter(item => allKeys.includes(item.key));

                    /* 拼合其他非字段表格项 */
                    this.allColumns = column_before.concat(this.allColumns, column_after);

                    /* 配置表头筛选 */
                    this.allColumns = this.allColumns.map((col, index) => {
                        const headSet = this.config_tableFilter[col.key];
                        if (headSet && (headSet.sort || headSet.filter)) {
                            col.show_filter_content = false;
                            col.filtering = false;
                            col.renderHeader = this.renderHeader_filter(index);
                        } else {
                            col.renderHeader = this.renderHeader_text(index);
                        }
                        return col;
                    });

                    /* 处理筛选条件 */
                    // 字段型筛选条件
                    let filterCon = this.allColumns.map(item => {
                        switch (item.fieldType) {
                            case 'default':
                                return {
                                    value: item.key,
                                    label: item.title
                                };
                            case 'custom':
                                return {
                                    value: item.key,
                                    label: item.title
                                };
                            default:
                                return undefined;
                        }
                    }).filter(item => !(!item || item === ''));
                    // 非字段型筛选条件, 按默认字段处理
                    const otherCon = [
                        this.$t('crm.Table.col_seqNumber'),
                        this.$t('crm.Table.col_companyName'),
                        this.$t('crm.Table.col_inquiryManagers'),
                        this.$t('crm.WorkBench.col_followUpCreateUser'),
                        this.$t('crm.Table.col_createTime'),
                        this.$t('crm.Table.col_updateTime')
                    ];
                    filterCon = column_before.filter(item => otherCon.includes(item.title)).map(item => {
                        return {
                            value: item.key,
                            label: item.title
                        };
                    }).concat(filterCon);
                    this.conditionList1 = filterCon.concat(column_after.filter(item => otherCon.includes(item.title)).map(item => {
                        return {
                            value: item.key,
                            label: item.title
                        };
                    }));
                    this.addCondition = [
                        {
                            condition1: '',
                            conditionList1: this.$deepClone(this.conditionList1),
                            condition2: '',
                            conditionList2: this.$deepClone(this.conditionList2),
                            condition3: '',
                            conditionList3: [],
                            inputType: 'string'
                        }
                    ];

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
                            }
                        } else {
                            this.$Message.error(this.$t('crm.Table.getTableColumnOrder'));
                            this.group = this.allGroup.slice();
                        }
                    });

                    // 根据跳转时附加参数的不同作出相应刷新操作
                    this.checkRouteParams();
                } else {
                    this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                }
            });
        },
        beforeDestroy() {
            this.contactId = '';
        },
        methods: {
            /* 获取目前所在的邮件箱体以及PageSize */
            getPageSize() {
                util.ajaxJson({
                    url: '/crm/userconfig/get',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        key: 'myContact'
                    }
                }).then(res => {
                    console.log('获取getPage的结果为', res.data);
                    if (res.data.code === '1') {
                        if (res.data.data.value === null) {
                            this.pageSize = 20;
                            this.addPageSize();
                        } else {
                            console.log(res.data.data);
                            const size = parseInt(res.data.data.value);
                            this.pageSize = size;
                            // this.refreshData();
                        }
                    } else {
                        this.pageSize = 20;
                    }
                }).catch((e) => {
                });
            },
            /* 添加PageSize */
            addPageSize() {
                console.log('目前的PageSize为', this.pageSize);
                util.ajaxJson({
                    url: '/crm/userconfig/add',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        key: 'myContact',
                        value: this.pageSize.toString()
                    }
                }).then(res => {
                    console.log('PageSize 保存结果', res.data);
                }).catch((e) => {
                });
            },
            /* 全局 */
            // 设定初始筛选条件
            init_filter(key, title, val, fieldType, colType) {
                // key: storageName , title: 多语言, val: query值, fieldType: 自定义/默认字段类型, colType: select/input/email...输入类型
                // return filtering true/false

                const temp = this.config_tableFilter[key];
                if (temp) {
                    this.$set(this.config_tableFilter[key], 'query', val);

                    const con = this.getSearchCon(key);
                    if (val.length) {
                        const result = {};
                        switch (temp.filterType) {
                            case 'string':
                                this.$set(this.sqlList_tableFilter, con, {
                                    $regex: val
                                });
                                break;
                            case 'select':
                            case 'users':
                                switch (con) {
                                    // 单独发送的字段在最外层, 方便 merge_query_list , 否则用 $or: [筛选条件...]
                                    case 'inquiryManagers':
                                        result.$regex = val.map(item => item.value);
                                        break;
                                    default:
                                        // 表头筛选中只能有单个选项值的(单选型字段 + 创建人这种表格才有的字段)属性, 筛选时使用 $eq 等于, 其他用 $regex 包含
                                        let type = '$regex';
                                        switch (key) {
                                            case 'gender':
                                            case 'createUser':
                                                type = '$eq';
                                                break;
                                            default:
                                                if (fieldType === 'custom' && colType === 'select') {
                                                    type = '$eq';
                                                }
                                        }
                                        result.$or = val.map(item => {
                                            const temp = {};
                                            temp[con] = {};
                                            temp[con][type] = item.value;
                                            return temp;
                                        });
                                }

                                this.$set(this.sqlList_tableFilter, con, result);
                                break;
                            case 'countryArea':
                                this.$set(this.sqlList_tableFilter, con, {
                                    $regex: val[0].replace('unknown', '') // [code, name]
                                });
                                break;
                            case 'date':
                                if (val[0] && val[1]) {
                                    result.$and = [];

                                    const start = {};
                                    start[con] = {};
                                    start[con].$gte = val[0];
                                    result.$and.push(start);

                                    const end = {};
                                    end[con] = {};
                                    end[con].$lte = val[1];
                                    result.$and.push(end);

                                    this.$set(this.sqlList_tableFilter, con, result);
                                } else {
                                    this.config_tableFilter[key].query = [];
                                    this.$delete(this.sqlList_tableFilter, con);
                                }
                                break;
                        }
                        return true;
                    } else {
                        this.$delete(this.sqlList_tableFilter, con);
                        return false;
                    }
                } else {
                    return false;
                }
            },
            // 检查路由传递过来的参数
            checkRouteParams() {
                if (localStorage.getItem('leadsCloud-contactId')) {
                    // 处理从任务带参数跳过来的情况 或 从工作台行为视图点击跳转
                    const tempId = localStorage.getItem('leadsCloud-contactId');
                    localStorage.removeItem('leadsCloud-contactId');

                    this.show_contact_detail = false;
                    this.$nextTick(() => {
                        this.contactId = tempId;
                        this.show_contact_detail = true;
                    });

                    // 请求表格数据
                    // this.refreshData_filter();
                } else {
                    // 进行表格默认筛选
                    const initial_filter_cons = new Map([
                        ['updateTime', [(Date.now() - 3600 * 1000 * 24 * 29), Date.now()].map(item => this.$options.filters.timeFormat(item))] // 近一个月创建
                    ]);
                    this.allColumns = this.allColumns.map(col => {
                        if (this.config_tableFilter.hasOwnProperty(col.key)) {
                            col.filtering = initial_filter_cons.get(col.key) ? this.init_filter(col.key, col.title, initial_filter_cons.get(col.key), col.fieldType, col.colType) : false;
                        }
                        return col;
                    });

                    // 请求表格数据
                    // this.refreshData_filter();
                }
                // 请求表格数据
                // this.refreshData_filter();
                this.type_topFilter = 'searchCommon';
                this.flag_topFilter = !this.flag_topFilter;
            },
            // 获取授权字段
            get_corp_columns_authorized() {
                util.ajax({
                    url: '/crm/columnConfig/getFields',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        parentId: 1
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.corp_columns_authorized = response.data.data;
                        if (this.corp_columns_authorized.default) {
                            if (this.corp_columns_authorized.default.every(item => item.storageName !== 'companyName')) {
                                this.corp_columns_authorized.default.unshift({
                                    cname: this.$t('crm.Modal.corp_companyName'),
                                    colType: 'text',
                                    mustInput: 1,
                                    storageName: 'companyName',
                                    manually: true // 此属性表示: 本来没有权限, 是前端手动加上的
                                });
                            }
                            this.corp_columns_authorized.default.forEach(item => {
                                if (this.lang_company.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_company[item.storageName];
                                }
                            });
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                    }
                });
            },
            get_inquiry_columns_authorized() {
                util.ajax({
                    url: '/crm/columnConfig/getFields',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        parentId: 3
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.inquiry_columns_authorized = response.data.data;
                        if (this.inquiry_columns_authorized.default) {
                            if (this.inquiry_columns_authorized.default.every(item => item.storageName !== 'productCategory')) {
                                this.inquiry_columns_authorized.default.unshift({
                                    cname: this.$t('crm.Modal.inq_productCategory'),
                                    colType: 'selectMultiple',
                                    mustInput: 1,
                                    storageName: 'productCategory',
                                    manually: true // 此属性表示: 本来没有权限, 是前端手动加上的
                                });
                            }
                            this.inquiry_columns_authorized.default.forEach(item => {
                                if (this.lang_inquiry.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_inquiry[item.storageName];
                                }
                            });
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                    }
                });
            },
            // 新建获取属性列表
            getSelectOptions() {
                util.ajax({
                    url: '/crm/attr/getField',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.selectOptions = response.data.data;
                        this.selectOptions.followUp ? this.selectOptions.followUp.unshift({
                            isAvailable: 1,
                            attrId: 0,
                            sort: 0,
                            typeId: 7,
                            attrName: this.$t('crm.UniSet.defaultFollowUpStatus_inquiry')
                        }) : undefined;

                        /* 如果请求下来的所有选项( selectOptions )中有与筛选设置( config_tableFilter )匹配的属性, 且匹配到的筛选设置筛选类型为 'select' , 则导入选项数据到匹配筛选设置 */
                        Object.entries(this.selectOptions).forEach(([key, value]) => {
                            if (this.config_tableFilter.hasOwnProperty(key)) {
                                const temp = this.config_tableFilter[key];
                                if (temp.filterType === 'select') {
                                    temp.allList = value.map(({ attrId, attrName }) => {
                                        return {
                                            value: attrName,
                                            label: attrName
                                        };
                                    });
                                }
                                this.$set(this.config_tableFilter, key, temp);
                            }
                        });
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getSelectOptions'));
                    }
                });
            },
            // 获取询盘负责人列表
            getAllUsers() {
                util.ajax({
                    url: '/cuss-login/getUserInfoList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.allUsers = [];
                        this.allUsers = response.data.data;
                        const allList = this.allUsers.map(item => {
                            const { fullname: label, id: value } = item;
                            return { label, value };
                        });

                        this.$set(this.config_tableFilter.inquiryManagers, 'allList', allList);
                        this.$set(this.config_tableFilter.createUser, 'allList', [{ label: '询盘云', value: -2 }].concat(allList));
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getManagerList'));
                    }
                });
            },
            // 获取检索字段名称对应的数据库字段名
            getSearchCon(str) {
                switch (str) {
                    case 'seqNumber':
                        return 'seq_number';
                    case 'companyName':
                        return 'company_name';
                    case 'nickName':
                        return 'nick_name';
                    case 'email':
                        return 'email';
                    case 'jobTitle':
                        return 'job_title';
                    case 'phone':
                        return 'phone';
                    case 'whatsApp':
                        return 'whats_app';
                    case 'instagram':
                        return 'instagram';
                    case 'jobGrade':
                        return 'job_grade';
                    case 'socialNetworkingPlatform':
                        return 'social_networking_platform';
                    case 'birthday':
                        return 'birthday';
                    case 'gender':
                        return 'gender';
                    case 'remark':
                        return 'remark';
                    case 'inquiryManagers':
                        return 'inquiryManagers';
                    case 'createUser':
                        return 'create_user_id';
                    case 'createTime':
                        return 'create_time';
                    case 'updateTime':
                        return 'update_time';
                    default:
                        return str;
                }
            },
            // 获取检索条件对应的 sql 条件
            getSearchType(str) {
                switch (str) {
                    case this.$t('crm.Table.con_include'):
                        return '$regex';
                    case this.$t('crm.Table.con_exclude'):
                        return '$nregex';
                    case this.$t('crm.Table.con_equal'):
                        return '$eq';
                    case this.$t('crm.Table.con_unequal'):
                        return '$ne';
                    case this.$t('crm.Table.con_greaterThan'):
                        return '$gt';
                    case this.$t('crm.Table.con_greaterOrEqual'):
                        return '$gte';
                    case this.$t('crm.Table.con_lessThan'):
                        return '$lt';
                    case this.$t('crm.Table.con_lessOrEqual'):
                        return '$lte';
                    default:
                        return str;
                }
            },
            // 合并表头筛选和右上角筛选
            merge_query_list() {
                // 右上角筛选框优先级更高, a 为检索/常用检索条件, b 为表头检索条件
                let b = this.computed_sqlList_tableFilter;
                let a = [];
                switch (this.filtering) {
                    case 'search':
                        a = this.computed_addCondition;
                        break;
                    case 'searchCommon':
                        a = this.common_conditions;
                        break;
                }

                // 处理负责人筛选, 优先使用右上角检索条件
                const subUserIds_a = a.filter(item => item.hasOwnProperty('inquiryManagers'));
                const subUserIds_b = b.filter(item => item.hasOwnProperty('inquiryManagers'));
                // 如果都有"负责人"筛选, 只取前者第一项, 否则取后者第一项或空数组
                const con_subUserIds = subUserIds_a[0] || subUserIds_b[0];
                if (con_subUserIds) {
                    this.subUserIds = con_subUserIds.inquiryManagers.$regex.join(',');
                } else {
                    this.subUserIds = '';
                }
                a = a.filter(item => !item.hasOwnProperty('inquiryManagers'));
                b = b.filter(item => !item.hasOwnProperty('inquiryManagers'));

                this.$set(this.queryData, '$and', a.concat(b));
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
                        case 'select':
                        case 'users':
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

                    this.$delete(this.sqlList_tableFilter, this.getSearchCon(col.key));
                }

                this.refreshData_filter();
            },
            // filterTags 组件内部修改筛选值后触发的方法, 由下方的 updateList 改造而成
            change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    const column = this.allColumns.find(item => item.key === key);
                    if (column) {
                        // 判断是否有值, 调整 sqlList
                        const con = column.fieldType === 'custom' ? key : this.getSearchCon(key);
                        if (temp.query.length) {
                            const result = {};
                            switch (temp.filterType) {
                                case 'string':
                                    this.$set(this.sqlList_tableFilter, con, {
                                        $regex: temp.query
                                    });
                                    break;
                                case 'select':
                                case 'users':
                                    switch (con) {
                                        // 单独发送的字段在最外层, 方便 merge_query_list , 否则用 $or: [筛选条件...]
                                        case 'inquiryManagers':
                                            result.$regex = temp.query.map(item => item.value);
                                            break;
                                        default:
                                            // 表头筛选中只能有单个选项值的(单选型字段 + 创建人这种表格才有的字段)属性, 筛选时使用 $eq 等于, 其他用 $regex 包含
                                            let type = '$regex';
                                            switch (key) {
                                                case 'gender':
                                                case 'createUser':
                                                    type = '$eq';
                                                    break;
                                                default:
                                                    if (column.fieldType === 'custom' && column.colType === 'select') {
                                                        type = '$eq';
                                                    }
                                            }
                                            result.$or = temp.query.map(item => {
                                                const temp = {};
                                                temp[con] = {};
                                                temp[con][type] = item.value;
                                                return temp;
                                            });
                                    }

                                    this.$set(this.sqlList_tableFilter, con, result);
                                    break;
                                case 'date':
                                    if (temp.query[0] && temp.query[1]) {
                                        result.$and = [];

                                        const start = {};
                                        start[con] = {};
                                        start[con].$gte = temp.query[0];
                                        result.$and.push(start);

                                        const end = {};
                                        end[con] = {};
                                        end[con].$lte = temp.query[1];
                                        result.$and.push(end);

                                        this.$set(this.sqlList_tableFilter, con, result);
                                    } else {
                                        this.config_tableFilter[key].query = [];
                                        this.$delete(this.sqlList_tableFilter, con);
                                    }
                                    break;
                            }
                            this.allColumns = this.allColumns.map((item, index) => {
                                if (item.key === key) {
                                    item.filtering = true;
                                }
                                return item;
                            });
                        } else {
                            this.$delete(this.sqlList_tableFilter, con);
                            this.allColumns = this.allColumns.map((item, index) => {
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
            // 删掉 sort tag
            empty_sort() {
                // 清空
                this.order_column = '';
                this.order_type = '';

                // 刷新
                this.curPage = 1;
                this.refreshData();
            },

            /* 文件下载 */
            exportData() {
                window.open(`${util.ajaxUrl}/crm/contacts/getFilterListExcel?orgId=${this.enterpriseId}&userId=${this.userId}&listType=3&query=${this.queryData.$and.length ? encodeURIComponent(JSON.stringify(this.queryData)) : ''}&subUserIds=${this.subUserIds}`, '_blank');
            },

            /* 表格 */
            // 数据处理
            // 刷新表格数据
            refreshData() {
                // 取消之前的表格数据请求
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }
                const postData = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    listType: 3,
                    // startDate: this.startDate,
                    // endDate: this.endDate,
                    query: this.queryData.$and.length ? JSON.stringify(this.queryData) : undefined,
                    subUserIds: this.subUserIds,
                    pageSize: this.pageSize,
                    pageNo: this.curPage,
                    orderColumn: this.order_column,
                    orderType: this.order_type
                };
                /**
                 * @Description: 当前页不是第一页的时候不再请求总条数
                 * @author mayuanzhi
                 * @date 2020/8/6
                 */
                if (this.curPage === 1) {
                    this.getFilterListTotal(postData);
                }
                const vm = this;
                this.loading = true;
                util.ajax({
                    url: '/crm/contacts/getFilterListData',
                    method: 'post',
                    data: postData,
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        // An executor function receives a cancel function as a parameter
                        vm.cancelFunc = c;
                    })
                }).then(response => {
                    this.initTable = true;
                    if (response.data.code === '1') {
                        // 处理数据
                        this.tableData = this.handleData(response.data.data);
                        // 表格滚动到底部
                        if (this.$refs.table) {
                            this.$refs.table.$el.querySelector('.el-table__body-wrapper').scrollTop = 0;
                        }
                    } else {
                        this.tableData = [];
                        this.$Message.error(this.$t('crm.Table.error_getInquiryTableData'));
                    }
                    setTimeout(() => {
                        this.loading = false;
                    }, 500);
                });
            },
            // 获取分页
            getFilterListTotal(postData) {
                util.ajax({
                    url: '/crm/contacts/getFilterListTotal',
                    method: 'post',
                    data: postData
                }).then(res => {
                    if (res.data.code === '1') {
                        this.totalNum = res.data.data || 0;
                        this.maxPageNum = Math.ceil(this.totalNum / this.pageSize);
                    } else {
                        this.totalNum = 0;
                        this.maxPageNum = 0;
                        // this.$Message.error(this.$t('crm.Table.error_getInquiryTableData'));
                    }
                }).catch(e => {
                    console.log(e);
                });
            },
            // 检索并刷新表格
            refreshData_filter() {
                this.merge_query_list();
                this.curPage = 1;
                this.refreshData();
            },
            // 初始化数据
            handleData(data) {
                if (Array.isArray(data) && data.length) {
                    // 格式化数据
                    data = data.map(data => {
                        const temp = {
                            id: data.id,
                            inquiryId: data.inquiryId,
                            seqNumber: data.seqNumber,
                            companyName: data.companyName,
                            companyId: data.companyId,
                            inquiryManagers: data.userNamesShow,
                            createTime: new Date(data.createTime).format('yyyy-MM-dd hh:mm'),
                            updateTime: new Date(data.updateTime).format('yyyy-MM-dd hh:mm'),
                            createUser: data.createUser,
                            createUserId: data.createUserId
                        };

                        if (this.contact_columns_authorized.custom) {
                            this.contact_columns_authorized.custom.forEach(item => {
                                temp[item.storageName] = data[item.storageName];
                            });
                        }

                        if (this.contact_columns_authorized.default) {
                            const default_col_arr = ['nickName', 'jobTitle', 'email', 'jobGrade', 'birthday', 'picture', 'gender', 'remark', 'whatsApp', 'instagram'];
                            const authorized_col_arr = this.contact_columns_authorized.default.map(item => item.storageName);
                            this.contact_columns_authorized.default.forEach(item => {
                                if (default_col_arr.includes(item.storageName)) {
                                    temp[item.storageName] = data[item.storageName];
                                }
                            });
                            if (authorized_col_arr.includes('socialNetworkingPlatform')) {
                                let socialNetworkingPlatform = [{
                                    attrName: '',
                                    attrValue: ''
                                }];
                                if (data.socialNetworkingPlatform) {
                                    try {
                                        socialNetworkingPlatform = JSON.parse(data.socialNetworkingPlatform).length ? JSON.parse(data.socialNetworkingPlatform) : [{
                                            attrName: '',
                                            attrValue: ''
                                        }];
                                    } catch (e) {
                                    }
                                }
                                temp.socialNetworkingPlatform = socialNetworkingPlatform;
                            }
                            if (authorized_col_arr.includes('phone')) {
                                temp.phone = data.phone ? data.phone.split(',') : [''];
                            }
                            if (authorized_col_arr.includes('birthday')) {
                                temp.birthday = '';
                                try {
                                    temp.birthday = data.birthday ? new Date(data.birthday).format('yyyy-MM-dd') : '';
                                } catch (e) {
                                }
                            }
                        }

                        return temp;
                    });
                }
                return data;
            },

            // 询盘线索跳转
            jumpToCustomer(id) {
                if (!this.isContainsMenu('myCustomer')) {
                    this.$Message.error(this.$t('crm.WorkBench.error_haveNoPermissionMyCustomer'));
                } else {
                    if (id) {
                        this.$viewCustomer(id);
                    } else {
                        this.$Message.error(this.$t('crm.WorkBench.error_companyId'));
                    }
                }
            },
            jumpToInquiry(id) {
                if (!this.isContainsMenu('myInquiry')) {
                    this.$Message.error(this.$t('crm.WorkBench.error_haveNoPermissionMyInquiry'));
                } else {
                    if (id) {
                        localStorage.setItem('leadsCloud-inquiryId', id);
                        window.open(this.$router.resolve({
                            name: 'myInquiry'
                        }).href, '_blank');
                    } else {
                        this.$Message.error(this.$t('crm.WorkBench.error_inquiryId'));
                    }
                }
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
            // 返回字段筛选渲染函数
            renderHeader_filter(colIndex) {
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
                            storageName_orderColumn: this.storageName_orderColumn,
                            columnType: this.columnType
                        }, this.config_tableFilter[column.key]),
                        on: {
                            updateList: () => {
                                const temp = this.config_tableFilter[column.key];
                                if (temp) {
                                    /* 处理筛选 */

                                    // 判断是否有值, 调整 sqlList
                                    const con = column.fieldType === 'custom' ? column.key : this.getSearchCon(column.key);
                                    if (temp.query.length) {
                                        const result = {};
                                        switch (temp.filterType) {
                                            case 'string':
                                                this.$set(this.sqlList_tableFilter, con, {
                                                    $regex: temp.query
                                                });
                                                break;
                                            case 'select':
                                            case 'users':
                                                switch (con) {
                                                    // 单独发送的字段在最外层, 方便 merge_query_list , 否则用 $or: [筛选条件...]
                                                    case 'inquiryManagers':
                                                        result.$regex = temp.query.map(item => item.value);
                                                        break;
                                                    default:
                                                        // 表头筛选中只能有单个选项值的(单选型字段 + 创建人这种表格才有的字段)属性, 筛选时使用 $eq 等于, 其他用 $regex 包含
                                                        let type = '$regex';
                                                        switch (column.key) {
                                                            case 'gender':
                                                            case 'createUser':
                                                                type = '$eq';
                                                                break;
                                                            default:
                                                                if (column.fieldType === 'custom' && column.colType === 'select') {
                                                                    type = '$eq';
                                                                }
                                                        }
                                                        result.$or = temp.query.map(item => {
                                                            const temp = {};
                                                            temp[con] = {};
                                                            temp[con][type] = item.value;
                                                            return temp;
                                                        });
                                                }

                                                this.$set(this.sqlList_tableFilter, con, result);
                                                break;
                                            case 'date':
                                                if (temp.query[0] && temp.query[1]) {
                                                    result.$and = [];

                                                    const start = {};
                                                    start[con] = {};
                                                    start[con].$gte = temp.query[0];
                                                    result.$and.push(start);

                                                    const end = {};
                                                    end[con] = {};
                                                    end[con].$lte = temp.query[1];
                                                    result.$and.push(end);

                                                    this.$set(this.sqlList_tableFilter, con, result);
                                                } else {
                                                    this.config_tableFilter[column.key].query = [];
                                                    this.$delete(this.sqlList_tableFilter, con);
                                                }
                                                break;
                                        }
                                        this.allColumns = this.allColumns.map((item, index) => {
                                            if (index === colIndex) {
                                                item.filtering = true;
                                            }
                                            return item;
                                        });
                                    } else {
                                        this.$delete(this.sqlList_tableFilter, con);
                                        this.allColumns = this.allColumns.map((item, index) => {
                                            if (index === colIndex) {
                                                item.filtering = false;
                                            }
                                            return item;
                                        });
                                    }

                                    /* 刷新列表 */
                                    this.refreshData_filter();
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
            // 表格表头单元格 class 方法
            headerCellClass({ column }) {
                // 如果可调整列宽, 则设置相应 class
                if (column.resizable) {
                    return 'resizable-col';
                }
            },

            // 点击表格行
            clickRow(data, index) {
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
                if (selector.type !== 'Range') {
                    this.contactId = data.id;
                    this.show_contact_detail = true;
                    this.rowIndex = this.tableData.findIndex(item => item.id === data.id);
                }
            },

            // 改变每页条数
            pageSizeChange(pageSize) {
                this.curPage = 1;
                this.pageSize = pageSize;
                util.ajaxJson({
                    url: '/crm/userconfig/update',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        key: 'myContact',
                        value: pageSize.toString()
                    }
                }).then(res => {
                    console.log('update的结果为', res.data);
                }).catch((e) => {
                });
                this.refreshData();
            },
            // 改变页码
            changePage(page) {
                if (page <= this.maxPageNum) {
                    this.curPage = page;
                    this.refreshData();
                }
            },

            /* 处理详情页传递过来的刷新信息 */
            refreshCheck(obj) {
                if (obj && obj.contactId) {
                    const tableRow = this.tableData.find(item => `${item.id}` === `${obj.contactId}`);
                    if (tableRow) {
                        // this.refreshData();
                        // 改为不刷新表格, 只获取该条表格数据的最新信息, 更新到表格
                        this.updateTableRow(tableRow);
                    }
                }
            },
            // 更新指定表格行信息
            updateTableRow(row) {
                // 筛选条件: 指定 row id
                const filterRowCondition = {
                    $and: [
                        {
                            id: {
                                $eq: row.id
                            }
                        }
                    ]
                };

                // 组装请求数据
                const postData = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    listType: 3,
                    query: JSON.stringify(filterRowCondition),
                    pageSize: 20,
                    pageNo: 1
                };
                // 请求指定 row 最新数据
                util.ajax({
                    url: '/crm/contacts/getFilterListData',
                    method: 'post',
                    data: postData
                }).then(response => {
                    if (response.data.code === '1') {
                        // 获取待更新的表格行在当前表格页的位置
                        const index = this.tableData.findIndex(item => `${item.id}` === `${row.id}`);
                        // 如果待更新的表格行已不在当前表格页, 停止更新, 不再往下继续执行
                        if (index === -1) {
                            return;
                        }

                        // 存储返回的表格行最新数据
                        let newRowData = (Array.isArray(response.data.data) && response.data.data.length) ? response.data.data[0] : null;

                        if (newRowData) {
                            // 有数据
                            // 处理数据
                            [newRowData] = this.handleData([newRowData]);

                            // 更新数据到表格行
                            this.$set(this.tableData, index, newRowData);
                            // 如果之前表格高亮行就是当前行, 更新后要恢复高亮状态
                            if (this.rowIndex === index) {
                                this.$refs.table.setCurrentRow(this.tableData[index]);
                            }
                        } else {
                            // 无数据
                            // 关闭所有侧滑页
                            this.show_contact_detail = false;
                            this.contactId = 0;
                            // 刷新当前页表格数据
                            this.refreshData();
                        }
                    }
                });
            }
        },
        watch: {
            group: {
                handler(val) {
                    this.changeGroups(val);
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less">
    @import "../../../styles/common.less";
    @import "../Detail/Components/less/modal.less";
    @import "Components/less/tablePage.less";
    @import "../Detail/Components/less/detailPage.less";
    @import '../../main-components/editable-table.less';
</style>
