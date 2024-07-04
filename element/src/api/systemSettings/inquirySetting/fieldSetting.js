import { Request } from '@/api/baseUtilAjax';
// 默认必选框保存接口
const updateMustInput = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/crm/columnConfig/updateMustInput',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 自定义必选框保存接口(点击恢复已删除的自定义字段图标)
const updateMustInputColumn = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/crm/custom/updateColumn',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 点击删除自定义字段图标
const columnInquiry = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/form-cust/column/inquiry',
        method: 'get',
        params
    }).init(success, error, cbs);
};

// 发送删除字段（此处删除方式为隐藏）请求
const hideColumn = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/crm/custom/hideColumn',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 排序接口
const orderColumnAll = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/crm/custom/orderColumnAll',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 发送 保存当前自定义字段 请求
const saveColumn = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/crm/custom/saveColumn',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 获取当前已存在的自定义字段的序号数组
const getColumnStorage = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/crm/custom/getColumnStorage',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 更新字段信息, 在 编辑/删除/恢复 时调用
const fieldIsHide = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/field/isHide',
        method: 'put',
        data
    }).init(success, error, cbs);
};

// 改动单选类型的自定义字段的下拉选项时, 同步更新到线索表单
const updateFormColumnOption = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/form-cust/form/updateFormColumnOption',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 默认字段提示语变化时, 更新到线索模板和表单字段
const updateColDefaultValueByCrmStorageName = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/form-cust/form/updateColDefaultValueByCrmStorageName',
        method: 'post',
        data
    }).init(success, error, cbs);
};

/**
 * 此处接收两个url,
 * /crm/columnConfig/save 和 crm/columnConfig/updateColDefaultValueAndMustInput
 * 根据被编辑字段是否有 id , 来发送不同的请求(保存/更新)
 * url在组件中进行的处理
 * */

const saveOrUpdateColDefault = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: data.url,
        method: 'post',
        data: data.data
    }).init(success, error, cbs);
};

export default {
    updateMustInput,
    updateMustInputColumn,
    columnInquiry,
    hideColumn,
    orderColumnAll,
    saveColumn,
    getColumnStorage,
    fieldIsHide,
    updateFormColumnOption,
    updateColDefaultValueByCrmStorageName,
    saveOrUpdateColDefault
};
