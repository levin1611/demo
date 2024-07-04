import { Request } from '@/api/baseUtilAjax';

// 开启/关闭工商关联设置
const switchBusinessSetting = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/business/switchBusinessSetting',
        data,
        cancelToken
    }).init(success, error, cbs);
};

// 保存/编辑工商关联信息接口
const saveOrUpdateBusinessSetting = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/business/saveOrUpdateBusinessSetting',
        data,
        cancelToken
    }).init(success, error, cbs);
};

// 保存/编辑工商关联信息接口
const getBusinessSettingsInfo = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/business/getBusinessSettingsInfo',
        params
    }, 'get').init(success, error, cbs);
};

export default {
    switchBusinessSetting,
    saveOrUpdateBusinessSetting,
    getBusinessSettingsInfo
};
