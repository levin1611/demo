const clue = {
    state: {
        clue_scroll_left: 0, /* 表格的滚动条位置 */
        clue_scroll_top: 0,
        fieldIndex: {
            a1001: {
                sourceKey: 'companyName',
                sourceLabel: '公司名称',
                sourceType: 1
            },
            a1002: {
                sourceKey: 'mainProduct',
                sourceLabel: '主营产品',
                sourceType: 1
            },
            a1003: {
                sourceKey: 'countryArea',
                sourceLabel: '国家地区',
                sourceType: 1
            },
            a1004: {
                sourceKey: 'homePage',
                sourceLabel: '公司网址',
                sourceType: 1
            },
            a1005: {
                sourceKey: 'fax',
                sourceLabel: '传真',
                sourceType: 1
            },
            a1006: {
                sourceKey: 'phone',
                sourceLabel: '座机',
                sourceType: 1
            },
            a1007: {
                sourceKey: 'contactAddress',
                sourceLabel: '联系地址',
                sourceType: 1
            },
            a1008: {
                sourceKey: 'companyRemark',
                sourceLabel: '备注',
                sourceType: 1
            },
            a1009: {
                sourceKey: 'nickName',
                sourceLabel: '姓名',
                sourceType: 2
            },
            a10010: {
                sourceKey: 'email',
                sourceLabel: '邮箱',
                sourceType: 2
            },
            a10011: {
                sourceKey: 'jobTitle',
                sourceLabel: '职位',
                sourceType: 2
            },
            a10012: {
                sourceKey: 'phone',
                sourceLabel: '电话',
                sourceType: 2
            },
            a10013: {
                sourceKey: 'socialNetworkingPlatform',
                sourceLabel: '社交平台',
                sourceType: 2
            },
            a10014: {
                sourceKey: 'gender',
                sourceLabel: '性别',
                sourceType: 2
            },
            a10015: {
                sourceKey: 'remark',
                sourceLabel: '联系人备注',
                sourceType: 2
            },
            a10016: {
                sourceKey: 'demandProducts',
                sourceLabel: '需求产品',
                sourceType: 3
            },
            a10017: {
                sourceKey: 'label',
                sourceLabel: '标签',
                sourceType: 3
            },
            a10018: {
                sourceKey: 'productCategory',
                sourceLabel: '产品分类',
                sourceType: 3
            },
            a10019: {
                sourceKey: 'sourceChannel',
                sourceLabel: '来源渠道',
                sourceType: 3
            },
            a10020: {
                sourceKey: 'sourceWay',
                sourceLabel: '来源方式',
                sourceType: 3
            },
            a10021: {
                sourceKey: 'remark',
                sourceLabel: '需求备注',
                sourceType: 3
            },
            a10052: {
                sourceKey: 'whatsApp',
                sourceLabel: 'whatsApp',
                sourceType: 2
            },
            a10053: {
                sourceKey: 'instagram',
                sourceLabel: 'Instagram',
                sourceType: 2
            },
            a10055: {
                sourceKey: 'clientType',
                sourceLabel: '客户类型',
                sourceType: 1
            },
            a10056: {
                sourceKey: 'companySourceWay',
                sourceLabel: '客户来源',
                sourceType: 1
            }
        },
        listType: ''
    },
    mutations: {
        setScrollLeft(state, data) {
            state.clue_scroll_left = data;
        },
        setScrollTop(state, data) {
            state.clue_scroll_top = data;
        },
        setListType(state, data) {
            state.listType = data;
        }
    }
};
export default clue;
