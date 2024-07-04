import { Request } from '@/api/baseUtilAjax';

// 查询映射关系接口 参数  orgId   userId   type（1:客户字段映射 2：负责人字段映射）
const getDataByOrgId = async (params = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/aliReation/getDataByOrgId',
        params,
        cancelToken
    }, 'get').init(success, error, cbs);
};
// 保存映射数据关系接口 json传递  orgId   userId  relations（映射数据json字符串） type（1:客户字段映射 2：负责人字段映射）
const saveData = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJsonMoreLongTime',
        url: '/crm/aliReation/saveData',
        data,
        cancelToken
    }).init(success, error, cbs);
};
// 阿里数据导入员工匹配
const getAliUserIdData = async (params = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/new-privilege/user/getAliUserIdData',
        params,
        cancelToken
    }, 'get').init(success, error, cbs);
};

export default {
    getDataByOrgId,
    saveData,
    getAliUserIdData
};
