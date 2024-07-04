<template>
    <div>
        <Modal :visible="visible"
               :title="$t('crm.Modal.title_newInquiry')"
               width="778px"
               class="modal draggable-dialog"
               :modal="false"
               :show-close="true"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               :append-to-body="true"
               v-dialog-drag
               @scroll.native.capture="close_popper"
               @close="cancel"
               ref="currentModal">
            <!-- loading -->
            <Spin fix v-if="loading"></Spin>
            <Form
                    ref="newInquiryForm"
                    :inline="true"
                    :validate-on-rule-change="false"
                    class="_form-custom"
                    label-position="right"
                    label-width="115px"
            >
                <!-- 顶部导航，添加选择询盘 -->
                <template v-if="modelType === 'quickEntrance'">
                    <div style="display: flex;" class="_form_margin">
                        <FormItem :required="true" class="width-365px">
                            <template slot="label">
                                <span class="company_name_lable">{{$t('main.customerName')}}</span>
                            </template>
                            <Input
                                v-model.trim="companyInfo.companyName"
                                maxlength="100"
                                readonly
                                style="width:186px;"
                                :placeholder="$t('main.customName')"
                            >
                            </Input>
                            <Button type="text" class="select_company" @click="select_company_modal=true">{{$t('crm.followUpRecord.select')}}</Button>
                        </FormItem>
                    </div>
                </template>
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
                    <!-- 主询盘 -->
                    <div class="modalItem">
                        <p style="visibility: hidden;">_</p>
                        <div>
                            <Poptip :width="250"
                                    class="pop-change-mainInquiry">
                                <Radio slot="reference"
                                       :value="isMainInquiry"
                                       :label="true"
                                       @click.native.prevent="e => isMainInquiry ? e.stopPropagation() : undefined"> {{
                                    $t('crm.Modal.mainInquiry') }}
                                </Radio>
                                <div style="padding: 10px; position: relative;">
                                    <p>{{ $t('crm.Modal.tip_changeMainInquiry') }}</p>
                                    <br>
                                    <div style="text-align: right;">
                                                    <span style="color: #2d8cf0;cursor: pointer;margin-right: 20px;"
                                                          @click="() => $refs.currentModal.$el.click()">{{ $t('cancel') }}</span>
                                        <span style="color: #2d8cf0;cursor: pointer;"
                                              @click="() => { isMainInquiry = true; $refs.currentModal.$el.click();}">{{ $t('confirm') }}</span>
                                    </div>
                                </div>
                            </Poptip>
                        </div>
                    </div>
                    <!-- 上传文档 -->
                    <template v-if="authorized_button['uploadDocument']">
                        <UploadDocument :documents.sync="list_documents"></UploadDocument>
                    </template>
                </div>
                <!-- 联系人 -->
                <h1 class="title">{{ $t('crm.Modal.title_contact') }}</h1>
                <div class="wrap">
                    <!-- 切换: 关联已有联系人 || 新增联系人 -->
                    <RadioGroup v-if="existedContactList.length"
                                v-model="createContactType"
                                class="create-contact-type-radio">
                        <!-- 关联已有联系人 -->
                        <Radio label="link"
                               :disabled="loading"
                               class="piwik_newInquiry_link_existed_contact">
                            <span>{{ $t('crm.Modal.linkExistedContact') }}</span>
                        </Radio>
                        <!-- 新增联系人 -->
                        <Radio label="new"
                               :disabled="loading">
                            <span>{{ $t('crm.Detail.newContact') }}</span>
                        </Radio>
                    </RadioGroup>

                    <!-- 关联已有联系人 -->
                    <div v-if="createContactType === 'link'">{{ $t('crm.Modal.linkExistedContact') }}
                        <Select v-model="existedContactId"
                                filterable
                                :disabled="loading"
                                :placeholder="$t('crm.Modal.tip_select')"
                                style="width:230px;margin-left: 20px">
                            <Option v-for="item in existedContactList"
                                    :key="item.id"
                                    :value="item.id"
                                    :label="`${item.nickName}<${item.email}>`"></Option>
                        </Select>
                    </div>

                    <!-- 新增联系人 -->
                    <template v-else-if="is_all_field_requested && (existedContactList.length === 0 || createContactType === 'new')">
                        <!-- 通用输入区域 -->
                        <CrmInputArea :data.sync="contact"
                                      :items="contact_item_all"
                                      :selectOptions="computed_selectOptions"
                                      :pictures.sync="contactPictures"
                                      :merged.sync="contactMerged"
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
                    </template>
                </div>
            </Form>
            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button v-if="is_all_field_requested"
                        type="primary"
                        :disabled="loading"
                        @click="ok"
                        class="piwik_new_inquiry">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>
        <!-- 邮箱 / 电话 / WhatsApp / Instagram 字段查重弹窗 -->
        <UniqContact :visible.sync="uniqContactVisible"
                     :uniqField="uniqContactField"
                     :uniqVal="uniqContactVal"></UniqContact>

        <!-- 邮箱后缀查重弹窗 -->
        <UniqEmailSuffix :visible.sync="uniqEmailSuffixVisible"
                        :email="uniqEmailSuffixVal"></UniqEmailSuffix>

        <!-- 社交平台查重 -->
        <UniqSocialPlatforms
                    :uniqSocialPlatformVal="uniqSocialPlatformVal"
                    :uniqSocialPlatformName="uniqSocialPlatformName"
                    :visible.sync="uniqSocialPlatformsVisible"></UniqSocialPlatforms>
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
    import CrmInputArea from '@/views/crm/Detail/Components/Modal/fixed-modal-form/crm-input-area';
    import UniqContact from '@/views/crm/Detail/Components/Modal/uniqContact';
    import UniqEmailSuffix from '@/views/crm/Detail/Components/Modal/uniqEmailSuffix';
    import UniqSocialPlatforms from '@/views/crm/Detail/Components/Modal/uniqSocialPlatforms';
    import UploadDocument from '@/views/crm/Detail/Components/Html/uploadDocument';
    import selectCompany from '@/views/crm/Table/Components/Modal/followUpRecord/selectCompany';
    import { checkContact, getContactRepeatData } from '@/api/reusableApi/common';
    import { GET_EMAIL_SUFFIX } from '@/api/mail';
    import { crmCommon, crmContacts, crmClue } from '@/api/crm/index';
    import { mapState, mapGetters } from 'vuex';
    import { triggerGtag } from '@/utils/base';

    export default {
        name: 'newInquiry',
        components: {
            CrmInputArea,
            UniqContact,
            UniqEmailSuffix,
            UploadDocument,
            UniqSocialPlatforms,
            selectCompany
        },
        props: [
            'visible',
            'companyId',
            'flag_update_inquiry',
            'flag_update_contact',
            'modelType'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                showUniq: state => state.crm.showUniq,
                allowMerge: state => state.crm.allowMerge,
                button_list: state => state.app.button_list,
                selectOptions: state => state.crm.selectOptions
            }), // 从 vuex 中获取属性
            ...mapGetters([
                // 字段长度校验
                'check_length_default',
                'check_length_custom',
                'contact_items',
                'inquiry_items'
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
                return result;
            }, // 获取使用中(未停用)的通用设置下拉选项
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

            current_followUp() {
                return Array.isArray(this.computed_selectOptions.followUp) ? this.computed_selectOptions.followUp.find(item => `${item.attrId}` === `${this.inquiry.followUpId}`) : undefined;
            },
            // 当前选中的已有联系人
            current_existed_contact() {
                let result;
                if (this.existedContactId) {
                    result = this.existedContactList.find(item => item.id === this.existedContactId);
                }
                return result;
            },
            /* 多语言 */
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
                /* 选择新增联系人方式: 关联已有联系人 || 新增联系人 */
                createContactType: '',
                existedContactList: [],
                existedContactId: '',
                loading: false,
                contact: {},
                contact_backup: {}, // 方便清空数据
                birthdayLimit: {
                    disabledDate(date) {
                        return date && date.valueOf() > Date.now() - 86400000;
                    }
                },
                contactPictures: [],
                contactMerged: false,
                inquiry: {},
                inquiry_backup: {}, // 方便清空数据
                list_documents: [],
                newContactId: '',
                uniqContactVisible: false,
                uniqContactField: '',
                uniqContactVal: '',
                /* 邮箱后缀查重 */
                uniqEmailSuffixVisible: false,
                // 社交平台查重弹窗的状态
                uniqSocialPlatformsVisible: false,
                uniqSocialPlatformVal: '',
                uniqSocialPlatformName: '',
                uniqEmailSuffixVal: '',
                /* 成交数据 */
                transactionTime: new Date(),
                transactionMoney: null,
                transactionMoneyCurrency: 'CNY',
                transactionInfo: null,
                transactionStatus: {}, // 成交状态
                estimatedInquiryAmount: null,
                estimatedInquiryAmountCurrency: 'CNY',
                close_popper: this.$debounce((e) => {
                    if (e && e.target && e.target.classList.contains('el-dialog__body')) {
                        // 关闭 select 下拉选框
                        const selectEl = this.$refs.currentModal.$el.querySelector('.is-focus');
                        if (selectEl) {
                            selectEl.click();
                        }
                    }
                }, undefined, true),

                // 主询盘
                isMainInquiry: false,
                select_company_modal: false,
                companyInfo: {
                    companyName: '',
                    companyId: ''
                }
            };
        },
        methods: {
            handleCompany(item) {
                this.companyInfo = item;
                this.companyId = item.companyId;
                this.companyName = item.companyName;
                this.existedContactId = '';
                this.get_existed_contact_list();
            },
            /* 获取已有字段 */
            getAllField() {
                this.loading = true;
                this.is_all_field_requested = false;
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
                        // 系统字段
                        defaultColumn.forEach(item => {
                            switch (`${item.parentId}`) {
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
                        // 客户自定义字段
                        customColumn.show.forEach(field => {
                            field.colType = field.type;
                            switch (`${field.parentId}`) {
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
                }).catch(() => {
                    this.$Message.error(this.$t('crm.Modal.error_get_all_fields_for_newCreate'));
                    this.loading = false;
                });
            },
            // 获取同公司下其他联系人
            get_existed_contact_list() {
                this.existedContactList = [];
                this.createContactType = 'new';
                const data = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    companyId: this.companyId
                };
                crmContacts.getContactsNameListByCompany(data).then(response => {
                    if (response.code === '1') {
                        if (response.data && Array.isArray(response.data.list)) {
                            this.existedContactList = response.data.list;
                        }
                    }
                }).catch(error => {
                    console.error(error);
                });
            },

            async ok() {
                // 如果当前正在录入, 则退出录入
                if (this.loading) {
                    this.$Message.warning(this.$t('mail.customerBox.requestTip'));
                    return;
                }
                // 兼容prop 和快速新建 BUG: https://www.tapd.cn/51663361/bugtrace/bugs/view?bug_id=1151663361001018634&from=letter
                let companyId = this.companyId;
                if (this.modelType === 'quickEntrance') {
                    if (!this.companyInfo.companyId) {
                        this.$Message.error(this.$t('main.customName'));
                        return;
                    }
                    companyId = this.companyInfo.companyId;
                }

                // 检查是否关联新增联系人, 是则进行联系人初步校验
                if (this.createContactType === 'new') {
                    // 联系人数据合法性校验
                    // 图片是否上传完成
                    if (Array.isArray(this.contactPictures) && this.contactPictures.some(item => item.uploading)) {
                        this.$Message.warning(this.$t('crm.Modal.info_contactPictureUploading'));
                        return;
                    }
                    // 联系人邮箱不能为空
                    // 放开邮箱必填 22-04-12
                    // if (this.contact.email.trim() === '') {
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
                    // 邮箱格式是否规范
                    const emailReg = Utils.regExp.fullEmail;
                    if (this.contact.email && !emailReg.test(this.contact.email.trim())) {
                        this.$Message.error(this.$t('crm.Modal.error_emailFormat'));
                        return;
                    }
                    // 必填字段校验
                    let tempErrorField = '';
                    if (!this.contactMerged && this.contact_item_all.some(item => {
                        // 特殊字段, 值为对象数组, phone 或 socialNetworkingPlatform
                        if (item.mustInput === 1) {
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
                            } else {
                                // 常规字段, 值为字符串或数组类型
                                if (!this.contact[item.storageName] || this.contact[item.storageName].length === 0) {
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
                }
                // 询盘数据合法性校验
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
                // 校验社交平台信息是否填完整
                if (this.contact.socialNetworkingPlatform && this.contact.socialNetworkingPlatform.length && (this.socialPlatformsFlag() === '1' || this.socialPlatformsFlag() === '2')) {
                    const str = this.socialPlatformsFlag() === '2' ? '社交平台分类不能为空' : '社交平台内容不能为空';
                    this.$Message.error(str);
                    return;
                }
                // 产品分类不能为空
                // if (this.inquiry.productCategory && !this.inquiry.productCategory.length) {
                //     this.$Message.error(this.$t('crm.Modal.error_emptyProductCategory'));
                //     return;
                // }
                // 询盘备注不能超过 20000 个字符
                if (this.inquiry.remark && this.inquiry.remark.toString().replace(/[^\x00-\xff]/gi, '--').length > 20000) {
                    this.$Message.error(this.$t('crm.Modal.error_remarkLength'));
                    return;
                }
                this.inquiry.estimatedInquiryAmount = this.estimatedInquiryAmount ? Number(this.estimatedInquiryAmount.replace(/,/g, '')) : this.estimatedInquiryAmount;
                // this.inquiry.estimatedInquiryAmountCurrency = this.estimatedInquiryAmountCurrency;
                // 必填字段校验
                let tempErrorField = '';
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
                // newInquiryData.estimatedInquiryAmount = this.estimatedInquiryAmount ? Number(this.estimatedInquiryAmount.replace(/,/g, '')) : this.estimatedInquiryAmount;
                newInquiryData.estimatedInquiryAmountCurrency = this.estimatedInquiryAmountCurrency;
                // 检验询盘数据字段是否超长
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
                // 显示 loading
                this.loading = true;

                // 拼装最终发送的数据
                const tempSendData = Object.assign({
                    orgId: this.enterpriseId,
                    companyId: companyId
                }, this.remove_attr_readonly(newInquiryData, 'inquiry'));

                // 设为主询盘
                if (this.isMainInquiry) {
                    tempSendData.isMainInquiry = 1;
                }

                // 根据创建联系人方式写入不同联系人数据
                if (this.createContactType === 'link') {
                    tempSendData.contactsId = this.existedContactId;
                } else if (this.createContactType === 'new') {
                    // 邮箱去重
                    if (this.contact.email && this.contact.email.trim()) {
                        const res_uniqEmail = await crmContacts.sameContactsEmail({
                            orgId: this.enterpriseId,
                            email: this.contact.email.trim()
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
                                this.uniqContact({ field: 'email', value: this.contact.email.trim(), uniqDirectly: true });
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
                    temp.email = temp.email ? temp.email.trim() : '';
                    // 处理多选数据
                    this.contact_item_all.filter(item => item.colType === 'selectMultiple').forEach(item => {
                        temp[item.storageName] = Array.isArray(temp[item.storageName]) ? JSON.stringify(temp[item.storageName]) : JSON.stringify([]);
                    });

                    // 邮箱后缀查重
                    if (this.showUniq.emailSuffix === '1' && temp.email) {
                        // 获取邮箱后缀查重关联的询盘数据
                        const res_getRepeatData = await getContactRepeatData({
                            orgId: this.enterpriseId,
                            emailSuffix: GET_EMAIL_SUFFIX(temp.email.trim())
                        });

                        if (res_getRepeatData.code === '1') {
                            if (Array.isArray(res_getRepeatData.data) && res_getRepeatData.data.length) {
                                // 有重复

                                if (!res_getRepeatData.data.some(item => `${item.companyId}` === `${this.companyId}`)) {
                                    // 如果重复数据中没有当前客户 id

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
                        } else {
                            // 获取重复数据失败

                            // 弹出提示
                            this.$Message.error(this.$t('crm.Modal.error_getEmailSuffixRelated'));

                            // 停止录入操作
                            this.loading = false;
                        }
                    }

                    // WhatsApp 查重
                    if (this.loading && this.showUniq.whatsapp === '1' && temp.hasOwnProperty('whatsApp') && temp.whatsApp && temp.whatsApp.trim()) {
                        // whatsApp 查重
                        const res_uniqContact = await checkContact({
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
                        const res_uniqContact = await checkContact({
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
                /**
                 * @Description: 询盘日志改为由后端处理，此页面内所有调用$saveLog的地方均注释相关代码。
                 *               涉及场景：保存询盘(无成交数据),保存成交数据，上传询盘文档(新建询盘时上传文档)
                 * @author 杨娣
                 * @date 2020/6/8
                 */
                // 存储
                if (this.loading) {
                    triggerGtag('CRM', '询盘');
                    crmCommon.inquiryCommonSave(JSON.stringify(tempSendData)).then(response => {
                        if (response.code === '1') {
                            this.$emit('update:flag_update_inquiry', !this.flag_update_inquiry);
                            this.$emit('refreshContact');
                            // 联系人邮箱关联到邮件系统
                            if (tempSendData.contacts && this.contact.email) {
                                this.$emit('update:flag_update_contact', !this.flag_update_contact);
                                crmClue.addTimeAxis({
                                    address: this.contact.email,
                                    createUserId: this.userId,
                                    orgId: this.enterpriseId,
                                    contactsId: response.data.contactsId,
                                    contactsName: tempSendData.contacts.nickName,
                                    companyId: companyId,
                                    inquiryId: response.data.inquiryId
                                });

                                crmClue.mergerMail({
                                    emailAddress: this.contact.email,
                                    createUserId: this.userId,
                                    orgId: this.enterpriseId,
                                    inquiryId: response.data.inquiryId
                                });
                            }

                            // 创建联系人方式为"关联已有联系人", 后端要求也调用 mergerMail 接口
                            if (tempSendData.contactsId) {
                                if (this.current_existed_contact && this.current_existed_contact.email) {
                                    crmClue.mergerMail({
                                        emailAddress: this.current_existed_contact.email,
                                        createUserId: this.userId,
                                        orgId: this.enterpriseId,
                                        inquiryId: response.data.inquiryId
                                    });
                                }
                            }

                            // 保存询盘文档
                            if (this.list_documents.length) {
                                this.fileSave(response.data.inquiryId);
                            }

                            const logObj = {
                                operateType: 1,
                                operateModule: 3,
                                mergedContactId: tempSendData.contactsId,
                                contactId: tempSendData.contactsId ? undefined : response.data.contactsId,
                                inquiryId: response.data.inquiryId,
                                enterpriseId: this.enterpriseId.toString(),
                                userId: this.userId,
                                fullName: this.fullName,
                                currentObj: Object.assign({ mainContact: tempSendData.contactsId ? '' : response.data.contactsId }, newInquiryData),
                                contactCurrentObj: Object.assign({}, tempSendData.contacts)
                            };
                            this.$saveLog(logObj);
                            this.$Message.success(this.$t('crm.Modal.success_newInquiry'));
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
                            this.$Message.error(response.message + this.$t('highSeasSetting.inquriry.overInquiryLimit'));
                        } else if (response.code === '0' && response.data === -7) {
                            // 该邮箱为企业同事邮箱，不可录入
                            this.$Message.error(this.$t('crm.Modal.error_enterpriseColleagueMail'));
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_newInquiry'));
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
                this.$emit('update:visible', false); // 改变父组件的 控制本组件显示 属性
                // 联系人部分
                this.contact = this.$deepClone(this.contact_backup);
                this.contactMerged = false;
                this.contactPictures = [];
                this.newContactId = '';
                this.existedContactId = '';
                this.createContactType = '';
                this.isMainInquiry = false;
                // 询盘部分
                this.inquiry = this.$deepClone(this.inquiry_backup);
                this.list_documents = [];
                this.transactionTime = new Date();
                this.transactionMoney = null;
                this.transactionMoneyCurrency = 'CNY';
                this.transactionInfo = null;
                this.transactionStatus = {};
                if (this.modelType === 'quickEntrance') {
                    this.existedContactList = [];
                }
                // 页面回到顶部
                this.$refs.currentModal.$el.querySelector('.el-dialog__body').scrollTop = 0;
            },
            fileSave(inquiryId) {
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
                        // this.$saveLog({
                        //     operateType: 4,
                        //     operateModule: 5,
                        //     inquiryId: inquiryId,
                        //     userId: this.userId,
                        //     fullName: this.fullName,
                        //     currentObj: {
                        //         name: fileNames.join(',\n')
                        //     },
                        //     enterpriseId: this.enterpriseId
                        // });
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
                console.log(data);
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
                            selectedLabels.push({ attrId, attrName, attrValue, orgId, typeId, belongTable });
                            return true;
                        }
                    });
                }
                return selectedLabels;
            }, // 通过 Select 绑定的被选中标签名称数组获取其他数据并格式化
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
                        // this.uniqContactField = field;
                        // this.uniqContactVal = value.trim();
                        // this.uniqContactVisible = true;

                        // 退出流程
                        return;
                    }

                    // 发送请求
                    const res_uniqContact = await checkContact(params);

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
                    const res_uniqEmailSuffix = await checkContact({
                        orgId: this.enterpriseId,
                        email: GET_EMAIL_SUFFIX(value.trim())
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
                console.log('uniqSocialPlatformsVisible', attrName, attrValue);
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
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    this.getAllField();
                    if (this.companyId) {
                        this.get_existed_contact_list();
                    }
                    this.companyInfo = {
                        companyName: '',
                        companyId: ''
                    };
                } else {
                    this.cancel();
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
                },
                immediate: true
            },
            inquiry_item_all: {
                handler(val) {
                    // 初始化 inquiry_backup 为空对象
                    this.inquiry_backup = {};

                    // 初始化其他相关属性
                    this.list_documents = [];

                    if (val) {
                        val.forEach(item => {
                            switch (item.storageName) {
                                case 'label':
                                    this.$set(this.inquiry_backup, 'label', []);
                                    break;
                                case 'productCategory':
                                    const defaultOption = Array.isArray(this.computed_selectOptions.productCategory) ? this.computed_selectOptions.productCategory.find(option => option.defaultMark === 1) : null;
                                    this.$set(this.inquiry_backup, item.storageName, defaultOption ? [defaultOption.attrName] : []);
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
            }
        }
    };
</script>
<style lang="less" scoped>
.select_company {
    position: absolute;
    right: 12px;
    bottom: 6px;
    font-size: 12px;
    height: 25px;
    color:#3B78DE;
    cursor: pointer;
    background: #fff;
}
.company_name_lable {
    width: 115px;
    text-align: right;
    line-height: 35px;
    padding-right: 10px;
}
</style>
