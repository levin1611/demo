<template>
    <div class="binding-complete">
        <Row>
            <Col :span="7">
                <div class="step-title">{{$t('googleAdsBinding.accountBinding.googleHadBind')}}</div>
                <div style="margin-top:15px">
                    <img src="../../images/Google-logo.svg" style="width: 150px;">
                </div>
            </Col>
            <Col :span="6">
                <div class="step-title">{{$t('googleAdsBinding.accountBinding.customerIDBind')}}</div>
                <div style="margin-top:15px;font-size:12px;">
                    {{$t('googleAdsBinding.accountBinding.customerID')}}{{customerId}}
                </div>
            </Col>
            <Col :span="11">
                <div class="step-title">{{$t('googleAdsBinding.accountBinding.startTrackTemplate')}}</div>
                <Row style="margin-top:15px;font-size:12px;">
                    <Col :span="3">{{$t('googleAdsBinding.accountBinding.trackTemplate')}}</Col>
                    <Col :span="21">
                        <Input v-model="trackingUrlTemplate" type="textarea" :autosize="true"/></Col>
                </Row>
            </Col>
        </Row>
        <div style="margin-top:50px;text-align:center;">
            <Button type="primary" @click="handleChange">{{$t('change')}}</Button>
        </div>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'BindingComplete',
        data() {
            return {
                customerId: '',
                trackingUrlTemplate: ''
            };
        },
        computed: {
            ...mapState([
                'enterpriseId'
            ])
        },
        methods: {
            handleChange() {
                this.$emit('handleEdit', true);
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
                        this.customerId = response.data.data.clientCustomerId;
                        this.getTrackingUrlTemplate();
                    }
                });
            },
            // 获得跟踪模板
            getTrackingUrlTemplate() {
                util.ajaxInternational({
                    url: '/oversea/adsCustomer/getCustomer',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        customerId: this.customerId
                    }
                }).then(response => {
                    if (response.data.code === '1' && response.data.data) {
                        this.trackingUrlTemplate = response.data.data.trackingUrlTemplate;
                    }
                });
            }
        },
        created() {
            this.getConfigInfo();
        }
    };
</script>
<style lang="less">
    .binding-complete {
        padding: 40px 20px;

        .step-title {
            font-weight: 700;
            margin-bottom: 30px
        }
    }
</style>
