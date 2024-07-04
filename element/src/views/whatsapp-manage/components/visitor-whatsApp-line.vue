<template>
    <div class="mutual-container"
         v-loading="isLoading"
         :element-loading-text="$t('crm.Html.loading')">
        <!-- 无数据提醒 -->
        <div v-if="recordList.length === 0"
             style="margin-top: 60px;text-align: center;color: #999; ">{{ $t('timeLine.noData') }}</div>
        <!-- 时间轴 -->
        <Timeline v-infinite-scroll="getMoreBottomList"
                  :infinite-scroll-distance="5"
            v-else class="timeline-whatsapp">
            <!-- <TimelineItem>
                <div slot="dot"
                     class="timeline-dot">
                    <Icon type="record"
                          size="12"
                          color="#e9eaec"
                          style="vertical-align: top;"></Icon>
                </div>
                <div>
                    <br>
                </div>
            </TimelineItem> -->
            <TimelineItem v-for="item in recordList"
                          :key="item.id">
                <div slot="dot"
                     class="timeline-dot">
                    <img src="@/styles/customFont/svg/WhatsApp.svg"></img>
                </div>
                <WhatsAppItem :item="item"
                              :type="type"
                              :originalType="originalType"
                              @showReplyModal="showReplyModal"
                              @viewContact="viewContact"
                              v-on="$listeners"></WhatsAppItem>
            </TimelineItem>
            <p class="tileline-no-more-tip">{{$t('noticeWindow.noMore')}}</p>
        </Timeline>

        <!-- 时间轴快速回复 -->
        <WhatsAppReplyModal v-if="switchId"
                            :visibleReplyModal.sync="visibleReplyModal"
                            :talkObj="talkObj"
                            ref="whatsAppReplyModal"></WhatsAppReplyModal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import util from '@/libs/util';
    import i18n from '@/locale';
    import WhatsAppItem from '@/views/main-components/timeline/WhatsApp/whatsAppItem';
    import WhatsAppReplyModal from '@/views/main-components/timeline/WhatsApp/modal/WhatsAppReplyModal';
    import Vue from 'vue';

    export default {
        name: 'WhatsApp',
        props: ['whatsAppRelatedInfo', 'type', 'originalType'],
        components: {
            WhatsAppItem,
            WhatsAppReplyModal
        },
        data() {
            return {
                // WatchApp快速回复
                switchId: false,
                visibleReplyModal: false,
                whatsAppAccountInfo: null, // 当前人whatsApp账号
                talkObj: null,

                isLoading: true, // 页面加载中
                recordList: [], // WhatsApp时间轴数据
                currentChatWaAccount: '', // 当前选中的WhatsApp的账号
                userBindWaAccount: '', // 当前用户绑定的WhatsApp的账号
                whatsAppName: '', // WhatsApp消息发起方的WhatsApp的昵称
                currentLineItemId: 0, // 当前点击的timeLineItem的id
                size: 20 // 每页请求行数
            };
        },
        filters: {
            filterName(value) {
                return value || i18n.t('timeLine.unknown');
            }
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                clue_short_info: 'clue_short_info',
                class_whatsApp_GTM() {
                    switch (this.type) {
                        default:
                            return '';
                    }
                }
            }),
            $lang() {
                return Vue.config.lang;
            }
        },
        methods: {
            /* 获取WhatsApp数据 */
            /**
             * @Description: whatsappChatConditionList参数格式：
             * [ { "chatWaAccount": "手机号", "userBindWaAccount": "手机号" }, { "chatWaAccount": "手机号", "userBindWaAccount": "手机号" }]
             * @author 杨娣
             * @date 2020/12/23
            */
            getRelatedWhatsAppRecordList() {
                this.isLoading = true;
                this.recordList = [];
                util.ajaxWAJson({
                    url: '/whatsapp/visitorwhatsapprelation/getVisitorWhatsappRelationDetail',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        whatsappChatConditionList: this.whatsAppRelatedInfo
                    }
                }).then(res => {
                    this.isLoading = false;
                    if (res.data.code === 1) {
                        const data = res.data.data;
                        if (data.length) {
                            data.forEach(item => {
                                item.id = `${item.id}`;
                                item.contactsName = item.fromWaName ? item.fromWaName : item.fromWaAccount;
                                item.eventUser = item.toWaName ? item.toWaName : item.toWaAccount;
                                item.eventTime = item.timeStamp;
                                item.eventContent = item.content;
                                item.wholeToWaName = item.toWaName && item.toWaName.length > 15 ? item.toWaName : ''; // 根据长度决定是否显示完整的原始WhatsApp昵称
                                item.wholeFromWaName = item.fromWaName && item.fromWaName.length > 15 ? item.fromWaName : '';
                                item.toWaName = item.toWaName && item.toWaName.length > 15 ? `${item.toWaName.substring(0, 14)}...` : item.toWaName; // 根据长度决定是否截取WhatsApp昵称
                                item.fromWaName = item.fromWaName && item.fromWaName.length > 15 ? `${item.fromWaName.substring(0, 14)}...` : item.fromWaName;
                                item.isShowWAMsg = false; // 是否显示WhatsApp聊天记录
                                item.msgList = []; // 聊天记录
                                item.noMoreMsg = true; // 无更多消息
                                item.startSessionLineNum = 0; // 当前记录下WhatsApp记录起始加载的行数
                                item.eventCustomVar = {
                                    fromMe: item.fromMe ? 1 : 0,
                                    chatType: item.chatType,
                                    type: item.type,
                                    fromWaAccount: item.fromWaAccount,
                                    toWaAccount: item.toWaAccount,
                                    userBindWaAccount: item.userBindWaAccount
                                };
                                return item;
                            });
                            console.log(data);
                            this.recordList = data;
                            // this.recordList.forEach((item, index) => {
                            //     if (index === 0) {
                            //         this.toggleMsgShow(item.id, true, true);
                            //     }
                            // });
                        }
                    }
                }).catch(err => {
                    this.isLoading = false;
                });
            },
            /* 对不同类型的消息类型做处理 */
            getMessageContent(msgType, msgContent) {
                if (msgType) {
                    switch (Number(msgType)) {
                        case 1:
                            return msgContent;
                        case 2:
                            return this.$t('whatsapp_manage.imageType');
                        case 3:
                            return this.$t('whatsapp_manage.fileType');
                        case 4:
                            return this.$t('whatsapp_manage.videoType');
                        default:
                            return this.$t('whatsapp_manage.unSupportedType');
                    }
                } else {
                    return '';
                }
            },
            /* 对不同访客状态进行处理 */
            getLeadsCloudStatus(status) {
                switch (status) {
                    case 0:
                        return '未录入';
                    case 1:
                        return '询盘';
                    case 2:
                        return '线索';
                }
            },
            toggleMsgShow(id, isShow, autoTrigger) {
                this.recordList.forEach(item => {
                    if (item.id === id) {
                        item.isShowWAMsg = isShow;
                        this.currentChatWaAccount = item.fromWaAccount === item.userBindWaAccount ? item.toWaAccount : item.fromWaAccount;
                        this.userBindWaAccount = item.userBindWaAccount;
                        if (isShow) {
                            this.getWhatsAppMsgList(item.id, autoTrigger);
                        } else {
                            item.msgList = [];
                            item.noMoreMsg = true;
                            item.startSessionLineNum = 0;
                        }
                    }
                    return item;
                });
            },
            /** 获取聊天记录 */
            getWhatsAppMsgList(id, autoTrigger) {
                const temp = this.recordList.find(item => item.id === id);
                let msgList = [];
                util.ajaxWAJson({
                    url: '/whatsapp/chatRecords/getOffsetChatList',
                    method: 'post',
                    data: {
                        chatWaAccount: this.currentChatWaAccount,
                        offset: temp.startSessionLineNum,
                        size: this.size,
                        orgId: this.enterpriseId,
                        userBindWaAccount: this.userBindWaAccount
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        if (temp) {
                            if (temp.startSessionLineNum === 0) {
                                // 为第一页
                                msgList = res.data.data.content;
                            } else {
                                // 滚动加载
                                msgList = temp.msgList.concat(res.data.data.content);
                            }
                        }
                        this.recordList.forEach(item => {
                            if (item.id === id) {
                                item.msgList = msgList;
                                if (res.data.data.content.length < 20) {
                                    item.noMoreMsg = true;
                                }
                                if (item.msgList.length < res.data.data.total) {
                                    item.noMoreMsg = false;
                                }
                                if (!res.data.data.content.length) {
                                    // 滚动到底部
                                    if (!autoTrigger) {
                                        this.$Message.success(this.$t('whatsapp_manage.toTheEnd'));
                                    }
                                    item.startSessionLineNum =
                                        item.startSessionLineNum > 0
                                            ? item.startSessionLineNum - this.size
                                            : 0;
                                }
                            }
                            return item;
                        });
                    }
                }).catch(error => {
                    console.log(error);
                });
            },
            /** 向下加载更多 */
            getMoreBottomList(id) {
                this.recordList.forEach(item => {
                    if (item.id === id) {
                        item.startSessionLineNum += this.size;
                        this.getWhatsAppMsgList(id);
                    }
                });
            },
            // WhatsApp快速回复
            // 显示模态框
            // getWALoginAccount() {
            //     if (this.whatsAppAccountInfo) {
            //         this.checkedHasContact();
            //     } else {
            //         getWaUserBind({
            //             orgId: this.enterpriseId,
            //             userId: this.userId
            //         }).then(res => {
            //             if (res.code === 1) {
            //                 if (res.data[0]) {
            //                     this.whatsAppAccountInfo = res.data[0];
            //                     this.checkedHasContact();
            //                 } else {
            //                     this.whatsAppAccountInfo = null;
            //                     this.visibleReplyModal = true;
            //                 }
            //             }
            //         });
            //     }
            // },
            viewContact(item) {
                this.$Message.error('当前联系人未建档');
            },
            showReplyModal(item) {
                // 如果已显示回复框, 弹出提示并退出流程
                if (this.switchId && this.visibleReplyModal) {
                    this.$Message.error(this.$t('whatsapp_manage.timeLineWhatsAppAlreadyOpen'));
                    return;
                }

                this.talkObj = item;
                this.switchId = true;
                this.visibleReplyModal = true;
                // this.getWALoginAccount();
            }
            // checkedHasContact() {
            //     // 暂存与"我"聊天的 WA 账号
            //     let contactWaAccount;
            //     if (`${this.talkObj.eventCustomVar.chatType}` === '1') {
            //         // 聊天方为"群组"
            //
            //         contactWaAccount = this.talkObj.eventCustomVar.toWaAccount;
            //     } else {
            //         // 聊天方为私人
            //
            //         contactWaAccount = this.talkObj.eventCustomVar.fromMe ? this.talkObj.eventCustomVar.toWaAccount : this.talkObj.eventCustomVar.fromWaAccount;
            //     }
            //
            //     // 发送请求
            //     util.ajaxInternationalJson({
            //         url: '/whatsapp/chatList/getOneChatList',
            //         method: 'POST',
            //         data: {
            //             orgId: this.enterpriseId,
            //             userId: this.userId,
            //             userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
            //             contactWaAccount
            //         }
            //     }).then(res => {
            //         if (res.data.code === 1) {
            //             this.visibleReplyModal = true;
            //         } else {
            //             this.$Message.error(this.$t('whatsapp_manage.timeLineWhatsAppNoPro'));
            //         }
            //     }).catch(error => {
            //         this.$Message.error(this.$t('whatsapp_manage.timeLineWhatsAppNoPro'));
            //     });
            // }
        },
        mounted() {
            // this.getRelatedWhatsAppRecordList();
        },
        watch: {
            whatsAppRelatedInfo: {
                handler(val) {
                    this.getRelatedWhatsAppRecordList();
                },
                immediate: true

            }
        }
    };
</script>

<style lang="less" scoped>
    .mutual-container{
        height: 100%;
        overflow: auto;
        // padding: 10px 0 10px 20px;
        .timeline-whatsapp {
            /*max-height: 1000px;*/
            padding: 10px 0 10px 20px;
            .item-time {
                margin-top: 20px;
            }
            .item-event {
                color: #4285F4;
                cursor: pointer;

                &:hover {
                    color: #2d63bc;
                    text-decoration: underline;
                }
            }

            /deep/ .el-timeline-item__tail {
                border-left: 1px solid #e4e7ed;
                left: 0;
            }
        }
    }
    .mutual-box{
        padding: 0 20px 10px;
        flex: 1;
        overflow: auto;
    }
    .custom-collapse {
        position: absolute;right: 10px;top: 5px;
    }
    .custom-show-more {
        position: absolute;right: 10px;top: 5px;
    }
    .ellipsis-3{
        text-overflow: -o-ellipsis-lastline;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
    }
</style>
