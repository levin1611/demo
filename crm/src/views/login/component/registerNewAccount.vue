<!-- 超管新建成员后邀请用户注册 -->
<template>
    <div class="register-box">
        <el-card class="register-box-card">
            <p class="register-box-title">注册鑫互联通行证</p>
            <el-form :model="formParams" :rules="rules" ref="ruleFormRef">
                <p class="register-box-subtitle">登录鑫互联所有服务的唯一凭证</p>
                <template v-if="step === 1">
                    <el-form-item prop="email">
                        <el-input v-model="formParams.email"
                                  class="phone-input"
                                  disabled
                                  type="text"
                                  :placeholder="$t('login.phonePlaceholder')"></el-input>
                    </el-form-item>
                    <el-form-item prop="phone">
                        <el-input v-model="formParams.phone"
                                  class="phone-input"
                                  disabled
                                  type="text"
                                  :placeholder="$t('login.phonePlaceholder')"></el-input>
                    </el-form-item>
                    <el-form-item prop="code">
                        <el-input
                            v-model="formParams.code" 
                            class="phone-input defaultSuffx"
                            :maxlength="6"
                            :placeholder="$t('login.codePlaceholder')">
                            <template #append>
                                <el-button type="link" :loading="getCaptchaLoading"
                                           :disabled="!able_getCaptcha"
                                           @click="sendVerificationCode('phone')"
                                           style="color: #3B78DE; background-color: transparent; font-weight: normal;font-size: 12px;">{{captchaBtnText}}</el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                </template>
                <template v-if="step === 2">
                    <el-form-item prop="accountName">
                        <el-input v-model="formParams.accountName"
                                  class="phone-input"
                                  :maxlength="50"
                                  type="text"
                                  onfocus="this.removeAttribute('readonly');"
                                  readonly="true"
                                  autocomplete="off"
                                  :placeholder="$t('login.accountNamePlaceholder')"></el-input>
                    </el-form-item>
                    <el-form-item prop="pwd">
                        <el-input v-model="formParams.pwd"
                                  class="phone-input"
                                  type="password"
                                  :maxlength="20"
                                  show-password
                                  onfocus="this.removeAttribute('readonly');"
                                  readonly="false"
                                  autocomplete="off"
                                  :placeholder="$t('login.pwdPlaceholder')"></el-input>
                        <el-tooltip content="密码规则：密码的长度为8-20个字符，须由字母、数字和特殊符号中的至少2类字符组成，字母区分大小写，不可输入空格" placement="top">
                            <span class="custom custom-Tips"></span>
                        </el-tooltip>
                    </el-form-item>
                    <el-form-item prop="repwd">
                        <el-input v-model="formParams.repwd"
                                  class="phone-input"
                                  type="password"
                                  show-password
                                  :maxlength="20"
                                  onfocus="this.removeAttribute('readonly');"
                                  readonly="false"
                                  style="margin-bottom:5px"
                                  autocomplete="off"
                                  :placeholder="$t('login.pwdPlaceholder')"></el-input>
                    </el-form-item>
                </template>
                <el-button v-if="step === 1" class="submiteBtn brandColor" :disabled="pastDue" type="primary" @click="nextStep(ruleFormRef, 2)">下一步</el-button>
                <el-button v-if="step === 2" class="submiteBtn brandColor" :disabled="pastDue" type="primary" @click="ok(ruleFormRef, 3)">完成</el-button>
                <!-- 同意《用户协议》、《隐私条款》，并接受询盘云的服务 -->
                <div class="agreement-cls" v-if="step === 2">
                    <el-checkbox v-model="isAgreed"
                                 label="1">{{ "" }}</el-checkbox>
                    <span class="userAgreement-privacyPolicy">{{
                        $t('login.agree')
                    }}<a :href="`${publicPath}leadscloudUserAgreement.html`" target="_blank">{{ $t('login.userAgreement') }}</a>{{
                        $t('login.loginStatus')
                    }}<a :href="`${publicPath}leadscloudPrivacyPolicy.html`" target="_blank">{{ $t('login.privacyPolicy') }}</a>{{ $t('login.acceptTheService') }}
                    </span>
                </div>
            </el-form>
            <template v-if="step === 3">
                <template v-if="accountInfo.exist">
                    <p class="isHave-account">通行证已存在</p>
                    <p class="isHave-tips">邮箱和手机号已绑定鑫互联通行证【{{ accountInfo.username }}】，已自动加入公司【{{ accountInfo.orgName }}】</p>
                </template>
                <template v-else>
                    <p class="isHave-account">注册成功</p>
                    <p class="isHave-tips">您已成功注册鑫互联通行证【{{ passInfo.accountInfoDto.username }}】，并加入公司【{{ passInfo.accountInfoDto.orgName }}】</p>
                </template>
                <!-- <p class="isHave-account">注册成功</p>
                <p class="isHave-tips">您已成功注册鑫互联通行证【{{ passInfo.accountInfoDto.username }}】，并加入公司【{{ passInfo.accountInfoDto.orgName }}】</p> -->
                <!-- <p class="isHave-account">通行证已存在</p>
                <p class="isHave-tips">邮箱和手机号已绑定鑫互联通行证【{{ passInfo.accountInfoDto.username }}】，已自动加入公司【{{ passInfo.accountInfoDto.orgName }}】</p> -->
                <div class="isHave-btn-group">
                    <el-button class="useDisableColor" type="primary" @click="checkInfo">查看通行证</el-button>
                    <el-button class="brandColor" type="primary"  @click="goHome">开始使用</el-button>
                </div>
            </template>
        </el-card>
    </div>
</template>
<script setup>
import Cookies from 'js-cookie';
import { useSendVerificationCode } from '@/hooks/sendVerificationCode';
import { accountCheckRepeat } from '@/api/common';
import { addPass, passByLarkId } from '@/api/login';
import accountDetail from './accountDetail.vue';
import { ref, reactive, onBeforeUpdate, toRefs, watch } from 'vue';
import { useUserStore } from '@/pinia/modules/user';
import { useRouter } from 'vue-router';
import { t } from '@/locale';
import Utils from '@/utils/index.js';
import { validePhone } from '@/libs/valider'
import { loginSuccess } from '@/utils/common';
const publicPath = 'https://qa-crm.leadscloud.com/Front-Vue/';
const passwordReg = Utils.regExp.password;
const router = useRouter();
const store = useUserStore();

const ruleFormRef = ref(null);

const isAgreed = ref(false); // 是否同意协议
const step = ref(1); 

// props 接收
const props = defineProps({
    accountInfo: {
        type: Object,
        default: () => ({})
    },
    pastDue: {
        type: Boolean
    }
});
watch(
    () => props.accountInfo,
    (val) => {
        if (val) {
            console.log(val.exist);
            if (val.exist) {
                step.value = 3;
            }
        }
    },
    {
        immediate: true
    }
);
// 第一步：电话号码跟邮箱注册表单项
const formParams = reactive({
    orgId: store.orgId,
    userId: store.userId,
    phone: '',
    code: '',
    email: '',
    accountName: '',
    pwd: '',
    repwd: ''
});

// 第一步：电话号码跟邮箱注册表单项
const passInfo = ref({});

onBeforeUpdate(() => {
    formParams.phone = props.accountInfo.mobile;
    formParams.email = props.accountInfo.email;
});


// const validePhone = (rule, value, callback) => {
//     if (!value || value.length !== 11) {
//         callback(new Error(t('login.err_phoneFormat')));
//     } else {
//         const telReg = Utils.regExp.tell;
//         if (!telReg.test(value)) {
//             callback(new Error(t('login.err_phoneFormat')));
//         } else {
//             callback();
//         }
//     }
// };

// 通行证类型：1-手机号，2-邮箱，3-用户名
const valideAccountName = async (rule, value, callback) => {
    await accountCheckRepeat({
        accountName: value,
        accountType: 3
    }).then(res => {
        if (res.code === 10000) {
            // 如果返回数据了，则表示重复
            if (res.data) {
                ElMessage.error('用户名已存在');
                callback(new Error('用户名已存在'));
            } else {
                callback();
            }
        } else {
            callback(new Error(t(res.message)));
        }
    });
};

// 短信验证码格式校验，失焦时
const valideCode = async (rule, value, callback) => {
    if (!value) {
        callback(new Error('验证码不能为空'));
    } else if (value.length !== 6) {
        callback(new Error('请输入正确的验证码'));
    } else {
        // 短信验证码传参
        await passVerificationCode(formParams.phone, formParams.code, 'phone', 'phoneCode').then(res => {
            callback();
        }, res => {
            callback(new Error(res.message));
        });
        console.log('-----', res);
    }
};

// 密码及重复密码校验
const validePassword = (rule, value, callback) => {
    if(value.length === 0) {
        callback(new Error('密码不能为空'));
    } else if (value.length < 8 || value.length > 20) {
        callback(new Error('密码须由8-20字符组成，请重新输入'));
    } else if (!passwordReg.test(value)) {
        callback(new Error('密码须由字母、数字和特殊符号中的至少2类字符组成'));
    } else {
        ruleFormRef.value.validateField('repwd', async (valid, cb) => {
            if (valid) {
                callback();
            }
        });
    }
};
const valideRePassword = (rule, value, callback) => {
    if(value.length === 0) {
        callback(new Error('请再次输入密码'));
    } else if (value.length < 8 || value.length > 20) {
        callback(new Error('密码须由8-20字符组成，请重新输入'));
    } else if (formParams.pwd.length > 0 && formParams.repwd.length > 0 && formParams.pwd !== formParams.repwd) {
        callback(new Error('两次密码不一致，请重新输入'));
    } else if (!passwordReg.test(value)) {
        callback(new Error('密码须由字母、数字和特殊符号中的至少2类字符组成'));
    } else {
        callback();
    }
};
const rules = reactive({
    phone: [{ validator: validePhone, trigger: 'blur' }],
    code: [{ validator: valideCode, trigger: 'blur' }],
    email: [{ required: true, message: t('login.err_email'), trigger: 'blur' }],
    accountName: [
        { required: true, message: t('login.err_accountName_null'), trigger: 'blur' },
        { validator: valideAccountName, trigger: 'blur' }
    ],
    pwd: [
        { validator: validePassword, trigger: 'blur' }
    ],
    repwd: [
        { validator: valideRePassword, trigger: 'blur' }
    ]
});

const dialogVisible = reactive(true);

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

const nextStep = (formEl, num) => {
    formEl.validateField('code', async (valid, cb) => {
        if (valid) {
            // 验证码校验通过，则进入下一步，填写用户名、密码
            step.value = num;
        }
    });
};
// 点击下一步
const ok = (formEl, num) => {
    console.log(isAgreed.value);
    if (!isAgreed.value) {
        return ElMessage.warning(t('login.agreeTip'));
    }
    // passByLarkId({
    //     larkId: props.accountInfo.larkId || passInfo.value.accountInfoDto.larkId
    // }).then(res => {
    //     console.log(res);
    //     if (res.code === 10000) {
    //         step.value = num; 
    //         passInfo.value = res.data;
    //     } else {
    //         console.log('查询失败');
    //     }
    // });
    formEl.validate((valid) => {
        if (valid) {
            addPass({
                orgId: props.accountInfo.orgId,
                userId: props.accountInfo.userId,
                email: formParams.email,
                larkId: props.accountInfo.larkId,
                mobile: formParams.phone,
                password: formParams.pwd,
                username: formParams.accountName.trim(),
                verificationCode: formParams.code
            }).then(res => {
                if (res.code === 10000) {
                    step.value = num; 
                    passInfo.value = res.data;
                } else {
                    ElMessage.warning(res.message);
                }
            });
            
        } else {
            console.log('error submit!!');
        }
    });
};
// 引入回去验证码hooks
// 获取验证码，并获取验证码加载状态，错误信息，是否能够获取验证码，验证码按钮文本
const { 
    passVerificationCode,
    sendVerificationCode,
    getCaptchaLoading,
    phoneLoginErrMsg,
    able_getCaptcha,
    captchaBtnText 
} = useSendVerificationCode(formParams, _callback);

// const ok = () => {
//     step.value = 3;
// };
const emit = defineEmits(['showDetail']); 

const checkInfo = () => {
    console.log(2222, passInfo.value);
    emit('showDetail', props.accountInfo.larkId || passInfo.value.accountInfoDto.larkId);
};

const goHome = () => {
    passByLarkId({
        larkId: props.accountInfo.larkId || passInfo.value.accountInfoDto.larkId,
        orgId: props.accountInfo.orgId || passInfo.value.accountInfoDto.orgId
    }).then(res => {
        console.log(res);
        Cookies.set('accountToken', res.data.accountToken);
        // 由于接口中不返回orgId跟userId，所以需要手动从Md5接口中获取
        let _o = res.data.accountInfoDto;
        _o.orgId = props.accountInfo.orgId;
        _o.userId = props.accountInfo.userId;
        _o.nickName = props.accountInfo.nickName;
        if (res.code === 10000) {
            loginSuccess(_o, res.data, () => {
                router.push({
                    path: '/',
                    query: {url: '/systemSettings/company'}
                });
            });
        } else {
            console.log('查询失败');
        }
    });
};
</script>
<style lang="scss" scoped>
.register-box {
    .register-box-card{
        .custom-Tips {
            color: #909399;
            font-size: 14px;
            position: absolute;
            right: -20px;
            top: 15px;
        }
        border-radius: 12px;
        .#{$elnamespace}-form-item{
            margin-bottom: 0px;
        };
        height: 480px;
        width: 480px;
        padding: 30px 40px;
        box-sizing: border-box;
        .register-box-title{
            font-size: 20px;
            font-weight: 600;
            margin: 0px;
            padding: 0px;
            line-height: 24px;
        }
        .register-box-subtitle{
            font-size: 14px;
            font-weight: 400;
            margin: 10px 0 0;
            padding: 0px;
            line-height: 22px;
            color: #606266;
            margin-bottom: 16px;
        }
        .submiteBtn{
            border-radius: 4px;
            width: 360px;
            height: 42px;
            margin-top: 71px;
            font-size: 18px;
        }
        .successBtn {
            margin-top: 96px;
        }
        .userAgreement-privacyPolicy a{
            color:$textlinkColor;
            cursor:pointer;
            &:hover {
              color       : #2D63BC;
              border-color: #2D63BC;
            }
        }
        .agreement-cls{
            margin-top: 0px;
            text-align: center;
        }
        .isHave-account {
            font-weight: 600;
            font-size: 16px;
            margin: 30px 0 10px;
            line-height: 24px;
        }
        .isHave-tips {
            margin: 0px;
            padding: 0px;
            line-height: 22px;
            font-size: 14px;
        }
        .isHave-btn-group {
            margin-top: 134px;
            text-align: center;
            button{
                height: 42px;
                width: 173px;
            }
        }
        .check-account{
           width: 360px; 
        }
    }
    .phone-input{
        height: 42px;
        width: 360px;
        line-height: 42px;
        color: #333;
        margin: 0px 0 26px;
        &.defaultSuffx {
            margin-bottom: 5px;
        }
        &::placeholder{
            font-size: 14px;
        }
        :deep(input) {
            color: #303133
        }
    }
    // .register-input{
    //    height: 42px;
    //    width: 360px;
    //    line-height: 42px;
     //   color: #333;
    //    margin: 0 0 24px;
     //   &::placeholder{
    //        font-size: 14px;
    //    }
    //}
}
</style>