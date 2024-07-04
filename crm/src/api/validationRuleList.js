import { Request } from '@/https/baseUtilAjax';

// 获取校验规则列表
const getCheckRuleList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/check-rule/list',
        params
    }, 'get').init(success, error, cbs);
};
// 新增校验规则接口
const addCheckRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/check-rule/add',
        data
    }).init(success, error, cbs);
};
// 编辑校验规则接口
const editCheckRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/check-rule/edit',
        data
    }).init(success, error, cbs);
};
// 删除校验规则接口
const delCheckRule = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/v2-meta/check-rule/del',
        params
    }).init(success, error, cbs);
};
// 修改校验规则状态
const updateEnableFlag = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/check-rule/updateEnableFlag',
        data
    }).init(success, error, cbs);
};
// 新增校验规则时获取ApiKey
const getApiKey = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/check-rule/getApiKey',
        params
    }, 'get').init(success, error, cbs);
};
// 编辑回显 获取规则详情
const getCheckRule = async (id, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: `/v2-meta/check-rule/${id}`
    }, 'get').init(success, error, cbs);
};
export {
    getCheckRuleList,
    addCheckRule,
    editCheckRule,
    delCheckRule,
    updateEnableFlag,
    getApiKey,
    getCheckRule
};