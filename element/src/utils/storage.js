/**
 * @Description: localStorage , sessionStorage 相关方法
 * @author 汤一飞
 * @date 2021/4/28
*/

// 获取 localStorage.openedWindowList
export const getOpenedWindowList = () => {
    let result = localStorage.getItem('openedWindowList');

    try {
        result = result ? JSON.parse(result) : [];
    } catch (e) {
        result = [];
    }

    return result;
};

// 从 localStorage.openedWindowList 中去掉当前 windowOpenTimeStamp
export const removeOpenedWindowList = removedVal => {
    // 未传入数据, 退出流程
    if (!removedVal) {
        return;
    }

    // 获取当前 localStorage.openedWindowList
    const arr = getOpenedWindowList();

    // 过滤被删除时间戳
    const result = arr.filter(item => item !== removedVal);

    // 更新数组
    localStorage.setItem('openedWindowList', JSON.stringify(result));
};

// 从 localStorage.openedWindowList 中加入当前 windowOpenTimeStamp
export const updateOpenedWindowList = val => {
    // 未传入数据, 退出流程
    if (!val) {
        return;
    }

    // 获取当前 localStorage.openedWindowList
    const arr = getOpenedWindowList();

    // 添加时间戳到数组并去重
    arr.push(val);
    const result = [...new Set(arr)];
    // 将要插入的时间戳放到数组最后
    result.push(...result.splice(result.indexOf(val), 1));

    // 更新数组
    localStorage.setItem('openedWindowList', JSON.stringify(result));
};
