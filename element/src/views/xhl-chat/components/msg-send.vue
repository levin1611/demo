<template>
    <div class="m-chat-editor" @click="hideRobotList">
        <div style="display: none">{{verbal}}</div>
        <!--全屏时发送框-->
        <div v-if="parentView==='FullScreen'"
             class="m-chat-editor-main">
            <DragFile type="drag"
                      multiple
                      :disabled="sendLoading"
                      :accId="to"
                      :paste="true"
                      :showUploadList="true"
                      :format="fileFormats"
                      :maxSize="fileSize"
                      :visitorId="currVisitorId"
                      :uploadMethod="uploadMethod"
                      ref="dragFile"
                      @updateFileList="updateFileList">
                <!-- 输入框 -->
                <div>
                    <Input
                            :disabled="disableChat[currVisitorId] === true"
                            type="textarea"
                            id="sendMsg"
                            ref="sendMsg"
                            v-model="msgToSent"
                            :autosize="{minRows: 2,maxRows: 3}"
                            :placeholder="$t('chat.inputbox') + $t('aiToolBar.orPlaceholder')"
                            @keydown.native="inputOnKeyDown"
                            @blur="handleInputBlur"
                            @input="rough_draft()"
                            @focus="handleFocus"
                            @mouseup.native="onIputSelect"
                            class="break-word-textarea"></Input>
                </div>
                <!-- 底部按钮 -->
                <div style="margin-top: 10px"
                     class="msg-send">
                    <!-- 翻译 - 选择语言 -->
                    <Select v-model="selectedLang"
                            label-in-value
                            style="width:100px;text-align: center;margin-right: 15px">
                        <Option v-for="item in languageList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label">{{ item.label }}</Option>
                    </Select>
                    <!-- 话术 -->
                    <div @click="showVerbal"
                         style="display: inline-block;margin-right: 10px;cursor: pointer"
                         class="piwik_ChatShowVerbal">
                        <Tooltip :content="$t('chat.verbal')">
                            <Icon custom="custom custom-verbal-trick"
                                  size="20"></Icon>
                        </Tooltip>
                    </div>
                    <!-- 发送文件 -->
                    <div style="display: inline-block">
                        <Dropdown v-if="isContainsMenu('database')"
                                  trigger="hover"
                                  placement="top">
                            <!-- trigger -->
                            <div class="u-editor-icon">
                                <Icon custom="custom custom-annex-file"
                                      size="20"></Icon>
                            </div>

                            <DropdownMenu slot="dropdown"
                                          class="chat-upload-option">
                                <DropdownItem @click.native="sendFile"
                                              class="piwik_ChatUploadFile">{{ $t('whatsapp_manage.upload_local') }}</DropdownItem>
                                <DropdownItem @click.native="sendFile('dataBase')"
                                              class="piwik_chat_uploadFile_dataBase">{{ $t('whatsapp_manage.upload_dataBase') }}</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <div v-else
                             @click="sendFile"
                             class="u-editor-icon">
                            <Tooltip :content="$t('chat.uploadFiles')">
                                <Icon custom="custom custom-annex-file piwik_ChatUploadFile"
                                      size="20"></Icon>
                            </Tooltip>
                        </div>
                    </div>

                    <!-- 发送 -->
                    <Button type="primary"
                            :disabled="disable_sendMsg"
                            :loading="sendLoading"
                            @click="sendMessage"
                            style="float: right;margin-right: 75px;"
                            class="piwik_ChatSendMsg">{{ sendBtnText }}</Button>
                    <!-- 翻译 -->
                    <Button :disabled="!msgToSent.trim()"
                            @click="translateTo"
                            style="float: right;margin-right: 5px"
                            class="piwik_ChatTranslate">{{ $t('chat.translate') }}</Button>
                </div>
                <!-- float 清空 -->
                <div style="clear: both"></div>
            </DragFile>
        </div>
        <!--分屏时发送框-->
        <div v-else
             class="chatFooter">
            <DragFile type="drag"
                      multiple
                      :disabled="sendLoading"
                      :accId="to"
                      :paste="true"
                      :showUploadList="true"
                      :format="fileFormats"
                      :maxSize="fileSize"
                      :visitorId="currVisitorId"
                      :uploadMethod="uploadMethod"
                      ref="dragFile"
                      @updateFileList="updateFileList"
                      style="width: 100%;line-height: 0;">
                <div class="input-box">
                    <!-- 话术 -->
                    <Icon custom="custom custom-verbal-trick"
                          size="19"
                          @click="showVerbal"
                          style="cursor:pointer;line-height: 32px;"
                          class="piwik_ChatSplitShowVerbal"></Icon>
                    <!-- 输入框 -->
                    <Input v-model="msgToSent"
                           type="textarea"
                           :autosize="{minRows: 1,maxRows: 3}"
                           :placeholder="$t('placeholder.sendTip')"
                           @input="rough_draft()"
                           @keydown.native="inputOnKeyDown"
                           @blur="handleInputBlur"
                           @focus="handleFocus"
                           ref="sendMsg"
                           id="splitScreenSendMsg"
                           style="padding:0 6px;"
                           @mouseup.native="onIputSelect"
                           class="break-word-textarea"/>
                    <!-- 翻译按钮 -->
                    <Icon custom="custom custom-translate"
                          size="20"
                          @click.native="$store.commit('setTranslateShow', !translateShow)"
                          style="cursor:pointer;line-height: 32px;"></Icon>
                    <!-- 上传文件按钮 -->
                    <div style="padding: 0 5px;">
                        <Dropdown v-if="isContainsMenu('database')"
                                  trigger="hover"
                                  placement="top">
                            <!-- trigger -->
                            <div class="u-editor-icon">
                                <Icon custom="custom custom-annex-file"
                                      size="20"></Icon>
                            </div>

                            <DropdownMenu slot="dropdown"
                                          class="chat-upload-option">
                                <DropdownItem @click.native="sendFile"
                                              class="piwik_ChatSplitUploadFile">{{ $t('whatsapp_manage.upload_local') }}</DropdownItem>
                                <DropdownItem @click.native="sendFile('dataBase')"
                                              class="piwik_chat_split_uploadFile_dataBase">{{ $t('whatsapp_manage.upload_dataBase') }}</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <div v-else
                             @click="sendFile"
                             class="u-editor-icon">
                            <Tooltip :content="$t('chat.uploadFiles')">
                                <Icon custom="custom custom-annex-file piwik_ChatSplitUploadFile"
                                      size="20"></Icon>
                            </Tooltip>
                        </div>
                    </div>
                    <!-- 发送按钮 -->
                    <Button v-show="!disable_sendMsg"
                            size="mini"
                            :disabled="disable_sendMsg"
                            :loading="sendLoading"
                            @click="sendMessage"
                            style="padding: 7px 10px;height: 32px;"
                            class="piwik_ChatSplitSendMsg">{{ sendBtnText }}</Button>
                </div>
                <!-- 翻译区域 -->
                <div v-show="translateShow"
                     style="margin-top: 10px;">
                    <!-- 选择语言 -->
                    <Select v-model="selectedLang"
                            style="width:98px;margin-right:16px;">
                        <Option v-for="item in languageList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label">{{ item.label }}</Option>
                    </Select>
                    <!-- 翻译按钮 -->
                    <Button :disabled="!msgToSent.trim()"
                            size="small"
                            :loading="translateLoading"
                            @click="translateTo"
                            class="piwik_ChatSplitTranslate">{{ $t('chat.translate') }}</Button>
                </div>
            </DragFile>
        </div>

        <!-- 访客和别人聊天提醒框 -->
        <!--<Modal-->
        <!--    :visible.sync="modal1"-->
        <!--    :show-close="false"-->
        <!--    :modal-append-to-body="false"-->
        <!--    :append-to-body="true"-->
        <!--    :title="$t('chat.warmPrompt')">-->
        <!--    <div><p style="text-align: center">{{tips}}</p></div>-->
        <!--    <div slot="footer">-->
        <!--        <Button type="primary" @click="ok1">{{$t('chat.knowBtn')}}</Button>-->
        <!--    </div>-->
        <!--</Modal>-->
    </div>
</template>

<script>
    import util from '../../../libs/util';
    import config from '../../../configs';
    import Cookies from 'js-cookie';
    import { mapState, mapGetters, mapActions } from 'vuex';
    import translateLang from '@/mixins/translateLang';
    import DragFile from '../../main-components/drag-file-YX';
    import translateSendChat from '@/views/xhl-chat/chatMixin';

    // ai tool bar website chat
    import { getInputSelectedText, coverText, insertText } from '@/views/ai-toolbar/utils/tools'

    export default {
        mixins: [translateLang, translateSendChat],
        components: {
            DragFile
        },
        props: {
            to: String,
            parentView: {
                type: String,
                default: 'FullScreen'
            }
        },
        watch: {
            disableChat: {
                handler(curVal) {
                    if (curVal[this.currVisitorId] === true) {
                        this.msgToSent = '';
                    }
                },
                deep: true
            },
            to(val) {
                if (val) {
                    this.msgToSent = this.$store.state.msgDraft[val] || '';
                }
            },
             
            // ai tool bar
            msgToSent(val) {
                if (val.toLowerCase() === '/ai') {
                    this.$aiToolBar.init({
                        type: 'inputBoxSlash',
                        onConfirm: v => {
                            this.$aiToolBar.destroy()
                            this.msgToSent = v

                            const subInput = document.getElementById("sendMsg")
                            subInput.focus()
                            this.$nextTick(() => {
                                subInput.setSelectionRange(0, v.length)
                            })
                        },
                        onAbort: () => {
                            this.msgToSent = ''
                        }
                    })
                }else {
                    this.$aiToolBar.destroy()
                }
            } 
        },
        data() {
            return {
                inputFlag: true,
                sendLoading: false,
                translateLoading: false,
                // translateShow: false,
                modal1: false,
                type: 'session',
                isEmojiShown: false,
                isRobotListShown: false,
                msgToSent: '',
                icon1: `${config.resourceUrl}/im/chat-editor-1.png`,
                icon2: `${config.resourceUrl}/im/chat-editor-2.png`,
                icon3: `${config.resourceUrl}/im/chat-editor-3.png`,
                scene: 'p2p',
                selectedLang: 'en',
                inputBlurIndex: 0,

                // 文件上传
                fileList: [],
                // fileFormats: ['gif', 'jpg', 'jpeg', 'png', 'pdf', 'xls', 'xlsx', 'txt', 'ppt', 'pptx', 'doc', 'docx'],
                fileFormats: [],
                fileSize: 25,
                // 附件上传的两种方式： normal---普通上传 dataBase--- 关联询盘云资料库上传
                uploadMethod: 'normal'
            };
        },
        beforeDestroy() {
            this.handleInputBlur = null;
            this.handleFocus = null;
            // window.removeEventListener('beforeunload', this.handleInputBlur);
        },
        computed: {
            ...mapState({
                fullName: 'fullName',
                notChatWithOther: 'notChatWithOther',
                currVisitorId: 'currVisitorId',
                disableChat: 'disableChat',
                flagToInput: 'flagToInput',
                translateShow: 'translateShow',
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                currSessionId: state => state.currSessionId
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            // tips() {
            //     return this.$store.state.ChatWithOtherTip;
            // },
            verbal() {
                const currIndex = this.currVisitorId;
                console.log('this.inputBlurIndex111', this.inputBlurIndex);
                if (this.$store.state.msgToSentTemp[currIndex]) {
                    const tempL = this.$store.state.msgToSentTemp[currIndex].length;
                    if (this.inputBlurIndex < this.msgToSent.length) {
                        this.msgToSent = this.msgToSent.substring(0, this.inputBlurIndex) + this.$store.state.msgToSentTemp[currIndex] + this.msgToSent.substring(this.inputBlurIndex);
                    } else {
                        this.msgToSent = this.msgToSent + this.$store.state.msgToSentTemp[currIndex];
                    }
                    //                    this.msgToSent = this.msgToSent.replace(eval("/(.{" + this.inputBlurIndex + "})/"), "$1"+this.$store.state.msgToSentTemp[currIndex])
                    console.log('this.msgToSent', this.msgToSent);
                    this.$store.state.msgToSentTemp[currIndex] = '';
                    let dom;
                    if (this.parentView === 'FullScreen') {
                        dom = document.getElementById('sendMsg');
                    } else {
                        dom = document.getElementById('splitScreenSendMsg');
                    }
                    console.log('tempL', tempL);
                    console.log('dom', dom);
                    console.log('this.inputBlurIndex', this.inputBlurIndex);
                    if (dom.setSelectionRange) {
                        this.$nextTick(() => {
                            // dom.focus();
                            dom.setSelectionRange(this.inputBlurIndex + tempL, this.inputBlurIndex + tempL);
                        });
                    }
                }
            },
            robotslist() {
                return this.$store.state.robotslist;
            },
            robotInfos() {
                return this.$store.state.robotInfos;
            },
            robotInfosByNick() {
                return this.$store.state.robotInfosByNick;
            },
            // 文件列表不为空且全部上传完成
            canSendFile() {
                return this.fileList.every(file => file.status === 'finished');
            },
            // 是否禁用发送消息按钮
            disable_sendMsg() {
                let result = true;

                if (this.fileList.length) {
                    // 若有文件列表, 且文件均已上传完成, 则可点击发送
                    result = !this.canSendFile;
                } else if (this.msgToSent.trim()) {
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
        mounted() {
            window.onblur = () => {
                console.log('页面失焦');
                if (this.$route.name === 'xhl_chat') {
                    this.handleInputBlur();
                } else {
                    window.onblur = null;
                }
            };
        },
        methods: {
            ...mapActions([
                'getVisitorReception' // 获取访客最近接待客服是否在线, 当前是否正在聊天
            ]),
            handleFocus(e) {
                console.log('focus事件');
                if (e) {
                    this.inputBlurIndex = e.target.selectionStart;
                }
                if (Cookies.get('notChatWithOther') && this.inputFlag) {
                    const account = {
                        contentId: 103,
                        to: this.to,
                        serviceName: this.fullName
                    };
                    // this.flagToInput = true;
                    // this.$store.commit('setFlagToInput', true);
                    this.$store.commit('sendCustomService', account);
                    this.$store.commit('setFlagToInput', true);
                }
            },
            handleInputBlur(e) {
                console.log('blur事件');
                if (e) {
                    this.inputBlurIndex = e.target.selectionStart;
                }
                if (Cookies.get('notChatWithOther')) {
                    const account = {
                        contentId: 104,
                        to: this.to,
                        serviceName: this.fullName
                    };
                    // this.flagToInput = false;
                    // this.$store.commit('setFlagToInput', false);
                    this.$store.commit('sendCustomService', account);
                    this.$store.commit('setFlagToInput', true);
                }
            },
            inputOnKeyDown(e) {
                const inputKeyDownIndex = e.target.selectionStart;
                console.log('onkeydown', this.flagToInput);
                if (this.flagToInput) {
                    this.handleFocus(e);
                }

                // 回车判断是发送还是换行
                if (e.keyCode === 13) {
                    if (e.ctrlKey || e.shiftKey) {
                        // 换行

                        console.log('OnKeyDown', e);
                        let dom;
                        if (this.parentView === 'FullScreen') {
                            dom = document.getElementById('sendMsg');
                        } else {
                            dom = document.getElementById('splitScreenSendMsg');
                        }
                        this.msgToSent = `${this.msgToSent.substring(0, inputKeyDownIndex)}\n${this.msgToSent.substring(inputKeyDownIndex)}`;
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
                        // input on-change 监听不到换行，所以调用方法，修改缓存的值
                        this.rough_draft();
                    } else {
                        // 发送

                        e.preventDefault();
                        this.sendMessage();
                    }
                }

                // this.flagToInput = false;
                this.$store.commit('setFlagToInput', false);
            },
            rough_draft() {
                // 缓存这个对话输入框的内容
                this.$store.state.msgDraft[this.to] = this.msgToSent;
            },
            async sendMessage() {
                // 判断当前 visitorId 是否可以或正在被当前客服接待, 是则可以各种操作访客数据或发消息
                const temp = await this.getVisitorReception(this.currVisitorId);
                if (temp) {
                    this.allowToSendMsg();
                }
            },
            sendFileMessage(file) {
                this.$store.dispatch('sendFileMsg', {
                    scene: this.scene,
                    to: this.to,
                    content: file.YXFile,
                    previewedFileType: file.type
                });
            },
            // 更新文件列表
            updateFileList(val) {
                this.fileList = val;
            },
            // async isChatWithOther() {
            //     console.log('isChatWithOther', this.$store.state.isChatWithOther[this.$store.state.currSessionId]);
            //     // 如果存有该访客正在和别人聊天的state且为true
            //     if (this.$store.state.isChatWithOther[this.$store.state.currSessionId]) {
            //         const warnTip = this.$store.state.ChatWithOtherTip;
            //         this.$Message.warning(warnTip);
            //         this.$store.commit('confirmNotChatWithOther', false);
            //         this.$store.commit('setDisableChat', true);
            //         return false;
            //     } else if (this.$store.state.isChatWithOther[this.$store.state.currSessionId] === undefined) {
            //         // 如果存有该访客正在和别人聊天的state且为true
            //         /* 访客是否正在和别人聊天 */
            //         return new Promise((resolve, reject) => {
            //             util.ajaxInternational({
            //                 url: '/visitor/isVisitorOnChat',
            //                 method: 'post',
            //                 data: {
            //                     visitorServerAccId: Cookies.get('accId'),
            //                     visitorId: this.$store.state.currVisitorId
            //                 }
            //             }).then(response => {
            //                 if (response.data.code == 2) {
            //                     this.$store.state.ChatWithOtherTip = response.data.message;
            //                     this.modal1 = true;
            //                     this.$store.commit('updateChatWithOtherList', {
            //                         account: this.$store.state.currSessionId,
            //                         status: true
            //                     });
            //                     // this.$store.commit('confirmNotChatWithOther', false);
            //                     this.$store.commit('setDisableChat', true);
            //                     resolve(false);
            //                 } else if (response.data.code == 1) {
            //                     if (!Cookies.get('notChatWithOther')) {
            //                         Cookies.set('notChatWithOther', true);
            //                     }
            //                     this.$store.commit('setDisableChat', false);
            //                     resolve(true);
            //                 }
            //             });
            //         });
            //     } else {
            //         if (!Cookies.get('notChatWithOther')) {
            //             Cookies.set('notChatWithOther', true);
            //         }
            //         this.$store.commit('setDisableChat', false);
            //         return true;
            //     }
            // },
            allowToSendMsg() {
                // 发送文字消息
                let canSendText = true;
                if (/^\s*$/.test(this.msgToSent)) {
                    // 文字消息全为空格
                    if (!this.canSendFile) {
                        // 如果不可发送文件, 则提示错误, 否则不提示
                        this.$Message.warning(this.$t('chat.sendMsgTip'));
                    }
                    canSendText = false;
                } else if (this.msgToSent.length > 2000) {
                    // 文字消息超出上限
                    this.$Message.warning(this.$t('chat.sendMsgTip1'));
                    canSendText = false;
                }
                if (canSendText) {
                    this.msgToSent = this.msgToSent.trim();
                    if (this.msgToSent.length === 0) {
                        this.$Message.warning(this.$t('chat.sendMsgTip2'));
                        return;
                    }
                    if (this.type === 'session') {
                        this.$store.dispatch('sendMsg', {
                            type: 'text',
                            scene: this.scene,
                            to: this.to,
                            text: this.msgToSent
                        });
                    }
                    this.msgToSent = '';
                    const currIndex = this.currVisitorId;
                    this.$store.state.msgToSentTemp[currIndex] = '';
                    this.$store.state.msgDraft[this.to] = '';
                }

                // 发送文件消息
                // 一次性发完有可能导致消息的时间戳一致, 聊天消息顺序可能混乱, 所以这里加上延时发送
                if (this.fileList.length && this.canSendFile) {
                    this.sendLoading = true;
                    const postFiles = Array.prototype.slice.call(this.fileList);
                    this.$refs.dragFile.clearFiles();
                    postFiles.forEach((file, index) => {
                        setTimeout(() => {
                            this.sendFileMessage(file);
                            if (index === postFiles.length - 1) {
                                this.sendLoading = false;
                            }
                        }, (index + 1) * 100);
                    });
                }
            },
            async sendFile(isDatabase) {
                // 判断当前 visitorId 是否可以或正在被当前客服接待, 是则可以各种操作访客数据或发消息
                const temp = await this.getVisitorReception(this.currVisitorId);
                if (temp) {
                    this.uploadMethod = isDatabase === 'dataBase' ? 'dataBase' : 'normal';
                    this.$nextTick(() => {
                        this.$refs.dragFile.handleClick();
                    });
                }
            },

            // ok1() {
            //     this.modal1 = false;
            // },
            hideRobotList() {
                this.isRobotListShown = false;
            },
            translateTo() {
                const text = this.msgToSent.trim();
                if (text.length === 0) {
                    this.$Message.warning(this.$t('chat.sendMsgTip3'));
                    return;
                }
                this.translate(text);
            },
            translate(text) {
                util.ajaxInternational({
                    url: '/translation/translation',
                    method: 'post',
                    data: {
                        requestText: text.replace(/(\r\n|\r|\n)/g, '<br>'),
                        targetLang: this.selectedLang
                    }
                }).then(response => {
                    if (response.data) {
                        console.log(123123);
                        this.msgToSent = response.data.data.translations[0].translatedText.replace(/<br>/g, '\n');
                    }
                });
            },
            async showVerbal() {
                // 判断当前 visitorId 是否可以或正在被当前客服接待, 是则可以各种操作访客数据或发消息
                const res = await this.getVisitorReception(this.currVisitorId);
                if (res) {
                    if (this.parentView === 'FullScreen') {
                        this.$store.state.isShowVerbal = !this.$store.state.isShowVerbal;
                    } else {
                        this.$emit('letShortcutsShow', true);
                    }
                }
            },

            // ai tool bar
            onIputSelect(e) {
                const result = getInputSelectedText()
                if (result.text) {

                    const insert = (newText, insertStart, insertEnd) => {
                        this.msgToSent = newText
                        const subInput = document.getElementById("sendMsg")
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
                            const newText = coverText(this.msgToSent, v, result)
                            insert(newText, result.start, result.start + v.length)
                        },
                        onInsert: (v) => {
                            const newText = insertText(this.msgToSent, v, result)
                            insert(newText, result.end, result.end + v.length)
                        }
                    })
                } else {
                    this.$aiToolBar.destroy()
                }
            },
        }
    };
</script>

<style scoped lang="less">
    .m-chat-editor {
        & /deep/ .ivu-upload-drag {
            border: none;
            display: inline-block;
            width: 100%;
            background-color: #fafcff;

            &:hover {
                border: none;
            }
        }

        /*& /deep/ .ivu-upload-dragOver {*/
        /*    border: 3px dashed #B6C1CF;*/
        /*}*/
    }

    .input-box {
        .ivu-drawer-wrap .ivu-input {
            border: none;
        }
    }

    .m-chat-editor-main {
        border-top: 1px solid #e8e8e8;

        /deep/ .ivu-upload-drag {
            text-align: left;
            padding: 10px;

            .drag-file-list {
                margin: 0 -6px;
            }
        }
    }

    .u-editor-icon {
        cursor: pointer;
        display: inline-block;
        line-height: 32px;
    }

    .m-chat-robot {
        overflow-y: scroll;

        .weui-cells {
            .weui-cell__hd {
                margin-right: 0.5rem;
            }
        }
    }

</style>

<style lang="less">
    .m-chat-editor-main {
        .ivu-input {
            border: none;
            outline: none;
        }

        .ivu-input:focus {
            box-shadow: none;
        }
    }

    .chatFooter {
        /*bottom: 0;*/
        /*left: 0;*/
        /*right: 0;*/
        background: #FAFCFF;
        box-shadow: inset 0 1px 0 0 #F5F5F5;

        .ivu-upload-drag {
            padding: 10px 20px 10px;
            text-align: left;

            .drag-file-list {
                margin: 0 -6px;
            }
        }

        .input-box {
            display: flex;
            align-items: flex-end;
            line-height: 23px;

            .ivu-input {
                background: #FAFCFF;
                border: none;
                -webkit-box-shadow: none;
                box-shadow: none;
                padding: 0;
            }

            .ivu-input:focus {
                box-shadow: none;
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

    .break-word-textarea {
        textarea {
            word-break: break-word;
        }
    }

    .chat-upload-option {
        text-align: center;
        max-height: 300px;
        width: 120px;
        white-space: nowrap;
    }
</style>
