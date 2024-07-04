<template>
    <div class="database_container">
        <div class="database_header">
            <Tabs v-model="activeTab"
                class="database_tabs"
                @tab-click="handleTabClick"
                :before-leave="beforeLeave">
                <TabPane :label="$t('BriefCase.DataBase.personalFiles')" v-if="authorized_button['person']['disk']" name="person"></TabPane>
                <TabPane :label="$t('BriefCase.DataBase.companyFiles')" v-if="authorized_button['company']['disk']" name="company"></TabPane>
                <TabPane :label="$t('BriefCase.DataBase.sharedFiles')" v-if="authorized_button['share']['disk']" name="share"></TabPane>
            </Tabs>
            <div class="database_buttons_container" v-if="authorized_button[`${activeTab}`]['look']">
                <Button v-if="authorized_button[`${activeTab}`]['create_folder']" type="default" @click="handleNewFolder">{{$t('BriefCase.DataBase.newFold')}}</Button>
                <Button v-if="authorized_button[`${activeTab}`]['upload_file']" type="primary" @click="handleFilesUpload">{{$t('BriefCase.DataBase.upload')}}</Button>
                <!-- 产品要求不限制格式 -->
                <input type="file" style="display: none" ref="fileToUpload" multiple @change="handleUpload">
            </div>
        </div>
        <!-- 表格区域 -->
        <dataBaseTable :isNewFolder.sync="isNewFolder"
                       @updateIsNewFolder="updateIsNewFolder"
                       @updateLeavePageFlag="updateLeavePageFlag"
                       :base="activeTab"
                       :is-refresh-page.sync="isRefreshPage" >
        </dataBaseTable>
        <!--        <div style="margin-right: 30px;overflow: hidden">-->
        <!--            <Page></Page>-->
        <!--&lt;!&ndash;            <Page :page-size="pageSize"&ndash;&gt;-->
        <!--&lt;!&ndash;                  :page-sizes="pageSizeOpts"&ndash;&gt;-->
        <!--&lt;!&ndash;                  :total="totalNum"&ndash;&gt;-->
        <!--&lt;!&ndash;                  :current-page="curPage"&ndash;&gt;-->
        <!--&lt;!&ndash;                  layout="total, prev, pager, next, sizer, jumper"&ndash;&gt;-->
        <!--&lt;!&ndash;                  class="pageWrap-right">&ndash;&gt;-->
        <!--&lt;!&ndash;            </Page>&ndash;&gt;-->
        <!--        </div>-->
        <!-- 弹窗区域 -->
        <fileUpload :isShowUpload="isShowUpload"
                    :file-num="fileNum"
                    :remind-num="remindNum"
                    :upload-data="uploadData.filter(item => !item.isExisted)"
                    @isUploadCompleted="isUploadCompleted">
        </fileUpload>
        <!--        <Modal :visible.sync="visible_file_existed"-->
        <!--               :modal="false"-->
        <!--               title="提示">-->
        <!--            <div>-->
        <!--                <p>文件已存在，是否覆盖？</p>-->
        <!--            </div>-->
        <!--            <div slot="footer">-->
        <!--                <Button type="primary" @click="delete_confirm">确定</Button>-->
        <!--                <Button @click="visible_file_existed=false">取消</Button>-->
        <!--            </div>-->
        <!--        </Modal>-->
        <Modal :visible.sync="leavePageModal"
               class="modal-footer-margin"
               :modal-append-to-body="false"
               @closed="$store.state.app.currentPageName = 'database'"
               width="360px">
            <p slot="title">
                <span>{{$t('mail.leaveConfirm')}}</span>
            </p>
            <div>
                <p>您正在上传文件，离开页面将会中断上传，确定离开？</p>
            </div>
            <div slot="footer">
                <Button @click="handleLeaveCancel">{{$t('cancel')}}</Button>
                <Button type="primary" @click="handleLeaveConfirm">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import dataBaseTable from './Components/dataBaseComponents/dataBaseTable';
    import fileUpload from './Components/dataBaseComponents/fileUpload';
    import util from '../../../libs/util';
    import * as qiniu from 'qiniu-js';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { mapState } from 'vuex';
    export default {
        name: 'database',
        components: {
            dataBaseTable,
            fileUpload
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                qiniuHttp: 'qiniuHttp',
                parentId: state => state.crm.parentId,
                button_list: state => state.app.button_list,
                menuList: state => state.app.menu_list
            }),
            authorized_button() {
                const buttonIds = BUTTON_IDS.CRM.database;
                return {
                    person: {
                        disk: true, // !HANDLE_BUTTON(buttonIds.person_disk.id, this.menuList),
                        create_folder: true, // !HANDLE_BUTTON(buttonIds.person_disk.create_folder, this.button_list),
                        upload_file: true, // !HANDLE_BUTTON(buttonIds.person_disk.upload_file, this.button_list),
                        change_name: true, // !HANDLE_BUTTON(buttonIds.person_disk.change_name, this.button_list),
                        share_file: true, // !HANDLE_BUTTON(buttonIds.person_disk.share_file, this.button_list),
                        delete: true, // !HANDLE_BUTTON(buttonIds.person_disk.delete, this.button_list),
                        look: true, // !HANDLE_BUTTON(buttonIds.person_disk.look, this.button_list),
                        download: true // !HANDLE_BUTTON(buttonIds.person_disk.download, this.button_list)
                    },
                    company: {
                        disk: true, // !HANDLE_BUTTON(buttonIds.company_disk.id, this.menuList),
                        create_folder: true, // !HANDLE_BUTTON(buttonIds.company_disk.create_folder, this.button_list),
                        upload_file: true, // !HANDLE_BUTTON(buttonIds.company_disk.upload_file, this.button_list),
                        change_name: true, // !HANDLE_BUTTON(buttonIds.company_disk.change_name, this.button_list),
                        share_file: true, // !HANDLE_BUTTON(buttonIds.company_disk.share_file, this.button_list),
                        delete: true, // !HANDLE_BUTTON(buttonIds.company_disk.delete, this.button_list),
                        look: true, // !HANDLE_BUTTON(buttonIds.company_disk.look, this.button_list),
                        download: true // !HANDLE_BUTTON(buttonIds.company_disk.download, this.button_list)
                    },
                    share: {
                        disk: true, // !HANDLE_BUTTON(buttonIds.share_disk.id, this.menuList),
                        create_folder: true, // !HANDLE_BUTTON(buttonIds.share_disk.create_folder, this.button_list),
                        upload_file: true, // !HANDLE_BUTTON(buttonIds.share_disk.upload_file, this.button_list),
                        change_name: true, // !HANDLE_BUTTON(buttonIds.share_disk.change_name, this.button_list),
                        delete: true, // !HANDLE_BUTTON(buttonIds.share_disk.delete, this.button_list),
                        look: true, // !HANDLE_BUTTON(buttonIds.share_disk.look, this.button_list),
                        download: true // HANDLE_BUTTON(buttonIds.share_disk.download, this.button_list)
                    }
                };
            }
        },
        data() {
            return {
                activeTab: 'person',
                isShowUpload: false, // 控制上传弹窗的显示
                isMinimized: false, // 控制上传弹窗的最小化
                fileNum: 3, // 上传文件数量
                remindNum: 0,
                uploadData: [],
                isNewFolder: false, // 控制新建文件夹的显示,
                pageSize: 10,
                pageSizeOpts: [10, 20, 50],
                totalNum: 0,
                curPage: 1,
                maxPageNum: 1,
                /* 控制资料库table */
                contentTip: this.$t('BriefCase.uploadTip'),
                isRefreshPage: false,
                visible_file_existed: false, // 控制文件覆盖弹窗
                fileList: [], // 文件上传列表
                fakefileList: [], // 控制文件弹窗的假文件列表
                leavePageModal: false, // 控制离开页面的弹窗
                toRouterName: '', // 要跳转去的路由name
                toRouterObj: null, // fix bug ID1007772
                leavePageFlag: false,
                fakeUpload: [],
                subscription_list: [],
                fileAllow: ['mp4', 'webm', 'ogg', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'csv', 'png', 'jpg', 'gif']
            };
        },
        created() {
            this.$store.commit('setParentId', 0);
            // this.init();
        },
        updated() {
        },
        methods: {
            handleLeaveCancel() {
                this.leavePageModal = false;
                this.toRouterName = '';
                this.toRouterObj = null;
                this.$store.state.app.currentPageName = 'database';
            },
            handleLeaveConfirm() {
                this.leavePageModal = false;
                this.fileList = [];
                this.fakefileList = [];
                this.leavePageFlag = true;
                if (this.toRouterObj) {
                    this.$router.push(this.toRouterObj);
                }
            },
            handleTabClick(tab, event) {
                console.log(tab.name);
                this.$store.commit('currentFolderLabel', tab.name);
            },
            // trigger上传
            handleFilesUpload() {
                this.isNewFolder = false;
                this.$refs.fileToUpload.value = '';
                this.$refs.fileToUpload.click();
            },
            handleNewFolder() {
                this.isNewFolder = true;
            },
            updateIsNewFolder(val) {
                this.isNewFolder = val;
            },
            updateLeavePageFlag(val) {
                this.subscription_list.forEach(item => {
                    item.unsubscribe();
                });
            },
            handleUpload(event) {
                // 首先清空uploadData 上传的文件数量
                this.uploadData = [];
                this.fileNum = 0;
                this.fileList = [];
                this.fakefileList = [];
                this.subscription_list = [];
                this.leavePageFlag = false;
                const files = event.target.files;
                const maxSize = 1024 * 1024 * 1024; // 1G
                if (files && files.length) {
                    // 各种校验
                    // 如：重名校验
                    // 后期如果需要文件数量校验等等v
                    // 文件名长度校验
                    let lenNum = 0;
                    let sizeNum = 0;
                    for (let i = 0; i < files.length; i++) {
                        const tempStr = files[i].name.substring(0, files[i].name.lastIndexOf('.'));
                        // 文件大小校验信息收集
                        const size = files[i].size;
                        const len = this.validateTextLength(tempStr);
                        // 文件大小为0k的话, 不能上传
                        if (size === 0) {
                            this.$Message.error('文件大小为 0 kb，无法上传 ');
                            return;
                        };
                        if (len > 50) {
                            lenNum++;
                        }
                        if (size > maxSize) {
                            sizeNum++;
                        }
                    }
                    if (lenNum > 0) {
                        this.$Message({
                            message: `您选择的文件中有${lenNum}个文件名称超过100字符的文件，请重新上传`,
                            type: 'warning',
                            offset: 20
                        });
                    }
                    if (sizeNum > 0) {
                        // this.$Message.warning(`您选择的文件中有${sizeNum}个超过50M的文件，请重新上传`);
                        this.$Message({
                            message: `您选择的文件中有${sizeNum}个超过1G的文件，请重新上传`,
                            type: 'warning',
                            offset: lenNum === 0 ? 20 : 40
                        });
                    }
                    // // 文件格式校验 去掉格式校验，可上传所有格式
                    // let typeNum = 0;
                    // const arr = this.fileAllow;
                    // for (let i = 0; i < files.length; i++) {
                    //     const fileType = this.getFileSuffix(files[i].name).toLowerCase();
                    //     if (arr.indexOf(fileType) === -1) {
                    //         console.log(fileType);
                    //         typeNum++;
                    //     }
                    // }

                    // console.log('不符合的数量为', typeNum);
                    // if (typeNum > 0) {
                    //     // this.$Message.warning(`您选择的文件中有${typeNum}个文件格式错误的文件，请重新上传`);
                    //     this.$Message({
                    //         message: `您选择的文件中有${typeNum}个文件格式错误的文件，请重新上传`,
                    //         type: 'warning',
                    //         offset: lenNum === 0 && sizeNum === 0 ? 20 : 60
                    //     });
                    // }
                    // 删除不满足条件的文件
                    for (let i = 0; i < files.length; i++) {
                        // const fileType = this.getFileSuffix(files[i].name).toLowerCase();
                        const size = files[i].size;
                        const tempStr = files[i].name.substring(0, files[i].name.lastIndexOf('.'));
                        const len = this.validateTextLength(tempStr);
                        if (size <= maxSize && len <= 50) {
                            const _file = {
                                name: files[i].name,
                                size: files[i].size
                            };
                            this.fileList.push(files[i]);
                            this.fakefileList.push(_file);
                        }
                    }
                    // 文件名称重复校验
                    let flagNum = 0;
                    for (let i = 0; i < this.fileList.length; i++) {
                        util.ajax233({
                            url: `/${this.activeTab}/existFilename`,
                            method: 'post',
                            data: {
                                filename: this.fileList[i].name,
                                isFolder: 0,
                                parentId: this.parentId
                            }
                        }).then(res => {
                            if (res.data.code === '1') {
                                this.$set(this.fileList[i], 'isExisted', true);
                                this.$set(this.fakefileList[i], 'isExisted', true);
                                flagNum++;
                            } else {
                                this.$set(this.fileList[i], 'isExisted', false);
                                this.$set(this.fakefileList[i], 'isExisted', false);
                            }
                            if (flagNum === this.fileList.length) {
                                this.isShowUpload = false;
                            } else {
                                this.isShowUpload = true;
                            }
                        });
                    }
                    // 获取token后批量上传文件
                    util.ajax233({
                        url: '/place/uploadToken',
                        method: 'post',
                        data: {
                            number: this.fileList.length
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            const tempData = res.data.data[0];
                            const token = tempData.token;
                            const key = tempData.key;
                            const domain = tempData.domain;
                            this.uploadData = [];
                            for (let i = 0; i < this.fileList.length; i++) {
                                this.$set(this.fileList[i], 'isUploading', 0);
                                this.$set(this.fakefileList[i], 'isUploading', 0);
                                // 如果是已经存在文件 就不在fileupload弹窗中显示
                                // if (!this.fakefileList[i].isExisted) {
                                this.uploadData.push(this.fakefileList[i]);
                                // }
                                this.upload(this.fileList[i], token, key[i], domain, i);
                            }
                            this.fileNum = this.uploadData.length;
                        }
                    });
                }
            },
            // 文件上传（每个文件调用一次）
            async upload(file, token, key, domain, index) {
                if (file) {
                    // 获取file的全部信息，上传完成前就显示文件+进度条
                    const fileType = this.getFileSuffix(file.name);
                    // qiniu upload 的配置参数config
                    const config = {
                        useCdnDomain: true,
                        region: qiniu.region.z0
                    };
                    // qiniu upload的配置参数putExtra
                    const putExtra = {
                        fname: '',
                        params: {},
                        mimeType: null
                    };
                    // 定义回调next, error, complete
                    const next = response => {
                        this.$set(this.uploadData[index], 'percent', response.total.percent);
                    };
                    const error = response => {
                        this.$set(this.uploadData[index], 'isUploading', -1);
                        this.$Message.error(`文件${file.name}上传失败, 请重试`);
                        // 判断文件是否已经存在
                    };
                    const complete = response => {
                        if (this.leavePageFlag) {
                            return;
                        }
                        if (file.isExisted) {
                            // 调用弹窗
                            if (this.leavePageFlag) {
                                return;
                            }
                            this.$confirm('文件已存在，是否覆盖？', '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
                                if (this.leavePageFlag) {
                                    return;
                                }
                                util.ajax233({
                                    url: `/${this.activeTab}/uploadFile`,
                                    method: 'post',
                                    data: {
                                        filename: file.name,
                                        parentId: this.parentId,
                                        placeKey: key,
                                        placePath: domain,
                                        size: file.size,
                                        suffix: fileType
                                    }
                                }).then(res => {
                                    if (res.data.code === '1') {
                                        // 关闭上传弹窗
                                        this.isRefreshPage = true;
                                        this.$set(this.uploadData[index], 'isUploading', 1);
                                        this.remindNum++;
                                    } else {
                                        this.$Message.error(res.data.message);
                                    }
                                }).catch(() => {

                                });
                            });
                        } else {
                            // 文件不存在
                            util.ajax233({
                                url: `/${this.activeTab}/uploadFile`,
                                method: 'post',
                                data: {
                                    filename: file.name,
                                    parentId: this.parentId,
                                    placeKey: key,
                                    placePath: domain,
                                    size: file.size,
                                    suffix: fileType
                                }
                            }).then(res => {
                                if (res.data.code === '1') {
                                    // 关闭上传弹窗
                                    // 刷新页面
                                    this.$set(this.uploadData[index], 'isUploading', 1);
                                    this.remindNum++;
                                    this.isRefreshPage = true;
                                } else {
                                    this.$Message.error(res.data.message);
                                }
                            });
                        }
                    };
                    // 调用sdk上传接口获得相应的observable，控制上传
                    const observable = await this.$qiniuUpload(file, key, putExtra, config, token);
                    const subscription = observable.subscribe(next, error, complete);
                    this.subscription_list.push(subscription);
                }
            },
            // 获取文件后缀
            getFileSuffix(name) {
                const lastIndex = name.lastIndexOf('.');
                if (lastIndex === -1) {
                    return 'other';
                }
                return name.substr(lastIndex + 1).toLowerCase();
            },
            isUploadCompleted(data) {
                if (data) {
                    // 1s后消失弹窗
                    setTimeout(() => {
                        this.isShowUpload = false;
                    }, 3000);
                    this.fileList = [];
                }
            },
            init() {
                util.ajax({
                    url: 'new-privilege/resource/getMenu',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId
                    }
                }).then(({ data }) => {
                    // 处理原始数据, 更新 vuex menuList (平铺数组), 更新 vuex roleMenu (原始数据)并存入 localStorage , 更新 vuex router_map (添加动态路由 + 给左侧目录使用)
                    this.$store.commit('set_menu_list', data.data.menuList);
                    const flag = ['person', 'company', 'share'].some(item => {
                        return this.authorized_button[item].disk;
                    });
                    const arr = ['person', 'company', 'share'].filter(item => {
                        return this.authorized_button[item].disk;
                    });
                    if (!flag) {
                        this.activeTab = '';
                    } else {
                        this.activeTab = arr[0];
                        this.isRefreshPage = true;
                    }
                    this.$store.commit('currentFolderLabel', this.activeTab);
                });
            },
            // 校验文本长度
            validateTextLength(value) {
                // 中文、中文标点、全角字符按1长度，英文，英文符号、数字按0.5长度计算
                const cnReg = /([\u4e00-\u9fa5]|[\u3000-\u303F]|[\uFF00-\uFF60])/g;
                const mat = value.match(cnReg);
                let length = 0;
                if (mat) {
                    length = (mat.length + (value.length - mat.length) * 0.5);
                    return length;
                } else {
                    return value.length * 0.5;
                }
            },
            // 判断文件是否存在
            isFileExisted(filename, isFolder) {
                util.ajax233({
                    url: `/${this.activeTab}/existFilename`,
                    method: 'post',
                    data: {
                        filename: filename,
                        isFolder: isFolder,
                        parentId: this.parentId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        return true;
                    } else {
                        return false;
                    }
                });
            },
            // 切换tab的回调函数
            beforeLeave(item) {
                if (this.isShowUpload) {
                    const p = new Promise((resolve, reject) => {
                        this.$confirm(`离开${this.getCrumb(this.activeTab)}将会中断本次上传`, '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => {
                            // 中断上传
                            this.leavePageFlag = true;
                            this.isShowUpload = false;
                            this.subscription_list.forEach(item => {
                                item.unsubscribe();
                            });
                            // 初始化所有有关上传的变量
                            this.uploadData = [];
                            this.fileList = [];
                            this.fakefileList = [];
                            resolve();
                        }).catch(err => {
                            reject(err);
                        });
                    });
                    return p;
                }
            },
            getCrumb(base) {
                if (base === 'person') {
                    return '个人文件';
                } else if (base === 'company') {
                    return '公司文件';
                } else {
                    return '共享文件';
                }
            }
        },
        watch: {
            parentId: {
                handler(val) {
                    if (val == undefined) {
                        this.$store.commit('setParentId', 0);
                    }
                },
                immediate: true
            }
        },
        beforeRouteLeave(to, from, next) {
            if (to.name === 'login') {
                next();
            } else if (this.toRouterObj && to.name === this.toRouterObj.name && !this.leavePageModal) {
                next();
            } else if (this.isShowUpload) {
                const { name, params } = to;
                this.toRouterObj = { name, params };
                this.leavePageModal = true;
            } else {
                const { name, params } = to;
                this.toRouterObj = { name, params };
                next();
            }
        }
    };
</script>

<style scoped lang="less">

</style>
<style lang="less">
    .database_container {
        .database_header {
            padding-top: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;;
        }
        .database_tabs {
            .el-tabs__nav-wrap:after {
                height: 0 !important;
            }
            .el-tabs__nav {
                margin-left: 30px;
            }
        }
        .database_buttons_container {
            position: relative;
            margin-right: 30px;
            .upload_button {
                position: relative;
                top: -40px;
                right: -42px;
            }
        }
    }
</style>
