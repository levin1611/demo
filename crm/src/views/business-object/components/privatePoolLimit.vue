<!-- 业务对象设置 - 私池上限 -->
<template>
    <div
        class="privatePoolLimit"
    >
        <!-- header -->
        <div
            class="privatePoolLimit-header"
        >
            <!-- title -->
            <div
                class="privatePoolLimit-title"
            >{{ $t('bizObject.privatePoolLimit') }}</div>
            <!-- tip -->
            <div
                class="privatePoolLimit-tip"
            >{{ $t('privatePool.tip_privatePoolLimit') }}</div>
        </div>

        <!-- 一般成员 -->
        <div
            class="privatePoolLimit-generalMember"
        >
            <!-- text -->
            <i18n-t keypath="privatePool.generalMemberText">
                <template #name>{{ currentSettingRow.displayName }}</template>
                <template #count>
                    <el-text
                        class="font-bold"
                    >{{ limitedFlag === 0 ? $t('unlimited') : maxCapacity }}</el-text>
                </template>
            </i18n-t>
            <!-- <span>{{ $t('privatePool.generalMemberText', { name: currentSettingRow.displayName, count: maxCapacity }) }}</span> -->
            <!-- icon -->
            <span
                @click.stop="handleEditCount"
                class="custom custom-edit-2 cursor-pointer"
            ></span>
        </div>

        <!-- 特殊成员 -->
        <div
            class="privatePoolLimit-specialMember"
        >
            <!-- 特殊成员 - hader -->
            <div
                class="privatePoolLimit-specialMember-header"
            >
                <!-- title -->
                <span
                    class="privatePoolLimit-specialMember-title"
                >{{ $t('privatePool.specialMemberPrivatePoolLimit') }}</span>:
                <!-- 添加特殊成员 -->
                <el-text
                    type="primary"
                    @click="handleAddSpecialMember"
                    class="cursor-pointer"
                >{{ $t('privatePool.addSpecialMember') }}</el-text>
            </div>
            <!-- 特殊成员 - table -->
            <div
                class="privatePoolLimit-specialMember-body"
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
                        :width="column.width"
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

    <!-- 设置一般成员上限 -->
    <editGeneralMember
        v-model:visible="visible_editCount"
        v-model:limitedFlag="limitedFlag"
        v-model:maxCapacity="maxCapacity"
    ></editGeneralMember>

    <!-- 新建/编辑 特殊成员规则 -->
    <editSpecialMember
        v-model:visible="visible_editRule"
        :operateType="curOperateType"
        :ruleData="curRuleData"
        @operateSuccess="handleOperateSuccess"
    ></editSpecialMember>

    <!-- 删除 特殊成员规则 确认弹框 -->
    <confirmDialog
        v-model:visible="visible_deleteRule"
        :loading="loading_deleteRule"
        :title="$t('deleteConfirm')"
        :tip-content="$t('privatePool.tip_deleteSpecialMember')"
        @confirm="confirm_deleteRule"
    ></confirmDialog>
</template>

<script setup>
import { ref, inject, onMounted, h } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/pinia/modules/user.js';
import { pagenation, confirmDialog } from 'xhl_lib';
import { timeFormat } from 'xhl_lib/xhl-ui/utils/dataProcess.js';
import { queryConversionRuleModeAndLandingPage } from '@/api/businessObjects';
import { getSpecialMemberRules, delSpecialMemberRule } from '@/api/privatePool';
import editGeneralMember from '../Modal/editGeneralMember.vue';
import editSpecialMember from '../Modal/editSpecialMember.vue';

// inject
const currentSettingRow = inject('currentSettingRow');

// 全局
// loading
const loading = ref(false);
// 多语言
const { t } = useI18n();
// 取 pinia 数据
const store = useUserStore();

// 一般成员
// 限制类型 0 不限制, 1 限制
const limitedFlag = ref(1);
// 一般成员上限数量
const maxCapacity = ref(0);
// 获取一般成员上限数据
const getGeneralMemberData = () => {
    queryConversionRuleModeAndLandingPage({
        apiKey: currentSettingRow.value.apiKey
    }).then(res => {
        if (res.code == 10000 && res.data) {
            limitedFlag.value = res.data.limitedFlag;
            maxCapacity.value = res.data.maxCapacity;
        } else {
            ElMessage.error(res.messageShow);
        }
    });
};
// 编辑成员上限
const handleEditCount = () => {
    visible_editCount.value = true;
};

// 特殊成员 - 添加按钮
// 触发添加
const handleAddSpecialMember = () => {
    curRuleData.value = {};
    curOperateType.value = 'new';
    visible_editRule.value = true;
};

// 特殊成员 - 表格
// 表格 ref
const tableRef = ref(null);
// 表格数据
let tableData = ref([]);
// 表格列
const tableColumns = [
    {
        label: t('privatePool.memberScope'),
        prop: 'userNames',
        minWidth: 250,
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
        label: t('privatePool.limitCount'),
        prop: 'maxCapacity',
        minWidth: 50,
        formatter: (row) => {
            return row.limitedFlag === 0 ? t('unlimited') : row.maxCapacity;
        }
    },
    {
        label: t('privatePool.includeSelfBuildObj', { name: currentSettingRow.value.displayName }),
        prop: 'newObjectFlag',
        minWidth: 80,
        formatter: (row, column, cellValue) => {
            return cellValue === 1 ? t('include') : t('exclude');
        }
    },
    {
        label: t('privatePool.includeTransactCustomer'),
        prop: 'conversionObjectFlag',
        minWidth: 80,
        formatter: (row, column, cellValue) => {
            return cellValue === 1 ? t('include') : t('exclude');
        }
    },
    {
        label: t('createTime'),
        prop: 'createTime',
        minWidth: 100,
        formatter: (row) => {
            return timeFormat(row.createTime, 'DateTime');
        }
    },
    {
        label: t('createUser'),
        prop: 'createUserName',
        minWidth: 100
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
    methods: getSpecialMemberRules,
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

// 弹框 - 编辑一般成员上限
// visible
const visible_editCount = ref(false);

// 弹框 - 新增/编辑 特殊成员规则
// 当前正在操作的规则的数据
let curRuleData = ref({});
// 弹框显隐
let visible_editRule = ref(false);
// 当前操作类型
let curOperateType = ref('');
// 操作特殊成员规则成功
const handleOperateSuccess = (data) => {
    // 新建成功
    if (['new'].includes(curOperateType.value)) {
        // 新建成功后, 回到第一页刷新表格显示最新特殊成员规则数据
        pageNationRef.value.handleCurrentChange(1);
        return;
    }

    // 编辑成功
    if (curOperateType.value === 'edit') {
        // 更新数据
        ['idAndNameDtoList', 'limitedFlag', 'maxCapacity', 'newObjectFlag', 'conversionObjectFlag'].forEach(prop => {
            curRuleData.value[prop] = data[prop];
        });
    }
};

// 弹框 - 删除特殊成员规则
// 弹框显隐
let visible_deleteRule = ref(false);
// 弹框 loading
let loading_deleteRule = ref(false);
// 删除特殊成员规则 确认
const confirm_deleteRule = () => {
    // 显示 loading
    loading_deleteRule.value = true;

    // 发送请求
    delSpecialMemberRule({
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
    getGeneralMemberData();
    pageNationRef.value.handleCurrentChange(1);
});
</script>

<style lang="scss" scoped>
.privatePoolLimit {
    &-header {
        margin: 0 0 12px 0;
        display: flex;
        align-items: baseline;
        gap: 12px;
    }

    &-title {
        white-space: nowrap;
        font-size: 15px;
        font-weight: 500;
        line-height: 24px;
    }

    &-tip {
        flex: 1;
        font-size: 12px;
        line-height: 18px;
        color: #909299;
    }

    &-generalMember {
        margin: 12px 0;
        line-height: 22px;
    }

    &-specialMember {
        &-title {
            margin: 12px 0;
            line-height: 22px;
        }

        &-body {
            height: calc(100vh - 295px);
        }
    }
}
</style>