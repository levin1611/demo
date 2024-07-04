import { Request } from '@/https/baseUtilAjax';

// 展示业务对象列表
const queryObjList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObj/queryObjList',
        data
    }).init(success, error, cbs);
};

// 根据业务对象ID获取业务对象的具体信息
const queryObjInfo = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObj/queryObjInfo',
        data
    }).init(success, error, cbs);
};

// 展示业务对象下的字段列表
const queryObjFieldList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObject/queryObjFieldList',
        data
    }).init(success, error, cbs);
};

// 编辑业务对象接口
const editObj = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObj/editObj',
        data
    }).init(success, error, cbs);
};

// 保存业务对象接口
const addObj = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObject/addObj',
        data
    }).init(success, error, cbs);
};

// 查询业务对象类型接口
const queryObjTypeList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObjType/queryObjTypeList',
        data
    }).init(success, error, cbs);
};

// 更新业务对象类型状态
const changeObjTypeStatus = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObjType/changeObjTypeStatus',
        data
    }, 'put').init(success, error, cbs);
};

// 业务对象类型_查询关联成员信息
const findMembers = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-privilege/business/resource/businessType/findMembers',
        data
    }).init(success, error, cbs);
};

const editObjType = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObjType/editObjType',
        data
    }, 'put').init(success, error, cbs);
};

// 添加业务对象类型
const addObjType = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObjType/addObjType',
        data
    }, 'post').init(success, error, cbs);
};

// 添加业务对象类型
const createApiKey = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/objField/createApiKey',
        params
    }, 'get').init(success, error, cbs);
};

// 删除业务对象类型
const delObjType = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObjType/delObjType',
        params
    }, 'get').init(success, error, cbs);
};

// 业务对象类型可用字段展示接口
const getAvailableFieldInfo = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObjType/getAvailableFieldInfo',
        data
    }, 'post').init(success, error, cbs);
};

// 更新业务对象字段状态
const changeObjFieldStatus = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/objField/changeObjFieldStatus',
        data
    }, 'put').init(success, error, cbs);
};

// 业务对象类型字段可用字段修改是否必填
const updateObjTypeFieldRequired = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObjType/updateObjTypeFieldRequired',
        data
    }, 'post').init(success, error, cbs);
};

// 业务对象类型设置展示未选择和已选择字段的接口
const getAllFields = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObjType/getAllFields',
        data
    }, 'post').init(success, error, cbs);
};

// 更新业务对象类型设置展示未选择和已选择字段的接口
const updateAvailableField = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObjType/updateAvailableField',
        data
    }, 'post').init(success, error, cbs);
};

// 更新业务对象类型排序
const updateObjTypeSort = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObjType/updateObjTypeSort',
        data
    }, 'post').init(success, error, cbs);
};

// 获取选项值设置里的字段
const getObjTypeOptionField = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/option/getObjTypeOptionField',
        params
    }, 'get').init(success, error, cbs);
};

// 保存选项值设置里的字段
const saveObjTypeOptionFieldInfo = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/option/saveObjTypeOptionFieldInfo',
        data
    }).init(success, error, cbs);
};

// 根据业务类型id查询可用布局
const layoutByBusinessTypeId = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-layout/v1/layout/layoutByBusinessTypeId',
        params
    }, 'get').init(success, error, cbs);
};

// 根据业务类型id编辑可用布局
const editLayoutByBusinessTypeId = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-layout/v1/layout/layoutByBusinessTypeId',
        data
    }, 'post').init(success, error, cbs);
};

// 获取团队成员继承设置
const getTeamMemberInheritSet = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/attrMember/queryAttrMemberConfig',
        params
    }, 'get').init(success, error, cbs);
};

// 更新团队成员继承设置
const updateTeamMemberInheritSet = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-crm/attrMember/saveAttrMemberConfig',
        data
    }, 'post').init(success, error, cbs);
};
const queryConversionRuleModeAndLandingPage = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObjRule/queryConversionRuleModeAndLandingPage',
        params
    }, 'get').init(success, error, cbs);
};
const queryConversionRuleObject = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObjRule/queryConversionRuleObject',
        params
    }, 'get').init(success, error, cbs);
};

const updateConversionRuleObject = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/v2-meta/bizObjRule/updateConversionRuleObject',
        data: params
    }, 'post').init(success, error, cbs);
};
export {
    queryObjList,
    queryObjInfo,
    queryObjFieldList,
    editObj,
    addObj,
    queryObjTypeList,
    changeObjTypeStatus,
    findMembers,
    editObjType,
    addObjType,
    createApiKey,
    delObjType,
    getAvailableFieldInfo,
    changeObjFieldStatus,
    updateObjTypeFieldRequired,
    getAllFields,
    updateAvailableField,
    updateObjTypeSort,
    getObjTypeOptionField,
    saveObjTypeOptionFieldInfo,
    layoutByBusinessTypeId,
    editLayoutByBusinessTypeId,
    getTeamMemberInheritSet,
    updateTeamMemberInheritSet,
    queryConversionRuleModeAndLandingPage,
    queryConversionRuleObject,
    updateConversionRuleObject
};