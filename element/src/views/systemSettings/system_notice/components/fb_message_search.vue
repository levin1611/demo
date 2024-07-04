<template>
    <Row :gutter="8">
        <Col :span="7">
            <Select v-model="condition1"
                    @change="changecon1">
                <Option v-for="item in conditionlist1"
                        :value="item"
                        :title="item"
                        :label="$dym.lengthFilter(item)"></Option>
            </Select>
        </Col>
        <Col :span="6">
            <Select v-model="condition2">
                <Option v-for="item in conditionlist2"
                        :value="item.value"
                        :title="item.label"
                        :label="$dym.lengthFilter(item.label)"></Option>
            </Select>
        </Col>
        <Col :span="11">
            <Input v-if="inputType === 'string'"
                   v-model="condition3"
                   :placeholder="$t('filter_box.add_keywords')"></Input>
            <DatePicker v-if="inputType === 'date'"
                        v-model="condition3"
                        :type="condition2 == $t('crm.Table.con_periodOfTime') ? 'daterange' : 'date'"
                        placement="bottom-end"
                        size="small"
                        :placeholder="$t('filter_box.select_time')"
                        style="width: 100%;"></DatePicker>
            <Select v-if="inputType === 'select'"
                    v-model="condition3">
                <Option v-for="item in conditionlist3"
                        :value="item.value"
                        :title="item.label"
                        :label="$dym.lengthFilter(item.label)"></Option>
            </Select>
        </Col>
    </Row>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'fb_message_search',
        props: {
            conditionObj: {
                type: Object,
                default: {}
            },
            dateformat: {
                type: Function,
                default: null
            },
            objTypeId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                condition1: '',
                condition1Key: '',
                conditionlist1: [],
                condition2: '',
                conditionlist2: [],
                condition3: '',
                conditionlist3: [
                    {
                        value: 1,
                        label: this.$t('website.label1')
                    },
                    {
                        value: 2,
                        label: this.$t('website.label2')
                    },
                    {
                        value: 3,
                        label: this.$t('website.label3')
                    },
                    {
                        value: 4,
                        label: this.$t('website.label4')
                    },
                    {
                        value: 5,
                        label: this.$t('website.label5')
                    }
                ],
                inputType: 'string',
                allcolumns: []
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId
            }), // 从 vuex 中获取属性
            dataList() {
                if (this.condition1 === this.$t('clue.leads_create_time')) {
                    let condition3Standard = null;
                    if (this.condition2 === this.$t('crm.Table.con_periodOfTime')) {
                        condition3Standard = [
                            new Date(this.condition3[0]).format('yyyy-MM-dd'),
                            new Date(this.condition3[1]).format('yyyy-MM-dd')
                        ];
                    } else {
                        condition3Standard = new Date(this.condition3).format('yyyy-MM-dd');
                    }
                    return {
                        condition1Key: this.condition1Key,
                        condition1: this.condition1,
                        condition2: this.condition2,
                        condition3: condition3Standard
                    };
                } else {
                    return {
                        condition1Key: this.condition1Key,
                        condition1: this.condition1,
                        condition2: this.condition2,
                        condition3: this.condition3
                    };
                }
            }
        },
        methods: {
            /* 获取表头 */
            getColumnList() {
                util.ajax({
                    url: '/form-cust/form/getColumns',
                    method: 'post',
                    data: {
                        templateId: this.objTypeId,
                        isShow: 1,
                        orgId: this.enterpriseId,
                        userId: this.userId
                    }
                }).then(response => {
                    if (response.data.code == 1) {
                        let columnList = [
                            {
                                title: this.$t('index'),
                                type: 'index',
                                minWidth: 60,
                                align: 'center',
                                fixed: 'left'
                            },
                            { title: this.$t('clue.FB_name'), minWidth: 200, align: 'center', key: 'partSys' },
                            { title: 'FB Lead ID', width: 150, align: 'center', key: 'leadsId' },
                            { title: 'Ad ID', width: 150, align: 'center', key: 'adId' },
                            {
                                title: this.$t('clue.leads_create_time'),
                                width: 150,
                                align: 'center',
                                key: 'leadsSubmitTime'
                            }
                        ];
                        let groupTemp = [this.$t('index'), this.$t('clue.FB_name'), 'FB Lead ID', 'Ad ID', this.$t('clue.leads_create_time')];
                        const showList = response.data.data;
                        for (const key in showList) {
                            const obj = showList[key];
                            obj.key = key;
                            obj.required = showList[key].isNeed !== 0;
                            //                            this.templateList.push(obj)
                            groupTemp.push(showList[key].name);
                            if (key.indexOf('a100') != -1) {
                                columnList.push({
                                    title: showList[key].name,
                                    key: `b${key}`,
                                    align: 'center',
                                    minWidth: 120
                                });
                            } else {
                                columnList.push({
                                    title: showList[key].name,
                                    key,
                                    align: 'center',
                                    minWidth: 120
                                });
                            }
                        }
                        groupTemp = groupTemp.concat([this.$t('website.createTime'), this.$t('website.remark'), this.$t('website.operate')]);
                        columnList = columnList.concat([
                            { title: this.$t('website.createTime'), align: 'center', key: 'createTime', width: 150 },
                            {
                                title: this.$t('website.remark'),
                                align: 'center',
                                key: 'remark',
                                width: 120,
                                editable: true
                            },
                            { title: this.$t('website.operate'), width: 100, align: 'center' }
                        ]);
                        this.allcolumns = columnList;
                        this.conditionlist1 = groupTemp.filter((item) => { /* 筛选的第一个字段 */
                            return item != this.$t('index') && item != this.$t('website.createTime');
                        });
                        this.condition1Key = this.getSearchCon(this.condition1);
                    }
                });
            },
            /* 根据第一选择筛选项设定第二筛选项的下拉框值 */
            changecon1() {
                if (this.condition1) {
                    this.condition1Key = this.getSearchCon(this.condition1);
                }
                switch (this.condition1) {
                    // 时间类
                    case this.$t('clue.edit_time'):
                    case this.$t('clue.leads_create_time'):
                        this.condition2 = this.$t('crm.Table.con_periodOfTime');
                        this.conditionlist2 = [
                            {
                                value: this.$t('crm.Table.con_periodOfTime'),
                                label: this.$t('crm.Table.con_periodOfTime')
                            },
                            {
                                value: this.$t('filter_box.gt'),
                                label: this.$t('filter_box.gt')
                            },
                            {
                                value: this.$t('filter_box.lt'),
                                label: this.$t('filter_box.lt')
                            }
                        ];
                        this.condition3 = '';
                        this.inputType = 'date';
                        break;
                    case this.$t('website.operate'):
                        this.condition3 = this.$t('filter_box.equal');
                        this.conditionlist2 = [
                            {
                                value: this.$t('filter_box.equal'),
                                label: this.$t('filter_box.equal')
                            },
                            {
                                value: this.$t('filter_box.unequal'),
                                label: this.$t('filter_box.unequal')
                            }
                        ];
                        this.condition3 = '';
                        this.conditionlist3 = [
                            {
                                value: 101,
                                label: this.$t('website.Tooltip4')
                            },
                            {
                                value: 1,
                                label: this.$t('website.notEnter')
                            },
                            {
                                value: 100,
                                label: this.$t('website.Tooltip2')
                            }
                        ];
                        this.inputType = 'select';
                        break;
                    default:
                        this.condition3 = '';
                        this.condition2 = '';
                        this.conditionlist2 = [
                            {
                                value: this.$t('filter_box.equal'),
                                label: this.$t('filter_box.equal')
                            },
                            {
                                value: this.$t('filter_box.unequal'),
                                label: this.$t('filter_box.unequal')
                            },
                            {
                                value: this.$t('filter_box.contain'),
                                label: this.$t('filter_box.contain')
                            },
                            {
                                value: this.$t('filter_box.not_contain'),
                                label: this.$t('filter_box.not_contain')
                            }
                        ];
                        this.inputType = 'string';
                        break;
                }
            },
            /* 筛选字段-获取检索类型 */
            getSearchCon(str) {
                for (const item of this.allcolumns) {
                    if (str == item.title) {
                        if (str == this.$t('website.operate')) {
                            return 'status';
                        } else if (item.key && item.key.indexOf('ba10') !== -1) {
                            return item.key.substr(1);
                            break;
                        } else {
                            return item.key;
                        }
                    }
                }
            }
        },
        created() {
            this.getColumnList();
            if (this.conditionObj) {
                if (this.conditionObj.condition1Key) {
                    this.condition1Key = this.conditionObj.condition1Key;
                    this.condition1 = this.conditionObj.condition1;
                    this.changecon1();
                    this.condition2 = this.conditionObj.condition2;
                    this.condition3 = this.conditionObj.condition3;
                }
            }
        },
        watch: {
            condition2(value) {
                this.$emit('searchChange', this.dataList);
            },
            condition3(value) {
                this.$emit('searchChange', this.dataList);
            },
            condition1Key(value) {
                this.$emit('searchChange', this.dataList);
            }
        }
    };
</script>
