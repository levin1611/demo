<template>
    <div style="width:100%" class="login-form" ref="loginFormRoom">
        <!-- 登陆输入框等 -->
        <div class="login-input">
            <div v-for="(item, index) in inputConfig"
                 :key="index"
                 class="input">
                <input v-model="form[item.val]"
                       ref="loginFormInput"
                       :type="item.type"
                       :name="item.name"
                       :id="item.id"
                       :placeholder="item.placeholder"
                       :autocomplete="item.type === 'password' ? 'on' : 'off'"
                       :readonly="item.type !== 'password'"
                       :class="{'isErr' : ((usernameShow&&index===0) || (passwordShow&&index===1))}"
                       onfocus="this.removeAttribute('readonly');"
                       @blur="blur(item,form[item.val],index)"
                       @focus="focus(index)"
                       @change="change(form[item.val], item.val)"/>
                <div class="err-tip" v-if="index===0">
                    <transition name="el-zoom-in-top">
                        <div v-if="usernameShow&&index===0">{{ $t('login.usernameTip') }}</div>
                    </transition>
                </div>
                <div class="err-tip" style="margin-bottom: 4px" v-else>
                    <transition name="el-zoom-in-top">
                        <div v-if="passwordShow&&index===1">{{ $t('login.passwordTip') }}</div>
                    </transition>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { getFormStatus } from '@/utils/form-rules-methods';
    import { cloneDeep } from 'lodash';
    // import $cookie from 'js-cookie';
    // import { decode, encode } from 'js-base64';
    import { userpass } from '@/utils/safe';
    import { Rnum } from '@/utils/dynamicDatas';

    const form = {
        userName: '',
        password: ''
    };
    const rulesModule = {
        userName: {
            status: true,
            rule: 'isEmptyStr'
        },
        password: {
            status: true,
            rule: 'isEmptyStr'
        }
    };
    export default {
        props: {
            clearErrMsg: {
                type: Function
            }
        },
        data() {
            return {
                usernameShow: false,
                passwordShow: false,
                emptyUsername: '',
                emptyPassword: '',
                form: cloneDeep(form),
                rulesDemo: cloneDeep(rulesModule),
                labelStyle: {
                    'line-height': '16px',
                    'font-size': '12px',
                    'font-weight': '100',
                    top: '0px'
                },
                // current: -1,
                achePs: '',
                maiden: false,
                pass: 'password'
            };
        },
        watch: {
            'form.password': {
                handler: function(val) {
                    this.maiden = false;
                },
                deep: true
            }
        },
        mounted() {
            // 未勾选"记住密码", 不回填数据
            if (!localStorage.getItem('xhl_remember_me')) {
                return;
            }

            userpass.check();
            const info = userpass.getInfo();
            this.form.userName = info.account;
            if (info.password) {
                this.form.password = Rnum(8) || 'sbkansha';
                this.achePs = info.password;
                setTimeout(() => {
                    this.maiden = true;
                }, 100);
            }
        },
        computed: {
            inputConfig() {
                return [
                    {
                        type: 'text',
                        name: 'name',
                        val: 'userName',
                        id: 'loginName',
                        placeholder: this.$t('facebook.onekeyRelease.creatContent.account'),
                        valempty: ''
                    },
                    {
                        type: this.pass,
                        name: 'pass',
                        val: 'password',
                        id: 'loginPass',
                        placeholder: this.$t('mailSetting.accountSetting.emailPassword'),
                        valempty: ''
                    }
                ];
            },
            rules() {
                return {
                    userName: {
                        ...this.rulesDemo.userName,
                        message: this.$t('login.usernameTip')
                    },
                    password: {
                        ...this.rulesDemo.password,
                        message: this.$t('login.passwordTip')

                    }
                };
            }
        },
        methods: {
            change(val, name) {
                this.form[name] = val.trim();
            },
            focus(index) {
                // 输入中时清掉账号密码为空及账号错误的提示
                this.$emit('clearErrMsg');
                // eslint-disable-next-line no-unused-expressions
                index === 0 ? this.usernameShow = false : '';
                // eslint-disable-next-line no-unused-expressions
                index === 1 ? this.passwordShow = false : '';
            },
            blur(item, val, index) {
                // 账号密码为空时的检测
                if (val.trim() === '' && index === 0) {
                    this.usernameShow = true;
                } else if (val.trim() === '' && index === 1) {
                    this.passwordShow = true;
                }
                if (this.form[item.val]) {
                    this.validate(item.val);
                }
            },
            validate(method) {
                let flag = true;
                if (method && typeof method === 'string' && this.rules[method]) {
                    flag = this.rulesDemo[method].status = !getFormStatus[this.rules[method].rule](this.form[method]);
                } else {
                    for (const k in this.rules) {
                        if (getFormStatus[this.rules[k].rule](this.form[k])) {
                            flag = this.rulesDemo[k].status = false;
                        }
                    }
                }
                if (typeof method === 'function') {
                    method(flag);
                }
                return flag;
            },
            getForm() {
                const o = cloneDeep(this.form);
                if (this.maiden) o.password = this.achePs;
                return cloneDeep(o);
            },
            resetFields() {
                this.form = cloneDeep(form);
                this.rulesDemo = cloneDeep(rulesModule);
            }
        }
    };
</script>

<style lang="scss" scoped>
@import "~@/styles/moduleScss/login/form-login";
</style>
