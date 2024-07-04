import { Request } from '@/api/baseUtilAjax';

// 获取跟进记录列表
const getPlanList = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/followupPlan/getPlanList',
        data,
        cancelToken
    }).init(success, error, cbs);
};
// 通过id 获取跟进记录详情
const getFollowupByPlanId = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/followup/getFollowupById',
        params
    }, 'get').init(success, error, cbs);
};
// 新建跟进计划
const savePlan = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/followupPlan/savePlan',
        data
    }).init(success, error, cbs);
};
// 编辑跟进计划
const editPlan = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/followupPlan/editPlan',
        data
    }).init(success, error, cbs);
};
// 删除跟进计划
const delPlan = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/followupPlan/delPlan',
        params
    }, 'get').init(success, error, cbs);
};
// 查跟进计划对应的关联客户
const planDetailCustomer = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/followupPlan/planDetailCustomer',
        data
    }).init(success, error, cbs);
};
// 查跟进计划对应的跟进记录
const planDetailRecord = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/followupPlan/planDetailRecord',
        data
    }).init(success, error, cbs);
};
// 查跟进计划日志
const getFollowUpLogs = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/followupPlan/getFollowUpLogs',
        params
    }, 'get').init(success, error, cbs);
};
// 获取跟进定位
const planDetailLine = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/followupPlan/planDetailLine',
        data
    }).init(success, error, cbs);
};
export default {
    getPlanList,
    getFollowupByPlanId,
    savePlan,
    editPlan,
    delPlan,
    planDetailCustomer,
    planDetailRecord,
    getFollowUpLogs,
    planDetailLine
};
