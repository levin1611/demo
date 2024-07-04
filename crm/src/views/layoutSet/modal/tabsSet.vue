<!-- 标签页设置 弹框 -->
<template>
    <el-dialog
        v-model="visible"
        :title="$t('layout.tabPageSet')"
        width="600px"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @opened="handleOpen"
        @closed="handleClosed"
        class="tabsSet"
    >
        <!-- loading 用的无意义 div -->
        <div ref="dialogBodyRef"></div>

        <!-- Table -->
        <el-table
            :data="tableData"
            max-height="45vh"
            :show-overflow-tooltip="{ showAfter: 500 }"
            ref="tableRef"
            class="tabsSet-table"
        >
            <!-- 空数据插槽 -->
            <template #empty>
                <default-empty />
            </template>

            <!-- 拖拽句柄列 -->
            <el-table-column
                :label="''"
                :width="40"
            >
                <template #default>
                    <svg
                        aria-hidden="true"
                        class="svg-icon tabsSet-table-dragIcon"
                    >
                        <use xlink:href="#custom-yidong"></use>
                    </svg>
                </template>
            </el-table-column>
            <!-- 名称 -->
            <el-table-column
                prop="tagName"
                :label="$t('layout.tabPageName')"
                class-name="tabsSet-table-nameCol"
            >
                <template #default="{ row }">
                    <!-- 编辑状态 -->
                    <el-input
                        v-if="row.editFlag"
                        v-model="editingInputVal"
                        maxlength="20"
                        ref="editInputRef"
                        class="tabsSet-table-nameInput"
                    ></el-input>
                    <!-- 非编辑状态 -->
                    <div
                        v-else
                        class="tabsSet-table-nameShow"
                    >
                        <!-- 名称 -->
                        <el-text
                            class="truncate"
                        >{{ row.tagName }}</el-text>
                        <!-- 编辑按钮 -->
                        <span>
                            <svg
                                aria-hidden="true"
                                class="svg-icon"
                                @click="editRow(row)"
                            >
                                <use xlink:href="#custom-edit-2"></use>
                            </svg>
                        </span>
                    </div>
                </template>
            </el-table-column>
            <!-- 操作 -->
            <el-table-column
                :label="$t('operate')"
            >     
                <template #default="{ row, $index }">
                    <!-- 编辑中 -->
                    <template
                        v-if="row.editFlag"
                    >
                        <!-- 保存 -->
                        <el-link
                            type="primary"
                            @click="saveEditVal(row)"
                        >{{ $t('save') }}</el-link>
                        <!-- 取消 -->
                        <el-link
                            type="primary"
                            @click="cancelEdit(row)"
                        >{{ $t('cancel') }}</el-link>
                    </template>
                    <!-- 非编辑状态 -->
                    <template
                        v-else
                    >
                        <!-- 配置 -->
                        <el-link
                            type="primary"
                            @click="configRow(row)"
                        >{{ $t('config') }}</el-link>
                        <!-- 删除 -->
                        <el-link
                            v-if="row.deleteConfigFlag"
                            type="primary"
                            @click="deleteRow(row, $index)"
                        >{{ $t('delete') }}</el-link>
                    </template>
                </template>
            </el-table-column>
        </el-table>

        <!-- footer -->
        <template #footer>
            <div class="tabsSet-footer">
                <!-- left -->
                <div class="tabsSet-footer-left">
                    <!-- 添加新标签页 -->
                    <el-link
                        type="primary"
                        @click="addRow"
                        class="tabsSet-addPage"
                    >{{ $t('layout.addNewTabPage') }}</el-link>
                </div>
                <!-- right -->
                <div class="tabsSet-footer-right">
                    <!-- cancel -->
                    <el-button
                        @click="visible = false"
                        class="useBrandColor"
                    >{{ $t('cancel') }}</el-button>
                    <!-- save -->
                    <el-button
                        type="primary"
                        @click="submit"
                    >{{ $t('save') }}</el-button>
                </div>
            </div>
        </template>
    </el-dialog>

    <!-- 标签页组件配置弹框 -->
    <tabCompoSet
        v-model:visible="visible_config"
        v-model:loading="loading_config"
        :layoutObjectId="props.settings.objectId"
        :allTabs="tableData"
        :curTabData="editingRow"
        @save="saveTabCompoConfig"
    ></tabCompoSet>
</template>

<script setup>
import { ref, toRef, toRaw, nextTick, watch } from 'vue';
import { useSortable } from '@vueuse/integrations/useSortable';
import { useI18n } from 'vue-i18n';
import useElDialogLoading from '@/hooks/useElDialogLoading';
import tabCompoSet from './tabCompoSet.vue';

// 定义 model
const visible = defineModel('visible', { type: Boolean, default: false });
// 接受外部传参
const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    settings: {
        type: Object,
        default: () => ({})
    }
});
// 定义 emit
const emits = defineEmits([
    'update:loading',
    'update:settings',
    'save'
]);

const { t } = useI18n();

// 全局变量
// loading
const loading = toRef(props, 'loading');

// 处理 loading 逻辑
// 暂存 dialog DOM
let dialogEl;
// 取 dialog 组件 body ref
const dialogBodyRef = ref(null);

// 数据处理
const handleData = (data = {}) => {
    const { layoutTagList } = data;

    // 非数组, return
    if (!Array.isArray(layoutTagList)) {
        tableData.value = [];
        return;
    }

    // 表格数据赋值
    tableData.value = JSON.parse(JSON.stringify(layoutTagList)).slice(0, 20);
};

// 弹框打开关闭回调
// 弹框打开后 --- 外部是用的动态组件调用, 首次打开弹框 open 回调不生效, 改用 opened
const handleOpen = () => {
    // 处理 loading 逻辑
    // 如果之前没获取过 dialog DOM, 说明是首次 open
    if (!dialogEl) {
        // 获取 dialog DOM
        ({ dialogEl } = useElDialogLoading(dialogBodyRef, loading));
    }

    // 设置拖拽
    nextTick(() => {
        initSort();
    });
};
// 弹框关闭后
const handleClosed = () => {
    // 拖拽实例已存在, 则先销毁旧实例
    if (tableSortable.value) {
        tableSortable.value.stop();
    }

    // 清除数据
    clearData();
};
// 清除数据
const clearData = () => {
    tableData.value = [];
    editingRow.value = {};
    editingInputVal.value = '';
};

// 表格
// 表格 ref
const tableRef = ref(null);
// 表格数据
const tableData = ref([]);

// 表格拖拽
// 拖拽 sortable 实例
const tableSortable = ref(null);
// 设置拖拽
const initSort = () => {
    // 获取表格 DOM
    const tbodyEl = tableRef.value.$el.querySelector('tbody');
    tableSortable.value = useSortable(tbodyEl, tableData, {
        group: {
            name: 'tagName',
            pull: false,
            put: false
        },
        handle: '.tabsSet-table-dragIcon',
        animation: 120,
        onEnd: onSortEnd
    });
};
// 拖拽完毕回调
const onSortEnd = async ({ newIndex, oldIndex }) => {
    // sortable 改完源数据后, 暂存 + 置空源数据
    await nextTick();
    const tmp = tableData.value;
    tableData.value = [];

    // 重新赋值 tableData , 触发 el-table 视图刷新
    await nextTick();
    tableData.value = tmp;
};

// 表格按钮
// 编辑
// 编辑中的行数据
const editingRow = ref({});
// 编辑 input
const editInputRef = ref(null);
// 编辑 input value
const editingInputVal = ref('');
// 编辑行
const editRow = (row) => {
    // 编辑中，弹提示 + return
    if (editingRow.value.editFlag) {
        ElMessage.error(t('layout.error_isEditing'));
        return;
    }

    // 显示编辑框
    row.editFlag = 'edit';
    editingRow.value = row;
    editingInputVal.value = row.tagName.trim().slice(0, 20);
    // 自动聚焦
    nextTick(() => {
        editInputRef.value.focus();
    });
};
// 保存编辑
const saveEditVal = () => {
    // 如果标签名为空, 报错 + return false
    if (!editingInputVal.value.trim()) {
        ElMessage.error(t('layout.error_tabPageNameEmpty'));
        return false;
    }

    // // 如果表中已存在此标签名, 报错 + return false --- 产品说允许重名
    // if (tableData.value.some(row => !row.editFlag && (row.tagName === editingInputVal.value))) {
    //     ElMessage.error(t('layout.error_tabPageNameExisted'));
    //     return false;
    // }

    // 更新数据
    editingRow.value.tagName = editingInputVal.value.trim().slice(0, 20);
    // 隐藏编辑框 + 重置数据等
    delete editingRow.value.editFlag;
    editingRow.value = {};
    editingInputVal.value = '';

    // 操作完毕, 给外部返回 true (目前没用到)
    return true;
};
// 取消编辑
const cancelEdit = () => {
    // 如果是新增的行，则删除
    if (editingRow.value.editFlag === 'add') {
        tableData.value = tableData.value.filter((item) => item.editFlag !== 'add');
    }

    // 重置数据
    delete editingRow.value.editFlag;
    editingRow.value = {};
    editingInputVal.value = '';
};
// 配置行
const configRow = (row) => {
    editingRow.value = row;
    visible_config.value = true;
};
// 删除行
const deleteRow = (row, index) => {
    tableData.value.splice(index, 1);
};
// 添加行
const addRow = () => {
    // 编辑中，弹提示 + return
    if (editingRow.value.editFlag) {
        ElMessage.error(t('layout.error_isEditing'));
        return;
    }
    // 行数是否已达上限
    if (tableData.value.length >= 20) {
        ElMessage.error(t('layout.error_tabNumExceed'));
        return;
    }

    // 新行空白数据
    const newRowData = {
        tagId: '',
        tagName: '',
        defaultFlag: false,
        moduleList: [],
        editFlag: 'add',
        deleteConfigFlag: true
    };
    // 添加新行到表格
    tableData.value.push(newRowData);
    // 设置新行为编辑行
    editingRow.value = newRowData;
    editingInputVal.value = '';
    // 编辑框滚动到视口 + 自动聚焦
    nextTick(() => {
        tableRef.value.scrollTo(999999999);
        editInputRef.value.focus();
    });
};

// 配置 tab 下的组件 弹框
const visible_config = ref(false);
const loading_config = ref(false);
// 保存 tab 下的组件
const saveTabCompoConfig = async ({ moduleList }) => {
    editingRow.value.moduleList = moduleList;
    visible_config.value = false;
};

// footer
// 点击提交按钮
const submit = async () => {
    // 编辑中，弹提示 + return
    if (editingRow.value.editFlag) {
        ElMessage.error(t('layout.error_isEditing'));
        return;
    }

    // 传给父组件保存
    emits('save', {
        layoutTagList: toRaw(tableData.value)
    });
};

// open 回调不触发, opened 回调里处理数据会导致页面闪烁, 因此监听 visible: true 来处理数据
watch(
    () => visible.value,
    (val) => {
        if (val) {
            // 处理数据
            handleData(props.settings);
        }
    },
    {
        immediate: true
    }
);
</script>

<style lang="scss" scoped>
.tabsSet {
    &-table {
        ::v-deep &-dragIcon {
            cursor: move;
        }

        ::v-deep &-nameCol {
            padding: 0;
        }

        ::v-deep &-nameInput {
            margin: 3px 0;
        }

        ::v-deep &-nameShow {
            display: flex;

            svg {
                visibility: hidden;
                margin-left: 5px;
                cursor: pointer;
            }

            &:hover {
                svg {
                    visibility: visible;
                }
            }
        }

        &-addPage {
            float: left;
        }
    }

    &-footer {
        display: flex;

        &-right {
            flex: 1;
        }
    }
}
</style>
