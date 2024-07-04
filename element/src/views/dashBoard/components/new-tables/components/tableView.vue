<template>
    <div ref="tableContainer"
         class="table_body" v-loading="loading" :style="{'minHeight': tableHeight}">
        <!-- :span-method="arraySpanMethod" -->
        <!--滚动加载 v-tableLoadMore="loadData" -->

        <!-- 顶部二级表格页导航 -->
        <div v-if="filterParameters.childFilterVal && childNavLinkText"
             @click="removeChildFilter"
             class="canjump">{{ childNavLinkText }}</div>
        <!-- :row-class-name="getRowClassName" -->
        <Table
            v-if="showTable"
            :data="tableData"
            v-tableLoadMore="loadData"
            border
            highlight-current-row
            size="medium"
            :max-height="tableHeight"
            :span-method="objectSpanMethod"
            :default-sort="filterParameters.defaultSort"
            ref="table"
            class="noborder-table"
            :class="`dashbord-table tableScroll${kind}`">
            <TableColumn
                v-for="item in tableColumns"
                :key="item.key"
                :prop="item.key"
                :label="item.title"
                :align="item.align || 'center'"
                :fixed="item.fixed"
                :width="item.width"
                :render-header="item.renderHeader"
                :sortable="item.sortable"
                :sort-method="item.sortMethod"
                show-overflow-tooltip
            >
                <template slot-scope="scope" v-if="item.child && item.child.length">
                    <TableColumn
                        v-for="child in item.child"
                        :key="child.key"
                        :prop="child.key"
                        :label="child.title"
                        :align="child.align || 'center'"
                        :width="child.width"
                        show-overflow-tooltip
                    >
                        <template slot-scope="scope">
                            <span>
                                {{ scope.row[child.key] }}
                            </span>
                        </template>
                    </TableColumn>
                </template>
                <template slot-scope="scope">
                    <!--
                        <template v-if="item.key === 'firstDepartmentName'">
                            {{ scope.row[item.key] }}
                        </template>
                        <span v-else-if="['secondDepartmentName','fullName'].includes(item.key)"
                        >
                            {{ scope.row[item.key] }}
                        </span> -->

                    <!-- 网站 Tab , 个别表格单独处理, 数值都需要加上逗号格式化 -->
                    <template v-if="['visitorAnalysis', 'visitTrafficAnalysis', 'serviceWorkStatus', 'msgStatusStatistics', 'msgPageStatus'].includes(kind)">
                        <template v-if="kind === 'msgPageStatus'">
                            <!-- 留言页面, 显示页面标题 + 可跳转链接 -->
                            <template v-if="item.key === 'keyName'">
                                <div>{{ scope.row[item.key] }}</div>
                                <div v-if="scope.row.key"
                                     @click="jumpToWebUrl(scope.row.key)"
                                     class="canjump">{{ scope.row.key }}</div>
                            </template>
                            <!-- 否则, 显示指标, 如果有表单筛选则可点击跳转 -->
                            <template v-else>
                                <span @click.stop="filterParameters.formId && jumpToDetail(item.key,scope.row, scope.row.index, $event)"
                                      :class="filterParameters.formId && canJumpField[kind].includes(item.key) ? `canjump piwik_${kind}_${item.key}`: `piwik_${item.key}` ">{{ scope.row[item.key] | formatNumWithCommas }}</span>
                            </template>
                        </template>
                        <template v-else-if="['visitorAnalysis', 'visitTrafficAnalysis'].includes(kind)">
                            <!-- 首列(查看维度) -->
                            <template v-if="item.key === 'keyName'">
                                <!-- 首列(查看维度)为着陆页, 显示页面标题 + 可跳转链接 -->
                                <template v-if="filterParameters.typeId === 'firstVisitUrl'">
                                    <div>{{ scope.row[item.key] }}</div>
                                    <div v-if="scope.row.key"
                                         @click="jumpToWebUrl(scope.row.key)"
                                         class="canjump">{{ scope.row.key }}</div>
                                </template>
                                <!-- 否则, 显示查看维度列, 符合条件的数据可点击跳转到子级维度页面 -->
                                <template v-else>
                                    <!-- 已处于子级页面, 无法跳转; "未知", 不可跳转; 浏览器, 屏幕分辨率, 时段, 着陆页, 浏览器语言, "来源类型-直接访问"不可跳转到子级页面 -->
                                    <span @click="jumpChildTable(scope.row)"
                                          :class="!(filterParameters.childFilterVal || (!scope.row.key || scope.row.keyName === '未知') || ['browser', 'screenResolution', 'hour', 'firstVisitUrl', 'lang'].includes(filterParameters.typeId) || (filterParameters.typeId === 'trafficSourceMerge' && ['4', '8'].includes(scope.row.key))) ? `canjump piwik_${kind}_canJump`: `piwik_${item.key}` ">{{ scope.row[item.key] | formatNumWithCommas }}</span>
                                </template>
                            </template>
                            <!-- 其他列, "未知"不允许穿透 -->
                            <span v-else
                                  @click.stop="jumpToDetail(item.key, scope.row, scope.row.index, $event)"
                                  :class="(canJumpField[kind].includes(item.key) && !(!scope.row.key || scope.row.keyName === '未知')) ? `canjump piwik_${kind}_${item.key}`: `piwik_${item.key}`">{{ scope.row[item.key] | formatNumWithCommas }}</span>
                        </template>
                        <span v-else
                              @click.stop="jumpToDetail(item.key, scope.row, scope.row.index, $event)"
                              :class="canJumpField[kind].includes(item.key) ? `canjump piwik_${kind}_${item.key}`: `piwik_${item.key}`">{{ scope.row[item.key] | formatNumWithCommas }}</span>
                    </template>
                    <span
                        v-else-if="['inquiryDistribution', 'companyDistribution', 'clueDistribution'].includes(kind)"
                        :class="canJumpField[kind].includes(item.key) ? `canjump piwik_${kind}_canJump`: `piwik_${item.key}` "
                        @click="jumpToPageList(item.key,item.title,scope.row)"
                    >
                        {{ scope.row[item.key] }}
                    </span>
                    <template v-else-if="kind === 'googleMarketing'">
                        <span
                            :class="`canjump piwik_${kind}_${item.key}`"
                            v-if="canJumpField[kind].includes(item.key) && scope.$index % 3 === 0" @click="jumpToDetail(item.key,scope.row, scope.row.index, $event)">
                            {{ scope.row[item.key] }}
                        </span>
                        <span v-else-if="item.key == 'campaignName' && scope.row.type === '合计'">
                            {{ scope.row.customerName }}
                        </span>
                        <span
                            :class="`piwik_${kind}_${item.key}`" v-else>
                            {{ scope.row[item.key] }}
                        </span>
                    </template>
                    <span
                        v-else
                        :class="canJumpField[kind].includes(item.key) ? `canjump piwik_${kind}_${item.key}`: `piwik_${item.key}` "
                        @click.stop="jumpToDetail(item.key,scope.row, scope.row.index, $event)"
                    >
                        {{ scope.row[item.key] }}
                    </span>
                </template>
            </TableColumn>
        </Table>
        <Poptip ref="editPopover"
            v-model="visibleEdit"
            :visible-arrow="true"
            placement="bottom"
            :reference="prevTarget"
            :key="popperFlag"
            :width="kind === 'googleMarketing' ? '230' : '303'"
            :popper-options="popperOptions"
            style="margin-top: 0px;"
            @hide="clearEditPopperComponent"
        >
            <div class="poptip_table table_body" style="border-left: 1px solid #EBEEF5;border-top: 1px solid #EBEEF5;">
                <Table
                    :data="whatsappList"
                    v-tableLoadMore="loadData"
                    border
                    highlight-current-row
                    size="medium"
                    :max-height="tableHeight">
                    <TableColumn
                        v-for="item in whatsappTable"
                        :key="item.key"
                        :prop="item.key"
                        :label="item.title"
                        :align="item.align || 'center'"
                        :fixed="item.fixed"
                        :width="item.width"
                        :min-width="item.width || 80"
                        :show-overflow-tooltip="true"
                    >
                            <template slot-scope="scope">
                                <template v-if="kind === 'googleMarketing'">
                                    <span v-if="item.key === 'clueTotal' || item.key === 'seaClueTotal'"
                                        class="canjump"
                                        @click="jumpToClueDetail(item.key ,scope.row, scope.row.index, $event)"
                                    >
                                        {{ scope.row[item.key] }}
                                    </span>
                                    <span v-else-if="item.key === 'inquiryTotal' || item.key === 'seaInquiryTotal'"
                                    :class="item.key === 'inquiryTotal' ? `canjump `: '' "
                                        @click="jumpToInquiryDetail(item.key, scope.row)"
                                    >
                                        {{ scope.row[item.key] }}
                                    </span>
                                    <span v-else-if="item.key === 'tranInquiryTotal' || item.key === 'tranSeaInquiryTotal'"
                                        :class="item.key === 'tranInquiryTotal' ? `canjump `: '' "
                                        @click="jumpToInquiryDetail(item.key, scope.row)"
                                    >
                                        {{ scope.row[item.key] }}
                                    </span>
                                </template>
                                <span
                                    v-else
                                    :class="item.key === 'contactCount' ? `canjump `: '' "
                                    @click="jumpToWaDetail(item.key,scope.row,scope.row.index, $event)"
                                >
                                    {{ scope.row[item.key] }}
                                </span>
                            </template>
                    </TableColumn>
                </Table>
            </div>
        </Poptip>
    </div>
</template>

<script>
    import { getPerformanceTargetsNew, getInquiryMarker, getStaffResourceStat, getStaffToDoList, getInquiryDistribution, getCompanyDistribution, getClueDistribution, getVisitorStatisticsData, getMsgStatusData, getMsgPageStatusData, getServiceWorkData, getGoogleDashBoard, getStatus } from '@/api/dashBoard/dashBoardV2';
    import tableHeaders from './tableHeader';
    import { mapState, mapGetters } from 'vuex';
    import tableQuickEdit from '@/mixins/tableQuickEdit';
    import util from '@/libs/util';
    import { formatNumWithCommas } from '@/utils/dataProcessing';
    import elementResizeDetectorMaker from 'element-resize-detector';

    export default {
        name: 'tableView',
        mixins: [tableHeaders, tableQuickEdit],
        components: {
        },
        props: [
            'from',
            'filterParameters',
            'currentCurrency',
            'kind',
            'typeAggregate'
        ],
        data() {
            return {
                // 配合插件监听容器宽度 resize -- 避免表格表头换行状态变更后, 表格内容高度不变, 导致滚动条位置不对
                observer: null,
                showTable: true,
                timer: null,
                cancelFunc: null,
                loading: false,
                personTableColumns: [],
                departmentTableColumns: [],
                tableData: [],
                isBindMail: false, // 是否绑定邮箱
                isHaveRight: false, // 是否有查看下属邮件权限
                emailList: [],
                // pageSize: 10,
                pageNo: 1,
                totalPage: 0,
                // 配置员工待办事项【员工|部门】可跳转字段
                todoListCanJump: {
                    person: ['disposeWaCount', 'noReadCount', 'todoCount', 'toBeRepliedToCount', 'disposeClueCount', 'disposeCompanyCount', 'retreatIntoHighSeasInquiryCount', 'threeSeasCompanyCount'],
                    department: ['disposeClueCount', 'disposeCompanyCount', 'retreatIntoHighSeasInquiryCount', 'threeSeasCompanyCount']
                },
                // 相关统计表是否可跳转配置
                canJumpField: {
                    completion: [],
                    todoList: [],
                    clueDistribution: [],
                    inquiryDistribution: [],
                    companyDistribution: [],
                    focusedInquiry: ['inquiryCount', 'inquiryTransactionCount'],
                    visitorAnalysis: ['keyName', 'visitorCount', 'newVisitorCount'],
                    visitTrafficAnalysis: ['keyName', 'docCount'],
                    msgStatusStatistics: ['status_1', 'status_101', 'status_102', 'status_100', 'status_103'],
                    msgPageStatus: ['docCount'],
                    serviceWorkStatus: ['csInitiateCount', 'csInitiateSuccessCount', 'visitorInitiateCount', 'timelyReplyCount', 'omitCount', 'clueStatusVisitorCount', 'inquiryStatusVisitorCount'],
                    googleMarketing: ['visitorCount', 'interactionVisitorCount', 'clueCount', 'inquiryCount', 'transactionInquiryCount'], // google营销转化
                    employeeResources: ['clueCount', 'companyCount', 'markerCompanyCount', 'inquiryCount', 'markerInquiryCount', 'transactionInquiryCount']
                },
                // 需要币种的表
                monitorCurrency: ['completion', 'focusedInquiry', 'googleMarketing'],
                whatsappTable: [
                    { key: 'whatsappAccount', title: this.$t('dashBoardV2.Table.WhatsApp'), align: 'left', width: '' },
                    { key: 'contactCount', title: this.$t('dashBoardV2.Table.pendingSessions'), align: 'left', width: '156' }
                ],
                googleMarketingClueTable: [
                    // { key: 'tranInquiryTotalKey', title: this.$t('dashBoardV2.Table.tranInquiryTotalKey'), align: 'left', width: '' },
                    // { key: 'inquiryTotalKey', title: this.$t('dashBoardV2.Table.inquiryTotalKey'), align: 'left', width: '156' },
                    { key: 'clueTotal', title: this.$t('dashBoardV2.Table.sea'), align: 'left', width: '100' },
                    { key: 'seaClueTotal', title: this.$t('dashBoardV2.Table.pubSea'), align: 'left', width: '100' }
                ],
                googleMarketingInquiryTable: [
                    { key: 'inquiryTotal', title: this.$t('dashBoardV2.Table.sea'), align: 'left', width: '100' },
                    { key: 'seaInquiryTotal', title: this.$t('dashBoardV2.Table.pubSea'), align: 'left', width: '100' }
                ],
                googleMarketingTranInquiryTotalTable: [
                    { key: 'tranInquiryTotal', title: this.$t('dashBoardV2.Table.sea'), align: 'left', width: '100' },
                    { key: 'tranSeaInquiryTotal', title: this.$t('dashBoardV2.Table.pubSea'), align: 'left', width: '100' },
                ],
                // 【待处理whatsapp会话】whatsapp在线号码列表
                whatsappList: [
                    // {
                    //     contactCount: 24,
                    //     whatsappAccount: '8618612012113'
                    // },
                    // {
                    //     contactCount: 24,
                    //     whatsappAccount: '8618612012113'
                    // }
                ],
                langList: {
                    commonParams: {
                        userName: this.$t('dashBoardV2.Table.saleName'),
                        counts: this.$t('dashBoardV2.Table.total'),
                        departmentName: this.$t('dashBoardV2.Table.departmentName'),
                        empty: this.$t('dashBoardV2.Table.empty'),
                        closed: this.$t('dashBoardV2.Table.closed')
                    },
                    // 来源方式
                    sourceModeParams: [
                        { id: 23, title: this.$t('dashBoardV2.Table.directCreated') },
                        { id: 24, title: this.$t('dashBoardV2.Table.websitechat') },
                        { id: 25, title: this.$t('dashBoardV2.Table.websiteMessage') },
                        { id: 26, title: this.$t('dashBoardV2.Table.facebookChat') },
                        { id: 27, title: this.$t('dashBoardV2.Table.facebookComment') },
                        { id: 28, title: this.$t('dashBoardV2.Table.facebookLeads') },
                        { id: 29, title: this.$t('dashBoardV2.Table.exhibition') },
                        { id: 30, title: this.$t('dashBoardV2.Table.instagramChat') },
                        { id: 31, title: this.$t('dashBoardV2.Table.instagramComment') },
                        { id: 32, title: this.$t('dashBoardV2.Table.websiteOrder') },
                        { id: -1, title: this.$t('dashBoardV2.Table.empty') }
                    ],
                    // 跟进状态
                    FollowUpStatus: [
                        { id: 0, title: this.$t('dashBoardV2.Table.inquiry') },
                        { id: -1, title: this.$t('dashBoardV2.Table.closed') }
                    ],
                    // 处理状态
                    status: [
                        { id: 1, title: this.$t('dashBoardV2.Table.pending') },
                        { id: 2, title: this.$t('dashBoardV2.Table.spam') },
                        { id: 3, title: this.$t('dashBoardV2.Table.inquiry') },
                        { id: 4, title: this.$t('dashBoardV2.Table.followingUp') },
                        { id: 5, title: this.$t('dashBoardV2.Table.done') },
                        { id: -1, title: this.$t('dashBoardV2.Table.closed') }
                    ]
                },

                // 顶部导航
                childNavLinkText: '',
                // 表格筛选条件
                tableFilterConObj: {}
            };
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                orgId: state => state.enterpriseId,
                userName: state => state.userName
            }),
            ...mapGetters(['isContainsMenu']),
            pageSize() {
                if (this.filterParameters.levelType === 'department') {
                    return 2000;
                }
                return 20;
            },
            tableColumns() {
                if (this.filterParameters.levelType === 'department') {
                    return this.departmentTableColumns;
                }
                return this.personTableColumns;
            },
            tableHeight() {
                if (this.from) {
                    return '440px';
                }

                switch (this.kind) {
                    case 'completion':
                        return '236px';
                    case 'visitorAnalysis':
                    case 'visitTrafficAnalysis':
                    case 'msgStatusStatistics':
                    case 'msgPageStatus':
                        return '255px';
                    case 'serviceWorkStatus':
                        return '430px';
                    case 'googleMarketing':
                        return '380px';
                    default:
                        return '280px';
                }
            }
        },
        filters: {
            formatNumWithCommas
        },
        methods: {
            // 指定表格行 class name
            // getRowClassName({ row, rowIndex }) {
            //     row.index = rowIndex;
            //     if (rowIndex % 3 === 0) {
            //         return 'one_row_cls';
            //     } else if (rowIndex % 3 === 1) {
            //         return 'two_row_cls';
            //     } else if (rowIndex % 3 === 2) {
            //         return 'three_row_cls';
            //     }
            //     return '';
            // },
            setSpanMethod() {
                const rowOneData = [];
                // const rowTwoData = [];
                let rowOne = 0;
                // let rowTwo = 0;
                this.tableData.forEach((item, index) => {
                    if (index === 0) {
                        rowOneData.push(1);
                        // rowTwoData.push(1);
                    } else {
                        if (item.firstDepartmentId === this.tableData[index - 1].firstDepartmentId) {
                            rowOneData[rowOne] += 1;
                            rowOneData.push(0);
                        } else {
                            rowOneData.push(1);
                            rowOne = index;
                        }
                        // if (item.secondDepartmentId && (item.secondDepartmentId === this.tableData[index - 1].secondDepartmentId)) {
                        //     rowTwoData[rowTwo] += 1;
                        //     rowTwoData.push(0);
                        // } else {
                        //     rowTwoData.push(1);
                        //     rowTwo = index;
                        // }
                    }
                });
                return {
                    one: rowOneData
                    // two: rowTwoData
                };
            },
            // arraySpanMethod({ row, column, rowIndex, columnIndex }) {
            //     if (this.filterParameters.levelType === 'person') {
            //         if (columnIndex === 0) {
            //             const _row = (this.setSpanMethod().one)[rowIndex];
            //             const _col = _row > 0 ? 1 : 0;
            //             return {
            //                 rowspan: _row,
            //                 colspan: _col
            //             };
            //         }
            //     }
            // },
            objectSpanMethod({ row, column, rowIndex, columnIndex }) {
                // 如果是"客服工作状态"表格, 且需要显示次维度, 则合并第一列
                if (this.kind === 'serviceWorkStatus' && this.filterParameters.secondDimension) {
                    if (columnIndex === 0) {
                        return {
                            rowspan: Number.isInteger(row.rowspan) ? row.rowspan : 1,
                            colspan: 1
                        };
                    }
                }
                // 如果是营销转化表，则需要合并三列
                if (this.kind === 'googleMarketing') {
                    // 第一列跨三行，其他列不跨
                    if (columnIndex === 0 || columnIndex === 1) {
                        if (rowIndex % 3 === 0) {
                            return {
                                rowspan: 3,
                                colspan: 1
                            };
                        } else {
                            return {
                                rowspan: 0,
                                colspan: 0
                            };
                        }
                    }
                }

                // 默认返回不合并
                return {
                    rowspan: 1,
                    colspan: 1
                };

            },
            gooleSpanMethod({ row, column, rowIndex, columnIndex }) {
                // 如果是营销转化表，则需要合并三列
                if (this.kind === 'googleMarketing') {
                    // 第一列跨三行，其他列不跨
                    if (columnIndex === 0 || columnIndex === 1) {
                        if (rowIndex % 3 === 0) {
                            return {
                                rowspan: 3,
                                colspan: 1
                            };
                        } else {
                            return {
                                rowspan: 0,
                                colspan: 0
                            };
                        }
                    }
                } else {
                    // 其他列不跨
                    return {
                        rowspan: 1,
                        colspan: 1
                    };
                }
            },
            renderHeader_filter(colIndex) {
                return h => {
                    const column = this.tableColumns[colIndex];
                    if (!column) {
                        return h('span', '');
                    }

                    const title = h('span', {
                        attrs: {
                            title: column.title
                        },
                        title: column.title
                    }, column.title);
                    return h('span', {}, [title]);
                };
            },
            loadData() {
                if (!this.loading) {
                    if (this.pageNo >= this.totalPage) return;
                    this.pageNo++;
                    this.getData('loadData');
                }
            },
            getData(type) {
                const vm = this;
                this.loading = true;
                if (typeof this.cancelFunc === 'function' && !type) {
                    this.cancelFunc();
                }
                const cancelToken = new this.$util.axios.CancelToken(function executor(c) {
                    // An executor function receives a cancel function as a parameter
                    vm.cancelFunc = c;
                });
                // this.tableData = [];
                switch (this.kind) {
                    case 'completion':
                        this.getCompletionData(cancelToken);
                        break;
                    case 'focusedInquiry':
                        this.getFocusedInquiyData(cancelToken);
                        break;
                    case 'employeeResources':
                        this.getEmployeeResourcesData(cancelToken);
                        break;
                    case 'todoList':
                        this.getTodoListData(cancelToken);
                        break;
                    case 'inquiryDistribution':
                        this.getInquiryData(type, cancelToken);
                        break;
                    case 'companyDistribution':
                        this.getCompanyData(type, cancelToken);
                        break;
                    case 'clueDistribution':
                        this.getClueData(type, cancelToken);
                        break;
                    case 'visitorAnalysis':
                    case 'visitTrafficAnalysis':
                        this.getVisitorAnalysisData(cancelToken);
                        break;
                    case 'msgStatusStatistics':
                        this.getMsgStatusStatisticsData(cancelToken);
                        break;
                    case 'msgPageStatus':
                        this.getMsgPageStatusData(cancelToken);
                        break;
                    case 'serviceWorkStatus':
                        this.getServiceWorkStatusData(cancelToken);
                        break;
                    case 'googleMarketing':
                        this.getGoogleDashBoardData(cancelToken);
                        break;
                }
            },
            getGoogleDashBoardData(cancelToken) {
                getGoogleDashBoard({
                    startDate: this.$dym.timeFormat(this.filterParameters.dateRange[0]),
                    endDate: this.$dym.timeFormat(this.filterParameters.dateRange[1]),
                    orgId: this.orgId,
                    // orgId: '10135',
                    campaignId: this.filterParameters.campaignId,
                    pageSize: this.pageSize,
                    pageNo: this.pageNo,
                    currency: this.currentCurrency
                }, cancelToken).then(res => {
                    if (res.code === '1') {
                        this.totalPage = res.data.total ? Math.ceil(res.data.total / this.pageSize) : 1;
                        this.tableData = this.tableData.concat(res.data.list);
                    } else {
                        this.$message.error(res.message);
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                });
            },
            getCompletionData(cancelToken) {
                getPerformanceTargetsNew({
                    currency: this.currentCurrency,
                    dimensionType: this.filterParameters.levelType === 'department' ? 1 : 2,
                    startDate: this.$dym.timeFormat(this.filterParameters.dateRange[0]),
                    endDate: this.$dym.timeFormat(this.filterParameters.dateRange[1]),
                    orgId: this.orgId,
                    userId: this.userId,
                    year: new Date(this.filterParameters.dateRange[0]).getFullYear(),
                    targetType: this.filterParameters.targetType,
                    userIdList: this.filterParameters.userIdList.length ? JSON.stringify(this.filterParameters.userIdList) : '',
                    departmentId: this.filterParameters.departmentId,
                    pageSize: this.pageSize,
                    pageNo: this.pageNo
                }, cancelToken).then(res => {
                    if (res.code === '1') {
                        this.totalPage = res.data.total ? Math.ceil(res.data.total / this.pageSize) : 1;
                        this.tableData = this.tableData.concat(res.data.list);
                        // this.tableData = res.data.list;
                    } else {
                        this.$message.error(res.message);
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                });
            },
            getFocusedInquiyData(cancelToken) {
                getInquiryMarker({
                    currency: this.currentCurrency,
                    dimensionType: this.filterParameters.levelType === 'department' ? 1 : 2,
                    startDate: this.$dym.timeFormat(this.filterParameters.dateRange[0]),
                    endDate: this.$dym.timeFormat(this.filterParameters.dateRange[1]),
                    orgId: this.orgId,
                    userId: this.userId,
                    year: new Date(this.filterParameters.dateRange[0]).getFullYear(),
                    targetType: this.filterParameters.targetType,
                    userIdList: this.filterParameters.userIdList.length ? JSON.stringify(this.filterParameters.userIdList) : '',
                    departmentId: this.filterParameters.departmentId,
                    pageSize: this.pageSize,
                    pageNo: this.pageNo
                }, cancelToken).then(res => {
                    if (res.code === '1') {
                        this.totalPage = res.data.total ? Math.ceil(res.data.total / this.pageSize) : 1;
                        this.tableData = this.tableData.concat(res.data.list);
                        // this.tableData = res.data.list;
                    } else {
                        this.$message.error(res.message);
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                });
            },
            getEmployeeResourcesData(cancelToken) {
                getStaffResourceStat({
                    currency: this.currentCurrency,
                    dimensionType: this.filterParameters.levelType === 'department' ? 1 : 2,
                    startDate: this.$dym.timeFormat(this.filterParameters.dateRange[0]),
                    endDate: this.$dym.timeFormat(this.filterParameters.dateRange[1]),
                    orgId: this.orgId,
                    userId: this.userId,
                    year: new Date(this.filterParameters.dateRange[0]).getFullYear(),
                    targetType: this.filterParameters.targetType,
                    userIdList: this.filterParameters.userIdList.length ? JSON.stringify(this.filterParameters.userIdList) : '',
                    departmentId: this.filterParameters.departmentId,
                    pageSize: this.pageSize,
                    pageNo: this.pageNo
                }, cancelToken).then(res => {
                    if (res.code === '1') {
                        this.totalPage = res.data.total ? Math.ceil(res.data.total / this.pageSize) : 1;
                        this.tableData = this.tableData.concat(res.data.list);
                        // this.tableData = res.data.list;
                    } else {
                        this.$message.error(res.message);
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                });
            },
            getTodoListData(cancelToken) {
                // 员工代办
                getStaffToDoList({
                    dimensionType: this.filterParameters.levelType === 'department' ? 1 : 2,
                    startDate: this.$dym.timeFormat(this.filterParameters.dateRange[0]),
                    endDate: this.$dym.timeFormat(this.filterParameters.dateRange[1]),
                    departmentId: this.filterParameters.departmentId,
                    userIdList: this.filterParameters.userIdList.length ? JSON.stringify(this.filterParameters.userIdList) : '',
                    orgId: this.orgId,
                    userId: this.userId,
                    pageSize: this.pageSize,
                    pageNo: this.pageNo,
                    admin: 1
                }, cancelToken).then(res => {
                    // 请求成功, 处理数据
                    if (res.code === '1') {
                        // 滚动加载前记录表格当前 scrollTop , 滚动加载完毕后重置回之前的 scrollTop , 避免页面回到顶部
                        if (this.$refs.tableCard) {
                            this.$refs.tableCard.keepOffset();
                        }

                        this.tableData = this.tableData.concat(res.data.list);
                        this.totalPage = res.data.total ? Math.ceil(res.data.total / this.pageSize) : 1;
                    } else {
                        this.$message.error(res.message);
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                });
            },
            /**
             * 获取询盘列表数
             * @param type 类型
             * @param cancelToken 取消请求
            */
            getInquiryData(type, cancelToken) {
                if (!type) {
                    this.departmentTableColumns = [];
                    this.personTableColumns = [];
                }
                // 綫索的分布获取列表数据
                getInquiryDistribution({
                    dimensionType: this.filterParameters.levelType === 'department' ? 1 : 2,
                    startDate: this.$dym.timeFormat(this.filterParameters.dateRange[0]),
                    endDate: this.$dym.timeFormat(this.filterParameters.dateRange[1]),
                    departmentId: this.filterParameters.departmentId,
                    userIdList: this.filterParameters.userIdList.length ? JSON.stringify(this.filterParameters.userIdList) : '',
                    orgId: this.orgId,
                    userId: this.userId,
                    pageSize: 20,
                    pageNo: this.pageNo,
                    typeId: this.filterParameters.typeId
                }, cancelToken || '').then(res => {
                    // 请求成功, 处理数据
                    if (res.code === '1') {
                        // 滚动加载前记录表格当前 scrollTop , 滚动加载完毕后重置回之前的 scrollTop , 避免页面回到顶部
                        if (this.$refs.tableCard) {
                            this.$refs.tableCard.keepOffset();
                        }
                        if (!type) {
                            if (this.filterParameters.levelType === 'department') {
                                this.departmentTableColumns = res.data.attr;
                            } else {
                                this.personTableColumns = res.data.attr;
                            }
                            res.data.attr.map(item => {
                                if (item.key !== 'userName' && item.key !== 'departmentName') {
                                    this.canJumpField.inquiryDistribution.push(item.key);
                                    // 来源方式预设字段需要翻译
                                    // if (this.filterParameters.typeId === 10) {
                                    //     const langItem = this.langList.sourceModeParams.find(v => v.id / 1 === item.key / 1);
                                    //     item.title = langItem ? langItem.title : item.title;
                                    // }
                                    // // 跟进状态预设字段需要翻译
                                    // if (this.filterParameters.typeId === 7) {
                                    //     const langItem = this.langList.FollowUpStatus.find(v => v.id / 1 === item.key / 1);
                                    //     item.title = langItem ? langItem.title : item.title;
                                    // }
                                    if (item.key === 'counts') {
                                        item.title = this.langList.commonParams.counts;
                                    }
                                    if (item.key === '-1') {
                                        // 如果是跟进状态筛选，-1就代表关闭询盘
                                        if (this.filterParameters.typeId === 7) {
                                            item.title = this.langList.commonParams.closed;
                                        } else {
                                            item.title = this.langList.commonParams.empty;
                                        }

                                    }
                                } else {
                                    item.title = this.langList.commonParams[item.key];
                                }
                            });
                            this.tableColumns = this.tableColumns.map((col, index) => {
                                col.renderHeader = this.renderHeader_filter(index);
                                return col;
                            });
                        }
                        this.tableData = this.tableData.concat(res.data.list);
                        this.totalPage = res.data.total ? Math.ceil(res.data.total / this.pageSize) : 1;
                    } else {
                        this.personTableColumns = [];
                        this.departmentTableColumns = [];
                        this.$message.error(res.message);
                    }
                    this.loading = false;
                }).catch(() => {
                    this.personTableColumns = [];
                    this.departmentTableColumns = [];
                    this.loading = false;
                });
            },
            getCompanyData(type, cancelToken) {
                if (!type) {
                    this.personTableColumns = [];
                    this.departmentTableColumns = [];
                }
                // 綫索的分布获取列表数据
                getCompanyDistribution({
                    dimensionType: this.filterParameters.levelType === 'department' ? 1 : 2,
                    startDate: this.$dym.timeFormat(this.filterParameters.dateRange[0]),
                    endDate: this.$dym.timeFormat(this.filterParameters.dateRange[1]),
                    departmentId: this.filterParameters.departmentId,
                    userIdList: this.filterParameters.userIdList.length ? JSON.stringify(this.filterParameters.userIdList) : '',
                    orgId: this.orgId,
                    userId: this.userId,
                    pageSize: 20,
                    pageNo: this.pageNo,
                    typeId: this.filterParameters.typeId
                }, cancelToken || '').then(res => {
                    // 请求成功, 处理数据
                    if (res.code === '1') {
                        // 滚动加载前记录表格当前 scrollTop , 滚动加载完毕后重置回之前的 scrollTop , 避免页面回到顶部
                        if (this.$refs.tableCard) {
                            this.$refs.tableCard.keepOffset();
                        }
                        if (!type) {
                            if (this.filterParameters.levelType === 'department') {
                                this.departmentTableColumns = res.data.attr;
                            } else {
                                this.personTableColumns = res.data.attr;
                            }
                            // this.tableColumns = res.data.attr;
                            res.data.attr.map(item => {
                                if (item.key !== 'userName' && item.key !== 'departmentName') {
                                    this.canJumpField.companyDistribution.push(item.key);
                                    if (item.key === 'counts') {
                                        item.title = this.langList.commonParams.counts;
                                    }
                                    if (item.key === '-1') {
                                        item.title = this.langList.commonParams.empty;
                                    }
                                } else {
                                    item.title = this.langList.commonParams[item.key];
                                }
                            });
                            this.tableColumns = this.tableColumns.map((col, index) => {
                                col.renderHeader = this.renderHeader_filter(index);
                                return col;
                            });
                        }
                        this.tableData = this.tableData.concat(res.data.list);
                        this.totalPage = res.data.total ? Math.ceil(res.data.total / this.pageSize) : 1;
                    } else {
                        this.personTableColumns = [];
                        this.departmentTableColumns = [];
                        this.$message.error(res.message);
                    }
                    this.loading = false;
                }).catch(() => {
                    this.personTableColumns = [];
                    this.departmentTableColumns = [];
                    this.loading = false;
                });
            },
            getClueData(type, cancelToken) {
                if (!type) {
                    this.personTableColumns = [];
                    this.departmentTableColumns = [];
                }
                // 綫索的分布获取列表数据
                getClueDistribution({
                    dimensionType: this.filterParameters.levelType === 'department' ? 1 : 2,
                    startDate: this.$dym.timeFormat(this.filterParameters.dateRange[0]),
                    endDate: this.$dym.timeFormat(this.filterParameters.dateRange[1]),
                    departmentId: this.filterParameters.departmentId,
                    userIdList: this.filterParameters.userIdList.length ? JSON.stringify(this.filterParameters.userIdList) : '',
                    orgId: this.orgId,
                    userId: this.userId,
                    pageSize: 20,
                    pageNo: this.pageNo,
                    typeId: this.filterParameters.typeId
                }, cancelToken || '').then(res => {
                    // 请求成功, 处理数据
                    if (res.code === '1') {
                        // 滚动加载前记录表格当前 scrollTop , 滚动加载完毕后重置回之前的 scrollTop , 避免页面回到顶部
                        if (this.$refs.tableCard) {
                            this.$refs.tableCard.keepOffset();
                        }
                        if (!type) {
                            if (this.filterParameters.levelType === 'department') {
                                this.departmentTableColumns = res.data.attr;
                            } else {
                                this.personTableColumns = res.data.attr;
                            }
                            // this.tableColumns = res.data.attr;
                            res.data.attr.map(item => {
                                if (item.key !== 'userName' && item.key !== 'departmentName') {
                                    this.canJumpField.clueDistribution.push(item.key);
                                    // 来源方式预设字段需要翻译
                                    // if (this.filterParameters.typeId === 10) {
                                    //     const langItem = this.langList.sourceModeParams.find(v => v.id / 1 === item.key / 1);
                                    //     item.title = langItem ? langItem.title : item.title;
                                    // }
                                    // // 跟进状态预设字段需要翻译
                                    // if (this.filterParameters.typeId === 7) {
                                    //     const langItem = this.langList.FollowUpStatus.find(v => v.id / 1 === item.key / 1);
                                    //     item.title = langItem ? langItem.title : item.title;
                                    // }
                                    // // 处理状态预设字段需要翻译
                                    // if (this.filterParameters.typeId === 3) {
                                    //     const langItem = this.langList.status.find(v => v.id / 1 === item.key / 1);
                                    //     item.title = langItem ? langItem.title : item.title;
                                    // }
                                    if (item.key === 'counts') {
                                        item.title = this.langList.commonParams.counts;
                                    }
                                    if (item.key === '-1') {
                                        item.title = this.langList.commonParams.empty;
                                    }
                                } else {
                                    item.title = this.langList.commonParams[item.key];
                                }
                            });
                            this.tableColumns = this.tableColumns.map((col, index) => {
                                col.renderHeader = this.renderHeader_filter(index);
                                return col;
                            });
                        }
                        this.tableData = this.tableData.concat(res.data.list);
                        this.totalPage = res.data.total ? Math.ceil(res.data.total / this.pageSize) : 1;
                    } else {
                        this.personTableColumns = [];
                        this.departmentTableColumns = [];
                        this.$message.error(res.message);
                    }
                    this.loading = false;
                }).catch(() => {
                    this.personTableColumns = [];
                    this.departmentTableColumns = [];
                    this.loading = false;
                });
            },
            // 访客分析/访问人次分析 的 动态筛选条件计算
            handleVisitorAnalysisFilterCon() {
                const result = {};

                // 表格类型 1. 访客分析, 2. 访问人次分析
                switch (this.kind) {
                    case 'visitorAnalysis':
                        result.searchIndex = 1;
                        break;
                    case 'visitTrafficAnalysis':
                        result.searchIndex = 2;
                        break;
                }

                // 处理 searchType 参数, 需要配合子级筛选条件处理
                // 参数: searchType 参数代表分组; searchType 值作为属性名时, 它的值是筛选条件
                // (比如, searchType 为 country , 按国家分组, 此为一级筛选; 若进行二级筛选, 穿透到城市, searchType 变为 city, 增加 postData['country'], 值传'中国', 则是筛选中国的城市)
                let searchType = '';
                // 子级筛选时, 父级筛选条件 --- 导出时用, 筛选数据接口不需要它
                let parentSearchType = '';
                // 子级筛选时, 特殊表头字段处理
                let newDimensionFieldKey = '';
                const {
                    typeId,
                    childFilterVal
                } = this.filterParameters;
                if (childFilterVal) {
                    switch (typeId) {
                        case 'browser':
                        case 'screenResolution':
                        case 'hour':
                        case 'firstVisitUrl':
                        case 'lang':
                            break;
                        // 上述为不参与子级筛选内容的 case
                        case 'trafficSourceMerge':
                            // 确定一级筛选条件
                            result.trafficSourceMerge = `${childFilterVal}`;
                            parentSearchType = 'trafficSourceMerge';
                            switch (`${childFilterVal}`) {
                                case '1':
                                case '2':
                                case '3':
                                case '9':
                                    // Google 广告; Fb 广告; 其他广告; yandex 广告 --- 显示"广告系列"
                                    searchType = 'campaignName';
                                    break;
                                case '4':
                                case '8':
                                    // 电子邮件营销; 直接访问 --- 不可穿透
                                    break;
                                case '5':
                                    // 搜索引擎
                                    searchType = 'refererName';
                                    newDimensionFieldKey = 'searchEngine';
                                    break;
                                case '6':
                                    // 社交网络
                                    searchType = 'refererName';
                                    newDimensionFieldKey = 'socialNetwork';
                                    break;
                                case '7':
                                    // 其他引荐流量
                                    searchType = 'refererName';
                                    newDimensionFieldKey = 'otherReferralTraffic';
                                    break;
                                case '10':
                                    // 智能物料
                                    searchType = 'trafficSource';
                                    newDimensionFieldKey = 'smartMaterial';
                                    break;
                                default:
                                    // 默认仍显示"流量来源"
                                    searchType = 'trafficSourceMerge';
                            }
                            break;
                        // 上述为参与子级筛选, 且 searchType 与 typeId 一致的 case
                        case 'country':
                            searchType = 'city';
                            parentSearchType = 'country';
                            result[typeId] = this.filterParameters.childFilterVal;
                            break;
                        case 'deviceType':
                            searchType = 'osInfo';
                            parentSearchType = 'deviceType';
                            result[typeId] = this.filterParameters.childFilterVal;
                            break;
                        // 上述为参与子级筛选, 且 searchType 与 typeId 不一致, 需要特殊处理的 case
                    }
                } else {
                    // 没有子级筛选值, searchType 即为一级筛选条件
                    searchType = typeId;
                }
                // 赋值 result.searchType
                if (searchType) {
                    result.searchType = searchType;
                }
                if (parentSearchType) {
                    result.parentSearchType = parentSearchType;
                }
                // 处理表格字段配置 - 表头文字显示
                newDimensionFieldKey = newDimensionFieldKey || searchType;

                const dimensionField = this.personTableColumns.find(item => item.dynamicFieldType === 'dimension');
                // 如果统计维度字段与当前的筛选条件不一致, 则需要重新设置表格字段配置
                if (dimensionField && dimensionField.dynamicFieldKey !== newDimensionFieldKey) {
                    this.personTableColumns = this.personTableColumns.map(item => {
                        if (item === dimensionField) {
                            item.dynamicFieldKey = newDimensionFieldKey;
                            item.title = this.$t(`dashBoardV2.Table.visitAnalysisFields.${newDimensionFieldKey}`);
                        }
                        return item;
                    });
                    this.showTable = false;
                    this.$nextTick(() => {
                        this.tableColumns = this.tableColumns.map((col, index) => {
                            // 如果当前显示维度是"访问时段", 则需要特殊处理维度列排序方法
                            if (col.key === 'keyName') {
                                if (result.searchType === 'hour') {
                                    col.sortMethod = (a, b) => {
                                        const aHour = parseInt(a.keyName);
                                        const bHour = parseInt(b.keyName);
                                        return aHour - bHour;
                                    };
                                } else {
                                    delete col.sortMethod;
                                }
                            }
                            col.renderHeader = this.renderHeader_filter(index);
                            return col;
                        });
                        this.showTable = true;
                    });
                }

                return result;
            },
            getVisitorAnalysisData(cancelToken) {
                // 请求参数
                const postData = Object.assign({
                    orgId: this.orgId,
                    userId: this.userId,
                    siteId: this.filterParameters.siteId,
                    startDate: `${this.$dym.timeFormat(this.filterParameters.dateRange[0])} 00:00:00`,
                    endDate: `${this.$dym.timeFormat(this.filterParameters.dateRange[1])} 23:59:59`,
                    pageSize: 20,
                    pageNo: this.pageNo
                }, this.handleVisitorAnalysisFilterCon());

                // 发送请求
                getVisitorStatisticsData(postData, cancelToken || '').then(res => {
                    // 请求成功, 处理数据
                    if (res.code === '1') {
                        this.tableFilterConObj = postData;
                        this.tableData = Array.isArray(res.data) ? res.data.map(item => {
                            if (!item.keyName) {
                                item.keyName = item.key || this.$t('dashBoardV2.Table.unknown');
                            }
                            return item;
                        }) : [];
                    } else {
                        this.tableFilterConObj = {};
                        this.tableData = [];
                        this.$message.error(res.message);
                    }
                    this.loading = false;
                }).catch(() => {
                    this.tableFilterConObj = {};
                    this.tableData = [];
                    this.loading = false;
                });
            },
            getMsgStatusStatisticsData(cancelToken) {
                // 请求参数
                const postData = {
                    orgId: this.orgId,
                    userId: this.userId,
                    searchType: 'templateId',
                    startDate: `${this.$dym.timeFormat(this.filterParameters.dateRange[0])} 00:00:00`,
                    endDate: `${this.$dym.timeFormat(this.filterParameters.dateRange[1])} 23:59:59`,
                    pageSize: 20,
                    pageNo: this.pageNo
                };

                // 发送请求
                getMsgStatusData(postData, cancelToken || '').then(res => {
                    // 请求成功, 处理数据
                    if (res.code === '1') {
                        this.tableFilterConObj = postData;
                        this.tableData = Array.isArray(res.data) ? this.handleMsgStatusData(res.data) : [];
                    } else {
                        this.tableFilterConObj = {};
                        this.tableData = [];
                        this.$message.error(res.message);
                    }
                    this.loading = false;
                }).catch(() => {
                    this.tableFilterConObj = {};
                    this.tableData = [];
                    this.loading = false;
                });
            },
            handleMsgStatusData(arr) {
                // 初始化数据
                const defaultData = {};
                [1, 101, 102, 100, 103].forEach(status => {
                    defaultData[`status_${status}`] = 0;
                });

                return arr.map(item => {
                    const result = Object.assign({}, defaultData, item);
                    if (Array.isArray(item.statusList)) {
                        item.statusList.forEach(statusItem => {
                            result[`status_${statusItem.key}`] = statusItem.value;
                        });
                    }

                    return result;
                });
            },
            getMsgPageStatusData(cancelToken) {
                // 请求参数
                const postData = {
                    orgId: this.orgId,
                    userId: this.userId,
                    searchType: 'currentPage',
                    templateId: this.filterParameters.formId,
                    startDate: `${this.$dym.timeFormat(this.filterParameters.dateRange[0])} 00:00:00`,
                    endDate: `${this.$dym.timeFormat(this.filterParameters.dateRange[1])} 23:59:59`,
                    pageSize: 20,
                    pageNo: this.pageNo
                };

                // 发送请求
                getMsgPageStatusData(postData, cancelToken || '').then(res => {
                    // 请求成功, 处理数据
                    if (res.code === '1') {
                        this.tableFilterConObj = postData;
                        this.tableData = Array.isArray(res.data) ? res.data : [];
                    } else {
                        this.tableFilterConObj = {};
                        this.tableData = [];
                        this.$message.error(res.message);
                    }
                    this.loading = false;
                }).catch(() => {
                    this.tableFilterConObj = {};
                    this.tableData = [];
                    this.loading = false;
                });
            },
            handleServiceWorkStatusFilterCon() {
                const result = {};

                // 处理 searchType
                const dimensionKeyArr = [];
                // 主维度
                const firstDimensionKey = this.filterParameters.firstDimension;
                let secondDimensionKey = '';
                dimensionKeyArr.push(firstDimensionKey);
                // 是否显示次维度
                if (this.filterParameters.secondDimension) {
                    secondDimensionKey = this.filterParameters.secondDimension;
                    dimensionKeyArr.push(this.filterParameters.secondDimension);
                }
                // 赋值 searchType
                result.searchType = dimensionKeyArr.join('_');

                // 处理 csId(客服 id)
                if (this.filterParameters.serviceId) {
                    result.csId = this.filterParameters.serviceId;
                }

                // 处理表格字段配置
                // 取最原始的全部表格字段
                const allColumns = this.tableHeader[this.kind].personTableColumns;
                // 取统计维度字段
                const firstDimensionField = allColumns.find(item => item.dynamicFieldType === 'firstDimension');
                const secondDimensionField = allColumns.find(item => item.dynamicFieldType === 'secondDimension');
                // 不判断当前显示字段与最新筛选条件是否一致了, 直接按最新筛选条件重新设置表格字段配置
                this.personTableColumns = allColumns.map(item => {
                    if (item === firstDimensionField) {
                        item.dynamicFieldKey = firstDimensionKey;
                        item.title = this.$t(`dashBoardV2.Table.serviceWorkStatusFields.${firstDimensionKey}`);
                    }
                    if (item === secondDimensionField) {
                        item.dynamicFieldKey = secondDimensionKey;
                        item.title = this.$t(`dashBoardV2.Table.serviceWorkStatusFields.${secondDimensionKey}`);
                    }
                    return item;
                }).filter(item => {
                    // 如果不要求显示次维度, 则去掉次维度字段
                    if (!secondDimensionKey && item.dynamicFieldType === 'secondDimension') {
                        return false;
                    }
                    return true;
                });
                this.showTable = false;
                this.$nextTick(() => {
                    this.tableColumns = this.tableColumns.map((col, index) => {
                        col.renderHeader = this.renderHeader_filter(index);
                        return col;
                    });
                    this.showTable = true;
                });

                return result;
            },
            getServiceWorkStatusData(cancelToken) {
                // 请求参数
                const postData = Object.assign({
                    orgId: this.orgId,
                    userId: this.userId,
                    startDate: `${this.$dym.timeFormat(this.filterParameters.dateRange[0])} 00:00:00`,
                    endDate: `${this.$dym.timeFormat(this.filterParameters.dateRange[1])} 23:59:59`,
                    pageSize: 20,
                    pageNo: this.pageNo
                }, this.handleServiceWorkStatusFilterCon());

                // 发送请求
                getServiceWorkData(postData, cancelToken || '').then(res => {
                    // 请求成功, 处理数据
                    if (res.code === '1') {
                        this.tableFilterConObj = postData;
                        this.tableData = this.handleServiceWorkStatusData(res.data);
                    } else {
                        this.tableFilterConObj = {};
                        this.tableData = [];
                        this.$message.error(res.message);
                    }
                    this.loading = false;
                }).catch(() => {
                    this.tableFilterConObj = {};
                    this.tableData = [];
                    this.loading = false;
                });
            },
            handleServiceWorkStatusData(arr) {
                // 非数组, 直接返回空数组
                if (!Array.isArray(arr)) {
                    return [];
                }

                // 初始化数据
                const result = [];
                arr.forEach(item => {
                    // 如果没有子数据, 则直接返回当前遍历项
                    if (!Array.isArray(item.customerServiceDateList)) {
                        if (!item.keyName) {
                            item.keyName = item.key;
                        }

                        result.push(item);
                        return;
                    }

                    // 否则, 遍历子数据, 加入 父-子1, 父-子2... 到 result
                    const rowspan = item.customerServiceDateList.length;
                    item.customerServiceDateList.forEach((childItem, childItemIndex) => {
                        result.push(Object.assign({}, item, childItem, {
                            key: item.key,
                            keyName: item.keyName || item.key,
                            subKey: childItem.key,
                            subKeyName: childItem.keyName || childItem.key,
                            rowspan: childItemIndex === 0 ? rowspan : 0
                        }));
                    });
                });

                // 格式化在线时长(分钟)
                result.forEach(item => {
                    item.onlineDuration = item.onlineDuration || 0;
                    item.onlineDuration = [item.onlineDuration / 60, item.onlineDuration % 60].map((num, index) => {
                        let tmp = Math.floor(num);
                        tmp = tmp < 10 ? `0${tmp}` : tmp;
                        return tmp;
                    }).join(':');
                });

                return result;
            },

            // 询盘分布、客户分布跳转
            async jumpToPageList(key, title, row) {
                switch (this.kind) {
                    case 'inquiryDistribution':
                        // 跳转询盘 跳转之前先鉴权
                        if (this.isContainsMenu('myInquiry')) {
                            // 跳转
                            const config = [
                                ['createTime', this.filterParameters.dateRange]
                            ];
                            // 如果是部门维度查询的，需要获取部门下的所有人下钻到线索页面
                            if (this.filterParameters.levelType === 'department') {
                                if (row.firstDepartmentId !== 0) {
                                    const createUser = [];
                                    row.userIdList.forEach(item => {
                                        createUser.push({ label: item.fullName, value: item.id });
                                    });
                                    config.push(['inquiryManagers', createUser]);
                                }
                            } else {
                                config.push(['inquiryManagers', [{ label: row.userName, value: row.id }]]);
                            }
                            console.log(this.tableColumns);
                            // 合计字段跳转到线索列表的时候不携带表头筛选条件
                            if (key !== 'counts') {
                                switch (this.filterParameters.typeId) {
                                    case 7: // 跟进状态
                                        config.push(['followUp', [{ label: title, value: key / 1 }]]);
                                        break;
                                    case 5: // 询盘等级
                                        config.push(['grouping', [{ label: title, value: key / 1 === -1 ? null : title }]]);
                                        break;
                                    case 10: // 来源方式
                                        config.push(['sourceWay', [{ label: title, value: key / 1 === -1 ? null : title }]]);
                                        break;
                                    case 6: // 来源渠道
                                        config.push(['sourceChannel', [{ label: title, value: key / 1 === -1 ? null : title }]]);
                                        break;
                                }
                            } else {
                                const configArrCommon = [];
                                const configArr = [];
                                this.tableColumns.map(res => {
                                    if (res.key !== 'userName' && res.key !== 'counts' && res.key !== 'departmentName') {
                                        configArrCommon.push({ label: res.title, value: res.key / 1 === -1 ? null : res.title });
                                    }
                                });
                                switch (this.filterParameters.typeId) {
                                    case 7: // 跟进状态
                                        this.tableColumns.map(res => {
                                            if (res.key !== 'userName' && res.key !== 'counts' && res.key !== 'departmentName') {
                                                configArr.push({ label: res.title, value: res.key / 1 });
                                            }
                                        });
                                        config.push(['followUp', configArr]);
                                        break;
                                    case 5: // 询盘等级
                                        config.push(['grouping', configArrCommon]);
                                        break;
                                    case 10: // 来源方式
                                        config.push(['sourceWay', configArrCommon]);
                                        break;
                                    case 6: // 来源渠道
                                        config.push(['sourceChannel', configArrCommon]);
                                        break;
                                }
                            }
                            localStorage.setItem('dashboard_inquiry_filters', JSON.stringify(config));
                            // config.push(['followUp', [{ label: '询盘', value: 0 }]]); // 跟进状态
                            // config.push(['sourceWay', [{ label: '哈哈哈', value: 0 }]]); // 来源方式
                            // config.push(['sourceChannel', [{ label: '哈哈哈', value: 0 }]]); // 来源渠道

                            this.$stm.openNewWindow(this.$router.resolve({
                                name: 'myInquiry'
                            }).href);
                        } else {
                            this.$Message.warning(this.$t('globalSearch.dashBoardHaveNoPermissionMyInquiry'));
                        }
                        break;
                    case 'companyDistribution':
                        // 跳转客户管理页面,跳转之前先鉴权
                        if (this.isContainsMenu('myCustomer')) {
                            // 跳转
                            const config = [
                                ['cpCreateTime', this.filterParameters.dateRange]
                            ];
                            // 如果是部门维度查询的，需要获取部门下的所有人下钻到线索页面
                            if (this.filterParameters.levelType === 'department') {
                                if (row.firstDepartmentId !== 0) {
                                    const createUser = [];
                                    row.userIdList.forEach(item => {
                                        createUser.push({ label: item.fullName, value: item.id });
                                    });
                                    config.push(['cpCompanyManagers', createUser]);
                                }
                            } else {
                                config.push(['cpCompanyManagers', [{ label: row.userName, value: row.id }]]);
                            }
                            // 合计字段跳转到线索列表的时候不携带表头筛选条件
                            if (key !== 'counts') {
                                switch (this.filterParameters.typeId) {
                                    case 2: // 客户类型
                                        config.push(['cpClientType', [{ label: title, value: key / 1 === -1 ? null : title }]]);
                                        break;
                                    case 8: // 客户等级
                                        config.push(['cpStarLevel', [{ label: title, value: key / 1 === -1 ? null : key / 1 }]]);
                                        break;
                                }
                            } else {
                                const configArr = [];
                                switch (this.filterParameters.typeId) {
                                    case 2: // 客户类型
                                        this.tableColumns.map(res => {
                                            if (res.key !== 'userName' && res.key !== 'counts' && res.key !== 'departmentName') {
                                                configArr.push({ label: res.title, value: res.key / 1 === -1 ? null : res.title });
                                            }
                                        });
                                        config.push(['cpClientType', configArr]);
                                        break;
                                    case 8: // 客户等级
                                        this.tableColumns.map(res => {
                                            if (res.key !== 'userName' && res.key !== 'counts' && res.key !== 'departmentName') {
                                                configArr.push({ label: res.title, value: res.key / 1 === -1 ? null : res.key / 1 });
                                            }
                                        });
                                        config.push(['cpStarLevel', configArr]);
                                        break;
                                }
                            }
                            localStorage.setItem('dashboard_customer_filters', JSON.stringify(config));

                            this.$stm.openNewWindow(this.$router.resolve({
                                name: 'myCustomer'
                            }).href);
                        } else {
                            this.$Message.warning(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                        }
                        break;
                    case 'clueDistribution':
                        // 跳转线索
                        if (this.isContainsMenu('my_clue')) {
                            const config = [
                                ['createTime', this.filterParameters.dateRange]
                                // ['companyManagers', [{label: userName,value: userId}]]
                            ];
                            if (this.filterParameters.levelType === 'department') {
                                if (row.firstDepartmentId !== 0) {
                                    const createUser = [];
                                    row.userIdList.forEach(item => {
                                        createUser.push({ label: item.fullName, value: item.id });
                                    });
                                    config.push(['saleName', createUser]);
                                }
                            } else {
                                config.push(['saleName', [{ label: row.userName, value: row.id }]]);
                            }
                            // config.push(['status', [{ label: '询盘', value: 1 }]]); 处理状态
                            // config.push(['a10020', [{ label: '哈哈哈', value: 1 }]]); // 来源方式
                            // config.push(['a10019', [{ label: 'lalalal', value: 1 }]]); // 来源渠道
                            // config.push(['a1003', [{ label: '中国', value: 1 }]]); // 国家地区
                            // 员工待办事项【待处理线索】,线索列表需要筛选【跟进状态】= 未处理，
                            // 合计字段跳转到线索列表的时候不携带表头筛选条件
                            if (key !== 'counts') {
                                switch (this.filterParameters.typeId) {
                                    case 3: // 处理状态
                                        config.push(['status', [{ label: title, value: key / 1 === -1 ? null : key / 1 }]]);
                                        break;
                                    case 10: // 来源方式
                                        config.push(['a10020', [{ label: title, value: key / 1 === -1 ? null : title }]]);
                                        break;
                                    case 6: // 来源渠道
                                        config.push(['a10019', [{ label: title, value: key / 1 === -1 ? null : title }]]);
                                        break;
                                }
                            } else {
                                const configArrCommon = [];
                                const configArr = [];
                                this.tableColumns.map(res => {
                                    if (res.key !== 'userName' && res.key !== 'counts' && res.key !== 'departmentName') {
                                        configArrCommon.push({ label: res.title, value: res.key / 1 === -1 ? null : res.title });
                                    }
                                });
                                switch (this.filterParameters.typeId) {
                                    case 3: // 处理状态
                                        this.tableColumns.map(res => {
                                            if (res.key !== 'userName' && res.key !== 'counts' && res.key !== 'departmentName') {
                                                configArr.push({ label: res.title, value: res.key / 1 === -1 ? null : res.key / 1 });
                                            }
                                        });
                                        config.push(['status', configArr]);
                                        break;
                                    case 10: // 来源方式
                                        config.push(['a10020', configArrCommon]);
                                        break;
                                    case 6: // 来源渠道
                                        config.push(['a10019', configArrCommon]);
                                        break;
                                }
                            }
                            localStorage.setItem('dashboard_clue_filter', JSON.stringify(config));
                            localStorage.setItem('dashboard_clue_type', JSON.stringify(3));
                            this.$stm.openNewWindow(this.$router.resolve({
                                name: 'my_clue'
                            }).href);
                        } else {
                            this.$Message.warning(this.$t('globalSearch.dashBoardHaveNoPermissionMyClue'));
                        }
                        break;
                    default:
                        break;
                }
            },
            // 页面跳转
            async jumpToDetail(key, row, rowIndex, e) {
                // 跳转访客历史/网站留言, 单独处理
                if (this.canJumpField[this.kind].includes(key)) {
                    switch (this.kind) {
                        // 访客历史
                        case 'visitorAnalysis':
                        case 'visitTrafficAnalysis':
                            // 未知, 不支持跳转
                            if (!row.key || row.keyName === '未知') {
                                return;
                            }
                            this.jumpToVisitorHistory(key, row, rowIndex, e);
                            return;
                        case 'serviceWorkStatus':
                            this.jumpToVisitorHistory(key, row, rowIndex, e);
                            return;
                        // 网站留言
                        case 'msgStatusStatistics':
                        case 'msgPageStatus':
                            this.jumpToWebMsg(key, row, rowIndex, e);
                            return;
                    }
                }

                let isHaveMailAuthority;
                let boxName = 'inbox';
                let currentUntreatedTab = '';
                let obj = [];
                if (this.canJumpField[this.kind].includes(key)) {
                    // let config;
                    switch (key) {
                        // google营销转化 询盘数
                        case 'inquiryCount':
                        case 'inquiryTransactionCount':
                        case 'markerInquiryCount':
                            if (this.kind === 'googleMarketing') {
                                this.showSeaDetail(row, e, this.googleMarketingInquiryTable);
                                return;
                            }
                            // 跳转询盘 跳转之前先鉴权
                            if (this.isContainsMenu('myInquiry')) {
                                // 跳转
                                // 重点关注询盘 未成交询盘 已成交询盘
                                if (this.kind === 'focusedInquiry') {
                                    const data = [
                                        { condition1: 'inquiryMarker', condition2: '$eq', condition3: 1, inputType: 'boolean' }
                                    ];
                                    if (this.filterParameters.dateRange) {
                                        data.unshift({ condition1: 'createTime', condition2: 'dateRange', condition3: this.filterParameters.dateRange, inputType: 'dateRange' });
                                    }
                                    if (this.filterParameters.levelType === 'department') {
                                        if (row.firstDepartmentId !== 0) {
                                            const ids = row.userIdList.map(item => {
                                                return item.id;
                                            });
                                            data.push({ condition1: 'inquiryManagers', condition2: '$regex', condition3: ids, inputType: 'array' });
                                        }
                                    } else {
                                        data.push({ condition1: 'inquiryManagers', condition2: '$regex', condition3: [Number(row.userId)], inputType: 'array' });
                                    }
                                    if (key === 'inquiryTransactionCount') {
                                        data.push({ condition1: 'transactionMoney', condition2: '$gte', condition3: 0, inputType: 'number' });
                                    }
                                    localStorage.setItem('leadsCloud-dataOverview', JSON.stringify(data));
                                    localStorage.setItem('leadsCloud-dataOverview-type', key);
                                    localStorage.setItem('leadsCloud-filter-title', this.$t(`dashBoardV2.jumpTitle.${this.kind}_${key}`));
                                } else if (this.kind === 'employeeResources') { // 员工资源统计 询盘
                                    // 跳转
                                    const config = [
                                        ['createTime', this.filterParameters.dateRange]
                                    ];
                                    if (this.filterParameters.levelType === 'department') {
                                        if (row.firstDepartmentId !== 0) {
                                            const createUser = [];
                                            row.userIdList.forEach(item => {
                                                createUser.push({ label: item.fullname, value: item.id });
                                            });
                                            config.push(['inquiryManagers', createUser]);
                                        }
                                    } else {
                                        config.push(['inquiryManagers', [{ label: row.userName, value: row.userId }]]);
                                    }
                                    if (key === 'markerInquiryCount') {
                                        config.push(['inquiryMarker', [{ label: this.$t('crm.Table.con_is'), value: 1 }]]);
                                    }
                                    localStorage.setItem('dashboard_inquiry_filters', JSON.stringify(config));
                                }
                                // config.push(['followUp', [{ label: '询盘', value: 0 }]]); // 跟进状态
                                // config.push(['sourceWay', [{ label: '哈哈哈', value: 0 }]]); // 来源方式
                                // config.push(['sourceChannel', [{ label: '哈哈哈', value: 0 }]]); // 来源渠道

                                this.$stm.openNewWindow(this.$router.resolve({
                                    name: 'myInquiry'
                                }).href);
                            } else {
                                this.$Message.warning(this.$t('globalSearch.dashBoardHaveNoPermissionMyInquiry'));
                            }
                            break;
                        case 'transactionInquiryCount':
                            if (this.kind === 'googleMarketing') {
                                this.showSeaDetail(row, e, this.googleMarketingTranInquiryTotalTable);
                                return;
                            }
                            // google营销转化 成交询盘
                            if (this.isContainsMenu('myInquiry')) {
                                // 跳转
                                const data = [];
                                if (this.filterParameters.dateRange) {
                                    data.unshift({ condition1: 'transactionTime', condition2: 'dateRange', condition3: this.filterParameters.dateRange, inputType: 'dateRange' });
                                } else {
                                    data.unshift({ condition1: 'transactionTime', condition2: '$gt', condition3: new Date('1970-01-01').getTime(), inputType: 'date' });
                                }
                                if (this.filterParameters.levelType === 'department') {
                                    if (row.firstDepartmentId !== 0) {
                                        const ids = row.userIdList.map(item => {
                                            return item.id;
                                        });
                                        data.push({ condition1: 'inquiryManagers', condition2: '$regex', condition3: ids, inputType: 'array' });
                                    }
                                } else {
                                    data.push({ condition1: 'inquiryManagers', condition2: '$regex', condition3: [Number(row.userId)], inputType: 'array' });
                                }
                                if (key === 'inquiryTransactionCount') {
                                    data.push({ condition1: 'transactionMoney', condition2: '$gte', condition3: 0, inputType: 'number' });
                                }
                                localStorage.setItem('leadsCloud-dataOverview', JSON.stringify(data));
                                localStorage.setItem('leadsCloud-filter-title', this.$t('dashBoardV2.Settings.dealtInquiry'));
                                this.$stm.openNewWindow(this.$router.resolve({
                                    name: 'myInquiry'
                                }).href);
                            } else {
                                this.$Message.warning(this.$t('globalSearch.dashBoardHaveNoPermissionMyInquiry'));
                            }
                            break;
                        case 'disposeClueCount': // 员工待办事项【待处理线索】
                        case 'clueCount':
                            if (this.kind === 'googleMarketing') {
                                this.showSeaDetail(row, e, this.googleMarketingClueTable);
                                return;
                            }
                            // 跳转线索
                            if (this.isContainsMenu('my_clue')) {
                                const config = [
                                    ['createTime', this.filterParameters.dateRange]
                                    // ['companyManagers', [{label: userName,value: userId}]]
                                ];
                                if (this.filterParameters.levelType === 'department') {
                                    if (row.firstDepartmentId !== 0) {
                                        const createUser = [];
                                        row.userIdList.forEach(item => {
                                            createUser.push({ label: item.fullname, value: item.id });
                                        });
                                        config.push(['saleName', createUser]);
                                    }
                                } else {
                                    config.push(['saleName', [{ label: row.userName, value: row.userId }]]);
                                }
                                // config.push(['status', [{ label: '询盘', value: 1 }]]); 处理状态
                                // config.push(['a10020', [{ label: '哈哈哈', value: 1 }]]); // 来源方式
                                // config.push(['a10019', [{ label: 'lalalal', value: 1 }]]); // 来源渠道
                                // config.push(['a1003', [{ label: '中国', value: 1 }]]); // 国家地区
                                // 员工待办事项【待处理线索】,线索列表需要筛选【跟进状态】= 未处理，
                                if (key === 'disposeClueCount') {
                                    config.push(['status', [{ label: this.$t('clue.unfollowed'), value: 1 }]]);
                                }
                                localStorage.setItem('dashboard_clue_filter', JSON.stringify(config));
                                localStorage.setItem('dashboard_clue_type', JSON.stringify(3));
                                this.$stm.openNewWindow(this.$router.resolve({
                                    name: 'my_clue'
                                }).href);
                            } else {
                                this.$Message.warning(this.$t('globalSearch.dashBoardHaveNoPermissionMyClue'));
                            }
                            break;
                        case 'companyCount':
                        case 'disposeCompanyCount': // 员工待办事项【待处理客户】
                        case 'markerCompanyCount':
                            if (this.isContainsMenu('myCustomer')) {
                                const config = [
                                    ['cpCreateTime', this.filterParameters.dateRange]
                                ];
                                if (this.filterParameters.levelType === 'department') {
                                    if (row.firstDepartmentId !== 0) {
                                        const createUser = [];
                                        row.userIdList.forEach(item => {
                                            createUser.push({ label: item.fullname, value: item.id });
                                        });
                                        config.push(['cpCompanyManagers', createUser]);
                                    }
                                } else {
                                    config.push(['cpCompanyManagers', [{ label: row.userName, value: row.userId }]]);
                                }
                                if (key === 'markerCompanyCount') {
                                    config.push(['cpMarker', [{ label: this.$t('crm.Table.con_is'), value: 1 }]]);
                                }
                                // config.push(['cpClientType', [{ label: '0717客户类型', value: 1 }]]); // 客户类型
                                // config.push(['cpCountryArea', ['CN-', '中国']]); // 国家地区
                                // config.push(['cpStarLevel', [{ label: '0', value: 0 }]]); // 客户星级
                                
                                // 员工待办事项【待处理线索】,线索列表需要筛选【跟进次数】= 0，
                                if (key === 'disposeCompanyCount') {
                                    config.push(['cpFollowUpCount', '0-0']);
                                }
                                localStorage.setItem('dashboard_customer_filters', JSON.stringify(config));
                                this.$stm.openNewWindow(this.$router.resolve({
                                    name: 'myCustomer'
                                }).href);
                            } else {
                                this.$Message.warning(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                            }
                            break;
                        // 邮件跳转统一处理
                        case 'noReadCount':// 未读邮件
                        case 'todoCount': // 待处理邮件
                        case 'toBeRepliedToCount':// 待回复邮件
                            if (!this.isContainsMenu('mail')) {
                                this.$Message.warning(this.$t('dashBoardV2.tips.noMailMenu'));
                                return false;
                            }
                            isHaveMailAuthority = await this.isHaveMailAuthority(row.userId);
                            if (!isHaveMailAuthority) {
                                if (!this.isBindMail) {
                                    this.$Message.warning(this.$t('dashBoardV2.tips.noBind'));
                                } else {
                                    if (!this.isHaveRight) {
                                        this.$Message.warning(this.$t('dashBoardV2.tips.noRight'));
                                    }
                                }
                                return false;
                            }
                            if (!this.isContainsMenu('mail')) {
                                this.$Message.warning(this.$t('dashBoardV2.tips.noMailMenu'));
                                return false;
                            }
                            switch (key) {
                                // 待回复邮件
                                case 'toBeRepliedToCount':
                                    boxName = 'inbox';
                                    currentUntreatedTab = 'customer'
                                    obj = [
                                        {
                                            key: 'date',
                                            val: this.filterParameters.dateRange
                                        },
                                        {
                                            key: 'mailStatusFilter',
                                            val: [
                                                { value: 1, label: '未回复' }
                                            ]
                                        }
                                    ]
                                    break;
                                // 未读邮件
                                case 'noReadCount':
                                    boxName = 'unreadBox';
                                    obj = [
                                        {
                                            key: 'date',
                                            val: this.filterParameters.dateRange
                                        },
                                        {
                                            key: 'avatar',
                                            val: [
                                                { value: 0, label: this.$t('mail.undocumented') },
                                                { value: 1, label: this.$t('mail.public_customers') },
                                                { value: 2, label: this.$t('mail.my_customers') },
                                                { value: 3, label: this.$t('mail.other_customers') },
                                                { value: 4, label: this.$t('mail.public_leads') },
                                                { value: 5, label: this.$t('mail.my_leads') },
                                                { value: 6, label: this.$t('mail.other_leads') },
                                            ]
                                        }
                                    ];
                                    break;
                                case 'todoCount': // 待处理邮件
                                    boxName = 'untreated';
                                    obj = [
                                        {
                                            key: 'date',
                                            val: this.filterParameters.dateRange
                                        },
                                        {
                                            key: 'avatar',
                                            val: [
                                                { value: 0, label: this.$t('mail.undocumented') },
                                                { value: 1, label: this.$t('mail.public_customers') },
                                                { value: 2, label: this.$t('mail.my_customers') },
                                                { value: 3, label: this.$t('mail.other_customers') },
                                                { value: 4, label: this.$t('mail.public_leads') },
                                                { value: 5, label: this.$t('mail.my_leads') },
                                                { value: 6, label: this.$t('mail.other_leads') },
                                            ]
                                        }
                                    ];
                                    break;
                                default:
                                    break;
                            }
                            localStorage.setItem('dashboard_mail_filters', JSON.stringify({
                                boxName: boxName,
                                currentUntreatedTab: currentUntreatedTab,
                                personId: row.userId,
                                personName: row.userName,
                                emailList: this.emailList,
                                filterCons: obj
                            }));
                            this.$stm.openNewWindow(this.$router.resolve({
                                name: 'mail_home'
                            }).href);
                            break;
                        case 'disposeWaCount': // 待处理WhatsApp会话
                            if (this.isContainsMenu('whatsapp_chat')) {
                                if (row.whasAppContactsDtoList.length > 1) {
                                    const path = e.path || (e.composedPath && e.composedPath());
                                    const currentTarget = Array.isArray(path) ? path[0] : e.srcElement.offsetParent; // 赋值当前点击的编辑
                                    if (this.prevTarget === currentTarget) {
                                        // 同一个元素重复点击
                                        this.visibleEdit = !this.visibleEdit;
                                    } else {
                                        // 切换不同元素, 判断之前是否有点击其他编辑 prevTarget
                                        if (this.prevTarget) {
                                            // 先清除之前的弹框
                                            this.clearEditPopperComponent();
                                            this.$nextTick(() => {
                                                this.prevTarget = currentTarget;
                                                this.visibleEdit = true;
                                            });
                                        } else {
                                            this.prevTarget = currentTarget;
                                            this.visibleEdit = true;
                                        }
                                    }
                                    this.checkWaRow = row;
                                    this.whatsappList = row.whasAppContactsDtoList;
                                } else if (row.whasAppContactsDtoList.length === 0) {
                                    this.$Message.error(this.$t('dashBoardV2.tips.waAccountNotOnLine'));
                                } else {
                                    // 设定跳转条件, 指定忽略 wa 账号优先级排序逻辑, 优先显示带未读数的账号
                                    localStorage.setItem('dashBoard-touchPoint-jump', JSON.stringify({
                                        userId: row.userId,
                                        fullName: row.userName,
                                        filterConObj: [{ whatsappIsRead: { $eq: 2 } }, { whatsappDate: { dateRange: this.filterParameters.dateRange }}],
                                        whatsappAccount: row.whasAppContactsDtoList[0].whatsappAccount
                                    }));
                                    // 跳转到 wa 页面
                                    this.$stm.openNewWindow(this.$router.resolve({
                                        name: 'whatsapp_chat'
                                    }).href);
                                }
                                // localStorage.setItem('toWaUnreadAccount', 'true');
                            } else {
                                this.$Message.warning(this.$t('waNumberSearch.error_noWaMenuAuthority'));
                            }
                            break;
                        case 'retreatIntoHighSeasInquiryCount': // 七天内即将退入公海客户
                            // 跳转客户 跳转之前先鉴权
                            if (this.isContainsMenu('myCustomer')) {
                                const startTime = new Date().getTime();
                                const config = [
                                    ['cpPredictGiveupTime', [startTime, startTime + 6 * 24 * 60 * 60 * 1000]]
                                ];
                                if (this.filterParameters.levelType === 'department') {
                                    if (row.firstDepartmentId !== 0) {
                                        const createUser = [];
                                        row.userIdList.forEach(item => {
                                            createUser.push({ label: item.fullname, value: item.id });
                                        });
                                        config.push(['cpCompanyManagers', createUser]);
                                    }
                                } else {
                                    config.push(['cpCompanyManagers', [{ label: row.userName, value: row.userId }]]);
                                }
                                // const config = [
                                //     ['cpCompanyManagers', [{ label: row.userName, value: row.userId }]]
                                // ];
                                localStorage.setItem('dashboard_customer_filters', JSON.stringify(config));
                                // const retreatIntoHighSeasCompanys = data.retreatIntoHighSeasCompanys.length ? data.retreatIntoHighSeasCompanys.join(',') : '0';
                                // localStorage.setItem('retreatIntoHighSeasCompanys', 'retreatIntoHighSeasCompanys');
                                this.$stm.openNewWindow(this.$router.resolve({
                                    name: 'myCustomer'
                                }).href);
                            } else {
                                this.$Message.warning(this.$t('globalSearch.dashBoardHaveNoPermissionMyCustomer'));
                            }
                            break;
                        // 公海客户
                        case 'threeSeasCompanyCount':// 员工待办事项【三天内退入到公海的客户】
                        case 'highseasCompanyCount':
                            if (this.isContainsMenu('highseasCustomer')) {
                                // 前天的时间
                                const startTime = new Date();
                                startTime.setTime(startTime.getTime() - 48 * 60 * 60 * 1000);
                                
                                // 今天的时间
                                const endTime = new Date();
                                // endTime.setTime(endTime.getTime() + 24 * 60 * 60 * 1000);

                                const config = [
                                    // ['cpCreateTime', this.filterParameters.dateRange],
                                    ['cpLastGiveupTime', [startTime, endTime]]
                                    // ['companyManagersBefore', [{ label: row.userName, value: row.userId }]]
                                ];
                                if (this.filterParameters.levelType === 'department') {
                                    if (row.firstDepartmentId !== 0) {
                                        const createUser = [];
                                        row.userIdList.forEach(item => {
                                            createUser.push({ label: item.fullname, value: item.id });
                                        });
                                        config.push(['companyManagersBefore', createUser]);
                                    }
                                } else {
                                    config.push(['companyManagersBefore', [{ label: row.userName, value: row.userId }]]);
                                }
                                localStorage.setItem('dashboard_highSea_inquiry_filters', JSON.stringify(config));
                                this.$stm.openNewWindow(this.$router.resolve({
                                    name: 'highseasCustomer'
                                }).href);
                            } else {
                                this.$Message.warning(this.$t('globalSearch.dashBoardHaveNoPermissionHighseasCustomer'));
                            }
                            break;
                        case 'visitorCount': // 网站访问数
                            localStorage.setItem('dashboard_visitor_filter_googleMarketing', JSON.stringify({
                                dateRange: this.filterParameters.dateRange,
                                md5: row.visitorKey
                            }));
                            if (this.isContainsMenu('visitor_history')) {
                                window.open(this.$router.resolve({
                                    name: 'visitor_history'
                                }).href, '_blank');
                            } else {
                                this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionVisitorHistory'));
                            }
                            break;
                        case 'interactionVisitorCount': // 互动数
                            localStorage.setItem('dashboard_interaction_visitor_filter_googleMarketing', row.interactionVisitorKey);
                            if (this.isContainsMenu('visitor_history')) {
                                window.open(this.$router.resolve({
                                    name: 'visitor_history'
                                }).href, '_blank');
                            } else {
                                this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionVisitorHistory'));
                            }
                            break;
                        default:
                            break;
                    }
                }
            },
            showSeaDetail(row, e, column) {
                getStatus({
                    orgId: this.orgId,
                    id: row.type === '合计' ? row.customerId : row.campaignId,
                    // id: '6020552217',
                    startDate: this.$dym.timeFormat(this.filterParameters.dateRange[0]),
                    endDate: this.$dym.timeFormat(this.filterParameters.dateRange[1])
                }).then(res => {
                    console.log(res)
                    // const path = e.path || (e.composedPath && e.composedPath());
                    const path = this.$composedPath(e);
                    const currentTarget = Array.isArray(path) ? path[0] : e.srcElement.offsetParent; // 赋值当前点击的编辑
                    if (this.prevTarget === currentTarget) {
                        // 同一个元素重复点击
                        this.visibleEdit = !this.visibleEdit;
                    } else {
                        // 切换不同元素, 判断之前是否有点击其他编辑 prevTarget
                        if (this.prevTarget) {
                            // 先清除之前的弹框
                            this.clearEditPopperComponent();
                            this.$nextTick(() => {
                                this.prevTarget = currentTarget;
                                this.visibleEdit = true;
                            });
                        } else {
                            this.prevTarget = currentTarget;
                            this.visibleEdit = true;
                        }
                    }
                    this.checkWaRow = row;
                    this.whatsappTable = column;
                    this.whatsappList = [res];
                    // localStorage.setItem('dashboard_clue_filter_googleMarketing', row.clueKey);
                    // this.$stm.openNewWindow(this.$router.resolve({
                    //     name: 'my_clue'
                    // }).href);
                });
            },
            jumpToWaDetail(key, row) {
                // 设定跳转条件, 指定忽略 wa 账号优先级排序逻辑, 优先显示带未读数的账号
                localStorage.setItem('dashBoard-touchPoint-jump', JSON.stringify({
                    userId: this.checkWaRow.userId,
                    fullName: this.checkWaRow.userName,
                    filterConObj: [{ whatsappIsRead: { $eq: 2 } }, { whatsappDate: { dateRange: this.filterParameters.dateRange }}],
                    whatsappAccount: row.whatsappAccount
                }));
                // 跳转到 wa 页面
                this.$stm.openNewWindow(this.$router.resolve({
                    name: 'whatsapp_chat'
                }).href);
            },
            // 跳转公海/私海线索
            jumpToClueDetail(key, row) {
                // 点击私海数量
                if (key === 'clueTotal') {
                    if (this.isContainsMenu('my_clue')) {
                        localStorage.setItem('dashboard_clue_filter_googleMarketing', row.clueTotal > 0 ? row.clueTotalKey : row.clueTotalKeyNull);
                        this.$stm.openNewWindow(this.$router.resolve({
                            name: 'my_clue'
                        }).href);
                    } else {
                        this.$Message.warning(this.$t('globalSearch.dashBoardHaveNoPermissionMyClue'));
                    }
                }
                if (key === 'seaClueTotal') {
                    if (this.isContainsMenu('common_sea_customer')) {
                        localStorage.setItem('dashboard_highSea_clue_filter_googleMarketing', row.seaClueTotal > 0 ? row.seaClueTotalKey : row.seaClueTotalKeyNull);
                        this.$stm.openNewWindow(this.$router.resolve({
                            name: 'common_sea_customer'
                        }).href);
                    } else {
                        this.$Message.warning(this.$t('globalSearch.haveNoPermissionHighseasClue'));
                    }
                }
            },
            jumpToInquiryDetail(key, row) {
                // [item.key] === 0 ? item['inquiryTotalKeyNull'] : item['inquiryTotalKey']
                if (key === 'seaInquiryTotal' || key === 'tranSeaInquiryTotal') return;
                if (this.isContainsMenu('myInquiry')) {
                    // 点击私海数量
                    localStorage.setItem('dashboard_inquiry_filter_googleMarketing', row[key] > 0 ? row[`${key}Key`] : row[`${key}KeyNull`]);
                    this.$stm.openNewWindow(this.$router.resolve({
                        name: 'myInquiry'
                    }).href);
                } else {
                    this.$Message.warning(this.$t('globalSearch.dashBoardHaveNoPermissionMyInquiry'));
                }
            },
            async isHaveMailAuthority(clickId) {
                const p1 = this.isHaveRightPromise(clickId);
                const p2 = this.isBindMailPromise(clickId);
                await Promise.all([p1, p2]).then(() => {
                });
                return this.isHaveRight && this.isBindMail;
            },
            isHaveRightPromise(clickId) {
                return new Promise((resolve) => {
                    if (Number(this.userId) === Number(clickId)) {
                        this.isHaveRight = true;
                        this.emailList =[];
                        resolve(true);
                        return
                    }
                    util.ajaxMail({
                        url: `/mail/mailAccount/leader/${this.orgId}/${this.userId}`,
                        method: 'get'
                    }).then(res => {
                        if (res.data.code === 1 && res.data.data) {
                            // debugger
                            const userList = res.data.data;
                            let ids = [];
                            let emails = [];
                            userList.forEach(user => {
                                ids.push(user.createUserId);
                                if (Number(user.createUserId) === clickId) {
                                    emails.push(user.emailAddress);
                                }
                            });
                            this.emailList = emails;
                            this.isHaveRight = ids.includes(`${clickId}`);
                            resolve();
                        } else {
                            this.emailList = [];
                            // this.$Message.error('获取企业部门数据失败，请刷新后重试');
                            resolve();
                        }
                    });
                });
            },
            // 是否绑定邮箱
            isBindMailPromise(clickId) {
                return new Promise((resolve) => {
                    util.ajaxMailJson({
                        url: `/mail/mailAccounts/user/${this.orgId}/${clickId}`,
                        method: 'get',
                        params: {
                            userId: this.userId // 登陆人的userid
                        }
                    }).then(res => {
                        if (res.data.code === 1) {
                            if (res.data.data.accountList.length) {
                                this.isBindMail = true;
                            } else {
                                this.isBindMail = false;
                            }
                            resolve();
                        } else {
                            this.isBindMail = false;
                            resolve();
                        }
                    });
                });
            },
            // 跳转到访客历史
            jumpToVisitorHistory(key, row, rowIndex, e) {
                // 权限目录判断
                if (!this.isContainsMenu('visitor_history')) {
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionVisitorHistory'));
                    return;
                }

                // 最终跳转条件, 以当前的表格筛选条件为基础
                const jumpConObj = Object.assign({}, this.tableFilterConObj);

                // 处理行筛选条件
                // 取当前表格筛选维度的 key 作为行筛选条件的参数名
                const dimensionFieldKeyArr = this.tableColumns.filter(item => item.dynamicFieldType).map(item => item.dynamicFieldKey);
                // 处理行筛选条件
                if (dimensionFieldKeyArr.length === 1) {
                    // 单维度

                    // 表格当前查看的数据维度: 当前行的值
                    // 若当前是一级筛选, 则此处传的是一级维度筛选值(比如, '一级searchType--如 country': '当前行的 key[=country] 值')
                    // 若当前是子级筛选, 则此处传的是子级维度筛选值(比如, '子级searchType--如 city': '当前行的 key[=city] 值'), 一级筛选值已经在表格筛选条件中了
                    jumpConObj[jumpConObj.searchType] = row.key;
                } else if (dimensionFieldKeyArr.length === 2) {
                    // 双维度 - 目前只有"客服工作情况"有"客服/日期"双维度

                    jumpConObj[dimensionFieldKeyArr[0]] = row.key;
                    jumpConObj[dimensionFieldKeyArr[1]] = row.subKey;
                }

                // 处理列筛选条件 + 其他
                switch (this.kind) {
                    case 'visitorAnalysis':
                    case 'visitTrafficAnalysis':
                        jumpConObj.searchDataSource = 'visitorAnalysis';
                        jumpConObj.isNewVisitor = key === 'newVisitorCount' ? 1 : undefined;
                        break;
                    case 'serviceWorkStatus':
                        jumpConObj.searchDataSource = 'customerService';
                        jumpConObj[key] = 1;
                        break;
                }

                localStorage.setItem('dashboard_visitorHistory_filter', JSON.stringify(jumpConObj));
                this.$stm.openNewWindow(this.$router.resolve({
                    name: 'visitor_history'
                }).href);
            },
            // 跳转到网站留言
            jumpToWebMsg(key, row, rowIndex, e) {
                // 权限目录判断
                if (!this.isContainsMenu('website_message')) {
                    this.$Message.error(this.$t('globalSearch.dashBoardHaveNoPermissionWebsiteMsg'));
                    return;
                }

                // 最终跳转条件, 以当前的表格筛选条件为基础
                const jumpConObj = Object.assign({}, this.tableFilterConObj);

                // 分表格处理筛选条件
                switch (this.kind) {
                    case 'msgStatusStatistics':
                        jumpConObj.templateId = row.key;
                        jumpConObj.status = key.replace('status_', '');
                        break;
                    case 'msgPageStatus':
                        jumpConObj.currentPage = row.key;
                        jumpConObj[key] = 1;
                        break;
                }

                localStorage.setItem('dashboard_websiteMsg_filter', JSON.stringify(jumpConObj));
                this.$stm.openNewWindow(this.$router.resolve({
                    name: 'website_message'
                }).href);
            },
            // 页面跳转
            jumpToWebUrl(url) {
                window.open(url, '_blank');
            },
            // 跳转子级表格页
            jumpChildTable({ keyName, key }) {
                // 已处于子级页面, 无法跳转; "未知", 不可跳转; 浏览器, 屏幕分辨率, 时段, 着陆页, 浏览器语言, "来源类型-直接访问/电子邮件营销"不可跳转到子级页面
                if (this.filterParameters.childFilterVal || (!key || keyName === '未知') || ['browser', 'screenResolution', 'hour', 'firstVisitUrl', 'lang'].includes(this.filterParameters.typeId) || (this.filterParameters.typeId === 'trafficSourceMerge' && ['4', '8'].includes(key))) {
                    return;
                }

                const parentText = this.typeAggregate[this.kind].find(item => item.value === this.filterParameters.typeId).label;

                this.filterParameters.childFilterVal = key;

                setTimeout(() => {
                    this.childNavLinkText = `${parentText} > ${keyName}`;
                }, 0);
            },
            // 去掉子级筛选
            removeChildFilter() {
                this.filterParameters.childFilterVal = '';
                this.childNavLinkText = '';
            }
        },
        created() {
            // if (this.kind === 'inquiryDistribution') {
            //     // 綫索的分布获取列表数据
            //     this.getInquiryData();
            //     return;
            // }
            // if (this.kind === 'companyDistribution') {
            //     this.getCompanyData();
            //     return;
            // }
            // if (this.kind === 'clueDistribution') {
            //     this.getClueData();
            //     return;
            // }
            this.personTableColumns = this.tableHeader[this.kind].personTableColumns;
            this.departmentTableColumns = this.tableHeader[this.kind].departmentTableColumns;
            this.tableColumns = this.tableColumns.map((col, index) => {
                col.renderHeader = this.renderHeader_filter(index);
                return col;
            });
        },
        mounted() {
            // 监听聊天框容器的高度, 适时调整 scroll 的高度
            if (!this.observer) {
                const _el = this.$refs.tableContainer;

                if (_el) {
                    // 监听聊天框容器的高度, 适时调整 scroll 的高度
                    this.observer = elementResizeDetectorMaker();

                    this.observer.listenTo(_el, (el) => {
                        this.$nextTick(() => {
                            if (this.$refs.table) {
                                this.$refs.table.doLayout();
                            }
                        });
                    });
                }
            }

        },
        beforeDestroy() {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            // 解绑定对表格容器的 resize 监听
            if (this.observer) {
                this.observer.uninstall(this.$refs.tableContainer);
                this.observer = null;
            }

        },
        watch: {
            filterParameters: {
                handler(val) {
                    if (this.timer) {
                        clearTimeout(this.timer);
                        this.timer = null;
                    }
                    this.timer = setTimeout(() => {
                        this.pageNo = 1;
                        this.tableData = [];
                        // 如果是员工待办事项，可跳转选项是可变的
                        if (this.kind === 'todoList') {
                            this.canJumpField.todoList = this.todoListCanJump[val.levelType];
                        }
                        this.getData();
                    }, 200);
                },
                immediate: true,
                deep: true
            },
            // 有的组件可能不需要币种 单独处理
            currentCurrency: {
                handler(val) {
                    if (this.monitorCurrency.includes(this.kind)) {
                        if (this.timer) {
                            clearTimeout(this.timer);
                            this.timer = null;
                        }
                        this.timer = setTimeout(() => {
                            this.pageNo = 1;
                            this.tableData = [];
                            this.getData();
                        }, 200);
                    }
                }
            },
            // 当前表格的全部接口请求参数
            tableFilterConObj: {
                handler(val) {
                    this.$emit('updateTableFilterConObj', val);
                }
            }

        }
    };
</script>

<style lang="less">
    .card-box{
        .table_body {
            .el-table {
                th {
                    background: #F6F6F6;
                }
            }
            .el-table--medium th, .el-table--medium td {
                padding: 6px 0;
            }
        }
        .canjump{
            color: #3B78DE;
            cursor: pointer;
        }
        .two_row_cls, .three_row_cls {
            color: #666;
        }
    }
    .dashbord-table {
        border-top: none;
        
        .caret-wrapper {
            margin-bottom: -12px;
            position: relative;
            top: -6px;
        }
    }
    .tableScrollinquiryDistribution thead th div,
    .tableScrollcompanyDistribution thead th div,
    .tableScrollclueDistribution thead th div{
        overflow: hidden!important;
        text-overflow: ellipsis!important;
        white-space: nowrap!important;
    }
</style>
