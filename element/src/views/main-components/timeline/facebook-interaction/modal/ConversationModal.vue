<template>
    <div v-loading="chatBoxLoading"
         class="fb-chat-container">
        <div class="fb-chat-header">
            <div style="float:left">{{ conversationName }}</div>
        </div>
        <div id="scroll_loader_container"
             class="container-main">
            <div v-for="message in messageList"
                 :key="message.id"
                 class="message-block">
                <p class="message-time"> {{ message.ctime | timeFormat("DateTime") }} </p>
                <div :class="'message-main' + (message.direction == 1 ? ' self': '')">
                    <Avatar :src="message.direction === 1 ? pageAvatar : contactAvatar"
                            size="large"/>
                    <!-- 图片 -->
                    <div v-if="message.attachmentsType === 'image'"
                         class="message-img">
                        <img :src="message.attachmentsUrl"
                             :alt="$t('facebook.inbox.fbChat.chatImg')"
                             @click="imgPreview"
                             class="image">
                    </div>
                    <div v-else
                         class="message-content">
                        <!-- 文本 -->
                        <template v-if="message.attachmentsType === 'text' || !message.attachmentsType || message.attachmentsType === 'fallback'">
                            {{ message.content }}
                        </template>
                        <!-- 文件 -->
                        <template v-else-if="message.attachmentsType === 'file'">
                            <Icon type="document"></Icon>
                            <a :href="message.attachmentsUrl"
                               style="text-decoration: underline;margin: 0 4px;color: rgb(45, 140, 240);">{{ $t('facebook.inbox.fbChat.fileTip') }}</a>
                        </template>
                        <!-- 其他类型 -->
                        <template v-else>{{ $t('facebook.inbox.fbChat.notSupportTip') }}</template>
                    </div>
                    <!-- 已读/未读状态(非群聊对话 + 消息是'我'发的才显示状态图标) -->
                    <Tooltip v-if="message.direction == 1" :open-delay="openDelay" :visible-arrow="false" placement="bottom-end" popper-class="message-tip-timeline">
                        <div slot="content" class="message-tip-content">{{msgReadTime}}</div>
                        <!-- 已读未读的icon图标标识 -->
                        <Icon
                            style="cursor: pointer;margin-top: 18px;margin-right: 2px;"
                            @mouseover.native="getReadTimeDebounce(message)"
                            :custom="getReadStatusIcon(message)"></Icon>
                    </Tooltip>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'ConversationModal',
        props: {
            pageId: {
                type: String,
                default: ''
            },
            clueId: {
                type: String,
                default: ''
            },
            conversationName: {
                type: String,
                default: ''
            },
            conversationId: {
                type: String,
                default: ''
            },
            idFlag: {
                type: Number,
                default: 0
            },
            avatar: {
                type: Object,
                default: null
            },
            messageList: {
                type: Array,
                default: null
            }
        },
        data() {
            return {
                openDelay: 600, // 显示已读时间的延迟
                msgReadTime: '', // 消息已读时间
                messageListTemp: [], // 消息列表
                chatBoxLoading: true,
                pageAvatar: '',
                contactAvatar: ''
            };
        },
        methods: {
            // get消息已读时间,添加防抖
            getReadTimeDebounce(message) {
                // 如果鼠标放在了未读的消息上,则停止
                if (message.messageReadStatus !== 2) {
                    this.msgReadTime = this.$t('chat.unread');
                    return;
                };
                // 防止鼠标多次划过,而多次请求
                if (this.timeout) {
                    clearTimeout(this.timeout);
                }
                this.timeout = setTimeout(() => {
                    this.getReadStatusTime(message);
                }, 200);
            },
            // 获取消息已读的时间戳
            getReadStatusTime(message) {
                const ctime = message.ctime;
                util.ajaxInternationalJson({
                    url: 'social/messagingread/getReadTime',
                    method: 'get',
                    params: {
                        pageId: this.pageId, // 主页id
                        senderId: this.conversationId, // 会话id
                        messagingTime: ctime // 当前消息创建时间
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        // 已读时间赋值
                        this.msgReadTime = `${this.$t('chat.read')} ${res.data.data.readTime}`;
                    }
                });
            },
            // 获取最后一条消息的发送状态对应的 icon class
            getReadStatusIcon(message) {
                // 定义一个icon类名
                let icon = 'custom';

                // 根据消息状态,来给icon赋值
                if (message.messageReadStatus === 2) {
                    // 对方已读
                    icon += ' custom-haveRead';
                } else {
                    // 已送达给对方,对方已接收,但是未读
                    icon += ' custom-delivered-and-received';
                };

                return icon;
            },
            // 获取会话内容 -- 这个方法放到时间轴中调用了
            getMessages(clueId) {
                this.chatBoxLoading = true;
                util.ajaxInternational({
                    url: '/social/facebookEvent/getConversationDetail',
                    method: 'get',
                    params: {
                        conversationId: this.conversationId,
                        clueId: clueId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.messageList = response.data.data.list;
                        const avatar = JSON.parse(response.data.data.customVar);
                        this.pageAvatar = avatar.pageAvatar;
                        this.contactAvatar = avatar.conversationAvatar;
                        this.chatBoxLoading = false;
                    }
                });
            },
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            }
        },
        watch: {
            avatar: {
                handler(val) {
                    if (val) {
                        this.pageAvatar = val.pageAvatar;
                        this.contactAvatar = val.conversationAvatar;
                    }
                    this.chatBoxLoading = false;
                },
                immediate: true
            }
            // clueId(val){
            //     if(val) {
            //         console.log('非自动关联',val)
            //         this.getMessages(val)
            //     }
            // },
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId
            })
        }
    };
</script>
<style lang="less">
    // 加scoped的话,会失效
    /* 修改已读未读tooltip的样式 */
    .message-tip-timeline{
        background-color: #727272 !important;
        padding: 6px 10px !important;
        margin-top: -3px !important;
        margin-right: 18px !important;
        // 时间文本不换行
        .message-tip-content{
            white-space: nowrap;
        }
    }
</style>
<style lang="less" scoped>
    .fb-chat-container {
        white-space: normal;

        .fb-chat-header {
            height: 40px;
            line-height: 40px;
            font-size: 16px;
            border-bottom: 1px solid #e5e5e5;
        }

        .container-main {
            padding: 10px;
            height: 500px;
            overflow-x: hidden;
            overflow-y: auto;

            &::-webkit-scrollbar {
                width: 4px;
            }

            .message-block {
                .message-time {
                    text-align: center;
                    font-size: 12px;
                    width: 126px;
                    padding: 2px 4px;
                    // background-color: #dadada;
                    border-radius: 6px;
                    background-color: #fff;
                    // color: #fff;
                    color: rgba(0, 0, 0, .28);
                    margin: 0 auto;
                }

                .message-main {
                    margin: 12px 0;

                    .message-img {
                        position: relative;
                        display: inline-block;
                        padding: 4px 10px;
                        margin: 0 4px;

                        img {
                            vertical-align: top;
                            max-width: 200px;
                        }
                    }

                    .message-content {

                        vertical-align: top;
                        // max-width: calc(~"100% - 100px");
                        // max-width: calc(100% - 200px);
                        // max-width: calc(100% - 170px);
                        max-width: calc(~"100% - 250px");
                        // background-color: #f1f0f0;
                        position: relative;
                        display: inline-block;
                        font-size: 14px;
                        border-radius: 15px;
                        padding: 4px 10px;
                        margin: 0 4px;
                        text-align: left;
                        word-wrap: break-word;
                        // &:before {
                        //     content: " ";
                        //     position: absolute;
                        //     top: 9px;
                        //     right: 100%;
                        //     border: 6px solid transparent;
                        //     border-right-color: #f1f0f0;
                        // }
                    }
                }

                .self {
                    text-align: right;

                    .el-avatar {
                        float: right;
                    }

                    .message-content {
                        background-color: #FFEBE0;
                        color: rgba(0,0,0,0.80);
                        border: 1px solid #FBD5BF;
                        border-radius: 4px;
                        // &:before {
                        //     right: inherit;
                        //     left: 100%;
                        //     border-right-color: transparent;
                        //     border-left-color: #0084ff;
                        //     color: #fff;
                        // }
                    }
                }
            }
        }

        .fb-chat-footer {
            position: absolute;
            bottom: 0;
            left: 0;
        }
    }
</style>
