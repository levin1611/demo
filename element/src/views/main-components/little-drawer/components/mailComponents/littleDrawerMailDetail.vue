<template>
    <Modal :visible="visible"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :modal="false"
        :append-to-body="true"
        class="littleDrawer-mail-modal"
        :class="modalClass">
        <!-- 自定义头部内容 -->
        <div class="drawer_header">
            <!-- 钉住 -->
            <Icon custom="custom custom-float-window" class="mail_pin_up piwik_littleDrawerMailDetail_pinUp" v-if="!littleDrawerMailDetailFixed" @click.native="handleFixed(true)" size="16" />
            <Icon custom="custom custom-fixed-window" class="mail_pin_up piwik_littleDrawerMailDetail_pinUp" v-else @click.native="handleFixed(false)" size="16" />
            <!-- 自定义关闭按钮 -->
            <a @click="$emit('update:visible', false);$emit('update:id', '')"
                class="drawer-close-button">
                <Icon custom="custom-drawer-detail-close"></Icon>
            </a>
        </div>
            <!-- @click="$emit('update:visible', false)" -->
            <div class="mail-modal-header">
                邮件详情
            </div>
            <!-- 标题 + 标签 -->
            <div class="mail-modal-title">
                <div class="mail-modal-subject">{{ mailDetail.subject }}</div>
                <div>
                    <!-- 翻译图标 -->
                    <Tooltip placement="top" :content="$t('mail.translateContent')" transfer>
                        <Icon class="piwik_email_detail_translate_button" style="cursor:pointer;" size="16" custom="custom custom-fanyi" @click="handleTranslateContent"/>
                    </Tooltip>
                    <Tooltip placement="top" :content="$t('mail.openNewWindow')" transfer>
                        <Icon class="cursor-pointer" size="16" color="#677F99" custom="custom custom-icon_opennew" style="margin-left: 10px;" @click="handleOpenNewWindow"/>
                    </Tooltip>
                </div>
            </div>

            <!-- 简略信息 -->
            <ul class="detail-head">
                <li>{{ $t('mail.writeLetter.sender') }}：{{ mailDetail.from }}</li>
                <li v-if="type !== 'mailTable'">{{ $t('mail.writeLetter.sendTime') }}{{ mailDetail.sendTime }}</li>
                <li :title="mailDetail.recipients_to && mailDetail.recipients_to[0] === '[' && mailDetail.recipients_to[mailDetail.recipients_to.length-1] === ']'?JSON.parse(mailDetail.recipients_to).join(','):mailDetail.recipients_to">{{ $t('mail.writeLetter.recipients') }}：{{ mailDetail.recipients_to && mailDetail.recipients_to[0] === '[' && mailDetail.recipients_to[mailDetail.recipients_to.length-1] === ']'?JSON.parse(mailDetail.recipients_to).join(','):mailDetail.recipients_to}}</li>
                <!-- 经产品确认，时间轴的邮件详情，不显示邮件大小的信息。此处注释相关代码 -->
    <!--            <li>{{ $t('mail.writeLetter.size') }}：{{ mailDetail.mailSize }}</li>-->
                <li v-if="attachments.length"  style="color:#979797;">{{$t('mail.attachment')}}：
                    {{attachments.length}}（<span class="attachmentBrief"><span v-for="(item,index) in attachments" :key="index"><span>{{item.fileName}}</span><span v-if="index!==attachments.length-1">，</span></span></span>）
                    <a style="color:#4285f4;" @click="scrollToAttachment">{{$t('mail.gotoAttachment')}}</a>
                </li>
                <!-- 翻译行 -->
                <li v-show="showTranslateContent">
                    {{this.$t('mail.writeTranslate.mailTranslation')}}
                    <span>{{this.$t('mail.writeTranslate.translateTo')}}&nbsp;</span>
                    <Dropdown trigger="click" @command="selectTargetLanguage">
                        <span class="translate-select">
                            <span>{{targetTranslate}}</span>
                            <Icon custom="custom-menu-arrow" color="#7B98B6" size="12"></Icon>
                        </span>
                        <DropdownMenu style="width:125px;max-height: 300px;overflow-y: auto;margin-top: 10px;" slot="dropdown">
                            <DropdownItem :style="item.label===targetTranslate?'color:#4285F4':''"  v-for="(item,index) in languageList" :key="index" :command="item">{{item.label}}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <span class="translate-btn" v-if="showOriginal" @click="handleRevert">{{this.$t('mail.writeTranslate.showOriginalText')}}</span>
                    <span class="translate-btn" v-else @click="handleTranslate">{{this.$t('mail.writeTranslate.translate')}}</span>
                    <span class="translate-btn" @click="closeTranslate">{{this.$t('mail.writeTranslate.close')}}</span>
                </li>
            </ul>
            <!-- 详情 -->
            <div class="detail-text">
                <iframe :src="`${publicPath}mailDetail.html?timer=${(new Date()).getTime()}`"
                        id="mailFrameName"
                        :name="mailFrameName"
                        width="100%"
                        height="0"
                        class="no-border"></iframe>

                <!-- 自定义滚动条 -->
                <div @scroll="handleMailHorizontalScroll"
                    ref="mailIframeScroll"
                    :style="mailScrollContainerStyleObj">
                    <div :style="mailScrollInnerStyleObj"></div>
                </div>
            </div>
            <!-- 附件 -->
            <div ref="attachmentArea" v-if="attachments.length" class="attachmentArea">
                <div style="margin:15px 0;height:1px;background-color:#EAEAEA;"></div>
                <div>
                    <!-- <Icon type="paperclip" size="16"></Icon> -->
                    <span>{{ $t('mail.attachment') }}（{{ attachments.length }}{{ $t('b2b.b2b.unit') }}）</span>
                    <span v-if="attachments.length > 1 && show_mail_btn"
                        @click="downloadFileZip"
                        style="margin-right: 10px;"
                        class="header-source"
                        :class="{'crm-mailattachmentpackagedownload': ['inquiry', 'customer','customerDetail','customerColumns','highseasCustomer', 'contact'].includes(originalType)}">{{ $t('mail.packageDownload') }}</span>
                    <Icon v-if="check_isDownloading(id)" class="receive-load-loop"
                        custom="custom-refresh" style="margin-right: 10px;"></Icon>
                    <span v-if="attachments.length > 1 && show_mail_btn" class="header-source" @click="copyAttachment()">{{ $t('mail.copyAttachmentAll') }}</span>
                </div>
                <div v-for="(item, index) in attachments"
                    :key="index"
                    style="margin:5px 10px">
                    <div>
                        <!-- 邮件详情页与写信页面上传附件时显示的图标一致，所以此处增加format方法，根据文件类型转换成对应图标显示 -->
                        <!-- 杨娣  2020/05/26 -->
                        <Icon :class="format(item)" size="16" style="color: #677f99;margin-right: 6px;"></Icon>
                        <span>{{ item.fileName }}</span>
                        （{{ item.fileSize }}）
                    </div>
                    <div v-if="show_mail_btn">
                        <span @click="downloadFile(item.filePath, item.fileName)"
                            style="margin-right: 10px;"
                            :class="{'header-source': true, 'crm-mailattachmentdownload': ['inquiry', 'customer', 'customerDetail','customerColumns','highseasCustomer', 'contact'].includes(originalType)}">
                            {{ $t('mail.download') }}</span>
                            <!-- 预览 -->
                        <span @click="previewFile(item.fileType, item.filePath)"
                            style="margin-right: 10px;"
                            :class="{'header-source': true, 'crm-mailattachmentpreview': ['inquiry', 'customer', 'customerDetail','customerColumns','highseasCustomer', 'contact'].includes(originalType)}">
                            {{ $t('mail.preview') }}</span>
                        <span @click="copyAttachment(item)"
                              class="header-source">{{$t('mail.copyAttachments')}}</span>
                    </div>
                </div>
            </div>
    </Modal>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import JSZip from 'jszip';
    import { saveAs } from 'file-saver';
    import mailContent from '@/mixins/mailContent';
    import mailTranslate from '@/mixins/mailDetailTranslate'; // 引入翻译功能相关共通代码

    export default {
        name: 'littleDrawerMailDetail',
        mixins: [mailContent, mailTranslate],
        props: [
            'visible',
            'modalWidth',
            'id',
            'createUserId',
            'originalType',
            'type'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                littleDrawerMailDetailFixed: 'littleDrawerMailDetailFixed',
                downloadingMailIds: state => state.mail.downloadingMailIds,
                // 写信页面富文本编辑器 content_style 配置中会影响邮件内容渲染的样式
                tinymce_contentStyle: state => state.mail.tinymce_contentStyle,
                copyAttachmentStatus: state => state.mail.copyAttachmentStatus
            }),
            show_mail_btn() {
                return !['xhl-chat', 'visitorHistory', 'FBLeads', 'Fb-comment', 'Fb-chat'].includes(this.originalType);
            },
            modalClass() {
                let className = '';
                if (this.$route.path === '/mail/mailDetail') {
                    className = 'mailSinglePage';
                }
                if (this.littleDrawerMailDetailFixed) {
                    if (className) {
                        className += ' littleDrawerMailDetailFixed';
                    } else {
                        className += 'littleDrawerMailDetailFixed';
                    }
                }
                return className;
            }
        },
        data() {
            return {
                // 静态资源文件地址
                publicPath: process.env.BASE_URL,
                mailDetail: {},
                loading: false,

                // 批量下载
                attachments: [],
                attachmentDataList: {},
                // 已知的文件类型名
                knownFileTypes: [
                    'jpg', 'jpeg', 'png', 'bmp', 'webp',
                    'mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv',
                    'mp3', 'wav', 'wma', 'ogg', 'aac', 'flac', 'doc', 'docx',
                    'txt', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx', 'epub', 'zip',
                    'rar', 'gif', 'ico', 'psd', 'mpg', 'mov', 'wmv', 'rm'],
                // 邮件内容 iframe name
                mailFrameName: 'littleDrawerMailContentFrame',
                // 模拟水平滚动条距离 offsetParent 的 bottom , 单位 px
                scrollBarBottom: 2
            };
        },
        methods: {
            // 处理邮件详情代码并渲染到iframe中
            renderCodeToIframe(mailContent) {
                /** handleMailHTML方法 和 renderMailHTML方法都来源mixins(mailContent) */
                // 生成 iframe documentElement 代码
                this.content = this.handleMailHTML(mailContent, this.themeKey);
                // 渲染代码到 iframe 中
                this.renderMailHTML(this.mailFrameName, this.content, this.handleIframeHashChange);

                // ai tool bar drawer
                this.$nextTick(() => {
                    this.initAiToolBar()
                });
            },
            // ai tool bar 
            initAiToolBar () {
                const _this = this
                const iframe = document.getElementById("mailFrameName");
                if(iframe) {
                    const doc = iframe.contentDocument || iframe.contentWindow.document;
                    const element = doc.getElementsByTagName('body')[0];
                    element.addEventListener('mouseup', function(e) {
                        let text;
                        const selection = iframe.contentWindow.getSelection()
                        if (selection && selection.toString().length !== 0) {
                            text = selection.toString()
                        }
                        if (text) {
                            const frameRect = iframe.getBoundingClientRect()
                            const { left, top  } = frameRect
                            setTimeout(() => {
                                _this.$aiToolBar.init({
                                    type: 'pageSelect',
                                    value: text,
                                    mouseX: left + e.clientX,
                                    mouseY: top + e.clientY,
                                })
                            }, 0)
                        }
                    });
                }
            },

            getMailDetail() {
                // 清空数据
                this.loading = true;
                this.mailDetail = {};

                // 滚动条位置重置
                this.$nextTick(() => {
                    const mailModal = document.querySelector('.mail-modal .el-dialog__body');
                    if (mailModal) mailModal.scrollTop = 0;
                });
                // 发送请求
                util.ajaxMailJson({
                    url: '/mail/mailDetail',
                    method: 'get',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        id: this.id,
                        createUserId: this.createUserId
                    },
                    timeout: 60000
                }).then(async res => {
                    if (['1', '-4'].includes(`${res.data.code}`)) {
                        // 请求邮件详情成功 或 邮件已被彻底删除(但仍能查看)

                        // 暂存邮件详情
                        const mailDetail = res.data.data;

                        // 处理邮件发送时间
                        if (mailDetail.sendTime) {
                            mailDetail.sendTime = mailDetail.sendTime.substr(0, 19);
                        }

                        // 渲染页面
                        // 暂存邮件内容
                        let strHTML = mailDetail.content;
                        // 如果邮件内容不以此样式开头, 且此邮件是询盘云发出(注意, 只能识别已发箱邮件), 给邮件内容前面加上此样式, 避免渲染错误
                        if (!strHTML.startsWith(this.tinymce_contentStyle) && mailDetail.fromOrToFlag === 1) {
                            strHTML = this.tinymce_contentStyle + strHTML;
                        }
                        // 调用组件中处理邮件的方法
                        this.renderCodeToIframe(strHTML);
                        // 监听邮件详情垂直滚动, 以调整模拟水平滚动条的位置
                        this.$nextTick(() => {
                            const mailModal = document.querySelector('.littleDrawer-mail-modal .el-dialog .el-dialog__body');
                            mailModal.addEventListener('scroll', this.handleMailVerticalScroll);
                        });

                        // 邮件内容赋值
                        this.mailDetail = Object.assign(mailDetail, { id: this.id });

                        // 处理邮件附件
                        this.attachments = mailDetail.mailAttachmentList || [];
                        this.attachments.forEach((item) => {
                            if (item.fileType === '.jpg' || item.fileType === '.jpeg' || item.fileType === '.png') {
                                item.iconType = 'image';
                            } else {
                                item.iconType = 'document';
                            }
                        });

                        // 更改邮件状态为已读
                        if (this.userId == this.mailDetail.createUserId && !this.mailDetail.mailReadFlag) {
                            util.ajaxMailJson({
                                url: '/mail/mailReadFlag',
                                method: 'PUT',
                                data: {
                                    orgId: this.enterpriseId,
                                    ids: [`${this.id}`],
                                    mailReadFlag: 1,
                                    updateUserId: this.userId,
                                    updateUserName: this.userName
                                }
                            }).then(response => {});
                        }
                    } else {
                        if (res.data.msg) {
                            this.$Message.error(res.data.msg);
                        } else {
                            this.$Message.error(this.$t('mail.getFailAndRetryLater'));
                        }
                        this.$emit('update:visible', false);
                    }
                    this.loading = false;
                }).catch((err) => {
                    console.error(err, '报错信息');
                    this.$Message.error(this.$t('mail.getFailAndRetryLater'));
                    this.$emit('update:visible', false);
                    this.loading = false;
                });
            }, // 获取邮件详情
            /* 由文件类型转换成相应的图标显示 */
            format(file) {
                const format = file.fileType.split('.')[1];
                let type = 'document';

                if (['jpg', 'jpeg', 'png', 'bmp', 'webp', 'gif', 'ico', 'psd'].indexOf(format) > -1) {
                    type = 'custom custom-image';
                } else if (['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv', 'mpg', 'mov', 'wmv', 'rm'].indexOf(format) > -1) {
                    type = 'custom custom-video';
                } else if (['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'].indexOf(format) > -1) {
                    type = 'custom custom-audio';
                } else if (['doc', 'docx'].indexOf(format) > -1) {
                    type = 'custom custom-word';
                } else if (['txt'].indexOf(format) > -1) {
                    type = 'custom custom-txt';
                } else if (['pdf'].indexOf(format) > -1) {
                    type = 'custom custom-pdf';
                } else if (['xls', 'xlsx'].indexOf(format) > -1) {
                    type = 'custom custom-excel';
                } else if (['ppt', 'pptx'].indexOf(format) > -1) {
                    type = 'custom custom-ppt';
                } else if (['epub', 'zip', 'rar'].indexOf(format) > -1) {
                    type = 'custom custom-zip';
                } else {
                    type = 'custom custom-unknown-file-format';
                }
                return type;
            },
            /* 附件打包下载 */
            downloadFile(path, name) {
                window.open(`//${path.slice(path.split(':')[0].length + 1)}?attname=${encodeURIComponent(name)}`);
            },
            // 预览
            previewFile(type, path) {
                type = type.slice(type.lastIndexOf('.'));
                type = type.toLowerCase();
                if (type === '.jpg' || type === '.jpeg' || type === '.png' || type === '.gif') {
                    // this.previewImg=true
                    // this.imgUrl=path
                    window.open(`${path}?imageView2/0`);
                } else if (['.mp4', '.webm', '.pdf', '.txt'].includes(type)) {
                    window.open(path);
                } else if (type === '.xls' || type === '.xlsx' || type === '.doc' || type === '.docx' || type === '.ppt' || type === '.pptx') {
                    window.open(`http://view.officeapps.live.com/op/view.aspx?src=${path}`);
                } else {
                    this.$Message.info(this.$t('mail.previewErrorTip'));
                }
            },
            downloadFileZip() {
                if (this.check_isDownloading(this.id)) {
                    this.$Message.warning(this.$t('mail.packageDownloading'));
                    return;
                }
                const title = this.mailDetail.subject;
                const vm = this;
                const promises = [];
                this.$store.commit('setDownloadingMailIds', this.id);
                for (let i = 0; i < this.attachments.length; i++) {
                    promises.push(vm.getFileData(this.attachments[i]));
                }
                this.attachments = this.getAttachmentIcon(this.attachments);
                Promise.all([...promises]).then(() => {
                    const zip = new JSZip();
                    let attachmentData = vm.attachments;
                    attachmentData = vm.handleSameNameFile(attachmentData);
                    for (let i = 0; i < attachmentData.length; i++) {
                        const fileId = attachmentData[i].id;
                        zip.file(attachmentData[i].newFileName, vm.attachmentDataList[fileId].data);
                    }
                    zip.generateAsync({ type: 'blob' })
                        .then(function(content) {
                            // see FileSaver.js
                            saveAs(content, `${title}.zip`);
                            vm.attachmentDataList = {};
                            vm.$store.commit('setDownloadingMailIds', vm.id);
                        });
                }).catch(error => {
                    console.error(error);
                    vm.attachmentDataList = {};
                    vm.$store.commit('setDownloadingMailIds', vm.id);
                    vm.$Message.error(this.$t('mail.error_packageDownload'));
                });
            },
            /* 处理同名文件 */
            handleSameNameFile(files) {
                const tempArr = [];
                let lastIndex = -1;
                for (let i = 0; i < files.length; i++) {
                    const tempFileNames = tempArr.map(item => item.fileName);
                    const newFileNames = tempArr.map(item => item.newFileName);
                    if (tempArr.length) {
                        lastIndex = tempFileNames.lastIndexOf(files[i].fileName);
                    }
                    if (lastIndex !== -1) {
                        if (tempArr[lastIndex].repeatIndex) {
                            const index = Number(tempArr[lastIndex].repeatIndex.slice(-2, -1));
                            files[i].repeatIndex = `(${index + 1})`;
                        } else {
                            files[i].repeatIndex = '(1)';
                        }
                    }
                    let newFileName = '';
                    if (files[i].repeatIndex) {
                        newFileName = `${files[i].realFileName} ${files[i].repeatIndex}${files[i].fileType}`;
                        if (newFileNames.findIndex(item => item === newFileName) !== -1) {
                            newFileName = `${files[i].realFileName} (${Number(files[i].repeatIndex.slice(-2, -1)) + 1})${files[i].fileType}`;
                        }
                    } else {
                        newFileName = `${files[i].realFileName}${files[i].fileType}`;
                    }
                    files[i].newFileName = newFileName;
                    tempArr.push(files[i]);
                }
                return tempArr;
            },
            getAttachmentIcon(attachments) {
                attachments.forEach((item) => {
                    if (item.fileType === '.jpg' || item.fileType === '.jpeg' || item.fileType === '.png') {
                        item.iconType = 'image';
                    } else {
                        item.iconType = 'document';
                    }
                    item.realFileName = item.fileName.substring(0, item.fileName.lastIndexOf('.'));
                });
                return attachments;
            },
            getFileData(file) {
                return new Promise((resolve, reject) => {
                    util.ajaxDownloadFile({
                        url: file.filePath,
                        method: 'get',
                        params: {
                            attname: file.fileName
                        }
                    }).then(res => {
                        this.attachmentDataList[file.id] = res;
                        resolve(res);
                    }).catch(error => {
                        console.error(error);
                        reject();
                    });
                });
            },
            check_isDownloading(id) {
                return this.downloadingMailIds.findIndex(item => `${item}` === `${id}`) !== -1;
            },
            scrollToAttachment() {
                document.querySelector('.littleDrawer-mail-modal .el-dialog__body').scrollTop = this.$refs.attachmentArea.offsetTop;
            },
            // 钉住
            handleFixed(flag) {
                localStorage.setItem('littleDrawerMailDetailFixed', flag);
                this.$store.commit('setLittleDrawerMailDetailFixed', flag);
            },
            copyAttachment(item) {
                const copyAttachment = item ? JSON.stringify([item]) : JSON.stringify(this.attachments);
                localStorage.setItem('copyAttachment', copyAttachment);
                this.$store.commit('setCopyAttachmentStatus', !this.copyAttachmentStatus);
                this.$Message.success(this.$t('mail.copyAttachmentTip'));
            },
            handleOpenNewWindow() {
                window.open(this.$rootRouter.resolve({
                    name: 'mailSinglePageMailDetail',
                    query: {
                        id: this.mailDetail.id,
                        currentPersonId: this.mailDetail.createUserId
                    }
                }).href, '_blank');
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    // 显示邮件详情时先关闭翻译行
                    // 往来邮件详情钉住逻辑
                    const flag = JSON.parse(localStorage.getItem('littleDrawerMailDetailFixed')) || false;
                    this.$store.commit('setLittleDrawerMailDetailFixed', flag);
                } else {
                    this.$store.commit('setLittleDrawerMailDetailFixed', false);
                }
            },
            id(val) {
                if (val) {
                    this.showTranslateContent = false;
                    this.getMailDetail();
                }
            }
        },
        beforeDestroy() {
            this.$store.commit('setLittleDrawerMailDetailFixed', false);

            // ai tool bar destory removeEventListener
            const iframe = document.getElementById("mailFrameName");
            if(iframe) {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                const element = doc.getElementsByTagName('body')[0];
                element.removeEventListener('mouseup');
            }
        }
    };
</script>

<style lang="less">
    // 更改翻译语言的下拉列表得hover样式
    .el-dropdown-menu__item:not(.is-disabled):hover {
        background-color: #F3F4F7;
        color: #3B78DE;
    }
    // 两个按钮
    .translate-btn {
        margin-left:20px;
        color: #3B78DE;
        font-weight: 400;
        cursor:pointer;
    }
    // 邮件翻译列表
    .translate-select {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 120px;
        line-height:34px;
        border: 1px solid #CBD6E2;
        border-radius: 4px;
        cursor:pointer;
        padding: 0 10px;
        box-sizing: border-box;
        font-size: 12px;
        color: rgba(0, 0, 0 ,0.8);
    }
    .el-dialog__wrapper.littleDrawer-mail-modal {
        pointer-events: none;
        overflow: hidden;
        left: unset;
        right: 370px;
        .el-dialog {
            margin-top: 56px !important;
            margin-bottom: 0;
            width: 400px;
            margin: 0 30px 10px 30px;
            height: calc(~'100% - 56px');
            pointer-events: auto;
            // box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
            // box-shadow:0 0 0 0 rgba(0,0,0,.2),0 5px 6px 3px rgba(0,0,0,.14),0 6px 6px 3px rgba(0,0,0,.12),0 5px 6px 3px rgba(0,0,0,.12);
            box-shadow:0 8px 10px -5px rgba(0,0,0,.2),0 16px 24px 2px rgba(0,0,0,.1),0 6px 30px 5px rgba(0,0,0,.12);
            .el-dialog__header {
                display: none;
            }
            .el-dialog__body {
                // display: flex;
                // flex-flow: column;
                position: relative;
                height: 100%;
                overflow-y: auto;
                padding: 12px 20px 0;
                .drawer_header{
                    height: 34px;
                    width: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    overflow-y: auto;
                    // background: #fff;
                    z-index: 99;
                    .mail_pin_up{
                        position: absolute;
                        top: 8px;
                        right: 46px;
                    }
                }
                .littleDrawer-mail-Body{
                    height: 100%;
                    overflow-y: auto;
                    position: relative;
                }
                .detail-head {
                    list-style-type: none;
                    font-size: 12px;
                    color: #979797;
                    padding-bottom: 6px;
                    border-bottom: 1px solid rgb(234, 234, 234);
                    margin-bottom: 6px;
                    li {
                        display: -webkit-box;
                        line-height: 24px;
                        max-height: 72px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        -webkit-line-clamp: 3;
                        -webkit-box-orient: vertical;
                        word-break: break-all;
                    }
                }
                .mail-modal-header{
                    font-size: 18px;
                    line-height: 26px;
                    font-weight: bold;
                    margin-bottom: 6px;
                }
                .mail-modal-title{
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: bold;
                    font-size: 12px;
                    line-height: 20px;
                    margin-bottom: 12px;
                    .mail-modal-subject{
                        width: calc(100% - 80px);
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                }
                .detail-text {
                    // overflow-y: auto;
                }
                .attachmentArea{
                    height: 166px;
                    // overflow-y: auto;
                }
            }
        }
        .drawer-close-button {
            cursor: pointer;
            font-size: 14px;
            overflow: hidden;
            position: absolute;
            top: 0;
            right: 0;
            z-index: 1;
            .custom {
                font-size: 26px;
                background-color: #FFF;
                color: #495060;
                opacity: .5;
                border-radius: 20%;
            }
        }
    }
    .el-dialog__wrapper.littleDrawer-mail-modal.mailSinglePage {
        .el-dialog {
            margin-top: 0px !important;
            height: 100%;
        }
    }
    .el-dialog__wrapper.littleDrawerMailDetailFixed{
        right: -30px;
        left: unset;
    }
</style>
