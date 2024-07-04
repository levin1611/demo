<template>
    <div>
        <Modal :visible="visible"
               :title="$t('crm.Modal.title_newContact')"
               width="778px"
               class="modal"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               :append-to-body="true"
               @scroll.native.capture="close_popper"
               ref="currentModal">
            <!-- loading -->
            <Spin v-if="loading"
                  fix></Spin>

            <!-- 录入数据区域 -->
            <Form :inline="true"
                  :validate-on-rule-change="false"
                  label-position="right"
                  label-width="115px"
                  ref="newContactForm"
                  class="_form-custom">
                <!-- 询盘 -->
                <h1 class="title">{{ $t('crm.Modal.title_inquiry') }}</h1>
                <div class="wrap">
                    <!-- 切换: 关联已有询盘 || 新增询盘 -->
                    <RadioGroup v-if="existedInquiryList.length"
                                v-model="createInquiryType"
                                class="create-inquiry-type-radio">
                        <!-- 关联已有询盘 -->
                        <Radio label="link"
                               :disabled="loading"
                               class="piwik_newContact_link_existed_inquiry">
                            <span>{{ $t('crm.Modal.linkExistedInquiry') }}</span>
                        </Radio>
                        <!-- 新增询盘 -->
                        <Radio label="new"
                               :disabled="loading">
                            <span>{{ $t('crm.Modal.title_newInquiry') }}</span>
                        </Radio>
                    </RadioGroup>

                    <!-- 关联已有询盘 -->
                    <div v-if="createInquiryType === 'link'">
                        <br>
                        <span style="display: inline-block;width: 90px;">{{ $t('crm.Modal.linkTo') }}</span>
                        <Select v-model="existedInquiryId"
                                filterable
                                :disabled="loading"
                                :placeholder="$t('crm.Modal.tip_select')"
                                style="width: 200px;">
                            <Option v-for="item in existedInquiryList"
                                    :key="item.id"
                                    :value="item.id"
                                    :label="item.seqNumber"></Option>
                        </Select>
                    </div>

                    <!-- 新增询盘 -->
                    <template v-else-if="is_all_field_requested && (existedInquiryList.length === 0 || createInquiryType === 'new')">
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
                    </template>
                </div>

                <!-- 联系人 -->
                <h1 class="title">{{ $t('crm.Modal.title_contact') }}</h1>
                <div class="wrap">
                    <!-- 通用输入区域 -->
                    <CrmInputArea :data.sync="contact"
                                  :items="contact_item_all"
                                  :selectOptions="computed_selectOptions"
                                  :pictures.sync="contactPictures"
                                  :merged.sync="contactMerged"
                                  :computed_mailAddress="computed_mailAddress"
                                  @uniqMail="$emit('uniqContact', { field: 'email', value: contact.email })"
                                  @uniqPhoneNumber="$emit('uniqContact', { field: 'phone', value: $event })"
                                  @uniqSocialPlatforms="uniqSocialPlatforms"
                                  @uniqContact="$emit('uniqContact', $event)"></CrmInputArea>
                    <!-- 主联系人 -->
                    <div class="modalItem">
                        <p style="visibility: hidden;">_</p>
                        <div>
                            <template v-if="contactMerged">
                                <Radio :value="false" :label="true" disabled> {{ $t('crm.Modal.mainContact') }}</Radio>
                            </template>
                            <template v-else>
                                <Poptip :width="250"
                                        class="pop-change-mainContact">
                                    <Radio slot="reference"
                                           :value="isMainContact"
                                           :label="true"
                                           @click.native.prevent="e => isMainContact ? e.stopPropagation() : undefined"> {{
                                        $t('crm.Modal.mainContact') }}
                                    </Radio>
                                    <div style="padding: 10px; position: relative;">
                                        <p>{{ $t('crm.Modal.tip_changeMainContact') }}</p>
                                        <br>
                                        <div style="text-align: right;">
                                        <span style="color: #2d8cf0;cursor: pointer;margin-right: 20px;"
                                              @click="() => $refs.currentModal.$el.click()">{{ $t('cancel') }}</span>
                                            <span style="color: #2d8cf0;cursor: pointer;"
                                                  @click="() => { isMainContact = true; $refs.currentModal.$el.click();}">{{ $t('confirm') }}</span>
                                        </div>
                                    </div>
                                </Poptip>
                            </template>
                        </div>
                    </div>
                </div>
            </Form>

            <!-- 底部 -->
            <div slot="footer">
                <!-- 取消 -->
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <!-- 确定 -->
                <Button v-if="is_all_field_requested"
                        type="primary"
                        :disabled="loading"
                        @click="ok"
                        class="piwik_new_contact">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>


        <!-- 社交平台查重 -->
        <UniqSocialPlatforms
                    :uniqSocialPlatformVal="uniqSocialPlatformVal"
                    :uniqSocialPlatformName="uniqSocialPlatformName"
                    :visible.sync="uniqSocialPlatformsVisible"></UniqSocialPlatforms>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import Utils from '@/utils/index';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import CrmInputArea from '@/views/crm/Detail/Components/Modal/fixed-modal-form/crm-input-area';
    import UniqSocialPlatforms from '@/views/crm/Detail/Components/Modal/uniqSocialPlatforms';
    import UploadDocument from '@/views/crm/Detail/Components/Html/uploadDocument';
    import { checkContact } from '@/api/reusableApi/common';
    import { crmContacts, crmClue } from '@/api/crm/index';
    import { triggerGtag } from '@/utils/base';

    export default {
        name: 'newContact',
        components: {
            CrmInputArea,
            UploadDocument,
            UniqSocialPlatforms
        },
        props: [
            'visible',
            'companyId',
            'isHighSeas',
            'companyName',
            'clueId',
            'ctData',
            'ctPictures',
            'iqData',
            'iqDocuments',
            'computed_mailAddress',
            'type',
            'json_data',
            'conversationId',
            'commentId'
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

            // 线索来源类型
            targetType() {
                let result;

                switch (this.type) {
                    case 'xhl_chat':
                    case 'visitorHistory':
                    case 'webMsg':
                        // 聊天框/小屏聊天框
                        // 访客历史详情页
                        // 网站留言详情页
                        result = 1;
                        break;
                    case 'facebook':
                    case 'fb_leads':
                        result = 11;
                        break;
                    case 'google':
                        // 闭环优化管理相关, 产品说可忽略
                        break;
                    case 'fb_comment':
                        // FB 评论
                        result = 12;
                        break;
                    case 'fb_chat':
                    case 'floating_fb':
                        // FB 私信
                        // FB 私信小屏
                        result = 2;
                        break;
                    default:
                        // 默认'手动创建线索', 视作直接新建线索并保存询盘
                        result = 3;
                        break;
                }

                return result;
            },
            // 线索来源的数据 id
            targetId() {
                let result;

                switch (this.type) {
                    case 'xhl_chat':
                    case 'visitorHistory':
                    case 'webMsg':
                        // 聊天框/小屏聊天框
                        // 访客历史详情页
                        // 网站留言详情页
                        result = this.json_data ? this.json_data.proj : '';
                        break;
                    case 'facebook':
                    case 'fb_leads':
                        result = this.json_data ? this.json_data.leadsId : '';
                        break;
                    case 'google':
                        // 闭环优化管理相关, 产品说可忽略
                        result = '';
                        break;
                    case 'fb_comment':
                        // FB 评论
                        result = this.commentId;
                        break;
                    case 'fb_chat':
                    case 'floating_fb':
                        // FB 私信
                        // FB 私信小屏
                        result = this.conversationId;
                        break;
                    default:
                        // 默认'手动创建线索', 视作直接新建线索并保存询盘
                        result = this.clueId;
                        break;
                }

                return result;
            }
        },
        data() {
            return {
                /* 多语言 */
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
                /* 选择新增询盘方式: 关联已有询盘 || 新增询盘 */
                createInquiryType: '',
                existedInquiryList: [],
                inquiry: {},
                inquiry_backup: {}, // 方便清空数据
                list_documents: [],
                // 选中的已有询盘的 id
                existedInquiryId: '',
                // 社交平台查重弹窗的状态
                uniqSocialPlatformsVisible: false,
                uniqSocialPlatformVal: '',
                uniqSocialPlatformName: '',

                /* 联系人 */
                contact: {},
                contact_backup: {}, // 方便清空数据
                contactPictures: [],
                contactMerged: false,

                /* 成交数据 */
                // visible_edit_clinchData: false,
                transactionTime: new Date(),
                transactionMoney: null,
                transactionMoneyCurrency: 'CNY',
                transactionInfo: null,
                transactionStatus: {}, // 成交状态

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
                // 主联系人
                isMainContact: false,
                // 公司负责人
                companyManagerIds: '',
                // 询盘预计金额
                estimatedInquiryAmount: null,
                estimatedInquiryAmountCurrency: 'CNY'
            };
        },
        methods: {
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
                util.axios.all([this.get_fields(), this.get_existed_inquiry_list(), this.get_company_short_info()]).then(util.axios.spread((...responses) => {
                    if (responses.every(item => item)) {
                        this.is_all_field_requested = true;
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_get_all_fields_for_newCreate'));
                    }
                    this.loading = false;
                }));
            },
            get_fields() {
                return new Promise(resolve => {
                    this.$commonApi.getAllColumns({
                        orgId: this.enterpriseId,
                        parentId: 0,
                        userId: this.userId
                    }).then(res => {
                        this.loading = false;
                        if (res.code === '1') {
                            const { customColumn, defaultColumn } = res.data;
                            defaultColumn.forEach(item => {
                                switch (`${item.parentId}`) {
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
                                    case '2':
                                        this.$set(this.contact_columns_authorized.custom, this.contact_columns_authorized.custom.length, field);
                                        break;
                                    case '3':
                                        this.$set(this.inquiry_columns_authorized.custom, this.inquiry_columns_authorized.custom.length, field);
                                        break;
                                }
                            });
                            this.is_all_field_requested = true;
                            resolve(true);
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_get_all_fields_for_newCreate'));
                            resolve(false);
                        }
                    }).catch(error => {
                        console.error(error);
                        resolve(false);
                    });
                });
            },
            // 获取同公司下其他询盘
            get_existed_inquiry_list() {
                return new Promise(resolve => {
                    this.existedInquiryList = [];
                    this.createInquiryType = 'new';
                    const dataJson = {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        companyId: this.companyId,
                        pageNo: 1,
                        listType: this.isHighSeas ? 0 : 1
                    };
                    crmClue.getInquiryListByCompany(dataJson).then(response => {
                        if (response.code === '1') {
                            const temp = (response.data && Array.isArray(response.data.list)) ? response.data.list.sort((a, b) => b.createTime - a.createTime) : [];
                            this.existedInquiryList = temp.map(item => {
                                const { id, seqNumber, userIdsShow } = item;
                                return { id, seqNumber, userIdsShow };
                            });
                        }
                        resolve(true);
                    }).catch(error => {
                        console.error(error);
                        resolve(true);
                    });
                });
            },
            // 获取公司负责人
            get_company_short_info() {
                return new Promise(resolve => {
                    this.companyManagerIds = '';
                    const dataJson = {
                        companyId: this.companyId,
                        listType: 1
                    };
                    crmClue.getSimpleCompany(dataJson).then(response => {
                        if (response.code === '1' && response.data) {
                            this.companyManagerIds = response.data.companyManagerIds;
                        } else {
                            this.$Message.error(this.$t('crm.newDetail.error_getCompanyBriefInfo'));
                        }
                        resolve(true);
                    }).catch(error => {
                        console.error(error);
                        resolve(true);
                    });
                });
            },

            // 点击保存
            async ok() {
                // 如果当前正在录入, 则退出录入
                if (this.loading) {
                    this.$Message.warning(this.$t('mail.customerBox.requestTip'));
                    return;
                }

                // 检查是否关联已有询盘
                if (this.createInquiryType === 'link') {
                    // 关联已有询盘
                    if (this.existedInquiryId) {
                        // 询盘新增联系人
                        this.saveContact();
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_selectExistedInquiry'));
                    }
                } else if (this.createInquiryType === 'new') {
                    // 新建询盘
                    this.saveInquiry();
                }
            },
            // 点击取消
            cancel() {
                this.loading = false;
                this.$emit('update:visible', false); // 改变父组件的 控制本组件显示 属性
                // 联系人部分
                this.contact = this.$deepClone(this.contact_backup);
                this.contactMerged = false;
                this.contactPictures = [];
                this.contactMerged = false;
                this.isMainContact = false;
                // 询盘部分
                this.inquiry = this.$deepClone(this.inquiry_backup);
                this.list_documents = [];

                this.transactionTime = new Date();
                this.transactionMoney = null;
                this.transactionMoneyCurrency = 'CNY';
                this.transactionInfo = null;
                this.transactionStatus = {};

                this.existedInquiryId = '';
                this.createInquiryType = '';

                // 页面回到顶部
                this.$refs.currentModal.$el.querySelector('.el-dialog__body').scrollTop = 0;
            },

            /* 关联已有询盘, 相当于"询盘下保存联系人" */
            async saveContact() {
                // 联系人数据合法性校验
                if (!this.checkContactData()) {
                    return;
                }

                // 显示 loading
                this.loading = true;

                // 处理得到联系人数据
                const contactData = await this.handleContactData();
                // 校验未通过, 退出流程
                if (!contactData) {
                    this.loading = false;
                    return;
                }

                // 关联已有询盘, 联系人数据中加入 inquiryId
                if (this.createInquiryType === 'link') {
                    contactData.inquiryId = this.existedInquiryId;
                }

                // 保存联系人
                this.handleSaveContact(contactData);
            },
            // 联系人数据合法性校验
            checkContactData() {
                // 图片是否上传完成
                if (Array.isArray(this.contactPictures) && this.contactPictures.some(item => item.uploading)) {
                    this.$Message.warning(this.$t('crm.Modal.info_contactPictureUploading'));
                    return false;
                }
                // 联系人邮箱不能为空
                // 放开邮箱必填 22-04-12
                // if (this.contact.email.trim() === '') {
                //     this.$Message.error(this.$t('crm.Modal.error_emptyEmail'));
                //     return false;
                // }
                // 联系人姓名不能为空
                if (this.contact.nickName.trim() === '') {
                    this.$Message.error(this.$t('crm.Modal.error_emptyNickName'));
                    return false;
                }
                // 校验社交平台信息是否填完整
                if (this.contact.socialNetworkingPlatform && this.contact.socialNetworkingPlatform.length && (this.socialPlatformsFlag() === '1' || this.socialPlatformsFlag() === '2')) {
                    const str = this.socialPlatformsFlag() === '2' ? '社交平台分类不能为空' : '社交平台内容不能为空';
                    this.$Message.error(str);
                    return false;
                }
                // 验证WhatsApp字段
                if (this.contact.whatsApp) {
                    if (!(/^[ \-_`~!@#$%^&*()+=|{}':;",\[\].<>/?~！@#￥%……&*（）——+\d]+$/i.test(this.contact.whatsApp))) {
                        this.$Message.error(this.$t('crm.Modal.error_whatsAppFormat'));
                        return false;
                    }
                }
                // 邮箱格式是否规范
                const emailReg = Utils.regExp.fullEmail;
                if (this.contact.email && !emailReg.test(this.contact.email.trim())) {
                    this.$Message.error(this.$t('crm.Modal.error_emailFormat'));
                    return false;
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
                    return false;
                }

                // 上述校验全部通过, 返回 true
                return true;
            },
            // 处理得到要发送的联系人数据
            async handleContactData() {
                let result = {};
                if (this.contact.email && this.contact.email.trim()) {
                    const resUniqEmail = await crmClue.sameContactsEmail({
                        orgId: this.enterpriseId,
                        email: this.contact.email.trim()
                    });
                    if (resUniqEmail.code === '1') {
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
                                return false;
                            } else {
                                // 已合并, 把已合并联系人 id 加入到发送数据中, 不管用户已填写的数据
                                result.contactsId = this.newContactId;
                            }
                        } else {
                            // 弹出查重框
                            this.$emit('uniqContact', { field: 'email', value: this.contact.email.trim(), uniqDirectly: true });
                            // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                            setTimeout(() => {
                                this.$Message.warning(this.$t('crm.Modal.info_enterUniqContactLink').replace(/\$field/g, this.$t('crm.Table.col_email')));
                            });
                            // 停止录入操作
                            return false;
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

                // WhatsApp 查重
                if (this.showUniq.whatsapp === '1' && Object.prototype.hasOwnProperty.call(temp, 'whatsApp') && temp.whatsApp && temp.whatsApp.trim()) {
                    // whatsApp 查重
                    const resUniqContact = await checkContact({
                        orgId: this.enterpriseId,
                        whatsApp: temp.whatsApp.trim()
                    });

                    if (resUniqContact.code === '1') {
                        // 弹出查重框
                        this.$emit('uniqContact', { field: 'WhatsApp', value: temp.whatsApp, uniqDirectly: true });
                        // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                        setTimeout(() => {
                            this.$Message.warning(this.$t('crm.Modal.info_enterUniqContactLink').replace(/\$field/g, 'WhatsApp'));
                        });
                        // 停止录入操作
                        return false;
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
                if (Array.isArray(phone) && phone.length > 0) {
                    if (this.showUniq.phone !== '1') {
                        // 如果不查重, 直接赋值数据
                        temp.phone = phone.join(',');
                    } else {
                        // 电话查重
                        const resUniqPhone = await crmClue.isSameField({
                            orgId: this.enterpriseId,
                            field: 'phone',
                            values: phone.join(',')
                        });

                        if (resUniqPhone.code === '1') {
                            // 弹出查重框
                            this.$emit('uniqContact', { field: 'phone', value: phone[0], uniqDirectly: true });
                            // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                            setTimeout(() => {
                                this.$Message.warning(this.$t('crm.Modal.info_enterUniqContactLink').replace(/\$field/g, this.$t('crm.Table.col_phone')));
                            });
                            // 停止录入操作
                            return false;
                        } else {
                            // 无重复, 赋值数据
                            temp.phone = phone.join(',');
                        }
                    }
                }

                // Instagram 查重
                if (this.showUniq.instagram === '1' && Object.prototype.hasOwnProperty.call(temp, 'instagram') && temp.instagram && temp.instagram.trim()) {
                    // Instagram 查重
                    const resUniqContact = await checkContact({
                        orgId: this.enterpriseId,
                        instagram: temp.instagram.trim()
                    });

                    if (resUniqContact.code === '1') {
                        // 弹出查重框
                        this.$emit('uniqContact', { field: 'Instagram', value: temp.instagram, uniqDirectly: true });
                        // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                        setTimeout(() => {
                            this.$Message.warning(this.$t('crm.Modal.info_enterUniqContactLink').replace(/\$field/g, 'Instagram'));
                        });
                        // 停止录入操作
                        return false;
                    }
                }
                // 社交平台查重
                if (this.showUniq.socialPlatform === '1' && this.contact.socialNetworkingPlatform && this.contact.socialNetworkingPlatform.length) {
                    let result = await this.socialPlatformsCheckDuplicate();
                    if (result.length) {
                        this.$Message.warning(this.$t('crm.Modal.info_enterUniqSocialPlatformLink').replace(/\$fieldName/g, result[0].attrName).replace(/\$fieldVal/g, result[0].attrValue));
                        // 停止录入操作
                        return false;
                    }
                }

                // 格式化社交平台(如果有此字段)
                let platform = null;
                if (Object.prototype.hasOwnProperty.call(temp, 'socialNetworkingPlatform')) {
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
                    return false;
                }

                // 未超长, 加入联系人数据到要发送的数据对象中
                result = this.remove_attr_readonly(sendContactData, 'contact');
                return result;
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
            // 发送保存联系人请求
            async handleSaveContact(data) {
                let prev_contactId = null; // 询盘之前的主联系人id
                if (this.isMainContact) {
                    data.isMainContact = 2;
                    prev_contactId = await new Promise(resolve => {
                        crmClue.getContactsListByInquiry({
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            id: this.existedInquiryId,
                            listType: 0
                        }).then(response => {
                            if (response.code === '1') {
                                const contactList = response.data;
                                if (contactList && Array.isArray(contactList.list)) {
                                    const temp = contactList.list.find(item => item.isMainContact === 1);
                                    resolve(temp ? temp.id : '');
                                } else {
                                    resolve('');
                                }
                            } else {
                                console.error('获取询盘之前的主联系人id失败, 保存的日志中会显示为空');
                                resolve('');
                            }
                        });
                    });
                }
                const saveData = Object.assign({
                    companyId: this.companyId,
                    companyName: this.companyName
                }, data);
                crmContacts.saveContacts(saveData).then(response => {
                    this.loading = false;
                    if (response.code === '1') {
                        if (this.companyManagerIds && this.contact.email) {
                            crmClue.addTimeAxis({
                                address: this.contact.email,
                                createUserId: this.companyManagerIds,
                                orgId: this.enterpriseId,
                                contactsId: response.data,
                                contactsName: data.nickName,
                                companyId: this.companyId,
                                inquiryId: this.existedInquiryId,
                                clueId: this.clueId
                            });
                            crmClue.mergerMail({
                                emailAddress: this.contact.email,
                                // 问过产品(新琪)和后端(伟胜), 现在公司负责人和询盘负责人一致, 这里直接用公司负责人 id 就行
                                createUserId: this.companyManagerIds,
                                orgId: this.enterpriseId,
                                inquiryId: this.existedInquiryId
                            });
                        }

                        // 记录询盘主联系人日志
                        if (prev_contactId !== null) {
                            this.saveLog_mainContact(this.existedInquiryId, response.data, prev_contactId);
                        }
                        this.$saveLog({
                            operateType: 1,
                            operateModule: 2,
                            inquiryId: this.existedInquiryId,
                            contactId: response.data,
                            enterpriseId: this.enterpriseId.toString(),
                            userId: this.userId,
                            fullName: this.fullName,
                            contactCurrentObj: data
                        });

                        // 保存成功后续处理
                        this.handleSaveSuccess({
                            inquiryId: this.existedInquiryId,
                            contactsId: response.data,
                            email: this.contact.email,
                            type: 'newContact'
                        });
                    } else if (response.code === '0' && response.data === -7) {
                        // 该邮箱为企业同事邮箱，不可录入
                        this.$Message.error(this.$t('crm.Modal.error_enterpriseColleagueMail'));
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_newContact'));
                    }
                }, () => {
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                });
            },
            // 获得选中属性的id
            getPlatformId(attrName) {
                let result = '';
                this.selectOptions.socialNetworkingPlatform.some(i => {
                    if (i.attrName === attrName) {
                        result = i.attrId;
                        return true;
                    }
                });
                return result;
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
                    if (item.isOnlyRead === 1 && Object.prototype.hasOwnProperty.call(temp, item.storageName)) {
                        delete temp[item.storageName];
                    }
                });

                // 恢复不参与校验的属性值
                exclude_attrs.map((item, index) => {
                    temp[item] = exclude_attrValues[index];
                });

                return temp;
            },
            // 新增联系人被设置为主联系人, 记录相应日志
            async saveLog_mainContact(inquiryId, current_contactId, prev_contactId) {
                if (prev_contactId != current_contactId) {
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
                }
            },

            /* 新建询盘, 相当于"客户下新增询盘" */
            async saveInquiry() {
                // 联系人数据合法性校验
                if (!this.checkContactData()) {
                    return;
                }

                // 询盘数据合法性校验
                if (!this.checkInquiryData()) {
                    return;
                }

                // 处理得到询盘数据
                const newInquiryData = this.handleInquiryData();
                // 校验未通过, 退出流程
                if (!newInquiryData) {
                    return;
                }
                newInquiryData.estimatedInquiryAmount = this.estimatedInquiryAmount ? Number(this.estimatedInquiryAmount.replace(/,/g, '')) : this.estimatedInquiryAmount;
                newInquiryData.estimatedInquiryAmountCurrency = this.estimatedInquiryAmountCurrency;
                // 显示 loading
                this.loading = true;

                // 处理得到联系人数据
                const sendContactData = await this.handleContactData();
                // 校验未通过, 退出流程
                if (!sendContactData) {
                    this.loading = false;
                    return;
                }

                // 拼装最终发送的数据
                const tempSendData = Object.assign({
                    orgId: this.enterpriseId,
                    companyId: this.companyId,
                    clueId: this.clueId
                }, newInquiryData, sendContactData.contactsId ? sendContactData : { contacts: sendContactData });

                // 设为主询盘
                if (this.isMainInquiry) {
                    tempSendData.isMainInquiry = 1;
                }

                /**
                 * @Description: 询盘日志改为由后端处理，此页面内所有调用$saveLog的地方均注释相关代码。
                 *               涉及场景：保存询盘(无成交数据),保存成交数据，上传询盘文档(新建询盘时上传文档)
                 * @author 杨娣
                 * @date 2020/6/8
                 */
                // 存储
                if (this.loading) {
                    // 保存询盘
                    triggerGtag('CRM', '询盘');
                    crmClue.inquiryCommonSave(JSON.stringify(tempSendData)).then(response => {
                        if (response.code === '1') {
                            // 联系人邮箱关联到邮件系统
                            if (tempSendData.contacts && this.companyManagerIds && this.contact.email) {
                                crmClue.addTimeAxis({
                                    address: this.contact.email,
                                    createUserId: this.companyManagerIds,
                                    orgId: this.enterpriseId,
                                    contactsId: response.data.contactsId,
                                    contactsName: tempSendData.contacts.nickName,
                                    companyId: this.companyId,
                                    inquiryId: response.data.inquiryId
                                }).then(response => {});
                                // 手动归并客户箱
                                crmClue.mergerMail({
                                    emailAddress: this.contact.email,
                                    // 问过产品(新琪)和后端(伟胜), 现在公司负责人和询盘负责人一致, 这里直接用公司负责人 id 就行
                                    createUserId: this.companyManagerIds,
                                    orgId: this.enterpriseId,
                                    inquiryId: response.data.inquiryId
                                });
                            }

                            // 保存询盘文档
                            if (this.list_documents.length) {
                                this.fileSave(response.data.inquiryId);
                            }

                            // 保存日志
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
                            // 保存日志
                            this.$saveLog(logObj);
                            // 保存成功后续处理
                            this.handleSaveSuccess({
                                contactsId: response.data.contactsId,
                                inquiryId: response.data.inquiryId,
                                email: this.contact.email,
                                type: 'newInquiry'
                            });
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
            // 询盘数据合法性校验
            checkInquiryData() {
                // 文档是否上传完成
                if (Array.isArray(this.list_documents) && this.list_documents.some(item => item.uploading)) {
                    this.$Message.warning(this.$t('crm.Modal.info_inquiryDocumentsUploading'));
                    return false;
                }
                // 成交时间不能为空
                if (this.current_followUp && this.current_followUp.transactionStatus && !(this.transactionTime instanceof Date && !isNaN(this.transactionTime.getTime()))) {
                    this.$Message.error(this.$t('crm.Html.empty_transactionTime'));
                    return false;
                }
                // 产品分类不能为空
                // if (this.inquiry.productCategory && !this.inquiry.productCategory.length) {
                //     this.$Message.error(this.$t('crm.Modal.error_emptyProductCategory'));
                //     return false;
                // }
                // 询盘备注不能超过 20000 个字符
                if (this.inquiry.remark && this.inquiry.remark.toString().replace(/[^\x00-\xff]/gi, '--').length > 20000) {
                    this.$Message.error(this.$t('crm.Modal.error_remarkLength'));
                    return false;
                }
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
                            return true;
                        }
                    }
                })) {
                    this.$Message.error(`${tempErrorField}${this.$t('crm.Modal.error_canNotBeEmpty')}`);
                    return false;
                }

                // 上述校验全部通过, 返回 true
                return true;
            },
            // 处理得到要发送的询盘数据
            handleInquiryData() {
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
                // 检验询盘数据字段是否超长
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

                return this.remove_attr_readonly(newInquiryData, 'inquiry');
            },
            // 通过 Select 绑定的被选中标签名称数组获取其他数据并格式化
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
            },
            // 保存询盘文档
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
                // 客户下关联联系人 --- 保存询盘之后保存询盘文档
                crmClue.saveBatch(jsonData).then(response => {
                    if (response.code === '1') {
                        console.log('1111');
                    } else {
                        this.$Message.error({
                            message: this.$t('crm.Html.error_saveFile'),
                            duration: 0,
                            closable: true
                        });
                    }
                });
            },

            /* 保存成功, 回传信息给上层"线索录询盘框" */
            async handleSaveSuccess({ inquiryId, contactsId, email, type }) {
                // 调用手动关联接口
                await crmClue.contactsAssociateRelated({
                    orgId: this.enterpriseId,
                    companyId: this.companyId,
                    inquiryId,
                    contactsId,
                    email,
                    clueId: this.clueId,
                    targetType: this.targetType,
                    targetId: this.targetId,
                    formId: this.type === 'webMsg' ? this.json_data.id : ''
                }).then((data) => {
                    // 如果手动关联接口调用失败
                    if (data.code !== '1') {
                        this.$Message.error(this.$t('crm.Modal.error_linkContact'));
                    }
                }).catch(error => {
                    console.error(error);
                    this.$Message.error(this.$t('crm.Modal.error_linkContact'));
                });

                // 弹出"新建成功"提示
                this.$Message.success(this.$t(`crm.Modal.success_${type}`));
                // 关闭弹窗
                this.cancel();
                // 传值给上层"线索录询盘框"
                this.$emit('newContactSuccess', { inquiryId, contactsId });
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    this.transactionTime = new Date();
                    this.getAllField();
                } else {
                    this.cancel();
                }
            },
            contact_item_all: {
                handler(val) {
                    // 初始化备份对象
                    this.contact_backup = {};

                    // 初始化其他相关属性
                    this.contactMerged = false;
                    this.contactPictures = [];

                    // 格式化备份对象
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
                                            attrValue: ''
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

                    // 根据初始对象重置数据 + 继承"线索录询盘框"数据
                    this.contact = this.$deepClone(Object.assign({}, this.contact_backup, this.ctData || {}));
                    this.contactPictures = this.$deepClone((this.ctPictures || []));
                },
                immediate: true
            },
            inquiry_item_all: {
                handler(val) {
                    // 初始化备份对象
                    this.inquiry_backup = {};

                    // 初始化其他相关属性
                    this.list_documents = [];

                    // 格式化备份对象
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

                    // 根据初始对象重置数据 + 继承"线索录询盘框"数据
                    this.inquiry = this.$deepClone(Object.assign({}, this.inquiry_backup, this.iqData || {}));
                    this.list_documents = this.$deepClone(this.iqDocuments || []);
                    this.estimatedInquiryAmount = null;
                    this.estimatedInquiryAmountCurrency = 'CNY';
                },
                immediate: true
            }
        }
    };
</script>
