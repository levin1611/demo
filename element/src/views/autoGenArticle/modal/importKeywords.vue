<template>
    <div>
        <Modal :visible="visible"
               :title="$t('autoGenArticle.templateImport')"
               width="600px"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               class="modal">
            <Spin fix v-if="uploading">
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
            </div>

            <div slot="footer">
                <template v-if="!isFinished">
                    <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                    <Button type="primary"
                            @click="ok">{{ $t('crm.Modal.modal_save') }}
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

    export default {
        name: 'importKeywords',
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
            }
        },
        data() {
            return {
                /* 上传文件 */
                uploading: false,
                uploadFile: {},
                uploadPercent: 0,
                source: null, // axios 的取消令牌,用于取消上传文件

                /* 查询进度 */
                isFinished: false,
                returnMsg: ''
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

                    param.append('userName', this.fullName);
                    this.$util.axios.post(`${this.$util.ajaxUrl}/new-privilege/keyword/upload`, param, config).then(response => {
                        this.uploading = false;
                        this.uploadFile = {};
                        this.source = null;

                        if (response.data.code === '1' && response.data.data) {
                            this.isFinished = true;
                            this.returnMsg = this.$t('autoGenArticle.importKeywordsResult').replace('$successCount', response.data.data.length);
                            this.$emit('importSuccess', response.data.data);
                        } else {
                            switch (response.data.message) {
                                case '文件不满足上传条件，请调整后再试':
                                    this.$Message.error(this.$t('autoGenArticle.error_keywordsFile'));
                                    break;
                                case '未匹配到名为【关键词】的 sheet，请检查后重新添加文件':
                                    this.$Message.error(this.$t('autoGenArticle.error_noKeywordSheet'));
                                    break;
                                default:
                                    this.$Message.error(response.data.message);
                                    break;
                            }
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
            },
            cancel() {
                this.$emit('update:visible', false);
                setTimeout(() => {
                    this.uploading = false;
                    this.isFinished = false;
                    this.returnMsg = '';
                    this.uploadFile = {};
                    this.uploadPercent = 0;
                    this.source = null;
                }, 200);
            },
            downloadTemplate() {
                window.open(`${this.$util.ajaxUrl}/new-privilege/keyword/downloadKeywordTemplate`);
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
