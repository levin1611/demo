<template>
    <div>
        <Modal :title="$t('crm.Modal.title_highseasRecord')"
               :visible="visible"
               width="600px"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false">
            <div class="highseasRecord">
                <Timeline>
                    <TimelineItem v-for="item in highseasRecord">
                        <p>{{ new Date(item.operateTime).toLocaleString() }}</p>
                        <template v-if="item.operateType === 34">
                            <p>
                                {{ item.operateUser }}&nbsp;&nbsp;<b>{{ $t('crm.Modal.inquiry') }}{{ inquirySeqNumber }}</b>
                                {{ $t('crm.Modal.title_throw') }}
                            </p>
                            <p v-if="giveupReasonMap.has(item.afterId)">
                                {{ $t('crm.Modal.throwReason') }}: {{ giveupReasonMap.get(item.afterId) }}</p>
                            <p v-if="item.after.trim().length > 0"
                               class="textAreaShow" >
                                {{ $t('crm.Modal.details') }}:
                                {{ item.after }}</p>
                        </template>
                        <p v-if="item.operateType === 33">
                            {{ item.operateUser }}&nbsp;{{ $t('crm.Modal.operate_claim') }}
                            <b>{{ $t('crm.Modal.inquiry') }}{{ inquirySeqNumber }}</b>
                        </p>
                    </TimelineItem>
                </Timeline>
            </div>
            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_close') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { crmCommon } from '@/api/crm/index';
    export default {
        name: 'highseasRecord',
        props: [
            'visible',
            'inquiryId',
            'inquirySeqNumber',
            'selectOptions'
        ],
        data() {
            return {
                highseasRecord: []
            };
        },
        computed: {
            giveupReasonMap() {
                const temp = new Map();
                if (this.selectOptions.giveupReason) {
                    this.selectOptions.giveupReason.filter(item => item.isAvailable === 1).map(item => {
                        temp.set(item.attrId, item.attrName);
                    });
                }
                return temp;
            }
        },
        methods: {
            cancel() {
                this.$emit('update:visible', false);
            },
            getHighseasRecord() {
                this.highseasRecord = [];
                crmCommon.getInquiryClaimList({
                    inquiryId: this.inquiryId
                }).then(response => {
                    this.highseasRecord = response.data;
                });
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    this.getHighseasRecord();
                }
            }
        }
    };
</script>
