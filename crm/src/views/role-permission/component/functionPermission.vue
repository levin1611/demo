<template>
    <div v-loading="loading" class="funcPerm">
        <!-- tip -->
        <div class="funcPerm-tip" v-if="!['memebrDetail'].includes(props.from)">{{ $t('role.tip_funcPerm') }}</div>

        <!-- 权限树展开折叠控制按钮 -->
        <div class="funcPerm-foldTreeBtns">
            <!-- 展开全部 -->
            <el-button
                @click="openLevels(-1)"
                class="useBrandColor"
            >{{ $t('role.expandAllLevel') }}</el-button>
            <!-- 展开一级 -->
            <el-button
                @click="openLevels(1)"
                class="useBrandColor"
            >{{ $t('role.expandOneLevel') }}</el-button>
            <!-- 展开二级 -->
            <el-button
                @click="openLevels(2)"
                class="useBrandColor"
            >{{ $t('role.expandTwoLevel') }}</el-button>
            <!-- 折叠全部 -->
            <el-button
                @click="openLevels(0)"
                class="useBrandColor"
            >{{ $t('role.foldAllLevel') }}</el-button>
        </div>

        <!-- 权限树 -->
        <el-scrollbar
            max-height="calc(100% - 98px)"
            style="width: 425px;"
        >
            <el-tree
                :data="treeData"
                :props="treeProps"
                node-key="id"
                :default-checked-keys="defaultCheckedKeys"
                :default-expanded-keys="defaultExpandedKeys"
                :show-checkbox="true"
                multiple
                :expand-on-click-node="false"
                :render-after-expand="false"
                ref="treeRef"
                class="funcPerm-tree"
            >
                <template #default="{ node }">
                    <span class="funcPerm-tree-nodeContent">
                        <!-- 图标 -->
                        <el-icon>
                            <!-- 文件夹 -->
                            <svg
                                v-if="Array.isArray(node.childNodes) && node.childNodes.length"
                                aria-hidden="true"
                                class="svg-icon"
                            >
                                <use xlink:href="#custom-fp-paper-file"></use>
                            </svg>
                            <!-- 叶子结点 -->
                            <svg
                                v-else
                                aria-hidden="true"
                                class="svg-icon"
                            >
                                <use xlink:href="#custom-authority-tag"></use>
                            </svg>
                        </el-icon>
                        <!-- 标题 -->
                        <span>{{ node.label }}</span>
                    </span>
                </template>
            </el-tree>
        </el-scrollbar>
    </div>
</template>

<script setup>
import { nextTick, ref, watch, toRaw } from 'vue';
import { flattenObjectArray } from '@/utils/dataProcess.js';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/pinia/modules/user.js';
import { getRolePerm } from '@/api/role';

// props 接收
const props = defineProps({
    roleData: {
        type: Object,
        default: () => ({})
    },
    disabled: {
        type: Boolean,
        default: false
    },
    from: {
        default: ''
    }
});

// 取当前显示的语种
const { t, locale } = useI18n();

// 取 pinia 数据
const store = useUserStore();

// 全局数据定义
// loading
let loading = ref(false);
// tree ref
const treeRef = ref(null);

// 权限树展开折叠控制按钮
// 递归设置树结点展开状态
// arr: 树结点数组, bool: 展开/折叠 boolean 值, limitLevel: 是否使用 bool 的层级分界点, curLevel: 当前层级
const setNodeExpandByLevel = (arr, bool, limitLevel = -1, curLevel = 0) => {
    return arr.map(item => {
        // 当前层级大于分界点时, 设置 expand 为 bool, 否则为 !bool
        item.expand = curLevel > limitLevel ? bool : !bool;
        // 如果有子结点, 递归设置子结点的展开状态, 层级 + 1
        if (Array.isArray(item.list) && item.list.length > 0) {
            setNodeExpandByLevel(item.list, bool, limitLevel, curLevel + 1);
        }
        // return
        return item;
    });
};
// 传入 0 折叠全部, -1 展开全部, 其他 level 从 1 开始, 代表展开的层级
const openLevels = (level) => {
    // 暂存原始 treeData - toRaw 处理以避免数据修改触发视图更新
    let result = toRaw(treeData.value);
    // 调用递归方法更新 treeData 结点的展开状态
    switch (level) {
        case 0: // 折叠全部
            result = setNodeExpandByLevel(treeData.value, false);
            break;
        case -1: // 展开全部
            result = setNodeExpandByLevel(treeData.value, true);
            break;
        default: // 其他正整数
            if (Number.isInteger(level) && level > 0) {
                // 展开 level 层级
                result = setNodeExpandByLevel(treeData.value, false, level - 1);
            }
    }

    // 更新平铺 treeData
    flattedTreeData = flattenObjectArray(result, 'list');
    // 更新 defaultExpandedKeys
    defaultExpandedKeys.value = flattedTreeData.filter(item => item.expand).map(item => item.id);
    // 更新 treeData
    nextTick(() => {
        treeData.value = result;
    });
};

// tree 数据定义
let treeData = ref([]);
let treeProps = ref({
    label: locale.value === 'zh' ? 'permissionCn' : 'permissionEn',
    children: 'list',
    disabled: () => {
        return props.disabled;
    }
});
// 平铺开的一维数组 treeData
let flattedTreeData = [];
let defaultCheckedKeys = ref([]);
let defaultExpandedKeys = ref([]);

// 获取权限树数据
const getTreeData = () => {
    // 显示 loading
    loading.value = true;
    // 清空旧数据
    clearTreeData();

    // 接口请求
    getRolePerm({
        orgId: store.orgId,
        type: 1,
        roleId: props.roleData.id
    }).then(res => {
        if (res.code === 10000) {
            // 请求成功

            // 暂存数组
            const menuList = Array.isArray(res.data && res.data.list) ? res.data.list : [];
            // 更新平铺数组
            flattedTreeData = flattenObjectArray(menuList, 'list');
            // 筛选平铺数组, 设置默认选中的结点
            defaultCheckedKeys.value = (props.roleData.nameCn === '系统管理员' ? flattedTreeData : flattedTreeData.filter(item => item.value && !(Array.isArray(item.list) && item.list.length))).map(item => item.id);
            // 置空默认展开的结点
            defaultExpandedKeys.value = [];
            // 更新 treeData
            treeData.value = menuList;

            // 默认展开一级
            openLevels(1);
        } else {
            // 提示错误
            ElMessage.error(res.message);
        }

        // 关闭 loading
        loading.value = false;
    });
};
// 清空权限树数据
const clearTreeData = () => {
    treeData.value = [];
    flattedTreeData = [];
    defaultCheckedKeys.value = [];
    defaultExpandedKeys.value = [];
};
// 监听 roleData.id 变化, 触发 treeData 数据请求
watch(
    () => props.roleData.id,
    (val) => {
        if (val) {
            getTreeData();
        }
    },
    {
        immediate: true
    }
);

// 导出给外部使用
// 保存数据 方法
const saveData = () => {
    // 数据未请求成功, return false
    if (!treeData.value.length || !treeRef.value) {
        return false;
    }

    // 获取所有已选中/半选中 id 并返回
    const allCheckedKeys = treeRef.value.getCheckedKeys();
    const allHalfCheckedKeys = treeRef.value.getHalfCheckedKeys();
    return [allCheckedKeys, allHalfCheckedKeys];
};
// 数据是否已变更 方法
const checkDataChanged = () => {
    const checkedKeys = treeRef.value.getCheckedKeys();
    return (JSON.stringify(checkedKeys.sort()) !== JSON.stringify(defaultCheckedKeys.value.sort()));
};
// 更新初始设置
const updateInitSet = (data) => {
    defaultCheckedKeys.value = data;
};
// 导出
defineExpose({
    saveData,
    checkDataChanged,
    updateInitSet
});
</script>

<style lang="scss" scoped>
.funcPerm {
    &-tip {
        font-size: 12px;
        margin-bottom: 12px;
        color: var(--#{$elnamespace}-text-color-regular);
    }

    &-foldTreeBtns {
        margin-bottom: 10px;
    }

    &-tree {
        ::v-deep &-nodeContent {
            i {
                position: relative;
                top: 3px;
                margin-right: 8px;
                font-size: 18px;
            }
        }
    }
}
</style>