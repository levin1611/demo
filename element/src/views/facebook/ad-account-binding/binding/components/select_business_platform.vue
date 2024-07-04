<template>
    <div class="binding-step-module">
        <!-- 标题 -->
        <div class="step-title">2. {{ $t('facebook.adAccountBinding.select_business_platform') }}</div>

        <!-- loading -->
        <Spin v-if="loading"
              fix></Spin>

        <!-- 正体 -->
        <div v-else>
            <!-- label -->
            {{ $t('facebook.adAccountBinding.business_platform') }}
            <!-- select -->
            <Select v-model="platformId"
                    style="width:200px;text-align:left;">
                <Option v-for="item in platformList"
                        :key="item.businessId"
                        :value="item.businessId"
                        :label="item.businessName">{{ item.businessName }}</Option>
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
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'select_business_platform',
        props: [
            'FBAccount',
            'platform'
        ],
        data() {
            return {
                loading: false,
                platformList: [],
                platformId: ''
            };
        },
        computed: {
            ...mapState([
                'enterpriseId',
                'userId'
            ])
        },
        methods: {
            // 获取 FB 账号列表
            getPlatformList() {
                // 判断是否有数据
                if (!(this.FBAccount && this.FBAccount.providerUserId)) {
                    this.$Message.error(this.$t('crm.Table.errorOccurred'));
                    return;
                }

                this.loading = true;
                util.ajaxInternational({
                    url: '/social/audienceoptimization/fbBusinessPlatforms',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        providerUserId: this.FBAccount.providerUserId,
                        providerId: 'facebook'
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.platformList = response.data.data || [];
                    } else {
                        this.platformList = [];
                        this.$Message.error(this.$t('facebook.adAccountBinding.error_get_business_platform_list'));
                    }
                    // 如果之前已经选中了 platform 了, 重新判断下当前是否还在 platformList 中
                    if (this.platform) {
                        const platformId = this.platform.businessId;
                        let result;
                        if (platformId) {
                            result = this.platformList.find(item => item.businessId === platformId);
                        }
                        if (result) {
                            // 有匹配, 则更新数据为匹配项
                            this.platformId = platformId;
                            this.$emit('selectPlatform', result);
                        } else {
                            // 无匹配, 则重置数据为初始状态
                            this.platformId = '';
                            this.$emit('selectPlatform', {});
                        }
                    }
                    this.loading = false;
                }).catch(e => {
                    console.error(e);
                    this.$Message.error(this.$t('facebook.adAccountBinding.error_get_business_platform_list'));
                    // 重置数据为初始状态
                    this.platformList = [];
                    this.platformId = '';
                    this.$emit('selectPlatform', {});
                    this.loading = false;
                });
            },

            // 上一步
            handlePrev() {
                this.$emit('stepPrev');
            },
            // 下一步
            handleNext() {
                if (this.platformId) {
                    // 判断是否有数据, 有数据则执行"下一步"
                    const platform = this.platformList.find(item => item.businessId === this.platformId);
                    if (platform) {
                        this.$emit('selectPlatform', platform);
                        this.$emit('stepNext');
                    } else {
                        this.platformId = '';
                        this.$Message.error(this.$t('crm.Table.errorOccurred'));
                    }
                } else {
                    this.$Message.error(this.$t('facebook.adAccountBinding.error_select_business_platform'));
                }
            }
        },
        activated() {
            this.getPlatformList();
        }
    };
</script>
