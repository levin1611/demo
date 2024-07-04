<template>
    <div class="drag-file-item-container">
        <!--<div :class="{'drag-file-item': true, 'drag-image-item': file.type === 'image'}">-->
        <div class="drag-file-item">
            <!-- 进度条 -->
            <div v-if="file.showProgress"
                 ref="progress"
                 class="drag-file-item-process"></div>
            <!-- 文件类型图标/已上传完成图片的缩略图 -->
            <div v-if="file.type === 'image' && file.url"
                 class="drag-file-item-picture">
                <img :src="file.url">
            </div>
            <Icon v-else
                  :custom="fileIcon"
                  :size="22"></Icon>
            <!-- 文件读取中(下载 url 形成 file 对象过程中) -->
            <span v-if="file.status === 'reading'" style="font-size: 12px;color: #ea4335;z-index: 99;">{{`(${$t('whatsapp_manage.fileReading')})`}}</span>
            <!-- 文件发送中的状态,显示于图片图标之后 -->
            <span v-else-if="file.isSending && file.type === 'image'" style="font-size: 12px;color: #ea4335;">{{`(${$t('whatsapp_manage.fileSending')})`}}</span>
            <!-- 文件名 -->
            <Tooltip v-if="file.type !== 'image'"
                     :content="file.name"
                     placement="top">
                <div class="drag-file-item-name">
                    <!-- 文件发送中的状态 -->
                    <span v-if="file.isSending" style="font-size: 12px;color: #ea4335;min-width: 50px;">{{`(${$t('whatsapp_manage.fileSending')})`}}</span>
                    <span class="drag-file-item-name-without-ext">{{ file.name | removeExt(file.suffix) }}</span>
                    <span v-if="file.suffix"
                          class="drag-file-item-name-ext">.{{ file.suffix }}</span>
                </div>
            </Tooltip>
            <!-- 删除按钮 -->
            <Icon :size="14"
                  v-if="!file.isSending"
                  @click="removeFile"
                  class="custom custom-preview-delete drag-file-item-remove"></Icon>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'drag-file-item',
        props: {
            file: {
                type: Object
            }
        },
        computed: {
            fileIcon() {
                return this.getAttachmentIcon(this.file.suffix);
            }
        },
        data() {
            return {
            };
        },
        filters: {
            removeExt(val, ext) {
                if (ext && val.endsWith(`.${ext}`)) {
                    return val.slice(0, val.lastIndexOf(`.${ext}`));
                } else {
                    return val;
                }
            }
        },
        methods: {
            // 获取文件对应 Icon
            getAttachmentIcon(ext) {
                switch (ext) {
                    case 'gif':
                        return 'custom custom-file-gif';
                    case 'jpg':
                    case 'jpeg':
                        return 'custom custom-file-jpg';
                    case 'png':
                        return 'custom custom-file-png';
                    case 'pdf':
                        return 'custom custom-file-pdf';
                    case 'xls':
                    case 'xlsx':
                        return 'custom custom-file-xls';
                    case 'txt':
                        return 'custom custom-file-text';
                    case 'ppt':
                    case 'pptx':
                        return 'custom custom-file-ppt';
                    case 'doc':
                    case 'docx':
                        return 'custom custom-file-doc';
                    case 'ai':
                        return 'custom custom-file-ai';
                    case 'dwg':
                        return 'custom custom-file-dwg';
                    default:
                        return 'custom custom-file-other';
                }
            },
            // 删除文件
            removeFile() {
                this.$emit('handleRemove', this.file);
            }
        },
        watch: {
            // 通过样式, 显示上传进度
            'file.percentage': {
                handler(val) {
                    if (val && this.$refs.progress) {
                        if (val < 100) {
                            this.$refs.progress.setAttribute('style', `right: ${100 - val}%;`);
                        } else {
                            this.$refs.progress.removeAttribute('style');
                        }
                    }
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .drag-file-item-container {
        padding: 6px;
        vertical-align: bottom;
        display: inline-block;

        .drag-file-item {
            background: #FFFFFF;
            border: 1px solid #EAEAEA;
            border-radius: 2px;
            height: 32px;
            padding: 4px 6px;
            position: relative;
            display: flex;

            .drag-file-item-process {
                position: absolute;
                background: #DEE9FC;
                top: 0;
                bottom: 0;
                left: 0;
            }

            .drag-file-item-name {
                font-size: 12px;
                color: rgba(0, 0, 0, 0.80);
                margin-left: 10px;
                display: inline-flex;
                max-width: 185px;
                vertical-align: middle;
                z-index: 1;

                .drag-file-item-name-without-ext {
                    max-width: 60%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .drag-file-item-name-ext {
                    white-space: nowrap;
                }
            }

            .drag-file-item-remove {
                position: absolute;
                top: -7px;
                right: -7px;
                color: #666;
                cursor: pointer;
                display: none;
            }

            &:hover {
                .drag-file-item-remove {
                    display: block;
                }
            }
        }

        .drag-image-item {
            box-shadow: inset 0 1px 3px 0 rgba(0,0,0,0.50);;
            border: none;
            border-radius: 4px;
            padding: 0;
            height: auto;

            .drag-file-item-remove {
                position: absolute;
                top: -6px;
            }
        }
    }

    .drag-file-item-picture {
        display: inline-block;
        width: 22px;
        height: 22px;
        text-align: center;
        background: #fff;

        img {
            max-width: 100%;
            max-height: 100%;
            vertical-align: middle;
        }
    }
</style>
