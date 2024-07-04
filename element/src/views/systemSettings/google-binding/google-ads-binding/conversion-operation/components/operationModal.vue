<template>
    <Modal :transfer="transfer" ref="modal" :visible.sync="modal" :title="title" :loading="loading"
           width="520px"
           @close="init"
           :append-to-body="true"
           :modal-append-to-body="false"
           :close-on-click-modal="false">
        <Form :model="settings"
              :rules="add_form_rule"
              label-position="right"
              label-width="150px">
            <!-- 转化操作 -->
            <FormItem prop="name"
                      :label="$t('googleAdsBinding.conversionOperation.title')">
                <Input v-model="settings.name"
                       :placeholder="$t('googleAdsBinding.conversionOperation.inputOperationName')"></Input>
            </FormItem>
            <FormItem v-if="!settings.id" :label="$t('googleAdsBinding.conversionOperation.ConversionValue')">
                <Select @change="selectValue" v-model="settings.value"
                        :placeholder="$t('googleAdsBinding.conversionOperation.selectConversionValue')"
                        style="width: 100%">
                    <Option v-for="(element,i) in optionKeys[1].options " :key="i" :value="element.value" :label="element.label">
                        {{element.label}}
                    </Option>
                </Select>
            </FormItem>
            <!-- 价值默认值 -->
            <FormItem :label="$t('googleAdsBinding.conversionOperation.USD')" v-if="useValue">
                <InputNumber v-model="defaultValue" :min="0"></InputNumber>
            </FormItem>
            <!-- 纳入到“转化次数”列中 -->
            <FormItem v-if="!settings.id" :label="$t('googleAdsBinding.conversionOperation.conversionTimesColumn')">
                <Select v-model="settings.fitInto"
                        :placeholder="$t('googleAdsBinding.conversionOperation.selectYesOrNo')"
                        style="width: 100%">
                    <Option v-for="(element,i) in optionKeys[2].options " :key="i" :value="element.value" :label="element.label">
                        {{element.label}}
                    </Option>
                </Select>
            </FormItem>
            <!-- 关联客户跟进状态 -->
<!--            <FormItem :label="$t('googleAdsBinding.conversionOperation.associateFollowupStatus')">-->
<!--                <Select v-model="settings.followupId"-->
<!--                        label-in-value-->
<!--                        clearable-->
<!--                        :placeholder="$t('googleAdsBinding.conversionOperation.selectAssociateFollowupStatus')"-->
<!--                        popper-class="followupSelect-popper"-->
<!--                        ref="followupSelect"-->
<!--                        @change="changeFollowup"-->
<!--                        style="width: 100%">-->
<!--                    <Option v-for="(element,i) in optionKeys[3].options "-->
<!--                            :key="i"-->
<!--                            :value="element.value"-->
<!--                            :label="element.label">-->
<!--                        <TooltipAuto :content="element.label"></TooltipAuto>-->
<!--                    </Option>-->
<!--                </Select>-->
<!--            </FormItem>-->
        </Form>
        <div slot="footer">
            <Button @click="init">{{$t('cancel')}}</Button>
            <Button type="primary" ghost @click="saveOperation">{{$t('confirm')}}</Button>
        </div>
    </Modal>
</template>

<script>
    import util from '@/libs/util.js';
    import { mapState } from 'vuex';

    export default {
        props: {
            title: {
                type: String,
                default: '创建转化操作'
            },
            // followups: {
            //     type: Array,
            //     default() {
            //         return [];
            //     }
            // },
            createModal: {
                type: Boolean,
                default: false
            },
            customerId: {
                type: String
            },
            adsCustomerName: {
                type: String
            }
        },
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId'
            })
        },
        data() {
            return {
                transfer: true,
                optionKeys: [
                    {
                        value: 'name',
                        label: this.$t('googleAdsBinding.conversionOperation.title'),
                        type: 'text',
                        placeholder: this.$t('googleAdsBinding.conversionOperation.inputOperationName')
                    },
                    {
                        value: 'value',
                        label: this.$t('googleAdsBinding.conversionOperation.ConversionValue'),
                        type: 'select',
                        placeholder: this.$t('googleAdsBinding.conversionOperation.selectConversionValue'),
                        options: [{
                                      value: 1,
                                      label: this.$t('googleAdsBinding.conversionOperation.sameValueForConversion')
                                  },
                                  {
                                      value: 2,
                                      label: this.$t('googleAdsBinding.conversionOperation.differentVauleForConversion')
                                  },
                                  { value: 3, label: this.$t('googleAdsBinding.conversionOperation.unusedValue') }]
                    },
                    {
                        value: 'fitInto',
                        label: this.$t('googleAdsBinding.conversionOperation.conversionTimesColumn'),
                        type: 'select',
                        options: [{ value: 1, label: this.$t('yes') }, { value: 0, label: this.$t('no') }],
                        placeholder: this.$t('googleAdsBinding.conversionOperation.selectYesOrNo')
                    }
                    // {
                    //     value: 'followupId',
                    //     label: this.$t('googleAdsBinding.conversionOperation.associateFollowupStatus'),
                    //     type: 'select',
                    //     options: [],
                    //     placeholder: this.$t('googleAdsBinding.conversionOperation.selectAssociateFollowupStatus')
                    // }
                ],
                settings: {
                    name: ''
                },
                add_form_rule: {},
                useValue: false,
                defaultValue: 1,
                loading: true,
                modal: this.createModal
            };
        },
        methods: {
            init() {
                this.defaultValue = 1;
                this.$refs.modal.buttonLoading = false;
                this.settings = {};
                this.useValue = false;
                this.$emit('update:createModal', false);
            },
            // changeFollowup({ label, value } = {}) {
            //     console.log('changeFollowup', label);
            //     console.log('changeFollowup', value);
            //     if (value) {
            //         const same = this.followups.filter(item => {
            //             return item.followupId === value;
            //         });
            //         if (same.length > 0 && this.settings.id !== same[0].conversionId) {
            //             const e = new Event('click');
            //             this.$refs.followupSelect.handleClearClick(e);
            //             this.$Message.warning({
            //                 message: `【${label}】${this.$t('googleAdsBinding.conversionOperation.boundConversion')}`,
            //                 duration: 10000,
            //                 closable: true
            //             });
            //         }
            //     }
            // },
            // getStatusList() {
            //     util.ajax({
            //         url: '/crm/conversionAudit/getAttrs',
            //         method: 'get',
            //         params: {
            //             orgId: this.orgId
            //             // orgId:100
            //         }
            //     }).then(res => {
            //         if (res.data.code == 1) {
            //             const options = res.data.data.map(item => {
            //                 return {
            //                     value: item.attrId,
            //                     label: item.attrName
            //                 };
            //             });
            //             this.optionKeys[3].options = options;
            //         } else {
            //             this.$Message.error(this.$t('googleAdsBinding.conversionOperation.getFollowupListFail'));
            //         }
            //     });
            // },
            selectValue(value) {
                if (value !== 3) {
                    this.useValue = true;
                } else {
                    this.useValue = false;
                }
            },
            /**
             * @Description: 新增转化操作的接口，增加对于超长名称导致失败及相关提示语的判断逻辑；同时，禁止点击遮罩层关闭弹窗
             * @author 杨娣
             * @date 2020/6/11
             */
            saveOperation() {
                if (!this.settings.name) {
                    this.$Message.warning(this.$t('googleAdsBinding.conversionOperation.operationEmptyWarning'));
                    this.$refs.modal.buttonLoading = false;
                    return;
                }
                let jsonData = {
                    orgId: this.orgId,
                    name: this.settings.name,
                    // 是否纳入转化次数字段是反的，是false  否true
                    excludeFromBidding: this.settings.fitInto === 0,
                    customerId: this.customerId
                };
                switch (this.settings.value) {
                    case 3:
                        jsonData.useRevenueValue = false;
                        break;
                    case 1:
                        jsonData = Object.assign(jsonData, {
                            useRevenueValue: true,
                            alwaysUseDefaultRevenueValue: true,
                            defaultRevenueValue: this.defaultValue,
                            defaultRevenueCurrencyCode: 'USD'
                        });
                        break;
                    case 2:
                        jsonData = Object.assign(jsonData, {
                            useRevenueValue: true,
                            alwaysUseDefaultRevenueValue: false,
                            defaultRevenueValue: this.defaultValue,
                            defaultRevenueCurrencyCode: 'USD'
                        });
                        break;
                }
                util.ajaxInternational({
                    url: '/oversea/adsConversion/addConversion',
                    method: 'get',
                    params: jsonData
                }).then(res => {
                    if (res.data.code == 1) {
                        this.$Message.success(this.$t('googleAdsBinding.conversionOperation.createOperationSuccess'));
                        // if (this.settings.followupId !== undefined) {
                        this.saveFollowStatus(jsonData, res.data.data);
                        // } else {
                        //     this.init();
                        //     this.$emit('updateList');
                        // }
                    } else {
                        if (res.data.message.includes('DUPLICATE_NAME')) {
                            this.$Message.error(this.$t('googleAdsBinding.conversionOperation.nameNoRrepeated'));
                            this.$refs.modal.buttonLoading = false;
                        } else if (res.data.message.includes('DOMAIN_EXCEPTION')) {
                            this.$Message.error(this.$t('googleAdsBinding.conversionOperation.nameTooLongTip'));
                            this.$refs.modal.buttonLoading = false;
                        } else {
                            this.$Message.error(this.$t('googleAdsBinding.conversionOperation.createOperationFail'));
                            this.$refs.modal.buttonLoading = false;
                        }
                    }
                });
            },
            getAttrName(list, attrId) {
                console.log(list, attrId);
                const arr = list.filter(element => {
                    return element.value == attrId;
                });
                if (arr.length > 0) {
                    return arr[0].label;
                } else {
                    return false;
                }
            },
            saveFollowStatus(jsonData, conversionId) {
                let data = {
                    orgId: this.orgId,
                    useRevenueValue: this.settings.value,
                    revenueCurrencyCode: 'USD',
                    defaultRevenueValue: this.defaultValue,
                    conversionName: jsonData.name,
                    createUser: this.userId,
                    // followupId: this.settings.followupId,
                    conversionId,
                    customerId: this.customerId,
                    adsCustomerName: this.adsCustomerName,
                    isDelete: 0
                };
                // const attrName = this.getAttrName(this.optionKeys[3].options, this.settings.followupId);
                // if (attrName) {
                //     data = Object.assign(data, {
                //         followup: attrName
                //     });
                // }
                if (this.settings.value !== 1) {
                    data = Object.assign(data, {
                        alwaysUseDefault: true
                    });
                } else {
                    data = Object.assign(data, {
                        alwaysUseDefault: false
                    });
                }
                util.ajax({
                    url: '/crm/conversionRelation/save',
                    method: 'get',
                    params: data
                }).then(res => {
                    this.init();
                    this.$emit('updateList');
                    // if (res.data.code == 1) {
                    //     this.$Message.success(this.$t('googleAdsBinding.conversionOperation.addedCustomerStatus'));
                    //     this.init();
                    //     this.$emit('updateList');
                    // } else {
                    //     console.error(res.data);
                    //
                    //     if (res.data.error_code === 14010002) {
                    //         const data = res.data.data;
                    //         this.$Message.error(`${this.$t('googleAdsBinding.conversionOperation.related1')}${data.followup}${this.$t('googleAdsBinding.conversionOperation.related2')}${data.conversionName}${this.$t('googleAdsBinding.conversionOperation.related3')}`);
                    //     } else {
                    //         this.$Message.error(this.$t('googleAdsBinding.conversionOperation.addCustomerStatusError'));
                    //     }
                    //
                    //     this.$emit('updateList');
                    //     this.init();
                    // }
                });
            }
        },
        watch: {
            createModal(val) {
                this.modal = val;
                if (val) {
                    this.useValue = false;
                    // this.getStatusList();
                    this.add_form_rule = {
                        name: [
                            {
                                max: 100,
                                message: `${this.$t('enterClue.upperLimitTip')} 100`,
                                trigger: 'change'
                            }
                        ]
                    };
                }
            }

        }
    };
</script>

<style lang="less">
    //.followupSelect-popper {
    //    width: 330px;
    //}
</style>
