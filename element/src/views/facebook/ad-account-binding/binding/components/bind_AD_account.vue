<template>
    <div class="binding-step-module">
        <!-- 标题 -->
        <div class="step-title">3. {{ $t('facebook.adAccountBinding.select_AD_account') }}</div>

        <!-- loading -->
        <Spin v-if="loading"
              fix></Spin>

        <!-- 正体 -->
        <div v-else>
            <!-- label -->
            {{ $t('facebook.adAccountBinding.adAccount') }}
            <!-- select -->
            <Select v-model="adAccountId"
                    style="width:200px;text-align:left;">
                <Option v-for="item in adAccountList"
                        :key="item.id"
                        :value="item.id"
                        :label="item.name"
                        :disabled="item.disabled">{{ item.name }}</Option>
            </Select>

            <!-- footer -->
            <div style="margin-top:20px;text-align:center;">
                <!-- 上一步 -->
                <Button @click="handlePrev">{{ $t('facebook.adAccountBinding.prevStep') }}</Button>
                <!-- 完成 -->
                <Button type="primary"
                        @click="handleComplete"
                        style="margin-left:10px">{{ $t('facebook.adAccountBinding.complete') }}</Button>
            </div>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'bind_AD_account',
        props: [
            'FBAccount',
            'platform'
        ],
        data() {
            return {
                loading: false,
                adAccountList: [],
                bindedAdAccounts: [],
                adAccountId: ''
            };
        },
        computed: {
            ...mapState([
                'enterpriseId',
                'userId',
                'userName'
            ])
        },
        methods: {
            // 获取 FB 账号列表
            getAdAccountList() {
                // 判断是否有数据
                if (!(this.FBAccount && this.FBAccount.providerUserId) || !(this.platform && this.platform.businessId)) {
                    this.$Message.error(this.$t('crm.Table.errorOccurred'));
                    return;
                }

                this.loading = true;
                util.ajaxInternational({
                    url: '/social/audienceoptimization/fbClientAdAccounts',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        providerId: 'facebook',
                        providerUserId: this.FBAccount.providerUserId,
                        businessId: this.platform.businessId
                    }
                }).then(async response => {
                    if (response.data.code === '1') {
                        await this.getBindedAdAccounts();
                        const dataList = response.data.data || [];
                        // 设置已绑定 ad account 为 disabled 项
                        this.adAccountList = dataList.map(item => {
                            item.disabled = Boolean(this.bindedAdAccounts.find(account => account.accountId === item.id));
                            return item;
                        });
                    } else {
                        this.adAccountList = [];
                        this.$Message.error(this.$t('facebook.adAccountBinding.error_get_adAccount_list'));
                    }
                    // 如果之前已经选中了 AD account 了, 重新判断下当前是否还在 adAccountList 中
                    if (this.adAccountId) {
                        const result = this.adAccountList.find(item => item.id === this.adAccountId);
                        if (!result || result.disabled) {
                            // 无匹配或已绑定, 则重置数据为初始状态
                            this.adAccountId = '';
                        }
                    }
                    this.loading = false;
                }).catch(e => {
                    console.error(e);
                    this.$Message.error(this.$t('facebook.adAccountBinding.error_get_adAccount_list'));
                    // 重置数据为初始状态
                    this.adAccountList = [];
                    this.adAccountId = '';
                    this.loading = false;
                });
            },
            // 获取 fb 账号已绑定的 ad account
            getBindedAdAccounts() {
                return util.ajaxInternational({
                    url: '/oversea/fbAdAccount/getListByOauthConfigId',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        oauthConfigId: this.FBAccount.oauthConfigId
                    }
                }).then(({ data }) => {
                    if (data.code === '1') {
                        this.bindedAdAccounts = data.data || [];
                    } else {
                        this.bindedAdAccounts = [];
                    }
                    return Promise.resolve(true);
                }).catch(err => {
                    console.error(err);
                    this.bindedAdAccounts = [];
                    return Promise.resolve(true);
                });
            },

            // 上一步
            handlePrev() {
                this.$emit('stepPrev');
            },
            // 完成
            handleComplete() {
                if (this.adAccountId) {
                    this.bindAdAccount();
                } else {
                    this.$Message.error(this.$t('facebook.adAccountBinding.error_select_adAccount'));
                }
            },
            // 发送绑定请求
            bindAdAccount() {
                // 判断是否有数据, 有数据则发送绑定请求
                const adAccount = this.adAccountList.find(item => item.id === this.adAccountId);
                if (!adAccount) {
                    this.adAccountId = '';
                    this.$Message.error(this.$t('crm.Table.errorOccurred'));
                    return;
                }

                this.loading = true;
                util.ajaxInternational({
                    url: '/oversea/fbAdAccount/save',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        oauthConfigId: this.FBAccount.oauthConfigId,
                        accountId: adAccount.id,
                        accountName: adAccount.name,
                        createUserId: this.userId,
                        createUserName: this.userName
                    }
                }).then(response => {
                    this.loading = false;
                    switch (response.data.code) {
                        case '1':
                            // 成功
                            this.$emit('backToTable');
                            this.$Message.success(this.$t('facebook.adAccountBinding.success_bind_adAccount'));
                            break;
                        case '-101':
                            // 重复(已绑定)
                            // 清空已选
                            this.adAccountId = '';
                            // 设置 adAccountList 中相应选项为 disabled
                            adAccount.disabled = true;
                            this.$Message.error(this.$t('facebook.adAccountBinding.error_existed_adAccount'));
                            break;
                        default:
                            // 失败
                            this.$Message.error(this.$t('facebook.adAccountBinding.error_bind_adAccount'));
                    }
                }).catch(e => {
                    console.error(e);
                    this.$Message.error(this.$t('facebook.adAccountBinding.error_bind_adAccount'));
                    this.loading = false;
                });
            }
        },
        activated() {
            this.getAdAccountList();
        }
    };
</script>
