import { Request } from '@/api/baseUtilAjax';

// 获取已绑定 google ads 账号
const getGoogleBindUrl = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/ads/getAuthorizationUrl',
        params
    }, 'get').init(success, error, cbs);
};

// 获取已绑定 google ads 账号
const getGoogleAdsAccountList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/ads/getAdwordsList',
        data
    }).init(success, error, cbs);
};

// 获取已绑定 google ads 账号的 token
const getBoundGAAccountTokenList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/adsCustomer/getBindCustomerTokenList',
        data
    }).init(success, error, cbs);
};

// 解绑 google ads 账号
const unbindGoogleAdsAccount = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/ads/googleRevokeToken',
        data
    }).init(success, error, cbs);
};

// 获取以相同 token 绑定的 google ads 账号
const getSameTokenAdsAccountList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/adsCustomer/getAdsNameListByOrgIdAndCustomerId',
        data
    }).init(success, error, cbs);
};

// 获取 google ads 账号绑定状态
const getBoundAdsAccountValidStatus = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/ads/checkAdwordsConfigValidByOrgIdAndAdsId',
        data
    }).init(success, error, cbs);
};

// 从 google 获取最新转化操作列表, 没有下方接口的部分数据(询盘云存储的 followupId 等数据), 但比询盘云数据准确
const getConversionListFromGoogle = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/adsConversion/getList',
        data
    }).init(success, error, cbs);
};

// 从询盘云数据库中获取转化列表
const getConversionListFromLeadsCloud = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/conversionRelation/getList',
        data
    }).init(success, error, cbs);
};

// 获取所有转化(相对于 /crm/conversionRelation/getList , 多了 conversionName)
const getConversionList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/conversionRelation/getConversionRelationAndName',
        data
    }).init(success, error, cbs);
};

// 新建/编辑 跟进状态与 Google 转化关联关系
const saveGoogleConversion = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/conversionRelation/saveOrUpdate',
        data
    }).init(success, error, cbs);
};

// 删除 跟进状态与 Google 转化关联关系
const deleteGoogleConversion = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/conversionRelation/deleteRelation',
        data
    }).init(success, error, cbs);
};

// 获取跟进状态可选的 Google 转化操作数据
const getConversionOptionForFollowUp = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/conversionRelation/getValidConversionRelation',
        data
    }).init(success, error, cbs);
};

// 后台要求新绑定 ads 账户后调用此接口
const syncGoogleAdsAccountData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/conversionRelation/completionRelationCustomerId',
        data
    }).init(success, error, cbs);
};

// 编辑 google 转化名称后调用此接口同步数据到询盘云
const syncGoogleConversionName = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/conversionRelation/updateConversionName',
        data
    }).init(success, error, cbs);
};

// 获取企业下所有跟进状态, 供下拉选择
const getFollowupStatusListForGoogleAdsBind = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/conversionAudit/getAttrs',
        params
    }, 'get').init(success, error, cbs);
};

export default {
    getGoogleBindUrl,
    getGoogleAdsAccountList,
    getBoundGAAccountTokenList,
    getSameTokenAdsAccountList,
    unbindGoogleAdsAccount,
    getBoundAdsAccountValidStatus,
    getConversionListFromGoogle,
    getConversionListFromLeadsCloud,
    saveGoogleConversion,
    deleteGoogleConversion,
    getConversionList,
    getConversionOptionForFollowUp,
    syncGoogleAdsAccountData,
    syncGoogleConversionName,
    getFollowupStatusListForGoogleAdsBind
};
