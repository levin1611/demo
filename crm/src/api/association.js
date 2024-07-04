import { Request } from '@/https/baseUtilAjax';

// 获取父业务对象列表
const parentBizObjList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/relation/parentBizObjList',
        params
    }, 'get').init(success, error, cbs);
};
// 获取子业务对象列表
const childBizObjList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/relation/childBizObjList',
        params
    }, 'get').init(success, error, cbs);
};
export {
    parentBizObjList,
    childBizObjList
};