import { Request } from '@/https/baseUtilAjax';
// 获取 全部用户 包括已经离职的、禁用的
const getUserDataList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/user/getUserDataTables',
        data
    }, 'get').init(success, error, cbs);
};
// 发送手机号验证码
const sendVerificationCodeByMobile = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/verification/sendVerificationCodeByMobile',
        params
    }, 'get').init(success, error, cbs);
};

// 发送邮箱验证码
const sendVerificationCodeByEmail = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/verification/sendVerificationCodeByEmail',
        params
    }, 'get').init(success, error, cbs);
};

// 验证验证码是否正确
const verificationCode = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/account/verificationCode',
        data
    }).init(success, error, cbs);
};

// 通过邮件链接中MD5值获取账号信息
const accountByMD5Str = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/account/accountByMD5Str',
        params
    }, 'get').init(success, error, cbs);
};

// 用户名查重
const accountCheckRepeat = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/account/accountCheckRepeat',
        // url: '/v2-privilege/account/passVerification',
        params
    }, 'get').init(success, error, cbs);
};

// 获取租户信息
const getOrgReport = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/org/getOrgReport',
        params
    }, 'get').init(success, error, cbs);
};

// 获取插入字段
const fields4meta = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/v1/common/fields4meta',
        data
    }, 'post').init(success, error, cbs);
};
// 关联关系字段筛选器查左侧字段
const findRelFilterFields = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/objField/findRelFilterFields',
        params
    }, 'get').init(success, error, cbs);
};
// 关联关系字段筛选器查右侧字段
const findRelFilterFieldsRange = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/objField/findRelFilterFieldsRange',
        params
    }, 'get').init(success, error, cbs);
};
// 计算类型汇总累计筛选器查字段
const findCountFieldFilterFields = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/objField/findCountFieldFilterFields',
        params
    }, 'get').init(success, error, cbs);
};
// 语法校验
const grammarcheck = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/v1/common/grammarcheck',
        data
    }).init(success, error, cbs);
};

// 列表视图筛选条件查左侧字段
const findListViewFilterFields = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-layout/view/findListViewFilterFields',
        params
    }, 'get').init(success, error, cbs);
};

// 列表视图筛选条件查右侧字段
const findListViewFilterFieldsRange = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-layout/view/findListViewFilterFieldsRange',
        params
    }, 'get').init(success, error, cbs);
};

// 列表视图筛选条件查右侧字段
const queryOptionByFieldIds = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/option/queryOptionByFieldIds',
        data
    }).init(success, error, cbs);
};

const listOptionsSet = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/v1/common-option/listOptionsSet',
        params
    }, 'get').init(success, error, cbs);
};

const getNewusers = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/user/permission/getNewusers',
        params
    }, 'get').init(success, error, cbs);
};

// 查询选择数据列表（关联关系字段）
const relFieldQueryBizDataList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/bizData/relFieldQueryBizDataList',
        data
    }).init(success, error, cbs);
};

export {
    getUserDataList,
    sendVerificationCodeByMobile,
    sendVerificationCodeByEmail,
    verificationCode,
    accountByMD5Str,
    accountCheckRepeat,
    getOrgReport,
    fields4meta,
    findRelFilterFields,
    findRelFilterFieldsRange,
    findCountFieldFilterFields,
    grammarcheck,
    findListViewFilterFields,
    findListViewFilterFieldsRange,
    queryOptionByFieldIds,
    listOptionsSet,
    getNewusers,
    relFieldQueryBizDataList
};