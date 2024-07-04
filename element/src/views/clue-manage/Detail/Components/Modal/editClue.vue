<template>
    <div>
        <Modal
            :visible="visible"
            :title="$t('clue.edit_clue')"
            :modal="false"
            :show-close="false"
            append-to-body
            v-dialog-drag
            width="540px"
            style="overflow:hidden;"
            ref="editClue"
            @scroll.native.capture="close_popper"
            custom-class="edit-clue-modal">
                <div style="height:46vh;overflow:auto">
                    <Spin size="large" fix v-if="loading"></Spin>
                    <div v-if="fieldsList.length">
                        <div style="padding: 0 16px">
                            <Form
                                class='enter-clue-form'
                                label-width="133px"
                                style="margin-top:12px;padding: 0 16px"
                                label-position="right">
                                <clueInputArea ref="clueInputArea"
                                    :detailInfo.sync="detailInfo"
                                    :fieldsList.sync="fieldsList"
                                    :error_countryArea.sync="error_countryArea"
                                    :socialNetworkingPlatform.sync="socialNetworkingPlatform"
                                    from="editClue"
                                    @verifyEmail="verifyEmail"
                                    @verifyPhone="verifyPhone"
                                    @verifyWA="verifyWA"
                                    ></clueInputArea>
                            </Form>
                        </div>
                    </div>
                </div>
                <div slot="footer">
                    <Button  @click="$emit('update:visible', false)">{{$t('clue.cancel')}}</Button>
                    <Button type="primary" @click="confirmSaveChange" class="save-edit-clue">{{$t('clue.save')}}</Button>
                </div>
        </Modal>
        <!-- 重复模态框 -->
        <checkRepeatModal
            v-if="isEmailRepeat"
            :title="checkRepeatModalTitle"
            :repeatData="repeatData"
            :flag="enterFlag"
            :visible.sync="isEmailRepeat"
            @okEnter="updateXS"
            @cancelEnter="cancelEnter"
        ></checkRepeatModal>
    </div>
</template>

<script>
    import Utils from '@/utils/index';
    import clueInputArea from '@/views/clue-manage/Detail/Components/Modal/clue-input-area';
    import checkRepeatModal from '@/views/main-components/enter-clue/Components/check-repeat-modal';
    import { getUpperLengthLimit } from '@/api/upperLengthLimit.js';
    import { crmClue } from '@/api/crm';
    import { mapState } from 'vuex';

    export default {
        name: 'editClue',
        props: [
            'visible',
            'clueId',
            'flag_update_detail',
            'saleId',
            'createUserId',
            'serviceId'
        ],
        components: {
            clueInputArea,
            checkRepeatModal
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                fullName: 'fullName',
                userName: 'userName',
                userId: 'userId',
                showUniq: state => state.crm.showUniq,
                email_duplicate_check: (state) => state.crm.email_duplicate_check
            }),
            platFormFlag() {
                return this.socialNetworkingPlatform.filter(item => {
                    item.account = item.account.trim();
                    if (item.type !== '' && item.account !== '') {
                        return {
                            type: item.type,
                            account: item.account
                        };
                    }
                });
            }
        },
        data() {
            return {
                // 社交平台
                socialNetworkingPlatform: [
                    {
                        type: '',
                        account: ''
                    }
                ],
                loading: true,
                detailInfo: {},
                fieldsList: [],
                oldEmail: '',
                oldPhone: '',
                oldWA: '',
                // CRM 字段多语言
                close_popper: this.$throttle(e => {
                    if (e && e.target && e.target.classList.contains('el-dialog__body')) {
                        // 关闭 select 下拉选框
                        const selectEl = this.$refs.editClue.$el.querySelector('.is-focus');
                        if (selectEl) {
                            selectEl.click();
                        }
                    }
                }, 500, 500),
                isEmailRepeat: false,
                checkRepeatModalTitle: this.$t('clue.emailOrPhoneRepeat'),
                enterFlag: 'saveClue',
                repeatData: {
                    clueEmail: null,
                    contactEmail: null,
                    cluePhone: null,
                    contactPhone: null,
                    clueWA: null,
                    contactWA: null
                },
                error_countryArea: false
            };
        },
        methods: {
            validePlatform(column, index) {
                const str = JSON.stringify(this.socialNetworkingPlatform);
                if (str.length > column.upperLimitLength) {
                    this.$set(this.fieldsList[index], 'isExtraLong', true);
                    return true;
                } else {
                    this.$set(this.fieldsList[index], 'isExtraLong', false);
                    return false;
                }
            },
            /**
             * @Date: 2020-06-30 11:11:39
             * @LastEditors: niumkiki
             * @description: 验证必填项是否为空
             * @param :
             * @return:
             */
            valideClueEnter(column, index, platFormKey, platFormIndex) {
                if (column.isNeed) {
                    // 社交平台处理
                    if (column.key === 'a10013') {
                        // 判断字段是否超长
                        this.validePlatform(column, index);
                        if (platFormKey === 'account' && this.socialNetworkingPlatform[platFormIndex].account) {
                            this.socialNetworkingPlatform[platFormIndex].account = this.socialNetworkingPlatform[platFormIndex].account.trim();
                        }
                        // 如果是社交平台分类没有填写
                        if (platFormKey === 'type' && !this.socialNetworkingPlatform[platFormIndex].type) {
                            this.$set(this.fieldsList[index], 'isEmpty', true);
                            this.$set(this.socialNetworkingPlatform[platFormIndex], 'platFormFlagEmptyTip', this.$t('enterClue.platFormFlagTypeEmptyTip'));
                            return true;
                        } else if (platFormKey === 'account' && !this.socialNetworkingPlatform[platFormIndex].account) {
                            // 如果是社交平台内容没有填写
                            this.$set(this.fieldsList[index], 'isEmpty', true);
                            this.$set(this.socialNetworkingPlatform[platFormIndex], 'platFormFlagEmptyTip', this.$t('enterClue.platFormFlagAccountEmptyTip'));
                            return true;
                        } else {
                            // 判断是否含有platFormIndex
                            if (platFormIndex === undefined) {
                                // 如果是undefined， 代表是点击确认时，去验证规则的
                                const emptyArr = this.socialNetworkingPlatform.some((item, i) => {
                                    if (item.account) {
                                        item.account = item.account.trim();
                                    }
                                    if (!item.type && !item.account) {
                                        this.$set(this.socialNetworkingPlatform[i], 'platFormFlagEmptyTip', this.$t('enterClue.emptyTip'));
                                        return true;
                                    } else if (!item.type) {
                                        this.$set(this.socialNetworkingPlatform[i], 'platFormFlagEmptyTip', this.$t('enterClue.platFormFlagTypeEmptyTip'));
                                        return true;
                                    } else if (!item.account) {
                                        this.$set(this.socialNetworkingPlatform[i], 'platFormFlagEmptyTip', this.$t('enterClue.platFormFlagAccountEmptyTip'));
                                        return true;
                                    } else {
                                        this.$set(this.socialNetworkingPlatform[i], 'platFormFlagEmptyTip', '');
                                        return false;
                                    }
                                });
                                if (emptyArr) {
                                    this.$set(this.fieldsList[index], 'isEmpty', true);
                                }
                                return emptyArr;
                            } else {
                                this.$set(this.fieldsList[index], 'isEmpty', false);
                                this.$set(this.socialNetworkingPlatform[platFormIndex], 'platFormFlagEmptyTip', '');
                                // 判断社交平台是否超长
                                const isExtra = this.validePlatform(column, index);
                                if (isExtra) {
                                    const plateformEmpty = this.socialNetworkingPlatform.some((item, i) => {
                                        if (item.account) {
                                            item.account = item.account.trim();
                                        }
                                        return !item.type || !item.account;
                                    });
                                    if (plateformEmpty) {
                                        this.$set(this.fieldsList[index], 'isEmpty', true);
                                    }
                                }
                                return false;
                            }
                        }
                    } else if (column.key !== 'a10013') {
                        if (column.type === 'selectMultiple' || column.type === 'select') {
                            if (!this.detailInfo[column.key] || !this.detailInfo[column.key].length) {
                                this.$set(this.fieldsList[index], 'isEmpty', true);
                                return true;
                            } else {
                                this.$set(this.fieldsList[index], 'isEmpty', false);
                                return false;
                            }
                        } else {
                            if (!this.detailInfo[column.key] || (this.detailInfo[column.key] && !this.detailInfo[column.key].trim())) {
                                this.$set(this.fieldsList[index], 'isEmpty', true);
                                return true;
                            } else {
                                this.$set(this.fieldsList[index], 'isEmpty', false);
                                return false;
                            }
                        }
                    }
                }
            },
            // =========================================== 接口
            // 获取线索字段
            getFields() {
                return new Promise(resolve => {
                    crmClue.getXSShow({
                        userId: this.userId,
                        orgId: this.enterpriseId
                    }).then(async res => {
                        if (res.code === '1') {
                            const resData = await getUpperLengthLimit({ serviceFlag: 'save_clue', orgId: this.enterpriseId });
                            this.fieldsList = Object.entries(res.data.show).map(item => {
                                const [key, value] = item;
                                const { name, type, isNeed, option, isOnlyRead } = value;
                                // 遍历给字段增加最大长度限制
                                if (resData.code === '1') {
                                    Object.keys(resData.data).forEach(keys => {
                                        if (key === keys) {
                                            // 产品需求 客户、联系人、询盘 的 a10040字段长度为4000，线索统一为300
                                            if (resData.data[keys].parentField && resData.data[keys].parentField === 'a10040') {
                                                item.upperLimitLength = 300;
                                            } else {
                                                item.upperLimitLength = resData.data[keys].usableLength;
                                            }
                                        }
                                    });
                                }
                                return {
                                    isNeed,
                                    isOnlyRead,
                                    name,
                                    key: `${key}`,
                                    type,
                                    option: option.split('?'),
                                    upperLimitLength: item.upperLimitLength
                                };
                            });
                            resolve(true);
                        } else {
                            this.$Message.error(this.$t('clue.error_getClueFields'));
                            this.fieldsList = [];
                            resolve(false);
                        }
                    }).catch(error => {
                        console.log(error);
                        if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                            this.$Message.error(this.$t('clue.error_getClueFields'));
                        }
                        this.fieldsList = [];
                        resolve(false);
                    });
                });
            },
            /* 获取线索详情 */
            async getClueDetail() {
                this.loading = true;
                // 先获取线索字段详情
                if (await this.getFields()) {
                    crmClue.getColumnValue({
                        id: this.clueId,
                        userId: this.userId,
                        isEdit: 1
                    }).then(res => {
                        if (res.code === '1') {
                            this.detailInfo = res.data;
                            this.oldEmail = this.detailInfo.a10010;
                            this.oldPhone = this.detailInfo.a10012;
                            this.oldWA = this.detailInfo.a10052;
                            // 格式化多选字符串值
                            this.fieldsList.filter(field => field.type === 'selectMultiple').forEach(field => {
                                let temp = [];
                                // 线索字段对应的询盘字段可能变化, 如果类型变化, 则可能解析出来的格式不对, 无法正确显示
                                try {
                                    if (this.detailInfo[field.key]) {
                                        if (this.detailInfo[field.key].indexOf('[') !== -1) {
                                            temp = JSON.parse(this.detailInfo[field.key]);
                                            if (!Array.isArray(temp)) {
                                                temp = [];
                                            }
                                        } else {
                                            temp = this.detailInfo[field.key];
                                        }
                                    } else {
                                        console.log('selectMultiple', field);
                                        temp = [];
                                    }
                                } catch (e) {
                                    console.error(e);
                                }
                                this.$set(this.detailInfo, field.key, temp);
                            });
                            // 获取社交平台数据
                            if (this.detailInfo && this.detailInfo.a10013) {
                                // fix: 当社交平台数据为'[]'时,编辑线索时社交平台不显示输入框
                                if (this.detailInfo.a10013 === '[]') {
                                    console.log('社交平台没有值');
                                    this.socialNetworkingPlatform = [{ type: '', account: '' }];
                                } else {
                                    try {
                                        const tempJson = JSON.parse(this.detailInfo.a10013);
                                        if (this.detailInfo.a10013.indexOf('attrValue') !== -1) {
                                            this.socialNetworkingPlatform = tempJson.map(item => {
                                                return {
                                                    type: item.attrName,
                                                    account: item.attrValue
                                                };
                                            });
                                        } else {
                                            this.socialNetworkingPlatform = tempJson;
                                        }
                                    } catch (error) {
                                        console.error('社交平台格式错误', error);
                                    }
                                }
                            }
                        } else {
                            this.$Message.error(this.$t('clue.error_getClueDetail'));
                        }
                        this.loading = false;
                    }).catch(error => {
                        console.error(error);
                        if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                            this.$Message.error(this.$t('clue.error_getClueDetail'));
                        }
                        this.loading = false;
                    });
                } else {
                    this.loading = false;
                }
            },

            /* 校验 */
            // 验证邮箱
            // 验证邮箱
            verifyEmail(val, type) {
                /* type是是否有重复提示 */
                if (!val) {
                    return;
                }
                if (type) {
                    this.checkRepeatModalTitle = this.$t('crm.Modal.title_uniqEmail_fixed');
                    this.repeatData = {};
                }
                this.repeatData.clueEmail = null;
                this.repeatData.contactEmail = null;
                return new Promise((resolve, reject) => {
                    crmClue.getSameListByEmail({
                        orgId: this.enterpriseId,
                        email: String(val),
                        excludeId: this.detailInfo.id
                    }).then(response => {
                        if (response.code === '1') {
                            const data = response.data;
                            if (!data || (!data.clue && (!data.inquiry || !data.inquiry.length))) {
                                if (type) {
                                    this.$Message.success(this.$t('enterClue.backCluesTip2'));
                                }
                                resolve(false);
                            } else {
                                if (data.clue && data.clue.length) {
                                    this.repeatData.clueEmail = data.clue;
                                }
                                if (data.inquiry && data.inquiry.length) {
                                    this.repeatData.contactEmail = data.inquiry;
                                }
                                if (type) {
                                    this.enterFlag = 'self-test';
                                    this.isEmailRepeat = true;
                                }
                                resolve(true);
                            }
                        } else {
                            resolve(false);
                        }
                    });
                });
            },
            // 电话查重
            verifyPhone(value, type) {
                if (!value) {
                    return;
                }
                if (type) {
                    this.checkRepeatModalTitle = this.$t('crm.Modal.title_uniqPhone_fixed');
                    this.repeatData = {};
                }
                this.repeatData.cluePhone = null;
                this.repeatData.contactPhone = null;

                const data = {
                    orgId: this.enterpriseId,
                    phone: value,
                    excludeId: this.detailInfo.id
                };
                return new Promise((resolve, reject) => {
                    crmClue.getSameListByPhone(data).then((res) => {
                        if (res.code === '1') {
                            const data = res.data;
                            if (!data || (!data.clue && !data.inquiry)) {
                                if (type) {
                                    this.$Message.success(this.$t('clue.no_repeat'));
                                }
                                resolve(false);
                            } else {
                                if (data.clue && data.clue.length) {
                                    this.repeatData.cluePhone = data.clue;
                                }
                                if (data.inquiry && data.inquiry.length) {
                                    this.repeatData.contactPhone = data.inquiry;
                                }
                                if (type) {
                                    this.enterFlag = 'self-test';
                                    this.isEmailRepeat = true;
                                }
                                resolve(true);
                            }
                        }
                    });
                });
            },
            /** WhatsApp查重  */
            verifyWA(value, type) {
                if (!value) {
                    return;
                }
                if (type) {
                    this.repeatData = {};
                }
                this.repeatData.clueWA = null;
                this.repeatData.contactWA = null;
                return new Promise((resolve, reject) => {
                    crmClue.getSameListByWhatsapp({
                        orgId: this.enterpriseId,
                        whatsapp: value,
                        excludeId: this.detailInfo.id
                    }).then((res) => {
                        if (res.code === '1') {
                            const data = res.data;
                            // 如果没有list的话，说明没有重复电话
                            if (!data || (!data.clue && !data.inquiry)) {
                                if (type) {
                                    this.$Message.success(this.$t('clue.no_repeat'));
                                }
                                resolve(false);
                            } else {
                                if (data.clue && data.clue.length) {
                                    this.repeatData.clueWA = data.clue;
                                }
                                if (data.inquiry && data.inquiry.length) {
                                    this.repeatData.contactWA = data.inquiry;
                                }
                                if (type) {
                                    this.enterFlag = 'self-test';
                                    this.isEmailRepeat = true;
                                }
                                resolve(true);
                            }
                        } else {
                            resolve(false);
                        }
                    });
                });
            },

            // 编辑线索 -- 接口
            updateXS() {
                delete this.detailInfo.createTime;
                delete this.detailInfo.editTime;
                const jsonData = Object.assign(this.detailInfo, {
                    userId: this.userId
                });

                this.fieldsList.filter(item => item.type === 'selectMultiple').forEach(field => {
                    const temp = Array.isArray(jsonData[field.key]) ? JSON.stringify(jsonData[field.key]) : JSON.stringify([]);
                    jsonData[field.key] = temp;
                });
                jsonData.userName = this.fullName;
                crmClue.crmEdit(jsonData).then(response => {
                    if (response.code === '1') {
                        // 分发提醒事件
                        this.$emit('invoking', {
                            data: {
                                saleId: this.saleId,
                                createUserId: this.createUserId,
                                serviceId: this.serviceId
                            },
                            id: this.clueId,
                            effectActionType: 2
                        });
                        this.$Message.success(this.$t('clue.edit_success'));
                        this.$emit('update:flag_update_detail', !this.flag_update_detail);
                        this.$emit('update:visible', false);
                    } else if (response.code === '0' && response.data === -7) {
                        // 该邮箱为企业同事邮箱，不可录入
                        this.$Message.error(this.$t('crm.Modal.error_enterpriseColleagueMail'));
                    } else {
                        this.$Message.error(this.$t('clue.edit_failed'));
                    }
                    this.cancelEnter();
                }).catch(error => {
                    console.log(error);
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error(this.$t('clue.edit_failed'));
                    }
                    this.cancelEnter();
                });
            },

            /* 保存 */
            async confirmSaveChange() {
                this.loading = true;
                let ret = ''; // 邮箱查重结果
                let phoneRepeat = ''; // 电话查重结果
                let WARepeat = ''; // 电话查重结果

                // 遍历数据检测是否有未填写的必填选项
                this.fieldsList.forEach((item, index) => {
                    this.valideClueEnter(item, index);
                });

                // 校验社交平台信息是否填完整
                if (this.socialNetworkingPlatform && this.socialNetworkingPlatform.length && (this.socialPlatformsFlag() === '1' || this.socialPlatformsFlag() === '2')) {
                    const str = this.socialPlatformsFlag() === '2' ? '社交平台分类不能为空' : '社交平台内容不能为空';
                    this.$Message.error(str);
                    this.loading = false;
                    return;
                }
                // 国家地区字段格式不符校验
                if (this.error_countryArea) {
                    this.$Message.error(this.$t('crm.Modal.error_countryAreaFormat'));
                    this.loading = false;
                    return;
                }
                let isNeed = false;
                this.fieldsList.forEach(item => {
                    if (item.isNeed === 1 && item.isEmpty) {
                        this.$Message.error(`[${item.name}] ${this.$t('enterClue.requireEmptyTip')}`);
                        this.loading = false;
                        isNeed = true;
                        return false;
                    }
                });
                if (isNeed) return false;

                // 遍历数据检测是否有超长数据
                const isExtraLongArr = [];
                for (const key in this.detailInfo) {
                    this.fieldsList.forEach((item, index) => {
                        if (key === item.key && (this.detailInfo[key] && this.detailInfo[key].length > item.upperLimitLength)) {
                            isExtraLongArr.push(key);
                        };
                    });
                }
                this.fieldsList.forEach(item => {
                    if (item.key === 'a10013') {
                        if (JSON.stringify(this.socialNetworkingPlatform).length > item.upperLimitLength) {
                            isExtraLongArr.push('a10013');
                        }
                    }
                });
                if (isExtraLongArr.length) {
                    this.loading = false;
                    return false;
                };
                const whatsAppReg = Utils.regExp.whatsApp;
                for (const item of this.fieldsList) {
                    if (item.key === 'a10010' && this.detailInfo[item.key]) {
                        this.detailInfo[item.key] = this.detailInfo[item.key].trim();
                        const szReg = Utils.regExp.fullEmail;
                        if (!szReg.test(this.detailInfo[item.key])) {
                            this.$Message.error(this.$t('portal_set.format_wrong'));
                            this.loading = false;
                            return false;
                        }
                        if (this.detailInfo[item.key] !== this.oldEmail) {
                            // 校验该企业是否需要邮箱查重
                            if (this.email_duplicate_check) {
                                ret = await this.verifyEmail(this.detailInfo[item.key], false);
                            }
                        }
                    }
                    // 处理whatsApp字段 && 处理whatsApp字段中的空格
                    if (item.key === 'a10052' && this.detailInfo[item.key]) {
                        this.detailInfo[item.key] = this.detailInfo[item.key].replace(/( )|(　)/g, '');
                        if (!whatsAppReg.test(this.detailInfo[item.key].replace(/\s/g, ''))) {
                            this.$Message.error(this.$t('enterClue.whatsAppFormErro'));
                            this.loading = false;
                            return false;
                        }
                        WARepeat = await this.verifyWA(this.detailInfo[item.key], false);
                    }
                    // 处理phone字段 && 处理phone字段中的空格
                    if (item.key === 'a10012' && this.detailInfo[item.key]) {
                        this.detailInfo[item.key] = this.detailInfo[item.key].replace(/( )|(　)/g, '');
                        if (this.detailInfo[item.key] !== this.oldPhone) {
                            phoneRepeat = await this.verifyPhone(this.detailInfo[item.key], false);
                        }
                    }
                    // 处理社交平台字段问题
                    if (item.key === 'a10013') {
                        this.detailInfo[item.key] = JSON.stringify(this.platFormFlag);
                    } else if (item.type !== 'selectMultiple') {
                        this.detailInfo[item.key] = this.detailInfo[item.key] ? this.detailInfo[item.key].trim() : this.detailInfo[item.key];
                    }
                }
                if (ret || phoneRepeat || WARepeat) {
                    this.enterFlag = 'saveClue';
                    this.checkRepeatModalTitle = this.$t('clue.emailOrPhoneRepeat');
                    this.isEmailRepeat = true;
                    return false;
                }
                this.updateXS();
            },
            cancelEnter() {
                this.loading = false;
                this.isEmailRepeat = false;
            },
            // 校验社交平台字段是否有未填项
            socialPlatformsFlag() {
                for (let i = 0; i < this.socialNetworkingPlatform.length; i++) {
                    const item = this.socialNetworkingPlatform[i];
                    item.account = item.account.trim();
                    if (item.type !== '' && item.account === '') {
                        return '1';
                    } else if (item.type === '' && item.account !== '') {
                        return '2';
                    }
                }
            }
        },
        watch: {
            // 监视visible的显示与隐藏，调接口获取数据
            visible: {
                handler(val) {
                    if (val) {
                        this.getClueDetail();
                    } else {
                        // 清空数据
                        this.detailInfo = {};
                        this.socialNetworkingPlatform = [
                            {
                                type: '',
                                account: ''
                            }
                        ];
                    }
                },
                immediate: true
            },
            'detailInfo.a10052': {
                handler(val) {
                    if (val) {
                        this.$set(this.detailInfo, 'a10052', this.detailInfo.a10052.replace(/[^ `\-=[\];'\\,./~!@#$%^&*()_+{}:"|<>?！￥…（）—\d]/g, '').trim());
                    }
                }
            }
        }
    };
</script>

<style lang="less">
    .edit-clue-modal {
        .validate-input {
            display: block;
            color: #EA4335;
            font-size: 12px;
            position: relative;
            line-height: 20px;
            height: 0px;
            top: 0;
        }
        .validate-plateform {
            word-break: break-all;
            width: 240px;
            display: block;
            color: #EA4335;
            font-size: 12px;
            position: relative;
            line-height: 20px;
            height: 19px;
            top: 0;
        }

    }
</style>

<style scoped lang="less">
    .enter-clue-form {
        .el-form-item {
            margin-bottom:17px;
        }
        .el-form-item__label {
            padding: 0 25px 0 0 !important;
        }
    }
    .clue-label {
        width: 120px;
        display: inline-block;
        margin-right: 20px;
        text-align: right;
    }

    .clue-item {
        display: inline-block;
    }

    .check-repeat-btn {
        line-height: 34px;
        cursor: pointer;
        position: absolute;
        color: #b5b5b5;
        top: -9px;
        right: 10px;
        font-size: 20px;
    }
</style>
