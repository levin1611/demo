// 线索 相关 api

import { Request } from '@/https/baseUtilAjax';

// 获取线索详情数据
export const getClueDetailData = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '',
        params
    }, 'get').init(success, error, cbs);
};

// 请求线索详情页布局数据
export const getDetailPageLayout = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: `/v2-layout/v1/layout/${params.id}`
    }, 'get').init(success, error, cbs);
};

// 转移线索
export const transferClue = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '',
        data
    }).init(success, error, cbs);
};

// 获取可转移线索的用户
export const getTransferClueUserList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '',
        data
    }).init(success, error, cbs);
};

// 编辑线索类型
export const editBizObjType = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '',
        data
    }).init(success, error, cbs);
};

// 获取所有可选的线索类型
export const getBizObjType = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '',
        data
    }).init(success, error, cbs);
};

// 查询列表页显示的字段
export const queryPageListFields = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/objData/queryPageListFields',
        params
    }, 'get').init(success, error, cbs);
};

// 获取适用布局
export const queryPageApplyLayoutInfo = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/objData/queryPageApplyLayoutInfo',
        params
    }, 'get').init(success, error, cbs);
};

// 查询选择数据列表（关联关系字段）
export const relFieldQueryBizDataList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/bizData/relFieldQueryBizDataList',
        data
    }).init(success, error, cbs);
};

// 查询选择数据列表（线索转化时查询）
export const getRelDataQueryBizDataList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/bizData/relDataQueryBizDataList',
        data
    }).init(success, error, cbs);
};

export const queryObjTypeList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObjType/queryObjTypeList',
        data
    }).init(success, error, cbs);
};

export default {
    getDetailPageLayout,
    getClueDetailData,
    transferClue,
    getTransferClueUserList,
    editBizObjType,
    getBizObjType,
    queryPageListFields,
    queryPageApplyLayoutInfo,
    relFieldQueryBizDataList,
    getRelDataQueryBizDataList,
    queryObjTypeList
};
