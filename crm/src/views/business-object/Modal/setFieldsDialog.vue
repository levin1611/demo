<!-- 设置字段 dialog -->
<template>
    <el-dialog
        v-model="dialogVisible"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :width="width"
        ref="dialogRef"
        class="set-fields-dialog"
    >
        <template #title>
            <div class="title">{{ tipTitle || $t('bizObject.setFields') }}</div>
        </template>
        <!-- body -->
        <template #default>
            <div class="top-btn-container">
                <el-button
                    type="primary"
                    @click="configDialogVisible=true"
                >
                    {{ $t('bizObject.configureAvailableFields') }}
                </el-button>
            </div>
            <el-table
                :data="tableData"
                v-loading="tableLoading"
                ref="tableRef"
                height="440"
                show-overflow-tooltip
                :tooltip-options="{showAfter: 500}"
                stripe
                style="width: 100%"
            >
                <el-table-column
                    v-for="column in tableColumns"
                    :key="column.prop"
                    :label="column.label"
                    :min-width="column.minWidth"
                    :width="column.width"
                >
                    <!-- 字段名称 -->
                    <template v-if="column.prop === 'displayName'" #default="{ row }">
                        <span style="white-space: nowrap">{{ row[column.prop] }}</span>
                    </template>
                    <!-- 字段类型 -->
                    <template v-else-if="column.prop === 'fieldType'" #default="{ row }">
                        <span style="white-space: nowrap;">{{ getDataTypeName(row) }}</span>
                    </template>
                    <!-- 选项型字段默认值 -->
                    <template v-else-if="column.prop === 'defaultOptionName'" #default="{ row }">
                        {{ handleOptionValue(row.defaultOptionInfos) }}
                    </template>
                    <!-- 是否必填 -->
                    <template v-else-if="column.prop === 'usageFlag'" #default="{ row }">
                        <el-switch
                            v-model="row[column.prop]"
                            inline-prompt
                            :active-text="$t('bizObject.yes')"
                            :inactive-text="$t('bizObject.no')"
                            :disabled="row.usageConfigFlag === 3"
                            @change="changeStatus(row)"
                        />
                    </template>
                    <!-- 操作 -->
                    <template v-else-if="column.prop === 'operation'" #default="{ row }">
                        <template v-if="!row.predefinedFlag && [25, 26].includes(row.dataType)">
                            <el-link type="primary" @click="showLabelConfiguration(row)">{{ $t('bizObject.optionValueSettings') }}</el-link>
                        </template>
                    </template>

                    <template v-else #default="{ row }">
                        <span>{{ row[column.prop] || '--' }}</span>
                    </template>
                </el-table-column>
            </el-table>
        </template>


        <!-- footer -->
        <template #footer>
            <div class="dialog-footer">
                <!-- cancel -->
                <el-button
                    v-if="footerBtns.includes('cancel')"
                    @click="closeDialog"
                    class="useBrandColor"
                >{{ $t('close') }}</el-button>
            </div>
        </template>
    </el-dialog>
    <!-- 配置可用字段 -->
    <configureAvailableFields
        v-model:visible="configDialogVisible"
        :currentBizObjTypeRow="currentBizObjTypeRow"
        @confirm="refreshData"
    />
    <!-- 选项值设置 -->
    <optionValueSettings
        v-model:visible="optionValueSettingsVisible"
        v-model:currentOptionValue="currentOptionValue"
        :currentBizObjTypeRow="currentBizObjTypeRow"
        @confirm="refreshData"
    />
</template>

<script setup>
import { ref, toRefs, watch, nextTick } from 'vue';
import useDialogCommon from '@/hooks/useDialogCommon';
import useScrollableTableData from '@/hooks/useScrollableTableData.js';
import { getAvailableFieldInfo, updateObjTypeFieldRequired } from '@/api/businessObjects';
import configureAvailableFields from './configureAvailableFields.vue';
import optionValueSettings from './optionValueSettings.vue';
import { CODESTATE } from '@/https/codeConfig';
import { useUserStore } from '@/pinia/modules/user.js';
import { useI18n } from 'vue-i18n';
// 获取全局 scss 变量, 以获取 element-plus 的命名空间
import CSSVariables from '@/style/js.module.scss';
import { fieldsNamesMap } from '@/utils/filterConfig';

// 多语言
const { t } = useI18n();
const { elnamespace } = CSSVariables;

// 取 pinia 数据
const store = useUserStore();
// 接受外部传参
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    },
    // 显示内容
    tipTitle: {
        type: String
    },
    // 底部按钮
    footerBtns: {
        type: Array,
        default() {
            return ['confirm', 'cancel'];
        }
    },
    confirmBtnText: {
        type: String
    },
    width: {
        type: String,
        default: '500px'
    },
    currentBizObjTypeRow: {
        type: Object,
        default: () => ({})
    }
});
// 解构 props
const {
    currentBizObjTypeRow
} = toRefs(props);
// 定义 emit
const emits = defineEmits(['update:visible', 'confirm', 'cancel']);

// 取通用的 dialog 逻辑相关参数
const {
    dialogVisible,
    closeDialog
} = useDialogCommon(props, emits);

// 处理 loading 逻辑
// 暂存 dialog DOM
let dialogEl;
// 取 dialog 组件 body ref
const dialogBodyRef = ref(null);

// footer
const confirm = async () => {
    // 确认按钮点击事件
    // 触发 confirm 事件
    emits('confirm');
};

const tableColumns = [
    {
        prop: 'displayName',
        label: '字段名称',
        minWidth: '200'
    },
    {
        prop: 'fieldType',
        label: '字段类型',
        width: '140'
    },
    {
        prop: 'defaultOptionName',
        label: '选项型字段默认值',
        minWidth: '180'
    },
    {
        prop: 'usageFlag',
        label: '必填',
        minWidth: '100'
    },
    {
        prop: 'operation',
        label: '操作',
        width: '120'
    }
];

// 处理字段类型
const getDataTypeName = (row) => {
    return fieldsNamesMap[row.dataType] || '--';
};
// 处理选项值
const handleOptionValue = (defaultOptionInfos) => {
    return defaultOptionInfos?.map(item => item.displayName).join(',') ?? '--';
};

const changeStatus = (row) => {
    updateObjTypeFieldRequired({
        orgId: store.orgId,
        userId: store.userId,
        fieldId: row.fieldId,
        objectTypeId: currentBizObjTypeRow.value.id,
        usageFlag: row.usageFlag ? 2 : 1
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            ElMessage.success(res.messageShow);
        } else {
            row.usageFlag = !row.usageFlag;
            ElMessage.error(res.messageShow);
        }
    }).catch(err => {
        console.error(err);
        ElMessage.error(err.messageShow);
    });
};

const tableData = ref([]);
// 分页配置
const pageNationParams = ref({
    pageNo: 1,
    pageSize: 20
});
// loading
const tableLoading = ref(false);
// 处理数据
const handleData = data => data.map(item => ({
    ...item,
    usageFlag: item.usageFlag === 2
}));

// 查询业务对象类型列表
const queryData = (type) => {
    tableLoading.value = true;
    if (type == 'more') {
        pageNationParams.value.pageNo++;
    } else {
        pageNationParams.value.pageNo = 1;
        tableData.value = [];
    }
    getAvailableFieldInfo({
        orgId: store.orgId,
        userId: store.userId,
        objectId: currentBizObjTypeRow.value.objectId,
        objectTypeId: currentBizObjTypeRow.value.id,
        pageNo: pageNationParams.value.pageNo,
        pageSize: pageNationParams.value.pageSize
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            const { list, pageNum, pageSize } = res.data;
            if (list && list.length) {
                pageNationParams.value.pageNo = pageNum;
            } else {
                pageNationParams.value.pageNo--;
                // ElMessage.error(t('bizObject.noMoreData'));
            }
            // pageNationParams.value.pageSize = pageSize;
            tableData.value = tableData.value.concat(handleData(list));
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

// table的虚拟dom
const tableRef = ref();
// 滚动获取数据
const { scrollBehavior } = useScrollableTableData(tableRef, tableLoading, queryData);

watch(dialogVisible, (val) => {
    if (val) {
        queryData();
        nextTick(() => {
            // 挂载
            tableRef.value && tableRef.value.$refs.bodyWrapper.addEventListener('mousewheel', scrollBehavior);
        });
    } else {
        // 卸载
        tableRef.value && tableRef.value.$refs.bodyWrapper.removeEventListener('mousewheel', scrollBehavior);
    }
});

// 配置可用字段 modal
const configDialogVisible = ref(false);
// 更新配置可用字段时, 刷新数据
const refreshData = () => {
    configDialogVisible.value = false;
    queryData();
};

// 选项值设置 modal
const optionValueSettingsVisible = ref(false);
const currentOptionValue = ref({});
const showLabelConfiguration = (row) => {
    currentOptionValue.value = row;
    optionValueSettingsVisible.value = true;
};
</script>

<style lang="scss" scoped>
.set-fields-dialog {
    .#{$elnamespace}-dialog__header {
        padding: 24px 24px 12px 24px;
    }
    .title {
        color: #303033;
        font-size: 16px;
        font-weight: 500;
        line-height: 24px;
    }
    .top-btn-container {
        text-align: right;
    }
}
</style>
<style lang="scss">
.set-fields-dialog {
    .#{$elnamespace}-scrollbar {
        height: 395px;
        overflow-y: auto;
    }
}
</style>
