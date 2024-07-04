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
                   :placeholder="$t('crm.Table.tip_addKeywords')"></Input>
            <InputNumber v-if="inputType === 'number'"
                         v-model="condition3"
                         @change="handleChangeNumber"
                         :min="0"
                         :max="5"
                         :placeholder="$t('crm.Table.tip_inputNumber')"></InputNumber>
            <Select v-if="inputType === 'boolean'"
                    v-model="condition3">
                <Option v-for="n in 2"
                        :value="n"
                        :title="n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : ''"
                        :label="$dym.lengthFilter(n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : '')"></Option>
            </Select>
            <DatePicker v-if="inputType === 'dateRange'"
                        v-model="condition3"
                        type="daterange"
                        placement="bottom-end"
                        size="small"
                        :placeholder="$t('crm.Table.tip_selectTime')"
                        style="width: 100%;"></DatePicker>
            <DatePicker v-if="inputType === 'date'"
                        v-model="condition3"
                        type="date"
                        placement="bottom-end"
                        size="small"
                        :placeholder="$t('crm.Table.tip_selectTime')"
                        style="width: 100%;"></DatePicker>
            <Select v-if="inputType === 'array'"
                    v-model="condition3"
                    multiple
                    filterable>
                <Option v-for="item in salesList"
                        :key="item.fullname"
                        :value="item.id"
                        :title="item.fullname"
                        :label="$dym.lengthFilter(item.fullname)"></Option>
            </Select>
        </Col>
    </Row>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'customer_search',
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
                condition1Key: '',
                conditionList1: [],
                condition2: '',
                conditionList2: [],
                condition3: '',
                salesList: [], // 定义的 销售人员 实际拿的全部用户
                inputType: 'string'
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                allUsers: state => state.crm.allUsers // 全部用户
            }), // 从 vuex 中获取属性
            dataList() {
                if (this.condition1 === this.$t('crm.Table.col_updateTime') || this.condition1 === this.$t('crm.Table.col_createTime')) {
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
            handleChangeNumber(val) {
                if (this.inputType === 'number') {
                    this.condition3 = Math.floor(val);
                }
            },
            /* 设置询盘负责人列表 */
            setSalesList() {
                this.salesList = [{
                    fullname: '公海',
                    id: -1
                }];
                this.salesList = this.salesList.concat(this.allUsers);
            },
            /** 获取检索条件 */
            get_corp_col() {
                util.ajax({
                    url: '/crm/columnConfig/getFields',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        parentId: 1
                    }
                }).then(response => {
                    if (response.data.code == 1) {
                        const corp_columns_authorized = response.data.data;
                        let allColumns = [];
                        if (corp_columns_authorized.default) {
                            const corp_default_keys = corp_columns_authorized.default.map(item => item.storageName).concat(['number', 'companyManagers', 'marker', 'createTime', 'updateTime']);
                            allColumns = [
                                {
                                    title: this.$t('crm.Table.col_number'),
                                    key: 'number',
                                    width: 80,
                                    type: 'index'
                                },
                                {
                                    title: this.$t('crm.Table.col_companyName'),
                                    key: 'companyName',
                                    width: 180
                                },
                                {
                                    title: this.$t('crm.Table.col_shortName'),
                                    key: 'shortName',
                                    width: 150
                                },
                                {
                                    title: this.$t('crm.Table.col_starLevel'),
                                    key: 'starLevel',
                                    width: 200,
                                    sortable: true,
                                    render: (h, params) => {
                                        return h('Rate', {
                                            props: {
                                                disabled: true,
                                                value: params.row.starLevel
                                            }
                                        });
                                    }
                                },
                                {
                                    title: this.$t('crm.Table.col_country'),
                                    key: 'countryArea',
                                    width: 110
                                },
                                {
                                    title: this.$t('crm.Table.col_scale'),
                                    key: 'scale',
                                    width: 110
                                },
                                {
                                    title: this.$t('crm.Table.col_clientType'),
                                    key: 'clientType',
                                    width: 110
                                },
                                {
                                    title: this.$t('crm.Table.col_mainProduct'),
                                    key: 'mainProduct',
                                    width: 110
                                },
                                {
                                    title: this.$t('crm.Table.col_companyManagers'),
                                    key: 'companyManagers',
                                    width: 110
                                },
                                {
                                    title: this.$t('crm.Table.col_marker'),
                                    key: 'marker',
                                    width: 150,
                                    render: (h, params) => {
                                        if (params.row.marker === 1) {
                                            return h('Icon', {
                                                props: {
                                                    type: 'flag',
                                                    color: '#51b7a3',
                                                    size: 18
                                                },
                                                style: {
                                                    cursor: 'pointer'
                                                },
                                                on: {
                                                    click: () => {
                                                        this.params.row.marker = 2;
                                                    }
                                                }
                                            });
                                        } else {
                                            return h('Icon', {
                                                props: {
                                                    type: 'flag',
                                                    color: '#dadada',
                                                    size: 18
                                                },
                                                style: {
                                                    cursor: 'pointer'
                                                },
                                                on: {
                                                    click: () => {
                                                        this.params.row.marker = 1;
                                                    }
                                                }
                                            });
                                        }
                                    }
                                },
                                {
                                    title: this.$t('crm.Table.col_createTime'),
                                    key: 'createTime',
                                    width: 150
                                },
                                {
                                    title: this.$t('crm.Table.col_updateTime'),
                                    key: 'updateTime',
                                    width: 150
                                }
                            ].filter(item => !item.key || corp_default_keys.includes(item.key));
                            this.conditionList1 = allColumns.map(item => {
                                return {
                                    value: item.title,
                                    label: item.title
                                };
                            });
                            this.conditionList1.splice(this.conditionList1.length - 2, 1); // 去掉 createTime
                            this.conditionList1.shift();
                        }
                        if (corp_columns_authorized.custom) {
                            corp_columns_authorized.custom.forEach(item => {
                                if (item.colType === 'textarea') {
                                    allColumns.push({
                                        title: item.cname,
                                        key: item.storageName,
                                        width: 200,
                                        render: (h, params) => {
                                            return h('pre', {
                                                class: 'textAreaShow',
                                                style: {
                                                    'text-align': 'left !important'
                                                }
                                            }, params.row[item.storageName]);
                                        }
                                    });
                                } else if (item.colType === 'selectMultiple') {
                                    allColumns.push({
                                        title: item.cname,
                                        key: item.storageName,
                                        width: 130,
                                        render: (h, params) => {
                                            return h('div', this.$options.filters.parseArray(params.row[item.storageName]).join(', '));
                                        }
                                    });
                                } else {
                                    allColumns.push({
                                        title: item.cname,
                                        key: item.storageName,
                                        width: 130
                                    });
                                }
                                this.conditionList1.push({
                                    label: item.cname,
                                    value: item.storageName
                                });
                            });
                        }
                    }
                });
            },
            /* 根据第一选择筛选项设定第二筛选项的下拉框值 */
            changeCon1() {
                if (this.condition1) {
                    this.condition1Key = this.getSearchCon(this.condition1);
                }
                this.condition2 = '';
                this.condition3 = '';
                switch (this.condition1) {
                    // 数字
                    case this.$t('crm.Table.col_starLevel'):
                        this.conditionList2 = [
                            {
                                value: this.$t('crm.Table.con_lessThan'),
                                label: this.$t('crm.Table.con_lessThan')
                            },
                            {
                                value: this.$t('crm.Table.con_lessOrEqual'),
                                label: this.$t('crm.Table.con_lessOrEqual')
                            },
                            {
                                value: this.$t('crm.Table.con_equal'),
                                label: this.$t('crm.Table.con_equal')
                            },
                            {
                                value: this.$t('crm.Table.con_greaterOrEqual'),
                                label: this.$t('crm.Table.con_greaterOrEqual')
                            },
                            {
                                value: this.$t('crm.Table.con_greaterThan'),
                                label: this.$t('crm.Table.con_greaterThan')
                            }
                        ];
                        this.inputType = 'number';
                        this.condition3 = 0;
                        break;
                    // Boolean
                    case this.$t('crm.Table.col_marker'):
                        this.conditionList2 = [
                            {
                                value: this.$t('crm.Table.con_equal'),
                                label: this.$t('crm.Table.con_equal')
                            }
                        ];
                        this.inputType = 'boolean';
                        this.condition3 = 1;
                        break;
                    // 时间类
                    case this.$t('crm.Table.col_updateTime'):
                        this.conditionList2 = [
                            {
                                value: this.$t('crm.Table.con_periodOfTime'),
                                label: this.$t('crm.Table.con_periodOfTime')
                            },
                            {
                                value: this.$t('crm.Table.con_lessThan'),
                                label: this.$t('crm.Table.con_lessThan')
                            },
                            {
                                value: this.$t('crm.Table.con_greaterThan'),
                                label: this.$t('crm.Table.con_greaterThan')
                            }
                        ];
                        break;
                    // 负责人, 数组
                    case this.$t('crm.Table.col_companyManagers'):
                        this.conditionList2 = [
                            {
                                value: this.$t('crm.Table.con_equal'),
                                label: this.$t('crm.Table.con_equal')
                            }
                        ];
                        this.inputType = 'array';
                        this.condition3 = [];
                        break;
                    // 字符串
                    default:
                        // if (this.timeCondition1List.indexOf(this.condition1) !== -1) {
                        //     this.conditionList2 = [
                        //         {
                        //             value: '时间段',
                        //             label: '时间段'
                        //         },
                        //         {
                        //             value: '小于',
                        //             label: '小于'
                        //         },
                        //         {
                        //             value: '大于',
                        //             label: '大于'
                        //         }
                        //     ];
                        // } else {
                        this.conditionList2 = [
                            {
                                value: this.$t('crm.Table.con_include'),
                                label: this.$t('crm.Table.con_include')
                            },
                            {
                                value: this.$t('crm.Table.con_equal'),
                                label: this.$t('crm.Table.con_equal')
                            },
                            {
                                value: this.$t('crm.Table.con_unequal'),
                                label: this.$t('crm.Table.con_unequal')
                            }
                        ];
                        // }
                        this.inputType = 'string';
                }
                this.$emit('searchChange', this.dataList);
            },
            /* 根据第二选择筛选项设定第三筛选项是时间段还是时间点 */
            changeCon2() {
                // this.condition3 = '';
                // if (this.condition1 === '最近更新时间') {
                //     this.inputType = 'date';
                //     this.condition3 = '';
                //     if (this.condition2 === '时间段') {
                //         this.inputType = 'dateRange';
                //         this.condition3 = [];
                //     }
                // }

                switch (this.condition1) {
                    // 数字
                    case this.$t('crm.Table.col_starLevel'):
                        this.condition3 = 0;
                        break;
                    // Boolean
                    case this.$t('crm.Table.col_marker'):
                        this.condition3 = 1;
                        break;
                    // 时间类
                    case this.$t('crm.Table.col_updateTime'):
                        this.inputType = 'date';
                        this.condition3 = '';
                        if (this.condition2 === this.$t('crm.Table.con_periodOfTime')) {
                            this.inputType = 'dateRange';
                            this.condition3 = [];
                        }
                        break;
                    // 负责人, 数组
                    case this.$t('crm.Table.col_companyManagers'):
                        this.condition3 = [];
                        break;
                    // 字符串
                    default:
                        this.condition3 = '';
                }

                // 下面这行代码是不得已而为之,原因在于
                // BUG : 目前根据第一个下拉框决定第二个的选项数组的值,但是只要 change 前后选项数组值的长度一致,就会导致 change 后第二个选框选择下拉值显示无效(永远只显示 change 前的选择值, 第一个选框改回去才可以选择,但实际上只是显示无效,检索功能正常)
                // 解决思路: 通过 Vue-devTools 观察,发现 Select 的 data 上这两个属性值, selectedSingle 错误,所以使用 refs 取 Select 实例更正其数据
                this.$refs.selMiddle.selectedSingle === this.$refs.selMiddle.model ? undefined : this.$refs.selMiddle.selectedSingle = this.$refs.selMiddle.model;

                this.$emit('searchChange', this.dataList);
            },
            /* 筛选字段-获取检索类型 */
            getSearchCon(str) {
                switch (str) {
                    case this.$t('crm.Table.col_clientType'):
                        return 'clientType';
                    case this.$t('crm.Table.col_companyName'):
                        return 'companyName';
                    case this.$t('crm.Table.col_shortName'):
                        return 'shortName';
                    case this.$t('crm.Table.col_starLevel'):
                        return 'starLevel';
                    case this.$t('crm.Table.col_country'):
                        return 'countryArea';
                    case this.$t('crm.Table.col_scale'):
                        return 'scale';
                    case this.$t('crm.Table.col_mainProduct'):
                        return 'mainProduct';
                    case this.$t('crm.Table.col_companyManagers'):
                        return 'companyManagersList';
                    case this.$t('crm.Table.col_marker'):
                        return 'marker';
                    case this.$t('crm.Table.col_updateTime'):
                        return 'updateTime';
                    default:
                        return str;
                }
            }
        },
        created() {
            this.get_corp_col();
            // 获取全部用户
            if (!this.allUsers.length) {
                this.$store.dispatch('getAllUsers');
            }
            if (this.conditionObj) {
                if (this.conditionObj.condition1Key) {
                    this.condition1Key = this.conditionObj.condition1Key;
                    this.condition1 = this.conditionObj.condition1;
                    this.changeCon1();
                    this.condition2 = this.conditionObj.condition2;
                    this.condition3 = this.conditionObj.condition3;
                }
            }
        },
        mounted() {
            
        },
        watch: {
            condition3() {
                this.$emit('searchChange', this.dataList);
            },
            condition1Key() {
                this.$emit('searchChange', this.dataList);
            },
            allUsers:{
                handler(val) {
                    if(val) {
                        this.setSalesList();
                    }
                }
            }
        }
    };
</script>
