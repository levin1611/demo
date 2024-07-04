<template>
    <div v-loading="loading"
         :element-loading-text="$t('crm.Html.loading')"
         ref="container"
         class="drawer__followUp">
         <!-- 询盘 线索 时间轴 -->
        <template v-if="type !=='journeyDetail'">
            <time-line :disabled="disabled"
                    ref="crmDetailTimeLine"
                    :id="id"
                    :visitorId="currVisitorId"
                    :type="type"
                    :originalType="originalType"
                    :flag="flag"
                    :visible_full_panel="visible_full_panel"
                    @editFollowup="editFollowup"
                    v-on="$listeners"></time-line>
        </template>
        <template v-else>
            <visitorTimeLine
                :type="type"
                :from="from"
                :customerInfo="customerInfo"
                :currAccountInfo="currAccountInfo"
                :visitorId="currVisitorId"
                :fieldObj="fieldObj"
                @noData="noData"
                >
            </visitorTimeLine>
        </template>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import timeLine from '@/views/main-components/timeline/index.vue';
    import UploadPicture from '@/views/crm/Detail/Components/Html/uploadPicture';
    import visitorTimeLine from '@/views/main-components/little-drawer/components/visitor-timeLine.vue';
    import { triggerGtag } from '@/utils/base';

    export default {
        name: 'visitor-dynamic',
        components: {
            timeLine,
            UploadPicture,
            visitorTimeLine
        },
        props: [
            'from',
            'type',
            'originalType',
            'disabled',
            'id',
            'companyId',
            'inquiryId',
            'inquirySeqNumber',
            'inquiryManagerList',
            'companyName',
            'currVisitorId',
            'salesList',
            'followUpId',
            'flag_new_followUp',
            'flag_update_inquiry',
            'flag_update_task',
            'customerInfo',
            'currAccountInfo',
            'fieldObj'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                button_list: state => state.app.button_list
            }), // 从 vuex 中获取属性
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
            }

            //            filtedInquiryFollowUpList() {
            //                let temp = this.manuallyFollowUpList;
            //                if (this.initiator !== '') {
            //                    temp = temp.filter(item => {
            //                        if (item.create_user_id) {
            //                            return item.create_user_id + '' === this.initiator + '';
            //                        } else {
            //                            return true;
            //                        }
            //                    });
            //                }
            //                if (this.channel.length > 0) {
            //                    let temp_channel = this.channel.map(i => Number(i));
            //                    temp = temp.filter(item => {
            //                        return temp_channel.indexOf(item.followup_type) !== -1;
            //                    });
            //                }
            //                if (this.followupTime[0]) {
            //                    temp = temp.filter(item => {
            //                        return item.followup_time >=
            //                            Date.parse(this.followupTime[0]) &&
            //                            item.followup_time <=
            //                            Date.parse(this.followupTime[1]);
            //                    });
            //                }
            //
            //                temp.sort((a, b) => {
            //                    return b.followup_time - a.followup_time;
            //                });
            //                return temp;
            //            }, // 筛选后的询盘跟进数组
        },
        data() {
            return {
                isDisabled: false, // 是否禁止创建任务
                flag: false, // 是否刷新时间轴
                loading: false, // 加载中
                //                manuallyFollowUpList: [], // 客服添加的询盘跟进

                /* 询盘跟进 */
                visible_full_panel: false,
                followRecord: '', // 跟进记录
                datePicker_clicked: false, // 本轮(本次添加跟进记录)有点过
                followDate: (new Date()).format('yyyy-MM-dd hh:mm:ss'),
                followOptions: {
                    disabledDate(date) {
                        return date.getTime() > Date.now();
                    }
                }, // 跟进日期限制
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
                resource: '01', // 沟通渠道
                followType: 1, // 跟进类型

                /* 图片 */
                pictures: [], // 已上传图片列表

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
                initiator: '',
                // 沟通渠道
                channel: [],
                followupTime: [],

                /* 编辑跟进记录 */
                editId: null,
                editEventActionId: null,
                editedFollowupData: {}
            };
        },
        created() {
            // 从 localStorage 取之前选择的来源渠道
            if (localStorage.getItem('leadsCloud-followupType')) {
                try {
                    this.resource = JSON.parse(localStorage.getItem('leadsCloud-followupType'))[this.userId] || '01';
                } catch (e) {
                    console.error(e);
                }
            }
        },
        activated() {
            document.addEventListener('paste', this.onPaste);
            document.addEventListener('dragover', this.onDragOver);
            document.addEventListener('drop', this.onDrop);
        },
        deactivated() {
            document.removeEventListener('paste', this.onPaste);
            document.removeEventListener('dragover', this.onDragOver);
            document.removeEventListener('drop', this.onDrop);
        },
        methods: {
            // getManuallyFollowUps() {
            //     util.ajax({
            //         url: '/crm/followup/getFollowups',
            //         method: 'post',
            //         data: {
            //             targetId: this.id,
            //             targetType: this.type_followUp,
            //         }
            //     }).then(response => {
            //         if (response.data.code === '1') {
            //             this.manuallyFollowUpList = response.data.data.lists.map(item => {
            //                 item.icon = 'document-text';
            //                 item.isManually = true;
            //                 let temp = this.all_users_list.find(user => user.id + '' === item.create_user_id + '');
            //                 item.createUser_name = temp ? temp.fullname : item.create_user;
            //
            //                 if (item.pictures) {
            //                     try {
            //                         item.pictures = JSON.parse(item.pictures);
            //                     } catch (e) {
            //                     }
            //                 } else {
            //                     item.pictures = [];
            //                 }
            //
            //                 return item;
            //             });
            //         } else {
            //             this.$Message.error(this.$t('crm.Html.error_getManuallyFollowUpList'));
            //         }
            //         this.loading = false;
            //     });
            // },
            /* 清空 */
            close_input_panel() {
                this.visible_full_panel = false;
                this.followRecord = '';
                this.pictures = [];
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
                this.isDisabled = false;
            },

            /* 时间 */
            changeDate() {
                this.datePicker_clicked = true;
            },
            set_default_time() {
                this.visible_full_panel = true;
                if (!this.datePicker_clicked) {
                    this.followRecord ? this.followRecord = String(this.followRecord) : this.followDate = (new Date()).format('yyyy-MM-dd hh:mm:ss');
                }
            },

            /* 图片 */
            pasteImg(file) {
                if (this.pictures.length === 9) {
                    this.$Message.info(this.$t('crm.Modal.info_uploadLengthLimit9'));
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
                                this.pasteImg(blob);
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
                e.preventDefault();
                if (document.activeElement === this.$refs.followUpTextArea) {
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
                        this.dropImg(files);
                    }
                }
            },
            dropImg(files) {
                if (files.length) {
                    if (this.pictures.length === 9) {
                        this.$Message.info(this.$t('crm.Modal.info_uploadLengthLimit9'));
                    } else {
                        this.$refs.uploadImgCompo.handleUpload({
                            target: {
                                files
                            }
                        });
                    }
                }
            },

            /* 快速任务 */
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
                util.ajax({
                    url: '/crm/task/save',
                    method: 'post',
                    data: {
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
                        participantsJson: participantsJson
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$emit('update:flag_update_task', !this.flag_update_task);
                        const time = (new Date(taskEndTime)).getTime() - Date.now();
                        if (time > 0) {
                            this.$store.commit('setTaskChangeObj', {
                                id: JSON.parse(response.data.data).id,
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

            /* 询盘跟进提交 */
            submitFollow() {
                if (!this.followDate || this.followDate.trim() === '') {
                    this.$Message.error(this.$t('crm.Html.error_emptyDateAndTime'));
                    return;
                }
                if (new Date(this.followDate).getTime() > Date.now()) {
                    this.$Message.error(this.$t('crm.Html.error_DateAndTime'));
                    return;
                }
                // 图片是否上传完成
                if (Array.isArray(this.pictures) && this.pictures.some(item => item.uploading)) {
                    this.$Message.warning(this.$t('crm.Modal.imageUploading'));
                    return;
                }

                this.flag = false;
                if (this.followRecord.trim() === '') {
                    this.$Message.error(this.$t('crm.Html.error_emptyFollowUpContent'));
                    return;
                }
                if (this.followRecord.length > 2000) {
                    this.followRecord = this.followRecord.slice(0, 2000);
                    if (this.followRecord.trim() === '') {
                        this.$Message.error(this.$t('crm.Html.error_emptyFollowUpContent'));
                        return;
                    }
                }
                if (this.resource.trim() === '') {
                    this.$Message.error(this.$t('crm.Html.error_emptyCommunicationChannel'));
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
                const pictures = this.pictures.map(item => item.url);
                const sendData = {
                    followupContent: this.followRecord,
                    followupTime: new Date(this.followDate).getTime(),
                    followupType: this.resource,
                    pictures: JSON.stringify(pictures),
                    isCreateTask: this.task_is_checked ? 1 : 0,
                    companyId: this.companyId
                };
                if (this.editId) {
                    url = '/crm/followup/updateFollowupCommon';

                    sendData.followupId = this.editId;
                    sendData.eventActionId = this.editEventActionId;
                    sendData.targetType = this.editedFollowupData.target_type;
                    sendData.targetId = this.editedFollowupData.target_id;
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
                            // 跟进次数 + 1 , 更新最近更新时间
                            this.updateFollowup(response.data.data, sendData.followupContent);
                        } else {
                            // 不用 + 1 , 后台自动更新最近更新时间, 只需要前端自己刷新一下
                            this.$emit('refreshCheck');
                        }

                        // 弹出成功提示语
                        this.$Message.success(this.$t('crm.Html.success_saveFollowUp'));
                        // 保存日志
                        if (!this.editId) {
                            // 新建日志
                            const currentObj = {};
                            currentObj.followUpTime = this.followDate;
                            currentObj.followUpContent = this.followRecord;
                            currentObj.initiatorID = this.userId;
                            currentObj.initiatorName = this.fullName;
                            currentObj.communicationChannel = this.resourceList.find(item => item.value === this.resource).label;
                            currentObj.followUpPictures = pictures;
                            this.$saveLog({
                                operateType: 8,
                                operateModule: 8,
                                inquiryId: this.inquiryId,
                                enterpriseId: this.enterpriseId,
                                userId: this.userId,
                                fullName: this.fullName,
                                currentObj: currentObj,
                                companyName: this.companyName,
                                seqNumber: this.inquirySeqNumber,
                                followUpId: this.followUpId
                            });
                        } else {
                            // 编辑日志
                            const currentObj = {};
                            currentObj.followUpTime = this.$options.filters.timeFormat(this.followDate, 'DateTime');
                            currentObj.followUpContent = this.followRecord;
                            currentObj.communicationChannel = this.resourceList.find(item => item.value === this.resource).label;
                            currentObj.followUpPictures = pictures;
                            const prevObj = {};
                            prevObj.followUpTime = this.$options.filters.timeFormat(this.editedFollowupData.followup_time, 'DateTime');
                            prevObj.followUpContent = this.editedFollowupData.followup_content;
                            const temp = this.resourceList.find(item => Number(item.value) === this.editedFollowupData.followup_type);
                            prevObj.communicationChannel = temp ? temp.label : '';
                            prevObj.followUpPictures = this.editedFollowupData.pictures;

                            this.$saveLog({
                                operateType: 11,
                                operateModule: 8,
                                inquiryId: this.inquiryId,
                                enterpriseId: this.enterpriseId,
                                userId: this.userId,
                                fullName: this.fullName,
                                currentObj,
                                prevObj,
                                companyName: this.companyName,
                                seqNumber: this.inquirySeqNumber,
                                followUpId: this.followUpId
                            });
                        }

                        // 置空各种数据
                        this.datePicker_clicked = false;
                        this.followRecord = '';
                        this.pictures = [];
                        this.editId = null;
                        this.editEventActionId = null;
                        this.editedFollowupData = {};
                        this.followOptions = {
                            disabledDate(date) {
                                return date.getTime() > Date.now();
                            }
                        };

                        // 如果有 change_flag_new_followUp , 则调用 change_flag_new_followUp 改变 flag_new_followUp , 触发所有详情页 drawer 重新请求时间轴数据操作
                        // 否则直接刷新当前详情页 drawer 时间轴
                        if (this.$listeners.change_flag_new_followUp) {
                            this.$listeners.change_flag_new_followUp();
                        } else {
                            this.flag = true;
                        }
                        /**
                         * @Description: 提交成功后要重置创建任务的CheckBox的disabled
                         * @author mayuanzhi
                         * @date 2020/5/25
                         */
                        this.isDisabled = false;
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
                util.ajaxJson({
                    url: '/report/rules/updateFollowupByFollowup',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        targetType,
                        targetId: this.id,
                        companyId: this.companyId,
                        message: followupContent,
                        followupId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.$emit('refreshCheck');
                    } else {
                        console.error(res.data.message);
                    }
                });
            },

            /* 筛选部分 */
            filterCancel() {
                this.initiator = '';
                this.channel = [];
                this.followupTime = [];
            },

            /* 编辑跟进记录 */
            editFollowup(timelineData) {
                const data = timelineData.followup;
                console.log(timelineData);
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
                    this.pictures = data.pictures.map(item => {
                        return {
                            url: item
                        };
                    });
                    const temp = this.resourceList.find(item => Number(item.value) === data.followup_type);
                    this.resource = temp ? temp.value : '01';

                    const followupCreateTimestamp = Date.parse(this.$options.filters.timeFormat(data.create_time, 'DateTime'));
                    this.followOptions = {
                        disabledDate(date) {
                            return date.getTime() > followupCreateTimestamp;
                        }
                    };

                    this.visible_full_panel = true;
                    this.$nextTick(() => {
                        this.jumpToEditArea();
                    });
                } else {
                    this.$Message.error(this.$t('crm.Html.errorOccurred'));
                }
            }, // 接收子组件传来的要编辑的 followUpData
            jumpToEditArea() {
                // 若 div 已有部分在视口之外, 则页面定位到编辑框
                if (this.$refs.container.getBoundingClientRect().top - 60 < 0 || this.$refs.container.getBoundingClientRect().top - window.innerHeight > 0) {
                    this.$refs.container.scrollIntoView(true);
                }
            }, // 页面定位到编辑框
            noData(type) {
                this.$emit('noData',type)
            }
        },
        watch: {
            flag_new_followUp() {
                this.flag = false;
                this.$nextTick(() => {
                    this.flag = true;
                });
            },
            flag_update_inquiry() {
                this.flag = false;
                this.$nextTick(() => {
                    this.flag = true;
                });
            },
            followRecord() {
                if (this.followRecord.length > 2000) {
                    this.followRecord = this.followRecord.slice(0, 2000);
                }
            },
            resource(val) {
                // 用户变更跟进记录来源渠道时, 存入 localStorage , 实现"记住"功能, 以账号区分
                if (val) {
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
                }
            }
        }
    };
</script>

<style lang="less">

</style>

