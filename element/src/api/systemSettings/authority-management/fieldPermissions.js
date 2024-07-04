import { Request } from '@/api/baseUtilAjax';
// 删除角色
const deleteRole = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: `/new-privilege/field/delete?id=${parseInt(data.id)}`,
        method: 'delete'
    }).init(success, error, cbs);
};

// 获取左侧列表的信息
const getSelectedData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/new-privilege/manageField/getSelectedData',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 编辑字段后的保存接口
const batchSave = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/manageField/batchSave',
        method: 'post',
        data
    }).init(success, error, cbs);
};

export default {
    deleteRole,
    getSelectedData,
    batchSave
};
