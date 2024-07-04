<template>
    <div class="journey-detail" v-loading="loading">
        <!-- 小屏头部 -->
        <div class="journey-detail-top">
            <div class="journey-detail-top-icon">
                <div class="icon-list">
                    <Tooltip v-if="customerInfo.status === 'clue' && !currAccountInfo.noHaveManageAuthority" :content="$t('clue.clue')">
                        <Icon custom="custom-clue" size="36"></Icon>
                    </Tooltip>
                    <Tooltip v-else-if="customerInfo.status === 'inquiry' && !currAccountInfo.noHaveManageAuthority" :content="$t('clue.inquiry')">
                        <Icon custom="custom-inquiry" size="36"></Icon>
                    </Tooltip>
                    <div v-else>
                        <!-- 企业同事 图标 -->
                        <Tooltip v-if="customerInfo.status === 'colleague'" :content="'企业同事'">
                            <Icon custom="custom custom-tongshi" size="36" style="color:#CBD6E2;"></Icon>
                        </Tooltip>
                        <!-- 个人通讯录 图标 -->
                        <Tooltip v-else-if="customerInfo.status === 'addressBook'" :content="'个人通讯录'">
                            <Icon custom="custom custom-tongxunlu" size="36" style="color:#CBD6E2;"></Icon>
                        </Tooltip>
                        <!-- 陌生人（未建档）、没有权限的线索、没有权限的询盘 图标 -->
                        <Tooltip v-else :content="customerInfo.status ==='undocumentedCustomers' ? $t('littleDrawer.undocumentedCustomers') : customerInfo.status === 'clue' ? $t('clue.clue') :  customerInfo.status === 'inquiry' ? $t('crm.Table.item_customer_withName') :  $t('littleDrawer.irrelevantCustomer')">
                            <Icon custom="custom-weijiandang" size="36" style="color:#CBD6E2;"></Icon>
                        </Tooltip>
                    </div>
                </div>
                <div style="width: calc(100% - 82px)">
                    <p class="com_name_short">
                        <Tooltip placement="bottom-start" :content="customerInfo.title ? customerInfo.title : customerInfo.status ==='undocumentedCustomers' ? $t('littleDrawer.undocumentedCustomers') : $t('littleDrawer.irrelevantCustomer') ">
                            <span>{{ customerInfo.title ? customerInfo.title : customerInfo.status ==='undocumentedCustomers' ? $t('littleDrawer.undocumentedCustomers') : $t('littleDrawer.irrelevantCustomer') }}</span>
                        </Tooltip>
                    </p>
                    <!-- 企业同事 显示部门 -->
                    <p class="com_name_short" style="font-size:12px" v-if="currAccountInfo.departmentName">
                        <Tooltip placement="bottom-start" :content="currAccountInfo.departmentName">
                            <span>{{$t('mail.department')}}: {{currAccountInfo.departmentName}}</span>
                        </Tooltip>
                    </p>
                    <!-- 个人通讯录显示 分组 -->
                    <p class="com_name_short" style="font-size:12px" v-if="currAccountInfo.groupName">
                        <Tooltip placement="bottom-start" :content="currAccountInfo.groupName">
                            <span>{{$t('mail.classification')}}: {{currAccountInfo.groupName}}</span>
                        </Tooltip>
                    </p>
                    <!-- 企业同事、个人通讯录 增加【邮件：】标题 -->
                    <p class="com_name_short" style="font-size:12px">
                        <Tooltip placement="bottom-start" :content="currAccountInfo.mailAddress">
                            <span><span v-if="currAccountInfo.groupName || currAccountInfo.departmentName">{{$t('crm.Table.col_email')}}: </span>{{currAccountInfo.mailAddress}}</span>
                        </Tooltip>
                    </p>
                    <p class="crm-id" v-if="clue_short_info && clue_short_info.seqNumber"><Button type="text" class="crm-id-btn" @click="viewClue">{{clue_short_info.seqNumber}}</Button></p>
                    <p class="crm-id" v-if="inquiry_short_info && inquiry_short_info.seqNumber"><Button type="text" class="crm-id-btn" @click="viewInquiry">{{inquiry_short_info.seqNumber}}</Button></p>
                    <p class="crm-sales-name" v-if="customerInfo.saleName">{{$t('clue.sales')}}：{{customerInfo.saleName}}</p>
                    <div class="journey-detail-top-btns">
                        <Button type="text" @click="writeMail" class="piwik_journeyDetail_writeMail" :title="$t('littleDrawer.writeMail')" style="max-width: 46px;">{{$t('littleDrawer.writeMail')}}</Button>
                        <Button type="text" @click="createContent" v-if="!currAccountInfo.noHaveManageAuthority && !(currAccountInfo.groupName || currAccountInfo.departmentName)" class="piwik_journeyDetail_createContent" :title="$t('littleDrawer.createContent')">{{$t('littleDrawer.createContent')}}</Button>
                        <Button type="text" @click="createRule" class="piwik_journeyDetail_createRule" :title="$t('littleDrawer.createRule')">{{$t('littleDrawer.createRule')}}</Button>
                    </div>
                </div>
                <Poptip v-if="['undocumentedCustomers','irrelevantCustomer'].includes(customerInfo.status) && !['whatsApp','mail','mail_detail'].includes(from)"
                    popper-class="enter-btn-list-poptip"
                    trigger="hover"
                    placement="bottom-end">
                    <Icon custom="custom custom-drop-down-triangle" slot="reference"
                                color="#7B98B6"
                                size="10"></Icon>
                        <ul class="_font_size12 enter-btn-list">
                            <li @click.stop="handleStatusUpdate('undocumentedCustomers')" :class="{'act' : customerInfo.status === 'undocumentedCustomers'}">{{ $t('littleDrawer.undocumentedCustomers') }}</li>
                            <li @click.stop="handleStatusUpdate('irrelevantCustomer')" :class="{'act' : customerInfo.status === 'irrelevantCustomer'}">{{ $t('littleDrawer.irrelevantCustomer') }}</li>
                        </ul>
                </Poptip>
            </div>
            <div class="icon-list" v-if="customerInfo.status === 'undocumentedCustomers'">
                <Poptip
                    popper-class="enter-btn-list-poptip"
                    width="90"
                    :visible-arrow="false"
                    placement="bottom-end"
                    trigger="hover"
                    ref="poptip">
                    <Button slot="reference"
                        type="minor" size="small"
                        icon="custom custom-import"
                        style="padding: 0px 8px; height: 30px;"
                        >
                    </Button>
                    <ul class="_font_size12 enter-btn-list">
                        <!-- 新建线索 -->
                        <li v-if="authorized_button['enterClues']" @click.stop="enterClues()" class="piwik_journeyDetail_enterClues">{{ $t('littleDrawer.enterClues') }}</li>
                        <!-- 新建询盘 -->
                        <li v-if="authorized_button['enterInquiry']" @click.stop="enterInquiry()" class="piwik_journeyDetail_enterInquiry">{{ $t('littleDrawer.enterInquiry') }}</li>
                        <!-- 新建客户 -->
                        <!-- <li  v-if="authorized_button['enterInquiry']" @click.stop="enterInquiry()">{{ $t('littleDrawer.enterCustomer') }}</li> -->
                    </ul>
                </Poptip>
            </div>
             <div class="icon-list" v-else-if="customerInfo.status === 'clue'">
                <Tooltip :content="$t('clue.clue')">
                    <Icon custom="custom-clue" size="32"></Icon>
                </Tooltip>
            </div>
            <div class="icon-list" v-else-if="customerInfo.status === 'inquiry'">
                <Tooltip :content="$t('crm.Table.item_customer_withName')">
                    <Icon custom="custom-customer" size="32"></Icon>
                </Tooltip>
            </div>
        </div>
        <div class="hr-block"></div>
        <div class="component-wrap component-little-wrap " v-if="clueId || inquiryId || !noVisitorData">
            <Tabs v-model="current_compo">
                <TabPane v-for="item in compo_list"
                            :key="item" :name="item">
                    <div slot="label" v-if="item === 'VisitorAccessTrack'">
                        <span style="margin:0 6px;">{{$t(`littleDrawer.module_${item}`)}}</span>
                        <span class="new-visitorAccessTrack" v-if="newVisitorAccessTrack">用户有新访问</span>
                    </div>
                    <div slot="label" v-else>
                        <span>{{$t(`littleDrawer.module_${item}`)}}</span>
                    </div>
                </TabPane>
            </Tabs>
            <keep-alive v-if="!loading">
                <component :is="current_compo" style="height:calc(100% - 50px);"
                            v-if="current_compo"
                            :from="from"
                            :currentTab="current_compo"
                            :type="visitorType"
                            :originalType="originalType"
                            :singleCol="true"
                            :disabled="disabled"
                            :id="inquiryId ? inquiryId : clueId"
                            :currVisitorId="uniqueId ? uniqueId : currAccountInfo.mailAddress"
                            :inquiryId="inquiryId"
                            :clueId="clueId"
                            :customerInfo="customerInfo"
                            :currAccountInfo="currAccountInfo"
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
                            :fieldObj="fieldObj"
                            :flag_update_contact.sync="flag_update_contact"
                            :flag_update_detail.sync="flag_update_detail"
                            :flag_update_task.sync="flag_update_task"
                            :flag_new_followUp="flag_new_followUp"
                            :flag_refresh_contact="flag_refresh_contact"
                            @noData="noData"
                            @refreshContact="$emit('update:flag_refresh_contact', !flag_refresh_contact)"
                            v-on="$listeners"
                            @refreshCheck="refreshCheck">
                </component>
            </keep-alive>
        </div>
        <div class="component-wrap" v-else>
            <div class="no-data">
                <img src="@/svg/no-data.svg"
                        :alt="$t('crm.Table.customerColumnsNoData')">
                <p style="margin-top:30px;color:#000">{{ $t('crm.Table.customerColumnsNoData') }}</p>
            </div>
        </div>
        <!-- 录入线索模态框 -->
        <ClueModal
            v-model="inputClue"
            :title="$t('visitor_history.add_clue')"
            class="modal companydata"
            :delLoading="false"
            :json_data="json_data"
            :conversationId="uniqueId"
            :commentId="uniqueId"
            :saveClueClass="saveClueClass"
            :saveClueAndInquiryClass="saveClueAndInquiryClass"
            :okEnterInquiryClass="okEnterInquiryClass"
            :hide="enterpriseId + '' !== '1000' && enterpriseId + '' !== '1002'"
            :type="from"
            :from="'journeyDetail'"
            @open_close="open_close"
            @on_cancle_clue="on_cancle_clue"
            @returnLeadsId="updateStatus"
            @updateInquiryStatus="updateStatus"
            >
        </ClueModal>
        <!-- 新建客户 -->
        <NewCompany :visible.sync="newCompanyShow"
            :type="'mail'"
            :visitorId="['xhl_chat'].includes(from) ? uniqueId : ''"
            :saleList="salesList"
            :json_data="json_data"
            :mailAddress="currAccountInfo&&currAccountInfo.mailAddress?currAccountInfo.mailAddress:''"
            :WAAccount="from === 'whatsApp' ? uniqueId:''"
            okEnterInquiryClass="piwik_mail_new_company"
            @returnUpdateStatus="updateStatus"
            @updateInquiryStatus="updateStatus"></NewCompany>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { env } from '@/../build/config';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { mapState, mapActions, mapGetters } from 'vuex';
    import { getWACRMStatus } from '@/api/whatsapp';
    import { crmInquiry } from '@/api/crm/index';
    // import EditInquiry from '@/views/crm/Detail/Components/Modal/editInquiry';
    // import NewContact from '@/views/crm/Detail/Components/Modal/newContact';
    // import ShareInquiry from '@/views/crm/Detail/Components/Modal/shareInquiry';
    // import TransferInquiry from '@/views/crm/Detail/Components/Modal/transferInquiry';
    // import ThrowInquiry from '@/views/crm/Detail/Components/Modal/throwInquiry';
    // import FbMessenger from '../../main-components/messenger-Facebook/messenger-Facebook';
    // import Documents from '@/views/crm/Detail/Components/Html/relatedDocuments';
    // import Task from '@/views/crm/Detail/Components/Html/schedule';
    import visitorDynamic from './visitor-dynamic.vue';
    import inquiryDetailInfo from '@/views/crm/Detail/Components/Html/detailInfo';
    import clueDetailInfo from '@/views/clue-manage/Detail/Components/Html/detailInfo';
    import ClueModal from '@/views/main-components/enter-clue/enter-clue';
    import NewCompany from '@/views/clue-manage/Detail/Components/Modal/newCompany';
    import VisitorAccessTrack from './visitor-access-track.vue';
    import inOutGoingMail from '@/views/main-components/little-drawer/components/inOutGoingMail.vue';
    // import InquiryProduct from '@/views/crm/Detail/Components/Html/inquiryProduct.vue';

    export default {
        name: 'journeyDetail',
        components: {
            ClueModal,
            // ShareInquiry,
            // ThrowInquiry,
            NewCompany,
            // FbMessenger,
            // Documents,
            // Task,
            visitorDynamic,
            VisitorAccessTrack,
            inquiryDetailInfo,
            clueDetailInfo,
            inOutGoingMail
            // ContactList
            // InquiryProduct
        },
        props: [
            'from', // 来自哪个组件调用
            'type',
            'originalType',
            'uniqueId', // 唯一id xhl-chat传游客id, whatsApp 传联系人
            'corp_columns_authorized',
            'contact_columns_authorized',
            'inquiry_columns_authorized',
            'disabled',
            'flag_new_followUp',
            'flag_refresh_contact',
            'currAccountInfo', // 当前选中人的json数据
            'fbCommentDetail' // fb 评论详情 录入线索后跟新状态用
        ],
        computed: {
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                currentPersonId: state => state.mail.currentPersonId,
                button_list: state => state.app.button_list,
                currPersonTrackList: 'currPersonTrackList',
                salesList: state => state.crm.salesList
            }), // 从 vuex 中获取属性
            authorized_button() {
                return {
                    enterClues: !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.id, this.button_list),
                    enterInquiry: !HANDLE_BUTTON(BUTTON_IDS.CRM.inquiry.newCompany, this.button_list)
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
            /* 联系人自定义字段 */
            contact_custom_field() {
                if (this.contact_columns_authorized && this.contact_columns_authorized.custom) {
                    return this.contact_columns_authorized.custom.filter((item, i) => {
                        return item.isShow === 1;
                    });
                }
                return [];
            },
            /* 询盘自定义字段 */
            inquiry_custom_field() {
                if (this.inquiry_columns_authorized && this.inquiry_columns_authorized.custom) {
                    return this.inquiry_columns_authorized.custom.filter((item, i) => {
                        return item.isShow === 1;
                    });
                }
                return [];
            },
            authorized_short_info_items() {
                const default_cols = ['companyName', 'inquiryManagers'];
                const authorized_cols = Array.isArray(this.inquiry_columns_authorized.default) ? this.inquiry_columns_authorized.default.filter(item => !item.manually).map(item => item.storageName).concat(default_cols) : default_cols;
                return this.short_info_items.filter(item => authorized_cols.includes(item));
            },
            // 线索的来源方式
            sourceType() {
                let sourceType = '';
                switch (this.from) {
                    case 'xhl_chat':
                        this.saveClueClass = 'chat-frame-saveClue';
                        this.saveClueAndInquiryClass = '';
                        sourceType = 4;
                        break;
                    case 'visitorHistory':
                        this.saveClueClass = 'visitor-history-save-clue';
                        this.saveClueAndInquiryClass = 'visitor-history-save-clue-and-inquiry';
                        this.okEnterInquiryClass = 'visitor-history-clue-to-inquiry';
                        sourceType = 2;
                        break;
                    case 'mail':
                        this.saveClueClass = 'piwik-mail-enter-clue';
                        this.saveClueAndInquiryClass = 'piwik-mail-enter-inquiry';
                        this.okEnterInquiryClass = 'mail_inquirySubmit';
                        sourceType = 3;
                        break;
                    case 'mail_detail':
                        this.saveClueClass = 'mail_clueSubmit';
                        this.saveClueAndInquiryClass = 'mail_clueAndInquirySubmit';
                        this.okEnterInquiryClass = 'mail_inquirySubmit';
                        sourceType = 3;
                        break;
                    case 'fb_chat':
                    case 'fb_comment':
                        this.saveClueClass = 'inbox_clueSubmit';
                        this.saveClueAndInquiryClass = 'inbox_clueAndInquirySubmit';
                        this.okEnterInquiryClass = 'inbox_inquirySubmit';
                        sourceType = 6;
                        if (this.from === 'fb_comment') {
                            sourceType = 7;
                        }
                        break;
                    case 'whatsApp':
                        this.saveClueClass = 'piwik-whatsApp-enter-clue';
                        this.saveClueAndInquiryClass = 'piwik-whatsApp-enter-inquiry';
                        this.okEnterInquiryClass = 'whatsApp_inquirySubmit';
                        sourceType = 3;
                        break;
                }
                return sourceType;
            },
            // 传值给下个组件的 type
            visitorType() {
                // if (this.inquiryId) {
                //     this.compo_list.splice(2, 0, 'inquiryDetailInfo');
                //     return 'inquiry';
                // } else if (this.clueId) {
                //     this.compo_list.splice(2, 0, 'clueDetailInfo');
                //     return 'clue';
                // } else {
                return 'journeyDetail';
                // }
            }
        },
        data() {
            return {
                env,
                loading: true,
                // 录入线索所需参数
                inputClue: false,
                json_data: {},
                templateId: '',
                clue_short_info: {},
                saveClueClass: '',
                saveClueAndInquiryClass: '',
                okEnterInquiryClass: '',
                // 当前身份状态
                customerInfo: {
                    title: '',
                    status: '',
                    clueEqNumber: '',
                    inquiryIdEqnumber: '',
                    saleName: ''
                },
                // 当前访客信息
                visitorInfo: {},
                // 线索id
                clueId: '',
                // 询盘id
                inquiryId: '',
                // 动态中是否有数据
                noVisitorData: false,
                // 有新轨迹信息
                newVisitorAccessTrack: false,
                // 有新轨迹信息 倒计时
                newVisitorAccessTrackTimer: null,
                nowTime: new Date().getTime(),
                // 线索的信息，访客时间轴弹窗用
                fieldObj: null,
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
                    'inOutGoingMail',
                    'visitorDynamic'
                    // 'VisitorAccessTrack',
                    // 'Task',
                    // 'Documents'
                    // 'InquiryProduct'
                ],
                current_compo: '',

                /* 模态框部分 */
                newCompanyShow: false

            };
        },
        methods: {
            ...mapActions([
                'getVisitorReception' // 获取访客最近接待客服是否在线, 当前是否正在聊天
            ]),
            initData() {
                this.newCompanyShow = false;
                this.inputClue = false;
                this.noVisitorData = false;
                this.clueId = '';
                this.inquiryId = '';
                this.visitorInfo = {};
                this.inquiry_short_info = {};
                this.clue_short_info = {};
                this.compo_list = [
                    'inOutGoingMail',
                    'visitorDynamic'
                    // 'VisitorAccessTrack',
                ];
                if (this.from === 'xhl_chat') {
                    this.compo_list.push('VisitorAccessTrack');
                }
                this.customerInfo = {
                    title: '',
                    status: '',
                    clueEqNumber: '',
                    inquiryIdEqnumber: '',
                    saleName: ''
                };
                this.current_compo = 'inOutGoingMail';
            },
            /* 获取线索表单字段 */
            getXSShow() {
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        this.fieldObj = res.data.data.show;
                        this.templateId = res.data.data.template.id;
                    }
                });
            },
            // xhl-chat相关
            // 根据uniqueId 获取当前人信息 xhl-chat
            getInfoById() {
                this.loading = true;
                util.ajaxInternationalJson({
                    url: '/piwikRead/visitorInfo/getVisitorInfo',
                    method: 'GET',
                    params: {
                        visitorId: this.uniqueId
                    }
                }).then(res => {
                    if (res.data.code === '1' && res.data.data) {
                        this.visitorInfo = res.data.data;
                        if (this.visitorInfo.crmStatus === '2' || this.visitorInfo.crmStatus === '102') {
                            this.getInquiryIdByVisitorId();
                        } else {
                            this.customerInfo.title = this.visitorInfo.visitorName;
                            this.loading = false;
                        }
                    } else {
                        this.loading = false;
                    }
                });
            },
            // /*根据访客id获得询盘id 或 线索id*/
            getInquiryIdByVisitorId() {
                util.ajax({
                    url: '/crm/inquiry/getInquiryIdByVisitorId',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        visitorId: this.uniqueId
                    }
                }).then(ret => {
                    if (ret.data.code === '1') {
                        if (ret.data.data.type === 1) {
                            this.clueId = '';
                            this.inquiryId = ret.data.data.id[0];
                            this.get_inquiry_short_info();
                        } else if (ret.data.data.type === 2) {
                            this.inquiryId = '';
                            this.clueId = ret.data.data.id[0];
                            this.get_clue_short_info();
                        } else {
                            this.inquiryId = '';
                            this.clueId = '';
                            this.loading = false;
                        }
                    } else {
                        this.loading = false;
                        this.inquiryId = '';
                        this.clueId = '';
                    }
                });
            },
            // xhl-chat相关结束
            // 获取线索信息
            get_clue_short_info() {
                this.clue_short_info = {};
                util.ajax({
                    url: '/form-cust/form/getSimpleColumnValue',
                    method: 'post',
                    data: {
                        id: this.clueId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.clue_short_info = response.data.data;
                        this.$store.commit('set_clue_short_info', this.clue_short_info);
                        this.customerInfo.title = this.clue_short_info.a1009;
                        this.customerInfo.saleName = this.clue_short_info.saleName;
                        this.customerInfo.status = 'clue';
                    } else {
                        this.$Message.error('获取线索简略信息出错');
                    }
                    this.loading = false;
                });
            },
            // 获取询盘简略信息
            get_inquiry_short_info() {
                this.inquiry_short_info = {};
                const data = {
                    id: this.inquiryId
                };
                crmInquiry.getSimpleInquiry(data).then(response => {
                    if (response.code === '1') {
                        this.inquiry_short_info = response.data;
                        this.customerInfo.title = this.inquiry_short_info.companyName;
                        this.customerInfo.saleName = this.inquiry_short_info.userNamesShow;
                        this.customerInfo.status = 'inquiry';
                    } else {
                        this.$Message.error(this.$t('crm.newDetail.error_getInquiryBriefInfo'));
                    }
                    this.loading = false;
                });
            },
            // whatsApp Fb 邮箱相关
            // whatsApp当前选中人转换
            transferVisitorInfo(obj) {
                if (this.from === 'fb_chat' || this.from === 'fb_comment') {
                    let status = '';
                    switch (obj.clue_status) {
                        case 1:
                            status = 'undocumentedCustomers';
                            break;
                        case 2:
                            status = 'irrelevantCustomer';
                            break;
                        case 101:
                            this.clueId = obj.clue_id;
                            this.get_clue_short_info();
                            this.customerInfo.clueEqNumber = obj.clue_id;
                            status = 'clue';
                            break;
                        case 102:
                            this.get_cor_inquiry(obj.clue_id);
                            status = 'inquiry';
                            break;
                        default:
                            status = 'undocumentedCustomers';
                    }
                    this.customerInfo.status = status;
                    if (obj.clue_status !== 102 && obj.clue_status !== 101) {
                        this.customerInfo.title = obj.conversationName ? obj.conversationName : obj.commentator_name;
                    }
                } else if (['mail', 'mail_detail'].includes(this.from)) {
                    let status = '';
                    const mailCrmFlag = obj.mailCrmFlag || obj.recieverCrmFlag;
                    switch (mailCrmFlag) {
                        case 0:
                            status = 'undocumentedCustomers';
                            break;
                        case 1:
                        case 2:
                        case 3:
                            status = 'inquiry';
                            break;
                        case 4:
                        case 5:
                        case 6:
                            status = 'clue';
                            break;
                        case 7:
                            status = 'colleague';
                            break;
                        case 8:
                            status = 'addressBook';
                            break;
                        default:
                            status = 'undocumentedCustomers';
                            break;
                    }
                    this.customerInfo.status = status;
                    this.getEmailNickName(obj);
                } else if (this.from === 'whatsApp') {
                    let status = '';
                    switch (obj.leadscloudStatus) {
                        case 0:
                            status = 'undocumentedCustomers';
                            break;
                        case 1:
                            this.getCRMStatus();
                            status = 'inquiry';
                            break;
                        case 2:
                            this.getCRMStatus();
                            status = 'clue';
                            break;
                        default:
                            status = 'undocumentedCustomers';
                    }
                    this.customerInfo.status = status;
                    this.customerInfo.title = obj.chatWaName ? obj.chatWaName : obj.contactWaName ? obj.contactWaName : this.uniqueId;
                }
                this.loading = false;
            },

            // 获取当前 WA 账号关联的 CRM 数据
            async getCRMStatus() {
                if (this.uniqueId) {
                    const result = await getWACRMStatus({
                        orgId: this.enterpriseId,
                        targetIds: [this.uniqueId],
                        targetType: 10
                    });

                    if (result.code === '1' && result.data && result.data[this.uniqueId]) {
                        this.visitorInfo = result.data[this.uniqueId];
                        if (result.data[this.uniqueId].inquiryId) {
                            this.inquiryId = result.data[this.uniqueId].inquiryId;
                            this.clueId = '';
                            this.get_inquiry_short_info();
                        } else if (result.data[this.uniqueId].clueId) {
                            this.clueId = result.data[this.uniqueId].clueId;
                            this.inquiryId = '';
                            this.get_clue_short_info();
                        } else {
                            this.inquiryId = '';
                            this.clueId = '';
                        }
                    } else {
                        this.inquiryId = '';
                        this.clueId = '';
                        // 获取数据失败
                        this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    }
                } else {
                    // 参数错误
                    this.$Message.error(this.$t('crm.InqSet.error_params'));
                }
            },

            // 跳转详情相关
            // 查看线索
            async viewClue() {
                // 校验是否有线索目录权限
                if (!this.isContainsMenu('my_clue')) {
                    this.$Message.warning(this.$t('crm.newDetail.error_noMenuAuthority'));
                    return;
                }

                // 校验是否有该条线索管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Clue',
                    id: this.clueId
                });
                if (!authorized) return;
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpClueInHighseas'));
                    return;
                }

                // 校验通过, 新标签页打开线索详情
                localStorage.setItem('leadsCloud-clueId', this.clueId);
                window.open(this.$router.resolve({
                    name: 'my_clue'
                }).href, '_blank');
            },
            // 查看询盘
            // 弹出询盘详情
            async viewInquiry() {
                // 无 inquiryId , 退出流程
                if (!this.inquiryId) {
                    this.$Message.error(this.$t('crm.Modal.error_inquiryId'));
                    return;
                }

                // 判断是否有"我的询盘"页面权限
                if (!this.isContainsMenu('myInquiry')) {
                    // 没有"我的询盘"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyInquiry'));
                    return;
                }

                // 查询该询盘 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Inquiry',
                    id: this.inquiryId
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 如果是公海询盘
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpInquiryInHighseas'));
                    return;

                    // if (this.isContainsMenu('highseasCustomer')) {
                    //     // 如果有公海目录权限
                    //     this.$viewHighSeasCustomer(this.id);
                    // } else {
                    //     // 没有"公海客户"页面权限, 弹出提示
                    //     this.$Message.warning(this.$t('globalSearch.haveNoPermissionHighseasCustomer'));
                    // }
                    // return;
                }

                // 新窗口打开询盘详情页
                localStorage.setItem('leadsCloud-inquiryId', this.inquiryId);
                window.open(this.$router.resolve({
                    name: 'myInquiry'
                }).href, '_blank');
            },
            refreshCheck() {
                this.$emit('refreshCheck', { inquiryId: this.inquiryId });
            },
            // 未建档客户 、无关客户切换
            // 更新状态
            handleStatusUpdate(status) {
                if (this.customerInfo.crmStatus === `${status}`) return;
                const label = this.$t(`littleDrawer.${status}`);
                // switch(status){
                //     case 1:
                //         label = this.$t('littleDrawer.undocumentedCustomers');
                //         break;
                //     case 3:
                //         label = this.$t('littleDrawer.irrelevantCustomer');
                //         break;
                // }
                this.$confirm(
                    // `${this.$t('visitor_history.confirm_to')}${statusObj.label}`,
                    `${this.$t('visitor_history.confirm_to')}访客状态${this.$t('visitor_history.set')}【${label}】?`,
                    this.$t('visitor_history.confirm_change'),
                    {
                        showClose: true,
                        closeOnClickModal: false,
                        closeOnPressEscape: false
                    }
                ).then(() => {
                    this.changeStatus(status);
                });
            },
            // 修改状态
            async changeStatus(val) {
                // 判断当前 visitorId 是否可以或正在被当前客服接待, 是则可以各种操作访客数据或发消息
                if (this.from === 'xhl_chat') {
                    const ret = await this.getVisitorReception(this.uniqueId);
                    const visitorStatus = val === 'undocumentedCustomers' ? 1 : 3;
                    if (ret) {
                        util.ajaxInternationalJson({
                            url: '/piwik/visitorInfo/updateVisitorStatus',
                            method: 'POST',
                            data: {
                                visitorId: this.uniqueId,
                                orgId: this.enterpriseId,
                                originalVisitorStatus: this.visitorInfo.crmStatus,
                                visitorStatus: visitorStatus,
                                updateUserId: this.userId
                            }
                        }).then(res => {
                            if (res.data.code === '1') {
                                this.$set(this.visitorInfo, 'crmStatus', `${visitorStatus}`);
                                // this.$emit('updateVisitorInfo', Object.assign(this.visitorInfo, {
                                //     crmStatus: visitorStatus
                                // }));
                                // this.$Message.success(this.$t('editSuccess'));
                                switch (`${visitorStatus}`) {
                                    case '1':
                                        this.$Message.success(`访客状态${this.$t('visitor_history.reset_success')}`);
                                        break;
                                    case '2':
                                        break;
                                    case '3':
                                        this.$Message.success(`访客状态${this.$t('visitor_history.trash_success')}`);
                                        break;
                                }
                            } else {
                                res.data.message && this.$Message.error(res.data.message);
                            }
                        });
                    }
                } else if (this.from === 'fb_chat') {
                    const status = val === 'undocumentedCustomers' ? 1 : 2;
                    util.ajaxInternational({
                        url: '/social/updateConversationStatusByConversationId',
                        method: 'post',
                        data: {
                            conversationId: this.uniqueId,
                            status: status
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.$emit('updateStatus', '', status);
                            // this.$Message.success(this.$t('facebook.editSuccess'));
                            switch (status) {
                                case 1:
                                    this.customerInfo.status = 'undocumentedCustomers';
                                    this.$Message.success(`facebook私信${this.$t('visitor_history.reset_success')}`);
                                    break;
                                case 2:
                                    this.customerInfo.status = 'irrelevantCustomer';
                                    this.$Message.success(`facebook私信${this.$t('visitor_history.trash_success')}`);
                                    break;
                            }
                        } else {
                            this.$Message.error(response.data.message);
                        }
                    });
                } else if (this.from === 'fb_comment') {
                    const status = val === 'undocumentedCustomers' ? 1 : 2;
                    util.ajaxInternational({
                        url: '/social/updateCommentStatusById',
                        method: 'get',
                        params: {
                            id: this.currAccountInfo.id,
                            status: status
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.$emit('updateStatus', '', status);
                            // this.$Message.success(this.$t('facebook.editSuccess'));
                            switch (status) {
                                case 1:
                                    this.customerInfo.status = 'undocumentedCustomers';
                                    this.$Message.success(`facebook评论${this.$t('visitor_history.reset_success')}`);
                                    break;
                                case 2:
                                    this.customerInfo.status = 'irrelevantCustomer';
                                    this.$Message.success(`facebook评论${this.$t('visitor_history.trash_success')}`);
                                    break;
                            }
                        } else {
                            this.$Message.error(response.data.message);
                        }
                    });
                }
            },
            // 未建档客户切换成无关客户结束
            // 录入线索相关代码开始
            // 录入线索按钮
            async enterClues() {
                if (this.from === 'visitorHistory') {
                    this.json_data = Object.assign({}, this.row, {
                        proj: this.row.visitorId,
                        sourceUrl: this.row.firstVisitorAddress,
                        templateId: this.templateId,
                        enterpriseId: this.enterpriseId,
                        userId: this.userId,
                        userName: this.userName,
                        serviceName: this.row.receptionServer,
                        serviceId: this.row.receptionServerAccid,
                        source: MY_CHAT
                    });
                } else if (this.from === 'xhl_chat') {
                    const ret = await this.getVisitorReception(this.uniqueId);
                    if (ret) {
                        this.json_data = Object.assign({},{
                            proj: this.uniqueId, /* 当前访客id */
                            enterpriseId: this.enterpriseId,
                            userId: this.userId,
                            userName: this.userName,
                            source: this.sourceType,
                            serviceName: this.visitorInfo.receptionServer,
                            serviceId: this.visitorInfo.receptionServerAccid
                        });
                        // 获得最新访问id
                        util.ajaxInternationalJson({
                            url: '/piwikRead/visitorHistory/getVisitorTimeAxis',
                            method: 'GET',
                            params: {
                                visitorId: this.uniqueId
                            }
                        }).then(response => {
                            if (response.data.code === '1' && response.data.data) {
                                this.json_data.idvisit = response.data.data[0].eventId.split('_')[1];
                            }
                        });
                    } else {
                        return;
                    }
                } else if (this.from === 'fb_chat') {
                    this.json_data = Object.assign({}, {
                        templateId: this.templateId,
                        source: this.sourceType,
                        enterpriseId: this.enterpriseId,
                        userId: this.userId,
                        userName: this.userName,
                        visitorId: `FSX${this.uniqueId}`,
                        id: this.uniqueId
                    });
                } else if (this.from === 'fb_comment') {
                    this.json_data = Object.assign({}, {
                        templateId: this.templateId,
                        source: this.sourceType,
                        enterpriseId: this.enterpriseId,
                        userId: this.userId,
                        userName: this.userName,
                        visitorId: `FPL${this.currAccountInfo.commentorAndPostId}`,
                        id: this.currAccountInfo.id
                    });
                } else if (this.from === 'mail' || this.from === 'mail_detail') {
                    this.json_data = Object.assign({}, {
                        templateId: this.templateId,
                        source: this.sourceType,
                        enterpriseId: this.enterpriseId,
                        userId: this.userId,
                        userName: this.userName,
                        a10010: this.currAccountInfo.mailAddress,
                        a1009: this.customerInfo.title,
                        id: this.uniqueId
                    });
                } else if (this.from === 'whatsApp') {
                    this.json_data = Object.assign({}, {
                        templateId: this.templateId,
                        source: this.sourceType,
                        enterpriseId: this.enterpriseId,
                        userId: this.userId,
                        userName: this.userName,
                        a10052: this.uniqueId,
                        id: this.uniqueId
                    });
                }
                this.inputClue = true;
            },
            // 关掉录入线索模态框
            open_close(data) {
                this.inputClue = data.close;
            },
            // 取消录入线索
            on_cancle_clue(data) {
                this.inputClue = data.close;
            },
            // 录入线索后操作
            updateStatus(clueId, status) {
                this.compo_list = [
                    'inOutGoingMail',
                    'visitorDynamic'
                ];
                if (this.from === 'xhl_chat') {
                    this.compo_list.push('VisitorAccessTrack');
                    this.visitorInfo.crmStatus = `${status}`;
                    this.$store.commit('updateVisitorInfo', this.visitorInfo);
                    this.getInquiryIdByVisitorId();
                } else if (this.from === 'whatsApp') {
                    switch(status) {
                        case 1:
                            this.clue_short_info = {};
                            this.customerInfo.status = 'inquiry';
                            this.$emit('updateStatus', this.uniqueId, status);
                            this.getCRMStatus();
                            break;
                        case 2:
                            this.$emit('updateWAAccountCrmStatus', this.uniqueId, status);
                            this.customerInfo.status = 'clue';
                            this.getCRMStatus();
                            break;
                    }
                } else if (this.from === 'fb_chat') {
                    switch(status) {
                        case 101:
                            this.customerInfo.status = 'clue';
                            this.updateConversationClueStatus(clueId, status);
                            break;
                        case 102:
                            this.clue_short_info = {};
                            this.customerInfo.status = 'inquiry';
                            this.editInquiryStatus(clueId, status);
                            break;
                    }
                } else if (this.from === 'fb_comment') {
                    switch(status) {
                        case 101:
                            this.customerInfo.status = 'clue';
                            this.updateCommentClueStatus(clueId, status);
                            break;
                        case 102:
                            this.clue_short_info = {};
                            this.customerInfo.status = 'inquiry';
                            this.updateCommentStatusByClueId(clueId, status);
                            break;
                    }
                } else if (this.from === 'mail' || this.from === 'mail_detail') {
                    console.log(clueId + '   ' + status);
                    switch(status) {
                        case 4:
                        case 5:
                        case 6:
                            // this.customerInfo.status = 'clue';
                            this.$emit('updateStatus', clueId, status);
                            // this.getEmailStatus(clueId, status);
                            break;
                        case 1:
                        case 2:
                        case 3:
                            // this.clue_short_info = {};
                            // this.clueId = '';
                            // this.customerInfo.status = 'inquiry';
                            // this.getEmailStatus(clueId, status);
                            this.$emit('updateStatus', clueId, status);
                            break;
                    }
                }
                // 从网站留言跳转过来时, 调用接口更改状态
                // 看代码发现, type 为访客历史时也有调用接口, 但是是在 enter-clue.vue 的 returnUpdateStatus 中调用的
                // if (this.type === 'webMsg') {
                //     this.status = status;
                //     const id = this.row.id;
                //     util.ajax({
                //         url: '/form-cust/form/updateColumnValueStatus',
                //         method: 'post',
                //         data: {
                //             id,
                //             status: status
                //         }
                //     }).then(res => {
                //         if (res.data.code !== '1') {
                //             this.$Message.error(res.data.message);
                //         }
                //     });
                // }
                // // 刷新表格页
                // if (this.type === 'webMsg') {
                //     const id = this.row.id;
                //     // 更新"updatedId" , 触发网站留言表格页刷新
                //     this.$store.commit('website_msg/setUpdatedId', null);
                //     this.$nextTick(() => {
                //         this.$store.commit('website_msg/setUpdatedId', id);
                //     });
                // }
                // if (this.type === 'visitorHistory') {
                //     // 更新"updatedId" , 触发访客历史表格页刷新
                //     this.$store.commit('visitor_history/setUpdatedId', null);
                //     this.$nextTick(() => {
                //         this.$store.commit('visitor_history/setUpdatedId', this.row.visitorId);
                //     });
                // }
                // // 改变表格页数据
                // this.$emit('changeRowData', {
                //     row: this.row,
                //     key: 'crmStatus',
                //     value: status,
                //     // index: this.index,
                //     clueId: clueId
                // });
                // this.openCrm();
                // this.status = status;
            },
            // 录入线索相关代码结束
            // fb相关 开始
            // Fb根据clueid 查找inquiryId
            get_cor_inquiry(clueId) {
                util.ajaxJson({
                    url: '/crm/inquiry/getInquirySeqList',
                    method: 'post',
                    data: {
                        clueIdList: [clueId]
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        if (res.data.data[clueId]) {
                            this.inquiryId = res.data.data[clueId].inquiryId;
                            this.get_inquiry_short_info();
                        }
                    }
                });
            },
            // Fb私信 录入线索成功后改变录线索状态
            updateConversationClueStatus(clueId, status) {
                /* 若传入实参有值，且status为1，说明是要将已录入但没有clueId的会话状态更改为未录入
                * 否则为正常的录入线索成功后更改录线索状态的操作
                * */
                util.ajaxInternational({
                    url: '/social/updateConversationClueStatusByConversationId',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        conversationId: this.uniqueId,
                        conversationName: this.currAccountInfo.conversationName,
                        pageName: this.currAccountInfo.pageName,
                        status: status,
                        clueId: clueId,
                        conversationAvatar: this.currAccountInfo.conversationAvatar,
                        pageAvatar: this.currAccountInfo.nodealPageAvatar
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.clueId = clueId;
                        this.get_clue_short_info();
                        this.customerInfo.clueEqNumber = clueId;
                        this.$emit('updateStatus', clueId, status);
                    }
                });
            },
            // Fb私信 录入询盘成功后改变询盘状态
            editInquiryStatus(clueId, status) {
                util.ajaxInternational({
                    url: '/social/updateConversationStatusByClueId',
                    method: 'get',
                    params: {
                        clueId: clueId,
                        status: status
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.get_cor_inquiry(clueId);
                        this.$emit('updateStatus', clueId, status);
                    }
                });
            },
            // fb评论 录入线索成功后改变录线索状态
            updateCommentClueStatus(clueId, status) {
                util.ajaxInternational({
                    url: '/social/updateCommentClueStatusById',
                    method: 'get',
                    params: {
                        id: this.currAccountInfo.id,
                        orgId: this.enterpriseId,
                        commentatorName: this.currAccountInfo.commentator_name,
                        postCreaterName: this.fbCommentDetail.from.name,
                        postContent: this.fbCommentDetail.message,
                        postTime: this.$options.filters.timeFormat(this.fbCommentDetail.created_time, 'DateTime'),
                        status: status,
                        clueId: clueId,
                        pageId: this.currAccountInfo.page_id,
                        userId: this.userId,
                        postId: this.currAccountInfo.post_id,
                        commentId: this.currAccountInfo.comment_id
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$emit('updateStatus', clueId, status);
                    }
                });
            },
            // fb评论 录入询盘成功后改变询盘状态
            updateCommentStatusByClueId(clueId, status) {
                util.ajaxInternational({
                    url: '/social/updateCommentStatusByClueId',
                    method: 'get',
                    params: {
                        clueId: clueId,
                        status: status
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.get_cor_inquiry(clueId);
                        this.$emit('updateStatus', clueId, status);
                    }
                });
            },
            // fb私信相关 结束

            // 邮箱相关
            getEmailStatus(clueId, status) {
                this.loading = true;
                const email = this.currAccountInfo.mailAddress;
                const postData = {
                    /* email:this.email, */
                    emailList: [email],
                    userId: this.currentPersonId ? this.currentPersonId : this.userId,
                    orgId: this.enterpriseId

                };
                util.ajaxJson({
                    url: '/crm/mailbox/getInquiryAndCompanyInfoByEmails',
                    method: 'post',
                    data: postData
                }).then(res => {
                    if (res.data.code === '1') {
                        if (res.data.data[email].success) {
                            const data = res.data.data[email];
                            this.$emit('updateStatus', clueId, status);
                            // util.ajaxMail({
                            //     url: '/mail/mailBoxs/updateCrmFlagNew',
                            //     method: 'post',
                            //     timeout: 360000,
                            //     data: {
                            //         address: email,
                            //         createUserId: this.currentPersonId,
                            //         orgId: this.enterpriseId
                            //     }
                            // }).then((res) => {
                            //     if (data.inquiryId) {
                            //         this.inquiryId = data.inquiryId;
                            //         this.get_inquiry_short_info();
                            //     } else if (data.id) {
                            //         this.clueId = data.id;
                            //         this.get_clue_short_info();
                            //     }
                            //     this.loading = false;
                            // });
                        }
                    }
                });
            },
            // 通过邮箱地址 获取邮箱nickName
            getEmailNickName(obj) {
                util.ajaxJson({
                    url: '/mail/queryEmailAddress',
                    method: 'POST',
                    data: {
                        createUserId: this.userId,
                        emailAddress: obj.mailAddress,
                        orgId: this.enterpriseId
                    }
                }).then(res => {
                    if (res.data.code === 1 && res.data.data.length) {
                        const result = res.data.data;
                        if (this.customerInfo.status === 'colleague' || this.customerInfo.status === 'addressBook') {
                            this.customerInfo.title = obj.combineName ? obj.combineName : obj.contactsName ? obj.contactsName : obj.mailAddress ? obj.mailAddress.substring(0, obj.mailAddress.indexOf('@')) : obj.mailAddress;
                        } else {
                            this.customerInfo.title = result[0].nickName ? result[0].nickName : obj.contactsName ? obj.contactsName : obj.mailAddress ? obj.mailAddress.substring(0, obj.mailAddress.indexOf('@')) : obj.mailAddress;
                        }
                    } else {
                        if (this.customerInfo.status === 'colleague' || this.customerInfo.status === 'addressBook') {
                            this.customerInfo.title = obj.combineName ? obj.combineName : obj.mailAddress ? obj.mailAddress.substring(0, obj.mailAddress.indexOf('@')) : obj.mailAddress;
                        } else {
                            this.customerInfo.title = obj.contactsName ? obj.contactsName : obj.mailAddress ? obj.mailAddress.substring(0, obj.mailAddress.indexOf('@')) : obj.mailAddress;
                        }
                    }
                }).catch(err => {
                    console.log('邮件联想地址获取失败', err);
                });
            },
            // 录入询盘按钮
            async enterInquiry() {
                this.json_data = {
                    nickName: this.customerInfo.title
                };
                if (this.from === 'xhl_chat') {
                    const ret = await this.getVisitorReception(this.uniqueId);
                    if (!ret) return;
                }
                this.newCompanyShow = true;
            },
            noData(type) {
                // this.compo_list = ['inOutGoingMail'];
                // this.noVisitorData = true;
                // if (type === 'visitor-timeLine') {
                //     this.visitorTimeLineNoData = true;
                // } else if (type === 'visitor-access-track') {
                //     this.visitorAccessTrackNoData = true;
                // }
            },
            //
            refreshData() {

            },
            writeMail() {
                const params = {
                    clickType: 'writeMail',
                    newMailInfo: {
                        mailAddress: this.currAccountInfo.mailAddress,
                        nickName: this.customerInfo.title
                    }
                };
                this.$emit('handleClick', params);
            },
            createContent() {
                const params = {
                    clickType: 'createContent',
                    newMailInfo: {
                        mailAddress: this.currAccountInfo.mailAddress,
                        nickName: this.customerInfo.title
                    }
                };
                this.$emit('handleClick', params);
            },
            createRule() {
                const params = {
                    clickType: 'createRule',
                    newMailInfo: {
                        mailAddress: this.currAccountInfo.mailAddress,
                        nickName: this.customerInfo.title
                    }
                };
                this.$emit('handleClick', params);
            }
        },
        created() {
            // 获取全部销售人员
            this.$store.dispatch('getSalesList');
            this.getXSShow();
        },
        mounted() {
            // this.getSenderId();
            // this.loading = false
        },
        activated() {
            this.initData();
        },
        watch: {
            uniqueId: {
                handler(val) {
                    this.initData();
                    if (val) {
                        if (this.from === 'xhl_chat') {
                            this.getInfoById();
                        }
                    }
                },
                immediate: true
            },
            currAccountInfo: {
                handler(val) {
                    this.initData();
                    if (val) {
                        this.loading = true;
                        this.transferVisitorInfo(val);
                    }
                },
                deep: true,
                immediate: true
            },
            'visitorInfo.crmStatus': {
                handler(val) {
                    switch (`${val}`) {
                        case '1':
                            this.customerInfo.status = 'undocumentedCustomers';
                            break;
                        case '2':
                            this.customerInfo.status = 'clue';
                            break;
                        case '3':
                            this.customerInfo.status = 'irrelevantCustomer';
                            break;
                        case '102':
                            this.customerInfo.status = 'inquiry';
                            break;
                        default:
                            this.customerInfo.status = 'undocumentedCustomers';
                            break;
                    }
                }
            },
            current_compo: {
                handler(val) {
                    if (val === 'VisitorAccessTrack') {
                        this.newVisitorAccessTrack = false;
                    }
                }
            },
            currPersonTrackList: {
                handler(val) {
                    if (val) {
                        let content = val.content ? JSON.parse(val.content) : null;
                        if (content && content.xUserInfo && content.xUserInfo.baseinfo && content.xUserInfo.baseinfo.visitorId) {
                            if (content.xUserInfo.baseinfo.visitorId === this.uniqueId && content.xUserInfo.track[0].time) {
                                let visitorTime = new Date(content.xUserInfo.track[0].time).getTime();
                                if (this.nowTime < visitorTime) {
                                    if (this.newVisitorAccessTrackTimer) {
                                        clearTimeout(this.newVisitorAccessTrackTimer);
                                    }
                                    this.newVisitorAccessTrack = true;
                                    this.newVisitorAccessTrackTimer = setTimeout(() => {
                                        this.newVisitorAccessTrack = false;
                                    }, 10000);
                                }
                            }
                        }
                    }
                },
                immediate: true,
                deep: true
            },
            flag_update_detail() {
                // this.get_inquiry_short_info();
                // this.refreshCheck();
            }
        }
    };
</script>
<style lang="less">
.journey-detail {
    padding-top: 34px;
    height: 100%;
    overflow: hidden;
    .journey-detail-top {
        display: flex;
        justify-content: space-between;
        padding:0 30px 16px 20px;
        .journey-detail-top-icon {
            width: calc(100% - 30px);
            display: flex;
            justify-content: start;
            align-items: flex-start;
            i {
                font-size: 36px;
                float: left;
                margin-right: 10px;
            }
            .journey-detail-top-btns {
                margin-top: 10px;
                .el-button{
                    color: #3B78DE;
                    max-width: 86px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
        }
        .icon-list {
            margin-top: 6px;
        }
        .com_name_short {
            font-family: PingFangSC-Semibold;
            color: rgba(0,0,0,.8);
            font-size: 18px;
            margin-right: 15px;
            line-height: 26px;
            font-weight: 500;
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        .crm-id {
            .crm-id-btn {
                font-size: 14px;
                line-height: 22px;
                color: #3B78DE;
            }
        }
        .crm-sales-name {
            line-height: 18px;
            font-size: 12px;
            color: rgba(0,0,0,0.80);
        }
    }
    .component-wrap{
        height: calc(100vh - 220px);
        padding: 0 20px;
        overflow-y: hidden;
        .no-data{
            display: flex;
            width: 100%;
            height: 100%;
            flex-direction: column;
            justify-content: center;
            text-align: center;
        }
    }
}
.mailSinglePage {
    .journey-detail .component-wrap {
        height: calc(100vh - 160px);
    }
}
.new-visitorAccessTrack{
    position: relative;
    padding: 3px 8px;
    line-height: 18px;
    font-size: 12px;
    color: #fff;
    background: #EA4335;
    border-radius: 4px;
}
.new-visitorAccessTrack::before{
     content: '';
        width: 0;
        height: 0;
        position: absolute;
        top: 5px;
        left: -11px;
        border: solid 6px;
        border-color: transparent #EA4335 transparent transparent;
        font-size: 0;
}
</style>
