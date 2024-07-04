<template>
    <div class="modalItem customFieldTextarea">
        <div style="display: inline-block;width: 130px;line-height: 38px;margin-right: 5px;padding-right: 5px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;text-align: right;vertical-align: top">
            <span style="color: #3b78de;cursor: pointer;" @click="triggerUpload">
                <Icon type="upload"></Icon>{{ $t('crm.Html.uploadDocument') }}
            </span>
            <input style="display: none" ref="uploadEl" type="file" multiple @change="handleUpload"/>
        </div>

        <div v-if="documents.length" style="display: inline-block;">
            <template v-for="(document, index) in documents">
                <Tag closable
                    :key="index"
                     type="info"
                     effect="plain"
                     color="#F7F7F7"
                     size="small"
                     @close="removeDocument(index)"
                     class="document-tag">
                    <span :title="document.name">{{ document.name.length > 50 ? `${document.name.slice(0, 50)}...` : document.name }}</span>
                    <Progress v-if="document.uploading"
                              :percentage="document.uploadPercent"
                              :stroke-width="6"
                              color="#4285F4"
                              :show-text="false"
                              style="display: inline-block;width: 80px;margin: 0 20px;position: relative;top: -1px;"></Progress>
                </Tag>
                <br>
            </template>
        </div>
    </div>
</template>

<script>
    import * as qiniu from 'qiniu-js';
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'uploadDocument',
        props: [
            'documents'
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
            triggerUpload() {
                this.$refs.uploadEl.value = '';
                this.$refs.uploadEl.click();
            },
            handleUpload(event) {
                let files = event.target.files;
                if (files && files.length) {
                    // 各类校验
                    // 如: 重名校验
                    // ...

                    // 文件数量校验
                    if (files.length > 10) {
                        const tempFiles = [];
                        for (let i = 0; i < 10; i++) {
                            tempFiles[i] = files[i];
                        }
                        files = tempFiles;
                        this.$Message.error({
                            message: this.$t('crm.Html.info_uploadLimit'),
                            duration: 5000,
                            closable: true
                        });
                    }

                    // 获取 token 后批量发送上传请求
                    if (files.length) {
                        util.oldAjax({
                            url: '/file-sys/api/uptoken',
                            method: 'post'
                        }).then(response => {
                            if (response.data) {
                                const token = response.data.uptoken;
                                for (let i = 0; i < files.length; i++) {
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
            async upload(document, token) {
                if (document) {
                    // 获取 document 各项信息, 上传完成前就显示文件 + 进度条
                    const name = document.name;
                    let suffix = '';
                    if (name.indexOf('.') !== -1) {
                        suffix = name.split('.').slice(-1)[0].toLowerCase();
                        if (!/^[A-Za-z]+$/.test(suffix)) {
                            suffix = '';
                        }
                    }
                    // 去掉重名限制
                    // if (this.documentNameMap.has(name)) {
                    //     this.$Message.info({
                    //         message: `【${name}】${this.$t('crm.Html.error_existedFileName')}`,
                    //         duration: 5000,
                    //         closable: true
                    //     });
                    // } else {
                    const config = {
                        useCdnDomain: true,
                        region: qiniu.region.z0
                    };
                    const putExtra = {
                        fname: '',
                        params: {},
                        mimeType: null
                    };
                    // 添加上传dom面板
                    const next = response => {
                        const index = this.documents.findIndex(item => item.uploading && item.name === name);
                        if (index !== -1) {
                            const temp = this.documents[index];
                            this.$set(this.documents, index, Object.assign(temp, { uploadPercent: response.total.percent }));
                        }
                    };
                    const error = response => {
                        console.error(response);
                        this.$Message.error(`【${name}】${this.$t('crm.Modal.error_uploadImage')}`);

                        const index = this.documents.findIndex(item => item.uploading && item.name === name);
                        if (index !== -1) {
                            this.documents.splice(index, 1);
                        }
                    };
                    const complete = response => {
                        const url = `${this.qiniuHttp}${response.key}`;
                        // this.documentNameMap.set(name, url);

                        // 两秒后进度条消失
                        setTimeout(() => {
                            const index = this.documents.findIndex(item => item.uploading && item.name === name);
                            if (index !== -1) {
                                const temp = this.documents[index];
                                this.$set(this.documents, index, Object.assign(temp, { url, uploading: false }));
                            }
                        }, 1000);
                    };
                    // 调用sdk上传接口获得相应的observable，控制上传和暂停
                    const observable = await this.$qiniuUpload(document, null, putExtra, config, token);

                    // 渲染文件图标 + 进度条
                    // this.documentNameMap.set(name, 'loading');
                    this.documents.push({
                        name,
                        suffix,
                        uploading: true,
                        uploadPercent: 0,
                        createTime: Date.now(),
                        subscription: observable.subscribe(next, error, complete) // 开始上传
                    });
                    // }
                }
            },
            removeDocument(index) {
                const temp = this.documents.splice(index, 1);
                if (temp && temp[0]) {
                    const removedFile = temp[0];
                    if (removedFile.uploading) {
                        removedFile.subscription.unsubscribe();
                    }
                }
            }
        },
        watch: {}
    };
</script>

<style scoped lang="less">
    .document-tag {
        line-height: 22px;
        margin-top: 8px;
        vertical-align: middle;
        border: 1px solid #f4f5f8;
        border-radius: 12px;
        color: rgba(0, 0, 0, .8);

        &:hover {
            opacity: .85;
            background-color: #e6efff;
        }

        /deep/ .el-tag__close {
            font-size: 14px;

            &:hover {
                color: #666;
                background-color: transparent;
            }
        }
    }
</style>
