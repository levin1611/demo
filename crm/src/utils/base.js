/**
 * 向vue原型链上挂载公共方法
 */
import commonApi from '@/api/common';
import { t } from '@/locale';

export default {
    install(app) {
        app.config.globalProperties.$commonApi = commonApi;
        app.config.globalProperties.$_t = t;
        app.config.globalProperties.$deepClone = () => {
            console.log('公共方法');
        };
    }
};