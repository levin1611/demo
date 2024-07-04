<template>
    <div class="container">
        <div style="margin-top:18px;">
            <div class="item">
                <span class="item-tip">{{$t('portal_set.color_set')}} </span>
                <!-- 颜色选择 -->
                <div class="item-color-pick">
                  <span v-for="(color,index) in colors" :key="index" @click="colorSet=color"
                        class="color-circle-out middle " :class="colorSet==color?'boxshadow': '' ">
                    <!-- <span class="color-circle-in" :class=" 'color'+(index+1) "></span> -->
                    <span class="color-circle-in" :style="'backgroundColor:'+color"></span>
                  </span>
                  <ColorPicker class="color-pick-plug-in" v-model="colorSet" :colors="colors"/>
              </div>
            </div>
            <div class="item">
                <span class="item-tip">{{$t('portal_set.window_size')}} </span>
                <RadioGroup v-model="windowSize">
                    <Radio size="large" label="1">
                        <span>{{$t('portal_set.big')}}</span>
                    </Radio>
                    <Radio size="large" label="2">
                        <span>{{$t('portal_set.middle')}}</span>
                    </Radio>
                    <Radio size="large" label="3">
                        <span>{{$t('portal_set.small')}}</span>
                    </Radio>
                </RadioGroup>
            </div>
            <div class="item">
                <span class="item-tip">{{$t('portal_set.chat_form')}} </span>
                <el-switch v-model="resetForm"></el-switch>
            </div>
            <div class="item">
                <div>{{$t('portal_set.window_tip')}} </div>
                <Input v-model="topText" :disabled="topTextEdit? false:true " maxlength="40" style="max-width:420px;">
                    <Button slot="append" @click="topTextEdit = true" icon="custom custom-edit"></Button>
                </Input>
            </div>
            <div class="item">
                <div>{{$t('portal_set.welcome_tip')}} </div>
                <Input v-model="welcomeMsg" :disabled="welcomeMsgEdit? false:true " style="max-width:420px;">
                    <Button slot="append" @click="welcomeMsgEdit = true" icon="custom custom-edit"></Button>
                </Input>
            </div>
            <div class="item" style="margin-bottom: 20px">
                <span style="display: block">{{$t('portal_set.remind_tip')}} </span>
                <span style="display: block;font-size: 12px;margin-bottom: -5px">{{fullName}}{{onInputing}}</span>
                <Input v-model="markWords" :disabled="markWordsEdit? false:true " maxlength="40"
                       style="max-width:420px;">
                    <Button slot="append" @click="markWordsEdit = true" icon="custom custom-edit"></Button>
                </Input>
            </div>
            <Button type="primary" @click="updateData()">{{$t('save')}}</Button>
        </div>
        <div class="chat-window">
            <div class="box-header" :style="'backgroundColor:'+colorSet">
                <Tooltip :content="topText" placement="top">
                    <span class="tooLangTip">{{topText}}</span>
                </Tooltip>
                <span class="arrow">
              <Icon type="chevron-down"></Icon>
            </span>
            </div>
            <div class="box-content">
                <div class="chat-box" v-if="!resetForm" style="max-height: 270px;overflow: auto;">
                    {{welcomeMsg}}
                </div>
                <div v-else style="margin:10px 20px;">
                    <div class="clearfix" style="margin-bottom: 12px">
                        <Col :span="21">
                            <p v-if="tips" style="line-height:1.5">{{resetFormTips}}</p>
                            <Input v-else v-model="resetFormTips" placeholder="Enter Tips"/>
                        </Col>
                        <Col :span="1" :offset="2">
                            <Button type="text"  @click="tips=!tips">
                                <Icon :type="tips?'edit':'checkmark'"></Icon>
                            </Button>
                        </Col>
                    </div>
                    <Form ref="formValidate" :model="formValidate" label-position="top" :rules="ruleValidate"
                          label-width="60px">
                        <FormItem :label="form1" prop="name">
                            <Input v-model="formValidate.name" placeholder=""></Input>
                        </FormItem>
                        <FormItem :label="form2" prop="mail">
                            <Input v-model="formValidate.mail" placeholder=""></Input>
                        </FormItem>
                        <FormItem :label="form3" prop="phone" v-show="enterpriseId==='10289'">
                            <Input v-model="formValidate.phone" placeholder=""></Input>
                        </FormItem>
                    </Form>
                </div>
                <div v-if="!resetForm" class="on-inputing">{{fullName}}{{onInputing}}</div>
            </div>
            <div class="box-footer">
                <Button v-if="resetForm" type="success" :style="'backgroundColor:'+colorSet+';width:100%'"
                        long>{{btnText}}
                </Button>
                <Input v-if="!resetForm" icon="android-attach" :placeholder="markWords" style="height:46px;"></Input>
            </div>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        created() {
            this.refreshData();
        },
        props: [
            'currView',
            'toView',
            'onlineData',
            'service',
            'defaultStatus',
            'chatPosition',
            'currDomain'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName'
            })
        },
        data() {
            return {
                onInputing: '正在输入...',
                tips: true,
                resetFormTips: 'Rest time now, please leave your email or phone number for more details',
                formValidate: {
                    name: '',
                    mail: '',
                    phone: ''
                },
                form1: this.$t('portal_set.name'),
                form1Edit: false,
                form1Need: true,
                form2: this.$t('portal_set.email'),
                form3: this.$t('portal_set.phone'),
                form2Edit: false,
                form2Need: true,
                btnText: this.$t('portal_set.start_chat'),
                ruleValidate: {
                    name: [
                        { required: true, message: 'The name cannot be empty', trigger: 'blur' }
                    ],
                    mail: [
                        { required: true, message: 'Mailbox cannot be empty', trigger: 'blur' },
                        { type: 'email', message: 'Incorrect email format', trigger: 'blur' }
                    ],
                    phone: [
                        { required: true, message: 'Phone cannot be empty', trigger: 'blur' },
                        { type: 'phone', message: 'Incorrect phone format', trigger: 'blur' }
                    ]
                },
                resetForm: false,
                colorSet: '#45619D', /* 选中的颜色 */
                colors: ['#45619D', '#4285F4', '#15C5D4', '#00CC99', '#7B66EE', '#FA8241', '#FBBC04'], /* 显示的颜色列表 */
                windowSize: '2', /* 聊天窗大小 */
                topText: 'Now chatting', /* 聊天窗顶部文字 */
                topTextEdit: false, /* 聊天窗顶部文字是否可编辑 */
                // welcomeMsg: 'Welcome to our website, what can I do for you ?Please leave your email and phone number , if anyone does not reply in time. Our professional person will contact you asap.', /* 欢迎语 */
                welcomeMsg: 'Welcome to our website and what is your requirement? Please leave your email or phone number. If anyone does not reply in time, our professional person will contact you asap.',
                welcomeMsgEdit: false,
                markWords: 'Type here and hit enter to chat', /* 输入框提示语 */
                markWordsEdit: false
            };
        },
        methods: {
            // 重置数据
            refreshData() {
                if (this.onlineData.topText) {
                    this.colorSet = this.onlineData.windowColor ? this.onlineData.windowColor : this.colorSet;
                    this.windowSize = this.onlineData.windowSize ? `${this.onlineData.windowSize}` : this.windowSize;
                    this.topText = this.onlineData.topText ? this.onlineData.topText : this.topText;
                    this.welcomeMsg = this.onlineData.welcomes ? this.onlineData.welcomes : this.welcomeMsg;
                    this.markWords = this.onlineData.inputPrompt ? this.onlineData.inputPrompt : this.markWords;
                    if (this.onlineData.defaultChatFormEnable !== undefined) {
                        this.resetForm = this.onlineData.defaultChatFormEnable === 1;
                        this.resetFormTips = this.onlineData.chatGreeting ? this.onlineData.chatGreeting : this.resetFormTips;
                    }
                }
            },
            updateData() {
                this.saveData();
                this.saveTranslate();
            },
            saveData() { /* 保存更改的数据 */
                const updateData = {
                    orgId: this.enterpriseId,
                    displayStatus: this.defaultStatus,
                    windowPosition: this.chatPosition,
                    windowSize: this.windowSize,
                    enable: this.service ? 1 : 2,
                    inputPrompt: this.markWords,
                    defaultChatFormEnable: this.resetForm === true ? 1 : 2,
                    chatGreeting: this.resetFormTips,
                    topText: this.topText,
                    welcomes: this.welcomeMsg,
                    windowColor: this.colorSet,
                    id: this.onlineData.id,
                    operationType: 1,
                    website: this.currDomain
                };
                if (updateData.id) {
                    util.ajaxInternational({
                        url: '/visitor-chat/online/update',
                        method: 'post',
                        data: updateData
                    }).then(res => {
                        this.$emit('update:onlineData', Object.assign({}, this.onlineData, res.data.data));
                        if (res.data.code === '1') {
                            this.$Message.success(this.$t('portal_set.save_success'));
                        } else {
                            this.$Message.error(this.$t('filter_box.save_failed'));
                        }
                    });
                } else {
                    util.ajaxInternational({
                        url: '/visitor-chat/online/save',
                        method: 'post',
                        data: updateData
                    }).then(res => {
                        if (res.data.code === '1') {
                            this.$emit('update:onlineData', res.data.data);
                            // this.onlineData = res.data.data
                            this.$Message.success(this.$t('portal_set.save_success'));
                        } else {
                            this.$Message.error(this.$t('filter_box.save_failed'));
                        }
                    });
                }
            },
            saveTranslate() {
                const postData = {
                    orgId: this.enterpriseId,
                    textList: [this.onInputing, this.topText, this.welcomeMsg, this.markWords, this.resetFormTips, this.form1, this.form2, this.btnText, this.$t('portal_set.name_empty'), this.$t('portal_set.format_wrong'), '客服'],
                    dest: 'zh_cn'
                };
                util.ajaxJson({
                    url: '/cuss-login/translate/save',
                    method: 'post',
                    data: JSON.stringify(postData)
                }).then(res => {

                });
            },

            // 检查数据较原始数据是否变更
            checkIsChanged() {
                // 当前编辑信息
                const currObj = {
                    colorSet: this.colorSet,
                    windowSize: this.windowSize,
                    topText: this.topText,
                    welcomeMsg: this.welcomeMsg,
                    markWords: this.markWords,
                    resetForm: this.resetForm,
                    resetFormTips: this.resetFormTips,
                };
                // 原始信息
                const oldObj = {
                    colorSet: this.onlineData.windowColor || '#45619D',
                    windowSize: `${this.onlineData.windowSize || '2'}`,
                    topText: this.onlineData.topText || 'Now chatting',
                    welcomeMsg: this.onlineData.welcomes || 'Welcome to our website and what is your requirement? Please leave your email or phone number. If anyone does not reply in time, our professional person will contact you asap.',
                    markWords: this.onlineData.inputPrompt || 'Type here and hit enter to chat',
                    resetForm: this.onlineData.defaultChatFormEnable ? this.onlineData.defaultChatFormEnable === 1 : false,
                    resetFormTips: this.onlineData.chatGreeting || 'Rest time now, please leave your email or phone number for more details'
                };

                // 如果当前比外部 Tab 切换还要高一级, 是"客服在线/离线"切换, 则需要把外部设置页纳入比较范围
                if (this.toView === 'ServiceOffline') {
                    currObj.defaultStatus = this.defaultStatus;
                    currObj.chatPosition = this.chatPosition;
                    currObj.service = this.service;

                    oldObj.defaultStatus = `${this.onlineData.displayStatus}`;
                    oldObj.chatPosition = `${this.onlineData.windowPosition}`;
                    oldObj.service = this.onlineData.enable === 1;
                }

                // 返回 Boolean
                return JSON.stringify(currObj) !== JSON.stringify(oldObj);
            },
            // 显示离开前确认框
            showLeaveConfirm(func_confirm, func_cancel) {
                // 打开离开确认框
                this.$confirm(this.$t('portal_set.tip_cancelEditSetting'), this.$t('portal_set.title_cancelEditSetting'), {
                    customClass: 'leaveConfirmMsgBox'
                }).then(func_confirm).catch(func_cancel);
            }
        },
        watch: {
            onlineData: {
                handler() {
                    this.refreshData();
                },
                deep: true
            },
            // 监听外部传入的"要跳转到的其他组件"
            toView: {
                handler(val) {
                    // 定义当前 view name
                    const ownViewName = 'DialogBox';
                    // 如果当前 view 就是自身, 且要跳转到的 view 不是, 说明切换了 tab
                    if (this.currView === ownViewName && val && val !== ownViewName) {
                        // 检查数据是否发生编辑过
                        const isChanged = this.checkIsChanged();

                        if (!isChanged) {
                            // 数据未变化

                            // 直接更新
                            this.$emit('update:currView', val);
                        } else {
                            // 数据有变化

                            // 弹出确认跳转提示框
                            this.showLeaveConfirm(() => {
                                // 确定

                                // 更新视图
                                this.$emit('update:currView', val);
                            }, () => {
                                // 取消

                                // 清空 toView -- 同时, 外部以 toView 为 Radio 按钮组的 Key, key 变化后样式会刷新, 避免点取消后按钮组样式不对问题
                                this.$emit('update:toView', '');
                            });
                        }
                    }
                }
            }
        }
    };
</script>

<style scoped>
    .container {
        position: relative;
    }

    .chat-window { /* 聊天框 右边 */
        width: 350px;
        height: 428px;
        border-radius: 8px;
        position: absolute;
        /* border: 1px solid lightblue; */
        box-shadow: 0px 0px 8px #bbb;
        top: 20px;
        right: 60px;
    }

    .clearfix::after { /* 清除浮动 */
        content: "";
        display: block;
        clear: both;
    }

    .box-header {
        height: 50px;
        line-height: 50px;
        border-radius: 8px 8px 0 0;
        padding-left: 25px;
        color: #fff;
        font-weight: 700;
    }

    .tooLangTip {
        display: inline-block;
        max-width: 270px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .box-content {
        overflow: auto;
    }

    .box-footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 20px 10px 10px 10px;
    }

    .chat-box {
        margin: 0 10px 10px 10px;
        padding: 10px;
        line-height: 18px;
        font-size: 12px;
        background-color: #ecefef;
        border-radius: 5px;
        position: absolute;
        bottom: 80px;
        width: 288px;
    }

    .arrow {
        display: inline-block;
        line-height: 50px;
        height: 50px;
        width: 60px;
        position: absolute;
        font-size: 16px;
        right: 0;
        cursor: pointer;
    }

    .arrow i {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%)
    }

    .arrow:hover {
        top: 2px;
    }
</style>

<style>
    /* 聊天框 */
    .box-footer .ivu-input-type input {
        height: 46px;
        padding-left: 32px;
        background-color: #f1f4f4;
    }

    .box-footer .ivu-input-type .ivu-icon {
        left: 0;
        margin-top: 7px;
    }

    .on-inputing {
        position: absolute;
        font-size: 12px;
        bottom: 54px;
        left: 12px;
    }
</style>


