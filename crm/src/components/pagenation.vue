<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <slot></slot>
    <div class="page_right">
        <el-pagination 
            v-model:current-page="pageNo"
            v-model:page-size="pageSizeRef"
            :page-sizes="props.pageSizes"
            :background="true"
            :layout="props.layout"
            :total="totalCount"
            v-bind="attrs"
            @size-change="handleSizeChange" 
            @current-change="handleCurrentChange"
        ></el-pagination>
    </div>
</template>
<script setup>
import { reactive, ref, isRef, toRefs, watch, useAttrs } from 'vue';
import { usePage } from '@/hooks/pagenation.js';

// 接受外部传参
const props = defineProps({
    queryConfig: {
        type: Object,
        default: () => ({})
    },
    pageSizes: {
        type: Array,
        default: () => [10, 20, 50, 100]
    },
    layout: {
        type: String,
        default: 'total, sizes, prev, pager, next, jumper'
    }
});
const emit = defineEmits(['updateData', 'changeBefore']); // 修改data数据

// 接收非 props 传参, 方便在外部直接使用 el-pagination 的 props
const attrs = useAttrs();

const {queryConfig} = toRefs(props);
const { pageSizeRef, handleCurrentChange, handleSizeChange, pageNo, totalCount } = usePage(emit, queryConfig);

defineExpose({handleCurrentChange});
</script>
<style lang="scss" scoped>
.page_right{
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
}
</style>