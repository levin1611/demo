import Cookies from 'js-cookie';
import { createI18n } from 'vue-i18n';
import { reactive } from 'vue';
import EN from './en';
import ZH from './zh';
import enLocale from 'element-plus/dist/locale/en.mjs';
import zhLocale from 'element-plus/dist/locale/zh-cn.mjs';

const mergeZH = Object.assign(zhLocale, ZH);
const mergeEN = Object.assign(enLocale, EN);

const messages = {
    zh: { ...mergeZH },
    en: { ...mergeEN }
};
// Vue.use(VueI18n);

// 自动设置语言
const navLang = navigator.language;
const localLang = (navLang === 'zh' || navLang === 'en') ? navLang : false;
const lang = localStorage.getItem('LANG') || Cookies.get('LANG') || localLang || 'zh';
// Vue.config.lang = lang;

// Create VueI18n instance with options
const i18n = new createI18n({
    locale: lang, // set locale
    legacy: false,
    messages
});

console.log(i18n.global.locale);
const state = reactive({
    curLanguage: 'zh-CN'
});
// 更改语言
export const changeLang = () => {
    state.curLanguage = state.curLanguage === 'zh-CN' ? 'en-CN' : 'zh-CN';
    i18n.global.locale.value = state.curLanguage;
    return state.curLanguage;
};
// 组合式api中调用， 此方法挂载到全局了
export const t = (key, args) => {
    if (!i18n) return key;
    return i18n.global.t(key, args);
};

export default i18n;