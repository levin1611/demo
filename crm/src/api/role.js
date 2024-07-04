// 角色权限 相关 api

import { Request } from '@/https/baseUtilAjax';

// 请求所有角色(角色列表)
export const getAllRole = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/role/list',
        data
    }).init(success, error, cbs);
};

// 新建 角色
export const addRole = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/role',
        data
    }).init(success, error, cbs);
};

// 编辑 角色
export const editRole = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/role/updateRole',
        data
    }, 'post').init(success, error, cbs);
};

// 复制 角色
export const copyRole = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/role/duplication',
        data
    }).init(success, error, cbs);
};

// 删除 角色
export const deleteRole = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/role',
        data
    }, 'delete').init(success, error, cbs);
};

// 获取角色下的成员
export const getRoleUsers = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/role/user/list',
        data
    }).init(success, error, cbs);
};

// 角色授权给成员
export const setUserRoleAuth = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/role/user',
        data
    }).init(success, error, cbs);
};

// 取消成员的角色授权
export const cancelUserRoleAuth = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/role/user',
        data
    }, 'delete').init(success, error, cbs);
};

// 获取角色的权限, type: 1:功能权限, 5:字段权限, 数据权限由其他接口单独请求
export const getRolePerm = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/permissions',
        params
    }, 'get').init(success, error, cbs);
};

// 获取角色的数据权限
export const getRoleDataPerm = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/permissions/roleDataPermission',
        params
    }, 'get').init(success, error, cbs);
};

// 获取角色的数据权限
export const saveRoleAuthSet = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/role/authorization',
        data
    }).init(success, error, cbs);
};

// 角色名称查重
export const checkRepeatRoleName = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/role/verification',
        data
    }).init(success, error, cbs);
};

export default {
    getAllRole,
    addRole,
    editRole,
    copyRole,
    deleteRole,
    getRoleUsers,
    setUserRoleAuth,
    cancelUserRoleAuth,
    getRolePerm,
    getRoleDataPerm,
    saveRoleAuthSet,
    checkRepeatRoleName
};
