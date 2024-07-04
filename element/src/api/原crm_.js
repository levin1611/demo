// class Crm_message {
//     constructor({name, age}) {
//         this.name = name;
//         this.age = age;
//     }

//     toString() {
//         return `(${this.name}, ${this.age})`;
//     }
// }

// Crm_message;
// CRM 列表 请求相关接口
import { Request } from '@/api/baseUtilAjax';

// 获取 获取crm列表
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

// 获取 客户列表数据 或 公海管理列表数据
const getCompanyFilterListDataAndTotal = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/companyRefactor/getFilterListDataAndTotal',
        data
    }).init(success, error, cbs);
};

// 获取 询盘列表数据
const getInquiryFilterListDataAndTotal = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiryRefactor/getFilterListDataAndTotal',
        data
    }).init(success, error, cbs);
};

// 获取 联系人列表数据
const getContactsFilterListDataAndTotal = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contactsRefactor/getFilterListDataAndTotal',
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
//  公司去重
const sameCompanyName = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/company/sameCompanyName',
        data
    }).init(success, error, cbs);
};
//  公司去重弹窗用到的 newCompany.Vue, create-company.vue, uniqCompany.Vue 使用， 
const getNameList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/company/getNameList',
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
//   发送并入联系人请求
const setContacts = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiry/setContacts',
        data
    }).init(success, error, cbs);
};

export {
    getCommonConfig,
    commonPageDisplaySave,
    userconfigAdd,
    userconfigUpdate,
    getCompanyFilterListDataAndTotal,
    getInquiryFilterListDataAndTotal,
    getContactsFilterListDataAndTotal,
    getUserRemainLimitCount,
    addMarker,
    getSimpleCompany,
    getCompany,
    getSimpleInquiry,
    getInquiry,
    updateInquiry,
    getInquiryLogs,
    getSimpleContacts,
    getContacts,
    saveContacts,
    getContactsNameListByCompany,
    sameCompanyName,
    getNameList,
    addContactsList,
    sameContactsEmail,
    isSameField,
    setContacts
    // getFields
};
