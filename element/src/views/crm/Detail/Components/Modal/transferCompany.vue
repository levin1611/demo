<template>
    <Modal :title="$t('crm.Modal.title_transferCompany')"
           :visible="visible"
           :show-close="false"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           :modal-append-to-body="false"
           width="520px"
           class="modal">
        <!-- loading -->
        <Spin fix v-if="loading"></Spin>

        <div class="transfer-container">
            <span class="transfer-select-label">{{ $t('crm.Modal.transferTo') }}</span>
            <span class="transfer-select-container">
                <Select v-model="transfered_userId"
                        filterable
                        style="margin-bottom: 10px;">
                    <Option v-for="item in salesList" :value="item.id" :label="item.fullname"></Option>
                </Select>
                <br>

                <!-- 同步转移线索 -->
                <Checkbox v-model="clue_transfer"
                          style="margin-bottom: 10px;"> {{ $t('crm.Modal.transferClueSync') }}</Checkbox>

                <!-- 保留其他负责人 -->
                <template v-if="managerList && Object.keys(managerList).length > 1">
                    <br>
                    <Checkbox :value="allChecked"
                              :indeterminate="indeterminate"
                              @click.prevent.native="handleCheckAll"
                              style="margin-bottom: 10px;"> {{ $t('crm.Modal.retainOthers') }}</Checkbox>
                    <CheckboxGroup v-model="retain_userIds"
                                   @change="change_retain_userIds"
                                   class="manager-retain-checkGroup">
                        <template v-for="(val, key) in managerList">
                            <Checkbox v-if="key != userId"
                                      :key="key"
                                      :label="key"
                                      style="margin-bottom: 10px;">{{ val }}</Checkbox>
                        </template>
                    </CheckboxGroup>
                </template>
            </span>
        </div>

        <!-- footer -->
        <div slot="footer">
            <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
            <Button class="piwik_transfer_company"
                    type="primary"
                    @click="ok">{{ $t('crm.Modal.modal_ok') }}</Button>
        </div>
    </Modal>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmCommon } from '@/api/crm/index';

    export default {
        name: 'transferCompany',
        props: [
            'visible',
            'id',
            'managerIds',
            'managerNames'
        ],
        data() {
            return {
                transfered_userId: null,
                clue_transfer: false,
                loading: false,

                indeterminate: false,
                allChecked: false,
                retain_userIds: []
            };
        },
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
        methods: {
            ok() {
                // 没有转移前负责人信息, 无法转移
                if (!this.managerList) {
                    this.$Message.error(this.$t('crm.Modal.errorOccurred'));
                    return undefined;
                }

                if (this.transfered_userId) {
                    // 计算好, 转移前负责人, 转移后负责人, 保留负责人
                    const cancelUserIds = Object.keys(this.managerList).filter(item => !(this.retain_userIds.includes(item) || item == this.userId));
                    const beforeUsers = this.$deepClone(this.managerList);
                    const afterUsers = {};
                    this.retain_userIds.forEach(item => {
                        if (this.managerList[item]) {
                            afterUsers[item] = this.managerList[item] || '';
                        } else {
                            afterUsers[item] = '';
                        }
                    });
                    const sale = this.salesList.find(item => item.id == this.transfered_userId);
                    if (sale) {
                        afterUsers[sale.id] = sale.fullname || '';
                    } else {
                        afterUsers[this.transfered_userId] = '';
                    }

                    // 转移前后负责人一致, 不能转移
                    if (Object.keys(beforeUsers).sort().join(',') === `${this.transfered_userId}`) {
                        sale ? this.$Message.error(`"${sale.fullname}" ${this.$t('crm.Modal.error_existedSaleOfCompany')}`) : this.$Message.error(this.$t('crm.Modal.error_transferCompany'));
                        return undefined;
                    }
                    /**
                     * @Description: 询盘日志改由后端处理，涉及场景：单个转移询盘
                     *               注：前端需在转移询盘的接口增加一个参数transferClueSync，标识是否选择了同步转移线索，
                     *               true---选择同步转移线索，false---未选择同步转移线索
                     * @author 杨娣
                     * @date 2020/6/11
                     */
                    // 转移
                    this.loading = true;
                    crmCommon.inquiryTransfer({
                        operateUserOrgId: this.enterpriseId,
                        companyId: this.id,
                        operateUserOrgId: this.enterpriseId,
                        selectUserId: this.transfered_userId,
                        cancelUserIds: cancelUserIds.join(','),
                        transferClueSync: this.clue_transfer,
                        rightUserIds: this.managerIds
                    }).then(response => {
                        if (response.code === '1') {
                            if (response.data === -4) {
                                this.$Message.warning(this.$t('crm.Modal.warning_companyInfoChange'));
                                this.cancel();
                                return false;
                            }
                            this.$Message.success(this.$t('crm.Modal.success_transferCompany'));
                            this.cancel();
                            this.$emit('refreshCheck');
                            this.$emit('closeAllDrawer');
                        } else if (response.code === '-6') {
                            this.$Message.error(response.message + this.$t('highSeasSetting.inquriry.overCustomerLimit'));
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_transferCompany'));
                        }
                        this.loading = false;
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
                this.transfered_userId = null;
                this.clue_transfer = false;
                this.indeterminate = false;
                this.allChecked = false;
                this.retain_userIds = [];
                this.$emit('update:visible', false);
            }, // 取消

            handleCheckAll() {
                if (this.indeterminate) {
                    this.allChecked = false;
                } else {
                    this.allChecked = !this.allChecked;
                }
                this.indeterminate = false;

                if (this.allChecked) {
                    this.retain_userIds = Object.keys(this.managerList).filter(item => item != this.userId);
                } else {
                    this.retain_userIds = [];
                }
            },
            change_retain_userIds(data) {
                if (data.length === Object.keys(this.managerList).filter(item => item != this.userId).length) {
                    this.indeterminate = false;
                    this.allChecked = true;
                } else if (data.length > 0) {
                    this.indeterminate = true;
                    this.allChecked = false;
                } else {
                    this.indeterminate = false;
                    this.allChecked = false;
                }
            }
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        this.clue_transfer = true;
                        if (this.managerList && Object.keys(this.managerList).length > 1) {
                            this.handleCheckAll();
                        }
                        // 获取全部销售人员
                        this.$store.dispatch('getSalesList');
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less" scoped>
    .manager-retain-checkGroup {
        /deep/ .el-checkbox {
            display: block;
            margin-left: 25px;
        }
    }

    .transfer-container {
         margin: 20px auto;
         width: 270px;
     }

    .transfer-select-label {
         display: inline-block;
         margin-right: 10px;
         line-height: 32px;
     }

    .transfer-select-container {
        display: inline-block;
        vertical-align: top;
        width: 200px;
        overflow: hidden;

        /deep/ .el-checkbox__label {
            white-space: normal;
            vertical-align: text-top;
        }
     }
</style>
