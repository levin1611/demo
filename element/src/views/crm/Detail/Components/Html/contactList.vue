<template>
    <div class="drawer__contactList">
        <div class="_f _a_c _j_b">
            <h4>{{$t('crm.Table.module_ContactList')}} ({{total_num}})</h4>
            <Icon v-if="authorized_button['newContact'] && !disabled && originalType !== 'highseasCustomer'"
                custom="custom-dabiaoqian"
                class="cursor-pointer"
                @click="visible_new_contact = true"
                color="#677F99"
                size="20"></Icon>
        </div>
        <Row v-loading="loading"
            class="contactListBox"
            :gutter="12"
            :style="`height: ${table_height}px`"
            v-infinite-scroll="loadMore"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="noMore"
            :infinite-scroll-distance="10">
            <Col :span="colSpan" v-for="item in table_data" :key="item.id">
                <div class="contactCard">
                    <div class="contactCard-top">
                        <p class="">
                            <a style="margin-right: 8px;" href="javascript:void(0)" class="ct_email" @click.stop="viewContact(item.id)">{{item.nickName}}</a>
                            <Icon v-if="item.gender && authorizedField.gender" :custom="item.gender === '1' ? 'custom-nan' : 'custom-nv'" size="14" style="margin-right: 8px;"/>
                            <span v-if="disable_operate_mainContact">
                                <Icon custom="custom-main-contact"
                                    size="14"
                                    :color="item.isMainContact ? '#F5A623' : '#C4C4C4'"></Icon>
                            </span>
                            <span v-else>
                                <Icon custom="custom-main-contact"
                                    v-if="disabled || item.isMainContact "
                                    size="14"
                                    :color="item.isMainContact ? '#F5A623' : '#C4C4C4'"></Icon>
                                <Poptip v-else :value="id_selected_contact === item.id"
                                    trigger="manual"
                                    width="250"
                                    @hide="id_selected_contact = ''" >
                                    <span slot="reference">
                                        <Icon custom="custom-main-contact"
                                            class="cursor-pointer"
                                            size="14"
                                            @click.stop="id_selected_contact = item.id"
                                            :color="item.isMainContact ? '#F5A623' : '#C4C4C4'"></Icon>
                                    </span>
                                    <div style="position: relative;padding: 6px;" v-loading="changing_mainContact">
                                        <p>{{ $t('crm.Modal.tip_changeMainContact') }}</p>
                                        <br>
                                        <div style="text-align: right;">
                                            <span style="color: #2d8cf0;cursor: pointer;margin-right: 20px" @click="id_selected_contact = ''">{{ $t('cancel') }}</span>
                                            <span style="color: #2d8cf0;cursor: pointer;" @click="change_mainContact(item.id)">{{ $t('confirm') }}</span>
                                        </div>
                                    </div>
                                </Poptip>
                            </span>
                        </p>
                        <Icon v-if="authorized_button['editContact'] && !disabled && originalType !== 'highseasCustomer'" custom="custom-field-edit" size="14" @click="edit(item)"/>
                    </div>
                    <div class="contactCard-body" :class="['mail', 'mail_detail'].includes(from) ? 'contactCard-body-little': ''">
                        <div class="contactCard-item" v-if="authorizedField.email">
                            <p class="contact-item-title">{{ $t('crm.Table.col_email')}}</p>
                            <Tooltip :disabled="!item.email" :content="item.email" placement="top-start" :visible-arrow="false">
                                <p class="contact-item-value">
                                    <a v-if="item.email && inquiryManagers !== '-1' && originalType !== 'highseasCustomer'" href="javascript:void(0)" class="ct_email" @click.stop="quickSend(item)">{{item.email}}</a>
                                    <span v-else-if="item.email">{{item.email}}</span>
                                    <span v-else>-</span>
                                </p>
                            </Tooltip>
                        </div>
                        <div class="contactCard-item" v-if="authorizedField.whatsApp">
                            <p class="contact-item-title">WhatsApp</p>
                            <Tooltip :disabled="!item.whatsApp" :content="item.whatsApp" placement="top-start" :visible-arrow="false">
                                <p class="contact-item-value">
                                    <a v-if="item.whatsApp && inquiryManagers !== '-1' && originalType !== 'highseasCustomer' " href="javascript:void(0)" class="ct_email" @click.stop="openGlobalWaReplyModal(item.whatsApp, $event)">{{item.whatsApp}}</a>
                                    <span v-else-if="item.whatsApp">{{item.whatsApp}}</span>
                                    <span v-else>-</span>
                                </p>
                            </Tooltip>
                        </div>
                        <div class="contactCard-item" v-if="authorizedField.instagram">
                            <p class="contact-item-title">Instagram</p>
                            <Tooltip :disabled="!item.instagram" :content="item.instagram" placement="top-start" :visible-arrow="false">
                                <p class="contact-item-value">
                                    {{item.instagram || '-'}}
                                </p>
                            </Tooltip>
                        </div>
                        <div class="contactCard-item" v-if="authorizedField.socialNetworkingPlatform">
                            <p class="contact-item-title">{{$t('crm.Table.col_socialNetworkingPlatform')}}</p>
                            <Tooltip
                                :disabled="!item.socialNetworkingPlatform || !item.socialNetworkingPlatform.length"
                                :content="tooltipContent(item.socialNetworkingPlatform)"
                                placement="top-start"
                                :visible-arrow="false">
                                <p class="contact-item-value">
                                    <template v-if="item.socialNetworkingPlatform && item.socialNetworkingPlatform.length">
                                        <span v-for="(i,index) in item.socialNetworkingPlatform" :key="index">
                                            <span>{{i.attrName}}： {{i.attrValue}}； </span>
                                        </span>
                                    </template>
                                    <span v-else>-</span>
                                </p>
                            </Tooltip>
                        </div>
                        <div class="contactCard-item" v-if="authorizedField.jobTitle">
                            <p class="contact-item-title">{{ $t('crm.Table.col_jobTitle')}}</p>
                            <Tooltip :disabled="!item.jobTitle" :content="item.jobTitle" placement="top-start" :visible-arrow="false">
                                <p class="contact-item-value">
                                    {{item.jobTitle || '-'}}
                                </p>
                            </Tooltip>
                        </div>
                        <div class="contactCard-item" v-if="authorizedField.phone">
                            <p class="contact-item-title">{{$t('crm.Table.col_phone')}}</p>
                            <Tooltip :disabled="!item.phone" :content="item.phone" placement="top-start" :visible-arrow="false">
                                <p class="contact-item-value">
                                    {{item.phone || '-'}}
                                </p>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </Col>
        </Row>
        <EditContact
            :flag_update_detail.sync="flag_update_detail"
            :noRefresh.sync="noRefresh_edit_contact"
            :contactId="contact_short_info.id"
            :saleId="contact_short_info.userIdsShow"
            :visible.sync="visible_edit_contact"
            :contact_columns_authorized="contact_columns_authorized"
            :companyId="contact_short_info.companyId"
            :userIdsShow="contact_short_info.userIdsShow"
            @refreshContact="$emit('update:flag_refresh_contact', !flag_refresh_contact)"></EditContact>
        <NewContact :visible.sync="visible_new_contact"
            :modelType="modelType"
            :inquiryId="inquiryId"
            :companyName="companyName"
            :companyId="companyId"
            @refreshContact="$emit('update:flag_refresh_contact', !flag_refresh_contact)"></NewContact>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import globalWaReplyModal from '@/mixins/globalWaReplyModal';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import EditContact from '@/views/crm/Detail/Components/Modal/editContact';
    import NewContact from '@/views/crm/Detail/Components/Modal/newContact';

    export default {
        name: 'contactList',
        mixins: [globalWaReplyModal],
        components: {
            EditContact,
            NewContact
        },
        props: [
            'id',
            'inquiryId',
            'type',
            'originalType',
            'from',
            'inquiryManagers',
            'contact_columns_authorized',
            'flag_update_contact',
            'flag_refresh_contact',
            'disabled',
            'globalSearchContactId',
            'globalSearchFlag',
            'colSpan'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height',
                createdUserNotMe: state => state.callingSms.createdUserNotMe,
                button_list: state => state.app.button_list
            }), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            authorized_button() {
                const contact = BUTTON_IDS.CRM.contact;
                const inquiry = BUTTON_IDS.CRM.inquiry;
                return {
                    editContact: !HANDLE_BUTTON(contact.edit.editContact, this.button_list),
                    newContact: !HANDLE_BUTTON(inquiry.edit.newContact, this.button_list)
                };
            },
            url_get_contact_list() {
                switch (this.type) {
                    case 'customer':
                    case 'highseasCustomer':
                        return '/crm/contacts/getContactsListByCompany';
                    case 'inquiry':
                        return '/crm/contacts/getContactsListByInquiry';
                    default:
                        return '';
                }
            },
            table_height() {
                let temp = this.window_height ? this.window_height - 235 : document.body.clientHeight - 235;
                switch (this.type) {
                    case 'inquiry':
                        if (['xhl-chat', 'Fb-chat'].includes(this.originalType)) {
                            temp -= 140;
                        } else {
                            temp -= 120;
                        }
                        break;
                    case 'customer':
                    case 'highseasCustomer':
                        if (['mail', 'mail_detail', 'whatsApp'].includes(this.from)) {
                            temp -= 100;
                        } else {
                            temp -= 80;
                        }
                        break;
                    default:
                        temp -= 90;
                        break;
                }
                return temp > 200 ? temp : 200;
            },
            disable_operate_mainContact() {
                return this.type !== 'inquiry' || ['highseasCustomer', 'xhl-chat', 'visitorHistory', 'FBLeads', 'Fb-comment', 'Fb-chat'].includes(this.originalType);
            },
            authorizedField() {
                const defaultFields = this.contact_columns_authorized.default || [];
                let gender = false;
                let jobTitle = false;
                let whatsApp = false;
                let instagram = false;
                let email = false;
                let socialNetworkingPlatform = false;
                let phone = false;
                defaultFields.forEach(item => {
                    if (item.storageName === 'gender') {
                        gender = true;
                    }
                    if (item.storageName === 'jobTitle') {
                        jobTitle = true;
                    }
                    if (item.storageName === 'whatsApp') {
                        whatsApp = true;
                    }
                    if (item.storageName === 'instagram') {
                        instagram = true;
                    }
                    if (item.storageName === 'email') {
                        email = true;
                    }
                    if (item.storageName === 'socialNetworkingPlatform') {
                        socialNetworkingPlatform = true;
                    }
                    if (item.storageName === 'phone') {
                        phone = true;
                    }
                });
                return {
                    gender: gender,
                    jobTitle: jobTitle,
                    whatsApp: whatsApp,
                    instagram: instagram,
                    email: email,
                    socialNetworkingPlatform: socialNetworkingPlatform,
                    phone: phone
                };
            },
            modelType() {
                switch (this.type) {
                    case 'customer':
                    case 'highseasCustomer':
                        return 'contactList';
                    default:
                        return '';
                }
            }
        },
        data() {
            return {
                noMore: false,
                visible_edit_contact: false,
                flag_update_detail: false,
                noRefresh_edit_contact: false,
                contact_short_info: {}, // 公司简略信息
                table_data: [],
                page_no: 1,
                page_size: 20,
                total_num: 0,
                loading: true, // 加载图标
                id_selected_contact: '',
                changing_mainContact: false,
                visible_new_contact: false,
                companyName: '',
                companyId: ''
            };
        },
        methods: {
            loadMore() {
                if (!this.loading) {
                    this.page_no++;
                    this.get_contact_list();
                }
            },
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
                // this.table_data = [];
                util.ajax({
                    url: this.url_get_contact_list,
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        id: this.id,
                        pageNo: this.page_no,
                        pageSize: this.page_size,
                        listType: type
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.total_num = (response.data.data && response.data.data.total) ? response.data.data.total : 0;
                        const totlePage = Math.ceil(this.total_num / this.page_size);
                        if (this.page_no === totlePage) {
                            this.noMore = true;
                        }
                        if (response.data.data && Array.isArray(response.data.data.list)) {
                            if (!this.companyId) {
                                this.companyId = response.data.data.list[0].companyId;
                                this.companyName = response.data.data.list[0].companyName;
                            }
                            const tableData = response.data.data.list.map(item => {
                                const platform = JSON.parse(item.socialNetworkingPlatform);
                                item.socialNetworkingPlatform = platform;
                                Object.assign(item, { isMainContact: item.isMainContact === 1 });
                                return item;
                            });
                            this.table_data = this.table_data.concat(tableData);
                        }
                        if (this.from === 'Sms' && !this.createdUserNotMe) {
                            this.$store.commit('setSmsNickName', response.data.data.list);
                        }
                    } else {
                        this.$Message.error(this.$t('crm.newDetail.error_getSubordinateContact'));
                    }
                    this.loading = false;
                });
            },
            // 新窗口跳转到联系人
            async viewContact(id) {
                // 无"我的联系人"页面权限, 退出流程
                if (!this.isContainsMenu('myContact')) {
                    this.$Message.warning(this.$t('crm.newDetail.error_noContactsMenuAuthority'));
                    return;
                }

                // 无 contactsId , 退出流程
                if (!id) {
                    this.$Message.warning(this.$t('crm.Modal.error_noneUserInfo'));
                    return false;
                }

                // 查询该联系人 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Contact',
                    id: id
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 如果是公海联系人
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpContactInHighseas'));
                    return;
                }

                // 新窗口打开联系人详情页
                localStorage.setItem('leadsCloud-contactId', id);
                this.$stm.openNewWindow(this.$rootRouter.resolve({
                    name: 'myContact'
                }).href);
            },
            // 打开发信弹窗
            quickSend(data) {
                const emails = [{
                    receiverName: data.nickName || '',
                    receiveMailAddress: data.email,
                    followUpId: `${this.id}`,
                    followUpType: this.type === 'customer' ? 3 : 2
                }];
                localStorage.setItem('leadsCloud-sendMail-contacts', JSON.stringify(emails));
                // 打开写信弹窗之前先判断有没有已经打开的写信弹窗
                const doc = document.getElementById('mail_detail_modal');
                if (!doc) {
                    this.$store.commit('setQuickSendMailVisible', true);
                }
            },
            change_mainContact(id) {
                this.changing_mainContact = true;

                const param = new FormData(); // 创建form对象
                param.append('inquiryId', this.inquiryId); // 通过append向form对象添加数据
                param.append('contactsId', id);
                const config = {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 30000
                };

                // 暂存要保存到日志的数据
                const inquiryId = this.inquiryId || '';
                const current_contactId = id;
                const temp = this.table_data.find(item => item.isMainContact);
                const prev_contactId = temp ? temp.id : '';

                util.axios.post(`${util.ajaxUrl}/crm/inquiryUpdate/updateMainContact`, param, config).then(response => {
                    if (response.data.code === '1') {
                        if (inquiryId && current_contactId) {
                            this.save_log(inquiryId, current_contactId, prev_contactId);
                        }
                        this.$Message.success(this.$t('crm.UniSet.success_edit'));
                        this.id_selected_contact = '';
                        // if ()
                        this.table_data = this.table_data.map(item => {
                            if (item.id === id) {
                                item.isMainContact = true;
                            } else {
                                item.isMainContact = false;
                            }
                            return item;
                        });
                        this.$emit('refreshContact');
                    } else {
                        this.$Message.error(this.$t('crm.UniSet.error_edit'));
                    }
                    this.changing_mainContact = false;
                });
            },
            save_log(inquiryId, current_contactId, prev_contactId) {
                this.$saveLog({
                    operateType: 2,
                    operateModule: 3,
                    enterpriseId: this.enterpriseId,
                    inquiryId,
                    targetId: inquiryId,
                    userId: this.userId,
                    fullName: this.fullName,
                    prevObj: {
                        mainContact: prev_contactId
                    },
                    currentObj: {
                        mainContact: current_contactId
                    }
                });
            },
            edit(item) {
                this.contact_short_info = item;
                this.visible_edit_contact = true;
            },
            refreshCheck() {
                this.page_no = 1;
                this.table_data = [];
                this.noMore = false;
                this.get_contact_list();
            },
            tooltipContent(value) {
                if (value && value.length) {
                    let content = '';
                    value.forEach(item => {
                        content += `${item.attrName}： ${item.attrValue}； `;
                    });
                    return content;
                }
                return '';
            }
        },
        created() {
            // this.refreshCheck();
        },
        activated() {
            this.refreshCheck();
        },
        watch: {
            // flag_update_contact() {
            //     this.refreshCheck();
            // },
            flag_refresh_contact() {
                this.refreshCheck();
            },
            globalSearchContactId: {
                /* 专用于处理从全局搜索结果页跳转至公海询盘详情页时，自动打开公海联系人的操作 */
                handler(val) {
                    if (this.globalSearchFlag) {
                        this.clickRow({ id: this.globalSearchContactId });
                    }
                },
                immediate: true
            }
        }
    };
</script>
<style lang="less">
    .drawer__contactList {
        h4 {
            font-size: 16px;
            line-height: 38px;
            color: #333;
        }
        .contactListBox {
            overflow: auto;
        }
        .contactCard {
            margin-bottom: 12px;
            background: #F9FBFD;
            border: 1px solid #EDF3F9;
            border-radius: 8px;
            // .custom-main-contact {
            //     cursor: pointer;
            // }
            .custom-field-edit {
                display: none;
                color: #677F99;
                cursor: pointer;
                &:hover {
                    color: #4285F2;
                }
            }
            &:hover {
                .custom-field-edit {
                    display: block;
                }
            }
            .contactCard-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 16px 16px 12px;
                p {
                    font-size: 14px;
                    color: #333;
                    line-height: 16px;
                    font-weight: 600;
                    vertical-align: middle;
                }
                .custom-nan {
                    color: #4285F2;
                }
                .custom-nv {
                    color: #FF7484;
                }
            }
            .contactCard-body {
                padding: 0 16px;
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                align-items: flex-start;
                .contactCard-item {
                    width: 50%;
                    .contact-item-title {
                        margin-bottom: 10px;
                        font-size: 12px;
                        line-height: 14px;
                        color: rgba(0, 0, 0, 0.6);
                    }
                    .contact-item-value {
                        margin-bottom: 16px;
                        font-size: 14px;
                        line-height: 16px;
                        color: #1A1A1A;
                        overflow:hidden;
                        white-space:nowrap;
                        text-overflow:ellipsis;
                    }
                }
            }
            .contactCard-body-little {
                .contactCard-item {
                    width: 100%;
                }
            }
        }
    }
</style>
