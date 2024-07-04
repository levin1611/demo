<template>
    <div style="position: relative;">
        <Modal :visible="visible"
               :title="$t('crm.Modal.title_closeInquiry')"
               width="600px"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :append-to-body="true"
               class="modal">
            <div style="padding: 20px 40px;">
                <Form label-position="left" label-width="115px">
                    <FormItem :label="$t('crm.Modal.closeReason')">
                        <Select v-model="reason"
                                style="width: 100%;">
                            <Option v-for="item in reason_list" :key="item.attrId" :value="item.attrId" :label="item.attrName"></Option>
                        </Select>
                    </FormItem>
                    <FormItem :label="$t('crm.Modal.details')">
                        <Input v-model="detail" type="textarea" :rows="5"></Input>
                    </FormItem>
                </Form>
            </div>

            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button class="piwik_close_inquiry" @click="ok" type="primary">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmInquiry } from '@/api/crm/index';

    export default {
        name: 'closeInquiry',
        props: [
            'visible',
            'followUp',
            'inquiryId'
        ],
        data() {
            return {
                loading: false,
                reason_list: [],
                reason: 0,
                detail: ''
            };
        },
        computed: {
            ...mapState([
                'enterpriseId',
                'userId',
                'fullName'
            ]),
            followUpId() {
                return (this.followUp && !Number.isNaN(Number(this.followUp.attrId))) ? this.followUp.attrId : undefined;
            },
            followUpName() {
                return (this.followUp && this.followUp.attrName) ? this.followUp.attrName : undefined;
            }
        },
        methods: {
            // 获取全部关闭询盘原因
            get_close_reason() {
                this.loading = true;
                this.$commonApi.getFollowUpList({
                    orgId: this.enterpriseId,
                    typeId: 12
                }).then(response => {
                    if (response.code === '1') {
                        this.reason_list = response.data.filter(item => {
                            if (item.isAvailable === 1) {
                                return item;
                            }
                        });
                        this.reason = this.reason_list[0] ? this.reason_list[0].attrId : null;
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_getCloseInquiryReasonList'));
                        this.cancel();
                    }
                    this.loading = true;
                });
            },
            ok() {
                // 如果 followUpId 无值
                if (Number.isNaN(Number(this.inquiryId))) {
                    this.$Message.error(this.$t('crm.Modal.error_haveNoInquiryId'));
                    return false;
                }
                if (Number.isNaN(Number(this.followUpId))) {
                    this.$Message.error(this.$t('crm.Modal.error_haveNoFollowUpId'));
                    return false;
                }
                crmInquiry.inquiryCloseReasonSave({
                    orgId: this.enterpriseId,
                    inquiryId: this.inquiryId,
                    followupId: this.followUpId,
                    followup: this.followUpName,
                    closeReason: this.reason_list.find(item => item.attrId === this.reason).attrName,
                    closeReasonId: this.reason,
                    closeReasonDetail: this.detail,
                    operateUserId: this.userId,
                    operateUser: this.fullName
                }).then(res => {
                    if (res.code === '1') {
                        this.$Message.success(this.$t('crm.Modal.success_closeInquiry'));
                        this.$emit('close-success');
                        this.cancel();
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_closeInquiry'));
                    }
                });
            },
            cancel() {
                this.$emit('update:visible', false);
                this.loading = false;
                this.reason_list = [];
                this.reason = 0;
                this.detail = '';
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    this.get_close_reason();
                }
            }
        }

    };
</script>
