<template>
    <div v-loading="loading"
         style="padding: 6px 0;">
        <ContactInfo v-for="contact in contactList"
                     :key="contact.id"
                     :id="contact.id"
                     :companyId="companyId"
                     :isHighSeas="isHighSeas"
                     :columns_authorized="contact_columns_authorized"
                     :id_update_contact="id_update_contact"
                     @editContact="editContact"
                     @viewQRCode="viewQRCode"
                     @viewContactLog="viewContactLog"></ContactInfo>

        <!-- 编辑联系人 -->
        <EditContact :visible.sync="visible_edit_contact"
                     :contactId="currentId"
                     :contact_columns_authorized="contact_columns_authorized"
                     :saleId="currentContact.userIdsShow"
                     :companyId="currentContact.companyId"
                     :userIdsShow="currentContact.userIdsShow"
                     transfer
                     @refreshCheck="refreshContact"></EditContact>

        <!-- 二维码名片 -->
        <QRCode :visible.sync="visible_qrCode"
                :id="currentId"
                type="contact"></QRCode>

        <!-- 查看联系人操作日志 -->
        <ViewContactLog :visible.sync="visible_view_contact_log"
                        :contactId="currentId"></ViewContactLog>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import ContactInfo from '@/views/crm/Detail/Components/newDetail/contactInfo';
    import EditContact from '@/views/crm/Detail/Components/Modal/editContact';
    import QRCode from '@/views/clue-manage/Detail/Components/Modal/qrCode';
    import ViewContactLog from '@/views/crm/Detail/Components/Modal/viewContactLog';

    export default {
        name: 'contactList',
        components: {
            ContactInfo,
            EditContact,
            QRCode,
            ViewContactLog
        },
        props: [
            'id',
            'isHighSeas',
            'type',
            'contact_columns_authorized',
            'flag_update_contact_list',
            'companyId'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height'
            }), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu'
            ]),
            url_get_contact_list() {
                switch (this.type) {
                    case 'customer':
                    case 'highseasCustomer':
                        return '/crm/contacts/getContactsListByCompany';
                    case 'inquiry':
                        return 'crm/contacts/getContactsListByInquiry';
                    default:
                        return '';
                }
            },
            // 当前编辑的联系人的简略信息
            currentContact() {
                return this.contactList.find(item => item.id === this.currentId) || {};
            }
        },
        data() {
            return {
                // loading
                loading: true,

                // 联系人列表
                contactList: [],

                // 当前编辑/查看二维码的联系人 id
                currentId: 0,
                // 编辑联系人后更新此数据触发指定联系人刷新
                id_update_contact: 0,

                // 编辑联系人弹窗显隐
                visible_edit_contact: false,
                // 查看联系人二维码弹窗显隐
                visible_qrCode: false,
                // 查看联系人日志
                visible_view_contact_log: false
            };
        },
        methods: {
            // 获取联系人列表
            get_contact_list() {
                let type = 0;
                const hasInquiry = this.isContainsMenu('myInquiry');
                const hasHighSeas = this.isContainsMenu('highseasCustomer');
                if (hasInquiry && hasHighSeas) {
                    type = 2;
                } else if (hasInquiry && !hasHighSeas) {
                    type = 1;
                } else if (!hasInquiry && hasHighSeas) {
                    type = 0;
                }

                this.loading = true;
                this.contactList = [];
                util.ajax({
                    url: this.url_get_contact_list,
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        id: this.id,
                        listType: type
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        if (response.data.data && Array.isArray(response.data.data.list)) {
                            this.contactList = response.data.data.list.map(item => {
                                const platform = JSON.parse(item.socialNetworkingPlatform);
                                item.socialNetworkingPlatform = platform;
                                Object.assign(item, { isMainContact: item.isMainContact === 1 });
                                return item;
                            });
                        }
                    } else {
                        this.$Message.error(this.$t('crm.newDetail.error_getSubordinateContact'));
                    }
                    this.loading = false;
                });
            },

            // 编辑联系人
            editContact(id) {
                this.currentId = id;
                this.visible_edit_contact = true;
            },
            // 编辑完成后重新请求该联系人详情
            refreshContact() {
                this.id_update_contact = this.currentId;
                this.$nextTick(() => {
                    this.id_update_contact = 0;
                });
            },
            // 查看联系人二维码
            viewQRCode(id) {
                this.currentId = id;
                this.visible_qrCode = true;
            },
            // 查看联系人日志
            viewContactLog(id) {
                this.currentId = id;
                this.visible_view_contact_log = true;
            }
        },
        watch: {
            id: {
                handler() {
                    this.$store.dispatch('getAllUsers');
                    this.get_contact_list();
                },
                immediate: true
            },
            flag_update_contact_list: {
                handler() {
                    this.get_contact_list();
                }
            }
        }
    };
</script>
