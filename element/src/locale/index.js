import Vue from 'vue';
import Cookies from 'js-cookie';
import VueI18n from 'vue-i18n';
import i18nMessages from './i18nMessages';

Vue.use(VueI18n);

// 自动设置语言
const navLang = navigator.language;
const localLang = (navLang === 'zh-CN' || navLang === 'en-US') ? navLang : false;
const lang = localStorage.getItem('LANG') || Cookies.get('LANG') || localLang || 'zh-CN';
Vue.config.lang = lang;

// Create VueI18n instance with options
const i18n = new VueI18n({
    locale: lang, // set locale
    messages: i18nMessages // set locale messages
});
export default i18n;
