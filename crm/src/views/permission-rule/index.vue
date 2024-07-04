<!-- 自定义权限规则 -->
<template>
    <div
        v-loading="loading"
        class="permRule"
    >
        <!-- header -->
        <div class="permRule-header">
            <div class="permRule-title">{{ $t('permRule.customPermRule') }}</div>
            <div class="permRule-tip">{{ $t('permRule.tip_permRule') }}</div>
        </div>

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
                <permRuleTable
                    :curBizObj="curBizObj"
                ></permRuleTable>
            </div>
        </div>
    </div> 
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getAllEntity } from '@/api/permRule';
import { CODESTATE } from '@/https/codeConfig';
const pageHeight = ref('calc(100vh - 56px)');

import permRuleTable from '@/views/permission-rule/components/permRuleTable';

// 组件 options
defineOptions({
    name: 'permRule-index'
});

// 取当前显示的语种
const { locale } = useI18n();

// 全局变量
const loading = ref(false);

// 左侧目录
// 当前业务对象 id
const curBizObjId = ref('');
// 当前业务对象
const curBizObj = ref({});
// 业务对象列表
const bizObjList = ref([]);
// 选中业务对象
const selectBizObj = (val) => {
    curBizObjId.value = val;
    curBizObj.value = bizObjList.value.find(item => item.entityKey === val);
};

// 右侧内容
// 获取数据 --- 临时使用其他接口, 先把页面加载出来方便其他人做其他子任务
const getData = async () => {
    // 显示 loading
    loading.value = true;

    // 接口请求
    getAllEntity().then(res => {
        if (res.code === CODESTATE.SUCCESS) {
            // 请求成功
            // 数据请求成功处理
            if (Array.isArray(res.data && res.data)) {
                bizObjList.value = res.data;
                // 选中第一个业务对象
                if (bizObjList.value.length) {
                    curBizObjId.value = `${bizObjList.value[0].entityKey}`;
                    curBizObj.value = bizObjList.value[0];
                }
            }
        } else {
            // 提示错误
            ElMessage.error(res.message);
        }

        // 关闭 loading
        loading.value = false;
    });
};

// 请求数据
getData();
</script>

<style lang="scss" scoped>
@use '@/style/tablePage.scss' as tablePage;

.permRule {
    display: flex;
    flex-direction: column;
    @include tablePage.tablePage();
    height: v-bind(pageHeight);
    padding: 25px 0px 20px 24px;

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
                height: 40px;
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