import { Request } from '@/api/baseUtilAjax';

const getContactsAndPublisher = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/time/line/query/getContactsAndPublisher',
        data
    }).init(success, error, cbs);
};

// 获取时间轴WhatsApp正文内容
const getTimeLineWaText = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: 'minor/timeline/getTimeLineText',
        data
    }).init(success, error, cbs);
};
// 获取时间轴短信正文内容
const getTimeLineCinnoxText = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/cinnox-app/cxChatDetail/sms/getTimeLineText',
        data
    }).init(success, error, cbs);
};

// 获取WhatsApp消息id
const getWaMessageId = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: 'minor/timeline/getMessageIdById',
        params
    }).init(success, error, cbs);
};

export default {
    getContactsAndPublisher,
    getTimeLineWaText,
    getTimeLineCinnoxText,
    getWaMessageId
};
