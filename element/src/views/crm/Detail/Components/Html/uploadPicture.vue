<template>
    <div>
        <Button v-show="!isHidddenBtn"
            :disabled="disabled"
            color="#fb8b2f"
            size="large"
            class="upload-btn"
            style="border:1px dashed #c9c9c9;padding: 0;margin-right: 12px;"
            @click="uploadTrigger">
            <Icon type="plus" size="16" color="#c9c9c9"></Icon>
        </Button>
        <input :disabled="disabled"
               type="file"
               multiple
               accept="image/png,image/jpeg,image/gif"
               style="display: none"
               ref="uploadEl"
               @change="handleUpload">
        <div class="picture-item" :key="index" v-for="(file, index) in pictures">
            <img :src="file.url" @click="imgPreview" @onload="() => window.URL.revokeObjectURL(file.url)">
            <div v-if="file.uploading"
                 class="uploading-cover">
                <Progress type="circle" :percentage="Math.ceil(file.uploadPercent)" color="#FFF"
                          :stroke-width="3" :width="33" style="vertical-align: middle;">
                    <div style="font-size: 10px;color: #FFF;transform: scale(0.9)">{{
                        `${Math.ceil(file.uploadPercent)}%` }}
                    </div>
                </Progress>
            </div>
            <div v-else
                 class="picture-item-cover">
                <Icon v-if="!disabled"
                      type="close-circled"
                      @click.native="imgRemove(index)"></Icon>
            </div>
        </div>
    </div>
</template>

<script>
    import * as qiniu from 'qiniu-js';
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'uploadPicture',
        props: [
            'disabled',
            'fileCountLimit',
            'pictures',
            'isHidddenBtn'
        ],
        computed: {
            ...mapState({
                qiniuHttp: 'qiniuHttp'
            })
        },
        data() {
            return {};
        },
        methods: {
            uploadTrigger() {
                if (this.pictures.length === this.fileCountLimit) {
                    this.$Message({
                        message: `${this.$t('crm.Modal.file_canOnlyUpload')} ${this.fileCountLimit} ${this.$t('crm.Modal.info_NumberOfPicture')}`,
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
                    const overage = this.fileCountLimit - this.pictures.length;
                    if (files.length > overage) {
                        // let tempFiles = [];
                        // for (let i = 0; i < overage; i++) {
                        //     tempFiles[i] = files[i];
                        // }
                        // files = tempFiles;
                        this.$Message({
                            message: `${this.$t('crm.Modal.file_canOnlyUpload')} ${this.fileCountLimit} ${this.$t('crm.Modal.info_NumberOfPicture')}`,
                            type: 'warning',
                            duration: 5000,
                            closable: true
                        });
                        return;
                    }

                    // 获取 token 后批量发送上传请求
                    if (files.length) {
                        util.oldAjax({
                            url: '/file-sys/api/uptoken',
                            method: 'post'
                        }).then(response => {
                            if (response.data) {
                                const token = response.data.uptoken;
                                const fileLength = this.pictures.length;
                                for (let i = 0; i < files.length; i++) {
                                    this.upload(files[i], fileLength + i, token);
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
            async upload(file, id, token) {
                if (file) {
                    const name = `${id}-${Date.now()}`; // 使用 index + 时间戳 来唯一标志本次上传的文件, 据此定位并渲染进度条
                    const config = {
                        useCdnDomain: true,
                        region: qiniu.region.z0,
                        forceDirect: true
                    };
                    const putExtra = {
                        fname: '',
                        params: {},
                        mimeType: ['image/png', 'image/jpeg', 'image/gif']
                    };
                    // let key = file.name;
                    // 添加上传dom面板
                    const next = (response) => {
                        const index = this.pictures.findIndex(item => item.uploading && item.name === name);
                        if (index !== -1) {
                            this.$set(this.pictures, index, Object.assign(this.pictures[index], { uploadPercent: response.total.percent }));
                        }
                    };
                    const error = (response) => {
                        console.error(response);
                        if (response.message === 'file type doesn\'t match with what you specify') {
                            this.$Message.error(this.$t('crm.Modal.error_formatUploadImage'));
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_uploadImage'));
                        }

                        const index = this.pictures.findIndex(item => item.uploading && item.name === name);
                        if (index !== -1) {
                            this.imgRemove(index);
                        }
                    };
                    const complete = (response) => {
                        const url = `${this.qiniuHttp}${response.key}`;

                        // 两秒后进度条消失
                        setTimeout(() => {
                            const index = this.pictures.findIndex(item => item.uploading && item.name === name);
                            if (index !== -1) {
                                this.$set(this.pictures, index, Object.assign(this.pictures[index], {
                                    url,
                                    uploading: false
                                }));
                            }
                        }, 1000);
                    };

                    // 调用sdk上传接口获得相应的observable，控制上传和暂停
                    const observable = await this.$qiniuUpload(file, null, putExtra, config, token);

                    // 获取文件预览 url
                    const url = window.URL.createObjectURL(file);

                    // 渲染文件图标 + 进度条
                    this.pictures.push({
                        name,
                        url,
                        uploading: true,
                        uploadPercent: 0
                    });

                    // 开始上传
                    observable.subscribe(next, error, complete);
                }
            },

            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            },
            imgRemove(index) {
                this.pictures.splice(index, 1);
            }
        },
        watch: {}
    };
</script>

<style scoped lang="less">
    .picture-item {
        display: inline-block;
        width: 40px;
        height: 40px;
        line-height: 36px;
        text-align: center;
        vertical-align: middle;
        border: 1px solid transparent;
        border-radius: 4px;
        //overflow: hidden;
        background: #fff;
        position: relative;
        box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
        margin: 0 12px 12px 0;

        img {
            cursor: pointer;
            max-width: 100%;
            max-height: 100%;
            vertical-align: middle;
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
    }

    .picture-item-cover {
        display: none;
        line-height: 1;
        position: absolute;
        top: -4px;
        right: -4px;

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
