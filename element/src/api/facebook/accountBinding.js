import { Request } from '@/api/baseUtilAjax';
// 获取绑定账号列表
const getFacebookBindList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/oauth/getConfigList',
        method: 'get',
        params
    }).init(success, error, cbs);
};

// 获取绑定账号的头像
const getFacebookAvatar = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/social/getPictureUrl',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 获取facebook授权地址，并打开绑定窗口
const getAuthorizationUrl = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/oauth/getAuthorizationUrl',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 发送删除账号/主页请求
const deleteFacebookBind = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/oauth/deleteConfig',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 解绑操作账号&主页
const unBindingAccount = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/social/unBindingAccount',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 删除账号时, 查询账号关联广告账户, 生成提示语
const getListByOauthConfigId = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/fbAdAccount/getListByOauthConfigId',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 主页类型转换(跟人主页转为公司主页)
const changePageType = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/oauth/changePageType',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 查询个人主页
const getPageAccounts = async (data = {}, success = null, error = null, cbs = []) => {
    const params = data.params;
    const cancelToken = data.cancelToken;
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/api/getPageAccounts',
        method: 'get',
        params,
        cancelToken
    }).init(success, error, cbs);
};

// 添加绑定个人主页请求
const addPageAccounts = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/api/addPageAccounts',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 绑定个人主页
const bindingAccount = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/social/bindingAccount',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 更新绑定个人主页
const updateConversationPictureAndName = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/social/updateConversationPictureAndName',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 绑定主页后同步fb表单
const syncFacebookForm = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/social/form/syncFaceForm',
        method: 'get',
        params
    }).init(success, error, cbs);
};

// 绑定主页后同步消息
const syncFacebookAnswer = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/social/form/syncFaceAnswer',
        method: 'get',
        params
    }).init(success, error, cbs);
};

// 绑定主页后同步消息
const checkPageBindingStatus = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/oversea/oauth/getHomePageList',
        method: 'post',
        data
    }).init(success, error, cbs);
};

export default {
    getFacebookBindList,
    getFacebookAvatar,
    getAuthorizationUrl,
    deleteFacebookBind,
    unBindingAccount,
    getListByOauthConfigId,
    changePageType,
    getPageAccounts,
    addPageAccounts,
    bindingAccount,
    updateConversationPictureAndName,
    syncFacebookForm,
    syncFacebookAnswer,
    checkPageBindingStatus
};
