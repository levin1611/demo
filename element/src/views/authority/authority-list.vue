<template>
    <div>
        <!-- 顶部切换 -->
        <Tabs v-model="current_compo" class="authority-tab">
            <TabPane v-for="(item,index) in compo_list"
                     :key="index"
                     :label=" $t(`authority.${item}.title`) "
                     :name="item"></TabPane>
        </Tabs>

        <!-- 显示组件 -->
        <!--<keep-alive>-->
        <component :is="current_compo" :content_height="content_height"></component>
        <!--</keep-alive>-->
    </div>
</template>

<script>
    import userManagement from '@/views/authority/user-management/user-management.vue';
    import functionalPermis from '@/views/authority/functional-permissions/functional-permissions.vue';
    import adminPermis from '@/views/authority/administrative-authority/administrative-authority.vue';
    import fieldPermis from '@/views/authority/field-permissions/field-permissions.vue';

    export default {
        name: 'authority',
        props: {
            content_height: {
                type: String,
                default: '800px'
            }
        },
        components: {
            userManagement,
            functionalPermis,
            adminPermis,
            fieldPermis
        },
        data() {
            return {
                /* 组件切换 */
                current_compo: 'userManagement',
                compo_list: [
                    'userManagement',
                    'functionalPermis',
                    'adminPermis',
                    'fieldPermis'
                ]
            };
        }
    };
</script>


<style lang="less">
    @import "../../styles/common.less";
    @import "../crm/Detail/Components/less/modal.less";
    @import "../crm/Table/Components/less/tablePage.less";
    @import "../crm/Detail/Components/less/detailPage.less";
    @import "../main-components/editable-table.less";

    .add-role {
        font-size: 12px;
        width: 40px;
        float: right;
        text-align: center;
        margin-right: 10px;
        color: #4285f4;
        cursor: pointer;
    }
</style>

<style lang="less" scoped>
    .authority-tab {
        /deep/ .el-tabs__item.is-active {
            font-weight: 700;
        }

        /deep/ .el-tabs__nav-scroll {
            margin-left: 40px;
        }

        /deep/ .el-tabs__item {
            padding: 0 16px;
            height: 54px;
            line-height: 60px;
        }

        /deep/ .el-tabs__nav-wrap:after {
            height: 1px;
        }
    }
</style>
