<template>
    <div>
        <Modal :visible="visible"
               :title="$t('crm.Modal.title_editInquiry')"
               width="778px"
               class="modal"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               @scroll.native.capture="close_popper"
               ref="currentModal">
            <!-- loading -->
            <Spin fix v-if="loading"></Spin>
            <Form
                    ref="editInquiryForm"
                    :inline="true"
                    :validate-on-rule-change="false"
                    class="_form-custom"
                    label-position="right"
                    label-width="115px"
            >
                <!-- 询盘 -->
                <h1 class="title">{{ $t('crm.Modal.title_inquiry') }}</h1>
                <div class="wrap">
                    <!-- 通用输入区域 -->
                    <CrmInputArea :data.sync="tempInquiryDetail"
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
                </div>
            </Form>
            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button class="piwik_edit_inquiry" type="primary" @click="ok" :disabled="loading">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>

        <!-- 编辑成交时间, 金额 -->
        <!--<Modal v-model="visible_edit_clinchData"-->
        <!--       :mask-closable="false"-->
        <!--       :closable="false"-->
        <!--       :title="transactionStatus.attrName">-->
        <!--    <Form label-position="right" :label-width="150">-->
        <!--        <FormItem :label="$t('crm.Modal.transactionTime')">-->
        <!--            <DatePicker v-model="transactionTime" style="width: 230px;"></DatePicker>-->
        <!--        </FormItem>-->
        <!--        <FormItem :label="$t('crm.Modal.transactionMoney')">-->
        <!--            <Input v-model="transactionMoney" style="width: 230px;"></Input>-->
        <!--        </FormItem>-->
        <!--    </Form>-->
        <!--    <div slot="footer">-->
        <!--        <Button @click="cancel_edit_clinchData">{{ $t('crm.Modal.modal_cancel') }}</Button>-->
        <!--        <Button type="primary" @click="ok_edit_clinchData">{{ $t('crm.Modal.modal_ok') }}</Button>-->
        <!--    </div>-->
        <!--</Modal>-->
    </div>
</template>

<script>
    import Utils from '@/utils/index';
    import { mapState, mapGetters } from 'vuex';
    import CrmInputArea from '@/views/crm/Detail/Components/Modal/fixed-modal-form/crm-input-area';
    import { crmInquiry } from '@/api/crm/index';

    export default {
        name: 'editInquiry',
        components: {
            CrmInputArea
        },
        props: [
            'visible',
            'inquiryId',
            'flag_update_detail',
            'inquiry_columns_authorized',
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                selectOptions: state => state.crm.selectOptions
            }), // 从 vuex 中获取属性
            ...mapGetters([
                // 字段长度校验
                'check_length_default',
                'check_length_custom',
                'inquiry_items'
            ]),

            computed_selectOptions() {
                const result = {};
                Object.entries(this.$deepClone(this.selectOptions)).forEach(([key, value]) => {
                    result[key] = value.filter(item => item.isAvailable === 1);
                });
                return result;
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
                    const temp = this.computed_selectOptions.followUp.find(v => v.transactionStatus);
                    if ((this.current_followUp && temp && this.current_followUp.sort >= temp.sort)) {
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
                return Array.isArray(this.computed_selectOptions.followUp) ? this.computed_selectOptions.followUp.find(item => `${item.attrId}` === `${this.tempInquiryDetail.followUpId}`) : undefined;
            }
        },
        data() {
            return {
                loading: false,
                inquiryDetail: {},
                tempInquiryDetail: {},
                prevLabelData: [],

                /* 成交数据 */
                transactionTime: '',
                transactionMoney: null,
                transactionMoneyCurrency: 'CNY',
                transactionInfo: null,
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
                isMainInquiry: false
            };
        },
        methods: {
            verifyStatus(id) {
                let sortTemp = false;
                const arr = [];
                this.computed_selectOptions.followUp.map(item => {
                    if (item.transactionStatus) {
                        sortTemp = true;
                    }
                    if (sortTemp) {
                        arr.push(`${item.attrId}`);
                    }
                });
                return arr.indexOf(id) > -1;
            },
            ok() {
                // 如果当前正在录入, 则退出录入
                if (this.loading) {
                    this.$Message.warning(this.$t('mail.customerBox.requestTip'));
                    return;
                }
                // 判断是否有成交金额，并判断是否符合格式
                if (this.transactionMoney) {
                    const tempMoney = this.transactionMoney.replace(/,/g, '');
                    if (isNaN(Number(tempMoney)) && ![1, 2].includes(this.inquiryDetail.sysCreateFlag)) {
                        this.$Message.warning('成交金额只支持数字类型');
                        return;
                    }
                }
                // 判断是否有预计询盘金额，并判断是否符合格式
                if (this.estimatedInquiryAmount) {
                    const tempMoney = this.estimatedInquiryAmount.replace(/,/g, '');
                    if (isNaN(Number(tempMoney)) && ![1, 2].includes(this.inquiryDetail.sysCreateFlag)) {
                        this.$Message.warning('预计询盘金额只支持数字类型');
                        return;
                    }
                }
                // 各种合法性校验
                // 成交时间不能为空
                if (((this.current_followUp && this.current_followUp.transactionStatus) || this.inquiryDetail.transactionTime) && !(this.transactionTime instanceof Date && !isNaN(this.transactionTime.getTime()))) {
                    this.$Message.error(this.$t('crm.Html.empty_transactionTime'));
                    return;
                }
                // 产品分类不能为空
                // 非必填
                // if (this.tempInquiryDetail.productCategory && !this.tempInquiryDetail.productCategory.length) {
                //     this.$Message.error(this.$t('crm.Modal.error_emptyProductCategory'));
                //     return;
                // }
                // 询盘备注不能超过 20000 个字符
                if (this.tempInquiryDetail.remark && this.tempInquiryDetail.remark.toString().replace(/[^\x00-\xff]/gi, '--').length > 20000) {
                    this.$Message.error(this.$t('crm.Modal.error_remarkLength'));
                    return;
                }
                this.tempInquiryDetail.estimatedInquiryAmount = this.estimatedInquiryAmount ? Number(this.estimatedInquiryAmount.replace(/,/g, '')) : this.estimatedInquiryAmount;
                // 必填字段校验
                let tempErrorField = '';
                if (this.inquiry_item_all.some(item => {
                    switch (item.colType) {
                        case 'followUp':
                            if (item.mustInput === 1 && !this.tempInquiryDetail.followUpId.length) {
                                if (item.isOnlyRead !== 1) {
                                    tempErrorField = this.$t('crm.Modal.inq_followUp');
                                    return true;
                                }
                            }
                            break;
                        case 'label':
                            if (item.mustInput === 1 && item.storageName === 'label' && this.tempInquiryDetail.label.length === 0) {
                                if (item.isOnlyRead !== 1) {
                                    tempErrorField = item.cname;
                                    return true;
                                }
                            }
                            break;
                        default:
                            if (item.mustInput === 1 && (!this.tempInquiryDetail[item.storageName] || this.tempInquiryDetail[item.storageName].length === 0)) {
                                if (item.isOnlyRead !== 1) {
                                    tempErrorField = item.cname;
                                    if (this.tempInquiryDetail[item.storageName] === 0) {
                                        return false;
                                    }
                                    return true;
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

                const send_data = {
                    id: this.inquiryId,
                    orgId: this.enterpriseId,
                    companyId: this.inquiryDetail.companyId,
                    updateUserId: this.userId,
                    updateUser: this.fullName
                };
                this.inquiry_item_all.forEach(item => {
                    if (item.isOnlyRead !== 1) {
                        switch (item.storageName) {
                            case 'label':
                                send_data.label = JSON.stringify(this.getSelectedLabels(this.tempInquiryDetail.label, this.selectOptions.tag));
                                break;
                            case 'followUp':
                                send_data.followUpId = this.tempInquiryDetail.followUpId;
                                if (this.current_followUp) {
                                    send_data.followUp = this.current_followUp.attrName;
                                    this.tempInquiryDetail.followUp = this.current_followUp.attrName;
                                }
                                break;
                            default:
                                switch (item.colType) {
                                    case 'selectMultiple':
                                        // eslint-disable-next-line no-case-declarations
                                        const str = Array.isArray(this.tempInquiryDetail[item.storageName]) ? JSON.stringify(this.tempInquiryDetail[item.storageName]) : JSON.stringify([]);
                                        send_data[item.storageName] = str;
                                        break;
                                    case 'select':
                                        send_data[item.storageName] = this.tempInquiryDetail[item.storageName] || '';
                                        break;
                                    default:
                                        send_data[item.storageName] = this.tempInquiryDetail[item.storageName];
                                }
                        }
                    }
                });
                // 就算没有"跟进状态"字段, 也要保存上 '0' , 不然编辑时不选跟进状态就会因为 followUpId 为 null 而无法保存
                // 更正: 首先应考虑传原有的 followUpId 值, 以免跟进状态只读情况下, send_data 仍然传 '0' 更改原有跟进状态为'询盘'
                if (!send_data.followUpId) {
                    send_data.followUpId = this.inquiryDetail.followUpId || '0';
                }
                send_data.estimatedInquiryAmountCurrency = this.estimatedInquiryAmountCurrency;
                /* 检验字段是否超长 */
                // 如果成交数据可编辑, 此处校验时还要临时加上成交数据, 但不能放数据到 send_data 中, 编辑成交数据走 edit_clinchData 方法
                // 拷贝原本要验证的数据
                const tempData = this.$deepClone(send_data);
                // 获取成交状态在跟进状态列表中的位置
                const transactionStatus = this.computed_selectOptions.followUp.find(item => item.transactionStatus);
                // 有成交状态 + 询盘不是平台自动创建询盘 + 当前跟进状态位置大于等于成交状态位置 + 有成交时间, 才允许保存成交数据, 此时才需要校验长度
                if (transactionStatus &&
                    !['1', '2'].includes(`${this.inquiryDetail.sysCreateFlag}`) &&
                    this.current_followUp &&
                    this.current_followUp.sort >= transactionStatus.sort &&
                    (this.transactionTime instanceof Date && !isNaN(this.transactionTime.getTime()))) {
                    let transactionMoney = this.transactionMoney ? Number(this.transactionMoney.replace(/,/g, '')) : ''; // 成交金额,
                    transactionMoney = Number.isNaN(transactionMoney) ? this.transactionMoney : transactionMoney;
                    tempData.transactionMoney = transactionMoney;
                    tempData.transactionMoneyCurrency = this.transactionMoneyCurrency;// 成交币种
                    tempData.transactionInfo = this.transactionInfo;// 成交信息
                    tempData.transactionTime = (new Date(this.transactionTime)).format('yyyy-MM-dd hh:mm:ss');// 成交时间,必填 后端用该参数判断成交状态
                }
                if (this.check_length_default('inquiry_field_long_limit', tempData) || this.check_length_custom('inquiry_item_custom', this.inquiry_item_custom, tempData)) {
                    return false;
                }

                // 设为主询盘
                if (this.isMainInquiry) {
                    tempData.isMainInquiry = 1;
                }

                // 正体
                this.loading = true;
                crmInquiry.updateInquiry(tempData).then(response => {
                    this.loading = false;
                    if (response.code === '1') {
                        this.$Message.success(this.$t('crm.Modal.success_editInquiry'));
                        // 编辑询盘通知由后端处理，前端这块先注释
                        /* 保存日志 */
                        // const sentPrevObj = Object.assign({}, this.inquiryDetail);
                        // sentPrevObj.label = this.prevLabelData.map(item => {
                        //     const temp = Object.assign({}, item);
                        //     delete temp.id;
                        //     return temp;
                        // });
                        // if (send_data.label) {
                        //     this.tempInquiryDetail.label = JSON.parse(send_data.label.slice());
                        // }
                        // const logObj = {
                        //     operateType: 2,
                        //     operateModule: 3,
                        //     inquiryId: this.inquiryId,
                        //     targetId: this.inquiryId,
                        //     userId: this.userId,
                        //     fullName: this.fullName,
                        //     enterpriseId: this.enterpriseId.toString(),
                        //     prevObj: sentPrevObj,
                        //     currentObj: Object.assign({}, this.tempInquiryDetail)
                        // };

                        // 保存成交数据
                        // 有成交状态 + 询盘不是平台自动创建询盘 + 当前跟进状态位置大于等于成交状态位置 + 有成交时间, 才允许保存成交数据, 此时才需要校验长度
                        // if (transactionStatus &&
                        //     !['1', '2'].includes(`${this.inquiryDetail.sysCreateFlag}`) &&
                        //     this.current_followUp &&
                        //     this.current_followUp.sort >= transactionStatus.sort &&
                        //     (this.transactionTime instanceof Date && !isNaN(this.transactionTime.getTime()))) {
                        //     // this.edit_clinchData(logObj);
                        //     this.sendTransactionLog(logObj)
                        // } else {
                        //     this.$saveLog(logObj);
                        //     this.$emit('update:flag_update_detail', !this.flag_update_detail);
                        //     this.$emit('refreshCheck');
                        // }
                        this.$emit('update:flag_update_detail', !this.flag_update_detail);
                        this.$emit('refreshCheck');
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_editInquiry'));
                    }
                    this.$emit('update:visible', false);
                }, error => {
                    this.loading = false;
                }).catch(error => {
                    this.loading = false;
                });
            },
            cancel() {
                this.$emit('update:visible', false);

                // this.visible_edit_clinchData = false;
                this.transactionTime = '';
                this.transactionMoney = null;
                this.transactionMoneyCurrency = 'CNY';
                this.transactionInfo = null;
                this.isMainInquiry = false;

                // 页面回到顶部
                this.$refs.currentModal.$el.querySelector('.el-dialog__body').scrollTop = 0;
            },
            getSelectedLabels(selectedArr, allArr) {
                const selectedLabels = [];
                selectedArr.map(item => {
                    allArr.some(i => {
                        if (i.attrName === item) {
                            const { attrId, attrName, attrValue, orgId, typeId } = i;
                            const belongTable = 3;
                            const belongId = this.inquiryDetail.id - 0;
                            selectedLabels.push({ attrId, attrName, attrValue, belongId, orgId, typeId, belongTable });
                            return true;
                        }
                    });
                });
                return selectedLabels;
            },
            changeDate(date, timeType, key) {
                switch (timeType) {
                    case 'date':
                        this.tempInquiryDetail[key] = (new Date(date)).format('yyyy-MM-dd');
                        break;
                    case 'date+time':
                        this.tempInquiryDetail[key] = (new Date(date)).format('yyyy-MM-dd hh:mm:ss');
                }
            },
            // 获取询盘信息和询盘所属公司信息
            get_inquiry_detail() {
                this.loading = true;
                const data = {
                    id: this.inquiryId
                };
                crmInquiry.getInquiry(data).then(async response => {
                    if (response.code === '1') {
                        this.inquiryDetail = response.data;
                        // 格式化多选字符串值
                        this.inquiry_item_all.filter(item => item.colType === 'selectMultiple').forEach(item => {
                            const temp = this.$options.filters.parseArray(this.inquiryDetail[item.storageName]);
                            if (item.fieldType === 'custom') {
                                this.inquiryDetail[item.storageName] = temp;
                            } else if (item.fieldType === 'default') {
                                if (this.inquiryDetail[item.storageName] && this.inquiryDetail[item.storageName] !== '[]' && !temp.length) {
                                    this.inquiryDetail[item.storageName] = [this.inquiryDetail[item.storageName]];
                                } else {
                                    this.inquiryDetail[item.storageName] = temp;
                                }
                            }
                        });

                        // 成交数据处理
                        this.transactionTime = this.inquiryDetail.transactionTime ? new Date(this.inquiryDetail.transactionTime) : new Date();
                        this.transactionMoney = this.inquiryDetail.transactionMoney;
                        this.transactionMoneyCurrency = this.inquiryDetail.transactionMoneyCurrency ? this.inquiryDetail.transactionMoneyCurrency : 'CNY';
                        this.estimatedInquiryAmount = this.inquiryDetail.estimatedInquiryAmount ? Utils.transformMoney(this.inquiryDetail.estimatedInquiryAmount) : this.inquiryDetail.estimatedInquiryAmount;
                        this.estimatedInquiryAmountCurrency = this.inquiryDetail.estimatedInquiryAmountCurrency ? this.inquiryDetail.estimatedInquiryAmountCurrency : 'CNY';
                        this.transactionInfo = this.handleTransactionInfo(this.inquiryDetail.transactionInfo, this.inquiryDetail.sysCreateFlag);

                        // 主询盘处理
                        this.isMainInquiry = this.inquiryDetail.isMainInquiry === 1;
                        const label = this.inquiryDetail.label ? JSON.parse(this.inquiryDetail.label) : [];
                        this.prevLabelData = label;
                        this.inquiryDetail.label = label.map(item => {
                            return item.attrName;
                        });
                        this.tempInquiryDetail = this.$deepClone(this.inquiryDetail);
                        // 看是否需要回填产品分类默认选项
                        // 产品分类非必填
                        // if (Array.isArray(this.tempInquiryDetail.productCategory) && this.tempInquiryDetail.productCategory.length === 0) {
                        //     const defaultOption = Array.isArray(this.computed_selectOptions.productCategory) ? this.computed_selectOptions.productCategory.find(option => option.defaultMark === 1) : null;
                        //     this.$set(this.tempInquiryDetail, 'productCategory', defaultOption ? [defaultOption.attrName] : []);
                        // }
                    } else {
                        this.$Message.error(this.$t('crm.Detail.error_getInquiryInfo'));
                    }
                    this.loading = false;
                }, error => {
                    this.loading = false;
                }).catch(error => {
                    this.loading = false;
                });
            },
            // 发送成交通知
            // sendTransactionLog(obj) {
            //     let transactionMoney = this.transactionMoney ? Number(this.transactionMoney.replace(/,/g, '')) : ''; // 成交金额,
            //     transactionMoney = Number.isNaN(transactionMoney) ? this.transactionMoney : transactionMoney;
            //     const transactionMoneyCurrency = this.transactionMoneyCurrency; // 成交金额币种,
            //     const transactionInfo = this.transactionInfo; // 成交金额,
            //     const transactionTime = this.transactionTime.getTime();// 成交时间,
            //     obj.currentObj.transactionMoney = transactionMoney;
            //     obj.currentObj.transactionMoneyCurrency = transactionMoneyCurrency;
            //     obj.currentObj.transactionInfo = transactionInfo;
            //     obj.currentObj.transactionTime = transactionTime;
            //     this.$saveLog(obj);
            //     this.$emit('update:flag_update_detail', !this.flag_update_detail);
            //     this.$emit('refreshCheck');
            // },
            // 由后端直接更新成交信息，不掉该接口了，暂时注掉，等没问题了再删除
            // edit_clinchData(obj) {
            //     let transactionMoney = Number(this.transactionMoney.replace(/,/g, '')); // 成交金额,
            //     transactionMoney = Number.isNaN(transactionMoney) ? this.transactionMoney : transactionMoney;
            //     const transactionMoneyCurrency = this.transactionMoneyCurrency; // 成交金额币种,
            //     const transactionInfo = this.transactionInfo; // 成交金额,
            //     const transactionTime = this.transactionTime.getTime();// 成交时间,
            //     const sendObj = {
            //         orgId: this.enterpriseId,
            //         inquiryId: obj.inquiryId,
            //         transactionStatus: 1, // 是否成交状态 1是0否,
            //         transactionMoney, // 成交金额,
            //         transactionMoneyCurrency, // 成交金额币种,
            //         transactionInfo, // 成交时间,
            //         transactionTime // 成交时间,
            //     };
            //     // 这里视情况发送 attrId , 有成交状态就发, 没有就不发, 不发后台不会更新 attrId
            //     const transactionStatus = this.computed_selectOptions.followUp.find(item => `${item.transactionStatus}` === '1');
            //     if (transactionStatus) {
            //         sendObj.attrId = transactionStatus.attrId;
            //     }
            //     crmCommon.followupStatusSave(sendObj).then(res => {
            //         if (res.code !== '1') {
            //             this.$Message.error(this.$t('crm.Html.error_saveClinchData'));
            //         } else {
            //             obj.currentObj.transactionMoney = transactionMoney;
            //             obj.currentObj.transactionMoneyCurrency = transactionMoneyCurrency;
            //             obj.currentObj.transactionInfo = transactionInfo;
            //             obj.currentObj.transactionTime = transactionTime;
            //         }

            //         this.$saveLog(obj);
            //         this.$emit('update:flag_update_detail', !this.flag_update_detail);
            //         this.$emit('refreshCheck');
            //     }, reject => {
            //         this.$Message.error(this.$t('crm.Html.error_saveClinchData'));

            //         this.$saveLog(obj);
            //         this.$emit('update:flag_update_detail', !this.flag_update_detail);
            //         this.$emit('refreshCheck');
            //     }).catch(err => {
            //         this.$Message.error(this.$t('crm.Html.error_saveClinchData'));

            //         this.$saveLog(obj);
            //         this.$emit('update:flag_update_detail', !this.flag_update_detail);
            //         this.$emit('refreshCheck');
            //     });
            // },
            // 处理成交信息
            handleTransactionInfo(val, sysCreateFlag) {
                // 无成交信息, 直接退出流程
                if (!val) {
                    return;
                }

                let result = '';
                // 根据不同成交信息来源返回不同数据
                switch (`${sysCreateFlag}`) {
                    case '1':
                        // magento
                        result = JSON.parse(val);
                        result = `来自网站的订单信息
Order Number: ${result.orderId}
1. Order Summary:
    Order Total: ${result.cart.subtotal}
    ${result.cart.summary_count} item${(result.cart.summary_count > 1) ? 's' : ''} in Cart:
${result.cart.items.map((item, index) => `        ${index + 1}. ${item.product_name}; Qty: ${item.qty}; Price: ${item.product_price}; ${item.options.map(option => `${option.label}: ${option.value}`).join('; ')}\n            商品链接: ${item.product_url};`).join('\n')}
2. Shipping Address:
    ${result.shippingAddress.first_name || ''} ${result.shippingAddress.last_name || ''}
    ${result.shippingAddress.street_address || ''}
    ${result.shippingAddress.city_state_province_postal_code || ''}
    ${result.shippingAddress.country || ''}
    ${result.shippingAddress.phone || ''}
3. Billing Address:
    ${result.billingAddress.first_name || ''} ${result.billingAddress.last_name || ''}
    ${result.billingAddress.street_address || ''}
    ${result.billingAddress.city_state_province_postal_code || ''}
    ${result.billingAddress.country || ''}
    ${result.billingAddress.phone || ''}
`;
                        result = result.replace(/\n(\n)*( )*(\n)*\n/g, '\n');
                        break;
                    case '2':
                        // shopify
                        result = JSON.parse(val);
                        result = `来自网站的订单信息
Order Number: ${result.order_number}
1. Order Summary:
    total price: ${result.total_price} ${result.presentment_currency}; total line items price: ${result.total_line_items_price} ${result.presentment_currency}; total tax: ${result.total_tax} ${result.presentment_currency}; total tip_received: ${result.total_tip_received} ${result.presentment_currency};
    ${result.line_items.length} Item${(result.line_items.length > 1) ? 's' : ''} in Cart:
${result.line_items.map((item, index) => `        ${index + 1}. ${item.title}; Qty: ${item.quantity}; Price: ${item.price} ${result.presentment_currency};`).join('\n')}
2. Shipping Address:
    ${result.shipping_address.name || ''}
    ${result.shipping_address.company || ''}
    ${result.shipping_address.address1 || ''} ${result.shipping_address.address2 || ''}
    ${result.shipping_address.city || ''} ${result.shipping_address.province || ''} ${result.shipping_address.zip || ''}
    ${result.shipping_address.country || ''}
    ${result.shipping_address.phone || ''}
3. Billing Address:
    ${result.billing_address.name || ''}
    ${result.billing_address.company || ''}
    ${result.billing_address.address1 || ''} ${result.billing_address.address2 || ''}
    ${result.billing_address.city || ''} ${result.billing_address.province || ''} ${result.billing_address.zip || ''}
    ${result.billing_address.country || ''}
    ${result.billing_address.phone || ''}
`;
                        result = result.replace(/\n(\n)*( )*(\n)*\n/g, '\n');
                        break;
                    default:
                        // 默认手动创建
                        result = val;
                }

                return result;
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    this.get_inquiry_detail();
                } else {
                    this.inquiryDetail = {};
                    this.tempInquiryDetail = {};
                    this.transactionTime = '';
                    this.transactionMoney = null;
                    this.transactionMoneyCurrency = 'CNY';
                    this.transactionInfo = null;
                }
            },
            flag_update_detail() {
                // this.get_inquiry_detail();
            }
        }
    };
</script>
