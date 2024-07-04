<template>
    <div>
        <!-- 标题 -->
        <div class="floating-window-header"
             style="margin-bottom: 0;">
            <div class="floating-window-header-title">{{ $t('menu.helpCenter') }}</div>
            <div class="floating-window-fix-icon">
                <Icon custom="custom-modal-close"
                      @click.native="close_window"
                      style="cursor: pointer;"></Icon>
            </div>
        </div>

        <!-- 正体 -->
        <div :style="{height: height_scroll}"
             class="help-module-list">
            <div v-for="module in moduleList"
                 :key="module.name"
                 class="help-module">
                <div class="help-module-container">
                    <img :src="`${publicPath}${module.icon}`"
                         @click="openHelpPage(module.url)"
                         :width="module.width"
                         :class="`help-module-icon help-module-${module.name}`"/>
                    <br>
                    <span @click="openHelpPage(module.url)"
                          :class="`help-module-title help-module-${module.name}`">{{ $t(module.title) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'help-center',
        props: [
            'isFullHeight'
        ],
        computed: {
            height_scroll() {
                return `calc(100vh - ${50 + (this.isFullHeight ? 0 : 60)}px`;
            }
        },
        data() {
            return {
                publicPath: process.env.BASE_URL,
                moduleList: [
                    {
                        name: 'dashBoard',
                        title: 'menu.dashBoard',
                        icon: 'image/dashBoard.svg',
                        url: 'https://www.yuque.com/help.leadscloud/faq_guide/tuaazwr3neh2vxio?singleDoc#'
                    }, // 仪表盘
                    {
                        name: 'CRM',
                        title: 'menu.crm',
                        icon: 'image/CRM.svg',
                        url: 'https://www.yuque.com/help.leadscloud/faq_guide/uzwnnbcc9vvvs97v?singleDoc#'
                    }, // CRM
                    {
                        name: 'mail',
                        title: 'menu.mail',
                        icon: 'image/mail.svg',
                        url: 'https://www.yuque.com/help.leadscloud/faq_guide/fdn0i5afpdqpqh5y?singleDoc#'
                    }, // 邮件管理
                    {
                        name: 'WhatsApp',
                        title: 'menu.whatsapp_manage',
                        icon: 'image/WhatsApp.svg',
                        url: 'https://www.yuque.com/help.leadscloud/faq_guide/opq838uxurh4x0f9'
                    }, // WhatsApp
                    {
                        name: 'whatsapp_microenterprise',
                        title: 'menu.whatsapp_microenterprise',
                        icon: 'image/help_qw.png',
                        width: '34',
                        url: 'https://www.yuque.com/help.leadscloud/faq_guide/zrb3axypvnker9ag?singleDoc#'
                    },
                    {
                        name: '通话&短信',
                        title: 'menu.calling_sms',
                        icon: 'image/smscalling.svg',
                        width: '34',
                        url: 'https://www.yuque.com/help.leadscloud/faq_guide/lbvsg4uri23s40ds'
                    },
                    {
                        name: 'cloudPush',
                        title: 'menu.briefcase',
                        icon: 'image/cloudPush.svg',
                        url: 'https://www.yuque.com/help.leadscloud/faq_guide/hzbgx2tkzig43y08?singleDoc#'
                    }, // 智能物料
                    {
                        name: 'websiteInteraction',
                        title: 'menu.websiteInteraction',
                        icon: 'image/websiteInteraction.svg',
                        url: 'https://www.yuque.com/help.leadscloud/faq_guide/ol9b3c988drgumf2?singleDoc#'
                    }, // 网站
                    {
                        name: 'FacebookMarketing',
                        title: 'menu.facebook',
                        icon: 'image/FacebookMarketing.svg',
                        url: 'https://www.yuque.com/help.leadscloud/faq_guide/op7gutv6ih60q1pv?singleDoc#'
                    }, // Facebook
                    {
                        name: 'GoogleMarketing',
                        title: 'menu.googleAds',
                        icon: 'image/GoogleMarketing.svg',
                        url: 'https://www.yuque.com/help.leadscloud/faq_guide/pxke2zs11lpbd8s9'
                    }, // Google
                    {
                        name: 'BI',
                        title: 'menu.bi_report',
                        icon: 'image/BI.svg',
                        url: 'https://www.yuque.com/help.leadscloud/faq_guide/lpcq1zt9qvupxcqf?singleDoc#'
                    }, // BI
                    {
                        name: 'systemSettings',
                        title: 'menu.system_settings',
                        icon: 'image/systemSettings.svg',
                        url: 'https://www.yuque.com/help.leadscloud/faq_guide/csnd8uvp8f49o1vo?singleDoc#'
                    } // 系统设置
                ]
            };
        },
        methods: {
            close_window() {
                this.$emit('windowClose');
            },
            openHelpPage(url) {
                window.open(url, '_blank');
            }
        }
    };
</script>

<style scoped lang="less">
    .help-module-list {
        padding: 0 10px;
        overflow-y: auto;
    }

    .help-module {
        display: inline-block;
        width: 50%;
        height: 100px;
        position: relative;

        &-container {
            position: absolute;
            bottom: 0;
            width: 100%;
            text-align: center;
        }

        &-icon {
            cursor: pointer;
        }

        &-title {
            font-size: 14px;
            color: rgba(0,0,0,0.80);
            letter-spacing: 0;
            line-height: 22px;
            cursor: pointer;
        }
    }
</style>
