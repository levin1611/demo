<!-- 公海设置 - 认领规则 -->
<template>
    <div
        class="claimRule"
    >
        <!-- header -->
        <div class="claimRule-header">
            <!-- title -->
            <span class="claimRule-title">{{ $t('highSeas.claimRule') }}</span> 

            <!-- switch -->
            <el-switch
                :model-value="enableFlag"
                :active-value="1"
                :inactive-value="0"
                @change="handleEnableChange"
            ></el-switch>
        </div>

        <!-- body -->
        <div class="claimRule-body">
            <!-- header -->
            <div
                class="claimRule-body-header"
            >
                <!-- tip -->
                <div
                    class="claimRule-tip"
                >{{ $t('highSeas.tip_claimRule', { objName: $t(`bizObject.${currentSettingRow.apiKey}`) }) }}</div>

                <!-- right -->
                <div class="claimRule-body-header-right">
                    <!-- 新建规则 -->
                    <el-text
                        type="primary"
                        @click="handleAddRule"
                        class="cursor-pointer"
                    >{{ $t('privatePool.addSpecialMember') }}</el-text>
                </div>
            </div>

            <!-- 规则 table -->
            <div
                class="claimRule-table"
            >
                <!-- 表格 -->
                <el-table
                    ref="tableRef"
                    :data="tableData"
                    stripe
                    max-height="calc(100% - 45px)"
                    height="100%"
                    highlight-current-row
                    show-overflow-tooltip
                    :tooltip-options="{ appendTo: 'body' }"
                    v-loading="tableLoading"
                >
                    <!-- 空数据插槽 -->
                    <template #empty>
                        <default-empty />
                    </template>

                    <!-- 表格列 -->
                    <el-table-column
                        v-for="column in tableColumns"
                        :key="column.prop"
                        :prop="column.prop"
                        :label="column.label"
                        :formatter="column.formatter"
                        :min-width="column.width"
                    >
                        <!-- 操作列 -->
                        <template
                            v-if="column.prop === 'operate'"
                            #default="{ row }"
                        >
                            <!-- 编辑 -->
                            <el-link
                                type="primary"
                                @click="handleEditRule(row)"
                            >
                                {{ $t('edit') }}
                            </el-link>
                            <!-- 删除 -->
                            <el-link
                                v-if="row.predefinedFlag !== 1"
                                type="primary"
                                @click="handleDeleteRule(row)"
                            >
                                {{ $t('delete') }}
                            </el-link>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 分页 -->
                <pagenation
                    ref="pageNationRef"
                    :parameter="pageNationParams"
                    @changeBefore="beforeChangePage"
                    @updateData="updateData"
                ></pagenation>
            </div>
        </div>
    </div>

    <!-- 新建/编辑 规则 -->
    <editClaimRule
        v-model:visible="visible_editRule"
        :operateType="curOperateType"
        :ruleData="curRuleData"
        @operateSuccess="handleOperateSuccess"
    ></editClaimRule>

    <!-- 删除规则 确认弹框 -->
    <confirmDialog
        v-model:visible="visible_deleteRule"
        :loading="loading_deleteRule"
        :title="$t('deleteConfirm')"
        :tip-content="$t('highSeas.tip_deleteRule')"
        @confirm="confirm_deleteRule"
    ></confirmDialog>
</template>

<script setup>
import { ref, inject, onMounted, h } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/pinia/modules/user.js';
import { pagenation, confirmDialog } from 'xhl_lib';
import { queryConversionRuleModeAndLandingPage } from '@/api/businessObjects';
import { getClaimRuleList, delClaimRule, updateHighSeasConfig } from '@/api/highSeas';
import editClaimRule from './modal/editClaimRule.vue';

// inject
const currentSettingRow = inject('currentSettingRow');

// 全局
// loading
const loading = ref(false);
// 多语言
const { t } = useI18n();
// 取 pinia 数据
const store = useUserStore();

// header
// 规则总开关
const enableFlag = ref(0);
// 获取总开关状态数据
const getEnableStatus = () => {
    queryConversionRuleModeAndLandingPage({
        apiKey: currentSettingRow.value.apiKey
    }).then(res => {
        if (res.code == 10000 && res.data) {
            enableFlag.value = res.data.poolClaimFlag;
        } else {
            ElMessage.error(res.messageShow);
        }
    });
};
// 总开关 change
const handleEnableChange = (val) => {
    const postData = {
        objectId: currentSettingRow.value.id,
        poolClaimFlag: enableFlag.value ? 0 : 1
    };
    updateHighSeasConfig(postData).then((res) => {
        if (res.code === 10000) {
            ElMessage.success(t('saveSuccess'));
            enableFlag.value = postData.poolClaimFlag;
        } else {
            // 异常处理
            ElMessage.error(t('operateFailed'));
        }
    }, () => {
        // 异常处理
        ElMessage.error(t('operateFailed'));
    });
};

// body - header - 右侧按钮
// 触发添加
const handleAddRule = () => {
    curRuleData.value = {};
    curOperateType.value = 'new';
    visible_editRule.value = true;
};

// 表格
// 表格 ref
const tableRef = ref(null);
// 表格数据
let tableData = ref([]);
// 表格列
const tableColumns = [
    {
        label: t('highSeas.ruleName'),
        prop: 'ruleName',
        minWidth: 300,
        formatter: (row) => {
            return t('highSeas.formerOwnerClaimLapse', { count: row.formerOwnerClaimLapse, objName: t(`bizObject.${currentSettingRow.value.apiKey}`) });
        }
    },
    {
        label: t('bizObject.applicableMembers'),
        prop: 'userNames',
        minWidth: 200,
        formatter: (row) => {
            const allUsers = row.idAndNameDtoList || [];

            // 无值, 不显示
            if (!allUsers.length) {
                return '-';
            }

            // 有值, tooltip 显示管理员名称
            const userNames = allUsers.map(item => item.name).join(',');
            return h(ElTooltip, {
                content: userNames,
                placement: 'top'
            }, [
                h('span', userNames)
            ]);
        }
    },
    {
        label: t('operate'),
        prop: 'operate',
        minWidth: 100
    }
];
// 获取表格数据 loading
const tableLoading = ref(true);
// 处理表格数据
const handleTableData = (data) => {
    if (!Array.isArray(data)) return [];

    return data;
};
// 表格操作
// 编辑
const handleEditRule = (data) => {
    curRuleData.value = data;
    curOperateType.value = 'edit';
    visible_editRule.value = true;
};
// 删除
const handleDeleteRule = (data) => {
    curRuleData.value = data;
    loading_deleteRule.value = false;
    visible_deleteRule.value = true;
};
// 表格分页
// 获取分页组件实例
const pageNationRef = ref(null);
// 分页配置
const pageNationParams = {
    methods: getClaimRuleList,
    data: {
        orgId: store.orgId,
        userId: store.userId,
        objectApiKey: currentSettingRow.value.apiKey
    }
};
// 分页请求前置处理
const beforeChangePage = () => {
    tableLoading.value = true;
};
// 分页数据请求完毕, 更新表格数据
function updateData(data) {
    tableData.value = handleTableData(data);
    tableRef.value.setScrollTop(0);
    // 取消 loading
    tableLoading.value = false;
}

// 弹框 - 新增/编辑 规则
// 当前正在操作的规则的数据
let curRuleData = ref({});
// 弹框显隐
let visible_editRule = ref(false);
// 当前操作类型
let curOperateType = ref('');
// 操作规则成功
const handleOperateSuccess = (data) => {
    // 新建成功
    if (['new'].includes(curOperateType.value)) {
        // 新建成功后, 回到第一页刷新表格显示最新规则数据
        pageNationRef.value.handleCurrentChange(1);
        return;
    }

    // 编辑成功
    if (curOperateType.value === 'edit') {
        // 更新数据
        ['formerOwnerClaimLapse', 'idAndNameDtoList'].forEach(prop => {
            curRuleData.value[prop] = data[prop];
        });
    }
};

// 弹框 - 删除规则
// 弹框显隐
let visible_deleteRule = ref(false);
// 弹框 loading
let loading_deleteRule = ref(false);
// 删除规则 确认
const confirm_deleteRule = () => {
    // 显示 loading
    loading_deleteRule.value = true;

    // 发送请求
    delClaimRule({
        id: curRuleData.value.id
    }).then((res) => {
        if (res.code === 10000) {
            // 删除成功

            // 删除成功后, 刷新表格
            pageNationRef.value.handleCurrentChange();
            // 隐藏弹框
            visible_deleteRule.value = false;
        } else {
            // 删除失败

            ElMessage.error(res.message);
        }

        // 取消 loading
        loading_deleteRule.value = false;
    });
};

// 生命周期
onMounted(() => {
    // 获取数据
    getEnableStatus();
    pageNationRef.value.handleCurrentChange(1);
});
</script>

<style lang="scss" scoped>
.claimRule {
    &-header {
        border-bottom: 1px solid var(--#{$elnamespace}-border-color-lighter);
        padding: 0 20px 4px;
    }

    &-title {
        white-space: nowrap;
        font-size: 15px;
        font-weight: 500;
        line-height: 24px;
        vertical-align: text-bottom;
        margin-right: 12px;
    }

    &-body-header {
        display: flex;
        align-items: center;
        padding: 12px 24px 8px 12px;

        &-right {
            white-space: nowrap;
        }
    }

    &-tip {
        flex: 1;
        font-size: 12px;
        line-height: 18px;
        color: #909299;
        white-space: break-spaces;
        padding-right: 24px;
    }

    &-table {
        height: calc(100vh - 295px);
    }
}
</style>
