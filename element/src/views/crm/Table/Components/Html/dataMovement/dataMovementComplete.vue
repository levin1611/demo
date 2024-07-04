<template>
    <div class="data-movement-complete">
        <!-- 数据迁移进度条 -->
        <div class="data-movement-progress-top">
            <!--            <Icon custom="custom custom-qianyizhongdaxiaoxiangsusezhiBB"></Icon>-->
            <svg class="custom complete-icon" aria-hidden="true">
                <use xlink:href="#custom-qianyizhongdaxiaoxiangsusezhiBB"></use>
            </svg>
            <div>
                <!-- 进度条 -->
                <Progress :percentage="percent"
                          :stroke-width="6"
                          :color="color"
                          :isFinished="isFinished"
                          :isDMFinished="isDMFinished"
                          style="display: inline-block;margin-right: 20px;"
                          class="data-movement-progress"/>

                <!-- 取消按钮 -->
                <span v-if="percent <= 99"
                      @click="visible_cancelDataMove = true"
                      style="cursor: pointer; font-size: 12px; color: #4285F2;">{{ $t('cancel') }}</span>
            </div>
            <span style="display: block">{{$t('data_movement.dataMovementProgress')}}</span>
        </div>

        <!-- 数据迁移结果统计表格 -->
        <div class="data-movement-progress-table">
            <Table class="noborder-table progress-table" :data="data" :border="false">
                <TableColumn v-for="item in column"
                             :key="item.key"
                             :prop="item.key"
                             :label="item.title"
                             :width="item.width"
                             :show-overflow-tooltip="true">
                    <template slot-scope="scope">
                        {{scope.row[item.key]}}
                    </template>
                </TableColumn>
            </Table>
        </div>

        <!-- 取消数据迁移 Modal -->
        <Modal :visible.sync="visible_cancelDataMove"
               :title="$t('data_movement.title_cancelDataMove')"
               :append-to-body="true"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               width="488px">
            <div slot="title">
                <span style="font-size: 16px; font-weight: bold;">{{ $t('data_movement.title_cancelDataMove') }}</span>
            </div>

            <!-- loading -->
            <Spin v-if="loading_cancelDataMove"
                  fix></Spin>

            <p style="font-size: 12px;">{{ $t('data_movement.tip_cancelDataMove') }}</p>

            <div slot="footer">
                <Button @click="visible_cancelDataMove = false">{{ $t('cancel') }}</Button>
                <Button type="primary"
                        @click="ok_cancelDataMove">{{ $t('confirm') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { dataMovement } from '@/api/crm';

    export default {
        name: 'dataMovementComplete',
        props: {
            isFinished: {
                type: Boolean,
                default: false
            },
            isDMFinished: {
                type: Boolean,
                default: false
            },
            isDMAborted: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                color: '#4285F2',
                column: [
                    {
                        title: this.$t('data_movement.fileName'),
                        key: 'fileName'
                    },
                    {
                        title: this.$t('data_movement.status'),
                        key: 'status'
                    },
                    {
                        title: this.$t('data_movement.fileSucceeded'),
                        key: 'fileSucceeded'
                    },
                    {
                        title: this.$t('data_movement.fileFailed'),
                        key: 'fileFailed'
                    },
                    {
                        title: this.$t('data_movement.totalFiles'),
                        key: 'totalFiles'
                    }
                ],
                data: [],
                filesUploaded: [], // 上传的文件
                timer: null,

                // 取消数据迁移弹窗 visible
                loading_cancelDataMove: false,
                visible_cancelDataMove: false
            };
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                enterpriseId: state => state.enterpriseId,
                percent: state => state.crm.percent
            })
        },
        methods: {
            initTable() {
                this.filesUploaded = this.$store.state.crm.files;
                for (let i = 0; i < this.filesUploaded.length; i++) {
                    const data = {
                        fileName: `${i + 1}、${this.filesUploaded[i].name}`
                    };
                    this.data.push(data);
                }
            },
            /** 页面开始加载时展示进度条 */
            initPercent() {
                this.timer = setInterval(() => {
                    dataMovement.percent({
                        orgId: this.enterpriseId,
                        userId: this.userId
                    }).then(({ data }) => {
                        // 数据迁移已取消, 不再更新 percent
                        if (this.isDMAborted) {
                            return;
                        }

                        // 更新 percent
                        if (data && data.percent) {
                            // 处理返回值
                            const newPercent = parseInt(data.percent * 100 || this.percent);

                            if (newPercent > this.percent) {
                                // 返回值大于当前百分比时才更新百分比
                                // 否则有可能是定时调用接口时, 返回先后顺序出了问题, 此时不需要更新百分比

                                this.$store.commit('setPercent', newPercent);
                            }
                        }
                    });
                }, 1000);
            },

            // 取消数据迁移
            ok_cancelDataMove() {
                // 请求中, 退出流程, 避免重复请求
                if (this.loading_cancelDataMove) {
                    this.$Message.warning(this.$t('mail.customerBox.requestTip'));

                    return;
                }

                this.loading_cancelDataMove = true;
                dataMovement.cleanByUserIdAndOrgId({
                    orgId: this.enterpriseId,
                    userId: this.userId
                }).then(response => {
                    if (response.code === '1') {
                        this.$Message.success(this.$t('data_movement.success_cancelDataMove'));

                        // 清空数据
                        this.data = [];
                        clearInterval(this.timer);
                        this.timer = null;
                        this.visible_cancelDataMove = false;
                        this.$emit('update:isDMAborted', true);
                        this.$store.commit('setPercent', 100);
                    } else {
                        this.$Message.error(this.$t('data_movement.error_cancelDataMove'));
                    }
                    this.loading_cancelDataMove = false;
                }).catch(e => {
                    console.error(e);
                    this.$Message.error(this.$t('data_movement.error_cancelDataMove'));
                    this.loading_cancelDataMove = false;
                });
            }
        },
        created() {
            this.initTable();
            // 初始化进度条
            this.initPercent();
        },
        beforeDestroy() {
            clearInterval(this.timer);
            this.timer = null;
        }
    };
</script>

<style scoped lang="less">
    .data-movement-progress-top {
        text-align: center;

        .complete-icon {
            display: block;
            width: 50px;
            height: 50px;
            margin: 30px auto;
        }

        .data-movement-progress {
            width: 500px;
            margin: 1px auto;

        }
    }

    .data-movement-progress-table {
        width: 100%;

        .progress-table {
            /*top: 180px;*/
            width: 100%;

        }
    }

</style>
