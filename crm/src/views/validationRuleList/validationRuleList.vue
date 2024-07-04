<template>
    <div class="common-table">
        <div class="common-table-header">
            <div class="common-table-header-left">
                <p class="common-table-title">{{$t('validationRule.title')}}</p>
            </div>
            <div class="common-table-header-right">
                <!-- 新建校验规则 -->
                <el-button
                    type="primary"
                    :disabled="tableData.length >= 20"
                    @click="createRules"
                >{{$t('validationRule.add')}}</el-button>
            </div>
        </div>
        <el-table
            v-loading="tableLoading"
            :data="tableData"
            tooltip-effect="dark"
            :tooltip-options="{showAfter: 500}"
            max-height="calc(100vh - 220px)"
            stripe 
        >
            <el-table-column
                v-for="column in columns"
                :key="column.prop"
                :prop="column.prop"
                :label="$t(column.label)"
                :width="column.width"
                :show-overflow-tooltip="['ruleName','apiKey'].includes(column.prop)"
            >
                <template #default="{ row }">
                    <template v-if="column.prop === 'notes'">
                        <el-tooltip
                            placement="bottom"
                            effect="light"
                            popper-class="business-object-description-box"
                            :content="`<p class='business-object-description-content'>${row[column.prop]}</p>`"
                            raw-content
                        >
                            <i class="custom custom-message-text1"></i>
                        </el-tooltip>
                    </template>
                    <template v-else-if="column.prop === 'enableFlag'">
                        <el-switch
                            v-model="row.enableFlag"
                            width="50"
                            inline-prompt
                            @change="handleStatusChange(row)"
                            :active-text="$t('enabled')"
                            :inactive-text="$t('bizObject.disable')"
                        />
                    </template>
                    <template v-else-if="column.prop === 'operate'">
                        <!-- 编辑 -->
                        <el-link
                            type="primary"
                            @click="handleEdit(row)">
                            {{ $t('edit') }}
                        </el-link>
                        <!-- 删除 -->
                        <el-link
                            type="primary"
                            @click="deleteConfig(row)">
                            {{ $t('delete') }}
                        </el-link>
                    </template>
                </template>
            </el-table-column>
        </el-table>
        <!-- 新增编辑 -->
        <newEdit
            ref="newEditRef"
            v-if="dialogVisible"
            :objectId="currentSettingRow.id"
            :id="editId"
            @updateListData="getListData"
            v-model:dialogVisible="dialogVisible"/>
        <!-- 删除确认弹框 -->
        <confirmDialog
            v-model:visible="deleteVisible"
            :title="$t('deleteConfirm')"
            :tip-content="$t('validationRule.deleteTip')"
            @confirm="handleDelete"
        ></confirmDialog>
    </div>
</template>
<script setup>
import { ref, inject, reactive, onMounted } from 'vue';
import { getCheckRuleList, updateEnableFlag, delCheckRule } from '@/api/validationRuleList.js'; // 角色相关api请求
import newEdit from './modal/newEdit.vue';
import confirmDialog from '@/components/confirmDialog.vue';
const currentSettingRow = inject('currentSettingRow');
const columns = ref([
    {
        label: 'validationRule.fieldName1',
        prop: 'ruleName',
        width: ''
    },
    {
        label: 'validationRule.fieldName2',
        prop: 'apiKey',
        width: ''
    },
    {
        label: 'validationRule.fieldName3',
        prop: 'notes',
        width: '160'
    },
    {
        label: 'validationRule.fieldName4',
        prop: 'enableFlag',
        width: '160'
    },
    {
        label: 'validationRule.fieldName5',
        prop: 'operate',
        width: '220'
    }
]);
const tableLoading = ref(false); // table组件的loading
const tableData = ref([]);
// 新增、编辑
const dialogVisible = ref(false);
const editId = ref(''); // 编辑时保存id，用于区分编辑和新增操作
// 删除
const deleteVisible = ref(false);
const deleteId = ref('');
// 新增规则
const createRules = () => {
    editId.value = '';
    dialogVisible.value = true;
};
// 获取列表数据
const getListData = () => {
    getCheckRuleList({
        objectId: currentSettingRow.value.id
    }).then(res => {
        if (res.code === 10000) {
            tableData.value = res.data.map(item => {
                item.enableFlag = item.enableFlag === 1;
                return item;
            });
        } else {
            tableData.value = [];
            ElMessage.error(res.messageShow);
        }
        tableLoading.value = false;
    });
};
getListData();
// 修改状态
const handleStatusChange = (row) => {
    updateEnableFlag({
        id: row.id,
        enableFlag: row.enableFlag ? 1 : 0
    }).then(res => {
        if (res.code === 10000) {
            ElMessage.success('操作成功');
        } else {
            ElMessage.error(res.messageShow);
            row.enableFlag = !row.enableFlag;
        }
    });
};
// 编辑操作
const handleEdit = (row) => {
    editId.value = row.id;
    dialogVisible.value = true;
};
// 删除确认
const deleteConfig = (row) => {
    deleteId.value = row.id;
    deleteVisible.value = true;
};
// 删除操作
const handleDelete = () => {
    delCheckRule({ id: deleteId.value }).then(res => {
        if (res.code === 10000) {
            ElMessage.success(res.messageShow);
            deleteVisible.value = false;
            getListData();
        } else {
            ElMessage.error(res.messageShow);
        }
    });
};
</script>
<style scoped lang="scss">
.common-table-header {
    padding-right: 24px;
    .common-table-title {
        font-size: 15px;
    }
}
</style>