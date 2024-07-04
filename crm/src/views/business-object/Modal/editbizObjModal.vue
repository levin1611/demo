<template>
    <el-dialog
        v-model="dialogVisible"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        width="660"
        class="edit-business-objects"
    >
        <template #header>
            <div class="edit-title">
                {{ $t('bizObject.editBusinessObjects') }}
            </div>
        </template>
        <el-form
            ref="ruleFormRef"
            label-position="left"
            :model="currentEditRowCopy"
            :rules="rules"
            label-width="120px"
            class="edit-business-objects-form"
        >
            <el-form-item :label="$t('bizObject.businessObjectName')" prop="displayName">
                <el-input v-model="currentEditRowCopy.displayName" maxlength="50" show-word-limit :disabled="disabled" />
            </el-form-item>
            <el-form-item :label="$t('bizObject.programIdentificationName')" prop="apiKey">
                <el-input v-model="currentEditRowCopy.apiKey" maxlength="100" show-word-limit :disabled="disabled" />
            </el-form-item>
            <el-form-item :label="$t('bizObject.describe')" prop="description">
                <el-input v-model="currentEditRowCopy.description" type="textarea" maxlength="400" show-word-limit rows="4" placeholder="请输入客户描述" />
            </el-form-item>
            <el-form-item :label="$t('bizObject.enableFeatures')" prop="type" class="check-box-container">
                <el-checkbox-group v-model="currentEditRowCopy.type" class="enable-features">
                    <template v-for="item in enableFeaturesList" :key="item.name">
                        <el-checkbox
                            v-if="currentEditRowCopy.enableFeaturesList[item.fieldName] !== 3"
                            :label="item.id"
                            name="type"
                            :value="item.fieldName"
                            @change="checkBoxChange($event, item.fieldName)"
                            :disabled="disabled || currentEditRowCopy.enableFeaturesList[item.fieldName] === 2"
                        >
                            {{ item.name }}
                        </el-checkbox>
                    </template>
                </el-checkbox-group>
            </el-form-item>
        </el-form>

        <template #footer>
            <span>
                <el-button class="useBrandColor" @click="dialogVisible = false">{{ $t('cancel') }}</el-button>
                <el-button type="primary" :loading="saveLoading" @click="saveObj">
                    {{ $t('save') }}
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, toRefs, reactive, watch } from 'vue';
import { editObj } from '@/api/businessObjects.js'; // 角色相关api请求
import { CODESTATE } from '@/https/codeConfig';
// 获取全局 scss 变量, 以获取 element-plus 的命名空间
import CSSVariables from '@/style/js.module.scss';
import { useUserStore } from '@/pinia/modules/user.js';
import { useI18n } from 'vue-i18n';

// 多语言
const { t } = useI18n();
// 取 pinia 数据
const store = useUserStore();
const { elnamespace } = CSSVariables;

// 定义props
const props = defineProps({
    // 表单禁用状态
    disabled: {
        type: Boolean,
        default: false
    },
    // 当前编辑的业务对象
    currentEditBizObj: {
        type: Object,
        default: () => ({})
    }
});
// 定义 emit
const emits = defineEmits(['refreshData']);

// 使用toRefs将props转换为响应式对象
const { disabled, currentEditBizObj } = toRefs(props);

// 声明一个双向绑定 prop
const dialogVisible = defineModel('dialogVisible');

// 启用功能列表
const enableFeaturesList = [
    {
        id: 'objTypeFlag',
        fieldName: 'objTypeFlag',
        name: t('bizObject.businessObjectType')
    },
    {
        id: 'verificationRuleFlag',
        fieldName: 'verificationRuleFlag',
        name: t('bizObject.VerificationRules')
    },
    {
        id: 'duplicateRuleFlag',
        fieldName: 'duplicateRuleFlag',
        name: t('bizObject.ruleOfThumb')
    },
    {
        id: 'memberShareFlag',
        fieldName: 'memberShareFlag',
        name: t('bizObject.collaborator') // 后端是成员之间共享
    },
    {
        id: 'operateLogFlag',
        fieldName: 'operateLogFlag',
        name: t('bizObject.operationLog')
    },
    {
        id: 'timelineFlag',
        fieldName: 'timelineFlag',
        name: t('bizObject.timeline')
    },
    {
        id: 'followUpRecordFlag',
        fieldName: 'followUpRecordFlag',
        name: t('bizObject.followTheRecord')
    },
    {
        id: 'scheduleFlag',
        fieldName: 'scheduleFlag',
        name: t('bizObject.task')// 后端是标记的查看日程
    },
    {
        id: 'documentFlag',
        fieldName: 'documentFlag',
        name: t('bizObject.document')
    }
];

// checkbox change事件
const checkBoxChange = (val, fieldName) => {
    currentEditRowCopy.value.enableFeaturesList[fieldName] = val ? 1 : 0;
};

// 表单验证规则
const rules = reactive({
    displayName: [
        { required: true, message: t('bizObject.businessObjectNameRequired'), trigger: 'blur' }
    ],
    apiKey: [
        { required: true, message: t('bizObject.programIdentificationNameRequired'), trigger: 'blur' }
    ]
});

// 表单ref
const ruleFormRef = ref(null);
// 清除全部校验效果
const resetForm = () => {
    if (!ruleFormRef.value) return;
    ruleFormRef.value.clearValidate();
};

// 按钮加个 loading, 防止重复提交
const saveLoading = ref(false);

// 修改业务对象
const saveObj = () => {
    saveLoading.value = true;
    editObj({
        id: currentEditBizObj.value.id,
        orgId: store.orgId,
        userId: store.userId,
        displayName: currentEditRowCopy.value.displayName,
        description: currentEditRowCopy.value.description,
        apiKey: currentEditRowCopy.value.apiKey,
        documentFlag: currentEditRowCopy.value.enableFeaturesList.documentFlag,
        duplicateRuleFlag: currentEditRowCopy.value.enableFeaturesList.duplicateRuleFlag,
        followUpRecordFlag: currentEditRowCopy.value.enableFeaturesList.followUpRecordFlag,
        memberShareFlag: currentEditRowCopy.value.enableFeaturesList.memberShareFlag,
        objTypeFlag: currentEditRowCopy.value.enableFeaturesList.objTypeFlag,
        operateLogFlag: currentEditRowCopy.value.enableFeaturesList.operateLogFlag,
        scheduleFlag: currentEditRowCopy.value.enableFeaturesList.scheduleFlag,
        timelineFlag: currentEditRowCopy.value.enableFeaturesList.timelineFlag,
        verificationRuleFlag: currentEditRowCopy.value.enableFeaturesList.verificationRuleFlag,
        deletedFlag: currentEditBizObj.value.deletedFlag,
        predefinedFlag: currentEditBizObj.value.predefinedFlag, // 系统预设字段: 1, 自定义字段: 0
        objectId: currentEditBizObj.value.id
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            ElMessage.success(res.messageShow);
            // emit 父组件, 修改父组件的数据
            emits('refreshData');
        } else {
            ElMessage.error(res.messageShow);
        }
        // 关闭弹窗
        dialogVisible.value = false;
        // 取消 loading
        saveLoading.value = false;
    }).catch(err => {
        console.error(err);
        ElMessage.error(err.messageShow);
    });
};

const currentEditRowCopy = ref({});
watch(dialogVisible, (val) => {
    if (!val) {
        resetForm();
    } else {
        // 启用功能列表
        const featuresList = [
            'objTypeFlag',
            'verificationRuleFlag',
            'duplicateRuleFlag',
            'memberShareFlag',
            'operateLogFlag',
            'timelineFlag',
            'followUpRecordFlag',
            'scheduleFlag',
            'documentFlag'
        ];

        currentEditRowCopy.value = {
            ...currentEditBizObj.value,
            enableFeaturesList: Object.fromEntries(featuresList.map(key => [key, currentEditBizObj.value[key]])),
            type: featuresList.filter(key => [1, 2].includes(currentEditBizObj.value[key]))
        };
    }
});
</script>

<style scoped lang="scss">
.edit-business-objects-form {
    .#{$elnamespace}-form-item {
        margin-bottom: 24px;
        :deep(.#{$elnamespace}-input__inner), :deep(.#{$elnamespace}-textarea__inner) {
            color: #303133;
        }
        &:last-child {
            margin-bottom: 8px;
        }
    }
    .check-box-container {
        height: 210px;
        overflow-y: auto;
        :deep(.#{$elnamespace}-form-item__content) {
            display: block;
            .enable-features {
                display: grid;
                grid-template-columns: repeat(4, 25%);
                width: 100%;
            }
        }
    }
}

</style>
<style lang="scss">
.edit-business-objects {
    height: 600px;
    .edit-title {
        color: #303033;
        font-size: 16px;
        font-weight: 500;
        line-height: 24px;
    }
}
</style>
