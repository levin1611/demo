import { Request } from '@/api/baseUtilAjax';

// 保存登录安全验证设置
export const saveSecuritySet = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/cuss-login/verify/save',
        data
    }).init(success, error, cbs);
};

// 获取登录安全验证设置
export const getSecuritySet = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/cuss-login/verify/findVerificationById',
        params
    }, 'get').init(success, error, cbs);
};

// 获取登录安全验证设置
export const getPhoneCaptcha = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/cuss-login/verify/getCode',
        params
    }, 'get').init(success, error, cbs);
};

// 获取登录安全验证设置
export const submitPhoneCaptcha = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/cuss-login/verify/verificationConfirm',
        data
    }).init(success, error, cbs);
};

// 获取登录验证码
export const getPhoneLoginCode = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/cuss-login/verify/getPhoneLoginCode',
        params
    }, 'get').init(success, error, cbs);
};

// 获取登录验证码
export const phoneLogin = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/cuss-login/phoneLogin',
        data
    }).init(success, error, cbs);
};

export default {
    saveSecuritySet,
    getSecuritySet,
    getPhoneCaptcha,
    submitPhoneCaptcha
};
