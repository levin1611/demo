import { useElementSize } from '@vueuse/core';
import { computed } from 'vue';
// px 表格页面调用的话  默认减少175像素
export const useTableHeight = function(px = 175) {
    // single-page-con是基座中的容器视图
    const { width, height} = useElementSize(document.querySelector('.single-page-con') || document.body);
    const tHeight = computed(() => height.value - px);
    return {tHeight, tWidth: width, height, width };
};