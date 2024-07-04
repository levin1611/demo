<!-- 字段设置 -->
<template>
    <div class="field-setting">
        <div class="field-setting-tab">
            <span v-for="(v, i) in tabList" :key="i" :class="{active: currentIndex === i}" @click="changeTab(v, i)">{{v.label}}</span>
            <p style="color:#606266;font-size:12px;margin-left: 12px" v-if="currentIndex === 1">通过此设置，可以管理选项型字段选项值之间的依赖关系。例：选择“父字段”A的选项值后，再选择“子字段”的选项范围</p>
        </div>
        <el-scrollbar :height="pageHeight" style="margin-top:1px">
            <KeepAlive>
                <component
                    :is="moduleSetCompoName"
                ></component>
            </KeepAlive>
        </el-scrollbar>
    </div>
</template>
<script setup>
import { ref, onMounted,  inject } from 'vue';
import dependent from './component/dependent.vue'
import fieldsList from './component/fields-list.vue'
// 接收父组件传, 当前选中的行
const currentSettingRow = inject('currentSettingRow');
// 成员和部门需要隐藏 '字段依赖性' tab
const hideTabs = ['department', 'staff'];

// 页面高度
const pageHeight = ref('calc(100vh - 172px)');

const tabList = [
    {
        label: '字段',
        name: 'field',
        component: fieldsList
    },
    {
        label: '字段依赖性',
        name: 'dependent',
        component: dependent
    }
].filter(v => !hideTabs.includes(currentSettingRow.value.apiKey));

const currentIndex = ref(0);
const moduleSetCompoName = ref(fieldsList);
const changeTab = (v, i) => {
    currentIndex.value = i;
    moduleSetCompoName.value = v.component;
}

</script>
<style lang="scss" scoped>
@use '@/style/tablePage.scss' as tablePage;
.field-setting {
    @include tablePage.tablePage();
    padding: 2px 1px 0px;
    height: v-bind(pageHeight);
    &-tab{
        span{
            position: relative;
            display: inline-block;
            padding: 4px 17px;
            color: #303133;
            cursor: pointer;
            box-shadow: 0 0 0 1px #DEDFE6;
            &.active{
                color: #4285F2;
                box-shadow: 0 0 0 1px #4285F2;
                font-weight: 500;
                z-index: 1;
            }
            &:nth-child(1) {
                border-top-left-radius: 4px;
                border-bottom-left-radius: 4px;
            }
            &:nth-child(2) {
                border-top-right-radius: 4px;
                border-bottom-right-radius: 4px;
                margin-left: 1px;
            }
        }
        p{
            display: inline-block;
        }
    }
    &-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        &-left {
        }
        &-right {
            display: flex;
            align-items: center;
        }
    }
}

</style>