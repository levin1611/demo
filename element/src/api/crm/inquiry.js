// 全局 询盘相关 请求相关接口
import { Request } from '@/api/baseUtilAjax';

// 获取 询盘列表数据
const getInquiryFilterListDataAndTotal = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/mongo/inquiryRefactor/getFilterListDataAndTotal',
        data,
        cancelToken
    }).init(success, error, cbs);
};

// 获取 询盘列表数据
const getInquiryFilterListDataAndTotalMongo = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/mongo/inquiryRefactor/getFilterListDataAndTotal',
        data,
        cancelToken
    }).init(success, error, cbs);
};

// 根据id获取 询盘简短详情
const getSimpleInquiry = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiry/getSimpleInquiry',
        data
    }).init(success, error, cbs);
};

// 根据id获取 询盘详情
const getInquiry = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiry/get',
        data
    }).init(success, error, cbs);
};
// 询盘 标记操作
const updateMarker = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiry/updateMarker',
        params
    }, 'get').init(success, error, cbs);
};
// 编辑更新询盘详情
const updateInquiry = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiry/update',
        data
    }).init(success, error, cbs);
};
// 获取询盘日志
const getInquiryLogs = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/logs/getInquiryLogs',
        params
    }, 'get').init(success, error, cbs);
};

// 发送并入联系人请求
const setContacts = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiry/setContacts',
        data
    }).init(success, error, cbs);
};

// 单独编辑询盘标签后，保存询盘标签
const saveList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/attrRelation/saveList',
        data
    }).init(success, error, cbs);
};

// 关闭后的询盘打开操作，或更新状态操作
const inquiryCloseReasonOpen = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiryCloseReason/open',
        data
    }).init(success, error, cbs);
};

// 关闭询盘
const inquiryCloseReasonSave = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiryCloseReason/save',
        data
    }).init(success, error, cbs);
};

// 获取询盘gclid
const getVisitorIdGclidByInquiryId = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contacts/getVisitorIdGclidByInquiryId',
        params
    }, 'get').init(success, error, cbs);
};
// 退入公海
const inquiryGiveup = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiry/giveup',
        data
    }).init(success, error, cbs);
};

// 认领公海客户
const inquiryClaim = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiry/claim',
        data
    }).init(success, error, cbs);
};
const getFilterListExcel = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/mongo/inquiryRefactor/getFilterListExcel',
        data
    }).init(success, error, cbs);
};


export default {
    getInquiryFilterListDataAndTotal,
    getSimpleInquiry,
    getInquiry,
    updateMarker,
    updateInquiry,
    getInquiryLogs,
    setContacts,
    saveList,
    inquiryCloseReasonOpen,
    inquiryCloseReasonSave,
    getVisitorIdGclidByInquiryId,
    inquiryGiveup,
    inquiryClaim,
    getInquiryFilterListDataAndTotalMongo,
    getFilterListExcel
};
