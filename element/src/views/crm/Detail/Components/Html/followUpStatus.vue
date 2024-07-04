<template>
    <!-- <div :class="{'followStatus': true, 'line-followup-status': singleRow}"> -->
    <div :class="{'followStatus': true, 'line-followup-status': true}">
        <!--<div style="margin-right: 120px;">-->
        <div class="status-box-container"
             ref="statusBoxContainer">
            <div v-for="(item, index) in status_list"
                :key="index"
                @click="before_click_status(item)"
                :class="{'status-left-box': (index === 0),
                'status-right-box': (index === status_list.length - 1),
                'status-middle-box': (index > 0 && index < status_list.length - 1),
                'status-finished': (index <= current_status_index),
                'status-current': (index === current_status_index),
                'status-unFinish' : (index > current_status_index), notAllowed : disabled }">
                <TooltipAuto :content="item.attrName"></TooltipAuto>
            </div>
        </div>

        <!-- 关闭/开启询盘 + 询盘关闭记录 -->
        <div class="toggle-inquiry">
            <Button v-if="inquiry_detail.followUpId + '' === '-1'"
                    @click="openInquiry"
                    :class="{'highSeas-manage-hide' : disabled}"
                    :loading="isLoading"
                    style="font-size: 12px; padding-top: 0; padding-bottom: 0">{{ $t('crm.Html.openInquiry') }}</Button>
            <Button v-else
                    @click="closeInquiry"
                    :class="{'highSeas-manage-hide' : disabled}"
                    style="font-size: 12px; padding-top: 0; padding-bottom: 0">{{ $t('crm.Html.closeInquiry') }}</Button>&nbsp;&nbsp;
            <Tooltip content="询盘关闭记录" placement="bottom">
                <Icon custom="custom-record-inquiry"
                  size="12"
                  @click.native="visible_view_close_log = true"></Icon>
            </Tooltip>
        </div>

        <!-- 开关询盘 -->
        <CloseInquiry :visible.sync="visible_close_inquiry" :followUp="status_list[current_status_index]"
                      :inquiryId="inquiry_detail.id" @close-success="close_success"></CloseInquiry>

        <!-- 查看关闭询盘记录 -->
        <ViewCloseLog :visible.sync="visible_view_close_log" :inquiryId="inquiry_detail.id"></ViewCloseLog>

        <!-- 是否要更改跟进状态 -->
        <Modal :visible.sync="visible_confirm_change_status"
               :title="$t('crm.Html.title_change_followUp')"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               width="520px"
               :append-to-body="true">
            <p style="text-align: center;">{{ $t('crm.Html.change_followUp_from') }}
                【{{ get_followUp(inquiry_detail.followUpId) || inquiry_detail.followUp }}】
                {{ $t('crm.Html.change_followUp_to') }} 【{{ status.attrName }}】?</p>
            <div slot="footer">
                <Button @click="cancel_confirm_change_status">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button type="primary"
                        @click="ok_confirm_change_status"
                        class="piwik_change_followup_status">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>

        <!-- 是否要回传询盘 -->
        <Modal :visible.sync="visible_confirm_google"
               :title="$t('crm.Modal.title_returnInquiry')"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               width="520px"
               :append-to-body="true">
            <p style="text-align: center;">{{ $t('crm.Modal.returnInquiryToGoogleOrNot') }}</p>
            <div slot="footer">
                <Button @click="cancel_confirm_google">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button type="primary" @click="ok_confirm_google">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>

        <!-- 输入自定义询盘价值 -->
        <Modal :visible.sync="visible_input_inqValue"
               :title="$t('crm.Modal.tip_inputInquiryValue')"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               width="520px"
               :append-to-body="true">
            <Form label-width="150px">
                <!-- 转化操作 -->
                <FormItem :label="$t('crm.Modal.inquiryValue')">
                    <Input v-model="inqValue" :placeholder="$t('crm.Modal.tip_inputInquiryValue')"
                           style="width: 230px;"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button @click="cancel_input_inqValue">{{ $t('crm.Modal.modal_close') }}</Button>
                <Button type="primary" @click="ok_input_inqValue">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>

        <!-- 编辑成交时间, 金额 -->
        <Modal :visible.sync="visible_edit_clinchData"
               :title="$t('crm.Html.title_edit_clinchData')"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               width="520px"
               :append-to-body="true">
            <Form label-width="150px">
                <FormItem :label="$t('crm.Modal.transactionTime')"
                          :required="true">
                    <DatePicker v-model="transactionTime"
                        type="datetime"
                        style="width: 230px;"></DatePicker>
                </FormItem>
                <FormItem :label="$t('crm.Modal.transactionMoney')">
                    <div class="_f _r">
                        <ElInputExtend v-model="transactionMoney"
                                       :showWordLimit="true"
                                       :errorMessage="$t('enterClue.upperLimitTip')"
                                       :showErrorMsg="true"
                                       @input="handleMoneyInput"
                                       style="width: 162px;margin-right: 5px"></ElInputExtend>
                        <Select style="width: 62px; align-self: center" :value="transactionMoneyCurrency" class="currency_select" @change="handleCurrencyChange">
                            <Option v-for="item in options"
                                    :value="item.code"
                                    :label="item.symbol"
                                    :key="item.code">
                                {{item.cn}}
                            </Option>
                        </Select>
                    </div>
                </FormItem>
                <FormItem :label="$t('crm.Modal.transactionInfo')">
                    <ElInputExtend v-model="transactionInfo"
                                   type="textarea"
                                   :rows="3"
                                   maxLen="4000"
                                   :showWordLimit="true"
                                   :errorMessage="$t('enterClue.upperLimitTip')"
                                   :showErrorMsg="true"
                                   style="width: 230px;"></ElInputExtend>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button @click="cancel_edit_clinchData">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button type="primary" @click="ok_edit_clinchData" class="piwik_edit_clinchData">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import Utils from '@/utils/index';
    import CloseInquiry from '@/views/crm/Detail/Components/Modal/closeInquiry';
    import ViewCloseLog from '@/views/crm/Detail/Components/Modal/viewCloseLog';
    import { mapState } from 'vuex';
    import { crmCommon, crmInquiry } from '@/api/crm/index';

    export default {
        name: 'followUpStatus',
        props: [
            'flag_update_detail',
            'inquiry_detail',
            'disabled',
            'singleRow'
        ],
        components: {
            CloseInquiry,
            ViewCloseLog
        },
        data() {
            return {
                // 成交状态所处的位置
                transactionStatusIndex: -1,
                isLoading: false,
                /* 主体 */
                all_status: [],
                status_list: [],
                visible_close_inquiry: false,
                visible_view_close_log: false,
                changing: false,
                // 暂存被点击要变更到的跟进状态, 给后续弹框和请求用
                status: {},

                /* 确定更改跟进状态 */
                visible_confirm_change_status: false,

                /* 输入价值 */
                visible_confirm_google: false,
                confirm_google: false,
                inqValue: null,
                visible_input_inqValue: false,
                // 暂存变更跟进状态接口所需数据
                updateStatusObj: {},

                /* 编辑成交数据 */
                visible_edit_clinchData: false,
                transactionTime: new Date(),
                transactionMoney: null,
                oldMoney: null,
                transactionMoneyCurrency: 'CNY',
                transactionInfo: null,
                tmpTransactionData: null,
                options: Utils.currencySymbol
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                associated_followUpStatus_list: state => state.app.associated_followUpStatus_list
            }),
            // 当前最新跟进状态的位置
            current_status_index() {
                if (this.inquiry_detail.followUpId) {
                    if (`${this.inquiry_detail.followUpId}` === '-1') {
                        return -1;
                    }
                    const temp = this.status_list.findIndex(item => `${item.attrId}` === `${this.inquiry_detail.followUpId}`);
                    return temp === -1 ? 0 : temp;
                } else if (this.inquiry_detail.followUp) {
                    const temp = this.status_list.findIndex(item => item.attrName === this.inquiry_detail.followUp);
                    return temp === -1 ? 0 : temp;
                }
                return 0;
            },
            // 与当前跟进状态对应的转化, 数组
            // 之前转化和跟进状态是一对一的, 但现在做了多 ads 账号绑定功能, ads 账户的转化操作跟跟进状态还是一对一, 但是不同 ads 账号可以对一个跟进状态重复创建转化操作
            related_google_conversion_list() {
                if (!this.associated_followUpStatus_list || !this.associated_followUpStatus_list.length) {
                    return [];
                }

                return this.associated_followUpStatus_list.filter(item => `${item.followupId}` === `${this.status.attrId}`);
            }
        },
        methods: {
            /* 主体 */
            get_followUp(id) {
                // 获取当前的 followUp
                let followUp = '';
                if (id) {
                    if (`${id}` === '-1') {
                        followUp = this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry');
                    } else if (`${id}` === '0') {
                        followUp = this.$t('crm.UniSet.defaultFollowUpStatus_inquiry');
                    } else {
                        const temp = this.all_status.find(item => `${item.attrId}` === `${id}`);
                        if (temp) {
                            followUp = temp.attrName;
                        }
                    }
                }
                return followUp;
            },
            // 获取全部询盘状态
            get_followUp_status() {
                // 获取最新的跟进状态关联的 google 转化
                this.$store.commit('get_associated_followUpStatus_list', this.enterpriseId);

                // 获取跟进状态
                this.$commonApi.getFollowUpList({
                    orgId: this.enterpriseId,
                    typeId: 7
                }).then(response => {
                    if (response.code === '1') {
                        this.all_status = response.data;
                        const status_list = response.data.filter(item => item.isAvailable === 1).sort((a, b) => a.sort - b.sort);
                        /**
                         * @Description: 成交和成交之后的状态加一个属性为true
                         * @author mayuanzhi
                         * @date 2020/6/1
                        */
                        this.status_list = status_list.map((item, index) => {
                            // 判断该状态是否是成交/成交之后的状态
                            // 成交状态 transactionStatus 为 1 , 在它之前的状态, 此数据为 0 , 之后的状态为 2
                            item.flag_transactionOrAfter = Boolean(item.transactionStatus);

                            // 记录成交状态的位置，因为下面往头部添加了一个元素所以加1
                            if (item.transactionStatus === 1) {
                                this.transactionStatusIndex = index + 1;
                            }

                            return item;
                        });
                        this.status_list.unshift({
                            attrName: this.$t('crm.UniSet.defaultFollowUpStatus_inquiry'),
                            attrId: 0
                        });
                    } else {
                        this.$Message.error(this.$t('crm.Html.error_getFollowUpStatusList'));
                    }
                });
            },
            // 重新打开询盘
            open_inq() {
                this.isLoading = true;
                this.changing = true;
                crmInquiry.inquiryCloseReasonOpen({
                    orgId: this.enterpriseId,
                    inquiryId: this.inquiry_detail.id,
                    followUpId: 0,
                    userId: this.userId,
                    userName: this.fullName
                }).then(res => {
                    if (res.code === '1') {
                        const prev_followUp = this.get_followUp(this.inquiry_detail.followUpId) || this.inquiry_detail.followUp;
                        const currentObj = Object.assign({}, this.inquiry_detail, {
                            followUp: this.$t('crm.UniSet.defaultFollowUpStatus_inquiry'),
                            followUpId: '0'
                        });
                        this.$saveLog({
                            operateType: 2,
                            operateModule: 3,
                            inquiryId: this.inquiry_detail.id,
                            targetId: this.inquiry_detail.id,
                            enterpriseId: this.enterpriseId.toString(),
                            userId: this.userId,
                            fullName: this.fullName,
                            prevObj: Object.assign(this.inquiry_detail, {
                                followUp: prev_followUp || ''
                            }),
                            currentObj: currentObj
                        });

                        this.$emit('update:inquiry_detail', currentObj);
                        this.$emit('update:flag_update_detail', !this.flag_update_detail);
                        // flag_update_detail会调用refreshCheck，导致列表页会请求两次该询盘信息
                        // this.$emit('refreshCheck');
                    } else {
                        this.$Message.error(this.$t('crm.Html.error_openInquiry'));
                    }
                    this.changing = false;
                    this.isLoading = false;
                }, rej => {
                    this.changing = false;
                    this.isLoading = false;
                }).catch(e => {
                    this.changing = false;
                    this.isLoading = false;
                });
            },
            close_success() {
                const prev_followUp = this.get_followUp(this.inquiry_detail.followUpId) || this.inquiry_detail.followUp;
                const currentObj = Object.assign({}, this.inquiry_detail, {
                    followUp: this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry'),
                    followUpId: '-1'
                });
                this.$saveLog({
                    operateType: 2,
                    operateModule: 3,
                    inquiryId: this.inquiry_detail.id,
                    targetId: this.inquiry_detail.id,
                    enterpriseId: this.enterpriseId.toString(),
                    userId: this.userId,
                    fullName: this.fullName,
                    prevObj: Object.assign(this.inquiry_detail, {
                        followUp: prev_followUp || ''
                    }),
                    currentObj: currentObj
                });

                this.$emit('update:inquiry_detail', currentObj);
                this.$emit('update:flag_update_detail', !this.flag_update_detail);
                // flag_update_detail会调用refreshCheck，导致列表页会请求两次该询盘信息
                // this.$emit('refreshCheck');
            },
            openInquiry() {
                if (this.disabled) {
                    this.$Message.error(this.$t('crm.Html.error_inoperable'));
                    return;
                }

                this.open_inq();
            },
            closeInquiry() {
                if (this.disabled) {
                    this.$Message.error(this.$t('crm.Html.error_inoperable'));
                    return;
                }

                this.visible_close_inquiry = true;
            },
            // 点击跟进状态
            before_click_status(status) {
                // disabled 为 true , 不允许操作
                if (this.disabled) {
                    this.$Message.error(this.$t('crm.Html.error_inoperable'));
                    return;
                }

                // 正在修改状态, 不允许操作
                if (this.changing) {
                    this.$Message.error(this.$t('crm.Html.error_waitForChange'));
                    return '';
                }

                // 如果点击状态为当前最新选中状态则不弹变更弹窗
                if (this.inquiry_detail.followUpId === `${status.attrId}`) {
                    return false;
                }

                // 暂存要变更到的跟进状态
                this.status = status;

                // 确定变更跟进状态
                this.click_status();
            },
            async click_status() {
                this.changing = true;

                // 请求 gclids
                const gclids = [];
                const res_gclid = await crmInquiry.getVisitorIdGclidByInquiryId({
                    inquiryId: this.inquiry_detail.id
                });
                if (res_gclid.data) {
                    res_gclid.data.forEach(item => {
                        const { gclid } = item;
                        if (gclid) {
                            gclids.push(gclid);
                        }
                    });
                }

                // 是否变更为成交或成交之后的状态
                // const isChangeToTransactionOrAfter = this.status.flag_transactionOrAfter && this.current_status_index < this.transactionStatusIndex;
                const isChangeToTransactionOrAfter = this.status.flag_transactionOrAfter;
                // console.log(this.related_google_conversion_list,gclids,'sss',isChangeToTransactionOrAfter);
                // 判断是否需要打开 确认回传提醒框/成交数据编辑框
                if (this.related_google_conversion_list.length && gclids.length) {
                    // 如果有 gclid 且转化列表未请求完成, 退出流程
                    // if (this.inquiry_detail.gclid && !this.associated_followUpStatus_list) {
                    // if (gclids.length && !this.associated_followUpStatus_list) {
                    //     this.changing = false;
                    //     this.$Message.error('正在请求与 GOOGLE 关联的跟进状态列表, 请稍后再更改跟进状态');
                    //     return '';
                    // }

                    // 如果有 gclid 且有与跟进状态相关的转化, 退出流程并打开确认回传提醒框
                    this.changing = false;
                    this.visible_confirm_google = true;
                } else if (isChangeToTransactionOrAfter) {
                    // 否则, 如果是从未成交状态变为成交/成交之后的状态, 退出流程并打开成交数据编辑窗。

                    this.changing = false;
                    this.visible_edit_clinchData = true;
                }

                // 暂存变更跟进状态接口所需数据
                this.updateStatusObj = {
                    transactionStatus: isChangeToTransactionOrAfter,
                    attrName: this.status.attrName,
                    attrId: this.status.attrId,
                    gclids
                };

                // 如果没有弹出确认提示框, 说明可以直接更改跟进状态
                if (this.changing) {
                    this.changing = false;
                    this.visible_confirm_change_status = true;
                }
            },
            // 更改跟进状态
            update_followUp_status() {
                // 为防止中途有弹窗中断过更改跟进状态流程, 先置 changing 为 true
                this.changing = true;
                // 从暂存对象中取出数据
                const { transactionStatus, attrId, attrName, gclids } = this.updateStatusObj;
                // 暂存询盘价值, 之后重置询盘价值为 null
                const inqValue = this.inqValue;
                this.inqValue = null;
                const data = {
                    orgId: this.enterpriseId,
                    inquiryId: this.inquiry_detail.id,
                    followUpId: attrId,
                    userId: this.userId,
                    userName: this.fullName
                };
                if (transactionStatus) {
                    let transactionMoney = this.transactionMoney ? Number(this.transactionMoney.replace(/,/g, '')) : ''; // 成交金额,
                    transactionMoney = Number.isNaN(transactionMoney) ? this.transactionMoney : transactionMoney;
                    data.transactionMoney = transactionMoney;
                    data.transactionMoneyCurrency = this.transactionMoneyCurrency; // 成交金额币种
                    data.transactionTime = this.transactionTime.getTime();// 成交时间
                    data.transactionInfo = this.transactionInfo; // 成交信息
                }
                crmInquiry.inquiryCloseReasonOpen(data).then(response => {
                    if (response.code === '1') {
                        this.$Message.success(this.$t('crm.Html.success_changeFollowUpStatus'));
                        // 如果有 gclid 且有与当前跟进状态对应的转化, 则触发回传操作

                        // 之前是有gclid且有与当前跟进状态对应的转化,则触发回传操作,现在是
                        // 有gclid,即使当前跟进状态没有对应的转化,也需要调接口将信息放到手动回传中
                        if (gclids.length) {
                            this.update_google_status({
                                inqValue,
                                attrId,
                                attrName,
                                gclids
                            });
                        }
                        const prev_followUp = this.get_followUp(this.inquiry_detail.followUpId) || this.inquiry_detail.followUp;
                        const currentObj = Object.assign({}, this.inquiry_detail, {
                            followUp: attrName,
                            followUpId: attrId
                        });
                        if (transactionStatus) {
                            let transactionMoney = this.transactionMoney ? Number(this.transactionMoney.replace(/,/g, '')) : ''; // 成交金额,
                            transactionMoney = Number.isNaN(transactionMoney) ? this.transactionMoney : transactionMoney;
                            currentObj.transactionTime = this.$options.filters.timeFormat(this.transactionTime);
                            currentObj.transactionMoney = transactionMoney;
                            currentObj.transactionMoneyCurrency = this.transactionMoneyCurrency;
                            currentObj.transactionInfo = this.transactionInfo;
                            /* 保存日志 */
                            this.$saveLog({
                                operateType: 2,
                                operateModule: 3,
                                inquiryId: this.inquiry_detail.id,
                                targetId: this.inquiry_detail.id,
                                enterpriseId: this.enterpriseId.toString(),
                                userId: this.userId,
                                fullName: this.fullName,
                                prevObj: Object.assign(this.inquiry_detail, {
                                    followUp: prev_followUp || '',
                                    transactionTime: this.$options.filters.timeFormat(this.inquiry_detail.transactionTime),
                                    transactionMoney: this.inquiry_detail.transactionMoney,
                                    transactionInfo: this.inquiry_detail.transactionInfo
                                }),
                                currentObj: currentObj
                            });
                            // this.$emit('update:inquiry_detail', currentObj);
                            this.$emit('update:flag_update_detail', !this.flag_update_detail);
                            // flag_update_detail会调用refreshCheck，导致列表页会请求两次该询盘信息
                            // this.$emit('refreshCheck');
                        } else {
                            /* 保存日志 */
                            this.$saveLog({
                                operateType: 2,
                                operateModule: 3,
                                inquiryId: this.inquiry_detail.id,
                                targetId: this.inquiry_detail.id,
                                enterpriseId: this.enterpriseId.toString(),
                                userId: this.userId,
                                fullName: this.fullName,
                                prevObj: Object.assign(this.inquiry_detail, {
                                    followUp: prev_followUp || ''
                                }),
                                currentObj: currentObj
                            });
                          
                            this.$emit('update:inquiry_detail', currentObj);
                            this.$emit('update:flag_update_detail', !this.flag_update_detail);
                            // flag_update_detail会调用refreshCheck，导致列表页会请求两次该询盘信息
                            // this.$emit('refreshCheck');
                        }
                        // 通知whatsapp的emitToWaManagement同屏查看下属泳道 更新成功；
                        this.$emit('emitToWaManagement', 'success');
                    } else {
                        // 通知whatsapp的 同屏查看下属泳道 更新失败；
                        this.$emit('emitToWaManagement', 'fail');
                        this.$Message.error(this.$t('crm.Html.error_changeFollowUpStatus'));
                    }
                    this.changing = false;
                }, rej => {
                    this.changing = false;
                }).catch(e => {
                    this.changing = false;
                });
            },

            /* modal */
            // 确定更改跟进状态
            ok_confirm_change_status() {
                this.visible_confirm_change_status = false;
                this.update_followUp_status();
            },
            // 取消更改跟进状态
            cancel_confirm_change_status() {
                this.visible_confirm_change_status = false;
                // 通知whatsapp的 同屏查看下属泳道 更新失败；
                this.$emit('emitToWaManagement', 'fail');
            },
            // 确认要回传 google
            ok_confirm_google() {
                // 关闭确认回传框
                this.visible_confirm_google = false;

                // 确认需要回传
                this.confirm_google = true;

                // 暂存"第一个需要输入价值的转化操作"的默认价值
                let defaultValue = null;
                if (this.related_google_conversion_list.length && this.related_google_conversion_list.some(item => {
                    if (`${item.useRevenueValue}` === '2') {
                        defaultValue = item.defaultRevenueValue;
                        return true;
                    }
                })) {
                    // 如果关联关系需要输入价值, 则打开价值输入框

                    this.visible_input_inqValue = true;
                    this.inqValue = defaultValue;
                } else if (this.updateStatusObj.transactionStatus) {
                    // 否则, 如果要变更到的状态是成交/成交之后状态, 则打开成交数据编辑框

                    this.visible_edit_clinchData = true;
                } else {
                    // 都不满足, 则直接调用接口更改跟进状态

                    this.update_followUp_status();
                }
            },
            // 确定不回传 google
            cancel_confirm_google() {
                // 关闭确认回传框
                this.visible_confirm_google = false;

                // 确认取消回传
                this.confirm_google = false;

                if (this.updateStatusObj.transactionStatus) {
                    // 如果要变更到的状态是成交/成交之后状态, 则打开成交数据编辑框

                    this.visible_edit_clinchData = true;
                } else {
                    // 都不满足, 则直接调用接口更改跟进状态

                    this.update_followUp_status();
                }
            },
            // 手动输入询盘价值完成
            ok_input_inqValue() {
                if (/^(\d+)(\.\d+)?$/.test(this.inqValue)) {
                    // 输入为合法正数

                    // 关闭弹框
                    this.visible_input_inqValue = false;

                    if (this.updateStatusObj.transactionStatus) {
                        this.visible_edit_clinchData = true;
                    } else {
                        this.update_followUp_status();
                    }
                } else {
                    // 输入不为合法正数, 弹出提醒

                    this.$Message.error(this.$t('crm.Modal.error_valueFormatError'));
                }
            },
            // 取消输入询盘价值
            cancel_input_inqValue() {
                this.visible_input_inqValue = false;
                this.$emit('emitToWaManagement', 'fail');
            },
            // 回传 google
            update_google_status(obj) {
                // 如果当前跟进状态有对应的转化
                if (this.related_google_conversion_list.length) {
                    // 数据处理
                    const dataList = this.related_google_conversion_list.map(item => {
                        // 定义线索价值
                        let value = 0;
                        // 如果转化要求使用自定义价值, 则把填入之前输入的线索价值
                        if (`${item.useRevenueValue}` === '2') {
                            value = obj.inqValue;
                            // 如果转化要求使用默认价值, 则把填入转化定义时的默认价值
                        } else if (`${item.useRevenueValue}` === '1') {
                            value = item.defaultRevenueValue;
                        }

                        return {
                            orgId: this.enterpriseId, // 组织机构编码
                            clueId: this.inquiry_detail.clueId, // 线索id
                            gclid: obj.gclids.join(','),
                            inquiryId: this.inquiry_detail.id, // 询盘id
                            visitorId: this.inquiry_detail.visitorId,
                            presentFollowup: obj.attrName, // 当前跟进状态
                            presentFollowupId: obj.attrId, // 当前跟进状态id
                            presentSumbitPerson: this.fullName, // 当前登录用户名称
                            presentSumbitPersonId: this.userId, // 当前登录用户id
                            presentNeedAudit: this.confirm_google ? 1 : 2, // 1提交审核，2不审核
                            conversionId: item.conversionId, // 关联的转化id(presentNeedAudit为2不提交审核时不用传)
                            useRevenueValue: this.confirm_google ? item.useRevenueValue : null, // 使用价值类型(1,"每次使用默认值",2,"每次使用不同的值",3,"不使用价值")(presentNeedAudit为2不提交审核时不用传)
                            value: this.confirm_google ? value : 0, // 价值(presentNeedAudit为2不提交审核时不用传)
                            customerId: item.customerId, // 关联转化的 ads 账户 id
                            adsCustomerName: item.adsCustomerName // 关联转化的 ads 账户 name
                        };
                    });

                    // 发送请求
                    crmCommon.saveAudit(dataList).then(response => {
                        if (response.code === '1') {
                            if (this.confirm_google) {
                                this.$Message.success(this.$t('crm.Modal.success_audit'));
                            } else {
                                this.$Message.success(this.$t('crm.Modal.success_passBack'));
                            }
                        } else if (response.code === '-2') {
                            this.$Message.error(this.$t('crm.Modal.error_alreadyUploadGoogle'));
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_uploadGoogle'));
                        }
                    });
                } else {
                    const data = {
                        orgId: this.enterpriseId, // 组织机构编码
                        clueId: this.inquiry_detail.clueId, // 线索id
                        gclid: obj.gclids.join(','),
                        inquiryId: this.inquiry_detail.id, // 询盘id
                        visitorId: this.inquiry_detail.visitorId,
                        presentFollowup: obj.attrName, // 当前跟进状态
                        presentFollowupId: obj.attrId, // 当前跟进状态id
                        presentSumbitPerson: this.fullName, // 当前登录用户名称
                        presentSumbitPersonId: this.userId, // 当前登录用户id
                        presentNeedAudit: 2, // 1提交审核，2不审核
                        useRevenueValue: null, // 使用价值类型(1,"每次使用默认值",2,"每次使用不同的值",3,"不使用价值")(presentNeedAudit为2不提交审核时不用传)
                        value: 0 // 价值(presentNeedAudit为2不提交审核时不用传)
                    };

                    crmCommon.saveAudit([data]).then(response => {
                        if (response.code === '1') {
                            this.$Message.success(this.$t('crm.Modal.success_passBack'));
                        } else {
                            this.$Message.error(this.$t('crm.Modal.again_submit'));
                        }
                    });
                }
            },
            // 编辑成交数据完毕
            ok_edit_clinchData() {
                // 各类校验
                // 成交时间校验
                if (!(this.transactionTime instanceof Date && !isNaN(this.transactionTime.getTime()))) {
                    this.$Message.error(this.$t('crm.Html.empty_transactionTime'));
                    return;
                }
                if (this.transactionMoney) {
                    const tempMoney = this.transactionMoney.replace(/,/g, '');
                    if (isNaN(Number(tempMoney))) {
                        this.$Message.warning('成交金额只支持数字类型');
                        return;
                    }

                    // 成交金额校验
                    if (this.transactionMoney && this.transactionMoney.length > 200) {
                        this.$Message.error(`【${this.$t('crm.fieldLimit.transactionMoney')}】  ${this.$t('crm.fieldLimit.error_overLength')}`);
                        return;
                    }
                }
                // 成交信息校验
                if (this.transactionInfo && this.transactionInfo.length > 4000) {
                    this.$Message.error(`【${this.$t('crm.fieldLimit.transactionInfo')}】  ${this.$t('crm.fieldLimit.error_overLength')}`);
                    return;
                }

                // 校验通过, 发送请求
                this.visible_edit_clinchData = false;
                this.update_followUp_status();
            },
            // 取消编辑成交数据
            cancel_edit_clinchData() {
                // 关闭成交数据弹框
                this.visible_edit_clinchData = false;
                this.$emit('emitToWaManagement', 'fail');

                // 用打开编辑框时暂存的成交数据, 把成交数据恢复回来
                if (this.tmpTransactionData) {
                    Object.entries(this.tmpTransactionData).forEach(([key, value]) => {
                        this[key] = value;
                    });
                }
            },
            handleCurrencyChange(val) {
                this.transactionMoneyCurrency = val;
            },
            handleMoneyInput(val) {
                // 去除数字和小数点外的其他字符
                val = val.replace(/[^\d.]/gi, '');

                if ((/[\d.]+/.test(val))) {
                    // 正则校验通过

                    // 以小数点分割传入值
                    const temp = val.split('.');

                    if (temp.length === 1) {
                        // 不包含小数点

                        // 数字有效位数校验
                        if (val.length > 16) {
                            // 有效位数超过 16 位

                            this.transactionMoney = this.oldMoney;
                            return false;
                        }

                        // 校验通过, 赋值
                        const result = Number(val).toLocaleString();
                        this.transactionMoney = result;
                        this.oldMoney = result;

                        // 停止向下执行
                        return false;
                    }

                    if (temp.length === 2) {
                        // 包含一个小数点

                        if (val[0] === '.') {
                            // 首字符为小数点

                            this.transactionMoney = this.oldMoney;
                            return false;
                        }

                        // 拆分整数位小数位
                        const [integer, decimal] = temp;

                        if (decimal.length > 2) {
                            // 小数位长度超过 2 位

                            this.transactionMoney = this.oldMoney;
                            return false;
                        }

                        if (integer.length + decimal.length > 16) {
                            // js 数字有效位数最多为 16 位

                            this.transactionMoney = this.oldMoney;
                            return false;
                        }

                        const result = Number(integer).toLocaleString() + '.' + decimal;
                        this.transactionMoney = result;
                        this.oldMoney = result;

                        // 停止向下执行
                        return false;
                    }

                    // 包含多个小数点
                    this.transactionMoney = this.oldMoney;
                } else {
                    // 未通过正则校验

                    this.transactionMoney = null;
                    this.oldMoney = null;
                }
            }
        },
        created() {
            this.get_followUp_status();
        },
        activated() {
            this.get_followUp_status();
        },
        watch: {
            inquiry_detail: {
                handler(val, oldVal) {
                    this.transactionTime = val.transactionTime ? new Date(val.transactionTime) : new Date();
                    if (val.transactionMoney) {
                        this.handleMoneyInput(`${val.transactionMoney}`);
                    } else {
                        this.transactionMoney = null;
                        this.oldMoney = null;
                    }
                    this.transactionMoneyCurrency = val.transactionMoneyCurrency ? val.transactionMoneyCurrency : 'CNY';
                    this.transactionInfo = val.transactionInfo ? val.transactionInfo : null;

                    // 组件为 singleRow 模式, 切换询盘后组件水平滚动条定位到当前状态
                    // if (this.singleRow) {
                    // 询盘 ID 未发生变化则不重新定位水平滚动条
                    if (val && oldVal && val.id === oldVal.id) {
                        return;
                    }

                    // 重新定位水平滚动条
                    setTimeout(() => {
                        const _containerEl = this.$refs.statusBoxContainer;
                        if (_containerEl) {
                            const _curFollowupEl = _containerEl.querySelector('.status-current');
                            _containerEl.scrollLeft = _curFollowupEl ? _curFollowupEl.offsetLeft : 0;
                        }
                    });
                    // }
                },
                deep: true,
                immediate: true
            },
            // 成交数据编辑框显示时, 先保存之前的成交数据, 用户取消编辑时, 恢复数据为之前的状态
            visible_edit_clinchData: {
                handler(val) {
                    if (val) {
                        this.tmpTransactionData = {
                            transactionTime: this.transactionTime,
                            transactionMoney: this.transactionMoney,
                            transactionMoneyCurrency: this.transactionMoneyCurrency,
                            transactionInfo: this.transactionInfo
                        };
                    }
                }
            }
        }
    };
</script>

<style scoped lang="less">
    @bgColor-finished: #01BE82;
    /*@bgColor-unFinish: #01BE82;*/
    @bgColor-unFinish: #D5F2E9;
    @bdColor-finished: #01BE82;
    /*@bdColor-unFinish: #01BE82;*/
    @bdColor-unFinish: #D5F2E9;
    @bdColor-finished-hover: #01BE82;
    /*@bdColor-unFinish-hover: #01BE82;*/
    @bdColor-unFinish-hover: #D5F2E9;
    .notAllowed{
        cursor: not-allowed!important;
    }

    .followStatus {
        margin: 0 10px 0 0;
        clear: both;
        position: relative;
        font-size: 12px;

        &:after {
            content: ".";
            display: block;
            height: 0;
            clear: both;
            visibility: hidden;
        }
    }

    /* 三角形 */
    // 主体 div 基本样式
    .tri-body {
        position: relative;
        padding: 0 10px 0 30px;
        width: 110px;
        height: 26px;
        line-height: 25px;
        cursor: pointer;
        text-align: left;
        // margin-top: 20px;
        margin-right: 5px;
        float: left;
        text-overflow: ellipsis;
        border: 1px solid transparent;
    }

    // 三角形基本样式
    .tri {
        display: block;
        content: '';
        position: absolute;
        right: 0;
        top: -1.2px;
        width: 0;
        height: 0;
        border: 13px solid transparent;
        border-right-width: 0;
    }

    // 前三角形
    .tri-before {
        .tri;
        border-left-color: #FFF;
        left: -1px;
        z-index: 10;
    }

    // 后三角形
    .tri-after {
        .tri;
        right: -13px;
        z-index: 100;
    }

    .status-left-box {
        .tri-body;
        /*border-radius: 15px 0 0 15px;*/
        // margin-top: 8px;
        border-radius: 5px 0 0 5px;
        border-right: none;
        margin-right: 9px;

        &::after {
            .tri-after;
        }
    }

    .status-middle-box {
        .tri-body;
        margin-right: 9px;
        border-right: none;

        &::before {
            .tri-before;
        }

        &::after {
            .tri-after;
        }
    }

    .status-right-box {
        .tri-body;
        /*border-radius: 0 15px 15px 0;*/
        border-radius: 0 5px 5px 0;
        border-left: none;
        margin-right: 0;

        &::before {
            .tri-before;
        }
    }

    // 已完成状态
    .status-finished {
        border-color: @bdColor-finished;
        /*color: @bdColor-finished;*/
        color: #fff;
        background-color: @bgColor-finished;
        font-weight: 500;

        &::after {
            border-left-color: @bdColor-finished;
        }

        &:hover {
            /*color: @bdColor-finished-hover;*/
            color: #fff;
            border-color: @bdColor-finished-hover;

            &:after {
                border-left-color: @bdColor-finished-hover;
            }
        }
    }

    // 未完成状态
    .status-unFinish {
        border-color: @bdColor-unFinish;
        /*color: @bdColor-unFinish;*/
        color: #0A7150;
        /*background-color: @bgColor-unFinish;*/
        background-color: @bgColor-unFinish;

        &::after {
            border-left-color: @bdColor-unFinish;
        }

        &:hover {
            /*color: @bdColor-unFinish-hover;*/
            color: #0A7150;
            border-color: @bdColor-unFinish-hover;

            &:after {
                border-left-color: @bdColor-unFinish-hover;
            }
        }
    }

    .toggle-inquiry {
        float: left;
        margin: 20px 0 0 15px;

        button {
            height: 26px;
            color: #000;
            border-width: 0;
            /*background-color: @bdColor-unFinish;*/
            background-color: #F1F2F6;
            margin: 0 8px;
            padding: 0 6px;
            font-weight: normal;

            &:hover {
                /*background-color: @bdColor-unFinish-hover;*/
                background-color: #F1F2F6;
            }
        }

        .custom-record-inquiry {
            margin-left: 8px;
            cursor: pointer;
        }
    }

    .line-followup-status {
        width: 100%;
        display: flex;
        /*align-items: center;*/
        height: 34px;
        overflow-x: auto;

        .status-box-container {
            white-space: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            flex: 1;
            // padding-bottom: 9px;

            > div {
                display: inline-block;
                float: none;
            }
        }

        .toggle-inquiry {
            float: none;
            margin: 0 0 0;

            .custom-record-inquiry {
                margin-left: 0;
            }
        }
    }
    .currency_select {
        margin-top: 0 !important;
        /deep/ .el-input__inner {
            padding-right: 0 !important;
        }
    }
</style>
