<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-07-10 15:13:46
 * @LastEditTime: 2020-08-04 21:47:06
 * @LastEditors: niumkiki
 -->
<style lang="scss" scoped>
@import "~@/styles/moduleScss/login/login";
</style>

<template>
    <div class="login">
        <!-- 登录 -->
        <div @keydown.enter="handleSubmit"
             :style="isCustomEdition === 'customFor_11802' ? `background: url(${customEditionConfig[isCustomEdition].loginBgUrl}) center/cover;` : ''"
             :class="{ 'login-upgrading': isUpgrade, 'loginPageCustomFor_11082': isCustomEdition === 'customFor_11802' }"
             class="login-container">
            <div class="login-top">
                <!-- 公司logo -->
                <div class="login-icon">
                    <!-- 新窗口打开官网 -->
                    <h1>
                        <a v-if="!['customFor_12200'].includes(isCustomEdition)" :href="xhlUrl" target="_blank">
                            <!-- 定制版 logo -->
                            <template v-if="isCustomEdition">
                                <img :src="customEditionConfig[isCustomEdition].logoUrl" style="height: 40px;"/>
                            </template>
                            <!-- 非定制版 logo -->
                            <template v-else>
                                <span v-if="getLang" class="custom custom-logo-zh-new"></span>
                                <span v-else class="custom custom-logo-en-new" style="font-size: 24px"></span>
                            </template>
                        </a>
                        <img v-else :src="customEditionConfig[isCustomEdition].logoUrl" style="height: 120px;"/>
                    </h1>
                </div>
                <div class="lang_box" v-if="!['customFor_12200'].includes(isCustomEdition)">
                    <Poptip trigger="hover"
                        placement="top"
                        ref="poptip">
                        <img style="width:150px;height:173px" :src="require('@/assets/images/appcode.png')" alt="">
                        <span slot="reference" class="login__down-load-app">{{ $t('login.DownloadLeadsCloud') }}</span>
                    </Poptip>
                    <span class="login_chart" v-if="getLang" @click="handleSwitch('en-US')">English</span>
                    <span class="login_chart" v-else @click="handleSwitch('zh-CN')">中文</span>
                </div>
            </div>
            <div v-if="!isUpgrade">
                <!-- <div class="frosted-glass"></div> -->
                <div class="login-body">
                    <!-- 左侧轮播图 -->
                    <div class="carousel-box">
                        <loginSwiper/>
                    </div>
                    <!-- 右侧登陆 -->
                    <div class="login-box">
                        <div class="form-con">
                            <div class="login-title">
                                <!-- 扫码登陆还未有,待后续开发 -->
                                <!-- <div :class="[isQRcode?'QRtitle active':'QRtitle']" @click="changedLoginMethod('isQRcode')">扫码登录</div> -->
                                <!-- <div :class="[!isQRcode?'unQRtitle active':'unQRtitle']" @click="changedLoginMethod('unisQRcode')">{{$t('login.loginHello3')}}</div> -->
                                <div class="unQRtitle" :class="{'active' : loginType === 'account'}" @click="seletLogin('account')">{{$t('login.loginHello3')}}</div>
                                <div  v-if="!['customFor_12200'].includes(isCustomEdition)" class="unQRtitle" :class="{'active' : loginType === 'phone'}" @click="seletLogin('phone')">{{$t('login.loginForPhone')}}</div>
                            </div>

                            <!-- 账号密码输入表单 -->
                            <div v-show="loginType === 'account'">
                                <formLogin ref="loginForm"
                                        @clearErrMsg="clearErrMsg"></formLogin>

                                <!-- 记住密码, 忘记密码 -->
                                <div class="margin-bottom-10">
                                    <!--记住我-->
                                    <Checkbox v-model="remembered"><span>{{$t('login.remember')}}</span></Checkbox>

                                    <!-- 忘记密码 -->
                                    <span @click="handleForgetPass"
                                        class="login__forget-pass float-right login__forget-pass-newCls">{{$t('login.forgetPass')}}</span>
                                </div>

                                <!-- 账号或密码错误提示 -->
                                <div class="login-tip">{{ errMsg }}</div>
                            </div>
                            <div v-show="loginType === 'phone'">
                                <div class="phoneLoginBox">
                                    <Form label-position="left"
                                        ref="phoneLoginForm"
                                        :model="phoneLoginForm"
                                        :rules="phoneLoginFormRules">
                                        <FormItem prop="phone">
                                            <ElInput v-model="phoneLoginForm.phone"
                                                @focus="clearPhoneLoginErrMsg"
                                                @input="codeInput('phone')"
                                                @change="codeInput('phone')"
                                                :maxlength="11"
                                                type="text"
                                                :placeholder="$t('login.phonePlaceholder')">
                                                <template slot="prepend" style="background: #fff">+ 86</template>
                                            </ElInput>
                                        </FormItem>
                                        <FormItem prop="code">
                                            <Input v-model="phoneLoginForm.code"
                                                @focus="clearPhoneLoginErrMsg"
                                                @input="codeInput('code')"
                                                @change="codeInput('code')"
                                                :maxlength="6"
                                                :placeholder="$t('login.codePlaceholder')">
                                                <Button :loading="getCaptchaLoading"
                                                    :disabled="!able_getCaptcha"
                                                    slot="append"
                                                    @click="getCaptcha"
                                                    style="color: #3B78DE; background-color: transparent; font-weight: normal;">{{ captchaBtnText }}</Button>
                                            </Input>
                                        </FormItem>
                                    </Form>
                                </div>
                                <div class="login-tip">{{ phoneLoginErrMsg }}</div>
                            </div>
                            <!-- 登录按钮 -->
                            <Button class="login-button" :class="`piwik-${loginType}-login`" type="primary" @click="handleSubmit" :loading="loading">
                                <span v-if="!loading">{{$t('login.loginBtn')}}</span>
                                <span v-else>{{$t('login.loginBtnLoading')}}</span>
                            </Button>

                            <!-- 同意《用户协议》、《隐私条款》，并接受询盘云的服务 -->
                            <div style="margin-top: 16px">
                                <Radio :value="isAgreed"
                                        label="1"
                                        @click.native.prevent="changeDisabled(isAgreed)"
                                        style="margin:0;">{{ "" }}</Radio>
                                <span style="margin-left:-9px;" class="userAgreement-privacyPolicy">{{
                                        $t('login.agree')
                                    }}<a :href="`${publicPath}leadscloudUserAgreement.html`"
                                        target="_blank">{{ $t('login.userAgreement') }}</a>{{
                                        $t('login.loginStatus')
                                    }}<a :href="`${publicPath}leadscloudPrivacyPolicy.html`"
                                        target="_blank">{{ $t('login.privacyPolicy') }}</a>{{ !['customFor_12200'].includes(isCustomEdition) ? $t('login.acceptTheService') : $t('login.acceptTheService12200') }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 系统升级中 -->
            <warningUpdate v-else></warningUpdate>
            <div class="login-bottom">
                <div class="urlListBox" v-if="!['customFor_12200'].includes(isCustomEdition)">
                    <a :href="item.url" target="_blank" v-for="(item, index) in urlList" :key="index">{{$t(`login.url${index+1}`)}}</a>
                    <a href="javascript:void(0)" id="leadscloudAdvisory">{{$t('login.url5')}}</a>
                </div>
                <div class="beianMiit">
                    <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">京ICP备17009200号-10</a>
                </div>
            </div>
        </div>

        <!-- 安全校验 -->
        <SecurityVerification :visible.sync="visible_security"
                              :formData="formData"
                              :verifyLogRes="verifyLogRes"
                              @verifySuccess="handleVerifySuccess"></SecurityVerification>
        <Modal
            :visible="visible"
            :title="$t('login.tipsTitle')"
            :show-close="true"
            append-to-body
            width="447px"
            style="margin-top: 20vh"
            @close="visible = false"
            class="modal login-modal">
                <span class="userAgreement-privacyPolicy">
                    {{$t('login.tipsinfo')}}
                    <a :href="`${publicPath}leadscloudUserAgreement.html`"
                        target="_blank">{{ $t('login.userAgreement') }}</a>{{$t('login.tipsinfo2')}}<a :href="`${publicPath}leadscloudPrivacyPolicy.html`"
                        target="_blank">{{ $t('login.privacyPolicy') }}</a>
                </span>
                <div slot="footer">
                    <Button  @click="visible = false">{{$t('clue.cancel')}}</Button>
                    <Button type="primary" @click="checkUserAgreement" class="high-seas-claim-leads">{{$t('login.agree')}}</Button>
                </div>
        </Modal>
    </div>
</template>

<script>
    // 引入登陆页面的swiper组件
    const loginSwiper = () => import('./login-template/login-swiper.vue');
    const SecurityVerification = () => import('./securityVerification.vue');
    import Cookies from 'js-cookie';
    import util from '../../libs/util';
    import { mapState, mapGetters } from 'vuex';
    import formLogin from './login-template/form-login';
    const warningUpdate = () => import('./login-template/warning-update');
    import { debounce } from 'lodash';

    import { userpass, signRsa } from '@/utils/safe';
    import { getPhoneLoginCode, phoneLogin } from '@/api/login';
    import Utils from '@/utils/index';

    export default {
        components: {
            formLogin,
            warningUpdate,
            loginSwiper,
            SecurityVerification
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                biHttp: 'biHttp',
                bi_report_menu: 'bi_report_menu',
                lang: state => state.app.lang,
                isUpgrade: 'isUpgrade',
                router_map: state => state.app.router_map,
                is_marketing_station: state => state.app.is_marketing_station,
                customEditionConfig: 'customEditionConfig',
                version: 'version'
            }),
            ...mapGetters([
                'isCustomEdition'
            ]),
            getLang() {
                if (this.lang === '') {
                    return (localStorage.getItem('LANG') || Cookies.get('LANG')) !== 'en-US';
                } else {
                    return this.lang !== 'en-US';
                }
            },
            rules() {
                return {
                    userName: [
                        { required: true, message: this.$t('login.usernameTip'), trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: this.$t('login.passwordTip'), trigger: 'blur' }
                    ]
                };
            },
            // 禁用登陆按钮
            disabled() {
                return this.isAgreed !== '1';
            }
        },
        data() {
            return {
                // 静态资源文件地址
                publicPath: process.env.BASE_URL,

                isAgreed: localStorage.getItem('isAgreed'), // 勾选协议的阈值
                xhlUrl: 'https://www.leadscloud.com/', // 跳转到官网的url
                // videoSrc1: require('../../../public/video/bg2.0.mp4'), // 背景视频1
                // 显示QRcode还是账号密码登陆
                // isQRcode: false,
                // 账号密码错误或权限问题的提示
                errMsg: '',

                remembered: false,
                // loginIcon: '../../images/loginIcon.png',
                loading: false,
                form: {
                    userName: '',
                    password: ''
                },
                upgradeTimer: '',

                // 安全校验相关
                formData: {},
                verifyLogRes: {},
                visible_security: false,
                visible: false,
                loginType: 'account',
                phoneLoginForm: {
                    phone: '',
                    code: ''
                },
                phoneLoginFormRules: {
                    phone: [
                        { validator: this.validePhone, trigger: 'blur' }
                    ],
                    code: [
                        { validator: this.valideVerificationCode, trigger: 'blur' }
                    ]
                },
                getCaptchaLoading: false,
                able_getCaptcha: true, // 获取验证码按钮是否可以点击
                captchaBtnText: this.$t('per_setting.getPhoneCodeText'),
                waitTime: 60,
                timer: null,
                unbindModel: false,
                isGetCaptcha: false,
                phoneLoginErrMsg: '',
                urlList: [
                    { title: this.$t('login.url1'), url: 'https://www.leadscloud.com/' },
                    { title: this.$t('login.url2'), url: 'https://www.leadscloud.com/about-us/company/' },
                    { title: this.$t('login.url3'), url: 'https://www.leadscloud.com/about-us/contact-us/' },
                    { title: this.$t('login.url4'), url: 'https://www.leadscloud.com/products/marketing-crm/' }
                ]
            };
        },
        methods: {
            // 改变登陆方式   app还未有扫码功能,待后续开发
            // changedLoginMethod(type) {
            //     // eslint-disable-next-line no-unused-expressions
            //     type === 'isQRcode' ? this.isQRcode = true : this.isQRcode = false;
            // },
            checkUserAgreement() {
                this.isAgreed = '1';
                this.visible = false;
                localStorage.setItem('isAgreed', this.isAgreed);
                this.handleSubmit();
            },
            // 登陆按钮false时可以点击
            changeDisabled(event) {
                this.isAgreed = event === '1' ? '0' : '1';
                localStorage.setItem('isAgreed', this.isAgreed);
            },
            // 进入登陆页面时将所有的$Message清除掉
            clearAllInit() {
                this.$Message.closeAll();
                this.$Notice.closeAll();
            },
            // 清除
            clearErrMsg() {
                // 清除密码错误或账号权限的文字
                if (this.errMsg) {
                    this.errMsg = '';
                }
            },
            // 每10分钟调一次接口，若接口正常，自动改为登陆界面
            handleTimerUpdate() {
                // 清除定时
                if (this.upgradeTimer) {
                    clearInterval(this.upgradeTimer);
                }
                // 设置定时
                this.upgradeTimer = setInterval(() => {
                    this.handleUpdate();
                }, 600000);
            },
            // 刷新页面调接口判断返回是否正常，若该接口code码返回406, 则显示正在升级中
            handleUpdate() {
                util.ajax({
                    url: '/cuss-login/status/health',
                    method: 'GET'
                }).then(res => {
                    if (res.data === 1) {
                        if (this.isUpgrade) {
                            this.$store.commit('setIsUpgrade', false);
                        }
                    }
                });
            },
            /**
             * @Date: 2020-04-29 13:52:07
             * @LastEditors: niumkiki
             * @description: 增加忘记密码需求
             * @param:
             * @return:
             */
            handleForgetPass() {
                // 点击忘记密码：在当前窗口跳转至忘记密码页面
                this.$router.push({
                    path: '/login/forgetPwd',
                    name: 'forgetPwd'
                }).catch((err) => {
                    throw new Error(`Problem handling something: ${err}.`);
                });
            },
            compareName(origin, password) {
                const store = userpass.getInfo();
                return origin === store.account && store.password === password;
            },
            handleSubmit: debounce(function() {
                // 如果未勾选隐私协议,则需要有个提示信息
                if (this.loginType === 'account') {
                    if (!this.$refs.loginForm) return false;
                    this.$refs.loginForm.validate((valid) => {
                        if (!valid) {
                            this.errMsg = '请输入账号或密码';
                            return;
                        };
                        if (valid) {
                            if (this.disabled) {
                                this.visible = true;
                                // this.loading = false;
                                return false;
                            }
                            this.loading = true;
                            const params = this.$refs.loginForm.getForm();
                            if (!this.compareName(params.userName, params.password)) {
                                params.password = signRsa.encrypted(params.password);
                            }
                            // userpass.setInfo(params.userName, params.password);
                            // return;

                            /* 获取/生成浏览器 ID */
                            // 解析 localStorage 得到 id 数据
                            let idData = {};
                            try {
                                idData = JSON.parse(localStorage.getItem('xhl_dId')) || {};
                            } catch (e) {
                            }
                            if (idData[params.userName]) {
                                // localStorage 有值, 直接取

                                params.deviceInfo = idData[params.userName];
                            } else {
                                // localStorage 无值, 生成新值加到参数中, 待登录成功后追加到 localStorage

                                params.deviceInfo = `${params.userName}-${Date.now()}`;
                            }

                            // 发送请求
                            util.ajax({
                                url: '/cuss-login/login',
                                //   url: '/cuss-login-privilege/login',
                                method: 'post',
                                data: params
                            }).then(async response => {
                                // 清除账号密码错误等信息
                                this.clearErrMsg();
                                if (response.data.code === '1') {
                                    if (this.disabled) {
                                        this.visible = true;
                                        this.loading = false;
                                        return false;
                                    } else {
                                        this.handleLoginSuccess(response.data.data, params);
                                    }
                                } else {
                                    switch (response.data.code) {
                                        case '0':
                                            this.errMsg = this.$t('login.logErrTips');
                                            break;
                                        case '-1':
                                            this.errMsg = this.$t('login.logErrTips1');
                                            break;
                                        case '-2':
                                            this.errMsg = this.$t('login.logErrTips2');
                                            break;
                                        case '-3':
                                            this.errMsg = this.$t('login.logErrTips3');
                                            break;
                                        case '2':
                                            // 需要安全校验
                                            setTimeout(() => {
                                                this.$Message.warning(this.$t('login.logErrTips4'));
                                            }, 0);
                                            this.handleSecurityVerify(response.data.data, params);
                                            break;
                                    }

                                    this.loading = false;
                                }
                                /**
                                 * @Description: bug描述：切换账号登陆，查看下属邮件记忆了上个账号勾选的内容 --【ID1006234】
                                 *              Bug原因：退出账号时，存储在vuex中的数据未重置完成
                                 *              解决方案：账号登录成功时，将该值置为初始值。
                                 * @author 杨娣
                                 * @date 2020/6/6
                                */
                                this.$store.commit('setCurrentAccountIds', []);
                                localStorage.removeItem('leadsCloud-globalSearchKeyWords');
                            }).catch(error => {
                                // Network Error
                                // time out
                                this.loading = false;
                                console.log('login time out error', error);
                            });
                        }
                    });
                } else {
                    this.$refs.phoneLoginForm.validate((valid) => {
                        if (valid) {
                            if (this.disabled) {
                                this.visible = true;
                                return false;
                            }
                            this.loading = true;
                            phoneLogin({
                                phone: this.phoneLoginForm.phone,
                                code: this.phoneLoginForm.code
                            }).then(res => {
                                if (res.code === '1') {
                                    this.handleLoginSuccess(res.data, this.phoneLoginForm);
                                    localStorage.setItem('loginPhone', this.phoneLoginForm.phone);
                                } else {
                                    // this.$Message.error(res.message);
                                    if (res.message === '验证码错误或失效，请重新输入!') {
                                        this.phoneLoginErrMsg = this.$t('login.logErrTips5');
                                    } else {
                                        this.phoneLoginErrMsg = res.message;
                                    }
                                    this.loading = false;
                                }
                            });
                        }
                    });
                }
            }, 200),
            // 登录成功回调
            handleLoginSuccess(userData, formData) {
                // 如果登陆的账号有超管权限,添加超管权限到localStorage
                if (userData.superAdmin) {
                    localStorage.setItem('isSuperAdmin', Boolean(userData.superAdmin));
                }
                // 更新 localStorage 中的设备 id 数据
                const idData = localStorage.getItem('xhl_dId') ? JSON.parse(localStorage.getItem('xhl_dId')) : {};
                if (formData.deviceInfo) {
                    idData[formData.userName] = formData.deviceInfo;
                } else {
                    delete idData[formData.userName];
                }
                localStorage.setItem('xhl_dId', JSON.stringify(idData));
                this.$store.state.app.pageOpenedList = [];

                // 删除旧有所有 domain 的 cookie (admin.leadscloud.com, .leadscloud.com 有时会同时存在, 删除时只删除了一个后会出现问题)
                const tmpDomainArr = document.domain.split('.');
                for (let i = 0; tmpDomainArr.length >= 2; i++) {
                    const attrs = {
                        domain: `${i === 0 ? '' : '.'}${tmpDomainArr.join('.')}`
                    };
                    tmpDomainArr.shift();

                    Cookies.remove('accId', attrs);
                    Cookies.remove('token', attrs);
                    Cookies.remove('fullName', attrs);
                    Cookies.remove('userName', attrs);
                    Cookies.remove('userId', attrs);
                    Cookies.remove('agentOrgList', attrs);
                    Cookies.remove('enterpriseId', attrs);
                    Cookies.remove('initMenu', attrs);
                    Cookies.remove('relatedAccounts', attrs);
                    Cookies.remove('notChatWithOther', attrs);
                }
                // 设置 cookie
                Cookies.set('accId', userData.accId);
                Cookies.set('token', userData.token);
                Cookies.set('fullName', encodeURI(userData.fullName));
                Cookies.set('userName', formData.userName ? formData.userName : userData.userName);
                Cookies.set('userId', userData.userId);
                Cookies.set('agentOrgList', userData.agentOrgList);
                Cookies.set('enterpriseId', userData.orgId);
                // 设置关联账号
                Cookies.set('relatedAccounts', Array.isArray(userData.relatedOrgList) ? userData.relatedOrgList : []);

                this.$store.commit('setUserName', formData.userName ? formData.userName : userData.userName);
                this.$store.commit('setFullName', userData.fullName);
                this.$store.commit('setUserId', {
                    userId: userData.userId,
                    accId: userData.accId
                });
                this.$store.commit('setEnterpriseId', userData.orgId);
                if (`${userData.orgId}` === '11471') {
                    this.$store.commit('setVersion', 'WAPersonalEdition');
                }
                this.$store.commit('setRelatedAccounts', Array.isArray(userData.relatedOrgList) ? userData.relatedOrgList : []);
                this.getMenu(userData.userId, userData.orgId);
                // 获取工商联想数据的开启状态
                localStorage.setItem('XHLLogin', 'LOGIN');
                // 异地登录提醒, 前端做了 demo 后端未做, 先注释掉, 后续排期了再解注继续做
                // if (true) {
                //     const location = '河北';
                //     const create = this.$createElement;
                //     const loginWarnPannel = this.$Notice({
                //         title: '异地登录提醒',
                //         position: 'bottom-right',
                //         showClose: false,
                //         duration: 0,
                //         customClass: 'loginWarnPannel',
                //         message: create('div', null, [
                //             create('div', {
                //                 style: {
                //                     color: 'red',
                //                     padding: '20px 0 5px 0'
                //                 }
                //             }, `您上次登录的地址为：${location}`),
                //             create('div', null, [
                //                 '如果不是您本人的操作，建议您立即',
                //                 create('a', {
                //                     on: {
                //                         click: () => {
                //                             this.$router.push({
                //                                 path: 'personal-set'
                //                             }, () => {
                //                                 loginWarnPannel.close();
                //                             });
                //                         }
                //                     }
                //                 }, '修改密码》')
                //             ]),
                //             create('br'),
                //             create('Button', {
                //                 props: {
                //                     type: 'primary'
                //                 },
                //                 on: {
                //                     click: () => {
                //                         loginWarnPannel.close();
                //                     }
                //                 }
                //             }, this.$t('login.ForgetPwd.Iknow'))
                //         ])
                //     });
                // }

                /* 记住我 */
                if (this.remembered) {
                    localStorage.setItem('xhl_remember_me', 'true');
                    userpass.setInfo(formData.userName, formData.password);
                } else {
                    localStorage.removeItem('xhl_remember_me');
                }

                // 初始化聊天相关
                this.$store.state.personSubscribes = {};
                this.$store.state.isServerOnlineChecked = false;
            },
            // 进入安全校验流程
            handleSecurityVerify(loginRes, formData) {
                this.formData = formData;
                this.verifyLogRes = loginRes;
                this.visible_security = true;
            },
            // 安全校验成功
            handleVerifySuccess(userData) {
                this.handleLoginSuccess(userData, this.formData);
            },
            getMenu(userId, enterpriseId) {
                util.ajax({
                    url: '/new-privilege/merge/getMenuHomePage',
                    method: 'GET',
                    params: {
                        userId,
                        orgId: enterpriseId
                    }
                }).then(({ data }) => {
                    if (data.code === '1') {
                        Cookies.set('initMenu', '0');
                        // 菜单设置
                        /** 获取BI报表的 Path相对的url */
                        const BI_url_Obj = {};
                        this.get_url_List(data.data.getMenu.menuList, BI_url_Obj);
                        this.$store.commit('set_BI_urlList', Object.assign(this.bi_report_menu, BI_url_Obj));
                        // 处理原始数据, 更新 vuex menuList (平铺数组), 更新 vuex roleMenu (原始数据)并存入 localStorage , 更新 vuex router_map (添加动态路由 + 给左侧目录使用)
                        this.$store.commit('set_menu_list', data.data.getMenu.menuList);
                        /**
                         *  首页设置
                         *  如果是 wa 版本, 不允许设置首页, 直接设置为 wa 聊天
                         * */
                        let homeName = '';
                        if ((`${enterpriseId}` === '11471')) {
                            homeName = 'whatsapp_chat';
                        } else {
                            homeName = data.data.getHomePage !== '' ? data.data.getHomePage : this.is_marketing_station ? 'home_index' : 'mail_home';
                        }
                        this.$router.push({
                            name: homeName
                        });
                        this.$store.commit('setHomeName', homeName);
                        Cookies.set('HOMEPAGE', homeName);
                    } else {
                        this.$Message.error(this.$t('main.getMenu'));
                    }
                });
            },
            /** 递归遍历menulist,获取BI报表的 Path相对的url */
            get_url_List(menuList, urlObj) {
                menuList.forEach(menu => {
                    if (menu.path.includes('bi_report_')) { urlObj[menu.path] = this.biHttp + menu.href; }
                    if (menu.children && menu.children.length > 0) { this.get_url_List(menu.children, urlObj); }
                });
            },
            handleSwitch: debounce(function(lang) {
                // 清空密码错误或账号权限问题的提示
                this.clearErrMsg();
                this.$store.commit('switchLang', lang);
                localStorage.setItem('LANG', lang);

                this.$store.state.sourceDocumentTitle = this.$t('leads');
                window.parent.document.title = this.$t('leads');
                this.$refs.phoneLoginForm.clearValidate();
                if (this.phoneLoginForm.phone === '' && this.phoneLoginForm.code === '') {
                    this.$refs.phoneLoginForm.resetFields();
                }
                if (this.timer) {
                    this.captchaBtnText = `${this.$t('per_setting.getPhoneCodeText1')}(${this.waitTime})`;
                } else {
                    if (this.isGetCaptcha) {
                        this.captchaBtnText = this.$t('per_setting.getPhoneCodeText1');
                    } else {
                        this.captchaBtnText = this.$t('per_setting.getPhoneCodeText');
                    }
                }
                //                alert(window.parent.document.title);
            }, 200),
            seletLogin(type) {
                if (this.loading) return;
                this.loginType = type;
                localStorage.setItem('loginType', type);
            },
            codeInput(type) {
                this.phoneLoginForm[type] = this.phoneLoginForm[type].replace(/[^\d]/g, '');
            },
            // 获取验证码
            getCaptcha() {
                // 数据存在校验
                if (!this.phoneLoginForm.phone || this.phoneLoginForm.phone.length !== 11) {
                    this.$Message.error(this.$t('per_setting.err_phoneFormat'));
                    return;
                }
                const telReg = Utils.regExp.tell;
                if (!telReg.test(this.phoneLoginForm.phone)) {
                    this.$Message.error(this.$t('per_setting.err_phoneFormat'));
                    return;
                }
                // 验证通过后
                this.able_getCaptcha = false;
                this.getCaptchaLoading = true;
                // 发送验证码
                getPhoneLoginCode({
                    phone: this.phoneLoginForm.phone,
                    lang: this.lang
                }).then(res => {
                    this.getCaptchaLoading = false;
                    if (res.code === '1') {
                        this.isGetCaptcha = true;
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
                    } else if (res.code === '2') {
                        this.able_getCaptcha = true;
                        this.phoneLoginErrMsg = this.$t('login.security.err_SMSCount');
                    } else {
                        this.able_getCaptcha = true;
                        if (res.message === '离职人员禁止登录!' || res.message === '您的账号已被锁定,禁止登录!如想登录,请联系企业管理员!') {
                            this.phoneLoginErrMsg = this.$t('login.logErrTips1');
                        } else if (res.message === '使用期限已到,禁止登录!如想登录,请联系企业管理员!') {
                            this.phoneLoginErrMsg = this.$t('login.logErrTips3');
                        } else if (res.message === '手机号未绑定询盘云账号,请在<个人设置>绑定后重试') {
                            this.phoneLoginErrMsg = this.$t('login.phoneUnbindTip');
                        } else {
                            this.phoneLoginErrMsg = res.message;
                        }
                        // this.$Message.error(res.message);
                    }
                });
            },
            // 校验手机号
            validePhone(rule, value, callback) {
                if (!value || value.length !== 11) {
                    callback(new Error(this.$t('per_setting.err_phoneFormat')));
                } else {
                    const telReg = Utils.regExp.tell;
                    if (!telReg.test(value)) {
                        callback(new Error(this.$t('per_setting.err_phoneFormat')));
                    } else {
                        callback();
                    }
                }
            },
            // 校验验证码
            valideVerificationCode(rule, value, callback) {
                if (!value || value.length !== 6) {
                    callback(new Error(this.$t('per_setting.captchaFormatErro')));
                } else {
                    callback();
                }
            },
            clearPhoneLoginErrMsg() {
                this.phoneLoginErrMsg = '';
            },
            addQQScript() {
                // 生成 script 标签
                const QQScript = document.createElement('script');
                QQScript.id = 'qd235504272615586555061300a09212d6adec1afab5';
                QQScript.src = 'https://wp.qiye.qq.com/qidian/2355042726/15586555061300a09212d6adec1afab5';

                // 追加 script 标签
                const parentNode = document.getElementById('leadscloudAdvisory').parentNode;
                parentNode.append(QQScript);

                // script 标签加载完成后显示组件, 去掉 script 标签
                QQScript.onload = () => {
                    this.scriptLoaded = true;
                    parentNode.removeChild(QQScript);
                };
            }
        },
        mounted() {
            // "记住我"相关信息处理
            if (localStorage.getItem('xhl_remember_me')) {
                this.remembered = true;
            } else {
                localStorage.removeItem('xhl_remember_me');
            }
            // 进入登陆页面时将所有的$Message清除掉
            this.clearAllInit();
            if (!['customFor_12200'].includes(this.isCustomEdition)) {
                this.addQQScript();
            }
            // 去掉"Google / Facebook 账号绑定失效 tip 已关闭"信息
            localStorage.removeItem('invalidMsgClosed');
            setTimeout(() => {
                this.handleUpdate();
                this.handleTimerUpdate();
            }, 200);
        },
        created() {
            if (localStorage.getItem('loginType')) {
                this.loginType = localStorage.getItem('loginType');
            }
            if (localStorage.getItem('loginPhone')) {
                this.$set(this.phoneLoginForm, 'phone', localStorage.getItem('loginPhone'));
            }
            // 进入到了正常版询盘云登录页, 故清除掉 wa 个人版 cookie
            Cookies.remove('leadsCloudVersion');
            if (!this.version.startsWith('customFor_')) {
                this.$store.commit('setVersion', '');
            }

            // 进入登陆页面时将所有的$Message清除掉
            this.clearAllInit();
            this.$store.commit('updateIsModeRead', true);
            localStorage.setItem('XHLLogin', 'LOGOUT');

            // 清除 localStorage 中的"当前已打开标签页数组"
            this.$store.commit('clearTimerUpdateSeq');
            localStorage.removeItem('openedWindowList');
            // 清除本地保存的邮件接口请求判断数据
            localStorage.removeItem('XHLMailUrl');

            // 关闭 websocket 链接
            this.$store.commit('closeWS');

            // 如果sessionStorage中有resetPwdForm信息，则需要删除该值
            if (window.sessionStorage.getItem('resetPwdForm')) {
                window.sessionStorage.removeItem('resetPwdForm');
            }

            // 清空"新收邮件未读数统计数据"
            this.$store.commit('updateNewReceiveMails', {
                type: 'clear'
            });

            /* 处理"意外退出到登录界面"相关逻辑 */
            // 意外退出提示信息
            const quitMsg = localStorage.getItem('quitUnexpectedlyMsg');
            localStorage.removeItem('quitUnexpectedlyMsg');
            if (quitMsg) {
                setTimeout(() => {
                    this.$Message.error(quitMsg);
                }, 0);
            }
            // 意外退出提示信息
            const quitReason = localStorage.getItem('quitUnexpectedlyReason');
            localStorage.removeItem('quitUnexpectedlyReason');
            if (quitReason) {
                console.error('意外退出到登录页原因:');
                quitReason.split(';').forEach(item => {
                    if (item) {
                        console.error(item);
                    }
                });
            }
        },
        beforeDestroy() {
            if (this.upgradeTimer) {
                clearInterval(this.upgradeTimer);
                this.upgradeTimer = null;
            }
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }
    };
</script>

<style lang="less">
    @import '../../styles/common.less';
    .phoneLoginBox{
        padding-bottom: 24px;
        .el-form-item {
            margin-bottom: 25px;
        }
        .el-input-group__prepend {
            padding: 0 8px;
            color: #333;
            background: #fff;
        }
        .el-input__inner{
            height: 42px;
            line-height: 42px;
            color: #333;
            &::placeholder{
                font-size: 14px;
            }

        }
        .el-input__inner:focus,
        .el-input__inner:hover,
        .el-input.is-focus .el-input__inner:hover{
            border-color: #ff7b27;
            box-shadow: none;
        }
    }
</style>
<style lang="less" scoped>
/deep/ .el-dialog__body{
    padding: 14px 24px 30px 24px;
}
/deep/ .el-dialog__header {
    padding-left: 24px;
}

.loginPageCustomFor_11082 {
    .login-top, .carousel-box, .login-bottom {
        z-index: -1;
    }

    .login-body {
        justify-content: end;
    }
}
</style>
