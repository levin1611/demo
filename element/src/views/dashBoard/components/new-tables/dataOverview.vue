<template>
    <Card class="card-box">
        <div class="card-box-title">
            <!-- 标题 -->
            <span class="title">{{$t('dashBoardV2.Title.dataOverview')}}
                <!-- 提示 -->
                <HelpTip v-if="kind === 'webDataOverview'"
                         :iconSize="14"
                         :title="$t('helpTip.webDataOverview')"></HelpTip>
                <HelpTip v-else
                         :iconSize="14"
                         :title="$t('helpTip.dataOverview')"></HelpTip>
            </span>

            <!-- 筛选 -->
            <div class="card-box-filter">
                <!-- 员工筛选 -->
                <personFilter v-if="kind !== 'webDataOverview'"
                    class="marginRight8"
                    :cardType="kind"
                    :department_list="department_list"
                    :user_list="user_list"
                    :filterValue="userIdList"
                    @handleFilter="handlePersonFilter"></personFilter>

                <!-- 时间筛选 -->
                <CardFilter :cardType="kind"
                    filterType="date"
                    :filterKey="filterKey"
                    :filterValue="dateRange"
                    @handleFilter="handleDateFilter"></CardFilter>

                <!-- 网站筛选 -->
                <SiteFilter v-if="kind === 'webDataOverview'"
                            :cardType="kind"
                            :site_list="site_list"
                            filterKey="siteId"
                            :filterValue="siteId"
                            @handleFilter="handleSiteFilter"
                            class="marginLeft8"></SiteFilter>
            </div>
        </div>

        <!-- 数据 -->
        <div class="card-box-body" v-loading="loading">
            <div class="card-box-flex">
                <!-- :class="item.key === 'inquiryCount' ? 'splitLine' : ''" -->
                <div v-for="(item, index) in datasheets" :key="index" class="dataOverviewList">
                    <Tooltip placement="top" popper-class="dataOverviewTooltip">
                        <div slot="content">{{ formatData(data[item.key]) }}</div>
                        <!-- :title="data[item.key]" -->
                        <p class="number"
                            @click="jumpToDetail(item)"
                            :class="supportJump.includes(item.key) ? 'supportJump' : ''">
                            <!-- {{data[item.key]}} -->
                            {{ formatData(data[item.key]) }}
                            <!-- <span v-if="currency.includes(item.key)">
                                {{currencySymbol}}
                                <span>{{data[item.key]}}</span>
                            </span>
                            <span v-else>{{data[item.key]}}</span> -->
                        </p>
                    </Tooltip>
                    <p class="label">{{item.label}}</p>
                </div>
            </div>
        </div>

        <!-- 统计截止时间 -->
        <div v-if="kind === 'webDataOverview' && syncTime[1]"
             class="statistics-time">{{ $t('dashBoardV2.dataOverview.statisticsTime') }}: {{ syncTime[1] }}</div>

        <!-- 删除按钮 -->
        <deleteIcon @removeFromDashBoard="removeFromDashBoard" style="position: absolute;bottom: 0px; right: 0px"/>
    </Card>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import CardFilter from '../card-tables/card-filter.vue';
    import personFilter from '../person-filter';
    import SiteFilter from '../site-filter';
    import { getDataOverview, getWebDataOverview } from '@/api/dashBoard/dashBoardV2';
    import deleteIcon from '../deleteIcon';
    import { formatNumWithCommas } from '@/utils/dataProcessing';
    // import Utils from '@/utils/index';

    export default {
        name: 'dataOverview',
        components: {
            CardFilter,
            personFilter,
            SiteFilter,
            deleteIcon
        },
        props: [
            'kind',
            'currentCurrency',
            'syncTime',
            'department_list',
            'user_list',
            'site_list'
        ],
        computed: {
            ...mapState({
                userId: state => state.userId,
                fullName: state => state.fullName,
                orgId: state => state.enterpriseId
            }),
            ...mapGetters([
                'isContainsMenu'
            ])
            // currencySymbol() {
            //     return Utils.currencySymbol.filter(item => item.code === this.currentCurrency)[0].symbol;
            // }
        },
        data() {
            return {
                /* 全局 */
                loading: true,

                /* 筛选 */
                filterKey: 'eventDate',
                dateRange: [(new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)).getTime(), (new Date()).getTime()],
                userIdList: [],
                siteId: '',

                /* 数据 */
                supportJumpConfig: {
                    webDataOverview: ['visitorCount', 'visitCount', 'chatVisitCount', 'clueVisitCount', 'inquiryVisitCount'],
                    default: ['clueCount', 'highSeasClueCount', 'companyCount', 'highSeasCompanyCount', 'inquiryCount', 'transactionMoney', 'markerInquiryCount', 'estimatedInquiryAmount']
                },
                supportJump: [],
                currency: ['transactionMoney', 'estimatedInquiryAmount'],
                datasheetsConfig: {
                    webDataOverview: [
                        {
                            label: this.$t('dashBoardV2.dataOverview.visitorCount'),
                            key: 'visitorCount'
                        },
                        {
                            label: this.$t('dashBoardV2.dataOverview.visitCount'),
                            key: 'visitCount'
                        },
                        {
                            label: this.$t('dashBoardV2.dataOverview.chatVisitCount'),
                            key: 'chatVisitCount'
                        },
                        {
                            label: this.$t('dashBoardV2.dataOverview.leaveFormCount'),
                            key: 'leaveFormCount'
                        },
                        {
                            label: this.$t('dashBoardV2.dataOverview.clueVisitCount'),
                            key: 'clueVisitCount'
                        },
                        {
                            label: this.$t('dashBoardV2.dataOverview.inquiryVisitCount'),
                            key: 'inquiryVisitCount'
                        },
                    ],
                    default: [
                        {
                            label: this.$t('dashBoardV2.dataOverview.mailContact'),
                            key: 'emailContact'
                        },
                        {
                            label: this.$t('dashBoardV2.dataOverview.whatsAppContact'),
                            key: 'whatsappContact'
                        },
                        // {
                        //     label: this.$t('dashBoardV2.dataOverview.fb_msg'),
                        //     key: 'facebookContact'
                        // },
                        {
                            label: this.$t('dashBoardV2.dataOverview.clue'),
                            key: 'clueCount'
                        },
                        {
                            label: this.$t('dashBoardV2.dataOverview.public_clue'),
                            key: 'highSeasClueCount'
                        },
                        {
                            label: this.$t('dashBoardV2.dataOverview.customer'),
                            key: 'companyCount'
                        },
                        {
                            label: this.$t('dashBoardV2.dataOverview.highseasCustomer'),
                            key: 'highSeasCompanyCount'
                        },
                        {
                            label: this.$t('dashBoardV2.dataOverview.inquiry'),
                            key: 'inquiryCount'
                        },
                        {
                            label: this.$t('dashBoardV2.dataOverview.dealtAmount'),
                            key: 'transactionMoney'
                        },
                        {
                            label: this.$t('dashBoardV2.dataOverview.inquiryEmphasis'),
                            key: 'markerInquiryCount'
                        },
                        {
                            label: this.$t('dashBoardV2.dataOverview.inq_estimatedInquiryAmount'),
                            key: 'estimatedInquiryAmount'
                        }
                    ]
                },
                datasheets: [],
                data: {},

                // 网站交互数据概览, 请求参数暂存
                queryConfigObj: {}
            };
        },
        created() {
            this.datasheets = this.datasheetsConfig[this.kind] || this.datasheetsConfig.default;
            this.supportJump = this.supportJumpConfig[this.kind] || this.supportJumpConfig.default;
        },
        methods: {
            /* 数据处理 */
            formatData(data) {
                let result = /^\d+$/.test(`${data}`) ? (data / 1).toLocaleString() : (data || '-');

                if (this.kind === 'webDataOverview') {
                    result = formatNumWithCommas(data);
                }

                return result;
            },

            /* 筛选 */
            handlePersonFilter(key, val) {
                this.userIdList = val;
                this.getData();
            },
            handleDateFilter(filterCon) {
                const { filterValue } = filterCon;
                this.dateRange = filterValue;
                this.getData();
            },
            handleSiteFilter(key, val) {
                this.siteId = val;
                this.getData();
            },

            /* 数据请求 */
            getData() {
                if (this.kind === 'webDataOverview') {
                    // 网站交互数据概览

                    this.getWebDataOverview();
                } else {
                    // 数据概览

                    this.getDataOverview();
                }
            },
            getDataOverview() {
                this.loading = true;
                getDataOverview({
                    orgId: this.orgId,
                    userId: this.userId,
                    startDate: this.$dym.timeFormat(this.dateRange[0]),
                    endDate: this.$dym.timeFormat(this.dateRange[1]),
                    userIdList: this.userIdList.length ? JSON.stringify(this.userIdList) : '',
                    currency: this.currentCurrency
                }).then(res => {
                    if (res.code === '1') {
                        this.data = res.data;
                    } else {
                        this.data = {};
                    }
                    this.loading = false;
                });
            },
            // 获取网站交互数据概览
            getWebDataOverview() {
                this.loading = true;
                const postData = {
                    orgId: this.orgId,
                    userId: this.userId,
                    startDate: this.$dym.timeFormat(this.dateRange[0]) + ' 00:00:00',
                    endDate: this.$dym.timeFormat(this.dateRange[1]) + ' 23:59:59',
                    siteId: this.siteId
                };
                getWebDataOverview(postData).then(res => {
                    if (res.code === '1') {
                        this.data = res.data;
                        this.queryConfigObj = postData;
                    } else {
                        this.data = {};
                        this.queryConfigObj = {};
                    }
                    this.loading = false;
                }).catch(() => {
                    this.data = {};
                    this.queryConfigObj = {};
                    this.loading = false;
                });
            },

            // 跳转
            jumpToDetail(item) {
                if (this.supportJump.includes(item.key)) {
                    // 网站交互数据概览, 单独处理
                    if (this.kind === 'webDataOverview') {
                        this.jumpToWebInteractPage(item);

                        return;
                    }

                    let config;
                    const userIdList = [];
                    if (this.userIdList.length) {
                        this.user_list.forEach(item => {
                            if (this.userIdList.includes(item.id)) {
                                userIdList.push({ label: item.fullname, value: item.id });
                            }
                        });
                        console.log(userIdList);
                    };
                    switch (item.key) {
                        case 'clueCount':
                            if (this.isContainsMenu('my_clue')) {
                                config = [
                                    ['createTime', this.dateRange]
                                ];
                                if (userIdList.length) {
                                    config.push(['saleName', userIdList]);
                                }
                                localStorage.setItem('dashboard_clue_filter', JSON.stringify(config));
                                localStorage.setItem('dashboard_clue_type', JSON.stringify(3));
                                this.$stm.openNewWindow(this.$router.resolve({
                                    name: 'my_clue'
                                }).href);
                            } else {
                                this.$Message.warning(this.$t('globalSearch.haveNoPermissionMyClue'));
                            }
                            break;
                        case 'highSeasClueCount':
                            if (this.isContainsMenu('common_sea_customer')) {
                                config = [
                                    ['createTime', this.dateRange]
                                ];
                                localStorage.setItem('dashboard_highSea_clue_filters', JSON.stringify(config));
                                this.$stm.openNewWindow(this.$router.resolve({
                                    name: 'common_sea_customer'
                                }).href);
                            } else {
                                this.$Message.warning(this.$t('globalSearch.haveNoPermissionHighseasCustomer'));
                            }
                            break;
                        case 'companyCount':
                            if (this.isContainsMenu('myCustomer')) {
                                config = [
                                    ['cpCreateTime', this.dateRange]
                                ];
                                if (userIdList.length) {
                                    config.push(['cpCompanyManagers', userIdList]);
                                }
                                localStorage.setItem('dashboard_customer_filters', JSON.stringify(config));
                                this.$stm.openNewWindow(this.$router.resolve({
                                    name: 'myCustomer'
                                }).href);
                            } else {
                                this.$Message.warning(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                            }
                            break;
                        case 'highSeasCompanyCount':
                            if (this.isContainsMenu('highseasCustomer')) {
                                config = [
                                    ['cpCreateTime', this.dateRange]
                                ];
                                localStorage.setItem('dashboard_highseasCustomer_filters', JSON.stringify(config));
                                this.$stm.openNewWindow(this.$router.resolve({
                                    name: 'highseasCustomer'
                                }).href);
                            } else {
                                this.$Message.warning(this.$t('globalSearch.haveNoPermissionHighseasCustomer'));
                            }
                            break;
                        case 'inquiryCount':
                        case 'transactionMoney':
                            // 跳转询盘 跳转之前先鉴权
                            if (this.isContainsMenu('myInquiry')) {
                                if (item.key === 'inquiryCount') {
                                    config = [
                                        ['createTime', this.dateRange]
                                    ];
                                } else {
                                    config = [
                                        ['transactionTime', this.dateRange]
                                    ];
                                }
                                if (userIdList.length) {
                                    config.push(['inquiryManagers', userIdList]);
                                }
                                localStorage.setItem('dashboard_inquiry_filters', JSON.stringify(config));
                                this.$stm.openNewWindow(this.$router.resolve({
                                    name: 'myInquiry'
                                }).href);
                            } else {
                                this.$Message.warning(this.$t('globalSearch.haveNoPermissionMyInquiry'));
                            }
                            break;
                        case 'markerInquiryCount':
                        case 'estimatedInquiryAmount':
                            // 跳转询盘 跳转之前先鉴权
                            if (this.isContainsMenu('myInquiry')) {
                                // 跳转
                                const data = [
                                    { condition1: 'inquiryMarker', condition2: '$eq', condition3: 1, inputType: 'boolean' },
                                    { condition1: 'estimatedInquiryAmount', condition2: '$gt', condition3: 0, inputType: 'number' }
                                ];
                                if (this.dateRange) {
                                    data.unshift({ condition1: 'createTime', condition2: 'dateRange', condition3: this.dateRange, inputType: 'dateRange' });
                                }
                                if (userIdList.length) {
                                    data.push({ condition1: 'inquiryManagers', condition2: '$regex', condition3: this.userIdList, inputType: 'array' });
                                }
                                localStorage.setItem('leadsCloud-dataOverview', JSON.stringify(data));
                                // 根据type 组特殊数据 此处是跟进状态在成交之前的
                                localStorage.setItem('leadsCloud-dataOverview-type', 'inquiryCount');
                                localStorage.setItem('leadsCloud-filter-title', this.$t(`dashBoardV2.jumpTitle.${this.kind}_${item.key}`));
                                this.$stm.openNewWindow(this.$router.resolve({
                                    name: 'myInquiry'
                                }).href);
                            } else {
                                this.$Message.warning(this.$t('globalSearch.haveNoPermissionMyInquiry'));
                            }
                            break;
                    }
                }
            },
            jumpToWebInteractPage(item) {
                switch (item.key) {
                    case 'leaveFormCount':
                        this.jumpToWebMsg(item);
                        break;
                    // 网站留言
                    case 'visitorCount':
                    case 'visitCount':
                    case 'chatVisitCount':
                    case 'clueVisitCount':
                    case 'inquiryVisitCount':
                        this.jumpToVisitorHistory(item);
                        break;
                }
            },
            // 跳转到访客历史
            jumpToVisitorHistory(statItem) {
                // 权限目录判断
                if (!this.isContainsMenu('visitor_history')) {
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionVisitorHistory'));
                    return;
                }

                // 最终跳转条件, 以当前的筛选条件为基础
                const jumpConObj = Object.assign({
                    searchDataSource: 'overview',
                    searchVisitorIds: statItem.key
                }, this.queryConfigObj);

                localStorage.setItem('dashboard_visitorHistory_filter', JSON.stringify(jumpConObj));
                this.$stm.openNewWindow(this.$router.resolve({
                    name: 'visitor_history'
                }).href);
            },
            // 跳转到网站留言
            jumpToWebMsg(statItem) {
                // 权限目录判断
                if (!this.isContainsMenu('website_message')) {
                    this.$Message.error(this.$t('globalSearch.dashBoardHaveNoPermissionWebsiteMsg'));
                    return;
                }

                // 最终跳转条件, 以当前的筛选条件为基础
                const jumpConObj = Object.assign({
                    searchDataSource: 'overview',
                    searchVisitorIds: statItem.key
                }, this.queryConfigObj);

                localStorage.setItem('dashboard_websiteMsg_filter', JSON.stringify(jumpConObj));
                this.$stm.openNewWindow(this.$router.resolve({
                    name: 'website_message'
                }).href);
            },

            // 移除组件
            removeFromDashBoard() {
                this.$emit('removeFromDashBoard', this.kind);
            }
        },
        watch: {
            currentCurrency: {
                handler(val) {
                    if (val) {
                        this.getData();
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less">
    @import './common.less';

    .statistics-time {
        text-align: right;
        margin-top: 12px;
        font-size: 12px;
        line-height: 18px;
        color: #333;
    }
</style>
