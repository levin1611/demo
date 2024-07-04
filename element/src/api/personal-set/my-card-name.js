import {
    Request
} from '@/api/baseUtilAjax';
export const getCardInfo = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax233',
        url: '/cardManage/checkUserInfoExists',
        params
    }, 'get').init(success, error, cbs);
};

export const updateCardUserInfo = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax233',
        url: '/cardManage/updateUserInfo',
        data
    }).init(success, error, cbs);
};
export const getPhoneCountryCode = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/cloudshare/phoneCountryCode/getAll',
        data
    }, 'get').init(success, error, cbs);
};
