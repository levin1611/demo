<template>
    <Modal :visible="visible"
           :modal="false"
           :append-to-body="false"
           :show-close="true"
           class="data_base_modal"
           :title="$t('wagroupsend.addSmartMaterials')"
           width="800px"
           top="6vh"
           @close="cancelFileSelected">
        <div class="data_base_container">
            <!-- 表格 -->
            <Table :data="tableData"
                    v-loading="tableLoading"
                    height="500px"
                    size="medium"
                    stripe
                    highlight-current-row
                    @row-click="rowClick"
                    class="smart-modal-tabmain tabmain">
                <!-- 正常列 -->
                <TableColumn v-for="item in tableColumns"
                        :key="item.key"
                        :prop="item.key"
                        :label="item.title"
                        :width="item.width"
                        :show-overflow-tooltip="['title', 'filename'].includes(item.key)">
                    <template slot-scope="scope">
                        <!-- 文件名字 -->
                        <template v-if="item.key === 'title'">
                            {{ scope.row[item.key]}}
                        </template>

                        <!-- 分享文件 -->
                        <template v-else-if="item.key === 'filename'">
                            {{ scope.row[item.key]}}
                        </template>

                        <!-- 大小 -->
                        <template v-else-if="item.key === 'size'">
                            {{ fileSizeFilter(scope.row.size) }}
                        </template>

                        <!-- 创建时间 -->
                        <template v-else-if="item.key === 'createTime'">
                            {{ scope.row[item.key] }}
                        </template>
                    </template>
                </TableColumn>
            </Table>

            <!-- page -->
            <div style="margin-right: 30px;overflow: hidden;background: #fff;position: relative;">
                <Page :page-size="pageSize"
                      :page-sizes="pagesizeopts"
                      :total="totalNum"
                      :current-page="curPage"
                      layout="total, prev, pager, next, sizes, jumper"
                      @current-change="changePage"
                      @size-change="pageSizeChange"
                      class="pageWrap-right"></Page>
            </div>
            <div slot="footer" style="text-align:right;margin-top: 10px;">
                <Button type="primary" @click="confirmFileSelected">{{$t('material.Btn.confirm')}}</Button>
            </div>
        </div>
    </Modal>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'smartModal',
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                wAGroupSendVisible: state => state.wAGroupSendVisible
            }),
            // 最大页码
            maxPageNum() {
                return this.pageSize ? Math.ceil(this.totalNum / this.pageSize) : 1;
            }
        },
        props: [
            'visible'
        ],
        data() {
            return {
                item: null,

                tableColumns: [
                    {
                        key: 'title',
                        title: this.$t('wagroupsend.shareTitle'),
                        width: 200,
                        sortable: false
                    },
                    {
                        key: 'filename',
                        title: this.$t('wagroupsend.shareFiles'),
                        width: 220,
                        sortable: false
                    },
                    {
                        key: 'size',
                        title: this.$t('wagroupsend.size'),
                        width: 120,
                        sortable: false
                    },
                    {
                        key: 'createTime',
                        title: this.$t('wagroupsend.creationTime'),
                        width: 200,
                        sortable: false
                    }
                ],

                tableLoading: false,
                tableData: [],
                totalNum: 0,
                activeName: 'all',
                curPage: 1,
                pageSize: 10,
                pagesizeopts: [10, 20, 30, 50]
            };
        },
        methods: {
            init() {
                this.item = null;
                this.tableLoading = false;
                this.tableData = [];
                this.totalNum = 0;
                this.activeName = 'all';
                this.curPage = 1;
                this.pageSize = 10;
                this.pagesizeopts = [10, 20, 30];
            },
            /* 分页 */
            // 改变每页条数
            pageSizeChange(pageSize) {
                this.curPage = 1;
                this.pageSize = pageSize;
                this.getSmartFileList();
            },
            // 改变页码
            changePage(page) {
                if (page <= this.maxPageNum) {
                    this.curPage = page;
                    this.getSmartFileList();
                }
            },
            rowClick(item) {
                this.item = item;
            },
            getSmartFileList() {
                this.tableData = [];
                this.tableLoading = true;
                const data = {
                    orderType: 'asc',
                    orderColumn: '', // 排序字段  id
                    page: this.curPage,
                    pageNumber: this.pageSize,
                    day: this.activeName
                };
                util.ajax233({
                    url: '/push/getList',
                    method: 'post',
                    data: data
                }).then(res => {
                    if (res.data.code === '1') {
                        this.totalNum = res.data.data.total;
                        this.tableData = res.data.data.list;
                    } else {
                        this.$Message.error(res.data.message);
                    }
                    this.tableLoading = false;
                }).catch(err => {
                    console.error('err', err);
                    this.tableLoading = true;
                });
            },
            confirmFileSelected() {
                this.$emit('update:visible', false);
                this.$emit('handleSmartFile', this.item);
            },
            cancelFileSelected() {
                this.$emit('update:visible', false);
            },
            fileSizeFilter(bytes) {
                const byte = parseInt(bytes);
                if (byte === 0) {
                    return '0 B';
                }
                const k = 1024;
                const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
                const i = Math.floor(Math.log(byte) / Math.log(k));
                return `${(byte / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
            }
        },
        watch: {
            // modal消失时, 重置组件
            wAGroupSendVisible: {
                handler(val) {
                    if (!val) {
                        this.init();
                    } else {
                        this.getSmartFileList();
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less">
    // @import "../../crm/Table/Components/less/tablePage.less";
    .data_base_modal {
        .el-tabs__nav-wrap:after {
            height: 1px !important;
        }
        /deep/ .el-dialog__body {
            padding: 24px;
        }
    }
    .smart-modal-tabmain .el-table__header .has-gutter {
        color: #333333;
        font-size: 14px;
    }

    .smart-modal-tabmain .el-table__body .el-table__row {
        color: #333333;
        font-size: 14px;
    }
</style>
<style lang="less" scoped>
    .data_base_modal {
        /deep/ .el-dialog__body {
            padding: 24px;
        }
    }
</style>
