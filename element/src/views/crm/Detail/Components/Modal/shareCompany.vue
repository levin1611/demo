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
                <Button class="piwik_share_company" type="primary" @click="ok">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmCommon } from '@/api/crm/index';

    export default {
        name: 'shareCompany',
        props: [
            'visible',
            'id',
            'managerIds',
            'managerNames',
            'flag_update_detail'
        ],
        computed: {
            ...mapState({
                userName: 'userName',
                fullName: 'fullName',
                userId: 'userId',
                enterpriseId: 'enterpriseId',
                salesList: state => state.crm.salesList
            }), // 从 vuex 中获取属性
            managerList() {
                const temp_ids = this.managerIds ? this.managerIds.split(',') : [];
                if (temp_ids.length) {
                    const temp_names = this.managerNames ? this.managerNames.split(',') : [];
                    const temp = {};
                    temp_ids.forEach((item, index) => {
                        temp[item] = temp_names[index] || '';
                    });
                    return temp;
                }
                return undefined;
            }
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
                        companyId: this.id,
                        selectUserId: this.sharedUserId,
                        operateUserId: this.userId
                    }).then(response => {
                        if (response.code === '1') {
                            this.$emit('update:flag_update_detail', !this.flag_update_detail);
                            this.$emit('refreshCheck');
                            this.$Message.success(this.$t('crm.Modal.success_shareCompany'));

                            const sale = this.salesList.find(item => item.id === this.sharedUserId);
                            const afterUser = Object.assign({}, this.managerList);
                            if (sale) {
                                afterUser[sale.id] = sale.fullname || '';
                            } else {
                                afterUser[this.transfered_userId] = '';
                            }
                            if (!Object.keys(this.managerList).some(item => item === `${sale.id}`)) {
                                this.$saveLog({
                                    operateType: 10,
                                    operateModule: 1,
                                    id: this.id,
                                    enterpriseId: this.enterpriseId,
                                    userId: this.userId,
                                    fullName: this.fullName,
                                    currentObj: {
                                        manager_beforeChange: this.managerList,
                                        manager_afterChange: afterUser
                                    }
                                });
                            }
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
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        // 获取全部销售人员
                        this.$store.dispatch('getSalesList');
                    }
                },
                immediate: true
            }
        }
    };
</script>
