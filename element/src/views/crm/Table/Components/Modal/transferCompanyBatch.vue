<template>
    <div>
        <Modal :visible="visible"
               :title="$t('crm.Modal.title_transferCompany')"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               class="modal">
            <div style="margin: 20px auto;width: 270px;">
                <!-- 文字: 转移至 -->
                <span style="display: inline-block;margin-right: 10px;line-height: 32px;">{{ $t('crm.Modal.transferTo') }}</span>
                <!-- 各类操作 -->
                <span style="display: inline-block;vertical-align: top;">
                    <!-- 选择被转移到的销售 -->
                    <Select v-model="transferred_userId"
                            @change="change_sale"
                            label-in-value
                            filterable
                            style="width:200px;margin-bottom: 10px;">
                        <Option v-for="item in salesList"
                                :key="item.id"
                                :value="item.id"
                                :label="item.fullname"></Option>
                    </Select>
                    <br>

                    <!-- 同步转移线索 -->
                    <Checkbox v-model="clue_transfer"
                              style="margin-bottom: 10px;"> {{ $t('crm.Modal.transferClueSync') }}</Checkbox>
                    <br>

                    <!-- 保留其他负责人 -->
                    <Checkbox v-model="retain_others"
                              style="margin-bottom: 10px;"> {{ $t('crm.Modal.retainOthers') }}</Checkbox>
                </span>
            </div>

            <div slot="footer">
                <!-- 取消 -->
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <!-- 确定 -->
                <Button type="primary"
                        @click="ok"
                        :loading="loading"
                        class="piwik_batchTransferCompany">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmCommon } from '@/api/crm/index';

    export default {
        name: 'transferCompanyBatch',
        props: [
            'visible',
            'ids'
        ],
        data() {
            return {
                transferred_userId: null,
                transferred_userName: '',
                clue_transfer: false,
                retain_others: false,
                loading: false
            };
        },
        computed: {
            ...mapState({
                fullName: 'fullName',
                userId: 'userId',
                enterpriseId: 'enterpriseId',
                salesList: state => state.crm.salesList,
                lang: state => state.app.lang
            }) // 从 vuex 中获取属性
        },
        methods: {
            // 记录被转移到的用户名
            change_sale(data) {
                this.transferred_userName = data ? (data.label || '') : '';
            },

            ok() {
                if (this.transferred_userId) {
                    // 保存变量以防止后续请求中变量被置为其他值
                    this.loading = true;
                    crmCommon.batchTransfer({
                        operateUserOrgId: this.enterpriseId,
                        companyIds: this.ids.join(','),
                        selectUserId: this.transferred_userId,
                        operateUserId: this.userId,
                        isKeepOtherPerson: this.retain_others ? 1 : 0,
                        transferClueSync: this.clue_transfer,
                        lang: this.lang
                    }).then(response => {
                        this.loading = false;
                        if (response.code === '1') {
                            this.$Message.success(this.$t('crm.Modal.success_transferCompany'));
                            this.$emit('refreshData');
                            this.cancel();
                        } else if (response.code === '-6') {
                            this.$Message.error(response.message + this.$t('highSeasSetting.inquriry.overCustomerLimit'));
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_transferCompany'));
                        }
                    }, error => {
                        this.loading = false;
                    }).catch(error => {
                        this.loading = false;
                    });
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_noTransferTo'));
                }
            }, // 转移
            cancel() {
                this.transferred_userId = null;
                this.transferred_userName = '';
                this.clue_transfer = false;
                this.retain_others = false;
                this.$emit('update:visible', false);
            } // 取消
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        this.clue_transfer = true;
                        this.retain_others = true;
                        // 请求销售列表, 获取可被转移到的用户数据
                        this.$store.dispatch('getSalesList');
                    }
                },
                immediate: true
            }
        }
    };
</script>
