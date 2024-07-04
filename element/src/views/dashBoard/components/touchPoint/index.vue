<!--
此页面目前是在 card-tables/index.vue 基础上改的, 去掉多余代码(只保留 todoList 图表相关内容), 部分逻辑转到 card-table 内实现(获取数据, 筛选等)
之后如果 card-table 拆分为图表和表格, 它的首行(筛选, 导出等操作)应该会转到这里实现
名字可能也会改下
-->
<template>
    <div class="b-r">
        <tableCard :viewType.sync="viewType"
                   :date-range.sync="dateRange"></tableCard>

        <deleteIcon @removeFromDashBoard="$emit('removeFromDashBoard', 'touchPoint')"
                    style="position: absolute;bottom: 0; right: 0"/>
    </div>
</template>

<script>
    import tableCard from './card-table';
    import deleteIcon from '../deleteIcon';

    export default {
        name: 'index',
        components: {
            tableCard,
            deleteIcon
        },
        data() {
            return {
                // 默认趋势视角
                viewType: 'list',

                dateRange: [(Date.now() - 3600 * 1000 * 24 * 29), Date.now()]
            };
        }
    };
</script>

<style scoped lang="less">
    .b-r {
        border-radius: 8px;
    }
</style>
