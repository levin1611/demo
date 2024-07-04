<template>
    <div class="ali-import">
        <Row>
            <!-- 字段匹配 -->
            <Col :span="12"
                 class="padding-right-10">
                <Card dis-hover>
                    <div :style="{height: cardHeight + 'px', overflowX: 'hidden', overflowY: 'auto', position: 'relative'}">
                        <!-- 标题 -->
                        <div class="ali-import-title">
                            <Tabs v-model="view" :before-leave="beforeLeave">
                                <TabPane v-for="item in compo_list"
                                        :key="item" :name="item">
                                    <div slot="label">
                                        <span>{{$t(`crm.aliImport.tab_${item}`)}}</span>
                                    </div>
                                </TabPane>
                            </Tabs>
                        </div>
                         <component :is="view"
                            :fieldContainerHeight="fieldContainerHeight"
                            :toRouterObj="toRouterObj"
                            :ref="view"
                            :activeName="activeName"
                            @beforeLeave="beforeLeave" >
                        </component>
                    </div>
                </Card>
            </Col>

            <!-- 插件下载和使用 -->
            <Col :span="12"
                 class="padding-left-10">
                <Card dis-hover>
                    <div :style="{height: cardHeight + 'px', overflowX: 'hidden', overflowY: 'auto'}">
                        <!-- 标题 -->
                        <div class="ali-import-title">{{ $t('crm.aliImport.downloadPlugin') }}</div>

                        <!-- 说明 -->
                        <div v-html="$t('crm.aliImport.downloadPluginGuide')"
                             class="ali-import-download-guide"></div>
                        <div class="ali-import-download-remark">{{ $t('crm.aliImport.downloadPluginRemark') }}</div>
                    </div>
                </Card>
            </Col>
        </Row>

        <!-- 未保存字段映射关系就离开页面确认框 -->
        <Modal :visible.sync="visible_beforeLeave"
               :modal-append-to-body="false"
               :close-on-click-modal="false"
               @close="cancelLeave"
               width="360px">
            <p slot="title">
                <span style="font-size: 18px; color: rgba(0, 0, 0, .8)">{{ $t('crm.aliImport.leaveConfirm') }}</span>
            </p>
            <div>
                <p>{{ $t('crm.aliImport.leaveTip') }}</p>
            </div>
            <div slot="footer">
                <!-- 直接离开 -->
                <Button @click="leaveDirectly">{{ $t('crm.aliImport.leaveDirectly') }}</Button>
                <!-- 保存后离开 -->
                <Button type="primary"
                        @click="leaveAfterSave">{{ $t('crm.aliImport.leaveAfterSave') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import aliCRX from './components/aliCRX';
    import aliCustomer from './components/aliCustomer';
    import aliSales from './components/aliSales';

    export default {
        name: 'aliImportCRX',
        components: {
            aliCRX,
            aliCustomer,
            aliSales
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height',
                button_list: state => state.app.button_list
            }),
            cardHeight() {
                return this.window_height - 167;
            },
            fieldContainerHeight() {
                return this.window_height - 400;
            }
        },
        watch: {
            view: {
                handler(val) {
                }
            }
        },
        data() {
            return {
                compo_list: [
                    'aliCustomer',
                    'aliCRX',
                    'aliSales'
                ],
                visible_beforeLeave: false,
                view: 'aliCustomer',
                toRouterObj: null,
                activeName: ''
            };
        },
        methods: {
            beforeLeave(activeName, oldActiveName, type) {
                if (type) {
                    this.view = activeName;
                    this.activeName = '';
                } else {
                    this.activeName = activeName;
                    if (this.view && this.$refs[this.view].validateChanged()) {
                        this.$refs[this.view].visible_beforeLeave = true;
                        return false;
                    }
                }
            },
            /* 离开前确认弹窗 */
            // 放弃离开
            cancelLeave() {
                this.toRouterObj = null;
            },
            // 直接离开
            leaveDirectly() {
                if (this.toRouterObj) {
                    this.$router.push(this.toRouterObj);
                } else {
                    this.$Message.error(this.$t('crm.Modal.errorOccurred'));
                }
            },
            // 保存后离开
            leaveAfterSave() {
                this.$refs[this.view].saveMatchRelation();
            }
        },
        mounted() {
        },
        beforeRouteLeave(to, from, next) {
            // 要跳转到的是登录页, 直接跳转
            if (to.name === 'login') {
                next();
                return;
            }

            // 如果字段匹配关系没有变动, 直接跳转
            if (this.view && !this.$refs[this.view].validateChanged()) {
                next();
                return;
            }

            // 数据有变动
            if (this.toRouterObj && to.name === this.toRouterObj.name) {
                // 如果是继续之前被中断的跳转动作, 直接跳转
                next();
            } else {
                // 否则把当前要跳转的路由暂存, 打开离开前提示框
                const { name, params } = to;
                this.toRouterObj = { name, params };
                this.$refs[this.view].cancelLeave();
                this.visible_beforeLeave = true;
            }
        }
    };
</script>

<style lang="less">
    .ali-import {
        padding: 30px;

        .el-card__body {
            padding: 10px 30px 20px;
        }

        .ali-import-title {
            font-size: 16px;
            line-height: 28px;
            font-weight: 700;
            margin-bottom: 20px;
            .el-tabs__header {
                margin: 0;
                .el-tabs__nav-wrap::after {
                    height: 0;
                }
            }
            .el-tabs__item {
                border: none;
                &:focus-visible {
                    outline: none;
                }
                &>div:focus-visible {
                    outline: none;
                }
            }
        }

        .ali-import-download-tip {
            line-height: 24px;
            padding-top: 8px;
        }

        .ali-import-download-guide {
            line-height: 22px;
            margin: 8px 0;

            a {
                &:hover {
                    text-decoration: underline;
                }
            }

            img {
                width: 100%;
                margin: 20px 0;
            }
        }

        .ali-import-download-remark {
            color: rgba(0,0,0,0.60);
            line-height: 24px;
        }

        .ali-field-match {
            text-align: center;
            margin-bottom: 15px;
            padding-right: 10px;

            .el-col {
                position: relative;
            }

            .el-select {
                width: 100%;
            }
            .el-input__inner::placeholder {
                font-size: 14px;
            }
        }

        .ali-field-icon {
            /*width: 40px;*/
            height: 40px;
            line-height: 40px;
            margin-bottom: 4px;
        }

        .ali-field-title {
            font-size: 14px;
            line-height: 22px;
            font-weight: 700;
            margin-bottom: 20px;
        }
    }

    .required-flag {
        color: red;
        position: absolute;
        left: 6px;
        top: 6px;
        display: inline-block;
        line-height: 28px;
    }
</style>
