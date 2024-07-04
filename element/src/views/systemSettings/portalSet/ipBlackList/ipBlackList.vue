<template>
    <div class="ipBlackList">
        <!-- 屏蔽当前网络 IP -->
        <div class="ipBlackList-blockSelf">
            <!-- 标题 -->
            <div class="ipBlackList-header">
                <span>{{ $t('portal_set.title_blockSelf') }}</span>
                <HelpTip :title="$t('helpTip.blockSelf')"></HelpTip>
            </div>

            <!-- 已屏蔽本机 IP -->
            <Input :value="localIp"
                   :disabled="true"
                   class="ipBlackList-blockedSelf-input"></Input>

            <!-- 保存 -->
            <Button :loading="loading_blockSelf"
                    :disabled="isSelfBlocked"
                    @click="blockSelf"
                    class="ipBlackList-addBlackIp-saveBtn">{{ $t(`portal_set.${ isSelfBlocked ? 'btn_selfBlocked' : 'btn_blockSelf' }`) }}</Button>
        </div>

        <!-- 屏蔽 IP 地址 -->
        <div class="ipBlackList-addBlackIp">
            <!-- 标题 -->
            <div class="ipBlackList-header">
                <span>{{ $t('portal_set.title_blockIp') }}</span>
            </div>

            <!-- 输入框 + 保存按钮 -->
            <div class="ipBlackList-addBlackIp-input-container">
                <Input v-model="addIp"
                       :disabled="loading_save"
                       :placeholder="$t('portal_set.placeholder_blockIp')"
                       class="ipBlackList-addBlackIp-input"></Input>

                <!-- 保存 -->
                <Button type="primary"
                        :loading="loading_save"
                        :disabled="!addIp.length"
                        @click="addBlackList"
                        class="ipBlackList-addBlackIp-saveBtn">{{ $t('save') }}</Button>

                <!-- 错误提示语 -->
                <div v-if="validateErrTip"
                     class="ipBlackList-addBlackIp-errTip">{{ validateErrTip }}</div>
            </div>

            <!-- 提示 -->
            <div class="ipBlackList-addBlackIp-tip">{{ $t('portal_set.tip_blockIp') }}</div>
        </div>

        <!-- 已屏蔽 IP 地址列表 -->
        <Table :data="tableData"
               v-loading="loading_table"
               :height="table_height"
               highlight-current-row
               size="medium"
               ref="table"
               class="tabmain">
            <TableColumn v-for="item in tableColumns"
                         :key="item.key"
                         :prop="item.key"
                         :label="item.title"
                         :min-width="item.width"
                         :formatter="item.formatter"
                         :render-header="item.renderHeader"
                         :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <!-- 操作栏 -->
                    <template v-if="item.key === 'operate'">
                        <!-- 解除屏蔽 -->
                        <Icon custom="custom-field-delete"
                              :size="12"
                              @click.native="handleUnblock(scope.row)"
                              class="cursor-pointer"></Icon>
                    </template>

                    <!-- 其他正常列 -->
                    <template v-else-if="item.formatter">{{ (item.formatter)(scope.row) || '--' }}</template>
                    <template v-else>{{ scope.row[item.key] || '--' }}</template>
                </template>
            </TableColumn>
        </Table>

        <!-- 解除屏蔽弹框 -->
        <Modal :visible.sync="visible_unblockIp"
               :title="$t('crm.InqSet.deleteTile')"
               width="405px"
               :append-to-body="true"
               :modal-append-to-body="false">
            <Spin v-if="loading_unblockIp"
                  fix></Spin>

            <div style="font-size: 12px; line-height: 18px; color: #333;">{{ unblockIpText }}</div>

            <div slot="footer">
                <Button size="large"
                        @click="visible_unblockIp = false">{{ $t('crm.InqSet.modal_cancel') }}</Button>
                <Button type="primary"
                        size="large"
                        @click="unblockIp">{{ $t('crm.InqSet.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import Utils from '@/utils';
    import { mapState } from 'vuex';
    import { Settings } from '@/api/chat';
    const { getIpBlackList, unblockBlackListIp, checkBlockSelf, addBlockList } = Settings;

    export default {
        name: 'ipBlackList',
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                window_height: 'window_height'
            }), // 从 vuex 中获取属性
            table_height() {
                let temp = this.window_height ? this.window_height - 333 : document.body.clientHeight - 333;

                if (this.validateErrTip) {
                    temp -= 20;
                }

                return temp > 200 ? temp : 200;
            },
            // 解除屏蔽弹框内文字提示
            unblockIpText() {
                return this.$t('portal_set.tip_confirmUnblock').replace('$ip', (this.currRowData && this.currRowData.ip) || '');
            },
            // 是否已屏蔽当前 IP
            isSelfBlocked() {
                if (!this.localIp) {
                    return true;
                }

                return Boolean(this.tableData.find(item => item.ip === this.localIp));
            }
        },
        data() {
            return {
                // 当前 IP
                localIp: '',
                loading_blockSelf: false,

                // 屏蔽 IP 输入框
                addIp: '',
                validateErrTip: '',
                loading_save: false,

                // 已屏蔽 IP 表格
                tableColumns: [
                    {
                        title: this.$t('portal_set.ip'),
                        key: 'ip',
                        width: 120
                    },
                    {
                        title: this.$t('portal_set.blockTime'),
                        key: 'createTime',
                        width: 150,
                        formatter: row => {
                            return this.$options.filters.timeFormat(row.createTime, 'DateTime');
                        }
                    },
                    {
                        title: this.$t('portal_set.operator'),
                        key: 'userName',
                        width: 120
                    },
                    {
                        title: this.$t('portal_set.operate'),
                        key: 'operate',
                        width: 50
                    }
                ],
                tableData: [],
                loading_table: true, // 加载图标

                // 解除屏蔽弹框
                visible_unblockIp: false,
                loading_unblockIp: false,
                currRowData: {}
            };
        },
        methods: {
            /* 屏蔽当前 */
            // 获取"屏蔽当前 IP"设置 + 获取当前 IP
            getBlockSelf() {
                checkBlockSelf({ orgId: this.enterpriseId }).then(res => {
                    if (res.code === 1) {
                        this.localIp = res.data.ip;
                    } else {
                        // 未请求到数据
                        this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    }
                });
            },
            blockSelf() {
                // 数据校验
                if (!this.validator_ip(this.localIp)) {
                    this.validateErrTip = this.$t('portal_set.error_blockIpFormat');
                    return;
                }

                // 数据处理
                const ipList = [...new Set(this.localIp.split(','))];

                // 发送请求
                this.loading_blockSelf = true;
                addBlockList({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    userName: this.fullName,
                    ipList
                }).then(res => {
                    if (res.code === 1) {
                        // 刷新表格数据
                        this.getTableDate();
                    } else {
                        if (res.data) {
                            // 保存时失败原因是: ip 有重复, 给出重复提醒

                            this.$Message.error(this.$t('portal_set.error_duplicateIp').replace('$ips', res.data.join(', ')));
                        } else {
                            // 其他失败原因, 统一提醒失败

                            this.$Message.error(this.$t('crm.Table.error_save'));
                        }
                    }
                    this.loading_blockSelf = false;
                });
            },

            /* 屏蔽输入框 */
            addBlackList() {
                // 数据校验
                if (!this.validator_ip(this.addIp)) {
                    this.validateErrTip = this.$t('portal_set.error_blockIpFormat');
                    return;
                }

                // 清除之前的错误提示语
                this.validateErrTip = '';

                // 数据处理
                const ipList = [...new Set(this.addIp.split(','))];

                // 发送请求
                this.loading_save = true;
                addBlockList({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    userName: this.fullName,
                    ipList
                }).then(res => {
                    if (res.code === 1) {
                        // 清空输入框
                        this.addIp = '';

                        // 刷新表格数据
                        this.getTableDate();
                    } else {
                        if (res.data) {
                            // 保存时失败原因是: ip 有重复, 给出重复提醒

                            this.$Message.error(this.$t('portal_set.error_duplicateIp').replace('$ips', res.data.join(', ')));
                        } else {
                            // 其他失败原因, 统一提醒失败

                            this.$Message.error(this.$t('crm.Table.error_save'));
                        }
                    }
                    this.loading_save = false;
                });
            },
            // 校验输入 IP
            validator_ip(str) {
                const list = str.split(',');
                const ipReg = Utils.regExp.fullIp;

                return list.every(item => ipReg.test(item));
            },

            /* 表格 */
            // 获取已屏蔽 IP 列表数据
            getTableDate() {
                this.loading_table = true;
                getIpBlackList({
                    orgId: this.enterpriseId
                }).then(res => {
                    if (res.code === 1) {
                        this.tableData = Array.isArray(res.data) ? res.data : [];
                    } else {
                        // 未请求到数据
                        this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    }
                    this.loading_table = false;
                });
            },

            // 解除屏蔽弹框
            handleUnblock(data) {
                this.currRowData = data;
                this.visible_unblockIp = true;
            },
            unblockIp() {
                this.loading_unblockIp = true;
                unblockBlackListIp({
                    id: this.currRowData.id
                }).then(res => {
                    if (res.code === 1) {
                        this.getTableDate();
                        this.visible_unblockIp = false;
                    } else {
                        this.$Message.error(this.$t('crm.UniSet.error_delete'));
                    }
                    this.loading_unblockIp = false;
                });
            }
        },
        created() {
            // 获取"屏蔽当前 IP"设置 + 获取当前 IP
            this.getBlockSelf();

            // 获取屏蔽 IP 表格数据
            this.getTableDate();
        }
    };
</script>

<style scoped lang="less">
    .ipBlackList {
        margin: 25px 32px;

        &-blockSelf {
            /deep/ .el-radio__label {
                font-size: 12px;
                line-height: 18px;
                color: rgba(0, 0, 0, 0.8);
            }
        }

        &-header {
            font-weight: 500;
            font-size: 14px;
            line-height: 22px;
            color: rgba(0, 0, 0, 0.8);
            margin-bottom: 15px;
        }

        &-blockedSelf {
            margin-top: 20px;

            &-label {
                display: inline-block;
                margin-right: 15px;
                font-size: 12px;
                line-height: 18px;
                color: rgba(0, 0, 0, 0.8);
            }

            &-input {
                width: 200px;
            }
        }

        &-addBlackIp {
            margin: 30px 0 20px;

            &-input-container {
            }

            &-input {
                width: 600px;
            }

            &-saveBtn {
                margin-left: 20px;

                &.is-disabled {
                    background: #e7ecf2;
                    border-color: #e7ecf2;
                    cursor:default;color:
                    rgba(110,129,154,.4);
                }
            }

            &-tip {
                margin-top: 12px;
                font-size: 12px;
                line-height: 18px;
                color: rgba(0, 0, 0, 0.6);
            }

            &-errTip {
                margin-top: 4px;
                font-size: 12px;
                line-height: 18px;
                color: #F56C6C;
            }
        }
    }
</style>

<style lang="less">
    .blockSelf-confirm-trigger {
        display: inline-block;
        width: 1px;
        height: 1px;
        line-height: 0;
    }

    .blockSelf-popper {
        font-size: 12px;
        line-height: 18px;
        color: #333;
        padding: 16px;
    }
</style>
