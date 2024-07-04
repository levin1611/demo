import { ref } from 'vue';
import { sendVerificationCodeByMobile, sendVerificationCodeByEmail, verificationCode } from '@/api/common';
import Utils from '@/utils/index.js';
import { useLocalStore } from '@/pinia/modules/local';


export const useSendVerificationCode = (phoneLoginForm, callback) => {
    const phoneLoginErrMsg = ref('');
    const getCaptchaLoading = ref(false); // 按钮加载状态
    const able_getCaptcha = ref(true); // 是否可以获取验证码
    const captchaBtnText = ref('发送验证码'); // 验证码按钮文字

    const countDown = ref(0); // 倒计时
    const countDownTimer = ref(null); // 倒计时定时器

    const mainStore = useLocalStore();

    const _sendMobileCode = (val) => {
        sendVerificationCodeByMobile({
            mobile: val
        }).then(res => {
            getCaptchaLoading.value = false;
            if (res.code === 10000) {
                // 获取验证码成功
                // 显示倒计时
                countDown.value = 60;
                countDown.value--;
                captchaBtnText.value = `重新发送(${countDown.value})`;
                // 开启定时器
                countDownTimer.value = setInterval(() => {
                    // 倒计时
                    countDown.value--;
                    captchaBtnText.value = `重新发送(${countDown.value})`;
                    // 倒计时结束
                    if (countDown.value <= 0) {
                        // 清除定时器
                        clearInterval(countDownTimer.value);
                        // 关闭倒计时
                        countDown.value = 0;
                        able_getCaptcha.value = true;
                        captchaBtnText.value = '发送验证码';
                    }
                }, 1000);
            } else {
                callback(res);
            }
        });
    };
    const _sendEmailCode = (val) => {
        console.log(val);
        sendVerificationCodeByEmail({
            mailAddress: val
        }).then(res => {
            getCaptchaLoading.value = false;
            if (res.code === 10000) {
                // 获取验证码成功
                // 显示倒计时
                countDown.value = 60;
                // 开启定时器
                countDownTimer.value = setInterval(() => {
                    // 倒计时
                    countDown.value--;
                    captchaBtnText.value = `重新发送(${countDown.value})`;
                    // 倒计时结束
                    if (countDown.value <= 0) {
                        // 清除定时器
                        clearInterval(countDownTimer.value);
                        // 关闭倒计时
                        countDown.value = 0;
                        able_getCaptcha.value = true;
                        captchaBtnText.value = '发送验证码';
                    }
                }, 1000);
            } else {
                callback(res);
            }
        });
    };

    const sendVerificationCode = (type) => {
        console.log(type);
        let phone = '';
        // 数据存在校验
        if (type === 'phone') {
            if (!phoneLoginForm.phone || phoneLoginForm.phone.length !== 11) {
                phoneLoginErrMsg.value = '请输入正确的手机号';
                return;
            }
            const telReg = Utils.regExp.tell;
            if (!telReg.test(phoneLoginForm.phone)) {
                phoneLoginErrMsg.value = '请输入正确的手机号';
                return;
            }
            able_getCaptcha.value = false;
            getCaptchaLoading.value = true;
            _sendMobileCode(phoneLoginForm.phone);
        }
        if (type === 'email') {
            if (!phoneLoginForm.email) {
                phoneLoginErrMsg.value = '请输入正确的邮箱';
                return;
            }
            const telReg = Utils.regExp.fullEmail;
            if (!telReg.test(phoneLoginForm.email)) {
                phoneLoginErrMsg.value = '请输入正确的邮箱';
                return;
            }
            able_getCaptcha.value = false;
            getCaptchaLoading.value = true;
            _sendEmailCode(phoneLoginForm.email);
        }
        
    };

    // 通行证验证
    const passVerificationCode = (accountName, password, type, pwdType) => {
        return new Promise((resolve, reject) => {
            verificationCode({
                accountName: accountName,
                accountType: getAccountType(type),
                password: password,
                passwordType: passwordType(pwdType)
            }).then(res => {
                if (res.code === 10000) {
                    console.log('验证通过');
                    resolve(res.data);
                } else {
                    reject(res);
                }
            }).catch(res => {
                reject(res);
            });
        });
        
    };
    // 验证的时候返回对应的类型值。登录类型：1-手机号登录，2-邮箱登录，3-登录名
    const getAccountType = (type) => {
        let typeNum = 0;
        switch (type) {
            case 'phone':
                typeNum = 1;
                break;
            case 'email':
                typeNum = 2;
                break;
            case 'account':
                // 用户名登录
                typeNum = 3;
                break;
        }    
        return typeNum;
    };
    // 验证的时候返回对应的类型值。密码类型：1-密码，2-手机验证码，3-邮箱验证码
    const passwordType = (type) => {
        let typeNum = 0;
        switch (type) {
            case 'password':
                typeNum = 1;
                break;
            case 'phoneCode':
                typeNum = 2;
                break;
            case 'emailCode':
                // 用户名登录
                typeNum = 3;
                break;
        }   
        return typeNum; 
    };

    const clear = () => {
        clearInterval(countDownTimer.value);
        countDown.value = 0;
        able_getCaptcha.value = true;
        captchaBtnText.value = '发送验证码';
    };
    return {
        sendVerificationCode,
        getCaptchaLoading,
        phoneLoginErrMsg,
        able_getCaptcha,
        captchaBtnText,
        passVerificationCode,
        clear
    };
};