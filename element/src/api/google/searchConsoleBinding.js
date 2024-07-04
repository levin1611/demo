import { Request } from '@/api/baseUtilAjax';

// 获取站点列表
const getAccountList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/bind/getConfigList',
        data
    }).init(success, error, cbs);
};

// 获取网页索引编制图表数据
const getGoogleBindUrl = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/bind/getAuthorizationUrl',
        data
    }).init(success, error, cbs);
};

// 获取网页未被编入索引的原因表格数据
const getSiteList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/bind/getSiteList',
        data
    }).init(success, error, cbs);
};

// 获取已提交的站点地图
const saveSite = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/oversea/googlesearch/site/saveList',
        data
    }).init(success, error, cbs);
};

// 获取已提交的站点地图
const getBoundSiteList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/googlesearch/site/getList',
        data
    }).init(success, error, cbs);
};

// 获取已提交的站点地图
const unbindSite = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/oversea/googlesearch/site/updateBindStatus',
        data
    }).init(success, error, cbs);
};

export default {
    getAccountList,
    getGoogleBindUrl,
    getSiteList,
    saveSite,
    getBoundSiteList,
    unbindSite
};
