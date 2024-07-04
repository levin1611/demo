<template>

    <Drawer
            :mask="false"
            :transfer="true"
            size="75%"
            :modal="false"
            :show-close="false"
            :visible.sync="visible"
            custom-class="scrollable"
            :with-header="true"
            :append-to-body="true"
            class="drawer-show-main-header drawer-close-button-moveUp data-movement-drawer"
            @close="handleClose">

<!--        <template slot="close">-->
<!--            <Icon custom="custom custom-drawer-detail-close"></Icon>-->
<!--        </template>-->
        <div style=" height: 50px">
                <h3 style="display: inline-block" class="data-movement-drawer-title" >
                    {{$t('data_movement.failureRecords')}}</h3>
                <div @click="exportData">
                    <Button v-if="columns.length && tableData.length" type="text" icon="custom custom-file-download"
                            style="float: right;display: block;padding-right: 60px;text-align: center;vertical-align: middle;position: relative;top: -32px;font-size: 12px;color: rgba(0,0,0,.8)">
                        {{$t('crm.Table.exportData') }}
                    </Button>
                </div>
                <a @click="handleClose" class="drawer-close-button">
                    <Icon custom="custom-drawer-detail-close"></Icon>
                </a>
        </div>
<!--        <template slot="header">-->
<!--            <h3 style="display: inline-block" class="data-movement-drawer-title">-->
<!--                {{$t('data_movement.failureRecords')}}</h3>-->
<!--            <Button v-if="columns.length && tableData.length" type="text" custom-icon="custom custom-file-download"-->
<!--                    @click="exportData" style="float: right;display: inline-block;padding: 0">{{-->
<!--                $t('crm.Table.exportData') }}-->
<!--            </Button>-->
<!--        </template>-->

        <Table class="noborder-table"
               :height="table_height"
               :columns="columns"
               :data="tableData">
            <TableColumn v-for="item in columns"
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
        <Page layout="total, prev, pager, next, sizes, jumper"
              :total="pageTotal"
              :current-page="curPage"
              :page-size="pageSize"
              @current-change="changePage"
              @size-change="pageSizeChange"
              class="paging">

        </Page>
    </Drawer>


    <!-- 文件导出 -->

</template>

<script>
    import util from '@/libs/util';
    import {mapState} from 'vuex';

    export default {
        name: 'dataMovementDrawer',
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            fileName: {
                type: String,
                default: ''
            },
            failedData: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        computed: {
            ...mapState({
                'window_height': 'window_height'
                // fieldsInFiles: state => state.crm.fieldsInFiles
            }), // 从 vuex 中获取属性
            table_height() {
                let temp = this.window_height ? this.window_height - 175 : document.body.clientHeight - 175;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            }
        },
        data() {
            return {
                columns: [],
                tableData: [],
                pageSize: 10,
                pageTotal: 0,
                curPage: 1
            };
        },
        methods: {
            handleClose() {
                this.$emit('update:visible', false);
            },

            // 获取文件对应字段后渲染表格
            initTable() {
                // 数据重置
                this.columns = [];
                this.tableData = [];

                // 文件名校验
                if (!this.fileName) {
                    this.$Message.error(this.$t('crm.Modal.errorOccurred'));
                    return undefined;
                }

                // 格式化 columns
                // let temp = this.fieldsInFiles.find(item => item.hasOwnProperty(this.fileName));
                let temp = [];
                for (let i = 0; i < localStorage.length; i++) {
                    let key = localStorage.key(i);
                    if (key === `${this.fileName}header`) {
                        temp = JSON.parse(localStorage.getItem(key));
                    }
                }
                console.log('the temp is ', temp);
                temp.push('失败的原因');
                // temp.splice(99,0,"失败的原因");
                // this.$set(temp,100,"失败的原因")
                console.log('-----=+++++', temp);
                if (temp) {
                    // let arr_fileField = temp[this.fileName];
                    if (Array.isArray(temp) && temp.length) {
                        this.columns = temp.map((item, index) => {
                            return {
                                key: item === '失败的原因' ? 100 : index,
                                title: item,
                                width: 200
                            };
                        });
                    }
                }

                // 格式化 tableData
                let failData = this.failedData[this.fileName];
                this.pageTotal = failData.length;
                if (Array.isArray(failData) && failData.length) {
                    if (failData.length < this.pageSize) {
                        this.tableData = failData;
                    } else {
                        this.tableData = failData.slice(0, this.pageSize);
                    }
                }
            },
            changePage(index) {
                let failData = this.failedData[this.fileName];
                let _start = (index - 1) * this.pageSize;
                let _end = index * this.pageSize;
                this.tableData = failData.slice(_start, _end);
            },
            pageSizeChange(pageSize) {
                this.curPage = 1;
                this.pageSize = pageSize;
                this.initTable();
            },

            // 文件下载
            exportData() {
                let failData = this.failedData[this.fileName];
                util.ajaxJson({
                    url: '/crm/inquiryImportLog/downloadFile',
                    method: 'post',
                    responseType: 'arraybuffer',
                    data: {
                        fileName: this.fileName,
                        headerContents: this.columns.map(item => item.title),
                        rowDataFailList: failData
                    }
                }).then(res => {
                    console.log(res);
                    const data = res.data;
                    const blob = new Blob([data], {type: 'application/vnd.ms-excel'});

                    const a = document.createElement('a');
                    a.href = window.URL.createObjectURL(blob);
                    a.download = this.fileName.replace(/\.xls$/, '.xlsx');
                    a.click();
                    URL.revokeObjectURL(a.href); // 释放通过 URL.createObjectURL() 创建的 URL
                }).catch(err => {
                    console.log(err);
                    this.$Message.error('文件下载失败，请重试');
                });
            }
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        this.initTable();
                    }
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .paging {
        float: right;
        /*margin: 10px 0;*/
    }

    .drawer-close-button-moveUp {
        .el-drawer__close-btn {
            top: 0;
            right: 0;

            .el-icon {
                font-size: 26px;
                background-color: #FFF;
                color: #495060;
                opacity: .5;
                border-radius: 20%;
            }
        }

        .drawer-close-button {
            cursor: pointer;
            font-size: 14px;
            overflow: hidden;
            position: absolute;
            top: 0;
            right: 0;
            z-index: 1;

            .custom {
                font-size: 26px;
                background-color: #FFF;
                color: #495060;
                opacity: .5;
                border-radius: 20%;
            }
        }
    }
</style>
<style lang="less">
    .data-movement-drawer {
        .ivu-drawer-header {
            padding-left: 30px;
            padding-top: 30px;
            padding-bottom: 20px;
        }

        .ivu-drawer-body {
            padding: 0;
        }
        .el-drawer__body {
            padding-left: 20px !important;
            padding-top: 20px !important;
        }

        .data-movement-drawer-title {
            font-family: PingFangSC-Medium;
            font-size: 18px;
            color: rgba(0, 0, 0, 0.80);
            letter-spacing: 0;
            line-height: 26px;
            padding-left: 8px !important;
        }
    }
</style>
