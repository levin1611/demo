import { Request } from '@/api/baseUtilAjax';


// 查询企微在线的账号
export const getQWOnlineAccount = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/qiyewx/user/getOnlineRobot',
        data,
        cancelToken
    }, 'post').init(success, error, cbs);
};
// 查询好友/联系人信息
export const getQWContactInfo = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/qiyewx/friend/getContactInfo',
        data,
        cancelToken
    }, 'post').init(success, error, cbs);
};
