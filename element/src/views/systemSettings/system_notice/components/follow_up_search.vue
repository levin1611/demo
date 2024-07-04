<template>
    <Row :gutter="8">
        <Col :span="7">
            <Select v-model="condition1"
                    @change="changeCon1">
                <Option v-for="item in conditionList1"
                        :value="item.value"
                        :title="item.label"
                        :label="$dym.lengthFilter(item.label)"></Option>
            </Select>
        </Col>
        <Col :span="6">
            <Select v-model="condition2"
                    ref="selMiddle"
                    @change="changeCon2">
                <Option v-for="item in conditionList2"
                        :value="item.value"
                        :title="item.label"
                        :label="$dym.lengthFilter(item.label)"></Option>
            </Select>
        </Col>
        <Col :span="11">
            <Input v-if="inputType === 'string'"
                   v-model="condition3"
                   :placeholder="$t('systemNotice.followUp.tip_addKeywords')"></Input>
            <DatePicker v-if="inputType === 'dateRange'"
                        v-model="condition3"
                        type="daterange"
                        placement="bottom-end"
                        size="small"
                        :placeholder="$t('systemNotice.followUp.tip_selectTime')"
                        style="width: 100%;"></DatePicker>
            <DatePicker v-if="inputType === 'date'"
                        v-model="condition3"
                        type="date"
                        placement="bottom-end"
                        size="small"
                        :placeholder="$t('systemNotice.followUp.tip_selectTime')"
                        style="width: 100%;"></DatePicker>
            <Select v-if="inputType === 'array'"
                    v-model="condition3"
                    multiple
                    filterable>
                <template v-if="condition1 === 'createUser'">
                    <Option v-for="item in allUsers"
                            :key="item.id"
                            :value="item.id"
                            :title="item.fullname"
                            :label="$dym.lengthFilter(item.fullname)"></Option>
                </template>
                <template v-else-if="condition1 === 'followupType'">
                    <Option v-for="item in followupTypeList"
                            :key="item"
                            :value="item"
                            :title="item"
                            :label="$dym.lengthFilter(item)"></Option>
                </template>
                <template v-else-if="condition1 === 'followupId'">
                    <OptionGroup :label="$t('crm.WorkBench.activated')">
                        <Option v-for="item in computed_followUpStatus_using"
                                :key="item.attrId"
                                :value="item.attrId"
                                :title="item.attrName"
                                :label="$dym.lengthFilter(item.attrName)"></Option>
                    </OptionGroup>
                    <OptionGroup :label="$t('crm.WorkBench.terminated')">
                        <Option v-for="item in computed_followUpStatus_disabled"
                                :key="item.attrId"
                                :value="item.attrId"
                                :title="item.attrName"
                                :label="$dym.lengthFilter(item.attrName)"></Option>
                    </OptionGroup>
                </template>
            </Select>
        </Col>
    </Row>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'follow_up_search',
        props: {
            conditionObj: {
                type: Object,
                default: {}
            },
            dateformat: {
                type: Function,
                default: null
            }
        },
        data() {
            return {
                condition1: '',
                conditionList1: [
                    {
                        label: this.$t('systemNotice.followUp.createTime'),
                        value: 'createTime'
                    },
                    {
                        label: this.$t('systemNotice.followUp.createUser'),
                        value: 'createUser'
                    },
                    {
                        label: this.$t('systemNotice.followUp.followupType'),
                        value: 'followupType'
                    },
                    {
                        label: this.$t('systemNotice.followUp.followupContent'),
                        value: 'followupContent'
                    },
                    {
                        label: this.$t('systemNotice.followUp.followupState'),
                        value: 'followupId'
                    }
                ],
                condition2: '',
                conditionList2: [],
                condition3: null,
                inputType: 'string', // 判断是否需要改变筛选条件
                followupTypeList: [
                    this.$t('crm.WorkBench.phone'),
                    this.$t('crm.WorkBench.Email'),
                    this.$t('crm.WorkBench.WhatsApp'),
                    this.$t('crm.WorkBench.instagram'),
                    this.$t('crm.WorkBench.Facebook'),
                    this.$t('crm.WorkBench.weChat'),
                    this.$t('crm.WorkBench.LinkedIn'),
                    this.$t('crm.WorkBench.Twitter'),
                    this.$t('crm.WorkBench.Message'),
                    this.$t('crm.WorkBench.exhibition'),
                    this.$t('crm.WorkBench.customerVisiting'),
                    this.$t('crm.WorkBench.visitCustomer'),
                    this.$t('crm.WorkBench.websiteInteraction'),
                    this.$t('crm.WorkBench.others')
                ], // 跟进类型列表
                status_list: []
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                allUsers: state => state.crm.allUsers // 全部用户
            }), // 从 vuex 中获取属性
            computed_followUpStatus_using() {
                return this.status_list ? this.status_list.filter(item => item.isAvailable === 1) : [];
            },
            computed_followUpStatus_disabled() {
                return this.status_list ? this.status_list.filter(item => item.isAvailable !== 1) : [];
            },
            dataList() {
                if (this.condition1 === 'createTime') {
                    let condition3Standard = null;
                    if (this.condition2 === this.$t('systemNotice.addRule.con_periodOfTime')) {
                        condition3Standard = [
                            new Date(this.condition3[0]).format('yyyy-MM-dd'),
                            new Date(this.condition3[1]).format('yyyy-MM-dd')
                        ];
                    } else {
                        condition3Standard = new Date(this.condition3).format('yyyy-MM-dd');
                    }
                    return {
                        condition1Key: this.condition1,
                        condition1: this.condition1,
                        condition2: this.condition2,
                        condition3: condition3Standard
                    };
                } else {
                    return {
                        condition1Key: this.condition1,
                        condition1: this.condition1,
                        condition2: this.condition2,
                        condition3: this.condition3
                    };
                }
            }
        },
        methods: {
            changeCon1() {
                this.condition2 = '';
                switch (this.condition1) {
                    case 'createTime':
                        this.conditionList2 = [
                            {
                                value: this.$t('systemNotice.addRule.con_periodOfTime'),
                                label: this.$t('systemNotice.addRule.con_periodOfTime')
                            },
                            {
                                value: this.$t('systemNotice.addRule.con_lessThan'),
                                label: this.$t('systemNotice.addRule.con_lessThan')
                            },
                            {
                                value: this.$t('systemNotice.addRule.con_greaterThan'),
                                label: this.$t('systemNotice.addRule.con_greaterThan')
                            }
                        ];
                        this.condition3 = '';
                        this.inputType = 'date';
                        break;
                    case 'followupContent':
                        this.conditionList2 = [
                            {
                                value: this.$t('systemNotice.addRule.con_include'),
                                label: this.$t('systemNotice.addRule.con_include')
                            },
                            {
                                value: this.$t('systemNotice.addRule.con_equal'),
                                label: this.$t('systemNotice.addRule.con_equal')
                            },
                            {
                                value: this.$t('systemNotice.addRule.con_unequal'),
                                label: this.$t('systemNotice.addRule.con_unequal')
                            }
                        ];
                        this.condition3 = '';
                        this.inputType = 'string';
                        break;
                    case 'followupId':
                        this.conditionList2 = [
                            {
                                value: this.$t('systemNotice.addRule.con_equal'),
                                label: this.$t('systemNotice.addRule.con_equal')
                            }
                        ];
                        this.condition3 = [];
                        this.inputType = 'array';
                        break;
                    default:
                        this.conditionList2 = [
                            {
                                value: this.$t('systemNotice.addRule.con_include'),
                                label: this.$t('systemNotice.addRule.con_include')
                            },
                            {
                                value: this.$t('systemNotice.addRule.con_equal'),
                                label: this.$t('systemNotice.addRule.con_equal')
                            },
                            {
                                value: this.$t('systemNotice.addRule.con_unequal'),
                                label: this.$t('systemNotice.addRule.con_unequal')
                            }
                        ];
                        this.condition3 = [];
                        this.inputType = 'array';
                }
                this.$emit('searchChange', this.dataList);
            },
            changeCon2() {
                if (this.condition1 === 'createTime') {
                    if (this.condition2 === this.$t('systemNotice.addRule.con_periodOfTime')) {
                        this.condition3 = [];
                        this.inputType = 'dateRange';
                    } else {
                        this.condition3 = '';
                        this.inputType = 'date';
                    }
                } else if (this.condition1 === 'followupContent') {
                    this.condition3 = '';
                    this.inputType = 'string';
                } else {
                    this.condition3 = [];
                    this.inputType = 'array';
                }

                this.$refs.selMiddle.selectedSingle === this.$refs.selMiddle.model ? undefined : this.$refs.selMiddle.selectedSingle = this.$refs.selMiddle.model;
                this.$emit('searchChange', this.dataList);
            },
            /** 获取跟进状态列表 */
            get_followUp_status() {
                util.ajax({
                    url: '/crm/attr/getList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        typeId: 7
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.status_list = response.data.data;
                        this.status_list.unshift({
                            isAvailable: 1,
                            attrId: 0,
                            sort: 0,
                            typeId: 7,
                            attrName: this.$t('crm.UniSet.defaultFollowUpStatus_inquiry')
                        });
                    } else {
                        this.$Message.error(this.$t('crm.WorkBench.error_getFollowUpStatusList'));
                    }
                });
            }
        },
        created() {
            // 获取全部用户
            if (!this.allUsers.length) {
                this.$store.dispatch('getAllUsers');
            }
            this.get_followUp_status();
            if (this.conditionObj) {
                if (this.conditionObj.condition1Key) {
                    this.condition1 = this.conditionObj.condition1;
                    this.changeCon1();
                    if (this.conditionObj.condition2 === this.$t('systemNotice.addRule.con_periodOfTime')) {
                        this.condition3 = [];
                        this.inputType = 'dateRange';
                    }
                    this.condition2 = this.conditionObj.condition2;
                    this.condition3 = this.conditionObj.condition3;
                }
            }
        },
        watch: {
            condition3() {
                this.$emit('searchChange', this.dataList);
            }
        }
    };
</script>

