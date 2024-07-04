import { Request } from '@/api/baseUtilAjax';

// 获取已绑定 google ads 账号
const getAdsAccountListSimpleInfo = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/adsCustomer/getCustomers',
        params
    }, 'get').init(success, error, cbs);
};

// 保存当前查看 Google ads 报告时选中的 google ads 账号
const rememberCurrAdsAccount = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/adsCustomer/setLastestCustomer',
        data
    }).init(success, error, cbs);
};

// 解绑 google ads 报告数据
const getAdsReport = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/adsReport/getReport',
        data
    }).init(success, error, cbs);
};

export default {
    getAdsAccountListSimpleInfo,
    rememberCurrAdsAccount,
    getAdsReport
};
