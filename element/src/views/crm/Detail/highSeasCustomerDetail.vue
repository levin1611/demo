<template>
    <div class="crm-detail-page" :style="['mail', 'mail_detail', 'whatsApp', 'microenterprise','global_sms_calling','Sms'].includes(from) && 'min-width: 0;'">
        <div v-loading="loading">
            <!-- 公司详情 -->
            <div class="companyWrap" style="padding:20px 20px 16px;">
                <div class="company">
                    <div class="com_top">
                        <div class="com_name" :style="['microenterprise'].includes(from) && 'display: flex;'">
                            <Icon custom="custom-highseas-customer" size="36"
                                  style="float: left;margin-right: 10px;"></Icon>
                            <Tooltip placement="bottom-start" :content="company_short_info.companyName">
                                <span class="com_name_short" :style="(['mail', 'mail_detail'].includes(from) && 'max-width: 136px;overflow: hidden;text-overflow:ellipsis;white-space: nowrap;margin-right:0;') || (['microenterprise'].includes(from) && 'max-width: 100px;overflow: hidden;text-overflow:ellipsis;white-space: nowrap;')">
                                    <a style="color:#4285f4" @click.stop="viewCompany(company_short_info.id)">
                                        {{ company_short_info.companyName }}
                                    </a>
                                </span>
                            </Tooltip>
                        </div>
                        <div v-if="!disabled"
                             class="com_operate">
                            <!-- 认领客户 -->
                            <Button v-if="authorized_button['claimCustomer']"
                                    type="text"
                                    class="highSeas-claim-customer"
                                    icon="custom custom-crm-claim"
                                    :loading="loading_claim"
                                    @click="getIsClaimInquiry"> {{ $t('crm.Detail.claimCustomer') }}</Button>
                            <!-- 查看日志 -->
                            <Button type="text"
                                    icon="custom custom-crm-log"
                                    @click="visible_view_company_log = true"> {{ $t('crm.Detail.viewCompanyLog') }}</Button>
                        </div>
                    </div>
                    <!-- 邮件模块 侧滑页数据布局 -->
                    <Row class="com_main" style="margin-top: 12px;" v-if="['mail', 'mail_detail','whatsApp', 'microenterprise','global_sms_calling','Sms'].includes(from)">
                        <Col v-for="item in authorized_short_info_items" :key="item" :span="12">
                            <span class="col_name">{{ $t(`crm.newDetail.col_${item}`) }}：</span>
                            <span class="col_value" :class="item">{{ company_short_info[item] }}</span>
                        </Col>
                    </Row>
                    <!-- crm模块 侧滑页数据布局 -->
                    <Row type="flex" justify="space-between" v-else>
                        <Col v-for="item in authorized_short_info_items" :key="item" :span="4">
                            <p class="col_name">{{ $t(`crm.newDetail.col_${item}`) }}</p>
                            <p class="col_value">{{ company_short_info[item] }}</p>
                        </Col>
                    </Row>
                </div>
                  <!-- whatsApp聊天主页面增加标签详情 组件通信使用provide 来源是WhatsApp主页面index.vue-->
                <main class="tagWrap" v-if="['whatsApp'].includes(from)">
                    <waLableTagVue></waLableTagVue>
                </main>
            </div>
            <div class="hr-block"></div>
            <div class="component-wrap" :style="['microenterprise'].includes(from) && 'padding: 0 20px;'">
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
                    <!-- currAccountInfo往来邮件用 -->
                    <component :is="current_compo"
                               :ref="current_compo === 'FollowUp' ? 'followUp' : ''"
                               type="highseasCustomer"
                               :from="from"
                               :originalType="originalType"
                               :disabled="true"
                               :id="companyId"
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
                               :globalSearchFlag="globalSearchFlag"
                               :globalSearchContactId="globalSearchContactId"
                               :globalSearchInquiryId="globalSearchInquiryId"
                               :currAccountInfo="currAccountInfo"
                               @refreshContact="$emit('update:flag_refresh_contact', !flag_refresh_contact)"
                               v-on="$listeners"
                               @refreshCheck="refreshCheck">
                    </component>
                </keep-alive>
            </div>

            <!-- 模态框部分 -->
            <!-- 认领客户 -->
            <ClaimCustomer :visible.sync="visible_claim_customer"
                           :id="companyId"
                           @claimSuccess="refreshCheck"></ClaimCustomer>

            <!-- 查看公司操作日志 -->
            <ViewCompanyLog :visible.sync="visible_view_company_log"
                            type="highseasCustomer"
                            :companyId="company_short_info.id"></ViewCompanyLog>
        </div>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import util from '@/libs/util';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import ClaimCustomer from '@/views/crm/Detail/Components/Modal/claimCustomer';
    import ViewCompanyLog from '@/views/crm/Detail/Components/Modal/viewCompanyLog';
    import FollowUp from '@/views/crm/Detail/Components/Html/followUp';
    import DetailInfo from '@/views/crm/Detail/Components/Html/detailInfo';
    import ContactList from '@/views/crm/Detail/Components/Html/contactList';
    import InquiryList from '@/views/crm/Detail/Components/Html/inquiryList';
    import inOutGoingMail from '@/views/main-components/little-drawer/components/inOutGoingMail.vue';
    import waLableTagVue from '@/views/whatsapp-manage/components/waLableTag.vue';
    export default {
        name: 'highSeasCustomerDetail',
        components: {
            ClaimCustomer,
            ViewCompanyLog,
            DetailInfo,
            FollowUp,
            ContactList,
            InquiryList,
            inOutGoingMail,
            waLableTagVue
        },
        props: [
            'type',
            'originalType',
            'companyId',
            'companyName',
            'corp_columns_authorized',
            'contact_columns_authorized',
            'inquiry_columns_authorized',
            'disabled',
            'flag_new_followUp',
            'flag_refresh_contact',
            'from',
            'currAccountInfo'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                button_list: state => state.app.button_list,
                lang: state => state.app.lang,
                menu_list: state => state.app.menu_list
            }), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu'
            ]),
            authorized_button() {
                const ids = BUTTON_IDS.CRM.highSeas;
                return {
                    claimCustomer: !HANDLE_BUTTON(ids.edit.claimCustomer, this.button_list)
                };
            },

            authorized_short_info_items() {
                const default_cols = ['clientId', 'companyManagers'];
                const authorized_cols = Array.isArray(this.corp_columns_authorized.default) ? this.corp_columns_authorized.default.filter(item => !item.manually).map(item => item.storageName).concat(default_cols) : default_cols;
                return this.short_info_items.filter(item => authorized_cols.includes(item));
            }
        },
        data() {
            return {
                loading: true,
                loading_claim: false,

                /* 公司详情部分 */
                company_short_info: {}, // 公司简略信息
                short_info_items: [
                    // 'clientId',
                    // 'clientType',
                    // 'homePage',
                    // 'contactAddress',
                    // 'companyManagers'
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
                visible_claim_customer: false,

                /* 全局搜索打开公海联系人/公海询盘详情页的相关变量 */
                globalSearchContactId: '', // 要打开公海联系人详情页的联系人id
                globalSearchInquiryId: '', // 要打开公海询盘详情页的联系人id
                globalSearchFlag: false // 标记打开联系人详情页的操作来自于全局搜素的点击操作
            };
        },
        methods: {
            // 点击认领, 先获取当前用户是否有可接询盘权限, 再决定是否弹出认领确认框
            getIsClaimInquiry() {
                this.loading_claim = true;
                util.ajax({
                    url: '/new-privilege/user/get',
                    method: 'get',
                    params: {
                        id: this.userId
                    }
                }).then(response => {
                    this.loading_claim = false;
                    if (response.data.code === '1') {
                        if (response.data.data && response.data.data.canGetInquiry === 1) {
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

            get_company_short_info() {
                this.loading = true;
                util.ajax({
                    url: '/crm/company/getSimpleCompany',
                    method: 'post',
                    data: {
                        companyId: this.companyId,
                        lang: this.lang,
                        listType: 1
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.company_short_info = response.data.data;
                        this.company_short_info.clientId = response.data.data.id;
                        if (response.data.data.marker === 1) {
                            this.active = true;
                        } else {
                            this.active = false;
                        }
                    } else {
                        this.$Message.error(this.$t('crm.newDetail.error_getCompanyBriefInfo'));
                    }
                    this.loading = false;
                });
            }, // 获取公司信息

            /* 按钮操作 */

            // 向上传递"刷新指定公司 id 对应的客户信息"
            refreshCheck() {
                this.$emit('refreshCheck', { companyId: this.companyId });
            },
            /* 查看详情 */
            async viewCompany(companyId) {
                // 判断是否有"公海客户"页面权限
                if (!this.isContainsMenu('highseasCustomer')) {
                    // 没有"我的客户"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionHighseasCustomer'));
                    return;
                }

                // 否则直接新窗口打开新客户详情页
                this.$viewHighSeasCustomer(companyId);
            }
        },
        mounted() {
            /* 专用于处理从全局搜索结果页跳转至公海询盘详情页时，自动打开公海联系人的操作 */
            const globalSearchViewType = localStorage.getItem('leadsCloud-globalSearchViewType');
            const inquiryId = localStorage.getItem('leadsCloud-inquiryId');
            const contactId = localStorage.getItem('leadsCloud-contactId');
            switch (globalSearchViewType) {
                case 'highSeaContact':
                    this.current_compo = 'ContactList';
                    this.globalSearchFlag = true;
                    this.globalSearchContactId = contactId;
                    localStorage.removeItem('leadsCloud-globalSearchViewType');
                    localStorage.removeItem('leadsCloud-contactId');
                    break;
                case 'highSeaInquiry':
                    this.current_compo = 'InquiryList';
                    this.globalSearchFlag = true;
                    this.globalSearchInquiryId = inquiryId;
                    localStorage.removeItem('leadsCloud-globalSearchViewType');
                    localStorage.removeItem('leadsCloud-inquiryId');
                    break;
            }
        },
        watch: {
            companyId: {
                handler(val) {
                    if (val) {
                        if (['mail', 'mail_detail'].includes(this.from)) {
                            this.compo_list.unshift('inOutGoingMail');
                        }
                        this.get_company_short_info();
                        this.current_compo = this.compo_list[0];
                    }
                },
                immediate: true
            },
            'company_short_info.companyName': {
                handler(val) {
                    if (val) {
                        this.$emit('update:companyName', val);
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
</style>
<style scoped lang="less">
    // 邮件模块侧滑页详情显示布局
    .com_main{

        /deep/ .el-col-12{
            line-height: 18px;
            display: flex;
            margin-top: 8px;
        }

        span.col_name{
            display: inline-block;
            margin-bottom: 0;
            margin-top: 0;
            line-height: 18px;
            vertical-align: middle;
        }

        span.col_value{
            display: inline-block;
            margin-bottom: 0;
            margin-top: 0;
            line-height: 18px;
            max-width: 100px;
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
            vertical-align: middle;
            &.shortName{
                max-width: 89px;
            }
        }
    }
    .com_operate{
        /deep/ .el-button--text{
            margin-left: 0;
            span{
                margin-left: 2px;
            }
        }
    }
</style>
