<template>
    <div class="business_email">
        <template v-if="!addEmailTemplateStatus">
            <div class="email_template_tabs">
                <Tabs v-model="currentTab" class="add_mailbox_tabs" @tab-click="handleTabsClick">
                    <TabPane name="templateList">
                        <span slot="label">{{ $t('mailSetting.emailTemplate.name') }}</span>
                    </TabPane>
                    <TabPane name="mailAntiCllision">
                        <span slot="label">{{ $t("companyMailMagage.title") }}</span>
                    </TabPane>
                    <TabPane name="preventBumpOrdersSet">
                        <span slot="label">{{ $t("companyMailMagage.groupingTitle") }}</span>
                    </TabPane>
                </Tabs>
            </div>
             <component
                :is="currentTab"
                :ref="currentTab"
                :memoryData="memoryData"
                @handleView="handleView"
            ></component>
            <!-- <component v-bind:is="currentTab"></component> -->
            <!-- <mailAntiCllision ref="mailAntiCllision" v-if="currentTab === 'mailAntiCllision'"></mailAntiCllision>
            <PreventBumpOrdersSet ref="preventBumpOrdersSet" v-if="currentTab === 'preventBumpOrdersSet'"></PreventBumpOrdersSet>
            <templateList  v-if="currentTab === 'mailTemplate'" @handleView="handleView"></templateList> -->
        </template>
        <template v-else>
            <newTemplate ref="newTemplate" :templateClassificationId="templateClassificationId" :mailTemplateId="mailTemplateId" @handleBack="handleBack"></newTemplate>
        </template>
    </div>
</template>
<script>
    import { mapState } from 'vuex';
    const PreventBumpOrdersSet = () => import("./prevent_bump_orders_set.vue"); // 群发单显
    const mailAntiCllision = () => import("./mail_anti_cllision.vue"); // 邮箱防撞单
    const templateList = () => import("./template-list.vue"); // 模板列表
    const newTemplate = () => import("./new_template.vue"); // 新增模板
    export default {
        name: 'company_mail_magage',
        components: { PreventBumpOrdersSet, templateList, newTemplate, mailAntiCllision },
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId'
            })
        },
        data() {
            return {
                currentTab: 'templateList',
                currentTabOld: 'templateList',
                addEmailTemplateStatus: false,
                memoryData: null,
                mailTemplateId: '',
                templateClassificationId: ''
            };
        },
        created() {
        },
        methods: {
            handleTabsClick(val) {
                this.memoryData = null;
                // if (['mailAntiCllision', 'preventBumpOrdersSet'].includes(this.currentTabOld)) {
                //     // 有变化时提示下
                //     if (this.$refs[this.currentTabOld].checkChange()) {
                //         this.$confirm(this.$t('companyMailMagage.leaveMotionTip'), this.$t('crm.aliImport.leaveConfirm'), {
                //             confirmButtonText: this.$t('crm.InqSet.modal_ok'),
                //             cancelButtonText: this.$t('crm.InqSet.modal_cancel'),
                //             type: ''
                //         }).then(() => {
                //             this.currentTabOld = val.name;
                //         }).catch(() => {
                //             this.currentTab = this.currentTabOld;
                //         });
                //         return;
                //     }
                // }
                // this.currentTabOld = val.name;
            },
            handleView(data) {
                this.memoryData = data;
                if (data.type === 'newTemplate') {
                    this.mailTemplateId = '';
                    this.templateClassificationId = data.currentTab;
                } else if (data.type === 'editTemplate') {
                    this.mailTemplateId = data.mailTemplateId;
                }
                this.addEmailTemplateStatus = true;
            },
            handleBack() {
                this.addEmailTemplateStatus = false;
            }
        },
        beforeRouteLeave(to, from, next) {
            if (['mailAntiCllision', 'preventBumpOrdersSet'].includes(this.currentTab)) {
                // 有变化时提示下
                if (this.$refs[this.currentTab].checkChange()) {
                    this.$confirm(this.$t('companyMailMagage.leaveMotionTip'), this.$t('crm.aliImport.leaveConfirm'), {
                        confirmButtonText: this.$t('crm.InqSet.modal_ok'),
                        cancelButtonText: this.$t('crm.InqSet.modal_cancel'),
                        type: ''
                    }).then(() => {
                        next();
                    }).catch(() => { });
                    return;
                }
            }
            if (this.addEmailTemplateStatus) {
                this.$refs.newTemplate.leaveVisible = false;
                this.$confirm(this.$t('mailSetting.emailTemplate.leaveTip'), this.$t('crm.aliImport.leaveConfirm'), {
                    confirmButtonText: this.$t('crm.InqSet.modal_ok'),
                    cancelButtonText: this.$t('crm.InqSet.modal_cancel'),
                    customClass: 'leaveConfirm'
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

<style lang="less">
    .business_email{
        padding: 20px 30px 0;

        .email_template_tabs{
            /deep/ .el-tabs__item{
                font-size: 15px;
            }
            /deep/ .el-tabs__nav-wrap::after{
                height: 0;
            }
        }
    }
    .leaveConfirm {
        width: 487px;
        margin-top: 15vh;
        vertical-align: top;
        padding-bottom: 0;
        .el-message-box__header {
            padding: 20px 24px 10px
        }
        .el-message-box__title {
            font-size: 18px;
            color: #303133;
            font-weight: 700;
        }
        .el-message-box__close {
            font-size: 18px;
            font-weight: 700;
            color: #677f99;
            :hover {
                color: #4285f4;
            }
        }
        .el-message-box__content {
            padding: 12px 24px 20px;
        }
        .el-message-box__btns {
            padding: 10px 24px 20px;
        }
    }
</style>

