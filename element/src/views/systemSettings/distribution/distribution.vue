<template>
    <div class="service-rule-distribution">
        <h3 class="service-rule-distribution-title">{{$t('distribution.title')}}</h3>
        <!-- 系统自动分配 -->
        <div class="system-automatically-assigned">
            <h4 class="service-rule-title">{{$t('distribution.title1')}}</h4>
            <departmentUserSelect
                :checkdDepartments.sync="serviceList"
                multiple="true"
                :collapseTags="false"
                width="600"
                :treeData="treeData"
                @saveServiceList="saveServiceList"
                @removeService="removeService"></departmentUserSelect>
        </div>
        <h4 class="service-rule-title">{{$t('distribution.distributionRules')}}</h4>
        <div class="system-automatically-assigned">
            <Radio v-model="rule" @change="chooseRule1()" label="rule1">{{$t('distribution.autoAllocation')}}</Radio>
            <Radio v-model="rule" @change="chooseRule2()" label="rule2" class="rule">{{$t('distribution.customerRule')}}</Radio>
        </div>
        <!-- 自定义分配规则 -->
        <div class="custom-rules">
            <div v-show="rule === 'rule1'">
                <Row>
                    <Col :span="19" class="system-automatically-assigned-right">
                        <p style="font-size: 12px;color: rgba(0,0,0,0.40);">{{$t('distribution.operation')}}</p>
                        <h4 class="service-rule-title">
                            {{$t('distribution.RepeatCustomersFirst')}}&nbsp;&nbsp;
                            <Tooltip :content="$t('distribution.repeatCustomTip')">
                                <Icon custom="custom custom-tip" size="14"></Icon>
                            </Tooltip>
                        </h4>
                        <h4 class="service-rule-title">
                            {{$t('distribution.allocateByNumber')}}
                        </h4>
                        <div style="margin-left: 20px">
                            <div class="allocation-rule" style="margin-bottom: 20px;">
                                <p class="rule-txt">{{$t('distribution.allocationRule1')}}</p>
                                <p class="rule-txt" :style="{'padding-left': lang==='zh-CN'?'63px': '84px'}">{{$t('distribution.allocationRule2')}}</p>
                                <p class="rule-txt" :style="{'padding-left': lang==='zh-CN'?'63px': '84px'}">{{$t('distribution.allocationRule3')}}</p>
                            </div>
                            <div class="statistical-cycle" style="width:100%">
                                <Row style="width:100%">
                                    <Col :span="2" ><p class="rule-txt">{{$t('distribution.statisticalPeriod')}}</p></Col>
                                    <Col :span="22">
                                        <RadioGroup @change="changeStatisticalPeriodType" v-model="statisticalPeriodType" style="width:100%">
                                            <Radio label="系统默认统计周期" class="set-defaul-statistical-period-rule"><span class="rule-txt _lineHeight32">{{$t('distribution.customStatisticalPeriodToday')}}</span></Radio>
                                            <p class="rule-txt _lineHeight32" style="margin-bottom:5px;width:100%" :class="lang === 'zh-CN'?'':'line-breaks'">{{$t('distribution.defaultStatisticalPeriodRule')}}</p>
                                            <Radio label="自定义统计周期" class="set-custom-statistical-period-rule">
                                                <span class="rule-txt _lineHeight32">
                                                    {{$t('distribution.customStatisticalPeriodLately')}}&nbsp;
                                                    <InputNumber
                                                        size="mini"
                                                        :max="72"
                                                        :precision="0"
                                                        :min="1"
                                                        :disabled="isDefaultPeriod"
                                                        v-model="customStatisticalPeriodValue"
                                                        >
                                                    </InputNumber>
                                                    &nbsp;{{$t('distribution.hours')}}
                                                </span>
                                            </Radio>
                                            <p style="width:100%" :class="lang === 'zh-CN'?'':'line-breaks'" class="rule-txt _lineHeight32">{{$t('distribution.costomStatisticalPeriodRule1')}}<span>{{customStatisticalPeriodValue}}</span>{{$t('distribution.costomStatisticalPeriodRule2')}}</p>
                                        </RadioGroup>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
            <div class="rule-content" v-show="rule === 'rule2'">
                <div style="text-align:right;">
                    <Button type="primary" @click="addRule" icon="plus" style="width:120px;margin-bottom:8px;">{{$t('distribution.addNewRule')}}</Button>
                </div>
                <Table
                    class="noborder-table"
                    ref="dragable"
                    :data="tableData"
                    :highlight-current-row="true">
                        <template v-for="item in columnsList">
                            <TableColumn
                                v-if="!item.customSettings"
                                :key="item.key"
                                :fixed ="item.fixed"
                                :align="item.align"
                                :prop="item.key"
                                :label="item.title"
                                :width="item.width"
                                :min-width="64">
                            </TableColumn>
                            <TableColumn
                                v-else-if="item.key === 'conditionsShow'"
                                :key="item.key"
                                :label="item.title"
                                :width="item.width">
                                    <template slot-scope="scope">
                                        <p v-for="condition in JSON.parse(scope.row.conditionsShow)" :key="condition" style="margin:5px 0;textAlign:left;">{{condition}}</p>
                                    </template>
                            </TableColumn>
                            <TableColumn
                                v-else-if="item.key === 'staffNameList'"
                                :key="item.key"
                                :label="item.title"
                                :width="item.width">
                                    <template slot-scope="scope">
                                        <p v-for="staff in JSON.parse(scope.row.staffNameList)" :key="staff" style="margin:5px 0;textAlign:left;">{{staff}}</p>
                                    </template>
                            </TableColumn>
                            <TableColumn
                                v-else-if="item.key === 'useStatus'"
                                :key="item.key"
                                :label="item.title"
                                :width="item.width">
                                    <template slot-scope="scope">
                                        <el-switch
                                            v-model="scope.row.useStatus"
                                            :active-value="1"
                                            :inactive-value="2"
                                            @change="updateUseStatus(scope.row.id, scope.$index)">
                                        </el-switch>
                                    </template>
                            </TableColumn>
                            <TableColumn
                                v-else-if="item.key === 'flag'"
                                :key="item.key"
                                :label="item.title"
                                :width="item.width">
                                    <template slot-scope="scope">
                                        <i class="custom custom-drag-and-drop" style="cursor:pointer;font-size:12px"></i>
                                    </template>
                            </TableColumn>
                            <TableColumn
                                v-else-if="item.key === 'operate'"
                                :key="item.key"
                                :label="item.title"
                                :width="item.width">
                                    <template slot-scope="scope">
                                        <Button type="text" icon="custom custom-field-edit" @click="editRule(scope.row.id)" style="cursor:pointer;font-size:12px;"></Button>
                                        <Button type="text" icon="custom custom-field-delete" @click="deleteRule(scope.row, scope.$index)" style="cursor:pointer;font-size:12px;margin-left:18px;"></Button>
                                    </template>
                            </TableColumn>
                        </template>
                </Table>
                <div>
                    <p class="rule-txt">{{$t('distribution.unableToAllocate')}}</p>
                    <RadioGroup v-model="baseRule">
                        <Radio label="1"><span class="rule-txt">{{$t('distribution.serviceStaffAutomatically')}}</span></Radio>
                        <Radio label="2"><span class="rule-txt">{{$t('distribution.popMessage')}}</span></Radio>
                    </RadioGroup>
                </div>
            </div>
        </div>
        <Button type="primary" @click="saveRule()" size="small" style="width:70px;">{{$t('save')}}</Button>
        <Button style="width:70px;margin-left:20px;" size="small" @click="cancel()">{{$t('cancel')}}</Button>
        <!-- 添加新规则 -->
        <Modal
            :visible.sync="ruleModal"
            :title="$t('distribution.addNewRule')"
            width="640"
            append-to-body
            class="service-rule-distribution-add-modal">
                <div class="wrap">
                    <div class="demo-spin-container" v-if="ruleLoading">
                        <Spin fix></Spin>
                    </div>
                    <div class="rule-modal">
                        <p>{{$t('distribution.name')}}</p>
                        <div class="rule-modal-div">
                            <Input v-model="ruleName" placeholder="请输入名称" style="width:464px;"></Input>
                        </div>
                    </div>
                    <div class="rule-modal">
                        <p>{{$t('distribution.enable')}}</p>
                        <div class="rule-modal-div">
                            <!-- <i-switch v-model="modalSwitch" ></i-switch> -->
                            <el-switch
                                v-model="modalSwitch"
                                :active-value="true"
                                :inactive-value="false">
                            </el-switch>
                        </div>
                    </div>
                    <div class="rule-modal">
                        <p>{{$t('distribution.satisfy')}}</p>
                        <div class="rule-modal-div">
                            <div class="rule-modal-rule-item">
                                <Select v-model="condition" style="width:120px;">
                                    <Option :value="1" :label="$t('distribution.allRule')"></Option>
                                    <Option :value="2" :label="$t('distribution.oneRule')"></Option>
                                </Select>
                                <span style="margin-left: 20px">{{$t('distribution.ruleSetUp')}}</span>
                            </div>
                            <div class="rule-modal-rule-item">
                                <Select v-model="condition1" @change="changecon1" style="width:120px;">
                                    <Option
                                        v-for="(item, index) in conditionList"
                                        :key="index"
                                        :value="item.field"
                                        :label="item.name">
                                    </Option>
                                </Select>
                                <Select v-model="condition2" style="width:120px;margin:0 12px;">
                                    <Option
                                        :lebel="item"
                                        v-for="(item, index) in conditionList2"
                                        :key="index"
                                        :value="item">
                                    </Option>
                                </Select>
                                <Input v-model="condition3" v-if="isInput" style="width:200px;"></Input>
                                <Select v-model="condition3" multiple v-else :filterable="isCountry" style="width:200px;vertical-align: top;">
                                    <!-- 语言显示格式 -->
                                    <Option v-for="item in conditionList3" :key="item.language" :value="item.language" :label="item.name">
                                    </Option>
                                </Select>
                                <span @click="addclick()">
                                    <Icon custom="custom custom-add-circle" size="18" style='cursor:pointer;margin-left:12px;'></Icon>
                                </span>
                            </div>
                            <div class="rule-modal-rule-item" v-for="(item, index) in addConditionList" :key="index">
                                <Select v-model="item.addcondition1" @change="addchangecon1(index)" style="width:120px;">
                                    <Option
                                        v-for="item1 in item.addconditionList1"
                                        :key="item1.field"
                                        :label="item1.name"
                                        :value="item1.field">
                                    </Option>
                                </Select>
                                <Select v-model="item.addcondition2" style="width:120px;margin:0 12px;">
                                    <Option
                                        :label="item2"
                                        :key="item2"
                                        v-for="item2 in item.addconditionList2"
                                        :value="item2">
                                    </Option>
                                </Select>
                                <Input v-model="item.addcondition3" v-if="item.isInput" :placeholder="$t('distribution.addKeyword')" style="width:200px;"></Input>
                                <Select v-model="item.addcondition3" multiple v-else  :filterable="isCountry" style="width:200px;vertical-align: top;">
                                    <Option
                                        :label="item3.name"
                                        :key="item3.language"
                                        v-for="item3 in item.addconditionList3"
                                        :value="item3.language">
                                    </Option>
                                </Select>
                                <span @click="removeclick(index)">
                                    <Icon custom="custom custom-reduce-circle" size="18" style='cursor:pointer;margin-left:12px;'></Icon>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="rule-modal">
                        <p>分配给</p>
                        <div class="rule-modal-div">
                            <Select v-model="chooseServiceList" filterable multiple style="width:464px;">
                                <Option
                                    v-for="item in serviceList"
                                    :label="item.label"
                                    :key="item.accid"
                                    :value="item.accid">
                                </Option>
                            </Select>
                            <!-- <CheckboxGroup v-model="chooseServiceList" style="width:464px;">
                                <Checkbox v-for=" (item, index) in serviceList " :label="item.accId" style="width:60px" :key="index">
                                    {{item.label}}
                                </Checkbox>
                            </CheckboxGroup> -->
                        </div>
                    </div>
                </div>
                <div slot="footer">
                    <Button  @click="cancela">{{$t('cancel')}}</Button>
                    <Button type="primary" @click="oka" :loading="saveLoading">{{$t('confirm')}}</Button>
                </div>
        </Modal>
        <Modal
            :visible.sync="deleteModal"
            :title="$t('distribution.deleteRule')"
            width="400"
            :modal-append-to-body='false'
            class="modal companydata">
            <Spin size="large" fix v-if="okDelLoading"></Spin>
            <div class="wrap">
                <div class="demo-spin-container" v-if="delLoading">
                    <Spin fix></Spin>
                </div>
                <p style="text-align: center" v-loading="delLoading">{{$t('distribution.deleteConfrim')}} <span style="color: #FA8241"> {{currentName}} </span> ?</p>
            </div>
            <div slot="footer">
                <Button  @click="cancelDel">{{$t('cancel')}}</Button>
                <Button type="primary" @click="okDel" :loading="okDelLoading">{{$t('confirm')}}</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import { mapState } from 'vuex';
    import util from '@/libs/util';
    // import draggable from '../../main-components/draggable-list.vue';
    import departmentUserSelect from '@/views/main-components/departmentUserSelect.vue';
    import Sortable from 'sortablejs';
    export default {
        components: {
            // draggable,
            departmentUserSelect
        },
        name: 'distribution',
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                lang: state => state.app.lang
            })
        },
        data() {
            return {
                okDelLoading: false,
                customStatisticalPeriodValue: 8,
                statisticalPeriodType: '系统默认统计周期',
                isDefaultPeriod: true,
                isCountry: false,
                saveLoading: false, // 保存规则时loading
                deleteModal: false, // 删除框状态
                delLoading: false, // 删除框loading状态
                currentIndex: '', // 点击删除时的序号
                currentId: '', // 点击删除时的id
                currentName: '', // 点击删除时的ruleName
                serviceList: [],
                ruleName: '',
                ruleList: [], // 规则列表
                ruleListEdit: [],
                rule: 'rule1',
                isInput: false, // 添加条件，是否是input框
                ruleGroup: 0, // 选中规则
                isShowServiceList: false, // 客服列表显示隐藏
                baseRule: '0', // 选中规则2
                columnsList: [
                    {
                        title: this.$t('distribution.name'),
                        key: 'ruleName',
                        width: 200,
                        render: (h, params) => {
                            if (params.row.ruleName) {
                                if (params.row.ruleName.toString().length > 6) {
                                    return h('Tooltip', {
                                        class: 'com_name',
                                        props: {
                                            placement: 'bottom-start',
                                            content: params.row.ruleName
                                        }
                                    }, [
                                        h('span', params.row.ruleName)
                                    ]);
                                }
                                return h('span', params.row.ruleName);
                            }
                            return h('span', '');
                        }
                    },
                    {
                        title: this.$t('distribution.condition'),
                        key: 'conditionsShow',
                        customSettings: true
                    },
                    {
                        title: this.$t('distribution.allocateService'),
                        key: 'staffNameList',
                        width: 150,
                        customSettings: true
                    },
                    {
                        title: this.$t('distribution.enable'),
                        key: 'useStatus',
                        customSettings: true,
                        width: 100
                    },
                    {
                        title: this.$t('distribution.priority'),
                        key: 'flag',
                        width: 100,
                        customSettings: true
                    },
                    {
                        title: this.$t('distribution.opera'),
                        key: 'operate',
                        width: 120,
                        customSettings: true
                    }
                ],
                tableData: [],
                tempIdList: [],
                modalSwitch: true, // 提交规则时是否启用规则
                condition: '1', // 选中条件
                condition1: '', // 选中条件
                condition2: '', // 选中条件
                condition3: '', // 选中条件
                condition31: '', // 填写条件
                conditionList: [
                    {
                        name: this.$t('distribution.country'),
                        field: 'country'
                    },
                    {
                        name: this.$t('distribution.website'),
                        field: 'website'
                    },
                    {
                        name: this.$t('distribution.productPages'),
                        field: 'page'
                    },
                    {
                        name: this.$t('distribution.language'),
                        field: 'language'
                    }
                ], // 条件列表
                conditionList2: [this.$t('distribution.yes'), this.$t('distribution.no'), this.$t('distribution.contain'), this.$t('distribution.notContain')], // 逻辑列表
                conditionList3: [],
                chooseServiceList: [], // 选中客服列表
                ruleModal: false, // 添加规则框状态
                addConditionList: [], // 添加规则列表
                ruleLoading: false,
                languageList: [], // 语言列表
                country: [], // 国家列表
                statusList: [], // 规则是否启用状态
                currentRuleId: '',
                condition3Plh: [],
                treeData: [],
                sortableRef: null
            };
        },
        methods: {
            // 获取新部门数据
            getDepartmentUser() {
                this.$commonApi.getDepartmentUserTree({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    relationType: 1 // 只查直属部门
                }).then(res => {
                    if (res.code === 10000) {
                        this.treeData = this.$dym.extend(res.data, true);
                        console.log(this.treeData);
                    }
                });
            },
            // 保存客服列表
            saveServiceList(list) {
                this.serviceList = JSON.parse(JSON.stringify(list));
                util.ajaxJson({
                    url: '/visitor-chat/newTenant/server/saveList',
                    method: 'post',
                    data: {
                        enterpriseId: this.enterpriseId,
                        list: this.serviceList
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.serviceList = response.data.data.map(item => {
                            item.value = item.userId;
                            item.label = item.serviceName;
                            return item;
                        });
                        this.$Message.success(this.$t('saveSuccess'));
                    } else {
                        this.$Message.error(response.data.messageShow);
                        this.getServiceList();
                    }
                });
            },
            // 删除单个客服
            removeService(data) {
                util.ajaxJson({
                    url: '/visitor-chat/newTenant/server/saveEnterpriseService',
                    method: 'post',
                    data: {
                        enterpriseId: this.enterpriseId,
                        userId: data.userId,
                        serviceName: data.serviceName,
                        serviceEnglishName: data.serviceEnglishName,
                        accid: data.accid,
                        userType: 2
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.serviceList = this.serviceList.filter(item => item.userId !== data.userId);
                        this.$Message.success(this.$t('editSuccess'));
                    } else {
                        this.$Message.error(response.data.messageShow);
                        this.getServiceList();
                    }
                });
            },
            // ================================================================== 自定义分配规则 or 系统自动分配规则
            // 修改统计周期 -- 默认还是自定义统计
            changeStatisticalPeriodType(val) {
                if (val === '自定义统计周期') {
                    this.isDefaultPeriod = false;
                } else {
                    // 默认周期
                    this.customStatisticalPeriodValue = 8;
                    this.isDefaultPeriod = true;
                }
            },
            // 选择规则 -- 自定义分配规则 还是 系统自动分配规则
            chooseRule1() {
                this.rule = 'rule1';
                this.baseRule = '0';
            },
            chooseRule2() {
                this.rule = 'rule2';
                this.baseRule = '1';
            },
            // 取消保存规则
            cancel() {
                this.getServiceType();
                this.getData();
            },
            // 保存分配规则
            saveRule() {
                let type1 = 1;
                if (this.rule === 'rule2') { // 如果是自定义分配
                    type1 = 2;
                    if (this.tableData.length === 0) {
                        this.$Message.warning(this.$t('distribution.ruleEmpty'));
                        return;
                    }
                } else if (this.rule === 'rule1' && !this.isDefaultPeriod) {
                    if (!this.customStatisticalPeriodValue) {
                        this.$Message.warning(this.$t('distribution.costomStatisticalPeriodEmpty'));
                        return;
                    }
                }
                util.ajax({
                    url: '/rule/customer/saveServiceType',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        serviceType: type1,
                        customFailOperate: parseInt(this.baseRule),
                        statisticalCycle: this.isDefaultPeriod ? 24 : this.customStatisticalPeriodValue, // 统计周期
                        isDefaultCycle: this.isDefaultPeriod ? 1 : 2 // 是否是默认统计周期
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$Message.success(this.$t('saveSuccess'));
                    } else {
                        this.$Message.success(this.$t('saveFail'));
                    }
                }).catch(error => {
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.success(this.$t('saveFail'));
                    }
                });
            },
            // ==================================================================== 自定义分配规则的一些方法
            /* 自定义分配规则列表 */
            // 编辑规则
            editRule(id) {
                this.ruleModal = true;
                this.currentRuleId = id;
                util.ajax({
                    url: '/rule/customer/get',
                    method: 'post',
                    data: {
                        ruleId: id
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const list = response.data.data;
                        this.ruleName = list.ruleName;
                        this.condition = list.ruleOperator;
                        this.ruleListEdit = JSON.parse(list.conditionList);
                        this.condition1 = this.ruleListEdit[0].condition1;
                        this.changecon1();
                        this.condition2 = this.ruleListEdit[0].condition2;
                        this.condition3 = this.ruleListEdit[0].condition3;
                        if (typeof (this.condition3) === 'string') {
                            this.condition3 = this.condition3.trim();
                        }
                        // 不知道之前为什么要用这个属性，搜了一下应该没啥用，先留着。后续可删
                        this.condition3Plh = this.ruleListEdit[0].condition3;
                        this.chooseServiceList = JSON.parse(list.staffList);
                        this.modalSwitch = list.useStatus == 1;
                        this.addConditionList = [];
                        for (let i = 1; i < this.ruleListEdit.length; i++) {
                            this.addConditionList.push({
                                addcondition1: this.ruleListEdit[i].condition1,
                                addconditionList1: [
                                    {
                                        name: this.$t('distribution.country'),
                                        field: 'country'
                                    },
                                    {
                                        name: this.$t('distribution.website'),
                                        field: 'website'
                                    },
                                    {
                                        name: this.$t('distribution.productPages'),
                                        field: 'page'
                                    },
                                    {
                                        name: this.$t('distribution.language'),
                                        field: 'language'
                                    }
                                ],
                                addcondition2: this.ruleListEdit[i].condition2,
                                addconditionList2: [this.$t('distribution.yes'), this.$t('distribution.no'), this.$t('distribution.contain'), this.$t('distribution.notContain')],
                                addcondition3Plh: typeof (this.ruleListEdit[i].condition3) === 'string' ? this.ruleListEdit[i].condition3.trim() : this.ruleListEdit[i].condition3,
                                addcondition3: typeof (this.ruleListEdit[i].condition3) === 'string' ? this.ruleListEdit[i].condition3.trim() : this.ruleListEdit[i].condition3,
                                addconditionList3: []
                            });
                            this.addchangecon1(i - 1);
                        }
                    }
                });
            },
            // 点击删除按钮 -- 弹出删除模态框
            deleteRule(row, index) {
                this.deleteModal = true;
                this.currentIndex = index;
                this.currentId = row.id;
                this.currentName = row.ruleName;
            },
            // 删除模态框 -- 取消删除
            cancelDel() {
                this.deleteModal = false;
                this.currentIndex = '';
                this.currentId = '';
            },
            // 删除模态框 -- 确认删除
            okDel() {
                this.okDelLoading = true;
                util.ajax({
                    url: '/rule/customer/delete',
                    method: 'post',
                    data: {
                        ruleId: this.currentId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$Message.success(this.$t('deleteSuccess'));
                        this.tableData.splice(this.currentIndex, 1);
                    } else {
                        this.$Message.error(this.$t('deleteFaild'));
                    }
                    this.deleteModal = false;
                    this.$nextTick(() => {
                        this.okDelLoading = false;
                    });
                }).catch(error => {
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error(this.$t('editFail'));
                    }
                    this.deleteModal = false;
                    this.$nextTick(() => {
                        this.okDelLoading = false;
                    });
                });
            },
            // 启用或禁用该条自定义规则
            updateUseStatus(id, flag) {
                const status = this.statusList[flag] == 1 ? 2 : 1;
                util.ajax({
                    url: '/rule/customer/updateUseStatus',
                    method: 'post',
                    data: {
                        id: id,
                        useStatus: status
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        if (status === 1) {
                            this.statusList.splice(flag, 1, 1);
                            this.$Message.success(this.$t('distribution.enableSuccess'));
                        } else {
                            this.statusList.splice(flag, 1, 2);
                            this.$Message.success(this.$t('distribution.stopSucces'));
                        }
                    } else {
                        if (status === 1) {
                            this.$Message.error(this.$t('distribution.enableFail'));
                        } else {
                            this.$Message.error(this.$t('distribution.stopFail'));
                        }
                    }
                }).catch(error => {
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        if (status === 1) {
                            this.$Message.error(this.$t('distribution.enableFail'));
                        } else {
                            this.$Message.error(this.$t('distribution.stopFail'));
                        }
                    }
                });
            },

            /* 添加新规则 */
            // 点击添加新规则按钮 -- 置空模态框数据，显示模态框
            addRule() {
                this.ruleModal = true;
                this.ruleName = '';
                this.condition = 1;
                this.addConditionList = [];
                this.condition1 = '';
                this.condition2 = '';
                this.condition3 = '';
                this.ruleList = [];
                this.nameList = [];
                this.chooseServiceList = [];
                this.modalSwitch = true;
                this.currentRuleId = '';
                this.condition3Plh = '';
            },
            /* 新规则模态框的数据及一些操作 */
            getCondition(item) {
                // 定义一个空变量
                let con = '';
                switch (item) {
                    case 'country':
                        con = this.$t('distribution.country');
                        break;
                    case 'website':
                        con = this.$t('distribution.website');
                        break;
                    case 'page':
                        con = this.$t('distribution.productPages');
                        break;
                    case 'language':
                        con = this.$t('distribution.language');
                        break;
                }
                return con;
            },
            // 获取客服姓名
            getStaffName(item) {
                // 定义一个空变量
                let StaffName = '';
                for (let i = 0; i < this.serviceList.length; i++) {
                    if (item === this.serviceList[i].accid) {
                        StaffName = this.serviceList[i].serviceName;
                        break;
                    }
                }
                return StaffName;
            },
            // 添加新规则条件
            addclick() {
                this.addConditionList.push({
                    addcondition1: '',
                    addconditionList1: [
                        {
                            name: this.$t('distribution.country'),
                            field: 'country'
                        },
                        {
                            name: this.$t('distribution.website'),
                            field: 'website'
                        },
                        {
                            name: this.$t('distribution.productPages'),
                            field: 'page'
                        },
                        {
                            name: this.$t('distribution.language'),
                            field: 'language'
                        }
                    ],
                    addcondition2: '',
                    addconditionList2: [this.$t('distribution.yes'), this.$t('distribution.no'), this.$t('distribution.contain'), this.$t('distribution.notContain')],
                    addcondition3Plh: null,
                    addcondition3: '',
                    addconditionList3: [],
                    isInput: false
                });
            },
            changecon1() {
                switch (this.condition1) {
                    case 'country':
                        this.isInput = false;
                        this.condition3 = [];
                        this.conditionList3 = this.country;
                        this.isCountry = true;
                        break;
                    case 'language':
                        this.isInput = false;
                        this.condition3 = [];
                        this.conditionList3 = this.languageList;
                        this.isCountry = false;
                        break;
                    case 'website':
                        this.condition3 = '';
                        this.isCountry = false;
                        this.isInput = true;
                        break;
                    case 'page':
                        this.condition3 = '';
                        this.isCountry = false;
                        this.isInput = true;
                        break;
                    default:
                        break;
                }
            },
            addchangecon1(index) {
                switch (this.addConditionList[index].addcondition1) {
                    case 'country':
                        this.addConditionList[index].addcondition3 = [];
                        this.addConditionList[index].addconditionList3 = this.country;
                        this.addConditionList[index].isInput = false;
                        break;
                    case 'language':
                        this.addConditionList[index].addcondition3 = [];
                        this.addConditionList[index].addconditionList3 = this.languageList;
                        this.addConditionList[index].isInput = false;
                        break;
                    case 'website':
                        this.addConditionList[index].isInput = true;
                        this.addConditionList[index].addcondition3 = '';
                        break;
                    case 'page':
                        this.addConditionList[index].isInput = true;
                        this.addConditionList[index].addcondition3 = '';
                        break;
                    default:
                        break;
                }
                if (this.addConditionList[index].addcondition3Plh) {
                    this.addConditionList[index].addcondition3 = this.addConditionList[index].addcondition3Plh;
                    this.addConditionList[index].addcondition3Plh = null;
                }
            },
            // 去掉某条件
            removeclick(index) {
                this.addConditionList.splice(index, 1);
            },
            // 确定添加新规则
            oka() {
                let flag = false;
                const searchData = {};
                const and1 = [];
                const or1 = [];
                const conList = [];
                if (this.ruleName === '') {
                    this.$Message.info(this.$t('distribution.ruleName'));
                    return;
                }
                // 判断是否能进行筛选，需满足条件：无空属性，无重复检索类型
                if (this.condition1 !== '' && this.condition2 !== '' && this.condition3 !== '') { // 如果最基本的三属性都不为空
                    flag = this.addConditionList.every(item => {
                        if (item.addcondition1 !== '' && item.addcondition2 !== '' && item.addcondition3 !== '' && item !== '') {
                            return true;
                        }
                    });// 那么检测是否 addcondition 所有属性都不为空
                    if (!flag) {
                        this.$Message.info(this.$t('distribution.ruleNotEmpty'));
                        return;
                    }
                } else { // 基本三属性有空则提示不能为空
                    this.$Message.info(this.$t('distribution.ruleNotEmpty'));
                    return;
                }
                if (this.chooseServiceList.length == 0) {
                    this.$Message.info(this.$t('distribution.selectService'));
                    return;
                }

                if (flag) { // 可筛选
                    let searchCon = this.condition1; // 检索类型

                    // 否则在 query 中填入格式数据

                    const ConditionStr = this.condition == 1 ? this.$t('distribution.satisfyAllConditions') : this.$t('distribution.satisfyOneConditions');
                    conList.push(ConditionStr);
                    const con = this.getCondition(searchCon);
                    // 拼装文字描述的规则
                    let str = con + this.condition2;
                    if (typeof (this.condition3) === 'string') {
                        str += this.condition3.trim();
                        this.ruleList.push({
                            condition1: this.condition1,
                            condition2: this.condition2,
                            condition3: this.condition3.trim()
                        });
                    } else {
                        str += this.condition3.join('、');
                        this.ruleList.push({
                            condition1: this.condition1,
                            condition2: this.condition2,
                            condition3: this.condition3
                        });
                    }
                    conList.push(str);

                    if (searchCon == 'country' || searchCon == 'language') {
                        const $and = [];
                        const $or = [];
                        for (const item of this.condition3) {
                            const tempObj = {}; // 暂存对象
                            tempObj[searchCon] = {};
                            switch (this.condition2) {
                                case this.$t('distribution.contain'):
                                    tempObj[searchCon].$ma = item;
                                    $or.push(tempObj); // 填入发送数据

                                    break;
                                case this.$t('distribution.yes'):
                                    tempObj[searchCon].$eq = item;
                                    $or.push(tempObj); // 填入发送数据
                                    break;
                                case this.$t('distribution.no'):
                                    tempObj[searchCon].$ne = item;
                                    $and.push(tempObj); // 填入发送数据
                                    break;
                                case this.$t('distribution.notContain'):
                                    tempObj[searchCon].$nm = item;
                                    $and.push(tempObj); // 填入发送数据
                                    break;
                            } // 格式化数据
                        }
                        if ($and.length != 0) {
                            if (this.condition == 1) {
                                and1.push({ $and });
                                searchData.$and = and1;
                            } else {
                                or1.push({ $and });
                                searchData.$or = or1;
                            }
                        }
                        if ($or.length != 0) {
                            if (this.condition == 1) {
                                and1.push({ $or });
                                searchData.$and = and1;
                            } else {
                                or1.push({ $or });
                                searchData.$or = or1;
                            }
                        }
                    } else {
                        const tempObj = {}; // 暂存对象
                        tempObj[searchCon] = {};
                        const $and = [];
                        const $or = [];
                        switch (this.condition2) {
                            case this.$t('distribution.contain'):
                                tempObj[searchCon].$ma = this.condition3.trim();
                                $or.push(tempObj); // 填入发送数据
                                break;
                            case this.$t('distribution.yes'):
                                tempObj[searchCon].$eq = this.condition3.trim();
                                $or.push(tempObj); // 填入发送数据
                                break;
                            case this.$t('distribution.no'):
                                tempObj[searchCon].$ne = this.condition3.trim();
                                $and.push(tempObj); // 填入发送数据
                                break;
                            case this.$t('distribution.notContain'):
                                tempObj[searchCon].$nm = this.condition3.trim();
                                $and.push(tempObj); // 填入发送数据
                                break;
                        } // 格式化数据
                        if ($and.length != 0) {
                            if (this.condition == 1) {
                                and1.push({ $and });
                                searchData.$and = and1;
                            } else {
                                or1.push({ $and });
                                searchData.$or = or1;
                            }
                        }
                        if ($or.length !== 0) {
                            if (this.condition == 1) {
                                and1.push({ $or });
                                searchData.$and = and1;
                            } else {
                                or1.push({ $or });
                                searchData.$or = or1;
                            }
                        }
                    }

                    for (const item of this.addConditionList) { // 遍历附加筛选条件
                        searchCon = item.addcondition1;
                        const con2 = this.getCondition(searchCon);
                        let str2 = con2 + item.addcondition2;
                        if (typeof (item.addcondition3) === 'string') {
                            str2 += item.addcondition3.trim();
                            this.ruleList.push({
                                condition1: item.addcondition1,
                                condition2: item.addcondition2,
                                condition3: item.addcondition3.trim()
                            });
                        } else {
                            str2 += item.addcondition3.join('、');
                            this.ruleList.push({
                                condition1: item.addcondition1,
                                condition2: item.addcondition2,
                                condition3: item.addcondition3
                            });
                        }
                        conList.push(str2);
                        if (searchCon == 'country' || searchCon == 'language') {
                            const $and = [];
                            const $or = [];
                            for (const item1 of item.addcondition3) {
                                const tempObj = {}; // 暂存对象
                                tempObj[searchCon] = {};

                                switch (item.addcondition2) {
                                    case this.$t('distribution.contain'):
                                        tempObj[searchCon].$ma = item1;
                                        $or.push(tempObj); // 填入发送数据
                                        break;
                                    case this.$t('distribution.yes'):
                                        tempObj[searchCon].$eq = item1;
                                        $or.push(tempObj); // 填入发送数据
                                        break;
                                    case this.$t('distribution.no'):
                                        tempObj[searchCon].$ne = item1;
                                        $and.push(tempObj); // 填入发送数据
                                        break;
                                    case this.$t('distribution.notContain'):
                                        tempObj[searchCon].$nm = item1;
                                        $and.push(tempObj); // 填入发送数据
                                        break;
                                }// 格式化数据
                            }
                            if ($and.length != 0) {
                                if (this.condition == 1) {
                                    and1.push({ $and });
                                    searchData.$and = and1;
                                } else {
                                    or1.push({ $and });
                                    searchData.$or = or1;
                                }
                            }
                            if ($or.length != 0) {
                                if (this.condition == 1) {
                                    and1.push({ $or });
                                    searchData.$and = and1;
                                } else {
                                    or1.push({ $or });
                                    searchData.$or = or1;
                                }
                            }
                        } else {
                            const tempObj = {}; // 暂存对象
                            tempObj[searchCon] = {};
                            const $and = [];
                            const $or = [];
                            switch (item.addcondition2) {
                                case this.$t('distribution.contain'):
                                    tempObj[searchCon].$ma = item.addcondition3.trim();
                                    $or.push(tempObj); // 填入发送数据
                                    break;
                                case this.$t('distribution.yes'):
                                    tempObj[searchCon].$eq = item.addcondition3.trim();
                                    $or.push(tempObj); // 填入发送数据
                                    break;
                                case this.$t('distribution.no'):
                                    tempObj[searchCon].$ne = item.addcondition3.trim();
                                    $and.push(tempObj); // 填入发送数据
                                    break;
                                case this.$t('distribution.notContain'):
                                    tempObj[searchCon].$nm = item.addcondition3.trim();
                                    $and.push(tempObj); // 填入发送数据
                                    break;
                            }// 格式化数据
                            if ($and.length != 0) {
                                if (this.condition == 1) {
                                    and1.push({ $and });
                                    searchData.$and = and1;
                                } else {
                                    or1.push({ $and });
                                    searchData.$or = or1;
                                }
                            }
                            if ($or.length != 0) {
                                if (this.condition == 1) {
                                    and1.push({ $or });
                                    searchData.$and = and1;
                                } else {
                                    or1.push({ $or });
                                    searchData.$or = or1;
                                }
                            }
                        }
                    }
                    const nameList = [];
                    for (let i = 0; i < this.chooseServiceList.length; i++) {
                        nameList.push(this.getStaffName(this.chooseServiceList[i]));
                    }
                    let useStatus = 2;
                    if (this.modalSwitch) {
                        useStatus = 1;
                    }
                    this.saveLoading = true;
                    this.saveNewRule(useStatus, conList, nameList, searchData);
                }
                this.condition = 1;
                this.ruleName = '';
                this.condition1 = '';
                this.condition2 = '';
                this.condition3 = '';
                this.addConditionList = [];
            },
            // 保存新的自定义规则 -- 接口
            saveNewRule(useStatus, conList, nameList, searchData) {
                util.ajax({
                    url: '/rule/customer/save',
                    method: 'post',
                    data: {
                        id: this.currentRuleId,
                        orgId: this.enterpriseId,
                        ruleName: this.ruleName,
                        useStatus: useStatus,
                        ruleOperator: this.condition,
                        conditionsShow: JSON.stringify(conList),
                        staffNameList: JSON.stringify(nameList),
                        conditionsJson: JSON.stringify(searchData),
                        staffList: JSON.stringify(this.chooseServiceList),
                        conditionList: JSON.stringify(this.ruleList)
                    }
                }).then(response => {
                    this.saveLoading = false;
                    if (response.data.code === '1') {
                        this.$Message.success(this.$t('distribution.ruleSaveSuccess'));
                        this.ruleModal = false;
                        this.getData();
                        this.cancela();
                    } else {
                        this.$Message.error(this.$t('distribution.ruleSavefalid'));
                    }
                }).catch(error => {
                    this.saveLoading = false;
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error(this.$t('distribution.ruleSavefalid'));
                    }
                });
            },
            // 取消添加新规则 -- 置空模态框数据，隐藏模态框
            cancela() {
                this.ruleModal = false;
                this.ruleName = '';
                this.condition = 1;
                this.addConditionList = [];
                this.condition1 = '';
                this.condition2 = '';
                if (this.isInput) {
                    this.condition3 = '';
                } else {
                    this.condition3 = [];
                }
                this.ruleList = [];
                this.nameList = [];
                this.chooseServiceList = [];
                this.currentRuleId = '';
                this.modalSwitch = true;
            },

            /*  获取数据 */
            // 获取国家列表
            getCountry() {
                util.ajaxInternational({
                    url: '/visitor-chat/server/getAllCountry',
                    method: 'post'
                }).then(response => {
                    if (response.data.code === '1') {
                        const list = response.data.data;
                        if (list) {
                            for (let i = 0; i < list.length; i++) {
                                const obj = {
                                    language: list[i],
                                    name: list[i]
                                };
                                this.country.push(obj);
                            }
                        }
                    }
                });
            },
            // 获取语言
            getLanguage() {
                util.ajaxInternational({
                    url: '/translation/languages',
                    method: 'post'
                }).then(response => {
                    this.languageList = response.data.data.languages;
                });
            },
            // 获取客服列表
            getServiceList() {
                const postData = {
                    enterpriseId: this.enterpriseId
                };
                this.$commonApi.getServerList(postData).then(response => {
                    if (response.code === '1') {
                        this.serviceList = response.data.map(item => {
                            item.value = item.userId;
                            item.label = item.serviceName;
                            return item;
                        });
                    }
                });
            },
            // 获取自定义规则列表
            getData() {
                this.statusList = [];
                util.ajax({
                    url: '/rule/customer/getListByOrgId',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code == 1) {
                        this.tableData = response.data.data;
                        const list = response.data.data;
                        for (let i = 0; i < list.length; i++) {
                            this.statusList.push(list[i].useStatus);
                        }
                        this.$nextTick(() => {
                            // const el = document.querySelectorAll('.custom-drag-and-drop');
                            const el = this.$refs.dragable.$el.children[2].children[0].children[1];
                            const vm = this;
                            this.sortableRef = Sortable.create(el, {
                                onStart: vm.startFunc,
                                onEnd: vm.endFunc,
                                handle: '.custom-drag-and-drop'
                            });
                        });
                    }
                });
            },
            // 获取规则
            getServiceType() {
                util.ajax({
                    url: '/rule/customer/getServiceType',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        if (response.data.data.serviceType === 1) {
                            this.rule = 'rule1';
                            if (response.data.data.isDefaultCycle === 2) {
                                // 自定义周期
                                this.customStatisticalPeriodValue = response.data.data.statisticalCycle;
                                this.isDefaultPeriod = false;
                                this.statisticalPeriodType = '自定义统计周期';
                            } else {
                                // 默认周期
                                this.isDefaultPeriod = true;
                                this.statisticalPeriodType = '系统默认统计周期';
                            }
                        } else {
                            this.rule = 'rule2';
                            this.baseRule = String(response.data.data.customFailOperate);
                        }
                    }
                });
            },

            startFunc(e) {
                // this.$emit('on-start', e.oldIndex);
            },
            endFunc(e) {
                const oldIndex = e.oldIndex;
                const newIndex = e.newIndex;
                const length = this.tableData.length;

                this.tableData.splice(newIndex, 0, this.tableData.splice(oldIndex, 1)[0]);
                // that.questionData.splice(evt.newIndex, 0, that.questionData.splice(evt.oldIndex, 1)[0])
                const temp = this.$deepClone(this.tableData);
                this.tableData = [];
                this.$nextTick(() => {
                    this.tableData = temp;
                    this.tempIdList = this.tableData.map(item => {
                        return item.id;
                    });
                    const strId = this.tempIdList.join(',');
                    util.ajax({
                        url: '/rule/customer/updateRuleOrder',
                        method: 'post',
                        data: {
                            ruleIds: strId
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.$Message.success('排序成功');
                        }
                    });
                });
            }
        },
        created() {
            this.getDepartmentUser();
            this.getServiceType();
            this.getData();
            this.getServiceList();
            this.getLanguage();
            this.getCountry();
        },
        beforeDestroy() {
            if (this.sortableRef) {
                this.sortableRef.destroy();
            }
        }
    };
</script>
<style lang="less">
.service-rule-distribution{
    color: #303133;
    padding: 20px 24px;
    &-title {
        font-size: 16px;
        margin-bottom: 20px;
    }
    .service-rule-title {
        font-size: 14px;
        margin-bottom: 12px;
    }
    .system-automatically-assigned{
        margin-bottom: 20px;
        &-left{
            display: inline-block;
        }
        &-right{
            display: inline-block;
            // margin-left: 80px;
            vertical-align: top;
        }
        &-title{
            font-size: 12px;
            color: rgba(0,0,0,0.80);
            font-weight: 700;
        }
    }
    .custom-rules{
        margin-bottom: 40px;
    }
    .rule-txt{
        font-size: 12px;
        color: rgba(0, 0, 0, 0.8);
    }
    .service-list{
        width: 140px;
        border: 1px solid #EAEAEA;
        border-radius: 4px;
    }

    .line-breaks {
        word-break : keep-all
    }
}
    .service-rule-distribution-add-modal{
        font-size: 12px;
        color: rgba(0,0,0,0.80);
        .el-dialog {
            width: 680px;
        }
        .rule-modal{
            margin-bottom: 20px;
            p{
                font-size: 12px;
                color: rgba(0,0,0,0.80);
                display: inline-block;
                width: 65px;
                text-align: left;
                margin-right: 20px;
                vertical-align: top;
                line-height: 34px;
            }
            &-div{
                display: inline-block;
            }
            &-rule-item{
                margin-bottom: 12px;
            }
        }
    }

    .rule-modal-div {
        .el-checkbox__label {
            font-size: 12px;
            width: 59px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: middle
        }
    }
</style>
