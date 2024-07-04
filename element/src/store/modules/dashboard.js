const dashboard = {
    state: {
        config: [],
        isConfiguring: false,
        isShowAddModal: false,
        is_refrash_task_list: false,
        filterParameters: {
            completion: {
                currentCurrency: 'CNY',
                levelType: 'person', // 部门/用户
                targetType: 1,
                viewType: 'progressView',
                userIdList: [],
                departmentId: '',
                dateRange: [new Date(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-01`).getTime(), new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getTime()]
            },
            focusedInquiry: {
                currentCurrency: 'CNY',
                levelType: 'person',
                targetType: 1,
                viewType: 'progressView',
                userIdList: [],
                departmentId: '',
                dateRange: [(new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)).getTime(), (new Date()).getTime()]
            },
            employeeResources: {
                currentCurrency: 'CNY',
                levelType: 'person',
                targetType: 1,
                viewType: 'progressView',
                userIdList: [],
                departmentId: '',
                dateRange: [(new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)).getTime(), (new Date()).getTime()]
            },
            // 员工待办事项筛选项配置
            todoList: {
                // currentCurrency: 'CNY',
                levelType: 'person',
                targetType: 1,
                viewType: 'progressView',
                userIdList: [],
                departmentId: '',
                dateRange: [(new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)).getTime(), (new Date()).getTime()]
            },
            // 线索分布筛选项配置
            clueDistribution: {
                levelType: 'person',
                targetType: 1,
                viewType: 'progressView',
                userIdList: [],
                departmentId: '',
                typeId: 3, // 数据维度
                dateRange: [(new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)).getTime(), (new Date()).getTime()]
            },
            // 询盘分布筛选项配置
            inquiryDistribution: {
                levelType: 'person',
                targetType: 1,
                viewType: 'progressView',
                userIdList: [],
                departmentId: '',
                typeId: 7,
                dateRange: [(new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)).getTime(), (new Date()).getTime()]
            },
            // 客户分布筛选项配置
            companyDistribution: {
                levelType: 'person',
                targetType: 1,
                viewType: 'progressView',
                userIdList: [],
                departmentId: '',
                typeId: 2,
                dateRange: [(new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)).getTime(), (new Date()).getTime()]
            },
            // 网站流量情况
            websiteTrafficStatus: {
                levelType: null,
                targetType: null,
                viewType: null,
                userIdList: [],
                departmentId: '',
                timeUnit: 'date',
                dateRange: [(new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)).getTime(), (new Date()).getTime()],
                siteId: ''
            },
            // 访客分析
            visitorAnalysis: {
                levelType: null,
                targetType: null,
                viewType: null,
                userIdList: [],
                departmentId: '',
                typeId: 'trafficSourceMerge',
                childFilterVal: '',
                dateRange: [(new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)).getTime(), (new Date()).getTime()],
                siteId: '',
                defaultSort: { prop: 'visitorCount', order: 'descending' }
            },
            // 访问人次分析
            visitTrafficAnalysis: {
                levelType: null,
                targetType: null,
                viewType: null,
                userIdList: [],
                departmentId: '',
                typeId: 'trafficSourceMerge',
                childFilterVal: '',
                dateRange: [(new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)).getTime(), (new Date()).getTime()],
                siteId: '',
                defaultSort: { prop: 'docCount', order: 'descending' }
            },
            // 留言状态统计
            msgStatusStatistics: {
                levelType: null,
                targetType: null,
                viewType: null,
                userIdList: [],
                departmentId: '',
                typeId: 2,
                dateRange: [(new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)).getTime(), (new Date()).getTime()]
            },
            // 留言页面情况
            msgPageStatus: {
                levelType: null,
                targetType: null,
                viewType: null,
                userIdList: [],
                departmentId: '',
                typeId: 2,
                dateRange: [(new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)).getTime(), (new Date()).getTime()],
                formId: ''
            },
            // 客服工作情况
            serviceWorkStatus: {
                levelType: null,
                targetType: null,
                viewType: null,
                userIdList: [],
                departmentId: '',
                typeId: 2,
                dateRange: [(new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)).getTime(), (new Date()).getTime()],
                serviceId: '',
                firstDimension: 'csId',
                secondDimension: false
            },
            googleMarketing: {
                currentCurrency: 'CNY',
                levelType: 'person',
                targetType: 1,
                viewType: 'echart',
                campaignId: '',
                userIdList: [],
                customerId: '',
                // departmentId: '',
                dateRange: [(new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)).getTime(), (new Date()).getTime()]
            }
        },
        button_ids: {
            // 录入询盘
            googleMarketing: {
                development: 11144,
                production: 11144
            }
        }
    },
    mutations: {
        setConfig(state, data) {
            state.config = data;
            // 每次获取完成之后 生成对应的activeList 来给弹窗用
        },
        toggleConfigure(state, data) {
            state.isConfiguring = data;
        },
        toggleShowAddModal(state, data) {
            state.isShowAddModal = data;
        },
        setIsRefrashTaskList(state, data) {
            state.is_refrash_task_list = data;
        },
        setFilterParameters(state, data) {
            state.is_refrash_task_list = data;
        }
    }
};
export default dashboard;
