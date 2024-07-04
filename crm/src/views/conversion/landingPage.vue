<!-- 自定义权限规则 Tab -->
<template>
    <div class="permRuleTable">
        <!-- header -->
        <div class="permRuleTable-header">
            <!-- title -->
            <div class="permRuleTable-title">
                转化后落地页
            </div>

        </div>

        <!-- body -->
        <!-- 表格初始请求无数据, 显示空 -->
        <div v-if="emptyInit" class="permRuleTable-body">
            <default-empty />
        </div>
        <!-- 否则, 正常显示表格 -->
        <div class="permRuleTable-body" v-show="!emptyInit">
            <!-- 成员列表 -->
            <el-table
                :data="tableData"
                max-height="calc((100vh - 188px) - 43px)"

                height="100%"
                v-loading="tableLoading"
                stripe
                class="convertable"
            >
                <!-- 成员名 -->
                <el-table-column
                    v-for="column in tableColumns"
                    :key="column.prop"
                    :prop="column.prop"
                    :label="column.label"
                    :width="column.width"
                >
                    <template
                        v-if="column.prop === 'config'"
                        #default="{ row }"
                    >
                        <el-select-v2
                            disabled
                            :model-value="row.config"
                            :props="{
                                value: 'id',
                                label: 'name'
                            }"
                            :options="selectOptions"
                            placeholder="Please select"
                            style="width: 240px"
                        />
                    </template>

                </el-table-column>
            </el-table>

        </div>
    </div>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import {queryConversionRuleModeAndLandingPage} from '@/api/businessObjects';
// import { Search } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import {defaultEmpty} from 'xhl_lib';
const props = defineProps(['currentSettingRow']);
const apiKey = computed(() => props.currentSettingRow?.apiKey);


// 多语言
const { t } = useI18n();

const selectOptions = [
    {
        name: '线索详情页',
        id: 1
    },
    {
        name: '客户详情页',
        id: 2
    }
];
// 规则列表
// 表格首次加载时数据为空
const emptyInit = ref('');
// 表格 loading
const tableLoading = ref(false);
// 表格数据
const tableData = ref([
    {
        appName: '新建客户',
        config: ''
    },
    {
        appName: '关联已有客户',
        config: ''
    }
]);
// 表格列
const tableColumns = [
    {
        label: '转化时场景',
        prop: 'appName',
        width: '250px'
    },
 
    {
        label: '落地页',
        prop: 'config'
    }
];

function getDataList() {
    queryConversionRuleModeAndLandingPage({
        apiKey: apiKey.value
    }).then(res => {
        if (res.code == 10000 && res.data) {
            tableData.value[0].config = res.data.mapExistCustomerJumpConfig;
            tableData.value[1].config = res.data.mapNewCustomerJumpConfig;

            emptyInit.value = false;
        } else {
            ElMessage.error(res.messageShow);
        }
    });
}
function formateValue(val) {
    return val == 1 ? '线索详情页' : '客户详情页';
}
onMounted(() => {
    getDataList();
});

</script>

<style lang="scss" scoped>
@import './style.scss';

.permRuleTable {
    height: calc(100% - 40px);
    &-header {
        display: flex;
        align-items: center;
        padding: 10px;
        padding-bottom: 3px;
    }

    &-title {
        flex: 1;
    }
    &-search {
        margin-right: 10px;
    }
    &-body {
        height: 100%;
    }
    :deep {
        .page_right {
            padding-right: 22px;
        }
    }
}
</style>
