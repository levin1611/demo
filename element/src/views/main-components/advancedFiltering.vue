<template>
    <div class="advanced-filtering">
        <div class="filter-type-box advanced-filtering-top" v-if="from !== 'email'">
            <Menu mode="horizontal" :default-active="sourceType" @select="sourceTypeChange" style="white-space:nowrap;margin-bottom:8px;">
                <template v-for="(item, index) in radioList">
                    <MenuItem :index="item.value" :key="index">{{item.label}}</MenuItem>
                </template>
            </Menu>
            <!-- <RadioGroup v-model="sourceType" @input="sourceTypeChange">
                <Radio v-for="(item, index) in radioList"
                        :key="index"
                        :label="item.value">{{ item.label }}</Radio>
            </RadioGroup> -->
        </div>
        <div class="filter-list" :class="`filter-list-${from}`">
            <div class="filter-type-box" v-if="!['whatsapp', 'colleague', 'addressbook'].includes(sourceType)">
                <RadioGroup v-model="filterType" @input="filterTypeChange">
                    <Radio v-for="(item, index) in filterTypeList"
                            :key="index"
                            :label="item.value">{{ item.label }}</Radio>
                </RadioGroup>
            </div>
            <template v-if="!['colleague', 'addressbook'].includes(sourceType)">
                <template v-if="filterType !== 0 || sourceType === 'whatsapp'">
                    <div v-for="(add, index) in addCondition" class="conditionmain" :key="index">
                        <span class="el-select" style="width: 30px;">{{index+1}}</span>
                        <Select v-model="add.condition1"
                                style="width:165px;"
                                filterable
                                :disabled="add.disabled"
                                @change="addChangeCon1(index)">
                            <Option v-for="item in add.conditionList1"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"></Option>
                        </Select>

                        <Select v-model="add.condition2"
                                @change="addChangeCon2(index)"
                                style="width:165px;"
                                :disabled="add.disabled">
                            <Option v-for="item in add.conditionList2" :key="item.value" :value="item.value" :label="item.label"></Option>
                        </Select>

                        <div style="width: 208px;">
                            <template v-if="add.inputType === 'string'">
                                <Input v-model="add.condition3"
                                    :placeholder="$t('crm.Table.tip_addKeywords')"
                                    :disabled="add.disabled"
                                    style="width:200px;margin-right:5px;"></Input>
                            </template>
                            <template v-else-if="add.inputType === 'number'">
                                <InputNumber :min="0" :max="['starLevel', 'cpStarLevel'].includes(add.condition1) ? 5 : Infinity" v-model="add.condition3"
                                            :precision="add.variable.precision"
                                            :controls="add.variable.controls"
                                            :placeholder="$t('crm.Table.tip_inputNumber')"
                                            :disabled="add.disabled"
                                            style="width:200px;margin-right:5px;">
                                </InputNumber>
                            </template>
                            <template v-else-if="add.inputType === 'null' || add.inputType === 'nnull'">
                                <Input v-model="add.condition3"
                                    :disabled="add.disabled"
                                    style="width:200px;margin-right:5px;display:none"></Input>
                            </template>
                            <template v-else-if="add.inputType === 'numberRange'">
                                <numberRange :precision="add.variable.precision" :controls="add.variable.controls" :condition1="add.condition1" :condition3="add.condition3" :disabled="add.disabled" v-model="add.condition3"></numberRange>
                            </template>
                            <template v-else-if="add.inputType === 'boolean'">
                                <Select v-model="add.condition3"
                                    :disabled="add.disabled"
                                        style="width:200px;margin-right:5px;">
                                    <Option v-for="n in 2" :value="n-1" :label="n === 1 ? $t('crm.Table.con_not') : n === 2 ? $t('crm.Table.con_is') : ''">
                                    </Option>
                                </Select>
                            </template>
                            <template v-else-if="add.inputType === 'booleanSelect'">
                                <Select v-model="add.condition3"
                                    key="booleanSelect"
                                    :disabled="add.disabled" style="width:200px;margin-right:5px;">
                                        <Option v-for="n in 2" :value="n-1" :label="n === 1 ? $t('crm.Table.con_not') : n === 2 ? $t('crm.Table.con_is') : ''">
                                        </Option>
                                </Select>
                            </template>
                            <template v-else-if="add.inputType === 'booleanMultSelect'">
                                <Select v-model="add.condition3"
                                    key="booleanMultSelect"
                                    :disabled="add.disabled"
                                    multiple style="width:200px;margin-right:5px;">
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
                            <span v-else-if="add.inputType === 'dateRange'">
                                <DatePicker v-model="add.condition3"
                                            type="daterange"
                                            :disabled="add.disabled"
                                            placement="bottom-end"
                                            :placeholder="$t('crm.Table.tip_selectDate')"
                                            ref="dateRange"
                                            format="yyyy-MM-dd"
                                            value-format="yyyy-MM-dd"
                                            style="width: 200px;margin-right:5px;"></DatePicker>
                            </span>
                            <!-- 使用v-show避免日期选择框定位问题 -->
                            <span v-else-if="add.inputType === 'date'">
                                <DatePicker v-model="add.condition3"
                                            type="date"
                                            :disabled="add.disabled"
                                            placement="bottom-end"
                                            :placeholder="$t('crm.Html.tip_selectDate')"
                                            ref="date"
                                            format="yyyy-MM-dd"
                                            value-format="yyyy-MM-dd"
                                            style="width: 200px;margin-right:5px;"></DatePicker>
                            </span>
                            <span v-else-if="add.inputType === 'dateTime'">
                                <DatePicker v-model="add.condition3"
                                            type="datetime"
                                            :disabled="add.disabled"
                                            placement="bottom-end"
                                            :placeholder="$t('crm.Table.tip_selectTime')"
                                            ref="dateTime"
                                            format="yyyy-MM-dd HH:mm:ss"
                                            value-format="yyyy-MM-dd HH:mm:ss"
                                            style="width: 200px;margin-right:5px;"></DatePicker>
                            </span>
                            <span v-else-if="add.inputType === 'dateTimeRange'">
                                <DatePicker v-model="add.condition3"
                                            type="datetimerange"
                                            :disabled="add.disabled"
                                            placement="bottom-end"
                                            :placeholder="$t('crm.Table.tip_selectTime')"
                                            ref="dateRange"
                                            format="yyyy-MM-dd HH:mm:ss"
                                            value-format="yyyy-MM-dd HH:mm:ss"
                                            style="width: 200px;margin-right:5px;"></DatePicker>
                            </span>
                            <template v-else-if="add.inputType === 'searchSelect'">
                                <Select v-model="add.condition3"
                                    key="single"
                                    filterable
                                    remote
                                    reserve-keyword
                                    :remote-method="(query) => { remoteMethod(query,add) }"
                                    :loading="loading"
                                    :disabled="add.disabled"
                                    style="width:200px;">
                                    <Option v-for="item in add.conditionList3"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        ></Option>
                                </Select>
                            </template>
                            <template v-else-if="add.inputType === 'select'">
                                <Select v-model="add.condition3"
                                    key="single"
                                    filterable
                                    :disabled="add.disabled"
                                    style="width:200px;">
                                    <Option v-for="item in add.conditionList3"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        ></Option>
                                </Select>
                            </template>
                            <template v-else-if="add.inputType === 'array'">
                                <Select v-model="add.condition3" multiple
                                        key="multiple"
                                        filterable
                                        collapse-tags
                                        style="width:200px;"
                                        :disabled="add.disabled"
                                        class="manager-select">
                                    <Option v-for="item in add.conditionList3"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    ></Option>
                                </Select>
                            </template>
                            <template v-else-if="add.inputType === 'countryArea'">
                                <CountryAreaSelect :countryArea.sync="add.condition3"
                                                :disabled="add.disabled"
                                                ref="countryArea"
                                                style="display: block;width: 200px;margin-right: 5px;"></CountryAreaSelect>
                            </template>
                            <template v-else-if="add.inputType === 'department'">
                                <departmentUserSelect :checkdDepartments="add.condition3"
                                    :treeData="departmentsData"
                                    :disabled="add.disabled"
                                    :multiple="false"
                                    ref="departmentSelect"
                                    style="display: block;width: 200px;margin-right: 5px;"
                                    @saveServiceList="(data) => savedimDepart(data, index)"></departmentUserSelect>
                            </template>
                             <template v-else-if="add.inputType === 'userSelect'">
                                <departmentUserSelect
                                    :checkdDepartments="add.condition3"
                                    :multiple="true"
                                    :collapseTags="false"
                                    from="department"
                                    :treeData="treeData"
                                    :placeholder="$t('systemNotice.addRule.tip_selectUser')"
                                    style="display: block;width: 200px;margin-right: 5px;"
                                    @saveServiceList="(data) => savedimDepart(data, index)"></departmentUserSelect>
                            </template>
                        </div>
                        <template v-if="!add.disabled">
                            <span @click="removeClick(index)">
                                    <Icon size="24" class="custom custom-minus-cirlce" style='cursor:pointer;display:inline-block;color: #EA4335'></Icon>
                            </span>
                        </template>
                    </div>
                    <div class="_f _a_c _j_b">
                        <span @click="addClick" style="color: #3b78de;font-size: 14px;cursor:pointer;">
                            <Icon size="20" class="custom custom-add1"></Icon>
                            添加条件
                        </span>
                    </div>
                    <div style="margin-top: 12px;" v-if="filterType === 3">
                        <Input
                            v-model="expression"
                            class="senior-condition"
                            :clearable="false"
                            style="width: 590px;margin-right: 18px">
                            <span slot="suffix" style="padding: 0 20px;font-size: 12px; line-height: 32px; color: #3B78DE;"  @click="expression = ''">重置条件</span>
                        </Input>
                        <Tooltip
                            placement="bottom"
                            trigger="hover"
                            width="250px"
                            effect="dark"
                            popper-class="customSelectPop"
                        >
                            <div style="padding: 10px; font-size: 14px;" slot="content">
                                请按照如下规则编辑条件组合：<br />
                                <span style="color:#24A353;">(1 and 2) or (3 and 4)<i style="float: right" class="custom custom-queren"></i></span><br />
                                1.有 and 和 or，必须要有括号<br />
                                <span style="color:red;">1 and 2 or 3 and 4　<i style="float: right" class="custom custom-shanchu"></i></span><br />
                                2.一个括号不能同时出现 and 和 or<br />
                                <span style="color:red;">(1 and 2 or 3) and 4　<i style="float: right" class="custom custom-shanchu"></i></span><br />
                                3.不允许出现不存在的编号<br />
                                <span style="color:red;">1 and 2 and 3 and 4 and 5　<i style="float: right" class="custom custom-shanchu"></i></span><br />
                                4.括号都是成对出现的<br />
                                <span style="color:red;">(1 and 2 or 3 and 4<i style="float: right" class="custom custom-shanchu"></i></span><br />
                                5.不允许出现中文输入字符<br />
                                <span style="color:red;">。？！，、；：“” ‘’　　<i style="float: right" class="custom custom-shanchu"></i></span>
                                <span style="color:red;">（）《》〈〉【】『』「」<i style="float: right" class="custom custom-shanchu"></i></span>
                                <span style="color:red;">﹄﹃〔〕…－～﹏￥　 <i style="float: right" class="custom custom-shanchu"></i></span>
                            </div>
                            <span class="custom custom-Tips" style="font-size: 14px"></span>
                        </Tooltip>
                    </div>
                </template>
            </template>
            <template v-else>
                <Form label-width="60px" label-position="left" :model="contactsFormForShow" class="contacts-form">
                    <Row :gutter="0" style="margin: 0;">
                        <Col :span="12">
                            <FormItem :label="$t('mail.writeLetter.addContactModal.name')">
                                <Input :disabled="filtering" v-model="contactsFormForShow.name"
                                    :placeholder="$t('mail.writeLetter.addContactModal.enterKeywordTip')">
                                </Input>
                            </FormItem>
                        </Col>
                        <Col :span="12">
                            <FormItem :label="$t('mail.writeLetter.addContactModal.email')">
                                <Input :disabled="filtering" v-model="contactsFormForShow.email"
                                    :placeholder="$t('mail.writeLetter.addContactModal.enterKeywordTip')">
                                </Input>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row :gutter="0" style="margin: 0;" v-if="sourceType === 'addressbook'">
                        <Col :span="12">
                            <FormItem :label="$t('mail.writeLetter.addContactModal.group')">
                                <Select v-model="contactsFormForShow.group" :disabled="filtering" clearable style="width: 100%">
                                    <Option :key="index" v-for="(item, index) in groupList" :value="item.id" :label="item.groupName">
                                    </Option>
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row :gutter="0" style="margin: 0;" v-if="sourceType === 'colleague'">
                        <Col :span="12">
                            <FormItem label="成员">
                                <departmentUserSelect
                                    :checkdDepartments="contactsFormForShow.userIds"
                                    :multiple="true"
                                    :collapseTags="false"
                                    width="100%"
                                    from="department"
                                    :placeholder="$t('systemNotice.addRule.tip_selectUser')"
                                    :treeData="treeData"
                                    @saveServiceList="saveServiceList"></departmentUserSelect>
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
            </template>
            <div style="margin-top: 12px; text-align: right;" v-if="needButton">
                <Button @click="handleClear">{{$t('filter_box.empty')}}</Button>
                <Button type="primary" @click="handleConfirm" :loading="saveLoading">{{$t('mail.writeLetter.addContactModal.filter')}}</Button>
            </div>
        </div>
    </div>
</template>
<script>
    import { mapState } from 'vuex';
    import filterData from '@/mixins/filterData.js';
    import numberRange from '@/views/crm/Table/Components/Html/numberRange';
    import departmentUserSelect from '@/views/main-components/departmentUserSelect.vue';
    export default {
        name: 'advancedFiltering',
        mixins: [filterData],
        props: {
            from: {
                type: String,
                default: ''
            },
            needButton: {
                type: Boolean,
                default: false
            },
            filterParams: {
                default:() => {}
            }
        },
        components: {
            numberRange,
            departmentUserSelect
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId
            }),
            radioList() {
                if (this.from === 'whatsapp') {
                    return [
                        { label: '会话', value: 'whatsapp' },
                        { label: '触点联系人', value: 'touchPointContact' },
                        { label: '联系人', value: 'contact' },
                        { label: '线索', value: 'lead' },
                        { label: '客户', value: 'customer' },
                        { label: '商机', value: 'opportunity' }
                    ];
                } else if (this.from === 'email') {
                    return [
                        { label: '触点联系人', value: 'touchPointContact' },
                        { label: '联系人', value: 'contact' },
                        { label: '线索', value: 'lead' },
                        { label: '客户', value: 'customer' },
                        { label: '商机', value: 'opportunity' },
                        { label: '企业同事', value: 'colleague' },
                        { label: '个人通讯录', value: 'addressbook' }
                    ];
                }
                return [
                    { label: '会话', value: 'whatsapp' },
                    { label: '触点联系人', value: 'touchPointContact' },
                    { label: '联系人', value: 'contact' },
                    { label: '线索', value: 'lead' },
                    { label: '客户', value: 'customer' },
                    { label: '商机', value: 'opportunity' },
                    { label: '企业同事', value: 'colleague' },
                    { label: '个人通讯录', value: 'addressbook' }
                ];
            },
            filterTypeList() {
                if (this.from === 'whatsapp') {
                    return [
                        { value: 1, label: '满足所有条件（AND）' }
                        // { value: 2, label: '满足任意条件（OR）' }
                    ];
                } else {
                    return [
                        { value: 1, label: '满足所有条件（AND）' },
                        { value: 2, label: '满足任意条件（OR）' }
                    ];
                }
            }
        },
        data() {
            return {
                whatsappConditionList3Data: {
                    leadscloudStatus: [
                        { label: this.$t('mail.untreatedDocumented'), value: 0 },
                        { label: this.$t('mail.clue'), value: 1 },
                        { label: this.$t('mail.contact'), value: 2 },
                        { label: this.$t('mail.customer'), value: 3 }
                        // { label: this.$t('mail.other_leads'), value: 4 },
                        // { label: this.$t('mail.myContact'), value: 5 },
                        // { label: this.$t('mail.otherContact'), value: 6 },
                        // { label: this.$t('mail.my_customers'), value: 7 },
                        // { label: this.$t('mail.public_customers'), value: 8 },
                        // { label: this.$t('mail.other_customers'), value: 9 }
                    ],
                    whatsappIsRead: [
                        { label: this.$t('whatsapp_manage.unread'), value: 2 },
                        { label: this.$t('whatsapp_manage.read'), value: 1 }
                    ],
                    whatsappShield: [
                        { label: this.$t('whatsapp_manage.showShielded'), value: 1 }
                    ]
                },
                whatsappFieldList: [
                    { label: this.$t('whatsapp_manage.searchKeyword'), value: 'queryKeyWords', dataType: 'queryKeyWords' },
                    { label: this.$t('whatsapp_manage.Updated'), value: 'whatsappDate', dataType: 'whatsappDate' },
                    { label: this.$t('whatsapp_manage.countryOfNumber'), value: 'countryOfNumber', dataType: 'countryOfNumber' },
                    { label: this.$t('whatsapp_manage.fileStatus'), value: 'leadscloudStatus', dataType: 'whatsapp' },
                    { label: this.$t('whatsapp_manage.readingStatus'), value: 'whatsappIsRead', dataType: 'whatsapp' },
                    { label: this.$t('whatsapp_manage.shieldingStatus'), value: 'whatsappShield', dataType: 'whatsapp' }
                ],
                // filterTypeList: [
                //     // { value: 0, label: '不限' },
                //     { value: 1, label: '满足所有条件（AND）' },
                //     { value: 2, label: '满足任意条件（OR）' },
                //     // { value: 3, label: '高级公式' }
                // ],
                treeData: [],
                departmentsData: [],
                sourceType: '',
                filterType: 1,
                expression: '',
                groupList: [],
                addCondition: [],
                conditionList1: [],
                conditionList2: [],
                conditionList3: [],
                contactsFormForShow: {
                    name: '',
                    email: '',
                    group: '',
                    userIds: []
                },
                precision: 0,
                controls: true,
                saveLoading: false,
                cancelFunc: null,
                loading: false
            };
        },
        methods: {
            /** 获取所有分组列表 */
            getGroupList() {
                this.groupList.push({
                    id: 0,
                    groupName: '未分组'
                });
                this.$util.ajaxMail({
                    url: '/mail/addresscontactgroup/all',
                    method: 'get',
                    params: {
                        createUserId: this.userId
                    }
                }).then(response => {
                    if (response.data.code === 1) {
                        this.groupList = this.groupList.concat(response.data.data);
                    } else {
                        this.$Message.error(response.data.msg);
                    }
                });
            },
            // 获取新部门数据
            getDepartmentUser() {
                this.$commonApi.getDepartmentUserTree({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    relationType: 1 // 只查直属部门
                }).then(res => {
                    if (res.code === 10000) {
                        this.treeData = this.$dym.extend(res.data, true);
                        this.departmentsData = this.$dym.extend(res.data, false);
                    }
                });
            },
            async sourceTypeChange(val, notAdd) {
                if (this.sourceType === val) return;
                this.sourceType = val;
                this.addCondition = [];
                this.expression = '';
                if (val === 'whatsapp') {
                    this.conditionList1 = this.whatsappFieldList;
                } else if (['touchPointContact', 'contact', 'lead', 'customer', 'opportunity'].includes(val)) {
                    await this.$util.ajaxLeadscloud({
                        url: '/v2-crm/objData/queryApiKeyFilterFields',
                        method: 'get',
                        params: {
                            objectApiKey: val
                        }
                    }).then(response => {
                        if (response.data.code === 10000) {
                            this.conditionList1 = response.data.data.filter(item => ![30].includes(item.dataType)).map(item => {
                                item.label = item.displayName;
                                item.value = item.id;
                                return item;
                            });
                        } else {
                            this.conditionList1 = [];
                        }
                    });
                    // email 独有需求
                    this.$emit('reset');
                } else {
                    this.conditionList1 = [];
                    this.contactsFormForShow = {
                        name: '',
                        email: '',
                        group: '',
                        userIds: []
                    };
                    if (val === 'addressbook') {
                        !this.groupList.length && this.getGroupList();
                    } else if (val === 'colleague') {
                        !this.treeData.length && this.getDepartmentUser();
                    }
                    // email 独有需求
                    this.$emit('reset');
                }
                if(notAdd === true) return false; // 自动调用不需要新加 只是 回显选项
                this.addClick();
            },
            filterTypeChange(val) {
                console.log(val)
            },
            // 添加检索条件
            addClick() {
                this.addCondition.push({
                    condition1Obj: null,
                    condition1: '',
                    conditionList1: this.$deepClone(this.conditionList1),
                    condition2: '',
                    conditionList2: this.$deepClone(this.conditionList2),
                    condition3: '',
                    conditionList3: [],
                    inputType: 'string',
                    variable: {}
                });
            },
            // 删除检索条件
            removeClick(index) {
                this.addCondition.splice(index, 1);
            },
            addChangeCon1(index) {
                const condition1 = this.addCondition[index].conditionList1.find(item => item.value === this.addCondition[index].condition1);
                const dataType = condition1.dataType;
                this.addCondition[index].condition1Obj = condition1;
                this.addCondition[index].condition2 = '';
                this.addCondition[index].condition3 = '';
                this.addCondition[index].conditionList3 = [];
                switch (dataType) {
                    // 字符串型
                    case 'queryKeyWords':
                        this.addCondition[index].conditionList2 = [
                            {
                                value: '$eq',
                                label: this.$t('crm.Table.con_equal'),
                                childrenType: 'string'
                            }
                        ];
                        break;
                    case 'whatsapp':
                        this.addCondition[index].conditionList2 = [
                            {
                                value: '$eq',
                                label: this.$t('crm.Table.con_equal'),
                                childrenType: 'select'
                            }
                        ];
                        this.addCondition[index].conditionList3 = this.whatsappConditionList3Data[this.addCondition[index].condition1];
                        break;
                    case 'whatsappDate':
                        this.addCondition[index].conditionList2 = [
                            {
                                value: 'dateRange',
                                label: this.$t('crm.Table.con_periodOfTime'),
                                childrenType: 'dateRange'
                            }
                        ];
                        this.addCondition[index].conditionList3 = this.whatsappConditionList3Data[this.addCondition[index].condition1];
                        break;
                    case 'countryOfNumber':
                        this.addCondition[index].conditionList2 = [
                            {
                                value: '$eq',
                                label: this.$t('crm.Table.con_equal'),
                                childrenType: 'countryArea'
                            }
                        ];
                        this.addCondition[index].conditionList3 = this.whatsappConditionList3Data[this.addCondition[index].condition1];
                        break;
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 12:
                    case 15:
                        this.addCondition[index].conditionList2 = [
                            ...this.filterData.text
                        ];
                        break;
                    case 8:
                    case 9:
                    case 11:
                    case 13:
                    case 14:
                    case 16:
                    case 17:
                    case 18:
                    case 19:
                        this.addCondition[index].conditionList2 = [
                            ...this.filterData.number
                        ];
                        if ([11].includes(dataType)) {
                            this.addCondition[index].variable.precision = 0;
                            this.addCondition[index].variable.controls = true;
                        } else {
                            // this.addCondition[index].variable.precision = 15;
                            this.addCondition[index].variable.controls = false;
                        }
                        break;
                    case 21:
                    case 23:
                    case 31:
                        this.addCondition[index].conditionList2 = [
                            ...this.filterData.date
                        ];
                        break;
                    case 22:
                    case 24:
                    case 32:
                        this.addCondition[index].conditionList2 = [
                            ...this.filterData.dataTime
                        ];
                        break;
                    case 28:
                    case 29:
                        if (condition1.apiKey === 'dimDepart') {
                            this.addCondition[index].conditionList2 = [
                                ...this.filterData.dimDepartSelect
                            ];
                        } else if (['updatedUser', 'createdUser', 'ownerId', 'formerManager', 'infoUpdatedUser', 'recentFollowUpUser', 'convertUser'].includes(condition1.apiKey)) {
                            this.addCondition[index].conditionList2 = [
                                ...this.filterData.userSelect
                            ];
                        } else if (['publicPool', 'publicPool'].includes(condition1.apiKey)) {
                            this.addCondition[index].conditionList2 = [
                                ...this.filterData.selectReferenceSpecial
                            ];
                        } else {
                            this.addCondition[index].conditionList2 = [
                                ...this.filterData.selectReference
                            ];
                        }
                        break;
                    case 25:
                        if (condition1.apiKey === 'archiveStatus') {
                            this.addCondition[index].conditionList2 = [
                                ...this.filterData.archiveStatusSelect
                            ];
                        } else {
                            this.addCondition[index].conditionList2 = [
                                ...this.filterData.select
                            ];
                        }
                        break;
                    case 26:
                    case 27:
                        this.addCondition[index].conditionList2 = [
                            ...this.filterData.MultSelectSpecial
                        ];
                        break;
                    case 10:
                    case 20:
                        this.addCondition[index].conditionList2 = [
                            ...this.filterData.boolean
                        ];
                        break;
                    default:
                        this.addCondition[index].conditionList2 = [
                            ...this.filterData.MultSelectSpecial
                        ];
                        break;
                }
                this.addCondition[index].condition2 = this.addCondition[index].conditionList2[0].value;
                this.addCondition[index].inputType = this.addCondition[index].conditionList2[0].childrenType;
                if ([25, 26].includes(dataType)) {
                    this.addCondition[index].condition3 = '';
                    this.$util.ajaxLeadscloudJson({
                        url: '/v2-meta/option/queryOptionByFieldIds',
                        method: 'post',
                        data: {
                            fieldIds: [this.addCondition[index].condition1],
                            objectId: this.addCondition[index].condition1Obj.objectId
                        }
                    }).then(response => {
                        if (response.data.code === 10000) {
                            this.addCondition[index].conditionList3 = response.data.data.map(item => {
                                item.label = item.displayName;
                                item.value = item.id;
                                return item;
                            });
                        }
                    });
                }
                if (dataType === 28) {
                    this.addCondition[index].condition3 = '';
                    if (['updatedUser', 'createdUser', 'ownerId', 'formerManager', 'infoUpdatedUser', 'recentFollowUpUser', 'convertUser', 'dimDepart'].includes(condition1.apiKey)) {
                        !this.treeData.length && this.getDepartmentUser();
                    } else if (condition1.apiKey === 'objectType') {
                        this.$util.ajaxLeadscloudJson({
                            url: '/v2-meta/bizObjType/queryObjTypeList',
                            method: 'post',
                            data: {
                                objectId: condition1.objectId
                            }
                        }).then(response => {
                            if (response.data.code === 10000) {
                                this.addCondition[index].conditionList3 = response.data.data.map(item => {
                                    item.label = item.name;
                                    item.value = item.id;
                                    return item;
                                });
                            }
                        });
                    } else if (condition1.apiKey === 'publicPool') {
                        console.log(condition1, condition1.objectId, condition1.objApiKey);
                        this.$util.ajaxLeadscloudJson({
                            url: '/v2-meta/publicPoolGroup/queryPublicPoolGroupPersonageList',
                            method: 'get',
                            params: {
                                objectId: condition1.objectId,
                                objectApiKey: condition1.objApiKey
                            }
                        }).then(response => {
                            if (response.data.code === 10000) {
                                this.addCondition[index].conditionList3 = response.data.data.map(item => {
                                    item.label = item.name;
                                    item.value = item.auto_column_id;
                                    return item;
                                });
                            }
                        });
                    }
                }
                if ([12, 13].includes(this.addCondition[index].condition2)) {
                    this.addCondition[index].condition3 = -1;
                }
            },
            addChangeCon2(index) {
                const condition2 = this.addCondition[index].condition2;
                this.addCondition[index].condition3 = '';
                this.addCondition[index].inputType = this.addCondition[index].conditionList2.find(v => condition2 === v.value).childrenType;
                if (['array', 'numberRange', 'dateRange'].includes(this.addCondition[index].inputType)) {
                    this.addCondition[index].condition3 = [];
                }
                if ([12, 13].includes(condition2)) {
                    this.addCondition[index].condition3 = -1;
                }
            },
            remoteMethod(query, item) {
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                    this.cancelFunc = null;
                }
                const vm = this;
                this.loading = true;
                this.$util.ajaxLeadscloudJson({
                    url: '/v2-crm/bizData/queryFollowUpObjectNameList',
                    method: 'post',
                    cancelToken: new this.$util.axios.CancelToken(function executor(c) {
                        vm.cancelFunc = c;
                    }),
                    data: {
                        objectId: item.condition1Obj.referenceObjectId,
                        conditions: [
                            { apiKey: 'name', values: [`${query}`], nullCond: false }
                        ]
                    }
                }).then(response => {
                    if (response.data.code === 10000) {
                        item.conditionList3 = response.data.data.pageInfo.list.map(item => {
                            item.label = item.name;
                            item.value = item.auto_column_id;
                            return item;
                        });
                    }
                    this.loading = false;
                });
            },
            savedimDepart(list, index) {
                this.addCondition[index].condition3 = list;
            },
            saveServiceList(list) {
                this.contactsFormForShow.userIds = list;
            },
            handleClear() {
                // this.sourceType = this.radioList[0].value;
                // this.filterType = 0;
                this.expression = '';
                this.addCondition = [];
                this.addClick();
                this.contactsFormForShow = {
                    name: '',
                    email: '',
                    group: '',
                    userIds: []
                };
                if (this.from === 'email') {
                    this.$emit('getData', {
                        sourceType: this.sourceType,
                        filterType: this.filterType,
                        addCondition: this.addCondition,
                        expression: this.expression,
                        contactsFormForShow: this.contactsFormForShow
                    });
                }
            },
            handleConfirm() {
                if (!['colleague', 'addressbook'].includes(this.sourceType)) {
                    const flag = this.addCondition.every(item => item.condition1 && item.condition2 && ((item.condition3 && item.condition3.length) || item.condition3 instanceof Date || (typeof item.condition3 === 'number' && !isNaN(item.condition3))));
                    if ((this.sourceType === 'whatsapp' || (this.sourceType !== 'whatsapp' && this.filterType !== 0)) && !flag) {
                        this.$Message.info(this.$t('crm.Table.info_searchEmptyConditions'));
                        return;
                    }
                    // // 可筛选
                    // if (this.from === 'whatsapp') {
                    //     this.$emit('update:custom_conditions', this.addCondition);
                    //     this.$emit('handleSearchAdvanced');
                    //     return;
                    // }
                } else {
                    // if (!this.contactsFormForShow.name.trim() && !this.contactsFormForShow.email.trim() && !this.contactsFormForShow.group && this.contactsFormForShow.department.length === 0) {
                    //     this.$Message.info(this.$t('crm.Table.info_searchEmptyConditions'));
                    //     return;
                    // }
                }
                const conditions = this.addCondition.map(item => {
                    return {
                        searchField: item.condition1Obj,
                        matchType: item.condition2,
                        searchRange: [
                            {
                                condMode: 1,
                                values: item.condition3 === -1 ? [] : Array.isArray(item.condition3) ? (['userSelect', 'department'].includes(item.inputType) ? [item.condition3[0].value] : item.condition3) : [item.condition3]
                            }
                        ]
                    };
                });
                const response = {
                    sourceType: this.sourceType,
                    filterType: this.filterType,
                    addCondition: this.addCondition,
                    conditions: conditions,
                    expression: this.expression,
                    contactsFormForShow: this.contactsFormForShow
                };
                if (!this.needButton) {
                    return response;
                } else {
                    this.$emit('getData', response);
                }
            }
        },
        mounted() {
           
        },
        created() {
            console.log(this.filterParams);
            if(this.filterParams) {
                this.getDepartmentUser();
                // 回显数据
                let {sourceType, filterType, addCondition, expression, contactsFormForShow} = this.filterParams;
                this.sourceTypeChange(sourceType, true);

                // this.sourceType = sourceType;
                this.filterType = filterType
                this.addCondition = this.$deepClone(addCondition);
                this.expression = expression;
                this.contactsFormForShow = contactsFormForShow;
            } else {
                this.sourceTypeChange(this.radioList[0].value);
            }
        }
    };
</script>
<style lang="less" scoped>
    .advanced-filtering {
        position: relative;
        // height: 100%;
        padding: 0 0 20px;
        .filter-type-box{
            line-height: 40px;
            .el-menu--horizontal > .el-menu-item {
                padding: 0;
                margin: 0 20px;
                color: #303133;
                height: 30px;
                line-height: 30px;
            }
            .el-menu--horizontal > .el-menu-item.is-active {
                color: #FF752A;
                font-weight: 600;
            }
        }
        .filter-list {
            padding: 0 20px;
            .conditionmain {
                display: flex;
                align-items: center;
                .el-select {
                    margin-right: 12px;
                }
            }
            .contacts-form {
                // width: 50%;
                .el-form-item {
                    margin-bottom: 8px;
                }
                // /deep/ .el-form-item__content {
                //     width: 300px;
                // }
            }
        }
        .filter-list-whatsapp {
            max-height: 360px;
            overflow: auto;
        }
    }
</style>
