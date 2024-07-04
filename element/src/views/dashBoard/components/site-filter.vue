<!-- 仪表盘 tableCard 组件通用的筛选组件 -->
<template>
    <div class="site-filter">
        <Select :value="filterValue"
                filterable
                :placeholder="$t('seo.detailSelect.pleaseText')"
                @change="filter">
            <!-- 默认选项: 所有网站 -->
            <Option :label="$t('tableFilter.allSites')"
                    :value="''"></Option>

            <!-- 各网站 -->
            <Option v-for="item in site_list"
                    :key="item.siteId"
                    :label="item.websiteUrl"
                    :value="item.siteId"></Option>
        </Select>
    </div>
</template>

<script>
    export default {
        name: 'site-filter',
        props: [
            // 所属 card 类型
            'cardType',
            // 筛选类型
            'filterType',
            // 筛选 key
            'filterKey',
            // 筛选值
            'filterValue',
            // 站点列表
            'site_list'
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
    .site-filter {
        width: 100px;
    }
</style>
