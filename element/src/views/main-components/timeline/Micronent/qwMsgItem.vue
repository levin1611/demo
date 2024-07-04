<template>
    <li v-show="!(msg.type != 10000 && msg.isRevoke)" :id="`waMsgItem-${msg.msgId}-${msg.type}`"
        class="u-msg session-chat "
        :class="[classObject,classSystem]"
    >
        <div v-if="msg.type==='timeTag'">{{msg.showText}}</div>
        <div v-else-if="msg.type==='tip'" class="tip">{{msg.showText}}</div>

        <!-- 时间 -->
        <p v-if="msg.showTimeTag"
           class="message-time"> {{ msg.timeStamp | timeFormat('DateTime') }} </p>

        <div style="overflow: hidden;text-align: left;position: relative;padding: 0 20px;"
            :style="{paddingLeft: classObject==='item-you'?'40px;':'20px',
            display:
            msg.type == 10000?
            'none':'block'}"
        >
            <!-- 点击多选后,这个CheckBox会出现 -->
           
            <!-- 头像 + CRM 状态 -->
            <a
               style="cursor: default;"
               v-if="msg.type != 10000"
               class="msg-head">
                <!-- 群组成员数据头像 -->
                <img v-if="isGroup && senderAccountInfo && senderAccountInfo.avatar"
                             :src="senderAccountInfo.avatar"
                             class="waMsgItem-avatar">
                        <!-- 头像 -->
                        <img v-else-if="msg.fromUserAvatar"
                             :src="msg.fromUserAvatar"
                             class="waMsgItem-avatar">
                        <!-- 默认头像 -->
                        <svg v-else
                             aria-hidden="true"
                             :class="{'relatedDetail-avatar': fromFlag === 'waRelatedDetail'}"
                             class="waMsgItem-avatar">
                            <use xlink:href="#custom-visitor-avatar"></use>
                 </svg>
                <!-- CRM 状态 -->
                <div v-if="!msg.fromMe && senderAccountInfo && senderAccountInfo.leadscloudStatus"
                     class="waMsgItem-crmStatus">
                    <!-- 询盘图标 -->
                    <svg v-if="senderAccountInfo.leadscloudStatus.status == 2"
                         aria-hidden="true"
                         class="svg-icon WA-group-member-status-icon">
                        <use xlink:href="#custom-inquiry-sec"></use>
                    </svg>

                    <!-- 线索图标 -->
                    <svg v-else-if="senderAccountInfo.leadscloudStatus.status == 1"
                         aria-hidden="true"
                         class="svg-icon WA-group-member-status-icon">
                        <use xlink:href="#custom-clue-sec"></use>
                    </svg>
                </div>
            </a>

            <!-- 已读/未读状态(非群聊对话 + 消息是'我'发的才显示状态图标) -->
            <span v-if="!isGroup && classObject === 'item-me'"
                  class="waMsgItem-readStatus">
                <Icon :custom="getReadStatusIcon(msg.readFlag)"></Icon>
            </span>

            <!-- 账号名 -->
            <div v-if="isGroup && !msg.fromMe"
                 class="waMsg-accountName">
                <template v-if="senderAccountInfo">{{$options.filters.isNameLengthTooLong(senderAccountInfo.name, 15)}}</template>
                <template v-else-if="msg.fromWaName">{{$options.filters.isNameLengthTooLong(msg.fromQwName, 15)}}</template>
                <template v-else-if="msg.fromWaAccount">{{$options.filters.isNameLengthTooLong(msg.fromQwName, 15)}}</template>
            </div>

            <!-- 消息体 -->
            <div :class="{'notText-bgColor-white': !['1', '9'].includes(msg.type)}"
                 class="msg-text">

                <!-- 引用消息 -->
                <!-- <div v-if="msg.quotedMessage"
                     style="padding-bottom: 8px; margin-bottom: 8px; border-bottom: 1px solid #F2DACD;">
                    <WaQuoteMsg :rawMsg="msg.quotedMessage"
                                :whatsAppAccountInfo="whatsAppAccountInfo"
                                :isGroup="isGroup"
                                :groupInfo="groupInfo"
                                :scrollable="true"
                                v-bind="$attrs"
                                v-on="$listeners"></WaQuoteMsg>
                </div> -->

                <!-- 文本 -->
                <div v-if="msg.type == 1"
                     >
                    <pre v-html="msg.showText"
                         style="margin: 0"></pre>
                    <pre v-if="msg.showText.length > 7000 && !msg.fromMe"
                         style="color:#4285f4;margin: 0;">{{ $t('whatsapp_manage.limitTextOverTip') }}</pre>
                   
                </div>

                <!-- 图片 -->
                <div v-else-if="msg.type == 2"
                     class="cover-img-box padding-10">
                    <Icon v-if="msg.url && msg.url.endsWith('/image.notfind.jpg')"
                          custom="custom-icon_picn"
                          class="expired-media-icon"></Icon>
                
                    <img v-else
                         :src="msg.url"
                         @click.stop="viewMedia($event)"
                         @load="handleImgOrVideoLoad"
                         class="cover-img">
                </div>

                <!-- 附件 -->
                <div v-else-if="msg.type == 3"
                    >
                    <div class="message-file whatsapp-manage-download">
                        <Icon :custom="msg.attachmentIcon"
                              size="44"></Icon>
                        <Tooltip :content="msg.showText"
                                 placement="top">
                            <div v-html="msg.showText"
                                 class="message-file-name"></div>
                        </Tooltip>
                        <Icon v-if="fromFlag !== 'waRelatedDetail'"
                              custom="custom custom-file-download"
                              size="14"
                              @click="downloadFile(msg.url,msg.content)"
                              style="cursor:pointer;float:right;line-height: 48px;"></Icon>
                    </div>
                </div>

                <!-- video -->
                <template v-else-if="msg.type == 4">
                    <!-- 同步失败 -->
                    <div v-if="msg.url && msg.url.endsWith('/video.mp4.notfind.jpg')">
                        <Icon custom="custom-video-play"
                              class="expired-media-icon"></Icon>

                        <!-- 描述信息 -->
                        <div class="waMsgItem-desc">{{ $t('whatsapp_manage.videoExpiredTip') }}</div>
                    </div>
                    <!-- 原视频 -->
                    <div v-else-if="msg.url.length > 1"
                         ref="mediaMsg"
                         class="padding-10">
                        <video controls
                               height="220"
                               @resize="handleImgOrVideoLoad"
                               @click.prevent="viewMedia($event)">
                            <source :src="msg.url"
                                    type="video/ogg">
                            <source :src="msg.url"
                                    type="video/mp4">
                            <source :src="msg.url"
                                    type="video/3gp">
                            Sorry, your browser doesn't support embedded videos.
                        </video>
                    </div>
                </template>

                  <!-- h5链接 -->
                  <div v-else-if="msg.type == 5"
                    >
                    <div class="carBodyh5" @click="openH5Link">
                        <div class="body_grmph5">
                            <img :src="msg.thumburl" >
                            <div class="txt_detail">
                                <div class="title_detail">{{msg.text}}</div>
                                <div class="des_detail">{{msg.des}}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- audio -->
                <div v-else-if="msg.type == 9 && msg.url"
                     style="line-height: 0;"
                     >
                    <audio :src="msg.url"
                           controls
                           controlslist="nodownload"></audio>
                </div>
                <!-- 表情 -->

                <div v-else-if="msg.type == 6"
                     v-html="msg.showText"
                    ></div>
                <!-- contact 名片 -->
                <div v-else-if="msg.type == 7"
                    >
                    <div class="carBody">
                        <div class="body_grmp">
                            <img :src="msg.showText.avatar" >
                            <span>{{msg.showText.nickname}}</span>
                        </div>
                        <p>个人名片</p>
                    </div>
                </div>
                <!-- 小程序 -->
                <div v-else-if="msg.type == 8"
                    >
                    <div class="xiaochengxu">
                       小程序
                       <div class="head_xcx">
                        <img :src="msg.showText.icon" alt="">
                        <span class="txt_xcx">{{ msg.showText.description }}</span>
                       </div>
                       <div class="body_xcx">
                            <p class="txt_xcx">{{ msg.showText.title }}</p>
                            <img :src="msg.showText.thumburl" alt="">
                       </div>
                       <div class="botom_xcx">
                            <img src="http://superqv.zshud.com/static/img/applet2.ee8d3aed.png" width="12" alt="">
                            <span class="txt_xcx">小程序</span>
                       </div>
                    </div>
                </div>

                <!-- 视频号 -->
                <div v-else-if="msg.type == 10"
                    >
                    <!-- 暂不支持的消息类型 -->
                    <div class="xiaochengxu">
                       视频号
                       <div class="head_xcx">
                        <img :src="msg.showText.icon" alt="">
                        <span class="txt_xcx">{{ msg.showText.description }}</span>
                       </div>
                       <div class="body_xcx">
                            <p class="txt_xcx">{{ msg.showText.title }}</p>
                            <img :src="msg.showText.thumburl_1" alt="">
                       </div>
                       <div class="botom_xcx">
                            <img src="http://superqv.zshud.com/static/img/applet3.88f73bc0.png" width="12" alt="">
                            <span class="txt_xcx">视频号</span>
                       </div>
                    </div>
                </div>

              
                <!-- 其他 -->
                <div v-else
                     v-html="msg.showText"
                    ></div>

                <span v-if="msg.status === 'fail'"
                      class="msg-failed">
                    <i class="weui-icon-warn"></i>
                </span>

              
            </div>
        </div>

        <!-- // 系统消息提示 -->
        <div v-if="msg.type == 10000"
                    >
                    {{ msg.showText }}
        </div>
    </li>
</template>

<script type="text/javascript">
    // import util from '@/libs/util';
    // import Vue from 'vue';
    import { getMediaList, generateOSSDownloadUrl } from '@/api/whatsapp';
    import { mapState } from 'vuex';
    // import WaQuoteMsg from '@/views/whatsapp-manage/components/waQuoteMsg';

    export default {
        inheritAttrs: false,
        components: {
            // WaQuoteMsg
        },
        props: {
            // 时间轴CRM查看聊天记录
            // 1. 如果此时账号为超管查看:下属模式
            // 2. 如果此时账号为非超管:正常模式
            // 时间轴非超管查看聊天记录(撤回、删除都不允许看到)
            timeLineStatus: {
                type: Boolean,
                default: false
            },
            // 当前账号信息
            currAccountInfo: {
                type: Object,
                default() {
                    return {};
                }
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
            whatsAppAccountInfo: {
                type: Object,
                default() {
                    return {};
                }
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
        data() {
            return {
                msg: {}
            };
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                orgId: state => state.enterpriseId
            }),
            classObject() {
                return this.msg.fromMe ? 'item-me' : 'item-you';
            },
            // 系统消息
            classSystem() {
                return this.msg.type == 10000 ? 'item_system' : '';
            },
            // 从群组信息中获取当前消息发送人账号信息
            senderAccountInfo() {
                if (this.groupInfo && Array.isArray(this.groupInfo.memberList)) {
                    return this.groupInfo.memberList.find(item => item.member_wxid === this.rawMsg.chatroomUser);
                }
                return null;
            }
        },
        beforeMount() {
            this.$forceUpdate();
            const item = Object.assign({}, this.rawMsg);
            // 1=文字 2=图片 3=文件 4=视频 5=H5链接卡片 6=表情 7=名片 8=小程序 9=语音 10=视频号 10000=系统消息（撤回/进群提醒等）
            let url;

            switch (item.type) {
                case 'timeTag':
                    // 标记发送的时间

                    item.showText = item.text;
                    break;
                case 1:
                    // 文本消息 text
                    // 识别链接
                    item.showText = item.text.replace(/((https|http):\/\/[\S.\/]+)(?![^<]+>)/gi, '<a href=\'$1\' target=\'_blank\'>$1</a>');
                    break;
                case 2:
                    // 原始图片全屏显示 image
                    item.showText = item.text;
                    // item.showText = (item.text || '').replace(/((https|http):\/\/[\S.\/]+)(?![^<]+>)/gi, '<a href=\'$1\' target=\'_blank\'>$1</a>');
                    break;
                case 3:
                    // document

                    // item.fileLink = item.contentQiniuUrl;
                    //                item.showText = utils.escape(item.file.name)
                    item.showText = item.fileName;
                 
                    item.attachmentIcon = this.getAttachmentIcon(item.file_type);
                    break;
                case 4:
                    // video
                    item.showText = item.text;
                    break;
                case 5:
                    item.showText = item.url.replace(/((https|http):\/\/[\S.\/]+)(?![^<]+>)/gi, '<a href=\'$1\' target=\'_blank\'>$1</a>');
                    // audio
                    break;
                case 6:
                    // contact

                    // item.showText = utils.generateChatroomSysMsg(item);
                    item.showText = `<img class='gifImg' src=${item.text} />`;
                    break;
                
                case 7:
                    // contact
                     
                    // item.showText = utils.generateChatroomSysMsg(item);
                    item.showText = JSON.parse(item.text);
                    break;
                case 8:
                    // contact

                    // item.showText = utils.generateChatroomSysMsg(item);
                    item.showText = JSON.parse(item.text);
                    break;
                case 9:
                    // 语音

                    // item.showText = utils.generateChatroomSysMsg(item);
                    item.showText = item.text;
                    break;
                case 10:
                    // contact
                    // item.showText = utils.generateChatroomSysMsg(item);
                    item.showText = JSON.parse(item.text);
                    break;
                case 10000:
                    // 系统消息
                    item.showText = item.text;
                    break;
                default:
                    item.showText = this.$t('whatsapp_manage.nonsupportTip');
            }
            this.msg = item;
        },
        mounted() {
        },
        methods: {
            // 下载附件
            downloadFile(path, name) {
                // 如果是七牛附件地址, 按七牛的附件下载方式来
                if (/^(https|http):\/\/content\.leadscloud\.com\//.test(path)) {
                    window.open(`${path}?attname=${encodeURIComponent(name)}`, '_self');
                    return;
                }
                window.open(path, '_blank');
                // 其他, 默认按阿里 oss 文件, 调用接口下载
                // this.downloadOSSFile(path, name);
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
            // 图片预览
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            },
            // 图片/视频加载后, 控制图片/视频下方的描述信息文本宽度与图片/视频保持一致
            handleImgOrVideoLoad(e) {
                // 获取描述信息元素
                const descNode = e.target.parentElement.querySelector('.waMsgItem-desc');

                // 赋值视频/图片宽度给描述信息元素
                if (descNode) {
                    const width = e.target.offsetWidth + 1;
                    descNode.style.width = `${width > 30 ? width : 30}px`;
                }

                // 向上传递"媒体消息加载完毕"事件
                this.$emit('mediaLoad');
            },

            // 获取最后一条消息的发送状态对应的 icon class
            getReadStatusIcon(readFlag) {
                let icon = 'custom';

                switch (readFlag) {
                    case 0:
                        // 待投递状态
                        icon += ' custom-tobeDelivered';
                        break;
                    case 1:
                        // 已送达给对方，但对方未接收
                        icon += ' custom-delivered-and-unreceived';
                        break;
                    case 2:
                        // 已送达给对方，对方已接收
                        icon += ' custom-delivered-and-received';
                        break;
                    case 3:
                        // 对方已读
                        icon += ' custom-haveRead';
                        break;
                }

                return icon;
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

            // 查看头像大图
            viewMedia(e) {
                let type;
                let url;
                switch (`${this.msg.type}`) {
                    case '2':
                        type = 'image';
                        url = e.target.src;
                        break;
                    case '4':
                        type = 'video';
                        url = this.msg.url;
                        break;
                    default:
                        return;
                }

                this.$store.commit('updateFullCarousel', {
                    baseMedia: {
                        type,
                        url,
                        id: this.msg.messageId,
                        timeStamp: this.msg.timeStamp
                    },
                    load: this.loadMoreMedia
                });
            },

            // 提供给图片/视频轮播(全局组件)加载更多数据的方法
            loadMoreMedia({ media, direction }) {
                return new Promise((resolve, reject) => {
                    // 请求参数处理
                    const postData = {
                        orgId: this.orgId,
                        userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount, // 用户绑定的wa账号
                        toWaAccount: this.isGroup ? this.msg.toWaAccount : this.msg.fromMe ? this.msg.toWaAccount : this.msg.fromWaAccount // 在聊的 wa 账号
                    };
                    if (direction === 'init') {
                        // 初始化, 不用传上/下一页
                    } else if (['left', 'prev'].includes(direction)) {
                        postData.number = 0; // 判断点上一页还是下一页  0上一页，1下一页
                    } else {
                        postData.number = 1; // 判断点上一页还是下一页  0上一页，1下一页
                    }
                    if (media.id) {
                        postData.messageId = media.id;
                    }

                    // 发送请求
                    getMediaList(postData).then(res => {
                        if (res.code === 1 && Array.isArray(res.data)) {
                            // 数据为空, 弹出提示语
                            if (!res.data.length) {
                                this.$Message.success(this.$t('timeLine.noMore'));
                                return resolve([]);
                            }

                            // 数据处理并返回
                            return resolve(res.data.map(item => {
                                item.id = item.messageId;
                                item.url = item.contentQiniuUrl;
                                if (item.contentThumbnail) {
                                    item.thumbnailUrl = `data:image/png;base64,${item.contentThumbnail}`;
                                }
                                item.originalType = item.type;
                                switch (`${item.type}`) {
                                    case '2':
                                        item.type = 'image';
                                        break;
                                    case '4':
                                        item.type = 'video';
                                        break;
                                }

                                return item;
                            }));
                        } else {
                            // 请求失败提示

                            this.$Message.error(this.$t('mail.writeLetter.addContactModal.requestErrorTip'));
                            return resolve(null);
                        }
                    }).catch(error => {
                        console.log(error);
                        return resolve(null);
                    });
                });
            },
            openH5Link() {
                window.open(this.msg.url);
            }
        },
        watch: {
        }
    };
</script>

<style scoped lang="less">
    // 消息发送失败的话,前面添加一个发送失败的icon
    .msg-send-err-icon {
        position: absolute;
        top: calc(50% - 8px);
        left: -20px;
    }
    // 模板消息
    .wa-template-message-content {
        // width: 137px;
        // height: 593px;
        // background: #FFFFFF;
        border-radius: 8px;
        padding: 10px;
        //margin: 20px 0;

        .message-title {
            height: 28px;
            font-weight: 500;
            font-size: 18px;
            line-height: 28px;
        }
        .message-title {
            height: 28px;
            font-weight: 500;
            font-size: 18px;
            line-height: 28px;
            margin-bottom: 12px;
        }

        .message-head {
            display: flex;
            justify-content: center;
            text-align: center;

            video, img {
                height: 100%;
                width: 100%;
            }

            div {
                margin-bottom: 12px;
            }
        }

        .message-body {
            color: rgba(0, 0, 0, .8);
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            white-space: pre-line;
            // line-height: 22px;
            //margin-bottom: 12px;
        }

        .message-foot {
            margin-bottom: 12px;
            .text {
                color: rgba(0, 0, 0, .6);
            }
            .link {
                color: #4285F2;
                font-weight: 400;
                font-size: 14px;
            }
        }

        .message-btn-list {
            display: flex;
            justify-content: space-around;
            margin-top: 10px;
            .btn {
                border: 1px solid #4285F2;
                color: #4285F2;
                padding: 8px 12px;
                border-radius: 8px;
                font-weight: 500;
                font-size: 14px;
                margin-right: 10px;
            }
            .btn:last-child {
                margin-right: 0;
            }
        }
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
    .expired-media-icon {
        font-size: 40px;
        color: #a9b9c9;
        display: block;
        margin: 10px 0;
        text-align: center;
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
    .whatsapp-translate-poptip__lower {
        // top: 100px;
    }

    .notText-bgColor-white {
        background-color: #fff !important;
        color: rgba(0, 0, 0, .8) !important;
        border: 1px solid #eaeaea !important;
        border-radius: 4px;
    }

    .waMsgItem-desc {
        margin-top: 10px;
        white-space: break-spaces;
    }

    .quoted-msg__highlight {
        /deep/ .msg-text {
            border-color: rgba(0, 0, 0, .1) !important;
            background-color: rgba(0, 0, 0, .1) !important;
        }
    }

    .msg-text {
        /deep/ .waQuoteMsg-mainContent {
            padding: 0 8px;
        }
        /deep/  .aiteMember{
                color:#3b78de
        }
    }

    .waMsg-accountName {
        margin-bottom: 6px;
        font-size: 12px;
        color: rgba(0,0,0,0.80);
        letter-spacing: 0;
        line-height: 18px;
        font-weight: 400;
    }
    /deep/.gifImg{
        width: 100%;
    }
    .carBody{
       .body_grmp{
        width: 180px;
        display: flex;
            img{
                width: 80px;

            }
            span{
                margin-left: 10px;
            }
       }
    }
    .carBodyh5{
        cursor: pointer;
        .body_grmph5{
        width: 250px;
        display: flex;
            img{
                width: 80px;

            }
            .txt_detail{
                margin-left: 10px;
                .title_detail{
                    font-size: 14px;
                    font-weight: 600;
                }
                .des_detail{
                    font-size: 14px;
                }
                div{
                    width: 80%;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }
            }
       }
    }
    .xiaochengxu{
        .head_xcx{
            display: flex;
            img{
                width: 20px;
            }
        }
        .body_xcx{
            border-bottom: 1px solid #ccc;
            img{
                width: 100%;
                height: 128px;
                object-fit: cover;
            }
        }
        .botom_xcx{

        }
        .txt_xcx{
            font-size: 12px;
            margin-left: 10px
        }
    }
</style>

<style lang="less">
    @import "../../../xhl-chat/components/chat-item.css";
    .select-msg-item {
        background: #EFF1F5;
    }

    .pop-box {
        padding: 10px 0 !important;
    }

    .u-msg.session-chat.item-me .waMsgItem-readStatus {
        position: absolute;
        bottom: 5px;
        right: 65px;
    }

    .waMsgItem-crmStatus {
        position: absolute;
        top: 26px;
        left: 28px;
        pointer-events: none;

        svg {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: #FFF;
        }
    }

    .waMsgItem-avatar {
        width: 40px !important;
        height: 40px !important;
        border-radius: 50%;
        vertical-align: middle;
        fill: currentColor;
        overflow: hidden;
    }

 

    .waMsgItem-headerPop {
        padding: 6px 0;

        .waMsgItem-headerPop-item {
            font-size: 12px;
            letter-spacing: 0;
            line-height: 18px;
            font-weight: 500;
            padding: 6px 12px;
            cursor: pointer;

            &:hover {
                background: #F3F4F7;
                color: #4285F4;
            }
        }
    }
   
</style>
