import { Request } from '@/api/baseUtilAjax';
// 获取公海客户分组使用开关是否打开
const getSet = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: 'crm/highseasGroup/getSet',
        method: 'get',
        params
    }).init(success, error, cbs);
};

// 开启或关闭公海分组功能的使用
const updateHighseasGroupOpen = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/highseasGroup/updateHighseasGroupOpen',
        method: 'post',
        params
    }).init(success, error, cbs);
};

// 查询设置页面公海数据分组数据
const getList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/highseasGroup/getList',
        method: 'get',
        params
    }).init(success, error, cbs);
};

// 新增或修改公海分组数据信息
const insertOrUpdate = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/highseasGroup/insertOrUpdate',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 删除公海分组数据
const deleteGroup = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/highseasGroup/delete',
        method: 'post',
        params
    }).init(success, error, cbs);
};

// 查询公海分组设置页面的筛选条件数据
const seasGroupCondition = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/highseasGroup/seasGroupCondition',
        method: 'get',
        params
    }).init(success, error, cbs);
};

// 公海客户列表查询公海分组信息
const publicSeasGroup = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/highseasGroup/publicSeasGroup',
        method: 'get',
        params
    }).init(success, error, cbs);
};

export default {
    getSet,
    updateHighseasGroupOpen,
    getList,
    insertOrUpdate,
    deleteGroup,
    seasGroupCondition,
    publicSeasGroup
};
