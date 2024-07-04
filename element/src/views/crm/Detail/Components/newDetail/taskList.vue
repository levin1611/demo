<template>
    <div class="taskList">
        <!-- 新建任务按钮 -->
        <div class="taskList-operate-newTask">
            <Button v-if="authorized_button['newTask']"
                    type="text"
                    @click="newTask">{{ $t('crm.Modal.operate_new') }}</Button>
        </div>

        <!-- 任务列表 -->
        <div class="taskList-container">
            <!-- 无数据 -->
            <div v-if="taskList.length === 0"
                 class="text-center">{{ $t('crm.Html.nothing') }}</div>

            <!-- 滚动加载 -->
            <ul v-else
                v-infinite-scroll="loadMore"
                :infinite-scroll-disabled="noMore">
                <TaskListItem v-for="item in taskList"
                              :key="`${item.id}`"
                              :rawData="item"
                              :isHighSeas="isHighSeas"
                              @showTask="showTask"
                              @editTask="editTask"
                              @flagTask="flagTask"
                              @deleteTask="deleteTask"></TaskListItem>
            </ul>
        </div>

        <!-- 任务弹窗 -->
        <TaskModal :visible.sync="modalShow"
                   :type="modalType"
                   :disabled="false"
                   :fromInquiry="fromInquiryObj"
                   fromModule="companyDetail"
                   :taskObjProp.sync="selected_task"
                   refreshMethodName="getTask"></TaskModal>
    </div>
</template>

<script>
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { mapState } from 'vuex';
    import TaskListItem from './taskListItem.vue';
    import TaskModal from '@/views/crm/Detail/Components/Modal/taskModals';
    import { crmCommon } from '@/api/crm/index';

    export default {
        name: 'taskList',
        components: {
            TaskListItem,
            TaskModal
        },
        props: [
            'type',
            'id',
            'isHighSeas',
            'inquirySeqNumber',
            'companyId',
            'companyName',
            'flag_update_task'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                button_list: state => state.app.button_list
            }),
            fromInquiryObj() {
                return {
                    inquiryId: this.id,
                    inquirySeqNumber: this.inquirySeqNumber,
                    companyId: this.companyId,
                    companyName: this.companyName
                };
            },
            authorized_button() {
                if (this.isHighSeas) {
                    return {};
                }

                const ids = BUTTON_IDS.CRM.inquiry;
                return {
                    newTask: !HANDLE_BUTTON(ids.edit.newTask, this.button_list)
                };
            },
            selected_task() {
                return this.taskList.find(item => item.id === this.selected_taskId) || {};
            }
        },
        data() {
            return {
                // 每页请求行数
                pageSize: 20,
                // 任务列表
                taskList: [],

                /* Modal 相关 */
                selected_taskId: 0,
                modalType: '',
                modalShow: false,
                noMore: false
            };
        },
        methods: {
            // 获取任务数据
            getTask(type) {
                // 无请求地址, 报错并退出流程
                if (this.type !== 'inquiry') {
                    this.$Message.error(this.$t('crm.newDetail.error_urlRequest'));
                    return;
                }
                // 处理请求数据
                const data = {
                    inquiryId: this.id
                };
                if (type === 'loadMore') {
                    // 如果是滚动加载, 则每次请求固定条数
                    data.pageNo = Math.floor(this.taskList.length / this.pageSize) + 1;
                    data.pageSize = this.pageSize;
                } else {
                    // 如果不是滚动加载, 那就是要刷新当前所有数据
                    data.pageNo = 1;
                    data.pageSize = this.taskList.length > this.pageSize ? this.taskList.length : this.pageSize;
                }
                // 发送请求
                crmCommon.getListByInquiryId(data).then(response => {
                    const resData = Array.isArray(response.data.list) ? response.data.list : [];
                    // 完全刷新状态下, 直接把接口返回内容更新到 taskList
                    if (type !== 'loadMore') {
                        this.taskList = resData.sort((a, b) => b.createTime - a.createTime);
                        return;
                    }
                    // "加载更多"状态下
                    // 未请求到数据, 提示"已到底部"
                    if (!resData.length && this.taskList.length) {
                        // 滚动到底部
                        this.$Message.success(this.$t('timeLine.noMore'));
                        return;
                    }
                    // 拼接请求到的数据
                    const result = this.taskList.concat(resData);
                    // 去重
                    const ids = new Set([]);
                    result.slice().reverse().forEach((item, index, arr) => {
                        if (ids.has(item.id)) {
                            result.splice(arr.length - 1 - index, 1);
                        }
                        ids.add(item.id);
                    });
                    // 时间正序排序并赋值
                    this.taskList = result.sort((a, b) => b.createTime - a.createTime);
                    if (this.taskList.length === response.data.total) {
                        this.noMore = true;
                    }
                }).catch(error => {
                    console.error(error);
                });
            },
            loadMore() {
                this.getTask('loadMore');
            },
            // 任务
            newTask() {
                this.modalType = 'newTask';
                this.modalShow = true;
            },
            // 编辑任务
            showTask(id) {
                this.selected_taskId = id;
                this.modalType = 'showTask';
                if (this.modalShow) {
                    this.modalShow = false;
                }
                setTimeout(() => {
                    this.modalShow = true;
                }, 1);
            },
            // 编辑任务
            editTask(id) {
                this.selected_taskId = id;
                this.modalType = 'editTask';
                if (this.modalShow) {
                    this.modalShow = false;
                }
                setTimeout(() => {
                    this.modalShow = true;
                }, 1);
            },
            // 标记任务为已完成/未完成
            flagTask(id) {
                this.selected_taskId = id;
                const message = this.selected_task.taskStatus === 1
                    ? this.$t('crm.Html.modal_signTaskToFinished')
                    : this.selected_task.taskStatus === 2
                        ? this.$t('crm.Html.modal_signTaskToUnfinished')
                        : this.$t('crm.Html.errorOccurred');
                const title = this.selected_task.taskStatus === 1
                    ? this.$t('crm.Html.sign')
                    : this.selected_task.taskStatus === 2
                        ? this.$t('crm.Html.cancelSign')
                        : this.$t('crm.Html.errorOccurred');
                const options = {
                    confirmButtonText: this.$t('crm.Html.modal_ok'),
                    cancelButtonText: this.$t('crm.Html.modal_cancel')
                };

                this.$confirm(message, title, options).then(() => {
                    let temp = 0;
                    switch (this.selected_task.taskStatus) {
                        case 1:
                            temp = 2;
                            break;
                        case 2:
                            temp = 1;
                    }
                    crmCommon.updateTaskStatus({
                        id: this.selected_taskId,
                        taskStatus: temp
                    }).then(response => {
                        if (response.code === '1' && response.data) {
                            this.$Message.success(this.$t('crm.Html.success_changeTaskStatus'));
                            this.selected_task.taskStatus = temp;
                        } else {
                            this.$Message.error(this.$t('crm.Html.error_changeTaskStatus'));
                        }
                    });
                });
            },
            // 删除任务
            deleteTask(id) {
                this.selected_taskId = id;
                this.$confirm(this.$t('crm.Html.modal_deleteTaskContent'), this.$t('crm.Html.delete'), {
                    okButtonText: this.$t('crm.Html.modal_ok'),
                    cancelButtonText: this.$t('crm.Html.modal_cancel')
                }).then(() => {
                    crmCommon.taskDelete({
                        id: this.selected_taskId,
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
            // 删除完成后执行的动作, taskModals 里也有调用
            deleteFinished() {
                // 从 taskList 中去除被删除任务
                this.taskList = this.taskList.filter(item => item.id !== this.selected_taskId);
                if (this.taskList.length === 0) {
                    this.getTask();
                }
            },
            // 操作完成后调用此方法刷新表格数据
            updateList() {
                // 设想的是在编辑/删除完毕后, 请求 id 对应的宣判数据, 已删除则从 taskList 中去掉, 否则更新数据
            }
        },
        watch: {
            id: {
                handler(val) {
                    this.taskList = [];
                    this.noMore = false;
                    if (val) {
                        this.getTask();
                    }
                },
                immediate: true
            },
            flag_update_task: {
                handler() {
                    this.noMore = false;
                    this.getTask();
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .taskList {
        display: flex;
        flex-direction: column;

        .taskList-operate-newTask {
            text-align: right;
            // margin: 0 30px 0 10px;
            line-height: 20px;
            margin-top: 8px;

            button {
                font-size: 12px;
                color: #3B78DE;
                line-height: 18px;
            }
        }

        .taskList-container {
            overflow-y: auto;
            flex: 1;
        }
    }
</style>
