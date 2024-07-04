// CRM 公共的 请求相关接口
import { Request } from '@/api/baseUtilAjax';

// 获取 IP 黑名单
const getIpBlackList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/visitor-chat/blackList/getBlackList',
        data
    }).init(success, error, cbs);
};

// 删除 IP 黑名单条目
const unblockBlackListIp = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/visitor-chat/blackList/deleteBlackList',
        data
    }).init(success, error, cbs);
};

// 修改是否屏蔽当前网络 IP
const changeBlockSelf = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/visitor-chat/blackList/updateIpSwitch',
        data
    }).init(success, error, cbs);
};

// 查询屏蔽当前网络IP
const checkBlockSelf = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/visitor-chat/blackList/getIpSwitch',
        data
    }).init(success, error, cbs);
};

// 查询屏蔽当前网络IP
const addBlockList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/visitor-chat/blackList/blackListSave',
        data
    }).init(success, error, cbs);
};

export default {
    getIpBlackList,
    unblockBlackListIp,
    changeBlockSelf,
    checkBlockSelf,
    addBlockList
};
