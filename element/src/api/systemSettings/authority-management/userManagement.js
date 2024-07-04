import { Request } from '@/api/baseUtilAjax';
// 批量设置离职
const selectDeleteUserList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/user/selectDeleteUserList',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 账号禁用&账号解禁
const lockOrUnlockAccount = async (params, success = null, error = null, cbs = []) => {
    const data = params.data; // 传递的参数信息
    const boo = params.boo; // true的话,表示账号解禁,接口使用解禁接口（否则使用禁用接口）
    const url = boo ? '/new-privilege/user/unlock' : '/new-privilege/user/lock'; // 解禁接口&禁用接口
    return new Request({
        utilKey: 'ajaxJson',
        url,
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 新增部门
const departmentAdd = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/department/add',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 编辑部门
const departmentUpdate = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/department/update',
        method: 'put',
        data
    }).init(success, error, cbs);
};

// 删除部门
const departmentDelete = async (data, success = null, error = null, cbs = []) => {
    // 根据传入的id删除部门
    const id = data.id;
    return new Request({
        url: `/new-privilege/department/delete?id=${parseInt(id)}`,
        method: 'delete'
    }).init(success, error, cbs);
};

// 配置表格显示项
const getFieldOrderList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/commonField/getFieldOrderList',
        method: 'post',
        data
    }).init(success, error, cbs);
};

/** add_modal组件,校验登录名 */
const verifyLoginName = async (params, success = null, error = null, cbs = []) => {
    const value = params; // 登陆名
    return new Request({
        url: `/new-privilege/org/isExistByName?type=email&value=${value}`,
        method: 'get'
    }).init(success, error, cbs);
};

/** add_modal组件,校验姓名 */
const verifyName = async (params = {}, success = null, error = null, cbs = []) => {
    const value = params.value; // 姓名
    const orgId = params.orgId; // id
    return new Request({
        url: `/new-privilege/user/isExistByFullName?orgId=${orgId}&fullName=${value}`,
        method: 'get'
    }).init(success, error, cbs);
};

/** add_modal组件,校验完成后,发送新增用户的请求 */
const increaseUser = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/user/add',
        method: 'post',
        data
    }).init(success, error, cbs);
};

/** add_tree组件,校验部门名称 */
const isSameDeptName = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/department/isSameDeptName',
        method: 'post',
        data
    }).init(success, error, cbs);
};

/** updata_modal组件,修改&更新用户信息 */
const updateUser = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/user/update',
        method: 'put',
        data
    }).init(success, error, cbs);
};
/** delete_account组件,将账号设置离职 */
const existUserName = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/user/existUserName',
        data
    }).init(success, error, cbs);
};

/** delete_account组件,将账号设置离职 */
const deleteUser = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/user/delete',
        method: 'delete',
        data
    }).init(success, error, cbs);
};

/** allocation_permissions组件,修改账号权限 */
const editPermission = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/permission/addBatch',
        method: 'post',
        data
    }).init(success, error, cbs);
};

export default {
    selectDeleteUserList,
    lockOrUnlockAccount,
    departmentAdd,
    departmentUpdate,
    departmentDelete,
    getFieldOrderList,
    verifyLoginName,
    verifyName,
    increaseUser,
    isSameDeptName,
    updateUser,
    existUserName,
    deleteUser,
    editPermission
};
