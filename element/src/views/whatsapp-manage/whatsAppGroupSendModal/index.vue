<template>
    <div class="whatsApp-group-send">
        <Modal
            custom-class="whatsApp-group-send-modal"
            :visible.sync="visible"
            :append-to-body="true"
            :modal="false"
            width="820px"
            v-dialog-drag
            @close="close"
            top="6vh"
            :title="$t('wagroupsend.selectContact')"
        >
            <div class="whatsApp-group-send-steps">
                <!-- tabs -->
                <Steps :active="currentStep" style="height: 52px;margin: auto;width: 536px;" finish-status="success" :class="lang === 'en-US' ? 'en-el-step__head' : ''">
                    <Step v-for="item in componentList" :key="item.key" :title="item.label"></Step>
                </Steps>
            </div>

            <!-- component -->
            <keep-alive>
                <component
                    :is="currentComponent"
                    :visible="visible"
                    :currentComponent.sync="currentComponent"
                    :childComponentHeight="childComponentHeight"
                    :minutes.sync="minutes"
                    :currenAccountList="currenAccountList"
                    ref="currentInstance"
                    :currentChoose.sync="currentChoose"
                    :previousComponent="previousComponent"
                    :isCanWABA.sync="isCanWABA"
                    @setDataJson="setDataJson"
                    @getConfigMessage="getConfigMessage"
                    @computeTime="computeTime"
                ></component>
            </keep-alive>

            <div slot="footer">
                <div
                    v-if="formatMinutes(minutes) && currentComponent === 'selectAccount' && currentChoose === 'personalSend'"
                    style="margin-left: 46px;color: rgb(255, 117, 42);font-size: 14px;font-weight: 600;line-height: 22px;position: absolute;margin-top: 7px;left: 14px;"
                    class="finish-time">
                        {{$t('wagroupsend.estimatedTake')}} {{ formatMinutes(minutes) }} {{$t('wagroupsend.minuteCompleteSending')}}
                </div>
                <div>
                    <Button v-if="currentStep===0" @click="cancel">{{$t('cancel')}}</Button>
                    <Button v-else class="whatsApp-group-button" @click="selectSteps('previous')">{{$t('wagroupsend.previous')}}</Button>

                    <Button v-if="currentStep===2" class="whatsApp-group-button" type="primary" @click="send" :loading="sendLoading">{{$t('wagroupsend.send')}}</Button>
                    <Button v-else class="whatsApp-group-button" type="primary" @click="selectSteps('nextStep')">{{$t('wagroupsend.nextStep')}}</Button>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script>
    import selectNumber from './selectNumber';
    import selectAccount from './selectAccount';
    import configMessage from './configMessage';
    import { groupMessage, computingTime } from '@/api/whatsapp';
    import { mapState } from 'vuex';
    import _ from 'lodash';

    export default {
        name: 'whatsAppGroupSendModal',
        components: {
            selectNumber,
            selectAccount,
            configMessage
        },
        props: {
            visible: {
                type: Boolean,
                default: true
            }
        },
        computed: {
            ...mapState({
                lang: state => state.app.lang,
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                checkedAllAccount: state => state.wAGroupSendallChecked,
                    // 等待发送的wa号码们
                checkedAccountList: state => state.wAGroupSendAccount
            }),
        },
        data() {
            return {
                sendLoading: false,
                textArr: [],
                filesArr: [],
                idArr: [],

                // 是否开通WABA
                isCanWABA: false,
                dataJson: {
                    // taskName: '', // 任务名称 String
                    // userBindWaAccount: '', // 绑定账号String
                    // chatWaAccount: [], // 群发账号List
                    // groupNum: '', // 分组数量 Integer
                    // groupInterval: '', // 分组间隔 Integer
                    // startNumberInterval: '', // 号码间隔 Integer
                    // endNumberInterval: '', // 号码间隔 Integer
                    // text: [], // 文本消息 List
                    // files: [], // 媒体消息
                    // id: [] // 发送智能物料记录id
                },
                selectedAccount: '',

                currentChoose: 'personalSend', // 当前选择的是个人发送还是api群发

                minutes: 0, // 至少需要10分钟

                currentStep: 0,
                // 子组件的高度,放在父组件中管理
                childComponentHeight: '468px',

                previousComponent: '',
                currentComponent: 'selectNumber',
                componentList: [
                    {
                        name: 'selectNumber',
                        key: 1,
                        label: this.$t('wagroupsend.selectNumber')
                    },
                    {
                        name: 'selectAccount',
                        key: 2,
                        label: this.$t('wagroupsend.selectAccount')
                    },
                    {
                        name: 'configMessage',
                        key: 3,
                        label: this.$t('wagroupsend.configurationMessages')
                    }
                ],
                stepMap: {},
                currenAccountList:[], //当前填写的wa号码
            };
        },
        methods: {
            // 分钟转为小时和分钟
            formatMinutes(minutes) {
                if (minutes === 0) return `0 ${this.$t('wagroupsend.minutes')}`;
                const hour = Math.floor(minutes / 60);
                const minute = minutes % 60;
                // 如果是NaN,则return
                if (isNaN(minute)) return;
                if (hour === 0) {
                    return `${minute} ${this.$t('wagroupsend.minutes')}`;
                } else {
                    return `${hour} ${this.$t('wagroupsend.hours')} ${minute} ${this.$t('wagroupsend.minutes')}`;
                }
            },

            getConfigMessage(val) {
                // 先置空数据
                this.textArr = [];
                this.filesArr = [];
                this.idArr = [];
                val.forEach(item => {
                    if (item.msgType === 'text') {
                        this.textArr.push(item.content);
                    } else if (item.msgType === 'appendix') {
                        this.filesArr.push(item.content);
                    } else if (item.msgType === 'smartMaterials') {
                        this.idArr.push(item.fileId);
                    }
                });

                if (this.textArr.length) {
                    this.dataJson.text = this.textArr;
                } else {
                    delete this.dataJson.text;
                }

                if (this.filesArr.length) {
                    this.dataJson.files = this.filesArr;
                } else {
                    delete this.dataJson.files;
                }

                if (this.idArr.length) {
                    this.dataJson.id = this.idArr;
                } else {
                    delete this.dataJson.id;
                }
            },
            computeTime: _.debounce(function() {
                // 如果没有选择账号息,则不进行计算
                const chatWaAccountList = this.checkedAccountList.length ? this.checkedAccountList : this.dataJson.chatWaAccount;

                if (!chatWaAccountList || chatWaAccountList.length === 0) return false;

                computingTime({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    chatWaAccount: chatWaAccountList.join(','),
                    groupNum: this.dataJson.groupNum,
                    groupInterval: this.dataJson.groupInterval,
                    startNumberInterval: this.dataJson.startNumberInterval,
                    endNumberInterval: this.dataJson.endNumberInterval
                }).then(res => {
                    this.minutes = res.data / 1000 / 60;
                }).catch(err => {
                    console.error('err', err);
                });
            }, 800),
            setDataJson(data) {
                this.dataJson = {
                    ...this.dataJson,
                    ...data
                };
            },
            cancel() {
                this.$store.commit('setWAGroupSendVisible', false);
            },
            async send() {
                // console.log(this.$refs.currentInstance);
                const instance = this.$refs.currentInstance;
                // 如果是在配置信息页面并且 选中的是api群发 则在点击发送前进行表单校验
                if(instance && instance.$options._componentTag === "configMessage") {
                    if(instance.$options.propsData.currentChoose === "apiGroupSend") {
                        const p = instance.submitForm();
                        if(!p) return false;
                    
                    }
                }

                if (this.currentChoose === 'personalSend') {
                    // 情况1：都没有填写
                    if (!this.dataJson.text && !this.dataJson.files && !this.dataJson.id) {
                        this.$Message.error(this.$t('wagroupsend.pleaseEnterText'));
                        return false;
                    }
                    // 输入框中没有写内容
                    if (this.dataJson.text && this.dataJson.text.length) {
                        for (let i = 0; i < this.dataJson.text.length; i++) {
                            if (!this.dataJson.text[i]) {
                                this.$Message.error(this.$t('wagroupsend.pleaseEnterText'));
                                return false;
                            }
                        }
                    }

                    this.sendLoading = true;

                    // 内容都有填写
                    const formData = new FormData();
                    formData.append('userId', this.userId);
                    formData.append('orgId', this.enterpriseId);
                    for (const key in this.dataJson) {
                        if (Array.isArray(this.dataJson[key])) {
                            if (['chatWaAccount', 'id'].includes(key)) {
                                if (this.dataJson[key].length) {
                                    formData.append(`${key}`, this.dataJson[key].join(','));
                                }
                            } else if (['text'].includes(key)) {
                                if (this.dataJson[key].length) {
                                    formData.append(`${key}`, this.dataJson[key].join('--='));
                                }
                            } else {
                                this.dataJson[key].forEach(item => {
                                    formData.append('file', item);
                                    // formData.append(`${key}[${index}]content`, item.content);
                                    // formData.append(`${key}[${index}]type`, item.type);
                                });
                            }
                        } else {
                            formData.append(key, this.dataJson[key]);
                        }
                    }
                    if (this.checkedAllAccount) {
                        const waGroupSendParpasJson = JSON.parse(sessionStorage.getItem('waGroupSendParpasJson')) ;
                        delete waGroupSendParpasJson.size;
                        delete waGroupSendParpasJson.page;
                        // wa聊天列表的群发按钮 增加全选逻辑 发送保存的查询参数给后端
                        formData.append('selectAll', 1);
                        formData.append('query', JSON.stringify(waGroupSendParpasJson));
                        formData.append('chatWaAccount', '');
                    } else if (this.checkedAccountList.length) {
                        formData.append('chatWaAccount', this.checkedAccountList.join(','));
                    }

                    // 个人发送
                    groupMessage(formData).then(res => {
                        if (res.code === 1) {
                            this.$Message.success(this.$t('wagroupsend.sendSuccess'));
                            // 关闭 modal
                            this.$store.commit('setWAGroupSendVisible', false);
                            // 更新任务列表数据
                            this.$store.commit('updateWAGroupSendList', new Date().getTime());
                        } else {
                            this.$Message.error(this.$t('wagroupsend.sendingFailed'));
                        }
                        this.sendLoading = false;
                    }).catch(err => {
                        console.error('err', err);
                        this.sendLoading = false;
                        this.$Message.error(this.$t('wagroupsend.sendingFailed'));
                    });
                }
            },
            // 切换tab
            selectComponent(item) {
                this.currentComponent = item.name;
            },
            selectSteps(type) {
                if (type === 'previous') {
                    this.currentStep--;
                } else {
                    // 下一步
                    if( this.currentStep == 0) {
                        const waNumber =  this.checkedAccountList.join(',') || this.$refs.currentInstance.taskNumber
                        // 不是全选
                        // console.log(this.checkedAllAccount,'this.checkedAllAccount');
                        if(!this.checkedAllAccount){
                            if(!waNumber) {
                                this.$Message.error('请输入Whatsapp 号码')
                                return false;
                            }
                            this.currenAccountList = waNumber.split(',');
                        }
                    }
                    // 非群发页面,点击下一步时,获取耗时时间
                    if (this.currentComponent === 'selectNumber' && this.checkedAccountList.length) {
                        this.computeTime();
                    }
                    if (this.currentComponent === 'selectAccount') {
                        if (!this.dataJson.userBindWaAccount && this.currentChoose === 'personalSend') {
                            this.$Message.error(this.$t('wagroupsend.pleaseSelectAccount'));
                            return false;
                        } else if (!this.isCanWABA && this.currentChoose === 'apiGroupSend') {
                            this.$Message.error(this.$t('wagroupsend.activateIt'));
                            return false;
                        }
                    }
                    this.currentStep++;
                }

                this.currentComponent = this.stepMap[this.currentComponent][type];
            },
            close() {
                this.$store.commit('setWAGroupSendVisible', false);
            },
            init() {
                this.isCanWABA = false;
                this.sendLoading = false;
                this.currentChoose = 'personalSend';
                this.dataJson = {
                    // taskName: '', // 任务名称 String
                    // userBindWaAccount: '', // 绑定账号String
                    // chatWaAccount: [], // 群发账号List
                    // groupNum: '', // 分组数量 Integer
                    // groupInterval: '', // 分组间隔 Integer
                    // startNumberInterval: '', // 号码间隔 Integer
                    // endNumberInterval: '', // 号码间隔 Integer
                    // text: [], // 文本消息 List
                    // files: [], // 媒体消息
                    // id: [] // 发送智能物料记录id
                };
                this.currentStep = 0;
                this.currentComponent = 'selectNumber';
            }
        },
        mounted() {
            this.componentList.forEach((item, index) => {
                this.stepMap[item.name] = {
                    previous: this.componentList[index - 1] ? this.componentList[index - 1].name : this.componentList[this.componentList.length - 1].name,
                    nextStep: this.componentList[index + 1] ? this.componentList[index + 1].name : this.componentList[0].name
                };
            });
        },
        activated() {
            this.init();
        },
        watch: {
            visible(val) {
                console.error('this.lang', this.lang);
                if (!val) {
                    this.init();
                }
            },
            // 保存上一个组件名称
            currentComponent(newVal, oldVal) {
                this.previousComponent = oldVal;
            },
            $route(val) {
                // 关闭 modal
                this.$store.commit('setWAGroupSendVisible', false);
            }
        }
    };
</script>

<style lang="less">
    .whatsApp-group-send-modal {
        .el-dialog__body {
            padding: 30px 0;
        }
    }

    .whatsApp-group-send-steps {
        margin-bottom: 10px;
        .el-steps {
            .el-step__head {
                padding-left: 20px;
                // 线
                .el-step__line {
                    width: 130px;
                    left: 84px;
                }
            }

            // 成功的头部,进行中的头部
            .el-step__head.is-success,.el-step__head.is-process {
                color: #FF752A;
                border-color: #FF752A;
                .el-step__line {
                    background-color: #FF752A;
                }

                // icon及文本
                .el-step__icon.is-text {
                    background-color: #FF752A;
                    border-color: #FF752A;
                    color: #ffffff;
                }
            }

            // 等待的头部
            .el-step__head.is-wait {
                .is-text {
                    border-color: #C2C3CB;
                    color: #C2C3CB;
                    background-color: #FFFFFF;
                }
            }

            .el-step__main {
                margin-top: 10px;
                .el-step__title {
                    font-size: 16px;
                    font-weight: 400;
                    line-height: 18px;
                }
                // 成功标题
                .el-step__title.is-success, .el-step__title.is-process {
                    color: #FF752A;
                }
                .el-step__title.is-wait {
                    color: #C2C3CB;
                }
            }
        }
        .en-el-step__head {
            .el-step__head {
                padding-left: 50px;
            }

            .el-step__main {
                .el-step__title {
                    // padding-left: 12px;
                }
            }
        }
    }

    .whatsApp-group-button {
        padding: 8px 22px;
        // width: 86px;
    }
</style>
