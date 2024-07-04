<template>
    <div class="business-object">
        <component
            :is="componentMap[compoName]"
            v-model:currentComponent="compoName"
            v-model:isSystemBizObj="isSystemBizObj"
        ></component>
    </div>
</template>

<script setup>
import { ref, watch, provide } from 'vue';
import businessObject from './businessObject.vue';
import businessObjectSetting from './businessObjectSetting.vue';

// 当前显示的组件
const compoName = ref('businessObject');

// 当前是否是系统业务对象
const isSystemBizObj = ref(true);
// 传递给子组件
provide('isSystemBizObj', isSystemBizObj);

// 当前选中的行
const currentSettingRow = ref({});
// 传递给子组件， 选中行的数据
provide('currentSettingRow', currentSettingRow);

// 组件映射
const componentMap = {
    businessObject,
    businessObjectSetting
};

// // 监听 compoName 的变化, 动态加载组件
// watch(compoName, (val) => {
//     if (val) {
//         typeof val === 'string' && (compoName.value = componentMap[val]);
//     }
// });

</script>

<style lang="scss" scoped>
.business-object {
    // height: calc(100vh - 56px);
    background-color: #FFFFFF;
    padding: 20px 0 20px 24px;
}
</style>
