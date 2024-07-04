<template>
    <div style="padding: 10px 0 10px 20px; overflow:auto"
         :class="`messager-info ${little ? 'little-messager' : ''}`"
        id="timelineBox">
        <div
            v-if="messagerData.length === 0"
            style="margin-top: 60px; text-align: center; color: #999"
        >
            {{ $t('timeLine.noData') }}
        </div>
        <Timeline v-else>
            <TimelineItem>
                <div slot="dot" class="timeline-dot">
                    <Icon
                        type="record"
                        size="12"
                        color="#e9eaec"
                        style="vertical-align: top"
                    ></Icon>
                </div>
                <div>
                    <br />
                </div>
            </TimelineItem>
            <TimelineItem v-for="(item, index) in messagerData" :key="index">
                <div slot="dot"
                     class="timeline-dot">
                    <img src="@/styles/customFont/svg/Facebook.svg"></img>
                </div>
                <dl class="timeline-fb-messager">
                    <dt class="messager-header">
                        <div
                            class="messager-header-item messager-header-item-title"
                        >
                            <div class="messager-header-title">
                                {{ item.title }}
                            </div>
                            <div class="messager-header-time">
                                {{
                                    formatDate(
                                        item.messagerContent[0].ctime
                                    ).slice(5)
                                }}
                                <!-- <i class="custom custom-collapse"></i> -->
                                <i
                                    :class="`custom custom-collapse-arrow ${
                                        item.messageShow
                                            ? 'custom-collapse'
                                            : 'custom-show-more'
                                    }`"
                                    @click="
                                        changeShowStatus(
                                            index,
                                            !item.messageShow
                                        )
                                    "
                                ></i>
                            </div>
                        </div>
                        <div class="messager-header-item">
                            <p class="messager-header-synopsis">
                                {{
                                    `【${item.setMessager}】向【${item.getMessager}】发送私信【${item.firstMessage}】`
                                }}
                            </p>
                        </div>
                        <div class="messager-header-item">
                            <div class="messager-header-remark">
                                访客备注：{{ item.remark }}
                            </div>
                            <div class="messager-header-visitor-status">
                                访客状态：{{
                                    enumVisitorStatus(item.visitorStatus)
                                }}
                            </div>
                        </div>
                    </dt>
                    <dd v-if="item.messageShow" class="message-list">
                        <div
                            class="message-item"
                            v-for="(cItem, cIndex) in item.messagerContent"
                            :key="cIndex"
                        >
                            <div
                                class="message-box"
                                v-if="cItem.attachmentsType === 'text'"
                            >
                                <div class="message-item-info">
                                    <div class="message-img">
                                        <img
                                            :src="
                                                cItem.direction === 1
                                                    ? item.setImgUrl
                                                    : item.getImgUrl
                                            "
                                            :alt="
                                                cItem.direction === 1
                                                    ? item.setMessager
                                                    : item.getMessager
                                            "
                                        />
                                    </div>
                                    <div class="message-info-box">
                                        <div class="message-name">
                                            {{
                                                cItem.direction === 1
                                                    ? item.setMessager
                                                    : item.getMessager
                                            }}
                                        </div>
                                        <div class="message-detail">
                                            {{ cItem.content }}
                                        </div>
                                    </div>
                                </div>
                                <div class="message-item-time">
                                    {{ formatDate(cItem.ctime) }}
                                </div>
                            </div>
                            <div
                                class="message-box"
                                v-else-if="cItem.attachmentsType === 'image'"
                            >
                                <div class="message-item-info">
                                    <div class="message-img">
                                        <img
                                            :src="
                                                cItem.direction === 1
                                                    ? item.setImgUrl
                                                    : item.getImgUrl
                                            "
                                            :alt="
                                                cItem.direction === 1
                                                    ? item.setMessager
                                                    : item.getMessager
                                            "
                                        />
                                    </div>
                                    <div class="message-info-box">
                                        <div class="message-name">
                                            {{
                                                cItem.direction === 1
                                                    ? item.setMessager
                                                    : item.getMessager
                                            }}
                                        </div>
                                        <div class="message-detail">
                                            <img
                                                :src="cItem.attachmentsUrl"
                                                alt=""
                                                width="200"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div class="message-item-time">
                                    {{ formatDate(cItem.ctime) }}
                                </div>
                            </div>
                            <div
                                class="message-box"
                                v-else-if="cItem.attachmentsType === 'video'"
                            >
                                <div class="message-item-info">
                                    <div class="message-img">
                                        <img
                                            :src="
                                                cItem.direction === 1
                                                    ? item.setImgUrl
                                                    : item.getImgUrl
                                            "
                                            :alt="
                                                cItem.direction === 1
                                                    ? item.setMessager
                                                    : item.getMessager
                                            "
                                        />
                                    </div>
                                    <div class="message-info-box">
                                        <div class="message-name">
                                            {{
                                                cItem.direction === 1
                                                    ? item.setMessager
                                                    : item.getMessager
                                            }}
                                        </div>
                                        <div class="message-detail">
                                            <video
                                                :src="cItem.attachmentsUrl"
                                                alt=""
                                                width="200"
                                                controls
                                            ></video>
                                        </div>
                                    </div>
                                </div>
                                <div class="message-item-time">
                                    {{ formatDate(cItem.ctime) }}
                                </div>
                            </div>
                            <div
                                class="message-box"
                                v-else-if="cItem.attachmentsType === 'file'"
                            >
                                <div class="message-item-info">
                                    <div class="message-img">
                                        <img
                                            :src="
                                                cItem.direction === 1
                                                    ? item.setImgUrl
                                                    : item.getImgUrl
                                            "
                                            :alt="
                                                cItem.direction === 1
                                                    ? item.setMessager
                                                    : item.getMessager
                                            "
                                        />
                                    </div>
                                    <div class="message-info-box">
                                        <div class="message-name">
                                            {{
                                                cItem.direction === 1
                                                    ? item.setMessager
                                                    : item.getMessager
                                            }}
                                        </div>
                                        <div class="message-detail">
                                            <div class="message-file">
                                                <Icon
                                                    :custom="
                                                        getFileIcon(
                                                            cItem.attachmentsUrl
                                                        )
                                                    "
                                                    size="44"
                                                ></Icon>
                                                <Tooltip
                                                    :content="
                                                        cItem.attachmentsUrl
                                                    "
                                                    placement="top"
                                                >
                                                    <div
                                                        class="message-file-name"
                                                    >
                                                        <span
                                                            class="message-file-name-without-ext"
                                                            >{{
                                                                getFileName(cItem.attachmentsUrl)
                                                            }}</span
                                                        >
                                                    </div>
                                                </Tooltip>
                                                <Icon
                                                    custom="custom custom-file-download"
                                                    size="14"
                                                    style="
                                                        cursor: pointer;
                                                        float: right;
                                                        line-height: 48px;
                                                    "
                                                    @click="
                                                        downloadFile(
                                                            cItem.attachmentsUrl
                                                        )
                                                    "
                                                ></Icon>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="message-item-time">
                                    {{ formatDate(cItem.ctime) }}
                                </div>
                            </div>
                            <div class="message-box-time" v-else>
                                <div class="message-item-time">
                                    {{ formatDate(cItem.ctime) }}
                                </div>
                                <p class="message-time-link">
                                    {{ `【${item.setMessager}】从` }}
                                    <a :href="cItem.content" target="_blank">{{
                                        cItem.content
                                    }}</a>
                                    打开了这个对话
                                </p>
                            </div>
                        </div>
                    </dd>
                </dl>
            </TimelineItem>
        </Timeline>
    </div>
</template>

<script>
import lodash from 'lodash';
import utils from '@/utils';
export default {
    name: 'FacebookInteractionInfo',
    props: ['propsData', 'little'],
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
        }
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
