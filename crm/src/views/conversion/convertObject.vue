<!-- 自定义权限规则 Tab -->
<template>
    <div class="permRuleTable">
        <!-- header -->
        <div class="permRuleTable-header">
            <!-- title -->
            <div class="permRuleTable-title">
                {{formateType(apiKey)}}
            </div>

        </div>

        <!-- body -->
        <!-- 表格初始请求无数据, 显示空 -->
        <div v-if="emptyInit" v-loading="tableLoading" class="permRuleTable-body">
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
                    :show-overflow-tooltip="
                        ['name'].includes(column.prop)
                    "
                >

                    <template
                        v-if="['customerUsageFlag'].includes(column.prop)"
                        #default="{ row, column}"
                    >
                        <el-radio-group v-model="row[column['property']]" class="ml-4">
                            <el-radio  disabled :value="1">必填</el-radio>
                        </el-radio-group>
                    </template>
                    <template
                        v-else-if="['opportunityUsageFlag', 'contactUsageFlag'].includes(column.prop)"
                        #default="{ row, column}"
                    >
                        <el-radio-group v-model="row[column['property']]" class="ml-4">
                            <el-radio  disabled :value="1">必填</el-radio>
                            <el-radio  disabled :value="0">非必填</el-radio>
                        </el-radio-group>
                    </template>
                
                    <template
                        v-else-if="['customerTypeIds', 'contactTypeIds', 'opportunityTypeIds','leadTypeIds'].includes(column.prop)"
                        #default="{ row, column }"
                    >
                        <el-select
                            v-model="row[column['property']]"
                            multiple
                            collapse-tags
                            @change='updateField(row, column["property"])'
                            :value-key="'objectTypeId'"
                            collapse-tags-tooltip
                            placeholder="请选择"
                            class="custom_tag"

                        >
                            <el-option
                                v-for="item in row[selectOptions(column['property'])]"
                                :key="item.objectTypeId"
                                :label="item.name"
                                :value="item.objectTypeId"
                            />
                        </el-select>
                    </template>

                </el-table-column>
            </el-table>
        </div>
    </div>

</template>

<script setup>
import { ref, shallowRef, onMounted, computed } from 'vue';
// import { Search } from '@element-plus/icons-vue';
import {formateType} from './tools.js';
import {queryConversionRuleObject, updateConversionRuleObject} from '@/api/businessObjects';

import { useI18n } from 'vue-i18n';
import {defaultEmpty} from 'xhl_lib';
// props
const props = defineProps(['currentSettingRow']);
const apiKey = computed(() => props.currentSettingRow?.apiKey);
// 多语言
const { t } = useI18n();

const selectOptions = function(key) {
    let str = '';
    switch (key) {
        case 'customerTypeIds':
            str = 'customers';
            break;
        case 'contactTypeIds':
            str = 'contacts';
            break;
        case 'opportunityTypeIds':
            str = 'opportunity';
            break;
        case 'leadTypeIds':
            str = 'leads';
            break;    
    }
    return str;
};
// 规则列表
// 表格首次加载时数据为空
const emptyInit = ref('');
// 表格 loading
const tableLoading = ref(true);
// 表格数据
const tableData = ref([
]);
// 表格列
const tableColumns = [
    {
        label: '业务对象类型',
        prop: 'name',
        // width: '250px'
    },
    {
        label: '客户是否必填',
        prop: 'customerUsageFlag'
    },
    {
        label: '联系人是否必填',
        prop: 'contactUsageFlag'
    },
    {
        label: '商机是否必填',
        prop: 'opportunityUsageFlag'
    },
    {
        label: '客户类型映射',
        prop: 'customerTypeIds'
    },
    {
        label: '联系人类型映射',
        prop: 'contactTypeIds'
    },
    {
        label: '商机类型映射',
        prop: 'opportunityTypeIds'
    }
];

function getList() {
    queryConversionRuleObject({
        apiKey: apiKey.value
    }).then(res => {
        if (res.code == 10000) {
            tableData.value = res.data = res.data.map(item => {
                item.lastcustomerTypeIds = item.customerTypeIds;
                item.lastcontactTypeIds = item.contactTypeIds;
                item.lastopportunityTypeIds = item.opportunityTypeIds;
                item.lastleadTypeIds = item.leadTypeIds;

                return item;
            });
        } else {
            ElMessage.error(res.messageShow);
        }
        tableLoading.value = false;
    });
}

function updateField(row, key) {
    let lastTimeValue = row[`last${key}`];

    if (Array.isArray(lastTimeValue)) {
        if (row[key].length < lastTimeValue.length) {
            // 如果左边小于右边 代表 是要继续减少选项
            if (lastTimeValue.length <= 1) {
                row[key] = lastTimeValue;
                ElMessage.error('至少要选择一个类型');
                return false;
            }
        }
       
    }
    row[`last${key}`] = row[key];
    // 暂时不知道线索返回的字段是什么 所以不处理线索字段
    const data = {
        'contactTypeIds': row.contactTypeIds,
        'contactUsageFlag': row.contactUsageFlag,
        'customerTypeIds': row.customerTypeIds,
        'customerUsageFlag': row.customerUsageFlag,
        'id': row.id,
        'leadTypeIds': row.leadTypeIds,
        'leadUsageFlag': row.leadUsageFlag,
        'opportunityTypeIds': row.opportunityTypeIds,
        'opportunityUsageFlag': row.opportunityUsageFlag,
        allSelectedConsumerFlag: row.customerTypeIds?.length == row.customers?.length ? 1 : 0,
        allSelectedContactFlag: row.contactTypeIds?.length == row.contacts?.length ? 1 : 0,
        allSelectedOpportunityFlag: row.opportunityTypeIds?.length == row.opportunity?.length ? 1 : 0,
        allSelectedLeadFlag: row.leadTypeIds?.length == row.opportunity?.length ? 1 : 0
    };
    updateConversionRuleObject(data).then(res => {
        if (res.code === 10000) {
            ElMessage.success(res.messageShow);
        } else {
            ElMessage.error(res.messageShow);
        }
    });
}

function fillClounHead() {
    if (apiKey.value == 'touchPointContact') {
        tableColumns.push({
            label: '线索类型映射',
            prop: 'leadTypeIds'
        });
    }
}
fillClounHead();

onMounted(() => {
    getList();
});
</script>

<style lang="scss" scoped>
@import './style.scss';
.convertable{
    .#{$elnamespace}-table__cell {
            padding: 5px 0;
        }
}

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
