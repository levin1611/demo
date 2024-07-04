<template>
    <div
        v-loading="loading"
        class="dataPerm"
    >
        <!-- header -->
        <div class="flex">
            <!-- tip -->
            <div class="flex-1" v-if="!['memebrDetail'].includes(props.from)">
                <!-- 高级设置时显示的提示语 -->
                <div
                    v-if="setType === 1"
                    class="dataPerm-tip"
                >{{ $t('role.tip_dataPerm') }}</div>
                <!-- 简易设置时显示的提示语 -->
                <div
                    v-else-if="setType === 0"
                    class="dataPerm-tip"
                >{{ $t('role.tip_dataPermEasySet') }}</div>
            </div>

            <!-- 切换简易设置/高级设置 -->
            <div
                v-if="!disabled"
                class="dataPerm-setType"
            >
                <!-- 切换到简易设置 -->
                <el-link
                    v-if="setType === 1"
                    type="primary"
                    @click="toggleSetType(0)"
                >{{ $t('role.toggleToEasySet') }}</el-link>
                <!-- 切换到高级设置 -->
                <el-link
                    v-else-if="setType === 0"
                    type="primary"
                    @click="toggleSetType(1)"
                >{{ $t('role.toggleToAdvanceSet') }}</el-link>
            </div>
        </div>

        <!-- body -->
        <el-scrollbar
            max-height="calc(100% - 50px)"
        >
            <!-- 高级设置 -->
            <div
                v-if="setType === 1"
                class="dataPerm-advanceSet"
            >
                <el-table
                    :data="advanceTableData"
                    class="dataPerm-table"
                >
                    <el-table-column
                        v-for="item in advanceTableColumns"
                        :key="item.prop"
                        :prop="item.prop"
                        :label="item.label"
                        :min-width="item.width"
                        :class-name="item.prop !== 'bizObj' ? 'dataPerm-table-selColumn' : undefined"
                    >
                        <!-- 业务对象列 -->
                        <template
                            v-if="item.prop === 'bizObj'"
                            #default="{ row }"
                        >
                            <!-- 业务对象名称 || 全业务批量设置 -->
                            <span
                                :class="{'text-secondary': row.code === 'all'}"
                            >{{ row.bizObj }}</span>
                        </template>
                        <!-- 操作列 其他全部都是 -->
                        <template
                            v-else-if="item.prop !== 'bizObj'"
                            #default="{ row }"
                        >
                            <el-select
                                v-if="Array.isArray(row[item.prop])"
                                v-model="row[item.prop]"
                                :disabled="props.disabled"
                                multiple
                                size="small"
                                @change="changeScope($event, item, row)"
                            >
                                <el-option
                                    v-for="item in dataScopeList"
                                    :key="item.value"
                                    :label="$t(`role.dataScope_${item.code}`)"
                                    :value="item.code"
                                    :disabled="row.code !== 'all' && item.code === '2'"
                                ></el-option>
                                <template #tag>
                                    <span class="truncate">
                                        <template
                                            v-for="(code, index) in row[item.prop]"
                                            :key="code"
                                        >{{ index === 0 ? '' : ',' }}{{ $t(`role.dataScope_${code}`) }}
                                        </template>
                                    </span>
                                </template>
                            </el-select>
                            <span v-else>-</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 简易设置 -->
            <div
                v-if="setType === 0"
                class="dataPerm-easySet"
            >
                <el-table
                    :data="easyTableData"
                >
                    <!-- checkbox -->
                    <el-table-column
                        width="55"
                    >
                        <template #default="{ row }">
                            <el-checkbox
                                v-model="row.checked"
                                :disabled="props.disabled || row.disabled"
                            ></el-checkbox>
                        </template>
                    </el-table-column>
                    <!-- 数据范围 -->
                    <el-table-column
                        prop="dataScope"
                        :label="$t('role.dataScope')"
                        width="150"
                    ></el-table-column>
                    <!-- 范围说明 -->
                    <el-table-column
                        prop="scopeDesc"
                        :label="$t('role.scopeDesc')"
                    ></el-table-column>
                </el-table>
            </div>
        </el-scrollbar>
    </div>

    <!-- 切换设置类型 确认弹框 -->
    <confirmDialog
        v-model:visible="visible_toggleSetType"
        :title="$t('toggleConfirm')"
        :tip-content="tip_toggleSetType"
        @confirm="confirm_toggleSetType"
    ></confirmDialog>
</template>

<script setup>
import { ref, toRaw } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/pinia/modules/user.js';
import { getRoleDataPerm } from '@/api/role';

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

const { t } = useI18n();

// 取 pinia 数据
const store = useUserStore();

// 全局数据
// loading
let loading = ref(false);

// 切换设置类型
// 设置类型: 0-简易设置, 1-高级设置
const setType = ref(-1);
// 切换设置类型 确认弹框 显隐
const visible_toggleSetType = ref(false);
// 切换设置类型 确认弹框 提示语
const tip_toggleSetType = ref('');
// 切换设置类型
const toggleSetType = (type) => {
    // 从简易设置切换到高级设置
    if (setType.value === 0) {
        // 设置切换弹框提示语
        tip_toggleSetType.value = t('role.tip_toggleToAdvanceSet');
        // 显示弹框
        visible_toggleSetType.value = true;

        return;
    }

    // 从高级设置切换到简易设置
    if (setType.value === 1) {
        // 设置切换弹框提示语
        tip_toggleSetType.value = t('role.tip_toggleToEasySet');
        // 显示弹框
        visible_toggleSetType.value = true;
    }
};
// 切换设置类型 确认
const confirm_toggleSetType = () => {
    // 从简易设置切换到高级设置
    if (setType.value === 0) {
        // 修改高级设置表格数据为简易设置表格数据

        // 获取简易设置勾选的所有数据范围
        const scopeArr = [];
        easyTableData.value.forEach(scope => {
            if (scope.checked) {
                scopeArr.push(scope.code);
            }
        });
        // 遍历高级设置表格数据, 将勾选的数据范围设置到高级设置表格数据中
        advanceTableData.value.forEach(item => {
            operationTypeList.value.forEach(operationType => {
                if (Array.isArray(item[`operationType_${operationType.code}`])) {
                    item[`operationType_${operationType.code}`] = scopeArr.slice();
                }
            });
        });
        // 更新设置类型值
        setType.value = 1;
        // 关闭弹框
        visible_toggleSetType.value = false;

        return;
    }

    // 从高级设置切换到简易设置
    if (setType.value === 1) {
        // 重置简易设置表格数据
        easyTableData.value.forEach(scope => {
            scope.checked = (`${scope.code}` === '2');
        });
        // 更新设置类型值
        setType.value = 0;
        // 关闭弹框
        visible_toggleSetType.value = false;
    }
};

// 高级设置
let advanceTableData = ref([]);
let advanceTableColumns = ref([]);
// 业务对象集合
let bizObjList = ref([]);
// 操作类型集合
let operationTypeList = ref([]);
// 数据范围集合
let dataScopeList = ref([]);
// 修改数据范围
const changeScope = (value, column, row) => {
    if (row.code === 'all') {
        // 全业务批量设置

        // 新的权限值, 必须包含"本人"
        const newScopeArr = [...new Set(['2'].concat(value))];
        // 遍历所有业务对象, 统一修改当前列(操作类型)的数据范围选中值
        advanceTableData.value.forEach(item => {
            if (item.code !== 'all' && Array.isArray(item[column.prop])) {
                item[column.prop] = newScopeArr.slice();

                // 数据联动
                handleDataChangeLinkage(item, column.prop);
            }
        });
    } else {
        // 单个业务对象单个权限修改

        // 处理本行其他列数据联动
        handleDataChangeLinkage(row, column.prop);
    }

    // 处理顶部"全业务批量设置"行的数据联动
    handleColumnallDataChangeLinkage(column.prop);
};
// 数据联动修改 -- 修改其他业务影响"查询"业务, 修改"查询"业务影响其他业务
const handleDataChangeLinkage = (row, columnProp) => {
    // 暂存当前行"查询"列的数据范围
    const viewScopeArr = row.operationType_2;

    if (Array.isArray(viewScopeArr)) {
        if (columnProp === 'operationType_2') {
            // 如果操作的是"查询"列

            // "查询"列数据范围有删减, 同步删除将其他操作的数据范围
            operationTypeList.value.forEach(({ code }) => {
                // "查询"列, 跳过
                if (`${code}` === '2') {
                    return;
                }

                // 其他列, 过滤掉不在"查询"列的数据范围的值
                const scopeArr = row[`operationType_${code}`];
                if (Array.isArray(scopeArr) && scopeArr.length > 0) {
                    row[`operationType_${code}`] = scopeArr.filter(scope => viewScopeArr.includes(scope));
                }
            });
        } else {
            // 操作的是其他列

            // 所有其他操作一旦有新增数据范围, 都要马上为"查看"权限新增对应的数据范围
            row[columnProp].forEach(scope => {
                if (!viewScopeArr.includes(scope)) {
                    viewScopeArr.push(scope);
                }
            });
        }
    }
};
// 处理顶部"全业务批量设置"数据联动
const handleColumnallDataChangeLinkage = (columnProp) => {
    if (columnProp === 'operationType_2') {
        // 操作的是"查看"列

        // 所有列都要重新计算"全部"行的数据
        operationTypeList.value.forEach(({ code }) => {
            reCalcCellallVal(`operationType_${code}`);
        });
    } else {
        // 操作的是其他列

        // 需要计算操作列和"查询"列"全部"行的数据
        reCalcCellallVal(columnProp);
        reCalcCellallVal('operationType_2');
    }
};
// 计算"全部"行指定操作的数据
const reCalcCellallVal = (columnProp) => {
    // 遍历所有行数据, 检查是否此列数据值全部相同, 若相同, 则将此列数据值赋给"全部"行

    // 暂存"全部"行
    let rowall;
    // 暂存结果值
    let newScopeArr;
    // 顺序是否有不同
    let isOrderDifferent = false;
    // 开始遍历
    advanceTableData.value.some(row => {
        // "全部"行, 跳过
        if (row.code === 'all') {
            rowall = row;
            return false;
        }

        // 数据不存在, pass
        if (!Array.isArray(row[columnProp])) {
            return false;
        }

        // 暂存第一条数据为结果值, 随后进入下个循环
        if (!newScopeArr) {
            newScopeArr = row[columnProp];
            return false;
        }

        // 如果当前行数据与暂存结果值排序后仍不同, 则直接退出循环; 否则如果排序后相同, 则标识"顺序不同"为 true
        if (JSON.stringify(row[columnProp]) !== JSON.stringify(newScopeArr)) {
            if (JSON.stringify(row[columnProp].sort()) !== JSON.stringify(newScopeArr.sort())) {
                newScopeArr = null;
                return true;
            } else {
                isOrderDifferent = true;
            }
        }
    });

    // 遍历结束, 处理数据
    // 如果结果值不为空, 说明遍历完毕后数据值全部相同, 则将此数据值赋给"全部"行数据; 如果顺序有变更, 则需要做下排序
    if (rowall) {
        // 数据不尽相同, "全部"行数据清空
        if (!newScopeArr) {
            rowall[columnProp] = [];
            return;
        }

        // 数据相同, 则赋值给"全部"行数据
        rowall[columnProp] = (isOrderDifferent ? newScopeArr.sort() : newScopeArr).slice();
    }
};

// 简易设置
let easyTableData = ref([]);

// 初始的权限数据
let initPermData = [];
// 数据获取
const getData = () => {
    // 显示 loading
    loading.value = true;

    // 清空旧数据
    initPermData = [];

    // 接口请求
    getRoleDataPerm({
        orgId: store.orgId,
        roleId: props.roleData.id
    }).then(res => {
        if (res.code === 10000 && res.data) {
            // 请求成功

            // 解析数据
            // 业务对象集合
            bizObjList.value = Array.isArray(res.data.resourceSubTypeList) ? res.data.resourceSubTypeList.map(item => {
                return Object.assign({
                    // 对象类型后端说还没有最全的, 先不做多语言了, 直接用接口返回的文字
                    // bizObj: t(`role.bizObj_${item.name}`)
                    bizObj: item.desc
                }, item);
            }) : [];
            // 操作类型集合
            // 去掉"全部"操作类型
            operationTypeList.value = Array.isArray(res.data.actionList) ? res.data.actionList.filter(item => item.code !== '1') : [];
            // 数据范围集合
            dataScopeList.value = Array.isArray(res.data.resourceRangeList) ? res.data.resourceRangeList : [];
            // 暂存授权数据
            const selectedData = res.data.selectedData || {};

            // 控制"高级设置"和"简易设置"的显示
            setType.value = props.roleData.flag || 0;

            // 处理简单设置表格数据
            // 直接取第一个 scope arr 的值
            let easyScopeArr;
            Object.values(selectedData).some(operateScopeObj => {
                return Object.values(operateScopeObj).some(scopeArr => {
                    if (!easyScopeArr) {
                        easyScopeArr = scopeArr;
                        return true;
                    }
                });
            });
            if (!Array.isArray(easyScopeArr)) {
                easyScopeArr = [];
            }
            easyTableData.value = dataScopeList.value.map(item => {
                return Object.assign({
                    checked: easyScopeArr.includes(item.code) || (props.roleData.nameCn === '系统管理员' ? (item.code === '1') : (item.code === '2')), // 系统管理员默认选中全部, 其他角色默认选中"本人"
                    disabled: props.roleData.nameCn === '系统管理员' ? (item.code === '1') : (item.code === '2'), // 默认选中值不可取消勾选
                    dataScope: t(`role.dataScope_${item.code}`),
                    scopeDesc: t(`role.scopeDesc_${item.code}`)
                }, item);
            });

            // 处理高级设置表格数据
            // 暂存"全选批量处理"行数据
            const allBizBatchSetRowData = {
                code: 'all',
                bizObj: t('role.allBizBatchSet')
            };
            // 默认选中数据(数据范围) -- 系统管理员默认选中全部, 其他角色默认选中"本人"
            let defaultCheckScope = props.roleData.nameCn === '系统管理员' ? ['1'] : ['2'];
            // 表格列
            // 业务对象列 + 各操作类型列
            advanceTableColumns.value = [
                {
                    prop: 'bizObj',
                    label: t('role.bizObj'),
                    width: 140
                }
            ].concat(operationTypeList.value.map(item => {
                // "全选批量处理"行数据增加对应操作类型选框
                allBizBatchSetRowData[`operationType_${item.code}`] = [];

                // 返回操作类型列
                return {
                    prop: `operationType_${item.code}`,
                    label: t(`role.operationType_${item.code}`),
                    width: 220
                };
            }));
            // 表格数据
            // "全选批量处理"行数据 + 各业务对象行数据
            advanceTableData.value = [allBizBatchSetRowData].concat(bizObjList.value.map(item => {
                const result = Object.assign({}, item);
                // 遍历业务对象, 从暂存的授权数据中获取对应的数据范围
                Object.entries(selectedData[item.code] || {}).forEach(([operationCode, selectedResourceRangeList]) => {
                    // "本人"默认选中, 不可取消勾选
                    result[`operationType_${operationCode}`] = [...new Set(defaultCheckScope.concat(Array.isArray(selectedResourceRangeList) ? selectedResourceRangeList : []))];
                });
                return result;
            }));
            // 重新计算"全部"行的数据
            handleColumnallDataChangeLinkage('operationType_2');

            // 保存初始权限数据
            initPermData = saveData();
        } else {
            // 提示错误
            ElMessage.error(res.message);
        }

        // 关闭 loading
        loading.value = false;
    });
};
// 获取数据
getData();

// 导出给外部使用
// 保存数据 方法
const saveData = () => {
    // 获取设置类型
    const tmpSetType = toRaw(setType.value);

    // 获取设置数据
    let tmpData;
    // 高级设置
    if (tmpSetType === 1) {
        // 暂存表格数据
        const tmpTableData = toRaw(advanceTableData.value);
        // 如果表格数据有值, 则继续向下, 否则不获取设置数据, 到后面自动 return false
        if (tmpTableData.length) {
            // 暂存结果
            const result = {};
            // 过滤掉"批量操作"行, 再根据操作类型获取每行的数据存入 result
            tmpTableData.filter(row => row.code !== 'all').forEach(row => {
                const tmp = {};
                operationTypeList.value.forEach(operationType => {
                    if (Array.isArray(row[`operationType_${operationType.code}`])) {
                        tmp[operationType.code] = row[`operationType_${operationType.code}`];
                    }
                });
                result[row.code] = tmp;
            });
            // 存入最终结果
            tmpData = result;
        }
    }
    // 简易设置
    if (tmpSetType === 0) {
        // 暂存表格数据
        const tmpTableData = toRaw(easyTableData.value);
        // 如果表格数据有值, 则继续向下, 否则不获取设置数据, 到后面自动 return false
        if (tmpTableData.length) {
            // 暂存结果
            const result = {};

            // 暂存通用的设置数据
            const permObj = {};
            // 获取勾选的所有数据范围
            const scopeArr = [];
            tmpTableData.forEach(item => {
                if (item.checked) {
                    scopeArr.push(item.code);
                }
            });
            // 遍历操作类型, 设置每种操作类型的数据范围, 得到所有业务对象通用的权限配置数据
            operationTypeList.value.forEach(operationType => {
                permObj[operationType.code] = scopeArr;
            });
            // 遍历业务对象, 赋值权限数据
            bizObjList.value.forEach(bizObj => {
                result[bizObj.code] = permObj;
            });

            // 存入最终结果
            tmpData = result;
        }
    }

    // 获取数据失败, return false
    if (!tmpData) {
        return false;
    }

    // 返回数据
    return {
        setType: tmpSetType,
        data: tmpData
    };
};
// 数据是否已变更 方法
const checkDataChanged = () => {
    // 如果设置类型有变更, 返回 true
    if (Number.isInteger(props.roleData.flag) && props.roleData.flag !== setType.value) {
        return true;
    }

    const nowData = saveData();
    return nowData && (JSON.stringify(nowData) !== JSON.stringify(initPermData));
};
// 更新初始设置
const updateInitSet = (data) => {
    initPermData = data;
};
// 导出
defineExpose({
    saveData,
    checkDataChanged,
    updateInitSet
});
</script>

<style lang="scss" scoped>
.dataPerm {
    &-tip {
        font-size: 12px;
        margin-bottom: 12px;
        color: var(--#{$elnamespace}-text-color-regular);
    }
}
</style>

<style lang="scss">
.dataPerm-table .dataPerm-table-selColumn {
    padding: 9.5px 0 6.5px;

    .#{$elnamespace}-select {
        margin-bottom: 3px;
    }
}
</style>
