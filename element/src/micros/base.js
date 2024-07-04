import { router } from '@/router/index';
import util from '@/libs/util';
import { triggerGtag } from '@/utils/base';
import resetMessage from '@/libs/resetMessage';
import staticDatas from '@/utils/staticDatas'; // 公共基除业务代码注册在原型上 静态数据
import dynamicDatas from '@/utils/dynamicDatas'; // 处理动态数据公共方法欢迎 添加 注意解耦
import * as storageUtils from '@/utils/storage';
import echarts from '@/sdk/echarts';
import VueClipboard from 'vue-clipboard2';
import smartmaterialIcons from '@/configs/smartmaterialIcons.js'; // 引入智能物料icon图标(base64)
import mailContent from '@/mixins/mailContent';
import mailTranslate from '@/mixins/mailDetailTranslate'; // 引入翻译功能相关共通代码
import autoTranslateMixin from '@/mixins/autoTranslate'; // 自动翻译公共代码
import resetInitComponents from '@/mixins/resetComponentViewData';
import translateLang from '@/mixins/translateLang';
import writeMailTranslate from '@/mixins/writeMailTranslate'; // 引入翻译功能相关共通代码
import globalWaReplyModal from '@/mixins/globalWaReplyModal';
import getTimezoneByArea from '@/mixins/getTimezoneByArea';
import { Request } from '@/api/baseUtilAjax';
import * as apiConfig from '@/api/config';
// 导出 api 开始
import * as crmApi from '@/api/crm/index';
import commonApi from '@/api/newCommon';
import * as reusableApi from '@/api/reusableApi';
import * as WAcommonApi from '@/api/whatsapp.js';
import * as MailSetApi from '@/api/mail/mailSet.js';
// 导出 api 结束

import i18nMessages from '@/locale/i18nMessages';

// ai toolbar
import aiToolBar from '../views/ai-toolbar/toolbar'

const api = {
    crmApi,
    commonApi,
    reusableApi,
    apiConfig,
    WAcommonApi,
    MailSetApi
};

// $deepClone 为简单的深拷贝, 参数代表是否拷贝原型链上的数据
// 另有复杂的深拷贝 见 https://yanhaijing.com/javascript/2018/10/10/clone-deep/
// 另有极简深拷贝 JSON.parse(JSON.stringify(obj))
// 下面还有后来发现但没使用的 iview assist.js 的深拷贝方法
/** @建议使用lodash注册的cloneDeep方法使用见上述 */
const deepClone = function(obj, inherit = true) {
    // 先检测是不是数组和Object
    // let isArr = Object.prototype.toString.call(obj) === '[object Array]';
    const isArr = Array.isArray(obj);
    const isJson = Object.prototype.toString.call(obj) === '[object Object]';
    if (isArr) {
        // 克隆数组
        const newObj = [];
        for (let i = 0; i < obj.length; i++) {
            newObj[i] = this.$deepClone(obj[i]);
        }
        return newObj;
    } else if (isJson) {
        // 克隆Object
        const newObj = {};
        if (inherit) {
            for (const i in obj) {
                newObj[i] = this.$deepClone(obj[i]);
            }
        } else {
            Object.keys(obj).forEach(key => {
                newObj[key] = this.$deepClone(obj[key]);
            });
        }
        return newObj;
    }
    // 不是引用类型直接返回
    return obj;
};

// 函数节流
const throttle = function(func, wait = 250, mustRun = 250) {
    let timeout;
    let startTime = new Date();
    return function() {
        const context = this;
        const args = arguments;
        const curTime = new Date();

        clearTimeout(timeout);
        // 如果达到了规定的触发时间间隔，触发 handler
        if (curTime - startTime >= mustRun) {
            func.apply(context, args);
            startTime = curTime;
            // 没达到触发间隔，重新设定定时器
        } else {
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        }
    };
};

// 函数防抖
const debounce = function(func, wait = 250, executeBefore = false) {
    let timeout;
    let executed = false;

    return function() {
        const context = this;
        const args = arguments;

        // 判断是否要求先触发 func
        if (executeBefore && !executed) {
            func.apply(context, args);
            executed = true;
        }

        clearTimeout(timeout);
        timeout = setTimeout(() => {
            if (!executeBefore) {
                func.apply(context, args);
            }
            executed = false;
        }, wait);
    };
};

// 跳转到询盘详情页
const viewInquiry = function() {
    window.open(router.resolve({
        name: 'myInquiry'
    }).href, '_blank');
};

// 跳转到客户详情页
const viewCustomer = function(id, target) {
    window.open(router.resolve({
        name: 'companyDetail',
        query: {
            companyId: id
        }
    }).href, target || '_blank');
};

// 跳转到公海客户详情页
const viewHighSeasCustomer = function(id, target) {
    window.open(router.resolve({
        name: 'companyDetail',
        query: {
            companyId: id
        }
    }).href, target || '_blank');
};


export default {
    util,
    triggerGtag,
    getTimezoneByArea,
    resetMessage,
    staticDatas,
    dynamicDatas,
    storageUtils,
    echarts,
    VueClipboard,
    deepClone,
    throttle,
    debounce,
    viewInquiry,
    viewCustomer,
    viewHighSeasCustomer,
    smartmaterialIcons,
    mailContent,
    mailTranslate,
    autoTranslateMixin,
    resetInitComponents,
    translateLang,
    writeMailTranslate,
    globalWaReplyModal,
    Request,
    ...api,
    i18nMessages,

    aiToolBar
};
