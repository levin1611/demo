<!-- 自定义权限规则 -->
<template>
    <div
        v-loading="loading"
        class="permRule"
    >
        <!-- body -->
        <div class="permRule-body">
            <!-- 左侧目录 -->
            <div class="permRule-menu">
                <el-scrollbar max-height="100%">
                    <!-- 选择业务对象类型 -->
                    <el-menu
                        v-if="bizObjList.length"
                        :default-active="curBizObjId"
                        @select="selectBizObj"
                    >
                        <el-menu-item
                            v-for="item in bizObjList"
                            :key="item.entityKey"
                            :index="`${item.entityKey}`"
                        >{{ locale === 'zh' ? item.entityName : item.entityName }}</el-menu-item>
                    </el-menu>
                </el-scrollbar>
            </div>

            <!-- 右侧内容 -->
            <div class="permRule-panel">
                <component 
                    :currentSettingRow="props.currentSettingRow"
                    :is="detailPage[curBizObjId]">
                </component>
              
            </div>
        </div>
    </div> 
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
const pageHeight = ref('calc(100vh - 171px)');
import landingPage from '@/views/conversion/landingPage.vue';
import mapping from '@/views/conversion/mapping.vue';
import condition from '@/views/conversion/condition.vue';
import convertObject from '@/views/conversion/convertObject.vue';
import updateData from '@/views/conversion/updateData.vue';


// 组件 options
defineOptions({
    name: 'permRule-index'
});
const props = defineProps(['currentSettingRow']);
const detailPage = {
    5: landingPage,
    2: mapping,
    4: condition,
    1: convertObject,
    3: updateData
};
// 取当前显示的语种
const { locale } = useI18n();

// 全局变量
const loading = ref(false);

// 左侧目录
// 当前业务对象 id
const curBizObjId = ref('1');
// 当前业务对象
const curBizObj = ref({});
// 业务对象列表
const bizObjList = ref([
    {
        entityName: '转化对象',
        entityKey: 1
    },
    // {
    //     entityName: '字段映射',
    //     entityKey: 2
    // },
    {
        entityName: '数据更新方式',
        entityKey: 3
    },
    {
        entityName: '转化条件',
        entityKey: 4
    },
    {
        entityName: '转化后落地页',
        entityKey: 5
    }
]);
// 选中业务对象
const selectBizObj = (val) => {
    curBizObjId.value = val;
    curBizObj.value = bizObjList.value.find(item => item.entityKey === val);
};

function getTabs() {
    if (props.currentSettingRow?.apiKey == 'touchPointContact') {
        // 触点联系人 不要显示转化后落地页
        bizObjList.value.forEach((item, index) => {
            // 删除数组中索引index 的元素
            if (item.entityName == '转化后落地页') {
                bizObjList.value.splice(index, 1);
            }
        });
    }
}
getTabs();
// 请求数据
// getData();
</script>

<style lang="scss" scoped>
@use '@/style/tablePage.scss' as tablePage;

.permRule {
    display: flex;
    flex-direction: column;
    @include tablePage.tablePage();
    height: v-bind(pageHeight);
    padding: 0;

    &-tip {
        font-size: 12px;
        margin-bottom: 12px;
    }

    &-body {
        display: flex;
        flex: 1;
        border: 1px solid var(--#{$elnamespace}-border-color-light);
        border-right: 0;
        border-bottom: none;
    }

    &-menu {
        width: 200px;
        height: 100%;
        border-right: 1px solid var(--#{$elnamespace}-border-color-light);

        ::v-deep .#{$elnamespace}-menu {
            border: none;

            &-item {
                height:40px;
                &.is-active {
                    background-color: #f5f7fa;
                    font-weight: 700
                }
                &:hover{
                    background-color: #f5f7fa;
                }
            }
        }
    }

    &-panel {
        flex: 1;

        ::v-deep .#{$elnamespace}-table {
            height: 100%;

            &__inner-wrapper {
                &::before {
                    height: 0;
                }
            }
        }
    }
}
</style>