<template>
    <div>
        <Modal :title="$t('crm.Modal.title_transferInquiry')"
               :visible="visible"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               width="520px"
               class="modal">
            <!-- loading -->
            <Spin fix v-if="loading"></Spin>

            <div style="margin: 20px auto;width: 270px;">
                <span style="display: inline-block;margin-right: 10px;line-height: 32px;">{{ $t('crm.Modal.transferTo') }}</span>
                <span style="display: inline-block;vertical-align: top;">
                    <Select v-model="transfered_userId" filterable style="width:200px;margin-bottom: 10px;">
                        <Option v-for="item in salesList" :value="item.id" :label="item.fullname"></Option>
                    </Select>
                    <br>

                    <!-- 同步转移线索 -->
                    <template v-if="clueId">
                        <Checkbox v-model="clue_transfer" style="margin-bottom: 10px;"> {{ $t('crm.Modal.transferClueSync') }}</Checkbox>
                    </template>

                    <!-- 保留其他负责人 -->
                    <template v-if="inquiryManagerList && Object.keys(inquiryManagerList).length > 1">
                        <br>
                        <Checkbox :value="allChecked"
                                  :indeterminate="indeterminate"
                                  @click.prevent.native="handleCheckAll"
                                  style="margin-bottom: 10px;"> {{ $t('crm.Modal.retainOthers') }}</Checkbox>
                        <CheckboxGroup v-model="retain_userIds"
                                       @change="change_retain_userIds"
                                       class="manager-retain-checkGroup">
                            <template v-for="(val, key) in inquiryManagerList">
                                <Checkbox v-if="key != userId"
                                          :key="key"
                                          :label="key"
                                          style="margin-bottom: 10px;">{{ val }}</Checkbox>
                            </template>
                        </CheckboxGroup>
                    </template>
                </span>
            </div>
            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button class="piwik_transfer_inquiry" type="primary" @click="ok">{{ $t('crm.Modal.modal_ok') }}
                </Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'transferInquiry',
        props: [
            'visible',
            'inquiryId',
            'clueId',
            'inquiryManagers',
            'inquiryManagerNames'
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
            }),  // 从 vuex 中获取属性
            inquiryManagerList() {
                const temp_ids = this.inquiryManagers ? this.inquiryManagers.split(',') : [];
                if (temp_ids.length) {
                    const temp_names = this.inquiryManagerNames ? this.inquiryManagerNames.split(',') : [];
                    const temp = {};
                    temp_ids.forEach((item, index) => temp[item] = temp_names[index] || '');
                    return temp;
                }
                return undefined;
            }
        },
        methods: {
            ok() {
                // 没有转移前负责人信息, 无法转移
                if (!this.inquiryManagerList) {
                    this.$Message.error(this.$t('crm.Modal.errorOccurred'));
                    return undefined;
                }

                if (this.transfered_userId) {
                    // 计算好, 转移前负责人, 转移后负责人, 保留负责人
                    const cancelUserIds = Object.keys(this.inquiryManagerList).filter(item => !(this.retain_userIds.includes(item) || item == this.userId));
                    const beforeUsers = this.$deepClone(this.inquiryManagerList);
                    const afterUsers = {};
                    this.retain_userIds.forEach(item => {
                        if (this.inquiryManagerList[item]) {
                            afterUsers[item] = this.inquiryManagerList[item] || '';
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
                        sale ? this.$Message.error(`"${sale.fullname}" ${this.$t('crm.Modal.error_existedSaleOfInquiry')}`) : this.$Message.error(this.$t('crm.Modal.error_transferInquiry'));
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
                    util.ajax({
                        url: '/crm/inquiry/transfer',
                        method: 'post',
                        data: {
                            id: this.inquiryId,
                            selectUserId: this.transfered_userId,
                            cancelUserIds: cancelUserIds.join(','),
                            transferClueSync: this.clue_transfer,
                            rightUserIds: this.inquiryManagers
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            // if (this.clue_transfer) {
                            //     util.ajax({
                            //         url: '/form-cust/form/updateColumnValueSale',
                            //         method: 'post',
                            //         data: {
                            //             id: this.clueId,
                            //             saleId: this.transfered_userId,
                            //             saleName: afterUsers[this.transfered_userId] || '',
                            //             editUser: this.userName
                            //         }
                            //     }).then(res => {
                            //         this.save_log(beforeUsers, afterUsers, res.data.code);
                            //         this.$Message.success(this.$t('crm.Modal.success_transferInquiry'));
                            //         if (res.data.code != '1') {
                            //             this.$Message.error(this.$t('crm.Modal.error_transferClueSync'));
                            //         }
                            //         this.cancel();
                            //         this.$emit('refreshCheck');
                            //         this.$emit('closeAllDrawer');
                            //         this.updateCrmFlag();
                            //     });
                            // } else {
                            if (response.data.data === -4) {
                                this.$Message.warning(this.$t('crm.Modal.warning_inquiryInfoChange'));
                                this.cancel();
                                return false;
                            }
                            this.save_log(beforeUsers, afterUsers);
                            this.$Message.success(this.$t('crm.Modal.success_transferInquiry'));
                            this.cancel();
                            this.$emit('refreshCheck');
                            this.$emit('closeAllDrawer');
                            this.updateCrmFlag();
                            // }
                        } else if (response.data.code === '-6') {
                            this.$Message.error(response.data.message + this.$t('highSeasSetting.inquriry.overInquiryLimit'));
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_transferInquiry'));
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
                    this.retain_userIds = Object.keys(this.inquiryManagerList).filter(item => item != this.userId);
                } else {
                    this.retain_userIds = [];
                }
            },
            change_retain_userIds(data) {
                if (data.length === Object.keys(this.inquiryManagerList).filter(item => item != this.userId).length) {
                    this.indeterminate = false;
                    this.allChecked = true;
                } else if (data.length > 0) {
                    this.indeterminate = true;
                    this.allChecked = false;
                } else {
                    this.indeterminate = false;
                    this.allChecked = false;
                }
            },

            save_log(beforeUsers, afterUsers, transferClueSync) {
                this.$saveLog({
                    operateType: 9,
                    operateModule: 3,
                    id: this.inquiryId,
                    enterpriseId: this.enterpriseId,
                    userId: this.userId,
                    fullName: this.fullName,
                    currentObj: {
                        manager_beforeChange: beforeUsers,
                        manager_afterChange: afterUsers,
                        transferClueSync
                    }
                });
            },
            async updateCrmFlag() {
                let emails = [];
                const req_contacts = await util.ajax({
                    url: 'crm/contacts/getContactsEmailList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        id: this.inquiryId
                    }
                });
                if (req_contacts.data.code === '1') {
                    emails = (req_contacts.data.data && Array.isArray(req_contacts.data.data.list)) ? req_contacts.data.data.list : [];
                    if (emails.length) {
                        util.ajaxMail({
                            url: '/mail/mailBoxs/updateCrmFlagNew',
                            method: 'post',
                            timeout: 360000,
                            data: {
                                address: emails.join(','),
                                createUserId: this.userId,
                                orgId: this.enterpriseId
                            }
                        }).then(res => {
                            if (res.data.code != 1) {
                                console.error('回传 flag 失败');
                            }
                        });
                    }
                } else {
                    console.log('请求询盘联系人失败, 无法回传 flag');
                }
            }
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        if (this.clueId) {
                            this.clue_transfer = true;
                        }
                        if (inquiryManagerList && Object.keys(this.inquiryManagerList).length > 1) {
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
</style>
