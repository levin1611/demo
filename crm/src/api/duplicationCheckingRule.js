import { Request } from '@/https/baseUtilAjax';
// 查重规则列表
const getRepeatList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/repeat-rule/list',
        params
    }, 'get').init(success, error, cbs);
};
// 新增查重规则接口
const repeatRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/repeat-rule/add',
        data 
    }).init(success, error, cbs);
};
// 编辑查重规则接口
const editRepeatRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/repeat-rule/edit',
        data 
    }).init(success, error, cbs);
};

// 删除 查重规则接口
const delRepeatRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/v2-meta/repeat-rule/del',
        params: data
    }).init(success, error, cbs);
};

// 修改启用禁用状态
const updateEnableFlag = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/repeat-rule/updateEnableFlag',
        data
    }).init(success, error, cbs);
};
// 查询字段
const getDuplicationCheckFields = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/repeat-rule/fields',
        params
    }, 'get').init(success, error, cbs);
};
// 查询范围
const getDuplicationCheckFieldsRange = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/repeat-rule/fieldsRange',
        params
    }, 'get').init(success, error, cbs);
};
// 获取程序识别名称
const getApiKey = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/repeat-rule/getApiKey',
        params
    }, 'get').init(success, error, cbs);
};
// 编辑回显 获取规则详情
const getRepeatRule = async (id, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: `/v2-crm/repeat-rule/${id}`
    }, 'get').init(success, error, cbs);
};
// 查重规则排序
const repeatRuleSort = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/repeat-rule/repeatRuleSort',
        data
    }).init(success, error, cbs);
};


export {
    getRepeatList,
    repeatRule,
    editRepeatRule,
    delRepeatRule,
    updateEnableFlag,
    getDuplicationCheckFields,
    getDuplicationCheckFieldsRange,
    getApiKey,
    getRepeatRule,
    repeatRuleSort
}; 