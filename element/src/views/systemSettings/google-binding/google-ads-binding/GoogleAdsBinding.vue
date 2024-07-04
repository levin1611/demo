<template>
    <Card class="google-ads-binding" style="overflow-y: scroll">
        <Menu mode="horizontal" class="portal-set-menu" :default-active="activeName" @select="handleVie">
            <MenuItem index="accountBinding">
                {{$t('googleAdsBinding.accountBinding.title')}}
            </MenuItem>
            <MenuItem index="conversionOperation">
                {{$t('googleAdsBinding.conversionOperation.title')}}
            </MenuItem>
        </Menu>
        <keep-alive>
            <component v-bind:is="view"></component>
        </keep-alive>
    </Card>
</template>
<script>
    import AccountBinding from './account-binding/AccountBinding';
    import ConversionOperation from './conversion-operation/ConversionOperation';

    export default {
        name: 'GoogleAdsBinding',
        components: { AccountBinding, ConversionOperation },
        data() {
            return {
                activeTab: 'accountBinding',
                activeName: 'accountBinding',

                view: 'accountBinding',
                viewList: [
                    {
                        label: this.$t('googleAdsBinding.accountBinding.title'),
                        name: 'accountBinding'
                    },
                    {
                        label: this.$t('googleAdsBinding.conversionOperation.title'),
                        name: 'conversionOperation'
                    }
                ]
            };
        },
        methods: {
            handleVie(v) {
                this.view = v;
            }
        }
    };
</script>
<style lang="less">
    .google-ads-binding {
        height: 100%;
        /*overflow: auto;*/

        .el-menu-item {
            color: rgba(0, 0, 0, .6);

        }

        .is-active {
            font-weight: 700;
            color: #fa8241 !important;
            /*border-bottom:0;*/
            border: none;
        }

        .el-menu-item {
            padding: 0 !important;
            margin: 0 20px;
        }

        .el-card__body {
            .el-menu--horizontal {
                height: 37px;
                line-height: 30px;
                border-bottom: 1px solid #f0f0f0;
                margin-bottom: 16px;
                .el-menu-item {
                    height: 37px;
                    line-height: 30px;
                }
            }

        }
    }
</style>
