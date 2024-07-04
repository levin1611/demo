import { Request } from '@/api/baseUtilAjax';


/** 【当前筛选字段所属】字段切换客户/询盘，保存最近操作type */
const updateFieldDefalt = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/commonField/updateFieldDefalt',
        data
    }, 'post').init(success, error, cbs);
};

/** 获取线索所有可配置的crm字段 */
const getWriteLetterClueScreen = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/commonField/getWriteLetterClueScreen',
        data
    }, 'post').init(success, error, cbs);
};

/** 获取客户、询盘所有可配置的crm字段 */
const getWriteLetterCompanyScreen = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/commonField/getWriteLetterCompanyScreen',
        data
    }, 'post').init(success, error, cbs);
};

/** 获取通讯录当前tab页的筛选字段 */
const getFieldOrderListByWriteLetter = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/commonField/getFieldOrderListByWriteLetter',
        data
    }, 'post').init(success, error, cbs);
};

/** 获取当前筛选字段所属模块 --- 记录上次选择 */
const getCostomerOrInquireDefault = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/commonField/getCostomerOrInquireDefault',
        data
    }, 'post').init(success, error, cbs);
};

export default {
    updateFieldDefalt,
    getWriteLetterClueScreen,
    getWriteLetterCompanyScreen,
    getFieldOrderListByWriteLetter,
    getCostomerOrInquireDefault
};
