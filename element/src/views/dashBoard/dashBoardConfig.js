/**
 * x: 所在行数
 * y: 所在列数
 * w: 宽度
 * h: 高度
 * i: 组件id
 * component: 组件类型
 * isShow: Boolean 控制组件的展示 所有component 为tableCard的组件还要加一层判断是否为销售
 * 通过component + i 的模式来区分不同的报表
 * 默认是分成12份 通过:col-num 来修改
 * 规则：[obj1, obj2] => obj2.y = obj1.y + obj1.h
 * @author: Yiming Cai
 * */
/**
 * todo
 * 调整样式
 * 定义vuex state: config 保存 仪表盘配置  state: isDrag 控制编辑模式
 * 定义vuex mutation 来更新仪表盘配置
 * 定义仪表盘刷新机制 能够保证每次配置完成后 能够刷新页面
 * 定义接口 以及css mixin
 * 定义一套规则 能够动态生成config
 * height: h === Infinity ? h : Math.round(this.rowHeight * h + Math.max(0, h - 1) * this.margin[1]) 高度的技算方式
 * height = 25x - 24
 * */
import i18n from '@/locale';
import store from '@/store';
import Vue from 'vue';
const enterpriseId = store.state.enterpriseId;
let config = [];
// const dataOverview = [
//     // 数据概览
//     { x: 0, y: 0, w: 12, h: 8, i: 'dataOverview', component: 'dataOverview', isShow: true, name: i18n.t('dashBoardV2.Title.dataOverview') },
//     // 重点关注询盘
//     { x: 0, y: 0, w: 12, h: 16, i: 'focusedInquiry', component: 'tableIndex', isShow: true, name: i18n.t('dashBoardV2.Title.focusedInquiry') }
// ];
// let config = [
//     // 客户跟进情况概览
//     { x: 0, y: 0, w: 6, h: 16, i: 'followUpOverview', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.followUpOverview') },
//     // 跟进任务
//     { x: 6, y: 0, w: 6, h: 16, i: 'cardFollowUp', component: 'cardFollowUp', isShow: true, name: i18n.t('dashBoardV2.Title.followUpTask') },
//     // 未跟进客户概览
//     { x: 0, y: 0, w: 6, h: 16, i: 'remind', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.remind') },
//     // 我的名片
//     { x: 6, y: 0, w: 6, h: 16, i: 'nameCard', component: 'nameCard', isShow: true, name: i18n.t('dashBoardV2.Title.nameCard') },
//     // 今日任务
//     { x: 0, y: 0, w: 6, h: 16, i: 'taskCard', component: 'taskCard', isShow: true, name: i18n.t('dashBoardV2.Title.task') },
//     // 货币兑换 & WhatsApp 号码归属地查询
//     { x: 0, y: 15, w: 6, h: 16, i: 'WAWT', component: 'WAWT', isShow: true, name: i18n.t('dashBoardV2.Title.WAWT') },
//     // { x: 0, y: 15, w: 6, h: 14, i: 'epidemic', component: 'epidemic', isShow: true, name: i18n.t('dashBoardV2.Title.epidemic')},
//     // { x: 0, y: 15, w: 6, h: 16, i: 'exchangeRate', component: 'exchangeRate', isShow: true, name: i18n.t('dashBoardV2.Title.exchangeRate')},
//     // 业绩详情
//     { x: 0, y: 15, w: 6, h: 16, i: 'business', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.business') },
//     // 工作量统计
//     { x: 6, y: 31, w: 6, h: 16, i: 'workload', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.workload') },
//     // 重点跟进客户
//     { x: 6, y: 31, w: 6, h: 16, i: 'keyAccount', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.keyAccount') },
//     // 邮件处理
//     { x: 6, y: 47, w: 6, h: 16, i: 'mail', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.mail') },
//     // 员工待办事项
//     { x: 0, y: 63, w: 12, h: 16, i: 'todoList', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.todoList') },
//     // 日历
//     { x: 0, y: 79, w: 12, h: 34, i: 'crmTasks', component: 'crmTasks', isShow: true, name: i18n.t('dashBoardV2.Title.crmTasks') },
//     // 客服在线时长
//     { x: 0, y: 113, w: 12, h: 23, i: 'indexCanvas', component: 'indexCanvas', isShow: true, name: i18n.t('dashBoardV2.Title.indexCanvas') },
//     // { x: 0, y: 136, w: 6, h: 16, i: 'target', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.target') },
//     // 业绩完成情况
//     { x: 0, y: 136, w: 6, h: 16, i: 'completion', component: 'tableCompletion', isShow: true, name: i18n.t('dashBoardV2.Title.completion') },
//     // 年度业绩概览
//     { x: 6, y: 136, w: 6, h: 16, i: 'targetOverview', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.targetOverview') },
//     // WhatsApp
//     { x: 0, y: 152, w: 12, h: 16, i: 'touchPoint', component: 'touchPoint', isShow: true, name: i18n.t('dashBoardV2.Title.touchPoint') }
//     // { x: 0, y: 168, w: 12, h: 16, i: 'behaviorView', component: 'behaviorView', isShow: true, name: '111111' },
//     // { x: 0, y: 0, w: 12, h: 16, i: 'dataOverview', component: 'dataOverview', isShow: true, name: '111111' }
//     // { x: 0, y: 0, w: 12, h: 16, i: 'focusedInquiry', component: 'tableIndex', isShow: true, name: '111111' }
// ];
const home = [
    // 数据概览
    { x: 0, y: 0, w: 2, h: 8, i: 'dataOverview', component: 'dataOverview', icon: 'dataOverview', status: 1, isShow: true, name: i18n.t('dashBoardV2.Title.dataOverview') },
    // 业绩完成情况
    { x: 0, y: 8, w: 1, h: 16, i: 'completion', component: 'tableCompletion', icon: 'completion', status: 1, isShow: true, name: i18n.t('dashBoardV2.Title.completion') },
    // 年度业绩概览
    { x: 1, y: 8, w: 1, h: 16, i: 'targetOverview', component: 'tableCard', icon: 'targetOverview', status: 1, isShow: true, name: i18n.t('dashBoardV2.Title.targetOverview') },
    // 跟进任务
    // { x: 0, y: 24, w: 1, h: 16, i: 'cardFollowUp', component: 'cardFollowUp', icon: 'cardFollowUp', status: 1, isShow: true, name: i18n.t('dashBoardV2.Title.followUpTask') },
    // 今日任务
    { x: 0, y: 24, w: 1, h: 16, i: 'taskCard', component: 'taskCard', icon: 'taskCard', status: 1, isShow: true, name: i18n.t('dashBoardV2.Title.task') },
    // 员工待办事项
    // { x: 0, y: 40, w: 2, h: 16, i: 'todoList', component: 'tableCard', icon: 'todoList', status: 1, isShow: true, name: i18n.t('dashBoardV2.Title.todoList') },
    { x: 0, y: 40, w: 2, h: 16, i: 'todoList', component: 'tableIndex', icon: 'todoList', status: 1, isShow: true, name: i18n.t('dashBoardV2.Title.todoList') },
    // 日历
    { x: 0, y: 56, w: 2, h: 34, i: 'crmTasks', component: 'crmTasks', icon: 'crmTasks', status: 1, isShow: true, name: i18n.t('dashBoardV2.Title.crmTasks') },
    // 货币兑换 & WhatsApp 号码归属地查询
    { x: 0, y: 90, w: 1, h: 16, i: 'WAWT', component: 'WAWT', icon: 'taskCard', status: 1, isShow: true, name: i18n.t('dashBoardV2.Title.WAWT') },
    // 我的名片
    { x: 1, y: 90, w: 1, h: 16, i: 'nameCard', component: 'nameCard', icon: 'nameCard', status: 1, isShow: true, name: i18n.t('dashBoardV2.Title.nameCard') },
];
let resource = [
    // 重点关注询盘
    { x: 0, y: 0, w: 2, h: 16, i: 'focusedInquiry', component: 'tableIndex', icon: 'todoList', status: 2, isShow: true, name: i18n.t('dashBoardV2.Title.focusedInquiry') },
    // 业绩详情 改成了 员工资源统计
    { x: 0, y: 16, w: 2, h: 16, i: 'employeeResources', component: 'tableIndex', icon: 'todoList', status: 2, isShow: true, name: i18n.t('dashBoardV2.Title.employeeResources') },
    // 重点跟进客户
    { x: 0, y: 52, w: 1, h: 16, i: 'keyAccount', component: 'tableCard', icon: 'WAWT', status: 2, isShow: true, name: i18n.t('dashBoardV2.Title.keyAccount') },
    // 线索分布
    { x: 0, y: 36, w: 2, h: 16, i: 'clueDistribution', component: 'tableIndex', icon: 'todoList', status: 2, isShow: true, name: i18n.t('dashBoardV2.Title.clueDistribution') },
    // 询盘分布
    { x: 0, y: 36, w: 2, h: 16, i: 'inquiryDistribution', component: 'tableIndex', icon: 'todoList', status: 2, isShow: true, name: i18n.t('dashBoardV2.Title.inquiryDistribution') },
    // // 客户分布
    { x: 0, y: 36, w: 2, h: 16, i: 'companyDistribution', component: 'tableIndex', icon: 'todoList', status: 2, isShow: true, name: i18n.t('dashBoardV2.Title.companyDistribution') },
];
const course = [
    // 工作量统计
    { x: 0, y: 0, w: 2, h: 16, i: 'workload', component: 'tableCard', icon: 'todoList', status: 3, isShow: true, name: i18n.t('dashBoardV2.Title.workload') },
    // 客户跟进情况概览
    { x: 0, y: 16, w: 1, h: 16, i: 'followUpOverview', component: 'tableCard', icon: 'cardFollowUp', status: 3, isShow: true, name: i18n.t('dashBoardV2.Title.followUpOverview') },
    // 未跟进客户概览
    { x: 1, y: 16, w: 1, h: 16, i: 'remind', component: 'tableCard', icon: 'cardFollowUp', status: 3, isShow: true, name: i18n.t('dashBoardV2.Title.remind') },
    // 跟进记录统计（原来行为视图）
    { x: 0, y: 32, w: 2, h: 16, i: 'behaviorView', component: 'behaviorView', icon: 'todoList', status: 3, isShow: true, name: i18n.t('dashBoardV2.Title.behaviorView') },
    // 邮件处理
    { x: 0, y: 48, w: 1, h: 16, i: 'mail', component: 'tableCard', icon: 'targetOverview', status: 3, isShow: true, name: i18n.t('dashBoardV2.Title.mail') },
    // WhatsApp
    { x: 0, y: 64, w: 2, h: 16, i: 'touchPoint', component: 'touchPoint', icon: 'todoList', status: 3, isShow: true, name: i18n.t('dashBoardV2.Title.touchPoint') },
    // 客服在线时长
    { x: 0, y: 80, w: 2, h: 23, i: 'indexCanvas', component: 'indexCanvas', icon: 'kefu', status: 3, isShow: true, name: i18n.t('dashBoardV2.Title.indexCanvas') },
];
const marketing = [
    // Google 广告转化
    { x: 0, y: 0, w: 2, h: 23, i: 'googleMarketing', component: 'tableIndex', icon: 'todoList', status: 2, isShow: true, name: i18n.t('dashBoardV2.Title.googleMarketing') }
];
const website = [
    // 数据概览
    { x: 0, y: 0, w: 2, h: 8, i: 'webDataOverview', component: 'dataOverview', icon: 'dataOverview', status: 5, isShow: true, name: i18n.t('dashBoardV2.Title.dataOverview') },
    // 网站流量情况
    { x: 0, y: 8, w: 2, h: 23, i: 'websiteTrafficStatus', component: 'dashBoardChart', icon: 'kefu', status: 5, isShow: true, name: i18n.t('dashBoardV2.Title.websiteTrafficStatus') },
    // 访客分析
    { x: 0, y: 31, w: 1, h: 16, i: 'visitorAnalysis', component: 'tableIndex', icon: 'cardFollowUp', status: 5, isShow: true, name: i18n.t('dashBoardV2.Title.visitorAnalysis') },
    // 访问人次分析
    { x: 1, y: 31, w: 1, h: 16, i: 'visitTrafficAnalysis', component: 'tableIndex', icon: 'cardFollowUp', status: 5, isShow: true, name: i18n.t('dashBoardV2.Title.visitTrafficAnalysis') },
    // 留言状态统计
    { x: 0, y: 47, w: 2, h: 16, i: 'msgStatusStatistics', component: 'tableIndex', icon: 'todoList', status: 5, isShow: true, name: i18n.t('dashBoardV2.Title.msgStatusStatistics') },
    // 留言页面情况
    { x: 0, y: 63, w: 2, h: 16, i: 'msgPageStatus', component: 'tableIndex', icon: 'todoList', status: 5, isShow: true, name: i18n.t('dashBoardV2.Title.msgPageStatus') },
    // 客服工作情况
    { x: 0, y: 79, w: 2, h: 23, i: 'serviceWorkStatus', component: 'tableIndex', icon: 'todoList', status: 5, isShow: true, name: i18n.t('dashBoardV2.Title.serviceWorkStatus') }
];
if (enterpriseId === '10110' || enterpriseId === '10711') {
    const liXin = [
        // 线索统计
        { x: 0, y: 68, w: 2, h: 16, i: 'clueStatistics', component: 'clueStatistics', icon: 'todoList', status: 2, isShow: true, name: i18n.t('dashBoardV2.Title.clueStatistics') },
        // 销售负责的线索和询盘统计
        { x: 0, y: 84, w: 2, h: 16, i: 'salesclueInquiry', component: 'salesclueInquiry', icon: 'todoList', status: 2, isShow: true, name: i18n.t('dashBoardV2.Title.salesclueStatistics') },
        // 销售不同跟进阶段的询盘统计
        { x: 0, y: 100, w: 2, h: 16, i: 'salesInquiryStatistics', component: 'salesInquiryStatistics', icon: 'todoList', status: 2, isShow: true, name: i18n.t('dashBoardV2.Title.salesInquiryStatistics') }
    ];
    resource = resource.concat(liXin);
}
config = [
    {
        id: 'home',
        name: i18n.t('dashBoardV2.tabs.frontPage'),
        list: home
    },
    {
        id: 'resource',
        name: i18n.t('dashBoardV2.tabs.Resource'),
        list: resource
    },
    {
        id: 'course',
        name: i18n.t('dashBoardV2.tabs.processReport'),
        list: course
    },
    {
        id: 'marketing',
        name: i18n.t('dashBoardV2.tabs.processReport'),
        list: marketing
    },
    {
        id: 'website',
        name: i18n.t('dashBoardV2.tabs.website'),
        list: website
    }
];

// // 先禁用掉其他企业的"网站交互"Tab
// if (!['10110', '1001', '10304', '10171'].includes(`${enterpriseId}`)) {
//     config = config.filter(item => item.id !== 'website');
// }
// 先禁用掉其他企业的"营销报表"Tab
if (!['10110'].includes(`${enterpriseId}`)) {
    config = config.filter(item => item.id !== 'marketing');
}
// config = dataOverview.concat(config);

export default config;
