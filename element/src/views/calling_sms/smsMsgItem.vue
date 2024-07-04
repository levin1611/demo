<template>
    <li :id="`smsMsgItem-${msg.messageId}-${msg.messageType}`"
        class="u-msg session-chat "
        :class="classObject"
        ref="msgLi"
    >
        <div v-if="msg.messageType==='timeTag'">{{msg.showText}}</div>
        <div v-else-if="msg.messageType==='tip'" class="tip">{{msg.showText}}</div>

        <!-- 时间 -->
        <p v-if="msg.showTimeTag"
            class="message-time"> {{ msg.messageTime | timeFormat('DateTime') }} </p>

        <div style="overflow: hidden;text-align: left;position: relative;padding: 0 20px;"
            :style="{paddingLeft: classObject == 'item-you'? '20px':'0'}"
        >

            <!-- 已读/未读状态(非群聊对话 + 消息是'我'发的才显示状态图标) -->
            <!-- <span v-if="msg.messageType == 1 && classObject === 'item-me'"
                  class="waMsgItem-readStatus">
                <Icon  :custom="getReadStatusIcon(msg.messageStatus)"></Icon>
            </span> -->

            <!-- 账号名 -->
            <div v-if="!msg.isFromMe"
                 class="waMsg-accountName">
                <template v-if="msg.fromWaName">{{$options.filters.isNameLengthTooLong(msg.fromWaName, 15)}}</template>
                <template v-else-if="msg.fromWaAccount">{{$options.filters.isNameLengthTooLong(msg.fromWaAccount, 15)}}</template>
            </div>

            <!-- 消息体 -->
            <div v-if="[1].includes(msg.messageType)"
                 class="msg-text">
                <!-- 文本 -->
                <div v-if="msg.messageType === 1"
                     :style="fromFlag === 'waRelatedDetail' ? 'font-size: 12px;' : ''">
                    <pre v-html="msg.showText"
                         style="margin: 0"></pre>
                    <pre v-if="msg.showText.length > 7000 && !msg.isFromMe"
                         style="color:#4285f4;margin: 0;">{{ $t('whatsapp_manage.limitTextOverTip') }}</pre>
                    <!-- 翻译内容 -->
                    <div v-if="translateText"
                         v-html="translateText"
                         ref="transbox"
                         class="text-border"></div>
                </div>

                <div v-if="[0,3].includes(msg.messageStatus ) && msg.isFromMe" class="msg-send-err-icon">
                    <Tooltip :content="$t('whatsapp_manage.sendMsgErrReason0')">
                    <img src="@/styles/customFont/svg/msg-send-err.svg"
                         alt="消息发送失败"
                         />
                    </Tooltip>
                </div>
                <!-- <Tooltip v-if="true"
                         class="msg-send-err-icon">
                    <img src="@/styles/customFont/svg/msg-send-err.svg"
                         alt="消息发送失败"
                         @mouseenter=""/>
                    <div slot="content">
                        <div v-if="false"
                             style="position: relative;overflow: hidden;">
                            <Spin fix style="background: transparent;"></Spin>
                            {{ '\xa0\xa0\xa0\xa0' }}
                        </div>
                        <div v-else>{{ sendErrReason }}</div>
                    </div>
                </Tooltip> -->
            </div>
            <!-- 通话详情模板 -->
            <section v-if="[2].includes(msg.messageType)"
            class="calling_sms_msg_item">
                <div class="callstatus" :class="blueStatusState?'blueStatus':''">
                <Icon class="redColor" :class='blueStatusState? "blueStatus": ""' :custom="getCallStatus(msg.messageStatus)"></Icon>
                    {{callStatus()}}
                </div>
                <div class="go_view_call_detail" @click="viewsmsDetail()">
                    {{$t('callSms.CalldetailsView')}}      <Icon color="#7B98B6" custom="custom custom-HideRight"></Icon>
                </div>
            </section>
        </div>
    </li>
</template>

<script type="text/javascript">
    import util from '@/libs/util';
    // import Vue from 'vue';
    import { generateOSSDownloadUrl } from '@/api/whatsapp';
    import { saveCinnoxTranslateTxt } from '@/api/call&sms';
    import { mapState } from 'vuex';

    export default {
        inheritAttrs: false,
        props: {
            // 当前账号信息
            currAccountInfo: {
                type: Object,
                default() {
                    return {};
                }
            },
            // 要删除的消息列表
            handleDeleteMsg: {
                type: Function
            },

            rawMsg: {
                type: Object,
                default() {
                    return {};
                }
            },
            currAccountAvatar: {
                type: String,
                default() {
                    return '';
                }
            },
            fromFlag: {
                type: String,
                default() {
                    return '';
                }
            },
            // 当前登录的 WA 账号信息
            cinnoxAccountInfo: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                visible: false,
                msg: {},
                translateText: '',
                blueStatusState: true
            };
        },
        computed: {
            ...mapState({
                // callSmsScoketMsg: state => state.callingSms.callSmsScoketMsg,
                // isSuperAdmin: state => state.isSuperAdmin, // 超管
                userId: state => state.userId,
                orgId: state => state.enterpriseId
            }),
            // 判断当前登陆的账号有没有查看下属聊天记录(撤回、删除)的权限
            classObject() {
                return this.msg.isFromMe ? 'item-me' : 'item-you';
            },
            // UI要求: Poptip 组件不允许覆盖输入框,将 '不能超出的容器' 传给组件
            options() {
                // Poptip显示时不能超出的容器
                const container = document.querySelector('#whatsApp-main');
                return {
                    boundariesElement: container
                };
            },
            robotInfos() {
                return this.$store.state.robotInfos;
            },
            // 当前聊天账号
            chatWaAccount() {
                return this.msg.isFromMe ? this.msg.toWaAccount : this.msg.fromWaAccount;
            },
           
        },
        beforeMount() {
            this.$forceUpdate();
            // console.log(this.rawMsg,'this.rawMsg');
            const item = Object.assign({}, this.rawMsg);
            switch (item.messageType) {
                case 'timeTag':
                    // 标记发送的时间

                    item.showText = item.smsText;
                    break;
                case 1:
                    // 文本消息 text
                    // 识别链接
                    item.showText = item.smsText.replace(/((https|http):\/\/[\S.\/]+)(?![^<]+>)/gi, '<a href=\'$1\' target=\'_blank\'>$1</a>');
                    // 修改whatsapp发送域名、ip、标签符号的消息时显示错误的问题
                    item.showText = item.smsText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    break;
                default:
                    item.showText = this.$t('whatsapp_manage.nonsupportTip');
            }
            this.msg = item;

            // 处理翻译消息
            if (item.smsTranslateText) {
                this.translateText = item.smsTranslateText.replace(/(\r\n|\r|\n)/g, '<br>');
            }
        },
        mounted() {
            // 只有文字消息才监听翻译 事件
            if (this.msg.messageType == 1) {
                this.$EVENTBUS.$on('getSmsMsgItemisShow', (data) => {
                    this.isInViewPort(data);
                });
            }
        },
        methods: {
            // 打开通话详情组件
            viewsmsDetail() {
                console.log('打开通话详情', this.currAccountInfo);
                this.$EVENTBUS.$emit('openCalldetailIng', true, {
                    // userId: this.userId,
                    // orgId: this.orgId,
                    userId: this.currAccountInfo.userId,
                    orgId: this.currAccountInfo.orgId,
                    messageId: this.msg.messageId,
                    staffPhone: this.currAccountInfo.staffPhone
                });
            },
            // 判断当前元素是不是在可视区域内
            isInViewPort(data) {
                // console.log(this.$refs.msgLi);
                const { top } = this.getOffset(this.$refs.msgLi.querySelector('.msg-text'));
                if (top > data.atop && top < data.abottom) {
                    // 翻译这条消息
                    this.translateChat(data.lang, this.msg);
                }
            },
            getOffset(element) {
                const rect = element.getBoundingClientRect();
                const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                return {
                    top: rect.top + scrollTop,
                    left: rect.left + scrollLeft
                };
            },
            translateChat(lang, msg) {
                util.ajaxInternational({
                    url: '/translation/translation',
                    method: 'post',
                    data: {
                        requestText: msg.showText.replace(/(\r\n|\r|\n)/g, '<br>').replace(/\s/g, '&nbsp;'),
                        targetLang: lang
                    }
                }).then(response => {
                    if (response.data) {
                        this.translateText = response.data.data.translations[0].translatedText;
                        // console.log(this.mentions);
                        if (this.mentions) {
                            Object.keys(this.mentions).forEach(key => {
                                // 翻译阿拉伯语时候发现 @的名字后面有空各  直接替换掉
                                const regempty = /@\s*/g;
                                const reg = new RegExp(`@${key}`, 'g');
                                // console.log(this.translateText.replace(regempty,'@'));
                                this.translateText = this.translateText.replace(regempty, '@');
                                this.translateText = this.translateText.replace(reg, `<span class="aiteMember">@${this.mentions[key]}</span>`);
                            });
                        }
                        if (this.translateText) {
                            // 保存翻译内容
                            saveCinnoxTranslateTxt({
                                orgId: this.orgId,
                                userId: this.userId,
                                messageId: msg.messageId,
                                translateText: this.translateText
                            });
                        }
                    }
                });
            },
            // 下载附件
            downloadFile(path, name) {
                // 如果是七牛附件地址, 按七牛的附件下载方式来
                if (/^(https|http):\/\/content\.leadscloud\.com\//.test(path)) {
                    window.open(`${path}?attname=${encodeURIComponent(name)}`, '_self');
                    return;
                }

                // 其他, 默认按阿里 oss 文件, 调用接口下载
                this.downloadOSSFile(path, name);
            },
            // 下载阿里 OSS 附件
            downloadOSSFile(path, name) {
                generateOSSDownloadUrl({
                    url: path,
                    name
                }).then(res => {
                    if (res) {
                        window.open(res, '_self');
                    } else {
                        this.$Message.error(this.$t('downloadFail'));
                    }
                });
            },
            // 下载
            triggerDownload(msg) {
                // 关闭弹框
                this.visible = false;

                // 格式化下载文件名
                const filePath = msg.contentQiniuUrl;
                const sendDate = this.$dym.dateFormat('YYYYmmddHHMMSS', new Date(Number(msg.messageTime || Date.now())));
                let fileSuffix = '';
                if (filePath.indexOf('.') !== -1) {
                    fileSuffix = filePath.split('.').slice(-1)[0].toLowerCase();
                }
                const fileName = `${this.$t('crm.Table.col_whatsapp_message_type5')}-${sendDate}${fileSuffix ? `.${fileSuffix}` : ''}`;
                // 下载
                window.open(`${filePath.slice(filePath.split(':')[0].length + 1)}?attname=${encodeURIComponent(fileName)}`);
            },

            // 获取短信的发送状态对应的 icon class
            getReadStatusIcon(readFlag) {
                let icon = 'custom';

                switch (readFlag) {
                    case 1:
                        // 待投递状态 闹钟
                        icon += ' custom-tobeDelivered';
                        break;
                    case 2:
                        // 已送达给对方 单个灰色对号
                        icon += ' custom-delivered-and-unreceived';
                        break;
                    // case 2:
                    //     // 已送达给对方，对方已接收 灰色双钩
                    //     icon += ' custom-delivered-and-received';
                    //     break;
                    // case 1:
                    //     // 对方已读
                    //     icon += ' custom-haveRead';
                    //     break;
                }

                return icon;
            },
            getCallStatus(status) {
                let icon = '';
                // unknown:'未知',
                // call_ended: '通话结束',
                // declined: '用户拒绝',
                // busy: '用户繁忙',
                // not_answered: '无人应答',
                // cancelled: '取消通话',
                // abandoned: '放弃通话',
                // unreachable: '无法拨通',
                // call_failed: '呼叫失败',
                // CalldetailsView: '查看通话详情',
                if (this.msg.isFromMe) {
                    switch (status) {
                        case 1:
                        case 4:
                        case 0:
                        case 2:
                        case 3:
                        case 5:
                        case 6:
                        case 7:
                            icon += 'custom custom-tonghuajieshu';
                            break;
                        // icon += 'custom custom-weijiedianhua';
                        // break;
                        case 8:
                            icon += 'custom custom-tonghuashibai';
                            break;
                    }
                } else {
                    icon += 'custom custom-weijiedianhua';
                }
                return icon;
            },
            callStatus() {
                // 通话状态
                let str = '';
                // unknown:'未知',
                // call_ended: '通话结束',
                // declined: '用户拒绝',
                // busy: '用户繁忙',
                // not_answered: '无人应答',
                // cancelled: '取消通话',
                // abandoned: '放弃通话',
                // unreachable: '无法拨通',
                // call_failed: '呼叫失败',
                // CalldetailsView: '查看通话详情',
                if (this.msg.isFromMe) {
                    switch (this.msg.messageStatus) {
                        case 0:
                            str = this.$t('callSms.unknown');
                            break;
                        case 1:
                            str = String(this.$t('callSms.call_ended')) + this.msg.durationStr;
                            break;
                        case 2:
                            str = this.$t('callSms.declined');
                            break;
                        case 3:
                            str = this.$t('callSms.busy');
                            break;
                        case 4:
                            str = this.$t('callSms.not_answered');
                            break;
                        case 5:
                            str = this.$t('callSms.cancelled');
                            break;
                        case 6:
                            str = this.$t('callSms.abandoned');
                            break;
                        case 7:
                            str = this.$t('callSms.unreachable');
                            break;
                        case 8:
                            this.blueStatusState = false; // 通话失败红色字体
                            str = this.$t('callSms.call_failed');
                            break;
                    }
                } else {
                    switch (this.msg.messageStatus) {
                        case 0:
                            str = this.$t('callSms.unknown');
                            break;
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                        case 6:
                        case 7:
                        case 8:
                            this.blueStatusState = false; // 未接电话红色字体
                            str = this.$t('callSms.missed_call');
                            break;
                        case 1:
                            str = String(this.$t('callSms.call_ended')) + this.msg.durationStr;
                            break;
                    }
                };

                return str;
            }
        },
        watch: {
        },
        destroyed() {
            // console.log('销毁组件');
            this.$EVENTBUS.$off('getSmsMsgItemisShow');
        }
    };
</script>

<style scoped lang="less">
      .quoted-msg__highlight {
        /deep/ .msg-text {
            border-color: rgba(0, 0, 0, .1) !important;
            background-color: rgba(0, 0, 0, .1) !important;
        }
    }
    // 消息发送失败的话,前面添加一个发送失败的icon
    .msg-send-err-icon {
        position: absolute;
        top: calc(50% - 8px);
        left: -20px;
    }
    // 间隔线
    .line::after {
        background-color: #ECEEF4;
        display: block;
        content: '';
        height: 1px;
        width: 30px;
        margin: 8px 0;
    }

    .poptip-item {
        padding: 0 12px;
        line-height: 30px;
    }
    // video::-webkit-media-controls {
    //     display:none !important;
    // }
    .cover-img-box {
        max-width: 300px;

        .cover-img {
            max-width: 100%;
            max-height: 300px;
            object-fit: cover;
            vertical-align: bottom;
        }
    }
    pre {
        font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, "\5FAE\8F6F\96C5\9ED1", Arial, sans-serif;
        word-break: break-word;
    }

    .u-msg:hover .pop-tip .msg-more {
        // display: inline-block;
        visibility: visible;
    }
    .item-me .msg-more {
        margin-top: 15px;
    }
    .item-you .msg-more {
        margin-top: -26px;
    }
    .item-me /deep/ .pop-tip {
        position: static;
    }
    .message-file {
        display: flex;
        align-items: center;
    }
    .message-file-name {
        width: 238px;
        margin: 0 15px 0 10px;
        overflow : hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
    .whatsapp-translate-poptip {
        right: auto !important;
        // top: 75px;
    }


    .waMsgItem-desc {
        margin-top: 10px;
        white-space: break-spaces;
    }
    .waMsg-accountName {
        margin-bottom: 6px;
        font-size: 12px;
        color: rgba(0,0,0,0.80);
        letter-spacing: 0;
        line-height: 18px;
        font-weight: 400;
    }

</style>

<style lang="less">
    .pop-box {
        padding: 10px 0 !important;
    }

    .u-msg.session-chat.item-me .waMsgItem-readStatus {
        position: absolute;
        bottom: 5px;
        right: 0px;
    }
    .u-msg {
        text-align: center;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.28);
    }
</style>
<style scoped lang="less">
  // 通话短信样式
  .item-you{
    .calling_sms_msg_item{
        float: left;
        margin-left: 0px;
    }
  }
  .calling_sms_msg_item{

        float: right;
        margin-right: 0;
        margin-left: 10px;
        background: #FFFFFF;
        border: 1px solid rgba(171, 191, 213, 0.6);
        border-radius: 12px;
        overflow: hidden;
        .callstatus{
            font-weight: 500;
            font-size: 14px;
            // line-height: 22px;
            padding: 0px 10px;
            height: 37px;
            min-width: 138px;
            text-align: left;
            color: #EA4335;
            display: flex;
            align-items: center;
        }
        .redColor{
            color: #EA4335;
            margin-right: 3px;
        }
        .custom-weijiedianhua:before{
                color: inherit;
            }
        .go_view_call_detail{
            text-align: left;
            font-weight: 400;
            font-size: 14px;
            // line-height: 22px;
            color: #3B78DE;
            height: 37px;
            display: flex;
            align-items: center;
            padding: 0 10px;
            background: #F5F6F9;
            min-width: 138px;
            cursor: pointer;
            .custom-HideRight{
                font-size: 12px;
                margin-left: 15px;
            }
        }
        .blueStatus{
            color: #3B78DE;
        }
 }
</style>
