<template>
    <div v-loading="isLoading || loading_group" class="whatsapp-container twemoji-convert">
        <!-- 头部 -->
        <div class="whatsapp-header" v-if="!messageAberrant">
            <div style="float:left; max-width: 40%; overflow: hidden;white-space: nowrap;text-overflow: ellipsis">
                <Tooltip placement="top" :content="QwAppName" v-if="QwAppName && QwAppName.length > 30">
                    <span>{{ QwAppName.slice(0, 30) + '...' }}</span>
                </Tooltip>
                <span v-else>{{ QwAppName }}</span>
            </div>
            <div style="float:right;">
                <!-- <Icon size="15" @click="refreshBtn" custom="custom-icon_update" v-if="!isGroup"
                    :class="{ 'refresh-btn-loading': refreshStatus }" style="cursor:pointer;" />
                <span class="refresh-btn-time" v-if="!isGroup">最近同步时间：{{ refreshTime }}</span> -->
                <i>
                    <Icon size="15" @click="closeWhatsApp" custom="custom custom-modal-close" style="cursor:pointer;" />
                </i>
            </div>
        </div>

        <!-- 滚动区 -->
        <div @scroll.capture="handleFrameScroll" style="height:450px;overflow-y:auto;">
            <ul>
                <!-- 滚动加载 -->
                <Scroll :on-reach-top="loadMore_top"
                    :on-reach-bottom="msgListType === 'quote' ? loadMore_bottom : undefined" :distance-to-edge="10"
                    :loading-text="$t('crm.Html.loading')" :height="450" ref="msgScroll">
                    <qwMsgItem v-for="msg in $options.filters.addMsgTimeTag(msgList)" :key="msg.msgId"
                        :timeLineStatus="timeLineStatus" :rawMsg="msg" :isGroup="isGroup"
                        :whatsAppAccountInfo="{ 'whatsappAccount': userBindWaAccount || undefined }" :groupInfo="groupInfo"
                        :nick="QwAppName" fromFlag="timeline" @scrollToQuoteMsg="handleScrollToQuoteMsg"></qwMsgItem>
                </Scroll>
            </ul>
        </div>

        <!-- 底部 -->
        <div style="position: relative;">
            <!-- 滚动到最底部 -->
            <div v-show="visible_toBottomBtn" @click="scrollToBottom" class="scrollToBottom-btn">
                <svg class="svg-icon custom" aria-hidden="true">
                    <use xlink:href="#custom-scrollToBottom"></use>
                </svg>
            </div>
        </div>
    </div>
</template>
  
<script>
    import util from '@/libs/util';
    import { getLastPushTime } from '@/api/whatsapp';
    import { mapState } from 'vuex';
    import qwMsgItem from '@/views/main-components/timeline/Micronent/qwMsgItem.vue';
    import _ from 'lodash';

    export default {
        name: 'qwChatListView',
        props: {
            // 是否定位消息的位置,接收的是一个字符串(msgId)
            whetherToLocateTheMessage: {
                type: String,
                // default: ''
                default: 'send_1683620192535821'
            },
            QwAppName: {
                type: String,
                default: '没有传递名字参数'
            },
            messageAberrant: {
                type: Boolean,
                default: false
            },
            // chatQwAccount: {
            //     type: String,
            //     default: ''
            // },
            // userBindQwAccount: {
            //     type: String,
            //     default: ''
            // },
            currentLineItemId: {
                type: String,
                default: ''
            },
            chatType: {
                type: String,
                default: '0'
            },
            chatObj: {
                type: Object,
                default: () => {
                    // 1688850056777058  161615814361003
                    // 张雅洁1688855489249215
                    return { robotWxid: 'userBindQwAccount', fromQwAccount: 'fromQwAccount', toQwAccount: 'toQwAccount' }
                }
            }
        },
        components: {
            qwMsgItem
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                // 当前路由 name 数组
                activeRouteNames: state => state.app.activeRouteNames,
                userId: 'userId'
            }),
            msgList() {
                return this.msgListType === 'quote' ? this.waQuoteMsgList : this.whatsAppMsgList;
            },
            // 时间轴查看聊天记录 当前查看的消息记录是否有我发的消息
            timeLineStatus() {
                if (this.activeRouteNames.length > 1 && this.activeRouteNames[1] === 'whatsapp_management') {
                    return true;
                }
                return this.activeRouteNames[0] !== 'whatsapp_manage_home';
            },
            // 是否是群组对话
            isGroup() {
                return this.chatType === '1';
            },
            // 与"我"聊天的 wa 账号
            chatQWAccount() {
                // 群组
                if (this.isGroup) {
                    return this.chatObj.toQwAccount;
                }

                // 单聊
                return this.chatObj.fromMe === 0 ? this.chatObj.fromQwAccount : this.chatObj.toQwAccount;
            }
        },
        data() {
            return {
                // 界面loading
                isLoading: false,
                page: 1,
                size: 10, // 每页请求行数
                // 取消上一次正常消息请求
                cancelFunc: null,
                // 取消上一次引用消息请求
                cancelFunc_quote: null,
                // 正常的 qw 消息数组
                whatsAppMsgList: [],
                // 引用消息前后的 wa 消息数组
                waQuoteMsgList: [],
                // 页面消息显示类型, normal 显示正常消息, quote 显示引用消息数组
                msgListType: 'normal',
                // 是否显示"滚动到最底部"按钮
                visible_toBottomBtn: false,

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
                refreshStatus: true,
                refreshTime: '--'
            };
        },
        mounted() {
            // console.log(this.chatObj,'chatObj');
        },
        methods: {
            /** 关闭弹窗 */
            closeWhatsApp() {
                document.body.click();
            },
            // 请求聊天消息列表
            getWhatsAppMsg(resolve) {
                if (this.chatObj.toQwAccount) {
                    // 如果当前不是通过 scroll 加载列表数据(没有 scroll 组件自带的 loading), 则显示 loading
                    if (!resolve) {
                        this.isLoading = true;
                    }

                    const vm = this;
                    /* 取消上一次请求，避免频繁请求接口时因接口响应速度快慢导致数据错乱 */
                    if (typeof this.cancelFunc === 'function') {
                        this.cancelFunc();
                    }

                    // 发送请求
                    util.ajaxJson({
                        url: '/qiyewx/chat/message/pages',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            userId: this.chatObj.bindUserId,
                            pageNo: `${this.page}`,
                            pageSize: `${this.size}`,
                            concatWxid: this.chatQWAccount,
                            robotWxid: this.chatObj.robotWxid,
                            // chatType: this.chatType
                        },
                        cancelToken: new util.axios.CancelToken(function executor(c) {
                            vm.cancelFunc = c;
                        })
                    }).then(({ data }) => {
                        // 处理返回数据
                        if (data.code === 1) {
                            if (data.data.content.length) {
                                // 有请求到数据, 合并数据到正常消息数组

                                this.mergeMsgList(data.data.content);
                            } else {
                                // 没有请求到数据, 给出"没有更多"提示, 并将 page 退回一页

                                this.$Message.info(this.$t('noticeWindow.noMore'));
                            }
                        }
                        // 隐藏 loading
                        if (resolve) {
                            resolve();
                        } else if (this.whetherToLocateTheMessage) {
                            // 传一个messageId,定位消息接口需要messageId
                            const obj = {
                                msgId: this.whetherToLocateTheMessage
                            };
                            this.refreshStatus = false;

                            this.handleScrollToQuoteMsg(obj);
                            return;
                        } else {
                            // 当处在第一页时，保证看到最新消息
                            if (this.page === 1 && this.msgListType === 'normal' && this.msgList.length) {
                                this.targetMsgLocation(this.msgList[this.msgList.length - 1]);
                            }
                        }
                        this.isLoading = false;
                        // if (this.page === 1) {
                        //     this.refreshTime = new Date().format('yyyy-MM-dd hh:mm:ss');
                        // }
                        this.refreshStatus = false;
                    }).catch(error => {
                        this.isLoading = false;
                        console.log(error);
                    });
                }
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
                // 当前显示的是正常消息, 且是滚动到底部
                if (direction === 'top') {
                    this.page++;
                    return new Promise(resolve => {
                        this.getWhatsAppMsg(resolve);
                    });
                }
            },
            // 处理接口返回的数据(要求正常消息列表和引用消息列表都用这个方法, 方便在两者变动时判断两列表是否可合并)
            mergeMsgList(data, dataType = 'normal') {
                // 传入数据处理

                // 暂存消息数组
                let msgList = [];
                if (dataType === 'quote') {
                    msgList = this.waQuoteMsgList.slice();
                } else {
                    msgList = this.whatsAppMsgList.slice();
                }
                // data.reverse();

                // 合并消息数组和接口数据
                msgList = msgList.concat(data);
                // 定义"正常消息列表和引用消息列表已合并" flag
                let merged = false;
                // 如果两类 msgList 有重合
                if (this.waQuoteMsgList.find(quMsg => this.whatsAppMsgList.find(waMsg => waMsg.msgId === quMsg.msgId))) {
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
                    if (!ids.has(item.msgId)) {
                        ids.add(item.msgId);
                        return true;
                    }
                });
                msgList.forEach(ele => {
                    ele.timeStamp = new Date(ele.createdAt).getTime();
                });
                // 排序
                msgList.sort((a, b) => a.cyIdStr - b.cyIdStr);
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
            },
            // 滚动到指定引用消息处
            handleScrollToQuoteMsg(msg) {
                // 在消息数组中定位引用消息
                const existed_waMsg = this.whatsAppMsgList.find(item => item.msgId === msg.msgId);
                const existed_quoteMsg = this.waQuoteMsgList.find(item => item.msgId === msg.msgId);

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
                        const msgIndex = this.msgList.findIndex(item => item.msgId === msg.msgId);

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
                    // 如果有loading则,取消loading
                    this.isLoading = false;
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
                util.ajaxJson({
                    url: '/qiyewx/chat/message/pages',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.chatObj.bindUserId,
                        pageNo: `${this.page}`,
                        pageSize: `${this.size}`,
                        // chatType: this.chatType,
                        robotWxid: this.chatObj.robotWxid,
                        concatWxid: this.chatQWAccount,
                        isPrePage,
                        basesMsgId: msg.msgId
                    },
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        vm.cancelFunc_quote = c;
                    })
                }).then(({ data }) => {
                    // 请求数据成功, 合并返回消息数据到消息列表
                    if (data.code === 1) {
                        if (Array.isArray(data.data.content) && data.data.content.find(item => item.msgId === msg.msgId)) {
                            // 如果返回数据中包括基准消息, 则正常向下执行(合并数据, 显示)

                            this.mergeMsgList(data.data.content, 'quote');
                        } else {
                            // 获取引用消息超时
                            this.$Message.error(this.$t('whatsapp_manage.error_getQuotedMsgTimeout'));
                        }
                    } else if (data.code === -1) {
                        // 获取引用消息超时
                        this.$Message.error(this.$t('whatsapp_manage.error_getQuotedMsgTimeout'));
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

            handleFrameScroll: _.debounce(function (e) {
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
                const res = await util.ajaxJson({
                    url: '/qiyewx/friend/group/getMemberListInfo',
                    method: 'post',
                    data: {
                        friendWxid: this.chatObj.toQwAccount,
                        robotWxid: this.chatObj.robotWxid,
                        orgId: this.enterpriseId,
                        userId: this.chatObj.bindUserId
                    }
                });

                // 接口返回数据处理
                if (res.data && res.data.code === 1 && res.data.data) {
                    let memberList = res.data.data;

                    // 处理群成员数据
                    // console.log(memberList,'memberList');
                    // 获取"CRM 录入状态"数据, 之后追加到成员数据中
                    const resCrmStatus = await this.getWAAccountCrmStatus(memberList.map(item => item.member_wxid));
                    // console.log(resCrmStatus);
                    memberList = memberList.map(item => {
                        const { nick: name, avatar, member_wxid } = item;
                        return {
                            name,
                            avatar,
                            member_wxid,
                            leadscloudStatus: resCrmStatus[member_wxid] || {}
                        };
                    });

                    // 赋值
                    this.groupInfo = {
                        // account: this.chatWaAccount,
                        // name: subject || '',
                        // avatar: contactWaAvatar || '',
                        // size: chatSize || 0,
                        memberList
                    };
                    // console.log(this.groupInfo);
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
                    // this.$Message.error(this.$t('crm.InqSet.error_params'));
                    console.log('获取群成员列表为空，停止向下查询');
                    return [];
                }

                // 请求接口
                const res = await util.ajaxJson({
                    url: '/crm/visitorRelation/getStatusByTargetIdList',
                    method: 'POST',
                    data: {
                        targetIds: accountList,
                        targetType: 13, // 类型，企微传13
                        orgId: this.enterpriseId
                    }
                });

                // 格式化接口返回, 转换成 { waAccount: leadscloudStatus } 格式
                let result = {};
                if (res.data && res.data.code == 1) {
                    result = res.data.data;
                }

                // 返回结果
                return result;
            },
            // 刷新最近更新时间
            refreshBtn() {
                getLastPushTime({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    userBindWaAccount: this.userBindWaAccount,
                    customerWaAccount: this.chatWaAccount
                }).then((res) => {
                    if (res.code === 1) {
                        this.refreshTime = res.data ? res.data : '--';
                    } else {
                        this.refreshTime = '--';
                    }
                });
            }
        },
        watch: {
            currentLineItemId: {
                handler(val) {
                    console.log('currentLineItemId()------', this.chatObj);
                    if (val) {
                        this.whatsAppMsgList = [];
                        this.waQuoteMsgList = [];
                        this.msgListType = 'normal';
                        this.page = 1;
                        this.getWhatsAppMsg();

                        // return
                        if (this.messageAberrant) {
                            return;
                        }

                        // 是群组消息, 请求群组相关信息
                        if (this.isGroup) {
                            this.getGroupDetail();
                        } else {
                            // this.refreshBtn();
                        }
                    }
                },
                immediate: true
            },
            // 监听显示的消息数组类型, 显示的是引用消息, 则显示"直达底部"按钮
            msgListType: {
                handler(val) {
                    if (val === 'quote') {
                        this.visible_toBottomBtn = true;
                    }
                }
            }
        }
    };
</script>
<style>
.whatsapp-container .msg-more {
    display: none !important;
}

.whatsapp-container .msg-text {
    max-width: 50% !important;
}

.refresh-btn-loading {
    animation: refreshLoading 1.5s infinite linear;
}

@keyframes refreshLoading {
    0% {
        transform: rotate(0deg);
        /*动画起始位置为旋转0度*/
    }

    to {
        transform: rotate(1turn);
        /*动画结束位置为旋转1圈*/
    }
}
</style>
  
<style lang="less" scoped>
.whatsapp-container {
    .whatsapp-header {
        font-size: 16px;
        height: 40px;
        line-height: 30px;
        border-bottom: 1px solid #e5e5e5;

        .refresh-btn-time {
            font-size: 12px;
            margin: 0 8px;
            color: rgba(0, 0, 0, 0.6);
        }
    }

    .scrollToBottom-btn {
        display: inline-block;
        border-radius: 50%;
        position: absolute;
        top: -54px;
        right: 0;
        cursor: pointer;

        svg {
            width: 40px;
            height: 40px;
        }
    }
}
</style>
  