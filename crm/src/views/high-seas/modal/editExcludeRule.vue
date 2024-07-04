<!-- 公海设置 - 自动退回规则 - 排除规则 - 新增编辑规则弹框 -->
<template>
    <el-dialog 
        v-model="visible" 
        :title="$t(title)"
        :width="800"
        top="12vh"
        :close-on-click-modal="false"
        append-to-body
        @close="closeDialog"
        class="editExcludeRule"
    >
        <!-- body -->
        <div class="editExcludeRule-body">
            <el-form
                :model="formData"
                :rules="formRules"
                :label-width="145"
                label-position="left"
                ref="formRef"
                class="editExcludeRule-form"
            >
                <!-- 规则名称 -->
                <el-form-item
                    prop="name"
                    :label="$t('highSeas.ruleName')"
                >
                    <el-input
                        v-model="formData.name"
                        show-word-limit
                        maxlength="50"
                        @blur="formData.name = formData.name.trim()"
                    ></el-input>
                </el-form-item>
                <!-- 状态 -->
                <el-form-item :label="$t('status')">
                    <el-switch
                        v-model="formData.enableFlag"
                        width="50"
                        inline-prompt
                        :active-text="$t('enabled')"
                        :inactive-text="$t('bizObject.disable')"
                        :active-value="1"
                        :inactive-value="0"
                    /> 
                </el-form-item>
                <!-- 筛选条件 -->
                <el-form-item
                    :label="$t('filterCondition')"
                >
                    <allPurposeFilter
                        ref="setFilter"
                        :radioType="[1, 2, 3]"
                        :filterData="filterData.conditions"
                        :filterType="filterData.filterType"
                        :expression="filterData.expression"
                        :levelFields="false"
                        fieldsSelectorType="selectUserInfo"
                        :dataSource="dataSource"
                        :fieldsSource="fieldsSource"
                    ></allPurposeFilter>
                </el-form-item>
            </el-form>
        </div>

        <!-- footer -->
        <template #footer>
            <span class="dialog-footer">
                <el-button
                    @click="closeDialog"
                    class="useBrandColor"
                >{{ $t('cancel') }}</el-button>
                <el-button
                    type="primary"
                    @click="submitForm(formRef)"
                >{{ ruleData.id ? $t('save') : $t('confirm') }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { addExcludeRule, updateExcludeRule } from '@/api/highSeas.js';
import { findListViewFilterFields, findListViewFilterFieldsRange } from '@/api/common';
import { handleFilterData } from '@/utils/dataProcess.js';
import allPurposeFilter from '@/components/allPurposeFilter.vue';

// inject
const currentSettingRow = inject('currentSettingRow');
// model
const visible = defineModel('visible');
// props
const props = defineProps({
    ruleData: {
        type: Object,
        default: () => ({})
    }
});
// emits
const emit = defineEmits(['updateListData']);

// 全局
// 多语言
const { t } = useI18n();

// title
const title = computed(() => props.ruleData.id ? 'highSeas.editExcludeRule' : 'highSeas.addExcludeRule');

// form
// 表单 ref
const formRef = ref(null);
// 表单数据
const formData = ref({
    name: '',
    enableFlag: 0
});
// 表单校验规则
const formRules = {
    name: [
        { required: true, message: t('validationRule.errorTip1'), trigger: 'blur' }
    ]
};

// 筛选组件 ref
const setFilter = ref();
// 筛选条件数据
const filterData = ref({});
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

// footer
// 关闭弹窗
const closeDialog = () => {
    visible.value = false;
};
// 提交表单
const submitForm = async (formEl) => {
    if (!formEl) return;

    await formEl.validate(async (valid) => {
        // 表单校验
        if (!valid) {
            return;
        }

        // 取筛选组件数据 + 校验
        const filterParams = handleFilterData(setFilter.value.getOriginalData());
        if (!filterParams) {
            return;
        }

        // 数据拼装
        const postData = {
            id: props.ruleData.id,
            name: formData.value.name.trim(),
            enableFlag: formData.value.enableFlag,
            objectApiKey: currentSettingRow.value.apiKey,
            returnCondition: JSON.stringify(filterParams)
        };
        // 接口请求
        const res = await (postData.id ? updateExcludeRule : addExcludeRule)(postData);
        // 返回结果处理
        if (res.code === 10000) {
            emit('updateListData');
            ElMessage.success(res.messageShow);
            closeDialog();
        } else {
            ElMessage.error(res.messageShow);
        }
    });
};

// 初始化请求
// 编辑规则时
if (props.ruleData.id) {
    formData.value.name = props.ruleData.name;
    formData.value.enableFlag = props.ruleData.enableFlag;
    filterData.value = props.ruleData.returnCondition || {};
}
</script>

<style lang="scss" scoped>
.editExcludeRule {
    &-body {
        overflow-y: auto;
        margin: 0 -12px;
    }

    &-form {
        padding: 0 12px;
        height: 100%;
        max-height: 500px;
    }
}
</style>