<template>
    <el-dialog
        width="500"
        height="340"
        :title="title"
        class="edit-dialog custom-class-add89"
        append-to-body
        v-model="dialogVisible">
        <div style="height:188px">
            <template v-if="step === 0">
                <el-text style="color:#303133">更换邮箱需要你进行身份验证以继续，请选择一下一种方式进行验证</el-text>
                <div>
                    <ul class="edit-dialog-verify-ul">
                        <li @click="verify('sms')">
                            <p><span class="custom custom-message-text verify-type"></span> 短信验证</p>
                            <p class="edit-dialog-verify-ul-box">
                                <span class="edit-dialog-verify-ul-phone">{{accountDetailData.accountInfoDto.mobile}}</span>
                                <span class=" custom custom-a-Property1arrow-rightProperty2linear"></span>
                            </p>
                        
                        </li>
                        <li  @click="verify('email')">
                            <p><span class="custom custom-sms verify-type"></span> 邮件验证</p>
                            <p class="edit-dialog-verify-ul-box">
                                <el-tooltip
                                    effect="dark"
                                    :content="accountDetailData.accountInfoDto.email"
                                    :disabled="isShowTooltip"
                                    show-after="500"
                                    placement="top"
                                    >
                                    <span class="edit-dialog-verify-ul-email" @mouseover="onMouseOver('refEmail')" ref="refEmail">{{accountDetailData.accountInfoDto.email}}</span>
                                </el-tooltip>
                                <span class=" custom custom-a-Property1arrow-rightProperty2linear"></span>
                            </p>
                        </li>
                    </ul>
                </div>
            </template>
            <template v-else-if="step === 'sms'">
                <el-text>短信验证:</el-text>
                <div>
                    <p style="color:#303133">请使用【 {{phonehide(accountDetailData.accountInfoDto.mobile)}} 】获取验证码</p>
                    <el-input
                        class="custom-input" 
                        v-model="formParams.code"
                        type="text"
                        @blur="passVer(formParams.code, 'phone')"
                        :placeholder="$t('login.codePlaceholder1')">
                    </el-input>
                </div>
                <div style="color: #EA4355;font-size: 12px">{{errorMsg}}</div>
            </template>
            <template v-else-if="step === 'email'">
                <el-text>邮箱验证</el-text>
                <div>
                    <p style="color:#303133">请使用【 {{emailHide(accountDetailData.accountInfoDto.email)}}】获取验证码</p>
                    <el-input
                        class="custom-input" 
                        v-model="formParams.code"
                        type="text"
                        @blur="passVer(formParams.code, 'email')"
                        :placeholder="$t('login.codePlaceholder1')"></el-input>
                </div>
                <div style="color: #EA4355;font-size: 12px">{{errorMsg}}</div>
            </template>
            
            <template v-else-if="step === 1">
                <template v-if="editType === 'phone'">
                    <div>
                        <p>请输入新手机号并获取验证码</p>
                        <el-form :model="formParams" :rules="rulesForPhone" ref="ruleFormForPhoneRef">
                            <el-form-item prop="phone">
                                <el-input v-model="formParams.phone"
                                          class="custom-input" 
                                          :maxlength="11"
                                          type="text"
                                          :placeholder="$t('login.phonePlaceholder')"></el-input>
                            </el-form-item>
                            <el-form-item prop="code">
                                <el-input
                                    v-model="formParams.code"
                                    class="custom-input" 
                                    type="text"
                                    style="margin-top: 10px"
                                    :placeholder="$t('login.codePlaceholder1')">
                                    <template #append>
                                        <el-button :loading="stepSendPhoneCode.getCaptchaLoading"
                                                   :disabled="!stepSendPhoneCode.able_getCaptcha"
                                                   @click="sendCode('phone', ruleFormForPhoneRef, stepSendPhoneCode)"
                                                   style="color: #3B78DE; background-color: transparent; font-weight: normal;">{{stepSendPhoneCode.captchaBtnText}}</el-button>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-form>
                    </div>
                </template>
                <template v-else-if="editType === 'email'">
                    <div>
                        <p>请输入新邮箱并获取验证码</p>
                        <el-form  :model="formParams" :rules="rulesForEmail" ref="ruleFormForEmailRef">
                            <el-form-item  prop="email">
                                <el-input v-model="formParams.email"
                                          class="custom-input" 
                                          type="text"
                                          :maxlength="50"
                                          :placeholder="$t('login.emailPlaceholder')"></el-input>
                            </el-form-item>
                            <el-form-item  prop="code">
                                <el-input
                                    class="custom-input" 
                                    v-model="formParams.code"
                                    style="margin-top: 10px"
                                    type="text"
                                    :placeholder="$t('login.codePlaceholder1')">
                                    <template #append>
                                        <el-button :loading="stepSendEmailCode.getCaptchaLoading"
                                                   :disabled="!stepSendEmailCode.able_getCaptcha"
                                                   @click="sendCode('email', ruleFormForEmailRef, stepSendEmailCode)"
                                                   style="color: #3B78DE; background-color: transparent; font-weight: normal;">{{stepSendEmailCode.captchaBtnText}}</el-button>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-form>
                    </div>
                </template>
                <template v-else-if="editType === 'password'">
                    <div>
                        <p style="padding-top: 0px">须由 8-20 字符组成</p>
                        <el-form :model="formParams" :rules="rules" ref="passwordForm">
                            <el-form-item prop="pwd">
                                <el-input v-model="formParams.pwd"
                                          class="custom-input" 
                                          type="text"
                                          show-password
                                          :maxlength="20"
                                          @blur="passwordVer()"
                                          placeholder="新密码"></el-input>
                            </el-form-item>
                            <el-form-item prop="repwd">
                                <!-- no-autofill-pwd -->
                                <el-input
                                    class="custom-input" 
                                    v-model="formParams.repwd"
                                    style="margin-top: 15px"
                                    type="text"
                                    show-password
                                    :maxlength="20"
                                    @blur="passwordVer()"
                                    placeholder="确认新密码">
                                </el-input>
                            </el-form-item>
                        </el-form>
                    </div>
                </template>
            </template>
        </div>
        <template #footer>
            <div class="footer-box">
                <el-button v-if="step === 1" class="useBrandColor" @click="closeDialog(cb)">取消</el-button>
                <el-button v-if="step === 'sms' || step === 'email'" class="useBrandColor" @click="verify(0)">上一步</el-button>
                <el-button v-if="step === 'sms' || step === 'email'" type="primary" @click="ok()">确定</el-button>
                <el-button v-if="step === 1" type="primary" @click="save()">确定</el-button>
            </div>
        </template>
    </el-dialog>
</template>
<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { updateMobile, updateEmail, updatePassword, accountCheckRepeat } from '@/api/login';
import useDialogCommon from '@/hooks/useDialogCommon';
import { useSendVerificationCode } from '@/hooks/sendVerificationCode';
import Utils from '@/utils/index.js';
import { t } from '@/locale';
import { userpass, signRsa } from '@/utils/safe';
import { validePassword } from '@/libs/valider'

const passwordReg = Utils.regExp.password;
const isShowError = ref(true);
const passwordForm = ref(null);
const isShowTooltip = ref(true);
const refEmail = ref(null);

// const title = ref('身份验证');

const formParams = reactive({
    name: '',
    code: '',
    phone: '',
    email: '',
    pwd: '',
    repwd: ''
});

// 接受外部传参
const props = defineProps({
    visible: {
        type: Boolean,
        default: true
    },
    accountDetailData: {
        type: Object,
        default: () => ({})
    },
    editType: {
        type: String,
        default: ''
    }
});

const title = computed(() => {
    if (step.value === 0 || step.value === 'sms' || step.value === 'email') {
        return '身份验证';
    } else if (step.value === 1) {
        if (props.editType === 'phone') {
            return '更换手机号';
        } else if (props.editType === 'email') {
            return '更换邮箱';
        } else if (props.editType === 'password') {
            return '输入新密码';
        } else {
            return ''
        }
    } else {
        return '';
    }
});

// 密码及重复密码校验
// const validePassword = (rule, value, callback) => {
//     isShowError.value = true;
//     if (value.length < 8 || value.length > 20) {
//         callback(new Error(t('login.err_pwd')));
//     } else if (!passwordReg.test(value)) {
//         callback(new Error('密码的长度为8-20个字符，须由字母、数字和特殊符号中的至少2类字符组成'));
//     } else {
//         callback();
//     }
// };

const onMouseOver = (type) => {
    const  parentWidth = refEmail.value.parentNode.offsetWidth;
    const  contentWidth = refEmail.value.offsetWidth;
    // 判断是否开启 tooltip 功能，如果溢出显示省略号，则子元素的宽度势必短于父元素的宽度
    if (contentWidth > parentWidth - 50) {
        isShowTooltip.value = false;
    } else {
        isShowTooltip.value = true;
    }
};

// 密码及重复密码校验
const valideRePassword = (rule, value, callback) => {
    if(value.length === 0) {
        callback(new Error('密码不能为空'));
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

// 手机号验证
const validePhone = async (rule, value, callback) => {
    if (value.length === 0) {
        callback(new Error('手机号不能为空'));
    } else if (value.length !== 11) {
        callback(new Error(t('login.err_phoneFormat')));
    } else {
        const telReg = Utils.regExp.tell;
        if (!telReg.test(value)) {
            callback(new Error(t('login.err_phoneFormat')));
        } else {
            if (value === props.accountDetailData.accountInfoDto.mobile) {
                callback(new Error('新输入手机号与原手机号相同，请重新输入'));
            } else {
                await accountCheckRepeat({
                    accountName: value,
                    accountType: 1
                }).then(res => {
                    if (res.code === 10000) {
                        if (res.data) {
                            callback(new Error('新输入手机号已绑定通行证，请重新输入'));
                            // stepSendPhoneCode.value.able_getCaptcha = false;
                        } else {
                            // stepSendPhoneCode.value.able_getCaptcha = true;
                            callback();
                        }
                    } else {
                        callback(new Error('新输入手机号已绑定通行证，请重新输入'));
                        // stepSendPhoneCode.value.able_getCaptcha = false;
                    }
                });
                
            }
        }
    }
};

const ruleFormForEmailRef = ref(null);
const ruleFormForPhoneRef = ref(null);
// 短信验证码格式校验，失焦时
const valideCode = (rule, value, callback) => {
    if (value.length === 0) {
        callback(new Error('验证码不能为空'));
    } else if(value.length < 6){
        callback(new Error('请输入正确的验证码'));
    } else {
        // 短信验证码传参
        ruleFormForPhoneRef.value.validateField('phone', async (valid) => {
            if(valid) { 
                await stepSendPhoneCode.value.passVerificationCode(formParams.phone, formParams.code, 'phone', 'phoneCode').then(res => {
                    console.log(11)
                    callback();
                }, res => {
                    console.log(11)
                    callback(new Error(res.message));
                });
            }
        })
    }
};

// 短信验证码格式校验，失焦时
const valideCodeForEmail = (rule, value, callback) => {
    if (value.length === 0) {
        callback(new Error('验证码不能为空'));
    } else {
        ruleFormForEmailRef.value.validateField('email', async (valid) => {
            // 短信验证码传参
            if(valid) {
                await stepSendEmailCode.value.passVerificationCode(formParams.email, formParams.code, 'email', 'emailCode').then(res => {
                    callback();
                }, res => {
                    callback(new Error(res.message));
                });
            }
        })
        
    }
};

// 邮箱校验
const valideVerificationeEmail = async (rule, value, callback) => {
    // 获取正则表达式
    const telReg = Utils.regExp.fullEmail;
    // 判断输入框是否符合正则表达式
    if (value.length === 0) {
        // 如果不符合，则报错，提示错误信息
        callback(new Error('邮箱不能为空'));
    } else if (!telReg.test(value)) {
        // 如果不符合，则报错，提示错误信息
        callback(new Error('请输入正确的邮箱'));
    } else {
        // 如果符合，则通过验证
        if (value === props.accountDetailData.accountInfoDto.email) {
            callback(new Error('新输入邮箱与原邮箱相同，请重新输入'));
            // stepSendEmailCode.value.able_getCaptcha = false;
        } else {
            await accountCheckRepeat({
                accountName: value,
                accountType: 2
            }).then(res => {
                if (res.code === 10000) {
                    if (res.data) {
                        console.log(res.data);
                        callback(new Error('新输入邮箱已绑定通行证，请重新输入'));
                        // stepSendEmailCode.value.able_getCaptcha = false;
                    } else {
                        // stepSendEmailCode.value.able_getCaptcha = true;
                        callback();
                    }
                } else {
                    callback(new Error('新输入邮箱已绑定通行证，请重新输入'));
                    // stepSendEmailCode.value.able_getCaptcha = false;
                }
            });
        }
    }
};

const rules = reactive({
    pwd: [
        { validator: validePassword, trigger: 'blur' }
    ],
    repwd: [
        { validator: valideRePassword, trigger: 'blur' }
    ]
});

const rulesForPhone = {
    phone: [{ required: true, message: '手机号不能为空', trigger: 'blur' }, { validator: validePhone, trigger: 'blur' }],
    code: [{ validator: valideCode, trigger: 'blur' }]
};

const rulesForEmail = {
    email: [{ validator: valideVerificationeEmail, trigger: 'blur' }],
    code: [{ validator: valideCodeForEmail, trigger: 'blur' }]
};

const larkId = ref('');

const errorMsg = ref('');

const showDialog = true;
// 进度步骤
const step = ref(0);

// 进度步骤
const formType = ref('');

// 切换步骤
const verify = (type) => {
    console.log(type);
    formParams.code = '';
    errorMsg.value = '';
    switch (type) {
        case 'sms':
            sendVerificationCode('phone');
            break;
        case 'email':
            sendVerificationCode('email');
            break;
        default:
            break;
    }
    step.value = type;
};

// 验证验证码
const passVer = (value, type) => {
    // 短信验证码传参
    if (formParams.code.trim().length < 1) {
        errorMsg.value = '请输入正确的验证码';
    } else {
        if (type === 'phone') {
            if (formParams.code.trim().length < 6) {
                errorMsg.value = '请输入正确的验证码';
            } else {
                 passVerificationCode(formParams.phone, formParams.code, 'phone', 'phoneCode').then(res => {
                    errorMsg.value = '';
                }, res => {
                    errorMsg.value = res.message;
                });
            }
        } else if (type === 'email') {
            passVerificationCode(formParams.email, formParams.code, 'email', 'emailCode').then(res => {
                errorMsg.value = '';
            }, res => {
                errorMsg.value = res.message;
            });
        }
        
    }
};

const ok = () => {
    let res = {};
    // 短信验证码传参
    if (formParams.code.trim().length < 1) {
        errorMsg.value = '请输入正确的验证码';
        return;
    } else {
        errorMsg.value = '';
    }
    console.log(2345)
    switch (step.value) {
        case 'sms':
            stepSendPhoneCode.value.passVerificationCode(formParams.phone, formParams.code, 'phone', 'phoneCode').then(res => {
                console.log(res);
                step.value = 1;
                formParams.email = '';
                formParams.phone = '';
                formParams.code = '';
                errorMsg.value = '';
            }, res => {
                console.log(res); 
                errorMsg.value = res.message;
            });
            break;
        case 'email':
            stepSendEmailCode.value.passVerificationCode(formParams.email, formParams.code, 'email', 'emailCode').then(res => {
                console.log(res);
                step.value = 1;
                formParams.email = '';
                formParams.phone = '';
                formParams.code = '';
                errorMsg.value = '';
            }, res => {
                console.log(res); 
                errorMsg.value = res.message;
            });
            break;
        default:
            break;
    }
};
// 定义 emit
const emits = defineEmits(['update:visible', 'refresh']);
const passwordVer = () => {

};

// 保存新的电话/邮箱信息
const save = () => {
    if (props.editType === 'phone') {
        ruleFormForPhoneRef.value.validate((valid) => {
            if (valid) {
                updateMobile({
                    larkId: larkId.value,
                    mobile: formParams.phone,
                    verificationCode: formParams.code
                }).then(res => {
                    if (res.code === 10000) {
                        console.log('修改成功');
                        closeDialog(cb);
                        closeDialog(() => {
                            emits('refresh'); 
                        });
                        stepSendPhoneCode.value.clear();
                    } else {
                        ElMessage.warning(res.message);
                    }
                });
            }
            
        });
    }
    if (props.editType === 'email') {
        ruleFormForEmailRef.value.validate((valid) => {
            if (valid) {
                updateEmail({
                    larkId: larkId.value,
                    email: formParams.email,
                    verificationCode: formParams.code
                }).then(res => {
                    if (res.code === 10000) {
                        console.log('修改成功');
                        closeDialog(cb);
                        closeDialog(() => {
                            emits('refresh'); 
                        });
                        stepSendEmailCode.value.clear();
                    } else {
                        ElMessage.warning(res.message);
                    }
                });
            }
        });
    }
    if (props.editType === 'password') {
        passwordForm.value.validate((valid) => {
            if (valid) {
                updatePassword({
                    accountName: props.accountDetailData.accountInfoDto.mobile,
                    accountType: 1,
                    password: formParams.pwd
                    // password: signRsa.encrypted(formParams.pwd)
                }).then(res => {
                    if (res.code === 10000) {
                        console.log('修改成功');
                        closeDialog(() => {
                            emits('logout'); 
                            closeDialog(cb);
                        });
                    } else {
                        ElMessage.warning(res.message);
                    }
                });
            } else {
                ElMessage.warning(res.message);
            }
        });
    }
};

const cb = () => {
    step.value = 0;
};

// 取通用的 dialog 逻辑相关参数
const {
    dialogVisible,
    closeDialog
} = useDialogCommon(props, emits);

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
// 获取验证码，并获取验证码加载状态，错误信息，是否能够获取验证码，验证码按钮文本
const { 
    passVerificationCode,
    sendVerificationCode,
    getCaptchaLoading,
    phoneLoginErrMsg,
    able_getCaptcha,
    captchaBtnText 
} = useSendVerificationCode(formParams, _callback);


// 获取验证码，并获取验证码加载状态，错误信息，是否能够获取验证码，验证码按钮文本
const stepSendEmailCode = ref({});
const stepSendPhoneCode = ref({});
stepSendEmailCode.value = useSendVerificationCode(formParams, _callback);
stepSendPhoneCode.value = useSendVerificationCode(formParams, _callback);
console.log('-----------', stepSendEmailCode.value.captchaBtnText);

const sendCode = (type, el, elFun) => {
    // 短信验证码传参
    el.validateField(type, async (valid) => {
        if(valid) {
            console.log(type);
            elFun.sendVerificationCode(type)
        }
    })
} 

const phonehide = (phone) => {
    // 手机号做脱敏处理
    let reg = /^(1[3-9][0-9])\d{4}(\d{4}$)/; // 定义手机号正则表达式
    phone = phone.replace(reg, '$1****$2');
    return phone; // 输出为131****1234

};

const emailHide = (email) => {
    let splitted = email.split('@');
    let email1 = splitted[0];
    let email2 = splitted[1];
    let avg = email1.length / 2;

    email1 = email1.substring(0, email1.length - avg);
    return `${email1 }***@${ email2}`; // 输出为11223***@qq.com
}

watch(
    () => props.accountDetailData,
    (val) => {
        if (val) {
            formParams.phone = val.accountInfoDto.mobile;
            formParams.email = val.accountInfoDto.email;
            larkId.value = val.accountInfoDto.larkId;
        }
    },
    {
        immediate: true
    }
);

watch(
    () => props.visible,
    (val) => {
        if (val) {
            step.value = 0;
            formParams.phone = props.accountDetailData.accountInfoDto.mobile;
            formParams.email = props.accountDetailData.accountInfoDto.email;
            formParams.code = '';
            formParams.pwd = '';
            formParams.repwd = '';
            errorMsg.value = '';
            stepSendPhoneCode.value.clear();
            stepSendEmailCode.value.clear();
        }
    },
    {
        immediate: true
    }
);
</script>
<style lang="scss" scoped>
p{
    margin: 0;
    padding: 12px 0;
}
.edit-dialog {
    .footer-box{
        height: 30px;
    }
    &-verify-ul {
        margin: 12px 0 0;
        padding: 0;
        li {
            list-style: none;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #F5F7FA;
            padding: 18px 12px;
            margin-bottom: 2px;
            cursor: pointer;
            color: #303133;
            .verify-type {
                font-size: 24px;
                color: #4285F2;
                margin-bottom: 2px;
                margin-right: 8px;
            }
            p{
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
            }
            .custom-a-Property1arrow-rightProperty2linear {
                color: #A8ABB2;
                margin-left: 14px;
                font-size: 14px;
            }
        }
        &-box{
            display: flex;
            align-items: center;
        }
        &-phone, &-email{
            color: #303133;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 310px;
            display: inline-block;
            text-align: right;
            line-height: 16px;
        }
    }
    .custom-input{
        width: 334px;
        height: 42px;
        line-height: 42px;
        color: #333;
        &::placeholder{
            font-size: 14px;
        }
    }
}
</style>