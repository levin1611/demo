<template>
    <div :class="{'isMd': isWAIsMd}"
         class="QR-code-box">
        <!-- 二维码图片 -->
        <img v-if="isBase64" :src="qrCodeBase64Data" alt="">
        <!-- 新版node系统 -->
        <div v-if="!isBase64" id="qrcode" ref="qrcode"></div>

        <!-- 二维码失效时，提示用户手动刷新二维码 -->
        <div v-if="QRcodeHasFailure"
             class="handle-refresh">
            <Icon custom="custom custom-refresh"
                  color="#4285F4"
                  size="24"
                  @click="handleRefresh"
                  :class="{'refresh-loading':refreshLoading}"></Icon>
            <span class="QRcode-failure">{{ $t('whatsappSetting.QRcodeFailureTips') }}</span>
        </div>
        <!-- 页面初始化时，显示loading图标 -->
        <div v-if="createdLoading"
             class="handle-refresh">
            <Icon custom="custom custom-refresh"
                  color="#4285F4"
                  size="24"
                  class="refresh-loading"></Icon>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util.js';
    import { mapState } from 'vuex';
    import { getWaLoginQrCode } from '@/api/whatsapp';
    import Utils from '@/utils/index.js';
    import QRCode from 'qrcodejs2';

    export default {
        name: 'QR_code_box',
        props: {
            // 是否退出了wa账号
            isLogoutWA: {
                type: Boolean,
                default: false
            },
            // 当前组件所在页面类型 --- 目前只用来判断是否为 waChat , 是在说明在 wa 聊天界面, 登录成功后不需要此组件更新右上角未读数
            pageType: {
                type: String
            },
            // 当前组件所在位置 --- 判断是否是在 waLoginModal 内, 做不同处理
            viewType: {
                type: String
            },
            // 是否是多设备版
            isWAIsMd: {
                type: Boolean,
                default: false
            },
            // 点击重新登录进到此二维码请求界面时, 需要传递重新登录 wa 账号
            reConnectWaAccountInfo: {
                type: Object
            }
        },
        computed: {
            ...mapState({
                lang: state => state.app.lang,
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId
            }),
            /** 老系统返回base64字符串直接显示，新系统需要前端自己生成二维码 */
            isBase64() {
                return Utils.startWithBase64(this.qrCodeBase64Data);
            }
        },
        data() {
            return {
                // 取消上一次正常消息请求
                cancelFunc: null,

                // 二维码失效定时器对象
                QRcodeExpirationTimer: null,
                // 初始化时加载图标
                createdLoading: true,
                // 二维码失效后用户点击刷新按钮后loading
                refreshLoading: false,
                // 二维码 (base64)
                qrCodeBase64Data: '',
                // 二维码失效时长
                QRcodeFailureTime: '',
                // 二维码已经失效时为true
                QRcodeHasFailure: false,
                // 用户已经成功登录时为true
                hasLoginFlag: false,
                // 二维码请求失败重试次数(目前要求重新请求二维码只在精简版生效)
                tryTimes: 0,
                // uuid
                uuid: '',
                // 只弹一次提示语
                onlyOneTip: true,
                // 正在检测登陆情况
                isGettingQrCode: false
            };
        },
        methods: {
            // 如果二维码已失效, 重新请求二维码(外部组件直接用 $refs 调用)
            refreshDataIfNeed() {
                if (this.QRcodeHasFailure) {
                    this.refreshData();
                }
            },
            generateQRCode(text) {
                this.$refs.qrcode.innerHTML = '';
                // eslint-disable-next-line no-new
                new QRCode(this.$refs.qrcode, {
                    text,
                    width: 360,
                    height: 360,
                    colorDark: '#000', // 二维码颜色
                    colorLight: '#fff', // 二维码背景色
                    correctLevel: QRCode.CorrectLevel.L // 容错率，L/M/H
                });
                this.$refs.qrcode.removeAttribute('title');
                // 压缩宽高增加清晰度
                const img = this.$refs.qrcode.getElementsByTagName('img');
                if (img && img[0]) {
                    img[0].style.width = '180px';
                    img[0].style.height = '180px';
                    img[0].removeAttribute('alt');
                }
            },
            clearQrCode() {
                this.$refs.qrcode.innerHTML = '';
            },
            // 重新请求二维码
            refreshData() {
                // 设置不继续检测登陆状态
                this.isGettingQrCode = false
                // 二维码loading效果
                this.createdLoading = true;
                if (!this.isBase64 && this.$refs.qrcode) {
                    this.$emit('qrCodeChange', '');
                    this.clearQrCode();
                }
                // 每次请求二维码时,先将二维码地址置空
                this.qrCodeBase64Data = '';
                // 重置 uuid
                this.uuid = '';

                // 置空二维码失效时长
                if (this.timer) {
                    clearInterval(this.timer);
                    this.QRcodeFailureTime = ''; // 这个也要置空,不然不触发检测扫码动作
                }

                // 重新获取二维码
                this.getQRCode();
            },
            // 获取二维码图片以及失效时间
            getQRCode() {
                // 取消上一次请求，避免频繁请求接口时因接口响应速度快慢导致数据错乱
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                    // 取消函数置空
                    this.cancelFunc = null;
                }

                // 设置"本轮登录成功"标识为 false
                this.hasLoginFlag = false;

                const vm = this;
                getWaLoginQrCode({
                    userId: this.userId,
                    orgId: this.enterpriseId,
                    md: this.isWAIsMd,
                    bindWa: (this.reConnectWaAccountInfo && this.reConnectWaAccountInfo.whatsappAccount) ? this.reConnectWaAccountInfo.whatsappAccount : undefined
                }, new util.axios.CancelToken(function executor(c) {
                    vm.cancelFunc = c;
                })).then(res => {
                    // 取消函数置空
                    this.cancelFunc = null;

                    if (res.code === 1 && res.data) {
                        // 清空二维码请求失败重试次数
                        this.tryTimes = 0;
                        this.uuid = res.data.uuid;
                        const qrcode = res.data.qrcode;
                        this.qrCodeBase64Data = qrcode;
                        // 新版node返回的二维码数据
                        if (!Utils.startWithBase64(qrcode)) {
                            this.$emit('qrCodeChange', qrcode);
                            this.$nextTick(() => {
                                this.generateQRCode(qrcode);
                            });
                        }
                        this.QRcodeFailureTime = `${res.data.timeout}000`;
                        this.QRcodeHasFailure = false;
                        // 扫码成功 开始监测登陆状态
                        this.isGettingQrCode = true

                        // 清除上一个定时器
                        if (this.QRcodeExpirationTimer) {
                            clearTimeout(this.QRcodeExpirationTimer);
                            this.QRcodeExpirationTimer = null;
                        }

                        const _this = this;
                        this.QRcodeExpirationTimer = setTimeout(function() {
                            // 当二维码失效以后需手动刷新
                            _this.QRcodeHasFailure = true;
                            _this.QRcodeFailureTime = '';
                        }, _this.QRcodeFailureTime);
                    // }, 3000);
                    } else {
                        // 判断是否是正常情况的请求失败(目前情况只有: 账号多开设置导致二维码不请求)
                        let flag = false;
                        switch (`${res.code}`) {
                            case '2':
                                // 未设置账号多开
                                this.$Message.error(this.$t('whatsappSetting.getQRcodeErrorTip_noMultiple'));
                                flag = true;
                                break;
                            case '3':
                                // 登录账号数量已达到最大限制
                                this.$Message.error(this.$t('whatsappSetting.getQRcodeErrorTip_maxCount'));
                                if (this.viewType === 'waLoginModal') {
                                    // 关闭弹框
                                    this.$emit('closeReplyModal');
                                    return;
                                }
                                flag = true;
                                break;
                            case '4':
                                // java 版 wa 请求失败 - 频繁请求
                                this.$Message.error(this.$t('whatsappSetting.getQRcodeErrorTip_frequently'));
                                flag = true;
                                break;
                            case '5':
                                // java 版 wa 请求失败 - 系统繁忙
                                this.$Message.error(this.$t('whatsappSetting.getQRcodeErrorTip_systemBusy'));
                                flag = true;
                                break;
                        }
                        // 是正常的
                        if (flag) {
                            // 清除重试次数
                            this.tryTimes = 0;
                            // 获取二维码失败时,将二维码已经失效 给为true
                            this.QRcodeHasFailure = true;
                            this.QRcodeFailureTime = '';
                            this.isGettingQrCode = false

                            return;
                        }

                        // 请求失败重试
                        if (!res.data && !this.isWAIsMd) {
                            // 如果旧版二维码请求失败, 则重新请求, 如果重新请求次数超过 3 次(>= N 次 - 正式请求的 1 次),则停止
                            if (this.tryTimes >= 2) {
                                this.tryTimes = 0;
                            } else {
                                this.tryTimes += 1;
                                this.getQRCode();
                                return;
                            }
                        }

                        // 重试最终失败, 弹出提示语
                        this.$Message({
                            message: this.$t('whatsappSetting.getQRcodeErrorTip'),
                            type: 'error',
                            duration: 3000
                        });
                        // 获取二维码失败时,将二维码已经失效 给为true
                        this.QRcodeHasFailure = true;
                        this.isGettingQrCode = false
                        this.QRcodeFailureTime = '';
                    }
                    this.createdLoading = false;
                    this.refreshLoading = false;
                }).catch(response => {
                    // 取消函数置空
                    this.cancelFunc = null;

                    // 如果是主动取消请求,则return
                    if (!response.message) {
                        return;
                    }
                    this.$Message({
                        message: this.$t('whatsappSetting.getQRcodeErrorTip'),
                        type: 'error',
                        duration: 3000
                    });
                    this.QRcodeHasFailure = true;
                    this.isGettingQrCode = false
                    this.QRcodeFailureTime = '';
                    this.createdLoading = false;
                    this.refreshLoading = false;
                });
            },
            // 获取登录结果
            getLoginResult() {
                // 如果 uuid 为空, 则停止执行
                if (!this.uuid) {
                    return;
                }

                util.ajaxWA({
                    url: '/whatsapp/waUserBind/waLoginCheck',
                    method: 'post',
                    data: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        uuid: this.uuid
                    }
                }).then(response => {
                    if (response.data.code === 1) {
                        this.$Message.success(this.$t('whatsappSetting.loginSuccessTip'));
                        // 登录成功-清除轮询定时器
                        this.hasLoginFlag = true;
                        // 关闭登陆弹窗
                        if (this.viewType === 'waLoginModal') {
                            this.$emit('closeReplyModal');
                        }
                        // 令外部组件重新获取 wa 账号信息
                        this.$emit('hasLoginSuccess', response.data.data);
                    } else if (response.data.code === -5 || response.data.code === -25 || response.data.code === -1) {
                        // -5未登录 -25綁定失效,请重新绑定账号 -1未知错误
                        console.log('监听到用户未扫码');
                        this.$emit('clearInfo');
                    } else if (response.data.code === -3) {
                        // 查重失败-让二维码失效-清除轮询定时器
                        this.QRcodeHasFailure = true;
                        this.isGettingQrCode = false
                        this.QRcodeFailureTime = '';
                        if (this.onlyOneTip) {
                            this.onlyOneTip = false;
                            this.$Message({
                                message: this.$t('whatsappSetting.duplicateCheckingTips').replace('$userName', response.data.message || ''),
                                type: 'error',
                                showClose: true,
                                duration: 5000
                            });
                        }
                    } else if (response.data.code === -2) {
                        // 账号多开, 此账号已登录, 不能重复登录
                        this.QRcodeHasFailure = true;
                        this.isGettingQrCode = false
                        this.QRcodeFailureTime = '';
                        if (this.onlyOneTip) {
                            this.onlyOneTip = false;
                            this.$Message({
                                message: this.$t('whatsappSetting.error_alreadyLogged'),
                                type: 'error',
                                showClose: true,
                                duration: 5000
                            });
                        }
                    } else {
                        // 登录失败-让二维码失效-清除轮询定时器
                        this.QRcodeHasFailure = true;
                        this.isGettingQrCode = false
                        this.QRcodeFailureTime = '';
                        if (this.onlyOneTip) {
                            this.onlyOneTip = false;
                            this.$Message({
                                message: this.$t('whatsappSetting.loginErrorTip'),
                                type: 'error',
                                showClose: true,
                                duration: 5000
                            });
                        }
                    }
                }).catch(response => {
                    // 调用接口失败-让二维码失效-清除轮询定时器
                    this.QRcodeHasFailure = true;
                    this.isGettingQrCode = false
                    this.QRcodeFailureTime = '';
                    if (this.onlyOneTip) {
                        this.onlyOneTip = false;
                        this.$Message({
                            message: this.$t('whatsappSetting.loginErrorTip'),
                            type: 'error',
                            duration: 3000
                        });
                    }
                });
            },
            // 监听用户扫描二维码操作
            setIntervalToScan() {
                const _this = this;
                if (this.timer) {
                    clearInterval(this.timer);
                }
                let count = 0
                this.timer = setInterval(function() {
                    /**
                     * 需要清除轮询定时器：
                     * 1.登录成功以后
                     * 2.超过两分钟
                     * 3.点击重新载入二维码
                     */
                    if (_this.hasLoginFlag || count > 60) {
                        window.clearInterval(this.timer);
                        _this.isGettingQrCode = false
                        return;
                    }
                    count++
                    _this.getLoginResult();
                }, 2000);
            },
            // 手动刷新二维码
            handleRefresh() {
                this.isGettingQrCode = false
                this.refreshLoading = true;
                this.onlyOneTip = true;
                if (!this.isBase64 && this.$refs.qrcode) {
                    this.$emit('qrCodeChange', '');
                    this.clearQrCode();
                }
                this.getQRCode();
            }
        },
        beforeDestroy() {
            if (this.timer) {
                clearInterval(this.timer);
            }
        },
        watch: {
            isGettingQrCode: {
                handler(value) {
                    if (value) {
                        this.setIntervalToScan();
                    } else {
                        if (this.timer) {
                            window.clearInterval(this.timer);
                        }
                    }
                },
                immediate: true
            },
            // 是否退出了wa账号
            isLogoutWA: {
                handler(val) {
                    if (val) {
                        this.refreshData();
                    }
                },
                deep: true, // 深度监听
                immediate: true // 初次监听即执行
            },
            QRcodeHasFailure: {
                handler(val) {
                    if (val) {
                        // 失效时获取最终登录结果
                        this.getLoginResult();
                    }
                },
                immediate: true,
                deep: true
            }
        }
    };
</script>

<style lang="less" scoped>
    .QR-code-box {
        width: 210px;
        height: 210px;
        border: 1px solid #eeeeee;
        transform: translate(0px, 0px);

        &.isMd {
            padding: 14px;
        }

        .QR-code-box-text {
            font-size: 12px;
            line-height: 18px;
            color: rgba(0, 0, 0, 0.4);
        }

        .handle-refresh {
            position: absolute;
            background-color: rgba(255, 255, 255, .8);
            width: 200px;
            height: 200px;
            top: 4px;
            left: 4px;

            .custom-refresh {
                position: absolute;
                top: 52%;
                left: 52%;
                margin-left: -12px;
                margin-top: -12px;
                cursor: pointer;
            }

            .refresh-loading {
                animation: ani-load-loop 1s linear infinite;
            }

            @keyframes ani-load-loop {
                from {
                    transform: rotate(0deg);
                }
                50% {
                    transform: rotate(180deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }

            .QRcode-failure {
                position: absolute;
                width: 200px;
                left: 0;
                bottom: 43px;
                font-size: 12px;
                text-align: center;
            }
        }

        img {
            width: 100%;
        }

        #qrcode {
            width: 180px;
            height: 180px;
            margin: 15px;
            overflow: hidden;
            pointer-events: none;
        }
    }
</style>
