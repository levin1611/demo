import { Request } from '@/api/baseUtilAjax';
// 修改管理类型
const manageUpdate = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: 'new-privilege/manage/update',
        method: 'put',
        data
    }).init(success, error, cbs);
};

// 获取分配管理权限
const getManager = async (data, success = null, error = null, cbs = []) => {
    const id = data.id;
    return new Request({
        url: `new-privilege/manage/manageruser/${id}`,
        method: 'get'
    }).init(success, error, cbs);
};

// 获取该部门下的成员
const getManageruser = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: 'new-privilege/manage/user',
        method: 'get',
        params
    }).init(success, error, cbs);
};

// 保存修改后的角色名称(也是检查名字是否重复)
const nameManage = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: 'new-privilege/manage/name',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 保存已添加用户列表
const addManagerUser = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: 'new-privilege/manage/addManagerUser',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 删除角色
const deleteManager = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: 'new-privilege/manage/delete',
        method: 'delete',
        params
    }).init(success, error, cbs);
};

// 添加角色
const addManager = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: 'new-privilege/manage/add',
        method: 'post',
        data
    }).init(success, error, cbs);
};

export default {
    manageUpdate,
    getManager,
    getManageruser,
    nameManage,
    addManagerUser,
    deleteManager,
    addManager
};
