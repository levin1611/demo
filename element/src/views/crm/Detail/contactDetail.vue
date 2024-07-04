<template>
    <div class="crm-detail-page">
        <div v-loading="loading">
            <!-- 联系人详情 -->
            <div class="companyWrap" style="padding:20px 20px 16px">
                <div class="company">
                    <div class="com_top">
                        <div class="com_name">
                            <Icon custom="custom-contact" size="36"
                                  style="float: left;margin-right: 10px"></Icon>
                            <Tooltip placement="bottom-start" :content="contact_short_info.nickName">
                                <span class="com_name_short" v-text="contact_short_info.nickName"></span>
                            </Tooltip>
                        </div>
                        <div v-if="!disabled"
                             class="com_operate">
                            <!-- WhatsApp 导入 -->
                            <Button type="text"
                                    @click="trigger_upload_whatsApp"> {{ $t('crm.Detail.importWhatsApp') }}</Button>
                            <input type="file"
                                   ref="uploadWhatsApp"
                                   @change="upload_whatsApp"
                                   style="display: none"
                                   class="piwik_import_contact_by_WhatsApp">
                            <!-- 编辑联系人 -->
                            <Button v-if="authorized_button['editContact']"
                                    type="text"
                                    icon="custom custom-field-edit"
                                    @click="visible_edit_contact = true">{{ $t('crm.Detail.editContact') }}</Button>
                            <!-- 查看联系人日志 -->
                            <Button type="text"
                                    icon="custom custom-crm-log"
                                    @click="visible_view_contact_log = true">{{ $t('crm.Modal.title_contactLog') }}</Button>
                            <!-- 二维码 -->
                            <Button v-if="authorized_button['qrCode']"
                                    type="text"
                                    @click="visible_qrCode = true">{{ $t('clue.qrcode') }}</Button>
                        </div>
                    </div>
                </div>
                <Row type="flex" justify="space-between">
                    <Col v-for="item in authorized_short_info_items" :key="item" :span="4">
                        <p class="col_name">{{ $t(`crm.newDetail.col_${item}`) }}</p>
                        <template v-if="item === 'socialNetworkingPlatform'">
                            <Tooltip placement="bottom" :content="contact_short_info[item]">
                                <p class="col_value col_platform">
                                    {{contact_short_info[item]}}
                                </p>
                            </Tooltip>
                        </template>
                        <template v-else-if="item === 'companyName'">
                            <p class="col_value company-name"
                                @click="contact_short_info.companyId ? $listeners.viewCompany(contact_short_info.companyId) : $Message($t('crm.Table.error_companyId'))"
                                style="color: #FA8241;cursor: pointer;">{{ contact_short_info[item] }}</p>
                        </template>
                        <template v-else-if="item === 'email'">
                            <a href="javascript:void(0)" class="ct_email" @click.stop="quickSend(contact_short_info)">{{ contact_short_info[item] }}</a>
                        </template>
                        <template v-else>
                            <p class="col_value">{{ contact_short_info[item] }}</p>
                        </template>
                    </Col>
                </Row>
            </div>
            <div class="hr-block"></div>
            <div class="component-wrap">
                <Tabs v-model="current_compo">
                    <TabPane v-for="item in compo_list"
                             :class="`piwik_${item}_contact`"
                             :key="item" :name="item">
                        <div slot="label" v-if="item === 'FollowUp'">
                            <span style="margin-right: 5px;">{{$t(`crm.newDetail.module_${item}`)}}</span>
                            <HelpTip :title="$t('helpTip.followUp')"></HelpTip>
                        </div>
                        <div slot="label" v-else>
                            <span>{{$t(`crm.newDetail.module_${item}`)}}</span>
                        </div>
                    </TabPane>
                </Tabs>
                <keep-alive v-if="!loading">
                    <!-- 组件传递参数说明: -->
                    <!-- type: 公司/询盘/联系人  -->
                    <!-- id: 以上三类 id -->
                    <!-- columns_authorized: 以上三类的权限字段 -->
                    <!-- visitorId: 用于请求访问型跟进记录 -->
                    <!-- flag_update_detail: 新增/更新联系人时, 需刷新联系人列表 -->
                    <!-- flag_update_detail: 更新当前正在查看的 公司/询盘/联系人 时, 需刷新详情列表 -->
                    <!-- flag_update_inquiry: 新增/更新/转移 询盘后, 需刷新询盘列表 -->
                    <component :is="current_compo"
                               :ref="current_compo === 'FollowUp' ? 'followUp' : ''"
                               :type="'contact'"
                               :originalType="originalType"
                               :colSpan="colSpan"
                               :disabled="disabled"
                               :id="contactId"
                               :companyId="contact_short_info.companyId"
                               :email="contact_short_info.email"
                               :columns_authorized="contact_columns_authorized"
                               :contact_columns_authorized="contact_columns_authorized"
                               :inquiry_columns_authorized="inquiry_columns_authorized"
                               :visitorId="''"
                               :flag_update_detail.sync="flag_update_detail"
                               :flag_new_followUp="flag_new_followUp"
                               :flag_refresh_contact="flag_refresh_contact"
                               v-on="$listeners"
                               @refreshCheck="refreshCheck">
                    </component>
                </keep-alive>
            </div>

            <!-- 模态框部分 -->
            <!-- 编辑联系人信息 -->
            <EditContact
                    :flag_update_detail.sync="flag_update_detail"
                    :noRefresh.sync="noRefresh_edit_contact"
                    :contactId="contactId"
                    :saleId="contact_short_info.userIdsShow"
                    :visible.sync="visible_edit_contact"
                    :contact_columns_authorized="contact_columns_authorized"
                    :companyId="contact_short_info.companyId"
                    :userIdsShow="contact_short_info.userIdsShow"
                    transfer
                    @refreshContact="$emit('update:flag_refresh_contact', !flag_refresh_contact)"
                    @refreshCheck="refreshCheck"></EditContact>

            <!-- 查看联系人操作日志 -->
            <ViewContactLog
                    :contact_custom_field="contact_custom_field"
                    :visible.sync="visible_view_contact_log"
                    :contactId="contactId">
            </ViewContactLog>

            <!-- 二维码名片 -->
            <QRCode
                    :visible.sync="visible_qrCode"
                    :id="contactId"
                    :type="'contact'">
            </QRCode>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import EditContact from '@/views/crm/Detail/Components/Modal/editContact';
    import ViewContactLog from '@/views/crm/Detail/Components/Modal/viewContactLog';
    import QRCode from '@/views/clue-manage/Detail/Components/Modal/qrCode';
    import FollowUp from '@/views/crm/Detail/Components/Html/followUp';
    import DetailInfo from '@/views/crm/Detail/Components/Html/detailInfo';
    import InquiryList from '@/views/crm/Detail/Components/Html/inquiryList';
    import { crmContacts } from '@/api/crm/index';

    export default {
        name: 'contactDetail',
        components: {
            EditContact,
            ViewContactLog,
            QRCode,
            DetailInfo,
            FollowUp,
            InquiryList
        },
        props: [
            'type',
            'originalType',
            'contactId',
            'contact_columns_authorized',
            'inquiry_columns_authorized',
            'disabled',
            'flag_new_followUp',
            'flag_refresh_contact',
            'colSpan'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                button_list: state => state.app.button_list
            }), // 从 vuex 中获取属性
            authorized_button() {
                const ids = BUTTON_IDS.CRM.contact;
                return {
                    editContact: !HANDLE_BUTTON(ids.edit.editContact, this.button_list),
                    qrCode: true
                };
            },

            /* 联系人自定义字段 */
            contact_custom_field() {
                if (this.contact_columns_authorized.custom) {
                    return this.contact_columns_authorized.custom.filter((item, i) => {
                        return item.isShow === 1;
                    });
                }
                return [];
            },

            authorized_short_info_items() {
                const default_cols = ['companyName', 'contactManagers'];
                const authorized_cols = Array.isArray(this.contact_columns_authorized.default) ? this.contact_columns_authorized.default.filter(item => !item.manually).map(item => item.storageName).concat(default_cols) : default_cols;
                return this.short_info_items.filter(item => authorized_cols.includes(item));
            }
        },
        data() {
            return {
                loading: true,

                /* 公司详情部分 */
                contact_short_info: {}, // 公司简略信息
                short_info_items: [
                    'companyName',
                    'email',
                    'phone',
                    'socialNetworkingPlatform',
                    'contactManagers'
                ], // 公司简略信息条目记

                /* 动态组件部分 */
                flag_update_detail: false,
                compo_list: [
                    'FollowUp',
                    'DetailInfo',
                    'InquiryList'
                ],
                current_compo: '',

                /* 模态框部分 */
                visible_edit_contact: false,
                noRefresh_edit_contact: false,
                visible_view_contact_log: false,
                visible_qrCode: false,

                /* WhatsApp 导入 */
                flag_uploading: false
            };
        },
        methods: {
            get_contact_short_info() {
                // editContact 框可以单独编辑邮箱, 产品要求此时不显示 loading
                if (!this.noRefresh_edit_contact) {
                    this.loading = true;
                }
                // 马上改回默认值
                this.noRefresh_edit_contact = false;

                // 发送请求
                crmContacts.getSimpleContacts({ id: this.contactId }).then(response => {
                    if (response.code === '1') {
                        this.contact_short_info = response.data;
                        this.contact_short_info.contactManagers = response.data.userNamesShow;
                        const platform = response.data.socialNetworkingPlatform;
                        let arr = [];
                        if (platform) {
                            arr = JSON.parse(platform).map(item => {
                                return `${item.attrName}: ${item.attrValue}`;
                            });
                        }
                        this.contact_short_info.socialNetworkingPlatform = arr.join('; ');
                    } else {
                        this.$Message.error(this.$t('crm.newDetail.error_getContactBriefInfo'));
                    }
                    this.loading = false;
                });
            },
            refreshCheck() {
                this.$emit('refreshCheck', { contactId: this.contactId });
            },

            // 从 WhatsApp 聊天记录导入跟进记录
            trigger_upload_whatsApp() {
                if (this.flag_uploading) {
                    this.$Message.info(this.$t('crm.Detail.info_waitImport'));
                } else {
                    this.$refs.uploadWhatsApp.click();
                }
            },
            // whatsApp导入
            upload_whatsApp(event) {
                this.flag_uploading = true;
                const file = event.target.files[0];
                const formData = new FormData();
                if (file) {
                    formData.append('file', file);
                    formData.append('enterpriseId', this.enterpriseId);
                    formData.append('contactsId', this.contactId);

                    crmContacts.doUploadFile(formData).then(response => {
                        if (response.code === '1') {
                            this.$Message.success(this.$t('crm.Detail.success_import'));
                            // 刷新组件
                            this.loading = true;
                            this.$nextTick(() => {
                                this.loading = false;
                            });
                        } else {
                            this.$Message.error(this.$t('crm.Detail.error_import'));
                        }
                        this.flag_uploading = false;
                    });
                }
            },
            // 打开发信弹窗
            quickSend(data) {
                if (data.email) {
                    const emails = [{
                        receiverName: data.nickName || '',
                        receiveMailAddress: data.email,
                        followUpId: `${data.companyId}`,
                        followUpType: 3
                    }];
                    localStorage.setItem('leadsCloud-sendMail-contacts', JSON.stringify(emails));
                    // 打开写信弹窗之前先判断有没有已经打开的写信弹窗
                    const doc = document.getElementById('mail_detail_modal');
                    if (!doc) {
                        this.$store.commit('setQuickSendMailVisible', true);
                    }
                }
            }
        },
        watch: {
            contactId: {
                handler(val) {
                    if (val) {
                        this.get_contact_short_info();
                        this.current_compo = this.compo_list[0];
                    }
                },
                immediate: true
            },
            flag_update_detail() {
                this.get_contact_short_info();
            }
        }
    };
</script>

<style lang="less" scoped>
    .col_platform {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .company-name {
        color: #3b78de !important;
        cursor: pointer;

        &:hover {
            color: #2d63bc;
            text-decoration: underline;
        }
    }
</style>
