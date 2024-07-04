<template>
    <li :class="{'task-container': true, 'task-finished': rawData.taskStatus !== 1}"
         @click="showTaskDetail">
        <div style="padding-bottom: 10px;border-bottom: 1px dashed #EAEAEA;">
            <div class="task-content">
                <!-- 已完成/未完成 标识 -->
                <Icon type="record"
                      class="task-content-item-status"></Icon>
                <!-- 任务名称 -->
                <TooltipAuto :content="rawData.taskName"
                             class="task-content-item-name"></TooltipAuto>
                <!-- 创建时间 -->
                <span class="task-content-item-createTime">{{ rawData.createTime | timeFormat("DateTimeHm") | timeOmiFormat }}</span>
            </div>
            <!-- 参与人 -->
            <TooltipAuto :content="$options.filters.parseArray(rawData.participantsJson).map(item => item.userName).join(', ')"
                         class="task-participants"></TooltipAuto>
        </div>

        <!-- 更多操作 -->
        <Poptip v-if="!isHighSeas"
                trigger="hover"
                placement="bottom-start"
                popper-class="task-operate-pop">
            <!-- trigger 按钮 -->
            <Icon slot="reference"
                  custom="custom custom-followup-more-operate"
                  size="14"
                  color="#7B98B6"
                  class="task-operate-trigger"></Icon>
            <!-- pop 弹窗 -->
            <ul class="_font_size12">
                <!-- 标记任务已完成/未完成 -->
                <li @click="flagTask"
                    class="piwik_companyDetail_flagTask">{{ rawData.taskStatus === 1 ? $t('mail.markAsFinished') : $t('crm.newDetail.markAsUncompleted') }}</li>
                <!-- 编辑任务 -->
                <li v-if="authorized_button.editTask"
                    @click="editTask">{{ $t('crm.UniSet.edit') }}</li>
                <!-- 删除任务 -->
                <li v-if="authorized_button.deleteTask"
                    @click="deleteTask">{{ $t('crm.Html.delete') }}</li>
            </ul>
        </Poptip>
    </li>
</template>

<script>
    import { mapState } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';

    export default {
        name: 'taskListItem',
        props: {
            rawData: {
                type: Object,
                default() {
                    return {};
                }
            },
            isHighSeas: {
            }
        },
        data() {
            return {};
        },
        computed: {
            ...mapState({
                button_list: state => state.app.button_list
            }), // 从 vuex 中获取属性
            authorized_button() {
                if (this.isHighSeas) {
                    return {};
                }

                const ids = BUTTON_IDS.CRM.inquiry;
                return {
                    editTask: !HANDLE_BUTTON(ids.edit.editTask, this.button_list),
                    deleteTask: !HANDLE_BUTTON(ids.edit.deleteTask, this.button_list)
                };
            }
        },
        methods: {
            // 显示任务详情
            showTaskDetail(row) {
                this.$emit('showTask', this.rawData.id);
            },
            // 编辑任务
            editTask() {
                this.$emit('editTask', this.rawData.id);
            },
            // 标记任务为已完成/未完成
            flagTask() {
                this.$emit('flagTask', this.rawData.id);
            },
            // 删除任务
            deleteTask() {
                this.$emit('deleteTask', this.rawData.id);
            }
        }
    };
</script>

<style lang="less" scoped>
    .task-container {
        position: relative;
        padding: 8px 0px 0;
        font-size: 12px;
        line-height: 18px;
        cursor: pointer;

        &:hover {
            background-color: #F6F7FA;

            .task-operate-trigger {
                visibility: visible;
            }
        }
    }

    .task-content {
        display: flex;
        align-items: center;

        &-item-status {
            transform: scale(.7);
            color: #4285F2;
            display: inline-block;
            margin-right: 6px;
        }

        &-item-name {
            color: rgba(0, 0, 0, 0.80);
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 14px;
        }

        &-item-createTime {
            color: rgba(0, 0, 0, 0.40);
        }
    }

    .task-participants {
        margin: 4px 20px 0 0;
    }

    .task-finished {
        .task-content {
            &-item-status {
                color: rgba(0, 6, 15, 0.40);
            }

            &-item-name {
                text-decoration: line-through;
            }
        }
    }

    .task-operate-trigger {
        position: absolute;
        right: 0px;
        bottom: 10px;
        visibility: hidden;
    }

    .task-operate-pop {
        min-width: 90px;

        li {
            height: 30px;
            line-height: 30px;
            padding: 0 16px;
            cursor: pointer;

            &:hover {
                background-color: #f3f4f7;
            }
        }
    }
</style>
