import { Request } from '@/api/baseUtilAjax';


/** 获取邮件模板列表 */
export const findPageList = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/mailboxtemplate/findPageList',
        data,
        cancelToken
    }).init(success, error, cbs);
};
// 邮件模板 获取详情
export const getById = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/mailboxtemplate/getById',
        params
    }, 'get').init(success, error, cbs);
};
// 邮件模板 批量更新分类
export const batchUpdateClassification = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/mailboxtemplate/batchUpdateClassification',
        data
    }).init(success, error, cbs);
};
// 邮件模板 批量或单个删除
export const batchDel = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/mailboxtemplate/batchDel',
        data
    }).init(success, error, cbs);
};
// 邮件模板 添加模板
export const addTemplate = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/mailboxtemplate/add',
        data
    }).init(success, error, cbs);
};
// 邮件模板 复制模板
export const copyTemplate = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/mailboxtemplate/copy',
        data
    }).init(success, error, cbs);
};
// 邮件模板 编辑模板
export const updateTemplate = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/mailboxtemplate/update',
        data
    }).init(success, error, cbs);
};
// 设置邮件模板列表排序
export const saveOrder = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/mailboxtemplate/saveOrder',
        data
    }).init(success, error, cbs);
};
// 获取分类列表（按顺序返回的）
export const findAll = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/mailboxtemplateclassification/findAll',
        params
    }, 'get').init(success, error, cbs);
};
// 邮件模板分类 排序操作
export const updateOrder = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/mailboxtemplateclassification/updateOrder',
        data
    }).init(success, error, cbs);
};
// 邮件模板分类 删除操作
export const deleteById = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/mailboxtemplateclassification/deleteById',
        data
    }).init(success, error, cbs);
};
// 邮件模板分类 新增或编辑操作
export const addOrupdate = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/mailboxtemplateclassification/addOrupdate',
        data
    }).init(success, error, cbs);
};
