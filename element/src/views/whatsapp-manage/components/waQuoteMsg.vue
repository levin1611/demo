<template>
    <div @click="scrollToMsg"
         :class="{ 'cursor-pointer': scrollable, 'waQuoteMsg__fromMe': msg.fromMe, 'waQuoteMsg__fromOthers': !msg.fromMe}"
         class="waQuoteMsg">
        <!-- 内容/描述 -->
        <div class="waQuoteMsg-mainContent">
            <!-- 名称 -->
            <div class="waQuoteMsg-accountName">{{ accountName }}</div>

            <!-- 内容 -->
            <div class="waQuoteMsg-content">
                <!-- 文本 -->
                <div v-if="msg.type === '1'">
                    <pre v-html="msg.showText"
                         class="waMsgItem-text"></pre>
                </div>

                <!-- 图片 -->
                <div v-else-if="msg.type === '2'">
                    <!-- 描述信息/文件类型 -->
                    <div class="waMsgItem-desc" v-html="$t('crm.Table.col_whatsapp_message_type2') + (msg.content? msg.content: '')"></div>
                </div>

                <!-- 附件 -->
                <div v-else-if="msg.type === '3'">
                    <div class="message-file whatsapp-manage-download">
                        <!-- 文件类型图标 -->
                        <Icon :custom="msg.attachmentIcon"
                              size="36"></Icon>

                        <!-- 文件名/描述信息 -->
                        <TooltipAuto :content="msg.content"
                                     placement="top">
                            <div class="message-file-name" v-html="(msg.content? msg.content: '')"></div>
                        </TooltipAuto>
                    </div>
                </div>

                <!-- 视频 -->
                <div v-else-if="msg.type === '4'">
                    <!-- 描述信息/文件类型 -->
                    <div class="waMsgItem-desc" v-html="$t('crm.Table.col_whatsapp_message_type4') +  formatDuration(msg.seconds)   + (msg.content? msg.content: '') "></div>
                </div>

                <!-- audio -->
                <div v-else-if="msg.type === '5'">
                    <!-- 描述信息/文件类型 -->
                    <div class="waMsgItem-desc">{{ $t('crm.Table.col_whatsapp_message_type5') }} {{ formatDuration(msg.seconds) }}</div>
                </div>

                <!-- contact 名片 -->
                    <!-- 图片 -->
                <div v-else-if="msg.type === '6'">
                    <!-- 描述信息/文件类型 -->
                    <div class="waMsgItem-desc">
                        {{ $t('whatsapp_manage.cardType2') }}{{ msg.card_info.name || '+'+msg.card_info.phone }}
                    </div>
                </div>
                <!-- 其他 -->
                <div v-else
                     v-html="msg.showText"></div>
            </div>
        </div>

        <!-- 右侧缩略图 -->
        <div v-if="['2', '4'].includes(msg.type)"
             class="waQuoteMsg-thumbnail">
            <img :src="`data:image/png;base64,${msg.contentThumbnail}`"
                 class="waQuoteMsg-thumbnail-img">
        </div>
        <div v-if="['6'].includes(msg.type)"
             class="waQuoteMsg-thumbnail" >
                        <svg 
                            style="height: 36px;width: 36px;"
                             aria-hidden="true"
                             >
                            <use xlink:href="#custom-visitor-avatar"></use>
                        </svg>
        </div>
    </div>
</template>

<script>
    import {getNickNameByMsgId} from '@/api/whatsapp';
    export default {
        name: 'waQuoteMsg',
        props: {
            // 当前登录的 WA 账号信息
            whatsAppAccountInfo: {
                type: Object,
                default() {
                    return {};
                }
            },
            // 消息原始数据
            rawMsg: {
                type: Object,
                default() {
                    return {};
                }
            },
            // 聊天另一方的名称(在询盘云中的名称, 或 wa 号)
            nick: {
                type: String,
                default: ''
            },
            // 是否允许点击滚动聊天框, 显示出被引用消息
            scrollable: {
                type: Boolean,
                default: false
            },
            // 是否是群组内的消息
            isGroup: {
                type: Boolean,
                default: false
            },
            // 群组信息
            groupInfo: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        computed: {
            accountName() {
                // 回复WABA模板消息的话,不显示顶部
                if (this.whatsAppAccountInfo.tag === 'WABA') {
                    return;
                }

                // 来自"我"
                if (this.msg.fromMe) {
                    return this.$t('whatsapp_manage.fromMe');
                }

                // 否则, 有"来自于xx"信息
                if (this.msg.fromWaName) {
                    return this.msg.fromWaName;
                }

                // 否则, 是群组消息
                if (this.isGroup) {
                    // 判断是否有账号信息
                    if (this.rawMsg.participant) {
                        if (this.groupInfo && Array.isArray(this.groupInfo.memberList)) {
                            // 如果群成员中有此账号

                            // 从群组成员中筛出当前 wa 账号对应的群成员
                            const groupMember = this.groupInfo.memberList.find(item => item.waAccount === this.rawMsg.participant);
                            // 返回群成员名称
                            if (groupMember) {
                                return groupMember.name;
                            }
                        }

                        // 群成员中无此账号, 则直接返回账号
                        return this.rawMsg.participant;
                    } else {
                        // 无账号信息, 数据有误, 先显示 '-' 占位
                        return '-';
                    }
                }

                // 上述条件都不满足, 返回当前 nick
                return this.nick;
            },
            orgId(){
                return this.$store.state.enterpriseId
            }
        },
        data() {
            return {
                msg: {}
            };
        },
        methods: {
            // 格式化 msg data 为指定格式
            handleMsg(item) {
                item.type = `${item.type}`;
                switch (item.type) {
                    case 'timeTag':
                        // 标记发送的时间

                        item.showText = item.text;
                        break;
                    case '1':
                        // 文本消息 text

                        // 识别链接
                        item.showText = item.content.replace(/((https|http):\/\/[\S.\/]+)(?![^<]+>)/gi, '<a href=\'$1\' target=\'_blank\'>$1</a>');
                        break;
                    case '2':
                        // 原始图片全屏显示 image
                        break;
                    case '3':
                        // document

                        // item.fileLink = item.contentQiniuUrl;
                        //                item.showText = utils.escape(item.file.name)
                        item.showText = item.content;
                        const url = decodeURI(item.contentQiniuUrl);
                        const tempArr = url.split('?')[0].split('/');
                        let type = '';
                        item.attachmentName = tempArr[tempArr.length - 1];
                        const nameArr = tempArr[tempArr.length - 1].split('.');
                        if (nameArr[nameArr.length - 1]) {
                            type = nameArr[nameArr.length - 1].toLowerCase();
                        }
                        item.attachmentIcon = this.getAttachmentIcon(type);
                        break;
                    case '4':
                        // video
                        break;
                    case '5':
                        // audio
                        break;
                    case '6':
                        try {
                            // 返回的卡片报文格式如下  如果截取不到那就是发生了变化 需要重新找到规则截取
                            // ""BEGIN:VCARD↵VERSION:3.0↵PRODID:ez-vcard 0.11.3↵FN:赵 展↵TEL;TYPE=CELL;WAID=8618612012113:+8618612012113↵X-WA-BIZ-NAME:鑫互联↵END:VCARD↵""
                            const contentStr = item.content.replace(/(\n|\r|\r\n|↵)/g, '|');
                            const contentArr = contentStr.split('|');
                            const contact = {
                            }
                            if(!contentArr.length) {
                                throw Error('没有获取到消息截取之后的数组',contentStr)
                            } else {
                                contentArr.forEach(ele => {
                                if( ele.indexOf('FN:')!= -1) {
                                    contact.name =  ele.split('FN:')[1]
                                }
                                if(ele.indexOf('WAID=') != -1) {
                                        const phoneInfo = ele.split('WAID=')[1];
                                    if(phoneInfo ) {
                                        contact.phone = phoneInfo.split(':')[0]
                                    }
                                }
                                })
                            }
                            item.showText = this.$t('whatsapp_manage.nonsupportTip');
                            item.card_info = contact;
                        } catch (error) {
                            console.log(error);
                            item.showText = this.$t('whatsapp_manage.nonsupportTip');
                        }
                        console.log(item,'ddddddd');
                        break;
                    default:
                        item.showText = this.$t('whatsapp_manage.nonsupportTip');
                }

                return item;
            },
            // 获取文件对应 Icon
            getAttachmentIcon(ext) {
                switch (ext) {
                    case 'gif':
                        return 'custom custom-file-gif';
                    case 'jpg':
                    case 'jpeg':
                        return 'custom custom-file-jpg';
                    case 'png':
                        return 'custom custom-file-png';
                    case 'pdf':
                        return 'custom custom-file-pdf';
                    case 'xls':
                    case 'xlsx':
                        return 'custom custom-file-xls';
                    case 'mp4':
                        return 'custom custom-file-mp4';
                    case 'mp3':
                        return 'custom custom-file-mp3';
                    case 'txt':
                        return 'custom custom-file-text';
                    case 'ppt':
                    case 'pptx':
                        return 'custom custom-file-ppt';
                    case 'bmp':
                        return 'custom custom-file-bmp';
                    case 'zip':
                    case 'rar':
                        return 'custom custom-file-zip';
                    case 'doc':
                    case 'docx':
                        return 'custom custom-file-doc';
                    case 'ai':
                        return 'custom custom-file-ai';
                    case 'dwg':
                        return 'custom custom-file-dwg';
                    default:
                        return 'custom custom-file-other';
                }
            },
            // 将视频秒数转换为时长
            formatDuration(second) {
                let result = '';
                if (second && Number.isInteger(second)) {
                    const hour = Math.floor(second / 3600);
                    const elseMinAndSec = Math.floor(second % 3600);
                    const min = Math.floor(elseMinAndSec / 60);
                    const sec = Math.floor(elseMinAndSec % 60);
                    result = `${min > 9 ? min : `0${min}`}:${sec > 9 ? sec : `0${sec}`}`;
                    if (hour) {
                        result = `${hour}:${result}`;
                    }
                }
                return result;
            },
            // 点击引用消息, 要求聊天框滚动到引用消息处
            scrollToMsg() {
                if (this.scrollable) {
                    this.$emit('scrollToQuoteMsg', this.rawMsg);
                }
            }
        },
        watch: {
            'rawMsg.messageId': {
                handler(val) {
                    if (val) {
                        this.msg = this.handleMsg(this.rawMsg);
                        // console.log(this.msg,'this.ms');
                        getNickNameByMsgId({
                            orgId: this.orgId,
                            userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                            messageList: [val]
                        }).then(res => {
                            res.data.forEach(msg => {
                                if (msg.messageId && msg.messageId === val) {
                                    let {extendedJson} = msg;
                                    let {mentions} = JSON.parse(extendedJson);
                                    if (mentions) {
                                        Object.keys(mentions).forEach(key => {
                                            const reg = new RegExp('@'+key, 'g');
                                            try {
                                                this.msg.content = this.msg.content.replace(reg, `<span class="aiteMember">@${mentions[key]}</span>`)
                                                this.msg.showText = this.msg.showText.replace(reg, `<span class="aiteMember">@${mentions[key]}</span>`)
                                            } catch (error) {
                                                console.log(error);
                                            }
                                        });
                                        // $set 不起作用 不知道为什么
                                        // this.$set(this.msg, 'showText', this.msg.showText);
                                    }
                                }
                            });
                            this.msg = Object.assign({}, { ...this.msg, content: this.msg.content });
                            this.msg = Object.assign({}, { ...this.msg, showText: this.msg.showText });
                        });
                    }
                },
                immediate: true
            },
            msg: {
                handler(val ,bv) {
                    // console.log(val,bv);
                },
                deep: true
            }
        }
    };
</script>

<style scoped lang="less">
    .waQuoteMsg {
        border-left: 3px solid #E9D7CD;
        display: flex;
        width: 100%;

        .waQuoteMsg-mainContent {
            flex: 1;
            overflow: hidden;
        }

        .waQuoteMsg-thumbnail {
            display: flex;
            align-items: center;
            .waQuoteMsg-thumbnail-img {
                max-height: 20vh;
                max-width: 80px;
                Object-fit: cover;
            }
        }

        .waQuoteMsg-accountName {
            margin-bottom: 6px;
        }

        .waQuoteMsg-content {
            font-size: 12px;
            color: rgba(0,0,0,0.60);
            letter-spacing: 0;
            line-height: 18px;
            font-weight: 400;

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

            .message-file {
                display: flex;
                align-items: center;
            }
            .message-file-name {
                margin: 0 15px 0 10px;
                -webkit-box-orient: vertical;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                word-wrap: break-spaces;
                word-break: break-all;
            }

            .waMsgItem-text {
                margin: 0;
            }

            // 文字最多显示三行, 超出省略显示
            .waMsgItem-text {
                white-space: normal;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                -webkit-line-clamp: 3;
            }

            .waMsgItem-desc {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                word-wrap: break-spaces;
                word-break: break-all;
            }
        }
    }
</style>
