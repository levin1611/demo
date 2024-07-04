<!-- 团队成员继承设置 -->
<template>
    <div
        v-loading="loading"
        class="teamMemberInheritSet"
    >
        <!-- 角色类型(负责人/协同人) 切换 -->
        <el-radio-group
            v-model="roleType"
            class="teamMemberInheritSet-roleType"
        >
            <el-radio-button
                :value="1"
            >{{ $t('principal') }}</el-radio-button>
            <el-radio-button
                :value="2"
            >{{ $t('collaborator') }}</el-radio-button>
        </el-radio-group>

        <!-- 角色类型对应 tabs , 隐藏 header -->
        <el-tabs
            :model-value="roleType"
            class="noHeader"
        >
            <!-- 负责人 -->
            <el-tab-pane
                :label="1"
                :name="1"
                class="teamMemberInheritSet-tabpane"
            >
                <!-- 相关对象负责人必须与客户负责人一致 -->
                <div class="teamMemberInheritSet-title">
                    <span>{{ $t('bizObject.relObjPrincipalKeepConsistentWithCustomer') }}</span>
                    <el-switch
                        v-model="enableFlag"
                        :disabled="true"
                        :active-value="1"
                        :inactive-value="0"
                        @change="updateSet(1, -1, 'enableFlag', enableFlag)"
                    />
                </div>
                <!-- 大段提示 -->
                <div class="teamMemberInheritSet-tip">{{ $t('bizObject.tip_relObjPrincipalKeepConsistentWithCustomer') }}</div>

                <!-- 支持的相关对象 -->
                <div>{{ $t('bizObject.supportRelObj') }}</div>
                <el-checkbox-group
                    v-model="childObjectApiKeys"
                    :disabled="true"
                    @change="updateSet(1, -1, 'childObjectApiKeys', childObjectApiKeys)"
                >
                    <el-checkbox
                        v-for="relObj in childObjectList"
                        :key="relObj.apiKey"
                        :label="relObj.name"
                        :value="relObj.apiKey"
                    ></el-checkbox>
                </el-checkbox-group>
            </el-tab-pane>

            <!-- 协同人 -->
            <el-tab-pane
                :label="2"
                :name="2"
                class="teamMemberInheritSet-tabpane"
            >
                <div class="teamMemberInheritSet-body">
                    <!-- 左侧目录 -->
                    <div class="teamMemberInheritSet-menu">
                        <!-- 选择业务动作类型 -->
                        <el-menu
                            :default-active="curActionVal"
                            @select="selectAction"
                        >
                            <el-menu-item
                                v-for="item in actionList"
                                :key="item.value"
                                :index="item.value"
                            >{{ item.label }}</el-menu-item>
                        </el-menu>
                    </div>

                    <!-- 右侧内容 -->
                    <div class="teamMemberInheritSet-panel">
                        <div class="teamMemberInheritSet-title">
                            <span>{{ collaboratorSet[curActionVal].langObj.header }}</span>
                            <el-switch
                                v-model="collaboratorSet[curActionVal].enableFlag"
                                :active-value="1"
                                :inactive-value="0"
                                @change="updateSet(2, curActionVal, 'enableFlag', collaboratorSet[curActionVal].enableFlag)"
                            />
                        </div>
                        <!-- 大段提示 -->
                        <div class="teamMemberInheritSet-tip">{{ collaboratorSet[curActionVal].langObj.tip }}</div>

                        <!-- 支持的相关对象 -->
                        <div>{{ $t('bizObject.supportRelObj') }}</div>
                        <el-checkbox-group
                            v-model="collaboratorSet[curActionVal].childObjectApiKeys"
                            @change="updateSet(2, curActionVal, 'childObjectApiKeys', collaboratorSet[curActionVal].childObjectApiKeys)"
                        >
                            <el-checkbox
                                v-for="relObj in collaboratorSet[curActionVal].childObjectList"
                                :key="relObj.apiKey"
                                :label="relObj.name"
                                :value="relObj.apiKey"
                            ></el-checkbox>
                        </el-checkbox-group>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { getTeamMemberInheritSet, updateTeamMemberInheritSet } from '@/api/businessObjects.js';
import { CODESTATE } from '@/https/codeConfig';

// 接收父组件传, 当前选中的行
const currentSettingRow = inject('currentSettingRow');

// 取当前显示的语种
const { t } = useI18n();

// 全局变量
const loading = ref(false);

// 角色类型切换
// 角色类型, 1 - 负责人, 2 - 协同人
const roleType = ref(1);
// 切换角色类型
const toggleRoleType = (type) => {
    roleType.value = type;
};

// 负责人 tab
// 是否启动
const enableFlag = ref(0);
// 相关对象列表
const childObjectList = [
    {
        name: '联系人',
        apiKey: 'contact'
    },
    {
        name: '商机',
        apiKey: 'opportunity'
    },
    {
        name: '线索',
        apiKey: 'lead'
    }
];
// 已选的相关对象
const childObjectApiKeys = ref([]);

// 协同人 tab
// 左侧目录
// 当前业务操作类型
const curActionVal = ref(1);
// 支持的业务操作动类型
const actionList = [
    {
        label: t('bizObject.inhertWhenCollaboratorChange'),
        value: 1
    },
    {
        label: t('bizObject.inhertWhenCreatBizOnCustomerDetail'),
        value: 2
    }
];
// 选中业务对象
const selectAction = (val) => {
    curActionVal.value = val;
};
// 所有协同人数据 + 多语言
const collaboratorSet = ref({
    1: {
        langObj: {
            header: t('bizObject.relObjCollaboratorKeepConsistentWithCustomer'),
            tip: t('bizObject.tip_relObjCollaboratorKeepConsistentWithCustomer')
        },
        enableFlag: 0,
        childObjectApiKeys: [],
        childObjectList: childObjectList
    },
    2: {
        langObj: {
            header: t('bizObject.relObjCollaboratorIneritFromCustomer'),
            tip: t('bizObject.tip_relObjCollaboratorIneritFromCustomer')
        },
        enableFlag: 0,
        childObjectApiKeys: [],
        childObjectList: childObjectList.slice(0, 2)
    }
});

// 右侧内容
// 获取数据
const getData = async () => {
    // 显示 loading
    loading.value = true;

    // 接口请求
    getTeamMemberInheritSet({
        // 此处不传筛选条件, 只传 apiKey , 一次获取所有数据
        parentObjectApikey: currentSettingRow.value.apiKey
        // inheritanceType: '',
        // roleType: ''
    }).then(res => {
        if (res.code === CODESTATE.SUCCESS) {
            // 请求成功
            // 数据请求成功处理
            if (Array.isArray(res.data)) {
                res.data.forEach(item => {
                    // 协同人 --- 负责人说先不整
                    if (item.roleType === 2) {
                        collaboratorSet.value[item.inheritanceType] = Object.assign({}, collaboratorSet.value[item.inheritanceType] || {}, item);
                    }
                });
            }
        } else {
            // 提示错误
            ElMessage.error(res.message);
        }

        // 关闭 loading
        loading.value = false;
    });
};
// 更新设置
const updateSet = async (roleType, inheritanceType, key, value) => {
    // id 校验
    if (!(inheritanceType && collaboratorSet.value[inheritanceType].id)) {
        ElMessage.error('error');
        return;
    }

    // 请求数据处理
    const postData = {
        id: collaboratorSet.value[inheritanceType].id,
        roleType,
        inheritanceType
    };
    postData[key] = value;

    // 接口请求
    return new Promise((resolve, reject) => {
        updateTeamMemberInheritSet(postData).then(res => {
            if (res.code === CODESTATE.SUCCESS) {
                // 提示成功
                ElMessage.success(t('saveSuccess'));
                resolve(true);
            } else {
                // 提示错误
                ElMessage.error(res.message);
                resolve(false);
            }
        });
    });
};

// 请求数据
getData();
</script>

<style lang="scss" scoped>
.teamMemberInheritSet {
    &-roleType {
        margin-bottom: 12px;

        ::v-deep .#{$elnamespace}-radio-button {
            --#{$elnamespace}-radio-button-checked-bg-color: var(--#{$elnamespace}-color-white);
            --#{$elnamespace}-radio-button-checked-text-color: var(--#{$elnamespace}-color-primary);
            --#{$elnamespace}-radio-button-checked-border-color: var(--#{$elnamespace}-color-primary);
        }
    }

    ::v-deep &-tabpane {
        .#{$elnamespace}-checkbox {
            --#{$elnamespace}-checkbox-text-color: var(--#{$elnamespace}-text-color-primary);
        }
    }

    ::v-deep &-title {
        margin-bottom: 12px;

        span {
            display: inline-block;
            margin-right: 14px;
            vertical-align: text-bottom;
            font-weight: 500;
        }
    }

    ::v-deep &-tip {
        white-space: pre;
        margin-bottom: 20px;
    }

    ::v-deep &-body {
        display: flex;
        border-right: 0;
        border-bottom: none;
    }

    ::v-deep &-menu {
        width: 200px;
        height: calc(100vh - 220px);
        border: 1px solid var(--#{$elnamespace}-border-color-light);

        .#{$elnamespace}-menu {
            border: none;

            &-item {
                height: 40px;
                padding: 0 13px;

                &.is-active {
                    background-color: var(--#{$elnamespace}-menu-hover-bg-color);
                    font-weight: 700
                }
            }
        }
    }

    &-panel {
        flex: 1;
        padding: 11px 19px;

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