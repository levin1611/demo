import { Request } from '@/api/baseUtilAjax';
export const getDepartmentList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/new-privilege/department/getPureDepartmentTree',
        data
    }).init(success, error, cbs);
};

export const getUserDataList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/new-privilege/user/getUserDataTables',
        data
    }).init(success, error, cbs);
};
// 更改txt文件解析编码
export const updateFileCharset = async (params = {}, success = null, error = null, cbs = []) => {
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

export const submitSSLdomain = async (data = {}, success = null, error = null, cbs = []) => {
    /** @orgId */
    return new Request({
        url: '/cloudshare/domain/bindSsl',
        data
    }).init(success, error, cbs);
};
export const getGoogleAdBtn = async (idvisit, success = null, error = null, cbs = []) => {
    /** @orgId */
    return new Request({
        utilKey: 'ajaxHkJson',
        // utilKey: 'localAjax',
        url: `/oversea/adsGoogleDetail/show/${idvisit}`
    }, 'get').init(success, error, cbs);
};
export const getGoogleAdInfo = async (params, success = null, error = null, cbs = []) => {
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
export const setTableColConfig = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/commonField/saveFieldOrder',
        data
    }).init(success, error, cbs);
};

// 邮箱后缀查重
export const checkContact = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contacts/sameContacts',
        params
    }, 'get').init(success, error, cbs);
};

// 获取联系人查重关联数据
export const getContactRepeatData = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/inquiry/getRepeatListByContacts',
        params
    }, 'get').init(success, error, cbs);
};

// 获取系统默认排除邮箱后缀
export const getSystemExcludeSuffixes = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contactsEmailSuffix/getCommonEmailSuffixList'
    }).init(success, error, cbs);
};

// 获取自定义排除邮箱后缀
export const getCustomExcludeSuffixes = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/contactsEmailSuffix/getOrgEmailSuffixList',
        data
    }).init(success, error, cbs);
};

// 保存翻译
export const saveTranslate = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/cuss-login/translate/save',
        data
    }).init(success, error, cbs);
};
