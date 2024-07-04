import { Request } from '@/api/baseUtilAjax';
// 工作台  STAET
// 获取顶部详情数字
const getWorkbenchStat = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiry/getWorkbenchStat',
        data
    }).init(success, error, cbs);
};

// 行为视图，图标接口
const getBehaviorView = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/funnelview/getBehaviorView',
        data
    }).init(success, error, cbs);
};

// 行为视图，列表接口
const getBehaviorViewList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/funnelview/getBehaviorViewList',
        data
    }).init(success, error, cbs);
};

// 行为视图，筛选 部门人员下拉
const getUserObjListExcludeDelete = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/new-privilege/manage/getUserObjListExcludeDelete',
        type: 'GET',
        data
    }).init(success, error, cbs);
};
// 行为视图，筛选全部人员
const getDepartUserByUserId = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/company/getDepartUserByUserId',
        data
    }).init(success, error, cbs);
};
// 任务  获取近期任务和过期任务列表
const getWorkendTaskList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/task/getWorkendTaskList',
        data
    }).init(success, error, cbs);
};
// // 点击日历中某个事件时触发
const getWorkendTaskDetail = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/task/get',
        data
    }).init(success, error, cbs);
};
//  /* 初始化日历插件fullcalendar */
const getCalendarList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/task/getCalendarList',
        data
    }).init(success, error, cbs);
};

//  /** 获取询盘漏斗数据 */
const getFunnelView = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/funnelview/getFunnelView',
        data
    }).init(success, error, cbs);
};

//  /** 获取询盘关闭原因数据 */
const getCloseReason = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/funnelview/getCloseReason',
        data
    }).init(success, error, cbs);
};

export default {
    getWorkbenchStat,
    getBehaviorView,
    getBehaviorViewList,
    getUserObjListExcludeDelete,
    getDepartUserByUserId,
    getWorkendTaskList,
    getWorkendTaskDetail,
    getCalendarList,
    getFunnelView,
    getCloseReason
};
