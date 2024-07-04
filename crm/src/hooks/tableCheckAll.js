// el-table-v2 全选逻辑
import { computed, ref, isReactive } from 'vue';

export const useCheckAll = function(tableData) {
    const selectAll = ref(false); // 是否点击全选
    const isAll = computed(() => {
        // 全选状态
        return tableData.value.length && tableData.value.every((ele) => ele.check);
    });

    function setSelect() {
       
        // 点击表头全选框 change回调函数 将data中的check状态改变
        selectAll.value = !selectAll.value;
        tableData.value.forEach((ele) => {
            ele.check = selectAll.value;
        });
    }
    function changeValue(rowdata) {
        // 点击每一行的 复选框 逻辑
        rowdata.check = !rowdata.check;
        selectAll.value = isAll.value;
    }
    function emptyCheck() {
        // 清空选中
        selectAll.value = false;
        tableData.value.forEach((ele) => {
            ele.check = false;
        });
    }
    return {
        selectAll,
        isAll,
        setSelect,
        changeValue,
        emptyCheck
    };
};
