<template>
    <div class="crm-table-page contact-table-page">
        <div style="min-width: 700px;">
            <!-- 操作栏 -->
            <div class="my-content-top">
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
                            style="left:16px;"
                            :order_column="order_column"
                            :order_type="order_type"
                            :storageName_orderColumn="storageName_orderColumn"
                            :filterConObj.sync="config_tableFilter"
                            :langObj="lang_contact"
                            :width="600"
                            :tagMaxWidth="300"
                            ref="filterTags"
                            @change_filter_tag="change_filter_tag"
                            @emptySort="empty_sort"
                            @removeCon="remove_filter_tag"></FilterTags>

                    <!-- 新版按钮 -->
                    <div class="table-operate-btns _btns_text_ml">
                        <!-- 文件导出 -->
                        <Tooltip :content="$t('crm.Table.exportData')" effect="dark" placement="bottom">
                            <Button v-if="authorized_button['exportData']"
                                type="text"
                                icon="custom custom-file-download"
                                @click="exportData"
                                class="piwik_download_table_contact contact-filedownload custom-file-download-border"></Button>
                        </Tooltip>
                        <HelpTip :title="$t('helpTip.exportData')"></HelpTip>
                    </div>
                </div>
            </div>
            <div class="_min_height_100" :style="{minHeight:table_height-100+'px'}">
                <!-- loading -->
                <Spin v-if="loading"
                      fix></Spin>

                <!-- 表格 -->
                <customerTable ref="customerView"
                        :flag_refreshColumn="flag_refreshColumn"
                        :table_height="table_height"
                        :tableData="tableData"
                        :currentColumns="currentColumns"
                        :config_tableFilter.sync="config_tableFilter"
                        :pageSize="pageSize"
                        :pageSizeOpts="pageSizeOpts"
                        :totalNum="totalNum"
                        :curPage="curPage"
                        :close_popper="close_popper"
                        :fieldStyle="fieldStyle"
                        :allColumns.sync="allColumns"
                        :columnType="columnType"
                        :selected_items="selected_items"
                        :corp_columns_authorized="corp_columns_authorized"
                        :contact_columns_authorized="contact_columns_authorized"
                        :inquiry_columns_authorized="inquiry_columns_authorized"
                        :order_column.sync="order_column"
                        :order_type.sync="order_type"
                        :storageName_orderColumn.sync="storageName_orderColumn"
                        currentTable="contact"
                        @refreshData="refreshData"
                        @updateList="updateList"
                        @update_showPopper="update_showPopper"
                    ></customerTable>

            </div>

        </div>

        <!-- 修改字段 -->
        <EditColumns
                :visible.sync="visible_edit_columns"
                :columnType="columnType"
                :id.sync="id_column_show_order"
                :allColumns="allColumns"
                :allGroup="allGroup"
                :group.sync="group"
                :groupingRules="groupingRules"></EditColumns>

        <!-- 详情页 -->
        <CRMDrawerList
                :visible.sync="show_contact_detail"
                :id.sync="contactId"
                type="contact"
                originalType="contact"
                :colSpan="12"
                :corp_columns_authorized="corp_columns_authorized"
                :contact_columns_authorized="contact_columns_authorized"
                :inquiry_columns_authorized="inquiry_columns_authorized"
                @refreshData="refreshData"
                @refreshCheck="refreshCheck">
        </CRMDrawerList>
    </div>
</template>

<script>
    import { HANDLE_BUTTON, BUTTON_IDS, TOP_FILTER_ITEM } from '@/api/config';
    import { mapState, mapGetters } from 'vuex';
    import TopFilter from '@/views/crm/Table/Components/Html/topFilter';
    const EditColumns = () => import('@/views/crm/Table/Components/Modal/editColumns');
    const CRMDrawerList = () => import('@/views/crm/Detail/CRMDrawerList');
    import FilterTags from '@/views/main-components/filter-tags';
    import customerTable from '@/views/crm/Table/Components/customerTable';
    import { crmCommon, crmContacts } from '@/api/crm/index';
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
            case 'socialNetworkingPlatform':
                if (this.addCondition[index].condition1 === 'socialNetworkingPlatform') {
                    this.addCondition[index].conditionList2 = [
                        ...TOP_FILTER_ITEM.textsocialNetwork
                    ];
                } else {
                    this.addCondition[index].conditionList2 = [
                        ...TOP_FILTER_ITEM.text
                    ];
                }
                this.addCondition[index].condition2 = '$regex';
                this.addCondition[index].inputType = 'string';
                break;
            // 单选
            case 'createUser':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.select
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
                    ...TOP_FILTER_ITEM.boolean
                ];
                this.addCondition[index].condition2 = '$eq';
                this.addCondition[index].inputType = 'booleanSelect';
                this.addCondition[index].condition3 = 1;
                break;
            // 时间类
            case 'birthday':
            case 'createTime':
            case 'updateTime':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.dateRange
                ];
                this.addCondition[index].condition2 = '$range';
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
                    ...TOP_FILTER_ITEM.MultSelectUser
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
                    switch (temp.filterType) {
                        case 'date':
                        case 'date+time':
                            this.addCondition[index].conditionList2 = [
                                ...TOP_FILTER_ITEM.dateRange
                            ];
                            this.addCondition[index].condition2 = '$range';
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
                                ...TOP_FILTER_ITEM.MultSelect
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
                                ...TOP_FILTER_ITEM.select
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
                        default:
                            this.addCondition[index].conditionList2 = [
                                ...TOP_FILTER_ITEM.text
                            ];
                            this.addCondition[index].inputType = 'string';
                            break;
                    }
                } else {
                    this.addCondition[index].conditionList2 = [
                        ...TOP_FILTER_ITEM.text
                    ];
                    this.addCondition[index].inputType = 'string';
                }
                break;
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
                this.addCondition[index].inputType = TOP_FILTER_ITEM.text.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = '';
                break;
            // 单选型
            case 'createUser':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.select.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                if (this.addCondition[index].inputType === 'array') {
                    this.addCondition[index].condition3 = [];
                } else {
                    this.addCondition[index].condition3 = '';
                }
                break;
            // Boolean
            case 'gender':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.boolean.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                if (this.addCondition[index].inputType === 'booleanMultSelect') {
                    this.addCondition[index].condition3 = [];
                } else {
                    this.addCondition[index].condition3 = 1;
                }
                break;
            // 时间类
            case 'birthday':
            case 'createTime':
            case 'updateTime':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.dateRange.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = '';
                if (this.addCondition[index].condition2 === 'dateRange' || this.addCondition[index].condition2 === this.$t('crm.Table.con_periodOfTime')) {
                    this.addCondition[index].inputType = 'dateRange';
                    this.addCondition[index].condition3 = [];
                }
                break;
            // 负责人, 数组
            case 'inquiryManagers':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelectUser.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = [];
                break;
            // 自定义字段
            default:
                const temp = this.allColumns.find(item => item.key === this.addCondition[index].condition1);
                if (temp) {
                    switch (temp.filterType) {
                        case 'date':
                        case 'date+time':
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.dateRange.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType; 
                            if (this.addCondition[index].inputType === 'dateRange') {
                                this.addCondition[index].condition3 = [];
                            } else {
                                this.addCondition[index].condition3 = '';
                            }
                            break;
                        case 'selectMultiple':
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelect.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                            this.addCondition[index].condition3 = [];
                            break;
                        case 'select':
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.select.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                            if (this.addCondition[index].inputType === 'array') {
                                this.addCondition[index].condition3 = [];
                            } else {
                                this.addCondition[index].condition3 = '';
                            }
                            break;
                        case 'text':
                        case 'textarea':
                        default:
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.text.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                            this.addCondition[index].condition3 = '';
                            break;
                    }
                } else {
                    this.addCondition[index].inputType = TOP_FILTER_ITEM.text.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                    this.addCondition[index].condition3 = '';
                }
                break;
        }
        if (this.addCondition[index].inputType === 'null' || this.addCondition[index].inputType === 'nnull') {
            this.addCondition[index].condition3 = -1;
        }
    };

    export default {
        name: 'myContact',
        components: {
            TopFilter,
            EditColumns,
            CRMDrawerList,
            FilterTags,
            customerTable
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height',
                button_list: state => state.app.button_list,
                allUsers: state => state.crm.allUsers,
                selectOptions: state => state.crm.selectOptions
            }), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu'
            ]),
            table_height() {
                let temp = this.window_height ? this.window_height - 174 : document.body.clientHeight - 174;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
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
                    const type = item.condition2;
                    switch (item.inputType) {
                        case 'string':
                        case 'boolean':
                        case 'select':
                        case 'number':
                        case 'booleanSelect':
                        case 'null':
                        case 'nnull':
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
                        case 'numberRange':
                            if (typeof item.condition3[0] === 'number' && typeof item.condition3[1] === 'number') {
                                temp.$and = [];

                                const start = {};
                                start[con] = {};
                                start[con].$gte = item.condition3[0];
                                temp.$and.push(start);

                                const end = {};
                                end[con] = {};
                                end[con].$lte = item.condition3[1];
                                temp.$and.push(end);

                                return temp;
                            }
                            break;
                        case 'booleanMultSelect':
                        case 'array':
                            switch (con) {
                                case 'inquiryManagers':
                                    temp[con] = {};
                                    temp[con][type] = item.condition3;
                                    break;
                                default:
                                    if (['$andregex', '$andnregex', '$nregex', '$nin', '$eq', '$ne'].includes(type)) {
                                        temp.$and = item.condition3.map(val => {
                                            const temp = {};
                                            temp[con] = {};
                                            if (type === '$andregex') {
                                                temp[con].$regex = val;
                                            } else if (type === '$andnregex') {
                                                temp[con].$nregex = val;
                                            } else {
                                                temp[con][type] = val;
                                            }
                                            return temp;
                                        });
                                    } else {
                                        temp.$or = item.condition3.map(val => {
                                            const temp = {};
                                            temp[con] = {};
                                            temp[con][type] = val;
                                            return temp;
                                        });
                                    }
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
                    estimatedInquiryAmount: this.$t('crm.Detail.inq_estimatedInquiryAmount'),
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
                flag_refreshColumn: true, // 使用 v-if 刷新列表列顺序
                currentColumns: [], // 表格列名称
                allColumns: [], // 表格全部列
                tableData: [],
                selected_items:[],
                totalNum: 0,
                curPage: 1,
                pageSize: null,
                maxPageNum: 1,
                pageSizeOpts: [20, 50, 100],
                // 需要添加格式化方法的字段 以及 方法
                tableFormatters: {
                    gender: row => {
                        let gender = '-';
                        switch (`${row.gender}`) {
                            case '1':
                                gender = this.$t('crm.Modal.male');
                                break;
                            case '2':
                                gender = this.$t('crm.Modal.female');
                                break;
                        }
                        return gender;
                    },
                    socialNetworkingPlatform: row => {
                        return Array.isArray(row.socialNetworkingPlatform) && row.socialNetworkingPlatform.filter(item => item.attrValue).length ? row.socialNetworkingPlatform.map(item => {
                            return `${item.attrName}: ${item.attrValue}`;
                        }).join(', ') : '-';
                    }
                },
                close_popper: this.$debounce(() => {

                    // 关闭表头筛选框浮层
                    if (this.currentColumns.some(item => item.show_filter_content)) {
                        this.currentColumns = this.currentColumns.map(item => {
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
                // 需要添加日期处理方法的字段
                dateOptionsFileds: ['createTime', 'updateTime'],
                // 日期类型快捷操作的处理方法
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

                /* 筛选 */
                title_topFilter: this.$t('crm.Table.allContact'),
                flag_topFilter: false,
                type_topFilter: '',
                addChangeCon1: addChangeCon1,
                addChangeCon2: addChangeCon2,
                // order_column: '',
                // order_type: '',
                // storageName_orderColumn: '',
                order_column: localStorage.getItem('myContact_order_column') ? localStorage.getItem('myContact_order_column') : '', /* 排序列 */
                order_type: localStorage.getItem('myContact_order_type') ? localStorage.getItem('myContact_order_type') : '', /* 排序类型  asc desc */
                storageName_orderColumn: localStorage.getItem('myContact_storageName_orderColumn') ? localStorage.getItem('myContact_storageName_orderColumn') : '',
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
                queryData: {
                    $and: []
                },
                subUserIds: '',
                subUserOptType: [],
                allLists: {
                    gender: [
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

                /* 新版表头筛选 */
                // 筛选配置
                config_tableFilter: {},
                // 表头筛选条件
                sqlList_tableFilter: {},

                /* 修改字段 */
                visible_edit_columns: false,
                columnType: 2,
                id_column_show_order: undefined,
                group: [],
                allGroup: [],
                // 保存到后端的字段属性, 目前只有 width
                fieldStyle: {},

                /* 对接权限系统 */
                contact_columns_authorized: {}, // 联系人所有字段
                corp_columns_authorized: {}, // 公司所有字段
                inquiry_columns_authorized: {}, // 询盘所有字段

                /* 联系人详情 */
                show_contact_detail: false,
                rowIndex: -1,
                contactId: 0,
                groupingRules: [
                    {
                        align: 'left',
                        key: 'parentId',
                        value: 1,
                        label: this.$t('crm.Modal.module_company'),
                        emptyText: this.$t('crm.Html.nothing')
                    },
                    {
                        align: 'left',
                        key: 'parentId',
                        value: 3,
                        label: this.$t('crm.Modal.module_inquiry'),
                        emptyText: this.$t('crm.Html.nothing')
                    },
                    {
                        align: 'left',
                        key: 'parentId',
                        value: 2,
                        label: this.$t('crm.Modal.module_contact'),
                        emptyText: this.$t('crm.Html.nothing')
                    }
                ]
            };
        },
        created() {
            !this.allUsers.length && this.$store.dispatch('getAllUsers');
            this.$store.dispatch('getSelectOptions');
        },
        async mounted() {
            window.addEventListener('resize', this.setSelectOptions);
            // 获取列表相关数据 筛选数据 + 列表字段 + 显示字段 + 左上角筛选第一项的下拉数据
            await this.getTableCloumns();
            // 获取所有授权字段
            this.getField();
        },
        beforeDestroy() {
            this.contactId = '';
        },
        methods: {
            // 获取所有授权字段
            getField() {
                // 获取授权字段
                const data = {
                    orgId: this.enterpriseId, // 企业id
                    userId: this.userId, // 用户id
                    parentId: 0,
                    type: this.columnType,
                    key: 'myContact'
                };
                // 获取列表表头+显示顺序+表格宽度+显示条数
                crmCommon.getCommonConfig(data).then(resCol => {
                    this.loading = true;
                    if (resCol.code === '1') {
                        // 暂存所有默认字段和自定义字段
                        const defaultFields = resCol.data && Array.isArray(resCol.data.default) ? resCol.data.default : [];
                        const customFields = resCol.data && Array.isArray(resCol.data.custom) ? resCol.data.custom : [];
                        // 筛选得到公司/询盘/联系人授权字段
                        this.$set(this.corp_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 1));
                        this.$set(this.corp_columns_authorized, 'custom', customFields.filter(col => col.parentId === 1));
                        this.$set(this.contact_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 2));
                        this.$set(this.contact_columns_authorized, 'custom', customFields.filter(col => col.parentId === 2));
                        this.$set(this.inquiry_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 3));
                        this.$set(this.inquiry_columns_authorized, 'custom', customFields.filter(col => col.parentId === 3));
                        if (this.contact_columns_authorized.default) {
                            this.contact_columns_authorized.default.forEach(item => {
                                item.cname = this.lang_contact[item.storageName] || item.cname;
                            });
                        }
                        if (this.corp_columns_authorized.default) {
                            this.corp_columns_authorized.default.forEach(item => {
                                if (this.lang_company.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_company[item.storageName];
                                }
                            });
                        }
                        if (this.inquiry_columns_authorized.default) {
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
            getTableCloumns() {
                crmCommon.getContactsTitle({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    listType: this.columnType,
                    configKey: 'myContact'
                }).then((response) => {
                    if (response.code === '1') {
                        this.allColumns = response.data.showFieldList;
                        let list = response.data.filterFieldMap;
                        Object.keys(list).forEach((key) => {
                            // date 类型增加 快捷操作按钮(默认字段)
                            if (this.dateOptionsFileds.includes(key)) {
                                list[key].dateOptions = this.dateOptions;
                            }
                            if (this.allLists[key]) {
                                list[key].allList = this.allLists[key];
                            }
                            if (list[key].query.length) {
                                list[key].query = JSON.parse(list[key].query);
                            }
                            this.$set(this.config_tableFilter, key, list[key]);
                        });

                        this.allColumns.forEach((col, index) => {
                            const headSet = this.config_tableFilter[col.key];
                            if (headSet && (headSet.sort || headSet.filter)) {
                                col.show_filter_content = false;
                                col.filtering = false;
                                col.title = this.lang_contact[col.key] || col.title;
                                this.lang_contact[col.key] = col.title;
                                if (col.key === 'email') {
                                    col.className = 'ct_email';
                                }
                                if (this.tableFormatters[col.key]) {
                                    col.formatter = this.tableFormatters[col.key];
                                } else if (col.fieldType === 'custom' && col.filterType === 'selectMultiple') {
                                    col.formatter = (row) => {
                                        return this.$options.filters.parseArray(row[col.key]).length ? this.$options.filters.parseArray(row[col.key]).join(', ') : '-';
                                    };
                                }
                            } else {
                                col.title = this.lang_contact[col.key] || col.title;
                                this.lang_contact[col.key] = col.title;
                                if (this.tableFormatters[col.key]) {
                                    col.formatter = this.tableFormatters[col.key];
                                }
                            }
                        });
                        // 所有字段 key
                        this.allGroup = this.allColumns.map(item => item.key);

                        // 初始化左上角筛选数据
                        this.conditionList1 = response.data.searchFieldList;
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

                        // 配置表格显示项 开始
                        if (response.data.fieldOrder) {
                            // 解构数据
                            const { id, showField, fieldStyle } = response.data.fieldOrder;
                            this.id_column_show_order = id;

                            // 处理字段顺序
                            if (typeof showField === 'string') {
                                this.group = showField.split(',');
                            }

                            // 处理字段宽度
                            this.fieldStyle = fieldStyle ? JSON.parse(fieldStyle) : {};
                            Object.entries(this.fieldStyle).forEach(([fieldKey, fieldObj]) => {
                                const column = this.allColumns.find(item => item.key === fieldKey);
                                if (column && fieldObj.width) {
                                    column.width = fieldObj.width;
                                }
                            });
                        }
                        // 配置表格显示项 结束

                        // 用户当前设置页数 开始
                        if (response.data.userConfig && response.data.userConfig.value) {
                            const size = parseInt(response.data.userConfig.value);
                            this.pageSize = size;
                        } else {
                            this.pageSize = 20;
                            this.addPageSize();
                        }
                        //  用户当前设置页数 结束

                        // 根据跳转时附加参数的不同作出相应刷新操作
                        this.checkRouteParams();

                        // 设置大部分下拉选项
                        this.selectOptions.clientType && this.setSelectOptions();
                        // 设置全部人员列表以供筛选
                        this.allUsers.length && this.setAllUsers();
                    } else {
                        console.log('数据获取失败');
                    }
                }, () => {
                    console.log('数据获取失败');
                });
            },
            /* 添加PageSize */
            addPageSize() {
                const data = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    key: 'myContact',
                    value: this.pageSize.toString()
                };
                crmCommon.userconfigAdd(data);
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
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', true);
                    // 处理从任务带参数跳过来的情况 或 从工作台行为视图点击跳转
                    const tempId = localStorage.getItem('leadsCloud-contactId');
                    localStorage.removeItem('leadsCloud-contactId');

                    this.show_contact_detail = false;
                    this.$nextTick(() => {
                        this.contactId = tempId;
                        this.show_contact_detail = true;
                    });
                }
                this.type_topFilter = 'searchCommon';
                this.flag_topFilter = !this.flag_topFilter;
            },
            // 新建获取属性列表
            setSelectOptions() {
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
            },
            // 获取询盘负责人列表
            setAllUsers() {
                const allList = this.allUsers.map(item => {
                    const { fullname: label, id: value } = item;
                    return { label, value };
                });
                this.config_tableFilter.createUser && this.$set(this.config_tableFilter.createUser, 'allList', [{ label: '询盘云', value: -2 }].concat(allList));
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
                if (subUserIds_a && subUserIds_a.length) {
                    this.subUserOptType = [];
                    subUserIds_a.forEach(items => {
                        Object.entries(items.inquiryManagers).forEach(([fieldKey, fieldObj]) => {
                            this.subUserOptType.push({
                                [fieldKey]: fieldObj === -1 ? [] : fieldObj
                            });
                        });
                    });
                } else {
                    this.subUserOptType = [];
                }
                if (subUserIds_b && subUserIds_b.length) {
                    this.subUserIds = subUserIds_b[0].inquiryManagers.$regex.join(',');
                } else {
                    this.subUserIds = '';
                }
                a = a.filter(item => !item.hasOwnProperty('inquiryManagers'));
                b = b.filter(item => !item.hasOwnProperty('inquiryManagers'));

                // 筛选兼容历史数据
                const allColumnKeys = this.allColumns.map(item => this.getSearchCon(item.key));
                for (let i = 0; i < a.length; i++) {
                    const item = a[i];
                    if (Object.keys(item)[0] === '$or') {
                        const item_$or = item['$or'];
                        for (let j = 0; j < item_$or.length; j++) {
                            const self = item_$or[j];
                            if (!allColumnKeys.includes(Object.keys(self)[0])) {
                                item_$or.splice(j, 1);
                                j--;
                            }
                        }
                        if (!item_$or.length) {
                            a.splice(i, 1);
                            i--;
                        }
                    } else if (Object.keys(item)[0] === '$and') {
                        const item_$and = item['$and'];
                        for (let j = 0; j < item_$and.length; j++) {
                            const self = item_$and[j];
                            if (!allColumnKeys.includes(Object.keys(self)[0])) {
                                item_$and.splice(j, 1);
                                j--;
                            }
                        }
                        if (!item_$and.length) {
                            a.splice(i, 1);
                            i--;
                        }
                    } else {
                        if (!allColumnKeys.includes(Object.keys(item)[0])) {
                            a.splice(i, 1);
                            i--;
                        }
                    }
                }

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
                                                    if (column.fieldType === 'custom' && column.filterType === 'select') {
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
                localStorage.removeItem('myContact_order_column');
                localStorage.removeItem('myContact_order_type');
                localStorage.removeItem('myContact_storageName_orderColumn');

                // 刷新
                this.curPage = 1;
                this.refreshData();
            },
            /* 文件下载 */
            exportData() {
                // 减缓后端压力 前端分页下载多个文件 先使用之前的
                const lastIdTag = new Date().getTime();
                if (this.totalNum > 60000) {
                    const lists = Math.ceil(this.totalNum / 60000);
                    for (let i = 0; i < lists; i++) {
                        setTimeout(() => {
                            const url = `${this.$util.ajaxUrl}/crm/mongo/contactsRefactor/getContactsFilterExcel?pageNo=${i + 1}&orgId=${this.enterpriseId}&userId=${this.userId}&listType=3&subUserOptType=${this.subUserOptType.length ? encodeURIComponent(JSON.stringify(this.subUserOptType)) : ''}&query=${this.queryData.$and.length ? encodeURIComponent(JSON.stringify(this.queryData)) : ''}&subUserIds=${this.subUserIds}&lastIdTag=${lastIdTag}`;
                            this.$stm.openNewWindow(url);
                        }, i * 1000);
                    }
                } else {
                    const url = `${this.$util.ajaxUrl}/crm/mongo/contactsRefactor/getContactsFilterExcel?pageNo=1&orgId=${this.enterpriseId}&userId=${this.userId}&listType=3&subUserOptType=${this.subUserOptType.length ? encodeURIComponent(JSON.stringify(this.subUserOptType)) : ''}&query=${this.queryData.$and.length ? encodeURIComponent(JSON.stringify(this.queryData)) : ''}&subUserIds=${this.subUserIds}&lastIdTag=${lastIdTag}`;
                    this.$stm.openNewWindow(url);
                }
                // const url = `${this.$util.ajaxUrl}/crm/mongo/contactsRefactor/getContactsFilterExcel?orgId=${this.enterpriseId}&userId=${this.userId}&listType=3&subUserOptType=${this.subUserOptType.length ? encodeURIComponent(JSON.stringify(this.subUserOptType)) : ''}&query=${this.queryData.$and.length ? encodeURIComponent(JSON.stringify(this.queryData)) : ''}&subUserIds=${this.subUserIds}`;
                // this.$stm.openNewWindow(url);
            },
            /* 表格 */
            // 数据处理
            // 刷新表格数据
            refreshData() {
                // 取消之前的表格数据请求
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }
                const vm = this;
                const postData = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    listType: 3,
                    query: this.queryData.$and.length ? JSON.stringify(this.queryData) : undefined,
                    subUserIds: this.subUserIds,
                    subUserOptType: this.subUserOptType.length ? JSON.stringify(this.subUserOptType) : undefined,
                    pageSize: this.pageSize,
                    pageNo: this.curPage,
                    orderColumn: this.order_column,
                    orderType: this.order_type
                };
                const cancelToken = new this.$util.axios.CancelToken(function executor(c) {
                    // An executor function receives a cancel function as a parameter
                    vm.cancelFunc = c;
                });
                /**
                 * @Description: 当前页不是第一页的时候不再请求总条数
                 * @author mayuanzhi
                 * @date 2020/8/6
                 */
                this.loading = true;
                crmContacts.getContactsFilterListDataAndTotal(postData, cancelToken).then(response => {
                    if (response.code === '1') {
                        this.totalNum = response.data.total || 0;
                        this.maxPageNum = Math.ceil(this.totalNum / this.pageSize);
                        // 处理数据
                        this.tableData = this.handleData(response.data.list);
                        // 表格滚动到顶部
                        if (this.$refs.customerView && this.$refs.customerView.$refs['table']) {
                            this.$refs.customerView.$refs['table'].$el.querySelector('.vxe-table--body-wrapper').scrollTop = 0;
                        }
                    } else {
                        this.totalNum = 0;
                        this.maxPageNum = 0;
                        this.tableData = [];
                        this.$Message.error(this.$t('crm.Table.error_getInquiryTableData'));
                    }
                    this.loading = false;
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
                            contactId: data.id,
                            inquiryId: data.inquiryId,
                            companyId: data.companyId,
                            seqNumber: data.seqNumber,
                            companyName: data.companyName,
                            inquiryManagers: data.companyManagerName,
                            createTime: new Date(data.createTime).format('yyyy-MM-dd hh:mm'),
                            updateTime: new Date(data.updateTime).format('yyyy-MM-dd hh:mm'),
                            createUser: data.createUser,
                            createUserId: data.createUserId,
                            email: data.emailLowerDe,
                            companyManagerIds: data.companyManagerIds.join(',')
                        };

                        this.allColumns.forEach((columns, index) => {
                            if (temp[columns.key] === undefined) {
                                temp[columns.key] = data[columns.key];
                            }
                        });

                        if (this.allColumns.map((item) => item.key).includes('socialNetworkingPlatform')) {
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
                        if (this.allColumns.map((item) => item.key).includes('phone')) {
                            temp.phone = data.phone ? data.phone : '-';
                        }
                        if (this.allColumns.map((item) => item.key).includes('birthday')) {
                            temp.birthday = '-';
                            try {
                                temp.birthday = data.birthday ? new Date(data.birthday).format('yyyy-MM-dd') : '-';
                            } catch (e) {
                            }
                        }

                        return temp;
                    });
                }
                return data;
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
            update_showPopper(val, colIndex) {
                this.currentColumns = this.currentColumns.map((item, index) => {
                    if (index === colIndex) {
                        item.show_filter_content = val;
                    } else {
                        item.show_filter_content = false;
                    }
                    return item;
                });
            },
            updateList(checkAll, column, colIndex) {
                const temp = this.config_tableFilter[column.field];
                temp.checkAll = checkAll; // 是否勾选【全选】
                if (temp) {
                    /* 处理筛选 */

                    // 判断是否有值, 调整 sqlList
                    const con = column.fieldType === 'custom' ? column.field : this.getSearchCon(column.field);
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
                                        switch (column.field) {
                                            case 'gender':
                                            case 'createUser':
                                                type = '$eq';
                                                break;
                                            default:
                                                if (column.fieldType === 'custom' && column.filterType === 'select') {
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
                                    this.config_tableFilter[column.field].query = [];
                                    this.$delete(this.sqlList_tableFilter, con);
                                }
                                break;
                        }
                        this.currentColumns = this.currentColumns.map((item, index) => {
                            if (index === colIndex) {
                                item.filtering = true;
                            }
                            return item;
                        });
                    } else {
                        this.$delete(this.sqlList_tableFilter, con);
                        this.currentColumns = this.currentColumns.map((item, index) => {
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
            // 点击表格行
            clickRow({row, column, $event}) {
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
                    const path = $event.path || ($event.composedPath && $event.composedPath());
                    // 邮箱弹窗
                    if (path.find(item => item.classList && item.classList.contains('ct_email') && item.tagName === 'TD')) {
                        if (row.email) {
                            const emails = [{
                                receiverName: row.nickName || '',
                                receiveMailAddress: row.email,
                                followUpId: `${row.companyId}`,
                                followUpType: 3
                            }];
                            localStorage.setItem('leadsCloud-sendMail-contacts', JSON.stringify(emails));
                            // 打开写信弹窗之前先判断有没有已经打开的写信弹窗
                            const doc = document.getElementById('mail_detail_modal');
                            if (!doc) {
                                this.$store.commit('setQuickSendMailVisible', true);
                            }
                        }
                        return;
                    }
                    this.contactId = row.id;
                    this.show_contact_detail = true;
                    this.rowIndex = this.tableData.findIndex(item => item.id === row.id);
                }
            },
            // 改变每页条数
            pageSizeChange(pageSize) {
                this.curPage = 1;
                this.pageSize = pageSize;
                const data = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    key: 'myContact',
                    value: pageSize.toString()
                };
                crmCommon.userconfigUpdate(data);
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
                crmContacts.getContactsFilterListDataAndTotal(postData).then(response => {
                    if (response.code === '1') {
                        // 获取待更新的表格行在当前表格页的位置
                        const index = this.tableData.findIndex(item => `${item.id}` === `${row.id}`);
                        // 如果待更新的表格行已不在当前表格页, 停止更新, 不再往下继续执行
                        if (index === -1) {
                            return;
                        }
                        // 存储返回的表格行最新数据
                        let newRowData = (Array.isArray(response.data.list) && response.data.list.length) ? response.data.list[0] : null;

                        if (newRowData) {
                            // 有数据
                            // 处理数据
                            [newRowData] = this.handleData([newRowData]);

                            // 更新数据到表格行
                            this.$set(this.tableData, index, newRowData);
                            // 如果之前表格高亮行就是当前行, 更新后要恢复高亮状态
                            if (this.rowIndex === index) {
                                this.$refs.customerView.$refs['table'].setCurrentRow(this.tableData[index]);
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
            },
            // 邮箱表格 需要这么个function 删除会报错
            handleSelectionChange() {}
        },
        watch: {
            group: {
                handler(val) {
                    this.changeGroups(val);
                },
                immediate: true
            },
            selectOptions: {
                handler(val) {
                    if (val) {
                        // 设置大部分下拉选项
                        this.setSelectOptions();
                    }
                }
            },
            allUsers: {
                handler(val) {
                    if (val) {
                        // 设置全部人员列表以供筛选
                        this.setAllUsers();
                    }
                }
            },
            show_contact_detail: {
                handler(val) {
                    if (!val) {
                        if (this.$refs.customerView && this.$refs.customerView.$refs.table) {
                            this.$refs.customerView.$refs.table.setCurrentRow();
                        }
                    }
                }
            },
            order_column: {
                handler(val) {
                    localStorage.setItem('myContact_order_column', val);
                    localStorage.setItem('myContact_storageName_orderColumn', this.storageName_orderColumn);
                },
                immediate: true
            },
            order_type: {
                handler(val) {
                    localStorage.setItem('myContact_order_type', val);
                },
                immediate: true
            },
            // storageName_orderColumn: {
            //     handler(val) {
            //         localStorage.setItem('myContact_storageName_orderColumn', val);
            //     },
            //     immediate: true
            // }
        }
    };
</script>

<style lang="less">
    @import "../../../styles/common.less";
    @import "../Detail/Components/less/modal.less";
    @import "Components/less/tablePage.less";
    @import "../Detail/Components/less/detailPage.less";
    @import '../../main-components/editable-table.less';

    .contact-table-page.crm-table-page {
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
    .my-content-top{
        padding: 8px 30px 8px 20px;
        background: #fff;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
        border-radius: 4px 0 0 4px;
        margin-bottom: 8px;
    }
    .custom-file-download-border{
        margin: 0 8px 0 20px;
        height: 30px;
        padding: 0 8px;
        border: 1px solid #ABBFD5;
        border-radius: 4px;
    }
</style>
