<template>
    <div class="crm-detail-page">
        <div v-loading="loading">
            <!-- 询盘详情 -->
            <div class="companyWrap" style="padding:20px 20px 16px">
                <div class="company">
                    <div class="com_top">
                        <div class="com_name">
                            <Icon custom="custom-inquiry" size="36"
                                  style="float: left;margin-right: 10px"></Icon>
                            <Tooltip placement="bottom-start" :content="inquiry_short_info.seqNumber">
                                <span class="com_name_short">{{ inquiry_short_info.seqNumber || '' }}</span>
                            </Tooltip>
                            <!--重点标记询盘 -->
                            <Tooltip v-if="!disabled" :content="$t('crm.newDetail.title_signInquiry')">
                                <Icon custom="custom-crm-mark"
                                    @click.stop="remarkFun"
                                    size="16"
                                    class="piwik_mark_inquiry cursor-pointer"
                                    :color="inquiry_short_info.inquiryMarker === 1 ? '#FBBC04' : '#7B98B6'"></Icon>
                            </Tooltip>
                        </div>
                        <div v-if="!disabled"
                             class="com_operate">
                            <!-- 编辑询盘 -->
                            <Button v-if="authorized_button['editInquiry']"
                                    type="text"
                                    icon="custom custom-field-edit"
                                    @click="editInquiry"> {{ $t('crm.Detail.editInquiry') }}</Button>
                            <!-- 转移询盘 -->
                            <!--<Button v-if="authorized_button['transferInquiry']"-->
                            <!--        type="text"-->
                            <!--        icon="custom custom-crm-transfer"-->
                            <!--        @click="transferInquiry"> {{ $t('crm.Detail.transferInquiry') }}</Button>-->
                            <!-- 发送邮件 -->
                            <Button v-if="authorized_button['sendMail']"
                                    type="text"
                                    icon="custom custom-crm-send-mail"
                                    @click="sendMail"> {{ $t('crm.Detail.sendMail') }}</Button>
                            <!-- 查看日志 -->
                            <Button type="text"
                                    icon="custom custom-crm-log"
                                    @click="viewInquiryLog"> {{ $t('crm.Detail.viewInquiryLog') }}</Button>
                            <!-- 更多操作 -->
                            <Poptip trigger="hover"
                                    placement="bottom-end"
                                    popper-class="moreOperateGroup">
                                <Button slot="reference"
                                        type="text"
                                        icon="custom custom-more"
                                        style="color: #7e7e7e;padding-top: 5px;"></Button>
                                <div>
                                    <ul class="_font_size12">
                                        <!-- 新增联系人 -->
                                        <li v-if="authorized_button['newContact']"
                                            @click="newContact">{{ $t('crm.Detail.newContact') }}</li>

                                        <!-- 分享询盘 -->
                                        <!--<li v-if="authorized_button['shareInquiry']"-->
                                        <!--    @click="shareInquiry">{{ $t('crm.Detail.shareInquiry') }}</li>-->
                                        <!-- 扔入公海 -->
                                        <!--<li v-if="authorized_button['throwInquiry']"-->
                                        <!--    @click="throwInquiry">{{ $t('crm.Detail.throwInquiry') }}</li>-->

                                        <!-- 添加标签 -->
                                        <li v-if="authorized_button['addInquiryLabel']"
                                            @click="addInquiryLabel">{{ $t('crm.Detail.addInquiryLabel') }}</li>
                                        <!--  <li v-if="authorized_button['sendMessenger'] && senderId" @click="handleFBMessenger">{{$t('crm.Detail.sendMessenger')}}</li>-->
                                    </ul>
                                </div>
                            </Poptip>
                        </div>
                    </div>
                </div>
                <div style="margin-bottom:16px;">
                    <Row type="flex" justify="space-between">
                        <Col v-for="item in authorized_short_info_items" :key="item" :span="4">
                            <p class="col_name">{{ $t(`crm.newDetail.col_${item}`) }}</p>
                            <template v-if="item === 'companyName'">
                                <p class="col_value company-name"
                                   @click="inquiry_short_info.companyId ? $listeners.viewCompany(inquiry_short_info.companyId) : $Message($t('crm.Table.error_companyId'))"
                                >{{ inquiry_short_info[item] }}</p>
                            </template>
                            <template v-else-if="item === 'productCategory'">
                                <p class="col_value">{{ $options.filters.parseArray(inquiry_short_info[item]).length ?
                                    $options.filters.parseArray(inquiry_short_info[item]).join(', ') :
                                    '' }}</p>
                            </template>
                            <template v-else>
                                <p class="col_value">{{ inquiry_short_info[item] }}</p>
                            </template>
                        </Col>
                    </Row>
                </div>
                <FollowUpStatus
                        v-if="show_edit_followup_status"
                        :flag_update_detail.sync="flag_update_detail"
                        :inquiry_detail.sync="inquiry_short_info"
                        :disabled="disabled_edit_followup_status"
                        @refreshCheck="refreshCheck"></FollowUpStatus>
            </div>
            <div class="hr-block"></div>
            <div class="component-wrap">
                <Tabs v-model="current_compo">
                    <TabPane v-for="item in compo_list"
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
                    <!-- type: 客户/公海管理/询盘/联系人  -->
                    <!-- id: 以上 type 的 id -->
                    <!-- columns_authorized: 以上 type 的权限字段 -->
                    <!-- visitorId: 用于请求访问型跟进记录 -->
                    <!-- flag_update_contact: 新增/更新联系人时, 需刷新联系人列表 -->
                    <!-- flag_update_detail: 更新当前正在查看的 公司/询盘/联系人 时, 需刷新详情列表 -->
                    <!-- flag_update_inquiry: 新增/更新/转移 询盘后, 需刷新询盘列表 -->
                    <component :is="current_compo"
                            :ref="current_compo === 'FollowUp' ? 'followUp' : ''"
                            :type="'inquiry'"
                            :originalType="originalType"
                            :colSpan="colSpan"
                            :disabled="disabled"
                            :id="inquiryId"
                            :inquiryId="inquiryId"
                            :inquirySeqNumber="inquiry_short_info.seqNumber"
                            :companyId="inquiry_short_info.companyId"
                            :companyName="inquiry_short_info.companyName"
                            :inquiryManagers="inquiry_short_info.userIdsShow"
                            :inquiryManagerNames="inquiry_short_info.userNamesShow"
                            :followUpId="inquiry_short_info.followUpId"
                            :columns_authorized="inquiry_columns_authorized"
                            :contact_columns_authorized="contact_columns_authorized"
                            :inquiry_columns_authorized="inquiry_columns_authorized"
                            :visitorId="inquiry_short_info.visitorId"
                            :flag_update_contact.sync="flag_update_contact"
                            :flag_update_detail.sync="flag_update_detail"
                            :flag_update_task.sync="flag_update_task"
                            :flag_new_followUp="flag_new_followUp"
                            :flag_refresh_contact="flag_refresh_contact"
                            @refreshContact="$emit('update:flag_refresh_contact', !flag_refresh_contact)"
                            v-on="$listeners"
                            @refreshCheck="refreshCheck">
                    </component>
                </keep-alive>
            </div>

            <!-- 模态框部分 -->
            <!-- 编辑询盘 -->
            <EditInquiry :visible.sync="visible_edit_inquiry"
                         :inquiryId="inquiryId"
                         :inquiry_columns_authorized="inquiry_columns_authorized"
                         :flag_update_detail.sync="flag_update_detail"
                         @refreshCheck="refreshCheck"></EditInquiry>

            <!-- 新增联系人 -->
            <NewContact
                    :visible.sync="visible_new_contact"
                    :inquiryId="inquiryId"
                    :saleId="inquiry_short_info.userIdsShow"
                    :companyName="inquiry_short_info.companyName"
                    :companyId="inquiry_short_info.companyId"
                    :clueId="inquiry_short_info.clueId"
                    :contact_columns_authorized="contact_columns_authorized"
                    :flag_update_contact.sync="flag_update_contact"
                    @refreshContact="$emit('update:flag_refresh_contact', !flag_refresh_contact)"
                    >
            </NewContact>
            <!-- 添加标签 -->
            <AddInquiryLabel
                    :inquiryId="inquiryId"
                    :visible.sync="visible_add_inquiry_label"
                    :flag_update_detail.sync="flag_update_detail"
                    >
            </AddInquiryLabel>

            <!-- 发送邮件 -->
            <SendMail :visible.sync="visible_send_mail"
                      type="inquiry"
                      :id="inquiryId"
                      :companyName="inquiry_short_info.companyName"></SendMail>

            <!-- 查看询盘操作日志 -->
            <ViewInquiryLog
                    :visible.sync="visible_view_inquiry_log"
                    :inquiryId="inquiryId">
            </ViewInquiryLog>
        </div>
    </div>
</template>

<script>
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { mapState } from 'vuex';
    import EditInquiry from '@/views/crm/Detail/Components/Modal/editInquiry';
    import NewContact from '@/views/crm/Detail/Components/Modal/newContact';
    import AddInquiryLabel from '@/views/crm/Detail/Components/Modal/addInquiryLabel';
    import SendMail from '@/views/crm/Detail/Components/Modal/sendMail';
    import ViewInquiryLog from '@/views/crm/Detail/Components/Modal/viewInquiryLog';
    import FollowUpStatus from '@/views/crm/Detail/Components/Html/followUpStatus';
    import Documents from '@/views/crm/Detail/Components/Html/relatedDocuments';
    import Task from '@/views/crm/Detail/Components/Html/schedule';
    import FollowUp from '@/views/crm/Detail/Components/Html/followUp';
    import DetailInfo from '@/views/crm/Detail/Components/Html/detailInfo';
    import ContactList from '@/views/crm/Detail/Components/Html/contactList';
    import { crmInquiry } from '@/api/crm/index';

    export default {
        name: 'inquiryDetail',
        components: {
            EditInquiry,
            NewContact,
            AddInquiryLabel,
            SendMail,
            ViewInquiryLog,
            FollowUpStatus,
            Documents,
            Task,
            FollowUp,
            DetailInfo,
            ContactList
        },
        props: [
            'type',
            'originalType',
            'inquiryId',
            'contact_columns_authorized',
            'inquiry_columns_authorized',
            'disabled',
            'flag_new_followUp',
            'flag_refresh_contact',
            'colSpan'
        ],
        computed: {
            ...mapState({
                button_list: state => state.app.button_list
            }), // 从 vuex 中获取属性
            authorized_button() {
                const ids = BUTTON_IDS.CRM.inquiry;
                return {
                    editInquiry: !HANDLE_BUTTON(ids.edit.editInquiry, this.button_list),
                    sendMail: !HANDLE_BUTTON(ids.edit.sendMail, this.button_list),
                    newContact: !HANDLE_BUTTON(ids.edit.newContact, this.button_list),
                    addInquiryLabel: !HANDLE_BUTTON(ids.edit.label, this.button_list)
                };
            },
            show_edit_followup_status() {
                return Array.isArray(this.inquiry_columns_authorized.default) && this.inquiry_columns_authorized.default.find(item => item.storageName === 'followUp');
            },
            disabled_edit_followup_status() {
                const disabled = this.disabled;

                // 外部传入 disabled 为 true , 直接返回 true
                if (disabled) {
                    return true;
                }

                // 从询盘简略信息得知"该询盘的成交信息从平台导入", 直接返回 true
                if (['1', '2'].includes(`${this.inquiry_short_info.sysCreateFlag}`)) {
                    return true;
                }

                // 检查编辑权限和字段权限
                const able_editInquiry = this.authorized_button.editInquiry;
                let able_field_followupStatus = false;
                if (Array.isArray(this.inquiry_columns_authorized.default)) {
                    const temp = this.inquiry_columns_authorized.default.filter(item => item.storageName === 'followUp');
                    if (temp[0] && `${temp[0].isOnlyRead}` !== '1') {
                        able_field_followupStatus = true;
                    }
                }
                return !(able_editInquiry && able_field_followupStatus);
            },
            authorized_short_info_items() {
                const default_cols = ['companyName', 'inquiryManagers'];
                const authorized_cols = Array.isArray(this.inquiry_columns_authorized.default) ? this.inquiry_columns_authorized.default.filter(item => !item.manually).map(item => item.storageName).concat(default_cols) : default_cols;
                return this.short_info_items.filter(item => authorized_cols.includes(item));
            }
        },
        data() {
            return {
                loading: true,
                /* 全局 */
                inquiry_short_info: {}, // 询盘详情
                short_info_items: [
                    'companyName',
                    'productCategory',
                    'grouping',
                    'inquiryScore',
                    'inquiryManagers'
                ],

                /* 询盘列表动态组件部分 */
                flag_update_contact: false,
                flag_update_detail: false,
                flag_update_task: false,
                compo_list: [
                    'FollowUp',
                    'DetailInfo',
                    'ContactList',
                    'Task',
                    'Documents'
                    // 'InquiryProduct'
                ],
                current_compo: '',

                /* 模态框部分 */
                visible_edit_inquiry: false,
                visible_new_contact: false,
                visible_add_inquiry_label: false,
                visible_send_mail: false,
                visible_view_inquiry_log: false
            };
        },
        methods: {
            /* 全局 */
            // 获取询盘简略信息
            get_inquiry_short_info() {
                this.loading = true;
                const data = {
                    id: this.inquiryId
                };
                crmInquiry.getSimpleInquiry(data).then(response => {
                    if (response.code === '1') {
                        this.inquiry_short_info = response.data;
                        this.inquiry_short_info.inquiryManagers = response.data.userNamesShow;
                    } else {
                        this.$Message.error(this.$t('crm.newDetail.error_getInquiryBriefInfo'));
                    }
                    this.loading = false;
                });
            },
            // 标记
            remarkFun() {
                let flag = 1;
                if (this.inquiry_short_info.inquiryMarker === 1) {
                    flag = 2;
                }
                crmInquiry.updateMarker({
                    id: this.inquiryId,
                    inquiryMarker: flag
                }).then(response => {
                    if (response.code === '1') {
                        this.inquiry_short_info.inquiryMarker = flag;
                        this.refreshCheck();
                        if (flag === 1) {
                            this.$Message.success(this.$t('crm.Detail.success_addMarker'));
                        } else {
                            this.$Message.success(this.$t('crm.Detail.success_removeMarker'));
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Detail.error_addMarker'));
                    }
                });
            },
            /* 模态框部分 */
            editInquiry() {
                this.visible_edit_inquiry = true;
            }, // 编辑
            newContact() {
                this.visible_new_contact = true;
            },
            addInquiryLabel() {
                this.visible_add_inquiry_label = true;
            },
            sendMail() {
                this.visible_send_mail = true;
            },
            // 查看询盘日志
            viewInquiryLog() {
                this.visible_view_inquiry_log = true;
            },
            refreshCheck() {
                this.$emit('refreshCheck', { inquiryId: this.inquiryId });
            }
        },
        created() {
        },
        mounted() {
        },
        watch: {
            inquiryId: {
                handler(val) {
                    if (val) {
                        this.get_inquiry_short_info();
                        this.current_compo = this.compo_list[0];
                    }
                },
                immediate: true
            },
            flag_update_detail() {
                this.get_inquiry_short_info();
                this.refreshCheck();
            }
        }
    };
</script>

<style lang="less">
    .fb-Modal .el-dialog__footer {
        padding: 0;
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
