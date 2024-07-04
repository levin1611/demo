import { Request } from '@/api/baseUtilAjax';

export const getUserDetails = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/new-privilege/user/getUserDetails',
        data
    }).init(success, error, cbs);
};

export const bindingPhone = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/new-privilege/user/bindingPhone',
        data
    }).init(success, error, cbs);
};

export const unBundlePhone = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/new-privilege/user/unBundlePhone',
        data
    }).init(success, error, cbs);
};

export const getPhoneCode = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/new-privilege/user/getPhoneCode',
        data
    }).init(success, error, cbs);
};
// 获取个人基本信息
export const userInfoByUserId = async (params = {}, method = 'get', success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxLeadscloudJson',
        url: '/v2-privilege/user/userInfoByUserId',
        params: method !== 'put' ? params : null,
        data: method === 'put' ? params : null
    }, method).init(success, error, cbs);
};
