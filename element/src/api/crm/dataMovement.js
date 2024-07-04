import { Request } from '@/api/baseUtilAjax';

/** 查询导入文件的进度条 */
const percent = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm-transfer/data/percent',
        params
    }, 'get').init(success, error, cbs);
};

/** 上传excel文件 */
const transfer = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax7',
        url: '/crm-transfer/data/transfer',
        data
    }, 'post').init(success, error, cbs);
};

// 获取对应字段的下拉框
const getFollowUpList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax7',
        url: '/crm/attr/getList',
        params
    }, 'get').init(success, error, cbs);
};

/** 进度条没完成之前显示 取消数据迁移 */
const cleanByUserIdAndOrgId = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm-transfer/data/cleanByUserIdAndOrgId',
        params
    }, 'get').init(success, error, cbs);
};

/** 初始迁移结果 */
const dataResult = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm-transfer/data/result',
        params
    }, 'get').init(success, error, cbs);
};

/** 获取迁移记录 */
const getInquiryImportLogList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/inquiryImportLog/getInquiryImportLogList',
        params
    }, 'get').init(success, error, cbs);
};


export default {
    percent,
    transfer,
    getFollowUpList,
    cleanByUserIdAndOrgId,
    dataResult,
    getInquiryImportLogList
};
