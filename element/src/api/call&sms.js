import { Request } from '@/api/baseUtilAjax';


// 获取 通话详情
export const getCallDeatil = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/cinnox-app/cxChatDetail/queryCallDetail',
        data
    }).init(success, error, cbs);
};


// 获取 保存翻译消息
export const saveCinnoxTranslateTxt = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/cinnox-app/cxChatDetail/saveTranslateMessage',
        data
    }).init(success, error, cbs);
};
// 录音转文字接口
export const uplodRecord = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/cinnox-app/cxChatDetail/recordToText',
        data
    }).init(success, error, cbs);
};
// 录音转文字接口
export const getTxtByurl = async (data = {}, url, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: url,
        params: data
    }, 'get').init(success, error, cbs);
};
// 获取询盘录入状态
export const getContactsStatusByPhone = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/inquiryCommon/getContactsStatusByPhone',
        data
    }).init(success, error, cbs);
};
