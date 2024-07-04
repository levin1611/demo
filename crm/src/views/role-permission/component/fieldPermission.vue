<template>
    <div
        v-loading="loading"
        class="fieldPerm"
    >
        <!-- tip -->
        <div class="fieldPerm-tip" v-if="!['memebrDetail'].includes(props.from)">{{ $t('role.tip_fieldPerm') }}</div>

        <!-- body -->
        <div class="fieldPerm-body">
            <!-- 左侧目录 -->
            <div class="fieldPerm-menu">
                <el-scrollbar max-height="100%">
                    <!-- 选择业务对象类型 -->
                    <div
                        v-for="item in bizObjList"
                        :key="item.id"
                        @click="selectBizObj(item.id)"
                        :class="{ 'fieldPerm-menuItem__active': curBizObj === `${item.id}` }"
                        class="fieldPerm-menuItem"
                    >{{ locale === 'zh' ? item.permissionCn : item.permissionEn }}</div>
                </el-scrollbar>
            </div>

            <!-- 右侧内容 -->
            <div class="fieldPerm-panel">
                <!-- 当前选中业务对象的操作权限表格 -->
                <el-table
                    v-if="curBizObj"
                    :data="tableDataList[curBizObj]"
                >
                    <!-- 空数据插槽 -->
                    <template #empty>
                        <default-empty />
                    </template>

                    <!-- 字段名 -->
                    <el-table-column prop="name" :label="$t('role.field')">
                        <template #default="{ row }">
                            <!-- 字段名称 || 全业务批量设置 -->
                            <span
                                :class="{'text-secondary': row.fieldId === '_all'}"
                            >{{ locale === 'zh' ? row.permissionCn : row.permissionEn }}</span>
                        </template>
                    </el-table-column>
                    <!-- 操作权限 -->
                    <el-table-column prop="perm" :label="$t('role.operatePermission')">
                        <template #default="{ row }">
                            <el-checkbox
                                v-for="item in row.permTypeList"
                                :key="item.id"
                                :model-value="item.value === 1"
                                :label="item.id"
                                :disabled="props.disabled || (item.operationType === 1)"
                                @change="changePerm($event, item, row)"
                            >{{ translatePerm(item.visibleRange) }}</el-checkbox>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div> 
</template>

<script setup>
import { ref, toRaw } from 'vue';
import { useI18n } from 'vue-i18n';
import { getRolePerm } from '@/api/role';
import { useUserStore } from '@/pinia/modules/user.js';
import { getDepValArr } from '@/utils/dataProcess.js';

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

// 全局变量
const loading = ref(false);

// 左侧目录
// 当前业务对象
const curBizObj = ref('');
// 业务对象列表
const bizObjList = ref([]);
// 选中业务对象
const selectBizObj = (val) => {
    curBizObj.value = `${val}`;
};

// 右侧内容
// 业务对象的操作权限列表
const tableDataList = ref({});
// 初始的权限数据
let initPermData = [];
// 获取数据
const getData = async () => {
    // 显示 loading
    loading.value = true;

    // 清空旧数据
    initPermData = [];

    // 接口请求
    getRolePerm({
        orgId: store.orgId,
        type: 5,
        roleId: props.roleData.id
    }).then(res => {
        if (res.code === 10000) {
            // 请求成功
            // 数据请求成功处理
            if (Array.isArray(res.data && res.data.list)) {
                bizObjList.value = res.data.list.map((item) => {
                    // 解构第一层数据, 得到业务对象数据
                    const { id, list, ...others } = item;

                    // 处理第二层数据, 得到当前业务对象对应的表格数据
                    if (Array.isArray(list)) {
                        // 初始化表格数据
                        // 暂存表格数据结果
                        let tempTableData = {};
                        // 暂存"全部"行数据
                        const _allFieldPerm = {};
                        // 暂存所有字段 id , 之后做字段排序用
                        const fieldIdList = [];
                        // 遍历数据, 进行处理
                        list.forEach((field) => {
                            // 解构数据
                            const { fieldId, permissionCn, permissionEn, visibleRange } = field;

                            // 将字段 id 加入字段 id 列表
                            fieldIdList.push(fieldId);

                            // 初始化行数据
                            if (!tempTableData[fieldId]) {
                                tempTableData[fieldId] = {
                                    fieldId,
                                    permissionCn,
                                    permissionEn,
                                    permTypeList: []
                                };
                            }
                            // 加入操作按钮到行数据
                            tempTableData[fieldId].permTypeList.push(field);

                            // 初始化"全部"行数据此类权限全选状态
                            if (!_allFieldPerm[visibleRange]) {
                                _allFieldPerm[visibleRange] = {
                                    visibleRange,
                                    // 默认全选状态
                                    value: 1
                                };
                            }
                            // 如果当前权限未勾选, 则去掉"全部"行的此类权限全选状态
                            if (field.value !== 1) {
                                _allFieldPerm[visibleRange].value = 0;
                            }
                        });
                        // 按顺序排列表格数据
                        const tableData = [...new Set(fieldIdList)].map((fieldId) => {
                            const row = tempTableData[fieldId];
                            row.permTypeList = row.permTypeList.sort((a, b) => a.visibleRange - b.visibleRange);
                            return row;
                        });
                        // 将"全部"行数据加入表格数据, 得到当前遍历业务对象的最终表格数据
                        tableDataList.value[id] = [{
                            fieldId: '_all',
                            permissionCn: t('role.allBizBatchSet'),
                            permissionEn: t('role.allBizBatchSet'),
                            permTypeList: Object.values(_allFieldPerm).sort((a, b) => a.visibleRange - b.visibleRange)
                        }].concat(tableData);
                    } else {
                        tableDataList.value[id] = [];
                    }

                    // 返回业务对象列表数据
                    return { id, ... others };
                });
                console.log(bizObjList.value);
                console.log(tableDataList.value);
                // 选中第一个业务对象
                if (bizObjList.value.length) {
                    curBizObj.value = `${bizObjList.value[0].id}`;
                }

                // 保存初始权限数据
                initPermData = (saveData() || []).sort();
            }
        } else {
            // 提示错误
            ElMessage.error(res.message);
        }

        // 关闭 loading
        loading.value = false;
    });
};
// 翻译字段权限
const translatePerm = (permVal) => {
    switch (`${permVal}`) {
        case '1': // 可读
            return t('role.readable');
        case '2': // 可写
            return t('role.writeable');
        case '3': // 可导出
            return t('role.export');
        default:
            return permVal;
    }
};
// 编辑操作权限
const changePerm = (val, permType, rowData) => {
    if (rowData.fieldId === '_all') {
        // 操作"全部"字段

        // 暂存当前表格数据
        const curTableData = tableDataList.value[curBizObj.value];
        // 遍历表格数据
        curTableData.forEach((item) => {
            // 没有选项, return
            if (!Array.isArray(item.permTypeList)) {
                return;
            }

            // 找到匹配选项, 更新
            const matchPermType = item.permTypeList.find(permTypeItem => permTypeItem.visibleRange === permType.visibleRange);
            if (matchPermType && matchPermType.operationType !== 1) {
                matchPermType.value = val ? 1 : 0;
            }

            // 数据联动
            handleDataChangeLinkage(val, permType, item);
        });
    } else {
        // 操作单个字段

        // 数据联动
        handleDataChangeLinkage(val, permType, rowData);

        // 暂存当前表格数据
        const curTableData = tableDataList.value[curBizObj.value];
        // 暂存"全部"行数据
        const _allFieldPermType = curTableData.find((item) => item.fieldId === '_all').permTypeList.find(permTypeItem => permTypeItem.visibleRange === permType.visibleRange);
        // 更新当前操作行数据
        const matchPermType = rowData.permTypeList.find(permTypeItem => permTypeItem.visibleRange === permType.visibleRange);
        if (matchPermType && matchPermType.operationType !== 1) {
            matchPermType.value = val ? 1 : 0;
        }
        // 更新"全部"行数据
        if (val) {
            _allFieldPermType.value = curTableData.filter((item) => item.fieldId !== '_all').every(row => {
                const matchPermType = row.permTypeList.find(permTypeItem => permTypeItem.visibleRange === permType.visibleRange);
                return !matchPermType || matchPermType.value === 1;
            }) ? 1 : 0;
        } else {
            _allFieldPermType.value = 0;
        }
    }

    // 联动逻辑
};
// 数据联动逻辑统一处理
const handleDataChangeLinkage = (val, permType, row) => {
    // 勾选"可写"时同步勾选"可读"
    if (val && [2, 3].includes(permType.visibleRange)) {
        // 找到匹配选项, 更新
        const readPerm = row.permTypeList.find(permTypeItem => permTypeItem.visibleRange === 1);
        if (readPerm && readPerm.operationType !== 1) {
            readPerm.value = 1;
        }
    }

    // 取消勾选"可读", 要同步取消勾选"可写", "导出"
    if (!val && permType.visibleRange === 1) {
        row.permTypeList.forEach(permTypeItem => {
            if ([2, 3].includes(permTypeItem.visibleRange) && permTypeItem.operationType !== 1) {
                permTypeItem.value = 0;
            }
        });
    }
};

// 请求数据
getData();

// 导出给外部使用
// 保存数据 方法
const saveData = () => {
    // 暂存当前数据
    const curData = toRaw(tableDataList.value);
    // 如果数据为空, 返回 false
    if (JSON.stringify(curData) === '{}') {
        return false;
    }

    // 提取所有选项
    const allBtns = getDepValArr(curData, 'permTypeList');
    // 过滤提取所有已选中选项的 id , return
    return allBtns.flat().filter(item => item.value === 1).map(item => item.id).filter(item => !(!item || item === ''));
};
// 数据是否已变更 方法
const checkDataChanged = () => {
    const nowData = saveData();
    return nowData && (JSON.stringify(nowData.sort()) !== JSON.stringify(initPermData));
};
// 更新初始设置
const updateInitSet = (data) => {
    initPermData = data.sort();
};
// 导出
defineExpose({
    saveData,
    checkDataChanged,
    updateInitSet
});
</script>

<style lang="scss" scoped>
.fieldPerm {
    display: flex;
    flex-direction: column;

    &-tip {
        font-size: 12px;
        margin-bottom: 12px;
        color: var(--#{$elnamespace}-text-color-regular);
    }

    &-body {
        display: flex;
        flex: 1;
        height: 0;
        border: 1px solid var(--#{$elnamespace}-border-color-light);
        border-bottom: none;
    }

    &-menu {
        width: 200px;
        box-sizing: content-box;
        height: 100%;
        // border-right: 1px solid var(--#{$elnamespace}-border-color-light);

        .fieldPerm-menuItem {
            width: 200px;
            box-sizing: border-box;
            padding: 9px 12px;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            cursor: pointer;

            &:hover, &__active {
                background-color: var(--#{$elnamespace}-fill-color-light);
                color: var(--xhl-el-color-primary);
                font-weight: 500;
            }
        }
    }

    &-panel {
        flex: 1;
        border-left: 1px solid var(--#{$elnamespace}-border-color-light);

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