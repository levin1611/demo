<template>
    <div>
        <Modal :title="$t('crm.Modal.title_shareCompany')"
               :visible="visible"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               width="520px"
               class="modal">

            <p class="layermain" style="margin:20px 0 10px 0;">
                {{ $t('crm.Modal.shareTo') }}
                <Select v-model="sharedUserId" filterable style="width:200px;margin-left:10px;">
                    <Option v-for="item in salesList" :key="item.id" :value="item.id" :label="item.fullname"></Option>
                </Select>
            </p>
            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button class="piwik_batch_share_company" type="primary" @click="ok">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmCommon } from '@/api/crm/index';

    export default {
        name: 'batchShareCompany',
        props: [
            'visible',
            'ids'
        ],
        computed: {
            ...mapState({
                userName: 'userName',
                fullName: 'fullName',
                userId: 'userId',
                enterpriseId: 'enterpriseId',
                salesList: state => state.crm.salesList
            })
        },
        data() {
            return {
                sharedUserId: null
            };
        },
        methods: {
            ok() {
                if (this.sharedUserId) {
                    crmCommon.share({
                        companyId: this.ids,
                        selectUserId: this.sharedUserId,
                        operateUserId: this.userId
                    }).then(response => {
                        if (response.code === '1') {
                            this.$Message.success(this.$t('crm.Modal.success_shareCompany'));
                            this.$emit('refreshData', { clearSelected: true });
                            // const sale = this.salesList.find(item => item.id === this.sharedUserId);
                            // const afterUser = Object.assign({}, this.managerList);
                            // if (sale) {
                            //     afterUser[sale.id] = sale.fullname || '';
                            // } else {
                            //     afterUser[this.transfered_userId] = '';
                            // }
                            // if (!Object.keys(this.managerList).some(item => item === `${sale.id}`)) {
                            //     this.$saveLog({
                            //         operateType: 10,
                            //         operateModule: 1,
                            //         id: this.id,
                            //         enterpriseId: this.enterpriseId,
                            //         userId: this.userId,
                            //         fullName: this.fullName,
                            //         currentObj: {
                            //             manager_beforeChange: this.managerList,
                            //             manager_afterChange: afterUser
                            //         }
                            //     });
                            // }
                            this.cancel();
                        } else if (response.code === '-6') {
                            this.$Message.error(response.message + this.$t('highSeasSetting.inquriry.overCustomerLimit'));
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_shareCompany'));
                        }
                    });
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_noShareTo'));
                }
            },
            cancel() {
                this.sharedUserId = null;
                this.$emit('update:visible', false);
            }
        },
        watch: {}
    };
</script>
