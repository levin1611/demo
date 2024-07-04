<template>
    <div>
        <Modal v-if="visible"
            :visible="visible"
            :title="$t('crm.Modal.title_newCompany')"
            width="778px"
            :show-close="false"
            :append-to-body="true"
            class="modal draggable-dialog"
            :modal="false"
            v-dialog-drag
            @scroll.native.capture="close_popper"
            ref="currentModal">
                <Spin fix v-if="loading"></Spin>
                <div class="appoint-sale">
                    {{$t('clue.select_sales')}}
                    <Select filterable :placeholder="$t('crm.Modal.tip_select')" v-model="saleId"
                            style="width:230px;margin-left: 20px">
                        <Option v-for="item in saleList" :value="item.id" :label="item.fullname"></Option>
                    </Select>
                </div>
                <Form
                        ref="clueCreateCompany"
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
                        <CrmInputArea :data.sync="contact"
                            :items="contact_item_all"
                            :selectOptions="computed_selectOptions"
                            :pictures.sync="contactPictures"
                            :merged.sync="contactMerged"
                            :computed_mailAddress="email_clue"
                            :computed_WAAccount="computed_WAAccount"
                            @uniqMail="uniqMailAndSuffix"
                            @uniqPhoneNumber="uniqContact({ field: 'phone', value: $event })"
                            @uniqSocialPlatforms="uniqSocialPlatforms"
                            @uniqContact="uniqContact"></CrmInputArea>
                        <!-- 主联系人 -->
                        <div class="modalItem">
                            <p style="visibility: hidden;">_</p>
                            <div>
                                <Radio :value="true"
                                    :label="true">{{ $t('crm.Modal.mainContact') }}</Radio>
                            </div>
                        </div>
                    </div>

                    <!-- 询盘 -->
                    <h1 class="title">{{ $t('crm.Modal.title_inquiry') }}</h1>
                    <div class="wrap">
                        <!-- 通用输入区域 -->
                        <CrmInputArea :data.sync="inquiry"
                            :items="computed_inquiry_item_all"
                            :selectOptions="computed_selectOptions"
                            :transactionTime.sync="transactionTime"
                            :transactionMoney.sync="transactionMoney"
                            :transactionMoneyCurrency.sync="transactionMoneyCurrency"
                            :transactionInfo.sync="transactionInfo"
                            :estimatedInquiryAmount.sync="estimatedInquiryAmount"
                            :estimatedInquiryAmountCurrency.sync="estimatedInquiryAmountCurrency"
                        ></CrmInputArea>
                        <!-- 上传文档 -->
                        <template v-if="authorized_button['uploadDocument']">
                            <UploadDocument :documents.sync="list_documents"></UploadDocument>
                        </template>
                    </div>

                    <!-- 公司 -->
                    <h1 class="title">{{ $t('crm.Modal.title_company') }}</h1>
                    <div class="wrap">
                        <!-- 通用输入区域 -->
                        <CrmInputArea :data.sync="company"
                            :items="corp_item_all"
                            :selectOptions="computed_selectOptions"
                            :contactAddressLatLng.sync="contactAddressLatLng"
                            :pictures.sync="companyPictures"
                            :merged.sync="companyMerged"
                            :isVisible="visible"
                            :error_countryArea.sync="error_countryArea"
                            @uniqCompany="uniqCompany"></CrmInputArea>
                    </div>
                </Form>
                <div slot="footer">
                    <Button  @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                    <Button v-if="is_all_field_requested" class="ddd" :class="okEnterInquiryClass" type="primary" @click="ok" :disabled="loading">{{
                        $t('crm.Modal.modal_ok') }}
                    </Button>
                </div>
        </Modal>

        <!-- 公司名称查重 -->
        <UniqCompany :transfer="transfer"
                     :visible.sync="uniqCompanyVisible"
                     :merged.sync="companyMerged"
                     :mergedId.sync="newCompanyId"
                     :companyName.sync="company.companyName"
                     :fromClue="directCreateCustomer?false:true"
                     @customerNewContact="customerNewContact"></UniqCompany>


        <!-- 社交平台查重 -->
        <UniqSocialPlatforms
                    :uniqSocialPlatformVal="uniqSocialPlatformVal"
                    :uniqSocialPlatformName="uniqSocialPlatformName"
                    :visible.sync="uniqSocialPlatformsVisible"></UniqSocialPlatforms>

        <!-- 邮箱 / 电话 / WhatsApp / Instagram 字段查重弹窗 -->
        <UniqContact :visible.sync="uniqContactVisible"
                     :uniqField="uniqContactField"
                     :uniqVal="uniqContactVal"
                     :clueId="clueId"
                     :type="type"
                     :json_data="json_data"
                     :conversationId="conversationId"
                     :commentId="commentId"
                     @linkContactSuccess="linkContactSuccess"></UniqContact>

        <!-- 邮箱后缀查重弹窗 -->
        <UniqEmailSuffix :visible.sync="uniqEmailSuffixVisible"
                        :email="uniqEmailSuffixVal"
                        :fromClue="true"
                        @customerNewContact="customerNewContact"></UniqEmailSuffix>

        <!-- 是否要回传线索 -->
        <Modal
            :visible="visible_confirm_google"
            :modal-append-to-body='false'
            :show-close="false"
            append-to-body
            :title="$t('crm.Modal.title_returnInquiry')">
            <p style="text-align: center;">{{ $t('crm.Modal.returnInquiryToGoogleOrNot') }}</p>
            <div slot="footer">
                <Button  @click="cancel_confirm_google">{{$t('cancel')}}</Button>
                <Button v-if="is_all_field_requested" type="primary" @click="ok_confirm_google">{{$t('confirm')}}
                </Button>
            </div>
        </Modal>

        <!-- 输入自定义线索价值 -->
        <Modal
            :visible="visible_input_clueValue"
            :modal-append-to-body='false'
            :show-close="false"
            append-to-body
            :title="$t('crm.Modal.tip_inputInquiryValue')">
            <Form label-position="right" :label-width="150">
                <!-- 转化操作 -->
                <FormItem :label="$t('crm.Modal.inquiryValue')">
                    <Input v-model="clueValue" :placeholder="$t('crm.Modal.tip_inputInquiryValue')"
                           style="width: 230px;"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button  @click="visible_input_clueValue = false">{{$t('cancel')}}</Button>
                <Button v-if="is_all_field_requested" class="Google_save_inquiry" type="primary"
                        @click="ok_input_clueValue">{{$t('confirm')}}
                </Button>
            </div>
        </Modal>

        <!-- 客户下新建联系人 -->
        <NewContact :visible.sync="visible_new_contact"
                    :companyName="linkedCustomer.companyName"
                    :companyId="linkedCustomer.id"
                    :isHighSeas="!linkedCustomer.userName"
                    :clueId="clueId"
                    :ctData="contact"
                    :ctPictures="contactPictures"
                    :iqData="inquiry"
                    :iqDocuments="list_documents"
                    :computed_mailAddress="email_clue"
                    :type="type"
                    :json_data="json_data"
                    :conversationId="conversationId"
                    :commentId="commentId"
                    @uniqMailAndSuffix="uniqMailAndSuffix"
                    @uniqContact="uniqContact"
                    @newContactSuccess="linkContactSuccess"></NewContact>
    </div>
</template>

<script>
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import UniqCompany from '@/views/crm/Detail/Components/Modal/uniqCompany';
    import NewContact from '@/views/clue-manage/Detail/Components/Modal/newContact';
    import UniqContact from '@/views/crm/Detail/Components/Modal/uniqContact';
    import UniqEmailSuffix from '@/views/crm/Detail/Components/Modal/uniqEmailSuffix';
    import CrmInputArea from '@/views/crm/Detail/Components/Modal/fixed-modal-form/crm-input-area';
    import UploadDocument from '@/views/crm/Detail/Components/Html/uploadDocument';
    import UniqSocialPlatforms from '@/views/crm/Detail/Components/Modal/uniqSocialPlatforms';
    import Utils from '@/utils/index';
    import { checkContact } from '@/api/reusableApi/common';
    import { GET_EMAIL_SUFFIX } from '@/api/mail';
    import { crmCompany, crmContacts } from '@/api/crm/index';
    import { crmClue } from '@/api/crm';
    import { mapState, mapGetters } from 'vuex';
    import { triggerGtag } from '@/utils/base';

    export default {
        name: 'newCompany',
        components: {
            NewContact,
            UniqCompany,
            UniqContact,
            UniqEmailSuffix,
            CrmInputArea,
            UploadDocument,
            UniqSocialPlatforms
        },
        props: [
            'directCreateCustomer',
            'okEnterInquiryClass',
            'visible',
            'saleList',
            'clueId',
            'transfer',
            'type',
            'json_data',
            'conversationId',
            'commentId',
            'visitorId', // 访客id 适用于whl-chat、fb、WhatsApp、邮箱直接创建询盘或客户
            'mailAddress', // 邮件地址
            'WAAccount' // WhatsApp账号
        ],
        computed: {
            // 从全局store拿值
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                fieldIndex: state => state.clue.fieldIndex,
                showUniq: state => state.crm.showUniq,
                allowMerge: state => state.crm.allowMerge,
                uniqTypeCompanyName: state => state.crm.uniqTypeCompanyName,
                associated_followUpStatus_list: state => state.app.associated_followUpStatus_list,
                button_list: state => state.app.button_list,
                selectOptions: state => state.crm.selectOptions,
                socialPlatformIds: state => state.crm.socialPlatformIds
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
                if (tempIndex !== -1 && Array.isArray(this.computed_selectOptions.followUp)) {
                    /**
                     * @Description: 成交状态之后的状态都要显示成交时间和金额
                     * @author mayuanzhi
                     * @date 2020/6/8
                     */
                    const transactionStatus = this.computed_selectOptions.followUp.find(v => v.transactionStatus);
                    if ((this.current_followUp && transactionStatus && this.current_followUp.sort >= transactionStatus.sort)) {
                        const isOnlyRead = result[tempIndex].isOnlyRead;
                        result.splice(tempIndex + 1, 0, {
                            cname: this.$t('crm.Modal.transactionTime'),
                            fieldType: 'default',
                            colType: 'transactionTime',
                            mustInput: 1,
                            isOnlyRead
                        }, {
                            cname: this.$t('crm.Modal.transactionMoney'),
                            fieldType: 'default',
                            colType: 'transactionMoney',
                            maxLength: 200,
                            isOnlyRead
                        }, {
                            cname: this.$t('crm.Modal.transactionInfo'),
                            fieldType: 'default',
                            colType: 'transactionInfo',
                            maxLength: 4000,
                            isOnlyRead
                        });
                    }
                }
                return result;
            },
            // 与当前跟进状态对应的转化, 数组
            // 之前转化和跟进状态是一对一的, 但现在做了多 ads 账号绑定功能, ads 账户的转化操作跟跟进状态还是一对一, 但是不同 ads 账号可以对一个跟进状态重复创建转化操作
            related_google_conversion_list() {
                if (!this.associated_followUpStatus_list || !this.associated_followUpStatus_list.length) {
                    return [];
                }

                return this.associated_followUpStatus_list.filter(item => `${item.followupId}` === '-20');
            },
            // 直接录入客户时也要回传线索
            // 与当前跟进状态对应的转化, 数组
            // 之前转化和跟进状态是一对一的, 但现在做了多 ads 账号绑定功能, ads 账户的转化操作跟跟进状态还是一对一, 但是不同 ads 账号可以对一个跟进状态重复创建转化操作
            related_google_conversion_list_clue() {
                if (!this.associated_followUpStatus_list || !this.associated_followUpStatus_list.length) {
                    return [];
                }

                return this.associated_followUpStatus_list.filter(item => `${item.followupId}` === '-25');
            },
            current_followUp() {
                return Array.isArray(this.computed_selectOptions.followUp) ? this.computed_selectOptions.followUp.find(item => String(item.attrId) === String(this.inquiry.followUpId)) : undefined;
            },
            computed_WAAccount() {
                if (this.WAAccount) {
                    return typeof this.WAAccount === 'string'
                    ? `+${this.WAAccount.trim()}`
                    : '';
                }
            }
        },
        data() {
            return {
                // 直接新建客户时需要保存一些字段
                createCustomerObj: {},
                companyClueId: '', // 从后端请求回来的clueid

                /* 多语言 */
                lang_company: {
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
                },
                lang_contact: {
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
                },
                lang_inquiry: {
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
                },

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


                /* 性别,
                    * 单独写在这儿, 因为很神奇的, 如果直接点击改变 contact.gender , 第一次打开本模态框时点击不会更新视图, 关闭再打开又可以了
                    * 所以只能另设一个 gender 变量, 然后 watch 赋值给 contact.gender
                    */
                gender: '',

                clueDetail: {}, // 线索详情
                gclid: null, // gclid
                gclidCreateTime: null,

                /* 正体 */
                loading: false,
                saleId: '',
                contact: {},
                contact_backup: {},
                email_clue: '',
                birthdayLimit: {
                    disabledDate(date) {
                        return date && date.valueOf() > Date.now() - 86400000;
                    }
                },
                contactMerged: false,
                inquiry: {},
                inquiry_backup: {},
                company: {},
                company_backup: {},
                error_countryArea: false,
                companyMerged: false,
                list_documents: [],
                /* 图片 */
                companyPictures: [],
                contactPictures: [],
                /* 公司查重并入 */
                uniqCompanyVisible: false,
                // 社交平台查重弹窗的状态
                uniqSocialPlatformsVisible: false,
                uniqSocialPlatformVal: '',
                uniqSocialPlatformName: '',
                newCompanyId: '',
                linkedCustomer: {},
                newContactId: '',
                uniqContactVisible: false,
                uniqContactField: '',
                uniqContactVal: '',

                /* 邮箱后缀查重 */
                uniqEmailSuffixVisible: false,
                uniqEmailSuffixVal: '',

                /* 输入价值 */
                visible_confirm_google: false,
                confirm_google: false,
                clueValue: null,
                visible_input_clueValue: false,
                saveInqObj: {},
                followUpId: null,
                followUpName: null,
                obj_returnGoogle: null,

                /* 线索字段对=与 CRM 自定义字段的对应关系 */
                customCol_relation: {},

                transactionTime: new Date(),
                transactionMoney: null,
                transactionMoneyCurrency: 'CNY',
                transactionInfo: null,
                transactionStatus: {}, // 成交状态
                estimatedInquiryAmount: null,
                estimatedInquiryAmountCurrency: 'CNY',

                /* 客户下新建联系人 */
                visible_new_contact: false,

                close_popper: this.$debounce((e) => {
                    if (e && e.target && e.target.classList.contains('el-dialog__body')) {
                        // 关闭 select 下拉选框
                        const selectEl = this.$refs.currentModal.$el.querySelector('.is-focus');
                        if (selectEl) {
                            selectEl.click();
                        }
                    }
                }, undefined, true),
                contactAddressLatLng: ''
            };
        },
        methods: {
            // 直接新建客户时,从后端获取一个clueid
            getNewClueId() {
                crmClue.getClueId().then(res => {
                    // 如果是直接新建客户
                    if (res.data) {
                        this.companyClueId = res.data;
                    }
                }).catch(error => {
                    this.$Message.error(this.$t('crm.Html.empty_transactionTime'));
                    console.error(error);
                });
            },
            // 直接录入客户时,回填字段
            getCreateCustomerField() {
                const saleName = this.saleList.filter(item => { if (item.id === Number(this.json_data.userId)) return item; });
                // 如果是直接新建客户,则需要添加一些必要参数
                this.createCustomerObj = {
                    saleName: saleName.length ? saleName[0].fullname : this.fullName,
                    templateId: this.json_data.templateId,
                    visitorId: this.json_data.visitorId || this.json_data.proj,
                    proj: this.json_data.visitorId || this.json_data.proj,
                    sourceUrl: this.json_data.sourceUrl,
                    saleId: this.saleId || this.json_data.userId,
                    source: this.json_data.source,
                    sourceId: this.json_data.id,
                    sourceName: this.json_data.sourceName,
                    leadsId: this.json_data.leadsId
                };
                // 企微直接录入客户时,companySource字段放到company对象下
                if (this.type === 'enterpriseWeChat' && this.json_data.companySource) {
                    this.$set(this.company, 'companySource', this.json_data.companySource);
                }

                // 如果是fb直接录入客户,不传递proj参数
                if (this.type === 'fb_chat') {
                    delete this.createCustomerObj.proj;
                }

                // 新建客户时,数据回填
                // 处理 saleId
                if (this.saleList.some(item => `${item.id}` === `${this.json_data.saleId}`)) {
                    this.saleId = Number(this.json_data.saleId);
                } else if (this.saleList.some(item => `${item.id}` === String(this.userId))) {
                    this.saleId = Number(this.userId);
                }

                // 处理线索详情数据,回填
                for (const key in this.json_data) {
                    // 1：公司、2：联系人、3：询盘
                    for (const i in this.fieldIndex) {
                        if (key === i) {
                            switch (this.fieldIndex[i].sourceType) {
                                case 1:
                                    this.$set(this.company, this.fieldIndex[i].sourceKey, this.json_data[key]);
                                    break;
                                case 2:
                                    if (key === 'a10012') {
                                        this.$set(this.contact, 'phone', [
                                            {
                                                phoneNumber: this.json_data[key]
                                            }
                                        ]);
                                    } else if (key === 'a10014') {
                                        switch (this.json_data[key]) {
                                            case '女':
                                                this.$set(this.contact, 'gender', '2');
                                                break;
                                            case '男':
                                                this.$set(this.contact, 'gender', '1');
                                                break;
                                            default:
                                                this.$set(this.contact, 'gender', '');
                                                break;
                                        }
                                    } else if (key === 'a10013') {
                                        if (this.json_data[key] === '[]') {
                                            this.$set(this.contact, 'socialNetworkingPlatform', [{
                                                attrName: '',
                                                attrValue: '',
                                                isShow: false
                                            }]);
                                        } else {
                                            this.$set(this.contact, 'socialNetworkingPlatform', this.json_data[key].map(item => {
                                                if (item.type !== undefined && item.account !== undefined) {
                                                    return {
                                                        attrName: item.type,
                                                        attrValue: item.account,
                                                        isShow: this.socialPlatformIds.some((self) => item.type === self.attrName && self.socialValue === '1')
                                                    };
                                                } else if (item.attrName !== undefined && item.attrValue !== undefined) {
                                                    return {
                                                        attrName: item.attrName,
                                                        attrValue: item.attrValue,
                                                        isShow: this.socialPlatformIds.some((self) => item.attrName === self.attrName && self.socialValue === '1')
                                                    };
                                                }
                                            }));
                                        }
                                    } else {
                                        this.$set(this.contact, this.fieldIndex[i].sourceKey, this.json_data[key]);
                                    }
                                    break;
                                case 3:
                                    if (['a10017', 'a10018'].includes(key)) {
                                        let temp;
                                        if (this.json_data[key] && this.json_data[key].indexOf(',') !== -1) {
                                            temp = this.json_data[key].split(',');
                                        } else {
                                            temp = this.json_data[key] ? [this.json_data[key]] : [];
                                        }
                                        this.$set(this.inquiry, this.fieldIndex[i].sourceKey, temp);
                                    } else {
                                        this.$set(this.inquiry, this.fieldIndex[i].sourceKey, this.json_data[key]);
                                    }
                                    break;
                            }
                        } else {
                            // 默认字段里找不到对应的 key , 判断是否为自定义字段, 为自定义字段且在字段对应关系对象中找到了 key 的对应关系, 则继续回填
                            if (Number(key.slice(4)) > 21 && Number(key.slice(4)) <= 50 && this.customCol_relation[key]) {
                                // 在授权字段中寻找线索字段对应的 crm 字段
                                let crmField = {};
                                switch (this.customCol_relation[key].crmType) {
                                    case 1:
                                        crmField = this.corp_item_custom.filter(field => field.storageName === this.customCol_relation[key].crmColumn)[0];
                                        break;
                                    case 2:
                                        crmField = this.contact_item_custom.filter(field => field.storageName === this.customCol_relation[key].crmColumn)[0];
                                        break;
                                    case 3:
                                        crmField = this.inquiry_item_custom.filter(field => field.storageName === this.customCol_relation[key].crmColumn)[0];
                                        break;
                                }
                                // 找到, 说明已授权
                                if (crmField) {
                                    let temp;
                                    switch (crmField.colType) {
                                        // 值为字符串类型
                                        case 'text':
                                        case 'textarea':
                                        case 'select':
                                        case 'date':
                                        case 'date+time':
                                            temp = this.json_data[key];
                                            break;
                                        // 值为数组类型
                                        case 'selectMultiple':
                                            temp = [];
                                            // 线索字段对应的询盘字段可能变化, 如果类型变化, 则可能解析出来的格式不对, 无法正确显示
                                            try {
                                                if (this.json_data[key] && this.json_data[key].indexOf('[') != -1) {
                                                    temp = JSON.parse(this.json_data[key]);
                                                    if (!Array.isArray(temp)) {
                                                        temp = [];
                                                    }
                                                } else {
                                                    if (this.json_data[key] && this.json_data[key].indexOf(',') !== -1) {
                                                        temp = this.json_data[key].split(',');
                                                    } else {
                                                        temp = this.json_data[key] ? [this.json_data[key]] : [];
                                                    }
                                                }
                                            } catch (e) {
                                                console.log(e);
                                            }
                                    }
                                    switch (this.customCol_relation[key].crmType) {
                                        case 1:
                                            this.$set(this.company, this.customCol_relation[key].crmColumn, temp);
                                            break;
                                        case 2:
                                            this.$set(this.contact, this.customCol_relation[key].crmColumn, temp);
                                            break;
                                        case 3:
                                            this.$set(this.inquiry, this.customCol_relation[key].crmColumn, temp);
                                            break;
                                    }
                                } else {
                                    // 未找到, 则不参与录入, 直接原样保存
                                    switch (this.customCol_relation[key].crmType) {
                                        case 1:
                                            this.$set(this.company, this.customCol_relation[key].crmColumn, this.json_data[key]);
                                            break;
                                        case 2:
                                            this.$set(this.contact, this.customCol_relation[key].crmColumn, this.json_data[key]);
                                            break;
                                        case 3:
                                            this.$set(this.inquiry, this.customCol_relation[key].crmColumn, this.json_data[key]);
                                            break;
                                    }
                                }
                            }
                        }
                    }
                }

                if (this.contact.email) {
                    this.email_clue = this.contact.email.trim();
                }

                // 获取gclid和Gclid创建时间
                if (this.createCustomerObj.proj) {
                    this.getGclid(this.createCustomerObj.proj);
                    this.getGidCreatDate(this.createCustomerObj.proj);
                }
            },
            /* 获取已有字段 */
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
                }).then(async res => {
                    if (res.code === '1') {
                        const { customColumn, defaultColumn } = res.data;
                        defaultColumn.forEach(item => {
                            switch (`${item.parentId}`) {
                                case '1':
                                    // 字段显示为多语言
                                    if (Object.prototype.hasOwnProperty.call(this.lang_company, item.storageName)) {
                                        item.cname = this.lang_company[item.storageName];
                                    }
                                    this.$set(this.corp_columns_authorized.default, this.corp_columns_authorized.default.length, item);
                                    break;
                                case '2':
                                    // 字段显示为多语言
                                    if (Object.prototype.hasOwnProperty.call(this.lang_contact, item.storageName)) {
                                        item.cname = this.lang_contact[item.storageName];
                                    }
                                    this.$set(this.contact_columns_authorized.default, this.contact_columns_authorized.default.length, item);
                                    break;
                                case '3':
                                    // 字段显示为多语言
                                    if (Object.prototype.hasOwnProperty.call(this.lang_inquiry, item.storageName)) {
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

                        // 获取线索字段与 CRM 自定义字段的对应关系
                        await this.get_customCol_relation();
                        if (this.directCreateCustomer && Object.keys(this.json_data).length !== 0) {
                            this.getCreateCustomerField();
                        } else {
                            this.getDetail();
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_get_all_fields_for_newCreate'));
                    }
                    this.loading = false;
                });
            },
            /* 获取访客的gclid */
            getGclid(visitorId) {
                const data = {
                    visitorId
                };
                crmClue.getGclidByVisitorId(data).then(response => {
                    if (response.data) {
                        this.gclid = response.data;
                    } else {
                        this.gclid = null;
                    }
                });
            },
            /* 获取访客gclidCreateDate */
            getGidCreatDate(visitorId) {
                const params = {
                    visitorId
                };
                crmClue.getGoogleAdsInfo(params).then(response => {
                    if (response.data) {
                        this.gclidCreateTime = (new Date(response.data.create_time)).format('yyyy-MM-dd hh:mm:ss');
                    } else {
                        this.gclidCreateTime = null;
                    }
                });
            },
            async ok() {
                // 如果当前正在录入, 则退出录入
                if (this.loading) {
                    this.$Message.warning(this.$t('mail.customerBox.requestTip'));
                    return;
                }

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
                if (this.saleId == '') {
                    this.$Message.error(this.$t('clue.select_sales'));
                    return;
                }
                // 联系人邮箱不能为空
                // 放开邮箱必填 22-04-12
                // if (!(this.email_clue || this.contact.email.trim())) {
                //     this.$Message.error(this.$t('crm.Modal.error_emptyEmail'));
                //     return;
                // }
                // WhatsApp格式是否规范 & 去掉whatsApp中间的空格
                this.contact.whatsApp = this.contact.whatsApp ? this.contact.whatsApp.replace(/( )|(　)/g, '') : '';
                const whatsAppReg = Utils.regExp.whatsApp;
                if (this.contact.whatsApp && !whatsAppReg.test(this.contact.whatsApp.replace(/\s/g, ''))) {
                    this.$Message.error(this.$t('enterClue.whatsAppFormErro'));
                    return;
                }
                // 联系人姓名不能为空
                if (this.contact.nickName.trim() === '') {
                    this.$Message.error(this.$t('crm.Modal.error_emptyNickName'));
                    return;
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
                // 国家地区字段格式不符校验
                if (this.error_countryArea) {
                    this.$Message.error(this.$t('crm.Modal.error_countryAreaFormat'));
                    return;
                }
                // 处理 手机号中间的空格
                if (this.contact.phone && this.contact.phone.length) {
                    this.contact.phone.forEach(item => {
                        item.phoneNumber = item.phoneNumber.replace(/( )|(　)/g, '');
                    });
                }
                // 正则校验邮箱格式
                const emailReg = Utils.regExp.fullEmail;
                if ((this.email_clue || this.contact.email) && !emailReg.test(this.email_clue || this.contact.email.trim())) {
                    this.$Message.error(this.$t('crm.Modal.error_emailFormat'));
                    return;
                }
                // 必填字段校验
                let tempErrorField = '';
                // 联系人必填字段校验
                if (!this.contactMerged && this.contact_item_all.some(item => {
                    // 先设置当前字段为错误字段, 之后该字段验证确实未通过( return true )才会用到
                    tempErrorField = item.cname;

                    // 校验必填
                    if (item.mustInput === 1 && item.isOnlyRead !== 1) {
                        switch (item.storageName) {
                            case 'picture':
                                // contactPictures 还未放入 this.contact 中, 单独判断
                                return !(Array.isArray(this.contactPictures) && this.contactPictures.length);
                            case 'phone':
                                // 特殊字段, 值为对象数组
                                return !this.contact[item.storageName].some(item => item.phoneNumber.trim().length);
                            case 'socialNetworkingPlatform':
                                // 特殊字段, 值为对象数组
                                return !this.contact[item.storageName].some(item => item.attrName && item.attrValue.trim().length);
                            case 'email':
                                return !this.contact.email && !this.computed_mailAddress;
                            default:
                                // 其他正常字段
                                return !this.contact[item.storageName] || this.contact[item.storageName].length === 0;
                        }
                    }
                })) {
                    this.$Message.error(`${tempErrorField}${this.$t('crm.Modal.error_canNotBeEmpty')}`);
                    return;
                }
                this.inquiry.estimatedInquiryAmount = this.estimatedInquiryAmount ? Number(this.estimatedInquiryAmount.replace(/,/g, '')) : this.estimatedInquiryAmount;
                // 询盘必填字段校验
                if (this.inquiry_item_all.some(item => {
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
                }
                // 客户必填字段校验
                if (!this.companyMerged && this.corp_item_all.some(item => {
                    // 先设置当前字段为错误字段, 之后该字段验证确实未通过( return true )才会用到
                    tempErrorField = item.cname;

                    // 校验必填
                    if (item.mustInput === 1 && item.isOnlyRead !== 1) {
                        switch (item.storageName) {
                            case 'companyPicture':
                                // companyPictures 还未放入 this.company 中, 单独判断
                                return !(Array.isArray(this.companyPictures) && this.companyPictures.length);
                            default:
                                // 其他正常字段
                                return !this.company[item.storageName] || this.company[item.storageName].length === 0;
                        }
                    }
                })) {
                    this.$Message.error(`${tempErrorField}${this.$t('crm.Modal.error_canNotBeEmpty')}`);
                    return;
                }

                // 如果当前正在录入, 则退出录入
                if (this.loading) {
                    this.$Message.warning(this.$t('mail.customerBox.requestTip'));
                    return;
                }

                // 正体
                this.loading = true;
                // 设置要发送的数据的 询盘数据
                const newInquiryData = {};
                this.inquiry_item_all.forEach(item => {
                    switch (item.colType) {
                        case 'followUp':
                            newInquiryData.followUp = this.current_followUp ? this.current_followUp.attrName : null;
                            newInquiryData.followUpId = String(this.inquiry.followUpId);
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
                // 获取成交状态在跟进状态列表中的位置
                const transactionStatus = this.computed_selectOptions.followUp.find(item => item.transactionStatus);
                // 有成交状态 + 当前跟进状态位置大于等于成交状态位置 + 有成交时间, 才允许保存成交数据, 此时才需要校验长度
                if ((this.current_followUp && transactionStatus && this.current_followUp.sort >= transactionStatus.sort)) {
                    let transactionMoney = this.transactionMoney ? Number(this.transactionMoney.replace(/,/g, '')) : ''; // 成交金额
                    transactionMoney = Number.isNaN(transactionMoney) ? this.transactionMoney : transactionMoney;
                    newInquiryData.transactionMoney = transactionMoney;
                    newInquiryData.transactionMoneyCurrency = this.transactionMoneyCurrency;
                    newInquiryData.transactionInfo = this.transactionInfo;
                    newInquiryData.transactionTime = this.transactionTime.getTime(); // 成交时间,
                }
                if (this.check_length_default('inquiry_field_long_limit', newInquiryData) || this.check_length_custom('inquiry_item_custom', this.inquiry_item_custom, newInquiryData)) {
                    return false;
                }

                const contactsGoogleFBDto = {
                    visitorId: this.visitorId ? this.visitorId : this.clueDetail.proj ? this.clueDetail.proj : '',
                    gclid: this.gclid
                };
                if (this.clueDetail.source == 6 || this.clueDetail.source == 7) {
                    contactsGoogleFBDto.fbInfoId = this.clueDetail.sourceId;
                    contactsGoogleFBDto.type = this.clueDetail.source == 6 ? 1 : 2;
                }
                const tempSendData = Object.assign({
                    orgId: this.enterpriseId,
                    visitorId: this.visitorId ? this.visitorId : this.clueDetail.proj ? this.clueDetail.proj : '',
                    gclid: this.gclid,
                    clueId: this.clueId,
                    ownerId: this.saleId,
                    contactsGoogleFBDto
                }, this.remove_attr_readonly(newInquiryData, 'inquiry'));

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
                                this.$Message.warning(this.$t('crm.Modal.info_enterUniqCompanyNameLink'));
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
                            this.$Message.warning(this.$t('crm.Modal.info_enterUniqCompanyNameLink'));
                        });
                        // 停止录入操作
                        this.loading = false;
                    }
                } else {
                    // 校验国家地区, 非只读情况下
                    const temp = this.corp_item_all.find(item => item.storageName === 'countryArea');
                    if (temp && this.company.countryArea) {
                        if (temp.isOnlyRead !== 1) {
                            const dataJson = {
                                divCode: this.company.countryArea
                            };
                            const res_getCountryArea = await this.$commonApi.getDetailByCode(dataJson);
                            if (!(Array.isArray(res_getCountryArea.data) && res_getCountryArea.data.length)) {
                                this.$Message.error(this.$t('crm.Modal.error_countryAreaFormat'));
                                this.error_countryArea = true;
                                this.loading = false;
                                return;
                            }
                        }
                    }

                    if (this.loading) {
                        const tempCompanyData = Object.assign({
                            orgId: this.enterpriseId
                        }, this.company);
                        if (Object.prototype.hasOwnProperty.call(this.company, 'companyPicture')) {
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
                    // 初始化要发送的联系人数据对象
                    const temp = Object.assign({}, this.contact);
                    // 处理邮箱数据
                    temp.email = this.email_clue || (temp.email ? temp.email.trim() : '');
                    // 处理多选数据
                    this.contact_item_all.filter(item => item.colType === 'selectMultiple').forEach(item => {
                        temp[item.storageName] = Array.isArray(temp[item.storageName]) ? JSON.stringify(temp[item.storageName]) : JSON.stringify([]);
                    });
                    if (temp.email) {
                        // 邮箱去重
                        const res_uniqEmail = await crmContacts.sameContactsEmail({
                            orgId: this.enterpriseId,
                            email: temp.email
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
                                this.uniqContact({ field: 'email', value: temp.email, uniqDirectly: true });
                                // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                                setTimeout(() => {
                                    this.$Message.warning(this.$t('crm.Modal.info_enterUniqContactLink').replace(/\$field/g, this.$t('crm.Table.col_email')));
                                });
                                // 停止录入操作
                                this.loading = false;
                                return;
                            }
                        }
                    }
                    // 邮箱后缀查重
                    if (this.showUniq.emailSuffix === '1' && temp.email) {
                        const res_uniqEmailSuffix = await checkContact({
                            orgId: this.enterpriseId,
                            emailSuffix: GET_EMAIL_SUFFIX(temp.email.trim())
                        });

                        if (res_uniqEmailSuffix.code === '1') {
                            // 弹出查重框
                            this.uniqEmailSuffixVal = temp.email.trim();
                            this.uniqEmailSuffixVisible = true;

                            // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                            setTimeout(() => {
                                this.$Message.warning(this.$t('crm.Modal.info_enterUniqEmailSuffixLink').replace(/\$field/g, GET_EMAIL_SUFFIX(temp.email.trim())));
                            });

                            // 停止录入操作
                            this.loading = false;
                        }
                    }

                    // WhatsApp 查重
                    if (this.loading && this.showUniq.whatsapp === '1' && Object.prototype.hasOwnProperty.call(temp, 'whatsApp') && temp.whatsApp && temp.whatsApp.trim()) {
                        // whatsApp 查重
                        const resUniqContact = await checkContact({
                            orgId: this.enterpriseId,
                            whatsApp: temp.whatsApp.trim()
                        });

                        if (resUniqContact.code === '1') {
                            // 弹出查重框
                            this.uniqContact({ field: 'WhatsApp', value: temp.whatsApp, uniqDirectly: true });
                            // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                            setTimeout(() => {
                                this.$Message.warning(this.$t('crm.Modal.info_enterUniqContactLink').replace(/\$field/g, 'WhatsApp'));
                            });
                            // 停止录入操作
                            this.loading = false;
                        }
                    }

                    // 格式化电话(如果有此字段)
                    let phone;
                    if (Object.prototype.hasOwnProperty.call(temp, 'phone')) {
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
                                    this.$Message.warning(this.$t('crm.Modal.info_enterUniqContactLink').replace(/\$field/g, this.$t('crm.Table.col_phone')));
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
                    if (this.loading && this.showUniq.instagram === '1' && Object.prototype.hasOwnProperty.call(temp, 'instagram') && temp.instagram && temp.instagram.trim()) {
                        // Instagram 查重
                        const resUniqContact = await checkContact({
                            orgId: this.enterpriseId,
                            instagram: temp.instagram.trim()
                        });

                        if (resUniqContact.code === '1') {
                            // 弹出查重框
                            this.uniqContact({ field: 'Instagram', value: temp.instagram, uniqDirectly: true });
                            // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                            setTimeout(() => {
                                this.$Message.warning(this.$t('crm.Modal.info_enterUniqContactLink').replace(/\$field/g, 'Instagram'));
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
                        if (Object.prototype.hasOwnProperty.call(temp, 'socialNetworkingPlatform')) {
                            platform = temp.socialNetworkingPlatform.map(item => {
                                if (item.type && item.account) {
                                    return {
                                        attrId: this.getPlatformId(item.type),
                                        attrName: item.type,
                                        attrValue: item.account
                                    };
                                    /**
                                     * @Date: 2020-05-19 10:19:51
                                     * @LastEditors: niumkiki
                                     * @description: 线索里边社交平台保存的是type 和 account这两个字段,之前是用这两个字段判断的;
                                     *              但是经检查发现保存询盘已经将这两个字段转换过了, 所以需要使用下边的判断
                                     * @param :
                                     * @return:
                                     */
                                } else if (item.attrName && item.attrValue) {
                                    return {
                                        attrId: this.getPlatformId(item.attrName),
                                        attrName: item.attrName,
                                        attrValue: item.attrValue
                                    };
                                }
                            }).filter(function(item) {
                                return !(!item || item === '');
                            }); // 社交平台
                            // delete temp.socialNetworkingPlatform;
                        }
                        // 格式化联系人图片(如果有的话)
                        let picture = null;
                        if (Object.prototype.hasOwnProperty.call(temp, 'picture')) {
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
                    // 暂存当前要保存的询盘跟进状态, 方便计算
                    this.followUpId = tempSendData.followUpId;
                    this.followUpName = tempSendData.followUpName;

                    // 如果有 gclid 且有与跟进状态相关的转化, 退出流程并打开确认回传提醒框
                    if (this.gclid && this.related_google_conversion_list.length) {
                        this.loading = false;
                        this.visible_confirm_google = true;
                    }

                    // 暂存要发送的保存询盘接口数据
                    this.saveInqObj = { tempSendData, newInquiryData };

                    // 如果没有弹出确认提示框, 说明可以直接保存询盘
                    if (!this.visible_confirm_google) {
                        this.saveInquiry();
                    }
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
            // 确认要回传, 则关闭确认回传提醒框, 并判断是否需要弹出手动输入价值框, 不需要则保存询盘
            ok_confirm_google() {
                this.visible_confirm_google = false;
                this.confirm_google = true;

                // 如果当前选择的跟进状态有关联的转化, 且此转化要求使用自定义价值, 则显示输入价值框, 否则直接保存(依然会调用转化).
                // 暂存"第一个需要输入价值的转化操作"的默认价值
                let defaultValue = null;
                if (this.related_google_conversion_list.length && this.related_google_conversion_list.some(item => {
                    if (`${item.useRevenueValue}` === '2') {
                        defaultValue = item.defaultRevenueValue;
                        return true;
                    }
                })) {
                    this.visible_input_clueValue = true;
                    this.clueValue = defaultValue;
                } else {
                    this.saveInquiry();
                }
            },
            // 确定不回传, 关闭提醒框, 保存询盘
            cancel_confirm_google() {
                this.visible_confirm_google = false;
                this.confirm_google = false;
                this.$Message.success(this.$t('googleOptimize.submitManualBack'));
                this.saveInquiry();
            },
            // 手动输入线索价值完成, 判断输入是否为合法正数, 不是则弹出提醒, 是则关闭弹框并保存询盘
            ok_input_clueValue() {
                if (/^(\d+)(\.\d+)?$/.test(this.clueValue)) {
                    this.visible_input_clueValue = false;
                    this.saveInquiry();
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_valueFormatError'));
                }
            },
            // 保存询盘
            saveInquiry() {
                // 为防止中途有弹窗中断过保存询盘流程, 先置 loading 为 true
                this.loading = true;
                // 从暂存对象中取出数据
                const { tempSendData, newInquiryData } = this.saveInqObj;

                // 新建客户时,需要删除clueId字段
                if (Object.keys(this.createCustomerObj).length !== 0) {
                    delete tempSendData.clueId;
                    this.createCustomerObj.companyClueId = this.companyClueId;
                    for (const i in this.createCustomerObj) {
                        tempSendData[i] = this.createCustomerObj[i];
                    }
                }

                // 暂存线索价值, 之后重置线索价值为 null
                const clueValue = this.clueValue;
                this.clueValue = null;
                // 原发送请求部分
                const dataJson = JSON.stringify(tempSendData);
                // 保存询盘接口和原
                triggerGtag('CRM', '询盘');
                crmClue.inquiryCommonSave(dataJson).then(async response => {
                    if (response.code === '1') {
                        // 合并线索备注和跟进记录
                        this.mergeFollowUps(response.data.inquiryId);

                        if (this.gclid) {
                            this.obj_returnGoogle = {
                                attrId: tempSendData.followUpId,
                                attrName: tempSendData.followUp,
                                inquiryId: response.data.inquiryId,
                                clueId: this.clueId || this.companyClueId,
                                clueValue
                            };
                            await this.update_google_status();
                        }

                        // 更改线索跟进状态
                        this.change_status(response.data.clueId);
                        this.returnChangeStatus(response.data.clueId, response.data.companyId);
                        // 更新cinnox昵称
                        if (this.type === 'smsChat') {
                            console.error('tempSendData', tempSendData);
                            this.$store.commit('setSmsNickName', tempSendData.contacts);
                        }
                        this.$Message.success(this.$t('crm.Modal.success_newCompany'));
                        this.$emit('saveSuccess', {
                            inquiryId: response.data.inquiryId,
                            contactsId: response.data.contactsId,
                            confirm_google: this.confirm_google
                        });
                        /**
                         * @Description: 录入询盘完成后调用客户箱手动归并的接口
                         * @author 杨娣
                         * @date 2019/10/12
                         */
                        /**
                         * @Description: 客户箱归并接口所传的createUserId应为新建询盘时选择的负责人id
                         * @author 杨娣
                         * @date 2020/5/27
                        */
                        // 联系人邮箱关联到邮件系统
                        if (tempSendData.contacts && tempSendData.contacts.email) {
                            const data = {
                                address: tempSendData.contacts.email,
                                createUserId: tempSendData.ownerId,
                                orgId: this.enterpriseId,
                                contactsId: response.data.contactsId,
                                contactsName: tempSendData.contacts.nickName,
                                companyId: response.data.companyId,
                                inquiryId: response.data.inquiryId,
                                clueId: this.clueId
                            };
                            const params = {
                                emailAddress: tempSendData.contacts.email,
                                createUserId: this.saleId,
                                orgId: this.enterpriseId,
                                inquiryId: response.data.inquiryId
                            };
                            crmClue.mergerMail(params).then(response => {});
                            crmClue.addTimeAxis(data).then(response => {});
                        }

                        // 保存询盘文档
                        if (this.list_documents.length) {
                            this.list_documents.forEach(({ name, url, suffix }) => {
                                const data = {
                                    documentName: name,
                                    documentPath: url,
                                    documentType: suffix,
                                    orgId: this.enterpriseId,
                                    createUserId: this.userId,
                                    createUser: this.fullName,
                                    foreignKey: response.data.inquiryId,
                                    foreignType: 3
                                };
                                crmClue.documentSave(data).then(response => {
                                    if (response.code === '1') {
                                        this.$saveLog({
                                            operateType: 4,
                                            operateModule: 5,
                                            inquiryId: response.data.inquiryId,
                                            userId: this.userId,
                                            fullName: this.fullName,
                                            currentObj: { name },
                                            enterpriseId: this.enterpriseId
                                        });
                                    } else {
                                        this.$Message.error({
                                            message: `${this.$t('crm.Html.error_saveFile')}: ${name}`,
                                            duration: 0,
                                            closable: true
                                        });
                                    }
                                });
                            });
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
                         * @date 2020/6/14
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
            },
            cancel() {
                // 将directCreateCustomer值修改为false directCreateCustomer:表示直接新建客户
                this.$emit('update:directCreateCustomer', false);
                this.createCustomerObj = {}; // 防止录线索时,将clueId删除
                this.companyClueId = ''; // 置空获取到的clueId

                this.loading = false;
                this.saleId = '';
                this.clueDetail = {};
                this.gclid = null;
                this.gclidCreateTime = null;
                this.$emit('update:visible', false); // 改变父组件的 控制本组件显示 属性
                // 联系人部分
                this.contact = this.$deepClone(this.contact_backup);
                this.email_clue = '';
                this.gender = '';
                this.contactMerged = false;
                this.contactPictures = [];
                this.newContactId = '';
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

                this.transactionTime = new Date();
                this.transactionMoney = null;
                this.transactionMoneyCurrency = 'CNY';
                this.transactionInfo = null;
                this.transactionStatus = {};

                // 关闭所有 modal
                this.visible_new_contact = false;
                this.visible_input_clueValue = false;
                this.visible_confirm_google = false;
                this.uniqContactVisible = false;
                this.uniqCompanyVisible = false;
                this.uniqEmailSuffixVisible = false;
            },
            // 去除只读属性, 无论是否只读都为必填属性除外
            remove_attr_readonly(data, type) {
                return data;
            },
            addPhone() {
                if (!this.contactMerged) {
                    this.contact.phone.push({ phoneNumber: '' });
                }
            },
            deletePhone(index) {
                if (!this.contactMerged) {
                    this.contact.phone.splice(index, 1);
                }
            },
            addPlatform() {
                if (!this.contactMerged) {
                    this.contact.socialNetworkingPlatform.push({
                        attrName: '',
                        attrValue: ''
                    });
                }
            },
            deletePlatform(index) {
                if (!this.contactMerged) {
                    this.contact.socialNetworkingPlatform.splice(index, 1);
                }
            },
            getPlatformId(type) {
                let result = '';
                this.selectOptions.socialNetworkingPlatform.some(i => {
                    if (i.attrName === type) {
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
                            selectedLabels.push({ attrId, attrName, attrValue, orgId, typeId, belongTable });
                            return true;
                        }
                    });
                }
                return selectedLabels;
            }, // 通过 Select 绑定的被选中标签名称数组获取其他数据并格式化
            changeDate(date, timeType, key, infoType) {
                if (key === 'birthday') {
                    this.contact.birthday = (new Date(date)).format('yyyy-MM-dd');
                } else {
                    switch (timeType) {
                        case 'date':
                            this[infoType][key] = (new Date(date)).format('yyyy-MM-dd');
                            break;
                        case 'date+time':
                            this[infoType][key] = (new Date(date)).format('yyyy-MM-dd hh:mm:ss');
                    }
                }
            },
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
                    };
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
            // 客户下新建联系人
            customerNewContact(customer) {
                this.linkedCustomer = customer;
                this.visible_new_contact = true;
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
                    // 发送请求
                    const resUniqContact = await checkContact(params);

                    if (resUniqContact.code === '1') {
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
                    // 发送邮箱后缀查重请求
                    const res_uniqEmailSuffix = await checkContact({
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
            },

            // 社交平台查重
            async uniqSocialPlatforms({ attrName, attrValue }) {
                if (!attrName || !attrValue) {
                    return this.$Message.error('请先输入社交平台');
                }
                const res_uniqSocialPlatforms = await checkContact({
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

            // 关联已有联系人成功
            linkContactSuccess({ inquiryId, contactsId }) {
                // 更改线索跟进状态
                this.change_status();
                this.returnChangeStatus();
                this.$emit('saveSuccess', {
                    inquiryId,
                    contactsId,
                    confirm_google: this.confirm_google
                });

                this.cancel();
            },

            // 回传 google
            update_google_status() {
                const _this = this;
                return new Promise((resolve, reject) => {
                    if (!this.obj_returnGoogle) {
                        resolve(false);
                        return undefined;
                    }

                    // 暂存数据,防止async函数中第一接口执行后,后面的接口可能取不到之前的值
                    const objData = {
                        gclid: this.gclid, // gclid
                        gclidCreateTime: this.gclidCreateTime, // gclid创建日期
                        visitorId: this.clueDetail.proj || this.createCustomerObj.proj // 访客id
                    };

                    // 回传询盘
                    function saveAudit() {
                        // 如果当前跟进状态有对应的转化
                        if (_this.related_google_conversion_list.length) {
                            // 数据处理
                            const dataList = _this.related_google_conversion_list.map(item => {
                                // 定义线索价值
                                let value = 0;
                                // 如果转化要求使用自定义价值, 则把填入之前输入的线索价值
                                if (String(item.useRevenueValue) === '2') {
                                    value = _this.obj_returnGoogle.clueValue;
                                    // 如果转化要求使用默认价值, 则把填入转化定义时的默认价值
                                } else if (`${item.useRevenueValue}` === '1') {
                                    value = item.defaultRevenueValue;
                                }

                                return {
                                    orgId: _this.enterpriseId, // 组织机构编码
                                    clueId: _this.obj_returnGoogle.clueId, // 线索id
                                    inquiryId: _this.obj_returnGoogle.inquiryId, // 询盘id
                                    visitorId: objData.visitorId, // 访客id
                                    gclid: objData.gclid, // gclid
                                    gclidCreateDate: objData.gclidCreateTime, // gclid创建日期
                                    presentFollowup: '询盘', // 当前跟进状态
                                    presentFollowupId: -20, // 当前跟进状态id
                                    presentSumbitPerson: _this.fullName, // 当前登录用户名称
                                    presentSumbitPersonId: _this.userId, // 当前登录用户id
                                    presentNeedAudit: _this.confirm_google ? 1 : 2, // 1提交审核，2不审核
                                    conversionId: item.conversionId, // 关联的转化id(presentNeedAudit为2不提交审核时不用传)
                                    useRevenueValue: _this.confirm_google ? item.useRevenueValue : null, // 使用价值类型(1,"每次使用默认值",2,"每次使用不同的值",3,"不使用价值")(presentNeedAudit为2不提交审核时不用传)
                                    value: _this.confirm_google ? value : 0, // 价值(presentNeedAudit为2不提交审核时不用传)
                                    customerId: item.customerId, // 关联转化的 ads 账户 id
                                    adsCustomerName: item.adsCustomerName // 关联转化的 ads 账户 name
                                };
                            });

                            // 发送请求
                            crmClue.conversionSaveAudit(dataList).then(response => {
                                if (response.code === '1') {
                                    if (_this.confirm_google) {
                                        _this.$Message.success(_this.$t('googleOptimize.submitAuditSuccess'));
                                    }
                                    resolve(true);
                                } else {
                                    resolve(false);
                                    _this.$Message.error(_this.$t('googleOptimize.submitAuditFail') + _this.$t('crm.Modal.success_manualBack'));
                                }
                            }).catch(() => {
                                resolve(false);
                                _this.$Message.error(_this.$t('googleOptimize.submitAuditFail') + _this.$t('crm.Modal.success_manualBack'));
                            });
                        } else {
                            const data = {
                                orgId: _this.enterpriseId, // 组织机构编码
                                clueId: _this.obj_returnGoogle.clueId, // 线索id
                                inquiryId: _this.obj_returnGoogle.inquiryId, // 询盘id
                                visitorId: objData.visitorId, // 访客id
                                gclid: objData.gclid, // gclid
                                gclidCreateDate: objData.gclidCreateTime, // gclid创建日期
                                presentFollowup: '询盘', // 当前跟进状态
                                presentFollowupId: -20, // 当前跟进状态id
                                presentSumbitPerson: _this.fullName, // 当前登录用户名称
                                presentSumbitPersonId: _this.userId, // 当前登录用户id
                                presentNeedAudit: 2, // 1提交审核，2不审核
                                value: 0 // 价值(presentNeedAudit为2不提交审核时不用传),
                            };
                            // 手动回传
                            crmClue.conversionSaveAudit([data]).catch(() => {
                                resolve(false);
                            });
                            resolve(true);
                        }
                    }

                    // 回传线索
                    if (this.directCreateCustomer) {
                        // 要发送的 data
                        const data = {
                            orgId: this.enterpriseId, //
                            clueId: this.companyClueId, // 线索id，必传
                            visitorId: objData.visitorId, // 访客id
                            gclid: objData.gclid, // gclid
                            gclidCreateDate: objData.gclidCreateTime, // gclid创建日期
                            presentSumbitPerson: this.fullName, // 当前提交人名称
                            presentSumbitPersonId: this.userId, // 当前提交人，即userId
                            presentFollowupId: -25, // 当前跟进状态id，接口1中可获取
                            presentFollowup: '线索', // 当前跟进状态，接口1中可获取
                            presentNeedAudit: 2, // 是否需要提交审核，1需要2不需要
                            value: 0
                        };

                        // 判断是否需要传 conversionId
                        if (this.related_google_conversion_list_clue.length) {
                            const dataList = this.related_google_conversion_list_clue.map(item => {
                                return Object.assign({
                                    conversionId: item.conversionId,
                                    customerId: item.customerId,
                                    adsCustomerName: item.adsCustomerName
                                }, data);
                            });

                            crmClue.conversionSaveAudit(dataList).then(res => {
                                if (res.code !== '1') {
                                    this.$Message.error(this.$t('googleOptimize.failedToReturnTheLead'));
                                }
                                saveAudit();
                            }).catch(() => {
                                this.$Message.error(this.$t('googleOptimize.failedToReturnTheLead'));
                                saveAudit();
                            });
                        } else {
                            crmClue.conversionSaveAudit([data]).then(res => {
                                if (res.code !== '1') {
                                    this.$Message.error(this.$t('googleOptimize.failedToReturnTheLead'));
                                }
                                saveAudit();
                            }).catch(() => {
                                this.$Message.error(this.$t('googleOptimize.failedToReturnTheLead'));
                                saveAudit();
                            });
                        }
                    } else {
                        saveAudit();
                    }
                });
            },

            /* 获取线索详情 */
            getDetail() {
                if (!this.clueId) {
                    if (this.saleList.find(item => `${item.id}` === `${this.userId}`)) {
                        this.saleId = Number(this.userId);
                    }
                    return;
                }
                this.saleId = '';
                this.loading = true;
                const data = {
                    id: this.clueId,
                    userId: this.userId,
                    isEdit: 1
                };
                crmClue.getColumnValue(data).then(res => {
                    if (res.code === '1') {
                        this.clueDetail = res.data;

                        // 回填线索详情数据到数据对象
                        (async () => {
                            await this.get_customCol_relation();
                            // 之前的写法是: if (this.clueDetail) ; 发现: this.clueDetail为{}时,也能进这个判断条件内
                            if (Object.keys(this.clueDetail).length !== 0) {
                                // 处理 saleId
                                if (this.saleList.some(item => `${item.id}` === `${this.clueDetail.saleId}`)) {
                                    this.saleId = Number(this.clueDetail.saleId);
                                } else if (this.saleList.some(item => `${item.id}` === String(this.userId))) {
                                    this.saleId = Number(this.userId);
                                }

                                // 处理线索详情数据
                                Object.keys(this.clueDetail).forEach(key => {
                                    if (key.startsWith('a100') && this.clueDetail[key]) {
                                        // 如果该字段有内容 就回显在页面上
                                        /* 要求不管字段是否有授权, 都要回填到数据对象保存 */

                                        // 产品要求,新建询盘时,将姓名回填到公司名称
                                        if (key === 'a1009' && this.type === 'whatsApp') {
                                            this.$set(this.company, 'companyName', this.clueDetail[key]);
                                        }

                                        if (key === 'a10012') {
                                            this.$set(this.contact, 'phone', [
                                                {
                                                    phoneNumber: this.clueDetail[key]
                                                }
                                            ]);
                                        } else if (key === 'a10013') {
                                            if (this.clueDetail[key] === '[]') {
                                                this.$set(this.contact, 'socialNetworkingPlatform', [{
                                                    attrName: '',
                                                    attrValue: '',
                                                    isShow: false
                                                }]);
                                            } else {
                                                this.$set(this.contact, 'socialNetworkingPlatform', JSON.parse(this.clueDetail[key]).map(item => {
                                                    if (item.type !== undefined && item.account !== undefined) {
                                                        return {
                                                            attrName: item.type,
                                                            attrValue: item.account,
                                                            isShow: this.socialPlatformIds.some((self) => item.type === self.attrName && self.socialValue === '1')
                                                        };
                                                    } else if (item.attrName !== undefined && item.attrValue !== undefined) {
                                                        return {
                                                            attrName: item.attrName,
                                                            attrValue: item.attrValue,
                                                            isShow: this.socialPlatformIds.some((self) => item.attrName === self.attrName && self.socialValue === '1')
                                                        };
                                                    }
                                                }));
                                            }
                                        } else if (key === 'a10014') {
                                            switch (this.clueDetail[key]) {
                                                case '女':
                                                    this.$set(this.contact, 'gender', '2');
                                                    break;
                                                case '男':
                                                    this.$set(this.contact, 'gender', '1');
                                                    break;
                                                default:
                                                    this.$set(this.contact, 'gender', '');
                                                    break;
                                            }
                                        } else if (key === 'a10017') {
                                            let labels = this.clueDetail[key];
                                            if (!labels) {
                                                labels = [];
                                            } else {
                                                try {
                                                    labels = JSON.parse(this.clueDetail[key]);
                                                } catch (error) {
                                                    labels = [];
                                                    console.error(error);
                                                }
                                            }
                                            this.$set(this.inquiry, 'label', Array.isArray(labels) ? labels : []);
                                        } else if (key === 'a10018') {
                                            this.$set(this.inquiry, 'productCategory', this.$options.filters.parseArray(this.clueDetail[key]).length ? this.$options.filters.parseArray(this.clueDetail[key]) : (this.clueDetail[key] === '[]' ? [] : [this.clueDetail[key]]));
                                        } else if (this.fieldIndex[key] !== undefined) {
                                            // 在默认字段对象中找到了对应的 key , 随后根据默认字段所属的对象进行处理
                                            switch (this.fieldIndex[key].sourceType) {
                                                case 1:
                                                    this.$set(this.company, this.fieldIndex[key].sourceKey, this.clueDetail[key]);
                                                    break;
                                                case 2:
                                                    this.$set(this.contact, this.fieldIndex[key].sourceKey, this.clueDetail[key]);
                                                    break;
                                                case 3:
                                                    this.$set(this.inquiry, this.fieldIndex[key].sourceKey, this.clueDetail[key]);
                                                    break;
                                            }
                                        } else {
                                            // 默认字段里找不到对应的 key , 判断是否为自定义字段, 为自定义字段且在字段对应关系对象中找到了 key 的对应关系, 则继续回填
                                            if (Number(key.slice(4)) > 21 && Number(key.slice(4)) <= 50 && this.customCol_relation[key]) {
                                                // 在授权字段中寻找线索字段对应的 crm 字段
                                                let crmField = {};
                                                switch (this.customCol_relation[key].crmType) {
                                                    case 1:
                                                        crmField = this.corp_item_custom.filter(field => field.storageName === this.customCol_relation[key].crmColumn)[0];
                                                        break;
                                                    case 2:
                                                        crmField = this.contact_item_custom.filter(field => field.storageName === this.customCol_relation[key].crmColumn)[0];
                                                        break;
                                                    case 3:
                                                        crmField = this.inquiry_item_custom.filter(field => field.storageName === this.customCol_relation[key].crmColumn)[0];
                                                        break;
                                                }
                                                // 找到, 说明已授权
                                                if (crmField) {
                                                    let temp;
                                                    switch (crmField.colType) {
                                                        // 值为字符串类型
                                                        case 'text':
                                                        case 'textarea':
                                                        case 'select':
                                                        case 'date':
                                                        case 'date+time':
                                                            temp = this.clueDetail[key];
                                                            break;
                                                        // 值为数组类型
                                                        case 'selectMultiple':
                                                            temp = [];
                                                            // 线索字段对应的询盘字段可能变化, 如果类型变化, 则可能解析出来的格式不对, 无法正确显示
                                                            try {
                                                                if (this.clueDetail[key] && this.clueDetail[key].indexOf('[') != -1) {
                                                                    temp = JSON.parse(this.clueDetail[key]);
                                                                    if (!Array.isArray(temp)) {
                                                                        temp = [];
                                                                    }
                                                                } else {
                                                                    temp = this.clueDetail[key];
                                                                }
                                                            } catch (e) {
                                                                console.log(e);
                                                            }
                                                    }
                                                    switch (this.customCol_relation[key].crmType) {
                                                        case 1:
                                                            this.$set(this.company, this.customCol_relation[key].crmColumn, temp);
                                                            break;
                                                        case 2:
                                                            this.$set(this.contact, this.customCol_relation[key].crmColumn, temp);
                                                            break;
                                                        case 3:
                                                            this.$set(this.inquiry, this.customCol_relation[key].crmColumn, temp);
                                                            break;
                                                    }
                                                } else {
                                                    // 未找到, 则不参与录入, 直接原样保存
                                                    switch (this.customCol_relation[key].crmType) {
                                                        case 1:
                                                            this.$set(this.company, this.customCol_relation[key].crmColumn, this.clueDetail[key]);
                                                            break;
                                                        case 2:
                                                            this.$set(this.contact, this.customCol_relation[key].crmColumn, this.clueDetail[key]);
                                                            break;
                                                        case 3:
                                                            this.$set(this.inquiry, this.customCol_relation[key].crmColumn, this.clueDetail[key]);
                                                            break;
                                                    }
                                                }
                                            }
                                        }
                                        // 看是否需要回填产品分类默认选项
                                        if (Array.isArray(this.inquiry.productCategory) && this.inquiry.productCategory.length === 0) {
                                            const defaultOption = Array.isArray(this.computed_selectOptions.productCategory) ? this.computed_selectOptions.productCategory.find(option => option.defaultMark === 1) : null;
                                            this.$set(this.inquiry, 'productCategory', defaultOption ? [defaultOption.attrName] : []);
                                        }
                                    }
                                });
                                this.$set(this.company, 'companySourceWay', this.clueDetail.a10056);
                            }
                            if (this.contact.email) {
                                this.email_clue = this.contact.email.trim();
                            }

                            this.$forceUpdate();

                            if (res.data.proj) {
                                this.getGclid(res.data.proj);
                                this.getGidCreatDate(res.data.proj);
                            }
                        })();
                    } else {
                        this.$Message.error(this.$t('clue.error_getClueDetail'));
                    }
                    this.loading = false;
                });
            },
            /* 获取线索字段与 CRM 自定义字段的对应关系 */
            get_customCol_relation() {
                return new Promise(resolve => {
                    this.customCol_relation = {};
                    // 如果有自定义字段, 则请求字段对应关系, 请求完成后再往下执行
                    if (Object.keys(this.clueDetail).some(key => key.startsWith('a100') && Number(key.slice(4)) > 21) ||
                        (this.directCreateCustomer && Object.keys(this.json_data).some(key => key.startsWith('a100') && Number(key.slice(4)) > 21))) {
                        const params = {
                            orgId: this.enterpriseId
                        };
                        crmClue.selectListByOrgId(params).then(res => {
                            if (res.code === '1') {
                                // 从字段对应关系中筛选出自定义字段对应关系
                                const temp_customCol_relation = Array.isArray(res.data) ? res.data.filter(item => item.column.startsWith('a100') && Number(item.column.slice(4)) > 21) : [];
                                // 如果字段对应关系数组为空, 且线索模板表不为空, 说明现在还是老版本(CRM 自定义字段长度每类 8 个), 将老版本数据按新版的格式重新构造, 这样保存线索模板时, 自定义字段就是按新版的来了.
                                const allCol_relation = Array.isArray(res.data) ? res.data : [];
                                if (Object.keys(this.clueDetail).filter(key => key.startsWith('a100')).length !== 0 && !allCol_relation.length) {
                                    Object.keys(this.clueDetail).filter(key => key.startsWith('a100') && Number(key.slice(4)) > 21).forEach(key => {
                                        const relation = {
                                            column: key,
                                            crmColumn: key,
                                            crmType: this.getColType(key)
                                        };

                                        if (relation.crmType) {
                                            temp_customCol_relation.push(relation);
                                        }
                                    });
                                }
                                this.customCol_relation = Object.assign({}, ...temp_customCol_relation.map(item => {
                                    const temp = {};
                                    temp[item.column] = {
                                        column: item.column,
                                        crmColumn: item.crmColumn,
                                        crmType: item.crmType
                                    };
                                    return temp;
                                }));
                            } else {
                                this.$Message.error('请求线索字段与询盘字段对应关系失败!');
                            }
                            resolve(true);
                        }).catch(err => {
                            resolve(true);
                            console.error(err);
                        });
                    } else {
                        resolve(true);
                    }
                });
            },
            /* 获取字段来源 1：公司、2：联系人、3：询盘 */
            getColType(col) {
                switch (col) {
                    case 'a1001':
                    case 'a1002':
                    case 'a1003':
                    case 'a1004':
                    case 'a1005':
                    case 'a1006':
                    case 'a1007':
                    case 'a1008':
                    case 'a10026':
                    case 'a10027':
                    case 'a10028':
                    case 'a10029':
                    case 'a10030':
                    case 'a10031':
                    case 'a10032':
                    case 'a10033':
                        return 1;
                    case 'a1009':
                    case 'a10010':
                    case 'a10011':
                    case 'a10012':
                    case 'a10013':
                    case 'a10014':
                    case 'a10015':
                    case 'a10034':
                    case 'a10035':
                    case 'a10036':
                    case 'a10037':
                    case 'a10038':
                    case 'a10039':
                    case 'a10040':
                    case 'a10041':
                        return 2;
                    case 'a10016':
                    case 'a10017':
                    case 'a10018':
                    case 'a10019':
                    case 'a10020':
                    case 'a10021':
                    case 'a10042':
                    case 'a10043':
                    case 'a10044':
                    case 'a10045':
                    case 'a10046':
                    case 'a10047':
                    case 'a10048':
                    case 'a10049':
                        return 3;
                    case 'a10022':
                    case 'a10023':
                    case 'a10024':
                    case 'a10025':
                    case 'a10050':
                        break;
                }
            },

            /* 线索备注转询盘跟进 */
            mergeFollowUps(inquiryId) {
                const data = {
                    orgId: this.enterpriseId,
                    clueId: this.clueId,
                    inquiryId,
                    saleId: this.saleId
                };
                crmClue.batchSaveFollowupToInquiry(data).then(res => {
                    if (res.code !== '1') {
                        this.$Message.error(this.$t('clue.error_mergeClueRemarks'));
                    }
                });
            },
            /**
             * @Date: 2020-06-04 11:32:51
             * @LastEditors: niumkiki
             * @description: 原来修改访客或fb状态的接口是在修改线索状态接口调用完之后再调用
             *               后端让改成同步的，状态修改是否成功由后端去确认
             * @param :
             * @return:
             */
            returnChangeStatus(clueId, companyId) {
                switch (this.type) {
                    case 'fb_chat':
                    case 'fb_comment':
                        this.$emit('updateInquiryStatus', clueId || this.clueId, 102);
                        break;
                    case 'floating_fb':
                        this.$emit('updateInquiryStatus', clueId || this.clueId, 102);
                        break;
                    case 'mail':
                        if (this.userId !== String(this.saleId)) {
                            this.$emit('updateInquiryStatus', companyId, 3);
                        } else if (this.saleId === -1) {
                            this.$emit('updateInquiryStatus', companyId, 1);
                        } else {
                            this.$emit('updateInquiryStatus', companyId, 2);
                        }
                        break;
                    case 'whatsApp':
                    case 'enterpriseWeChat': // 企微
                    case 'smsChat': // sms聊天
                        this.$emit('updateInquiryStatus', clueId || this.clueId, 1);
                        break;
                    default:
                        this.$emit('returnUpdateStatus', clueId || this.clueId, 102);
                        this.$emit('changeStatusSuccess');
                }
            },
            /* 改变线索跟进状态为询盘 */
            change_status(clueIds) {
                const clueId = clueIds || this.clueId;
                const data = {
                    orgId: this.enterpriseId,
                    clueId: clueId,
                    status: 3,
                    userId: this.userId,
                    userName: this.fullName
                };
                crmClue.setInquiringForWeb(data.status, data).then(res => {
                    if (res.code !== '1') {
                        this.$Message.error(this.$t('clue.status_failed'));
                    }
                });
            }
        },
        created() {
        },
        watch: {
            gender(val) {
                this.contact.gender = val;
            },
            visible(val) {
                if (val) {
                    this.transactionTime = new Date();
                    this.getAllField();
                    this.obj_returnGoogle = null;

                    // 获取最新的跟进状态关联的 google 转化
                    this.$store.commit('get_associated_followUpStatus_list', this.enterpriseId);

                    // 直接新建客户时,获取一下clueid
                    if (this.directCreateCustomer) {
                        this.getNewClueId();
                    }
                }
            },
            contact_item_all: {
                handler(val) {
                    // 初始化 contact_backup 为空对象
                    this.contact_backup = {};

                    // 初始化其他相关属性
                    this.contactMerged = false;
                    this.contactPictures = [];

                    if (val) {
                        val.forEach(item => {
                            switch (item.storageName) {
                                case 'phone':
                                    this.$set(this.contact_backup, 'phone', [
                                        {
                                            phoneNumber: ''
                                        }
                                    ]);
                                    break;
                                case 'socialNetworkingPlatform':
                                    this.$set(this.contact_backup, 'socialNetworkingPlatform', [
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
                    // 备份初始对象
                    this.contact = this.$deepClone(this.contact_backup);
                    if (this.mailAddress) {
                        this.$set(this.contact, 'email', this.mailAddress);
                        this.email_clue = this.mailAddress;
                    }
                    if (this.json_data && this.json_data.nickName) {
                        this.$set(this.contact, 'nickName', this.json_data.nickName);
                    }
                    if (this.computed_WAAccount) {
                        this.$set(this.contact, 'whatsApp', this.computed_WAAccount);
                    }
                },
                immediate: true
            },
            inquiry_item_all: {
                handler(val) {
                    // 初始化 inquiry_backup 为空对象
                    this.inquiry_backup = {};

                    this.uploadController_file ? this.uploadController_file.unsubscribe() : undefined;
                    this.uploadController_file = null;
                    this.list_documents = [];

                    if (val) {
                        val.forEach(item => {
                            switch (item.storageName) {
                                case 'label':
                                    this.$set(this.inquiry_backup, 'label', []);
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
                                case 'followUp':
                                    this.$set(this.inquiry_backup, 'followUpId', '0');
                                    break;
                                case 'inquiryScore':
                                    this.$set(this.inquiry_backup, 'inquiryScore', 0);
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
                    // 备份初始对象
                    this.inquiry = this.$deepClone(this.inquiry_backup);
                },
                immediate: true
            },
            corp_item_all: {
                handler(val) {
                    // 初始 company_backup 为空对象
                    this.company_backup = {};

                    // 初始化其他相关属性
                    this.companyMerged = false;
                    this.companyPictures = [];

                    if (val) {
                        val.forEach(item => {
                            switch (item.storageName) {
                                case 'starLevel':
                                    this.$set(this.company_backup, 'starLevel', 0);
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

                    // 备份初始对象
                    this.company = this.$deepClone(this.company_backup);
                },
                immediate: true
            }
        }
    };
</script>

<style scoped lang="less">
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
