<template>
    <Modal :visible="visible"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           :modal-append-to-body="true"
           :append-to-body="true"
           :title="$t('mail.preview')"
           v-loading="loading"
           :width="modalWidth"
           @close="$emit('update:visible', false)"
           class="email_template-modal">

        <!-- 标题 + 标签 -->
        <div class="mail-modal-title">
            <div>{{ mailDetail.templateTitle ? mailDetail.templateTitle : $t('mail.writeLetter.noSubject') }}</div>
        </div>
        <!-- 详情 -->
        <div class="detail-text">
            <iframe :src="`${publicPath}mailDetail.html?t=${new Date().getTime()}`"
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
        <div ref="attachmentArea" v-if="attachments.length">
            <div style="margin:15px 0;height:1px;background-color:#EAEAEA;"></div>
            <div>
                <!-- <Icon type="paperclip" size="16"></Icon> -->
                <span>{{ $t('mail.attachment') }}（{{ attachments.length }}{{ $t('b2b.b2b.unit') }}）</span>
                <span v-if="attachments.length > 1 "
                      @click="downloadFileZip"
                      class="header-source"
                      style="margin-right: 10px;"
                      :class="{'crm-mailattachmentpackagedownload': ['inquiry', 'customer','customerDetail','customerColumns','highseasCustomer', 'contact'].includes(originalType)}">{{ $t('mail.packageDownload') }}</span>
                <Icon v-if="check_isDownloading(id)"
                    style="margin-right: 10px;"
                    class="receive-load-loop"
                    custom="custom-refresh"></Icon>
                <span v-if="attachments.length > 1"
                    class="header-source"
                    @click="copyAttachment()">{{ $t('mail.copyAttachmentAll') }}</span>
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
                <div>
                    <span @click="downloadFile(item.filePath, item.fileName)"
                        style="margin-right: 10px;"
                        class="header-source">
                        {{ $t('mail.download') }}</span>
                        <!-- 预览 -->
                    <span @click="previewFile(item.fileType, item.filePath)"
                        style="margin-right: 10px;"
                        class="header-source">
                        {{ $t('mail.preview') }}</span>
                    <span @click="copyAttachment(item)" class="header-source">{{$t('mail.copyAttachments')}}</span>
                </div>
            </div>
        </div>

        <!-- 底部按钮 -->
        <div slot="footer" style="text-align:right;">
            <Button @click="$emit('update:visible', false)">{{ $t('close') }}</Button>
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
    import { getById } from '@/api/mail/mailSet.js';

    export default {
        name: 'mailDetail',
        mixins: [mailContent, mailTranslate],
        props: [
            'visible',
            'modalWidth',
            'id'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                downloadingMailIds: state => state.mail.downloadingMailIds,
                // 写信页面富文本编辑器 content_style 配置中会影响邮件内容渲染的样式
                tinymce_contentStyle: state => state.mail.tinymce_contentStyle,
                copyAttachmentStatus: state => state.mail.copyAttachmentStatus
            })
        },
        data() {
            return {
                // 静态资源文件地址
                publicPath: process.env.BASE_URL,
                mailDetail: {},
                loading: false,
                mailModal: null,
                // 批量下载
                attachments: [],
                attachmentDataList: {},
                // 邮件内容 iframe name
                mailFrameName: 'showTemplateFrame',
                // 模拟水平滚动条距离 offsetParent 的 bottom , 单位 px
                scrollBarBottom: 66
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
            },
            // 获取邮件详情
            getMailDetail() {
                // 清空数据
                this.loading = true;
                this.mailDetail = {};

                // 滚动条位置重置
                this.$nextTick(() => {
                    this.mailModal = document.querySelector('.email_template-modal .el-dialog__body');
                    if (this.mailModal) this.mailModal.scrollTop = 0;
                });
                // 发送请求
                getById({
                    id: this.id
                }).then(res => {
                    // 暂存邮件详情
                    const mailDetail = res.data;

                    // 渲染页面
                    // 暂存邮件内容
                    let strHTML = mailDetail.contentHtml;
                    // 如果邮件内容不以此样式开头, 且此邮件是询盘云发出(注意, 只能识别已发箱邮件), 给邮件内容前面加上此样式, 避免渲染错误
                    if (!strHTML.startsWith(this.tinymce_contentStyle)) {
                        strHTML = this.tinymce_contentStyle + strHTML;
                    }
                    // 调用组件中处理邮件的方法
                    this.renderCodeToIframe(strHTML);
                    // 监听邮件详情垂直滚动, 以调整模拟水平滚动条的位置
                    this.$nextTick(() => {
                        this.mailModal = document.querySelector('.email_template-modal .el-dialog__body');
                        this.mailModal.addEventListener('scroll', this.handleMailVerticalScroll);
                    });

                    // 邮件内容赋值
                    this.mailDetail = mailDetail;

                    // 处理邮件附件
                    this.attachments = mailDetail.attachmentList || [];
                    this.attachments.forEach((item) => {
                        if (item.fileType === '.jpg' || item.fileType === '.jpeg' || item.fileType === '.png') {
                            item.iconType = 'image';
                        } else {
                            item.iconType = 'document';
                        }
                    });
                    this.loading = false;
                }).catch((err) => {
                    console.error(err, '报错信息');
                    this.$Message.error(this.$t('mail.getFailAndRetryLater'));
                    this.$emit('update:visible', false);
                    this.loading = false;
                });
            },
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
                const title = this.mailDetail.templateTitle || this.$t('mail.writeLetter.noSubject');
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
                document.querySelector('.mail-modal .el-dialog__body').scrollTop = this.$refs.attachmentArea.offsetTop;
            },
            copyAttachment(item) {
                const copyAttachment = item ? JSON.stringify([item]) : JSON.stringify(this.attachments);
                localStorage.setItem('copyAttachment', copyAttachment);
                this.$store.commit('setCopyAttachmentStatus', !this.copyAttachmentStatus);
                this.$Message.success(this.$t('mail.copyAttachmentTip'));
            }
        },
        beforeDestroy() {
        },
        watch: {
            visible(val) {
                if (val) {
                    this.getMailDetail();
                } else {
                    console.log('移除监听');
                    // 移除监听
                    if (this.mailModal) {
                        this.mailModal.removeEventListener('scroll', this.handleMailVerticalScroll);
                        this.mailModal = null;
                    };
                }
            }
        }
    };
</script>

<style lang="less">
    .email_template-modal {
        .detail-head {
            padding: 0 6px 24px;
            list-style-type: none;
            font-size: 13px;
            color: #979797;
        }
        .detail-text{
            padding: 0 6px;
        }
        .el-dialog {
            top: 50%;
            transform: translateY(-50%);
            margin: 0 auto !important;
            .el-dialog__body {
                max-height: calc(~'90vh - 110px');
                overflow: auto;
                padding: 10px 24px;
                .mail-modal-title{
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: bold;
                    font-size: 18px;
                    line-height: 18px;
                    margin: 24px 0px;
                }
            }
        }
    }
</style>
