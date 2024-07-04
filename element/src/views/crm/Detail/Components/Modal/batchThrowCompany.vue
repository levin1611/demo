<template>
    <div>
        <Modal :title="$t('crm.Modal.title_throw')"
               :visible="visible"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               width="520px"
               class="modal">
            <Spin fix v-if="loading"></Spin>
            <p class="layermain" v-html="$t('crm.Modal.throwConfirm')"></p>
            <div class="throw_wrap">
                <!-- 扔入原因 -->
                <div class="modalItem"
                     style="margin-left:50px;">
                    <p>{{ $t('crm.Modal.throwReason') }}</p>
                    <Select v-model="selectedThrowReasonId"
                            style="width:236px; margin-top:2px;">
                        <Option v-for="item in throwReasonList" :value="item.attrId" :key="item.attrName"
                                :label="item.attrName">
                                <span style="float: left;width:236px;" class="_textOverFlowCom">{{ item.attrName }}</span>
                                </Option>
                    </Select>
                </div>
                <!-- 详情 -->
                <div class="modalItem" style="margin-left:50px;height:auto;">
                    <p>{{ $t('crm.Modal.details') }}</p>
                    <Input v-model="throwReasonRemark" type="textarea" style="width: 236px;margin-top:2px;"
                           :rows="4"></Input>
                </div>
            </div>
            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button class="piwik-crm-throw-customer" type="primary" @click="ok">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmCommon } from '@/api/crm/index';

    export default {
        name: 'batchThrowCompany',
        props: [
            'visible',
            'ids'
        ],
        computed: {
            ...mapState([
                'enterpriseId',
                'userId',
                'fullName'
            ])
        },
        data() {
            return {
                selectedThrowReasonId: null,
                throwReasonRemark: '',
                loading: true,
                throwReasonList: []
            };
        },
        methods: {
            ok() {
                if (this.selectedThrowReasonId) {
                    this.loading = true;
                    crmCommon.batchGiveup({
                        orgId: this.enterpriseId,
                        operateUserName: this.fullName,
                        operateUserId: this.userId,
                        companyIdList: this.ids,
                        giveupId: this.selectedThrowReasonId,
                        giveupReason: this.throwReasonRemark
                    }).then(response => {
                        if (response.code === '1') {
                            this.selectedThrowReasonId = null;
                            this.throwReasonRemark = '';
                            this.$Message.success(this.$t('crm.Modal.success_throw'));
                            this.$emit('update:visible', false);
                            this.$emit('refreshData');
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_throw'));
                        }
                        this.loading = false;
                    }).catch(error => {
                        this.loading = false;
                    });
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_noThrowReason'));
                }
            },
            cancel() {
                this.selectedThrowReasonId = null;
                this.throwReasonRemark = '';
                this.$emit('update:visible', false);
            },
            getThrowReasonList() {
                this.loading = true;
                this.$commonApi.getFollowUpList({
                    orgId: this.enterpriseId,
                    typeId: 9
                }).then(response => {
                    if (response.code === '1') {
                        this.throwReasonList = response.data.filter(item => {
                            if (item.isAvailable === 1) {
                                return item;
                            }
                        });
                    } else {
                        this.$Message.error(this.$t('crm.UniSet.error_getThrowReasonList'));
                    }
                    this.loading = false;
                }).catch(error => {
                    this.loading = false;
                });
            }
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        this.getThrowReasonList();
                    }
                },
                immediate: true
            }
        }
    };
</script>
