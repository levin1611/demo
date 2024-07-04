<template>
    <div class="systemNotice">
        <!-- header -->
        <div class="floating-window-header">
            <!-- 标题 -->
            <div class="floating-window-header-title notice-window-header">{{ $t('noticeWindow.systemNotice') }} {{ totalCount > 0 ? `(${ totalCount })` : '' }}</div>
            <!-- 右侧按钮 -->
            <div class="floating-window-fix-icon notice-window-header-icon">
                <!-- 返回应用中心 -->
                <!-- <Tooltip :content="$t('back')">
                    <Icon custom="custom-field-recover"
                          @click.native="returnAppCenter"
                          style="margin-right: 20px;top: -1px;"
                          class="cursor-pointer"></Icon>
                </Tooltip> -->
                <!-- 关闭分屏 -->
                <Tooltip :content="$t('close')">
                    <Icon custom="custom-modal-close"
                          @click.native="close_window"
                          class="cursor-pointer"></Icon>
                </Tooltip>
            </div>
        </div>
        <div class="search-btn">
            <span :class="{active: noticeType == 0}" @click="searchList(undefined, 0)">{{$t('message.allBtn')}}</span>
            <!-- <span :class="{active: noticeType == 26}" @click="searchList(undefined, 26)">{{$t('message.taskBtn')}}（{{taskCount > 0 ? taskCount : '0'}}）</span> -->
        </div>
        <Spin v-if="loading_getList"
              fix></Spin>
        <!-- 正体 -->
        <div>
            <div style="padding: 10px 10px 3px 20px;">
                <Select v-model="apiKey" filterable clearable style="width: 120px" >
                    <Option v-for="(item,index) in objectList"
                        :key="index"
                        :label="item.label"
                        :value="item.value"></Option>
                </Select>
                <Checkbox style="margin-left: 15px;margin-right: 0" class="checkbox-type checkbox" @change="onlyNoReadChange"></Checkbox>
                <span class="only-noread">{{$t('message.UnreadTask')}}</span>
                <span @click="markAll" class="notice-markAll">{{ $t('message.allRead') }}</span>
            </div>
            <ul v-infinite-scroll="getList"
                :infinite-scroll-distance="10"
                :infinite-scroll-disabled="noMore || loading_getList"
                :infinite-scroll-immediate="false"
                v-loading="loading_getList"
                ref="noticeListContainer"
                class="notice-list"
                style="position:relative">
                <!-- <Spin v-if="loading_getList"
                    fix></Spin> -->
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
                        @click="clickNotice(notice, index)"
                        :class="{'piwik_fbAllocateConversationNotice': notice.relationObjType === 21}"
                        class="notice-item">
                        <span :class="{'is-read': notice.isRead !== 1, 'is-read-point': true}"></span>
                        <div>
                            <!-- 文件下载 -->
                            <template v-if="notice.relationObjType === 19">
                                <!-- 内容 -->
                                <span v-html="convertDownloadContent(notice.remindContent)"
                                    :class="{'bold': notice.isRead !== 1, 'notice-item-content': true}"></span>
                                <!-- 时间 -->
                                <div class="notice-item-time">{{ notice.createTime }}</div>
                            </template>

                            <!-- 评论/回复 -->
                            <template v-else-if="notice.relationObjType === 9">
                                <!-- 内容 -->
                                <span :class="{'bold': notice.isRead !== 1, 'notice-item-content': true}">
                                    <!-- 跟进记录 -->
                                    <!-- 兼容移动端，用双等不能用全等 -->
                                    <template v-if="JSON.parse(notice.remindContent).postType == 1">
                                        <!-- 被评论 -->
                                        <template v-if="JSON.parse(notice.remindContent).parentCommentatorId">
                                            <!-- 评论被回复 -->
                                            <template v-if="Number(JSON.parse(notice.remindContent).parentId) > 0">{{ `【${JSON.parse(notice.remindContent).commentatorName}】 ${$t('followupReply.commentReply')}` }}</template>
                                            <!-- 跟进记录被评论 -->
                                            <template v-else>{{ `【${JSON.parse(notice.remindContent).commentatorName}】 ${$t('followupReply.followupComment')}` }}</template>
                                        </template>
                                        <!-- 被 @ -->
                                        <template v-else>{{ `【${JSON.parse(notice.remindContent).commentatorName}】 ${$t('followupReply.notifyInFollowupComment')}` }}</template>
                                    </template>
                                    <!-- 邮件 -->
                                    <template v-else-if="JSON.parse(notice.remindContent).postType === 2">
                                        <!-- 被评论 -->
                                        <template v-if="JSON.parse(notice.remindContent).parentCommentatorId">
                                            <!-- 评论被回复 -->
                                            <template v-if="JSON.parse(notice.remindContent).parentId > 0">{{ `【${JSON.parse(notice.remindContent).commentatorName}】 ${$t('followupReply.commentReply')}` }}</template>
                                            <!-- 邮件被评论 -->
                                            <template v-else>{{ `【${JSON.parse(notice.remindContent).commentatorName}】 ${$t('followupReply.mailComment')}` }}</template>
                                        </template>
                                        <!-- 被 @ -->
                                        <template v-else>
                                            {{ `【${JSON.parse(notice.remindContent).commentatorName}】 ${$t('followupReply.notifyInMailComment')}` }}
                                        </template>
                                    </template>
                                </span>
                                <!-- 时间 -->
                                <div class="notice-item-time">{{ notice.createTime }}</div>
                            </template>

                            <!-- FB 对话分配客服提醒 -->
                            <template v-else-if="notice.relationObjType === 21">
                                <!-- 内容 -->
                                <span :class="{'bold': notice.isRead !== 1, 'notice-item-content': true}">
                                    {{ $t('fbDistribution.allocatedNoticeTip') }}:
                                    <br/>
                                    {{ JSON.parse(notice.remindContent).message }}
                                </span>
                                <!-- 时间 -->
                                <div class="notice-item-time">{{ notice.createTime }}</div>
                            </template>

                            <!-- wa 下属删除聊天记录提醒 -->
                            <template v-else-if="notice.relationObjType === 22">
                                <!-- 内容  后端返回的字段是拼接的,这里做了特殊处理 -->
                                <span :class="{'bold': notice.isRead !== 1, 'notice-item-content': true}">{{ notice.remindContent.split('=')[0] }}</span>
                                <!-- 时间 -->
                                <div class="notice-item-time">{{ notice.createTime }}</div>
                            </template>
                            <!-- 邮件批量eml文件下载 -->
                            <template v-else-if="notice.relationObjType === 25">
                                <!-- 内容 -->
                                <span :class="{'bold': notice.isRead !== 1, 'notice-item-content': true}">
                                    {{notice.remindContent.substring(notice.remindContent.indexOf('[') + 1,notice.remindContent.indexOf(']'))}}
                                </span>
                                <!-- 时间 -->
                                <div class="notice-item-time">{{ notice.createTime }}</div>
                            </template>

                            <template v-else-if="notice.relationObjType === 26">
                                <!-- <TooltipAuto :content="notice.operateType === 1 ? $t('message.newTask') + '：' + JSON.parse(notice.remindContent).taskName : $t('message.taskNotification') + '：' + JSON.parse(notice.remindContent).taskName"> -->
                                    <span :class="{'bold': JSON.parse(notice.remindContent).readStatus !== 2, 'notice-item-content': true}">{{ notice.operateType === 1 ? $t('message.newTask') : $t('message.taskNotification') }}：{{ JSON.parse(notice.remindContent).taskName }}</span>
                                <!-- </TooltipAuto> -->
                                <div class="relat-obj-type">
                                    <span>{{$t('noticeWindow.associatedTitle')}}：</span>
                                    <span @click.stop="jumpToCustomer(JSON.parse(JSON.parse(notice.remindContent).relatInquiryDescription).companyId)" class="relat-obj-text" v-if="JSON.parse(notice.remindContent).relatObjType == 1">
                                        {{ JSON.parse(JSON.parse(notice.remindContent).relatInquiryDescription).companyName }}
                                    </span>
                                    <span @click.stop="jumpToInquiry(JSON.parse(JSON.parse(notice.remindContent).relatInquiryDescription).companyId, JSON.parse(JSON.parse(notice.remindContent).relatInquiryDescription).inquiryId)" class="relat-obj-text" v-if="JSON.parse(notice.remindContent).relatObjType == 1">
                                        {{ JSON.parse(JSON.parse(notice.remindContent).relatInquiryDescription).inquirySeqNumber }}
                                    </span>
                                    <span @click.stop="jumpToMail(JSON.parse(JSON.parse(notice.remindContent).relatObjDescription), $event)" class="relat-obj-text" v-if="JSON.parse(notice.remindContent).relatObjType == 2">
                                        {{(!!JSON.parse(notice.remindContent).relatObjDescription && JSON.parse(JSON.parse(notice.remindContent).relatObjDescription).mailBoxTypeName) ? JSON.parse(JSON.parse(notice.remindContent).relatObjDescription).mailBoxTypeName + '' + JSON.parse(JSON.parse(notice.remindContent).relatObjDescription).mailSubject : '' }}
                                    </span>
                                </div>
                                <div class="notice-taskend-time">{{$t('noticeWindow.Deadline')}}：{{ JSON.parse(notice.remindContent).taskEndTime | toLocaleTime }}</div>
                                <div class="notice-item-time" v-if="notice.operateType === 2">{{ JSON.parse(notice.remindContent).remindTimeLatest | toLocaleTime }}</div>
                                <div class="notice-item-time" v-if="notice.operateType === 1">{{ JSON.parse(notice.remindContent).createTime | toLocaleTime }}</div>
                            </template>
                            <!-- 其他 -->
                            <template v-else>
                                <!-- 内容 -->
                                <!-- <TooltipAuto :content="notice.remindContent"> -->
                                    <span :class="{'bold': notice.isRead !== 1, 'notice-item-content': true}">{{ notice.remindContent }}</span>
                                <!-- </TooltipAuto> -->
                                <!-- 时间 -->
                                <div class="notice-item-time">{{ notice.createTime }}</div>
                            </template>
                        </div>
                    </li>
                </template>

                <!-- 无数据提醒 -->
                <li v-if="!noticeList.length"
                    class="notice-nodata">
                    <img :src="`${publicPath}image/nodata.png`"/>
                    {{ $t('message.noMessage') }}</li>
            </ul>
        </div>

        <!-- 跟进记录评论查看 -->
        <FollowupModal v-if="visible_followup_reply"
                       :visible.sync="visible_followup_reply"
                       :data="data_followup_reply"
                       :allUsers="allUsers"></FollowupModal>

        <!-- 邮件评论查看 -->
        <MailModal v-if="visible_mail_reply"
                   :visible.sync="visible_mail_reply"
                   :data="data_mail_reply"
                   :departmentPeople="departmentPeople"
                   :allUsers="allUsers"></MailModal>
        <!-- 任务弹窗 -->
        <TaskModal :visible.sync="modalShow"
                   :type="modalType"
                   :disabled="false"
                   fromModule="companyDetail"
                   :taskObjProp.sync="selected_task"
                   refreshMethodName="searchList"></TaskModal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import FollowupModal from '@/views/main-components/floating-window/notice-window/components/Modal/followupModal';
    import MailModal from '@/views/main-components/floating-window/notice-window/components/Modal/mailModal';
    import TaskModal from '@/views/crm/Detail/Components/Modal/taskModals';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { crmCompany } from '@/api/crm/index';

    export default {
        name: 'systemNotice',
        props: [
            'isDrawerShow',
            'floatWindowType'
        ],
        components: {
            FollowupModal,
            MailModal,
            TaskModal
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                button_list: state => state.app.button_list,
                systemNoticeFlag: state => state.app.systemNoticeFlag,
                replyNoticeData: state => state.app.replyNoticeData,
                allUsers: state => state.crm.allUsers, // 全部用户
                ableViewSub: state => state.whatsapp.ableViewSub,
                isFbService: state => state.isFbService,
                departmentPeople: state => state.mail.departmentPeople // 邮件下属人员 任务提醒与 系统消息提醒 跳转时用到
            }),
            // 按钮权限集合
            authorized_button() {
                return {
                    view_subordinates: !HANDLE_BUTTON(BUTTON_IDS.WhatsApp.view_subordinates, this.button_list)
                };
            },
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            selected_task() {
                const remindContent = this.noticeList.find(item => {
                    if (item.remindContent && item.relationObjType === 26) {
                        return JSON.parse(item.remindContent).id === this.selected_taskId;
                    }
                });
                return remindContent ? JSON.parse(remindContent.remindContent) : '{}';
            }
        },
        data() {
            return {
                /* 全局 */
                // 取消对 systemNoticeFlag 的监听
                unwatch: null,

                /* 系统通知 */
                noticeList: [],
                unreadCount: 0,
                totalCount: 0,
                pageNo: 0,
                // 是否正在请求中
                loading_getList: false,
                // 每次请求数据条数
                pageSize: 20,

                /* Modal 相关 */
                // 跟进记录评论
                visible_followup_reply: false,
                data_followup_reply: {},
                // 邮件评论
                visible_mail_reply: false,
                data_mail_reply: {},
                noticeType: 0,
                type_detail: '',
                modalType: 'showTask',
                modalShow: false,
                selected_taskId: 0,
                taskCount: 0,
                isRead: undefined,
                // 静态资源文件地址
                publicPath: process.env.BASE_URL,
                noMore: false,
                objectList: [
                    { label: '全部', value: '' }
                ],
                apiKey: ''
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
            onlyNoReadChange(e) {
                this.pageNo = 0;
                this.noticeList = [];
                if (e) {
                    this.isRead = 0;
                    this.getList();
                } else {
                    this.isRead = undefined;
                    this.getList();
                }
            },
            /* 全局 */
            // 分屏显示时触发
            handleShow() {
                // 数据置空并重新请求
                this.noticeList = [];
                this.pageNo = 0;
                this.loading_getList = false;
                this.getList();
                // 获取全部用户
                this.$store.dispatch('getAllUsers');
            },
            // 分屏隐藏时触发
            handleHide() {
                // 清空 active
                Array.isArray(this.$refs.noticeItem) && this.$refs.noticeItem.forEach(item => item.classList.remove('notice-item-active'));
            },

            /* header */
            // 关闭分屏
            close_window() {
                // 关闭分屏
                this.$emit('windowClose');
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

            /* 系统通知 */
            searchList(isRead, type) {
                this.pageNo = 0;
                this.noticeList = [];
                this.noticeType = type;
                this.loading_getList = false;
                this.getList(isRead, type);
            },
            // 获取系统通知
            getList() {
                // 正在请求, 不往下执行, 避免重复请求
                if (this.loading_getList) {
                    return;
                }

                // 设置请求页数
                // this.loading_getList = true;
                const pageNo = this.pageNo + 1;
                const vm = this;
                return new Promise((resolve, reject) => {
                    this.handleData([
                        {
                            "id": 16462263,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "【xcxcvbvw】任何情况下5天未成交将于2023年10月27日退入至公海",
                            "relationObjType": 17,
                            "seqId": "5544669",
                            "createTime": "2023-10-24 00:00:35",
                            "isRead": 0,
                            "isGongHai": null,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": null
                        },
                        {
                            "id": 16462264,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "【测试230115】任何情况下5天未成交将于2023年10月27日退入至公海",
                            "relationObjType": 17,
                            "seqId": "5544670",
                            "createTime": "2023-10-24 00:00:35",
                            "isRead": 0,
                            "isGongHai": null,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": null
                        },
                        {
                            "id": 16435056,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "【验证联系人邮箱0001】任何情况下5天未成交将于2023年10月28日退入至公海",
                            "relationObjType": 17,
                            "seqId": "5540674",
                            "createTime": "2023-10-23 00:00:33",
                            "isRead": 0,
                            "isGongHai": null,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": null
                        },
                        {
                            "id": 16435063,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "【xcxcvbvw】任何情况下5天未成交将于2023年10月27日退入至公海",
                            "relationObjType": 17,
                            "seqId": "5544669",
                            "createTime": "2023-10-23 00:00:33",
                            "isRead": 0,
                            "isGongHai": null,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": null
                        },
                        {
                            "id": 16435064,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "【测试230115】任何情况下5天未成交将于2023年10月27日退入至公海",
                            "relationObjType": 17,
                            "seqId": "5544670",
                            "createTime": "2023-10-23 00:00:33",
                            "isRead": 1,
                            "isGongHai": null,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": null
                        },
                        {
                            "id": 16434671,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "【jejdjjdjd】任何情况下5天未成交将于2023年10月27日退入至公海",
                            "relationObjType": 17,
                            "seqId": "5544753",
                            "createTime": "2023-10-23 00:00:24",
                            "isRead": 0,
                            "isGongHai": null,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": null
                        },
                        {
                            "id": 16432967,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "jjj分享了客户jejdjjdjd给你",
                            "relationObjType": 3,
                            "seqId": "5544753",
                            "createTime": "2023-10-22 01:00:09",
                            "isRead": 0,
                            "isGongHai": 0,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": null
                        },
                        {
                            "id": 16432917,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "jjj编辑客户验证联系人邮箱0001",
                            "relationObjType": 3,
                            "seqId": "5540674",
                            "createTime": "2023-10-22 00:59:16",
                            "isRead": 0,
                            "isGongHai": 0,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": null
                        },
                        {
                            "id": 16432915,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "jjj转移了客户验证联系人邮箱0001给你",
                            "relationObjType": 3,
                            "seqId": "5540674",
                            "createTime": "2023-10-22 00:58:59",
                            "isRead": 0,
                            "isGongHai": 0,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": null
                        },
                        {
                            "id": 16406606,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "{\"createTime\":1697878187628,\"createUser\":\"jjj\",\"createUserId\":19193,\"deleteStatus\":1,\"id\":434587,\"mailReplyRemindFlag\":0,\"orgId\":10110,\"participantsJson\":\"[{\\\"userId\\\":19193,\\\"userName\\\":\\\"jjj\\\"}]\",\"readStatus\":1,\"relatInquiryDescription\":\"{}\",\"relatObjDescription\":\"{}\",\"remindTimeLatest\":1697882400000,\"remindTimeUnit\":1,\"remindTimeValue\":0,\"remindType\":2,\"repeatType\":1,\"taskDetails\":\"12\",\"taskEndTime\":1697882400000,\"taskName\":\"2212\",\"taskScheduleTime\":1697882400000,\"taskStatus\":1,\"updateTime\":1697878187628,\"updateUserId\":19193}",
                            "relationObjType": 26,
                            "seqId": null,
                            "createTime": "2023-10-21 16:49:47",
                            "isRead": 1,
                            "isGongHai": null,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": 1
                        },
                        {
                            "id": 16406605,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "{\"createTime\":1697878114958,\"createUser\":\"jjj\",\"createUserId\":19193,\"deleteStatus\":1,\"id\":434586,\"mailReplyRemindFlag\":0,\"orgId\":10110,\"participantsJson\":\"[{\\\"userId\\\":19193,\\\"userName\\\":\\\"jjj\\\"}]\",\"readStatus\":1,\"relatInquiryDescription\":\"{}\",\"relatObjId\":\"\",\"remindTimeLatest\":1697882400000,\"remindTimeUnit\":1,\"remindTimeValue\":0,\"remindType\":2,\"repeatType\":1,\"taskDetails\":\"\",\"taskEndTime\":1697882400000,\"taskName\":\"2safdsafd\",\"taskScheduleTime\":1697882400000,\"taskStatus\":1,\"updateTime\":1697878114958,\"updateUserId\":19193}",
                            "relationObjType": 26,
                            "seqId": null,
                            "createTime": "2023-10-21 16:48:35",
                            "isRead": 1,
                            "isGongHai": null,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": 1
                        },
                        {
                            "id": 16406566,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "{\"createTime\":1697877847871,\"createUser\":\"jjj\",\"createUserId\":19193,\"deleteStatus\":1,\"id\":434583,\"mailReplyRemindFlag\":0,\"orgId\":10110,\"participantsJson\":\"[{\\\"userId\\\":19193,\\\"userName\\\":\\\"jjj\\\"}]\",\"readStatus\":1,\"relatInquiryDescription\":\"{}\",\"relatObjDescription\":\"{}\",\"remindTimeLatest\":1697882400000,\"remindTimeUnit\":1,\"remindTimeValue\":0,\"remindType\":2,\"repeatType\":1,\"taskDetails\":\"asdad\",\"taskEndTime\":1697882400000,\"taskName\":\"211212ddd\",\"taskScheduleTime\":1697882400000,\"taskStatus\":1,\"updateTime\":1697877847870,\"updateUserId\":19193}",
                            "relationObjType": 26,
                            "seqId": null,
                            "createTime": "2023-10-21 16:44:08",
                            "isRead": 1,
                            "isGongHai": null,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": 1
                        },
                        {
                            "id": 16406565,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "{\"createTime\":1697877819032,\"createUser\":\"jjj\",\"createUserId\":19193,\"deleteStatus\":1,\"id\":434583,\"mailReplyRemindFlag\":0,\"orgId\":10110,\"participantsJson\":\"[{\\\"userId\\\":19193,\\\"userName\\\":\\\"jjj\\\"}]\",\"readStatus\":1,\"relatInquiryDescription\":\"{}\",\"relatObjDescription\":\"{}\",\"remindTimeLatest\":1697882400000,\"remindTimeUnit\":1,\"remindTimeValue\":0,\"remindType\":2,\"repeatType\":1,\"taskDetails\":\"\",\"taskEndTime\":1697882400000,\"taskName\":\"211212\",\"taskScheduleTime\":1697882400000,\"taskStatus\":1,\"updateTime\":1697877819032,\"updateUserId\":19193}",
                            "relationObjType": 26,
                            "seqId": null,
                            "createTime": "2023-10-21 16:43:39",
                            "isRead": 0,
                            "isGongHai": null,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": 1
                        },
                        {
                            "id": 16405149,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "jjj分享了客户xcxcvbvw给你",
                            "relationObjType": 3,
                            "seqId": "5544669",
                            "createTime": "2023-10-21 09:24:38",
                            "isRead": 0,
                            "isGongHai": 0,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": null
                        },
                        {
                            "id": 16405058,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "{\"parentCommentatorId\":19193,\"orgId\":\"10110\",\"postType\":1,\"postId\":1760860,\"postContent\":\"sdafdsadsa\",\"postCreatorId\":19193,\"postCreatorName\":\"jjj\",\"parentId\":0,\"commentatorId\":6154,\"commentatorName\":\"姜玉庄\",\"commentContent\":\"@jjj 1122\",\"commentReadStatus\":1,\"user\":\"[19193]\",\"id\":6444,\"followup_belong_type\":1,\"followup_belong_id\":5544669,\"originalType\":\"customer\"}",
                            "relationObjType": 9,
                            "seqId": "1760860",
                            "createTime": "2023-10-21 09:10:55",
                            "isRead": 0,
                            "isGongHai": 0,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": null
                        },
                        {
                            "id": 16405059,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "{\"orgId\":\"10110\",\"postType\":1,\"postId\":1760860,\"postContent\":\"sdafdsadsa\",\"postCreatorId\":19193,\"postCreatorName\":\"jjj\",\"parentId\":0,\"commentatorId\":6154,\"commentatorName\":\"姜玉庄\",\"commentContent\":\"@jjj 1122\",\"commentReadStatus\":1,\"user\":\"[19193]\",\"id\":6444,\"followup_belong_type\":1,\"followup_belong_id\":5544669,\"originalType\":\"customer\"}",
                            "relationObjType": 9,
                            "seqId": "1760860",
                            "createTime": "2023-10-21 09:10:55",
                            "isRead": 0,
                            "isGongHai": 0,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": null
                        },
                        {
                            "id": 16405047,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "{\"orgId\":\"10110\",\"postType\":1,\"postId\":1760860,\"postContent\":\"sdafdsadsa\",\"postCreatorId\":19193,\"postCreatorName\":\"jjj\",\"parentId\":0,\"commentatorId\":19193,\"commentatorName\":\"jjj\",\"commentContent\":\"@jjj \",\"commentReadStatus\":1,\"user\":\"[19193]\",\"id\":6443,\"followup_belong_type\":1,\"followup_belong_id\":5544669,\"originalType\":\"customerColumns\"}",
                            "relationObjType": 9,
                            "seqId": "1760860",
                            "createTime": "2023-10-21 09:08:54",
                            "isRead": 0,
                            "isGongHai": 0,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": null
                        },
                        {
                            "id": 16404298,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "测试创建了询盘10110231021000010给你",
                            "relationObjType": 2,
                            "seqId": "5566573",
                            "createTime": "2023-10-21 08:46:53",
                            "isRead": 0,
                            "isGongHai": 0,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": null
                        },
                        {
                            "id": 16404276,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "jjj编辑客户xcxcvbvw",
                            "relationObjType": 3,
                            "seqId": "5544669",
                            "createTime": "2023-10-21 08:45:36",
                            "isRead": 0,
                            "isGongHai": 0,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": null
                        },
                        {
                            "id": 16404272,
                            "orgId": "10110",
                            "userId": 19193,
                            "userIdList": null,
                            "remindContent": "赵嘉璐创建了询盘10110231021000007给你",
                            "relationObjType": 2,
                            "seqId": "5566570",
                            "createTime": "2023-10-21 08:40:19",
                            "isRead": 0,
                            "isGongHai": 0,
                            "errorContent": null,
                            "managerUserIds": null,
                            "operateType": null
                        }
                    ]);
                    return;
                    util.ajaxJson({
                        url: '/new-privilege/msgRemind/getMsgList',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            pageSize: this.pageSize,
                            pageNo,
                            isRead: this.isRead,
                            relationObjType: this.noticeType === 0 ? undefined : this.noticeType
                        },
                        cancelToken: new util.axios.CancelToken(function executor(c) {
                            // An executor function receives a cancel function as a parameter
                            vm.cancelFunc = c;
                        })
                    }).then(response => {
                        this.loading_getList = false;
                        if (response.data.code === '1') {
                            // 设置总未读数
                            this.unreadCount = response.data.data.noRead;
                            // 设置总未读数
                            this.taskCount = response.data.data.taskCount;
                            // 设置总未读数
                            this.totalCount = response.data.data.total;
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
                            this.$Message.error(this.$t('noticeWindow.error_getSystemNotice'));
                        }
                        resolve(true);
                    }).catch(error => {
                        this.loading_getList = false;
                        // 提示, 请求数据失败
                        console.error(error);
                        this.$Message.error(this.$t('noticeWindow.error_getSystemNotice'));
                        resolve(true);
                    });
                });
            },
            handleData(dataList) {
                // 去除原有 noticeList 中和传入的新获取数据 dataList id 一致的部分
                let noticeList = this.noticeList.filter(notice => dataList.findIndex(item => item.id === notice.id) === -1);
                // 拼接新传入数据
                noticeList = noticeList.concat(dataList);
                // 按 createTime 从大到小排序
                noticeList = noticeList.sort((a, b) => (new Date(b.createTime)).getTime() - (new Date(a.createTime)).getTime());
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
                // console.error(this.noticeList);
            },
            // 全部标为已读
            markAll() {
                util.ajax({
                    url: '/new-privilege/msgRemind/batchUpdateIsRead',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        relationObjType: this.noticeType === 0 ? undefined : this.noticeType
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        // 全部标为已读
                        this.noticeList.forEach(item => {
                            item.isRead = 1;
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
            // 点击提醒
            clickNotice(notice, index) {
                const arr = notice.remindContent.split('=');

                // 解析下属的wa账号、WAAccountName、userId
                const whatsappAccount = arr[1]; // 下属账号
                const chatWaAccount = arr[2]; // 被删除消息的联系人
                const WAAccountName = arr[3];
                const userId = arr[4]; // 下属userId
                const messageId = arr[5]; // 消息messageId

                // WhatsApp跳转相关
                let obj = null;

                // 更改 active 显示
                this.$refs.noticeItem.forEach(item => item.classList.remove('notice-item-active'));
                this.$refs.noticeItem[index].classList.add('notice-item-active');

                // 标为已读
                if (notice.isRead !== 1) {
                    util.ajax({
                        url: '/new-privilege/msgRemind/updateIsRead',
                        method: 'get',
                        params: {
                            id: notice.id
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            // 标为已读
                            notice.isRead = 1;
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

                // 打开详情弹窗 or 跳转
                let parsedContent;
                const jumpId = notice.seqId;
                switch (notice.relationObjType) {
                    case 1: // 线索
                        localStorage.setItem('leadsCloud-clueId', jumpId);
                        window.open(this.$router.resolve({
                            name: 'my_clue'
                        }).href, '_blank');

                        // this.$router.push({
                        //     name: 'my_clue',
                        //     params: {
                        //         clueId: jumpId,
                        //         needAuth: true
                        //     }
                        // });
                        // this.$emit('windowClose');
                        break;
                    case 2: // 询盘
                    case 10: // 自动关联上的消息，跳转到询盘
                        this.viewInquiry(jumpId);
                        break;
                    case 3: // 客户
                    case 17: // 客户退入公海
                    case 24:
                        this.viewCompany(jumpId);
                        break;
                    case 4: // 跟进记录
                    case 15: // 询盘退入公海
                        this.viewInquiry(jumpId);
                        break;
                    case 7: // FB 同步 leads 的主页已解绑, 跳转到账号绑定
                    case 11: // FB token失效, 跳转到账号绑定
                        if (this.isContainsMenu('account_binding')) {
                            // 如果当前权限目录中有账号绑定, 则跳转到账号绑定
                            this.$router.push({
                                name: 'account_binding'
                            });
                        } else {
                            // 否则弹出无权限提示
                            this.$Message.warning(this.$t('noAuthorityPath1') + this.$t('menu.account_binding') + this.$t('noAuthorityPath2'));
                        }
                        break;
                    case 8: // 邮箱绑定失效
                        this.$router.push({
                            name: 'mail_set'
                        });
                        break;
                    // 评论/回复
                    case 9:
                        parsedContent = JSON.parse(notice.remindContent);
                        // 兼容移动端，用双等不能用全等
                        if (parsedContent.postType == 1) {
                            // 跟进记录
                            this.data_followup_reply = parsedContent;
                            this.visible_followup_reply = true;
                        } else if (parsedContent.postType === 2) {
                            // 邮件
                            this.data_mail_reply = parsedContent;
                            this.visible_mail_reply = true;
                        }
                        break;
                    case 21:
                        // FB 对话接待客服变更提醒
                        parsedContent = JSON.parse(notice.remindContent);
                        this.$store.dispatch('handleJumpToFbInbox', parsedContent);
                        break;
                    case 16: case 18: // 邮件发送失败点击新窗口跳转到邮件详情页
                        this.getMailDetailById(jumpId);
                        break;
                    case 22: // 跳转到WhatsApp下属页面
                        obj = {
                            whatsappAccount,
                            WAAccountName,
                            userId,
                            messageId,
                            chatWaAccount,
                            viewSubordinate: true // 查看下属阈值标识
                        };
                        // 跳转到WhatsApp下属页面
                        this.jumpToWhatsApp(obj);
                        break;
                    case 23:
                        // 跳转联系人
                        this.viewContact(jumpId);
                        break;
                    case 25: // 邮件eml批量下载
                        const url = notice.remindContent.substring(notice.remindContent.indexOf('(') + 1, notice.remindContent.indexOf(')'));
                        window.open(url, '_blank');
                        break;
                    case 26:
                        this.selected_taskId = JSON.parse(notice.remindContent).id;
                        this.modalShow = true;
                        break;
                    // case 27: // 跳转到自动生成文章页面
                    //     this.toAutoGenArt();
                    //     break;
                }
            },
            // 跳转到WhatsApp下属页面
            jumpToWhatsApp(obj) {
                // 消息通知中点击WhatsApp撤回/删除的消息时,先判断是否有查看下属的权限
                if (!this.authorized_button.view_subordinates) {
                    this.$Message.error(this.$t('authority.permissionOfViewSubordinates'));
                    return;
                }

                // 添加localStorage(下属的相关信息)
                localStorage.setItem('view-subordinate-messages', JSON.stringify(obj));
                const href = window.location.origin + window.location.pathname + this.$router.resolve({
                    name: 'whatsapp_chat'
                }).href;
                // 页面跳转
                window.open(href, '_blank');
            },
            // 跳转到邮件页面
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
                            if (createUserId && `${createUserId}` !== `${this.userId}`) {
                                const currentInputInfo = this.departmentPeople.filter(item => item.createUserId === `${createUserId}`);
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
            // 跳转用户列表
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
            // 跳转询盘
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

            // 获取邮件详情,跳转至发送失败的邮件详情页
            getMailDetailById(id) {
                util.ajaxMailJson({
                    url: '/mail/mailDetail',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        id
                    },
                    timeout: 60000
                }).then(res => {
                    if (res.data.code === 1) {
                        // 数据存入到 localStorage , 供新窗口使用
                        const mailDetail = Object.assign(res.data.data, { id });
                        localStorage.setItem('leadsCloud-timeLine-mailDetail', JSON.stringify(mailDetail));
                        localStorage.setItem('leadsCloud-currentPersonId', res.data.data.createUserId);

                        // 新窗口跳转
                        const href = window.location.origin + window.location.pathname + this.$router.resolve({
                            name: 'mail_home'
                        }).href;
                        window.open(href, '_blank');
                    } else if (res.data.code === -4 && res.data.msg === '邮件已被删除！') {
                        // 邮件已被删除
                        this.$Message.warning('邮件已被删除！');
                    } else {
                        // 数据请求失败, 跳转失败
                        this.$Message.error('跳转失败，请刷新后重试');
                    }
                }).catch(error => {
                    console.error(error);
                    // 数据请求失败, 跳转失败
                    this.$Message.error('跳转失败，请刷新后重试');
                });
            },
            // 跳转 CRM
            async viewCompany(id) {
                // 判断是否有"我的客户"页面权限
                if (!this.isContainsMenu('myCustomer')) {
                    // 没有"我的客户"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                    return;
                }

                // 无 companyId , 退出流程
                if (!id) {
                    this.$Message.error(this.$t('crm.Modal.error_companyId'));
                    return;
                }

                // 查询该公司 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Customer',
                    id
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 如果是公海客户
                if (authorized === 'highseas') {
                    if (this.isContainsMenu('highseasCustomer')) {
                        // 如果有公海目录权限, 跳转到公海页面
                        this.$viewHighSeasCustomer(id);
                    } else {
                        // 没有公海目录权限, 弹出提示
                        this.$Message.warning(this.$t('globalSearch.haveNoPermissionHighseasCustomer'));
                    }
                    // 退出流程
                    return;
                }

                // 新窗口跳转到客户页面
                this.$viewCustomer(id);
            },
            async viewInquiry(id) {
                // 判断是否有"我的询盘"页面权限
                if (!this.isContainsMenu('myInquiry')) {
                    // 没有"我的询盘"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyInquiry'));
                    return;
                }

                // 无 inquiryId , 退出流程
                if (!id) {
                    this.$Message.error(this.$t('crm.Modal.error_inquiryId'));
                    return;
                }

                // 查询该公司 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Inquiry',
                    id
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 如果是公海客户
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpInquiryInHighseas'));
                    return;
                }

                // 新窗口跳转到询盘页面
                localStorage.setItem('leadsCloud-inquiryId', id);
                window.open(this.$router.resolve({
                    name: 'myInquiry'
                }).href, '_blank');
            },
            // 跳转联系人
            async viewContact(contactId) {
                // 判断是否有"我的联系人"页面权限
                if (!this.isContainsMenu('myContact')) {
                    // 没有"我的联系人"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyContact'));
                    return;
                }

                // 查询该联系人 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Contact',
                    id: contactId
                });

                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 如果是公海联系人
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpContactInHighseas'));
                    return;
                }

                // 新窗口打开联系人详情页
                localStorage.setItem('leadsCloud-contactId', contactId);
                window.open(this.$router.resolve({
                    name: 'myContact'
                }).href, '_blank');
            },

            // 将下载'wa 导出联系人'数据的系统通知, 转换为可下载链接
            convertDownloadContent(content) {
                return content.replace(/\[(.*?)\]\((.*?)\)/g, '<a href=\'$2\' download=\'$1\' class="piwik_whatsapp_downloadContactDoc">$1</a>');
            },

            // 跳转到自动生成文章页面
            toAutoGenArt() {
                // 判断是否有"自动生成文章"页面权限
                if (!this.isContainsMenu('autoGenArticle')) {
                    // 没有"自动生成文章"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyContact'));
                    return;
                }

                window.open(this.$router.resolve({
                    name: 'autoGenArticle'
                }).href, '_blank');
            }
        },
        created() {
            // 监听到系统通知有变更, 则数据置空并重新请求, 更新未读数给应用中心使用
            this.unwatch = this.$watch('systemNoticeFlag', this.$throttle(() => {
                this.pageNo = 0;
                this.noticeList = [];
                this.loading_getList = false;
                this.getList();
            }, 1000, 3000));
        },
        beforeDestroy() {
            // 组件销毁前前未读数置为 0
            this.$store.commit('setNoticeUnread', {
                type: 'systemNoticeUnreadCount',
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
                        type: 'systemNoticeUnreadCount',
                        count: val
                    });
                }
            },
            isDrawerShow(val) {
                // 分屏显示时, 数据置空并重新请求
                if (val) {
                    if (this.floatWindowType === 'systemNotice') {
                        if (!(this.pageNo === 0 && this.loading_getList)) {
                            this.handleShow();
                        }
                    }
                }

                // 部分数据恢复到初始状态
                this.handleHide();
            },
            // 点击评论/回复型右下角浏览器通知时, 打开详情弹窗
            replyNoticeData(val) {
                if (val) {
                    const temp = JSON.parse(val);
                    if (temp.postType === 1) {
                        // 跟进记录
                        this.visible_followup_reply = false;
                        this.$nextTick(() => {
                            this.data_followup_reply = temp;
                            this.visible_followup_reply = true;
                        });
                    } else if (temp.postType === 2) {
                        // 邮件
                        this.visible_mail_reply = false;
                        this.$nextTick(() => {
                            this.data_mail_reply = temp;
                            this.visible_mail_reply = true;
                        });
                    }
                }
                this.$store.commit('setReplyNoticeData', false);
            }
        }
    };
</script>
<style scoped>
.notice-taskend-time{
    color: rgba(0, 0, 0, 0.8);
    font-size: 12px;
}
.relat-obj-type {
    font-size: 12px;
    line-height: 20px;
}
.task-status {
    float: right;
    color: rgba(0, 0, 0, 0.6);
    font-size: 12px;
    position: absolute;
    right: 0px;
}
.task-success {
    color: #00CC99;
}
.relat-obj-text {
    color: #4285F2;
}
.notice-markAll {
    font-size: 12px;
    color: #3b78de;
}
.notice-markAll:hover {
    color: #2d63bc;
    text-decoration: underline;
}
.search-btn {
    margin-bottom: 6px;
}
.only-noread {
    font-size: 12px;
    margin: 0px 20px 0 8px;
}
.notice-item-content  {
    /* display: block;
    width: 280px;
    line-height: 24px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis; */
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