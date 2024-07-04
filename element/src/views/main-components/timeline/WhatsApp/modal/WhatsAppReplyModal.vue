<template>
    <Modal :visible="modalShow"
           :top="modelTop"
           :show-close="true"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           :modal="false"
           :append-to-body="true"
           :lock-scroll="false"
           :width="visible_qrCode ? '830px' : '800px'"
           ref="currentModal"
           v-dialog-drag
           @opened="afterShowReplyModal"
           @close="closeReplyModal"
           @scroll.native.capture="close_popper_model"
           :class="{'whatsApp-talk-modal': !visible_qrCode}"
           class="whatsApp-modal draggable-dialog twemoji-convert">
        <!-- class="modal draggable-dialog"> -->
        <!-- loading -->
        <Spin fix v-if="WhatsAppLoading"></Spin>

        <div slot="title" >
            <span v-if="!visible_qrCode"
                  :key="contactsName"
                  style="font-weight: bold;">
                <!-- 名称 -->
                <Tooltip placement="top" :content="contactsName" v-if="contactsName.length > 30">
                    <span>{{contactsName.slice(0, 30) + '...'}}</span>
                </Tooltip>
                <span v-else>{{ contactsName }}</span>
                <span style="margin-left: 5px;">{{selfTimeZone}}</span>
                <!-- 最后上线时间 -->
                <span v-if="!isGroup && ['composing', 'available', 'unavailable'].includes(onlineStatus)"
                      :class="{'waReplyModal-onlineStatus': true, 'waReplyModal-onlineStatus__composing': onlineStatus === 'composing'}">
                    <!-- 输入中 -->
                    <template v-if="onlineStatus === 'composing'">{{ $t('whatsapp_manage.composing') }}</template>

                    <!-- 在线 -->
                    <template v-else-if="onlineStatus === 'available'">{{ $t('whatsapp_manage.available') }}</template>

                    <!-- 离线 -->
                    <template v-else-if="onlineStatus === 'unavailable'">
                        <template v-if="lastOnlineTimeStamp">
                            <!-- 有时间戳, 显示"最后上线于..." -->
                            {{ $t('whatsapp_manage.lastOnlineAt') }} {{ lastTimeStampFormat(lastOnlineTimeStamp) }}
                        </template>
                        <template v-else>
                            <!-- 无时间戳, 显示"最后上线于 x时间" -->
                            {{ $t('whatsapp_manage.unavailable') }}
                        </template>
                    </template>
                </span>
            </span>
        </div>

        <!-- 扫码登录 -->
        <div v-if="visible_qrCode"
             style="height: 500px;">
            <showQRCode :isLogoutWA="isLogoutWA"
                        ref="showQRCode"
                        @hasLoginSuccess="getWALoginAccount"></showQRCode>
        </div>

        <!-- 聊天窗口 -->
        <div v-else id="whatsApp-main" @scroll.capture="handleFrameScroll" class="whatsapp-main-whatsappReplyModal">
            <div v-show="visible_mobileOfflineTip" class="whatsApp-tip"><i class="el-message__icon el-icon-error"></i>{{$t('whatsappSetting.whatAppTip')}}</div>

            <ul id="chat-list" class="m-chat-list p-chat-list" style="max-height:400px;min-height:300px;overflow-x: hidden;overflow-y: auto;">
                <!-- loading -->
                <spin fix v-if="isLoading"></spin>

                <!-- 滚动加载 -->
                <Scroll :on-reach-top="loadMore_top"
                        :on-reach-bottom="msgListType === 'quote' ? loadMore_bottom : undefined"
                        :distance-to-edge="10"
                        :loading-text="$t('crm.Html.loading')"
                        :height="height_scroll"
                        ref="msgScroll">
                    <whatsAppMsgItem
                            v-for="msg in $options.filters.addMsgTimeTag(msgList)"
                            :key="msg.messageId"
                            :rawMsg="msg"
                            :nick="contactsName"
                            :whatsAppAccountInfo="whatsAppAccountInfo"
                            :replyMsg.sync="replyMsg"
                            fromFlag="timeline"
                            :isGroup="isGroup"
                            :groupInfo="groupInfo"
                            :lastTransMemory.sync="lastTransMemory"
                            :transList="transList"
                            @handleTransMsg="handleTransMsg"
                            @reEditWithdrawMsgF="reEditWithdrawMsgF"
                            :currAccountAvatar="currAccountInfo.chatWaAvatar || currAccountInfo.contactWaAvatar"
                            @scrollToQuoteMsg="handleScrollToQuoteMsg"></whatsAppMsgItem>
                 </Scroll>
            </ul>
        </div>

        <div v-if="!visible_qrCode"
             slot="footer"
             class="waReplyModal-footer">
            <!-- 滚动到最底部 -->
            <div v-show="visible_toBottomBtn"
                 @click="scrollToBottom"
                 class="waChatFrame-scrollToBottom-btn">
                <svg class="svg-icon custom" aria-hidden="true">
                    <use xlink:href="#custom-scrollToBottom"></use>
                </svg>
            </div>

            <whatsAppSend ref="whatsAppSend"
                          :groupAutoTrans.sync="groupAutoTrans"
                          :currAccountInfo="currAccountInfo"
                          :whatsAppAccountList="whatsAppAccountList"
                          :whatsAppAccountInfo="whatsAppAccountInfo"
                          :nick="contactsName"
                          :replyMsg.sync="replyMsg"
                          :isGlobal="isGlobal"
                          :insertData.sync="insertData"
                          fromFlag="timeline"
                          @checkOwnWAAccount="checkOwnWAAccount"></whatsAppSend>
            <!-- <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
            <Button
                    v-if="is_all_field_requested"
                    :disabled="loading"
                    type="primary"
                    @click="ok"
                    :class="`piwik_${type}_new_company`"
            >{{ $t('crm.Modal.modal_ok') }}</Button> -->
        </div>
    </Modal>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import _ from 'lodash';
    import elementResizeDetectorMaker from 'element-resize-detector';
    import whatsAppMsgItem from '@/views/whatsapp-manage/whatsApp-chat-frame/whatsAppMsgItem.vue';
    import whatsAppSend from '@/views/whatsapp-manage/whatsApp-chat-frame/whatsAppSend';
    // 引入一进入就扫码登陆组件
    import showQRCode from '@/views/systemSettings/whatsapp-setting/components/show-QR-code.vue';
    import { getAllLoggedAccount, getTranslateMemory, setTranslateMemory } from '@/api/whatsapp';
    import getTimezoneByArea from '@/mixins/getTimezoneByArea';
    import autoTranslate from '@/mixins/autoTranslate';

    export default {
        name: 'WhatsAppReplyModal',
        mixins: [getTimezoneByArea, autoTranslate],
        props: {
            visibleReplyModal: {
                type: Boolean
            },
            talkObj: {
                type: Object
            },
            allowReply: {
                type: Boolean
            },
            // 是否是全局的回复框
            isGlobal: {
                type: Boolean
            },
            // 协助下属回复时, 下属的 userId
            currUserId: {
                type: [String, Number]
            },
            // 协助下属回复时, 下属的 enterpriseId
            currOrgId: {
                type: [String, Number]
            }
        },
        components: {
            showQRCode,
            whatsAppMsgItem,
            whatsAppSend
        },
        computed: {
            ...mapState({
                // WAIsMd: state => state.whatsapp.WAIsMd,
                ownEnterpriseId: state => state.enterpriseId,
                ownUserId: state => state.userId,
                websocketMsgWA: state => state.whatsapp.websocketMsgWA
            }),
            // 与"我"聊天的 wa 账号
            chatWaAccount() {
                // 群组
                if (this.isGroup) {
                    return this.talkObj.eventCustomVar.toWaAccount;
                }

                // 单聊
                return this.talkObj.eventCustomVar.fromMe === 0 ? this.talkObj.eventCustomVar.fromWaAccount : this.talkObj.eventCustomVar.toWaAccount;
            },
            userBindWaAccount() {
                return this.talkObj.eventCustomVar.userBindWaAccount;
            },
            msgList() {
                return this.msgListType === 'quote' ? this.waQuoteMsgList : this.whatsAppMsgList;
            },
            modelTop() {
                const clientHeight = document.documentElement.clientHeight;
                return clientHeight > 950 ? '15vh' : clientHeight > 800 ? '10vh' : '3vh';
            },
            contactsName() {
                // 群组
                if (this.isGroup) {
                    return this.talkObj.eventCustomVar.subject || this.$t('timeLine.unknown');
                }

                return this.talkObj.contactsName || this.chatRecordsName || this.chatWaAccount || this.$t('timeLine.unknown');
            },
            // 是否是群组对话
            isGroup() {
                return `${this.talkObj.eventCustomVar.chatType}` === '1';
            },
            // 所有可切换的 wa 账号
            whatsAppAccountList() {
                // 如果是群聊
                if (this.isGroup) {
                    // 有对应的聊天账号, 则只能选中该账号, 不能切换; 没有对应账号, 直接为空
                    if (this.userBindWaAccount) {
                        return this.ownWhatsAppAccountList.filter(item => item.whatsappAccount === this.userBindWaAccount);
                    } else {
                        return [];
                    }
                }

                // 否则, 返回所有账号
                return this.ownWhatsAppAccountList;
            },
            // 显示手机端未连接提示
            visible_mobileOfflineTip() {
                return this.whatsAppAccountInfo && `${this.whatsAppAccountInfo.loginStatus}` === '5';
            },
            // 显示二维码
            visible_qrCode() {
                // 账号列表为空时显示二维码
                return this.modalShow && !this.ownWhatsAppAccountList.length;
            },
            // 是否是多设备版
            WAIsMd() {
                return !(this.whatsAppAccountInfo && this.whatsAppAccountInfo.uuid && this.whatsAppAccountInfo.uuid.includes('java'));
            },
            // 根据"Whatsapp 管理"功能中主动使用下属账号聊天的场景的需要, userId/enterpriseId 优先使用外部传入数据, 无传入再使用自身数据
            userId() {
                return this.currUserId || this.ownUserId;
            },
            enterpriseId() {
                return this.currOrgId || this.ownEnterpriseId;
            }
        },
        data() {
            return {
                // 是否显示 modal
                modalShow: false,
                WhatsAppLoading: false, // 界面loading
                startSessionLineNum: 0, // 需要获取起始行数
                page: 1,
                size: 20, // 每页请求行数
                isLoading: false,

                // 取消上一次正常消息请求
                cancelFunc: null,
                // 取消上一次引用消息请求
                cancelFunc_quote: null,
                // 配合插件监听 wa 消息容器 resize
                observer: null,
                // 滚动区域的高度
                height_scroll: 0,
                // 正常的 wa 消息数组
                whatsAppMsgList: [],
                // 引用消息前后的 wa 消息数组
                waQuoteMsgList: [],
                // 页面消息显示类型, normal 显示正常消息, quote 显示引用消息数组
                msgListType: 'normal',
                // 是否显示"滚动到最底部"按钮
                visible_toBottomBtn: false,
                // 当前用户已登录的 wa 账号
                ownWhatsAppAccountList: [],
                whatsAppAccountInfo: {}, // 当前用户登录的WA账号信息
                currAccountInfo: {}, // 联系人客户
                // 登录二维码相关
                timer: null, // 计时器

                //
                close_popper_model: this.$debounce(
                    e => {
                        if (e && e.target && e.target.classList.contains('el-dialog__body')) {
                            // 关闭 select 下拉选框
                            const selectEl = this.$refs.currentModal.$el.querySelector('.is-focus');
                            if (selectEl) {
                                selectEl.click();
                            }
                        }
                    },
                    undefined,
                    true
                ),

                // 对方在线状态('composing'输入中, 'available'在线, 'unavailable'离线)
                onlineStatus: '',
                // 对方状态为离线时, 最后上线时间
                lastOnlineTimeStamp: 0,
                // 在线状态变为'输入中'时, 设置 5s 延时, 5s 后从'输入中'恢复到之前的状态
                timer_recoverFromComposing: null,
                // 在线状态变为'输入中'时, 存放变更之前的在线状态
                latestOnlineStatus: '',

                // 小闹钟list , 保存发送消息后,如果出现小闹钟,则将小闹钟的消息存起来
                unSendMsgList: [],
                temporaryMsgList: [],
                // 轮训timer
                clockTimer: null,
                getStatusTimer: null,
                time: 0, // 循环次数
                handleClockArr: this.$debounce((e) => {
                    this.temporaryMsgList = this.unSendMsgList;
                    this.getStatusTimer = setInterval(() => {
                        if (this.time >= 3) {
                            clearInterval(this.getStatusTimer);
                        } else {
                            this.time += 1;
                            this.getChatRecordStatus(this.temporaryMsgList);
                        }
                    }, 1500);
                }, undefined, false),

                // 正在被回复的消息
                replyMsg: {},

                isLogoutWA: false, // 是否退出了wa

                /* 群组相关 */
                // 群组信息请求 loading
                loading_group: false,
                // 群组信息
                groupInfo: {
                    account: '',
                    name: '',
                    avatar: '',
                    size: 0,
                    memberList: []
                },

                // 非群组聊天情况下, 从聊天记录中拿到的对方的 wa name
                chatRecordsName: '',
                lastTransMemory: 'zh',

                // 打开会话时插入数据到发送框中, 格式为 { account: content }
                insertData: '',
                // 当前联系人所在国家的时间
                selfTimeZone: 0,
                // 定时更新所在国家的时间
                interval_getTimeZon: null,
                // 当前所在的时区
                timeZone: 0,
            };
        },
        methods: {
            // 传给子组件WhatsAppMsgItem的方法
            // 将'重新编辑的撤回消息'传到这里,这里再调用whatsappSend组件的方法后,将'重新编辑的撤回消息'回填到输入框
            reEditWithdrawMsgF(msg) {
                this.$refs.whatsAppSend.reEditWithdrawMsgS(msg);
            },
            // 获取当前询盘账号是多设备还是旧版本
            // getLastestWaUuid() {
            //     getLastestWaType({
            //         userId: this.userId
            //     }).then(res => {
            //         if (res.code === 1) {
            //             this.$store.commit('setWAIsMd', res.data === 'md');
            //         }
            //     });
            // },
            // 向后端请求数据
            getChatRecordStatus(messageIdList) {
                // 先判断数组中是否有值,若数组为空 return
                if (!messageIdList.length) return;
                util.ajaxWAJson({
                    url: '/whatsapp/chatRecords/getChatRecordStatus',
                    method: 'post',
                    data: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        messageIdList
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        const response = res.data.data;
                        const _this = this;
                        // 双循环,判断messageId是否一致
                        for (let j = 0; j < response.length; j++) {
                            // 如果messageId一致&&readFlag!==0,则根据查询的结果修改对应messageId的readFlag
                            if (response[j].readFlag !== 0) {
                                const msgData = {
                                    messageStatus: {
                                        messageId: response[j].messageId,
                                        readFlag: response[j].readFlag
                                    },
                                    WaWebsocketMessageType: 5 // 修改消息状态(小闹钟)
                                };

                                // 模拟ws消息
                                setTimeout(() => {
                                    _this.$store.commit('setWebsocketMsgWA', msgData);
                                });

                                // 数组中清掉readFlag===1的id
                                this.temporaryMsgList = this.temporaryMsgList.filter(item => item !== response[j].messageId);
                                // 如果数组中没有了messageId,则置空计时器
                                if (!this.temporaryMsgList.length) {
                                    this.time = 3;
                                };
                            };
                        }
                    };
                }).catch(error => {
                    console.error(error);
                });
            },
            resetData() {
                this.createdLoading = true;// 初始化时加载图标
                this.refreshLoading = false;// 二维码失效后用户点击刷新按钮后loading
                this.QRcodeUrl = ''; // 二维码路径(base64)
                this.QRcodeFailureTime = ''; // 二维码失效时长
                this.QRcodeHasFailure = false;// 二维码已经失效时为true
            },
            /* 获取当前询盘云登录用户绑定的WA账号列表 */
            getWALoginAccount() {
                this.WhatsAppLoading = true;

                // getWaUserBind({
                getAllLoggedAccount({
                    orgId: this.enterpriseId,
                    userId: this.userId
                }).then(async res => {
                    this.WAAccountLoading = false;

                    if (res.code === 1) { // 1登录成功
                        if (Array.isArray(res.data) && res.data.length) {
                            // 暂存接口返回的, 该 userId 所有登录过的账号
                            const allAccountList = res.data;

                            /* 更新未读数 */
                            // 先置空
                            this.$store.commit('setWAUnreadCount', null);

                            // 暂存接口返回的, 该 userId 所有登录过的账号
                            const updateObj = {};
                            res.data.forEach(item => {
                                updateObj[item.whatsappAccount] = item.noRead;
                            });

                            // 更新未读数
                            this.$store.commit('setWAUnreadCount', updateObj);

                            // 更新 WA 绑定账号信息
                            const checkResult = await this.checkCurrOwnAccountInfo(allAccountList);
                            // 如果更新账号信息失败(目前只有点击新会话确认框取消按钮才会触发), 关闭弹框, 退出流程
                            if (!checkResult) {
                                this.closeReplyModal();
                                return;
                            }

                            // 取消 loading
                            this.WhatsAppLoading = false;

                            // 展示 modal
                            this.modalShow = true;

                            // 如果没有选中 wa 账号, 显示登录二维码, 并退出流程
                            if (!(this.whatsAppAccountInfo && this.whatsAppAccountInfo.whatsappAccount)) {
                                // 显示二维码
                                this.isLogoutWA = true;
                                return;
                            }

                            // 如果有选中 wa 账号
                            // 请求聊天记录
                            this.refreshMsgList();
                            // 如果是群组, 获取群组详情
                            if (this.isGroup) {
                                this.getGroupDetail();
                            }
                            // 根据是否在线做一些处理
                            if (`${this.whatsAppAccountInfo.loginStatus}` === '1') {
                                // 获取对方的在线状态
                                this.getPresence();
                            } else {
                                // 如果不在线, 弹出提示
                                setTimeout(() => {
                                    this.$Message.error(this.$t('whatsapp_manage.error_noOnline'));
                                }, 0);
                            }
                        } else {
                            // 清空全部未读数
                            this.$store.commit('setWAUnreadCount', null);

                            // 取消 loading
                            this.WhatsAppLoading = false;

                            // 展示 modal
                            this.modalShow = true;

                            // 显示二维码
                            this.isLogoutWA = true;
                        }
                    } else {
                        // 弹出提示
                        this.$Message.error(this.$t('whatsapp_manage.error_getWAAccount'));

                        // 请求出错, 直接关闭弹框, 避免 visibleReplyModal 还显示 true, 但 modalShow 不展示, 客户在时间轴里再点回复按钮弹框, 还提示回复框已打开
                        this.closeReplyModal();
                    }
                }).catch(err => {
                    // 弹出提示
                    this.$Message.error(this.$t('whatsapp_manage.error_getWAAccount'));

                    // 请求出错, 直接关闭弹框, 避免 visibleReplyModal 还显示 true, 但 modalShow 不展示, 客户在时间轴里再点回复按钮弹框, 还提示回复框已打开
                    this.closeReplyModal();
                });
            },
            // 处理请求得到的账号列表 + 从中选择某账号作为当前显示账号
            checkCurrOwnAccountInfo(dataList) {
                this.ownWhatsAppAccountList = dataList;

                // 判断账号列表中是否有此会话对应的 wa 账号
                if (this.userBindWaAccount) {
                    const tmpIndex = dataList.findIndex(item => item.whatsappAccount === this.userBindWaAccount);
                    if (tmpIndex !== -1) {
                        // 当前会话对应的 wa 账号在当前账号列表中

                        // 选中该账号
                        if (dataList[tmpIndex].tag === 'WABA') {
                            // 聊天账号是 WABA 账号, 直接跳转
                            this.jumpWABAAccount(dataList[tmpIndex]);

                            return false;
                        } else {
                            // 否则, 选中账号显示
                            this.whatsAppAccountInfo = dataList[tmpIndex];
                        }
                    } else {
                        // 当前会话对应的 wa 账号不在当前账号列表中

                        // 如果当前是群聊, 默认除了 userBindWaAccount 外其他人都不在群里, 直接弹提示语 + 关闭弹框
                        if (this.isGroup) {
                            this.$Message.error(this.$t('whatsapp_manage.error_notInGroup'));

                            return false;
                        }

                        // 弹出发起新会话确认框
                        return this.$confirm(
                            this.$t('whatsapp_manage.tip_newSession'),
                            this.$t('whatsapp_manage.title_newSession'),
                            {
                                showClose: false,
                                customClass: 'newSessionMsgBox',
                                confirmButtonText: this.$t('whatsapp_manage.newSession'),
                                cancelButtonText: this.$t('cancel')
                            }
                        ).then(async res => {
                            // 发起新会话

                            if (this.ownWhatsAppAccountList.length === 1 && this.ownWhatsAppAccountList[0].tag === 'WABA') {
                                // 只有一个 WABA 账号, 直接跳转到 WA 界面打开 WABA 账号与此会话聊天
                                this.jumpWABAAccount(this.ownWhatsAppAccountList[0]);

                                return false;
                            } else {
                                // 按优先级选中 wa 账号显示
                                this.whatsAppAccountInfo = dataList[this.getMaxOrderAccount(dataList)] || {};

                                return true;
                            }
                        }).catch(e => {
                            // 不发起新会话

                            return false;
                        });
                    }

                    return true;
                }

                if (this.ownWhatsAppAccountList.length === 1 && this.ownWhatsAppAccountList[0].tag === 'WABA') {
                    // 只有一个 WABA 账号, 直接跳转到 WA 界面打开 WABA 账号与此会话聊天
                    this.jumpWABAAccount(this.ownWhatsAppAccountList[0]);

                    return false;
                } else {
                    // 按优先级选中 wa 账号显示
                    this.whatsAppAccountInfo = dataList[this.getMaxOrderAccount(dataList)] || {};

                    return true;
                }
            },
            // 跳转到 WABA 账号聊天
            jumpWABAAccount(accountInfo) {
                const jumpData = {
                    userBindWaAccount: accountInfo.whatsappAccount,
                    whatsappAccount: this.chatWaAccount
                };
                localStorage.setItem('jumpWaConObj', JSON.stringify(jumpData));

                // 跳转 wa 界面
                window.open(this.$rootRouter.resolve({
                    name: 'whatsapp_chat'
                }).href, '_blank');
            },
            // 获取优先级最高的 wa 账号
            getMaxOrderAccount(dataList) {
                return dataList.findIndex(item => item.tag !== 'WABA');

                // // 按优先级确定默认显示哪个账号: 是否是 business > 首个在线账号 > 离线账号 > 无账号
                // // 优先级顺序, 数值越大优先级越高
                // const orderObj = {
                //     online: 3,
                //     offline: 2,
                //     other: 1
                // };
                // // 处理得到优先级数字列表
                // const sortList = dataList.map(item => {
                //     // 在线账号
                //     if (`${item.loginStatus}` === '1') {
                //         return orderObj.online;
                //     }
                //
                //     // 离线账号
                //     return orderObj.offline;
                // });
                // // 获取最高优先级数值
                // const maxOrder = Math.max(...sortList);
                // // 选中首个最高优先级账号
                // return sortList.findIndex(item => item === maxOrder);
            },
            // 弹窗展示完毕
            afterShowReplyModal() {
                // 监听聊天框容器的高度, 适时调整 scroll 的高度
                if (!this.observer) {
                    let _el = null;
                    try {
                        _el = this.$refs.currentModal.$el.querySelector('.el-dialog__body');
                    } catch (e) {
                        _el = document.querySelector('.whatsApp-modal .el-dialog__body');
                    }

                    if (_el) {
                        // 监听聊天框容器的高度, 适时调整 scroll 的高度
                        this.observer = elementResizeDetectorMaker();

                        this.observer.listenTo(_el, (el) => {
                            this.$nextTick(() => {
                                this.height_scroll = _el.offsetHeight - 20;
                            });
                        });
                    } else {
                        console.error('获取弹窗 body 元素失败, 可能导致 scroll 显示有误/不显示');
                    }
                }
            },
            /** 关闭弹窗 */
            closeReplyModal() {
                this.modalShow = false;
                this.WhatsAppLoading = false;
                if (this.timer) {
                    clearInterval(this.timer);
                    this.timer = null;
                }
                this.$emit('update:visibleReplyModal', false);
                if (this.isGlobal) {
                    // 是 Main.vue 的全局回复框, 关闭时还要清空之前的数据

                    this.$store.commit('updateGlobalWaReplyModal', {});
                }
                // 清除数据
                this.clearInfo();
            },
            // 清除旧数据
            clearInfo() {
                this.chatRecordsName = '';
                this.whatsAppMsgList = [];
                this.waQuoteMsgList = [];
                this.msgListType = 'normal';
                this.page = 1;
                this.whatsAppAccountInfo = {};
                this.ownWhatsAppAccountList = [];
                this.currAccountInfo = {};
            },
            // 查询通讯录是否包含客户
            refreshMsgList() {
                // 打开指定会话前, 判断是否有传回复内容
                try {
                    const insertData = localStorage.getItem('leadsCloud-WA-insertData');
                    localStorage.removeItem('leadsCloud-WA-insertData');
                    if (insertData) {
                        this.insertData = JSON.parse(insertData);
                    }
                } catch (e) {
                }

                // 如果明确声明允许回复, 则不用管在不在通讯录, 直接聊天
                // (如果以后有群聊有这个属性, 应该要调整下, 后端说群聊还是需要检查在不在群里)
                // if (this.allowReply) {
                this.currAccountInfo = {
                    userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                    chatWaAccount: this.chatWaAccount,
                    groupInfo: this.groupInfo
                };
                this.whatsAppMsgList = [];
                this.waQuoteMsgList = [];
                this.msgListType = 'normal';
                this.page = 1;
                this.getWhatsAppMsg();
            },
            /** 加载更多 */
            loadMore_top() {
                return this.loadMore('top');
            },
            loadMore_bottom() {
                return this.loadMore('bottom');
            },
            loadMore(direction) {
                // 当前显示的是引用消息
                if (this.msgListType === 'quote') {
                    // 根据方向, 以首条/尾条引用消息为基准, 向上/下请求更多引用消息
                    return new Promise(resolve => {
                        if (direction === 'top') {
                            this.getQuoteMsgList(this.waQuoteMsgList[0], true, resolve);
                        } else {
                            this.getQuoteMsgList(this.waQuoteMsgList[this.waQuoteMsgList.length - 1], false, resolve);
                        }
                    });
                }

                // 当前显示的是正常消息, 且是滚动到顶部
                if (direction === 'top') {
                    this.page++;
                    return new Promise(resolve => {
                        this.getWhatsAppMsg(resolve, direction);
                    });
                }
            },
            // 请求聊天消息列表
            getWhatsAppMsg(resolve, direction) {
                // 不是手动滚动触发加载更多
                let notScroll = false;
                if (this.currAccountInfo.chatWaAccount || this.currAccountInfo.contactWaAccount) {
                    // 如果当前不是通过 scroll 加载列表数据(没有 scroll 组件自带的 loading), 则显示 loading
                    if (!resolve) {
                        notScroll = true;
                        this.isLoading = true;
                    }

                    this.isLoading = true;
                    const vm = this;
                    /* 取消上一次请求，避免频繁请求接口时因接口响应速度快慢导致数据错乱 */
                    if (typeof this.cancelFunc === 'function') {
                        this.cancelFunc();
                    }

                    // 发送请求
                    util.ajaxWAJson({
                        url: '/whatsapp/chatRecords/page',
                        method: 'post',
                        data: {
                            chatWaAccount: this.currAccountInfo.chatWaAccount || this.currAccountInfo.contactWaAccount,
                            orgId: this.enterpriseId,
                            page: `${this.page}`,
                            size: `${this.size}`,
                            userBindWaAccount: this.currAccountInfo.userBindWaAccount,
                            userId: this.userId
                        },
                        cancelToken: new util.axios.CancelToken(function executor(c) {
                            vm.cancelFunc = c;
                        })
                    }).then(({ data }) => {
                        // 处理返回数据
                        if (data.code === 1) {
                            if (data.data.content.length) {
                                // 有请求到数据

                                // 合并数据到正常消息数组
                                this.mergeMsgList(data.data.content);

                                // 非群租情况下, 从消息中获取对方的 wa name
                                if (!(this.isGroup || this.chatRecordsName)) {
                                    data.data.content.some(item => {
                                        if (item.fromWaAccount === this.currAccountInfo.userBindWaAccount) {
                                            this.chatRecordsName = item.toWaName || '';
                                            return true;
                                        }

                                        if (item.toWaAccount === this.currAccountInfo.userBindWaAccount) {
                                            this.chatRecordsName = item.fromWaName || '';
                                            return true;
                                        }
                                    });
                                }

                                // 手动触发翻译功能(方法在mixin中)
                                this.handleTranslate(direction, '.whatsapp-main-whatsappReplyModal');
                            } else {
                                // 没有请求到数据, 给出"没有更多"提示, 并将 page 退回一页

                                if (this.page === 1 && notScroll) {
                                    // 非滚动加载更多 + 当前请求失败的是第一次加载 = 首次打开弹框就没请求到聊天消息, 不弹提示
                                } else {
                                    this.$Message.info(this.$t('noticeWindow.noMore'));
                                }
                                this.page--;
                            }
                        }

                        // 隐藏 loading
                        if (resolve) {
                            resolve();
                        } else {
                            // 当处在第一页时，保证看到最新消息
                            if (this.page === 1 && this.msgListType === 'normal' && this.msgList.length) {
                                this.targetMsgLocation(this.msgList[this.msgList.length - 1]);
                            }
                        }
                        this.isLoading = false;
                    });
                }
            },

            // 获取对方的在线状态
            getPresence() {
                // 重置相关数据
                this.onlineStatus = '';
                this.lastOnlineTimeStamp = 0;

                // 后端要求打开对话(包括群聊)时请求此接口
                util.ajaxWAJson({
                    url: '/minor/chat/openChatDialog',
                    method: 'post',
                    data: {
                        bindWa: this.whatsAppAccountInfo.whatsappAccount,
                        destJid: this.chatWaAccount,
                        userId: this.whatsAppAccountInfo.userId,
                        orgId: this.whatsAppAccountInfo.orgId,
                        loginUserId: this.ownUserId
                    }
                });
            },

            // 格式化最后上线时间
            lastTimeStampFormat(value) {
                /**
                 * @Description: WA 最后一次上线时间省略显示
                 * a.今天显示 "今天 时:分", 英文: "时:分 today"
                 * b.昨天显示 "昨天 时:分", 英文: "时:分 yesterday"
                 * c 本周的日期显示 "星期* 时:分", 英文: "时:分 on 星期*"
                 * d.本周之前的日期显示 "xxxx年yy月zz日 时:分", 英文: "时:分, yy月 zz, xxxx"
                 * @author 汤一飞
                 * @date 2021/8/5
                 */

                // 定义"今天", "昨天", "本周"的起始时间戳
                const nowDate = new Date();
                const todayStart = nowDate.setHours(0, 0, 0, 0);
                const yesterdayStart = todayStart - 3600 * 1000 * 24;
                let dayNo = nowDate.getDay();
                dayNo = dayNo ? dayNo - 1 : 6;
                const weekStart = todayStart - dayNo * 24 * 60 * 60 * 1000;

                // 定义年份, 月份数组
                const weekMap = [
                    this.$t('Monday'),
                    this.$t('Tuesday'),
                    this.$t('Wednesday'),
                    this.$t('Thursday'),
                    this.$t('Friday'),
                    this.$t('Saturday'),
                    this.$t('Sunday')
                ];
                const monthMap = [
                    this.$t('dashBoardV2.GoalSetting.Jan'),
                    this.$t('dashBoardV2.GoalSetting.Feb'),
                    this.$t('dashBoardV2.GoalSetting.Mar'),
                    this.$t('dashBoardV2.GoalSetting.Apr'),
                    this.$t('dashBoardV2.GoalSetting.May'),
                    this.$t('dashBoardV2.GoalSetting.Jun'),
                    this.$t('dashBoardV2.GoalSetting.Jul'),
                    this.$t('dashBoardV2.GoalSetting.Aug'),
                    this.$t('dashBoardV2.GoalSetting.Sep'),
                    this.$t('dashBoardV2.GoalSetting.Oct'),
                    this.$t('dashBoardV2.GoalSetting.Nov'),
                    this.$t('dashBoardV2.GoalSetting.Dec')
                ];

                // 获取传入时间戳对应的年, 月 ,日, 星期*, 时, 分
                const valueStamp = parseInt(value);
                const valueDate = new Date(valueStamp);
                const year = valueDate.getFullYear();
                const month = valueDate.getMonth();
                const date = valueDate.getDate();
                let day = valueDate.getDay();
                day = day ? day - 1 : 6;
                let hours = valueDate.getHours();
                hours = hours >= 10 ? hours : `0${hours}`;
                let minutes = valueDate.getMinutes();
                minutes = minutes >= 10 ? minutes : `0${minutes}`;

                // 今天显示 "今天 时:分", 英文: "时:分 today"
                if (valueStamp > todayStart) {
                    return this.$t('whatsapp_manage.lastOnlineTime_today').replace('$hours', hours).replace('$minutes', minutes);
                }

                // 昨天显示 "昨天 时:分", 英文: "时:分 yesterday"
                if (valueStamp > yesterdayStart) {
                    return this.$t('whatsapp_manage.lastOnlineTime_yesterday').replace('$hours', hours).replace('$minutes', minutes);
                }

                // 本周的日期显示 "星期* 时:分", 英文: "时:分 on 星期*"
                if (valueStamp > weekStart) {
                    return this.$t('whatsapp_manage.lastOnlineTime_weekDay').replace('$weekDay', weekMap[day]).replace('$hours', hours).replace('$minutes', minutes);
                }

                // 本周之前的日期显示 "xxxx年yy月zz日 时:分", 英文: "时:分, yy月 zz, xxxx"
                return this.$t('whatsapp_manage.lastOnlineTime_year').replace('$year', year).replace('$month', monthMap[month]).replace('$date', date).replace('$hours', hours).replace('$minutes', minutes);
            },

            // 滚动到指定引用消息处
            handleScrollToQuoteMsg(msg) {
                // 在消息数组中定位引用消息
                const existed_waMsg = this.whatsAppMsgList.find(item => item.messageId === msg.messageId);
                const existed_quoteMsg = this.waQuoteMsgList.find(item => item.messageId === msg.messageId);

                if (existed_waMsg) {
                    // 引用消息在正常消息数组中

                    // 显示正常消息
                    this.msgListType = 'normal';

                    // 聊天界面定位到消息位置
                    this.targetMsgLocation(msg, true);
                } else if (existed_quoteMsg) {
                    // 引用消息在引用消息数组中

                    // 显示正常消息
                    this.msgListType = 'quote';

                    // 聊天界面定位到消息位置
                    this.targetMsgLocation(msg, true);
                } else {
                    // 引用消息当前不在任一列表中

                    // 显示 loading
                    this.isLoading = true;

                    // 清空原引用消息数组
                    this.waQuoteMsgList = [];

                    // 获取引用消息
                    this.getQuoteMsgList(msg, false, null, true);
                }
            },
            // 定位到消息位置
            targetMsgLocation(msg, highlight = false) {
                this.$nextTick(() => {
                    if (this.$refs.msgScroll && this.$refs.msgScroll.$el) {
                        const msgDomArr = this.$refs.msgScroll.$el.querySelectorAll('.u-msg');

                        // 获取该消息在当前显示的消息数组中的位置
                        const msgIndex = this.msgList.findIndex(item => item.messageId === msg.messageId);

                        // 如果页面已渲染此条消息
                        if (msgIndex !== -1 && msgDomArr[msgIndex]) {
                            // 获取此消息 dom
                            const el = msgDomArr[msgIndex];

                            // 滚动到视口
                            if (el.scrollIntoView) {
                                el.scrollIntoView();
                            }

                            // 高亮消息, 2s 后恢复原状
                            if (highlight) {
                                el.classList.add('quoted-msg__highlight');
                                setTimeout(() => {
                                    el.classList.remove('quoted-msg__highlight');
                                }, 2000);
                            }
                        }
                    }
                });
            },
            // 获取引用消息前后的消息
            getQuoteMsgList(msg, isPrePage = false, resolve, highlight = false) {
                if (!msg) {
                    console.error('未传入基准引用消息, 无法向上/下请求更多引用消息');
                    return false;
                }

                // 如果当前不是通过 scroll 加载列表数据(没有 scroll 组件自带的 loading), 则显示 loading
                if (!resolve) {
                    this.isLoading = true;
                }

                // 显示 loading
                this.isLoading = true;

                /* 取消上一次请求，避免频繁请求接口时因接口响应速度快慢导致数据错乱 */
                if (typeof this.cancelFunc_quote === 'function') {
                    this.cancelFunc_quote();
                }
                const vm = this;

                // 发送请求
                util.ajaxWAJson({
                    url: '/whatsapp/chatRecords/page',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        userBindWaAccount: this.currAccountInfo.userBindWaAccount,
                        chatWaAccount: this.currAccountInfo.chatWaAccount || this.currAccountInfo.contactWaAccount,
                        page: '1', // 实际上没用了, 但是不加报错, 就用 '1' 吧
                        size: `${this.size}`,
                        isPrePage,
                        baseMessageId: msg.messageId
                    },
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        vm.cancelFunc_quote = c;
                    })
                }).then(({ data }) => {
                    // 请求数据成功, 合并返回消息数据到消息列表
                    if (data.code === 1) {
                        if (Array.isArray(data.data.content) && data.data.content.find(item => item.messageId === msg.messageId)) {
                            // 如果返回数据中包括基准消息, 则正常向下执行(合并数据, 显示)

                            this.mergeMsgList(data.data.content, 'quote');
                        } else {
                            // 否则视作获取引用消息超时, 根据登录状态给出不同的提示语

                            if (this.whatsAppAccountInfo.loginStatus === 1) {
                                this.$Message.warning(this.$t('whatsapp_manage.info_getQuotedMsgTimeout'));
                            } else {
                                this.$Message.error(this.$t('whatsapp_manage.error_getQuotedMsgTimeout'));
                            }
                        }
                    } else if (data.code === -1) {
                        // 获取引用消息超时, 根据登录状态给出不同的提示语
                        if (this.whatsAppAccountInfo.loginStatus === 1) {
                            this.$Message.warning(this.$t('whatsapp_manage.info_getQuotedMsgTimeout'));
                        } else {
                            this.$Message.error(this.$t('whatsapp_manage.error_getQuotedMsgTimeout'));
                        }
                    } else {
                        // 失败提示
                        this.$Message.error(this.$t('mail.writeLetter.addContactModal.requestErrorTip'));
                    }

                    // 如果请求完成后, 引用消息列表仍为空, 则显示正常列表
                    if (!this.waQuoteMsgList.length) {
                        this.msgListType = 'normal';
                    } else {
                        this.msgListType = 'quote';
                    }

                    // 滚动到指定消息位置
                    this.targetMsgLocation(msg, highlight);

                    // 隐藏 loading
                    if (resolve) {
                        resolve();
                    }
                    this.isLoading = false;
                }).catch(err => {
                    console.error(err);

                    // 失败提示
                    this.$Message.error(this.$t('mail.writeLetter.addContactModal.requestErrorTip'));

                    // 如果请求完成后, 引用消息列表仍为空, 则显示正常列表
                    if (!this.waQuoteMsgList.length) {
                        this.msgListType = 'normal';
                    } else {
                        this.msgListType = 'quote';
                    }

                    // 隐藏 loading
                    this.isLoading = false;
                });
            },
            // 处理接口返回的数据(要求正常消息列表和引用消息列表都用这个方法, 方便在两者变动时判断两列表是否可合并)
            mergeMsgList(data, dataType = 'normal') {
                // 传入数据处理
                data.forEach(item => {
                    if (item.extendedJson) {
                        try {
                            const tmp = JSON.parse(item.extendedJson);
                            if (tmp.seconds) {
                                item.seconds = tmp.seconds;
                            }
                        } catch (err) {
                            console.error('处理 page 接口返回数据的 extendedJson 错误');
                        }
                    }
                });

                // 暂存消息数组
                let msgList = [];
                if (dataType === 'quote') {
                    msgList = this.waQuoteMsgList.slice();
                } else {
                    msgList = this.whatsAppMsgList.slice();
                }

                // 合并消息数组和接口数据
                msgList = msgList.concat(data);

                // 定义"正常消息列表和引用消息列表已合并" flag
                let merged = false;
                // 如果两类 msgList 有重合
                if (this.waQuoteMsgList.find(quMsg => this.whatsAppMsgList.find(waMsg => waMsg.messageId === quMsg.messageId))) {
                    // 合并两类 msgList
                    if (dataType === 'quote') {
                        msgList = msgList.concat(this.whatsAppMsgList);
                    } else {
                        msgList = msgList.concat(this.waQuoteMsgList);
                    }

                    // 标识"已合并" flag 为 true , 之后再做处理
                    merged = true;
                }

                // 数组去重
                const ids = new Set();
                msgList = msgList.filter(item => {
                    if (!ids.has(item.messageId)) {
                        ids.add(item.messageId);
                        return true;
                    }
                });

                // 非多设备下执行
                if (!this.WAIsMd) {
                    // 检查列表中是否有未发送成功的消息
                    msgList.forEach(item => {
                        this.time = 0;
                        // 小闹钟消息&&是'我'发送的消息
                        if (!item.readFlag && item.fromMe) {
                            this.unSendMsgList.push(item.messageId);
                            // 去重
                            this.unSendMsgList = [...new Set(this.unSendMsgList)];
                        };
                    });
                }

                // 数组按时间倒序
                msgList.sort((a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp));

                // 数据赋值
                if (merged) {
                    // 如果两种 msgList 已合并

                    // 清空引用消息列表
                    this.waQuoteMsgList = [];

                    // 赋值正常消息列表
                    this.whatsAppMsgList = msgList;

                    // 显示正常消息列表
                    this.msgListType = 'normal';

                    // 计算当前 page (为避免消息遗漏, 此处计算 page 采用 floor)
                    this.page = Math.floor(msgList.length / this.size);
                } else if (dataType === 'quote') {
                    // 否则, 如果当前请求的是引用消息数据

                    // 赋值引用消息列表
                    this.waQuoteMsgList = msgList;
                } else {
                    // 否则, 当前请求的是正常消息数据

                    // 赋值正常消息列表
                    this.whatsAppMsgList = msgList;
                }

                // 如果消息列表中有对方的消息, 通知外部(wa 数据采集-号码列表)更新"是否已回复"状态
                if (msgList.some(item => item.fromWaAccount === this.chatWaAccount)) {
                    this.$emit('changeReplyStatus', [this.talkObj.tableWaAccount || this.chatWaAccount, this.whatsAppAccountInfo.whatsappAccount]);
                }
            },

            handleFrameScroll: _.debounce(function(e) {
                // 关闭 select 下拉选框
                if (e && e.target && e.target.id.includes('whatsApp-main')) {
                    if (document.querySelector('.poptip-block')) {
                        document.querySelector('.poptip-block').click();
                    }
                }

                // 判断是否需要显示"滚动到最底部"按钮
                if (this.msgListType === 'normal') {
                    if (this.$refs.msgScroll && this.$refs.msgScroll.$el) {
                        // 暂存消息滚动容器
                        const scrollContainer = this.$refs.msgScroll.$el.querySelector('.ivu-scroll-container');
                        // 暂存所有消息
                        const msgDomArr = scrollContainer.querySelectorAll('.u-msg');

                        if (msgDomArr.length) {
                            // 获取最后一条消息的高度
                            const lastMsgHeight = msgDomArr[msgDomArr.length - 1].offsetHeight;

                            // 滚动容器滚动距离 + 滚动容器高度 + 最后一条消息高度, 如果小于滚动容器的滚动高度, 则最后一条消息不在视口内, 显示"直达底部"按钮, 否则不显示
                            this.visible_toBottomBtn = scrollContainer.scrollTop + scrollContainer.offsetHeight + lastMsgHeight < scrollContainer.scrollHeight;
                        }
                    }
                }

                // 触发自动翻译
                this.loadMoreAutoTransMixin();
            }, 250),
            // (切换到正常消息列表模式, )滚动到最底部
            scrollToBottom() {
                // 显示正常的消息数组
                this.msgListType = 'normal';

                this.$nextTick(() => {
                    this.targetMsgLocation(this.msgList[this.msgList.length - 1]);
                });
            },

            /* WA 群组消息相关 */
            // 获取群组详情
            async getGroupDetail() {
                // 显示 loading
                this.loading_group = true;

                // 清除之前的数据
                this.clearGroupInfo();

                // 发送请求
                const res = await util.ajaxWAJson({
                    url: '/whatsapp/chatRecords/getGroupParticipantList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        chatWaAccount: this.chatWaAccount,
                        userBindWaAccount: this.userBindWaAccount
                    }
                });

                // 接口返回数据处理
                if (res.data && res.data.code === 1 && res.data.data) {
                    const { groupChatDtoList, subject, contactWaAvatar, chatSize } = res.data.data;

                    // 处理群成员数据
                    let memberList = Array.isArray(groupChatDtoList) ? groupChatDtoList : [];
                    // 获取"CRM 录入状态"数据, 之后追加到成员数据中
                    const res_crmStatus = await this.getWAAccountCrmStatus(memberList.map(item => item.participant));
                    memberList = memberList.map(item => {
                        const { nickName: name, chatWaAvatar: avatar, participant: waAccount, content: lastChatContent, type: lastChatType, deleteFlag, isAdmin, permission } = item;
                        return {
                            name,
                            avatar,
                            waAccount,
                            lastChatContent,
                            lastChatType,
                            deleteFlag,
                            isAdmin,
                            permission,
                            leadscloudStatus: res_crmStatus[waAccount] || ''
                        };
                    });

                    // 赋值
                    this.groupInfo = {
                        account: this.chatWaAccount,
                        name: subject || '',
                        avatar: contactWaAvatar || '',
                        size: chatSize || 0,
                        memberList
                    };
                } else {
                    this.$Message.error(this.$t('whatsapp_manage.error_getGroupDetail'));
                }

                // 隐藏 loading
                this.loading_group = false;
            },
            // 清除原有群组数据
            clearGroupInfo() {
                this.groupInfo = {
                    account: this.chatWaAccount || '',
                    name: '',
                    avatar: '',
                    size: 0,
                    memberList: []
                };
            },
            // 请求 CRM 状态
            async getWAAccountCrmStatus(accountList) {
                // 传入参数校验
                if (!(Array.isArray(accountList) && accountList.length)) {
                    this.$Message.error(this.$t('crm.InqSet.error_params'));

                    return [];
                }

                // 请求接口
                const res = await util.ajaxWAJson({
                    url: '/whatsapp/contactToLeadscloudStatus/getLeadscloudStatus',
                    method: 'POST',
                    data: {
                        contactWaAccountList: accountList,
                        orgId: this.enterpriseId
                    }
                });

                // 格式化接口返回, 转换成 { waAccount: leadscloudStatus } 格式
                const result = {};
                if (res.data && res.data.code === 1) {
                    if (Array.isArray(res.data.data) && res.data.data.length) {
                        res.data.data.forEach(item => {
                            result[item.contactWaAccount] = item.leadscloudStatus;
                        });
                    }
                }

                // 返回结果
                return result;
            },

            // 切换登录过的账号
            checkOwnWAAccount(ownAccountInfo) {
                // 如果选中了 WABA 账号, 关闭弹框, 跳转到 wa 聊天页面
                if (ownAccountInfo.tag === 'WABA') {
                    this.jumpWABAAccount(ownAccountInfo);
                    this.closeReplyModal();
                    return;
                }

                // 不管切换账号是否成功, 都要执行"关闭离开确认框"等操作
                this.timer_recoverFromComposing = {};

                // 更新 WA 绑定账号信息
                this.whatsAppAccountInfo = ownAccountInfo;

                // 如果不在线, 弹出提示
                if (`${this.whatsAppAccountInfo.loginStatus}` !== '1') {
                    this.$Message.error(this.$t('whatsapp_manage.error_noOnline'));
                }

                // 重新请求数据
                this.refreshMsgList();
            },
            // 退出 wa 账号后做相关操作
            handleRemoveOwnAccount(account) {
                // 要退出的账号是否是当前账户
                const isShowing = account === this.whatsAppAccountInfo.whatsappAccount;

                // 从账号列表中去除该账号
                const index = this.ownWhatsAppAccountList.findIndex(item => item.whatsappAccount === account);
                if (index !== -1) {
                    this.ownWhatsAppAccountList.splice(index, 1);
                }

                if (this.ownWhatsAppAccountList.length) {
                    // 如果还有账号

                    // 清空该账号未读数
                    const updateObj = {};
                    updateObj[account] = null;
                    this.$store.commit('setWAUnreadCount', updateObj);

                    // 如果退出的是当前展示的账号, 则需要重新按优先级选取要显示的账号
                    if (isShowing) {
                        // 按优先级重新选定要展示的账号
                        this.checkCurrOwnAccountInfo(this.ownWhatsAppAccountList);
                        // 触发
                        this.checkOwnWAAccount(this.whatsAppAccountInfo);
                    }
                } else {
                    // 如果已经没账号了

                    // 清空未读数
                    this.$store.commit('setWAUnreadCount', null);

                    // 清空账户数据
                    this.clearInfo();

                    // 显示二维码
                    this.isLogoutWA = true;
                }
            },
            // 查询账号翻译记忆
            getTransLatMem() {
                return getTranslateMemory({
                    orgId: this.ownEnterpriseId,
                    userId: this.ownUserId,
                    sessionType: 11,
                    userAccount: this.whatsAppAccountInfo.whatsappAccount, // 询盘云 用户账号
                    visitorAccount: this.currAccountInfo.chatWaAccount // 访客账号
                });
            }
        },
        created() {
        },
        beforeDestroy() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }

            // 清除 observer
            if (this.observer) {
                let _el = null;
                try {
                    _el = this.$refs.currentModal.$el.querySelector('.el-dialog__body');
                } catch (e) {
                    _el = document.querySelector('.whatsApp-modal .el-dialog__body');
                }
                if (_el) {
                    this.observer.uninstall(_el);
                }
                this.observer = null;
            }
            if (this.interval_getTimeZon) {
                clearInterval(this.interval_getTimeZon);
            }
        },
        mounted() {
            this.unSendMsgList = [];
        },
        watch: {
            visibleReplyModal: {
                async handler(val) {
                    if (val) {
                        // 打开后清空聊天记录重新请求
                        this.clearInfo();
                        await this.getWALoginAccount();
                        this.interval_getTimeZon = setInterval(() => {
                            console.log('执行----interval_  全局wa回复组件内执行');
                            this.getServeTime().then(res => {
                                this.selfTimeZone = this.getFriendsTime(this.timeZone, res.data.data);
                                // console.log(this.getFriendsTime(this.timeZone, res.data.data));
                            });
                        }, this.timeStepFroTimeZone);
                    } else {
                        // 关闭聊天框后, 回复 isLogoutWA 为初始状态, 下次打开再重新请求账号更新 isLogoutWA
                        setTimeout(() => {
                            this.isLogoutWA = false;
                        }, 0);
                        if (this.interval_getTimeZon) {
                            clearInterval(this.interval_getTimeZon);
                        }
                    }
                },
                immediate: true
            },
            // websocket推送
            websocketMsgWA(val) {
                // 发消息时会调用   手机断网(调用一次)、联网(调用两次)时会调用
                const websocketObj = val.whatsappAccountWebsocketCondition;

                // 收到的消息是 WA 账号登录状态变更消息
                if (val.whatsAppAccountLoginStatus) {
                    // 如果消息中没有账号信息, 退出流程
                    if (!val.loginWhatsappAccount) {
                        return;
                    }

                    const matchedAccountInfo = this.ownWhatsAppAccountList.find(item => item.whatsappAccount === val.loginWhatsappAccount);
                    // 消息中的 wa 账号不存在于当前账号列表, 退出流程
                    if (!matchedAccountInfo) {
                        // 之前是单账号, 所以收到其他账号的登录状态变更消息就认为自己的账号可能已经过时了, 需要刷新, 现在改多账号, 先不刷新
                        // location.reload();

                        // 停止向下执行
                        return;
                    }

                    // 如果消息状态为"退出登录", 退出匹配账号
                    if (val.whatsAppAccountLoginStatus === 3) {
                        this.handleRemoveOwnAccount(matchedAccountInfo.whatsappAccount);

                        return;
                    }

                    // 否则, 正常更新当前绑定的 wa 账号状态
                    matchedAccountInfo.loginStatus = val.whatsAppAccountLoginStatus;

                    // 如果是当前账号从未登录变为登录, 走重新请求数据途径, 以刷新当前界面展示的数据(以前单账号的思路, 现在看着还能用就复用了)
                    if (matchedAccountInfo.whatsappAccount === this.whatsAppAccountInfo.whatsappAccount) {
                        // 变更的是当前选中显示的 wa 账号

                        if (val.whatsAppAccountLoginStatus === 1 && matchedAccountInfo.loginStatus !== 1) {
                            // 绑定的 wa 账号状态变更为已连接, 重新请求绑定账号, 之后视情况刷新页面
                            this.refreshMsgList();

                            // 停止向下执行
                            return;
                        }
                    }

                    // 消息处理完毕, 退出流程
                    return;
                }

                // 小闹钟变更后踢出新数组中相应的messageId
                const messageStatus = val.messageStatus;
                if (messageStatus && messageStatus.messageId) {
                    this.unSendMsgList = this.unSendMsgList.filter(item => {
                        this.time = 0;
                        return item !== messageStatus.messageId;
                    });
                }

                // 取当前消息对应的 wa 账号
                let msgAccount = '';
                switch (val.WaWebsocketMessageType) {
                    case 2:
                        msgAccount = val.loginWhatsappAccount;
                        break;
                    case 3:
                    case 19:
                        if (val.whatsappAccountWebsocketCondition) {
                            msgAccount = val.whatsappAccountWebsocketCondition.userBindWaAccount;
                        }
                        break;
                    default:
                        msgAccount = val.userBindWaAccount;
                }
                // 账号信息
                let matchedAccountInfo = {};
                if (msgAccount) {
                    // 当前消息对应的 wa 账号
                    matchedAccountInfo = this.ownWhatsAppAccountList.find(item => item.whatsappAccount === msgAccount) || {};
                }
                // 是否是当前展示的 wa 账号
                const isShowing = matchedAccountInfo.whatsappAccount && matchedAccountInfo.whatsappAccount === this.whatsAppAccountInfo.whatsappAccount;

                // 当前登录用户绑定的 WA 账号失效
                if (val.WaWebsocketMessageType === 2) {
                    matchedAccountInfo.loginStatus = 2;
                }

                // 收到私信推送
                if (val.WaWebsocketMessageType === 3 && (this.chatWaAccount === websocketObj.toWaAccount || this.chatWaAccount === websocketObj.fromWaAccount)) {
                    // 如果不是与当前展示的 wa 账号相关的消息, 退出流程
                    if (!isShowing) {
                        // 看看要不要做啥其他处理, 未读数之类的

                        return;
                    }

                    // 格式化新消息
                    const { type, timeStamp, lastChatContent: content, fromMe, chatRecordsId: id, readFlag, contentQiniuUrl, contentThumbnail, quotedMessage, extendedJson, fromWaAccount, nickName: fromWaName, toWaAccount, deleteFlag } = websocketObj;
                    const temp = { messageId: val.messageId, type, timeStamp, content, fromMe, id, readFlag, contentQiniuUrl, contentThumbnail, quotedMessage, fromWaAccount, fromWaName, toWaAccount, deleteFlag };
                    if (temp.fromMe) {
                        temp.fromWaAvatar = this.whatsAppAccountInfo.whatsappAvatar;
                    } else {
                        temp.fromWaAvatar = this.currAccountInfo.chatWaAvatar || this.currAccountInfo.contactWaAvatar;
                    }
                    if (extendedJson) {
                        try {
                            const tmp = JSON.parse(extendedJson);
                            if (tmp.seconds) {
                                temp.seconds = tmp.seconds;
                            }
                        } catch (err) {
                            console.error('处理 ws 推送的新 wa 消息的 extendedJson 错误');
                        }
                    }

                    // 加入此消息到正常 wa 消息数组
                    this.mergeMsgList([temp]);

                    // 滚动到最新消息处
                    this.targetMsgLocation(temp);
                }

                // 收到 WA 账号在线状态更新 WS 消息
                if (val.WaWebsocketMessageType === 4) {
                    // 如果不是与当前展示的 wa 账号相关的消息, 退出流程
                    if (!isShowing) {
                        // 看看要不要做啥其他处理, 未读数之类的

                        return;
                    }

                    // 提取数据
                    const { t, id, type } = val.presence || {};

                    if (this.chatWaAccount === id) {
                        // 此消息中的账号与当前聊天账号匹配

                        // 如果会话当前在线状态不为"输入中", 暂存此时在线状态为"变更为'输入中'之前的在线状态"
                        if (this.onlineStatus !== 'composing') {
                            this.latestOnlineStatus = this.onlineStatus || '';
                        }

                        // 清除之前的定时器
                        if (this.timer_recoverFromComposing) {
                            clearTimeout(this.timer_recoverFromComposing);
                            this.timer_recoverFromComposing = null;
                        }

                        if (type === 'composing') {
                            // 如果状态为"输入中"

                            // 设置定时器, 5s 后从"输入中"状态恢复到变更前状态
                            this.timer_recoverFromComposing = setTimeout(() => {
                                this.onlineStatus = this.latestOnlineStatus || '';
                            }, 5000);
                        }

                        if (type === 'unavailable') {
                            // 如果状态为"离线"

                            // 更新"最后上线时间"
                            this.lastOnlineTimeStamp = t ? `${t}000` : 0;
                        }

                        // 更新账号在线状态
                        this.onlineStatus = type;
                    }
                }

                // 后台异步发送"文件消息的引用消息", 前端追加到文件消息上
                if (val.WaWebsocketMessageType === 6) {
                    // 提取数据
                    const mediaMessage = val.mediaMessage || {};
                    const { messageId, extendedJson } = mediaMessage;

                    if (messageId && extendedJson) {
                        // 判断当前 messageId 是否在已请求到的消息中
                        const existed_waMsg = this.whatsAppMsgList.find(item => item.messageId === messageId);
                        const existed_quoteMsg = this.waQuoteMsgList.find(item => item.messageId === messageId);
                        const existedMsg = existed_waMsg || existed_quoteMsg;

                        // 当前 messageId 已存在于消息数组中
                        if (existedMsg) {
                            try {
                                // 追加引用消息到已存在消息上
                                const tmp = JSON.parse(extendedJson);
                                if (tmp.quotedMessage) {
                                    existedMsg.quotedMessage = tmp.quotedMessage;
                                }
                            } catch (e) {
                                console.error('追加引用消息失败');
                                console.error(extendedJson);
                            }
                        }
                    }
                }

                // 收到"添加群成员"通知
                if (val.WaWebsocketMessageType === 8) {
                    // 如果是当前群
                    if (val.chatId === this.chatWaAccount) {
                        // 数据暂存
                        const participants = val.participants;

                        // 遍历成员列表, 给退群成员加上退群 flag
                        participants.forEach(participantInfo => {
                            // "是否存在于成员列表" Flag
                            let existed = false;

                            // 遍历成员列表, 如果列表中已存在, 则更新数据
                            this.groupInfo.memberList.some(item => {
                                if (item.waAccount === participantInfo.participant) {
                                    // 已存在于群成员数组
                                    existed = true;

                                    // 数据更新
                                    item.name = participantInfo.nickName;
                                    item.avatar = participantInfo.chatWaAvatar;
                                    item.waAccount = participantInfo.participant;
                                    item.leadscloudStatus = participantInfo.leadscloudStatus;
                                    if (item.deleteFlag === 1) {
                                        item.deleteFlag = 0;
                                        this.groupInfo.size++;
                                    }

                                    // 退出循环
                                    return true;
                                }
                            });

                            // 新消息发送者不存在于群成员列表中, 加入该用户到成员列表中去
                            if (!existed) {
                                const { nickName: name, chatWaAvatar: avatar, participant: waAccount, isAdmin, permission, leadscloudStatus } = participantInfo;
                                this.groupInfo.memberList.push({
                                    name,
                                    avatar,
                                    waAccount,
                                    lastChatContent: '',
                                    lastChatType: '',
                                    deleteFlag: 0,
                                    isAdmin,
                                    permission,
                                    leadscloudStatus
                                });
                                this.groupInfo.size++;
                            }
                        });
                    }
                }

                // 收到"群成员退群"通知
                if (val.WaWebsocketMessageType === 9) {
                    // 数据暂存
                    const participants = val.participants;

                    // 如果是当前群
                    if ((val.chatId === this.chatWaAccount) && Array.isArray(participants)) {
                        // 遍历成员列表, 给退群成员加上退群 flag
                        participants.forEach(account => {
                            this.groupInfo.memberList.some(item => {
                                if (item.waAccount === account) {
                                    if (item.deleteFlag !== 1) {
                                        item.deleteFlag = 1;
                                        this.groupInfo.size--;
                                    }

                                    // 退出循环
                                    return true;
                                }
                            });
                        });
                    }
                }

                // 收到"发送消息权限变更"通知
                if (val.WaWebsocketMessageType === 10) {
                    if (val.chatId === this.chatWaAccount) {
                        this.groupInfo.memberList.forEach(item => {
                            item.permission = val.permission;
                        });
                    }
                }

                // 收到"群员管理员权限变更"通知
                if (val.WaWebsocketMessageType === 11) {
                    // 数据暂存
                    const participants = val.participants;

                    if (val.chatId === this.chatWaAccount && Array.isArray(participants)) {
                        // 遍历成员列表, 更新群成员管理员权限
                        participants.forEach(account => {
                            this.groupInfo.memberList.some(item => {
                                if (item.waAccount === account) {
                                    item.isAdmin = val.isAdmin;

                                    // 退出循环
                                    return true;
                                }
                            });
                        });
                    }
                }

                if (websocketObj && websocketObj.type === '1') {
                    // 手动触发自动翻译功能(方法在mixin中)
                    this.handleTranslate('', '.whatsapp-main-whatsappReplyModal');
                }
            },
            // 监听显示的消息数组类型, 显示的是引用消息, 则显示"直达底部"按钮
            msgListType: {
                handler(val) {
                    if (val === 'quote') {
                        this.visible_toBottomBtn = true;
                    }
                }
            },
            // 监听小闹钟消息列表
            unSendMsgList(val) {
                clearTimeout(this.clockTimer);
                // 定时器，重置，计数，
                this.clockTimer = setTimeout(() => {
                    if (this.unSendMsgList.length) {
                        this.handleClockArr();
                    };
                }, 1000);
            },
            // 群组信息变更时, 同步数据到 currAccountInfo 中, 给 WhatsAppSend 组件用
            groupInfo: {
                handler(val) {
                    this.$set(this.currAccountInfo, 'groupInfo', val);
                },
                deep: true
            },
            currAccountInfo: {
                async handler(nv) {
                    if (this.whatsAppAccountInfo && this.currAccountInfo.chatWaAccount) {
                        const datares = await this.getTransLatMem();
                        this.lastTransMemory = datares.message || 'zh';
                        util.ajaxWAJson({
                            url: '/minor/waReport/getTimeZone',
                            method: 'get',
                            params: { chatWaAccount: this.currAccountInfo.chatWaAccount }
                        }).then(timzon => {
                            this.timeZone = timzon.data.data.timeZone;
                            this.getServeTime().then(res => {
                                this.selfTimeZone = this.getFriendsTime(this.timeZone, res.data.data);
                            });
                        });
                    }
                },
                deep: true
            },
            // 翻译记忆监听
            lastTransMemory: {
                async handler(nv, ov) {
                    this.$EVENTBUS.$emit('syncWaChatModeMemory11', nv, this.currAccountInfo);
                    await setTranslateMemory({
                        language: nv,
                        orgId: this.ownEnterpriseId,
                        userId: this.ownUserId,
                        sessionType: 11,
                        userAccount: this.whatsAppAccountInfo.whatsappAccount, // 询盘云 用户账号
                        visitorAccount: this.currAccountInfo.chatWaAccount // 访客账号
                    });
                },
                deep: true
            }
        }
    };
</script>

<style lang="less" scoped>
    .whatsApp-tip{
        // width: 450px;
        background-color: #fef0f0;
        z-index: 2011;
        border: 1px solid #fde2e2;
        padding: 15px;
        position: absolute;
        color: #f56c6c;
        border-radius: 4px;
        left: 160px;
        top: 0;
    }
    .whatsApp-modal{
        .whats-app-no-login-title{
            font-size: 14px;
            text-align: center;
        }
        .whats-app-no-login{
            padding-bottom: 30px;
            p{
                font-size: 12px;
                line-height: 18px;
                color: rgba(0,0,0,.8);
            }
        }
        #whatsApp-main{
            height: 100%;
        }
        .modal-code-box{
            position: relative;
            width: 200px;
            height: 200px;
            margin:0 auto;
            .handle-refresh{
                position: absolute;
                background-color: rgba(0, 0, 0, 0.7);
                width: 152px;
                height: 152px;
                top: 24px;
                left: 24px;
                .custom-refresh {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    margin-left: -12px;
                    margin-top: -12px;
                    cursor: pointer;

                }
                .refresh-loading {
                    animation: ani-load-loop 1s linear infinite;
                }
                @keyframes ani-load-loop {
                    from { transform: rotate(0deg);}
                    50%  { transform: rotate(180deg);}
                    to   { transform: rotate(360deg);}
                }
                .QRcode-failure {
                    position: absolute;
                    width: 100%;
                    left: 0;
                    bottom: 32px;
                    font-size: 12px;
                    color: #fff;
                    text-align: center;
                }
            }
            img {
                width: 100%;
            }
        }
        /deep/ .el-dialog__header{
            padding: 22px 24px 14px;
        }
        /deep/ .el-dialog__body{
            padding: 10px 24px;
        }
        /deep/ .el-dialog__footer{
            padding: 10px 24px 20px;
            text-align: left;
            border-top: 1px solid #e8e8e8;
        }

        /deep/ .waReplyModal-onlineStatus {
            display: inline-block;
            margin-left: 8px;
            font-size: 12px;
            color: rgba(0,0,0,0.60);
            letter-spacing: 0;
            line-height: 18px;
            font-weight: 400;

            &__composing {
                color: #FF752A;
            }
        }
    }
    .whatsApp-talk-modal{
        /deep/ .el-dialog__header{
             border-bottom: 1px solid #e8e8e8;
        }
    }

    .waReplyModal-footer {
        position: relative;

        .waChatFrame-scrollToBottom-btn {
            display: inline-block;
            border-radius: 50%;
            position: absolute;
            top: -65px;
            right: 0;
            cursor: pointer;

            svg {
                width: 40px;
                height: 40px;
            }
        }
    }
</style>

<style lang="less">
    .newSessionMsgBox {
        width: 500px;
        padding: 9px 9px 24px;

        .el-message-box__message {
            font-size: 12px;
            line-height: 18px;
            color: rgba(0, 0, 0, 80%);
        }

        .el-message-box__btns {
            margin-top: 60px;
        }

        .el-button {
            height: 36px;
            font-size: 14px;
            border-radius: 4px;
        }
    }
</style>
