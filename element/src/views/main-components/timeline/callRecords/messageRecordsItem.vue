<template>
    <div class="timeline-item twemoji-convert">
        <div class="item-header clearfloat">
            <!-- 标题 -->
            <div class="item-title">{{$t('timeLine.message')}}</div>
            <!-- 来自线索/联系人 -->
            <div v-if="type === 'clue'">
                <div class="block-line"></div>
                <div @click="viewClue(item.clueId)"
                        :class="(type === 'clue' && $route.path.startsWith('/clue_manage')) ? 'header-source-current' : 'header-source'">
                    {{ $t('timeLine.fromClue') }}{{ clue_short_info.a1009 }}
                </div>
                <div class="block-line"></div>
                <span style="float: left;padding-left: 8px;">{{JSON.parse(item.eventCustomVar).chatId}}</span>
            </div>
            <div v-else-if="type !== 'contact' && type !=='journeyDetail'">
                <div class="block-line"></div>
                <div :class="type === 'contact' ? 'header-source-current' : 'header-source'"
                     @click="viewContact(item)">
                    {{ $t('timeLine.fromContacts') }}
                    {{ item.contactsName | filterName }}
                </div>
                <div class="block-line"></div>
                <span style="float: left;padding-left: 8px;">{{JSON.parse(item.eventCustomVar).chatId}}</span>
            </div>

            <!-- 时间 -->
            <div class="item-time">{{ item.eventTime | timeFormat("DateTime") }}</div>
        </div>

        <div class="item-body item-spacing">
            <!-- 群组消息(xx 在 yy 群发送) -->
            <span v-if="`${JSON.parse(item.eventCustomVar).chatType}` === '1'">
                {{ $t('timeLine.waSendGroupMsgTip').replace('$senderName', JSON.parse(item.eventCustomVar).fromNickName).replace('$groupName', JSON.parse(item.eventCustomVar).subject) }}
            </span>
            <!-- 他人发送消息 -->
            <span v-else-if="!JSON.parse(item.eventCustomVar).fromMe">
                {{ $lang === 'zh-CN' ?
                    `【${item.contactsName}】${$t('facebookInteraction.to')}【${item.eventUser}】${$t('chat.send')}`
                    :
                    `【${item.contactsName}】${$t('chat.send')}${$t('facebookInteraction.to')}【${item.eventUser}】`
                }}
            </span>
            <!-- "我"发送的消息 -->
            <span v-else>
                {{ $lang === 'zh-CN' ?
                    `【${item.eventUser}】${$t('facebookInteraction.to')}【${item.contactsName}】${$t('chat.send')}`
                    :
                    `【${item.eventUser}】${$t('chat.send')}${$t('facebookInteraction.to')}【${item.contactsName}】`
                }}
            </span>
            <!-- 消息内容(点击可弹出聊天记录详情弹框) -->
            <Poptip width="500"
                    placement="bottom-start"
                    popper-class="pop-show"
                    @hide="handleCloseWhatsAppModal"
                    @show="handleOpenWhatsAppModal(item)">
                <span slot="reference"
                      :class="`item-event ${class_whatsApp_GTM}`">【{{ getMessageContent(JSON.parse(item.eventCustomVar).type, item) }}】</span>
                <div style="min-height: 540px"
                     class="api">
                     <template v-if="currentLineItemId === item.id">
                        <SmsModal ref="qwViewMsg"
                            :whetherToLocateTheMessage="whetherToLocateTheMessage"
                            :chatType="`${JSON.parse(item.eventCustomVar).chatType}`"
                            :bindCinnoxUserId="`${JSON.parse(item.eventCustomVar).bindCinnoxUserId}`"
                            :chatCinnoxAccount="chatQwAccount"
                            :cinnoxName="whatsAppName"
                            :bindCinnoxAccount="userBindQwAccount"
                            :currentLineItemId="currentLineItemId"></SmsModal>
                    </template>
                </div>
            </Poptip>
        </div>
        <!-- WhatsApp时间轴显示的正文 -->
        <template v-if="JSON.parse(item.eventCustomVar).type === 1">
            <div v-if="item.messageText" class="whatsapp-text">{{`${$t('mail.writeLetter.body')}： ${item.messageText}`}}</div>
        </template>
        <template v-else>
            <div class="whatsapp-text">{{`${$t('mail.writeLetter.body')}：【${getMessageContent(JSON.parse(item.eventCustomVar).type, item)}】`}}</div>
        </template>

        <!-- 评论: 公海管理进入不能回复评论 -->
        <!-- <div class="font-size-12 whats-app-replay-btn-box" v-if="!(['xhl-chat','whatsApp','journeyDetail'].includes(originalType))">
            <div style="text-align: right;">
                <a @click="$emit('showReplyModal', item)" href="javascript:void(0)" class="followup-comment">{{ $t('followupReply.reply') }}</a>
            </div>
        </div> -->
    </div>
</template>

<script>
    import Vue from 'vue';
    import { mapState } from 'vuex';
    import i18n from '@/locale';
    import getMsgContent from '@/mixins/getMsgContent';
    import SmsModal from '@/views/calling_sms/SmsModal.vue';
    import timeline from '@/api/timeline';
    const { getWaMessageId } = timeline;

    export default {
        name: 'messageRecordsItem',
        mixins: [getMsgContent],
        components: {
            SmsModal
        },
        props: {
            whatsAppAccountInfo: Object,
            item: {
                type: Object,
                default(val) {
                    return {};
                }
            },
            type: {
                type: String,
                default: ''
            },
            originalType:{
                type: String,
            }
        },
        filters: {
            filterName(value) {
                return value || i18n.t('timeLine.unknown');
            }
        },
        computed: {
            ...mapState({
                clue_short_info: 'clue_short_info',
                enterpriseId: 'enterpriseId',
                class_whatsApp_GTM() {
                    switch (this.type) {
                        case 'clue':
                            return 'clue-whatsApp-timeline';
                        case 'inquiry':
                            return 'inquiry-whatsApp-timeline';
                        case 'customer':
                            return 'customer-whatsApp-timeline';
                        case 'highseasCustomer':
                            return 'highseasCustomer-whatsApp-timeline';
                        case 'contact':
                            return 'contact-whatsApp-timeline';
                        default:
                            return '';
                    }
                }
            }),
            $lang() {
                return Vue.config.lang;
            }
        },
        data() {
            return {
                whetherToLocateTheMessage: '', // 是否定位消息的位置,接收的是一个对象(里面包含messageId)
                chatQwAccount: '', // 当前选中的WhatsApp的账号
                userBindQwAccount: '', // 当前用户绑定的weChat的账号
                whatsAppName: '', // weChatName: '', // weChat消息发起方的weChat的昵称
                currentLineItemId: '' // 当前点击的timeLineItem的id
            };
        },
        methods: {
            /* 弹出线索详情 */
            viewClue(clueId) {
                if (this.$route.path.startsWith('/clue_manage')) {
                    return;
                }
                this.$emit('viewClue', clueId);
            },
            /* 弹出联系人详情 */
            viewContact(item) {
                this.$emit('viewContact', item);
            },
            /* 当聊天记录的弹窗消失时的回调处理 */
            handleCloseWhatsAppModal() {
                this.currentLineItemId = '';
                this.whatsAppName = '';
                this.chatQwAccount = '';
                this.userBindQwAccount = '';
            },
            /* 当点击打开WhatsApp聊天记录弹窗的回调处理 */
            async handleOpenWhatsAppModal(item) {
                // // 如果有messageId,则聊天记录跳转到指定的位置
                // if (JSON.parse(item.eventCustomVar).messageId) {
                //     this.whetherToLocateTheMessage = JSON.parse(item.eventCustomVar).messageId;
                // } else {
                //     // 如果没有messageId,则通过后端的接口拿一下messageId
                //     await getWaMessageId({
                //         orgId: Number(this.enterpriseId),
                //         chatRecordsId: JSON.parse(item.eventCustomVar).firstChatRecordId
                //     }).then(res => {
                //         if (res.code === 1) {
                //             // 如果后端返回了messageId
                //             if (res.data) {
                //                 this.whetherToLocateTheMessage = res.data;
                //             }
                //         }
                //     }).catch(error => {
                //         console.error(error);
                //     });
                // }
                // 通过与后端（福品）沟通企微不存在没有messageId的情况
                this.whetherToLocateTheMessage = JSON.parse(item.eventCustomVar).messageId;

                console.log('handleOpenWhatsAppModal(0-------', item);

                if (`${JSON.parse(item.eventCustomVar).chatType}` === '1') {
                    // 聊天方为"群组"

                    this.whatsAppName = JSON.parse(item.eventCustomVar).subject;
                    this.chatQwAccount = JSON.parse(item.eventCustomVar).toPhone;
                } else {
                    // 聊天方为私人

                    if (JSON.parse(item.eventCustomVar).fromMe === 0) {
                        /* 聊天由对方主动发起，则chatQwAccount取消息发起方的账号，whatsAppName取消息发起方 */
                        this.whatsAppName = item.contactsName;
                        this.chatQwAccount = JSON.parse(item.eventCustomVar).fromPhone;
                    } else if (JSON.parse(item.eventCustomVar).fromMe === 1) {
                        /* 聊天由询盘云用户主动发起，则chatQwAccount取消息接收方的账号，whatsAppName取消息发起方 */
                        this.whatsAppName = item.eventUser;
                        this.chatQwAccount = JSON.parse(item.eventCustomVar).toPhone;
                    }
                }

                this.userBindQwAccount = JSON.parse(item.eventCustomVar).userBindPhone;
                this.currentLineItemId = item.id;
            },
            getMessageContent(type, item) {
                let str = '';
                switch (type) {
                    case 1:
                        str = item.eventContent;
                        break;
                    case 2:
                        str = '图片';
                        break;
                    case 3:
                        str = '文件';
                        break;
                    case 4:
                        str = '视频';
                        break;
                    case 5:
                        str = 'h5链接卡片';
                        break;
                    case 6:
                        str = '表情';
                        break;
                    case 7:
                        str = '名片';
                        break;
                    case 8:
                        str = '小程序';
                        break;
                    case 9:
                        str = '语音';
                        break;
                    case 10:
                        str = '视频号';
                        break;
                    case 10000:
                        str = '系统消息（撤回/拍一拍/进群提醒等）';
                        break;
                    default:
                        str = '其他';
                        break;
                }
                return str;
            }
        }
    };
</script>

<style lang="less" scoped>
    .timeline-item {
        color: rgba(0, 0, 0, .8);

        // .item-header, .item-body {
        //     line-height: 17px;
        // }

        .whatsapp-text {
            /* 文本超出两行时,剩余的部分显示 ... */
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            line-height: 18px;
        }
        .item-spacing{
            margin-bottom: 10px;
        }
    }

</style>
