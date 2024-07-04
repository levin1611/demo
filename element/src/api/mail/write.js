import { Request } from '@/api/baseUtilAjax';


// 获取发件人列表
const mailAccountsSelectForGroup = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMail',
        url: '/mail/mailAccountsSelectForGroup',
        params
    }, 'get').init(success, error, cbs);
};
// 群发单显任务校验
const paramVerify = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/paramVerify',
        data
    }).init(success, error, cbs);
};
// 获取写信默认设置
const getWriteMaildefault = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/writeMailMsg',
        data
    }).init(success, error, cbs);
};
// 获取发件人列表
const getMailSignsGeneralSetting = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMail',
        url: '/mail/mailSignsGeneralSetting',
        params
    }, 'get').init(success, error, cbs);
};

export default {
    mailAccountsSelectForGroup,
    paramVerify,
    getWriteMaildefault,
    getMailSignsGeneralSetting
};
