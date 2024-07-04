<template>
    <div class="session-list" :class="classObject" :style="{backgroundColor:bgColor}">
        <div class="u-list" style="padding-top: 20px;">
            <div class="chat-list-header websitechat-viewchatting" @click="isShowChattingList = !isShowChattingList">
                <Icon color="#7B98B6" size="16" v-if="isShowChattingList" type="ios-arrow-down"/>
                <Icon color="#7B98B6" size="16" v-else type="ios-arrow-forward"/>
                {{$t('chat.chatting')}}
                <span v-show="chattingLength > 0"
                      class="chat-length">{{ chattingLength }}</span>
            </div>
            <div v-show="isShowChattingList">
                <div
                        v-for="(item, index) in chattingList"
                        :key="index"
                        class="u-list-item"
                        @click="beforeEnterChat(item)" :class="{activeList: activeCount == item.account}">
                    <div class="chat-avatar">
                        <Badge :max="99" :value="item.unread" :hidden="item.unread <= 0">
                            <svg class="chat-svg-avatar" aria-hidden="true">
                                <use :xlink:href="item.avatar"></use>
                            </svg>
                        </Badge>
                    </div>
                    <div class="chat-content">
                        <div class="chat-list-item-header">
                            <span class="list-item-nick">{{item.nick}}</span>
                            <span class="list-remark chat-text" :id="item.account"
                                  :title="item.sign">{{item.sign}}</span>
                            <span class="chat-list-item-time">{{item.msgTime}}</span>
                        </div>
                        <div class="chat-list-item-content">
                            <div class="chat-text dialog-content">{{item.text}}</div>
                            <span class="chat-operate-icon">
                                <Poptip placement="bottom" popper-class="operate-chat-icon" trigger="click">
                                    <div class="api">
                                    <div @click.stop v-show="!item.isBlack" class="chat-switch-icon"
                                         style="margin: 5px 0;text-align: center">
                                        <!--<span class="chat-filter-item">转接聊天</span>-->
                                        <Poptip :title="$t('chat.TransferTip')"
                                                placement="right"
                                                trigger="click"
                                                popper-class="popper-title-14px">
                                            <!--<Icon color="#FA8241" size="18" style="vertical-align: text-top" type="arrow-swap"></Icon>-->
                                            <div style="position: relative;"
                                                 class="api">
                                                <spin v-if="cancelFunc_getServiceList"
                                                      fix></spin>
                                                <div v-if="transferList.length>0">
                                                    <div v-for="(item1, index1) in transferList" class="transfer-list" :key="index1"
                                                         @click.stop="comfirTransfer(item,item1)">{{item1.serverName}}({{item1.visitorCount}})</div>
                                                </div>
                                                <div v-else>{{$t('chat.noTransferTip')}}</div>
                                            </div>
                                            <div slot="reference" class="chat-filter-item piwik_ChatCallTransfer" style="cursor: pointer"
                                                 @click.stop="getAllEnterpriseService()">
                                                {{$t('transfer')}}<Icon color="#FA8241" size="18" style="vertical-align: text-top;margin-left: 5px" class="el-icon-caret-right"></Icon>
                                            </div>
                                        </Poptip>
                                    </div>
                                    <div style="margin: 5px 0;text-align: center;cursor: pointer">
                                        <span v-show="!item.isBlack" @click.stop="addBlackListTip(item)">
                                            {{$t('chat.shieldVisitor')}}<Icon custom="custom custom-shield"
                                                                              style="margin-left: 5px"/>
                                        </span>
                                        <span v-show="item.isBlack" @click.stop="removeBlackListTip(item)">
                                            {{$t('chat.cancelShield')}}<Icon custom="custom custom-shield"
                                                                             style="margin-left: 5px"/>
                                        </span>
                                    </div>
                                </div>
                                    <span slot="reference"><Icon size="14" class="custom custom-through-connection"></Icon></span>
                                </Poptip>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="chat-list-header websitechat-viewonlinevisitors" @click="isShowOnlineList = !isShowOnlineList">
                <Icon color="#7B98B6" size="16" v-if="isShowOnlineList" type="ios-arrow-down"/>
                <Icon color="#7B98B6" size="16" v-else type="ios-arrow-forward"/>
                {{$t('chat.online')}}
                <!-- 系统 tip -->
                <HelpTip :title="$t('helpTip.online')"></HelpTip>
                <span v-show="onlineLength > 0"
                      class="chat-length">{{ onlineLength }}</span>
            </div>
            <div class="chat-online-list" v-show="isShowOnlineList">
                <div
                        v-for="(item, index) in onlineList"
                        :key="index"
                        class="u-list-item"
                        @click="beforeEnterChat(item)" :class="{activeList: activeCount == item.account}"
                        v-show="isShowThisItemBaseOnUnread(item.unread,item.account)">
                    <div class="chat-avatar">
                        <Badge :max="99" :value="item.unread" :hidden="item.unread <= 0">
                            <svg class="chat-svg-avatar" aria-hidden="true">
                                <use :xlink:href="item.avatar"></use>
                            </svg>
                        </Badge>
                    </div>
                    <div class="chat-content">
                        <div class="chat-list-item-header">
                            <span class="list-item-nick">{{item.nick}}</span>
                            <span class="list-remark chat-text" :id="item.account"
                                  :title="item.sign">{{item.sign}}</span>
                            <span class="chat-list-item-time">{{item.msgTime}}</span>
                        </div>
                        <div class="chat-list-item-content">
                            <div class="chat-text dialog-content">{{item.text}}</div>
                            <!--<span :id="item.account" v-show="item.unread > 0" class="u-unread">{{item.unread}}</span>-->
                            <span v-show="!item.isBlack" class="black-icon" @click.stop="addBlackListTip(item)">
                        <Tooltip :content="$t('chat.shieldVisitor')" :transfer="true"><Icon
                                custom="custom custom-shield"/></Tooltip>
                            </span>
                            <span v-show="item.isBlack" class="black-flag" @click.stop="removeBlackListTip(item)">
                        <Tooltip :content="$t('chat.cancelShield')" :transfer="true"><Icon
                                custom="custom custom-shield"/></Tooltip>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="chat-list-header chat-offline websitechat-viewofflinevisitors"
                 @click="isShowOfflineList = !isShowOfflineList">
                <Icon color="#7B98B6" size="16" v-if="isShowOfflineList" type="ios-arrow-down"/>
                <Icon color="#7B98B6" size="16" v-else type="ios-arrow-forward"/>
                {{$t('chat.offline')}}
                <!-- 系统 tip -->
                <HelpTip :title="$t('helpTip.offline')"></HelpTip>
                <Tooltip content="我聊过的离线访客">
                    <span v-show="offlineLength > 0"
                          class="chat-length">{{ offlineLength }}</span>
                </Tooltip>

            </div>
            <div class="chat-offline-list" v-show="isShowOfflineList">
                <div
                        v-for="(item, index) in offlineList"
                        :key="index"
                        class="u-list-item"
                        @click="beforeEnterChat(item)" :class="{activeList: activeCount == item.account}"
                        v-show="isShowThisItemBaseOnUnread(item.unread,item.account)">
                    <!--全屏时离线列表过滤是否聊过天，功能不要就先注释-->
                    <!--v-show="isShowThisItem(item.text)">-->
                    <div class="chat-avatar">
                        <Badge :max="99" :value="item.unread" :hidden="item.unread <= 0">
                            <!--<Avatar :src="item.avatar" class="avatar-large"/>-->
                            <svg class="chat-svg-avatar" aria-hidden="true">
                                <use :xlink:href="item.avatar"></use>
                            </svg>
                        </Badge>
                    </div>
                    <div class="chat-content">
                        <div class="chat-list-item-header">
                            <span class="list-item-nick">{{item.nick}}</span>
                            <span class="list-remark chat-text" :id="item.account"
                                  :title="item.sign">{{item.sign}}</span>
                            <span class="chat-list-item-time">{{item.msgTime}}</span>
                        </div>
                        <div class="chat-list-item-content">
                            <div class="chat-text dialog-content">{{item.text}}</div>
                            <!--<span :id="item.account" v-show="item.unread > 0" class="u-unread">{{item.unread}}</span>-->
                            <span v-show="item.isBlack" class="black-flag" @click.stop="removeBlackListTip(item)">
                                <Tooltip :content="$t('chat.cancelShield')" :transfer="true"><Icon custom="custom custom-shield"/></Tooltip>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 屏蔽 -->
        <Modal :visible.sync="isAddBlack"
               :title="$t('chat.warmPrompt')"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               :append-to-body="true"
               width="520px"
               class="modal companydata transfer-modal">
            <div>
                <p style="text-align: center">{{ $t('chat.isMask') }}{{ blackNick }}{{ $t('chat.maskTip') }}</p>
            </div>
            <div slot="footer">
                <Button  @click="cancelAddBlackList">{{ $t('cancel') }}</Button>
                <Button type="primary"
                        class="websitechat-blockvisitors"
                        @click="addBlackList">{{ $t('confirm') }}</Button>
            </div>
        </Modal>

        <!-- 解除屏蔽 -->
        <Modal :visible.sync="visible_unblock"
               :title="$t('chat.warmPrompt')"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               :append-to-body="true"
               width="520px"
               class="modal companydata transfer-modal">
            <div>
                <p style="text-align: center">{{ $t('chat.cancelShieldTip1') }}{{ blackNick }}{{ $t('chat.cancelShieldTip2') }}</p>
            </div>
            <div slot="footer">
                <Button @click="cancel_unblock">{{ $t('cancel') }}</Button>
                <Button type="primary"
                        class="websitechat-unblockvisitors"
                        @click="removeBlackList">{{ $t('confirm') }}</Button>
            </div>
        </Modal>

        <!-- 访客和别人聊天提醒框 -->
        <!--<Modal-->
        <!--        :visible.sync="modal1"-->
        <!--        :modal-append-to-body="false"-->
        <!--        :title="$t('chat.warmPrompt')">-->
        <!--    <div><p style="text-align: center">{{tips}}</p></div>-->
        <!--    <div slot="footer">-->
        <!--        <Button type="primary" @click="ok1">{{$t('chat.knowBtn')}}</Button>-->
        <!--    </div>-->
        <!--</Modal>-->

        <!-- 转接 -->
        <template v-if="showModal">
            <Modal
                    :visible.sync="transferComfir"
                    :title="$t('chat.warmPrompt')"
                    :show-close="false"
                    :close-on-click-modal="false"
                    :close-on-press-escape="false"
                    :append-to-body="true"
                    :modal-append-to-body="false"
                    class="modal companydata transfer-modal">
                <Spin v-show="noticeLoading" fix>
                    <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
                    <div>{{$t('chat.TransferLoading')}}{{timeCount}}s...</div>
                </Spin>
                <div>{{ $t('chat.isTransfer') }}{{ currCustomer }}{{ $t('chat.transferTo') }}{{ currTransfer }}{{ $t('closedBracket') }} ？</div>
                <div slot="footer">
                    <Button  @click="cancelTransfer">{{$t('chat.cancelBtn')}}</Button>
                    <Button type="primary" @click="transferSure" class="websitechat-transfervisitors">
                        {{$t('chat.sureBtn')}}
                    </Button>
                </div>
            </Modal>
        </template>
    </div>
</template>

<script>
    import utils from '../../../utils';
    import util from '../../../libs/util';
    import config from '../../../configs';
    // import Transfer from '../../main-components/Modal.vue';
    import { mapState, mapActions } from 'vuex';

    export default {
        name: 'chatList',
        components: {
            // Transfer
        },
        props: {
            source: {
                type: String
            }
        },
        data() {
            return {
                showModal: false,
                isShowHasChat: false,
                isShowHasNoChat: false,
                isShowHasOrNoChatTip: -1, // 初始状态：-1，仅显示聊过天：1，仅显示未聊过天：0
                blackAccount: '',
                blackVisitorId: '',
                blackNick: '',
                isAddBlack: false, // 显示拉入黑名单弹框
                visible_unblock: false, // 显示移出黑名单弹框
                isShowChattingList: true,
                isShowOnlineList: true,
                isShowOfflineList: true,
                activeCount: '',
                timeCount: '',
                timer: null,
                noticeLoading: false,
                disabled: false,
                modal1: false,
                delSessionId: null,
                stopBubble: false,
                noticeIcon: config.noticeIcon,
                myPhoneIcon: config.myPhoneIcon,
                transferList: [],
                /**
                 * @Description: 取消重复请求转接客服列表, 以及做转接客服列表的 loading 用
                 * @author 汤一飞
                 * @date 2020/5/21
                */
                cancelFunc_getServiceList: null,
                currTransfer: '',
                currTransferAccid: '',
                currCustomer: '',
                currCustomerAccid: '',
                currCustomerVisitorId: ''
            };
        },
        filters: {
            filterSign(value) {
                if (value && value.length > 9) {
                    return `${value.substring(0, 9)}...`;
                } else {
                    return value;
                }
            }
        },
        watch: {
            /**
             * @Description: 有可能 chattingList 等左侧列表调用 getVisitorAvatar 获取头像的时间, 比收到轨迹自定义消息更早, 导致头像更新不及时
             * 现在加上对 personTrackList 的监听, 确保一收到轨迹自定义消息后头像就正确变更
             * @author 汤一飞
             * @date 2020/5/26
            */
            personTrackList: {
                handler(val) {
                    if (val) {
                        [this.chattingList, this.onlineList, this.offlineList].forEach(list => {
                            if (list && Object.keys(list).length) {
                                Object.keys(list).forEach(key => {
                                    const temp = list[key];
                                    temp.avatar = this.getVisitorAvatar(key);
                                    // 如果检查到当前对话, 更新当前会话头像
                                    if (this.currSessionId === temp.account) {
                                        this.$store.commit('updateCurrAvatar', temp.avatar);
                                    }
                                });
                            }
                        });
                    }
                },
                deep: true
            },
            /**
             * @Description: 将 isShowAddBlackModal 改为"屏蔽/解除屏蔽"弹窗 操作完成/取消操作 后关闭弹框的控制器
             * @author 汤一飞
             * @date 2020/5/26
            */
            isShowAddBlackModal: {
                handler(val) {
                    if (!val) {
                        // 关闭弹框
                        this.isAddBlack = false;
                        this.visible_unblock = false;
                        // 清除数据
                        this.blackAccount = '';
                        this.blackVisitorId = '';
                        this.blackNick = '';
                    }
                }
            },
            refreshCurrSession: {
                handler(val) {
                    // 检查是否在当前聊天页面, 在则要刷新
                    if (this.currSessionId) {
                        let currTarget = null;
                        [this.chattingList, this.onlineList, this.offlineList].some(listObj => Object.values(listObj).some(item => {
                            if (item.account === this.currSessionId) {
                                currTarget = item;
                                return true;
                            }
                        }));
                        this.enterChat(currTarget);
                    }
                }
            },
            // 在聊天框处显示无聊天的空白页面时, 清除 activeCount
            chatView: {
                handler(val) {
                    if (val) {
                        this.activeCount = '';
                    }
                }
            }
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                isAddToBlackSuccess: 'isAddToBlackSuccess',
                notChattingWithUnreadCollect: 'notChattingWithUnreadCollect',
                visitorInputStatus: 'visitorInputStatus',
                inputIngVisitorId: 'inputIngVisitorId',
                AccId: 'AccId',
                personTrackList: 'personTrackList',
                currSessionId: 'currSessionId',
                isShowAddBlackModal: 'isShowAddBlackModal',
                refreshCurrSession: 'refreshCurrSession',
                msgs: 'msgs',
                // 是否在聊天框处显示无聊天的空白页面, true = 是
                chatView: 'chatView'
            }),
            classObject() {
                return this.source === 'SplitScreen' ? 'splitScreen' : 'full-Screen';
            },
            bgColor() {
                return this.source === 'SplitScreen' ? '#ffffff' : '#FAFCFF';
            },
            // tips() {
            //     return this.$store.state.ChatWithOtherTip;
            // },
            transferComfir() {
                if (!this.$store.state.transferComfir) {
                    clearInterval(this.timer);
                    this.timer = null;
                    this.noticeLoading = false;
                }
                return this.$store.state.transferComfir;
            },
            sysMsgUnread() {
                const temp = this.$store.state.sysMsgUnread;
                const sysMsgUnread = temp.addFriend || 0;
                const customSysMsgUnread = this.$store.state.customSysMsgUnread;
                return sysMsgUnread + customSysMsgUnread;
            },
            userInfos() {
                return this.$store.state.userInfos;
            },
            myInfo() {
                return this.$store.state.myInfo;
            },
            myPhoneId() {
                return `${this.$store.state.userUID}`;
            },
            sessionlist() {
                console.log(this.$store.state.sessionlist);
                const sessionlist = this.$store.state.sessionlist.filter(item => {
                    item.name = '';
                    item.avatar = '';
                    if (item.scene === 'p2p') {
                        let userInfo = null;
                        if (item.to !== this.myPhoneId) {
                            userInfo = this.userInfos[item.to];
                        } else {
                            return false;
                        }
                        if (userInfo) {
                            item.name = utils.getFriendAlias(userInfo);
                            item.avatar = userInfo.avatar;
                        }
                    }
                    const lastMsg = item.lastMsg || {};
                    if (lastMsg.type === 'text') {
                        item.lastMsgShow = lastMsg.text || '';
                    } else if (lastMsg.type === 'custom') {
                        item.lastMsgShow = utils.parseCustomMsg(lastMsg);
                    } else if (utils.mapMsgType(lastMsg)) {
                        item.lastMsgShow = `[${utils.mapMsgType(lastMsg)}]`;
                    } else {
                        item.lastMsgShow = '';
                    }
                    if (item.updateTime) {
                        item.updateTimeShow = utils.formatDate(item.updateTime, true);
                    }
                    return item;
                });
                return sessionlist;
            },
            // 正在聊天的列表
            chattingList() {
                const list = this.$store.state.chattingList;
                if (list) {
                    // 数据处理
                    Object.entries(list).forEach(([key, value]) => {
                        // 获取头像
                        value.avatar = this.getVisitorAvatar(key);

                        // 获取最后一条消息
                        let text = value.text;
                        // 从 msgs 中获取最后一条消息, 与 list 中最后一条消息作对比, 更新真正的最后一条到 list
                        const msgs = this.msgs[`p2p-${key}`];
                        if (msgs) {
                            const lastIndex = msgs.map(item => ['text', 'image', 'file'].includes(item.type)).lastIndexOf(true);
                            if (lastIndex !== -1) {
                                const lastMsg = msgs[lastIndex];
                                if (lastMsg.time > value.time || !value.time) {
                                    text = this.getLastMsg(lastMsg);
                                }
                            }
                        }
                        value.text = text;
                    });
                }

                return list;
            },
            chattingLength() {
                const list = this.$store.state.chattingList;
                if (list) {
                    return Object.keys(list).length;
                }
                return 0;
            },
            // 在线列表
            onlineList() {
                const list = this.$store.state.onlineList;
                if (list) {
                    // 数据处理
                    Object.entries(list).forEach(([key, value]) => {
                        // 获取头像
                        console.log('获取头像3', key)
                        value.avatar = this.getVisitorAvatar(key);

                        // 获取最后一条消息
                        let text = value.text;
                        // 从 msgs 中获取最后一条消息, 与 list 中最后一条消息作对比, 更新真正的最后一条到 list
                        const msgs = this.msgs[`p2p-${key}`];
                        if (msgs) {
                            const lastIndex = msgs.map(item => ['text', 'image', 'file'].includes(item.type)).lastIndexOf(true);
                            if (lastIndex !== -1) {
                                const lastMsg = msgs[lastIndex];
                                if (lastMsg.time > value.time || !value.time) {
                                    text = this.getLastMsg(lastMsg);
                                }
                            }
                        }
                        value.text = text;
                    });
                }
                return list;
            },
            onlineLength() {
                const list = this.$store.state.onlineList;
                if (list) {
                    return Object.keys(list).length;
                }
                return 0;
            },
            // 离线列表
            offlineList() {
                const list = this.$store.state.offlineList;
                if (list) {
                    // 数据处理
                    Object.entries(list).forEach(([key, value]) => {
                        // 获取头像
                        value.avatar = this.getVisitorAvatar(key);

                        // 获取最后一条消息
                        let text = value.text;
                        // 从 msgs 中获取最后一条消息, 与 list 中最后一条消息作对比, 更新真正的最后一条到 list
                        const msgs = this.msgs[`p2p-${key}`];
                        if (msgs) {
                            const lastIndex = msgs.map(item => ['text', 'image', 'file'].includes(item.type)).lastIndexOf(true);
                            if (lastIndex !== -1) {
                                const lastMsg = msgs[lastIndex];
                                if (lastMsg.time > value.time || !value.time) {
                                    text = this.getLastMsg(lastMsg);
                                }
                            }
                        }
                        value.text = text;
                    });
                }

                return list;
            },
            offlineLength() {
                const list = this.$store.state.offlineList;
                if (list) {
                    return Object.keys(list).length;
                }
                return 0;
            }
        },
        methods: {
            ...mapActions([
                'getVisitorReception' // 获取访客最近接待客服是否在线, 当前是否正在聊天
            ]),
            isShowThisItemBaseOnUnread(unread, account) {
                if (this.source === 'SplitScreen') {
                    if (unread > 0 || this.notChattingWithUnreadCollect.indexOf(account) > -1) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            },
            handleSearch() {},
            // 添加黑名单提示
            addBlackListTip(item) {
                this.blackAccount = item.account;
                this.blackVisitorId = item.visitorId;
                this.blackNick = item.nick;
                this.$store.commit('isShowBlackModal', true);
                this.isAddBlack = true;
            },
            // 加入黑名单
            addBlackList() {
                console.log('addBlackList', this.blackAccount);
                this.$store.dispatch('updateBlack', {
                    account: this.blackAccount,
                    nick: this.blackNick,
                    isBlack: true
                });
                /**
                 * @Date: 2020-04-27 21:20:49
                 * @LastEditors: niumkiki
                 * @description: 屏蔽访客后去掉访客正在输入中
                 * @param :
                 * @return:
                 */
                this.$store.commit('setVisitorInputContent', {
                    visitorId: this.blackVisitorId,
                    inputContent: ''
                });
            },
            cancelAddBlackList() {
                this.$store.commit('isShowBlackModal', false);
            },
            // 移出黑名单提示
            removeBlackListTip(item) {
                this.blackAccount = item.account;
                this.blackNick = item.nick;
                this.$store.commit('isShowBlackModal', true);
                this.visible_unblock = true;
            },
            // 取消移出黑名单
            cancel_unblock() {
                this.$store.commit('isShowBlackModal', false);
            },
            // 移出黑名单
            removeBlackList() {
                this.$store.dispatch('updateBlack', {
                    account: this.blackAccount,
                    nick: this.blackNick,
                    isBlack: false
                });
                this.cancel_unblock();
            },
            // 进入"切换聊天"流程之前先做校验
            beforeEnterChat(currTarget) {
                const account = currTarget.account;

                // 如果当前会话已是选中状态，则返回
                if (this.activeCount === account) {
                    return;
                }
                // 否则, 判断是否有文件未发送
                if (this.source === 'SplitScreen') {
                    this.enterChat(currTarget);
                } else {
                    this.$emit('toggleChatConfirm', currTarget);
                }
            },
            // 点击某个会话时，请求是否正在聊天，以及初始化给访客会话的相关信息
            async enterChat(currTarget) {
                const account = currTarget.account;
                // 判断当前 visitorId 是否可以或正在被当前客服接待, 是则可以各种操作访客数据或发消息
                const canChat = await this.getVisitorReception(currTarget.visitorId);
                if (!canChat) {
                    return;
                }
                // 否则把此会话设置为当前会话
                this.activeCount = account;
                // 关闭右侧详情页
                this.$store.state.isShowTinyDetail = false;

                if (this.source === 'SplitScreen') {
                    // 如果是分屏
                    // 显示聊天界面
                    // this.$emit('switchInterface', 'splitChatFrame');
                    this.$store.commit('updateCurrInterface', 'splitChatFrame');
                    if (this.notChattingWithUnreadCollect.indexOf(account) === -1) {
                        this.$store.commit('setNotChattingWithUnreadCollect', this.notChattingWithUnreadCollect.concat([account]));
                    }
                } else {
                    // 如果是聊天框

                    // util.ajaxInternational({
                    //     url: '/visitor/isVisitorOnChat',
                    //     method: 'post',
                    //     data: {
                    //         visitorServerAccId: Cookies.get('accId'),
                    //         visitorId: currTarget.visitorId
                    //     }
                    // }).then(response => {
                    //     if (response.data.code == 2) {
                    //         this.$store.state.ChatWithOtherTip = response.data.message;
                    //         this.modal1 = true;
                    //         this.$store.commit('updateChatWithOtherList', {
                    //             account: account,
                    //             status: true
                    //         });
                    //         console.log('setDisableChat');
                    //         // msg-send输入框禁止输入
                    //         this.$store.commit('setDisableChat', true);
                    //     } else {
                    //         this.$store.commit('setDisableChat', false);
                    //     }
                    // });
                }

                //           document.getElementById(currTarget.account).style.display = 'none'

                this.$store.commit('updateChatViewStatus', false);
                this.$store.commit('sendCustomSysMsg', account);

                this.$store.commit('updateCurrTarget', currTarget);
                this.$store.dispatch('setCurrSession', account);
                this.$store.commit('updateCurrTrackList', account);
                //                this.getVisitorChatInfo(currTarget)
                this.getDialogById(currTarget);
                //                this.getVisitorTypeByVisitorId(currTarget.visitorId)
                this.getInfoById(currTarget.visitorId);
                //                if(!this.$store.state.currPersonTrackList){
                //                    this.getTraceById(currTarget.visitorId)
                //                }
                /**
                 * @Date: 2020-04-30 17:07:11
                 * @LastEditors: niumkiki
                 * @description:
                 *  原来的逻辑如果录入的话直接弹出线索或询盘详情页
                 *  现在改成：点击图标时再弹出，所以不在这个方法里边再去调获取询盘or线索id的接口了
                 * @param :
                 * @return:
                 */
                // this.getCompanyIdByVisitorId(currTarget.visitorId);
                // this.getInquiryIdByVisitorId(currTarget.visitorId);
                if (currTarget.visitorId === this.inputIngVisitorId) {
                    this.$store.commit('UpdateVisitorInputStatus', true);
                } else if (currTarget.visitorId !== this.inputIngVisitorId) {
                    this.$store.commit('UpdateVisitorInputStatus', false);
                }
            },
            /* 根据访客id获得企业或线索id，如果已经录入crm则显示crm中的访客详情 */
            // getCompanyIdByVisitorId(visitorId) {
            //     util.ajax({
            //         url: '/crm/entityRelation/getCompanyIdByVisitorId',
            //         method: 'post',
            //         data: {
            //             orgId: this.enterpriseId,
            //             visitorId: visitorId
            //         }
            //     }).then(ret => {
            //         if (ret.data.code === '1') {
            //             if (ret.data.data.type === 'clueType') {
            //                 this.$store.state.currClueId = ret.data.data.clueId;
            //             } else {
            //                 this.$store.state.currCompanyId = ret.data.data.companyId;
            //                 /* this.$store.state.isShowTinyDetail = true; */
            //             }
            //             this.$store.state.isShowTinyDetail = true;
            //             this.$store.state.currVisitorType = ret.data.data.type;
            //         }
            //     });
            // },
            /* 根据访客id获得询盘id */
            getInquiryIdByVisitorId(visitorId) {
                util.ajax({
                    url: '/crm/inquiry/getInquiryIdByVisitorId',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        visitorId: visitorId
                    }
                }).then(ret => {
                    if (ret.data.code === '1') {
                        if (ret.data.data.type === 1) {
                            this.$store.state.currInquiryId = ret.data.data.id[0];
                            this.$store.state.currVisitorType = 'crmType';
                            this.$store.state.isShowTinyDetail = true;
                        } else if (ret.data.data.type === 2) {
                            this.$store.state.currClueId = ret.data.data.id[0];
                            this.$store.state.currVisitorType = 'clueType';
                            this.$store.state.isShowTinyDetail = true;
                        }
                    }
                });
            },
            getTraceById(visitorId) {
                util.ajaxInternational({
                    url: '/visitor-chat/server/visitorTrace',
                    method: 'post',
                    data: {
                        enterpriseId: this.$store.state.enterpriseId,
                        visitorId: visitorId
                    }
                }).then(response => {
                    if (response.data.length > 0) {
                        this.$store.state.currSign = response.data.remark;
                        this.$store.commit('updateVisitorInfo', response.data);
                    }
                });
            },
            getInfoById(visitorId) {
                this.$store.commit('updateVisitorInfo', {});
                util.ajaxInternationalJson({
                    url: '/piwikRead/newTenant/visitorInfo/getVisitorInfo',
                    method: 'GET',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        visitorId
                    }
                }).then(res => {
                    if (res.data.code === '1' && res.data.data) {
                        this.$store.state.currSign = res.data.data.remark;
                        this.$store.commit('updateVisitorInfo', res.data.data);
                        if (localStorage.getItem('openSlideBarForWA')) {
                            this.$store.state.isShowTinyDetail = true;
                        } else {
                            this.$store.state.isShowTinyDetail = false;
                        }
                    }
                });
            },
            // 获取聊天信息
            getDialogById({ visitorId, account }) {
                util.ajaxInternational({
                    url: '/visitor-chat/server/lastedChatMessageByVisitorId',
                    method: 'post',
                    data: {
                        visitorId: visitorId,
                        visitorAccId: account,
                        limit: 100
                    }
                }).then(response => {
                    if (response.data) {
                        const msgs = response.data;
                        this.$store.state.currHistorySessionMsgs = [];
                        const arr = [];
                        msgs.forEach(msg => {
                            const timeStamp = (new Date(msg.msgTimestamp)).getTime();
                            const obj = {
                                flow: msg.flow,
                                fromNick: msg.fromNick,
                                toNick: msg.toNick,
                                fromAccount: msg.fromAccount,
                                toAccount: msg.toAccount,
                                idClient: msg.idClient,
                                type: msg.msgType,
                                time: timeStamp,
                                status: 'success',
                                text: '',
                                file: {
                                    url: '',
                                    name: ''
                                }
                            };
                            if (msg.msgType === 'text') {
                                obj.text = msg.body;
                            } else {
                                obj.file.url = msg.attach;
                                obj.file.name = msg.body;
                            }
                            arr.push(obj);
                        });
                        this.$store.state.currHistorySessionMsgs = arr;
                        this.$store.commit('joinMsg', {
                            sessionId: `p2p-${account}`,
                            msgs: arr
                        });
                    }
                });
            },
            deleteSession() {
                if (this.delSessionId !== null) {
                    this.$store.dispatch('deleteSession', this.delSessionId);
                }
            },
            getVisitorAvatar(account) {
                let info = this.personTrackList[account];
                let s;
                if (info && info.content) {
                    // console.log(userTrackinfo.content)
                    info = JSON.parse(info.content);
                    let f = '';
                    if (info.xUserInfo.baseinfo) {
                        f = info.xUserInfo.baseinfo.visitSource;
                    }
                    // 匹配来源
                    s = f.match(/\.google\./) ? '#custom-chrome'
                        : f.match(/\.youtube\./) ? '#custom-Youtube'
                            : f.match(/\.bing\./) ? '#custom-Bing'
                                : f.match(/\.yahoo\./) ? '#custom-yahoo'
                                    : f.match(/\.yandex\./) ? '#custom-yandex'
                                        : f.match(/\.baidu\./) ? '#custom-baidu'
                                            : f.match(/\.sogou\./) ? '#custom-sogou'
                                                : f.match(/\.facebook\./) ? '#custom-Facebook'
                                                    : f.match(/\.linkedin\./) ? '#custom-linkedin'
                                                        : f.match(/\.twitter\./) ? '#custom-twitter' : '#custom-visitor-avatar';
                } else {
                    s = '#custom-visitor-avatar';
                }
                return s;
            },
            getAllEnterpriseService() {
                this.transferList = [];
                const vm = this;
                // 取消之前的数据请求
                if (typeof this.cancelFunc_getServiceList === 'function') {
                    this.cancelFunc_getServiceList();
                }
                util.ajaxInternational({
                    url: '/visitor-chat/server/getAllEnterpriseService',
                    method: 'post',
                    data: {
                        enterpriseId: this.enterpriseId
                    },
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        vm.cancelFunc_getServiceList = c;
                    })
                }).then(response => {
                    this.cancelFunc_getServiceList = null;
                    if (response.data === '') {
                        this.$Message.error(this.$t('main.error_getServiceList'));
                        return;
                    }
                    const list = response.data;
                    this.$store.commit('setServiceList', response.data);
                    this.transferList = list.filter(item => this.AccId !== item.acctid && item.mobileOnline !== '1');
                }).catch(error => {
                    this.cancelFunc_getServiceList = null;
                    // 如果当前不是通过 cancelToken 取消, 则报错
                    if (!util.axios.isCancel(error)) {
                        this.$Message.error(this.$t('main.error_getServiceList'));
                    }
                });
            },
            comfirTransfer(data1, data) {
                console.log('转接客服---------------', data1, data);
                // 游客昵称、账号、访客ID，转给的客服名称、accId
                this.currCustomer = data1.nick;
                this.currCustomerAccid = data1.account;
                this.currCustomerVisitorId = data1.visitorId;
                this.currTransfer = data.serverName;
                this.currTransferAccid = data.acctid;

                // 显示转接提示框
                this.$store.state.transferComfir = true;
                this.showModal = true;
            },
            // 开始转接
            async transferSure() {
                const visitorId = this.currCustomerVisitorId;
                // 判断当前 visitorId 是否可以或正在被当前客服接待, 是则可以各种操作访客数据或发消息
                const ret = await this.getVisitorReception(visitorId);
                if (ret) {
                    this.noticeLoading = true;
                    //                this.$store.state.transferComfir = false
                    //                this.$Message.loading({
                    //                    content: '转接中，等待对方接受...',
                    //                    duration: 15,
                    //                    closable: true
                    //                });
                    // 倒计时
                    this.setTime();
                    // 转接请求，发起请求的accId、接受转接的accId、游客accId、游客访客ID

                    util.ajaxInternational({
                        url: '/visitor/callTransfer',
                        method: 'post',
                        data: {
                            callTransferServerAccId: this.AccId,
                            receivedTransferServerAccId: this.currTransferAccid,
                            visitorAccid: this.currCustomerAccid,
                            visitorId
                        }
                    }).then(response => {
                        this.$store.commit('removeMyVisitorIds', [visitorId]);
                    }).catch(error => {
                        this.$store.commit('removeMyVisitorIds', [visitorId]);
                    });
                }
            },
            setTime() {
                const TIME_COUNT = 15;
                if (!this.timer) {
                    this.timeCount = TIME_COUNT;
                    this.timer = setInterval(() => {
                        if (this.timeCount > 0 && this.timeCount <= TIME_COUNT) {
                            this.timeCount--;
                        } else {
                            this.$store.state.transferComfir = false;
                            this.noticeLoading = false;
                            clearInterval(this.timer);
                            this.timer = null;
                            this.$Message.error(this.$t('chat.TransferFailTip'));
                        }
                    }, 1000);
                }
            },
            // 取消转接
            cancelTransfer() {
                this.$store.state.transferComfir = false;
            },
            // ok1() {
            //     this.modal1 = false;
            // },
            // 如果存有该访客正在和别人聊天的state且为true
            // async isChatWithOther() {
            //     // 如果存有该访客正在和别人聊天的state且为true
            //     if (this.$store.state.isChatWithOther[this.$store.state.currSessionId]) {
            //         const warnTip = this.$store.state.ChatWithOtherTip;
            //         this.$Message.warning(warnTip);
            //         //                    this.isEdit=false;
            //         console.log('isChatWithOther false');
            //         return false;
            //     } else if (this.$store.state.isChatWithOther[this.$store.state.currSessionId] === undefined) {
            //         //                    this.remarkLoading=true
            //         /* 访客是否正在和别人聊天 */
            //         return new Promise((resolve, reject) => {
            //             util.ajaxInternational({
            //                 url: '/visitor/isVisitorOnChat',
            //                 method: 'post',
            //                 data: {
            //                     visitorServerAccId: Cookies.get('accId'),
            //                     visitorId: this.$store.state.currVisitorId
            //                 }
            //             }).then(response => {
            //                 if (response.data.code == 2) {
            //                     this.$store.state.ChatWithOtherTip = response.data.message;
            //                     this.$Message.warning(response.data.message);
            //                     this.$store.commit('updateChatWithOtherList', {
            //                         account: this.$store.state.currSessionId,
            //                         status: true
            //                     });
            //                     resolve(false);
            //                 } else {
            //                     resolve(true);
            //                 }
            //             });
            //         });
            //     } else {
            //         console.log('isChatWithOther true');
            //         return true;
            //     }
            // }
            // 获取最后一条消息内容
            getLastMsg(msg) {
                switch (msg.type) {
                    case 'text':
                        return msg.text;
                    case 'image':
                        return this.$t('whatsapp_manage.imageType');
                    case 'file':
                        return this.$t('whatsapp_manage.fileType');
                    default:
                        return '';
                }
            }
        },
        beforeDestroy() {
            if (this.timer) {
                clearInterval(this.timer);
            }
        }
    };
</script>

<style lang="less">
    .avatar-large {
        width: 46px;
        height: 46px;
        border-radius: 23px;
    }

    .transfer-modal > .ivu-modal-mask {
        z-index: 999999 !important;
    }

    .transfer-modal > .ivu-modal-wrap {
        z-index: 999999 !important;;
    }

    .popper-title-14px {
        .el-popover__title {
            font-size: 14px;
        }
    }
</style>

<style scoped type="text/css" lang="less">
    .list-remark {
        max-width: 75px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
    }

    .session-list /deep/ .ivu-badge-count {
        top: -6px;
        right: 4px;
    }

    .chat-switch-icon /deep/ .ivu-poptip-rel {
        display: block;
    }

    .chat-switch-icon /deep/ .ivu-poptip-arrow {
        display: none;
    }

    .center-right {
        float: right;
    }

    .chat-switch-icon {
        .ivu-poptip {
            display: block;
        }
    }

    .splitScreen {
        .chat-list-search, .chat-list-header {
            display: none;
        }

        .u-list-item:hover {
            background-color: #EEF1F5;;
            /*box-shadow: 0 1px 8px 0 #EEF1F5;*/
        }
    }

    .chat-avatar {
        float: left;
        width: 48px;
        line-height: 48px;
    }

    .chat-content {
        margin-left: 56px;
    }

    .chat-list-item-header {
        height: 26px;
        line-height: 26px;
        position: relative;
    }

    .chat-list-item-content {
        height: 20px;
        position: relative;
        line-height: 20px;
        margin-top: 3px;
    }

    .dialog-content {
        /* 超出一行显示省略号 */
        overflow: hidden; /*超出部分隐藏*/
        white-space: nowrap; /*不换行*/
        text-overflow: ellipsis;
        padding-right: 20px;
    }

    .chat-text {
        color: rgba(0, 0, 0, 0.4);
        font-size: 12px;
    }

    .chat-filter {
        width: 25px;
        text-align: center;
        display: inline-block;
    }

    .chat-offline-filter {
        display: none;
    }

    .chat-list-item-time {
        position: absolute;
        right: 0;
        color: rgba(0, 0, 0, 0.4);
        font-size: 12px;
    }

    .chat-offline-filter, .chat-length {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.8);
        font-weight: normal;
        float: right;
        margin-right: 20px;
    }

    .chat-length {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.4);
        font-weight: normal;
        float: right;
        margin-right: 20px;
    }

    .black-flag {
        position: absolute;
        right: 12px;
        z-index: 10;
    }

    .chat-arrow {
        display: inline-block;
        width: 10px;
    }

    .transfer-list {
        text-align: left;
        line-height: 25px;
    }

    .activeList {
        background-color: #EEF1F5;
        /*box-shadow: 0 1px 8px 0 #EEF1F5;*/

        .chat-operate-icon {
            display: inline-block;
        }
    }

    .full-Screen {
        .u-list-item:hover {
            background-color: #EEF1F5;
            /*box-shadow: 0 1px 8px 0 #EEF1F5;*/
        }
    }

    .u-list-item:hover .swap-icon, .u-list-item:hover .black-icon, .u-list-item:hover .black-flag, .u-list-item:hover .chat-operate-icon {
        display: inline-block;
    }

    .swap-icon, .black-icon, .black-flag, .chat-operate-icon {
        /*float: right;*/
        display: none;
        position: absolute;
        right: 0;
        top: 0;
    }

    .session-list {
        overflow-y: auto;
        height: 100%;
    }

    .chat-list-header {
        cursor: pointer;
        padding-left: 20px;
        line-height: 44px;
        font-size: 15px;
        font-weight: bold;
        color: #414141;

        .ivu-icon {
            vertical-align: unset;
        }
    }

    .u-list-item {
        height: 68px;
        position: relative;
        padding: 9px 20px;
        cursor: pointer;
    }

    .list-item-nick {
        margin-right: 8px;
        color: rgba(0, 0, 0, 0.8);
        vertical-align: top;
    }

    .u-unread {
        background-color: #59d8d6;
        color: #ffffff;
        width: 20px;
        height: 20px;
        display: inline-block;
        border-radius: 10px;
        font-size: 10px;
        line-height: 20px;
        text-align: center;
    }

    .chat-list-search {
        padding: 30px 20px 20px;
    }

    .chat-list-search /deep/ .ivu-input {
        border: 0;
        box-shadow: 1px 1px 8px 0 #EEF1F5;
    }
</style>
