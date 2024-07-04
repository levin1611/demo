import { Request } from '@/api/baseUtilAjax';

// 通过mailId 获取任务详情
const getMailTask = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/task/getTasksByMailId',
        data
    }).init(success, error, cbs);
};
// 单个下载
const downloadMailEml = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/mail/eml/generate/single',
        params
    }, 'get').init(success, error, cbs);
};
// 批量下载
const downloadMailEmlBatch = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/eml/generate/unpack',
        data
    }).init(success, error, cbs);
};
// 获取收发件时要使用的接口
const getMailUrl = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/mail/mailAccounts/routing/list',
        params
    }, 'get').init(success, error, cbs);
};
// 获取邮件详情相关的接口
const getMailDetailOther = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/mailDetailOther',
        params
    }, 'get').init(success, error, cbs);
};

export default {
    getMailTask,
    downloadMailEml,
    downloadMailEmlBatch,
    getMailUrl,
    getMailDetailOther
};
