<template>
    <div class="account-binding">
        <Steps :active="currentStep">
            <Step :title="$t('facebook.adAccountBinding.select_FB_account')"></Step>
            <Step :title="$t('facebook.adAccountBinding.select_business_platform')"></Step>
            <Step :title="$t('facebook.adAccountBinding.bind_AD_account')"></Step>
        </Steps>
        <keep-alive>
            <component :is="stepView"
                       :FBAccount="FBAccount"
                       :platform="platform"
                       @stepNext="currentStep += 1"
                       @stepPrev="currentStep -= 1"
                       @selectFBAccount="selectFBAccount"
                       @selectPlatform="selectPlatform"
                       @backToTable="backToTable"
                       style="margin: 60px auto;"></component>
        </keep-alive>
    </div>
</template>

<script>
    import select_FB_account from './components/select_FB_account';
    import select_business_platform from './components/select_business_platform';
    import bind_AD_account from './components/bind_AD_account';

    export default {
        name: 'binding',
        components: {
            select_FB_account,
            select_business_platform,
            bind_AD_account
        },
        data() {
            return {
                currentStep: 0,
                stepView: 'select_FB_account',

                FBAccount: {},
                platform: {}
            };
        },
        methods: {
            selectFBAccount(val) {
                this.FBAccount = val;
            },
            selectPlatform(val) {
                this.platform = val;
            },
            backToTable() {
                this.$emit('changeView', 'adAccountTable');
            }
        },
        activated() {
            this.currentStep = 0;
            this.stepView = 'select_FB_account';
            this.FBAccount = {};
            this.platform = {};
        },
        watch: {
            currentStep(val) {
                switch (val) {
                    case 0:
                        this.stepView = 'select_FB_account';
                        break;
                    case 1:
                        this.stepView = 'select_business_platform';
                        break;
                    case 2:
                        this.stepView = 'bind_AD_account';
                        break;
                }
            }
        }
    };
</script>

<style lang="less" scoped>
    .account-binding {
        /deep/ .el-steps {
            width: 60%;
            margin-left: 25%;

            .el-step {
                flex-basis: 34% !important;

                .el-step__head {
                    width: 130px !important;
                }

                .el-step__line {
                    left: 60px !important;
                    right: -60px !important;
                }
            }
        }

        /deep/ .binding-step-module {
            position: relative;
            width: 310px;
            text-align: center;

            .step-title {
                text-align: center;
                font-weight: 700;
                margin-bottom: 30px;
                font-size: 16px;
            }
        }
    }
</style>
