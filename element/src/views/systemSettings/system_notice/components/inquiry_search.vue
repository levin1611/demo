<template>
    <Row :gutter="8">
        <Col :span="7">
            <Select v-model="condition1"
                    @change="changeCon1">
                <Option v-for="item in conditionList1"
                        :key="item.value"
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
                        :key="item.value"
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
                         :min="0"
                         :placeholder="$t('crm.Table.tip_inputNumber')"></InputNumber>
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
                    :multiple="condition1 !== $t('crm.Table.col_followUp')"
                    filterable>
                <template v-if="condition1 === $t('crm.Table.col_inquiryManagers')">
                    <Option v-for="item in allUsers"
                            :key="item.fullname"
                            :value="item.id"
                        :title="item.fullname"
                            :label="$dym.lengthFilter(item.fullname)"></Option>
                </template>
                <template v-if="condition1 === $t('crm.Table.col_followUp')">
                    <OptionGroup :label="$t('crm.Table.activated')">
                        <Option v-for="item in computed_followUpStatus_using"
                                :key="item.attrId"
                                :value="item.attrId + ''"
                        :title="item.attrName"
                                :label="$dym.lengthFilter(item.attrName)"></Option>
                    </OptionGroup>
                    <OptionGroup :label="$t('crm.Table.terminated')">
                        <Option v-for="item in computed_followUpStatus_disabled"
                                :key="item.attrId"
                                :value="item.attrId + ''"
                        :title="item.attrName"
                                :label="$dym.lengthFilter(item.attrName)"></Option>
                    </OptionGroup>
                </template>
                <template v-else-if="condition1 === $t('crm.Table.col_status')">
                    <Option v-for="(item, index) in [$t('crm.Table.GoogleMachineLearning'), $t('crm.Table.GoogleAudienceOptimization'), $t('crm.Table.FacebookAudienceOptimization')]"
                            :key="item"
                            :value="index"
                        :title="item"
                            :label="$dym.lengthFilter(item)"></Option>
                </template>
            </Select>
        </Col>
    </Row>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'inquiry_search',
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
                inputType: 'string'
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                allUsers: state => state.crm.allUsers,
                selectOptions: state => state.crm.selectOptions
            }), // 从 vuex 中获取属性
            computed_followUpStatus_using() {
                return this.selectOptions.followUp ? this.selectOptions.followUp.filter(item => item.isAvailable === 1) : [{
                    attrId: null,
                    attrName: ''
                }];
            },
            computed_followUpStatus_disabled() {
                return this.selectOptions.followUp ? this.selectOptions.followUp.filter(item => item.isAvailable !== 1) : [{
                    attrId: null,
                    attrName: ''
                }];
            },
            dataList() {
                if (!this.condition1Key) {
                    this.condition1Key = this.getSearchCon(this.condition1);
                }
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
            get_inquiry_col() {
                util.ajax({
                    url: '/crm/columnConfig/getFields',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        parentId: 3
                    }
                }).then(response => {
                    if (response.data.code == '1') {
                        const inquiry_columns_authorized = response.data.data;
                        let allColumns = [];
                        if (inquiry_columns_authorized.default) {
                            const inquiry_default_keys = inquiry_columns_authorized.default.map(item => item.storageName).concat(['number', 'seqNumber', 'companyName', 'inquiryManagers', 'follow_up_count', 'createTime', 'updateTime']);
                            allColumns = [
                                {
                                    title: this.$t('crm.Table.col_number'),
                                    key: 'number',
                                    width: 80,
                                    type: 'index'
                                },
                                {
                                    title: this.$t('crm.Table.col_seqNumber'),
                                    key: 'seqNumber',
                                    width: 160
                                },
                                {
                                    title: this.$t('crm.Table.col_companyName'),
                                    key: 'companyName',
                                    width: 180
                                },
                                {
                                    title: this.$t('crm.Table.col_productCategory'),
                                    key: 'productCategory',
                                    width: 150
                                },
                                {
                                    title: this.$t('crm.Table.col_demandProducts'),
                                    key: 'demandProducts',
                                    width: 150
                                },
                                {
                                    title: this.$t('crm.Table.col_sourceChannel'),
                                    key: 'sourceChannel',
                                    width: 150
                                },
                                {
                                    title: this.$t('crm.Table.col_sourceWay'),
                                    key: 'sourceWay',
                                    width: 150
                                },
                                {
                                    title: this.$t('crm.Table.col_inquiryManagers'),
                                    key: 'inquiryManagers',
                                    width: 110
                                },
                                {
                                    title: this.$t('crm.Table.col_status'),
                                    width: 110,
                                    render: (h, params) => {
                                        const child = ['isFromGoogle', 'googleStatus', 'facebookStatus'].map((item, index) => {
                                            return h('span', {
                                                style: {
                                                    display: params.row[item] === 1 ? 'inline-block' : 'none'
                                                }
                                            }, [
                                                h('img', {
                                                    attrs: {
                                                        src: [IMG_isFromGoogle, IMG_googleStatus, IMG_facebookStatus][index],
                                                        title: index === 2 ? this.$t('crm.Table.FacebookAudienceOptimization') : this.$t('crm.Table.GoogleIsLearning')
                                                    }
                                                })
                                            ]);
                                        });
                                        return h('div', {
                                            class: 'audience_icon_wrap'
                                        }, child);
                                    }
                                },
                                // {
                                //     title: '标签',
                                //     key: 'label',
                                //     width: 150,
                                //     render: (h, params) => {
                                //         let label_arr = JSON.parse(params.row.label);
                                //         if (label_arr && label_arr.length && Array.isArray(label_arr)) {
                                //             let labels = [];
                                //             label_arr.forEach(item => {
                                //                 labels.push(h('Tag', {
                                //                     props: {
                                //                         color: (!item.attrValue || item.attrValue === '') ? '#4285F4' : item.attrValue
                                //                     }
                                //                 }, item.attrName));
                                //             });
                                //             return h('div', labels);
                                //         } else {
                                //             return h('div', '');
                                //         }
                                //     }
                                // },
                                {
                                    title: this.$t('crm.Table.col_followUp'),
                                    width: 110,
                                    render: (h, params) => {
                                        if (/\d+/.test(`${params.row.followUpId}`)) {
                                            if (`${params.row.followUpId}` === '-1') {
                                                return h('span', this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry'));
                                            }
                                            const temp = this.selectOptions.followUp ? this.selectOptions.followUp.find(item => `${item.attrId}` === `${params.row.followUpId}`) : undefined;
                                            return h('span', temp ? temp.attrName : null);
                                        } else {
                                            return h('span', params.row.followUp || null);
                                        }
                                    }
                                },
                                {
                                    title: this.$t('crm.Table.col_followUpCount'),
                                    key: 'follow_up_count',
                                    width: 110,
                                    sortable: true
                                },
                                {
                                    title: this.$t('crm.Table.col_grouping'),
                                    key: 'grouping',
                                    width: 80
                                },
                                {
                                    title: this.$t('crm.Table.col_remark'),
                                    key: 'remark',
                                    width: 200,
                                    render: (h, params) => {
                                        return h('pre', {
                                            class: 'textAreaShow',
                                            style: {
                                                'text-align': 'left !important'
                                            }
                                        }, params.row.remark);
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
                            ].filter(item => (!item.key && item.title !== this.$t('crm.Table.col_followUp')) || inquiry_default_keys.includes(item.key) || (item.title === this.$t('crm.Table.col_followUp') && inquiry_default_keys.includes('followUp')));
                            this.conditionList1 = allColumns.map(item => {
                                return {
                                    value: item.title,
                                    label: item.title
                                };
                            });
                            this.conditionList1.splice(this.conditionList1.length - 2, 1); // 去掉 createTime
                            this.conditionList1.shift();
                        }
                        if (inquiry_columns_authorized.custom) {
                            inquiry_columns_authorized.custom.forEach(item => {
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
                    case this.$t('crm.Table.col_followUpCount'):
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
                    case this.$t('crm.Table.col_inquiryManagers'):
                    case this.$t('crm.Table.col_status'):
                        this.conditionList2 = [
                            {
                                value: this.$t('crm.Table.con_equal'),
                                label: this.$t('crm.Table.con_equal')
                            }
                        ];
                        this.inputType = 'array';
                        this.condition3 = [];
                        break;
                    case this.$t('crm.Table.col_followUp'):
                        this.conditionList2 = [
                            {
                                value: this.$t('crm.Table.con_equal'),
                                label: this.$t('crm.Table.con_equal')
                            }
                        ];
                        this.inputType = 'array';
                        this.condition3 = '';
                        break;
                    // 字符串
                    default:
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
                    case this.$t('crm.Table.col_followUpCount'):
                        this.condition3 = 0;
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
                    case this.$t('crm.Table.col_inquiryManagers'):
                    case this.$t('crm.Table.col_status'):
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
                    // case '询盘ID':
                    //     return 'id';
                    case this.$t('crm.Table.col_seqNumber'):
                        return 'seqNumber';
                    case this.$t('crm.Table.col_companyName'):
                        return 'companyName';
                    case this.$t('crm.Table.col_demandProducts'):
                        return 'demandProducts';
                    case this.$t('crm.Table.col_productCategory'):
                        return 'productCategory';
                    case this.$t('crm.Table.col_sourceChannel'):
                        return 'sourceChannel';
                    case this.$t('crm.Table.col_sourceWay'):
                        return 'sourceWay';
                    case this.$t('crm.Table.col_status'):
                        return 'status';
                    case this.$t('crm.Table.col_followUp'):
                        return 'followUpId';
                    case this.$t('crm.Table.col_followUpCount'):
                        return 'followUpCount';
                    case this.$t('crm.Table.col_grouping'):
                        return 'grouping';
                    case this.$t('crm.Table.col_remark'):
                        return 'remark';
                    case this.$t('crm.Table.col_inquiryManagers'):
                        return 'userIdsShowList';
                    case this.$t('crm.Table.col_updateTime'):
                        return 'updateTime';
                    default:
                        return str;
                }
            }
        },
        created() {
            this.get_inquiry_col();
            // 获取全部用户
            if (!this.allUsers.length) {
                this.$store.dispatch('getAllUsers');
            }
            // 获取 下拉选项数据
            this.$store.dispatch('getSelectOptions');
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
        watch: {
            condition3() {
                this.$emit('searchChange', this.dataList);
            },
            condition1Key() {
                this.$emit('searchChange', this.dataList);
            }
        }
    };
</script>
