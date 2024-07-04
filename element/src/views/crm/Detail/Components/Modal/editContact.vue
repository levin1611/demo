<template>
    <div>
        <Modal :visible="visible"
               :title="$t('crm.Modal.title_editContact')"
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
            <Spin fix v-if="loading"></Spin>
            <Form
                    ref="editContactFrom"
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
                    <CrmInputArea :data.sync="tempContactDetail"
                                  :items="contact_item_all"
                                  :selectOptions="computed_selectOptions"
                                  :pictures.sync="contactPictures"
                                  operateType="edit"
                                  :email_editing="email_editing"
                                  :email_saving="email_saving"
                                  @editMail="editMail"
                                  @uniqSocialPlatforms="uniqSocialPlatforms"
                                  @uniqPhoneNumber="uniqContact({ field: 'phone', value: $event })"
                                  @uniqContact="uniqContact"></CrmInputArea>
                </div>
            </Form>
            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button type="primary" @click="ok" class="piwik_edit_contact" :disabled="loading">{{ $t('crm.Modal.modal_ok') }}</Button>
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

    </div>
</template>

<script>
    import Utils from '@/utils/index';
    import { mapState, mapGetters } from 'vuex';
    import UniqContact from '@/views/crm/Detail/Components/Modal/uniqContact';
    import UniqEmailSuffix from '@/views/crm/Detail/Components/Modal/uniqEmailSuffix';
    import UniqSocialPlatforms from '@/views/crm/Detail/Components/Modal/uniqSocialPlatforms';
    import CrmInputArea from '@/views/crm/Detail/Components/Modal/fixed-modal-form/crm-input-area';
    import { GET_EMAIL_SUFFIX } from '@/api/mail';
    import { crmContacts, crmClue } from '@/api/crm/index';

    export default {
        name: 'editContact',
        components: {
            CrmInputArea,
            UniqContact,
            UniqEmailSuffix,
            UniqSocialPlatforms
        },
        props: [
            'visible',
            'flag_update_detail',
            'flag_update_contact',
            'noRefresh',
            'contactId',
            'contact_columns_authorized',
            'userIdsShow',
            'companyId',
            'saleId'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                showUniq: state => state.crm.showUniq,
                allowMerge: state => state.crm.allowMerge,
                selectOptions: state => state.crm.selectOptions,
                socialPlatformIds: state => state.crm.socialPlatformIds
            }), // 从 vuex 中获取属性
            ...mapGetters([
                // 字段长度校验
                'check_length_default',
                'check_length_custom',
                'contact_items'
            ]),
            computed_selectOptions() {
                if (this.selectOptions) {
                    const result = {};
                    Object.entries(this.$deepClone(this.selectOptions)).forEach(([key, value]) => {
                        result[key] = value.filter(item => item.isAvailable === 1);
                    });
                    return result;
                }
            }, // 获取使用中(未停用)的通用设置下拉选项
            contact_item_default() {
                const temp = Array.isArray(this.contact_columns_authorized.default) ? this.contact_columns_authorized.default.slice() : undefined;
                return temp;
            },
            contact_item_custom() {
                return this.contact_columns_authorized.custom;
            },
            contact_item_all() {
                if (this.contact_columns_authorized) {
                    return this.contact_items(this.contact_columns_authorized);
                }
            }
        },
        data() {
            return {
                loading: false,
                contactDetail: {},
                tempContactDetail: {},
                contactPictures: [],
                birthdayLimit: {
                    disabledDate(date) {
                        return date && date.valueOf() > Date.now() - 86400000;
                    }
                },
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

                /* 修改邮件地址 */
                email_editing: false,
                email_saving: false,

                close_popper: this.$debounce((e) => {
                    if (e && e.target && e.target.classList.contains('el-dialog__body')) {
                        // 关闭 select 下拉选框
                        const selectEl = this.$refs.currentModal.$el.querySelector('.is-focus');
                        if (selectEl) {
                            selectEl.click();
                        }
                    }
                }, undefined, true)
            };
        },
        methods: {
            async ok() {
                // 如果当前正在录入, 则退出录入
                if (this.loading) {
                    this.$Message.warning(this.$t('mail.customerBox.requestTip'));
                    return;
                }

                // 各种合法性校验
                // 图片是否上传完成
                if (Array.isArray(this.contactPictures) && this.contactPictures.some(item => item.uploading)) {
                    this.$Message.warning(this.$t('crm.Modal.info_contactPictureUploading'));
                    return;
                }
                // 联系人邮箱是否编辑完成
                if (this.email_editing) {
                    this.$Message.error(this.$t('crm.Modal.error_editMailUnfinished'));
                    return;
                }
                // 联系人姓名不能为空
                if (this.tempContactDetail.nickName && this.tempContactDetail.nickName.trim() === '') {
                    this.$Message.error(this.$t('crm.Modal.error_emptyNickName'));
                    return;
                }
                // 验证WhatsApp字段 & 去掉whatsApp中间的空格
                if (this.tempContactDetail.whatsApp) {
                    this.tempContactDetail.whatsApp = this.tempContactDetail.whatsApp.replace(/( )|(　)/g, '');
                    if (!(/^[ \-_`~!@#$%^&*()+=|{}':;",\[\].<>/?~！@#￥%……&*（）——+\d]+$/i.test(this.tempContactDetail.whatsApp))) {
                        this.$Message.error(this.$t('crm.Modal.error_whatsAppFormat'));
                        return;
                    }
                }
                // 校验社交平台信息是否填完整
                if (this.tempContactDetail.socialNetworkingPlatform && this.tempContactDetail.socialNetworkingPlatform.length && (this.socialPlatformsFlag() === '1' || this.socialPlatformsFlag() === '2')) {
                    const str = this.socialPlatformsFlag() === '2' ? '社交平台分类不能为空' : '社交平台内容不能为空';
                    this.$Message.error(str);
                    return;
                }
                // 必填字段校验
                let tempErrorField = '';
                if (this.contact_item_all.some(item => {
                    // 特殊字段, 值为对象数组, phone 或 socialNetworkingPlatform
                    if (item.mustInput === 1) {
                        if (item.storageName === 'phone') {
                            tempErrorField = item.cname;
                            return !this.tempContactDetail[item.storageName].some(item => item.phoneNumber.trim().length);
                        } else if (item.storageName === 'socialNetworkingPlatform') {
                            tempErrorField = item.cname;
                            return !this.tempContactDetail[item.storageName].some(item => item.attrName && item.attrValue.trim().length);
                        } else if (item.storageName === 'picture') {
                            if (this.contactPictures.length === 0) {
                                tempErrorField = item.cname;
                                return true;
                            }
                        } else {
                            // 常规字段, 值为字符串或数组类型
                            if (!this.tempContactDetail[item.storageName] || this.tempContactDetail[item.storageName].length === 0) {
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

                // 如果当前正在录入, 则退出录入
                if (this.loading) {
                    this.$Message.warning(this.$t('mail.customerBox.requestTip'));
                    return;
                }
                // 处理 手机号中间的空格
                if (this.tempContactDetail.phone && this.tempContactDetail.phone.length) {
                    this.tempContactDetail.phone.forEach(item => {
                        item.phoneNumber = item.phoneNumber.replace(/( )|(　)/g, '');
                    });
                }
                // 正体
                this.loading = true;
                const temp = Object.assign({}, this.tempContactDetail);

                let have_phone = false; // 标记权限接口返回的字段中是否有 phone 字段
                const send_data = {
                    id: this.contactId,
                    orgId: this.enterpriseId
                };
                this.contact_item_all.forEach(item => {
                    if (item.isOnlyRead !== 1) {
                        switch (item.storageName) {
                            case 'email':
                                // 目前不可编辑联系人邮箱
                                break;
                            case 'phone':
                                have_phone = true;
                                break;
                            case 'picture':
                                send_data.picture = this.contactPictures.map(item => item.url).join(';');
                                temp.picture = this.contactPictures.map(item => item.url).join(';');
                                break;
                            case 'socialNetworkingPlatform':
                                temp.socialNetworkingPlatform = (Array.isArray(temp.socialNetworkingPlatform) && temp.socialNetworkingPlatform.length) ? temp.socialNetworkingPlatform.map(item => {
                                    if (item.attrName && item.attrValue) {
                                        return {
                                            attrId: this.getPlatformId(item.attrName),
                                            attrName: item.attrName,
                                            attrValue: item.attrValue
                                        };
                                    }
                                }).filter(item => {
                                    return !(!item || item === '');
                                }) : [];
                                send_data.socialNetworkingPlatform = JSON.stringify(temp.socialNetworkingPlatform);
                                break;
                            default:
                                switch (item.colType) {
                                    case 'selectMultiple':
                                        const str = Array.isArray(temp[item.storageName]) ? JSON.stringify(temp[item.storageName]) : JSON.stringify([]);
                                        send_data[item.storageName] = str;
                                        break;
                                    case 'select':
                                        send_data[item.storageName] = temp[item.storageName] || '';
                                        break;
                                    default:
                                        send_data[item.storageName] = temp[item.storageName];
                                }
                        }
                    }
                });

                // WhatsApp 查重
                if (this.loading && this.showUniq.whatsapp === '1' && temp.hasOwnProperty('whatsApp') && temp.whatsApp && temp.whatsApp.trim()) {
                    // whatsApp 查重
                    const res_uniqContact = await this.$commonApi.checkContact({
                        orgId: this.enterpriseId,
                        id: this.contactId,
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
                // 电话查重
                if (this.loading && have_phone) {
                    // 电话
                    temp.phone = temp.phone ? [...new Set(temp.phone.map(item => {
                        return item.phoneNumber;
                    }).filter(item => {
                        return !(!item || item === '');
                    }))] : null;
                    // 不查重this.showUniq.phone，'0'不查重，'1'查重
                    if (this.showUniq.phone !== '0' && temp.phone.length > 0) {
                        const res_uniqPhone = await crmContacts.isSameField({
                            contactsId: this.contactId,
                            orgId: this.enterpriseId,
                            field: 'phone',
                            values: temp.phone.join(',')
                        });

                        if (res_uniqPhone.code === '1') {
                            // 弹出查重框
                            this.uniqContact({ field: 'phone', value: temp.phone[0], uniqDirectly: true });
                            // 弹出重复警告(等查重框弹出后再弹出, 避免被查if (uniqDirectly) {重框遮罩层盖住)
                            setTimeout(() => {
                                this.$Message.warning(this.$t('crm.Modal.info_enterUniqContact').replace(/\$field/g, this.$t('crm.Table.col_phone')));
                            });
                            // 停止录入操作
                            this.loading = false;
                        } else {
                            send_data.phone = temp.phone.join(',');
                        }
                    } else {
                        send_data.phone = temp.phone.join(',');
                    }
                }

                // Instagram 查重
                if (this.loading && this.showUniq.instagram === '1' && temp.hasOwnProperty('instagram') && temp.instagram && temp.instagram.trim()) {
                    // Instagram 查重
                    const res_uniqContact = await this.$commonApi.checkContact({
                        orgId: this.enterpriseId,
                        id: this.contactId,
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
                if (this.loading && this.showUniq.socialPlatform === '1' && this.tempContactDetail.socialNetworkingPlatform && this.tempContactDetail.socialNetworkingPlatform.length) {
                    let result = await this.socialPlatformsCheckDuplicate();
                    if (result.length) {
                        this.$Message.warning(this.$t('crm.Modal.info_enterUniqSocialPlatformLink').replace(/\$fieldName/g, result[0].attrName).replace(/\$fieldVal/g, result[0].attrValue));
                        // 停止录入操作
                        this.loading = false;
                    }
                }
                // 查重通过, 数据格式化, 存入待发送数据对象中
                if (this.loading) {
                    /**
                     * @Description: 与后端确认，更新联系人信息的接口中，nickName不传/传空都不会更改原值。
                     *               所以此处去掉改行代码，在nickName被设置为只读时，update接口不会传这个字段给后台。
                     * @author 杨娣
                     * @date 2020/6/14
                    */
                    // send_data.nickName = send_data.nickName || '';

                    /* 检验字段是否超长 */
                    if (this.check_length_default('contact_field_long_limit', send_data) || this.check_length_custom('contact_item_custom', this.contact_item_custom, send_data)) {
                        this.loading = false;
                        return false;
                    }
                    send_data.email = this.tempContactDetail.email ? this.tempContactDetail.email.trim() : '';
                    this.update_contact(send_data, temp);
                }
            },
            async update_contact(data, temp) {
                crmContacts.update(data).then(response => {
                    if (response.code === '1') {
                        const sentPrevObj = Object.assign({}, this.contactDetail);
                        if (sentPrevObj.phone.length === 1 && sentPrevObj.phone[0] === '') {
                            sentPrevObj.phone = [];
                        } // 防止出现 prevObj.phone 为 [""] 而 currentObj.phone 为 [] 导致发送错误日志
                        const sentCurrentObj = Object.assign({}, temp);
                        sentCurrentObj.socialNetworkingPlatform = temp.socialNetworkingPlatform && temp.socialNetworkingPlatform.length > 0 ? temp.socialNetworkingPlatform.map(item => {
                            return {
                                attrId: item.attrId,
                                attrName: item.attrName,
                                attrValue: item.attrValue
                            };
                        }) : [{
                            attrName: '',
                            attrValue: ''
                        }];
                        // 这里是因为 socialNetWorkingPlatform 数组项对象会莫名其妙地多个 type: '' 属性,一直没找到原因,干脆重新弄一个对象算了
                        this.$saveLog({
                            operateType: 2,
                            operateModule: 2,
                            contactId: this.contactId,
                            targetId: this.contactId,
                            enterpriseId: this.enterpriseId.toString(),
                            userId: this.userId,
                            fullName: this.fullName,
                            prevObj: sentPrevObj,
                            currentObj: sentCurrentObj
                        }, 'contact');
                        this.$Message.success(this.$t('crm.Modal.success_editContact'));
                        if (temp.phone.length === 0) {
                            temp.phone = [''];
                        }
                        if (!temp.socialNetworkingPlatform || temp.socialNetworkingPlatform.length === 0) {
                            temp.socialNetworkingPlatform = [{
                                attrName: '',
                                attrValue: '',
                                isShow: false
                            }];
                        }
                        this.$emit('update:flag_update_detail', !this.flag_update_detail);
                        this.$emit('refreshContact');
                        this.$emit('refreshCheck');
                        this.cancel();
                    } else {
                        this.loading = false;
                        this.$Message.error(response.message);
                    }
                }, error => {
                    this.loading = false;
                }).catch(error => {
                    this.loading = false;
                });
            },
            // 校验社交平台字段是否有未填项
            socialPlatformsFlag() {
                for (let i = 0; i < this.tempContactDetail.socialNetworkingPlatform.length; i++) {
                    const item = this.tempContactDetail.socialNetworkingPlatform[i];
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
                for (let i = 0; i < this.tempContactDetail.socialNetworkingPlatform.length; i++) {
                    const item = this.tempContactDetail.socialNetworkingPlatform[i];
                    if (item.isShow) {
                        const res_uniqSocialPlatforms = await this.$commonApi.checkContact({
                            orgId: this.enterpriseId,
                            attrValue: item.attrValue.trim(),
                            attrName: item.attrName,
                            id: this.contactId
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
                this.$emit('update:visible', false);
                this.email_editing = false;
                this.contactPictures = [];
                // 页面回到顶部
                this.$refs.currentModal.$el.querySelector('.el-dialog__body').scrollTop = 0;
            },
            addPhone() {
                this.tempContactDetail.phone.push({ phoneNumber: '' });
            },
            deletePhone(index) {
                this.tempContactDetail.phone.splice(index, 1);
            },
            addPlatform() {
                this.tempContactDetail.socialNetworkingPlatform.push({
                    attrName: '',
                    attrValue: '',
                    isShow: false
                });
            },
            deletePlatform(index) {
                this.tempContactDetail.socialNetworkingPlatform.splice(index, 1);
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
            changeDate(date, timeType, key) {
                if (key === 'birthday') {
                    this.tempContactDetail.birthday = (new Date(date)).format('yyyy-MM-dd');
                } else {
                    switch (timeType) {
                        case 'date':
                            this.tempContactDetail[key] = (new Date(date)).format('yyyy-MM-dd');
                            break;
                        case 'date+time':
                            this.tempContactDetail[key] = (new Date(date)).format('yyyy-MM-dd hh:mm:ss');
                    }
                }
            },
            /* 去重 */
            // 联系人字段查重(邮箱/电话/WhatsApp / Instagram)
            async uniqContact({ field, value, uniqDirectly, noSuccessNotice }) {
                // 组装发送数据, 组装多语言
                const params = {
                    orgId: this.enterpriseId,
                    id: this.contactId
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
            // 获取联系人详情
            get_contact_detail() {
                this.loading = true;
                this.contactDetail = {};
                crmContacts.getContacts({
                    id: this.contactId
                }).then(response => {
                    if (response.code === '1') {
                        this.contactDetail = response.data;
                        this.contactDetail.phone = this.contactDetail.phone ? this.contactDetail.phone.split(',') : [''];
                        if (this.contactDetail.socialNetworkingPlatform) {
                            let temp = [{
                                attrName: '',
                                attrValue: ''
                            }];
                            try {
                                temp = JSON.parse(this.contactDetail.socialNetworkingPlatform).length ? JSON.parse(this.contactDetail.socialNetworkingPlatform) : [{
                                    attrName: '',
                                    attrValue: '',
                                    isShow: false
                                }];
                            } catch (e) {
                            }
                            this.contactDetail.socialNetworkingPlatform = temp.length ? temp.map(item => {
                                if (item.attrName) {
                                    return {
                                        attrId: item.attrId || this.getPlatformId(item.attrName),
                                        attrName: item.attrName,
                                        attrValue: item.attrValue,
                                        isShow: this.socialPlatformIds.some((self) => item.attrName === self.attrName && self.socialValue === '1')
                                    };
                                }
                                return {
                                    attrName: '',
                                    attrValue: '',
                                    isShow: false
                                };
                            }) : [{
                                attrName: '',
                                attrValue: '',
                                isShow: false
                            }];
                        } else if (this.contactDetail.socialNetworkingPlatform === null) {
                            this.contactDetail.socialNetworkingPlatform = [{
                                attrName: '',
                                attrValue: '',
                                isShow: false
                            }];
                        }

                        this.tempContactDetail = this.$deepClone(this.contactDetail);
                        if (this.tempContactDetail.hasOwnProperty('phone')) {
                            this.tempContactDetail.phone = this.tempContactDetail.phone.length ? this.tempContactDetail.phone.map(item => {
                                return {
                                    phoneNumber: item
                                };
                            }) : [{ phoneNumber: '' }];
                        }

                        this.contactPictures = this.contactDetail.picture ? this.contactDetail.picture.split(';').map(item => {
                            return {
                                url: item
                            };
                        }) : [];

                        // 格式化多选字符串值
                        this.contact_item_all.filter(item => item.colType === 'selectMultiple').forEach(item => {
                            this.tempContactDetail[item.storageName] = this.$options.filters.parseArray(this.tempContactDetail[item.storageName]);
                        });
                    } else {
                        this.$Message.error(this.$t('crm.Detail.error_getContactInfo'));
                    }
                    this.loading = false;
                }, error => {
                    this.loading = false;
                }).catch(error => {
                    this.loading = false;
                });
            }, // 获取询盘信息和询盘所属公司信息
            /* 修改邮件地址 */
            async editMail() {
                if (this.email_editing) {
                    const emailList = this.contact_item_all.filter(item => item.storageName === 'email');
                    if (emailList[0].mustInput === 1 && !this.tempContactDetail.email) {
                        this.$Message.error(this.$t('crm.Modal.error_emptyEmail'));
                        return;
                    }
                    // 如果编辑前后一致, 直接提示"编辑成功", 不发请求
                    if (this.tempContactDetail.email === this.contactDetail.email) {
                        this.email_editing = false;
                        this.$Message.success(this.$t('crm.UniSet.success_edit'));
                        return;
                    }
                    // 邮箱格式是否规范
                    const emailReg = Utils.regExp.fullEmail;
                    if (this.tempContactDetail.email && !emailReg.test(this.tempContactDetail.email)) {
                        this.$Message.error(this.$t('crm.Modal.error_emailFormat'));
                        return;
                    }

                    // 邮箱后缀查重
                    if (this.showUniq.emailSuffix === '1' && this.tempContactDetail.email) {
                        const res_getRepeatData = await this.$commonApi.getContactRepeatData({
                            orgId: this.enterpriseId,
                            emailSuffix: GET_EMAIL_SUFFIX(this.tempContactDetail.email)
                        });

                        if (res_getRepeatData.code === '1') {
                            if (Array.isArray(res_getRepeatData.data) && res_getRepeatData.data.length) {
                                // 有重复
                                if (!res_getRepeatData.data.some(item => `${item.companyId}` === `${this.companyId}`)) {
                                    // 如果重复数据中没有当前客户 id

                                    // 弹出查重框
                                    this.uniqEmailSuffixVal = this.tempContactDetail.email;
                                    this.uniqEmailSuffixVisible = true;

                                    // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                                    setTimeout(() => {
                                        this.$Message.warning(this.$t('crm.Modal.info_enterUniqEmailSuffix').replace(/\$field/g, GET_EMAIL_SUFFIX(this.tempContactDetail.email)));
                                    });

                                    // 停止编辑操作
                                    return;
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

                    if (!this.email_saving) {
                        this.email_saving = true;
                        crmContacts.updateContactsEmail({
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            contactsId: this.contactId,
                            nickName: this.contactDetail.nickName,
                            oldEmail: this.contactDetail.email,
                            newEmail: this.tempContactDetail.email
                        }).then(res => {
                            if (res.code === '1' && res.data === true) {
                                // 调用客户箱手动归并的接口
                                /**
                                 * @Description: 在联系人详情页编辑联系人，则客户箱归并接口所传的createUserId应为联系人详情页显示的负责人id
                                 * @author 杨娣
                                 * @date 2020/5/27
                                 */
                                // 邮箱非必填
                                if (this.tempContactDetail.email) {
                                    crmClue.mergerMail({
                                        emailAddress: this.tempContactDetail.email,
                                        createUserId: this.saleId,
                                        orgId: this.enterpriseId,
                                        inquiryId: Array.isArray(this.contactDetail.inquiryList) ? this.contactDetail.inquiryList[0].id : undefined
                                    });
                                    // 联系人邮箱关联到邮件系统
                                    crmClue.addTimeAxis({
                                        address: this.tempContactDetail.email,
                                        createUserId: this.userIdsShow,
                                        orgId: this.enterpriseId,
                                        contactsId: this.contactId,
                                        companyId: this.companyId,
                                        inquiryId: Array.isArray(this.contactDetail.inquiryList) ? this.contactDetail.inquiryList[0].id : undefined
                                    });
                                }
                                this.$Message.success(this.$t('crm.UniSet.success_edit'));
                                this.$saveLog({
                                    operateType: 2,
                                    operateModule: 2,
                                    contactId: this.contactId,
                                    targetId: this.contactId,
                                    enterpriseId: this.enterpriseId.toString(),
                                    userId: this.userId,
                                    fullName: this.fullName,
                                    prevObj: {
                                        email: this.contactDetail.email
                                    },
                                    currentObj: {
                                        email: this.tempContactDetail.email
                                    }
                                }, 'contact');
                                this.email_editing = false;
                                this.contactDetail.email = this.tempContactDetail.email;
                                this.$emit('update:noRefresh', true);
                                this.$emit('update:flag_update_detail', !this.flag_update_detail);
                                this.$emit('refreshCheck');
                            } else {
                                if (res.message) {
                                    this.$Message.error(res.message);
                                } else {
                                    this.$Message.error(this.$t('crm.UniSet.error_edit'));
                                }
                            }
                            this.email_saving = false;
                        }, error => {
                            this.email_saving = false;
                        }).catch(error => {
                            this.email_saving = false;
                        });
                    }
                } else {
                    this.email_editing = true;
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
                    attrName,
                    id: this.contactId
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
        created() {
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        this.get_contact_detail();
                    }
                },
                immediate: true
            }
        }
    };
</script>
