<template>
    <div>
        <Modal :visible="visible"
               :title="$t('crm.Modal.title_transferInquiry')"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               v-loading="loading"
               class="modal">

            <div style="margin: 20px auto;width: 270px;">
                <span style="display: inline-block;margin-right: 10px;line-height: 32px;">{{ $t('crm.Modal.transferTo') }}</span>
                <span style="display: inline-block;vertical-align: top;">
                    <Select v-model="transferred_userId" @change="change_sale" label-in-value filterable
                            style="width:200px;margin-bottom: 10px;">
                        <Option v-for="item in salesList" :value="item.id" :label="item.fullname"></Option>
                    </Select>
                    <br>

                    <!-- 同步转移线索 -->
                    <template v-if="clueIds.some(item => item)">
                        <Checkbox v-model="clue_transfer" style="margin-bottom: 10px;"> {{ $t('crm.Modal.transferClueSync') }}</Checkbox>
                    </template>

                    <!-- 保留其他负责人 -->
                    <template>
                        <br>
                        <Checkbox v-model="retain_others" style="margin-bottom: 10px;"> {{ $t('crm.Modal.retainOthers') }}</Checkbox>
                    </template>
                </span>

            </div>
            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button class="inquiry-batchtransferinquiry" type="primary" @click="ok">{{ $t('crm.Modal.modal_ok') }}
                </Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'transferInquiryBatch',
        props: [
            'visible',
            'inquiryIds',
            'clueIds',
            'inquiryManagers',
            'inquiryManagerNames'
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
                userName: 'userName',
                fullName: 'fullName',
                userId: 'userId',
                enterpriseId: 'enterpriseId',
                salesList: state => state.crm.salesList
            })// 从 vuex 中获取属性
        },
        methods: {
            change_sale(data) {
                this.transferred_userName = data ? (data.label || '') : '';
            },
            ok() {
                if (this.transferred_userId) {
                    // 保存变量以防止后续请求中变量被置为其他值
                    const clue_transfer = this.clue_transfer;
                    const retain_others = this.retain_others;
                    const clueIds = this.clueIds;
                    let existed_clueId_index = '';
                    if (clue_transfer) {
                        // 有对应的 clueId 的询盘的 Index
                        existed_clueId_index = clueIds.map((item, index) => item ? index : undefined).filter(item => item !== undefined);
                    }
                    /**
                     * @Description: 批量转移询盘时，询盘日志和同步转移线索的操作改由后端处理
                     *               注：前端需在转移询盘的接口增加一个参数transferClueSync，标识是否选择了同步转移线索，
                     *               true---选择同步转移线索，false---未选择同步转移线索
                     * @author 杨娣
                     * @date 2020/6/6
                     */
                    this.loading = true;
                    util.ajaxMoreLongTime({
                        url: '/crm/inquiry/batchTransfer',
                        method: 'post',
                        data: {
                            id: this.inquiryIds.join(','),
                            selectUserId: this.transferred_userId,
                            operateUserId: this.userId,
                            isKeepOtherPerson: retain_others ? 1 : 0,
                            transferClueSync: Boolean(existed_clueId_index.length)
                        }
                    }).then(response => {
                        this.loading = false;
                        if (response.data.code === '1') {
                            if (clue_transfer) {
                                // 有对应的 clueId 的询盘的 Index
                                const existed_clueId_index = clueIds.map((item, index) => item ? index : undefined).filter(item => item !== undefined);
                                if (existed_clueId_index.length) {
                                    this.$Message.success(this.$t('crm.Modal.success_transfer'));
                                    this.$emit('refreshData');
                                    this.cancel();
                                } else {
                                    this.$Message.success(this.$t('crm.Modal.success_transfer'));
                                    if (clueIds.some(item => item) && clue_transfer) {
                                        this.$Message.error(this.$t('crm.Modal.error_transferClueSync'));
                                    }
                                    this.$emit('refreshData');
                                    this.cancel();
                                }
                            } else {
                                this.$Message.success(this.$t('crm.Modal.success_transfer'));
                                this.$emit('refreshData');
                                this.cancel();
                            }
                        } else if (response.data.code === '-6') {
                            this.$Message.error(response.data.message + this.$t('highSeasSetting.inquriry.overInquiryLimit'));
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_transfer'));
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
                        if (this.clueIds.some(item => item)) {
                            this.clue_transfer = true;
                        }
                        this.retain_others = true;
                        // 获取全部销售人员
                        this.$store.dispatch('getSalesList');
                    }
                },
                immediate: true
            }
        }
    };
</script>
