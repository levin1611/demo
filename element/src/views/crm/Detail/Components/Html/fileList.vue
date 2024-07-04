<template>
    <div class="mini-file-list">
        <div v-if="item.folderId"
             class="mini-file-list-date">
             <div style="width: calc(100% - 32px);margin-right: 12px;">
                <!-- 展开/收起 -->
                <Icon custom="custom custom-drop-down-triangle"
                    @click="isOpened = !isOpened"
                    :class="{'mini-file-list-toggle': true, 'mini-file-list-toggle-fold': isOpened}"></Icon>
                <svg class="svg-icon" aria-hidden="true" style="width: 22px; height: 22px;position:relative;top:4px;margin-right:6px;">
                    <use xlink:href="#custom-fp-paper-file"></use>
                </svg>
                <Tooltip :content="item.folderName"
                        placement="top-start">
                    <span class="date_content">
                        {{ item.folderName }}
                    </span>
                </Tooltip>
             </div>

            <!-- 文件操作 -->
            <Poptip trigger="hover"
                    placement="bottom-end"
                    popper-class="mini-title-file-operate-pop">
                <Button slot="reference"
                        type="text"
                        style="transform: rotate(90deg)"
                        icon="custom custom-more-vertical"
                        class="mini-file-operate-trigger"></Button>
                <div>
                    <ul class="_font_size12">
                        <!-- 上传文件 -->
                        <li v-if="uploadFile"
                            @click="$emit('triggerUpload', item.folderId)"
                            class="piwik_companyDetail_uploadDocument">{{ $t('crm.Html.uploadDocument') }}</li>
                        <!-- 全部选中 -->
                        <li @click="allChecked">{{ $t('crm.Html.selectAll') }}</li>
                        <!-- 重命名 -->
                        <li @click="$emit('showAddFolder', {folderId: item.folderId, folderName: item.folderName})">{{ $t('crm.Html.rename') }}</li>
                        <!-- 删除 -->
                        <li v-if="ableDelete"
                            @click="$emit('deleteFolder', item.folderId)"
                            class="inquiry-deletebutton">{{ $t('crm.Html.delete') }}</li>
                    </ul>
                </div>
            </Poptip>
        </div>

        <div v-show="isOpened || !item.folderId">
            <!-- 文件列表 -->
            <div v-for="file in fileList"
                 :key="file.id"
                 class="mini-file-item-container">
                <div class="mini-file-item"
                     :style="item.folderId ? '' : 'padding-left:0;'"
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
                                    {{ file.createUser }}&nbsp;{{ file.createTime | timeFormat("DateTimeHm") }}
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
                                        <!-- 移动 -->
                                        <li @click="move(file)">{{ $t('crm.Html.move') }}</li>
                                        <!-- 下载 -->
                                        <li @click="download(file)"
                                            class="inquiry-documentdownload">{{ $t('mail.download') }}</li>
                                        <!-- 预览 -->
                                        <li @click="preview(file)"
                                            class="inquiry-documentpreviewbutton">{{ $t('mail.preview') }}</li>
                                        <!-- 删除 -->
                                        <li v-if="ableDelete"
                                            @click="$emit('fileDelete', file)"
                                            class="inquiry-deletebutton">{{ $t('crm.Html.delete') }}</li>
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

            <!-- 无数据 -->
            <div v-if="fileList.length === 0"
                class="text-center">{{ searching ? $t('crm.newDetail.noResult') : $t('crm.Html.nothing') }}</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'miniFileList',
        props: [
            'isHighSeas',
            'list_picked_file',
            'ableDelete',
            'uploadFile',
            'searching',
            'item'
        ],
        data() {
            return {
                isOpened: false
            };
        },
        watch: {
            item: {
                handler(val) {
                    this.fileList = this.item.folderId ? this.item.documentList : [this.item];
                },
                immediate: true
            }
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
                console.log('move ====== 移动到', file);
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
            },
            // 全部选中
            allChecked(id = 0) {
                this.isOpened = true;
                this.fileList.map((item) => {
                    item.checked = true;
                    this.$emit('trigger_pick_file', item);
                });
                this.$nextTick(() => {
                    this.$forceUpdate();
                });
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

        .date_content{
            display: inline-block;
            width: calc(100% - 56px);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: top;
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
                background-color: #F6F7FA;

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
            transform: scale(.7) rotate(270deg);
            cursor: pointer;
            margin-right: 14px;
        }

        &-toggle-fold {
            transform: scale(.7) rotate(0deg);
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
                    width: 50%;
                }
            }

            .mini-file-name {
                font-size: 12px;
                color: rgba(0, 0, 0, 0.80);
                margin: 0 4px;
                flex: 1;
                width: 40%;
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
                    vertical-align: top;
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
