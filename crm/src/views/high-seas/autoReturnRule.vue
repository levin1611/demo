<!-- 公海设置 - 自动退回规则 -->
<template>
    <div class="autoReturnRule">
        <!-- header -->
        <div class="autoReturnRule-header">
            <!-- left -->
            <div class="autoReturnRule-header-left">
                <!-- title -->
                <span class="autoReturnRule-title">{{ $t('highSeas.autoReturnRule') }}</span> 

                <!-- switch -->
                <el-switch
                    :model-value="enableFlag"
                    :active-value="1"
                    :inactive-value="0"
                    @change="handleEnableChange"
                ></el-switch>
            </div>

            <!-- right -->
            <div class="autoReturnRule-header-right">
                <!-- 新建规则 -->
                <el-button
                    type="primary"
                    :disabled="curReturnRuleStatus !== ''"
                    @click="handleAddRule()"
                >{{ $t('permRule.createRule') }}</el-button>
            </div>
        </div>

        <!-- body -->
        <div class="autoReturnRule-body">
            <!-- 左侧目录 -->
            <div class="autoReturnRule-menu">
                <el-scrollbar>
                    <!-- 选择业务对象类型 -->
                    <el-menu
                        :default-active="curRuleId"
                        @select="handleMenuSelect"
                    >
                        <!-- 排序 -->
                        <el-menu-item
                            v-for="item in ruleList"
                            :key="item.id"
                            :index="item.id"
                        >
                            <!-- title -->
                            <div
                                :title="item.name"
                                class="autoReturnRule-menu-item-title truncate"
                            >{{ item.name }}</div>

                            <!-- status -->
                            <div
                                v-if="!['add'].includes(item.id)"
                                class="autoReturnRule-menu-item-status"
                            >
                                {{ item.enableFlag ? $t('open') : $t('cls') }}
                            </div>
                        </el-menu-item>
                    </el-menu>
                </el-scrollbar>
            </div>

            <!-- 右侧内容 -->
            <div class="autoReturnRule-panel">
                <!-- 退回规则页面 -->
                <returnRule
                    v-if="curRuleId"
                    :currentSettingRow="currentSettingRow"
                    :operateType="curReturnRuleStatus"
                    v-model:ruleData="curRuleData"
                    @changeStatus="handleChangeStatus"
                    @saveSuccess="handleSaveSuccess"
                    @delSuccess="handleDelSuccess"
                ></returnRule>

                <!-- 空白页 -->
                <default-empty
                    v-else
                ></default-empty>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { queryConversionRuleModeAndLandingPage } from '@/api/businessObjects';
import { getHighSeasRuleList, updateHighSeasConfig } from '@/api/highSeas.js';
import returnRule from './returnRule.vue';

// inject
const currentSettingRow = inject('currentSettingRow');

// 全局
// 多语言
const { t } = useI18n();

// header
// 规则总开关
const enableFlag = ref(0);
// 获取总开关状态数据
const getEnableStatus = () => {
    queryConversionRuleModeAndLandingPage({
        apiKey: currentSettingRow.value.apiKey
    }).then(res => {
        if (res.code == 10000 && res.data) {
            enableFlag.value = res.data.poolReturnAutoFlag;
        } else {
            ElMessage.error(res.messageShow);
        }
    });
};
// 总开关 change
const handleEnableChange = (val) => {
    const postData = {
        objectId: currentSettingRow.value.id,
        poolReturnAutoFlag: enableFlag.value ? 0 : 1
    };
    updateHighSeasConfig(postData).then((res) => {
        if (res.code === 10000) {
            ElMessage.success(t('saveSuccess'));
            enableFlag.value = postData.poolReturnAutoFlag;
        } else {
            // 异常处理
            ElMessage.error(t('operateFailed'));
        }
    }, () => {
        // 异常处理
        ElMessage.error(t('operateFailed'));
    });
};

// 添加规则
const handleAddRule = (copyRuleId) => {
    if (['add', 'copy'].includes(curReturnRuleStatus.value)) {
        // 当前新增/复制规则中

        // 已在新增状态, return
        return;
    } else if (curReturnRuleStatus.value) {
        // 当前编辑规则中

        // 编辑中, 弹出提示
        showLeaveConfirm(data, () => {
            addRule(copyRuleId);
        });
        return;
    }

    // 添加新规则
    addRule(copyRuleId);
};
// 新增"添加新规则"到左侧并切换到该规则
const addRule = (copyRuleId) => {
    // 初始化新增规则空白数据
    const newRuleData = {
        id: 'add',
        name: t('permRule.createRule'),
        copyRuleId
    };
    // 列表加入新增规则
    ruleList.value.unshift(newRuleData);
    // 切换到新增规则
    toggleRule(newRuleData);
};

// menu
// 当前选中规则 id
const curRuleId = ref('');
// 当前选中规则数据
const curRuleData = ref({});
// 规则列表
const ruleList = ref([]);
// 规则列表 loading
const loading_ruleList = ref(false);
// 获取 rule 数据
const getListData = () => {
    loading_ruleList.value = true;
    getHighSeasRuleList({
        objectApiKey: currentSettingRow.value.apiKey
    }).then(res => {
        if (res.code === 10000) {
            // 规则列表处理
            ruleList.value = Array.isArray(res.data) ? res.data : [];

            // 选中首条规则
            toggleRule(ruleList.value[0] || {});
        } else {
            ruleList.value = [];
            ElMessage.error(res.messageShow);
        }
        loading_ruleList.value = false;
    });
};
// menu 选中
const handleMenuSelect = (id) => {
    const ruleData = ruleList.value.find(item => item.id === id) || {};

    // 退回规则新增编辑复制中, 弹出提示
    if (curReturnRuleStatus.value) {
        showLeaveConfirm(ruleData, toggleRule);
        return;
    }

    // 正常流程, 切换查看规则
    toggleRule(ruleData);
};
// 弹出离开确认弹框
const showLeaveConfirm = (data, confirmCb) => {
    ElMessageBox.confirm(
        t('highSeas.leaveConfirmTip'),
        t('leaveConfirm'),
        {
            confirmButtonText: t('confirm'),
            cancelButtonText: t('cancel')
        }
    ).then(() => {
        // 确认
        confirmCb(data);
    }).catch(() => {
        // 取消
    });
};
// 切换查看规则
const toggleRule = (data) => {
    // 如果当前是新增规则, 那切换规则之前, 先去掉新增规则
    if (curRuleId.value === 'add') {
        ruleList.value = ruleList.value.filter(item => item.id !== 'add');
    }
    // 更新选中规则 id
    curRuleId.value = data.id;
    // 更新选中规则数据
    curRuleData.value = data;
    // 重置退回规则状态
    curReturnRuleStatus.value = data.id === 'add' ? 'add' : '';
};

// 退回规则组件
// 组件所处的状态(是否编辑中)
const curReturnRuleStatus = ref('');
// 组件事件处理
// 处理组件状态变更(复制/编辑)
const handleChangeStatus = (newStatus) => {
    // 组件重置了状态 = 取消编辑
    if (!newStatus) {
        // 如果当前是新增/复制规则场景, 则删除该条规则
        if (['add', 'copy'].includes(curReturnRuleStatus.value)) {
            removeRule(curRuleData.value);
        }
    }

    // 复制规则, 走创建逻辑, 同时附带上被复制的规则的 id (目前没用到)
    if (newStatus === 'copy') {
        handleAddRule(curRuleId.value);
    }

    // 状态更新
    curReturnRuleStatus.value = newStatus;
};
// 手动移除某一条规则
const removeRule = (ruleData) => {
    const dataIndex = ruleList.value.findIndex(item => item.id === ruleData.id);
    if (dataIndex > -1) {
        // 删除该条规则
        ruleList.value.splice(dataIndex, 1);
        // 如果要删除的规则就是当前显示的规则, 则按 下一条规则 || 首条规则 || 空 的顺序切换
        if (curRuleData.value.id === ruleData.id) {
            toggleRule(ruleList.value[dataIndex] || ruleList.value[0] || {});
        }
    }
};
// 处理保存成功事件
const handleSaveSuccess = (data) => {
    if (['add', 'copy'].includes(curReturnRuleStatus.value)) {
        // 新增/复制规则

        // 规则列表中的临时数据替换为正式数据
        // (此处只替换了 id , 数据更新在退回规则组件内部处理)
        curRuleId.value = data.id;
        curRuleData.value.id = data.id;
    } else {
        // 编辑规则

        // 更新数据
        curRuleData.value.name = data.name;
        curRuleData.value.enableFlag = data.enableFlag;
    }

    // 重置当前规则状态
    curReturnRuleStatus.value = '';
};
// 处理删除事件
const handleDelSuccess = (data) => {
    removeRule(data);
    // 重置当前规则状态
    curReturnRuleStatus.value = '';
};

// 初始获取数据
getEnableStatus();
getListData();
</script>

<style lang="scss" scoped>
.autoReturnRule {
    height: 100%;
    display: flex;
    flex-direction: column;

    &-header {
        border-bottom: 1px solid var(--#{$elnamespace}-border-color-lighter);
        padding: 0 20px 4px;
        display: flex;
        align-items: center;

        &-left {
            flex: 1;
        }
    }

    &-title {
        white-space: nowrap;
        font-size: 15px;
        font-weight: 500;
        line-height: 24px;
        vertical-align: text-bottom;
        margin-right: 12px;
    }

    &-body {
        flex: 1;
        height: 0;
        display: flex;
    }

    &-menu {
        width: 200px;
        height: 100%;
        border-right: 1px solid var(--#{$elnamespace}-border-color-light);

        :deep {
            .#{$elnamespace}-menu {
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

        &-item {
            &-title {
                flex: 1;
                width: 0;
                padding-right: 10px;;
            }
        }
    }

    &-panel {
        flex: 1;
        width: 0;
    }
}
</style>
