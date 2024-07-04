<template>
    <div class="common-table">
        <div class="common-table-header padding-lr-20">
            <div class="common-table-header-left">
                <p class="common-table-tip">{{$t('clueConversion.condition')}}</p> 
            </div>
            <div class="common-table-header-right">
                <!-- 新建转化条件 -->
                <el-button
                    type="primary"
                    :disabled="tableData.length >= 20"
                    @click="createRules"
                >{{$t('clueConversion.addCondition')}}</el-button>
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
                :show-overflow-tooltip="['ruleName','errorMsg'].includes(column.prop)"
            >
                <template #default="{ row }">
                    <template v-if="column.prop === 'enableFlag'">
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
        <newEditCondition
            ref="newEditRef"
            v-if="dialogVisible"
            :id="editId"
            :objectId="currentSettingRow.id"
            :objectApiKey="currentSettingRow.apiKey"
            @updateListData="getListData"
            v-model:dialogVisible="dialogVisible"/>
        <!-- 删除确认弹框 -->
        <confirmDialog
            v-model:visible="deleteVisible"
            :title="$t('deleteConfirm')"
            :tip-content="$t('clueConversion.deleteTip')"
            @confirm="handleDelete"
        ></confirmDialog>
    </div>
</template>
<script setup>
import { ref, inject, reactive, onMounted } from 'vue';
import { getConversionRuleList, updateEnableFlag, delConversionRule } from '@/api/conversion.js';
import newEditCondition from './modal/newEditCondition.vue';
import confirmDialog from '@/components/confirmDialog.vue';
const currentSettingRow = inject('currentSettingRow');  
const columns = ref([
    {
        label: 'clueConversion.conditionfieldName1',
        prop: 'ruleName',
        width: ''
    },
    {
        label: 'clueConversion.conditionfieldName2',
        prop: 'errorMsg',
        width: '350'
    },
    {
        label: 'clueConversion.mappingfieldName5',
        prop: 'enableFlag',
        width: '200'
    },
    {
        label: 'clueConversion.mappingfieldName6',
        prop: 'operate',
        width: ''
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
    getConversionRuleList({
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
    delConversionRule({ id: deleteId.value }).then(res => {
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