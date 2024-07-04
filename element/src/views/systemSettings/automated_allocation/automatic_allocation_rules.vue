<template>
    <div class="automated_allocation">
        <div class="automated_allocation_header">
            <h3>
                {{ ruleId ? $t('automatedAllocation.editRuleName') : $t('automatedAllocation.addRuleName') }}
            </h3>
        </div>
        <div class="rules_set">
            <div style="text-align:center">
                <!-- 添加账号 步骤条 -->
                <Steps :active="currentStep"
                        align-center
                        finish-status="success">
                    <Step :title="$t('automatedAllocation.baseInfoSet')"></Step>
                    <Step :title="$t('automatedAllocation.executeActionSet')"></Step>
                </Steps>
            </div>
            <!-- 基础信息设置 -->
            <Form ref="rulesForm"
                v-loading="loading"
                label-position="left"
                :model="formValidate"
                :rules="ruleValidate"
                v-show="currentStep === 0"
                label-width="110px">
                <h3 style="font-weight: 550;font-size: 15px;color: #333;margin-bottom:20px;">{{ $t('automatedAllocation.baseInfo') }}</h3>

                <!-- 规则名称 -->
                <FormItem :label="$t('mailSetting.automaticAllocationRules.rulesName')" prop="ruleName">
                    <ElInputExtend v-model.trim="formValidate.ruleName"
                            :placeholder="$t('mailSetting.automaticAllocationRules.pleaseWrite')"
                            autocomplete="off"
                            maxLen="100"
                            :showWordLimit="true"
                            :errorMessage="$t('mailSetting.automaticAllocationRules.upperLimitTip')"
                            size="small"
                            class="input-400 enter-input"
                            show-word-limit>
                    </ElInputExtend>
                </FormItem>

                <h3 style="font-weight: 550;font-size: 15px;color: #333;margin-bottom:20px;">{{ $t('automatedAllocation.assignmentConditions') }}</h3>

                <!-- 触发对象 -->
                <FormItem :label="$t('automatedAllocation.whenTriggerObject')"
                        prop="triggerObjectValue">
                    <Select filterable
                        :disabled="ruleId"
                        :placeholder="$t('mailSetting.automaticAllocationRules.pleaseSelect')"
                        @change="triggerObjectChange"
                        v-model="formValidate.triggerObjectValue"
                        style="width: 100px;margin-right: 20px;"
                        size="small">
                        <Option v-for="item in basicInfoList.triggerObject"
                                :value="item.value"
                                :key="item.value"
                                :label="item.label"></Option>
                    </Select>

                    <FormItem :label="``"
                        prop="triggerConditionValue" label-width="50" style="width:232px;">
                        <Select filterable
                            :placeholder="$t('automatedAllocation.selectTrigger')"
                            v-model="formValidate.triggerConditionValue"
                            style="width:232px;"
                            size="small">
                            <Option v-for="item in basicInfoList.triggerCondition"
                                    :value="item.value"
                                    :key="item.value"
                                    :label="item.label"></Option>
                        </Select>
                    </FormItem>
                    <span style="color:#333;">时</span>
                </FormItem>
                <!-- 对象范围 -->
                <FormItem :label="$t('automatedAllocation.targetRange')"
                        prop="dataRange">
                    <Select filterable
                        multiple
                        :placeholder="$t('automatedAllocation.selectRange')"
                        v-model="formValidate.dataRange"
                        class="input-400"
                        size="small">
                        <Option v-for="item in basicInfoList.dataRange"
                                :value="item.value"
                                :key="item.value"
                                :label="item.label"></Option>
                    </Select>
                </FormItem>
                <!-- 执行条件 -->
                <FormItem :label="$t('automatedAllocation.executionConditions')"
                        v-if="this.basicInfoList.exeConditionRelation.ids"
                        class="executiononditions"
                        prop="conditionsRelation">
                    <RadioGroup v-model="formValidate.conditionsRelation" @input="radioInput">
                        <Radio label="1" v-if="this.basicInfoList.exeConditionRelation.ids.includes('1')">{{$t('automatedAllocation.unconditional')}}</Radio>
                        <Radio label="2" v-if="this.basicInfoList.exeConditionRelation.ids.includes('2')">{{$t('automatedAllocation.meetAllConditions')}}</Radio>
                        <Radio label="3" v-if="this.basicInfoList.exeConditionRelation.ids.includes('3')">{{$t('automatedAllocation.meetAnyConditions')}}</Radio>
                    </RadioGroup>
                </FormItem>
                <div v-for="(item, index) in formValidate.conditionsJson" :key="index">
                    <FormItem :label="''" style="margin-top: -28px;" v-show="formValidate.conditionsRelation == '2' || formValidate.conditionsRelation == '3'">
                        <div style="margin-top: 16px;" v-for="(self, index) in item.ruleList" :key="index">
                            <FormItem :label="``" label-width="50" style="width:160px;">
                                <Select :placeholder="$t('mailSetting.automaticAllocationRules.pleaseSelect')"
                                    v-model="self.label"
                                    @change="optionChange1(index, item.ruleList)"
                                    style="width: 160px;"
                                    size="small">
                                    <Option v-for="item in basicInfoList.exeConditionMapping"
                                            :value="item.value"
                                            :key="item.value"
                                            :label="item.label"></Option>
                                </Select>
                            </FormItem>
                            <FormItem :label="``" label-width="50" style="width:100px;">
                                <Select :placeholder="$t('mailSetting.automaticAllocationRules.pleaseSelect')"
                                    v-model="self.type"
                                    @change="optionChange2(index, item.ruleList)"
                                    size="small">
                                    <Option v-for="item in self.symbolOptions"
                                            :value="item.value"
                                            :key="item.value"
                                            :label="item.label"></Option>
                                </Select>
                            </FormItem>

                            <FormItem :label="``" label-width="50" style="width:398px;" v-if="basicInfoList.exeConditionData && basicInfoList.exeConditionData[self.label][self.type].type === 'text'">
                                <ElInputExtend v-model.trim="self.value"
                                        :placeholder="$t('mailSetting.automaticAllocationRules.pleaseWrite')"
                                        @blur="valueBlur"
                                        autocomplete="off"
                                        :maxLen="basicInfoList.exeConditionData[self.label][self.type].maximumLimit"
                                        :showWordLimit="true"
                                        :errorMessage="$t('mailSetting.automaticAllocationRules.upperLimitTip')"
                                        size="small"
                                        class="enter-input"
                                        show-word-limit>
                                </ElInputExtend>
                            </FormItem>

                            <FormItem :label="``" label-width="50" style="width:398px;" v-if="basicInfoList.exeConditionData && basicInfoList.exeConditionData[self.label][self.type].type === 'selectMultiple'">
                                <Select :placeholder="$t('mailSetting.automaticAllocationRules.pleaseSelect')"
                                    multiple
                                    v-model="self.value"
                                    @change="valueBlur"
                                    style="width:398px;;"
                                    class="enter-input"
                                    size="small">
                                    <Option v-for="item in basicInfoList.exeConditionData[self.label][self.type].options"
                                            :value="item.value"
                                            :key="item.value"
                                            :label="item.label"></Option>
                                </Select>
                            </FormItem>
                            <!-- 新增图标 -->
                            <span @click="addClick(index, item.ruleList)">
                                <Icon  size="15" class="custom custom-add-circle"
                                    style='cursor:pointer;display:inline-block;margin-left:-8px;margin-right: 12px;'></Icon>
                            </span>
                            <!-- 删除图标 -->
                            <span @click="removeClick(index, item.ruleList)" v-if="index > 0">
                                    <Icon size="15" class="custom custom-reduce-circle"
                                style='cursor:pointer;display:inline-block;'></Icon>
                            </span>
                        </div>
                        <div class="trigger_timing_tip">
                            <span v-if="item.condition_datas_tip_show">{{condition_datas_tip}}</span>
                        </div>
                    </FormItem>
                </div>
            </Form>

            <!-- 执行动作设置 -->
            <Form ref="performAction"
                label-position="left"
                :model="performAction"
                :rules="performActionValidate"
                v-show="currentStep === 1 || currentStep === 2"
                label-width="110px">
                <h3 style="font-weight: 550;font-size: 15px;color: #333;margin-bottom:20px;">{{ $t('automatedAllocation.executeAction') }}</h3>

                <!-- 执行动作 -->
                <FormItem :label="$t('automatedAllocation.performOperation')" prop="excuteOperaValue" class="excute_opera">
                    <Select filterable
                        :placeholder="$t('mailSetting.automaticAllocationRules.pleaseSelect')"
                        v-model="performAction.excuteOperaValue"
                        style="width: 100px;margin-right: 20px;"
                        size="small">
                        <Option v-for="item in performActionsList.exeOpera"
                                :value="item.value"
                                :key="item.value"
                                :label="item.label"></Option>
                    </Select>
                    <span style="display:inline-block;margin-right: 20px;color:#333;">{{ $t('automatedAllocation.toEmployeesRange') }}</span>
                    <FormItem :label="``"
                        prop="userJson" label-width="50" style="width:492px;">
                        <commonUserSelect
                            :value.sync="performAction.userJson"
                            v-if="(currentStep === 1 || currentStep === 2) && performActionsList.userRange === 'systemPresets'"
                            dataFormat="Object"
                            :departmentSelectAll="true"
                            :companyName="companyName"
                            :departmentListUsedByUser="departmentListUsedByUser"
                            :departmentList="departmentList"
                            :roleList="roleList"
                            :userList="userList"
                            @refreshTreeData="refreshTreeData"
                            :selectStyle="{width: '492px'}"></commonUserSelect>
                    </FormItem>
                </FormItem>
                <!-- 分配规则 -->
                <FormItem :label="$t('automatedAllocation.distributionRulesName')"
                        v-if="performActionsList.allocationRule.ids"
                        prop="distributionRules">
                    <RadioGroup v-model="performAction.distributionRules">
                        <Radio label="1" v-if="performActionsList.allocationRule.ids.includes('1')">{{$t('automatedAllocation.assignedPersonCharge')}}</Radio>
                        <Radio label="2" v-if="performActionsList.allocationRule.ids.includes('2')">{{$t('automatedAllocation.equallyDistributed')}}</Radio>
                        <Radio label="3" v-if="performActionsList.allocationRule.ids.includes('3')">{{$t('automatedAllocation.allSelectAssigned')}}</Radio>
                    </RadioGroup>
                    <p style="font-size: 12px;color: #999;line-height:20px;">{{ $t('automatedAllocation.distributionRulesTip') }}</p>
                </FormItem>

                <h3 style="font-weight: 550;font-size: 15px;color: #333;margin-bottom:20px;">{{ $t('automatedAllocation.specialConditions') }}</h3>

                <!-- 特殊条件 -->
                <FormItem :label="''"
                        style="margin-left:-110px;">
                    <Checkbox v-model="performAction.haveReadChecked" style="margin-right:8px;"></Checkbox>
                    <span style="display:inline-block;margin-right: 20px;color:#333;">{{$t('automatedAllocation.messageNotificationWith')}}</span>
                    <FormItem :label="''" prop="notifyType">
                        <Select filterable
                            :placeholder="$t('mailSetting.automaticAllocationRules.pleaseSelect')"
                            v-model="performAction.notifyType"
                            style="width: 100px;"
                            size="small">
                            <Option v-for="item in notifyTypes"
                                    :value="item.value"
                                    :key="item.value"
                                    :label="item.label"></Option>
                        </Select>
                    </FormItem>
                    <span style="display:inline-block;margin-right: 20px;color:#333;">{{$t('automatedAllocation.messageNotificationWithTip')}}</span>
                </FormItem>

            </Form>
        </div>
        <div class="automated_allocation_footer">
            <Button @click="quit">{{ $t('mailSetting.automaticAllocationRules.exit') }}</Button>
            <Button @click="nextStep" type="primary" v-if="currentStep === 0">{{ $t('mailSetting.automaticAllocationRules.next') }}</Button>
            <Button @click="saveRules" type="primary" v-else>{{ $t('mailSetting.automaticAllocationRules.confirm') }}</Button>
        </div>

        <!-- 退出确认 -->
        <Modal
            :visible.sync="quitVisible"
            :title="$t('automatedAllocation.exitConfirmation')"
            width="500px"
            :append-to-body="true"
            :modal-append-to-body="false"
        >
        <div style="margin-bottom: 20px;color:#333;">
            {{ $t('automatedAllocation.exitConfirmationTip') }}
        </div>
        <div slot="footer">
            <Button @click="quitVisible=false">{{ $t("cancel") }}</Button>
            <Button type="primary" @click="quitConfirm">{{ $t("confirm") }}</Button>
        </div>
        </Modal>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import commonUserSelectData from '@/views/main-components/commonUserSelect/mixin/commonUserSelectData.js';
    import commonUserSelect from '@/views/main-components/commonUserSelect/commonUserSelect.vue';
    import { mapState } from 'vuex';
    export default {
        name: 'automatic_allocation_rules',
        mixins: [commonUserSelectData],
        components: {
            commonUserSelect
        },
        props: ['triggerObjectValue', 'ruleId'],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName'
            })
        },
        data() {
            /* 通知类型校验器 */
            const valideNotifyType = (rule, value, callback) => {
                if (this.performAction.haveReadChecked && !value) {
                    callback(new Error(this.$t('automatedAllocation.notificationTypeEmpty')));
                } else {
                    callback();
                }
            };
            /* 员工范围校验器 */
            const valideUserJson = (rule, value, callback) => {
                if (!this.performAction.userJson.length) {
                    callback(new Error(this.$t('automatedAllocation.employeeRangeEmpty')));
                } else {
                    callback();
                }
            };
            return {
                loading: false,
                quitVisible: false, // 退出确认
                currentStep: 0,
                // 基础信息数据
                formValidate: {
                    ruleName: '', // 规则名称
                    triggerObjectValue: '', // 触发对象的数据
                    triggerConditionValue: '', // 触发对象名称
                    dataRange: [], // 对象范围
                    // 执行条件的提交数据结构
                    conditionsJson: [], // 条件组
                },
                // 执行动作数据
                performAction: {
                    saveUuid: '', // 下一步返回的 uuid
                    excuteOperaValue: '', // 执行操作
                    userJson: [], // 员工范围
                    distributionRules: '', // 分配规则
                    notifyType: '2', // 通知类型
                    haveReadChecked: true // 特殊条件勾选状态
                },
                // 执行动作 校验
                performActionValidate: {
                    excuteOperaValue: [
                        {
                            required: true,
                            message: this.$t('automatedAllocation.actionCannotEmpty'),
                            trigger: 'change'
                        }
                    ],
                    userJson: [
                        {
                            required: true,
                            validator: valideUserJson,
                            trigger: 'change'
                        }
                    ],
                    distributionRules: [
                        {
                            required: true,
                            message: this.$t('automatedAllocation.tickDistributionRules'),
                            trigger: 'change'
                        }
                    ],
                    notifyType: [
                        {
                            validator: valideNotifyType,
                            trigger: 'change'
                        }
                    ]
                },
                // 基础信息 校验
                ruleValidate: {
                    ruleName: [
                        {
                            required: true,
                            message: this.$t('automatedAllocation.ruleNameEmpty'),
                            trigger: 'blur'
                        }
                    ],
                    triggerObjectValue: [
                        {
                            required: true,
                            message: this.$t('automatedAllocation.triggerObjectEmpty'),
                            trigger: 'change'
                        }
                    ],
                    triggerConditionValue: [
                        {
                            required: true,
                            message: this.$t('automatedAllocation.triggerConditionEmpty'),
                            trigger: 'change'
                        }
                    ],
                    dataRange: [
                        {
                            required: true,
                            message: this.$t('automatedAllocation.objectScopeEmpty'),
                            trigger: 'change'
                        }
                    ],
                    conditionsRelation: [
                        {
                            required: true,
                            message: this.$t('automatedAllocation.tickExecutionConditions'),
                            trigger: 'change'
                        }
                    ]
                },
                // 通知类型
                notifyTypes: [
                    {
                        value: '1',
                        label: this.$t('automatedAllocation.distributionNotice')
                    },
                    {
                        value: '2',
                        label: this.$t('automatedAllocation.newMailNotification')
                    }
                ],
                // 基础信息设置
                basicInfoList: {
                    triggerObject: [], // 触发对象
                    triggerCondition: [], // 触发条件
                    dataRange: [], // 对象范围
                    exeConditionRelation: {}, // 执行条件关系
                    exeConditionMapping: [], // 执行条件 第一列下拉数据
                    exeConditionData: null // 执行条件 渲染数据
                },
                // 执行动作基础
                performActionsList: {
                    exeOpera: [], // 执行操作
                    allocationRule: {} // 分配规则
                },
                condition_datas_tip: this.$t('automatedAllocation.executionConditionEmpty')
            };
        },
        methods: {
            // 触发对象变更
            triggerObjectChange(e) {
                // 变更请求前 清空执行条件的数据  处理默认数据回填
                this.formValidate.conditionsJson = [];
                this.getTriggerObjectList();
            },
            // 增加执行条件
            addClick(index, item) {
                const symbolOptions = Object.keys(this.basicInfoList.exeConditionData[Object.keys(this.basicInfoList.exeConditionData)[0]]);
                const obj = symbolOptions.map(item => {
                    return {
                        value: item,
                        label: this.$te(`mailSetting.automaticAllocationRules.${item}`) ? this.$t(`mailSetting.automaticAllocationRules.${item}`) : item
                    };
                }); // 执行条件 第二列下拉数据
                item.splice(index + 1, 0, {
                    label: Object.keys(this.basicInfoList.exeConditionData)[0],
                    type: Object.keys(this.basicInfoList.exeConditionData[Object.keys(this.basicInfoList.exeConditionData)[0]])[0],
                    value: '',
                    symbolOptions: obj
                });
                this.$forceUpdate();
            },
            // 删除执行条件
            removeClick(index, item) {
                item.splice(index, 1);
            },
            // 触发条件校验处理
            conditionCheck() {
                this.formValidate.conditionsJson.forEach((item) => {
                    if (item.ruleList.some((self) => !self.label) || item.ruleList.some((self) => !self.value) || item.ruleList.some((self) => !self.type)) {
                        item.condition_datas_tip_show = true;
                        return false;
                    } else {
                        item.condition_datas_tip_show = false;
                    }
                });
            },
            // 执行条件 输入框触发校验
            valueBlur() {
                this.conditionCheck();
                this.$forceUpdate();
            },
            // 执行条件 第一列改变触发
            optionChange1(index, item) {
                // 执行条件 第二列下拉数据
                item.forEach((self, selfIndex) => {
                    const symbolOptions = Object.keys(this.basicInfoList.exeConditionData[item[index].label]);
                    item[index].symbolOptions = symbolOptions.map(item => {
                        return {
                            value: item,
                            label: this.$t(`mailSetting.automaticAllocationRules.${item}`)
                        };
                    });
                    // 改变第一列数据 第二列和第三列数据恢复初始
                    if (index === selfIndex) {
                        self.type = item[index].symbolOptions[0].value;
                        self.value = '';
                    }
                });
            },
            // 执行条件 第二列改变触发
            optionChange2(index, item) {
                item.forEach((self, selfIndex) => {
                    // 改变第二列数据 第三列数据恢复初始
                    if (index === selfIndex) {
                        self.value = '';
                    }
                });
            },
            // 执行条件 单选项切换
            radioInput(val) {
                this.$forceUpdate();
            },
            // 退出
            quit() {
                this.quitVisible = true;
            },
            // 退出确认
            quitConfirm() {
                this.$emit('handleView', 'tableList', this.triggerObjectValue);
            },
            // 下一步
            nextStep() {
                const name = 'rulesForm';
                this.$refs[name].validate((valid, list) => {
                    if (this.formValidate.ruleName.length > 100) {
                        return;
                    }
                    // 触发条件校验处理
                    let flag = false; // 记录是否有触发条件没有录入
                    // 无条件不校验执行条件数据是否符合 随意提交
                    if (this.formValidate.conditionsRelation === '2' || this.formValidate.conditionsRelation === '3') {
                        this.formValidate.conditionsJson.forEach((item) => {
                            if (item.ruleList.some((self) => !self.label) || item.ruleList.some((self) => !self.value || !self.value.length) || item.ruleList.some((self) => !self.type)) {
                                // 执行条件 没有数据的拦截提交
                                item.condition_datas_tip_show = true;
                                flag = true;
                                this.$forceUpdate();
                            } else if (item.ruleList.some((self) => typeof(self.value)=='string' && this.basicInfoList.exeConditionData[self.label][self.type].maximumLimit && self.value.length > this.basicInfoList.exeConditionData[self.label][self.type].maximumLimit)) {
                                // 执行条件 输入框需要字数长度超限拦截提交
                                item.condition_datas_tip_show = false;
                                flag = true;
                                this.$forceUpdate();
                            } else {
                                item.condition_datas_tip_show = false;
                            }
                        });
                    }
                    if (!valid || flag) return;
                    const dataJson = {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        triggerObjectName: this.basicInfoList.triggerObject.find(item => item.value === this.formValidate.triggerObjectValue).label,
                        triggerConditionName: this.basicInfoList.triggerCondition.find(item => item.value === this.formValidate.triggerConditionValue).label,
                        ...this.formValidate,
                        dataRange: this.formValidate.dataRange.join(';'),
                        conditionsJson: this.formValidate.conditionsRelation === '1' ? '[]' : JSON.stringify(this.formValidate.conditionsJson)
                    };
                    util.ajaxJson({
                        url: '/rule/distribution/baseSave',
                        method: 'POST',
                        data: dataJson
                    }).then(response => {
                        this.loading = false;
                        if (response.data.code === '1') {
                            this.performAction.saveUuid = response.data.data;
                            // 下一步 切换步骤
                            this.currentStep = 1;
                        }
                    });
                });
            },
            // 保存规则
            saveRules() {
                const name = 'performAction';
                this.$refs[name].validate((valid, list) => {
                    if (!valid) return;
                    const specialCnditions = { messageFlag: this.performAction.haveReadChecked ? 1 : 0, messageType: this.performAction.notifyType };
                    const distributionRules = { value: this.performAction.distributionRules };
                    let url = '';
                    let dataJson = {};
                    if (this.ruleId) {
                        // 编辑更新数据
                        url = '/rule/distribution/update';
                        dataJson = {
                            excuteOperaValue: this.performActionsList.exeOpera.find(item => item.value === this.formValidate.excuteOperaValue).label,
                            orgId: this.enterpriseId,
                            createUser: this.formValidate.createUser,
                            id: this.ruleId,
                            operateUserId: this.userId,
                            operateUserName: this.fullName,
                            triggerObjectValue: this.formValidate.triggerObjectValue,
                            excuteOperaName: this.performActionsList.exeOpera.find(item => item.value === this.performAction.excuteOperaValue).label,
                            ...this.performAction,
                            allocationRuleJson: JSON.stringify(distributionRules),
                            userJson: JSON.stringify(this.performAction.userJson),
                            specialConfigJson: JSON.stringify(specialCnditions)
                        };
                    } else {
                        // 新建保存数据
                        url = '/rule/distribution/add';
                        dataJson = {
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            createUser: this.fullName,
                            triggerObjectValue: this.formValidate.triggerObjectValue,
                            excuteOperaName: this.performActionsList.exeOpera.find(item => item.value === this.performAction.excuteOperaValue).label,
                            ...this.performAction,
                            allocationRuleJson: JSON.stringify(distributionRules),
                            userJson: JSON.stringify(this.performAction.userJson),
                            specialConfigJson: JSON.stringify(specialCnditions)
                        };
                    }
                    util.ajaxJson({
                        url,
                        method: 'POST',
                        data: dataJson
                    }).then(response => {
                        this.loading = false;
                        if (response.data.code === '2') {
                            this.$Message.error(this.$t('automatedAllocation.ruleImplementing'));
                        } else if (response.data.code === '3') {
                            this.$Message.error(this.$t('automatedAllocation.ruleSaveFailed'));
                        } else if (response.data.code === '4') {
                            this.$Message.success(this.$t('automatedAllocation.rulesSavedSuccessfully'));
                            this.$emit('handleView', 'tableList', this.triggerObjectValue);
                            this.currentStep = 2;
                        } else if (response.data.code === '7') {
                            this.$Message.error(this.$t('automatedAllocation.ruleLimit100'));
                        } else {
                            this.$Message.error(this.$t('automatedAllocation.requestFailedAgain'));
                        }
                    });
                });
            },
            // 获取新建、编辑页面的节点数据
            getTriggerObjectList() {
                this.loading = true;
                util.ajax({
                    url: '/rule/getDrawPageData',
                    method: 'GET',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        modelType: this.formValidate.triggerObjectValue // 模块类型
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const data = response.data.data;
                        // 触发对象、触发条件  赋值并补充翻译
                        const arr = ['triggerObject', 'triggerCondition'];
                        arr.forEach(item => {
                            this.basicInfoList[item] = data[item].map((item) => {
                                // 翻译补充
                                return {
                                    label: this.$te(`automatedAllocation.distributionRules.${item.value}`) ? this.$t(`automatedAllocation.distributionRules.${item.value}`) : item.label,
                                    value: item.value
                                };
                            });
                        });
                        // 执行条件第一列下拉数据 渲染下拉数据
                        this.basicInfoList.exeConditionMapping = data.exeConditionMapping.map((item) => {
                            return {
                                label: this.$te(`mailSetting.automaticAllocationRules.${item.value}`) ? this.$t(`mailSetting.automaticAllocationRules.${item.value}`) : item.label,
                                value: item.value
                            };
                        });
                        // 执行条件第三项数据条件
                        this.basicInfoList.exeConditionData = data.exeConditionData;
                        // 执行条件回填为空的时候 执行条件设置默认数据
                        if (!this.formValidate.conditionsJson.length) {
                            this.formValidate.conditionsJson = [
                                {
                                    relationship: 'or',
                                    ruleList: [
                                        {
                                            label: Object.keys(this.basicInfoList.exeConditionData)[0],
                                            type: Object.keys(this.basicInfoList.exeConditionData[Object.keys(this.basicInfoList.exeConditionData)[0]])[0],
                                            value: null,
                                            symbolOptions: [] // 执行条件 第二列下拉数据
                                        }
                                    ]
                                }
                            ]; // 条件组
                        }
                        
                        // 执行条件 第二列下拉数据
                        this.formValidate.conditionsJson[0].ruleList.forEach((item, index) => {
                            const symbolOptions = Object.keys(this.basicInfoList.exeConditionData[item.label]);
                            // 记录第二列下拉数据
                            this.formValidate.conditionsJson[0].ruleList[index].symbolOptions = symbolOptions.map(item => {
                                return {
                                    value: item,
                                    label: this.$te(`mailSetting.automaticAllocationRules.${item}`) ? this.$t(`mailSetting.automaticAllocationRules.${item}`) : item
                                };
                            });
                        });
                        // 对象范围赋值 渲染下拉数据
                        this.basicInfoList.dataRange = data.dataRange;
                        // 触发条件 回显默认数据
                        if (!this.ruleId) this.formValidate.triggerConditionValue = this.basicInfoList.triggerCondition[0].value;
                        // 执行条件的单选项 渲染下拉数据
                        this.basicInfoList.exeConditionRelation = data.exeConditionRelation;
                        // 执行条件单选项 回显默认数据
                        if (!this.ruleId) this.formValidate.conditionsRelation = this.basicInfoList.exeConditionRelation.defaultOpt;

                        // 执行动作数据 分配规则数据渲染
                        this.performActionsList.allocationRule = data.allocationRule;
                        // 执行动作设置 分配规则默认数据回填
                        if (!this.ruleId) this.performAction.distributionRules = this.performActionsList.allocationRule.defaultOpt;
                        // 执行动作设置 执行操作渲染下拉数据
                        this.performActionsList.exeOpera = data.exeOpera.map((item) => {
                            return {
                                label: this.$te(`automatedAllocation.distributionRules.${item.value}`) ? this.$t(`automatedAllocation.distributionRules.${item.value}`) : item.label,
                                value: item.value
                            };
                        });
                        // 员工范围插件
                        this.performActionsList.userRange = data.userRange;
                    }
                    this.loading = false;
                });
            },
            // 获取编辑回显数据
            findOne() {
                this.loading = true;
                util.ajax({
                    url: '/rule/distribution/findOne',
                    method: 'post',
                    data: {
                        id: this.ruleId
                    }
                }).then(response => {
                    this.loading = false;
                    if (response.data.code === '1') {
                        const data = response.data.data;
                        // 基础信息设置 数据
                        this.formValidate = {
                            ruleName: data.ruleName,
                            triggerObjectValue: data.triggerObjectValue,
                            dataRange: data.dataRange.split(';'),
                            conditionsJson: JSON.parse(data.conditionsJson),
                            triggerConditionValue: data.triggerConditionValue,
                            conditionsRelation: data.conditionsRelation,
                            excuteOperaValue: data.excuteOperaValue,
                            createUser: data.createUser
                        };
                        // 执行动作设置 数据
                        this.performAction = {
                            excuteOperaValue: data.excuteOperaValue,
                            userJson: JSON.parse(data.userJson),
                            distributionRules: JSON.parse(data.allocationRuleJson).value,
                            haveReadChecked: Boolean(JSON.parse(data.specialConfigJson).messageFlag),
                            notifyType: JSON.parse(data.specialConfigJson).messageType
                        };
                        this.ruleId && this.getTriggerObjectList();
                    }
                });
            }
        },
        created() {
            this.getDepartmentList();
            this.getRoleList();
            this.getUserList();
            // 触发对象的默认数据  列表的触发对象回填过来
            this.formValidate.triggerObjectValue = this.triggerObjectValue;

            // 获取编辑回显数据
            this.ruleId && this.findOne();
            !this.ruleId && this.getTriggerObjectList();
        },
        mounted() {
        },
        watch: {
            'performAction.userJson': {
                handler(val) {
                    // 员工范围数据发生变化 触发校验  主要解决确认选择之后 请选择的校验提示不消失
                    this.$refs.performAction.validateField('userJson');
                }
            }
        }
    };
</script>
<style lang="less" scoped>
    .automated_allocation{
        padding: 20px 30px 20px 0;
        position: relative;
        padding-bottom: 76px;

        .automated_allocation_header{
            margin-bottom: 20px;
            margin-left: 30px;
            line-height: 28px;

            h3{
                font-size: 16px;
                color: #333;
                margin-bottom: 0;
            }
        }

        .automated_allocation_footer{
            position: fixed;
            bottom: 0;
            right: 0;
            padding: 20px 40px;
            background: #fff;
            width: 100%;
            text-align: right;
            z-index: 1;

            /deep/ .el-button{
                width: 70px;
                padding: 0px;
            }
        }

        .rules_set {
            padding-left: 30px;
            text-align: left;
            overflow-y: auto;
            margin-top: 5px;

            .trigger_timing_tip{
                color: #F56C6C;
                font-size: 12px;
                height: 12px;
                line-height: 12px;
                padding-top: 4px;
                position: absolute;
            }

            .executiononditions{
                /deep/ .el-form-item__error{
                    margin-top: -10px;
                }
            }

            .excute_opera{
                /deep/ .el-form-item__content{
                    display: flex;
                    align-items: flex-start;
                }
            }

            /deep/ .el-form-item{
                margin-bottom: 20px;

                .el-form-item{
                    display: inline-block;
                    margin-right: 20px;
                    margin-bottom: 0;
                }

                .el-radio-group{
                    .el-radio__label{
                        color: #333;
                    }
                }

                .el-form-item__label{
                    line-height: 34px;
                    font-size: 14px;
                    color: #333;
                }

                .el-form-item__content{
                    line-height: 34px;
                }

                .el-input--small {
                    .el-input__inner{
                        height: 34px;
                        line-height: 34px;
                    }
                }
                .countryFlag_class{
                    .el-checkbox__label{
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        max-width: 80px;
                        position: relative;
                        top: 6px;
                    }
                }
            }

            .input-400 {
                width: 700px;
                margin-right: 12px;
            }

            /deep/ .el-input--small {
                &.enter-input{
                    .el-input__inner{
                        height: 34px;
                        line-height: 34px;
                        padding-right: 60px;
                    }
                }
            }

            /deep/ .el-steps {
                display: flex;
                justify-content: center;
                margin-bottom: 20px;

                .el-step {
                    flex-basis: 210px !important;

                    .el-step__head.is-process {
                        color: #FF752A;
                        border-color: #FF752A;

                        .el-step__icon.is-text {
                            background-color: #FF752A;

                            .el-step__icon-inner {
                                color: #FFF;
                            }
                        }
                    }

                    .el-step__head.is-success {
                        color: #FF752A;
                        border-color: #FF752A;

                        .el-step__line {
                            background-color: #FF752A;
                        }
                    }

                    .el-step__title.is-success {
                        color: #FF5F2A;
                        font-weight: 500;
                        padding-left: 66px;
                    }
                    .el-step__title.is-process {
                        color: #FF5F2A;
                        font-weight: 500;
                        padding-left: 66px;
                    }

                    .el-step__title.is-wait{
                        font-weight: 500;
                        padding-left: 66px;
                    }

                    .el-step__line {
                        margin-left: 40px;
                        margin-right: 40px!important;
                    }
                }
            }
        }
    }

</style>
