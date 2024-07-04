<template>
    <div class="company_mail_magage_box" v-loading="loading">
        <div class="company_mail_magage" :style="`height:${window_height - 180}px;`">
            <div class="form-box">
                <label class="form-box-label">{{ $t("companyMailMagage.label") }}</label>
                <RadioGroup v-model="mailAntiCllisionValue">
                    <Radio :label="1" class="check-box mailAntiCllisionValue-1">
                        {{$t("companyMailMagage.yes")}}
                    </Radio>
                    <Radio :label="0" class="check-box mailAntiCllisionValue-0">
                        {{$t("companyMailMagage.no")}}
                    </Radio>
                </RadioGroup>
            </div>
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
                        this.oldMailAntiCllisionValue = data.isAutoInterForwarding;
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
            },
            // 判断数据是否有变化
            checkChange() {
                if (this.mailAntiCllisionValue !== this.oldMailAntiCllisionValue) return true;
            }
        },
        // beforeRouteLeave(to, from, next) {
        //     // 有变化时提示下
        //     if (this.checkChange()) {
        //         this.$confirm(this.$t('companyMailMagage.leaveMotionTip'), this.$t('crm.aliImport.leaveConfirm'), {
        //             confirmButtonText: this.$t('crm.InqSet.modal_ok'),
        //             cancelButtonText: this.$t('crm.InqSet.modal_cancel'),
        //             type: ''
        //         }).then(() => {
        //             next();
        //         }).catch(() => { });
        //         return;
        //     }
        //     next();
        // },
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

