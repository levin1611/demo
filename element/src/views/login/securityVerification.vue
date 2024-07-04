<!-- 安全验证弹框 -->
<template>
    <Modal :visible="visible"
           :show-close="false"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           :modal-append-to-body="false"
           fullscreen
           class="security-modal">
        <!-- 上方按钮及图标 -->
        <div class="width-100per clearfix">
            <span class='float-left'
                  style="color:#FF752A">
                <Icon v-if="lang === 'zh-CN'"
                      custom="custom custom-main-logo"
                      size="32"/>
                <Icon v-if="lang === 'zh-CN'"
                      custom="custom custom-logo-text"
                      size="20"/>
                <Icon v-else
                      custom="custom custom-logo-en"
                      size="36"
                      class="margin-left-10"/>
            </span>
            <span class='float-right'>
                <Button plain
                        type="primary"
                        size="small"
                        @click="$emit('update:visible', false)">{{ $t('login.security.loginBack') }}</Button>
            </span>
        </div>

        <!-- 安全验证表单 -->
        <div class="security-form-container">
            <!-- 标题 -->
            <div class="security-title">{{ $t('login.security.title_security') }}</div>
            <div class="security-tip">{{ $t('login.security.tip_security') }}</div>

            <!-- 表单 -->
            <Form label-position="left"
                  ref="verifyForm"
                  :model="verifyForm"
                  :rules="verifyFormRules">
                <!-- 登录名 -->
<!--                <FormItem prop="loginUserName"-->
<!--                          :label="$t('login.ForgetPwd.loginUserName')">-->
<!--                    <Input v-model="verifyForm.loginUserName"-->
<!--                           autocomplete="off"-->
<!--                           :placeholder="$t('login.ForgetPwd.loginUserNameTip')"></Input>-->
<!--                </FormItem>-->

                <!-- 电话 -->
                <FormItem prop="phoneNumber"
                          :label="$t('login.security.phoneNumber')">
                    <Input v-model="verifyForm.phoneNumber"
                           :disabled="true"
                           :maxlength="60"
                           :placeholder="$t('login.security.phoneNumber')"
                           readonly>
                        <Button :loading="loading_captchaBtn"
                                :disabled="!able_getCaptcha"
                                slot="append"
                                @click="getCaptcha"
                                :style="`color: ${able_getCaptcha ? '#3B78DE' : '#ccc'}`">{{ captchaBtnText }}</Button>
                    </Input>
                </FormItem>

                <!-- 验证码 -->
                <FormItem prop="captcha"
                          :label="$t('login.security.captcha')">
                    <Input v-model="verifyForm.captcha"
                           :maxlength="20"
                           :placeholder="$t('login.security.loginCaptchaTip')"></Input>
                </FormItem>

                <!-- 确认 -->
                <FormItem>
                    <Button :loading="loading"
                            @click="verifyConfirm"
                            style="font-size: 18px"
                            class="xhl-btn-long">{{ $t('login.security.confirm') }}</Button>
                </FormItem>
            </Form>

            <!-- 查看验证码帮助 -->
            <div class="captcha-help">
                <span>{{ $t('login.security.notReceiveCaptcha') }}</span>&nbsp;
                <span @click="captchaHelpVisible = true"
                      style="color:#3B78DE;cursor: pointer;">{{ $t('login.security.viewHelp') }}</span>
            </div>
        </div>

        <!-- 查看帮助弹框 -->
        <Modal :visible.sync="captchaHelpVisible"
               :title="$t('login.security.notReceiveCaptcha')"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :append-to-body="true"
               width="480px"
               custom-class="multiple-line-text"
               center>
            <div>{{ $t('login.security.notReceiveCaptchaTip') }}</div>

            <span slot="footer"
                  class="dialog-footer">
            <Button type="primary"
                    @click="captchaHelpVisible = false">{{ $t('login.security.known') }}</Button>
        </span>
        </Modal>
    </Modal>
</template>

<script>
    import Vue from 'vue';
    import Utils from '@/utils/index';
    import { getPhoneCaptcha, submitPhoneCaptcha } from '@/api/login';

    export default {
        name: 'securityVerification',
        props: {
            visible: Boolean,
            formData: {
                type: Object,
                required: true
            },
            verifyLogRes: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                // 全局 loading
                loading: false,

                // 语言
                lang: '',

                // 表单信息
                verifyForm: {
                    // loginUserName: '',
                    phoneNumber: '',
                    captcha: ''
                },
                verifyFormRules: {},

                // 帮助弹框
                captchaHelpVisible: false,

                // 验证码相关
                phoneErrFlag: false,
                able_getCaptcha: false, // 获取验证码按钮是否可以点击
                captchaBtnText: '',
                waitTime: 60,
                loading_captchaBtn: false,
                timerFlag: false,
                timer: null
            };
        },
        methods: {
            /* 接口 */
            // 获取验证码接口
            sendIdentifyingCode() {
                const { phoneNumber } = this.verifyForm;
                // 发送请求获取
                return getPhoneCaptcha({
                    orgId: this.verifyLogRes.orgId,
                    userId: this.verifyLogRes.userId,
                    phone: phoneNumber
                }).then(res => {
                    switch (res.code) {
                        case '1':
                            // 发送成功

                            this.$Message.success(this.$t('login.security.sendCaptchaSuccess'));
                            return true;
                        case '2':
                            // 发送失败 - 短信条数超额(30 分钟最多发 5 次)

                            this.$Message.error(this.$t('login.security.err_SMSCount'));
                            return false;
                        default:
                            // 默认失败

                            this.$Message.error(this.$t('login.security.err_sendSMS'));
                            return false;
                    }
                });
            },

            // 验证码验证
            verifyIdentifyingCode() {
                // 避免重复点击
                if (this.loading) {
                    return;
                }

                this.loading = true;
                const { captcha } = this.verifyForm;
                // 发送请求
                submitPhoneCaptcha({
                    orgId: this.verifyLogRes.orgId,
                    userId: this.verifyLogRes.userId,
                    code: captcha,
                    deviceInfo: this.formData.deviceInfo
                }).then(res => {
                    switch (res.code) {
                        case '1':
                            // 验证成功

                            // 向上传递接口返回的登录信息
                            this.$emit('verifySuccess', res.data);
                            break;
                        case '2':
                            // 验证码为空

                            this.$Message.error(this.$t('login.security.captchaEmpty'));
                            break;
                        case '3':
                            // 验证码错误或失效

                            this.$Message.error(this.$t('login.security.err_captcha'));
                            break;
                        case '0':
                            // 存在必填参数未填

                            this.$Message.error(this.$t('crm.InqSet.error_params'));
                            break;
                        default:
                            // 默认, 提示错误

                            this.$Message.error(this.$t('mail.writeLetter.addContactModal.requestErrorTip'));
                    }

                    // 取消 loading
                    if (res.code !== '1') {
                        this.loading = false;
                    }
                });
            },

            /* 表单验证 */
            // 验证电话
            validator_phone(rule, value, callback) {
                const telReg = Utils.regExp.fullPhone;

                if (!telReg.test(value)) {
                    this.phoneErrFlag = true;
                    callback(new Error(this.$t('login.security.err_phoneFormat')));
                } else {
                    this.phoneErrFlag = false;
                    callback();
                }
            },

            // 验证验证码
            validateCaptcha(rule, value, callback) {
                // 需要验证是否是纯数字
                const reg = /^\d+$/;

                if (!reg.test(value)) {
                    callback(new Error(this.$t('login.security.err_captchaFormat')));
                } else {
                    callback();
                }
            },

            /* 操作 */
            // 获取验证码
            async getCaptcha() {
                // 数据存在校验
                if (!this.verifyForm.phoneNumber) {
                    this.$Message.error(this.$t('login.security.err_emptyPhone'));
                    return;
                }

                // 验证通过后
                if (!this.phoneErrFlag) {
                    // 发送验证码
                    this.loading_captchaBtn = true;
                    const isSendCaptchaFlag = await this.sendIdentifyingCode();
                    this.loading_captchaBtn = false;

                    console.log('isSendCaptchaFlag', isSendCaptchaFlag);
                    if (isSendCaptchaFlag) {
                        // 获取验证码60秒倒计时，不能点击按钮
                        this.timerFlag = true;
                        this.able_getCaptcha = false;
                        this.captchaBtnText = this.$t('login.security.loadingCaptcha').replace('$seconds', this.waitTime);
                        // 定时器
                        if (this.timer) {
                            clearInterval(this.timer);
                        }
                        this.timer = setInterval(() => {
                            this.waitTime--;
                            this.captchaBtnText = this.$t('login.security.loadingCaptcha').replace('$seconds', this.waitTime);
                            if (this.waitTime === 0) {
                                this.able_getCaptcha = true;
                                this.captchaBtnText = this.$t('login.security.getCaptcha');
                                clearInterval(this.timer);
                                this.waitTime = 60;
                                this.timerFlag = false;
                            }
                        }, 1000);
                    }
                }
            },

            // 验证
            verifyConfirm() {
                // 校验规则
                this.$refs.verifyForm.validate((valid) => {
                    console.log('valid', valid);
                    if (!valid) {
                        console.log('校验未通过');
                        return false;
                    }
                    console.log('校验通过');
                    // 调接口
                    this.verifyIdentifyingCode();
                });
            }
        },
        beforeDestroy() {
            // 清除定时器
            if (this.timer) {
                clearInterval(this.timer);
            }
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        // 重置多语言, 避免中英文切换后相关提示语未切换
                        this.lang = Vue.config.lang;
                        this.captchaBtnText = this.$t('login.security.getCaptcha');
                        this.verifyFormRules = {
                            // loginUserName: [
                            //     { required: true, message: this.$t('login.ForgetPwd.loginUserNameEmpty'), trigger: 'blur' }
                            //     // { validator: this.validateUserNameAndEmail, trigger: 'blur' }
                            // ],
                            phoneNumber: [
                                { required: true, message: this.$t('login.security.err_emptyPhone'), trigger: 'blur' },
                                { validator: this.validator_phone, trigger: 'blur' }
                            ],
                            captcha: [
                                { required: true, message: this.$t('login.security.captchaEmpty'), trigger: 'blur' },
                                { max: 20, message: this.$t('login.security.err_captchaLength'), trigger: 'blur' }
                                // { validator: this.validateCaptcha, trigger: 'blur' }
                            ]
                        };

                        // 重置表单数据
                        this.verifyForm = {
                            // loginUserName: '',
                            phoneNumber: this.verifyLogRes.phone || '',
                            captcha: ''
                        };
                    } else {
                        if (this.timer) {
                            clearInterval(this.timer);
                        }
                    }
                }
            },
            verifyForm: {
                handler(val) {
                    // 电话有值时, 获取验证码的按钮才能点击
                    const telReg = Utils.regExp.fullPhone;

                    this.able_getCaptcha = val.phoneNumber && telReg.test(val.phoneNumber) && !this.timerFlag;
                },
                deep: true
            }
        }
    };
</script>

<style lang="less" scoped>
    .security-modal {
        background: #fff;
        width: 100%;
        height: 100%;
        overflow: hidden;

        /deep/ .el-dialog__header {
            display: none;
        }

        /deep/ .el-dialog__body {
            height: 100%;
            padding: 27px 30px;
            display: flex;
            flex-direction: column;
        }

        .security-form-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;

            margin: 0 auto;
            width: 510px;

            /deep/ .el-input__inner{
                height: 50px;
                padding-left: 16px;
                padding-right: 16px;
            }

            /deep/ .el-form-item__label {
                display: none;
            }

            /deep/ .el-input-group__append {
                .el-button{
                    background-color: #f5f7fa;
                    color: #3B78DE;
                    border-radius: 4px;
                    height:48px;

                    &:hover {
                        border-color: transparent;
                    }
                }
            }

            .el-button{
                height: 50px;
                border-radius: 4px;
                background-color: #FA8241;
                color: #ffffff;
                &:hover{
                    border-color: #FA8241;
                }
            }

            .security-title {
                font-size: 22px;
                line-height: 31px;
                color: #000;
                font-weight: 500;
                margin-bottom: 20px;
            }

            .security-tip {
                font-size: 12px;
                line-height: 17px;
                color: #000;
                margin-bottom: 30px;
            }

            .captcha-help {
                margin:0 auto;
                text-align: center;
                box-sizing: border-box;

                span {
                    font-size: 12px;
                }
            }
        }
    }
</style>

<style lang="less">
    .multiple-line-text {
        div {
            white-space: break-spaces;
            word-break : keep-all;
        }
    }
</style>
