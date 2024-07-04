import { Request } from '@/https/baseUtilAjax';

// 获取字段映射列表
const queryConversionRuleServiceTypeMapping = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObjRule/queryConversionRuleServiceTypeMapping',
        params
    }, 'get').init(success, error, cbs);
};
// 获取转化条件
const getConversionRuleList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/conversion-rule/list',
        params
    }, 'get').init(success, error, cbs);
};
// 添加转化条件
const addConversionRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/conversion-rule/add',
        data
    }).init(success, error, cbs);
};
// 编辑转化条件
const editConversionRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/conversion-rule/edit',
        data
    }).init(success, error, cbs);
};
// 删除转化条件
const delConversionRule = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/v2-meta/conversion-rule/del',
        params
    }).init(success, error, cbs);
};
// 修改校验规则状态
const updateEnableFlag = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/conversion-rule/updateEnableFlag',
        data
    }).init(success, error, cbs);
};
// 新增校验规则时获取ApiKey
const getApiKey = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/conversion-rule/getApiKey',
        params
    }, 'get').init(success, error, cbs);
};
// 编辑回显 获取规则详情
const getConversionRule = async (id, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: `/v2-meta/conversion-rule/${id}`
    }, 'get').init(success, error, cbs);
};
export {
    queryConversionRuleServiceTypeMapping,
    getConversionRuleList,
    addConversionRule,
    editConversionRule,
    delConversionRule,
    updateEnableFlag,
    getApiKey,
    getConversionRule
};