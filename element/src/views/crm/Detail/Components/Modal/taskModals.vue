<template>
    <div>
        <Modal :visible="Object.values(modalShow).some(i => i)"
               :title="modalShow.newTask ? $t('crm.Modal.title_newTask') : modalShow.editTask ? $t('crm.Modal.title_editTask') : modalShow.showTask ? $t('crm.Modal.title_showTask') : ''"
               width="500px"
               :show-close="true"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :append-to-body="true"
               :modal-append-to-body="false"
               @close="cancel"
               class="taskModal vertical-center-modal">
            <!-- loading -->
            <Spin fix v-if="loading || getCompanyNameLoading"></Spin>
            <template v-if="modalShow.newTask || modalShow.editTask">
                <Form class="new-or-edit" label-position="left" label-width="80px">
                    <FormItem :label="$t('crm.Modal.task_name') + ':'"
                              class="required-formItem">
                        <Input v-model="taskObj.taskName"></Input>
                    </FormItem>
                    <FormItem :label="$t('crm.Modal.task_participants') + ':'"
                              class="required-formItem task-participants">
                              <Select style="width: 100%;" v-model="taskObj.participants" multiple filterable>
                                    <Option v-for="(sale, i) in allSalesList" :label="sale.fullname" :value="sale.id" :key="i"></Option>
                               </Select>
                    </FormItem>
                    <FormItem :label="$t('crm.Modal.relationObj') + ':'">

                        <Select v-model="taskObj.relatObjType" :disabled="['writeMail', 'mailTableList', 'mailDetail'].includes(this.fromModule) || (fromInquiry !== undefined && type == 'editTask')">
                            <Option v-if="!(fromInquiry !== undefined)" :value="2" :label="$t('crm.Modal.emailObject')"></Option>
                            <Option :value="1" :label="$t('crm.Modal.clueObject')"></Option>
                        </Select>
                    </FormItem>
                    <FormItem v-if="taskObj.relatObjType == 1" :label="$t('crm.Modal.task_relatedInquiry') + ':'">
                        <Cascader v-model="casVal"
                                  :options="casData"
                                  :disabled="(fromInquiry !== undefined && type == 'editTask')"
                                  :props="{ lazy: true, lazyLoad: inquiryData }"
                                  :filterable="true"
                                  clearable
                                  :before-filter="casDataSearch"
                                  :placeholder="$t('crm.Modal.tip_searchCompanyName')"
                                  ref="casInq"
                                  @change="casChange"></Cascader>
                    </FormItem>
                    <FormItem v-if="taskObj.relatObjType == 2" :label="$t('crm.Modal.task_relatedEmail') + ':'">
                        <AutoComplete :disabled="['writeMail', 'mailTableList', 'mailDetail'].includes(this.fromModule) || (fromInquiry !== undefined && type == 'editTask')"
                                        v-model.trim="taskObj.taskRelatedEmailShowTest"
                                        type="text"
                                        :readonly='readonly'
                                        style="width:230px;display:inline-block;"
                                        :placeholder="$t('crm.Modal.tip_relatedEmail')"
                                        @blur="valideClueBlur()"
                                        @clear="taskObj.taskRelatedEmailShowTest != '' ? taskObj.taskRelatedEmailShowTest = '' : null"
                                        :showWordLimit="true"
                                        :showErrorMsg="true"
                                        :clearable="false"
                                        :errorMessage="$t('enterClue.upperLimitTip')"
                                        maxLen="200"
                                        :fetch-suggestions="searchBusinessCompanyData"
                                        @select="handleSelectCompany"
                                    >
                                        <template slot-scope="{ item }">
                                            <Tooltip trigger="hover" :open-delay="500" placement="top" transfer :content="item.value" max-width="200">
                                                <div style="width: 100%;overflow:hidden; white-space: nowrap;text-overflow: ellipsis;">
                                                    {{item.data.mailBoxTypeName}} {{ item.value }}
                                                </div>
                                            </Tooltip>
                                        </template>
                                    </AutoComplete>
                    </FormItem>
                    <FormItem :label="$t('crm.Modal.task_endTime') + ':'"
                              class="required-formItem">
                        <DatePicker v-model="taskObj.taskEndTime"
                                    type="datetime"></DatePicker>
                    </FormItem>
                    <FormItem :label="$t('crm.Modal.task_remindTime') + ':'">
                        <Select v-model="taskObj.remindTimeValue">
                            <Option :value="-1" :label="$t('crm.Modal.noRemind')"></Option>
                            <Option :value="0" :label="$t('crm.Modal.onTimeToRemind')"></Option>
                            <Option :value="5" :label="$t('crm.Modal.fiveMinutesInAdvance')"></Option>
                            <Option :value="15" :label="$t('crm.Modal.fifteenMinutesInAdvance')"></Option>
                            <Option :value="30" :label="$t('crm.Modal.thirtyMinutesInAdvance')"></Option>
                            <Option :value="60" :label="$t('crm.Modal.oneHoursInAdvance')"></Option>
                            <Option :value="120" :label="$t('crm.Modal.towHoursInAdvance')"></Option>
                            <Option :value="1440" :label="$t('crm.Modal.oneDayInAdvance')"></Option>
                        </Select>
                        <div  v-if="taskObj.relatObjType == 2" style="line-height: 20px;margin: 10px 0 0;font-size: 12px;">
                            <Checkbox v-model="taskObj.remindRegValue"></Checkbox>
                            {{$t('crm.Modal.remindTips')}}
                        </div>
                    </FormItem>
                    <FormItem :label="$t('crm.Modal.task_repeat') + ':'">
                        <Select v-model="taskObj.repeat.type">
                            <Option value="none" :label="$t('crm.Modal.noRepeat')"></Option>
                            <Option value="day" :label="$t('crm.Modal.daily')"></Option>
                            <Option value="week" :label="$t('crm.Modal.weekly')"></Option>
                            <Option value="month" :label="$t('crm.Modal.monthly')"></Option>
                        </Select>
                    </FormItem>
                    <FormItem v-if="taskObj.repeat.type === 'week'" :label="$t('crm.Modal.task_repeatTime') + ':'">
                        <CheckboxGroup v-model="taskObj.repeat.weekDays">
                            <Checkbox :label="'1'">{{ $t('crm.Modal.Sunday') }}</Checkbox>
                            <Checkbox :label="'2'">{{ $t('crm.Modal.Monday') }}</Checkbox>
                            <Checkbox :label="'3'">{{ $t('crm.Modal.Tuesday') }}</Checkbox>
                            <Checkbox :label="'4'">{{ $t('crm.Modal.Wednesday') }}</Checkbox>
                            <Checkbox :label="'5'">{{ $t('crm.Modal.Thursday') }}</Checkbox>
                            <Checkbox :label="'6'">{{ $t('crm.Modal.Friday') }}</Checkbox>
                            <Checkbox :label="'7'">{{ $t('crm.Modal.Saturday') }}</Checkbox>
                        </CheckboxGroup>
                    </FormItem>
                    <FormItem v-if="taskObj.repeat.type === 'month'" :label="$t('crm.Modal.task_repeatTime')">
                        <Select v-model="taskObj.repeat.monthDay" :placeholder="$t('crm.Modal.tip_ifDaysLessThan31')">
                            <Option v-for="n in 31" :value="n" :label="n"></Option>
                        </Select>
                    </FormItem>
                    <FormItem v-if="taskObj.repeat.type !== 'none'" :label="$t('crm.Modal.task_endCondition')">
                        <Row>
                            <Col :span="10">
                                <Select v-model="taskObj.repeat.endCon">
                                    <Option value="none" :label="$t('crm.Modal.neverEnd')"></Option>
                                    <Option value="date" :label="$t('crm.Modal.endDate')"></Option>
                                </Select>
                            </Col>
                            <Col :span="12" :offset="1" class="datepickerwidth">
                                <DatePicker v-model="taskObj.repeat.endConDate"
                                            :disabled="taskObj.repeat.endCon === 'none'"
                                            :picker-options="endConDateOpts"></DatePicker>
                            </Col>
                        </Row>
                    </FormItem>
                    <FormItem :label="$t('crm.Modal.task_detailDesc') + ':'">
                        <Input v-model="taskObj.taskDetails" type="textarea" :rows="5"
                               maxlength="2000"
                               show-word-limit></Input>
                    </FormItem>
                </Form>
                <div slot="footer">
                    <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                    <Button :class="`${class_edittask} ${class_savetask}`" type="primary" @click="ok">{{ $t('crm.Modal.modal_save') }}</Button>
                </div>
            </template>
            <template v-else-if="modalShow.showTask">
                <!--设计稿无编辑按钮-->
                <!--<div style="text-align: right;" v-if="!fromNotice">
                    <Button type="text" icon="edit" @click="edit" :style="{'color': '#FA8241'}">{{
                        $t('crm.Modal.operate_edit') }}
                    </Button>
                </div>-->
                <Form  class="show-box" label-position="left" label-width="80px">
                    <FormItem :label="$t('crm.Modal.task_name') + ':'">
                        {{ taskObj.taskName }}
                    </FormItem>
                    <FormItem class="task-participants-show more-text" :label="$t('crm.Modal.task_participants') + ':'">
                        <div style="line-height: 24px;">
                            <span v-for="(man, index) in taskObj.participantsJson" :key="index"><span v-if="index != 0">，</span>{{ man.userName }}</span>
                        </div>
                    </FormItem>
                    <FormItem class="more-text" v-if="taskObj.relatObjType == 1 || relatedInqDesc.companyName || relatedInqDesc.inquirySeqNumber" :label="$t('crm.Modal.relationObj') + ':'">
                        <span @click="jumpToCustomer"
                              class="related_inquiry_companyName">{{ relatedInqDesc.companyName }}</span>&nbsp;&nbsp;
                        <span @click="jumpToInquiry"
                              class="related_inquiry_inqNumber">{{ relatedInqDesc.inquirySeqNumber }}</span>&nbsp;&nbsp;
                    </FormItem>
                    <FormItem  class="more-text" v-if="taskObj.relatObjType == 2" :label="$t('crm.Modal.relationObj') + ':'">
                        <span @click="jumpToMail(taskObj.relatObjDescription)"
                              class="related_inquiry_companyName">{{ (!!taskObj.relatObjDescription && taskObj.relatObjDescription.mailBoxTypeName) ? taskObj.relatObjDescription.mailBoxTypeName + '' + taskObj.relatObjDescription.mailSubject : '' }}</span>
                    </FormItem>
                    <FormItem :label="$t('crm.Modal.task_endTime') + ':'">
                        {{ taskObj.taskEndTime && taskObj.taskEndTime.format('yyyy-MM-dd hh:mm:ss') }}
                    </FormItem>
                    <FormItem :label="$t('crm.Modal.task_remindTime') + ':'">
                        {{ taskObj.remindTimeValue === -1
                        ? $t('crm.Modal.noRemind') : taskObj.remindTimeValue === 0
                        ? $t('crm.Modal.onTimeToRemind') : taskObj.remindTimeValue === 5
                        ? $t('crm.Modal.fiveMinutesInAdvance') : taskObj.remindTimeValue === 15
                        ? $t('crm.Modal.fifteenMinutesInAdvance') : taskObj.remindTimeValue === 30
                        ? $t('crm.Modal.thirtyMinutesInAdvance') : taskObj.remindTimeValue === 60
                        ? $t('crm.Modal.oneHoursInAdvance') : taskObj.remindTimeValue === 120
                        ? $t('crm.Modal.towHoursInAdvance') : taskObj.remindTimeValue === 1440
                        ? $t('crm.Modal.oneDayInAdvance') : $t('crm.Modal.errorOccurred')}}
                    </FormItem>
                    <!-- <FormItem :label="$t('crm.Modal.task_relatedInquiry') + ':'">
                        <span @click="jumpToCustomer"
                              class="related_inquiry_companyName">{{ relatedInqDesc.companyName }}</span>&nbsp;&nbsp;
                        <span @click="jumpToInquiry"
                              class="related_inquiry_inqNumber">{{ relatedInqDesc.inquirySeqNumber }}</span>&nbsp;&nbsp;
                    </FormItem> -->
                    <FormItem :label="$t('crm.Modal.task_repeat') + ':'">{{ taskObj.repeat.type === 'none' ?
                        $t('crm.Modal.noRepeat') : taskObj.repeat.type === 'day' ?
                        $t('crm.Modal.daily') : taskObj.repeat.type === 'week' ? $t('crm.Modal.weekly') :
                        taskObj.repeat.type === 'month' ? $t('crm.Modal.monthly') : ''}}
                    </FormItem>
                    <FormItem v-if="taskObj.repeat.type === 'week'" :label="$t('crm.Modal.task_repeatTime') + ':'">
                        {{ taskObj.repeat.weekDays instanceof Array ? `${taskObj.repeat.weekDays.map(i =>
                        [$t('crm.Modal.Sunday'), $t('crm.Modal.Monday'), $t('crm.Modal.Tuesday'),
                        $t('crm.Modal.Wednesday'), $t('crm.Modal.Thursday'), $t('crm.Modal.Friday'),
                        $t('crm.Modal.Saturday')][i - 1]).join(',')}` : $t('crm.Modal.errorOccurred') }}
                    </FormItem>
                    <FormItem v-if="taskObj.repeat.type === 'month'" :label="$t('crm.Modal.task_repeatTime')">
                        {{ taskObj.repeat.monthDay ? taskObj.repeat.monthDay : $t('crm.Modal.errorOccurred') }}
                    </FormItem>
                    <FormItem v-if="taskObj.repeat.type !== 'none'" :label="$t('crm.Modal.task_endCondition')">
                        <Row>
                            <Col :span="10">{{ taskObj.repeat.endCon === 'none' ? $t('crm.Modal.neverEnd') :
                                taskObj.repeat.endCon ===
                                'date' ? $t('crm.Modal.endDate') : $t('crm.Modal.errorOccurred')}}
                            </Col>
                            <Col :span="12" :offset="2" v-if="taskObj.repeat.endCon === 'date'">{{
                                taskObj.repeat.endConDate.format('yyyy-MM-dd hh:mm:ss') }}
                            </Col>
                        </Row>
                    </FormItem>
                    <FormItem :label="$t('crm.Modal.task_detailDesc') + ':'">{{ taskObj.taskDetails }}</FormItem>
                    <FormItem  v-if="taskObj.createTime" :label="$t('crm.Modal.task_createTime') + ':'">
                        <pre>{{ taskObj.createTime && taskObj.createTime.format('yyyy-MM-dd hh:mm:ss') }}</pre>
                    </FormItem>
                </Form>
                <div slot="footer" v-if="!fromNotice">
                    <!-- <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button> -->
                    <Button style="margin-right: 10px" v-if="unclaimedStatus !== 1" @click="edit" :class="{'highSeas-manage-hide' : disabled}">{{ $t('crm.Modal.operate_edit') }}</Button>
                    <span v-if="unclaimedStatus !== 1  && fromModule !=='writeMail'" @click="removeConfirm" :class="{'highSeas-manage-hide' : disabled, 'removeConfirm-btn' : true}">{{ $t('crm.Modal.modal_delete') }}</span>
                    <Button v-if="unclaimedStatus !== 1 && fromModule !=='writeMail'" type="primary" @click="sign" :class="class_tasktaghasbeencompleted">{{ taskObj.taskStatus  
                        === 1 ? $t('crm.Modal.modal_taskStatusToFinished') : taskObj.taskStatus === 2 ?
                        $t('crm.Modal.modal_taskStatusToUnfinished') : '' }}
                    </Button>
                </div>
            </template>
        </Modal>

        <Modal :title="$t('crm.Modal.modal_deleteTask')"
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
                <Button type="primary" :class="class_deletetask" @click="remove">{{$t('confirm')}}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import { crmCommon, crmCompany } from '@/api/crm/index';
    import util from '@/libs/util';

    export default {
        name: 'taskModals',
        props: [
            'type',
            'taskObjProp',
            'fromInquiry',
            'visible',
            'refreshMethodName',
            'fromNotice',
            'fromModule',
            'disabled'
        ],
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                button_list: state => state.app.button_list,
                allUsers: state => state.crm.allUsers, // 全部用户
                departmentPeople: state => state.mail.departmentPeople //邮件下属人员 任务提醒与 系统消息提醒 跳转时用到
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            class_tasktaghasbeencompleted() {
                // return this.fromModule === 'workBench' ? 'workbench-tasktaghasbeencompleted' : '';
                return {
                    'highSeas-manage-hide': this.disabled,
                    'workbench-tasktaghasbeencompleted': this.fromModule === 'workBench',
                    'dashBoard-tasktaghasbeencompleted': this.fromModule === 'dashBoard',
                    'piwik_mail_tasktaghasbeencompleted': ['mailTableList', 'mailDetail'].includes(this.fromModule),
                    'cardTaskList-tasktaghasbeencompleted': this.fromModule === 'cardTaskList'
                };
            },
            class_edittask() {
                switch (this.fromModule) {
                    case 'workBench':
                        return this.modalShow.editTask ? 'workbench-editingtask' : '';
                    case 'dashBoard':
                        return this.modalShow.editTask ? 'dashBoard-editingtask' : '';
                    case 'companyDetail':
                        return this.modalShow.editTask ? 'piwik_companyDetail_editTask' : '';
                    case 'inquiryDetail':
                        return this.modalShow.editTask ? 'piwik_inquiryDetail_editTask' : '';
                    case 'mailTableList':
                    case 'mailDetail':
                        return this.modalShow.newTask ? 'piwik_taskPoptip_editTask' : '';
                     case 'writeMail':
                        return this.modalShow.editTask ? 'piwik_writeMail_taskPoptip_editTask' : '';
                     case 'cardTaskList':
                        return this.modalShow.editTask ? 'piwik_cardTaskList_editTask' : '';
                    default:
                        return '';
                }
            },
            class_savetask() {
                switch (this.fromModule) {
                    case 'workBench':
                        return this.modalShow.newTask ? 'workbench-savetask' : '';
                    case 'dashBoard':
                        return this.modalShow.newTask ? 'dashBoard-savetask' : '';
                    case 'companyDetail':
                        return this.modalShow.newTask ? 'piwik_companyDetail_saveTask' : '';
                    case 'inquiryDetail':
                        return this.modalShow.newTask ? 'piwik_inquiryDetail_saveTask' : '';
                    case 'mailTableList':
                    case 'mailDetail':
                        return this.modalShow.newTask ? 'piwik_mail_saveTask' : '';
                    case 'writeMail':
                        return this.modalShow.newTask ? 'piwik_writeMail_mail_saveTask' : '';
                    case 'cardTaskList':
                        return this.modalShow.newTask ? 'piwik_cardTaskList_saveTask' : '';
                    default:
                        return '';
                }
            },
            class_deletetask() {
                // return this.fromModule === 'workBench' ? 'workbench-deletetask' : '';
                return {
                    'highSeas-manage-hide': this.disabled,
                    'workbench-deletetask': this.fromModule === 'workBench',
                    'dashBoard-deletetask': this.fromModule === 'dashBoard',
                    'piwik_companyDetail_deleteTask': this.fromModule === 'companyDetail',
                    'cardTaskList-deletetask': this.fromModule === 'cardTaskList'
                };
            }
        },
        data() {
            return {
                /* 全局 */
                modalShow: {
                    newTask: false,
                    editTask: false,
                    showTask: false
                },
                loading: false,
                getCompanyNameLoading: false,
                taskObj: {
                    id: undefined,
                    taskName: '',
                    taskEndTime: '',
                    remindTimeValue: 0,
                    participants: [],
                    relatedInq: [],
                    repeat: {
                        type: 'none', // 重复类型
                        endCon: 'none', // 结束条件选择
                        endConDate: '', // 结束选项
                        weekDays: [], // 每周重复时间
                        monthDay: undefined // 每月重复时间
                    },
                    taskDetails: '',
                    taskStatus: 1,
                    relatObjType: '',
                    remindRegValue: false,
                    relatObjDescription: {},
                    taskRelatedEmail: '',
                    taskRelatedEmailShowTest: ''
                },
                relatedInqDesc: {
                    companyName: undefined,
                    companyId: undefined,
                    inquiryId: undefined,
                    inquirySeqNumber: undefined
                },
                casVal: [],

                // 新建 + 编辑
                endConDateOpts: {
                    disabledDate(date) {
                        return date.getTime() < Date.now();
                    }
                },
                allSalesList: [],
                relatedInqData: [],
                casData: [],
                // 详情

                // 删除
                visible_deleteTask: false,
                unclaimedStatus: '',
                readonly: false,
                selectEmail: {},
                /* 全局 */
                cancelFunc: null
            };
        },
        methods: {
            // 新建 + 编辑
            verify() {
                const temp = Object.assign({}, this.taskObj);
                if (typeof temp.taskName !== 'string' || !temp.taskName.length || !temp.taskName.trim().length) {
                    this.$Message.error(this.$t('crm.Modal.error_taskName'));
                    return false;
                }
                if (temp.taskEndTime instanceof Date === false) {
                    this.$Message.error(this.$t('crm.Modal.error_taskEndTime'));
                    return false;
                }
                if (![-1, 0, 5, 15, 30, 60, 120, 1440].includes(temp.remindTimeValue)) {
                    this.$Message.error(this.$t('crm.Modal.error_taskRemindTime'));
                    return false;
                }
                if (temp.participants.length === 0) {
                    this.$Message.error(this.$t('crm.Modal.error_emptyTaskParticipants'));
                    return false;
                }
                if (temp.participants.indexOf(this.userId - 0) === -1 && temp.participants.indexOf(this.userId) === -1) {
                    this.$Message.info(this.$t('crm.Modal.error_taskParticipantsWithoutSelf'));
                    return false;
                }
                if (temp.relatObjType == 1 && temp.relatedInq.length !== 2 && temp.relatedInq.length !== 0) {
                    this.$Message.error(this.$t('crm.Modal.error_taskRelatedInquiry'));
                    return false;
                }
                // if(temp.relatObjType == 2 && JSON.stringify(temp.relatObjDescription) === '{}') {
                //     this.$Message.error(this.$t('crm.Modal.error_taskRelatedInquiry'));
                //     return false;
                // }
                if (temp.repeat.type !== 'none') {
                    switch (temp.repeat.type) {
                        case 'none':
                            break;
                        case 'day':
                            if (temp.repeat.endCon === 'date' && (temp.repeat.endConDate instanceof Date) === false) {
                                this.$Message.error(this.$t('crm.Modal.error_taskEndDate'));
                                return false;
                            }
                            break;
                        case 'week':
                            if (temp.repeat.endCon === 'date' && (temp.repeat.endConDate instanceof Date) === false) {
                                this.$Message.error(this.$t('crm.Modal.error_taskEndDate'));
                                return false;
                            }
                            if (temp.repeat.weekDays.length === 0 ||
                                temp.repeat.weekDays.length > 7 ||
                                temp.repeat.weekDays.length !== new Set(temp.repeat.weekDays).size ||
                                temp.repeat.weekDays.some(i => ['1', '2', '3', '4', '5', '6', '7'].indexOf(i) === -1)) {
                                this.$Message.error(this.$t('crm.Modal.error_taskRepeatTime'));
                                return false;
                            }
                            break;
                        case 'month':
                            if (temp.repeat.endCon === 'date' && (temp.repeat.endConDate instanceof Date) === false) {
                                this.$Message.error(this.$t('crm.Modal.error_taskEndDate'));
                                return false;
                            }
                            if (typeof temp.repeat.monthDay !== 'number' || temp.repeat.monthDay < 0 || temp.repeat.monthDay > 31) {
                                this.$Message.error(this.$t('crm.Modal.error_taskRepeatTime'));
                                return false;
                            }
                            break;
                    }
                    if (temp.repeat.endCon === 'date') {
                        // console.log('%c taskEndTime', 'color:red', new Date(temp.taskEndTime).getTime());
                        // console.log('%c asdasda', 'color:red', new Date(temp.repeat.endConDate).getTime());
                        if (new Date(temp.repeat.endConDate).getTime() > new Date(temp.taskEndTime).getTime()) {
                            this.$Message.error(this.$t('crm.Modal.error_taskEndDate_compare_taskEndTime'));
                            return false;
                        }
                    }
                }
                return true;
            }, // 校验数据是否符合格式
            ok() {
                if (this.loading) {
                    this.$Message.error(this.$t('crm.Html.loading'));
                    return;
                }
                if (this.verify()) {
                    this.loading = true;
                    let type = '';
                    if (this.modalShow.newTask) {
                        type = this.$t('crm.Modal.operate_new');
                    } else if (this.modalShow.editTask) {
                        type = this.$t('crm.Modal.operate_edit');
                    }

                    const participantsJson = [];
                    if (!this.taskObj.participants.every(id => this.allSalesList.some(sale => {
                        if (`${sale.id}` === `${id}`) {
                            participantsJson.push({
                                userId: sale.id,
                                userName: sale.fullname
                            });
                            return true;
                        }
                    }))) {
                        this.$Message.error(this.$t('crm.Modal.error_taskParticipantsError'));
                        this.loading = false;
                        return;
                    } else if (!participantsJson.length) {
                        this.$Message.error(this.$t('crm.Modal.error_taskParticipantsError'));
                        this.loading = false;
                        return;
                    }
                    const data = {
                        orgId: this.enterpriseId,
                        taskName: this.taskObj.taskName,
                        id: this.taskObj.id,
                        taskEndTime: this.taskObj.taskEndTime.format('yyyy-MM-dd hh:mm:ss'),
                        taskScheduleTime: this.taskObj.taskEndTime.format('yyyy-MM-dd hh:mm:ss'),
                        remindType: this.taskObj.remindTimeValue >= 0 ? 2 : 1,
                        remindTimeUnit: this.taskObj.remindTimeValue === 1440 ? 3 : 1,
                        remindTimeValue: this.taskObj.remindTimeValue === -1 ? null : this.taskObj.remindTimeValue < 1440 ? this.taskObj.remindTimeValue : this.taskObj.remindTimeValue === 1440 ? 1 : undefined,
                        relatInquiryId: this.taskObj.relatedInq[1] || '',
                        relatInquiryDescription: JSON.stringify(this.relatedInqDesc),
                        taskDetails: this.taskObj.taskDetails,
                        repeatType: this.taskObj.repeat.type === 'none' ? 1 : 2,
                        repeatTimeUnit: this.taskObj.repeat.type === 'day' ? 1 : this.taskObj.repeat.type === 'week' ? 2 : this.taskObj.repeat.type === 'month' ? 3 : undefined,
                        repeatTimeValue: this.taskObj.repeat.type === 'day' ? 1 : this.taskObj.repeat.type === 'week' ? this.taskObj.repeat.weekDays.join(',') : this.taskObj.repeat.type === 'month' ? this.taskObj.repeat.monthDay : undefined,
                        repeatEndTime: (this.taskObj.repeat.type !== 'none' && this.taskObj.repeat.endCon === 'date') ? this.taskObj.repeat.endConDate.format('yyyy-MM-dd') : undefined,
                        taskStatus: this.taskObj.taskStatus,
                        participantsJson: JSON.stringify(participantsJson),
                        relatObjDescription: typeof(this.taskObj.relatObjDescription) == 'string' ? this.taskObj.relatObjDescription : JSON.stringify(this.taskObj.relatObjDescription),
                        mailReplyRemindFlag: this.taskObj.remindRegValue ? 1 : 0,
                        relatObjId: this.taskObj.relatObjDescription ? this.taskObj.relatObjDescription.mailId : '',
                        relatObjType: this.taskObj.relatObjType
                    }
                    if (this.fromModule === 'writeMail') {
                        this.$emit('setTask', data);
                        this.loading = false;
                        this.cancel();
                        return;
                    }
                    crmCommon.taskSave({
                        orgId: this.enterpriseId,
                        taskName: this.taskObj.taskName,
                        id: this.taskObj.id,
                        taskEndTime: this.taskObj.taskEndTime.format('yyyy-MM-dd hh:mm:ss'),
                        taskScheduleTime: this.taskObj.taskEndTime.format('yyyy-MM-dd hh:mm:ss'),
                        remindType: this.taskObj.remindTimeValue >= 0 ? 2 : 1,
                        remindTimeUnit: this.taskObj.remindTimeValue === 1440 ? 3 : 1,
                        remindTimeValue: this.taskObj.remindTimeValue === -1 ? null : this.taskObj.remindTimeValue < 1440 ? this.taskObj.remindTimeValue : this.taskObj.remindTimeValue === 1440 ? 1 : undefined,
                        relatInquiryId: this.taskObj.relatedInq[1] || '',
                        relatInquiryDescription: this.casVal.length ? JSON.stringify(this.relatedInqDesc) : '{}',
                        taskDetails: this.taskObj.taskDetails,
                        repeatType: this.taskObj.repeat.type === 'none' ? 1 : 2,
                        repeatTimeUnit: this.taskObj.repeat.type === 'day' ? 1 : this.taskObj.repeat.type === 'week' ? 2 : this.taskObj.repeat.type === 'month' ? 3 : undefined,
                        repeatTimeValue: this.taskObj.repeat.type === 'day' ? 1 : this.taskObj.repeat.type === 'week' ? this.taskObj.repeat.weekDays.join(',') : this.taskObj.repeat.type === 'month' ? this.taskObj.repeat.monthDay : undefined,
                        repeatEndTime: (this.taskObj.repeat.type !== 'none' && this.taskObj.repeat.endCon === 'date') ? this.taskObj.repeat.endConDate.format('yyyy-MM-dd') : undefined,
                        taskStatus: this.taskObj.taskStatus,
                        participantsJson: JSON.stringify(participantsJson),
                        relatObjDescription: typeof(this.taskObj.relatObjDescription) == 'string' ? this.taskObj.relatObjDescription : JSON.stringify(this.taskObj.relatObjDescription),
                        mailReplyRemindFlag: this.taskObj.remindRegValue ? 1 : 0,
                        relatObjId: this.taskObj.relatObjDescription ? this.taskObj.relatObjDescription.mailId : '',
                        relatObjType: this.taskObj.relatObjType
                    }).then(response => {
                        if (response.code === '1') {
                            if (this.taskObj.remindTimeValue === -1) {
                                this.$store.commit('setTaskChangeObj', {
                                    id: JSON.parse(response.data).id,
                                    type: 'noNotice'
                                });
                            } else {
                                const time = this.taskObj.taskEndTime.getTime() - this.taskObj.remindTimeValue * 60000 - Date.now();
                                if (time > 0) {
                                    this.$store.commit('setTaskChangeObj', {
                                        id: JSON.parse(response.data).id,
                                        type: type === this.$t('crm.Modal.operate_new') ? 'newTask' : type === this.$t('crm.Modal.operate_edit') ? 'editTask' : '',
                                        taskName: this.taskObj.taskName,
                                        taskEndTime: this.taskObj.taskEndTime,
                                        taskDetails: this.taskObj.taskDetails,
                                        time: time
                                    });
                                } else if (time === 0) {
                                    // this.$store.dispatch('taskNotice', {
                                    //     tip: this.taskObj.taskName,
                                    //     fromNick: this.taskEndTime.format('yyyy-MM-dd hh:mm'),
                                    //     text: this.taskObj.taskDetails
                                    // });
                                }
                            }

                            if (this.modalShow.newTask) {
                                this.$Message.success(this.$t('crm.Modal.success_newTask'));
                            } else if (this.modalShow.editTask) {
                                this.$Message.success(this.$t('crm.Modal.success_editTask'));
                            }
                            try {
                                this.$parent[this.refreshMethodName]();
                            } catch (e) {
                                console.log(e);
                            }
                            this.$emit('getTaskList');
                            this.cancel();
                        } else {
                            if (this.modalShow.newTask) {
                                this.$Message.error(this.$t('crm.Modal.error_newTask'));
                            } else if (this.modalShow.editTask) {
                                this.$Message.error(this.$t('crm.Modal.error_editTask'));
                            }
                        }
                        this.loading = false;
                    });
                }
            }, // 提交
            setSales() {
                this.allSalesList = this.$deepClone(this.allUsers);
                if (this.type === 'newTask') {
                    this.allSalesList.some(sale => {
                        if (sale.id - 0 === this.userId - 0) {
                            if(this.taskObj.participants.includes(sale.id)) {
                                return true
                            }
                            this.taskObj.participants.push(sale.id);
                            return true;
                        }
                    });
                }
                this.loading = false;
            }, // 获取任务参与人下拉列表,并在新建时回填当前用户进入参与人
            async getCompanyName() {
                this.getCompanyNameLoading = true;
                await crmCompany.getCompany({
                    id: this.relatedInqDesc.companyId
                }).then(response => {
                    if (response.code === '1') {
                        this.relatedInqDesc.companyName = response.data.companyName;
                        /**
                         * @Description: unclaimedStatus=1 公海询盘不可编辑
                         * @author mayuanzhi
                         * @date 2020/5/7
                        */
                        this.unclaimedStatus = response.data.unclaimedStatus;
                    }
                    this.getCompanyNameLoading = false;
                }, error => {
                    this.getCompanyNameLoading = false;
                }).catch(error => {
                    this.getCompanyNameLoading = false;
                });
            },
            // 提交新建
            cancel() {
                this.$emit('update:visible', false);
            }, // 通用取消

            // 详情
            edit() {
                this.modalShow.showTask = false;
                this.modalShow.editTask = true;
            },
            sign() {
                this.loading = true;
                let temp = 0;
                switch (this.taskObj.taskStatus) {
                    case 1:
                        temp = 2;
                        break;
                    case 2:
                        temp = 1;
                }
                crmCommon.updateTaskStatus({
                    id: this.taskObj.id,
                    taskStatus: temp
                }).then(response => {
                    if (response.code === '1' && response.data) {
                        this.$Message.success(this.$t('crm.Modal.success_changeTaskStatus'));
                        this.taskObj.taskStatus = temp;
                        this.loading = false;
                        try {
                            this.$parent[this.refreshMethodName]();
                        } catch {

                        }
                        this.$emit('getTaskList');
                        
                        if (this.taskObj.remindTimeValue === -1) {
                            this.$store.commit('setTaskChangeObj', {
                                id: JSON.parse(response.data).id,
                                type: 'noNotice'
                            });
                        } else {
                            switch (temp) {
                                case 1:
                                    const time = this.taskObj.taskEndTime.getTime() - this.taskObj.remindTimeValue * 60000 - Date.now();
                                    if (time > 0) {
                                        this.$store.commit('setTaskChangeObj', {
                                            id: this.taskObj.id,
                                            type: 'sign',
                                            taskName: this.taskObj.taskName,
                                            taskEndTime: this.taskObj.taskEndTime,
                                            taskDetails: this.taskObj.taskDetails,
                                            time: time
                                        });
                                    } else if (time === 0) {
                                        // this.$store.dispatch('taskNotice', {
                                        //     tip: this.taskObj.taskName,
                                        //     fromNick: this.taskEndTime.format('yyyy-MM-dd hh:mm'),
                                        //     text: this.taskObj.taskDetails
                                        // });
                                    }
                                    break;
                                case 2:
                                    // this.bus.$emit('taskChange', {
                                    //     id: this.taskObj.id,
                                    //     type: 'unSign'
                                    // });
                                    this.$store.commit('setTaskChangeObj', {
                                        id: this.taskObj.id,
                                        type: 'unSign'
                                    });
                            }
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_changeTaskStatus'));
                    }
                });
            },
            removeConfirm() {
                this.visible_deleteTask = true;

                // this.$Modal.confirm({
                //     title: this.$t('crm.Modal.modal_deleteTask'),
                //     content: this.$t('crm.Modal.modal_deleteTaskContent'),
                //     onOk: this.remove
                // });
            },
            remove() {
                this.visible_deleteTask = false;
                this.loading = true;
                crmCommon.taskDelete({
                    orgId: this.enterpriseId,
                    id: this.taskObj.id
                }).then(response => {
                    if (response.code === '1' && response.data) {
                        this.$Message.success(this.$t('crm.Modal.success_deleteTask'));
                        // this.bus.$emit('taskChange', {
                        //     id: this.taskObj.id,
                        //     type: 'delete'
                        // });
                        this.$store.commit('setTaskChangeObj', {
                            id: this.taskObj.id,
                            type: 'delete'
                        });
                        try {
                            this.$parent.deleteFinished();
                        } catch {
                        }
                        try {
                            this.$parent[this.refreshMethodName]();
                        } catch {
                        }
                        this.$emit('getTaskList');
                        this.$emit('update:visible', false);
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_deleteTask'));
                    }
                });
            },
            jumpToCustomer() {
                const id = this.relatedInqDesc.companyId;
                if (!this.isContainsMenu('myCustomer')) {
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                } else {
                    if (id) {
                        this.$viewCustomer(id);
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_companyId'));
                    }
                }
            },
            jumpToInquiry() {
                const { companyId, inquiryId:id } = this.relatedInqDesc;
                /**
                 * @Description: unclaimedStatus=1 公海询盘
                 * @author mayuanzhi
                 * @date 2020/5/7
                 */
                if (this.unclaimedStatus === 1) {
                    if (!this.isContainsMenu('highseasCustomer')) {
                        this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionHighseasCustomer'));
                    } else {
                        if (id) {
                            localStorage.setItem('leadsCloud-inquiryId', id);
                        }

                        if (companyId) {
                            this.$viewHighSeasCustomer(companyId);
                        }
                    }
                } else {
                    if (!this.isContainsMenu('myInquiry')) {
                        this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyInquiry'));
                    } else {
                        if (id) {
                            // this.$router.push({
                            //     name: 'myInquiry',
                            //     params: {
                            //         inquiryId: id,
                            //         needAuth: true
                            //     }
                            // });

                            localStorage.setItem('leadsCloud-inquiryId', id);
                            window.open(this.$router.resolve({
                                name: 'myInquiry'
                            }).href, '_blank');
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_inquiryId'));
                        }
                    }
                }
            },
            /* 跳转至邮件，并进行跳转前校验 */
            jumpToMail(obj) {
                const mailId = obj.mailId;
                const mailCreateUserId = obj.mailCreateUserId || undefined;
                /* 跳转前要进行功能权限以及邮件是否被彻底删除的校验 */
                util.ajaxMailJson({
                    url: '/mail/mailDetail',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        id: mailId,
                        createUserId: mailCreateUserId
                    },
                    timeout: 60000
                }).then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data.mailDraftFlag) {
                            const obj = {};
                            obj.mailEdit = true;
                            obj.mailId = mailId;
                            obj.selectedMailBoxType = 'draftBox';
                            localStorage.setItem('leadsCloud-writeMailData', JSON.stringify(obj));
                            const forwardMailDetail = Object.assign(res.data.data, { id: mailId, from: 'globalSearch' });
                            localStorage.setItem('leadsCloud-currentPersonId', res.data.data.createUserId);
                            const href = window.location.origin + window.location.pathname + this.$router.resolve({
                                        name: 'mail_home'
                                    }).href;
                            localStorage.setItem('leadsCloud-timeLine-mailDetail', JSON.stringify(forwardMailDetail));
                            window.open(href, '_blank');
                        } else {
                            if (mailCreateUserId && `${mailCreateUserId}` !== `${this.userId}`) {
                                const currentInputInfo = this.departmentPeople.filter(item => item.createUserId === `${mailCreateUserId}`);
                                if (currentInputInfo.length) {
                                    const currentAccount = currentInputInfo.map(item => item.emailAddress);
                                    const jumpMailHome = JSON.stringify({ currentInputInfo: currentInputInfo[0].fullname, currentAccount: currentAccount });
                                    localStorage.setItem('leadsCloud-jumpMailHome', jumpMailHome);
                                } else {
                                    this.$Message.error('此邮件负责人没有设置"允许上级查看邮件"权限');
                                    return;
                                }
                            }
                            const forwardMailDetail = Object.assign(res.data.data, { id: mailId, from: 'globalSearch' });
                            localStorage.setItem('leadsCloud-currentPersonId', res.data.data.createUserId);
                            const href = window.location.origin + window.location.pathname + this.$router.resolve({
                                name: 'mail_home'
                            }).href;
                            localStorage.setItem('leadsCloud-timeLine-mailDetail', JSON.stringify(forwardMailDetail));
                            window.open(href, '_blank');
                        }
                    } else {
                        this.$Message.error(this.$t('globalSearch.mailBeDeleted'));
                    }
                });
            },

            // 获取公司下级联询盘数据
            inquiryData(node, resolve) {
                if (node.level === 0) {
                    return resolve(this.casData);
                }

                const data = node.data;
                node.loading = true;
                crmCommon.getListByCompany({
                    companyId: data.value,
                    orgId: this.enterpriseId
                }).then(response => {
                    if (response.code === '1') {
                        data.children = response.data.map(i => {
                            return {
                                value: i.id,
                                label: i.seqNumber,
                                leaf: true
                            };
                        });
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_getSubordinateInquiry'));
                    }
                    node.loading = false;
                    resolve(data.children);
                }, error => {
                    node.loading = false;
                    resolve(data.children);
                }).catch(error => {
                    node.loading = false;
                    resolve(data.children);
                });
            },
            casDataSearch(val) {
                // 输入必须清空之前选择的数据
                this.casData = [{
                    value: null,
                    label: this.$t('searching'),
                    children: [],
                    loading: true,
                    disabled: true
                }];

                if (val) {
                    return new Promise((resolve, reject) => {
                        crmCommon.getFilterList({
                            orgId: this.enterpriseId,
                            listType: 2,
                            query: JSON.stringify({ $and: [{ company_name: { $regex: val } }] }),
                            pageNo: 1,
                            pageSize: 100
                        }).then(response => {
                            if (response.code === '1' && response.data.list.length > 0) {
                                this.casData = response.data.list.map(i => {
                                    return {
                                        value: i.id,
                                        label: i.companyName,
                                        children: []
                                    };
                                });
                            } else {
                                this.casData = [{
                                    value: null,
                                    label: this.$t('notFound'),
                                    disabled: true,
                                    leaf: true
                                }];
                            }
                            reject(false);
                        }).catch(error => {
                            reject(false);
                        });
                    });
                } else {
                    this.casData = [];
                    return false;
                }
            },
            casChange([companyId, inquiryId]) {
                const checkedNodes = this.$refs.casInq.getCheckedNodes();
                if (checkedNodes && checkedNodes[0]) {
                    const labels = checkedNodes[0].pathLabels;
                    this.relatedInqDesc.companyName = labels[0];
                    this.relatedInqDesc.inquirySeqNumber = labels[1];
                    this.taskObj.relatedInq = [companyId, inquiryId];
                    this.relatedInqDesc.companyId = companyId;
                    this.relatedInqDesc.inquiryId = inquiryId;
                } else {
                    // this.$Message.error(this.$t('crm.Modal.errorOccurred'));
                }
            },
            valideClueBlur(val, id) {
                if(!this.taskObj.taskRelatedEmailShowTest) {
                    this.taskObj.relatObjDescription = {}
                }
                if (!this.taskObj.relatObjDescription || JSON.stringify(this.taskObj.relatObjDescription) === '{}') {
                    this.taskObj.taskRelatedEmailShowTest = ''
                }
            },
            searchBusinessCompanyData(queryString, cb) {
                // 取消之前的表格数据请求
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }
                const vm = this;
                if (!queryString) {
                    cb([]);
                    return;
                }
                const cancelToken = new this.$util.axios.CancelToken(function executor(c) {
                    // An executor function receives a cancel function as a parameter
                    vm.cancelFunc = c;
                });
                crmCommon.mailSearch({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    pageNo: 1,
                    pageSize: 50,
                    searchType: 1,
                    searchContent: queryString
                }, cancelToken).then(response => {
                    const result = this.handleBusinessData(response);
                    cb(result);
                });
            },
            handleSelectCompany(item) {
                this.taskObj.relatObjDescription = {
                    mailId: item.data.idString, 
                    mailSubject: item.data.title,
                    mailBoxTypeId: item.data.mailBoxTypeId,
                    mailBoxTypeName: item.data.mailBoxTypeName
                }
                this.taskObj.taskRelatedEmail = item.data.mailBoxTypeName + ' ' + item.data.title;
                this.taskObj.taskRelatedEmailShowTest = item.data.title;
            },
            // 格式化搜索得到的邮件数据
            handleBusinessData(dataList) {
                if (!Array.isArray(dataList)) {
                    return [];
                }

                return dataList.map(item => {
                    return {
                        value: item.title,
                        data: JSON.parse(JSON.stringify(item))
                    };
                });
            }
        },
        watch: {
            visible(val) {
                this.loading = true;
                if (val) {
                    this.modalShow[this.type] = true;
                    switch (this.type) {
                        case 'newTask':
                            // 新建任务时, 预制截止时间为当天 18:00
                            this.taskObj.taskEndTime = new Date(new Date().setHours(18,0,0,0));
                            if (this.taskObjProp && ['writeMail', 'mailTableList', 'mailDetail'].includes(this.fromModule)) {
                                this.taskObj.taskName = this.taskObjProp.taskName;
                                this.taskObj.remindTimeValue = this.taskObjProp.remindTimeValue;
                                this.taskObj.relatObjType = this.taskObjProp.relatObjType;
                                // this.taskObj.taskRelatedEmail = this.taskObjProp.relatObjDescription.mailSubject;
                                this.taskObj.taskRelatedEmail = '[' + this.taskObjProp.relatObjDescription.mailBoxTypeName + ']' + this.taskObjProp.relatObjDescription.mailSubject;
                                this.taskObj.taskRelatedEmailShowTest = this.taskObjProp.relatObjDescription.mailSubject;
                                this.taskObj.relatObjDescription = this.taskObjProp.relatObjDescription;
                                this.taskObj.taskEndTime = this.taskObjProp.taskEndTime?new Date(this.taskObjProp.taskEndTime) : '';
                                this.taskObj.remindRegValue = !!this.taskObjProp.mailReplyRemindFlag;
                            }
                            if (this.fromInquiry) {
                                this.taskObj.relatedInq = [this.fromInquiry.companyId, this.fromInquiry.inquiryId];
                                this.relatedInqDesc.companyId = this.fromInquiry.companyId;
                                this.relatedInqDesc.companyName = this.fromInquiry.companyName;
                                this.relatedInqDesc.inquirySeqNumber = this.fromInquiry.inquirySeqNumber;
                                this.relatedInqDesc.inquiryId = this.fromInquiry.inquiryId;
                                
                                this.casData = [
                                    {
                                        value: this.relatedInqDesc.companyId,
                                        label: this.relatedInqDesc.companyName,
                                        children: [
                                            {
                                                value: this.relatedInqDesc.inquiryId,
                                                label: this.relatedInqDesc.inquirySeqNumber,
                                                leaf: true
                                            }
                                        ]
                                    }
                                ];
                                this.casVal = [this.fromInquiry.companyId, this.fromInquiry.inquiryId];
                                this.taskObj.relatObjType = 1;
                            }
                            // 获取全部用户
                            this.$store.dispatch('getAllUsers');
                            // this.setSales();
                            break;
                        case 'editTask':
                            if (this.taskObjProp) {
                                // 获取全部用户
                                this.$store.dispatch('getAllUsers');
                                const temp = Object.assign({}, this.taskObjProp);
                                let relatedInq = [];
                                if (temp.relatInquiryId && temp.relatInquiryDescription && JSON.parse(temp.relatInquiryDescription)) {
                                    const tempObj = JSON.parse(temp.relatInquiryDescription);
                                    this.relatedInqDesc.companyId = tempObj.companyId;
                                    this.relatedInqDesc.inquirySeqNumber = tempObj.inquirySeqNumber;
                                    this.relatedInqDesc.inquiryId = tempObj.inquiryId;
                                    relatedInq = [tempObj.companyId - 0, tempObj.inquiryId - 0];
                                    (async () => {
                                        await this.getCompanyName();
                                        this.casData = [
                                            {
                                                value: this.relatedInqDesc.companyId,
                                                label: this.relatedInqDesc.companyName,
                                                children: [
                                                    {
                                                        value: this.relatedInqDesc.inquiryId,
                                                        label: this.relatedInqDesc.inquirySeqNumber,
                                                        leaf: true
                                                    }
                                                ]
                                            }
                                        ];
                                        this.casVal = [tempObj.companyId - 0, tempObj.inquiryId - 0];
                                    })();
                                }
                                this.taskObj = {
                                    id: temp.id,
                                    taskName: temp.taskName,
                                    taskEndTime: new Date(temp.taskEndTime),
                                    remindTimeValue: temp.remindType === 1 ? -1 : temp.remindTimeUnit === 1 ? temp.remindTimeValue : temp.remindTimeUnit === 3 ? 1440 : undefined,
                                    participants: temp.participantsJson ? JSON.parse(temp.participantsJson).map(i => Number(i.userId)) : [],
                                    relatedInq,
                                    repeat: {
                                        type: temp.repeatType === 1 ? 'none' : temp.repeatTimeUnit === 1 ? 'day' : temp.repeatTimeUnit === 2 ? 'week' : temp.repeatTimeUnit === 3 ? 'month' : undefined, // 重复类型
                                        endCon: temp.repeatEndTime ? 'date' : 'none', // 结束条件选择
                                        endConDate: temp.repeatEndTime ? new Date(temp.repeatEndTime) : undefined, // 结束选项
                                        weekDays: temp.repeatTimeUnit === 2 ? temp.repeatTimeValue.split(',') : [], // 每周重复时间
                                        monthDay: temp.repeatTimeUnit === 3 ? temp.repeatTimeValue - 0 : undefined // 每月重复时间
                                    },
                                    relatObjType: temp.relatObjType,
                                    relationObj: temp.relatObjType,
                                    relatObjDescription: !temp.relatObjDescription ? '{}' : JSON.parse(temp.relatObjDescription),
                                    remindRegValue: !!temp.mailReplyRemindFlag,
                                    taskRelatedEmail: (!!temp.relatObjDescription && temp.relatObjDescription !== '{}') ? (JSON.parse(temp.relatObjDescription).mailBoxTypeName + ' ' + JSON.parse(temp.relatObjDescription).mailSubject) : '',
                                    taskRelatedEmailShowTest:temp.relatObjType == 2 ? JSON.parse(temp.relatObjDescription).mailSubject : '',
                                    taskDetails: temp.taskDetails,
                                    taskStatus: temp.taskStatus
                                };
                                // this.setSales();
                            } else {
                                this.$Message.error(this.$t('crm.Modal.errorOccurred'));
                                this.$emit('update:visible', false);
                            }
                            break;
                        case 'showTask':
                            if (this.taskObjProp) {
                                const temp = Object.assign({}, this.taskObjProp);
                                let relatedInq = [];
                                if (temp.relatInquiryId && temp.relatInquiryDescription && JSON.parse(temp.relatInquiryDescription)) {
                                    const tempObj = JSON.parse(temp.relatInquiryDescription);
                                    this.relatedInqDesc.companyId = tempObj.companyId;
                                    this.relatedInqDesc.inquirySeqNumber = tempObj.inquirySeqNumber;
                                    this.relatedInqDesc.inquiryId = tempObj.inquiryId;
                                    relatedInq = [tempObj.companyId - 0, tempObj.inquiryId - 0];
                                    (async () => {
                                        await this.getCompanyName();
                                        this.casData = [
                                            {
                                                value: this.relatedInqDesc.companyId,
                                                label: this.relatedInqDesc.companyName,
                                                children: [
                                                    {
                                                        value: this.relatedInqDesc.inquiryId,
                                                        label: this.relatedInqDesc.inquirySeqNumber,
                                                        leaf: true
                                                    }
                                                ]
                                            }
                                        ];
                                        this.casVal = [tempObj.companyId - 0, tempObj.inquiryId - 0];
                                    })();
                                }
                                this.taskObj = {
                                    id: temp.id,
                                    taskName: temp.taskName,
                                    taskEndTime: new Date(temp.taskEndTime),
                                    createTime: temp.createTime ? new Date(temp.createTime) : '',
                                    remindTimeValue: temp.remindType === 1 ? -1 : temp.remindTimeUnit === 1 ? temp.remindTimeValue : temp.remindTimeUnit === 3 ? 1440 : undefined,
                                    participants: temp.participantsJson ? JSON.parse(temp.participantsJson).map(i => Number(i.userId)) : [],
                                    participantsJson: temp.participantsJson ? JSON.parse(temp.participantsJson) : [],
                                    relatedInq,
                                    repeat: {
                                        type: temp.repeatType === 1 ? 'none' : temp.repeatTimeUnit === 1 ? 'day' : temp.repeatTimeUnit === 2 ? 'week' : temp.repeatTimeUnit === 3 ? 'month' : undefined, // 重复类型
                                        endCon: temp.repeatEndTime ? 'date' : 'none', // 结束条件选择
                                        endConDate: temp.repeatEndTime ? new Date(temp.repeatEndTime) : undefined, // 结束选项
                                        weekDays: temp.repeatTimeUnit === 2 ? temp.repeatTimeValue.split(',') : [], // 每周重复时间
                                        monthDay: temp.repeatTimeUnit === 3 ? Number(temp.repeatTimeValue) : undefined // 每月重复时间
                                    },
                                    relatObjType: temp.relatObjType,
                                    relatObjDescription: (!temp.relatObjDescription || temp.relatObjDescription == 'null') ? '{}' : JSON.parse(temp.relatObjDescription),
                                    remindRegValue: !!temp.mailReplyRemindFlag,
                                    taskRelatedEmail: (!!temp.relatObjDescription && (temp.relatObjDescription !== '{}' && temp.relatObjDescription !== 'null')) ? (JSON.parse(temp.relatObjDescription).mailBoxTypeName + ' ' + JSON.parse(temp.relatObjDescription).mailSubject) : '',
                                    taskRelatedEmailShowTest: (!!temp.relatObjDescription && (temp.relatObjDescription !== '{}' && temp.relatObjDescription !== 'null')) ? JSON.parse(temp.relatObjDescription).mailSubject : '',
                                    taskDetails: temp.taskDetails,
                                    taskStatus: temp.taskStatus
                                };
                                this.loading = false;
                            } else {
                                this.$Message.error(this.$t('crm.Modal.errorOccurred'));
                                this.$emit('update:visible', false);
                            }
                            break;
                    }
                } else {
                    // 进行系列清空操作
                    this.modalShow = {
                        newTask: false,
                        editTask: false,
                        showTask: false
                    };
                    this.casVal = [];
                    this.casData = [];
                    this.taskObj = {
                        id: undefined,
                        taskName: '',
                        taskEndTime: '',
                        remindTimeValue: 0,
                        participants: [],
                        relatedInq: [],
                        repeat: {
                            type: 'none', // 重复类型
                            endCon: 'none', // 结束条件选择
                            endConDate: '', // 结束选项
                            weekDays: [], // 每周重复时间
                            monthDay: undefined // 每月重复时间
                        },
                        taskDetails: '',
                        taskStatus: 1
                    };
                    this.relatedInqDesc = {
                        companyName: undefined,
                        companyId: undefined,
                        inquiryId: undefined,
                        inquirySeqNumber: undefined
                    };
                    this.unclaimedStatus = '';
                }
            },
            'taskObj.repeat.endCon': {
                handler(val, OldVal) {
                    if (val === 'none') {
                        this.taskObj.repeat.endConDate = '';
                    }
                },
                deep: true
            },
            'modalShow.editTask': {
                handler(val, oldVal) {
                    if (!oldVal && val) {
                        // 获取全部用户
                        this.$store.dispatch('getAllUsers');

                    }
                },
                deep: true
            }, // 检测当用户从用户详情点击编辑时,请求会关联询盘和参与人下拉选项列表
            allUsers: {
                handler(val) {
                    if (val){
                        this.setSales();
                    }
                }
            }
        },
        created() {},
    };
</script>

<style lang="less">
    .datepickerwidth .el-date-editor.el-input {
        width: 154px;
    }
    .taskModal {
        .el-dialog__body {
            position: relative;
            max-height: calc(~"100vh - 245px");
            overflow: auto;
            padding: 30px 70px 10px 55px;

            .el-form-item__content {
                > div {
                    width: 100%;
                }
            }
        }
        pre {
            margin-top: 0;
            font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
        }

        .required-formItem{
            position: relative;
            margin-bottom: 18px;
            &.task-participants .el-form-item__content .el-select__tags {
                max-height: 118px;
                overflow-y: scroll;
            }
            &::before{
                content: '*';
                color: #F56C6C;
                position: absolute;
                left: -15px;
                top: 10px;
            }
        }
        .el-form-item.more-text {
             &.task-participants-show {
                margin-bottom: 12px;
                margin-top: 4px;
            }
            margin-bottom: 6px;
            .el-form-item__content {
                line-height: 24px;
            }
            .el-form-item__label {
                line-height: 24px;
            }

        }
        .el-autocomplete-suggestion li {
            font-size: 12px;
        }
        .el-autocomplete{
            width: 287px !important;
        }
        .el-dialog__footer{
            padding-left: 24px;
        }
        .removeConfirm-btn {
            float: left;
            color:#EA4335;
            font-size:14px;
            display: flex;
            height: 36px;
            align-items: center;
        }
    }
    .show-box .el-form-item {
        margin-bottom: 0;
    }

    .related_inquiry_companyName {
        color: #3b78de;
        cursor: pointer;
        line-height: 24px;
        display: inline-block;
        &:hover {
            color: #2d63bc;
            text-decoration: underline;
        }
    }

    .related_inquiry_inqNumber {
        color: #3b78de;
        cursor: pointer;

        &:hover {
            color: #2d63bc;
            text-decoration: underline;
        }
    }
</style>
