<template>
    <div class="communication_accessories_list">
        <RadioGroup v-model="current_compo"
                @change="wayChange">
            <RadioButton
                v-for="(item, index) in compo_list"
                :key="index"
                :label="$t(`crm.newDetail.module_${item}`)"></RadioButton>
        </RadioGroup>

        <!-- 右上方各个按钮 -->
        <div class="document-list-operate">
            <!-- 批量同步到 -->
            <Button v-if="authorized_button['syncDocuments']"
                    :disabled="list_picked_file.length === 0"
                    type="text"
                    :title="$t('crm.Html.batchSyncToDocument')"
                    @click="synchronizeFile(null, true)">
                <Icon custom="custom custom-icon_syn"
                    size="14"></Icon>
            </Button>

            <!-- 打包下载 -->
            <Button v-if="able_batchDownload"
                    :disabled="check_isDownloading(id)"
                    type="text"
                    style="margin-left:0;"
                    :title="$t('mail.packageDownload')"
                    @click="trigger_batchDownload"
                    class="piwik_companyDetail_batchDownload inquiry-batchdownloadfile">
                <Icon custom="custom custom-batch-download"
                    size="14"></Icon>
            </Button>

            <!-- 筛选 -->
            <Poptip v-model="searchPopShow"
                    slot="append"
                    placement="bottom-end"
                    width="380"
                    popper-class="documentList-filter-pop">
                <Icon slot="reference"
                    :custom="searching ? 'custom-document-filtering' : 'custom-document-filter'"
                    size="14"
                    :title="$t('crm.newDetail.advanceFilter')"
                    class="piwik_companyDetail_searchDocument inquiry-filesearchbutton cursor-pointer"></Icon>
                <div>
                    <div class="documentList-filter-title">{{ $t('crm.newDetail.advanceFilter') }}</div>
                    <Form ref="searchForm"
                        :model="searchForm"
                        label-position="left"
                        label-width="70px">
                        <!-- 起止日期 -->
                        <FormItem :label="$t('crm.Html.startEndTime')"
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
                        <!-- 收发类型 -->
                        <FormItem :label="$t('crm.Html.sendReceiveType')"
                                prop="type">
                                <Select v-model="searchForm.type"
                                        style="width:100%;">
                                    <Option v-for="(item) in typeOptions"
                                            :key="item.value"
                                            :value="item.value"
                                            :label="item.label"></Option>
                                </Select>
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
        </div>

        <div class="document_file_list"
                v-loading="loading"
                v-infinite-scroll="loadMore"
                :infinite-scroll-distance="10"
                :infinite-scroll-disabled="noMore"
                :infinite-scroll-immediate="false">
            <FileList :disabled="disabled"
                    :isHighSeas="isHighSeas"
                    :fileList="allFileList"
                    :visible_move_file.sync="visible_move_file"
                    :list_picked_file="list_picked_file"
                    :syncDocuments="authorized_button['syncDocuments']"
                    @synchronizeFile="synchronizeFile"
                    @trigger_pick_file="trigger_pick_file"></FileList>
            <p v-if="noMore && realTotal >= 100 && current_compo === this.$t('crm.newDetail.module_WhatsApp')"
                class="text-center">最多显示前100个附件</p>
        </div>


        <!-- 移动至模态框 -->
        <Modal :visible.sync="visible_move_file"
               :title="$t('crm.Html.syncTo')"
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
                    </svg>{{ item.folderName }}
                </li>
            </ul>

            <!-- 底部按钮 -->
            <div slot="footer">
                <Button @click="visible_move_file = false">{{ $t('authority.adminPermis.button_cancel') }}</Button>
                <Button type="primary"
                        @click="handle_move_submit()">{{ $t('crm.Html.sync') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { mapState } from 'vuex';
    import JSZip from 'jszip';
    import { saveAs } from 'file-saver';
    import FileList from '@/views/crm/Detail/Components/Html/onlyFileList';
    import { crmCommon } from '@/api/crm/index';

    export default {
        name: 'documentList',
        components: {
            FileList
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
                    batchDownloadDocument: !HANDLE_BUTTON(ids.documentEdit.batchDownload, this.button_list),
                    syncDocuments: !HANDLE_BUTTON(ids.documentEdit.syncDocuments, this.button_list)
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
                    'mail',
                    'WhatsApp'
                ],
                current_compo: this.$t('crm.newDetail.module_mail'),
                // 文件列表
                allFileList: [],
                searching: false,
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
                    name: '',
                    type: 0
                },
                moveFileList: [],
                moveListLoading: false,
                visible_move_file: false, // 同步到
                moveFileRadio: '',
                typeOptions: [
                    {
                        label: '全部',
                        value: 0
                    },
                    {
                        label: '接收',
                        value: 2
                    },
                    {
                        label: '发送',
                        value: 1
                    }
                ],
                realTotal: 0,
                pageNo: 1,
                pageSize: 20,
                noMore: false
            };
        },
        methods: {
            // 请求所有文件
            getFileList() {
                this.list_picked_file = [];
                this.dataList_picked_file = {};
                this.searchPopShow = false;
                const postData = {
                    orgId: this.enterpriseId,
                    inquiryId: this.id,
                    status: this.current_compo === this.$t('crm.newDetail.module_mail') ? 2 : 1,
                    pageSize: this.pageSize,
                    pageNo: this.pageNo
                };
                const { date, name, type } = this.searchForm;
                if (name || (Array.isArray(date) && date.length) || type) {
                    this.searching = true;
                    postData.fileName = name;
                    postData.startTime = Array.isArray(date) ? date[0] : undefined;
                    postData.endTime = Array.isArray(date) ? date[1] : undefined;
                    if (type) {
                        postData.fromOrToFlag = type;
                    }
                } else {
                    this.searching = false;
                }
                // 发送请求
                this.loading = true;
                crmCommon.getCommunicationAccessory(postData).then(response => {
                    if (response.code === '1') {
                        const arr = response.data.mailFileDtoList ? response.data.mailFileDtoList.map(item => {
                            item.showOperate = false;
                            return item;
                        }) : [];
                        this.allFileList.push(...arr);
                        // 当返回数据少于 pageSize 条的时候显示 没有更多数据，同时禁用滚动加载，先不考虑刚好等于 pageSize 条的情况
                        this.realTotal = response.data.number;
                        const total = response.data.number >= 100 && this.current_compo === this.$t('crm.newDetail.module_WhatsApp') ? 100 : response.data.number;
                        if (this.allFileList.length === total) {
                            this.noMore = true;
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
            trigger_pick_file(file) {
                this.list_picked_file = this.allFileList.filter(item => item.checked);
                this.$forceUpdate();
            },
            /* 右上角过滤 */
            // 高级搜索
            handleSearchAdvanced() {
                this.allFileList = [];
                this.pageNo = 1;
                this.noMore = false;
                this.getFileList();
                this.searchPopShow = false;
            },
            // 清空搜索数据
            handleSearchAdvancedClear() {
                this.$refs.searchForm.resetFields();
                this.handleSearchAdvanced();
            },
            check_isDownloading(id) {
                return this.downloadingInquiryIds.findIndex(item => `${item}` === `${id}`) !== -1;
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
                    if (this.allFileList.length) {
                        this.downloadFileZip(this.allFileList);
                    } else {
                        this.$Message.error(this.$t('crm.Html.error_noFiles'));
                    }
                }
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
            // 同步到显示模态框
            synchronizeFile(file, isBatch) {
                this.getMoveFolder();
                this.visible_move_file = true;
                if (isBatch) {
                    if (this.current_compo === this.$t('crm.newDetail.module_mail')) {
                        this.currentMoveFile = this.list_picked_file.map(item => item.id);
                    } else {
                        this.currentMoveFile = this.list_picked_file.map(item => item);
                    }
                } else {
                    if (this.current_compo === this.$t('crm.newDetail.module_mail')) {
                        this.currentMoveFile = [file.id];
                    } else {
                        this.currentMoveFile = [file];
                    }
                }
            },
            handle_move_submit() {
                if (!this.moveFileRadio) {
                    return this.$Message('请选择要同步的目录');
                }
                this.moveLoading = true;
                const data = {
                    createUserId: this.userId,
                    createUser: this.fullName,
                    inquiryId: this.id
                };
                if (this.current_compo === this.$t('crm.newDetail.module_mail')) {
                    data.fileIds = this.currentMoveFile;
                } else {
                    data.mailFileDtoList = this.currentMoveFile;
                }
                if (this.moveFileRadio !== -1) {
                    data.folderId = this.moveFileRadio;
                }
                crmCommon.syncFileToFolder(data).then(response => {
                    this.moveLoading = false;
                    if (response.code === '1') {
                        this.visible_add_files = false;
                        this.folderId = null;
                        this.visible_move_file = false;
                        this.moveFileRadio = '';
                        this.$Message.success(this.$t('crm.Detail.success_editTable'));
                        this.allFileList = [];
                        this.pageNo = 1;
                        this.noMore = false;
                        this.getFileList();
                    } else {
                        this.$Message.error(this.$t('mail.writeLetter.addContactModal.requestErrorTip'));
                    }
                });
            },
            // 切换沟通方式： 邮件、WA
            wayChange() {
                this.allFileList = [];
                this.pageNo = 1;
                this.noMore = false;
                this.searchForm = {
                    date: [],
                    name: '',
                    type: 0
                };
                this.getFileList();
            },
            loadMore() {
                // 正在加载中就先不请求接口了
                if (!this.loading) {
                    this.pageNo += 1;
                    this.getFileList();
                }
            }
        },
        created() {
            this.allFileList = [];
            this.pageNo = 1;
            this.noMore = false;
            this.getFileList();
        }
    };
</script>

<style scoped lang="less">
    .communication_accessories_list{
        margin-top: 2px;
        height: 100%;

        /deep/ .el-radio-button__inner{
            font-size: 13px;
            padding: 0;
            width: 88px;
            height: 34px;
            line-height: 34px;
            text-align: center;
        }

        /deep/ .el-radio-button__orig-radio:checked + .el-radio-button__inner{
            color: #4285F4;
            background-color: #fff;
            border-color: #4285F4;
            box-shadow: -1px 0 0 0 #4285F4;
        }

        /deep/ .el-radio-button__inner:hover{
            color: #4285F4;
        }

        /deep/ .el-radio-group{
            margin: 0 24px;
        }

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

        .document_file_list{
            padding: 0 24px;
            height: calc(100% - 100px);
            overflow-y: auto;
        }

        .text-center{
            color: rgba(0, 0, 0, 0.6);
            font-size: 12px;
        }
    }
</style>
