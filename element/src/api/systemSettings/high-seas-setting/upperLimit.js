import { Request } from '@/api/baseUtilAjax';
// 加载设置列表
export const getTableList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/crm/inquiryLimit/getList',
        params
    }).init(success, error, cbs);
};
// 查询设置信息
export const getSettedInfo = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/crm/inquiryLimit/getInfo',
        params
    }).init(success, error, cbs);
};
// 编辑上限配置
export const setSwitchStauts = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: 'crm/inquiryLimit/editSet',
        params
    }).init(success, error, cbs);
};
// 获取上限配置
export const getSwitchStauts = async () => {
    return new Request({
        url: '/crm/inquiryLimit/getSet'
    }).init();
};


// 获取已设置询盘用户
export const getForbiddenUserList = async () => {
    return new Request({
        url: '/crm/inquiryLimit/getUserList'
    }).init();
};


// 创建 编辑 删除
export const createUserLimit = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/crm/inquiryLimit/create',
        params
    }).init(success, error, cbs);
};
export const editUserLimit = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/crm/inquiryLimit/edit',
        params
    }).init(success, error, cbs);
};

export const removeUserLimit = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/crm/inquiryLimit/remove',
        params
    }).init(success, error, cbs);
};

// 校验人员是否超出
export const checkUserLimit = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/crm/inquiryLimit/check',
        params
    }).init(success, error, cbs);
};
