<template>
    <ul id="chat-list" class="m-chat-list p-chat-list" @mouseup="onSelect">
        <li class="u-msg item-time piwik_ChatSplitLoadMore" :class="{loadMore:canLoadMore}" @click="loadMore"
            v-if="canLoadMore">
            {{$t('chat.loadMore')}}
        </li>
        <li class="u-msg item-time" v-else>
            {{$t('chat.noMore')}}
        </li>
        <chat-item v-for="msg in computed_currSessionMsgs"
                   :key="`${msg.idClient}-${msg.type}`"
                   :type="type"
                   :rawMsg="msg"
                   :lastTransMemory.sync="lastTransMemory"
                   :isRobot="isRobot"
                   :userInfos="userInfos"
                   :myInfo="myInfo"
                   @msg-loaded="msgLoaded"></chat-item>
    </ul>
</template>

<script type="text/javascript">
    import ChatItem from './chat-item.vue';
    import { mapState } from 'vuex';
    import { getTranslateMemory, setTranslateMemory } from '@/api/whatsapp.js';


    export default {
        components: {
            ChatItem
        },
        props: {
            isRobot: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            userInfos: {
                type: Object,
                default() {
                    return {};
                }
            },
            myInfo: {
                type: Object,
                default() {
                    return {};
                }
            },
            unreadMsgs: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                type: 'session', // 类型，chatroom, session
                scene: 'p2p',
                isFullImgShow: false,
                msgLoadedTimer: null,
                lastTransMemory: 'zh'
            };
        },
        computed: {
            ...mapState({
                currSessionId: state => state.currSessionId,
                currSessionMsgs: state => state.currSessionMsgs,
                noMoreHistoryMsgs: state => state.noMoreHistoryMsgs,
                currVisitorId: 'currVisitorId',
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId
            }),
            canLoadMore() {
                return this.noMoreHistoryMsgs[this.currSessionId];
            },
            computed_currSessionMsgs() {
                /**
                 * @Description: 对 currSessionMsgs 做 idClient 去重
                 * @author 汤一飞
                 * @date 2020/6/11
                */
                let tempMsgs = this.currSessionMsgs.slice();
                const idClients = new Set();
                tempMsgs = tempMsgs.filter(item => {
                    if (!idClients.has(item.idClient)) {
                        idClients.add(item.idClient);
                        return true;
                    }
                });
                return tempMsgs;
            }
        },
        methods: {
            /** 加载更多 */
            loadMore() {
                this.$store.dispatch('getHistoryMsgs', {
                    scene: this.scene,
                    to: this.currSessionId
                });
            },
            scrollToBottom() {
                // 聊天窗滚动到最底部
                setTimeout(() => {
                    const DOM_frame = document.getElementById('frame-main');
                    if (DOM_frame) {
                        DOM_frame.scrollTop = DOM_frame.scrollHeight;
                    }
                });
            },
            msgLoaded() {
                // if (!this.unreadMsgs.length) {
                //     // 如果当前是在没有未读消息情况下图片加载完成, 那么需要把滚动条滚动到最底部
                //     this.scrollToBottom();
                // }

                // 如果当前是在没有未读消息情况下图片/视频加载完成
                if (!this.unreadMsgs.length) {
                    // 暂存聊天窗 Dom
                    const DOM_frame = document.getElementById('frame-main');
                    if (DOM_frame) {
                        // 如果已经滚动条距离底部距离未超过一整屏
                        if (DOM_frame.scrollHeight - DOM_frame.scrollTop < DOM_frame.offsetHeight * 2) {
                            // 则需要把滚动条滚动到最底部
                            this.scrollToBottom();
                        }
                    }
                }
            },
            // 查询当前聊天对象的翻译记忆
            getCurrentChatCountTM() {
                // http://10.2.2.101:7307
                return getTranslateMemory({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    sessionType: 11,
                    userAccount: this.currSessionId, // 询盘云 用户账号
                    visitorAccount: this.currVisitorId // 访客账号
                });
            },

            // ai tool bar
            onSelect(e) {
                let text;
                const selection = window.getSelection()
                if (selection && selection.toString().length !== 0) {
                    text = selection.toString()
                }
                if (text) {
                    this.$aiToolBar.init({
                        type: 'pageSelect',
                        value: text,
                        mouseX: e.clientX,
                        mouseY: e.clientY,
                    })
                }
            }
        },
        watch: {
            // 在此处处理加载历史消息后滚动条的滚动行为, 以及来新消息后的"未读消息"提示和滚动条
            computed_currSessionMsgs: {
                handler(newVal, oldVal) {
                    // 加上 setTimeout 以保证是在 DOM 结构出现后再触发方法
                    setTimeout(() => {
                        if (Array.isArray(oldVal) && oldVal.length) {
                            // 暂存聊天窗 Dom
                            const DOM_frame = document.getElementById('frame-main');

                            // 对新增的历史消息的处理
                            // 获取旧数组最顶部消息
                            const topMsg = oldVal[0];
                            const DOM_topMsg = document.getElementById(`${topMsg.idClient}-${topMsg.type}`);
                            if (DOM_topMsg) {
                                // 如果最顶部消息距离聊天窗内容顶部的距离超过一定大小, 则认为是加载出了更多历史数据
                                const offsetTop = DOM_topMsg.offsetTop;
                                // 因为改动了定位相关样式(position: absolute 改为 flex), 聊天窗滚动到顶部时, offsetTop 为 63 , 所以这里由 50 变为 50 + 63
                                if (offsetTop > 113) {
                                    // 于是调整聊天窗滚动条位置, 使之前的最顶部消息继续显示在视口顶部, 让用户自己手动向上滑动查看历史消息
                                    DOM_frame.scrollTop = offsetTop;
                                }
                            }

                            // 对新增的新消息的处理
                            // 获取旧数组最底部部消息
                            const bottomMsg = oldVal[oldVal.length - 1];
                            const DOM_bottomMsg = document.getElementById(`${bottomMsg.idClient}-${bottomMsg.type}`);
                            if (DOM_bottomMsg) {
                                // 获取旧数组最底部消息顶部距离聊天窗顶部的距离
                                const offsetTop = DOM_bottomMsg.offsetTop;
                                // 获取聊天窗滚动条距离顶部的距离
                                const scrollTop = DOM_frame.scrollTop;
                                // 获取聊天窗视口高度
                                const offsetHeight = DOM_frame.offsetHeight;
                                if (offsetTop > scrollTop + offsetHeight) {
                                    // 如果原底部消息在视口之下, 则直接将 newVal 中时间戳大于原底部消息时间戳的消息, 全部放入 unreadMsgs 中
                                    if (Array.isArray(newVal) && bottomMsg.time) {
                                        this.$emit('update:unreadMsgs', this.unreadMsgs.concat(newVal.filter(item => item.time && item.time > bottomMsg.time)));
                                    }
                                } else {
                                    // 否则将新消息显示在最底部
                                    DOM_frame.scrollTop = DOM_frame.scrollHeight;
                                }
                            }
                        }
                    });
                }
            },
            currSessionId: {
                handler(val) {
                    // 清空 unreadMsgs
                    this.$emit('update:unreadMsgs', []);
                    // 聊天窗滚动到最底部
                    this.scrollToBottom();
                },
                immediate: true
            },
            lastTransMemory: {
                async handler(val) {
                    await setTranslateMemory({
                        language: val,
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        sessionType: 11,
                        // userAccount: this.pageId, // 询盘云 用户账号
                        userAccount: this.currSessionId, // 询盘云 用户账号
                        visitorAccount: this.currVisitorId // 访客账号
                    });
                },
                immediate: true
            },
            currVisitorId: {
                async handler() {
                    const { message } = await this.getCurrentChatCountTM();
                    this.lastTransMemory = message || 'zh';
                },
                immediate: true
            }
        }
    };
</script>

<style type="text/css">
    .loadMore {
        cursor: pointer;
    }

    .loadMore:hover {
        color: #FA8241;
    }
    #chat-list {
        list-style: none;
    }

    .u-msg {
        text-align: center;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.28);
    }

    .u-msg .ivu-avatar-large {
        width: 46px;
        height: 46px;
    }

    .u-msg .ivu-avatar > img {
        width: 44px;
        height: 44px;
    }
</style>
