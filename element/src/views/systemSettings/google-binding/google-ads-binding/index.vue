<template>
    <div style="padding: 0 30px;">
        <!-- Tab -->
        <Tabs v-if="showTab"
              v-model="view"
              class="googleAds-tabs">
            <TabPane v-for="item in tabCompoList"
                     :key="item.value"
                     :name="item.value"
                     :label="item.label "></TabPane>
        </Tabs>

        <component :is="view"
                   :view="view"
                   :jumpData="jumpData"
                   @changeView="changeView"></component>
    </div>
</template>

<script>
    import GoogleAdsAccount from '@/views/systemSettings/google-binding/google-ads-binding/googleAdsAccount';
    import GoogleConversionWithFollowUp from '@/views/systemSettings/google-binding/google-ads-binding/googleConversionWithFollowUp';
    import AccountBinding from '@/views/systemSettings/google-binding/google-ads-binding/account-binding/AccountBinding';

    export default {
        components: {
            GoogleAdsAccount,
            GoogleConversionWithFollowUp,
            AccountBinding
        },
        computed: {
            // 是否显示顶部 Tab
            showTab() {
                return Boolean(this.tabCompoList.find(item => item.value === this.view));
            }
        },
        data() {
            return {
                // 顶部 Tab 显示的组件
                tabCompoList: [
                    {
                        value: 'GoogleAdsAccount',
                        label: this.$t('googleAdsBinding.accountList.GoogleAdsAccount')
                    },
                    {
                        value: 'GoogleConversionWithFollowUp',
                        label: this.$t('googleAdsBinding.conversionList.title')
                    }
                ],

                view: 'GoogleAdsAccount',
                jumpData: {}
            };
        },
        methods: {
            changeView(view, data) {
                this.view = view;
                this.jumpData = data;
            }
        },
        watch: {
            view: {
                handler(val) {
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .googleAds-tabs {
        margin: 12px 0 0;

        /deep/ .el-tabs__header {
            margin-bottom: 0;
        }

        /deep/ .el-tabs__nav-wrap::after {
            content: none;
        }
    }
</style>
