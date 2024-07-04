// 指定此对象字段的数据类型，包含:
// 1-普通文本(300以内), 
// 2-文本域(65535以内), 
// 3-电话, 
// 4-邮箱, 
// 5-网址, 
// 6-文件类型, 
// 7-图片类型, 
// 8-货币-单币种, 
// 9-货币-多币种, 
// 10-布尔类型, 
// 11-整数, 
// 12-自动编号, 
// 13-实数, 
// 14-百分比类型, 
// 15-计算类型之文本, 
// 16-计算类型之实数,
// 17-计算类型之汇总累计实数,
// 18-计算类型之百分比,
// 19-计算类型之本币种,
// 20-计算类型之布尔,
// 21-计算类型之日期,
// 22-计算类型之日期时间,
// 23-日期, 
// 24-日期+时间, 
// 25-单选框, 
// 26-多选框, 
// 27-地理定位, 
// 28-一般关系(look up),只会展示对应业务对象的名称, 
// 29-主子关系(master-detail), 
// 30-引用数据,可以自定义要展示哪个字段
// 32-汇总累计日期时间
// 31-汇总累计日期
// 33-多态关联
export const config = {
    // 文本&电话&邮箱&网址&自动编号'text&phone&email&website&autoNumber&计算类型之文本'
    '1&3&4&5&12&15': [
        {value: 12, label: '为空', childrenType: []},
        {value: 13, label: '不为空', childrenType: []},
        { value: 2, label: '包含', childrenType: [
            {value: 1, label: '值'}
        ] },
        {value: 14, label: '不包含', childrenType: [
            {value: 1, label: '值'}
        ]},
        { value: 1, label: '等于', childrenType: [
            {value: 1, label: '值'},
            {value: 0, label: '字段'}
        ]},
        { value: 8, label: '不等于', childrenType: [
            {value: 1, label: '值'},
            {value: 0, label: '字段'}
        ]}
    ],
    // 文本域
    '2': [
        { value: 1, label: '等于', childrenType: [
            {value: 1, label: '值'}
        ] },
        { value: 8, label: '不等于', childrenType: [
            {value: 1, label: '值'}
        ] },
        { value: 2, label: '包含', childrenType: [
            {value: 1, label: '值'}
        ] },
        {value: 14, label: '不包含', childrenType: [
            {value: 1, label: '值'}
        ]},
        {value: 12, label: '为空', childrenType: []},
        {value: 13, label: '不为空', childrenType: []}
    ],
    // 地理位置
    '27': [
        {value: 12, label: '为空', childrenType: []},
        {value: 13, label: '不为空', childrenType: []}
    ],
    // 单选select
    '25': [
        {value: 1, label: '等于', childrenType: [
            {value: 1, label: '值'},
            {value: 0, label: '字段'}
        ]},
        {value: 8, label: '不等于', childrenType: [
            {value: 1, label: '值'},
            {value: 0, label: '字段'}
        ]},
        {value: 9, label: '等于任意', childrenType: [
            {value: 1, label: '值'}
        ]},
        {value: 10, label: '不等于任意', childrenType: [
            {value: 1, label: '值'}
        ]},
        {value: 12, label: '为空', childrenType: []},
        {value: 13, label: '不为空', childrenType: []}
    ],
    // 多选MultSelect
    '26': [
        {value: 12, label: '为空', childrenType: []},
        {value: 13, label: '不为空', childrenType: []}
        // {value: 1, label: '等于', childrenType: [
        //     {value: 1, label: '值'},
        //     {value: 0, label: '字段'}
        // ]},
        // {value: 8, label: '不等于', childrenType: [
        //     {value: 1, label: '值'},
        //     {value: 0, label: '字段'}
        // ]},
        // {value: '$in', label: '包含任意', childrenType: [
        //     {value: 1, label: '值'}
        // ]},
        // {value: '$nin', label: '不包含任意', childrenType: [
        //     {value: 1, label: '值'}
        // ]},
        // {value: '$inall', label: '包含全部', childrenType: [
        //     {value: 1, label: '值'}
        // ]},
        // {value: '$ninall', label: '不包含全部', childrenType: [
        //     {value: 1, label: '值'}
        // ]}
    ],
    // 整数&实数&货币-本币种&货币-多币种-数值&日期&日期时间&百分比&计算类型-日期&计算类型之实数
    // 'number&realNumber&currency&currencyValue&date&dateRange&percentage'
    '11&13&8&9&23&24&14&21&16&18&19&22&17&31&32&17&31&32': [
        { value: 12, label: '为空', childrenType: [] },
        { value: 13, label: '不为空', childrenType: []},
        // 等于
        { value: 1, label: '等于', childrenType: [
            {value: 1, label: '值'},
            {value: 0, label: '字段'}
        ]},
        // 不等于
        {value: 8, label: '不等于', childrenType: [
            {value: 1, label: '值'},
            {value: 0, label: '字段'}
        ]},
        { value: 11, label: '范围', childrenType: [
            {value: 1, label: '值'}
        ]},
        // 大于
        {value: 6, label: '大于', childrenType: [
            {value: 1, label: '值'},
            {value: 0, label: '字段'}
        ]},
        // 大于等于
        {value: 7, label: '大于等于', childrenType: [
            {value: 1, label: '值'},
            {value: 0, label: '字段'}
        ]},
        // 小于
        {value: 4, label: '小于', childrenType: [
            {value: 1, label: '值'},
            {value: 0, label: '字段'}
        ]},
        // 小于等于
        { value: 5, label: '小于等于', childrenType: [
            {value: 1, label: '值'},
            {value: 0, label: '字段'}
        ]}
    ],
    // // 货币-多币种-币种
    // 'multSelectCurrency': [
    //     { value: 12, label: '为空', childrenType: [] },
    //     { value: 13, label: '不为空', childrenType: []},
    //     // 等于
    //     { value: 1, label: '等于', childrenType: [
    //         {value: 1, label: '值'},
    //         {value: 0, label: '字段'}
    //     ] },
    //     // 不等于
    //     {value: 8, label: '不等于', childrenType: [
    //         {value: 1, label: '值'},
    //         {value: 0, label: '字段'}
    //     ]},
    //     {value: 9, label: '等于任意', childrenType: [
    //         {value: 1, label: '值'}
    //     ]},
    //     { value: 10, label: '不等于任意', childrenType: [
    //         {value: 1, label: '值'}
    //     ]}
    // ],
    // 关联关系
    '28&29': [
        { value: 1, label: '等于', childrenType: [
            {value: 0, label: '字段'}
        ]},
        {value: 8, label: '不等于', childrenType: [
            {value: 0, label: '字段'}
        ]},
        {value: 12, label: '为空', childrenType: []},
        {value: 13, label: '不为空', childrenType: []}
    ],
    // 关联关系(选择的关联关系字段，关联对象是成员/部门时额外支持)
    'specialLassociation': [
        {value: 1, label: '等于', childrenType: [
            {value: 0, label: '字段'}
        ]},
        {value: 8, label: '不等于', childrenType: [
            {value: 0, label: '字段'}
        ] }
    ],
    // 关联关系(选择成员/部门对象的字段时额外支持)
    'specialLassociationTwo': [
        {value: 1, label: '等于', childrenType: [
            {value: 1, label: '值'},
            {value: 0, label: '字段'}
        ]},
        {value: 8, label: '不等于', childrenType: [
            {value: 1, label: '值'},
            {value: 0, label: '字段'}
        ] }
    ],
    // 布尔类型
    '10&20': [
        {value: 1, label: '等于', childrenType: [
            {value: 1, label: '值'},
            {value: 0, label: '字段'}
        ]},
        {value: 8, label: '不等于', childrenType: [
            {value: 1, label: '值'},
            {value: 0, label: '字段'}
        ]}
    ]
};

export const valueInputType = {
    // 文本&电话&邮箱&网址&自动编号'text&phone&email&website&autoNumber'
    '1&3&4&5&12&15': {
        // 包含
        2: { 1: 'text' },
        // 不包含
        14: { 1: 'text' },
        // 等于
        1: { 1: 'text', 0: 'fieldsSelector'},
        // 不等于
        8: { 1: 'text', 0: 'fieldsSelector' }
    },
    // 文本域
    '2&27': {
        // 包含
        2: { 1: 'text' },
        // 不包含
        14: { 1: 'text' },
        // 等于
        1: { 1: 'text' },
        // 不等于
        8: { 1: 'text' }
    },
    // 单选select
    '25': {
        // 等于任意
        9: { 1: 'multSelect' },
        // 不等于任意
        10: { 1: 'multSelect' },
        // 等于
        1: { 1: 'select', 0: 'fieldsSelector' },
        // 不等于
        8: { 1: 'select', 0: 'fieldsSelector' }
    },
    // 多选MultSelect
    '26': {
        // 包含全部
        '$inall': { 1: 'multSelect' },
        // 不包含全部
        '$ninall': { 1: 'multSelect' },
        // 包含任意
        '$in': { 1: 'multSelect' },
        // 不包含任意
        '$nin': { 1: 'multSelect' },
        // 等于
        1: { 1: 'multSelect', 0: 'fieldsSelector' },
        // 不等于
        8: { 1: 'multSelect', 0: 'fieldsSelector' }
    },
    // 整数&实数&货币-本币种&货币-多币种-数值&日期&日期时间&百分比
    // 'number&realNumber&currency&currencyValue&date&dateRange&percentage'
    // '11&13&8&9&23&24&14'
    // 整数
    '11': {
        // 等于
        1: { 1: 'number', 0: 'fieldsSelector' },
        // 不等于
        8: { 1: 'number', 0: 'fieldsSelector' },
        // 范围
        11: { 1: 'numberRange' },
        // 大于
        6: { 1: 'number', 0: 'fieldsSelector' },
        // 大于等于
        7: { 1: 'number', 0: 'fieldsSelector' },
        // 小于
        4: { 1: 'number', 0: 'fieldsSelector' },
        // 小于等于
        5: { 1: 'number', 0: 'fieldsSelector' }
    },
    // 实数&货币-本币种&货币-多币种-数值&百分比
    '13&8&9&14&16&18&19&17': {
        // 等于
        1: { 1: 'numberStep', 0: 'fieldsSelector' },
        // 不等于
        8: { 1: 'numberStep', 0: 'fieldsSelector' },
        // 范围
        11: { 1: 'numberStepRange' },
        // 大于
        6: { 1: 'numberStep', 0: 'fieldsSelector' },
        // 大于等于
        7: { 1: 'numberStep', 0: 'fieldsSelector' },
        // 小于
        4: { 1: 'numberStep', 0: 'fieldsSelector' },
        // 小于等于
        5: { 1: 'numberStep', 0: 'fieldsSelector' }
    },
    // 日期
    '23&21&31': {
        // 等于
        1: { 1: 'date', 0: 'fieldsSelector' },
        // 不等于
        8: { 1: 'date', 0: 'fieldsSelector' },
        // 范围
        11: { 1: 'dateRange' },
        // 大于
        6: { 1: 'date', 0: 'fieldsSelector' },
        // 大于等于
        7: { 1: 'date', 0: 'fieldsSelector' },
        // 小于
        4: { 1: 'date', 0: 'fieldsSelector' },
        // 小于等于
        5: { 1: 'date', 0: 'fieldsSelector' }
    },
    // 日期时间
    '22&24&32': {
        // 等于
        1: { 1: 'datetime', 0: 'fieldsSelector' },
        // 不等于
        8: { 1: 'datetime', 0: 'fieldsSelector' },
        // 范围
        11: { 1: 'datetimerange' },
        // 大于
        6: { 1: 'datetime', 0: 'fieldsSelector' },
        // 大于等于
        7: { 1: 'datetime', 0: 'fieldsSelector' },
        // 小于
        4: { 1: 'datetime', 0: 'fieldsSelector' },
        // 小于等于
        5: { 1: 'datetime', 0: 'fieldsSelector' }
    },
    // // 货币-多币种-币种
    // 'multSelectCurrency': [
    //     { value: 12, label: '为空', childrenType: [] },
    //     { value: 13, label: '不为空', childrenType: []},
    //     // 等于
    //     { value: 1, label: '等于', childrenType: [
    //         {value: 1, label: '值'},
    //         {value: 0, label: '字段'}
    //     ] },
    //     // 不等于
    //     {value: 8, label: '不等于', childrenType: [
    //         {value: 1, label: '值'},
    //         {value: 0, label: '字段'}
    //     ]},
    //     {value: 9, label: '等于任意', childrenType: [
    //         {value: 1, label: '值'}
    //     ]},
    //     { value: 10, label: '不等于任意', childrenType: [
    //         {value: 1, label: '值'}
    //     ]}
    // ],
    // 关联关系
    '28&29': {
        // 等于
        1: { 1: 'searchselect', 0: 'fieldsSelector' },
        // 不等于
        8: { 1: 'searchselect', 0: 'fieldsSelector' }
    },
    // 关联关系(选择的关联关系字段，关联对象是成员/部门时额外支持)
    'specialLassociation': [
        {value: 1, label: '等于', childrenType: [
            {value: 0, label: '字段'}
        ]},
        {value: 8, label: '不等于', childrenType: [
            {value: 0, label: '字段'}
        ] }
    ],
    // 关联关系(选择成员/部门对象的字段时额外支持)
    'specialLassociationTwo': [
        {value: 1, label: '等于', childrenType: [
            {value: 1, label: '值'},
            {value: 0, label: '字段'}
        ]},
        {value: 8, label: '不等于', childrenType: [
            {value: 1, label: '值'},
            {value: 0, label: '字段'}
        ] }
    ],
    // 布尔类型
    '10&20': {
        // 等于
        1: { 1: 'boolean', 0: 'fieldsSelector' },
        // 不等于
        8: { 1: 'boolean', 0: 'fieldsSelector' }
    }
};
export const rangeFieldsType = {
    // 文本&电话&网址&自动编号&计算公式_文本
    '1&3&5&12&15': [
        {id: 1, label: '精准匹配'},
        {id: 2, label: '模糊匹配'}
    ],
    // 邮箱
    '4': [
        {id: 1, label: '精准匹配'},
        {id: 2, label: '模糊匹配'},
        {id: 3, label: '后缀匹配'}
    ],
    // 整数&实数&货币&百分比&计算公式_数值&计算公式_货币&计算公式_百分比&计算公式_汇总累计&日期计算公式_日期&日期+时间&计算类型之日期时间&单选&多选&布尔型&关联关系&主子明细
    '11&13&8&9&14&16&19&18&17&21&24&22&23&25&26&10&28&29&31&32': [
        {id: 1, label: '精准匹配'}
    ]
};

// 字段名称对应配置
export const fieldsNamesMap = {
    1: '文本',
    2: '文本域',
    3: '电话',
    4: '邮箱',
    5: '网址',
    6: '文档',
    7: '图片',
    8: '货币-单币种',
    9: '货币-多币种',
    10: '布尔型',
    11: '整数',
    12: '自动编号',
    13: '实数',
    14: '百分比',
    15: '计算类型之文本',
    16: '计算类型之数字',
    17: '计算类型之汇总累计',
    18: '计算类型之百分比',
    19: '计算类型之本币种',
    20: '计算类型之布尔',
    21: '计算类型之日期',
    22: '计算类型之日期时间',
    23: '日期',
    24: '日期+时间',
    25: '单选',
    26: '多选',
    27: '地理定位',
    28: '关联关系',
    29: '主子关系',
    30: '引用数据',
    31: '计算类型之汇总累计',
    32: '计算类型之汇总累计',
    33: '多态关联'
};

// 字段类型对应配置
export const dataTypeMap = {
    1: 'input',
    2: 'input',
    3: 'input',
    4: 'input',
    5: 'input',
    // 6: 'input',
    // 7: 'input',
    8: 'inputnumber',
    9: 'inputnumber',
    10: 'select',
    11: 'inputnumber',
    12: 'input',
    13: 'inputnumber',
    14: 'inputnumber',
    15: 'input',
    16: 'inputnumber',
    17: 'inputnumber',
    18: 'inputnumber',
    19: 'inputnumber',
    20: 'select',
    21: 'daterange',
    22: 'datetimerange',
    23: 'daterange',
    24: 'datetimerange',
    25: 'select',
    // 26: 'select',
    // 27: '地理定位',
    28: 'select',
    29: 'select',
    // 30: 'input',
    31: 'daterange',
    32: 'daterange'
};