<template>
    <div class="b-r">
        <TaskModals
                :type="modleType"
                :taskObjProp.sync="taskDetail"
                :visible.sync="modleShow"
                :fromModule="fromModule || 'workBench'"
                refreshMethodName="editTaskFinished">
        </TaskModals>
        <Card style="overflow: unset" class="_b_r">
           
            <div v-if="workBenchType==='allInquiry'">
                <DepartmentTree
                    ref="departmentTree"
                    :accountList="accountList"
                    @SelectedPerson="SelectedPerson"
                    @EmailFlag="refreshEmailList"
                    @closeOtherPoptip="closeOtherPoptip">
                </DepartmentTree>
                <fullcalendar
                        ref="fullcalendarTaskList"
                        :fromModule="fromModule || ''"
                        :view="fullcalendarView"
                        :letCalendarRefresh="letCalendarRefresh"
                        @isCalendarRefresh="isCalendarRefresh">
                </fullcalendar>
            </div>
            <Row v-else>
                <Col :span="18">
                    <fullcalendar
                            :fromModule="fromModule || ''"
                            :view="fullcalendarView"
                            :letCalendarRefresh="letCalendarRefresh"
                            @isCalendarRefresh="isCalendarRefresh">
                    </fullcalendar>
                </Col>
                <Col :span="6" class="crm-tasks-list" style="padding-left:10px">
                    <RadioGroup v-model="tabPosition">
                        <RadioButton label="left">{{$t('crm.WorkBench.recentTask')}}</RadioButton>
                        <RadioButton label="right">{{$t('crm.WorkBench.overdueTask')}}</RadioButton>
                    </RadioGroup>
                    <div v-if="tabPosition === 'left'" style="max-height:760px;overflow-y:auto">
                        <ul v-for="(recentTask, index) in recentTasks" :key="index">
                            <li class="rightTasks" @click="getTaskDetailById(recentTask.id)">
                                <p style="color: rgba(0,0,0,0.80);">{{recentTask.taskName}} </p>
                                <p v-if="recentTask.relatObjType == 1 && !!recentTask.relatInquiryDescription && JSON.parse(recentTask.relatInquiryDescription).companyName" style="font-size: 12px;color: rgba(0,0,0,0.60);">
                                    关联对象：<span @click.stop="jumpToCustomer(JSON.parse(recentTask.relatInquiryDescription).companyId)" style="color: #4285F2;cursor: pointer;">
                                        {{ JSON.parse(recentTask.relatInquiryDescription).companyName + ' ' }}
                                    </span>
                                    <span @click.stop="jumpToInquiry(JSON.parse(recentTask.relatInquiryDescription).companyId, JSON.parse(recentTask.relatInquiryDescription).inquiryId)" style="color: #4285F2;cursor: pointer;">
                                        {{ JSON.parse(recentTask.relatInquiryDescription).inquirySeqNumber }}
                                    </span>
                                    <!-- {{new Date(recentTask.taskEndTime).format('yyyy-MM-dd hh:mm:ss')}} -->
                                </p>
                                <p v-if="recentTask.relatObjType == 2" style="font-size: 12px;color: rgba(0,0,0,0.60);">
                                    关联对象：
                                    <span @click.stop="jumpToMail(JSON.parse(recentTask.relatObjDescription))" style="color: #4285F2;cursor: pointer;" v-if="!!recentTask.relatObjDescription && JSON.parse(recentTask.relatObjDescription).mailBoxTypeName">
                                        {{ JSON.parse(recentTask.relatObjDescription).mailBoxTypeName + '' + JSON.parse(recentTask.relatObjDescription).mailSubject }}
                                    </span>
                                    <!-- {{new Date(recentTask.taskEndTime).format('yyyy-MM-dd hh:mm:ss')}} -->
                                </p>
                                <p style="font-size: 12px;color: rgba(0,0,0,0.60);">{{ $t('crm.WorkBench.participants') }}：{{recentTask.participants}}</p>
                                <span style="color: rgba(0,0,0,0.60);font-weight: 400;font-size: 12px;">{{new Date(recentTask.taskEndTime).format('yyyy-MM-dd hh:mm:ss')}}</span>
                            </li>
                        </ul>
                    </div>
                    <div v-else style="max-height:760px;overflow-y:auto">
                        <ul v-for="(overdueTask, index) in overdueTasks" :key="index">
                            <li class="rightTasks" @click="getTaskDetailById(overdueTask.id)">
                                <p style="color: rgba(0,0,0,0.80);">{{overdueTask.taskName}}</p>
                                <p v-if="overdueTask.relatObjType == 1 && !!overdueTask.relatInquiryDescription && JSON.parse(overdueTask.relatInquiryDescription).companyName" style="font-size: 12px;color: rgba(0,0,0,0.60);">
                                    关联对象：<span @click.stop="jumpToCustomer(JSON.parse(overdueTask.relatInquiryDescription).companyId)" style="color: #4285F2;cursor: pointer;">
                                        {{ JSON.parse(overdueTask.relatInquiryDescription).companyName + ' ' }}
                                    </span>
                                    <span @click.stop="jumpToInquiry(JSON.parse(overdueTask.relatInquiryDescription).companyId, JSON.parse(overdueTask.relatInquiryDescription).inquiryId)" style="color: #4285F2;cursor: pointer;">
                                        {{ JSON.parse(overdueTask.relatInquiryDescription).inquirySeqNumber }}
                                    </span>
                                </p>
                                <p v-if="overdueTask.relatObjType == 2" style="font-size: 12px;color: rgba(0,0,0,0.60);">
                                    关联对象：
                                    <span @click.stop="jumpToMail(JSON.parse(overdueTask.relatObjDescription))" style="color: #4285F2;cursor: pointer;" v-if="!!overdueTask.relatObjDescription && JSON.parse(overdueTask.relatObjDescription).mailBoxTypeName">
                                        {{ JSON.parse(overdueTask.relatObjDescription).mailBoxTypeName + '' + JSON.parse(overdueTask.relatObjDescription).mailSubject }}
                                    </span>
                                </p>
                                <!-- <p style="font-size: 12px;color: rgba(0,0,0,0.60);">
                                {{new Date(overdueTask.taskEndTime).format('yyyy-MM-dd hh:mm:ss')}}
                                </p> -->
                                <p style="font-size: 12px;color: rgba(0,0,0,0.60);">{{ $t('crm.WorkBench.participants') }}：{{overdueTask.participants}}</p>
                                <span  style="color: rgba(0,0,0,0.60);font-weight: 400;font-size: 12px;">{{new Date(overdueTask.taskEndTime).format('yyyy-MM-dd hh:mm:ss')}}</span>
                            </li>
                        </ul>
                    </div>
<!--                    <Tabs>-->
<!--                        <TabPane :label="$t('crm.WorkBench.recentTask')" style="max-height:500px;overflow-y:auto">-->
<!--                            <ul v-for="recentTask in recentTasks">-->
<!--                                <li class="rightTasks" @click="getTaskDetailById(recentTask.id)">-->
<!--                                    <p style="font-weight:700">{{recentTask.taskName}}</p>-->
<!--                                    <p>{{new Date(recentTask.taskEndTime).format('yyyy-MM-dd hh:mm:ss')}}</p>-->
<!--                                    <p>{{ $t('crm.WorkBench.participants') }}：{{recentTask.participants.join(",")}}</p>-->
<!--                                </li>-->
<!--                            </ul>-->
<!--                        </TabPane>-->
<!--                        <TabPane :label="$t('crm.WorkBench.overdueTask')" style="max-height:500px;overflow-y:auto">-->
<!--                            <ul v-for="overdueTask in overdueTasks">-->
<!--                                <li class="rightTasks" @click="getTaskDetailById(overdueTask.id)">-->
<!--                                    <p style="font-weight:700">{{overdueTask.taskName}}</p>-->
<!--                                    <p>{{new Date(overdueTask.taskEndTime).format('yyyy-MM-dd hh:mm:ss')}}</p>-->
<!--                                    <p>{{ $t('crm.WorkBench.participants') }}：{{overdueTask.participants.join(",")}}</p>-->
<!--                                </li>-->
<!--                            </ul>-->
<!--                        </TabPane>-->
<!--                    </Tabs>-->
                </Col>
            </Row>
        </Card>
<!--        <div style="position: fixed;bottom: 5px; right: 5px" v-if="isConfig">-->
<!--            <Icon custom="custom-delete-component" size="36" @click="removeFromDashBoard"></Icon>-->
<!--        </div>-->
        <deleteIcon @removeFromDashBoard="removeFromDashBoard" style="position: absolute;bottom: -10px; right: 1px"/>
    </div>
</template>

<script>
    import fullcalendar from './components/fullcalendar.vue';
    import TaskModals from '@/views/crm/Detail/Components/Modal/taskModals.vue';
    import { mapState, mapGetters } from 'vuex';
    import deleteIcon from '../../../dashBoard/components/deleteIcon';
    import { WorkBench, crmCompany } from '@/api/crm/index';
    import DepartmentTree from './components/departmentTree';
    import util from '@/libs/util';
    const { getWorkendTaskList, getWorkendTaskDetail } = WorkBench;

    export default {
        name: 'crmTasks',
        components: { fullcalendar, TaskModals, deleteIcon, DepartmentTree },
        props: {
            workBenchType: String,
            fromModule: String
        },
        data() {
            return {
                tabPosition: 'left',
                /* 顶部询盘概况 */
                top_loading: true,
                workBench_type: 'myInquiry',
                inquiryNumber: {},
                /* 任务 */
                recentTasks: [], // 近期任务
                overdueTasks: [], // 过期任务
                modleType: '',
                modleShow: false,
                taskDetail: '',
                letCalendarRefresh: false,
                fullcalendarView: 'month',
                accountList: [
                    {
                        id: '',
                        account: this.$t('mail.accountPlhNew')
                    }
                ]
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                departmentPeople: state => state.mail.departmentPeople // 邮件下属人员 任务提醒与 系统消息提醒 跳转时用到
            }), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu'
            ]),
            isConfig() {
                return this.$store.state.dashboard.isConfiguring;
            },
            isRefrashTaskList() {
                return this.$store.state.dashboard.is_refrash_task_list;
            }
        },
        methods: {
            // 切换邮箱
            SelectedPerson(user) {
                this.$refs.fullcalendarTaskList.refrashList(user);
            },
            refreshEmailList() {},
            closeOtherPoptip() {},
            /** 获取邮箱账号列表 */
            mockaccountList() {
                this.accountList = [
                    {
                        id: '',
                        account: this.$t('mail.accountPlh')
                    }
                ];
                util.ajaxMail({
                    url: `/mail/mailAccounts/user/${this.orgId}/${this.userId}`,
                    method: 'GET',
                    params: {
                        userId: this.userId // 登陆人的userid
                    }
                }).then((response) => {
                    if (response.data.code === 1) {
                        for (const item of response.data.data.accountList) {
                            this.accountList.push({
                                id: item.id,
                                account: item.emailAddress
                            });
                        }
                    } else {
                        this.$Message.error('邮箱账号列表获取失败,请刷新后重试');
                    }
                }).catch(() => {
                    this.$Message.error('邮箱账号列表获取失败,请刷新后重试');
                });
            },
            /* 获取近期任务和过期任务列表 */
            getWorkendTaskList() {
                getWorkendTaskList({
                    participantsId: this.userId,
                    orgId: this.enterpriseId
                }).then(response => {
                    if (response.code == 1) {
                        this.overdueTasks = response.data.pastList;
                        this.recentTasks = response.data.recentList;
                    }
                });
            },
            /* 获取任务详情 */
            getTaskDetailById(id) {
                getWorkendTaskDetail({
                    id: id
                }).then(response => {
                    if (response.code == 1) {
                        this.taskDetail = response.data;
                        this.modleType = 'showTask';
                        if (this.modleShow) {
                            this.modleShow = false;
                        }
                        ;
                        setTimeout(() => {
                            this.modleShow = true;
                        }, 1);
                    }
                });
            },
            /* 监听是否有任务更新 */
            isCalendarRefresh(data) {
                if (data === true) {
                    this.getWorkendTaskList();
                    this.$emit('updateTaskList');
                    // 重置刷新标识
                    this.letCalendarRefresh = false;
                }
            },
            deleteFinished() {
                this.letCalendarRefresh = true;
                this.getWorkendTaskList();
            },
            editTaskFinished() {
                this.letCalendarRefresh = true;
                this.getWorkendTaskList();
            },
            removeFromDashBoard() {
                this.$emit('removeFromDashBoard', 'crmTasks');
            },
            /* 跳转至邮件，并进行跳转前校验 */
            jumpToMail(obj) {
                const mailId = obj.mailId;
                const mailCreateUserId = obj.mailCreateUserId || this.userId;
                /* 跳转前要进行功能权限以及邮件是否被彻底删除的校验 */
                util.ajaxMailJson({
                    url: '/mail/mailDetail',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        id: mailId,
                        createUserId: mailCreateUserId
                    },
                    timeout: 60000
                }).then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data.mailDraftFlag) {
                            const obj = {};
                            obj.mailEdit = true;
                            obj.mailId = mailId;
                            obj.selectedMailBoxType = 'draftBox';
                            localStorage.setItem('leadsCloud-writeMailData', JSON.stringify(obj));
                            const forwardMailDetail = Object.assign(res.data.data, { id: mailId, from: 'globalSearch' });
                            localStorage.setItem('leadsCloud-currentPersonId', res.data.data.createUserId);
                            const href = window.location.origin + window.location.pathname + this.$router.resolve({
                                name: 'mail_home'
                            }).href;
                            localStorage.setItem('leadsCloud-timeLine-mailDetail', JSON.stringify(forwardMailDetail));
                            window.open(href, '_blank');
                        } else {
                            if (mailCreateUserId &&  `${mailCreateUserId}` !== `${this.userId}`) {
                                const currentInputInfo = this.departmentPeople.filter(item => item.createUserId === `${mailCreateUserId}`);
                                if (currentInputInfo.length) {
                                    const currentAccount = currentInputInfo.map(item => item.emailAddress);
                                    const jumpMailHome = JSON.stringify({ currentInputInfo: currentInputInfo[0].fullname, currentAccount: currentAccount });
                                    localStorage.setItem('leadsCloud-jumpMailHome', jumpMailHome);
                                } else {
                                    this.$Message.error('此邮件负责人没有设置"允许上级查看邮件"权限');
                                    return;
                                }
                            }
                            const forwardMailDetail = Object.assign(res.data.data, { id: mailId, from: 'globalSearch' });
                            localStorage.setItem('leadsCloud-currentPersonId', res.data.data.createUserId);
                            const href = window.location.origin + window.location.pathname + this.$router.resolve({
                                name: 'mail_home'
                            }).href;
                            localStorage.setItem('leadsCloud-timeLine-mailDetail', JSON.stringify(forwardMailDetail));
                            window.open(href, '_blank');
                        }
                    } else {
                        this.$Message.error(this.$t('globalSearch.mailBeDeleted'));
                    }
                });
            },
            jumpToCustomer(companyId) {
                const id = companyId;
                if (!this.isContainsMenu('myCustomer')) {
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                } else {
                    if (id) {
                        this.$viewCustomer(id);
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_companyId'));
                    }
                }
            },
            async jumpToInquiry(companyId, id) {
                await crmCompany.getCompany({
                    id: companyId
                }).then(response => {
                    if (response.code === '1') {
                        this.unclaimedStatus = response.data.unclaimedStatus;
                    }
                });
                if (this.unclaimedStatus === 1) {
                    if (!this.isContainsMenu('highseasCustomer')) {
                        this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionHighseasCustomer'));
                    } else {
                        if (id) {
                            localStorage.setItem('leadsCloud-inquiryId', id);
                        }

                        if (companyId) {
                            this.$viewHighSeasCustomer(companyId);
                        }
                    }
                } else {
                    if (!this.isContainsMenu('myInquiry')) {
                        this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyInquiry'));
                    } else {
                        if (id) {
                            localStorage.setItem('leadsCloud-inquiryId', id);
                            window.open(this.$router.resolve({
                                name: 'myInquiry'
                            }).href, '_blank');
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_inquiryId'));
                        }
                    }
                }
            },
            /* 顶部 Card 点击跳转 */
            // jumpToMyInquiry(type) {
            //     if (type) {
            //         // console.log(this.$parent);
            //         this.$emit('jumpToMyInquiry', type);
            //     }
            // },
        },
        created() {
            this.getWorkendTaskList();
            // this.mockaccountList();
        },
        watch: {
            workBenchType() {
                this.fullcalendarView = this.workBenchType === 'allInquiry' ? 'listWeek' : 'month';
            },
            isRefrashTaskList() {
                this.getWorkendTaskList();
            }
        }
    };
</script>

<style lang="less">
    .rightTasks {
        list-style-type: none;
        padding: 10px;
        border-bottom: 1px solid #EAEAEA;
        color: #979797;
    }
    .crm-tasks-list{
        .el-radio-button__orig-radio:checked+.el-radio-button__inner{
            background: #fff;
            color: #4285F4;
            border-color: #4285F4;
            box-shadow: -1px 0 0 0 #4285F4;
        }
        .el-radio-button__inner{
            font-size: 12px;
            height: 34px;
            line-height: 33px;
            padding: 0 5px;
            // width: 80px;
        }
        .el-radio-button__inner:hover{
            color: #4285F4;
        }
    }
    .b-r {
        border-radius: 8px;
    }
</style>
