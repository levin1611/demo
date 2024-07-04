<template>
    <div class="mini-file-list">
        <div>
            <!-- 文件列表 -->
            <div v-for="(file, index) in fileList"
                 :key="index"
                 class="mini-file-item-container">
                <div class="mini-file-item"
                     style="padding-left:0;"
                     :class="{'picked-mini-file': list_picked_file.find(item => item.id === file.id)}">
                    <div class="file_content">
                        <div class="file_name">
                            <!-- 选择框 -->
                            <Checkbox :disabled="file.uploading"
                                v-model="file.checked"
                                @change="$emit('trigger_pick_file', file)"
                                class="mini-file-check"></Checkbox>

                            <!-- 文件图标 -->
                            <fileNameIcon :iconName="file.documentType"
                                        :styles="{ fontSize: '24px' }"></fileNameIcon>

                            <!-- 文件名 -->
                            <div class="mini-file-name-item">
                                <Tooltip :content="file.documentName"
                                        placement="top-start">
                                    <div class="mini-file-name">
                                        <span class="mini-file-name-without-ext">{{ file.documentName | removeExt(file.documentType) }}</span>
                                        <span v-if="file.documentType"
                                            class="mini-file-name-ext">.{{ file.documentType }}</span>
                                    </div>
                                </Tooltip>
                                <div class="file_time">
                                    <span :title="file.sendUser">{{ $dym.characterOmitStr(file.sendUser, 10) }}</span>&nbsp;{{ $t('crm.Html.sendTo') }}&nbsp;<span :title="file.receiptUser">{{ $dym.characterOmitStr(file.receiptUser, 10) }}</span>
                                    <svg aria-hidden="true"
                                            v-if="file.fromOrToFlag === 2"
                                            style="font-size: 16px;margin-left: 12px;"
                                            class="svg-icon">
                                        <use xlink:href="#custom-icon_receive"></use>
                                    </svg>
                                    <svg aria-hidden="true"
                                            v-if="file.fromOrToFlag === 1"
                                            style="font-size: 16px;margin-left: 12px;"
                                            class="svg-icon">
                                        <use xlink:href="#custom-icon_send1"></use>
                                    </svg>
                                </div>
                                <div class="file_time">
                                    {{ file.mailSendTime }}
                                </div>
                            </div>

                            <!-- 文件操作 -->
                            <Poptip v-if="!file.uploading"
                                    trigger="hover"
                                    placement="bottom-end"
                                    popper-class="mini-file-operate-pop">
                                <Button slot="reference"
                                        type="text"
                                        style="transform: rotate(90deg)"
                                        icon="custom custom-more-vertical"
                                        class="mini-file-operate-trigger"></Button>
                                <div>
                                    <ul class="_font_size12">
                                        <!-- 预览 -->
                                        <li v-if="!isHighSeas"
                                            @click="preview(file)"
                                            class="inquiry-documentpreviewbutton">{{ $t('mail.preview') }}</li>
                                        <!-- 下载 -->
                                        <li v-if="!isHighSeas"
                                            @click="download(file)"
                                            class="inquiry-documentdownload">{{ $t('mail.download') }}</li>
                                        <!-- 同步到文档 -->
                                        <li v-if="!isHighSeas && syncDocuments"
                                            @click="() => $emit('synchronizeFile', file)">{{ $t('crm.Html.syncToDocument') }}</li>
                                    </ul>
                                </div>
                            </Poptip>
                        </div>
                    </div>
                </div>

                <!-- 进度条 -->
                <Progress v-if="file.uploading"
                          :percentage="file.uploadPercent"
                          :stroke-width="6"
                          color="#4285F4"
                          :show-text="false"
                          class="mini-file-progress"></Progress>
            </div>
        </div>

        <!-- 无数据 -->
        <div v-if="fileList.length === 0"
             class="text-center">{{ searching ? $t('crm.newDetail.noResult') : $t('crm.Table.noData') }}</div>
    </div>
</template>

<script>
    export default {
        name: 'miniFileList',
        props: [
            'isHighSeas',
            'fileList',
            'list_picked_file',
            'syncDocuments',
            'disabled',
            'searching'
        ],
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
            download(file) {
                window.open(`${file.documentPath.slice(file.documentPath.split(':')[0].length + 1)}?attname=${file.documentName}`);
            },
            // 移动
            move(file) {
                this.$emit('moveFile', file);
            },
            preview(file) {
                switch (file.documentType) {
                    case 'jpg':
                    case 'jpeg':
                    case 'png':
                    case 'gif':
                        window.open(`${file.documentPath}?imageView2/0`);
                        break;
                    case 'txt':
                    case 'pdf':
                        // var a = document.createElement('a');
                        // a.href = file.documentPath;
                        // a.target = '_blank';
                        // a.style.display = 'none';
                        // document.body.appendChild(a);
                        // a.click();
                        // document.body.removeChild(a);
                        window.open(file.documentPath);
                        break;
                    // case 'txt':
                    case 'doc':
                    case 'docx':
                    case 'ppt':
                    case 'pptx':
                    case 'xls':
                    case 'xlsx':
                        window.open(`//view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(file.documentPath)}`);
                        break;
                    case 'zip':
                    case 'rar':
                    case '7z':
                    default:
                        this.$Message.info(this.$t('crm.Html.info_permittedFormatTip'));
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .mini-file-list {
        .text-center{
            color: rgba(0, 0, 0, 0.6);
            font-size: 12px;
        }
        &-date {
            font-size: 13px;
            color: rgba(0,0,0,0.80);
            line-height: 50px;
            height: 50px;
            border-bottom: 1px dashed #EAEAEA;
            display: flex;
            justify-content: space-between;

            &:hover {
                /deep/ .mini-file-operate-trigger {
                    visibility: visible;
                }
            }

            .mini-file-operate-trigger {
                color: #7e7e7e;
                padding-top: 5px;
                visibility: hidden;
            }
        }

        &-toggle {
            transform-origin:center center;
            transition: transform 0.2s;
            transform: scale(.7);
            cursor: pointer;
            margin-right: 14px;
        }

        &-toggle-fold {
            transform: scale(.7) rotate(180deg);
        }

        .mini-file-item-container {
            // padding: 0 30px;

            &:hover {
                background-color: #F6F7FA;
            }
        }

        .mini-file-item {
            position: relative;
            border-bottom: 1px dashed #EAEAEA;
            display: flex;
            align-items: center;
            padding: 10px 0 10px 30px;

            .mini-file-check {
                display: inline-block;
                margin-right: 10px;
            }

            .mini-file-img {
                width: 24px;
                height: 24px;
                margin: 0 4px;
            }

            .mini-file-name-item{
                display: flex;
                width: 100%;

                .file_time{
                    color: rgba(0, 0, 0, 0.6);
                    font-size: 12px;
                    width: 30% ;
                    margin-left: 10px;
                }
            }

            .mini-file-name {
                font-size: 12px;
                color: rgba(0, 0, 0, 0.80);
                margin: 0 4px;
                flex: 1;
                width: 30%;
                overflow: hidden;
                display: inline-flex;
                vertical-align: middle;

                .mini-file-name-without-ext {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    display: inline-block;
                    max-width: calc(100% - 24px);
                }

                .mini-file-name-ext {
                    white-space: nowrap;
                }
            }

            &:hover {
                /deep/ .mini-file-operate-trigger {
                    visibility: visible;
                }
            }

            .mini-file-operate-trigger {
                color: #7e7e7e;
                padding-top: 5px;
                visibility: hidden;
            }

            .file_content{
                width: 100%;

                .file_name{
                    display: flex;
                }
            }
        }

        .mini-file-progress {
            width: 100%;
            margin-top: -6px;
            padding-left: 26px;
        }

        .picked-mini-file {
            background-color: rgb(243, 244, 247);
        }
    }
</style>

<style lang="less">
    .mini-file-operate-pop {
        min-width: 90px;

        li {
            height: 30px;
            line-height: 30px;
            padding: 0 16px;
            cursor: pointer;

            &:hover {
                background-color: #f3f4f7;
            }
        }
    }

    .mini-title-file-operate-pop{
        min-width: 90px;

        li {
            height: 30px;
            line-height: 30px;
            padding: 0 16px;
            cursor: pointer;

            &:hover {
                background-color: #f3f4f7;
            }
        }
    }
</style>
