import { Request } from '@/api/baseUtilAjax';
// 获取 跟进规则 设置
const getRules = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/report/rules/get',
        params
    }, 'get').init(success, error, cbs);
};
// 保存 跟进规则 设置
const saveRules = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/report/rules/addAll',
        data
    }).init(success, error, cbs);
};
// 获取 客户获得规则 设置
const getGetRules = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/companyRule/ruleInfo',
        params
    }, 'get').init(success, error, cbs);
};
// 保存 客户获得规则 设置
const saveGetRules = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/companyRule/saveRuleInfo',
        data
    }).init(success, error, cbs);
};
export default {
    getRules,
    saveRules,
    getGetRules,
    saveGetRules
};
