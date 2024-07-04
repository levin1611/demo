<template>
    <div >
        <el-dialog  :model-value="dialogVisibleData"
                    title="批量新建成员"
                    width="800"
                    :append-to-body="true"
                    class="custom-class-add89"
                    :show-close="false"
                    :close-on-click-modal="false"
                    :close-on-press-escape="false"
        >
            <div v-show="!isFinished" v-loading="uploading" >
                <div class="tip_item">
                    <span style="color: #303133;">{{$t('departmentAndMember.importTip')}}</span>
                    <div @click="downloadTemplate"
                         class="operate operate16">
                        <i class="custom custom-download"></i>
                        <span>{{$t('departmentAndMember.downFileTip')}}</span>
                    </div>
                </div>

                <div class="tip_item">
                    <span style="color: #303133;">{{$t('departmentAndMember.selectTemplate')}}</span>
                    <div @click="uploadTrigger"
                         class="operate">
                        <i class="custom custom-shangchuan"></i>
                        <span>{{$t('departmentAndMember.addfile')}}</span>
                    </div>
                </div>

                <div class="tip_item tips" >
                    <span>{{$t('departmentAndMember.itemTips1')}}</span>
                </div>

                <div class="tip_item tips">
                    <span>{{$t('departmentAndMember.itemTips2')}}</span>
                </div>
                <!-- excel 文件的 MIME 好像特别多,搜了一个说最新的是 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet ,感觉麻烦,干脆不做限定了-->
                <input type="file"
                       :disabled="isFinished"
                       ref="importData"
                       @change="uploadDataFile"
                       style="display: none">
                <div v-if="uploadFile.size" class="process_wrap custom_tag">
                    <el-tag @close="requestCancel"
                            closable>
                        <span>
                            <u>{{ uploadFile.name }}</u> - {{ fileSize }}
                        </span>
                    </el-tag>
                    <el-progress :percentage="uploadPercent"
                                 :stroke-width="5"
                                 :show-text="false"></el-progress>
                </div>


                <div class="btn_footer">
                    <template v-if="!isFinished">
                        <el-button class="useBrandColor" @click="cancel">{{$t('cancel')}}</el-button>
                        <el-button type="primary"
                                   @click="ok"
                        >{{$t('save')}}
                        </el-button>
                    </template>
                </div>
            </div>

            <div v-show="isFinished">
                <p>{{ returnMsg }}</p>
                <!-- <template v-if="detailInfo.length">
                    <br>
                    <span @click="detailInfoShow=!detailInfoShow"
                          class="operate">详细信息
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
                </template> -->
                <template v-if="errorFile">
                    <br>
                    <span @click="downloadFailedFile"
                          class="operate">{{$t('departmentAndMember.fileTips2')}}
                    </span>
                </template>
                <div class="btn_footer">
                    <el-button @click="cancel" type="primary">{{$t('confirm')}}</el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import {inquiryImportLogGet} from '@/api/members.js';
import util from '@/https/util.js';
import { useUserStore } from '@/pinia/modules/user.js';
import { ElMessage } from 'element-plus';

const store = useUserStore();
export default {
    name: 'importData',
    props: [
        'dialogVisible'
    ],
    computed: {
       
        enterpriseId() {
            return store.orgId;
        },
        userId() {
            return store.userId;
        },
        qiniuHttp() {
            return 'https://content.leadscloud.com/';
        },
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
            errorFile: '',
            dialogVisibleData: true

        };
    },
    methods: {
        ok() {
            if (this.uploadFile.size) {
                if (this.uploading) return;
                this.uploading = true;
                const CancelToken = util.axios.CancelToken;
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
                
                // param.append('userName', this.fullName);
                util.axios.post('/v2-privilege/user/batchUser', param, config).then(response => {
                   
                    
                    this.uploading = false;
                    this.uploadFile = {};
                    this.source = null;

                    if (response.data.code === 10000) {
                        // 如果data没有消息就代表上传成功
                        this.isFinished = true;
                        this.returnMsg = response.data.data.message;
                        if (response.data.data.failRows) {
                            this.errorFile = response.data.data.logId;
                        }
                        this.$emit('refreshData');
                    } else {
                        ElMessage.error(response.data.message);
                    }
                }).catch(thrown => {
                    this.uploading = false;
                    if (util.axios.isCancel(thrown)) {
                        ElMessage.info(thrown.message);
                        this.uploadFile = {};
                        this.uploadPercent = 0;
                        this.source = null;
                    } else {
                        console.error(thrown);
                        ElMessage.error(this.$t('requestTimeout'));
                    }
                });
                
            } else {
                ElMessage.error('请添加文件');
            }
        },
        cancel() {
            this.$emit('update:dialogVisible', false);
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
                inquiryImportLogGet({
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
                        ElMessage.error('本次查询导入进度失败(每5s 查询一次)');
                    }
                });
            }, 5000);
        },
        downloadTemplate() {
            window.open('https://xhl-hk-cos01.leadscloud.com/whatsapp_test_bucket/8617390953714/1705908923671/f8dc6498-8e19-4886-84a2-977f22f8a640/f.xlsx');
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
                ElMessage.error(this.$t('crm.Modal.error_fileOutSize'));
                return;
            }
            if (['xls', 'xlsx'].indexOf(event.target.files[0].name.split('.').slice(-1)[0]) === -1) {
                event.target.value = '';
                ElMessage.error('文件格式错误,请上传正确格式 Excel 文件');
                return;
            }
            this.uploadFile = event.target.files[0];
            this.mockProcess();

            event.target.value = '';
        },
        requestCancel(event, name) {
            if (this.uploading) {
                this.source.cancel(this.$t('crm.Modal.cancelUpload'));
            } else {
                this.uploadFile = {};
            }
        },
        mockProcess() {
            this.uploadPercent = 100;
        },
        downloadFailedFile() {
            window.open(`${util.ajaxUrl}/v2-privilege/user/downLoadDefeat?orgId=${this.enterpriseId}&logId=${this.errorFile}`);
        }
    },
    beforeUnmount() {
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

<style scoped lang="scss">
    .operate {
        color: $textlinkColor;
        cursor: pointer;
        min-width: 130px;
        margin-right: 110px;
        & i {
            vertical-align: middle;
            margin-right: 5px;
            font-size: 20px;
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
<style scoped lang="scss">
.tip_item{
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.tips{
    margin-bottom: 0px;
    font-size: 12px;
    line-height: 18px;
}
.process_wrap{
    margin-top: 43px;
    width: 625px;
    display: block;
    .#{$elnamespace}-tag{
        margin-bottom: 10px;
        background: transparent;
        border: none;
        color: #303133;
    }
    :deep{
        .#{$elnamespace}-progress-bar__outer{
            height: 8px !important;
        }
        .#{$elnamespace}-progress-bar__inner{
            background: $brandColor;
        }
    }
   
}
.btn_footer{
    margin-top: 40px;
    width: 100%;
    text-align: right;
    padding-bottom: 30px;
}

</style>
