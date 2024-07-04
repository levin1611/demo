import { useDateFormat } from '@vueuse/core';
// 格式化 数据并且回显
export function formateGender(val) {
    // 回显性别
    return val == 1 ? '男' : val == 2 ? '女' : '未知';
}
export function formateStatus(val) {
    // 回显状态
    return val == 1 ? '邀请中' : val == 2 ? '未激活' : val == 3 ? '已激活' : '未知';
}

export function formatedeleteFlag(val) {
    // 回显状态
    return val == 0 ? '启用' : val == 1 ? '禁用' : '离职';
}
export function formateRelatedDepartments(val) {
    // 相关部门文案回显
    const arr = val?.map(ele => {
        return ele.name;
    });
    return arr?.toString();
}
export function formateIdsByObject(val) {
    // 相关部门id
    return val?.map(ele => {
        return ele.id;
    });
}

export function formateTimezone(val) {
    return val;
}
export function formateCurrency(val) {
    return val;
}
export function formateData(val, type = 'YYYY-MM-DD HH:mm:ss') {
    if (val) {
        return useDateFormat(val, type);
    } 
    return {value: null};
}
