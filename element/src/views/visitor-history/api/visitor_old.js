import util from '@/libs/util';

/* 原接口 */
// 获取访客数据列表
export const getVisitorHistoryListOld = ({
    orderType,
    orderColumn,
    enterpriseId,
    searchConditionItem,
    pageSize,
    pageNo
}) => util.ajaxInternationalJson({
    url: '/server/enterpriseVisitorsNew',
    method: 'POST',
    data: {
        orderType,
        orderColumn,
        enterpriseId,
        searchConditionItem,
        pageSize,
        pageNo
    }
}).then(res => res.data);


export const enterpriseVisitorsTotalNew = ({
    orderType,
    orderColumn,
    enterpriseId,
    searchConditionItem,
    pageSize,
    pageNo
}) => util.ajaxInternationalJson({
    url: '/server/enterpriseVisitorsTotalNew',
    method: 'post',
    data: {
        orderType,
        orderColumn,
        enterpriseId,
        searchConditionItem,
        pageSize,
        pageNo
    }
}).then(res => res.data);

// 获取访客类型列表--可能被弃用
export const getVisitorTypeOld = (enterpriseId) => util.ajaxInternational({
    url: '/server/getAllVisitorType',
    method: 'post',
    data: {
        enterpriseId
    }
}).then(res => res.data);


// 修改备注
export const changeRemarkOld = ({ visitorId, remark }) => util.ajaxInternational({
    url: '/visitortrace/uploadVisitorRemark',
    method: 'POST',
    data: {
        visitorId,
        remark
    }
}).then(res => res.data);


// 修改访客类别
export const changeVisitorTypeOld = ({ visitorId, visitorTypeId }) => util.ajaxInternational({
    url: '/server/updateEnterpriseVisitorType',
    method: 'POST',
    data: {
        visitorId,
        visitorTypeId
    }
}).then(res => res.data);


// 修改访客状态
export const changeStatusOld = ({
    visitorId,
    crmStatus,
    crmTargetId,
    sourceCrmStatus
}) => util.ajaxInternational({
    url: '/visitor-chat/server/updateVisitorCrmInfo',
    method: 'POST',
    data: {
        visitorId,
        crmStatus,
        crmTargetId,
        sourceCrmStatus
    }
}).then(res => res.data);


// 访客历史时间轴
export const getTimeLineOld = (visitorId) => {
    return new Promise((resolve, reject) => {
        util.ajaxInternational({
            url: '/visitor-chat/server/getCussTraceEventByVisotorId',
            method: 'get',
            params: {
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

// 访客历史时间轴
export const getTimeLineNew = params => {
    return new Promise((resolve, reject) => {
        util.ajaxInternational({
            // url: 'http://192.168.74.101:7217/piwikRead/visitorHistory/getVisitorTimeAxisNew',
            url: '/piwikRead/visitorHistory/getVisitorTimeAxisNew',
            method: 'get',
            params
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


// 获取该条会话的详情
export const getVisitorHistoryDetailOld = ({
    eventId,
    visitorId
}) => {
    return new Promise((resolve, reject) => {
        util.ajaxInternational({
            url: '/visitor-chat/server/getVisitorAllInfoByEventId',
            method: 'POST',
            data: {
                eventId,
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
export const getLeaveMessageOld = (visitorId) => {
    return new Promise((resolve, reject) => {
        util.ajax({
            url: '/form-cust/form/getColumnValueListByVisitorId',
            method: 'POST',
            data: {
                visitorId
            }
        }).hen(res => {
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
