<template>
    <div class="authorized-form">
        <div class="login-icon">
            <!-- 新窗口打开官网 -->
            <h1 style="margin-bottom: 50px;">
                <a :href="xhlUrl" target="_blank">
                    <span style="font-size: 40px;padding-top: 5px;color: #FF752A;" v-if="getLang" class="custom custom-logo-zh-new"></span>
                    <span style="font-size: 24px;padding-top: 5px;color: #FF752A;" v-else class="custom custom-logo-en-new"></span>
                </a>
            </h1>
        </div>

        <div class="unQRtitle" @click="seletLogin('account')">{{$t('login.loginHello3')}}</div>

        <!-- 登陆输入框等 -->
        <div class="login-input">
            <Form
                label-position="left"
                ref="authorizedPwd"
                :model="resetPwdForm"
                :label-width="'90px'"
                style="margin-bottom: 50px;"
                :rules="resetPwdFormRules">
                    <Input
                        style="margin-bottom: 20px;"
                        v-model="resetPwdForm.userName"
                        autocomplete="off"
                        :placeholder="$t('facebook.onekeyRelease.creatContent.account')">
                    </Input>
                    <!-- <FormItem prop="userName" label="账号">
                    </FormItem> -->
                    <Input
                        type="password"
                        :maxlength="20"
                        v-model="resetPwdForm.passWord"
                        :placeholder="$t('mailSetting.accountSetting.emailPassword')">
                    </Input>
                    <!-- <FormItem prop="passWord" label="密码">
                    </FormItem> -->
            </Form>
            <Button style="width: 100%;height: 42px;font-size: 18px;" type="primary" id="button" @click="authorizedLogin('authorizedPwd', true)">{{$t('callSms.authorizedLogin')}}</Button>
            <!-- @click="authorizedLogin('authorizedPwd', false)" -->
            <!-- <Button type="primary" id="cancelButton" >取消授权</Button> -->
        </div>
    </div>
</template>

<script>
    import util from '../../libs/util';
    import { signRsa } from '@/utils/safe';
    import Cookies from 'js-cookie';

    export default {
        data() {
            return {
                xhlUrl: 'https://www.leadscloud.com/', // 跳转到官网的url

                base_url: '',
                redirect_url: '', // 重定向地址

                // 表单信息
                resetPwdForm: {
                    userName: '',
                    passWord: ''
                },
                resetPwdFormRules: {
                    userName: [
                        { required: true, message: this.$t('login.usernameTip'), trigger: 'blur' }
                    ],
                    passWord: [
                        { required: true, message: this.$t('login.passwordTip'), trigger: 'blur' },
                        { max: 20, message: this.$t('login.ForgetPwd.captchaLengthErro'), trigger: 'blur' }
                    ]
                }
            };
        },
        computed: {
            getLang() {
                return localStorage.getItem('LANG') !== 'en-US';
            }
        },
        created() {
            const hash = window.location.hash;
            this.base_url = hash.split('?')[1];
            // 如果当前登陆了询盘云,则需要将询盘云账号回填
            if (Cookies.get('userName')) {
                this.resetPwdForm.userName = Cookies.get('userName');
            }
        },
        methods: {
            authorizedLogin(formName, boo) {
                // 校验规则
                this.$refs[formName].validate((valid) => {
                    if (!valid) {
                        console.log('校验未通过');
                        return false;
                    }
                    // 调接口
                    this.sendAjax(boo);
                });
                // console.error(this.resetPwdForm);
            },
            sendAjax(boo) {
                // https://obbcnibdgkffcadgdhfmclldghkochfh.chromiumapp.org/?access_token=9vTX0nWKm1i5c2r5h7TBz2jMt4Ml67UtTCe5Kr4Z_b535db00eca59be60798dc8086c70ea6&service_url=leadscloudtest.cx-tb.cinnox.com
                const redirect_url_arr = this.base_url.split('&');
                // console.error('this.base_url', this.base_url);
                // console.error('redirect_url_arr', redirect_url_arr);
                const { userName, passWord } = this.resetPwdForm;

                // 发送请求获取
                util.ajaxJson({
                    url: '/cuss-login/oauth/cinnox/accessToken',
                    method: 'post',
                    data: {
                        userName,
                        password: signRsa.encrypted(passWord),
                        deviceInfo: `${userName}-${Date.now()}`,
                        state: boo ? 'confirm' : 'cancel'
                    }
                }).then(response => {
                    const { code } = response.data;
                    if (code === '1') {
                        const { accessToken, serviceUrl } = response.data.data;
                        this.redirect_url = decodeURIComponent(`${redirect_url_arr[0].replace('redirect_uri=', '')}?access_token=${accessToken}&${redirect_url_arr[1]}&service_url=${serviceUrl}`);
                        window.location.href = this.redirect_url;
                    } else {
                        switch (code) {
                            case '0':
                                this.$Message.error(this.$t('callSms.failed'));
                                break;
                            case '-1':
                                this.$Message.error(this.$t('callSms.personnelProhibited'));
                                break;
                            case '-2':
                                this.$Message.error(this.$t('callSms.accountLocked'));
                                break;
                            case '-3':
                                this.$Message.error(this.$t('callSms.useHasExpired'));
                                break;
                            case '-4':
                                this.$Message.error(this.$t('callSms.passwordParsingError'));
                                break;
                            case '-5':
                                this.$Message.error(this.$t('callSms.thisUserDoesNotExist'));
                                break;
                            case '-6':
                                this.$Message.error(this.$t('callSms.notOpenedCinnoxService'));
                                break;
                            case '-7':
                                this.$Message.error(this.$t('callSms.authorizationFailed'));
                                break;
                            case '-8':
                                this.$Message.error(this.$t('callSms.wrongNamePassword'));
                                break;
                            case '-9':
                                this.$Message.error(this.$t('callSms.cinnoxDisablesAccount'));
                                break;
                            default:
                                this.$Message.error(response.data.message);
                        }
                        console.error('authorized login error', response.data);
                    }
                }).catch(error => {
                    console.log('authorized login error', error);
                });
            }
        }
    };
</script>

<style lang="less" scoped>
    .authorized-form {
        padding: 30px 60px;
        position: absolute;
        width: 460px;
        height: 460px;
        left: 50%;
        top: 50%;
        margin-top: -230px;
        margin-left: -200px;
        background: #FFFFFF;
        box-shadow: 0px 2px 16px #D6DCE6;
        border-radius: 12px;

        .login-input {
            /deep/ .el-input__inner {
                height: 42px;
                color: #333333;
            }
        }
    }
    .unQRtitle{
        margin-right: 30px;
        font-size: 20px;
        font-weight: 500;
        margin-bottom: 20px;
        cursor: pointer;
        // width: 56px;
        color: #333333;
    }
    .active {
        color: #FF752A;
        font-weight: 600;
    }
    // 点击切换登陆方式的伪类
    .QRtitle.active::after,.unQRtitle.active::after {
        display: block;
        content: '';
        height: 2px;
        background-color: #FF752A;
    }
</style>
