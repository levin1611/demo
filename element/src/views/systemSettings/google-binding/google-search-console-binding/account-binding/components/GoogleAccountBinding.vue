<template>
    <div class="google-account-binding">
        <!-- 未绑定 Google 账号, 点击开始绑定 -->
        <template v-if="!googleAccountList.length">
            <div class="step-title">{{$t('googleAdsBinding.accountBinding.clickToStartBinding')}}</div>
            <div @click="integrateModule"
                 class="google-bind-icon">
<!--                <svg aria-hidden="true"-->
<!--                     style="width: 140px; margin-top: -90px;cursor: pointer;">-->
<!--                    <use xlink:href="#custom-googleAccount"></use>-->
<!--                </svg>-->
                <img src="../../images/Google-search-console-logo.svg">
                Google Search Console
            </div>
        </template>
        <template v-else>
            <div class="step-title">{{ $t('googleAdsBinding.searchConsoleBinding.clickToStartBinding') }}</div>
            <div class="google-account-list">
                <!-- 显示现有 Google 账号 -->
                <div v-for="item in googleAccountList"
                     :key="item.id"
                     @click="selectGoogleAccount(item)"
                     :class="{ 'google-account__selected': item.id === currGoogleAccount.id, 'google-account__disabled': item.grantStatus === 2 }"
                     class="google-account">{{ item.googleAccount }}
                    <span v-if="item.grantStatus === 2"
                          class="google-account-status">{{ $t('invalid') }}</span>
                </div>
                <!-- 使用其他 Google 账号 -->
                <div @click="integrateModule"
                     class="bind-new-account">{{$t('googleAdsBinding.accountBinding.useOtherGoogleAccount')}}</div>
            </div>
        </template>

        <!-- 底部按钮 -->
        <div v-if="currGoogleAccount.id"
             class="searchConsoleBinding-steps-footer">
            <!-- 下一步 -->
            <Button type="primary"
                    @click="handleNext">{{ $t('facebook.adAccountBinding.nextStep') }}</Button>
        </div>

        <!-- 绑定完成提示框 -->
        <Modal :visible="googleIntegrateShow"
               title="Google Search Console"
               width="487px"
               :append-to-body="true"
               :modal-append-to-body="false"
               @close="googleIntegrateCancel">
            <div style="color: #333;">{{ $t('bind.confirm_authorized') }}</div>

            <div slot="footer">
                <Button size="large"
                        @click="googleIntegrateCancel">{{ $t('no') }}</Button>
                <Button type="primary"
                        size="large"
                        @click="googleIntegrateOk">{{ $t('yes') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { searchConsoleBinding } from '@/api/google/index';

    export default {
        name: 'GoogleAccountBinding',
        props: {
            // 已绑定的 Google 账号
            googleAccountList: {
                type: Array,
                default() {
                    return [];
                }
            },
            // 当前选中的 Google 账号
            currGoogleAccount: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                // 本页面点击绑定/解绑后更新的状态, 与 isGoogleBind 标识("整个流程已经走完了, 已绑定成功")区分开
                bundlingGoogle: false,
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
            // 跳转到 Google 绑定页面
            integrateModule() {
                searchConsoleBinding.getGoogleBindUrl({
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
            // 选中已存在的 Google 账号
            selectGoogleAccount(account) {
                // 授权失效, 退出
                if (account.grantStatus === 2) {
                    return;
                }

                // 选中账号
                this.$emit('selectGoogleAccount', account);
            },
            // 授权成功 是
            googleIntegrateOk() {
                this.googleIntegrateShow = false;
                this.$emit('bindNewAccount');
            },
            // 授权成功 否
            googleIntegrateCancel() {
                this.googleIntegrateShow = false;
            },
            handleNext() {
                this.$emit('stepNext', true);
            }
        },
        mounted() {
            if (sessionStorage.getItem('openBindModal')) {
                this.googleIntegrateShow = true;
                sessionStorage.removeItem('openBindModal');
            }
        }
    };
</script>

<style lang="less">
    .google-account-binding {
        text-align: center;
        color: #333;

        .step-title {
            text-align: center;
            font-weight: 500;
            margin-bottom: 30px;
            font-size: 16px;
            line-height: 18px;
            color: #333;
        }
    }

    .google-bind-icon {
        display: inline-block;
        font-size: 16px;
        cursor: pointer;

        img {
            width: 60px;
            margin-right: 20px;
            vertical-align: middle;
        }
    }

    .google-account-list {
        margin: 0 auto;
        width: 400px;
        max-height: 370px;
        overflow-y: auto;
        border: 1px solid #EBEEF5;

        .google-account, .bind-new-account {
            padding: 10px 55px;
            font-size: 14px;
            line-height: 22px;
            cursor: pointer;

            &:hover {
                background: #EBEEF5;
                color: #3B78DE;
            }
        }

        .google-account {
            border-bottom: 1px solid #EBEEF5;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .google-account__selected {
            background: #EBEEF5;
            color: #3B78DE;
        }

        .google-account__disabled {
            background: #F1F2F3;
            color: rgba(0, 0, 0, 0.28);
            cursor: not-allowed;

            &:hover {
                background: #F1F2F3;
                color: rgba(0, 0, 0, 0.28);
            }
        }

        .google-account-status {
            position: absolute;
            right: 8px;
            color: #EA4335;
            font-size: 12px;
        }

        .bind-new-account {
            width: 100%;
            color: #3B78DE;
        }
    }
</style>
