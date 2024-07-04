<template>
    <div>
        <Modal :visible="visible"
               :title="$t('crm.Modal.title_newContact')"
               width="778px"
               class="modal draggable-dialog"
               :show-close="true"
               :modal="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               :append-to-body="true"
               v-dialog-drag
               @close="cancel"
               @scroll.native.capture="close_popper"
               ref="currentModal">
            <!-- loading -->
            <Spin fix v-if="loading"></Spin>
            <Form
                    ref="newContactForm"
                    :inline="true"
                    :validate-on-rule-change="false"
                    class="_form-custom"
                    label-position="right"
                    label-width="115px"
            >
                <!-- 联系人 -->
                <!-- <h1 class="title">{{ $t('crm.Modal.title_contact') }}</h1> -->
                <div class="wrap">
                    <!-- 顶部导航，添加选择询盘 -->
                    <template v-if="['quickEntrance', 'contactList'].includes(modelType)">
                        <div class="_form_margin" style="display: flex;">
                            <FormItem :required="true" class="width-365px">
                                <template slot="label">
                                    <span class="company_name_lable">{{$t('main.customerName')}}</span>
                                </template>
                                <Input
                                    v-model.trim="companyInfo.companyName"
                                    maxlength="100"
                                    readonly
                                    :disabled="modelType === 'contactList'"
                                    style="width:186px;"
                                    :placeholder="$t('main.customName')"
                                >
                                </Input>
                                <Button type="text" class="select_company" v-if="modelType !== 'contactList'" @click="select_company_modal=true">{{$t('crm.followUpRecord.select')}}</Button>
                            </FormItem>
                            <FormItem :required="true" class="width-365px">
                                <template slot="label">
                                    <span class="company_name_lable">{{$t('main.inquiryNo')}}</span>
                                </template>
                                <Select v-model="selectInquiry"
                                        filterable
                                        style="width:186px;"
                                        @change="changeInquiry"
                                        :placeholder="$t('main.inquiryNoPla')">
                                    <Option v-for="item in existedInquiryList"
                                            :key="item.id"
                                            :value="item.id"
                                            :label="item.seqNumber">
                                            <span>{{item.seqNumber}}</span>
                                            <span v-if="item.isMainInquiry === 1" style="color:rgb(245, 166, 35);position: relative;bottom:2px;left: 8px;" class="custom custom-main-contact"></span>
                                        </Option>
                                </Select>
                                <!-- <Input
                                    v-model.trim="companyInfo.companyName"
                                    maxlength="100"
                                    readonly
                                    style="width:186px;"
                                    :placeholder="$t('crm.Modal.tip_select')"
                                >
                                </Input> -->
                            </FormItem>
                        </div>
                        <h1 class="title" style="margin-left: 20px;">{{ $t('crm.Modal.title_contact') }}</h1>
                    </template>
                    <!-- 切换: 关联已有联系人 || 新增联系人 -->
                    <RadioGroup v-if="existedContactList.length"
                                v-model="createContactType"
                                class="create-contact-type-radio">
                        <!-- 关联已有联系人 -->
                        <Radio label="link"
                               :disabled="loading"
                               class="piwik_newContact_link_existed_contact">
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
                        <Select v-model="existedContactIds"
                                multiple
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
                    </template>
                </div>
            </Form>
            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button v-if="is_all_field_requested"
                        type="primary"
                        :disabled="loading"
                        @click="ok"
                        class="piwik_new_contact">{{ $t('crm.Modal.modal_ok') }}</Button>
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
    import CrmInputArea from '@/views/crm/Detail/Components/Modal/fixed-modal-form/crm-input-area';
    import UniqContact from '@/views/crm/Detail/Components/Modal/uniqContact';
    import UniqEmailSuffix from '@/views/crm/Detail/Components/Modal/uniqEmailSuffix';
    import UniqSocialPlatforms from '@/views/crm/Detail/Components/Modal/uniqSocialPlatforms';
    import selectCompany from '@/views/crm/Table/Components/Modal/followUpRecord/selectCompany';
    import { GET_EMAIL_SUFFIX } from '@/api/mail';
    import { crmContacts, crmInquiry, crmClue } from '@/api/crm/index';
    import { mapState, mapGetters } from 'vuex';
    export default {
        name: 'newContact',
        components: {
            CrmInputArea,
            UniqContact,
            UniqEmailSuffix,
            UniqSocialPlatforms,
            selectCompany
        },
        props: [
            'visible',
            'flag_update_contact',
            'inquiryId',
            // 'clueId',
            'companyId',
            'companyName',
            // 'saleId',
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
                selectOptions: state => state.crm.selectOptions
            }), // 从 vuex 中获取属性
            ...mapGetters([
                // 字段长度校验
                'check_length_default',
                'check_length_custom',
                'contact_items'
            ]),
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
            }
        },
        data() {
            return {
                /* 多语言 */
                contact_columns_authorized: {
                    default: [],
                    custom: []
                },
                is_all_field_requested: false,

                /* 正体 */
                /* 选择新增联系人方式: 关联已有联系人 || 新增联系人 */
                createContactType: '',
                existedContactList: [],
                existedContactIds: [],
                loading: false,
                contact: {},
                companyInfo: {
                    companyName: '',
                    companyId: ''
                },
                contact_backup: {}, // 方便清空数据
                birthdayLimit: {
                    disabledDate(date) {
                        return date && date.valueOf() > Date.now() - 86400000;
                    }
                },
                contactPictures: [],
                contactMerged: false,
                /* 联系人查重并入 */
                // uniqMailVisible: false,
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

                close_popper: this.$debounce((e) => {
                    if (e && e.target && e.target.classList.contains('el-dialog__body')) {
                        // 关闭 select 下拉选框
                        const selectEl = this.$refs.currentModal.$el.querySelector('.is-focus');
                        if (selectEl) {
                            selectEl.click();
                        }
                    }
                }, undefined, true),

                isMainContact: false,
                select_company_modal: false,
                checkedCompany: null,
                existedInquiryList: [],
                selectInquiry: null
            };
        },
        methods: {
            handleCompany(item) {
                this.companyInfo = item;
                this.companyId = item.companyId;
                this.companyName = item.companyName;
                this.existedInquiryList = [];
                const dataJson = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    companyId: this.companyInfo.companyId,
                    pageNo: 1,
                    listType: 2
                };
                crmClue.getInquiryListByCompany(dataJson).then(response => {
                    if (response.code === '1') {
                        const temp = (response.data && Array.isArray(response.data.list)) ? response.data.list.sort((a, b) => b.isMainInquiry - a.isMainInquiry) : [];
                        this.existedInquiryList = temp.map(item => {
                            const { id, seqNumber, isMainInquiry } = item;
                            return { id, seqNumber, isMainInquiry };
                        });
                        this.selectInquiry = this.existedInquiryList[0].id;
                        this.get_existed_contact_list();
                    }
                }).catch(error => {
                    console.error(error);
                });
            },
            changeInquiry(item) {
                this.inquiryId = item;
                this.existedContactIds = [];
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
                this.$commonApi.getAllColumns({
                    orgId: this.enterpriseId,
                    parentId: 0,
                    userId: this.userId
                }).then(res => {
                    if (res.code === '1') {
                        const { customColumn, defaultColumn } = res.data;
                        defaultColumn.forEach(item => {
                            if (`${item.parentId}` === '2') {
                                // 字段显示为多语言
                                if (this.lang_contact.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_contact[item.storageName];
                                }
                                this.$set(this.contact_columns_authorized.default, this.contact_columns_authorized.default.length, item);
                            }
                        });
                        customColumn.show.forEach(field => {
                            if (`${field.parentId}` === '2') {
                                field.colType = field.type;
                                this.$set(this.contact_columns_authorized.custom, this.contact_columns_authorized.custom.length, field);
                            }
                        });
                        this.is_all_field_requested = true;
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_get_all_fields_for_newCreate'));
                    }
                    this.loading = false;
                }).catch(() => {
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
                    companyId: this.companyId,
                    excludeInquiryId: this.inquiryId || this.selectInquiry
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
                let inquiryId = this.inquiryId;
                let companyId = this.companyId;
                if (['quickEntrance', 'contactList'].includes(this.modelType)) {
                    if (!this.selectInquiry || !this.companyInfo.companyId) {
                        this.$Message.error(this.$t('main.newContactError'));
                        return;
                    }
                    inquiryId = this.selectInquiry;
                    companyId = this.companyInfo.companyId;
                }

                // 检查是否关联已有联系人
                if (this.createContactType === 'link') {
                    if (this.existedContactIds.length) {
                        this.loading = true;
                        // 关联已有联系人
                        const data = {
                            orgId: this.enterpriseId,
                            companyId: companyId,
                            inquiryId: inquiryId,
                            contactsIdList: this.existedContactIds
                        };
                        const res_setContacts = await crmContacts.addContactsList(data);
                        if (res_setContacts && res_setContacts.code === '1') {
                            // 关联成功
                            this.$Message.success(this.$t('crm.Modal.success_newContact'));
                            // 这里是传给动态组件，告诉里面设置有 watch flag_update_contact 的动态组件该重新获取联系人列表了
                            this.$emit('update:flag_update_contact', !this.flag_update_contact);
                            // 关闭弹窗
                            this.cancel();
                        } else {
                            // 关联失败
                            this.$Message.error(this.$t('crm.Modal.error_newContact'));
                        }
                        // 取消 loading
                        this.loading = false;
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_selectExistedContacts'));
                    }
                    // 退出流程, 不往下执行
                    return;
                }

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
                // 校验社交平台信息是否填完整
                if (this.contact.socialNetworkingPlatform && this.contact.socialNetworkingPlatform.length && (this.socialPlatformsFlag() === '1' || this.socialPlatformsFlag() === '2')) {
                    const str = this.socialPlatformsFlag() === '2' ? '社交平台分类不能为空' : '社交平台内容不能为空';
                    this.$Message.error(str);
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

                // 显示 loading
                this.loading = true;
                // 邮箱去重
                if (this.contact.email) {
                    const sameContactsEmailData = {
                        orgId: this.enterpriseId,
                        email: this.contact.email
                    };
                    const res_uniqEmail = await crmContacts.sameContactsEmail(sameContactsEmailData);
                    if (res_uniqEmail.code === '1') {
                        // 如果邮件有重复
                        if (this.allowMerge === '1') {
                            // 如果允许合并
                            if (this.contactMerged) {
                                // 已合并
                                // 发送并入联系人请求
                                const setContactsData = {
                                    inquiryId: inquiryId,
                                    contactsId: this.newContactId
                                };
                                const res_setContacts = await crmInquiry.setContacts(setContactsData);
                                this.loading = false;
                                if (res_setContacts.code === '1') {
                                    this.$Message.success(this.$t('crm.Modal.success_newContact'));
                                    this.$saveLog({
                                        operateType: 1,
                                        operateModule: 2,
                                        inquiryId: inquiryId,
                                        mergedId: this.newContactId,
                                        enterpriseId: this.enterpriseId.toString(),
                                        userId: this.userId,
                                        fullName: this.fullName
                                    });
                                    this.$emit('update:flag_update_contact', !this.flag_update_contact); // 这里是传给动态组件，告诉里面设置有 watch flag_update_contact 的动态组件该重新获取联系人列表了
                                    this.cancel();
                                } else {
                                    this.$Message.error(this.$t('crm.Modal.error_newContact'));
                                    return;
                                }
                            } else {
                                // 未合并到已有联系人, 弹出合并提示并退出流程
                                this.loading = false;
                                this.$Message({
                                    dangerouslyUseHTMLString: true,
                                    type: 'error',
                                    message: this.$t('crm.Modal.error_existedEmailNeedMerge')
                                });
                                return;
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
                    const res_getRepeatData = await this.$commonApi.getContactRepeatData({
                        orgId: this.enterpriseId,
                        emailSuffix: GET_EMAIL_SUFFIX(temp.email.trim())
                    });

                    if (res_getRepeatData.code === '1') {
                        if (Array.isArray(res_getRepeatData.data) && res_getRepeatData.data.length) {
                            // 有重复

                            if (!res_getRepeatData.data.some(item => `${item.companyId}` === `${companyId}`)) {
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
                    let sendContactData = Object.assign({
                        orgId: this.enterpriseId,
                        inquiryId: inquiryId
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
                    sendContactData = this.remove_attr_readonly(sendContactData, 'contact');

                    this.save_contact(sendContactData);
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
            async save_contact(data) {
                let inquiryId = this.inquiryId;
                let companyId = this.companyId;
                let companyName = this.companyName;
                if (['quickEntrance', 'contactList'].includes(this.modelType)) {
                    inquiryId = this.selectInquiry;
                    companyId = this.companyInfo.companyId;
                    companyName = this.companyInfo.companyName;
                }
                let prev_contactId = null; // 询盘之前的主联系人id
                if (this.isMainContact) {
                    data.isMainContact = 2;
                    prev_contactId = await new Promise(resolve => {
                        crmContacts.getContactsListByInquiry({
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            id: inquiryId,
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
                    companyId: companyId,
                    companyName: companyName
                }, data);
                crmContacts.saveContacts(saveData).then(async response => {
                    this.loading = false;
                    if (response.code === '1') {
                        // 邮箱非必填
                        if (this.contact.email) {
                            await crmInquiry.getSimpleInquiry({ id: inquiryId }).then(res => {
                                if (res.code === '1') {
                                    const clueId = res.data.clueId;
                                    const saleId = res.data.userIdsShow;
                                    crmClue.addTimeAxis({
                                        address: this.contact.email,
                                        createUserId: this.userId,
                                        orgId: this.enterpriseId,
                                        contactsId: response.data,
                                        contactsName: data.nickName,
                                        companyId: companyId,
                                        inquiryId: inquiryId,
                                        clueId: clueId
                                    });
                                    /**
                                     * @Description: 在询盘详情页新增联系人，则客户箱归并接口所传的createUserId应为询盘负责人id
                                     * @author 杨娣
                                     * @date 2020/5/27
                                     */
                                    crmClue.mergerMail({
                                        emailAddress: this.contact.email,
                                        createUserId: saleId,
                                        orgId: this.enterpriseId,
                                        inquiryId: inquiryId
                                    });
                                }
                            });
                        }
                        this.$Message.success(this.$t('crm.Modal.success_newContact'));

                        // 记录询盘主联系人日志
                        if (prev_contactId !== null) {
                            this.saveLog_mainContact(inquiryId, response.data, prev_contactId);
                        }
                        this.$saveLog({
                            operateType: 1,
                            operateModule: 2,
                            inquiryId: inquiryId,
                            contactId: response.data,
                            enterpriseId: this.enterpriseId.toString(),
                            userId: this.userId,
                            fullName: this.fullName,
                            contactCurrentObj: data
                        });
                        this.$emit('refreshContact');
                        this.$emit('update:flag_update_contact', !this.flag_update_contact); // 这里是传给动态组件，告诉里面设置有 watch flag_update_contact 的动态组件该重新获取联系人列表了
                        this.cancel();
                    } else if (response.code === '0' && response.data === -7) {
                        this.$Message.error(this.$t('crm.Modal.error_enterpriseColleagueMail'));
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_newContact'));
                    }
                }, error => {
                    this.loading = false;
                }).catch(error => {
                    this.loading = false;
                });
            },
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
            cancel() {
                this.loading = false;
                this.$emit('update:visible', false); // 改变父组件的 控制本组件显示 属性
                // 联系人部分
                this.contact = this.$deepClone(this.contact_backup);
                this.contactPictures = [];
                this.contactMerged = false;
                this.isMainContact = false;
                this.existedContactIds = [];
                this.createContactType = '';
                if (this.modelType === 'quickEntrance') {
                    this.existedContactList = [];
                }

                // 页面回到顶部
                this.$refs.currentModal.$el.querySelector('.el-dialog__body').scrollTop = 0;
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
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    this.getAllField();
                    if (this.companyId) {
                        this.get_existed_contact_list();
                    }
                    this.existedInquiryList = [];
                    this.selectInquiry = null;
                    this.checkedCompany = null;
                    if (this.modelType === 'contactList') {
                        this.handleCompany({
                            companyName: this.companyName,
                            companyId: this.companyId
                        });
                    } else {
                        this.companyInfo = {
                            companyName: '',
                            companyId: ''
                        };
                    }
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