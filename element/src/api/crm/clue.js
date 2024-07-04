import { Request } from '@/api/baseUtilAjax';

/** 获取常用检索 */
const getCommonSearchList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/commonSearch/getCommonSearchList',
        data
    }, 'post').init(success, error, cbs);
};

/** 删除常用检索项 */
const deleteCommonSearch = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/commonSearch/deleteCommonSearch',
        params
    }, 'get').init(success, error, cbs);
};

/** 保存常用检索 */
const saveCommonSearch = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/commonSearch/saveCommonSearch',
        data
    }, 'post').init(success, error, cbs);
};

/** 根据国家地区文字进行搜索 */
const searchCountryArea = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/report/country/wherelike',
        data
    }).init(success, error, cbs);
};

/** 根据国家地区获取它的编码名称 */
const getCountryCodeByName = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/report/country/getCountryCodeByName',
        params
    }, 'get').init(success, error, cbs);
};

/** 获取线索表头显示字段接口 */
const getXSShow = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/form/getXSShow',
        data
    }, 'post').init(success, error, cbs);
};

/** 通过访客id合集获取访客来源类别 -- 后端无法直接返回，需要额外调接口去拼接数据 */
const getAdDetailList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/piwikRead/visitorHistory/getAdDetailList',
        data
    }, 'post').init(success, error, cbs);
};

/** 根据国家编码获取国家地区名称  */
const getNamesByList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/report/country/getNamesByList',
        data
    }, 'post').init(success, error, cbs);
};

/** 获取询盘编号  */
const getInquirySeqList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/inquiry/getInquirySeqList',
        data
    }, 'post').init(success, error, cbs);
};

/** 获取线索列表数据  */
const getColumnValueList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/form/getColumnValueList',
        data
    }, 'post').init(success, error, cbs);
};


/** 获取线索列表数据  */
const getClueList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/mongo/clue/getClueList',
        data
    }, 'post').init(success, error, cbs);
};

/** 配置表格显示项  */
const getFieldOrderList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/commonField/getFieldOrderList',
        data
    }, 'post').init(success, error, cbs);
};

/** 获取线索详情  */
const getColumnValue = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/form/getColumnValue',
        data
    }, 'post').init(success, error, cbs);
};

/** 保存编辑的某字段信息  */
const updateField = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/clue/updateField',
        data
    }, 'post').init(success, error, cbs);
};

/** 电话查重 */
const getSameListByPhone = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/clue/getSameListByPhone',
        data
    }, 'post').init(success, error, cbs);
};

/** WhatsApp查重 */
const getSameListByWhatsapp = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/clue/getSameListByWhatsapp',
        data
    }, 'post').init(success, error, cbs);
};

/** 获取前负责人的数据 */
const getUserDataTables = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/user/getUserDataTables',
        data
    }, 'post').init(success, error, cbs);
};

/** 批量认领线索 */
const transfer = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/clue/transfer',
        data
    }, 'post').init(success, error, cbs);
};

/** 获取线索的简略详情 */
const getSimpleColumnValue = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/form/getSimpleColumnValue',
        data
    }, 'post').init(success, error, cbs);
};

/** leads相关 的状态更新 */
const updateLeadsStatusByLeadsId = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/form/updateLeadsStatusByLeadsId',
        params
    }, 'get').init(success, error, cbs);
};

/** facebook私信 的状态更新 */
const updateConversationStatusByClueId = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/social/updateConversationStatusByClueId',
        params
    }, 'get').init(success, error, cbs);
};

/** facebook评论 的状态更新 */
const updateCommentStatusByClueId = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/social/updateCommentStatusByClueId',
        params
    }, 'get').init(success, error, cbs);
};

/** 访客id 不为空时更新访客状态 */
const updateVisitorStatus = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/piwik/visitorInfo/updateVisitorStatus',
        data
    }).init(success, error, cbs);
};

/** 修改线索状态 */
const setInquiringForWeb = async (name, data = {}, success = null, error = null, cbs = []) => {
    let url = '';
    // 如果是询盘的话，接口与修改为其他状态的不同
    if (Number(name) === 3) {
        url = '/form-cust/clue/setInquiringForWeb';
    } else {
        url = '/form-cust/clue/setStatusForWeb';
    }
    return new Request({
        utilKey: 'ajax',
        url,
        data
    }).init(success, error, cbs);
};

/** 退入公海更新小人头状态 */
const updateCrmFlagNew = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMail',
        url: '/mail/mailBoxs/updateCrmFlagNew',
        data,
        timeout: 360000
    }).init(success, error, cbs);
};

/** 获取访客详情 */
const getAdDetail = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/piwikRead/visitorHistory/getAdDetail',
        params
    }, 'get').init(success, error, cbs);
};

/** 获取标签数据 */
const attrGetList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/attr/getList',
        data
    }, 'post').init(success, error, cbs);
};

/** 获取询盘跟进记录 */
const getCompanyIdByClueId = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/entityRelation/getCompanyIdByClueId',
        data
    }, 'post').init(success, error, cbs);
};

/** 跟进动态 -- 添加线索备注 */
const remarkSave = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/remark/save',
        data
    }, 'post').init(success, error, cbs);
};

/** 跟进动态 -- 添加线索备注之后添加到时间轴 */
const saveClueEventAction = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: 'crm/followup/saveClueEventAction',
        data
    }, 'post').init(success, error, cbs);
};

/** 跟进动态 -- 更新跟进次数、跟进动态 */
const updateFollowupByFollowup = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/report/rules/updateFollowupByFollowup',
        data
    }, 'post').init(success, error, cbs);
};

/** 跟进动态 -- 更新线索状态 */
const updateClueStatusByFollowup = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: 'report/rules/updateClueStatusByFollowup',
        data
    }, 'post').init(success, error, cbs);
};

/** 校验邮箱 */
const getSameListByEmail = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/clue/getSameListByEmail',
        data
    }, 'post').init(success, error, cbs);
};

/** 编辑线索 */
const crmEdit = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/clue/edit',
        data
    }, 'post').init(success, error, cbs);
};

/** 获取线索日志 */
const getClueLog = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/clue/getLog',
        params
    }, 'get').init(success, error, cbs);
};

/** 获取访客的gclid */
const getGclidByVisitorId = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/server/getGclidByVisitorId',
        data
    }, 'post').init(success, error, cbs);
};

/** 获取访客gclidCreateDate */
const getGoogleAdsInfo = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternational',
        url: '/visitortrace/getGoogleAdsInfo',
        params
    }, 'get').init(success, error, cbs);
};

/** 保存询盘 */
const inquiryCommonSave = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/inquiryCommon/save',
        data
    }, 'post').init(success, error, cbs);
};

/** 录入询盘之后  手动归并客户箱 */
const mergerMail = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMail',
        url: '/mail/mergerMail',
        params
    }, 'get').init(success, error, cbs);
};

/** 录入询盘之后 联系人邮箱关联到邮件系统 */
const addTimeAxis = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMail',
        url: '/mail/timeAxis/addTimeAxis',
        data
    }, 'post').init(success, error, cbs);
};


/** 录入询盘之后   保存询盘文档 */
const documentSave = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/document/save',
        data
    }, 'post').init(success, error, cbs);
};

/** 回传 google */
const conversionSaveAudit = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        // utilKey: 'ajax',
        // url: '/crm/conversionAudit/saveAudit',
        utilKey: 'ajaxJson',
        url: '/crm/conversionAudit/saveAuditForMoreAccount',
        data
    }, 'post').init(success, error, cbs);
};

/* 获取线索字段与 CRM 自定义字段的对应关系 */
const selectListByOrgId = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/formcrm/columnRelation/selectListByOrgId',
        params
    }, 'get').init(success, error, cbs);
};

/** 录入询盘之后  线索备注转询盘跟进 */
const batchSaveFollowupToInquiry = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/followup/batchSaveFollowupToInquiry',
        data
    }, 'post').init(success, error, cbs);
};

/** 录入询盘之后  保存成交数据、保存日志 */
const followupStatusSave = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/followupStatus/save',
        data
    }, 'post').init(success, error, cbs);
};

/** 获取同公司下其他询盘 */
const getInquiryListByCompany = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiry/getInquiryListByCompany',
        data
    }, 'post').init(success, error, cbs);
};

/** 获取公司负责人 */
const getSimpleCompany = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/company/getSimpleCompany',
        data
    }, 'post').init(success, error, cbs);
};

/** 邮箱去重 */
const sameContactsEmail = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contacts/sameContactsEmail',
        data
    }, 'post').init(success, error, cbs);
};

/** 电话去重 */
const isSameField = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contacts/isSameField',
        data
    }, 'post').init(success, error, cbs);
};

/** 发送保存联系人请求之前获取联系人列表 得到之前主联系人id */
const getContactsListByInquiry = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contacts/getContactsListByInquiry',
        data
    }, 'post').init(success, error, cbs);
};

/** 客户下关联联系人 --- 保存询盘之后保存询盘文档 */
const saveBatch = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/document/saveBatch',
        data
    }, 'post').init(success, error, cbs);
};

/** 客户下关联联系人 --- 手动关联 */
const contactsAssociateRelated = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/contactsAssociate/related',
        data
    }, 'post').init(success, error, cbs);
};

/** 获取二维码所需信息 */
const getQRCodeInfoByPrivilege = async (type, data = {}, success = null, error = null, cbs = []) => {
    const url = type === 'contact' ? '/crm/contacts/getQRCodeInfoByPrivilege' : '/form-cust/form/getQRCodeInfoByPrivilege';
    return new Request({
        utilKey: 'ajaxJson',
        url,
        data
    }, 'post').init(success, error, cbs);
};

/** 新建客户时,获取clueId的接口 */
const getClueId = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/inquiryCommon/getClueId?status=1',
        data
    }, 'get').init(success, error, cbs);
};


// 获取线索管理列表字段数据
const getClueFrontList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/form-cust/headerSettings/getClueFrontList',
        data
    }).init(success, error, cbs);
};
export default {
    getCommonSearchList,
    deleteCommonSearch,
    saveCommonSearch,
    searchCountryArea,
    getCountryCodeByName,
    getXSShow,
    getAdDetailList,
    getNamesByList,
    getInquirySeqList,
    getColumnValueList,
    getClueList,
    getFieldOrderList,
    getColumnValue,
    updateField,
    getSameListByPhone,
    getSameListByWhatsapp,
    getUserDataTables,
    transfer,
    getSimpleColumnValue,
    updateLeadsStatusByLeadsId,
    updateConversationStatusByClueId,
    updateCommentStatusByClueId,
    updateVisitorStatus,
    setInquiringForWeb,
    updateCrmFlagNew,
    getAdDetail,
    attrGetList,
    getCompanyIdByClueId,
    remarkSave,
    saveClueEventAction,
    updateFollowupByFollowup,
    updateClueStatusByFollowup,
    getSameListByEmail,
    crmEdit,
    getClueLog,
    getGclidByVisitorId,
    getGoogleAdsInfo,
    inquiryCommonSave,
    mergerMail,
    addTimeAxis,
    documentSave,
    conversionSaveAudit,
    batchSaveFollowupToInquiry,
    followupStatusSave,
    selectListByOrgId,
    getInquiryListByCompany,
    getSimpleCompany,
    sameContactsEmail,
    isSameField,
    getContactsListByInquiry,
    saveBatch,
    contactsAssociateRelated,
    getClueId,
    getQRCodeInfoByPrivilege,
    getClueFrontList
};

