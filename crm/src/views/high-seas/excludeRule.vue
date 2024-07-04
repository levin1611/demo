<!-- 公海设置 - 自动退回规则 - 排除规则 -->
<template>
    <div class="excludeRule">
        <!-- header -->
        <div class="excludeRule-header">
            <!-- title -->
            <span class="excludeRule-title">{{ $t('highSeas.excludeRule') }}</span> 

            <!-- 添加规则 -->
            <el-button
                type="primary"
                @click="handleAddRule"
            >{{ $t('highSeas.addRule') }}</el-button>
        </div>

        <!-- tip -->
        <div class="excludeRule-tip">{{ $t('highSeas.excludeRuleTip') }}</div> 

        <!-- table -->
        <el-table
            v-loading="tableLoading"
            :data="tableData"
            tooltip-effect="dark"
            :tooltip-options="{showAfter: 500}"
            max-height="calc(100vh - 220px)"
            stripe 
        >
            <el-table-column
                v-for="column in tableColumns"
                :key="column.prop"
                :prop="column.prop"
                :label="$t(column.label)"
                :min-width="column.width"
                :show-overflow-tooltip="true"
            >
                <template #default="{ row }">
                    <!-- 状态 -->
                    <template v-if="column.prop === 'enableFlag'">
                        <el-switch
                            :model-value="row.enableFlag"
                            width="50"
                            inline-prompt
                            :active-text="$t('enabled')"
                            :inactive-text="$t('bizObject.disable')"
                            :active-value="1"
                            :inactive-value="0"
                            @change="handleStatusChange(row)"
                        />
                    </template>
                    <!-- 操作 -->
                    <template v-else-if="column.prop === 'operate'">
                        <!-- 编辑 -->
                        <el-link
                            type="primary"
                            @click="handleEdit(row)"
                        >{{ $t('edit') }}</el-link>
                        <!-- 删除 -->
                        <el-link
                            type="primary"
                            @click="handleDelete(row)"
                        >{{ $t('delete') }}</el-link>
                    </template>
                </template>
            </el-table-column>
        </el-table>

        <!-- 新增编辑 -->
        <editExcludeRule
            v-if="visible_edit"
            v-model:visible="visible_edit"
            ref="newEditRef"
            :ruleData="curRuleData"
            @updateListData="refreshData"
        ></editExcludeRule>

        <!-- 删除确认弹框 -->
        <confirmDialog
            v-model:visible="visible_delete"
            :title="$t('deleteConfirm')"
            :tip-content="$t('highSeas.tip_deleteRule')"
            @confirm="handleDeleteConfirm"
        ></confirmDialog>
    </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { getExcludeRuleList, delExcludeRule, updateExcludeRule } from '@/api/highSeas.js';
import editExcludeRule from './modal/editExcludeRule.vue';
import confirmDialog from '@/components/confirmDialog.vue';

// inject
const currentSettingRow = inject('currentSettingRow');

// 全局
// 多语言
const { t } = useI18n();

// header
// 新建规则
const handleAddRule = () => {
    curRuleData.value = {};
    visible_edit.value = true;
};

// table
// loading
const tableLoading = ref(false);
// 表格列
const tableColumns = ref([
    {
        label: 'highSeas.ruleName',
        prop: 'name',
        width: 250
    },
    {
        label: 'condition',
        prop: 'resultCondition',
        width: 180
    },
    {
        label: 'status',
        prop: 'enableFlag',
        width: 55
    },
    {
        label: 'operate',
        prop: 'operate',
        width: ''
    }
]);
// 表格数据
const tableData = ref([]);
// 获取列表数据
const refreshData = () => {
    tableLoading.value = true;
    getExcludeRuleList({
        objectApiKey: currentSettingRow.value.apiKey
    }).then(res => {
        if (res.code === 10000) {
            tableData.value = Array.isArray(res.data) ? res.data : [];
        } else {
            tableData.value = [];
            ElMessage.error(res.messageShow);
        }
        tableLoading.value = false;
    });
};
// 修改状态
const handleStatusChange = (row) => {
    const postData = {
        id: row.id,
        enableFlag: row.enableFlag ? 0 : 1
    };
    updateExcludeRule(postData).then(res => {
        if (res.code === 10000) {
            ElMessage.success(t('saveSuccess'));
            row.enableFlag = postData.enableFlag;
        } else {
            ElMessage.error(res.messageShow);
        }
    });
};
// 编辑操作
const handleEdit = (row) => {
    curRuleData.value = row;
    visible_edit.value = true;
};
// 删除操作
const handleDelete = (row) => {
    curRuleData.value = row;
    visible_delete.value = true;
};

// dialog 新增编辑
// visible
const visible_edit = ref(false);
// 编辑中数据
const curRuleData = ref({});

// dialog 删除
// visible
const visible_delete = ref(false);
// 删除确认
const handleDeleteConfirm = () => {
    delExcludeRule({ id: curRuleData.value.id }).then(res => {
        if (res.code === 10000) {
            ElMessage.success(res.messageShow);
            visible_delete.value = false;
            refreshData();
        } else {
            ElMessage.error(res.messageShow);
        }
    });
};

// 初始化获取数据
refreshData();
</script>

<style lang="scss" scoped>
.excludeRule {
    &-header {
        border-bottom: 1px solid var(--#{$elnamespace}-border-color-lighter);
        padding: 0 20px 4px;
        display: flex;
        align-items: center;
    }

    &-title {
        flex: 1;
        white-space: nowrap;
        font-size: 15px;
        font-weight: 500;
        line-height: 24px;
        vertical-align: text-bottom;
        margin-right: 12px;
    }

    &-tip {
        font-size: 12px;
        line-height: 18px;
        color: #909299;
        padding: 12px 20px;
    }

    &-table {
        height: calc(100vh - 295px);
    }
}
</style>
