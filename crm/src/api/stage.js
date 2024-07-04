// 字段设置 相关 api
import { Request } from '@/https/baseUtilAjax';

// 获取阶段流程数据
export const getStageFlowData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/opportunityStageEvent/getOpportunityStageEventList',
        data
    }, 'post').init(success, error, cbs);
};

// 保存关键事件
export const saveKeyEvt = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/opportunityStageEvent/saveStageEvent',
        data
    }, 'post').init(success, error, cbs);
};

// 编辑关键事件
export const editKeyEvt = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/opportunityStageEvent/updateStageEvent',
        data
    }, 'post').init(success, error, cbs);
};

// 删除关键事件
export const delKeyEvt = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/v2-crm/opportunityStageEvent/deleteStageEvent',
        params
    }, 'get').init(success, error, cbs);
};

// 排序关键事件
export const sortKeyEvt = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/opportunityStageEvent/sort',
        data
    }, 'post').init(success, error, cbs);
};

// 保存关键信息
export const saveKeyInfo = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/opportunityStageEvent/saveStageInfo',
        data
    }, 'post').init(success, error, cbs);
};

export default {
    getStageFlowData,
    saveKeyEvt,
    delKeyEvt,
    saveKeyInfo
};
