<template>
  <div class="importData">
    <!-- loading -->
    <!-- 查询上传进度接口，暂时没用，（EDM一期需求） -->
    <!-- <Spin fix v-if="id_process">
      <Icon type="ios-loading" size="36" class="demo-spin-icon-load"></Icon>
      <div v-text="`${percent_process}%`"></div>
    </Spin> -->

    <div v-show="!isFinished">
      <Row :gutter="16">
        <Col :span="3">
          <div class="circleSeq">1</div>
        </Col>
        <Col :span="15">
          <span>{{ $t("mailMarketing.emailAddress.prepareData") }}</span>
        </Col>
        <Col :span="6">
          <div @click="downloadTemplate" class="operate">
            <Icon type="arrow-down-a" size="20"></Icon>
            <span>{{ $t("mailMarketing.emailAddress.downloadTemplate") }}</span>
          </div>
        </Col>
      </Row>
      <Row :gutter="16">
        <Col :span="3">
          <div class="circleSeq">2</div>
        </Col>
        <Col :span="15">
          <span>{{ $t("mailMarketing.emailAddress.selectFile") }}</span>
        </Col>
        <Col :span="6">
          <div @click="uploadTrigger" class="operate" :class="{
          disable: isEditModel
        }">
            <Icon type="upload" size="20"></Icon>
            <span>{{ $t("mailMarketing.emailAddress.addFile") }}</span>
          </div>
        </Col>
      </Row>

      <!-- excel 文件的 MIME 好像特别多,搜了一个说最新的是 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet ,感觉麻烦,干脆不做限定了-->
      <input
        type="file"
        :disabled="isFinished || isEditModel"
        ref="importData"
        @change="uploadDataFile"
        style="display: none"
      />
      <Row v-if="uploadFile.size">
        <Col :span="20" :push="2">
          <Tag @close="requestCancel" closable>
            <span>
              <u>{{ uploadFile.name }}</u> - {{ fileSize }}
            </span>
          </Tag>
          <Progress
            :percentage="uploadPercent"
            :stroke-width="5"
            :show-text="false"
          ></Progress>
        </Col>
      </Row>

      <Row>
        <Col :span="3">{{ $t("mailMarketing.emailAddress.notice") }}</Col>
        <Col :span="21">
          <p>{{ $t("mailMarketing.emailAddress.fileFormatRequirement") }}</p>
        </Col>
      </Row>
      <Row>
        <Col :span="3">{{ $t("mailMarketing.emailAddress.hint") }}</Col>
        <Col :span="21">
          <p>
            {{ $t("mailMarketing.emailAddress.importTip") }}
            <br />
            {{ $t("mailMarketing.emailAddress.fileSizeRequirement") }}
          </p>
        </Col>
      </Row>
    </div>

    <div v-show="isFinished">
      <p>{{ returnMsg }}</p>
      <template v-if="detailInfo.length">
        <br />
        <span @click="detailInfoShow = !detailInfoShow" :class="operate"
          >{{ $t("crm.Modal.detailInfo") }}
          <Icon type="chevron-down"></Icon>
        </span>
        <br />

        <div v-show="detailInfoShow" class="detailInfo">
          <ul>
            <li v-for="(item, i) in detailInfo" :key="i">
              {{ item }}
            </li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'importData',
        props: ['isEditModel'],
        computed: {
            ...mapState(['enterpriseId', 'userId', 'userName', 'fullName']),
            fileSize() {
                let returnValue = '';
                if (this.uploadFile.size) {
                    const size = ['byte', 'kb', 'mb', 'gb'];
                    size.some((item, key) => {
                        if (this.uploadFile.size / Math.pow(1024, key + 1) < 1) {
                            returnValue = `${(
                                this.uploadFile.size / Math.pow(1024, key)
                            ).toFixed(2)}${item}`;
                            return true;
                        }
                    });
                }
                return returnValue;
            },
            percent_process() {
                if (this.size_all) {
                    return Math.floor((this.size_processed / this.size_all) * 100);
                } else {
                    return 0;
                }
            }
        },
        mounted() {
            console.log(this.userName);
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
                returnMsg: ''
            };
        },
        methods: {
            _formValidate({ addrName, remark }) {
                return new Promise((resolve, reject) => {
                    if (this.uploadFile.size) {
                        this.uploading = true;
                        const CancelToken = util.axios.CancelToken;
                        this.source = CancelToken.source();
                        const param = new FormData(); // 创建form对象
                        param.append('file', this.uploadFile, this.uploadFile.name); // 通过append向form对象添加数据
                        param.append('orgId', this.enterpriseId);
                        param.append('userId', this.userId);
                        param.append('userName', this.fullName);
                        param.append('addrName', addrName);
                        param.append('remark', remark || '');

                        const config = {
                            headers: { 'Content-Type': 'application/form' },
                            cancelToken: this.source.token,
                            onUploadProgress: (progressEvent) => {
                                this.uploadPercent = Math.floor((100 * progressEvent.loaded) / progressEvent.total);
                            },
                            timeout: 10 * 60 * 1000
                        };
                        util.axios
                            .post(
                                `${util.EmailMarketingUrl}/business/address/book/uploadFile`,
                                param,
                                config
                            )
                            .then((response) => {
                                if (response.data.code === 1) {
                                    this.uploading = false;
                                    this.uploadFile = {};
                                    this.source = null;
                                    // this.id_process = response.data.data;
                                    resolve({
                                        isCallback: 0
                                    });
                                } else {
                                    this.$Message.error(response.data.msg);
                                    // eslint-disable-next-line prefer-promise-reject-errors
                                    reject({
                                        isCallback: 0
                                    });
                                }
                            })
                            .catch((thrown) => {
                                // eslint-disable-next-line prefer-promise-reject-errors
                                reject({
                                    isCallback: 0
                                });
                                this.uploading = false;
                                if (util.axios.isCancel(thrown)) {
                                    this.$Message.info(thrown.msg);
                                    this.uploadFile = {};
                                    this.uploadPercent = 0;
                                    this.source = null;
                                } else {
                                    console.error(thrown);
                                    this.$Message.error(this.$t('requestTimeout'));
                                }
                            });
                    } else {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        reject({
                            isCallback: 0
                        });
                    }
                });
            },
            cancel() {
                // this.$emit('update:visible', false);
                setTimeout(() => {
                    this.uploading = false;
                    this.isFinished = false;
                    this.$emit('progress', false);
                    this.detailInfo = [];
                    this.returnMsg = '';
                    this.detailInfoShow = false;
                    this.uploadFile = {};
                    this.uploadPercent = 0;
                    this.source = null;
                }, 200);
            },
            // 查询上传进度接口，暂时没用，（EDM一期需求）
            get_process() {
                this.id_interval_process = setInterval(() => {
                    util
                        .ajax({
                            url: '/crm/inquiryImportLog/get',
                            method: 'post',
                            data: {
                                id: this.id_process
                            }
                        })
                        .then((res) => {
                            if (res.data.code === '1') {
                                const {
                                    sumCount: size_all,
                                    updateCount: size_processed,
                                    result,
                                    totalResult: returnMsg,
                                    isCompleted
                                } = res.data.data;

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
                                    this.$emit('progress', true);
                                    this.id_process = 0;
                                    this.id_interval_process = '';
                                    this.size_all = 0;
                                    this.size_processed = 0;

                                    // this.$emit('refreshData');
                                }
                            } else {
                                this.$Message.error(this.$t('crm.Modal.error_queryProcess'));
                            }
                        });
                }, 5000);
            },
            downloadTemplate() {
                window.open(`${util.EmailMarketingUrl}/template/data/download?orgId=${this.enterpriseId}`);
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
                if (
                    ['xls', 'xlsx'].indexOf(event.target.files[0].name.split('.').slice(-1)[0]) === -1
                ) {
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
        },
        beforeDestroy() {
            if (this.id_interval_process) {
                clearInterval(this.id_interval_process);
                this.id_interval_process = '';
            }
        }
        // watch: {
        //   id_process: {
        //     handler(val) {
        //       if (val) {
        //         this.get_process();
        //       } else {
        //         if (this.id_interval_process) {
        //           clearInterval(this.id_interval_process);
        //         }
        //       }
        //     },
        //   },
        // },
    };
</script>

<style scoped lang="less">
.importData {
  margin: 30px 20px;
  * {
    word-break: normal;
  }
}
* {
  & /deep/ .el-row {
    padding-bottom: 40px;
  }

  & /deep/ .el-dialog__body {
    color: gray;
    font-size: 14px;
    padding: 30px;
  }

  & /deep/ .el-progress-bar__outer {
    background-color: #51b7a3;
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
  color: #fa8241;
  cursor: pointer;

  & i {
    vertical-align: middle;
  }
  &.disable {
    color: #999;
  }
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
