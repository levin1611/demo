<template>
    <ul :class="[prefixCls + '-list' , sortableClass]" :style="{width:`${ul_width-50}px`}" class="attament selfUploadList" v-if="sortableType">
        <li
            v-for="(file, index) in files"
            :key="index"
            :class="fileCls(file)"
            @click="handleClick(file)"
            class="file-list-item"
            :style="isEditFileName && index === currentFileIndex ? 'background: #F5F6F9;' : 'background: #F5F6F9;'">
            <div class="attament-info" @mouseenter="enters(file, index)" @mouseleave="leaver(file, index)">
                <span class="attament-text" :style="!isEditFileName && index === showFileOperationIndex?'width:calc(100% - 100px)':index === currentFileIndex?'width:calc(100% - 40px)':'width:100%'">
                        <!--<Icon :type="format(file)"></Icon> {{ file.name|format_name }}-->
                    <Icon :class="format(file)" size="14" style="color: #677f99;">
                    </Icon>
                    <input v-if="isEditFileName && index === currentFileIndex" type="text" class="fileName-input" v-model="editFileName">
                    <span :title="isEditFileName && index === currentFileIndex ? currentFileType : file.name" style="margin-right: 22px;">{{(isEditFileName && index === currentFileIndex ? currentFileType : file.name) }}</span>
                </span>
                <span class="attament-operate" v-if="!isEditFileName && index === showFileOperationIndex">
                    <!-- 拖拽排序 -->
                    <Icon custom="custom-drag-and-drop"
                            :size="14"
                            style="cursor: pointer;"></Icon>
                    <Tooltip :content="$t('edit')">
                        <Icon custom="custom-facebook-draft-box" @click="handleEdit(file, index)">
                        </Icon>
                    </Tooltip>
                    <Tooltip :content="$t('portal_set.preview')">
                        <Icon custom="custom-preview" class="mail-previewattachments" @click="handlePreview(file)">
                        </Icon>
                    </Tooltip>
                    <Tooltip :content="$t('delete')">
                        <Icon custom="custom-modal-close" class="mail-deleteattachment" @click.native="handleRemove(file)">
                        </Icon>
                    </Tooltip>
                </span>
                <span v-else-if="index === currentFileIndex" class="attament-operate">
                    <Tooltip transfer :content="$t('confirm')">
                    <Icon custom="custom-confirm mail-editattachmentname" @click="handleEditConfirm">
                    </Icon>
                    </Tooltip>
                </span>
            </div>
            <transition name="fade">
                <Progress
                        v-if="file.showProgress"
                        :stroke-width="2"
                        :percentage="parsePercentage(file.percentage)"
                        >
                </Progress>
            </transition>
        </li>
    </ul>
</template>
<script>
    import Sortable from 'sortablejs';
    const prefixCls = 'ivu-upload';
    let _this = '';
    export default {
        name: 'self-upload-list',
        props: {
            files: {
                type: Array,
                default() {
                    return [];
                }
            },
            ul_width: {
                type: Number
            },
            sortableClass: {
                type: String,
                default() {
                    return 'writeMailsSelfUploadList';
                }
            }
        },
        filters: {
            format_name(str, index) {
                if (_this.showFileOperationIndex === index) {
                    if (str.length > 10) {
                        return `${str.substring(0, 10)}...`;
                    } else {
                        return str;
                    }
                } else {
                    if (str.length > 15) {
                        return `${str.substring(0, 15)}...`;
                    } else {
                        return str;
                    }
                }
            }
        },
        mounted() {
            _this = this;
            this.initSortable();
        },
        data() {
            return {
                prefixCls: prefixCls,
                editFileName: '', // 用户输入的附件名称
                isEditFileName: false, // 是否编辑附件名称
                currentFileType: '', // 当前编辑的附件后缀名
                currentFileIndex: -1, // 当前编辑的附件索引
                knownFileTypes: [
                    'jpg', 'jpeg', 'png', 'bmp', 'webp',
                    'mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv',
                    'mp3', 'wav', 'wma', 'ogg', 'aac', 'flac', 'doc', 'docx',
                    'txt', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx', 'epub', 'zip',
                    'rar', 'gif', 'ico', 'psd', 'mpg', 'mov', 'wmv', 'rm'], // 已知的文件类型名
                showFileOperationIndex: -1,
                // 排序实例
                sortableType: true,
                sortInstance: null
            };
        },
        methods: {
            fileCls(file) {
                return [
                    `${prefixCls}-list-file`,
                    {
                        [`${prefixCls}-list-file-finish`]: file.status === 'finished'
                    }
                ];
            },
            handleClick(file) {
                this.$emit('on-file-click', file);
            },
            handleEdit(file, index) {
                this.isEditFileName = true;
                this.currentFileIndex = index;
                const tempIndex = file.name.lastIndexOf('.');
                if (tempIndex !== -1) {
                    this.currentFileType = file.name.slice(tempIndex);
                    this.editFileName = file.name.substring(tempIndex, 0);
                } else {
                    this.currentFileType = '';
                    this.editFileName = file.name;
                }
            },
            handleEditConfirm() {
                if (!this.editFileName) {
                    this.$Message.warning(this.$t('mail.attamentNameEmptyTip'));
                } else {
                    const newFileName = this.editFileName + this.currentFileType;
                    const fileList = this.files;
                    fileList[this.currentFileIndex].name = newFileName;
                    this.$emit('update: files', fileList);
                }
                this.isEditFileName = false;
                this.currentFileIndex = -1;
                this.currentFileType = '';
                this.editFileName = '';
            },
            handlePreview(file) {
                this.$emit('on-file-preview', file);
            },
            handleRemove(file) {
                this.$emit('on-file-remove', file);
            },
            format(file) {
                const format = file.name.split('.').pop().toLocaleLowerCase() || '';
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
            parsePercentage(val) {
                return parseInt(val, 10);
            },
            enters(file, index) {
                this.showFileOperationIndex = index;
            },
            leaver(file, index) {
                this.showFileOperationIndex = -1;
            },
            initSortable() {
                let selfUploadList = this.sortableClass ? document.querySelector(`.${this.sortableClass}`) : document.querySelector('.selfUploadList');
                if (selfUploadList) {
                    this.sortInstance = Sortable.create(selfUploadList, {
                        group: {
                            name: 'li',
                            pull: true
                        },
                        handle: '.custom-drag-and-drop',
                        animation: 120,
                        fallbackClass: 'iview-admin-cloned-item',
                        onEnd: _this.endFunc
                    });
                } else {
                    selfUploadList = document.querySelector('.writeMailsSelfUploadList') || document.querySelector('.writeMailsModalSelfUploadList') || document.querySelector('.selfUploadList');
                    this.sortInstance = Sortable.create(selfUploadList, {
                        group: {
                            name: 'li',
                            pull: true
                        },
                        handle: '.custom-drag-and-drop',
                        animation: 120,
                        fallbackClass: 'iview-admin-cloned-item',
                        onEnd: _this.endFunc
                    });
                }
            },
            // 排序
            endFunc(e) {
                if (e.newIndex !== e.oldIndex) {
                    // 保证 files 顺序和页面显示的选项顺序一致
                    this.files.splice(e.newIndex, 0, ...this.files.splice(e.oldIndex, 1));
                    this.sortInstance = null;
                    this.sortableType = false;
                    this.$nextTick(() => {
                        this.sortableType = true;
                        this.$nextTick(() => {
                            this.initSortable();
                        });
                    });
                }
            }
        }
    };
</script>
<style lang="less" scoped>
  .attament /deep/ .custom {
    opacity: 1 !important;
    font-size: 14px;
    margin-right: 10px !important;
    color: #a9b9c9 ;
    cursor: pointer;
    &:hover {
      color: #7b98b6 ;
    }
  }
  .attament /deep/ .ivu-upload-list-file {
    padding: 0 10px;
  }

  .attament {
    display: flex;
    flex-wrap: wrap;
    .file-list-item {
      /*display: inline-block!important;*/
      display: flex;
      flex-direction: column;
      justify-content: center;
      float: left;
      margin:0 5px;
      border-radius: 4px;
      min-width: 300px;
      .attament-info {
        height: 25px;
        line-height: 25px;
        span {
          cursor: default;
        }
        .attament-text{
            display: inline-block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .attament-operate {
          /*visibility: hidden;*/
          float: right;
        }
        .fileName-input {
          height: 80%;
          border: none;
          background: inherit;
          &:focus {
            box-shadow: none;
            outline: none;
          }
        }
      }
      &:hover .attament-operate{
        /*visibility: visible;*/
      }
    }
  }
</style>
