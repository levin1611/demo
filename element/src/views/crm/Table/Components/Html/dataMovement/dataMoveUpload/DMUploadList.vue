<template>
    <ul :class="[prefixCls + '-list']" :style="{width:`${ul_width-50}px`}">
        <li
                v-for="(file,i) in files"
                :class="fileCls(file)"
                @click="handleClick(file)"
                style="display: inline-block!important; float: left;margin: 10px;width: 350px;height: 80px;border: 1px solid #ffffff;">
            <span @click="handlePreview(file)" style="font-size: 14px;color: rgba(0,0,0,.8)"
            class="zhaimin-aaaa">
<!--                <Icon :type="format(file)"></Icon> {{ file.name|format_name }}-->
                <svg class="svg-icon custom" aria-hidden="true"
                     style="display: inline-block; margin-right:10px;width:44px;height:44px;left: 0"><use
                        xlink:href="#custom-file-xls"></use></svg>
                <div class="zhaimin-bbb">
                <p class="p-1">{{(i+1)+'、'+file.name|format_name }}</p>
                <p class="p-2">{{file.size|formatFileSize}}</p>
                <!--                <p class="p-3">文件上传成功</p>-->
                <p class="p-3">{{(file.status=='finished') ? $t('data_movement.uploaded') : $t('data_movement.uploading')}}</p>
                    </div>
            </span>
            <span>
<!--                <label :class="[prefixCls + '-list__item-status-label']">-->
<!--                </label>-->
                <Icon class="button-del custom custom-delete"
                      @click.native="handleRemove(file)"></Icon>
                <!--v-show="file.status === 'finished'"-->
            </span>
            <div class="custom-progress-bar">
                <transition name="fade" >
                    <!--                <i-progress-->
                    <!--                        :stroke-width="2"-->
                    <!--                        :percent="parsePercentage(file.percentage)"-->
                    <!--                        :status="file.status === 'finished'  ? 'success' : 'normal'"></i-progress>-->
                    <Progress :stroke-width="2"
                              :percentage="parsePercentage(file.percentage)"
                              v-if="file.status !== 'finished'"
                              :text-inside="true">
                    </Progress>
                </transition>
            </div>
<!--            <transition name="fade" >-->
<!--&lt;!&ndash;                <i-progress&ndash;&gt;-->
<!--&lt;!&ndash;                        :stroke-width="2"&ndash;&gt;-->
<!--&lt;!&ndash;                        :percent="parsePercentage(file.percentage)"&ndash;&gt;-->
<!--&lt;!&ndash;                        :status="file.status === 'finished'  ? 'success' : 'normal'"></i-progress>&ndash;&gt;-->
<!--                <Progress :stroke-width="2"-->
<!--                          :percentage="parsePercentage(file.percentage)"-->
<!--                          :status="file.status === 'finished'  ? 'success' : ''"-->

<!--                          :text-inside="true">-->
<!--                </Progress>-->
<!--            </transition>-->
        </li>
    </ul>
</template>
<script>
    // import Icon from 'view-design/src/components/icon/icon.vue';
    // import iProgress from 'view-design/src/components/progress/progress.vue';
    import {mapGetters} from 'vuex';

    const prefixCls = 'el-upload';

    export default {
        name: 'DMUploadList',
        // components: {Icon, iProgress},
        props: {
            files: {
                type: Array,
                default() {
                    return [];
                }
            }, // 用户上传的文件并展示在页面上m
            ul_width: {
                type: Number
            }
        },
        filters: {
            format_name(str) {
                return `${str.substring(0, 30)}...`;
            },
            formatFileSize(size) {
                if (size < 1024) {
                    return `${size}B`;
                } else if (size < (1024 * 1024)) {
                    let temp = size / 1024;
                    temp = temp.toFixed(2);
                    return `${temp}KB`;
                } else if (size < (1024 * 1024 * 1024)) {
                    let temp1 = size / (1024 * 1024);
                    temp1 = temp1.toFixed(2);
                    return `${temp1}MB`;
                } else {
                    let temp2 = size / (1024 * 1024 * 1024);
                    temp2 = temp2.toFixed(2);
                    return `${temp2}GB`;
                }
            }
        },
        data() {
            return {
                prefixCls: prefixCls
            };
        },
        computed: {
            ...mapGetters(['getIsClear'])
        },
        methods: {
            fileCls(file) {
                return [
                    `${prefixCls}-list__item`,
                    {
                        ['is-success']: file.status === 'finished'
                    }
                ];
            },
            init() {
                // if(this.$store.state.crm.isClear){
                //
                // }
            },
            /** 获取文件大小 数字 */
            getSizeNumber(size) {
                if (typeof (size) === 'string') {
                    let number = parseFloat(size);
                    /* unit数字带单位，字母换成小写了还是有数字 */
                    let unit = size.toLowerCase();
                    if (unit.includes('byte')) {
                        return number;
                    } else if (unit.includes('kb')) {
                        return number * 1024;
                    } else if (unit.includes('mb')) {
                        return number * 1024 * 1024;
                    } else if (unit.includes('gb')) {
                        return number * 1024 * 1024 * 1024;
                    }
                } else if (typeof (size) === 'number') {
                    return size;
                } else {
                    return 0;
                }
            },
            /** 文件大小转换 */
            formatFileSize(size) {
                if (size < 1024) {
                    return `${size}B`;
                } else if (size < (1024 * 1024)) {
                    let temp = size / 1024;
                    temp = temp.toFixed(2);
                    return `${temp}KB`;
                } else if (size < (1024 * 1024 * 1024)) {
                    let temp1 = size / (1024 * 1024);
                    temp1 = temp1.toFixed(2);
                    return `${temp1}MB`;
                } else {
                    let temp2 = size / (1024 * 1024 * 1024);
                    temp2 = temp2.toFixed(2);
                    return `${temp2}GB`;
                }
            },
            handleClick(file) {
                // this.$emit('on-file-click', file);
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

                if (['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp'].indexOf(format) > -1) {
                    type = 'image';
                }
                if (['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv'].indexOf(format) > -1) {
                    type = 'ios-film';
                }
                if (['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'].indexOf(format) > -1) {
                    type = 'ios-musical-notes';
                }
                if (['doc', 'txt', 'docx', 'pages', 'epub', 'pdf', 'keynote', 'ppt', 'pptx'].indexOf(format) > -1) {
                    type = 'document-text';
                }
                if (['numbers', 'csv', 'xls', 'xlsx'].indexOf(format) > -1) {
                    type = 'custom ';
                }
                // if (['keynote','ppt','pptx'].indexOf(format) > -1) {
                //     type = 'ios-videocam';
                // }

                return type;
            },
            parsePercentage(val) {
                return parseInt(val, 10);
            }
        },
        created() {
            this.init();
        },
        watch: {
            getIsClear(state) {
                if (state) {
                    this.files = [];
                    // this.filesUploaded = [];
                    this.$store.state.crm.isClear = false;
                }
            }
        }
    };
</script>

<style lang="less" scoped>
    .el-upload {
        .el-upload-list {
            margin-left: 36px;
            margin-top: 28px;
        }

        .el-upload-list__item {
            border-bottom: 1px solid #EAEAEA !important;
            height: 110px !important;
            padding: 4px !important;
            color: rgba(0,0,0,.8);
            border-radius: 4px;
            overflow: hidden;
            position: relative;
        }

        .is-success {
            height: 80px !important;
        }
    }
    .el-progress-bar {
        position: relative !important;
        top: 50px !important;
    }
</style>
<style lang="less" scoped>
    .zhaimin-aaaa{
        display: flex;
        flex-direction:row;
      .zhaimin-bbb{
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          .p-1 {
              font-size: 14px;
              color: rgba(0, 0, 0, .8);
          }

          .p-2 {
              font-size: 12px;
              color: #00060F;
              opacity: 0.4;
          }

          .p-3 {
              font-size: 12px;
              color: #00CC99;
          }
      }
    }
    .button-del {
        position: relative;
        top: -45px;
        right: -166px;
        border: 0;
        background: #f4f5f8;
        font-size: 9px;
        color: #EA4335 !important;
    }
</style>
<style lang="less">
    .custom-progress-bar {
        .el-progress-bar {
            position: relative !important;
            top: 50px !important;
        }
    }
</style>
