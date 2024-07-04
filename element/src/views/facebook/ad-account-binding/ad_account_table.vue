<template>
    <div class="ad-account-page">
        <!-- 标题 -->
        <div class="binding-title">{{ $t('menu.ad_account_binding') }}</div>

        <!-- 说明 + 绑定按钮 -->
        <div class="binding-header">
            <!-- 说明 -->
            <span class="binding-description">{{ $t('facebook.adAccountBinding.description') }}</span>

            <!-- 绑定按钮 -->
            <Button type="primary"
                    @click="toBind">{{ $t('facebook.adAccountBinding.bindingBtnText') }}</Button>
        </div>

        <!-- 表格 -->
        <Table :data="tableData"
               v-loading="loading"
               fit
               size="medium"
               :height="table_height"
               highlight-current-row
               v-tableLoadMore="getTableData"
               ref="table"
               style="width: 100%"
               class="noborder-table">
            <!-- 正常列 -->
            <TableColumn v-for="item in tableColumns"
                         :key="item.key"
                         :prop="item.key"
                         :label="item.title"
                         :formatter="item.formatter"
                         :align="item.align"
                         :width="item.width"
                         :min-width="item.minWidth"
                         :show-overflow-tooltip="true"></TableColumn>
            <!-- 操作 -->
            <TableColumn :label="$t('facebook.adAccountBinding.operate')"
                         :width="120"
                         :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <!-- 解绑按钮 -->
                    <a v-if="scope.row.isValid === 1"
                       @click="unbind_account(scope.row)"
                       class="binding-unbind-account">{{ $t('facebook.adAccountBinding.unbind') }}</a>
                    <!-- 删除按钮 -->
                    <a v-else
                       @click="delete_account(scope.row)"
                       class="binding-delete-account piwik_delete_ad_account">{{ $t('facebook.adAccountBinding.delete') }}</a>
                </template>
            </TableColumn>
        </Table>

        <!-- 解绑确认 -->
        <Modal :visible.sync="visible_unbind"
               :title="$t('facebook.adAccountBinding.unbindSure')"
               width="500px"
               :append-to-body="true"
               :modal-append-to-body="false">
            <!-- loading -->
            <Spin v-if="loading_unbind"
                  fix></Spin>
            <!-- 提示 -->
            <div style="margin-bottom:20px;">{{ `${$t('facebook.adAccountBinding.unbindSureTip1')}${unbindAccount.accountName}${$t('facebook.adAccountBinding.unbindSureTip2')}` }}</div>
            <!-- footer -->
            <div slot="footer">
                <Button size="small"
                        @click="cancel_unbind">{{ $t('cancel') }}</Button>
                <Button size="small"
                        type="primary"
                        @click="confirm_unbind"
                        class="piwik_unbind_ad_account">{{ $t('confirm') }}</Button>
            </div>
        </Modal>

        <!-- 绑定广告账户 -->
        <Modal :visible.sync="visible_bind"
               :title="$t('facebook.adAccountBinding.bindingBtnText')"
               width="500px"
               :append-to-body="true"
               :modal-append-to-body="false">
            <!-- loading -->
            <Spin v-if="loading_bind"
                  fix></Spin>

            <!-- 提示 -->
            <div style="font-size: 12px;line-height: 18px;margin-bottom:20px;">{{ $t('facebook.adAccountBinding.selectAdAccountTip') }}</div>

            <!-- 选择广告账户 -->
            <div v-if="visible_bind">
                <!-- label -->
                <span style="font-size: 12px;height: 32px;line-height: 32px;padding-right: 15px;">{{ $t('facebook.adAccountBinding.adAccount') }}</span>

                <!-- 级联选择广告账户 -->
                <Cascader :props="selectAdAccountProps"
                          :show-all-levels="false"
                          popper-class="adAccountCasPopper"
                          ref="selAdAccountCas"
                          class="adAccountCas"></Cascader>
            </div>

            <!-- footer -->
            <div slot="footer">
                <Button @click="cancel_bind">{{ $t('cancel') }}</Button>
                <Button type="primary"
                        @click="confirm_bind"
                        class="piwik_bind_ad_account">{{ $t('confirm') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { adAccountBinding } from '@/api/facebook/index';
    const { getPageByOrg, unbindAdAccount, deleteAdAccount, getfbPersonPages, getfbClientAdAccounts, getBindAdList, saveFbAdAccount } = adAccountBinding;

    export default {
        name: 'ad_account_table',
        computed: {
            ...mapState([
                'enterpriseId',
                'userId',
                'userName',
                'window_height'
            ]),
            table_height() {
                let temp = this.window_height ? this.window_height - 176 : document.body.clientHeight - 176;
                if (temp < 200) {
                    temp = 200;
                }
                // 转 element-ui 时, 表格样式错误, 加上这句后解决, 具体错误原因暂时未看
                temp += this.loading ? 1 : 0;
                return temp;
            }
        },
        data() {
            return {
                /* 表格 */
                loading: false,
                tableData: [],
                tableColumns: [
                    {
                        title: this.$t('facebook.adAccountBinding.adAccount'),
                        key: 'accountName'
                    },
                    {
                        title: this.$t('facebook.adAccountBinding.adAccountID'),
                        key: 'accountId',
                        formatter: (row, column, cellValue) => {
                            // 去掉开头的 'act_'
                            if (cellValue && cellValue.startsWith('act_')) {
                                return cellValue.slice(4);
                            }
                            return cellValue;
                        }
                    },
                    {
                        title: this.$t('facebook.adAccountBinding.FBAccount'),
                        key: 'providerUserName'
                    },
                    {
                        title: this.$t('facebook.adAccountBinding.operator'),
                        key: 'createUserName'
                    },
                    {
                        title: this.$t('facebook.adAccountBinding.bindingTime'),
                        key: 'createTime',
                        formatter: (row, column, cellValue) => {
                            return this.$options.filters.timeFormat(cellValue, 'DateTime');
                        }
                    },
                    {
                        title: this.$t('facebook.adAccountBinding.status'),
                        key: 'isValid',
                        formatter: (row, column, cellValue) => {
                            if (cellValue === 1) {
                                return this.$t('facebook.adAccountBinding.normal');
                            } else {
                                return this.$t('facebook.adAccountBinding.invalid');
                            }
                        }
                    }
                ],
                // 每次请求数据条数
                pageSize: 20,

                /* 解绑确认框 */
                visible_unbind: false,
                loading_unbind: false,
                unbindAccount: {},

                /* 绑定确认框 */
                visible_bind: false,
                loading_bind: false,
                selectAdAccountProps: {
                    lazy: true,
                    lazyLoad: this.load_ad_account
                }
            };
        },
        methods: {
            /* 绑定 */
            toBind() {
                // this.$emit('changeView', 'binding');
                this.visible_bind = true;
            },

            /* 表格 */
            // 请求表格数据
            getTableData() {
                // 正在请求, 直接退出
                if (this.loading) {
                    return;
                }

                // 否则开始请求
                this.loading = true;
                // 设置请求页数
                const pageNo = Math.floor(this.tableData.length / this.pageSize) + 1;
                return new Promise((resolve, reject) => {
                    getPageByOrg({
                        orgId: this.enterpriseId,
                        pageNo,
                        pageSize: this.pageSize
                    }).then(response => {
                        if (response.code === '1') {
                            // 本次请求得到的数据
                            const dataList = response.data.list || [];
                            // 更新数据
                            this.handleData(dataList);
                        } else {
                            // 提示, 请求数据失败
                            this.$Message.error(this.$t('crm.Modal.error_getData'));
                        }
                        this.loading = false;
                        resolve(true);
                    }).catch(error => {
                        // 提示, 请求数据失败
                        console.error(error);
                        this.$Message.error(this.$t('crm.Modal.error_getData'));
                        this.loading = false;
                        resolve(true);
                    });
                });
            },
            // 处理接口请求回的数据
            handleData(dataList) {
                // 去除原有 tableData 中和传入的新获取数据 dataList id 一致的部分
                let tableData = this.tableData.filter(item => dataList.findIndex(data => data.id === item.id) === -1);
                // 拼接新传入数据
                tableData = tableData.concat(dataList);
                // 按 createTime 从小到大排序
                tableData = tableData.sort((a, b) => (new Date(a.createTime)).getTime() - (new Date(b.createTime)).getTime());
                // 判断是否需要弹出已全部加载完成提示
                const prevTableDataLength = this.tableData.length;
                const nowTableDataLength = tableData.length;
                if (prevTableDataLength === nowTableDataLength && prevTableDataLength > 0) {
                    this.$Message.info(this.$t('facebook.adAccountBinding.noMore'));
                }
                // tableData 赋值
                this.tableData = tableData;
            },
            // 解绑账户
            unbind_account(row) {
                this.unbindAccount = row;
                this.visible_unbind = true;
            },

            /* 解绑模态框 */
            // 取消解绑
            cancel_unbind() {
                this.visible_unbind = false;
                this.unbindAccount = {};
            },
            // 确认解绑
            confirm_unbind() {
                this.loading_unbind = true;
                const accountName = this.unbindAccount.accountName;
                unbindAdAccount({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    accountId: this.unbindAccount.accountId
                }).then(response => {
                    this.loading_unbind = false;
                    if (response.code === '1') {
                        this.$Message.success(this.$t('facebook.adAccountBinding.success_unbindSureTip1') + accountName + this.$t('facebook.adAccountBinding.success_unbindSureTip2'));
                        // 关闭弹窗
                        this.cancel_unbind();
                        // 数据置空并重新请求
                        this.tableData = [];
                        this.getTableData();
                    } else {
                        // 提示, 请求数据失败
                        this.$Message.error(this.$t('facebook.adAccountBinding.error_unbindSureTip1') + accountName + this.$t('facebook.adAccountBinding.error_unbindSureTip2'));
                    }
                }).catch(error => {
                    // 提示, 请求数据失败
                    console.error(error);
                    this.$Message.error(this.$t('facebook.adAccountBinding.error_unbindSureTip1') + accountName + this.$t('facebook.adAccountBinding.error_unbindSureTip2'));
                    this.loading_unbind = false;
                });
            },
            // 删除失效账户
            delete_account(row) {
                this.loading = true;
                const accountName = row.accountName;
                deleteAdAccount({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    accountId: row.accountId
                }).then(response => {
                    this.loading = false;
                    if (response.code === '1') {
                        this.$Message.success(this.$t('facebook.adAccountBinding.success_deleteSureTip1') + accountName + this.$t('facebook.adAccountBinding.success_deleteSureTip2'));
                        // 数据置空并重新请求
                        this.tableData = [];
                        this.getTableData();
                    } else {
                        // 提示, 请求数据失败
                        this.$Message.error(this.$t('facebook.adAccountBinding.error_deleteSureTip1') + accountName + this.$t('facebook.adAccountBinding.error_deleteSureTip2'));
                    }
                }).catch(error => {
                    // 提示, 请求数据失败
                    console.error(error);
                    this.$Message.error(this.$t('facebook.adAccountBinding.error_deleteSureTip1') + accountName + this.$t('facebook.adAccountBinding.error_deleteSureTip2'));
                    this.loading = false;
                });
            },

            /* 绑定模态框 */
            // 懒加载广告账户数据, 作为级联选择数据
            load_ad_account(node, resolve) {
                const data = node.data || {};
                node.loading = true;
                switch (node.level) {
                    case 0:
                        // 请求 FB account 数据
                        getfbPersonPages({
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            providerId: 'facebook'
                        }).then(response => {
                            if (response.code === '1') {
                                data.children = response.data.map(item => {
                                    const { providerUserId: value, providerUserName: label, oauthConfigId } = item;
                                    return {
                                        value,
                                        label,
                                        oauthConfigId,
                                        leaf: false,
                                        children: []
                                    };
                                });
                            } else {
                                data.children = [];
                                if (response.code === '-101') {
                                    // FB 账号未绑定
                                    this.$Message.error(this.$t('crm.Modal.error_unboundFBAccount'));
                                } else {
                                    // 未请求到数据
                                    this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                                }
                            }
                            resolve(data.children);
                            node.loading = false;
                        }, error => {
                            data.children = [];
                            resolve(data.children);
                            node.loading = false;
                        }).catch(error => {
                            data.children = [];
                            resolve(data.children);
                            node.loading = false;
                        });
                        break;
                    case 1:
                        // 请求 FB account 下所有 ad account 数据
                        getfbClientAdAccounts({
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            providerId: 'facebook',
                            providerUserId: data.value
                        }).then(async response => {
                            if (response.code === '1') {
                                let bindedAdAccounts = [];
                                if (response.data.length) {
                                    bindedAdAccounts = await this.getBindedAdAccounts(data.oauthConfigId);
                                }
                                data.children = response.data.map(item => {
                                    const { id: value, name: label } = item;
                                    return {
                                        value,
                                        label,
                                        children: [],
                                        leaf: true,
                                        disabled: Boolean(bindedAdAccounts.find(account => account.accountId === item.id))
                                    };
                                });
                            }
                            resolve(data.children);
                            node.loading = false;
                        }, error => {
                            data.children = [];
                            resolve(data.children);
                            node.loading = false;
                        }).catch(error => {
                            data.children = [];
                            resolve(data.children);
                            node.loading = false;
                        });
                        break;
                    case 2:
                        resolve([]);
                }
            },
            // 获取 fb 账号已绑定的 ad account
            getBindedAdAccounts(oauthConfigId) {
                return getBindAdList({
                    orgId: this.enterpriseId,
                    oauthConfigId
                }).then((response) => {
                    if (response.code === '1') {
                        return Promise.resolve(response.data || []);
                    }
                    return Promise.resolve([]);
                }).catch(err => {
                    console.error(err);
                    return Promise.resolve([]);
                });
            },
            // 取消解绑
            cancel_bind() {
                this.visible_bind = false;
            },
            // 确认解绑
            confirm_bind() {
                // 获取选中结点
                const adAccount = this.$refs.selAdAccountCas.getCheckedNodes()[0];
                // 判断是否有数据, 有数据则发送绑定请求
                if (!adAccount) {
                    this.$Message.error(this.$t('crm.Table.errorOccurred'));
                    return;
                }

                this.loading_bind = true;
                saveFbAdAccount({
                    orgId: this.enterpriseId,
                    oauthConfigId: adAccount.parent.data.oauthConfigId,
                    accountId: adAccount.value,
                    accountName: adAccount.label,
                    createUserId: this.userId,
                    createUserName: this.userName
                }).then(response => {
                    this.loading_bind = false;
                    switch (response.code) {
                        case '1':
                            // 成功
                            // this.$emit('backToTable');
                            // 关闭弹窗
                            this.visible_bind = false;
                            // 数据置空并重新请求
                            this.tableData = [];
                            this.getTableData();
                            // 弹出成功提示
                            this.$Message.success(this.$t('facebook.adAccountBinding.success_bind_adAccount'));
                            break;
                        case '-101':
                            // 重复(已绑定)
                            // 设置 adAccountList 中相应选项为 disabled
                            adAccount.disabled = true;
                            this.$Message.error(this.$t('facebook.adAccountBinding.error_existed_adAccount'));
                            break;
                        default:
                            // 失败
                            this.$Message.error(this.$t('facebook.adAccountBinding.error_bind_adAccount'));
                    }
                }).catch(e => {
                    console.error(e);
                    this.$Message.error(this.$t('facebook.adAccountBinding.error_bind_adAccount'));
                    this.loading_bind = false;
                });
            }
        },
        activated() {
            // 数据置空并重新请求
            this.tableData = [];
            this.getTableData();
        }
    };
</script>

<style scoped lang="less">
    .ad-account-page {
        padding: 30px;

        .binding-title {
            font-weight: 500;
            font-size: 16px;
            color: #2d2f2e;
        }

        .binding-header {
            text-align: right;
            padding-bottom: 10px;
            margin-bottom: 10px;
            height: 38px;

            .binding-description {
                float: left;
                line-height: 32px;
                font-size: 12px
            }
        }
    }
</style>

<style lang="less">
    .binding-unbind-account {
        cursor: pointer;
    }

    .binding-delete-account {
        cursor: pointer;
        color: red;
    }

    .adAccountCas {
        line-height: 34px;
        width: 300px;
    }

    .adAccountCasPopper {
        .el-cascader-menu {
            width: 150px;
            min-width: auto;

            .el-cascader-node {
                font-size: 12px;
                padding: 5px 0;
                height: auto;

                .el-cascader-node__label {
                    white-space: normal;
                    word-wrap: break-word;
                    word-break: break-all;
                    line-height: normal;
                    display: flex;
                    align-items: center;
                }
            }
        }
    }
</style>
