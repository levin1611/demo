<template>
    <div class="portal-set" style="height:100%;">
        <Tabs v-show="['siteSetting', 'messenger', 'whatsapp'].includes(buriedName)"
              v-model="buriedName" class="buried-tab">
            <TabPane
                v-for="item in buriedList"
                :key="item.key"
                :name="item.key"
                :label="item.value"
            >
            </TabPane>
        </Tabs>
        <component :is="tabModule"
                   :buriedName.sync="buriedName"
                   :currDomain.sync="currDomain"></component>
    </div>
</template>

<script>
    import BuriedEmailSite from './components/BuriedEmailSite';
    import BuriedMessagerSite from './components/BuriedMessagerSite';
    import BuriedSite from './components/BuriedSite';
    import BuriedWhatsAppSite from './components/BuriedWhatsAppSite';
    import ChatDialogSettings from './components/ChatDialogSettings';

    export default {
        data() {
            return {
                buriedList: [
                    {
                        key: 'siteSetting',
                        value: this.$t('portal_set.buriedSiteSettings')
                    },
                    {
                        key: 'messenger',
                        value: this.$t('portal_set.websiteMessengerSettings')
                    },
                    {
                        key: 'whatsapp',
                        value: this.$t('portal_set.websiteWhatsAppSettings')
                    }
                    // {
                    //     key: 'email',
                    //     value: '网站邮箱设置'
                    // },
                ],
                buriedName: 'siteSetting',
                tabModule: 'BuriedSite',

                // 聊天窗设置相关
                // 当前查看的网站
                currDomain: ''
            };
        },
        components: {
            BuriedEmailSite,
            BuriedMessagerSite,
            BuriedSite,
            BuriedWhatsAppSite,
            ChatDialogSettings
        },
        watch: {
            buriedName: {
                handler(val) {
                    switch (val) {
                        case 'siteSetting':
                            this.tabModule = 'BuriedSite';
                            break;
                        case 'messenger':
                            this.tabModule = 'BuriedMessagerSite';
                            break;
                        case 'whatsapp':
                            this.tabModule = 'BuriedWhatsAppSite';
                            break;
                        case 'email':
                            this.tabModule = 'BuriedEmailSite';
                            break;
                        case 'ChatDialogSettings':
                            this.tabModule = 'ChatDialogSettings';
                            break;
                        default:
                            this.tabModule = 'BuriedSite';
                            break;
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="scss">
.portal-set .el-tabs__nav-wrap:after{
    height: 1px;
}
</style>
<style lang="scss" scoped>
.buried-tab{
    padding: 20px 30px 10px;
}
</style>
