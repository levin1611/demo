<template>
    <Row :gutter="8">
        <Col :span="7">
            <Select v-model="condition1"
                    @change="changecon1">
                <Option v-for="item in conditionlist1"
                        :title="item"
                        :value="item"
                        :label="$dym.lengthFilter(item)"></Option>
            </Select>
        </Col>
        <Col :span="6">
            <Select v-model="condition2">
                <Option v-for="item in conditionlist2"
                        :title="item.label"
                        :value="item.value"
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
                        :picker-options="pickerOptions"
                        placement="bottom-end"
                        size="small"
                        :placeholder="$t('filter_box.select_time')"
                        style="width: 100%;"></DatePicker>
            <Select v-if="inputType === 'select'"
                    v-model="condition3">
                <Option v-for="item in conditionlist3"
                        :title="item.label"
                        :value="item.value"
                        :label="$dym.lengthFilter(item.label)"></Option>
            </Select>
        </Col>
    </Row>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'clue_search',
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
                allcolumns: [], // 表格全部列
                condition1: '',
                condition1Key: '',
                conditionlist1: [],
                condition2: '',
                conditionlist2: [],
                condition3: '',
                inputType: 'string',
                pickerOptions: {
                    shortcuts: [
                        {
                            text: this.$t('datepicker.today'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.yesterday'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24);
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.tswk'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                let dayNo = start.getDay();
                                dayNo = dayNo ? dayNo - 1 : 6;
                                start.setTime(start.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.ltwk'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                let dayNo = start.getDay();
                                dayNo = dayNo || 7;
                                end.setTime(end.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                start.setTime(end.getTime() - 6 * 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.tsmt'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(new Date(start.getFullYear(), start.getMonth(), 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.ltmt'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() - 24 * 60 * 60 * 1000);
                                start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        }
                    ],
                    disabledDate(date) {
                        return date && date.valueOf() > Date.now();
                    }
                }
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId
            }), // 从 vuex 中获取属性
            dataList() {
                if (this.condition1 === this.$t('clue.edit_time') || this.condition1 === this.$t('clue.leads_create_time') || this.condition1 === this.$t('clue.create_time')) {
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
            /* 获取表头,检索条件 */
            getColumnList() {
                util.ajax({
                    url: '/form-cust/form/getXSShow', /* 获取线索字段 */
                    method: 'post',
                    data: {
                        userId: this.userId,
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code == 1) {
                        let columnList = [
                            { title: this.$t('index'), key: 'number', width: 60, type: 'index', fixed: 'left' },
                            { title: this.$t('clue.clue_id'), key: 'seqNumber', width: 180 }
                        ];
                        let groupTemp = [this.$t('index'), this.$t('clue.clue_id'), this.$t('clue.visitor_id'), this.$t('clue.FB_name'), this.$t('clue.leads_create_time'), 'FB Lead ID', 'Ad ID', this.$t('clue.inquiry_num')];
                        const showList = response.data.data.show;
                        for (const key in showList) {
                            groupTemp.push(showList[key].name);
                            columnList.push({
                                title: showList[key].name,
                                key: key,
                                minWidth: 120
                            });
                        }
                        groupTemp = groupTemp.concat([this.$t('clue.first_visit_url'), this.$t('clue.create_way'), this.$t('clue.create_time'),
                                                      this.$t('clue.edit_time'), this.$t('clue.inputer'), this.$t('clue.service'), this.$t('clue.sales'), this.$t('clue.status')]);
                        columnList = columnList.concat([
                            { title: this.$t('clue.visitor_id'), key: 'proj', width: 200 },
                            { title: this.$t('clue.FB_name'), key: 'partSys', width: 150 },
                            { title: this.$t('clue.leads_create_time'), key: 'leadsSubmitTime', width: 150 },
                            { title: 'FB Lead ID', width: 150, align: 'center', key: 'leadsId' },
                            { title: 'Ad ID', width: 150, align: 'center', key: 'adId' },
                            { title: this.$t('clue.inquiry_num'), width: 150, align: 'center', key: 'inquiryNum' },
                            { title: this.$t('clue.first_visit_url'), minWidth: 150, key: 'currentUrl' },
                            { title: this.$t('clue.create_way'), minWidth: 120, key: 'source' },
                            { title: this.$t('clue.create_time'), key: 'createTime', width: 150 },
                            { title: this.$t('clue.edit_time'), key: 'editTime', width: 150 },
                            { title: this.$t('clue.inputer'), width: 100, key: 'createUser' },
                            { title: this.$t('clue.service'), width: 100, key: 'serviceName' },
                            { title: this.$t('clue.sales'), width: 100, key: 'saleName' },
                            { title: this.$t('clue.status'), width: 90, key: 'status' }
                        ]);
                        this.allcolumns = columnList;
                        this.conditionlist1 = groupTemp.filter((item) => {
                            return item != this.$t('index') && item != this.$t('clue.create_time');
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
                    case this.$t('clue.create_time'):
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
                    case this.$t('clue.status'):
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
                                value: 1,
                                label: this.$t('clue.unfollowed')
                            },
                            {
                                value: 2,
                                label: this.$t('clue.trash')
                            },
                            {
                                value: 3,
                                label: this.$t('clue.inquiry')
                            },
                            {
                                value: 4,
                                label: this.$t('clue.following')
                            },
                            {
                                value: 5,
                                label: this.$t('clue.done')
                            }
                        ];
                        this.inputType = 'select';
                        break;
                    case this.$t('clue.create_way'):
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
                                value: 1,
                                label: this.$t('clue.history')
                            },
                            {
                                value: 2,
                                label: this.$t('clue.web_msg')
                            },
                            {
                                value: 3,
                                label: this.$t('clue.direct_create')
                            },
                            {
                                value: 4,
                                label: this.$t('clue.web_conversation')
                            },
                            {
                                value: 5,
                                label: 'Facebook Leads'
                            },
                            {
                                value: 6,
                                label: this.$t('clue.fb_msg')
                            },
                            {
                                value: 7,
                                label: this.$t('clue.fb_comment')
                            },
                            {
                                value: 9,
                                label: this.$t('clue.data_import')
                            }
                        ];
                        this.inputType = 'select';
                        break;
                    default:
                        this.condition3 = '';
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
                this.$emit('searchChange', this.dataList);
            },
            /* 筛选字段-获取检索类型 */
            getSearchCon(str) {
                for (const item of this.allcolumns) {
                    if (str === item.title) {
                        return item.key;
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
            condition2() {
                this.$emit('searchChange', this.dataList);
            },
            condition3() {
                this.$emit('searchChange', this.dataList);
            },
            condition1Key() {
                this.$emit('searchChange', this.dataList);
            }
        }
    };
</script>
