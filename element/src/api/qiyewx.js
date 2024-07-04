import { Request } from '@/api/baseUtilAjax';


// 获取 企微未读消息的数量
export const getQWunreadCount = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/qiyewx/user/getUnreadCount',
        data
    }).init(success, error, cbs);
};
