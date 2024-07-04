import { Request } from '@/api/baseUtilAjax';
// 获取表单列表
const getFormTemplateSortedList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/template/getFormTemplateSortedList',
        data
    }).init(success, error, cbs);
};
// 删除表单
const deleteTemplate = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/template/deleteTemplate',
        data
    }).init(success, error, cbs);
};
// 获取对应关系列表
const getExternalRelationList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/externalform/getExternalRelationList',
        data
    }).init(success, error, cbs);
};
// 根据id获取对应关系
const getExternalRelation = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/externalform/getExternalRelation',
        data
    }).init(success, error, cbs);
};
// 新增对应关系
const saveExternalRelation = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/form-cust/externalform/saveExternalRelation',
        data
    }).init(success, error, cbs);
};
// 更新对应关系
const updateExternalRelation = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/form-cust/externalform/updateExternalRelation',
        data
    }).init(success, error, cbs);
};
// 对应关系名称查重
const hasSameRelationName = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/form-cust/externalform/hasSameRelationName',
        data
    }).init(success, error, cbs);
};
// 删除对应关系
const deleteExternalRelation = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/externalform/deleteExternalRelation',
        data
    }).init(success, error, cbs);
};

// 获取生效规则
const getMappingRuleList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/rule/externalform/getListByOrgId',
        data
    }).init(success, error, cbs);
};

// 获取生效规则
const saveMappingRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/rule/externalform/save',
        data
    }).init(success, error, cbs);
};

// 删除生效规则
const deleteMappingRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/rule/externalform/delete',
        data
    }).init(success, error, cbs);
};

// 删除生效规则
const getDeleteRelatedRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/externalform4rule/getRelationNameListByRuleId',
        data
    }).init(success, error, cbs);
};

// 获取规则名称 id 列表
const getRuleNameList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/rule/externalform/getNameListByOrgId',
        data
    }).init(success, error, cbs);
};

// 获取单条规则内容
const getRuleDetail = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/rule/externalform/get',
        data
    }).init(success, error, cbs);
};

export default {
    getFormTemplateSortedList,
    deleteTemplate,
    getExternalRelationList,
    getExternalRelation,
    saveExternalRelation,
    updateExternalRelation,
    hasSameRelationName,
    deleteExternalRelation,
    getMappingRuleList,
    saveMappingRule,
    deleteMappingRule,
    getDeleteRelatedRule,
    getRuleNameList,
    getRuleDetail
};
