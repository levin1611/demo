<template>
    <div>
        <Button v-show="!isHidddenBtn"
            :disabled="disabled"
            color="#fb8b2f"
            size="large"
            class="upload-btn"
            @click="uploadTrigger">
            <Icon type="plus" size="16" color="#c9c9c9" class="upload-btn-icon"></Icon>
        </Button>
        <input :disabled="disabled"
               type="file"
               multiple
               style="display: none"
               ref="uploadEl"
               @change="handleUpload">
        <div class="file-list-box">
            <div class="picture-item" v-for="(file, index) in filesList" :key="index">
                <Icon :class="format(file.type)" size="24" style="color: #677f99;"></Icon>
                <div @click="showFilePreview(file)" class="file-box">
                    <Tooltip :content="file.name ? file.name : $t('material.cloudPush.image')"
                        placement="top">
                        <p class="file-com">
                            <span class="file-name">{{file.name ? file.name.substring(0,file.name.lastIndexOf('.')) : $t('material.cloudPush.image')}}</span>
                            <span class="file-type" v-if="file.name">.{{file.type}}</span>
                        </p>
                    </Tooltip>
                    <p class="file-size">{{sizeFilter(file.size)}}</p>
                </div>
                <!-- <img :src="file.url" @click="imgPreview" @onload="() => window.URL.revokeObjectURL(file.url)"> -->
                <div v-if="file.uploading"
                    class="uploading-cover">
                    <Progress type="circle" :percentage="Math.ceil(file.uploadPercent)" color="#FFF"
                            :stroke-width="3" :width="33" style="vertical-align: middle;">
                    </Progress>
                </div>
                <div v-else
                    class="picture-item-cover">
                    <Icon v-if="!disabled"
                        type="close-circled"
                        @click.native="removeFile(index)"></Icon>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import * as qiniu from 'qiniu-js';
    import { mapState } from 'vuex';
    export default {
        name: 'uploadFiles',
        props: [
            'disabled',
            'fileCountLimit',
            'filesList',
            'isHidddenBtn'
        ],
        computed: {
            ...mapState({
                userId: 'userId',
                qiniuHttp: 'qiniuHttp'
            })
        },
        data() {
            return {};
        },
        methods: {
            uploadTrigger() {
                if (this.filesList.length === this.fileCountLimit) {
                    this.$Message({
                        message: `${this.$t('crm.Modal.file_canOnlyUpload')} ${this.fileCountLimit} ${this.$t('crm.Modal.file_NumberOfPicture')}`,
                        type: 'warning'
                    });
                } else {
                    this.$refs.uploadEl.value = '';
                    this.$refs.uploadEl.click();
                }
            },
            handleUpload(event) {
                const files = event.target.files;
                if (files && files.length) {
                    // 各类校验
                    // 如: 重名校验
                    // ...

                    // 文件数量校验
                    const overage = this.fileCountLimit - this.filesList.length;
                    if (files.length > overage) {
                        // let tempFiles = [];
                        // for (let i = 0; i < overage; i++) {
                        //     tempFiles[i] = files[i];
                        // }
                        // files = tempFiles;
                        this.$Message({
                            message: `${this.$t('crm.Modal.file_canOnlyUpload')} ${this.fileCountLimit} ${this.$t('crm.Modal.file_NumberOfPicture')}`,
                            type: 'warning',
                            duration: 5000,
                            closable: true
                        });
                        return;
                    }

                    // 获取 token 后批量发送上传请求
                    if (files.length) {
                        this.$commonApi.uptoken().then(response => {
                            if (response.uptoken) {
                                const token = response.uptoken;
                                for (let i = 0; i < files.length; i++) {
                                    files[i].uid = parseInt(`${this.userId}${i}${Date.now()}`);
                                    this.upload(files[i], token);
                                }
                            } else {
                                this.$Message.warning(this.$t('error_getUploadToken'));
                            }
                        }).catch(error => {
                            console.error(error);
                            this.$Message.error(this.$t('crm.Modal.error_uploadImage'));
                        });
                    }
                }
            },
            async upload(file, token) {
                if (file) {
                    const name = file.name;
                    const size = file.size;
                    const type = name.split('.').slice(-1)[0];
                    const keyName = `${file.uid}_crmDocument.${type}`;
                    const config = {
                        useCdnDomain: true,
                        region: qiniu.region.z0
                    };
                    const putExtra = {
                        fname: '',
                        params: {},
                        mimeType: null
                    };
                    // let key = file.name;
                    // 添加上传dom面板
                    const next = (response) => {
                        const index = this.filesList.findIndex(item => item.uploading && item.name === name);
                        if (index !== -1) {
                            this.$set(this.filesList, index, Object.assign(this.filesList[index], { uploadPercent: response.total.percent }));
                        }
                    };
                    const error = (response) => {
                        if (response.message === 'file type doesn\'t match with what you specify') {
                            this.$Message.error(this.$t('crm.Modal.error_formatUploadImage'));
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_uploadImage'));
                        }

                        const index = this.filesList.findIndex(item => item.uploading && item.name === name);
                        if (index !== -1) {
                            this.removeFile(index);
                        }
                    };
                    const complete = (response) => {
                        const url = `${this.qiniuHttp}${response.key}`;

                        // 两秒后进度条消失
                        setTimeout(() => {
                            const index = this.filesList.findIndex(item => item.uploading && item.name === name);
                            if (index !== -1) {
                                this.$set(this.filesList, index, Object.assign(this.filesList[index], {
                                    url,
                                    uploading: false
                                }));
                            }
                        }, 1000);
                    };

                    // 调用sdk上传接口获得相应的observable，控制上传和暂停
                    const observable = await this.$qiniuUpload(file, keyName, putExtra, config, token);

                    // 渲染文件图标 + 进度条
                    this.filesList.push({
                        name,
                        type,
                        size,
                        id: -1,
                        uploading: true,
                        uploadPercent: 0
                    });

                    // 开始上传
                    observable.subscribe(next, error, complete);
                }
            },
            // 删除附件
            removeFile(index) {
                this.filesList.splice(index, 1);
            },
            // 使用filePreview组件预览文件
            showFilePreview(data) {
                // 预览组件
                this.$store.commit('showFilePreview', true);
                // 将文件列表存到vuex
                this.$store.commit('firstFileId', null);
                // 将parentId到vuex
                this.$store.commit('setFollowUpFile', data);
            },
            // 按照不同文件类型显示不同图标
            format(format) {
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
            // 文件大小过滤器，filters 中的this不能指向vue,只能写了个方法，或者本域内定义that = this;
            sizeFilter(bytes) {
                if (Number(bytes) === -1) return this.$t('messageReport.unknown');
                const byte = parseInt(bytes);
                if (byte === 0) {
                    return '0 B';
                }
                const k = 1024;
                const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
                const i = Math.floor(Math.log(byte) / Math.log(k));
                return `${(byte / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
            }
        },
        created() {
        }
    };
</script>

<style scoped lang="less">
    .upload-btn {
        padding: 0;
        margin-right: 12px;
        border:1px dashed #c9c9c9;
        flex-shrink: 0;
    }
    .file-list-box {
        width: calc(100% - 64px);
        display: flex;
        flex-wrap: nowrap;
        justify-content: start;
        align-items: center;
        overflow-x: auto;
        overflow-y: hidden;
    }
    .picture-item {
        flex-shrink: 0;
        display: flex;
        justify-content: start;
        align-items: center;
        width: 170px;
        padding: 0 10px;
        height: 40px;
        text-align: center;
        vertical-align: middle;
        border: 1px solid transparent;
        border-radius: 4px;
        //overflow: hidden;
        background: #F5F6F9;
        position: relative;
        margin-right: 8px;
        .file-box {
            width: calc(100% - 32px);
        }
        i {
            margin-right: 8px;
        }
        p {
            text-align: left;
            line-height: 16px;
        }
        .file-com{
            display: flex;
            justify-content: start;
            .file-name {
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .file-type {
                white-space: nowrap;
            }
        }
        &:hover {
            .picture-item-cover {
                display: block;
            }
        }
    }

    .uploading-cover {
        position: absolute;
        top: -1px;
        bottom: -1px;
        left: -1px;
        right: -1px;
        border-radius: 4px;
        line-height: 38px;
        background: rgba(0, 0, 0, .4);
        /deep/.el-progress__text{
            color: #fff;
        }
    }

    .picture-item-cover {
        display: none;
        line-height: 1;
        position: absolute;
        top: 0px;
        right: -10px;

        i {
            color: #EA4335;
            font-size: 14px;
            cursor: pointer;
        }
    }

    * /deep/ .el-progress-bar__outer {
        background-color: rgba(255, 255, 255, .3);
    }
</style>
