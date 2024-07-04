<template>
    <div>
        <Spin fix v-if="isInit"></Spin>
        <!-- 自动流入公海规则 - 开关 -->
        <div class="seas-set-item">
            <div class="seas-set-item-title">
                {{$t('highSeasSetting.selfMotionRulerTitle')}}
                <el-switch v-model="highSeasRulesSwitch" @change="onRuleChange" style="margin-left:20px;"></el-switch>
            </div>
            <div>
                <Button type="primary"
                    @click="addRuler()"
                    :style="Editing?'color: rgba(110, 129, 154, 0.4);background: #E7ECF2;border-color:#E7ECF2;':''"
                    :disabled="Editing">
                    {{$t('highSeasSetting.addRuler')}}
                </Button>
            </div>
        </div>
        <!-- 自动流入公海规则 - 设置 -->
        <div class="rule_settings">
            <Row class="rule_settings_content">
                <Col :span="4" class="rule_settings_left">
                    <li v-for="(item, index) in rulerNameList"
                        :key="index"
                        @click="changeActive(item.id)"
                        :class="item.id === editId && 'active'">
                        <!-- <Tooltip
                            trigger="hover"
                            transfer
                            placement="top"
                            :content="item.ruleName"> -->
                        <span class="show_ellipsis">{{item.ruleName}}</span>
                        <!-- </Tooltip> -->
                        <span :class="item.isOpen ? '' : 'is_open'">{{ item.isOpen ? $t('highSeasSetting.ON') : $t('highSeasSetting.OFF')}}</span>
                    </li>
                </Col>
                <Col :span="20" class="rule_settings_right" v-loading="ruleTableLoading">
                    <div style="overflow: auto;height: 100%;">
                        <div class="rule_tips" v-if="rulerType !== 5">
                            <p>{{$t('highSeasSetting.ruleTips1')}}</p>
                            <p>{{$t('highSeasSetting.ruleTips2')}}</p>
                            <p>{{$t('highSeasSetting.ruleTips3')}}</p>
                            <p>{{$t('highSeasSetting.ruleTips4')}}</p>
                        </div>
                        <div class="rule_tips" v-else>
                            <p>{{$t('highSeasSetting.recaptureRuleTip')}}</p>
                            <p>{{$t('highSeasSetting.ruleTips5')}}</p>
                        </div>
                        <Form :model="ruleForm" class="high_seas_rule_form" ref="ruleForm" :rules="rules" label-position="left" label-width="100px">
                            <!-- 规则名称 -->
                            <FormItem :label="$t('highSeasSetting.formName1')" prop="ruleName">
                                <Input v-model="ruleForm.ruleName"
                                    :disabled="!Editing || rulerType === 5"
                                    style="width: 500px"
                                    clearable
                                    maxlength="40"
                                    :placeholder="$t('highSeasSetting.inquriry.pleaseWrite')">
                                </Input>
                            </FormItem>
                            <!-- 启用状态 -->
                             <FormItem :label="$t('highSeasSetting.formName2')" required>
                                <el-switch v-model="ruleForm.isOpen" :disabled="!Editing"></el-switch>
                            </FormItem>
                            <!-- 规则生效时间 -->
                            <FormItem :label="$t('highSeasSetting.effectiveTime')" prop="effectiveTime" v-show="rulerType !== 5">
                                <DatePicker
                                    :disabled="!Editing"
                                    clearable
                                    type="date"
                                    :placeholder="$t('highSeasSetting.datepickerHolder')"
                                    v-model="ruleForm.effectiveTime"
                                >
                                </DatePicker>
                            </FormItem>
                            <FormItem :label="$t('highSeasSetting.formName3')" required v-show="rulerType !== 5">
                                <div>
                                    <RadioGroup v-model="ruleForm.effectiveCustomer" @change="changeCientType" :disabled="!Editing">
                                        <Radio label="1">{{$t('highSeasSetting.formRadio1')}}</Radio>
                                        <Radio label="2">{{$t('highSeasSetting.formRadio2')}}</Radio>
                                    </RadioGroup>
                                    <div v-show="ruleForm.effectiveCustomer === '2'">
                                        <div v-for="(add, index) in addCondition" class="conditionmain" :key="index">
                                            <span style="float:left;margin-right:15px;">{{$t('highSeasSetting.formRadio2Text1')}} {{$t('highSeasSetting.formRadio2Text2')}}</span>
                                            <Select v-model="add.condition1"
                                                    style="width:150px;margin-right:15px;float:left;"
                                                    filterable
                                                    :disabled="!Editing"
                                                    @change="computed_addChangeCon1(index)">
                                                <Option v-for="item in add.conditionList1"
                                                        :value="item.field"
                                                        :label="item.fieldName"
                                                        :disabled="item.field === 'eventDate'"></Option>
                                            </Select>
                                            <span style="float: left;margin-right:15px;">{{$t('highSeasSetting.formRadio2Text3')}}</span>
                                            <Select v-model="add.condition2"
                                                    @change="computed_addChangeCon2(index)"
                                                    style="width: 150px;margin-right: 15px;float: left;"
                                                    :disabled="!Editing">
                                                <Option v-for="item in add.conditionList2" :value="item.value" :label="item.label"></Option>
                                            </Select>
                                            <div style="width: calc(100% - 430px); max-width: 220px; margin-right: 15px;">
                                                <template v-if="add.inputType === 'string'">
                                                    <Input v-model="add.condition3"
                                                        :placeholder="$t('crm.Table.tip_addKeywords')"
                                                        :disabled="!Editing"
                                                        style="width:100%;"></Input>
                                                </template>
                                                <template v-else-if="add.inputType === 'number'">
                                                    <InputNumber :min="0" :max="['starLevel', 'cpStarLevel'].includes(add.condition1) ? 5 : Infinity" v-model="add.condition3"
                                                                :placeholder="$t('crm.Table.tip_inputNumber')"
                                                                :disabled="!Editing"
                                                                style="width:100%;">
                                                    </InputNumber>
                                                </template>
                                                <template v-else-if="add.inputType === 'numberRange'">
                                                    <numberRange :condition1="add.condition1" :condition3="add.condition3" :disabled="!Editing" v-model="add.condition3"></numberRange>
                                                </template>
                                                <template v-else-if="add.inputType === 'boolean'">
                                                    <Select v-model="add.condition3"
                                                            :disabled="!Editing"
                                                            style="width:100%;">
                                                        <template v-if="['gender', 'ctGender'].includes(add.condition1)">
                                                            <Option v-for="n in 2" :value="n"
                                                                    :label="n === 1 ? $t('crm.Modal.male') : n === 2 ? $t('crm.Modal.female') : ''"></Option>
                                                        </template>
                                                        <template v-else>
                                                            <Option v-for="n in 2" :value="n" :label="n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : ''">
                                <!--                                {{ n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : '' }}-->
                                                            </Option>
                                                        </template>
                                                    </Select>
                                                </template>
                                                <template v-else-if="add.inputType === 'booleanSelect'">
                                                    <Select v-model="add.condition3"
                                                        key="booleanSelect"
                                                        :disabled="!Editing"
                                                        style="width:100%;">
                                                        <template v-if="['gender', 'ctGender'].includes(add.condition1)">
                                                            <Option v-for="n in 2" :value="n"
                                                                    :label="n === 1 ? $t('crm.Modal.male') : n === 2 ? $t('crm.Modal.female') : ''"></Option>
                                                        </template>
                                                        <template v-else>
                                                            <Option v-for="n in 2" :value="n" :label="n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : ''">
                                <!--                                {{ n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : '' }}-->
                                                            </Option>
                                                        </template>
                                                    </Select>
                                                </template>
                                                <template v-else-if="add.inputType === 'booleanMultSelect'">
                                                    <Select v-model="add.condition3"
                                                        key="booleanMultSelect"
                                                        :disabled="!Editing"
                                                        multiple
                                                        collapse-tags
                                                        style="width:100%;">
                                                        <template v-if="['gender', 'ctGender'].includes(add.condition1)">
                                                            <Option v-for="n in 2" :value="n"
                                                                    :label="n === 1 ? $t('crm.Modal.male') : n === 2 ? $t('crm.Modal.female') : ''"></Option>
                                                        </template>
                                                        <template v-else>
                                                            <Option v-for="n in 2" :value="n" :label="n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : ''">
                                <!--                                {{ n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : '' }}-->
                                                            </Option>
                                                        </template>
                                                    </Select>
                                                </template>
                                                <!-- 使用v-show避免日期选择框定位问题 -->
                                                <span v-show="add.inputType === 'dateRange'">
                                                    <DatePicker v-model="add.condition3"
                                                                type="daterange"
                                                                :disabled="!Editing"
                                                                placement="bottom-end"
                                                                :placeholder="$t('crm.Table.tip_selectTime')"
                                                                ref="dateRange"
                                                                style="width: 100%;"></DatePicker>
                                                </span>
                                                <!-- 使用v-show避免日期选择框定位问题 -->
                                                <span v-show="add.inputType === 'date'">
                                                    <DatePicker v-model="add.condition3"
                                                                type="date"
                                                                :disabled="!Editing"
                                                                placement="bottom-end"
                                                                :placeholder="$t('crm.Table.tip_selectTime')"
                                                                ref="date"
                                                                style="width: 100%;"></DatePicker>
                                                </span>
                                                <template v-if="add.inputType === 'select'">
                                                    <Select v-model="add.condition3"
                                                        key="single"
                                                        filterable
                                                        :disabled="!Editing"
                                                        class="manager-select"
                                                        style="width:100%;">
                                                        <Option v-for="item in add.conditionList3"
                                                                :value="item.key"
                                                                :label="item.value"
                                                                ></Option>
                                                    </Select>
                                                </template>
                                                <template v-else-if="add.inputType === 'array'">
                                                    <Select v-model="add.condition3"
                                                        key="multiple"
                                                        multiple
                                                        collapse-tags
                                                        filterable
                                                        style="width:100%;"
                                                        :disabled="!Editing"
                                                        class="manager-select">
                                                        <Option v-for="item in add.conditionList3"
                                                            :value="item.key"
                                                            :label="item.value"
                                                        ></Option>
                                                    </Select>
                                                </template>
                                                <template v-else-if="add.inputType === 'countryArea'">
                                                    <!-- <CountryAreaSelect :countryArea.sync="add.condition3"
                                                        :countryAreaName.sync="add.countryAreaName"
                                                        :disabled="!Editing"
                                                        ref="countryArea"
                                                        style="width: 100%;"></CountryAreaSelect> -->
                                                        <countryAreaSelect
                                                            ref="countryAreaSelect"
                                                            class="searchCountry"
                                                            :disabled="!Editing"
                                                            :placeholder="$t('highSeasSetting.pleaseChoose')"
                                                            :multiple="['$in', '$nin'].includes(add.condition2) ? true : false"
                                                            :collapseTags="['$in', '$nin'].includes(add.condition2) ? true : false"
                                                            @updateCountry="selectCountry(arguments, index)"
                                                            :country="add.condition3"
                                                        ></countryAreaSelect>
                                                </template>
                                                <template v-else-if="add.inputType === 'commonUserSelect'">
                                                    <commonUserSelect :disabled="!Editing"
                                                        :companyName="companyName"
                                                        :departmentListUsedByUser="departmentListUsedByUser"
                                                        :departmentList="departmentList"
                                                        :roleList="roleList"
                                                        :userList="userList"
                                                        :value.sync="add.condition3"
                                                        :selectStyle="{ width: '100%' }"
                                                        :collapseTags="true"
                                                        dataFormat="Object"></commonUserSelect>
                                                </template>
                                                <template v-else-if="add.inputType === 'department'">
                                                    <departmentSelect :checkdDepartments.sync="add.condition3"
                                                        :departmentsData="departmentList"
                                                        :disabled="!Editing"
                                                        multiple="true"
                                                        :collapseTags="true"
                                                        ref="departmentSelect"
                                                        style="width:100%;"></departmentSelect>
                                                </template>
                                            </div>
                                            <!-- 右侧新增/删除按钮 -->
                                            <Icon v-if="index !== 0 && Editing"
                                                size="14"
                                                color="#64758D"
                                                class="cursor-pointer"
                                                custom="custom-delete-new"
                                                @click="removeClick(index)"></Icon>
                                        </div>
                                        <p v-if="Editing"><Button type="text" class="addSpecialStaffRuleButton" @click="addClick">+ {{$t('businessAssociationSettings.addLable')}}</Button></p>
                                    </div>
                                </div>
                            </FormItem>
                            <FormItem :label="$t('highSeasSetting.formName4')" required>
                                <div>
                                    <Table :data="highSeasRuleList">
                                        <TableColumn v-for="item in tableColumns"
                                                    :key="item.key"
                                                    :width="item.width"
                                                    :prop="item.key"
                                                    :label="item.title">
                                            <template slot-scope="{row, $index}">
                                                <div v-if="item.key === 'ruleDay'">
                                                    <template v-if="rulerType !== 5">
                                                        <template v-if="row.operation === 0">
                                                            <Select :disabled="!Editing" v-model="row.ruleType" @change="changeRuleType" style="width: 150px; margin-right: 12px">
                                                                <Option v-for="(item,index) in triggerOptions" :value="item.value" :label="item.label" :key="index"></Option>
                                                            </Select>
                                                            <InputNumber :disabled="!Editing" v-model="row.ruleDay" :min="1" :max="9999" controls-position="right" style="width: 90px;margin-right:12px; margin-bottom: 5px"></InputNumber>{{$t('highSeasSetting.ruleTableText1')}}
                                                            <Select :disabled="!Editing" v-model="row.behaviorType" @change="changeBehaviorType" style="width: 150px; margin: 0 12px">
                                                                <Option v-for="(item,index) in behaviorOptions" :value="item.value" :label="item.label" :key="index"></Option>
                                                            </Select>{{$t('highSeasSetting.ruleTableText2')}}
                                                        </template>
                                                        <template v-else>
                                                            {{row.ruleTypeText}}
                                                            <InputNumber :disabled="!Editing" v-model="row.ruleDay" :min="1" :max="9999" controls-position="right" style="width: 90px;margin-right:12px;margin-bottom: 5px"></InputNumber>
                                                            {{$t('highSeasSetting.ruleTableText1')}}{{row.behaviorTypeText}},{{$t('highSeasSetting.ruleTableText2')}}
                                                        </template>
                                                    </template>
                                                    <template v-else>
                                                        {{$t('highSeasSetting.formerOwner')}}
                                                        <InputNumber :disabled="!Editing" v-model="row.ruleDay" :min="1" :max="9999" controls-position="right" style="width: 90px;margin-right:12px;margin-bottom: 5px"></InputNumber>
                                                        {{$t('highSeasSetting.robberyNotAllowed')}}
                                                    </template>
                                                </div>
                                                <div v-else-if="item.key === 'operation'">
                                                    <span v-if="row[item.key]" @click="deleteSpecialStaffRule($index)" style="cursor: pointer;color: rgba(59, 120, 222, 0.8);">{{$t('productSetting.groupSetting.deleteProduct')}}</span>
                                                    <span v-else>{{'-'}}</span>
                                                </div>
                                                <div v-else-if="item.key === 'rulePerson'">
                                                    <span v-if="row[item.key] === '-1'">{{$t('highSeasSetting.allEmployees')}}</span>
                                                    <div v-else>
                                                        <commonUserSelect :disabled="!Editing"
                                                            :companyName="companyName"
                                                            :departmentListUsedByUser="departmentListUsedByUser"
                                                            :departmentList="departmentList"
                                                            :roleList="roleList"
                                                            :userList="userList"
                                                            :value.sync="row[item.key]"
                                                            :collapseTags="true"
                                                            dataFormat="Object"></commonUserSelect>
                                                    </div>
                                                </div>
                                                <div v-else>{{ row[item.key] }}</div>
                                            </template>
                                        </TableColumn>
                                    </Table>
                                    <p v-if="Editing">
                                        <Button type="text" class="addSpecialStaffRuleButton" @click="addSpecialStaffRule">+ {{$t('highSeasSetting.addSpecialStaff')}}</Button>
                                    </p>
                                </div>
                            </FormItem>
                            <FormItem :label="$t('highSeasSetting.formName5')" v-show="rulerType !== 5">
                                <div>
                                    <el-switch v-model="ruleForm.isRemind" :disabled="!Editing" style="margin-right: 26px"></el-switch>
                                    {{$t('highSeasSetting.fallIntoHighSeasBefore')}}
                                    <InputNumber v-model="ruleForm.remindDays" :disabled="!Editing" :min="1" :max="30" controls-position="right" style="width: 90px;margin:0 12px;"></InputNumber>
                                    {{$t('highSeasSetting.remindPerson')}}
                                </div>
                            </FormItem>
                        </Form>
                    </div>
                    <div class="rule_settings_right_fotter">
                        <div v-if="Editing">
                            <Button type="primary" class="highSeas-ruler-save" @click="handleRuleSave" :loading="highSeasRuleLoading">{{$t('save')}}</Button>
                            <Button @click="handleRuleCancel">{{$t('cancel')}}</Button>
                        </div>
                        <div v-else>
                            <Button type="primary" class="highSeas-ruler-save" @click="handleRuleEdit()">{{$t('highSeasSetting.edit')}}</Button>
                            <Button @click="handleRuleEdit('copy')" v-if="rulerType !== 5">{{$t('bind.copy')}}</Button>
                            <span style="padding-left: 20px;font-size: 12px;">{{$t('highSeasSetting.lastUpDate')}} {{updateTime}}</span>
                        </div>
                        <Button type="text" style="color: #EA4335;" v-if="!Editing && rulerType !== 5" @click="delectConfirm()"> {{$t('highSeasSetting.delete')}}</Button>
                    </div>
                </Col>
            </Row>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import numberRange from '@/views/crm/Table/Components/Html/numberRange';
    import countryAreaSelect from '@/views/systemSettings/high-seas-setting/high-seas-grouping/countryAreaSelect.vue';
    import departmentSelect from '@/views/main-components/departmentSelect';
    import { TOP_FILTER_ITEM } from '@/api/config';
    import { selfMotion } from '@/api/systemSettings/high-seas-setting/index';
    import { highSeasGroup } from '@/api/systemSettings/high-seas-grouping/index';
    import commonUserSelectData from '@/views/main-components/commonUserSelect/mixin/commonUserSelectData.js';
    const { getHighSeasConfig, getRuleById, updateHighSeasConfig, saveHighSeasRuleData, calculating, delRuler } = selfMotion;
    export default {
        name: 'selfMotion',
        mixins: [commonUserSelectData],
        components: {
            numberRange,
            countryAreaSelect,
            departmentSelect
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId
            }),
            tableColumns() {
                if (this.Editing) {
                    return [
                        { key: 'ruleDay', title: this.$t('highSeasSetting.rules') },
                        {
                            key: 'rulePerson',
                            title: this.$t('highSeasSetting.applicableEmployees'),
                            width: '320'
                        },
                        {
                            key: 'operation',
                            title: this.$t('distribution.opera'),
                            width: '120'
                        }
                    ];
                }
                return [
                    { key: 'ruleDay', title: this.$t('highSeasSetting.rules') },
                    {
                        key: 'rulePerson',
                        title: this.$t('highSeasSetting.applicableEmployees'),
                        width: '320'
                    }
                ];
            }
        },
        data() {
            return {
                isInit: true,
                ruleTableLoading: false,
                cancelFunc: null,
                highSeasRuleLoading: false, // 保存具体的公海规则 loading
                ruleForm: {
                    id: undefined,
                    ruleName: '',
                    effectiveTime: new Date().getTime() + 30 * 24 * 60 * 60 * 1000,
                    isOpen: false,
                    effectiveCustomer: '1',
                    isRemind: false,
                    remindDays: 7
                },
                rules: {
                    ruleName: [
                        { required: true, message: '请输入规则名称' }
                    ],
                    effectiveTime: [
                        { required: true, message: '请选择生效时间' }
                    ]
                },
                highSeasRulesSwitch: false,
                rulerNameList: [],
                editId: null, // 选中的规则id
                rulerType: null,
                // 所有列数据
                highSeasRuleList: [], // 公海规则列表
                updateTime: null, // 当前规则的开启状态
                conditionList1: [],
                addCondition: [],
                triggerOptions: [
                    { label: this.$t('highSeasSetting.triggerOptions1'), value: 1 },
                    { label: this.$t('highSeasSetting.triggerOptions2'), value: 2 }
                ],
                behaviorOptions: [
                    { label: this.$t('highSeasSetting.behaviorOptions1'), value: 1 },
                    { label: this.$t('highSeasSetting.behaviorOptions2'), value: 2 }
                ],
                Editing: false
            };
        },
        created() {
            this.getDepartmentList();
            this.getRoleList();
            this.getUserList();
            this.getSeasGroupCondition();
        },
        mounted() {},
        methods: {
            changeRuleType(value) {
                this.highSeasRuleList = this.highSeasRuleList.map(item => {
                    item.ruleType = value;
                    item.ruleTypeText = this.$t(`highSeasSetting.triggerOptions${value}`);
                    return item;
                });
            },
            changeBehaviorType(value) {
                this.highSeasRuleList = this.highSeasRuleList.map(item => {
                    item.behaviorType = value;
                    item.behaviorTypeText = this.$t(`highSeasSetting.behaviorOptions${value}`);
                    return item;
                });
            },
            changeCientType(value) {
                if (value === '2') {
                    this.addCondition = [
                        {
                            condition1: '',
                            conditionList1: this.$deepClone(this.conditionList1),
                            condition2: '',
                            conditionList2: [],
                            condition3: '',
                            conditionList3: [],
                            inputType: 'string'
                        }
                    ];
                }
            },
            addClick() {
                if (this.addCondition.length >= 5) {
                    this.$Message(this.$t('highSeasSetting.maxDesignatedCustomers'));
                    return false;
                }
                this.addCondition.push({
                    condition1: '',
                    conditionList1: this.$deepClone(this.conditionList1),
                    condition2: '',
                    conditionList2: [],
                    condition3: '',
                    conditionList3: [],
                    inputType: 'string'
                });
            },
            removeClick(index) {
                this.addCondition.splice(index, 1);
            },
            addRuler() {
                if (this.rulerNameList.length >= 11) {
                    this.$Message(this.$t('highSeasSetting.maxHighSeasRulesTip'));
                    return false;
                }
                this.Editing = true;
                this.rulerType = null;
                this.ruleTableLoading = false;
                this.ruleForm = {
                    id: undefined,
                    ruleName: '',
                    effectiveTime: new Date().getTime() + 30 * 24 * 60 * 60 * 1000,
                    isOpen: false,
                    effectiveCustomer: '1',
                    isRemind: false,
                    remindDays: 7
                };
                this.$refs.ruleForm.resetFields();
                this.highSeasRuleList = [
                    {
                        ruleType: 1,
                        behaviorType: 1,
                        ruleTypeText: this.$t('highSeasSetting.triggerOptions1'),
                        behaviorTypeText: this.$t('highSeasSetting.behaviorOptions1'),
                        ruleDay: '14',
                        rulePerson: '-1',
                        operation: 0
                    }
                ];
            },
            handleRuleEdit(type) {
                if (type) {
                    if (this.rulerNameList.length >= 11) {
                        this.$Message(this.$t('highSeasSetting.maxHighSeasRulesTip'));
                        return false;
                    }
                    this.ruleForm.id = undefined;
                }
                this.Editing = true;
            },
            delectConfirm() {
                this.$confirm(this.$t('highSeasSetting.delHighSeasRulesTip'), this.$t('letters.deleteComfir'), {
                    confirmButtonText: this.$t('confirm'),
                    cancelButtonText: this.$t('cancel'),
                    type: 'warning'
                }).then(() => {
                    this.deleteRuler();
                }).catch(() => {
                });
            },
            deleteRuler() {
                delRuler({
                    orgId: Number(this.enterpriseId),
                    userId: Number(this.userId),
                    ruleId: this.editId
                }).then(res => {
                    if (res.code === '1') {
                        this.editId = null;
                        this.getHighSeasConfig();
                    } else {
                        this.$Message.error(res.message);
                    }
                });
            },
            // 接收子组件传给父组件 的国家地区
            selectCountry(arg, index) {
                this.addCondition[index].condition3 = arg[0];
            },
            // 指定客户 筛选
            computed_addChangeCon1(index) {
                const temp = this.conditionList1.find(item => item.field === this.addCondition[index].condition1);
                // 给选项赋值
                if (temp) {
                    this.addCondition[index].conditionList3 = temp.optionValue;
                }
                switch (this.addCondition[index].condition1) {
                    case 'countryArea':
                        this.addCondition[index].conditionList2 = [
                            ...TOP_FILTER_ITEM.settingContrySelect
                        ];
                        this.addCondition[index].condition2 = '$eq';
                        this.addCondition[index].inputType = 'countryArea';
                        this.addCondition[index].condition3 = '';
                        break;
                    case 'createUserId':
                        this.addCondition[index].conditionList2 = [
                            ...TOP_FILTER_ITEM.select
                        ];
                        this.addCondition[index].condition2 = '$eq';
                        this.addCondition[index].inputType = 'select';
                        this.addCondition[index].condition3 = [];
                        break;
                    case 'companyManagers':
                        this.addCondition[index].conditionList2 = [
                            ...TOP_FILTER_ITEM.MultSelectUser
                        ];
                        this.addCondition[index].condition2 = '$regex';
                        this.addCondition[index].inputType = 'commonUserSelect';
                        this.addCondition[index].condition3 = [];
                        break;
                    case 'departmentIds':
                        this.addCondition[index].conditionList2 = [
                            ...TOP_FILTER_ITEM.departmentSelect
                        ];
                        this.addCondition[index].condition2 = '$regex';
                        this.addCondition[index].inputType = 'department';
                        this.addCondition[index].condition3 = [];
                        break;
                    case 'starLevel':
                    case 'followUpCount':
                    case 'touchCount':
                    case 'notFollowedDays':
                    case 'transactionInquiryCount':
                    case 'transactionMoneyRmb':
                        this.addCondition[index].conditionList2 = [
                            ...TOP_FILTER_ITEM.number
                        ];
                        this.addCondition[index].condition2 = '$range';
                        this.addCondition[index].inputType = TOP_FILTER_ITEM.number[0].childrenType;
                        this.addCondition[index].condition3 = [0, 0];
                        break;
                    case 'marker':
                        this.addCondition[index].conditionList2 = [
                            ...TOP_FILTER_ITEM.boolean
                        ];
                        this.addCondition[index].condition2 = '$eq';
                        this.addCondition[index].inputType = 'booleanSelect';
                        this.addCondition[index].condition3 = 1;
                        break;
                    default:
                        if (temp) {
                            switch (temp.fieldType) {
                                case 'date':
                                case 'date+time':
                                    this.addCondition[index].conditionList2 = [
                                        ...TOP_FILTER_ITEM.dateRange
                                    ];
                                    this.addCondition[index].condition2 = '$range';
                                    this.addCondition[index].inputType = TOP_FILTER_ITEM.dateRange[0].childrenType;
                                    this.$nextTick(() => {
                                        const end = new Date();
                                        const start = new Date();
                                        end.setTime(end.getTime() - 3600 * 1000 * 24);
                                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                                        this.addCondition[index].condition3 = [start, end];
                                    });
                                    break;
                                case 'selectMultiple':
                                    this.addCondition[index].conditionList2 = [
                                        ...TOP_FILTER_ITEM.MultSelect
                                    ];
                                    this.addCondition[index].condition2 = '$regex';
                                    this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelect[0].childrenType;
                                    this.addCondition[index].condition3 = [];
                                    // this.addCondition[index].conditionList3 = temp.optionValue;
                                    break;
                                case 'select':
                                    this.addCondition[index].conditionList2 = [
                                        ...TOP_FILTER_ITEM.select
                                    ];
                                    this.addCondition[index].condition2 = '$eq';
                                    this.addCondition[index].inputType = TOP_FILTER_ITEM.select[0].childrenType;
                                    this.addCondition[index].condition3 = '';
                                    // this.addCondition[index].conditionList3 = temp.optionValue;
                                    break;
                                case 'text':
                                case 'textarea':
                                default:
                                    this.addCondition[index].conditionList2 = [
                                        ...TOP_FILTER_ITEM.text
                                    ];
                                    this.addCondition[index].condition2 = '$regex';
                                    this.addCondition[index].inputType = TOP_FILTER_ITEM.text[0].childrenType;
                                    this.addCondition[index].condition3 = '';
                            }
                        } else {
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.text.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                            this.addCondition[index].condition3 = '';
                        }
                        break;
                }
            },
            computed_addChangeCon2(index) {
                switch (this.addCondition[index].condition1) {
                    case 'countryArea':
                        this.addCondition[index].inputType = TOP_FILTER_ITEM.settingContrySelect.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                        this.addCondition[index].condition3 = '';
                        break;
                    case 'createUserId':
                    case 'companyManagers':
                    case 'departmentIds':
                        if (['$eq', '$ne'].includes(this.addCondition[index].condition2)) {
                            this.addCondition[index].inputType = 'select';
                            this.addCondition[index].condition3 = '';
                        } else if (['$in', '$nin', '$regex', '$nregex', '$andregex', '$andnregex'].includes(this.addCondition[index].condition2)) {
                            if (this.addCondition[index].condition1 === 'departmentIds') {
                                this.addCondition[index].inputType = 'department';
                            } else {
                                this.addCondition[index].inputType = 'commonUserSelect';
                            }
                            this.addCondition[index].condition3 = [];
                        } else {
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.select.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                        }
                        break;
                    case 'starLevel':
                    case 'followUpCount':
                    case 'touchCount':
                    case 'notFollowedDays':
                    case 'transactionInquiryCount':
                    case 'transactionMoneyRmb':
                        this.addCondition[index].inputType = TOP_FILTER_ITEM.number.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                        this.addCondition[index].condition3 = 0;
                        if (this.addCondition[index].inputType === 'numberRange') {
                            this.addCondition[index].condition3 = [0, 0];
                        }
                        break;
                    case 'marker':
                        this.addCondition[index].inputType = TOP_FILTER_ITEM.boolean.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                        this.addCondition[index].condition3 = 1;
                        if (this.addCondition[index].inputType === 'booleanMultSelect') {
                            this.addCondition[index].condition3 = [];
                        }
                        break;
                    default:
                        const temp = this.conditionList1.find(item => item.field === this.addCondition[index].condition1);
                        if (temp) {
                            switch (temp.fieldType) {
                                case 'date':
                                case 'date+time':
                                    this.addCondition[index].inputType = TOP_FILTER_ITEM.dateRange.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                                    if (this.addCondition[index].inputType === 'dateRange') {
                                        this.addCondition[index].condition3 = [];
                                    } else {
                                        this.addCondition[index].condition3 = '';
                                    }
                                    break;
                                case 'selectMultiple':
                                    this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelect.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                                    this.addCondition[index].condition3 = [];
                                    break;
                                case 'select':
                                    this.addCondition[index].inputType = TOP_FILTER_ITEM.select.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                                    if (this.addCondition[index].inputType === 'array') {
                                        this.addCondition[index].condition3 = [];
                                    } else {
                                        this.addCondition[index].condition3 = '';
                                    }
                                    break;
                                case 'text':
                                case 'textarea':
                                default:
                                    this.addCondition[index].inputType = TOP_FILTER_ITEM.text.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                                    this.addCondition[index].condition3 = '';
                            }
                        } else {
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.text.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                            this.addCondition[index].condition3 = '';
                        }
                        break;
                }
                if (this.addCondition[index].inputType === 'null' || this.addCondition[index].inputType === 'nnull') {
                    this.addCondition[index].condition3 = -1;
                }
            },
            // 指定客户 筛选 结束
            // 当switch关闭且id存在时需要调用更新设置接口
            onRuleChange() {
                this.updateHighSeasConfig();
            },
            // 修改通用公海规则
            updateHighSeasConfig() {
                updateHighSeasConfig({
                    orgId: Number(this.enterpriseId),
                    userId: Number(this.userId),
                    isOpen: this.highSeasRulesSwitch ? 1 : 0
                }).then((response) => {
                    if (response.code === '1') {
                        this.$Message.success(this.$t('highSeasSetting.saveSuccess'));
                    } else {
                        // 异常处理
                        this.$Message.error(this.$t('highSeasSetting.saveFailed'));
                        this.highSeasRulesSwitch = !this.highSeasRulesSwitch;
                    }
                }, () => {
                    // 异常处理
                    this.$Message.error(this.$t('highSeasSetting.saveFailed'));
                    this.highSeasRulesSwitch = !this.highSeasRulesSwitch;
                });
            },
            // 指定客户查询筛选条件
            getSeasGroupCondition() {
                highSeasGroup.seasGroupCondition({
                    conditionType: 1
                }).then(response => {
                    if (response.code === '1') {
                        this.conditionList1 = response.data;
                    }
                    this.getHighSeasConfig(true); // 获取流入公海规则配置信息
                }).catch(error => {
                    console.error(error);
                });
            },
            // 切换当前显示规则
            changeActive(id) {
                if (this.Editing) {
                    this.$confirm(this.$t('highSeasSetting.leaveTip'), this.$t('highSeasSetting.leaveConfirm'), {
                        confirmButtonText: this.$t('confirm'),
                        cancelButtonText: this.$t('cancel')
                    }).then(() => {
                        this.editId = id;
                        this.getRuleById();
                    }).catch(() => {
                    });
                    return;
                }
                this.editId = id;
                this.getRuleById();
            },
            // 保存具体规则
            handleRuleSave() {
                this.$refs.ruleForm.validate((valid) => {
                    const ruleForm = this.ruleForm;
                    if (valid) {
                        if (ruleForm.effectiveCustomer === '2') {
                            const flag = this.addCondition.every(item => item.condition1 && item.condition2 && ((item.condition3 && item.condition3.length) || item.condition3 instanceof Date || (typeof item.condition3 === 'number' && !isNaN(item.condition3))));
                            if (!flag) {
                                this.$Message.error('添加的指定客户不能为空');
                                return;
                            }
                        }
                        if (this.highSeasRuleList.some((item) => item.operation === 1 && item.rulePerson === '')) {
                            this.$Message.error(`${this.$t('highSeasSetting.pleaseSelect')}${this.$t('highSeasSetting.applicableEmployees')}`);
                            return;
                        };
                        this.highSeasRuleLoading = true;
                        const postData = {
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            id: ruleForm.id,
                            ruleName: ruleForm.ruleName,
                            isOpen: ruleForm.isOpen ? 1 : 0,
                            effectiveTime: new Date(new Date(ruleForm.effectiveTime).toLocaleDateString()).getTime(),
                            isRemind: ruleForm.isRemind ? 1 : 0,
                            remindDays: ruleForm.remindDays
                        };
                        if (ruleForm.effectiveCustomer === '1') {
                            postData.effectiveCustomer = '-1';
                        } else {
                            const effectiveCustomer = [];
                            this.addCondition.forEach(item => {
                                const condition1 = this.conditionList1.find(items => items.field === item.condition1);
                                let optValue = [];
                                const decide = item.condition2;
                                const condition = {
                                    fieldName: condition1.fieldName,
                                    fieldKey: item.condition1,
                                    selectType: condition1.fieldType
                                };
                                if (['$null', '$nnull'].includes(item.condition2)) {
                                    optValue = undefined;
                                } else {
                                    switch (item.condition1) {
                                        case 'countryArea':
                                            // optValue.push({ key: item.condition3, value: item.countryAreaName });
                                            optValue = item.condition3;
                                            break;
                                        case 'createUserId':
                                        case 'companyManagers':
                                            if (['$eq', '$ne'].includes(decide)) {
                                                const userArr = [];
                                                condition1.optionValue.forEach(items => {
                                                    if (items.key === item.condition3) {
                                                        userArr.push({
                                                            key: items.key,
                                                            value: items.value
                                                        });
                                                    }
                                                });
                                                optValue.push({
                                                    deptArr: [],
                                                    userArr: userArr,
                                                    roleArr: []
                                                });
                                            } else if (['$in', '$nin', '$regex', '$nregex', '$andregex', '$andnregex'].includes(decide)) {
                                                const deptArr = [];
                                                const userArr = [];
                                                const roleArr = [];
                                                item.condition3.forEach(condition3 => {
                                                    if (condition3.type === 'department') {
                                                        deptArr.push({
                                                            key: condition3.value,
                                                            value: condition3.label
                                                        });
                                                    }
                                                    if (condition3.type === 'role') {
                                                        roleArr.push({
                                                            key: condition3.value,
                                                            value: condition3.label
                                                        });
                                                    }
                                                    if (condition3.type === 'user') {
                                                        userArr.push({
                                                            key: Number(condition3.value),
                                                            value: condition3.label
                                                        });
                                                    }
                                                });
                                                optValue.push({
                                                    deptArr: deptArr,
                                                    userArr: userArr,
                                                    roleArr: roleArr
                                                });
                                            }
                                            break;
                                        case 'departmentIds':
                                            item.condition3.forEach(condition3 => {
                                                optValue.push({ key: condition3.value, value: condition3.label });
                                            });
                                            break;
                                        case 'starLevel':
                                        case 'followUpCount':
                                        case 'touchCount':
                                        case 'notFollowedDays':
                                        case 'transactionInquiryCount':
                                        case 'transactionMoneyRmb':
                                            if (decide === '$range') {
                                                optValue.push({ key: item.condition3[0], value: item.condition3[0] });
                                                optValue.push({ key: item.condition3[1], value: item.condition3[1] });
                                            } else {
                                                optValue.push({ key: item.condition3, value: item.condition3 });
                                            }
                                            break;
                                        case 'marker':
                                            if (['$in', '$nin'].includes(decide)) {
                                                item.condition3.forEach(items => {
                                                    optValue.push({ key: items, value: items });
                                                });
                                            } else {
                                                optValue.push({ key: item.condition3, value: item.condition3 });
                                            }
                                            break;
                                        default:
                                            if (condition1) {
                                                switch (condition1.fieldType) {
                                                    case 'date':
                                                    case 'date+time':
                                                        if (decide === '$range') {
                                                            optValue.push({ key: `${this.$options.filters.timeFormat(item.condition3[0])} 00:00:00.000`, value: `${this.$options.filters.timeFormat(item.condition3[0])} 00:00:00.000` });
                                                            optValue.push({ key: `${this.$options.filters.timeFormat(item.condition3[1])} 23:59:59.999`, value: `${this.$options.filters.timeFormat(item.condition3[1])} 23:59:59.999` });
                                                        } else {
                                                            if (decide === '$gt') {
                                                                optValue.push({ key: `${this.$options.filters.timeFormat(item.condition3)} 23:59:59.999`, value: `${this.$options.filters.timeFormat(item.condition3)} 23:59:59.999` });
                                                            } else {
                                                                optValue.push({ key: `${this.$options.filters.timeFormat(item.condition3)} 00:00:00.000`, value: `${this.$options.filters.timeFormat(item.condition3)} 00:00:00.000` });
                                                            }
                                                        }
                                                        break;
                                                    case 'selectMultiple':
                                                        condition1.optionValue.forEach(items => {
                                                            if (item.condition3.includes(items.key)) {
                                                                optValue.push({
                                                                    key: items.key,
                                                                    value: items.value
                                                                });
                                                            }
                                                        });
                                                        break;
                                                    case 'select':
                                                        if (item.inputType === 'array') {
                                                            condition1.optionValue.forEach(items => {
                                                                if (item.condition3.includes(items.key)) {
                                                                    optValue.push({
                                                                        key: items.key,
                                                                        value: items.value
                                                                    });
                                                                }
                                                            });
                                                        } else {
                                                            optValue.push({ key: item.condition3, value: item.condition3 });
                                                        }
                                                        break;
                                                    case 'text':
                                                    case 'textarea':
                                                    default:
                                                        optValue.push({ key: item.condition3, value: item.condition3 });
                                                }
                                            } else {
                                                optValue.push({ key: item.condition3, value: item.condition3 });
                                            }
                                            break;
                                    }
                                }
                                effectiveCustomer.push({
                                    condition: condition,
                                    decide: decide,
                                    optValue: optValue
                                });
                            });
                            postData.effectiveCustomer = JSON.stringify(effectiveCustomer);
                        }
                        const ruleDetailList = [];
                        this.highSeasRuleList.forEach(item => {
                            const limits = {
                                deptArr: [],
                                roleArr: [],
                                userArr: []
                            };
                            item.rulePerson !== '-1' && item.rulePerson.length && item.rulePerson.forEach(item => {
                                if (item.type === 'department') {
                                    limits.deptArr.push({ deptId: item.value, deptName: item.label });
                                } else if (item.type === 'role') {
                                    limits.roleArr.push({ roleId: item.value, roleName: item.label });
                                } else if (item.type === 'user') {
                                    limits.userArr.push({ userId: item.value, userName: item.label });
                                };
                            });
                            ruleDetailList.push({
                                triggerConditions: item.ruleType,
                                ruleDays: item.ruleDay,
                                behavior: item.behaviorType,
                                applyPerson: item.rulePerson !== '-1' ? JSON.stringify(limits) : '-1',
                                operate: item.operation
                            });
                        });
                        postData.ruleDetailList = ruleDetailList;
                        saveHighSeasRuleData(postData).then(res => {
                            if (res.code === '1') {
                                this.Editing = false;
                                this.getHighSeasConfig();
                                // this.getRuleById();
                                this.$Message.success(this.$t('highSeasSetting.saveSuccess'));
                            } else {
                                this.$Message.error(res.message);
                            }
                            this.highSeasRuleLoading = false;
                        }).catch(() => {
                            this.getRuleById();
                            this.$Message.error(this.$t('highSeasSetting.saveFailed'));
                            this.highSeasRuleLoading = false;
                        });
                    }
                });
            },
            // 添加特殊员工
            addSpecialStaffRule() {
                if (this.highSeasRuleList.length === 11) {
                    this.$Message.info(this.$t('highSeasSetting.addLimit'));
                    return;
                }
                const highSeasRuleList = this.highSeasRuleList[0];
                this.highSeasRuleList.push({
                    ...highSeasRuleList,
                    operation: 1,
                    rulePerson: ''
                });
                // 抢回规则默认是7天
                if (this.rulerType === 5) {
                    this.highSeasRuleList[this.highSeasRuleList.length - 1].ruleDay = 7;
                } else {
                    this.highSeasRuleList[this.highSeasRuleList.length - 1].ruleDay = 14;
                }
            },
            // 删除特殊员工
            deleteSpecialStaffRule(index) {
                this.highSeasRuleList.splice(index, 1);
            },
            // 规则取消
            handleRuleCancel() {
                this.$refs.ruleForm.clearValidate();
                this.getRuleById();
            },
            // 获取流入公海规则的配置信息
            getHighSeasConfig(initFlag) {
                if (initFlag) this.isInit = true;
                getHighSeasConfig({
                    orgId: this.enterpriseId,
                    userId: this.userId
                }).then((response) => {
                    this.isInit = false;
                    if (response.code === '1') {
                        this.highSeasRulesSwitch = response.data.masterSwitch === 1;
                        this.rulerNameList = response.data.ruleList;
                        if (!this.editId) {
                            this.changeActive(this.rulerNameList[0].id);
                        } else {
                            this.getRuleById();
                        }
                    } else {
                        // 异常处理
                    }
                }, () => {
                    // 异常处理
                    this.isInit = false;
                });
            },
            // 根据标识获取具体的规则信息
            getRuleById() {
                // 取消之前的表格数据请求
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }
                const vm = this;
                const cancelToken = new this.$util.axios.CancelToken(function executor(c) {
                    // An executor function receives a cancel function as a parameter
                    vm.cancelFunc = c;
                });
                this.ruleTableLoading = true;
                this.highSeasRuleList = [];
                this.addCondition = [];
                getRuleById({ ruleId: this.editId, orgId: this.enterpriseId, userId: this.userId }, cancelToken).then(res => {
                    if (res.code === '1') {
                        const rulerObj = res.data;
                        this.rulerType = rulerObj.ruleType;
                        this.updateTime = this.$options.filters.timeFormat(rulerObj.updateTime, 'DateTimeHm');
                        this.ruleForm = {
                            id: rulerObj.id,
                            ruleName: rulerObj.ruleName,
                            effectiveTime: rulerObj.ruleType === 5 ? rulerObj.createTime : rulerObj.effectiveTime,
                            isOpen: rulerObj.isOpen === 1,
                            effectiveCustomer: rulerObj.ruleType === 5 ? '1' : rulerObj.effectiveCustomer === '-1' ? '1' : '2',
                            isRemind: rulerObj.isRemind === 1,
                            remindDays: rulerObj.remindDays
                        };
                        if (rulerObj.effectiveCustomer && rulerObj.effectiveCustomer !== '-1') {
                            const effectiveCustomer = JSON.parse(rulerObj.effectiveCustomer);
                            effectiveCustomer.forEach((item, index) => {
                                this.addClick();
                                const condition1 = item.condition.fieldKey;
                                const selectType = item.condition.selectType;
                                const condition2 = item.decide;
                                let condition3 = null;
                                if (['$null', '$nnull'].includes(condition2)) {
                                    condition3 = '-1';
                                } else {
                                    condition3 = [];
                                    item.optValue.forEach(opt => {
                                        // 国家地区单独处理,国家地区不使用select使用的是单独的搜索组件
                                        if (condition1 === 'countryArea') {
                                            // condition3 = opt.key;
                                            condition3.push(opt);
                                        } else if (['createUserId', 'companyManagers'].includes(condition1)) {
                                            if (opt.deptArr && opt.deptArr.length) {
                                                opt.deptArr.forEach(deptArr => {
                                                    condition3.push({
                                                        type: 'department',
                                                        value: deptArr.key,
                                                        label: deptArr.value
                                                    });
                                                });
                                            }
                                            if (opt.roleArr && opt.roleArr.length) {
                                                opt.roleArr.forEach(roleArr => {
                                                    condition3.push({
                                                        type: 'role',
                                                        value: roleArr.key,
                                                        label: roleArr.value
                                                    });
                                                });
                                            }
                                            if (opt.userArr && opt.userArr.length) {
                                                if (['$eq', '$ne'].includes(condition2)) {
                                                    condition3 = opt.userArr[0].key;
                                                } else {
                                                    opt.userArr.forEach(userArr => {
                                                        condition3.push({
                                                            type: 'user',
                                                            value: Number(userArr.key),
                                                            label: userArr.value
                                                        });
                                                    });
                                                }
                                            }
                                        } else if (condition1 === 'departmentIds') {
                                            condition3.push({ value: opt.key, label: opt.value });
                                        } else {
                                            if (['$eq', '$ne', '$lt', '$gt', '$gte', '$lte'].includes(condition2) || ['text', 'textarea'].includes(selectType)) {
                                                condition3 = opt.key;
                                            } else {
                                                condition3.push(opt.key);
                                            }
                                        }
                                    });
                                }
                                this.addCondition[index].condition1 = condition1;
                                this.computed_addChangeCon1(index);
                                this.$nextTick(() => {
                                    this.addCondition[index].condition2 = condition2;
                                    this.computed_addChangeCon2(index);
                                    this.$nextTick(() => {
                                        this.addCondition[index].condition3 = this.$deepClone(condition3);
                                    });
                                });
                            });
                        }
                        rulerObj.ruleDetailList.forEach((item, index) => {
                            if (item.applyPerson !== '-1') {
                                const value = [];
                                const limits = JSON.parse(item.applyPerson);
                                for (const i in limits) {
                                    if (i === 'deptArr') {
                                        limits[i].forEach(item => {
                                            value.push({
                                                type: 'department',
                                                value: item.deptId,
                                                label: item.deptName
                                            });
                                        });
                                    } else if (i === 'roleArr') {
                                        limits[i].forEach(item => {
                                            value.push({
                                                type: 'role',
                                                value: item.roleId,
                                                label: item.roleName
                                            });
                                        });
                                    } else if (i === 'userArr') {
                                        limits[i].forEach(item => {
                                            value.push({
                                                type: 'user',
                                                value: item.userId,
                                                label: item.userName
                                            });
                                        });
                                    }
                                };
                                item.rulePerson = value;
                            } else {
                                item.rulePerson = '-1';
                            }
                            this.highSeasRuleList.push({
                                ruleType: item.triggerConditions,
                                behaviorType: item.behavior,
                                ruleTypeText: item.triggerConditions ? this.$t(`highSeasSetting.triggerOptions${item.triggerConditions}`) : '',
                                behaviorTypeText: item.behavior ? this.$t(`highSeasSetting.behaviorOptions${item.behavior}`) : '',
                                ruleDay: item.ruleDays,
                                rulePerson: item.rulePerson,
                                operation: index === 0 ? 0 : 1
                            });
                        });
                        this.Editing = false;
                        this.ruleTableLoading = false;
                    }
                }).catch(res => {
                    this.ruleTableLoading = false;
                });
            },
            // 触发预警提示
            warningPrompt() {
                calculating({}).then(response => {
                    if (response.code === '1') {
                        this.getHighSeasConfig();
                    }
                });
            }
        }
    };
</script>
<style lang="less" scoped>
.seas-set-item{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    .seas-set-item-title{
        margin-bottom: 0px;
        line-height: 22px;
    }
}
.rule_settings{
    .rule_settings_content{
        display: flex;
        flex-direction: row;
        border: 1px solid #E5E7EC;
        height: calc(100vh - 185px);
        min-height: 210px;
    }
    .rule_settings_left{
        border-right: 1px solid #E5E7EC;
        overflow-y: auto;

        li{
            padding: 0 20px;
            height: 38px;
            line-height: 38px;
            display: flex;
            justify-content: space-between;
            cursor: pointer;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.8);

            .show_ellipsis{
                display: inline-block;
                width: calc(100% - 34px);
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .is_open{
                color: rgba(0, 0, 0, 0.4);
            }
            &:hover{
                background: #F5F7FA;
            }
        }
        li.active{
            background: #F5F7FA;
        }
    }

    .rule_settings_right{
        flex: 1;
        position: relative;
        padding: 20px 0 60px 20px;
        overflow-x: auto;
        .rule_tips {
            margin-bottom: 20px;
            p {
                font-size: 12px;
                line-height: 18px;
                color: rgba(0, 0, 0, 0.6);
            }
        }
        .rule_settings_right_title{
            height: 32px;
            line-height: 32px;
            margin-top: 14px;
            padding: 0 20px 0 10px;
            font-size: 12px;

            span{
                margin-left: 13px;
            }

            .add_special_staff{
                background: #7B98B6;
                border-color: #7B98B6;
                float: right;
                width: 96px;
                height: 32px;
                font-size: 12px;
                padding: 0;
                text-align: center;
            }
        }
        .high_seas_rule_form{

            /deep/ .el-form-item__label{
                color: rgba(0, 0, 0, 0.8);
            }
            /deep/ .el-form-item__content {
                font-size: 12px;
            }
            /deep/ .el-input__inner {
                font-size: 12px;
            }
            /deep/ .el-form-item{
                margin-bottom: 8px;
            }

            .high_seas_rule_item_tip{
                color: rgba(0, 0, 0, 0.6);
                margin-left: 12px;
                font-size: 12px;
            }
        }
        /deep/ .commonUserSelect-select{
            width: 100%;
            margin-bottom: 3px;
        }

        /deep/ th{
            line-height: 34px;
            background: #F6F6F6;
            color: #333333;
            padding: 0;
        }
        /deep/ td{
            padding: 5px 0 0px;
            .cell {
                overflow: auto;
            }
        }
        /deep/ .el-radio__label {
            font-size: 12px;
        }
        .searchCountry {
            width: 100%;
            display: inline-block;

            /deep/ .el-select {
                width: 100%;
            }
        }
        .rule_settings_right_fotter{
            position: absolute;
            bottom: 0;
            left: 0;
            padding: 12px 20px;
            background: #fff;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .addSpecialStaffRuleButton {
            font-size: 12px;
            color: #3B78DE;
        }
        .conditionmain {
            line-height: 34px;
            font-size: 12px;
        }
    }
}

</style>
