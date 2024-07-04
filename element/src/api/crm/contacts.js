// 全局 联系人相关 请求相关接口
import { Request } from '@/api/baseUtilAjax';

// 获取 联系人列表数据
const getContactsFilterListDataAndTotal = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/mongo/contactsRefactor/getFilterContactsDataAndTotal',
        data,
        cancelToken
    }).init(success, error, cbs);
};

// 根据id获取 联系人简短详情
const getSimpleContacts = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contacts/getSimpleContacts',
        data
    }).init(success, error, cbs);
};

// 根据id获取 联系详情
const getContacts = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contacts/get',
        data
    }).init(success, error, cbs);
};

// 保存新增联系人
const saveContacts = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contacts/save',
        data
    }).init(success, error, cbs);
};

// 获取同公司下其他联系人
const getContactsNameListByCompany = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contacts/getContactsNameListByCompany',
        data
    }).init(success, error, cbs);
};

//  获取是否关联已有联系人
const addContactsList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/contacts/addContactsList',
        data
    }).init(success, error, cbs);
};
//  联系人部分校验邮箱去重
const sameContactsEmail = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contacts/sameContactsEmail',
        data
    }).init(success, error, cbs);
};
//  校验相关字段是否重复
const isSameField = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contacts/isSameField',
        data
    }).init(success, error, cbs);
};

//  获取询盘之前的主联系人id
const getContactsListByInquiry = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contacts/getContactsListByInquiry',
        data
    }).init(success, error, cbs);
};

// 编辑联系人
const update = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contacts/update',
        data
    }).init(success, error, cbs);
};

// 跟新联系人邮箱
const updateContactsEmail = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/contacts/updateContactsEmail',
        data
    }).init(success, error, cbs);
};
// 联系人详情页 导入WhatsApp数据
const doUploadFile = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxFile',
        url: '/crm/followup/doUploadFile',
        data
    }).init(success, error, cbs);
};
// 获取联系人日志
const getContactsLogs = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/logs/getContactsLogs',
        params
    }, 'get').init(success, error, cbs);
};

export default {
    getContactsFilterListDataAndTotal,
    getSimpleContacts,
    getContacts,
    saveContacts,
    getContactsNameListByCompany,
    addContactsList,
    sameContactsEmail,
    isSameField,
    getContactsListByInquiry,
    update,
    updateContactsEmail,
    doUploadFile,
    getContactsLogs
};
