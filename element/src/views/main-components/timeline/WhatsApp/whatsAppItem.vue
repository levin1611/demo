<template>
    <div class="timeline-item twemoji-convert">
        <div class="item-header clearfloat">
            <!-- 标题 -->
            <div class="item-title">{{ `${item.eventCustomVar.chatType}` === '1' ? $t('timeLine.whatsAppGroup') : $t('timeLine.whatsApp') }}</div>

            <!-- 来自线索/联系人 -->
            <div v-if="type === 'clue'">
                <div class="block-line"></div>
                <div @click="viewClue(item.clueId)"
                     :class="(type === 'clue' && $route.path.startsWith('/clue_manage')) ? 'header-source-current' : 'header-source'">
                    {{ $t('timeLine.fromClue') }}{{ clue_short_info.a1009 }}
                </div>
            </div>
            <div v-else-if="type !== 'contact' && type !=='journeyDetail'">
                <div class="block-line"></div>
                <div :class="type === 'contact' ? 'header-source-current' : 'header-source'"
                     @click="viewContact(item)">
                    {{ $t('timeLine.fromContacts') }}
                    {{ item.contactsName | filterName }}
                </div>
            </div>

            <!-- 时间 -->
            <div class="item-time">{{ item.eventTime | timeFormat("DateTime") }}</div>
        </div>

        <div class="item-body item-spacing">
            <!-- 群组消息(xx 在 yy 群发送) -->
            <span v-if="`${item.eventCustomVar.chatType}` === '1'">
                {{ $t('timeLine.waSendGroupMsgTip').replace('$senderName', item.contactsName).replace('$groupName', item.eventCustomVar.subject) }}
            </span>
            <!-- 他人发送消息 -->
            <span v-else-if="!item.eventCustomVar.fromMe">
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
                      :class="`item-event ${class_whatsApp_GTM}`">【{{ getMessageContent(item.eventCustomVar.type, item.eventContent) }}】</span>
                <div style="min-height: 540px"
                     class="api">
                    <template v-if="currentLineItemId === item.id">
                        <WhatsAppModal ref="whatsAppModal"
                                       :whetherToLocateTheMessage="whetherToLocateTheMessage"
                                       :chatType="`${item.eventCustomVar.chatType}`"
                                       :chatWaAccount="chatWaAccount"
                                       :whatsAppName="whatsAppName"
                                       :userBindWaAccount="userBindWaAccount"
                                       :currentLineItemId="currentLineItemId"></WhatsAppModal>
                    </template>
                </div>
            </Poptip>
        </div>

        <!-- WhatsApp时间轴显示的正文 -->
        <div v-if="item.eventCustomVar.waText" class="whatsapp-text">{{`${$t('mail.writeLetter.body')}： ${item.eventCustomVar.waText}`}}</div>

        <!-- 评论: 公海管理进入不能回复评论 -->
        <div class="font-size-12 whats-app-replay-btn-box" v-if="!(['xhl-chat','whatsApp','journeyDetail'].includes(originalType))">
            <!-- 外部按钮 -->
            <div style="text-align: right;">
                <a @click="$emit('showReplyModal', item)" href="javascript:void(0)" class="followup-comment" :class="`piwik_${type}_${originalType}_whatsApp_replyBtn`">{{ $t('followupReply.reply') }}</a>
            </div>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue';
    import { mapState } from 'vuex';
    import i18n from '@/locale';
    import WhatsAppModal from '@/views/main-components/timeline/WhatsApp/modal/WhatsAppModal';
    import getMsgContent from '@/mixins/getMsgContent';
    import timeline from '@/api/timeline';
    const { getWaMessageId } = timeline;

    export default {
        name: 'whatsAppItem',
        mixins: [getMsgContent],
        components: {
            WhatsAppModal
        },
        props: {
            'whatsAppAccountInfo':Object,
            item: {
                type: Object,
                default() {
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
                chatWaAccount: '', // 当前选中的WhatsApp的账号
                userBindWaAccount: '', // 当前用户绑定的WhatsApp的账号
                whatsAppName: '', // whatsAppName: '', // WhatsApp消息发起方的WhatsApp的昵称
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
                this.chatWaAccount = '';
                this.userBindWaAccount = '';
            },
            /* 当点击打开WhatsApp聊天记录弹窗的回调处理 */
            async handleOpenWhatsAppModal(item) {
                // 如果有messageId,则聊天记录跳转到指定的位置
                if (item.eventCustomVar.messageId) {
                    this.whetherToLocateTheMessage = item.eventCustomVar.messageId;
                } else {
                    // 如果没有messageId,则通过后端的接口拿一下messageId
                    await getWaMessageId({
                        orgId: Number(this.enterpriseId),
                        chatRecordsId: item.eventCustomVar.firstChatRecordId
                    }).then(res => {
                        if (res.code === 1) {
                            // 如果后端返回了messageId
                            if (res.data) {
                                this.whetherToLocateTheMessage = res.data;
                            }
                        }
                    }).catch(error => {
                        console.error(error);
                    });
                }

                console.log('handleOpenWhatsAppModal(0-------', item);

                if (`${item.eventCustomVar.chatType}` === '1') {
                    // 聊天方为"群组"

                    this.whatsAppName = item.eventCustomVar.subject;
                    this.chatWaAccount = item.eventCustomVar.toWaAccount;
                } else {
                    // 聊天方为私人

                    if (item.eventCustomVar.fromMe === 0) {
                        /* 聊天由对方主动发起，则chatWaAccount取消息发起方的账号，whatsAppName取消息发起方 */
                        this.whatsAppName = item.contactsName;
                        this.chatWaAccount = item.eventCustomVar.fromWaAccount;
                    } else if (item.eventCustomVar.fromMe === 1) {
                        /* 聊天由询盘云用户主动发起，则chatWaAccount取消息接收方的账号，whatsAppName取消息发起方 */
                        this.whatsAppName = item.eventUser;
                        this.chatWaAccount = item.eventCustomVar.toWaAccount;
                    }
                }

                this.userBindWaAccount = item.eventCustomVar.userBindWaAccount;
                this.currentLineItemId = item.id;
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
