<!-- 公海设置 - 自动退回规则 - 退回规则条目 -->
<template>
    <div
        v-loading="loading"
        class="returnRule"
    >
        <!-- body -->
        <div class="returnRule-body">
            <!-- tips -->
            <div class="returnRule-tips">{{ $t('highSeas.returnRuleTips', { objName: $t(`bizObject.${currentSettingRow.apiKey}`) }) }}</div>

            <!-- form -->
            <el-form
                :model="formData"
                :rules="formRules"
                label-position="left"
                label-width="100px"
                class="high_seas_rule_form"
                ref="formRef"
            >
                <!-- 规则名称 -->
                <el-form-item
                    prop="name"
                    :label="$t('highSeas.ruleName')"
                >
                    <el-input
                        v-model="formData.name"
                        :disabled="!editing"
                        clearable
                        maxlength="100"
                        :placeholder="$t('placeholder')"
                        style="width:500px;"
                    ></el-input>
                </el-form-item>
                <!-- 启用状态 -->
                <el-form-item
                    :label="$t('highSeas.enableStatus')"
                    required
                >
                    <el-switch
                        v-model="formData.enableFlag"
                        :active-value="1"
                        :inactive-value="0"
                        :disabled="!editing"
                    ></el-switch>
                </el-form-item>
                <!-- 规则生效时间 -->
                <el-form-item
                    prop="effectiveTime"
                    :label="$t('highSeas.effectiveTime')"
                >
                    <el-date-picker
                        v-model="formData.effectiveTime"
                        type="date"
                        :disabled="!editing"
                        clearable
                    >
                    </el-date-picker>
                </el-form-item>
                <!-- 生效范围 -->
                <el-form-item
                    :label="$t('highSeas.effectiveObj', { objName: $t(`bizObject.${currentSettingRow.apiKey}`) })"
                    required
                >
                    <div>
                        <!-- radio -->
                        <el-radio-group
                            v-model="formData.allSelectedFlag"
                            :disabled="!editing"
                            @change="changeCientType"
                        >
                            <el-radio :label="1">{{ $t('highSeas.allObj', { objName: $t(`bizObject.${currentSettingRow.apiKey}`) }) }}</el-radio>
                            <el-radio :label="0">{{ $t('highSeas.designatedObj', { objName: $t(`bizObject.${currentSettingRow.apiKey}`) }) }}</el-radio>
                        </el-radio-group>

                        <!-- 筛选条件组件 -->
                        <div v-show="formData.allSelectedFlag === 0">
                            <allPurposeFilter
                                ref="setFilter"
                                :radioType="[1, 2, 3]"
                                :disabled="!editing"
                                :filterData="customerFilterData.conditions"
                                :filterType="customerFilterData.filterType"
                                :expression="customerFilterData.expression"
                                :levelFields="false"
                                fieldsSelectorType="selectUserInfo"
                                :dataSource="dataSource"
                                :fieldsSource="fieldsSource"
                            ></allPurposeFilter>
                        </div>
                    </div>
                </el-form-item>
                <!-- 规则 -->
                <el-form-item
                    :label="$t('highSeas.rule')"
                    required
                >
                    <div class="w-full">
                        <el-table :data="ruleTableData">
                            <!-- 规则 -->
                            <el-table-column
                                prop="ruleDays"
                                :label="$t('highSeas.rule')"
                                :minWidth="375"
                            >
                                <template v-slot="{ row }">
                                    <i18n-t :keypath="row.lang">
                                        <template #count>
                                            <el-input-number
                                                v-model="row.ruleDays"
                                                :disabled="!editing || !row.enableFlag"
                                                :min="1"
                                                :max="9999"
                                                controls-position="right"
                                                style="width: 90px; margin-right: 12px; margin-bottom: 5px"
                                            ></el-input-number>
                                        </template>
                                    </i18n-t>
                                </template>
                            </el-table-column>
                            <!-- 操作 -->
                            <el-table-column
                                prop="operation"
                                :label="$t('operate')"
                                :minWidth="100"
                            >
                                <template v-slot="{ row }">
                                    <el-switch
                                        v-model="row.enableFlag"
                                        :disabled="row.disabled || !editing"
                                        :active-value="1"
                                        :inactive-value="0"
                                    ></el-switch>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </el-form-item>
                <!-- 提醒设置 -->
                <el-form-item
                    :label="$t('highSeas.noticeSet')"
                >
                    <div>
                        <!-- switch -->
                        <el-switch
                            v-model="formData.reminderFlag"
                            :disabled="!editing"
                            :active-value="1"
                            :inactive-value="0"
                            style="margin-right: 26px"
                        ></el-switch>

                        <!-- 天数 -->
                        <i18n-t keypath="highSeas.noticeBeforeDuration">
                            <template #objName>{{ $t(`bizObject.${currentSettingRow.apiKey}`) }}</template>
                            <template #count>
                                <el-input-number
                                    v-model="formData.reminderDaysBefore"
                                    :disabled="!editing"
                                    :min="1"
                                    :max="30"
                                    controls-position="right"
                                    style="width: 90px; margin: 0 12px"
                                ></el-input-number>
                            </template>
                        </i18n-t>
                    </div>
                </el-form-item>
            </el-form>
        </div>

        <!-- footer -->
        <div class="returnRule-footer">
            <!-- 操作中状态 -->
            <div v-if="operateType">
                <!-- 保存 -->
                <el-button
                    type="primary"
                    :loading="loading"
                    @click="handleRuleSave"
                    class="highSeas-ruler-save"
                >{{ $t('save') }}</el-button>
                <!-- 取消 -->
                <el-button
                    @click="handleRuleCancel"
                >{{ $t('cancel') }}</el-button>
            </div>

            <!-- 显示状态 -->
            <div v-else-if="ruleData?.id">
                <!-- 编辑 -->
                <el-button
                    type="primary"
                    @click="handleRuleEdit"
                    class="highSeas-ruler-save"
                >{{ $t('edit') }}</el-button>
                <!-- 复制 -->
                <el-button
                    @click="handleRuleEdit('copy')"
                >{{ $t('copy') }}</el-button>
                <!-- 最后更新时间 -->
                <span style="padding-left: 20px;font-size: 12px;">{{ $t('highSeas.lastUpdateTime')}} {{ updateTime }}</span>
            </div>

            <!-- 右侧, 删除 -->
            <el-button
                v-if="!editing && !operateType"
                type="danger"
                plain
                @click="delectConfirm"
            >{{ $t('delete') }}</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, nextTick, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { timeFormat } from 'xhl_lib/xhl-ui/utils/dataProcess.js';
import { getReturnRuleDetail, addReturnRule, updateReturnRule, delReturnRule } from '@/api/highSeas';
import { findListViewFilterFields, findListViewFilterFieldsRange } from '@/api/common';
import { handleFilterData } from '@/utils/dataProcess.js';
import allPurposeFilter from '@/components/allPurposeFilter.vue';

// inject
const currentSettingRow = inject('currentSettingRow');
// model
// 外部传入的规则数据
const ruleData = defineModel('ruleData', { type: Object, default: () => ({}) });
// props
const props = defineProps({
    // 规则操作状态, 默认空, add 新增, copy 编辑
    operateType: {
        type: String,
        default: ''
    }
});
// emits
const emits = defineEmits(['changeStatus', 'saveSuccess', 'delSuccess']);

// 全局
// 多语言
const { t } = useI18n();
// loading
const loading = ref(false);
// 是否处于编辑状态
const editing = ref(false);

// 数据获取
const refreshData = () => {
    loading.value = true;
    getReturnRuleDetail({
        id: ruleData.value.id
    }).then((res) => {
        if (res.code === 10000) {
            const resData = res.data;
            // 表单数据处理
            formData.value = {
                id: resData.id,
                name: resData.name,
                effectiveTime: resData.effectiveTime,
                enableFlag: resData.enableFlag,
                allSelectedFlag: resData.allSelectedFlag,
                reminderFlag: resData.reminderFlag,
                reminderDaysBefore: resData.reminderDaysBefore
            };
            // 指定客户筛选条件处理
            if (formData.value.allSelectedFlag === 0) {
                customerFilterData.value = resData.searchCondition || {};
            }
            // 规则表数据处理
            ruleTableData.value = JSON.parse(JSON.stringify(initRuleTableData)).map(item => {
                item.ruleDays = resData[item.prop];
                item.enableFlag = resData[`${item.prop}Flag`];
                return item;
            });
            // 最后更新时间处理
            updateTime.value = timeFormat(resData.updateTime, 'DateTime');
            // 编辑中状态置空
            editing.value = false;
            // 更新外部数据
            ruleData.value.name = resData.name;
            ruleData.value.enableFlag = resData.enableFlag;
        } else {
            // 请求失败
            ElMessage.error(t('requestFailed'));
            clearData();
        }
        // 取消 loading
        loading.value = false;
    }).catch((err) => {
        console.error(err);
        loading.value = false;
    });
};
// 数据清理
const clearData = () => {
    formRef.value?.clearValidate();
    formData.value = {
        ...initFormData
    };
    customerFilterData.value = [];
    ruleTableData.value = [];
    updateTime.value = '';
};

// 表单
// 表单 ref
const formRef = ref(null);
// 表单数据
const formData = ref({});
// 表单默认数据
const initFormData = {
    name: '',
    effectiveTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
    enableFlag: 0,
    allSelectedFlag: 1,
    reminderFlag: 0,
    reminderDaysBefore: 7
};
// 表单校验规则
const formRules = {
    name: [{ required: true, message: t('placeholder', { name: t('highSeas.ruleName') }) }],
    effectiveTime: [{ required: true, message: t('placeholder_select', { name: t('highSeas.effectiveTime') }) }]
};
// 更改生效范围类型
const changeCientType = (value) => {
    if (value === '2') {
        customerFilterData.value = {};
    }
};
// 筛选组件 ref
const setFilter = ref();
// 指定客户筛选条件数据
const customerFilterData = ref({});
// 筛选组件用到的 api
const fieldsSource = ref({
    methods: findListViewFilterFields,
    data: {
        objectId: currentSettingRow.value.id
    }
});
const dataSource = ref({
    methods: findListViewFilterFieldsRange,
    data: {
        objectId: currentSettingRow.value.id
    }
});
// 规则列表数据
const ruleTableData = ref([]);
// 列表数据初始值 - 按 apiKey 过滤
const initRuleTableData = [
    { prop: 'unfollowedDaysAfterClaim', lang: 'highSeas.unfollowAfterGet', ruleDays: 14, enableFlag: 1, disabled: true, apiKey: 'customer' }, // '获得后 {count} 天内 未跟进 流入公海'
    { prop: 'unfollowedDaysAfterClaim', lang: 'highSeas.unfollowAfterGet', ruleDays: 14, enableFlag: 1, disabled: true, apiKey: 'lead' }, // '获得后 {count} 天内 未跟进 流入公海'
    { prop: 'unfollowedDaysAfterFollowup', lang: 'highSeas.noContinueFollowAfterGet', ruleDays: 30, enableFlag: 0, disabled: false, apiKey: 'customer' }, // '获得后 {count} 天 未持续跟进 流入公海'
    { prop: 'unfollowedDaysAfterFollowup', lang: 'highSeas.noContinueFollowAfterGet', ruleDays: 14, enableFlag: 0, disabled: false, apiKey: 'lead' }, // '获得后 {count} 天 未持续跟进 流入公海'
    { prop: 'noConversionDaysAfterClaim', lang: 'highSeas.unboundAfterGet', ruleDays: 180, enableFlag: 0, disabled: false, apiKey: 'customer' }, // '获得后 {count} 天 未成交 流入公海'
    { prop: 'noConversionDaysAfterClaim', lang: 'highSeas.noConversionAfterGet', ruleDays: 30, enableFlag: 0, disabled: false, apiKey: 'lead' }, // '获得后 {count} 天 未转化 流入公海'
    { prop: 'unfollowedDaysAfterConversion', lang: 'highSeas.noContinueFollowAfterBound', ruleDays: 30, enableFlag: 0, disabled: false, apiKey: 'customer' }, // '成交后 {count} 天 未持续跟进 流入公海'
    { prop: 'noConversionDaysAfterConversion', lang: 'highSeas.noBoundAgainAfterBound', ruleDays: 365, enableFlag: 0, disabled: false, apiKey: 'customer' } // '成交后 {count} 天 未再次成交 流入公海',
].filter(item => item.apiKey === currentSettingRow.value.apiKey);
// 最后更新时间
const updateTime = ref('');

// footer - 非编辑状态
// 编辑
const handleRuleEdit = (type) => {
    // 标识状态为编辑中
    editing.value = true;
    // 通知父组件, 进行复制/编辑操作
    emits('changeStatus', type || 'edit');
};
// 删除
const delectConfirm = () => {
    ElMessageBox.confirm(
        t('highSeas.delHighSeasRulesTip'),
        t('deleteConfirm'),
        {
            confirmButtonText: t('confirm'),
            cancelButtonText: t('cancel'),
            type: 'warning'
        }
    )
        .then(() => {
            delRule();
        })
        .catch(() => {});
};
// 删除规则
const delRule = () => {
    const postData = {
        id: ruleData.value.id
    };
    delReturnRule(postData).then((res) => {
        if (res.code === 10000) {
            ElMessage.success(t('dataDeleted'));

            // 通知父组件, 删除规则成功
            emits('delSuccess', postData);
        } else {
            ElMessage.error(res.message);
        }
    });
};

// footer - 编辑状态
// 保存
const handleRuleSave = () => {
    formRef.value.validate((valid) => {
        // 表单校验失败, return
        if (!valid) {
            return;
        }

        // 取通用筛选组件数据 + 校验
        let filterParams;
        if (formData.value.allSelectedFlag === 0) {
            // 取筛选组件数据 + 校验
            filterParams = handleFilterData(setFilter.value.getOriginalData());
            if (!filterParams) {
                return;
            }
        }

        // 组装发送数据
        const postData = {
            objectApiKey: currentSettingRow.value.apiKey,
            id: formData.value.id,
            name: formData.value.name,
            enableFlag: formData.value.enableFlag,
            effectiveTime: new Date(new Date(formData.value.effectiveTime).toLocaleDateString()).getTime(),
            reminderFlag: formData.value.reminderFlag,
            reminderDaysBefore: formData.value.reminderDaysBefore,
            allSelectedFlag: formData.value.allSelectedFlag,
            selectCondition: formData.value.allSelectedFlag === 1 ? undefined : JSON.stringify(filterParams)
        };
        ruleTableData.value.forEach(item => {
            postData[item.prop] = item.ruleDays;
            postData[`${item.prop}Flag`] = item.enableFlag;
        });

        // 发送请求
        loading.value = true;
        (ruleData.value.id === 'add' ? addReturnRule : updateReturnRule)(postData)
            .then((res) => {
                if (res.code === 10000) {
                    // 退出编辑状态
                    editing.value = false;
                    // 通知父组件
                    emits('saveSuccess', Object.assign(postData, { id: res.data }));
                    // 弹出提示
                    ElMessage.success(t('saveSuccess'));
                } else {
                    ElMessage.error(res.message);
                }
                loading.value = false;
            })
            .catch((e) => {
                console.error(e);
                ElMessage.error(t('saveFailed'));
                loading.value = false;
            });
    });
};
// 取消
const handleRuleCancel = async () => {
    // 通知父组件已取消编辑
    emits('changeStatus', '');
    await nextTick();
    // 数据刷新
    if (ruleData.value.id && ruleData.value.id !== 'add') {
        refreshData();
    }
};

// 监听 id 变化
watch(
    () => ruleData.value.id,
    (val) => {
        if (val) {
            if (val === 'add') {
                // 新增

                if (ruleData.value.copyRuleId) {
                    // 复制模式

                    // 原数据都不变, 直接置空表单数据 id
                    formData.value.id = undefined;
                } else {
                    // 新增模式

                    // 清除旧数据
                    clearData();
                    // 初始化表单数据
                    formData.value = JSON.parse(JSON.stringify(initFormData));
                    ruleTableData.value = JSON.parse(JSON.stringify(initRuleTableData));
                }
                editing.value = true;
            } else {
                // 显示

                // 获取数据
                refreshData();
            }
        } else {
            // 清除旧数据
            clearData();
        }
    },
    { immediate: true }
);
</script>

<style lang="scss" scoped>
.returnRule {
    position: relative;
    height: 100%;
    padding: 0 20px 40px;

    &-body {
        overflow: auto;
        height: 100%;
        position: relative;
    }

    &-tips {
        font-size: 12px;
        line-height: 18px;
        margin: 12px 0;
        color: #909299;
        white-space: pre;
    }

    .high_seas_rule_form {
        :deep {
            .#{$elnamespace}-form-item__label {
                color: rgba(0, 0, 0, 0.8);
            }

            .#{$elnamespace}-form-item {
                margin-bottom: 24px;
            }
        }
    }

    :deep {
        th {
            line-height: 34px;
            background: #f6f6f6;
            color: #333333;
        }

        td {
            padding: 5px 0 0px;

            .cell {
                overflow: auto;
            }
        }

        .#{$elnamespace}-switch {
            vertical-align: middle;
        }
    }

    &-footer {
        position: absolute;
        bottom: 0;
        left: 20px;
        right: 24px;
        background: #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}
</style>
