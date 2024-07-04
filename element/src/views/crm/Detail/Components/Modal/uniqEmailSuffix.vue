<template>
    <Modal :title="$t('crm.Modal.title_uniqEmailSuffix')"
           :visible="visible"
           :show-close="true"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           :append-to-body="true"
           width="900px"
           @close="cancel"
           @open="handleOpen"
           @closed="handleClose"
           class="modal uniqModal vertical-center-modal">
        <div>
            <!-- 说明 -->
            <div class="tableLegend">{{ (fromClue ? $t('crm.Modal.legend_uniqEmailSuffixLinkTable') : $t('crm.Modal.legend_uniqEmailSuffixTable')).replace(/\$field/g, emailSuffix) }}</div>

            <!-- 重复数据表格 -->
            <Table :data="tableData"
                   v-loading="loading"
                   :empty-text="$t('crm.Modal.tip_noRepeat')"
                   :max-height="tableMaxHeight"
                   @cell-click="copy_content"
                   class="tabmain">
                <TableColumn v-for="item in tableColumns"
                             :key="item.key"
                             :prop="item.key"
                             :label="item.title"
                             :align="item.align"
                             :width="item.width"
                             :formatter="item.formatter"
                             :show-overflow-tooltip="true">
                    <template slot-scope="scope">
                        <template v-if="item.key === 'linkConfirm'">
                            <Radio :value="scope.row.id === selectedCompany.id"
                                   :label="true"
                                   @click.native.stop="selectCompany(scope.row)">{{ '' }}</Radio>
                        </template>
                        <template v-else-if="item.key === 'companyName'">
                            <!--<template v-if="!scope.row.userName">-->
                            <!--    <span @click.stop="jumpToHighseas(scope.row.id)">{{ scope.row[item.key] }}</span>-->
                            <!--</template>-->
                            <!--<template v-else>-->
                            <span @click.stop="jumpToCustomer(scope.row.companyId)"
                                  class="jump-link">{{ scope.row[item.key] }}</span>
                            <!--</template>-->
                        </template>
                        <template v-else-if="item.formatter">
                            {{ (item.formatter)(scope.row) }}
                        </template>
                        <template v-else>
                            {{ scope.row[item.key] }}
                        </template>
                    </template>
                </TableColumn>
            </Table>

            <!-- 隐藏元素, 用来复制内容 -->
            <textarea ref="copy_element" style="width: 0;height: 0;opacity: 0;"></textarea>
        </div>

        <div slot="footer">
            <!-- 关闭弹窗 -->
            <Button @click="cancel">{{ $t('crm.Modal.modal_close') }}</Button>
            <!-- 客户下新增联系人 -->
            <Button v-if="fromClue"
                    type="primary"
                    @click="newContact"
                    class="piwik-linkNewContact">{{ $t('crm.Modal.linkNewContact') }}</Button>
        </div>
    </Modal>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import { getContactRepeatData } from '@/api/reusableApi/common';
    import { GET_EMAIL_SUFFIX } from '@/api/mail';

    export default {
        name: 'uniqEmailSuffix',
        props: [
            'visible',
            'email',
            'fromClue'
        ],
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                allowMerge: state => state.crm.allowMerge,
                window_height: 'window_height'
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            tableMaxHeight() {
                const temp = this.window_height ? this.window_height - 341 : document.body.clientHeight - 341;
                return temp > 159 ? temp : 159;
            },
            tableColumns() {
                return this.allColumns.slice(0, this.allColumns.length - (this.fromClue ? 0 : 1));
            },
            // 当前传入邮箱的后缀
            emailSuffix() {
                return GET_EMAIL_SUFFIX(this.email.trim());
            }
        },
        data() {
            return {
                loading: true,
                tableData: [],
                allColumns: [
                    {
                        key: 'companyName',
                        title: this.$t('crm.Modal.corp_companyName'),
                        width: 240
                    },
                    {
                        key: 'userName',
                        title: this.$t('crm.Modal.managers'),
                        width: 180,
                        formatter: row => {
                            return row.userName || this.$t('crm.Modal.highseasCustomer');
                        }
                    },
                    {
                        key: 'createTime',
                        title: this.$t('crm.Modal.createTime'),
                        width: 300,
                        formatter: row => {
                            return this.$options.filters.timeFormat(new Date(row.createTime));
                        }
                    },
                    {
                        title: this.$t('crm.Modal.linkConfirm'),
                        key: 'linkConfirm',
                        width: 120
                    }
                ],

                tableFirstShow: true,

                // 客户下新增联系人
                selectedCompany: {}
            };
        },
        methods: {
            handleOpen() {
                if (!this.email) {
                    this.$Message.error(this.$t('crm.Modal.error_noEmailToUniq'));
                    this.cancel();
                    return;
                }

                this.getTableData(this.email);

                if (this.tableFirstShow) {
                    this.tableFirstShow = false;
                    this.$Message.info({
                        message: this.$t('crm.Modal.tip_canCopy'),
                        duration: 3000
                    });
                }
            },
            handleClose() {
                this.loading = true;
                this.tableData = [];
                this.selectedCompany = {};
            },
            // 获取重复数据
            async getTableData(value) {
                if (value.trim()) {
                    // 清空数据, 显示 loading
                    this.loading = true;
                    this.tableData = [];

                    // 组装发送数据
                    const params = {
                        orgId: this.enterpriseId,
                        emailSuffix: this.emailSuffix
                    };

                    // 发送请求
                    const data = await getContactRepeatData(params);

                    if (data.code === '1') {
                        this.tableData = Array.isArray(data.data) ? data.data.map(item => Object.assign(item, { id: item.companyId })) : [];

                        // 选中第一项
                        if (this.fromClue && this.tableData[0]) {
                            this.selectCompany(this.tableData[0]);
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_getEmailSuffixRelated'));
                    }
                    this.loading = false;
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_getEmailSuffixRelated'));
                }
            },
            cancel() {
                this.$emit('update:visible', false);
            },
            // 复制表格内容
            copy_content(row, column, cell) {
                const content = cell.innerText;
                if (content) {
                    this.$refs.copy_element.value = content;
                    this.$refs.copy_element.select();
                    if (document.execCommand('Copy')) {
                        this.$Message.success(this.$t('crm.Modal.success_copy'));
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_copy'));
                    }
                }
            },
            jumpToHighseas(id) {
                this.$viewHighSeasCustomer(id);
            },
            jumpToCustomer(id) {
                if (!this.isContainsMenu('myCustomer')) {
                    this.$Message.error(this.$t('crm.WorkBench.error_haveNoPermissionMyCustomer'));
                } else {
                    if (id) {
                        this.$viewCustomer(id);
                    } else {
                        this.$Message.error(this.$t('crm.WorkBench.error_companyId'));
                    }
                }
            },

            // 客户下新增联系人
            newContact() {
                // 检查是否有选中联系人, 无则报错并退出流程
                if (!this.selectedCompany.id) {
                    this.$Message.error(this.$t('crm.Modal.error_selectExistedCompany'));
                    return;
                }

                // 向上(线索录询盘框)传递被选中的公司信息
                this.$emit('customerNewContact', this.selectedCompany);
            },
            // 选中公司
            selectCompany(row) {
                this.selectedCompany = Object.assign({}, row);
            }
        }
    };
</script>

<style scoped lang="less">
    .checkbox {
        background: #fc8a32;
        border-color: #fc8a32;
    }

    .tabmain {
        /deep/ table {
            .cell {
                width: auto !important;
            }
        }
    }
</style>
