
// CRM 公共的 请求相关接口
import { Request } from '@/api/baseUtilAjax';

// 获取 获取crm列表表头
const getCommonConfig = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/commonConfig/getCommonConfig',
        data
    }).init(success, error, cbs);
};

// 客户列表 保存显示方式
const commonPageDisplaySave = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/commonPageDisplay/save',
        data
    }).init(success, error, cbs);
};

// 保存每页显示条数
const userconfigAdd = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/userconfig/add',
        data
    }).init(success, error, cbs);
};

// 更新每页显示条数
const userconfigUpdate = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/userconfig/update',
        data
    }).init(success, error, cbs);
};

// 获取当前用户可以认领客户的余量
const getUserRemainLimitCount = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/inquiryLimit/getUserRemainLimitCount',
        data
    }).init(success, error, cbs);
};

// 更新保存询盘状态（成交）成交金额，成交金额币种
const followupStatusSave = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/followupStatus/save',
        data
    }).init(success, error, cbs);
};
// 回传 google
const saveAudit = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        // utilKey: 'ajax',
        // url: '/crm/conversionAudit/saveAudit',
        utilKey: 'ajaxJson',
        url: '/crm/conversionAudit/saveAuditForMoreAccount',
        data
    }).init(success, error, cbs);
};

// 根据询盘id 获取任务列表
const getListByInquiryId = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/task/getListByInquiryId',
        data
    }).init(success, error, cbs);
};

// 根据公司id 获取任务列表
const getListByCompany = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiry/getListByCompany',
        data
    }).init(success, error, cbs);
};

// 跟任务有关
const getFilterList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/company/getFilterList',
        data
    }).init(success, error, cbs);
};


// 跟进询盘id 更新任务状态
const updateTaskStatus = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/task/updateTaskStatus',
        data
    }).init(success, error, cbs);
};

// 删除任务
const taskDelete = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/task/delete',
        data
    }).init(success, error, cbs);
};
// 新增保存任务
const taskSave = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/task/save',
        data
    }).init(success, error, cbs);
};

// 查询mail
const mailSearch = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/mail/relate/task/search',
        data,
        cancelToken
    }).init(success, error, cbs);
};

// 获取文档列表
const getDocumentList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/document/getList',
        data
    }).init(success, error, cbs);
};

// 添加文件夹
const saveFolder = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/document/saveFolder',
        data
    }).init(success, error, cbs);
};

// 编辑文件夹
const updateFolderName = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/document/updateFolderName',
        data
    }).init(success, error, cbs);
};

// 移动到其他文件夹
const moveDocument = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/document/moveDocument',
        data
    }).init(success, error, cbs);
};

// 同步到其他文件夹
const syncFileToFolder = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/document/syncFileToFolder',
        data
    }).init(success, error, cbs);
};

// 新 获取文档列表
const getNewDocumentList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/document/getDocumentAndFolderList',
        data
    }).init(success, error, cbs);
};

// 获取文档文件夹列表
const getMoveFolder = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/document/getMoveFolder',
        params
    }, 'get').init(success, error, cbs);
};

// 获取沟通附件列表
const getCommunicationAccessory = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/document/getCommunicationAccessory',
        data
    }).init(success, error, cbs);
};

// 删除文档
const documentDelete = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/document/delete',
        data
    }).init(success, error, cbs);
};
// 保存文档
const saveBatch = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/document/saveBatch',
        data
    }).init(success, error, cbs);
};
// 根据国家编码获取国家地区
const getNamesByList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/report/country/getNamesByList',
        data
    }).init(success, error, cbs);
};
// 获取所有国家编码
const getCountryCodeIdList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/report/country/allcountry',
        data
    }).init(success, error, cbs);
};

// 分享客户、询盘接口
const share = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiry/share',
        data
    }).init(success, error, cbs);
};

// 根据客户id获取联系人邮箱
const getContactsEmailListByCompanyId = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contacts/getContactsEmailListByCompanyId',
        data
    }).init(success, error, cbs);
};

// 保存询盘
const inquiryCommonSave = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/inquiryCommon/save',
        data
    }).init(success, error, cbs);
};

// 转移询盘 转移客户
const inquiryTransfer = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiry/transfer',
        data
    }).init(success, error, cbs);
};
// 批量转移客户
const batchTransfer = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMoreLongTime',
        url: '/crm/inquiry/batchTransfer',
        data
    }).init(success, error, cbs);
};
// 批量退入公海
const batchGiveup = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJsonMoreLongTime',
        url: '/crm/companyBatchProcess/batchGiveup',
        data
    }).init(success, error, cbs);
};


// 获取联系人邮箱
const getContactsListByCompany = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contacts/getContactsListByCompany',
        data
    }).init(success, error, cbs);
};
// 往来邮件处 通过客户id 获取联系人邮箱
const getContactsPageListByCompany = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contacts/getContactsPageListByCompany',
        data
    }).init(success, error, cbs);
};
// highseasRecord组件中调用
const getInquiryClaimList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/operateLog/getInquiryClaimList',
        data
    }).init(success, error, cbs);
};
// 获取客户下所有询盘
const getInquiryListByCompany = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiry/getInquiryListByCompany',
        data
    }).init(success, error, cbs);
};
// 列表快速编辑接口
const updateField = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/bigcompany/updateField',
        data
    }).init(success, error, cbs);
};
// 批量认领客户，批量分配客户
const batchClaim = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJsonMoreLongTime',
        url: '/crm/companyBatchProcess/batchClaim',
        data
    }).init(success, error, cbs);
};
// 合并询盘
const mergerInquiry = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/mail/mergerInquiry',
        data
    }, 'put').init(success, error, cbs);
};
// 导入数据
const inquiryImportLogGet = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiryImportLog/get',
        data
    }).init(success, error, cbs);
};

// 获取客户管理列表字段数据
const getCompanyFrontList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/headerSettings/getCompanyFrontList',
        data
    }).init(success, error, cbs);
};

// 询盘列表数据
const getFrontListAssembleObject = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/headerSettings/getFrontListAssembleObject',
        data
    }).init(success, error, cbs);
};

// 获取联系人管理列表字段数据
const getContactsTitle = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/headerSettings/getContactsTitle',
        data
    }).init(success, error, cbs);
};

// 获取该企业是否支持邮箱查重
const checkEmailRepeat = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/emailrepeat/checkEmailRepeat',
        params
    }, 'get').init(success, error, cbs);
};
// 客户、公海客户、询盘列表 群发邮件 和 发送WhatsApp 联系人选择弹窗
const getContactsListByTargetIds = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/contactsBatchOperate/getContactsListByTargetIds',
        data
    }).init(success, error, cbs);
};
// 线索、公海线索 群发邮件 和 发送WhatsApp 联系人选择弹窗
const getContactsListByClueIds = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/form-cust/clueBatchOperate/getContactsListByTargetIds',
        data
    }).init(success, error, cbs);
};

const downloadDemo = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: 'http://192.168.74.112:7088/crm/seasRule/output',
        data
    }).init(success, error, cbs);
};

export default {
    downloadDemo,
    getCommonConfig,
    commonPageDisplaySave,
    userconfigAdd,
    userconfigUpdate,
    getUserRemainLimitCount,
    followupStatusSave,
    saveAudit,
    getListByInquiryId,
    getListByCompany,
    getFilterList,
    updateTaskStatus,
    taskDelete,
    taskSave,
    getDocumentList,
    getNewDocumentList,
    getMoveFolder,
    getCommunicationAccessory,
    saveFolder,
    updateFolderName,
    moveDocument,
    syncFileToFolder,
    documentDelete,
    saveBatch,
    getNamesByList,
    getCountryCodeIdList,
    share,
    getContactsEmailListByCompanyId,
    inquiryCommonSave,
    inquiryTransfer,
    batchTransfer,
    batchGiveup,
    getContactsListByCompany,
    getContactsPageListByCompany,
    getInquiryClaimList,
    getInquiryListByCompany,
    updateField,
    batchClaim,
    mergerInquiry,
    inquiryImportLogGet,
    mailSearch,
    getCompanyFrontList,
    getFrontListAssembleObject,
    getContactsTitle,
    checkEmailRepeat,
    getContactsListByTargetIds,
    getContactsListByClueIds
};
