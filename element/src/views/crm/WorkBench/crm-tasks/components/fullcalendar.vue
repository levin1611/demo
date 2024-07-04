<template>
    <div class="workbench-calendar">
        <TaskModals
                :type="modleType"
                :taskObjProp.sync="taskDetail"
                :visible.sync="modleShow"
                :fromModule="fromModule || 'workBench'"
                refreshMethodName="handleRefetchEvents">
        </TaskModals>
        <div id='calendar'></div>
    </div>
</template>

<script>
    import $ from 'jquery';
    import 'fullcalendar';
    import '../../src/fullcalendar.min.css';
    import TaskModals from '@/views/crm/Detail/Components/Modal/taskModals';
    import { WorkBench } from '@/api/crm/index';
    const { getCalendarList, getWorkendTaskDetail, getDepartUserByUserId } = WorkBench;

    export default {
        name: 'fullcalendar',
        components: { TaskModals },
        computed: {
            isRefrashTaskList() {
                return this.$store.state.dashboard.is_refrash_task_list;
            }
        },
        props: {
            view: String,
            letCalendarRefresh: Boolean,
            fromModule: String
        },
        data() {
            return {
                modleType: '',
                modleShow: false,
                taskDetail: '',
                events: [],
                userId: this.$store.state.userId,
                enterpriseId: this.$store.state.enterpriseId,
                userIds: [], // 管理者下用户Id
                color: '#6289C9',
                taskStatus: 0,
                checkboxHtml: []
            };
        },
        methods: {
            /* 初始化日历插件fullcalendar */
            calendarInit() {
                const that = this;
                $('#calendar').fullCalendar({
                    defaultView: that.view,
                    locale: that.$t('crm.WorkBench.locale'),
                    timezone: 'local',
                    height: 795,
                    header: {
                        left: '',
                        center: 'prev title next',
                        right: 'newButton'
                    },
                    // contentHeight: ,
                    views: { // 设置标题日期显示类型
                        month: {
                            titleFormat: 'YYYY-M',
                            displayEventTime: false // allDay等于false是可以用来设置不显示时间
                        },
                        listWeek: {
                            titleFormat: 'YYYY-M-D',
                            noEventsMessage: that.$t('crm.WorkBench.noTask')// 没有任务时显示的提示
                            // columnFormat:"M.D dddd",
                            // allDaySlot:false,   //是否显示all-day行
                        },
                        day: {
                            titleFormat: 'YYYY-M-D dddd'
                            // columnFormat:"M/D dddd"
                        }
                    },
                    eventLimit: true,    // 是否限制每天日程显示个数
                    events: function(start, end, timezone, callback) {
                        const date = this.getDate().format('YYYY-MM');
                        // const startDate = start.unix().format('YYYY-MM-DD');
                        // const endDate = end.unix().format('YYYY-MM-DD');
                        // console.log(startDate)
                        // console.log(endDate)
                        const monthData = {
                            taskStatus: that.taskStatus,
                            orgId: that.enterpriseId,
                            participantsId: that.userId,
                            month: date
                        };
                        const searchData = {
                            taskStatus: that.taskStatus,
                            orgId: that.enterpriseId,
                            participantsId: that.userId,
                            // month: date,
                            admin: 1,
                            searchType: 'dateSearch',
                            startDate: start.format('YYYY-MM-DD'),
                            endDate: end.format('YYYY-MM-DD'),
                            userIds: that.userIds.join(',')
                        };
                        const monthView = that.view === 'month';
                        getCalendarList(monthView ? monthData : searchData).then(response => {
                            if (response.code == 1) {
                                const events = response.data;
                                if (monthView) {
                                    events.forEach(item => {
                                        /**
                                         * @Description: 已完成任务添加class
                                         * @author mayuanzhi
                                         * @date 2020/8/27
                                        */
                                        if (item.done === true) {
                                            that.$set(item, 'className', 'event-done');
                                        }
                                    });
                                } else {
                                    events.forEach(item => {
                                        const participants = [];
                                        JSON.parse(item.participantsJson).forEach(element => {
                                            participants.push(element.userName);
                                        });
                                        that.$set(item, 'title', `${item.title}
															${that.$t('crm.WorkBench.participants')}：${participants.join(',')}`);
                                        /**
                                         * @Description: 已完成任务添加class
                                         * @author mayuanzhi
                                         * @date 2020/8/27
                                         */
                                        if (item.done === true) {
                                            that.$set(item, 'className', 'event-done');
                                        }
                                    });
                                }
                                callback(events);
                            }
                        });
                    },
                    timeFormat: 'HH:mm', // 设置的是添加的日程上显示的时间
                    customButtons: {
                        newButton: {
                            text: that.$t('crm.WorkBench.newTask'),

                            click: function() {
                                that.modleType = 'newTask';
                                if (that.modleShow) {
                                    that.modleShow = false;
                                }
                                ;
                                setTimeout(() => {
                                    that.modleShow = true;
                                }, 1);
                            }
                        }
                    },
                    dayClick: function(date, allDay, jsEvent, view) {
                        that.modleType = 'newTask';
                        if (that.modleShow) {
                            that.modleShow = false;
                        }
                        ;
                        setTimeout(() => {
                            that.modleShow = true;
                        }, 1);
                    },
                    // 点击日历中某个事件时触发
                    eventClick: function(event, jsEvent, view) {
                        getWorkendTaskDetail({
                            id: event.id
                        }).then(response => {
                            if (response.code == 1) {
                                that.taskDetail = response.data;
                                that.modleType = 'showTask';
                                if (that.modleShow) {
                                    that.modleShow = false;
                                }
                                setTimeout(() => {
                                    that.modleShow = true;
                                }, 1);
                            }
                        });
                    }
                });
                // 根据销售人员筛选
                // const DIV_dropdown = $(`<div class="dropdown"><button class="fc-state-default" style="border-radius:4px">${that.$t('crm.WorkBench.saleName')}</button><div>`);
                // const DIV_dropdownContent = $('<div class="dropdown-content"></div>');
                // DIV_dropdownContent.append(...that.checkboxHtml);
                // DIV_dropdown.append(DIV_dropdownContent);
                // if (that.view === 'listWeek') {
                //     $('.fc-right').prepend(DIV_dropdown);
                // }
                // $('input[name=all]').click(function() {
                //     if (this.checked) {
                //         $(':checkbox').prop('checked', true);
                //     } else {
                //         $(':checkbox').prop('checked', false);
                //     }
                // });
                // const s = $('.dropdown-content > input');
                // s.each(function(i) {
                //     $(this).click(function() {
                //         const ids = [];
                //         for (const item of s) {
                //             if (item.name !== 'all') {
                //                 if (item.checked === true) {
                //                     ids.push(item.value);
                //                 }
                //             }
                //         }
                //         if (ids.length === s.length - 1) {
                //             $('input[name=all]').prop('checked', true);
                //         } else {
                //             $('input[name=all]').prop('checked', false);
                //         }
                //         that.userIds = ids;
                //         $('#calendar').fullCalendar('refetchEvents');
                //         console.log(ids);
                //     });
                // });
                // 根据任务状态筛选
                const searchByStateHtml = `<select id="searchByState">
										<option value="allTasks">${that.$t('crm.WorkBench.allTask')}</option>
										<option value="finishedTasks" class="workbench-viewcompletedtasks">${that.$t('crm.WorkBench.finishedTask')}</option>
										<option value="unfinishedTasks" class="workbench-viewunfinishedtasks">${that.$t('crm.WorkBench.unfinishedTask')}</option>
									</select>`;
                $('.fc-right').append(searchByStateHtml);
                $('#searchByState').bind('change', function() {
                    switch ($(this).val()) {
                        case 'allTasks':
                            that.taskStatus = 0;
                            $('#calendar').fullCalendar('refetchEvents');
                            break;
                        case 'finishedTasks':
                            that.taskStatus = 2;
                            $('#calendar').fullCalendar('refetchEvents');
                            break;
                        case 'unfinishedTasks':
                            that.taskStatus = 1;
                            $('#calendar').fullCalendar('refetchEvents');
                            break;
                    }
                });
            },
            /* 重新渲染日历事件 */
            handleRefetchEvents() {
                $('#calendar').fullCalendar('refetchEvents');
                this.$emit('isCalendarRefresh', true);
            },
            deleteFinished() {
                this.handleRefetchEvents();
            },
            /** 根据用户获取该用户同一部门下所有用户列表 */
            getDepartUser() {
                getDepartUserByUserId({
                    orgId: this.$store.state.enterpriseId,
                    admin: 1,
                    userId: this.userId
                }).then(response => {
                    if (response.code == '1') {
                        this.checkboxHtml = [];

                        const node_checkbox = $('<input type="checkbox" name="all" value="" checked="checked" />');
                        const node_text = $('<span></span>');
                        node_text.text(this.$t('crm.WorkBench.selectAll'));
                        const node_br = $('<br/>');
                        this.checkboxHtml.push(node_checkbox, node_text, node_br);

                        const dataList = response.data;
                        for (const item of dataList) {
                            this.userIds.push(item.key);

                            const node_checkbox = $(`<input type="checkbox" name="${item.key}" value="${item.key}" checked="checked" />`);
                            const node_text = $('<span></span>');
                            node_text.text(item.value);
                            const node_br = $('<br/>');
                            this.checkboxHtml.push(node_checkbox, node_text, node_br);
                        }
                    }
                    this.calendarInit();
                });
            },
            refrashList(user) {
                this.userIds = user;
                $('#calendar').fullCalendar('refetchEvents');
            }
        },
        created() {

        },
        mounted() {
            this.getDepartUser();
        },
        beforeDestroy() {
            $('#calendar').fullCalendar('destroy');
        },
        watch: {
            letCalendarRefresh(val) {
                if (val === true) {
                    this.handleRefetchEvents();
                    // $('#calendar').fullCalendar('refetchEvents');
                    // this.letCalendarRefresh=false
                }
            },
            isRefrashTaskList() {
                this.handleRefetchEvents();
            }
        }
    };
</script>

<style lang="less">
    .workbench-calendar {
        .fc-unthemed .fc-popover{
            padding-bottom: 15px;
        }
        /*height: 550px;*/
        .fc-right {
            #searchByState {
                width: 100px;
                height: 34px;
                border-radius: 4px;
                border-color: #CBD6E2;
                padding-left: 5px;
                font-size: 12px;
                margin-left: 20px;
            }

            .dropdown {
                position: relative;
                display: inline-block;
            }

            .dropdown-content {
                display: none;
                position: absolute;
                background-color: #f9f9f9;
                width: 150px;
                max-height: 350px;
                word-wrap: break-word;
                word-break: break-all;
                overflow-y: auto;
                box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
                padding: 4px;
                z-index: 9;
                text-align: left;
            }

            .dropdown:hover .dropdown-content {
                display: block;
            }

            .fc-newButton-button {
                border: none;
            }
        }
        .fc-center {
            h2 {
              margin-top: 3px;
            }
        }

        .fc-next-button, .fc-prev-button {
            border: none;
            background: none;
            box-shadow: none;
            color: #7B98B6;
        }
        .fc-event{
            background-color: #FFFFFF;
            color: rgba(0,0,0,0.80);
            border: none;
            line-height: 18px;
        }
        .fc-event:hover{
            color: rgba(0,0,0,0.80);
        }
        .fc-content{
            text-overflow: ellipsis;
            position: relative;
            padding-left: 10px;
        }
        .fc-content:before{
            content: '';
            background-color: #4285F2;
            position: absolute;
            left: 1px;
            top: 6px;
            width: 6px;
            height: 6px;
            border-radius: 3px;
        }
        .fc-unthemed td.fc-today {
            background-color: #FFFFFF;
            border-color: #ddd;
            .fc-day-number{
                width: 24px;
                height: 24px;
                border-radius: 12px;
                background-color: #4285F2;
                color: #ffffff;
                padding: 0;
                text-align: center;
            }
        }
        .fc-ltr .fc-basic-view .fc-day-top .fc-day-number{
            float: left;
            margin-left: 16px;
        }
        .fc-day-top{
            padding-top: 5px;
        }
        .fc-widget-header{
            .fc-mon, .fc-tue, .fc-wed, .fc-thu, .fc-fri, .fc-sat, .fc-sun{
                text-align: left;
                border-color: #fff;
                height: 54px;
                line-height: 54px;
                padding-left: 16px;
            }
        }
        .fc-right{
            .fc-state-default.fc-corner-right{
                background-color: #7B98B6;
                background-image: none;
                color: #fff;
                font-size: 12px;
                height: 34px;
                width: 80px;
                text-shadow: none;
                box-shadow: none;
            }
        }
        .fc-unthemed .fc-popover .fc-header {
            background: #fff;
            padding: 4px 5px 0;
        }
        .event-done{
            text-decoration-line: line-through;
            color: #999999;
            .fc-content:before{
                content: '';
                background-color: #999999;
                position: absolute;
                left: 1px;
                top: 6px;
                width: 6px;
                height: 6px;
                border-radius: 3px;
            }
        }
    }
</style>
