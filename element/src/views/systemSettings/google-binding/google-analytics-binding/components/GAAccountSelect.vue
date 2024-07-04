<template>
    <div class="customer-id-binding">
        <div class="step-title">选择 Google Analytics 账号</div>
        <div style="font-size:12px;">
            GA 账号:
            <Select v-model="currentGAAccount" style="width:200px;text-align:left;" @change="handleChangeSelect">
                <Option v-for="item in googleAnalyticsAccounts" :value="`${item.gaAccountName}(${item.gaAccountId})`" :key="item.gaAccountName">
                    {{`${item.gaAccountName}(${item.gaAccountId})`}}
                </Option>
            </Select>
            <div style="margin-top:20px;text-align:center;">
                <Button type="primary" @click="handlePrev">{{$t('googleAdsBinding.accountBinding.prevStep')}}</Button>
                <Button type="primary" @click="handleNext" style="margin-left:10px">
                    {{$t('googleAdsBinding.accountBinding.nextStep')}}
                </Button>
            </div>
        </div>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import {mapState} from 'vuex';

    export default {
        name: 'GAAccountSelect',
        props: {
            isGoogleBind: {
                type: Boolean,
                default: false
            },
            googleAnalyticsAccounts: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data: function() {
            return {
                currentGAAccount: '' // 当前选中的GA账号
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId
            })
        },
        methods: {
            /*  根据选中的GA账号获取对应的媒体资源列表 */
            handleChangeSelect() {
                this.$emit('updateSelectGAAccount', this.currentGAAccount);
            },
            handlePrev() {
                this.$emit('stepPrev', true);
            },
            handleNext() {
                if (this.currentGAAccount) {
                    this.$emit('stepNext', true);
                } else {
                    this.$Message.warning(this.$t('googleAdsBinding.accountBinding.customerIDWarning'));
                }
            }
        },
        created() {},
        watch: {}
    };
</script>
<style lang="less">
    .customer-id-binding {
        width: 400px;
        text-align: center;

        .step-title {
            text-align: center;
            font-weight: 700;
            margin-bottom: 30px;
            font-size: 16px;
        }
    }
</style>

