<template>
    <div>
        <Modal :visible="visible"
               :title="['userManagement'].includes(type)? $t('authority.userManagement.importData') : $t('crm.Modal.title_importData')"
               width="600px"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               class="modal"
               >
            <!-- loading -->
            <Spin fix v-if="id_process">
                <Icon type="ios-loading"
                      size=36
                      class="demo-spin-icon-load"></Icon>
                <div v-text="`${percent_process}%`"></div>
            </Spin>
            <Spin fix v-if="type ==='userManagement' && uploading">
                <Icon type="ios-loading"
                      size=36
                      class="demo-spin-icon-load"></Icon>
            </Spin>

            <div v-show="!isFinished">
                <Row :gutter="16" style="padding-bottom: 12px;">
                    <Col :span="2">
                        <div class="circleSeq">1</div>
                    </Col>
                    <Col :span="15">
                        <span>{{ $t('crm.Modal.prepareData') }}</span>
                    </Col>
                    <Col :span="7">
                        <div @click="downloadTemplate"
                             class="operate operate16">
                            <Icon type="arrow-down-a"
                                  size="20"></Icon>
                            <span>{{ $t('crm.Modal.downloadTemplate') }}</span>
                        </div>
                        <div @click="downloadCountryArea"
                             v-if="!['followUpRecord', 'userManagement'].includes(type)"
                             class="operate operate16">
                            <Icon type="arrow-down-a"
                                  size="20"></Icon>
                            <span>{{ '下载国家地区对应表' }}</span>
                        </div>
                    </Col>
                </Row>
                <Row :gutter="16">
                    <Col :span="2">
                        <div class="circleSeq">2</div>
                    </Col>
                    <Col :span="15">
                        <span>{{ $t('crm.Modal.selectFile') }}</span>
                    </Col>
                    <Col :span="7">
                        <div @click="uploadTrigger"
                             class="operate">
                            <Icon type="upload"
                                  size="20"></Icon>
                            <span>{{ $t('crm.Modal.addFile') }}</span>
                        </div>
                    </Col>
                </Row>

                <!-- excel 文件的 MIME 好像特别多,搜了一个说最新的是 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet ,感觉麻烦,干脆不做限定了-->
                <input type="file"
                       :disabled="isFinished"
                       ref="importData"
                       @change="uploadDataFile"
                       style="display: none">
                <Row v-if="uploadFile.size">
                    <Col :span="20"
                         :push="2">
                        <Tag @close="requestCancel"
                             closable>
                            <span>
                                <u>{{ uploadFile.name }}</u> - {{ fileSize }}
                            </span>
                        </Tag>
                        <Progress :percentage="uploadPercent"
                                  :stroke-width="5"
                                  :show-text="false"></Progress>
                    </Col>
                </Row>

                <Row>
                    <Col :span="2">{{ $t('crm.Modal.notice') }}:</Col>
                    <Col :span="22">
                        <p>{{ $t('crm.Modal.fileFormatRequirement') }}</p>
                    </Col>
                </Row>
                <Row>
                    <Col :span="2">{{ $t('crm.Modal.hint') }}:</Col>
                    <Col :span="22">
                        <p>
                            {{ $t('crm.Modal.importTip') }}
                            <br>
                            {{ $t('crm.Modal.fileSizeRequirement') }}
                        </p>
                    </Col>
                </Row>
            </div>

            <div v-show="isFinished">
                <p>{{ returnMsg }}</p>
                <template v-if="detailInfo.length">
                    <br>
                    <span @click="detailInfoShow=!detailInfoShow"
                          class="operate">{{ $t('crm.Modal.detailInfo') }}
                        <Icon type="chevron-down"></Icon>
                    </span>
                    <br>

                    <div v-show="detailInfoShow"
                         class="detailInfo">
                        <ul>
                            <li v-for="item in detailInfo">
                                {{ item }}
                            </li>
                        </ul>
                    </div>
                </template>
                <template v-if="errorFile">
                    <br>
                    <span @click="downloadFailedFile"
                          class="operate">{{ $t('crm.Modal.downloadFailureRecord') }}
                    </span>
                </template>
            </div>

            <div slot="footer">
                <template v-if="!isFinished">
                    <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                    <Button type="primary"
                            @click="ok"
                            :class="class_importdatasave">{{ $t('crm.Modal.modal_save') }}
                    </Button>
                </template>
                <template v-if="isFinished">
                    <Button type="primary"
                            @click="cancel">{{ $t('crm.Modal.modal_ok') }}</Button>
                </template>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmCommon } from '@/api/crm/index';

    export default {
        name: 'importData',
        props: [
            'type',
            'visible'
        ],
        computed: {
            ...mapState([
                'enterpriseId',
                'userId',
                'fullName',
                'qiniuHttp'
            ]),
            fileSize() {
                let returnValue = '';
                if (this.uploadFile.size) {
                    const size = ['byte', 'kb', 'mb', 'gb'];
                    size.some((item, key) => {
                        if (this.uploadFile.size / Math.pow(1024, key + 1) < 1) {
                            returnValue = `${(this.uploadFile.size / Math.pow(1024, key)).toFixed(2)}${item}`;
                            return true;
                        }
                    });
                }
                return returnValue;
            },
            percent_process() {
                if (this.size_all) {
                    return Math.floor(this.size_processed / this.size_all * 100);
                } else {
                    return 0;
                }
            },
            class_importdatasave() {
                switch (this.type) {
                    case 'customer':
                        return 'customer-importdatasave';
                    case 'inquiry':
                        return 'inquiry-importdatasave';
                    default:
                        return '';
                }
            }
        },
        data() {
            return {
                /* 上传文件 */
                uploading: false,
                detailInfoShow: false,
                uploadFile: {},
                uploadPercent: 0,
                source: null, // axios 的取消令牌,用于取消上传文件

                /* 查询进度 */
                id_process: 0,
                id_interval_process: '',
                size_all: 0,
                size_processed: 0,
                isFinished: false,
                detailInfo: [],
                returnMsg: '',
                errorFile: ''
            };
        },
        methods: {
            ok() {
                if (this.uploadFile.size) {
                    if (this.uploading) return;
                    this.uploading = true;
                    const CancelToken = this.$util.axios.CancelToken;
                    this.source = CancelToken.source();
                    const param = new FormData(); // 创建form对象
                    param.append('file', this.uploadFile, this.uploadFile.name); // 通过append向form对象添加数据
                    param.append('orgId', this.enterpriseId);
                    param.append('userId', this.userId);

                    const config = {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        cancelToken: this.source.token,
                        onUploadProgress: progressEvent => {
                            this.uploadPercent = Math.floor(100 * progressEvent.loaded / progressEvent.total);
                        },
                        timeout: 10 * 60 * 1000
                    };
                    if (['customer', 'inquiry'].includes(this.type)) {
                        this.$util.axios.post(`${this.$util.ajaxUrl}/crm/inquiryImportLog/doUpload`, param, config).then(response => {
                            this.uploading = false;
                            this.uploadFile = {};
                            this.source = null;

                            if (response.data.code === '1' && response.data.data) {
                                this.id_process = response.data.data;
                            } else {
                                this.$Message.error(response.data.message);
                            }
                        }).catch(thrown => {
                            this.uploading = false;
                            if (this.$util.axios.isCancel(thrown)) {
                                this.$Message.info(thrown.message);
                                this.uploadFile = {};
                                this.uploadPercent = 0;
                                this.source = null;
                            } else {
                                console.error(thrown);
                                this.$Message.error(this.$t('requestTimeout'));
                            }
                        });
                    }
                    if (['followUpRecord'].includes(this.type)) {
                        this.$util.axios.post(`${this.$util.ajaxUrl}/crm-transfer/followupDownloadOrUpload/doUpload`, param, config).then(response => {
                            this.uploading = false;
                            this.uploadFile = {};
                            this.source = null;

                            if (response.data.code === '1' && response.data.data) {
                                this.id_process = response.data.data;
                            } else {
                                this.$Message.error(response.data.message);
                            }
                        }).catch(thrown => {
                            this.uploading = false;
                            if (this.$util.axios.isCancel(thrown)) {
                                this.$Message.info(thrown.message);
                                this.uploadFile = {};
                                this.uploadPercent = 0;
                                this.source = null;
                            } else {
                                console.error(thrown);
                                this.$Message.error(this.$t('requestTimeout'));
                            }
                        });
                    }
                    if (['userManagement'].includes(this.type)) {
                        param.append('userName', this.fullName);
                        this.$util.axios.post(`${this.$util.ajaxUrl}/new-privilege/user/upload`, param, config).then(response => {
                            this.uploading = false;
                            this.uploadFile = {};
                            this.source = null;

                            if (response.data.code === '1' && response.data.data) {
                                this.isFinished = true;
                                this.returnMsg = response.data.data.message;
                                if (response.data.data.failRows) {
                                    this.errorFile = response.data.data.logId;
                                }
                                this.$emit('refreshData');
                            } else {
                                this.$Message.error(response.data.message);
                            }
                        }).catch(thrown => {
                            this.uploading = false;
                            if (this.$util.axios.isCancel(thrown)) {
                                this.$Message.info(thrown.message);
                                this.uploadFile = {};
                                this.uploadPercent = 0;
                                this.source = null;
                            } else {
                                console.error(thrown);
                                this.$Message.error(this.$t('requestTimeout'));
                            }
                        });
                    }
                }
            },
            cancel() {
                this.$emit('update:visible', false);
                setTimeout(() => {
                    this.uploading = false;
                    this.isFinished = false;
                    this.detailInfo = [];
                    this.returnMsg = '';
                    this.detailInfoShow = false;
                    this.uploadFile = {};
                    this.uploadPercent = 0;
                    this.source = null;
                    this.errorFile = '';
                }, 200);
            },
            get_process() {
                this.id_interval_process = setInterval(() => {
                    crmCommon.inquiryImportLogGet({
                        id: this.id_process
                    }).then(res => {
                        if (res.code === '1') {
                            const { sumCount: size_all, updateCount: size_processed, result, totalResult: returnMsg, isCompleted } = res.data;

                            this.size_all = size_all;

                            if (size_processed > this.size_processed) {
                                this.size_processed = size_processed;
                            }

                            if (isCompleted === 1) {
                                clearInterval(this.id_interval_process);
                                this.returnMsg = returnMsg;
                                this.detailInfo = this.$options.filters.parseArray(result);

                                this.uploadPercent = 0;
                                this.isFinished = true;
                                this.id_process = 0;
                                this.id_interval_process = '';
                                this.size_all = 0;
                                this.size_processed = 0;

                                this.$emit('refreshData');
                            }
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_queryProcess'));
                        }
                    });
                }, 5000);
            },
            // 下载国际地区对应表
            downloadCountryArea() {
                window.open(`${this.qiniuHttp}/systemfile/%E5%9B%BD%E5%AE%B6%E5%9C%B0%E5%8C%BA%E5%AF%B9%E5%BA%94%E8%A1%A8.xlsx`);
            },
            downloadTemplate() {
                if (['customer', 'inquiry'].includes(this.type)) {
                    window.open(`${this.$util.ajaxUrl}/crm/inquiry/downLoad?orgId=${this.enterpriseId}`);
                }
                if (['followUpRecord'].includes(this.type)) {
                    window.open(`${this.$util.ajaxUrl}/crm-transfer/followupDownloadOrUpload/download/template`);
                }
                if (['userManagement'].includes(this.type)) {
                    window.open(`${this.$util.ajaxUrl}/new-privilege/user/downloadTemplate?orgId=${this.enterpriseId}`);
                }
            },
            uploadTrigger() {
                this.$refs.importData.click();
            },
            uploadDataFile(event) {
                if (!event.target.files[0]) {
                    event.target.value = '';
                    return;
                }
                if (event.target.files[0].size > Math.pow(1024, 2)) {
                    event.target.value = '';
                    this.$Message.error(this.$t('crm.Modal.error_fileOutSize'));
                    return;
                }
                if (['xls', 'xlsx'].indexOf(event.target.files[0].name.split('.').slice(-1)[0]) === -1) {
                    event.target.value = '';
                    this.$Message.error(this.$t('crm.Modal.error_fileFormat'));
                    return;
                }
                this.uploadFile = event.target.files[0];
                event.target.value = '';
            },
            requestCancel(event, name) {
                if (this.uploading) {
                    this.source.cancel(this.$t('crm.Modal.cancelUpload'));
                } else {
                    this.uploadFile = {};
                }
            },
            downloadFailedFile() {
                window.open(`${this.$util.ajaxUrl}/new-privilege/user/download?orgId=${this.enterpriseId}&logId=${this.errorFile}`);
            }
        },
        beforeDestroy() {
            if (this.id_interval_process) {
                clearInterval(this.id_interval_process);
                this.id_interval_process = '';
            }
        },
        watch: {
            id_process: {
                handler(val) {
                    if (val) {
                        this.get_process();
                    } else {
                        if (this.id_interval_process) {
                            clearInterval(this.id_interval_process);
                        }
                    }
                }
            }
        }
    };
</script>

<style scoped lang="less">
    * {
        & /deep/ .el-row {
            padding-bottom: 30px;
        }

        & /deep/ .el-dialog__body {
            color: gray;
            font-size: 14px;
            padding: 30px;
        }

        & /deep/ .el-progress-bar__outer {
            background-color: #51B7A3;
        }

        & /deep/ .el-tag {
            height: auto;
            white-space: normal;
            border: none;
            background: none;

            & span {
                color: #51b7a3;
            }
        }
    }

    .circleSeq {
        background-color: gray;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        color: white;
        text-align: center;
        padding: 1px 0;
        line-height: 20px;
    }

    .operate {
        color: #FA8241;
        cursor: pointer;

        & i {
            vertical-align: middle;
        }
    }
    .operate16{
        margin-bottom: 12px;
    }

    .detailInfo {
        margin: 20px;
        padding-right: 20px;
        max-height: 237px;
        overflow: auto;

        &::-webkit-scrollbar {
            width: 4px;
            height: 10px;
            background-color: #c9c9c9;
        }

        &::-webkit-scrollbar-track {
            -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
            border-radius: 2px;
            background-color: #c9c9c9;
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 5px;
            -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
            background-color: #fc8b2f;
        }
    }

    li {
        list-style-type: none;
        width: 100%;
        padding: 5px 20%;
        border: 1px solid gainsboro;

        &:not(:first-child) {
            border-top: none;
        }
    }

    .demo-spin-icon-load {
        animation: ani-demo-spin 1s linear infinite;
    }

    @keyframes ani-demo-spin {
        from {
            transform: rotate(0deg);
        }
        50% {
            transform: rotate(180deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
