<template>
    <div class="b-r">
        <tableCard :table-columns="tableColumns"
                   :table-detail="tableDetail"
                   :body-style="bodyStyle"
                   :canvas-style="canvasStyle"
                   :is-admin="isAdmin"
                   :start-date="dateFormat(dateRange[0], '-')"
                   :end-date="dateFormat(dateRange[1], '-')"
                   :date-range.sync="dateRange"
                   :table-data="tableData"
                   :totalNum="totalNum"
                   :pageSize="pageSize"
                   :curPage="curPage"
                   :pageNo="pageNo"
                   :loading="loading"
                   :kind="kind"
                   :filterConObj="filterConObj"
                   @updateAdmin="updateAdmin"
                   ref="tableCard"
                   :is-refresh-table="isRefreshTable"
                   @loadData="loadData"
                   @cardFilter="handleCardFilter"
                   :data-type="dataType"
                   @changePieDate="changePieDate"
                   @changePieType="changePieType">
        </tableCard>
<!--        <div style="position: fixed;bottom: 5px; right: 5px" v-if="isConfig">-->
<!--            <Icon custom="custom-delete-component" size="36" @click="removeFromDashBoard"></Icon>-->
<!--        </div>-->
        <deleteIcon @removeFromDashBoard="removeFromDashBoard" style="position: absolute;bottom: 0px; right: 0px"/>
    </div>
</template>

<script>
    import tableCard from './card-table';
    import { getSleepReminder, getBusinessStats, getWorkLoadStats, getKeyAcc, getMailStats, getStaffToDoList, getTargetDetail, getAnnualPerformance, getFollowUpOverview } from '@/api/dashBoard/dashBoardV2';

    import { mapState } from 'vuex';
    import deleteIcon from '../deleteIcon';
    import util from '@/libs/util';

    export default {
        name: 'index',
        props: ['kind'],
        components: {
            tableCard,
            deleteIcon
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                fullName: state => state.fullName,
                orgId: state => state.enterpriseId
            }),
            isConfig() {
                return this.$store.state.dashboard.isConfiguring;
            }
        },
        data() {
            return {
                // 全局
                // 接口请求条件 - 下载数据用, 但目前用此方式的组件只有"邮件处理"
                filterConObj: {},

                tableColumns: [],
                tableDetail: {},
                bodyStyle: {},
                canvasStyle: {},
                dateRange: [(Date.now() - 3600 * 1000 * 24 * 29), Date.now()],
                isAdmin: 0, // 默认个人视角
                tableData: [],
                loading: true,
                pageNo: 1,
                totalPage: null,
                isRefreshTable: true,
                dataType: 1,
                pieStartDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1 < 10 ?  '0' + Number(new Date().getMonth() + 1) : new Date().getMonth() + 1}-01`,
                pieEndDate: this.dateFormat(Date.now()),

                totalNum: 0,
                pageSize: 10,
                curPage: 1,

                // axios 取消请求
                cancelFunc_getStaffToDoList: null
            };
        },
        methods: {
            init() {
                let res;
                let title = this.$t(`dashBoardV2.Title.${this.kind}`);
                this.tableDetail['title'] = title;
                switch (this.kind) {
                    case 'business':
                        // 业务详情
                        this.tableColumns = [
                            {
                                key: 'userName',
                                title: this.$t('dashBoardV2.Table.charger'),
                                align: 'left',
                                width: 80
                            },
                            {
                                key: 'companyCount',
                                title: this.$t('dashBoardV2.Table.customerNum'),
                                align: 'left',
                                width: 54
                            },
                            {
                                key: 'inquiryCount',
                                title: this.$t('dashBoardV2.Table.inquiryNum'),
                                align: 'left',
                                width: 54
                            },
                            {
                                key: 'transactionInquiryCount',
                                title: this.$t('dashBoardV2.Table.dealInquiryNum'),
                                align: 'left',
                                width: 60
                            },
                        ];
                        this.bodyStyle = {
                            height: '376px',
                        };
                        this.canvasStyle = {
                            // height: '300px',
                            height: '300px'
                        }
                        break;
                    case 'workload':
                        // 工作量统计
                        this.tableColumns = [
                            {
                                key: 'userName',
                                title: this.$t('dashBoardV2.Table.createPerson'),
                                align: 'left',
                                width: 80
                            },
                            {
                                key: 'newClueCount',
                                title: this.$t('dashBoardV2.Table.newClueNum'),
                                align: 'left',
                                width: 48
                            },
                            {
                                key: 'highseasClueCount',
                                title: this.$t('dashBoardV2.Table.highseasClueCount'),
                                align: 'left',
                                width: 72
                            },
                            {
                                key: 'newCompanyCount',
                                title: this.$t('dashBoardV2.Table.newCustomerNum'),
                                align: 'left',
                                width: 48
                            },
                            {
                                key: 'newInquiryCount',
                                title: this.$t('dashBoardV2.Table.newInquiryNum'),
                                align: 'left',
                                width: 48
                            },
                            {
                                key: 'highseasCompanyCount',
                                title: this.$t('dashBoardV2.Table.highseasInquiryCount'),
                                align: 'left',
                                width: 72
                            },
                            {
                                key: 'followupCount',
                                title: this.$t('dashBoardV2.Table.followNum'),
                                align: 'left',
                                width: 48
                            }
                        ];
                        this.bodyStyle = {
                            height: '376px'
                        };
                        this.canvasStyle = {
                            height: '300px'
                        }
                        break;
                    case 'keyAccount':
                        // 重点跟进客户
                        this.tableColumns = [
                            {
                                key: 'userName',
                                title: this.$t('dashBoardV2.Table.charger'),
                                align: 'left',
                                width: 80
                            },
                            {
                                key: 'importantCompanyCount',
                                title: this.$t('dashBoardV2.Table.keyAccNum'),
                                align: 'left',
                                width: 60
                            },
                            {
                                key: 'importantInquiryCount',
                                title: this.$t('dashBoardV2.Table.keyInquiryNum'),
                                align: 'left',
                                width: 60
                            },
                        ];
                        this.bodyStyle = {
                            height: '376px'
                        };
                        this.canvasStyle = {
                            height: '300px'
                        }
                        break;
                    case 'mail':
                        // 邮件处理
                        this.tableColumns = [
                            {
                                key: 'userName',
                                title: this.$t('dashBoardV2.Table.charger'),
                                align: 'left',
                                width: 80
                            },
                            {
                                key: 'sendMailCount',
                                title: this.$t('dashBoardV2.Table.mailSentNum'),
                                align: 'left',
                                width: 60
                            },
                            {
                                key: 'receiveMailCount',
                                title: this.$t('dashBoardV2.Table.mailReceivedNum'),
                                align: 'left',
                                width: 60
                            },
                            {
                                key: 'replyMailCount',
                                title: this.$t('dashBoardV2.Table.mailRepliedNum'),
                                align: 'left',
                                width: 60
                            },
                            {
                                key: 'replyRate',
                                title: this.$t('dashBoardV2.Table.mailReplyRate'),
                                align: 'left',
                                width: 40
                            },
                        ];
                        this.bodyStyle = {
                            height: '376px'
                        }
                        this.canvasStyle = {
                            height: '300px'
                        }
                        break;
                    case 'todoList':
                        // 员工代办事项
                        this.tableColumns = [
                            {
                                key: 'userName',
                                title: this.$t('dashBoardV2.Table.charger'),
                                align: 'left',
                                width: 80
                            },
                            {
                                key: 'unreadMailCount',
                                title: this.$t('dashBoardV2.Table.mailUnread'),
                                align: 'left',
                                width: 48
                            },
                            {
                                key: 'pendingMailCount',
                                title: this.$t('dashBoardV2.Table.mailToDeal'),
                                align: 'left',
                                width: 60
                            },
                            {
                                key: 'transferInquiryCount',
                                title: this.$t('dashBoardV2.Table.inquiry2MeIn7Days'),
                                align: 'left',
                                width: 103
                            },
                            {
                                key: 'retreatIntoHighSeasInquiryCount',
                                title: this.$t('dashBoardV2.Table.inquiry2HighSeaIn7Days'),
                                align: 'left',
                                width: 115
                            },
                            {
                                key: 'needToFocusOnInquiryCount',
                                title: this.$t('dashBoardV2.Table.keyInquiry'),
                                align: 'left',
                                width: 84
                            },
                        ];
                        this.bodyStyle = {
                            height: '376px'
                        }
                        this.canvasStyle = {
                            height: '300px'
                        }
                        break;
                    case 'target':
                        this.tableColumns = [
                            {
                                key: 'userName',
                                title: this.$t('dashBoardV2.Table.charger'),
                                align: 'left',
                                width: 80
                            },
                            {
                                key: 'targetValue',
                                title: this.$t('dashBoardV2.Table.target'),
                                align: 'left',
                                width: 80
                            },
                            {
                                key: 'completed',
                                title: this.$t('dashBoardV2.Table.accomplished'),
                                align: 'left',
                                width: 80
                            },
                            {
                                key: 'undone',
                                title: this.$t('dashBoardV2.Table.unaccomplished'),
                                align: 'left',
                                width: 80
                            },
                            {
                                key: 'completedRate',
                                title: this.$t('dashBoardV2.Table.accomplishRate'),
                                align: 'left',
                                width: 80
                            },
                        ];
                        this.bodyStyle = {
                            height: '376px'
                        }
                        this.canvasStyle = {
                            height: '300px'
                        }
                        break;
                    case 'targetOverview':
                        this.tableColumns = [
                            {
                                key: 'userName',
                                title: this.$t('dashBoardV2.Table.charger'),
                                align: 'left',
                                width: 80
                            },
                            {
                                key: 'targetValue',
                                title: this.$t('dashBoardV2.Table.target'),
                                align: 'left',
                                width: 80
                            },
                            {
                                key: 'completed',
                                title: this.$t('dashBoardV2.Table.accomplished'),
                                align: 'left',
                                width: 80
                            },
                            {
                                key: 'undone',
                                title: this.$t('dashBoardV2.Table.unaccomplished'),
                                align: 'left',
                                width: 80
                            },
                            {
                                key: 'completedRate',
                                title: this.$t('dashBoardV2.Table.accomplishRate'),
                                align: 'left',
                                width: 80
                            },
                        ];
                        this.bodyStyle = {
                            height: '376px'
                        }
                        this.canvasStyle = {
                            height: '300px'
                        }
                        break;
                    case 'followUpOverview':
                        // 客户跟进情况概览
                        this.tableColumns = [
                            {
                                key: 'companyName',
                                title: this.$t('dashBoardV2.Table.companyName'),
                                align: 'left',
                                width: 80
                            },
                            {
                                key: 'followUpCount',
                                title: this.$t('dashBoardV2.Table.followupCount'),
                                align: 'left',
                                width: 80
                            },
                            {
                                key: 'customerReach',
                                title: this.$t('dashBoardV2.Table.customerReach'),
                                align: 'left',
                                width: 80
                            },
                            {
                                key: 'mainInquiryFollowupStatus',
                                title: this.$t('dashBoardV2.Table.mainInquiryFollowupStatus'),
                                align: 'left',
                                width: 80
                            },
                            {
                                key: 'userNames',
                                title: this.$t('dashBoardV2.Table.userNames'),
                                align: 'left',
                                width: 80
                            }
                        ];
                        this.bodyStyle = {
                            height: '376px'
                        };
                        this.canvasStyle = {
                            height: '300px'
                        };
                        break;
                    case 'remind':
                        let res;
                        let title = this.$t(`dashBoardV2.Title.${this.kind}`);
                        this.tableDetail['title'] = title;
                        this.tableColumns = [{
                            key: 'nonFollowupDays',
                            title: this.$t('dashBoardV2.Table.nonFollowupDays'),
                            align: 'left',
                            width: 100,
                            fixed: true
                        }]
                        this.changeUserList(this.userId, this.fullName)
                        this.bodyStyle = {
                            height: '376px'
                        };
                        this.canvasStyle = {
                            height: '300px'
                        };
                        break;
                }
                this.bodyStyle.padding = '20px';
                this.getStats();
            },
            dateFormat(timeStamp, divider = '-') {
                if (!timeStamp) {
                    return '';
                }

                let time = new Date(timeStamp);
                let y = time.getFullYear();
                let m = time.getMonth() + 1;
                m = m < 10 ? '0' + m : m;
                let d = time.getDate();
                d = d < 10 ? '0' + d : d;
                return `${y}${divider}${m}${divider}${d}`;
            },
            async getStats() {
                this.loading = true;
                let res;
                const that = this;
                const admin = this.isAdmin;
                const startDate = this.dateFormat(this.dateRange[0]);
                const endDate = this.dateFormat(this.dateRange[1]);
                const data = {
                    admin,
                    startDate,
                    endDate,
                    orgId: this.orgId,
                    userId: this.userId,
                    pageSize: this.pageSize,
                    pageNo: this.pageNo
                };
                let targetData = {};
                switch (this.kind) {
                    case 'business':
                        res = await getBusinessStats(data);
                        if (res.code === '1') {
                            // 滚动加载前记录表格当前 scrollTop , 滚动加载完毕后重置回之前的 scrollTop , 避免页面回到顶部
                            if (this.$refs.tableCard) {
                                this.$refs.tableCard.keepOffset();
                            }

                            if (admin === 0) {
                                this.tableData = res.data.list;
                            } else {
                                this.tableData = this.tableData.concat(res.data.list);
                            }
                            this.totalPage = Math.ceil(res.data.total / 10);
                        }
                        this.loading = false;
                        break;
                    case 'workload':
                        res = await getWorkLoadStats(data);
                        if (res.code === '1') {
                            // 滚动加载前记录表格当前 scrollTop , 滚动加载完毕后重置回之前的 scrollTop , 避免页面回到顶部
                            if (this.$refs.tableCard) {
                                this.$refs.tableCard.keepOffset();
                            }

                            if (admin === 0) {
                                this.tableData = res.data.list;
                            } else {
                                this.tableData = this.tableData.concat(res.data.list);
                            }
                            this.totalPage = Math.ceil(res.data.total / 10);
                        }
                        this.loading = false;
                        break;
                    case 'keyAccount':
                        res = await getKeyAcc(data);
                        if (res.code === '1') {
                            // 滚动加载前记录表格当前 scrollTop , 滚动加载完毕后重置回之前的 scrollTop , 避免页面回到顶部
                            if (this.$refs.tableCard) {
                                this.$refs.tableCard.keepOffset();
                            }

                            if (admin === 0) {
                                this.tableData = res.data.list;
                            } else {
                                this.tableData = this.tableData.concat(res.data.list);
                            }
                            this.totalPage = Math.ceil(res.data.total / 10);
                        }
                        this.loading = false;
                        break;
                    case 'mail':
                        res = await getMailStats(data);
                        if (res.code === '1') {
                            this.filterConObj = data;
                            // 滚动加载前记录表格当前 scrollTop , 滚动加载完毕后重置回之前的 scrollTop , 避免页面回到顶部
                            if (this.$refs.tableCard) {
                                this.$refs.tableCard.keepOffset();
                            }

                            if (admin === 0) {
                                this.tableData = res.data.list;
                            } else {
                                this.tableData = this.tableData.concat(res.data.list);
                            }
                            this.totalPage = Math.ceil(res.data.total / 10);
                        } else {
                            this.filterConObj = {};
                        }
                        this.loading = false;
                        break;
                    case 'todoList':
                        // 取消上次请求准备重新请求, 准备发送新情求
                        if (typeof this.cancelFunc_getStaffToDoList === 'function') {
                            this.cancelFunc_getStaffToDoList();
                        }

                        // 发送新请求
                        res = await getStaffToDoList(data, new util.axios.CancelToken(function executor(c) {
                            // An executor function receives a cancel function as a parameter
                            that.cancelFunc_getStaffToDoList = c;
                        }));
                        // 请求成功, 处理数据
                        if (res.code === '1') {
                            // 滚动加载前记录表格当前 scrollTop , 滚动加载完毕后重置回之前的 scrollTop , 避免页面回到顶部
                            if (this.$refs.tableCard) {
                                this.$refs.tableCard.keepOffset();
                            }

                            this.tableData = this.tableData.concat(res.data.list);
                            this.totalPage = Math.ceil(res.data.total / 10);
                        }

                        // 如果不是主动取消请求, 则取消 loading
                        if (!util.axios.isCancel(res)) {
                            this.loading = false;
                        }
                        break;
                    case 'target':
                        targetData = {
                            admin: this.isAdmin,
                            startDate: this.pieStartDate,
                            endDate: this.pieEndDate,
                            orgId: this.orgId,
                            userId: this.userId,
                            pageSize: this.pageSize,
                            pageNo: this.pageNo,
                            year: new Date(this.pieStartDate).getFullYear(),
                            targetType: this.dataType
                        }
                        res = await getTargetDetail(targetData);
                        if (res.code === '1') {
                            // 滚动加载前记录表格当前 scrollTop , 滚动加载完毕后重置回之前的 scrollTop , 避免页面回到顶部
                            if (this.$refs.tableCard) {
                                this.$refs.tableCard.keepOffset();
                            }
                            this.tableData = this.isAdmin === 0 ? res.data.list : this.tableData.concat(res.data.list);
                            this.totalPage = Math.ceil(res.data.total / 10);
                        }
                        this.loading = false
                        break;
                    case 'targetOverview':
                        targetData = {
                            orgId: this.orgId,
                            userId: this.userId,
                            year: new Date().getFullYear(),
                            targetType: this.dataType
                        };
                        res = await getAnnualPerformance(targetData);
                        if (res.code === '1') {
                            this.tableData = this.tableData.concat(res.data);
                        }
                        this.loading = false;
                        break;
                }
            },
            updateAdmin(val) {
                this.isRefreshTable = true;
                this.loading = true;
                this.tableData = [];
                this.isAdmin = val;
                this.pageNo = 1;
                // this.appendInfinitScroll()
                this.getStats();
            },
            loadData() {
                if (this.pageNo >= this.totalPage) {
                    this.$Message.warning('没有更多的数据了');
                    return false;
                }
                this.pageNo++;
                this.getStats();
            },
            appendInfinitScroll() {
                let parent = document.querySelector(`.tableScroll${this.kind}`);
                let dom = parent.querySelector('.el-table__body-wrapper')
                dom.addEventListener('scroll', (v) => {
                    const scrollDistance = dom.scrollHeight - dom.scrollTop - dom.clientHeight;
                    if (scrollDistance <= 0) {
                        // 判断是否到达总页数
                        if (this.pageNo >= this.totalPage) {
                            this.$Message.warning('没有更多的数据了');
                        } else {
                            this.loadData();
                        }
                    } else {
                        console.log('scroll none');
                    }
                })
            },
            renderHeader_filter(colIndex) {
                return h => {
                    const column = this.tableColumns[colIndex];
                    const title = h('div', {
                        attrs: {
                            title: column.title
                        },
                        class: 'table-filter-title',
                        title: column.title
                    }, column.title);
                    const helpTip = [
                        'transactionInquiryCount',
                        'followupCount',
                        // 'sendMailCount',
                        // 'receiveMailCount',
                        // 'replyMailCount',
                        'importantCompanyCount',
                        'importantInquiryCount',
                        'unreadMailCount',
                        'pendingMailCount',

                        'companyName',
                        'followUpCount',
                        'customerReach',
                        'mainInquiryFollowupStatus',
                        'nonFollowupDays',
                        'emptyTip'
                    ].includes(column.key) ? h('HelpTip', {
                        class: 'table-head-tip',
                        props: {
                            title: (key => {
                                return this.$t(`helpTip.${key}`);
                            })(column.key)
                        }
                    }) : undefined;
                    return h('div', {
                        class: 'table-filter-container'
                    }, [title, (helpTip)]);
                };
            },
            removeFromDashBoard() {
                this.$emit('removeFromDashBoard', this.kind);
            },
            async changePieDate(val) {
                this.pieStartDate = val[0];
                this.pieEndDate = val[1];
                this.pageNo = 1;
                this.totalPage = null;
                const targetData = {
                    admin: this.isAdmin,
                    startDate: this.pieStartDate,
                    endDate: this.pieEndDate,
                    orgId: this.orgId,
                    userId: this.userId,
                    pageSize: this.pageSize,
                    pageNo: this.pageNo,
                    year: new Date(val[0]).getFullYear(),
                    targetType: this.dataType
                };
                const overViewData = {
                    orgId: this.orgId,
                    userId: this.userId,
                    year: new Date().getFullYear(),
                    targetType: this.dataType
                };
                const res = this.kind === 'target' ? await getTargetDetail(targetData) : await getAnnualPerformance(overViewData);
                if (res.code === '1') {
                    this.tableData = this.kind === 'target' ? res.data.list : res.data;
                    this.totalPage = Math.ceil(res.data.total / 10);
                }
            },
            async changePieType(val) {
                this.dataType = val;
                this.pageNo = 1;
                this.totalPage = null;
                const targetData = {
                    admin: this.isAdmin,
                    startDate: this.pieStartDate,
                    endDate: this.pieEndDate,
                    orgId: this.orgId,
                    userId: this.userId,
                    pageSize: this.pageSize,
                    pageNo: this.pageNo,
                    year: new Date(this.pieStartDate).getFullYear(),
                    targetType: this.dataType
                };
                const overViewData = {
                    orgId: this.orgId,
                    userId: this.userId,
                    year: new Date().getFullYear(),
                    targetType: this.dataType
                };
                const res = this.kind === 'target' ? await getTargetDetail(targetData) : await getAnnualPerformance(overViewData);
                if (res.code === '1') {
                    this.tableData = this.kind === 'target' ? res.data.list : res.data;
                    this.totalPage = Math.ceil(res.data.total / 10);
                }

            },

            handleCardFilter(data) {
                let { filterType, userId, userName } = data;
                if (filterType === 'date') {
                    if (['workload', 'keyAccount', 'mail', 'business'].includes(this.kind)) {
                        this.tableData = [];
                        this.pageNo = 1;
                        this.getStats();
                    } else {
                        this.changePage(1);
                    }
                }
                if (filterType === 'users') {
                    this.changeUserList(userId, userName);
                }
            },
            /* 翻页 */
            async changePage(index) {
                this.pageNo = index;
                this.loading = true;
                const targetData = {
                    orgId: this.orgId,
                    userId: this.userId,
                    startDate: this.dateFormat(this.dateRange[0]),
                    endDate: this.dateFormat(this.dateRange[1]),
                    pageNo: this.pageNo,
                    pageSize: this.pageSize
                };
                const res = await getFollowUpOverview(targetData);
                if (res.code === '1') {
                    this.tableData = res.data.list.map(item => {
                        return Object.assign(item, {
                            followUpCount: item.followupCount
                        });
                    });
                    this.totalNum = res.data.total;
                }
                this.loading = false;
            },
            async changeUserList (id, principalName) {
                this.tableColumns = [{
                    key: 'nonFollowupDays',
                    title: this.$t('dashBoardV2.Table.nonFollowupDays'),
                    align: 'left',
                    width: 100,
                    fixed: true,
                    renderHeader: this.renderHeader_filter(0)
                }]
                this.loading = false;
                let orgId = this.orgId;
                let userId = id;
                let name = principalName;
                let res = await getSleepReminder({orgId, userId});
                if (res.code === '1') {
                    let data = res.data;
                    let empty;
                    for (let i = 0; i < data.customerType.length; i++) {
                        let temp = data.customerType[i]
                        let item = {
                            key: temp === '空' ? 'emptyTip' : temp,
                            title: temp === '空' ? '空' : temp,
                            align: temp === '空' ? 'center' : 'left',
                            width: temp === '空' ? null : 100,
                            renderHeader: this.renderHeader_filter(i+1)
                        }
                        if (temp === '空') {
                            empty = item
                            break
                        }
                        this.tableColumns.push(item);
                    }
                    this.tableColumns.push(empty);
                    let arr = [];
                    let _this = this
                    $.each(data.stats, function (key, value) {
                        if (value) {
                            let obj = {};
                            for (let i = 0; i < value.length; i++) {
                                let temp = value[i];
                                if (temp.customerType === '空') {
                                    obj.emptyTip = temp.count
                                } else {
                                    obj[temp.customerType] = temp.count;
                                }
                                obj.nonFollowupDays = _this.$t('dashBoardV2.Table.' + key);
                                obj.userName = name
                                obj.userId = id
                            }
                            arr.push(obj);
                        }
                    })
                    arr.sort(this.compare('nonFollowupDays'))
                    this.tableData = arr;
                }
                this.loading = false;
            },
            compare (key) {
                return function(a,b){
                    var val1 = a[key].match(/\d+/)[0];
                    var val2 = b[key].match(/\d+/)[0];
                    return val1 - val2;
                }
            }
        },
        created() {
            this.init();
            this.$nextTick(() => {
                this.tableColumns = this.tableColumns.map((col, index) => {
                    col.renderHeader = this.renderHeader_filter(index);
                    return col;
                })
            })
        },
        mounted() {
            // this.appendInfinitScroll()
        },
    };
</script>

<style scoped lang="less">
    .b-r {
        border-radius: 8px;
    }
</style>
