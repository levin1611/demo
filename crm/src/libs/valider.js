import Utils from '@/utils/index.js';
import { t, changeLang } from '@/locale';

export const validePhone = (rule, value, callback) => {
    // 判断输入框是否为空或者输入框长度是否为11
    if (!value || value.length !== 11) {
        // 如果为空或者长度不为11，则报错，提示错误信息
        callback(new Error(t('per_setting.err_phoneFormat')));
    } else {
        // 获取正则表达式
        const telReg = Utils.regExp.tell;
        // 判断输入框是否符合正则表达式
        if (!telReg.test(value)) {
            // 如果不符合，则报错，提示错误信息
            callback(new Error(t('per_setting.err_phoneFormat')));
        } else {
            // 如果符合，则通过验证
            callback();
        }
    }
};

// 邮箱校验
export const valideVerificationeEmail = async (rule, value, callback) => {
    // 获取正则表达式
    const telReg = Utils.regExp.fullEmail;
    // 判断输入框是否符合正则表达式
    if (!telReg.test(value)) {
        // 如果不符合，则报错，提示错误信息
        callback(new Error('邮箱错误'));
    } else {
        // 如果符合，则通过验证
        callback();
    }
};

export const validePassword = (rule, value, callback) => {
    const passwordReg = Utils.regExp.password;
    if (value.length === 0) {
        callback(new Error('密码不能为空'));
    } else if (value.length < 8 || value.length > 20) {
        callback(new Error('密码须由8-20字符组成，请重新输入'));
    } else if (!passwordReg.test(value)) {
        callback(new Error('密码须由字母、数字和特殊符号中的至少2类字符组成'));
    } else {
        callback();
    }
};
// 密码存储md5
export const compareName = (origin, password) => {
    const store = userpass.getInfo();
    console.log(origin, store.account, password, store.password);
    return origin === store.account && store.password === password;
};