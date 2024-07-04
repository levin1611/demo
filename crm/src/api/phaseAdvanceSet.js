// 角色权限 相关 api

import { Request } from '@/https/baseUtilAjax';

// 保存阶段设置
export const saveStage = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/opportunitySalesStage/save',
        data
    }).init(success, error, cbs);
};

// 编辑阶段设置
export const updateStage = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/opportunitySalesStage/update',
        data
    }).init(success, error, cbs);
};

// 查询阶段设置列表
export const queryList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/opportunitySalesStage/queryList',
        data
    }).init(success, error, cbs);
};

// 删除阶段设置
export const deleteList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/opportunitySalesStage/delete',
        data
    }).init(success, error, cbs);
};

// sort
export const sortList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/opportunitySalesStage/sort',
        data
    }).init(success, error, cbs);
};
// 删除之前校验
export const deleteCheck = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/opportunitySalesStage/deleteCheck',
        data
    }).init(success, error, cbs);
};

// 查询阶段所属状态
export const getStatusOptionDetail = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/optionDetail/getStatusOptionDetail',
        data
    }).init(success, error, cbs);
};
export default {
    saveStage,
    updateStage,
    queryList,
    deleteList,
    sortList,
    deleteCheck,
    getStatusOptionDetail
};
