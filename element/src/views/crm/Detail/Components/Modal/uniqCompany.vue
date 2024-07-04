<template>
    <div>
        <Modal :title="$t('crm.Modal.title_uniqCompany')"
               :visible="visible"
               :show-close="true"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :append-to-body="true"
               width="900px"
               @close="cancel"
               @opened="handleOpen"
               @closed="handleClose"
               class="modal uniqModal vertical-center-modal">
            <div>
                <div class="tableLegend">{{ fromClue ? $t('crm.Modal.legend_uniqCompanyLinkTable') : $t('crm.Modal.legend_uniqCompanyTable') }}</div>

                <Table :data="table_data"
                       v-loading="loading"
                       :empty-text="$t('crm.Modal.tip_noRepeat')"
                       :max-height="tableMaxHeight"
                       @cell-click="copy_content"
                       class="tabmain">
                    <!--<TableColumn width="35">-->
                    <!--    <template slot-scope="scope">-->
                    <!--        <Radio :value="selected_index"-->
                    <!--               :label="scope.$index"-->
                    <!--               @change="label => selected_index = label"-->
                    <!--               style="margin: 0"></Radio>-->
                    <!--    </template>-->
                    <!--</TableColumn>-->
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
                                <template v-if="!scope.row.userName">
                                    <a @click.stop="jumpToHighseas(scope.row.id)">{{ scope.row[item.key] }}</a>
                                </template>
                                <template v-else>
                                    {{ scope.row[item.key] }}
                                </template>
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
    </div>
</template>

<script>
    import { crmCompany } from '@/api/crm/index';
    import { mapState } from 'vuex';
    export default {
        name: 'uniqCompany',
        props: [
            'transfer',
            'visible',
            'merged',
            'mergedId',
            'companyName',
            'fromClue'
        ],
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                allowMerge: state => state.crm.allowMerge,
                uniqTypeCompanyName: state => state.crm.uniqTypeCompanyName,
                window_height: 'window_height'
            }),
            tableMaxHeight() {
                const temp = this.window_height ? this.window_height - 341 : document.body.clientHeight - 341;
                return temp > 159 ? temp : 159;
            },
            tableColumns() {
                return this.allColumns.slice(0, this.allColumns.length - (this.fromClue ? 0 : 1));
            }
        },
        data() {
            return {
                loading: true,
                selected_index: -1,
                table_data: [],
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
                this.get_table_data();

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
                this.table_data = [];
                this.selectedCompany = {};
            },
            get_table_data() {
                this.loading = true;
                crmCompany.getNameList({
                    orgId: this.enterpriseId,
                    companyName: this.companyName,
                    ifExactSearch: this.uniqTypeCompanyName === '1' ? 0 : 1
                }).then(response => {
                    if (response.data.list.length > 0) {
                        this.table_data = response.data.list;

                        // 选中第一项
                        if (this.fromClue && this.table_data[0]) {
                            this.selectCompany(this.table_data[0]);
                        }
                    }
                    this.loading = false;
                }, () => {
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                });
            },
            /* 并入公司 */
            ok() {
                if (this.allowMerge !== '1') {
                    this.$Message.error(this.$t('crm.Modal.error_notAllowMerge'));
                } else if (this.selected_index === -1) {
                    this.$Message.error(this.$t('crm.Modal.error_noSelectedCompany'));
                } else if (this.table_data[this.selected_index]) {
                    this.$emit('update:mergedId', this.table_data[this.selected_index].id);
                    this.$emit('update:companyName', this.table_data[this.selected_index].companyName);
                    this.$emit('update:visible', false);
                    this.$emit('update:merged', true);
                    this.$Message.info(this.$t('crm.Modal.info_companyMergedTip'));
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_selectedCompany'));
                }
            },
            cancel() {
                this.$emit('update:visible', false);
            },
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
