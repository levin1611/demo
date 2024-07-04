import { Request } from '@/api/baseUtilAjax';
// 请求广告账号数据
const getPageByOrg = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/fbAdAccount/pageByOrg',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 确认解绑账号
const unbindAdAccount = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/fbAdAccount/unbind',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 删除失效账户
const deleteAdAccount = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/fbAdAccount/delete',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 请求 FB account 数据
const getfbPersonPages = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/social/audienceoptimization/fbPersonPages',
        method: 'get',
        params
    }).init(success, error, cbs);
};

// 请求 FB account 下所有 ad account 数据
const getfbClientAdAccounts = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/social/audienceoptimization/fbClientAdAccounts',
        method: 'get',
        params
    }).init(success, error, cbs);
};

// 获取 fb 账号已绑定的 ad account
const getBindAdList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/fbAdAccount/getListByOauthConfigId',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 解绑fb ad账号后 保存接口
const saveFbAdAccount = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/fbAdAccount/save',
        method: 'post',
        data
    }).init(success, error, cbs);
};

export default {
    getPageByOrg,
    unbindAdAccount,
    deleteAdAccount,
    getfbPersonPages,
    getfbClientAdAccounts,
    getBindAdList,
    saveFbAdAccount
};
