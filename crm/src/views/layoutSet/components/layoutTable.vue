<!-- 布局表格 -->
<template>
    <div class="layoutTable">
        <!-- header -->
        <div class="layoutTable-header">
            <!-- title -->
            <div class="layoutTable-title">{{ config.title }}</div>

            <!-- 分配布局 -->
            <el-button
                v-if="config.btnList.includes('distribute')"
                @click="distributeLayout"
                class="useBrandColor"
            >{{ config.lang?.distribute || t('layout.distributeLayout') }}</el-button>
            <!-- 新建布局 -->
            <el-button
                v-if="config.btnList.includes('new')"
                type="primary"
                @click="createLayout"
            >{{ config.lang?.new || (config.key === 'tablePageView' ? $t('layout.createView') : $t('layout.createLayout')) }}</el-button>
        </div>

        <!-- body -->
        <div
            class="layoutTable-body"
        >
            <!-- 表格 -->
            <el-table
                :data="tableData"
                stripe
                show-overflow-tooltip
                :tooltip-options="{ appendTo: 'body' }"
                class="layoutTable-table"
            >
                <!-- 成员名 -->
                <el-table-column
                    v-for="column in config.columns"
                    :key="column.prop"
                    :prop="column.prop"
                    :label="column.label"
                    :formatter="column.formatter"
                    :width="column.width"
                >
                    <!-- 操作列 -->
                    <template
                        v-if="column.prop === 'operate'"
                        #default="{ row }"
                    >
                        <!-- 编辑 -->
                        <el-link
                            v-if="config.btnList.includes('edit')"
                            type="primary"
                            @click="editLayout(row)"
                        >
                            {{ $t('edit') }}
                        </el-link>
                        <!-- 复制 -->
                        <el-link
                            v-if="config.btnList.includes('copy')"
                            type="primary"
                            @click="copyLayout(row)"
                        >
                            {{ $t('copyNcreate') }}
                        </el-link>
                        <!-- 删除 -->
                        <el-link
                            v-if="config.btnList.includes('delete') && !row.defaultFlag"
                            type="primary"
                            @click="deleteLayout(row)"
                        >
                            {{ $t('delete') }}
                        </el-link>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup>
import { ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// props
const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        }
    },
    layoutData: {
        type: Object,
        default() {
            return {};
        }
    }
});
// 定义 emit
const emits = defineEmits([
    'distributeLayout',
    'createLayout',
    'editLayout',
    'copyLayout'
]);

const config = toRef(props, 'config');

// 多语言
const { t } = useI18n();

// 分配布局
const distributeLayout = (data) => {
    emits('distributeLayout', props.config);
};
// 新建布局
const createLayout = () => {
    emits('createLayout', props.config);
};

// 表格
// 表格数据
const tableData = ref([]);
// 处理表格数据
const handleTableData = (data) => {
    if (!(data && Array.isArray(data.layoutDetail))) return [];

    return data.layoutDetail;
};

// 表格操作
// 编辑
const editLayout = (row) => {
    emits('editLayout', props.config, row);
};
// 编辑
const copyLayout = (row) => {
    emits('copyLayout', props.config, row);
};
// 删除
const deleteLayout = (row) => {
    emits('deleteLayout', props.config, row);
};

// 请求数据 + 操作完毕后控制数据刷新
watch(
    () => props.layoutData,
    (val) => {
        tableData.value = handleTableData(val);
    },
    {
        immediate: true
    }
);
</script>

<style lang="scss" scoped>
.layoutTable {
    &-header {
        display: flex;
        padding-right: 24px;
    }

    &-title {
        flex: 1;
        font-size: 15px;
        font-weight: bold;
    }
}
</style>