<template>
    <div v-loading="loading">
        <!-- 公司详情 -->
        <div class="companyWrap" style="padding: 20px 20px 16px">
            <div class="company">
                <div class="com_top">
                    <div class="com_name">
                        <Icon v-if="type==='highseasCustomer'" custom="custom-highseas-customer" size="36"
                              style="float: left;margin-right: 10px;"></Icon>
                        <Icon v-else custom="custom-customer" size="36"
                              style="float: left;margin-right: 10px;"></Icon>
                        <Tooltip placement="bottom-start" :content="company_short_info.companyName">
                            <span class="com_name_short" v-text="company_short_info.companyName"></span>
                        </Tooltip>
                    </div>
                    <template v-if="originalType != 'highseasCustomer'">
                        <div v-if="!disabled"
                            class="com_operate">
                            <!-- 编辑客户 -->
                            <Button v-if="authorized_button['editCompany']"
                                    type="text"
                                    icon="custom custom-field-edit"
                                    @click="visible_edit_company = true"> {{ $t('crm.Detail.editCompany') }}</Button>
                            <!-- 发送邮件 -->
                            <Button v-if="authorized_button['sendMail']"
                                    type="text"
                                    icon="custom custom-crm-send-mail"
                                    @click="sendMail"> {{ $t('crm.Detail.sendMail') }}</Button>
                            <!-- 新建询盘 -->
                            <Button v-if="authorized_button['newInquiry']"
                                    type="text"
                                    icon="custom custom-add-inquiry"
                                    @click="visible_new_inquiry = true"> {{ $t('crm.Detail.addInquiry') }}</Button>

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
                                        <!-- 转移客户 -->
                                        <li v-if="authorized_button['transferCompany']"
                                            @click="transferCompany"> {{ $t('crm.Detail.transferCompany') }}</li>
                                        <!-- 分享客户 -->
                                        <li v-if="authorized_button['shareCompany']"
                                            @click="shareCompany">{{ $t('crm.Detail.shareCompany') }}</li>
                                        <!-- 扔入公海 -->
                                        <li v-if="authorized_button['throwCompany']"
                                            @click="throwCompany">{{ $t('crm.Detail.throwCompany') }}</li>
                                        <!-- 标记 -->
                                        <li @click="remarkFun"
                                            class="piwik_mark_customer">
                                            <!--<Icon custom="custom-crm-mark" :color="active ? '#4285f4' : '#677f99'"></Icon>-->
                                            <!--详情页标记图标实现与旁边的图标一致的hover效果，故去掉color-->
                                            <!--<Icon custom="custom-crm-mark"></Icon>-->
                                            {{ $t('crm.Detail.remarkFun') }}
                                        </li>
                                        <!-- 查看日志 -->
                                        <li @click="visible_view_company_log = true">{{ $t('crm.Detail.viewCompanyLog') }}</li>
                                    </ul>
                                </div>
                            </Poptip>
                        </div>
                    </template>
                    <template v-else>
                        <!-- 查看日志 -->
                        <div v-if="!disabled"
                            class="com_operate">
                            <Button v-if="authorized_button['claimCustomer']"
                                type="text"
                                :loading="loading_claim"
                                icon="custom custom-crm-claim"
                                @click="getIsClaimInquiry"> {{ $t("crm.Detail.claimCustomer") }}</Button>
                            <Button
                                type="text"
                                icon="custom custom-crm-log"
                                @click="visible_view_company_log = true"> {{ $t('crm.Detail.viewCompanyLog') }}</Button>
                        </div>
                    </template>
                </div>
                <Row type="flex" justify="space-between">
                    <Col v-for="item in authorized_short_info_items" :key="item" :span="4">
                        <p class="col_name">{{ $t(`crm.newDetail.col_${item}`) }}</p>
                        <p class="col_value">{{ company_short_info[item] || '-' }}</p>
                    </Col>
                </Row>
            </div>
        </div>
        <div class="hr-block"></div>
        <div class="customerDrawer__component_wrap">
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
                <!-- type: 公司/询盘/联系人  -->
                <!-- id: 以上三类 id -->
                <!-- columns_authorized: 以上三类的权限字段 -->
                <!-- visitorId: 用于请求访问型跟进记录 -->
                <!-- flag_update_contact: 新增/更新联系人时, 需刷新联系人列表 -->
                <!-- flag_update_detail: 更新当前正在查看的 公司/询盘/联系人 时, 需刷新详情列表 -->
                <!-- flag_update_inquiry: 新增/更新/转移 询盘后, 需刷新询盘列表 -->
                <component :is="current_compo"
                           :ref="current_compo === 'FollowUp' ? 'followUp' : ''"
                           :type="'customer'"
                           :originalType="originalType"
                           :disabled="disabled"
                           :colSpan="colSpan"
                           :id="companyId"
                           :from="originalType"
                           :companyId="companyId"
                           :columns_authorized="corp_columns_authorized"
                           :contact_columns_authorized="contact_columns_authorized"
                           :inquiry_columns_authorized="inquiry_columns_authorized"
                           :visitorId="''"
                           :flag_update_contact.sync="flag_update_contact"
                           :flag_update_detail.sync="flag_update_detail"
                           :flag_update_inquiry.sync="flag_update_inquiry"
                           :flag_new_followUp="flag_new_followUp"
                           :flag_refresh_contact="flag_refresh_contact"
                           @refreshContact="$emit('update:flag_refresh_contact', !flag_refresh_contact)"
                           v-on="$listeners"
                           @refreshCheck="refreshCheck">
                </component>
            </keep-alive>
        </div>

        <!-- 模态框部分 -->
        <!-- 新增询盘 -->
        <NewInquiry
                :visible.sync="visible_new_inquiry"
                :companyId="companyId"
                :flag_update_inquiry.sync="flag_update_inquiry"
                :flag_update_contact.sync="flag_update_contact"

                @refreshContact="$emit('update:flag_refresh_contact', !flag_refresh_contact)"
                :contact_columns_authorized="contact_columns_authorized"
                :inquiry_columns_authorized="inquiry_columns_authorized"
                >
        </NewInquiry>

        <!-- 编辑公司信息 -->
        <EditCompany
                :visible.sync="visible_edit_company"
                :companyId="companyId"
                :flag_update_detail.sync="flag_update_detail"
                :corp_columns_authorized="corp_columns_authorized"
                @refreshCheck="refreshCheck">
        </EditCompany>

        <!-- 分享客户 -->
        <ShareCompany :visible.sync="visible_share_company"
                      :id="companyId"
                      :managerIds="company_short_info.companyManagerIds"
                      :managerNames="company_short_info.companyManagers"
                      :flag_update_detail.sync="flag_update_detail"
                      @refreshCheck="refreshCheck"></ShareCompany>

        <!-- 转移客户 -->
        <TransferCompany :visible.sync="visible_transfer_company"
                         :id="companyId"
                         :managerIds="company_short_info.companyManagerIds"
                         :managerNames="company_short_info.companyManagers"
                         :flag_update_detail.sync="flag_update_detail"
                         @refreshCheck="refreshCheck"
                         @closeAllDrawer="$listeners.closeAllDrawer(true)"></TransferCompany>

        <!-- 退入公海 -->
        <ThrowCompany :visible.sync="visible_throw_company"
                      :id="companyId"
                      @refreshCheck="refreshCheck"
                      @closeAllDrawer="$listeners.closeAllDrawer(true)"></ThrowCompany>

        <!-- 发送邮件 -->
        <SendMail :visible.sync="visible_send_mail"
                  type="customer"
                  :id="companyId"
                  :companyName="company_short_info.companyName"></SendMail>

        <!-- 查看公司操作日志 -->
        <ViewCompanyLog :visible.sync="visible_view_company_log"
                        type="customer"
                        :companyId="company_short_info.id"></ViewCompanyLog>
        <!-- 认领客户 -->
        <ClaimCustomer :visible.sync="visible_claim_customer"
                       :id="companyId"
                       @claimSuccess="claimSuccess"></ClaimCustomer>
    </div>
</template>

<script>
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import EditCompany from '@/views/crm/Detail/Components/Modal/editCompany';
    import NewInquiry from '@/views/crm/Detail/Components/Modal/newInquiry';
    import ShareCompany from '@/views/crm/Detail/Components/Modal/shareCompany';
    import TransferCompany from '@/views/crm/Detail/Components/Modal/transferCompany';
    import ThrowCompany from '@/views/crm/Detail/Components/Modal/throwCompany';
    import SendMail from '@/views/crm/Detail/Components/Modal/sendMail';
    import ViewCompanyLog from '@/views/crm/Detail/Components/Modal/viewCompanyLog';
    import FollowUp from '@/views/crm/Detail/Components/Html/followUp';
    import DetailInfo from '@/views/crm/Detail/Components/Html/detailInfo';
    import ContactList from '@/views/crm/Detail/Components/Html/contactList';
    import InquiryList from '@/views/crm/Detail/Components/Html/inquiryList';
    import ClaimCustomer from '@/views/crm/Detail/Components/Modal/claimCustomer';
    import { crmCompany } from '@/api/crm/index';
    import { mapState } from 'vuex';
    export default {
        name: 'customerDrawerDetail',
        components: {
            EditCompany,
            NewInquiry,
            ShareCompany,
            TransferCompany,
            ThrowCompany,
            SendMail,
            ViewCompanyLog,
            DetailInfo,
            FollowUp,
            ContactList,
            InquiryList,
            ClaimCustomer
        },
        props: [
            'type',
            'originalType',
            'companyId',
            'corp_columns_authorized',
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
                lang: state => state.app.lang,
                button_list: state => state.app.button_list,
                menu_list: state => state.app.menu_list
            }), // 从 vuex 中获取属性
            authorized_button() {
                const ids = BUTTON_IDS.CRM.customer;
                return {
                    editCompany: !HANDLE_BUTTON(ids.edit.editCustomer, this.button_list),
                    newInquiry: !HANDLE_BUTTON(ids.edit.newInquiry, this.button_list),
                    sendMail: !HANDLE_BUTTON(ids.edit.sendMail, this.button_list),
                    shareCompany: !HANDLE_BUTTON(ids.edit.share, this.button_list),
                    transferCompany: !HANDLE_BUTTON(ids.edit.transfer, this.button_list),
                    throwCompany: !HANDLE_BUTTON(ids.edit.throw, this.button_list),
                    claimCustomer: !HANDLE_BUTTON(BUTTON_IDS.CRM.highSeas.edit.claimCustomer, this.button_list)
                };
            },
            authorized_short_info_items() {
                const default_cols = ['companyManagers'];
                const authorized_cols = Array.isArray(this.corp_columns_authorized.default) ? this.corp_columns_authorized.default.filter(item => !item.manually).map(item => item.storageName).concat(default_cols) : default_cols;
                return this.short_info_items.filter(item => authorized_cols.includes(item));
            }
        },
        data() {
            return {
                loading: true,

                /* 公司详情部分 */
                company_short_info: {}, // 公司简略信息
                short_info_items: [
                    'shortName',
                    'clientType',
                    'countryArea',
                    'companyManagers'
                ], // 公司简略信息条目
                active: false, // 标识当前公司是否被标记

                /* 动态组件部分 */
                flag_update_contact: false,
                flag_update_detail: false,
                flag_update_inquiry: false,
                compo_list: [
                    'FollowUp',
                    'DetailInfo',
                    'ContactList',
                    'InquiryList'
                ],
                current_compo: '',

                /* 模态框部分 */
                visible_view_company_log: false,
                visible_new_inquiry: false,
                visible_edit_company: false,
                visible_share_company: false,
                visible_transfer_company: false,
                visible_throw_company: false,
                visible_send_mail: false,
                visible_claim_customer: false,
                loading_claim: false
            };
        },
        methods: {
            // 点击认领, 先获取当前用户是否有可接询盘权限, 再决定是否弹出认领确认框
            getIsClaimInquiry() {
                this.loading_claim = true;
                this.$commonApi.getUserPrivilege({
                    id: this.userId
                }).then(response => {
                    this.loading_claim = false;
                    if (response.code === '1') {
                        if (response.data && response.data.canGetInquiry === 1) {
                            this.visible_claim_customer = true;
                        } else {
                            this.$Message.warning(this.$t('crm.newDetail.haveNoAuthorityClaim'));
                        }
                    }
                }).catch(e => {
                    this.loading_claim = false;
                    this.$Message.warning(this.$t('crm.newDetail.haveNoAuthorityClaim'));
                });
            },
            // 认领成功, 触发外部页面重新请求当前详情页
            claimSuccess() {
                this.$emit('detailClaimSuccess');
            },
            claimCustomer() {
                this.visible_claim_customer = true;
                // this.$parent.$parent.$parent.batch_claim_customer('highseasCustomer', this.companyId);
                // console.log(this.$parent.$parent.$parent)
            },
            get_company_short_info() {
                this.loading = true;
                const data = {
                    companyId: this.companyId,
                    lang: this.lang
                };
                crmCompany.getSimpleCompany(data).then(async response => {
                    if (response.code === '1') {
                        this.company_short_info = response.data;
                        this.company_short_info.clientId = response.data.id;
                        this.active = response.data.marker === 1;
                    } else {
                        this.$Message.error(this.$t('crm.newDetail.error_getCompanyBriefInfo'));
                    }
                    this.loading = false;
                });
            }, // 获取公司信息,
            /* 按钮操作 */
            // 标记
            remarkFun() {
                let flag = 1;
                if (this.active) {
                    flag = 2;
                }
                const data = {
                    id: this.companyId,
                    marker: flag
                };
                crmCompany.addMarker(data).then(response => {
                    if (response.code === '1') {
                        this.active = !this.active;
                        if (this.active) {
                            this.$Message.success(this.$t('crm.Detail.success_addMarker'));
                        } else {
                            this.$Message.success(this.$t('crm.Detail.success_removeMarker'));
                        }
                        this.refreshCheck();
                    } else {
                        this.$Message.error(this.$t('crm.Detail.error_addMarker'));
                    }
                });
            },
            // 分享
            shareCompany() {
                this.visible_share_company = true;
            },
            // 转移
            transferCompany() {
                this.visible_transfer_company = true;
            },
            // 退入公海
            throwCompany() {
                this.visible_throw_company = true;
            },
            // 发送邮件
            sendMail() {
                this.visible_send_mail = true;
            },

            // 向上传递"刷新指定公司 id 对应的客户信息"
            refreshCheck() {
                this.$emit('refreshCheck', { companyId: this.companyId });
            }
        },
        watch: {
            companyId: {
                handler(val) {
                    if (val) {
                        this.get_company_short_info();
                        this.current_compo = this.compo_list[0];
                    }
                },
                immediate: true
            },
            flag_update_detail() {
                this.get_company_short_info();
            },
            flag_update_inquiry() {
                this.refreshCheck();
            }
        }
    };
</script>

<style lang="less">
    .customData-btn {
        padding: 6px 10px 5px;
        border: 1px solid #F5F6F9;
        line-height: 17px;
        background-color: #F5F6F9;

        i {
            line-height: 1;
        }

        &:hover {
            color: #2d8cf0;
            border-color: #2d8cf0;

            i {
                color: #2d8cf0;
            }
        }
    }

    .customerDrawer{
        &__component_wrap {
            padding: 0 24px;

            .el-tabs {
                .el-tabs__header {
                    margin-bottom: 0;
                }

                .el-tabs__nav-wrap:after {
                    height: 1px;
                }

                .el-tabs__item {
                    &.is-active {
                        font-weight: 700;
                    }
                }

                .el-tabs__nav {
                    .el-tabs__item:nth-child(2) {
                        padding-left: 0;
                    }
                }
            }
            .drawer__contactList, .drawer__inquiryList {
                .el-table {
                    .cell {
                        white-space: nowrap;
                        padding-right: 10px;
                    }
                }
            }
        }
    }
</style>
