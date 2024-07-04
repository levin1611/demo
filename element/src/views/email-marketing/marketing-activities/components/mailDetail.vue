<template>
    <div>
        <Modal :visible="visible"
               v-if="visible"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               :lock-scroll="false"
               :width="mail_modal_width"
               ref="currentModal"
               @close="close"
               class="previewModal">

            <div slot="title">
                <span style="margin-right: 5px;max-width: calc(100% - 80px);overflow: hidden;text-overflow: ellipsis; white-space: nowrap; display: inline-block;" v-if="(!marketingForm || !marketingForm.subject) && !fromData.subject">{{$t('mail.writeLetter.noSubject')}}</span>
                <span style="margin-right: 5px;max-width: calc(100% - 80px);overflow: hidden;text-overflow: ellipsis; white-space: nowrap; display: inline-block;" v-else>{{marketingForm && marketingForm.subject || fromData.subject}}</span>
            </div>

            <div class="previewContent" v-loading="loading">
                <div class="markingInfo">
                    <div class="infoItem">
                        <span class="infoLabel">{{$t('mailMarketing.report.sender')}}：</span>
                        <span class="infoText" v-if="marketingForm">{{marketingForm.nickname ? `${marketingForm.nickname}<${marketingForm.from}>` : `<${marketingForm.from}>`}}</span>
                        <span class="infoText" v-else>{{fromData.from}}</span>
                    </div>
                    <div class="infoItem">
                        <span class="infoLabel">{{$t('mailMarketing.report.date')}}：</span>
                        <span class="infoText">{{marketingForm && nowTime || fromData.sendTime}}</span>
                    </div>
                    <div class="infoItem">
                        <span class="infoLabel">{{$t('mailMarketing.report.recipients')}}：</span>
                        <span class="infoText" v-if="marketingForm">{{marketingForm.recipients_from_data| recipients_to_filter}}</span>
                        <span class="infoText" v-else>{{fromData.receiveJson | receiveJson_filter}}</span>
                    </div>
                    <div v-if="filesPreview && filesPreview.length">
                        <span class="clumsName">{{$t('mail.writeLetter.attachment')}}</span>{{filesPreview.length}}{{ $t('b2b.b2b.unit') }}
                        <UploadList :files='filesPreview'>
                        </UploadList>
                    </div>
                    <div v-if="fromData && fromData.attachmentCount">
                        <span class="clumsName">{{$t('mail.writeLetter.attachment')}}</span>{{fromData.attachmentCount}}{{ $t('b2b.b2b.unit') }}
                        <!--<UploadList :files='fromData.mailAttachmentList'>-->
                        <!--</UploadList>-->
                        <a style="color:#4285f4;" @click="scrollToAttachment">{{$t('mail.gotoAttachment')}}</a>
                    </div>
                </div>
                <div class="markingContent">
                    <blockquote class="detailContent" v-html="mailContent || fromData.content" style="padding-top:20px;line-height:32px;" >
                    </blockquote>
                </div>
                <!-- 附件列表 -->
                <div ref="attachmentArea" id="attachmentArea" v-if="fromData && fromData.attachmentCount">
                    <div style="margin-bottom:10px;height:1px;background-color:#EAEAEA;"></div>
                    <div >
                        <!-- <Icon type="paperclip" size="16"></Icon> -->
                        <span>{{$t('mail.attachment')}}（{{fromData.attachmentCount}}{{ $t('b2b.b2b.unit') }}）</span>
                        <span v-if="fromData && fromData.mailAttachmentList && fromData.mailAttachmentList.length > 1" class="mail-attachmentpackagedownload" style="cursor:pointer;color:#3b78de;margin-right: 10px;" @click="downloadFileZip">{{ $t('mail.packageDownload') }}</span>
                        <Icon custom="custom custom-refresh" class="receive-load-loop" v-if="isDownloadingZip"></Icon>
                    </div>
                    <div v-for="(item,index) in fromData.mailAttachmentList" :key="index" style="margin:5px 10px">
                        <div>
                            <Icon :class="format(item)" size="16" style="color: #677f99;margin-right: 6px;"></Icon>
                            <span>{{item.fileName}}</span>
                            <span v-if="item.fileState === 1">（{{item.fileSize}}）</span>
                        </div>
                        <div>
                            <span @click="downloadFile(item.fileState, item.filePath,item.fileName, item.id, item.iconType)"
                                  class="header-source" style="margin-right:10px;">{{$t('mail.download')}}</span>
                            <span @click="previewFile(item.fileState, item.fileType,item.filePath,item.id, item.iconType)" class="header-source">{{$t('mail.preview')}}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div slot="footer">
                <Button class="" type="default" @click.stop="close">{{'关闭'}}</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import JSZip from 'jszip';
    import { mapState } from 'vuex';
    import UploadList from '@/views/mail/mail-home/components/write-mail/upload-list.vue';
    export default {
        name: 'preview',
        props: {
            visible: {
                type: Boolean
            },
            mailContent: {
                type: String
            },
            filesPreview: {
                type: Array
            },
            actMailId: {
                type: Number
            },
            marketingForm: {
                type: Object
            }
        },
        data() {
            return {
                mail_modal_width: '800px',
                fromData: {},
                loading: !this.marketingForm,
                knownFileTypes: [
                    'jpg', 'jpeg', 'png', 'bmp', 'webp',
                    'mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv',
                    'mp3', 'wav', 'wma', 'ogg', 'aac', 'flac', 'doc', 'docx',
                    'txt', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx', 'epub', 'zip',
                    'rar', 'gif', 'ico', 'psd', 'mpg', 'mov', 'wmv', 'rm'], // 已知的文件类型名
                attachmentDataList: {}, // 从七牛获取到的附件资源数据
            };
        },
        components: { UploadList },
        computed: {
            ...mapState({
                fullName: 'fullName',
                orgId: 'enterpriseId',
                userId: 'userId',
                userName: state => state.userName,
                themeKey: state => state.mail.themeKey,
                searchType: state => state.mail.searchType,
                currentPersonId: state => state.mail.currentPersonId,
                currentAccount: state => state.mail.currentAccount,
                currentInputInfo: state => state.mail.currentInputInfo,
                currentAccountIds: state => state.mail.currentAccountIds,
                downloadingMailIds: state => state.mail.downloadingMailIds,
                mailReadingMode: state => state.mail.mailReadingMode,
                // 写信页面富文本编辑器 content_style 配置中会影响邮件内容渲染的样式
                tinymce_contentStyle: state => state.mail.tinymce_contentStyle
            }),
            nowTime() {
                const t = new Date();
                const minute = t.getMinutes() < 10 ? `0${t.getMinutes()}` : t.getMinutes();
                return `${t.getFullYear()}年${t.getMonth() + 1}月${t.getDate()}日 ${t.getHours()}:${minute}`;
            },
            isDownloadingZip() {
                if (this.downloadingMailIds.findIndex(item => item === this.actMailId) !== -1) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        filters: {
            recipients_to_filter(val) {
                if (val && val.length) {
                    const arr = [];
                    val.forEach((item) => {
                        const str = item.addrName + '(' + (item.contactCount || JSON.parse(item.contacts).length) + ')';
                        arr.push(str);
                    });
                    return arr.join('; ');
                } else {
                    return '';
                }
            },
            receiveJson_filter(val) {
                if (val && val.length) {
                    const arr = JSON.parse(val);
                    const result = [];
                    arr.forEach((item) => {
                        const str = item.addrName + '(' + JSON.parse(item.contacts).length + ')';
                        result.push(str);
                    });
                    return result.join('; ');
                } else {
                    return '';
                }
            }
        },
        mounted() {
            if (this.actMailId) {
                this.getDetail();
            }
        },
        methods: {
            close() {
                this.$emit('update:visible', false);
            },
            // 获取营销邮件的详情
            getDetail() {
                util.ajaxEmailMarketing({
                    url: '/business/marketing/activity/getEdmActivityDetail',
                    method: 'get',
                    params: {
                        id: this.actMailId
                    }
                }).then(response => {
                    this.loading = false;
                    if (response.data.code === 1) {
                        const result = response.data.data;
                        this.fromData = result.mailDetailCondition;
                        this.fromData.receiveJson = result.receiveJson;
                        this.title = (result.mailDetailCondition.subject === '') ? this.$t('mail.writeLetter.noSubject') : result.mailDetailCondition.subject;
                    } else {
                        this.$Message.error(response.data.msg);
                    }
                }).catch(() => {
                    this.loading = false;
                    this.$Message.error('请求异常');
                });
            },
            scrollToAttachment() {
                document.querySelector('.previewModal .el-dialog__body').scrollTop = this.$refs.attachmentArea.offsetTop;
            },
            /* 附件打包下载 */
            async downloadFileZip() {
                const ids = this.fromData.mailAttachmentList.map(item => item.id);
                const filesInfo = await this.getAttachmentStateById(ids);
                this.fromData.mailAttachmentList = this.getAttachmentIcon(filesInfo);
                if (filesInfo.some(item => item.fileState !== 1)) {
                    this.$Message.error('当前附件还未收取完毕，请稍后再试');
                } else {
                    if (this.downloadingMailIds.findIndex(item => item === this.actMailId) !== -1) {
                        this.$Message.warning(this.$t('mail.packageDownloading'));
                        return;
                    }
                    const vm = this;
                    const promises = [];
                    this.$store.commit('setDownloadingMailIds', this.actMailId);
                    for (let i = 0; i < this.fromData.mailAttachmentList.length; i++) {
                        promises.push(vm.getFileData(this.fromData.mailAttachmentList[i]));
                    }
                    Promise.all([...promises]).then(() => {
                        const zip = new JSZip();
                        let attachmentData = this.fromData.mailAttachmentList;
                        attachmentData = this.handleSameNameFile(attachmentData);
                        for (let i = 0; i < attachmentData.length; i++) {
                            const currAtta = attachmentData[i];
                            const id = currAtta.id;
                            zip.file(currAtta.newFileName, vm.attachmentDataList[id].data);
                        }
                        zip.generateAsync({ type: 'blob' }).then(function(content) {
                            // see FileSaver.js
                            saveAs(content, `${vm.title}.zip`);
                            vm.$store.commit('setDownloadingMailIds', vm.actMailId);
                        });
                    }).catch((err) => {
                        vm.$store.commit('setDownloadingMailIds', vm.actMailId);
                        vm.$Message.error(this.$t('mail.error_packageDownload'));
                    });
                }
            },
            /* 通过附件id查询附件信息   需要后台联调，打包下载 */
            getAttachmentStateById(ids, iconType) {
                return new Promise((resolve, reject) => {
                    util.ajaxEdmMailParamsSerializer({
                        url: '/mailAttachments',
                        method: 'GET',
                        params: {
                            mailAttachementIds: ids
                        }
                    }).then(res => {
                        if (res.data.code === 1) {
                            if (ids.length === 1) {
                                const fileIndex = this.fromData.mailAttachmentList.findIndex(item => item.id === ids[0]);
                                res.data.data[0].iconType = iconType;
                                this.fromData.mailAttachmentList.splice(fileIndex, 1, res.data.data[0]);
                            }
                            resolve(res.data.data);
                        } else {
                            resolve(false);
                        }
                    }).catch(err => {
                        reject(err);
                    });
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
            /* 由文件类型转换成相应的图标显示 */
            format(file) {
                const format = file.fileType.split('.')[1];
                let type = 'document';

                if (['jpg', 'jpeg', 'png', 'bmp', 'webp', 'gif', 'ico', 'psd'].indexOf(format) > -1) {
                    type = 'custom custom-image';
                }
                if (['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv', 'mpg', 'mov', 'wmv', 'rm'].indexOf(format) > -1) {
                    type = 'custom custom-video';
                }
                if (['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'].indexOf(format) > -1) {
                    type = 'custom custom-audio';
                }
                if (['doc', 'docx'].indexOf(format) > -1) {
                    type = 'custom custom-word';
                }
                if (['txt'].indexOf(format) > -1) {
                    type = 'custom custom-txt';
                }
                if (['pdf'].indexOf(format) > -1) {
                    type = 'custom custom-pdf';
                }
                if (['xls', 'xlsx'].indexOf(format) > -1) {
                    type = 'custom custom-excel';
                }
                if (['ppt', 'pptx'].indexOf(format) > -1) {
                    type = 'custom custom-ppt';
                }
                if (['epub', 'zip', 'rar'].indexOf(format) > -1) {
                    type = 'custom custom-zip';
                }
                if (this.knownFileTypes.indexOf(format) === -1) {
                    type = 'custom custom-unknown-file-format';
                }
                // if (['keynote','ppt','pptx'].indexOf(format) > -1) {
                //     type = 'ios-videocam';
                // }

                return type;
            },
            async previewFile(state, type, path, id, iconType) {
                /* state---附件状态：0附件开始接收；1已经成功接收完附件；2附件接收途中报错了;默认是1 */
                if (state !== 1) {
                    const fileInfo = await this.getAttachmentStateById([id], iconType);
                    if (fileInfo[0].fileState !== 1) {
                        this.$Message.error('当前附件还未收取完毕，请稍后再试');
                    } else {
                        path = fileInfo[0].filePath;
                        type = fileInfo[0].fileType;
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
                    }
                } else {
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
                }
            },
            async downloadFile(state, path, name, id, iconType) {
                /* state---附件状态：0附件开始接收；1已经成功接收完附件；2附件接收途中报错了;默认是1 */
                if (state !== 1) {
                    const fileInfo = await this.getAttachmentStateById([id], iconType);
                    if (fileInfo[0].fileState !== 1) {
                        this.$Message.error('当前附件还未收取完毕，请稍后再试');
                    } else {
                        path = fileInfo[0].filePath;
                        name = fileInfo[0].fileName;
                        window.open(`//${path.slice(path.split(':')[0].length + 1)}?attname=${name}`);
                    }
                } else {
                    window.open(`//${path.slice(path.split(':')[0].length + 1)}?attname=${name}`);
                }
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
            // 获取七牛的附件数据
            getFileData(file) {
                return new Promise((resolve, reject) => {
                    util.ajaxDownloadFile({
                        url: file.filePath,
                        method: 'get',
                        params: {
                            attname: file.fileName
                        }
                    }).then(res => {
                        this.attachmentDataList[file.id] = {};
                        this.attachmentDataList[file.id] = res;
                        resolve(res);
                    }).catch(error => {
                        this.attachmentDataList[file.id] = {};
                        reject();
                    });
                });
            }
        },
        watch: {
            marketingForm(val) {
                this.marketingForm = val;
            }
        }
    };
</script>
<style lang="less">
    .previewModal{
        .el-dialog{
            .el-dialog__body{
                max-height:500px;
                overflow-y: auto;
                padding-top:0;
            }
        }
    }
</style>
<style lang="less" scoped>
    .previewContent{
        .markingInfo{
            border-bottom: 1px solid #eaeaea;
            padding-bottom:12px;

            .infoItem{
                margin-bottom:6px;

                .infoLabel{
                    font-size: 12px;
                }
                .infoText{
                    font-size: 12px;
                }
            }
        }
    }
</style>