<template>
    <div>
        <Modal
            :visible="visible"
            :title="$t('clue.import_data')"
            width="600px"
            :show-close="false"
            :modal-append-to-body="false"
            class="modal">
                <Spin fix v-if="uploading"></Spin>
                <div v-show="!isFinished">
                    <Row :gutter="16" style="padding-bottom: 12px;">
                        <Col :span="2"><div class="circleSeq">1</div></Col>
                        <Col :span="15"><span>{{$t('clue.prepareData')}}</span></Col>
                        <Col :span="7">
                            <div class="operate operate16" @click="downloadTemplate">
                                <Icon type="arrow-down-a" size="20"></Icon>
                                <span>{{$t('clue.downloadTemplate')}}</span>
                            </div>
                            <div @click="downloadCountryArea"
                                class="operate operate16">
                                <Icon type="arrow-down-a"
                                    size="20"></Icon>
                                <span>{{ '下载国家地区对应表' }}</span>
                            </div>
                        </Col>
                    </Row>
                    <Row :gutter="16">
                        <Col :span="2"><div class="circleSeq">2</div></Col>
                        <Col :span="15"><span>{{$t('clue.selectFile')}}</span></Col>
                        <Col :span="7">
                            <div class="operate" @click="uploadTrigger">
                                <Icon type="upload" size="20"></Icon>
                                <span>{{$t('clue.addFile')}}</span>
                            </div>
                        </Col>
                    </Row>

                    <!-- excel 文件的 MIME 好像特别多,搜了一个说最新的是 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet ,感觉麻烦,干脆不做限定了-->
                    <!-- 点击添加文件时，触发onclick事件 -->
                    <input
                        accept=""
                        :disabled="isFinished"
                        type="file"
                        @change="uploadDataFile"
                        ref="importData"
                        style="display: none"
                    >
                    <!-- 显示添加文件的具体信息 -->
                    <Row v-if="uploadFile.size">
                        <Col :span="20" :push="2">
                            <Tag closable @close="requestCancel">
                                <span><u>{{ uploadFile.name }}</u> - {{ fileSize }}</span>
                            </Tag>
                        </Col>
                    </Row>

                    <Row>
                        <Col :span="2">{{$t('clue.notice')}}:</Col>
                        <Col :span="22">
                            <p>{{$t('clue.fileFormatRequirement')}}</p>
                            <p>{{$t('clue.limit5')}}</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col :span="2">{{$t('clue.hint')}}:</Col>
                        <Col :span="22">
                            <p>
                                {{$t('clue.importTip')}}<br>
                                {{$t('clue.fileSizeRequirement')}}
                            </p>
                        </Col>
                    </Row>
                </div>

                <div v-show="isFinished">
                    <p>{{ returnMsg }}</p>
                    <template v-if="detailInfo.length">
                        <br>
                        <span class="operate" @click="detailInfoShow=!detailInfoShow">
                            {{$t('clue.detailInfo')}}
                            <Icon type="chevron-down"></Icon>
                        </span><br>
                        <div class="detailInfo" v-show="detailInfoShow">
                            <ul>
                                <li v-for="item in detailInfo">{{ item }} </li>
                            </ul>
                        </div>
                    </template>
                </div>

                <div slot="footer">
                    <template v-if="!isFinished">
                        <Button  @click="cancel">{{$t('cancel')}}</Button>
                        <Button type="primary" @click="ok">{{$t('save')}}</Button>
                    </template>
                    <template v-if="isFinished">
                        <Button  @click="cancel" class="clue-import-data">{{$t('confirm')}}</Button>
                    </template>
                </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import util from '@/libs/util';

    export default {
        name: 'importData',
        props: ['visible', 'userId'],
        data() {
            return {
                uploading: false,
                isFinished: false,
                detailInfo: [],
                returnMsg: '',
                detailInfoShow: false,
                uploadFile: {},
                uploadPercent: 0,
                source: null // axios 的取消令牌,用于取消上传文件
            };
        },
        computed: {
            ...mapState([
                'qiniuHttp'
            ]),
            // 控制文件大小 -- 不超过1m
            fileSize: function() {
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
        methods: {
            // 下载国际地区对应表
            downloadCountryArea() {
                window.open(`${this.qiniuHttp}/systemfile/%E5%9B%BD%E5%AE%B6%E5%9C%B0%E5%8C%BA%E5%AF%B9%E5%BA%94%E8%A1%A8.xlsx`);
            },
            // 下载数据模板
            downloadTemplate() {
                window.open(`${util.ajaxUrl}/form-cust/template/downloadClueTemplate?orgId=${this.$store.state.enterpriseId}`);
            },
            // 添加文件
            uploadTrigger() {
                this.$refs.importData.click();
            },
            // 确定添加
            ok() {
                if (this.uploadFile.size) {
                    this.uploading = true;
                    const CancelToken = util.axios.CancelToken;
                    this.source = CancelToken.source();
                    const param = new FormData(); // 创建form对象
                    param.append('file', this.uploadFile, this.uploadFile.name); // 通过append向form对象添加数据
                    param.append('orgId', this.$store.state.enterpriseId);
                    param.append('userId', this.userId);
                    const config = {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        cancelToken: this.source.token,
                        onUploadProgress: progressEvent => {
                            this.uploadPercent = Math.floor(100 * progressEvent.loaded / progressEvent.total);
                        }
                    };
                    util.axios.post(`${util.ajaxUrl}/form-cust/clue/import`, param, { timeout: 5 * 60 * 1000 }, config)
                        .then(response => {
                            this.returnMsg = response.data.message;
                            this.uploading = false;
                            this.isFinished = true;
                            this.uploadFile = {};
                            this.uploadPercent = 0;
                            this.source = null;
                            this.detailInfo = response.data.data || [];
                            this.$emit('refreshdata');
                        })
                        .catch(thrown => {
                            this.uploading = false;
                            if (util.axios.isCancel(thrown)) {
                                this.$Message.info(thrown.message);
                                this.uploadFile = {};
                                this.uploadPercent = 0;
                                this.source = null;
                            }
                        });
                }
            },
            // 取消保存
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
                }, 200);
            },

            uploadDataFile(event) {
                if (!event.target.files[0]) {
                    event.target.value = '';
                    return;
                }
                if (event.target.files[0].size > Math.pow(1024, 2)) {
                    event.target.value = '';
                    this.$Message.error(this.$t('clue.error_fileOutSize'));
                    return;
                }
                if (['xls', 'xlsx'].indexOf(event.target.files[0].name.split('.').slice(-1)[0]) === -1) {
                    event.target.value = '';
                    this.$Message.error(this.$t('clue.error_fileFormat'));
                    return;
                }
                this.uploadFile = event.target.files[0];
                event.target.value = '';
            },
            requestCancel(event, name) {
                console.log('requestCancel');
                if (this.uploading) {
                    this.source.cancel(this.$t('clue.cancelUpload'));
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
</style>
