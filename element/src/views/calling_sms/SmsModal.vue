<template>
    <div v-loading="isLoading"
        class="whatsapp-container twemoji-convert">
        <!-- 头部 -->
        <div class="whatsapp-header">
            <div style="float:left; width: calc(100% - 20px); overflow: hidden;white-space: nowrap;text-overflow: ellipsis">
                <!-- <Tooltip placement="top" :content="cinnoxName" v-if="cinnoxName && cinnoxName.length > 30">
                    <span>{{cinnoxName.slice(0, 45) + '...'}}&nbsp;</span><span>{{ chatCinnoxAccount }}</span>
                </Tooltip>
                <span v-else>{{cinnoxName}}&nbsp;<span>{{ chatCinnoxAccount }}</span></span> -->
                <span>{{cinnoxName}}</span>
            </div>
            <div style="float:right;">
            <!-- <Icon
                size="15"
                @click="refreshBtn"
                custom="custom-icon_update"
                :class="{'refresh-btn-loading': refreshStatus}"
                style="cursor:pointer;"
            /> -->
            <!-- <span class="refresh-btn-time">最近同步时间：{{ refreshTime }}</span> -->
            <i>
                <Icon
                size="15"
                @click="closeWhatsApp"
                custom="custom custom-modal-close"
                style="cursor:pointer;"
                />
            </i>
            </div>
        </div>

        <!-- 滚动区 -->
        <div @scroll.capture="handleFrameScroll"
            style="height:450px;overflow-y:auto;">
            <ul>
                <!-- 滚动加载 -->
                <Scroll :on-reach-top="loadMore_top"
                        :on-reach-bottom="msgListType === 'quote' ? loadMore_bottom : undefined"
                        :distance-to-edge="10"
                        :loading-text="$t('crm.Html.loading')"
                        :height="450"
                        ref="msgScroll">
                    <smsMsgItem v-for="msg in $options.filters.addMsgTimeTag(msgList)"
                                    :key="msg.messageId"
                                    :rawMsg="msg"
                                    :whatsAppAccountInfo="{ 'whatsappAccount': bindCinnoxAccount || undefined }"
                                    :nick="cinnoxName"
                                    fromFlag="timeline"
                                    @scrollToQuoteMsg="handleScrollToQuoteMsg"></smsMsgItem>
                </Scroll>
            </ul>
        </div>

        <!-- 底部 -->
        <div style="position: relative;">
            <!-- 滚动到最底部 -->
            <!--  v-show="visible_toBottomBtn" -->
            <div
                @click="scrollToBottom"
                class="scrollToBottom-btn">
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
    import smsMsgItem from './smsMsgItem.vue';
    import _ from 'lodash';

    export default {
        name: 'SmsModal',
        props: {
            // 时间轴传递的userId
            bindCinnoxUserId: {
                type: String,
                default: ''
            },
            // 是否定位消息的位置,接收的是一个字符串(messageId)
            whetherToLocateTheMessage: {
                type: String,
                default: ''
            },
            cinnoxName: {
                type: String,
                default: ''
            },
            chatCinnoxAccount: {
                type: String,
                default: ''
            },
            bindCinnoxAccount: {
                type: String,
                default: ''
            },
            currentLineItemId: {
                type: String,
                default: ''
            },
            chatType: {
                type: String,
                default: ''
            }
        },
        components: {
            smsMsgItem
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId'
            }),
            msgList() {
                return this.msgListType === 'quote' ? this.waQuoteMsgList : this.whatsAppMsgList;
            }
        },
        data() {
            return {
                // 界面loading
                isLoading: false,
                pageNo: 1,
                pageSize: 10, // 每页请求行数

                // 取消上一次正常消息请求
                cancelFunc: null,
                // 取消上一次引用消息请求
                cancelFunc_quote: null,
                // 正常的 wa 消息数组
                whatsAppMsgList: [],
                // 引用消息前后的 wa 消息数组
                waQuoteMsgList: [],
                // 页面消息显示类型, normal 显示正常消息, quote 显示引用消息数组
                msgListType: 'normal',
                // 是否显示"滚动到最底部"按钮
                visible_toBottomBtn: false,

                refreshStatus: true,
                refreshTime: '--'
            };
        },
        methods: {
            /** 关闭弹窗 */
            closeWhatsApp() {
                document.body.click();
            },
            // 请求聊天消息列表
            getWhatsAppMsg(resolve) {
                if (this.chatCinnoxAccount) {
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
                        url: '/cinnox-app/cxChatDetail/queryChatHistoryByPageForTimeline',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            userId: this.bindCinnoxUserId,
                            pageNo: this.pageNo,
                            pageSize: this.pageSize,
                            userBindPhone: this.bindCinnoxAccount,
                            messageType: 1,
                            concatPhone: this.chatCinnoxAccount
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
                                // 没有请求到数据, 给出"没有更多"提示, 并将 pageNo 退回一页

                                this.$Message.info(this.$t('noticeWindow.noMore'));
                            }
                        }
                        this.isLoading = false;
                        this.refreshStatus = false;
                        // 隐藏 loading
                        if (resolve) {
                            resolve();
                        } else if (this.whetherToLocateTheMessage) {
                            // 传一个messageId,定位消息接口需要messageId
                            const obj = {
                                messageId: this.whetherToLocateTheMessage
                            };
                            this.refreshStatus = false;

                            this.handleScrollToQuoteMsg(obj);
                        } else {
                            // 当处在第一页时，保证看到最新消息
                            if (this.pageNo === 1 && this.msgListType === 'normal' && this.msgList.length) {
                                this.targetMsgLocation(this.msgList[this.msgList.length - 1]);
                            }
                        }
                    }).catch(error => {
                        this.isLoading = false;
                        console.log(error);
                    });
                } else {
                    this.$Message.error('cinnox 号码错误');
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
                    this.pageNo++;
                    return new Promise(resolve => {
                        this.getWhatsAppMsg(resolve);
                    });
                }
            },
            // 处理接口返回的数据(要求正常消息列表和引用消息列表都用这个方法, 方便在两者变动时判断两列表是否可合并)
            mergeMsgList(data, dataType = 'normal') {
                // 需要后端加一下 timeStamp 时间戳
                data.forEach(item => {
                    item.timeStamp = new Date(item.createdAt).getTime();
                });

                // 传入数据处理
                // data.forEach(item => {
                //     if (item.extendedJson) {
                //         try {
                //             const tmp = JSON.parse(item.extendedJson);
                //             if (tmp.seconds) {
                //                 item.seconds = tmp.seconds;
                //             }
                //         } catch (err) {
                //             console.error('处理 pageNo 接口返回数据的 extendedJson 错误');
                //         }
                //     }
                // });

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

                    // 计算当前 pageNo (为避免消息遗漏, 此处计算 pageNo 采用 floor)
                    this.pageNo = Math.floor(msgList.length / this.pageSize);
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
                    url: '/cinnox-app/cxChatDetail/queryChatHistoryByPageForTimeline',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.bindCinnoxUserId,
                        userBindPhone: this.bindCinnoxAccount,
                        concatPhone: this.chatCinnoxAccount,
                        pageNo: '1', // 实际上没用了, 但是不加报错, 就用 '1' 吧
                        pageSize: `${this.pageSize}`,
                        messageType: 1,
                        isPrePage,
                        basesMsgId: msg.messageId
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
                            // 获取引用消息超时
                            this.$Message.error(this.$t('callSms.getQuoteMessageTimedOut'));
                        }
                    } else if (data.code === -1) {
                        // 获取引用消息超时
                        this.$Message.error(this.$t('callSms.getQuoteMessageTimedOut'));
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

            handleFrameScroll: _.debounce(function(e) {
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
            // 刷新最近更新时间
            refreshBtn() {
                getLastPushTime({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    bindCinnoxAccount: this.bindCinnoxAccount,
                    customerWaAccount: this.chatCinnoxAccount
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
                    if (val) {
                        this.whatsAppMsgList = [];
                        this.waQuoteMsgList = [];
                        this.msgListType = 'normal';
                        this.pageNo = 1;
                        this.getWhatsAppMsg();

                        // 刷新最近更新时间
                        // this.refreshBtn();
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
    transform: rotate(0deg); /*动画起始位置为旋转0度*/
}
to {
    transform: rotate(1turn); /*动画结束位置为旋转1圈*/
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
