<template>
    <div style="font-size: 12px;color: rgba(0,0,0,0.8)">
        <Row style="margin: 20px 10px;" >
            <div class="task-detail-taskName">{{ $t('message.taskName') }}</div>
            <div class="task-detail-content">{{ task.taskName }}</div>
        </Row>
        <Row style="margin: 20px 10px;">
            <div class="task-detail-taskName">{{ $t('message.deadline') }}</div>
            <div class="task-detail-content">{{ task.taskEndTime | timeFormat('DateTime') }}</div>
        </Row>
        <Row style="margin: 20px 10px;">
            <div class="task-detail-taskName">{{ $t('message.participants') }}</div>
            <div class="task-detail-content">{{ $options.filters.parseArray(task.participantsJson).length ?
                $options.filters.parseArray(task.participantsJson).map(item => item.userName).join(', ') :
                $t('message.error') }}
            </div>
        </Row>
        <Row v-if="task.relatObjType == 2" style="margin: 20px 10px;">
            <div class="task-detail-taskName">关联对象</div>
            <!-- <div class="task-detail-taskName">{{ $t('message.relevanceInquiry') }}</div> -->
            <div class="task-detail-content relevance"  @click="jumpToMail(JSON.parse(task.relatObjDescription))">
                <a class="relevance">{{task.relatObjDescription ? JSON.parse(task.relatObjDescription).mailSubject : $t('message.error') }}</a>
            </div>
        </Row>
        <Row  v-if="task.relatObjType == 1" style="margin: 20px 10px;">
            <div class="task-detail-taskName">关联对象</div>
            <!-- <div class="task-detail-taskName">{{ $t('message.relevanceInquiry') }}</div> -->
            <div class="task-detail-content" style="position: relative">
                <Spin fix v-show="isLoading"><Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon></Spin>
                <a class="relevance" @click="clickCompany" style="margin-right: 10px">{{companyName}}</a>
                <a class="relevance" @click="clickInquiry">{{inquirySeqNumber}}</a>
            </div>
        </Row>
        <Row style="margin: 20px 10px;font-size:13px">
            <div class="task-detail-taskName">{{ $t('message.taskInfo') }}</div>
            <div class="task-detail-content">{{ task.taskDetails }}</div>
        </Row>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import util from '@/libs/util';
    import { crmInquiry } from '@/api/crm/index';

    export default {
        name: 'taskDetail',
        props: [
            'task',
            'principalIds'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                button_list: state => state.app.button_list
            }),
            ...mapGetters([
                'isContainsMenu'
            ])
        },
        data() {
            return {
                companyPrincipal: [],
                inquiryPrincipal: [],
                companyName: '',
                inquirySeqNumber: '',
                isLoading: false
            };
        },
        methods: {
            getInquiryShortInfo(id) {
                return new Promise((resolve, reject) => {
                    crmInquiry.getSimpleInquiry({ id: id }).then(response => {
                        resolve(response);
                    }).catch(err => {
                        reject();
                    });
                });
            },
            getCompanyShortInfo(companyId) {
                return new Promise((resolve, reject) => {
                    util.ajax({
                        url: '/crm/company/getCompanyManagersWithGH',
                        method: 'get',
                        params: {
                            companyId: companyId
                        }
                    }).then(response => {
                        resolve(response.data);
                    }).catch(err => {
                        reject();
                    });
                });
            },
            async clickCompany() {
                // 跳到公司
                if (!this.isContainsMenu('myCustomer')) {
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                } else {
                    this.companyPrincipal = [];
                    try {
                        const obj = JSON.parse(this.task.relatInquiryDescription);
                        let temp = false;
                        if (obj.companyId) {
                            const res = await this.getCompanyShortInfo(obj.companyId);
                            if (res.code === '1') {
                                // "data":{"-1":"公海"} 其它情况是负责人id
                                this.companyPrincipal = Object.keys(res.data);
                            }
                            if (this.companyPrincipal[0] !== '-1' && this.companyPrincipal.length > 0) {
                                // this.principalIds当前用户管理权限下的id数组，如果包含公司负责人就允许跳转
                                for (let i = 0; i < this.companyPrincipal.length; i++) {
                                    if (this.principalIds.indexOf(Number(this.companyPrincipal[i])) > -1) {
                                        temp = true;
                                        break;
                                    }
                                }
                                if (temp) {
                                    this.$viewCustomer(obj.companyId);
                                } else {
                                    this.$Message.error(this.$t('crm.Modal.error_JumpCustomerHaveNoPermission'));
                                }
                            } else {
                                if (!this.isContainsMenu('highseasCustomer')) {
                                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionHighseasCustomer'));
                                } else {
                                    localStorage.setItem('leadsCloud-inquiryId', obj.inquiryId);
                                    // localStorage.setItem('leadsCloud-customer-companyId', obj.companyId);
                                    this.$viewHighSeasCustomer(obj.companyId);
                                }
                            }
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_companyId'));
                        }
                    } catch (e) {
                        return false;
                    }
                }
            },
            async clickInquiry() {
                this.inquiryPrincipal = [];
                try {
                    const obj = JSON.parse(this.task.relatInquiryDescription);
                    // return obj.inquirySeqNumber;
                    /**
                     * @Description: 点击预提醒通知时需要先请求接口判断该询盘当前的状态是否是公海，是跳转到公海管理，否跳转到询盘管理
                     * @author mayuanzhi
                     * @date 2020/7/27
                     */
                    const data = await this.$store.dispatch('judgmentInquiry', obj.inquiryId);
                    if (data.code === '1') {
                        if (data.data && data.data.unclaimedStatus === 1) {
                            if (!this.isContainsMenu('highseasCustomer')) {
                                this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionHighseasCustomer'));
                            } else {
                                localStorage.setItem('leadsCloud-inquiryId', obj.inquiryId);
                                this.$viewHighSeasCustomer(obj.companyId);
                            }
                        } else {
                            if (!this.isContainsMenu('myInquiry')) {
                                this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyInquiry'));
                            } else {
                                let temp = false;
                                const res = await this.getInquiryShortInfo(obj.inquiryId);
                                if (res.code === '1') {
                                    this.inquiryPrincipal = res.data.userIdsShow.split(',');
                                }
                                // this.principalIds当前用户管理权限下的id数组，如果包含询盘负责人就允许跳转
                                for (let i = 0; i < this.inquiryPrincipal.length; i++) {
                                    if (this.principalIds.indexOf(Number(this.inquiryPrincipal[i])) > -1) {
                                        temp = true;
                                        break;
                                    }
                                }
                                if (temp) {
                                    localStorage.setItem('leadsCloud-inquiryId', obj.inquiryId);
                                    window.open(this.$router.resolve({
                                        name: 'myInquiry'
                                    }).href, '_blank');
                                } else {
                                    this.$Message.error(this.$t('crm.Modal.error_JumpInquiryHaveNoPermission'));
                                }
                            }
                        }
                    }
                } catch (e) {
                    return false;
                }
            },
            /* 跳转至邮件，并进行跳转前校验 */
            jumpToMail(obj) {
                const mailId = obj.mailId;
                const createUserId = obj.createUserId;
                /* 跳转前要进行功能权限以及邮件是否被彻底删除的校验 */
                util.ajaxMailJson({
                    url: '/mail/mailDetail',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        id: mailId,
                        createUserId
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
            }
        },
        watch: {
            task: {
                handler(val) {
                    this.companyName = '';
                    this.inquirySeqNumber = '';
                    if (val) {
                        try {
                            this.isLoading = true;
                            const obj = JSON.parse(val.relatInquiryDescription);
                            // 根据公司id获取公司名称，fix：由于公司名称修改的而relatInquiryDescription保存的是旧名称的问题
                            util.ajax({
                                url: '/crm/company/get',
                                method: 'post',
                                data: {
                                    id: obj.companyId
                                }
                            }).then(response => {
                                this.isLoading = false;
                                if (response.data.code === '1') {
                                    this.companyName = response.data.data.companyName;
                                } else {
                                    this.companyName = obj.companyName;
                                }
                            }).catch(error => {
                                this.isLoading = false;
                                this.companyName = obj.companyName;
                            });
                            this.inquirySeqNumber = obj.inquirySeqNumber;
                        } catch (e) {
                            console.log(e);
                        }
                    }
                },
                immediate: true
            }
        }
    };
</script>
<style>
    .relevance:hover{
        text-decoration: underline;
    }
    .task-detail-taskName{
        width: 90px;
        float: left;
    }
    .task-detail-content{
        margin-left: 90px;
        cursor: pointer;
    }
</style>
