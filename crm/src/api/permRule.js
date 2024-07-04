// 自定义权限规则 相关 api

import { Request } from '@/https/baseUtilAjax';

// 请求业务对象列表
export const getAllEntity = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/customPermission/orgEntityList',
        params
    }, 'get').init(success, error, cbs);
};

// 删除自定义权限规则
export const deletePermRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: `/v2-privilege/customPermission/${data.id}`,
        data
    }, 'delete').init(success, error, cbs);
};

// 重新计算自定义权限规则
export const reCalcPermRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: `/v2-privilege/customPermission/recalculate/${data.id}`,
        data
    }).init(success, error, cbs);
};

// 重新计算自定义权限规则
export const updatePermRuleStatus = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        // utilKey: 'ajaxJson',
        url: `/v2-privilege/customPermission/updateStatus/${data.id}`,
        data
    }).init(success, error, cbs);
};
// 请求业务对象列表
export const orgCustomPermissionList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/customPermission/orgCustomPermissionList',
        params
    }, 'get').init(success, error, cbs);
};
export default {
    getAllEntity,
    deletePermRule,
    reCalcPermRule,
    updatePermRuleStatus,
    orgCustomPermissionList
};
