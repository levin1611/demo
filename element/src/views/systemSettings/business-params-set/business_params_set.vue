<template>
    <div class="params-set" v-loading="loading">
        <h3 class="header">{{$t('businessParamsSet.title')}}</h3>
        <div class="businessRules">
            <Card shadow="never">
                <div class="businessRulesTitle">{{$t('businessParamsSet.clueFollowupRules')}}
                    <Tooltip :max-width="300" :content="$t('businessParamsSet.clueTip')" placement="right">
                        <span class="help-btn">
                            <Icon custom="custom-tip" />
                        </span>
                    </Tooltip>
                </div>
                <!-- 跟进规则 -->
                <div class="clue-rules">
                    <div class="rules-checkbox">
                        <Checkbox class="check-box" v-model="clue.followup.status">&nbsp;{{$t('businessParamsSet.folloeupRecord')}}</Checkbox>
                        <Checkbox class="check-box" v-model="clue.sendMail.status">&nbsp;{{$t('businessParamsSet.sendMail')}}</Checkbox>
                        <Checkbox class="check-box" v-model="clue.recieveMail.status">&nbsp;{{$t('businessParamsSet.recieveMail')}}</Checkbox>
                        <Checkbox class="check-box" v-model="clue.sendWhatsApp.status">&nbsp;{{$t('businessParamsSet.sendWhatsApp')}}</Checkbox>
                        <Checkbox class="check-box" v-model="clue.recieveWhatsApp.status">&nbsp;{{$t('businessParamsSet.recieveWhatsApp')}}</Checkbox>
                        <Checkbox :disabled="!authorized_button.microenterprise" class="check-box" v-model="clue.sendMicroenterprise.status">&nbsp;{{$t('businessParamsSet.sendMessageWeCom')}}</Checkbox>
                        <Checkbox :disabled="!authorized_button.microenterprise" class="check-box" v-model="clue.recieveMicroenterprise.status">&nbsp;{{$t('businessParamsSet.receiveMessageWeCom')}}</Checkbox>
                    </div>
                </div>
                <div class="clue-rules rules-checkbox">
                    <span class="rule-title">{{$t('businessParamsSet.cluetimelyFollowup')}}</span>&emsp;
                    <Select v-model="clue.time" style="width:100px">
                                <Option v-for="item in clue.timeList" :value="item.value" :key="item.value" :label="item.label">{{ item.label }}</Option>
                            </Select>&emsp;
                            <InputNumber
                                    v-show="clue.time===-10"
                                    :precision="0"
                                    :min="1"
                                    :max="10000"
                                    v-model="clue.timeValue"></InputNumber>
                                    <span v-show="clue.time===-10" style="margin-left:5px;">{{$t('businessParamsSet.hours')}}</span>
                </div>
                <!-- 对话及时跟进规则 -->
                <div class="clue-rules">
                    <span class="rule-title">{{$t('businessParamsSet.sessionFollowupRules')}}</span>
                    <Tooltip :max-width="300" :content="$t('businessParamsSet.chatTip')" placement="right">
                        <span class="help-btn">
                            <Icon custom="custom-tip" />
                        </span>
                    </Tooltip>
                    <div class="rules-checkbox" style="margin: 12px 0;">
                        <span style="margin-right:30px;">
                            {{$t('businessParamsSet.webSessionTimelyFollowup')}}&emsp;
                            <Select v-model="webChat.time" style="width:100px">
                                <Option v-for="item in webChat.timeList" :value="item.value" :key="item.value" :label="item.label">{{ item.label }}</Option>
                            </Select>&emsp;
                            <InputNumber v-show="webChat.time===-10"
                                        :precision="0"
                                        :min="1"
                                        :max="10000"
                                        v-model="webChat.timeValue"></InputNumber>
                                        <span v-show="webChat.time===-10" style="margin-left:5px;">s</span>
                        </span>
                        <span>
                            {{$t('businessParamsSet.fackbookMsgTimelyFollowup')}}&emsp;
                            <Select v-model="fbChat.time" style="width:100px">
                                <Option v-for="item in fbChat.timeList" :value="item.value" :key="item.value" :label="item.label">{{ item.label }}</Option>
                            </Select>&emsp;
                            <InputNumber v-show="fbChat.time===-10"
                                        :precision="0"
                                        :min="1"
                                        :max="10000"
                                        v-model="fbChat.timeValue"></InputNumber>
                                        <span v-show="fbChat.time===-10" style="margin-left:5px;">{{$t('businessParamsSet.hours')}}</span>
                        </span>
                    </div>
                </div>
                <Button type="primary" @click="saveSet" :loading="saveSetLoading">{{$t('save')}}</Button>
            </Card>
            <Card shadow="never" style="margin-bottom: 20px">
                <div class="businessRulesTitle">{{$t('highSeasSetting.businessRulesTitle1')}}</div>
                <p class="businessRulesText">{{$t('highSeasSetting.businessRulesText1')}}</p>
                <div style="margin: 0 0 12px;">
                    <Checkbox v-for="item in getRuleList" :key="item.ruleId" :disabled="item.disabled" class="check-box" v-model="item.value">{{ item.label }}</Checkbox>
                </div>
                <Button type="primary" @click="saveGetRule">{{$t('save')}}</Button>
            </Card>
            <Card shadow="never">
                <div class="businessRulesTitle">{{$t('highSeasSetting.businessRulesTitle3')}}</div>
                <p class="businessRulesText">{{$t('highSeasSetting.businessRulesText3')}}</p>
            </Card>
        </div>
    </div>
</template>
<script>
    import { mapState } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { businessParamsSet } from '@/api/systemSettings/high-seas-setting/index';

    export default {
        name: 'business_params_set',
        computed: {
            ...mapState({
                menu_list: state => state.app.menu_list,
                orgId: 'enterpriseId',
                userId: 'userId'
            }),
            authorized_button() {
                return {
                    microenterprise: !HANDLE_BUTTON(BUTTON_IDS.WeChat.microenterprise, this.menu_list)
                };
            }
        },
        data() {
            return {
                loading: true,
                saveSetLoading: false,
                saveGetRuleLoading: false,
                ruleList: [],
                clue: {
                    followup: { status: false },
                    sendMail: { status: false },
                    recieveMail: { status: false },
                    sendWhatsApp: { status: false },
                    recieveWhatsApp: { status: false },
                    recieveMicroenterprise: { status: false },
                    sendMicroenterprise: { status: false },
                    time: 24,
                    timeList: [
                        { value: 12, label: this.$t('businessParamsSet.hours12') },
                        { value: 24, label: this.$t('businessParamsSet.hours24') },
                        { value: 48, label: this.$t('businessParamsSet.hours48') },
                        { value: -10, label: this.$t('businessParamsSet.customTime') }
                    ]
                },
                webChat: {
                    time: 0,
                    timeValue: 0,
                    timeList: [
                        { value: 10, label: '10s' },
                        { value: 20, label: '20s' },
                        { value: 30, label: '30s' },
                        { value: 40, label: '40s' },
                        { value: 50, label: '50s' },
                        { value: 60, label: '60s' },

                        { value: -10, label: this.$t('businessParamsSet.customTime') }
                    ]
                },
                fbChat: {
                    time: 0,
                    timeValue: 0,
                    timeList: [
                        { value: 12, label: this.$t('businessParamsSet.hours12') },
                        { value: 24, label: this.$t('businessParamsSet.hours24') },
                        { value: 48, label: this.$t('businessParamsSet.hours48') },
                        { value: -10, label: this.$t('businessParamsSet.customTime') }
                    ]
                },
                getRuleList: []
            };
        },
        created() {
            this.getRule();
            this.getGetRuleList();
        },
        methods: {
            /**
             * 1,旧页面在点击保存按钮时会调用5次add接口
             * 2,重构后新接口为report/rules/addAll
             * 3,传递的参数为一个list包含5个对象(需要传JSON对象)
             * time:2021/11/25
             */
            addAll(ruleList) {
                businessParamsSet.saveRules(JSON.stringify(ruleList)).then(res => {
                    this.getRule();
                    if (res.code === '1') {
                        this.$Message.success(this.$t('saveSuccess'));
                    } else {
                        this.$Message.success(this.$t('saveFail'));
                    }
                    this.saveSetLoading = false;
                });
            },
            saveSet() {
                // createUser (string, optional): 创建人 ,

                // actionType (integer, optional): 1跟进记录2发邮件 ,
                // orgId (integer, optional): 企业id ,
                // statType (integer, optional): 1线索2询盘3对话 ,
                // status (integer, optional): 1启用2停用 ,
                // timeUnit (string, optional): 时间单位 ,
                // timeValue (integer, optional): 时间数值 ,

                // id (integer, optional): 主键id ,
                // updateUser (string, optional): 修改人
                const ruleList = [];
                this.saveSetLoading = true;
                this.ruleList.forEach(rules => {
                    let postData = {};
                    if (rules.statType === 1 && rules.actionType === 1) { // 设置填写跟进记录
                        postData = {
                            actionType: 1,
                            orgId: this.orgId,
                            statType: 1,
                            status: this.clue.followup.status ? 1 : 2,
                            timeUnit: 'h',
                            timeValue: this.clue.time === -10 ? this.clue.timeValue : this.clue.time
                        };
                        if (this.clue.followup.id) {
                            postData = Object.assign({
                                id: this.clue.followup.id,
                                updateUser: this.userId
                            }, postData);
                        } else {
                            postData = Object.assign({
                                createUser: this.userId
                            }, postData);
                        }
                    } else if (rules.statType === 1 && rules.actionType === 2) { // 设置发送邮件
                        postData = {
                            actionType: 2,
                            orgId: this.orgId,
                            statType: 1,
                            status: this.clue.sendMail.status ? 1 : 2,
                            timeUnit: 'h',
                            timeValue: this.clue.time === -10 ? this.clue.timeValue : this.clue.time
                        };
                        if (this.clue.sendMail.id) {
                            postData = Object.assign({
                                id: this.clue.sendMail.id,
                                updateUser: this.userId
                            }, postData);
                        } else {
                            postData = Object.assign({
                                createUser: this.userId
                            }, postData);
                        }
                    } else if (rules.statType === 3 && rules.actionType === 3) { // 网站对话及时跟进时间
                        postData = {
                            actionType: 3,
                            orgId: this.orgId,
                            statType: 3,
                            status: 1,
                            timeUnit: 's',
                            timeValue: this.webChat.time === -10 ? this.webChat.timeValue : this.webChat.time
                        };
                        if (this.webChat.id) {
                            postData = Object.assign({
                                id: this.webChat.id,
                                updateUser: this.userId
                            }, postData);
                        } else {
                            postData = Object.assign({
                                createUser: this.userId
                            }, postData);
                        }
                    } else if (rules.statType === 3 && rules.actionType === 4) { // 设置Facebook 私信及时跟进时间
                        postData = {
                            actionType: 4,
                            orgId: this.orgId,
                            statType: 3,
                            status: 1,
                            timeUnit: 'h',
                            timeValue: this.fbChat.time === -10 ? this.fbChat.timeValue : this.fbChat.time
                        };
                        if (this.fbChat.id) {
                            postData = Object.assign({
                                id: this.fbChat.id,
                                updateUser: this.userId
                            }, postData);
                        } else {
                            postData = Object.assign({
                                createUser: this.userId
                            }, postData);
                        }
                    } else if (rules.statType === 1 && rules.actionType === 6) { // 接收邮件
                        postData = {
                            actionType: 6,
                            orgId: this.orgId,
                            statType: 1,
                            status: this.clue.recieveMail.status ? 1 : 2,
                            timeUnit: 'h',
                            timeValue: this.clue.time === -10 ? this.clue.timeValue : this.clue.time
                        };
                        if (this.clue.recieveMail.id) {
                            postData = Object.assign({
                                id: this.clue.recieveMail.id,
                                updateUser: this.userId
                            }, postData);
                        } else {
                            postData = Object.assign({
                                createUser: this.userId
                            }, postData);
                        }
                    } else if (rules.statType === 1 && rules.actionType === 7) { // 设置WhatsApp发送消息
                        postData = {
                            actionType: 7,
                            orgId: this.orgId,
                            statType: 1,
                            status: this.clue.sendWhatsApp.status ? 1 : 2,
                            timeUnit: 'h',
                            timeValue: this.clue.time === -10 ? this.clue.timeValue : this.clue.time
                        };
                        if (this.clue.sendWhatsApp.id) {
                            postData = Object.assign({
                                id: this.clue.sendWhatsApp.id,
                                updateUser: this.userId
                            }, postData);
                        } else {
                            postData = Object.assign({
                                createUser: this.userId
                            }, postData);
                        }
                    } else if (rules.statType === 1 && rules.actionType === 8) { // 接收WhatsApp消息
                        postData = {
                            actionType: 8,
                            orgId: this.orgId,
                            statType: 1,
                            status: this.clue.recieveWhatsApp.status ? 1 : 2,
                            timeUnit: 'h',
                            timeValue: this.clue.time === -10 ? this.clue.timeValue : this.clue.time
                        };
                        if (this.clue.recieveWhatsApp.id) {
                            postData = Object.assign({
                                id: this.clue.recieveWhatsApp.id,
                                updateUser: this.userId
                            }, postData);
                        } else {
                            postData = Object.assign({
                                createUser: this.userId
                            }, postData);
                        }
                    } else if (rules.statType === 1 && rules.actionType === 9) { // 发送企微消息
                        postData = {
                            actionType: 9,
                            orgId: this.orgId,
                            statType: 1,
                            status: this.clue.sendMicroenterprise.status ? 1 : 2,
                            timeUnit: 'h',
                            timeValue: this.clue.time === -10 ? this.clue.timeValue : this.clue.time
                        };
                        if (this.clue.sendMicroenterprise.id) {
                            postData = Object.assign({
                                id: this.clue.sendMicroenterprise.id,
                                updateUser: this.userId
                            }, postData);
                        } else {
                            postData = Object.assign({
                                createUser: this.userId
                            }, postData);
                        }
                    } else if (rules.statType === 1 && rules.actionType === 10) { // 接收企微消息
                        postData = {
                            actionType: 10,
                            orgId: this.orgId,
                            statType: 1,
                            status: this.clue.recieveMicroenterprise.status ? 1 : 2,
                            timeUnit: 'h',
                            timeValue: this.clue.time === -10 ? this.clue.timeValue : this.clue.time
                        };
                        if (this.clue.recieveMicroenterprise.id) {
                            postData = Object.assign({
                                id: this.clue.recieveMicroenterprise.id,
                                updateUser: this.userId
                            }, postData);
                        } else {
                            postData = Object.assign({
                                createUser: this.userId
                            }, postData);
                        }
                    }
                    // 后端将历史未用到的数据都返回了，在此过滤下
                    if (postData && postData.actionType) {
                        ruleList.push(postData);
                    }
                });
                this.addAll(ruleList);
            },
            // 获取设置数据
            getRule() {
                businessParamsSet.getRules({ orgId: this.orgId }).then(res => {
                    if (res.code === '1') {
                        this.ruleList = res.data.list;
                        this.handleRuleList();
                    }
                });
            },
            handleRuleList() {
                this.ruleList.forEach(rules => {
                    if (rules.statType === 1 && rules.actionType === 1) { // 设置填写跟进记录
                        this.clue.followup = {
                            status: rules.status === 1,
                            id: rules.id
                        };
                        const timeArr = this.clue.timeList.filter(item => {
                            return item.value === rules.timeValue;
                        });
                        // 设置 线索及时跟进时间
                        if (timeArr.length) {
                            this.clue.time = rules.timeValue;
                        } else {
                            this.clue.time = -10;
                        }
                        // 设置时间
                        this.clue.timeValue = rules.timeValue;
                    } else if (rules.statType === 1 && rules.actionType === 2) { // 设置发送邮件
                        this.clue.sendMail = {
                            status: rules.status === 1,
                            id: rules.id
                        };
                        const timeArr = this.clue.timeList.filter(item => {
                            return item.value === rules.timeValue;
                        });
                        // 设置 线索及时跟进时间
                        if (timeArr.length) {
                            this.clue.time = rules.timeValue;
                        } else {
                            this.clue.time = -10;
                        }
                        this.clue.timeValue = rules.timeValue;
                    } else if (rules.statType === 3 && rules.actionType === 3) { // 网站对话及时跟进时间
                        this.webChat.id = rules.id;
                        const timeArr = this.webChat.timeList.filter(item => {
                            return item.value === rules.timeValue;
                        });
                        if (timeArr.length) {
                            this.webChat.time = rules.timeValue;
                        } else {
                            this.webChat.time = -10;
                        }
                        this.webChat.timeValue = rules.timeValue;
                    } else if (rules.statType === 3 && rules.actionType === 4) { // 设置Facebook 私信及时跟进时间
                        this.fbChat.id = rules.id;
                        const timeArr = this.fbChat.timeList.filter(item => {
                            return item.value === rules.timeValue;
                        });
                        if (timeArr.length) {
                            this.fbChat.time = rules.timeValue;
                        } else {
                            this.fbChat.time = -10;
                        }
                        this.fbChat.timeValue = rules.timeValue;
                    } else if (rules.statType === 1 && rules.actionType === 6) { // 接收邮件
                        this.clue.recieveMail = {
                            status: rules.status === 1,
                            id: rules.id
                        };
                        const timeArr = this.clue.timeList.filter(item => {
                            return item.value === rules.timeValue;
                        });
                        // 设置 线索及时跟进时间
                        if (timeArr.length) {
                            this.clue.time = rules.timeValue;
                        } else {
                            this.clue.time = -10;
                        }
                        this.clue.timeValue = rules.timeValue;
                    } else if (rules.statType === 1 && rules.actionType === 7) { // 设置WhatsApp发送消息
                        this.clue.sendWhatsApp = {
                            status: rules.status === 1,
                            id: rules.id
                        };
                        const timeArr = this.clue.timeList.filter(item => {
                            return item.value === rules.timeValue;
                        });
                        if (timeArr.length) {
                            this.clue.time = rules.timeValue;
                        } else {
                            this.clue.time = -10;
                        }
                        this.clue.timeValue = rules.timeValue;
                    } else if (rules.statType === 1 && rules.actionType === 8) { // 接收WhatsApp消息
                        this.clue.recieveWhatsApp = {
                            status: rules.status === 1,
                            id: rules.id
                        };
                        const timeArr = this.clue.timeList.filter(item => {
                            return item.value === rules.timeValue;
                        });
                        // 设置 线索及时跟进时间
                        if (timeArr.length) {
                            this.clue.time = rules.timeValue;
                        } else {
                            this.clue.time = -10;
                        }
                        this.clue.timeValue = rules.timeValue;
                    } else if (rules.statType === 1 && rules.actionType === 9) { // 设置企微发送消息
                        this.clue.sendMicroenterprise = {
                            status: rules.status === 1,
                            id: rules.id
                        };
                        const timeArr = this.clue.timeList.filter(item => {
                            return item.value === rules.timeValue;
                        });
                        if (timeArr.length) {
                            this.clue.time = rules.timeValue;
                        } else {
                            this.clue.time = -10;
                        }
                        this.clue.timeValue = rules.timeValue;
                    } else if (rules.statType === 1 && rules.actionType === 10) { // 设置接收企微消息
                        this.clue.recieveMicroenterprise = {
                            status: rules.status === 1,
                            id: rules.id
                        };
                        const timeArr = this.clue.timeList.filter(item => {
                            return item.value === rules.timeValue;
                        });
                        // 设置 线索及时跟进时间
                        if (timeArr.length) {
                            this.clue.time = rules.timeValue;
                        } else {
                            this.clue.time = -10;
                        }
                        this.clue.timeValue = rules.timeValue;
                    }
                });
            },
            getGetRuleList() {
                businessParamsSet.getGetRules({ orgId: this.orgId }).then(res => {
                    if (res.code === '1') {
                        this.getRuleList = res.data.map(item => {
                            item.label = this.$t(`highSeasSetting.getRulesOption${item.ruleId}`);
                            item.value = item.value === 1;
                            item.disabled = item.disable === 1;
                            return item;
                        });
                    }
                    this.loading = false;
                });
            },
            saveGetRule() {
                this.saveGetRuleLoading = true;
                const data = this.$deepClone(this.getRuleList).map(item => {
                    item.value = item.value ? 1 : 0;
                    return item;
                });
                businessParamsSet.saveGetRules({
                    orgId: this.orgId,
                    userId: this.userId,
                    ruleInfo: data
                }).then(res => {
                    if (res.code === '1') {
                        this.$Message.success(this.$t('saveSuccess'));
                    } else {
                        this.$Message.success(this.$t('saveFail'));
                        this.getGetRuleList();
                    }
                    this.saveGetRuleLoading = false;
                });
            }
        }
    };
</script>
<style lang="less">
    .params-set {
        padding: 30px;
        height: 100%;
        color: rgba(0, 0, 0, 0.8);
        .businessRules {
            .el-card {
                max-width: 1000px;
                margin-bottom: 20px;
            }
            .el-card__body {
                padding: 16px;
            }
            .businessRulesTitle {
                margin-bottom: 12px;
                font-size: 14px;
                line-height: 22px;
                color: rgba(0, 0, 0, 0.8);
                font-weight: 600;
            }
            .businessRulesText {
                margin-bottom: 12px;
                font-size: 12px;
                line-height: 18px;
                color: #666666;
            }
        }
        .header {
            margin-bottom: 12px;
            font-size: 16px;
            line-height: 26px;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.8);
        }
        .help-btn {
            font-size: 14px;
            margin-left: 10px;
        }
        .rules-checkbox {
            margin-bottom: 16px;
            font-size: 12px;
            .check-box{
                margin-right: 30px;
            }
            .el-select {
                width: 120px !important;
            }
            .el-input-number {
                width: 120px;
            }
        }
    }

</style>

