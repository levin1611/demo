<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-13 15:26:49
 * @LastEditTime: 2019-08-19 09:28:26
 * @LastEditors: Please set LastEditors
 -->
<style lang="less">
@import url(../../../mail/mail-home/components/write-mail/write-mail);
</style>
<style lang="less" scoped>
@import url(../../../mail/mail-home/components/write-mail/scoped);
@import url(./edit_template);

.insert-link-text {
    color:#3B78DE;
    font-size: 12px;
    &:hover{
         color: #2D63BC;
    }
}
</style>
<template>
    <div class="leave_drag" @dragleave.self.prevent="dragOver = false">
      <div class="writeMail" @dragover.prevent="enter_drag">
          <Card dis-hover shadow="never" :bordered="false" style="padding-top:30px;">
            <h3 style="margin-bottom:16px;" >{{$t('automatedMail.editTemplate')}}</h3>
            <Row :gutter="20">
              <Col :span="20" style="padding-left: 20px;">
                <div @dragover.prevent="enter_drag" @drop.prevent="dragOver = false" class="enter_drag">
                  <Form label-width="50" v-model="emailForm">
                    <FormItem style="margin-bottom:16px;" :label="$t('automatedMail.emailName')">
                      <Input v-model="emailForm.name"></Input>
                    </FormItem>
                    <FormItem :label="$t('mail.writeLetter.subject')" style="margin-bottom: 0">
                      <Input v-model="emailForm.subject" id="mailSubject" @mouseup.native="onIputSelect"></Input>
                      <div>
                        <self_upload
                                ref="filesUpload"
                                multiple
                                type="drag"
                                :action="action"
                                :max-size="30720"
                                :ul_width="modal_width"
                                :on-exceeded-size="handleSizeOverflow"
                                :onPreview="handlePreviewAtta"
                                :defaultFileList="defaultFileList"
                                style="margin-top: 10px;color: #FA8241"
                                :style="{width:auto_width}">
                            <span @click="handleNormalUpload">
                                <Icon type="ios-cloud-upload-outline" size='18'></Icon>
                                {{$t('mail.writeLetter.attSize30MTip')}}
                            </span>
                            <div style="padding: 20px 0;width: 100%;margin: 0 auto" v-show="dragOver">
                                <Icon type="ios-cloud-upload" size="52" style="color: #FA8241"></Icon>
                                <p>{{$t('mail.writeLetter.dragTip')}}</p>
                            </div>
                        </self_upload>
                      </div>
                    </FormItem>
                    <div style="margin:10px 0;">
                      <Dropdown style="display: inline-block;font-size: 12px;margin-right: 20px;" trigger="click" @command="insertCharacter">
                          <span style="display:inline-block;color:#3B78DE;font-size: 12px;">{{$t('automatedMail.insertCustomTags')}}</span>
                          <DropdownMenu slot="dropdown">
                              <DropdownItem v-for="item in labels" :command="item.value">{{item.label}}</DropdownItem>
                          </DropdownMenu>
                      </Dropdown>
                        <span style="display:inline-block;height: 12px;width:1px;background: #DCDFE6;"></span>
                        <!-- 监测链接的入口 -->
                        <div style="margin-left:20px;cursor: pointer;display: inline-block;" @click.stop="testInsertLink">
                            <span class="insert-link-text">
                                <Icon custom="custom custom-lianjie1" size="16" style="color: #3B78DE;margin-right: 4px;"/>{{$t('monitorLink.title')}}
                            </span>
                        </div>
                    </div>
                    <FormItem :label="$t('mail.writeLetter.body')" style="margin-bottom: 12px">
                      <div id="editTemplate" v-show="!dragOver"></div>
                    </FormItem>
                    <FormItem style="margin-bottom: 0;padding-left:36px;">
                      <Button type="primary"  @click="addTemplate"
                          style="width: 70px;margin-right: 6px;">{{$t('save')}}
                      </Button>
                      <Button @click="reset" style="width: 70px;color: #FA8241;border-color: #FA8241;">
                        {{$t('cancel')}}
                      </Button>
                    </FormItem>
                  </Form>
                </div>
              </Col>
            </Row>
          </Card>
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
      </div>
    </div>
</template>
<script>
    import tinymce from 'tinymce';
    import 'tinymce/themes/silver';
    /** 解决tinymce Firefox浏览器兼容问题 */
    import 'tinymce/plugins/paste';
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
    import 'tinymce/icons/default';
    import * as qiniu from 'qiniu-js';

    import util from '@/libs/util';
    import self_upload from '../../../mail/mail-home/components/write-mail/self-upload';
    import monitorLink from '@/views/main-components/contact-association/monitorLink';

    import { mapState } from 'vuex';

    // ai tool bar
    import { getInputSelectedText, coverText, insertText } from '@/views/ai-toolbar/utils/tools'

    export default {
        name: 'Edit',
        props: {
            id: {
                type: Number,
                default: -1
            }
        },
        components: {
            self_upload: self_upload,
            monitorLink
        },
        data() {
            return {
                defaultFileList: [],
                is_show: false,
                labels: [
                    {
                        label: this.$t('automatedMail.userName'),
                        value: 'name'
                    },
                    {
                        label: this.$t('automatedMail.companyName'),
                        value: 'companyName'
                    }
                ],
                insertFields: [], // 插入的自定义标签
                dragOver: false,
                action: '', // 上传图片url
                mailContent: '', // 邮件内容
                emailForm: {
                    name: '', // 模板名称
                    subject: '', // 主题
                    mailSignIndex: 0, // 邮件签名索引
                    priority: false, // 紧急
                    receipt_flag: false, // 回执
                    mailIsTrace: true, // 追踪邮件
                    mailTimeFlag: false, // 定时邮件
                    bjTime: null // 定时邮件
                },
                uptoken: '',
                visible_insertLink: false,
                defaultEditorSetting: {
                    fontFamilyValue: 'arial', // 写信默认字体
                    fontSizeValue: '16px', // 写信默认字号
                    fontColorValue: '#000' // 写信默认颜色
                }

            };
        },
        computed: {
            ...mapState(['enterpriseId', 'userId', 'fullName', 'qiniuHttp', 'qiniuUrl', 'window_width']),
            modal_width() {
                return parseInt((this.window_width - 360) * 0.8 - 40);
            },
            auto_width() {
                if (this.dragOver) {
                    return '100%';
                } else {
                    return '200px';
                }
            }
        },
        created() {
            this.getDefaultSetting();
        },
        methods: {
            /** 获取写信设置默认值 */
            getDefaultSetting() {
                util.ajaxJson({
                    url: '/crm/userconfig/get',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        key: 'getDefaultSetting'
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        if (res.data.data.value) {
                            const result = JSON.parse(res.data.data.value);
                            this.defaultEditorSetting.fontFamilyValue = result.fontFamilyValue
                                ? result.fontFamilyValue
                                : 'arial';
                            this.defaultEditorSetting.fontSizeValue = result.fontSizeValue
                                ? result.fontSizeValue
                                : '16px';
                            this.defaultEditorSetting.fontColorValue = result.fontColorValue
                                ? result.fontColorValue
                                : '#000';
                        }
                    }
                    this.initEditor();
                });
            },
            addLabels(content) {
                const insertList = [
                    {
                        label: '{"name"}',
                        value: 'name'
                    },
                    {
                        label: '{"companyName"}',
                        value: 'companyName'
                    }
                ];
                const insertArr = [];
                insertList.forEach(item => {
                    if (content.indexOf(item.label) !== -1) {
                        insertArr.push(item.value);
                    }
                });

                return insertArr;
            },
            /* 新增邮件模板 */
            addTemplate() {
                if (this.id !== -1) {
                    this.updateTemplet();
                    return;
                }
                const content = tinymce.activeEditor.getContent();
                if (!content) {
                    this.$Message.error(this.$t('automatedMail.contentEmptyWarning'));
                    return;
                } else if (!this.emailForm.name) {
                    this.$Message.error(this.$t('automatedMail.nameEmptyWarning'));
                    return;
                } else if (!this.emailForm.subject) {
                    this.$Message.error(this.$t('automatedMail.themeEmptyWarning'));
                    return;
                }
                this.insertFields = this.addLabels(content);
                const jsonData = {
                    createUserId: this.userId,
                    createUserName: this.fullName,
                    mailTempletAttachmentList: this.$refs.filesUpload.fileList.map((file, index) => {
                        return {
                            fileName: file.name,
                            fileOrder: index,
                            filePath: this.qiniuHttp + file.response.key,
                            fileSize: file.size,
                            fileType: file.name.slice(file.name.lastIndexOf('.'))
                            // mailBoxId: 4
                        };
                    }),
                    mailTempletContent: content,
                    mailTempletInsertField: JSON.stringify(this.insertFields),
                    mailTempletSubject: this.emailForm.subject,
                    mailTempletTitle: this.emailForm.name,
                    orgId: this.enterpriseId
                };
                util.ajaxJson({
                    url: '/mail/mailTemplet',
                    method: 'post',
                    data: jsonData
                }).then(res => {
                    if (res.data.code == 1) {
                        this.$Message.success(this.$t('saveSuccess'));
                        this.$emit('updateList');
                        this.reset();
                    } else {
                        this.$Message.success(this.$t('saveFail'));
                    }
                });
            },
            /* 编辑邮件模板 */
            updateTemplet() {
                const content = tinymce.activeEditor.getContent();
                if (!content) {
                    this.$Message.error(this.$t('automatedMail.contentEmptyWarning'));
                    return;
                } else if (!this.emailForm.name) {
                    this.$Message.error(this.$t('automatedMail.nameEmptyWarning'));
                    return;
                } else if (!this.emailForm.subject) {
                    this.$Message.error(this.$t('automatedMail.themeEmptyWarning'));
                    return;
                }
                this.insertFields = this.addLabels(content);
                const jsonData = {
                    id: this.id,
                    mailTempletAttachmentList: this.$refs.filesUpload.fileList.map((file, index) => {
                        return {
                            fileName: file.name,
                            fileOrder: index,
                            filePath: this.qiniuHttp + file.response.key,
                            fileSize: file.size,
                            fileType: file.name.slice(file.name.lastIndexOf('.'))
                            // mailBoxId: 4
                        };
                    }),
                    mailTempletContent: content,
                    mailTempletInsertField: JSON.stringify(this.insertFields),
                    mailTempletSubject: this.emailForm.subject,
                    mailTempletTitle: this.emailForm.name,
                    orgId: this.enterpriseId,
                    updateUserId: this.userId,
                    updateUserName: this.fullName
                };
                util.ajaxJson({
                    url: '/mail/mailTemplet',
                    method: 'put',
                    data: jsonData
                }).then(res => {
                    if (res.data.code == 1) {
                        this.$Message.success(this.$t('saveSuccess'));
                        this.$emit('updateList');
                        this.reset();
                    }
                });
            },
            /** 在光标位置插入内容 */
            insertCharacter(str) {
                const character = `{"${str}"}`;
                this.insertFields.push(str);
                tinymce.execCommand('mceFocus', false, 'editTemplate');
                tinymce.execCommand('mceInsertContent', false, character);
            },
            /** 日期格式化 */
            dateFormat(fmt, timeStramp) {
                const date = new Date(timeStramp);
                const o = {
                    'M+': date.getMonth() + 1, // 月份
                    'd+': date.getDate(), // 日
                    'h+': date.getHours(), // 小时
                    'm+': date.getMinutes(), // 分
                    's+': date.getSeconds(), // 秒
                    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
                    S: date.getMilliseconds() // 毫秒
                };
                if (/(y+)/.test(fmt)) {
                    fmt = fmt.replace(
                        RegExp.$1,
                        (`${date.getFullYear()}`).substr(4 - RegExp.$1.length)
                    );
                }
                for (const k in o) {
                    if (new RegExp(`(${k})`).test(fmt)) {
                        fmt = fmt.replace(
                            RegExp.$1,
                            RegExp.$1.length == 1
                                ? o[k]
                                : (`00${o[k]}`).substr((`${o[k]}`).length)
                        );
                    }
                }
                return fmt;
            },
            enter_drag(e) {
                if (
                    e.target.className === 'ivu-form-item-content' ||
                    e.target.className === 'ivu-select-input' ||
                    e.target.className === 'ivu-select-selection' ||
                    e.target.className === 'ivu-icon ivu-icon-plus-circled' ||
                    e.target.className === 'ivu-form ivu-form-label-right' ||
                    e.target.className === 'ivu-select-placeholder' ||
                    e.target.className === 'ivu-input' ||
                    e.target.className === 'ivu-col ivu-col-span-16' ||
                    e.target.className === 'ivu-upload' ||
                    e.target.className === 'ivu-upload ivu-upload-drag' ||
                    e.target.className === 'ivu-icon ivu-icon-ios-cloud-upload' ||
                    e.target.className ===
                    'ivu-upload ivu-upload-drag ivu-upload-dragOver' ||
                    e.target.className === 'enter_drag' ||
                    e.target.className === 'addContacts' ||
                    e.target.className === 'ivu-icon ivu-icon-ios-cloud-upload-outline' ||
                    !e.target.className
                ) {
                    this.dragOver = true;
                } else {
                    this.dragOver = false;
                }
            },
            /** 上传的附件超过30M */
            handleSizeOverflow() {
                this.$Message.error(this.$t('mail.writeLetter.attachmentMaxTip'));
            },
            /* 初始化七牛，获取图片上传token */
            initQiniu() {
                util
                    .oldAjax({
                        url: '/file-sys/api/uptoken',
                        method: 'post'
                    })
                    .then(response => {
                        this.action =
                            `//upload.qiniup.com?token=${response.data.uptoken}`;
                    });
            },
            /* 插入图片至编辑器 */
            insertImage(res) {
                const src = this.qiniuHttp + res.key;
                tinymce.execCommand('mceInsertContent', false, `<img src=${src}>`);
            },
            /* 初始化编辑器 */
            initEditor() {
                tinymce.execCommand('mceRemoveEditor', true, 'editTemplate');
                tinymce.remove('editTemplate');
                const vm = this;
                const host = `${window.location.origin}/Front-Vue`;
                tinymce.init({
                    selector: '#editTemplate',
                    language_url: `${host}/tinymce/langs/zh_CN.js`,
                    skin_url: `${host}/tinymce/skins/ui/oxide`,
                    // language_url: '/tinymce/langs/zh_CN.js',
                    // skin_url: '/tinymce/skins/ui/oxide',
                    skin: 'oxide',
                    browser_spellcheck: true, // 拼写检查
                    branding: false, // 去水印
                    elementpath: false,
                    // statusbar: false,  //隐藏编辑器底部的状态栏
                    paste_data_images: true, // 允许粘贴图像
                    paste_enable_default_filters: false, // paste插件 禁用TinyMCE的默认粘贴过滤器。
                    paste_webkit_styles: 'all', // 指定在WebKit中粘贴时要保留的样式
                    height: document.body.offsetHeight - 430,
                    language: vm.$t('mail.editor_lauguage'),
                    plugins: 'undo redo fullscreen autolink lists link image charmap print hr anchor imagetools media nonbreaking directionality paste textpattern formatpainter table hr code',
                    // 添加扩展插件
                    external_plugins: {
                        formatpainter: `${process.env.BASE_URL}tinymce/formatpainter/plugin.min.js`
                    },
                    menubar: false,
                    contextmenu: false, // 禁用编辑器上下文菜单
                    table_default_styles: {
                        'border-collapse': 'collapse',
                        width: '100%'
                    },
                    table_advtab: false,
                    table_cell_advtab: false,
                    toolbar: [
                        'undo redo formatpainter | fontselect fontsizeselect | forecolor backcolor bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent lineheight | insertImageBtn link table hr | fullscreen code removeformat'
                    ],
                    toolbar_mode: 'floating',
                    font_formats: '黑体="黑体";宋体="宋体";微软雅黑="微软雅黑";楷体="楷体";Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Calibri=calibri;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats',
                    fontsize_formats: '12px 14px 16px 18px 24px 36px 48px', // 字号选项
                    autosave_interval: '20s',
                    forced_root_block: 'div', /* 参数 将非块元素或文本节点都包含在设置的元素中 回车 其他邮件中用的大部分是div包裹元素 */
                    setup: function(editor) {
                        editor.on('init', function(e) {
                            tinymce.activeEditor.resetContent(vm.mailContent);
                            this.getBody().style.fontSize = vm.defaultEditorSetting.fontSizeValue;
                            this.getBody().style.color = vm.defaultEditorSetting.fontColorValue;
                            this.getBody().style.fontFamily = vm.defaultEditorSetting.fontFamilyValue;
                            if (vm.id !== -1) {
                                vm.getContent(vm.id);
                            }
                        });
                        // ai tool bar
                        editor.on('mouseup', function (e) {
                            setTimeout(() => {
                                const selection = editor.selection;
                                const text = selection.getContent({ 'format': 'text' }).trim();
                                const preText = selection.getContent({ 'format': 'html' });
                                const editorIframe = document.getElementById('editTemplate_ifr');
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
                        editor.ui.registry.addButton('insertImageBtn', {
                            // text: 'Insert Image',
                            tooltip: 'Insert Image',
                            icon: 'image',
                            onAction: function(_) {
                                const upload = vm.$refs.imageUpload;
                                vm.$nextTick(() => {
                                    upload.$refs['upload-inner'].handleClick();
                                });
                            }
                        });
                    },
                    images_upload_handler: function(blobInfo, success, failure) {
                        console.log(blobInfo, '粘贴图片');
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
                        util
                            .oldAjax({
                                url: '/file-sys/api/uptoken',
                                method: 'post'
                            })
                            .then(response => {
                                vm.uptoken = response.data.uptoken;
                                vm.action =
                                    `//upload.qiniup.com?token=${response.data.uptoken}`;

                                const observable = qiniu.upload(blobInfo.blob(), uid, vm.uptoken, putExtra, config);
                                const subscription = observable.subscribe(observer);
                            });
                    }
                });
            },
            /* 把模板里的置空 */
            reset() {
                this.$emit('update:id', -1);
                this.$emit('update:editting', false);
                this.emailForm = {
                    name: '',
                    subject: '',
                    content: ''
                };
                tinymce.activeEditor.resetContent('');
                this.defaultFileList = [];
                this.$refs.filesUpload.fileList = [];
            },
            /* 获取模板详情 */
            getContent(id) {
                this.is_show = true;
                util.ajax({
                    url: `/mail/mailTemplet/${id}`,
                    method: 'get'
                }).then(res => {
                    this.is_show = false;
                    if (res.data.code == 1) {
                        const data = res.data.data;
                        this.emailForm = {
                            name: data.mailTempletTitle,
                            subject: data.mailTempletSubject,
                            content: data.mailTempletContent
                        };
                        tinymce.get('editTemplate').resetContent(data.mailTempletContent);
                        if (data.mailTempletAttachmentList) {
                            let fileList = data.mailTempletAttachmentList;
                            fileList = fileList.map(item => {
                                const hash = item.filePath.split(`//${this.qiniuUrl}/`)[1];
                                return {
                                    name: item.fileName,
                                    percentage: 100,
                                    response: {
                                        hash: hash,
                                        key: hash
                                    },
                                    showProgress: false,
                                    // size: item.fileSize,
                                    size: Number(item.fileSize),
                                    status: 'finished',
                                    uid: item.id
                                };
                            });
                            this.defaultFileList = fileList;
                            // this.$refs.filesUpload.fileList = fileList;
                        }
                    }
                });
            },
            /* 附件预览 */
            handlePreviewAtta(data) {
                const filePath = `${this.qiniuHttp}${data.response.key}`;
                let type = data.name.slice(data.name.lastIndexOf('.'));
                type = type.toLowerCase();
                if (type === '.jpg' || type === '.jpeg' || type === '.png' || type === '.gif') {
                    // this.previewImg=true
                    // this.imgUrl=path
                    window.open(`${filePath}?imageView2/0`);
                } else if (['.mp4', '.webm', '.pdf', '.txt'].includes(type)) {
                    window.open(filePath);
                } else if (type === '.xls' || type === '.xlsx' || type === '.doc' || type === '.docx' || type === '.ppt' || type === '.pptx') {
                    window.open(`http://view.officeapps.live.com/op/view.aspx?src=${filePath}`);
                } else {
                    this.$Message.info(this.$t('mail.previewErrorTip'));
                }
            },
            // 打开监测链接的弹窗
            testInsertLink() {
                this.visible_insertLink = true;
            },
            // 插入监测链接
            handleInsertUrl({ linkUrl }) {
                // 如果没有链接直接插入
                tinymce.execCommand('mceInsertContent', false, `<a target="_blank" href="${linkUrl}">${linkUrl}</a>`);
            },
            handleNormalUpload() {
                this.$refs.filesUpload.handleClick('normal');
            },

            // ai tool bar
            onIputSelect(e) {
                const result = getInputSelectedText()
                if (result.text) {

                    const insert = (newText, insertStart, insertEnd) => {
                        this.emailForm.subject= newText
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
                            const newText = coverText(this.emailForm.subject, v, result)
                            insert(newText, result.start, result.start + v.length)
                        },
                        onInsert: (v) => {
                            const newText = insertText(this.emailForm.subject, v, result)
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
            'emailForm.subject': {
                handler(val) {
                    if (val.toLowerCase() === '/ai') {
                        this.$aiToolBar.init({
                            type: 'inputBoxSlash',
                            onConfirm: v => {
                                this.$aiToolBar.destroy()
                                this.emailForm.subject = v

                                const subInput = document.getElementById("mailSubject")
                                subInput.focus()
                                this.$nextTick(() => {
                                    subInput.setSelectionRange(0, v.length)
                                })
                            },
                            onAbort: () => {
                                this.emailForm.subject = ''
                            }
                        })
                    }else {
                        this.$aiToolBar.destroy()
                    }
                },
            },
        },
        mounted() {
            this.initQiniu();
        }
    };
</script>
