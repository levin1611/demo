<template>
    <div class="account-binding">
        <!-- 顶部提示语 -->
        <div class="account-binding-header">
            <!-- 提示语 -->
            <span class="account-binding-title">{{ $t('menu.google_ads_binding') }}</span>
        </div>

        <template v-if="!isGoogleBind || isEdit || isBindNewAccount">
            <!-- 绑定步骤条 -->
            <Steps :active="currentStep"
                   finish-status="success">
                <Step :title="$t('googleAdsBinding.accountBinding.googleAccountBinding')"></Step>
                <Step :title="$t('googleAdsBinding.accountBinding.customerIdBinding')"></Step>
                <Step :title="$t('googleAdsBinding.accountBinding.syncTrackingTemplate')"></Step>
            </Steps>

            <!-- 绑定步骤视图 -->
            <component :is="stepView"
                       :customerId="customerId"
                       :isGoogleBind="isBindNewAccount ? false : isGoogleBind"
                       :stepData.sync="stepData"
                       :ref="stepView"
                       @stepNext="currentStep+=1"
                       @stepPrev="currentStep-=1"
                       @handleEdit="updateIsEdit"
                       @syncCustomerId="syncCustomerId"
                       style="margin: 50px auto;"></component>
        </template>
        <template v-else-if="isGoogleBind">
            <binding-complete @handleEdit="updateIsEdit"></binding-complete>
        </template>

        <!-- 底部取消绑定按钮 -->
        <div v-if="stepView !== 'sync-tracking-template'"
             class="account-binding-footer">
            <!-- 取消绑定 -->
            <Button @click="cancelBind"
                    type="text"
                    class="account-binding-cancelBtn">{{ $t('googleAdsBinding.accountBinding.cancelBind') }}</Button>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import GoogleAccountBinding from './components/GoogleAccountBinding';
    import CustomerIdBinding from './components/CustomerIdBinding';
    import SyncTrackingTemplate from './components/SyncTrackingTemplate';
    import BindingComplete from './components/BindingComplete';

    export default {
        name: 'AccountBinding',
        props: {
            // google 多账号绑定需求相关, 以此标识此时是在绑定新账号
            // 这是在原有单账号绑定基础上改的, 可能不利于理解维护, 后期如果没啥问题可以去掉相关逻辑
            isBindNewAccount: {
                type: Boolean,
                default: true
            },
            // 从 ads 账号列表页跳转时带过来的参数
            jumpData: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        components: {
            GoogleAccountBinding,
            CustomerIdBinding,
            SyncTrackingTemplate,
            BindingComplete
        },
        data() {
            return {
                isEdit: false,
                currentStep: -1,
                stepView: '',
                customerId: [],

                // 在绑定过程多个 step 对应的页面之间传递数据, 控制页面行为
                stepData: {}
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                isGoogleBind: state => state.google.isGoogleBind
            })
        },
        methods: {
            // 取消绑定
            cancelBind() {
                this.$confirm(this.$t('googleAdsBinding.accountBinding.tip_cancelBindAccount'), this.$t('googleAdsBinding.accountBinding.title_cancelBindAccount'), {
                    confirmButtonText: this.$t('confirm'),
                    cancelButtonText: this.$t('cancel'),
                    type: 'warning'
                }).then(() => {
                    this.$emit('changeView', 'GoogleAdsAccount');
                });
            },

            // 判断是否绑定谷歌账号
            hasBindGoogle() {
                // 如果是绑定新账号流程, 不需要 isGoogleBind 数据, 不需要继续请求, 同时直接打开确认绑定弹框, 因为从账号列表跳转过来时已经打开了 google 授权页面了
                if (this.isBindNewAccount) {
                    this.$nextTick(() => {
                        if (this.$refs['google-account-binding']) {
                            this.$refs['google-account-binding'].googleIntegrateShow = true;
                        }
                    });

                    return;
                }

                util.ajaxInternational({
                    url: '/oversea/adsCustomer/hasBindGoogle',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    // 更新 Vuex "Google 账号绑定是否已失效"状态值
                    this.$store.commit('setIsGoogleInvalid', response.data.code === '0');
                    if (response.data.code === '1') {
                        this.$store.commit('setIsGoogleBind', true);
                    } else {
                        this.$store.commit('setIsGoogleBind', false);
                    }
                });
            },
            updateIsEdit(val) {
                // 新增 ads 账户, 绑定完成后直接跳转回去
                if (this.isBindNewAccount && !val) {
                    this.$emit('changeView', 'GoogleAdsAccount');
                    return;
                }

                this.isEdit = val;
            },
            syncCustomerId(val) {
                this.customerId = val;
            }
        },
        created() {
            this.hasBindGoogle();
            // 跳转到指定步骤
            this.currentStep = this.jumpData.step || 0;
        },
        watch: {
            currentStep(val) {
                switch (val) {
                    case 0:
                        this.stepView = 'google-account-binding';

                        // 直接进入"第一步"界面或从其他页面返回"第一步"界面, 则说明是绑定新 Google 账户
                        this.stepData = Object.assign({}, this.stepData, {
                            isBindNewGoogle: true
                        });
                        break;
                    case 1:
                        this.stepView = 'customer-id-binding';
                        // 进入/回到这一步, 都先清空之前的选中数据
                        this.customerId = [];
                        break;
                    case 2:
                        this.stepView = 'sync-tracking-template';
                        break;
                }
            },
            isEdit(val) {
                if (!val) {
                    this.currentStep = 0;
                }
            }
        }
    };
</script>

<style lang="less">
    .account-binding {
        .el-steps {
            width: 60%;
            margin-left: 25%;

            .el-step {
                flex-basis: 34% !important;

                &:first-child {
                    .el-step__line {
                        background-color: #FF5F2A;
                    }
                }

                .el-step__head {
                    width: 130px !important;

                    &.is-process {
                        color: #FF752A;
                        border-color: #FF752A;

                        .el-step__icon {
                            &.is-text {
                                background-color: #FF752A;

                                .el-step__icon-inner {
                                    color: #FFF;
                                }
                            }
                        }
                    }

                    &.is-success {
                        color: #FF752A;
                        border-color: #FF752A;

                        .el-step__line {
                            background-color: #FF752A;
                        }
                    }
                }

                .el-step__title {
                    &.is-success, &.is-process {
                        color: #FF5F2A;
                    }
                }

                .el-step__line {
                    left: 60px !important;
                    right: -60px !important;
                }
            }
        }

        &-header {
            margin: 20px 0;
        }

        &-title {
            line-height: 22px;
            font-size: 16px;
            font-weight: 500;
        }

        &-footer {
            position: absolute;
            left: 30px;
            bottom: 30px;
        }

        &-cancelBtn {
            color: #EA4335;

            &:hover {
                color: #EA4335;
            }
        }

        .GABinding-steps-footer {
            position: absolute;
            right: 100px;
            bottom: 30px;
        }
    }
</style>
