 <!-- 选择权限实体(成员, 部门, 成员组, 当前只有) -->
<template>
    <el-dialog
        v-model="visible"
        :title="$t('role.addMember')"
        width="800px"
        :align-center="true"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @open="handleOpen"
        class="selEntModal"
    >
        <!-- loading 用的无意义 div -->
        <div ref="dialogBodyRef"></div>

        <!-- body -->
        <el-row class="selEntModal-body-container">
            <!-- 部门用户树 -->
            <el-col
                :span="12"
                class="selEntModal-body-left"
            >
                <customtree
                    v-if="initTree"
                    :data="treeData"
                    :currentChecked="currentChecked"
                    wrapHeight="45vh"
                    showSearch="input"
                    show-checkbox
                    ref="customTreeRef"
                    @checkChange="handleCheckChange"
                ></customtree>
            </el-col>
            <!-- 已选中成员展示 -->
            <el-col
                :span="12"
                class="selEntModal-body-right"
            >
                <div class="selEntModal-selectedEnts">
                    <!-- header -->
                    <div class="selEntModal-selectedEnts-header">
                        <!-- 已选中 N 项 -->
                        <span class="selEntModal-selectedEnts-header-title">
                            <i18n-t keypath="selected_items">
                                <template #count>
                                    <el-text
                                        type="primary"
                                        class="useBrandColor"
                                    >{{ tableData.length }}</el-text>
                                </template>
                            </i18n-t>
                        </span>
                        <!-- 清空 -->
                        <el-link
                            type="primary"
                            @click="removeCheckedUser('all')"
                            class="selEntModal-selectedEnts-header-clear"
                        >{{ $t('clear') }}</el-link>
                    </div>
                    <!-- table -->
                    <el-table
                        :data="tableData"
                        max-height="45vh"
                        :show-overflow-tooltip="{ showAfter: 500 }"
                        ref="entityTableRef"
                        class="selEntModal-selectedEnts-table"
                    >
                        <!-- 空数据插槽 -->
                        <template #empty>
                            <default-empty />
                        </template>

                        <!-- 姓名 -->
                        <el-table-column
                            prop="name"
                            :label="$t('role.member')"
                        ></el-table-column>
                        <!-- 操作 -->
                        <el-table-column
                            :label="$t('operate')"
                        >
                            <template #default="{ row }">
                                <el-link
                                    type="primary"
                                    @click="removeCheckedUser(row, true)"
                                >{{ $t('delete') }}</el-link>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-col>
        </el-row>

        <!-- footer -->
        <template #footer>
            <div class="dialog-footer">
                <!-- cancel -->
                <el-button
                    @click="visible = false"
                    class="useBrandColor"
                >{{ $t('cancel') }}</el-button>
                <!-- confirm -->
                <el-button
                    type="primary"
                    @click="submit"
                >{{ $t('confirm') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, shallowRef, toRef, toRaw, nextTick } from 'vue';
import useElDialogLoading from '@/hooks/useElDialogLoading';
import { useDepartmentTree } from '@/pinia/modules/departmentTree.js'; // 引入部门树相关的数据
import customtree from '@/components/customTree/customTree.vue';
import { flattenObjectArray } from '@/utils/dataProcess.js';

// 定义 model
const visible = defineModel('visible', { type: Boolean, default: false });
// 接受外部传参
const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    defaultChecked: {
        type: Array,
        default: () => []
    }
});
// 定义 emit
const emits = defineEmits([
    'update:loading',
    'submitEnts'
]);

// 全局参数
// loading
const loading = toRef(props, 'loading');

// 处理 loading 逻辑
// 暂存 dialog DOM
let dialogEl;
// 取 dialog 组件 body ref
const dialogBodyRef = ref(null);
// 弹框打开回调
const handleOpen = () => {
    // 如果之前没获取过 dialog DOM, 说明是首次 open
    if (!dialogEl) {
        // 获取 dialog DOM
        ({ dialogEl } = useElDialogLoading(dialogBodyRef, loading));
    }

    // 清除旧数据
    clearData();
    // 获取树数据
    getTreeData();
};

// body
// 左侧部门用户树
// 树组件初始化
const initTree = ref(false);
// 树实例
const customTreeRef = ref(null);
// 树中被选中的数据
const checkArr = ref([]);
// 默认选中的数据
let currentChecked = shallowRef([]);
// 树数据
const treeDataStore = useDepartmentTree();
const treeData = shallowRef([]);
// 获取树数据
const getTreeData = async () => {
    // 显示 loading
    emits('update:loading', true);

    // 移除 tree 组件, 数据处理完毕后再渲染
    // 目前 customTree 只支持 mounted 时处理 currentChecked, 所以处理完数据后再初始化 tree 组件
    initTree.value = false;

    // 获取部门用户树原始数据
    await treeDataStore.apiForGetData(); // 首次查询部门树数据
    const tmpTreeDataSource = toRaw(treeDataStore.SourceWidthMembers);

    // 原始数据处理: 去除超管数据 + 默认选中数据禁止取消勾选
    // 暂存所有节点数据, { id: nodeData } 格式
    const allNodeDatas = {};
    // 暂存超管节点数据(超管节点存在于根节点下 + 它的相关部门对应节点下)
    const adminNodeData = [];
    // 数组扁平化后遍历节点对象设置对应用户不可取消勾选
    flattenObjectArray(tmpTreeDataSource, 'list').forEach(item => {
        // 暂存当前节点数据
        allNodeDatas[item.id] = item;
        // 暂存超管节点数据
        if (item.isAdmin === 1) {
            adminNodeData.push(item);
        }
        // 对默认选中数据, 禁止取消勾选
        if (props.defaultChecked.includes(item.id)) {
            item.disabled = true;
        }
        if (item.infoType == 0 && !item.userList.length) {
            // 没有子集的部门 直接禁止选择
            item.disabled = true;
        }
    });
    // 设置默认选中
    currentChecked.value = props.defaultChecked;
    // 过滤掉超管节点
    adminNodeData.forEach(item => {
        // 取超管节点父节点
        const parentNode = allNodeDatas[item.parentId];
        // 从子结点中去掉超管节点
        if (parentNode && Array.isArray(parentNode.userList)) {
            parentNode.userList = parentNode.userList.filter(userItem => userItem.id !== item.id);
        }
        if (parentNode && Array.isArray(parentNode.list)) {
            parentNode.list = parentNode.list.filter(userItem => userItem.id !== item.id);
        }
    });

    // 赋值 treeData
    treeData.value = tmpTreeDataSource;
    // 渲染 tree 组件
    initTree.value = true;

    // 取消 loading
    emits('update:loading', false);
};
// 选中树结点处理
const handleCheckChange = async (node) => {
    // 数据量大的时候(选中一个底下有很多子级的节点)check-change 事件不断触发, 到了 100 多这边就报错了(发版后不报错, 但逻辑同样受影响), 不处理后续事件了
    // 报错说的是数据更新影响到渲染了, 于是这里 nextTick 一下, 攒够一波了一起执行后续逻辑 -> 更新数据 -> 视图更新
    // 如果之后还有问题, 那再整 setTimeout , 队列之类的吧, 或者干脆不用 check-change 事件了
    await nextTick();

    // 非成员节点, 不处理
    if (node.data.infoType !== 1) {
        return;
    }

    // 树中的复选框 状态改变时触发
    if (!node.check) {
        // 取消选中'

        // 选中成员数据已清空, 不处理 --- 清空时会触发 check-change , 避免重复触发
        if (!checkArr.value.length) {
            return;
        }

        // 移除选中成员 + 取消其在树中的选中状态
        removeCheckedUser(node.data);
    } else {
        // 选中

        // 则添加到选中成员数组
        checkArr.value.push(node.data);
        // 如果之前不在表格中 + 不在默认选中数据中, 则添加到表格中
        if (!tableData.value.some(item => item.id === node.data.id) && !props.defaultChecked.includes(node.data.id)) {
            tableData.value.push(node.data);
            // 自动滚动到最底部
            nextTick(() => {
                entityTableRef.value.setScrollTop(999999999);
            });
        }
    }
};

// 右侧选中表格 ref
const entityTableRef = ref(null);
// 右侧选中成员
const tableData = ref([]);
// 移除选中成员
const removeCheckedUser = (userData, removeAllRelateNode) => {
    // 取 customTree 组件实例数据
    // 内部 tree 实例
    const treeRef = customTreeRef.value.treeRef;

    if (userData === 'all') {
        // 清空所有选中的成员
        checkArr.value = [];
        // 清空表格
        tableData.value = [];
        // 同时修改树中的选中状态
        treeRef.setCheckedKeys(currentChecked.value);
    } else {
        if (removeAllRelateNode) {
            // 移除全部相关成员

            // 直接从表格中去掉所选节点
            tableData.value = tableData.value.filter(item => item.id !== userData.id);
            // 批量修改所有 userId 相同的节点, 先获取当前选中的 key , 再去掉所有 userId 匹配 userData.deptUserId 的 key
            const dashUserId = `_${userData.id}`;
            const tmpCheckedKeys = treeRef.getCheckedKeys(true).filter(key => !key.endsWith(dashUserId));
            treeRef.setCheckedKeys(tmpCheckedKeys, true);
        } else {
            // 移除单个选中的成员

            // 去掉选中节点
            checkArr.value = checkArr.value.filter(ele => ele.deptUserId !== userData.deptUserId);
            // 同时修改树中的选中状态
            treeRef.setChecked(userData.deptUserId, false);
            // 如果已没有 id 相同的选中节点, 则从表格数据中删除该结点
            if (!checkArr.value.some(item => item.id === userData.id)) {
                tableData.value = tableData.value.filter(item => item.id !== userData.id);
            }
        }
    }
};

// 清除旧数据
const clearData = () => {
    // 清除旧数据
    treeData.value = [];
    checkArr.value = [];
    currentChecked.value = [];
    tableData.value = [];
};

// footer
const submit = () => {
    // 发送已选中内容给父组件
    emits('submitEnts', toRaw(tableData.value));
};
</script>

<style lang="scss" scoped>
.selEntModal {
    &-body {
        &-container {
            border: 1px solid var(--#{$elnamespace}-border-color-light);
        }

        &-left {
            padding-top: 10px;

            ::v-deep {
                .filter_commpoent {
                    padding: 0 20px;
                }
            }
        }

        &-right {
            padding-top: 10px;
            border-left: 1px solid var(--#{$elnamespace}-border-color-light);
        }
    }

    &-selectedEnts {
        &-header {
            display: flex;
            align-items: center;
            height: 30px;
            padding: 0 12px;

            &-title {
                flex: 1;
            }

            &-clear {
            }
        }
    }
}
</style>