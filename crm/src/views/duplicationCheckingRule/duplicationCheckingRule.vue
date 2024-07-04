<template>
    <div class="common-table">
        <div class="common-table-header">
            <div class="common-table-header-left">
                <p class="common-table-title">{{$t('duplicationCheckingRule.title')}}</p>
            </div>
            <div class="common-table-header-right">
                <!-- 设置排序 -->
                <el-button
                    class="useBrandColor"
                    @click="showSortManagerVisible"
                >{{ $t('duplicationCheckingRule.handleName1') }}</el-button>
                <!-- 新建查重规则 -->
                <el-button
                    type="primary"
                    :disabled="tableData.length >= 20"
                    @click="createRules"
                >{{$t('duplicationCheckingRule.handleName2')}}</el-button>
            </div>
        </div>
        <el-table
            v-loading="tableLoading"
            :data="tableData"
            :max-height="tableData1.length ? 'calc(100vh - 400px)' : 'calc(100vh - 100px)'"
            stripe
            :tooltip-options="{showAfter: 500}"
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
                            popper-class="business-object-description-box"
                            placement="bottom"
                            effect="light"
                            :content="`<p class='business-object-description-content'>${row[column.prop]}</p>`"
                            raw-content
                            trigger="hover"
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
                            @click="handleEdit(row)"
                        >
                            {{ $t('edit') }}
                        </el-link>
                        <!-- 删除 -->
                        <el-link
                            type="primary"
                            @click="deleteConfig(row)"
                        >
                            {{ $t('delete') }}
                        </el-link>
                    </template>
                </template>
            </el-table-column>
        </el-table>
        <template v-if="tableData1.length">
            <div class="common-table-header" style="margin-top: 20px;">
                <div class="common-table-header-left">
                    <p class="common-table-title">{{$t('duplicationCheckingRule.title2')}}</p>
                </div>
            </div>
            <el-table
                v-loading="tableLoading"
                :data="tableData1"
                stripe
                :tooltip-options="{showAfter: 500}"
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
                                @click="handleEdit(row)"
                            >
                                {{ $t('edit') }}
                            </el-link>
                        </template>
                    </template>
                </el-table-column>
            </el-table>
        </template>
        <newEdit
            ref="newEditRef"
            v-if="dialogVisible"
            :objectId="currentSettingRow.id"
            :id="editId"
            @updateListData="getListData"
            v-model:dialogVisible="dialogVisible"/>
        <!-- 删除角色确认 弹框 -->
        <confirmDialog
            v-model:visible="deleteVisible"
            :title="$t('deleteConfirm')"
            :tip-content="$t('duplicationCheckingRule.deleteTip')"
            @confirm="handleDelete"
        ></confirmDialog>
        <!-- 设置排序弹窗 -->
        <sortManager
            v-if="sortManagerVisible"
            displayName="ruleName"
            :tips="$t('duplicationCheckingRule.setSortTip')"
            :title="$t('duplicationCheckingRule.setSort')"
            :dragArrTemp="tableData"
            @confirm="handleSetSort"
            @close="sortManagerVisible = false"
            style="margin-right: 12px"></sortManager>
    </div>
</template>
<script setup>
import { ref, inject, reactive, onMounted, watch } from 'vue';
import { useUserStore } from '@/pinia/modules/user.js';
import { getRepeatList, updateEnableFlag, getDuplicationCheckFields, repeatRule, repeatRuleSort, delRepeatRule } from '@/api/duplicationCheckingRule.js'; // 角色相关api请求
import {sortManager} from 'xhl_lib';
import newEdit from './modal/newEdit.vue';
import confirmDialog from '@/components/confirmDialog.vue';
const currentSettingRow = inject('currentSettingRow');
const store = useUserStore();
const tableLoading = ref(false); // table组件的loading
const columns = ref([
    {
        label: 'duplicationCheckingRule.fieldName1',
        prop: 'ruleName',
        width: ''
    },
    {
        label: 'duplicationCheckingRule.fieldName2',
        prop: 'apiKey',
        width: ''
    },
    {
        label: 'duplicationCheckingRule.fieldName3',
        prop: 'notes',
        width: '160'
    },
    {
        label: 'duplicationCheckingRule.fieldName4',
        prop: 'enableFlag',
        width: '160'
    },
    {
        label: 'duplicationCheckingRule.fieldName5',
        prop: 'operate',
        width: '220'
    }
]);
const tableData = ref([]);
const tableData1 = ref([]);
const sortManagerVisible = ref(false);
const dialogVisible = ref(false);
const editId = ref(''); // 编辑时保存id，用于区分编辑和新增操作
const deleteVisible = ref(false);
const deleteId = ref('');
const showSortManagerVisible = () => {
    sortManagerVisible.value = true;
};
const handleSetSort = (idList) => {
    repeatRuleSort({
        objectId: currentSettingRow.value.id,
        rules: idList
    }).then(res => {
        if (res.code === 10000) {
            ElMessage.success('操作成功');
            sortManagerVisible.value = false;
        } else {
            ElMessage.error(res.messageShow);
        }
        getListData();
    });
};
const createRules = () => {
    editId.value = '';
    dialogVisible.value = true;
};

// 获取查重列表数据
const getListData = () => {
    tableLoading.value = true;
    getRepeatList({
        objectId: currentSettingRow.value.id
    }).then(res => {
        if (res.code === 10000) {
            if (res.data.repeats && res.data.repeats.length) {
                tableData.value = res.data.repeats.map(item => {
                    item.enableFlag = item.enableFlag === 1;
                    return item;
                });
            } else {
                tableData.value = [];
            }
            if (res.data.likeRepeats && res.data.likeRepeats.length) {
                tableData1.value = res.data.likeRepeats.map(item => {
                    item.enableFlag = item.enableFlag === 1;
                    item.notes = item.notes || '';
                    return item;
                });
            } else {
                tableData1.value = [];
            }
        }
        tableLoading.value = false;
    });
};
getListData();
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
const handleEdit = (row) => {
    editId.value = row.id;
    dialogVisible.value = true;
};
const deleteConfig = (row) => {
    deleteId.value = row.id;
    deleteVisible.value = true;
};
const handleDelete = () => {
    delRepeatRule({ id: deleteId.value }).then(res => {
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