// 私池上限 相关 api

import { Request } from '@/https/baseUtilAjax';

// 获取特殊成员规则数据
export const getSpecialMemberRules = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolBizObj/queryPrivatePoolLimitList',
        data
    }).init(success, error, cbs);
};

// 新增特殊成员规则
export const addSpecialMemberRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolBizObj/addPrivatePoolLimit',
        data
    }).init(success, error, cbs);
};

// 删除特殊成员规则
export const delSpecialMemberRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/v2-meta/publicPoolBizObj/deletePrivatePoolLimit',
        data
    }).init(success, error, cbs);
};

// 编辑特殊成员规则
export const editSpecialMemberRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolBizObj/editPrivatePoolLimit',
        data
    }).init(success, error, cbs);
};

// 获取特殊成员规则人员范围选择下拉数据
export const getSpecialMemberSelectListData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/user/member/seaList',
        data
    }, 'post').init(success, error, cbs);
};

export default {
    getSpecialMemberRules,
    addSpecialMemberRule,
    delSpecialMemberRule,
    editSpecialMemberRule,
    getSpecialMemberSelectListData
};
