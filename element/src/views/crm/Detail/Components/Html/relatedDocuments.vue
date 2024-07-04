<template>
    <div class="documentList">
        <Tabs v-model="current_compo"
                @tab-click="handleTabClick"
                class="related-tab-tabs">
            <TabPane v-for="item in compo_list"
                        :key="item"
                        :name="item">
                <div slot="label">
                    <span>{{ $t(`crm.newDetail.module_${item}`) }}</span>
                </div>
            </TabPane>
        </Tabs>

        <!-- 沟通附件 -->
        <CommunicationAccessories
                :companyName="companyName"
                v-if="current_compo === 'CommunicationAccessories'"
                :moveFileList="moveFileList"
                :id="inquiryId"></CommunicationAccessories>

        <!-- 文档 -->
        <template v-if="current_compo === 'Documents'">
            <!-- 右上方各个按钮 -->
            <div class="document-list-operate">
                <!--新建文件夹-->
                <Button v-if="authorized_button['uploadDocument']"
                        type="text"
                        :title="$t('crm.Html.newFolder')"
                        @click="showAddFolder">
                    <Icon custom="custom custom-icon_addfile"
                        size="14"></Icon>
                </Button>
                <!--上传文档-->
                <Button v-if="authorized_button['uploadDocument']"
                        type="text"
                        style="margin-left:0;"
                        :title="$t('crm.Html.uploadDocument')"
                        @click="() => triggerUpload(folderId)"
                        class="piwik_companyDetail_uploadDocument">
                    <Icon custom="custom custom-upload"
                        size="14"></Icon>
                </Button>

                <!--筛选-->
                <Button type="text"
                        style="margin-left:0;"
                        :title="$t('crm.newDetail.advanceFilter')"
                        @click="triggerFilter"
                        class="inquiry-filesearchbutton">
                    <Icon custom="custom custom-document-filter"
                        size="14"></Icon>
                </Button>

                <!-- 打包下载 -->
                <Button v-if="able_batchDownload"
                        :disabled="check_isDownloading(inquiryId)"
                        type="text"
                        style="margin-left:0;"
                        :title="$t('mail.packageDownload')"
                        @click="trigger_batchDownload"
                        class="piwik_companyDetail_batchDownload inquiry-batchdownloadfile">
                    <Icon custom="custom custom-batch-download"
                        size="14"></Icon>
                </Button>

                <!-- 文件上传 input -->
                <input type="file"
                    multiple
                    ref="fileToUpload"
                    @change="handleUpload"
                    style="display: none">
            </div>

            <div class="document_search" v-if="filterFlag">
                <Form ref="searchForm"
                    :model="searchForm"
                    label-position="left">
                    <!-- 文档上传日期 -->
                    <FormItem prop="date">
                        <DatePicker v-model="searchForm.date"
                                    type="daterange"
                                    :picker-options="dateOptions"
                                    value-format="yyyy-MM-dd"
                                    :start-placeholder="$t('authority.startDate')"
                                    :end-placeholder="$t('authority.closeDate')"
                                    placement="bottom-start"
                                    style="width:200px;"
                                    transfer></DatePicker>
                    </FormItem>
                    <!-- 文档名称 -->
                    <FormItem prop="name">
                        <Input v-model="searchForm.name"
                            style="width:164px;"
                            :placeholder="$t('crm.newDetail.tip_documentTitle')"></Input>
                    </FormItem>

                    <!-- 清空、搜索按钮 -->
                    <FormItem style="text-align: right;margin-bottom: 0;margin-top: 4px;">
                        <Button type="text"
                                size="small"
                                style="margin-left: 8px"
                                @click="handleSearchAdvanced">{{ $t('mail.writeLetter.addContactModal.filter') }}</Button>
                        <Button type="text"
                                size="small"
                                @click="handleSearchAdvancedClear">{{ '清除条件' }}</Button>
                    </FormItem>
                </Form>
            </div>

            <div class="document_file_list">
                <!-- <Spin v-if="loading" size="large" fix></Spin> -->
                <FileList v-for="(item, index) in allFileList"
                        :key="index"
                        :item="item"
                        :list_picked_file="list_picked_file"
                        @showAddFolder="showAddFolder"
                        :ableDelete="authorized_button['deleteDocument']"
                        :uploadFile="authorized_button['uploadDocument']"
                        @moveFile="moveFile"
                        @triggerUpload="triggerUpload"
                        @deleteFolder="deleteFolder"
                        @trigger_pick_file="trigger_pick_file"
                        @fileDelete="fileDelete"></FileList>

                <!-- 无数据 -->
                <div v-if="allFileList.length === 0"
                    class="text-center">{{ searching ? $t('crm.newDetail.noResult') : $t('crm.Table.noData') }}</div>
            </div>
        </template>


        <!-- 新增文件夹模态框 -->
        <Modal :visible.sync="visible_add_files"
               :title="$t('crm.Html.newFolder')"
               :append-to-body="true"
               :modal-append-to-body="false"
               :close-on-click-modal="false"
               width="460px"
               class="add_files_modal"
               @close="$refs.add_form.resetFields()">
            <!-- 输入区域 -->
            <div>
                <div>
                    <Form :model="add_form"
                          ref="add_form"
                          :rules="add_form_rule">
                        <FormItem prop="folderName">
                            <Input v-model="add_form.folderName"
                                   ref="folderNameInput"
                                   style="width:400px;"
                                   :placeholder="`${this.$t('crm.UniSet.pleaseEnter')}${this.$t('mail.customizedFolder.folderName')}`"></Input>
                        </FormItem>
                    </Form>
                </div>
            </div>

            <!-- 底部按钮 -->
            <div slot="footer">
                <Button @click="visible_add_files = false">{{ $t('authority.adminPermis.button_cancel') }}</Button>
                <Button type="primary"
                        :loading="addLoading"
                        @click="handle_submit('add_form')">{{ $t('authority.adminPermis.button_add') }}</Button>
            </div>
        </Modal>


        <!-- 移动至模态框 -->
        <Modal :visible.sync="visible_move_file"
               :title="$t('crm.Html.moveTo')"
               :append-to-body="true"
               :modal-append-to-body="false"
               :close-on-click-modal="false"
               width="460px"
               class="add_files_modal">
            <!-- 输入区域 -->
            <ul class="add_files_modal_list" :loading="moveListLoading">
                <li v-for="(item, index) in moveFileList" :key="index">
                    <Radio v-model="moveFileRadio" :label="item.folderId">{{''}}</Radio>
                    <svg class="svg-icon" v-if="index !== 0" aria-hidden="true" style="width: 22px; height: 22px;position:relative;top:4px;margin-left: 0;margin-right:6px;">
                        <use xlink:href="#custom-fp-paper-file"></use>
                    </svg>
                    <span class="folder_name" :title="item.folderName">
                        {{ item.folderName }}
                    </span>
                </li>
            </ul>

            <!-- 底部按钮 -->
            <div slot="footer">
                <Button @click="visible_move_file = false">{{ $t('authority.adminPermis.button_cancel') }}</Button>
                <Button type="primary"
                        @click="handle_move_submit()">{{ $t('crm.Html.move') }}</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import * as qiniu from 'qiniu-js';
    import util from '@/libs/util';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { mapState } from 'vuex';
    // import { get } from 'http';
    import JSZip from 'jszip';
    import { saveAs } from 'file-saver';
    import FileList from '@/views/crm/Detail/Components/Html/fileList';
    import { updateFileCharset } from '@/api/reusableApi/common';
    import { crmCommon } from '@/api/crm/index';
    import CommunicationAccessories from './relateAttachment.vue';

    export default {
        name: 'relatedDocuments',
        components: {
            FileList,
            CommunicationAccessories
        },
        props: [
            'inquiryId',
            'companyName',
            'disabled',
            'smallSize'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                qiniuHttp: 'qiniuHttp',
                button_list: state => state.app.button_list,
                downloadingInquiryIds: state => state.crm.downloadingInquiryIds
            }), // 从 vuex 中获取属性
            authorized_button() {
                const ids = BUTTON_IDS.CRM.inquiry;
                return {
                    uploadDocument: !HANDLE_BUTTON(ids.documentEdit.uploadDocument, this.button_list),
                    deleteDocument: !HANDLE_BUTTON(ids.documentEdit.deleteDocument, this.button_list),
                    batchDownloadDocument: !HANDLE_BUTTON(ids.documentEdit.batchDownload, this.button_list)
                };
            },
            able_batchDownload() {
                return this.authorized_button.batchDownloadDocument && this.allFileList.length > 1;
            }
        },
        data() {
            return {
                /* 底部 Tabs */
                compo_list: [
                    'Documents',
                    'CommunicationAccessories'
                ],
                current_compo: 'Documents',
                uploadingDisabled: false,
                loading: false,
                // 文件列表
                allFileList: [],
                // allFileNameMap: [], // key = fileName , value = filePath 去掉重名限制

                // 搜索
                date: [],
                searchContent: '',
                searchState: false,
                dateOptions: {
                    shortcuts: [
                        {
                            text: this.$t('crm.Html.today'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.Html.yesterday'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24);
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.Html.thisWeek'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                let dayNo = start.getDay();
                                dayNo = dayNo ? dayNo - 1 : 6;
                                start.setTime(start.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.Html.lastWeek'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                let dayNo = start.getDay();
                                dayNo = dayNo || 7;
                                end.setTime(end.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                start.setTime(end.getTime() - 6 * 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.Html.thisMonth'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(new Date(start.getFullYear(), start.getMonth(), 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.Html.lastMonth'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() - 24 * 60 * 60 * 1000);
                                start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        }
                    ]
                },

                // 预览
                previewShow: false,
                previewSrc: '',

                // 批量下载
                list_picked_file: [],
                dataList_picked_file: {},

                // 上传文件
                uploadingFileCount: 0,
                uploadedFileList: [],
                // ----- 新的数据 ------------------------------------
                searching: false,
                searchPopShow: false, // 主页高级搜索气泡
                searchForm: {
                    date: [],
                    name: ''
                },
                add_form_rule: {
                    folderName: [
                        {
                            required: true,
                            message: `${this.$t('crm.UniSet.pleaseEnter')}${this.$t('mail.customizedFolder.folderName')}`,
                            trigger: 'blur'
                        }
                    ]
                },
                visible_add_files: false, // 新建文件夹
                add_form: {
                    folderName: ''
                },
                moveLoading: false,
                moveListLoading: false,
                visible_move_file: false, // 移动到
                moveFileRadio: '',
                moveFileList: [],
                addLoading: false,
                folderId: null, // 文件夹id
                filterFlag: false
            };
        },
        methods: {
            /* 全局 */
            // 获取文档列表
            getFileList() {
                this.list_picked_file = [];
                this.dataList_picked_file = {};

                const postData = {
                    orgId: this.enterpriseId,
                    foreignKey: Number(this.inquiryId),
                    foreignType: 3
                };
                if (this.searchForm) {
                    const { date, name } = this.searchForm;
                    if (name || (Array.isArray(date) && date.length)) {
                        this.searching = true;
                        postData.documentName = name;
                        postData.startDate = Array.isArray(date) ? date[0] : undefined;
                        postData.endDate = Array.isArray(date) ? date[1] : undefined;
                    } else {
                        this.searching = false;
                    }
                }
                this.allFileList = [];
                this.moveFileList = [{
                    folderName: this.$t('crm.Html.rootDirectory'),
                    folderId: -1
                }];
                this.loading = true;
                crmCommon.getNewDocumentList(postData).then(response => {
                    if (response.code === '1') {
                        if (postData.documentName || postData.startDate || postData.endDate) {
                            this.allFileList = response.data.filter(item => {
                                item.showOperate = false;
                                return item.id || item.folderId;
                            });
                        } else {
                            this.allFileList = response.data.filter(item => {
                                item.showOperate = false;
                                return item;
                            });
                        }
                        const arr = response.data.filter((item) => item.folderId);
                        this.moveFileList.push(...arr);
                    } else {
                        this.$Message.error(this.$t('crm.Html.error_getFileList'));
                    }
                    this.loading = false;
                });
            },
            // 获取文档文件夹列表
            getMoveFolder() {
                this.searchPopShow = false;
                const postData = {
                    inquiryId: Number(this.inquiryId)
                };
                // 发送请求
                this.moveFileList = [{
                    folderName: this.$t('crm.Html.rootDirectory'),
                    folderId: -1
                }];
                this.moveListLoading = true;
                crmCommon.getMoveFolder(postData).then(response => {
                    if (response.code === '1') {
                        const arr = response.data.filter((item) => item.folderId);
                        this.moveFileList.push(...arr);
                    } else {
                        this.$Message.error(this.$t('crm.Html.error_getFileList'));
                    }
                    this.moveListLoading = false;
                }).catch(e => {
                    this.$Message.error(this.$t('crm.Html.error_getFileList'));
                    this.moveListLoading = false;
                });
            },
            // 删除文件
            fileDelete(file) {
                crmCommon.documentDelete({
                    orgId: this.enterpriseId,
                    id: file.id
                }).then(response => {
                    if (response.code === '1' && response.data) {
                        if (response.data === true) {
                            this.$saveLog({
                                operateType: 3,
                                operateModule: 5,
                                inquiryId: this.inquiryId,
                                currentObj: {
                                    name: file.documentName
                                },
                                enterpriseId: this.enterpriseId,
                                userId: this.userId,
                                fullName: this.fullName
                            });
                            // 清空筛选数据
                            this.searchForm = {
                                date: [],
                                name: ''
                            };
                            this.searching = false;
                            this.filterFlag = false;
                            this.getFileList();
                            this.folderId = null;
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Html.error_deleteFile'));
                    }
                });
            },

            /* 上传 */
            triggerUpload(folderId) {
                this.folderId = folderId;
                this.$refs.fileToUpload.value = '';
                this.$refs.fileToUpload.click();
            },
            handleUpload(event) {
                this.uploadedFileList = [];
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

                    this.uploadingDisabled = true;
                    /**
                     * @Description: 为解决文件上传到七牛后，点击预览，使用免费的office在线文档功能查看时，会提示File not found的问题
                     *               此处在获取到七牛的uptoken后，为每个文件增加一个uid，格式组成为：用户id+文件索引值+时间戳
                     * @author 杨娣
                     * @date 2020/5/25
                     */
                    // 获取 token 后批量发送上传请求
                    this.$commonApi.uptoken().then(response => {
                        if (response.uptoken) {
                            const token = response.uptoken;
                            for (let i = 0; i < files.length; i++) {
                                files[i].uid = parseInt(`${this.userId}${i}${Date.now()}`);
                                this.upload(files[i], token);
                            }
                        } else {
                            this.$Message.warning(this.$t('error_getUploadToken'));
                        }
                    }).catch(error => {
                        console.log(error);
                        this.$Message.error(this.$t('crm.Modal.error_uploadImage'));
                    });
                }
            },
            async upload(file, token) {
                if (file) {
                    // 获取 file 各项信息, 上传完成前就显示文件 + 进度条
                    const name = file.name;
                    let suffix = '';
                    if (name.indexOf('.') !== -1) {
                        suffix = name.split('.').slice(-1)[0].toLowerCase();
                        if (!/^[A-Za-z]+$/.test(suffix)) {
                            suffix = '';
                        }
                    }
                    // 产品要求去掉重名不让上传限制
                    // if (this.allFileNameMap.has(name)) {
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
                    /**
                     * @Description: 为解决文件上传到七牛后，点击预览，使用免费的office在线文档功能查看时，会提示File not found的问题
                     *               此处为上传到七牛的文件，增加key值，格式分为两部分拼接而成：
                     *               前半部分命名为uid，格式组成：用户id+文件索引值+时间戳
                     *               后半部分为："_crmDocument"+文件后缀名
                     * @author 杨娣
                     * @date 2020/5/25
                    */
                    const tempIndex = file.name.lastIndexOf('.');
                    const fileType = file.name.substring(tempIndex, file.name.length);
                    const keyName = `${file.uid}_crmDocument${fileType}`;
                    // 添加上传dom面板
                    const next = response => {
                        const index = this.allFileList.findIndex(item => item.uploading && item.documentName === name);
                        if (index !== -1) {
                            const temp = this.allFileList[index];
                            this.$set(this.allFileList, index, Object.assign(temp, { uploadPercent: response.total.percent }));
                        }
                    };
                    const error = response => {
                        this.uploadingFileCount--;
                        console.error(response);
                        this.$Message.error(`【${name}】${this.$t('crm.Modal.error_uploadImage')}`);

                        const index = this.allFileList.findIndex(item => item.uploading && item.documentName === name);
                        if (index !== -1) {
                            this.allFileList.splice(index, 1);
                        }
                    };
                    const complete = response => {
                        this.uploadingFileCount--;
                        const url = `${this.qiniuHttp}${response.key}`;
                        this.uploadedFileList.unshift({ name, url, suffix });
                        // this.allFileNameMap.set(name, url);
                        console.log('%c complete', 'color:red', response);
                        if (response.key.indexOf('.txt') !== -1) {
                            updateFileCharset({
                                key: response.key
                            }).then(data => {
                                if (data.code === 1) {
                                    // this.$Message.success(`${response.key}: 编码处理成功`);
                                    console.log(`${response.key}: 编码处理成功`);
                                } else {
                                    this.$Message.warning(`${response.key}: ${data.msg}`);
                                }
                            });
                        }
                        // 两秒后进度条消失
                        setTimeout(() => {
                            const index = this.allFileList.findIndex(item => item.uploading && item.documentName === name);
                            if (index !== -1) {
                                const temp = this.allFileList[index];
                                this.$set(this.allFileList, index, Object.assign(temp, { uploading: false }));
                            }
                        }, 1000);
                        if (this.uploadingFileCount === 0) {
                            this.fileSave();
                        }
                    };
                    // 调用sdk上传接口获得相应的observable，控制上传和暂停
                    const observable = await this.$qiniuUpload(file, keyName, putExtra, config, token);

                    // 渲染文件图标 + 进度条
                    this.allFileList.unshift({
                        documentName: name,
                        documentType: suffix,
                        uploading: true,
                        uploadPercent: 0,
                        createTime: Date.now()
                    });
                    // this.allFileNameMap.set(name, 'loading');
                    this.uploadingFileCount++;

                    // 开始上传
                    observable.subscribe(next, error, complete);
                    // }
                }
            },
            fileSave(refreshFlag = true) {
                const fileNames = this.uploadedFileList.map(item => item.name);
                const jsonData = this.uploadedFileList.map(item => {
                    return {
                        documentName: item.name,
                        documentPath: item.url,
                        documentType: item.suffix,
                        orgId: this.enterpriseId,
                        createUserId: this.userId,
                        createUser: this.fullName,
                        foreignKey: this.inquiryId,
                        foreignType: 3,
                        folderId: this.folderId
                    };
                });

                crmCommon.saveBatch(jsonData).then(response => {
                    if (response.code === '1') {
                        // 保存日志
                        this.$saveLog({
                            operateType: 4,
                            operateModule: 5,
                            inquiryId: this.inquiryId,
                            userId: this.userId,
                            fullName: this.fullName,
                            currentObj: {
                                name: fileNames.join(',\n')
                            },
                            enterpriseId: this.enterpriseId
                        });

                        if (refreshFlag) {
                            // 清空筛选数据
                            this.searchForm = {
                                date: [],
                                name: ''
                            };
                            this.searching = false;
                            this.filterFlag = false;
                            this.getFileList();
                            this.uploadingDisabled = false;
                            this.folderId = null;
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Html.error_saveFile'));
                    }
                });
            },

            /* 批量下载 */
            trigger_batchDownload() {
                if (this.check_isDownloading(this.inquiryId)) {
                    this.$Message.warning(this.$t('mail.packageDownloading'));
                    return;
                }

                if (this.list_picked_file.length) {
                    this.downloadFileZip(this.list_picked_file);
                } else {
                    // 整理文件集合，打包下载
                    const arr = [];
                    this.allFileList.forEach((item) => {
                        if (item.documentList && item.documentList.length) {
                            arr.push(...item.documentList);
                        }
                        if (item.id) {
                            arr.push(item);
                        }
                    });
                    if (arr.length) {
                        this.downloadFileZip(arr);
                    } else {
                        this.$Message.error(this.$t('crm.Html.error_noFiles'));
                    }
                }
            },
            trigger_pick_file(file) {
                this.list_picked_file = this.list_picked_file.find(item => item.id === file.id) ? this.list_picked_file.filter(item => item.checked) : this.list_picked_file.concat([file]);
            },
            downloadFileZip(files) {
                if (this.check_isDownloading(this.inquiryId)) {
                    this.$Message.warning(this.$t('mail.packageDownloading'));
                    return;
                }
                this.dataList_picked_file = {};
                const title = `${this.companyName}-${this.$options.filters.timeFormat(new Date(), 'yyyyMMdd')}`;
                const vm = this;
                const promises = [];
                this.$store.commit('setDownloadingInquiryIds', Number(this.inquiryId));
                for (let i = 0; i < files.length; i++) {
                    promises.push(vm.getFileData(files[i]));
                }
                Promise.all([...promises]).then(() => {
                    const zip = new JSZip();
                    for (let i = 0; i < files.length; i++) {
                        const fileId = files[i].id;
                        console.log(files[i], files[i].documentName, vm.dataList_picked_file[fileId], vm.dataList_picked_file[fileId].data);
                        zip.file(files[i].documentName, vm.dataList_picked_file[fileId].data);
                    }
                    zip.generateAsync({ type: 'blob' })
                        .then(function(content) {
                            // see FileSaver.js
                            saveAs(content, `${title}.zip`);
                            vm.list_picked_file = [];
                            vm.dataList_picked_file = {};
                            vm.$store.commit('setDownloadingInquiryIds', 0 - Number(vm.inquiryId));
                        });
                }).catch(error => {
                    console.error(error);
                    vm.list_picked_file = [];
                    vm.dataList_picked_file = {};
                    vm.$store.commit('setDownloadingInquiryIds', 0 - Number(vm.inquiryId));
                    vm.$Message.error(this.$t('mail.error_packageDownload'));
                });
            },
            getFileData(file) {
                return new Promise((resolve, reject) => {
                    util.ajaxDownloadFile({
                        url: file.documentPath,
                        method: 'get',
                        params: {
                            attname: file.documentName
                        }
                    }).then(res => {
                        this.dataList_picked_file[file.id] = res;
                        resolve(res);
                    }).catch(error => {
                        console.error(error);
                        reject();
                    });
                });
            },
            check_isDownloading(inquiryId) {
                return this.downloadingInquiryIds.findIndex(item => `${item}` === `${inquiryId}`) !== -1;
            },
            // --------- 新的方法 ---------------------------------------------------------------
            /* 右上角过滤 */
            // 高级搜索
            handleSearchAdvanced() {
                this.getFileList();
                this.searchPopShow = false;
            },
            // 清空搜索数据
            handleSearchAdvancedClear() {
                this.$refs.searchForm.resetFields();
                this.handleSearchAdvanced();
            },
            showAddFolder({ folderId, folderName } = {}) {
                this.folderId = folderId;
                this.add_form.folderName = folderName;
                this.visible_add_files = true;
                this.$nextTick(() => {
                    this.$refs.folderNameInput.focus();
                });
            },
            // 操作文件夹
            handle_submit(formName, isDelete = false) {
                if (!this.add_form.folderName && !isDelete) {
                    this.$refs.folderNameInput.focus();
                    this.$refs.folderNameInput.blur();
                    return;
                }
                this.addLoading = true;
                const data = {
                    ...this.add_form,
                    parentId: 0
                };
                let urlData = '';
                // 重命名
                if (this.folderId) {
                    data.updateUserId = this.userId;
                    data.folderId = this.folderId;
                    urlData = 'updateFolderName';
                    // 删除文件夹
                    if (isDelete) {
                        data.isDelete = 2;
                        delete data.folderName;
                    } else {
                        data.inquiryId = Number(this.inquiryId);
                    }
                } else {
                    data.createUserId = this.userId;
                    data.inquiryId = Number(this.inquiryId);
                    urlData = 'saveFolder';
                }
                crmCommon[urlData](data).then(response => {
                    this.addLoading = false;
                    if (response.code === '1') {
                        this.visible_add_files = false;
                        this.folderId = null;
                        this.$Message.success(this.$t('crm.Detail.success_editTable'));
                        // 清空筛选数据
                        this.searchForm = {
                            date: [],
                            name: ''
                        };
                        this.searching = false;
                        this.filterFlag = false;
                        this.getFileList();
                    } else {
                        this.$Message.error(this.$t('mail.writeLetter.addContactModal.requestErrorTip'));
                    }
                });
            },
            // 移动到显示模态框
            moveFile(file) {
                this.getMoveFolder();
                this.visible_move_file = true;
                this.currentMoveFile = file;
            },
            // 删除文件夹
            deleteFolder(folderId) {
                this.$confirm(this.$t('crm.Html.deleteFolderTip'), this.$t('crm.Modal.hint'), {
                    confirmButtonText: this.$t('crm.Modal.modal_ok'),
                    cancelButtonText: this.$t('crm.Modal.modal_cancel'),
                    type: 'warning'
                }).then(() => {
                    this.folderId = folderId;
                    this.handle_submit('add_form', true);
                });
            },
            handle_move_submit() {
                if (!this.moveFileRadio) {
                    return this.$Message(this.$t('crm.Html.selectDirectoryTip'));
                }
                this.moveLoading = true;
                const data = {
                    userId: this.userId,
                    documentId: this.currentMoveFile.id
                };
                if (this.moveFileRadio !== 0) {
                    data.folderId = this.moveFileRadio;
                }
                crmCommon.moveDocument(data).then(response => {
                    this.moveLoading = false;
                    if (response.code === '1') {
                        this.visible_add_files = false;
                        this.folderId = null;
                        this.visible_move_file = false;
                        this.moveFileRadio = '';
                        this.$Message.success(this.$t('crm.Detail.success_editTable'));
                        // 清空筛选数据
                        this.searchForm = {
                            date: [],
                            name: ''
                        };
                        this.searching = false;
                        this.filterFlag = false;
                        this.getFileList();
                    } else {
                        this.$Message.error(this.$t('mail.writeLetter.addContactModal.requestErrorTip'));
                    }
                });
            },
            // 控制筛选框状态
            triggerFilter() {
                this.filterFlag = !this.filterFlag;
                // 清空筛选数据
                this.searchForm = {
                    date: [],
                    name: ''
                };
            },
            handleTabClick(tab, event) {
                if (tab.name !== 'Documents') {
                    // 清空筛选数据
                    this.searchForm = {
                        date: [],
                        name: ''
                    };
                    this.searching = false;
                    this.filterFlag = false;
                }
                this.getFileList();
            }

        },
        created() {
            this.getFileList();
        }
    };
</script>

<style scoped lang="less">
    .search-block {
        display: inline-block;

        > i {
            margin-left: 20px;
        }
    }

    .upload-document-btn {
        float: right;
        font-size: 12px !important;
        border: none;
        outline: none;
        color: #3b78de !important;

        &:hover {
            color: #2d63bc !important;
            text-decoration: underline;
        }
    }

    .upload-document-btn-small {
        font-size: 12px !important;
        border: none;
        outline: none;
        color: #3b78de !important;

        &:hover {
            color: #2d63bc !important;
            text-decoration: underline;
        }
    }

    .searchBox {
        width: 200px;
        height: 32px;
        border: none;
        border-bottom: 1px solid #dddee1;
        padding-left: 3px;
        outline: medium;
    }

    /* 日期弹出框 */
    .el-date-editor {
        position: relative;
    }

    /* 设置placeholder的颜色 */
    ::-webkit-input-placeholder {
        color: #a5a5a5;
    }

    :-moz-placeholder {
        color: #a5a5a5;
    }

    ::-moz-placeholder {
        color: #a5a5a5;
    }

    :-ms-input-placeholder {
        color: #a5a5a5;
    }
// -------新样式---------------------------------------------------
    .documentList{
        padding: 0;
        overflow: hidden;
        .related-tab-tabs{

            /deep/ .el-tabs__nav-wrap::after{
                height: 0;
            }

            /deep/ .el-tabs__header{
                margin: 0;
                border: none;
            }

            /deep/ .el-tabs__item{
                font-weight: 400;
            }
            /deep/ .el-tabs__item.is-active{
                color: #4285F4;
                font-weight: bold;
            }
            /deep/ .el-tabs__item:hover{
                color: #4285F4;
            }
            /deep/ .el-tabs__active-bar{
                background-color: #fff;
            }

            /deep/ .el-tabs__nav-wrap:after{
                display: none;
            }
        }

        .document_search{

            /deep/ .el-form-item{
                display: inline-block;
                margin-right: 12px;
            }
            /deep/ .el-input__inner{
                font-size: 12px;
                height: 34px;
            }
            /deep/ .el-range-input{
                font-size: 12px;
            }
            /deep/ .el-button--text{
                color: #4285F4;
            }
        }

        .document-list-operate {
            text-align: right;

            /deep/ i {
                margin-left: 12px;
                color: #677f99;

                &:hover {
                    color: #4285f4;
                }
            }
        }

        .document_file_list{
            height: calc(100vh - 440px);
            overflow-y: auto;
            min-height: 200px;
            overflow-x: hidden;
        }

        .text-center{
            color: rgba(0, 0, 0, 0.6);
            font-size: 12px;
        }
    }

    .add_files_modal_list{
        margin-bottom: 24px;
        height: 220px;
        overflow-y: auto;

        li{
            height: 44px;
            line-height: 44px;
            color: rgba(0, 0, 0, 0.8);
            font-size: 12px;
            border-bottom: 1px solid #EFF0F4;

            &:hover{
                background-color: #F6F7FA;
            }

            .folder_name{
                width: calc(100% - 52px);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                display: inline-block;
                vertical-align: bottom;
            }
        }

        .el-radio{
            margin-right: 0;
        }
    }
</style>
