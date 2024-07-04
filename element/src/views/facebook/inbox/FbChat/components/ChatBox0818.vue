<template>
    <div class="fb-chat-box"
         :style="fromFlag === 'messenger' ? 'height: 100%;overflow: hidden;': `height:${bodyHeight}px`">
         <!-- 聊天头部 -->
        <div class="fb-chat-header">
            <!-- 左侧聊天对象信息 -->
            <div class="fb-chat-header-left">
                <div style="display: none">{{chatVerbalInfo}}</div>
                <Avatar :src="conversation.conversationAvatar" class="avatar-large"/>
                <div class="fb-chat-header-info">
                    <div v-if="fromFlag !== 'messenger'" class="fb-chat-header-name" id="conversationName">
                        {{conversation.conversationName}}
                    </div>
                    <div v-else-if="conversation.conversationInfo" class="fb-chat-header-name">
                        {{conversation.conversationInfo.customerName}}({{conversation.conversationInfo.conversationName}})
                    </div>
                    <!-- fb标签 -->
                    <!-- <div class="fb_tag" v-if="adId">
                        <Tooltip class="item" effect="dark" :content="adId">
                            <Button>ad_id:</Button>
                        </Tooltip>
                    </div> -->
                    <div style="line-height:25px;" v-if="fromFlag !== 'messenger'">
                        <Input
                                ref="remarkInput"
                                v-model="remark"
                                size="small"
                                style="width: auto;margin:0 10px;"
                                v-if="isEditRemark"
                                @blur="handleRemarkEdit"/>
                        <div class="fb-chat-header-remark" v-else>
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
            <div class="fb-chat-header-status"
                 v-if="fromFlag !== 'messenger' && conversation.clue_status===1 || conversation.clue_status===2">
                 <Tooltip :content="conversation.clue_status === 1 ?  $t('littleDrawer.undocumentedCustomers') : $t('littleDrawer.irrelevantCustomer')" placement="left">
                    <svg class="svg-icon" aria-hidden="true"
                         :style="{cursor:'pointer', width:'32px', height:'32px',verticalAlign: 'middle'}"
                         @click="$emit('changeShowDetail', true)">
                        <use xlink:href="#custom-unfiled"></use>
                    </svg>
                </Tooltip>
                <!-- <Dropdown trigger="click"
                          @command="handleStatusUpdate"
                          style="margin-right: 10px;">
                    <div class="frame-status">
                        {{ statusLabel  }}
                        <Icon type="ios-arrow-down"></Icon>
                    </div>
                    <DropdownMenu slot="dropdown" class="handle-status-dropdown-menu">
                        <DropdownItem v-for="item in statusOptions" :key="item.value" :command="item.value" :class="item.class"
                            :disabled="conversation.clue_status=== item.value"
                        >
                            {{ item.label }}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Icon
                        custom="custom custom-enter-clue"
                        size="24" @click.native="enterClue"
                        style="cursor: pointer;"
                        v-if="conversation.clue_status !==2"></Icon> -->
            </div>
            <!-- 右侧操作按钮？？ -->
            <div class="fb-chat-header-status" v-else-if="fromFlag !== 'messenger'">
                <Tooltip :content="conversation.clue_status === 102 ?  $t('clue.inquiry') : $t('clue.clue')" placement="left">
                    <svg class="svg-icon" aria-hidden="true"
                         :style="{cursor:'pointer', width:'32px', height:'32px',verticalAlign: 'middle'}"
                         @click="$emit('changeShowDetail', true)">
                         <!-- cursor:showDetail ? 'not-allowed':'pointer', -->
                        <!-- <use v-if="clueId && !inquiryId " xlink:href="#custom-clue"></use>
                        <use v-if="inquiryId" xlink:href="#custom-inquiry"></use> -->
                        <use v-if="conversation.clue_status === 101" xlink:href="#custom-clue"></use>
                        <use v-if="conversation.clue_status === 102" xlink:href="#custom-inquiry"></use>
                    </svg>
                </Tooltip>
            </div>
        </div>
        <!-- 聊天界面 -->
        <div
            id="scroll_loader_container"
            class="container-main scroll-translate"
            @scroll.capture="close_popper">
                <div v-for="(message,index) in messageListTemp" :key="index" class="message-block">
                    <p class="message-time"> {{message.ctime | timeFormat("DateTime")}} </p>
                    <div :class="'message-main' + (message.direction==1?' self':'')">
                        <Avatar :src="message.direction===1?pageAvatar:conversation.conversationAvatar"
                                class="avatar-large"/>
                        <!-- 图片 -->
                        <div v-if="message.attachmentsType==='image'" class="message-img">
                            <img
                                    :src="message.attachmentsUrl"
                                    class="image"
                                    :alt="$t('facebook.inbox.fbChat.chatImg')"
                                    @load="scrollToBottom()"
                                    @click="imgPreview">
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
                                                <div v-for="(item,index) in langList"
                                                     :key="index"
                                                     @click="selectLang(item.lang,message.content)"
                                                     class="lang-item gtm_ChatSelectLang">{{item.name}}
                                                </div>
                                            </div>
                                        </Poptip>
                                        <!-- 点击翻译 -->
                                        <div @click="translateChat('zh-CN',message.content)"
                                             class="poptip-item gtm_ChatTranslateDialog">{{$t('chat.translateDialog')}}
                                        </div>
                                    </div>
                                </Poptip>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
        <!-- 聊天底部 -->
        <div class="fb-chat-footer">
            <DragFile type="drag"
                      multiple
                      :paste="true"
                      :show-upload-list="true"
                      :format="fileFormats"
                      :maxSize="fileSize"
                      ref="dragFile"
                      @updateFileList="updateFileList">
                    <div class="input-box">
                        <Input v-model="inputMessage"
                               type="textarea"
                               :rows="2"
                               :maxlength="800"
                               id="fbChatBox"
                               :placeholder="$t('placeholder.sendTip')"
                               ref="input"
                               @keydown.enter.native="inputOnKeyDown"
                               @blur="handleInputBlur"/>
                        <div v-if="fromFlag === 'messenger'" style="text-align: right;color: rgba(0, 0, 0, .8);">
                            {{inputMessage.length}}/800
                        </div>
                        <div class="input-box-footer-left">
                            <Select v-model="language" style="width:98px;margin-right:20px;">
                                <Option v-for="item in languageList" :value="item.value" :key="item.value" :label="item.label" class="gtm_select-language">
                                </Option>
                            </Select>
                            <Icon v-if="fromFlag !== 'messenger'" custom="custom custom-verbal-trick" size="20"
                                  @click="showVerbal" style="cursor: pointer;"></Icon>
                            <Icon custom="custom custom-annex-file gtm_facebookUpload"
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
                            <Button :disabled="disable_sendMsg"
                                    :loading="sendLoading"
                                    @click="sendMessage"
                                    style="margin-left:10px;"
                                    class="gtm_facebookSend">{{ sendBtnText }}</Button>
                        </div>
                    </div>
            </DragFile>
        </div>
        <testModal
                v-model="clueModal"
                :title="$t('facebook.inbox.enterClue')"
                :mask-closable="false"
                class="modal companydata"
                :delLoading="delLoading"
                :saleList="saleList"
                :templateList="templateList"
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
    import { mapState } from 'vuex';
    import { FACEBOOK_CHAT } from '@/api/config.js';

    import testModal from '@/views/main-components/enter-clue/enter-clue';
    import DragFile from '@/views/main-components/drag-file-qiniu';

    export default {
        name: 'ChatBox',
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
            }
        },
        components: {
            testModal,
            DragFile
        },
        data() {
            return {
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
                languageList: [
                    {
                        value: 'en',
                        label: this.$t('facebook.translate.English')
                    },
                    {
                        value: 'zh-CN',
                        label: this.$t('facebook.translate.Chinese')
                    },
                    {
                        value: 'es',
                        label: this.$t('facebook.translate.Spanish')
                    },
                    {
                        value: 'ru',
                        label: this.$t('facebook.translate.Russian')
                    },
                    {
                        value: 'ar',
                        label: this.$t('facebook.translate.Arabic')
                    },
                    {
                        value: 'fr',
                        label: this.$t('facebook.translate.French')
                    },
                    {
                        value: 'ja',
                        label: this.$t('facebook.translate.Japanese')
                    },
                    {
                        value: 'ko',
                        label: this.$t('facebook.translate.Korean')
                    },
                    {
                        value: 'ms',
                        label: this.$t('lang.ms')
                    },
                    {
                        value: 'id',
                        label: this.$t('facebook.translate.Indonesian')
                    },
                    {
                        value: 'it',
                        label: this.$t('lang.it')
                    },
                    {
                        value: 'vi',
                        label: this.$t('facebook.translate.Vietnamese')
                    },
                    {
                        value: 'pt',
                        label: this.$t('facebook.translate.Portuguese')
                    },
                    {
                        value: 'th',
                        label: this.$t('facebook.translate.Thai')
                    },
                    {
                        value: 'tr',
                        label: this.$t('facebook.translate.Turkish')
                    }
                ],
                translateLoading: false,
                sendLoading: false,
                remark: '',
                isEditRemark: false,
                isEditRemarkShow: false,
                remarkWidth: '100px',
                // 录入线索相关
                clueModal: false,
                json_data: {},
                saleList: [], // 销售列表
                seqNumber: '', // 线索编号
                delLoading: false, // 弹出框loading
                colObj: {},
                templateList: [], // 线索模板列表
                templateId: '',
                clueId: '',
                inquiryId: 0,
                status: '',
                // 私信消息翻译
                langList: [
                    {
                        name: this.$t('lang.zh_CN'),
                        lang: 'zh-CN'
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
                fileSize: 25
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                window_height: state => state.window_height,
                qiniuHttp: state => state.qiniuHttp,
                chatVerbalInfo: state => state.chatVerbalInfo
            }),
            bodyHeight() {
                const temp = this.window_height ? this.window_height - 60 : document.body.clientHeight - 60;
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
            // verbalInfo(){
            //     console.log(this.verbalInfo)
            // }
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
                        requestText: this.inputMessage,
                        targetLang: this.language
                    }
                }).then(response => {
                    this.translateLoading = false;
                    this.inputMessage = response.data.data.translations[0].translatedText;
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
                if (e.ctrlKey && e.keyCode === 13) {
                    const dom = document.getElementById('fbChatBox').children[0];
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
                } else if (!e.ctrlKey && e.keyCode === 13) {
                    e.preventDefault();
                    this.sendMessage();
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
                                userId: this.bindingUserId,
                                pageId: this.pageId,
                                recipientId: this.conversationId,
                                sendText: this.inputMessage,
                                recipientName
                            }
                        }).then(response => {
                            this.sendLoading = false;
                            switch (response.data.code) {
                                case '1':
                                    this.messageList.push({
                                        attachmentsType: 'text',
                                        content: this.inputMessage,
                                        id: this.messageList[this.messageList.length - 1].id + 1,
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
            trigger_upload() {
                this.$refs.dragFile.handleClick();
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
                        userId: this.bindingUserId,
                        pageId: this.pageId,
                        recipientId: this.conversationId,
                        sendText: '',
                        messageType: uploadFileType,
                        messageUrl: uploadFileLink,
                        recipientName
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
                                ctime: response.data.data.messageTime
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
                window.open(`${path}?attname=${name}`, '_self');
            },
            /********************************
             ************* 录入线索相关********
             *********************************/
            enterClue() {
                this.getSaleList();
                this.getClueOption();
                this.clueModal = true;
            },
            on_cancle_clue(data) {
                this.clueModal = data.close;
            },
            // 录入为线索后更新状态
            updateStatus(clueId, status) {
                this.clueModal = false;
                this.updateConversationClueStatus(clueId, status);
            },
            // 获取线索字段
            getClueOption() {
                this.templateList = [];
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const showList = response.data.data.show;
                        for (const key in showList) {
                            const obj = showList[key];
                            obj.key = key;
                            obj.required = showList[key].isNeed !== 0;
                            this.templateList.push(obj);
                        }
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
            // 请求销售列表
            getSaleList() {
                this.saleList = [];
                util.ajax({
                    url: '/cuss-login/getSaleUserList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.saleList = response.data.data;
                        this.saleList.push({
                            id: -1,
                            fullname: '公海'
                        });
                    }
                });
            },

            // 私信消息翻译
            selectLang(lang, msg) {
                this.targetlang = lang;
                this.isShowLanguge = false;
                this.translateChat(lang, msg);
            },
            translateChat(lang, msg) {
                const txt = msg;
                util.ajaxInternational({
                    url: '/translation/translation',
                    method: 'post',
                    data: {
                        requestText: txt,
                        targetLang: lang
                    }
                }).then(response => {
                    if (response.data) {
                        const text = response.data.data.translations[0].translatedText;
                        const sourceLang = response.data.data.translations[0].detectedSourceLanguage;
                        const translate = `<div class="text-border">(${this.$t('chat.original')}${this.languageCode[sourceLang]}) ${text}</div>`;
                        document.getElementById(this.currentMsgIndex).innerHTML = translate;
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
                const dom = document.getElementById('fbChatBox').children[0];
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
            conversationId() {
                this.inputMessage = '';
            },
            messageList(val) {
                this.scrollToBottom();
                this.messageListTemp = JSON.parse(JSON.stringify(val));
                this.messageListTemp.forEach(item => {
                    if (item.attachmentsType === 'file') {
                        const url = decodeURI(item.attachmentsUrl);
                        const tempArr = url.split('?')[0].split('/');
                        item.attachmentName = tempArr[tempArr.length - 1];
                        item.attachmentExt = this.getAttachmentExt(item.attachmentName).toLowerCase();
                        item.attachmentIcon = this.getAttachmentIcon(item.attachmentExt);
                    } else if (item.attachmentsType === 'text' || item.attachmentsType === 'fallback') {
                        const re = /((https|http):\/\/[\S.\/]+)(?![^<]+>)/gi; // 识别链接
                        item.content = item.content.replace(re, '<a style=\'text-decoration:underline;color:inherit;\' href=\'$1\' target=\'_blank\'>$1</a>');
                    }
                });
            },
            selectShortcuts(val) {
                this.inputMessage = val.name;
            },
            websocketChat(value) {
                let temp = {
                    attachmentsType: value.attachmentsType,
                    attachmentsUrl: value.attachmentsUrl,
                    content: value.messageText,
                    id: this.messageList.length ? this.messageList[this.messageList.length - 1].id + 1 : 0,
                    direction: 2,
                    ctime: this.$options.filters.timeFormat(value.messageTime, 'DateTime')
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
            }
        },
        beforeDestroy() {
            this.$store.state.chatVerbalInfo = [];
            this.$store.state.chatVerbalList = false;
        }
    };
</script>

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

            .fb-chat-header-left {
                width: 80%;
                float: left;

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
                float: right;
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
                        margin: 0 8px;
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
</style>
