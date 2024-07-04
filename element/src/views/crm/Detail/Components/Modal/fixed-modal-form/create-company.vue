<template>
    <div>
        <Modal v-if="visible"
               :visible="visible"
               :show-close="true"
               :modal="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :append-to-body="true"
               :lock-scroll="false"
               width="778px"
               ref="currentModal"
               v-dialog-drag
               @close="cancel"
               @scroll.native.capture="close_popper"
               class="_dialog_maxContent modal draggable-dialog"
        >
            <!-- class="modal draggable-dialog"> -->
            <!-- loading -->
            <Spin fix v-if="loading"></Spin>
            <div slot="title">
                <span style="margin-right: 5px;font-size: 18px;color: #303133;font-weight: 700;">{{$t('crm.Modal.title_newCompany')}}</span>
                <HelpTip :title="$t('helpTip.newCompany')"></HelpTip>
            </div>
             <!-- 指定负责人 -->
             <div class="appoint-sale">
                {{$t('clue.select_sales')}}
                <Select
                        v-model="saleId"
                        filterable
                        :placeholder="$t('crm.Modal.tip_select')"
                        style="width:230px;margin-left: 20px"
                >
                    <Option
                            v-for="item in computed_salesList"
                            :value="item.id"
                            :key="item.id"
                            :label="item.fullname"
                    ></Option>
                </Select>
            </div>
            <Form
                    ref="createCompany"
                    :inline="true"
                    :validate-on-rule-change="false"
                    class="_form-custom"
                    label-position="right"
                    label-width="115px"
            >
                <!-- 联系人 -->
                <h1 class="title">{{ $t('crm.Modal.title_contact') }}</h1>
                <div class="wrap">
                    <!-- 通用输入区域 -->
                    <CrmInputArea
                            :data.sync="contact"
                            :items="contact_item_all"
                            :selectOptions="computed_selectOptions"
                            :pictures.sync="contactPictures"
                            :merged.sync="contactMerged"
                            :computed_mailAddress="computed_mailAddress"
                            :computed_WAAccount="computed_WAAccount"
                            @uniqMail="uniqMailAndSuffix"
                            @uniqSocialPlatforms="uniqSocialPlatforms"
                            @uniqPhoneNumber="uniqContact({ field: 'phone', value: $event })"
                            @uniqContact="uniqContact"></CrmInputArea>
                    <!-- 主联系人 -->
                    <div class="modalItem">
                        <p style="visibility: hidden;">_</p>
                        <div>
                            <Radio :value="true" :label="true">{{ $t('crm.Modal.mainContact') }}</Radio>
                        </div>
                    </div>
                </div>

                <!-- 询盘 -->
                <h1 class="title">{{ $t('crm.Modal.title_inquiry') }}</h1>
                <div class="wrap">
                    <!-- 通用输入区域 -->
                    <CrmInputArea
                            :data.sync="inquiry"
                            :items="computed_inquiry_item_all"
                            :selectOptions="computed_selectOptions"
                            :transactionTime.sync="transactionTime"
                            :transactionMoney.sync="transactionMoney"
                            :transactionInfo.sync="transactionInfo"
                            :transactionMoneyCurrency.sync="transactionMoneyCurrency"
                            :estimatedInquiryAmount.sync="estimatedInquiryAmount"
                            :estimatedInquiryAmountCurrency.sync="estimatedInquiryAmountCurrency"
                    ></CrmInputArea>
                    <!-- 主询盘 -->
                    <div class="modalItem">
                        <p style="visibility: hidden;">_</p>
                        <div>
                            <Radio :value="true" :label="true">{{ $t('crm.Modal.mainInquiry') }}</Radio>
                        </div>
                    </div>
                    <!-- 上传文档 -->
                    <template v-if="authorized_button['uploadDocument']">
                        <UploadDocument :documents.sync="list_documents"></UploadDocument>
                    </template>
                </div>

                <!-- 公司 -->
                <h1 class="title">{{ $t('crm.Modal.title_company') }}</h1>
                <div class="wrap">
                    <!-- 通用输入区域 -->
                    <CrmInputArea
                            :data.sync="company"
                            :items="corp_item_all"
                            :selectOptions="computed_selectOptions"
                            :pictures.sync="companyPictures"
                            :merged.sync="companyMerged"
                            :contactAddressLatLng.sync="contactAddressLatLng"
                            :error_countryArea.sync="error_countryArea"
                            @uniqCompany="uniqCompany"
                    ></CrmInputArea>
                </div>
            </Form>

            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button
                        v-if="is_all_field_requested"
                        :disabled="loading"
                        type="primary"
                        @click="ok"
                        :class="`piwik_${type}_new_company`"
                >{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>

        <UniqCompany
                :visible.sync="uniqCompanyVisible"
                :companyName.sync="company.companyName"
                :merged.sync="companyMerged"
                :mergedId.sync="newCompanyId"
        ></UniqCompany>

        <!-- 社交平台查重 -->
        <UniqSocialPlatforms
                    :uniqSocialPlatformVal="uniqSocialPlatformVal"
                    :uniqSocialPlatformName="uniqSocialPlatformName"
                    :visible.sync="uniqSocialPlatformsVisible"></UniqSocialPlatforms>

        <!-- 邮箱 / 电话 / WhatsApp / Instagram 字段查重弹窗 -->
        <UniqContact :visible.sync="uniqContactVisible"
                     :uniqField="uniqContactField"
                     :uniqVal="uniqContactVal"></UniqContact>

        <!-- 邮箱后缀查重弹窗 -->
        <UniqEmailSuffix :visible.sync="uniqEmailSuffixVisible"
                        :email="uniqEmailSuffixVal"></UniqEmailSuffix>
        <!-- 顶部导航，添加选择询盘 -->
        <selectCompany
                    v-if="select_company_modal"
                    :visible.sync="select_company_modal"
                    @handleCompany="handleCompany"
                    ></selectCompany>
    </div>
</template>

<script>
    import Utils from '@/utils/index';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { mapState, mapGetters } from 'vuex';
    import UniqCompany from '@/views/crm/Detail/Components/Modal/uniqCompany';
    import UniqContact from '@/views/crm/Detail/Components/Modal/uniqContact';
    import UniqEmailSuffix from '@/views/crm/Detail/Components/Modal/uniqEmailSuffix';
    import CrmInputArea from '@/views/crm/Detail/Components/Modal/fixed-modal-form/crm-input-area';
    import UploadDocument from '@/views/crm/Detail/Components/Html/uploadDocument';
    import UniqSocialPlatforms from '@/views/crm/Detail/Components/Modal/uniqSocialPlatforms';
    import selectCompany from '@/views/crm/Table/Components/Modal/followUpRecord/selectCompany';
    import { GET_EMAIL_SUFFIX } from '@/api/mail';
    import { crmCommon, crmContacts, crmCompany, crmClue } from '@/api/crm/index';
    import { triggerGtag } from '@/utils/base';

    export default {
        name: 'newCompany',
        components: {
            CrmInputArea,
            UniqCompany,
            UniqContact,
            UniqEmailSuffix,
            UploadDocument,
            UniqSocialPlatforms,
            selectCompany
        },
        props: ['type', 'visible', 'mailAddress', 'WAAccount', 'userBindWaAccount', 'WANickName'],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                showUniq: state => state.crm.showUniq,
                allowMerge: state => state.crm.allowMerge,
                uniqTypeCompanyName: state => state.crm.uniqTypeCompanyName,
                button_list: state => state.app.button_list,
                salesList: state => state.crm.salesList,
                selectOptions: state => state.crm.selectOptions
            }), // 从 vuex 中获取属性
            ...mapGetters([
                // 字段长度校验
                'check_length_default',
                'check_length_custom',
                'contact_items',
                'inquiry_items',
                'corp_items'
            ]),
            authorized_button() {
                const ids = BUTTON_IDS.CRM.inquiry;
                return {
                    uploadDocument: !HANDLE_BUTTON(ids.documentEdit.uploadDocument, this.button_list)
                };
            },

            computed_selectOptions() {
                const result = {};
                Object.entries(this.$deepClone(this.selectOptions)).forEach(([key, value]) => {
                    result[key] = value.filter(item => item.isAvailable === 1);
                });
                result.companySourceWay = result.sourceWay;
                return result;
            }, // 获取使用中(未停用)的通用设置下拉选项
            computed_salesList() {
                let result = [];
                if (Array.isArray(this.salesList)) {
                    result = this.salesList;
                }
                return result;
            },

            corp_item_default() {
                const temp = Array.isArray(this.corp_columns_authorized.default)
                    ? this.corp_columns_authorized.default.slice()
                    : undefined;
                if (temp && temp.every(item => item.storageName !== 'companyName')) {
                    temp.unshift({
                        cname: this.$t('crm.Modal.corp_companyName'),
                        colType: 'text',
                        mustInput: 1,
                        storageName: 'companyName'
                    });
                }
                return temp;
            },
            corp_item_custom() {
                return this.corp_columns_authorized.custom;
            },
            corp_item_all() {
                return this.corp_items(this.corp_columns_authorized);
            },
            contact_item_custom() {
                return this.contact_columns_authorized.custom;
            },
            contact_item_all() {
                return this.contact_items(this.contact_columns_authorized);
            },
            inquiry_item_custom() {
                return this.inquiry_columns_authorized.custom;
            },
            inquiry_item_all() {
                return this.inquiry_items(this.inquiry_columns_authorized);
            },
            computed_inquiry_item_all() {
                const result = this.$deepClone(this.inquiry_item_all);
                const tempIndex = result.findIndex(item => item.colType === 'followUp');
                if (
                    tempIndex !== -1 &&
                    Array.isArray(this.computed_selectOptions.followUp)
                ) {
                    /**
                     * @Description: 成交状态之后的状态都要显示成交时间和金额
                     * @author mayuanzhi
                     * @date 2020/6/8
                     */
                    // 默认查到第一个存在后面的都需要有 成交时间 和 金额
                    const transactionStatus = this.computed_selectOptions.followUp.find(v => v.transactionStatus);
                    if (
                        this.current_followUp &&
                        transactionStatus &&
                        this.current_followUp.sort >= transactionStatus.sort
                    ) {
                        const isOnlyRead = result[tempIndex].isOnlyRead;
                        result.splice(
                            tempIndex + 1,
                            0,
                            {
                                cname: this.$t('crm.Modal.transactionTime'),
                                fieldType: 'default',
                                colType: 'transactionTime',
                                mustInput: 1,
                                isOnlyRead
                            },
                            {
                                cname: this.$t('crm.Modal.transactionMoney'),
                                fieldType: 'default',
                                colType: 'transactionMoney',
                                maxLength: 200,
                                isOnlyRead
                            },
                            {
                                cname: this.$t('crm.Modal.transactionInfo'),
                                fieldType: 'default',
                                colType: 'transactionInfo',
                                maxLength: 4000,
                                isOnlyRead
                            }
                        );
                    }
                }
                return result.map(v => {
                    return {
                        ...v,
                        formMap: v.storageName ? `inquiry_${v.storageName}` : `inquiry_${v.colType}`
                    };
                });
            },

            computed_mailAddress() {
                return typeof this.mailAddress === 'string'
                    ? this.mailAddress.trim()
                    : '';
            },
            computed_WAAccount() {
                return typeof this.WAAccount === 'string'
                    ? `+${this.WAAccount.trim()}`
                    : '';
            },
            computed_WANickName() {
                return typeof this.WANickName === 'string'
                    ? this.WANickName.trim()
                    : '';
            },

            current_followUp() {
                return Array.isArray(this.computed_selectOptions.followUp)
                    ? this.computed_selectOptions.followUp.find(item => `${item.attrId}` === `${this.inquiry.followUpId}`)
                    : undefined;
            },
            /* 多语言 */
            lang_company() {
                return {
                    companyName: this.$t('crm.Modal.corp_companyName'),
                    starLevel: this.$t('crm.Modal.corp_starLevel'),
                    shortName: this.$t('crm.Modal.corp_shortName'),
                    countryArea: this.$t('crm.Modal.corp_countryArea'),
                    mainProduct: this.$t('crm.Modal.corp_mainProduct'),
                    scale: this.$t('crm.Modal.corp_scale'),
                    clientType: this.$t('crm.Modal.corp_clientType'),
                    homePage: this.$t('crm.Modal.corp_homePage'),
                    phone: this.$t('crm.Modal.corp_phone'),
                    fax: this.$t('crm.Modal.corp_fax'),
                    contactAddress: this.$t('crm.Modal.corp_contactAddress'),
                    relatedCompany: this.$t('crm.Modal.corp_relatedCompany'),
                    companyPicture: this.$t('crm.Modal.corp_companyPicture'),
                    companyRemark: this.$t('crm.Modal.corp_companyRemark'),
                    companySourceWay: this.$t('crm.Table.col_customerSource')
                };
            },
            lang_contact() {
                return {
                    nickName: this.$t('crm.Modal.contact_nickName'),
                    jobTitle: this.$t('crm.Modal.contact_jobTitle'),
                    email: this.$t('crm.Modal.contact_email'),
                    phone: this.$t('crm.Modal.contact_phone'),
                    whatsApp: 'WhatsApp',
                    instagram: 'Instagram',
                    jobGrade: this.$t('crm.Modal.contact_jobGrade'),
                    socialNetworkingPlatform: this.$t('crm.Modal.contact_socialNetworkingPlatform'),
                    birthday: this.$t('crm.Modal.contact_birthday'),
                    gender: this.$t('crm.Modal.contact_gender'),
                    picture: this.$t('crm.Modal.contact_picture'),
                    remark: this.$t('crm.Modal.contact_remark')
                };
            },
            lang_inquiry() {
                return {
                    productCategory: this.$t('crm.Modal.inq_productCategory'),
                    demandProducts: this.$t('crm.Modal.inq_demandProducts'),
                    inquiryScore: this.$t('crm.Modal.inq_inquiryScore'),
                    label: this.$t('crm.Modal.inq_label'),
                    sourceChannel: this.$t('crm.Modal.inq_sourceChannel'),
                    sourceWay: this.$t('crm.Modal.inq_sourceWay'),
                    grouping: this.$t('crm.Modal.inq_grouping'),
                    followUp: this.$t('crm.Modal.inq_followUp'),
                    estimatedInquiryAmount: this.$t('crm.Modal.inq_estimatedInquiryAmount'),
                    remark: this.$t('crm.Modal.inq_remark')
                };
            }
        },
        data() {
            return {
                corp_columns_authorized: {
                    default: [],
                    custom: []
                },
                contact_columns_authorized: {
                    default: [],
                    custom: []
                },
                inquiry_columns_authorized: {
                    default: [],
                    custom: []
                },
                is_all_field_requested: false,

                /* 正体 */
                loading: false,
                saleId: '',
                contact: {},
                contact_backup: {},
                contactMerged: false,
                inquiry: {},
                inquiry_backup: {},
                company: {},
                company_backup: {},
                error_countryArea: false,
                // uniqCompanyCandidateItems: [],
                companyMerged: false,
                list_documents: [],
                /* 图片 */
                companyPictures: [],
                contactPictures: [],
                /* 公司查重并入 */
                uniqCompanyVisible: false,
                newCompanyId: '',
                // 社交平台查重弹窗的状态
                uniqSocialPlatformsVisible: false,
                uniqSocialPlatformVal: '',
                uniqSocialPlatformName: '',
                /* 联系人查重并入 */
                // uniqMailVisible: false,
                newContactId: '',
                /* 电话查重 */
                // uniqPhoneNumberVisible: false,
                // phoneNumber: '',
                // phoneNumberRelatedData: [],
                /* WhatsApp / Instagram 查重 */
                uniqContactVisible: false,
                uniqContactField: '',
                uniqContactVal: '',

                /* 邮箱后缀查重 */
                uniqEmailSuffixVisible: false,
                uniqEmailSuffixVal: '',

                /* 成交数据 */
                visible_edit_clinchData: false,
                transactionTime: new Date(),
                transactionMoney: null,
                transactionMoneyCurrency: 'CNY', // 配合仪表盘业绩目标报表新增成交金额币种字段
                estimatedInquiryAmount: null,
                estimatedInquiryAmountCurrency: 'CNY',
                transactionInfo: null,
                transactionStatus: {}, // 成交状态

                close_popper: this.$debounce(
                    e => {
                        if (e && e.target && e.target.classList.contains('el-dialog__body')) {
                            // 关闭 select 下拉选框
                            const selectEl = this.$refs.currentModal.$el.querySelector('.is-focus');
                            if (selectEl) {
                                selectEl.click();
                            }
                        }
                    },
                    undefined,
                    true
                ),
                contactAddressLatLng: '', // 联系地址经纬度
                companyInfo: {
                    companyName: '',
                    companyId: ''
                },
                select_company_modal: false
            };
        },
        methods: {
            handleCompany(item) {
                this.companyInfo = item;
            },
            // 获取默认字段 + 自定义字段
            getAllField() {
                this.loading = true;
                this.is_all_field_requested = false;
                this.corp_columns_authorized = {
                    default: [],
                    custom: []
                };
                this.contact_columns_authorized = {
                    default: [],
                    custom: []
                };
                this.inquiry_columns_authorized = {
                    default: [],
                    custom: []
                };
                this.$commonApi.getAllColumns({
                    orgId: this.enterpriseId,
                    parentId: 0,
                    userId: this.userId
                }).then(res => {
                    if (res.code === '1') {
                        const { customColumn, defaultColumn } = res.data;
                        defaultColumn.forEach(item => {
                            switch (`${item.parentId}`) {
                                case '1':
                                    // 字段显示为多语言
                                    if (this.lang_company.hasOwnProperty(item.storageName)) {
                                        item.cname = this.lang_company[item.storageName];
                                    }
                                    this.$set(this.corp_columns_authorized.default, this.corp_columns_authorized.default.length, item);
                                    break;
                                case '2':
                                    // 字段显示为多语言
                                    if (this.lang_contact.hasOwnProperty(item.storageName)) {
                                        item.cname = this.lang_contact[item.storageName];
                                    }
                                    this.$set(this.contact_columns_authorized.default, this.contact_columns_authorized.default.length, item);
                                    break;
                                case '3':
                                    // 字段显示为多语言
                                    if (this.lang_inquiry.hasOwnProperty(item.storageName)) {
                                        item.cname = this.lang_inquiry[item.storageName];
                                    }
                                    this.$set(this.inquiry_columns_authorized.default, this.inquiry_columns_authorized.default.length, item);
                            }
                        });
                        customColumn.show.forEach(field => {
                            field.colType = field.type;
                            switch (`${field.parentId}`) {
                                case '1':
                                    this.$set(this.corp_columns_authorized.custom, this.corp_columns_authorized.custom.length, field);
                                    break;
                                case '2':
                                    this.$set(this.contact_columns_authorized.custom, this.contact_columns_authorized.custom.length, field);
                                    break;
                                case '3':
                                    this.$set(this.inquiry_columns_authorized.custom, this.inquiry_columns_authorized.custom.length, field);
                                    break;
                            }
                        });
                        this.is_all_field_requested = true;
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_get_all_fields_for_newCreate'));
                    }
                    this.loading = false;
                });
            },
            async ok() {
                // 如果当前正在录入, 则退出录入
                if (this.loading) {
                    this.$Message.warning(this.$t('mail.customerBox.requestTip'));
                    return;
                }
                /* 去除不在授权范围的字段 */
                Object.keys(this.company).forEach(item => {
                    if (!this.corp_item_all.find(field => field.storageName === item)) {
                        delete this.company[item];
                    }
                });
                Object.keys(this.contact).forEach(item => {
                    if (!this.contact_item_all.find(field => field.storageName === item)) {
                        delete this.contact[item];
                    }
                });
                Object.keys(this.inquiry).forEach(item => {
                    if (!this.inquiry_item_all.find(field => field.storageName === item)) {
                        if (item === 'followUpId') {
                            if (!this.inquiry_item_all.find(field => field.storageName === 'followUp')) {
                                delete this.inquiry[item];
                            }
                        } else {
                            delete this.inquiry[item];
                        }
                    }
                });
                // 各种合法性校验
                // 图片是否上传完成
                if (Array.isArray(this.companyPictures) && this.companyPictures.some(item => item.uploading)) {
                    this.$Message.warning(this.$t('crm.Modal.info_companyPictureUploading'));
                    return;
                }
                if (Array.isArray(this.contactPictures) && this.contactPictures.some(item => item.uploading)) {
                    this.$Message.warning(this.$t('crm.Modal.info_contactPictureUploading'));
                    return;
                }
                // 文档是否上传完成
                if (Array.isArray(this.list_documents) && this.list_documents.some(item => item.uploading)) {
                    this.$Message.warning(this.$t('crm.Modal.info_inquiryDocumentsUploading'));
                    return;
                }
                // 成交时间不能为空
                if (this.current_followUp && this.current_followUp.transactionStatus && !(this.transactionTime instanceof Date && !isNaN(this.transactionTime.getTime()))) {
                    this.$Message.error(this.$t('crm.Html.empty_transactionTime'));
                    return;
                }
                // 负责人不能为空
                if (!this.saleId) {
                    this.$Message.error(this.$t('clue.select_sales'));
                    return;
                }
                // 联系人邮箱不能为空
                // 放开邮箱必填 22-04-12
                // if (!(this.computed_mailAddress || this.contact.email.trim())) {
                //     this.$Message.error(this.$t('crm.Modal.error_emptyEmail'));
                //     return;
                // }
                // 联系人姓名不能为空
                if (this.contact.nickName.trim() === '') {
                    this.$Message.error(this.$t('crm.Modal.error_emptyNickName'));
                    return;
                }
                // 验证WhatsApp字段
                if (this.contact.whatsApp) {
                    if (!(/^[ \-_`~!@#$%^&*()+=|{}':;",\[\].<>/?~！@#￥%……&*（）——+\d]+$/i.test(this.contact.whatsApp))) {
                        this.$Message.error(this.$t('crm.Modal.error_whatsAppFormat'));
                        return;
                    }
                }
                // 校验社交平台信息是否填完整
                if (this.contact.socialNetworkingPlatform && this.contact.socialNetworkingPlatform.length && (this.socialPlatformsFlag() === '1' || this.socialPlatformsFlag() === '2')) {
                    const str = this.socialPlatformsFlag() === '2' ? '社交平台分类不能为空' : '社交平台内容不能为空';
                    this.$Message.error(str);
                    return;
                }
                // 产品分类不能为空
                // 放开产品分类必填 22-04-12
                // if (this.inquiry.productCategory && !this.inquiry.productCategory.length) {
                //     this.$Message.error(this.$t('crm.Modal.error_emptyProductCategory'));
                //     return;
                // }
                // 公司名不能为空
                if (this.company.companyName && this.company.companyName === '') {
                    this.$Message.error(this.$t('crm.Modal.error_emptyCompanyName'));
                    return;
                }
                // 询盘备注不能超过 20000 个字符
                if (this.inquiry.remark && this.inquiry.remark.toString().replace(/[^\x00-\xff]/gi, '--').length > 20000) {
                    this.$Message.error(this.$t('crm.Modal.error_remarkLength'));
                    return;
                }
                this.inquiry.estimatedInquiryAmount = this.estimatedInquiryAmount ? Number(this.estimatedInquiryAmount.replace(/,/g, '')) : this.estimatedInquiryAmount;
                // this.inquiry.estimatedInquiryAmountCurrency = this.estimatedInquiryAmountCurrency;
                // 邮箱格式是否规范
                const emailReg = Utils.regExp.fullEmail;
                if ((this.contact.email || this.computed_mailAddress) && !(emailReg.test(this.computed_mailAddress || this.contact.email.trim()))) {
                    this.$Message.error(this.$t('crm.Modal.error_emailFormat'));
                    return;
                }
                // 必填字段校验
                let tempErrorField = '';
                if (!this.contactMerged && this.contact_item_all.some(item => {
                    // 常规字段, 值为字符串或数组类型
                    if (item.mustInput === 1) {
                        // 特殊字段, 值为对象数组, phone 或 socialNetworkingPlatform
                        if (item.storageName === 'phone') {
                            tempErrorField = item.cname;
                            return !this.contact[item.storageName].some(item => item.phoneNumber.trim().length);
                        } else if (item.storageName === 'socialNetworkingPlatform') {
                            tempErrorField = item.cname;
                            return !this.contact[item.storageName].some(item => item.attrName && item.attrValue.trim().length);
                        } else if (item.storageName === 'picture') {
                            if (this.contactPictures.length === 0) {
                                tempErrorField = item.cname;
                                return true;
                            }
                        } else if (item.storageName === 'email') {
                            if (!this.contact.email && !this.computed_mailAddress) {
                                tempErrorField = item.cname;
                                return true;
                            }
                        } else {
                            if (item.colType === 'text' && !this.contact[item.storageName].trim().length) {
                                if (item.isOnlyRead !== 1) {
                                    tempErrorField = item.cname;
                                    return true;
                                }
                            } else if (this.contact[item.storageName].length === 0) {
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
                } else if (this.inquiry_item_all.some(item => {
                    if (item.colType === 'followUp') {
                        if (item.mustInput === 1 && !this.inquiry.followUpId.length) {
                            if (item.isOnlyRead !== 1) {
                                tempErrorField = this.$t('crm.Modal.inq_followUp');
                                return true;
                            }
                        }
                    } else if (item.mustInput === 1 && (!this.inquiry[item.storageName] || this.inquiry[item.storageName].length === 0)) {
                        if (item.isOnlyRead !== 1) {
                            tempErrorField = item.cname;
                            if (this.inquiry[item.storageName] === 0) {
                                return false;
                            }
                            return true;
                        }
                    }
                })) {
                    this.$Message.error(`${tempErrorField}${this.$t('crm.Modal.error_canNotBeEmpty')}`);
                    return;
                } else if (!this.companyMerged && this.corp_item_all.some(item => {
                    if (item.mustInput === 1) {
                        if (item.storageName === 'companyPicture') {
                            if (this.companyPictures.length === 0) {
                                tempErrorField = item.cname;
                                return true;
                            }
                        } else {
                            if (!this.company[item.storageName] || this.company[item.storageName].length === 0) {
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
                // 设置要发送的数据的 询盘数据
                const newInquiryData = {};
                this.inquiry_item_all.forEach(item => {
                    switch (item.colType) {
                        case 'followUp':
                            newInquiryData.followUp = this.current_followUp ? this.current_followUp.attrName : null;
                            newInquiryData.followUpId = `${this.inquiry.followUpId}`;
                            break;
                        case 'label':
                            newInquiryData.label = JSON.stringify(this.getSelectedLabels(this.inquiry.label, this.selectOptions.tag));
                            break;
                        case 'selectMultiple':
                            newInquiryData[item.storageName] = Array.isArray(this.inquiry[item.storageName]) ? JSON.stringify(this.inquiry[item.storageName]) : JSON.stringify([]);
                            break;
                        default:
                            newInquiryData[item.storageName] = this.inquiry[item.storageName];
                    }
                });
                // 就算没有"跟进状态"字段, 也要保存上 '0' , 不然编辑时不选跟进状态就会因为 followUpId 为 null 而无法保存
                if (!newInquiryData.followUpId) {
                    newInquiryData.followUpId = '0';
                }
                newInquiryData.estimatedInquiryAmountCurrency = this.estimatedInquiryAmountCurrency;
                /* 检验字段是否超长 */
                // 如果成交数据可编辑, 此处校验时还要临时加上成交数据, 但不能放数据到 send_data 中, 编辑成交数据走 edit_clinchData 方法
                // 获取成交状态在跟进状态列表中的位置
                const transactionStatus = this.computed_selectOptions.followUp.find(item => item.transactionStatus);
                // 有成交状态 + 当前跟进状态位置大于等于成交状态位置 + 有成交时间, 才允许保存成交数据, 此时才需要校验长度
                // 后端接口合并，成交状态也由新建接口接受，无需再多接口调用
                if ((this.current_followUp && transactionStatus && this.current_followUp.sort >= transactionStatus.sort)) {
                    let transactionMoney = this.transactionMoney ? Number(this.transactionMoney.replace(/,/g, '')) : ''; // 成交金额,
                    transactionMoney = Number.isNaN(transactionMoney) ? this.transactionMoney : transactionMoney;
                    newInquiryData.transactionMoney = transactionMoney;
                    newInquiryData.transactionMoneyCurrency = this.transactionMoneyCurrency;
                    newInquiryData.transactionInfo = this.transactionInfo;
                    newInquiryData.transactionTime = this.transactionTime.getTime(); // 成交时间,
                }
                if (this.check_length_default('inquiry_field_long_limit', newInquiryData) || this.check_length_custom('inquiry_item_custom', this.inquiry_item_custom, newInquiryData)) {
                    return false;
                }
                const tempSendData = Object.assign({
                    orgId: this.enterpriseId,
                    ownerId: Number(this.saleId)
                }, this.remove_attr_readonly(newInquiryData, 'inquiry'));
                /* 从WhatsApp录入的询盘信息要加上字段 */
                const contactsGoogleFBDto = {
                    visitorId: '',
                    gclid: null,
                    whatsApp: this.WAAccount,
                    userBindWaAccount: this.userBindWaAccount
                };
                if (this.type === 'whatsApp') {
                    tempSendData.contactsGoogleFBDto = contactsGoogleFBDto;
                }
                // 正体
                this.loading = true;
                // 公司部分校验并设置相关的 公司数据
                const res_uniqCompany = await crmCompany.sameCompanyName({
                    orgId: this.enterpriseId,
                    companyName: this.company.companyName
                });
                if (res_uniqCompany.code === '1') {
                    if (this.allowMerge === '1') {
                        if (!this.companyMerged) { // 如果有相同公司名称，且并未合并到已有公司
                            // 弹出查重框
                            this.uniqCompany(true);
                            // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                            setTimeout(() => {
                                this.$Message.warning(this.$t('crm.Modal.info_enterUniqCompanyName'));
                            });
                            // 停止录入操作
                            this.loading = false;
                        } else {
                            tempSendData.companyId = this.newCompanyId;
                        }
                    } else {
                        // 弹出查重框
                        this.uniqCompany(true);
                        // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                        setTimeout(() => {
                            this.$Message.warning(this.$t('crm.Modal.info_enterUniqCompanyName'));
                        });
                        // 停止录入操作
                        this.loading = false;
                    }
                } else {
                    // 校验国家地区, 非只读情况下
                    const temp = this.corp_item_all.find(item => item.storageName === 'countryArea');
                    if (temp && this.company.countryArea) {
                        if (temp.isOnlyRead !== 1) {
                            const res_getCountryArea = await this.$commonApi.getDetailByCode({
                                divCode: this.company.countryArea
                            });
                            if (!(Array.isArray(res_getCountryArea.data) && res_getCountryArea.data.length)) {
                                this.$Message.error(this.$t('crm.Modal.error_countryAreaFormat'));
                                this.error_countryArea = true;
                                this.loading = false;
                            }
                        }
                    }
                    if (this.loading) {
                        const tempCompanyData = Object.assign({
                            orgId: this.enterpriseId
                        }, this.company);
                        if (this.company.hasOwnProperty('companyPicture')) {
                            tempCompanyData.companyPicture = this.companyPictures.map(item => item.url).join(';');
                        }
                        this.corp_item_all.filter(item => item.colType === 'selectMultiple').forEach(item => {
                            tempCompanyData[item.storageName] = Array.isArray(tempCompanyData[item.storageName]) ? JSON.stringify(tempCompanyData[item.storageName]) : JSON.stringify([]);
                        });
                        /* 检验字段是否超长 */
                        if (this.check_length_default('corp_field_long_limit', tempCompanyData) || this.check_length_custom('corp_item_custom', this.corp_item_custom, tempCompanyData)) {
                            this.loading = false;
                            return false;
                        }
                        if (tempCompanyData.contactAddress) {
                            if (this.contactAddressLatLng) {
                                tempCompanyData.point = `${this.contactAddressLatLng.lng},${this.contactAddressLatLng.lat}`;
                            }
                        }
                        tempSendData.company = this.remove_attr_readonly(tempCompanyData, 'corp');
                    }
                }
                // 联系人部分校验并设置相关的联系人数据
                if (this.loading) {
                    if (this.computed_mailAddress || (this.contact.email && this.contact.email.trim())) {
                        // 邮箱去重
                        const res_uniqEmail = await crmContacts.sameContactsEmail({
                            orgId: this.enterpriseId,
                            email: this.computed_mailAddress || this.contact.email.trim()
                        });
                        if (res_uniqEmail.code === '1') {
                            // 如果邮件有重复
                            if (this.allowMerge === '1') {
                                // 如果允许合并
                                if (!this.contactMerged) {
                                    // 未合并到已有联系人, 弹出合并提示并退出流程
                                    this.$Message({
                                        dangerouslyUseHTMLString: true,
                                        type: 'error',
                                        message: this.$t('crm.Modal.error_existedEmailNeedMerge')
                                    });
                                    this.loading = false;
                                    return;
                                } else {
                                    // 已合并, 把已合并联系人 id 加入到发送数据中, 不管用户已填写的数据
                                    tempSendData.contactsId = this.newContactId;
                                }
                            } else {
                                // 弹出查重框
                                this.uniqContact({ field: 'email', value: this.computed_mailAddress || this.contact.email.trim(), uniqDirectly: true });
                                // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                                setTimeout(() => {
                                    this.$Message.warning(this.$t('crm.Modal.info_enterUniqContact').replace(/\$field/g, this.$t('crm.Table.col_email')));
                                });
                                // 停止录入操作
                                this.loading = false;
                                return;
                            }
                        }
                    }
                    // 初始化要发送的联系人数据对象
                    const temp = Object.assign({}, this.contact);
                    // 处理邮箱数据
                    temp.email = this.computed_mailAddress || (temp.email ? temp.email.trim() : '');
                    // 处理多选数据
                    this.contact_item_all.filter(item => item.colType === 'selectMultiple').forEach(item => {
                        temp[item.storageName] = Array.isArray(temp[item.storageName]) ? JSON.stringify(temp[item.storageName]) : JSON.stringify([]);
                    });
                    // 邮箱后缀查重
                    if (this.showUniq.emailSuffix === '1' && temp.email) {
                        const res_uniqEmailSuffix = await this.$commonApi.checkContact({
                            orgId: this.enterpriseId,
                            emailSuffix: GET_EMAIL_SUFFIX(temp.email.trim())
                        });
                        if (res_uniqEmailSuffix.code === '1') {
                            // 弹出查重框
                            this.uniqEmailSuffixVal = temp.email.trim();
                            this.uniqEmailSuffixVisible = true;
                            // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                            setTimeout(() => {
                                this.$Message.warning(this.$t('crm.Modal.info_enterUniqEmailSuffix').replace(/\$field/g, GET_EMAIL_SUFFIX(temp.email.trim())));
                            });
                            // 停止录入操作
                            this.loading = false;
                        }
                    }
                    // WhatsApp 查重
                    if (this.loading && this.showUniq.whatsapp === '1' && temp.hasOwnProperty('whatsApp') && temp.whatsApp && temp.whatsApp.trim()) {
                        // whatsApp 查重
                        const res_uniqContact = await this.$commonApi.checkContact({
                            orgId: this.enterpriseId,
                            whatsApp: temp.whatsApp.trim()
                        });
                        if (res_uniqContact.code === '1') {
                            // 弹出查重框
                            this.uniqContact({ field: 'WhatsApp', value: temp.whatsApp, uniqDirectly: true });
                            // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                            setTimeout(() => {
                                this.$Message.warning(this.$t('crm.Modal.info_enterUniqContact').replace(/\$field/g, 'WhatsApp'));
                            });
                            // 停止录入操作
                            this.loading = false;
                        }
                    }

                    // 格式化电话(如果有此字段)
                    let phone;
                    if (temp.hasOwnProperty('phone')) {
                        phone = temp.phone.map(item => {
                            return item.phoneNumber;
                        }).filter(item => {
                            return !(!item || item === '');
                        }); // 电话
                        if (phone.length > 0) {
                            phone = [...new Set(phone)];
                        }
                        delete temp.phone;
                    }
                    // 电话查重
                    if (this.loading && Array.isArray(phone) && phone.length > 0) {
                        if (this.showUniq.phone !== '1') {
                            // 如果不查重, 直接赋值数据
                            temp.phone = phone.join(',');
                        } else {
                            // 电话查重
                            const res_uniqPhone = await crmContacts.isSameField({
                                orgId: this.enterpriseId,
                                field: 'phone',
                                values: phone.join(',')
                            });
                            if (res_uniqPhone.code === '1') {
                                // 弹出查重框
                                this.uniqContact({ field: 'phone', value: phone[0], uniqDirectly: true });
                                // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                                setTimeout(() => {
                                    this.$Message.warning(this.$t('crm.Modal.info_enterUniqContact').replace(/\$field/g, this.$t('crm.Table.col_phone')));
                                });
                                // 停止录入操作
                                this.loading = false;
                            } else {
                                // 无重复, 赋值数据
                                temp.phone = phone.join(',');
                            }
                        }
                    }
                    // Instagram 查重
                    if (this.loading && this.showUniq.instagram === '1' && temp.hasOwnProperty('instagram') && temp.instagram && temp.instagram.trim()) {
                        // Instagram 查重
                        const res_uniqContact = await this.$commonApi.checkContact({
                            orgId: this.enterpriseId,
                            instagram: temp.instagram.trim()
                        });
                        if (res_uniqContact.code === '1') {
                            // 弹出查重框
                            this.uniqContact({ field: 'Instagram', value: temp.instagram, uniqDirectly: true });
                            // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                            setTimeout(() => {
                                this.$Message.warning(this.$t('crm.Modal.info_enterUniqContact').replace(/\$field/g, 'Instagram'));
                            });
                            // 停止录入操作
                            this.loading = false;
                        }
                    }
                    // 社交平台查重
                    if (this.loading && this.showUniq.socialPlatform === '1' && this.contact.socialNetworkingPlatform && this.contact.socialNetworkingPlatform.length) {
                        let result = await this.socialPlatformsCheckDuplicate();
                        if (result.length) {
                            this.$Message.warning(this.$t('crm.Modal.info_enterUniqSocialPlatformLink').replace(/\$fieldName/g, result[0].attrName).replace(/\$fieldVal/g, result[0].attrValue));
                            // 停止录入操作
                            this.loading = false;
                        }
                    }
                    // 查重通过, 数据格式化, 存入待发送数据对象中
                    if (this.loading) {
                        // 格式化社交平台(如果有此字段)
                        let platform = null;
                        if (temp.hasOwnProperty('socialNetworkingPlatform')) {
                            platform = temp.socialNetworkingPlatform.map(item => {
                                if (item.attrName && item.attrValue) {
                                    return {
                                        attrId: this.getPlatformId(item.attrName),
                                        attrName: item.attrName,
                                        attrValue: item.attrValue
                                    };
                                }
                            }).filter(function(item) {
                                return !(!item || item === '');
                            }); // 社交平台
                            delete temp.socialNetworkingPlatform;
                        }
                        // 格式化联系人图片(如果有的话)
                        let picture = null;
                        if (temp.hasOwnProperty('picture')) {
                            picture = this.contactPictures.map(item => item.url).join(';');
                        }
                        // 得到要存入的联系人数据
                        const sendContactData = Object.assign({
                            orgId: this.enterpriseId
                        }, temp);
                        if (platform) {
                            sendContactData.socialNetworkingPlatform = JSON.stringify(platform);
                        }
                        if (picture) {
                            sendContactData.picture = picture;
                        }
                        sendContactData.nickName = sendContactData.nickName || '';
                        // 检验字段是否超长, 超长则退出流程
                        if (this.check_length_default('contact_field_long_limit', sendContactData) || this.check_length_custom('contact_item_custom', this.contact_item_custom, sendContactData)) {
                            this.loading = false;
                            return false;
                        }
                        // 未超长, 加入联系人数据到要发送的数据对象中
                        tempSendData.contacts = this.remove_attr_readonly(sendContactData, 'contact');
                    }
                }
                if (this.loading) {
                    triggerGtag('CRM', '询盘');
                    crmCommon.inquiryCommonSave(JSON.stringify(tempSendData)).then(response => {
                        if (response.code === '1') {
                            this.$emit('refreshData');
                            this.$Message.success(this.$t('crm.Modal.success_newCompany'));
                            /**
                             * @Description: 录入询盘完成后调用客户箱手动归并的接口,归并客户箱邮件
                             * @author 杨娣
                             * @date 2019/10/12
                             */
                            /**
                             * @Description: 客户箱归并接口所传的createUserId应为新建询盘时选择的负责人id
                             * @author 杨娣
                             * @date 2020/5/27
                             */
                            // 邮箱非必填
                            if (tempSendData.contacts && (this.computed_mailAddress || this.contact.email)) {
                                crmClue.mergerMail({
                                    emailAddress: this.computed_mailAddress || this.contact.email,
                                    createUserId: this.saleId,
                                    orgId: this.enterpriseId,
                                    inquiryId: response.data.inquiryId
                                });
                                // 联系人邮箱关联到邮件系统
                                crmClue.addTimeAxis({
                                    address: this.computed_mailAddress || this.contact.email,
                                    createUserId: tempSendData.ownerId,
                                    orgId: this.enterpriseId,
                                    contactsId: response.data.contactsId,
                                    contactsName: tempSendData.contacts.nickName,
                                    companyId: response.data.companyId,
                                    inquiryId: response.data.inquiryId
                                });
                            }
                            // 保存询盘文档
                            if (this.list_documents.length) {
                                this.fileSave(response.data.inquiryId);
                            }
                            const logObj = {
                                operateType: 1,
                                operateModule: 1,
                                currentObj: Object.assign({ mainContact: tempSendData.contactsId ? '' : response.data.contactsId }, newInquiryData),
                                companyCurrentObj: Object.assign({}, tempSendData.company),
                                contactCurrentObj: Object.assign({}, tempSendData.contacts),
                                mergedContactId: tempSendData.contactsId,
                                contactId: tempSendData.contactsId ? undefined : response.data.contactsId,
                                companyId: response.data.companyId,
                                inquiryId: response.data.inquiryId,
                                enterpriseId: this.enterpriseId.toString(),
                                userId: this.userId,
                                fullName: this.fullName
                            };
                            this.contactAddressLatLng = '';
                            // 保存日志暂由前端处理，后期再优化
                            this.$saveLog(logObj, 'company');
                            this.cancel();
                        } else if (response.code === '0' && response.data === -3) {
                            /**
                             * @Description: 两个人把同一条线索录入询盘
                             * @author mayuanzhi
                             * @date 2020/6/10
                             */
                            this.$Message.error(this.$t('crm.Modal.beBeing_newInquiry'));
                        } else if (response.code === '0' && response.data === -5) {
                            /**
                             * @Description: 两个人把同一条线索录入询盘
                             * @author mayuanzhi
                             * @date 2020/6/10
                             */
                            this.$Message.error(this.$t('crm.Modal.repetition_newInquiry'));
                        } else if (response.code === '-6') {
                            this.$Message.error(response.message + this.$t('highSeasSetting.inquriry.overCustomerLimit'));
                        } else if (response.code === '0' && response.data === -7) {
                            // 该邮箱为企业同事邮箱，不可录入
                            this.$Message.error(this.$t('crm.Modal.error_enterpriseColleagueMail'));
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_newCompany'));
                        }
                        this.loading = false;
                    }, error => {
                        this.loading = false;
                    }).catch(error => {
                        this.loading = false;
                    }); // 发送
                }
            },
            // 校验社交平台字段是否有未填项
            socialPlatformsFlag() {
                for (let i = 0; i < this.contact.socialNetworkingPlatform.length; i++) {
                    const item = this.contact.socialNetworkingPlatform[i];
                    item.attrValue = item.attrValue.trim();
                    if (item.attrName !== '' && item.attrValue === '') {
                        return '1';
                    } else if (item.attrName === '' && item.attrValue !== '') {
                        return '2';
                    }
                }
            },
            // 多条社交平台循环查重
            async socialPlatformsCheckDuplicate() {
                const result = [];
                for (let i = 0; i < this.contact.socialNetworkingPlatform.length; i++) {
                    const item = this.contact.socialNetworkingPlatform[i];
                    if (item.isShow) {
                        const res_uniqSocialPlatforms = await this.$commonApi.checkContact({
                            orgId: this.enterpriseId,
                            attrValue: item.attrValue.trim(),
                            attrName: item.attrName
                        });
                        if (res_uniqSocialPlatforms.code === '1') {
                            result.push(item);
                            break;
                        }
                    }
                }
                return result;
            },
            cancel() {
                this.loading = false;
                this.saleId = '';
                this.$emit('update:visible', false); // 改变父组件的 控制本组件显示 属性
                // 联系人部分
                this.contact = this.$deepClone(this.contact_backup);
                this.contactMerged = false;
                this.contactPictures = [];
                // this.uniqMailVisible = false;
                this.newContactId = '';
                // this.uniqPhoneNumberVisible = false;
                // this.phoneNumber = '';
                // 询盘部分
                this.estimatedInquiryAmount = null;
                this.estimatedInquiryAmountCurrency = 'CNY';
                this.inquiry = this.$deepClone(this.inquiry_backup);
                this.list_documents = [];
                // 公司部分
                this.company = this.$deepClone(this.company_backup);
                this.companyMerged = false;
                this.companyPictures = [];
                this.error_countryArea = false;
                this.uniqCompanyVisible = false;
                this.newCompanyId = '';

                // this.visible_edit_clinchData = false;
                this.transactionTime = new Date();
                this.transactionMoney = null;
                this.transactionMoneyCurrency = 'CNY';
                this.transactionInfo = null;
                this.transactionStatus = {};

                // 页面回到顶部
                this.$refs.currentModal.$el.querySelector('.el-dialog__body').scrollTop = 0;
            },
            fileSave(inquiryId) {
                const fileNames = this.list_documents.map(item => item.name);
                const jsonData = this.list_documents.map(item => {
                    return {
                        documentName: item.name,
                        documentPath: item.url,
                        documentType: item.suffix,
                        orgId: this.enterpriseId,
                        createUserId: this.userId,
                        createUser: this.fullName,
                        foreignKey: inquiryId,
                        foreignType: 3
                    };
                });
                crmCommon.saveBatch(jsonData).then(response => {
                    if (response.code === '1') {
                        // 保存日志
                        this.$saveLog({
                            operateType: 4,
                            operateModule: 5,
                            inquiryId: inquiryId,
                            userId: this.userId,
                            fullName: this.fullName,
                            currentObj: {
                                name: fileNames.join(',\n')
                            },
                            enterpriseId: this.enterpriseId
                        });
                    } else {
                        this.$Message.error({
                            message: this.$t('crm.Html.error_saveFile'),
                            duration: 0,
                            closable: true
                        });
                    }
                });
            },

            // 去除只读属性, 无论是否只读都为必填属性除外
            remove_attr_readonly(data, type) {
                const temp = Object.assign({}, data);

                // 不参与只读属性校验的属性
                let exclude_attrs = [];
                switch (type) {
                    case 'contact':
                        exclude_attrs = ['nickName', 'email'];
                        break;
                    case 'inquiry':
                        exclude_attrs = ['productCategory'];
                        break;
                    case 'corp':
                        exclude_attrs = ['companyName'];
                        break;
                }
                const exclude_attrValues = exclude_attrs.map(item => temp[item]);

                // 去掉只读属性
                this[`${type}_item_all`].forEach(item => {
                    if (item.isOnlyRead === 1 && temp.hasOwnProperty(item.storageName)) {
                        delete temp[item.storageName];
                    }
                });

                // 恢复不参与校验的属性值
                exclude_attrs.map((item, index) => {
                    temp[item] = exclude_attrValues[index];
                });

                return temp;
            },
            getPlatformId(attrName) {
                let result = '';
                this.selectOptions.socialNetworkingPlatform.some(i => {
                    if (i.attrName === attrName) {
                        result = i.attrId;
                        return true;
                    }
                });
                return result;
            }, // 获得选中属性的id
            getSelectedLabels(selectedArr, allArr) {
                const selectedLabels = [];
                for (const item of selectedArr) {
                    allArr.some(i => {
                        if (i.attrName === item) {
                            const { attrId, attrName, attrValue, orgId, typeId } = i;
                            const belongTable = 3;
                            selectedLabels.push({
                                attrId,
                                attrName,
                                attrValue,
                                orgId,
                                typeId,
                                belongTable
                            });
                            return true;
                        }
                    });
                }
                return selectedLabels;
            }, // 通过 Select 绑定的被选中标签名称数组获取其他数据并格式化
            /* 公司去重 */
            uniqCompany(uniqDirectly) {
                if (this.company.companyName) {
                    // 直接打开查重框
                    if (uniqDirectly) {
                        /**
                         * @Description: 此处与 uniqContact 保持一致, 不直接打开查重结果框, 之后统一修改
                         * @author 汤一飞
                         * @date 2021/3/24
                         */
                        // this.uniqCompanyVisible = true;

                        // 退出流程
                        return;
                    }

                    crmCompany.getNameList({
                        orgId: this.enterpriseId,
                        companyName: this.company.companyName,
                        ifExactSearch: this.uniqTypeCompanyName === '1' ? 0 : 1
                    }).then(response => {
                        if (response.data.list.length > 0) {
                            this.uniqCompanyVisible = true;
                        } else {
                            this.companyMerged = false;
                            this.$Message.success(this.$t('crm.Modal.success_uniqCompanyName'));
                        }
                    });
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_emptyCompanyName'));
                }
            },
            // 联系人字段查重(邮箱/电话/WhatsApp / Instagram)
            async uniqContact({ field, value, uniqDirectly, noSuccessNotice }) {
                // 组装发送数据, 组装多语言
                const params = {
                    orgId: this.enterpriseId
                };
                let langObj = {};
                switch (field) {
                    case 'email':
                        params.email = value.trim();
                        langObj = {
                            noRepeatTip: this.$t('crm.Modal.success_uniqMail'),
                            emptyParamTip: this.$t('crm.Modal.error_noEmailToUniq')
                        };
                        break;
                    case 'phone':
                        params.phone = value.trim();
                        langObj = {
                            noRepeatTip: this.$t('crm.Modal.success_uniqPhoneNumber'),
                            emptyParamTip: this.$t('crm.Modal.error_noPhoneToUniq')
                        };
                        break;
                    case 'WhatsApp':
                        params.whatsApp = value.trim();
                        langObj = {
                            noRepeatTip: this.$t('crm.Modal.success_uniqWhatsApp'),
                            emptyParamTip: this.$t('crm.Modal.error_noWhatsAppToUniq')
                        };
                        break;
                    case 'Instagram':
                        params.instagram = value.trim();
                        langObj = {
                            noRepeatTip: this.$t('crm.Modal.success_uniqInstagram'),
                            emptyParamTip: this.$t('crm.Modal.error_noInstagramToUniq')
                        };
                        break;
                }

                if (value.trim()) {
                    // 直接打开查重框
                    if (uniqDirectly) {
                        /**
                         * @Description: 此处因为电话是批量查重, 而接口目前又没有返回是哪个电话重复, 所以无法直接打开电话查重框, 先注释掉此段代码
                         * @author 汤一飞
                         * @date 2021/3/24
                        */
                        // 退出流程
                        return;
                    }

                    // 发送请求
                    const res_uniqContact = await this.$commonApi.checkContact(params);

                    if (res_uniqContact.code === '1') {
                        this.uniqContactField = field;
                        this.uniqContactVal = value;
                        this.uniqContactVisible = true;

                        return 'repeated';
                    } else {
                        if (!noSuccessNotice) {
                            this.$Message.success(langObj.noRepeatTip);
                        }

                        return 'notRepeated';
                    }
                } else {
                    this.$Message.error(langObj.emptyParamTip);

                    return 'errorParam';
                }
            },

            // 社交平台查重
            async uniqSocialPlatforms({ attrName, attrValue }) {
                if (!attrName || !attrValue) {
                    return this.$Message.error('请先输入社交平台');
                }
                const res_uniqSocialPlatforms = await this.$commonApi.checkContact({
                    orgId: this.enterpriseId,
                    attrValue: attrValue.trim(),
                    attrName
                });

                if (res_uniqSocialPlatforms.code === '1') {
                    this.uniqSocialPlatformVal = attrValue;
                    this.uniqSocialPlatformName = attrName;
                    this.uniqSocialPlatformsVisible = true;
                } else {
                    // 弹出社交平台无重复提示
                    this.$Message.success(`${attrName}${this.$t('crm.Modal.success_uniqSocialPlatforms')}`);
                }
            },

            // 邮箱查重 + 邮箱后缀查重
            async uniqMailAndSuffix(val) {
                // 存放邮箱查重结果 + 不弹出成功提示
                const mailUniqRes = await this.uniqContact({ field: 'email', value: val, noSuccessNotice: true });

                if (mailUniqRes === 'notRepeated') {
                    // 如果邮箱未重复

                    if (this.showUniq.emailSuffix === '1') {
                        // 邮箱后缀设置查重

                        this.uniqEmailSuffix({ value: val });
                    } else {
                        // 弹出邮箱无重复提示

                        this.$Message.success(this.$t('crm.Modal.success_uniqMail'));
                    }
                }
            },

            // 邮箱后缀查重
            async uniqEmailSuffix({ value, uniqDirectly }) {
                if (value) {
                    // 直接打开查重框
                    if (uniqDirectly) {
                        /**
                         * @Description: 此处与 uniqContact 保持一致, 不直接打开查重结果框, 之后统一修改
                         * @author 汤一飞
                         * @date 2021/3/24
                         */
                        // this.uniqCompanyVisible = true;
                        // 退出流程
                        return;
                    }
                    // 发送邮箱后缀查重请求
                    const res_uniqEmailSuffix = await this.$commonApi.checkContact({
                        orgId: this.enterpriseId,
                        emailSuffix: GET_EMAIL_SUFFIX(value.trim())
                    });

                    if (res_uniqEmailSuffix.code === '1') {
                        this.uniqEmailSuffixVal = value.trim();
                        this.uniqEmailSuffixVisible = true;
                    } else {
                        // 弹出邮箱无重复提示

                        this.$Message.success(this.$t('crm.Modal.success_uniqMail'));
                    }
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_noEmailToUniq'));
                }
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    // 新建客户时点击取消或确定按钮,再次录入客户时,负责人不回填的问题
                    if (Array.isArray(this.salesList)) {
                        if (this.salesList.find(item => `${item.id}` === `${this.userId}`)) {
                            this.saleId = Number(this.userId);
                        }
                    }
                    this.transactionTime = new Date();
                    this.getAllField();
                    if (this.computed_mailAddress) {
                        this.$set(this.contact, 'email', this.computed_mailAddress);
                    }
                    if (this.computed_WAAccount) {
                        this.$set(this.contact, 'whatsApp', this.computed_WAAccount);
                    }
                    if (this.computed_WANickName) {
                        this.$set(this.contact, 'nickName', this.computed_WANickName);
                    }
                } else {
                    this.$emit('update:mailAddress', '');
                    if (this.type === 'whatsApp') {
                        this.cancel();
                    }
                }
            },
            contact_item_all: {
                handler(val) {
                    // 备份空 contact 对象
                    this.contact_backup = {};
                    // 初始化其他相关属性
                    this.contactMerged = false;
                    this.contactPictures = [];
                    if (val) {
                        val.forEach(item => {
                            switch (item.storageName) {
                                case 'phone':
                                    this.$set(this.contact_backup, item.storageName, [
                                        {
                                            phoneNumber: ''
                                        }
                                    ]);
                                    break;
                                case 'socialNetworkingPlatform':
                                    this.$set(this.contact_backup, item.storageName, [
                                        {
                                            attrName: '',
                                            attrValue: '',
                                            isShow: false
                                        }
                                    ]);
                                    break;
                                default:
                                    switch (item.colType) {
                                        case 'selectMultiple':
                                            this.$set(this.contact_backup, item.storageName, []);
                                            break;
                                        default:
                                            this.$set(this.contact_backup, item.storageName, '');
                                    }
                            }
                        });
                    }

                    // 初始化 contact + 跳转时保留已填数据
                    Object.keys(this.contact_backup).forEach(item => {
                        if (!this.contact.hasOwnProperty(item)) {
                            this.$set(
                                this.contact,
                                item,
                                JSON.parse(JSON.stringify(this.contact_backup[item]))
                            );
                        }
                    });
                },
                immediate: true
            },
            inquiry_item_all: {
                handler(val) {
                    // 备份空 inquiry 对象
                    this.inquiry_backup = {};

                    this.list_documents = [];
                    if (val) {
                        val.forEach(item => {
                            switch (item.storageName) {
                                case 'label':
                                    this.$set(this.inquiry_backup, item.storageName, []);
                                    break;
                                case 'followUp':
                                    this.$set(this.inquiry_backup, 'followUpId', '0');
                                    break;
                                case 'productCategory':
                                    const defaultOption = Array.isArray(this.computed_selectOptions.productCategory)
                                        ? this.computed_selectOptions.productCategory.find(option => option.defaultMark === 1)
                                        : null;
                                    this.$set(
                                        this.inquiry_backup,
                                        item.storageName,
                                        defaultOption ? [defaultOption.attrName] : []
                                    );
                                    break;
                                case 'inquiryScore':
                                    this.$set(this.inquiry_backup, item.storageName, 0);
                                    break;
                                default:
                                    switch (item.colType) {
                                        case 'selectMultiple':
                                            this.$set(this.inquiry_backup, item.storageName, []);
                                            break;
                                        default:
                                            this.$set(this.inquiry_backup, item.storageName, '');
                                    }
                            }
                        });
                    }
                    // 初始化 inquiry + 跳转时保留已填数据
                    Object.keys(this.inquiry_backup).forEach(item => {
                        if (
                            !this.inquiry.hasOwnProperty(item) ||
                            !this.inquiry[item] ||
                            (Array.isArray(this.inquiry[item]) &&
                            this.inquiry[item].length === 0)
                        ) {
                            this.$set(
                                this.inquiry,
                                item,
                                JSON.parse(JSON.stringify(this.inquiry_backup[item]))
                            );
                        }
                    });
                },
                immediate: true
            },
            corp_item_all: {
                handler(val) {
                    // 备份空 company 对象
                    this.company_backup = {};

                    // 初始化其他相关属性
                    this.companyMerged = false;
                    this.companyPictures = [];

                    if (val) {
                        val.forEach(item => {
                            switch (item.storageName) {
                                case 'starLevel':
                                    this.$set(this.company_backup, item.storageName, 0);
                                    break;
                                default:
                                    switch (item.colType) {
                                        case 'selectMultiple':
                                            this.$set(this.company_backup, item.storageName, []);
                                            break;
                                        default:
                                            this.$set(this.company_backup, item.storageName, '');
                                    }
                            }
                        });
                    }

                    // 初始化 company + 跳转时保留已填数据
                    Object.keys(this.company_backup).forEach(item => {
                        if (!this.company.hasOwnProperty(item)) {
                            this.$set(
                                this.company,
                                item,
                                JSON.parse(JSON.stringify(this.company_backup[item]))
                            );
                        }
                    });
                },
                immediate: true
            },
            selectOptions: {
                handler(val) {
                    const defaultOption = Array.isArray(this.computed_selectOptions.productCategory)
                        ? this.computed_selectOptions.productCategory.find(option => option.defaultMark === 1)
                        : null;
                    this.$set(
                        this.inquiry_backup,
                        'productCategory',
                        defaultOption ? [defaultOption.attrName] : []
                    );
                    this.$set(
                        this.inquiry,
                        'productCategory',
                        defaultOption ? [defaultOption.attrName] : []
                    );
                },
                immediate: true
            },
            contactAddressLatLng(val) {
                console.log('经纬度 ================= val：', val);
            }
        }
    };
</script>

<style scoped lang="less">
    .v-modal{
        display: none;
    }
    .select_company {
        position: absolute;
        right: 12px;
        bottom: -5px;
        font-size: 12px;
        height: 40px;
        color:#3B78DE;
        cursor: pointer;
    }
    .company_name_lable {
        position: relative;
        right: 12px;
    }
    .appoint-sale {
        height: 68px;
        background-color: #f0f0f0;
        line-height: 68px;
        padding-left: 15px;

        /deep/ .el-input__inner {
            font-size: 12px;
        }
    }
</style>
