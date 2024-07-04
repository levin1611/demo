<template>
    <div class="google-account-binding">
        <template v-if="!isGoogleBind">
            <div class="step-title">{{$t('googleAdsBinding.accountBinding.clickToStartBinding')}}</div>
            <div @click="integrateModule">
                <img src="../images/Google-Analytics.svg" style="width: 60%;cursor: pointer;">
            </div>
        </template>
        <template v-else>
            <div class="step-title">{{$t('googleAdsBinding.accountBinding.clickToUnbind')}}</div>
            <div style="position: relative;padding: 10px 0;width: 70%;margin: 0 auto;">
                <img src="../images/Google-Analytics.svg" style="width: 80%;">
                <Icon type="md-close" @click.native="cancelShow=true"
                      style="position: absolute;right: 0;top: 0;cursor: pointer;"/>
                <div>
                    <Button type="primary" @click="handleNext" style="margin-top:20px">
                        {{$t('googleAdsBinding.accountBinding.nextStep')}}
                    </Button>
                </div>
            </div>
        </template>
        <Modal :visible="cancelShow"
               :title="$t('googleAdsBinding.accountBinding.unbind')"
               :modal="false"
               @close="cancelShow = false">
            <p style="margin:20px 0;font-size:14px;text-align:center;">
                {{$t('googleAdsBinding.accountBinding.confirmUnbind')}}
            </p>
            <div slot="footer">
                <Button @click="cancelShow = false">{{ $t('bind.modal_cancel') }}</Button>
                <Button type="primary" @click="handleDisabledGoogle">{{ $t('bind.modal_ok') }}</Button>
            </div>
        </Modal>
        <Modal :visible="googleIntegrateShow"
               title="Google 授权"
               :modal="false"
               @close="googleIntegrateCancel">
            <p style="margin:20px 0;font-size:14px;text-align:center;">
                Google Analytics 账户授权是否成功?
            </p>
            <div slot="footer">
                <Button @click="googleIntegrateCancel">{{ $t('no') }}</Button>
                <Button type="primary" @click="googleIntegrateOk">{{ $t('yes') }}</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import { googleAdsBind } from '@/api/google/index';
    const { getGoogleBindUrl } = googleAdsBind;

    export default {
        name: 'GoogleAccountBinding',
        props: {
            isGoogleBind: {
                type: Boolean,
                default: false
            },
            hasBindGoogle: {
                type: Function,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                cancelShow: false,
                googleIntegrateShow: false
            };
        },
        computed: {
            ...mapState([
                'enterpriseId',
                'userId',
                'fullName'
            ])
        },
        methods: {
            // 点击图标绑定
            integrateModule() {
                getGoogleBindUrl({
                    orgId: this.enterpriseId,
                    operatorId: this.userId,
                    operatorName: this.fullName
                }).then(response => {
                    if (response.code === '1') {
                        this.$Message.info(this.$t('bind.info_beforeAuthorized'));
                        window.setTimeout(() => {
                            window.open(response.data);
                            this.googleIntegrateShow = true;
                        }, 2000);
                    } else {
                        this.$Message.error(this.$t('bind.error_getFailed'));
                    }
                });
            },
            // 更新绑定状态 1-绑定 2-解绑
            updateStatus(status) {
                util.ajax({
                    url: '/cuss-login/common/updateApplicationStatus',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        appSign: 'google',
                        status: status
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        // this.hasBindGoogle()
                        if (status === 1) {
                            this.$emit('bundlingGoogle', true);
                        } else {
                            this.$emit('bundlingGoogle', false);
                            this.googleRevokeToken();
                        }
                    } else {
                        this.$Message.error(this.$t('bind.error_updateEnabled'));
                    }
                });
            },
            googleRevokeToken() {
                util.ajaxInternational({
                    url: '/oversea/ads/googleRevokeToken',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {

                });
            },
            // 解绑 确认
            handleDisabledGoogle() {
                this.cancelShow = false;
                this.$emit('handleBindGoogle', false);
                this.updateStatus(2);
            },
            // 授权成功 是
            googleIntegrateOk() {
                this.googleIntegrateShow = false;
                this.$emit('handleBindGoogle', true);
                this.updateStatus(1);
            },
            // 授权成功 否
            googleIntegrateCancel() {
                this.googleIntegrateShow = false;
            },
            handleNext() {
                this.$emit('stepNext', true);
            }
        },
        created() {

        }
    };
</script>
<style lang="less">
    .google-account-binding {
        width: 310px;
        text-align: center;

        .step-title {
            text-align: center;
            font-weight: 700;
            margin-bottom: 30px;
            font-size: 16px;
        }
    }
</style>
