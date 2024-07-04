<template>
    <el-tree-v2
        ref="treeRef"
        show-checkbox 
        @check-change="checkChange"
        :expand-on-click-node="false"
        :data="data"
        :check-strictly="checkStrictly"
        :filter-method="filterNode"
        :props="{ children: 'children', label: 'name'}"
        :height="250"
    />
</template>

<script setup>
import { watch } from 'vue';
import {ref, computed, onMounted, toRefs, onUnmounted, nextTick, watchEffect} from 'vue';
const treeRef = ref();
const props = defineProps({
    data: {
        default: () => {
            return [];
        }
    },
    defaultcheckedkeys: {
        // 默认选中的数组
        default: () => {
            return [];
        }
    },
    defaultexpandedkeys: {
        // 默认展开的节点
        default: () => {
            return [30];
        }
    },
    filterText: {
        // 筛选字段
        default: ''
    },
    checkStrictly: {
        default: true
    },
    vest: {
        // 马甲
        default: ''
    }
});
const emits = defineEmits([
    'checkChange'
]);
const { data, defaultcheckedkeys, filterText, checkStrictly, vest} = toRefs(props);

watch(filterText, (val) => {
    treeRef.value && treeRef.value.filter(val);
});
const filterNode = (value, data, node) => {
    // select 前端筛选逻辑
    if (!value) return true;
    return data.searchName.toLocaleUpperCase().includes(value.toLocaleUpperCase());
};
function checkChange(data, check) {
    // // 复选框被点击的时候调用
    emits('checkChange', {data, check});
}

const forMateIds = computed(() => {
    // 将vest_id 解析一下 取出 当前vest下选中的id并且回显
    let temp = [];
    defaultcheckedkeys.value.forEach(ele => {
        const vestAndId = ele.split('_');
        if (vestAndId[0] == vest.value) {
            temp.push(Number(vestAndId[1]));
        }
    });
    return temp;
});
watch(forMateIds, (v) => {
    // 监听变化设置选中
    treeRef.value.setCheckedKeys(forMateIds.value);
});

let stopWatchData = watch(data, (v) => {
    // 监听变化设置选中
    if (treeRef.value && data.value) {
        setTimeout(() => {
            treeRef.value.setCheckedKeys(forMateIds.value);
            stopWatchData();
        });
    }
}, {immediate: true});

</script>

<style lang="scss" scoped>
    :deep{
        .#{$elnamespace}-tree-node__label{
                color: #303133;
                font-weight: 400;
        }
    }
</style>
