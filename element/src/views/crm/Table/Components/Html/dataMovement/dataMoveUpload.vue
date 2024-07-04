<template>
    <div class="data-movement-upload">
        <div class="data-movement-upload-area">
            
            <div @click="downloadCountryArea"
                class="operate">
                <Icon type="arrow-down-a"
                    size="20"></Icon>
                <span>{{ '下载国家地区对应表' }}</span>
            </div>
            <DMUpload
                    ref="DMfileUpload"
                    multiple
                    type="drag"
                    :action="action"
                    :format="['xlsx','xls']"
                    :name="fileName"
                    :isUploadFiles="isUploadFiles"
                    :on-format-error="handleFormatError"
                    @excelUploaded="excelUploaded"
                    @getUploadFilesList="getUploadFilesList"
                    @noFilesFlag="noFilesFlag">
            </DMUpload>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import DMUpload from './dataMoveUpload/DMUpload';

    export default {
        name: 'dataMoveUpload',
        components: {
            DMUpload
        },
        computed: {
            ...mapState([
                'qiniuHttp'
            ])
        },
        props: {
            isUploadFiles: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                action: '',
                middlewareData: [], // 传参中间值
                fileName: '',
                isUploadFinished: false, // 上传是否全部完成
                notifyPromise: Promise.resolve()
            };
        },
        methods: {
            // 文件上传失败
            handleFormatError(file) {
                // this.$Notice({
                //     type: 'error',
                //     title: this.$t('data_movement.upload_type_error_title'),
                //     desc: file.name + this.$t('data_movement.upload_type_error_body')
                // });
                /**
                 * @author: Yiming Cai
                 * @description: elementUI的notification组件会出现多个提醒重叠的现象 故使用
                 * 以下的解决方案 后续如果修改源码的话 将修改成上面注释的代码**/
                this.notifyPromise = this.notifyPromise.then(this.$nextTick).then(() => {
                    this.$Notice({
                        type: 'error',
                        title: this.$t('data_movement.upload_type_error_title'),
                        desc: file.name + this.$t('data_movement.upload_type_error_body')
                    });
                });
            },
            // 下载国际地区对应表
            downloadCountryArea() {
                window.open(`${this.qiniuHttp}/systemfile/%E5%9B%BD%E5%AE%B6%E5%9C%B0%E5%8C%BA%E5%AF%B9%E5%BA%94%E8%A1%A8.xlsx`);
            },
            // 文件上传成功
            excelUploaded(data) {
                this.middlewareData = data;
                this.$emit('middlewareData', this.middlewareData);
            },
            // 获取到上传完成之后的文件列表
            getUploadFilesList(fileList) {
                this.isUploadFinished = true;
                this.$emit('isUploadFinished', this.isUploadFinished);
            },
            // 没有文件列表，例如清空文件之后设置成 false
            noFilesFlag(val) {
                this.$emit('isNoFiles', false);
            }
        },
    };
</script>

<style scoped lang="less">
    .data-movement-upload {
        width: 100%;
        height: 100%;

        .data-movement-upload-area {
            width: 100%;
            height: 100%;
            background-color: #FFFFFF;
            text-align: center;
            position: relative;

            .el-upload {
                .el-upload-dragger {
                    border: none;
                    cursor: default !important;
                }
            }

            .data-movement-upload-tips-wrapper {
                margin-top: 4.4%;

                .data-movement-upload-tips {
                    margin-left: 28.3%;
                    margin-right: 28.3%;
                    font-size: 14px;
                    color: rgba(0, 0, 0, .4);
                    .el-button {
                        &:hover {
                            background-color: #fff4ea !important;
                        }
                    }
                }
            }

            .operate {
                color: #FA8241;
                cursor: pointer;
                position: absolute;
                top: 12px;
                z-index: 9;
                right: 12px;

                & i {
                    vertical-align: middle;
                }
            }

        }
    }


</style>
<style lang="less">
    .data-movement-upload-area {
        .el-upload-dragger {
            cursor: default;
        }
    }
    .data-movement-upload-tips {
        margin-left: 28.3%;
        margin-right: 28.3%;
        font-size: 14px;
        color: rgba(0, 0, 0, .4);
        .el-button {
            background: #FFF !important;
            border-color: #fa8241 !important;
            &:hover {
                background-color: #fff4ea !important;
            }
            &:focus {
                background-color: #fff4ea !important;
            }
            &:active {
                background: #FFE1D1 !important;
            }
        }
    }
</style>
