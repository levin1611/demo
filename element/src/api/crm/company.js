// CRM 客户相关 请求相关接口
import { Request } from '@/api/baseUtilAjax';

// 获取 客户列表数据 或 公海管理列表数据
const getCompanyFilterListDataAndTotal = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/mongo/companyRefactor/getFilterListDataAndTotal',
        data,
        cancelToken
    }).init(success, error, cbs);
};

// 客户 标记操作
const addMarker = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/company/addMarker',
        data
    }).init(success, error, cbs);
};

// 根据id获取 客户简短详情
const getSimpleCompany = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/company/getSimpleCompany',
        data
    }).init(success, error, cbs);
};

// 根据id获取 客户详情
const getCompany = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/company/get',
        data
    }).init(success, error, cbs);
};

// 公司去重
const sameCompanyName = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/company/sameCompanyName',
        data
    }).init(success, error, cbs);
};
// 公司去重弹窗用到的 newCompany.Vue, create-company.vue, uniqCompany.Vue 使用
const getNameList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/company/getNameList',
        data
    }).init(success, error, cbs);
};

// 获取公司日志
const getCompanyLogs = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/logs/getCompanyLogs',
        params
    }, 'get').init(success, error, cbs);
};

// 编辑公司保存接口
const companyUpdate = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/company/update',
        data
    }).init(success, error, cbs);
};
// 获取批量编辑的带有权限的表单
const getBatchUpdateFields = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/companyUpdate/getBatchUpdateFields',
        params
    }, 'get').init(success, error, cbs);
};
// 批量编辑提交
const batchUpdate = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJsonMoreLongTime',
        url: '/crm/companyUpdate/batchUpdate',
        data
    }).init(success, error, cbs);
};
// 客户详情页和客户列表页的  取消跟进
const batchCancelFollowup = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJsonMoreLongTime',
        url: '/crm/companyBatchProcess/batchCancelFollowup',
        method: 'get',
        params
    }).init(success, error, cbs);
};
// 获取联系地址的定位图标显隐状态
const isShowLocation = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/crm/company/isShowLocation',
        method: 'get',
        params
    }).init(success, error, cbs);
};
export default {
    getCompanyFilterListDataAndTotal,
    addMarker,
    getSimpleCompany,
    getCompany,
    sameCompanyName,
    getNameList,
    getCompanyLogs,
    companyUpdate,
    getBatchUpdateFields,
    batchUpdate,
    batchCancelFollowup,
    isShowLocation
};
