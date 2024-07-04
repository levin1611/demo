import { Request } from '@/api/baseUtilAjax';

/** 获取公司信息 */
const getCompanyInformation = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/org/getOrgList',
        data
    }).init(success, error, cbs);
};

/** 检查用户信息是否存在 查看登陆账号用户名、wa账号等信息 */
const checkUserInfoExists = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax233',
        url: '/cardManage/checkUserInfoExists',
        method: 'get',
        params
    }).init(success, error, cbs);
};

// 部门树初始化
const getDepartmentTree = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/new-privilege/department/getDepartmentTree',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 获取所有功能权限
const getRoleAllByPage = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/role/allByPage',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 获取所有管理权限
const getManageAllByPage = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/manage/allByPage',
        method: 'post',
        data
    }).init(success, error, cbs);
};

// 获取所有字段权限
const getFieldAllByPage = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/field/allByPage',
        method: 'post',
        data
    }).init(success, error, cbs);
};

/** 通用列表项删除复用接口 */
const updateIsAvailable = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/crm/attr/updateIsAvailable',
        data
    }).init(success, error, cbs);
};

/** 通用删除列表项 */
/** 暂时保留，组件中使用的是deleteAttr(attrId)方法,但是发现该方法没有调用 */
const crmAttrDelete = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/crm/attr/delete',
        data
    }).init(success, error, cbs);
};

/** 通用排序接口 */
const updateSortNo = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/crm/attr/updateSortNo',
        data
    }).init(success, error, cbs);
};

const getDepartmentList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/new-privilege/department/getPureDepartmentTree',
        data
    }).init(success, error, cbs);
};
// 获取 全部用户 包括已经离职的、禁用的
const getUserDataList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/user/getUserDataTables',
        data
    }).init(success, error, cbs);
};
// 更改txt文件解析编码
const updateFileCharset = async (params = {}, success = null, error = null, cbs = []) => {
    /**
     * @param {mime} [txt文件解码] text/plain;chartset=UTF-8
     * @param {key} [文件预览地址] 20131801591175836000_crmDocument.txt <== https://content.leadscloud.com/20131801591175836000_crmDocument.txt
    */
    // if (params && !params.key) {
    //     console.log('%c updateFileCharset 缺少key参数', 'color:red');
    //     return false;
    // }
    return new Request({
        url: '/file-sys/mime/changeMime',
        params: {
            mime: 'text/plain;charset=UTF-8',
            ...params
        }
    }, 'get').init(success, error, cbs);
};

const submitSSLdomain = async (data = {}, success = null, error = null, cbs = []) => {
    /** @orgId */
    return new Request({
        url: '/cloudshare/domain/bindSsl',
        data
    }).init(success, error, cbs);
};
const getGoogleAdBtn = async (idvisit, success = null, error = null, cbs = []) => {
    /** @orgId */
    return new Request({
        utilKey: 'ajaxHkJson',
        // utilKey: 'localAjax',
        url: `/oversea/adsGoogleDetail/show/${idvisit}`
    }, 'get').init(success, error, cbs);
};
const getGoogleAdInfo = async (params, success = null, error = null, cbs = []) => {
    /**
     * @idvisit
     * @orgId
     * @url
     */
    return new Request({
        utilKey: 'ajaxHkJson',
        // utilKey: 'localAjax',
        url: 'oversea/adsGoogleDetail/info',
        params
    }, 'get').init(success, error, cbs);
};

// 表格列宽调整后触发回调保存新列宽信息
const setTableColConfig = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/commonField/saveFieldOrder',
        data
    }).init(success, error, cbs);
};

// 邮箱后缀查重
const checkContact = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contacts/sameContacts',
        params
    }, 'get').init(success, error, cbs);
};

// 获取联系人查重关联数据
const getContactRepeatData = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiry/getRepeatListByContacts',
        params
    }, 'get').init(success, error, cbs);
};

// 获取系统默认排除邮箱后缀
const getSystemExcludeSuffixes = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contactsEmailSuffix/getCommonEmailSuffixList'
    }).init(success, error, cbs);
};

// 获取自定义排除邮箱后缀
const getCustomExcludeSuffixes = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contactsEmailSuffix/getOrgEmailSuffixList',
        data
    }).init(success, error, cbs);
};

// 保存翻译
const saveTranslate = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/cuss-login/translate/save',
        data
    }).init(success, error, cbs);
};

// 获取 全部销售人员列表
const getSaleUserList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxLeadscloud',
        // url: '/cuss-login/getSaleUserList',
        url: '/v2-privilege/user/getAllUsers',
        params: data
    }, 'get').init(success, error, cbs);
};

// 获取 获取全部用户 不包括离职人员、禁用的
const getUserInfoList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxLeadscloud',
        // url: '/cuss-login/getUserInfoList',
        url: '/v2-privilege/user/getAllUsers',
        params: data
    }, 'get').init(success, error, cbs);
};

// 获取下拉框数据
const getField = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/attr/getField',
        data
    }).init(success, error, cbs);
};

// 获取当前用户是否有可接询盘权限, 再决定是否弹出认领确认框
const getUserPrivilege = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/new-privilege/user/get',
        params
    }, 'get').init(success, error, cbs);
};

// 获取 WA 二维码版本(企业相关信息)
const getOrgPrivilege = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: `/minor/api/account/getAccountConfig?orgId=${data.orgId}`
        // data
    }).init(success, error, cbs);
};

// 跟进typeId 获取相应的下拉框选项或步骤，7询盘全部状态，12关闭询盘原因,9退入公海
const getFollowUpList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/attr/getList',
        data
    }).init(success, error, cbs);
};


const getXSShow = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/form/getXSShow',
        data
    }).init(success, error, cbs);
};
// 获取crm 客户自定义字段（包括询盘parentId3、联系人parentId2、公司parentId1）
const getColumnsShow = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/custom/getColumnsShow',
        data
    }).init(success, error, cbs);
};

// 保存一些公用方法，涉及到的有 新增询盘标签
const attrSave = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/attr/save',
        data
    }).init(success, error, cbs);
};

// 获取询盘的默认字段
const columnConfigGetList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/columnConfig/getList',
        data
    }, 'post').init(success, error, cbs);
};

// 获取 token 后批量发送上传请求
const uptoken = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'oldAjax',
        url: '/file-sys/api/uptoken',
        data
    }).init(success, error, cbs);
};

// 获取默认字段+客户自定义字段 /crm/columnConfig/getList + /crm/custom/getColumnsShow 的集合
const getAllColumns = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/commonConfig/getAllColumns',
        data
    }, 'post').init(success, error, cbs);
};

// 获取客户、联系人、询盘授权字段
const getFields = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/columnConfig/getFields',
        params
    }, 'get').init(success, error, cbs);
};

// 校验国家地区
const getDetailByCode = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/report/country/getDetailByCode',
        data
    }).init(success, error, cbs);
};
// 通过网站表单id获取列表字段
const getColumns = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/form/getColumns',
        data
    }).init(success, error, cbs);
};

// 获取 token 后批量发送上传请求
const copyFile = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'oldAjaxJson',
        url: '/file-sys/fileOperate/copyFile',
        data
    }).init(success, error, cbs);
};

// 获取企业部门
const getCrmManageDepartments = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/new-privilege/department/getCrmManageDepartments',
        params
    }, 'get').init(success, error, cbs);
};
// 获取企业全部部门（不区分权限）
const getCrmManageAllDepartments = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/new-privilege/department/getCrmManageAllDepartments',
        params
    }, 'get').init(success, error, cbs);
};
// 获取企业部门下的人
const getCrmUserByleaderUserId = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/user/getCrmUserByleaderUserId',
        params
    }, 'get').init(success, error, cbs);
};
// 获取企业所有部门下的人（不区分权限）
const getCrmUserByleaderOrgId = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/user/getCrmUserByleaderOrgId',
        params
    }, 'get').init(success, error, cbs);
};
// 所有下属接口
const getUsersMsgForApp = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/manage/getUsersMsgForApp',
        params
    }, 'get').init(success, error, cbs);
};
// 所有下属接口
const getComeGoUserList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/mail/comeGoUserList',
        data
    }).init(success, error, cbs);
};

// 判断时间轴是否重建中
const journeyIsRebuild = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/journey/isRebuild',
        data
    }).init(success, error, cbs);
};

// 执行时间轴重建
const journeyRebuild = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/journey/rebuild',
        data
    }).init(success, error, cbs);
};

// 根据WA账号查询国家地区
const getCountryInfo = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: `/minor/api/country/getCountryInfo?whatsappAccount=${data.whatsappAccount}`
        // data
    }).init(success, error, cbs);
};

// 获取表单翻译多语言
const getConfigOrBrowserLanguageForList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/cuss-login/translate/getConfigOrBrowserLanguageForList',
        data
    }).init(success, error, cbs);
};

// 自动翻译功能:批量获取收信翻译
const appTranslationWithSource = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/translation/appTranslationWithSource',
        data
    }).init(success, error, cbs);
};

// 更新翻译字符数
const updateCharacterCount = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/org/updateCharacterCount',
        data
    }).init(success, error, cbs);
};
// 租户登录获取token
const userLoginForOrg = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxLeadscloudJson',
        url: '/v2-privilege/user/userLoginForOrg',
        data
    }).init(success, error, cbs);
};
// 发送短信验证码
const sendVerificationCodeByMobile = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxLeadscloudJson',
        url: '/v2-privilege/verification/sendVerificationCodeByMobile',
        params
    }, 'get').init(success, error, cbs);
};
// 发送邮件验证码
const sendVerificationCodeByEmail = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxLeadscloudJson',
        url: '/v2-privilege/verification/sendVerificationCodeByEmail',
        params
    }, 'get').init(success, error, cbs);
};
// 验证 验证码 接口
const verificationCode = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxLeadscloudJson',
        url: '/v2-privilege/account/verificationCode',
        data
    }).init(success, error, cbs);
};

// 获取新系统菜单
const getMenuTree = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxLeadscloudJson',
        url: '/v2-privilege/user/permission/getMenuTree',
        params
    }, 'get').init(success, error, cbs);
};
// 新系统退出登录
const logoutByLarkId = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxLeadscloudJson',
        url: '/v2-privilege/account/logoutByLarkId',
        params
    }, 'get').init(success, error, cbs);
};
// 获取有成员的部门及成员
const getDepartmentUserTree = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxLeadscloudJson',
        url: '/v2-privilege/department/getDepartmentUserTree',
        data
    }).init(success, error, cbs);
};
// 获取设置的网站客户列表
const getServerList = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/visitor-chat/newTenant/server/getList',
        params
    }, 'get').init(success, error, cbs);
};
// 获取权限范围内的部门
const getDepartmentByUserId = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxLeadscloudJson',
        url: '/v2-privilege/user/permission/getDepartmentByUserId',
        params
    }, 'get').init(success, error, cbs);
};

// 获取权限范围内的人员数据
const getNewusers = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxLeadscloudJson',
        url: '/v2-privilege/user/permission/getNewusers',
        params
    }, 'get').init(success, error, cbs);
};
// 获取全部部门接口
const getV2DepartmentTree = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxLeadscloudJson',
        url: '/v2-privilege/polymerization/getDepartmentTree',
        params
    }, 'get').init(success, error, cbs);
};
// 获取全部角色接口
const getV2AllByPage = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxLeadscloudJson',
        url: '/v2-privilege/polymerization/allByPage',
        params
    }, 'get').init(success, error, cbs);
};
// 获取全部成员接口
const getV2AllUsers = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxLeadscloudJson',
        url: '/v2-privilege/user/getAllUsers',
        params
    }, 'get').init(success, error, cbs);
};
export default {
    getCompanyInformation,
    checkUserInfoExists,
    getDepartmentList,
    getUserDataList,
    updateFileCharset,
    submitSSLdomain,
    getGoogleAdBtn,
    getGoogleAdInfo,
    setTableColConfig,
    checkContact,
    getContactRepeatData,
    getSystemExcludeSuffixes,
    getCustomExcludeSuffixes,
    saveTranslate,
    getSaleUserList,
    getUserInfoList,
    getField,
    getUserPrivilege,
    getOrgPrivilege,
    getFollowUpList,
    getXSShow,
    getColumnsShow,
    attrSave,
    columnConfigGetList,
    updateSortNo,
    crmAttrDelete,
    updateIsAvailable,
    getRoleAllByPage,
    getManageAllByPage,
    getFieldAllByPage,
    getDepartmentTree,
    uptoken,
    getAllColumns,
    getFields,
    getDetailByCode,
    getColumns,
    copyFile,
    getCrmManageDepartments,
    getCrmManageAllDepartments,
    getCrmUserByleaderUserId,
    getCrmUserByleaderOrgId,
    getUsersMsgForApp,
    getComeGoUserList,
    journeyIsRebuild,
    getCountryInfo,
    journeyRebuild,
    appTranslationWithSource,
    updateCharacterCount,
    getConfigOrBrowserLanguageForList,
    userLoginForOrg,
    sendVerificationCodeByMobile,
    sendVerificationCodeByEmail,
    verificationCode,
    getMenuTree,
    logoutByLarkId,
    getDepartmentUserTree,
    getServerList,
    getDepartmentByUserId,
    getNewusers,
    getV2DepartmentTree,
    getV2AllByPage,
    getV2AllUsers
};
