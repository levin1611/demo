
// 存放翻译语种等翻译相关内容
export default {
    data() {
        return {
            tableHeader: {
                completion: {
                    personTableColumns: [
                        // { key: 'firstDepartmentName', title: this.$t('dashBoardV2.Select.department'), align: 'left', width: '' },
                        { key: 'userName', title: this.$t('dashBoardV2.Table.charger'), align: 'left', width: '' },
                        { key: 'targetValue', title: this.$t('dashBoardV2.Table.target'), align: 'left', width: '' },
                        { key: 'completed', title: this.$t('dashBoardV2.Table.accomplished'), align: 'left', width: '' },
                        { key: 'undone', title: this.$t('dashBoardV2.Table.unaccomplished'), align: 'left', width: '' },
                        { key: 'completedRate', title: this.$t('dashBoardV2.Table.accomplishRate'), align: 'left', width: '' }
                    ],
                    departmentTableColumns: [
                        { key: 'firstDepartmentName', title: this.$t('dashBoardV2.Select.department'), align: 'left', width: '' },
                        { key: 'targetValue', title: this.$t('dashBoardV2.Table.target'), align: 'left', width: '' },
                        { key: 'completed', title: this.$t('dashBoardV2.Table.accomplished'), align: 'left', width: '' },
                        { key: 'undone', title: this.$t('dashBoardV2.Table.unaccomplished'), align: 'left', width: '' },
                        { key: 'completedRate', title: this.$t('dashBoardV2.Table.accomplishRate'), align: 'left', width: '' }
                    ]
                },
                focusedInquiry: {
                    personTableColumns: [
                        // { key: 'firstDepartmentName', title: this.$t('dashBoardV2.Select.department'), align: 'left', width: '' },
                        { key: 'fullname', title: this.$t('dashBoardV2.Table.charger'), align: 'left', width: '' },
                        { key: 'inquiryCount', title: this.$t('dashBoardV2.Table.unfilledInquiries'), align: 'left', width: '' },
                        { key: 'estimatedInquiryAmount', title: this.$t('dashBoardV2.dataOverview.inq_estimatedInquiryAmount'), align: 'left', width: '' },
                        { key: 'inquiryTransactionCount', title: this.$t('dashBoardV2.Table.completedInquiry'), align: 'left', width: '' },
                        { key: 'transactionMoney', title: this.$t('dashBoardV2.Table.transactionAmount'), align: 'left', width: '' }
                    ],
                    departmentTableColumns: [
                        { key: 'firstDepartmentName', title: this.$t('dashBoardV2.Select.department'), align: 'left', width: '' },
                        { key: 'inquiryCount', title: this.$t('dashBoardV2.Table.unfilledInquiries'), align: 'left', width: '' },
                        { key: 'estimatedInquiryAmount', title: this.$t('dashBoardV2.dataOverview.inq_estimatedInquiryAmount'), align: 'left', width: '' },
                        { key: 'inquiryTransactionCount', title: this.$t('dashBoardV2.Table.completedInquiry'), align: 'left', width: '' },
                        { key: 'transactionMoney', title: this.$t('dashBoardV2.Table.transactionAmount'), align: 'left', width: '' }
                    ]
                },
                googleMarketing: {
                    personTableColumns: [
                        // { key: 'firstDepartmentName', title: this.$t('dashBoardV2.Select.department'), align: 'left', width: '' },
                        { key: 'campaignName', title: this.$t('dashBoardV2.Table.campaignName'), align: 'left', width: '', fixed: 'left' },
                        { key: 'type', title: this.$t('dashBoardV2.Table.type'), align: 'left', width: '' },
                        { key: 'cost', title: this.$t('dashBoardV2.Table.cost'), align: 'left', width: '' },
                        { key: 'impressions', title: this.$t('dashBoardV2.Table.impressions'), align: 'left', width: '' },
                        { key: 'clicks', title: this.$t('dashBoardV2.Table.clicks'), align: 'left', width: '' },
                        { key: 'visitorCount', title: this.$t('dashBoardV2.Table.visitorCount'), align: 'left', width: '' },
                        { key: 'interactionVisitorCount', title: this.$t('dashBoardV2.Table.interactionVisitorCount'), align: 'left', width: '' },
                        { key: 'clueCount', title: this.$t('dashBoardV2.Table.clueCount'), align: 'left', width: '' },
                        { key: 'inquiryCount', title: this.$t('dashBoardV2.Table.inquiryCount'), align: 'left', width: '' },
                        { key: 'transactionInquiryCount', title: this.$t('dashBoardV2.Table.transactionInquiryCount'), align: 'left', width: '' }
                    ],
                    departmentTableColumns: [
                        { key: 'campaignName', title: this.$t('dashBoardV2.Table.campaignName'), align: 'left', width: '', fixed: 'left' },
                        { key: 'type', title: this.$t('dashBoardV2.Table.type'), align: 'left', width: '' },
                        { key: 'cost', title: this.$t('dashBoardV2.Table.cost'), align: 'left', width: '' },
                        { key: 'impressions', title: this.$t('dashBoardV2.Table.impressions'), align: 'left', width: '' },
                        { key: 'clicks', title: this.$t('dashBoardV2.Table.clicks'), align: 'left', width: '' },
                        { key: 'visitorCount', title: this.$t('dashBoardV2.Table.visitorCount'), align: 'left', width: '' },
                        { key: 'interactionVisitorCount', title: this.$t('dashBoardV2.Table.interactionVisitorCount'), align: 'left', width: '' },
                        { key: 'clueCount', title: this.$t('dashBoardV2.Table.clueCount'), align: 'left', width: '' },
                        { key: 'inquiryCount', title: this.$t('dashBoardV2.Table.inquiryCount'), align: 'left', width: '' },
                        { key: 'transactionInquiryCount', title: this.$t('dashBoardV2.Table.transactionInquiryCount'), align: 'left', width: '' }
                    ]
                },
                employeeResources: {
                    personTableColumns: [
                        { key: 'userName', title: this.$t('dashBoardV2.Table.charger'), align: 'left', width: '' },
                        { key: 'whatsappContact', title: this.$t('dashBoardV2.dataOverview.whatsAppContact'), align: 'left', width: '156' },
                        { key: 'emailContact', title: this.$t('dashBoardV2.dataOverview.mailContact'), align: 'left', width: '' },
                        { key: 'clueCount', title: this.$t('dashBoardV2.dataOverview.clue'), align: 'left', width: '' },
                        { key: 'companyCount', title: this.$t('dashBoardV2.dataOverview.customer'), align: 'left', width: '' },
                        { key: 'markerCompanyCount', title: this.$t('dashBoardV2.Table.customeEmphasis'), align: 'left', width: '' },
                        { key: 'inquiryCount', title: this.$t('dashBoardV2.dataOverview.inquiry'), align: 'left', width: '' },
                        { key: 'markerInquiryCount', title: this.$t('dashBoardV2.Title.focusedInquiry'), align: 'left', width: '' },
                        { key: 'transactionInquiryCount', title: this.$t('dashBoardV2.Settings.dealtInquiry'), align: 'left', width: '' }
                    ],
                    departmentTableColumns: [
                        { key: 'firstDepartmentName', title: this.$t('dashBoardV2.Select.department'), align: 'left', width: '' },
                        { key: 'whatsappContact', title: this.$t('dashBoardV2.dataOverview.whatsAppContact'), align: 'left', width: '156' },
                        { key: 'emailContact', title: this.$t('dashBoardV2.dataOverview.mailContact'), align: 'left', width: '' },
                        { key: 'clueCount', title: this.$t('dashBoardV2.dataOverview.clue'), align: 'left', width: '' },
                        { key: 'companyCount', title: this.$t('dashBoardV2.dataOverview.customer'), align: 'left', width: '' },
                        { key: 'markerCompanyCount', title: this.$t('dashBoardV2.Table.customeEmphasis'), align: 'left', width: '' },
                        { key: 'inquiryCount', title: this.$t('dashBoardV2.dataOverview.inquiry'), align: 'left', width: '' },
                        { key: 'markerInquiryCount', title: this.$t('dashBoardV2.Title.focusedInquiry'), align: 'left', width: '' },
                        { key: 'transactionInquiryCount', title: this.$t('dashBoardV2.Settings.dealtInquiry'), align: 'left', width: '' }
                    ]
                },
                // 员工代办事项列表字段配置
                todoList: {
                    personTableColumns: [
                        { key: 'userName', title: this.$t('dashBoardV2.Table.saleName'), align: 'left', width: '' },
                        // 待处理WhatsApp会话
                        { key: 'disposeWaCount', title: this.$t('dashBoardV2.Table.disposeWaCount'), align: 'left', width: '156' },
                        // 待处理邮件
                        { key: 'todoCount', title: this.$t('dashBoardV2.Table.todoCount'), align: 'left', width: '156' },
                        // 未读邮件
                        { key: 'noReadCount', title: this.$t('dashBoardV2.Table.mailUnread'), align: 'left', width: '156' },
                        // 待回复邮件
                        { key: 'toBeRepliedToCount', title: this.$t('dashBoardV2.Table.mailToDeal'), align: 'left', width: '' },
                        // 待处理线索
                        { key: 'disposeClueCount', title: this.$t('dashBoardV2.Table.clue'), align: 'left', width: '' },
                        // 待处理客户
                        { key: 'disposeCompanyCount', title: this.$t('dashBoardV2.Table.customer'), align: 'left', width: '' },
                        // 七天内即将退入公海客户
                        { key: 'retreatIntoHighSeasInquiryCount', title: this.$t('dashBoardV2.Table.retreatIntoHighSeasInquiryCount'), align: 'left', width: '' },
                        // 三天内退入到公海的客户
                        { key: 'threeSeasCompanyCount', title: this.$t('dashBoardV2.Table.threeSeasCompanyCount'), align: 'left', width: '' }
                    ],
                    departmentTableColumns: [
                        { key: 'departmentName', title: this.$t('dashBoardV2.Table.departmentName'), align: 'left', width: '' },
                        // 待处理WhatsApp会话
                        { key: 'disposeWaCount', title: this.$t('dashBoardV2.Table.disposeWaCount'), align: 'left', width: '156' },
                        // 待处理邮件
                        { key: 'todoCount', title: this.$t('dashBoardV2.Table.todoCount'), align: 'left', width: '156' },
                        // 未读邮件
                        { key: 'noReadCount', title: this.$t('dashBoardV2.Table.mailUnread'), align: 'left', width: '156' },
                        // 待回复邮件
                        { key: 'toBeRepliedToCount', title: this.$t('dashBoardV2.Table.mailToDeal'), align: 'left', width: '' },
                        // 待处理线索
                        { key: 'disposeClueCount', title: this.$t('dashBoardV2.Table.clue'), align: 'left', width: '' },
                        // 待处理客户
                        { key: 'disposeCompanyCount', title: this.$t('dashBoardV2.Table.customer'), align: 'left', width: '' },
                        // 七天内即将退入公海客户
                        { key: 'retreatIntoHighSeasInquiryCount', title: this.$t('dashBoardV2.Table.retreatIntoHighSeasInquiryCount'), align: 'left', width: '' },
                        // 三天内退入到公海的客户
                        { key: 'threeSeasCompanyCount', title: this.$t('dashBoardV2.Table.threeSeasCompanyCount'), align: 'left', width: '' }
                        // { key: 'departmentName', title: this.$t('dashBoardV2.Table.charger'), align: 'left', width: '' },
                        // { key: 'noReadCount', title: this.$t('dashBoardV2.Table.mailUnread'), align: 'left', width: '156' },
                        // { key: 'toBeRepliedToCount', title: this.$t('dashBoardV2.Table.mailToDeal'), align: 'left', width: '' },
                        // { key: 'transferInquiryCount', title: this.$t('dashBoardV2.Table.inquiry2MeIn7Days'), align: 'left', width: '' },
                        // { key: 'retreatIntoHighSeasInquiryCount', title: this.$t('dashBoardV2.Table.inquiry2HighSeaIn7Days'), align: 'left', width: '' },
                        // { key: 'needToFocusOnInquiryCount', title: this.$t('dashBoardV2.Table.keyInquiry'), align: 'left', width: '' }
                    ]
                },
                // 线索分布 列表字段配置
                clueDistribution: {
                    personTableColumns: [],
                    departmentTableColumns: []
                },
                // 询盘分布 列表字段配置
                inquiryDistribution: {
                    personTableColumns: [],
                    departmentTableColumns: []
                },// 询盘分布 列表字段配置
                companyDistribution: {
                    personTableColumns: [],
                    departmentTableColumns: []
                },
                // 访客分析
                visitorAnalysis: {
                    personTableColumns: [
                        // 动态字段, 多了 dynamicFieldType 字段来表示这是个可变字段以及它的含义, dynamicFieldKey 表示可变字段实际的 key 值
                        { key: 'keyName', dynamicFieldType: 'dimension', dynamicFieldKey: '', title: '', align: 'left', width: '250', sortable: true },
                        { key: 'visitorCount', title: this.$t('dashBoardV2.Table.visitor_count'), align: 'left', width: '', sortable: true },
                        { key: 'newVisitorCount', title: this.$t('dashBoardV2.Table.newVisitorCount'), align: 'left', width: '', sortable: true }
                    ]
                },
                // 访问人次分析
                visitTrafficAnalysis: {
                    personTableColumns: [
                        { key: 'keyName', dynamicFieldType: 'dimension', dynamicFieldKey: '', title: '', align: 'left', width: '350', sortable: true },
                        { key: 'docCount', title: this.$t('dashBoardV2.Table.visits'), align: 'left', width: '', sortable: true }
                    ]
                },
                // 留言状态情况
                msgStatusStatistics: {
                    personTableColumns: [
                        { key: 'keyName', title: this.$t('dashBoardV2.Table.formName'), align: 'left', width: '350' },
                        { key: 'status_1', title: this.$t('dashBoardV2.Table.formStatus.noEntry'), align: 'left', width: '' },
                        { key: 'status_101', title: this.$t('dashBoardV2.Table.formStatus.clue'), align: 'left', width: '' },
                        { key: 'status_102', title: this.$t('dashBoardV2.Table.formStatus.leads'), align: 'left', width: '' },
                        { key: 'status_100', title: this.$t('dashBoardV2.Table.formStatus.nothingWith'), align: 'left', width: '' },
                        { key: 'status_103', title: this.$t('dashBoardV2.Table.formStatus.secondConsultation'), align: 'left', width: '' }
                    ]
                },
                // 留言页面情况
                msgPageStatus: {
                    personTableColumns: [
                        { key: 'keyName', title: this.$t('dashBoardV2.Table.msgPage'), align: 'left', width: '850' },
                        { key: 'docCount', title: this.$t('dashBoardV2.Table.msgCount'), align: 'left', width: '' }
                    ]
                },
                // 客服工作情况
                serviceWorkStatus: {
                    personTableColumns: [
                        // 本表有两个维度, 主维度可在"客服/日期"之间切换, 次维度自动为另一个维度, 可选择是否显示次维度
                        { key: 'keyName', dynamicFieldType: 'firstDimension', dynamicFieldKey: '', title: '', align: 'left', width: '130' },
                        { key: 'subKeyName', dynamicFieldType: 'secondDimension', dynamicFieldKey: '', title: '', align: 'left', width: '100' },
                        { key: 'onlineDuration', title: this.$t('dashBoardV2.Table.onlineDuration'), align: 'left', width: '' },
                        { key: 'csInitiateCount', title: this.$t('dashBoardV2.Table.csInitiateCount'), align: 'left', width: '' },
                        { key: 'csInitiateSuccessCount', title: this.$t('dashBoardV2.Table.csInitiateSuccessCount'), align: 'left', width: '' },
                        { key: 'visitorInitiateCount', title: this.$t('dashBoardV2.Table.visitorInitiateCount'), align: 'left', width: '' },
                        { key: 'timelyReplyCount', title: this.$t('dashBoardV2.Table.timelyReplyCount'), align: 'left', width: '' },
                        { key: 'omitCount', title: this.$t('dashBoardV2.Table.omitCount'), align: 'left', width: '' },
                        { key: 'clueStatusVisitorCount', title: this.$t('dashBoardV2.Table.clueStatusVisitorCount'), align: 'left', width: '' },
                        { key: 'inquiryStatusVisitorCount', title: this.$t('dashBoardV2.Table.inquiryStatusVisitorCount'), align: 'left', width: '' }
                    ]
                },
            }
        };
    }
};
