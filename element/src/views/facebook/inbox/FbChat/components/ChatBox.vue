<template>
    <div v-loading="loading"
         class="fb-chat-box"
         :style="fromFlag === 'messenger' ? 'height: 100%;overflow: hidden;': `height:${bodyHeight}px`">
         <!-- 聊天头部 -->
        <div class="fb-chat-header">
            <!-- 左侧聊天对象信息 -->
            <div class="fb-chat-header-left">
                <div style="display: none">{{chatVerbalInfo}}</div>
                <!-- 中部聊天区域内的头像 -->
                <span @click="getAvatar" style="cursor:pointer;">
                    <Avatar :src="conversation.conversationAvatar" class="avatar-large"/>
                </span>
                <div class="fb-chat-header-info">
                    <!-- 名称 -->
                    <div v-if="fromFlag !== 'messenger'"
                         id="conversationName"
                         class="fb-chat-header-name">{{ conversation.conversationName }}</div>
                    <div v-else-if="conversation.conversationInfo"
                         class="fb-chat-header-name">
                        {{ conversation.conversationInfo.customerName }}({{ conversation.conversationInfo.conversationName }})
                    </div>

                    <!-- 接待客服 -->
                    <div v-if="currentBrandPage.homePageType === 1"
                         class="fb-chat-allocate-service">
                        <!-- 当前客服人员 -->
                        <span>{{ $t('visitor_history.customer_service') }}: </span>
                        <!-- 分配客服 -->
                        <Poptip v-model="servicePopShow"
                                popper-class="fb-chat-allocate-service-popper"
                                placement="bottom"
                                ref="allocatePop">
                            <span slot="reference"
                                  class="allocate-service-trigger piwik_allocateFbConversationTrigger">
                                <!-- 客服名称 或 "分配客服" -->
                                {{ conversation.userName || $t('distribution.allocateService') }}

                                <span class="service-select-arrow"
                                      :class="{ 'service-select-arrow-opened': servicePopShow }"></span>
                            </span>

                            <div>
                                <!-- 搜索框 -->
                                <Input v-model="searchWord_service"
                                       prefix-icon="el-icon-search"></Input>

                                <!-- 选项区域 -->
                                <ul>
                                    <li v-for="item in filteredServiceList"
                                        :key="item.userId"
                                        @click="transferChat(item)"
                                        class="piwik_allocateFbConversation">{{ item.userName }}</li>
                                </ul>
                            </div>
                        </Poptip>
                    </div>

                    <!-- 备注 -->
                    <div v-if="fromFlag !== 'messenger'"
                         style="line-height:25px;">
                        <Input v-if="isEditRemark"
                               v-model="remark"
                               size="small"
                               ref="remarkInput"
                               @blur="handleRemarkEdit"
                               style="width: auto;margin:0 10px;"/>
                        <div v-else
                             class="fb-chat-header-remark">
                            <Tooltip :content="remark" max-width="300" placement="bottom" style="float: left;">
                                <div id="remark" :style="{maxWidth:remarkWidth}">{{remark}}</div>
                            </Tooltip>
                            <Icon class="fb_remark_edit" custom="custom custom-remark-edit" size="12"
                                  style="cursor:pointer;opacity: 0.5;" @click.native="handleEditRemarkClick"></Icon>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 右侧操作按钮 -->
            <div v-if="fromFlag !== 'messenger'"
                 class="fb-chat-header-status">
                <!-- 录入 CRM 状态相关 -->
                <crmArchiveStatus @showDetail="$emit('changeShowDetail', true)" :status="conversation.clue_status"></crmArchiveStatus>
                <!-- 状态为未录入/无关 -->
                <!-- <template v-if="[1, 2].includes(conversation.clue_status)">
                    更新线索状态按钮
                    <Dropdown trigger="click"
                              @command="handleStatusUpdate"
                              style="margin-right: 10px;">
                        <div class="frame-status">
                            {{ statusLabel }}
                            <Icon type="ios-arrow-down"></Icon>
                        </div>
                        <DropdownMenu slot="dropdown" class="handle-status-dropdown-menu">
                            <DropdownItem v-for="item in statusOptions" :key="item.value" :command="item.value"
                                          :class="item.class"
                                          :disabled="conversation.clue_status=== item.value"
                            >
                                {{ item.label }}
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <span>
                        录入线索
                        <Button v-if="conversation.clue_status !==2&&authorized_button['enterClue']" @click="enterClue(false)" style="padding: 10px 11px;">{{$t('littleDrawer.enterClues')}}</Button>
                        录入客户
                        <Button v-if="conversation.clue_status !==2&&authorized_button['enterCustomer']" @click="enterClue(true)" style="padding: 10px 11px;">{{ $t('littleDrawer.enterCustomer') }}</Button>
                    </span>
                </template>
                线索/询盘
                <Tooltip v-else
                         :content="conversation.clue_status === 102 ?  $t('clue.inquiry') : $t('clue.clue')"
                         placement="left">
                    <svg class="svg-icon" aria-hidden="true"
                         :style="{cursor:'pointer', width:'24px', height:'24px',verticalAlign: 'middle'}"
                         @click="$emit('changeShowDetail', true)">
                        <use v-if="conversation.clue_status === 101" xlink:href="#custom-clue"></use>
                        <use v-if="conversation.clue_status === 102" xlink:href="#custom-inquiry"></use>
                    </svg>
                </Tooltip> -->
            </div>
        </div>

        <!-- 聊天界面 -->
        <div
            id="scroll_loader_container"
            class="container-main scroll-translate"
            @mouseup="onSelect"
            @scroll.capture="close_popper">
                <div v-for="(message, index) in $options.filters.addMsgTimeTag(messageListTemp, 'ctime')"
                     :key="index"
                     class="message-block">
                    <!-- timeTag -->
                    <p v-if="message.showTimeTag"
                       class="message-time">{{ message.ctime | timeFormat('DateTime') }}</p>

                    <div :class="'message-main' + (message.direction==1?' self':'')">
                        <!-- 头像 -->
                        <Avatar :src="message.direction===1?pageAvatar:conversation.conversationAvatar"
                                class="avatar-large"/>
                        <!-- 图片 -->
                        <div v-if="message.attachmentsType==='image'" class="message-img" :class="[message.content ? 'message-img-text' : '']">
                            <!-- 如果图片的地址是非七牛的话,就显示Icon,并且有请求图片的按钮 -->
                            <img
                                v-if="message.attachmentsUrl"
                                :src="message.attachmentsUrl"
                                class="image"
                                :alt="$t('facebook.inbox.fbChat.chatImg')"
                                @load="scrollToBottom()"
                                @click="imgPreview">
                            <span v-if="message.isUrlExpired && message.invalid" style="display:flex;flex-direction:column;align-items:center;width:200px;height:120px;background-color:#f3f4f7;padding-top:30px;">
                                <Icon custom="custom custom-icon_picn" size="40" style="cursor: pointer;"></Icon>
                                <span style="font-size:12px;line-height:12px;">{{$t('inbox.pictureExpired')}}</span>
                            </span>
                            <!-- 图片右侧的刷新icon -->
                            <span v-if="message.isUrlExpired && !message.invalid">
                                <Icon custom="custom custom-refresh" size="24" style="cursor: pointer;" @click="getPicture(index, message)"></Icon>
                            </span>
                            <!-- 如果图片类型的消息中有content内容 -->
                            <div style="max-width: 200px;word-break: break-all;" v-if="message.content">{{ message.content }}</div>
                        </div>
                        <!-- 视频 -->
                        <div v-else-if="message.attachmentsType==='video'" class="message-video">
                            <video
                                :src="message.attachmentsUrl"
                                width="200"
                                controls
                            ></video>
                        </div>
                        <!-- 文件 -->
                        <div v-else-if="message.attachmentsType==='file'" class="message-file">
                            <Icon :custom="message.attachmentIcon"
                                size="44"></Icon>
                            <Tooltip :content="message.attachmentName"
                                    placement="top">
                                <div class="message-file-name">
                                    <span class="message-file-name-without-ext">{{ message.attachmentName | removeExt(message.attachmentExt) }}</span>
                                    <span v-if="message.attachmentExt"
                                          class="message-file-name-ext">.{{ message.attachmentExt }}</span>
                                </div>
                            </Tooltip>
                            <Icon custom="custom custom-file-download" size="14"
                                style="cursor:pointer;float:right;line-height: 48px;"
                                @click="downloadFile(message.attachmentsUrl,message.attachmentName)"></Icon>
                        </div>
                        <div v-else class="message-others">
                            <div class="message-content">
                                <!-- 文本 -->
                                <div v-if="message.attachmentsType==='text'||!message.attachmentsType||message.attachmentsType==='fallback'">
                                    <pre style="margin: 0;" v-html="message.content"></pre>
                                    <div :id="index"></div>
                                </div>
                                <!-- 其他类型 -->
                                <div v-else>
                                    {{$t('facebook.inbox.fbChat.notSupportTip')}}
                                </div>

                                <!-- 翻译 poptip -->
                                <Poptip v-if="(message.attachmentsType==='text'|| message.attachmentsType==='fallback')"
                                        width="150"
                                        :options="options"
                                        placement="bottom-start"
                                        @hide="isShowLanguge=false"
                                        class="pop-tip">
                                    <!-- trigger 按钮 -->
                                    <Button slot="reference"
                                            type="text"
                                            icon="el-icon-more"
                                            class="msg-more"
                                            @click="currentMsgIndex = index"></Button>
                                    <!-- pop 弹窗 -->
                                    <div class="poptip-block">
                                        <!-- 选择语言 -->
                                        <Poptip trigger="hover"
                                                :options="options"
                                                placement="right"
                                                ref="selectLangPoptip"
                                                class="lang-tip">
                                            <!-- trigger 按钮 -->
                                            <div slot="reference"
                                                 class="poptip-item">{{$t('chat.langSelect')}}
                                                <Icon type="arrow-right-b"
                                                      style="margin-left: 18px"></Icon>
                                            </div>
                                            <!-- pop 弹窗 -->
                                            <div>
                                                <div v-for="(item, index) in languageList"
                                                     :key="index"
                                                     @click="selectLang(item.value, message.content)"
                                                     class="lang-item gtm_ChatSelectLang">{{ item.label }}</div>
                                            </div>
                                        </Poptip>
                                        <!-- 点击翻译 -->
                                        <div @click="translateChat(lastTransMemory,message.content)"
                                            style="white-space: nowrap;"
                                             class="poptip-item gtm_ChatTranslateDialog">{{$t('chat.translateDialog')}}{{getLastTransLanuage}}
                                        </div>
                                    </div>
                                </Poptip>
                            </div>
                        </div>
                        <!-- 已读/未读状态(非群聊对话 + 消息是'我'发的才显示状态图标) -->
                        <Tooltip v-if="message.direction == 1" :open-delay="openDelay" :visible-arrow="false" placement="bottom-end" class="message-unread" popper-class="message-tip-fbinbox">
                            <div slot="content" style="white-space: nowrap;">{{msgReadTime}}</div>
                            <!-- 已读未读的icon图标标识 -->
                            <Icon
                                style="cursor: pointer;"
                                @mouseover.native="getReadTimeDebounce(message)"
                                :custom="getReadStatusIcon(message)"></Icon>
                        </Tooltip>
                    </div>
                </div>
        </div>

        <!-- 聊天底部 -->
        <div class="fb-chat-footer ">
            <DragFile type="drag"
                      multiple
                      :paste="true"
                      :show-upload-list="true"
                      :format="fileFormats"
                      :maxSize="fileSize"
                      :specialFileLimit="specialFileLimit"
                      :uploadMethod="uploadMethod"
                      ref="dragFile"
                      @updateFileList="updateFileList">
                    <div class="input-box">
                        <Input v-model="inputMessage"
                               type="textarea"
                               :rows="2"
                               :maxlength="800"
                               id="fbChatBox"
                               :placeholder="$t('placeholder.sendTip') + $t('aiToolBar.orPlaceholder')"
                               ref="input"
                               @keydown.enter.native="inputOnKeyDown"
                               @blur="handleInputBlur"
                                @mouseup.native="onIputSelect"/>
                        <div style="margin-top: 10px;">
                            <div v-if="fromFlag === 'messenger'" style="text-align: right;color: rgba(0, 0, 0, .8);">
                                {{inputMessage.length}}/800
                            </div>
                            <div class="input-box-footer-left">
                                <Select v-model="language" style="width:98px;margin-right:20px;">
                                    <Option v-for="item in languageList"
                                            :key="item.value"
                                            :value="item.value"
                                            :label="item.label"
                                            class="gtm_select-language"></Option>
                                </Select>
                                <Icon v-if="fromFlag !== 'messenger'" custom="custom custom-verbal-trick fb_verbal_add" size="20"
                                      @click="showVerbal" style="cursor: pointer;"></Icon>

                                <!-- 选择文件发送附件 -->
                                <Dropdown v-if="isContainsMenu('database')"
                                          trigger="hover"
                                          placement="top">
                                    <!-- trigger -->
                                    <Icon custom="custom custom-annex-file"
                                          size="19"
                                          class="facebook-upload-file"></Icon>

                                    <DropdownMenu slot="dropdown"
                                                  class="facebook-upload-option">
                                        <DropdownItem @click.native="trigger_upload"
                                                      class="gtm_facebookUpload">{{ $t('whatsapp_manage.upload_local') }}</DropdownItem>
                                        <DropdownItem @click.native="trigger_upload('dataBase')"
                                                      class="piwik_fb_uploadFile_dataBase">{{ $t('whatsapp_manage.upload_dataBase') }}</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                                <Icon v-else
                                      custom="custom custom-annex-file gtm_facebookUpload"
                                      size="19"
                                      @click="trigger_upload"
                                      style="margin-left: 20px;"></Icon>
                            </div>
                            <div style="padding-right: 65px;"
                                 class="input-box-footer-right">
                                <!-- 翻译按钮 -->
                                <Button :disabled="!inputMessage.trim()"
                                        :loading="translateLoading"
                                        @click="translate"
                                        class="gtm_facebookTranslate">{{ $t('facebook.inbox.fbChat.translate') }}</Button>
                                <!-- 发送按钮 -->
                                <Button type="primary"
                                        :disabled="disable_sendMsg"
                                        :loading="sendLoading"
                                        @click="sendMessage"
                                        style="margin-left:10px;"
                                        class="gtm_facebookSend">{{ sendBtnText }}</Button>
                            </div>
                        </div>
                    </div>
            </DragFile>
        </div>

        <testModal
                v-model="clueModal"
                :title="$t('facebook.inbox.enterClue')"
                class="modal companydata"
                :delLoading="delLoading"
                :createCustomer.sync="createCustomer"
                :json_data="json_data"
                :conversationId="conversationId"
                type="fb_chat"
                :saveClueClass="'inbox_clueSubmit'"
                :saveClueAndInquiryClass="'inbox_clueAndInquirySubmit'"
                :okEnterInquiryClass="'inbox_inquirySubmit'"
                @on_cancle_clue="on_cancle_clue"
                @returnLeadsId="updateStatus"
                @updateInquiryStatus="updateInquiryStatus">
        </testModal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import Vue from 'vue';
    import { mapState, mapGetters } from 'vuex';
    import { FACEBOOK_CHAT } from '@/api/config.js';
    import { fbCommon } from '@/api/facebook/index';
    import translateLang from '@/mixins/translateLang';
    // 发送消息区域翻译记忆
    import translaMemorySend from '@/mixins/chatTsMemorySend';
    import testModal from '@/views/main-components/enter-clue/enter-clue';
    import DragFile from '@/views/main-components/drag-file-qiniu';
    import crmArchiveStatus from '@/views/main-components/crmArchiveStatus';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';

     // ai tool bar facebook chat message
    import { getInputSelectedText, coverText, insertText } from '@/views/ai-toolbar/utils/tools'

    const { transferFbService, getConversationPicture } = fbCommon;

    export default {
        name: 'ChatBox',
        mixins: [translateLang, translaMemorySend],
        props: {
            adId: {
                type: String,
                default: ''
            },
            bindingUserId: {},
            messageList: {
                type: Array,
                default() {
                    return [];
                }
            },
            currentBrandPage: {
                type: Object,
                default() {
                    return {};
                }
            },
            conversation: {
                type: Object,
                default() {
                    return {};
                }
            },
            conversationId: {
                type: String,
                default: '',
                required: true
            },
            pageAvatar: {
                type: String,
                default: '',
                required: true
            },
            nodealPageAvatar: {
                type: String,
                default: '',
                required: true
            },
            currentNodealCoversationAvatar: {
                type: String,
                default: '',
                required: true
            },
            pageId: {
                type: String,
                default: '',
                required: true
            },
            pageName: {
                type: String,
                default: ''
            },
            websocketChat: {
                type: Object,
                default() {
                    return {};
                }
            },
            smallOrLarge: {
                type: String
            },
            clue_id: {
                type: String,
                default: ''
            },
            companyId: {
                type: Number,
                default: 0
            },
            inquiry_id: {
                type: Number,
                default: 0
            },
            showDetail: {
                type: Boolean,
                default: true
            },
            fromFlag: {
                type: String,
                default: ''
            },
            lastTransMemory: {
                type: String,
                default: 'zh'
            }
        },
        components: {
            testModal,
            DragFile,
            crmArchiveStatus
        },
        data() {
            return {
                // 直接创建客户
                createCustomer: false,

                // 全局 loading
                loading: false,

                // 客服接待下拉筛选搜索词
                searchWord_service: '',

                openDelay: 600, // 显示已读时间的延迟
                msgReadTime: '', // 消息已读时间
                messageListTemp: [],
                inputMessage: '',
                language: 'en',
                statusOptions: [{
                    value: 1,
                    label: this.$t('chat.noEntry'),
                    class: 'fb-no-entry'
                }, {
                    value: 2,
                    label: this.$t('chat.nothingWith'),
                    class: 'fb-nothing-with'
                }],
                translateLoading: false,
                sendLoading: false,
                remark: '',
                isEditRemark: false,
                isEditRemarkShow: false,
                remarkWidth: '100px',

                // 录入线索相关
                clueModal: false,
                json_data: {},
                seqNumber: '', // 线索编号
                delLoading: false, // 弹出框loading
                colObj: {},
                templateId: '',
                clueId: '',
                inquiryId: 0,
                status: '',

                // 私信消息翻译
                targetlang: 'zh-CN',
                isShowLanguge: false, // 是否显示翻译提示窗口
                // 不知道这个具体有什么用，现在又影响了翻译弹窗的显示
                currentMsgIndex: -1, // 当前点击选择翻译的消息下标
                inputBlurIndex: 0, // 输入框光标停留位置
                close_popper: this.$debounce(e => {
                    if (e && e.target && e.target.classList.contains('scroll-translate')) {
                        // 关闭 select 下拉选框
                        if (document.querySelector('.poptip-item')) {
                            document.querySelector('.poptip-item').click();
                        }
                    }
                }, 200, true),

                // 文件上传
                fileList: [],
                fileFormats: ['gif', 'jpg', 'jpeg', 'png', 'pdf', 'xls', 'xlsx', 'txt', 'ppt', 'pptx', 'doc', 'docx'],
                fileSize: 25,
                // 关于附件上传的一些特殊限制，例如某类文件的某个格式，有特殊的大小限制，诸如此类:sizeLimit单位为M
                specialFileLimit: [
                    {
                        type: 'gif',
                        sizeLimit: 10
                    },
                    {
                        type: 'jpg',
                        sizeLimit: 10
                    },
                    {
                        type: 'jpeg',
                        sizeLimit: 10
                    },
                    {
                        type: 'png',
                        sizeLimit: 10
                    }
                ],
                // 附件上传的两种方式： normal---普通上传 dataBase--- 关联询盘云资料库上传
                uploadMethod: 'normal',

                // 下拉选择客服弹框显示状态
                servicePopShow: false
            };
        },
        computed: {
            ...mapState({
                facebookReadStatus: state => state.facebook.facebookReadStatus, // fb已读未读状态(websocket)
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                fullName: 'fullName',
                window_height: state => state.window_height,
                qiniuHttp: state => state.qiniuHttp,
                chatVerbalInfo: state => state.chatVerbalInfo,
                button_list: state => state.app.button_list,
                fbServiceList: state => state.facebook.fbServiceList
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            authorized_button() {
                const buttonIds = BUTTON_IDS.Facebook.chat;
                return {
                    enterClue: !HANDLE_BUTTON(buttonIds.enterClue, this.button_list),
                    enterCustomer: !HANDLE_BUTTON(buttonIds.enterCustomer, this.button_list)
                };
            },
            bodyHeight() {
                const temp = this.window_height ? this.window_height - 110 : document.body.clientHeight - 110;
                return temp > 200 ? temp : 200;
            },
            statusLabel() {
                const statusObj = this.statusOptions.find(item => item.value === this.conversation.clue_status);
                return statusObj ? statusObj.label : 'unknown';
            },
            options() {
                const container = document.querySelector('#frame-main');
                return {
                    modifiers: {
                        computeStyle: {
                            gpuAcceleration: false
                        },
                        preventOverflow: {
                            boundariesElement: container
                        }
                    }
                };
            },
            // 文件列表不为空且全部上传完成
            canSendFile() {
                return this.fileList.every(file => file.status === 'finished');
            },
            // 是否禁用发送按钮
            disable_sendMsg() {
                let result = true;

                if (this.fileList.length) {
                    // 若有文件列表, 且文件均已上传完成, 则可点击发送
                    result = !this.canSendFile;
                } else if (this.inputMessage.trim()) {
                    // 否则若有输入文字, 则可点击发送
                    result = false;
                }

                return result;
            },
            // 发送按钮文字
            sendBtnText() {
                // 默认显示"发送"
                let result = this.$t('facebook.inbox.fbChat.send');
                if (!this.canSendFile) {
                    // 如果文件列表中有未上传完成的文件, 则显示上传中
                    result = this.$t('data_movement.uploading');
                }
                return result;
            },
            // 筛选过的 fb 客服列表
            filteredServiceList() {
                if (this.searchWord_service) {
                    return this.fbServiceList.filter(item => item.fullname.includes(this.searchWord_service));
                } else {
                    return this.fbServiceList;
                }
            },
            // // 历史翻译语种对照
            // getLastTransLanuage() {
            //     return this.languageList.find(ele => ele.value == this.lastTransMemory).label;
            // }
            // 历史翻译语种对照
            getLastTransLanuage() {
                const obj = this.languageList.find(ele => ele.value == this.lastTransMemory);
                if (obj) {
                    return obj.label;
                } else {
                    console.log(obj);
                    console.log(this.lastTransMemory);
                    console.log(this.languageList);
                    console.log(this.languageList.length);
                    console.log(Vue.config.lang);
                    this.lastTransMemory ='zh'
                    return Vue.config.lang === 'en-US' ? 'Chinese' : '中文';
                }
                // return this.languageList.find(ele => ele.value == this.lastTransMemory).label;
            }
        },
        filters: {
            removeExt(val, ext) {
                if (ext && val.endsWith(`.${ext}`)) {
                    return val.slice(0, val.lastIndexOf(`.${ext}`));
                } else {
                    return val;
                }
            }
        },
        methods: {
            // 重新获取私信消息中无法显示的图片 接收的当前的图片url错误的index
            async getPicture(urlIndex, item) {
                // 获取目标的图片targetUrl地址
                const targetUrl = await this.getTargetUrl(item);
                // 2. 根据是否请求到数据：
                this.messageList.forEach((item, index) => {
                    if (urlIndex === index) {
                        // 2.1 如果请求到,则更换新的url地址
                        if (targetUrl !== 'not exist!') {
                            // 赋值新的url地址
                            item.attachmentsUrl = targetUrl;
                            // 隐藏刷新按钮icon
                            item.isUrlExpired = false;
                        } else {
                            // 2.2 如果请求不到,则显示过期的icon图标
                            // 隐藏图片的div
                            item.attachmentsUrl = '';
                            // 显示失效的icon
                            item.invalid = true;
                        };
                    };
                });
            },
            // 判断图片url是否过期
            IsUrlExpired(imgurl) {
                return new Promise(function(resolve, reject) {
                    const ImgObj = new Image();
                    ImgObj.src = imgurl;
                    ImgObj.onload = function(res) {
                        resolve(res);
                    };
                    ImgObj.onerror = function(err) {
                        reject(err);
                    };
                });
            },
            // 获取消息列表中的图片地址url
            async getTargetUrl(item) {
                // 定义个变量,用来储存目标图片的url
                let TargetUrl = '';
                // 1. 请求新的图片数据
                await util.ajaxInternationalJson({
                    url: 'social/page/updatePictureToQiniu',
                    method: 'POST',
                    data: {
                        pictureUrl: item.attachmentsUrl
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        // 如果七牛有图片,则更换目标图片,没有图片的话,显示'图片已过期'
                        TargetUrl = res.data.data.targetUrl;
                    }
                });
                return TargetUrl;
            },
            // 获取会话的头像
            getAvatar() {
                // 向后端请求个新的头像
                getConversationPicture({
                    pageId: this.pageId,
                    conversationId: this.conversationId
                }).then(res => {
                    if (res.code === '1' && res && res.data.pictureUrl) {
                        // 更换头像url
                        this.conversation.conversationAvatar = res.data.pictureUrl;
                    }
                });
            },
            // 分配客服
            transferChat(service) {
                this.loading = true;

                // 关闭弹框
                this.$refs.allocatePop.doClose();

                // 发送请求
                transferFbService({
                    orgId: this.enterpriseId, // Integer 绑定的询盘云企业id
                    pageId: this.pageId, // String 主页ID
                    conversationId: this.conversationId, // String 会话ID
                    userId: service.userId, // Integer 客服ID
                    userName: service.userName, // String 客服名称
                    operatorId: this.userId, // Integer 操作员id，当前用户userId
                    operatorName: this.fullName // String 操作员名称，当前用户名
                }).then(res => {
                    if (res.code === '1') {
                        // 用接口返回的数据更新客服列表信息(包括 vuex)
                        this.$emit('updateServiceInfo', this.conversationId);

                        this.$Message.success(this.$t('fbDistribution.success_allocate'));
                    } else {
                        // 错误提示
                        this.$Message.error(this.$t('fbDistribution.fail_allocate'));
                    }

                    this.loading = false;
                });
            },

            // get消息已读时间,添加防抖
            getReadTimeDebounce(message) {
                // 如果鼠标放在了未读的消息上,则停止
                if (message.readStatus !== 2) {
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
                let ctime = message.ctime;
                // 因为刚发送的消息中的ctime为具体的时间,所以需要转换一下;
                if (typeof ctime === 'string') {
                    // 将具体日期转为时间戳
                    ctime = new Date(ctime).getTime();
                };
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
                if (message.readStatus === 2) {
                    // 对方已读
                    icon += ' custom-haveRead';
                } else {
                    // 已送达给对方,对方已接收,但是未读
                    icon += ' custom-delivered-and-received';
                };

                return icon;
            },
            showVerbal() {
                this.$store.state.chatVerbalList = !this.$store.state.chatVerbalList;
            },
            // 录入成询盘后更新状态
            updateInquiryStatus(clueId, status) {
                this.clueModal = false;
                this.clueId = clueId;
                this.$emit('get_cor_inquiry');
                this.$emit('getCompanyIdByClueId');
                this.editInquiryStatus(status, clueId);
            },
            editInquiryStatus(status, clueId) {
                util.ajaxInternational({
                    url: '/social/updateConversationStatusByClueId',
                    method: 'get',
                    params: {
                        clueId: clueId,
                        status: status
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$emit('updateConversationStatus', status);
                    }
                });
            },
            scrollToBottom() {
                this.$nextTick(() => {
                    const div = document.getElementById('scroll_loader_container');
                    if (div) {
                        div.scrollTop = div.scrollHeight;
                    }
                });
            },
            // 翻译
            translate() {
                this.translateLoading = true;
                util.ajaxInternational({
                    url: '/translation/translation',
                    method: 'post',
                    data: {
                        requestText: this.inputMessage.replace(/(\r\n|\r|\n)/g, '<br>').replace(/\s/g, '&nbsp;'),
                        targetLang: this.language
                    }
                }).then(response => {
                    this.translateLoading = false;
                    this.inputMessage = response.data.data.translations[0].translatedText.replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ');
                });
            },

            // 展开话术
            handleShortcutsShow() {
                this.$emit('letShortcutsShow', true);
            },
            // 发送优化
            inputOnKeyDown(e) {
                // console.log('发送优化e', e);
                const inputKeyDownIndex = e.target.selectionStart;

                // 回车判断是发送还是换行
                if (e.keyCode === 13) {
                    if (e.ctrlKey || e.shiftKey) {
                        // 换行

                        const dom = document.getElementById('fbChatBox');
                        this.inputMessage = `${this.inputMessage.substring(0, inputKeyDownIndex)}\n${this.inputMessage.substring(inputKeyDownIndex)}`;
                        e.returnValue = false;
                        if (dom.setSelectionRange) {
                            this.$nextTick(() => {
                                dom.blur();
                                dom.setSelectionRange(inputKeyDownIndex + 1, inputKeyDownIndex + 1);
                                dom.focus();
                            });
                        } else if (dom.createTextRange) {
                            this.$nextTick(() => {
                                const range = dom.createTextRange();
                                range.collapse(true);
                                range.moveEnd('character', inputKeyDownIndex);
                                range.moveStart('character', inputKeyDownIndex);
                                range.select();
                            });
                        }
                    } else {
                        // 发送

                        e.preventDefault();
                        this.sendMessage();
                    }
                }
            },
            // 发送
            sendMessage() {
                if (!this.sendLoading) { // 不是正在发送中
                    if (this.inputMessage.replace(/(^\s*)|(\s*$)/g, '') !== '') { // 发送内容不为空和空格
                        // 发送文本
                        const recipientName = this.conversation.conversationName;

                        this.sendLoading = true;
                        util.ajaxInternationalJson({
                            url: '/social/sendMessage',
                            method: 'post',
                            data: {
                                orgId: this.enterpriseId,
                                userId: this.bindingUserId,
                                pageId: this.pageId,
                                recipientId: this.conversationId,
                                sendText: this.inputMessage,
                                recipientName,
                                recipientAvatar: this.conversation.conversationAvatar
                            }
                        }).then(response => {
                            this.sendLoading = false;
                            switch (response.data.code) {
                                case '1':
                                    this.messageList.push({
                                        attachmentsType: 'text',
                                        content: this.inputMessage,
                                        id: this.messageList[this.messageList.length - 1].id + 1,
                                        readStatus: 1, // 消息未读状态
                                        direction: 1,
                                        ctime: response.data.data.messageTime
                                    });
                                    this.inputMessage = '';
                                    this.$emit('handleSendMessage', response.data.data.messageTime);
                                    break;
                                case '2':
                                    this.$Message({
                                        message: response.data.message,
                                        type: 'error',
                                        duration: 3000
                                    });
                                    break;
                                case '0':
                                    switch (response.data.error_code) {
                                        case 2022:
                                            this.$Message.error(this.$t('facebook.inbox.fbChat.breakRuleTip'));
                                            break;
                                        case 551:
                                            this.$Message.error(this.$t('facebook.inbox.fbChat.isBlackOrShielding'));
                                            break;
                                        case 10:
                                            this.$Message.error(this.$t('facebook.inbox.fbChat.over24HoursTip1') + recipientName + this.$t('facebook.inbox.fbChat.over24HoursTip2'));
                                            break;
                                        case 210:
                                        default:
                                            this.$Message.error(this.$t('facebook.inbox.fbChat.sendFailTip'));
                                    }
                                    break;
                                default:
                                    this.$Message.error(this.$t('facebook.inbox.fbChat.sendFailTip'));
                            }
                        }).catch(error => {
                            if (error && error.response) {
                                // 请求已发出，但服务器使用状态代码进行响应
                                // 落在2xx的范围之外
                                if (error.response.data && error.response.data.message) {
                                    const msg = error.response.data.message;
                                    // 处理不同情况提示语
                                    if (msg.includes('(code 100, subcode 2018074)')) {
                                        this.$Message.error(this.$t('facebook.inbox.fbChat.invalidId'));
                                        return;
                                    }
                                    if (msg.includes('(code 100, subcode 2018008)')) {
                                        this.$Message.error(this.$t('facebook.inbox.fbChat.fetchError'));
                                        return;
                                    }
                                    if (msg.includes('(code 100, subcode 2018294)')) {
                                        this.$Message.error(this.$t('facebook.inbox.fbChat.videoError'));
                                        return;
                                    }
                                    if (msg.includes('(code 100, subcode 2018047)')) {
                                        this.$Message.error(this.$t('facebook.inbox.fbChat.mimeError'));
                                        return;
                                    }
                                    // 默认错误提示语
                                    console.error('msg', msg);
                                    this.$Message.error(this.$t('facebook.inbox.fbChat.sendFailTip'));
                                }
                            } else {
                                // 在设置触发错误的请求时发生了错误
                                console.error('Error', error.message);
                                this.$Message.error(this.$t('facebook.inbox.fbChat.sendFailTip'));
                            }
                        });
                    } else {
                        if (!this.canSendFile) {
                            // 如果不可发送文件, 则提示错误
                            this.$Message.warning(this.$t('facebook.inbox.fbChat.sendNullTip'));
                        }
                    }

                    // 发送文件
                    if (this.fileList.length && this.canSendFile) {
                        const postFiles = Array.prototype.slice.call(this.fileList);
                        this.$refs.dragFile.clearFiles();
                        postFiles.forEach((file, index) => {
                            setTimeout(() => {
                                this.handleUploadSuccess(file);
                            }, (index + 1) * 100);
                        });
                    }
                }
            },
            // 更新文件列表
            updateFileList(val) {
                this.fileList = val;
            },

            // 图片预览
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            },
            // 更新状态
            handleStatusUpdate(status) {
                if (this.conversation.clue_status === status) {
                    return;
                }
                const statusObj = this.statusOptions.find(item => item.value === status);
                statusObj && this.$confirm(
                    // `${this.$t('visitor_history.confirm_to')}${statusObj.label}`,
                    `${this.$t('visitor_history.confirm_to')}facebook私信${this.$t('visitor_history.set')}【${statusObj.label}】?`,
                    this.$t('visitor_history.confirm_change'),
                    {
                        showClose: true
                    }
                ).then(() => {
                    util.ajaxInternational({
                        url: '/social/updateConversationStatusByConversationId',
                        method: 'post',
                        data: {
                            conversationId: this.conversationId,
                            status: status
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.$emit('updateConversationStatus', status);
                            // this.$Message.success(this.$t('facebook.editSuccess'));
                            switch (status) {
                                case 1:
                                    this.$Message.success(`facebook私信${this.$t('visitor_history.reset_success')}`);
                                    break;
                                // case 2:
                                //     break;
                                case 2:
                                    this.$Message.success(`facebook私信${this.$t('visitor_history.trash_success')}`);
                                    break;
                            }
                        } else {
                            this.$Message.error(response.data.message);
                        }
                    });
                });
            },
            handleEditRemarkClick() {
                this.isEditRemark = true;
                // 手动聚焦输入框
                this.$nextTick(() => {
                    this.$refs.remarkInput.focus();
                });
            },
            // 编辑备注
            handleRemarkEdit() {
                util.ajaxInternational({
                    url: '/social/updateConversationRemarkByConversationId',
                    method: 'get',
                    params: {
                        conversationId: this.conversationId,
                        remark: this.remark
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.isEditRemark = false;
                        this.$emit('updateRemark', this.remark);
                    }
                });
            },
            // 点击触发文件上传
            trigger_upload(isDatabase) {
                this.uploadMethod = isDatabase === 'dataBase' ? 'dataBase' : 'normal';
                this.$nextTick(() => {
                    this.$refs.dragFile.handleClick();
                });
            },
            // 上传文件成功
            handleUploadSuccess(file) {
                const uploadFileLink = file.url;
                let uploadFileType = 'FILE';
                switch (file.suffix) {
                    case 'gif':
                    case 'jpg':
                    case 'jpeg':
                    case 'png':
                        uploadFileType = 'IMAGE';
                        break;
                    case 'mp3':
                    case 'wma':
                        uploadFileType = 'AUDIO';
                        break;
                    case 'mp4':
                    case 'rmvb':
                    case 'avi':
                    case 'ts':
                        uploadFileType = 'VIDEO';
                        break;
                }

                const recipientName = this.conversation.conversationName;

                this.sendLoading = true;
                util.ajaxInternationalJson({
                    url: '/social/sendMessage',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.bindingUserId,
                        pageId: this.pageId,
                        recipientId: this.conversationId,
                        sendText: '',
                        messageType: uploadFileType,
                        messageUrl: uploadFileLink,
                        recipientName,
                        recipientAvatar: this.conversation.conversationAvatar
                    }
                }).then(response => {
                    this.sendLoading = false;
                    switch (response.data.code) {
                        case '1':
                            this.messageList.push({
                                attachmentsType: uploadFileType.toLowerCase(),
                                attachmentsUrl: uploadFileLink,
                                attachmentName: file.name,
                                id: this.messageList[this.messageList.length - 1].id + 1,
                                direction: 1,
                                ctime: response.data.data.messageTime,
                                readStatus: 1
                            });
                            // this.$emit('handleSendMessage',response.data.data.messageTime)
                            break;
                        case '2':
                            this.$Message({
                                message: response.data.message,
                                type: 'error',
                                duration: 3000
                            });
                            break;
                        case '0':
                            switch (response.data.error_code) {
                                case 2022:
                                    this.$Message.error(this.$t('facebook.inbox.fbChat.breakRuleTip'));
                                    break;
                                case 551:
                                    this.$Message.error(this.$t('facebook.inbox.fbChat.isBlackOrShielding'));
                                    break;
                                case 10:
                                    this.$Message.error(this.$t('facebook.inbox.fbChat.over24HoursTip1') + recipientName + this.$t('facebook.inbox.fbChat.over24HoursTip2'));
                                    break;
                                case 210:
                                default:
                                    this.$Message.error(this.$t('facebook.inbox.fbChat.sendFailTip'));
                            }
                            break;
                        default:
                            this.$Message.error(this.$t('facebook.inbox.fbChat.sendFailTip'));
                    }
                }).catch(error => {
                    if (error && error.response) {
                        // 请求已发出，但服务器使用状态代码进行响应
                        // 落在2xx的范围之外
                        if (error.response.data && error.response.data.message) {
                            const msg = error.response.data.message;
                            // 处理不同情况提示语
                            if (msg.includes('(code 100, subcode 2018074)')) {
                                this.$Message.error(this.$t('facebook.inbox.fbChat.invalidId'));
                                return;
                            }
                            if (msg.includes('(code 100, subcode 2018008)')) {
                                this.$Message.error(this.$t('facebook.inbox.fbChat.fetchError'));
                                return;
                            }
                            if (msg.includes('(code 100, subcode 2018294)')) {
                                this.$Message.error(this.$t('facebook.inbox.fbChat.videoError'));
                                return;
                            }
                            if (msg.includes('(code 100, subcode 2018047)')) {
                                this.$Message.error(this.$t('facebook.inbox.fbChat.mimeError'));
                                return;
                            }
                            // 默认错误提示语
                            console.error('msg', msg);
                            this.$Message.error(this.$t('facebook.inbox.fbChat.sendFailTip'));
                        }
                    } else {
                        // 在设置触发错误的请求时发生了错误
                        console.error('Error', error.message);
                        this.$Message.error(this.$t('facebook.inbox.fbChat.sendFailTip'));
                    }
                });
            },
            // 录入线索成功后改变录线索状态
            updateConversationClueStatus(clueId, status) {
                /* 若传入实参有值，且status为1，说明是要将已录入但没有clueId的会话状态更改为未录入
                * 否则为正常的录入线索成功后更改录线索状态的操作
                * */
                util.ajaxInternational({
                    url: '/social/updateConversationClueStatusByConversationId',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        conversationId: this.conversationId,
                        conversationName: this.conversation.conversationName,
                        pageName: this.pageName,
                        status: status,
                        clueId: clueId,
                        conversationAvatar: this.currentNodealCoversationAvatar,
                        pageAvatar: this.nodealPageAvatar
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.clueId = clueId;
                        // this.$emit('get_cor_inquiry');
                        // this.$emit('getCompanyIdByClueId');
                        this.$emit('updateConversationClueStatus', status);
                    }
                });
            },
            downloadFile(path, name) {
                window.open(`${path}?attname=${name}`.replace(/^https?:\/\//i, '//'), '_self');
            },
            /********************************
             ************* 录入线索相关********
             *********************************/
            enterClue(createCustomer) {
                if (createCustomer) {
                    this.createCustomer = createCustomer;
                }

                // 获取全部销售人员 录入线索时用的，在此调用下
                this.$store.dispatch('getSalesList');
                this.getClueOption();
                this.clueModal = true;
            },
            on_cancle_clue(data) {
                this.clueModal = data.close;
                this.createCustomer = data.close;
            },
            // 录入为线索后更新状态
            updateStatus(clueId, status) {
                this.clueModal = false;
                this.updateConversationClueStatus(clueId, status);
            },
            // 获取线索字段
            getClueOption() {
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.templateId = response.data.data.template.id;
                        this.json_data = {
                            templateId: this.templateId,
                            source: FACEBOOK_CHAT,
                            enterpriseId: this.enterpriseId,
                            userId: this.userId,
                            userName: this.userName,
                            visitorId: `FSX${this.conversationId}`,
                            id: this.conversationId
                        };
                    }
                });
            },
            // 私信消息翻译
            selectLang(lang, msg) {
                this.targetlang = lang;
                this.isShowLanguge = false;
                this.$emit('update:lastTransMemory', lang);
                this.translateChat(lang, msg);
            },
            translateChat(lang, msg) {
                const txt = msg;
                util.ajaxInternational({
                    url: '/translation/translation',
                    method: 'post',
                    data: {
                        requestText: txt.replace(/(\r\n|\r|\n)/g, '<br>').replace(/\s/g, '&nbsp;'),
                        targetLang: lang
                    }
                }).then(response => {
                    if (response.data) {
                        const text = response.data.data.translations[0].translatedText;
                        document.getElementById(this.currentMsgIndex).innerHTML = `<div class="text-border">${text}</div>`;
                        this.currentMsgIndex = -1;
                    }
                });
                // 关闭 poptip
                document.body.click();
                this.$refs.selectLangPoptip.forEach(item => item.doClose());
            },

            handleInputBlur(e) {
                this.inputBlurIndex = e.target.selectionStart;
            },
            // 插入话术
            changeInputMsg(msg) {
                /* 插入话术优化 */
                if (this.inputBlurIndex < this.inputMessage.length) {
                    this.inputMessage = this.inputMessage.substring(0, this.inputBlurIndex) + msg + this.inputMessage.substring(this.inputBlurIndex);
                } else {
                    this.inputMessage = this.inputMessage + msg;
                }
                const tempL = msg.length;
                const dom = document.getElementById('fbChatBox');
                if (dom.setSelectionRange) {
                    this.$nextTick(() => {
                        dom.focus();
                        dom.setSelectionRange(this.inputBlurIndex + tempL, this.inputBlurIndex + tempL);
                    });
                }
            },
            // 获取文件后缀名
            getAttachmentExt(name) {
                const temp = name.split('.');
                return temp.length > 1 ? temp.slice(-1)[0] : '';
            },
            // 获取文件对应 Icon
            getAttachmentIcon(ext) {
                switch (ext) {
                    case 'gif':
                        return 'custom custom-file-gif';
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
                    default:
                        return 'custom custom-file-other';
                }
            },

            // ai tool bar
            onIputSelect(e) {
                const result = getInputSelectedText()
                if (result.text) {

                    const insert = (newText, insertStart, insertEnd) => {
                        this.inputMessage = newText
                        const subInput = document.getElementById("fbChatBox")
                        subInput.focus()
                        this.$nextTick(() => {
                            subInput.setSelectionRange(insertStart, insertEnd)
                        })
                        this.$aiToolBar.destroy();
                    }

                    this.$aiToolBar.init({
                        type: 'inputBoxSelect',
                        value: result.text,
                        mouseX: e.clientX,
                        mouseY: e.clientY,
                        onCover: (v) => {
                            const newText = coverText(this.inputMessage, v, result)
                            insert(newText, result.start, result.start + v.length)
                        },
                        onInsert: (v) => {
                            const newText = insertText(this.inputMessage, v, result)
                            insert(newText, result.end, result.end + v.length)
                        }
                    })
                } else {
                    this.$aiToolBar.destroy()
                }
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
        created() {
            this.remark = this.conversation.remark;
        },
        mounted() {
            if (this.fromFlag !== 'messenger') {
                const leftEle = document.getElementsByClassName('fb-chat-header-left')[0];
                const leftWidth = window.getComputedStyle(leftEle).width;
                const conversationNameEle = document.getElementById('conversationName');
                const conversationNameWidth = window.getComputedStyle(conversationNameEle).width;

                document.getElementById('remark').style.maxWidth = `${(parseInt(leftWidth) - parseInt(conversationNameWidth) - 40)}px`;
            }
        },
        watch: {
            smallOrLarge(val) {
                if (val) {
                    const leftEle = document.getElementsByClassName('fb-chat-header-left')[0];
                    const leftWidth = window.getComputedStyle(leftEle).width;
                    const conversationNameEle = document.getElementById('conversationName');
                    const conversationNameWidth = window.getComputedStyle(conversationNameEle).width;

                    this.remarkWidth = `${(parseInt(leftWidth) - parseInt(conversationNameWidth) - 45)}px`;
                }
            },
            conversationId: {
                async handler() {
                    this.inputMessage = '';
                    // const { message } = await this.getCurrentChatCountTM();
                    // this.language = message || 'en';
                },
                immediate: true
            },
            messageList(val) {
                this.scrollToBottom();
                // this.messageListTemp = JSON.parse(JSON.stringify(val));
                val.forEach(item => {
                    if (item.attachmentsType === 'file') {
                        const url = decodeURI(item.attachmentsUrl);
                        const tempArr = url.split('?')[0].split('/');
                        item.attachmentName = tempArr[tempArr.length - 1];
                        item.attachmentExt = this.getAttachmentExt(item.attachmentName).toLowerCase();
                        item.attachmentIcon = this.getAttachmentIcon(item.attachmentExt);
                    } else if (item.attachmentsType === 'text' || item.attachmentsType === 'fallback') {
                        const re = /((https|http):\/\/[\S.\/]+)(?![^<]+>)/gi; // 识别链接
                        item.content = item.content.replace(re, '<a style=\'text-decoration:underline;color:inherit;\' href=\'$1\' target=\'_blank\'>$1</a>');
                    } else if (item.attachmentsType === 'image') {
                        // 添加图片失效字段 控制刷新icon的显示和图片失效icon的显示
                        item.invalid = false;
                        // 校验连接是否有效
                        this.IsUrlExpired(item.attachmentsUrl).then(() => {
                            // 链接有效 默认为false
                            item.isUrlExpired = false;
                        }).catch(() => {
                            // 链接无效 默认为true
                            item.isUrlExpired = true;
                        });
                    }
                });
                this.messageListTemp = val;
            },
            selectShortcuts(val) {
                this.inputMessage = val.name;
            },
            // fb私信已读未读状态
            facebookReadStatus(val) {
                // 储存当前的已读消息的时间戳
                const readTime = val.watermark;
                // 处理fb已读消息
                this.messageListTemp.forEach(message => {
                    // 判断当前的发送人direction === 1(表示是'我'发的) 消息已读状态(readStatus) 会话id(conversationId) 当前主页的id(pageid)
                    if (message.direction === 1 && message.readStatus === 1 && val.senderId === this.conversationId && val.pageId === this.pageId) {
                        // 如果已读时间大于消息创建时间则,表示消息已读
                        if (readTime > new Date(message.ctime).getTime()) {
                            // 如果满足条件,则说明消息被对方已读
                            message.readStatus = 2;
                        };
                    }
                });
            },
            // 接收最新的一条websocket消息(消息)
            websocketChat(value) {
                let temp = {
                    attachmentsType: value.attachmentsType,
                    attachmentsUrl: value.attachmentsUrl,
                    content: value.messageText,
                    id: this.messageList.length ? this.messageList[this.messageList.length - 1].id + 1 : 0,
                    direction: 2,
                    ctime: this.$options.filters.timeFormat(value.messageTime, 'DateTime'),
                    readStatus: 1
                };
                if (value.attachmentsType === 'file' || value.attachmentsType === 'image') {
                    const url = decodeURI(value.attachmentsUrl);
                    const tempArr = url.split('?')[0].split('/');
                    const attachmentName = tempArr[tempArr.length - 1];
                    const attachmentExt = this.getAttachmentExt(attachmentName).toLowerCase();
                    const attachmentIcon = this.getAttachmentIcon(attachmentExt);
                    temp = {
                        ...temp,
                        attachmentsUrl: value.attachmentsUrl,
                        attachmentName,
                        attachmentExt,
                        attachmentIcon
                    };
                }
                this.messageList.push(temp);
            },
            clue_id: {
                handler() {
                    this.clueId = this.clue_id;
                },
                immediate: true
            },
            inquiry_id: {
                handler() {
                    this.inquiryId = this.inquiry_id;
                },
                immediate: true
            },
            clueId() {
                this.$emit('updateClueId', this.clueId);
            },
            chatVerbalInfo() {
                if (this.chatVerbalInfo.length) {
                    this.changeInputMsg(this.chatVerbalInfo[this.chatVerbalInfo.length - 1]);
                }
            },

            // ai tool bar
            inputMessage(val) {
                if (val.toLowerCase() === '/ai') {
                    this.$aiToolBar.init({
                        type: 'inputBoxSlash',
                        onConfirm: v => {
                            this.$aiToolBar.destroy()
                            this.inputMessage = v

                            const subInput = document.getElementById("fbChatBox")
                            subInput.focus()
                            this.$nextTick(() => {
                                subInput.setSelectionRange(0, v.length)
                            })
                        },
                        onAbort: () => {
                            this.inputMessage = ''
                        },
                    })
                }else {
                    this.$aiToolBar.destroy()
                }
            } 

        },
        beforeDestroy() {
            this.$store.commit('updateChatVerbalInfo', []);
            this.$store.state.chatVerbalList = false;
        }
    };
</script>

<style lang="less">
    // 加scoped的话,会失效
    /* 修改已读未读tooltip的样式 */
    .message-tip-fbinbox{
        background-color: #727272 !important;
        padding: 6px 10px !important;
        margin-top: -3px !important;
        margin-right: 15px !important;
        // 时间文本不换行
        .message-tip-content{
            white-space: nowrap;
        }
    }

    .facebook-upload-file {
        cursor: pointer;
        margin-left: 20px;
    }

    .facebook-upload-option {
        text-align: center;
        max-height: 300px;
        width: 120px;
        white-space: nowrap;
    }

    .fb-chat-allocate-service-popper {
        ul {
            max-height: 200px;
            overflow: auto;
            margin-top: 20px;

            li {
                font-weight: 500;
                font-size: 12px;
                line-height: 14px;
                color: #000000;
                margin: 0 12px 10px;
                cursor: pointer;

                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }
</style>

<style lang="less" scoped>
    .fb-chat-box {
        display: -webkit-flex;
        display: flex;
        flex-direction: column;

        .avatar-large {
            width: 46px;
            height: 46px;
            border-radius: 23px;
        }

        .fb-chat-header {
            height: 66px;
            line-height: 66px;
            font-size: 12px;
            border-bottom: 1px solid #E8E8E8;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;

            .fb-chat-header-left {
                // width: 80%;
                // float: left;

                .fb-chat-header-info {
                    padding: 8px;
                    display: inline-flex;
                    flex-direction: column;
                    justify-content: center;
                    height: 66px;
                    vertical-align: top;

                    .fb-chat-header-name {
                        font-size: 15px;
                        color: rgba(0, 0, 0, 0.8);
                        font-weight: 700;
                        height: 25px;
                        line-height: 25px;
                    }

                    .fb-chat-allocate-service {
                        font-size: 12px;
                        line-height: 14px;
                        color: #767676;
                        cursor: pointer;

                        .allocate-service-trigger {
                            color: #839FBB;
                        }
                    }

                    .fb-chat-header-remark {
                        min-width: 100px;
                        height: 25px;

                        #remark {
                            margin-right: 4px;
                            display: inline-block;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            color: rgba(0, 0, 0, 0.40);
                        }
                    }
                }
            }

            .fb-chat-header-status {
                // float: right;
                text-align: right;
                line-height: 24px;
                padding: 20px 0;
                display: flex;
                align-items: center;
            }
        }

        .container-main {
            flex: 1;
            padding: 20px;
            overflow-x: hidden;
            overflow-y: auto;

            &::-webkit-scrollbar {
                width: 4px;
            }

            .message-block {
                .message-time {
                    font-size: 12px;
                    color: rgba(0, 0, 0, 0.28);
                    text-align: center;
                }

                .message-main {
                    position: relative;
                    margin: 12px 0;
                    text-align: left;

                    .el-avatar {
                        float: left;
                    }

                    .message-img {
                        position: relative;
                        display: inline-block;
                        padding: 4px 10px;
                        margin: 0 8px;

                        img {
                            vertical-align: top;
                            max-width: 200px;
                        }
                    }
                    .message-img-text {
                        border-radius: 4px;
                        padding: 8px;
                        margin: 0 16px;
                        text-align: left;
                        word-wrap: break-word;
                        background-color: #FFEBE0;
                        border: 1px solid #FBD5BF;
                    }
                    .message-video{
                        position: relative;
                        display: inline-block;
                        padding: 4px 10px;
                        margin: 0 8px;
                    }

                    .message-file {
                        text-align: left;
                        position: relative;
                        display: inline-block;
                        padding: 10px;
                        margin: 0 18px;/* 文件的样式与消息对齐 */
                        width: 233px;
                        height: 68px;
                        background: #FFFFFF;
                        border: 1px solid #EAEAEA;
                        border-radius: 4px;

                        .message-file-name {
                            font-size: 14px;
                            color: rgba(0, 0, 0, 0.80);
                            margin: 0 10px;
                            display: inline-flex;
                            width: 130px;
                            line-height: 48px;
                            vertical-align: middle;

                            .message-file-name-without-ext {
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                            }

                            .message-file-name-ext {
                                white-space: nowrap;
                            }
                        }
                    }

                    .message-others {
                        position: relative;
                        display: inline;

                        .message-content {
                            vertical-align: middle;
                            max-width: calc(~"100% - 250px");
                            white-space: initial;
                            border: 1px solid #eaeaea;
                            border-radius: 4px;
                            position: relative;
                            display: inline-block;
                            font-size: 14px;
                            border-radius: 4px;
                            padding: 8px;
                            margin: 0 16px;
                            text-align: left;
                            word-wrap: break-word;
                        }

                        &:hover .msg-more {
                            margin-left: 0;
                            // display: inline-block;
                            visibility: visible;
                        }
                    }

                    // 消息已读未读样式
                    .message-unread{
                        position: absolute;
                        bottom: -3px;
                        right: 46px;
                    }
                }

                .self {
                    text-align: right;

                    .el-avatar {
                        float: right;
                    }

                    .message-content {
                        border: 1px solid #FBD5BF !important;
                        border-radius: 4px !important;
                        background-color: #FFEBE0;
                        color: rgba(0,0,0,0.80);
                    }
                }
            }
        }

        .fb-chat-footer {
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #E8E8E8;

            /deep/ .ivu-upload.ivu-upload-drag {
                text-align: left;
                border: none;

                .drag-file-list {
                    padding: 0 14px;
                }

                &:hover {
                    border: none;
                }
            }

            .input-box {
                padding: 10px 20px 0;

                .ivu-input {
                    border: none;
                    box-shadow: none;
                    -webkit-box-shadow: none;
                    padding: 0;
                    margin-bottom: 10px;
                }
                .input-box-footer-left {
                    display: inline-block;
                    width: 50%;
                }

                .input-box-footer-right {
                    display: inline-block;
                    width: 50%;
                    text-align: right;

                    & /deep/ .ivu-btn {
                        color: rgba(0, 0, 0, 0.8);
                        border: 1px solid #ABBFD5;

                        &:hover {
                            background-color: #E5ECF4;
                            opacity: 0.8;
                        }

                        &:active {
                            background: #DCE6EF;
                        }

                        &:disabled {
                            background: #E7ECF2;
                            color: rgba(110, 129, 154, 0.40);
                            border: none;
                        }
                    }
                }
            }
        }
    }

    .pop-tip {
        position: absolute;
        bottom: 0;
        right: -32px;
    }

    .self .pop-tip {
        left: -32px;
    }

    .lang-tip .ivu-poptip-arrow {
        display: none;
    }

    .pop-tip .ivu-poptip-body {
        padding: 5px 0px 5px 2px;
    }

    .pop-tip .ivu-poptip-popper {
        min-width: 90px;
    }

    .msg-more {
        visibility: hidden;
        border-radius: 3px;
        padding: 0px 5px;
        webkit-box-shadow: 0 1px 6px rgba(0, 0, 0, .2);
        -moz-box-shadow: 0 1px 6px rgba(0, 0, 0, .2);
        box-shadow: 0 1px 6px rgba(0, 0, 0, .2);
    }

    .poptip-block {
        vertical-align: top;
    }

    .poptip-lang {
        right: 0;
        max-height: 250px;
        overflow-y: scroll;
    }

    .lang-item {
        padding: 0 10px;
    }

    .lang-btn {
        border-color: none !important;
    }

    .lang-btn:hover {
        border-color: none !important;
    }

    .pop-tip /deep/ .ivu-poptip-popper {
        left: 0 !important;
        top: 20px !important;
    }

    .pop-tip /deep/ .ivu-poptip-arrow {
        display: none;
    }

    .lang-tip /deep/ .ivu-poptip-popper {
        left: 95px !important;
        top: -60px !important;
    }

    .input-box /deep/ .ivu-input:focus {
        box-shadow: none;
        -webkit-box-shadow: none;
    }

    .service-select-arrow {
        transform: rotate(0deg) scale(.7);
        width: 0;
        height: 10px;
        display: inline-block;
        margin-left: 9px;
        position: relative;
        transition: all 0.4s ease 0s;
    }

    .service-select-arrow::before, .service-select-arrow::after {
        position: absolute;
        content: "";
        display: inline-block;
        background-color: transparent;
        width: 3px;
        transform: rotate(0deg);
        border-bottom: 12px solid #EE7D40;
        transition: all 0.4s ease 0s;
    }

    .service-select-arrow::before {
        transform: rotate(-135deg);
    }

    .service-select-arrow::after {
        transform: rotate(135deg);
        left: -7px;
    }

    .service-select-arrow-opened::before {
        transform: rotate(-45deg);
    }

    .service-select-arrow-opened::after {
        transform: rotate(45deg);
    }
</style>
