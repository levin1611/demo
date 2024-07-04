import { Request } from '@/api/baseUtilAjax';
/** 默认规则和自定义规则(合并为同一个接口了) */
const getRuleListAllByOrgId = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/rule/message/getRuleListAllByOrgId',
        method: 'get',
        params
    }).init(success, error, cbs);
};

/** 删除规则 */
const deleteRuleById = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/rule/message/deleteRuleById',
        method: 'get',
        params
    }).init(success, error, cbs);
};

/** 更新规则启用状态
 * notice-setting组件中使用
 * 该方法可以传四个url,url都放在组件中管理
 */
const updateRuleStatus = async (data, success = null, error = null, cbs = []) => {
    // 获取url
    const url = data.url;
    // 获取传输的数据
    const params = data.params;
    return new Request({
        utilKey: 'ajax',
        url,
        method: 'get',
        params
    }).init(success, error, cbs);
};

export default {
    getRuleListAllByOrgId,
    deleteRuleById,
    updateRuleStatus
};
