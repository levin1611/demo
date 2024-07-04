<!-- 角色 详情页 -->
<template>
    <div
        ref="roleDrawerRef"
        class="roleDrawer"
    >
        <el-drawer
            v-model="visible"
            :modal="false"
            modal-class="pointer-events-none"
            size="50%"
            ref="drawerRef"
            class="pointer-events-auto"
        >
            <!-- header -->
            <template #header>
                <div class="roleDrawer-header">
                    <!-- 标题: 角色名 -->
                    <div class="roleDrawer-title">{{ roleData.nameCn }}</div>

                    <!-- 添加成员按钮 -->
                    <el-button
                        type="primary"
                        @click="trigger_addRoleUser"
                    >{{ $t('add') }}</el-button>

                    <!-- 分割线 -->
                    <el-divider
                        direction="vertical"
                        class="mx-5"
                    ></el-divider>
                </div>
            </template>

            <!-- body -->
            <div class="roleDrawer-body">
                <!-- 成员列表 -->
                <el-table
                    :data="tableData"
                    max-height="calc(100% - 50px)"
                    height="100%"
                    v-loading="tableLoading"
                    stripe
                    class="roleDrawer-table"
                    :show-overflow-tooltip="{ showAfter: 500 }"
                >
                    <!-- 空数据插槽 -->
                    <template #empty>
                        <default-empty />
                    </template>

                    <!-- 成员名 -->
                    <el-table-column
                        v-for="column in tableColumns"
                        :key="column.prop"
                        :prop="column.prop"
                        :label="column.label"
                        :formatter="column.formatter"
                        :min-width="column.minWidth"
                    >
                        <!-- 操作列 -->
                        <template
                            v-if="column.prop === 'operate'"
                            #default="{ row }"
                        >
                            <!-- 取消授权 -->
                            <el-link
                                v-if="row.isAdmin !== 1"
                                type="primary"
                                @click="trigger_cancelAuth(row)"
                            >
                                {{ $t('role.cancelAuth') }}
                            </el-link>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 分页 -->
                <!-- <pagenation
                    layout="total, prev, pager, next, sizes"
                    :queryConfig="pageNationParams"
                    :pager-count="5"
                    ref="pageNationRef"
                    @updateData="updateData"
                ></pagenation> -->
            </div>
        </el-drawer>

        <!-- 授权成员 -->
        <selectEntity
            v-model:visible="visible_addRoleUser"
            v-model:loading="loading_addRoleUser"
            :defaultChecked="allMemberIds"
            @submitEnts="batchAuthUser"
        ></selectEntity>

        <!-- 取消授权成员 确认弹框 -->
        <confirmDialog
            v-model:visible="visible_cancelAuth"
            :loading="loading_cancelAuth"
            :title="$t('role.cancelAuthConfirm')"
            :tip-content="$t('role.tip_cancelAuth', { userName: curUserData.cnName })"
            @confirm="confirm_cancelAuth"
        ></confirmDialog>
    </div>
</template>

<script setup>
import { ref, shallowRef, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { getRoleUsers, setUserRoleAuth, cancelUserRoleAuth } from '@/api/role';
import { useUserStore } from '@/pinia/modules/user.js';
import confirmDialog from '@/components/confirmDialog.vue';
// import pagenation from '@/components/pagenation.vue';
import selectEntity from '@/components/selectEntity.vue';
import { onClickOutside } from '@vueuse/core';
import CSSVariables from '@/style/js.module.scss';

// 定义 model
const visible = defineModel('visible', { type: Boolean, default: false });
// 接受外部传参
const props = defineProps({
    roleData: {
        type: Object,
        default: () => ({})
    },
    // 触发 drawer 的 class , 用于在 clickoutside 时, 过滤掉触发元素的点击事件
    triggerElClass: {
        type: Array,
        default: () => ([])
    }
});
const emits = defineEmits([
    'update:roleData',
    'updateRole'
]);

// 多语言
const { t } = useI18n();

// 取 pinia 数据
const store = useUserStore();

const { elnamespace } = CSSVariables;

// 全局逻辑
// 关闭 drawer
const drawerRef = ref(null);
const closeDrawer = () => {
    drawerRef.value.handleClose();
};
// drawer 点击空白处关闭(个别元素忽略, 点击不关闭)
const roleDrawerRef = ref(null);
onClickOutside(
    roleDrawerRef,
    (e) => {
        closeDrawer();
    },
    {
        // 忽略外部入口的点击, 忽略 dialog 之类的点击
        ignore: props.triggerElClass.concat([`.${elnamespace}-overlay`])
    }
);

// 添加成员弹框
// visible
const visible_addRoleUser = ref(false);
// loading
const loading_addRoleUser = ref(false);
// 已选中的成员 id
const allMemberIds = computed(() => {
    return tableData.value.map(item => item.userId);
});
// 添加成员
const trigger_addRoleUser = () => {
    visible_addRoleUser.value = true;
};
// 批量授权已选中成员
const batchAuthUser = (data) => {
    if (!Array.isArray(data) || !data.length) {
        ElMessage.warning(t('role.noUserSelected'));
        return;
    }

    // 显示 loading
    loading_addRoleUser.value = true;

    // 发送请求
    setUserRoleAuth({
        orgId: store.orgId,
        userId: store.userId,
        deletFlag: 0,
        roleId: props.roleData.id,
        userIdList: data.map((item) => item.id)
    }).then((res) => {
        if (res.code === 10000) {
            // 请求成功

            // 更新表格数据
            getTableData();
            // 关闭弹框
            visible_addRoleUser.value = false;
        } else {
            // 请求失败

            // 提示错误信息
            ElMessage.error(res.message);
        }

        // 取消 loading
        loading_addRoleUser.value = false;
    });
};

// 成员列表
// 表格 loading
const tableLoading = ref(false);
// 表格数据
const tableData = shallowRef([]);
// 表格列
const tableColumns = [
    {
        label: t('role.member'),
        prop: 'cnName',
        minWidth: 40
    },
    {
        label: t('role.belongDepartment'),
        prop: 'cnDepartName',
        minWidth: 60
    },
    {
        label: t('mailbox'),
        prop: 'email',
        minWidth: 105
    },
    {
        label: t('phoneNumber'),
        prop: 'mobile',
        minWidth: 75
    },
    {
        label: t('status'),
        prop: 'status',
        formatter: (row) => {
            // 0 启用 1禁用 2 离职
            switch (row.status) {
                case 0:
                    return t('enabled');
                case 1:
                    return t('disabled');
                case 2:
                    return t('resigned');
            }
        },
        minWidth: 50
    },
    {
        label: t('operate'),
        prop: 'operate',
        minWidth: 46
    }
];
// 获取表格数据
const getTableData = () => {
    // 显示 loading
    tableLoading.value = true;

    getRoleUsers({
        orgId: store.orgId,
        userId: store.userId,
        roleId: props.roleData.id
    }).then((res) => {
        if (res.code === 10000) {
            // 请求成功

            // 更新表格数据
            tableData.value = handleTableData(res.data);
            // 更新 roleData 的 userNums
            emits('update:roleData', Object.assign(props.roleData, { userNums: tableData.value.length }));
        } else {
            // 请求失败

            // 清空表格数据
            tableData.value = [];
            // 提示错误信息
            ElMessage.error(res.message);
        }

        // 取消 loading
        tableLoading.value = false;
    });
};
// 处理表格数据
const handleTableData = (data) => {
    if (!Array.isArray(data)) return [];

    return data;
};

// // 表格分页
// // 分页配置
// const pageNationParams = {
//     url: '/v2-privilege/role/user',
//     method: 'post',
//     data: {
//         roleId: props.roleData.id
//     }
// };
// // 分页数据请求完毕, 更新表格数据
// function updateData(data) {
//     tableData.value = data;
// }

// 取消授权确认弹框
// visible
const visible_cancelAuth = ref(false);
// loading
const loading_cancelAuth = ref(false);
// 当前正在操作的用户的数据
const curUserData = ref({});
// 打开弹框
const trigger_cancelAuth = (row) => {
    curUserData.value = row;
    visible_cancelAuth.value = true;
};
// 确认
const confirm_cancelAuth = () => {
    // 显示 loading
    loading_cancelAuth.value = true;

    // 发送请求
    cancelUserRoleAuth({
        orgId: store.orgId,
        userId: store.userId,
        deletFlag: 1,
        roleId: props.roleData.id,
        userIdList: [curUserData.value.userId]
    }).then((res) => {
        if (res.code === 10000) {
            // 请求成功

            // 更新表格数据
            tableData.value = tableData.value.filter((item) => item.userId !== curUserData.value.userId);
            // 更新 roleData 的 userNums
            emits('update:roleData', Object.assign(props.roleData, { userNums: tableData.value.length }));
            // 关闭弹框
            visible_cancelAuth.value = false;
        } else {
            // 请求失败

            // 提示错误信息
            ElMessage.error(res.message);
        }

        // 取消 loading
        loading_cancelAuth.value = false;
    });
};

// 获取数据
watch(
    () => props.roleData.id,
    (val) => {
        if (val) getTableData();
    },
    {
        immediate: true
    }
);
</script>

<style lang="scss" scoped>
.roleDrawer {
    ::v-deep .#{$elnamespace}-drawer {
        .roleDrawer-header {
            display: flex;
            align-items: center;
        }

        .roleDrawer-title {
            flex: 1;
            font-size: var(--#{$elnamespace}-font-size-large);
            font-weight: var(--#{$elnamespace}-font-weight-primary);
            color: var(--#{$elnamespace}-text-color-primary);
        }

        .roleDrawer-body {
            height: 100%;
        }
    }
}
</style>