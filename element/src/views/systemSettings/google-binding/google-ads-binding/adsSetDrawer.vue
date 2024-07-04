<template>
    <Drawer :visible.sync="visible"
            size="75%"
            :modal="false"
            :append-to-body="true"
            class="drawer-show-main-header drawer-close-button-moveUp"
            :withHeader="false"
            @open="toggle_drawer(true)"
            @opened="toggle_detail(true)"
            @close="toggle_drawer(false)"
            @closed="toggle_detail(false)">
        <!-- 自定义关闭按钮 -->
        <a @click="toggle_drawer(false)"
           class="drawer-close-button">
            <Icon custom="custom-drawer-detail-close"></Icon>
        </a>

        <!-- 详情页 -->
        <adsSetDetail v-if="visible_detail"
                      ref="adsSetDetail"
                      v-on="$listeners"
                      v-bind="$attrs"></adsSetDetail>
    </Drawer>
</template>

<script>
    import AdsSetDetail from '@/views/systemSettings/google-binding/google-ads-binding/adsSetDetail';

    export default {
        name: 'adsSetDrawer',
        inheritAttrs: false,
        components: {
            AdsSetDetail
        },
        props: [
            'showDetail'
        ],
        data() {
            return {
                visible: false,
                visible_detail: false
            };
        },
        methods: {
            /* drawer */
            // 切换 drawer 可视状态, 如果直接更改数组, 会导致关闭所有 drawer 后数组为空但仍存在不可点击的 drawer 的 DOM , 所以先调整 DOM 可视状态为 false , 再在 setTimeout 中更改数组, 时间间隔自己调, 以 console 不报错为准
            toggle_drawer(val) {
                this.bus.$emit('shrinkMenu', val);
                if (!val) {
                    this.$emit('update:showDetail', false);
                }
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
                if (boo) {
                    this.visible = false;
                }
            },
            // 等 drawer 动画播放完毕后再显隐详情页, 避免动画闪动
            toggle_detail(boo) {
                this.visible_detail = boo;
            }
        },
        beforeDestroy() {
            if (document.getElementsByClassName('single-page')[0]) {
                document.getElementsByClassName('single-page')[0].removeEventListener('click', this.click_blank);
            }
        },
        watch: {
            showDetail: {
                handler(val) {
                    this.visible = Boolean(val);
                },
                immediate: true
            },
            visible: {
                handler(val) {
                    this.toggle_drawer(val);
                    this.$store.commit('set_adsSet_drawer_show', Boolean(val));
                    if (document.getElementsByClassName('single-page')[0]) {
                        if (val) {
                            document.getElementsByClassName('single-page')[0].addEventListener('click', this.click_blank);
                        } else {
                            document.getElementsByClassName('single-page')[0].removeEventListener('click', this.click_blank);
                        }
                    }
                }
            }
        }
    };
</script>
