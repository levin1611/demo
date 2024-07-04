<template>
    <div class="company_mail_magage_box" v-loading="loading">
        <div class="company_mail_magage" :style="`height:${window_height - 180}px;`">
            <Form :model="ruleForm" :rules="rules" ref="ruleForm" :inline="true">
                <div class="form-box">
                    <label class="form-box-label required-label">{{ $t("companyMailMagage.groupinglabel1") }}</label>
                    <span class="form-box-text">{{ $t("companyMailMagage.groupingtext1") }}</span>
                    <FormItem prop="dailyUpperLimit">
                        <InputNumber
                            v-model="ruleForm.dailyUpperLimit"
                            :precision="0"
                            :min="1"
                            :max="2000"
                            controls-position="right"
                            class="form-box-number"
                            placeholder="1-2000"></InputNumber>
                    </FormItem>
                    <span class="form-box-text">{{ $t("companyMailMagage.groupingtext2") }}</span>
                </div>
                <div class="grouping-tip">
                    <p>{{ $t("companyMailMagage.groupingTipTitle") }}</p>
                    <p>{{ $t("companyMailMagage.groupingTipText1") }} <a href="https://www.yuque.com/help.leadscloud/faq_guide/iwq96kg385qi0vt8" target="_blank">{{ $t("companyMailMagage.groupingTipHrefText") }}</a>{{ $t("companyMailMagage.groupingTipText1_1") }}</p>
                    <p>{{ $t("companyMailMagage.groupingTipText2") }}</p>
                </div>
                <div class="form-box">
                    <label class="form-box-label required-label">{{ $t("companyMailMagage.groupinglabel2") }}</label>
                    <span class="form-box-text">{{ $t("companyMailMagage.groupingtext3") }}</span>
                    <FormItem prop="minMailIntervalTime">
                        <InputNumber
                            v-model="ruleForm.minMailIntervalTime"
                            :precision="0"
                            :min="3"
                            :max="1200"
                            controls-position="right"
                            class="form-box-number"
                            placeholder="3-1200"></InputNumber>
                    </FormItem>
                    -
                    <FormItem prop="maxMailIntervalTime">
                        <InputNumber
                            v-model="ruleForm.maxMailIntervalTime"
                            :precision="0"
                            :min="3"
                            :max="1200"
                            controls-position="right"
                            class="form-box-number"
                            placeholder="3-1200"></InputNumber>
                    </FormItem>
                    <span class="form-box-text">{{ $t("companyMailMagage.groupingtext4") }}</span>
                </div>
                <div class="form-box">
                    <label class="form-box-label required-label">{{ $t("companyMailMagage.groupinglabel3") }}</label>
                    <span class="form-box-text">{{ $t("companyMailMagage.groupingtext5") }}</span>
                    <FormItem prop="groupCount">
                        <InputNumber
                            v-model="ruleForm.groupCount"
                            :precision="0"
                            :min="1"
                            :max="1000"
                            controls-position="right"
                            class="form-box-number"
                            placeholder="1-1000"></InputNumber>
                    </FormItem>
                    <span class="form-box-text">{{ $t("companyMailMagage.groupingtext6") }}</span>
                    <FormItem prop="groupIntervalTime">
                        <InputNumber
                            v-model="ruleForm.groupIntervalTime"
                            :precision="0"
                            :min="20"
                            :max="300"
                            controls-position="right"
                            class="form-box-number"
                            placeholder="20-300"></InputNumber>
                    </FormItem>
                    <span class="form-box-text">{{ $t("companyMailMagage.groupingtext7") }}</span>
                </div>
            </Form>
        </div>
        <div class="submit-box">
            <Button type="primary"
                size="large"
                @click="handleSave">{{ $t('save') }}</Button>
        </div>
    </div>
</template>
<script>
    import util from '@/libs/util.js';
    import { mapState } from 'vuex';
    export default {
        name: 'prevent_bump_orders_set',
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height'
            })
        },
        data() {
            return {
                loading: true,
                oldMailAntiCllisionValue: 0,
                mailAntiCllisionValue: null,
                mailManageSettingsId: null,
                oldRuleForm: {},
                ruleForm: {
                    dailyUpperLimit: 120,
                    minMailIntervalTime: 5,
                    maxMailIntervalTime: 10,
                    groupCount: 30,
                    groupIntervalTime: 60
                },
                rules: {
                    dailyUpperLimit: [
                        { required: true, message: this.$t('companyMailMagage.requiredTip'), trigger: 'blur' }
                    ],
                    minMailIntervalTime: [
                        { required: true, message: this.$t('companyMailMagage.requiredTip'), trigger: 'blur' }
                    ],
                    maxMailIntervalTime: [
                        { required: true, message: this.$t('companyMailMagage.requiredTip'), trigger: 'blur' }
                    ],
                    groupCount: [
                        { required: true, message: this.$t('companyMailMagage.requiredTip'), trigger: 'blur' }
                    ],
                    groupIntervalTime: [
                        { required: true, message: this.$t('companyMailMagage.requiredTip'), trigger: 'blur' }
                    ]
                }
            };
        },
        created() {
            this.getDefaultSetting();
        },
        methods: {
            // 获取默认字段
            getDefaultSetting() {
                this.loading = true;
                util.ajaxMail({
                    url: '/mail/mailManageSettings',
                    method: 'post',
                    data: {
                        createUserId: this.userId,
                        orgId: this.orgId
                    }
                }).then((response) => {
                    if (response.data.code === 1) {
                        const data = response.data.data;
                        this.mailAntiCllisionValue = data.isAutoInterForwarding;
                        this.mailManageSettingsId = data.id;
                        this.ruleForm = {
                            dailyUpperLimit: data.dailyUpperLimit,
                            minMailIntervalTime: data.minMailIntervalTime,
                            maxMailIntervalTime: data.maxMailIntervalTime,
                            groupCount: data.groupCount,
                            groupIntervalTime: data.groupIntervalTime
                        };
                        this.oldRuleForm = JSON.parse(JSON.stringify(this.ruleForm));
                    } else {
                        this.mailAntiCllisionValue = 0;
                        this.ruleForm = {
                            dailyUpperLimit: 120,
                            minMailIntervalTime: 5,
                            maxMailIntervalTime: 10,
                            groupCount: 30,
                            groupIntervalTime: 60
                        };
                        this.oldRuleForm = JSON.parse(JSON.stringify(this.ruleForm));
                    }
                    this.loading = false;
                });
            },
            handleSave() {
                this.$refs.ruleForm.validate((valid) => {
                    if (valid) {
                        if (this.ruleForm.minMailIntervalTime > this.ruleForm.maxMailIntervalTime) {
                            this.$Message({
                                message: this.$t('companyMailMagage.validateTip1'),
                                type: 'error',
                                showClose: true
                            });
                            return false;
                        }
                        let data = {
                            id: this.mailManageSettingsId,
                            updateUserId: this.userId,
                            orgId: this.orgId,
                            isAutoInterForwarding: this.mailAntiCllisionValue
                        };
                        data = Object.assign(data, this.ruleForm);
                        util.ajaxJson({
                            url: '/mail/mailManageSettings/updateAutoInterForwardingSettings',
                            method: 'PUT',
                            data: data
                        }).then((response) => {
                            if (response.data.code === 1) {
                                this.$Message.success(this.$t('whatsapp_manage.setSuccessfully'));
                            }
                            this.getDefaultSetting();
                        });
                    }
                });
            },
            // 判断数据是否有变化
            checkChange() {
                let resultLength = 0;
                Object.keys(this.ruleForm).forEach(item => {
                    if (this.ruleForm[item] !== this.oldRuleForm[item]) {
                        resultLength++;
                    }
                });
                return resultLength > 0;
            }
        },
        beforeRouteLeave(to, from, next) {
            // 有变化时提示下
            if (this.checkChange()) {
                this.$confirm(this.$t('companyMailMagage.leaveMotionTip'), this.$t('crm.aliImport.leaveConfirm'), {
                    confirmButtonText: this.$t('crm.InqSet.modal_ok'),
                    cancelButtonText: this.$t('crm.InqSet.modal_cancel'),
                    type: ''
                }).then(() => {
                    next();
                }).catch(() => { });
                return;
            }
            next();
        },
        watch: {
        }
    };
</script>

<style lang="less" scoped>
.company_mail_magage_box{
    width: 100%;
    height: 100%;
    .company_mail_magage {
        padding: 15px 0 0 0;
        overflow-y: auto;
        // font-family: "PingFangSC-Semibold";
        .title {
            margin-bottom: 20px;
            font-size: 16px;
            line-height: 24px;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.8);
        }
        .form-box {
            font-size: 12px;
            line-height: 40px;
            margin-bottom: 20px;
            font-weight: normal;
            color: rgba(0, 0, 0, 0.8);
            .form-box-label {
                padding-right: 20px;
            }
            .required-label::before{
                content: '*';
                color: #F56C6C;
                margin-right: 4px
            }
            // .form-box-text{
            //     padding: 0 5px;
            // }
            .form-box-number {
                width: 100px;
                margin: 0 12px;
            }
            .el-form-item__error{
                margin-left: 12px;
            }
        }
        .grouping-tip{
            padding: 0 0 20px 80px;
            p {
                line-height: 26px;
                font-size: 12px;
                color: rgba(0, 0, 0, 0.4);
            }
        }
    }
    .submit-box{
        padding: 12px 0;
        background: #fff;
    }
    .el-form--inline .el-form-item{
        margin: 0;
    }
}

</style>

