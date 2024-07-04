<template>
    <div class="new_template" v-loading="is_show">
        <Row class="new_template_row">
            <Col :span="textModel || translateModel ?18:24" style="padding-right: 30px;" :style="textModel || translateModel ? 'border-right: 1px solid #EBEEF5;' : ''">
                <div class="new_template_form">
                    <!-- 新建&编辑企业邮件模板 -->
                    <div class="header_title" v-if="!mailTemplateId">{{$t('mailSetting.emailTemplate.newName')}}</div>
                    <div class="header_title" v-else>{{$t('mailSetting.emailTemplate.editName')}}</div>

                    <Form :model="templateForm"
                        ref="ruleForm"
                        label-position="right"
                        label-width="98px">
                        <!-- 模板名称 -->
                        <FormItem class="template_form_item" :label="$t('mailSetting.emailTemplate.templateName')" required>
                            <ElInputExtend v-model="templateForm.templateName"
                                style="width: 600px;"
                                :placeholder="$t('mailSetting.emailTemplate.actNameTip')"
                                :errorMessage="$t('mailSetting.sendReceiveRules.upperLimitTip')"
                                @blur="chenckDisabledSave"
                                @input="chenckDisabledSave"
                                maxlength="100"
                                show-word-limit>
                            </ElInputExtend>
                        </FormItem>

                        <!-- 模板分类 -->
                        <FormItem class="template_form_item" :label="$t('mailSetting.emailTemplate.classification')">
                            <Select v-model="templateForm.templateClassificationId"
                                    style="width: 600px;"
                                    filterable
                                    :placeholder="$t('crm.Modal.tip_select')">
                                <Option value="0" :label="$t('mailSetting.emailTemplate.uncategorized')"></Option>
                                <Option v-for="item in tableData"
                                        :key="item.id"
                                        :value="`${item.id}`"
                                        :label="item.classificationName"></Option>
                            </Select>
                            <span class="classification_set" @click="classificationSet">{{ $t('mailSetting.emailTemplate.classificationSet') }}</span>
                        </FormItem>

                        <!-- 主题 -->
                        <FormItem class="template_form_item" :label="$t('mailSetting.emailTemplate.subject')">
                            <ElInputExtend v-model="templateForm.templateTitle"
                                ref="subject"
                                style="width: 600px;"
                                @blur="handleInputBlur"
                                @focus="subjectFocus"
                                :placeholder="$t('mailSetting.emailTemplate.enterSubject')"
                                maxlength="500"
                                show-word-limit
                                id="emailTemplateSubject"
                                 @mouseup.native="onIputSelect">
                            </ElInputExtend>
                            <Dropdown trigger="click" @command="insertVariable">
                                <span class="classification_set">{{ $t('mail.separateInsertVariables') }}</span>
                                <DropdownMenu slot="dropdown" class="add-variable-dropdown-menu">
                                    <DropdownItem style="font-size: 12px;" v-for="item in variableList" :command="item.value" :key="item.value">{{item.label}}</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </FormItem>

                        <!--z-->
                        <FormItem class="selfUpload-formItem" :label="$t('mailSetting.emailTemplate.content')" required>
                            <div @click.stop style="display:inline-block;">
                                <selfUpload
                                        ref="filesUpload"
                                        multiple
                                        type="drag"
                                        class="mail-upload"
                                        :action="action"
                                        :max-size="max_size"
                                        :ul_width="700"
                                        :on-exceeded-size="handleSizeOverflow"
                                        :onPreview="handlePreviewAtta"
                                        :defaultFileList="defaultFileList"
                                        :style="isContainsMenu('database') ? 'width:190px;' : 'width:110px;'"
                                        @handleDataBaseFile="handleDataBaseFile">
                                    <div style="height: 30px; line-height: 30px;text-align: left;">
                                        <!-- 原来的 '上传附件' 和 '添加资料库文件' 合并为一个 dropdown -->
                                        <Dropdown trigger="hover" placement="bottom" style="width: 90px;white-space: nowrap;">
                                            <Tooltip placement="top">
                                                <div slot="content" style="text-align:center;">{{$t('mail.writeLetter.uploadFilesEmailAttachments')}}<br/>{{$t('mail.writeLetter.within25M')}}</div>
                                                <span style="font-size: 14px;color: #3B78DE;">
                                                    <Icon style="margin-right:4px;" custom="custom-icon_appendix" size="16"></Icon>
                                                    <span style="overflow: hidden;" :title="$t('mail.writeLetter.uploadFiles')">{{$t('mail.writeLetter.uploadFiles')}}</span>
                                                    <Icon type="ios-arrow-down"></Icon>
                                                </span>
                                            </Tooltip>
                                            <DropdownMenu style="text-align:center;max-height:300px;width: 120px;white-space: nowrap;" slot="dropdown">
                                                <DropdownItem @click.native="handleNormalUpload">
                                                    <span class="write-mail-upload">{{$t('mail.writeLetter.localFiles')}}</span>
                                                </DropdownItem>
                                                <DropdownItem @click.native="handleDataBaseUpload">
                                                    <span v-show="isContainsMenu('database')" class="write-mail-upload piwik_writeMail_fileUpload_dataBase">{{$t('mail.writeLetter.databaseFile')}}</span>
                                                </DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                        <Tooltip placement="top" v-show="isContainsMenu('database')">
                                            <div slot="content" style="text-align:center;">{{$t('mail.writeLetter.insertSmartMaterial')}}<br/>{{$t('mail.writeLetter.recommendedForVeryLargeFiles')}}</div>
                                            <span class="write-mail-upload" @click="handleFileSelected" style="position: absolute;top:0;right:0;font-size: 14px;">
                                                <Icon custom="custom-icon_material" size="16" style="color: #3B78DE;margin-right: 4px;"/>{{$t('mail.writeLetter.insertSmartMaterial')}}
                                            </span>
                                        </Tooltip>
                                    </div>
                                </selfUpload>
                            </div>
                            <!-- 快速文本、模板、监测链接、翻译的入口 -->
                            <div style="position: absolute;top:8px;" :style="isContainsMenu('database') ? 'left:190px;' : 'left:90px;'">
                                <span @click.stop="showFastText" style="color:#3B78DE;cursor: pointer;margin-left: 20px;">
                                    <Icon custom="custom-kuaisuwenben" size="16" style="color: #3B78DE;margin-right: 4px;"/>{{$t('mail.writeLetter.fastText')}}
                                </span>
                                <span @click.stop="() => addTemplateVisible = true" style="color:#3B78DE;cursor: pointer;margin-left: 20px;">
                                    <Icon custom="custom-youjianmoban" size="14" style="color: #3B78DE;margin-right: 4px;"/>{{ $t('mailSetting.emailTemplate.template') }}
                                </span>
                                <span style="color:#3B78DE;margin-left:20px;cursor: pointer;" @click.stop="testInsertLink">
                                    <Icon custom="custom-lianjie1" size="16" style="color: #3B78DE;margin-right: 4px;"/>{{$t('monitorLink.title')}}
                                </span>
                                <span style="color:#3B78DE;margin-left:20px;cursor: pointer;" @click="showTranslateBox">
                                    <Icon custom="custom-fanyi1" size="16" style="color:#3B78DE;margin-right: 4px;"/>{{$t('mail.writeTranslate.translate')}}
                                </span>
                            </div>
                        </FormItem>

                        <!-- 编辑器区域 -->
                        <div class="content-edit">
                            <div id="mailTemplateEditer"></div>
                        </div>
                    </Form>
                </div>

                <!-- 底部操作区域 -->
                <div class="footer-operate">
                    <Tooltip placement="top" :disabled="!disabledSave" :content="disabledTip">
                        <span style="margin-right: 10px;">
                            <Button type="primary" :disabled="disabledSave" :loading="saveLoading" @click="handleSave">{{$t('mailSetting.emailTemplate.saveBtn')}}</Button>
                        </span>
                    </Tooltip>
                    <Button @click="leaveVisible = true">{{ $t('mailSetting.emailTemplate.modal_cancel') }}</Button>
                </div>
            </Col>

            <Col :span="6" v-show="textModel" class="quick_text">
                <div style="overflow-y: auto;" :style="`height:${window_height - 130}px;`">
                    <ul class="linkman-list fast-text-title">
                        <li style="cursor:auto;">
                            <div>{{$t('mail.writeLetter.fastText')}}</div>
                            <div>
                                <i @click.stop="toFastTextSet">
                                    <Tooltip placement="top" transfer :content="$t('mailSetting.fastText.setting')">
                                        <Icon size="14" custom="custom custom-custom-script-set" style="cursor:pointer;" />
                                    </Tooltip>
                                </i>
                                <i><Icon size="14" @click.stop="closeFastText" custom="custom custom-modal-close" style="cursor:pointer;" /></i>
                            </div>
                        </li>
                        <li>
                            <Input class="verbal-search"
                                icon="ios-search-strong"
                                search
                                clearable
                                v-model="fastTextSearch"
                                @keyup.enter.native="searchFastTextList"
                                @input="searchFastTextList"
                                :placeholder="$t('mail.fastTextSearchHolder')" >
                            <i slot="suffix" class="el-input__icon el-icon-search" @click.stop="searchFastTextList"></i>
                            </Input>
                        </li>
                    </ul>
                    <div class="fast-text-list">
                        <!-- <p>暂无数据</p> -->
                        <p v-if="!fastTextShowLag" class="noDataTip">{{$t('crm.Table.noData')}} </p>
                        <ul v-if="fastTextShowLag">
                            <li @click.stop="handleQuickText(fastTextItem.quickContent,fastTextIndex)" v-for="(fastTextItem , fastTextIndex) in quickTexts" :key="fastTextIndex" class="mail-insertfasttext">
                                <h4>{{fastTextItem.quickName}}</h4>
                                <Tooltip placement="left" max-width="150">
                                    <p class="paragraph overTwoLine" v-html="fastTextItem.quickContent" >
                                    </p>
                                    <div slot="content">
                                        <p class="paragraph quickTextDom" v-html="fastTextItem.quickContent">
                                        </p>
                                    </div>
                                </Tooltip>
                            </li>
                        </ul>
                        <p v-if="fastTextShowLag" class="load-more">
                            <a class="hrefa" @click.stop="quickTextLoadMore" v-if="quickTexts.length < textTotalNumber ">{{$t('chat.loadMore')}}</a>
                            <a v-else class="nohrefa">{{ $t('chat.noMore') }}</a>
                        </p>
                    </div>
                </div>
            </Col>

            <!-- 翻译 start -->
            <Col :span="6" v-show="translateModel" class="translateBox" :style="`height:${window_height - 130}px;`">
                <div style="margin-bottom:9px;" class="trans-div">
                    <div style="font-size: 14px;color: rgba(0,0,0,0.80);font-weight: 600;">{{this.$t('mail.writeTranslate.translate')}}</div>
                    <Icon size="14" @click.stop="closeTranslate" custom="custom custom-modal-close" style="cursor:pointer;" />
                </div>
                <Row style="margin-bottom:16px;white-space:nowrap;">
                    <!--  @command="reply" 表示触发的事件 -->
                    <div style="width:43px;white-space:no-wrap;margin-right:10px;display:inline-block;">{{this.$t('mail.writeTranslate.translateTo')}}</div>
                    <Dropdown trigger="click" @command="selectTargetLanguage" style="width: calc(100% - 153px);margin-right:10px;">
                        <span class="translate-select" style="width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 8px">
                            <span>{{targetTranslate}}</span>
                            <Icon custom="custom-menu-arrow" color="#7B98B6" size="12"></Icon>
                        </span>
                        <DropdownMenu style="width:125px;max-height: 300px;overflow-y: auto;margin-top: 10px;" slot="dropdown">
                            <DropdownItem :disabled="item.label===targetTranslate" :style="item.label===targetTranslate?'color:#4285F4':''" v-for="(item,index) in languageList" :key="index" :command="item">{{item.label}}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <!-- 翻译按钮 -->
                    <Button class="piwik_write_letter_translation_button" :loading="translateLoading" @click="handleTranslate" :disabled="translateDisabled" type="info" style="width:90px;height:34px;font-size:12px;color:white;padding:0;margin:0 auto;">
                        {{$t('mail.translateContent')}}
                    </Button>
                </Row>
                <div style="margin-bottom:6px;" class="trans-div">
                    <span>{{this.$t('mail.writeTranslate.original')}}</span>
                    <Tooltip placement="top" transfer :content="this.$t('mail.writeTranslate.clearOriginalText')">
                        <span style="cursor:pointer;color: #3B78DE;" @click="clearRequestText">{{this.$t('mail.writeTranslate.clearOriginalText')}}</span>
                    </Tooltip>
                </div>
                <div class="trans-div">
                    <Input id="requestInput" v-model="requestText" type="textarea" show-word-limit maxlength="5000" rows="14" placeholder="请输入原文"></Input>
                </div>
                <div class="trans-div" style="min-height:16px;color:red;line-height:16px;margin-top:4px;">{{requestTextTooLong}}</div>
                <div class="trans-div" style="margin-bottom:5px;">
                    <span>{{this.$t('mail.writeTranslate.translation')}}</span>
                    <Tooltip placement="top" transfer>
                        <div style="text-align:center;" slot="content">{{this.$t('mail.writeTranslate.insertAtSubjectBody')}}<br/>{{this.$t('mail.writeTranslate.insertTranslation')}}</div>
                        <span style="cursor:pointer;color: #3B78DE;" @click="insertText">{{this.$t('mail.writeTranslate.insertTranslation')}}</span>
                    </Tooltip>
                </div>
                <div class="trans-div">
                    <Input ref="targetText" v-model="targetText" type="textarea" rows="14"></Input>
                </div>
            </Col>
            <!-- 翻译 end -->

        </Row>

        <Upload
                ref="imageUpload"
                :on-success="insertImage"
                :action="action"
                accept=".png,.jpeg,.jpg,.gif,.bmp,.ico"
                style="display:none">
        </Upload>

        <!-- 监测链接的弹窗组件 -->
        <monitorLink :visible.sync="visible_insertLink"
                     @insertUrl="handleInsertUrl"></monitorLink>


        <!-- 新建、编辑模板分类 start -->
        <classificationModal :visible.sync="classificationSetVisible" type="1" :tableData="tableData" @refreshData="refreshData"></classificationModal>
        <!-- 新建、编辑模板分类  end -->
        <!-- 插入模板弹窗 -->
        <mailTemplateModal :visible.sync="addTemplateVisible" @handleTemplate="handleTemplate"></mailTemplateModal>

        <!-- 离开确认 -->
        <Modal
            :visible.sync="leaveVisible"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            width="487px"
            @close="delTemplateClose"
            class="copy_template_modal"
            :title="$t('mail.leaveConfirm')">
            <p>{{ $t('mailSetting.emailTemplate.leaveTip') }}</p>
            <div slot="footer" class="footer">
                <Button @click="() => leaveVisible = false">{{ $t('close') }}</Button>
                <Button type="primary" @click="callbackList">{{ $t('mailSetting.emailTemplate.confirm') }}</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import Cookies from 'js-cookie';
    import { mapState, mapGetters } from 'vuex';
    import writeMailTranslate from '@/mixins/writeMailTranslate'; // 引入翻译功能相关共通代码
    import selfUpload from '@/views/mail/mail-home/components/write-mail/self-upload';
    import monitorLink from '@/views/main-components/contact-association/monitorLink';
    import classificationModal from './components/classificationModal.vue';
    import mailTemplateModal from '@/views/main-components/mail-template-modal.vue';
    import { findAll, getById, addTemplate, updateTemplate } from '@/api/mail/mailSet.js';
    import * as qiniu from 'qiniu-js';
    import smartmaterialIcons from '@/configs/smartmaterialIcons.js'; // 引入智能物料icon图标(base64)
    import tinymce from 'tinymce/tinymce';
    import 'tinymce/themes/silver';
    /** 解决tinymce Firefox浏览器兼容问题 */
    // import 'tinymce/plugins/paste';
    import 'tinymce/plugins/image';
    import 'tinymce/plugins/link';
    import 'tinymce/plugins/autolink';
    import 'tinymce/plugins/lists';
    import 'tinymce/plugins/hr';
    import 'tinymce/plugins/nonbreaking';
    import 'tinymce/plugins/charmap';
    import 'tinymce/plugins/print';
    import 'tinymce/plugins/anchor';
    import 'tinymce/plugins/imagetools';
    import 'tinymce/plugins/media';
    import 'tinymce/plugins/save';
    import 'tinymce/plugins/directionality';
    import 'tinymce/plugins/textcolor';
    import 'tinymce/plugins/colorpicker';
    import 'tinymce/plugins/textpattern';
    import 'tinymce/plugins/fullscreen';
    import 'tinymce/plugins/table';
    import 'tinymce/plugins/code';
    import 'tinymce/plugins/emoticons';
    import 'tinymce/icons/default';

    // ai tool bar
    import { getInputSelectedText, coverText, insertText } from '@/views/ai-toolbar/utils/tools'

    export default {
        name: 'template-list',
        mixins: [writeMailTranslate],
        components: { selfUpload, monitorLink, classificationModal, mailTemplateModal },
        props: ['templateClassificationId', 'mailTemplateId'],
        computed: {
            ...mapState({
                window_height: 'window_height',
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                qiniuHttp: 'qiniuHttp',
                qiniuUrl: 'qiniuUrl',
                fullName: 'fullName'
            }),
            ...mapGetters([
                'isContainsMenu'
            ])
        },
        data() {
            return {
                timer: null,
                loading: false,
                saveLoading: false,
                is_show: true,
                classificationSetVisible: false,
                templateForm: {
                    templateName: '',
                    templateTitle: '',
                    templateClassificationId: ''
                },
                max_size: 25600,
                allList: [
                    {
                        name: '全部',
                        labe: '全部'
                    }
                ],
                action: '', // 上传图片url
                cursorType: 'editor', // 光标所处位置：subject/主题，editor/正文，person/收件人/发件人/密送人
                defaultMailSetting: {
                    fontFamilyValue: 'arial', // 默认写信字体
                    fontSizeValue: '16px', // 默认写信字号
                    fontColorValue: '#000' // 默认写信颜色
                },
                /* ---- 翻译相关 start---------------------------------- */
                translateModel: false, // 右侧翻译框
                /* ---- 翻译相关 end---------------------------------- */
                /* ----- 快速文本 start---------------------------- ---- */
                textModel: false, // 右侧显示框
                quickTexts: [], // 快速文本列表
                quickText: '', // 快速文本
                fastTextShowLag: false, // 快速文本
                textCurrentPage: 0, // 快速文本列表当前页码
                fastTextPageSize: 10, // 快速文本列表每页显示数量
                textTotalNumber: 0, // 快速文本数量总和
                /* ----- 快速文本 end------------------------------------- */
                // 监测链接
                visible_insertLink: false, // 监测链接状态
                tableData: [],
                pageSize: 50, // 当前页显示条数
                currentPageNum: 0, // 当前页码
                total: 1000, // 总条数
                leaveVisible: false, // 离开确认框
                defaultFileList: [],
                disabledSave: true,
                disabledTip: '',
                inputSelectStartIndex: 0, // 输入框光标起始位置
                inputSelectEndIndex: 0, // 输入框光标停留位置
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
                ]
            };
        },
        created() {
            this.refreshData('first');
            if (!this.mailTemplateId) {
                this.disabledTip = `${this.$t('mailSetting.emailTemplate.templateName')}，${this.$t('mailSetting.emailTemplate.content')}${this.$t('mailSetting.emailTemplate.emptyTip')}`;
            }
        },
        mounted() {
            tinymce.execCommand('mceRemoveEditor', true, 'mailTemplateEditer');
            this.initQiniu();
            this.initEditor();
        },
        methods: {
            // 保存按钮点击状态
            chenckDisabledSave() {
                this.disabledTip = '';
                const contentHtml = tinymce.activeEditor ? tinymce.activeEditor.getContent() : '';
                if (!this.templateForm.templateName.trim() && !contentHtml) {
                    this.disabledTip = `${this.$t('mailSetting.emailTemplate.templateName')}，${this.$t('mailSetting.emailTemplate.content')}${this.$t('mailSetting.emailTemplate.emptyTip')}`;
                }
                if (!this.templateForm.templateName.trim() && contentHtml) {
                    this.disabledTip = `${this.$t('mailSetting.emailTemplate.templateName')}${this.$t('mailSetting.emailTemplate.emptyTip')}`;
                }
                if (this.templateForm.templateName.trim() && !contentHtml) {
                    this.disabledTip = `${this.$t('mailSetting.emailTemplate.content')}${this.$t('mailSetting.emailTemplate.emptyTip')}`;
                }
                this.disabledSave = !this.templateForm.templateName.trim() || !contentHtml;
            },
            // 编辑时获取模板信息
            getTemplateData() {
                getById({
                    id: this.mailTemplateId
                }).then(res => {
                    if (res.code === 1) {
                        const data = res.data;
                        this.templateForm.templateName = data.templateName;
                        this.templateForm.templateClassificationId = `${data.templateClassificationId}`;
                        this.templateForm.templateTitle = data.templateTitle;
                        if (data.contentHtml && data.contentHtml.startsWith(this.tinymce_contentStyle)) {
                            data.contentHtml.replace(this.tinymce_contentStyle, '');
                        }
                        data.contentHtml = data.contentHtml.replace(/<style(([\s\S])*?)<\/style>/g, '');
                        tinymce.activeEditor.resetContent(data.contentHtml);
                        if (data.attachmentList) {
                            this.$refs.filesUpload.fileList = data.attachmentList.map(item => {
                                const hash = item.filePath.split(`//${this.qiniuUrl}/`)[1];
                                return {
                                    name: item.fileName,
                                    url: item.filePath,
                                    size: item.fileSize,
                                    isDataBaseFile: false,
                                    status: 'finished',
                                    response: {
                                        hash: hash,
                                        key: hash
                                    }
                                };
                            });
                        }
                        this.disabledSave = false;
                    }
                });
            },
            handleSave() {
                // if (!this.templateForm.templateName) {
                //     this.$Message.error(this.$t('mailSetting.emailTemplate.templateNameTip'));
                //     return;
                // }
                // const contentHtml = tinymce.activeEditor ? tinymce.activeEditor.getContent() : '';
                // if (!contentHtml) {
                //     this.$Message.error(this.$t('mailSetting.signatureSetting.contentTip'));
                //     return;
                // }
                if (this.$refs.filesUpload.fileList.some(item => { return item.status !== 'finished'; })) {
                    this.$Message.warning(this.$t('mail.uploadFilesUnfinishTip'));
                    return;
                } else if (this.$refs.filesUpload.fileSize >= this.max_size * 1024) {
                    this.$Message.warning(`${this.$t('mail.uploadFilesOversizeTip')}${this.max_size / 1024}M`);
                    return;
                }
                const contentHtml = tinymce.activeEditor.getContent();
                this.saveLoading = true;
                if (this.mailTemplateId) {
                    updateTemplate({
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        userName: this.fullName,
                        type: 1,
                        id: this.mailTemplateId,
                        templateName: this.templateForm.templateName,
                        templateClassificationId: this.templateForm.templateClassificationId ? this.templateForm.templateClassificationId : 0,
                        templateTitle: this.templateForm.templateTitle,
                        contentHtml,
                        attachmentList: this.$refs.filesUpload.fileList.map((file, index) => {
                            return {
                                fileName: file.name,
                                fileOrder: index,
                                filePath: `${this.qiniuHttp}${file.isDataBaseFile ? file.uid : file.response ? file.response.key : ''}`,
                                fileSize: this.sizeConversion(file.size),
                                fileType: file.name.lastIndexOf('.') !== -1 ? file.name.slice(file.name.lastIndexOf('.')) : ''
                            };
                        })
                    }).then(res => {
                        if (res.code === 1) {
                            this.$Message.success(this.$t('mailSetting.emailTemplate.saveSuccess'));
                            this.callbackList();
                        } else {
                            if (res.message === '模板名称不能重复') {
                                this.$Message.error(this.$t('mailSetting.emailTemplate.templateNameRepeat'));
                            } else {
                                this.$Message.error(this.$t('mailSetting.emailTemplate.saveFail'));
                            }
                        }
                        this.saveLoading = false;
                    }).catch(() => {
                        this.saveLoading = false;
                        this.$Message.error(this.$t('mailSetting.emailTemplate.saveFail'));
                    });
                } else {
                    addTemplate({
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        userName: this.fullName,
                        type: 1,
                        templateName: this.templateForm.templateName,
                        templateClassificationId: this.templateForm.templateClassificationId ? this.templateForm.templateClassificationId : 0,
                        templateTitle: this.templateForm.templateTitle,
                        contentHtml,
                        attachmentList: this.$refs.filesUpload.fileList.map((file, index) => {
                            return {
                                fileName: file.name,
                                fileOrder: index,
                                filePath: `${this.qiniuHttp}${file.isDataBaseFile ? file.uid : file.response ? file.response.key : ''}`,
                                fileSize: this.sizeConversion(file.size),
                                fileType: file.name.lastIndexOf('.') !== -1 ? file.name.slice(file.name.lastIndexOf('.')) : ''
                            };
                        })
                    }).then(res => {
                        if (res.code === 1) {
                            this.$Message.success(this.$t('mailSetting.emailTemplate.saveSuccess'));
                            this.callbackList();
                        } else {
                            if (res.message === '模板名称不能重复') {
                                this.$Message.error(this.$t('mailSetting.emailTemplate.templateNameRepeat'));
                            } else {
                                this.$Message.error(this.$t('mailSetting.emailTemplate.saveFail'));
                            }
                        }
                        this.saveLoading = false;
                    }).catch(() => {
                        this.saveLoading = false;
                        this.$Message.error(this.$t('mailSetting.emailTemplate.saveFail'));
                    });
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
            initEditor() {
                /* 初始化富文本编辑器 */
                const vm = this;
                tinymce.init({
                    selector: '#mailTemplateEditer',
                    language_url: `${process.env.BASE_URL}tinymce/langs/zh_CN.js`,
                    skin_url: `${process.env.BASE_URL}tinymce/skins/ui/oxide`,
                    skin: 'oxide',
                    browser_spellcheck: true, // 拼写检查
                    branding: false,
                    elementpath: false,
                    paste_data_images: true, // 允许粘贴图像
                    paste_enable_default_filters: false, // paste插件 禁用TinyMCE的默认粘贴过滤器。
                    paste_webkit_styles: 'all', // 指定在WebKit中粘贴时要保留的样式
                    height: vm.window_height - 395,
                    language: vm.$t('mail.editor_lauguage'),
                    menubar: false,
                    contextmenu: false, // 禁用编辑器上下文菜单
                    plugins: 'undo redo fullscreen autolink lists link image charmap print hr anchor imagetools media nonbreaking directionality textpattern table hr code emoticons',
                    // 上传图片功能
                    table_default_styles: {
                        'border-collapse': 'collapse',
                        width: '100%'
                    },
                    table_advtab: false,
                    table_cell_advtab: false,
                    toolbar: [
                        'undo redo formatpainter | fontselect fontsizeselect | forecolor backcolor bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent lineheight | insertImageBtn link table emoticons hr | fullscreen code removeformat'
                    ],
                    powerpaste_word_import: 'merge',
                    powerpaste_html_import: 'merge',
                    powerpaste_allow_local_images: true,
                    // 添加扩展插件
                    external_plugins: {
                        powerpaste: `${process.env.BASE_URL}tinymce/powerpaste/plugin.min.js`,
                        formatpainter: `${process.env.BASE_URL}tinymce/formatpainter/plugin.min.js`
                    },
                    toolbar_mode: 'floating',
                    emoticons_database_url: 'emojis.js',
                    font_formats:
                        '黑体="黑体";宋体="宋体";微软雅黑="微软雅黑";楷体="楷体";Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Calibri=calibri;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats',
                    fontsize_formats: '12px 14px 16px 18px 24px 36px 48px', // 字号选项
                    autosave_interval: '20s',
                    // image_advtab: true,
                    forced_root_block: 'div', /* 参数 将非块元素或文本节点都包含在设置的元素中 回车会产生空行 */
                    content_style: `
                          div { line-height:1.5; margin: 0;word-break: break-word!important;} body { margin: 2rem; } pre{ white-space: pre-wrap; } p{ margin: 0;}
                      `,
                    visual: false,
                    images_upload_handler: function(blobInfo, success) {
                        const config = {
                            useCdnDomain: true,
                            region: qiniu.region.z0
                        };
                        const observer = {
                            error(err) {
                                console.log(err);
                            },
                            complete(res) {
                                success(vm.qiniuHttp + res.key);
                            }
                        };
                        const putExtra = {
                            fname: '',
                            params: {}
                        };
                        const uid = Date.now() + blobInfo.name() + vm.userId;
                        vm.$util.oldAjax({
                            url: '/file-sys/api/uptoken',
                            method: 'post'
                        }).then((response) => {
                            vm.uptoken = response.data.uptoken;
                            vm.action = `//upload.qiniup.com?token=${response.data.uptoken}`;
                            const observable = qiniu.upload(
                                blobInfo.blob(),
                                uid,
                                vm.uptoken,
                                putExtra,
                                config
                            );
                            const subscription = observable.subscribe(observer);
                            console.log(subscription);
                        }).catch((err) => {
                            console.log(err);
                        });
                    },
                    setup: function(editor) {
                        editor.on('init', function(e) {
                            this.getBody().style.fontSize = vm.defaultMailSetting.fontSizeValue;
                            this.getBody().style.color = vm.defaultMailSetting.fontColorValue;
                            this.getBody().style.fontFamily = vm.defaultMailSetting.fontFamilyValue;
                            vm.is_show = false;
                            if (vm.mailTemplateId) {
                                vm.getTemplateData();
                            }
                        });
                        editor.on('focus', function(e) {
                            vm.cursorType = 'editor';
                            vm.insertTxt = 'tinymce';
                            // 增加防抖
                            if (vm.timer) {
                                clearTimeout(vm.timer);
                                vm.timer = null;
                            }
                            vm.timer = setTimeout(() => {
                                vm.chenckDisabledSave();
                            }, 200);
                        });
                        // ai tool bar
                        editor.on('mouseup', function (e) {
                            setTimeout(() => {
                                const selection = editor.selection;
                                const text = selection.getContent({ 'format': 'text' }).trim();
                                const preText = selection.getContent({ 'format': 'html' });
                                const editorIframe = document.getElementById('mailTemplateEditer_ifr');
                                const frameRect = editorIframe.getBoundingClientRect()
                                const { left, top  } = frameRect
                                if (text) {
                                    vm.$aiToolBar.init({
                                        type: 'inputBoxSelect',
                                        value: text,
                                        mouseX: left + e.clientX,
                                        mouseY: top + e.clientY,
                                        onCover: (v) => {
                                            vm.$aiToolBar.destroy();
                                            const id = `cover-${Math.ceil(Math.random() * 1000)}`
                                            editor.selection.setContent(`<span id="${id}">${v.replace(/\n/g,'<br>')}</span>`, {format: 'html'});
                                            // auto select
                                            const selection = tinymce.activeEditor.selection;
                                            selection.select(tinymce.activeEditor.dom.select(`span[id="${id}"]`)[0], true);
                                        },
                                        onInsert: (v) => {
                                            vm.$aiToolBar.destroy();
                                            const id = `insert-${Math.ceil(Math.random() * 1000)}`
                                            editor.selection.setContent(`${preText}<div id="${id}">${v.replace(/\n/g,'<br>')}</div>`);
                                            const selection = tinymce.activeEditor.selection;
                                            selection.select(tinymce.activeEditor.dom.select(`div[id="${id}"]`)[0], true);
                                        }
                                    })
                                } else {
                                    vm.$aiToolBar.destroy();
                                }
                            }, 0);
                        });
                        editor.on('input', function(e) {
                            // ai tool bar
                            const content = tinymce.activeEditor.getContent({ format: 'text' }).trim();
                            const text = content.split('\n')[0]
                            if (text.trim().toLowerCase() === '/ai') {
                                vm.$aiToolBar.init({
                                    type: 'inputBoxSlash',
                                    onConfirm: (v) => {
                                        const preContent = tinymce.activeEditor.getContent({ format: 'html' });
                                        vm.$aiToolBar.destroy();
                                        tinymce.activeEditor.setContent(`<div id="new-added">${v.replace(/\n/g,'<br>')}</div>${preContent.replace(text, '')}`, {format: 'html'});
                                        // auto select
                                        const selection = tinymce.activeEditor.selection;
                                        selection.select(tinymce.activeEditor.dom.select('div[id="new-added"]')[0], true);
                                    },
                                    onAbort: () => {
                                        const preContent = tinymce.activeEditor.getContent({ format: 'html' });
                                        tinymce.activeEditor.setContent(preContent.replace(text, ''), {format: 'html'});
                                    }
                                })
                            } else {
                                vm.$aiToolBar.destroy();
                            }

                            // 增加防抖
                            if (vm.timer) {
                                clearTimeout(vm.timer);
                                vm.timer = null;
                            }
                            vm.timer = setTimeout(() => {
                                vm.chenckDisabledSave();
                            }, 200);
                        });
                        editor.on('keyup', function(e) {
                            // 增加防抖
                            if (vm.timer) {
                                clearTimeout(vm.timer);
                                vm.timer = null;
                            }
                            vm.timer = setTimeout(() => {
                                vm.chenckDisabledSave();
                            }, 200);
                        });
                        editor.on('change', function(e) {
                            // 增加防抖
                            if (vm.timer) {
                                clearTimeout(vm.timer);
                                vm.timer = null;
                            }
                            vm.timer = setTimeout(() => {
                                vm.chenckDisabledSave();
                            }, 200);
                        });
                        //  高级粘贴功能的回调
                        editor.on('PastePostProcess', function(data) {
                            // data.node.querySelector('img') && data.node.querySelector('img').getAttribute('src');
                            if (data.node.querySelector('img') && !data.node.querySelector('img').getAttribute('src')) {
                                // 不支持图文上传
                                tinymce.activeEditor.notificationManager.open({
                                    text: '不支持复制粘贴含图片的文本内容，请对图片单独操作。',
                                    type: 'error',
                                    timeout: 5000,
                                    closeButton: true
                                });
                            }
                        });
                        editor.on('paste', function(event) {
                            const items = (event.clipboardData || window.clipboardData).items;
                            if (items && items.length) {
                                const files = (event.clipboardData || window.clipboardData).files;
                                // 先按附件上传
                                if (files.length) {
                                    const filesUnImage = [];
                                    for (const item in files) {
                                        if (files[item].type && files[item].type.indexOf('image') === -1) {
                                            filesUnImage.push(files[item]);
                                        }
                                    }
                                    if (filesUnImage.length) {
                                        vm.$refs.filesUpload.uploadFiles(filesUnImage);
                                    }
                                }
                                // 搜索剪切板items
                                if (items[items.length - 1].type === 'application/whatsapp') {
                                /**
                                 * @Description: 客户报错: whatsapp 消息粘贴不了
                                 * @author 汤一飞
                                 * @date 2021/5/31
                                 */
                                } else if (items[items.length - 1].type === 'text/plain') {
                                /**
                                 * @Description: 客户报错: 粘贴 Google 翻译内容时, 没有保留换行和空格
                                 * 之前改为在 editor.insertContent 时, 粘贴处理后的字符串(替换换行和空格为 HTML 换行符和空格转义字符)
                                 * 后来发现富文本编辑器官网粘贴文本就能保留换行和空格, 所以直接注释下面的纯文本处理逻辑, 按富文本编辑器默认行为走
                                 * @author 汤一飞
                                 * @date 2021/5/20
                                 */
                                }
                            }
                        });
                        editor.ui.registry.addButton('insertImageBtn', {
                            tooltip: 'Insert Image',
                            icon: 'image',
                            onAction: function(_) {
                                const upload = vm.$refs.imageUpload;
                                vm.$nextTick(() => {
                                    upload.$refs['upload-inner'].handleClick();
                                });
                            }
                        });
                    }
                });
            },
            // 取消返回 模板列表
            callbackList() {
                this.$emit('handleBack');
            },
            /* 初始化七牛，获取图片上传token */
            initQiniu() {
                this.$util.oldAjax({
                    url: '/file-sys/api/uptoken',
                    method: 'post'
                }).then(response => {
                    this.action = `//upload.qiniup.com?token=${response.data.uptoken}`;
                });
            },
            /* 插入图片至编辑器 */
            insertImage(res) {
                const src = this.qiniuHttp + res.key;
                tinymce.execCommand('mceInsertContent', false, `<img src=${src}>`);
            },
            /** 上传的附件超过大小限制 */
            handleSizeOverflow() {
                this.$Message.error(this.$t('mailMarketing.newMarketing.attachmentMaxTip'));
            },
            /* 上传附件的两种操作 --- 普通上传 和 询盘云资料库上传 */
            handleNormalUpload() {
                this.$refs.filesUpload.handleClick('normal');
            },
            handleDataBaseUpload() {
                this.$refs.filesUpload.handleClick('dataBase');
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
            /* ------- 翻译相关 start ----------------------------------------- */
            // 显示翻译框
            showTranslateBox() {
                // 如果当前显示了翻译功能,则进行提示
                if (this.translateModel) {
                    this.$Message.warning({
                        message: this.$t('mail.writeTranslate.translationTurnedOn'),
                        duration: 1500
                    });
                    return;
                };
                // 如果缓存中有翻译过的记录,则获取记录并更换到data数据中
                if (Cookies.get('writeTargetLang')) {
                    const languageList = this.languageList;
                    for (let i = 0; i < languageList.length; i++) {
                        // 先判断是否有缓存,如果有则用缓存中的目标语言,如果没有缓存,则用默认的语言作为目标语言
                        // 有缓存时,将目标语言改为缓存中的目标语言
                        if (languageList[i].value === Cookies.get('writeTargetLang')) {
                            this.targetLang = Cookies.get('writeTargetLang');
                            this.targetTranslate = languageList[i].label;
                            break;
                        };
                    };
                };
                this.translateModel = true; // 显示翻译功能
                this.textModel = false; // 隐藏快速文本功能
                this.showContactList = false; // 隐藏右侧的通讯录
            },
            /** 关闭快速翻译列表 */
            closeTranslate() {
                this.translateModel = false;
            },
            /* ------- 翻译相关 end ------------------------------------------ */
            /* -------- 快速文本  start-------------------------------------- */
            showFastText() {
                if (this.textModel) return;
                this.translateModel = false;
                this.showContactList = false;
                this.cursorType = 'editor';
                this.textModel = true;
                this.fastTextSearch = '';
                this.searchFastTextList();
            },
            /** 关闭快速文本列表 */
            closeFastText() {
                this.textModel = false;
            },
            /** 点击加载更多 */
            quickTextLoadMore() {
                this.textCurrentPage += 1;
                this.getDataByQuickContent();
            },
            /** 跳转至邮箱设置-->快速文本 */
            toFastTextSet() {
                localStorage.setItem('updateAccountToQuickText', 'QuickText');
                window.open(this.$router.resolve('/systemSettings/mail_set').href, '_blank');
            },
            /** 搜索快速文本 */
            searchFastTextList() {
                this.textCurrentPage = 0;
                this.getDataByQuickContent();
            },
            /** 调用快速文本查询接口 */
            getDataByQuickContent() {
                this.$util.ajaxMail({
                    url: '/mail/quickTextsFind/findByQuickContent',
                    method: 'get',
                    params: {
                        userId: this.userId,
                        content: this.fastTextSearch,
                        page: this.textCurrentPage,
                        size: this.fastTextPageSize
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        this.textTotalNumber = res.data.data.totalElements;
                        if (this.textCurrentPage !== 0) {
                            this.quickTexts = this.quickTexts.concat(res.data.data.content);
                        } else {
                            this.quickTexts = res.data.data.content;
                        }
                        this.fastTextShowLag = !(this.textTotalNumber === 0);
                    } else {
                        this.$Message.error(this.$t('mail.writeLetter.quickTextErrorTip'));
                    }
                });
            },
            /** 插入快速文本 */
            handleQuickText(quickText, index) {
                if (this.cursorType === 'subject') {
                    let subjectTest = document.getElementsByClassName('overTwoLine')[index].innerText;
                    subjectTest = subjectTest.replace(/\n/g, '');
                    /** 将鼠标选中部分替换为快速文本 */
                    if (this.inputSelectStartIndex > this.inputSelectEndIndex || this.inputSelectStartIndex === this.inputSelectEndIndex) {
                        this.templateForm.templateTitle = (this.templateForm.templateTitle.substring(0, this.inputSelectEndIndex) + subjectTest + this.templateForm.templateTitle.substring(this.inputSelectStartIndex)).slice(0, 500);
                    } else {
                        this.templateForm.templateTitle = (this.templateForm.templateTitle.substring(0, this.inputSelectStartIndex) + subjectTest + this.templateForm.templateTitle.substring(this.inputSelectEndIndex)).slice(0, 500);
                    }
                } else {
                    let quickTextStr = '';
                    if (quickText.indexOf('style="pointer-events: none;"') !== -1) {
                        quickTextStr = quickText.replace('style="pointer-events: none;"', '');
                    } else {
                        quickTextStr = quickText;
                    }
                    /** 处理快速文本默认样式 */
                    tinymce.execCommand('mceInsertContent', false, quickTextStr);
                }
                this.cursorType = 'editor';
            },
            /* -------- 快速文本  end ---------------------------------------- */
            /* -------- 监测链接 start --------------------------------------------- */
            // 打开监测链接的弹窗
            testInsertLink() {
                this.visible_insertLink = true;
            },
            // 插入监测链接
            handleInsertUrl({ linkUrl }) {
                tinymce.execCommand('mceInsertContent', false, `<a target="_blank" href="${linkUrl}">${linkUrl}</a>`);
            },
            /* -------- 监测链接 end --------------------------------------------- */
            /* -- 新建模板分类 start -------------------------------------- */
            // 获取模板分类
            refreshData(type) {
                findAll({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    type: 1
                }).then(data => {
                    if (data.code === 1 && data.data) {
                        this.tableData = this.handleData(data.data);
                        if (type === 'first' && this.templateClassificationId !== '') {
                            this.$set(this.templateForm, 'templateClassificationId', this.templateClassificationId);
                        }
                        if (type && type === this.templateForm.templateClassificationId) {
                            this.$set(this.templateForm, 'templateClassificationId', '');
                        }
                    } else {
                        this.$Message.error('列表请求失败');
                    }
                }).catch(error => {
                    console.error(error);
                    this.$Message.error('列表请求失败');
                });
            },
            // 处理得到表格数据
            handleData(data) {
                // 如果传入非数组, 直接返回空数组
                if (!Array.isArray(data)) {
                    return [];
                }

                // 格式化数据
                const tmp = data.map(item => {
                    return {
                        editing: false,
                        ...item
                    };
                });

                // 拼合原有数据
                return tmp;
            },
            classificationSet() {
                this.classificationSetVisible = true;
            },
            /** 获取主题光标位置 */
            handleInputBlur(e) {
                this.inputSelectStartIndex = e.target.selectionStart;
                this.inputSelectEndIndex = e.target.selectionEnd;
            },
            insertVariable(str) {
                const character = `{"${str}"}`;
                if (this.cursorType === 'subject') {
                    /** 将鼠标选中部分替换为变量 */
                    if (this.inputSelectStartIndex > this.inputSelectEndIndex || this.inputSelectStartIndex === this.inputSelectEndIndex) {
                        this.templateForm.templateTitle = (this.templateForm.templateTitle.substring(0, this.inputSelectEndIndex) + character + this.templateForm.templateTitle.substring(this.inputSelectStartIndex)).slice(0, 500);
                    } else {
                        this.templateForm.templateTitle = (this.templateForm.templateTitle.substring(0, this.inputSelectStartIndex) + character + this.templateForm.templateTitle.substring(this.inputSelectEndIndex)).slice(0, 500);
                    }
                } else {
                    /** 处理默认样式 */
                    tinymce.execCommand('mceInsertContent', false, `<span>${character}</span>`);
                }
            },
            // 添加智能物流相关逻辑
            // 点击'添加资料库文件'时出现'选择文件'弹窗
            handleFileSelected() {
                this.onlyDownload = 'writeMail';
                // 选择文件弹窗
                this.$refs.filesUpload.handleClick('showDataBaseModel');
            },
            // 选择文件弹窗点击确定后调用的方法
            handleDataBaseFile(data, activeTab) {
                this.dataBaseLoading = true;
                // data: 文件列表;activeTab: 表示文件是属于个人、公司、共享
                const arr = [];
                for (let i = 0; i < data.length; i++) {
                    const obj = {};
                    obj.title = data[i].filename; // 文件名
                    /**
                     * 文件描述:
                     * 问题：1.个别文件的文件名没有文件类型后缀;2大部分文件名有文件类型后缀;
                     * 解决: 1. 没有文件类型后缀的:直接用文件名作为<文件描述>
                     *      2.文件名是有文件类型后缀的:直接用去掉文件后缀的文件名作为<文件描述>
                     */
                    obj.description = data[i].filename.lastIndexOf('.') ? data[i].filename : data[i].filename.substring(0, data[i].filename.lastIndexOf('.'));
                    obj.fileId = data[i].id; // 文件id
                    obj.fileType = activeTab === 'person' ? 10 : activeTab === 'company' ? 11 : activeTab === 'share' ? 12 : 10; // 个人: 10、公司: 11、共享: 12
                    obj.image = 'https://content.leadscloud.com/FjIk9U8rVHGGRAWZHXRHkIxbiYIY'; // 文件预览图
                    obj.isPublic = 0; // 是否需要查看人登录 Facebook 授权,如果不授权将无法预览文件; 0:表示不授权
                    arr.push(obj);
                }

                // 获取智能物料链接
                this.$util.ajaxShareMail({
                    url: '/push/mailAddCloudShare',
                    method: 'POST',
                    data: arr
                }).then((response) => {
                    if (response.data.code === '1') {
                        // 保存接口返回的智能物料的数据
                        const result = response.data.data;
                        // 多次添加智能物料，则按顺序依次添加至文件列表下方
                        // const smartMaterial = this.dataBaseList.concat(result);
                        // 将this.dataBaseList更新为最新的数据
                        // this.dataBaseList = smartMaterial;
                        // 将获取到的智能物料的链接插入邮件内容区
                        this.addDataBaseFile(result);
                    } else {
                        this.dataBaseLoading = false;
                        this.$Message.error(response.data.message);
                    };
                }).catch(error => {
                    console.error(error);
                    this.dataBaseLoading = false;
                });
            },
            /* 将获取到的智能物料的链接插入邮件内容区 */
            addDataBaseFile(arr) {
                /**
                 * 情况1 正常写邮件:            第一次正常append到富文本中、如果发现富文本中有id为dataBaseFile的dom则在后面追加智能物料列表;
                 * 情况2 再次编辑邮件1:         1)如果邮件内容中为单独的智能物料列表(id为dataBaseFile的dom),则在后面追加新的智能物料;
                 * 情况3 再次编辑邮件2:         2)如果文本中有di为relayPlaceholder的dom,则在最后面插入新的智能物料列表;
                 * 情况4 回复邮件:              直接在di为relayPlaceholder的dom前insertBefore新的智能物料;
                 */
                // 获取邮件富文本的dom
                const currDoc = tinymce.activeEditor.iframeElement.contentDocument;

                // 暂存id为relayPlaceholder的dom,用来判断是否为回复邮件的情况
                const relayPlaceholderDom = currDoc.getElementById('relayPlaceholder');
                // 如果回复的邮件中有id为dataBaseFile的dom,则将所有的dom的id转化为oldBataBaseFile
                const relayPlaceholderDoms = currDoc.querySelectorAll('#dataBaseFile');
                // 将回复的内容中有id为dataBaseFile的dom 改为oldBataBaseFile
                if (relayPlaceholderDoms && relayPlaceholderDom && !this.replyStatus) {
                    this.replyStatus = true;
                    relayPlaceholderDoms.forEach(item => {
                        item.id = 'oldBataBaseFile';
                    });
                }

                // 当前富文本 id为dataBaseFile的dom
                const currSignNode = currDoc.getElementById('dataBaseFile');
                // 如果富文本中有id为dataBaseFile的dom,则存一下它的父节点（后续追加新的智能物料）
                let currSignNodeParentNode = null;
                if (currSignNode) {
                    // 父节点
                    currSignNodeParentNode = currSignNode.parentNode.querySelector('ul');
                };

                // 新建添加文件的dom
                const dataBaseFileDom = document.createElement('div');
                dataBaseFileDom.id = 'dataBaseFile'; // 添加一个自定义的id
                dataBaseFileDom.style = 'font-size:14px;background: #F5F6F9;border-radius: 4px;padding:12px;margin-top:24px; clear:both;'; // 添加样式

                /** dom的内容区 start */
                // 要添加的文本(顶部)
                const dataBaseDom = document.createElement('div');
                // 顶部左侧span
                const spanDom1 = document.createElement('span');
                spanDom1.style = 'font-weight:600;margin-right:12px;color:rgba(0,0,0,0.8);';
                spanDom1.innerHTML = 'Document List';
                dataBaseDom.appendChild(spanDom1);
                // 顶部右侧span
                const spanDom2 = document.createElement('span');
                spanDom2.style = 'font-size:12px;color:rgba(0,0,0,0.6);';
                spanDom2.innerHTML = 'Tip: Click file name to preview and download the file';
                dataBaseDom.appendChild(spanDom2);
                // 新建ul列表dom
                const ulDom = document.createElement('ul');
                ulDom.style = 'padding:0;margin:0;'; // ul的样式
                arr.forEach(item => {
                    const imgDom = document.createElement('img'); // 新建i标签
                    imgDom.style = 'height: 24px;width: 24px;font-size:16px;margin-right:10px;';
                    // 根据文件类型匹配正确的img文件图标
                    for (const key in smartmaterialIcons) {
                        if (item.suffix === key) {
                            imgDom.src = smartmaterialIcons[key];
                            break;
                        } else {
                            imgDom.src = smartmaterialIcons.default;
                        };
                    };

                    const liDom = document.createElement('li'); // 新建li标签
                    liDom.style = 'margin-top:12px;list-style:none;display:flex;align-items:center;';
                    const aDom = document.createElement('a'); // 新建a标签
                    aDom.style = 'text-decoration:none;color:#3B78DE;font-size:12px';
                    aDom.href = item.url;
                    aDom.target = '_blank';
                    aDom.innerHTML = item.fileName;
                    liDom.appendChild(imgDom); // li标签里面追加i标签
                    liDom.appendChild(aDom); // li标签里面追加a标签
                    ulDom.appendChild(liDom); // ul标签里面追加li标签
                });
                /** dom的内容区 end */

                // 替换dom内容
                dataBaseFileDom.appendChild(dataBaseDom);
                dataBaseFileDom.appendChild(ulDom);

                // 富文本最后追加资料库文件dom
                if (relayPlaceholderDom && this.dataBaseReplyStatus) {
                    if (currSignNode) {
                        // 追加新的智能物料列表
                        currSignNode.appendChild(ulDom);
                        this.dataBaseLoading = false; // 关闭loading效果
                        return;
                    }
                    // 第一次在回复的文本前插入智能物料
                    currDoc.body.firstElementChild.insertBefore(dataBaseFileDom, relayPlaceholderDom);
                    this.dataBaseLoading = false; // 关闭loading效果
                    return;
                };
                // 再次编辑时,重新追加ul列表
                if (currSignNodeParentNode) {
                    currSignNodeParentNode.appendChild(ulDom);
                    this.dataBaseLoading = false; // 关闭loading效果
                    return;
                };
                // 情况1
                currDoc.body.firstElementChild.appendChild(dataBaseFileDom);
                this.dataBaseLoading = false; // 关闭loading效果
            },
            // ai tool bar
            onIputSelect(e) {
                const result = getInputSelectedText()
                if (result.text) {

                    const insert = (newText, insertStart, insertEnd) => {
                        this.templateForm.templateTitle= newText
                        const subInput = document.getElementById("emailTemplateSubject")
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
                            const newText = coverText(this.templateForm.templateTitle, v, result)
                            insert(newText, result.start, result.start + v.length)
                        },
                        onInsert: (v) => {
                            const newText = insertText(this.templateForm.templateTitle, v, result)
                            insert(newText, result.end, result.end + v.length)
                        }
                    })
                } else {
                    this.$aiToolBar.destroy()
                }
            },
        },
        watch: {
            // ai tool bar 
            'templateForm.templateTitle': {
                handler(val) {
                    if (val.toLowerCase() === '/ai') {
                        this.$aiToolBar.init({
                            type: 'inputBoxSlash',
                            onConfirm: v => {
                                this.$aiToolBar.destroy()
                                this.templateForm.templateTitle = v

                                const subInput = document.getElementById("emailTemplateSubject")
                                subInput.focus()
                                this.$nextTick(() => {
                                    subInput.setSelectionRange(0, v.length)
                                })
                            },
                            onAbort: () => {
                                this.templateForm.templateTitle = ''
                            }
                        })
                    }else {
                        this.$aiToolBar.destroy()
                    }
                },
            },
        },
        beforeDestroy() {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            tinymce.get('mailTemplateEditer').destroy();
        }
    };
</script>
<style lang="less" scoped>
    @import url(./less/new_template.less);

</style>
