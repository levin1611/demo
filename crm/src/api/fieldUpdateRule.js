// 字段更新规则 相关 api

import { Request } from '@/https/baseUtilAjax';

// 获取字段更新规则数据
export const getFieldUpdateRuleData = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/fieldUpdateRule/getByApikey',
        params
    }, 'get').init(success, error, cbs);
};

// 更新字段更新规则
export const updateFieldUpdateRuleData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/fieldUpdateRule/updateRule',
        data
    }).init(success, error, cbs);
};

export default {
    getFieldUpdateRuleData,
    updateFieldUpdateRuleData
};
