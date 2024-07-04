<template>
    <li :id="`waMsgItem-${msg.messageId}-${msg.type}`"
        class="u-msg session-chat "
        :class="classObject"
        :style="isHaveViewChatHistoryPermission"
        ref="msgLi"
        @mouseup="onSelect"
    >
        <div v-if="msg.type==='timeTag'">{{msg.showText}}</div>
        <div v-else-if="msg.type==='tip'" class="tip">{{msg.showText}}</div>

        <!-- 时间 -->
        <p v-if="msg.showTimeTag"
           class="message-time"> {{ msg.timeStamp | timeFormat('DateTime') }} </p>

        <div style="overflow: hidden;text-align: left;position: relative;padding: 0 20px;"
            :class="isSelectBox?'select-msg-item':''"
            :style="{paddingLeft: selectAll&&classObject==='item-you'?'40px;':'20px',
            display:
            msg.deleteFlag===3&&isSuperAdmin&&(Boolean(viewingSubWA)||timeLineStatus)?
            'block':
            msg.deleteFlag===3?
            'none':
            ''}"
        >
            <!-- 点击多选后,这个CheckBox会出现 -->
            <Checkbox
                :style="selectAll?'position: absolute;left: 20px;height: 14px;line-height: 14px;top: 50%;margin-top: -7px;':'display:none;'"
                @click.native.stop
                v-model="isSelectBox"
                @change="selectMsgBox($event, msg)"
            ></Checkbox>
            <!-- 头像 + CRM 状态 -->
            <a :style="selectAll && !msg.fromMe?'margin-left: 30px':''"
               style="cursor: default;"
               class="msg-head">
                <Poptip v-if="fromFlag !== 'waRelatedDetail'"
                        trigger="click"
                        placement="bottom-start"
                        width="150"
                        :disabled="Boolean(viewingSubWA) || msg.fromMe || (fromFlag === 'timeline') || !senderAccountInfo"
                        popper-class="waMsgItem-headerPop">
                    <span slot="reference">
                        <!-- 群组成员数据头像 -->
                        <img v-if="isGroup && senderAccountInfo && senderAccountInfo.avatar"
                             :src="senderAccountInfo.avatar"
                             class="waMsgItem-avatar">
                        <!-- 头像 -->
                        <img v-else-if="msg.fromWaAvatar"
                             :src="msg.fromWaAvatar"
                             class="waMsgItem-avatar">
                        <!-- 默认头像 -->
                        <svg v-else
                             aria-hidden="true"
                             :class="{'relatedDetail-avatar': fromFlag === 'waRelatedDetail'}"
                             class="waMsgItem-avatar">
                            <use xlink:href="#custom-visitor-avatar"></use>
                        </svg>
                    </span>

                    <div v-if="senderAccountInfo">
                        <!-- 查看详情 -->
                        <div v-if="[1, 2].includes(senderAccountInfo.leadscloudStatus)"
                             @click="viewCrmDetail(msg.fromWaAccount)"
                             class="waMsgItem-headerPop-item piwik_whatsapp_viewCrmDetail">{{ $t('whatsapp_manage.viewDetail') }}</div>

                        <!-- 录入线索 -->
                        <div v-else
                             @click="enterClue(msg.fromWaAccount)"
                             class="waMsgItem-headerPop-item piwik_whatsapp_enterClue">{{ $t('chat.clueBtn') }}</div>

                        <!-- 私聊 -->
                        <div @click="toPrivateChat(msg.fromWaAccount)"
                             class="waMsgItem-headerPop-item piwik_whatsapp_toPrivateChat">{{ $t('whatsapp_manage.toPrivateChat') }}</div>
                    </div>
                </Poptip>

                <!-- CRM 状态 -->
                <div v-if="!msg.fromMe && senderAccountInfo"
                     class="waMsgItem-crmStatus">
                    <!-- 询盘图标 -->
                    <svg v-if="senderAccountInfo.leadscloudStatus === 1"
                         aria-hidden="true"
                         class="svg-icon WA-group-member-status-icon">
                        <use xlink:href="#custom-inquiry-sec"></use>
                    </svg>

                    <!-- 线索图标 -->
                    <svg v-else-if="senderAccountInfo.leadscloudStatus === 2"
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
                <template v-else-if="msg.fromWaName">{{$options.filters.isNameLengthTooLong(msg.fromWaName, 15)}}</template>
                <template v-else-if="msg.fromWaAccount">{{$options.filters.isNameLengthTooLong(msg.fromWaAccount, 15)}}</template>
            </div>

            <!-- 消息体 -->
            <div :class="{'notText-bgColor-white': !caption&&!['1', '9'].includes(msg.type), 'msg-card-info': ['6'].includes(msg.type)}"
                 class="msg-text">

                <!-- 引用消息 -->
                <div v-if="msg.quotedMessage"
                     style="padding-bottom: 8px; margin-bottom: 8px; border-bottom: 1px solid #F2DACD;">
                    <WaQuoteMsg :rawMsg="msg.quotedMessage"
                                :whatsAppAccountInfo="whatsAppAccountInfo"
                                :isGroup="isGroup"
                                :groupInfo="groupInfo"
                                :scrollable="true"
                                v-bind="$attrs"
                                v-on="$listeners"></WaQuoteMsg>
                </div>

                <!-- 文本 -->
                <div v-if="msg.type === '1'"
                     :style="fromFlag === 'waRelatedDetail' ? 'font-size: 12px;' : ''">
                    <pre v-html="msg.showText"
                         style="margin: 0"></pre>
                    <pre v-if="msg.showText.length > 7000 && !msg.fromMe"
                         style="color:#4285f4;margin: 0;">{{ $t('whatsapp_manage.limitTextOverTip') }}</pre>
                    <!-- 翻译内容 -->
                    <div v-if="translateText"
                         v-html="translateText"
                         ref="transbox"
                         class="text-border"></div>
                </div>

                <!-- 图片 -->
                <div v-else-if="msg.type === '2'"
                     :style="fromFlag === 'waRelatedDetail' ? 'font-size: 12px;' : ''"
                     class="cover-img-box padding-10">
                    <Icon v-if="msg.contentQiniuUrl && msg.contentQiniuUrl.endsWith('/image.notfind.jpg')"
                          custom="custom-icon_picn"
                          class="expired-media-icon"></Icon>
                    <img v-else-if="msg.contentQiniuUrl?.length <= 1"
                         :src="`data:image/png;base64,${msg.contentThumbnail}`"
                         @click.stop="viewMedia($event)"
                         @load="handleImgOrVideoLoad"
                         class="cover-img">
                    <img v-else
                         :src="msg.contentQiniuUrl"
                         @click.stop="viewMedia($event)"
                         @load="handleImgOrVideoLoad"
                         class="cover-img">

                    <template v-if="msg.deleteFlag !== 4">
                    <!-- 描述信息 -->
                    <div v-if="msg.contentQiniuUrl && msg.contentQiniuUrl.endsWith('/image.notfind.jpg')"
                         class="waMsgItem-desc">{{ $t('whatsapp_manage.imgExpiredTip') }}</div>
                    <template v-else-if="msg.showText">
                        <div v-html="msg.showText"
                             class="waMsgItem-desc"></div>
                        <!-- 翻译内容 -->
                        <div v-if="translateText"
                             v-html="translateText"
                             ref="transbox"
                             class="text-border"></div>
                    </template>
                    </template>
                </div>

                <!-- 附件 -->
                <div v-else-if="msg.type === '3'"
                    :class="[caption?'caption-style':'']"
                     :style="fromFlag === 'waRelatedDetail' ? 'font-size: 12px;' : ''">
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
                              @click="downloadFile(msg.contentQiniuUrl,msg.content)"
                              style="cursor:pointer;float:right;line-height: 48px;"></Icon>
                    </div>
                    <!-- 描述信息 -->
                    <template v-if="caption && msg.deleteFlag !== 4">
                        <template>{{ caption }}</template>
                    </template>
                </div>

                <!-- video -->
                <template v-else-if="msg.type === '4'">
                    <!-- 同步失败 -->
                    <div v-if="msg.contentQiniuUrl && msg.contentQiniuUrl.endsWith('/video.mp4.notfind.jpg')">
                        <Icon custom="custom-video-play"
                              class="expired-media-icon"></Icon>
                    <template v-if="msg.deleteFlag !== 4">
                        <!-- 描述信息 -->
                        <div class="waMsgItem-desc">{{ $t('whatsapp_manage.videoExpiredTip') }}</div>
                    </template>
                    </div>
                    <!-- 略缩图 -->
                    <div v-else-if="msg.contentQiniuUrl?.length <= 1"
                         ref="mediaMsg"
                         :style="fromFlag === 'waRelatedDetail' ? 'font-size: 12px;' : ''"
                         class="cover-img-box padding-10">
                        <img v-if="msg.contentQiniuUrl?.length <= 1"
                             :src="'data:image/png;base64,'+ msg.contentThumbnail"
                             @load="handleImgOrVideoLoad"
                             class="cover-img">

                        <!-- 描述信息 -->
                        <template v-if="msg.showText">
                            <div v-html="msg.showText && msg.deleteFlag !== 4"
                                 class="waMsgItem-desc"></div>
                            <!-- 翻译内容 -->
                            <div v-if="translateText"
                                 v-html="translateText"
                                 ref="transbox"
                                 class="text-border"></div>
                        </template>
                    </div>
                    <!-- 原视频 -->
                    <div v-else-if="msg.contentQiniuUrl?.length > 1"
                         ref="mediaMsg"
                         :style="fromFlag === 'waRelatedDetail' ? 'font-size: 12px;' : ''"
                         class="padding-10">
                        <video controls
                               height="220"
                               @resize="handleImgOrVideoLoad"
                               @click.prevent="viewMedia($event)">
                            <source :src="msg.contentQiniuUrl"
                                    type="video/ogg">
                            <source :src="msg.contentQiniuUrl"
                                    type="video/mp4">
                            <source :src="msg.contentQiniuUrl"
                                    type="video/3gp">
                            Sorry, your browser doesn't support embedded videos.
                        </video>

                        <!-- 描述信息 -->
                        <template v-if="msg.showText && msg.deleteFlag !== 4">
                            <div v-html="msg.showText"
                                 class="waMsgItem-desc"></div>
                            <!-- 翻译内容 -->
                            <div v-if="translateText"
                                 v-html="translateText"
                                 ref="transbox"
                                 class="text-border"></div>
                        </template>
                    </div>
                </template>

                <!-- audio -->
                <div v-else-if="msg.type === '5' && msg.contentQiniuUrl"
                     style="line-height: 0;"
                     :style="fromFlag === 'waRelatedDetail' ? 'font-size: 12px;' : ''">
                    <audio :src="msg.contentQiniuUrl"
                           controls
                           controlslist="nodownload"></audio>
                </div>

                <!-- contact 名片 -->
                <div v-else-if="msg.type === '6'"
                    >
                    <div v-if="msg.card_info.phone"  class="card_detail">
                        <div class="card_detail_name">
                            <svg 
                             aria-hidden="true"
                             class="waMsgItem-avatar">
                            <use xlink:href="#custom-visitor-avatar"></use>
                            </svg>  
                            <span>{{ msg.card_info.name || '+'+msg.card_info.phone }}</span>
                        </div>
                        <div class="replayMsgBymodal" @click="openGlobalWaReplyModal(msg.card_info.phone, $event)">
                                发消息
                        </div>
                        <!-- <div v-else class="replayMsgBymodal">
                            无效号码
                        </div> -->
                    </div>
              
                          <!-- 其他 -->
                <div v-else
                     :style="fromFlag === 'waRelatedDetail' ? 'font-size: 12px;' : ''">
                     {{ $t('whatsapp_manage.noncardgowavew') }}
                    </div>
                </div>

                <!-- 模板消息 -->
                <div v-else-if="msg.type === '9'">
                    <div class="wa-template-message-content">
                        <div v-for="(item, index) in msg.content.components" :key="index">
                            <template v-if="item.type === 'HEADER'">
                                <div class="message-head">
                                    <!-- 视频head -->
                                    <div v-if="item.format === 'VIDEO'">
                                        <video controls>
                                            <source :src="item.example.header_handle[0]" type="video/ogg">
                                            <source :src="item.example.header_handle[0]" type="video/mp4">
                                            <source :src="item.example.header_handle[0]" type="video/3gp">
                                            Sorry, your browser doesn't support embedded videos.
                                        </video>
                                    </div>
                                    <!-- 文本head -->
                                    <div v-else-if="item.format === 'TEXT'">
                                        <span>{{item.text}}}</span>
                                    </div>
                                    <!-- 非视频head(文档) -->
                                    <div v-else-if="item.format === 'DOCUMENT'" style="text-align: center;">
                                        <!-- <img :src="item.example.header_handle[0]"> -->
                                        <a :href="item.example.header_handle[0]" target="_blank">
                                            <svg class="svg-icon" aria-hidden="true" style="font-size: 70px;">
                                                <use xlink:href="#custom-PDF"></use>
                                            </svg>
                                        </a>
                                    </div>
                                    <!-- 非视频head(图片) -->
                                    <div v-else-if="item.format === 'IMAGE'">
                                        <img :src="item.example.header_handle[0]">
                                    </div>
                                </div>
                            </template>
                            <template v-if="item.type === 'BODY'">
                                <div class="message-body">{{item.text}}</div>
                            </template>
                            <template v-if="item.type === 'FOOTER'">
                                <div class="message-foot">
                                    <div>{{item.text}}</div>
                                </div>
                            </template>
                            <template v-if="item.type === 'BUTTONS'">
                                <div style="display: flex;align-items: center;justify-content: center;flex-direction: column;">
                                    <div class="message-btn-list">
                                        <div v-for="(itembtn, indexbtn) in item.buttons" :key="indexbtn" class="btn">
                                            {{itembtn.text}}
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- 其他 -->
                <div v-else
                     v-html="msg.showText"
                     :style="fromFlag === 'waRelatedDetail' ? 'font-size: 12px;' : ''"></div>

                <span v-if="msg.status === 'fail'"
                      class="msg-failed">
                    <i class="weui-icon-warn"></i>
                </span>

                <!-- 发送失败图标 -->
                <Tooltip v-if="msg.readFlag === -1 && msg.fromMe"
                         class="msg-send-err-icon">
                    <img src="@/styles/customFont/svg/msg-send-err.svg"
                         alt="消息发送失败"
                         @mouseenter="getSendErrReason"/>
                    <div slot="content">
                        <div v-if="loading_getSendErrReason"
                             style="position: relative;overflow: hidden;">
                            <Spin fix style="background: transparent;"></Spin>
                            {{ '\xa0\xa0\xa0\xa0' }}
                        </div>
                        <div v-else>{{ sendErrReason }}</div>
                    </div>
                </Tooltip>

                <!-- 文档描述 -->
                <div v-if="msg.deleteFlag === 4" class="edited-message-container">
                    <template v-if="['2', '3', '4'].includes(msg.type)">{{ caption }}</template>
                    <!-- 文本右下角已编辑 -->
                    <div v-if="msg.deleteFlag === 4" class="edited-content">{{ $t('edited') }}</div>
                </div>
            </div>

            <!-- 更多操作, 翻译等 readFlag===4 表示消息发送失败 -->
            <Poptip v-if="msg.readFlag !== 4 && fromFlag !== 'waRelatedDetail' && operateBtns.length > 0"
                    v-model="visible"
                    :popper-options="options"
                    placement="bottom-start"
                    width="150"
                    :disabled="operateBtns.length === 0"
                    popper-class="pop-box"
                    :class="{'whatsapp-translate-poptip__lower': senderAccountInfo && !msg.fromMe}"
                    class="pop-tip whatsapp-translate-poptip">
                <!-- reference -->
                <Button slot="reference"
                        type="text"
                        icon="el-icon-more"
                        class="msg-more"></Button>

                <!-- content -->
                <div class="api">
                    <div class="poptip-block" style="width: 100%;">
                        <!-- 翻译 -->
                        <template v-if="operateBtns.includes('translate')">
                            <!-- 选择语言 -->
                            <Poptip v-model="visible2"
                                    placement="right"
                                    class="lang-tip">
                                <div class="api">
                                    <div v-for="item in languageList"
                                         :key="item.value"
                                         @click="selectLang(item.value, msg)"
                                         class="lang-item whatsapp-manage-translatevisitor">{{ item.label }}</div>
                                </div>
                                <div class="poptip-item" slot="reference">{{$t('chat.langSelect')}}
                                    <Icon style="margin-left: 18px" type="arrow-right-b"></Icon>
                                </div>
                            </Poptip>

                            <!-- 翻译 -->
                            <div @click="translateChat(lastTransMemory, msg)"
                                 class="poptip-item whatsapp-manage-translatevisitor">{{$t('chat.translateDialog')}}{{getLastTransLanuage}}</div>

                            <!-- 取消翻译 -->
                            <div v-if="translateText"
                                 @click="clearTranslateContent(msg)"
                                 class="poptip-item">{{ $t('chat.cancelTranslate') }}</div>
                        </template>

                        <!-- 回复 -->
                        <div v-if="operateBtns.includes('reply') && !selectAll"
                             @click="triggerReply"
                             class="poptip-item">{{ $t('timeLine.reply') }}</div>

                        <!-- 下载 -->
                        <div v-if="operateBtns.includes('download') && !selectAll"
                             @click="triggerDownload(msg)"
                             class="poptip-item">{{ $t('mail.download') }}</div>

                        <!-- 间隔线 -->
                        <div v-if="!selectAll&&((this.$options.filters.calculateHoursBetweenTwoDates(msg.timeStamp) < 1 && !this.viewingSubWA) || !this.viewingSubWA)" class="line" style="padding: 0 12px;"></div>

                        <!-- baileys版撤回 -->
                        <div v-if="WAIsMd && msg.fromMe && operateBtns.includes('withdraw') && !selectAll&&(this.$options.filters.calculateHoursBetweenTwoDates(msg.timeStamp) < 1)"
                            @click="withdrawMsg(msg, 3)"
                            class="poptip-item">{{$t('whatsapp_manage.recall')}}</div>

                        <!-- java版撤回 -->
                        <div v-else-if="!WAIsMd && msg.fromMe && operateBtns.includes('withdraw') && !selectAll&&(this.$options.filters.calculateHoursBetweenTwoDates(msg.timeStamp) < 24)"
                            @click="withdrawMsg(msg, 3)"
                            class="poptip-item">{{$t('whatsapp_manage.recall')}}</div>

                        <!-- 删除 旧版本才有删除按钮 -->
                        <div
                            v-if="operateBtns.includes('delete') && !selectAll"
                            @click="withdrawMsg(msg, 2)"
                            class="poptip-item">{{$t('whatsapp_manage.delete')}}</div>

                        <!-- 多选 -->
                        <div
                            v-if="operateBtns.includes('choice')"
                            @click="selectMsgs"
                            class="poptip-item">{{$t('whatsapp_manage.select')}}</div>
                    </div>
                </div>
            </Poptip>
        </div>

        <!-- 1 超管查看撤回、删除时  2 超管在时间轴查看撤回、删除时 -->
        <div
            v-if="(isSuperAdmin&&timeLineStatus&&(msg.deleteFlag===2||msg.deleteFlag===3))||
                isSuperAdmin&&viewingSubWA&&(msg.deleteFlag===2||msg.deleteFlag===3)"
            :style="msg.fromMe?'right: 80px;':'left: 80px;'"
            style="position: absolute;color: #EA4335;">
            <span v-if="msg.deleteFlag===2">{{$t('whatsapp_manage.thisMessageHasBeenDeleted')}}</span>
            <span v-if="msg.deleteFlag===3">{{$t('whatsapp_manage.thisMessageHasBeenRetracted')}}</span>
        </div>

        <!-- 查看对方的撤回消息 -->
        <div v-else-if="!msg.fromMe&&!Boolean(viewingSubWA)&&msg.deleteFlag===3">
            <span v-if="!isGroup">{{$t('whatsapp_manage.theOtherParty')}}</span>
            <span v-else-if="isGroup&&senderAccountInfo">{{$options.filters.isNameLengthTooLong(senderAccountInfo.name, 15)}}</span>
            <span v-else-if="isGroup&&msg.fromWaName">{{$options.filters.isNameLengthTooLong(msg.fromWaName, 15)}}</span>
            <span v-else-if="isGroup&&msg.fromWaAccount">{{$options.filters.isNameLengthTooLong(msg.fromWaAccount, 15)}}</span>{{$t('whatsapp_manage.recallAMessage')}}
        </div>
        <!-- 查看自己的撤回消息 -->
        <div v-else-if="msg.fromMe&&!Boolean(viewingSubWA)&&msg.deleteFlag===3">
            {{$t('whatsapp_manage.youRecalledAMessage')}}
            <!-- 只有文本才能重新编辑 msg.type === '1' -->
            <span
                v-if="msg.fromMe && msg.type === '1' && (this.$options.filters.calculateHoursBetweenTwoDates(msg.timeStamp) < 24)"
                @click="reEditWithdrawMsg(msg)" style="color: #3B78DE;cursor: pointer;">{{$t('whatsapp_manage.Edit')}}
            </span>
        </div>
    </li>
</template>

<script type="text/javascript">
    import util from '@/libs/util';
    import Vue from 'vue';
    import { deleteMessage, saveTranslateMsg, deleteTranslateMsg, getMediaList, generateOSSDownloadUrl, getWaMsgSendErrInfo } from '@/api/whatsapp';
    import { mapState } from 'vuex';
    import translateLang from '@/mixins/translateLang';
    import globalWaReplyModal from '@/mixins/globalWaReplyModal';

    import WaQuoteMsg from '@/views/whatsapp-manage/components/waQuoteMsg';

    export default {
        inheritAttrs: false,
        mixins: [translateLang, globalWaReplyModal],
        components: {
            WaQuoteMsg
        },
        props: {
            transList: {
                type: Array
            },
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
            // 父组件重新编辑'撤回的消息'方法
            reEditWithdrawMsgF: {
                type: Function
            },
            // 要删除的消息列表
            handleDeleteMsg: {
                type: Function
            },
            // 要删除的消息列表
            deleteMsgGroup: {
                type: Array,
                default() {
                    return [];
                }
            },
            // 是否点击了多选功能
            selectAll: {
                type: Boolean,
                default: false
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
            // 正在回复的消息
            replyMsg: {
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
            },
            // 翻译记忆
            lastTransMemory: {
                type: String,
                default: 'zh'
            }
        },
        data() {
            return {
                transLang: '', // 如果这条消息翻译过了,这个字段表示当前消息储存的翻译语种

                caption: '', // 文档描述字段

                isSelectBox: false, // 是否选中CheckBox盒子
                visible: false,
                visible2: false,
                select: false,
                msg: {},
                translateText: '',
                langList: [
                    {
                        name: this.$t('lang.zh_CN'),
                        lang: 'zh_CN'
                    },
                    {
                        name: this.$t('lang.en'),
                        lang: 'en'
                    },
                    {
                        name: this.$t('lang.es'),
                        lang: 'es'
                    },
                    {
                        name: this.$t('lang.ru'),
                        lang: 'ru'
                    },
                    {
                        name: this.$t('lang.ar'),
                        lang: 'ar'
                    },
                    {
                        name: this.$t('lang.fr'),
                        lang: 'fr'
                    },
                    {
                        name: this.$t('lang.ja'),
                        lang: 'ja'
                    },
                    {
                        name: this.$t('lang.ko'),
                        lang: 'ko'
                    },
                    {
                        name: this.$t('lang.ms'),
                        lang: 'ms'
                    },
                    {
                        name: this.$t('lang.id'),
                        lang: 'id'
                    },
                    {
                        name: this.$t('lang.it'),
                        lang: 'it'
                    },
                    {
                        name: this.$t('lang.vi'),
                        lang: 'vi'
                    },
                    {
                        name: this.$t('lang.pt'),
                        lang: 'pt'
                    },
                    {
                        name: this.$t('lang.th'),
                        lang: 'th'
                    },
                    {
                        name: this.$t('lang.tr'),
                        lang: 'tr'
                    },
                    {
                        name: this.$t('lang.persian'),
                        lang: 'fa'
                    },
                    {
                        name: this.$t('lang.de'),
                        lang: 'de'
                    },
                    {
                        name: this.$t('lang.nl'),
                        lang: 'nl'
                    }
                ],
                languageCode: {
                    sq: this.$t('lang.sq'),
                    ar: this.$t('lang.ar'),
                    az: this.$t('lang.az'),
                    ga: this.$t('lang.ga'),
                    et: this.$t('lang.et'),
                    eu: this.$t('lang.eu'),
                    be: this.$t('lang.be'),
                    bg: this.$t('lang.bg'),
                    is: this.$t('lang.is'),
                    fa: this.$t('lang.fa'),
                    af: this.$t('lang.af'),
                    // "af": "南非荷兰语",
                    da: this.$t('lang.da'),
                    de: this.$t('lang.de'),
                    ru: this.$t('lang.ru'),
                    fr: this.$t('lang.fr'),
                    tl: this.$t('lang.tl'),
                    fi: this.$t('lang.fi'),
                    ka: this.$t('lang.ka'),
                    gu: this.$t('lang.gu'),
                    ht: this.$t('lang.ht'),
                    ko: this.$t('lang.ko'),
                    nl: this.$t('lang.nl'),
                    gl: this.$t('lang.gl'),
                    ca: this.$t('lang.ca'),
                    cs: this.$t('lang.cs'),
                    kn: this.$t('lang.kn'),
                    hr: this.$t('lang.hr'),
                    la: this.$t('lang.la'),
                    lv: this.$t('lang.lv'),
                    lo: this.$t('lang.lo'),
                    lt: this.$t('lang.lt'),
                    ro: this.$t('lang.ro'),
                    mt: this.$t('lang.mt'),
                    ms: this.$t('lang.ms'),
                    mk: this.$t('lang.mk'),
                    bn: this.$t('lang.bn'),
                    no: this.$t('lang.no'),
                    pt: this.$t('lang.pt'),
                    ja: this.$t('lang.ja'),
                    sv: this.$t('lang.sv'),
                    sr: this.$t('lang.sr'),
                    eo: this.$t('lang.eo'),
                    sk: this.$t('lang.sk'),
                    sl: this.$t('lang.sl'),
                    sw: this.$t('lang.sw'),
                    te: this.$t('lang.te'),
                    ta: this.$t('lang.ta'),
                    th: this.$t('lang.th'),
                    tr: this.$t('lang.tr'),
                    cy: this.$t('lang.cy'),
                    ur: this.$t('lang.ur'),
                    uk: this.$t('lang.uk'),
                    iw: this.$t('lang.iw'),
                    el: this.$t('lang.el'),
                    es: this.$t('lang.es'),
                    hu: this.$t('lang.hu'),
                    hy: this.$t('lang.hy'),
                    it: this.$t('lang.it'),
                    yi: this.$t('lang.yi'),
                    hi: this.$t('lang.hi'),
                    id: this.$t('lang.id'),
                    en: this.$t('lang.en'),
                    vi: this.$t('lang.vi'),
                    'zh-TW': this.$t('lang.zh_TW'),
                    'zh-CN': this.$t('lang.zh_CN')
                },

                // 请求消息发送失败原因 loading
                loading_getSendErrReason: true,
                // 消息发送失败 code
                sendErrCode: ''
            };
        },
        computed: {
            ...mapState({
                autoTranslatetargetLang: 'autoTranslatetargetLang', // 自动翻译-目标语种
                websocketMsgWA: state => state.whatsapp.websocketMsgWA,
                viewingSubWA: state => state.whatsapp.viewingSubWA,
                isSuperAdmin: state => state.isSuperAdmin, // 超管
                userId: state => state.userId,
                orgId: state => state.enterpriseId,
                enterpriseId: state => state.enterpriseId,
            }),
            // 判断当前登陆的账号有没有查看下属聊天记录(撤回、删除)的权限
            /** 只有超管可以看下属删除和撤回的聊天记录 */
            isHaveViewChatHistoryPermission() {
                let value = '';
                // 超管查看下属聊天记录
                if (
                    // WhatsApp页面
                    ((this.msg.deleteFlag === 2 || this.msg.deleteFlag === 3) && this.isSuperAdmin && Boolean(this.viewingSubWA) && this.viewingSubWA.userId !== this.userId) ||
                    // 时间轴页面
                    ((this.msg.deleteFlag === 2 || this.msg.deleteFlag === 3) && this.timeLineStatus && this.isSuperAdmin)
                ) {
                    value = 'block';
                    // 管理员查看下属聊天记录(撤回、删除都不允许看到)
                } else if ((this.msg.deleteFlag === 3 || this.msg.deleteFlag === 2) && !this.isSuperAdmin && Boolean(this.viewingSubWA) && this.viewingSubWA.userId !== this.userId) {
                    value = 'none';
                    // 超管、管理员、普通用户查看自己的聊天记录(只能看到撤回的消息)
                } else if (this.msg.deleteFlag === 2) {
                    value = 'none';
                    // 时间轴非超管查看聊天记录(撤回、删除都不允许看到)
                } else if ((this.msg.deleteFlag === 2 || this.msg.deleteFlag === 3) && this.timeLineStatus) {
                    value = 'none';
                };

                // 返回字段格式:display:'none'、display:'block'
                return `display:${value}`;
            },
            classObject() {
                return this.fromFlag === 'waRelatedDetail' ? 'item-you' : this.msg.fromMe ? 'item-me' : 'item-you';
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
            // 从群组信息中获取当前消息发送人账号信息
            senderAccountInfo() {
                if (this.groupInfo && Array.isArray(this.groupInfo.memberList)) {
                    return this.groupInfo.memberList.find(item => item.waAccount === this.rawMsg.fromWaAccount);
                }
                return null;
            },
            // 是否有权限发群组消息
            ableSendGroupMsg() {
                // 当前是群组消息且群组成员已请求
                if (this.isGroup && this.groupInfo && Array.isArray(this.groupInfo.memberList)) {
                    // 从群组成员中筛出当前 wa 账号对应的群成员
                    const groupMember = this.groupInfo.memberList.find(item => item.waAccount === this.whatsAppAccountInfo.whatsappAccount);
                    if (groupMember && groupMember.deleteFlag !== 1) {
                        // 所有人都能发消息 或 当前用户是管理员, 允许发消息
                        if (groupMember.permission === 0 || groupMember.isAdmin === 1) {
                            return true;
                        }
                    }
                }

                // 不符哈条件全返回 false
                return false;
            },
            // 可显示在消息 pop 操作栏的按钮类型
            operateBtns() {
                // 暂存结果
                const result = [];

                switch (this.msg.type) {
                    case '1':
                        // 文本消息

                        // 允许翻译
                        result.push('translate');
                        break;
                    case '2':
                        // 图片消息

                        // 非同步失败 + 带描述信息, 允许翻译
                        if (!(this.msg.contentQiniuUrl && this.msg.contentQiniuUrl.endsWith('/image.notfind.jpg'))) {
                            if (this.msg.showText) {
                                result.push('translate');
                            }
                        }
                        break;
                    case '4':
                        // 视频消息

                        // 非同步失败 + 带描述信息, 允许翻译
                        if (!(this.msg.contentQiniuUrl && this.msg.contentQiniuUrl.endsWith('/video.mp4.notfind.jpg'))) {
                            if (this.msg.showText) {
                                result.push('translate');
                            }
                        }
                        break;
                    case '9':
                        // 模板消息
                        // 不显示任何按钮
                        return [];
                }

                if (this.whatsAppAccountInfo.loginStatus === 1 && (!this.isGroup || this.ableSendGroupMsg)) {
                    // 账号在线状态正常 + (非群组消息 或 允许发送群消息)

                    // 非查看下属状态并且非多设备账号登陆, 可显示回复按钮、删除按钮、撤回按钮、多选按钮按钮
                    // WABA 会话, 不显示回复/撤回按钮
                    // 非多设备版, 不显示回复/撤回按钮
                    if (!this.viewingSubWA && !this.isWABA) {
                        result.push('reply');
                        result.push('withdraw'); // 撤回按钮
                    }

                    // 音频消息, 可显示下载按钮
                    if (this.msg.type === '5') {
                        result.push('download');
                    }
                } else {
                    // 否则

                    // 查看下属状态
                    if (this.viewingSubWA) {
                        // 音频消息, 可显示下载按钮
                        if (this.msg.type === '5') {
                            result.push('download');
                        }
                    }
                }

                // java 版和多设备版都不支持删除, 先注释删除和多选按钮
                // if (!this.WAIsMd && !this.viewingSubWA) {
                //     result.push('delete'); // 删除按钮
                //     result.push('choice'); // 多选按钮按钮
                // }

                // console.log('result', result);
                // 返回结果
                return result;
            },
            // 当前是否是 WABA 账户
            isWABA() {
                return this.whatsAppAccountInfo && this.whatsAppAccountInfo.tag === 'WABA';
            },
            // 是否是多设备版
            WAIsMd() {
                return !(this.whatsAppAccountInfo && this.whatsAppAccountInfo.uuid && this.whatsAppAccountInfo.uuid.includes('java'));
            },
            // 当前聊天账号
            chatWaAccount() {
                return this.isGroup
                    ? this.msg.toWaAccount
                    : this.msg.fromMe
                        ? this.msg.toWaAccount
                        : this.msg.fromWaAccount;
            },
            // 消息发送失败原因
            sendErrReason() {
                switch (this.sendErrCode) {
                    case '1000':
                        return this.$t('whatsapp_manage.sendMsgErrReason1');
                    case '1300':
                        return this.$t('whatsapp_manage.sendMsgErrReason2');
                    case '1050':
                        return this.$t('whatsapp_manage.sendMsgErrReason3');
                    case '1240':
                        return this.$t('whatsapp_manage.sendMsgErrReason4');
                    case '1210':
                        return this.$t('whatsapp_manage.sendMsgErrReason5');
                    case '1340':
                        return this.$t('whatsapp_manage.sendMsgErrReason6');
                    default:
                        return this.$t('whatsapp_manage.sendMsgErrReason0');
                }
            },
            // 历史翻译语种对照
            getLastTransLanuage() {
                const obj = this.languageList.find(ele => ele.value == this.lastTransMemory);
                if (obj) {
                    return obj.label;
                } else {
                    // console.log(obj);
                    // console.log(this.lastTransMemory);
                    // console.log(this.languageList);
                    // console.log(this.languageList.length);
                    // console.log(Vue.config.lang);
                    this.lastTransMemory ='zh_CN'
                    return Vue.config.lang === 'en-US' ? 'Chinese' : '中文';
                }
                // return this.languageList.find(ele => ele.value == this.lastTransMemory).label;
            }
        },
        beforeMount() {
            this.$forceUpdate();
            // console.log(this.rawMsg,'this.rawMsg');
            const item = Object.assign({}, this.rawMsg);

            let url,messageExtendedJson;
            if (item.extendedJson) {
                try {
                    messageExtendedJson = typeof item.extendedJson === 'string' ? JSON.parse(item.extendedJson) : item.extendedJson;
                } catch (e) {
                    console.log('message item parse extendedJson error', e)
                }
            }
            switch (item.type) {
                case 'timeTag':
                    // 标记发送的时间

                    item.showText = item.text;
                    break;
                case '1':
                    // 文本消息 text
                    // 修改whatsapp发送域名、ip、标签符号的消息时显示错误的问题
                    item.showText = item.content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    // 识别链接
                    // 旧代码: item.showText = item.content.replace(/((https|http):\/\/[\S.\/]+)(?![^<]+>)/gi, '<a href=\'$1\' target=\'_blank\'>$1</a>');
                    item.showText = item.content.replace(/(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/gi, '<a href=\'$1\' target=\'_blank\'>$1</a>');
                    break;
                case '2':
                    item.showText = null
                    // image展示对应的caption
                    if (messageExtendedJson?.caption) {
                        item.showText = (messageExtendedJson.caption || '').replace(/((https|http):\/\/[\S.\/]+)(?![^<]+>)/gi, '<a href=\'$1\' target=\'_blank\'>$1</a>');
                    }
                    break;
                case '3':
                    // document

                    // item.fileLink = item.contentQiniuUrl;
                    //                item.showText = utils.escape(item.file.name)
                    item.showText = item.content;
                    try {
                        url = decodeURI(item.contentQiniuUrl);
                    } catch (e) {
                        url = item.contentQiniuUrl;
                        console.error(e);
                        console.error(`解码文件 url 出错, 文件 url 为 ${  item.contentQiniuUrl}`);
                    }
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
                    item.showText = null
                    // video展示对应的caption
                    if (messageExtendedJson?.caption) {
                        item.showText = messageExtendedJson.caption;
                    }
                    break;
                case '5':
                    item.showText = item.content;
                    // audio
                    break;
                case '6':
                    // contact
                    // 联系人名片
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
            this.msg = item;

            // 处理文档+描述的消息
            if (item.extendedJson) {
                try {
                    const extendData = typeof item.extendedJson === 'object' ? item.extendedJson : JSON.parse(item.extendedJson);
                    const { caption } = extendData;
                    this.caption = caption;
                } catch (e) {
                    console.error('处理文档+描述的消息error', e);
                }
            }

            // 处理翻译消息
            if (item.extendedJson) {
                try {
                    const extendData =typeof item.extendedJson === 'object' ? item.extendedJson : JSON.parse(item.extendedJson);
                    const key = `key_${this.userId}_${this.whatsAppAccountInfo.whatsappAccount}`;
                    if (extendData && extendData[key]) {
                        console.log(extendData[key]);
                        this.translateText = twemoji.parse(extendData[key]);
                        const transText = extendData[key].split('##$$@')[0];
                        this.transLang = extendData[key].split('##$$@')[1];
                        this.translateText = transText.replace(/(\r\n|\r|\n)/g, '<br>');
                        // this.translateText = extendData[key].replace(/(\r\n|\r|\n)/g, '<br>');
                    }
                } catch (e) {
                    console.error('解析 wa 翻译文本出错');
                }
            }
            // 处理翻译消息 和 @消息
            if (item.extendedJson || item.extendedJsonLableMentions) {
                try {
                    let extendData;
                    if(item.extendedJson) {
                        extendData = typeof item.extendedJson === 'object' ? item.extendedJson : JSON.parse(item.extendedJson);
                    }else if(item.extendedJsonLableMentions) {
                        extendData = JSON.parse(item.extendedJsonLableMentions);
                    }
                    // 处理@群成员消息 将群成员号码格式化为群成员昵称
                    // 历史消息字段
                    if (extendData.mentions) {
                        this.mentions = extendData.mentions;
                        Object.keys(extendData.mentions).forEach(key => {
                            const reg = new RegExp('@'+key, 'g');
                            item.showText = item.showText.replace(reg, `<span class="aiteMember">@${extendData.mentions[key]}</span>`)
                        });
                    };
                } catch (e) {
                    console.log(e);
                    console.error('处理@群成员消息 将群成员号码格式化为群成员昵称');
                }
            }
        },
        async mounted() {
            // window.addEventListener('scroll', this.handleScroll, true);

            // 模板消息返回的content是JSON字符串,这里转化成对象
            if (this.msg.type === '9') {
                this.msg.content = JSON.parse(this.msg.content);
            }
           
            // 只有普通文本消息才会触发自动翻译功能
            if (this.msg.type === '1' || this.msg.type === '2') {
                this.$EVENTBUS.$on('addMessageToTranslationListMixIn', (data) => {
                    this.isInViewPort(data);
                });
            }
        },
        beforeDestroy() {
            this.$EVENTBUS.$off('addMessageToTranslationListMixIn');
        },
        methods: {
            // 循环被翻译的消息列表,给当前的消息增加翻译后的文本
            addTranslateTextToMsgList(data) {
                data.forEach(item => {
                    if (item.messageId === this.msg.messageId) {
                        this.translateText = item.translatedText;
                        this.transLang = this.autoTranslatetargetLang;
                        // 保存翻译内容
                        saveTranslateMsg({
                            orgId: this.orgId,
                            userId: this.userId,
                            userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                            toWaAccount: this.isGroup ? this.msg.toWaAccount : this.msg.fromMe ? this.msg.toWaAccount : this.msg.fromWaAccount,
                            messageId: this.msg.messageId,
                            message: this.translateText,
                            language: this.autoTranslatetargetLang,
                            timeStamp: this.msg.timeStamp
                        });
                    }
                });
            },

            // 判断当前的item消息是否在视口内
            isInViewPort(data) {
                // 目标语种与当前消息存的语种一致时
                if (this.transLang === this.autoTranslatetargetLang) return;
                console.error(this.$refs.msgLi.querySelector('.msg-text'));

                const { top } = this.getOffset(this.$refs.msgLi.querySelector('.msg-text'));
                if (top < 0) {
                    return;
                };

                if (top > data.top && top < data.bottom) {
                    const obj = {
                        requestText: this.msg.content,
                        messageId: this.msg.messageId
                    };
                    this.$emit('handleTransMsg', obj);
                }
            },
            getOffset(element) {
                const rect = element.getBoundingClientRect();
                // const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                return {
                    top: rect.top + scrollTop
                    // left: rect.left + scrollLeft
                };
            },
            // 勾选消息列表前的checkBox
            selectMsgBox(e, msg) {
                /** 问题：PC端删除的消息 手机端同步，但过了一会 删除的消息再手机端还原了 */
                // 解决方法:消息发送时间不超过1分钟时,提示:无法删除 并return
                // 获取消息发送的时间 msg.timeStamp
                if ((this.$options.filters.calculateHoursBetweenTwoDates(msg.timeStamp) * 60) < 1) {
                    this.isSelectBox = false;
                    this.$Message.warning(this.$t('whatsapp_manage.messagesSentWithin1MinuteCannotBeDeleted'));
                    return;
                }

                this.isSelectBox = e;
                // 调用父组件的 '选择要删除的消息'方法
                this.$emit('selectMessagesToDelete', e, msg);
            },
            // 重新编辑撤回的消息
            reEditWithdrawMsg(msg) {
                // 包含有@消息的处理
                if(msg.extendedJsonLableMentions || msg.extendedJson) {
                    let extendData;
                    if(msg.extendedJsonLableMentions) {
                        extendData = JSON.parse(msg.extendedJsonLableMentions)
                    } else if(msg.extendedJson) {
                        extendData = typeof msg.extendedJson === 'object' ? msg.extendedJson : JSON.parse(msg.extendedJson);
                    }
                    console.log(extendData);
                    if(extendData.mentions) {
                        Object.keys(extendData.mentions).forEach(key => {
                            // 翻译阿拉伯语时候发现 @的名字后面有空各  直接替换掉
                            const regempty = /@\s*/g;
                            const reg = new RegExp('@'+key, 'g');
                            let jsonDAta = JSON.stringify({number: key, nick: extendData.mentions[key] })
                            msg.content = msg.content.replace(regempty,'@');
                            msg.content = msg.content.replace(reg, `<aiteMember class='searchUseByEditList' contentEditable='false' data-aite=${jsonDAta}>@${extendData.mentions[key]} </aiteMember>`);
                            console.log(msg.content);
                        });
                    }
                }
                console.log(msg);
                // 估计要调接口的
                this.$emit('reEditWithdrawMsgF', msg.content);
            },
            // 撤回、删除消息的方法
            async withdrawMsg(msg, deleteFlag) {
                /** 问题：PC端删除的消息 手机端同步，但过了一会 删除的消息再手机端还原了 */
                // 解决方法:消息发送时间不超过1分钟时,提示:无法删除 并return
                // 获取消息发送的时间 msg.timeStamp
                if ((this.$options.filters.calculateHoursBetweenTwoDates(msg.timeStamp) * 60) < 1 && deleteFlag === 2) {
                    this.$Message.warning(this.$t('whatsapp_manage.messagesSentWithin1MinuteCannotBeDeleted'));
                    return;
                }

                // 校验消息是否删除了的阈值,阈值为true后,前端会模拟一个删除、撤销的websocket
                let deleteMessageStatus = false;
                this.visible = false; // 隐藏...
                this.visible2 = false;
                /**
                 * 询盘撤回时,1. 前端调取删除、撤回接口 2. 发送一个websocket,更新左侧会话列表状态
                 * 注意!!!消息撤销messages 不用传participant，外面传participant
                 * 注意!!!群聊删除别人的时候messages 传messages participant
                 */
                // 接口参数相关配置
                const messages = [{
                    messageId: msg.messageId,
                    fromMe: msg.fromMe // 消息只能撤回自己的,所以这里一定为true
                }];

                // 如果是群聊情况下&&删除其他人消息
                if (this.isGroup && !msg.fromMe) {
                    messages[0].participant = msg.fromWaAccount; // 消息归属的手机号
                };

                // 模拟websocket需要的相关配置
                const Websocket = {
                    WaWebsocketMessageType: 18, // 表示 收到 wa 消息推送
                    messageId: msg.messageId,
                    deleteFlag: deleteFlag,
                    pushMessageModule: 'WhatsAppModule'
                };
                // 1. 前端调取删除、撤回接口
                const data = {
                    userId: Number(this.userId), // 用户id
                    orgId: Number(this.orgId), // 企业id
                    userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount, // 用户绑定的wa账号
                    chatWaAccount: this.isGroup ? msg.toWaAccount : msg.fromMe ? msg.toWaAccount : msg.fromWaAccount, // 消息接收人wa账号 不能为空
                    deleteFlag, // 操作类型：2删除;3撤回
                    messages, // 要删除的消息(包含messageId、fromMe)

                    content: msg.content, // 消息内容
                    chatWaName: msg.fromMe ? msg.toWaName : msg.fromWaName, // 联系人名称
                    whatsappName: this.whatsAppAccountInfo.whatsappName // whatsapp账号名称
                };

                // 如果是撤回消息
                if (deleteFlag === 3) {
                    data.participant = this.whatsAppAccountInfo.whatsappAccount;
                };

                // 发送接口请求此消息是否可被引用
                await deleteMessage(data)
                    .then(res => {
                        if (res.code === 1) {
                            deleteMessageStatus = true;
                        } else {
                            // 如果消息撤回失败
                            if (deleteFlag === 3) {
                                this.$Message.error(this.$t('whatsapp_manage.withdrawalFailedLoginAgain'));
                            }
                        };
                    })
                    .catch(error => {
                        // 如果消息撤回失败
                        if (deleteFlag === 3) {
                            this.$Message.error(this.$t('whatsapp_manage.withdrawalFailedLoginAgain'));
                        }
                        console.error(error);
                    });

                // 2. 派发一个websocket,更新左侧会话列表状态
                if (deleteMessageStatus) {
                    this.$store.commit('setWebsocketMsgWA', Websocket);
                }
            },
            // 多选消息
            selectMsgs() {
                const val = !this.selectAll;
                // 调用父组件,多选消息的方法
                this.$emit('selectAllMsgs', val);
            },
            // handleScroll(e) {
            //     console.log('监听到了滚动');
            //     // this.visible = false;
            // },
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
            // 图片预览
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            },
            // 翻译消息
            selectLang(lang, msg) {
                this.$emit('update:lastTransMemory', lang);
                this.translateChat(lang, msg);
            },
            translateChat(lang, msg) {
                this.visible = false;
                this.visible2 = false;
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
                                const reg = new RegExp('@'+key, 'g');
                                // console.log(this.translateText.replace(regempty,'@'));

                                const transText = this.translateText.split('##$$@');
                                this.translateText = transText[0];
                                this.transLang = transText[1];

                                this.translateText = this.translateText.replace(regempty,'@');
                                this.translateText = this.translateText.replace(reg, `<span class="aiteMember">@${this.mentions[key]}</span>`)
                            });
                        }

                        // 保存翻译内容
                        saveTranslateMsg({
                            orgId: this.orgId,
                            userId: this.userId,
                            userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                            toWaAccount: this.isGroup ? msg.toWaAccount : msg.fromMe ? msg.toWaAccount : msg.fromWaAccount,
                            messageId: msg.messageId,
                            message: this.translateText,
                            timeStamp: msg.timeStamp
                        });
                    }
                });
            },
            clearTranslateContent(msg) {
                // 关闭弹框
                this.visible = false;
                this.visible2 = false;

                // 清空消息显示
                this.translateText = '';

                // 清除保存的翻译内容
                deleteTranslateMsg({
                    orgId: this.orgId,
                    userId: this.userId,
                    userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                    toWaAccount: this.isGroup ? msg.toWaAccount : msg.fromMe ? msg.toWaAccount : msg.fromWaAccount,
                    messageId: msg.messageId,
                    timeStamp: msg.timeStamp
                });
            },
            // 回复消息
            triggerReply() {
                // 关闭弹框
                this.visible = false;
                this.visible2 = false;

                // 发送接口请求此消息是否可被引用
                util.ajaxWAJson({
                    url: '/whatsapp/chatRecords/isCanBeQuoted',
                    method: 'post',
                    data: {
                        userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                        orgId: this.orgId,
                        messageId: this.msg.messageId
                    }
                }).then(({ data }) => {
                    if (data.code === 1) {
                        // 可被引用
                        this.rawMsg.contentThumbnail = data.data.contentThumbnail;
                        this.$emit('update:replyMsg', this.rawMsg);
                    } else {
                        // 不可被引用

                        this.$Message.error(this.$t('whatsapp_manage.tip_msgCanNotBeQuoted'));
                    }
                });
            },
            // 下载
            triggerDownload(msg) {
                // 关闭弹框
                this.visible = false;
                this.visible2 = false;

                // 格式化下载文件名
                const filePath = msg.contentQiniuUrl;
                const sendDate = this.$dym.dateFormat('YYYYmmddHHMMSS', new Date(Number(msg.timeStamp || Date.now())));
                let fileSuffix = '';
                if (filePath.indexOf('.') !== -1) {
                    fileSuffix = filePath.split('.').slice(-1)[0].toLowerCase();
                }
                const fileName = `${this.$t('crm.Table.col_whatsapp_message_type5')}-${sendDate}${fileSuffix ? `.${fileSuffix}` : ''}`;
                // 下载
                window.open(`${filePath.slice(filePath.split(':')[0].length + 1)}?attname=${encodeURIComponent(fileName)}`);
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
            // 录入线索
            enterClue(account) {
                this.$emit('enterClue', account);
            },
            // 查看 CRM 详情
            viewCrmDetail(account) {
                this.$emit('viewCrmDetail', account);
            },
            // 转到私聊
            toPrivateChat(account) {
                this.$emit('toPrivateChat', account);
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
                        url = this.msg.contentQiniuUrl;
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

            // 获取消息发送失败原因
            getSendErrReason() {
                // 如果已请求成功, 则停止执行
                if (this.sendErrCode) {
                    return;
                }

                this.loading_getSendErrReason = true;
                getWaMsgSendErrInfo({
                    chatWa: this.chatWaAccount,
                    msgId: this.msg.messageId
                }).then(res => {
                    if (res.code === 1) {
                        this.sendErrCode = res.data.errorCode || '';
                    }
                    this.loading_getSendErrReason = false;
                }).catch(err => {
                    console.error(err);
                    this.loading_getSendErrReason = false;
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
            transList(val) {
                // 判断当前消息的语种是否与目标语种一致, 如果一致, 则不需要保存翻译内容
                if (this.transLang === this.autoTranslatetargetLang) return;
                if (val) {
                    // 保存翻译内容
                    this.addTranslateTextToMsgList(val);
                }
            },
            // 重置消息前面选中的 CheckBox
            selectAll: {
                handler(val) {
                    if (this.isSelectBox) {
                        this.isSelectBox = false;
                    }
                }
            },
            // 监听最新一条 ws 消息(whatsApp 相关), 判断是否需要更新当前消息发送状态
            websocketMsgWA(val) {
                if (!val) {
                    return;
                }

                // 收到消息发送状态更新通知
                if (val.WaWebsocketMessageType === 5) {
                    const messageStatus = val.messageStatus;
                    if (messageStatus && messageStatus.messageId) {
                        if (this.msg.messageId === messageStatus.messageId) {
                            const readFlag = Number.isInteger(messageStatus.readFlag) ? messageStatus.readFlag : undefined;
                            if (readFlag && !(this.msg.readFlag && this.msg.readFlag > readFlag)) {
                                this.msg.readFlag = readFlag;
                                this.rawMsg.readFlag = readFlag;
                            }
                        }
                    }
                }

                // 监听后端异步发送过来的更新头像的 WS 消息
                if (val.WaWebsocketMessageType === 15) {
                    // 更新单独消息的头像  对方的
                    if (this.msg.toWaAccount === val.avatarJid) {
                        this.msg.toWaAvatar = val.leadsAvatarUrl || val.avatarUrl;
                        // 更新单独消息的头像 本人的
                    } else if (this.msg.fromWaAccount === val.avatarJid) {
                        this.msg.fromWaAvatar = val.leadsAvatarUrl || val.avatarUrl;
                    };
                };

                // 撤回、删除消息 websocket
                if (val.WaWebsocketMessageType === 18) {
                    // 处理撤回
                    if (val.deleteFlag === 3) {
                        if (val.messageId === this.msg.messageId) {
                            this.msg.deleteFlag = val.deleteFlag;
                        };
                    // 处理删除
                    } else if (val.deleteFlag === 2) {
                        if (val.messageId === this.msg.messageId) {
                            this.msg.deleteFlag = val.deleteFlag;
                        };
                    }
                };

                // 文本右下角已编辑
                if (val.WaWebsocketMessageType === 25) {
                    if (val.messageId === this.msg.messageId) {
                        if (this.msg.type === '1') {
                            this.msg.showText = val.content;
                        }
                        this.msg.deleteFlag = 4;
                        // 由于已编辑的文本没有触发过翻译功能, 所以这里需要手动清除翻译内容
                        this.translateText = '';
                        this.caption = val.content;
                        // 清除保存的翻译内容
                        deleteTranslateMsg({
                            orgId: this.orgId,
                            userId: this.userId,
                            userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                            toWaAccount: this.isGroup ? this.msg.toWaAccount : this.msg.fromMe ? this.msg.toWaAccount : this.msg.fromWaAccount,
                            messageId: this.msg.messageId,
                            timeStamp: this.msg.timeStamp
                        });
                    };
                };
            },
            // 监听原始消息的引用消息的变化, 以保证引用消息从无到有时页面能正确显示(场景: ws 消息 WaWebsocketMessageType 为 6 时, 追加引用消息)
            'rawMsg.quotedMessage': {
                handler(val) {
                    if (val) {
                        this.msg.quotedMessage = val;
                    }
                }
            },
            lastTransMemory: {
                handler(nv, ov){
                    // console.log(nv, ov,'nv, ov');
                }
            },
            translateText: {
                handler(nv, ov) {
                    this.$nextTick(() => {
                        try {
                            Array.from(this.$refs.transbox.childNodes).forEach(ele => {
                                if (ele && ele.nodeName === 'IMG' && ele.getAttribute('data-plain-text')) {
                                    // 如果在wa网页版保存的表情 在询盘云翻译不出来表情
                                    const emoj = document.createTextNode(ele.getAttribute('data-plain-text'));
                                    ele.parentNode.replaceChild(emoj, ele);
                                }
                            });
                        } catch (error) {
                            console.log(error);
                        }
                    });
                },
                immediate: true
            }
        }
    };
</script>

<style scoped lang="less">
    .caption-style {
        background-color: #ffffff;
        padding: 7px 10px;
        border-radius: 4px;
    }

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
    .msg-card-info{
        padding:  unset;
        border:  none  !important;
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
        .edited-message-container {
            font-size: 14px;
        }
        .edited-content {
            margin-top: 4px;
            text-align: right;
            font-size: 12px;
            line-height: 18px;
            color: rgba(0, 0, 0, 0.28);
        }
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
    .card_detail{
        padding:0 12px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 1);
        border:  1px solid rgba(233, 234, 234, 1);
        overflow: hidden;
        .card_detail_name{
            width: 100%;
            color: #333;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            // height: 58px;
            padding: 10px 0;
            justify-content: center;
            align-items: center;
            border-bottom: 1px solid rgba(233, 234, 234, 1);
            box-sizing: border-box;
            .waMsgItem-avatar{
                height: 38px !important;
                width: 38px !important;
                margin-right: 8px;
            }
        }
        .replayMsgBymodal{
            color: #3B78DE;
            font-size: 12px;
            // height: 34px;
            padding: 10px 0;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
        }
    }
</style>

<style lang="less">
    @import "../../xhl-chat/components/chat-item.css";
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

    .relatedDetail-avatar {
        width: 40px !important;
        height: 40px !important;
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
