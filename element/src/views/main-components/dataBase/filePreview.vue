<template>
    <!-- <div class="file-preview" style="z-index: 999;position: fixed;width: 100%;height: 100%;background-color: #ffffff;top:0;left:0;bottom:0;right:0;"> -->
    <Drawer :visible="showFilePreview"
        size="100%"
        :modal="false"
        direction="btt"
        :append-to-body="true"
        :with-header="false"
        style="height: 100%;"
        ref="topDrawer"
        class="show-file-preview">
        <!-- 文件预览顶部 -->
        <div class="file-preview-top" style="display:flex;justify-content:space-between;align-items:center;height:52px;"
            :style="fileLoading?'justify-content:flex-end;':''"
            >
            <!-- 文件类型的icon及文件名 -->
            <div class="file-preview-top-filename" v-if="!fileLoading">
                <fileNameIcon :iconName="dataBaseFile.suffix" :styles="{ fontSize: '20px' }"></fileNameIcon> {{dataBaseFile.fileName}}
            </div>
            <!-- 顶部右侧的icon图标 -->
            <div class="file-preview-top-fileicon">
                <Tooltip v-if="!fileLoading&&fileType==='image'" :content="$t('BriefCase.filePreview.enlarge')" placement="bottom">
                    <Icon custom="custom custom-icon_enlarge" size="18" style="margin-right:20px;" :style="imgScale===1.5?'color:#B2B2B2;':''" @click.stop="imgZoomIn" />
                </Tooltip>
                <Tooltip v-if="!fileLoading&&fileType==='image'" :content="$t('BriefCase.filePreview.narrow')" placement="bottom">
                    <Icon custom="custom custom-icon_ensmall" size="18" style="margin-right:20px;" :style="imgScale===0.5?'color:#B2B2B2;':''" @click.stop="imgZoomOut" />
                </Tooltip>
                <Tooltip v-if="!fileLoading" :content="$t('BriefCase.filePreview.download')" placement="bottom">
                    <Icon custom="custom custom-icon_download" size="18" style="margin-right:20px;" @click="handleDownload" />
                </Tooltip>
                <Tooltip v-if="!fileLoading&&(currentFolderLabel==='person'||currentFolderLabel==='company') && firstFileId" :content="$t('BriefCase.filePreview.share')" placement="bottom">
                    <Icon custom="custom custom-facebook-share" @click="handleShare" size="18" style="margin-right:20px;" />
                </Tooltip>
                <Tooltip v-if="!fileLoading && fileType" :content="$t('mail.openNewWindow')" placement="bottom">
                    <Icon custom="custom custom-icon_opennew" @click="openFile" size="18" style="margin-right:20px;" />
                </Tooltip>
                <Tooltip :content="$t('BriefCase.filePreview.close')" placement="bottom">
                    <Icon custom="custom custom-icon_close" @click="closeFilePreview" size="18" />
                </Tooltip>
            </div>
        </div>
        <!-- 文件加载失败 -->
        <div v-if="fileLoading&&fileError" class="file-preview-content" style="display: flex;justify-content: center;align-items: center;">
            <span style="color:#ff752a;">文件加载失败</span>
        </div>
        <!-- 文件加载成功 -->
        <div v-else class="file-preview-content" :style="fileType==='pdf'?'margin-top:52px;':''">
            <!-- 左切换按钮 -->
            <Icon custom="custom custom-zuoyouqiehuanbeifen2" v-if="currentFileIndex!==0 && firstFileId" size="28" @click.stop="previewFile('previous')" />
            <!-- 右切换按钮 -->
            <Icon custom="custom custom-zuoyouqiehuan" v-if="currentFileIndex!==(fileList.length-1) && firstFileId" size="28" @click.stop="previewFile('next')" />
            <!-- <div>{{dataBaseFile.suffix}}</div> -->
            <!-- .jpg, .jpeg, .png, .gif 图片类型 -->
            <div v-if="fileType==='image'" :key="dataBaseFile.id" class="img-box">
                <img :src="dataBaseFile.url" :style="scaleFun">
            </div>
            <!-- .mp4 .webm .ogg 视频类型 -->
            <div v-else-if="fileType==='video'" :key="dataBaseFile.id" style="margin-top:52px;display:flex;justify-content:center;">
                <video :src="dataBaseFile.url" controls muted width="100%" height="840"></video>
            </div>
            <!-- pdf文件预览 -->
            <div v-else-if="fileType==='pdf'" class="pdf-box">
                <!-- pdf文件预览时的icon -->
                <div class="tools">
                    <!-- 当前pdf为第一页的话显示:当前页为第一页 -->
                    <Tooltip :content="pageNum===1?$t('BriefCase.filePreview.currentPageIsFirstPage'):$t('BriefCase.filePreview.lastPage')" placement="top">
                        <Icon custom="custom custom-icon_last_n" size="18" @click.stop="prePage" :style="pageNum===1?'color:#B2B2B2;':''" />
                    </Tooltip>
                    <span class="page">{{pageNum}}/{{pageTotalNum}}</span>
                    <!-- 当前pdf为最后一页的话显示:当前页为最后一页 -->
                    <Tooltip :content="pageNum===pageTotalNum?$t('BriefCase.filePreview.currentPageIsLastPage'):$t('BriefCase.filePreview.nextPage')" placement="top">
                        <Icon custom="custom custom-icon_next_n" size="18" @click.stop="nextPage" :style="pageNum===pageTotalNum?'color:#B2B2B2;':''" />
                    </Tooltip>
                    <span  style="margin:0 20px;">|</span>
                    <Tooltip :content="$t('BriefCase.filePreview.enlarge')" placement="top">
                        <Icon custom="custom custom-icon_enlarge" size="18" :style="pdfScale===100?'color:#B2B2B2;':''" @click.stop="scaleD" />
                    </Tooltip>
                    <span class="percentage">{{pdfScale+40}}%</span>
                    <Tooltip :content="$t('BriefCase.filePreview.narrow')" placement="top">
                        <Icon custom="custom custom-icon_ensmall" size="18" :style="pdfScale===20?'color:#B2B2B2;':''" @click.stop="scaleX" />
                    </Tooltip>
                </div>
                <!-- pdf文件预览的插件 -->
                <pdf ref="pdf" :src="dataBaseFile.url" :page="pageNum" :rotate="pageRotate"
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
            <div v-else-if="fileType==='word'" class="file-show-box">
                <!-- encodeURIComponent(file.documentPath) 转码处理 -->
                <iframe style="width: 100%;height: 100%;" :src="`//view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(dataBaseFile.url)}`" frameborder="0"></iframe>
            </div>
            <!-- .xlsx .xls excell文件的预览 -->
            <div v-else-if="fileType==='excell'" class="file-show-box">
                <iframe style="width: 100%;height: 100%;" :src="`//view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(dataBaseFile.url)}`" frameborder="0"></iframe>
            </div>
            <!-- .pptx .ppt ppt文件的预览 -->
            <div v-else-if="fileType==='ppt'" class="file-show-box">
                <iframe style="width: 100%;height: 100%;" :src="`//view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(dataBaseFile.url)}`" frameborder="0"></iframe>
            </div>
            <!-- 无法预览的文件 -->
            <div v-else class="file-show-box file-show-box-flex">
                <p>{{dataBaseFile.fileName}}</p>
                <p>{{$t('BriefCase.typeError')}}</p>
                 <Button type="primary"
                        @click="handleDownload()">{{ $t('BriefCase.filePreview.download') }}</Button>
            </div>
        </div>

        <!-- 分享弹窗 -->
        <Modal :visible.sync="visible_share"
            :modal="false"
            :close-on-click-modal="false"
            title="共享"
            width="540px">
            <Tabs v-model="activeDirName">
                <TabPane label="共享文件" name="sharingFile">
                    <IviewTree show-checkbox
                            :data="tree_data"
                            ref="dir_tree"
                            :render="renderContent"
                            :props="defaultProps"
                            :multiple="false"
                            :check-strictly="true"
                            @on-check-change="treeChange">
                    </IviewTree>
                </TabPane>
            </Tabs>
            <div slot="footer">
                <Button @click="visible_share=false">{{$t('material.Btn.cancel')}}</Button>
                <Button type="primary" :disabled="isShare" @click="share_to">{{$t('material.Btn.confirm')}}</Button>
            </div>
        </Modal>
        <!-- 文件名重复时的弹窗 -->
        <Modal :visible.sync="visible_cover"
                :modal="false"
                :close-on-click-modal="false"
                title="提示"
                width="40%">
            <div>
                <p>文件已存在，是否覆盖？</p>
            </div>
            <div slot="footer">
                <Button type="primary" :disabled="isNameExist" @click="share_cover_confirm">{{$t('material.Btn.confirm')}}</Button>
                <Button @click="visible_cover=false">{{$t('material.Btn.cancel')}}</Button>
            </div>
        </Modal>
    </Drawer>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import pdf from 'vue-pdf'; // pdf预览组件
    // import env from '../../../../build/env';
    // import url from '../../../../build/url';
    const { VUE_APP_API_URL } = process.env;

    export default {
        name: 'filePreview',
        computed: {
            ...mapState({
                userId: state => state.userId, // 用户id
                enterpriseId: 'enterpriseId', // 企业id
                parentId: state => state.crm.parentId, // parentId
                showFilePreview: state => state.showFilePreview, // 展示文件预览组件
                dataBaseFileList: 'dataBaseFileList', // 文件列表
                firstFileId: 'firstFileId', // 第一个文件id 或 跟进记录过来的为null
                fileStorageFolder: 'fileStorageFolder', // 文件储存的文件夹
                currentFolderLabel: 'currentFolderLabel', // 当前的文件夹(person/company)
                followUpFile: 'followUpFile' // 跟进记录来的文件数据
            }),
            // 图片缩小放大
            scaleFun: function() {
                const imgScale = this.imgScale;
                return `transform:scale(${imgScale})`;
            },
            // 根据文件类型(多)，来返回不同的类型
            fileType: function() {
                // 当前的文件类型
                const type = this.dataBaseFile.suffix;
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
                isNameExist: false, // 文件名字会重复时 控制按钮是否能点击的阈值
                isShare: false, // 控制分享按钮是否能点击的阈值
                fileList: [], // 文件列表
                pageNum: 1, // pdf当前页
                pageTotalNum: 1, // pdf总页码
                pageRotate: 0, // pdf旋转角度
                loadedRatio: 0, // pdf加载进度
                curPageNum: 0,
                pdfScale: 60, // pdf放大
                imgScale: 1, // img放大
                visible_share: false,
                activeDirName: 'sharingFile', // 默认为共享文件
                tree_data: [], // 共享文件中文件夹的树形数据
                defaultProps: {
                    children: 'children',
                    label: 'filename'
                },
                shareFileName: '', // 分享的文件名
                visible_cover: false,
                // 控制文件夹
                // 控制重命名
                fileId: null, // 分享的文件id
                loading: null, // loading实例
                fileLoading: false, // 文件获取ing
                fileError: false, // 文件获取失败
                dataBaseFile: {}, // 保存当前的文件
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
                };
                this.pdfScale = 60;
                this.imgScale = 1;
                // loading效果
                this.fileLoading = true;
                this.loading = this.$loading({
                    target: '.file-preview-content',
                    lock: true,
                    text: '在线预览加载中',
                    spinner: 'el-icon-loading',
                    background: 'rgba(255, 255, 255)'
                });
                if (btnType === 'previous') { // 上一项
                    this.currentFileIndex -= 1;
                } else if (btnType === 'next') { // 下一项
                    this.currentFileIndex += 1;
                };
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
                                this.dataBaseFile = item;
                            };
                        }, 1000);
                    } else {
                        // 第一次浏览的文件的id与列表的id相等时
                        if (this.currentFileIndex === index) {
                            // 关闭loading
                            this.loading.close();
                            this.loading = null;
                            this.fileLoading = false;
                            // 预览文件
                            this.dataBaseFile = item;
                        };
                    };
                });
            },
            // 文件名字重复时,点击弹窗上的确定按钮
            share_cover_confirm() {
                this.isNameExist = true;
                util.ajax233({
                    url: `/${this.currentFolderLabel}/shareFile`,
                    method: 'post',
                    data: {
                        fromId: this.fileId,
                        toId: this.toId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.$Message.success('分享成功');
                        // 组件分享后,调用一次页面的方法
                        this.$store.commit('afterShare', true);
                    } else {
                        this.$Message.error(res.data.message);
                    }
                });
                this.visible_cover = false;
            },
            // 选中共享文件夹
            treeChange(arr, obj) {
                if (arr.length === 0) {
                    obj.checked = false;
                } else {
                    arr.forEach(item => {
                        item.checked = false;
                    });
                    obj.checked = true;
                }
            },
            // 点击分享按钮
            share_to() {
                const toDir = this.$refs.dir_tree.getCheckedNodes();
                if (!toDir.length) {
                    this.$Message.warning('请先选择要分享的文件夹');
                    return;
                }
                this.toId = toDir[0].id;
                // 验证重复名
                util.ajax233({
                    url: '/share/existFilename',
                    method: 'post',
                    data: {
                        filename: this.shareFileName,
                        isFolder: 0,
                        parentId: toDir[0].id
                    }
                }).then(res => {
                    // 文件名重复存在:
                    if (res.data.code === '1') {
                        this.visible_cover = true; // 覆盖弹窗出现
                        this.visible_share = false; // 分享弹窗消失
                        // 文件名不存在:
                    } else {
                        this.isShare = true;
                        util.ajax233({
                            url: `/${this.currentFolderLabel}/shareFile`,
                            method: 'post',
                            data: {
                                fromId: this.fileId,
                                toId: this.toId
                            }
                        }).then(res => {
                            if (res.data.code === '1') {
                                this.$Message.success('分享成功');
                                // 组件分享后,调用一次页面的方法
                                this.$store.commit('afterShare', true);
                            } else {
                                this.$Message.error(res.data.message);
                            }
                        });
                        this.visible_share = false;
                    }
                });
            },
            // 构建树结构
            renderContent(h, { root, node, data }) {
                return h('span', {
                    style: {
                        display: 'inline-block',
                        width: '100%'
                    }
                }, [
                    h('span', [
                        h('Icon', {
                            class: 'custom custom-fp-paper-file',
                            style: {
                                marginRight: '8px',
                                color: '#FBBC04',
                                width: '18px',
                                height: '18px'
                            }
                        }),
                        h('span', {
                            style: {
                                fontSize: '12px',
                                color: 'rgba(0,0,0,0.80)'
                            }
                        }, data.filename)
                    ])

                ]);
            },
            // 顶部分享按钮icon
            handleShare() {
                this.isShare = false;
                this.isNameExist = false;
                this.visible_share = true; // 分享文件的modal出现
                this.fileId = this.dataBaseFile.sourceFileId; // 存文件id
                this.shareFileName = this.dataBaseFile.fileName; // 存文件名
                this.getAllFolders(); // 获取共享文件夹
            },
            // 获取共享文件夹
            getAllFolders() {
                util.ajax233({
                    url: '/share/findAllFolder',
                    method: 'post'
                }).then(res => {
                    if (res.data.code === '1') {
                        const { data } = res.data;
                        // 将文件夹列表绘制成树形多级列表
                        const treeData = this.buildTree(data, 'id', 'parentId');
                        // 对象转为数组{id:{}} ==> [{}]
                        this.tree_data = Object.values(treeData);
                    } else {
                        this.$Message.error('获取文件夹失败请重试');
                    }
                });
            },
            // 如果共享文件夹下还有文件夹,则进行树形结构的绘制
            buildTree(array, id, parentId) {
                // 创建临时对象
                const temp = {};
                // 创建需要返回的树形对象
                const tree = {};
                for (let i = 0; i < array.length; i++) {
                    // { array[i][id]: array[i] }
                    temp[array[i][id]] = array[i];
                }
                for (const i in temp) {
                    // 非一级树结构
                    if (temp[i][parentId] !== 0) {
                        if (!temp[temp[i][parentId]].children) {
                            // eslint-disable-next-line no-array-constructor
                            temp[temp[i][parentId]].children = new Array();
                        }
                        temp[temp[i][parentId]].children.push(temp[i]);
                    } else {
                        // 一级树结构
                        tree[temp[i][id]] = temp[i];
                    }
                }
                return tree;
            },
            // 预览文件时的loading效果
            loadFile() {
                this.fileLoading = true;
                this.dataBaseFile = {};
                this.loading = this.$loading({
                    target: '.file-preview-content',
                    lock: true,
                    text: '在线预览加载中',
                    spinner: 'el-icon-loading',
                    background: 'rgba(255, 255, 255)'
                });
                // 资料库相关的预览会有firstFileId，跟进记录来的firstFileId为null
                if (this.firstFileId) {
                    // 渲染数据
                    this.materialDetail();
                } else {
                    setTimeout(() => {
                        this.loading.close();
                        this.loading = null;
                        this.fileLoading = false;
                        const fileName = this.followUpFile.name ? this.followUpFile.name : `image${new Date().getTime()}.jpg`;
                        this.dataBaseFile = {
                            url: `${this.followUpFile.url}?attname=${fileName}`,
                            fileName: fileName,
                            suffix: this.followUpFile.type.toLowerCase()
                        };
                    }, 500);
                };
                setTimeout(() => {
                    if (this.loading) {
                        this.fileLoading = true;
                        // 模拟文件获取失败
                        this.fileError = true;
                        // 关闭loading效果
                        this.loading.close();
                        this.loading = null;
                    };
                }, 30000);
            },
            // 预览文件
            handlePreview(file) {},
            // 新窗口打开文件
            openFile() {
                let openUrl = '';
                // 如果文件为office文件,则添加前缀
                if (this.fileType === 'word' || this.fileType === 'excell' || this.fileType === 'ppt') {
                    openUrl = `//view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(this.dataBaseFile.url)}`;
                    console.log(openUrl);
                } else {
                    openUrl = this.dataBaseFile.url;
                }
                window.open(openUrl, '_blank');
            },
            // 关闭文件预览
            closeFilePreview() {
                this.$store.commit('showFilePreview', false);
                // 当浮层关闭之后，更改全局变量
                this.$setGlobalState({
                    visible: false,
                    file: {}
                })
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
            // pdf页面逆时针翻转90度。
            counterClock() {
                this.pageRotate -= 90;
            },
            // 页面加载回调函数，其中e为当前页数
            pageLoaded(e) {
                this.curPageNum = e;
            },
            // 其他的一些回调函数。
            pdfError(error) {
                console.error(error);
            },
            // img放大
            imgZoomIn() {
                // 缩放到最大,return
                if (this.imgScale === 1.5) {
                    return;
                }
                let imgScale = this.imgScale;
                // 先扩大10倍
                imgScale *= 10;
                imgScale += 1;
                this.imgScale = imgScale / 10;
            },
            // img缩小
            imgZoomOut() {
                // 缩放到最小,return
                if (this.imgScale === 0.5) {
                    return;
                }
                let imgScale = this.imgScale;
                // 先扩大10倍
                imgScale *= 10;
                imgScale += -1;
                this.imgScale = imgScale / 10;
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
                if (this.firstFileId) {
                    // 从智能物料资料库过来的数据

                    // 根据环境切换 切换线上地址
                    // let domain = '';
                    // if (env === 'production') {
                    //     domain = url.productionUrlMKT;
                    // } else {
                    //     domain = url.developmentMKT;
                    // }

                    // // 判断是否为txadmin测试环境
                    // if (origin.indexOf('txadmin') > -1 ) {
                    //     domain = url.testUrlMKT;
                    // }
                    const domain = `${util.ajaxUrl}/cloudshare`;
                    // 发送请求
                    util.axios.get(`${domain}/${this.currentFolderLabel}/getDownloadUrl?id=${this.dataBaseFile.sourceFileId}`).then(({ data }) => {
                        if (data.code === '1' && data.data && data.data.url) {
                            // 导出
                            window.open(data.data.url, '_blank');
                        } else {
                            this.$Message.error(this.$t('crm.Html.errorOccurred'));
                        }
                    }).catch(error => {
                        console.error(error);
                        this.$Message.error(this.$t('crm.Html.errorOccurred'));
                    });
                } else {
                    if (this.followUpFile.projetModel && this.followUpFile.projetModel === 'crm') {
                        window.open(this.followUpFile.downLoadUrl);
                    } else {
                        // 从其他路径过来的数据, 多为七牛
                        const a = document.createElement('a');
                        a.target = '_blank';
                        a.href = this.dataBaseFile.url.substring(this.dataBaseFile.url.indexOf(':') + 1);
                        a.click();
                    }
                }
            },
            // 资料库阅览接口
            materialDetail() {
                let type = null;
                // 判断当前的文件夹
                if (this.currentFolderLabel === 'person') {
                    type = 1;
                    console.log(type, 'person');
                } else if (this.currentFolderLabel === 'company') {
                    type = 3;
                    console.log(type, 'company');
                } else if (this.currentFolderLabel === 'share') {
                    type = 2;
                    console.log(type, 'share');
                };
                // 资料库阅览接口
                util.ajaxShareMail({
                    url: '/material/look/detail',
                    method: 'post',
                    data: {
                        parentId: this.parentId,
                        type,
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        search_id: ''
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.fileList = response.data.data;
                        setTimeout(() => {
                            this.fileList.forEach((item, index) => {
                                if (item.sourceFileId === this.firstFileId) {
                                    // 关闭loading效果
                                    this.loading.close();
                                    this.loading = null;
                                    this.fileLoading = false;
                                    // 存当前的文件
                                    this.dataBaseFile = item;
                                    // 存当前文件的下标
                                    this.currentFileIndex = index;
                                };
                            });
                        }, 1000);
                    } else {
                        // 文件加载失败
                        this.fileLoading = true;
                        // 模拟文件获取失败
                        this.fileError = true;
                    };
                }).catch(error => {
                    // 关闭loading效果
                    this.loading.close();
                    this.loading = null;
                    // 文件加载失败
                    this.fileLoading = true;
                    // 模拟文件获取失败
                    this.fileError = true;
                    console.error(error);
                });
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
            showFilePreview: {
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
    .show-file-preview /deep/.el-drawer__body{
        height: 100%;
    }
    // 文件预览顶部
    .file-preview-top {
        position: absolute;
        z-index: 1;
        background-color: #ffffff;
        padding: 0 30px;
        // line-height: 56px;
        width: 100%;

        // 图标icon上显示小手
        .custom {
            cursor: pointer;
            color: #677F99;
        }

        // 分享图标在style.less中添加了hover颜色,修改下hover时的颜色
        .custom-facebook-share {
            &:hover {
                color: #677F99!important;
            }
        }
    }
    // 文件预览body区
    .file-preview-content {
        width: 100%;
        margin-top: 52px;
        height: calc(100% - 52px);
        .file-show-box {
            width: 100%;
            height: 100%;
        }
        .file-show-box-flex {
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

        // 图片盒子
        .img-box {
            width: 100%;
            height: calc(100% - 52px);
            margin-top: 52px;
            display: flex;
            justify-content: center;

            img {
                // 宽高自适应 被替换的内容将被缩放，以在填充元素的内容框时保持其宽高比。
                object-fit: contain;
            }
        }
        // pdf盒子
        .pdf-box {
            height: 100%;
            display:flex;
            justify-content:center;

            // pdf插件中的上下页及放大缩小按钮
            .tools {
                position:absolute;
                left:cale(50%-170px);
                bottom:0;
                height: 60px;
                line-height: 60px;
                padding: 0 30px;
                box-sizing: border-box;
                text-align: center;
                background-color: rgba(56,56,57, .8);
                border-radius: 8px;
                z-index:3;
                cursor: pointer;

                // pdf页码 pdf放大百分比
                .page,.percentage {
                    margin:0 20px;
                    display: inline-block;
                    text-align: center;
                    // width: 38px;
                }

                .custom, span {
                    color:#ECECEC;
                }

                .custom-icon_next_n:hover{
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 50%;
                }

                .custom-icon_last_n:hover{
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 50%;
                }
            }
        }
    }
</style>
