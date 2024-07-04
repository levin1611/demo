<template>
    <div class="top-height" style="position: relative;">
        <div class="top-height">
            <Row class="fullwindow">
                <!-- 左侧聊天列表 -->
                <Col :span="6"
                     style="position: relative"
                     class="top-height">
                    <!-- loading -->
                    <Spin v-show="notConnectedYet"
                          fix>
                        <!-- 连接中 -->
                        <div v-if="isServerOnlineChecked && hasChatAuthority">
                            <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
                            <div>{{$t('chat.loading')}}</div>
                        </div>
                        <!-- 开启聊天 -->
                        <div v-else
                             style="font-size: 12px;color: rgba(0,0,0,0.80);">
                            <div v-if="hasChatAuthority">{{$t('chat.onlineTip')}}<br>
                                <span class="switch-chat-online" @click="switchChatState">{{$t('chat.onlineTip1')}}</span>
                            </div>
                            <div v-else>{{$t('chat.onlineTip2')}}</div>
                        </div>
                    </Spin>

                    <!-- 部分聊天设置 -->
                    <Poptip placement="bottom-end"
                            :offset="10"
                            popper-class="chatSettings-popper">
                        <!-- trigger -->
                        <!-- <div slot="reference"
                             class="chatSettings-trigger">
                            <Icon custom="custom-table-edit-columns"
                                  size="16"
                                  color="#BAC6D3"
                                  class="cursor-pointer"></Icon>
                        </div> -->

                        <!-- content -->
                        <div style="position: relative;">
                            <!-- loading -->
                            <Spin v-show="loading_setting"
                                  fix></Spin>

                            <!-- 访客提醒 -->
                            <div class="setItem">
                                <span class="setItem-tip">
                                    {{ $t('portal_set.visitor_remind') }}
                                    <!-- 系统 tip -->
                                    <HelpTip :title="$t('helpTip.visitor_remind')"
                                             :iconSize="14"
                                             :iconStyle="'vertical-align: text-top;'"></HelpTip>
                                </span>

                                <!-- 开关 Poptip -->
                                <Poptip placement="bottom-start"
                                        width="380"
                                        ref="visitorRemindPop">
                                    <!-- trigger -->
                                    <el-switch slot="reference"
                                               :value="visitorRemind"
                                               @click.native="handleClickSwitch('visitorRemindPop')"/>

                                    <!-- content -->
                                    <div>
                                        <!-- 提示语 -->
                                        <div class="editConfirmTip">
                                            <Icon custom="custom-warning"
                                                  size="16"
                                                  color="#FBBC04"
                                                  style="vertical-align: top; width: 0;"></Icon>
                                            <span style="display: inline-block; margin-left: 28px;">{{ visitorRemind ? $t('chat.tip_closeVisitorRemind') : $t('chat.tip_openVisitorRemind') }}</span>
                                        </div>

                                        <!-- footer -->
                                        <div class="text-right">
                                            <Button size="small"
                                                    @click="cancel_saveOrgRemind('visitorRemind')">{{ $t('cancel') }}</Button>
                                            <Button size="small"
                                                    type="primary"
                                                    @click="ok_saveOrgRemind('visitorRemind')">{{ $t('confirm') }}</Button>
                                        </div>
                                    </div>
                                </Poptip>
                            </div>

                            <!-- 客服自动下线 -->
                            <div class="setItem">
                                <span class="setItem-tip">
                                    {{ $t('portal_set.autoLogoutChat') }}
                                    <!-- 系统 tip -->
                                    <HelpTip :title="$t('helpTip.autoLogoutChat')"
                                             :iconSize="14"
                                             :iconStyle="'vertical-align: text-top;'"></HelpTip>
                                </span>

                                <!-- 开关 Poptip -->
                                <Poptip placement="bottom-start"
                                        width="380"
                                        ref="autoLogoutChatPop">
                                    <!-- trigger -->
                                    <el-switch slot="reference"
                                               :value="autoLogoutChat"
                                               @click.native="handleClickSwitch('autoLogoutChatPop')"/>

                                    <!-- content -->
                                    <div>
                                        <!-- 提示语 -->
                                        <div class="editConfirmTip">
                                            <Icon custom="custom-warning"
                                                  size="16"
                                                  color="#FBBC04"
                                                  style="vertical-align: top; width: 0;"></Icon>
                                            <span style="display: inline-block; margin-left: 28px;">{{ autoLogoutChat ? $t('chat.tip_closeAutoLogoutChat') : $t('chat.tip_openAutoLogoutChat') }}</span>
                                        </div>

                                        <!-- footer -->
                                        <div class="text-right">
                                            <Button size="small"
                                                    @click="cancel_saveOrgRemind('autoLogoutChat')">{{ $t('cancel') }}</Button>
                                            <Button size="small"
                                                    type="primary"
                                                    @click="ok_saveOrgRemind('autoLogoutChat')">{{ $t('confirm') }}</Button>
                                        </div>
                                    </div>
                                </Poptip>
                            </div>
                        </div>
                    </Poptip>

                    <!-- 会话列表 -->
                    <chat-list source="FullScreen"
                               ref="chatList"
                               @toggleChatConfirm="toggleChatConfirm"></chat-list>
                </Col>
                <!-- 聊天框 -->
                <Col v-show="!chatView"
                     :span="11"
                     style="position: relative"
                     class="top-height main-style">
                    <chat-frame :key="currSessionId"
                                source="FullScreen"
                                ref="chatFrame"></chat-frame>
                </Col>
                <!-- 访客信息 -->
                <Col v-show="!chatView"
                     :span="7"
                     class="top-height chat-info">
                    <chat-info></chat-info>
                </Col>
                <!-- 无聊天时显示的空白界面 -->
                <Col v-show="chatView"
                     :span="18"
                     style="border-left: 1px solid #e8e8e8;position: relative"
                     class="top-height">
                    <div class="init-chat">
                        <svg class="login-svg-icon" style="width: 200px;height: 90px" aria-hidden="true">
                            <use xlink:href="#custom-main-logo"></use>
                        </svg>
                        <p>{{ helloText }}</p>
                    </div>
                </Col>
            </Row>
        </div>

        <Modal
                :visible.sync="chatTransfer"
                :title="$t('chat.TransferTittle')"
                width="500"
                :show-close="false"
                :close-on-click-modal="false"
                :close-on-press-escape="false"
                :append-to-body="true"
                :modal-append-to-body="false"
                class="modal companydata">
            <div>{{ transferInfo }} {{ acceptTimeCount }}s...</div>
            <div slot="footer">
                <Button @click="refuseTransfer">{{$t('chat.refuseBtn')}}</Button>
                <Button type="primary" @click="acceptTransfer">{{$t('chat.acceptBtn')}}</Button>
            </div>
        </Modal>

        <!-- 离开确认框 -->
        <Modal :visible.sync="showToggleChatConfirm"
               :title="$t('mail.leaveConfirm')"
               :close-on-click-modal="false"
               :modal-append-to-body="false"
               top="40vh"
               width="488px"
               @close="showToggleChatConfirm = false">
            <div>{{ $t('whatsapp_manage.toggleChatConfirmTip1') }}</div>

            <div slot="footer">
                <Button type="primary"
                        plain
                        @click="showToggleChatConfirm = false">{{ $t('cancel') }}</Button>
                <Button @click="(showToggleChatConfirm = false) || ($refs.chatList.enterChat(toggleData))"
                        style="padding: 10px;"
                        type="primary">{{ $t('confirm') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import chatList from './components/chat-list.vue';
    import chatFrame from './components/chat-frame.vue';
    import chatInfo from './components/new-chat-info.vue';
    import Spin from '../main-components/spin/spin.vue';
    import store from '@/store';
    import util from '../../libs/util';
    import Cookies from 'js-cookie';
    import { mapState } from 'vuex';

    export default {
        name: 'xhl_chat',
        components: {
            chatList,
            chatFrame,
            chatInfo,
            Spin
        },
        computed: {
            ...mapState({
                isSwitchChatState: state => state.isSwitchChatState,
                isReloadServerList: state => state.isReloadServerList,
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                currSessionId: state => state.currSessionId,
                // 是否正在连接云信, 是 = 连接中, false = 完毕
                isSDKconnect: 'isSDKconnect',
                isServerOnlineChecked: 'isServerOnlineChecked',
                // 是否在聊天框处显示无聊天的空白页面, true = 是
                chatView: 'chatView'
            }),
            // 尚未连接云信成功 => 分为 未连接 和 连接中
            notConnectedYet() {
                if (this.isServerOnlineChecked && this.hasChatAuthority) {
                    return this.isSDKconnect;
                }

                return true;
            },
            // 接收转接通知的提示框
            chatTransfer() {
                if (this.$store.state.chatTransfer) {
                    // 计时器
                    this.setAcceptTime();
                }
                return this.$store.state.chatTransfer;
            },
            // 空白页使用的招呼语
            helloText() {
                // 计算当前时段, 早上/中午/晚上...
                let periodStr = '';
                const hour = new Date().getHours();
                if (hour >= 0 && hour < 6) {
                    periodStr = this.$t('chat.tip1');
                } else if (hour >= 6 && hour < 9) {
                    periodStr = this.$t('chat.tip1');
                } else if (hour >= 9 && hour < 12) {
                    periodStr = this.$t('chat.tip3');
                } else if (hour >= 12 && hour < 14) {
                    periodStr = this.$t('chat.tip4');
                } else if (hour >= 14 && hour < 17) {
                    periodStr = this.$t('chat.tip5');
                } else if (hour >= 17 && hour < 19) {
                    periodStr = this.$t('chat.tip6');
                } else {
                    periodStr = this.$t('chat.tip7');
                }

                return periodStr + (['12200'].includes(this.enterpriseId) ? this.$t('chat.tip12200') : this.$t('chat.tip'));
            },
            transferInfo() {
                const data = this.$store.state.transferInfo;
                return `${this.$t('openBracket')}${data.callTransferServerName}${this.$t('chat.transferTxt')}${data.customerName}${this.$t('chat.transferTxt1')}`;
            }
        },
        /** keep-alive  生命周期函数每次进入页面都有 不管是否缓存了组件 */
        activated() {},
        data() {
            return {
                isOpenPhotogallery: false,
                imgEvent: {},
                acceptTimeCount: '',
                acceptTimer: null,
                hasChatAuthority: false,

                // 用户切换会话时，若存在未发送的附件列表，需要进行离开确认
                showToggleChatConfirm: false,
                toggleData: {},

                /* 部分聊天设置 */
                // 修改聊天设置的 loading
                loading_setting: false,
                // 访客提醒是否启用
                visitorRemind: false,
                // 客服自动下线
                autoLogoutChat: false
            };
        },
        created: function() {
            this.init();
            // 获取正在聊天cookie
            if (Cookies.get('notChatWithOther')) {
                this.$store.commit('confirmNotChatWithOther', true);
            }

            // 获取聊天设置
            this.getRemindStatus();
        },
        methods: {
            switchChatState() {
                this.$store.state.isSwitchChatState = 'Login';
            },
            img_open_close(data) {
                this.$store.commit('setIsFullscreenImgShow', data);
            },
            init() {
                util.ajaxJson({
                    url: `/visitor-chat/newTenant/server/getAccInfoByUserId?userId=${this.userId}&enterpriseId=${this.enterpriseId}`,
                    method: 'GET'
                }).then(res => {
                    if (res.data.code == '1' && res.data.data?.accId) {
                        Cookies.set('accId', res.data.data?.accId)
                        Cookies.set('yxToken', res.data.data?.token)
                        this.$store.commit('setHasChatAuthority', true);
                        this.$store.commit('setAccId', res.data.data?.accId);
                        this.hasChatAuthority = true;
                        // 当没有聊天权限（开启聊天的过程中权限被修改的情况），且客服在线时，需退出聊天
                        if (!this.hasChatAuthority && this.isServerOnlineChecked) {
                            //                            this.isOnline(false,1,1);
                            this.$store.state.isSwitchChatState = 'Logout';
                        }
                    } else {
                        Cookies.remove('accId')
                        Cookies.remove('yxToken')
                        this.$store.commit('setAccId', null);
                        this.$store.commit('setHasChatAuthority', false);
                    }
                });
            },
            setAcceptTime() {
                const TIME_COUNT = 15;
                if (!this.acceptTimer) {
                    this.acceptTimeCount = TIME_COUNT;
                    console.log('this.acceptTimeCount', this.acceptTimeCount);
                    this.acceptTimer = setInterval(() => {
                        if (this.acceptTimeCount > 0 && this.acceptTimeCount <= TIME_COUNT) {
                            this.acceptTimeCount--;
                        } else {
                            //                            this.$Message.error('对方可能不在，请稍后再试~')
                            this.$store.state.chatTransfer = false;
                            clearInterval(this.acceptTimer);
                            this.acceptTimer = null;
                        }
                    }, 1000);
                }
            },
            // 接受转接
            async acceptTransfer() {
                const content = this.$store.state.transferInfo;
                await util.ajaxInternational({
                    url: '/visitor/receivedTransfer',
                    method: 'post',
                    data: {
                        callTransferServerAccId: content.callTransferServerAccId,
                        receivedTransferServerAccId: content.receivedTransferServerAccId,
                        receivedTransferServerName: content.receivedTransferServerName,
                        visitorAccid: content.visitorAccid,
                        visitorId: content.visitorId,
                        visitorName: content.customerName,
                        callTransferServerName: content.callTransferServerName
                    }
                });
                // 获得转接游客的聊天记录
                this.$store.dispatch('getTransferHistoryMsgs', {
                    visitorId: content.visitorId,
                    visitorAccid: content.visitorAccid,
                    visitorName: content.customerName,
                    callTransferServerName: content.callTransferServerName
                });
                // 标记这个游客正在聊天
                this.$store.commit('updataIsChatting', {
                    account: content.visitorAccid,
                    type: 1
                });
                // 订阅该访客
                this.$store.commit('subscribeEvent', content.visitorAccid);
                /**
                 * @Description: 因为 isChatWithOther 不再使用, 所以把下面这段注释了
                 * @author 汤一飞
                 * @date 2020/5/13
                */
                // 标记这个游客没有和其它人聊天
                // this.$store.commit('updateChatWithOtherList', {
                //     account: content.visitorAccid,
                //     status: false
                // });
                // 接受转接后,给该访客发送自定义消息,使其订阅自己
                store.commit('sendCustomSysMsgForSubscribesLogin', { account: content.visitorAccid });
                // 更新对话列表
                this.$store.dispatch('updateSessionList', true);
                this.$store.state.chatTransfer = false;
                clearInterval(this.acceptTimer);
                this.acceptTimer = null;
                this.$store.commit('setDisableChat', {
                    visitorId: content.visitorId,
                    flag: false
                });
                this.$store.commit('setFlagToInput', true);
            },
            // 拒绝转接
            refuseTransfer() {
                const content = this.$store.state.transferInfo;
                util.ajaxInternational({
                    url: '/visitor/refuseTransfer',
                    method: 'post',
                    data: {
                        callTransferServerAccId: content.callTransferServerAccId,
                        receivedTransferServerAccId: content.receivedTransferServerAccId,
                        visitorAccid: content.visitorAccid,
                        visitorId: content.visitorId,
                        visitorName: content.customerName,
                        callTransferServerName: content.callTransferServerName
                    }
                });
                this.$store.state.chatTransfer = false;
                clearInterval(this.acceptTimer);
                this.acceptTimer = null;
            },
            cancel() {
                this.$store.commit('setIsFullscreenImgShow', false);
            },

            // 切换聊天前校验文件是否未发送
            toggleChatConfirm(currTarget) {
                // 暂存待发送文件列表
                let temp = [];
                if (this.$refs.chatFrame && this.$refs.chatFrame.$refs.msgSend) {
                    temp = this.$refs.chatFrame.$refs.msgSend.fileList;
                }

                if (temp.length) {
                    // 有待发送文件

                    // 暂存待切换会话数据
                    this.toggleData = currTarget;
                    // 显示离开确认框
                    this.showToggleChatConfirm = true;
                } else {
                    // 无待发送文件

                    // 正常切换聊天
                    this.$refs.chatList.enterChat(currTarget);
                }
            },

            // 获取部分聊天设置
            getRemindStatus() {
                util.ajax({
                    url: 'cuss-login/common/getOrgRemindStatus',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(res => {
                    if (res.data.code === '1' && res.data.data) {
                        this.visitorRemind = res.data.data.remindStatus === 1;
                        this.autoLogoutChat = res.data.data.offlineSettings === 1;
                    }
                });
            },
            // 点击按钮时增加"关闭其他 Pop"逻辑
            handleClickSwitch(popName) {
                const popNames = ['visitorRemindPop', 'autoLogoutChatPop'].filter(item => item !== popName);
                popNames.forEach(name => {
                    if (this.$refs[name]) {
                        this.$refs[name].doClose();
                    }
                });
            },
            // 保存聊天设置
            ok_saveOrgRemind(paramName) {
                // 延时显示 loading --- 这个接口请求很快, 为避免 loading 一闪而过, 延迟显示 loading
                const timer_delayShowLoading = setTimeout(() => {
                    this.loading_setting = true;
                }, 100);

                // 关闭当前 Pop
                this.$refs[`${paramName}Pop`].doClose();

                // 处理数据
                const postData = {
                    orgId: this.enterpriseId,
                    remindStatus: this.visitorRemind ? 1 : 0,
                    offlineSettings: this.autoLogoutChat ? 1 : 0
                };
                // 暂存开关状态, 提示语用
                let toggleTo = '';
                if (paramName === 'visitorRemind') {
                    postData.remindStatus = this.visitorRemind ? 0 : 1;
                    toggleTo = this.visitorRemind ? 'off' : 'on';
                } else if (paramName === 'autoLogoutChat') {
                    postData.offlineSettings = this.autoLogoutChat ? 0 : 1;
                    toggleTo = this.autoLogoutChat ? 'off' : 'on';
                }

                // 发送请求
                util.ajax({
                    url: 'cuss-login/common/saveOrgRemindStatus',
                    method: 'post',
                    data: postData
                }).then(res => {
                    if (res.data.code === '1') {
                        // 更新数据
                        this.visitorRemind = postData.remindStatus === 1;
                        this.autoLogoutChat = postData.offlineSettings === 1;
                        // 同步 vuex
                        this.$store.commit('setIsNoticeNewVisitor', this.visitorRemind);
                        this.$store.commit('setAutoLogoutChat', this.autoLogoutChat);

                        // 成功提示
                        this.$Message.success(this.$t(`chat.${paramName}_${toggleTo}`));
                    } else {
                        // 提示失败
                        this.$Message.error(this.$t(`chat.error_set_${paramName}`));
                    }

                    // 取消 loading
                    clearTimeout(timer_delayShowLoading);
                    this.loading_setting = false;
                }).catch(e => {
                    // 提示失败
                    this.$Message.error(this.$t(`chat.error_set_${paramName}`));

                    // 取消 loading
                    clearTimeout(timer_delayShowLoading);
                    this.loading_setting = false;
                });
            },
            cancel_saveOrgRemind(paramName) {
                // 显示 loading
                this.loading_setting = false;

                // 关闭当前 Pop
                this.$refs[`${paramName}Pop`].doClose();
            }
        },
        beforeDestroy() {
            if (this.acceptTimer) {
                clearInterval(this.acceptTimer);
                this.acceptTimer = null;
            }

            if (this.$store.state.nim) {
                this.$store.state.nim.setCurrSession('');
            }
        },
        beforeRouteEnter(to, from, next) {
            // 停止页面标题闪动消息提示
            localStorage.setItem('xhlWindowClick', Date.now());
            window.parent.document.title = store.state.sourceDocumentTitle;
            store.commit('changeNewRemindFlag', false);
            next();
        },
        watch: {
            // 运行连接状态改变时, 在聊天框处显示无聊天的空白页面
            notConnectedYet: {
                handler() {
                    this.$store.commit('updateChatViewStatus', true);
                }
            },
            // 在聊天框处显示无聊天的空白页面时, 清除 currVisitorid
            chatView: {
                handler(val) {
                    if (val) {
                        this.$store.commit('updateCurrVisitorId', null);
                    }
                }
            }
        }
    };
</script>

<style lang="less">
    .init-chat {
        width: 200px;
        height: 200px;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: -100px;
        margin-left: -100px;
        text-align: center;
        color: #999999;
    }

    .chat-info {
        position: relative;
    }

    .top-height, .top-height .ivu-card-body {
        height: 100%;
        padding: 0px;
    }

    .fullwindow {
        height: 100%;
        background-color: #ffffff;
    }

    .main-style {
        overflow-x: hidden;
        border-left: 1px solid #e8e8e8;
        border-right: 1px solid #e8e8e8;
    }

    .switch-chat-online {
        color: #3b78de;
        cursor: pointer;
    }

    .switch-chat-online:hover {
        color: #2d63bc;
        text-decoration: underline;
    }

    .chatSettings-trigger {
        position: absolute;
        top: 15px;
        right: 15px;
    }

    .chatSettings-popper {
        .setItem {
            .setItem-tip {
                font-size: 13px;
                min-width: 100px;
                display: inline-block;
                margin-right: 20px;
            }

            .el-switch {
                float: right;
            }

            &:not(:last-child) {
                margin-bottom: 20px;
            }
        }
    }

    .editConfirmTip {
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: rgba(0,0,0,0.80);
        letter-spacing: 0;
        line-height: 18px;
        margin: 30px;
    }
</style>
