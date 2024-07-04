<template>
    <div>
        <!-- 登录框 -->
        <div v-if="!isUpgrade"
             class="login-container">
            <div class="login-wrapper">
                <!-- 顶部撞色色块 -->
                <div class="login-wrapper-before"></div>

                <!-- 标题 -->
                <div class="login-header">
                    <div class="login-header-title">WhatsApp Mate（WSMate.com）</div>
                </div>

                <!-- 登录框 -->
                <div class="login-box">
                    <div class="login-box-main">
                        <div class="login-box-main-wrapper">
                            <!-- 二维码 -->
                            <div class="login-qrCode-wrapper">
                                <WAQRCodeLogin @hasLoginSuccess="handleLoginSuccess"
                                               class="login-qrCode"></WAQRCodeLogin>
                                <p class="login-qrCode-tip">WhatsApp扫码注册，不是微信</p>
                            </div>

                            <!-- 文案 -->
                            <div class="login-copywriting">
                                <div class="login-copywriting-price">
                                    <span class="currency-symbol">￥</span>
                                    <span class="price-amount">99</span>
                                    <span class="price-unit">/年</span>
                                    <span class="trial-period">免费试用一周</span>
                                </div>
                                <div class="login-copywriting-title">WhatsApp Mate（支持群发）：</div>
                                <div class="login-copywriting-content" v-html="copywritingText"></div>
                            </div>
                        </div>
                    </div>

                    <!-- 底部按钮 -->
<!--                    <div class="login-video-container">-->
<!--&lt;!&ndash;                        <div class="login-video-wrapper">&ndash;&gt;-->
<!--&lt;!&ndash;                            &lt;!&ndash; 视频 &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;                            <video ref="video"&ndash;&gt;-->
<!--&lt;!&ndash;                                   :controls="playing"&ndash;&gt;-->
<!--&lt;!&ndash;                                   controlslist="nodownload"&ndash;&gt;-->
<!--&lt;!&ndash;                                   @canplay="handleVideoLoad"&ndash;&gt;-->
<!--&lt;!&ndash;                                   @play="playing = true"&ndash;&gt;-->
<!--&lt;!&ndash;                                   @pause="playing = false"&ndash;&gt;-->
<!--&lt;!&ndash;                                   @ended="playing = false"&ndash;&gt;-->
<!--&lt;!&ndash;                                   @error="handleVideoError"&ndash;&gt;-->
<!--&lt;!&ndash;                                   class="login-video">&ndash;&gt;-->
<!--&lt;!&ndash;                                <source :src="videoSrc"&ndash;&gt;-->
<!--&lt;!&ndash;                                        type="video/mp4">&ndash;&gt;-->
<!--&lt;!&ndash;                                Sorry, your browser doesn't support embedded videos.&ndash;&gt;-->
<!--&lt;!&ndash;                            </video>&ndash;&gt;-->

<!--&lt;!&ndash;                            &lt;!&ndash; 播放按钮遮罩 &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;                            <div v-if="!playing"&ndash;&gt;-->
<!--&lt;!&ndash;                                 class="login-video-playBtn">&ndash;&gt;-->
<!--&lt;!&ndash;                                &lt;!&ndash; loading &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;                                <Spin v-if="loading_media"&ndash;&gt;-->
<!--&lt;!&ndash;                                      fix></Spin>&ndash;&gt;-->

<!--&lt;!&ndash;                                &lt;!&ndash; 播放按钮 &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;                                <svg v-else&ndash;&gt;-->
<!--&lt;!&ndash;                                     aria-hidden="true"&ndash;&gt;-->
<!--&lt;!&ndash;                                     @click="playVideo"&ndash;&gt;-->
<!--&lt;!&ndash;                                     class="svg-icon custom">&ndash;&gt;-->
<!--&lt;!&ndash;                                    <use xlink:href="#custom-video-play"></use>&ndash;&gt;-->
<!--&lt;!&ndash;                                </svg>&ndash;&gt;-->
<!--&lt;!&ndash;                            </div>&ndash;&gt;-->
<!--&lt;!&ndash;                        </div>&ndash;&gt;-->
<!--                        <div class="login-video-wrapper">-->
<!--                            <img :src="`${publicPath}image/WAQrcodePage.png`">-->
<!--                        </div>-->
<!--                    </div>-->
                </div>
            </div>
        </div>

        <!-- 升级中提示 -->
        <warningUpdate v-else></warningUpdate>
    </div>
</template>

<script>
    import WAQRCodeLogin from './login-template/wa-QRCode-login';
    import util from '../../libs/util';
    import { mapState } from 'vuex';
    import warningUpdate from './login-template/warning-update';

    export default {
        components: {
            warningUpdate,
            WAQRCodeLogin
        },
        computed: {
            ...mapState({
                isUpgrade: 'isUpgrade'
            })
        },
        data() {
            return {
                // 静态资源文件地址
                publicPath: process.env.BASE_URL,

                upgradeTimer: '',

                copywritingText: '1、国内正常网络，免费畅聊 WhatsApp；\n' +
                    '2、内置”谷歌翻译”模块，19 种语言一键翻译；\n' +
                    '3、点“+”直接加好友，不存通讯录即可对话；\n' +
                    '4、一键“导出”所有WhatsApp联系人；\n' +
                    '5、支持3个账号同时在线（WhatsApp 多开）；\n' +
                    '6、WhatsApp封号无法登录也可以查看聊天记录；\n' +
                    '7、每天 WhatsApp 工作量自动统计；\n' +
                    '8、支持账号密码登录，避免每次扫码麻烦。\n' +
                    '9、详细<a href="https://www.yuque.com/help.leadscloud/rhm57t/cg54i5pkrsrv6rkx?singleDoc#" target="_blank">使用说明</a>，或微信<a href="https://www.yuque.com/help.leadscloud/rhm57t/awnh5yzrwvoddhzp?singleDoc#" target="_blank">联系我们</a>。'
                // videoSrc: require('../../../public/video/WAPersonalEditionLogin.mp4'),
                // loading_media: true,
                // playing: false
            };
        },
        methods: {
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
            // 登录成功回调 - 个人版放到 wsmate 网址上, 后端 set-cookie 失败, 用这种方式才能成功
            handleLoginSuccess(userData) {
                if (userData.uuid) {
                    window.open(`https://admin.leadscloud.com/Front-Vue/#/refresh?waLoginUuid=${userData.uuid}`, '_self');
                } else {
                    this.$Message.error('登录出错');
                }
            }

            // // 视频加载 canplay 回调
            // handleVideoLoad() {
            //     this.loading_media = false;
            // },
            // // 视频加载失败
            // handleVideoError() {
            //     this.loading_media = false;
            // },
            // // 播放视频
            // playVideo() {
            //     if (this.loading_media) {
            //         this.$Message.warning(this.$t('loading'));
            //     } else {
            //         this.$refs.video.play();
            //     }
            // }
        },
        mounted() {
            // 等页面加载完毕后再调用接口, 避免影响页面显示速度
            setTimeout(() => {
                this.handleUpdate();
                this.handleTimerUpdate();
            }, 50);
        },
        beforeDestroy() {
            if (this.upgradeTimer) {
                clearInterval(this.upgradeTimer);
                this.upgradeTimer = null;
            }
        }
    };
</script>

<style lang="less" scoped>
.login-container {
    position: relative;
    z-index: 100;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    overflow-y: auto;
}

.login-wrapper {
    padding-bottom: 92px;
    cursor: default;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
}

.login-wrapper-before {
    background-color: #ff752a;
    position: absolute;
    top: 0;
    z-index: -1;
    width: 100%;
    height: 222px;
}

.login-header {
    margin: 46px auto 52px;
    display: flex;
    flex: none;
    align-items: center;
    justify-content: flex-start;
    width: 870px;
}

.login-box {
    margin-right: auto;
    margin-left: auto;
    background-color: #fff;
    border-radius: 3px;
    box-shadow: 0 17px 50px 0 rgba(11, 20, 26, .19), 0 12px 15px 0 rgba(11, 20, 26, .24);
    z-index: 2;
    display: flex;
    flex: none;
    flex-direction: column;
    width: 870px;
    overflow: hidden;
}

.login-header-title {
    display: inline-block;
    font-size: 16px;
    font-weight: 600;
    line-height: 22px;
    color: #fff;
    vertical-align: middle;
}

.login-box-main {
    padding: 60px 60px 68px;
    position: relative;
}

.login-box-main-wrapper {
    display: flex;
    flex-grow: 1;
    align-items: flex-start;
    justify-content: space-between;
}

.login-copywriting {
    flex: none;
    max-width: 556px;
}

.login-copywriting-price {
    display: flex;
    align-items: center;
    font-family: Alibaba PuHuiTi;
    color: #EA4335;
    font-weight: 700;
    margin-bottom: 8px;
    height: 44px;
    .currency-symbol{
        color: #EA4335;
        font-size: 14px;
        align-self: flex-end;
        padding-bottom: 6px;
    }
    .price-amount {
        font-size: 32px;
    }
    .price-unit {
        font-size: 28px;
    }
    .trial-period {
        border-radius: 4px;
        background: #EA4335;
        color: #FFFFFF;
        font-size: 12px;
        font-weight: 600;
        padding: 2px 10px;
        margin-left: 12px;
    }
}

.login-copywriting-title {
    margin-bottom: 30px;
    font-size: 22px;
    font-weight: 400;
    line-height: 31px;
    color: #333;
}

.login-copywriting-content {
    white-space: pre-wrap;
    font-size: 16px;
    line-height: 30px;
    color: #333;
}

.login-qrCode-wrapper {
    margin-right: 60px;
    position: relative;
}

.login-qrCode-tip {
    font-size: 16px;
    line-height: 30px;
    color: #333;
    text-align: center;
}

.login-qrCode {
    border-radius: 2px;
    position: relative;
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 264px;
    height: 264px;
    overflow: hidden;
}

.login-qrCode img {
    opacity: 1;
    transition: opacity .5s cubic-bezier(.1, .82, .25, 1);
    max-width: 264px;
}

.login-video-container {
    padding: 72px 60px;
    background-color: rgba(11, 20, 26, 0.025);
    position: relative;
    display: flex;
    justify-content: center;
}

.login-video-wrapper {
    width: 560px;
    height: 314px;
    position: relative;
    flex: none;
}

.login-video-wrapper img {
    width: 100%;
    height: 100%;
}

//.login-video {
//    z-index: 1;
//    display: block;
//    width: 560px;
//    height: 314px;
//}

//.login-video-playBtn {
//    position: absolute;
//    top: 0;
//    right: 0;
//    bottom: 0;
//    left: 0;
//
//    display: flex;
//    align-items: center;
//    justify-content: center;
//
//    svg {
//        color: rgba(0, 0, 0, 0.6);
//        font-size: 50px;
//        cursor: pointer;
//    }
//}

@media screen and (max-width: 870px) {
    .login-wrapper {
        padding-bottom: 0;
    }

    .login-header {
        width: 100%;
        padding-left: 60px;
    }

    .login-box-main-wrapper {
        flex-flow: column wrap;
    }

    .login-box {
        width: 100%;
        border-radius: 0;
    }

    .login-copywriting {
        max-width: 100%;
    }

    .login-qrCode-wrapper {
        margin: 30px auto;
    }

    .login-video-container {
        padding: 72px 0 0;
    }

    .login-video-wrapper {
        width: 100%;
        height: 0;
        padding-bottom: 56.0714285714%;
    }

    .login-video-wrapper img {
        width: 100%;
        height: auto;
    }

    .login-container {
        overflow-x: auto;
    }
}

@media screen and (max-width: 550px) {
    .login-wrapper {
        position: relative;
    }

    .login-header {
        box-sizing: border-box;
        padding: 0 30px;
        margin: 20px auto;
    }

    .login-header-title {
        font-size: 14px;
        line-height: 20px;
    }

    .login-box-main {
        padding: 20px 30px 30px;
    }

    .login-copywriting {
        flex: none;
        max-width: 556px;
    }

    .login-copywriting-title {
        margin-bottom: 10px;
        font-size: 16px;
        font-weight: 500;
        line-height: 22px;
    }

    .login-copywriting-content {
        font-size: 14px;
        line-height: 26px;
    }

    .login-qrCode {
        width: 200px;
        height: 200px;
    }

    .login-qrCode img {
        max-width: 200px;
    }
}

@media screen and (max-height: 512px) {
    .login-container {
        overflow-y: auto;
    }
}
</style>
