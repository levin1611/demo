import { Request } from '@/api/baseUtilAjax';
// 获取异动明细列表
const getChangeDetailList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/changedetail/getChangeDetailList',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 修改异动消息的状态
const updateCheckStatus = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/changedetail/updateCheckStatus',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 获取表头筛选配置列表-异动对象
const getShowNameMap = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/changedetail/getShowNameMap',
        method: 'post',
        params
    }).init(success, error, cbs);
};

// 获取表头筛选配置列表-(触点账号列表:1、系统账号名称列表:2)
const getListShowNameList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/changedetail/getListShowNameList',
        method: 'post',
        params
    }).init(success, error, cbs);
};

export default {
    getChangeDetailList,
    updateCheckStatus,
    getShowNameMap,
    getListShowNameList
};
