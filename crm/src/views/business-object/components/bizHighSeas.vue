<!-- 自定义权限规则 -->
<template>
    <div
        v-loading="loading"
        class="highSeasSet"
    >
        <!-- body -->
        <div class="highSeasSet-body">
            <h1 style="color: red;line-height: 1;width: 33px;">别测 &nbsp; 还在联调</h1>

            <!-- 左侧目录 -->
            <div class="highSeasSet-menu">
                <el-scrollbar max-height="100%">
                    <el-menu
                        :default-active="curMenuId"
                        @select="handleMenuSelect"
                    >
                        <template
                            v-for="item in menuList"
                            :key="item.compoName"
                        >
                            <!-- 子目录 -->
                            <el-sub-menu
                                v-if="item.children?.length"
                                :index="item.compoName"
                            >
                                <!-- title -->
                                <template #title>{{ item.title }}</template>
                                <!-- 目录项 -->
                                <el-menu-item
                                    v-for="childItem in item.children"
                                    :key="childItem.compoName"
                                    :index="childItem.compoName"
                                >{{ childItem.title }}</el-menu-item>
                            </el-sub-menu>
                            <!-- 正常目录项 -->
                            <el-menu-item
                                v-else
                                :index="item.compoName"
                            >{{ item.title }}</el-menu-item>
                        </template>
                    </el-menu>
                </el-scrollbar>
            </div>

            <!-- 右侧内容 -->
            <div class="highSeasSet-panel">
                <component
                    v-if="compoList[curMenuId]"
                    :is="compoList[curMenuId]"
                    :currentSettingRow="props.currentSettingRow"
                ></component>
            </div>
        </div>
    </div> 
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
const pageHeight = ref('calc(100vh - 171px)');
import autoReturnRule from '@/views/high-seas/autoReturnRule.vue';
import highSeasGroup from '@/views/high-seas/highSeasGroup.vue';
import excludeRule from '@/views/high-seas/excludeRule.vue';
import claimRule from '@/views/high-seas/claimRule.vue';

// 组件 options
defineOptions({
    name: 'highSeasSet-index'
});
// props
const props = defineProps(['currentSettingRow']);

// 全局
// loading
const loading = ref(false);
// 多语言
const { t } = useI18n();

// 左侧目录
// 当前目录 id
const curMenuId = ref('highSeasGroup');
// 目录列表
const menuList = ref([
    {
        title: t('highSeas.highSeasGroup'),
        compoName: 'highSeasGroup'
    },
    {
        title: t('highSeas.backToHighSeasRule'),
        compoName: '退公海规则',
        children: [
            {
                title: t('highSeas.excludeRule'),
                compoName: 'excludeRule'
            },
            {
                title: t('highSeas.autoReturnRule'),
                compoName: 'autoReturnRule'
            }
        ]
    },
    {
        title: t('highSeas.claimRule'),
        compoName: 'claimRule'
    }
]);
// 目录对应组件集合
const compoList = {
    highSeasGroup,
    autoReturnRule,
    excludeRule,
    claimRule
};
// 选中目录
const handleMenuSelect = (val) => {
    curMenuId.value = val;
};

// 请求数据
// getData();
</script>

<style lang="scss" scoped>
.highSeasSet {
    height: v-bind(pageHeight);
    padding: 0;

    &-body {
        display: flex;
        height: 100%;
        border-left: 1px solid var(--#{$elnamespace}-border-color-light);
    }

    &-menu {
        width: 200px;
        height: 100%;
        border-top: 1px solid var(--#{$elnamespace}-border-color-light);
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
        width: 0;
    }
}
</style>