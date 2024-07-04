<template>
    <div class="crm-detail-page" :style="['mail', 'mail_detail', 'whatsApp', 'microenterprise','Sms','global_sms_calling'].includes(from) && 'min-width: 0;'">
        <div v-loading="loading">
            <!-- 公司详情 -->
            <div class="companyWrap" style="padding:20px 20px 16px;">
                <div class="company">
                    <div class="com_top">
                        <div class="com_name" :style="['microenterprise'].includes(from) && 'display: flex;'">
                            <Icon custom="custom-customer" size="36"
                                  style="float: left;margin-right: 10px;"></Icon>
                            <Tooltip placement="bottom-start" :content="company_short_info.companyName">
                                <span class="com_name_short" :style="(['mail', 'mail_detail'].includes(from) && 'max-width: 108px;overflow: hidden;text-overflow:ellipsis;white-space: nowrap;margin-right:0;') || (['microenterprise'].includes(from) && 'max-width: 250px;overflow: hidden;text-overflow:ellipsis;white-space: nowrap;')">
                                    <a style="color:#4285f4" @click.stop="viewCompany(company_short_info.id)">
                                        {{ company_short_info.companyName }}
                                    </a>
                                </span>
                            </Tooltip>
                            <!-- 海关数据功能, 已废弃 -->
                            <!--<Button class="customData-btn" icon="custom custom-customs-data" circle-->
                            <!--        v-if="!disabled && authorized_button['customs'] && companyName"-->
                            <!--        @click="$emit('viewCustomsData')">{{ $t('crm.Detail.customData') }}-->
                            <!--</Button>-->
                        </div>
                        <div v-if="!disabled"
                             class="com_operate">
                            <!-- 编辑客户 -->
                            <Button v-if="authorized_button['editCompany'] && !['mail', 'mail_detail'].includes(from)"
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
                                        <!-- 编辑客户 -->
                                        <li v-if="authorized_button['editCompany'] && ['mail', 'mail_detail'].includes(from)"
                                            @click="visible_edit_company = true"> {{ $t('crm.Detail.editCompany') }}</li>
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
<!--                                            <Icon custom="custom-crm-mark"></Icon>-->
                                            {{ $t('crm.Detail.remarkFun') }}
                                        </li>
                                        <!-- 查看日志 -->
                                        <li @click="visible_view_company_log = true">{{ $t('crm.Detail.viewCompanyLog') }}</li>
                                    </ul>
                                </div>
                            </Poptip>
                        </div>
                    </div>
                    <!-- 邮件模块 侧滑页数据布局 -->
                    <Row class="com_main" style="margin-top: 12px;" v-if="['mail', 'mail_detail','whatsApp', 'microenterprise','Sms','global_sms_calling'].includes(from)">
                        <Col v-for="item in authorized_short_info_items" :key="item" :span="12">
                            <span class="col_name">{{ $t(`crm.newDetail.col_${item}`) }}：</span>
                            <span class="col_value" :class="item" :title="company_short_info[item]">{{ company_short_info[item] }}</span>
                            <span @click.stop @click="handleClickEdit(item, $event)"
                                style="width: 18px;display:inline-block;text-align:right;"
                                v-if="!notEditField.includes(item) && originalType === 'customer'">
                                <a href="javascript:void(0)" class="table-show-edit custom custom-remark-edit"></a>
                            </span>
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
            <div class="component-wrap" :style="['microenterprise','Sms'].includes(from) && 'padding: 0 20px;'">
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
                               :type="'customer'"
                               :from="from"
                               :originalType="originalType"
                               :colSpan="colSpan"
                               :disabled="disabled"
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
                               :currAccountInfo="currAccountInfo"
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
                             @closeAllDrawer="$emit('closeAllDrawer', true)"></TransferCompany>

            <!-- 退入公海 -->
            <ThrowCompany :visible.sync="visible_throw_company"
                          :id="companyId"
                          @refreshCheck="refreshCheck"
                          @closeAllDrawer="$emit('closeAllDrawer', true)"></ThrowCompany>

            <!-- 发送邮件 -->
            <SendMail :visible.sync="visible_send_mail"
                      type="customer"
                      :id="companyId"
                      :companyName="company_short_info.companyName"></SendMail>

            <!-- 查看公司操作日志 -->
            <ViewCompanyLog :visible.sync="visible_view_company_log"
                            type="customer"
                            :companyId="company_short_info.id"></ViewCompanyLog>
        </div>
        <Poptip ref="editPopover"
            popper-class="table-edit-box-popper"
            v-model="visibleEdit"
            placement="top-end"
            :reference="prevTarget"
            :key="popperFlag"
            :width="checkedColumn.width"
            @hide="clearEditPopperComponent"
            :popper-options="popperOptions"
        >
            <div class="table-edit-box">
                <Form
                    class="table-edit-form"
                    inline
                    :validate-on-rule-change="false"
                    label-position="left"
                    label-width="90px"
                >
                    <CrmInputArea ref="crmInputArea"
                                :data.sync="tempDetail"
                                :items="corp_item_all"
                                :selectOptions="computed_selectOptions"
                                :pictures.sync="detailPictures"
                                :error_countryArea.sync="error_countryArea"
                                :email_editing="email_editing"
                                :email_saving="email_saving"
                                :estimatedInquiryAmount.sync="estimatedInquiryAmount"
                                :estimatedInquiryAmountCurrency.sync="estimatedInquiryAmountCurrency"
                                :transactionInfo.sync="transactionInfo"
                                ></CrmInputArea>
                </Form>
                <div class="table-edit-box-buttons">
                    <Button @click="clearEditPopperComponent" type="text">{{ $t('crm.Modal.modal_cancel') }}</Button>
                    <Button type="text" @click="ok" class="table-edit-box-button-sure" :disabled="loading">{{ $t('crm.Modal.modal_ok') }}</Button>
                </div>
            </div>
        </Poptip>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import util from '@/libs/util';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { crmCommon, crmCompany } from '@/api/crm/index';
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
    import CrmInputArea from '@/views/crm/Detail/Components/Modal/fixed-modal-form/crm-input-area';
    import inOutGoingMail from '@/views/main-components/little-drawer/components/inOutGoingMail.vue';
    import waLableTagVue from '@/views/whatsapp-manage/components/waLableTag.vue';

    export default {
        name: 'customerDetail',
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
            CrmInputArea,
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
            'currAccountInfo',
            'colSpan'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                button_list: state => state.app.button_list,
                lang: state => state.app.lang,
                menu_list: state => state.app.menu_list,
                selectOptions: state => state.crm.selectOptions
            }), // 从 vuex 中获取属性
            ...mapGetters([
                // 字段长度校验
                'check_length_default',
                'check_length_custom',
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            authorized_button() {
                const ids = BUTTON_IDS.CRM.customer;
                return {
                    editCompany: !HANDLE_BUTTON(ids.edit.editCustomer, this.button_list),
                    newInquiry: !HANDLE_BUTTON(ids.edit.newInquiry, this.button_list),
                    sendMail: !HANDLE_BUTTON(ids.edit.sendMail, this.button_list),
                    shareCompany: !HANDLE_BUTTON(ids.edit.share, this.button_list),
                    transferCompany: !HANDLE_BUTTON(ids.edit.transfer, this.button_list),
                    throwCompany: !HANDLE_BUTTON(ids.edit.throw, this.button_list)
                };
            },
            // showCustomBtn() {
            //     return this.$store.state.app.roleMenu.some(item => item.path === 'customs_data');
            // },

            authorized_short_info_items() {
                const default_cols = ['clientId', 'companyManagers'];
                const authorized_cols = Array.isArray(this.corp_columns_authorized.default) ? this.corp_columns_authorized.default.filter(item => !item.manually).map(item => item.storageName).concat(default_cols) : default_cols;
                return this.short_info_items.filter(item => authorized_cols.includes(item));
            },
            computed_selectOptions() {
                const result = {};
                Object.entries(this.$deepClone(this.selectOptions)).forEach(([key, value]) => {
                    result[key] = value.filter(item => item.isAvailable === 1);
                });
                return result;
            }
        },
        data() {
            return {
                loading: true,

                /* 公司详情部分 */
                company_short_info: {}, // 公司简略信息
                short_info_items: [
                    // 'clientId',
                    'shortName',
                    'clientType',
                    'countryArea',
                    'companyManagers'
                    // 'homePage',
                    // 'contactAddress',
                    // 'companyManagers'
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
                visibleEdit: false,
                prevTarget: null,
                popperFlag: false,
                email_editing: false,
                email_saving: false,
                error_countryArea: false,
                estimatedInquiryAmount: null,
                estimatedInquiryAmountCurrency: 'CNY',
                transactionInfo: null,
                detailPictures: [],
                corp_item_all: [],
                tempDetail: {},
                checkedColumn: {
                    offset: [1, 1],
                    width: '',
                    key: ''
                },
                popperOptions: {
                    boundariesElement: 'body',
                    positionFixed: true,
                    adaptive: false
                },
                notEditField: ['clientId', 'companyManagers']
            };
        },
        methods: {
            get_company_short_info() {
                this.loading = true;
                util.ajax({
                    url: '/crm/company/getSimpleCompany',
                    method: 'post',
                    data: {
                        companyId: this.companyId,
                        lang: this.lang
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.company_short_info = response.data.data;
                        this.tempDetail = this.$deepClone(this.company_short_info);
                        this.company_short_info.clientId = response.data.data.id;
                        this.active = response.data.data.marker === 1;
                    } else {
                        this.$Message.error(this.$t('crm.newDetail.error_getCompanyBriefInfo'));
                    }
                    this.loading = false;
                });
            }, // 获取公司信息

            /* 按钮操作 */
            // 标记
            remarkFun() {
                let flag = 1;
                if (this.active) {
                    flag = 2;
                }
                util.ajax({
                    url: '/crm/company/addMarker',
                    method: 'post',
                    data: {
                        id: this.companyId,
                        marker: flag
                    }
                }).then(response => {
                    if (response.data.code === '1') {
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
            },
            // 点击编辑
            handleClickEdit(key, e) {
                let column = {};
                if (this.corp_columns_authorized.default.some(item => item.storageName === key)) {
                    column = this.corp_columns_authorized.default.filter(item => item.storageName === key)[0];
                }
                // 处理多选的数据格式
                if (column.colType === 'selectMultiple') {
                    this.tempDetail[key] = this.$options.filters.parseArray(this.tempDetail[key]);
                }
                this.parentFiled = column.parentId;
                this.$set(this.checkedColumn, 'key', key);
                if (this.parentFiled === 1) {
                    this.corp_item_all = [column];
                } else {
                    this.$Message.warning(this.$t('crm.Table.system_fields_cannotEdit'));
                    return;
                }
                const path = e.path || (e.composedPath && e.composedPath());
                const currentTarget = Array.isArray(path) ? path[0] : e.currentTarget; // 赋值当前点击的编辑
                this.$set(this.checkedColumn, 'width', column.width + 90);
                // this.rowIndex = rowIndex;
                this.editKey = column.key;
                // 判断是否需要切换
                if (this.prevTarget === currentTarget) {
                    // 同一个元素重复点击
                    this.visibleEdit = !this.visibleEdit;
                } else {
                    // 切换不同元素, 判断之前是否有点击其他编辑 prevTarget
                    if (this.prevTarget) {
                        // 先清除之前的编辑框
                        this.clearEditPopperComponent();
                        // 然后生成新的编辑框
                        this.$nextTick(() => {
                            this.prevTarget = currentTarget;
                            this.visibleEdit = true;
                            this.$nextTick(() => {
                                if (this.$refs.crmInputArea.$refs[key]) {
                                    this.$refs.crmInputArea.$refs[key][0].focus();
                                }
                            });
                        });
                    } else {
                        this.prevTarget = currentTarget;
                        this.visibleEdit = true;
                        setTimeout(() => {
                            if (this.$refs.crmInputArea.$refs[key]) {
                                this.$refs.crmInputArea.$refs[key][0].focus();
                            }
                        }, 100);
                    }
                }
            },
            clearEditPopperComponent() {
                this.prevTarget = null;
                this.popperFlag = !this.popperFlag;
                this.visibleEdit = false;
            },
            async ok() {
                // 如果当前正在录入, 则退出录入
                if (this.loading) {
                    this.$Message.warning(this.$t('mail.customerBox.requestTip'));
                    return;
                }
                // 图片是否上传完成
                if (Array.isArray(this.detailPictures) && this.detailPictures.some(item => item.uploading)) {
                    this.$Message.warning(this.$t('crm.Modal.info_contactPictureUploading'));
                    return;
                }
                // 校验社交平台信息是否填完整
                if (this.tempDetail.socialNetworkingPlatform && this.tempDetail.socialNetworkingPlatform.length && (this.socialPlatformsFlag() === '1' || this.socialPlatformsFlag() === '2')) {
                    const str = this.socialPlatformsFlag() === '2' ? '社交平台分类不能为空' : '社交平台内容不能为空';
                    this.$Message.error(str);
                    return;
                }
                if (this.parentFiled === 1) {
                    // 各种合法性校验
                    // 公司名不能为空
                    if (this.tempDetail.companyName && !this.tempDetail.companyName.trim()) {
                        this.$Message.error(this.$t('crm.Modal.error_emptyCompanyName'));
                        return;
                    }
                    // 必填字段校验
                    let tempErrorField = '';
                    let countryAreaName = '';
                    if (this.corp_item_all.some(item => {
                        if (item.mustInput === 1) {
                            if (item.storageName === 'companyPicture') {
                                if (this.detailPictures.length === 0) {
                                    tempErrorField = item.cname;
                                    return true;
                                }
                            } else {
                                if (!this.tempDetail[item.storageName] || this.tempDetail[item.storageName].length === 0) {
                                    if (item.isOnlyRead !== 1) {
                                        tempErrorField = item.cname;
                                        return true;
                                    }
                                }
                            }
                        }
                    })) {
                        this.$Message.error(`${tempErrorField}${this.$t('crm.Modal.error_canNotBeEmpty')}`);
                        return;
                    }
                    // 正体
                    this.loading = true;
                    // 校验公司名
                    if (this.corp_item_all && this.corp_item_all.some(item => item.storageName === 'companyName') && this.tempDetail.companyName !== this.company_short_info.companyName) {
                        const res_uniqCompanyName = await crmCompany.sameCompanyName({
                            orgId: this.enterpriseId,
                            companyName: this.tempDetail.companyName,
                            id: this.tempDetail.id
                        });
                        if (res_uniqCompanyName.data && this.tempDetail.companyName !== this.company_short_info.companyName) {
                            this.$Message.error(this.$t('crm.Modal.error_existedCompanyName'));
                            this.loading = false;
                        }
                    }

                    // 校验国家地区, 非只读情况下
                    if (this.loading) {
                        const temp = this.corp_item_all.find(item => item.storageName === 'countryArea');
                        if (temp && this.tempDetail.countryArea) {
                            if (temp.isOnlyRead !== 1) {
                                const res_getCountryArea = await this.$commonApi.getDetailByCode({
                                    divCode: this.tempDetail.countryArea
                                });
                                if (!(Array.isArray(res_getCountryArea.data) && res_getCountryArea.data.length)) {
                                    this.$Message.error(this.$t('crm.Modal.error_countryAreaFormat'));
                                    this.error_countryArea = true;
                                    this.loading = false;
                                } else {
                                    countryAreaName = this.lang === 'zh-CN' ? `${res_getCountryArea.data[0].countryName}-${res_getCountryArea.data[0].divisionCnname}` : `${res_getCountryArea.data[0].countryEnname}-${res_getCountryArea.data[0].divisionEnname}`;
                                }
                            }
                        }
                    }

                    // 校验都通过
                    if (this.loading) {
                        const send_data = {
                            id: this.tempDetail.id,
                            orgId: this.enterpriseId,
                            companyName: this.company_short_info.companyName
                        };
                        this.corp_item_all.forEach(item => {
                            if (item.isOnlyRead !== 1) {
                                switch (item.storageName) {
                                    case 'companyPicture':
                                        this.tempDetail.companyPicture = this.detailPictures.map(pic => pic.url).join(';');
                                        send_data.companyPicture = this.detailPictures.map(pic => pic.url).join(';');
                                        break;
                                    default:
                                        switch (item.colType) {
                                            case 'selectMultiple':
                                                const temp = Array.isArray(this.tempDetail[item.storageName]) ? JSON.stringify(this.tempDetail[item.storageName]) : JSON.stringify([]);
                                                send_data[item.storageName] = temp;
                                                break;
                                            case 'select':
                                                send_data[item.storageName] = this.tempDetail[item.storageName] || '';
                                                break;
                                            default:
                                                send_data[item.storageName] = this.tempDetail[item.storageName];
                                        }
                                }
                            }
                        });
                        // /* 检验字段是否超长 */
                        if (this.check_length_default('corp_field_long_limit', send_data) || this.check_length_custom('corp_item_custom', this.corp_item_all, send_data)) {
                            this.loading = false;
                            return false;
                        }
                        const updateFieldData = {
                            userId: this.userId,
                            userName: this.fullName,
                            idStr: this.tempDetail.id,
                            orgId: this.enterpriseId,
                            tableType: 1,
                            fieldName: this.checkedColumn.key,
                            fieldValue: send_data[this.checkedColumn.key]
                        };
                        crmCommon.updateField(updateFieldData).then(response => {
                            this.loading = false;
                            if (response.code === '1') {
                                this.$saveLog({
                                    operateType: 2,
                                    operateModule: 1,
                                    companyId: this.company_short_info.id,
                                    targetId: this.company_short_info.id,
                                    enterpriseId: this.enterpriseId.toString(),
                                    userId: this.userId,
                                    fullName: this.fullName,
                                    prevObj: Object.assign({}, this.company_short_info),
                                    currentObj: Object.assign({}, this.tempDetail)
                                }, 'company');
                                this.$Message.success(this.$t('crm.Detail.success_editTable'));
                                if (this.checkedColumn.key === 'countryArea') {
                                    this.company_short_info[this.checkedColumn.key] = countryAreaName.replace(/-未知地区|-unknown area/g, '');
                                } else {
                                    this.company_short_info[this.checkedColumn.key] = send_data[this.checkedColumn.key];
                                }
                                this.clearEditPopperComponent();
                                this.refreshCheck();
                            } else {
                                this.$Message.error(this.$t('crm.Detail.error_editTable'));
                            }
                        }, () => {
                            this.loading = false;
                        }).catch(() => {
                            this.loading = false;
                        });
                    }
                }
            },
            /* 查看详情 */
            async viewCompany(companyId) {
                // 判断是否有"我的客户"页面权限
                if (!this.isContainsMenu('myCustomer')) {
                    // 没有"我的客户"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                    return;
                }

                // 查询该公司 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Customer',
                    id: companyId
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 否则直接新窗口打开新客户详情页
                this.$viewCustomer(companyId);
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

            .table-show-edit{
                display: none;
                width: 14px;
                height: 14px;
                font-size: 14px;
                color: #666;
                &.custom-bianji-normal{
                    width: 22px;
                    height: 22px;
                    font-size: 22px;
                  }
            }

            &:hover{
                .table-show-edit{
                    display: inline-block;
                    &:hover{
                        color: #ff7f39;
                    }
                }
            }
        }

        span.col_name{
            display: inline-block;
            line-height: 18px;
            margin-bottom: 0;
            margin-top: 0;
            vertical-align: middle;
        }

        span.col_value{
            display: inline-block;
            margin-bottom: 0;
            margin-top: 0;
            max-width: 80px;
            line-height: 18px;
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
            vertical-align: middle;
            &.shortName{
                max-width: 74px;
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

    .table-edit-box-popper{
        .table-edit-box{
            padding: 16px;
            left: 0 !important;

            .table-edit-form{
                margin-right: 0;;
            }

            .table-edit-box-buttons{
                position: relative;
                border-radius: 0;
                text-align: right;
                top: 0;
                width: auto;
                background: none;
                box-shadow: 0 0;
                line-height: 24px;
                margin-top: 12px;
            }
        }
        /deep/ &.el-popper{
            margin-top: 6px;
        }
    }
</style>
