<template>
    <div id="whatsapp-send"
         style="position: relative;"
         class="m-chat-editor">
        <!-- loading -->
        <Spin v-if="isGroup && !(currAccountInfo.groupInfo && currAccountInfo.groupInfo.size)"
              fix></Spin>

        <!-- 显示"无法发送群组消息"类提示 -->
        <div v-show="isGroup && !ableSendGroupMsg"
             class="unableToSendGroupMsgTip">{{ unableSendGroupMsgReason }}</div>

        <!-- @群成员选择列表 -->
        <div v-if="isGroup">
            <AiTeMember v-show="showAiTeMember && !quotedMessageId"
           :styleObj="styleObj"
           :showAiTeMember.sync="showAiTeMember"
           :whatsAppAccountInfo="whatsAppAccountInfo"
           :chatInfo="currAccountInfo"
           :serchByNickName="serchByNickName"
           @setChoseMember="setChoseMember"
           :key="ForceUpdate"></AiTeMember>
        </div>


        <!--全屏时发送框-->
        <div v-show="!isGroup || ableSendGroupMsg"
             class="m-chat-editor-main">
            <!-- 表情 -->
            <Poptip trigger="click"
                    width="403"
                    placement="top"
                    :disabled="inputDisabled"
                    ref="emojiPop"
                    @show="handleToggleEmojiPop(true)"
                    @hide="handleToggleEmojiPop(false)">
                <!-- trigger -->
                <span slot="reference"
                      ref="emojiTrigger"
                      class="whatsApp-emojiPop-trigger">.</span>

                <!-- content -->
                <Emoji @checkEmoji="handleCheckEmoji"></Emoji>
            </Poptip>

            <!-- 时间轴弹出框话术 pop -->
            <Poptip v-if="fromFlag === 'timeline'"
                    trigger="click"
                    width="403"
                    placement="top"
                    popper-class="no-padding"
                    :disabled="inputDisabled"
                    ref="verbalPop"
                    @show="handleToggleVerbalPop(true)"
                    @hide="handleToggleVerbalPop(false)">
                <!-- trigger -->
                <span slot="reference"
                      ref="verbalTrigger"
                      class="whatsApp-verbalPop-trigger">.</span>

                <!-- content -->
                <!-- 话术 -->
                <div style="position: relative; height: 280px;">
                    <short-cuts :controVerbalIcon="0"
                                content_height="280px"
                                @letShortcutsShow="triggerVerbalPop"
                                @verbalSelected="insertVerbal"></short-cuts>
                </div>
            </Poptip>

            <!-- 正在输入中区域 -->
            <div v-if="enteringInfoArr.length"
                 class="enteringInfo-container">
                <div v-for="enteringInfo in enteringInfoArr"
                     :key="enteringInfo.userId"
                     class="enteringInfo">
                    <div class="enteringInfo-nick">{{ enteringInfo.nickName }}</div>
                    <div class="enteringInfo-status">{{ $t('chat.isInputing') }}：</div>
                    <div class="enteringInfo-content">{{ enteringInfo.content }}</div>
                </div>
            </div>

            <!-- 被回复消息 -->
            <div v-if="quotedMessageId"
                 class="reply-msg-container">
                <!-- 消息体 -->
                <div class="reply-msg-body">
                    <WaQuoteMsg :rawMsg="replyMsg"
                                :whatsAppAccountInfo="whatsAppAccountInfo"
                                v-bind="$attrs"></WaQuoteMsg>
                </div>

                <!-- 关闭按钮 -->
                <div class="reply-msg-clsBtn">
                    <Icon custom="custom custom-follow-edit-area-close"
                          size="14"
                          @click.native="clearReplyMsg"
                          class="cursor-pointer"></Icon>
                </div>
            </div>

            <!-- 输入框 + 文件拖拽框 -->
            <div>
                <DragFile
                        multiple
                        type="drag"
                        ref="dragFile"
                        fromModule="whatsApp"
                        :disabled="uploadIsDisabled"
                        :paste="true"
                        :show-upload-list="true"
                        :format="fileFormats"
                        :maxSize="fileSize"
                        :maxFileLength="maxFileLength"
                        :specialFileLimit="specialFileLimit"
                        :uploadMethod="uploadMethod"
                        @updateFileList="updateFileList">
                    <!-- 因为正常 textarea 无法显示 emoji img , 现在将输入框改为 contentEditable div -->
                    <div :contentEditable="!inputDisabled"
                         ref="sendMsg"
                         @click="save_range();isNeedSearch()"
                         @keyup="save_range"
                         @keydown="inputOnKeyDown"
                         @paste="handlePaste"
                         @compositionstart="onCompositionStart"
                         @compositionend="onCompositionEnd"
                         @focus="handleFocus"
                         @mouseup="onIputSelect"
                         :placeholder="$t('chat.inputbox') + $t('aiToolBar.orPlaceholder')"
                         :class="{'waInputDiv__disabled': inputDisabled}"
                         class="waInputDiv"></div>
                </DragFile>
            </div>

            <!-- 相关按钮 -->
            <div class="msg-send" style="margin-top: 10px">
                <!-- 选择语言翻译 -->
                <Select v-model="selectedLang"
                        :disabled="inputDisabled"
                        label-in-value
                        style="width:100px;text-align: center;margin-right: 15px">
                    <Option v-for="(item, index) in languageList"
                            :key="index"
                            :value="item.value"
                            :label="item.label">{{ item.label }}</Option>
                </Select>

                <!-- 模版消息弹窗 -->
                <Button v-if="isWABA"
                        :loading="isSendingText"
                        @click="setTempalte"
                        class="toogleTemplate">{{$t('chat.Templatemessage')}}</Button>

                <!-- 话术 -->
                <div v-if="!isWAPersonalEdition"
                     @click="triggerVerbal"
                     style="display: inline-block;margin-right: 15px;cursor: pointer"
                     :style="`${inputDisabled ? 'cursor: not-allowed' : ''}`"
                     class="piwik_waShowVerbal">
                    <Tooltip :content="$t('chat.verbal')">
                        <Icon custom="custom custom-verbal-trick"
                              size="20"></Icon>
                    </Tooltip>
                </div>

                <!-- 选择文件发送附件 -->
                <template >
                    <Dropdown v-if="isContainsMenu('database')"
                              trigger="hover"
                              :disabled="uploadIsDisabled"
                              placement="top">
                        <!-- trigger -->
                        <div class="whatsApp-upload-file">
                            <Icon custom="custom custom-annex-file"
                                  size="19"
                                  :style="`${uploadIsDisabled ? 'cursor: not-allowed' : ''}`"></Icon>
                        </div>

                        <DropdownMenu slot="dropdown"
                                      :class="[uploadIsDisabled?'hide-drop-menu':'']"
                                      class="whatsApp-upload-option">
                            <DropdownItem @click.native="trigger_upload"
                                          class="piwik-whatsApp-drag-file-list">{{ $t('whatsapp_manage.upload_local') }}</DropdownItem>
                            <DropdownItem @click.native="trigger_upload('dataBase')"
                                          class="piwik_wa_uploadFile_dataBase">{{ $t('whatsapp_manage.upload_dataBase') }}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <div v-else
                         class="whatsApp-upload-file">
                        <Icon custom="custom custom-annex-file"
                              size="19"
                              @click="trigger_upload"
                              :style="`${uploadIsDisabled ? 'cursor: not-allowed' : ''}`"></Icon>
                    </div>
                </template>

                <!-- 选择表情 trigger -->
                <div style="display: inline-block">
                    <Icon slot="reference"
                          custom="custom custom-emoji"
                          size="19"
                          @click.native="trigger_emoji"
                          :style="`${inputDisabled ? 'cursor: not-allowed' : ''}`"
                          :class="{'whatsApp-insert-emoji__active': visible_emojiPop && !inputDisabled}"
                          class="whatsApp-insert-emoji"></Icon>
                </div>

                <!-- 发送按钮 -->
                <Button :disabled="sendBtnDisabled"
                        :loading="isSendingText"
                        @click="handleSendMsg"
                        style="float: right;"
                        class="whatsapp-manage-send">{{$t('chat.send')}}</Button>

                <!-- 翻译按钮 -->
                <Button :disabled="sendBtnDisabled || !msgToSent"
                        :loading="isTranslating"
                        @click="translateTo"
                        style="float: right;margin-right: 12px;"
                        class="whatsapp-manage-translateservice">{{$t('chat.translate')}}
                </Button>

                <!-- 多账号切换下拉 -->
                <Poptip v-if="(fromFlag === 'timeline') && checkAccountList.length"
                       
                        trigger="click"
                        transfer
                        placement="top-end"
                        :offset="-140"
                        :arrowOffset="40"
                        popper-class="ownWaAccount-popper"
                        ref="accountPop">
                    <div slot="reference"
                         class="ownWaAccount-trigger">
                        <!-- 名称 -->
                        <TooltipAuto :key="whatsAppAccountInfo.whatsappAccount"
                                     :content="whatsAppAccountInfo.whatsappName || toggleWAAccount(whatsAppAccountInfo.whatsappAccount)"
                                     transfer
                                     class="chat-name-tooltip">
                            <div class="brand-page-name">{{ whatsAppAccountInfo.whatsappName || toggleWAAccount(whatsAppAccountInfo.whatsappAccount) }}</div>
                        </TooltipAuto>

                        <!-- 在线状态文字 或 重新登录按钮 -->
                        <div v-if="`${whatsAppAccountInfo.loginStatus}` !== '1'"
                             style="margin: 0 10px 0 0;"
                             class="login_prompt login_prompt_offline">({{ $t('whatsappSetting.loginFailure') }})</div>

                        <!-- 下拉按钮 -->
                        <Icon custom="custom custom-menu-arrow"
                              color="#7B98B6"
                              size="10"></Icon>
                    </div>

                    <!-- 账号容器 -->
                    <div class="ownWaAccount-list">
                        <!-- 账号 -->
                        <div v-for="ownAccountInfo in checkAccountList"
                             @click="checkOwnWAAccount(ownAccountInfo)"
                             class="ownWaAccount-item">
                            <!-- 头像 -->
                            <div class="ownWaAccount-avatar">
                                <Avatar v-if="ownAccountInfo.whatsappAvatar"
                                        :src="ownAccountInfo.whatsappAvatar"
                                        class="avatar-small" />
                                <svg v-else
                                     aria-hidden="true"
                                     class="chat-svg-avatar">
                                    <use xlink:href="#custom-visitor-avatar"></use>
                                </svg>
                            </div>

                            <!-- 名称 + 在线状态 -->
                            <div class="ownWaAccount-nickInfo">
                                <!-- 账号名 -->
                                <TooltipAuto :key="ownAccountInfo.whatsappAccount"
                                             :content="ownAccountInfo.whatsappName || toggleWAAccount(ownAccountInfo.whatsappAccount)"
                                             transfer
                                             class="ownWaAccount-nick">{{ ownAccountInfo.whatsappName || toggleWAAccount(ownAccountInfo.whatsappAccount) }}</TooltipAuto>

                                <!-- 在线状态文字 或 重新登录按钮 -->
                                <div v-if="`${ownAccountInfo.loginStatus}` !== '1'"
                                     class="login_prompt login_prompt_offline ownWaAccount-status">{{ $t('whatsapp_manage.loginInvalid1') }}</div>
                            </div>
                        </div>
                    </div>
                </Poptip>
            </div>

            <!-- 清除浮动 -->
            <div style="clear: both"></div>
        </div>

        <!-- 消息发送失败时弹出的modal -->
        <Modal
            :visible="visible_send_msg_err"
            :modal-append-to-body="false"
            @close="visible_send_msg_err = false"
            top="40vh"
            width="448px"
            :title="$t('whatsapp_manage.messageSendingTimeoutReminder')">
            <p style="font-family: PingFang SC;font-size: 14px;font-weight: 400;line-height: 22px;color: #000000CC;">
                {{ $t('whatsapp_manage.pleaseCheckTheNetworkSignalOrScanTheCodeToLogInAgain') }}
            </p>
            <div slot="footer">
                <Button type="primary" @click="logInAgain">{{ $t('whatsapp_manage.logInAgain') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import translateLang from '@/mixins/translateLang';
    import DragFile from '@/views/main-components/drag-file-postByFile.vue';
    import Emoji from '@/views/whatsapp-manage/components/emoji.vue';
    import WaQuoteMsg from '@/views/whatsapp-manage/components/waQuoteMsg';
    import ShortCuts from '@/views/main-components/Shortcuts.vue';
    import AiTeMember from '@/views/whatsapp-manage/whatsApp-chat-frame/whatsAiTeMember';
    import { getTranslateMemory, setTranslateMemory, saveTranslateMsg,broadcastChatContent, deleteBroadcastChatContent } from '@/api/whatsapp.js';
    import { triggerGtag } from '@/utils/base';

    // ai tool bar
    import { getSelectedText, autoSelectedNode} from '@/views/ai-toolbar/utils/tools'

    let timerForSendMsg = null; // 发送消息定时器
    export default {
        inheritAttrs: false,
        mixins: [translateLang],
        components: {
            DragFile,
            Emoji,
            WaQuoteMsg,
            ShortCuts,
            AiTeMember
        },
        props: {
            // 通知父元素群组是否触发翻译
            groupAutoTrans: {
                type: String
            },
            // index.vue传来的会话id
            chatListId: {
                type: String
            },
            currAccountInfo: {
                type: Object,
                default() {
                    return {};
                }
            },
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
            // wa 聊天主界面右侧是否正在显示话术页
            isShowVerbal: {
                type: Boolean
            },
            // 被选中的话术
            selectedVerbal: {
                type: Object,
                default() {
                    return null;
                }
            },
            // 当前所处模块
            fromFlag: {
                type: String,
                default() {
                    return '';
                }
            },
            // 是否是从全局的回复框进入此组件
            isGlobal: {
                type: Boolean
            },
            // 当前用户已登录的 wa 账号
            whatsAppAccountList: {
                type: Array,
                default() {
                    return [];
                }
            },
            // WABA 会话下, 客户的最新回复时间
            lastReplyTime: {
                type: [Number]
            },
            // 打开会话时插入数据到发送框中, 格式为 { account: content }
            insertData: {
                type: [String, Object]
            }
        },
        watch: {
            // 监听当前绑定 wa 账号是否可以发言, 修改全局阈值
            computCanSendMsg: {
                handler(value) {
                    if (value.includes('UnSend')) {
                        this.$store.commit('setWaSendMsgFlag', true);
                        // this.$emit('update:groupAutoTrans', value);
                    } else {
                        this.$store.commit('setWaSendMsgFlag', false);
                        // 表示可以自动翻译
                        // this.$emit('update:groupAutoTrans', `${value}${new Date().getTime()}`);
                    }
                },
                immediate: true
            },
            smartFileObj: {
                handler(val) {
                    if (val) {
                        this.insertInputMsg(val);
                        this.$store.commit('setSmartFile', '');
                    }
                }
            },
            selectedLang: {
                async handler(nv, ov) {
                    this.$store.commit('setisInNotNeeDTranslateArr', nv);
                    // 选择语言时设置翻译记忆
                    if (this.fromFlag === 'timeline') {
                        // 如果在时间轴快速回复聊天弹窗中设置当前账号的翻译记忆 则同步到当前wa主页中
                        this.$EVENTBUS.$emit('syncWaChatModeMemory12', nv, this.currAccountInfo);
                    }
                    await setTranslateMemory({
                        language: nv,
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        sessionType: 12,
                        userAccount: this.whatsAppAccountInfo.whatsappAccount, // 询盘云 用户账号
                        visitorAccount: this.currAccountInfo.chatWaAccount // 访客账号
                    });
                }
            },
            // 切换会话时触发操作
            currAccountInfo: {
                handler(val, oldVal) {
                    // 会话是否发生变更标识
                    let flag = false;

                    if (val && !oldVal) {
                        // 有新数据, 无老数据, 发生变更
                        flag = true;
                    } else if (val) {
                        // 新老数据都有

                        if (val.id && val.id !== oldVal.id) {
                            // 有 id 且 id 有变化, 认为是会话发生了变化
                            flag = true;
                        } else if (val.chatWaAccount && val.chatWaAccount !== oldVal.chatWaAccount) {
                            // 有 chatWaAccount 且 chatWaAccount 有变化, 认为是会话发生了变化
                            flag = true;
                        }
                    }

                    // 会话有变动, 执行相关处理逻辑
                    if (flag) {
                        this.handleToggleChat();
                    }
                },
                deep: true,
                immediate: true
            },
            // 监听"待发送文本消息"变化, 适时调整输入框内容
            msgToSent: {
                handler(val, oldVal) {
                    // 暂存输入框 DOM
                    const inputDiv = this.$refs.sendMsg;
                    if (inputDiv) {
                        // 输入框 DOM 存在

                        if (val) {
                            // "待发送文本"有值
                            if (val.length > 8000) {
                                // 值长度超过上限

                                // 改回旧值
                                inputDiv.innerHTML = twemoji.parse(oldVal || '');
                            } else {
                                // 如果之前没有设置定时发送输入框文本消息定时器, 则此时开始设置
                                this.setTimer_sendContent();

                                // 如果输入框文本长度符合斐波那契数列, 则发送文本框内容到后端(主要是为了降低延迟)
                                if (this.fibonacciArr.includes(val.length)) {
                                    this.broadcastInputContent();
                                }

                                // ai tool bar
                                if (val.toLowerCase().trim() === '/ai') {
                                    this.$aiToolBar.init({
                                        type: 'inputBoxSlash',
                                        onConfirm: v => {
                                            inputDiv.innerHTML = '';
                                            this.$aiToolBar.destroy()
                                            autoSelectedNode(v, inputDiv)
                                        },
                                        onAbort: () => {
                                            inputDiv.innerHTML = '';
                                        }
                                    })
                                } else {
                                    this.$aiToolBar.destroy()
                                }
                            }
                            this.$store.commit('setUnsendMessages', inputDiv.innerHTML);
                        } else {
                            // 无值, 清空输入框

                            inputDiv.innerHTML = '';
                            this.$store.commit('setUnsendMessages', '');
                        }
                        this.isInputAite();
                        let range = null;
                        if (window.getSelection) {
                            const sel = window.getSelection();
                            if (sel.getRangeAt && sel.rangeCount) {
                                range = sel.getRangeAt(0);
                            }
                        } else if (document.selection && document.selection.createRange) {
                            range = document.selection.createRange();
                        }
                        this.lastRangeText = range;
                        // 英文输入法下 模糊匹配群成员列表
                        // 如果是英文输入法并且 当前成员列表显示那就直接搜索
                        if (!this.isPinYin && this.showAiTeMember) {
                            this.EnSearchM();
                        }
                    }
                },
                immediate: true
            },
            // 监听被引用消息 id
            quotedMessageId: {
                handler(val, oldVal) {
                    // 当 id 从无到有时, 光标自动聚焦到输入框
                    if (!oldVal) {
                        this.focusInputDiv();
                    }
                }
            },
            // 监听选中话术的变动, 插入到输入框中
            selectedVerbal: {
                handler(val) {
                    if (val) {
                        if(this.inputDisabled){
                            this.$Message.warning(this.$t('whatsapp_manage.onlyCanSendTemplate'));
                        }else{
                            this.insertVerbal(val);
                        }
                    }
                }
            },
            // 不允许显示话术框时, 关闭话术框
            // 配合"切换会话不隐藏话术框"需求, 考虑到 waba 会话可能切换后不允许显示话术框了, 加上此逻辑
            inputDisabled: {
                handler(val) {
                    if (!val) {
                        // 在 wa 聊天界面, 切换侧边话术页显隐
                        this.$emit('letShortcutsShow', false);
                    }
                },
                immediate: true
            },
            // 监听最新一条 ws 消息(whatsApp 相关), 更新"正在输入中"信息
            websocketMsgWA(val) {
                if (!val) {
                    return;
                }

                // 正在输入中消息推送
                if (val.WaWebsocketMessageType === 20) {
                    if (!(this.currAccountInfo && this.currAccountInfo.chatWaAccount)) {
                        return;
                    }

                    // 暂存数据
                    const msgData = val.whatsappAccountWebsocketCondition;
                    if (msgData.destJid === this.currAccountInfo.chatWaAccount && msgData.bindWa === this.whatsAppAccountInfo.whatsappAccount) {
                        // 如果是"自己"输入的, 则不需要放到正在输入中数组
                        if (`${msgData.userId}` === `${this.userId}`) {
                            return;
                        }

                        // 如果已存在于数组中, 则更新内容
                        const existed = this.enteringInfoArr.some(item => {
                            if (`${item.userId}` === `${msgData.userId}`) {
                                item.content = msgData.content;
                                return true;
                            }
                        });

                        // 不存在于数组中, 则追加到数组
                        if (!existed) {
                            this.enteringInfoArr.push({
                                userId: msgData.userId,
                                nickName: msgData.realName,
                                content: msgData.content
                            });
                        }
                    }
                }

                // 正在输入中消息被删除
                if (val.WaWebsocketMessageType === 21) {
                    if (!(this.currAccountInfo && this.currAccountInfo.chatWaAccount)) {
                        return;
                    }

                    // 暂存数据
                    const msgData = val.whatsappAccountWebsocketCondition;
                    if (msgData.destJid === this.currAccountInfo.chatWaAccount && msgData.bindWa === this.whatsAppAccountInfo.whatsappAccount) {
                        // 从数组中筛选并删除
                        this.enteringInfoArr = this.enteringInfoArr.filter(item => `${item.userId}` !== `${msgData.userId}`);
                    }
                }
            },
            // 监听 wa 绑定账号的变化, 目前是为了暂存 wa 绑定账号信息, 以避免 beforeDestroy 时数据无法使用
            'whatsAppAccountInfo.whatsappAccount': {
                handler(val) {
                    if (val) {
                        this.lastBindAccount = val;
                    }
                },
                immediate: true
            },
            // 监听群组是不是可以发言
            ableSendGroupMsg: {
                immediate: true,
                handler(v) {
                    console.error(v, '当前可以在群组内发言吗');
                    console.log(v, '当前可以在群组内发言吗');
                    // 如果是在群组聊天 并且值为true才可以翻译 此时向外emit 告诉父组件开始翻译
                    // this.$emit('update:groupAutoTrans', v);
                }
            }
        },
        data() {
            return {
                visible_send_msg_err: false, // 消息发送失败后弹出modal

                isSendingText: false, // 文本发送中loading
                isSendingFiles: false, // 附件发送中loading
                isTranslating: false,
                translateLoading: false,
                translateShow: false,
                type: 'session',
                msgToSent: '', // 输入框内容
                selectedLang: 'en', // 默认翻译语言为英语
                lastWAAccount: '',

                /* 文件上传 */
                fileList: [],
                fileFormats: [
                    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rar', 'zip', 'epub', 'txt', 'ai', 'dwg', 'rcfgx',
                    'png', 'jpg', 'jpeg',
                    'mp3', 'wav', 'ogg', 'aac', 'amr', 'm4a', 'm4r',
                    'mp4', 'mov'
                ], // 暂不支持发送音频
                fileSize: 60, // 单位为M
                maxFileLength: 10, // 允许上传发送的总文件数
                // 关于附件上传的一些特殊限制，例如某类文件的某个格式，有特殊的大小限制，诸如此类:sizeLimit单位为M
                // specialFileLimit: [],
                specialFileLimit: [
                    {
                        type: 'png',
                        sizeLimit: 16
                    },
                    {
                        type: 'jpg',
                        sizeLimit: 16
                    },
                    {
                        type: 'jpeg',
                        sizeLimit: 16
                    },
                    {
                        type: 'mp4',
                        sizeLimit: 32
                    },
                    {
                        type: 'mov',
                        sizeLimit: 32
                    }
                ],
                // 附件上传的两种方式： normal---普通上传 dataBase--- 关联询盘云资料库上传
                uploadMethod: 'normal',

                /* 表情相关 */
                // 表情 pop 显隐状态
                visible_emojiPop: false,

                // 定义最后光标对象
                lastEditRange: undefined,
                // 监听输入框(可编辑 DIV)内容变化, 赋值 msgToSent
                observer: null,

                /* 话术相关 */
                // 话术 pop 显隐状态
                visible_verbalPop: false,

                // WABA 活跃状态倒计时时钟
                // 活跃状态与非活跃状态的分界线(毫秒数), 目前为 24 小时
                activeStatusMsLimit: 24 * 60 * 60 * 1000,
                showAiTeMember: false,
                lastRangeText: null,
                styleObj: {},
                serchByNickName: '', // 模糊查询@群成员字段
                isPinYin: false, // 判断当前是不是汉语输入法
                ForceUpdate: 1, // 强制刷新 群成员选择列表组件

                // 定时向后端发送聊天框内容
                timer_sendContent: null,
                // 8000(输入框字数上限)的斐波那契数列
                fibonacciArr: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765],
                // 正在输入中信息
                enteringInfoArr: [],
                // 暂存"清除正在输入中信息"接口请求参数
                lastBindAccount: '',

                // ai tool bar
                aiSelection: null
            };
        },
        mounted() {
            // 监听 DOM 变化, 变化时将 contentEditable div 内容转换成纯文本赋值到 msgToSent
            this.observer = new MutationObserver((mutations, observe) => {
                // 方法, 递归提取 DOM 内文本信息
                function getTextContent_recurSively(dom) {
                    // 暂存结果
                    let result = '';

                    // 遍历 dom 所有子结点提取文本信息
                    if (dom.childNodes.length) {
                        for (let i = 0; i < dom.childNodes.length; i++) {
                            const node = dom.childNodes[i];
                            // console.dir(node);
                            switch (node.nodeName) {
                                case '#text':
                                    // 子结点为文本结点, 追加文本内容

                                    result += `${node.nodeValue}`;
                                    break;
                                case 'IMG':
                                    // 为 img.emoji 结点, 取其 alt 属性(实体字符)

                                    if (node.classList.contains('emoji')) {
                                        result += node.getAttribute('alt') || '';
                                    }
                                    break;
                                case 'AITEMEMBER':
                                    if (Array.from(node.classList).includes('searchUseByEditList')) {
                                        result += getTextContent_recurSively(node);
                                    }
                                    break;
                                case 'SPAN':
                                    // 如果是span标签 也需要保留标签自身的格式，因为在粘贴过来的内容中如果删除了粘贴过来的div并且是换行的，那div会在合
                                    // 并为一行时变为span标签，这是浏览器的默认行为
                                    result += getTextContent_recurSively(node);
                                    break;
                                default:
                                    // 其他, 先追加换行符, 再继续递归
                                    result += '\n';
                                    result += getTextContent_recurSively(node);
                            }
                        }
                    }
                    // 返回结果
                    return result;
                }

                // 赋值 msgToSent
                this.msgToSent = getTextContent_recurSively(this.$refs.sendMsg);
                // console.log(JSON.stringify({txt: this.msgToSent}),'dssdds');
            });
            this.observer.observe(this.$refs.sendMsg, {
                childList: true,
                characterData: true,
                subtree: true
            });
            document.addEventListener('selectionchange', this.isInputAite);
            // document.addEventListener('selectionchange', this.isComToFirst);
            if (this.fromFlag !== 'timeline') {
                this.$EVENTBUS.$on('syncWaChatModeMemory12', (v1, v2) => {
                    if (this.currAccountInfo.chatWaAccount) {
                        if (this.currAccountInfo.chatWaAccount == v2.chatWaAccount) {
                            this.selectedLang = v1;
                        }
                    }
                });
            }
        },
        beforeDestroy() {
            // 清除 mutation observer
            this.observer.disconnect();
            this.observer = null;
            document.removeEventListener('selectionchange', this.isInputAite);

            // 清除定时器:定时发送输入框消息到后端
            this.clearTimer_sendContent();
        },
        computed: {
            ...mapState({
                fullName: state => state.fullName,
                notChatWithOther: state => state.notChatWithOther,
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                // WAIsMd: state => state.whatsapp.WAIsMd,
                reEditedMessage: state => state.whatsapp.reEditedMessage,
                unSendChatMessage: state => state.whatsapp.unSendChatMessage,
                viewingSubWA: state => state.whatsapp.viewingSubWA,
                smartFileObj: state => state.whatsapp.smartFileObj,
                websocketMsgWA: state => state.whatsapp.websocketMsgWA,
                // 不需要翻译的数组
                autoTranslateNoTArr: 'autoTranslateNoTArr',
                // 自动发信翻译开关
                autoTranslateStatusSend: 'autoTranslateStatusSend'
            }),
            ...mapGetters([
                'isContainsMenu',
                'isWAPersonalEdition'
            ]),
            computCanSendMsg() {
                let value = '';
                if (this.isWABA) {
                    // 如果是 WABA
                    // 且客户最近回复时间已经为空/已过期, 不允许输入
                    if (!this.lastReplyTime || (Number.isInteger(this.lastReplyTime) && this.lastReplyTime > this.activeStatusMsLimit)) {
                        value = `WABAUnSend${new Date().getTime()}`;
                    }
                } else {
                    // 个人会话
                    if (!this.currAccountInfo.chatType) {
                        // 登录已失效, 不允许输入
                        if (`${this.whatsAppAccountInfo.loginStatus}` !== '1') {
                            value = `personalUnSend${new Date().getTime()}`;
                        } else {
                            value = `loginNormal${new Date().getTime()}`;
                        }
                    } else if (this.currAccountInfo.chatType === '1') {
                        // 群组会话
                        // 当前群组对话已删除
                        if (this.currAccountInfo.deleteFlag === 1) {
                            value = `groupUnSend${new Date().getTime()}`;
                        }

                        // 当前是群组消息且群组成员已请求
                        if (this.matchedGroupMember && this.matchedGroupMember.deleteFlag !== 1) {
                            // 所有人都能发消息 或 当前用户是管理员, 允许发消息
                            if (this.matchedGroupMember.permission === 0 || this.matchedGroupMember.isAdmin === 1) {
                                value = `matchedGroupMember${new Date().getTime()}`;
                            } else {
                                value = `groupUnSend${new Date().getTime()}`;
                            }
                        }
                    }
                }

                // 默认, 返回 false , 允许输入
                return value;
            },
            // 是否禁止一切输入相关动作
            inputDisabled() {
                // 查看下属中, 不允许输入
                // if (this.viewingSubWA) {
                //     return true;
                // }

                if (this.isWABA) {
                    // 如果是 WABA
                    // 且客户最近回复时间已经为空/已过期, 不允许输入
                    if (!this.lastReplyTime || (Number.isInteger(this.lastReplyTime) && this.lastReplyTime > this.activeStatusMsLimit)) {
                        return true;
                    }
                } else {
                    // 登录已失效, 不允许输入
                    if (`${this.whatsAppAccountInfo.loginStatus}` !== '1') {
                        return true;
                    }
                }

                // 默认, 返回 false , 允许输入
                return false;
            },
            // 发送按钮的 disabled 状态
            sendBtnDisabled() {
                if (this.inputDisabled) {
                    // 禁止输入, 返回 true
                    return true;
                } else {
                    // 没有文本内容 + 没有文件, 返回 true
                    return !this.msgToSent && !this.fileList.length;
                }
            },
            // 是否允许发送文件
            uploadIsDisabled() {
                // 如果当前不允许输入 或 附件列表不为空且其中任意一个正在发送中, 则不允许继续上传
                // 新增 status 判断, 本地文件选中即为 'finished', 资料库文件默认为 'uploading' , 转存完毕才为 'finished'
                return this.inputDisabled || this.fileList.some(item => item.isSending || item.status !== 'finished');
            },
            // 被引用消息 id
            quotedMessageId() {
                return (this.replyMsg && this.replyMsg.messageId) ? this.replyMsg.messageId : undefined;
            },
            // 是否是群组对话
            isGroup() {
                return this.currAccountInfo.chatType === '1';
            },
            // 当前绑定 wa 账号匹配到的群成员
            matchedGroupMember() {
                // 当前是群组消息且群组成员已请求
                if (this.isGroup && this.currAccountInfo.groupInfo && Array.isArray(this.currAccountInfo.groupInfo.memberList)) {
                    // 从群组成员中筛出当前 wa 账号对应的群成员
                    return this.currAccountInfo.groupInfo.memberList.find(item => item.waAccount === this.whatsAppAccountInfo.whatsappAccount);
                }
                return undefined;
            },
            // 是否有权限发群组消息
            ableSendGroupMsg() {
                // 当前群组对话已删除
                if (this.currAccountInfo.deleteFlag === 1) {
                    return false;
                }

                // 当前是群组消息且群组成员已请求
                if (this.matchedGroupMember && this.matchedGroupMember.deleteFlag !== 1) {
                    // 所有人都能发消息 或 当前用户是管理员, 允许发消息
                    if (this.matchedGroupMember.permission === 0 || this.matchedGroupMember.isAdmin === 1) {
                        return true;
                    }
                }

                // 不符合条件全返回 false
                return false;
            },
            // 无法发送群组消息原因
            unableSendGroupMsgReason() {
                // 当前群组对话已删除
                if (this.currAccountInfo.deleteFlag === 1) {
                    return this.$t('whatsapp_manage.unableToSendGroupMsg_deleted');
                }

                // // 查看下属中
                // if (this.viewingSubWA) {
                //     return this.$t('whatsapp_manage.unableSendMsgCauseViewingSub');
                // }

                // 当前是群组消息且群组成员已请求
                if (this.matchedGroupMember && this.matchedGroupMember.deleteFlag === 1) {
                    return this.$t('whatsapp_manage.unableToSendGroupMsg_removed');
                }

                // 其他统一提示
                return this.$t('whatsapp_manage.unableToSendGroupMsg_authority');
            },
            // 当前 userId 所有 wa 账号数据, 去掉当前显示的 wa 号码
            checkAccountList() {
                return this.whatsAppAccountList.filter(item => item.whatsappAccount !== this.whatsAppAccountInfo.whatsappAccount);
            },
            // 当前是否是 WABA 账户
            isWABA() {
                return this.whatsAppAccountInfo && this.whatsAppAccountInfo.tag === 'WABA';
            },
            // 是否是多设备版
            WAIsMd() {
                return !(this.whatsAppAccountInfo && this.whatsAppAccountInfo.uuid && this.whatsAppAccountInfo.uuid.includes('java'));
            }
        },
        methods: {
            // 清楚记忆的store记忆的不允许翻译语种并且 识别与改对话的第一条消息的语种
            async getStoreStateAndSetEmpty() {
                // 查询与改对话的第一条消息
                let lang = 'en'; // 发信翻译默认是英文
                const p1 = await util.ajaxWAJson({
                    url: '/minor/chatList/getFirstMessage',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount, // 用户绑定的wa账号
                        chatWaAccount: this.currAccountInfo.chatWaAccount, // 消息接收人wa账号
                    }
                });
                if (p1.data.code == 1 && p1.data.data) {
                    // console.log(p1,'dddss');
                    const p2 = await util.ajaxJson({
                        url: '/translation/identifyTargetLanguage',
                        method: 'get',
                        params: {
                            text: p1.data.data
                        }
                    });
                    if (p2.data.data && p2.data.data.detections) {
                        // console.log(p2.data.data.detections[0][0].language,'sas');
                        switch (p2.data.data.detections[0][0].language) {
                            case 'zh-CN':
                                lang = 'zh_CN'
                                break;
                            case 'und':
                                lang = 'en'
                                break;
                            default:
                                lang = p2.data.data.detections[0][0].language;
                                break;
                        }
                    }
                }
                this.selectedLang = lang;
            },
            logInAgain() {
                this.visible_send_msg_err = false;
                this.$store.commit('setMsgSendErr', true);
            },
            // 将'重新编辑的撤回消息'回填到输入框
            reEditWithdrawMsgS(msg) {
                console.log(msg);
                this.$refs.sendMsg.innerHTML = msg;
            },
            handleSendMsg() {
                if(timerForSendMsg) {
                    console.log('有未执行完的函数');
                    return false;
                }
                console.log('行完的函数');
                timerForSendMsg = setTimeout(() => {
                    if (this.fileList.length && !this.uploadIsDisabled) {
                        this.sendFilesMsg();
                    } else if (this.msgToSent) {
                        this.sendTextMsg();
                    }
                    clearTimeout(timerForSendMsg);
                    timerForSendMsg = null;
                }, 200);
            },
            // 显示控制模版消息列表
            setTempalte() {
                this.$emit('toggleTemplate', true);
                // console.log(this.$parent.isShowTemplate = !this.$parent.isShowTemplate);
            },
            /** 键盘回车事件 */
            inputOnKeyDown(e) {
                // 处理回车
                if (e.keyCode === 13) {
                    e.preventDefault();
                    // 按下回车键

                    if (e.ctrlKey || e.shiftKey) {
                        // 如果同时按下了 ctrl 键

                        // 换行
                        this.insertInputMsg('\n');
                    } else {
                        // 否则发送消息
                        if (!this.isSendingText) {
                            this.handleSendMsg();
                        }
                    }
                }

                // 去除Crtl+b/Ctrl+i/Ctrl+u等快捷键
                if (e.ctrlKey || e.metaKey) {
                    // e.metaKey for mac
                    switch (e.keyCode) {
                        case 66: // ctrl+B or ctrl+b
                        case 98:
                        case 73: // ctrl+I or ctrl+i
                        case 105:
                        case 85: // ctrl+U or ctrl+u
                        case 117: {
                            e.preventDefault();
                            break;
                        }
                    }
                }
                // // 如果按下删除键盘
                // if (e.code === 'Backspace') {
                //     let range = null;
                //     let sel = null;
                //     if (window.getSelection) {
                //         sel = window.getSelection();
                //         if (sel.getRangeAt && sel.rangeCount) {
                //             range = sel.getRangeAt(0);
                //         }
                //     } else if (document.selection && document.selection.createRange) {
                //         range = document.selection.createRange();
                //     }
                //     // console.log(range);
                //     // console.log(sel);
                // }
            },
            // inputOnKeyDown(e) {
            //     const inputKeyDownIndex = e.target.selectionStart;
            //     if (e.ctrlKey && e.keyCode === 13) {
            //         console.log('OnKeyDown', e);
            //         // const dom = this.$refs.sendMsg.$el;
            //         const dom = this.$refs.sendMsg;
            //         this.msgToSent = `${this.msgToSent.substring(0, inputKeyDownIndex)}\n${this.msgToSent.substring(inputKeyDownIndex)}`;
            //         e.returnValue = false;
            //         if (dom.setSelectionRange) {
            //             this.$nextTick(() => {
            //                 dom.blur();
            //                 dom.setSelectionRange(inputKeyDownIndex + 1, inputKeyDownIndex + 1);
            //                 dom.focus();
            //             });
            //         } else if (dom.createTextRange) {
            //             this.$nextTick(() => {
            //                 const range = dom.createTextRange();
            //                 range.collapse(true);
            //                 range.moveEnd('character', inputKeyDownIndex);
            //                 range.moveStart('character', inputKeyDownIndex);
            //                 range.select();
            //             });
            //         }
            //     } else if (!e.ctrlKey && e.keyCode === 13) {
            //         e.preventDefault();
            //         if (!this.isSendingText) {
            //             this.handleSendMsg();
            //         }
            //     }
            // },
            /** 发送文本消息 */
            async sendTextMsg() {
                // 账号失效时提示
                // if (this.viewingSubWA) {
                //     this.$Message.warning(this.$t('whatsapp_manage.unableSendMsgCauseViewingSub'));
                //     return;
                // }
                // 账号失效时提示
                if (this.whatsAppAccountInfo.loginStatus !== 1) {
                    // WABA 账号不在此判断范围内
                    if (!this.isWABA) {
                        this.$Message.warning(this.$t('whatsapp_manage.failurePrompted'));
                        return;
                    }
                }
                // 可输入最大字符数限制提示
                if (this.msgToSent.length >= 8000) {
                    this.$Message.warning(this.$t('whatsapp_manage.limitNumberTip'));
                    return;
                }
                // 去掉空白符后空值提示
                this.msgToSent = this.msgToSent.trim();
                if (this.msgToSent.length === 0) {
                    this.$Message.warning(this.$t('chat.sendMsgTip2'));
                    return;
                }
                if (this.autoTranslateStatusSend) {
                    // 自动翻译
                    await this.translateTo()
                };
                // 保存当前联系人等信息,防止发送消息期间切换联系人后,发送的消息显示到切换后的联系人会话中
                const stagingData = {
                    readFlag: this.WAIsMd ? 1 : '',
                    fromWaAccount: this.whatsAppAccountInfo.whatsappAccount, // 前端可以拿到
                    userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount, // 前端可以拿到
                    toWaAccount: this.currAccountInfo.chatWaAccount || this.currAccountInfo.contactWaAccount, // 前端可以拿到
                    leadscloudStatus: this.currAccountInfo.leadscloudStatus, // 询盘状态 改为使用前端存的
                    chatListId: this.chatListId || '', // 会话id   前端可以拿到（）
                    userId: this.whatsAppAccountInfo.userId
                };
                let aiteList = Array.from(document.querySelectorAll('aitemember'));
                const mentions = aiteList.map((ele) => {
                    if (ele.getAttribute('data-aite')) {
                        return JSON.parse(ele.getAttribute('data-aite')).number;
                    }
                });
                // 保存发送时输入框@的群成员 用于在发送之后回显
                const extebdObj = {mentions:{}};
                aiteList.forEach((ele) => {
                    if (ele.getAttribute('data-aite')) {
                        let obj = JSON.parse(ele.getAttribute('data-aite'));
                        extebdObj.mentions[obj['number']] = obj['nick']
                    }
                });
                let contentStr;
                contentStr = this.msgToSent;
                aiteList.forEach(ele => {
                    let parsObj = JSON.parse(ele.getAttribute('data-aite'));
                    const reg = new RegExp(parsObj.nick, 'g');
                    contentStr = contentStr.replace(reg, parsObj.number);
                });
                console.log(contentStr,' 读取节点');
                // 发信自动翻译判断逻辑
              
                this.isSendingText = true;
                triggerGtag('WhatsApp', 'WhatsApp对话');
                util.ajaxWAJson({
                    url: this.isWABA ? '/whatsapp/chatRecords/sendApiMessage' : '/whatsapp/chatRecords/sendAndGetInfo',
                    method: 'post',
                    data: {
                        content: contentStr || this.msgToSent,
                        fromWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                        orgId: this.whatsAppAccountInfo.orgId,
                        toWaAccount: this.currAccountInfo.chatWaAccount || this.currAccountInfo.contactWaAccount,
                        type: '1',
                        userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                        userId: this.whatsAppAccountInfo.userId,
                        quotedMessageId: this.quotedMessageId,
                        isMd: this.WAIsMd ? '1' : '0',
                        mentions
                    }
                }).then(async response => {
                    const res = response.data.data;
                    // let obj = {};
                    if (response.data.code === 1) {
                        if (response.data.data === 'ERROR') {
                            this.$Message.warning(this.$t('whatsapp_manage.sendFailTip1'));
                            // 保证可见最新消息
                            document.getElementById('whatsApp-main').scrollTop = 999999;
                            setTimeout(function() {
                                document.getElementById('whatsApp-main').scrollTop = 999999;
                            }, 100);
                        } else {
                            // 发送成功
                            const msgData = {
                                whatsAppInvokingType: res.whatsAppInvokingType, // 项目中未用到
                                bePushedMessageType: res.bePushedMessageType, // 固定
                                pushLogId: res.pushLogId, // 固定
                                pushMessageModule: res.pushMessageModule, // 固定
                                whatsappAccountWebsocketCondition: {
                                    unread: res.whatsappAccountWebsocketCondition.unread, // 固定
                                    deleteFlag: res.whatsappAccountWebsocketCondition.deleteFlag, // 消息删除撤销的状态
                                    readFlag: stagingData.readFlag || res.whatsappAccountWebsocketCondition.readFlag,
                                    fromWaAccount: stagingData.fromWaAccount,
                                    lastChatContent: res.whatsappAccountWebsocketCondition.lastChatContent,
                                    messageId: res.whatsappAccountWebsocketCondition.messageId, // 后端返回
                                    fromMe: res.whatsappAccountWebsocketCondition.fromMe, // 固定
                                    type: res.whatsappAccountWebsocketCondition.type, // 后端返回
                                    userBindWaAccount: stagingData.userBindWaAccount,
                                    timeStamp: res.whatsappAccountWebsocketCondition.timeStamp, // 后端返回
                                    toWaAccount: stagingData.toWaAccount,
                                    seconds: res.whatsappAccountWebsocketCondition.seconds, // 消息语音
                                    leadscloudStatus: stagingData.leadscloudStatus,
                                    chatRecordsId: res.whatsappAccountWebsocketCondition.chatRecordsId, // 聊天记录id 更名为了id
                                    chatListId: stagingData.chatListId  || res.whatsappAccountWebsocketCondition.chatListId

                                },
                                WaWebsocketMessageType: res.waWebsocketMessageType, // 表示 收到 wa 消息推送
                                userIds: res.userIds || [], // 前端用不到   因为有了fromMe字段，所以这个用不到
                                messageId: res.messageId, // 后端给
                                pushMessageUrl: res.pushMessageUrl, // 项目中未用到
                                subordinateUserId: stagingData.userId
                            };
                            // 如果有回复信息时,添加字段
                            if (res.whatsappAccountWebsocketCondition.quotedMessage) {
                                msgData.whatsappAccountWebsocketCondition.quotedMessage = res.whatsappAccountWebsocketCondition.quotedMessage;
                            }
                            // 如果对话框中有艾特群成员则添加字段
                            if (extebdObj.mentions) {
                                msgData.whatsappAccountWebsocketCondition.extendedJsonLableMentions = JSON.stringify(extebdObj);
                            }
                            // if (this.autoTranslateStatusSend) {
                            //     // 保存翻译内容
                            //     await saveTranslateMsg({
                            //         orgId: this.enterpriseId,
                            //         userId: this.userId,
                            //         userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                            //         toWaAccount: this.currAccountInfo.chatWaAccount || this.currAccountInfo.contactWaAccount,
                            //         messageId: res.messageId,
                            //         message: contentStr,
                            //         timeStamp: res.whatsappAccountWebsocketCondition.timeStamp,
                            //         language: this.selectedLang
                            //     });
                            // };
                            
                            // 推送新消息到消息列表
                            this.$store.commit('setWebsocketMsgWA', msgData);
                            // 清空输入框
                            this.msgToSent = '';

                            // 清除消息引用
                            if (!this.fileList.length) {
                                this.clearReplyMsg();
                            }

                            // 清除定时器:定时发送输入框消息到后端
                            this.clearTimer_sendContent();
                        }
                    } else {
                        switch (response.data.code) {
                            case 2:
                                this.$Message.warning(this.$t('whatsapp_manage.sendFailTip_netErr'));
                                break;
                            case 10000005:
                                // sendApiMessage 接口
                                this.$Message.warning(this.$t('whatsapp_manage.sendFailTip_syncing'));
                                break;
                            case -24:
                                // sendAndGetInfo 接口
                                if (response.data.message && response.data.message.includes('正在处理消息')) {
                                    this.$Message.warning(this.$t('whatsapp_manage.sendFailTip_syncing'));
                                    // 如果满足条件, 才 break , 不满足条件, 继续走 default
                                    break;
                                }
                            default:
                                this.$Message.warning(this.$t('whatsapp_manage.sendFailTip'));
                        }
                    }
                    this.isSendingText = false;
                }).catch(error => {
                    console.error(error);
                    // 如果是从全局回复框进入此组件, 则发送超时可能是因为 wa 号码无效, 此时给出相应提示语, 否则维持原逻辑不给提示语
                    if (this.isGlobal) {
                        this.$Message.warning(this.$t('whatsapp_manage.sendFailTimeOutTip'));
                    }
                    this.isSendingText = false;
                    // 显示消息发送失败modal
                    this.visible_send_msg_err = true;
                });
            },
            /* 发送附件 */
            sendFilesMsg() {
                const documentTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rar', 'zip', 'epub', 'txt', 'ai', 'dwg', 'rcfgx'];
                const imageTypes = ['png', 'jpg', 'jpeg'];
                const audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'amr', 'm4a', 'm4r'];
                const videoTypes = ['mp4', 'mov'];
                this.fileList.forEach(item => {
                    item.status = 'finished';
                    item.isSending = true;
                    if (documentTypes.includes(item.suffix)) {
                        this.handleSendDifferentFiles(item, 'document');
                    } else if (imageTypes.includes(item.suffix)) {
                        this.handleSendDifferentFiles(item, 'image');
                    } else if (videoTypes.includes(item.suffix)) {
                        this.handleSendDifferentFiles(item, 'video');
                    } else if (audioTypes.includes(item.suffix)) {
                        this.handleSendDifferentFiles(item, 'audio');
                    } else {
                        this.$Message.warning('暂不支持发送此类文件');
                    }
                    return item;
                });
            },
            async handleSendDifferentFiles(file, postType) {
                this.isSendingText = true;
                const formData = new FormData(); // 定义传递的序列化对象
                if (this.autoTranslateStatusSend) {
                    // 自动翻译
                    await this.translateTo();
                };

                const aiteList = Array.from(document.querySelectorAll('aitemember'));
                const mentions = aiteList.map((ele) => {
                    if (ele.getAttribute('data-aite')) {
                        return JSON.parse(ele.getAttribute('data-aite')).number;
                    }
                });
                // 保存发送时输入框@的群成员 用于在发送之后回显
                const extebdObj = { mentions: {} };
                aiteList.forEach((ele) => {
                    if (ele.getAttribute('data-aite')) {
                        const obj = JSON.parse(ele.getAttribute('data-aite'));
                        extebdObj.mentions[obj['number']] = obj['nick'];
                    }
                });
                let contentStr;
                contentStr = this.msgToSent;
                aiteList.forEach(ele => {
                    const parsObj = JSON.parse(ele.getAttribute('data-aite'));
                    const reg = new RegExp(parsObj.nick, 'g');
                    contentStr = contentStr.replace(reg, parsObj.number);
                });

                const postData = {
                    orgId: this.enterpriseId,
                    userId: this.whatsAppAccountInfo.userId,
                    file: file.originalFile,
                    type: postType,
                    jid: this.whatsAppAccountInfo.whatsappAccount,
                    jidDest: this.currAccountInfo.chatWaAccount || this.currAccountInfo.contactWaAccount,
                    isMd: this.WAIsMd ? '1' : '0'
                    // mentions // 艾特群成员的先不做
                };
                // 保存当前联系人等信息,防止发送消息期间切换联系人后,发送的消息显示到切换后的联系人会话中
                const stagingData = {
                    readFlag: this.WAIsMd ? 1 : '',
                    fromWaAccount: this.whatsAppAccountInfo.whatsappAccount, // 前端可以拿到
                    userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount, // 前端可以拿到
                    toWaAccount: this.currAccountInfo.chatWaAccount || this.currAccountInfo.contactWaAccount, // 前端可以拿到
                    leadscloudStatus: this.currAccountInfo.leadscloudStatus, // 询盘状态 改为使用前端存的
                    chatListId: this.chatListId || '', // 会话id   前端可以拿到（）
                    userId: this.whatsAppAccountInfo.userId
                };

                // 追加引用消息 ID
                if (this.quotedMessageId) {
                    formData.append('quotedMessageId', this.quotedMessageId);
                }

                // 追加文本消息
                const content = contentStr || this.msgToSent;
                formData.append('content', encodeURIComponent(content));

                for (const key in postData) {
                    formData.append(key + '', postData[key]); // 中间的引号必填，因为这样才能正确序列化其他的参数传递给后台
                }
                // formData.append('uid', file.uid); // 通过append()将键名和值放进去
                triggerGtag('WhatsApp', 'WhatsApp对话');
                util.ajaxWAFileLongTime({
                    url: this.isWABA ? '/whatsapp/chatRecords/api/sendApiFile' : '/whatsapp/agent/api/sendfileAndGetInfo',
                    method: 'POST',
                    data: formData
                }).then(res => {
                    const response = res.data.data;
                    // 发送成功
                    const msgData = {
                        whatsAppInvokingType: response.whatsAppInvokingType, // 项目中未用到
                        bePushedMessageType: response.bePushedMessageType, // 固定
                        pushLogId: response.pushLogId, // 固定
                        pushMessageModule: response.pushMessageModule, // 固定
                        whatsappAccountWebsocketCondition: {
                            unread: response.whatsappAccountWebsocketCondition.unread, // 固定
                            deleteFlag: response.whatsappAccountWebsocketCondition.deleteFlag, // 消息删除撤销的状态
                            readFlag: stagingData.readFlag || response.whatsappAccountWebsocketCondition.readFlag,
                            fromWaAccount: stagingData.fromWaAccount,
                            lastChatContent: response.whatsappAccountWebsocketCondition.lastChatContent, // 前端可以拿到
                            messageId: response.whatsappAccountWebsocketCondition.messageId, // 后端返回
                            fromMe: response.whatsappAccountWebsocketCondition.fromMe, // 固定
                            type: response.whatsappAccountWebsocketCondition.type, // 后端返回
                            userBindWaAccount: stagingData.userBindWaAccount,
                            timeStamp: response.whatsappAccountWebsocketCondition.timeStamp, // 后端返回
                            toWaAccount: stagingData.toWaAccount,
                            seconds: response.whatsappAccountWebsocketCondition.seconds, // 消息语音
                            leadscloudStatus: stagingData.leadscloudStatus,
                            chatRecordsId: response.whatsappAccountWebsocketCondition.chatRecordsId, // 聊天记录id 更名为了id
                            contentQiniuUrl: response.whatsappAccountWebsocketCondition.contentQiniuUrl,
                            contentThumbnail: response.whatsappAccountWebsocketCondition.contentThumbnail || '', // 缩略图
                            chatListId: stagingData.chatListId || response.whatsappAccountWebsocketCondition.chatListId,
                            extendedJson: response.whatsappAccountWebsocketCondition.extendedJson || '' // 扩展字段
                        },
                        WaWebsocketMessageType: response.waWebsocketMessageType, // 表示 收到 wa 消息推送
                        userIds: response.userIds || [], // 前端用不到   因为有了fromMe字段，所以这个用不到
                        messageId: response.messageId, // 后端给
                        pushMessageUrl: response.pushMessageUrl, // 项目中未用到
                        subordinateUserId: stagingData.userId
                    };
                    // 如果有回复信息时,添加字段
                    if (response.whatsappAccountWebsocketCondition.quotedMessage) {
                        msgData.whatsappAccountWebsocketCondition.quotedMessage = response.whatsappAccountWebsocketCondition.quotedMessage;
                    }

                    const index = this.fileList.findIndex(item => item.uid === file.uid);
                    this.fileList.splice(index, 1);

                    // 推送新消息到消息列表
                    this.$store.commit('setWebsocketMsgWA', msgData);

                    // 清除消息引用
                    if (!this.fileList.length && !this.msgToSent) {
                        this.clearReplyMsg();
                    }

                    // 需要所有文件都上传完成后, 才清空输入框
                    if (!this.fileList.length) {
                        // 清空输入框
                        this.msgToSent = '';
                        this.isSendingText = false;
                    }

                    if (res.data.code !== 1) {
                        switch (res.data.code) {
                            case 2:
                                this.$Message.warning(this.$t('whatsapp_manage.sendFailTip_netErr'));
                                break;
                            // case 10000005:
                            //     this.$Message.warning(this.$t('whatsapp_manage.sendFailTip_syncing'));
                            //     break;
                            case 0:
                                if (res.data.message && res.data.message.includes('正在处理消息')) {
                                    this.$Message.warning(this.$t('whatsapp_manage.sendFailTip_syncing'));
                                    // 如果满足条件, 才 break , 不满足条件, 继续走 default
                                    break;
                                }
                            default:
                                switch (res.data.message) {
                                    case '不能发送消息，请保持whatsapp登录':
                                        this.$Message.error(this.$t('whatsapp_manage.sendFileFailTip_waStatusError'));
                                        break;
                                    case '文件不能为空':
                                        this.$Message.error(this.$t('whatsapp_manage.sendFileFailTip_emptyContent').replace('$field', file.name));
                                        break;
                                    default:
                                        this.$Message.error(this.$t('whatsapp_manage.sendFileFailTip').replace('$field', file.name));
                                }
                        }
                    }
                }).catch(err => {
                    console.error('发送附件过程中出现错误-----', err);
                    const index = this.fileList.findIndex(item => item.uid === file.uid);
                    this.fileList.splice(index, 1);
                    // 需要所有文件都上传完成后, 才清空输入框
                    if (!this.fileList.length) {
                        // 清空输入框
                        this.msgToSent = '';
                        this.isSendingText = false;
                    }

                    // 清除消息引用
                    if (!this.fileList.length && !this.msgToSent) {
                        this.clearReplyMsg();
                    }

                    this.$Message.error(`${file.name}发送失败`);
                });
            },
            getTextNode(dom) {
                const domMap = Array.from(dom.childNodes);
                const textnode = [];
                domMap.forEach(ele => {
                    if (ele.nodeName === '#text') {
                        textnode.push(ele);
                    } else {
                        if (ele.nodeName != 'AITEMEMBER') {
                            Array.prototype.push.apply(textnode, this.getTextNode(ele));
                        }
                    }
                });
                return textnode;
            },
            /* 翻译 */
            async translateTo() {
                // 翻译时需要将@加名称标签去除 主要是通过遍历输入框内所有的node节点
                // 拿到文本节点 将其保留下来 然后拼接为一段话，然后等待翻译完成之后使用</|\>
                // 分割 再按照数组对应顺序一一回显示
                const text = this.msgToSent.trim();
                const input_dom = this.$refs.sendMsg;
                let MapNodeArr = [];
                MapNodeArr = this.getTextNode(input_dom);
                if (text.length === 0) {
                    this.$Message.warning(this.$t('chat.sendMsgTip3'));
                    return;
                }
                let val = [];
                MapNodeArr.forEach(ele => {
                    val.push(ele.textContent.replace(/(\r\n|\r|\n)/g, '<br>'));
                });
                await this.translate(val, MapNodeArr);
            },
            async translate(text, MapNodeArr) {
                this.isTranslating = true;
                await util.ajaxInternational({
                    url: '/translation/translationWithSource',
                    method: 'post',
                    data: {
                        targetLang: this.selectedLang,
                        requestTextList: text , // 要翻译的文本
                    }
                }).then(({ data }) => {
                    if (data && data.data && Array.isArray(data.data.translations) && data.data.translations.length) {
                        data.data.translations.forEach(text => {
                            text.translatedText = twemoji.parse(text.translatedText).replace(/<br>/g, '\n');
                        });
                        // let dataTransArr = twemoji.parse(data.data.translations[0].translatedText || '').replace(/<br>/g, '\n').split('</|\>');
                        MapNodeArr.forEach((ele,i) => {
                            ele.nodeValue = data.data.translations[i].translatedText;
                        });
                        console.log('节点更换');
                    }
                    this.isTranslating = false;
                }).catch(error => {
                    this.isTranslating = false;
                    console.log('login time out error', error);
                });
            },

            /* 话术 */
            // 记录话术 poptip 显隐状态
            handleToggleVerbalPop(boo) {
                this.visible_verbalPop = boo;
            },
            // 展示话术
            async triggerVerbal() {
                // 不允许发送内容, 退出流程
                if (this.inputDisabled) {
                    return;
                }

                if (this.fromFlag === 'timeline') {
                    // 在时间轴弹框内, 显示话术 pop

                    if (this.visible_verbalPop) {
                        // emoji pop 显示中

                        // 关闭
                        this.$refs.verbalPop.doClose();
                    } else {
                        // pop 隐藏中

                        // 显示
                        setTimeout(() => {
                            this.$refs.verbalTrigger.click();
                        }, 0);
                    }
                } else {
                    // 在 wa 聊天界面, 切换侧边话术页显隐
                    this.$emit('letShortcutsShow', !this.isShowVerbal);
                }
            },
            // 插入话术
            insertVerbal(msg) {
                // 插入文本到输入框
                // console.log(msg,'msg');
                if (msg && msg.content) {
                    if(this.isGroup && !this.ableSendGroupMsg) {
                        // 群组并且不允许发言的话给出提示
                        this.$Message.warning(this.$t('whatsapp_manage.onlyCanSendTemplate'));
                        return false;
                    }
                    this.insertInputMsg(msg.content.verbalContent);
                }
            },

            /* 发送文件 */
            // 点击触发文件上传
            trigger_upload(isDatabase) {
                if (this.uploadIsDisabled) {
                    return false;
                } else {
                    this.uploadMethod = isDatabase === 'dataBase' ? 'dataBase' : 'normal';
                    this.$nextTick(() => {
                        this.$refs.dragFile.handleClick();
                    });
                }
            },
            // 更新文件列表
            updateFileList(val) {
                console.log('updateFileList()----', val);
                this.fileList = val;
            },

            /* emoji 弹框相关 */
            // 触发 emoji trigger
            trigger_emoji() {
                // 不允许发送内容, 退出流程
                if (this.inputDisabled) {
                    return;
                }

                if (this.visible_emojiPop) {
                    // emoji pop 显示中

                    // 关闭
                    this.$refs.emojiPop.doClose();
                } else {
                    // pop 隐藏中

                    // 显示
                    setTimeout(() => {
                        this.$refs.emojiTrigger.click();
                    }, 0);
                }
            },
            // emoji 弹框显隐回调
            handleToggleEmojiPop(boo) {
                this.visible_emojiPop = boo;
            },
            // 插入 emoji 表情
            handleCheckEmoji(val) {
                // 获取待插入表情 Node
                let dom_insert = document.createElement('span');
                dom_insert.innerHTML = twemoji.parse(val);
                dom_insert = dom_insert.childNodes[0];

                // 插入 Node 到输入框
                this.insertInputMsg(dom_insert);
            },
            insertInputMsg(val) {
                // 获取待插入结点
                let dom_insert;
                if (val instanceof Node) {
                    // 是 Node 结点, 不用做处理

                    dom_insert = val;
                } else {
                    // 否则当做文本结点处理

                    dom_insert = document.createTextNode(String(val || ''));
                }

                // 获取编辑框对象
                const dom_input = this.$refs.sendMsg;
                // 编辑框设置焦点
                dom_input.focus();

                // 获取选定对象
                let selection = null;
                if (window.getSelection) {
                    selection = window.getSelection();
                } else if (window.document.getSelection) {
                    selection = window.document.getSelection();
                } else if (window.document.selection) {
                    selection = window.document.selection.createRange().text;
                }
                // 如果获取不到, 退出流程
                if (!selection) {
                    this.$Message.error(this.$t('whatsapp_manage.browserError'));
                    return false;
                }

                // 判断是否有最后光标对象存在
                if (this.lastEditRange) {
                    // 存在最后光标对象，选定对象清除所有光标并添加最后光标还原之前的状态
                    selection.removeAllRanges();
                    selection.addRange(this.lastEditRange);
                }
                // 根据所在位置的不同以不同的方式插入结点
                if (this.lastEditRange) {
                    // 有光标对象, 直接插入
                    this.lastEditRange.insertNode(dom_insert);
                } else if (!selection.anchorNode || selection.anchorNode == dom_input) {
                    // 焦点就在文本框, 则直接 append node 到最后
                    dom_input.appendChild(dom_insert);
                } else if (selection.anchorNode.nodeName != '#text') {
                    // 焦点在非文本结点, 则插入到焦点节点后面
                    dom_input.insertBefore(dom_insert, selection.anchorNode.nextSibling);
                }

                // 无法触发换行的情况:
                // 1. 输入框中没有文字, 首次Ctrl + Enter无法触发换行
                // 2. 输入框有插入的文字(话术、智能物料)并且光标在末尾时, Ctrl + Enter无法触发换行
                // 插入一个 br 标签,可解决上述问题
                // 插入文本后再添加 br 标签是为了防止出现首次插入文本时，首行为空行的问题
                const currLastEl = dom_input.lastElementChild;
                if (currLastEl) {
                    if (currLastEl.tagName !== 'BR') {
                        dom_input.appendChild(document.createElement('br'));
                    }
                } else {
                    dom_input.appendChild(document.createElement('br'));
                }

                // 创建新的光标对象
                const range = document.createRange();
                // 光标对象的范围界定为新建的内容节点
                range.setStartAfter(dom_insert);
                // 插入空格, 否则光标可能不显示
                // dom_input.insertBefore(document.createTextNode(' '), dom_insert.nextSibling);
                // range.setStart(dom_insert.nextSibling, 1);
                // 使光标开始和光标结束重叠
                range.collapse(true);
                // 清除选定对象的所有光标对象
                selection.removeAllRanges();
                // 插入新的光标对象
                selection.addRange(range);
                // 无论如何都要记录最后光标对象
                this.lastEditRange = selection.getRangeAt(0);
                // console.log(this.lastEditRange);
            },
            // handleCheckEmoji(val) {
            //     // const dom = this.$refs.sendMsg.$el;
            //     const dom = this.$refs.sendMsg;
            //     const inputKeyDownIndex = dom.selectionStart;
            //
            //     this.msgToSent = `${this.msgToSent.substring(0, inputKeyDownIndex)}${val}${this.msgToSent.substring(inputKeyDownIndex)}`;
            //     if (dom.setSelectionRange) {
            //         this.$nextTick(() => {
            //             dom.blur();
            //             dom.setSelectionRange(inputKeyDownIndex + val.length, inputKeyDownIndex + val.length);
            //             dom.focus();
            //         });
            //     } else if (dom.createTextRange) {
            //         this.$nextTick(() => {
            //             const range = dom.createTextRange();
            //             range.collapse(true);
            //             range.moveEnd('character', inputKeyDownIndex);
            //             range.moveStart('character', inputKeyDownIndex);
            //             range.select();
            //         });
            //     }
            // },

            /* 回复消息相关 */
            // 清除回复消息
            clearReplyMsg() {
                this.$emit('update:replyMsg', {});
            },

            // 离开焦点时先保存状态
            save_range(e) {
                let range = null;
                if (window.getSelection) {
                    const sel = window.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        range = sel.getRangeAt(0);
                    }
                } else if (document.selection && document.selection.createRange) {
                    range = document.selection.createRange();
                }
                this.lastEditRange = range;
                if (e && e.keyCode && [37, 38, 39, 40].includes(e.keyCode)) {
                    this.isNeedSearch();
                }
            },
            // 粘贴内容到可编辑 div (参考 https://www.zhangxinxu.com/wordpress/2016/01/contenteditable-plaintext-only/)
            handlePaste(e) {
                e.preventDefault();
                let text;
                if (window.clipboardData && window.clipboardData.setData) {
                    // IE
                    text = window.clipboardData.getData('text');
                } else {
                    text = (e.originalEvent || e).clipboardData.getData('text/plain');
                }
                if (document.body.createTextRange) {
                    let textRange;
                    if (document.selection) {
                        textRange = document.selection.createRange();
                    } else if (window.getSelection) {
                        const sel = window.getSelection();
                        const range = sel.getRangeAt(0);

                        // 创建临时元素，使得TextRange可以移动到正确的位置
                        const tempEl = document.createElement('span');
                        tempEl.innerHTML = '&#FEFF;';
                        range.deleteContents();
                        range.insertNode(tempEl);
                        textRange = document.body.createTextRange();
                        textRange.moveToElementText(tempEl);
                        tempEl.parentNode.removeChild(tempEl);
                    }
                    console.log(text);
                    textRange.text = text;
                    textRange.collapse(false);
                    textRange.select();
                } else {
                    // Chrome之类浏览器
                    // 在windows上和在mac上换行符不一样，如果是\r\n这种换行符，会导致在删除时，需要删除两次，
                    // 一次删除\r一次删除\n所以现在将\r\n换成\n
                    text = text.replace(/\r\n/g, '\n');
                    // const arr = text.split('\n');
                    // arr.forEach(txt => {
                    //     console.log(txt);
                    //     document.execCommand('insertText', false, txt);
                    //     document.execCommand('insertText', false, '\n');
                    // });
                    document.execCommand('insertText', false, text);
                }
            },
            // 光标聚焦到可编辑 div
            focusInputDiv() {
                // 不允许发送内容, 退出流程
                if (this.inputDisabled) {
                    return;
                }

                // 判断是否有最后光标对象存在
                if (this.lastEditRange) {
                    // 若有, 则光标定位到原光标处

                    // 获取选定对象
                    let selection = null;
                    if (window.getSelection) {
                        selection = window.getSelection();
                    } else if (window.document.getSelection) {
                        selection = window.document.getSelection();
                    } else if (window.document.selection) {
                        selection = window.document.selection.createRange().text;
                    }
                    // 存在最后光标对象，选定对象清除所有光标并添加最后光标还原之前的状态
                    if (selection) {
                        selection.removeAllRanges();
                        selection.addRange(this.lastEditRange);
                    }
                } else {
                    // 若无, 说明之前没点击过输入框, 输入框内容为空

                    // 插入空格字符串以显示光标
                    this.handleCheckEmoji(' ');

                    // 去掉空格, 让光标显示在最前面
                    setTimeout(() => {
                        this.msgToSent = '';
                    }, 0);
                }
            },

            // 话术弹框显隐切换
            triggerVerbalPop(val) {
                if (!val) {
                    // 关闭
                    this.$refs.verbalPop.doClose();
                }
            },

            /* WA账号(手机号)进行格式转换 */
            toggleWAAccount(val) {
                let str;
                if (val && val.startsWith('+')) {
                    str = val;
                } else {
                    str = `+${val}`;
                }
                return str;
                // const arr = str.split('');
                // arr.splice(3, 0, ' ');
                // return arr.join('');
            },
            // 切换登录过的账号
            checkOwnWAAccount(ownAccountInfo) {
                // 关闭弹框
                this.$refs.accountPop.doClose();

                // 向上传递数据
                this.$emit('checkOwnWAAccount', ownAccountInfo);
            },
            // 判断用户输入的是不是 @
            isInputAite(event) {
                // console.log(event);
                if (event && event.target.activeElement === document.body) return;
                // console.log(123);
                // 只有群组显示@功能
                if (!this.isGroup) return false;
                let range = null;
                if (window.getSelection) {
                    const sel = window.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        range = sel.getRangeAt(0);
                    }
                } else if (document.selection && document.selection.createRange) {
                    range = document.selection.createRange();
                }
                // 光标所在的元素
                const rangeDom = range.endContainer;
                const rangestr = rangeDom.textContent;
                // 如果输入的@符号 并且 @符号前一位没有值 则展示群成员列表
                // console.log(range,'rangerange');
                let strlen =  range.endOffset-1;
                let strflag = '';

                strflag = this.isHaveAiTe(rangestr, strlen); // 光标所在之前的一个字符是不是@
                // 两种情况展示成员选择列表
                // 1 @出现在此行的第一位
                // 2 @前面是空格  this.isHaveAiTe(rangestr, findIndex-1)
                const isEmpty = this.isHaveAiTe(rangestr, strlen-1).trim().length === 0; // 光标所在前2个字符是不是空 也就是说@之前是不是空格键

                if (!this.isHaveAiTe(rangestr, strlen).trim()) {
                    this.showAiTeMember = false;
                    return;
                } else {
                    if (this.isHaveAiTe(rangestr, strlen).trim()!=='@') {
                        // this.EnSearchM(true);
                    } else {
                        this.showAiTeMember = false;
                    }
                }
                if (strflag === '@' && isEmpty) {
                    // 获取光标所在的位置
                    this.serchByNickName =  '';
                    this.showAiTeMember = true;
                    const rangShowArea = range.getBoundingClientRect();
                    // 记录@所在的range 之后用于删除
                    this.styleObj = {
                        transform: 'translate(-17%,-100%)',
                        position: 'fixed',
                        zIndex: 2222,
                        left: `${rangShowArea.x}px`,
                        top: `${rangShowArea.y}px`
                    };
                }
                if (event && event.target.activeElement === this.$refs.sendMsg) {
                    this.lastRangeText = range;
                };
            },
            setChoseMember(item) {
                // console.log(item,'sss',this);
                const dom_input = this.$refs.sendMsg;
                const dom_insert = document.createElement('aiteMember');
                dom_insert.innerHTML = `@${item.nickName}`;
                dom_insert.setAttribute('data-aite', JSON.stringify({ number: item.participant, nick: item.nickName }));
                dom_insert.classList.add('searchUseByEditList');
                dom_insert.contentEditable=false;
                // 插入 Node 到输入框
                if (this.lastEditRange.startContainer.nodeName === '#text') {
                    // 如果是文本节点
                    this.lastEditRange.insertNode(dom_insert);
                } else {
                    $(this.lastEditRange.startContainer).after($(dom_insert));
                }
                // contentEditable=false 会出现光标消失的情况 所以追加一个文本节点 就可以解决
                const textNode = document.createTextNode(' ');
                $(dom_insert).after(textNode);
                // return
                let range = null;
                let sel = null;
                if (window.getSelection) {
                    sel = window.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        range = sel.getRangeAt(0);
                    }
                } else if (document.selection && document.selection.createRange) {
                    range = document.selection.createRange();
                }
                // console.log(this.lastRangeText,  this.lastRangeText.startContainer.textContent.lastIndexOf('@'));
                range.setEnd(this.lastRangeText.startContainer, this.lastRangeText.startOffset);
                range.setStart(this.lastRangeText.startContainer, this.lastRangeText.startContainer.textContent.lastIndexOf('@'));
                range.deleteContents();
                const nrange = document.createRange();
                // // 光标对象的范围界定为新建的内容节点
                nrange.setStartAfter(textNode);
                // // 使光标开始和光标结束重叠
                nrange.collapse();
                // // 清除选定对象的所有光标对象
                sel.removeAllRanges();
                // // 插入新的光标对象
                sel.addRange(nrange);
                // 无论如何都要记录最后光标对象
                this.lastEditRange = sel.getRangeAt(0);
            },
            // 判断光标是不是移动到了此行的第一个位置 并且后面的光标是@成员 如果是的话 插入一个默认的空标签 不然会有颜色错乱问题
            isComToFirst(e) {
                let range = null;
                if (window.getSelection) {
                    const sel = window.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        range = sel.getRangeAt(0);
                    }
                } else if (document.selection && document.selection.createRange) {
                    range = document.selection.createRange();
                }
                if (range.startOffset == 0 && range.endOffset ==0 && range.endContainer.parentElement.getAttribute('data-aite')) {
                    const dom_insert = document.createElement('span');
                    dom_insert.innerHTML = ' ';
                    this.$refs.sendMsg.prepend(dom_insert);
                }
                // console.dir(range,'sss');
            },
            // 判断当前是不是汉语输入法 如果是的话等待拼音渐入完毕才调用搜索成员列表 如果不是就直接搜索
            onCompositionStart() {
                this.isPinYin = true;
                console.log('中文开始输入');
            },
            onCompositionEnd(e) {
                // console.log('中文输入完成', e.data);
                this.EnSearchM();
                // 一定要在下一个事件循环 修改isPinYin
                this.$nextTick(() => {
                    this.isPinYin = false;
                });
            },
            // 判断目标区域是不是有@符号
            isHaveAiTe(str, i) {
                return str.charAt(i);
            },
            // 模糊匹配搜索列表
            EnSearchM(isShowMemory, update = false) {
                // update字段 用户使用键盘左右移动时触发重新搜索
                // 截取当前光标结束为止到第一个@符号出现的位置作为搜索条件
                let range = null;
                let sel;
                if (window.getSelection) {
                    sel = window.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        range = sel.getRangeAt(0);
                    }
                } else if (document.selection && document.selection.createRange) {
                    range = document.selection.createRange();
                }
                // console.log(range);
                // 光标所在的元素
                const rangeDom = range.endContainer;
                console.log(range);
                // 如果当前已经显示并且update是false那就继续往下搜索
                if(rangeDom === this.$refs.sendMsg && isShowMemory && !update) return;
                // 光标结束的位置与光标之前的第一个@符号就是搜索内容
                let targeText = rangeDom.textContent.substring(0, range.endOffset);
                // console.log(targeText, 'targeText');
                const aiteChat = targeText.lastIndexOf('@');
                // 光标之前的文本里没有@符号 直接隐藏不展示下拉列表
                if (aiteChat === -1) return;
                const searchString = targeText.substring(aiteChat + 1, range.endOffset);
                console.log('searchString', searchString);
                this.serchByNickName = searchString;
                if (searchString && isShowMemory) {
                    this.showAiTeMember = true;
                }
            },
            isNeedSearch() {
                let range = null;
                let sel;
                if (window.getSelection) {
                    sel = window.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        range = sel.getRangeAt(0);
                    }
                } else if (document.selection && document.selection.createRange) {
                    range = document.selection.createRange();
                }
                // console.log(range);
                const { commonAncestorContainer, endContainer } = range;
                // 在contenteditable="true" 中插入 contenteditable="false" 的元素后会导致光标不可见，可以在内容末尾插入一个 br 标签。
                // 如果当前光标在不可点击的         AITEMEMBER  就return 接下来的操作
                if (commonAncestorContainer.parentElement.nodeName === 'AITEMEMBER') return;
                const aiteChat = endContainer.textContent.lastIndexOf('@');
                if (aiteChat === -1) return;
                // 如果点击输入框时 光标所在的区域有@并且@之前有空格才开始 模糊搜索
                // console.log(endContainer.textContent[(aiteChat - 1)], aiteChat);
                if (endContainer.textContent[(aiteChat - 1)]) {
                    if (endContainer.textContent[(aiteChat - 1)].trim().length === 0) {
                        this.EnSearchM(true);
                    }
                    return;
                };
                this.EnSearchM(true);
                // 是否需要进行 搜索
            },
            // 查询当前聊天对象的翻译记忆
            getCurrentChatCountTM() {
                return getTranslateMemory({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    sessionType: 12,
                    userAccount: this.whatsAppAccountInfo.whatsappAccount, // 询盘云 用户账号
                    visitorAccount: this.currAccountInfo.chatWaAccount // 访客账号
                });
            },

            // 发送输入框内容到后端
            broadcastInputContent() {
                if (!(this.currAccountInfo && this.currAccountInfo.chatWaAccount)) {
                    return;
                }

                broadcastChatContent({
                    userId: this.userId,
                    orgId: this.enterpriseId,
                    operationType: 0, // 固定值
                    bindWa: this.whatsAppAccountInfo.whatsappAccount,
                    destJid: this.currAccountInfo.chatWaAccount,
                    content: this.msgToSent || '',
                    realName: this.fullName
                });
            },
            // 处理输入框聚焦事件
            handleFocus() {
                // 定时向后端发送输入框文本消息
                this.setTimer_sendContent();
            },
            // 设置定时器: 定时发送输入框内容到后端轮询
            setTimer_sendContent() {
                if (this.timer_sendContent) {
                    return;
                }

                this.timer_sendContent = setInterval(() => {
                    this.broadcastInputContent();
                }, 3000);
            },
            // 清空定时器: 定时发送输入框内容到后端轮询
            clearTimer_sendContent(replaceObj = {}) {
                // 清除定时器
                if (this.timer_sendContent) {
                    clearInterval(this.timer_sendContent);
                    this.timer_sendContent = null;
                }

                // 发送请求
                const postData = Object.assign({
                    userId: this.userId,
                    orgId: this.enterpriseId,
                    operationType: 1, // 固定值
                    bindWa: this.whatsAppAccountInfo.whatsappAccount || this.lastBindAccount,
                    destJid: this.currAccountInfo.chatWaAccount || this.lastWAAccount,
                    realName: this.fullName
                }, replaceObj);
                if (postData.bindWa && postData.destJid) {
                    deleteBroadcastChatContent(postData);
                }
            },

            // 会话发生变动
            async handleToggleChat() {
                const val = this.currAccountInfo;

                this.fileList = []; // 将附件列表置空
                if (this.$refs.dragFile) {
                    this.$refs.dragFile.fileList = []; // 将上传组件的附件列表置为空
                }
                // 清除消息引用
                this.clearReplyMsg();

                // 清除定时器:定时发送输入框消息到后端
                if (this.lastWAAccount) {
                    this.clearTimer_sendContent({ destJid: this.lastWAAccount });
                }
                // 清除输入中信息
                this.enteringInfoArr = [];

                // 查看下属中, 不允许继续回填
                if (!this.viewingSubWA) {
                    // 将储存的消息回填输入框
                    if (this.unSendChatMessage.hasOwnProperty(`${this.whatsAppAccountInfo.whatsappAccount}`) &&
                        this.unSendChatMessage[this.whatsAppAccountInfo.whatsappAccount].hasOwnProperty(`${val.chatWaAccount}`) &&
                        this.unSendChatMessage[this.whatsAppAccountInfo.whatsappAccount][val.chatWaAccount]) {
                        const _this = this;
                        setTimeout(() => {
                            // console.error('this.unSendChatMessage', this.unSendChatMessage);
                            const inputDiv = _this.$refs.sendMsg;
                            inputDiv.innerHTML = _this.unSendChatMessage[this.whatsAppAccountInfo.whatsappAccount][val.chatWaAccount];
                        }, 500);
                    } else {
                        this.msgToSent = ''; // 将输入框置空
                    }
                }

                this.lastWAAccount = val.chatWaAccount || val.contactWaAccount;
                if (this.whatsAppAccountInfo && this.whatsAppAccountInfo.whatsappAccount) {
                    let { message } = await this.getCurrentChatCountTM();
                    console.log(message, '之前报错的翻译记录是');
                    if (!message) {
                        // 如果没有查询到之前保存的翻译语种 则调用识别接口识别 之后赋值
                        // this.selectedLang = 'en'; // 因为要上线侧边栏改版所以先将翻译内容注释掉
                        await this.getStoreStateAndSetEmpty();
                    } else {
                        // 如果有则使用之前保存的翻译结果
                        if(message == 'Network Error') {
                            message = 'en'
                        }
                        this.selectedLang = message; // 默认没有记忆翻译语言为英语
                    }
                   
                    console.log(this.selectedLang, '设置全局语种');
                    this.$store.commit('setisInNotNeeDTranslateArr', this.selectedLang);
                }
                
                this.ForceUpdate = Date.now();

                // 打开会话时插入数据
                if (this.insertData) {
                    if (this.lastWAAccount && this.insertData[this.lastWAAccount]) {
                        this.insertInputMsg(this.insertData[this.lastWAAccount]);
                    }

                    // 无论是否是当前会话的数据, 都有清除原数据, 以保证只有用户第一次想插入数据时打开对应的会话才能生效
                    this.$emit('update:insertData', '');
                }
            },

            // ai tool bar
            onIputSelect(e) {
                const inputDiv = this.$refs.sendMsg
                const result = getSelectedText()
                if (result?.text) {
                    this.aiSelection = result.selection.getRangeAt(0)
                    const range =  result.selection.getRangeAt(0)

                    this.$aiToolBar.init({
                        type: 'inputBoxSelect',
                        value: result?.text,
                        mouseX: e.clientX,
                        mouseY: e.clientY,
                        onCover: (v) => {
                            autoSelectedNode(v, inputDiv, range, result?.text, true)
                        },
                        onInsert: (v) => {
                            autoSelectedNode(v, inputDiv, range, result?.text)
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
    .m-chat-editor /deep/ .ivu-upload-drag {
        border: none;
        display: inline-block;
        width: 100%;
        background-color: #fafcff;
    }

    .m-chat-editor /deep/ .ivu-upload-drag:hover {
        border: none;
    }

    .input-box {
        .ivu-drawer-wrap .ivu-input {
            border: none;
        }
    }
    .m-chat-editor-main {
        border-top: 1px solid #e8e8e8;
        padding: 10px;
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

    .whatsapp-manage-send {
        margin-right: 34px;
    }
    //whatsApp弹窗样式特殊处理
    .whatsApp-modal {
        .whatsapp-manage-send {
            margin-right: 0px;
        }
        .m-chat-editor-main {
            padding: 0;
            border: none;
        }
        // .send-msg /deep/ .el-textarea__inner{
        //      border: none;
        //      resize: none;
        // }
    }

    .whatsApp-insert-emoji {
        vertical-align: text-bottom;

        &:hover {
            cursor: pointer;
        }

        &__active {
            color: #4285F2;
        }
    }

    .whatsApp-emojiPop-trigger, .whatsApp-verbalPop-trigger {
        display: inline-block;
        width: 1px;
        height: 1px;
        line-height: 0;
    }

    .whatsApp-emojiPop-trigger {
        position: absolute;
        top: 0;
        left: 195px;
    }

    .whatsApp-verbalPop-trigger {
        position: absolute;
        top: 0;
        left: 125px;
    }

    .reply-msg-container {
        position: relative;
        margin: 0 35px 10px 0;

        /deep/ .waQuoteMsg-mainContent {
            background: #F6F7FB;
            border-radius: 4px;
            padding: 12px 20px;

            .waMsgItem-text, .waMsgItem-desc, .message-file-name, .notText-bgColor-white {
                -webkit-line-clamp: 2;
            }
        }

        .reply-msg-clsBtn {
            position: absolute;
            right: -34px;
            top: 50%;
            transform: translate(0, -50%);
        }
    }

    .brand-page-name {
        display: inline-block;
        vertical-align: middle;
        max-width: 146px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        line-height: 18px;
        color: rgba(0,0,0,0.80);
        padding: 0 10px;
    }

    // 登陆提示,头像下的提示  公共样式
    .login_prompt {
        font-size: 12px;
        color: rgba(0,0,0,0.40);
        line-height: 18px;
        font-weight: 400;
        margin-left: 10px;
    }

    // 失效或提示样式
    .login_prompt_offline {
        color: #EA4335;
    }

    .ownWaAccount-trigger {
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        float: right;
        height: 34px;
        line-height: 18px;
        margin-right: 10px;
    }

    .ownWaAccount-list {
    }

    .ownWaAccount-avatar {
        .avatar-small {
            width: 44px;
            height: 44px;
            border-radius: 22px;
            border: 1px solid #EAEAEA;
        }
    }

    .ownWaAccount-item {
        display: flex;
        align-items: center;

        padding: 8px 20px;
        width: 300px;
        cursor: pointer;

        > *:not(:first-child) {
            margin-left: 12px;
        }

        &:hover {
            background: #F5F7FA;
        }
    }

    .ownWaAccount-nickInfo {
        flex: 1;
        overflow: hidden;

        .ownWaAccount-nick {
            font-weight: 500;
            color: rgba(0, 0, 0, 80%);
        }
    }

    .ownWaAccount-status {
        margin: 0;
    }

    .enteringInfo-container {
        .enteringInfo {
            color: #333;
            font-size: 12px;
            line-height: 14px;
            padding-bottom: 8px;
            display: flex;

            .enteringInfo-nick {
                display: inline-block;
                flex-shrink: 0;
            }

            .enteringInfo-status {
                display: inline-block;
                color: #EA4335;
                flex-shrink: 0;
            }

            .enteringInfo-content {
                flex: 1;
                display: inline-block;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
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

    .waInputDiv {
        white-space: pre-wrap;
        word-wrap: break-word;
        word-break: break-all;
        overflow-y: auto;
        outline: 0;
        resize: none;
        line-height: 1.5;
        box-sizing: border-box;
        width: 100%;
        height: 75px;
        padding: 5px 15px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        transition: border-color .2s cubic-bezier(.645,.045,.355,1);
        text-align: left;
        cursor: text;
        background-color: #fff;
        color: #606266;
        resize: vertical;

        &:hover, &:focus {
            border-color: #4285F2;
            box-shadow: 0 3px 0 0 #4285f2;
        }
    }

    .waInputDiv:empty::before {
        content: attr(placeholder);
        color: rgba(0, 0, 0, 0.28);
        font-size: 12px;
    }

    .waInputDiv__disabled {
        background-color: #f5f7fa;
        border-color: #e4e7ed;
        color: #c0c4cc;
        cursor: not-allowed;
    }

    .waInputDiv__disabled:empty::before {
        color: #bbb;
    }

    .unableToSendGroupMsgTip {
        text-align: center;
        padding: 12px 0;
        background-color: #f5f7fa;
        border-color: #e4e7ed;
        color: #c0c4cc;
        cursor: not-allowed;
    }

    .whatsApp-upload-file {
        display: inline-block;
        margin-right: 15px;
        cursor: pointer;

        i {
            vertical-align: text-bottom;
        }
    }

    .hide-drop-menu {
        display: none;
    }

    .whatsApp-upload-option {
        text-align: center;
        max-height: 300px;
        width: 120px;
        white-space: nowrap;
    }

    .ownWaAccount-popper {
        &.el-popper {
            margin-top: 25px;
            padding: 10px 0;
        }
    }

    .msg-send {
        .toogleTemplate {
            height: 32px;
            line-height: 32px;
            /* padding: unset !important; */
            padding: 0 8px;
            margin-right: 20px;
            border-color: #dddfe5;
            color: rgba(0, 0, 0, 0.6);
            font-weight: 400;

            &:hover, &:focus {
                border-color: #dddfe5;
                color: rgba(0, 0, 0, 0.6);
                background: unset;
            }
        }

        .el-button{
            &.is-disabled {
                background: #e7ecf2;
                border-color: #e7ecf2;
                cursor:default;color:
                rgba(110,129,154,.4);
            }
        }
    }
    .searchUseByEditList{
        color:#3b78de
    }
</style>
