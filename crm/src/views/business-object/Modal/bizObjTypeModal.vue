<template>
    <el-dialog
        v-model="dialogVisible"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        width="660"
        class="edit-business-objects-type"
    >
        <template #header>
            <div class="title">
                {{ isEdit ? $t('bizObject.editBusinessObjectType') : $t('bizObject.addBusinessObjectType') }}
            </div>
        </template>
        <el-form
            ref="ruleFormRef"
            label-position="left"
            :model="currentEditRowCopy"
            :rules="rules"
            label-width="140px"
            class="edit-business-objects-type-form"
        >
            <el-form-item :label="$t('bizObject.businessObjectTypeName')" prop="name">
                <el-input v-model="currentEditRowCopy.name" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item :label="$t('bizObject.programIdentificationName')" prop="apiKey">
                <el-input v-model="currentEditRowCopy.apiKey" maxlength="50" show-word-limit disabled />
            </el-form-item>
            <el-form-item :label="$t('bizObject.describe')" prop="description">
                <el-input v-model="currentEditRowCopy.description" type="textarea" maxlength="400" show-word-limit rows="4" placeholder="请输入客户描述" />
            </el-form-item>
            <el-form-item :label="$t('bizObject.applicableMembers')" prop="description1">
                <div style="height: 210px;width: 100%;">
                    <!-- 选择成员 -->
                    <applicableMember
                        v-if="dialogVisible"
                        ref="applicableMemberDom"
                        :defaultData="defaultData"
                        activeTabProp="subDepartments"
                        @emitLoadingDone=setDefaultData
                    />
                </div>
            </el-form-item>
        </el-form>

        <template #footer>
            <span>
                <el-button class="useBrandColor" @click="dialogVisible = false">{{ $t('cancel') }}</el-button>
                <el-button type="primary" :loading="saveLoading" @click="saveObj">
                    {{ isEdit ? $t('save') : $t('new') }}
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, toRefs, reactive, watch, inject } from 'vue';
import { editObjType, addObjType, createApiKey } from '@/api/businessObjects.js';
import { CODESTATE } from '@/https/codeConfig';
// 获取全局 scss 变量, 以获取 element-plus 的命名空间
import CSSVariables from '@/style/js.module.scss';
import { useUserStore } from '@/pinia/modules/user.js';
import applicableMember from '@/components/applicableMember/applicableMember.vue';
import { useI18n } from 'vue-i18n';
// 多语言
const { t } = useI18n();
// 取 pinia 数据
const store = useUserStore();
const { elnamespace } = CSSVariables;

// 定义props
const props = defineProps({
    // 当前编辑行
    curEditBizObjType: {
        type: Object,
        default: () => ({})
    },
    lastBizObjId: {
        type: Number,
        default: -1
    }
});
// 解构 props
const { curEditBizObjType } = toRefs(props);
const defaultData = defineModel('defaultData');

const emits = defineEmits(['clearDefaultData']);

// 接收父组件传, 当前选中的行
const currentSettingRow = inject('currentSettingRow');

// 声明一个双向绑定 prop
const dialogVisible = defineModel('dialogVisible');

// 表单验证规则
const rules = reactive({
    name: [
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


// 适用成员
const applicableMemberDom = ref(null);

// 按钮加个 loading, 防止重复提交
const saveLoading = ref(false);

const reactiveIdForUpdate = defineModel('reactiveIdForUpdate');

// 获取当前业务对象下的字段列表
const saveObj = () => {
    const checkData = applicableMemberDom.value.getCheckData();
    const memberIdTypeMap = checkData.reduce((acc, item) => {
        if (!acc.has(item.type)) {
            acc.set(item.type, {
                memberType: item.type,
                idList: []
            });
        }
        acc.get(item.type).idList.push(item.id);
        return acc;
    }, new Map());

    const memberIdTypeList = Array.from(memberIdTypeMap.values());

    // 判断memberIdTypeList是否有值
    if (!memberIdTypeList.length) {
        ElMessage.error(t('bizObject.selectApplicableMembers'));
        return;
    }

    ruleFormRef.value.validate(valid => {
        if (!valid) return;
        saveLoading.value = true;
        let params;
        const operation = isEdit.value ? editObjType : addObjType;
        params = {
            orgId: store.orgId,
            userId: store.userId,
            apiKey: currentEditRowCopy.value.apiKey,
            description: currentEditRowCopy.value.description,
            name: currentEditRowCopy.value.name,
            objectId: currentSettingRow.value.id,
            objApiKey: currentSettingRow.value.apiKey,
            predefinedFlag: isEdit.value ? currentEditRowCopy.value.predefinedFlag : 0, // 默认 0
            memberIdTypeList
        };
        if (isEdit.value) {
            params = {
                ...params,
                id: currentEditRowCopy.value.id,
                deletedFlag: currentEditRowCopy.value.deletedFlag,
                sortNum: currentEditRowCopy.value.sortNum, // 排序 id
                enableFlag: currentEditRowCopy.value.enableFlag ? 1 : 0
            };
        }
        operation(params).then(res => {
            if (res.code == CODESTATE.SUCCESS) {
                ElMessage.success(res.messageShow);
                dialogVisible.value = false;
                reactiveIdForUpdate.value++;
            } else {
                ElMessage.error(res.messageShow);
            }
            saveLoading.value = false;
        }).catch(err => {
            ElMessage.error(err.messageShow);
            saveLoading.value = false;
        });
    });
};


// 当前是否是编辑状态
const isEdit = ref(false);
const currentEditRowCopy = ref({});
const isEditCurrent = () => {
    currentEditRowCopy.value = Object.assign({}, props.curEditBizObjType);
    if (Object.keys(currentEditRowCopy.value).length) {
        isEdit.value = true;
    } else {
        isEdit.value = false;
    }
};

// 新建业务对象时, 设置默认成员
const setDefaultData = (data) => {
    if (isEdit.value) return;
    const arr = [{
        id: data[0].id,
        name: data[0].name,
        type: data[0].type
    }];

    defaultData.value = arr;
};

// 获取程序识别名称
const getApiKey = () => {
    createApiKey({
        type: 2, // 固定
        objectId: currentSettingRow.value.id
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            currentEditRowCopy.value.apiKey = res.data;
        } else {
            ElMessage.error(res.messageShow);
        }
    }).catch(err => {
        ElMessage.error(err.messageShow);
    });
};

watch(dialogVisible, (val) => {
    if (!val) {
        resetForm();
        // 清空适用成员
        emits('clearDefaultData');
    } else {
        // 当前是否是编辑状态
        isEditCurrent();
        // 如果是新建状态, 获取程序识别名称
        if (!isEdit.value) {
            getApiKey();
        }
    }
});
</script>

<style scoped lang="scss">
.edit-business-objects-type-form {
    height: 465px;
    overflow: auto;
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
.edit-business-objects-type {
    height: 600px;
    .title {
        color: #303033;
        font-size: 16px;
        font-weight: 500;
        line-height: 24px;
    }
}
</style>
