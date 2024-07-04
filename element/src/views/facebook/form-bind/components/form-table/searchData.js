export default {
    /* 列表字段 */
    tableCol: [
        {title: '序号', key: 'index', width: 60, align: 'center'},
        {
            title: '所属品牌专页',
            key: 'brandMajorName',
            sortable: true,
            align: 'center'
        },
        {title: '表单名称', key: 'formName', align: 'center', width: 200},
        {title: '潜在客户', key: 'leadsCount', align: 'center', sortable: true},
        {
            title: '创建时间',
            key: 'displayTime',
            align: 'center',
            width: 160
        },
        {title: '状态', key: 'formUseState', align: 'center'}
    ],
    /* 第一个选择器选项 */
    conditionList1: [
        {value: '所属品牌专页', label: '所属品牌专页', type: 'input'},
        {value: '表单名称', label: '表单名称', type: 'input'},
        {value: '潜在客户', label: '潜在客户', type: 'input'},
        {value: '创建时间', label: '创建时间', type: 'input'},
        {value: '状态', label: '状态', type: 'input'}
    ],
    /* 第二个选择器选项 */
    conditionList2: [
        {value: '等于', label: '等于', id: 1, type: 'input'},
        {value: '不等于', label: '不等于', id: 2, type: 'input'},
        {value: '包含', label: '包含', id: 3, type: 'input'},
        {value: '不包含', label: '不包含', id: 4, type: 'input'}
    ],
    options: {
        shortcuts: [
            {
                text: '今天',
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    picker.$emit('pick', [start, end]);
                }
            },
            {
                text: '昨天',
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24);
                    end.setTime(end.getTime() - 3600 * 1000 * 24);
                    picker.$emit('pick', [start, end]);
                }
            },
            {
                text: '本周',
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
                text: '上周',
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
                text: '本月',
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(new Date(start.getFullYear(), start.getMonth(), 1).getTime());
                    picker.$emit('pick', [start, end]);
                }
            },
            {
                text: '上月',
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() -
                        24 * 60 * 60 * 1000);
                    start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                    picker.$emit('pick', [start, end]);
                }
            }
        ],
        disabledDate(date) {
            return date.valueOf() > Date.now();
        }
    },
    /* 字段条件组合 */
    conditionGroup(con1, con2, con3) {
        switch (con1) {
            case '所属品牌专页':
                return this.keysearch('brandMajorName', con2, con3);
                break;
            case '表单名称':
                return this.keysearch('formName', con2, con3);
                break;
            case '潜在客户':
                return this.numSearch('leadsCount', con2, con3);
                break;
            case '创建时间':
                return this.timesearch('formCreateTime', con2, con3);
                break;
            case '状态':
                return this.keysearch('formUseState', con2, con3);
                break;
            default:
                break;
        }
    },
    /* 对比条件是字符串 */
    keysearch(key, con2, con3) {
        switch (con2) {
            case '包含':
                return {
                    name: key,
                    operate: 'like',
                    type: '1',
                    value: con3.trim()
                };
                break;
            default:
                break;
        }
    },
    /* 对比条件是时间 */
    timesearch(key, con2, con3) {
        return {
            name: key,
            type: '3',
            dateRange: con3
        };
    },
    /* 对比条件是数字 */
    numSearch(key, con2, con3) {
        switch (con2) {
            case '小于':
                return {
                    name: key,
                    operate: '<',
                    type: '2',
                    value: con3
                };
                break;
            case '小于等于':
                return {
                    name: key,
                    operate: '<=',
                    type: '2',
                    value: con3
                };
                break;
            case '等于':
                return {
                    name: key,
                    operate: '=',
                    type: '2',
                    value: con3
                };
                break;
            case '大于等于':
                return {
                    name: key,
                    operate: '>=',
                    type: '2',
                    value: con3
                };
                break;
            case '大于':
                return {
                    name: key,
                    operate: '>',
                    type: '2',
                    value: con3
                };
                break;
            default:
                break;
        }
    },
    changeCon1(condition1) {
        let conditionList2 = [
            {
                value: '包含',
                label: '包含'
            }
        ];
        let inputType = 'string';
        switch (condition1) {
            // 数字
            case '潜在客户':
                conditionList2 = [
                    {
                        value: '小于等于',
                        label: '小于等于'
                    },
                    {
                        value: '大于等于',
                        label: '大于等于'
                    }
                ];
                inputType = 'number';
                break;
            // 时间类
            case '创建时间':
                conditionList2 = [
                    {
                        value: '等于',
                        label: '等于'
                    }
                ];
                inputType = 'date';
                break;
            // 字符串
            case '所属品牌专页':
            case '表单名称':
            case '状态':
            default:
                break;
        }
        return {
            conditionList2, inputType
        };
    }
};
