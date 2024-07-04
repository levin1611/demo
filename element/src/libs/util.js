import i18n from '@/locale';
import axios from 'axios';
import { Message } from 'element-ui';
import Cookies from 'js-cookie';
import qs from 'qs';
import env from '../../build/env';
import URLs from '../../build/url';
import { router } from '../router/index';
import store from '../store';
const { VUE_APP_API_URL } = process.env;

const origin = location.origin;
// 请求地址设置
let ajaxUrl = '';
let ajaxWebSiteUrl = '';
let internationalUrl = '';
let mailUrl = '';
let mailSaveDraftUrl = '';
let buriedUrl = '';
let NewMailBoxUrl = '';
let AutomaticSiteUrl = '';
let AutomaticSiteUrlV2 = '';
let AutomaticSiteDomainUrl = '';
let ajaxMKT = '';
let EmailMarketingUrl = '';
let WAUrl = '';
let openapiUrl = '';
let oldAjaxUrl = '';
const leadscloudBaseUrl = VUE_APP_API_URL || 'https://crm-api.leadscloud.com';
let WAFileUrl = 'https://directhkendtx.leadscloud.com';
const ajaxWebsiteUrl2 = 'https://websitetx.leadscloud.com';
const insDomain = 'https://instagram.leadscloud.com/'; // 七牛资源域名
const WAPersonalEditionUrl = 'https://wsmatehk.wsmate.com';
internationalUrl = URLs.productionInternationalUrl;
NewMailBoxUrl = URLs.productionNewMailBoxUrl;
WAUrl = URLs.WAUrl;
ajaxMKT = URLs.productionUrlMKT;
// 兼容海外版本
let productionUrlAjaxUrl = '';
let productionUrlMailUrl = '';
let productionUrlmailSaveDraftUrl = '';
if (origin.indexOf('qa-crm') > 0 || origin.indexOf('localhost') > 0) {
    productionUrlAjaxUrl = URLs.leadscloudBaseDevUrl;
    productionUrlMailUrl = URLs.leadscloudBaseDevUrl;
    productionUrlmailSaveDraftUrl = URLs.leadscloudBaseDevUrl;
    internationalUrl = URLs.leadscloudBaseDevUrl;
    NewMailBoxUrl = URLs.leadscloudBaseDevUrl;
    WAUrl = URLs.leadscloudBaseDevUrl;
    ajaxMKT = `${URLs.leadscloudBaseDevUrl}/cloudshare`;
    buriedUrl = 'https://txlibtest.leadscloud.com';
} else if (origin.indexOf('test-crm') > 0) {
    productionUrlAjaxUrl = URLs.productionTestUrl;
    productionUrlMailUrl = URLs.productionTestUrl;
    productionUrlmailSaveDraftUrl = URLs.productionTestUrl;
    internationalUrl = URLs.productionTestUrl;
    NewMailBoxUrl = URLs.productionTestUrl;
    WAUrl = URLs.productionTestWAUrlUrl;
    ajaxMKT = `${URLs.productionTestUrl}/cloudshare`;
    WAFileUrl = 'https://txdirecthkendtest.leadscloud.com';
    buriedUrl = 'https://txlibtest.leadscloud.com';
} else {
    productionUrlAjaxUrl = URLs.productionUrl;
    productionUrlMailUrl = URLs.productionMailUrl;
    productionUrlmailSaveDraftUrl = URLs.productionMailSaveDraftUrl;
    buriedUrl = URLs.productionBuriedUrl;
}
ajaxUrl = productionUrlAjaxUrl;
ajaxWebSiteUrl = URLs.productionWebSiteUrl;
oldAjaxUrl = productionUrlAjaxUrl;
mailUrl = productionUrlMailUrl;
mailSaveDraftUrl = productionUrlmailSaveDraftUrl;
AutomaticSiteUrl = URLs.productionAutomaticSiteUrl;
AutomaticSiteUrlV2 = URLs.productionAutomaticSiteUrlV2;
AutomaticSiteDomainUrl = URLs.productionAutomaticSiteDomainUrl;
EmailMarketingUrl = URLs.productionEmailMarketingUrl;
openapiUrl = URLs.openapiUrl;

axios.defaults.baseURL = ajaxUrl;

// 其他设置
axios.defaults.withCredentials = true;
const oldAjax = axios.create({
    baseURL: oldAjaxUrl,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        noLoginDis: 'myoption'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ]
});
const oldAjaxJson = axios.create({
    baseURL: oldAjaxUrl,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        noLoginDis: 'myoption'
    }
});
// 定义多种发送配置
const ajax = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ]
});
const ajaxHkJson = axios.create({
    baseURL: NewMailBoxUrl,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    }
});
const localAjax = axios.create({
    baseURL: 'http://192.168.72.13:7089', // 本地测试 联调接口
    timeout: 30000,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
    // withCredentials: true,
    // headers: {
    //     'Content-Type': 'application/json;charset=UTF-8'
    // }
    // transformRequest: [
    //     (data) => {
    //         data = qs.stringify(data);
    //         return data;
    //     }
    // ]
});
// 定义多种发送配置
const localAjaxForm = axios.create({
    baseURL: 'http://192.168.72.13:7089', // 本地测试 联调接口
    timeout: 30000,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ]
});
const ajax233 = axios.create({
    baseURL: ajaxMKT,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ]
});
const ajaxShareMail = axios.create({
    baseURL: ajaxMKT,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    }

});
const ajaxReceiveMail = axios.create({
    baseURL: mailUrl,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ]
});
const ajaxReceiveMailJson = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    }
    // transformRequest: [
    //     (data) => {
    //         data = qs.stringify(data)
    //         return data
    //     }
    // ]
});
const ajaxMail = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ]
});
const ajaxMailJson = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
});

const ajaxMailParamsSerializer = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ],
    paramsSerializer(params) {
        return qs.stringify(params, { indices: false });
    }
});

const ajaxEdmMailParamsSerializer = axios.create({
    baseURL: EmailMarketingUrl,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ],
    paramsSerializer(params) {
        return qs.stringify(params, { indices: false });
    }
});

const ajaxLongTime = axios.create({ /* 两分半 */
    baseURL: ajaxUrl,
    timeout: 150000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ]
});
const ajaxMoreLongTime = axios.create({ /* 六分钟 */
    baseURL: ajaxUrl,
    timeout: 360000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ]
});
const ajaxJson = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
});

const ajaxAiJson = axios.create({
    baseURL: ajaxUrl,
    timeout: 200000,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
});

const ajaxWebSiteJson = axios.create({
    baseURL: ajaxWebSiteUrl,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
});

const ajaxOpenapiJson = axios.create({
    baseURL: openapiUrl,
    timeout: 200000,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
});
const ajaxWebSite2 = axios.create({
    baseURL: ajaxWebsiteUrl2,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ]
});
const ajax3 = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    transformRequest: [function(data) {
        data = util.qs.stringify(data);
        return data;
    }]
});
const ajax5 = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    transformRequest: [function(data) {
        data = util.qs.stringify(data);
        return data;
    }]
});
const ajax7 = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000
//  headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"},
//  transformRequest: [function (data) {
//    data = util.qs.stringify(data)
//    return data;
//  }],
});
const ajaxInternational = axios.create({
    baseURL: internationalUrl,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ]
});
const ajaxFK = axios.create({
    baseURL: URLs.FKUrl,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ]
});
const ajaxInternationalLongTime = axios.create({
    baseURL: internationalUrl,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ]
});
const ajaxInternationalJsonLangTime = axios.create({
    baseURL: internationalUrl,
    timeout: 360000,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
});
const ajaxInternationalJson = axios.create({
    baseURL: internationalUrl,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
});
const ajaxFile = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000,
    headers: { 'Content-Type': 'multipart/form-data' }
});
const ajaxFileLongTime = axios.create({
    baseURL: ajaxUrl,
    timeout: 300000,
    headers: { 'Content-Type': 'multipart/form-data' }
});
const ajaxInternationalFile = axios.create({
    baseURL: internationalUrl,
    timeout: 30000,
    headers: { 'Content-Type': 'multipart/form-data' }
});
const ajaxInternationalFileLongTime = axios.create({
    baseURL: internationalUrl,
    timeout: 300000,
    headers: { 'Content-Type': 'multipart/form-data' }
});
const ajaxWAFileLongTime = axios.create({
    baseURL: WAFileUrl,
    timeout: 300000,
    headers: { 'Content-Type': 'multipart/form-data' }
});

const ajaxJsonMoreLongTime = axios.create({
    baseURL: ajaxUrl,
    timeout: 360000,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
});

const ajaxParamsSerializer = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ],
    paramsSerializer(params) {
        return qs.stringify(params, { indices: false });
    }
});

const ajaxNewMailBoxJson = axios.create({
    baseURL: NewMailBoxUrl,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    }
    // transformRequest: [
    //     (data) => {
    //         data = qs.stringify(data)
    //         return data
    //     }
    // ]
});
const ajaxDownloadFile = axios.create({
    baseURL: '',
    /* timeout: 60000, */
    responseType: 'blob',
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    }
    // transformRequest: [
    //     (data) => {
    //         data = qs.stringify(data)
    //         return data
    //     }
    // ]
});
const ajaxMailSaveDraftJson = axios.create({
    baseURL: mailSaveDraftUrl,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    }
});
// AMP项目 配合JAVA重构接口新建的axios实例
const ajaxAMPJson = axios.create({
    baseURL: AutomaticSiteUrlV2,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    }
});
const ajaxAMP = axios.create({
    baseURL: AutomaticSiteUrlV2,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ]
});

// EDM 接口
const ajaxEmailMarketing = axios.create({
    baseURL: EmailMarketingUrl,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ]
});
const ajaxEmailMarketingJson = axios.create({
    baseURL: EmailMarketingUrl,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
});
const ajaxEmailMarketingJsonLongTime = axios.create({
    baseURL: EmailMarketingUrl,
    timeout: 150000,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
});

// wa 新接口
const ajaxWA = axios.create({
    baseURL: WAUrl,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ]
});

// wa 接口 - form-data
const ajaxWAFormData = axios.create({
    baseURL: WAUrl,
    timeout: 30000,
    headers: { 'Content-Type': 'multipart/form-data' }
});
const ajaxWAFormDataLongTime = axios.create({
    baseURL: WAUrl,
    timeout: 90000,
    headers: { 'Content-Type': 'multipart/form-data' }
});
const ajaxWAJsonLongTime = axios.create({
    baseURL: WAUrl,
    timeout: 120000,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
});

const ajaxWAJson = axios.create({
    baseURL: WAUrl,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
});

// WA 个人版独有接口请求
const ajaxWAPersonalEdition = axios.create({
    baseURL: WAPersonalEditionUrl,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ]
});
// 英科权限接口
const ajaxLeadscloud = axios.create({
    baseURL: leadscloudBaseUrl,
    timeout: 30000,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
        (data) => {
            data = qs.stringify(data);
            return data;
        }
    ]
});
const ajaxLeadscloudJson = axios.create({
    baseURL: leadscloudBaseUrl,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
});

// 定义通用方法
// 跳回登录页面
function jump_to_login(message, before_func) {
    // 如果已经在登录页了, 或者地址栏还是 '#/' 状态(还没进到系统), 则不用执行往下执行继续跳到登录页
    const currRouteName = router.currentRoute.name;
    if (['login', 'otherRouter'].includes(currRouteName)) {
        console.error('当前已经在登录页了, 不用继续执行, 此次 message 为:');
        console.error(message);
        return;
    }

    // 设置 message 为意外退出提示语, 存入到 localStorage , 跳转到登录页后弹出提示语并从 localStorage 删除
    if (message) {
        localStorage.setItem('quitUnexpectedlyMsg', message);
    }

    // 删除 cookie 中登录态相关数据
    /**
     * @Description: 【ID1011710】多开窗口时，切换账号至其他企业被自动退出
     * 因为此处新增了删除 cookie 逻辑, 线上出现关联账号多标签页打开时, 某一标签页切换关联账号时, 会和其他标签页一起退出登录
     * 原因: A 标签页切换账号, 导致其他页面 cookie 错误, 触发 jump_to_login , 于此处清空旧 cookie , A 标签之后也因为 cookie 为空, 再次触发 jump_to_login 退出登录了
     * @author 汤一飞
     * @date 2021/12/8
     */
    let shouldClear = true;
    // 先获取"关联账号"
    let relatedAccounts = Cookies.get('relatedAccounts') || '[]';
    try {
        relatedAccounts = JSON.parse(relatedAccounts);
    } catch (e) {
        relatedAccounts = [];
    }
    // 当关联账号中存在当前 userId 时, 不清空 cookie
    shouldClear = !relatedAccounts.find(item => Cookies.get('userId') === `${item.userId}`);
    // 但如果此账号与 Cookie 中的 userId 一致, 说明就是此账号触发的"jump_to_login"操作, 依然需要清空 cookie , 否则会触发底部的 location.reload() 一直刷新
    shouldClear = Cookies.get('userId') === `${store.state.userId}`;
    if (shouldClear) {
        Cookies.remove('userName');
        Cookies.remove('userId');
        Cookies.remove('token');
        Cookies.remove('accId');
        Cookies.remove('agentOrgList');
        Cookies.remove('enterpriseId');
        Cookies.remove('initMenu');
        Cookies.remove('notChatWithOther');
    }

    // 执行跳转前操作
    if (before_func) {
        before_func();
    }

    // 从 wa 个人版退出登录, 应当跳转到 wsmate 网址
    if (store.getters.isWAPersonalEdition && !(/^(www\.)?wsmate\.com$/.test(window.location.host))) {
        localStorage.setItem('XHLLogin', 'LOGOUT');
        window.open('https://www.wsmate.com/#/login', '_self');
        return;
    }
    if (!Cookies.get('userId')) {
        // userId 已被清除

        // 地址栏跳转到 Front-Vue , 随后路由导到 login 界面(直接跳转到 login 不行, 地址栏 # 后面变更并不会刷新页面)
        location.href = location.href.replace(/#.*$/, '');
    } else {
        // userId 未被清除

        // 刷新页面
        location.reload();
    }
}

// 定义拦截器
const request_interceptor_success = config => {
    // 发送请求前, 对 baseURL 做处理
    // 香港线路 fkchat/hkend01/wa01/directhkend , 杭州线路 fkchat01/hkend02/wa02/directhkend01
    // if (config && config.baseURL) {
    //     // 如果是 WAUrl 请求, 则优先取健康检查后的 WAUrl
    //     if (config.baseURL === WAUrl) {
    //         config.baseURL = store.state.healthWAUrl || WAUrl;
    //     }

    //     // 如果是 WAFileUrl 请求, 则优先取健康检查后的 WAFileUrl
    //     if (config.baseURL === WAFileUrl) {
    //         if (store.state.healthWAUrl && store.state.healthWAUrl.includes('wa02')) {
    //             // 杭州线路 - 默认是走香港线路不用判断
    //             config.baseURL = WAFileUrl.replace('directhkend', 'directhkend01');
    //         }
    //     }

    //     // 如果是 hkend01 请求, 对非 /mailhk/, /sendmail/ 类接口取健康检查后的 FBUrl
    //     if (['https://hkend01tx.leadscloud.com'].includes(config.baseURL)) {
    //         if (store.state.healthFBUrl) {
    //             if (!['/mailhk/', '/sendmail/'].some(i => config.url.startsWith(i))) {
    //                 config.baseURL = store.state.healthFBUrl;
    //             }
    //         }
    //     }

    //     // 如果是 fkchat 请求, 对 /visitor-chat/, /server/ 类接口取健康检查后的 FBUrl
    //     if (['https://fkchattx.leadscloud.com'].includes(config.baseURL)) {
    //         if (store.state.healthFBUrl) {
    //             if (['/visitor-chat/', '/server/'].some(i => config.url.startsWith(i))) {
    //                 config.baseURL = store.state.healthFBUrl;
    //             }
    //         }
    //     }

    //     // 如果是 wa 个人版请求, 默认走 hkend 相关线路, 健康检查接口判断杭州线路更优则使用杭州线路 cnend
    //     if (config.baseURL === WAPersonalEditionUrl) {
    //         if (store.state.healthFBUrl && store.state.healthFBUrl.includes('hkend02')) {
    //             config.baseURL = WAPersonalEditionUrl.replace('wsmatehk.wsmate.com', 'wsfreetx.leadscloud.com');
    //         }
    //     }
    // }
    if (Cookies.get('accessToken')) {
        if (config.url.indexOf('/whatsapp/') !== -1 || config.url.indexOf('/websocketLeavemessage/') !== -1) {
            // whatsapp的接口不需要添加头 否则会跨域 & websocket的接口不需要添加头 否则会跨域
        } else {
            config.headers.Authorization = Cookies.get('accessToken');
        }
        // config.headers.noLoginDis = 'myoption';
    }
    // 暂存当前路由名称
    const currRouteName = router.currentRoute.name;
    // 如果路由名称为空, 说明还没真正进入系统, 直接返回
    // 不知道为啥出现这个情况, 但是下方的 console 语句之前确实打印出了 null , 现在追加一些 console 语句, 尝试定位问题
    if (!currRouteName) {
        return config;
    }

    if (['authorizedLogin'].includes(currRouteName)) {
        console.log('cinnox询盘云授权登陆');
    } else if (['forgetPwd', 'setUpPwd'].includes(currRouteName)) {
        console.log('忘记密码页面');
    } else if (!['otherRouter', 'login'].includes(currRouteName)) {
        if (!Cookies.get('enterpriseId') || String(Cookies.get('enterpriseId')) !== `${store.state.enterpriseId}`) {
            // 加上 console 语句, 定位页面无限刷新问题
            console.error('request interceptor');
            console.error(currRouteName);
            console.error(location.href);
            console.error(JSON.stringify(config));

            // 进入意外退出到登录页流程
            jump_to_login(i18n.t('tokenExpired'), () => {
                // 追加错误信息到 localStorage , 跳转到登录页之后打印错误信息, 并清除此 localStorage
                let quitReason = localStorage.getItem('quitUnexpectedlyReason') || '';
                quitReason += `EnterpriseId(cookie): ${Cookies.get('enterpriseId')};EnterpriseId(vuex): ${store.state.enterpriseId};`;
                localStorage.setItem('quitUnexpectedlyReason', quitReason);
            });
        } else if (!Cookies.get('userId') || `${Cookies.get('userId')}` !== String(store.state.userId)) {
            // 加上 console 语句, 定位页面无限刷新问题
            console.error('request interceptor');
            console.error(currRouteName);
            console.error(location.href);
            console.error(JSON.stringify(config));

            // 进入意外退出到登录页流程
            jump_to_login(i18n.t('tokenExpired'), () => {
                // 追加错误信息到 localStorage , 跳转到登录页之后打印错误信息, 并清除此 localStorage
                let quitReason = localStorage.getItem('quitUnexpectedlyReason') || '';
                quitReason += `UserId(cookie): ${Cookies.get('userId')};UserId(vuex): ${store.state.userId};`;
                localStorage.setItem('quitUnexpectedlyReason', quitReason);
            });
        }
    }
    // console.log('request_interceptor_success', config);
    // config.headers.userId = store.state.userId;
    return config;
};

// 接口响应拦截器
const response_interceptor_success = response => {
    // 暂存当前路由名称
    const currRouteName = router.currentRoute.name;

    // 如果路由名称为空, 说明还没真正进入系统, 直接返回
    // 复制自上面的接口请求拦截器, 保持一致
    if (!currRouteName) {
        return response;
    }

    if (response.data.code === 'NEED_REDIRECT') {
        if (!['otherRouter', 'login'].includes(currRouteName)) {
            // 加上 console 语句, 定位页面无限刷新问题
            console.error('response interceptor');
            console.error(currRouteName);
            console.error(location.href);
            console.error(JSON.stringify(response));

            // 进入意外退出到登录页流程
            jump_to_login(i18n.t('tokenExpired'), () => {
                // 追加错误信息到 localStorage , 跳转到登录页之后打印错误信息, 并清除此 localStorage
                let quitReason = localStorage.getItem('quitUnexpectedlyReason') || '';
                quitReason += 'CODE: NEED_REDIRECT;';
                localStorage.setItem('quitUnexpectedlyReason', quitReason);
            });
        }

        throw new axios.Cancel('Token expired');
    }

    // // 记录错误日志
    // if (['NEED_REDIRECT', '0', 'undefined', 'null'].includes(`${response.data.code}`)) {
    //     saveErrorLog({
    //         name: `ERR_CODE ${response.request.responseURL}`,
    //         msg: response.data
    //     });
    // }

    return response;
};
const response_interceptor_error = error => {
    console.log(error);
    // 请求错误时做些事
    // Vue.prototype.$Message.error(error);
    // if (/timeout of (\d+)ms exceeded/.test(error.toString())) {
    //     Message.error(i18n.t('requestTimeout'));
    // } else if (/Network Error/.test(error.toString())) {
    //     Message.error(i18n.t('networkError'));
    // }

    if (error && error.response) {
        if ([401, 403].includes(error.response.status)) {
            jump_to_login(i18n.t('tokenExpired'), () => {
                // 追加错误信息到 localStorage , 跳转到登录页之后打印错误信息, 并清除此 localStorage
                let quitReason = localStorage.getItem('quitUnexpectedlyReason') || '';
                quitReason += `Status: ${error.response.status};`;
                localStorage.setItem('quitUnexpectedlyReason', quitReason);
            });
        }

        // 406 系统正在升级中的code码
        if ([406].includes(error.response.status)) {
            // 跳转至登录页面，显示正在升级中
            Message.closeAll();
            store.commit('setIsUpgrade', true);
            jump_to_login(null, () => {
                // 追加错误信息到 localStorage , 跳转到登录页之后打印错误信息, 并清除此 localStorage
                let quitReason = localStorage.getItem('quitUnexpectedlyReason') || '';
                quitReason += `Status: ${error.response.status};`;
                localStorage.setItem('quitUnexpectedlyReason', quitReason);
            });
        }

        // // 记录错误日志
        // saveErrorLog({
        //     name: `ERR_STATUS ${error.response.request.responseURL}`,
        //     msg: error.response.data || error
        // });
    }

    // // 记录错误日志
    // if (error && !error.response && error.message) {
    //     saveErrorLog({
    //         name: 'ERR_MESSAGE',
    //         msg: error
    //     });
    // }

    throw error;
};

// 批量添加拦截器
[
    oldAjax,
    oldAjaxJson,
    ajax,
    ajaxHkJson,
    localAjax,
    localAjaxForm,
    ajaxMail,
    ajaxReceiveMail,
    ajaxReceiveMailJson,
    ajaxMailJson,
    ajaxLongTime,
    ajaxMoreLongTime,
    ajaxJson,
    ajaxAiJson,
    ajaxWebSiteJson,
    ajaxOpenapiJson,
    ajaxWebSite2,
    ajax3,
    ajax5,
    ajax7,
    ajax233,
    ajaxShareMail,
    ajaxInternational,
    ajaxFK,
    ajaxInternationalJson,
    ajaxJsonMoreLongTime,
    ajaxInternationalLongTime,
    ajaxInternationalJsonLangTime,
    ajaxFile,
    ajaxFileLongTime,
    // ajaxAdminFile,
    // ajaxAdminFileLongTime,
    ajaxInternationalFile,
    ajaxInternationalFileLongTime,
    ajaxWAFileLongTime,
    ajaxJsonMoreLongTime,
    ajaxParamsSerializer,
    ajaxMailParamsSerializer,
    ajaxNewMailBoxJson,
    ajaxDownloadFile,
    ajaxMailSaveDraftJson,
    ajaxAMPJson,
    ajaxAMP,
    ajaxEmailMarketing,
    ajaxEmailMarketingJson,
    ajaxEmailMarketingJsonLongTime,
    ajaxWA,
    ajaxWAJsonLongTime,
    ajaxWAJson,
    ajaxWAFormData,
    ajaxWAFormDataLongTime,
    ajaxWAPersonalEdition,
    ajaxLeadscloud,
    ajaxLeadscloudJson
].forEach(item => {
    item.interceptors.request.use(request_interceptor_success);
    item.interceptors.response.use(response_interceptor_success, response_interceptor_error);
    // item.interceptors.response.use(response_interceptor_success);
});

const util = {
    axios,
    ajaxUrl,
    ajaxHkJson,
    internationalUrl,
    buriedUrl,
    mailUrl,
    EmailMarketingUrl,
    WAUrl,
    oldAjax,
    oldAjaxJson,
    ajax,
    localAjax,
    localAjaxForm,
    ajaxMail,
    ajaxReceiveMail,
    ajaxReceiveMailJson,
    ajaxMailJson,
    ajaxLongTime,
    ajaxMoreLongTime,
    ajaxJson,
    ajaxAiJson,
    ajaxWebSiteJson,
    ajaxOpenapiJson,
    ajaxWebSite2,
    ajax3,
    ajax5,
    ajax7,
    ajax233,
    ajaxShareMail,
    ajaxInternational,
    ajaxFK,
    ajaxInternationalJson,
    ajaxInternationalLongTime,
    ajaxInternationalJsonLangTime,
    ajaxFile,
    ajaxFileLongTime,
    // ajaxAdminFile,
    // ajaxAdminFileLongTime,
    ajaxInternationalFile,
    ajaxInternationalFileLongTime,
    ajaxWAFileLongTime,
    ajaxJsonMoreLongTime,
    ajaxParamsSerializer,
    ajaxMailParamsSerializer,
    ajaxNewMailBoxJson,
    AutomaticSiteUrl,
    AutomaticSiteDomainUrl,
    AutomaticSiteUrlV2,
    ajaxDownloadFile,
    ajaxMailSaveDraftJson,
    ajaxAMP,
    ajaxAMPJson,
    ajaxEmailMarketing,
    ajaxEmailMarketingJson,
    ajaxEmailMarketingJsonLongTime,
    ajaxEdmMailParamsSerializer,
    ajaxWA,
    ajaxWAJsonLongTime,
    ajaxWAJson,
    ajaxWAFormData,
    ajaxWAFormDataLongTime,
    ajaxWAPersonalEdition,
    ajaxLeadscloud,
    ajaxLeadscloudJson,
    insDomain, // 七牛资源域名
    inOf(arr, targetArr) {
        let res = true;
        arr.forEach(item => {
            if (targetArr.indexOf(item) < 0) {
                res = false;
            }
        });
        return res;
    },
    oneOf(ele, targetArr) {
        if (targetArr.indexOf(ele) >= 0) {
            return true;
        } else {
            return false;
        }
    },
    showThisRoute(itAccess, currentAccess) {
        if (typeof itAccess === 'object' && Array.isArray(itAccess)) {
            return this.oneOf(currentAccess, itAccess);
        } else {
            return itAccess === currentAccess;
        }
    },
    getRouterObjByName(routers, name) {
        if (!name || !routers || !routers.length) {
            return null;
        }
        let routerObj = null;
        for (const item of routers) {
            if (item.name === name) {
                return item;
            }
            routerObj = this.getRouterObjByName(item.children, name);
            if (routerObj) {
                return routerObj;
            }
        }
        return null;
    },
    handleTitle(item) {
        if (typeof item.title === 'object') {
            return i18n.t(item.title.i18n);
        } else {
            return item.title;
        }
    },
    setCurrentPath(vm, name) {
        let title = '';
        let isOtherRouter = false;
        vm.$store.state.app.routers.forEach(item => {
            // if (item.children.length === 1) {
            if (item.children[0].name === name) {
                title = this.handleTitle(item);
                if (item.name === 'otherRouter') {
                    isOtherRouter = true;
                }
            }
            // }
            else {
                item.children.forEach(child => {
                    // if (child.children == undefined || child.children.length === 1) {
                    if (child.children == undefined) {
                        if (child.name === name) {
                            title = this.handleTitle(child);
                            if (item.name === 'otherRouter') {
                                isOtherRouter = true;
                            }
                        }
                    } else if (child.name === name) {
                        title = this.handleTitle(child);
                        if (item.name === 'otherRouter') {
                            isOtherRouter = true;
                        }
                    } else {
                        /* 增加三级路由的遍历 */
                        child.children.forEach(three => {
                            if (three.name === name) {
                                title = this.handleTitle(child);
                                if (item.name === 'otherRouter') {
                                    isOtherRouter = true;
                                }
                            }
                        });
                    }
                });
            }
        });
        let currentPathArr = [];
        if (name === 'home_index') {
            currentPathArr = [
                {
                    title: this.handleTitle(this.getRouterObjByName(vm.$store.state.app.routers, 'home_index')),
                    path: '',
                    name: 'home_index'
                }
            ];
        } else if (name === 'companyDetail') {
            currentPathArr = [
                {
                    title: {
                        i18n: 'menu.crm'
                    },
                    path: ''
                },
                {
                    title: {
                        i18n: 'menu.myCustomer'
                    },
                    path: 'undefined/undefined',
                    name: 'myCustomer'
                },
                {
                    title: {
                        i18n: 'menu.companyDetail'
                    },
                    path: 'undefined/undefined',
                    name: 'companyDetail'
                }
            ];
        } else if (name === 'highSeasCompanyDetail') {
            currentPathArr = [
                {
                    title: {
                        i18n: 'menu.crm'
                    },
                    path: ''
                },
                {
                    title: {
                        i18n: 'menu.highseasCustomer'
                    },
                    path: 'undefined/undefined',
                    name: 'highseasCustomer'
                },
                {
                    title: {
                        i18n: 'menu.companyDetail'
                    },
                    path: 'undefined/undefined',
                    name: 'companyDetail'
                }
            ];
        } else if ((name.indexOf('_index') >= 0 || isOtherRouter) && name !== 'home_index') {
            currentPathArr = [
                // {
                //     title: this.handleTitle(this.getRouterObjByName(vm.$store.state.app.routers, 'home_index')),
                //     path: '/home',
                //     name: 'home_index'
                // },
                {
                    title: title,
                    path: '',
                    name: name
                }
            ];
        } else {
            let currentPathObj = {};
            let childObj = {};
            let pathArr = [];
            //console.log('路由', vm.$store.state.app.routers, name);
            vm.$store.state.app.routers.forEach(item => {
                // if (item.children.length <= 1) {
                /* 上面的写法二、三级路由只有一个子元素会出错 */
                // if (item.children.length < 1) {
                if (item.children[0].name == name) {
                    currentPathObj = item;
                    pathArr.push(item);
                }
                // }
                else {
                    item.children.forEach(child => {
                        // if (child.children == undefined || child.children.length <= 1) {
                        /* 上面的写法三级路由只有一个子元素会出错 */
                        if (child.children == undefined) {
                            if (child.name == name) {
                                currentPathObj = item;
                                childObj = child;
                                pathArr = [item, child];
                            }
                        } else if (child.name == name) { /* 有子路由但是本身是当前路由，不必遍历下级路由 */
                            currentPathObj = item;
                            childObj = child;
                            pathArr = [item, child];
                        } else {
                            child.children.forEach(three => {
                                if (three.name == name) {
                                    currentPathObj = item;
                                    childObj = three;
                                    pathArr = [item, child, three];
                                }
                            });
                        }
                    });
                }
            });
            if (currentPathObj.children && currentPathObj.children.length <= 1 && currentPathObj.name === 'home') {
                currentPathArr = [
                    {
                        title: this.handleTitle(this.getRouterObjByName(vm.$store.state.app.routers, 'home_index')),
                        path: '',
                        name: 'home_index'
                    }
                ];
            } else if (currentPathObj.children && currentPathObj.children.length <= 1 && currentPathObj.name !== 'home') {
                currentPathArr = [
                    // {
                    //     title: this.handleTitle(this.getRouterObjByName(vm.$store.state.app.routers, 'home_index')),
                    //     path: '/home',
                    //     name: 'home_index'
                    // },
                    {
                        title: currentPathObj.title,
                        path: '',
                        name: name
                    }
                ];
            } else {
                if (Object.keys(currentPathObj).length > 0) {
                    const childObj = currentPathObj.children.filter((child) => {
                        return child.name === name;
                    })[0];
                    if (childObj) {
                        currentPathArr = [
                            // {
                            //     title: this.handleTitle(this.getRouterObjByName(vm.$store.state.app.routers, 'home_index')), path: '/home', name: 'home_index'
                            // },
                            {
                                title: currentPathObj.title, path: '', name: currentPathObj.name
                            },
                            {
                                title: childObj.title, path: `${currentPathObj.path}/${childObj.path}`, name: name
                            }
                        ];
                    } else if (currentPathObj.children[0].name === 'google_ad_words') {
                        const childObj = currentPathObj.children[0].children.filter((child) => {
                            return child.name === name;
                        })[0];
                        if (childObj) {
                            currentPathArr = [
                                // {
                                //     title: this.handleTitle(this.getRouterObjByName(vm.$store.state.app.routers, 'home_index')), path: '/home', name: 'home_index'
                                // },
                                {
                                    title: currentPathObj.title, path: '', name: currentPathObj.name
                                },
                                {
                                    title: 'Google AdWords', path: '', name: 'google_ad_words'
                                },
                                {
                                    title: childObj.title, path: `${currentPathObj.path}/${childObj.path}`, name: name
                                }
                            ];
                        }
                    } else {
                        for (const item of pathArr) {
                            currentPathArr.push({
                                title: item.title,
                                name: item.name
                            });
                        }
                    }
                }
            }
        }
        vm.$store.commit('setCurrentPath', currentPathArr);
        return currentPathArr;
    },
    openNewPage(vm, name, argu, query) {
        const pageOpenedList = vm.$store.state.app.pageOpenedList;
        const openedPageLen = pageOpenedList.length;
        let i = 0;
        let tagHasOpened = false;
        while (i < openedPageLen) {
            if (name === pageOpenedList[i].name) {
                // 页面已经打开
                vm.$store.commit('pageOpenedList', {
                    index: i,
                    argu: argu,
                    query: query
                });
                tagHasOpened = true;
                break;
            }
            i++;
        }
        if (!tagHasOpened) {
            const order = [];
            (function hasName(name, arr) {
                return arr.some((item, key) => {
                    if (item.name === 'google_ad_words' && name === 'google_ad_words') {
                        order.push(key);
                        return true;
                    }

                    if (item.children) {
                        if (hasName(name, item.children)) {
                            order.push(key);
                            return true;
                        }
                    } else {
                        if (item.name === name) {
                            order.push(key);
                            return true;
                        }
                    }
                });
            })(name, vm.$store.state.app.tagsList);
            if (order.length) {
                const tag = vm.$store.state.app.tagsList[order.pop()];
                let existedKey = -1;
                const boo = vm.$store.state.app.pageOpenedList.some((item, key) => {
                    if (item.name === tag.name) {
                        existedKey = key;
                        return true;
                    }
                });
                if (boo) {
                    vm.$store.commit('pageOpenedList', {
                        index: existedKey,
                        argu: argu,
                        query: query
                    });
                } else {
                    if (argu) {
                        tag.argu = argu;
                    }
                    if (query) {
                        tag.query = query;
                    }
                    vm.$store.commit('increateTag', tag);
                }
            }
        }
        if (sessionStorage.homePageSetStatus == 1) {
            vm.$store.commit('orderTags', Cookies.get('HOMEPAGE'));
            sessionStorage.homePageSetStatus = 0;
        }
        vm.$store.commit('setCurrentPageName', name);
    },
    toDefaultPage(routers, name, route, next) {
        const len = routers.length;
        let i = 0;
        let notHandle = true;
        while (i < len) {
            if (routers[i].name === name && routers[i].children && routers[i].redirect === undefined) {
                console.log(`name=${routers[i].children[0].name}`);
                route.replace({
                    name: routers[i].children[0].name
                });
                notHandle = false;
                next();
                break;
            }
            i++;
        }
        if (notHandle) {
            next();
        }
    },
    fullscreenEvent(vm) {
        vm.$store.commit('initCachepage');
        // 全屏相关
    },
    filterRouter(name) {
        let interceptList = localStorage.getItem('interceptList');
        if (interceptList) {
            interceptList = JSON.parse(interceptList);
            console.log(interceptList);
            interceptList.forEach((item, index) => {
                if (item.children.length === 1) {
                    item.children.filter(child => {
                        // let href=child.href
                        // if(href.indexOf("_")>-1){
                        //     href=href.split("_").join("-")
                        // }
                        // if(name == href){
                        //     return true
                        // }
                    });
                } else {
                    // let href=item.href
                    // if(href.indexOf("_")>-1){
                    //     href=href.split("_").join("-")
                    // }
                    // if(name == href){
                    //     return true
                    // }
                }
            });
        }
    },
    dateFormt(date, formt) {
        const o = {
            'M+': date.getMonth() + 1, // 月份
            'd+': date.getDate(), // 日
            'h+': date.getHours(), // 小时
            'm+': date.getMinutes(), // 分
            's+': date.getSeconds(), // 秒
            'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
            S: date.getMilliseconds() // 毫秒
        };
        if (/(y+)/.test(formt)) {
            formt = formt.replace(
                RegExp.$1,
                (String(date.getFullYear())).substr(4 - RegExp.$1.length)
            );
        }
        for (const k in o) {
            if (new RegExp(`(${k})`).test(formt)) {
                formt = formt.replace(
                    RegExp.$1,
                    RegExp.$1.length == 1
                        ? o[k]
                        : (`00${o[k]}`).substr((`${o[k]}`).length)
                );
            }
        }
        return formt;
    },
    mergeUrl(type, str) {
        console.log('-------');
        console.log(URLs);
        console.log(env);
        console.log(mailUrl);

        if (type === 'mailUrl') {
            return mailUrl + str;
        } else {
            return type + str;
        }
    },
    exportExcel(name, stream) {
        const a = document.createElement('a');
        const blob = new Blob([stream],{type:"application/octet-stream"});
        const blobUrl = window.URL.createObjectURL(blob);
        a.style.display = 'none';
        a.download = name + '.xlsx'; //文件名
        a.href = blobUrl;
        a.click();
    },
    jump_to_login
};

export default util;
