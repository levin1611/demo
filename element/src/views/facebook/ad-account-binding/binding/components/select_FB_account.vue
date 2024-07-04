<template>
    <div class="binding-step-module">
        <!-- 标题 -->
        <div class="step-title">1. {{ $t('facebook.adAccountBinding.select_FB_account') }}</div>

        <!-- loading -->
        <Spin v-if="loading"
              fix></Spin>

        <!-- 有 FB 账号, select 选择账号 -->
        <div v-else-if="accountList.length">
            <!-- label -->
            {{ $t('facebook.adAccountBinding.FB_account') }}
            <!-- select -->
            <Select v-model="accountId"
                    style="width:200px;text-align:left;">
                <Option v-for="item in accountList"
                        :key="item.providerUserId"
                        :value="item.providerUserId"
                        :label="item.providerUserName">{{ item.providerUserName }}</Option>
            </Select>

            <!-- footer -->
            <div style="margin-top:20px;text-align:center;">
                <!-- 上一步 -->
                <Button @click="handlePrev">{{ $t('facebook.adAccountBinding.prevStep') }}</Button>
                <!-- 下一步 -->
                <Button type="primary"
                        @click="handleNext"
                        style="margin-left:10px">{{ $t('facebook.adAccountBinding.nextStep') }}</Button>
            </div>
        </div>

        <!-- 无 FB 账号, 去绑定账号 -->
        <div v-else>{{ $t('facebook.adAccountBinding.empty_FB_account_list') }}
            <a @click="goToBind">{{$t('facebook.adAccountBinding.gotoBind')}}</a>

            <!-- footer -->
            <div style="margin-top:20px;text-align:center;">
                <!-- 上一步 -->
                <Button @click="handlePrev">{{ $t('facebook.adAccountBinding.prevStep') }}</Button>
            </div>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'select_FB_account',
        props: [
            'FBAccount'
        ],
        data() {
            return {
                loading: false,
                accountList: [],
                accountId: ''
            };
        },
        computed: {
            ...mapState([
                'enterpriseId',
                'userId'
            ]),
            ...mapGetters([
                'isContainsMenu'
            ])
        },
        methods: {
            // 获取 FB 账号列表
            getAccountList() {
                this.loading = true;
                util.ajaxInternational({
                    url: '/social/audienceoptimization/fbPersonPages',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        providerId: 'facebook'
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.accountList = response.data.data || [];
                    } else {
                        this.accountList = [];
                        // this.$Message.error(this.$t('facebook.adAccountBinding.error_get_FB_account_list'));
                    }
                    // 如果之前已经选中了 FB account 了, 重新判断下当前是否还在 accountList 中
                    if (this.FBAccount) {
                        const accountId = this.FBAccount.providerUserId;
                        let result;
                        if (accountId) {
                            result = this.accountList.find(item => item.providerUserId === accountId);
                        }
                        if (result) {
                            // 有匹配, 则更新数据为匹配项
                            this.accountId = accountId;
                            this.$emit('selectFBAccount', result);
                        } else {
                            // 无匹配, 则重置数据为初始状态
                            this.accountId = '';
                            this.$emit('selectFBAccount', {});
                        }
                    }
                    this.loading = false;
                }).catch(e => {
                    console.error(e);
                    this.$Message.error(this.$t('facebook.adAccountBinding.error_get_FB_account_list'));
                    // 重置数据为初始状态
                    this.accountList = [];
                    this.accountId = '';
                    this.$emit('selectFBAccount', {});
                    this.loading = false;
                });
            },

            // 点击跳转去绑定
            goToBind() {
                if (this.isContainsMenu('account_binding')) {
                    // 如果当前权限目录中有账号绑定, 则跳转到账号绑定
                    this.$router.push({
                        name: 'account_binding'
                    });
                } else {
                    // 否则弹出无权限提示
                    this.$Message.warning(this.$t('noAuthorityPath1') + this.$t('menu.account_binding') + this.$t('noAuthorityPath2'));
                }
            },

            // 上一步
            handlePrev() {
                this.$emit('backToTable');
            },
            // 下一步
            handleNext() {
                if (this.accountId) {
                    // 判断是否有数据, 有数据则执行"下一步"
                    const FBAccount = this.accountList.find(item => item.providerUserId === this.accountId);
                    if (FBAccount) {
                        this.$emit('selectFBAccount', FBAccount);
                        this.$emit('stepNext');
                    } else {
                        this.accountId = '';
                        this.$Message.error(this.$t('crm.Table.errorOccurred'));
                    }
                } else {
                    this.$Message.error(this.$t('facebook.adAccountBinding.error_select_FB_account'));
                }
            }
        },
        activated() {
            this.getAccountList();
        }
    };
</script>
