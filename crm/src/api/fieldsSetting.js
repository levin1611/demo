// 字段设置 相关 api
import { Request } from '@/https/baseUtilAjax';

// 请求系统及自定义字段列表
export const queryObjFieldList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObj/queryObjFieldList',
        data
    }, 'post').init(success, error, cbs);
};

// 删除对象字段
export const deleteBizObjField = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/objField/deleteBizObjField',
        params
    }, 'get').init(success, error, cbs);
};

// 获取选项字段关联关系列表
export const getRelationList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/fieldOptionRelation/getRelationList',
        params
    }, 'get').init(success, error, cbs);
};

// 删除选项字段关联关系
export const delOptionRelation = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/fieldOptionRelation/delOptionRelation',
        data
    }, 'post').init(success, error, cbs);
};

// 获取全部父选项字段
export const getAllParentField = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/fieldOptionRelation/getAllParentField',
        params
    }, 'get').init(success, error, cbs);
};

// 获取全部子选项字段
export const getAllChildField = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/fieldOptionRelation/getAllChildField',
        params
    }, 'get').init(success, error, cbs);
};

// 获取关联关系相关详细信息
export const getRelationDetail = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/fieldOptionRelation/getRelationDetail',
        data
    }, 'post').init(success, error, cbs);
};

// 获取父子段和子字段的选项列表
export const getFieldOptions = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/fieldOptionRelation/getFieldOptions',
        data
    }, 'post').init(success, error, cbs);
};

// 获取关联关系相关详细信息
export const addOptionRelation = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/fieldOptionRelation/addOptionRelation',
        data
    }, 'post').init(success, error, cbs);
};
// 获取关联关系相关详细信息
export const editOptionRelation = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/fieldOptionRelation/editOptionRelation',
        data
    }).init(success, error, cbs);
};
// 获取对象字段列表
export const queryObjList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObj/queryObjList',
        data
    }).init(success, error, cbs);
};

export const changeObjFieldStatus = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/objField/changeObjFieldStatus',
        data
    }, 'put').init(success, error, cbs);
};

export default {
    queryObjFieldList,
    getRelationList,
    delOptionRelation,
    getAllParentField,
    getAllChildField,
    getRelationDetail,
    addOptionRelation,
    editOptionRelation,
    getFieldOptions,
    queryObjList,
    changeObjFieldStatus
};
