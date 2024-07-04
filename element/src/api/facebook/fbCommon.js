import { Request } from '@/api/baseUtilAjax';

// 请求 FB 客服列表
const getFbServiceList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/social/facebook/user/getUserList',
        params: data
    }, 'get').init(success, error, cbs);
};

// FB 分配客服
const transferFbService = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/social/customer/server/handDistributeCustomer',
        data
    }).init(success, error, cbs);
};

// 请求 FB 对话列表
const getConversationList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/social/getPageConversations',
        data
    }).init(success, error, cbs);
};

// 获取 FB 自动分配规则启用状态
const getFbDistributeRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/rule/facebookcustomer/getByOrgId',
        data
    }).init(success, error, cbs);
};

// 保存 FB 自动分配规则启用状态
const saveFbDistributeRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/rule/facebookcustomer/updateStatus',
        data
    }).init(success, error, cbs);
};

// 获取fb私聊的会话头像
const getConversationPicture = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: 'social/page/getConversationPictureByPageIdAndConversationId',
        data
    }).init(success, error, cbs);
};

// 获取fb绑定主页的头像
const getPictureUrlByPageId = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: 'social/page/getPictureUrlByPageId',
        data
    }).init(success, error, cbs);
};

// fb-发帖管理-发布推文埋点接口
const gaOperate = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/social/ga/operate',
        data
    }).init(success, error, cbs);
};
export default {
    getFbServiceList,
    transferFbService,
    getConversationList,
    getFbDistributeRule,
    saveFbDistributeRule,
    getConversationPicture,
    getPictureUrlByPageId,
    gaOperate
};
