<!-- 仪表盘 tableCard 组件通用的筛选组件 -->
<template>
    <div class="form-filter">
        <Select :value="filterValue"
                filterable
                :placeholder="$t('seo.detailSelect.pleaseText')"
                @change="filter">
            <!-- 默认选项: 所有网站 -->
            <Option :label="$t('tableFilter.allForms')"
                    :value="''"></Option>

            <!-- 各网站 -->
            <Option v-for="item in form_list"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"></Option>
        </Select>
    </div>
</template>

<script>
    export default {
        name: 'form-filter',
        props: [
            // 所属 card 类型
            'cardType',
            // 筛选类型
            'filterType',
            // 筛选 key
            'filterKey',
            // 筛选值
            'filterValue',
            // 表单列表
            'form_list'
        ],
        methods: {
            /* 全局 */
            // 触发筛选
            filter(val) {
                // 向上触发筛选
                this.$emit('handleFilter', this.filterKey, val);
            }
        }
    };
</script>

<style lang="less" scoped>
    .form-filter {
        width: 100px;
    }
</style>
