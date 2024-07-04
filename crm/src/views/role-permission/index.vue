<!-- 角色权限, index -->
<template>
    <!-- 角色表格页 -->
    <div
        v-show="!visible_roleDetail"
        class="role"
    >
        <!-- header -->
        <div class="role-header">
            <div class="role-header-left">
                <div class="role-title">{{ $t('role.rolePermission') }}</div>
                <div class="role-title-tip">{{ $t('role.tip_rolePermission') }}</div>
            </div>
            <div class="role-header-right">
                <el-button
                    type="primary"
                    @click="createRole"
                >{{ $t('role.createRole') }}</el-button>
            </div>
        </div>

        <!-- table -->
        <el-table
            :data="tableData"
            stripe
            :cell-class-name="getCellClassName"
            max-height="calc(100% - 106px)"
            height="100%"
            highlight-current-row
            v-loading="tableLoading"
            :show-overflow-tooltip="{ showAfter: 500 }"
            ref="tableRef"
            @row-click="viewRoleUser"
            class="role-table"
        >
            <!-- 空数据插槽 -->
            <template #empty>
                <default-empty />
            </template>

            <!-- 表格列 -->
            <el-table-column
                v-for="column in tableColumns"
                :key="column.prop"
                :label="column.label"
                :prop="column.prop"
                :min-width="column.minWidth"
            >
                <!-- 角色列 -->
                <template
                    v-if="column.prop === 'name'"
                    #default="{ row }"
                >
                    <!-- 角色名 -->
                    <span>{{ row.nameCn }}</span>
                    <!-- 编辑角色 -->
                    <!-- 预设角色, 不可编辑名称 -->
                    <el-tooltip
                        v-if="!['系统管理员', '普通成员', '部门管理员'].includes(row.nameCn)"
                        :content="$t('edit')"
                        placement="top"
                    >
                        <i
                            @click.stop="editRole(row)"
                            class="custom custom-edit-2 role-table-roleName-editIcon"
                        ></i>
                    </el-tooltip>
                </template>
                <!-- 成员列 -->
                <template
                    v-else-if="column.prop === 'userNums'"
                    #default="{ row }"
                >
                    <!-- 成员数量, 点击打开成员列表页 -->
                    <el-link
                        type="primary"
                        class="role-table-userNums"
                    >{{ row.userNums }}</el-link>
                </template>
                <!-- 操作列 -->
                <template
                    v-else-if="column.prop === 'operate'"
                    #default="{ row }"
                >
                    <!-- 查看角色 -->
                    <el-link
                        type="primary"
                        @click="viewRole(row)"
                    >{{ row.nameCn === '系统管理员' ? $t('role.viewRole') : $t('role.editRole') }}</el-link>
                    <!-- 复制并新建角色 -->
                    <el-link
                        type="primary"
                        @click="copyRole(row)"
                    >{{ $t('role.copyNcreate') }}</el-link>
                    <!-- 删除角色 -->
                    <!-- 预设角色 || 有成员正在使用的角色, 不可删除, 不显示此按钮 -->
                    <el-link
                        v-if="!['系统管理员', '普通成员', '部门管理员'].includes(row.nameCn)"
                        :type="(row.userNums === 0) ? 'danger' : undefined"
                        :disabled="(row.userNums > 0)"
                        @click="trigger_deleteRole(row)"
                    >{{ $t('delete') }}</el-link>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <pagenation
            layout="total, prev, pager, next, sizes"
            :queryConfig="pageNationParams"
            :pager-count="5"
            ref="pageNationRef"
            @changeBefore="beforeChangePage"
            @updateData="updateData"
        ></pagenation>

        <!-- 新建/编辑角色 弹框 -->
        <EditRole
            v-model:visible="visible_editRole"
            :operate-type="curOperateType"
            :role-data="curRoleData"
            @operateSuccess="operateRoleSuccess"
        ></EditRole>

        <!-- 删除角色确认 弹框 -->
        <confirmDialog
            v-model:visible="visible_deleteRole"
            :loading="loading_deleteRole"
            :title="$t('deleteConfirm')"
            :tip-content="$t('role.tip_deleteRole')"
            @confirm="confirm_deleteRole"
        ></confirmDialog>
    </div>

    <!-- 详情页 -->
    <RoleDetail
        v-if="visible_roleDetail"
        v-model:visible="visible_roleDetail"
        v-model:role-data="curRoleData"
        :disabled="curRoleData.nameCn === '系统管理员'"
        @updateRole="updateRoleList"
        @close="visible_roleDetail = false"
        :style="{ height: pageHeight }"
    ></RoleDetail>

    <!-- 侧滑页 -->
    <RoleDrawer
        v-if="visible_roleDrawer"
        v-model:visible="visible_roleDrawer"
        v-model:role-data="curRoleData"
        :triggerElClass="['.role-table']"
        @updateRole="updateRoleList"
        class="role-drawer"
    ></RoleDrawer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { deleteRole } from '@/api/role';
import RoleDetail from './roleDetail.vue';
import RoleDrawer from './roleDrawer.vue';
import EditRole from './modal/editRole.vue';
import confirmDialog from '@/components/confirmDialog.vue';
import pagenation from '@/components/pagenation.vue';
import { useUserStore } from '@/pinia/modules/user.js';

const store = useUserStore();

// 引入 i18n 方法
const { t } = useI18n();

// 组件 options
defineOptions({
    name: 'Role-index'
});

// 页面高度
const pageHeight = ref('calc(100vh - 56px)');

// 表格配置
// 表格 ref
const tableRef = ref(null);
// 表格数据
let tableData = ref([]);
// 表格列
const tableColumns = [
    {
        label: t('role.role'),
        prop: 'name',
        minWidth: 150
    },
    {
        label: t('role.member'),
        prop: 'userNums',
        minWidth: 120
    },
    {
        label: t('operate'),
        prop: 'operate',
        minWidth: 100
    }
];
// 表格单元格 class name
const getCellClassName = ({ row, column, rowIndex, columnIndex }) => {
    // 角色名称列, 单独设置样式
    if (column.property === 'name') {
        return 'role-table-roleName-cell';
    }
};
// 获取表格数据 loading
let tableLoading = ref(true);
// 处理表格数据
const handleTableData = (data) => {
    if (!Array.isArray(data)) {
        return [];
    }

    return data;
};

// 表格分页
// 获取分页组件实例
const pageNationRef = ref(null);
// 分页配置
const pageNationParams = {
    url: '/v2-privilege/role/list',
    method: 'post',
    data: {
        orgId: store.orgId,
        userId: store.userId,
        flag: 3, // 1:询盘云菜单版本，2:企业菜单自建版本,3:查询企业角色
        pageFlag: true
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

// 新增/编辑/复制角色
// 当前正在操作的角色的数据
let curRoleData = ref({});
// 弹框显隐
let visible_editRole = ref(false);
// 当前操作类型
let curOperateType = ref('');
// 新建角色
const createRole = () => {
    curRoleData.value = {};
    curOperateType.value = 'new';
    visible_editRole.value = true;
};
// 编辑角色
const editRole = (data) => {
    curRoleData.value = data;
    curOperateType.value = 'edit';
    visible_editRole.value = true;
};
// 复制并新建角色
const copyRole = (data) => {
    curRoleData.value = data;
    curOperateType.value = 'copy';
    visible_editRole.value = true;
};
// 操作角色成功
const operateRoleSuccess = (data) => {
    // 新建成功
    if (['new', 'copy'].includes(curOperateType.value)) {
        // 新建成功后, 回到第一页刷新表格显示最新角色数据
        pageNationRef.value.handleCurrentChange(999999999);
        return;
    }

    // 编辑成功
    if (curOperateType.value === 'edit') {
        curRoleData.value.nameCn = data.nameCn;
        curRoleData.value.remark = data.remark;
        return;
    }
};

// 查看角色使用详情
const viewRoleUser = (data, column, event) => {
    // 点击操作列不触发
    if (column.property === 'operate') {
        return;
    }

    curRoleData.value = data;
    curOperateType.value = 'viewUser';
    visible_roleDrawer.value = true;
};

// 查看角色
const viewRole = (data) => {
    curRoleData.value = data;
    curOperateType.value = 'view';
    visible_roleDetail.value = true;
};

// 删除角色 弹框
// 弹框显隐
let visible_deleteRole = ref(false);
// 弹框 loading
let loading_deleteRole = ref(false);
// 删除角色 触发
const trigger_deleteRole = (data) => {
    // 用户使用中, 不可删除, return
    if (data.userNums > 0) {
        return;
    }

    curRoleData.value = data;
    loading_deleteRole.value = false;
    visible_deleteRole.value = true;
};
// 删除角色 确认
const confirm_deleteRole = () => {
    // 显示 loading
    loading_deleteRole.value = true;

    // 发送请求
    deleteRole({
        orgId: store.orgId,
        userId: store.userId,
        type: 2,
        id: curRoleData.value.id
    }).then((res) => {
        if (res.code === 10000) {
            // 删除成功

            // 删除成功后, 刷新表格
            pageNationRef.value.handleCurrentChange();
            // 隐藏弹框
            visible_deleteRole.value = false;
        } else {
            // 删除失败

            ElMessage.error(res.message);
        }

        // 取消 loading
        loading_deleteRole.value = false;
    });
};

// 详情页
// 详情页显隐
let visible_roleDetail = ref(false);
// 详情页触发角色数据更新, 直接刷新表格
// 参数 refreshType 可指定 1: 回到首页, 0: 刷新当前页, -1: 刷新到最后一页, 其他数字: 跳转到指定页
const updateRoleList = (refreshType) => {
    let toPage = refreshType;
    if (refreshType === 0 || !Number.isInteger(refreshType)) {
        // 刷新当前页, 不传页码
        toPage = undefined;
    } else if (refreshType === -1) {
        // 跳到最后一页, 传个超大页码
        toPage = 999999999;
    }
    pageNationRef.value.handleCurrentChange(toPage);
};

// 侧滑页
// 侧滑页显隐
let visible_roleDrawer = ref(false);

// onmounted
onMounted(() => {
    // 查询表格第一页数据
    pageNationRef.value.handleCurrentChange(1);
});
</script>

<style lang="scss" scoped>
@use '@/style/tablePage.scss' as tablePage;

.role {
    @include tablePage.tablePage();

    height: v-bind(pageHeight);

    &-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        &-left {
        }
        &-right {
            display: flex;
            align-items: center;
        }
    }

    &-table {
        ::v-deep &-roleName {
            &-cell {
                &:hover {
                    .role-table-roleName-editIcon {
                        display: inline-block;
                        color: var(--#{$elnamespace}-text-color-regular);
                    }
                }
            }

            &-editIcon {
                display: none;
                cursor: pointer;
                font-size: 16px;
                line-height: 24px;
                margin-left: 12px;
                vertical-align: baseline;
            }
        }
    }

    &-drawer {
        ::v-deep .#{$elnamespace}-drawer {
            height: calc(100vh - 56px);
            margin-top: 56px;
        }
    }
}
</style>
