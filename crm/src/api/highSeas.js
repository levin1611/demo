// 公海规则 相关 api

import { Request } from '@/https/baseUtilAjax';

// 获取排除规则列表数据
export const getExcludeRuleList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolBizObj/queryAutoReturnExclusionRuleList',
        data
    }).init(success, error, cbs);
};

// 删除排除规则
export const delExcludeRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/v2-meta/publicPoolBizObj/deleteAutoReturnExclusionRule',
        data
    }).init(success, error, cbs);
};

// 添加排除规则
export const addExcludeRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolBizObj/addAutoReturnExclusionRule',
        data
    }).init(success, error, cbs);
};

// 编辑排除规则
export const updateExcludeRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolBizObj/editAutoReturnExclusionRule',
        data
    }).init(success, error, cbs);
};

// 请求自动退回规则列表数据
export const getHighSeasRuleList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolBizObj/queryAutoReturnRuleList',
        data
    }).init(success, error, cbs);
};

// 更新自动退回规则总开关/公海认领规则总开关/私池上限一般成员上限设置
export const updateHighSeasConfig = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolBizObj/editPublicPoolRule',
        data
    }).init(success, error, cbs);
};

// 获取退回规则详情
export const getReturnRuleDetail = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/v2-meta/publicPoolBizObj/getAutoReturnRuleInfo',
        params
    }, 'get').init(success, error, cbs);
};

// 添加退回规则
export const addReturnRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolBizObj/addAutoReturnRule',
        data
    }).init(success, error, cbs);
};

// 更新退回规则
export const updateReturnRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolBizObj/editAutoReturnRule',
        data
    }).init(success, error, cbs);
};

// 删除退回规则
export const delReturnRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/v2-meta/publicPoolBizObj/deleteAutoReturnRule',
        data
    }).init(success, error, cbs);
};

// 获取认领规则列表数据
export const getClaimRuleList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolBizObj/queryClaimRuleList',
        data
    }).init(success, error, cbs);
};

// 添加认领规则
export const addClaimRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolBizObj/addClaimRule',
        data
    }).init(success, error, cbs);
};

// 编辑认领规则
export const updateClaimRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolBizObj/editClaimRule',
        data
    }).init(success, error, cbs);
};

// 删除认领规则
export const delClaimRule = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/v2-meta/publicPoolBizObj/deleteClaimRule',
        data
    }).init(success, error, cbs);
};

// 获取公海分组列表数据
export const getHighSeasGroupList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolGroup/queryPublicPoolGroupList',
        data
    }).init(success, error, cbs);
};

// 删除公海分组
export const delHighSeasGroup = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/v2-meta/publicPoolGroup/deletePublicPoolGroup',
        params
    }, 'get').init(success, error, cbs);
};

// 获取公海分组详情
export const getHighSeasGroupDetail = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/v2-meta/publicPoolGroup/queryPublicPoolGroupInfo',
        params
    }, 'get').init(success, error, cbs);
};

// 添加公海分组
export const addHighSeasGroup = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolGroup/addPublicPoolGroup',
        data
    }).init(success, error, cbs);
};

// 编辑公海分组
export const updateHighSeasGroup = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolGroup/editPublicPoolGroup',
        data
    }).init(success, error, cbs);
};

// 公海分组设置成员
export const updateHighSeasGroupMembers = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '',
        data
    }).init(success, error, cbs);
};

// 公海分组设置字段
export const updateHighSeasGroupFields = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolGroup/editVisibleFrozenFields',
        data
    }).init(success, error, cbs);
};

// 获取所有公海分组字段
export const getAllHighSeasGroupFields = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/publicPoolGroup/queryPublicPoolObjectFields',
        params
    }, 'get').init(success, error, cbs);
};

export default {
    getExcludeRuleList,
    delExcludeRule,
    addExcludeRule,
    updateExcludeRule,
    getHighSeasRuleList,
    updateHighSeasConfig,
    getReturnRuleDetail,
    addReturnRule,
    updateReturnRule,
    delReturnRule,
    getClaimRuleList,
    addClaimRule,
    updateClaimRule,
    delClaimRule,
    getHighSeasGroupList,
    delHighSeasGroup,
    getHighSeasGroupDetail,
    addHighSeasGroup,
    updateHighSeasGroup,
    updateHighSeasGroupMembers,
    updateHighSeasGroupFields,
    getAllHighSeasGroupFields
};
