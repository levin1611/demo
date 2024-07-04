<!-- 业务对象设置 - 字段更新规则 -->
<template>
    <div class="fieldUpdateRule">
        <!-- 最近跟进时间 -->
        <div class="fieldUpdateRule-pane">
            <div class="lastFollowTimeSet">
                <!-- header -->
                <div class="lastFollowTimeSet-header">
                    <!-- title -->
                    <div class="lastFollowTimeSet-title">{{ $t('fieldUpdateRule.lastFollowTime') }}</div>

                    <!-- buttons -->
                    <div class="lastFollowTimeSet-btns">
                        <template v-if="!editing">
                            <!-- 编辑 -->
                            <el-button
                                type="primary"
                                @click="handleEdit"
                            >{{ $t('edit') }}</el-button>
                        </template>
                        <template v-else>
                            <!-- 保存 -->
                            <el-button
                                type="primary"
                                @click="handleSave"
                            >{{ $t('save') }}</el-button>
                            <!-- 取消 -->
                            <el-button
                                @click="handleCancel"
                            >{{ $t('cancel') }}</el-button>
                        </template>
                    </div>
                </div>

                <!-- body -->
                <div class="lastFollowTimeSet-body">
                    <!-- tip1 -->
                    <div class="lastTransactTimeSet-tip">{{ $t('fieldUpdateRule.lastFollowTimeTip1') }}</div>
                    <!-- 选择区域 -->
                    <el-row :gutter="40">
                        <el-col
                            v-for="item in (editingData.teamMembers || [])"
                            :key="item.id"
                            :span="2"
                        >
                            <el-checkbox
                                v-if="item.enableFlag === 2"
                                :model-value="item.enableFlag > 0"
                                :disabled="true"
                                :label="item.name"
                            ></el-checkbox>
                            <el-checkbox
                                v-else
                                v-model="item.enableFlag"
                                :true-value="1"
                                :false-value="0"
                                :disabled="!editing"
                                :label="item.name"
                            ></el-checkbox>
                        </el-col>
                    </el-row>

                    <!-- tip2 -->
                    <div class="lastFollowTimeSet-tip">{{ $t('fieldUpdateRule.lastFollowTimeTip2') }}
                        <el-tooltip
                            placement="top"
                            content='文案待补充'>
                            <span class="custom custom-Tips lastFollowTimeSet-tip-icon"></span>
                        </el-tooltip>
                    </div>
                    <!-- 选择区域 -->
                    <div
                        v-for="([objApiKey, behaviorList]) in Object.entries(editingData.recentFollowUpTime || {})"
                        :key="objApiKey"
                        class="lastFollowTimeSet-behavior-area"
                    >
                        <div class="lastFollowTimeSet-behavior-objName">{{ $t(`bizObject.${objApiKey}`) }}</div>
                        <el-row
                            :gutter="40"
                            class="flex-1"
                        >
                            <el-col
                                v-for="item in behaviorList"
                                :key="item.id"
                                :span="4"
                            >
                                <el-checkbox
                                    v-if="item.enableFlag === 2"
                                    :model-value="item.enableFlag > 0"
                                    :disabled="true"
                                    :label="item.name"
                                ></el-checkbox>
                                <el-checkbox
                                    v-else
                                    v-model="item.enableFlag"
                                    :true-value="1"
                                    :false-value="0"
                                    :disabled="!editing"
                                    :label="item.name"
                                ></el-checkbox>
                            </el-col>
                        </el-row>
                    </div>
                </div>
            </div>
        </div>

        <!-- 最近获得时间 -->
        <div class="fieldUpdateRule-pane">
            <div class="lastGetTimeSet">
                <!-- header -->
                <div class="lastGetTimeSet-header">
                    <!-- title -->
                    <div class="lastGetTimeSet-title">{{ $t('fieldUpdateRule.lastGetTime') }}</div>
                </div>

                <!-- tip -->
                <div class="lastGetTimeSet-tip">{{ $t('fieldUpdateRule.lastGetTimeTip') }}</div>

                <!-- 选择区域 -->
                <el-row :gutter="40">
                    <el-col
                        v-for="item in (editingData.latestAcquisitionTime || [])"
                        :key="item.id"
                        :span="3"
                    >
                        <el-checkbox
                            v-if="item.enableFlag === 2"
                            :model-value="item.enableFlag > 0"
                            :disabled="true"
                            :label="item.name"
                        ></el-checkbox>
                        <el-checkbox
                            v-else
                            v-model="item.enableFlag"
                            :true-value="1"
                            :false-value="0"
                            :disabled="!editing"
                            :label="item.name"
                        ></el-checkbox>
                    </el-col>
                </el-row>
            </div>
        </div>

        <!-- 最近成交时间 -->
        <div class="fieldUpdateRule-pane">
            <div class="lastTransactTimeSet">
                <!-- header -->
                <div class="lastTransactTimeSet-header">
                    <!-- title -->
                    <div class="lastTransactTimeSet-title">{{ $t('fieldUpdateRule.lastTransactTime') }}</div>
                </div>

                <!-- tip -->
                <div class="lastTransactTimeSet-tip">{{ $t('fieldUpdateRule.lastTransactTimeTip') }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useI18n } from 'vue-i18n';
// import { useUserStore } from '@/pinia/modules/user.js';
import { getFieldUpdateRuleData, updateFieldUpdateRuleData } from '@/api/fieldUpdateRule';

// inject
const currentSettingRow = inject('currentSettingRow');

// 全局
// loading
const loading = ref(false);
// 多语言
const { t } = useI18n();
// 取 pinia 数据
// const store = useUserStore();


// 数据获取
// 全部数据
let allData = {};
// 编辑/显示 所使用的数据
const editingData = ref({});
// 请求数据
const getData = () => {
    // 显示 loading
    loading.value = true;

    // 发送请求
    getFieldUpdateRuleData({
        apiKey: currentSettingRow.value.apiKey
    }).then(res => {
        if (res.code == 10000 && res.data) {
            allData = res.data;
            editingData.value = JSON.parse(JSON.stringify(res.data));
        } else {
            ElMessage.error(res.messageShow);
        }
        loading.value = false;
    });
};

// 编辑
// 编辑中状态
const editing = ref(false);
// 触发编辑
const handleEdit = () => {
    editing.value = true;
};
// 保存
const handleSave = () => {
    // 显示 loading
    loading.value = true;

    // 组装请求数据
    const postData = {};
    [
        ...(editingData.value.teamMembers || []),
        ...Object.values(editingData.value.recentFollowUpTime || {}).reduce((a, b) => a.concat(b), []),
        ...(editingData.value.latestAcquisitionTime || [])
    ].forEach(item => {
        if (item.enableFlag !== 2) {
            postData[item.id] = item.enableFlag;
        }
    });
    // 发送请求
    updateFieldUpdateRuleData(postData).then(res => {
        if (res.code == 10000) {
            // 退出编辑状态
            editing.value = false;
            // 更新初始数据
            allData = JSON.parse(JSON.stringify(editingData.value));
        } else {
            ElMessage.error(res.messageShow);
        }
        loading.value = false;
    });
};
// 取消编辑
const handleCancel = () => {
    // 退出编辑状态
    editing.value = false;
    // 恢复默认数据
    editingData.value = JSON.parse(JSON.stringify(allData));
};

// 获取数据
getData();
</script>

<style lang="scss" scoped>
.fieldUpdateRule {
    &-pane {
        margin: 0 24px 12px 0;
        padding: 12px 20px;
        border: 1px solid var(--#{$elnamespace}-border-color-light);
        border-radius: 3px;
    }
}

.lastFollowTimeSet {
    &-header {
        position: relative;
    }

    &-title {
        flex: 1;
        font-size: 15px;
        font-weight: 500;
        line-height: 22px;
    }

    &-btns {
        position: absolute;
        right: 0;
        top: -6px;
    }

    &-tip {
        margin: 12px 0 4px;

        &-icon {
            color: #A1A5AE;
            font-size: 14px;
            margin-left: 12px;
        }
    }

    &-behavior-area {
        display: flex;
        align-items: center;
        border-bottom: 1px solid var(--#{$elnamespace}-border-color-lighter);
    }

    &-behavior-objName {
        width: 120px;
        padding-left: 20px;
    }
}

.lastGetTimeSet {
    &-title {
        font-size: 15px;
        font-weight: 500;
        line-height: 22px;
    }

    &-tip {
        margin: 12px 0 4px;
    }
}

.lastTransactTimeSet {
    &-title {
        font-size: 15px;
        font-weight: 500;
        line-height: 22px;
    }

    &-tip {
        margin: 12px 0 4px;
    }
}
</style>