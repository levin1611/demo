<template>
    <div class="new-marketing" v-loading="is_show">
        <Row>
            <Col :span="textModel?20:24" style="padding-right: 30px;" :style="textModel ? 'border-right: 1px solid #EBEEF5;' : ''">
            <!-- 接收人区域 -->
            <div class="receiver">
                <!-- 营销活动头部内容 -->
                <div class="header-title">
                    <h1 class="subject"> {{$t('mailMarketing.newMarketing.newMarketingActivity')}} </h1>
                    <div class="annotation">
                        <span>{{$t('mailMarketing.newMarketing.remainingEmails')}}： <i>{{availableSendCount}}</i> </span>
                    </div>
                </div>

                <Form  :model="marketingForm"
                       ref="ruleForm"
                       :rules="form_rules"
                       label-position="left"
                       label-width="100px">
                    <!-- 营销活动名称 -->
                    <FormItem  class="marketing-form-item" :label="$t('mailMarketing.newMarketing.name')" prop="actName">
                        <Input class="subject-input"
                                id="mailSubject"
                               :placeholder="$t('mailMarketing.newMarketing.namePurpose')"
                               style="width: 720px;"
                               @change="forceUpdateChange"
                               @focus="cursorType='person'"
                               v-model="marketingForm.actName"/>
                    </FormItem>

                    <!-- 主题 -->
                    <FormItem  class="marketing-form-item" :label="$t('mailMarketing.newMarketing.subject')" prop="subject">
                        <div @mouseup="onIputSelect">
                            <Input class="subject-input"
                               ref="subjectInput"
                               :placeholder="$t('mailMarketing.newMarketing.enterSubjectContent') + $t('aiToolBar.orPlaceholder')"
                               style="width: 720px;"
                               @change="forceUpdateChange"
                               @blur="handleInputBlur"
                               @focus="cursorType='subject'"
                               v-model="marketingForm.subject"/>
                        </div>
                    </FormItem>

                    <!-- 发件人 -->
                    <FormItem  class="marketing-form-item" :label="$t('mailMarketing.newMarketing.sender')" required>
                        <div style="display: inline-block;">
                            <FormItem prop="from">
                                <Select v-model="marketingForm.from"
                                        :placeholder="$t('mailMarketing.newMarketing.enterSender')"
                                        style="width: 720px;"
                                        @change="handleSender">
                                    <Option v-for="(item,index) in senders"
                                            class="mail-signature"
                                            :value="item.emailAddress"
                                            :key="item.emailAddress"
                                            :label="item.emailAddress">
                                    </Option>
                                </Select>
                            </FormItem>
                        </div>
                        <!--<div style="display: inline-block;">-->
                            <!--<FormItem prop="nickname">-->
                                <!--<Input class="subject-input"-->
                                       <!--:placeholder="$t('mailMarketing.newMarketing.enterNickname')"-->
                                       <!--:style="'width: 200px'"-->
                                       <!--@change="forceUpdateChange"-->
                                       <!--@focus="cursorType='person'"-->
                                       <!--v-model="marketingForm.nickname"/>-->
                            <!--</FormItem>-->
                        <!--</div>-->
                    </FormItem>

                    <!-- 收件人 -->
                    <FormItem class="marketing-form-item recipient-form" :label="$t('mailMarketing.newMarketing.recipients')" prop="addrBookIds">
                        <Input class="subject-textarea"
                               type="textarea"
                               ref="recipientInput"
                               :placeholder="$t('mailMarketing.newMarketing.enterRecipient')"
                               style="width: 720px;padding:1px;"
                               v-model="marketingForm.recipients_from_data.length"/>
                        <div class="recipient-list"
                             :class="textareaOverStatus?'recipient-list-border':''"
                             @click.stop="textareaClick"
                             @mouseover="textareaOver"
                             @mouseout="textareaOut"
                             tabindex="0"
                             outline="0"
                             hidefocus="true">
                            <Icon custom="custom custom-add" color="#7B98B6" size="10" style="position: absolute; top: 10px;right: 12px;cursor: pointer;" @click.stop="handleAddressBook"></Icon>
                            <span style="color: #C0C4CC;font-size: 12px;" v-if="!marketingForm.recipients_from_data.length">{{$t('mailMarketing.newMarketing.enterRecipient')}}</span>
                            <ul v-if="recipients_to.length">
                                <li v-for="(item, index) in marketingForm.recipients_from_data" :key="index" class="listItem" @mouseenter="enters(index)" @mouseleave="leaver(index)">
                                    <Tooltip placement="top" transfer :content="item.addrName" v-if="item.addrName && item.addrName.length > 8">
                                        <span>{{item.addrName | addrNameFilter}}</span>
                                    </Tooltip>
                                    <span v-else>{{item.addrName}}</span>
                                    <Icon class="deleteemailaddress" type="ios-close" @click="delTag(index, item.id)" v-show="showFileOperationIndex === index">
                                    </Icon>
                                </li>
                            </ul>
                        </div>
                    </FormItem>

                    <!--上传附件-->
                    <FormItem class="selfUpload-formItem">
                        <div @click.stop style="display:inline-block;">
                            <selfUpload
                                    ref="filesUpload"
                                    multiple
                                    type="drag"
                                    class="mail-upload"
                                    :action="action"
                                    :max-size="max_size"
                                    :ul_width="modal_width"
                                    :on-exceeded-size="handleSizeOverflow"
                                    :onPreview="handlePreviewAtta"
                                    :defaultFileList="defaultFileList"
                                    :style="isContainsMenu('database') ? 'width:174px;' : 'width:86px;'"
                                    @getUploadFilesList="getUploadFilesList">
                                <div style="height: 30px; line-height: 30px;">
                                    <Tooltip :content="$t('mail.writeLetter.attSize6MTip')" placement="top">
                                        <span class="write-mail-upload" @click="handleNormalUpload" style="position: absolute;top:0;left:0;font-size: 14px;">
                                            <Icon custom="custom-fujian" size="16" style="color: #3B78DE;margin-right: 4px;"/>{{$t('mail.writeLetter.uploadFiles')}}
                                        </span>
                                    </Tooltip>
                                    <Tooltip :content="$t('mail.writeLetter.attSize6MTip')" placement="top" v-show="isContainsMenu('database')">
                                        <span class="write-mail-upload" @click="handleDataBaseUpload" style="position: absolute;top:0;right:0;font-size: 14px;">
                                            <Icon custom="custom-icon_material" size="16" style="color: #3B78DE;margin-right: 4px;"/>{{$t('mail.writeLetter.insertSmartMaterial')}}
                                        </span>
                                    </Tooltip>
                                </div>
                            </selfUpload>
                        </div>
                        <!-- 插入变量、快速文本、监测链接的入口 -->
                        <div style="position: absolute;top:0; line-height:30px;" :style="isContainsMenu('database') ? 'left:174px;' : 'left:86px;'">
                            <Dropdown trigger="click" @command="insertVariable" style="display: inline-block;color:#3B78DE;margin-left: 20px;">
                                <a :title="$t('mail.separateInsertVariablesTips')" href="javascript:void(0)">
                                    <Icon custom="custom-bianliang" size="16" style="color: #3B78DE;margin-right: 4px;"/>{{$t('mail.separateInsertVariables')}}
                                </a>
                                <DropdownMenu slot="dropdown" class="add-variable-dropdown-menu">
                                    <DropdownItem style="font-size: 12px;" v-for="(item, index) in variableList" :key="index" :command="item.value" :class="item.class">{{item.label}}</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>

                            <span @click.stop="textModel=true;cursorType = 'editor'" style="color:#3B78DE;cursor: pointer;margin-left: 20px;">
                                <Icon custom="custom-kuaisuwenben" size="16" style="color: #3B78DE;margin-right: 4px;"/>{{$t('mail.writeLetter.fastText')}}
                            </span>
                            <!-- 模板的入口 -->
                            <span style="color:#3B78DE;cursor: pointer;margin-left:20px;" @click.stop="() => addTemplateVisible = true">
                                <Icon custom="custom-youjianmoban" size="14" style="color: #3B78DE;margin-right: 4px;"/>{{ $t('mailSetting.emailTemplate.template') }}
                            </span>
                            <span style="color:#3B78DE;cursor: pointer;margin-left:20px;" @click.stop="testInsertLink">
                                <Icon custom="custom-lianjie1" size="16" style="color: #3B78DE;margin-right: 4px;"/>{{$t('monitorLink.title')}}
                            </span>
                        </div>
                    </FormItem>

                    <!-- 编辑器区域 -->
                    <div class="content-edit">
                        <Editor :action="action" :cursorType.sync="cursorType"
                                ref="editorModule"
                                :is_show.sync="is_show"
                                :currEditor.sync="currEditor"
                                :actId="id"
                                :isInitFinishedMail.sync="isInitFinishedMail"
                                @requiredItemsVerification="requiredItemsVerification"
                                @initPage="initPage"
                        ></Editor>
                    </div>
                </Form>


                <!-- 拖拽的范围 -->
                <div style="position: absolute;left:20px;top:0;"
                     v-if="dragOver"
                     id="self-upload-drag"
                     @mousemove="mousemove_upload"
                     class="mail-upload-placeholder-container"
                     :style="{width: textModel?`calc(100% - ${linkmanListWidth+40}px)`: 'calc(100% - 40px)',height: 'calc(100% - 56px)'}"
                >
                    <!-- 拖拽上传附件显示范围 -->
                    <div style="height:calc(100% / 2);" :style="uploadAttachment?'border: 3px dashed #3B78DE;':'border: 3px dashed rgba(0,0,0,0.30);'" @dragover="upload_dragover" @drop="upload_drop">
                        <div class="mail-upload-placeholder-text" style="opacity: 0.6;background: #fff;">
                            <span class="mail-upload-placeholder-span">{{uploadAttachment ? '松开鼠标后立即上传为附件！' : '将文件拖至此区域内上传为附件'}}</span>
                        </div>
                    </div>
                    <!-- 上传到编辑器的图片 -->
                    <div style="height:calc(100% / 2);" :style="uploadImages?'border: 3px dashed #3B78DE;':'border: 3px dashed rgba(0,0,0,0.30);'" @dragover="upload_images_dragover">
                        <Upload
                                class="mail-upload-placeholder"
                                style="height:100%;width:100%;"
                                :on-success="insertImage"
                                :action="action"
                                :multiple="true"
                                accept=".png,.jpeg,.jpg,.gif,.bmp"
                                :show-file-list="false"
                                drag>
                            <div class="mail-upload-placeholder-text">
                                <span class="mail-upload-placeholder-span">{{uploadImages ? '松开鼠标后立即上传为正文！':'将图片拖至此区域内上传至正文'}}<br/>（支持 .jpg, .jpeg, .png, .gif, .bmp格式）</span>
                            </div>
                        </Upload>
                    </div>
                </div>
            </div>
            <!-- 底部操作区域 -->
            <div class="footer-operate">
                <FooterOperate :currEditor="currEditor"
                               ref="footerOperate"
                               v-if="currEditor"
                               :marketingForm="marketingForm"
                               @getFilesUpload="getFilesUpload"
                               :sendTip.sync="sendTip"
                               :id="id"
                               :senders="senders"
                               v-bind="$attrs"
                               v-on="$listeners"></FooterOperate>
            </div>
            </Col>

            <Col :span="4" v-show="textModel">
                <QuickText :textModel.sync="textModel" @handleQuickText="handleQuickText"></QuickText>
            </Col>
        </Row>
        <!-- 选择地址簿弹窗 -->
        <SelectAddressBook :visible.sync="addressBookVisible" :recipients_to.sync="recipients_to"></SelectAddressBook>
        <!-- 监测链接的弹窗组件 -->
        <monitorLink :visible.sync="visible_insertLink" @insertUrl="handleInsertUrl"></monitorLink>
        <!-- 插入模板弹窗 -->
        <mailTemplateModal :visible.sync="addTemplateVisible" @handleTemplate="handleTemplate"></mailTemplateModal>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import writeMailTranslate from '@/mixins/writeMailTranslate'; // 引入翻译功能相关共通代码
    import SelectAddressBook from './new-marketing/selectAddressBook.vue';
    import Editor from './new-marketing/editor.vue';
    import QuickText from './new-marketing/quickText.vue';
    import FooterOperate from './new-marketing/footerOperate.vue';
    import selfUpload from '@/views/mail/mail-home/components/write-mail/self-upload';
    import monitorLink from '@/views/main-components/contact-association/monitorLink';
    const mailTemplateModal = () => import("@/views/main-components/mail-template-modal.vue"); // 新增模板

    import { getInputSelectedText, coverText, insertText } from '@/views/ai-toolbar/utils/tools'

    export default {
        name: 'NewMarketing',
        mixins: [writeMailTranslate],
        props: ['id'],
        data() {
            const paramsData = JSON.parse(localStorage.getItem('routeParams'));
            return {
                is_show: true,
                showFileOperationIndex: -1,
                cursorType: '',
                mailContent: '', // 邮件内容
                marketingForm: {
                    actName: '', // 营销活动名称
                    subject: '', // 主题
                    from: '', // 发件人
                    nickname: '', // 发件热邮箱昵称
                    mailSignIndex: 0, // 邮件签名索引
                    priority: false, // 是否紧急
                    receipt_flag: false, // 是否回执
                    mailIsTrace: false, // 是否追踪邮件
                    recipients_from_data: [], // 收件人，地址簿选择的集合，后台不接收的参数，暂存数据
                    addrBookIds: [], // 收件人，利用选择地址簿的列表遍历出id集合
                    variables: [] // 群发增加的变量名信息
                },
                recipients_to: (paramsData && paramsData.data && [paramsData.data]) || [], // 从地址簿列表点击发信调过来的需要使用传过来的地址簿参数
                form_rules: {
                    actName: [
                        {
                            required: true,
                            message: this.$t('mailMarketing.newMarketing.enterName'),
                            trigger: 'blur'
                        },
                        {
                            validator: (rule, value, callback) => {
                                if (value.trim().length > 200) {
                                    return callback(new Error(this.$t('mailMarketing.newMarketing.nameLimit')));
                                } else {
                                    return callback();
                                }
                            },
                            trigger: 'blur'
                        }
                    ],
                    subject: [
                        {
                            required: true,
                            message: this.$t('mailMarketing.newMarketing.enterSubject'),
                            trigger: 'blur'
                        },
                        {
                            validator: (rule, value, callback) => {
                                if (value.trim().length > 200) {
                                    return callback(new Error(this.$t('mailMarketing.newMarketing.subjectLimit')));
                                } else {
                                    return callback();
                                }
                            },
                            trigger: 'blur'
                        }
                    ],
                    from: [
                        {
                            required: true,
                            message: this.$t('mailMarketing.newMarketing.enterSender'),
                            trigger: 'change'
                        },
                        {
                            validator: (rule, value, callback) => {
                                if (value.trim().length > 100) {
                                    return callback(new Error(this.$t('mailMarketing.newMarketing.senderLimit')));
                                } else {
                                    return callback();
                                }
                            },
                            trigger: 'blur'
                        }
                    ],
                    nickname: [
                        {
                            validator: (rule, value, callback) => {
                                if (value.trim().length > 100) {
                                    return callback(new Error(this.$t('mailMarketing.newMarketing.nicknameLimit')));
                                } else {
                                    return callback();
                                }
                            },
                            trigger: 'blur'
                        }
                    ],
                    addrBookIds: [
                        {
                            required: true,
                            message: this.$t('mailMarketing.newMarketing.enterRecipient'),
                        }
                    ]
                },
                senders: [], // 发件人
                textModel: false, // 控制快速文本显示状态
                addressBookVisible: false, // 控制地址簿显示状态
                visible_insertLink: false, // 控制插入链接弹窗显示状态
                action: '', // 上传图片url
                max_size: 6144,
                isFirstUpload: true, // 是否是第一次上传附件
                defaultFileList: [],
                /* 主题/正文插入变量相关 */
                variableList: [
                    {
                        label: this.$t('automatedMail.userName'),
                        value: 'name',
                        class: 'piwik-separate-insert-contactName'
                    },
                    {
                        label: this.$t('automatedMail.companyName'),
                        value: 'companyName',
                        class: 'piwik-separate-insert-companyName'
                    }
                ],
                inputSelectStartIndex: 0, // 输入框光标起始位置
                inputSelectEndIndex: 0, // 输入框光标停留位置
                currEditor: null, // 当前页面的富文本编辑器
                sendTip: '', // 必填项的校验提示
                isInitFinishedMail: false, // 编辑器是否已经初始化完成
                dragOver: false,
                uploadAttachment: false,
                uploadImages: false,
                textareaOverStatus: false,
                availableSendCount: 0, // 剩余可用数量
                addTemplateVisible: false
            };
        },
        components: { SelectAddressBook, selfUpload, Editor, QuickText, FooterOperate, monitorLink, mailTemplateModal },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                qiniuHttp: 'qiniuHttp',
                qiniuUrl: 'qiniuUrl',
                window_width: 'window_width',
                window_height: 'window_height',
                currentPersonId: state => state.mail.currentPersonId,
                saveWithWhich: state => state.mail.saveWithWhich,
                userName: state => state.userName,
                // 写信页面富文本编辑器 content_style 配置中会影响邮件内容渲染的样式
                tinymce_contentStyle: state => state.mail.tinymce_contentStyle
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            modal_width() {
                const width = document.body.clientWidth - 570;
                return parseInt(width);
            }
        },
        filters: {
            addrNameFilter(val) {
                if (val.length > 8) {
                    return val.substring(0, 8) + '...';
                }
                return val;
            }
        },
        mounted() {
            this.initQiniu();
            // 获取发件人邮箱列表
            this.getAccountsByUserId();
        },
        created() {
            // 获取剩余发件数
            this.getAvailableSendCountByOrgId();
            this.$nextTick(() => {
                const _this = this;
                document.body.addEventListener('dragenter', _this.enter_drag, false);
                document.body.addEventListener('drop', _this.dragleave, false);
                setTimeout(() => {
                    const toxTinymce = document.querySelector('.tox-tinymce');
                    toxTinymce.addEventListener('dragover', _this.enter_drag_iframe, false);
                    const iframe = document.getElementById('vEditor_ifr');
                    const iwindow = iframe.contentWindow;
                    iwindow.document.addEventListener('dragover', _this.enter_drag_iframe, false);
                }, 2000);
            });
        },
        methods: {
            // 删除收件人列表的某一项
            delTag(index, id) {
                this.marketingForm.recipients_from_data.splice(index, 1);
                this.marketingForm.addrBookIds = this.marketingForm.addrBookIds.split(',');
                let delIndex = '';
                this.marketingForm.addrBookIds.forEach((item, index) => {
                    if (Number(item) === Number(id)) {
                        delIndex = index;
                    }
                });
                this.marketingForm.addrBookIds.splice(delIndex, 1);
                this.marketingForm.addrBookIds = this.marketingForm.addrBookIds.join(',');
                this.$forceUpdate();
            },
            // 移入收件人的某一项
            enters(index) {
                this.showFileOperationIndex = index;
            },
            // 移出去收件人的某一项
            leaver(index) {
                this.showFileOperationIndex = -1;
            },
            /* 通过用户ID获取发件人邮箱列表 */
            getAccountsByUserId() {
                util.ajaxEmailMarketing({
                    url: '/business/mail/identity/getVerificationPassList',
                    method: 'post',
                    data: {
                        enterpriseId: this.enterpriseId,
                        createUserId: this.userId
                    }
                }).then(response => {
                    if (response.data.code === 1) {
                        this.senders = response.data.data;
                        if (response.data.data.length === 1) {
                            const item = response.data.data[0];
                            this.marketingForm.from = item.emailAddress;
                            this.marketingForm.nickname = item.emailNickname;
                        }
                        response.data.data.map((item, index) => {
                            if (item.defaultSendAccountFlag === '1') {
                                this.marketingForm.from = item.emailAddress;
                                this.marketingForm.nickname = item.emailNickname;
                            }
                        });
                    } else {
                        this.$Message.error('getAccountsByUserId失败!');
                    }
                });
            },
            // 控制发件人切换
            handleSender(i) {
                this.marketingForm.from = i;
                const arr = this.senders.filter((item) => {
                    if (item.emailAddress === i) {
                        return item;
                    }
                });
                this.marketingForm.nickname = arr[0].emailNickname;
            },
            // 打开选择地址簿
            handleAddressBook() {
                if (!this.isContainsMenu('address_book')) {
                    this.$Message.warning(this.$t('mailMarketing.newMarketing.authorityTip'));
                    return;
                }
                this.addressBookVisible = true;
            },
            /** 初始化编辑回显数据 */
            initPage() {
                /** 校验有没有邮件id，有id是编辑没有是新建 */
                const vm = this;
                if (this.id !== -1 && this.id) {
                    /** 编辑需要调接口查询邮件详情进行回显 */
                    util.ajaxEmailMarketing({
                        url: '/business/marketing/activity/getEdmActivityDetail',
                        method: 'get',
                        params: {
                            id: this.id
                        }
                    }).then(response => {
                        this.is_show = false;
                        if (response.data.code === 1) {
                            let result = response.data.data;
                            /** 获取签名列表并且初始化签名 */
                            this.$refs.footerOperate.getSignaturesByUserId(result.mailDetailCondition.mailSignId);
                            this.marketingForm = result;
                            this.marketingForm = result.mailDetailCondition;
                            result.mailDetailCondition.from = result.mailDetailCondition.from.replace('<', '');
                            result.mailDetailCondition.from = result.mailDetailCondition.from.replace('>', '');
                            this.$set(this.marketingForm, 'from', result.mailDetailCondition.from);
                            this.$set(this.marketingForm, 'actName', result.actName);
                            this.$set(this.marketingForm, 'nickname', result.nickname);
                            this.marketingForm.recipients_from_data = [];
                            this.recipients_to = result.receiveJson ? JSON.parse(result.receiveJson) : [];
                            // 回显邮件追踪、紧急、回执
                            this.marketingForm.mailIsTrace = result.mailDetailCondition.mailTraceFlag === 1;
                            this.marketingForm.priority = result.mailDetailCondition.mailUrgentFlag === 1;
                            this.marketingForm.receipt_flag = result.mailDetailCondition.mailReceiptFlag === 1;
                            this.forceUpdateChange();
                            // 去掉可能存在的, 邮件开头加的 iframe head style
                            if (result.mailDetailCondition.content && result.mailDetailCondition.content.startsWith(this.tinymce_contentStyle)) {
                                result.mailDetailCondition.content.replace(this.tinymce_contentStyle, '');
                            }
                            /**
                             * @Description: 需要把非草稿邮件的标识‘id=signature’去掉，以免影响回复/转发/再次编辑时的签名切换逻辑判断
                             * @author 杨娣
                             * @date 2020/7/7
                             */
                            if (result.mailDetailCondition.mailDraftFlag !== 1) {
                                result.mailDetailCondition.content = result.mailDetailCondition.content.replace(/id="signature"/ig, '');
                            }
                            /**
                             * @Description: 需要把没有签名的草稿邮件‘id=signature’去掉，以免影响草稿邮件再次编辑时，签名的初始化把写在签名地方的非签名内容清空
                             * @author 崔营营
                             * @date 2021/6/2
                             */
                            if (!result.mailDetailCondition.mailSignId) {
                                result.mailDetailCondition.content = result.mailDetailCondition.content.replace(/id="signature"/ig, '');
                            }
                            /**
                             * @Description: 1. plainText这个正则是判断邮件内容是否是html代码的。但其所用的方法是匹配其中所有的标签体，效率低
                             *               内容一旦过长容易页面卡死。此处换用另一个正则表达式来判断。
                             *               2. 邮件详情页的正文中超链接更改为新标签窗口打开
                             * @author 杨娣
                             * @date 2020/6/3
                             */
                            const isHtml = RegExp.prototype.test.bind(/(<([^>]+)>)/i);
                            if (typeof (vm.content) === 'string' && !isHtml(vm.content)) {
                                result.mailDetailCondition.content = result.mailDetailCondition.content.replace(/\n/g, '<br/>');
                            }
                            // const relayContent = () => {
                            //     result.mailDetailCondition.content = `<div id="relayPlaceholder" style="line-height: 32px;font-size:14px ;font-family: arial,helvetica,sans-serif;color:#333;">At ${data.sendTime}，${data.from} wrote: <br>
                            //                 <blockquote style='padding-left:1ex;margin:0 0 0 0.8ex;border-left:#ccc 1px solid'>
                            //                 ${result.mailDetailCondition.content}</blockquote></div>`;
                            // };

                            /** 在签名上方添加空白行，保证用户将光标放在空白行时，可以按照"写信默认设置"编辑 */
                            const findSIndex = result.mailDetailCondition.content.indexOf('<div id="signature"');
                            if (findSIndex !== -1) {
                                result.mailDetailCondition.content = `${result.mailDetailCondition.content.slice(0, findSIndex)}<div></div>${result.mailDetailCondition.content.slice(findSIndex)}`;
                            }
                            vm.mailContent = result.mailDetailCondition.content.replace(/<style(([\s\S])*?)<\/style>/g, '');
                            vm.currEditor.resetContent(vm.mailContent);
                            //  ---------------------- 附件回显 --------------------------
                            let fileList = result.mailDetailCondition.mailAttachmentList;
                            if (fileList) {
                                fileList = fileList.map(item => {
                                    let hash;
                                    if (item.filePath.indexOf('p0zwqtqw9.bkt.clouddn.com') !== -1) {
                                        hash = item.filePath.split('//p0zwqtqw9.bkt.clouddn.com/')[1];
                                    } else {
                                        hash = item.filePath.split(`//${this.qiniuUrl}/`)[1];
                                    }
                                    return {
                                        name: item.fileName,
                                        percentage: 100,
                                        response: {
                                            hash: hash,
                                            key: hash
                                        },
                                        showProgress: false,
                                        size: this.sizeConversion(item.fileSize),
                                        status: 'finished',
                                        uid: item.id
                                    };
                                });
                                vm.defaultFileList = fileList;
                                let fileTotalSize = 0;
                                vm.defaultFileList.forEach(item => {
                                    fileTotalSize += this.$refs.filesUpload.getSizeNumber(item.size);
                                });
                                if (fileTotalSize >= this.max_size * 1024) {
                                    this.$Message.warning(`${this.$t('mail.uploadFilesOversizeTip')}${this.max_size / 1024}M`);
                                }
                            }
                        } else {
                            this.$Message.error(response.data.msg);
                        }
                    }).catch(() => {
                        this.is_show = false;
                        this.$Message.error('请求异常');
                    });
                }
                this.getGeneralSettingValue();
            },
            /* 获取用户的已读回执/追踪邮件的设置信息 */
            getGeneralSettingValue() {
                util.ajaxMailJson({
                    url: '/mail/generalSetting/createUserId',
                    method: 'get',
                    params: {
                        createUserId: this.userId,
                        enterpriseId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === 1) {
                        this.marketingForm.mailIsTrace = Boolean(response.data.data.selectedMailTraceFlag);
                        this.marketingForm.receipt_flag = Boolean(response.data.data.selectedMailReceiptFlag);
                    } else {
                        this.$Message.error(this.$t('mailSetting.signatureSetting.defaultSignatureError'));
                    }
                }).catch(() => {
                    this.$Message.error(this.$t('mailSetting.signatureSetting.defaultSignatureError'));
                });
            },
            /* 初始化七牛，获取图片上传token */
            initQiniu() {
                util.oldAjax({
                    url: '/file-sys/api/uptoken',
                    method: 'post'
                }).then(response => {
                    this.action = `//upload.qiniup.com?token=${response.data.uptoken}`;
                });
            },
            /* 附件预览 */
            handlePreviewAtta(data) {
                const filePath = `${this.qiniuHttp}${data.isDataBaseFile ? data.uid : data.response.key}`;
                let type = data.name.slice(data.name.lastIndexOf('.'));
                type = type.toLowerCase();
                if (type === '.jpg' || type === '.jpeg' || type === '.png' || type === '.gif') {
                    window.open(`${filePath}?imageView2/0`);
                } else if (['.mp4', '.webm', '.pdf', '.txt'].includes(type)) {
                    window.open(filePath);
                } else if (type === '.xls' || type === '.xlsx' || type === '.doc' || type === '.docx' || type === '.ppt' || type === '.pptx') {
                    window.open(`http://view.officeapps.live.com/op/view.aspx?src=${filePath}`);
                } else {
                    this.$Message.info(this.$t('mail.previewErrorTip'));
                }
            },
            /** 上传的附件超过大小限制 */
            handleSizeOverflow() {
                this.$Message.error(this.$t('mailMarketing.newMarketing.attachmentMaxTip'));
            },
            /* 获取附件列表 */
            getUploadFilesList(fileList) {
                if (this.isFirstUpload && fileList.length) {
                    this.isFirstUpload = false;
                    this.showSubjectInput = false;
                    const subject = this.marketingForm.subject;
                    const index = fileList[0].name.lastIndexOf('.');
                    let fileName = '';
                    if (index !== -1) {
                        fileName = fileList[0].name.substring(index, 0);
                    } else {
                        fileName = fileList[0].name;
                    }
                    this.$nextTick(() => {
                        if (!subject.trim()) {
                            this.marketingForm.subject = subject.trim() + fileName;
                        }
                        this.showSubjectInput = true;
                    });
                }
            },
            /* 上传附件的两种操作 --- 普通上传 和 询盘云资料库上传 */
            handleNormalUpload() {
                this.$refs.filesUpload.handleClick('normal');
            },
            handleDataBaseUpload() {
                this.$refs.filesUpload.handleClick('dataBase');
            },
            /** 群发单显，主题/正文插入变量----在光标位置插入内容 */
            insertVariable(str) {
                const character = `{"${str}"}`;
                if (this.cursorType === 'person') {
                    this.$Message.warning({
                        message: '只能在正文/主题添加变量！',
                        duration: 3000
                    });
                } else if (this.cursorType === 'subject') {
                    /** 将鼠标选中部分替换为变量 */
                    if (this.inputSelectStartIndex > this.inputSelectEndIndex || this.inputSelectStartIndex === this.inputSelectEndIndex) {
                        this.marketingForm.subject = (this.marketingForm.subject.substring(0, this.inputSelectEndIndex) + character + this.marketingForm.subject.substring(this.inputSelectStartIndex)).slice(0, 200);
                    } else {
                        this.marketingForm.subject = (this.marketingForm.subject.substring(0, this.inputSelectStartIndex) + character + this.marketingForm.subject.substring(this.inputSelectEndIndex)).slice(0, 200);
                    }
                    if (this.marketingForm.subject.length === 200) {
                        this.$Message.warning({
                            message: this.$t('mailSetting.fastText.testOverLimitTip'),
                            duration: 3000
                        });
                    }
                    this.$refs.subjectInput.focus();
                    this.$refs.subjectInput.blur();
                } else {
                    /** 处理默认样式 */
                    tinymce.execCommand('mceInsertContent', false, `<span>${character}</span>`);
                }
                this.cursorType = 'editor';
                this.marketingForm.variables = [{ companyName: '1', contactsName: '1', email: '1' }];
            },
            // 打开监测链接的弹窗
            testInsertLink() {
                this.cursorType = 'editor';
                this.visible_insertLink = true;
            },
            // 插入监测链接
            handleInsertUrl({ linkUrl }) {
                // 如果没有链接直接插入
                tinymce.execCommand('mceInsertContent', false, `<a target="_blank" href="${linkUrl}">${linkUrl}</a>`);
            },
            /** 获取主题光标位置 */
            handleInputBlur(e) {
                this.inputSelectStartIndex = e.target.selectionStart;
                this.inputSelectEndIndex = e.target.selectionEnd;
            },
            /** 插入快速文本 */
            handleQuickText(quickText, index) {
                if (this.cursorType === 'person') {
                    this.$Message.warning({
                        message: this.$t('mailSetting.fastText.testTypeTip'),
                        duration: 3000
                    });
                } else if (this.cursorType === 'subject') {
                    let subjectTest = document.getElementsByClassName('overTwoLine')[index].innerText;
                    subjectTest = subjectTest.replace(/\n/g, '');
                    /** 将鼠标选中部分替换为快速文本 */
                    if (this.inputSelectStartIndex > this.inputSelectEndIndex || this.inputSelectStartIndex === this.inputSelectEndIndex) {
                        this.marketingForm.subject = (this.marketingForm.subject.substring(0, this.inputSelectEndIndex) + subjectTest + this.marketingForm.subject.substring(this.inputSelectStartIndex)).slice(0, 200);
                    } else {
                        this.marketingForm.subject = (this.marketingForm.subject.substring(0, this.inputSelectStartIndex) + subjectTest + this.marketingForm.subject.substring(this.inputSelectEndIndex)).slice(0, 200);
                    }
                    if (this.marketingForm.subject.length === 200) {
                        this.$Message.warning({
                            message: this.$t('mailSetting.fastText.testOverLimitTip'),
                            duration: 3000
                        });
                    }
                    this.$refs.subjectInput.focus();
                    this.$refs.subjectInput.blur();
                } else {
                    /** 处理快速文本默认样式 */
                    tinymce.execCommand('mceInsertContent', false, `<br/><div style="color:#000;display:inline-block;font-size:12pt;font-family:arial,helvetica,sans-serif;">${quickText}</div>&nbsp;`);
                }
                this.cursorType = 'editor';
            },
            // 预览邮件时获取附件列表
            getFilesUpload(callback) {
                callback(this.$refs.filesUpload);
            },
            // 校验必填项（营销活动名称、发件人、收件人、主题、正文）不能为空
            requiredItemsVerification() {
                // 发送按钮的 tip 主题和发件人不能为空提示
                const arr = [];
                if (!this.availableSendCount) {
                    this.sendTip = this.$t('mailMarketing.newMarketing.remainingEmails0');
                    return;
                }
                if (!this.marketingForm.actName) arr.push(this.$t('mailMarketing.newMarketing.name'));
                if (!this.marketingForm.subject) arr.push(this.$t('mail.writeLetter.subject'));
                if (!this.marketingForm.from) arr.push(this.$t('mail.writeLetter.sender'));
                if (!this.marketingForm.recipients_from_data.length) arr.push(this.$t('mail.writeLetter.recipients'));
                // 收件人长度 > 0 ,需要判断剩余发件数是否大于当前所有收件人的长度
                // 所有地址簿当中的邮箱集合去重
                let recipients_count = 0;
                this.marketingForm.recipients_from_data.forEach((item) => {
                    recipients_count += item.contactCount;
                });
                if (this.availableSendCount < recipients_count) {
                    this.sendTip = this.$t('mailMarketing.newMarketing.remainingEmailsLimit');
                    return;
                }
                if (this.isInitFinishedMail) {
                    const data = this.$refs.footerOperate.mailDataFormat(0);
                    const activeEditor = this.currEditor;
                    const text = activeEditor.getContent({ format: 'text' });
                    if (!text.trim().length && !(/<img[^>]+>/.test(data.content))) {
                        arr.push(this.$t('mail.writeLetter.body'));
                    }
                } else {
                    arr.push(this.$t('mail.writeLetter.body'));
                }
                if (arr.length > 0) {
                    this.sendTip = arr.toString() + this.$t('mail.writeLetter.cannotBeEmpty');
                } else {
                    this.sendTip = '';
                }
            },
            //  拖拽上传 ---------------------------------
            dragleave(e) {
                e.preventDefault();
                e.stopPropagation();
                this.dragOver = false;
                this.uploadImages = false;
                this.uploadAttachment = false;
            },
            upload_drop(e) {
                e.preventDefault();
                e.preventDefault();
                e.stopPropagation();
                this.dragOver = false;
                this.uploadImages = false;
                this.uploadAttachment = false;
                this.$refs.filesUpload.uploadFiles(e.dataTransfer.files);
            },
            upload_dragover(e) {
                e.preventDefault();
                e.stopPropagation();
                this.uploadAttachment = true;
                this.uploadImages = false;
            },
            upload_images_dragover(e) {
                e.preventDefault();
                e.stopPropagation();
                this.uploadImages = true;
                this.uploadAttachment = false;
            },
            mousemove_upload(e) {
                this.dragOver = false;
                this.uploadImages = false;
                this.uploadAttachment = false;
            },
            // 拖拽处理
            enter_drag(e) {
                e.preventDefault();
                e.stopPropagation();
                this.dragOver = e.target.className === 'new-marketing' ||
                    e.target.className === 'receiver' ||
                    e.target.className === 'el-form' ||
                    e.target.className === 'marketing-form-item' ||
                    e.target.className === 'el-input__inner' ||
                    e.target.className === 'marketing-form-item recipient-form' ||
                    e.target.className === 'mail-upload-placeholder' ||
                    e.target.className === 'mail-upload-placeholder-container' ||
                    e.target.className === 'mail-upload-placeholder-span' ||
                    e.target.className === 'mail-upload-placeholder-text' ||
                    e.target.className === 'el-form-item__content' ||
                    e.target.className === 'header-title' ||
                    !(e.target.className);
                this.uploadImages = false;
                this.uploadAttachment = false;
            },
            enter_drag_iframe(e) {
                e.preventDefault();
                e.stopPropagation();
                this.dragOver = true;
                this.uploadImages = false;
                this.uploadAttachment = false;
            },
            // 上传图片至正文区域
            insertImage(res) {
                this.$refs.editorModule.insertImage(res);
            },
            /** 触发 收件人 textarea 的focus 事件，从而触发收件人 input 的非空校验  */
            textareaClick() {
                this.$nextTick(() => {
                    this.$refs.recipientInput.focus();
                }, 100);
            },
            textareaOver() {
                this.textareaOverStatus = true;
            },
            textareaOut() {
                this.textareaOverStatus = false;
            },
            /** 通过企业id获取剩余发件数 */
            getAvailableSendCountByOrgId() {
                util.ajaxEmailMarketing({
                    url: '/business/marketing/activity/getAvailableSendCountByOrgId',
                    method: 'post',
                    data: { orgId: this.enterpriseId }
                }).then(response => {
                    if (response.data.code === 1) {
                        this.availableSendCount = response.data.data;
                    } else {
                        this.$Message.error(response.data.msg);
                    }
                }).catch(() => {
                    this.$Message.error('请求异常');
                });
            },
            // 去重方法
            deDuplication(arr, val) {
                for (let i = 0; i < arr.length; i++) {
                    for (let j = i + 1; j < arr.length; j++) {
                        if (arr[i][val] == arr[j][val]) {
                            arr.splice(j, 1);
                            j--;
                        }
                    }
                }
            },
            /* 附件大小显示格式处理 */
            sizeConversion(size) {
                const result = Number(size);
                if (isNaN(result)) {
                    return size;
                } else {
                    const kiloByte = (result / 1024).toFixed(2);
                    if (kiloByte < 1) {
                        return `${result}Byte(s)`;
                    }
                    const megaByte = (kiloByte / 1024).toFixed(2);
                    if (megaByte < 1) {
                        return `${kiloByte}KB`;
                    }
                    const gigaByte = (megaByte / 1024).toFixed(2);
                    if (gigaByte < 1) {
                        return `${megaByte}MB`;
                    }
                    const teraByte = (gigaByte / 1024).toFixed(2);
                    if (teraByte < 1) {
                        return `${gigaByte}GB`;
                    }
                }
            },
            // 强刷新
            forceUpdateChange() {
                this.$forceUpdate();
            },

            // ai tool bar
            onIputSelect(e) {
                const result = getInputSelectedText()
                if (result.text) {

                    const insert = (newText, insertStart, insertEnd) => {
                        this.marketingForm.subject= newText
                        const subInput = document.getElementById("mailSubject")
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
                            const newText = coverText(this.marketingForm.subject, v, result)
                            insert(newText, result.start, result.start + v.length)
                        },
                        onInsert: (v) => {
                            const newText = insertText(this.marketingForm.subject, v, result)
                            insert(newText, result.end, result.end + v.length)
                        }
                    })
                } else {
                    this.$aiToolBar.destroy()
                }
            },
        },
        watch: {
            defaultFileList: {
                handler(val) {
                    if (val && val.length) {
                        this.isFirstUpload = false;
                    }
                },
                deep: true,
                immediate: true
            },
            marketingForm: {
                async handler() {
                    // 调用不能为空校验
                    this.requiredItemsVerification()
                },
                deep: true,
                immediate: true
            },
            recipients_to: {
                handler(val) {
                    if (val) {
                        // 地址簿去重
                        this.marketingForm.recipients_from_data.push(...val)
                        this.deDuplication(this.marketingForm.recipients_from_data, 'id');
                        this.marketingForm.addrBookIds = this.marketingForm.recipients_from_data.map((item)=>{
                            return item.id
                        });
                        this.marketingForm.addrBookIds = this.marketingForm.addrBookIds.join(',');
                        this.requiredItemsVerification();
                    }
                },
                deep: true,
                immediate: true
            },

            // ai tool bar 
            'marketingForm.subject': {
                handler(val) {
                    if (val.toLowerCase() === '/ai') {
                        this.$aiToolBar.init({
                            type: 'inputBoxSlash',
                            onConfirm: v => {
                                this.$aiToolBar.destroy()
                                this.marketingForm.subject = v

                                const subInput = document.getElementById("mailSubject")
                                subInput.focus()
                                this.$nextTick(() => {
                                    subInput.setSelectionRange(0, v.length)
                                })
                            },
                            onAbort: () => {
                                this.marketingForm.subject = ''
                            }
                        })
                    } else {
                        this.$aiToolBar.destroy()
                    }
                },
            },
        },
        beforeDestroy(){
            /**
             *  离开当前组件移除 绑定在body身上的 dragenter 和 drop 事件
             *  注：事件只有在新建营销活动页面才会生效
             * */
            let _this = this
            document.body.removeEventListener('dragenter', _this.enter_drag);
            document.body.removeEventListener('drop', _this.dragleave);

            /**
             *  关闭新建营销活动页面校验是否打开二次确认弹窗
             * */
            this.$refs.footerOperate.handleCancel();
            if (localStorage.getItem('routeParams')) {
                localStorage.removeItem('routeParams');
            }
        },
    }
</script>
<style lang="less">
    @import url('newMarketing.less');
</style>
<style>
    .ivu-upload {
        //display: inline-block;
        cursor: pointer;
        &.ivu-upload-drag{
             border-color: #4285f4;
         }
    }
</style>