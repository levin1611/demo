<template>
    <div class="taskList-container">
        <!-- 数据展示 -->
        <div class="task-detail-wrap" :style="`height: ${table_height}px`">
            <div v-for="(item, index) in tableData"
                 @click="clickRow(item)"
                 :key="index"
                 class="task-detail">
                <div class="task-detail-item">
                    <div class="detail-item-title">{{ $t('crm.Html.taskEndTime') }}</div>
                    <div class="detail-item-content">{{ item.taskEndTime }}</div>
                </div>
                <div class="task-detail-item">
                    <div class="detail-item-title">{{ $t('crm.Html.participants') }}</div>
                    <div class="detail-item-content">{{ item.participants }}</div>
                </div>
                <div class="task-detail-item">
                    <div class="detail-item-title">{{ $t('crm.Html.taskName') }}</div>
                    <div class="detail-item-content">{{ item.taskName }}</div>
                </div>
                <div class="task-detail-item">
                    <div class="detail-item-title">{{ $t('crm.Html.taskDetails') }}</div>
                    <div class="detail-item-content">{{ item.taskDetails }}</div>
                </div>
                <!--<div class="task-detail-item">
                  <div class="detail-item-title">{{ $t('crm.Table.col_createTime') }}</div>
                  <div class="detail-item-content">{{ item.createTime | timeFormat("DateTime") }}</div>
                </div>-->
            </div>
        </div>

        <!-- 分页 -->
        <Page :page-size="pageSize"
              :page-sizes="[10, 20, 30, 50]"
              :pager-count="5"
              :total="total"
              :current-page="currentPageNum"
              class="pageWrap-right whiteSpace-normal"
              layout="total, prev, pager, next, sizes, jumper"
              @current-change="pageChange"
              @size-change="pageSizeChange"></Page>

        <TaskModal :visible.sync="modalShow"
                   :type="modalType"
                   :fromInquiry="fromInquiryObj"
                   :taskObjProp.sync="taskObjProp"
                   refreshMethodName="getAllTableData"></TaskModal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import TaskModal from '@/views/crm/Detail/Components/Modal/taskModals';

    export default {
        name: 'taskList',
        components: {
            TaskModal
        },
        props: [
            'id',
            'inquirySeqNumber',
            'companyId',
            'companyName'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height'
            }), // 从 vuex 中获取属性
            fromInquiryObj() {
                return {
                    inquiryId: this.id,
                    inquirySeqNumber: this.inquirySeqNumber,
                    companyId: this.companyId,
                    companyName: this.companyName
                };
            },
            table_height() {
                let temp = this.window_height ? this.window_height - 386 : document.body.clientHeight - 386;
                return temp > 200 ? temp : 200;
            }
        },
        data() {
            return {
                tableData: [],
                currentPageNum: 1,
                pageSize: 10,
                total: 0,
                loading: true, // 加载图标

                modalType: 'showTask',
                taskObjProp: {},
                fromInquiry: {},
                modalShow: false
            };
        },
        methods: {
            // 获取所有任务数据
            getAllTableData() {
                util.ajax({
                    url: '/crm/task/getListByInquiryId',
                    method: 'post',
                    data: {
                        inquiryId: this.id,
                        pageNo: this.currentPageNum,
                        pageSize: this.pageSize
                    }
                }).then(({ data }) => {
                    if (data.code === '1') {
                        this.total = data.data.total || 0;
                        this.tableData = data.data.list || [];
                        this.initData();
                    }
                }).catch(error => {
                    console.error(error);
                    this.$Message.error(this.$t('crm.Html.errorOccurred'));
                });
            },
            initData() {
                this.tableData = this.tableData.map(row => {
                    // 处理截止时间
                    row.taskEndTime = new Date(row.taskEndTime).format('yyyy-MM-dd hh:mm:ss');

                    // 处理参与人
                    let str;
                    if (row.participantsJson && JSON.parse(row.participantsJson)) {
                        str = JSON.parse(row.participantsJson).map(item => item.userName).join(', ');
                    } else {
                        str = this.$t('crm.Html.errorOccurred');
                    }
                    row.participants = str;

                    return row;
                });
            },
            clickRow(data) {
                console.log(data);
                this.taskObjProp = data;
                this.modalShow = true;
            },
            deleteFinished() {
                /* if (this.tableData.length === 1) {
                  /!*--this.currentPageNum;*!/
                  /!*原代码会导致当表格只有一个任务，删除该任务后页码出现'0'页码的bug*!/
                  --this.currentPageNum === 0 ? this.currentPageNum = 1 : --this.currentPageNum;
                } */
                this.getAllTableData();
            },

            /* 分页 */
            pageChange(num) {
                this.currentPageNum = num;
                this.getAllTableData();
            },
            pageSizeChange(size) {
                this.pageSize = size;
                this.currentPageNum = 1;
                this.getAllTableData();
            }
        },
        created() {
            this.currentPageNum = 1;
            this.getAllTableData();
        },
        watch: {
            id() {
                this.currentPageNum = 1;
                this.getAllTableData();
            }
        }
    };
</script>

<style lang="less" scoped>
    .taskList-container {
        padding:0 20px;
        // display: flex;
        // flex-direction: column;
    }

    .task-detail-wrap {
        // flex: 1;
        overflow-y: auto;
    }

    .task-detail {
        font-size: 12px;
        margin-bottom: 20px;
        cursor: pointer;

        .task-detail-item {
            padding: 4px 0;

            .detail-item-title {
                display: inline-block;
                width: 80px;
            }

            .detail-item-content {
                display: inline-block;
                width: calc(~"100% - 80px");
            }
        }
    }
</style>

<style lang="less">
    .whiteSpace-normal.el-pagination {
        white-space: normal;

        button, span:not([class*=suffix]) {
            min-width: auto;
            margin: 0;
            padding: 0;
        }
    }
</style>
