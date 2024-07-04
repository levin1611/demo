<template>
    <div>
        <Button :disabled="disabled"
                size="large"
                style="background-color: #FFFFFF;border: 1px solid #ABBFD5;border-radius: 4px;color: rgba(0,0,0,0.80);"
                @click="uploadTrigger">
            <img src="./images/export.svg"></img>
            上传头像
        </Button>
        <input :disabled="disabled"
               type="file"
               multiple
               accept="image/png,image/jpeg,image/gif"
               style="display: none"
               ref="uploadEl"
               @change="handleUpload">
        <div class="edit-card-image">仅支持JPG、动态GIF和PNG图片文件，且文件小于3M。（使用高质量图片，可生成高清头像）</div>
        <div class="picture-item" v-for="(file, index) in pictures">
            <img :src="file.url" @onload="() => window.URL.revokeObjectURL(file.url)">
<!--            <img :src="file.url" @click="imgPreview" @onload="() => window.URL.revokeObjectURL(file.url)">-->
<!--            <div v-if="file.uploading"-->
<!--                 class="uploading-cover">-->
<!--                <Progress type="circle" :percentage="Math.ceil(file.uploadPercent)" color="#FFF"-->
<!--                          :stroke-width="3" :width="33" style="vertical-align: middle;">-->
<!--                    <div style="font-size: 10px;color: #FFF;transform: scale(0.9)">{{-->
<!--                        `${Math.ceil(file.uploadPercent)}%` }}-->
<!--                    </div>-->
<!--                </Progress>-->
<!--            </div>-->
<!--            <div v-else-->
<!--                 class="picture-item-cover">-->
<!--                <Icon v-if="!disabled"-->
<!--                      type="close-circled"-->
<!--                      @click.native="imgRemove(index)"></Icon>-->
<!--            </div>-->
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
            'pictures'
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
                if (this.pictures.length === this.fileCountLimit && (this.fileCountLimit !== 1)) {
                    this.$Message.warning(`${this.$t('crm.Modal.info_canOnlyUpload')} ${this.fileCountLimit} ${this.$t('crm.Modal.info_NumberOfPicture')}`);
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
                    if (files.length > overage && this.fileCountLimit !== 1) {
                        this.$Message.warning({
                            message: `${this.$t('crm.Modal.info_canOnlyUpload')} ${this.fileCountLimit} ${this.$t('crm.Modal.info_NumberOfPicture')}`,
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
                            console.log('response', response);
                            if (response.data) {
                                // let token = response.data.data.token;
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
                        region: qiniu.region.z0
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
                        this.$emit('func', url);
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
                    // let observable = await this.$cloudQiniuUpload(file, null, putExtra, config, token);
                    const observable = await this.$qiniuUpload(file, null, putExtra, config, token);
                    // 获取文件预览 url
                    const url = window.URL.createObjectURL(file);
                    // 渲染文件图标 + 进度条
                    if (this.fileCountLimit === 1) {
                        // 只允许传一张图片时
                        this.pictures = [{
                            name,
                            url
                        }];
                    } else {
                        this.pictures.push({
                            name,
                            url,
                            uploading: true,
                            uploadPercent: 0
                        });
                    }
                    console.log('this.pictures', this.pictures);

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
    .edit-card-image{
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: rgba(0,0,0,0.28);
        letter-spacing: 0;
        line-height: 18px;
        margin-top: 12px;
    }
    .picture-item {

        background: #fff;
        position: relative;
        padding: 20px 0;

        img {
            cursor: pointer;
            width: 76px;
            height: 76px;
            line-height: 76px;
            text-align: center;
            vertical-align: middle;
            border:1px solid #bbbbbb;
            border-radius: 50%;
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
