<template>
    <div style="padding: 0px; overflow:auto"
         :class="`messager-info ${little ? 'little-messager' : ''}`"
        id="timelineBox">
        <div
            v-if="messagerData.length === 0"
            style="margin-top: 60px; text-align: center; color: #999"
        >
            {{ $t('timeLine.noData') }}
        </div>
        <Timeline v-else>
            
            <TimelineItem v-for="(item, index) in messagerData" :key="index">
                <div slot="dot"
                     class="timeline-dot">
                    <img src="@/styles/customFont/svg/Facebook.svg"></img>
                </div>
                <FacebookItem :item="item"
                            :type="type"
                            @viewContact="viewContact"
                            v-on="$listeners"></FacebookItem>
            </TimelineItem>
        </Timeline>
    </div>
</template>

<script>
import lodash from 'lodash';
import utils from '@/utils';
import FacebookItem from '@/views/main-components/timeline/facebook-interaction/facebookItem';

export default {
    name: 'FacebookInteractionInfo',
    props: ['propsData', 'little', 'type'],
    components: {
        FacebookItem
    },
    data() {
        return {
            messagerData: []
        };
    },
    watch: {
        propsData: {
            handler: function (val) {
                this.messagerData = val;
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        // 更改展示状态
        changeShowStatus(index, status) {
            this.messagerData[index].messageShow = status;
        },
        // 访客状态枚举对应
        enumVisitorStatus(status) {
            switch (status) {
                case 101:
                    return '线索';
                case 102:
                    return '询盘';
                case 1:
                    return '未录入';
                case 2:
                    return '无关';
                default:
                    return '未录入';
            }
        },
        formatDate(time) {
            return this.$dym.dateFormat('YYYY-mm-dd HH:MM:SS', new Date(time));
        },
        // 获取文件icon
        getFileIcon(val) {
            const fileName = val.substring(val.lastIndexOf('.'));
            switch (fileName) {
                case '.xls':
                    return 'custom custom-file-xls';
                case '.xlsx':
                    return 'custom custom-file-xls';
                case '.doc':
                    return 'custom custom-file-doc';
                case '.docx':
                    return 'custom custom-file-doc';
                case '.pdf':
                    return 'custom custom-file-pdf';
                default:
                    return '';
            }
        },
        // 获取文件名
        getFileName(val) {
            return val.substring(val.lastIndexOf('/')).substring(1, val.lastIndexOf('.'));
        },
        // 下载文件
        downloadFile(path) {
            window.open(path);
        },
        viewContact(item){
            this.$Message.error('当前联系人未建档');
        },
    }
};
</script>

<style scoped lang="less">
.message-file {
    text-align: left;
    position: relative;
    display: inline-block;
    padding: 10px;
    margin-bottom: 8px;
    margin-right: 8px;
    width: 233px;
    height: 68px;
    background: #ffffff;
    border: 1px solid #eaeaea;
    border-radius: 4px;

    .message-file-name {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.8);
        margin: 0 10px;
        display: inline-flex;
        width: 130px;
        line-height: 48px;
        vertical-align: middle;

        .message-file-name-without-ext {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .message-file-name-ext {
            white-space: nowrap;
        }
    }
}
.messager-info {
    padding: 0 20px;
    max-height: calc(100vh - 300px);
    overflow-y: auto;
}
.timeline-fb-messager {
    background-color: #f9fbfd;
    padding: 10px 16px;
    border-radius: 4px;
    margin-bottom: 10px;
    min-height: 50px;
}
.messager-header-item-title {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
}
.messager-header-item {
    .messager-header-title {
        font-weight: 700;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.8);
    }
    .messager-header-time {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
    }
    .messager-header-synopsis,
    .messager-header-remark,
    .messager-header-visitor-status {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.8);
    }
}
.messager-header-remark,
.messager-header-visitor-status {
    width: 50%;
    text-align: left;
    display: inline-block;
}
.little-messager {
    &.messager-info {
        max-height: calc(100vh - 250px);
    }
    .messager-header-remark,
    .messager-header-visitor-status {
        width: 100%;
        display: block;
    }
}
.custom-collapse-arrow {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.4);
    margin-left: 5px;
    cursor: pointer;
    transform: scale(0.8);
}
.message-list {
    border-top: 1px dashed #eaeaea;
    margin-top: 15px;
    padding-top: 15px;
    .message-item {
        margin-bottom: 15px;
    }
}
.message-box {
    display: flex;
    justify-content: space-between;
    .message-item-info {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: flex-start;
        .message-img {
            width: 32px;
            height: 32px;
            border-radius: 100%;
            overflow: hidden;
            margin-right: 12px;
            img {
                width: 100%;
                height: auto;
            }
        }
    }
    .message-info-box {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        line-height: 18px;
        .message-name {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
        }
        .message-detail {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.8);
        }
    }
    .message-item-time {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.4);
        line-height: 18px;
    }
}
.messager-origin {
    text-align: center;
    > a {
        font-size: 12px;
        color: #ff752a;
        line-height: 18px;
    }
}
.message-box-time {
    .message-item-time {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.4);
        line-height: 18px;
        text-align: right;
    }
    .message-time-link {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.4);
        line-height: 18px;
        text-align: center;
        a {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.4);
            line-height: 18px;
            text-align: center;
            &:hover {
                color: #fa8241;
            }
        }
    }
}
</style>
<style lang="less">
.messager-info {
    .el-timeline {
        padding: 10px 0 10px 20px;
    }
    .el-timeline-item {
        padding-bottom: 2px;
    }
    .el-timeline-item__tail {
        border-left: 1px solid #e4e7ed;
        left: 0;
    }
    .visitor-timeline .timeline-dot {
        top: -1px;
    }
}
</style>
