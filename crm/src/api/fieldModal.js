import { Request } from '@/https/baseUtilAjax';
// 新增字段 获取ApiKey
const createApiKey = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/objField/createApiKey',
        params
    }, 'get').init(success, error, cbs);
};
// 根据字段ID获取字段类型
const objFieldInfo = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/objField/objFieldInfo',
        data
    }).init(success, error, cbs);
};
// 新增自定义字段接口
const addObjField = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/objField/addObjField',
        data
    }).init(success, error, cbs);
};
// 编辑自定义字段接口
const editObjField = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/objField/editObjField',
        data
    }).init(success, error, cbs);
};
// 获取通用选项集列表
const getCommonOptionList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/v1/common-option/list',
        params
    }, 'get').init(success, error, cbs);
};
// 获取单个通用选项集下的 列表数据
const listOptionsSet = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/v1/common-option/listOptionsSet',
        params
    }, 'get').init(success, error, cbs);
};
// 获取企业自定义字段剩余字段的数据量
const getCustomFieldCount = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/objField/getCustomFieldCount',
        params
    }, 'get').init(success, error, cbs);
};
// 关联关系（一般关系，主子明细） 关联业务对象列表的接口
const queryRelationObjList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObj/queryRelationObjList',
        params
    }, 'get').init(success, error, cbs);
};
// 引用数据 业务关联关系
const queryRelationFieldList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObj/queryRelationFieldList',
        params
    }, 'get').init(success, error, cbs);
};
// 引用数据 业务关联关系下的字段
const queryRelationObjFieldList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObj/queryRelationObjFieldList',
        params
    }, 'get').init(success, error, cbs);
};
// 查询子对象中可用于汇总累计的字段列表
const queryStatisticFields = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/objField/queryStatisticFields',
        data
    }).init(success, error, cbs);
};
// 新增自定义字段接口-业务对象类型，布局，角色权限列表
const addObjFieldSetInfo = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/objField/addObjFieldSetInfo',
        params
    }, 'get').init(success, error, cbs);
};
// 新增自定义字段接口-业务对象类型，布局，角色权限列表
const enableDelOptionTag = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/objData/enableDelOptionTag',
        data
    }).init(success, error, cbs);
};

export {
    createApiKey,
    objFieldInfo,
    addObjField,
    editObjField,
    getCommonOptionList,
    listOptionsSet,
    getCustomFieldCount,
    queryRelationObjList,
    queryRelationFieldList,
    queryRelationObjFieldList,
    queryStatisticFields,
    addObjFieldSetInfo,
    enableDelOptionTag
};
