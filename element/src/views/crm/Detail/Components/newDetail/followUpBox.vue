<template>
    <div v-loading="loading"
         :element-loading-text="$t('crm.Html.loading')"
         ref="container">
        <!-- 跟进时间, 沟通渠道 -->
        <div v-show="visible_full_panel"
             style="font-size: 12px;">
            <!-- 跟进时间 -->
            <span>{{ $t('crm.Html.followUpTime') }}：</span>
            <DatePicker v-model="followDate"
                        type="datetime"
                        :picker-options="followOptions"
                        format="yyyy-MM-dd HH:mm:ss"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        :placeholder="$t('crm.Html.tip_selectDate')"
                        :editable="false"
                        placement="top-start"
                        @change="changeDate"
                        size="mini"
                        style="margin: 0 10px 10px 0;width: 175px;"></DatePicker>
            <!-- 跟进方式 -->
            <span>{{ $t('crm.UniSet.followUpMode') }}：</span>
            <Select v-model="resource"
                @change="resourceChange"
                placement="top"
                size="mini"
                style="width:115px;margin-right:10px;position:relative;">
                <Option v-for="item in resourceList" :value="item.value" :label="item.label" :key="item.attrId" :disabled="item.disabled"></Option>
            </Select>

            <!-- 快速任务 -->
            <template v-if="type_followUp === '3'">
                <Checkbox v-model="task_is_checked" :disabled="isDisabled"></Checkbox>
                <span style="display: inline-block; margin: 0 5px;">{{ $t('crm.Html.createTaskSync') }}</span>
                <Dropdown trigger="click"
                          size="mini"
                          @command="name => task_time_type = name"
                          style="font-size: 12px;line-height: 12px;">
                        <span style="cursor: pointer;">
                            <span v-text="task_time_type === $t('crm.Html.custom') ? task_time_map.get(task_time_type) : task_time_type"></span>
                            <Icon type="ios-arrow-down"></Icon>
                        </span>
                    <DropdownMenu slot="dropdown">
                        <DropdownItem :command="$t('crm.Html.custom')" @click="task_popTip_visible = true">
                            <Poptip v-model="task_popTip_visible">
                                <span slot="reference">{{ $t('crm.Html.custom') }}</span>
                                <div>
                                    <DatePicker v-model="custom_task_time"
                                                value-format="yyyy-MM-dd"
                                                :picker-options="task_time_options"
                                                :clearable="false"
                                                :editable="false"
                                                @change="change_task_custom_time"></DatePicker>
                                </div>
                            </Poptip>
                        </DropdownItem>
                        <DropdownItem :command="$t('crm.Html.oneDayLater')">{{ $t('crm.Html.oneDayLater') }}</DropdownItem>
                        <DropdownItem :command="$t('crm.Html.twoDaysLater')">{{ $t('crm.Html.twoDaysLater') }}</DropdownItem>
                        <DropdownItem :command="$t('crm.Html.threeDaysLater')">{{ $t('crm.Html.threeDaysLater') }}</DropdownItem>
                        <DropdownItem :command="$t('crm.Html.fourDaysLater')">{{ $t('crm.Html.fourDaysLater') }}</DropdownItem>
                        <DropdownItem :command="$t('crm.Html.fiveDaysLater')">{{ $t('crm.Html.fiveDaysLater') }}</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </template>
        </div>

        <!-- 文本框 + 上传图片 + 底部按钮 -->
        <div class="input-panel">
            <!-- 右上角关闭按钮 -->
            <div class="editArea-close" v-show="visible_full_panel" @click="close_input_panel">
                <Icon custom="custom custom-follow-edit-area-close"></Icon>
            </div>
            <!-- 文本框 -->
            <textarea v-model="followRecord"
                maxlength="2000"
                ref="followUpTextArea"
                :rows="visible_full_panel ? 4 : 1"
                :placeholder="$t('crm.Html.tip_addFollowUp')"
                @focus="set_default_time"
                :style="visible_full_panel ? '' : 'padding: 7px 12px;'"
                class="input-panel-textarea">
            </textarea>
            <!-- 字数限制提醒 -->
            <p v-show="visible_full_panel" class="followup-content-edit-text">
                {{$t('facebook.onekeyRelease.creatContent.entered')}}
                <span class="followup-content-edit-text-limit">
                    <span :style="followupContentLimitcolor">{{ followRecord.length }}</span>
                    <span>/</span>
                    <span>2000</span>
                </span>
            </p>
            <!-- 上传图片 -->
            <div v-show="visible_full_panel">
                <uploadPicture :fileCountLimit="9" :pictures="pictureList" class="followup_upload_picture" :isHidddenBtn="true"
                               ref="uploadPictureCompo"></uploadPicture>
            </div>
            <!-- 上传附件 -->
            <div v-show="visible_full_panel" style="padding: 8px 0;">
                <uploadFiles :fileCountLimit="9" :filesList="filesList" class="followup_upload_picture" :isHidddenBtn="true"
                               ref="uploadImgCompo"></uploadFiles>
            </div>
            <!-- 底部按钮 -->
            <div v-show="visible_full_panel" class="input-panel-bottom">
                <span class="cursor-pointer" @click="handleUploadPicture" style="margin-right: 20px;">
                    <svg class="annex-file-icon" aria-hidden="true">
                        <use xlink:href="#custom-tupian"></use>
                    </svg>{{ $t('crm.UniSet.followUpModeFormLable5') }}
                </span>
                <!-- <Icon type="image" size="20" style="margin-right: 10px;"></Icon> -->
                <span class="cursor-pointer" @click="handleUploadFile">
                    <svg class="annex-file-icon" aria-hidden="true">
                        <use xlink:href="#custom-fujian"></use>
                    </svg>{{ $t('crm.Html.attachment') }}
                </span>
                <div style="float: right">
                    <Button type="primary" @click="submitFollow" :disabled="submitFollowDisabled"
                            :class="editId ? class_editfollowuprecord : `piwik_${type}_add_followup`">{{ editId ? $t('save') : $t('crm.Html.submit') }}</Button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import uploadFiles from '@/views/crm/Detail/Components/Html/uploadFiles';
    import uploadPicture from '@/views/crm/Detail/Components/Html/uploadPicture';
    import { crmCommon, crmClue } from '@/api/crm/index';
    import { triggerGtag } from '@/utils/base';

    export default {
        name: 'followUpBox',
        components: {
            uploadFiles,
            uploadPicture
        },
        props: [
            'type', // 从哪进入详情: inquiry：询盘；customer & highseasCustomer：客户；contact：联系人
            'id',
            'companyId',
            'inquiryId',
            'inquirySeqNumber',
            'companyName',
            'followUpId',
            'visible_full_panel'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                followUpType: (state) => state.crm.followUpType
            }),
            type_followUp() {
                switch (this.type) {
                    case 'customer':
                    case 'highseasCustomer':
                        return '1';
                    case 'contact':
                        return '2';
                    case 'inquiry':
                        return '3';
                    default:
                        return '';
                }
            },
            class_editfollowuprecord() {
                switch (this.type) {
                    case 'customer':
                        return 'customer-editfollowuprecord';
                    case 'highseasCustomer':
                        return 'highseasCustomer-editfollowuprecord';
                    case 'contact':
                        return 'contact-editfollowuprecord';
                    case 'inquiry':
                        return 'inquiry-editfollowuprecord';
                    default:
                        return '';
                }
            },
            // 给 watch 监听用, 有 id 变更时, 清空输入框
            idStr() {
                return `${this.companyId}-${this.inquiryId}-${this.id}`;
            },
            followupContentLimitcolor() {
                if (this.currentResource && this.currentResource.numberStatus && (this.followRecord.length < Number(this.currentResource.number))) {
                    return 'color:#EA4335';
                } else if (this.followRecord.length) {
                    return 'color:#4285F2';
                } else {
                    return '';
                }
            }
        },
        data() {
            this.dateformat();
            return {
                isDisabled: false, // 是否禁止创建任务
                loading: false, // 加载中
                //                manuallyFollowUpList: [], // 客服添加的询盘跟进

                /* 询盘跟进 */
                // visible_full_panel: false,
                followRecord: '', // 跟进记录
                datePicker_clicked: false, // 本轮(本次添加跟进记录)有点过
                followDate: (new Date()).format('yyyy-MM-dd hh:mm:ss'),
                // 跟进日期限制
                followOptions: {
                    disabledDate(date) {
                        return date.getTime() > Date.now();
                    }
                },
                // 跟进记录跟进方式, 格式为[{value: xx, label: $t('...)}]
                resourceList: [
                    {
                        value: '01',
                        label: this.$t('crm.Html.phone')
                    },
                    {
                        value: '02',
                        label: this.$t('crm.Html.Email')
                    },
                    {
                        value: '03',
                        label: this.$t('crm.Html.WhatsApp')
                    },
                    {
                        value: '16',
                        label: this.$t('crm.Html.instagram')
                    },
                    {
                        value: '04',
                        label: this.$t('crm.Html.Facebook')
                    },
                    {
                        value: '05',
                        label: this.$t('crm.Html.weChat')
                    },
                    {
                        value: '06',
                        label: this.$t('crm.Html.LinkedIn')
                    },
                    {
                        value: '07',
                        label: this.$t('crm.Html.Twitter')
                    },
                    {
                        value: '08',
                        label: this.$t('crm.Html.Message')
                    },
                    {
                        value: '09',
                        label: this.$t('crm.Html.exhibition')
                    },
                    {
                        value: '10',
                        label: this.$t('crm.Html.customerVisiting')
                    },
                    {
                        value: '11',
                        label: this.$t('crm.Html.visitCustomer')
                    },
                    {
                        value: '12',
                        label: this.$t('crm.Html.websiteInteraction')
                    },
                    {
                        value: '13',
                        label: this.$t('crm.Html.Skype')
                    },
                    {
                        value: '14',
                        label: this.$t('crm.Html.Line')
                    },
                    {
                        value: '15',
                        label: this.$t('crm.Html.others')
                    }
                ],
                // 跟进方式
                resource: '00',
                followType: 1, // 跟进类型
                /* 附件 */
                filesList: [], // 已上传附件列表
                /* 图片 */
                pictureList: [], // 已上传图片列表
                /* 快速任务 */
                task_popTip_visible: false,
                custom_task_time: (new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)).format('yyyy-MM-dd'),
                task_time_map: new Map([
                    [this.$t('crm.Html.oneDayLater'), 1],
                    [this.$t('crm.Html.twoDaysLater'), 2],
                    [this.$t('crm.Html.threeDaysLater'), 3],
                    [this.$t('crm.Html.fourDaysLater'), 4],
                    [this.$t('crm.Html.fiveDaysLater'), 5],
                    [this.$t('crm.Html.custom'), (new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)).format('yyyy-MM-dd')]
                ]),
                task_is_checked: false,
                task_time_type: this.$t('crm.Html.threeDaysLater'),
                task_time_options: {
                    disabledDate(date) {
                        return date.getTime() < Date.now();
                    }
                },
                /* 筛选部分 */
                followupTime: [],
                /* 编辑跟进记录 */
                editId: null,
                editEventActionId: null,
                editedFollowupData: {},
                currentResource: null,
                submitFollowDisabled: false

            };
        },
        methods: {
            /* 跟进记录框 */
            // 清空
            close_input_panel() {
                this.$emit('update:visible_full_panel', false);
                // this.visible_full_panel = false;
                this.followRecord = '';
                this.filesList = [];
                this.pictureList = [];
                this.editId = null;
                this.editEventActionId = null;
                this.editedFollowupData = {};
                this.followOptions = {
                    disabledDate(date) {
                        return date.getTime() > Date.now();
                    }
                };
                /**
                 * @Description: 清空的时候要重置创建任务的CheckBox的disabled
                 * @author mayuanzhi
                 * @date 2020/5/25
                 */
                this.currentResource = null;
                this.isDisabled = false;
                this.submitFollowDisabled = false;
            },

            // 时间
            changeDate() {
                this.datePicker_clicked = true;
            },
            resourceChange(val) {
                this.submitFollowDisabled = false;
                // 切换跟进记录需要同时切换对应的回填模板内容
                if (this.resourceList.some((item) => item.value === val) && this.visible_full_panel) {
                    this.currentResource = this.resourceList.find((item) => item.value === val);
                    if (this.currentResource.positionPunch) {
                        this.$alert(this.$t('crm.Html.followUpBoxTip'), '', {
                            confirmButtonText: this.$t('crm.Html.modal_ok'),
                            showCancelButton: false
                        }).then(() => {
                        });
                        this.submitFollowDisabled = true;
                        return;
                    }
                    if (!this.editId) {
                        if (this.currentResource.attrValue && this.followRecord.trim().length) {
                            this.$confirm(this.$t('crm.Html.followUpBoxTip1'), this.$t('crm.Html.followUpBoxTip1Title'), {
                                confirmButtonText: this.$t('crm.Html.followUpBoxTip1CancelButton'),
                                cancelButtonText: this.$t('crm.Html.followUpBoxTip1ConfirmButton')
                            }).then(() => {
                                this.followRecord = this.currentResource.attrValue;
                            }).catch(() => {
                            });
                        } else if (this.currentResource.attrValue) {
                            this.followRecord = this.currentResource.attrValue;
                        }
                    }
                }
                let obj = {};
                // 从 localStorage 取之前选择的来源渠道
                if (localStorage.getItem('leadsCloud-followupType')) {
                    try {
                        obj = JSON.parse(localStorage.getItem('leadsCloud-followupType'));
                    } catch (e) {
                        console.error(e);
                    }
                }
                // 存入 localStorage
                obj[this.userId] = val;
                localStorage.setItem('leadsCloud-followupType', JSON.stringify(obj));
            },
            set_default_time() {
                // this.visible_full_panel = true;
                this.$emit('update:visible_full_panel', true);
                this.$emit('visibleFullPanel');
                if (!this.datePicker_clicked) {
                    this.followRecord ? this.followRecord = String(this.followRecord) : this.followDate = (new Date()).format('yyyy-MM-dd hh:mm:ss');
                }
            },
            // 图片
            pasteFile(file) {
                if (this.filesList.length === 9) {
                    this.$Message.error(this.$t('crm.Modal.file_uploadLengthLimit9'));
                } else {
                    this.$refs.uploadImgCompo.handleUpload({
                        target: {
                            files: [file]
                        }
                    });
                }
            },
            onPaste(e) {
                if (document.activeElement === this.$refs.followUpTextArea) {
                    if (e.clipboardData || e.originalEvent) {
                        const cbd = e.clipboardData || e.originalEvent.clipboardData;
                        const ua = window.navigator.userAgent;

                        // 如果是 Safari 直接 return
                        if (!(e.clipboardData && e.clipboardData.items)) {
                            return;
                        }

                        // Mac平台下Chrome49版本以下 复制Finder中的文件的Bug Hack掉
                        if (cbd.items && cbd.items.length === 2 && cbd.items[0].kind === 'string' && cbd.items[1].kind === 'file' &&
                            cbd.types && cbd.types.length === 2 && cbd.types[0] === 'text/plain' && cbd.types[1] === 'Files' &&
                            ua.match(/Macintosh/i) && Number(ua.match(/Chrome\/(\d{2})/i)[1]) < 49) {
                            return;
                        }

                        for (let i = 0; i < cbd.items.length; i++) {
                            const item = cbd.items[i];
                            if (item.kind === 'file') {
                                const blob = item.getAsFile();
                                if (blob.size === 0) {
                                    break;
                                }
                                this.pasteFile(blob);
                                return;
                            }
                        }
                    }
                }
            },
            onDragOver(e) {
                e.preventDefault();
            },
            onDrop(e) {
                if (!this.visible_full_panel) return;
                e.preventDefault();
                const eTargetClass = e.target.className;
                if (eTargetClass.indexOf('input-panel') >= 0 ||
                    eTargetClass.indexOf('file-com') >= 0 ||
                    eTargetClass.indexOf('upload-btn') >= 0 ||
                    eTargetClass.indexOf('file-name') >= 0 ||
                    eTargetClass.indexOf('file-size') >= 0 ||
                    eTargetClass.indexOf('followup-content-edit-text') >= 0 ||
                    eTargetClass.indexOf('upload-btn-icon') >= 0 ||
                    eTargetClass.indexOf('file-list-box') >= 0) {
                    if (e.dataTransfer) {
                        const data = e.dataTransfer;
                        const files = [];
                        for (let i = 0; i < data.items.length; i++) {
                            const item = data.items[i];
                            if (item.kind === 'file') {
                                const blob = item.getAsFile();
                                if (blob.size === 0) {
                                    break;
                                }
                                files.push(blob);
                            }
                        }
                        this.dropFiles(files);
                    }
                }
            },
            dropFiles(files) {
                if (files.length) {
                    if (this.filesList.length === 9) {
                        this.$Message.error(this.$t('crm.Modal.file_uploadLengthLimit9'));
                    } else {
                        this.$refs.uploadImgCompo.handleUpload({
                            target: {
                                files
                            }
                        });
                    }
                }
            },
            // 快速任务
            save_task(taskEndTime, taskDetails) {
                const relatedInqDesc = JSON.stringify({
                    companyName: this.companyName,
                    companyId: this.companyId,
                    inquiryId: this.id,
                    inquirySeqNumber: this.inquirySeqNumber
                });
                const participantsJson = JSON.stringify([{
                    userId: this.userId,
                    userName: this.fullName
                }]);
                crmCommon.taskSave({
                    orgId: this.enterpriseId,
                    taskName: this.$t('crm.Html.followUpTaskName'),
                    taskEndTime: taskEndTime,
                    taskScheduleTime: taskEndTime,
                    remindType: 2,
                    remindTimeUnit: 1,
                    remindTimeValue: 0,
                    relatInquiryId: this.id,
                    relatInquiryDescription: relatedInqDesc,
                    taskDetails: taskDetails,
                    repeatType: 1,
                    taskStatus: 1,
                    relatObjType: 1,
                    participantsJson: participantsJson
                }).then(response => {
                    if (response.code === '1') {
                        this.$emit('change_flag_update_task');
                        const time = (new Date(taskEndTime)).getTime() - Date.now();
                        if (time > 0) {
                            this.$store.commit('setTaskChangeObj', {
                                id: JSON.parse(response.data).id,
                                type: this.$t('crm.Html.new'),
                                taskName: this.$t('crm.Html.followUpTaskName'),
                                taskEndTime: new Date(taskEndTime),
                                taskDetails: '',
                                time: time
                            });
                        } else if (time === 0) {
                            this.$store.dispatch('taskNotice', {
                                tip: this.$t('crm.Html.followUpTaskName'),
                                fromNick: taskEndTime,
                                text: ''
                            });
                        }
                        this.$Message.success(this.$t('crm.Html.success_createFollowUpTask'));
                    } else {
                        this.$Message.error(this.$t('crm.Html.error_createFollowUpTask'));
                    }
                });
            },
            change_task_custom_time(time) {
                this.task_popTip_visible = false;
                if (time) {
                    this.task_time_map.set(this.$t('crm.Html.custom'), this.custom_task_time);
                } else {
                    this.task_time_type = this.$t('crm.Html.threeDaysLater');
                    this.task_time_map.set(this.$t('crm.Html.custom'), (new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)).format('yyyy-MM-dd'));
                }
                this.$forceUpdate();
            },

            // 询盘跟进提交
            submitFollow() {
                if (!this.followDate || this.followDate.trim() === '') {
                    this.$Message.error(this.$t('crm.Html.error_emptyDateAndTime'));
                    return;
                }
                if (new Date(this.followDate).getTime() > Date.now()) {
                    this.$Message.error(this.$t('crm.Html.error_DateAndTime'));
                    return;
                }
                if (this.followRecord.trim() === '') {
                    this.$Message.error(this.$t('crm.Html.error_emptyFollowUpContent'));
                    return;
                }
                // if (this.followRecord.length > 2000) {
                //     this.followRecord = this.followRecord.slice(0, 2000);
                //     if (this.followRecord.trim() === '') {
                //         this.$Message.error(this.$t('crm.Html.error_emptyFollowUpContent'));
                //         return;
                //     }
                // }
                if (this.currentResource.numberStatus && (this.followRecord.length < Number(this.currentResource.number))) {
                    this.$Message.error(this.$t('crm.Html.followUpBoxTip2') + this.currentResource.number + this.$t('crm.Html.followUpBoxTip3'));
                    return;
                }
                if (this.resource.trim() === '') {
                    this.$Message.error(this.$t('crm.Html.error_emptyCommunicationChannel'));
                    return;
                }
                // 附件是否上传完成
                if (Array.isArray(this.filesList) && this.filesList.some(item => item.uploading)) {
                    this.$Message.warning(this.$t('crm.Modal.fileUoloading'));
                    return;
                }
                // 图片是否上传完成
                if (Array.isArray(this.pictureList) && this.pictureList.some(item => item.uploading)) {
                    this.$Message.warning(this.$t('crm.Modal.imageUploading'));
                    return;
                }
                if (this.currentResource.picturesStatus && !this.pictureList.length) {
                    this.$Message.error(this.$t('crm.Html.followUpBoxTip4'));
                    return;
                }
                if (this.currentResource.attachmentStatus && !this.filesList.length) {
                    this.$Message.error(this.$t('crm.Html.followUpBoxTip5'));
                    return;
                }
                let taskEndTime = '';
                if (this.task_is_checked) {
                    const temp_time = this.task_time_map.get(this.task_time_type);
                    if ([1, 2, 3, 4, 5].includes(temp_time)) {
                        taskEndTime = (new Date(Date.now() + temp_time * 24 * 60 * 60 * 1000)).format('yyyy-MM-dd 10:00:00');
                    } else if (!isNaN((new Date(temp_time)).getTime()) && (new Date(temp_time)).getTime() > Date.now()) {
                        taskEndTime = `${temp_time} 10:00:00`;
                    } else {
                        this.$Message.error(this.$t('crm.Html.error_followUpTime'));
                        return;
                    }
                }
                this.loading = true;

                // 根据保存跟进记录的类型不同(新增/编辑)来调整 url 和 sendData
                let url = '';
                const imageType = ['jpg', 'jpeg', 'png', 'gif'];
                // 图片
                const pictures = this.pictureList.map(item => item.url);
                // 附件
                const files = this.filesList.map(item => `${item.url}?name=${item.name}&type=${item.type}&size=${item.size}&fileType=${imageType.includes(item.type) ? 'image' : 'file'}&id=${item.id}`);
                const sendData = {
                    followupContent: this.followRecord,
                    followupTime: new Date(this.followDate).getTime(),
                    followupType: this.resource,
                    pictures: JSON.stringify(files),
                    attachment: JSON.stringify(pictures),
                    isCreateTask: this.task_is_checked ? 1 : 0,
                    companyId: this.companyId
                };
                if (this.editId) {
                    url = '/crm/followup/updateFollowupCommon';
                    sendData.followupId = this.editId;
                    sendData.eventActionId = this.editEventActionId;
                    sendData.targetType = this.editedFollowupData.target_type;
                    sendData.targetId = this.editedFollowupData.target_id;
                    sendData.updateUser = this.fullName;
                    sendData.updateUserId = this.userId;
                    sendData.orgId = this.enterpriseId;
                } else {
                    url = '/crm/followup/saveFollowupCommon';
                    sendData.enterpriseId = this.enterpriseId;
                    sendData.targetType = this.type_followUp;
                    sendData.targetId = this.id;
                    sendData.inquiryId = this.inquiryId;
                }

                if (url === '/crm/followup/saveFollowupCommon') {
                    triggerGtag('CRM', '询盘跟进记录');
                }
                util.ajax({
                    url,
                    method: 'post',
                    data: sendData
                }).then(response => {
                    this.loading = false;
                    if (response.data.code === '1') {
                        // 保存跟进任务
                        if (this.task_is_checked) {
                            this.save_task(taskEndTime, this.followRecord);
                        }

                        if (!this.editId) {
                            this.$emit('refreshCheck');
                            // 跟进次数 + 1 , 更新最近更新时间  逻辑已经转移之后台，暂时注释掉，测试没问题可以删除
                            // this.updateFollowup(response.data.data, sendData.followupContent);
                        } else {
                            // 不用 + 1 , 后台自动更新最近更新时间, 只需要前端自己刷新一下
                            // this.$emit('refreshCheck');
                        }

                        // 弹出成功提示语
                        this.$Message.success(this.$t('crm.Html.success_saveFollowUp'));
                        // 保存日志
                        // if (!this.editId) {
                        //     // 新建日志
                        //     const currentObj = {};
                        //     currentObj.followUpTime = this.followDate;
                        //     currentObj.followUpContent = this.followRecord;
                        //     currentObj.initiatorID = this.userId;
                        //     currentObj.initiatorName = this.fullName;
                        //     currentObj.communicationChannel = this.resourceList.find(item => item.value === this.resource).label;
                        //     currentObj.followUpPictures = this.filesList;
                        //     // this.$saveLog({
                        //     //     operateType: 8,
                        //     //     operateModule: 8,
                        //     //     inquiryId: this.inquiryId,
                        //     //     enterpriseId: this.enterpriseId,
                        //     //     userId: this.userId,
                        //     //     fullName: this.fullName,
                        //     //     currentObj: currentObj,
                        //     //     companyName: this.companyName,
                        //     //     seqNumber: this.inquirySeqNumber,
                        //     //     followUpId: this.followUpId
                        //     // });
                        // } else {
                        //     // 编辑日志
                        //     const currentObj = {};
                        //     currentObj.followUpTime = this.$options.filters.timeFormat(this.followDate, 'DateTime');
                        //     currentObj.followUpContent = this.followRecord;
                        //     currentObj.communicationChannel = this.resourceList.find(item => item.value === this.resource).label;
                        //     currentObj.followUpPictures = this.filesList;
                        //     const prevObj = {};
                        //     prevObj.followUpTime = this.$options.filters.timeFormat(this.editedFollowupData.followup_time, 'DateTime');
                        //     prevObj.followUpContent = this.editedFollowupData.followup_content;
                        //     const temp = this.resourceList.find(item => Number(item.value) === this.editedFollowupData.followup_type);
                        //     prevObj.communicationChannel = temp ? temp.label : '';
                        //     prevObj.followUpPictures = this.editedFollowupData.pictures;

                        //     // this.$saveLog({
                        //     //     operateType: 11,
                        //     //     operateModule: 8,
                        //     //     inquiryId: this.inquiryId,
                        //     //     enterpriseId: this.enterpriseId,
                        //     //     userId: this.userId,
                        //     //     fullName: this.fullName,
                        //     //     currentObj,
                        //     //     prevObj,
                        //     //     companyName: this.companyName,
                        //     //     seqNumber: this.inquirySeqNumber,
                        //     //     followUpId: this.followUpId
                        //     // });
                        // }
                        // 置空各种数据
                        this.datePicker_clicked = false;
                        this.close_input_panel();

                        // 新增跟进记录完毕, 向上触发 flag 变动通知外部
                        this.$emit('change_flag_new_followUp');
                    } else {
                        this.$Message.error(this.$t('crm.Html.error_saveFollowUp'));
                    }
                });
            },
            updateFollowup(followupId, followupContent) {
                let targetType;
                switch (this.type) {
                    case 'customer':
                    case 'highseasCustomer':
                        targetType = 1;
                        break;
                    case 'contact':
                        targetType = 2;
                        break;
                    case 'inquiry':
                        targetType = 3;
                        break;
                }
                crmClue.updateFollowupByFollowup({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    targetType,
                    targetId: this.id,
                    companyId: this.companyId,
                    message: followupContent,
                    followupId
                }).then(res => {
                    if (res.code === '1') {
                        this.$emit('refreshCheck');
                    } else {
                        console.error(res.data.message);
                    }
                });
            },

            /* 编辑跟进记录 */
            editFollowup(timelineData) {
                const data = timelineData.followup;
                if (data && data.id) {
                    /**
                     * @Description: 如果这条跟进状态已经创建过任务编辑的时候就不再创建任务
                     * @author mayuanzhi
                     * @date 2020/5/25
                     */
                    if (data.is_create_task) {
                        this.task_is_checked = false;
                        this.isDisabled = true;
                    }
                    this.editedFollowupData = data;
                    this.editId = data.id;
                    this.editEventActionId = timelineData.id;
                    this.followRecord = data.followup_content;
                    this.followDate = this.$options.filters.timeFormat(data.followup_time, 'DateTime');
                    this.filesList = data.pictures.concat();
                    this.pictureList = [];
                    const pictureList = data.attachment || [];
                    if (pictureList && pictureList.length) {
                        pictureList.forEach(item => {
                            let obj = {};
                            obj = {
                                url: item
                            };
                            this.pictureList.push(obj);
                        });
                    }
                    this.currentResource = this.resourceList.find(item => Number(item.value) === data.followup_type);
                    this.resource = this.currentResource ? this.currentResource.value : '00';
                    const followupCreateTimestamp = Date.parse(this.$options.filters.timeFormat(data.create_time, 'DateTime'));
                    this.followOptions = {
                        disabledDate(date) {
                            return date.getTime() > followupCreateTimestamp;
                        }
                    };
                    this.$emit('update:visible_full_panel', true);
                } else {
                    this.$Message.error(this.$t('crm.Html.errorOccurred'));
                }
            },
            dateformat() {
                Date.prototype.format = function(fmt) {
                    const o = {
                        'M+': this.getMonth() + 1, // 月份
                        'd+': this.getDate(), // 日
                        'h+': this.getHours(), // 小时
                        'm+': this.getMinutes(), // 分
                        's+': this.getSeconds(), // 秒
                        'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
                        S: this.getMilliseconds() // 毫秒
                    };
                    if (/(y+)/.test(fmt)) {
                        fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()
                        }`).substr(4 -
                            RegExp.$1.length));
                    }
                    for (const k in o) {
                        if (new RegExp(`(${k})`).test(fmt)) {
                            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
                                ? (o[k])
                                : ((`00${o[k]}`).substr((`${o[k]}`).length)));
                        }
                    }
                    return fmt;
                };
            },
            handleUploadFile() {
                this.$refs.uploadImgCompo.uploadTrigger();
            },
            handleUploadPicture() {
                this.$refs.uploadPictureCompo.uploadTrigger();
            }
        },
        created() {
            // 获取跟进方式数据
            this.$store.dispatch('getFollowUpType');
        },
        mounted() {
            document.addEventListener('paste', this.onPaste);
            document.addEventListener('dragover', this.onDragOver);
            document.addEventListener('drop', this.onDrop);
        },
        beforeDestroy() {
            document.removeEventListener('paste', this.onPaste);
            document.removeEventListener('dragover', this.onDragOver);
            document.removeEventListener('drop', this.onDrop);
        },
        watch: {
            followUpType: {
                handler(val) {
                    if (val) {
                        this.resourceList = val;
                        // 从 localStorage 取之前选择的来源渠道
                        if (localStorage.getItem('leadsCloud-followupType')) {
                            try {
                                const localResource = JSON.parse(localStorage.getItem('leadsCloud-followupType'))[this.userId];
                                this.currentResource = this.resourceList.find(item => item.value === localResource && item.isAvailable === 1);
                                this.resource = this.currentResource ? localResource : '00';
                            } catch (e) {
                                this.resource = '00';
                                this.currentResource = this.resourceList.find(item => item.value === this.resource);
                                console.error(e);
                            }
                        }
                    }
                }
            },
            // resource(val, oldVal) {
            //     // 用户变更跟进记录来源渠道时, 存入 localStorage , 实现"记住"功能, 以账号区分
            //     if (val) {
            //         let obj = {};
            //         // 从 localStorage 取之前选择的来源渠道
            //         if (localStorage.getItem('leadsCloud-followupType')) {
            //             try {
            //                 obj = JSON.parse(localStorage.getItem('leadsCloud-followupType'));
            //             } catch (e) {
            //                 console.error(e);
            //             }
            //         }
            //         // 存入 localStorage
            //         obj[this.userId] = val;
            //         localStorage.setItem('leadsCloud-followupType', JSON.stringify(obj));
            //         // 切换跟进记录需要同时切换对应的回填模板内容
            //         if (this.resourceList.some((item) => item.value === val) && this.visible_full_panel && !this.editId) {
            //             const arr = this.resourceList.filter((item) => item.value === val);
            //             this.followRecord = arr[0].attrValue || '';
            //         }
            //     }
            // },
            // 跟进记录全屏显示需要回填对应的模板内容
            visible_full_panel(val) {
                if (val) {
                    if (this.resourceList.some((item) => item.value === this.resource) && !this.editId) {
                        if (localStorage.getItem('leadsCloud-followupType')) {
                            const localResource = JSON.parse(localStorage.getItem('leadsCloud-followupType'))[this.userId];
                            this.currentResource = this.resourceList.find(item => item.value === localResource && item.isAvailable === 1);
                            this.resource = this.currentResource ? localResource : '00';
                        } else {
                            this.resource = '00';
                        }
                        this.resourceChange(this.resource);
                    }
                }
            },
            // 有 id 变更时, 清空输入框
            idStr: {
                handler(val) {
                    this.close_input_panel();
                },
                immediate: true
            }
        }
    };
</script>

<style scoped lang="less">
    .input-panel {
        width: 100%;
        position: relative;
        background: #FFFFFF;
        border: 1px solid #E6E6E6;
        border-radius: 4px;
        font-size: 12px;
        line-height: 0;
        > * {
            line-height: normal;
        }

        textarea {
            border-radius: 4px;
        }
    }

    .editArea-close {
        display: inline-block;
        position: absolute;
        right: 10px;
        top: 10px;
        cursor: pointer;
    }

    .input-panel-textarea {
        border: 0;
        outline: 0;
        resize: none;
        width: 100%;
        padding: 10px 25px 10px 10px;
        line-height: 16px;
    }

    .input-panel-bottom {
        height: 50px;
        line-height: 50px;
        vertical-align: middle;
        background: #f8f8f9;
        color: #656565;
        padding: 0 10px;
    }

    .followup_upload_picture {
        display: flex;
        flex-wrap: nowrap;
        flex-direction: row;
        margin-left: 10px;

        /deep/ .picture-item {
            margin-bottom: 0;
        }
    }

    .followup-content-edit-text {
        text-align: right;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.40);
        margin: 0 10px;
    }

    .followup-content-edit-text-limit {
        color: #FA8241;
    }
    .annex-file-icon{
        width: 14px;
        height: 16px;
        margin-right: 8px;
        vertical-align: middle;
        fill: currentColor;
        overflow: hidden;
    }
</style>
