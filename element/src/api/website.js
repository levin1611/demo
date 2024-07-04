import { Request } from '@/api/baseUtilAjax';
// 获取网址列表
export const getSiteList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/marketing-site/site/getPage',
        data
    }).init(success, error, cbs);
};
// 获取权限列表
export const getUserList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/marketing-site/user/getPage',
        data
    }).init(success, error, cbs);
};

// 获取询盘云用户列表
export const getUsersForMarketingSite = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/user/getUsersForMarketingSite',
        params
    }, 'get').init(success, error, cbs);
};

// 获取角色列表
export const getUserAuthority = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/marketing-site/user/getAllRole',
        data
    }).init(success, error, cbs);
};
// 新增用户
export const addUserAuthority = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/marketing-site/user/save',
        data
    }).init(success, error, cbs);
};

// 删除用户
export const deleteUserAuthority = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/marketing-site/user/delete',
        data
    }).init(success, error, cbs);
};

// 编辑用户
export const updateUserAuthority = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/marketing-site/user/update',
        data
    }).init(success, error, cbs);
};

// 获取权限列表
export const getJumpParam = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/marketing-site/site/getJumpParam',
        data
    }).init(success, error, cbs);
};

// 获取二维码
export const hasSite = async (params = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/marketing-site/site/hasSite',
        params,
        cancelToken
    }, 'get').init(success, error, cbs);
};
