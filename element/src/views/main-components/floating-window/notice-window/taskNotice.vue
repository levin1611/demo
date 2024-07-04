<template>
    <div>
        <!-- header -->
        <div class="floating-window-header">
            <!-- 标题 -->
            <div class="floating-window-header-title notice-window-header">{{ $t('noticeWindow.taskNotice') }} {{ total > 0 ? `(${ total })` : '' }}</div>
            <!-- 右侧按钮 -->
            <div class="floating-window-fix-icon notice-window-header-icon">
                <!-- 返回应用中心 -->
                <Tooltip :content="$t('back')">
                    <Icon custom="custom-field-recover"
                          @click.native="returnAppCenter"
                          style="margin-right: 20px;top: -1px;"
                          class="cursor-pointer"></Icon>
                </Tooltip>
                <!-- 关闭分屏 -->
                <Tooltip :content="$t('close')">
                    <Icon custom="custom-modal-close"
                          @click.native="close_window"
                          class="cursor-pointer"></Icon>
                </Tooltip>
            </div>
        </div>
        <div class="search-btn">
            <span :class="{active: noticeType == 1}" @click="searchList(1)">{{$t('noticeWindow.noDone')}}（{{ unCompletedTotal > 0 ? unCompletedTotal : '0' }}）</span>
            <span :class="{active: noticeType == 2}" @click="searchList(2)">{{$t('noticeWindow.Done')}}（{{ completedTotal > 0 ? completedTotal : '0' }}）</span>
        </div>
        <!-- 正体 -->
        <div style="position:relative">
            <ul v-infinite-scroll="getList"
                :infinite-scroll-distance="10"
                :infinite-scroll-disabled="noMore || loading_getList"
                :infinite-scroll-immediate="false"
                v-loading="loading_getList"
                ref="noticeListContainer"
                class="notice-list">
                <template v-for="(notice, index) in noticeList">
                    <!-- 时间分割(按月) -->
                    <li v-if="notice.timeMark"
                        class="notice-tip">
                        <span>{{ notice.timeMark }}</span>
                        <!-- 全部已读 -->
                        <!-- <div v-if="index === 0"
                             @click="markAll"
                             class="notice-markAll">{{ $t('message.allRead') }}</div> -->
                    </li>

                    <!-- 提醒 -->
                    <li ref="noticeItem"
                        @click.stop="clickNotice(notice, index)"
                        class="notice-item">
                        <!-- <span :class="{'is-read': notice.readStatus !== 2, 'is-read-point': true}"></span> -->
                        <div>
                            <!-- 标题 -->
                            <TooltipAuto :content="notice.taskName">
                                <span :class="{'notice-item-content': true}">{{ notice.taskName }}</span>
                            </TooltipAuto>
                            <!-- 内容 -->
                            <!-- <div class="detail-info-clip">{{ notice.taskDetails }}</div> -->
                            <div class="relat-obj-type">
                                <span class="notice-taskend-time">{{$t('noticeWindow.associatedTitle')}}：</span>
                                <span @click.stop="jumpToCustomer(JSON.parse(notice.relatInquiryDescription).companyId)" class="relat-obj-text" v-if="notice.relatObjType == 1">
                                    {{ JSON.parse(notice.relatInquiryDescription).companyName }}
                                </span>
                                <span @click.stop="jumpToInquiry(JSON.parse(notice.relatInquiryDescription).companyId, JSON.parse(notice.relatInquiryDescription).inquiryId)" class="relat-obj-text" v-if="notice.relatObjType == 1">
                                    {{ JSON.parse(notice.relatInquiryDescription).inquirySeqNumber }}
                                </span>
                                <span @click.stop="jumpToMail(JSON.parse(notice.relatObjDescription), $event)" class="relat-obj-text" v-if="notice.relatObjType == 2">{{(!!notice.relatObjDescription && JSON.parse(notice.relatObjDescription).mailBoxTypeName) ? JSON.parse(notice.relatObjDescription).mailBoxTypeName + '' + JSON.parse(notice.relatObjDescription).mailSubject : '' }}</span>
                            </div>
                            <div class="notice-taskend-time">{{$t('noticeWindow.Deadline')}}：{{ notice.taskEndTime | toLocaleTime }}</div>
                            <!-- 时间 -->
                            <div class="notice-item-time">{{ notice.createTime | toLocaleTime }}</div>
                        </div>
                        <!-- <span :class="{'task-status': true , 'task-success': notice.taskStatus === 2}">{{notice.taskStatus === 1 ? '未完成' : notice.taskStatus === 2 ? '已完成' : ''}}</span> -->
                    </li>
                </template>

                <!-- 无数据提醒 -->
                <li v-if="!noticeList.length"
                    class="notice-nodata">
                    <img :src="`${publicPath}image/nodata.png`"/>
                    {{ $t('message.noRemind') }}</li>
            </ul>
        </div>

        <!-- 详情页 -->
        <SplitDetail :visible.sync="visible_detail"
                     :type="type_detail"
                     :principalIds="principalIds"
                     :detailInfo="detailInfo"></SplitDetail>
        <!-- 任务弹窗 -->
        <TaskModal :visible.sync="modalShow"
                   :type="modalType"
                   :disabled="false"
                   fromModule="companyDetail"
                   :taskObjProp.sync="selected_task"
                   refreshMethodName="getTask"></TaskModal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import { crmCompany } from '@/api/crm/index';
    import TaskModal from '@/views/crm/Detail/Components/Modal/taskModals';
    import SplitDetail from '@/views/main-components/floating-window/notice-window/components/Html/splitDetail';

    export default {
        name: 'taskNotice',
        props: [
            'isDrawerShow',
            'floatWindowType'
        ],
        components: {
            SplitDetail,
            TaskModal
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                taskNoticeFlag: state => state.app.taskNoticeFlag,
                is_refrash_task_list: state => state.dashboard.is_refrash_task_list,
                departmentPeople: state => state.mail.departmentPeople // 邮件下属人员 任务提醒与 系统消息提醒 跳转时用到
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            fromInquiryObj() {
                return {
                    inquiryId: this.inquiryId,
                    inquirySeqNumber: this.inquirySeqNumber,
                    companyId: this.companyId,
                    companyName: this.companyName
                };
            },
            selected_task() {
                return this.noticeList.find(item => item.id === this.selected_taskId) || {};
            }
        },
        data() {
            return {
                /* 任务 */
                noticeList: [],
                unreadCount: 0,
                pageNo: 0,
                // 每次请求数据条数
                pageSize: 20,

                /* 分离的详情页 */
                visible_detail: false,
                // 管理的人员
                principalIds: [],
                type_detail: '',
                detailInfo: {},
                // 取消对 systemNoticeFlag 的监听
                unwatch: null,
                /* Modal 相关 */
                selected_taskId: 0,
                modalType: 'showTask',
                modalShow: false,
                inquiryId: '',
                inquirySeqNumber: '',
                companyId: '',
                companyName: '',
                unclaimedStatus: '',
                noticeType: 1,
                unCompletedTotal: 0,
                completedTotal: 0,
                loading_getList: false,
                // 静态资源文件地址
                publicPath: process.env.BASE_URL,
                noMore: false

            };
        },
        filters: {
            // 时间戳转日期时间字符串显示
            toLocaleTime(str) {
                try {
                    const date = new Date(str);
                    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                } catch (e) {
                    console.error(e);
                    return str;
                }
            }
        },
        methods: {
            /* 全局 */
            // 分屏显示时触发
            handleShow() {
                // 数据置空并重新请求
                this.noticeList = [];
                this.pageNo = 0;
                this.loading_getList = false;
                this.getList();
                // 获取管理权限下的人员
                this.getPrincipalIds();
            },
            // 分屏隐藏时触发
            handleHide() {
                // 关闭详情页
                this.visible_detail = false;

                // 清空 active
                Array.isArray(this.$refs.noticeItem) && this.$refs.noticeItem.forEach(item => item.classList.remove('notice-item-active'));
            },

            /* header */
            // 关闭分屏
            close_window() {
                // 关闭分屏
                this.$emit('windowClose');
                // 关闭详情页
                this.visible_detail = false;
            },
            // 返回到应用中心
            returnAppCenter() {
                // 打开应用中心
                this.$store.commit('changeAppCenterVisible', true);
                // 关闭分屏
                setTimeout(() => {
                    this.close_window();
                }, 400);
            },
            searchList(type) {
                this.noticeType = type;
                this.noticeList = [];
                this.pageNo = 0;
                this.loading_getList = false;

                this.getList();
            },
            /* 任务 */
            // 获取任务提醒
            getList() {
                // 设置请求页数
                const pageNo = this.pageNo + 1;
                const vm = this;
                this.loading_getList = true;
                return new Promise((resolve, reject) => {
                    util.ajax({
                        url: '/crm/task/getPastRemindList',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            participantsId: this.userId,
                            pageSize: this.pageSize,
                            pageNo,
                            taskStatus: this.noticeType
                        },
                        cancelToken: new util.axios.CancelToken(function executor(c) {
                            // An executor function receives a cancel function as a parameter
                            vm.cancelFunc = c;
                        })
                    }).then(response => {
                        this.loading_getList = false;
                        if (response.data.code === '1') {
                            // 设置总未读数
                            this.unreadCount = response.data.data.unCompletedTotal;
                            this.unCompletedTotal = response.data.data.unCompletedTotal;
                            this.completedTotal = response.data.data.completedTotal;
                            this.total = response.data.data.total;
                            // 本次请求得到的数据
                            const dataList = response.data.data.list;

                            if (dataList.length) {
                                // 更新数据
                                this.handleData(dataList);
                                this.pageNo = pageNo;
                                this.noMore = false;
                            } else {
                                this.noMore = true;
                                // 提示, 数据全部加载完成
                                if (this.noticeList.length) {
                                    // 有滚动条时, 提醒用户已经无法加载更多了
                                    if (this.$refs.noticeListContainer.scrollHeight > this.$refs.noticeListContainer.clientHeight) {
                                        this.$Message.info(this.$t('noticeWindow.noMore'));
                                    }
                                }
                            }
                        } else {
                            // 提示, 请求数据失败
                            this.$Message.error(this.$t('noticeWindow.error_getTaskNotice'));
                        }
                        resolve(true);
                    }).catch(error => {
                        this.loading_getList = false;
                        // 提示, 请求数据失败
                        console.error(error);
                        this.$Message.error(this.$t('noticeWindow.error_getTaskNotice'));
                        resolve(true);
                    });
                });
            },
            // 处理数据
            handleData(dataList) {
                // 去除原有 noticeList 中和传入的新获取数据 dataList id 一致的部分
                let noticeList = this.noticeList.filter(notice => dataList.findIndex(item => item.id === notice.id) === -1);
                // 拼接新传入数据
                noticeList = noticeList.concat(dataList);
                // 按 createTime 从大到小排序
                noticeList = noticeList.sort((a, b) => b.createTime - a.createTime);
                // 数据处理(增加时间相关属性)
                let preMonth = 0;
                noticeList = noticeList.map(item => {
                    const date = new Date(item.createTime);
                    const month = date.getMonth() + 1;
                    let timeMark = '';
                    if (month !== preMonth) {
                        timeMark = this.$options.filters.timeFormat(date, 'YearMonth');
                    }
                    preMonth = month;
                    return {
                        ...item,
                        timeMark
                    };
                });
                this.noticeList = noticeList;
            },
            // 全部标为已读
            markAll() {
                util.ajax({
                    url: '/crm/task/updateReadStatus',
                    method: 'post',
                    data: {
                        operateType: 1,
                        participantsId: this.userId,
                        readStatus: 2
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        // 全部标为已读
                        this.noticeList.forEach(item => {
                            item.readStatus = 2;
                        });
                        // 未读数置为 0
                        this.unreadCount = 0;
                    } else {
                        // 提示, 全部标为已读失败
                        this.$Message.error(this.$t('message.error_setReadStatus'));
                    }
                }).catch(error => {
                    // 提示, 全部标为已读失败
                    console.error(error);
                    this.$Message.error(this.$t('message.error_setReadStatus'));
                });
            },
            /**
             * @Description: 获取管理权限下的人员
             * @author mayuanzhi
             * @date 2020/7/27
             */
            getPrincipalIds() {
                util.ajaxJson({
                    url: '/new-privilege/manage/getusers',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.principalIds = res.data.data;
                    }
                });
            },
            // 点击提醒
            clickNotice(notice, index) {
                // 更改 active 显示
                this.$refs.noticeItem.forEach(item => item.classList.remove('notice-item-active'));
                this.$refs.noticeItem[index].classList.add('notice-item-active');
                /* Modal 相关 */
                this.selected_taskId = notice.id;
                this.modalShow = true;

                // 标为已读
                if (notice.readStatus !== 2) {
                    util.ajax({
                        url: '/crm/task/updateReadStatus',
                        method: 'post',
                        data: {
                            participantsId: this.userId,
                            ids: notice.id,
                            operateType: 2,
                            readStatus: 2
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            // 标为已读
                            notice.readStatus = 2;
                            // 未读数 - 1
                            this.unreadCount > 0 && this.unreadCount--;
                        } else {
                            // 提示, 标为已读失败
                            this.$Message.error(this.$t('message.error_setReadStatus'));
                        }
                    }).catch(error => {
                        // 提示, 标为已读失败
                        console.error(error);
                        this.$Message.error(this.$t('message.error_setReadStatus'));
                    });
                }

                // 打开详情页
                this.detailInfo = notice;
                this.type_detail = 'task';
                // this.visible_detail = true;
            },
            jumpToMail(obj, e) {
                const mailId = obj.mailId;
                const createUserId = obj.mailCreateUserId || undefined;
                /* 跳转前要进行功能权限以及邮件是否被彻底删除的校验 */
                util.ajaxMailJson({
                    url: '/mail/mailDetail',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        id: mailId,
                        createUserId: createUserId
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
            getTask() {
                this.pageNo = 0;
                this.noticeList = [];
                this.getList();
                this.loading_getList = false;
                this.$store.commit('setIsRefrashTaskList', !this.is_refrash_task_list);
            }
        },
        created() {
            // 监听到系统通知有变更, 则数据置空并重新请求, 更新未读数给应用中心使用
            this.unwatch = this.$watch('taskNoticeFlag', this.$throttle(() => {
                this.pageNo = 0;
                this.noticeList = [];
                this.getList();
                this.loading_getList = false;
            }, 1000, 3000));
        },
        beforeDestroy() {
            // 组件销毁前前未读数置为 0
            this.$store.commit('setNoticeUnread', {
                type: 'taskUnreadCount',
                count: 0
            });
            // 组件销毁前取消对系统通知变更的监听
            this.unwatch();
        },
        watch: {
            // 更新未读数
            unreadCount: {
                handler(val) {
                    this.$store.commit('setNoticeUnread', {
                        type: 'taskUnreadCount',
                        count: val
                    });
                },
                immediate: true
            },
            isDrawerShow(val) {
                // 分屏显示时, 数据置空并重新请求
                if (val) {
                    if (this.floatWindowType === 'taskNotice') {
                        this.handleShow();
                    }
                }

                // 部分数据恢复到初始状态
                this.handleHide();
            }
        }
    };
</script>
<style scoped>
.notice-item{
    position: relative;
}
.notice-item-content  {
    display: block;
    width: 280px;
    line-height: 24px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: rgba(0, 0, 0, 0.8);
}
.relat-obj-type {
    font-size: 12px;
    line-height: 20px;
}
.relat-obj-text {
    color: #4285F2;
}
.task-status {
    float: right;
    color: rgba(0, 0, 0, 0.6);
    font-size: 12px;
    position: absolute;
    right: 15px;
}
.task-success {
    color: #00CC99;
}
.notice-taskend-time{
    color: rgba(0, 0, 0, 0.8);
    font-size: 12px;
}
.search-btn span.active::after {
    width: 42px;
}
.notice-nodata img {
    width: 354px;
    margin-top: 190px;
    display: block;
    margin: 190px auto 0;
}
.notice-nodata{
    color: rgba(0, 0, 0, 0.4);
    font-size: 12px;
    text-align: center;
}
</style>
