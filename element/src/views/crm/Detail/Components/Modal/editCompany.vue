<template>
    <div>
        <Modal :visible="visible"
               :title="$t('crm.Modal.title_editCompany')"
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
                    ref="editCompanyForm"
                    :inline="true"
                    :validate-on-rule-change="false"
                    class="_form-custom"
                    label-position="right"
                    label-width="115px"
            >
                <!-- 公司 -->
                <h1 class="title">{{ $t('crm.Modal.title_company') }}</h1>
                <div class="wrap">
                    <!-- 通用输入区域 -->
                    <CrmInputArea :data.sync="tempCompanyDetail"
                                  :items="corp_item_all"
                                  :selectOptions="computed_selectOptions"
                                  :contactAddressLatLng.sync="contactAddressLatLng"
                                  :pictures.sync="companyPictures"
                                  :error_countryArea.sync="error_countryArea"
                                  @uniqCompany="uniqCompany"></CrmInputArea>
                </div>
            </Form>
            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button class="piwik_edit_company" type="primary" @click="ok" :disabled="loading">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import CrmInputArea from '@/views/crm/Detail/Components/Modal/fixed-modal-form/crm-input-area';
    import { crmCompany } from '@/api/crm/index';
    import { mapState, mapGetters } from 'vuex';
    export default {
        name: 'editCompany',
        components: {
            CrmInputArea
        },
        props: [
            'visible',
            'companyId',
            'flag_update_detail',
            'corp_columns_authorized'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                selectOptions: state => state.crm.selectOptions
            }), // 从 vuex 中获取属性
            ...mapGetters([
                // 字段长度校验
                'check_length_default',
                'check_length_custom',
                'corp_items'
            ]),
            computed_selectOptions() {
                const result = {};
                Object.entries(this.$deepClone(this.selectOptions)).forEach(([key, value]) => {
                    result[key] = value.filter(item => item.isAvailable === 1);
                });
                result.companySourceWay = result.sourceWay;
                return result;
            }, // 获取使用中(未停用)的通用设置下拉选项
            corp_item_default() {
                const temp = Array.isArray(this.corp_columns_authorized.default) ? this.corp_columns_authorized.default.slice() : undefined;
                return temp;
            },
            corp_item_custom() {
                return this.corp_columns_authorized.custom;
            },
            corp_item_all() {
                if (this.corp_columns_authorized) {
                    return this.corp_items(this.corp_columns_authorized);
                }
            }
        },
        data() {
            return {
                loading: false,
                tempCompanyDetail: {},
                error_countryArea: false,
                companyPictures: [],
                companyDetail: {},
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
            get_company_detail() {
                this.loading = true;
                crmCompany.getCompany({
                    id: this.companyId
                }).then(response => {
                    if (response.code === '1') {
                        this.companyDetail = response.data;
                        this.tempCompanyDetail = this.$deepClone(this.companyDetail);
                        if (this.tempCompanyDetail.companyPicture) {
                            this.companyPictures = this.tempCompanyDetail.companyPicture.split(';').map(item => {
                                return {
                                    url: item
                                };
                            });
                        }
                        // 格式化多选字符串值
                        this.corp_item_all.filter(item => item.colType === 'selectMultiple').forEach(item => this.tempCompanyDetail[item.storageName] = this.$options.filters.parseArray(this.tempCompanyDetail[item.storageName]));
                    } else {
                        this.$Message.error(this.$t('crm.Detail.error_getCompanyInfo'));
                    }
                    this.loading = false;
                }, error => {
                    this.loading = false;
                }).catch(error => {
                    this.loading = false;
                });
            }, // 获取公司信息
            uniqCompany() {
                if (this.tempCompanyDetail.companyName !== '') {
                    crmCompany.sameCompanyName({
                        orgId: this.enterpriseId,
                        companyName: String(this.tempCompanyDetail.companyName),
                        id: this.tempCompanyDetail.id
                    }).then(response => {
                        if (response.data && this.tempCompanyDetail.companyName !== this.companyDetail.companyName) {
                            this.$Message.error(this.$t('crm.Modal.error_existedCompanyName'));
                        } else {
                            this.$Message.success(this.$t('crm.Modal.success_uniqCompanyName'));
                        }
                    });
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_emptyCompanyName'));
                }
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
                    this.$Message.warning(this.$t('crm.Modal.info_contactPictureUploading'));
                    return;
                }
                // 公司名不能为空
                if (this.tempCompanyDetail.companyName && !this.tempCompanyDetail.companyName.trim()) {
                    this.$Message.error(this.$t('crm.Modal.error_emptyCompanyName'));
                    return;
                }
                // 必填字段校验
                let tempErrorField = '';
                if (this.corp_item_all.some(item => {
                    if (item.mustInput === 1) {
                        if (item.storageName === 'companyPicture') {
                            if (this.companyPictures.length === 0) {
                                tempErrorField = item.cname;
                                return true;
                            }
                        } else {
                            if (!this.tempCompanyDetail[item.storageName] || this.tempCompanyDetail[item.storageName].length === 0) {
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

                // 正体
                this.loading = true;

                // 校验公司名
                if (this.corp_item_all.some(item => item.storageName === 'companyName') && this.tempCompanyDetail.companyName !== this.companyDetail.companyName) {
                    const res_uniqCompanyName = await crmCompany.sameCompanyName({
                        orgId: this.enterpriseId,
                        companyName: this.tempCompanyDetail.companyName,
                        id: this.tempCompanyDetail.id
                    });
                    if (res_uniqCompanyName.data && this.tempCompanyDetail.companyName !== this.companyDetail.companyName) {
                        this.$Message.error(this.$t('crm.Modal.error_existedCompanyName'));
                        this.loading = false;
                    }
                }

                // 校验国家地区, 非只读情况下
                if (this.loading) {
                    const temp = this.corp_item_all.find(item => item.storageName === 'countryArea');
                    if (temp && this.tempCompanyDetail.countryArea) {
                        if (temp.isOnlyRead !== 1) {
                            const res_getCountryArea = await this.$commonApi.getDetailByCode({
                                divCode: this.tempCompanyDetail.countryArea
                            });
                            if (!(Array.isArray(res_getCountryArea.data) && res_getCountryArea.data.length)) {
                                this.$Message.error(this.$t('crm.Modal.error_countryAreaFormat'));
                                this.error_countryArea = true;
                                this.loading = false;
                            }
                        }
                    }
                }

                // 校验都通过
                if (this.loading) {
                    const send_data = {
                        id: this.tempCompanyDetail.id,
                        orgId: this.enterpriseId,
                        companyName: this.companyDetail.companyName
                    };
                    this.corp_item_all.forEach(item => {
                        if (item.isOnlyRead !== 1) {
                            switch (item.storageName) {
                                case 'companyPicture':
                                    this.tempCompanyDetail.companyPicture = this.companyPictures.map(pic => pic.url).join(';');
                                    send_data.companyPicture = this.companyPictures.map(pic => pic.url).join(';');
                                    break;
                                case 'contactAddress':
                                    send_data[item.storageName] = this.tempCompanyDetail[item.storageName];
                                    send_data.point = this.tempCompanyDetail.point;
                                    break;
                                default:
                                    switch (item.colType) {
                                        case 'selectMultiple':
                                            const temp = Array.isArray(this.tempCompanyDetail[item.storageName]) ? JSON.stringify(this.tempCompanyDetail[item.storageName]) : JSON.stringify([]);
                                            send_data[item.storageName] = temp;
                                            break;
                                        case 'select':
                                            send_data[item.storageName] = this.tempCompanyDetail[item.storageName] || '';
                                            break;
                                        default:
                                            send_data[item.storageName] = this.tempCompanyDetail[item.storageName];
                                    }
                            }
                        }
                    });

                    /* 检验字段是否超长 */
                    if (this.check_length_default('corp_field_long_limit', send_data) || this.check_length_custom('corp_item_custom', this.corp_item_custom, send_data)) {
                        this.loading = false;
                        return false;
                    }
                    if (send_data.contactAddress) {
                        if (this.contactAddressLatLng) {
                            send_data.point = `${this.contactAddressLatLng.lng},${this.contactAddressLatLng.lat}`;
                        }
                    }

                    crmCompany.companyUpdate(send_data).then(response => {
                        this.loading = false;
                        if (response.code === '1') {
                            this.$saveLog({
                                operateType: 2,
                                operateModule: 1,
                                companyId: this.companyDetail.id,
                                targetId: this.companyDetail.id,
                                enterpriseId: this.enterpriseId.toString(),
                                userId: this.userId,
                                fullName: this.fullName,
                                prevObj: Object.assign({}, this.companyDetail),
                                currentObj: Object.assign({}, this.tempCompanyDetail)
                            }, 'company');
                            this.contactAddressLatLng = '';
                            this.$Message.success(this.$t('crm.Modal.success_editCompany'));
                            this.$emit('update:flag_update_detail', !this.flag_update_detail);
                            this.$emit('refreshCheck');
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_editCompany'));
                        }
                        this.$emit('update:visible', false);
                    }, error => {
                        this.loading = false;
                    }).catch(error => {
                        this.loading = false;
                    });
                }
            },
            cancel() {
                this.$emit('update:visible', false);
                this.companyPictures = [];

                // 页面回到顶部
                this.$refs.currentModal.$el.querySelector('.el-dialog__body').scrollTop = 0;
            },
            changeDate(date, timeType, key) {
                switch (timeType) {
                    case 'date':
                        this.tempCompanyDetail[key] = (new Date(date)).format('yyyy-MM-dd');
                        break;
                    case 'date+time':
                        this.tempCompanyDetail[key] = (new Date(date)).format('yyyy-MM-dd hh:mm:ss');
                }
            }
        },
        created() {
        },
        watch: {
            visible(val) {
                if (val) {
                    this.get_company_detail();
                }
            },
            contactAddressLatLng(val) {
                if (val) {
                    this.tempCompanyDetail.point = `${this.contactAddressLatLng.lng},${this.contactAddressLatLng.lat}`;
                }
            }
        }
    };
</script>
