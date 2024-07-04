<template>
    <div class="QR-code-box">
        <!-- 二维码图片 -->
        <img :src="qrCodeBase64Data"
             alt="">

        <!-- 二维码失效时，提示用户手动刷新二维码 -->
        <div v-if="qrCodeHasExpried"
             class="fail-cover-container">
            <div class="fail-cover">
                <Icon custom="custom custom-refresh"
                      color="#FFF"
                      size="38"
                      @click="handleRefresh"
                      :class="{'refresh-loading':refreshLoading}"></Icon>
                <span class="QRcode-failure">{{ $t('whatsappSetting.QRcodeFailureTips') }}</span>
            </div>
        </div>

        <!-- 页面初始化 或 扫码成功时，显示 loading 效果 -->
        <div v-if="createdLoading || hasLoginFlag"
             class="handle-refresh">
            <Icon custom="custom custom-refresh"
                  color="#4285F4"
                  size="38"
                  class="refresh-loading"></Icon>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util.js';
    import { mapState } from 'vuex';
    import {
        getWAPersonalEditionLoginQrCode,
        WAPersonalEditionLoginCheck
    } from '@/api/whatsapp';

    export default {
        name: 'WAQRCodeLogin',
        computed: {
            ...mapState({
                lang: state => state.app.lang,
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                healthFBUrl: state => state.healthFBUrl
            })
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
                // 二维码已经失效时为true
                qrCodeHasExpried: false,
                // 用户已经成功登录时为true
                hasLoginFlag: false,
                // 二维码请求失败重试次数(目前要求重新请求二维码只在精简版生效)
                tryTimes: 0,
                // uuid
                uuid: ''
            };
        },
        methods: {
            // 如果二维码已失效, 重新请求二维码(外部组件直接用 $refs 调用)
            refreshDataIfNeed() {
                if (this.qrCodeHasExpried) {
                    this.refreshData();
                }
            },
            // 重新请求二维码
            refreshData() {
                // 二维码loading效果
                this.createdLoading = true;

                // 每次请求二维码时,先将二维码地址置空
                this.qrCodeBase64Data = '';
                // 重置 uuid
                this.uuid = '';

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
                getWAPersonalEditionLoginQrCode({
                }, new util.axios.CancelToken(function executor(c) {
                    vm.cancelFunc = c;
                })).then(res => {
                    // 取消函数置空
                    this.cancelFunc = null;

                    if (res.code === 1 && res.data) {
                        // 清空二维码请求失败重试次数
                        this.tryTimes = 0;
                        this.uuid = res.data.uuid;
                        this.qrCodeBase64Data = res.data.qrcode;
                        const expriedTime = Number(`${res.data.timeout}000`);
                        this.qrCodeHasExpried = false;

                        // 二维码加载成功, 开始持续查询扫码结果
                        setTimeout(() => {
                            this.getLoginResult();
                        }, 0);

                        // 清除上一个定时器
                        if (this.QRcodeExpirationTimer) {
                            clearTimeout(this.QRcodeExpirationTimer);
                            this.QRcodeExpirationTimer = null;
                        }

                        const _this = this;
                        this.QRcodeExpirationTimer = setTimeout(function() {
                            // 当二维码失效以后需手动刷新
                            _this.qrCodeHasExpried = true;
                        }, expriedTime);
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
                            this.qrCodeHasExpried = true;

                            return;
                        }

                        // 请求失败重试
                        if (!res.data) {
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
                        this.qrCodeHasExpried = true;
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
                    this.qrCodeHasExpried = true;
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

                const uuid = this.uuid;
                WAPersonalEditionLoginCheck({
                    tempId: uuid
                }).then(res => {
                    if (res.code === 1) {
                        if (!this.hasLoginFlag) {
                            this.$Message.success(this.$t('whatsappSetting.loginSuccessTip'));
                            // 登录成功-清除轮询定时器
                            this.hasLoginFlag = true;
                            // 令外部组件重新获取 wa 账号信息
                            this.$emit('hasLoginSuccess', Object.assign({ uuid }, res.data));
                        }
                    } else if (res.code === -5) {
                        // 未扫码, 看是否需要重新检测扫码结果

                        if (this.qrCodeHasExpried || this.hasLoginFlag) {
                            // 如果此时二维码已过期 或 已登录成功, 则不用再次请求
                        } else {
                            // 否则, 再次请求扫码结果

                            setTimeout(() => {
                                this.getLoginResult();
                            }, 2000);
                        }
                    } else {
                        // 其他报错场景, 给出相应提示

                        // 设置登录标识为失败
                        this.qrCodeHasExpried = true;

                        // 计算错误提示语
                        let errorMsg = this.$t('crm.Html.errorOccurred');
                        if (res.data && res.data.message) {
                            errorMsg = res.data.message;
                        }
                        switch (res.code) {
                            case 0:
                                errorMsg = this.$t('login.loginErrTip1');
                                break;
                            case -8:
                                errorMsg = this.$t('login.loginErrTip3');
                                break;
                            case -4:
                                errorMsg = this.$t('login.loginErrTip4');
                                break;
                            case -6:
                                errorMsg = this.$t('login.loginErrTip5');
                                break;
                            case -7:
                                errorMsg = this.$t('login.loginErrTip6');
                                break;
                            case -2:
                                errorMsg = this.$t('login.loginErrTip7');
                                break;
                            case -1:
                                errorMsg = this.$t('login.loginErrTip8');
                                break;
                            case -3:
                                errorMsg = this.$t('login.loginErrTip9');
                                break;
                        }

                        // 弹出提示
                        this.$Message({
                            message: errorMsg,
                            type: 'error',
                            showClose: true,
                            duration: 5000
                        });
                    }
                }).catch(response => {
                    if (this.qrCodeHasExpried || this.hasLoginFlag) {
                        // 如果此时二维码已过期 或 已登录成功, 则不用再次请求
                    } else {
                        // 否则, 再次请求扫码结果

                        setTimeout(() => {
                            this.getLoginResult();
                        }, 2000);
                    }
                });
            },
            // 手动刷新二维码
            handleRefresh() {
                this.refreshLoading = true;
                this.getQRCode();
            }
        },
        mounted() {
            // 等页面加载完毕后再调用接口, 避免影响页面显示速度
            setTimeout(() => {
                // 初始请求二维码
                this.refreshData();
            }, 50);
        },
        watch: {
            qrCodeHasExpried: {
                handler(val) {
                    if (val) {
                        // 失效时获取最终登录结果
                        this.getLoginResult();
                    }
                }
            }
            // // 初始请求二维码 + 健康地址变化后请求二维码(调用的方法里还有 failure 判断)
            // healthFBUrl: {
            //     handler() {
            //         this.refreshDataIfNeed();
            //     }
            // }
        }
    };
</script>

<style lang="less" scoped>
.QR-code-box {
    width: 210px;
    height: 210px;
    border: 1px solid #eeeeee;
    transform: translate(0px, 0px);

    .QR-code-box-text {
        font-size: 12px;
        line-height: 18px;
        color: rgba(0, 0, 0, 0.4);
    }

    .handle-refresh, .fail-cover-container {
        position: absolute;
        background-color: rgba(255, 255, 255, .8);
        width: 264px;
        height: 264px;
        display: flex;
        align-items: center;
        justify-content: center;

        .custom-refresh {
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
    }

    .fail-cover-container {
        .fail-cover {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            width: 184px;
            height: 184px;
            border-radius: 50%;
            background: #73ACA1;
            color: #FFF;
        }

        .QRcode-failure {
            font-weight: 500;
            font-size: 14px;
            line-height: 22px;
            margin-top: 16px;
        }
    }

    img {
        width: 100%;
    }
}
</style>
