<template>
    <div class="rank-container">
        <elInput v-model="input" :placeholder="$t('rankPosition.pleaseEnterRank')" class="rank-input" maxlength="50"/>
        <elButton style="height: 36px;" type="primary" @click="addAttrName">{{ $t('add') }}</elButton>

        <elTable
            :data="tableData"
            class="member-rank-table"
        >
            <elTableColumn
                v-for="column in tableColumns"
                :key="column.prop"
                :label="column.label"
                :prop="column.prop"
                :min-width="column.minWidth"
            >
                <template v-if="column.prop === 'memberRank'" #default="{ row }">
                    <elInput v-if="row.showInput" ref="inputRef" v-model="attrNameInput" maxlength="50" />
                    <span v-else>
                        <el-tooltip
                            :content="row.attrName"
                            placement="top-start"
                            :disabled="row.attrName.length < 10"
                        >
                            {{ row.attrName }}
                        </el-tooltip>
                    </span>
                </template>
                <template v-else-if="column.prop === 'operation'" #default="{ row }">
                    <div v-if="row.showInput">
                        <el-link type="primary" class="edit-btn" @click="inputBlur(row)">{{ $t('save') }}</el-link>
                        <el-link type="primary" @click="cancelInput(row)">{{ $t('cancel') }}</el-link>
                    </div>
                    <div v-else>
                        <el-link type="primary" @click="editAttrName(row)">{{ $t('edit') }}</el-link>
                        <el-link type="primary" @click="deleteAttrName(row)">{{ $t('delete') }}</el-link>
                    </div>
                </template>
            </elTableColumn>
        </elTable>
    </div>
</template>

<script setup>
import { getUserAttrInfoList, getUserAttrInfo, saveUserAttrInfo, deleteUserAttrInfo, updateUserAttrInfo } from '@/api/members.js'; // 角色相关api请求
import { ref, onMounted, nextTick, watch } from 'vue';
import { CODESTATE } from '@/https/codeConfig';
import { useUserStore } from '@/pinia/modules/user.js';
import { useI18n } from 'vue-i18n';
// 获取全局 scss 变量, 以获取 element-plus 的命名空间
import CSSVariables from '@/style/js.module.scss';
const { elnamespace } = CSSVariables;

// 取 pinia 数据
const store = useUserStore();

// 多语言
const { t } = useI18n();
// 新增时的输入框
const input = ref('');
// 编辑时的输入框
const attrNameInput = ref('');
// 表格数据
const tableData = ref([]);

// 表格列
const tableColumns = [
    {
        label: t('rankPosition.rank'),
        prop: 'memberRank',
        minWidth: 300,
        showInput: false
    },
    {
        label: t('operate'),
        prop: 'operation',
        minWidth: 120,
        showInput: false
    }
];

// 编辑输入框
const inputRef = ref();
// 编辑功能
const editAttrName = (row) => {
    if (attrNameInput.value) {
        ElMessage.error(t('rankPosition.pleaseSaveOther1'));
        return;
    }
    if (attrNameInput.value) {
        return;
    }
    row.showInput = true;
    nextTick(() => {
        attrNameInput.value = row.attrName;
        // autofocus属性会失效, 这里加个自动聚焦
        inputRef.value && inputRef.value[inputRef.value.length - 1].focus();
    });
};

// 获取职级列表
const getAttrInfoList = () => {
    getUserAttrInfoList({
        orgId: store.orgId,
        type: 1 // 职级:1 职位:2
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            tableData.value = res.data;
            attrNameInput.value = '';
        } else {
            ElMessage.error(res.messageShow);
        }
    }).catch(err => {
        console.error(err);
        ElMessage.error(err.messageShow);
    });
};

// 获取数据
onMounted(() => {
    getAttrInfoList();
});

// 新增职级
const addAttrName = () => {
    if (!input.value) {
        ElMessage.error(t('rankPosition.rankCannotBeEmpty'));
        return;
    }

    saveUserAttrInfo({
        orgId: store.orgId,
        createUserId: store.userId,
        updateUserId: store.userId,
        attrName: input.value,
        attrType: 1, // 职级:1 职位:2
        deleteFlag: 0,
        sort: 0
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            input.value = '';
            getAttrInfoList();
        } else {
            ElMessage.error(res.messageShow);
        }
    }).catch(err => {
        console.error(err);
        ElMessage.error(err.messageShow);
    });
};

// 声明一个双向绑定 prop
const dialogVisible = defineModel('dialogVisible');
const userAttrInfo = defineModel('userAttrInfo');
const deleteDialogVisible = defineModel('deleteDialogVisible');
const deleteUserAttrThreshold = defineModel('deleteUserAttrThreshold');

// 被删除的 id
const deleteAttrId = ref('');

// 删除
const deleteAttrName = (row) => {
    // 1. 如果查询到有关联的成员，提示是否删除
    // 2. delete 接口调取
    // 3. 接口返回成功后，重新获取表格数据

    getUserAttrInfo({
        jobId: row.id,
        orgId: store.orgId
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            const { data } = res;
            if (data.length) {
                dialogVisible.value = true;
                userAttrInfo.value = data.join(',');
            } else {
                // 确认删除 modal
                deleteDialogVisible.value = true;
                deleteAttrId.value = row.id;
            }
        } else {
            ElMessage.error(res.messageShow);
        }
    }).catch(err => {
        console.error(err);
        ElMessage.error(err.messageShow);
    });
};

// 确认删除
const confirmDelete = () => {
    deleteUserAttrInfo({
        id: deleteAttrId.value
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            // 关闭 modal
            deleteDialogVisible.value = false;
            deleteUserAttrThreshold.value = false;
            deleteAttrId.value = '';
            getAttrInfoList();
        } else {
            ElMessage.error(res.messageShow);
        }
    }).catch(err => {
        console.error(err);
        ElMessage.error(err.messageShow);
    });
};

// 监听确认删除阈值, 并执行删除动作
watch(deleteUserAttrThreshold, (v) => {
    if (v) {
        confirmDelete();
    }
});

//  取消输入
const cancelInput = (row) => {
    row.showInput = false;
    attrNameInput.value = '';
};

// 编辑
const inputBlur = (row) => {
    if (!attrNameInput.value) {
        ElMessage.error(t('rankPosition.rankCannotBeEmpty'));
    } else {
        // 如果值没有改变，不调取接口
        if (attrNameInput.value === row.attrName) {
            cancelInput(row);
            return;
        }
        updateUserAttrInfo({
            id: row.id,
            attrName: attrNameInput.value,
            attrType: row.attrType,
            updateUserId: store.userId
        }).then(res => {
            if (res.code == CODESTATE.SUCCESS) {
                ElMessage.success(res.messageShow);
                row.attrName = attrNameInput.value;
                cancelInput(row);
            } else {
                ElMessage.error(res.messageShow);
            }
        }).catch(err => {
            cancelInput(row);
            console.error(err);
            ElMessage.error(err.messageShow);
        });
    }
};
</script>

<style lang="scss" scoped>
    .rank-container {
        width: 422px;
        .rank-input {
            height: 34px;
            width: 348px;
            margin-right: 12px;
        }
        .member-rank-table {
            margin-top: 12px;
            :deep(.#{$elnamespace}-scrollbar__wrap) {
                max-height: calc(100vh - 260px);
            }
            :deep(.is-horizontal) {
                display: none;
            }
            :deep(.#{$elnamespace}-table__cell) {
                padding: 0;
            }
            :deep(.cell) {
                line-height: 40px;
                white-space: nowrap;
            }
            :deep(.#{$elnamespace}-table__inner-wrapper) {
                border: 1px solid #EBEEF5;
            }
            :deep(th) {
                background-color: #F6F6F6;
            }
        }
    }
</style>
