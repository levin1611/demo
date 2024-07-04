import { Request } from '@/https/baseUtilAjax';

// 获取新建线索里面的弹框字段
const getObjTypeField = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/objData/getObjTypeField',
        data
    }).init(success, error, cbs);
};


// 列表页获取我的视图列表
const getUserViewListForPage = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-layout/view/getUserViewListForPage',
        data
    }).init(success, error, cbs);
};

// 编辑个人视图
const editUserView = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-layout/view/editUserView',
        data
    }).init(success, error, cbs);
};
// 查询阶段设置列表
const queryAllSalesStage = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/opportunitySalesStage/queryAllSalesStage',
        params
    }, 'get').init(success, error, cbs);
};

export {
    getObjTypeField,
    getUserViewListForPage,
    editUserView,
    queryAllSalesStage
};