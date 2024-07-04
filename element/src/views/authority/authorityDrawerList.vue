<template>
    <div>
        <Drawer
            :visible.sync="visible"
            size="45%"
            :modal="false"
            :withHeader="false"
            append-to-body="true"
            @close="toggle_drawer(false)"
            @open="toggle_drawer(true)"
            class="auth-detail drawer-show-main-header drawer-close-button-moveUp">
            <!-- 自定义关闭按钮 -->
            <a class="drawer-close-button" @click="toggle_drawer(false)">
                <Icon custom="custom-drawer-detail-close"></Icon>
            </a>
            <template v-if="type === 'user'">
                <UserDetail
                :userData="row"
                :user_id="id"
                :columns="columns"
                :loading="loading"
                v-bind="$attrs"
                v-on="$listeners"
                @refreshData="refreshData"
                ></UserDetail>
            </template>
        </Drawer>
    </div>
</template>

<script>
    import UserDetail from '@/views/authority/user-management/components/user-datail.vue';

    export default {
        name: 'authorityDrawerList',
        inheritAttrs: false,
        components: {
            UserDetail
        },
        props: {
            showDetail: {
                type: Boolean,
                default: false
            },
            row: {
                type: Object,
                default() {
                    return {};
                }
            },
            index: {
                type: Number,
                default: -1
            },
            type: {
                type: String,
                default: ''
            },
            id: {
                type: Number,
                default: -1
            },
            columns: {
                type: Array,
                default() {
                    return [];
                }
            },
            loading: {
                type: Boolean,
                default: false
            },
            anyModalShow: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                visible: false
            };
        },
        methods: {
            closeDrawer() {
                this.$emit('update:showDetail', false);
            },
            toggle_drawer(val) {
                this.bus.$emit('shrinkMenu', val);
                if (!val) {
                    this.closeDrawer();
                }
            },
            /* 查看详情 */
            refreshData() {
                this.$emit('refreshData');
            },
            refreshCheck(obj) {
                this.$emit('refreshCheck', obj);
            },
            // 绑定给当前所处的 DOM (single-page) 的点击事件, 点击表格条目以外的操作将关闭最上一层 drawer
            click_blank(e) {
                let boo = true;
                let temp_el = e.target;
                while (!temp_el.classList.contains('single-page')) {
                    if (temp_el.classList.contains('el-table__row')) {
                        boo = false;
                        break;
                    } else {
                        temp_el = temp_el.parentElement;
                    }
                }
                if (!this.anyModalShow) {
                    if (boo) {
                        this.$emit('update:showDetail', false);
                    }
                }
            }
        },
        beforeDestroy() {
            this.bus.$emit('shrinkMenu', false);
            if (document.getElementsByClassName('single-page')[0]) {
                document.getElementsByClassName('single-page')[0].removeEventListener('click', this.click_blank);
            }
        },
        watch: {
            id(val) {
                if (!val) {
                    this.$emit('update:showDetail', false);
                }
            },
            showDetail: {
                handler(val) {
                    this.visible = val;

                    if (document.getElementsByClassName('single-page')[0]) {
                        val ? document.getElementsByClassName('single-page')[0].addEventListener('click', this.click_blank) : document.getElementsByClassName('single-page')[0].removeEventListener('click', this.click_blank);
                    }

                    if (!val) {
                        this.$emit('update:showDetail', false);
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less" scoped>
@import "../../styles/common.less";
@import "../crm/Detail/Components/less/modal.less";
@import "../crm/Detail/Components/less/detailPage.less";

.auth-detail {
    /deep/ .el-drawer__body {
        padding: 18px 17px 0;
    }
}
</style>
