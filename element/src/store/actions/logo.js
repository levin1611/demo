/* 日志接口 */

import util from '@/libs/util';
import i18n from '@/locale';
import Cookies from 'js-cookie';
import { Notification } from 'element-ui';

// 在线状态 obj.flag=1 在线 0离线
export function onlineStatus({ state, dispatch, commit }, obj) {
    util.ajaxInternational({
        url: '/visitor-chat/server/updateEnterpriseidServiceOnlineStatusNew',
        method: 'post',
        data: {
            accid: obj.accId,
            operateSource: 'front-end-chat',
            onlineFlag: obj.flag
        }
    }).then(response => {
        if (obj.flag === 1) {
            dispatch('testAnalytics', {
                eventName: 'service_onConnect',
                type: '',
                from: obj.accId,
                to: '',
                remark: '客服账号连接成功'
            });
        } else {
            dispatch('testAnalytics', {
                eventName: 'service_onConnect',
                type: '',
                from: obj.accId,
                to: '',
                remark: '客服账号断开成功'
            });
            // sendLogoutMyChatMessage(state.userId)
        }
        // 当客服在线状态发送改变的时候，刷新客服在线列表
        state.isReloadServerList = obj.flag;
    });
}

// 聊天状态记录
export function testAnalytics({ state, commit }, obj) {
    util.ajaxInternational({
        url: '/visitor-chat/server/inputLoggerInfoForDebug',
        method: 'post',
        data: {
            eventType: obj.type,
            eventName: obj.eventName,
            visitorId: state.userName,
            acctId: Cookies.get('accId'),
            fromAccId: obj.from,
            toAccId: obj.to,
            remark: obj.remark
        }
    }).then(response => {

    });
}

// 保存聊天内容
export function saveChatMsg({ state, commit }, obj) {
    let fileUrl = '';
    const msg = obj.msg;
    let body = msg.text;
    if (msg.type != 'text') {
        fileUrl = msg.file.url;
        body = msg.file.name;
    }
    util.ajaxInternationalLongTime({
        url: '/visitor-chat/server/saveChatMessageNew',
        method: 'post',
        data: {
            fromAccount: msg.from,
            fromNick: msg.fromNick,
            toAccount: msg.to,
            flow: obj.flow,
            idClient: msg.idClient,
            msgTimestamp: msg.time,
            msgType: msg.type,
            attach: fileUrl,
            enterpriseId: state.enterpriseId,
            body: body,
            operateSource: obj.type,
            visitorId: obj.visitorId,
            toNick: obj.toNick
        }
    }).then(response => {
    });
}

/* 匹配聊天邮箱 */
export function chatWithEmail({ state, commit }, obj) {
    util.ajaxInternational({
        url: '/visitortrace/chatWithEmail',
        method: 'post',
        data: {
            enterpriseId: state.enterpriseId,
            visitorId: obj.visitorId,
            email: obj.email[0]
        }
    }).then(response => {
    });
    /**
     * 增加自动关联逻辑：
     * 如果访客未录入询盘 --- 筛选出访客当前发的这条消息，如果信息中含有邮箱字段，那么就调接口判断邮箱是否录入过联系人，如果有则自动关联上
     */
    // obj.email[0].length < 50 &&
    let visitorInfo;
    util.ajaxInternationalJson({
        url: '/piwikRead/visitorInfo/getVisitorInfo',
        method: 'GET',
        params: {
            visitorId: obj.visitorId
        }
    }).then(visitorRes => {
        if (visitorRes.data.code === '1' && visitorRes.data.data) {
            visitorInfo = visitorRes.data.data;
            if (visitorInfo) {
                if (visitorInfo.crmStatus != 102 && visitorInfo.crmStatus != 2) {
                    // "interactType" ―― 交互类型:1对话、 2网站留言、 3fbLeads、 4fb私信、 5fb评论
                    // "relationId" "―― 相关id(type为2时,交互Id为访客ID;relation_id为表单Id，其他情况与交互id相同)
                    util.ajaxJson({
                        url: '/crm/auto/getContactsId',
                        method: 'post',
                        data: {
                            email: obj.email[0],
                            orgId: state.enterpriseId,
                            interactType: 1,
                            interactId: obj.visitorId,
                            relationId: obj.visitorId
                        }
                    }).then(contactsRes => {
                        if (contactsRes.data.code === '1') {
                            if (contactsRes.data.data) {
                                util.ajaxInternationalJson({
                                    url: '/piwik/autoAssociate/getAutoAssociate',
                                    method: 'POST',
                                    data: {
                                        orgId: state.enterpriseId,
                                        visitorId: obj.visitorId,
                                        contactsId: contactsRes.data.data.contactsId,
                                        nickName: contactsRes.data.data.nickName,
                                        companyName: contactsRes.data.data.companyName,
                                        email: obj.email[0],
                                        inquiryId: contactsRes.data.data.inquiryId,
                                        userIdList: contactsRes.data.data.userIdList
                                    }
                                }).then(assosiateRes => {
                                    if (assosiateRes.data.code === '1') {
                                        util.ajaxJson({
                                            url: '/crm/auto/updateBindStatus',
                                            method: 'get',
                                            params: {
                                                uniqueId: contactsRes.data.data.uniqueId
                                            }
                                        }).then(res => res.data);

                                        util.ajaxInternationalJson({
                                            url: '/piwik/visitorInfo/updateVisitorStatusForAssociate',
                                            method: 'POST',
                                            data: {
                                                orgId: state.enterpriseId,
                                                originalVisitorStatus: state.visitorBaseInfo.crmStatus || '',
                                                visitorStatus: 102,
                                                updateUserId: state.userId,
                                                visitorId: obj.visitorId
                                            }
                                        }).then(updateRes => {
                                            // 改变state中该访客的相关信息
                                            if (obj.visitorId === state.visitorBaseInfo.visitorId) {
                                                state.visitorBaseInfo.crmStatus = '102';
                                                state.visitorBaseInfo.emailAutoAssociateInfo = contactsRes.data.data;
                                                state.currInquiryId = contactsRes.data.data.inquiryId;
                                                state.isShowTinyDetail = true;
                                                state.currVisitorType = 'crmType';
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            }
        }
    });
}

/* ga代码 */
export function google_analytics({ state, commit }, obj) {
    /*  var page=obj.page
      var url=obj.url
      let str='https://admin.leadscloud.com/Front-Vue/#'+url
      window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
      ga('create', 'UA-124568360-1', 'auto', {
        userId: Cookies.get('userId')
      });
      var dimensionValue = Cookies.get('enterpriseId');
      ga('set', 'dimension1', dimensionValue);
      var dimensionValue2 = decodeURI(Cookies.get('fullName'))
      ga('set', 'dimension2', dimensionValue2);
      ga('set', 'title', page);
      ga('send', 'pageview', page, str); */
}

// function sendLogoutMyChatMessage(id) {
//     const options = `userId=${id}`;
//     // 创建 - 非IE6 - 第一步
//     if (window.XMLHttpRequest) {
//         var xhr = new XMLHttpRequest();
//     } else { // IE6及其以下版本浏览器
//         var xhr = new ActiveXObject('Microsoft.XMLHTTP');
//     }
//     // 接收 - 第三步
//     xhr.onreadystatechange = function() {
//         if (xhr.readyState == 4) {
//             const status = xhr.status;
//             if (status >= 200 && status < 300) {
//                 // success
//             } else {
//                 // fail
//             }
//         }
//     };
//     // 连接 和 发送 - 第二步
//     xhr.open('POST', 'https://testwebsocket.leadscloud.com/websocketLeavemessage/sendLogoutMyChatMessage', false);
//     // 设置表单提交时的内容类型
//     xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//     xhr.send(options);
// }

export function saveMsgId({ state, commit }, obj) {
    const { msg, visitorId } = obj;
    const msgType = msg.flow === 'in' ? 'client' : 'server';
    util.ajaxInternational({
        url: '/piwik/chatMatomoVisit/save',
        method: 'post',
        data: {
            orgId: state.enterpriseId,
            msgId: msg.idClient,
            msgType: msgType,
            sessionId: msg.sessionId,
            currentUrl: window.location.href,
            visitorId: visitorId
        }
    });
}
/** 处理调用sdk返回error */
export function onSDKCallbackError(err) {
    let msg = '';
    switch (err.code) {
        /* case '408':
            msg = '客户端请求超时';
            break;
        case '500':
            msg = '服务器内部错误';
            break;
        case '501':
            msg = '数据库操作失败';
            break;
        case '503':
            msg = '服务器繁忙';
            break;
        case 'Error_Internet_Disconnected':
            msg = '网断了';
            break;
        case 'Error_Timeout':
            msg = '超时';
            break;
        case 'File_Too_Large':
            msg = '文件过大';
            break;
        case 'Error_Unknown':
            msg = '未知错误';
            break; */
        case 'Error_Connection_Socket_State_not_Match':
            msg = 'socket状态不对';
            Notification.error({
                title: i18n.t('chat.chatError'),
                message: i18n.t('chat.YX_error_code.Error_Connection_Socket_State_not_Match')
            });
            break;
        default:
            break;
    }
}
