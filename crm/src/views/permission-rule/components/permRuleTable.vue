<!-- 自定义权限规则 Tab -->
<template>
    <div class="permRuleTable">
        <!-- header -->
        <div class="permRuleTable-header">
            <!-- title -->
            <div class="permRuleTable-title">
                {{ curBizObj.entityName }} ({{ curBizObj.ruleCount }})
            </div>

            <!-- search -->
            <div class="permRuleTable-search">
                <el-input
                    v-model="searchVal"
                    @change='keywordchange'
                    :placeholder="$t('permRule.placeholder_ruleName')"
                    :suffix-icon="Search"
                ></el-input>
            </div>

            <!-- 新建 -->
            <el-button type="primary" @click="createRule">{{
                $t('permRule.createRule')
            }}</el-button>
        </div>

        <!-- body -->
        <!-- 表格初始请求无数据, 显示空 -->
        <div v-if="!emptyInit" class="permRuleTable-body">
            <default-empty />
        </div>
        <!-- 否则, 正常显示表格 -->
        <div class="permRuleTable-body" v-show="emptyInit">
            <!-- 成员列表 -->
            <el-table
                :data="tableData"
                max-height="calc(100% - 50px)"
                height="100%"
                v-loading="tableLoading"
                stripe
                class="permRuleTable-table"
                :tooltip-options ='{
                    appendTo:"body",
                    teleported: true,
                    "showAfter": 500
                }'
            >
                <!-- 成员名 -->
                <el-table-column
                    v-for="column in tableColumns"
                    :key="column.prop"
                    :prop="column.prop"
                    :label="column.label"
                    :formatter="column.formatter"
                    :min-width="column.minWidth"
                   
                    :show-overflow-tooltip="
                        ['description', 'ruleName'].includes(column.prop)
                    "
                >
                    <template
                        v-if="column.prop === 'ruleStatus'"
                        #default="{ row }"
                    >
                        <el-switch
                            v-model="row.ruleStatus"
                            :active-value="1"
                            :inactive-value="0"
                            @change="toggleRuleStatus($event, row)"
                        ></el-switch>
                    </template>

                    <template
                        v-else-if="column.prop === 'ruleType'"
                        #default="{ row }"
                    >
                        {{
                            row.ruleType
                                ? $t('permRule.byType1')
                                : $t('permRule.byType0')
                        }}
                    </template>
                    <!-- 操作列 -->
                    <template
                        v-else-if="column.prop === 'operate'"
                        #default="{ row }"
                    >
                        <!-- 编辑 -->
                        <el-link type="primary" @click="onRuleEdit(row.id, row)">
                            {{ $t('edit') }}
                        </el-link>
                        <!-- 重新计算 -->
                        <el-link type="primary" @click="trigger_reCalc(row)">
                            {{ $t('permRule.reCalculate') }}
                        </el-link>
                        <!-- 删除 -->
                        <el-link type="danger" @click="trigger_deleteRule(row)">
                            {{ $t('delete') }}
                        </el-link>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <pagenation
                ref="pageNationRef"
                @updateData="updateData"
                @changeBefore="beforeChangePage"
                :parameter="pageNationParams"
            ></pagenation>
        </div>
    </div>

    <!-- 启用规则确认 弹框 -->
    <confirmDialog
        v-model:visible="visible_toggleRuleStatus"
        :loading="loading_toggleRuleStatus"
        :title="$t('permRule.changeRuleStatusConfirm')"
        :tip-content="$t('permRule.tip_enableRule')"
        @confirm="confirm_toggleRuleStatus"
    ></confirmDialog>
    <!-- 停用规则确认 弹框 -->
    <confirmDialog
        v-model:visible="visible_toggleRuleStatus_close"
        :loading="loading_toggleRuleStatus"
        :title="$t('permRule.changeRuleStatusConfirm')"
        :tip-content="$t('permRule.tip_unableRule')"
        @confirm="confirm_toggleRuleStatus_close"
    ></confirmDialog>

    <!-- 删除规则确认 弹框 -->
    <confirmDialog
        v-model:visible="visible_deleteRule"
        :loading="loading_deleteRule"
        :title="$t('deleteConfirm')"
        :tip-content="$t('permRule.tip_deleteRule')"
        @confirm="confirm_deleteRule"
    ></confirmDialog>
    <!-- 重新计算中 二次确认弹窗 -->
    <confirmDialog
        v-model:visible="visible_reConfirm"
        :title="$t('permRule.reCalculateConfirm')"
        :tip-content="
            $t('permRule.confirmSecTips', { rulename: curRuleData.ruleName })
        "
        @confirm="confirm_reCalcingBysec"
    ></confirmDialog>

    <!-- 重新计算中 弹框 -->
    <confirmDialog
        v-model:visible="visible_reCalcing"
        :title="$t('permRule.confirmReCalc')"
        :tip-content="$t('permRule.tip_reCalcing')"
        :footerBtns="['cancel']"
        @confirm="confirm_reCalcing"
    ></confirmDialog>

    <rule-dialog
        :visible="ruleState.visible"
        v-if="ruleState.visible"
        :title="ruleState.title"
        :curBizObj="curBizObj"
        :data="ruleState.data"
        @save="onRuleDialogSave"
        @close="onRuleDialogClose"
    />
</template>

<script setup>
import { ref, toRefs, watch, computed, watchEffect, reactive } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import {
    updatePermRuleStatus,
    reCalcPermRule,
    deletePermRule,
    orgCustomPermissionList
} from '@/api/permRule';
import defaultEmpty from '@/components/defaultEmpty.vue';
import {pagenation} from 'xhl_lib';
import { CODESTATE } from '@/https/codeConfig';
import ruleDialog from './dialog/rule-dialog.vue';
import { createNewRule, modifyRule, getRuleDetail } from '@/api/department';

// props
const props = defineProps({
    curBizObj: {
        type: Object,
        default() {
            return {};
        }
    }
});
const { curBizObj } = toRefs(props);

// 多语言
const { t } = useI18n();

// 搜索
const searchVal = ref('');

// 新建规则
const ruleState = reactive({
    flag: 0, // 0：新增 1:修改
    visible: false,
    title: null,
    data: null
});

const createRule = () => {
    ruleState.flag = 0;
    ruleState.visible = true;
    ruleState.title = t('permRule.createRule');
};

const onRuleEdit = async (id, row) => {
    if (row.historyData == '处理中') {
        ElMessage.warning('规则状态为处理中，无法编辑');
        return;
    }
    try {
        const res = await getRuleDetail(id);
        if (res.code === CODESTATE.SUCCESS) {
            ruleState.data = res.data;
            ruleState.flag = 1;
            ruleState.visible = true;
            ruleState.title = t('permRule.editRule');
        }
    } catch (error) {
        ElMessage.error(error.response.data.messageShow);
    }
};

const onRuleDialogSave = async (form) => {
    if (ruleState.flag === 0) {
        console.log('save', form);
        try {
            const res = await createNewRule(form);
            if (res.code === CODESTATE.SUCCESS) {
                ElMessage.success(res.messageShow);
                onRuleDialogClose();
                pageNationRef.value.handleCurrentChange();
            } else {
                ElMessage.error(res.messageShow);
            }
        } catch (error) {
            ElMessage.error(error.response.data.messageShow);
        }
    } else {
        try {
            const res = await modifyRule(form);
            if (res.code === CODESTATE.SUCCESS) {
                ElMessage.success(res.messageShow);
                onRuleDialogClose();
                pageNationRef.value.handleCurrentChange();
            } else {
                ElMessage.error(res.messageShow);
            }
        } catch (error) {
            ElMessage.error(error.response.data.messageShow);
        }
    }
};

const onRuleDialogClose = () => {
    ruleState.visible = false;
    ruleState.data = null;
};

// 规则列表
// 表格首次加载时数据为空
const emptyInit = ref(false);
// 表格 loading
const tableLoading = ref(false);
// 表格数据
const tableData = ref([]);
// 表格列
const tableColumns = [
    {
        label: t('permRule.ruleName'),
        prop: 'ruleName',
        minWidth: 100
    },
    {
        label: t('permRule.ruleType'),
        prop: 'ruleType',
        minWidth: 120
    },
    {
        label: t('memberScope'),
        prop: 'shareToUser',
        minWidth: 80
    },
    {
        label: t('status'),
        prop: 'ruleStatus',
        minWidth: 50
    },
    {
        label: t('historyData'),
        prop: 'historyData',
        minWidth: 80
    },
    {
        label: t('remark'),
        prop: 'description',
        minWidth: 80
    },
    {
        label: t('operate'),
        prop: 'operate',
        minWidth: 130
    }
];
// 处理表格数据
const handleTableData = (data) => {
    if (!Array.isArray(data)) return [];

    return data;
};
// 表格分页
// 获取分页组件实例
const pageNationRef = ref(null);
// 分页配置
const pageNationParams = {
    data: {
        entityKey: curBizObj.value.entityKey,
        ruleName: searchVal.value
    },
    methods: orgCustomPermissionList
};
// 分页请求前置处理
const beforeChangePage = () => {
    tableLoading.value = true;
};
// 分页数据请求完毕, 更新表格数据
function updateData(data, res) {
    console.log(res, data, emptyInit.value);
    // 表格首次加载时, 如果返回数据为空, 则设置 emptyInit 为 true , 不显示表格
    emptyInit.value = data.length;
    // 处理表格数据
    tableData.value = handleTableData(data);
    // 取消 loading
    tableLoading.value = false;
    curBizObj.value.ruleCount = res.total;
}

// 表格操作
// 当前正在操作的规则的数据
let curRuleData = ref({});
// 切换规则状态
const toggleRuleStatus = (val, row) => {
   
    curRuleData.value = row;
    // 启用, 弹出确认框
    loading_toggleRuleStatus.value = false;
    if (val) {
        visible_toggleRuleStatus.value = true;
        row.ruleStatus = 0;
    } else {
        row.ruleStatus = 1;
        if (row.historyData == '处理中') {
            ElMessage.warning('规则状态为处理中，无法停用');
            return;
        }
        // 停用, 直接请求
        visible_toggleRuleStatus_close.value = true;

    }
};
let visible_reConfirm = ref(false); // 确认按照规则名称重新计算的弹窗
// 重新计算
function trigger_reCalc(row) {
    if (row.ruleStatus == 0) {
        ElMessage.warning('规则已停用，无法重新计算');
        return;
    }
    if (row.historyData == '处理中') {
        ElMessage.warning('规则状态为处理中，无法重新计算');
        return;
    }
    // if(row.)
    curRuleData.value = row;
    visible_reConfirm.value = true;
}

function confirm_reCalcingBysec() {
    reCalcPermRule({
        id: curRuleData.value.id
    }).then((res) => {
        if (res.code === CODESTATE.SUCCESS) {
            ElMessage.success(res.messageShow);
            pageNationRef.value.handleCurrentChange();
        } else {
            switch (res.code) {
                case 10001: // code 待定 --- 历史数据处理中
                    visible_reCalcing.value = true;
                    break;
                default:
                    ElMessage.error(res.message);
            }
        }
        visible_reConfirm.value = false;
    });
}

// 启用规则确认 弹框
// 弹框显隐
let visible_toggleRuleStatus = ref(false);
let visible_toggleRuleStatus_close = ref(false);

// 弹框 loading
let loading_toggleRuleStatus = ref(false);
// 启用规则 确认
const confirm_toggleRuleStatus = () => {
    changeRuleStatus(true);
    curRuleData.value.ruleStatus = 1;
};
// 启用规则 确认
const confirm_toggleRuleStatus_close = () => {
    changeRuleStatus(false);
    curRuleData.value.ruleStatus = 0;
};
// 变更规则状态
const changeRuleStatus = (val) => {
    // 显示 loading
    loading_toggleRuleStatus.value = true;

    // 发送请求
    updatePermRuleStatus({
        id: curRuleData.value.id,
        status: Number(val)
    }).then((res) => {
        if (res.code === CODESTATE.SUCCESS) {
            // 删除成功

            // 变更成功后, 刷新表格
            curRuleData.value.status = val;
            // 隐藏弹框
            visible_toggleRuleStatus.value = false;
            visible_toggleRuleStatus_close.value = false;
        } else {
            // 删除失败

            ElMessage.error(res.messageShow);
        }

        // 取消 loading
        loading_toggleRuleStatus.value = false;
    });
};

// 重新计算确认 弹框
// 弹框显隐
let visible_reCalcing = ref(false);
// 重新计算 确认
const confirm_reCalcing = () => {
    // 关闭弹框
    visible_reCalcing.value = false;
};

// 删除规则 弹框
// 弹框显隐
let visible_deleteRule = ref(false);
// 弹框 loading
let loading_deleteRule = ref(false);
// 删除角色 触发
const trigger_deleteRule = (data) => {
    if (data.historyData == '处理中') {
        ElMessage.error('正在处理历史数据，无法删除规则');
        return;
    }
    curRuleData.value = data;
    loading_deleteRule.value = false;
    visible_deleteRule.value = true;
};


// 删除角色 确认
const confirm_deleteRule = () => {
    // 显示 loading
    loading_deleteRule.value = true;

    // 发送请求
    deletePermRule({
        id: curRuleData.value.id
    }).then((res) => {
        if (res.code === CODESTATE.SUCCESS) {
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

// 监听业务对象的变化, 请求表格数据
watch(
    () => curBizObj.value.entityKey,
    (val) => {
        if (val) {
            // 查询表格第一页数据
            pageNationParams.data.entityKey = val;
            pageNationParams.data.ruleName = '';
            searchVal.value = '';
            pageNationRef.value.handleCurrentChange(1);
        }
    }
);
function keywordchange() {
    pageNationParams.data.ruleName = searchVal.value;
    pageNationRef.value.handleCurrentChange(1);

}
</script>

<style lang="scss" scoped>
.permRuleTable {
    height: calc(100% - 40px);
    &-header {
        display: flex;
        align-items: center;
        padding: 10px 20px;
        padding-bottom: 3px;
    }

    &-title {
        flex: 1;
        font-size: 16px;
        font-weight: 700;
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
