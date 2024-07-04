<template>
    <div class="business-object-type">
        <div class="title-container">
            <el-button
                v-if="disabledBtns"
                class="useBrandColor"
                @click="sortDialogVisible=true"
            >
                {{ $t('bizObject.setSort') }}
            </el-button>
            <el-button
                v-if="disabledBtns"
                type="primary"
                style="margin-left: 12px;"
                :disabled="maxBizObjType >= 60"
                @click="bizObjTypeModalVisvible=true"
            >
                {{ $t('bizObject.addBusinessObjectType') }}
            </el-button>
        </div>

        <!-- table -->
        <el-table
            :data="tableData"
            v-loading="tableLoading"
            max-height="calc(100vh - 188px)"
            class="business-object-type-table"
            stripe
        >
            <el-table-column
                v-for="column in tableColumns"
                :key="column.prop"
                :label="column.label"
                :width="column.width"
                :min-width="column.minWidth"
                show-overflow-tooltip
                :tooltip-options="{ appendTo: 'body' }"
            >
                <!-- 默认 -->
                <template v-if="column.prop === 'predefinedFlag'" #default="{ row }">
                    <span>{{ row[column.prop] === 1 ? $t('bizObject.yes') : $t('bizObject.no') }}</span>
                </template>
                <!-- 状态 -->
                <template v-else-if="column.prop === 'enableFlag'" #default="{ row }">
                    <el-switch
                        v-model="row[column.prop]"
                        inline-prompt
                        :active-text="$t('bizObject.enable')"
                        :inactive-text="$t('bizObject.disable')"
                        :disabled="row.predefinedFlag"
                        @change="changeStatus(row)"
                    />
                </template>
                <!-- 操作 -->
                <template v-else-if="column.prop === 'operation'" #default="{ row }">
                    <el-link
                        v-if="disabledBtns"
                        type="primary"
                        @click="editBizObjType(row)"
                    >
                        {{ $t('bizObject.edit') }}
                    </el-link>
                    <el-link type="primary" @click="showFieldDialog(row)">{{ $t('bizObject.setFields') }}</el-link>
                    <el-link type="primary" @click="showLayoutDialog(row)">{{ $t('bizObject.setLayout') }}</el-link>
                    <el-link v-if="row.predefinedFlag === 0" @click="handleDelete(row)" type="primary">{{ $t('bizObject.delete') }}</el-link>
                </template>
                <template v-else #default="{ row }">
                    <span>{{ row[column.prop] }}</span>
                </template>
            </el-table-column>
        </el-table>

        <!-- 设置字段 modal -->
        <setFieldsDialog
            v-model:visible="setFieldsDialogVisible"
            :currentBizObjTypeRow="currentBizObjTypeRow"
            :width="800"
        />

        <!-- 设置布局 modal -->
        <setLayoutDialog
            v-model:dialogVisible="setLayoutDialogVisible"
            :currentBizObjTypeRow="currentBizObjTypeRow"
            :bizObjConfig="currentSettingRow"
            :width="800"
        />

        <!-- 删除业务对象类型 弹框 -->
        <confirmDialog
            v-model:visible="visible_delete"
            :title="$t('deleteConfirm')"
            :tip-content="$t('rankPosition.doYouConfirmTheDeletion')"
            @confirm="handleDeleteConfirm"
        ></confirmDialog>

        <!-- 设置排序 -->
        <sortManager
            v-if="sortDialogVisible"
            :dragArrTemp="sortObj"
            :title="$t('bizObject.bizObjTypeSort')"
            @confirm="confirmSort"
            @close="sortDialogVisible=false"
        />
    </div>
</template>
<script setup>
import { ref, onMounted, inject, computed, watch } from 'vue';
import { queryObjTypeList, changeObjTypeStatus, updateObjTypeSort, delObjType, findMembers } from '@/api/businessObjects';
import { CODESTATE } from '@/https/codeConfig';
import { useUserStore } from '@/pinia/modules/user.js';
import { useI18n } from 'vue-i18n';
import setFieldsDialog from '@/views/business-object/Modal/setFieldsDialog.vue';
import setLayoutDialog from '@/views/business-object/Modal/setLayoutDialog.vue';
import {sortManager} from 'xhl_lib';
// 获取全局 scss 变量, 以获取 element-plus 的命名空间
import CSSVariables from '@/style/js.module.scss';

const { elnamespace } = CSSVariables;

// 取 pinia 数据
const store = useUserStore();
// 多语言
const { t } = useI18n();

// 当前是否为系统业务对象
const isSystemBizObj = inject('isSystemBizObj');
// 接收父组件传, 当前选中的行
const currentSettingRow = inject('currentSettingRow');

// 根据业务对象类型显示按钮
const disabledList = ['touchPointContact'];
const disabledBtns = computed(() => {
    return !disabledList.includes(currentSettingRow.value.apiKey);
});

// 表格列
const tableColumns = [
    {
        label: t('bizObject.businessObjectTypeName'),
        prop: 'name',
        minWidth: 200
    },
    {
        label: t('bizObject.default'),
        prop: 'predefinedFlag',
        width: 160
    },
    {
        label: t('bizObject.programIdentificationName'),
        prop: 'apiKey',
        minWidth: 270
    },
    {
        label: t('bizObject.state'),
        prop: 'enableFlag',
        width: 120
    },
    {
        label: t('bizObject.operate'),
        prop: 'operation',
        width: 320
    }
];

// loading
const tableLoading = ref(false);
// 表格数据
const tableData = ref([]);
// 设置排序（传递给排序组件）
const sortObj = ref({});
// 最后一个 id
const lastBizObjId = defineModel('lastBizObjId');
// 处理数据
const handleData = data => data.map(item => ({
    ...item,
    enableFlag: Boolean(item.enableFlag)
}));
// 查询业务对象类型列表
const queryObjTypes = (type) => {
    tableLoading.value = true;
    tableData.value = [];

    queryObjTypeList({
        orgId: store.orgId,
        userId: store.userId,
        objectId: currentSettingRow.value.id
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            const list = res.data;

            if (list && list.length) {
                // 设置最后一个 id
                lastBizObjId.value = list[list.length - 1].id;
            } else {
                ElMessage.error(t('bizObject.noMoreData'));
            }
            tableData.value = tableData.value.concat(handleData(list));
            // 设置排序（传递给排序组件）
            sortObj.value = tableData.value.map(item => {
                return { displayName: item.name, id: item.id };
            });
            maxBizObjType.value = list.length;
        } else {
            ElMessage.error(res.messageShow);
        }
        tableLoading.value = false;
    }).catch(err => {
        console.error(err);
        ElMessage.error(err.messageShow);
        tableLoading.value = false;
    });
};


onMounted(() => {
    queryObjTypes();
});

// 切换状态
const changeStatus = (row) => {
    changeObjTypeStatus({
        id: row.id,
        objectId: currentSettingRow.value.id,
        enableFlag: row.enableFlag ? 1 : 0
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            ElMessage.success('操作成功');
        } else {
            row.enableFlag = !row.enableFlag;
            ElMessage.error(res.messageShow);
        }
    }).catch(err => {
        console.error(err);
        ElMessage.error(err.messageShow);
    });
};

// 业务对象类型最多只能有 60 个
const maxBizObjType = ref(null);
// 编辑业务对象类型modal
const bizObjTypeModalVisvible = defineModel('bizObjTypeModalVisvible');
const curEditBizObjType = defineModel('curEditBizObjType');
// 触发编辑
const editBizObjType = (row) => {
    currentBizObjTypeRow.value = row;
    curEditBizObjType.value = row;
    getApplicableMember();
};

const defaultData = defineModel('defaultData');
// 获取当前业务对象类型下的适用成员
const getApplicableMember = () => {
    findMembers({
        businessId: currentSettingRow.value.id,
        orgId: store.orgId,
        userId: store.userId,
        businessTypeId: currentBizObjTypeRow.value.id
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            defaultData.value = res.data;
        } else {
            ElMessage.error(res.messageShow);
        }
        bizObjTypeModalVisvible.value = true;
    }).catch(err => {
        console.error('findMembers', err);
        ElMessage.error(err.messageShow);
        bizObjTypeModalVisvible.value = true;
    });
};
// 监听编辑框的关闭
watch(bizObjTypeModalVisvible, (val) => {
    if (!val) {
        curEditBizObjType.value = {};
    }
});

// 监听 reactiveIdForUpdate 的变化, 更新数据
const reactiveIdForUpdate = defineModel('reactiveIdForUpdate');
watch(reactiveIdForUpdate, (val) => {
    queryObjTypes();
});

// 当前选中的行
const currentBizObjTypeRow = ref({});
// 设置字段弹窗
const setFieldsDialogVisible = ref(false);
// 显示设置字段弹窗
const showFieldDialog = (row) => {
    setFieldsDialogVisible.value = true;
    currentBizObjTypeRow.value = row;
};

// 删除弹窗
const visible_delete = ref(false);
// 触发删除
const handleDelete = (row) => {
    currentBizObjTypeRow.value = row;
    visible_delete.value = true;
};
// 删除确认
const handleDeleteConfirm = () => {
    // 删除业务对象类型
    delObjType({
        objectId: currentSettingRow.value.id,
        objectTypeId: currentBizObjTypeRow.value.id
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            ElMessage.success(t('operateSuccess'));
            visible_delete.value = false;
            // 重新查询数据
            queryObjTypes();
        } else {
            ElMessage.error(res.messageShow);
        }
    }).catch(err => {
        console.error(err);
        ElMessage.error(err.messageShow);
    });
};

// 设置布局弹窗
const setLayoutDialogVisible = ref(false);
// 显示设置布局弹窗
const showLayoutDialog = (row) => {
    currentBizObjTypeRow.value = row;
    setLayoutDialogVisible.value = true;
};

// 设置排序弹窗
const sortDialogVisible = ref(false);
// 排序接口
const sortApi = (objectTypeIds) => {
    updateObjTypeSort({
        objectTypeIds,
        userId: store.userId
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            ElMessage.success('操作成功');
            // 重新查询数据
            queryObjTypes();
        } else {
            ElMessage.error(res.messageShow);
        }
    }).catch(err => {
        console.error(err);
        ElMessage.error(err.messageShow);
    });
};
// 确认排序
const confirmSort = (objectTypeIds) => {
    sortDialogVisible.value = false;
    sortApi(objectTypeIds);
};
</script>
<style lang="scss" scoped>
:deep(.#{$elnamespace}-popper) {
    margin-left: 180px;
}
.business-object-type {
    .title-container {
        display: flex;
        justify-content: flex-end;
        padding-right: 24px;
    }
    .biz-obj-name {
        display: inline-block;
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
</style>
<!-- <style lang="scss">
.business-object-type {
    .#{$elnamespace}-table {
        .#{$elnamespace}-table__cell {
            padding: 6px 0;
        }
    }
}
</style> -->