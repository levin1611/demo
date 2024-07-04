import { Request } from '@/api/baseUtilAjax';

// 获取openapi管理页面信息
const getOpenApiData = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxOpenapiJson',
        url: '/openapi/get/param/getOpenApiData',
        data,
        cancelToken
    }).init(success, error, cbs);
};

// 重置接口
const resetSecret = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxOpenapiJson',
        url: '/openapi/get/param/resetSecret',
        data,
        cancelToken
    }).init(success, error, cbs);
};

// 编辑ip白名单接口
const updateWhiteIps = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxOpenapiJson',
        url: '/openapi/get/param/updateWhiteIps',
        data
    }).init(success, error, cbs);
};

export default {
    getOpenApiData,
    resetSecret,
    updateWhiteIps
};
