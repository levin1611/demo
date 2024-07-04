import Sortable from 'sortablejs';

// el-table 创建可排序的表格
const useCreateElTableSortable = (tableRef, sortOptions) => {
    const scroll = tableRef.value.scrollBarRef;
    return Sortable.create(scroll.wrapRef.querySelector('tbody'), Object.assign({
        group: {
            pull: false,
            put: false
        },
        animation: 150
    }, sortOptions));
};

export default useCreateElTableSortable;
