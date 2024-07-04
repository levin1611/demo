<template>
    <div class="customer-id-binding">
        <div class="step-title">{{$t('googleAdsBinding.accountBinding.selectCustomerIDToBind')}}</div>
        <div style="font-size:12px;">
            {{$t('googleAdsBinding.accountBinding.customerID')}}
            <Select v-model="customerId"
                    :multiple="true"
                    popper-class="customerId-select-popper"
                    class="customerId-select">
                <div slot="empty"
                     style="min-height: 50px;">
                    <!-- loading -->
                    <Spin v-if="loading_getId"
                          fix></Spin>

                    <!-- 无数据提示 -->
                    <span v-else
                          style="line-height: 50px; text-align: center;">{{ $t('crm.Table.noData') }}</span>
                </div>

                <Option v-for="item in customerIdList"
                        :key="`${item.clientCustomerId}`"
                        :disabled="`${item.bindType}` === '1'"
                        :value="`${item.clientCustomerId}`"
                        :label="item.displayName">
                    <TooltipAuto :content="item.displayName"></TooltipAuto>
                </Option>
            </Select>
            <div class="GABinding-steps-footer">
                <!-- 使用其他 Google 账号绑定 -->
                <Button @click="handlePrev">{{$t('googleAdsBinding.accountBinding.useOtherGoogleAccount')}}</Button>
                <!-- 下一步 -->
                <Button type="primary"
                        :loading="loading_toNext"
                        @click="handleNext"
                        style="margin-left:10px">{{$t('googleAdsBinding.accountBinding.nextStep')}}</Button>
            </div>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import { googleAdsBind } from '@/api/google/index';
    const { syncGoogleAdsAccountData } = googleAdsBind;

    export default {
        name: 'CustomerIdBinding',
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
                customerId: [],
                customerIdList: [],
                loading_getId: false,
                loading_toNext: false
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
            getCustomerIdList() {
                this.loading_getId = true;
                util.ajaxInternational({
                    url: '/oversea/adsCustomer/getIdList',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        operatorId: this.userId,
                        operatorName: this.fullName,
                        isBindNewGoogle: this.stepData.isBindNewGoogle
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.customerIdList = response.data.data;
                    }
                    this.loading_getId = false;
                }).catch(err => {
                    console.error(err);
                    this.loading_getId = false;
                });
            },
            // 获取customerID
            getConfigInfo() {
                util.ajaxInternational({
                    url: '/oversea/ads/getConfigInfo',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        if (response.data.data && response.data.data.clientCustomerId) {
                            this.customerId = [].concat(`${response.data.data.clientCustomerId}`);
                        }
                    }
                });
            },
            handlePrev() {
                this.$emit('stepPrev', true);
                this.$emit('update:stepData', Object.assign({}, this.stepData, {
                    openGoogleBindWindow: true
                }));
            },
            handleNext() {
                if (this.customerId.length) {
                    this.loading_toNext = true;
                    util.ajaxInternational({
                        url: '/oversea/ads/updateCustomerId',
                        method: 'get',
                        params: {
                            orgId: this.enterpriseId,
                            customerId: this.customerId.join(','),
                            operatorId: this.userId,
                            operatorName: this.fullName
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            // 后台要求绑定 ads 账户成功后, 调用此接口同步数据
                            syncGoogleAdsAccountData({
                                orgId: this.enterpriseId
                            });
                            this.$emit('syncCustomerId', this.customerId);
                            this.$emit('stepNext', true);
                        }
                        this.loading_toNext = false;
                    }).catch(err => {
                        console.error(err);
                        this.loading_toNext = false;
                    });
                } else {
                    this.$Message.warning(this.$t('googleAdsBinding.accountBinding.customerIDWarning'));
                }
            }
        },
        created() {
            this.getCustomerIdList();
            // this.getConfigInfo();
        },
        watch: {}
    };
</script>

<style lang="less">
    .customer-id-binding {
        text-align: center;

        .step-title {
            text-align: center;
            font-weight: 700;
            padding-top: 10px;
            margin-bottom: 20px;
            font-size: 16px;
        }
    }

    .customerId-select {
        width: 500px;
        text-align:left;

        .el-select__tags {
            max-height: 130px;
            overflow-y: auto;

            .el-tag {
                margin-right: 10px;
            }
        }
    }

    .customerId-select-popper {
        .el-select-dropdown__item {
            width: 500px;
        }
    }
</style>

