<template>
    <!-- <div class="file-preview" style="z-index: 999;position: fixed;width: 100%;height: 100%;background-color: #ffffff;top:0;left:0;bottom:0;right:0;"> -->
    <div class="commonFilePreview">
        <!-- 文件加载失败 -->
        <div v-if="fileLoading&&fileError" class="commonFilePreview-content"
             style="display: flex;justify-content: center;align-items: center;">
            <span style="color:#ff752a;">文件加载失败</span>
        </div>
        <!-- 文件加载成功 -->
        <div v-else class="commonFilePreview-content">
            <!-- 左切换按钮 -->
            <!-- <Icon custom="custom custom-zuoyouqiehuanbeifen2" v-if="currentFileIndex !== 0" size="28"
                  @click.stop="previewFile('previous')"/> -->
            <!-- 右切换按钮 -->
            <!-- <Icon custom="custom custom-zuoyouqiehuan" v-if="currentFileIndex !== (fileList.length - 1)" size="28"
                  @click.stop="previewFile('next')"/> -->
            <!-- <div>{{currFile.suffix}}</div> -->
            <!-- .jpg, .jpeg, .png, .gif 图片类型 -->
            <div v-if="fileType==='image'"
                 class="commonFilePreview-imgBox">
                <img :src="currFile.url" :style="scaleFun">
            </div>
            <!-- .mp4 .webm .ogg 视频类型 -->
            <div v-else-if="fileType==='video'"
                 style="display:flex;justify-content:center;">
                <video :src="currFile.url" controls muted width="100%" height="840"></video>
            </div>
            <!-- pdf文件预览 -->
            <div v-else-if="fileType==='pdf'" class="commonFilePreview-pdfBox">
                <!-- pdf文件预览时的icon -->
                <div class="commonFilePreview-pdfBox-tools">
                    <!-- 当前pdf为第一页的话显示:当前页为第一页 -->
                    <Tooltip
                        :content="pageNum===1?$t('BriefCase.filePreview.currentPageIsFirstPage'):$t('BriefCase.filePreview.lastPage')"
                        placement="top">
                        <Icon custom="custom custom-icon_last_n" size="18" @click.stop="prePage"
                              :style="pageNum===1?'color:#B2B2B2;':''"/>
                    </Tooltip>
                    <span class="commonFilePreview-pdfBox-tools-page">{{pageNum}}/{{pageTotalNum}}</span>
                    <!-- 当前pdf为最后一页的话显示:当前页为最后一页 -->
                    <Tooltip
                        :content="pageNum===pageTotalNum?$t('BriefCase.filePreview.currentPageIsLastPage'):$t('BriefCase.filePreview.nextPage')"
                        placement="top">
                        <Icon custom="custom custom-icon_next_n" size="18" @click.stop="nextPage"
                              :style="pageNum===pageTotalNum?'color:#B2B2B2;':''"/>
                    </Tooltip>
                    <span style="margin:0 20px;">|</span>
                    <Tooltip :content="$t('BriefCase.filePreview.enlarge')" placement="top">
                        <Icon custom="custom custom-icon_enlarge" size="18" :style="pdfScale===100?'color:#B2B2B2;':''"
                              @click.stop="scaleD"/>
                    </Tooltip>
                    <span class="commonFilePreview-pdfBox-tools-percent">{{pdfScale+40}}%</span>
                    <Tooltip :content="$t('BriefCase.filePreview.narrow')" placement="top">
                        <Icon custom="custom custom-icon_ensmall" size="18" :style="pdfScale===20?'color:#B2B2B2;':''"
                              @click.stop="scaleX"/>
                    </Tooltip>
                </div>
                <!-- pdf文件预览的插件 -->
                <pdf ref="pdf" :src="currFile.url" :page="pageNum" :rotate="pageRotate"
                     @progress="loadedRatio = $event"
                     @page-loaded="pageLoaded($event)"
                     @num-pages="pageTotalNum=$event"
                     @error="pdfError($event)"
                     @link-clicked="page = $event"
                     style="width:50%;height:95%;overflow-y:scroll;"
                     :style="{width:pdfScale+'%'}"
                ></pdf>
            </div>
            <!-- .docx .doc word文件的预览 -->
            <div v-else-if="fileType==='word'" class="commonFilePreview-fileBox">
                <!-- encodeURIComponent(file.documentPath) 转码处理 -->
                <iframe style="width: 100%;height: 100%;"
                        :src="`//view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(currFile.url)}`"
                        frameborder="0"></iframe>
            </div>
            <!-- .xlsx .xls excell文件的预览 -->
            <div v-else-if="fileType==='excell'" class="commonFilePreview-fileBox">
                <iframe style="width: 100%;height: 100%;"
                        :src="`//view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(currFile.url)}`"
                        frameborder="0"></iframe>
            </div>
            <!-- .pptx .ppt ppt文件的预览 -->
            <div v-else-if="fileType==='ppt'" class="commonFilePreview-fileBox">
                <iframe style="width: 100%;height: 100%;"
                        :src="`//view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(currFile.url)}`"
                        frameborder="0"></iframe>
            </div>
            <!-- 无法预览的文件 -->
            <div v-else class="commonFilePreview-fileBox commonFilePreview-fileBox-flex">
                <p>{{currFile.fileName}}</p>
                <p>{{$t('BriefCase.typeError')}}</p>
                <Button type="primary"
                        @click="handleDownload()">{{ $t('BriefCase.filePreview.download') }}
                </Button>
            </div>
        </div>
    </div>
</template>

<script>
    import pdf from 'vue-pdf'; // pdf预览组件

    export default {
        name: 'commonFilePreview',
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            fileInfo: {
                type: Object,
                default: () => {
                }
            }
        },
        computed: {
            // 图片缩小放大
            scaleFun: function() {
                const imgScale = this.imgScale;
                return `transform:scale(${imgScale})`;
            },
            // 根据文件类型(多)，来返回不同的类型
            fileType: function() {
                // 当前的文件类型
                const type = this.currFile.suffix;
                let suffix = null;
                switch (type) {
                    // jpg jpeg png gif mp4 webm ogg pdf docx doc xls xlsx pptx ppt
                    case 'png':
                    case 'jpg':
                    case 'gif':
                    case 'jpeg':
                    case 'image':
                        suffix = 'image';
                        break;
                    case 'mp4':
                    case 'webm':
                    case 'ogg':
                        suffix = 'video';
                        break;
                    case 'pdf':
                        suffix = 'pdf';
                        break;
                    case 'docx':
                    case 'doc':
                        suffix = 'word';
                        break;
                    case 'xlsx':
                    case 'xls':
                        suffix = 'excell';
                        break;
                    case 'ppt':
                    case 'pptx':
                        suffix = 'ppt';
                        break;
                    default:
                        suffix = null;
                }
                return suffix;
            }
        },
        components: {
            pdf // pdf预览组件
        },
        data() {
            return {
                fileList: [], // 文件列表
                pageNum: 1, // pdf当前页
                pageTotalNum: 1, // pdf总页码
                pageRotate: 0, // pdf旋转角度
                loadedRatio: 0, // pdf加载进度
                curPageNum: 0,
                pdfScale: 60, // pdf放大
                imgScale: 1, // img放大
                // 控制文件夹
                // 控制重命名
                loading: null, // loading实例
                fileLoading: false, // 文件获取ing
                fileError: false, // 文件获取失败
                currFile: {}, // 保存当前的文件
                currentFileIndex: null // 当前预览的文件的下标
            };
        },
        methods: {
            // 单独处理图片格式
            testFileType(type) {
                let suffix;
                switch (type) {
                    // jpg jpeg png gif
                    case 'png':
                    case 'jpg':
                    case 'gif':
                    case 'jpeg':
                        suffix = 'image';
                        break;
                    default:
                        suffix = null;
                }
                return suffix;
            },
            // 预览文件的公共函数
            previewFile(btnType) {
                if ((this.currentFileIndex === 0 && btnType === 'previous') || (this.currentFileIndex === (this.fileList.length - 1) && btnType === 'next')) {
                    return;
                }
                ;
                this.pdfScale = 60;
                this.imgScale = 1;
                // loading效果
                this.fileLoading = true;
                this.loading = this.$loading({
                    target: '.commonFilePreview-content',
                    lock: true,
                    text: '在线预览加载中',
                    spinner: 'el-icon-loading',
                    background: 'rgba(255, 255, 255)'
                });
                if (btnType === 'previous') { // 上一项
                    this.currentFileIndex -= 1;
                } else if (btnType === 'next') { // 下一项
                    this.currentFileIndex += 1;
                }
                ;
                const _this = this;
                this.fileList.forEach((item, index) => {
                    // 单独处理图片
                    if (_this.testFileType(item.suffix) === 'image') {
                        setTimeout(() => {
                            // 第一次浏览的文件的id与列表的id相等时
                            if (this.currentFileIndex === index) {
                                // 关闭loading
                                this.loading.close();
                                this.loading = null;
                                this.fileLoading = false;
                                // 预览文件
                                this.currFile = item;
                            }
                            ;
                        }, 1000);
                    } else {
                        // 第一次浏览的文件的id与列表的id相等时
                        if (this.currentFileIndex === index) {
                            // 关闭loading
                            this.loading.close();
                            this.loading = null;
                            this.fileLoading = false;
                            // 预览文件
                            this.currFile = item;
                        }
                        ;
                    }
                    ;
                });
            },
            // 预览文件时的loading效果
            loadFile() {
                this.fileLoading = true;
                this.currFile = {};
                this.loading = this.$loading({
                    target: '.commonFilePreview-content',
                    lock: true,
                    text: '在线预览加载中',
                    spinner: 'el-icon-loading',
                    background: 'rgba(255, 255, 255)'
                });

                setTimeout(() => {
                    this.loading.close();
                    this.loading = null;
                    this.fileLoading = false;
                    const fileName = this.fileInfo.name ? this.fileInfo.name : `image${new Date().getTime()}.jpg`;
                    let fileSuffix = '';
                    if (fileName.indexOf('.') !== -1) {
                        fileSuffix = fileName.split('.').slice(-1)[0].toLowerCase();
                    }
                    this.currFile = {
                        url: `${this.fileInfo.url}?attname=${fileName}`,
                        fileName: fileName,
                        suffix: (this.fileInfo.type || fileSuffix).toLowerCase()
                    };
                }, 500);

                setTimeout(() => {
                    if (this.loading) {
                        this.fileLoading = true;
                        // 模拟文件获取失败
                        this.fileError = true;
                        // 关闭loading效果
                        this.loading.close();
                        this.loading = null;
                    }
                    ;
                }, 30000);
            },
            // pdf上一页
            prePage() {
                // 当前为第一页时禁止点击上一页
                if (this.pageNum === 1) {
                    return;
                }
                let page = this.pageNum;
                page = page > 1 ? page - 1 : this.pageTotalNum;
                this.pageNum = page;
            },
            // pdf下一页
            nextPage() {
                // 当前为最后一页时禁止点击下一页
                if (this.pageNum === this.pageTotalNum) {
                    return;
                }
                let page = this.pageNum;
                page = page < this.pageTotalNum ? page + 1 : 1;
                this.pageNum = page;
            },
            // pdf页面顺时针翻转90度。
            clock() {
                this.pageRotate += 90;
            },
            // 页面加载回调函数，其中e为当前页数
            pageLoaded(e) {
                this.curPageNum = e;
            },
            // 其他的一些回调函数。
            pdfError(error) {
                console.error(error);
            },
            // pdf放大
            scaleD() {
                if (this.pdfScale === 100) {
                    return;
                }
                this.pdfScale += 5;
            },
            // pdf缩小
            scaleX() {
                if (this.pdfScale === 20) {
                    return;
                }
                this.pdfScale += -5;
            },
            // 下载文件方法
            handleDownload() {
                // 默认七牛下载

                const a = document.createElement('a');
                a.target = '_blank';
                a.href = this.currFile.url.substring(this.currFile.url.indexOf(':') + 1);
                a.click();
            },
            resetData() {
                this.pageNum = 1; // pdf当前页
                this.pageTotalNum = 1; // pdf总页码
                this.pageRotate = 0; // pdf旋转角度
                this.loadedRatio = 0; // pdf加载进度
                this.curPageNum = 0;
                this.pdfScale = 60; // pdf放大
                this.imgScale = 1; // img放大
            }
        },
        mounted() {
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        // 重置data数据
                        this.resetData();
                        // loading效果
                        this.loadFile();
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style scoped lang="less">
    .commonFilePreview {
        height: 100%;

        &-content {
            width: 100%;
            height: 100%;
        }

        &-fileBox {
            width: 100%;
            height: 100%;
        }

        &-fileBox-flex {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            p {
                font-size: 12px;
                line-height: 16px;
                margin-bottom: 2px;
            }
        }

        // 左切换icon图标样式
        .custom-zuoyouqiehuanbeifen2 {
            position: fixed;
            left: 50px;
            top: 50%;
            cursor: pointer;
            z-index: 1;
        }

        // 右切换icon图标样式
        .custom-zuoyouqiehuan {
            position: fixed;
            right: 50px;
            top: 50%;
            cursor: pointer;
            z-index: 1;
        }

        &-imgBox {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;

            img {
                // 宽高自适应 被替换的内容将被缩放，以在填充元素的内容框时保持其宽高比。
                object-fit: contain;
            }
        }

        &-pdfBox {
            height: 100%;
            display: flex;
            justify-content: center;

            // pdf插件中的上下页及放大缩小按钮
            &-tools {
                position: absolute;
                left: cale(50%-170px);
                bottom: 0;
                height: 60px;
                line-height: 60px;
                padding: 0 30px;
                box-sizing: border-box;
                text-align: center;
                background-color: rgba(56, 56, 57, .8);
                border-radius: 8px;
                z-index: 3;
                cursor: pointer;

                // pdf页码 pdf放大百分比
                &-page, &-percent {
                    margin: 0 20px;
                    display: inline-block;
                    text-align: center;
                    // width: 38px;
                }

                .custom, span {
                    color: #ECECEC;
                }

                .custom-icon_next_n:hover {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 50%;
                }

                .custom-icon_last_n:hover {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 50%;
                }
            }
        }
    }
</style>
