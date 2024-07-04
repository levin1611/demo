<template>
    <div>
        <Modal :visible="visible"
            :title="!detail ? $t('crm.followUpPlan.newFollowUpPlan') :  $t('crm.followUpPlan.editFollowUpPlan')"
            width="960px"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            :append-to-body="true"
            :show-close="true"
            @close="handleClose()"
            class="field-modal">
            <Row :gutter="40" v-loading="loading">
                <Col span="12">
                    <p class="planInfoTip">{{$t('crm.followUpPlan.planInfo')}}</p>
                     <Form label-width="120px"
                        :model="ruleForm"
                        :rules="rules"
                        ref="ruleForm"
                        label-position="right"
                        class="followUpPlanForm">
                        <FormItem :label="$t('crm.followUpPlan.planName')" prop="followupPlanName">
                             <Input v-model="ruleForm.followupPlanName"
                                maxlength="100"
                                :placeholder="$t('crm.followUpPlan.planNamePlaceolder')">
                            </Input>
                        </FormItem>
                        <FormItem :label="$t('crm.followUpPlan.startDate')" prop="startDate">
                            <DatePicker v-model="ruleForm.startDate"
                                :disabled="detail"
                                style="width: 100%"
                                type="daterange"
                                range-separator="-"
                                :start-placeholder="$t('crm.followUpPlan.planStartDate')"
                                :end-placeholder="$t('crm.followUpPlan.planEndDate')"
                                :default-time="['00:00:00', '23:59:59']">
                            </DatePicker>
                        </FormItem>
                        <FormItem :label="$t('crm.followUpPlan.executor')" required prop="operatorId">
                            <Select v-model="ruleForm.operatorId" filterable :disabled="detail" placement="top">
                                <Option v-for="(item,index) in userList" :value="item.userId" :label="item.fullname" :key="index"></Option>
                            </Select>
                        </FormItem>
                        <FormItem :label="$t('crm.followUpPlan.planContent')">
                            <Input type="textarea"
                                v-model="ruleForm.followupPlanContent"
                                ref="followUpTextArea"
                                :rows="8"
                                :placeholder="$t('crm.UniSet.pleaseEnter')"
                                show-word-limit
                                maxlength="2000">
                            </Input>
                        </FormItem>
                    </Form>
                </Col>
                <Col span="12">
                    <p class="planInfoTip">
                        <span>{{$t('crm.followUpRecord.associatedCustomers')}}</span>
                        <Button type="text"
                            v-if="!detail"
                            class="addCustomers"
                            @click="select_company_modal = true">
                            {{$t('crm.followUpPlan.addCustomers')}}
                        </Button>
                    </p>
                    <div class="associated-customers">
                        <p class="customers-list" v-for="(item, index) in checkedCompany" :key="index">
                            <Input readonly v-model="item.companyName" :disabled="detail"></Input>
                            <Icon size="12" custom="custom-delete-new" v-if="!detail" @click="remove(index)"></Icon>
                        </p>
                    </div>
                </Col>
            </Row>
            <div slot="footer">
                <Button @click="handleClose">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button type="primary"
                    size="large"
                    :disabled="submitFollowDisabled"
                    @click="ok">{{ !detail ? $t('crm.Html.submit') : $t('crm.Modal.modal_save')}}</Button>
            </div>
        </Modal>
        <selectCompanys
            v-if="!detail"
            :visible.sync="select_company_modal"
            :selectedCustomers="checkedCompany"
            :selectedCustomersIds="checkedCompanyIds"
            @handleCompany="handleCompany"
            ></selectCompanys>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import selectCompanys from '@/views/crm/Table/Components/Modal/followUpPlan/selectCompanys';
    import { crmFollowupPlan } from '@/api/crm/index';

    export default {
        name: 'followUpPlanModal',
        components: {
            selectCompanys
        },
        props: [
            'visible',
            'detail',
            'userList'
        ],
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                followupType: state => state.crm.followUpType
            })
        },
        data() {
            const checkFollowupPlanName = (rule, value, callback) => {
                if (!value.trim()) {
                    callback(new Error(this.$t('crm.followUpPlan.planNamePlaceolder')));
                } else {
                    callback();
                }
            };
            return {
                loading: false,
                ruleForm: {
                    followupPlanName: '',
                    startDate: [],
                    operatorId: this.userId,
                    followupPlanContent: ''
                },
                rules: {
                    followupPlanName: [
                        { required: true, message: this.$t('crm.followUpPlan.planNamePlaceolder'), trigger: 'blur' },
                        { validator: checkFollowupPlanName, trigger: 'blur' }
                    ],
                    startDate: [
                        { required: true, message: this.$t('crm.followUpPlan.startDatePlaceolder'), trigger: 'blur' }
                    ]
                },
                checkedCompanyIds: [],
                checkedCompany: [],
                saveing: false,
                select_company_modal: false,
                submitFollowDisabled: false
            };
        },
        methods: {
            getCheckedCompany() {
                crmFollowupPlan.planDetailCustomer({
                    orgId: this.orgId,
                    createUserId: this.userId,
                    id: this.detail.followupPlanId
                }).then(res => {
                    if (res.code === '1') {
                        this.checkedCompany = res.data.list;
                    }
                    this.loading = false;
                });
            },
            handleClose() {
                this.$emit('update:visible', false);
            },
            handleCompany(item, ids) {
                this.checkedCompanyIds = this.$deepClone(ids);
                this.checkedCompany = this.$deepClone(item);
            },
            remove(index) {
                this.checkedCompanyIds.splice(index, 1);
                this.checkedCompany.splice(index, 1);
            },
            ok() {
                if (this.saveing) return;
                this.$refs.ruleForm.validate((valid) => {
                    if (valid) {
                        if (!this.detail && this.checkedCompanyIds.length === 0) {
                            this.$Message.error(this.$t('crm.followUpRecord.tips_selectCompany'));
                            return;
                        }
                        this.saveing = true;
                        if (this.detail) {
                            crmFollowupPlan.editPlan({
                                id: this.detail.followupPlanId,
                                followupPlanName: this.ruleForm.followupPlanName.trim(),
                                followupPlanContent: this.ruleForm.followupPlanContent,
                                updateUserId: Number(this.userId),
                                orgId: this.orgId
                            }).then(res => {
                                this.saveing = false;
                                if (res.code === '1') {
                                    // 弹出成功提示语
                                    this.$Message.success(this.$t('crm.followUpPlan.editPlanSuccess'));
                                    this.$emit('refresh');
                                    this.handleClose();
                                } else {
                                    this.$Message.error(this.$t('crm.followUpPlan.editPlanError'));
                                }
                            });
                        } else {
                            const startTime = this.$options.filters.timeFormat(new Date(this.ruleForm.startDate[0]));
                            const endTime = this.$options.filters.timeFormat(new Date(this.ruleForm.startDate[1]));
                            crmFollowupPlan.savePlan({
                                followupPlanName: this.ruleForm.followupPlanName.trim(),
                                followupPlanStartTime: startTime,
                                followupPlanEndTime: endTime,
                                operatorIds: this.ruleForm.operatorId,
                                followupPlanContent: this.ruleForm.followupPlanContent,
                                customersIds: this.checkedCompanyIds.join(','),
                                createUserId: Number(this.userId),
                                orgId: this.orgId
                            }).then(res => {
                                this.saveing = false;
                                if (res.code === '1') {
                                    // 弹出成功提示语
                                    this.$Message.success(this.$t('crm.followUpPlan.addPlanSuccess'));
                                    this.$emit('refresh');
                                    this.handleClose();
                                } else {
                                    this.$Message.error(this.$t('crm.followUpPlan.addPlanError'));
                                }
                            });
                        }
                    }
                });
            }
        },
        mounted() {
        },
        beforeDestroy() {
        },
        watch: {
            detail: {
                handler(val) {
                    if (val) {
                        this.loading = true;
                        this.ruleForm = {
                            followupPlanName: val.followupPlanName,
                            startDate: [val.followupPlanStartTime, val.followupPlanEndTime],
                            operatorId: val.operatorId,
                            followupPlanContent: val.followupPlanContent
                        };
                        this.getCheckedCompany();
                    } else {
                        const nowDate = new Date();
                        this.$set(this.ruleForm, 'operatorId', Number(this.userId));
                        this.$set(this.ruleForm, 'followupPlanName', `${this.fullName}的跟进计划`);
                        this.$set(this.ruleForm, 'startDate', [nowDate, nowDate]);
                    }
                },
                immediate: true
            }
        }
    };
</script>


<style lang="less" scoped>
    .el-input{
        font-size: 12px;
    }
    .el-select {
        width: 100%;
        font-size: 12px;
        /deep/.el-input{
            font-size: 12px;
        }
    }
    .planInfoTip {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        font-size: 15px;
        line-height: 26px;
        color: rgba(0, 0, 0, 0.8);
    }
    .followUpPlanForm {
        .el-form-item {
            margin-bottom: 20px;
            /deep/.el-form-item__label {
                line-height: 34px;
            }
            /deep/.el-form-item__content {
                line-height: 34px;
            }
        }
    }
    .addCustomers {
        font-size:14px;
        color: #3B78DE;
        &:hover {
            color: #2d63bc
        }
    }
    .associated-customers {
        max-height: 344px;
        overflow-y: auto;
        .customers-list {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            line-height: 36px;
            .el-input {
                width: 90%;
            }
            i {
                padding-right: 10px;
            }
        }
    }
</style>
