<template>
    <div class="config-message" :style="{height: childComponentHeight, maxHeight: childComponentHeight, overflowY: 'scroll'}">
        <div v-if="currentChoose === 'personalSend'" class="personal-send-box">
            <!-- 文件上传组件 禁用多选multiple -->
            <input type="file" style="display: none" ref="fileToUpload" @change="handleUpload">

            <div class="top">
                <div style="display: flex;line-height: 22px;">
                    <div style="color: #333;font-weight: 600;">{{$t('wagroupsend.messageContent')}}</div>
                    <div style="margin-left: 12px;font-size: 12px;">{{$t('wagroupsend.addToItems')}}</div>
                </div>
                <div style="display: flex;">
                    <div class="btn" @click="addContent('text')">{{$t('wagroupsend.addText')}}</div>
                    <div class="btn" @click="addContent('appendix')" style="margin: 0 20px;">{{$t('wagroupsend.addAttachments')}}</div>
                    <div v-if="authorized_button.smartMaterial" class="btn" @click="addContent('smartMaterials')" style="margin-right: 40px;">{{$t('wagroupsend.addSmartMaterials')}}</div>
                </div>
            </div>
            <!-- 消息 -->
            <div class="message-list" v-if="messageContentList.length">
                <div class="message-item" v-for="item in messageContentList" :key="item.id">
                    <!-- 文本 -->
                    <template v-if="item.msgType === 'text'">
                        <div class="text-box">
                            <div :contentEditable="true"
                                ref="sendMsg"
                                @input="editorInput($event, item)"
                                @click="save_range(item)"
                                @keyup="save_range(item)"
                                @keydown="inputOnKeyDown"
                                @paste="handlePaste"
                                :placeholder="$t('chat.inputbox')"
                                class="waInputDiv">
                            </div>

                            <!-- 表情 -->
                            <div class="m-chat-editor-main">
                                <!-- 表情 -->
                                <Poptip trigger="click"
                                        width="403"
                                        placement="top"
                                        ref="emojiPop"
                                        @show="handleToggleEmojiPop(true)"
                                        @hide="handleToggleEmojiPop(false)">
                                    <!-- trigger -->
                                    <Icon slot="reference"
                                        custom="custom custom-emoji"
                                        size="19"
                                        @click="trigger_emoji(item)"
                                        class="whatsApp-insert-emoji"></Icon>

                                    <!-- content -->
                                    <Emoji @checkEmoji="handleCheckEmoji"></Emoji>
                                </Poptip>
                            </div>

                            <!-- 字符数 -->
                            <div style="position: absolute;bottom: 4px;right: 50px;color: rgba(0, 0, 0, 0.28);font-size: 12px;font-style: normal;font-weight: 400;">
                                {{ item.content.length }}&#47;{{ max }}
                            </div>

                            <!-- 删除按钮 -->
                            <div>
                                <Icon size="16" custom="custom custom-field-delete" style="margin-left: 20px;cursor: pointer;" @click="handleDelete(item)" />
                            </div>
                        </div>
                    </template>
                    <!-- 附件 -->
                    <template v-if="item.msgType === 'appendix'">
                        <div class="appendix-box">
                            <div class="left">
                                <div>
                                    <Icon size="44" :custom="`custom ${item.icon}`" />
                                </div>
                                <div style="margin-left: 12px;color: rgba(0, 0, 0, 0.80);font-size: 14px;font-weight: 400;line-height: 44px;max-width: 480px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
                                    {{ item.name }}
                                </div>
                            </div>
                            <!-- 删除按钮 -->
                            <div>
                                <Icon size="16" custom="custom custom-field-delete" style="margin-left: 20px;cursor: pointer;" @click="handleDelete(item)" />
                            </div>
                        </div>
                    </template>
                    <!-- 智能物料 -->
                    <template v-if="item.msgType === 'smartMaterials'">
                        <div class="smartMaterials-box">
                            <div class="left">
                                <div style="margin-right: 16px;width: 50px;height: 50px;border-radius: 4px;"><img :src="item.image" style="width: 100%;height: 100%;" alt=""></div>
                                <div style="margin-left: 16px;">
                                    <div style="color: #333;font-size: 14px;font-weight: 500;line-height: 22px;max-width: 480px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
                                        {{ item.name }}
                                    </div>
                                    <div style="color: #666;font-size: 12px;font-weight: 400;line-height: 18px;max-width: 480px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
                                        {{ item.desc }}
                                    </div>
                                </div>
                            </div>
                            <!-- 删除按钮 -->
                            <div>
                                <Icon size="16" custom="custom custom-field-delete" style="margin-left: 20px;cursor: pointer;" @click="handleDelete(item)" />
                            </div>
                        </div>
                    </template>
                </div>
            </div>
            <smartModal :visible.sync="smartModalVisible" @handleSmartFile="handleSmartFile"></smartModal>
        </div>
        <div v-else>
            <div class="templateList_apised_wrap">
                <Form
                   
                 :model="dynamicValidateForm" ref="dynamicValidateForm" >
                    <FormItem 
                        prop="temid"
                        :label="$t('wagroupsend.messageTemplate')"
                      
                        :rules="[
                            { required: true, message: '请选择消息模板', trigger: 'blur'},
                            {  message: '请选择消息模板', trigger: ['blur', 'change'] }
                        ]"
                    >
                            <Select v-model="dynamicValidateForm.temid"
                                placement="top">
                                <Option v-for="(item,index) in TemplateListArr" :value="item.id" :label="item.name+'_'+item.language" :key="item.id"></Option>
                            </Select>
                    </FormItem>
                    <p style="color: #333;
                    font-size: 14px;
                    line-height: 22px;" v-if="dynamicValidateForm.domains.length"> {{$t('wagroupsend.Variable')}}</p>
                    <FormItem 
                        v-for="(domain, index) in dynamicValidateForm.domains"
                        :label="'Param' + (index+1)"
                            label-width="75px" 
                        :key="domain.key"
                        :prop="'domains.' + index + '.value'"
                        :rules="{
                        required: true, message: '参数不能为空', trigger: 'blur'
                        }"
                    >
                        <Input v-model="domain.value"></Input>
                    </FormItem>
                </Form>
            </div>
            
        </div>
    </div>
</template>

<script>
    import { TemplateList } from '@/api/whatsapp';
    import { mapState } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import util from '@/libs/util';
    import Emoji from '@/views/whatsapp-manage/components/emoji.vue';
    import smartModal from '@/views/main-components/smartModal/smartModal';

    export default {
        name: 'configMessage',
        components: {
            Emoji,
            smartModal
        },
        props: {
            previousComponent: {
                type: String
            },
            currentComponent: {
                type: String
            },
            childComponentHeight: {
                type: String,
                default: '400px'
            },
            currentChoose: {
                type: String,
                default: 'personalSend'
            },
            currenAccountList: {
                // 当前输入的wa号码
                type:Array,
                default: []
            }
        },
        computed: {
            ...mapState({
                orgId: (state) => state.enterpriseId,
                userId: (state) => state.userId,
                wAGroupSendVisible: state => state.wAGroupSendVisible,
                checkedAllAccount: state => state.wAGroupSendallChecked,
                menu_list: state => state.app.menu_list
            }),
            authorized_button() {
                return {
                    smartMaterial: !HANDLE_BUTTON(BUTTON_IDS.WhatsApp.smartMaterial, this.menu_list)
                };
            }
        },
        data() {
            return {
                visible_emojiPop: false, // emoji 弹框显隐
                max: 2000, // 最大字符数
                refId: 0,
                smartModalVisible: false, // 智能物料modal

                contentType: '', // 上传组件类型
                textId: '', // 当前文本框的id
                lastEditRange: '', // 保存当前焦点的位置
                messageContentList: [],

                TemplateListArr: [],
                dynamicValidateForm: {
                    domains: [],
                    temid: ''
                },
                ParamsTemplate:{
                    orgId: this.orgId,
                    userId:this.userId,
                    paramMap: {
                        HEADER: [],
                        BODY: []
                    },
                    taskName: '',
                    templateContent: {},
                    chatWaAccountList: [],
                    sendType: 2, // 在群发消息传递2
                }
            };
        },
        methods: {
            editorInput(e, item) {
                const [current] = this.messageContentList.filter(el => el.refId === item.refId);

                // 判断 content 的length, innerHTML中包含了标签,判断不准
                if (current.content.length > this.max) {
                    e.target.innerHTML = e.target.innerHTML.substring(0, this.max);
                    this.$refs.sendMsg[item.refId].blur();
                    this.$Message.error(this.$t('wagroupsend.enter1000characters'));
                }
            },
            handleSmartFile(file) {
                this.messageContentList.push({
                    id: this.messageContentList.length,
                    msgType: 'smartMaterials',
                    name: file.title,
                    desc: file.description,
                    image: file.image,
                    fileId: file.id
                });
            },
            setTextContent() {
                this.messageContentList.forEach((item, index) => {
                    if (item.msgType === 'text' && index === this.textId) {
                        item.content = this.$refs.sendMsg[this.textId].innerHTML;
                    }
                });
            },
            /* emoji 弹框相关 */
            // 触发 emoji trigger
            trigger_emoji(item) {
                this.textId = item.refId;

                if (this.visible_emojiPop) {
                    // emoji pop 显示中

                    // 关闭
                    // this.$refs.emojiPop[this.textId].doClose();
                } else {
                    // pop 隐藏中

                    // 显示
                    const domInput = this.$refs.sendMsg[this.textId];
                    domInput.focus();

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

                    range.selectAllChildren(domInput);
                    range.collapseToEnd();

                    console.error('this.lastEditRange', this.lastEditRange);

                    setTimeout(() => {
                        this.setTextContent();
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
            // 组件重置
            init() {
                this.messageContentList = [];
                this.textId = '';
                this.refId = 0;
                this.lastEditRange = '';
                this.contentType = '';
                this.ParamsTemplate = {
                    orgId: this.orgId,
                    userId: this.userId,
                    paramMap: {
                        HEADER: [],
                        BODY: []
                    },
                    taskName: '',
                    templateContent: {},
                    chatWaAccountList: [],
                    sendType: 2
                };
                this.dynamicValidateForm = {
                    domains: [],
                    temid: ''
                };
            },
            // 获取文件后缀名
            getFileSuffix(filename) {
                const index1 = filename.lastIndexOf('.');
                const index2 = filename.length;

                // return filename.substring(index1 + 1, index2); // 方法一
                return filename.slice(index1 + 1, index2);
            },
            handleUpload(event) {
                const files = event.target.files;
                const maxSize = 16 * 1024 * 1024; // 16M (1M = 1024KB)
                if (files[0].size > maxSize) {
                    const tip = `${files[0].name}${this.$t('chat.fileOverSize1')}16M${this.$t('chat.fileOverSize2')}`;
                    this.$Message.error(tip);
                } else if (!this.sendFilesMsg(this.getFileSuffix(files[0].name))) {
                    this.$Message.warning('暂不支持发送此类文件');
                } else {
                    this.messageContentList.push({
                        id: this.messageContentList.length,
                        msgType: 'appendix', // 消息类型
                        content: files[0],
                        name: files[0].name,
                        type: this.sendFilesMsg(this.getFileSuffix(files[0].name)), // 文件类型
                        icon: this.getAttachmentIcon(this.getFileSuffix(files[0].name))
                    });
                }
            },
            // 获取附件type
            sendFilesMsg(suffix) {
                const documentTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rar', 'zip', 'epub', 'txt', 'ai', 'dwg', 'rcfgx'];
                const imageTypes = ['png', 'jpg', 'jpeg'];
                const audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'amr', 'm4a', 'm4r'];
                const videoTypes = ['mp4', 'mov'];

                if (documentTypes.includes(suffix)) {
                    return 'document';
                } else if (imageTypes.includes(suffix)) {
                    return 'image';
                } else if (videoTypes.includes(suffix)) {
                    return 'video';
                } else if (audioTypes.includes(suffix)) {
                    return 'audio';
                } else {
                    return false;
                }
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
                    case 'txt':
                        return 'custom custom-file-text';
                    case 'ppt':
                    case 'pptx':
                        return 'custom custom-file-ppt';
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

            // 删除内容
            handleDelete(item) {
                this.lastEditRange = '';
                this.messageContentList = this.messageContentList.filter(ele => ele.id !== item.id);
                if (item.msgType === 'text') {
                    let refId = 0;
                    this.messageContentList.forEach(item => {
                        if (item.msgType === 'text') {
                            item.refId = refId;
                            refId++;
                        }
                    });
                }
            },
            mutationObserver() {
                this.messageContentList.forEach(item => {
                    if (item.msgType !== 'text') return;
                    // 监听 DOM 变化, 变化时将 contentEditable div 内容转换成纯文本赋值到 item.content
                    item.observer = new MutationObserver((mutations, observe) => {
                        // 方法, 递归提取 DOM 内文本信息
                        function getTextContent_recurSively(dom) {
                            // 暂存结果
                            let result = '';

                            // 遍历 dom 所有子结点提取文本信息
                            if (dom.childNodes.length) {
                                for (let i = 0; i < dom.childNodes.length; i++) {
                                    const node = dom.childNodes[i];
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

                        // 赋值 content
                        item.content = getTextContent_recurSively(this.$refs.sendMsg[item.refId]);
                    });
                    item.observer.observe(this.$refs.sendMsg[item.refId], {
                        childList: true,
                        characterData: true,
                        subtree: true
                    });
                });
            },
            // 添加内容
            addContent(type) {
                if (this.messageContentList.length > 2) {
                    this.$Message.warning(this.$t('wagroupsend.add3Messages'));
                    return;
                }

                if (type === 'text') {
                    let refId = 0;
                    this.messageContentList.push({
                        id: this.messageContentList.length,
                        refId: 0,
                        msgType: 'text',
                        content: '',
                        observer: null
                    });
                    this.messageContentList.forEach(item => {
                        if (item.msgType === 'text') {
                            item.refId = refId;
                            refId++;
                        }
                    });

                    this.$nextTick(() => {
                        this.mutationObserver();
                    });
                } else if (type === 'appendix') {
                    // 添加附件
                    this.contentType = 'appendix';
                    this.$refs.fileToUpload.value = '';
                    this.$refs.fileToUpload.click();
                } else if (type === 'smartMaterials') {
                    // 添加智能物料
                    this.contentType = 'smartMaterials';
                    this.smartModalVisible = true;
                }
            },

            // 离开焦点时先保存状态
            save_range(item) {
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
                this.textId = item.refId;
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
                const dom_input = this.$refs.sendMsg[this.textId];

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
                } else if (!selection.anchorNode || selection.anchorNode === dom_input) {
                    // 焦点就在文本框, 则直接 append node 到最后
                    dom_input.appendChild(dom_insert);
                } else if (selection.anchorNode.nodeName !== '#text') {
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
                this.setTextContent();
            },
            /** 键盘回车事件 */
            inputOnKeyDown(e) {
                // 处理回车
                if (e.keyCode === 13) {
                    e.preventDefault();
                    // 按下回车键

                    // 换行
                    this.insertInputMsg('\n');
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

            getTemplateList() {
                TemplateList({
                    orgId: this.orgId
                }).then(res => {
                    console.log(res, 'reree');
                    this.TemplateListArr = res.data;
                });
            },
            // 预览模版消息
            previewMsg(item) {
                if (item) {
                    // {{1}} 模版解析正则
                    // const reg = /(?<=\{{)(.+?)(?=\}})/g; 有兼容
                    const reg = /\{\{((?:.|\r?\n)+?)\}\}/g;
                    // var regx = /\{\{(.+?)\}\}/g; 备用方案
                    try {
                        // eslint-disable-next-line no-var
                        var headList = item.components.filter(ele => ele.type === 'HEADER')[0].text.match(reg);
                    // eslint-disable-next-line no-empty
                    } catch (error) {}
                    try {
                        // eslint-disable-next-line no-var
                        var arglist = item.components.filter(ele => ele.type === 'BODY')[0].text.match(reg);
                    // eslint-disable-next-line no-empty
                    } catch (error) {}
                    console.log(arglist, headList);
                    this.dynamicValidateForm.domains = [];
                    if (arglist || headList) {
                        try {
                            headList.forEach(ele => {
                                this.dynamicValidateForm.domains.push({
                                    part: 'HEADER',
                                    value: ''
                                });
                            });
                        } catch (e) {
                            console.log(e);
                        }
                        try {
                            arglist.forEach(ele => {
                                this.dynamicValidateForm.domains.push({
                                    part: 'BODY',
                                    value: ''
                                });
                            });
                        } catch (e) {
                            console.log(e);
                        }
                    } else {
                        this.dynamicValidateForm.domains = [];
                    }
                }
            },
            submitForm() {
                    let status = false;
                        this.$refs['dynamicValidateForm'].validate((valid) => {
                            if (valid) {
                                const Template = this.TemplateListArr.find(ele=> ele.id === this.dynamicValidateForm.temid);
                                this.ParamsTemplate.templateContent = Template;
                                this.timeToSendMsg(this.dynamicValidateForm.domains)
                                status = true;
                            } else {
                                status = false;
                            }
                        });
                    
                    return status;
            },
            // 发送的模版参数
            timeToSendMsg(val) {
                this.$parent.$parent.sendLoading = true;
                this.ParamsTemplate.taskName = this.$parent.$parent.dataJson.taskName;
                // console.log(val,'sss');
                this.ParamsTemplate.paramMap = {
                    HEADER: [],
                    BODY: []
                };
                this.sendDoneTemMsg = true;
                if (val) {
                    console.log(val,);
                    val.forEach(ele => {
                        this.ParamsTemplate.paramMap[ele.part].push(ele.value);
                    });
                };
                this.ParamsTemplate.orgId = this.orgId;
                this.ParamsTemplate.userId = this.userId;
                // eslint-disable-next-line space-in-parens
             
                this.ParamsTemplate.chatWaAccountList = this.currenAccountList
                // eslint-disable-next-line eqeqeq
                if (this.ParamsTemplate.paramMap.HEADER.length == 0) {
                    this.ParamsTemplate.paramMap = {
                        BODY: this.ParamsTemplate.paramMap.BODY
                    };
                }
                // eslint-disable-next-line eqeqeq
                if (this.ParamsTemplate.paramMap.BODY.length == 0) {
                    this.ParamsTemplate.paramMap = {};
                }
                //  waGroupSendParpasJson用于wa广告群发功能  waGroupSendParpasJson存储筛选条件 在全选联系人时需要将筛选条件传递给后端
                if(this.checkedAllAccount){
                    // wa聊天列表的群发按钮 增加全选逻辑 发送保存的查询参数给后端
                    this.ParamsTemplate.selectAll = 1;
                    const waGroupSendParpasJson = JSON.parse(sessionStorage.getItem('waGroupSendParpasJson')) ;
                    delete waGroupSendParpasJson.size;
                    delete waGroupSendParpasJson.page;
                    this.ParamsTemplate.query = JSON.stringify(waGroupSendParpasJson);
                  
                    this.ParamsTemplate.chatWaAccountList = []
                }
                util.ajaxWAJson({
                    url: '/whatsapp/grouptask/groupSend',
                    method: 'POST',
                    data: this.ParamsTemplate,
                    timeout: 60000
                }).then(res => {
                    // eslint-disable-next-line eqeqeq
                    if (res.data.code == 1) {
                        this.$Message.success(this.$t('wagroupsend.sendSuccess'));
                            // 关闭 modal
                        this.$store.commit('setWAGroupSendVisible', false);
                        // 更新任务列表数据
                        this.$store.commit('updateWAGroupSendList', new Date().getTime());
                    }else if (res.data.code == 2) {
                        this.$Message.warning(this.$t('whatsapp_manage.WABAtempMsgCode'));
                    }else{
                        this.$Message.warning(res.data.message);

                    }
                    this.ParamsTemplate.paramList = [];
                }).catch(error => {
                    if (error.toString().indexOf('timeout') !=-1) {
                        this.$Message.error(this.$t('whatsapp_manage.WABAsendTimout'));
                    }
                }).finally(()=>{
                    this.$parent.$parent.sendLoading = false;
                });
            }
        },
        activated() {
            if (this.previousComponent === 'selectAccount' && this.currentComponent === 'configMessage') {
                this.init();
            }
            this.getTemplateList();
        },
        watch: {
            messageContentList: {
                handler() {
                    this.$emit('getConfigMessage', this.messageContentList);
                },
                deep: true
            },
            // modal消失时, 重置组件
            wAGroupSendVisible: {
                handler(val) {
                    if (!val) {
                        this.init();
                    }
                },
                immediate: true
            },
            'dynamicValidateForm.temid'(v) {
                if (v) {
                    const item = this.TemplateListArr.find(ele => ele.id === v);
                    if (item) {
                        this.previewMsg(item);
                    }
                }
            }
        }
    };
</script>

<style scoped lang="less">
.config-message {
    .personal-send-box {
        padding: 30px 60px;

        .top {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            font-weight: 400;
            line-height: 18px;
            margin-bottom: 14px;
            .btn {
                line-height: 22px;
                color: #3B78DE;
                cursor: pointer;
            }
        }

        .message-list {
            .message-item {
                .smartMaterials-box,.appendix-box,.text-box {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .text-box {
                    position: relative;
                    .m-chat-editor-main {
                        position: absolute;
                        bottom: 1px;
                        left: 12px;
                        background: #ffffff;
                        width: calc(100% - 70px);
                        padding-bottom: 11px;
                    }
                }

                .smartMaterials-box,.appendix-box {
                    .left {
                        display: flex;
                        border: 1px solid #E9EAEA;
                        border-radius: 5px;
                        padding: 10px 12px;
                        width: 100%;
                    }
                }
            }
        }
    }
}
// 文本框禁用

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
    height: 200px;
    padding: 5px 15px 34px 15px;
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

.templateList_apised_wrap{
    width: 600px;
    margin: 0 auto;
}
/deep/.el-select{
    width: 100%;
}
/deep/.el-form-item__label{
    text-align: left;
}
/deep/.el-form-item__label{
    color: rgba(0, 0, 0, 0.80);
    font-size: 14px;
}
</style>
