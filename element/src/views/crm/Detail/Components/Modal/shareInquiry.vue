<template>
    <div>
        <Modal :title="$t('crm.Modal.title_shareInquiry')"
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
                    <Option v-for="item in salesList" :value="item.id" :label="item.fullname"></Option>
                </Select>
            </p>
            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button class="piwik_share_inquiry" type="primary" @click="ok">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'shareInquiry',
        props: [
            'visible',
            'inquiryId',
            'inquiryManagers',
            'inquiryManagerNames',
            'flag_update_detail'
        ],
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
        data() {
            return {
                sharedUserId: null
            };
        },
        methods: {
            ok() {
                if (this.sharedUserId) {
                    util.ajax({
                        url: '/crm/inquiry/share',
                        method: 'post',
                        data: {
                            id: this.inquiryId,
                            selectUserId: this.sharedUserId,
                            operateUserId: this.userId
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.$emit('update:flag_update_detail', !this.flag_update_detail);
                            this.$emit('refreshCheck');
                            this.updateCrmFlag();
                            this.$Message.success(this.$t('crm.Modal.success_shareInquiry'));

                            const sale = this.salesList.find(item => item.id === this.sharedUserId);
                            const afterUser = Object.assign({}, this.inquiryManagerList);
                            if (sale) {
                                afterUser[sale.id] = sale.fullname || '';
                            } else {
                                afterUser[this.transfered_userId] = '';
                            }
                            if (!Object.keys(this.inquiryManagerList).some(item => item === `${sale.id}`)) {
                                this.$saveLog({
                                    operateType: 10,
                                    operateModule: 3,
                                    id: this.id,
                                    enterpriseId: this.enterpriseId,
                                    userId: this.userId,
                                    fullName: this.fullName,
                                    currentObj: {
                                        manager_beforeChange: this.inquiryManagerList,
                                        manager_afterChange: afterUser
                                    }
                                });
                            }
                            this.cancel();
                        } else if (response.data.code === '-6') {
                            this.$Message.error(response.data.message + this.$t('highSeasSetting.inquriry.overInquiryLimit'));
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_shareInquiry'));
                        }
                    });
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_noShareTo'));
                }
            },
            cancel() {
                this.sharedUserId = null;
                this.$emit('update:visible', false);
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
                            if (res.data.code !== 1) {
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
                        // 获取全部销售人员
                        this.$store.dispatch('getSalesList');
                    }
                },
                immediate: true
            }
        }
    };
</script>
