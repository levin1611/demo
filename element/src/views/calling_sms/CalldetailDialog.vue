<template>
    <div>

             <!-- 屏蔽 -->
        <Modal :visible.sync="showDialog"
               :title="$t('callSms.Calldetails')"
               :show-close="true"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               :append-to-body="true"
               width="520px"
               class="modal calling_detaild_dialog_3">
            <div>
                <div class="info_form">
                    <div class="info_item">
                        <div class="info_lable">
                            {{$t('callSms.Time')}}：
                        </div>
                        <div class="info_value">
                            {{ detailInfo.callStartTime}}
                        </div>
                    </div>
                    <div class="info_item">
                        <div class="info_lable">
                            {{$t('callSms.Callduration')}}：
                        </div>
                        <div class="info_value">
                            {{ detailInfo.durationStr }}
                        </div>
                    </div>
                    <div class="info_item">
                        <div class="info_lable">
                            {{$t('callSms.Caller')}}：
                        </div>
                        <div class="info_value">
                            {{detailInfo.fromName}}  {{ detailInfo.fromPhone }}
                        </div>
                    </div>
                    <div class="info_item">
                        <div class="info_lable">
                            {{$t('callSms.Called')}}：
                        </div>
                        <div class="info_value">
                            {{detailInfo.contactName}}  {{ detailInfo.toPhone }}
                        </div>
                    </div>
                    <div class="info_item">
                        <div class="info_lable">
                            {{$t('callSms.status')}}：
                        </div>
                        <div class="info_value">
                            {{callStatus(detailInfo.callStatus) }}
                        </div>
                    </div>
                    <div class="info_item">
                        <div class="info_lable">
                            {{$t('callSms.theendofthecall')}}：
                        </div>
                        <div class="info_value">
                            {{ $t('callSms.byReason'+detailInfo.byeReason) }}
                        </div>
                    </div>
                    <div class="info_item">
                        <div class="info_lable">
                            {{$t('callSms.Callrecording')}}：{{ detailInfo.recordDetail?'':'-' }}
                        </div>
                    </div>
                </div>
                <div style="margin-bottom: 20px;" v-if="detailInfo.recordDetail">
                    <div style="font-size: 12px;">{{$t('callSms.payAttation1')}}</div>
                    <div style="display: flex;align-items: center;">
                        <audio class="audio_dialog"  controls controlsList="nodownload" ref="audio"  :src="recordDetail.downloadUrl"></audio>
                        <div class="operatae">
                            <span v-if="authorized_button.audioToText" @click="audioToTextbtn">{{shouTxtArea? $t('crm.Modal.fold'): $t('callSms.Turntotext') }}</span>
                            <span @click="download" v-if="authorized_button.downloadAudio">{{$t('callSms.Download')}}</span>
                        </div>
                    </div>

                </div>
                 <!-- 语音转文字区域 -->
                <aside class="text_area" v-show="shouTxtArea">
                    <div class="content_text">
                        {{audioTxt}}
                    </div>
                </aside>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { getCallDeatil, uplodRecord, getTxtByurl } from '@/api/call&sms';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { env } from '../../../build/config';

    export default {
        name: 'CalldetailDialog',
        data() {
            return {
                showDialog: false,
                detailInfo: {},
                recordDetail: {},
                audioTxt: null,
                shouTxtArea: false
            };
        },
        computed: {
            fullName() {
                return this.$store.state.fullName;
            },
            button_list() {
                return this.$store.state.app.button_list;
            },
            authorized_button() {
                const buttonIds = BUTTON_IDS.Cinnox;
                return {
                    audioToText: !HANDLE_BUTTON(buttonIds.audioToText, this.button_list),
                    downloadAudio: !HANDLE_BUTTON(buttonIds.downloadAudio, this.button_list)
                };
            }
        },
        props: {
            detailForQuery: {
                type: Object,
                default: () => {}
            }
        },
        mounted() {
            this.queryDetailByMsgId();
        },
        methods: {
            download() {
                let fileName = '';
                if (this.recordDetail.downloadUrl) {
                    const type = this.recordDetail.downloadUrl.slice(this.recordDetail.downloadUrl.lastIndexOf('.'));
                    const date = new Date().format('yyyy-MM-dd');
                    fileName = date + this.fullName + type;
                }
                // console.log('录音下载名字', fileName);
                const xhr = new XMLHttpRequest();
                xhr.open('GET', this.recordDetail.downloadUrl, true);
                xhr.responseType = 'blob';
                xhr.onload = () => {
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(xhr.response);

                    link.download = fileName;
                    link.click();
                    window.URL.revokeObjectURL(link.href);
                    link.remove();
                    this.$Message.success(this.$t('callSms.donwloaded1'));
                };
                xhr.send();
            },
            // 根据消息id查询 通话详情
            queryDetailByMsgId() {
                getCallDeatil({
                    orgId: this.detailForQuery.orgId,
                    userId: this.detailForQuery.userId,
                    messageId: this.detailForQuery.messageId,
                    staffPhone: this.detailForQuery.staffPhone
                }).then(res => {
                    // console.log(res);
                    if (res.code == 1 && res.data) {
                        this.showDialog = true;
                        this.detailInfo = res.data;
                        this.recordDetail = this.detailInfo.recordDetail;
                        if (this.detailInfo.recordDetail && this.detailInfo.recordDetail.downloadUrl) {
                            // 给audio注册事件
                            this.$nextTick(this.canPlay);
                            if (this.detailInfo.recordDetail.isToText) {
                                // isToText就代表已经转换过文字里
                                this.getTxTByurlMethods();
                            }
                        }
                    } else {
                        this.$Message.error('查询通话详情失败，请稍后再试');
                        this.$EVENTBUS.$emit('openCalldetailIng', false);
                    };
                }).catch(e => {
                    this.$Message.error('查询通话详情失败，请稍后再试');
                    this.$EVENTBUS.$emit('openCalldetailIng', false);
                });
            },
            canPlay() {
                const audio = this.$refs.audio;
                // console.log(audio,'sss',this.$refs);
                audio.oncanplay = async () => {
                    while (audio.duration == 'Infinity') {
                        await new Promise(r => setTimeout(r, 200));
                        // /Number.MAX_SAFE_INTEGER.toString()
                        audio.currentTime = 1000000;
                    }
                    console.log(audio.currentTime, 'current');
                    //   var allTime = this.audio.current.duration;
                    const allTime =
                        `${(`${Math.floor(audio.duration / 60)}`).padStart(2, '0')
                        }:${
                            (`${Math.floor(audio.duration % 60)}`).padStart(2, '0')}`;
                    console.log(allTime, 'all');
                };
            },
            callStatus(messageStatus) {
                // 通话状态
                let str = '';
                // unknown:'未知',
                // call_ended: '通话结束',
                // declined: '用户拒绝',
                // busy: '用户繁忙',
                // not_answered: '无人应答',
                // cancelled: '取消通话',
                // abandoned: '放弃通话',
                // unreachable: '无法拨通',
                // call_failed: '呼叫失败',
                // CalldetailsView: '查看通话详情',
                // if(this.detailInfo.fromme)
                if (this.detailInfo.isFromMe) {
                    switch (messageStatus) {
                        case 0:
                            str = this.$t('callSms.unknown');
                            break;
                        case 1:
                            str = this.$t('callSms.call_ended');
                            break;
                        case 2:
                            str = this.$t('callSms.declined');
                            break;
                        case 3:
                            str = this.$t('callSms.busy');
                            break;
                        case 4:
                            str = this.$t('callSms.not_answered');
                            break;
                        case 5:
                            str = this.$t('callSms.cancelled');
                            break;
                        case 6:
                            str = this.$t('callSms.abandoned');
                            break;
                        case 7:
                            str = this.$t('callSms.unreachable');
                            break;
                        case 8:
                            str = this.$t('callSms.call_failed');
                            break;
                    }
                } else {
                    switch (messageStatus) {
                        case 0:
                            str = this.$t('callSms.unknown');
                            break;
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                        case 6:
                        case 7:
                        case 8:
                            str = this.$t('callSms.missed_call');
                            break;
                        case 1:
                            str = String(this.$t('callSms.call_ended'));
                            break;
                    }
                }

                return str;
            },
            audioToTextbtn() {
                // 录音转文字按钮
                if (this.shouTxtArea) {
                    // 如果是打开的就关闭文字区域
                    this.shouTxtArea = false;
                } else if (this.audioTxt && !this.shouTxtArea) {
                    // 如果有结果并且是收起 那就打开文字区域
                    this.shouTxtArea = true;
                } else {
                    // 如果没文字并且 是关闭的 那就发请求转文字
                    const params = {
                        messageId: this.detailForQuery.messageId,
                        fileId: this.detailInfo.recordDetail.fileId,
                        fileUrl: this.detailInfo.recordDetail.downloadUrl,
                        fileSize: this.detailInfo.recordDetail.fileLength // 字节数
                    };
                    this.$Message.success(this.$t('callSms.wasteTimeTo'));
                    uplodRecord(params).then(res => {
                    });
                }
            },
            getTxTByurlMethods() {
                getTxtByurl({}, this.detailInfo.recordDetail.textUrl).then(res => {
                    // console.log(res);
                    this.audioTxt = res;
                    // this.audioTxt = '噢这个自动录音就开始录上了。首看呢他们的首都录音有问题，手动录音，那个按钮就不能。为啥？呢我先挂了，看看他能不能准备好了';
                });
            }
        },
        watch: {
            showDialog(v) {
                this.$nextTick(() => {
                    if (v) {
                        console.log(v);
                    } else {
                        this.$EVENTBUS.$emit('openCalldetailIng', false);
                    }
                });
            }
        }
    };
</script>

<style lang="less" scoped>
.audio_dialog{
    // width: 300px;
    flex: 1;
    height: 15px;
}
.audio_dialog::-webkit-media-controls-play-button{
     background-size: 15px;
}
.audio_dialog::-webkit-media-controls-mute-button{
            background-size: 15px;
}
.audio_dialog::-webkit-media-controls-current-time-display {
       font-size:12px;
    }

    /*剩余时间*/
.audio_dialog::-webkit-media-controls-time-remaining-display {
    font-size:12px;

 }

.info_form{
    width: 100%;
    .info_item{
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        .info_lable{
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
            line-height: 12px;
        }
        .info_value{
            font-size: 14px;
            color: #1a1a1a;
            line-height: 14px;
        }
    }
}
.operatae{
            color: #3b78de;
            font-size: 12px;
            span{
                margin-left: 20px;
                cursor: pointer;
            }
        }
.text_area{
    padding-top: 12px;
    border-top: 1px solid #eaeaea;
    overflow-y: auto;
    height: 200px;
    .content_text{
        min-height: 180px;
    }
}
/deep/.el-dialog__body{
    overflow-y:scroll ;
}
</style>
<style lang="less">
.calling_detaild_dialog_3{
    .el-dialog__header{
        padding-bottom: 0;
    }
    .el-dialog__body{
        padding-top: 20px;
        max-height: 500px;
        overflow-y: scroll;
    }
}
</style>
