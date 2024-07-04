import { Request } from '@/https/baseUtilAjax';
// 编辑部门成员接口
const setUserInfoByUserId = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/user/userInfoByUserId',
        data
    }, 'put').init(success, error, cbs);
};

const addUserInfo = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/user/userForOrg',
        data
    }).init(success, error, cbs);
};
const getMemberInfo = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/user/userInfoByUserId',
        params: data
    }, 'get').init(success, error, cbs);
};
// 导入数据
const inquiryImportLogGet = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/v2-crm/inquiryImportLog/get',
        data
    }).init(success, error, cbs);
};

// 批量授权数据
const batchAuthRole = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/user/batchAuthRole',
        data
    }).init(success, error, cbs);
};

// 批量授权数据
const takeBackAuthRole = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/user/takeBackAuthRole',
        data
    }).init(success, error, cbs);
};

const getUserListTable = async function(data = {}, success = null, error = null, cbs = []) {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/user/getUserList',
        data
    }).init(success, error, cbs);
};

// 获取职级职位列表
const getUserAttrInfoList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/v2-privilege/user/attr/getUserAttrInfoListByOrgIdAndType',
        data
    }).init(success, error, cbs);
};

const getCurrencyTypes = async (params = {}, success = null, error = null, cbs = []) => {
    // 币种查询
    return new Request({
        utilKey: 'ajax',
        url: '/v2-meta/transMoney/getCurrencyList',
        params
    }, 'get').init(success, error, cbs);
};
// 根据属性id查询用户属性接口
const getUserAttrInfo = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/v2-privilege/user/attr/getUserAttrInfo',
        params
    }, 'get').init(success, error, cbs);
};

// 新增职级职位列表
const saveUserAttrInfo = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/user/attr/saveUserAttrInfo',
        data
    }).init(success, error, cbs);
};

// 删除职级职位列表
const deleteUserAttrInfo = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/user/attr/deleteUserAttrInfo',
        data
    }, 'delete').init(success, error, cbs);
};

// 编辑职级职位列表
const updateUserAttrInfo = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/user/attr/updateUserAttrInfo',
        data
    }, 'put').init(success, error, cbs);
};

// 查询部分树结构数据
const getImmediateSuperUserTree = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/department/getImmediateSuperUserTree',
        data
    }, 'post').init(success, error, cbs);
};

const reSendLinkByEmailBatchApi = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/verification/reSendLinkByEmailBatch',
        data
    }, 'post').init(success, error, cbs);
};

const getUserDirectManageList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/user/getUserDirectManageList',
        data
    }, 'post').init(success, error, cbs);
};
const applicableMemberList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/user/member/list',
        data
    }, 'post').init(success, error, cbs);
};

// 查询范围
const getFieldsRange = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/v2-crm/repeat-rule/fieldsRange',
        params
    }, 'get').init(success, error, cbs);
};
// 成员权限规则
const getCustomPerList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/v2-privilege/customPermission/getUserCustomPermissionList',
        params
    }, 'get').init(success, error, cbs);
};

export {
    setUserInfoByUserId,
    batchAuthRole,
    addUserInfo,
    getMemberInfo,
    inquiryImportLogGet,
    getUserListTable,
    getUserAttrInfo,
    getUserAttrInfoList,
    saveUserAttrInfo,
    getCustomPerList,
    deleteUserAttrInfo,
    updateUserAttrInfo,
    getImmediateSuperUserTree,
    takeBackAuthRole,
    reSendLinkByEmailBatchApi,
    getUserDirectManageList,
    applicableMemberList,
    getFieldsRange,
    getCurrencyTypes
};
