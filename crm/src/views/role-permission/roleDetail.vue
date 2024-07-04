<!-- 角色 详情页 -->
<template>
    <div
        v-loading="loading"
        class="roleDetail"
    >
        <!-- header -->
        <div
            v-if="!noHeader"
            class="roleDetail-header"
        >
            <!-- header-left -->
            <div class="roleDetail-header-left">
                <!-- 角色名称 -->
                <div class="roleDetail-title roleDetail-roleName">{{ roleData.nameCn }}</div>
                <!-- 编辑按钮 -->
                <i
                    v-if="!['系统管理员', '普通成员', '部门管理员'].includes(roleData.nameCn)"
                    @click="editRole"
                    class="custom custom-edit-2 ml-3 cursor-pointer"
                ></i>
            </div>
            <!-- header-right -->
            <div class="roleDetail-header-right">
                <!-- 复制权限并新建角色 -->
                <el-button
                    type="primary"
                    @click="copyRole">{{ $t('role.copyPermissionNCreateRole') }}</el-button>
                <!-- 删除角色 -->
                <el-button
                    v-if="!['系统管理员', '普通成员', '部门管理员'].includes(roleData.nameCn)"
                    :disabled="(roleData.userNums > 0)"
                    @click="trigger_deleteRole"
                    :class="{ useBrandColor: !roleData.userNums, useDisableColor: roleData.userNums }"
                >{{ $t('role.deleteRole') }}</el-button>
            </div>
        </div>

        <!-- 权限 tabs -->
        <el-tabs
            v-model="currTab"
            class="roleDetail-permission-tabs"
            :class="noHeader ? `${elnamespace}-secondary-tabs` : false"
        >
            <!-- 功能权限 -->
            <el-tab-pane :label="$t('role.functionPermission')" name="functionPermission">
                <functionPermission
                    :key="`functionPermission_${roleData.id}`"
                    :roleData="roleData"
                    :from='props.from'
                    :disabled="disabled"
                    ref="funcPermRef"
                    class="roleDetail-permission-tabs-compo"
                ></functionPermission>
            </el-tab-pane>
            <!-- 字段权限 -->
            <el-tab-pane :label="$t('role.fieldPermission')" name="fieldPermission">
                <fieldPermission
                    :key="`fieldPermission_${roleData.id}`"
                    :from="props.from"
                    :roleData="roleData"
                    :disabled="disabled"
                    ref="fieldPermRef"
                    class="roleDetail-permission-tabs-compo"
                ></fieldPermission>
            </el-tab-pane>
            <!-- 数据权限 -->
            <el-tab-pane :label="$t('role.dataPermission')" name="dataPermission">
                <dataPermission
                    :key="`dataPermission_${roleData.id}`"
                    :roleData="roleData"
                    :disabled="disabled"
                    :from="props.from"
                    ref="dataPermRef"
                    class="roleDetail-permission-tabs-compo"
                ></dataPermission>
            </el-tab-pane>
        </el-tabs>

        <!-- footer -->
        <div
            v-if="!noFooter"
            class="roleDetail-footer"
        >
            <!-- 保存 -->
            <el-button
                v-if="!disabled"
                type="primary"
                @click="save">{{ $t('save') }}</el-button>
            <!-- 取消 -->
            <el-button
                @click="cancel()"
                class="useBrandColor"
            >{{ $t('cancel') }}</el-button>
        </div>

        <!-- 新建/编辑角色 弹框 -->
        <EditRole
            v-model:visible="visible_editRole"
            :operate-type="curOperateType"
            :role-data="roleData"
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

        <!-- 离开确认 弹框 -->
        <confirmDialog
            v-model:visible="visible_leaveConfirm"
            :title="$t('leaveConfirm')"
            :tip-content="$t('role.tip_leaveRoleDetail')"
            @confirm="cancel(true)"
        ></confirmDialog>
    </div>
</template> 

<script setup>
import { ref, toRef, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/pinia/modules/user.js';
import functionPermission from '@/views/role-permission/component/functionPermission';
import fieldPermission from '@/views/role-permission/component/fieldPermission';
import dataPermission from '@/views/role-permission/component/dataPermission';
import EditRole from './modal/editRole.vue';
import confirmDialog from '@/components/confirmDialog.vue';
import { deleteRole, saveRoleAuthSet } from '@/api/role';
import CSSVariables from '@/style/js.module.scss';

// 定义 model
const visible = defineModel('visible', { type: Boolean, default: false });
// 接收 props
const props = defineProps({
    roleData: {
        type: Object,
        default: () => ({})
    },
    disabled: {
        type: Boolean,
        default: true
    },
    noHeader: {
        type: Boolean,
        default: false
    },
    noFooter: {
        type: Boolean,
        default: false
    },
    from: {
        default: ''
    }
});
const emits = defineEmits([
    'update:roleData',
    'updateRole'
]);

const { t } = useI18n();

const { elnamespace } = CSSVariables;

// 取 pinia 数据
const store = useUserStore();

// 全局数据
const loading = ref(false);
// 角色是否有变更 -- 目前只限于编辑/复制/删除角色, 之后看要不要处理权限变更
let roleChanged = ref(false);
// 禁用编辑
const disabled = toRef(props, 'disabled');

// header
// 编辑/复制角色
// 弹框显隐
let visible_editRole = ref(false);
// 当前操作类型
let curOperateType = ref('');
// 编辑角色
const editRole = () => {
    curOperateType.value = 'edit';
    visible_editRole.value = true;
};
// 复制并新建角色
const copyRole = () => {
    curOperateType.value = 'copy';
    visible_editRole.value = true;
};
// 操作角色成功
const operateRoleSuccess = (data) => {
    if (curOperateType.value === 'edit') {
        // 编辑角色

        // 更新 roleData
        emits('update:roleData', Object.assign(props.roleData, data));
        // 标记当前角色数据已变更, 页面关闭时刷新当前页数据
        // 如果是复制出来的角色, 则还是需要跳到最后一页, 所以不改变 roleChanged
        if (roleChanged.value !== -1) {
            roleChanged.value = 0;
        }
    } else {
        // 复制并新建角色

        // 标记当前角色数据已变更, 页面关闭时刷新全量数据(跳到最后一页)
        roleChanged.value = -1;
        // 如果接口返回了被复制角色的数据, 则直接用此数据继续编辑; 否则, 关闭当前详情回到列表页
        if (Array.isArray(data) && data[0]) {
            // 更新 roleData
            emits('update:roleData', data[0]);
        } else {
            cancel();
        }
    }
};

// 删除角色 弹框
// 弹框显隐
let visible_deleteRole = ref(false);
// 弹框 loading
let loading_deleteRole = ref(false);
// 删除角色 触发
const trigger_deleteRole = (data) => {
    if (props.roleData.userNums > 0) {
        return;
    }

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
        id: props.roleData.id
    }).then((res) => {
        if (res.code === 10000) {
            // 删除成功

            // 标记当前角色数据已变更, 页面关闭时刷新当前页数据
            roleChanged.value = 0;
            // 隐藏弹框
            visible_deleteRole.value = false;
            // 关闭详情页
            cancel(true);
        } else {
            // 删除失败

            ElMessage.error(res.message);
        }

        // 取消 loading
        loading_deleteRole.value = false;
    });
};

// body
// 权限 tabs
const currTab = ref('functionPermission');

// footer
// 获取组件实例
// const compoRef = ref(null);
const funcPermRef = ref(null);
const fieldPermRef = ref(null);
const dataPermRef = ref(null);
// 保存
const save = () => {
    // 调用组件内部的 saveData 方法获取要保存的数据
    const funcPermData = funcPermRef.value?.saveData();
    const [allCheckedKeys, allHalfCheckedKeys] = funcPermData;
    const fieldPermData = fieldPermRef.value?.saveData();
    const dataPermData = dataPermRef.value?.saveData();

    // 获取数据失败, 弹出警告, return
    if (!(allCheckedKeys && allHalfCheckedKeys && fieldPermData && dataPermData)) {
        ElMessage.error(t('role.error_getPermData'));
        return;
    }

    // 功能权限和字段权限为空判断
    // 数据权限必然选中"本人", 不用判断
    if (!allCheckedKeys.length && !allHalfCheckedKeys.length) {
        ElMessage.error(t('role.error_emptyPermData', { name: t('role.functionPermission') }));
        return;
    }
    if (!fieldPermData.length) {
        ElMessage.error(t('role.error_emptyPermData', { name: t('role.fieldPermission') }));
        return;
    }

    loading.value = true;
    // 发送请求
    saveRoleAuthSet({
        category: 2,
        id: props.roleData.id,
        parentRoleId: props.roleData.adminRoleId,
        orgId: store.orgId,
        permissionIds: [].concat(allCheckedKeys, allHalfCheckedKeys, fieldPermData),
        userId: store.userId,
        structure: dataPermData.data,
        flag: dataPermData.setType
    }).then(res => {
        if (res.code === 10000) {
            // 请求成功

            ElMessage.success(t('saveSuccess'));
            // 更新权限设置的"默认数据", 避免保存成功后返回时仍然报错
            funcPermRef.value.updateInitSet(allCheckedKeys);
            fieldPermRef.value.updateInitSet(fieldPermData);
            dataPermRef.value.updateInitSet(dataPermData);
            // 更新 roleData (的 setType)
            emits('update:roleData', Object.assign(props.roleData, { flag: dataPermData.setType }));
        } else {
            // 请求失败

            ElMessage.error(res.message);
        }
        loading.value = false;
    });
};
// 取消
const cancel = (forceClose) => {
    // 非禁用状态 + 未要求强制关闭, 则需要判断设置数据是否变更
    if (!disabled.value && forceClose !== true) {
        // 调用组件内部的 checkDataChanged 方法判断数据是否有变更
        const funcPermDataChanged = funcPermRef.value?.checkDataChanged();
        const fieldPermDataChanged = fieldPermRef.value?.checkDataChanged();
        const dataPermDataChanged = dataPermRef.value?.checkDataChanged();

        // 有任一类数据变更, 弹出离开确认框, return
        if (funcPermDataChanged || fieldPermDataChanged || dataPermDataChanged) {
            visible_leaveConfirm.value = true;
            return;
        }
    }

    // 要求强制关闭, 或者设置数据未改变, 则关闭页面
    visible.value = false;
};

// 离开确认弹框
const visible_leaveConfirm = ref(false);

// 生命周期钩子
onBeforeUnmount(() => {
    // 组件关闭前确认当前是否有编辑/修改/删除角色数据, 有的话发送信号要求外部做相应的数据更新操作
    if (roleChanged.value !== false) {
        emits('updateRole', roleChanged.value);
    }
});
</script>

<style lang="scss" scoped>
@use '@/style/detailPage.scss' as detailPage;

.roleDetail {
    @include detailPage.detailPage();
    display: flex;
    flex-direction: column;

    &-permission-compo {
        height: 0;
        flex: 1;
        overflow: hidden;
    }

    &-permission-tabs {
        height: 0;
        flex: 1;
        display: flex;
        flex-direction: column;

        :deep(.#{$elnamespace}-tabs__header) {
            margin-bottom: 12px;
        }

        ::v-deep {
            .#{$elnamespace}-tabs__content {
                flex: 1;
                height: 100%;
            }
            .#{$elnamespace}-tab-pane {
                height: 100%;
            }
        }

        &-compo {
            height: 100%;
        }
    }

    &-footer {
        padding: 10px 0;
        border-top: 1px solid var(--#{$elnamespace}-border-color-light);
    }
}
</style>