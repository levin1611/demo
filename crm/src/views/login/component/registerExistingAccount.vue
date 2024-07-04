<!-- 超管新建成员后关联既有通行证 -->
<template>
    <div class="register-box">
        <el-card class="register-box-card">
            <!-- <p class="register-box-title">注册鑫互联通行证</p> -->
            <p  class="register-box-title">激活账号</p>
            <el-form :model="formParams" :rules="rules" ref="ruleFormRef">
                <template v-if="step === 1">
                    <p class="register-box-subtitle">登录鑫互联所有服务的唯一凭证</p>
                    <el-form-item prop="phone">
                        <el-input v-model="formParams.phone"
                                  class="phone-input"
                                  :maxlength="11"
                                  disabled
                                  type="text"
                                  style="margin-bottom: 0px"
                                  :placeholder="$t('login.phonePlaceholder')"></el-input>
                    </el-form-item>
                    <el-form-item prop="code">
                        <el-input
                            v-model="formParams.code" 
                            class="phone-input"
                            :maxlength="6"
                            :placeholder="$t('login.codePlaceholder')">
                            <template #append>
                                <el-button :loading="getCaptchaLoading"
                                           :disabled="!able_getCaptcha"
                                           @click="sendVerificationCode('phone')"
                                           style="color: #3B78DE; background-color: transparent; font-weight: normal;font-size:12px">{{captchaBtnText}}</el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                    <div class="err-tip" style="margin-top: 70px;">{{ errMsg }}</div>
                    <!-- <div class="err-tip" style="margin-top: 70px;">{{ phoneLoginErrMsg }}</div> -->
                    <el-button class="submiteBtn brandColor" type="primary" :disabled="pastDue" @click="nextStep(ruleFormRef, 2)">完成</el-button>
                    <!-- 同意《用户协议》、《隐私条款》，并接受询盘云的服务 -->
                    <div class="agreement-cls">
                        <el-checkbox v-model="isAgreed"
                                     label="1">{{ "" }}</el-checkbox>
                        <span class="userAgreement-privacyPolicy">{{
                            $t('login.agree')
                        }}<a :href="`${publicPath}leadscloudUserAgreement.html`" target="_blank">{{ $t('login.userAgreement') }}</a>{{
                            $t('login.loginStatus')
                        }}<a :href="`${publicPath}leadscloudPrivacyPolicy.html`" target="_blank">{{ $t('login.privacyPolicy') }}</a>{{ $t('login.acceptTheService') }}
                        </span>
                    </div>
                </template>
                <template v-if="step === 2">
                    <template v-if="accountInfo.exist">
                        <p class="isHave-account">通行证已存在</p>
                        <p class="isHave-tips">邮箱和手机号已绑定鑫互联通行证【{{ accountInfo.username }}】，已自动加入公司【{{ accountInfo.orgName }}】</p>
                    </template>
                    <template v-else>
                        <p class="isHave-account">验证通过</p>
                        <p class="isHave-tips">验证通过，请点击【开始使用】按钮登录询盘云系统，完成账号激活</p>
                    </template>
                    <div class="isHave-btn-group">
                        <el-button class="useDisableColor" type="primary" @click="checkInfo">查看通行证</el-button>
                        <el-button class="brandColor" type="primary" @click="goHome">开始使用</el-button>
                    </div>
                </template>
            </el-form>
        </el-card>
    </div>
</template>
<script setup>
import Cookies from 'js-cookie';
import { useSendVerificationCode } from '@/hooks/sendVerificationCode';
import accountDetail from './accountDetail.vue';
import { ref, reactive, toRefs, onBeforeUpdate, watch } from 'vue';
import { t } from '@/locale';
import Utils from '@/utils/index.js';
import { loginSuccess } from '@/utils/common';
import { validePhone } from '@/libs/valider'
import { passRelatedOrg, passByLarkId } from '@/api/login.js';
import { useRouter } from 'vue-router';
const publicPath = 'https://qa-crm.leadscloud.com/Front-Vue/';
const router = useRouter();

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

onBeforeUpdate(() => {
    formParams.phone = props.accountInfo.mobile;
    formParams.email = props.accountInfo.email;
});

const ruleFormRef = ref(null);
const isAgreed = ref(false); // 是否同意协议
const step = ref(1); 
const passInfo = ref({});
const errMsg = ref('');


watch(
    () => props.accountInfo,
    (val) => {
        if (val) {
            console.log(val.exist);
            if (val.exist) {
                step.value = 2;
            }
        }
    },
    {
        immediate: true
    }
);
// 电话号码登录,表单对象
const formParams = reactive({
    phone: '',
    code: ''
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
const rules = reactive({
    phone: [{ validator: validePhone, trigger: 'blur' }],
    code: [{ validator: valideCode, trigger: 'blur' }]
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
console.log(props);
// 点击下一步按钮
const nextStep = (formEl, num) => {
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
            passRelatedOrg({
                orgId: props.accountInfo.orgId,
                userId: props.accountInfo.userId,
                email: props.accountInfo.email,
                larkId: props.accountInfo.larkId,
                username: props.accountInfo.accountName,
                mobile: formParams.phone,
                verificationCode: formParams.code
            }).then(res => {
                console.log('注册成功', res);
                if (res.code === 10000) {
                    step.value = num; 
                    passInfo.value = res.data;
                } else {
                    errMsg.value = res.message;
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

const emit = defineEmits(['showDetail']); 

const checkInfo = () => {
    console.log(2222, passInfo.value);
    emit('showDetail', props.accountInfo.larkId || passInfo.value.accountInfoDto.larkId);
};
const goHome = () => {
    console.log('跳转到首页', passInfo.value);
    passByLarkId({
        larkId: props.accountInfo.larkId || passInfo.value.accountInfoDto.larkId,
        orgId: props.accountInfo.orgId || passInfo.value.accountInfoDto.orgId
    }).then(res => {
        console.log(res);
        if (res.code === 10000) {
            Cookies.set('accountToken', res.data.accountToken);
            // 由于接口中不返回orgId跟userId，所以需要手动从Md5接口中获取
            let _o = res.data.accountInfoDto;
            _o.orgId = props.accountInfo.orgId;
            _o.userId = props.accountInfo.userId;
            _o.nickName = props.accountInfo.nickName;
            console.log(props.accountInfo, _o, res.data);
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
        height: 480px;
        width: 480px;
        padding: 40px;
        box-sizing: border-box;
        border-radius: 12px;
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
        }
        .submiteBtn{
            border-radius: 4px;
            width: 360px;
            height: 42px;
        }
        .successBtn {
            margin-top: 10px;
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
            margin: 40px 0 10px;
            line-height: 24px;
        }
        .isHave-tips {
            margin: 0px;
            padding: 0px;
            line-height: 22px;
            font-size: 14px;
        }
        .isHave-btn-group {
            margin-top: 144px;
            text-align: center;
            button{
                height: 42px;
                width: 170px;
            }
        }
        .check-account{
           width: 360px; 
        }
        .err-tip {
            color: #F56C6C;
            min-height: 12px;
            display: block;
            padding: 0;
        }
    }
    .xhl-el-form-item {
        margin-bottom: 0px;
    }
    .phone-input{
        height: 42px;
        width: 360px;
        line-height: 42px;
        color: #333;
        margin: 30px 0 0px;
        &::placeholder{
            font-size: 14px;
        }
    }
    .register-input{
        height: 36px;
        width: 360px;
        line-height: 36px;
        color: #333;
        margin: 0 0 24px;
        &::placeholder{
            font-size: 14px;
        }
    }
}
</style>