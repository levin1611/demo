import { Request } from '@/https/baseUtilAjax';

// 获取程序识别名称
export const prName = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/v1/common-option/prName',
        params
    }, 'get').init(success, error, cbs);
};

// 新增通用选项集
export const addOption = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/v1/common-option/addOption',
        data
    }, 'post').init(success, error, cbs);
};

// 新增通用选项集
export const editOption = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/v1/common-option/updateOption',
        data
    }, 'post').init(success, error, cbs);
};

// 新增编辑弹框中选项列表
export const listOptionsSet = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/v1/common-option/listOptionsSet',
        params
    }, 'get').init(success, error, cbs);
};

// 删除选项
export const deleteOption = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/v1/common-option',
        data
    }, 'delete').init(success, error, cbs);
};

// 查看引用
export const viewReferences = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/v1/common-option/viewReferences',
        params
    }, 'get').init(success, error, cbs);
};