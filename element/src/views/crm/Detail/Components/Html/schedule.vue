<template>
    <div style="margin-top: 16px;">
        <!-- 新建任务按钮 -->
        <div style="text-align: right;margin-bottom: 10px;">
            <Button v-if="authorized_button['newTask'] && !disabled" color="#fb8b2f" type="primary" @click="newTask"
                    size="large">{{ $t('crm.Html.newTask') }}
            </Button>
        </div>

        <!-- 任务列表 -->
        <Table :data="tableData"
               class="tabmain noBoxShadow-right noborder-table noborder-table-normal-border"
               :height="table_height"
               :row-class-name="tableRowClassName"
               cell-class-name="no-padding-cell"
               header-cell-class-name="no-padding-cell"
               @row-click="showTaskDetail">
            <!-- 状态列 -->
            <TableColumn align="center"
                         width="35px">
                <template slot-scope="scope">
                    <template v-if="scope.row.taskStatus === 1">
                        <Icon type="record" color="#FA8241" style="transform: scale(.7)"></Icon>
                    </template>
                    <template v-else>
                        {{ '' }}
                    </template>
                </template>
            </TableColumn>
            <!-- 正常渲染列 -->
            <TableColumn v-for="item in tableColumns"
                         :key="item.key"
                         :prop="item.key"
                         :label="item.title"
                         :width="item.width"
                         :formatter="item.formatter"
                         :show-overflow-tooltip="true"></TableColumn>
            <!-- 操作列 -->
            <TableColumn v-if="!disabled" width="85px" >
                <template slot-scope="scope">
                    <div class="operateCol" :class="{'highSeas-manage-hide' : disabled}">
                        <template v-if="authorized_button.editTask">
                            <Icon type="edit" @click.native="editTask($event, scope)"></Icon>
                        </template>
                        <Icon type="flag" @click.native="flagTask($event, scope)"></Icon>
                        <template v-if="authorized_button.deleteTask">
                            <Icon type="trash-a" @click.native="deleteTask($event, scope)"></Icon>
                        </template>
                    </div>
                </template>
            </TableColumn>
        </Table>

        <!-- 分页 -->
        <Page
                :page-size="pageSize"
                :page-sizes="[10, 20, 30, 50]"
                :total="total"
                :current-page="currentPageNum"
                class="pageWrap-right"
                layout="total, prev, pager, next, sizes, jumper"
                @current-change="pageChange"
                @size-change="pageSizeChange">
        </Page>

        <!-- 任务弹窗 -->
        <TaskModal :visible.sync="modalShow"
                   :type="modalType"
                   :disabled="disabled"
                   :fromInquiry="fromInquiryObj"
                   fromModule="inquiryDetail"
                   :taskObjProp.sync="tableData[taskIndex]"
                   refreshMethodName="getAllTableData"></TaskModal>
    </div>
</template>

<script>
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { mapState } from 'vuex';
    import TaskModal from '@/views/crm/Detail/Components/Modal/taskModals';
    import { crmCommon } from '@/api/crm/index';

    export default {
        name: 'schedule',
        components: {
            TaskModal
        },
        props: [
            'id',
            'inquirySeqNumber',
            'companyId',
            'companyName',
            'disabled',
            'flag_update_task'
        ],
        data() {
            return {
                /* 表格相关 */
                tableColumns: [
                    {
                        title: this.$t('crm.Html.taskEndTime'),
                        key: 'taskEndTime',
                        width: 160,
                        formatter: row => {
                            return new Date(row.taskEndTime).format('yyyy-MM-dd hh:mm:ss');
                        }
                    },
                    {
                        title: this.$t('crm.Html.participants'),
                        key: 'participantsJson',
                        formatter: row => {
                            let str;
                            if (row.participantsJson && JSON.parse(row.participantsJson)) {
                                str = JSON.parse(row.participantsJson).map(item => item.userName).join(', ');
                            } else {
                                str = this.$t('crm.Html.errorOccurred');
                            }
                            return str;
                        }
                    },
                    {
                        title: this.$t('crm.Html.taskName'),
                        key: 'taskName'
                    },
                    {
                        title: this.$t('crm.Html.taskDetails'),
                        key: 'taskDetails'
                    }
                ],
                allTableData: [],
                tableData: [],
                total: 0,
                pageSize: 10,
                currentPageNum: 1,
                /* Modal 相关 */
                taskIndex: undefined,
                modalType: '',
                modalShow: false
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                button_list: state => state.app.button_list,
                window_height: state => state.window_height
            }), // 从 vuex 中获取属性
            fromInquiryObj() {
                return {
                    inquiryId: this.id,
                    inquirySeqNumber: this.inquirySeqNumber,
                    companyId: this.companyId,
                    companyName: this.companyName
                };
            },
            authorized_button() {
                const ids = BUTTON_IDS.CRM.inquiry;
                return {
                    newTask: !HANDLE_BUTTON(ids.edit.newTask, this.button_list),
                    editTask: !HANDLE_BUTTON(ids.edit.editTask, this.button_list),
                    deleteTask: !HANDLE_BUTTON(ids.edit.deleteTask, this.button_list)
                };
            },
            table_height() {
                let temp = this.window_height ? this.window_height - 236 : document.body.clientHeight - 236;
                temp -= 188;
                return temp > 200 ? temp : 200;
            }
        },
        methods: {
            // 跟进询盘id 获取任务列表
            getAllTableData() {
                crmCommon.getListByInquiryId({
                    inquiryId: this.id,
                    pageNo: this.currentPageNum,
                    pageSize: this.pageSize
                }).then(response => {
                    if (response.code === '1') {
                        this.total = response.data.total || 0;
                        this.tableData = response.data.list || [];
                    }
                });
            }, // 获取所有任务数据
            getTableData() {
                // if (this.allTableData.length < this.pageSize * this.currentPageNum) {
                //     this.currentPageNum = 1;
                // }
                this.tableData = this.allTableData.slice((this.currentPageNum - 1) * this.pageSize, this.currentPageNum * this.pageSize);
            }, // 获取到所有数据或改变分页配置后,重新分配当前表格显示的数据
            tableRowClassName: ({ row, rowIndex }) => {
                row.$index = rowIndex;
                return row.taskStatus === 1 ? 'unfinished' : undefined;
            }, // 根据任务的完成状态设置字体加粗
            pageChange(num) {
                this.currentPageNum = num;
                // this.getTableData();
                this.getAllTableData();
            },
            pageSizeChange(size) {
                this.pageSize = size;
                this.currentPageNum = 1;
                // if (this.allTableData.length < this.pageSize * this.currentPageNum) {
                //     this.currentPageNum = 1;
                // }
                // this.getTableData();
                this.getAllTableData();
            },

            editTask(e, scope) {
                e.stopPropagation();
                this.taskIndex = scope.$index;
                this.modalType = 'editTask';
                if (this.modalShow) {
                    this.modalShow = false;
                }
                setTimeout(() => {
                    this.modalShow = true;
                }, 1);
            },
            flagTask(e, scope) {
                e.stopPropagation();
                this.$confirm(scope.row.taskStatus === 1 ? this.$t('crm.Html.modal_signTaskToFinished') : scope.row.taskStatus === 2 ? this.$t('crm.Html.modal_signTaskToUnfinished') : this.$t('crm.Html.errorOccurred'), scope.row.taskStatus === 1 ? this.$t('crm.Html.sign') : scope.row.taskStatus === 2 ? this.$t('crm.Html.cancelSign') : this.$t('crm.Html.errorOccurred'), {
                    confirmButtonText: this.$t('crm.Html.modal_ok'),
                    cancelButtonText: this.$t('crm.Html.modal_cancel')
                }).then(() => {
                    let temp = 0;
                    switch (scope.row.taskStatus) {
                        case 1:
                            temp = 2;
                            break;
                        case 2:
                            temp = 1;
                    }
                    crmCommon.updateTaskStatus({
                        id: scope.row.id,
                        taskStatus: temp
                    }).then(response => {
                        if (response.code === '1' && response.data) {
                            this.$Message.success(this.$t('crm.Html.success_changeTaskStatus'));
                            this.tableData[scope.$index].taskStatus = temp;
                        } else {
                            this.$Message.error(this.$t('crm.Html.error_changeTaskStatus'));
                        }
                    });
                });
            },
            deleteTask(e, scope) {
                e.stopPropagation();
                this.$confirm(this.$t('crm.Html.modal_deleteTaskContent'), this.$t('crm.Html.delete'), {
                    okButtonText: this.$t('crm.Html.modal_ok'),
                    cancelButtonText: this.$t('crm.Html.modal_cancel')
                }).then(() => {
                    crmCommon.taskDelete({
                        id: scope.row.id,
                        orgId: this.enterpriseId
                    }).then(response => {
                        if (response.code === '1' && response.data) {
                            this.deleteFinished();
                        } else {
                            this.$Message.error(this.$t('crm.Html.error_deleteTask'));
                        }
                    });
                });
            },
            deleteFinished() {
                if (this.tableData.length === 1) {
                    /* --this.currentPageNum; */
                    /* 原代码会导致当表格只有一个任务，删除该任务后页码出现'0'页码的bug */
                    --this.currentPageNum === 0 ? this.currentPageNum = 1 : --this.currentPageNum;
                }
                this.getAllTableData();
            },

            newTask() {
                this.modalType = 'newTask';
                this.modalShow = true;
            },
            showTaskDetail(row) {
                // 此处因为 @row-click 获取不到 scope.$index , 所以在 :row-class-name 中手动给 row 加上 $index
                this.taskIndex = row.$index;
                this.modalType = 'showTask';
                this.modalShow = true;
            }
        },
        created() {
            this.getAllTableData();
            // this.getTableData();
        },
        watch: {
            flag_update_task() {
                this.currentPageNum = 1;
                this.getAllTableData();
            }
        }
    };
</script>

<style scoped lang="less">
    .operateCol {
        display: none;
    }

    * /deep/ .el-table__body tr:hover .operateCol {
        display: block;

        i {
            color: #FA8241;
            font-size: 16px;
            display: inline-block;
            cursor: pointer;
            padding-right: 15px;
        }
    }

    * /deep/ .unfinished {
        font-weight: bolder;
    }
</style>
