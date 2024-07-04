<template>
    <div :class="lang === 'zh-CN' ? 'show-QR-code-zh-CN' : 'show-QR-code-en-US'"
         class="show-QR-code">
        <!-- 标题 -->
        <h2 style="text-align: center;font-weight: 600;margin-bottom: 30px;">{{ viewType === 'waLoginModal' ? $t('whatsappSetting.pureQRCodeText') : $t('whatsappSetting.QRcodeText') }}</h2>

        <!-- 二维码容器 -->
<!--        <div class="code-container">-->
<!--            &lt;!&ndash; 多设备版本 &ndash;&gt;-->
<!--            <div class="QR-code-box-container">-->
<!--                <p>{{ $t('whatsapp_manage.multiDeviceBeta') }}</p>-->

<!--                <QRCodeBox :isWAIsMd="true"-->
<!--                           :viewType="viewType"-->
<!--                           v-bind="$attrs"-->
<!--                           v-on="$listeners"></QRCodeBox>-->
<!--            </div>-->
<!--            &lt;!&ndash; 旧版本 &ndash;&gt;-->
<!--            <div class="QR-code-box-container">-->
<!--                <p>{{ $t('whatsapp_manage.oldVersion') }}</p>-->

<!--                <QRCodeBox :viewType="viewType"-->
<!--                           v-bind="$attrs"-->
<!--                           v-on="$listeners"></QRCodeBox>-->
<!--            </div>-->
<!--        </div>-->

        <!-- 指定二维码同时显示 -- 选项卡：多设备、java 版切换二维码 -->
        <Tabs v-if="waQrCodeType === 2"
              v-model="currentTableType"
              @tab-click="changeTableTab"
              class="QR-code-tab">
            <!-- 精简版 -->
            <TabPane name="liteVersion"
                     :label="$t('whatsapp_manage.liteVersion')"
                     :lazy="true">
                <span slot="label"
                      class="vertical-middle">{{ $t('whatsapp_manage.liteVersion') }}
                    <HelpTip :title="$t('helpTip.liteVersionTip')"></HelpTip>
                </span>

                <QRCodeBox :viewType="viewType"
                           ref="liteVersion"
                           v-bind="$attrs"
                           v-on="$listeners"></QRCodeBox>
            </TabPane>
            <!-- 多设备版本 -->
            <TabPane name="multiDeviceBeta"
                     :label="$t('whatsapp_manage.multiDeviceBeta')"
                     :lazy="true">
                <span slot="label"
                      class="vertical-middle">{{ $t('whatsapp_manage.multiDeviceBeta') }}</span>

                <QRCodeBox :isWAIsMd="true"
                           :viewType="viewType"
                           ref="multiDeviceBeta"
                           v-bind="$attrs"
                           v-on="$listeners"></QRCodeBox>
            </TabPane>
        </Tabs>

        <!-- 只显示单个二维码: 多设备/java 版 -->
        <QRCodeBox
            v-else
            :viewType="viewType"
            ref="singleQrCode"
            v-bind="$attrs"
            v-on="$listeners"
            @qrCodeChange="qrCodeChange"
        />
        <span v-if="showWaitTip" class="wait-tip">{{ $t('whatsappSetting.webjsInitialTip') }}</span>

        <!-- width: 46%; -->
        <div class="attention-tip" :class="{ 'not-base64': showWaitTip }">
            <p>{{ $t('whatsappSetting.attentionTipText1') }}</p>
            <p>{{ ['12200'].includes(orgId) ? $t('whatsappSetting.attentionTipText12200_2'): $t('whatsappSetting.attentionTipText2')  }}</p>
            <!--            <p>{{$t('whatsappSetting.attentionTipText3')}}</p>-->
<!--            <p>{{ $t('whatsappSetting.attentionTipText4') }}</p>-->
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import QRCodeBox from '@/views/systemSettings/whatsapp-setting/components/QR-code-box.vue';
    import Utils from '@/utils/index.js';

    export default {
        name: 'show_QR_code',
        inheritAttrs: false,
        components: {
            QRCodeBox
        },
        props: {
            // 当前组件所在位置 --- 判断是否是在 waLoginModal 内, 做不同处理
            viewType: String
        },
        computed: {
            ...mapState({
                lang: state => state.app.lang,
                waQrCodeType: state => state.whatsapp.waQrCodeType
            }),
            showWaitTip() {
                return this.qrString && !Utils.startWithBase64(this.qrString);
            }
        },
        data() {
            return {
                qrString: '',
                currentTableType: 'liteVersion'
            };
        },
        methods: {
            // 切换 Tab
            changeTableTab(tab) {
                this.$nextTick(() => {
                    if (this.$refs[this.currentTableType]) {
                        this.$refs[this.currentTableType].refreshDataIfNeed();
                    }
                });
            },
            qrCodeChange(qrString) {
                this.qrString = qrString;
            }
        }
    };
</script>

<style lang="less" scoped>
    .show-QR-code {
        width: 100%;
        margin: auto 0;
        display: flex;
        flex-direction: column;
        align-items: center;

        h2 {
            color: rgba(0, 0, 0, 0.80);
            font-size: 16px;
            font-weight: normal;
        }

        //.code-container {
        //    width: 100%;
        //    display: flex;
        //    justify-content: center;
        //}

        //.QR-code-box-container {
        //    text-align: center;
        //    margin: 30px 50px;
        //
        //    > p {
        //        font-weight: 500;
        //        font-size: 14px;
        //        line-height: 24px;
        //        color: #FA8241;
        //    }
        //
        //    /deep/ .QR-code-box {
        //        margin-top: 20px;
        //        background: linear-gradient(to left, #FC8C30, #FC8C30) left top no-repeat,
        //        linear-gradient(to bottom, #FC8C30, #FC8C30) left top no-repeat,
        //        linear-gradient(to left, #FC8C30, #FC8C30) right top no-repeat,
        //        linear-gradient(to bottom, #FC8C30, #FC8C30) right top no-repeat,
        //        linear-gradient(to left, #FC8C30, #FC8C30) left bottom no-repeat,
        //        linear-gradient(to bottom, #FC8C30, #FC8C30) left bottom no-repeat,
        //        linear-gradient(to left, #FC8C30, #FC8C30) right bottom no-repeat,
        //        linear-gradient(to left, #FC8C30, #FC8C30) right bottom no-repeat;
        //        background-size: 4px 15px, 15px 4px, 4px 15px, 15px 4px;
        //    }
        //}

        /deep/ .QR-code-box {
            display: inline-block;
        }

        .wait-tip {
            padding-top: 10px;
            font-size: 16px;
            color: #FF752A;
            font-weight: 500;
        }

        .attention-tip {
            color: rgba(0, 0, 0, 0.80);
            font-size: 12px;
            width: 87%;
            margin: 20px 0;
            max-width: 800px;

            &.not-base64 {
                margin: 10px 0 30px;
            }
            // p:first-child {
            //   font-weight: normal;
            //   height: 30px;
            // }
        }

        // 选项卡样式相关
        .QR-code-tab {
            // 选项卡顶部
            /deep/ .el-tabs__header {
                margin: 20px 0 0;
                text-align: center;

                .el-tabs__nav-wrap {
                    display: inline-block;

                    .el-tabs__nav-scroll {
                        display: inline-block;

                        .el-tabs__item {
                            font-size: 16px;
                            padding: 0 10px;
                        }
                    }
                }
            }

            // 选项卡底部
            /deep/ .el-tabs__content {
                .el-tab-pane {
                    text-align: center;
                    line-height: 0;
                }
            }
        }

        /* 去掉选项卡默认背景色 */
        /deep/ .el-tabs__nav-wrap::after {
            background-color: #fff;
        }
    }
</style>
