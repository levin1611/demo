import { Request } from '@/https/baseUtilAjax';
// 获取登录验证码
const getPhoneLoginCode = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/cuss-login/verify/getPhoneLoginCode',
        params
    }, 'get').init(success, error, cbs);
};

// 创建通行证
const addPass = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/account/pass',
        data
    }).init(success, error, cbs);
};

// 验证通行证接口
const passVerification = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/account/passVerification',
        data
    }).init(success, error, cbs);
};

// 获取通行证
const passByLarkId = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/account/passByLarkId',
        params
    }, 'get').init(success, error, cbs);
};

// 更新通行证手机号
const updateMobile = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/account/updateMobile',
        data
    }).init(success, error, cbs);
};
// 更新通行证邮箱
const updateEmail = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/account/updateEmail',
        data
    }).init(success, error, cbs);
};
// 更新通行证密码
const updatePassword = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/account/password',
        data
    }, 'put').init(success, error, cbs);
};
// 通行证与租户关联
const passRelatedOrg = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/account/passRelatedOrg',
        data
    }).init(success, error, cbs);
};

// 登录通行证之后选择租户接口
const userLoginForOrg = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/user/userLoginForOrg',
        data
    }).init(success, error, cbs);
};

// 登出
const logout = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: `/v2-privilege/user/logout/${data.token}`,
        data
    }).init(success, error, cbs);
};
// 登出
const updateUsername = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/account/username',
        data
    }).init(success, error, cbs);
};

const accountCheckRepeat = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/account/accountCheckRepeat',
        params
    }, 'get').init(success, error, cbs);
};

export {
    getPhoneLoginCode,
    addPass,
    passVerification,
    passByLarkId,
    updateMobile,
    updateEmail,
    updatePassword,
    passRelatedOrg,
    userLoginForOrg,
    logout,
    updateUsername,
    accountCheckRepeat
};