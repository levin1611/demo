import { Request } from '@/api/baseUtilAjax';
// 获取默认功能权限
const getFunctionPermissions = async (params = {}, success = null, error = null, cbs = []) => {
    const roleId = params.role_id;
    return new Request({
        url: `new-privilege/resource/leadsCloud/${roleId}`,
        method: 'get'
    }).init(success, error, cbs);
};

// 编辑角色列表
const updateRole = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: 'new-privilege/role/update',
        method: 'put',
        data
    }).init(success, error, cbs);
};

// 编辑角色列表-传'功能权限'数组给后端
const authorizationRole = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: 'new-privilege/role/authorizationRole',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 验证角色列表的名字是否重复
const checkName = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: 'new-privilege/role/name',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 添加角色
const addRole = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: 'new-privilege/role/add',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 保存操作日志
const saveOperateLog = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: 'new-privilege/operateLog/saveOperateLog',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 删除角色
const deleteRole = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: 'new-privilege/role/delete',
        method: 'delete',
        params
    }).init(success, error, cbs);
};

export default {
    getFunctionPermissions,
    updateRole,
    authorizationRole,
    checkName,
    addRole,
    saveOperateLog,
    deleteRole
};
