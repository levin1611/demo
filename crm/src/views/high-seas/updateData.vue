<!-- 自定义权限规则 Tab -->
<template>
    <div class="permRuleTable">
        <!-- header -->
        <div class="permRuleTable-header">
            <!-- title -->
            <div class="permRuleTable-title">
                当线索关联已存在的客户/联系人后，客户、联系人字段的映射内容更新设置
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
                max-height="calc(100% - 50px)"
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
                            v-model="row.config"
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
import { ref, toRefs, watch, computed, onMounted } from 'vue';
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
        name: '此配置项不存在',
        id: 0
    },
    {
        name: '只更新空字段',
        id: 1
    },
    {
        name: '覆盖更新',
        id: 2
    },
    {
        name: '不更新',
        id: 3
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
        appName: '客户',
        config: ''
    },
    {
        appName: '联系人',
        config: ''
    },
    {
        appName: '商机',
        config: ''
    }
]);
// 表格列
const tableColumns = [
    {
        label: '对象类型',
        prop: 'appName',
        width: '250px'
    },
 
    {
        label: '字段更新方式',
        prop: 'config'
    }
];

function getDataList() {
    queryConversionRuleModeAndLandingPage({
        apiKey: apiKey.value
    }).then(res => {
        // console.log(res);
        if (res.code == 10000 && res.data) {
            tableData.value[0].config = res.data.mapCustomerUpdateConfig;
            tableData.value[1].config = res.data.mapContactUpdateConfig;
            tableData.value[2].config = res.data.mapOpportunityUpdateConfig;
            emptyInit.value = false;
        } else {
            ElMessage.error(res.messageShow);
        }
    });
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
