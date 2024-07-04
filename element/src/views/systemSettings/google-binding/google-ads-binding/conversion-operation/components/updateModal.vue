<template>
    <Modal :transfer="transfer" ref="modal" :visible.sync="modal1" :title="title" :ok-text="$t('save')" :loading="loading"
           width="520px"
           @close="init"
           :append-to-body="true"
           :modal-append-to-body="false"
           :close-on-click-modal="false">
        <Form label-position="right" label-width="150px">
            <!-- 转化操作 -->
            <FormItem :label="$t('googleAdsBinding.conversionOperation.title')">
                <Input v-model="settings.name"
                       :placeholder="$t('googleAdsBinding.conversionOperation.inputOperationName')"></Input>
            </FormItem>
            <!-- <FormItem v-if="!settings.id" label="使用价值" >
                <Select @on-change="selectValue"  v-model="settings.value" placeholder="请选择使用价值">
                    <Option v-for="(element,i) in optionKeys[1].options " :key="i" :value="element.value">{{element.label}}</Option>
                </Select>
            </FormItem> -->
            <!-- 价值默认值 -->
            <!-- <FormItem label="美元 (USD US$)" v-if="useValue">
                <InputNumber v-model="defaultValue"></InputNumber>
            </FormItem> -->
            <!-- 纳入到“转化次数”列中 -->
            <!-- <FormItem v-if="!settings.id" label='纳入到“转化次数”列中' >
                <Select   v-model="settings.fitInto" placeholder='请选择是否纳入到“转化次数”列中'>
                    <Option v-for="(element,i) in optionKeys[2].options " :key="i" :value="element.value">{{element.label}}</Option>
                </Select>
            </FormItem> -->
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
            <!-- 价值 -->
            <FormItem :label="$t('googleAdsBinding.conversionOperation.valueType')">
                <p>{{ valueType }}</p>
            </FormItem>
        </Form>
        <div slot="footer">
            <Button @click="init">{{$t('cancel')}}</Button>
            <Button type="primary" ghost @click="update" :loading="undateLoading">{{$t('confirm')}}</Button>
        </div>
    </Modal>
</template>

<script>
    import util from '@/libs/util.js';
    import { mapState } from 'vuex';
    import { googleAdsBind } from '@/api/google/index';
    const { syncGoogleConversionName } = googleAdsBind;

    export default {
        props: {
            title: {
                type: String,
                default: '创建转化操作'
            },
            currentRow: {
                type: Object,
                default() {
                    return {};
                }
            },
            // followups: {
            //     type: Array,
            //     default() {
            //         return [];
            //     }
            // },
            // valueType:{
            //     type:Object,
            //     default(){
            //         return {
            //
            //         }
            //     }
            // },
            visible: {
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
                useValue: false,
                defaultValue: 1,
                loading: true,
                modal1: this.visible,
                oldName: '',
                // oldFollowupId: '',
                valueType: '',
                settings: {},
                undateLoading: false // 编辑按钮loading
            };
        },
        methods: {
            init() {
                this.undateLoading = false;
                this.useValue = false;
                this.defaultValue = 1;
                this.oldName = '';
                // this.oldFollowupId = '';
                this.$refs.modal.buttonLoading = false;
                this.$emit('update:visible', false);
            },
            // 判断有没有相同的已经绑定转化的跟进状态
            // changeFollowup({ label, value } = {}) {
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
            //         } else {
            //
            //         }
            //     } else {
            //
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
            async update() {
                this.undateLoading = true;
                let changeGoogle = true;
                let changeRelation = true;
                // let conversionName = this.oldName; // 暂存转化名称, 用于提示语
                // const newName = this.settings.name;
                // 更新转化名称
                if (this.oldName != this.settings.name) {
                    if (!this.settings.name) {
                        this.$Message.warning(this.$t('googleAdsBinding.conversionOperation.operationEmptyWarning'));
                        this.$refs.modal.buttonLoading = false;
                        return;
                    }
                    changeGoogle = false;
                    changeGoogle = await this.saveOperation();
                    // 更改名称成功, 更新暂存的转化名称
                    if (changeGoogle) {
                        // conversionName = newName;

                        syncGoogleConversionName({
                            orgId: this.orgId,
                            updateUser: this.userId,
                            conversionName: this.settings.name,
                            conversionId: this.settings.id,
                            customerId: this.customerId
                        });
                    }
                }
                // 暂存提示语
                // let successTip_changeRelation = ''; // "潜在客户"各种操作成功的提示语
                // 潜在客户更改关联关系
                // if (this.oldFollowupId != this.settings.followupId) {
                //     if (!this.oldFollowupId) {
                //         // 新增关联
                //         // 取跟进状态名称
                //         const followupName = this.getAttrName(this.optionKeys[3].options, this.settings.followupId);
                //         changeRelation = false;
                //         changeRelation = await this.saveFollowStatus(this.settings.id);
                //         // 新增成功后更新提示语
                //         if (changeRelation === true) {
                //             successTip_changeRelation = `${this.$t('googleAdsBinding.conversionOperation.success_related1')}${conversionName}${this.$t('googleAdsBinding.conversionOperation.success_related2')}${followupName}${this.$t('googleAdsBinding.conversionOperation.success_related3')}`;
                //         }
                //     } else if (!this.settings.followupId) {
                //         // 取消关联
                //         // 取跟进状态名称
                //         const followupName = this.getAttrName(this.optionKeys[3].options, this.oldFollowupId);
                //         changeRelation = false;
                //         changeRelation = await this.deleteFollowup(this.settings.id);
                //         // 取消成功后更新提示语
                //         if (changeRelation === true) {
                //             successTip_changeRelation = `${this.$t('googleAdsBinding.conversionOperation.success_cancelRelated1')}${conversionName}${this.$t('googleAdsBinding.conversionOperation.success_cancelRelated2')}${followupName}${this.$t('googleAdsBinding.conversionOperation.success_cancelRelated3')}`;
                //         }
                //     } else {
                //         // 变更关联
                //         // 取跟进状态名称
                //         const followupName = this.getAttrName(this.optionKeys[3].options, this.settings.followupId);
                //         changeRelation = false;
                //         changeRelation = await this.updateFollowStatus(this.settings.id);
                //         // 变更成功后更新提示语
                //         if (changeRelation === true) {
                //             successTip_changeRelation = `${this.$t('googleAdsBinding.conversionOperation.success_related1')}${conversionName}${this.$t('googleAdsBinding.conversionOperation.success_related2')}${followupName}${this.$t('googleAdsBinding.conversionOperation.success_related3')}`;
                //         }
                //     }
                // }
                if (changeGoogle && changeRelation === true) {
                    // // 更新名称 + 更新关联关系成功(也可能没有变动, 没有请求接口), 视情况弹出提示语
                    // if (successTip_changeRelation) {
                    //     this.$Message.success(successTip_changeRelation);
                    // } else {
                    this.$Message.success(this.$t('editSuccess'));
                    // }
                } else if (!changeGoogle) {
                    /**
                     * @Description: 操作失败的提示改在saveOperation中处理，此处注释相关代码，避免重复提示
                     * @author 杨娣
                     * @date 2020/6/11
                    */
                    // 更新名称失败
                    // this.$Message.error(this.$t('authority.adminPermis.updateNameError'));
                } else {
                    // 更新关联关系失败
                    // 如果返回了提示语, 则提示提示语, 否则提示默认提示语
                    if (changeRelation) {
                        this.$Message.error(changeRelation);
                    }
                    // else {
                    //     this.$Message.error(this.$t('googleAdsBinding.conversionOperation.updateBoundFollowupError'));
                    // }
                }
                this.$refs.modal.buttonLoading = false;
                if (changeGoogle) {
                    this.$emit('updateList');
                    this.$emit('update:visible', false);
                }
            },
            /**
             * @Description: 编辑转化操作的接口，增加对于失败原因及相关提示语的判断逻辑；同时，禁止点击遮罩层关闭弹窗
             * @author 杨娣
             * @date 2020/6/11
            */
            saveOperation() {
                const jsonData = {
                    orgId: this.orgId,
                    name: this.settings.name,
                    id: this.settings.id,
                    customerId: this.customerId
                };
                return new Promise((resolve, reject) => {
                    util.ajaxInternational({
                        url: '/oversea/adsConversion/modifyConversion',
                        method: 'post',
                        data: jsonData
                    }).then(res => {
                        this.undateLoading = false;
                        if (res.data.code == 1) {
                            resolve(true);
                        } else {
                            if (res.data.message.includes('DUPLICATE_NAME')) {
                                this.$Message.error(this.$t('googleAdsBinding.conversionOperation.nameNoRrepeated'));
                            } else if (res.data.message.includes('DOMAIN_EXCEPTION')) {
                                this.$Message.error(this.$t('googleAdsBinding.conversionOperation.nameTooLongTip'));
                            } else {
                                this.$Message.error(this.$t('authority.adminPermis.updateNameError'));
                            }
                            resolve(false);
                        }
                    });
                });
            },
            getAttrName(list, attrId) {
                const arr = list.filter(element => {
                    return element.value == attrId;
                });
                if (arr.length > 0) {
                    return arr[0].label;
                } else {
                    return false;
                }
            },
            // 新建跟进状态
            // saveFollowStatus(conversionId) {
            //     let data = {
            //         orgId: this.orgId,
            //         useRevenueValue: this.settings.value,
            //         defaultRevenueValue: this.defaultValue,
            //         conversionName: this.settings.name,
            //         createUser: this.userId,
            //         // followupId: this.settings.followupId,
            //         revenueCurrencyCode: 'USD',
            //         conversionId,
            //         customerId: this.customerId,
            //         adsCustomerName: this.adsCustomerName,
            //         isDelete: 0
            //     };
            //     const attrName = this.getAttrName(this.optionKeys[3].options, this.settings.followupId);
            //
            //     if (attrName) {
            //         data = Object.assign(data, {
            //             followup: attrName
            //         });
            //     }
            //     if (this.settings.value !== 1) {
            //         data = Object.assign(data, {
            //             alwaysUseDefault: true
            //         });
            //     } else {
            //         data = Object.assign(data, {
            //             alwaysUseDefault: false
            //         });
            //     }
            //     return new Promise((resolve, reject) => {
            //         util.ajax({
            //             url: '/crm/conversionRelation/save',
            //             method: 'get',
            //             params: data
            //         }).then(res => {
            //             if (res.data.code == 1) {
            //                 resolve(true);
            //             } else {
            //                 console.error(res.data);
            //                 // 要更新的跟进状态已和其他转化绑定
            //                 if (res.data.error_code === 14010002) {
            //                     const data = res.data.data;
            //                     resolve(`${this.$t('googleAdsBinding.conversionOperation.related1')}${data.followup}${this.$t('googleAdsBinding.conversionOperation.related2')}${data.conversionName}${this.$t('googleAdsBinding.conversionOperation.related3')}`);
            //                 }
            //                 resolve(false);
            //             }
            //         });
            //     });
            // },
            // updateFollowStatus(conversionId) {
            //     let data = {
            //         orgId: this.orgId,
            //         updateUser: this.userId,
            //         conversionName: this.settings.name,
            //         followupId: this.settings.followupId,
            //         conversionId,
            //         customerId: this.customerId,
            //         isDelete: 0
            //     };
            //     const attrName = this.getAttrName(this.optionKeys[3].options, this.settings.followupId);
            //     if (attrName) {
            //         data = Object.assign(data, {
            //             followup: attrName
            //         });
            //     }
            //     return new Promise((resolve, reject) => {
            //         util.ajax({
            //             url: '/crm/conversionRelation/update',
            //             method: 'post',
            //             data: data
            //         }).then(res => {
            //             this.undateLoading = false;
            //             if (res.data.code == 1) {
            //                 resolve(true);
            //             } else {
            //                 console.error(res.data);
            //                 // 要更新的跟进状态已和其他转化绑定
            //                 if (res.data.error_code === 14010002) {
            //                     const data = res.data.data;
            //                     resolve(`${this.$t('googleAdsBinding.conversionOperation.related1')}${data.followup}${this.$t('googleAdsBinding.conversionOperation.related2')}${data.conversionName}${this.$t('googleAdsBinding.conversionOperation.related3')}`);
            //                 }
            //                 resolve(false);
            //             }
            //         });
            //     });
            // },
            // deleteFollowup(conversionId) {
            //     return new Promise((resolve, reject) => {
            //         util.ajax({
            //             url: '/crm/conversionRelation/delete',
            //             method: 'post',
            //             data: {
            //                 orgId: this.orgId,
            //                 updateUser: this.userId,
            //                 conversionId,
            //                 customerId: this.customerId,
            //                 followupId: 0
            //             }
            //         }).then(res => {
            //             this.undateLoading = false;
            //             if (res.data.code == 1) {
            //                 // this.getList()
            //                 resolve(true);
            //             } else {
            //                 resolve(false);
            //             }
            //         });
            //     });
            // }
        },
        watch: {
            visible(val) {
                this.modal1 = val;
                if (val) {
                    /**
                     * @Description: 之前直接用 settings 做 prop , 又在此 modal 中直接改 settings 的值, 导致同一条数据修改后点击取消再进来, 看到的仍是之前选中编辑未保存的数据, 且表格页显示的数据也有可能变为编辑未保存的数据
                     * 现在改 prop 为 currentRow , setting 单独定义变量, 并在 visible 变为 true 时深拷贝 currentRow 为 settings
                     * @author 汤一飞
                     * @date 2020/6/6
                    */
                    this.settings = JSON.parse(JSON.stringify(this.currentRow));
                    // this.getStatusList();
                    if (this.settings.id) {
                        this.oldName = this.settings.name;
                        // this.oldFollowupId = this.settings.followupId;
                        if (this.settings.alwaysUseDefaultRevenueValue) {
                            if (this.settings.defaultRevenueValue === 0) {
                                this.settings.value = 3;
                                this.valueType = this.$t('googleAdsBinding.conversionOperation.unusedValue');
                            } else {
                                this.settings.value = 1;
                            }
                        } else {
                            this.settings.value = 2;
                        }
                        if (this.settings.defaultRevenueValue) {
                            this.defaultValue = this.settings.defaultRevenueValue;
                            let cny = '';
                            if (this.settings.defaultRevenueCurrencyCode === 'CNY') {
                                cny = `￥${this.settings.defaultRevenueValue}`;
                            } else {
                                cny = `$${this.settings.defaultRevenueValue}`;
                            }
                            if (this.settings.alwaysUseDefaultRevenueValue) {
                                this.valueType = cny;
                            } else {
                                this.valueType = this.$t('googleAdsBinding.conversionOperation.useDifferentValues') + cny;
                            }
                        }
                    }
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
