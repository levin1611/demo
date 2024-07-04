<template>
    <div>
        <Modal :visible="visible"
               :title="$t('crm.Modal.batchEditTitle')"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               @close="cancel"
               v-loading="loading"
               class="modal batch-edit-model">
            <div class="batch-edit-form">
                <div class="batch-edit-form-list">
                    <label>{{ type === 'customer' ? $t('crm.Modal.batchEditLabel1') : $t('crm.Modal.batchEditLabel1_1')}} </label>
                    <span>{{ids.length}}{{ ids.length > 1 ? $t("crm.Table.item_customers") : $t("crm.Table.item_customer") }}</span>
                </div>
                <div class="batch-edit-form-list">
                    <label>{{ $t('crm.Modal.batchEditLabel2') }} </label>
                    <div class="form-input">
                        <Select
                            v-model="storageName"
                            filterable
                            clearable
                            @change="handleStorageName"
                            :placeholder="$t('crm.Modal.tip_select')"
                        >
                            <Option
                                    v-for="item in fieldList"
                                    :value="item.storageName"
                                    :label="(lang === 'en-US' && item.ename) ? item.ename : item.cname"
                                    :key="item.storageName"
                            ></Option>
                        </Select>
                    </div>
                </div>
                <div class="batch-edit-form-list">
                    <label>{{ $t('crm.Modal.batchEditLabel3') }} </label>
                    <div class="form-input">
                        <template v-if="!storageName || !checkedItem || (checkedItem.colType === 'text' && checkedItem.storageName !== 'countryArea')">
                            <ElInputExtend
                                v-model="storageNameValue"
                                :disabled="!storageName"
                                :maxlength="(checkedItem && checkedItem.colMaxLength) ? checkedItem.colMaxLength: 50"
                                :showWordLimit="true"
                                :errorMessage="$t('enterClue.upperLimitTip')"
                                :showErrorMsg="true"
                            ></ElInputExtend>
                        </template>
                        <template v-else-if="checkedItem.storageName === 'countryArea'">
                            <CountryAreaSelect
                                :isVisible="false"
                                :disabled="false"
                                :countryAreaName.sync="countryAreaName"
                                :countryArea.sync="storageNameValue"
                                :placeholder="checkedItem.colDefaultValue"
                            ></CountryAreaSelect>
                        </template>
                        <template v-else-if="checkedItem.colType === 'starLevel'">
                            <Select
                                v-model="storageNameValue"
                                filterable
                                clearable
                                :placeholder="checkedItem.colDefaultValue || $t('crm.Modal.tip_select')"
                            >
                                <Option
                                        v-for="i in 5"
                                        :value="i"
                                        :label="i+'星'"
                                        :key="i"
                                ></Option>
                            </Select>
                        </template>
                        <template v-else-if="checkedItem.colType === 'textarea'">
                            <ElInputExtend
                                v-model="storageNameValue"
                                type="textarea"
                                :rows="3"
                                :placeholder="checkedItem.colDefaultValue"
                                :maxlength="checkedItem.colMaxLength || 4000"
                                :showWordLimit="true"
                                :errorMessage="$t('enterClue.upperLimitTip')"
                                :showErrorMsg="true"
                            ></ElInputExtend>
                        </template>
                        <template v-else-if="checkedItem.colType === 'select'">
                            <!-- 默认字段 -->
                            <template v-if="checkedItem.type === 1">
                                <Select
                                    v-model="storageNameValue"
                                    filterable
                                    :key="checkedItem.storageName"
                                    :placeholder="checkedItem.colDefaultValue || $t('crm.Modal.tip_select')"
                                >
                                    <Option
                                        v-for="i in computed_selectOptions[checkedItem.storageName]"
                                        :value="i.attrName"
                                        :label="i.attrName"
                                        :key="i.attrName+`${$dym.Rnum()}`"
                                    ></Option>
                                </Select>
                            </template>
                            <!-- 自定义字段 -->
                            <template v-else>
                                <Select
                                    v-model="storageNameValue"
                                    filterable
                                    :key="checkedItem.storageName"
                                    :placeholder="checkedItem.colDefaultValue || $t('crm.Modal.tip_select')"
                                >
                                    <Option
                                        v-for="i in checkedItem.specialField.split('?')"
                                        :value="i"
                                        :label="i"
                                            :key="i+`${$dym.Rnum()}`"
                                    ></Option>
                                </Select>
                            </template>
                        </template>

                        <template v-else-if="checkedItem.colType === 'selectMultiple'">
                            <!-- 默认字段 -->
                            <template v-if="checkedItem.type === 1">
                                <Select
                                    v-model="storageNameValue"
                                    filterable
                                    multiple
                                    :key="checkedItem.storageName"
                                    :placeholder="checkedItem.colDefaultValue || $t('crm.Modal.tip_select')"
                                >
                                    <Option
                                        v-for="i in computed_selectOptions[checkedItem.storageName]"
                                        :value="i.attrName"
                                        :label="i.attrName"
                                        :key="i.attrName+`${$dym.Rnum()}`"
                                    ></Option>
                                </Select>
                            </template>
                            <!-- 自定义字段 -->
                             <template v-else>
                                <Select ref="selectMultiple"
                                    v-model="storageNameValue"
                                    filterable
                                    multiple
                                    :key="checkedItem.storageName"
                                    :placeholder="checkedItem.colDefaultValue || $t('crm.Modal.tip_select')"
                                >
                                <Option
                                        v-for="i in checkedItem.specialField.split('?')"
                                        :value="i"
                                        :label="i"
                                        :key="i+`${$dym.Rnum()}`"
                                    ></Option>
                                </Select>
                            </template>

                        </template>
                        <template v-else-if="checkedItem.colType === 'date+time'">
                            <DatePicker
                                v-model="storageNameValue"
                                size="small"
                                type="datetime"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                :editable="false"
                                :placeholder="checkedItem.colDefaultValue || $t('crm.Table.tip_selectTime')"
                            ></DatePicker>
                        </template>
                        <template v-else-if="checkedItem.colType === 'date'">
                            <DatePicker
                                v-model="storageNameValue"
                                type="date"
                                size="small"
                                value-format="yyyy-MM-dd"
                                :editable="false"
                                :placeholder="checkedItem.colDefaultValue || $t('crm.Modal.tip_selectDate')"
                            ></DatePicker>
                        </template>
                    </div>
                </div>
            </div>

            <div slot="footer">
                <!-- 取消 -->
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <!-- 确定 -->
                <Button type="primary"
                        :loading="sumbitLoading"
                        :disabled="!storageName || !storageNameValue"
                        @click="handleSumbit"
                        class="piwik_batchTransferCompany">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmCompany, crmInquiry } from '@/api/crm/index';

    export default {
        name: 'batchEdit',
        props: [
            'type',
            'visible',
            'ids'
        ],
        data() {
            return {
                langObj: {
                    // 客户默认字段
                    companyName: this.$t('crm.Modal.corp_companyName'),
                    starLevel: this.$t('crm.Modal.corp_starLevel'),
                    shortName: this.$t('crm.Modal.corp_shortName'),
                    countryArea: this.$t('crm.Modal.corp_countryArea'),
                    mainProduct: this.$t('crm.Modal.corp_mainProduct'),
                    scale: this.$t('crm.Modal.corp_scale'),
                    clientType: this.$t('crm.Modal.corp_clientType'),
                    companyRemark: this.$t('crm.Modal.corp_companyRemark'),
                    // 询盘默认字段
                    productCategory: this.$t('crm.Modal.inq_productCategory'),
                    demandProducts: this.$t('crm.Modal.inq_demandProducts'),
                    remark: this.$t('crm.Modal.inq_remark'),
                    label: this.$t('crm.Modal.inq_label'),
                    sourceChannel: this.$t('crm.Modal.inq_sourceChannel'),
                    sourceWay: this.$t('crm.Modal.inq_sourceWay'),
                    grouping: this.$t('crm.Modal.inq_grouping')
                },
                storageName: '', // 选中要修改的字段
                checkedItem: null, // 选中要修改的字段对象
                storageNameValue: null, // 要修改的字段值
                countryAreaName: '', // 国家地区的名称
                fieldList: [], // 有权限的表单字段
                loading: true,
                sumbitLoading: false // 提交后按钮loading防止多次提交
            };
        },
        computed: {
            // 从 vuex 中获取属性
            ...mapState({
                userId: 'userId',
                enterpriseId: 'enterpriseId',
                userName: 'userName',
                fullName: 'fullName',
                lang: state => state.app.lang,
                selectOptions: state => state.crm.selectOptions
            }),
            // 获取使用中(未停用)的通用设置下拉选项
            computed_selectOptions() {
                const result = {};
                Object.entries(this.$deepClone(this.selectOptions)).forEach(([key, value]) => {
                    result[key] = value.filter(item => item.isAvailable === 1);
                });
                result.companySourceWay = result.sourceWay;
                result.label = result.tag;
                return result;
            }
        },
        methods: {
            // 重置data
            resetData() {
                this.storageName = '';
                this.checkedItem = null;
                this.countryAreaName = '';
                this.storageNameValue = null;
                this.fieldList = [];
            },
            // 切换更新的字段
            handleStorageName(val) {
                this.storageNameValue = null;
                this.countryAreaName = '';
                if (val) {
                    this.checkedItem = this.fieldList.find(item => item.storageName === val);
                } else {
                    this.checkedItem = null;
                }
            },
            // 获取字段列表
            getFeildList() {
                this.loading = true;
                if (this.type === 'customer') {
                    crmCompany.getBatchUpdateFields({
                        orgId: this.enterpriseId,
                        userId: this.userId
                    }).then(res => {
                        this.loading = false;
                        if (res.code === '1') {
                            this.fieldList = res.data;
                        }
                    });
                }
                if (this.type === 'inquiry') {
                    crmCompany.getBatchUpdateFields({
                        orgId: this.enterpriseId,
                        userId: this.userId
                    }).then(res => {
                        this.loading = false;
                        if (res.code === '1') {
                            this.fieldList = res.data;
                        }
                    });
                }
            },
            // 保存
            handleSumbit() {
                const storageNameValue = this.checkedItem.colType === 'selectMultiple' ? this.storageNameValue.join(',') : this.storageNameValue;
                const name = Object.prototype.hasOwnProperty.call(this.langObj, this.storageName) ? this.langObj[this.storageName] : this.checkedItem.cname;
                // 长度校验
                if (storageNameValue.length > this.checkedItem.colMaxLength) {
                    this.$Message.error(`【${name}】 ${this.$t('crm.fieldLimit.error_overLength')}`);
                    return;
                }
                // 防止多次提交，将按钮置成loading状
                this.sumbitLoading = true;
                if (this.type === 'customer') {
                    crmCompany.batchUpdate({
                        orgId: Number(this.enterpriseId),
                        companyIds: this.ids.join(','),
                        colType: this.checkedItem.colType,
                        name: name,
                        storageName: this.storageName,
                        value: storageNameValue,
                        countryAreaName: this.countryAreaName,
                        updateUserId: Number(this.userId),
                        updateUser: this.fullName
                    }).then(response => {
                        this.sumbitLoading = false;
                        if (response.code === '1') {
                            this.$Message.success(this.$t('editSuccess'));
                            this.$emit('refreshData', { clearSelected: true });
                            this.cancel();
                        } else if (response.code === '-6') {
                            this.$Message.error(response.message + this.$t('highSeasSetting.inquriry.overCustomerLimit'));
                        } else {
                            this.$Message.error(this.$t('editFail'));
                        }
                    }, error => {
                        this.sumbitLoading = false;
                    }).catch(error => {
                        this.sumbitLoading = false;
                    });
                }
            },
            // 取消
            cancel() {
                this.resetData();
                this.$emit('update:visible', false);
            }
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        this.getFeildList();
                    }
                },
                immediate: true
            }
        }
    };
</script>
<style lang="less">
    .batch-edit-model {
        .el-dialog{
            width: 35%;
        }
        .batch-edit-form {
            width: 90%;
            margin: 0 auto;
            .batch-edit-form-list{
                display: flex;
                justify-content: flex-start;
                margin-bottom: 15px;
                align-items: center;
                label{
                    width: 130px;
                    line-height: 16px;
                    margin-right: 5px;
                }
                .form-input{
                    width: calc(100% - 135px);
                }
            }
        }
    }
</style>
