<template>
<!--    <seoList v-if="switchComponent === 'seo-list'"></seoList>-->
<!--    <seoGuide v-else-if="switchComponent === 'seo-guide'"></seoGuide>-->
<!--    <seoDetail v-else-if="switchComponent === 'seo-detail'"></seoDetail>-->
    <div>
        <Component :is="view"
                   @toggleSEOGen="toggleSEOGen"
                   :class="{ 'hidden-keepStatus': visible_SEOGen }"></Component>

        <!-- 生成 SEO 内容 -->
        <div v-if="visible_SEOGen"
             class="seo-gen-container">
            <SEOGen @close="handleBeforeSEOGenClose"></SEOGen>
        </div>

        <!-- 离开确认框 -->
        <Modal :visible.sync="visible_beforeLeave"
               :title="$t('mail.leaveConfirm')"
               :modal-append-to-body="false"
               :close-on-click-modal="false"
               @close="cancelLeave"
               width="360px">
            <div>{{ $t('seo.genContent.leaveConfirmTip') }}</div>

            <div slot="footer">
                <!-- 直接离开 -->
                <Button @click="cancelLeave">{{ $t('cancel') }}</Button>
                <!-- 保存后离开 -->
                <Button type="primary"
                        @click="leaveDirectly">{{ $t('confirm') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import seoList from '@/views/seo-subject/components/seo-list/index.vue';
    import seoGuide from '@/views/seo-subject/components/seo-guide/index.vue';
    import seoDetail from '@/views/seo-subject/components/seo-detail/index.vue';
    import seoAdd from '@/views/seo-subject/components/seo-add/index.vue';
    import SEOGen from '@/views/seo-subject/components/seo-gen/index.vue';
    import { mapState } from 'vuex';

    export default {
        name: 'seo',
        data() {
            return {
                view: 'seoList',

                // SEO 生成组件显隐
                visible_SEOGen: false,
                // 暂存 vuex 变量
                tmpView: '',

                // 用户切换会话时，若存在未发送的附件列表，需要进行离开确认
                visible_beforeLeave: false,
                toRouterObj: null
            };
        },
        methods: {
            // 切换新建文章组件显隐
            toggleSEOGen(val) {
                console.error('toggleSEOGen', val);
                this.visible_SEOGen = Boolean(val);
            },
            // SEOGen 内点击取消按钮退出编辑, 弹出离开确认框
            handleBeforeSEOGenClose() {
                this.visible_beforeLeave = true;
            },

            /* 离开前确认弹窗 */
            // 放弃离开
            cancelLeave() {
                this.toRouterObj = null;
                this.visible_beforeLeave = false;
            },
            // 直接离开
            leaveDirectly() {
                if (this.toRouterObj) {
                    this.$router.push(this.toRouterObj);
                } else {
                    this.visible_beforeLeave = false;
                    this.visible_SEOGen = false;
                }
            }
        },
        components: {
            seoList,
            seoGuide,
            seoDetail,
            seoAdd,
            SEOGen
        },
        computed: {
            ...mapState({
                switchComponent: state => state.seo.switchComponent
            })
        },
        watch: {
            switchComponent: {
                handler(val) {
                    switch (val) {
                        case 'seo-list':
                            this.view = 'seoList';
                            break;
                        case 'seo-guide':
                            this.view = 'seoGuide';
                            break;
                        case 'seo-detail':
                            this.view = 'seoDetail';
                            break;
                        case 'seo-add':
                            this.view = 'seoAdd';
                            break;
                        case 'seo-gen':
                            // 显示 SEO 智能生成内容组件
                            // 只用来离开前确认弹框相关逻辑, 不修改 view
                            break;
                        default:
                            this.view = 'seoList';
                            break;
                    }
                }
            },
            // 监听生成内容组件的显隐更新 vuex 变量
            visible_SEOGen: {
                handler(val) {
                    if (val) {
                        // 暂存 view
                        this.tmpView = this.switchComponent;
                        // 设置 vuex , 保证 beforeunload 判断生成内容组件是否正在显示中用
                        this.$store.commit('setSwitchComponent', 'seo-gen');
                    } else {
                        // 从暂存 view 恢复 vuex 变量
                        if (this.tmpView) {
                            this.$store.commit('setSwitchComponent', this.tmpView);
                        }
                    }
                }
            }
        },
        beforeRouteLeave(to, from, next) {
            // 要跳转到的是登录页, 直接跳转
            if (to.name === 'login') {
                next();
                this.$store.commit('setSwitchComponent', 'seo-list');
                return;
            }

            // 离开前确认框相关逻辑
            if (this.toRouterObj && to.name === this.toRouterObj.name) {
                // 如果是继续之前被中断的跳转动作, 直接跳转
            } else {
                // 否则把当前要跳转的路由暂存, 打开离开前提示框
                if (this.visible_SEOGen) {
                    const { name, params } = to;
                    this.toRouterObj = { name, params };
                    this.visible_beforeLeave = true;

                    return;
                }
            }

            // 未进入 return 的, 走到此处
            next();
            this.$store.commit('setSwitchComponent', 'seo-list');
        }
    };
</script>

<style scoped>
    /*.seo-gen-container {*/
    /*    position: absolute;*/
    /*    top: 0;*/
    /*    right: 0;*/
    /*    bottom: 0;*/
    /*    left: 0;*/
    /*    z-index: 10;*/
    /*}*/

    /* 避免使用 v-show 隐藏元素时, 滚动条位置不保留等问题 */
    .hidden-keepStatus {
        height: 0;
        overflow: hidden;
    }
</style>
