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
const enterpriseId = store.state.enterpriseId;
const dataOverview = [
    { x: 0, y: 0, w: 12, h: 8, i: 'dataOverview', component: 'dataOverview', isShow: true, name: i18n.t('dashBoardV2.Title.dataOverview') },
    { x: 0, y: 0, w: 12, h: 16, i: 'focusedInquiry', component: 'tableIndex', isShow: true, name: i18n.t('dashBoardV2.Title.focusedInquiry') }
];
let config = [
    { x: 0, y: 0, w: 6, h: 16, i: 'followUpOverview', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.followUpOverview') },
    { x: 6, y: 0, w: 6, h: 16, i: 'cardFollowUp', component: 'cardFollowUp', isShow: true, name: i18n.t('dashBoardV2.Title.followUpTask') },
    { x: 0, y: 0, w: 6, h: 16, i: 'remind', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.remind') },
    { x: 6, y: 0, w: 6, h: 16, i: 'nameCard', component: 'nameCard', isShow: true, name: i18n.t('dashBoardV2.Title.nameCard') },
    { x: 0, y: 0, w: 6, h: 16, i: 'taskCard', component: 'taskCard', isShow: true, name: i18n.t('dashBoardV2.Title.task') },
    { x: 0, y: 15, w: 6, h: 16, i: 'WAWT', component: 'WAWT', isShow: true, name: i18n.t('dashBoardV2.Title.WAWT') },
    // { x: 0, y: 15, w: 6, h: 14, i: 'epidemic', component: 'epidemic', isShow: true, name: i18n.t('dashBoardV2.Title.epidemic')},
    // { x: 0, y: 15, w: 6, h: 16, i: 'exchangeRate', component: 'exchangeRate', isShow: true, name: i18n.t('dashBoardV2.Title.exchangeRate')},
    { x: 0, y: 15, w: 6, h: 16, i: 'business', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.business') },
    { x: 0, y: 31, w: 12, h: 16, i: 'employeeResources', component: 'tableIndex', isShow: true, name: i18n.t('dashBoardV2.Title.employeeResources') },
    { x: 6, y: 31, w: 6, h: 16, i: 'workload', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.workload') },
    { x: 6, y: 31, w: 6, h: 16, i: 'keyAccount', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.keyAccount') },
    { x: 6, y: 47, w: 6, h: 16, i: 'mail', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.mail') },
    { x: 0, y: 63, w: 12, h: 16, i: 'todoList', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.todoList') },
    { x: 0, y: 79, w: 12, h: 34, i: 'crmTasks', component: 'crmTasks', isShow: true, name: i18n.t('dashBoardV2.Title.crmTasks') },
    { x: 0, y: 113, w: 12, h: 23, i: 'indexCanvas', component: 'indexCanvas', isShow: true, name: i18n.t('dashBoardV2.Title.indexCanvas') },
    // { x: 0, y: 136, w: 6, h: 16, i: 'target', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.target') },
    { x: 0, y: 136, w: 6, h: 16, i: 'completion', component: 'tableCompletion', isShow: true, name: i18n.t('dashBoardV2.Title.completion') },
    { x: 6, y: 136, w: 6, h: 16, i: 'targetOverview', component: 'tableCard', isShow: true, name: i18n.t('dashBoardV2.Title.targetOverview') },
    { x: 0, y: 152, w: 12, h: 16, i: 'touchPoint', component: 'touchPoint', isShow: true, name: i18n.t('dashBoardV2.Title.touchPoint') }
    // { x: 0, y: 168, w: 12, h: 16, i: 'behaviorView', component: 'behaviorView', isShow: true, name: '111111' },
    // { x: 0, y: 0, w: 12, h: 16, i: 'dataOverview', component: 'dataOverview', isShow: true, name: '111111' }
    // { x: 0, y: 0, w: 12, h: 16, i: 'focusedInquiry', component: 'tableIndex', isShow: true, name: '111111' }
];
if (enterpriseId === '10110' || enterpriseId === '10711') {
    const liXin = [
        { x: 0, y: 0, w: 12, h: 16, i: 'clueStatistics', component: 'clueStatistics', isShow: true, name: i18n.t('dashBoardV2.Title.clueStatistics') },
        { x: 0, y: 0, w: 6, h: 16, i: 'salesclueInquiry', component: 'salesclueInquiry', isShow: true, name: i18n.t('dashBoardV2.Title.salesclueStatistics') },
        { x: 6, y: 0, w: 6, h: 16, i: 'salesInquiryStatistics', component: 'salesInquiryStatistics', isShow: true, name: i18n.t('dashBoardV2.Title.salesInquiryStatistics') }
    ];
    config = liXin.concat(config);
}
config = dataOverview.concat(config);

export default config;
