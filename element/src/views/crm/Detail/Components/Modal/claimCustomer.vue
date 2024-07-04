<template>
    <div class="claimCustomer_box">
        <Modal :title="$t('crm.Modal.title_claimCustomer_new')"
               :visible="visible"
               :show-close="true"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               @close="() => cancel()"
               width="520px">
            <p style="margin:0px 0px 14px;font-size:14px;line-height: 22px;color: #333333;">
                <!--确定要认领-->
                <!--<span v-text="companyDetail.companyName" style="font-weight:bold;margin:0 5px;"></span>-->
                <!--？-->
                {{ $t('crm.Modal.confirmClaimCustomer') }}
            </p>
            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button class="piwik_claim_customer" type="primary" @click="ok">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmInquiry } from '@/api/crm/index';

    export default {
        name: 'claimCustomer',
        props: [
            'visible',
            'id'
        ],
        computed: {
            ...mapState([
                'enterpriseId',
                'userId'
            ])
        },
        methods: {
            // 认领公海询盘
            ok() {
                crmInquiry.inquiryClaim({
                    companyId: this.id,
                    userId: this.userId
                }).then(response => {
                    if (response.code === '1') {
                        this.$Message.success(this.$t('crm.Modal.success_claimCustomer'));
                        this.$emit('update:visible', false);
                        this.$emit('claimSuccess');
                    } else if (response.code === '-6') {
                        this.$Message.error(response.message + this.$t('highSeasSetting.inquriry.overCustomerLimit'));
                    } else {
                        // this.$Message.error(this.$t('crm.Modal.error_claimCustomer'));
                        const str = response.message === '' ? this.$t('crm.Modal.error_claimCustomer') : response.message;
                        this.$Message.error(str);
                    }
                });
            },
            cancel() {
                this.$emit('update:visible', false);
            }
        }
    };
</script>
<style lang="less" scoped>
.claimCustomer_box {
    /deep/ .el-dialog__header{
        padding-left: 24px!important;
        padding-top: 24px!important;
    }
    /deep/ .el-dialog__body{
        padding-left: 24px!important;
    }
}

</style>