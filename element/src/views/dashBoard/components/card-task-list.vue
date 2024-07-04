<template>
    <div class="task_container">
        <Card class="task_card">
            <div class="task_card_header dashboard-title _f _j_b">
                <span>{{$t('dashBoardV2.Title.task')}}</span>
                <Icon custom="custom-plus" size="14" class="hoverBtn piwik_add_task" @click="addNewTask" style="line-height: 23px;color: #677F99"></Icon>
            </div>
            <div class="task_card_body" ref="task_body" @mouseenter="ctrlScroll(1)" @mouseleave="ctrlScroll(0)" style="padding-right: 10px">
                <div class="empty_content" v-if="!taskList.length">
                    <img src="../../../svg/no-data.svg" alt="">
                    <p class="empty_data_tips">{{$t('dashBoardV2.Task.noData')}}</p>
                </div>
                <div class="task_list" v-else>
                    <ul>
                        <li v-for="item in taskList" class="task_item _f _j_b" @click="getTaskDetail(item.id)">
                            <Tooltip :content="item.title" placement="top">
                                <span :class="item.done ? 'task_done' : 'task_name'">{{item.title}}</span>
                            </Tooltip>
                            <span class="task_time" :class="{'time_done': item.done}">{{getHoursAndMins(item.start)}}</span>
                        </li>
                    </ul>
                </div>
            </div>
<!--            <div style="position: fixed;bottom: 5px; right: 5px" v-if="isConfig">-->
<!--                <Icon custom="custom-delete-component" size="36" @click="removeFromDashBoard"></Icon>-->
<!--            </div>-->
            <deleteIcon @removeFromDashBoard="removeFromDashBoard" style="position: absolute;bottom: 0px; right: 0px"/>
        </Card>
        <TaskModals :visible.sync="modalShow"
                    :type="modalTask"
                    fromModule="cardTaskList"
                    :taskObjProp.sync="taskDetail"
                    @getTaskList="getTaskRefresh"></TaskModals>
    </div>
</template>

<script>
    import util from '../../../libs/util';
    import { mapState } from 'vuex';
    import TaskModals from '@/views/crm/Detail/Components/Modal/taskModals';
    import { getTodayTaskList, getTaskDetail } from '@/api/dashBoard/dashBoardV2';
    import deleteIcon from './deleteIcon';
    export default {
        name: 'card-task-list',
        components: {
            TaskModals,
            deleteIcon
        },
        computed: {
            ...mapState({
                orgId: state => state.enterpriseId,
                userId: state => state.userId
            }),
            isConfig() {
                return this.$store.state.dashboard.isConfiguring;
            }
        },
        data() {
            return {
                taskList: [], // 今日任务列表
                modalShow: false,
                modalTask: 'newTask',
                taskDetail: [],
            }
        },
        methods: {
            addNewTask() {
                this.modalShow = true;
                this.modalTask = 'newTask';
            },
            init() {
                this.getTaskList();
            },
            async getTaskList() {
                const data = {
                    taskStatus: 0, // 根据需求要求 查询所有的任务 已完成的任务样式与日历保持一致
                    orgId: this.orgId,
                    participantsId: this.userId,
                    admin: 0,
                    searchType: 'dateSearch',
                    startDate: this.dateFormat(Date.now()),
                    endDate: this.dateFormat(Date.now())
                };
                const res = await getTodayTaskList(data);
                if (res.code === '1') {
                    const temp = res.data;
                    /**
                     * 今日任务列表 按照截止时间正序排列
                     * 如果截止时间相同的话按照创建时间正序排列
                     * 接口返回按照创建时间倒序排列
                     * */
                    if (Array.isArray(temp) && temp.length) {
                        temp.sort((a, b) => {
                            if (Date.parse(a.start) === Date.parse(b.start)) {
                                return -1;
                            }
                            return Date.parse(a.start) - Date.parse(b.start);
                        });
                        this.taskList = temp;
                    } else {
                        this.taskList = [];
                    }
                }
            },
            dateFormat(timeStamp, divider = '-') {
                let time = new Date(timeStamp);
                let y = time.getFullYear();
                let m = time.getMonth() + 1;
                m = m < 10 ? '0' + m : m;
                let d = time.getDate();
                d = d < 10 ? '0' + d : d;
                return `${y}${divider}${m}${divider}${d}`;
            },
            getHoursAndMins(str) {
                let len = str.length;
                return str.substring(len - 8, len - 3);
            },
            async getTaskDetail(id) {
                const res = await getTaskDetail({
                    id: id
                });
                if (res.code === '1') {
                    this.taskDetail = res.data;
                    this.modalTask = 'showTask';
                    this.modalShow = true;
                } else {
                    this.$Message.error('获取任务详情失败, 请重试');
                }
            },
            getTaskRefresh() {
                console.log('getTaskFromTaskModals');
                this.getTaskList();
                this.$emit('refreshCalender');
            },
            ctrlScroll(type) {
                const dom = this.$refs.task_body;
                if (type === 1) {
                    dom.style.overflowY = 'overlay';
                } else {
                    dom.style.overflowY = 'hidden';
                }
            },
            removeFromDashBoard() {
                this.$emit('removeFromDashBoard', 'taskCard');
            }
        },
        created() {
            this.init();
        }
    };
</script>

<style scoped lang="less">
    .dashboard-title {
        font-size: 20px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.8);
        padding-right: 8px;
    }
    .task_list {
        .task_name:before {
            content: "";
            width: 6px;
            height: 6px;
            display: inline-block;
            border-radius: 3px;
            background: #4F8EFF;
            vertical-align: middle;
            margin-right: 4px;
        }
        .task_name {
            width: 90%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        li {
            font-family: PingFangSC-Regular;
            font-size: 13px;
            color: rgba(0,0,0,0.80);
            letter-spacing: 0;
            line-height: 20px;
            margin-bottom: 20px;
        }
    }
    .task_card_body {
        margin-top: 20px;
        height: calc(100% - 30px);
        /*overflow: scroll;*/
    }
    .task_card {
        height: 100%;
        border-radius: 8px;
    }
    .hoverBtn {
        cursor: pointer
    }
    .empty_content {
        text-align: center;
        transform: translateY(-60%);
        width: 100%;
        position: relative;
        top: 40%;
    }
    .task_container {
        height: 100%;
        width: 100%;
        border-radius: 8px;
    }
    /deep/ .el-card__body {
        height: 100%;
    }
    .empty_data_tips {
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: rgba(0,0,0,0.80);
    }
    .task_done:before{
        content: "";
        width: 6px;
        height: 6px;
        display: inline-block;
        border-radius: 3px;
        background: #999999;
        vertical-align: middle;
        margin-right: 4px;
    }
    .task_done {
        width: 70%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-decoration-line: line-through;
        color: #999;
    }
    .time_done {
        color: #999;
    }
</style>
