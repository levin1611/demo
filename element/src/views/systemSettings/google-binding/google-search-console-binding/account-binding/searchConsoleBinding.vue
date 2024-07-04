<template>
    <div class="searchConsoleBinding">
        <Spin v-if="loading"
              fix></Spin>

        <!-- 顶部提示语 -->
        <div class="searchConsoleBinding-header">
            <!-- 提示语 -->
            <span class="searchConsoleBinding-title">{{ $t('googleAdsBinding.searchConsoleBinding.googleSearchConsoleSiteBinding') }}</span>
        </div>

        <!-- 绑定步骤条 -->
        <Steps :active="currentStep"
               align-center
               finish-status="success"
               class="searchConsoleBinding-steps">
            <Step :title="$t('googleAdsBinding.accountBinding.googleAccountBinding')"></Step>
            <Step :title="$t('googleAdsBinding.searchConsoleBinding.selectSiteProperty')"></Step>
        </Steps>

        <!-- 绑定步骤视图 -->
        <component :is="stepView"
                   :currGoogleAccount="currGoogleAccount"
                   :googleAccountList="googleAccountList"
                   :ref="stepView"
                   @stepNext="currentStep+=1"
                   @stepPrev="currentStep-=1"
                   @bindNewAccount="afterBindNewAccount"
                   @selectGoogleAccount="selectGoogleAccount"
                   @saveSite="afterSaveSite"
                   style="margin: 50px auto;"></component>

        <!-- 底部取消绑定按钮 -->
        <div class="searchConsoleBinding-footer">
            <!-- 取消绑定 -->
            <Button @click="visible_cancelBind = true"
                    type="text"
                    class="searchConsoleBinding-cancelBtn">{{ $t('googleAdsBinding.accountBinding.cancelBind') }}</Button>
        </div>

        <!-- 取消绑定确认 -->
        <Modal :visible.sync="visible_cancelBind"
               :title="$t('googleAdsBinding.accountBinding.title_cancelBindAccount')"
               width="487px"
               :append-to-body="true"
               :modal-append-to-body="false">
            <div style="color: #333;">{{ $t('googleAdsBinding.searchConsoleBinding.tip_cancelBindAccount') }}</div>

            <div slot="footer">
                <Button size="large"
                        @click="visible_cancelBind = false">{{ $t('cancel') }}</Button>
                <Button type="primary"
                        size="large"
                        @click="cancelBind">{{ $t('confirm') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { searchConsoleBinding } from '@/api/google/index';
    import GoogleAccountBinding from './components/GoogleAccountBinding';
    import SiteBinding from './components/SiteBinding';

    export default {
        name: 'searchConsoleBinding',
        components: {
            GoogleAccountBinding,
            SiteBinding
        },
        data() {
            return {
                loading: false,
                currentStep: -1,
                stepView: '',
                currGoogleAccount: {},
                googleAccountList: [],

                visible_cancelBind: false
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId'
            })
        },
        methods: {
            // 取消绑定
            cancelBind() {
                this.$emit('changeView', 'BoundSiteList');
            },

            // 获取已绑定的 Google 账号列表
            getAccountList() {
                this.loading = true;
                this.googleAccountList = [];
                searchConsoleBinding.getAccountList({
                    orgId: this.enterpriseId
                }).then(res => {
                    if (res.code === '1') {
                        this.googleAccountList = Array.isArray(res.data) ? res.data : [];
                    }
                    this.loading = false;
                }).catch(e => {
                    this.loading = false;
                });
            },
            // 子组件选中 Google 账号
            selectGoogleAccount(val) {
                this.currGoogleAccount = val;
            },
            // 新绑定了账号
            afterBindNewAccount() {
                // 获取已绑定 Google 账号
                this.getAccountList();
            },
            // 保存 site
            afterSaveSite() {
                this.$emit('changeView', 'BoundSiteList');
            }
        },
        created() {
            // 获取已绑定 Google 账号
            this.getAccountList();
            // 跳转到指定步骤
            this.currentStep = 0;
        },
        watch: {
            currentStep(val) {
                switch (val) {
                    case 0:
                        // 进入/回到这一步, 都先清空之前的选中数据
                        this.currGoogleAccount = {};
                        this.stepView = 'GoogleAccountBinding';
                        break;
                    case 1:
                        this.stepView = 'SiteBinding';
                        break;
                }
            }
        }
    };
</script>

<style lang="less">
    .searchConsoleBinding {
        padding: 30px;

        &-steps {
            width: 50%;
            max-width: 500px;
            margin: 20px auto 0;
        }

        .el-steps {
            .el-step {
                &:first-child {
                    .el-step__line {
                        background-color: #FF5F2A;
                    }
                }

                .el-step__head {
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
                    margin: 0 20% !important;
                }
            }
        }

        &-title {
            line-height: 28px;
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }

        &-footer {
            position: absolute;
            left: 30px;
            bottom: 30px;
        }

        &-cancelBtn {
            font-size: 14px;
            color: #EA4335;

            &:hover {
                color: #EA4335;
            }
        }

        .searchConsoleBinding-steps-footer {
            position: absolute;
            right: 100px;
            bottom: 30px;
        }
    }
</style>
