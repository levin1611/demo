<template>
    <div>
        <Drawer
            :visible="visible"
            size="75%"
            :modal="false"
            :append-to-body="true"
            :withHeader="false"
            custom-class="scrollable"
            class="drawer-show-main-header drawer-close-button-moveUp"
            @open="toggle_drawer(true)"
            @close="toggle_drawer(false)">
                <!-- 自定义关闭按钮 -->
                <a @click.stop="toggle_drawer(false)" class="drawer-close-button">
                    <Icon custom="custom-drawer-detail-close"></Icon>
                </a>
                <template v-if="type === 'clue'|| type === 'others'">
                    <ClueDetail
                        :showClueStatus="showClueStatus"
                        :clueId="clueId"
                        :listType="listType"
                        :originalType="originalType"
                        :disabled="disabled"
                        @closeDetail="$emit('update:visible', false)"
                        @refreshData="$emit('refreshData')"
                        @chownSuccess="$emit('chownSuccess')">
                    </ClueDetail>
                </template>
                <template v-else-if="type === 'highseasClue'">
                    <HighseasClueDetail
                        :clueId="clueId"
                        :originalType="originalType"
                        :disabled="disabled"
                        @closeDetail="$emit('update:visible', false)"
                        @refreshData="$emit('refreshData')">
                    </HighseasClueDetail>
                </template>
        </Drawer>
    </div>
</template>

<script>
    import ClueDetail from '@/views/clue-manage/Detail/clueDetail';
    import HighseasClueDetail from '@/views/clue-manage/Detail/highseasClueDetail';

    export default {
        name: 'ClueDrawerList',
        components: {
            ClueDetail,
            HighseasClueDetail
        },
        props: [
            'visible',
            'type',
            'originalType',
            'from',
            'disabled',
            'clueId',
            'listType',
            'showClueStatus'
        ],
        data() {
            return {
            };
        },
        methods: {
            /* drawer */
            // 切换 drawer 可视状态, 如果直接更改数组, 会导致关闭所有 drawer 后数组为空但仍存在不可点击的 drawer 的 DOM , 所以先调整 DOM 可视状态为 false , 再在 setTimeout 中更改数组, 时间间隔自己调, 以 console 不报错为准
            toggle_drawer(val) {
                if (!val) {
                    this.$emit('update:visible', false);
                }
            },
            // 绑定给当前所处的 DOM (single-page) 的点击事件, 点击表格条目以外的操作将关闭最上一层 drawer
            click_blank(e) {
                if (this.visible) {
                    let boo = true;
                    let temp_el = e.target;
                    while (!temp_el.classList.contains('single-page')) {
                        if (temp_el.classList.contains('vxe-body--row')) {
                            boo = false;
                            break;
                        } else {
                            temp_el = temp_el.parentElement;
                        }
                    }
                    if (boo) {
                        this.$emit('update:clueId', '');
                        this.$emit('update:visible', false);
                    }
                }
            }
        },
        beforeDestroy() {
            const parentView = document.getElementsByClassName('single-page')[0];
            if (parentView) {
                parentView.removeEventListener('click', this.click_blank);
            }
        },
        mounted() {
            const parentView = document.getElementsByClassName('single-page')[0];
            if (parentView) {
                parentView.addEventListener('click', this.click_blank);
            }
        },
        watch: {
        }
    };
</script>

<style lang="less">
    @import "../../crm/Detail/Components/less/modal";
    @import "../../crm/Detail/Components/less/detailPage";
</style>
