
import EN from './en';
import ZH from './zh';
import enLocale from 'element-ui/lib/locale/lang/en';
import zhLocale from 'element-ui/lib/locale/lang/zh-CN';

// 多语言配置
const mergeZH = Object.assign(zhLocale, ZH);
const mergeEN = Object.assign(enLocale, EN);
// Vue.locale('zh-CN', mergeZH);
// Vue.locale('en-US', mergeEN);
const i18nMessages = {
    'zh-CN': mergeZH,
    'en-US': mergeEN
};

export default i18nMessages;
