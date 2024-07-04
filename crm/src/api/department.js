import { Request } from '@/https/baseUtilAjax';
// 请求部门成员的树状结构图
const getDepartmentDataTree = async (
    data = {},
    success = null,
    error = null,
    cbs = []
) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/department/getDepartmentUserTree',
        data
    }).init(success, error, cbs);
};

// 请求部门成员的树状结构图没有人员统计和成员名称
const getDepartmentFewDataTree = async (
    data = {},
    success = null,
    error = null,
    cbs = []
) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/department/getDepartment',
        data
    }).init(success, error, cbs);
};
// 添加部门
const addDepartmentApi = async (
    data = {},
    success = null,
    error = null,
    cbs = []
) => {
    return new Request(
        {
            utilKey: 'ajaxJson',
            // headers: { 'content-type': 'application/json' },
            url: '/v2-privilege/department/addDepartment',
            data
        },
        'put'
    ).init(success, error, cbs);
};
// 编辑部门信息
const editDepartmentApi = async (
    data = {},
    success = null,
    error = null,
    cbs = []
) => {
    return new Request(
        {
            utilKey: 'ajaxJson',
            // headers: { 'content-type': 'application/json' },
            url: '/v2-privilege/department/editDepartment',
            data
        },
        'post'
    ).init(success, error, cbs);
};
// 判断部门名称是否重复
const departMentNameIsOk = async (
    data = {},
    success = null,
    error = null,
    cbs = []
) => {
    return new Request({
        utilKey: 'ajaxJson',
        // headers: { 'content-type': 'application/json' },
        url: '/v2-privilege/department/getDepartmentByName',
        data
    }).init(success, error, cbs);
};

// 判断部门名称是否重复
const departmentUserNameList = async (
    data = {},
    success = null,
    error = null,
    cbs = []
) => {
    return new Request({
        utilKey: 'ajaxJson',
        // headers: { 'content-type': 'application/json' },
        url: '/v2-privilege/department/departmentUserNameList',
        data
    }).init(success, error, cbs);
};

const createNewRule = async (
    data = {},
    success = null,
    error = null,
    cbs = []
) => {
    return new Request(
        {
            utilKey: 'ajaxJson',
            url: '/v2-privilege/customPermission',
            data
        },
        'post'
    ).init(success, error, cbs);
};

const modifyRule = async (
    data = {},
    success = null,
    error = null,
    cbs = []
) => {
    return new Request(
        {
            utilKey: 'ajaxJson',
            url: '/v2-privilege/customPermission/updateRule',
            data
        },
        'post'
    ).init(success, error, cbs);
};

const getRuleDetail = async (id, success = null, error = null, cbs = []) => {
    return new Request(
        {
            utilKey: 'ajaxJson',
            url: `/v2-privilege/customPermission/${id}`
        },
        'get'
    ).init(success, error, cbs);
};

// 获取非下级部门的所有部门信息
const departmentInfoListNoSub = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/department/departmentInfoListNoSub',
        data: params
    }, 'post').init(success, error, cbs);
};
export {
    getDepartmentDataTree,
    addDepartmentApi,
    departMentNameIsOk,
    editDepartmentApi,
    departmentUserNameList,
    getDepartmentFewDataTree,
    createNewRule,
    modifyRule,
    getRuleDetail,
    departmentInfoListNoSub
};
