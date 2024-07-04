import util from '@/libs/util';

/* piwik接口 */
// 获取访客列表
export const getVisitorHistoryListPiwik = ({
    orgId,
    query,
    serverAccId,
    orderType,
    orderColumn,
    pageNo,
    pageSize,
    startDate,
    endDate
}) => util.ajaxInternationalJsonLangTime({
    url: '/piwikRead/visitorHistory/getVisitorHistory',
    // url: 'http://192.168.70.181:7207/piwikRead/visitorHistory/getVisitorHistory',
    method: 'POST',
    data: {
        orgId,
        query,
        serverAccId,
        orderType,
        orderColumn,
        pageNo,
        pageSize,
        startDate,
        endDate
    }
}).then(res => res.data);


// 获取访客类型列表
export const getVisitorTypeListPiwik = ({ type, orgId }) => util.ajaxInternationalJson({
    url: '/piwikRead/visitorCategories/get',
    method: 'POST',
    data: {
        type,
        orgId
    }
}).then(res => res.data);


// 修改备注
export const changeRemarkPiwik = ({
    visitorId,
    orgId,
    visitorRemark,
    updateUserId,
    visitorAccId
}) => util.ajaxInternationalJson({
    url: '/piwik/visitorInfo/updateCategoriesOrRemark',
    method: 'POST',
    data: {
        visitorId,
        orgId,
        visitorRemark,
        updateUserId,
        visitorAccId
    }
}).then(res => res.data);


// 修改访客类别
export const changeVisitorTypePiwik = ({
    visitorId,
    orgId,
    visitorRemark,
    visitorCategoriesId,
    visitorCategoriesName,
    updateUserId
}) => util.ajaxInternationalJson({
    url: '/piwik/visitorInfo/updateCategoriesOrRemark',
    method: 'POST',
    data: {
        visitorId,
        orgId,
        visitorRemark,
        visitorCategoriesId,
        visitorCategoriesName,
        updateUserId
    }
}).then(res => res.data);


// 修改访客状态
export const changeStatusPiwik = ({
    visitorId,
    orgId,
    originalVisitorStatus,
    visitorStatus,
    visitorClueId,
    updateUserId
}) => util.ajaxInternationalJson({
    url: '/piwik/visitorInfo/updateVisitorStatus',
    method: 'POST',
    data: {
        visitorId,
        orgId,
        originalVisitorStatus,
        visitorStatus,
        visitorClueId,
        updateUserId
    }
}).then(res => res.data);


// 访客历史时间轴
export const getTimeLinePiwik = (visitorId, orgId) => {
    return new Promise((resolve, reject) => {
        util.ajaxInternationalJson({
            url: '/piwikRead/visitorHistory/getVisitorTimeAxis',
            method: 'GET',
            params: {
                visitorId,
                orgId
            }
        }).then(res => {
            if (res.data.code === '1') {
                return resolve(res.data);
            } else {
                resolve(null);
            }
        }).catch(error => {
            console.log(error);
            resolve(null);
        });
    });
};


// 获取该条会话的详情
export const getVisitorHistoryDetailPiwik = ({ idvisit, visitorId }) => {
    return new Promise((resolve, reject) => {
        util.ajaxInternationalJson({
            url: '/piwikRead/visitorHistory/getVisitorHistoryDetail',
            method: 'POST',
            params: {
                idvisit,
                visitorId
            }
        }).then(res => {
            if (res.data.code === '1') {
                return resolve(res.data);
            } else {
                reject(error);
            }
        }).catch(error => {
            console.log(error);
            reject(error);
        });
    });
};


// 获取该条会话的留言列表
export const getLeaveMessagePiwik = ({ idvisit, visitorId }) => {
    return new Promise((resolve, reject) => {
        util.ajaxInternationalJson({
            url: '/piwikRead/visitorHistory/getVisitorLeaveMessage',
            method: 'POST',
            params: {
                idvisit,
                visitorId
            }
        }).then(res => {
            if (res.data.code === '1') {
                return resolve(res.data);
            } else {
                reject(error);
            }
        }).catch(error => {
            console.log(error);
            reject(error);
        });
    });
};


// 修改访客类别
export const changeVisitorType = (orgId, item) => util.ajaxInternationalJson({
    url: '/piwik/visitorCategories/update',
    method: 'post',
    data: {
        orgId,
        ...item
    }
}).then(res => res.data);


export const addVisitorType = (orgId, name) => util.ajaxInternationalJson({
    url: '/piwik/visitorCategories/add',
    method: 'post',
    data: {
        orgId,
        name,
        type: 1
    }
}).then(res => res.data);


