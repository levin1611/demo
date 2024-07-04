<template>
    <div class="adsSetDetail">
        <!-- 标题: Google 账号 -->
        <div class="adsSetDetail-title">{{ rowData.adsAccountName }}</div>

        <!-- tabs -->
        <Tabs v-model="current_compo"
              class="adsSetDetail-tabs">
            <TabPane v-for="item in compo_list"
                     :key="item.value"
                     :name="item.value"
                     :label="item.label"></TabPane>
        </Tabs>

        <!-- component -->
        <component :is="current_compo"
                   :activeTab="current_compo"
                   :customerId="rowData.adsAccountId"
                   :adsCustomerName="rowData.adsAccountName"
                   :isBinding="false"></component>
    </div>
</template>

<script>
    import ConversionOperation from '@/views/systemSettings/google-binding/google-ads-binding/conversion-operation/ConversionOperation';
    import SyncTrackingTemplate from '@/views/systemSettings/google-binding/google-ads-binding/account-binding/components/SyncTrackingTemplate';

    export default {
        name: 'adsSetDetail',
        components: {
            ConversionOperation,
            SyncTrackingTemplate
        },
        props: {
            rowData: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                current_compo: 'ConversionOperation',
                compo_list: [
                    { value: 'ConversionOperation', label: this.$t('googleAdsBinding.conversionOperation.title') },
                    { value: 'SyncTrackingTemplate', label: this.$t('googleAdsBinding.accountBinding.track_template') }
                ]
            };
        },
        watch: {
            // 刷新页面数据
            'rowData.id': {
                handler(val) {
                    const tmp = this.current_compo;
                    this.current_compo = '';
                    this.$nextTick(() => {
                        this.current_compo = tmp;
                    });
                }
            }
        }
    };
</script>

<style lang="less" scoped>
    .adsSetDetail {
        padding: 20px 30px 0 24px;

        &-title {
            font-weight: 500;
            font-size: 18px;
            line-height: 18px;
            color: rgba(0, 0, 0, 0.8);
        }

        &-tabs {
            margin-top: 12px;

            /deep/ .el-tabs__nav-wrap::after {
                content: none;
            }
        }

        /deep/ .sync-tracking-template {
            width: 100%
        }

        /deep/ .GABinding-steps-footer {
            position: absolute;
            right: 30px;
            bottom: 30px;
        }
    }
</style>
