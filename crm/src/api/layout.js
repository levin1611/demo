// 布局设置 相关 api

import { Request } from '@/https/baseUtilAjax';

// 请求布局列表 - 业务对象下所有布局
export const getAllLayout = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-layout/v1/layout/layoutList',
        params
    }, 'get').init(success, error, cbs);
};

// 删除布局
export const deleteLayout = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: `/v2-layout/v1/layout/${data.id}`,
        data
    }, 'delete').init(success, error, cbs);
};

// 获取设置信息
export const getLayoutSet = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: `/v2-layout/v1/layout/${params.id}`
    }, 'get').init(success, error, cbs);
};

// 获取布局初始信息 - 新建布局时用
export const getLayoutInitData = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-layout/v1/layout/getInitLayoutInfo',
        params
    }, 'get').init(success, error, cbs);
};

// 新增布局数据
export const createLayout = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-layout/v1/layout/insert',
        data
    }).init(success, error, cbs);
};

// 更新布局数据
export const saveLayoutSet = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-layout/v1/layout/update',
        data
    }).init(success, error, cbs);
};

// 获取布局所有可配置组件
export const getLayoutCompoList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-layout/v1/layout/getLayoutModuleList',
        params
    }, 'get').init(success, error, cbs);
};
// 根据布局类型查询布局列表
export const layoutListByType = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-layout/v1/layout/layoutListByType',
        params
    }, 'get').init(success, error, cbs);
};
// 配置布局权限
export const configLayoutPermissions = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-layout/v1/layout/configLayoutPermissions',
        data
    }).init(success, error, cbs);
};

// 获取视图列表
export const getUserViewList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/layout/view/getUserViewList',
        params
    }, 'get').init(success, error, cbs);
};
export default {
    getAllLayout,
    deleteLayout,
    getLayoutSet,
    getLayoutInitData,
    createLayout,
    saveLayoutSet,
    getLayoutCompoList,
    getUserViewList,
    layoutListByType,
    configLayoutPermissions
};
