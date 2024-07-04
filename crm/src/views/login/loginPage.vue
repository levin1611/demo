<template>
    <div class="login">
        <div class="login-container">
            <div class="login-top">
                <login-header></login-header>
            </div>
            <!-- 登录注册表单 -->
            <div class="login-body">
                <!-- 左侧轮播图 -->
                <div class="carousel-box">
                    <div class="swiper-container" @mouseenter="enterSwiper" @mouseleave="leaveSwiper">
                        <div class="swiper-wrapper">
                            <div class="swiper-slide" v-for="(item,index) in swiper_img" :key="index">
                                <img :src="item.img" alt="" draggable="false">
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 右侧登陆 -->
                <div class="login-box" v-if="!isLoginSuccess">
                    <div class="form-con">
                        <div class="login-title">
                            <!-- 扫码登陆还未有,待后续开发 -->
                            <div class="unQRtitle" :class="{'active' : loginType === 'mobile' || loginType === 'mobileCode'}" @click="seletLogin('mobile')">{{$t('login.mobileLogin')}}</div>
                            <div class="unQRtitle" :class="{'active' : loginType === 'email' || loginType === 'emailCode'}" @click="seletLogin('email')">{{$t('login.emailLogin')}}</div>
                        </div>
                    </div>
                    <!-- 账号密码输入表单 -->
                    <div v-show="loginType === 'mobile' || loginType === 'email'">
                        <div style="width:100%" class="login-form">
                            <!-- 登陆输入框等 -->
                            <div class="login-input">
                                <el-form label-position="left"
                                         ref="ruleFormByAccountRef"
                                         :model="formData"
                                         :rules="phoneLoginFormRules">
                                    <el-form-item prop="phone" v-show="loginType === 'mobile'">
                                        <el-input  v-model="formData.phone"
                                                   class="phone-input"
                                                   :maxlength="11"
                                                   @blur="clearPhoneLoginErrMsg"
                                                   onfocus="this.removeAttribute('readonly');"
                                                   readonly="true"
                                                   autocomplete="off"
                                                   type="text"
                                                   :placeholder="$t('login.phonePlaceholder')"></el-input>
                                    </el-form-item>
                                    <el-form-item prop="email" v-show="loginType === 'email'">
                                        <el-input  v-model="formData.email"
                                                   class="phone-input"
                                                   :maxlength="50"
                                                   onfocus="this.removeAttribute('readonly');"
                                                   readonly="true"
                                                   autocomplete="off"
                                                   @blur="clearPhoneLoginErrMsg"
                                                   type="text"
                                                   :placeholder="$t('login.emailPlaceholder')"></el-input>
                                    </el-form-item>
                                    <el-form-item prop="password"  v-show="loginType === 'mobile'">
                                        <el-input  v-model="formData.password"
                                                   class="phone-input"
                                                   onfocus="this.removeAttribute('readonly');"
                                                   readonly="false"
                                                   type="password"
                                                   autocomplete="off"
                                                   style="margin-bottom: 2px"
                                                   :placeholder="$t('login.pwdPlaceholder')"></el-input>
                                    </el-form-item>
                                    <el-form-item prop="emailPassword"  v-show="loginType === 'email'">
                                        <el-input  v-model="formData.emailPassword"
                                                   class="phone-input"
                                                   onfocus="this.removeAttribute('readonly');"
                                                   readonly="false"
                                                   type="password"
                                                   autocomplete="off"
                                                   style="margin-bottom: 2px"
                                                   :placeholder="$t('login.pwdPlaceholder')"></el-input>
                                    </el-form-item>
                                </el-form>
                            </div>
                        </div>
                        <!-- 记住密码, 忘记密码 -->
                        <div class="forgetPwd">
                            <!--记住我-->
                            <el-checkbox v-model="remembered"><span class="rememberText">{{$t('login.remember')}}</span></el-checkbox>
                            
                            <!-- 验证码登录 -->
                            <span @click="seletLogin(loginType === 'mobile' ? 'mobileCode' : 'emailCode')"
                                  class="login__forget-pass float-right login__forget-pass-newCls">{{$t('login.codeLogin')}}</span>
                        </div>
                        <!-- 账号或密码错误提示 -->
                        <div class="login-tip">{{ errMsg }}</div>
                    </div>
                    <div v-show="loginType === 'mobileCode' || loginType === 'emailCode'">
                        <div class="phoneLoginBox">
                            <el-form label-position="left"
                                     :model="formData"
                                     ref="ruleFormByCodeRef"
                                     :rules="phoneLoginFormRules">
                                <template v-if="loginType === 'mobileCode'">
                                    <el-form-item prop="phone">
                                        <el-input v-model="formData.phone"
                                                  @blur="clearPhoneLoginErrMsg"
                                                  @input="codeInput('phone')"
                                                  @change="codeInput('phone')"
                                                  :maxlength="11"
                                                  class="phone-input"
                                                  type="text"
                                                  :placeholder="t('login.phonePlaceholder')">
                                            <template #prepend><span style="color:#303133">+ 86</span></template>
                                        </el-input>
                                    </el-form-item>
                                    <el-form-item prop="code">
                                        <el-input v-model="formData.code"
                                                  @blur="clearPhoneLoginErrMsg"
                                                  @input="codeInput('code')"
                                                  @change="codeInput('code')"
                                                  class="phone-input"
                                                  :maxlength="6"
                                                  style="margin-bottom: 2px"
                                                  :placeholder="t('login.codePlaceholder')">
                                            <template #append>
                                                <el-button :loading="getCaptchaLoading"
                                                           :disabled="!able_getCaptcha"
                                                           @click="sendVerificationCode('phone')"
                                                           style="color: #3B78DE; background-color: transparent; font-weight: normal;font-size: 12px">{{captchaBtnText}}</el-button>
                                            </template>
                                        </el-input>
                                    </el-form-item>
                                </template>
                                <template v-if="loginType === 'emailCode'">
                                    <el-form-item prop="email">
                                        <el-input v-model="formData.email"
                                                  class="phone-input"
                                                  type="text"
                                                  :maxlength="50"
                                                  :placeholder="t('login.emailPlaceholder')">
                                        </el-input>
                                    </el-form-item>
                                    <el-form-item prop="emailCode">
                                        <el-input v-model="formData.emailCode"
                                                  class="phone-input"
                                                  style="margin-bottom: 2px"
                                                  :placeholder="t('login.emailCodePlaceholder')">
                                            <template #append>
                                                <el-button :loading="getCaptchaLoading"
                                                           :disabled="!able_getCaptcha"
                                                           @click="sendVerificationCode('email')"
                                                           style="color: #3B78DE; background-color: transparent; font-weight: normal;font-size: 12px">{{captchaBtnText}}</el-button>
                                            </template>
                                        </el-input>
                                    </el-form-item>
                                </template>
                                
                            </el-form>
                        </div>
                        <div style="margin-bottom: 14px;display: flex;justify-content: flex-end;">
                            <!-- 验证码登录 -->
                            <el-link @click="seletLogin(loginType === 'mobileCode' ? 'mobile' : 'email')" style="font-size:12px;color: #3b78de">{{$t('login.pwdLogin')}}</el-link>
                        </div>
                        <div class="login-tip">{{ errMsg }}</div>
                    </div>
                    <el-button class="login-button" type="primary" @click="handleSubmit()">{{$t('login.loginBtn')}}</el-button>
                    <!-- 同意《用户协议》、《隐私条款》，并接受询盘云的服务 -->
                    <div style="margin-top: 14px;display: flex;align-items: center;">
                        <el-checkbox style="width: 20px;height: 18px" v-model="isAgreed">{{ "" }}</el-checkbox>
                        <span class="userAgreement-privacyPolicy" style="margin-top:2px">{{
                            $t('login.agree')
                        }}<a :href="`${publicPath}leadscloudUserAgreement.html`" target="_blank">{{ t('login.userAgreement') }}</a>{{
                            t('login.loginStatus')
                        }}<a :href="`${publicPath}leadscloudPrivacyPolicy.html`" target="_blank">{{ $t('login.privacyPolicy') }}</a>{{ $t('login.acceptTheService') }}
                        </span>
                    </div>
                </div>
                <div class="login-box" v-else>
                    <gate-pass-list :account-detail-data="accountDetailData"></gate-pass-list>
                </div>
            </div>
            <div class="login-bottom">
                <login-footer></login-footer>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted, nextTick, computed } from 'vue';
import Swiper from 'swiper';
import '../../../node_modules/swiper/css/swiper.min.css';
import { t, changeLang } from '@/locale';
import { useLocalStore } from '@/pinia/modules/local';
import { loginSuccess } from '@/utils/common';
import { useSendVerificationCode } from '@/hooks/sendVerificationCode';
import { useI18n } from 'vue-i18n';
import Cookies from 'js-cookie';
import { useRouter } from 'vue-router';
const router = useRouter();
import { passVerification } from '@/api/login';
import accountDetail from './component/accountDetail.vue';
import loginHeader from './component/login-header.vue';
import loginFooter from './component/login-footer.vue';
import gatePassList from './component/gatePassList.vue';

import { userpass, signRsa } from '@/utils/safe';
import { Rnum } from '@/utils/dynamicDatas';
import { validePhone, valideVerificationeEmail, validePassword } from '@/libs/valider'

console.log('-------------', process);
// 引入 publicPath
const publicPath = 'https://qa-crm.leadscloud.com/Front-Vue/';
// 登录表单
const ruleFormByCodeRef = ref(null);
const ruleFormByAccountRef = ref(null);
// 轮播图
const swiper_img = [
    {
        img: require('@/assets/images/swiper3.png'),
        href: 'javascript:;'
    }
];
const swiperLogin = new Swiper('.swiper-container', {
    // 分页器
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    // 自动轮播
    autoplay: true,
    // 播放速度
    speed: 1000,
    // 允许触摸滑动
    allowTouchMove: false,
    // 连续播放 在第三张播放到第一张时,点击第二个分页器,会向左跳转,感觉像是有4张图片
    // loop: true,
    // 轮播图点击事件
    on: {
        click: function() {
            console.log('你点了Swiper');
        }
    }
});

const isLoginSuccess = ref(false);
const accountDetailData = ref({});
// 右侧登录功能 
const loginType = ref('mobile');
const seletLogin = (type) => {
    loginType.value = type;
    errMsg.value = '';
    clear(); // 清除验证码倒计时
};
// 电话号码登录,表单对象
const formData = reactive({
    phone: '',
    code: '',
    emailCode: '',
    email: '',
    password: '',
    emailPassword: ''
});
const achePs = ref('');
const remembered = ref(false);
const errMsg = ref(''); // 电话号码错误提示
const isAgreed = ref(false); // 是否同意协议
// 同意协议之后按钮禁用消失
const disabled = computed(() => {
    return !isAgreed.value;
});

onMounted(() => {
    // "记住我"相关信息处理
    if (localStorage.getItem('xhl_remember_me')) {
        remembered.value = true;
        const info = JSON.parse(localStorage.getItem('accountData')) || {};
        switch (info.accountType) {
            case 1:
                loginType.value = 'mobile';
                formData.phone = info.formData.phone;
                formData.password = info.formData.password;
                break;
            case 2:
                loginType.value = 'email';
                formData.email = info.formData.email;
                formData.emailPassword = info.formData.emailPassword;
                break;
            default:
                break;
        }
    } else {
        const login_type = localStorage.getItem('xhl_login_type');
        const info = JSON.parse(localStorage.getItem('accountData'));
        if (login_type === 'emailCode') {
            formData.email = info.formData.email;
            loginType.value = login_type;
        } else if (login_type === 'mobileCode') {
            formData.phone = info.formData.phone;
            loginType.value = login_type;
        } else if (login_type === 'email') {
            loginType.value = login_type;
        } else if (login_type === 'mobile') {
            loginType.value = login_type;
        } else {
            formData.phone = '';
            formData.email = '';
        }
        localStorage.removeItem('xhl_remember_me');
        // localStorage.removeItem('accountData');
       
        formData.password = '';
        formData.emailPassword = '';
    }
    if (localStorage.getItem('xhl_agreed')) {
        isAgreed.value = true;
    }
});

// 点击登录按钮------------------------START
const showDetail = ref(false);
const handleSubmit = () => {
    if (!isAgreed.value) {
        return ElMessage.warning(t('login.agreeTip'));
    }
    const formEl = ref(null);
    if ( loginType.value === 'mobile' || loginType.value === 'email') {
        // 获取账号登录的表单
        formEl.value = ruleFormByAccountRef.value;
        if (loginType.value === 'mobile') {
            // 验证手机号
            formEl.value.validateField('phone', (valid) => {
                if (valid) {
                    // 验证密码
                    formEl.value.validateField('password', (valid, value) => {
                        if (valid) {
                            // 验证通过，登录成功
                            // step.value = num;
                            submitForm(formEl, formData.phone, 1, formData.password, 1);
                        }
                    });
                }
            });
        }
        if (loginType.value === 'email') {
            // 邮箱 + 密码
            formEl.value.validateField('email', (valid) => {
                if (valid) {
                    // 验证密码
                    formEl.value.validateField('emailPassword', (valid) => {
                        if (valid) {
                            // 验证通过，登录成功
                            // step.value = num;
                            submitForm(formEl, formData.email, 2, formData.emailPassword, 1);
                        }
                    });
                }
            });
        }
    }
    if (loginType.value === 'emailCode' || loginType.value === 'mobileCode') {
        // 获取验证码登录表单
        formEl.value = ruleFormByCodeRef.value;
        if (loginType.value === 'mobileCode') {
            // 手机号 + 验证码
            formEl.value.validateField('phone', (valid) => {
                if (valid) {
                    // 验证验证码
                    formEl.value.validateField('code', (valid) => {
                        if (valid) {
                            // 验证通过，登录成功
                            console.log('登录成功');
                            submitForm(formEl, formData.phone, 1, formData.code, 2 );
                        }
                    });
                }
            });
        }
        if (loginType.value === 'emailCode') {
            // 邮件 + 验证码
            formEl.value.validateField('email', (valid) => {
                if (valid) {
                    // 验证验证码
                    formEl.value.validateField('emailCode', (valid) => {
                        if (valid) {
                            // 验证通过，登录成功
                            console.log('登录成功');
                            submitForm(formEl, formData.email, 2, formData.emailCode, 3 );
                        }
                    });
                }
            });
        }
        
    }
};
// 提交表单函数
/**
 * @param {*} formEl 表单元素
 * @param {*} accountName 登录名、电话、邮箱取值
 * @param {*} accountType 登录类型：1-手机号登录，2-邮箱登录，3-登录名
 * @param {*} password 密码或者验证码
 * @param {*} passwordType 密码类型：1-密码，2-手机验证码，3-邮箱验证码
*/
const submitForm = (formEl, accountName, accountType, password, passwordType ) => {
    if (disabled.value) return;
    passVerification({
        accountName,
        accountType,
        password,
        passwordType
    }).then(res => {
        if (res.code === 10000) {
            handleLoginSuccess(res.data, formData, accountType, passwordType);
            const _o = {
                formData,
                accountType,
                passwordType
            };
            localStorage.setItem('accountData', JSON.stringify(_o));
            // 如果记住我被选中，则将账号信息存储到本地
            if (remembered.value) {
                localStorage.setItem('xhl_remember_me', 'true');
            } else {
                // 否则，从本地移除账号信息
                localStorage.removeItem('xhl_remember_me');
            }

            localStorage.setItem('xhl_agreed', 'true');
            localStorage.setItem('xhl_login_type', loginType.value);
        } else {
            errMsg.value = res.message;
        }
    });
};

// 登录回调
const handleLoginSuccess = (userData, formData) => {
    // 如果是绑定了一个租户，点击登录直接跳转到系统内
    if (userData.userRelatedOrgDtoList.length > 1) {
        accountDetailData.value = userData;
        isLoginSuccess.value = true;
    } else if (userData.userRelatedOrgDtoList.length === 0) {
        errMsg.value = '租户列表不能为空';
    } else {
        Cookies.set('accountToken', userData.accountToken);
        loginSuccess(userData.userRelatedOrgDtoList[0], userData, () => {
            router.push({
                path: '/',
                query: {url: '/systemSettings/company'}
            });
        });
    }
 
    // 如果登陆的账号有超管权限,添加超管权限到localStorage
    // if (userData.superAdmin) {
    //     localStorage.setItem('isSuperAdmin', Boolean(userData.superAdmin));
    // }

    // // 更新 localStorage 中的设备 id 数据
    // const idData = localStorage.getItem('xhl_dId') ? JSON.parse(localStorage.getItem('xhl_dId')) : {};
    // if (formData.deviceInfo) {
    //     idData[formData.userName] = formData.deviceInfo;
    // } else {
    //     delete idData[formData.userName];
    // }

    // localStorage.setItem('xhl_dId', JSON.stringify(idData));

    // // this.$store.state.app.pageOpenedList = [];

    // // 删除旧有所有 domain 的 cookie (admin.leadscloud.com, .leadscloud.com 有时会同时存在, 删除时只删除了一个后会出现问题)
    // const tmpDomainArr = document.domain.split('.');
    // for (let i = 0; tmpDomainArr.length >= 2; i++) {
    //     const attrs = {
    //         domain: `${i === 0 ? '' : '.'}${tmpDomainArr.join('.')}`
    //     };
    //     tmpDomainArr.shift();

    //     Cookies.remove('accId', attrs);
    //     Cookies.remove('token', attrs);
    //     Cookies.remove('fullName', attrs);
    //     Cookies.remove('userName', attrs);
    //     Cookies.remove('userId', attrs);
    //     Cookies.remove('agentOrgList', attrs);
    //     Cookies.remove('enterpriseId', attrs);
    //     Cookies.remove('initMenu', attrs);
    //     Cookies.remove('relatedAccounts', attrs);
    //     Cookies.remove('notChatWithOther', attrs);
    // }
    // // 设置 cookie
    // Cookies.set('accId', userData.accId);
    // Cookies.set('token', userData.token);
    // Cookies.set('fullName', encodeURI(userData.fullName));
    // Cookies.set('userName', formData.userName ? formData.userName : userData.userName);
    // Cookies.set('userId', userData.userId);
    // Cookies.set('agentOrgList', userData.agentOrgList);
    // Cookies.set('enterpriseId', userData.orgId);
    // // 设置关联账号
    // Cookies.set('relatedAccounts', Array.isArray(userData.relatedOrgList) ? userData.relatedOrgList : []);

    // this.$store.commit('setUserName', formData.userName ? formData.userName : userData.userName);
    // this.$store.commit('setFullName', userData.fullName);
    // this.$store.commit('setUserId', {
    //     userId: userData.userId,
    //     accId: userData.accId
    // });
    // this.$store.commit('setEnterpriseId', userData.orgId);
    // if (`${userData.orgId}` === '11471') {
    //     this.$store.commit('setVersion', 'WAPersonalEdition');
    // }
    // this.$store.commit('setRelatedAccounts', Array.isArray(userData.relatedOrgList) ? userData.relatedOrgList : []);
    // this.getMenu(userData.userId, userData.orgId);
    // // 获取工商联想数据的开启状态
    // localStorage.setItem('XHLLogin', 'LOGIN');

    // 初始化聊天相关
    // this.$store.state.personSubscribes = {};
    // this.$store.state.isServerOnlineChecked = false;
};

// 校验验证码
const valideVerificationCode = async (rule, value, callback) => {
    // 判断验证码是否为空或者验证码长度是否为6
    if (loginType.value === 'mobileCode') {
        if (!value) {
            callback(new Error('验证码不能为空'));
        } else if (value.length !== 6) {
            // 如果验证码为空或者验证码长度不为6，则报错
            callback(new Error(t('per_setting.captchaFormatErro')));
        } else {
            // 如果验证码不为空且验证码长度为6，则通过验证
            if (formData.phone !== '') {
                // 如果验证码不为空且验证码长度为6，则通过验证
                // 短信验证码传参
                await passVerificationCode(formData.phone, formData.code, 'phone', 'phoneCode').then(res => {
                    callback();
                }, res => {
                    callback(new Error(res.message));
                });
                console.log('-----', res);
            }
        }
    } else if (loginType.value === 'emailCode') {
        if (!value) {
            // 如果验证码为空，则报错
            callback(new Error('验证码不能为空'));
        } else {
            if (formData.email !== '') {
                // 如果验证码不为空且验证码长度为6，则通过验证
                // 短信验证码传参
                await passVerificationCode(formData.email, formData.emailCode, 'email', 'emailCode').then(res => {
                    callback();
                }, res => {
                    callback(new Error(res.message));
                });
                console.log('-----', res);
            }
        }
    } else {}
};


// 表单校验规则
const phoneLoginFormRules = {
    phone: [
        { required: true, message: '手机号不能为空', trigger: 'blur' },
        { validator: validePhone, trigger: 'blur' }
    ],
    code: [
        { validator: valideVerificationCode, trigger: 'blur' }
    ],
    emailCode: [
        { validator: valideVerificationCode, trigger: 'blur' }
    ],
    email: [{ required: true, message: '邮箱不能为空', trigger: 'blur' }, { validator: valideVerificationeEmail, trigger: 'blur' }],
    password: [{ required: true, message: '密码不能为空', trigger: 'blur', max: 20},{ validator: validePassword, trigger: 'blur' }],
    emailPassword: [{ required: true, message: '密码不能为空', trigger: 'blur', max: 20}]
};

const _callback = (res) => {
    // 发送过于频繁提示
    if (res.code === '2') {
        able_getCaptcha.value = true;
        phoneLoginErrMsg.value = t('security.err_SMSCount');
    } else {
        able_getCaptcha.value = true;
        if (res.message === '离职人员禁止登录!' || res.message === '您的账号已被锁定,禁止登录!如想登录,请联系企业管理员!') {
            phoneLoginErrMsg.value = t('login.logErrTips1');
        } else if (res.message === '使用期限已到,禁止登录!如想登录,请联系企业管理员!') {
            phoneLoginErrMsg.value = t('login.logErrTips3');
        } else if (res.message === '手机号未绑定询盘云账号,请在<个人设置>绑定后重试') {
            phoneLoginErrMsg.value = t('login.phoneUnbindTip');
        } else {
            phoneLoginErrMsg.value = res.message;
        }
    }
};
// 引入回去验证码hooks
// 获取验证码，并获取验证码加载状态，错误信息，是否能够获取验证码，验证码按钮文本
const { 
    passVerificationCode,
    sendVerificationCode,
    getCaptchaLoading,
    phoneLoginErrMsg,
    able_getCaptcha,
    captchaBtnText,
    clear
} = useSendVerificationCode(formData, _callback);


// 清空校验错误提示语
const clearPhoneLoginErrMsg = () => {
    phoneLoginErrMsg.value = '';
    errMsg.value = '';
};

const codeInput = (type) => {
    // 替换电话号码输入框中的非数字字符
    formData[type] = formData[type].replace(/[^\d]/g, '');
};
const enterSwiper = () => {};
const leaveSwiper = () => {};
console.log(222);
</script>
<style lang="scss" scoped>
@import './login-page.scss';
@import './form-login.scss';
.login-body {
    height: 440px;
    .phoneLoginBox {
        padding-bottom: 2px;
    }
}
.float-right{
    float: right;
}
.margin-bottom-10 {
    margin-bottom: 10px;
}
.forgetPwd{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    height: 14px;
    .rememberText {
        margin-left: -4px;
        font-weight: 400;
        font-size: 12px;
        color: #303133;
    }
}
.phone-input {
    height: 42px;
    margin-bottom: 8px;
}
</style>
<style lang="scss">
input:-webkit-autofill:focus,
input:-webkit-autofill:hover,
input:-webkit-autofill {
    /* 自动填充时的样式代码 */
    -webkit-transition-delay: 111111s;
    -webkit-transition: color 11111s ease-out, background-color 111111s ease-out;
}
</style>