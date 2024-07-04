import { Request } from '@/api/baseUtilAjax';
// 获取设置
const getAutoHighSeas = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/autoHighSeas/get',
        method: 'get',
        params
    }).init(success, error, cbs);
};

/** 页面:设置-自动流入公海规则 点击保存按钮时调用的接口 */
const saveOrUpdateHighSeas = async (data = {}, success = null, error = null, cbs = []) => {
    /** 接口分为保存接口和更新接口 */
    let url = ''; // url地址
    if (data.id) {
        url = '/crm/autoHighSeas/update';
    } else {
        url = '/crm/autoHighSeas/save';
    }
    return new Request({
        utilKey: 'ajaxJson',
        url,
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 获取公海规则设置及列表
const getHighSeasConfig = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/autoHighSeasRule/getHighSeasConfig',
        method: 'get',
        params
    }).init(success, error, cbs);
};

// 根据标识获取具体规则的配置信息
const getRuleById = async (params = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/autoHighSeasRule/getRuleById',
        params,
        cancelToken
    }, 'get').init(success, error, cbs);
};

// 开启或关闭公海规则
const updateHighSeasConfig = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/autoHighSeasRule/updateHighSeasConfig',
        data
    }).init(success, error, cbs);
};

// 新建、编辑公海规则
const saveHighSeasRuleData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/autoHighSeasRule/saveHighSeasRuleData',
        data
    }).init(success, error, cbs);
};

// 触发预警提示
const calculating = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/autoHighSeas/calculating',
        method: 'get',
        params
    }).init(success, error, cbs);
};

const delRuler = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/autoHighSeasRule/deleteRuleById',
        data
    }).init(success, error, cbs);
};

export default {
    getAutoHighSeas,
    saveOrUpdateHighSeas,
    getHighSeasConfig,
    getRuleById,
    updateHighSeasConfig,
    saveHighSeasRuleData,
    calculating,
    delRuler
};
