<template>
    <div class="google-account-binding">
        <template v-if="!(isGoogleBind || bundlingGoogle)">
            <div class="step-title">{{$t('googleAdsBinding.accountBinding.clickToStartBinding')}}</div>
            <div @click="integrateModule">
                <svg aria-hidden="true"
                     style="width: 140px; margin-top: -90px;cursor: pointer;">
                    <use xlink:href="#custom-googleAccount"></use>
                </svg>
            </div>
        </template>
        <template v-else>
            <div class="step-title">
                <template v-if="isGoogleBind">{{ $t('googleAdsBinding.accountBinding.clickToUnbind') }}</template>
                <template v-else>{{ $t('googleAdsBinding.accountBinding.boundTip') }}</template>
            </div>
            <div style="width: 70%;margin: 0 auto;">
<!--                <img src="../../images/Google-logo.svg" style="width: 140px;">-->
                <svg aria-hidden="true"
                     style="width: 140px; margin-top: -90px;">
                    <use xlink:href="#custom-googleAccount"></use>
                </svg>
                <Icon v-if="isGoogleBind"
                      type="md-close"
                      @click.native="cancelShow=true"
                      style="position: absolute;right: 0;top: 0;cursor: pointer;"/>
                <div class="GABinding-steps-footer">
                    <Button type="primary"
                            @click="handleNext">
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
               title="Google AdWords"
               :modal="false"
               @close="googleIntegrateCancel">
            <p style="margin:20px 0;font-size:14px;text-align:center;">
                {{ $t('bind.confirm_authorized') }}
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
            // 为适应"google 多账号绑定"需求, 此处不从 vuex 取了, 从父组件传入
            isGoogleBind: Boolean,
            // 在绑定过程多个 step 对应的页面之间传递数据, 控制页面行为
            stepData: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                // 本页面点击绑定/解绑后更新的状态, 与 isGoogleBind 标识("整个流程已经走完了, 已绑定成功")区分开
                bundlingGoogle: false,
                cancelShow: false,
                googleIntegrateShow: false
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName'
            })
        },
        methods: {
            // 点击图标绑定
            integrateModule() {
                getGoogleBindUrl({
                    orgId: this.enterpriseId,
                    operatorId: this.userId,
                    operatorName: this.fullName
                }).then(res => {
                    if (res.code === '1') {
                        this.$Message.info(this.$t('bind.info_beforeAuthorized'));
                        window.setTimeout(() => {
                            window.open(res.data);
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
                        if (status === 1) {
                            this.bundlingGoogle = true;
                        } else {
                            this.bundlingGoogle = false;

                            // 多账号绑定情况下, 此数据始终为 false , 不更新 vuex 值, 不调用解绑接口
                            if (this.isGoogleBind) {
                                this.$store.commit('setIsGoogleBind', false);
                            }
                            this.googleRevokeToken();
                        }
                    } else {
                        this.$Message.error(this.$t('bind.error_updateEnabled'));
                    }
                });
            },
            // 解绑 Google 账号
            googleRevokeToken() {
                util.ajaxInternational({
                    url: '/oversea/ads/googleRevokeToken',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId
                    }
                });
            },
            // 解绑 确认
            handleDisabledGoogle() {
                this.cancelShow = false;
                this.updateStatus(2);
            },
            // 授权成功 是
            googleIntegrateOk() {
                this.googleIntegrateShow = false;
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
        watch: {
            stepData: {
                handler(val) {
                    if (val.openGoogleBindWindow) {
                        // 新窗口打开 Google 绑定页面
                        this.integrateModule();

                        // 改回 false , 避免之后改 true 时无法触发 watch
                        this.$emit('update:stepData', Object.assign({}, this.stepData, {
                            openGoogleBindWindow: false
                        }));
                    }
                },
                deep: true,
                immediate: true
            }
        }
    };
</script>

<style lang="less">
    .google-account-binding {
        text-align: center;

        .step-title {
            text-align: center;
            font-weight: 700;
            padding-top: 10px;
            margin-bottom: 40px;
            font-size: 16px;
        }
    }
</style>
