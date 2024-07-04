<template>
    <div class="floating-window-fb-chat-box" :style="`height:${bodyHeight}px`" v-loading="fbChatLoading" @mouseup="onSelect">
        <shortcuts
                v-show="isShortcutsShow"
                @letShortcutsShow="val=>isShortcutsShow=val"
                @verbalSelected="verbalSelected"
                :controVerbalIcon="controVerbalIcon">
        </shortcuts>
        <!-- 聊天界面头部 -->
        <div class="floating-window-header fb-inbox-window-header">
            <!-- 返回按钮 -->
            <div class="floating-window-header-left">
                <Icon custom="custom custom-floating-window-arrow" size="14" @click.native="backToList"
                      class="floating-window-header-back-arrow"></Icon>
            </div>
            <!-- 昵称 + 接待客服 -->
            <div class="floating-window-header-center">
                <!-- 昵称 -->
                <span class="floating-window-header-name" id="conversationName">{{conversation.conversationName}}</span>
                <!-- 接待客服 -->
                <div class="fb-customer-service">{{ $t('visitor_history.customer_service') }}: {{ conversation.userName }}</div>
            </div>
            <!-- 线索无关/未录入 按钮 -->
            <div class="floating-window-header-right"
                 v-if="conversation.clue_status===1 || conversation.clue_status===2">
                <div v-if="conversation.clue_status===2">无关</div>
                <Tooltip :content="$t('facebook.inbox.enterClue')" placement="left" v-else>
                    <Icon custom="custom custom-floating-window-enter-clue" size="18" @click.native="enterClue"
                          style="cursor: pointer;margin-left: 10px;"></Icon>
                </Tooltip>
            </div>
            <div class="floating-window-header-right" v-else>
                <!-- CRM 录入状态 -->
                <Tooltip :content="conversation.clue_status===102 ?  $t('clue.inquiry') : $t('clue.clue')"
                         placement="left">
                    <svg class="svg-icon" aria-hidden="true"
                         style="width:24px;height:24px;vertical-align: middle;cursor: pointer;" @click="showDetail">
                        <use v-if="conversation.clue_status===101" xlink:href="#custom-clue"></use>
                        <use v-if="conversation.clue_status===102" xlink:href="#custom-inquiry"></use>
                    </svg>
                </Tooltip>
            </div>
        </div>
        <!-- 聊天界面详情 -->
        <div id="scroll_loader_container" class="container-main">
            <div v-for="(message,index) in $options.filters.addMsgTimeTag(messageListTemp, 'ctime')"
                 :key="index"
                 class="message-block">
                <!-- timeTag -->
                <p v-if="message.showTimeTag"
                   class="message-time">{{ message.ctime | timeFormat('DateTime') }}</p>

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
                    <div v-else class="message-content">
                        <!-- 文本 -->
                        <template
                                v-if="message.attachmentsType==='text'||!message.attachmentsType||message.attachmentsType==='fallback'">
                            <pre style="margin: 0;" v-html="message.content"></pre>
                        </template>
                        <!-- 其他类型 -->
                        <template v-else>
                            {{$t('facebook.inbox.fbChat.notSupportTip')}}
                        </template>
                    </div>
                    <!-- 已读/未读状态(非群聊对话 + 消息是'我'发的才显示状态图标) -->
                    <Tooltip v-if="message.direction == 1" :open-delay="openDelay" :visible-arrow="false" placement="bottom-end" popper-class="message-tip-window">
                        <div slot="content" class="message-tip-content">{{msgReadTime}}</div>
                        <!-- 已读未读的icon图标标识 -->
                        <Icon
                            style="cursor: pointer;margin-right: 4px;height: 42px;padding-top: 28px;"
                            @mouseover.native="getReadTimeDebounce(message)"
                            :custom="getReadStatusIcon(message)"></Icon>
                    </Tooltip>
                </div>
            </div>
        </div>
        <!-- 聊天界面底部 -->
        <div class="fb-chat-footer">
            <DragFile type="drag"
                      multiple
                      :paste="true"
                      :show-upload-list="true"
                      :format="fileFormats"
                      :maxSize="fileSize"
                      :uploadMethod="uploadMethod"
                      ref="dragFile"
                      @updateFileList="updateFileList"
                      style="display: inline-block;width: 100%;line-height: 0;">
                    <div class="input-box">
                        <Icon custom="custom custom-verbal-trick" size="19" style="cursor:pointer;line-height: 32px;"
                              @click="isShortcutsShow=true"></Icon>
                        <!-- 输入框 -->
                        <Input v-model="inputMessage"
                                   type="textarea"
                                   :rows="1"
                                   id="fbChatBoxWindow"
                                   :placeholder="$t('placeholder.sendTip') + $t('aiToolBar.orPlaceholder')"
                                   ref="input"
                                   @keydown.enter.native="inputOnKeyDown"
                                   @blur="handleInputBlur"
                                   @mouseup.native="onIputSelect"/>
                        <!-- 显示翻译区域 -->
                        <Icon custom="custom custom-translate"
                              size="20"
                              @click.native="translateShow=!translateShow"
                              style="cursor:pointer;line-height: 32px;"></Icon>
                        <!-- 文件上传按钮 -->
                        <Dropdown v-if="isContainsMenu('database')"
                                  trigger="hover"
                                  placement="top">
                            <!-- trigger -->
                            <Icon custom="custom custom-annex-file"
                                  size="19"
                                  class="facebook-split-upload-file"></Icon>

                            <DropdownMenu slot="dropdown"
                                          class="facebook-split-upload-option">
                                <DropdownItem @click.native="trigger_upload"
                                              class="gtm_facebookSplitUpload">{{ $t('whatsapp_manage.upload_local') }}</DropdownItem>
                                <DropdownItem @click.native="trigger_upload('dataBase')"
                                              class="piwik_fb_split_uploadFile_dataBase">{{ $t('whatsapp_manage.upload_dataBase') }}</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <Icon v-else
                              custom="custom custom-annex-file gtm_facebookSplitUpload"
                              size="19"
                              @click="trigger_upload"
                              style="cursor:pointer;line-height: 32px;"></Icon>

                        <!-- 发送按钮 -->
                        <div v-show="!disable_sendMsg"
                             style="display: inline-block;margin-left: 10px">
                            <Button :disabled="disable_sendMsg"
                                    size="small"
                                    @click="sendMessage"
                                    style="vertical-align: unset;padding: 7px 10px;height: 32px;"
                                    class="gtm_facebookSplitSend">{{ sendBtnText }}</Button>
                        </div>
                    </div>
                    <div v-show="translateShow"
                         style="margin-top: 10px;padding: 0 14px;">
                        <!-- 选择语言 -->
                        <Select v-model="language"
                                style="width:98px;margin-right:16px;">
                            <Option v-for="item in languageList"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"></Option>
                        </Select>
                        <!-- 翻译按钮 -->
                        <Button :disabled="!inputMessage.trim()"
                                type="success"
                                :loading="translateLoading"
                                @click="translate"
                                class="gtm_facebookSplitTranslate">{{ $t('confirm') }}</Button>
                    </div>
            </DragFile>
        </div>
        <testModal
                v-model="clueModal"
                :title="$t('facebook.inbox.enterClue')"
                class="modal companydata"
                :delLoading="delLoading"
                :json_data="json_data"
                :conversationId="conversationId"
                :type="'floating_fb'"
                @on_cancle_clue="on_cancle_clue"
                @returnLeadsId="updateStatus"
                @updateInquiryStatus="updateInquiryStatus"
        >
        </testModal>
        <Drawer :visible.sync="value1" size="380px" class-name="split-chat-info" :modal="false">
            <ClueDetail
                    v-if="conversation.clue_status===101"
                    :clueId="clueId"
                    originalType="xhl-chat"
                    from="xhl-chat">
            </ClueDetail>
            <InquiryDetail
                    v-else-if="conversation.clue_status===102"
                    :inquiryId="inquiryId"
                    :companyId="companyId"
                    colSpan="24"
                    originalType="xhl-chat"
                    from="xhl-chat">
            </InquiryDetail>
        </Drawer>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import { FACEBOOK_CHAT } from '@/api/config.js';
    import translateLang from '@/mixins/translateLang';
    import translaMemorySend from '@/mixins/chatTsMemorySend';
    import ClueDetail from '@/views/main-components/tiny-detail/clue-detail/ClueDetail';
    import InquiryDetail from '@/views/main-components/tiny-detail/Inquiry-detail/InquiryDetail';
    import Shortcuts from '@/views/main-components/Shortcuts';
    import testModal from '@/views/main-components/enter-clue/enter-clue';
    import DragFile from '@/views/main-components/drag-file-qiniu';

    // ai tool bar
    import { getInputSelectedText, coverText, insertText } from '@/views/ai-toolbar/utils/tools'

    export default {
        name: 'ChatBox',
        mixins: [translateLang, translaMemorySend],
        props: {
            bindingUserId: {},
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
            pageId: {
                type: String,
                default: '',
                required: true
            },
            pageName: {
                type: String,
                default: ''
            },
            letChatLoading: {
                type: Boolean,
                default: false
            },
            websocketChat: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        components: {
            Shortcuts,
            testModal,
            DragFile,
            ClueDetail,
            InquiryDetail
        },
        data() {
            return {
                openDelay: 600, // 显示已读时间的延迟
                msgReadTime: '', // 消息已读时间
                messageListTemp: [],
                controVerbalIcon: 0,
                value1: false,
                fbChatLoading: true,
                messageList: [],
                selectShortcuts: {},
                inputMessage: '',
                translateShow: false,
                language: 'en',
                translateLoading: false,
                sendLoading: false,
                isShortcutsShow: false,
                // 录入线索相关
                clueModal: false,
                json_data: {},
                seqNumber: '', // 线索编号
                delLoading: false, // 弹出框loading
                colObj: {},
                templateId: '',
                clueId: '',
                inquiryId: '',
                companyId: '',
                inputBlurIndex: 0,

                // 文件上传
                fileList: [],
                fileFormats: ['gif', 'jpg', 'jpeg', 'png', 'pdf', 'xls', 'xlsx', 'txt', 'ppt', 'pptx', 'doc', 'docx'],
                fileSize: 25,
                // 附件上传的两种方式： normal---普通上传 dataBase--- 关联询盘云资料库上传
                uploadMethod: 'normal'
            };
        },
        computed: {
            ...mapState({
                facebookReadStatus: state => state.facebook.facebookReadStatus, // fb已读未读状态(websocket)
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                window_height: state => state.window_height,
                qiniuHttp: state => state.qiniuHttp
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            bodyHeight() {
                const temp = this.window_height ? this.window_height - 50 : document.body.clientHeight - 50;
                return temp > 200 ? temp : 200;
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
                let result = this.$t('chat.send');
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
            editInquiryStatus(status, clueId) {
                util.ajaxInternational({
                    url: '/social/updateConversationStatusByConversationId',
                    method: 'get',
                    params: {
                        conversationId: clueId,
                        status: status
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.get_cor_inquiry(this.clueId);
                        this.getCompanyIdByClueId();
                        const obj = {
                            clue_id: this.clueId,
                            status: status
                        };
                        this.$emit('updateClueStatus', obj);
                    }
                });
            },
            updateInquiryStatus(clueId, status) {
                this.clueModal = false;
                this.clueId = clueId;
                this.editInquiryStatus(status, clueId);
            },
            updateStatus(clueId, status) {
                this.clueModal = false;
                // this.clueId = clueId
                // this.$emit('get_cor_inquiry')
                // this.$emit('getCompanyIdByClueId')
                this.updateConversationClueStatus(clueId, status);
                // this.handleStatusUpdate(4) //4-已录入
            },
            backToList() {
                this.$emit('backToList');
            },
            // 获取会话内容和备注
            getMessagesAndRemarks() {
                this.fbChatLoading = true;
                util.ajaxInternational({
                    url: '/social/getMessagesAndRemarksByConversationId',
                    method: 'post',
                    data: {
                        conversationId: this.conversationId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.fbChatLoading = false;
                        const dataList = response.data.data.messages;
                        this.messageList = dataList.concat();
                    }
                });
            },
            // 主动发送消息会话列表顺序改变
            handleSendMessage(val) {
                this.$emit('handleSendMessage', val);
            },
            // 根据线索id查客户id
            getCompanyIdByClueId() {
                util.ajax({
                    url: '/crm/entityRelation/getCompanyIdByClueId?',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        clueId: this.clueId
                    }
                }).then((response) => {
                    if (response.data.code === '1') {
                        if (response.data.data.companyId) {
                            this.companyId = response.data.data.companyId;
                        }
                    }
                });
            },
            updateConversationStatus(status) {
                this.$emit('updateConversationStatus', status);
            },
            updateClueStatus(status) {
                this.$emit('updateClueStatus', status);
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
            handleInputBlur(e) {
                this.inputBlurIndex = e.target.selectionStart;
            },
            // 发送优化
            inputOnKeyDown(e) {
                const inputKeyDownIndex = e.target.selectionStart;

                // 回车判断是发送还是换行
                if (e.keyCode === 13) {
                    if (e.ctrlKey || e.shiftKey) {
                        // 换行

                        const dom = document.getElementById('fbChatBoxWindow');
                        //                    this.msgToSent = this.msgToSent.replace(eval("/(.{" + inputKeyDownIndex+ "})/"), "$1"+"\r\n");
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
                        const recipientName = this.conversation.conversationName;
                        // 发送文本
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
                                        ctime: response.data.data.messageTime,
                                        readStatus: 1
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
                    }
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
                        userId: this.bindingUserId,
                        pageId: this.pageId,
                        recipientId: this.conversationId,
                        sendText: '',
                        messageType: uploadFileType,
                        messageUrl: uploadFileLink
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
                                recipientName,
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
            // 插入话术
            verbalSelected(val) {
                //            this.inputMessage=val.name
                if (this.inputBlurIndex < this.inputMessage.length) {
                    this.inputMessage = this.inputMessage.substring(0, this.inputBlurIndex) + val.content.verbalContent + this.inputMessage.substring(this.inputBlurIndex);
                } else {
                    this.inputMessage = this.inputMessage + val.content.verbalContent;
                }
                this.isShortcutsShow = false;
                const tempL = val.content.verbalContent.length;
                const dom = document.getElementById('fbChatBoxWindow');
                if (dom.setSelectionRange) {
                    this.$nextTick(() => {
                        dom.focus();
                        dom.setSelectionRange(this.inputBlurIndex + tempL, this.inputBlurIndex + tempL);
                    });
                }
            },
            // 录入线索成功后改变录线索状态
            updateConversationClueStatus(clueId, status) {
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
                        conversationAvatar: this.conversation.conversationAvatar,
                        pageAvatar: this.pageAvatar
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.clueId = clueId;
                        this.get_cor_inquiry(clueId);
                        this.getCompanyIdByClueId();
                        const obj = {
                            clue_id: clueId,
                            status: status
                        };
                        this.$emit('updateClueStatus', obj);
                    }
                });
            },
            downloadFile(path, name) {
                window.open(`${path}?attname=${name}`.replace(/^https?:\/\//i, '//'), '_self');
            },
            /********************************
             ************* 录入线索相关********
             *********************************/
            enterClue() {
                // 获取全部销售人员 录入线索时用的，在此调用下
                this.$store.dispatch('getSalesList');
                this.getClueOption();
                this.clueModal = true;
            },
            on_cancle_clue(data) {
                this.clueModal = data.close;
            },
            // open_close(data) {
            //     this.clueModal = data.close
            //     if(data.Status){
            //         //更新录线索状态和标记状态
            //         this.updateConversationClueStatus()
            //         // this.handleStatusUpdate(4) //4-已录入
            //     }
            // },
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
            // 获取与线索对应的询盘 Id， 如果有的话
            get_cor_inquiry(clue_id) {
                util.ajaxJson({
                    url: '/crm/inquiry/getInquirySeqList',
                    method: 'post',
                    data: {
                        clueIdList: [clue_id]
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        /* this.show_operate = true; */
                        if (res.data.data[clue_id]) {
                            this.inquiryId = res.data.data[clue_id].inquiryId;
                        }
                    } else {
                        this.$Message.error(this.$t('clue.error_getClueStatus'));
                    }
                });
            },
            // 通过conversationId获取询盘id
            getInquiryIdByFaceBookId() {
                util
                    .ajaxJson({
                        url: '/crm/auto/getinquiryIdByFaceBookId',
                        method: 'post',
                        params: {
                            orgId: this.enterpriseId,
                            targetType: 1,
                            targetId: this.conversationId
                        }
                    })
                    .then(res => {
                        if (res.data.code === '1') {
                            this.inquiryId = res.data.data[0];
                            this.$store.commit('setAssosiatedInquiryId', res.data.data[0]);
                        } else {
                            this.$store.commit('setAssosiatedInquiryId', '');
                        }
                    }).catch(erro => {
                        this.$store.commit('setAssosiatedInquiryId', '');
                    });
            },
            showDetail() {
                this.value1 = true;
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
            if (this.conversationId) {
                this.getMessagesAndRemarks();
                this.clueId = this.conversation.clue_id;
                if (this.conversation.clue_status === 101) {
                    this.clueId = this.conversation.clue_id;
                } else if (this.conversation.clue_status === 102) {
                    if (!this.conversation.clue_id) {
                        this.getInquiryIdByFaceBookId();
                    } else {
                        const messageClueid = this.conversation.clue_id;
                        this.get_cor_inquiry(messageClueid);
                        this.getCompanyIdByClueId();
                    }
                }
            }
            this.remark = this.conversation.remark;
        },
        mounted() {
        },
        watch: {
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
            conversationId() {
                this.getMessagesAndRemarks();
                this.clueId = this.conversation.clue_id;
                if (this.conversation.clue_status === 101) {
                    this.clueId = this.conversation.clue_id;
                } else if (this.conversation.clue_status === 102) {
                    if (!this.conversation.clue_id) {
                        this.getInquiryIdByFaceBookId();
                    } else {
                        const messageClueid = this.conversation.clue_id;
                        this.get_cor_inquiry(messageClueid);
                        this.getCompanyIdByClueId();
                    }
                }
            },
            letChatLoading(val) {
                this.fbChatLoading = val;
                this.getMessagesAndRemarks();
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
                    }
                });
                this.messageListTemp = val;
            },
            selectShortcuts(val) {
                this.inputMessage = val.name;
            },
            websocketChat(value) {
                // this.messageList=[]
                let temp = {
                    attachmentsType: value.attachmentsType,
                    attachmentsUrl: value.attachmentsUrl,
                    content: value.messageText,
                    id: this.messageList.length ? this.messageList[this.messageList.length - 1].id + 1 : 0,
                    // id:this.messageList[this.messageList.length-1].id + 1,
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

            // ai tool bar
            inputMessage(val) {
                if (val.toLowerCase() === '/ai') {
                    this.$aiToolBar.init({
                        type: 'inputBoxSlash',
                        onConfirm: v => {
                            this.$aiToolBar.destroy()
                            this.inputMessage = v

                            const subInput = document.getElementById("fbChatBoxWindow")
                            subInput.focus()
                            this.$nextTick(() => {
                                subInput.setSelectionRange(0, v.length)
                            })
                        },
                        onAbort: () => {
                            this.inputMessage = ''
                        }
                    })
                }else {
                    this.$aiToolBar.destroy()
                }
            } 
        }
    };
</script>

<style lang="less">
    // 加scoped的话,会失效
    /* 修改已读未读tooltip的样式 */
    .message-tip-window{
        background-color: #727272 !important;
        padding: 6px 10px !important;
        margin-top: 0px !important;
        margin-right:18px !important;
        // 时间文本不换行
        .message-tip-content{
            white-space: nowrap;
        }
    }

    .facebook-split-upload-file {
        cursor: pointer;
        line-height: 32px;
    }

    .facebook-split-upload-option {
        text-align: center;
        max-height: 300px;
        width: 120px;
        white-space: nowrap;
    }
</style>

<style lang="less" scoped>
    /deep/ .ivu-drawer-wrap {
        top: -60px !important;
    }

    .floating-window-fb-chat-box {
        display: -webkit-flex;
        display: flex;
        flex-direction: column;

        /deep/ .followup-edit {
            display: none !important;
        }

        .avatar-large {
            width: 46px;
            height: 46px;
            border-radius: 23px;
        }

        .container-main {
            flex: 1;
            padding: 20px;
            overflow-x: hidden;
            overflow-y: auto;

            &::-webkit-scrollbar {
                display: none;
            }

            .message-block {
                .message-time {
                    font-size: 12px;
                    color: rgba(0, 0, 0, 0.28);
                    text-align: center;
                    // text-align: center;
                    // font-size: 12px;
                    // width: 126px;
                    // padding: 2px 4px;
                    // background-color: #dadada;
                    // border-radius: 6px;
                    // color: #fff;
                    // margin: 0 auto;
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

                    .message-content {
                        vertical-align: middle;
                        max-width: calc(~"100% - 100px");
                        background: #FFFFFF;
                        border: 1px solid #EAEAEA;
                        position: relative;
                        display: inline-block;
                        font-size: 14px;
                        color: rgba(0, 0, 0, 0.80);
                        border-radius: 4px;
                        padding: 8px;
                        margin: 0 4px;
                        text-align: left;
                        word-wrap: break-word;
                    }
                }

                .self {
                    text-align: right;

                    .el-avatar {
                        float: right;
                        margin-top: -4px;
                    }

                    .message-content {
                        border: 1px solid #FBD5BF;
                        border-radius: 4px;
                        background-color: #FFEBE0;
                        color: rgba(0,0,0,0.80);
                    }
                }
            }
        }

        .fb-customer-service {
            font-weight: 500;
            font-size: 12px;
            line-height: 14px;
            color: #A9B9C9;
        }

        .fb-chat-footer {
            /*padding: 20px;*/
            bottom: 0;
            left: 0;
            right: 0;
            background: #FAFCFF;
            box-shadow: inset 0 1px 0 0 #F5F5F5;

            /deep/ .ivu-upload-drag {
                border: none;
                display: inline-block;
                width: 100%;
                text-align: left;

                .drag-file-list {
                    padding: 0 8px;
                }

                &:hover {
                    border: none;
                }
            }

            .input-box {
                display: flex;
                align-items: flex-end;
                line-height: 32px;
                padding: 14px;

                .ivu-input {
                    background: #FAFCFF;
                    border: none;
                    box-shadow: none;
                    -webkit-box-shadow: none;
                    padding: 0;
                }

                .input-box-footer-left {
                    display: inline-block;
                    width: 50%;
                }

                .input-box-footer-right {
                    display: inline-block;
                    width: 50%;
                    text-align: right;
                }
            }
        }

        /deep/ .input-panel-bottom {
            display: flex;
            align-items: center;

            span:first-child {
                width: 33px;
            }

            .ivu-select {
                margin: 0 3px;
            }

            .ivu-btn-success {
                padding: 0 10px;
            }

        }

        /deep/ .fb-inbox-window-header {
            height: 64px;
            margin: 0 20px;
            display: flex;
            align-items: center;
        }
    }
</style>
