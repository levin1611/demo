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
                :id="id"></CommunicationAccessories>

        <!-- 文档 -->
        <template v-if="current_compo === 'Documents'">
            <!-- 右上方各个按钮 -->
            <div class="document-list-operate">
                <!--新建文件夹-->
                <Button v-if="authorized_button['uploadDocument']"
                        type="text"
                        @click="showAddFolder">
                        <Tooltip :content="$t('crm.Html.newFolder')" placement="top">
                            <Icon custom="custom custom-icon_addfile"
                                size="14"></Icon>
                        </Tooltip>
                </Button>
                <!--上传文档-->
                <Button v-if="authorized_button['uploadDocument']"
                        type="text"
                        style="margin-left:0;"
                        @click="() => triggerUpload(folderId)"
                        class="piwik_companyDetail_uploadDocument">
                        <Tooltip :content="$t('crm.Html.uploadDocument')" placement="top">
                            <Icon custom="custom custom-upload"
                                size="14"></Icon>
                        </Tooltip>
                </Button>
                <!-- 筛选 -->
                <Poptip v-model="searchPopShow"
                        slot="append"
                        placement="bottom-end"
                        width="380"
                        popper-class="documentList-filter-pop">
                        <Tooltip  slot="reference" :content="$t('crm.newDetail.advanceFilter')" placement="top">
                            <Icon
                                :custom="searching ? 'custom-document-filtering' : 'custom-document-filter'"
                                size="14"
                                :title="$t('crm.newDetail.advanceFilter')"
                                class="piwik_companyDetail_searchDocument inquiry-filesearchbutton cursor-pointer"></Icon>
                        </Tooltip>
                    <div>
                        <div class="documentList-filter-title">{{ $t('crm.newDetail.advanceFilter') }}</div>
                        <Form ref="searchForm"
                            :model="searchForm"
                            label-position="left"
                            label-width="90px">
                            <!-- 文档上传日期 -->
                            <FormItem :label="$t('crm.newDetail.documentUploadTime')"
                                    prop="date">
                                <DatePicker v-model="searchForm.date"
                                            type="daterange"
                                            :picker-options="dateOptions"
                                            value-format="yyyy-MM-dd"
                                            :start-placeholder="$t('authority.startDate')"
                                            :end-placeholder="$t('authority.closeDate')"
                                            placement="bottom-start"
                                            style="width:100%;"
                                            transfer></DatePicker>
                            </FormItem>
                            <!-- 文档名称 -->
                            <FormItem :label="$t('crm.newDetail.documentTitle')"
                                    prop="name">
                                <Input v-model="searchForm.name"
                                    :placeholder="$t('crm.newDetail.tip_documentTitle')"></Input>
                            </FormItem>

                            <!-- 清空、搜索按钮 -->
                            <FormItem style="text-align: right;margin-bottom: 0;margin-top: 4px;">
                                <Button type="minor"
                                        size="small"
                                        @click="handleSearchAdvancedClear">{{$t('filter_box.empty')}}</Button>
                                <Button type="success"
                                        size="small"
                                        style="margin-left: 8px"
                                        @click="handleSearchAdvanced">{{ $t('mail.writeLetter.addContactModal.filter') }}</Button>
                            </FormItem>
                        </Form>
                    </div>
                </Poptip>
                <!-- 打包下载 -->
                <Button v-if="able_batchDownload"
                        :disabled="check_isDownloading(id)"
                        type="text"
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

            <div class="document_file_list">
                <FileList v-for="(item, index) in allFileList"
                        :key="index"
                        :isHighSeas="isHighSeas"
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
                        :loading="moveLoading"
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
    import JSZip from 'jszip';
    import { saveAs } from 'file-saver';
    import FileList from '@/views/crm/Detail/Components/Html/miniFileList';
    import CommunicationAccessories from './CommunicationAccessories';
    import { crmCommon } from '@/api/crm/index';

    export default {
        name: 'documentList',
        components: {
            FileList,
            CommunicationAccessories
        },
        props: [
            'id',
            'isHighSeas',
            'companyName',
            'disabled'
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
                if (this.disabled || this.isHighSeas) {
                    return {};
                }

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
                // loading
                loading: false,

                // 文件列表
                allFileList: [],
                // allFileNameMap: [], // key = fileName , value = filePath 去掉重名限制

                // 搜索
                // visible_search: false,
                searching: false,
                // searchDate: [],
                // searchDocumentName: '',
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
                searchPopShow: false, // 主页高级搜索气泡
                searchForm: {
                    date: [],
                    name: ''
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
                folderId: null // 文件夹id
            };
        },
        methods: {
            // 请求所有文件
            getFileList(searchFormData) {
                this.list_picked_file = [];
                this.dataList_picked_file = {};
                this.searchPopShow = false;
                const postData = {
                    orgId: this.enterpriseId,
                    foreignKey: this.id,
                    foreignType: 3
                };
                if (searchFormData) {
                    const { date, name } = searchFormData;
                    if (name || (Array.isArray(date) && date.length)) {
                        this.searching = true;
                        postData.documentName = name;
                        postData.startDate = Array.isArray(date) ? date[0] : undefined;
                        postData.endDate = Array.isArray(date) ? date[1] : undefined;
                    } else {
                        this.searching = false;
                    }
                }
                // 发送请求
                this.allFileList = [];
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
                    } else {
                        this.$Message.error(this.$t('crm.Html.error_getFileList'));
                    }
                    this.loading = false;
                }).catch(e => {
                    this.$Message.error(this.$t('crm.Html.error_getFileList'));
                    this.loading = false;
                });
            },
            // 获取文档文件夹列表
            getMoveFolder() {
                this.searchPopShow = false;
                const postData = {
                    inquiryId: this.id
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
            // 根据时间戳划分时间周期, 本周, 上周, 更早
            timestampToTime(timestamp) {
                const currentstamp = new Date(new Date().setHours(0, 0, 0, 0));
                const date = new Date();
                const dayofweek = date.getDay();
                const distance = currentstamp - dayofweek * 24 * 60 * 60 * 1000;
                const distance2 = currentstamp - (dayofweek + 7) * 24 * 60 * 60 * 1000;
                if (timestamp >= distance) {
                    return 1; // 本周
                } else if (timestamp >= distance2 && timestamp < distance) {
                    return 2; // 上周
                } else {
                    return 3; // 更早
                }
            },
            /* 右上角过滤 */
            // 高级搜索
            handleSearchAdvanced() {
                this.getFileList(this.searchForm);
                this.searchPopShow = false;
            },
            // 清空搜索数据
            handleSearchAdvancedClear() {
                this.$refs.searchForm.resetFields();
                this.handleSearchAdvanced();
            },
            /* 文件操作栏操作按钮 */
            fileDelete(file) {
                crmCommon.documentDelete({
                    orgId: this.enterpriseId,
                    id: file.id
                }).then(response => {
                    if (response.code === '1') {
                        if (response.data === true) {
                            this.$saveLog({
                                operateType: 3,
                                operateModule: 5,
                                inquiryId: this.id,
                                currentObj: {
                                    name: file.documentName
                                },
                                enterpriseId: this.enterpriseId,
                                userId: this.userId,
                                fullName: this.fullName
                            });
                            this.folderId = null;
                            // 清空筛选数据
                            this.searchForm = {
                                date: [],
                                name: ''
                            };
                            this.searching = false;
                            this.getFileList();
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
                    // 去掉重名限制
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
                        if (response.key.indexOf('.txt') !== -1) {
                            this.$commonApi.updateFileCharset({
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
                        foreignKey: this.id,
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
                            inquiryId: this.id,
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
                            this.getFileList();
                            this.folderId = null;
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Html.error_saveFile'));
                    }
                }).catch(error => {
                    console.error(error);
                    this.$Message.error(this.$t('crm.Html.error_saveFile'));
                });
            },
            /* 批量下载 */
            trigger_batchDownload() {
                if (this.check_isDownloading(this.id)) {
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
                    if (arr.length > 0) {
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
                if (this.check_isDownloading(this.id)) {
                    this.$Message.warning(this.$t('mail.packageDownloading'));
                    return;
                }
                this.dataList_picked_file = {};
                const title = `${this.companyName}-${this.$options.filters.timeFormat(new Date(), 'yyyyMMdd')}`;
                const vm = this;
                const promises = [];
                this.$store.commit('setDownloadingInquiryIds', Number(this.id));
                for (let i = 0; i < files.length; i++) {
                    promises.push(vm.getFileData(files[i]));
                }
                Promise.all([...promises]).then(() => {
                    const zip = new JSZip();
                    for (let i = 0; i < files.length; i++) {
                        const fileId = files[i].id;
                        zip.file(files[i].documentName, vm.dataList_picked_file[fileId].data);
                    }
                    zip.generateAsync({ type: 'blob' })
                        .then(function(content) {
                            // see FileSaver.js
                            saveAs(content, `${title}.zip`);
                            vm.list_picked_file = [];
                            vm.dataList_picked_file = {};
                            vm.$store.commit('setDownloadingInquiryIds', 0 - Number(vm.id));
                        });
                }).catch(error => {
                    console.error(error);
                    vm.list_picked_file = [];
                    vm.dataList_picked_file = {};
                    vm.$store.commit('setDownloadingInquiryIds', 0 - Number(vm.id));
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
            check_isDownloading(id) {
                return this.downloadingInquiryIds.findIndex(item => `${item}` === `${id}`) !== -1;
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
                        data.inquiryId = Number(this.id);
                    }
                } else {
                    data.createUserId = this.userId;
                    data.inquiryId = Number(this.id);
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
                if (this.moveFileRadio !== -1) {
                    data.folderId = this.moveFileRadio;
                }
                crmCommon.moveDocument(data).then(response => {
                    this.moveLoading = false;
                    if (response.code === '1') {
                        this.visible_add_files = false;
                        this.folderId = null;
                        this.visible_move_file = false;
                        this.moveFileRadio = '';
                        // 清空筛选数据
                        this.searchForm = {
                            date: [],
                            name: ''
                        };
                        this.searching = false;
                        this.getFileList();
                        this.$Message.success(this.$t('crm.Detail.success_editTable'));
                    } else {
                        this.$Message.error(this.$t('mail.writeLetter.addContactModal.requestErrorTip'));
                    }
                });
            },
            handleTabClick(tab, event) {
                if (tab.name !== 'Documents') {
                    // 清空筛选数据
                    this.searchForm = {
                        date: [],
                        name: ''
                    };
                    this.searching = false;
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
    .document-list-operate {
        text-align: right;
        padding: 0 30px;

        /deep/ i {
            margin-left: 12px;
            color: #677f99;

            &:hover {
                color: #4285f4;
            }
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

    .document-search-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 15px 0;

        .document-search-item-label {
            flex: 1;
        }

        .document-search-item-input {
            width: 240px;
        }
    }

    .document_file_list{
        padding: 0 30px;
        height: calc(100% - 80px);
        overflow-y: auto;
    }

    .documentList{
        padding: 0;
        overflow: hidden;
        height: 100%;
        .related-tab-tabs{
            margin: 0 24px;

            /deep/ .el-tabs__nav-wrap::after{
                height: 0;
            }

            /deep/ .el-tabs__header{
                margin: 0;
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

        .text-center{
            color: rgba(0, 0, 0, 0.6);
            font-size: 12px;
        }
    }
</style>

<style lang="less">
    .documentList-filter-pop {
        padding: 16px;

        .documentList-filter-title {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 16px;
        }

        .el-form-item{
            margin-bottom: 10px;
        }
    }

    .add_files_modal{
        .el-dialog__header{
            padding: 24px 24px 20px 24px;
        }

        .el-dialog__body{
            padding: 0 30px;
        }

        .el-dialog__footer{
            padding: 0 24px 24px;
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
    }
</style>
