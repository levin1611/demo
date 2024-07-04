import { Request } from '@/api/baseUtilAjax';

// 校验要回传的数据是否绑定了 google ads 广告账户
const checkRelation = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/conversionAudit/googleUpload/checkBindAds',
        data
    }).init(success, error, cbs);
};

// 校验要回传的数据是否绑定了 google ads 广告账户
const getGoogleUploadFailReasonList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/conversionAudit/getAllUploadFailTypes',
        params
    }, 'get').init(success, error, cbs);
};

export default {
    checkRelation,
    getGoogleUploadFailReasonList
};
