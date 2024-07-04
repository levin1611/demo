import { Request } from '@/api/baseUtilAjax';

// 获取跟进记录列表
const getFollowupList = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/followupList/getList',
        data,
        cancelToken
    }).init(success, error, cbs);
};
// 通过id 获取跟进记录详情
const getFollowupById = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/followup/getFollowupById',
        params
    }, 'get').init(success, error, cbs);
};
// 通过搜索词查公司
const getCompanyByName = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/followupList/getCompanyByName',
        params
    }, 'get').init(success, error, cbs);
};


export default {
    getFollowupList,
    getFollowupById,
    getCompanyByName
};
