// 公用的数据处理函数

// 对象数组扁平化
// objArray: 对象数组, childKey: 存放子对象数组的 key, depth: 扁平化深度, 默认 Infinity , 无限向下
export function flattenObjectArray(objArray, childKey = 'children', depth = Infinity) {
    let result = [];

    // 展开深度为 0 时，直接返回
    if (depth < 0) {
        return result;
    }

    // 先存放当前层级的对象数组
    result = result.concat(objArray);
    // 遍历当前层级的对象数组，如果有子对象数组，递归调用本方法，将结果合并到 result 中
    objArray.forEach(item => {
        if (Array.isArray(item[childKey])) {
            result = result.concat(flattenObjectArray(item[childKey], childKey, depth - 1));
        }
    });

    // 返回结果
    return result;
}

// 获取复杂嵌套数据对象中的指定属性的值的集合
// objOrArr: 对象或数组, valKey: 需要获取到的值的 key, depth: 获取深度, 默认 Infinity , 无限向下
export function getDepValArr(objOrArr, valKey = 'children', depth = Infinity) {
    let result = [];

    // 展开深度为 0 时, 或当前给定的数据不可继续迭代，直接返回
    if (depth < 0 || !(objOrArr instanceof Object)) {
        return result;
    }

    // 如果当前数据中就有 valKey, 则直接返回其值
    if (objOrArr[valKey]) {
        result.push(objOrArr[valKey]);
        return result;
    }

    Object.values(objOrArr).forEach(item => {
        result = result.concat(getDepValArr(item, valKey, depth - 1));
    });

    // 返回结果
    return result;
}

export function getHashParams(hash) {
    let result = '';
    result = hash.split('?')[1].split('=')[1];
    // 返回结果
    return result;
}
// 判断数组中是否含有指定值
export function judgePermissions(value, list, key) {
    if (!value || !list) return false;
    if (list && list.length === 0) return false;
    if (!key) return list.includes(value);
    return list.some(element => element[key] === value);
}

// 通用的校验 allPurposeFilter 组件检索条件的方法
export const handleFilterData = (obj) => {
    let result = {};
    let conditions = [];
    result.filterType = obj.filterType;
    result.expression = obj.expression;
    let vertical = true;
    vertical = obj.condition.every(item => {
        if (!item.searchField?.id) {
            ElMessage.error('请选择检索字段');
            return false;
        }
        // 检索条件为空，则不做校验
        if (![12, 13].includes(item.matchType)) {
            // 条件是值
            if (item.condMode === 1) {
                // 校验检索字段的值
                // 如果是选择范围，则校验范围值
                if (item.matchType === 11) {
                    if ((!item.values[0] && typeof(item.values[0]) !== 'number') || (!item.values[1] && typeof(item.values[1]) !== 'number')) {
                        ElMessage.error('检索字段的值不完整');
                        return false;
                    }
                    if (item.values[0] > item.values[1]) {
                        return false;
                    }
                } else {
                    if (!item.values[0] && typeof(item.values[0]) !== 'number') {
                        ElMessage.error('请选择检索字段的值');
                        return false;
                    }
                }
            } else if (item.condMode === 0) {
                // 条件是字段，校验检索字段的值
                if (!item.searchRange?.id) {
                    ElMessage.error('请选择检索字段的值');
                    return false;
                }
            }
        }
        if (item.searchRange) {
            item.searchRange.condMode = item.condMode;
            item.searchRange.values = item.condMode === 1 ? item.values : null;
        }
        conditions.push({
            matchType: item.matchType,
            searchField: item.searchField,
            searchRange: [item.searchRange]
        });
        return true;
    });
    
    result.conditions = conditions;
    return vertical ? result : false;
};

export default {
    flattenObjectArray,
    getDepValArr,
    getHashParams,
    handleFilterData
};
