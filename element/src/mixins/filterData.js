// 存放翻译语种等翻译相关内容
export default {
    data() {
        return {
            filterData: {
                text: [
                    {
                        value: 1,
                        label: this.$t('crm.Table.con_equal'),
                        childrenType: 'string'
                    },
                    {
                        value: 8,
                        label: this.$t('crm.Table.con_unequal'),
                        childrenType: 'string'
                    },
                    {
                        value: 2,
                        label: this.$t('crm.Table.con_include'),
                        childrenType: 'string'
                    },
                    {
                        value: 14,
                        label: '不包含',
                        childrenType: 'string'
                    },
                    {
                        value: 12,
                        label: '为空',
                        childrenType: 'null'
                    },
                    {
                        value: 13,
                        label: '不为空',
                        childrenType: 'nnull'
                    }
                ],
                // 单选
                select: [
                    {
                        value: 1,
                        label: this.$t('crm.Table.con_equal'),
                        childrenType: 'select'
                    },
                    {
                        value: 8,
                        label: this.$t('crm.Table.con_unequal'),
                        childrenType: 'select'
                    },
                    {
                        value: 9,
                        label: '等于任意',
                        childrenType: 'array'
                    },
                    {
                        value: 10,
                        label: '不等于任意',
                        childrenType: 'array'
                    },
                    {
                        value: 12,
                        label: '为空',
                        childrenType: 'null'
                    },
                    {
                        value: 13,
                        label: '不为空',
                        childrenType: 'nnull'
                    }
                ],
                // 建档状态 单独处理
                archiveStatusSelect: [
                    {
                        value: 1,
                        label: this.$t('crm.Table.con_equal'),
                        childrenType: 'select'
                    },
                    {
                        value: 9,
                        label: '等于任意',
                        childrenType: 'array'
                    }
                ],
                // 关联关系选项
                selectReference: [
                    {
                        value: 1,
                        label: this.$t('crm.Table.con_equal'),
                        childrenType: 'searchSelect'
                    },
                    {
                        value: 8,
                        label: this.$t('crm.Table.con_unequal'),
                        childrenType: 'searchSelect'
                    },
                    {
                        value: 12,
                        label: '为空',
                        childrenType: 'null'
                    },
                    {
                        value: 13,
                        label: '不为空',
                        childrenType: 'nnull'
                    }
                ],
                // objectType、publicPool 单独处理的select选项
                selectReferenceSpecial: [
                    {
                        value: 1,
                        label: this.$t('crm.Table.con_equal'),
                        childrenType: 'select'
                    },
                    {
                        value: 8,
                        label: this.$t('crm.Table.con_unequal'),
                        childrenType: 'select'
                    },
                    {
                        value: 12,
                        label: '为空',
                        childrenType: 'null'
                    },
                    {
                        value: 13,
                        label: '不为空',
                        childrenType: 'nnull'
                    }
                ],
                // 部门选项
                dimDepartSelect: [
                    {
                        value: 1,
                        label: this.$t('crm.Table.con_equal'),
                        childrenType: 'department'
                    },
                    {
                        value: 8,
                        label: this.$t('crm.Table.con_unequal'),
                        childrenType: 'department'
                    },
                    {
                        value: 12,
                        label: '为空',
                        childrenType: 'null'
                    },
                    {
                        value: 13,
                        label: '不为空',
                        childrenType: 'nnull'
                    }
                ],
                userSelect: [
                    {
                        value: 1,
                        label: this.$t('crm.Table.con_equal'),
                        childrenType: 'userSelect'
                    },
                    {
                        value: 8,
                        label: this.$t('crm.Table.con_unequal'),
                        childrenType: 'userSelect'
                    },
                    {
                        value: 12,
                        label: '为空',
                        childrenType: 'null'
                    },
                    {
                        value: 13,
                        label: '不为空',
                        childrenType: 'nnull'
                    }
                ],
                MultSelectSpecial: [
                    {
                        value: 12,
                        label: '为空',
                        childrenType: 'null'
                    },
                    {
                        value: 13,
                        label: '不为空',
                        childrenType: 'nnull'
                    }
                ],
                // 是否、男女选项
                boolean: [
                    {
                        value: 1,
                        label: this.$t('crm.Table.con_equal'),
                        childrenType: 'booleanSelect'
                    },
                    {
                        value: 8,
                        label: this.$t('crm.Table.con_unequal'),
                        childrenType: 'booleanSelect'
                    }
                ],
                // 人员多选
                MultSelectUser: [
                    {
                        value: '$eq',
                        label: this.$t('crm.Table.con_equal'),
                        childrenType: 'array'
                    },
                    {
                        value: '$ne',
                        label: this.$t('crm.Table.con_unequal'),
                        childrenType: 'array'
                    },
                    {
                        value: '$regex',
                        label: '包含任意',
                        childrenType: 'array'
                    },
                    {
                        value: '$nregex',
                        label: '不包含任意',
                        childrenType: 'array'
                    },
                    {
                        value: '$andregex',
                        label: '包含全部',
                        childrenType: 'array'
                    },
                    {
                        value: '$andnregex',
                        label: '不包含全部',
                        childrenType: 'array'
                    },
                    {
                        value: '$null',
                        label: '为空',
                        childrenType: 'null'
                    },
                    {
                        value: '$nnull',
                        label: '不为空',
                        childrenType: 'nnull'
                    }
                ],
                MultSelect: [
                    
                ],
                // 数字
                number: [
                    {
                        value: 12,
                        label: '为空',
                        childrenType: 'null'
                    },
                    {
                        value: 13,
                        label: '不为空',
                        childrenType: 'nnull'
                    },
                    // 等于
                    {
                        value: 1,
                        label: this.$t('crm.Table.con_equal'),
                        childrenType: 'number'
                    },
                    // 不等于
                    {
                        value: 8,
                        label: this.$t('crm.Table.con_unequal'),
                        childrenType: 'number'
                    },
                    {
                        value: 11,
                        label: '范围',
                        childrenType: 'numberRange'
                    },
                    // 大于
                    {
                        value: 6,
                        label: this.$t('crm.Table.con_greaterThan'),
                        childrenType: 'number'
                    },
                    // 大于等于
                    {
                        value: 7,
                        label: this.$t('crm.Table.con_greaterOrEqual'),
                        childrenType: 'number'
                    },
                    // 小于
                    {
                        value: 4,
                        label: this.$t('crm.Table.con_lessThan'),
                        childrenType: 'number'
                    },
                    // 小于等于
                    {
                        value: 5,
                        label: this.$t('crm.Table.con_lessOrEqual'),
                        childrenType: 'number'
                    }
                ],
                // 日期
                date: [
                    {
                        value: 12,
                        label: '为空',
                        childrenType: 'null'
                    },
                    {
                        value: 13,
                        label: '不为空',
                        childrenType: 'nnull'
                    },
                    // 等于
                    {
                        value: 1,
                        label: this.$t('crm.Table.con_equal'),
                        childrenType: 'date'
                    },
                    // 不等于
                    {
                        value: 8,
                        label: this.$t('crm.Table.con_unequal'),
                        childrenType: 'date'
                    },
                    {
                        value: 11,
                        label: '范围',
                        childrenType: 'dateRange'
                    },
                    // 大于
                    {
                        value: 6,
                        label: this.$t('crm.Table.con_greaterThan'),
                        childrenType: 'date'
                    },
                    // 大于等于
                    {
                        value: 7,
                        label: this.$t('crm.Table.con_greaterOrEqual'),
                        childrenType: 'date'
                    },
                    // 小于
                    {
                        value: 4,
                        label: this.$t('crm.Table.con_lessThan'),
                        childrenType: 'date'
                    },
                    // 小于等于
                    {
                        value: 5,
                        label: this.$t('crm.Table.con_lessOrEqual'),
                        childrenType: 'date'
                    }
                ],
                // 时间+日期
                dataTime: [
                    {
                        value: 12,
                        label: '为空',
                        childrenType: 'null'
                    },
                    {
                        value: 13,
                        label: '不为空',
                        childrenType: 'nnull'
                    },
                    // 等于
                    {
                        value: 1,
                        label: this.$t('crm.Table.con_equal'),
                        childrenType: 'dateTime'
                    },
                    // 不等于
                    {
                        value: 8,
                        label: this.$t('crm.Table.con_unequal'),
                        childrenType: 'dateTime'
                    },
                    {
                        value: 11,
                        label: '范围',
                        childrenType: 'dateTimeRange'
                    },
                    // 大于
                    {
                        value: 6,
                        label: this.$t('crm.Table.con_greaterThan'),
                        childrenType: 'dateTime'
                    },
                    // 大于等于
                    {
                        value: 7,
                        label: this.$t('crm.Table.con_greaterOrEqual'),
                        childrenType: 'dateTime'
                    },
                    // 小于
                    {
                        value: 4,
                        label: this.$t('crm.Table.con_lessThan'),
                        childrenType: 'dateTime'
                    },
                    // 小于等于
                    {
                        value: 5,
                        label: this.$t('crm.Table.con_lessOrEqual'),
                        childrenType: 'dateTime'
                    }
                ],
                contrySelect: [
                    {
                        value: '$eq',
                        label: this.$t('crm.Table.con_include'),
                        childrenType: 'countryArea'
                    },
                    {
                        value: '$ne',
                        label: this.$t('crm.Table.con_exclude'),
                        childrenType: 'countryArea'
                    },
                    // {
                    //     value: '$in',
                    //     label: '等于任意',
                    //     childrenType: 'countryArea'
                    // },
                    // {
                    //     value: '$nin',
                    //     label: '不等于任意',
                    //     childrenType: 'countryArea'
                    // },
                    {
                        value: '$null',
                        label: '为空',
                        childrenType: 'null'
                    },
                    {
                        value: '$nnull',
                        label: '不为空',
                        childrenType: 'nnull'
                    }
                ],
                // 公海规则、公海分组处的国家地区筛选值
                settingContrySelect: [
                    {
                        value: '$eq',
                        label: this.$t('crm.Table.con_equal'),
                        childrenType: 'countryArea'
                    },
                    {
                        value: '$ne',
                        label: this.$t('crm.Table.con_unequal'),
                        childrenType: 'countryArea'
                    },
                    {
                        value: '$in',
                        label: this.$t('highSeasSetting.equalToAny'),
                        childrenType: 'countryArea'
                    },
                    {
                        value: '$nin',
                        label: this.$t('highSeasSetting.notEqualToAny'),
                        childrenType: 'countryArea'
                    },
                    {
                        value: '$null',
                        label: '为空',
                        childrenType: 'null'
                    },
                    {
                        value: '$nnull',
                        label: '不为空',
                        childrenType: 'nnull'
                    }
                ],
                // 部门选项
                departmentSelect: [
                    // {
                    //     value: '$eq',
                    //     label: this.$t('crm.Table.con_equal'),
                    //     childrenType: 'department'
                    // },
                    // {
                    //     value: '$ne',
                    //     label: this.$t('crm.Table.con_unequal'),
                    //     childrenType: 'department'
                    // },
                    {
                        value: '$regex',
                        label: '包含任意',
                        childrenType: 'department'
                    },
                    {
                        value: '$nregex',
                        label: '不包含任意',
                        childrenType: 'department'
                    },
                    {
                        value: '$andregex',
                        label: '包含全部',
                        childrenType: 'department'
                    },
                    {
                        value: '$andnregex',
                        label: '不包含全部',
                        childrenType: 'department'
                    },
                    {
                        value: '$null',
                        label: '为空',
                        childrenType: 'null'
                    },
                    {
                        value: '$nnull',
                        label: '不为空',
                        childrenType: 'nnull'
                    }
                ]
            }
        };
    }
};
