<!-- 阶段流程单个 UI 组件 -->
<template>
    <div
        v-loading="loading"
        class="stageFlowItem"
    >
        <!-- title -->
        <div class="stageFlowItem-title">{{ title }}</div>

        <!-- 关键事件 -->
        <div class="stageFlowItem-keyEvt">
            <!-- header -->
            <div class="stageFlowItem-keyEvt-header">
                <!-- title -->
                <span class="stageFlowItem-keyEvt-title">{{ $t('opporStage.keyEvt') }}</span>

                <!-- 添加关键事件 -->
                <el-button
                    type="primary"
                    @click="handleAddKeyEvt"
                >{{ $t('opporStage.addKeyEvt') }}</el-button>
            </div>

            <!-- table -->
            <el-table
                ref="keyEvtTableRef"
                :data="keyEvtList"
                stripe
                :max-height="400"
                height="100%"
                highlight-current-row
                :show-overflow-tooltip="{ showAfter: 500, width: 600 }"
                class="stageFlowItem-keyEvt-table"
            >
                <!-- 空数据视图 -->
                <template #empty>
                    <default-empty />
                </template>

                <!-- 拖动排序 -->
                <el-table-column
                    :width="40"
                >
                    <i class="custom custom-yidong cursor-move"></i>
                </el-table-column>
                <!-- 其他正常列 -->
                <el-table-column
                    v-for="item in keyEvtTableCols"
                    :key="item.prop"
                    :prop="item.prop"
                    :label="$t(item.label)"
                    :width="item.width"
                    :minWidth="item.minWidth"
                    :formatter="item.formatter"
                ></el-table-column>
                <!-- 操作列 -->
                <el-table-column
                    prop="operate"
                    :label="$t('operate')"
                    :width="120"
                >
                    <template
                        #default="{ row }"
                    >
                        <!-- 编辑 -->
                        <el-link
                            type="primary"
                            @click="handleEditKeyEvt(row)"
                        >{{ $t('edit') }}</el-link>
                        <!-- 删除 -->
                        <el-link
                            v-if="row.status !== 0"
                            type="primary"
                            @click="handleDelKeyEvt(row)"
                        >{{ $t('delete') }}</el-link>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 关键信息 -->
        <!-- <div class="stageFlowItem-keyInfo">
            <!~~ header ~~>
            <div class="stageFlowItem-keyInfo-header">
                <!~~ title ~~>
                <span class="stageFlowItem-keyInfo-title">{{ $t('opporStage.keyInfo') }}</span>
            </div>

            <!~~ select ~~>
            <el-select
                ref="keyInfoRef"
                multiple
                :placeholder="keyInfoList.length ? '' : $t('selectPlaceholder')"
                suffix-icon=""
                popper-class="hidden"
                @click="handleClickKeyInfoList"
                class="stageFlowItem-keyInfo-select"
            >
                <template #tag>
                    <el-tag
                        v-for="(item, index) in keyInfoList"
                        :key="item.id"
                        type="info"
                        closable
                        @close="handleDelKeyInfo(item, $event)"
                        class="stageFlowItem-keyInfo-item"
                    >{{ item.displayName }}</el-tag>
                </template>
            </el-select>
        </div>-->
    </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import useCreateElTableSortable from '@/hooks/elTableSort.js';
import { ElMessage } from 'element-plus';

// model
const itemData = defineModel('itemData');
// props
const props = defineProps({
    // 当前流程在列表中的 index
    itemIndex: {
        type: Number
    },
    // 排序结束调用的方法
    sortEndFuc: {
        type: Function
    }
});
// emits
const emits = defineEmits([
    'addKeyEvt',
    'editKeyEvt',
    'delKeyEvt',
    'sortKeyEvt',
    'clickKeyInfo',
    'updateKeyInfo'
]);

// 全局
// loading
const loading = ref(false);
// 多语言
const { t } = useI18n();

// 数据处理
const handleData = () => {
    // 关键事件
    keyEvtList.value = Array.isArray(itemData.value.opportunityStageEventListRespList) ? itemData.value.opportunityStageEventListRespList : [];

    // 关键信息
    keyInfoList.value = Array.isArray(itemData.value.keyFields) ? itemData.value.keyFields : [];

    // 创建排序实例
    setTimeout(() => {
        if (!sortInstance.value) {
            sortInstance.value = useCreateElTableSortable(keyEvtTableRef, {
                onStart: () => {
                    emits('sortKeyEvt');
                },
                onEnd: props.sortEndFuc
            });
        }
    }, 0);
};

// title
const title = computed(() => {
    return `${`${props.itemIndex + 1}`.padStart(2, '0')} ${itemData.value.name} ${itemData.value.winProbability || 0}% (${itemData.value.notAssignedWinProbability || 0}%)`;
});

// 关键事件
// 数据
const keyEvtList = ref([]);
// 表格列
const keyEvtTableCols = ref([
    {
        label: 'opporStage.evtName',
        prop: 'name',
        minWidth: 260
    },
    {
        label: 'opporStage.winProbability',
        prop: 'winProbability',
        minWidth: 200,
        formatter: (row) => {
            return `${row.winProbability}%`;
        }
    },
    {
        label: 'opporStage.uploadDoc',
        prop: 'uploadDoc',
        minWidth: 200,
        formatter: (row) => {
            return row.fileUsageFlag > 0
                ? t('yes')
                : t('no');
        }
    },
    {
        label: 'opporStage.mustFillInDoc',
        prop: 'mustFillInDoc',
        minWidth: 200,
        formatter: (row) => {
            return row.fileUsageFlag === 2
                ? t('yes')
                : t('no');
        }
    },
    {
        label: 'remark',
        prop: 'description',
        minWidth: 200
    }
]);

// 排序
// 排序表格 ref
const keyEvtTableRef = ref(null);
// 排序实例
const sortInstance = ref(null);

// 事件处理
const handleAddKeyEvt = () => {
    // 上限 20 条
    if (keyEvtList.value.length >= 20) {
        ElMessage.warning(t('opporStage.tip_keyEvtLengthOverLimit'));
        return;
    }

    emits('addKeyEvt');
};
const handleDelKeyEvt = (row) => {
    emits('delKeyEvt', row);
};
const handleEditKeyEvt = (row) => {
    emits('editKeyEvt', row);
};

// 关键信息
// 数据
const keyInfoList = ref([]);
// 选框 ref
const keyInfoRef = ref(null);
// 事件处理
// 点击选框
const handleClickKeyInfoList = () => {
    // 传递选框 ref 到外部, 作为虚拟 ref 触发 poppover 显示
    emits('clickKeyInfo', keyInfoRef.value);
};
// 删除关键信息 tag
const handleDelKeyInfo = (keyInfoItem, mouseEvt) => {
    mouseEvt.stopPropagation();
    // 要求外部更新关键信息数据, 发送 newVal , oldVal 供外部更新数据/更新失败回退到原始数据
    emits('updateKeyInfo', keyInfoList.value.filter(i => i.id !== keyInfoItem.id), itemData.value.keyFields);
};

// 初始化
// 解析传入数据
handleData();

// 生命周期
onBeforeUnmount(() => {
    // 销毁排序实例
    if (sortInstance.value) {
        sortInstance.value.destroy();
    }
});

// 监听数据变更, 更新视图
watch(
    [
        () => itemData.value.opportunityStageEventListRespList,
        () => itemData.value.keyFields
    ],
    () => {
        handleData();
    }
);
</script>

<style lang="scss" scoped>
.stageFlowItem {
    border: 1px solid var(--#{$elnamespace}-border-color-light);
    margin-bottom: 20px;

    &-title {
        padding: 11px 20px;
        background: #F6F6F6;
        font-weight: 600;
        color: var(--#{$elnamespace}-text-color-primary);
    }

    &-keyEvt {
        &-header {
            display: flex;
            padding: 16px 20px 12px;
            font-weight: 600;
            color: var(--#{$elnamespace}-text-color-primary);
        }

        &-title {
            flex: 1;
        }
    }

    &-keyInfo {
        padding: 16px 20px;

        &-header {
            margin-bottom: 12px;
            font-weight: 600;
            color: var(--#{$elnamespace}-text-color-primary);
        }
    }
}
</style>

<style lang="scss">
.stageFlowItem-keyInfo-select {
    margin-bottom: 4px;
}
</style>