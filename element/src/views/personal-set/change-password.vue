<template>
    <div>
        <p class="accountInfoTile">{{$t('per_setting.basicInformation')}}</p>
        <div class="accountInfoBox" style="width:500px">
            <Form :model="nameForm" :rules="nameFormRules" ref="nameForm">
                <div class="accountInfoList">
                    <div class="accountInfo">
                        <p class="accountInfoListLable">{{$t('per_setting.name')}}</p>
                        <p class="accountInfoListText" v-if="!cnNameStatus">{{accountInfo.cnName}}</p>
                        <p class="accountInfoListText" v-if="cnNameStatus">
                            <FormItem style="margin-bottom:0" prop="cnName">
                                <ElInput :maxlength="300" v-model="nameForm.cnName" class="password-input"></ElInput>
                            </FormItem>
                        </p>
                    </div>
                    <p class="accountInfoListHandle">
                        <Button v-if="!cnNameStatus" type="text" style="color: #3B78DE; font-size: 14px" @click="edit('cnName')">{{$t('edit')}}</Button>
                        <span v-else>
                            <Button type="text" style="color: #3B78DE; font-size: 14px" @click="save('cnName')">{{$t('save')}}</Button>
                            <Button type="text" style="color: #3B78DE; font-size: 14px" @click="cnNameStatus = false">{{$t('cancel')}}</Button>
                        </span>
                    </p>
                </div>
                <div class="accountInfoList">
                    <div class="accountInfo">
                        <p class="accountInfoListLable">{{$t('per_setting.englishName')}}</p>
                        <p class="accountInfoListText"  v-if="!enNameStatus">{{accountInfo.enName}}</p>
                        <p class="accountInfoListText" v-if="enNameStatus">
                            <FormItem style="margin-bottom:0"  prop="enName">
                                <ElInput :maxlength="300" v-model="nameForm.enName" class="password-input"></ElInput>
                            </FormItem>
                        </p>
                    </div>
                    <p class="accountInfoListHandle">
                        <Button v-if="!enNameStatus" type="text" style="color: #3B78DE; font-size: 14px" @click="edit('enName')">{{$t('edit')}}</Button>
                        <span v-else>
                            <Button type="text" style="color: #3B78DE; font-size: 14px" @click="save('enName')">{{$t('save')}}</Button>
                            <Button type="text" style="color: #3B78DE; font-size: 14px" @click="enNameStatus = false">{{$t('cancel')}}</Button>
                        </span>
                    </p>
                </div>
                <div class="accountInfoList">
                    <div class="accountInfo">
                        <p class="accountInfoListLable">{{$t('per_setting.department')}}</p>
                        <p class="accountInfoListText">{{accountInfo.departmentName}}</p>
                    </div>
                </div>
            </Form>
        </div>
        <p class="accountInfoTile">{{$t('per_setting.accountSecurity')}}</p>
        <div class="accountInfoBox" style="width:500px">
            <div class="accountInfoList">
                <div class="accountInfo">
                    <p class="accountInfoListLable">{{$t('per_setting.workEmail')}}</p>
                    <p class="accountInfoListText">{{accountInfo.email}}</p>
                </div>
                <p class="accountInfoListHandle">
                    <Button type="text" style="color: #3B78DE; font-size: 14px" @click="bindEmailModelHandle(true)">{{$t('replace')}}</Button>
                </p>
            </div>
            <div class="accountInfoList">
                <div class="accountInfo">
                    <p class="accountInfoListLable">{{$t('per_setting.phoneNumber')}}</p>
                    <p class="accountInfoListText">{{accountInfo.mobile}}</p>
                </div>
                <p class="accountInfoListHandle">
                    <Button type="text" style="color: #3B78DE; font-size: 14px" @click="bindModelHandle(true)">{{$t('replace')}}</Button>
                </p>
            </div>
        </div>
        <Modal :visible.sync="bindModel"
           :append-to-body="true"
           :modal-append-to-body="false"
           :close-on-click-modal="false"
           :title="$t('per_setting.personalPhone')"
           @close="bindModelHandle(false)"
           width="494px"
           class="accountInfoModel">
            <Form :model="bindPhoneForm"
                label-position="left"
                :rules="bindPhoneValidate"
                ref="bindPhoneForm">
                <div class="bindPhoneFormTip">{{$t('per_setting.bindPhoneModalTipNew')}}</div>
                <FormItem prop="phone">
                    <ElInput v-model.trim="bindPhoneForm.phone"
                        @input="codeInput('phone')"
                        @change="codeInput('phone')"
                        :maxlength="11"
                        type="text"
                        :placeholder="$t('login.phonePlaceholder')">
                        <template slot="prepend" style="background: #fff">+ 86</template>
                    </ElInput>
                </FormItem>
                <FormItem prop="code">
                    <Input v-model.trim="bindPhoneForm.code"
                        @input="codeInput('code')"
                        @change="codeInput('code')"
                        :maxlength="6"
                        :placeholder="$t('per_setting.loginCaptchaTip')">
                        <Button
                            type="text"
                            :loading="getCaptchaLoading"
                            :disabled="!able_getCaptcha"
                            slot="suffix"
                            @click="getCaptcha('1')"
                            style="width: 100px; line-height: 18px; color: #3B78DE;border-left: #DEDFE6 solid 1px;">{{ captchaBtnText }}</Button>
                    </Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button @click="bindModelHandle(false)">{{ $t('cancel') }}</Button>
                <Button type="primary"
                    :loading="loading"
                    class="piwik_bindPhoneBtn"
                    @click="handleBind('phone')">{{ $t('confirm') }}</Button>
            </div>
        </Modal>
        <Modal :visible.sync="bindEmailModel"
           :append-to-body="true"
           :modal-append-to-body="false"
           :close-on-click-modal="false"
           :title="$t('per_setting.changeEmail')"
           @close="bindEmailModelHandle(false)"
           width="494px"
           class="accountInfoModel">
            <Form :model="bindEmailForm"
                label-position="left"
                :rules="bindEmailValidate"
                ref="bindEmailForm">
                <div class="bindPhoneFormTip">{{$t('per_setting.bindEmailModalTip')}}</div>
                <FormItem prop="email">
                    <ElInput v-model.trim="bindEmailForm.email"
                        :maxlength="300"
                        type="text"
                        :placeholder="$t('per_setting.inputEmail')">
                    </ElInput>
                </FormItem>
                <FormItem prop="code">
                    <Input v-model.trim="bindEmailForm.code"
                        @input="mailCodeInput('code')"
                        :placeholder="$t('per_setting.loginCaptchaTip')">
                        <Button
                            type="text"
                            :loading="getCaptchaLoading"
                            :disabled="!able_getCaptcha"
                            slot="suffix"
                            @click="getCaptcha('2')"
                            style="width: 100px; line-height: 18px; color: #3B78DE;border-left: #DEDFE6 solid 1px;">{{ captchaBtnText }}</Button>
                    </Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button @click="bindEmailModelHandle(false)">{{ $t('cancel') }}</Button>
                <Button type="primary"
                    :loading="loading"
                    @click="handleBind('email')">{{ $t('confirm') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import Utils from '@/utils/index';
    import { mapState } from 'vuex';
    import { userInfoByUserId } from '@/api/personal-set/index';

    export default {
        name: 'passwordSet',
        data() {
            return {
                loading: false,
                accountInfo: {},
                // 绑定手机号相关
                bindModel: false,
                bindPhoneForm: {
                    phone: '',
                    code: ''

                },
                bindPhoneValidate: {
                    phone: [
                        { validator: this.validePhone, trigger: 'blur' }
                    ],
                    code: [
                        { validator: this.valideVerificationCode, trigger: 'blur' }
                    ]
                },
                // 绑定邮箱相关
                bindEmailModel: false,
                bindEmailForm: {
                    email: '',
                    code: ''

                },
                bindEmailValidate: {
                    email: [
                        { validator: this.valideEmail, trigger: 'blur' }
                    ],
                    code: [
                        { validator: this.valideMailCode, trigger: 'blur' }
                    ]
                },
                able_getCaptcha: true, // 获取验证码按钮是否可以点击
                captchaBtnText: this.$t('per_setting.getPhoneCodeText'),
                waitTime: 60,
                timer: null,
                getCaptchaLoading: false,
                cnNameStatus: false,
                enNameStatus: false,
                nameForm: {
                    cnName: '',
                    enName: ''
                },
                nameFormRules: {
                    cnName: [
                        { required: true, message: this.$t('per_setting.nameEmpty'), trigger: 'blur' },
                        { validator: this.validatorTirm, trigger: 'blur' }
                    ],
                    enName: [
                        { required: true, message: this.$t('per_setting.enameEmpty'), trigger: 'blur' },
                        { validator: this.validatorTirm, trigger: 'blur' }
                    ]
                }
            };
        },
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                lang: state => state.app.lang
            })
        },
        methods: {
            getUserInfo() {
                userInfoByUserId({
                    userId: this.userId, // this.userId,
                    orgId: this.orgId // this.orgId
                }).then(res => {
                    if (res.code === 10000) {
                        this.accountInfo = res.data;
                    }
                });
            },
            // 关闭或打开绑定手机号弹窗
            bindModelHandle(type) {
                if (!type) {
                    this.bindPhoneForm = {
                        phone: '',
                        code: ''
                    };
                    this.$refs.bindPhoneForm.resetFields();
                    this.captchaBtnText = this.$t('per_setting.getPhoneCodeText');
                    if (this.timer) {
                        this.able_getCaptcha = true;
                        this.waitTime = 60;
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                }
                this.bindModel = type;
            },
            validePhone(rule, value, callback) {
                if (!value || value.length !== 11) {
                    callback(new Error(this.$t('per_setting.err_phoneFormat')));
                } else {
                    const telReg = Utils.regExp.tell;
                    if (!telReg.test(value)) {
                        callback(new Error(this.$t('per_setting.err_phoneFormat')));
                    } else {
                        if (value === this.accountInfo.mobile) {
                            callback(new Error(this.$t('per_setting.phoneRepeatTip')));
                        } else {
                            callback();
                        }
                    }
                }
            },
            // 前端校验邮箱验证码
            valideMailCode(rule, value, callback) {
                if (!value) {
                    callback(new Error(this.$t('per_setting.captchaFormatErro')));
                } else {
                    callback();
                }
            },
            // 前端校验手机验证码
            valideVerificationCode(rule, value, callback) {
                if (!value || value.length !== 6) {
                    callback(new Error(this.$t('per_setting.captchaFormatErro')));
                } else {
                    callback();
                }
            },
            codeInput(type) {
                this.bindPhoneForm[type] = this.bindPhoneForm[type].replace(/[^\d]/g, '');
            },
            mailCodeInput(type) {
                this.bindEmailForm[type] = this.bindEmailForm[type].replace(/[\W]/g, '');
            },
            handleBind(type) {
                if (type === 'phone') {
                    this.$refs.bindPhoneForm.validate((valid) => {
                        if (valid) {
                            this.loading = true;
                            this.$commonApi.verificationCode({
                                accountName: this.bindPhoneForm.phone,
                                accountType: 1,
                                password: this.bindPhoneForm.code,
                                passwordType: 2
                            }).then(data => {
                                if (data.code === 10000) {
                                    userInfoByUserId({
                                        id: this.accountInfo.id,
                                        operatorId: this.userId,
                                        orgId: this.orgId,
                                        mobile: this.bindPhoneForm.phone,
                                        personalSetFlag: true
                                    }, 'put').then(res => {
                                        if (res.code === 10000) {
                                            this.$set(this.accountInfo, 'mobile', this.bindPhoneForm.phone);
                                            this.bindModelHandle(false);
                                            this.$Message.success(this.$t('per_setting.phoneSaveSuccess'));
                                        } else {
                                            this.$Message.error(res.messageShow);
                                        }
                                        this.loading = false;
                                    });
                                } else {
                                    this.$Message.error(data.messageShow);
                                    this.loading = false;
                                }
                            });
                        }
                    });
                } else if (type === 'email') {
                    this.$refs.bindEmailForm.validate((valid) => {
                        if (valid) {
                            this.loading = true;
                            this.$commonApi.verificationCode({
                                accountName: this.bindEmailForm.email,
                                accountType: 2,
                                password: this.bindEmailForm.code,
                                passwordType: 3
                            }).then(data => {
                                if (data.code === 10000) {
                                    userInfoByUserId({
                                        id: this.accountInfo.id,
                                        operatorId: this.userId,
                                        orgId: this.orgId,
                                        email: this.bindEmailForm.email,
                                        personalSetFlag: true
                                    }, 'put').then(res => {
                                        if (res.code === 10000) {
                                            this.$set(this.accountInfo, 'email', this.bindEmailForm.email);
                                            this.bindEmailModelHandle(false);
                                            this.$Message.success(this.$t('per_setting.mailSaveSuccess'));
                                        } else {
                                            this.$Message.error(res.messageShow);
                                        }
                                        this.loading = false;
                                    });
                                } else {
                                    this.$Message.error(data.messageShow);
                                    this.loading = false;
                                }
                            });
                        }
                    });
                }
            },
            // 获取验证码
            async getCaptcha(type) {
                const data = {};
                if (type === '1') {
                    // 数据存在校验
                    if (!this.bindPhoneForm.phone || this.bindPhoneForm.phone.length !== 11) {
                        this.$Message.error(this.$t('per_setting.err_phoneFormat'));
                        return;
                    }
                    const telReg = Utils.regExp.tell;
                    if (!telReg.test(this.bindPhoneForm.phone)) {
                        this.$Message.error(this.$t('per_setting.err_phoneFormat'));
                        return;
                    }
                    if (this.bindPhoneForm.phone === this.accountInfo.mobile) {
                        this.$Message.error(this.$t('per_setting.phoneRepeatTip'));
                        return;
                    }
                    data.mobile = this.bindPhoneForm.phone;
                }
                if (type === '2') {
                    // 数据存在校验
                    if (!this.bindEmailForm.email) {
                        this.$Message.error(this.$t('per_setting.err_emailFormat'));
                        return;
                    }
                    const telReg = Utils.regExp.fullEmail;
                    if (!telReg.test(this.bindEmailForm.email)) {
                        this.$Message.error(this.$t('per_setting.err_emailFormat'));
                        return;
                    }
                    if (this.bindEmailForm.email === this.accountInfo.email) {
                        this.$Message.error(this.$t('per_setting.mailRepeatTip'));
                        return;
                    }
                    data.mailAddress = this.bindEmailForm.email;
                }
                // 验证通过后
                this.able_getCaptcha = false;
                this.getCaptchaLoading = true;
                let res;
                if (type === '1') {
                    res = await this.$commonApi.sendVerificationCodeByMobile(data);
                }
                if (type === '2') {
                    res = await this.$commonApi.sendVerificationCodeByEmail(data);
                }
                // 发送验证码
                this.getCaptchaLoading = false;
                if (res.code === 10000) {
                    // 发送成功  获取验证码60秒倒计时，不能点击按钮
                    // 定时器
                    if (this.timer) {
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                    this.timer = setInterval(() => {
                        this.waitTime--;
                        this.captchaBtnText = `${this.$t('per_setting.getPhoneCodeText1')}(${this.waitTime})`;
                        if (this.waitTime === 0) {
                            this.able_getCaptcha = true;
                            this.captchaBtnText = this.$t('per_setting.getPhoneCodeText1');
                            clearInterval(this.timer);
                            this.timer = null;
                            this.waitTime = 60;
                        }
                    }, 1000);
                    this.$Message.success(this.$t('login.security.sendCaptchaSuccess'));
                } else if (res.code === 10002) {
                    this.able_getCaptcha = true;
                    this.$Message.error(this.$t('login.security.err_SMSCount'));
                } else {
                    this.able_getCaptcha = true;
                    this.$Message.error(res.messageShow);
                }
            },
            // 验证邮箱格式
            valideEmail(rule, value, callback) {
                if (!value) {
                    callback(new Error(this.$t('per_setting.err_emailFormat')));
                } else {
                    const telReg = Utils.regExp.fullEmail;
                    if (!telReg.test(value)) {
                        callback(new Error(this.$t('per_setting.err_emailFormat')));
                    } else {
                        if (value === this.accountInfo.email) {
                            callback(new Error(this.$t('per_setting.mailRepeatTip')));
                        } else {
                            callback();
                        }
                    }
                }
            },
            bindEmailModelHandle(type) {
                if (!type) {
                    this.bindEmailForm = {
                        email: '',
                        code: ''
                    };
                    this.$refs.bindEmailForm.resetFields();
                    this.captchaBtnText = this.$t('per_setting.getPhoneCodeText');
                    if (this.timer) {
                        this.able_getCaptcha = true;
                        this.waitTime = 60;
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                }
                this.bindEmailModel = type;
            },
            edit(type) {
                this[`${type}Status`] = true;
                this.nameForm[type] = this.accountInfo[type];
            },
            validatorTirm(rule, value, callback) {
                if (!value.trim()) {
                    let errTip = '';
                    if (this.cnNameStatus) {
                        errTip = this.$t('per_setting.nameEmpty');
                    }
                    if (this.enNameStatus) {
                        errTip = this.$t('per_setting.enameEmpty');
                    }
                    callback(new Error(errTip));
                } else {
                    callback();
                }
            },
            save(type) {
                this.$refs.nameForm.validateField(type, (valid) => {
                    if (!valid) {
                        userInfoByUserId({
                            id: this.accountInfo.id,
                            operatorId: this.userId,
                            orgId: this.orgId,
                            [type]: this.nameForm[type],
                            personalSetFlag: true
                        }, 'put').then(res => {
                            if (res.code === 10000) {
                                if (type === 'cnName') {
                                    const currentTenant = JSON.parse(localStorage.getItem('current_tenant'));
                                    currentTenant.nickName = this.nameForm[type];
                                    localStorage.setItem('current_tenant', JSON.stringify(currentTenant));
                                }
                                this.$Message.success(this.$t(`per_setting.${type}SaveSuccess`));
                                this.$set(this.accountInfo, type, this.nameForm[type]);
                                this[`${type}Status`] = false;
                            } else {
                                this.$Message.error(res.messageShow);
                            }
                        });
                    }
                });
            }
        },
        created() {
            this.getUserInfo();
        },
        beforeDestroy() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }
    };
</script>

<style scoped lang="less">
    .accountInfoTile {
        margin-bottom: 20px;
        line-height: 26px;
        font-size: 16px;
        color: #303133;
        font-weight: 600;
    }
    .accountInfoBox {
        padding-bottom: 20px;
        .accountInfoList {
            display: flex;
            align-items: center;
            justify-content: space-between;
            line-height: 40px;
            font-size: 14px;
            color: #333;
            margin-bottom: 18px;
            .accountInfo {
                display: flex;
                align-items: center;
            }
            .accountInfoListLable {
                font-size: 12px;
                color: #606266;
            }
            .accountInfoListText{
                width: 260px;
            }
            .accountInfoListHandle {
                width: 100px;
            }
        }
    }
    .bindPhoneFormTip {
        margin-bottom: 12px;
        line-height: 22px;
        font-size: 14px;
        color: #303133;
    }
    .password-input {
        /deep/ .el-input__inner {
            padding-right: 50px;
        }

        /deep/ .password-input-overLength {
            color: #f56c6c;
        }
    }
    .accountInfoModel {
        /deep/ .el-dialog__header {
            padding: 24px 30px 10px;
            .el-dialog__title {
                font-size: 16px;
                color: #303033;
            }
            .custom-modal-close {
                color: #606266;
            }
        }
        /deep/ .el-dialog__body {
            padding: 10px 30px;
        }
        /deep/ .el-dialog__footer {
            padding: 10px 30px 24px;
        }
        /deep/ .el-form-item__content {
            width: 360px;
            line-height: 42px;
        }
        /deep/ .el-input-group__prepend{
            height: 42px;
            padding: 0 8px;
            background: #fff;
            color: #333;
        }
        /deep/ .el-input__inner {
            height: 42px;
        }
        .el-form-item{
            margin-bottom: 30px;
        }
    }
</style>
