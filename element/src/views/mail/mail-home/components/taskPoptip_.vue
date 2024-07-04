<template>
        <Poptip
            ref="taskPoptip"
            :popper-options="{
                boundariesElement: 'body'
            }"
            v-model="taskPoptipVisible"
            :prevTarget="prevTarget"
            :key="popperFlag"
            transfer
            @show="show"
            @hide="hide"
            placement="top"
            >
            <span slot="reference">
                <Icon size="14"
                      custom="custom custom-date-input-select">
                </Icon>
                <span v-if="fromModule === 'writeMail'">{{$t('message.taskTip')}}</span>
            </span>
            <div class="task-poptip-content">
                <div class="task-poptip-content-title">
                    <span>{{$t('crm.Modal.title_newTask')}}</span>
                    <Icon size="16"
                        @click="showTaskModal"
                        style="cursor: pointer;"
                        custom="custom custom-fangda2">
                    </Icon>
                </div>
                <Form :model="taskForm"
                    label-width="120px"
                    ref="taskForm">
                    <FormItem class="el-form-item" :label="$t('crm.Modal.task_remindTime')">
                        <Select v-model="taskForm.taskDay">
                            <Option
                                    v-for="item in taskDayList"
                                    :value="item.value"
                                    :key="item.value"
                                    :label="item.label">
                            </Option>
                        </Select>
                        <FormItem style="margin-bottom: 0px">
                            <Checkbox v-model="taskForm.replyStatus">
                                {{ taskForm.replyStatus ? $t('mail.writeLetter.mailTaskCheckBoxTrue') : $t('mail.writeLetter.mailTaskCheckBoxFalse') }}
                            </Checkbox>
                        </FormItem>
                    </FormItem>
                    <FormItem :label="$t('crm.Modal.task_endTime')" v-if="taskForm.taskDay === -1">
                        <DatePicker
                                v-model="taskForm.taskTime"
                                :editable="false"
                                type="datetime"
                                placeholder="Select date and time">
                        </DatePicker>
                    </FormItem>
                </Form>
            </div>
        </Poptip>
        <!-- <TaskModal
            :visible.sync="modalShow"
            :type="modalType"
            :fromModule="fromModule"></TaskModal> -->
</template>
<script>
    import util from '@/libs/util.js';
    import { mapState } from 'vuex';
    import TaskModal from '@/views/crm/Detail/Components/Modal/taskModals';

    export default {
        name: 'task-poptip',
        components: {
            TaskModal
        },
        props: ['params', 'fromModule', 'taskPoptipVisible', 'prevTarget', 'popperFlag'],
        data() {
            return {
                popperOptions: {
                    boundariesElement: 'body',
                    positionFixed: true,
                    adaptive: false
                },
                taskForm: {
                    taskDay: 1,
                    taskTime: '',
                    replyStatus: true
                },
                taskDayList: [
                    { label: this.$t('crm.Html.oneDayLater'), value: 1 },
                    { label: this.$t('crm.Html.twoDaysLater'), value: 2 },
                    { label: this.$t('crm.Html.threeDaysLater'), value: 3 },
                    { label: this.$t('crm.Html.fourDaysLater'), value: 4 },
                    { label: this.$t('crm.Html.fiveDaysLater'), value: 5 },
                    { label: this.$t('crm.Html.custom'), value: -1 }
                ],
                // TaskModal相关
                taskModalData: {
                    taskEndTime: ''
                },
                modalShow: false,
                modalType: 'newTask' // showTask（详情）、newTask（新建）、editTask（编辑）
            };
        },
        computed: {
            ...mapState({
                orgId: state => state.enterpriseId,
                userId: state => state.userId,
                currentPersonId: state => state.mail.currentPersonId,
                currentAccount: state => state.mail.currentAccount
            })
        },
        watch: {
            'taskForm.taskDay': {
                handler(val) {
                    this.$nextTick(() => {
                        this.$refs.taskPoptip.updatePopper();
                    });
                }
            }
        },
        methods: {
            showTaskModal() {
                const params = {};
                const myDate = new Date();
                const taskEndTime = this.taskForm.taskDay === -1 ? this.taskForm.taskTime : new Date(myDate.setDate(myDate.getDate() + this.taskForm.taskDay)).setHours(10, 0, 0, 0);
                this.taskModalData.taskEndTime = taskEndTime;
                this.modalShow = true;
                params.modalType = this.modalType;
                params.fromModule = this.fromModule;
                params.taskModalData = this.taskModalData;
                console.log(this.taskModalData.taskEndTime);
                this.$emit('handleTaskModal', params);
            },
            show() {
                this.$refs.taskPoptip.cleanup();
                console.log(this.$refs.taskPoptip);
            },
            hide() {
            },
            getStandardEmail(emailAdd) {
                if (emailAdd && emailAdd.lastIndexOf('<') !== -1) {
                    const startIndex = emailAdd.lastIndexOf('<');
                    const endIndex = emailAdd.lastIndexOf('>');
                    return emailAdd.slice(startIndex + 1, endIndex);
                } else {
                    return emailAdd;
                }
            }
        }
    };
</script>
<style lang="less" scoped>
    .task-poptip {
        display: inline-block;
        margin-right: 12px;
        font-size: 12px;
        cursor: pointer;
    }
    .task-poptip-content {
        min-width: 330px;
        .task-poptip-content-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            line-height: 24px;
            font-size: 16px;
        }
        .el-form-item {
            margin-bottom: 15px;
        }
    }
</style>
