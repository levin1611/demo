<template>
    <div class="task-poptip" :class="{'writeMail-task-poptip' : fromModule === 'writeMail'}" :title="fromModule === 'writeMail' ? '' : $t('message.taskTip')">
        <Poptip
            ref="taskPoptip"
            trigger="click"
            popper-class="taskPoptip"
            transfer
            @show="show"
            placement="top"
            :tabindex="10">
            <span slot="reference">
                <Icon v-if="fromModule === 'writeMail' && (params.setTaskFlag === 1 || taskData)"
                      custom="custom custom-write_mail_task_s piwik_writeMail_taskPoptip_show">
                </Icon>
                <Icon v-else-if="fromModule === 'writeMail' && !taskData"
                      custom="custom custom-write_mail_task_n ">
                </Icon>
                <Icon v-else-if="fromModule !== 'writeMail' && params.setTaskFlag === 1"
                      custom="custom custom-mail_list_state_task_s piwik_taskPoptip_show">
                </Icon>
                <Icon v-else-if="fromModule !== 'writeMail' && [0, 2].includes(params.setTaskFlag)"
                      custom="custom custom-mail_list_state_task_n custom-renwutixing">
                </Icon>
                <span v-if="fromModule === 'writeMail'" style="color:rgba(0, 0, 0, 0.8)">{{$t('message.taskTip')}}</span>
            </span>
            <div class="task-poptip-content" v-if="initIng">
                <div class="task-poptip-content-title">
                    <span>{{$t('message.taskTip')}}</span>
                    <Icon size="16"
                        @click="showTaskModal"
                        style="cursor: pointer;"
                        :class="showTaskModalPiwik"
                        custom="custom custom-fangda2">
                    </Icon>
                </div>
                <!-- <div v-if="[0, 2].includes(params.setTaskFlag) || !taskData"> -->
                <div v-if="!taskData">
                    <Form :model="taskForm"
                        label-width="92px"
                        label-position="left"
                        ref="taskForm">
                        <FormItem class="el-form-item" :label="$t('mail.task.deadline')">
                            <Select v-model="taskForm.taskDay">
                                <Option
                                        v-for="item in taskDayList"
                                        :value="item.value"
                                        :key="item.value"
                                        :label="item.label">
                                </Option>
                            </Select>
                            <div v-if="taskForm.taskDay === -1" style="margin-top: 8px">
                                <DatePicker
                                    ref="taskTime"
                                    v-model="taskForm.taskTime"
                                    :editable="false"
                                    type="datetime"
                                    :placeholder="$t('filter_box.select_time')">
                                </DatePicker>
                            </div>
                        </FormItem>
                         <div class="el-form-item">
                            <Checkbox v-model="taskForm.mailReplyRemindFlag">
                                {{$t('mail.writeLetter.mailTaskCheckBoxTrue')}}
                            </Checkbox>
                        </div>
                    </Form>
                    <div class="footer" style="text-align: right;">
                        <Button type="success" @click="ok" style="line-height:10px" :class="taskPoptipOkPiwik">{{ $t('confirm') }}</Button>
                    </div>
                </div>
                <div v-else>
                    <p class="task-show-list">
                        <span class="task-show-list-title">{{$t('mail.task.taskName')}}:</span>
                        <span class="task-show-list-content">{{taskData.taskName}}</span>
                    </p>
                    <p class="task-show-list">
                        <span class="task-show-list-title">{{$t('crm.Modal.task_endTime')}}:</span>
                        <span class="task-show-list-content">{{ taskData.taskEndTime | timeFormat('yyyy-MM-dd hh:mm:ss')}}</span>
                    </p>
                    <p class="task-show-list">
                        <span class="task-show-list-title">{{$t('crm.Modal.task_remindTime')}}:</span>
                        <span class="task-show-list-content">{{ taskData.remindTimeValue === -1 || taskData.remindType=== 1
                            ? $t('crm.Modal.noRemind') : taskData.remindTimeValue === 0
                            ? $t('crm.Modal.onTimeToRemind') : taskData.remindTimeValue === 5
                            ? $t('crm.Modal.fiveMinutesInAdvance') : taskData.remindTimeValue === 15
                            ? $t('crm.Modal.fifteenMinutesInAdvance') : taskData.remindTimeValue === 30
                            ? $t('crm.Modal.thirtyMinutesInAdvance') : taskData.remindTimeValue === 60
                            ? $t('crm.Modal.oneHoursInAdvance') : taskData.remindTimeValue === 120
                            ? $t('crm.Modal.towHoursInAdvance') : taskData.remindTimeValue === 1440 || taskData.remindTimeUnit === 3
                            ? $t('crm.Modal.oneDayInAdvance') : $t('crm.Modal.errorOccurred')}}</span>
                    </p>
                    <p class="task-show-list">
                        <Checkbox v-model="taskData.mailReplyRemindFlag" disabled>
                            {{$t('mail.writeLetter.mailTaskCheckBoxTrue')}}
                        </Checkbox>
                    </p>
                    <div class="footer" style="text-align: right; color:rgba(59, 120, 222, 1);">
                        <span v-if="fromModule === 'writeMail'" class="piwik_writeMail_taskPoptip_cancleTask" @click="removeConfirm">{{ $t('crm.Modal.cancleTask') }}</span>
                        <span v-else class="piwik_taskPoptip_cancleTask" @click="removeConfirm">{{ $t('crm.Modal.modal_deleteTask') }}</span>
                        <span :class="fromModule === 'writeMail' ? 'piwik_writeMail_taskPoptip_editTask' : 'piwik_taskPoptip_editTask'" @click="edit">{{ $t('crm.Modal.operate_edit') }}</span>
                        <span class="piwik_taskPoptip_sign" @click="sign" v-if="fromModule !== 'writeMail'">{{ $t('crm.Modal.modal_taskStatusToFinished') }}</span>
                    </div>
                </div>
            </div>
        </Poptip>
        <Modal :title="$t('crm.Modal.modal_deleteTask')"
            v-if="show_deleteTask"
            :visible.sync="visible_deleteTask"
            width="520px"
            :show-close="false"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            :append-to-body="true"
            :modal-append-to-body="false">
            <div>{{ $t('crm.Modal.modal_deleteTaskContent') }}</div>
            <div slot="footer">
                <Button @click="visible_deleteTask = false">{{$t('cancel')}}</Button>
                <Button type="primary" @click="remove">{{$t('confirm')}}</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import { crmCommon } from '@/api/crm/index';
    import mailCommon from '@/api/mail/common.js';
    import { mapState } from 'vuex';
    export default {
        name: 'task-poptip',
        components: {
        },
        props: ['params', 'fromModule', 'taskObj'],
        data() {
            return {
                initIng: false,
                loading: false,
                show_deleteTask: false,
                visible_deleteTask: false,
                taskData: null,
                taskForm: {
                    taskDay: 1,
                    taskTime: '',
                    mailReplyRemindFlag: true
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
                    relatObjType: 2,
                    taskName: '邮件跟进任务',
                    taskEndTime: '',
                    remindType: 2,
                    remindTimeValue: 0
                },
                modalShow: false,
                modalType: 'newTask' // showTask（详情）、newTask（新建）、editTask（编辑）
            };
        },
        computed: {
            ...mapState({
                orgId: state => state.enterpriseId,
                userId: state => state.userId,
                fullName: state => state.fullName
            }),
            // piwik 埋点相关
            showTaskModalPiwik() {
                return this.fromModule === 'writeMail' ? (this.taskData ? 'piwik_writeMail_TaskModal_show' : 'piwik_writeMail_TaskModal_add_show') : this.taskData ? 'piwik_TaskModal_show' : 'piwik_TaskModal_add_show';
            },
            taskPoptipOkPiwik() {
                return this.fromModule === 'writeMail' ? 'piwik_writeMail_taskPoptip_ok' : 'piwik_taskPoptip_ok';
            }
        },
        watch: {
            'taskForm.taskDay': {
                handler(val) {
                    localStorage.setItem('taskDay', val);
                    this.$nextTick(() => {
                        this.$refs.taskPoptip.updatePopper();
                        if (val === -1) {
                            const myDate = new Date();
                            this.taskForm.taskTime = new Date(myDate.setDate(myDate.getDate() + 6)).setHours(10, 0, 0, 0);
                        }
                    });
                }
            },
            taskObj: {
                handler(val) {
                    if (val) {
                        this.taskData = Object.assign({}, val);
                        this.taskData.mailReplyRemindFlag = !!this.taskData.mailReplyRemindFlag;
                        this.$nextTick(() => {
                            this.$refs.taskPoptip.updatePopper();
                        });
                    } else {
                        this.taskData = null;
                    }
                },
                deep: true,
                immediate: true
            }
        },
        methods: {
            showTaskModal() {
                if (!this.taskData) {
                    const params = {};
                    const myDate = new Date();
                    const taskEndTime = this.taskForm.taskDay === -1 ? this.taskForm.taskTime : new Date(myDate.setDate(myDate.getDate() + this.taskForm.taskDay)).setHours(10, 0, 0, 0);
                    this.taskModalData.taskEndTime = taskEndTime;
                    this.taskModalData.relatObjType = 2;
                    this.taskModalData.relatObjId = this.params.id;
                    this.taskModalData.mailReplyRemindFlag = this.taskForm.mailReplyRemindFlag ? 1 : 0;
                    this.taskModalData.relatObjDescription = { mailSubject: this.params.theme || this.params.subject, mailId: this.params.id, mailBoxTypeId: this.params.mailBoxTypeId || 4, mailBoxTypeName: this.params.mailBoxTypeName, mailCreateUserId: this.params.createUserId || this.userId };
                    this.modalShow = true;
                    params.modalType = this.modalType;
                    params.fromModule = this.fromModule;
                    params.taskModalData = this.taskModalData;
                    this.$emit('handleTaskModal', params);
                    this.$refs.taskPoptip.doClose();
                } else {
                    const params = {};
                    params.modalType = 'showTask';
                    params.fromModule = this.fromModule;
                    params.taskModalData = this.taskData;
                    this.$emit('handleTaskModal', params);
                }
            },
            show() {
                // this.params.id && ![0, 2].includes(this.params.setTaskFlag)
                if (this.params.id && ![0, 2].includes(this.params.setTaskFlag)) {
                    this.loading = true;
                    mailCommon.getMailTask({
                        orgId: this.orgId,
                        mailId: this.params.id,
                        userId: this.userId
                    }).then(response => {
                        this.loading = false;
                        this.initIng = true;
                        this.$nextTick(() => {
                            if (response.code === '1' && response.data.length) {
                                this.taskData = response.data[0];
                                this.taskData.mailReplyRemindFlag = Boolean(this.taskData.mailReplyRemindFlag);
                            } else {
                                const taskDay = Number(localStorage.getItem('taskDay')) || 1;
                                this.$set(this.taskForm, 'taskDay', taskDay);
                                this.taskData = null;
                            }
                            this.$nextTick(() => {
                                this.$refs.taskPoptip.updatePopper();
                            });
                        });
                    });
                } else {
                    if (!this.taskObj) {
                        this.taskData = null;
                        const taskDay = Number(localStorage.getItem('taskDay')) || 1;
                        this.$set(this.taskForm, 'taskDay', taskDay);
                        this.initIng = true;
                        this.loading = false;
                    }
                }
            },
            ok() {
                if (this.loading) {
                    this.$Message.error(this.$t('crm.Html.loading'));
                    return;
                }
                const myDate = new Date();
                const taskEndTime = this.taskForm.taskDay === -1 ? this.taskForm.taskTime : new Date(myDate.setDate(myDate.getDate() + this.taskForm.taskDay)).setHours(10, 0, 0, 0);
                if (!taskEndTime) {
                    this.$Message.error(this.$t('crm.Modal.error_taskEndTime'));
                    return;
                }
                const data = {
                    orgId: this.orgId,
                    taskName: this.taskModalData.taskName,
                    taskEndTime: this.$options.filters.timeFormat(taskEndTime, 'yyyy-MM-dd hh:mm:ss'),
                    taskScheduleTime: this.$options.filters.timeFormat(taskEndTime, 'yyyy-MM-dd hh:mm:ss'),
                    remindType: 2,
                    remindTimeValue: 0,
                    remindTimeUnit: 1,
                    repeatType: 1,
                    taskStatus: 1,
                    relatObjType: 2,
                    mailReplyRemindFlag: this.taskForm.mailReplyRemindFlag ? 1 : 0,
                    participantsJson: JSON.stringify([{ userId: this.userId, userName: this.fullName }]),
                    relatObjDescription: JSON.stringify({ mailSubject: this.params.theme || this.params.subject, mailId: this.params.id, mailBoxTypeId: this.params.mailBoxTypeId, mailBoxTypeName: this.params.mailBoxTypeName, mailCreateUserId: this.params.createUserId || this.userId })
                };
                if (this.fromModule === 'writeMail') {
                    // this.$refs.taskPoptip.doClose();
                    const taskData = this.taskData || {};
                    this.$emit('setTask', Object.assign(taskData, data));
                    this.$nextTick(() => {
                        this.$refs.taskPoptip.updatePopper();
                    });
                    return;
                }
                data.relatObjId = this.params.id;
                this.loading = true;
                crmCommon.taskSave(data).then(response => {
                    if (response.code === '1') {
                        this.$Message.success(this.$t('crm.Modal.success_newTask'));
                        this.$refs.taskPoptip.doClose();
                        this.$emit('refreshDataList', this.params.id);
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_newTask'));
                    }
                });
            },
            edit() {
                const params = {};
                params.modalType = 'editTask';
                params.fromModule = this.fromModule;
                params.taskModalData = Object.assign({}, this.taskData);
                this.$emit('handleTaskModal', params);
                this.$refs.taskPoptip.doClose();
            },
            // 标记已完成
            sign() {
                if (this.loading) return;
                this.loading = true;
                let temp = 0;
                switch (this.taskData.taskStatus) {
                    case 1:
                        temp = 2;
                        break;
                    case 2:
                        temp = 1;
                }
                crmCommon.updateTaskStatus({
                    id: this.taskData.id,
                    taskStatus: temp
                }).then(response => {
                    if (response.code === '1' && response.data) {
                        this.$Message.success(this.$t('crm.Modal.success_changeTaskStatus'));
                        this.taskData.taskStatus = temp;
                        this.$refs.taskPoptip.doClose();
                        this.$emit('refreshDataList', this.params.id);
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_changeTaskStatus'));
                    }
                });
            },
            // 删除确认框
            removeConfirm() {
                this.show_deleteTask = true;
                this.$nextTick(() => {
                    this.visible_deleteTask = true;
                });
            },
            // 删除任务
            remove() {
                if (this.fromModule === 'writeMail' && !this.params.id) {
                    this.$emit('setTask', null);
                    this.visible_deleteTask = false;
                    this.$refs.taskPoptip.doClose();
                    this.show_deleteTask = false;
                    return;
                }
                if (this.loading) {
                    this.$Message.error(this.$t('crm.Html.loading'));
                    return;
                }
                this.visible_deleteTask = false;
                this.loading = true;
                crmCommon.taskDelete({
                    orgId: this.orgId,
                    id: this.taskData.id
                }).then(response => {
                    this.show_deleteTask = false;
                    if (response.code === '1' && response.data) {
                        this.$Message.success(this.$t('crm.Modal.success_deleteTask'));
                        this.$store.commit('setTaskChangeObj', {
                            id: this.taskData.id,
                            type: 'delete'
                        });
                        this.$refs.taskPoptip.doClose();
                        this.$emit('refreshDataList', this.params.id);
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_deleteTask'));
                    }
                });
            }
        }
    };
</script>
<style lang="less">
    .task-poptip {
        display: inline-block;
        font-size: 12px;
        line-height: 16px;
        cursor: pointer;
        user-select: none;
    }
    .writeMail-task-poptip {
        margin-right: 20px;
    }
    .taskPoptip{
        padding: 16px;
    }
    .task-poptip-content {
        width: 370px;
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
            .el-form-item__label {
                color: rgba(0, 0, 0, 0.8);
            }
            .el-select, .el-input {
                width: 200px;
            }
        }
        .task-show-list {
            line-height: 18px;
            margin-bottom: 12px;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.8);
            .task-show-list-title {
                margin-right:8px;
                color: rgba(0, 0, 0, 0.6);
            }
            .el-checkbox__input.is-disabled .el-checkbox__inner{
                background-color: #FFFFFF;
                border-color: #DCDFE6;
                color: inherit;
            }
            .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner{
                background-color: #4285F2;
                border-color: #4285F2;
                color: inherit;
            }
            .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after{
                border-color: #ffffff;
            }
        }
        .el-checkbox__label,.el-checkbox__input.is-disabled + .el-checkbox__label{
            white-space: break-spaces;
            padding-right: 24px;
            color: rgba(0, 0, 0, 0.6);
        }
    }
    .custom-mail_list_state_task_n{
        font-size: 16px;
        color: rgb(102, 102, 102);
    }
    .custom-mail_list_state_task_n:hover{
        color: #4285F2;
    }
    .custom-mail_list_state_task_s{
        content: ' ';
        display: inline-block;
        width: 16px;
        height: 16px;
        background: url('../images/mail_list_state_task_s.png') no-repeat center center;
        background-size: 100%;
        vertical-align: top;
    }
    .custom-write_mail_task_n{
        content: ' ';
        display: inline-block;
        width: 14px;
        height: 14px;
        margin-right: 8px;
        background: url('../images/write_mail_task_n.png') no-repeat center center;
        background-size: 100%;
        vertical-align: top;
    }
    .custom-write_mail_task_n:hover{
        content: ' ';
        display: inline-block;
        width: 14px;
        height: 14px;
        margin-right: 8px;
        background: url('../images/write_mail_task_s.png') no-repeat center center;
        background-size: 100%;
        vertical-align: top;
    }
    .custom-write_mail_task_s{
        content: ' ';
        display: inline-block;
        width: 14px;
        height: 14px;
        margin-right: 8px;
        background: url('../images/write_mail_task_s.png') no-repeat center center;
        background-size: 100%;
        vertical-align: top;
    }
    .footer {
        & > span {
            font-size: 12px;
            color: #3B78DE;
            margin-left: 10px;
            cursor: pointer;
        }
    }
</style>
