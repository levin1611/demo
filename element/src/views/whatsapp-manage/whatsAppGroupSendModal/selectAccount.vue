<template>
    <div class="select-account" :style="{height: childComponentHeight, maxHeight: childComponentHeight}">
        <div class="account-type-box">
            <div class="account-type">{{$t('wagroupsend.accountType')}}</div>
            <RadioGroup v-model="currentTab" class="account-type-radio">
                <Radio :label="item.label" v-for="item in labList" :key="item.id">
                    <span style="line-height: 22px;font-weight: 500;color: #333333;">{{ item.name }}</span>
                    <span class="account-type-content">{{ item.content }}</span>
                </Radio>
            </RadioGroup>
            <div v-if="currentTab === 'personalSend'" class="account-type-warn">
                <div style="line-height: 18px;white-space: nowrap;">
                    <Icon custom="custom custom-warning" size="16" style="margin-right: 6px;color: #FBBC04;" />
                    {{$t('wagroupsend.riskWarning')}}
                </div>
                <div  class="content">
                    <p>{{$t('wagroupsend.tip1')}}</p>
                    <p>{{$t('wagroupsend.tip2')}}</p>
                    <p>{{$t('wagroupsend.tip3')}}</p>
                </div>
            </div>
        </div>

        <div v-if="currentTab === 'personalSend'" class="person-choose-account-box" style="margin-bottom: 12px;">
            <div class="name">
                {{$t('wagroupsend.selectAccount')}}
                <!-- <span class="label">{{$t('wagroupsend.priorityWillBeGiven')}}</span> -->
            </div>

            <!-- 这里要循环列表的 -->
            <template v-if="whatsappAccountList.length">
                <!-- <CheckboxGroup v-model="selectedAccount">
                        <Checkbox
                        :label="item.whatsappAccount"
                        @change="selectWaAccount"
                        >
                        {{ `${item.whatsappName}-${item.whatsappAccount}` }}
                    </Checkbox>
                    </CheckboxGroup> -->
                    <RadioGroup v-model="selectedAccount">
                        <div class="account-item" v-for="item in whatsappAccountList" :key="item.whatsappAccount">
                            <Radio  :label="item.whatsappAccount"
                                    @change="selectWaAccount">
                                    <span style="color: #333333;">
                                        {{ item.whatsappName ? `${item.whatsappName}-${item.whatsappAccount}`: item.whatsappAccount }}
                                    </span>
                            </Radio>
                        </div>
                    </RadioGroup>
            </template>
            <tamplate v-else>
                <div class="account-item">
                    {{ $t('wagroupsend.noOnlineAccountPleaseBind') }}
                </div>
            </tamplate>
        </div>
        <div v-if="currentTab === 'personalSend'" class="person-choose-account-box">
            <!-- 发送规则 -->
            <div style="margin-top: 12px;background-color: #FAFBFF;">
                <div class="name">
                    {{$t('wagroupsend.sendRules')}}
                </div>

                <Form :model="infoForm" :rules="rule_infoForm" class="formllllll">
                    <FormItem :label="$t('wagroupsend.groupSettings')" prop="groupNum" class="itemllllll">
                        <div class="contentllll">{{ $t('wagroupsend.underOneAccount') }}</div>
                        <InputNumber v-model="infoForm.groupNum"
                                    controls-position="right"
                                    :min="10"
                                    :max="15"
                                    :step-strictly="true"
                                    style="width: 82px;margin: 0 8px;"></InputNumber><div class="contentllll">{{$t('wagroupsend.customerNumbersGroup')}}</div>
                    </FormItem>
                    <FormItem :label="$t('wagroupsend.groupInterval')" prop="groupInterval" class="itemllllll">
                        <div class="contentllll">{{ $t('wagroupsend.intervalBetweenGroups') }}</div>
                        <InputNumber v-model="infoForm.groupInterval"
                                    controls-position="right"
                                    :min="2"
                                    :max="5"
                                    :step-strictly="true"
                                    style="width: 82px;margin: 0 8px;"></InputNumber>
                        <div class="contentllll">{{$t('wagroupsend.sendInHours')}}</div>
                    </FormItem>
                    <FormItem :label="$t('wagroupsend.numberInterval')" class="itemllllll">
                        <div class="contentllll">{{ $t('wagroupsend.customerSpaced') }}</div>
                        <FormItem prop="startNumberInterval">
                            <InputNumber v-model="infoForm.startNumberInterval"
                                        controls-position="right"
                                        :min="1"
                                        :max="10"
                                        :step-strictly="true"
                                        style="width: 82px;margin: 0 8px;"></InputNumber>&nbsp;-&nbsp;
                        </FormItem>
                        <FormItem prop="endNumberInterval">
                            <InputNumber v-model="infoForm.endNumberInterval"
                                        controls-position="right"
                                        :min="1"
                                        :max="10"
                                        :step-strictly="true"
                                        style="width: 82px;margin: 0 8px;"></InputNumber>
                            <div class="contentllll">{{$t('wagroupsend.minutesSend')}}</div>
                        </FormItem>
                    </FormItem>
                </Form>
            </div>
        </div>
        <div v-else style="border-radius: 8px;
                            overflow: hidden;">
            <p style="padding: 12px 20px 20px 20px;
                font-size: 14px;
                line-height: 22px;
                color: rgba(0, 0, 0, 0.8);
                font-weight: 600;
                background: #fafbff;">{{$t('wagroupsend.dfwaaccount')}}</p>
            <div class="apiaccount_wrap">
                <div class="apiaccount_item" style="justify-content: center;padding-top: 0;" v-if="!WABAaccountlist.length">
                    {{$t('wagroupsend.notopen')}}
                </div>
                <template v-if="WABAaccountlist.length">
                    <div class="apiaccount_item" v-for="item in WABAaccountlist" >
                            <div class="info_apiaccount">
                                <img v-if="item.whatsappAvatar" :src="item.whatsappAvatar" height="44">
                                <svg v-else
                                     aria-hidden="true"
                                     class="chat-svg-avatar">
                                    <use xlink:href="#custom-visitor-avatar"></use>
                                </svg>
                                <span >+{{item.whatsappAccount}}</span>
                            </div>
                            <div class="info_money">
                                {{ $t('wagroupsend.Balance') }}: {{ balance }} $
                            </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
    import { getAllLoggedAccount, getAccountConfigbalance } from '@/api/whatsapp';
    import { mapState } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';

    export default {
        name: 'selectAccount',
        props: {
            previousComponent: {
                type: String
            },
            currentComponent: {
                type: String
            },
            isCanWABA: {
                type: Boolean,
                default: false
            },
            childComponentHeight: {
                type: String,
                default: '400px'
            },
            currentChoose: {
                type: String,
                default: 'personalSend'
            }
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                wAGroupSendVisible: state => state.wAGroupSendVisible, // whatsapp群组消息发送
                button_list: state => state.app.button_list
            }),
            // 按钮权限集合
            authorized_button() {
                return {
                    personGroupSend: !HANDLE_BUTTON(BUTTON_IDS.WhatsApp.WA_Group_Btn_List.personGroupSend, this.button_list),
                    ApiGroupSend: !HANDLE_BUTTON(BUTTON_IDS.WhatsApp.WA_Group_Btn_List.ApiGroupSend, this.button_list),
                };
            }
        },
        data() {
            return {
                labList: [],
                currentTab: 'personalSend',
                WABAaccountlist:[], // WABA账号数组
                whatsappAccountList: [],
                selectedAccount: '',
                infoForm: {
                    groupNum: 15, // 分组设置
                    groupInterval: 2, // 分组间隔
                    startNumberInterval: 1, // 号码间隔1
                    endNumberInterval: 5 // 号码间隔2
                },
                rule_infoForm: {
                    groupNum: [
                        { type: 'number', min: 10, max: 15 }
                    ],
                    groupInterval: [
                        { type: 'number', min: 2, max: 5 }
                    ],
                    startNumberInterval: [
                        { type: 'number', min: 1, max: 10, validator: this.validateStartNumberInterval, trigger: 'change' }
                    ],
                    endNumberInterval: [
                        { type: 'number', min: 1, max: 10, validator: this.validateEndNumberInterval, trigger: 'change' }
                    ]
                },
                balance:0
            };
        },
        methods: {
            validateStartNumberInterval(rule, value, callback) {
                if (value > this.infoForm.endNumberInterval) {
                    this.infoForm.startNumberInterval = this.infoForm.endNumberInterval;
                    this.$Message.error(this.$t('wagroupsend.maximumValuereater'));
                } else {
                    callback();
                }
            },
            validateEndNumberInterval(rule, value, callback) {
                if (value < this.infoForm.startNumberInterval) {
                    this.infoForm.endNumberInterval = this.infoForm.startNumberInterval;
                    this.$Message.error(this.$t('wagroupsend.maximumValuereater'));
                } else {
                    callback();
                }
            },
            // 组件重置
            init() {
                this.currentTab = 'personalSend';
                this.WABAaccountlist = []; // WABA账号数组
                this.whatsappAccountList = [];
                this.selectedAccount = '';
                this.infoForm = {
                    groupNum: 15, // 分组设置
                    groupInterval: 2, // 分组间隔
                    startNumberInterval: 1, // 号码间隔1
                    endNumberInterval: 5 // 号码间隔2
                };
                this.balance = 0;
                this.$emit('setDataJson', {
                    userBindWaAccount: ''
                });
            },
            selectWaAccount() {
                this.$emit('setDataJson', {
                    userBindWaAccount: this.selectedAccount
                });
            },
            // 获取所有 wa 账号
            getAllLoggedAccount() {
                this.WABAaccountlist = [];
                getAllLoggedAccount({
                    orgId: this.enterpriseId,
                    userId: this.userId
                }).then(async res => {
                    if (res.code === 1) {
                        if (Array.isArray(res.data) && res.data.length) {
                            this.whatsappAccountList = res.data.filter(item => (item.tag !== 'WABA' && item.loginStatus === 1));
                            this.WABAaccountlist = res.data.filter(item => item.tag === 'WABA')
                            console.log( this.WABAaccountlist);
                        } else {
                            this.$Message.error(this.$t('wagroupsend.noOnlineAccount'));
                        }
                    } else {
                        this.$Message.error(this.$t('wagroupsend.noOnlineAccount'));
                    }
                    this.whatsappAccountList.forEach(item => {
                        item.checkd = false;
                    });
                });
            }
        },
        mounted() {
            document.querySelectorAll('.formllllll .itemllllll input').forEach(item => { item.disabled = true; });
            getAccountConfigbalance({ orgId: this.enterpriseId }).then(res => {
                // 查询群发账号余额
                // console.log(res);
                if (res.code ==1 ) {
                    this.balance = res.data.balance;
                } else {
                    this.balance = '查询错误请重试';
                }
            });

            if (this.authorized_button.personGroupSend) {
                // 个人广告群发
                this.labList.push({
                    id: '0',
                    label: 'personalSend',
                    name: this.$t('wagroupsend.personalAccountMassSending'),
                    content: this.$t('wagroupsend.highRiskAccount')
                });
            }
            if (this.authorized_button.ApiGroupSend) {
                // api 广告群发
                this.labList.push({
                    id: '1',
                    label: 'apiGroupSend',
                    name: this.$t('wagroupsend.adVertisingBulk'),
                    content: this.$t('wagroupsend.lowRiskAccount')
                });
            }
        },
        activated() {
            if (this.previousComponent === 'selectNumber' && this.currentComponent === 'selectAccount') {
                this.init();
            }
            this.getAllLoggedAccount();

            getAccountConfigbalance({ orgId: this.enterpriseId }).then(res => {
                // 查询群发账号余额
                // console.log(res);
                if (res.code ==1 ) {
                    this.balance = res.data.balance;
                } else {
                    this.balance = '查询错误请重试';
                }
            });
        },
        watch: {
            // modal消失时, 重置组件
            wAGroupSendVisible: {
                handler(val) {
                    if (!val) {
                        this.init();
                    }
                },
                immediate: true
            },
            infoForm: {
                handler() {
                    const data = Object.assign({}, this.infoForm);
                    // data.groupInterval = data.groupInterval * 60 * 1000; // 暂时改成分钟便于测试
                    data.groupInterval = data.groupInterval * 60 * 60 * 1000; // 小时
                    data.startNumberInterval = data.startNumberInterval * 60 * 1000; // 分钟
                    data.endNumberInterval = data.endNumberInterval * 60 * 1000; // 分钟

                    this.$emit('setDataJson', {
                        ...data
                    });

                    this.$emit('computeTime');
                },
                deep: true,
                immediate: true
            },
            currentTab: {
                handler(val) {
                    this.$emit('update:currentChoose', val);
                    this.selectedAccount = '';
                    this.$emit('setDataJson', {
                        userBindWaAccount: ''
                    });
                },
                immediate: true
            },
            WABAaccountlist(val) {
                this.$emit('update:isCanWABA', Boolean(val.length));
            }
        }
    };
</script>

<style scoped lang="less">
    .select-account {
        overflow-y: scroll;
        padding: 16px 40px 6px 40px;
        border-radius: 5px;
        .account-type-box {
            background-color: #FAFBFF;
            padding: 12px 20px;
            color: rgba(0, 0, 0, .8);
            font-size: 14px;
            margin-bottom: 12px;
            .account-type {
                font-weight: 600;
                line-height: 22px;
                margin-bottom: 12px;
            }
            .account-type-radio {
                font-weight: 400;
                margin-bottom: 12px;
                .account-type-content {
                    font-size: 12px;
                    line-height: 18px;
                    color: #666666;
                    margin-left: 12px;
                }
            }
            .account-type-warn {
                display: flex;
                font-size: 12px;
                font-weight: 400;
                color: rgba(0, 0, 0, .8);
                .content {
                    color: #333333;
                    line-height: 20px;
                    margin-left: 8px;
                    p {
                        // white-space: nowrap;
                    }
                }
            }
        }

        .person-choose-account-box {
            padding: 12px 20px;
            background-color: #FAFBFF;
            border-radius: 5px;
            .name {
                font-size: 14px;
                font-weight: 600;
                line-height: 22px;
                color: rgba(0, 0, 0, .8);
                margin: 0 12px 12px 0;
                .label {
                    font-size: 12px;
                    font-weight: 400;
                    line-height: 18px;
                    color: #666666;
                }
            }
            .account-item {
                font-size: 12px;
                font-weight: 400;
                line-height: 18px;
                color: rgba(0, 0, 0, .8);
                margin-bottom: 8px;
            }

            // 发送规则
            .send-rule {
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                font-size: 12px;
                font-weight: 400;
                color: #333333;
            }
        }
    }
    .apiaccount_item{
        width: 100%;
        padding: 12px 20px;
        background-color: #FAFBFF;
        // border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        // margin-bottom: 15px;
        .info_apiaccount{
            display: flex;
            align-items: center;
            img{
              border-radius: 50%;
            }
            span{
                color: rgba(0, 0, 0, 0.80);
                margin-left: 12px;
                font-size: 16px;
                font-weight: 600;
                line-height: 22px; 
            }
        }
        .info_money{
            color: rgba(0, 0, 0, 0.80);
            font-size: 14px;
            font-weight: 400;
            line-height: 22px; /* 157.143% */
        }
    }

    .formllllll {
        /deep/ .el-form-item {
            margin-bottom: 8px;
        }
        .itemllllll {
            /deep/ .el-form-item__content {
                display: -webkit-box;
            }
            /deep/ .el-form-item__label,.contentllll {
                font-size: 12px;
                color: #333333;
            }
            /deep/ .el-form-item__label {
                padding-right: 20px;
            }
        }
    }
</style>
