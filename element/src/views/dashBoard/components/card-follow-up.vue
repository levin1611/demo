<template>
<div class="b-r">
    <Card class="table_card _b_r" body-style="height:376px;">
        <div class="table_header _f _j_b">
            <div class="table_header_left _f _c _j_b">
                <span class="table_title">{{$t('dashBoardV2.Title.followUpTask')}}</span>
            </div>
            <div class="_f _j_b">
                <div class="table_header_right">
                    <!-- 日期Select-->
                    <cardFilter 
                        filterType="date"
                        filterKey="date"
                        :filterValue="timeRange"
                        :cardType="kind"
                        @handleFilter="handleFilter"
                    >
                    </cardFilter>
                </div>
            </div>
        </div>
        <div class="table_body" v-loading="loading">
            <Table :data="tableData"
                   highlight-current-row
                   ref="table"
                   size="medium"
                   height="266px"
                   max-height="266px"
                   class="noBoxShadow-right noborder-table dashBoard_table tabmain"
                   :class="`tableScroll${kind}`"
                   v-if="refresh_table_flag"
                   @mouseenter.native="ctrlScrollBar(0)"
                   @mouseleave.native="ctrlScrollBar(1)" >
                <TableColumn v-for="item in tableColumns"
                             :key="item.key"
                             :prop="item.key"
                             :label="item.title"
                             :align="item.align || 'center'"
                             :width="item.width"
                             :min-width="item.width || 64"
                             :show-overflow-tooltip="true"
                             :render-header="item.renderHeader">
                    <template slot-scope="scope">
                        <template v-if="redirectList.includes(item.key)">
                            <span class="hoverBtn" :class="`piwik_${item.key}`" @click="jumpToDetail(item.key, scope.row.userId, scope.row.userName)">
                                {{scope.row[item.key]===null ? 0 : scope.row[item.key]}}
                            </span>
                        </template>
                        <template v-else>{{scope.row[item.key]}}</template>
                    </template>
                </TableColumn>
            </Table>
            <div class="text-right" style="padding:11px 0px">
                <Page :page-size="pageSize"
                    small
                    :total="totalNum"
                    :current-page="curPage"
                    layout="total, prev, pager, next"
                    @current-change="changePage"
                ></Page>
            </div>
        </div>
    </Card>
     <deleteIcon @removeFromDashBoard="removeFromDashBoard" style="position: absolute;bottom: 0px; right: 0px"/>
</div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import { debounce } from 'lodash';
    import cardFilter from './card-tables/card-filter';
    import deleteIcon from './deleteIcon';
    export default {
        name: 'card-follow-up',
        components: {
            cardFilter,
            deleteIcon
        },
        data() {
            return {
                loading:false,
                tableColumns:[
                    {
                        key: 'userName',
                        title: this.$t('dashBoardV2.FollowUpTable.salesMan'),
                        align: 'left'
                    },
                    {
                        key: 'pendingMailCount',
                        title: this.$t('dashBoardV2.FollowUpTable.email'),
                        align: 'left'
                    },
                    {
                        key: 'pendingClueCount',
                        title: this.$t('dashBoardV2.FollowUpTable.clue'),
                        align: 'left'
                    },
                    {
                        key: 'pendingCustomerCount',
                        title: this.$t('dashBoardV2.FollowUpTable.customer'),
                        align: 'left'
                    },
                ],
                tableData:[],
                showLoadingOpts: {
                    text: '数据加载中...',
                    color: '#fd7a35',
                    textColor: '#fd7a35',
                    maskColor: 'rgba(255, 255, 255, 1)',
                    zlevel: 0
                }, // echarts 加载数据or无数据时的展示
               
                redirectList: [
                    'pendingMailCount',
                    'pendingClueCount',
                    'pendingCustomerCount'
                ], // 可以跳转的tableColumns数组
                emailList: [],
                isBindMail: false, // 是否绑定邮箱
                isHaveRight: false, // 是否有查看下属邮件权限
                kind:'cardFollowUp',
                refresh_table_flag:true,
                //分页数据
                pageSize:10,
                curPage:1,
                maxPageNum: 1,
                totalNum:0,
                targetType: 1,
                targetDate: 'thisMonth',
                timeRange: [new Date().getTime(),new Date().getTime()],//[new Date(),new Date()],
                isSetgoal: false,
                completedRate: '',
            }
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                orgId: state => state.enterpriseId,
                userName: state => state.userName,
                window_width: state => state.window_width
            }),
            ...mapGetters([
                'isContainsMenu'
            ])
        },
        methods: {
            getData(){
                const startDate = this.timeRange.length?this.dateFormat(this.timeRange[0]):undefined;
                const endDate = this.timeRange.length?this.dateFormat(this.timeRange[1]):undefined;
                const orgId = this.orgId;
                const userId = this.userId;
                const pageSize = this.pageSize;
                const data = {
                    startDate,
                    endDate,
                    orgId,
                    userId,
                    pageSize,
                    pageNo: this.curPage
                }
                 util.ajaxJson({
                    url: '/dashboard/report/getFollowupTaskStats',
                    method: 'POST',
                    data: data
                }).then(res => {
                    if (res.data.code === '1') {
                        this.tableData = res.data.data.list;
                        this.totalNum = res.data.data.total;
                        this.maxPageNum = Math.ceil(this.totalNum / this.pageSize);
                        this.refresh_table_flag = false;
                        this.$nextTick(() => {
                            this.refresh_table_flag = true;
                        });
                        setTimeout(()=>{
                            this.ctrlScrollBar(1);
                        },0)
                    } else {
                        this.tableData = [];
                        this.totalNum =0,
                        this.maxPageNum = 0; 
                    }
                    setTimeout(() => {
                        this.loading = false;
                    }, 500);
                });  
            },
            // 改变页码
            changePage(page) {
                if (page <= this.maxPageNum) {
                    this.curPage = page;
                    this.getData();
                }
            },
            dateFormat(timeStamp, divider = '-') {
                let time = new Date(timeStamp);
                let y = time.getFullYear();
                let m = time.getMonth() + 1;
                m = m < 10 ? '0' + m : m;
                let d = time.getDate();
                d = d < 10 ? '0' + d : d;
                return `${y}${divider}${m}${divider}${d}`;
            },
            async jumpToDetail(type, userId, userName) {
                /**
                 * @params userId  点击表格中某一行的用户id
                 * */
                let config;
                let isHaveMailAuthority;
                switch (type) {
                    case 'pendingClueCount':
                        // 跳转线索
                        if (this.isContainsMenu('my_clue')) {
                            config = [
                                // ['companyManagers', [{label: userName,value: userId}]],
                                ['status', [{value: 1, label: this.$t('clue.unfollowed')}]],
                                ['saleName', [{label: userName,value: userId}]]
                            ];
                            if(this.timeRange.length){
                                config.unshift(['createTime', this.timeRange])
                            }
                        
                            localStorage.setItem('dashboard_clue_filter', JSON.stringify(config));
                            localStorage.setItem('dashboard_clue_type', JSON.stringify(3));
                            this.$stm.openNewWindow(this.$router.resolve({
                                name: 'my_clue'
                            }).href);
                        } else {
                            this.$Message.error(this.$t('globalSearch.haveNoPermissionMyClue'));
                        }
                        break;
                    case 'pendingCustomerCount':
                        if (this.isContainsMenu('myCustomer')) {
                            config = [
                                {key:'cpCompanyManagers',val:userId},
                                {key:'cpFollowUpCount',val:0},
                                {key:'cpCreateTime',val:this.timeRange},
                                {key:'customerViewValue',val:1}
                            ];
                            localStorage.setItem('dashboard_customer_search_filters', JSON.stringify(config));
                            this.$stm.openNewWindow(this.$router.resolve({
                                name: 'myCustomer'
                            }).href);
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                        }
                        break;
                    case 'pendingMailCount':
                        isHaveMailAuthority = await this.isHaveMailAuthority(userId);
                        if (!isHaveMailAuthority) {
                            if (!this.isHaveRight) {
                                this.$Message.error(this.$t('dashBoardV2.tips.noRight'));
                            }
                            return false;
                        }
                        if (!this.isContainsMenu('mail')) {
                            this.$Message.error(this.$t('dashBoardV2.tips.noMailMenu'));
                            return false;
                        }
                        localStorage.setItem('dashboard_mail_filters', JSON.stringify({
                            boxName: 'untreated',
                            personId: userId,
                            personName: userName,
                            emailList: this.emailList,
                            filterCons: [
                                {
                                    key: 'date',
                                    val: this.timeRange
                                },
                            ]
                        }));
                        this.$stm.openNewWindow(this.$router.resolve({
                            name: 'mail_home'
                        }).href);
                        break;
                }
            },
            async isHaveMailAuthority(clickId) {
                const p1 = this.isHaveRightPromise(clickId);
                await Promise.all([p1]).then(() => {});
                return this.isHaveRight;
            },
            isHaveAuthority(inquiryId) {
                return util.ajax({
                    url: 'crm/mailbox/isHaveAuthority',
                    method: 'get',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        inquiryId: inquiryId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        if (res.data.data === 1) {
                            return true;
                        } else if (res.data.data === 2) {
                            this.$Message.warning(this.$t('crm.Modal.error_JumpInquiryInHighseas'));
                            return false;
                        } else if (res.data.data === 3) {
                            this.$Message.warning(this.$t('crm.Modal.error_JumpInquiryMerged'));
                            return false;
                        } else {
                            this.$Message.warning(this.$t('crm.Modal.error_JumpInquiryHaveNoPermission'));
                            return false;
                        }
                    }
                });
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
                })
            },
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
                })
            },
            ctrlScrollBar(flag) {
                try {
                    let parent = document.querySelector(`.tableScroll${this.kind}`);
                    let dom = parent.querySelector('.el-table__body-wrapper');
                    if (flag === 0) {
                        dom.style.overflow = 'overlay';
                    } else {
                        dom.style.overflow = 'hidden';
                    }
                } catch {

                }
            },
            handleFilter(date){
                console.log(date)
                this.timeRange = date.filterValue;
                this.getData();
            },
            removeFromDashBoard(){
                 this.$emit('removeFromDashBoard', this.kind);
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
                        'pendingMailCount',
                        'pendingClueCount',
                        'pendingCustomerCount',
                    ].includes(column.key) ? h('HelpTip', {
                        class: 'table-head-tip',
                        props: {
                            title: (key => {
                                return this.$t(`helpTip.cardFollowUp.${key}`);
                            })(column.key)
                        }
                    }) : undefined;
                    return h('div', {
                        class: 'table-filter-container'
                    }, [title, (helpTip)]);
                };
            },
        },
        created() {
            /**
             * 如果当前月份是1月份 则时间筛选中去掉上一个月这个选项
             * 如果是Q1 则去掉上季度这个选项
             * 后续如果开放支持跨年筛选时
             * 可以去掉下面的代码
             * */
            // const myMonth = new Date().getMonth() + 1;
            // if (myMonth === 1) {
            //     this.dateOptions = this.dateOptions.filter(date => date.value !== 'lastMonth');
            // };
            // if ([1,2,3].includes(myMonth)) {
            //     this.dateOptions = this.dateOptions.filter(date => date.value !== 'prevPeriod');
            // }
            // this.startDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
            // this.endDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
            this.tableColumns = this.tableColumns.map((col, index) => {
                col.renderHeader = this.renderHeader_filter(index);
                return col;
            });
            this.getData();
        },
        mounted() {
            this.timeRange = [new Date().getTime(),new Date().getTime()];
        },
    };
</script>
<style scoped lang="less">
    @import "./cardtables.less";
</style>
