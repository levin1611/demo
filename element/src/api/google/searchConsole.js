import { Request } from '@/api/baseUtilAjax';

// 获取站点列表
const getSiteList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/googlesearch/site/getValidList',
        data
    }).init(success, error, cbs);
};

// 获取网页索引编制图表数据
const getPageIndexingChartData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/oversea/siteIndex/chart',
        data
    }).init(success, error, cbs);
};

// 获取网页未被编入索引的原因表格数据
const getNotIndexedReasonTableData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/oversea/siteIndex/notIndexedReason',
        data
    }).init(success, error, cbs);
};

// 获取未被编入索引的页面表格数据
const getNotIndexedUrlTableData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/oversea/siteIndex/getNotIndexedUrlData',
        data
    }).init(success, error, cbs);
};

// 获取被编入索引的页面表格数据
const getIndexedUrlTableData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/oversea/siteIndex/getIndexedUrlData',
        data
    }).init(success, error, cbs);
};

// 检查站点是否已失效
const checkSiteValidStatus = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/bind/grantConfig',
        params
    }, 'get').init(success, error, cbs);
};

// 获取搜索效果指标统计数据
const getSearchPerformanceStatData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/oversea/googlesearch/query/total',
        data
    }).init(success, error, cbs);
};

// 获取搜索效果图表数据
const getSearchPerformanceChartData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/oversea/googlesearch/query/dateList',
        data
    }).init(success, error, cbs);
};

// 获取搜索效果表格数据
const getSearchEffectTableData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/oversea/googlesearch/query/list',
        data
    }).init(success, error, cbs);
};

// 导出搜索效果表格数据
const exportSearchEffectTableData = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/oversea/googlesearch/download/list',
        params
    }, 'get').init(success, error, cbs);
};

// 获取站点地图表格数据
const getSitemapTableData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/siteMap/list',
        data
    }).init(success, error, cbs);
};

// 编辑站点地图提交周期
const editAutoCommitCycle = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/oversea/siteMap/rule',
        data
    }).init(success, error, cbs);
};

// 提交站点地图
const submitSitemap = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/siteMap/submit',
        data
    }).init(success, error, cbs);
};

export default {
    getSiteList,
    getPageIndexingChartData,
    getNotIndexedReasonTableData,
    getNotIndexedUrlTableData,
    getIndexedUrlTableData,
    checkSiteValidStatus,
    getSearchPerformanceStatData,
    getSearchPerformanceChartData,
    getSearchEffectTableData,
    exportSearchEffectTableData,
    getSitemapTableData,
    editAutoCommitCycle,
    submitSitemap
};
