<template>
    <div>
        <Drawer
                :visible.sync="visible" size="75%" :modal="false" :append-to-body="true"
                class="drawer-show-main-header drawer-close-button-moveUp"
                :withHeader="false"
                @open="toggle_drawer(true)"
                @close="toggle_drawer(false)"
                >
            <!-- 自定义关闭按钮 -->
            <a class="drawer-close-button" @click="toggle_drawer(false)">
                <Icon custom="custom-drawer-detail-close"></Icon>
            </a>
            <LeadsDetail
                    ref="leadsDetail"
                    :visible.sync="visible"
                    :rowData="rowData"
                    @showClueOrInquiryDetail="showClueOrInquiryDetail"
                    @openDetail="openDetail"
                    v-on="$listeners"
                    v-bind="$attrs">
            </LeadsDetail>
        </Drawer>
    </div>
</template>

<script>
    import LeadsDetail from '@/views/facebook/fb-message/components/leadsDetail';

    export default {
        name: 'LeadsDrawerList',
        inheritAttrs: false,
        components: {
            LeadsDetail
        },
        props: [
            'visible',
            'rowData',
            'clue_show',
            'inquiry_show'
        ],
        data() {
            return {};
        },
        methods: {
            openDetail() {
                this.$emit('show_detail');
            },
            /* drawer */
            // 切换 drawer 可视状态, 如果直接更改数组, 会导致关闭所有 drawer 后数组为空但仍存在不可点击的 drawer 的 DOM , 所以先调整 DOM 可视状态为 false , 再在 setTimeout 中更改数组, 时间间隔自己调, 以 console 不报错为准
            toggle_drawer(val) {
                this.bus.$emit('shrinkMenu', val);
                if (!val) {
                    /* this.$emit('update:clueId', ''); */
                    this.$emit('update:visible', false);
                    if (this.$refs.leadsDetail) {
                        this.$refs.leadsDetail.visible_enter_clue = false;
                    }
                }
            },
            // 绑定给当前所处的 DOM (single-page) 的点击事件, 点击表格条目以外的操作将关闭最上一层 drawer
            click_blank(e) {
                let boo = true;
                let temp_el = e.target;
                while (!temp_el.classList.contains('single-page')) {
                    if (temp_el.classList.contains('el-table__row') || temp_el.classList.contains('visitor-detail')) {
                        boo = false;
                        break;
                    } else {
                        temp_el = temp_el.parentElement;
                    }
                }
                if (boo) {
                    this.$emit('update:visible', false);
                }
            },
            showClueOrInquiryDetail(flag) {
                if (flag) {
                    this.$emit('update:clue_show', true);
                } else {
                    this.$emit('update:inquiry_show', true);
                }
            }
        },
        beforeDestroy() {
            if (document.getElementsByClassName('single-page')[0]) {
                document.getElementsByClassName('single-page')[0].removeEventListener('click', this.click_blank);
            }
        },
        watch: {
            visible: {
                handler(val) {
                    this.toggle_drawer(val);
                    if (val) {
                        this.$store.commit('set_leads_drawer_show', true);
                    } else {
                        this.$store.commit('set_leads_drawer_show', false);
                    }
                    if (document.getElementsByClassName('single-page')[0]) {
                        if (val) {
                            document.getElementsByClassName('single-page')[0].addEventListener('click', this.click_blank);
                        } else {
                            document.getElementsByClassName('single-page')[0].removeEventListener('click', this.click_blank);
                        }
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style>
</style>
