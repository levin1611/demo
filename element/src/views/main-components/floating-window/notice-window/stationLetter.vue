<template>
    <div>
        <!-- header -->
        <div class="floating-window-header">
            <!-- 标题 -->
            <div class="floating-window-header-title notice-window-header">{{ $t('noticeWindow.stationLetter') }} {{ unreadCount > 0 ? `(${ unreadCount })` : '' }}</div>
            <!-- 右侧按钮 -->
            <div class="floating-window-fix-icon notice-window-header-icon">
                <!-- 返回应用中心 -->
                <Tooltip :content="$t('back')">
                    <Icon custom="custom-field-recover"
                          @click.native="returnAppCenter"
                          style="margin-right: 20px;top: -1px;"
                          class="cursor-pointer"></Icon>
                </Tooltip>
                <!-- 关闭分屏 -->
                <Tooltip :content="$t('close')">
                    <Icon custom="custom-modal-close"
                          @click.native="close_window"
                          class="cursor-pointer"></Icon>
                </Tooltip>
            </div>
        </div>

        <!-- 正体 -->
        <div>
            <ul v-infinite-scroll="getList"
                ref="noticeListContainer"
                class="notice-list">
                <template v-for="(notice, index) in noticeList">
                    <!-- 时间分割(按月) -->
                    <li v-if="notice.timeMark" :key="`${index}-${notice.timeMark}`"
                        class="notice-tip">
                        <span>{{ notice.timeMark }}</span>
                        <!-- 全部已读 -->
                        <div v-if="index === 0"
                             @click="markAll"
                             class="notice-markAll">{{ $t('message.allRead') }}</div>
                    </li>

                    <!-- 提醒 -->
                    <li ref="noticeItem" :key="index"
                        @click="clickNotice(notice, index)"
                        class="notice-item">
                        <!-- 标题 -->
                        <span :class="{'bold': notice.ifRead !== 1, 'notice-item-content': true}">{{ notice.title }}</span>
                        <!-- 内容 -->
                        <div class="detail-info-clip">{{ notice.content | toText | trim }}</div>
                        <!-- 时间 -->
                        <div class="notice-item-time">{{ notice.createTime | toLocaleTime }}</div>
                    </li>
                </template>

                <!-- 无数据提醒 -->
                <li v-if="!noticeList.length"
                    class="notice-nodata">
                    <img :src="`${publicPath}image/nodata.png`"/>
                    {{ $t('message.noLetter') }}</li>
            </ul>
        </div>

        <!-- 详情页 -->
        <SplitDetail :visible.sync="visible_detail"
                     :type="type_detail"
                     :detailInfo="detailInfo"></SplitDetail>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import SplitDetail from '@/views/main-components/floating-window/notice-window/components/Html/splitDetail';

    export default {
        name: 'stationLetter',
        props: [
            'isDrawerShow',
            'floatWindowType'
        ],
        components: {
            SplitDetail
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId'
            })
        },
        data() {
            return {
                /* 站内信 */
                noticeList: [],
                unreadCount: 0,
                pageNo: 0,
                // 每次请求数据条数
                pageSize: 20,

                /* 分离的详情页 */
                visible_detail: false,
                type_detail: '',
                detailInfo: {},
                // 静态资源文件地址
                publicPath: process.env.BASE_URL
            };
        },
        filters: {
            // 时间戳转日期时间字符串显示
            toLocaleTime(str) {
                try {
                    const date = new Date(str);
                    return date.toLocaleDateString() + date.toLocaleTimeString();
                } catch (e) {
                    console.error(e);
                    return str;
                }
            }
        },
        methods: {
            /* 全局 */
            // 分屏显示时触发
            handleShow() {
                // 数据置空并重新请求
                this.noticeList = [];
                this.pageNo = 0;
                this.getList();
            },
            // 分屏隐藏时触发
            handleHide() {
                // 关闭详情页
                this.visible_detail = false;

                // 清空 active
                Array.isArray(this.$refs.noticeItem) && this.$refs.noticeItem.forEach(item => item.classList.remove('notice-item-active'));
            },

            /* header */
            // 关闭分屏
            close_window() {
                // 关闭分屏
                this.$emit('windowClose');
                // 关闭详情页
                this.visible_detail = false;
            },
            // 返回到应用中心
            returnAppCenter() {
                // 打开应用中心
                this.$store.commit('changeAppCenterVisible', true);
                // 关闭分屏
                setTimeout(() => {
                    this.close_window();
                }, 400);
            },

            /* 站内信 */
            // 获取站内信
            getList() {
                // 设置请求页数
                const pageNo = this.pageNo + 1;
                return new Promise((resolve, reject) => {
                    util.ajax({
                        url: '/cuss-login/sysMessage/getMessageListByOrgId',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            sendStatus: 1,
                            pageSize: this.pageSize,
                            pageNo
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            // 设置总未读数
                            this.unreadCount = response.data.data.noreadTotal;
                            // 本次请求得到的数据
                            const dataList = response.data.data.list;

                            if (dataList.length) {
                                // 更新数据
                                this.handleData(dataList);
                                this.pageNo = pageNo;
                            } else {
                                // 提示, 数据全部加载完成
                                if (this.noticeList.length) {
                                    // 有滚动条时, 提醒用户已经无法加载更多了
                                    if (this.$refs.noticeListContainer.scrollHeight > this.$refs.noticeListContainer.clientHeight) {
                                        this.$Message.info(this.$t('noticeWindow.noMore'));
                                    }
                                }
                            }
                        } else {
                            // 提示, 请求数据失败
                            this.$Message.error(this.$t('noticeWindow.error_getMessage'));
                        }
                        resolve(true);
                    }).catch(error => {
                        // 提示, 请求数据失败
                        console.error(error);
                        this.$Message.error(this.$t('noticeWindow.error_getMessage'));
                        resolve(true);
                    });
                });
            },
            // 处理数据
            handleData(dataList) {
                // 去除原有 noticeList 中和传入的新获取数据 dataList id 一致的部分
                let noticeList = this.noticeList.filter(notice => dataList.findIndex(item => item.id === notice.id) === -1);
                // 拼接新传入数据
                noticeList = noticeList.concat(dataList);
                // 按 createTime 从大到小排序
                noticeList = noticeList.sort((a, b) => b.createTime - a.createTime);
                // 数据处理(增加时间相关属性)
                let preMonth = 0;
                noticeList = noticeList.map(item => {
                    const date = new Date(item.createTime);
                    const month = date.getMonth() + 1;
                    let timeMark = '';
                    if (month !== preMonth) {
                        timeMark = this.$options.filters.timeFormat(date, 'YearMonth');
                    }
                    preMonth = month;
                    return {
                        ...item,
                        timeMark
                    };
                });
                this.noticeList = noticeList;
            },
            // 全部标为已读
            markAll() {
                util.ajax({
                    url: '/cuss-login/sysMessage/updateReadStatus',
                    method: 'post',
                    data: {
                        ifRead: 1,
                        messageId: 1,
                        type: 1,
                        orgId: this.enterpriseId,
                        userId: this.userId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        // 全部标为已读
                        this.noticeList.forEach(item => {
                            item.ifRead = 1;
                        });
                        // 未读数置为 0
                        this.unreadCount = 0;
                    } else {
                        // 提示, 全部标为已读失败
                        this.$Message.error(this.$t('message.error_setReadStatus'));
                    }
                }).catch(error => {
                    // 提示, 全部标为已读失败
                    console.error(error);
                    this.$Message.error(this.$t('message.error_setReadStatus'));
                });
            },
            // 点击提醒
            clickNotice(notice, index) {
                // 更改 active 显示
                this.$refs.noticeItem.forEach(item => item.classList.remove('notice-item-active'));
                this.$refs.noticeItem[index].classList.add('notice-item-active');

                // 标为已读
                if (notice.ifRead !== 1) {
                    util.ajax({
                        url: '/cuss-login/sysMessage/updateReadStatus',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            messageId: notice.id,
                            ifRead: 1
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            // 标为已读
                            notice.ifRead = 1;
                            // 未读数 - 1
                            this.unreadCount > 0 && this.unreadCount--;
                        } else {
                            // 提示, 标为已读失败
                            this.$Message.error(this.$t('message.error_setReadStatus'));
                        }
                    }).catch(error => {
                        // 提示, 标为已读失败
                        console.error(error);
                        this.$Message.error(this.$t('message.error_setReadStatus'));
                    });
                }

                // 打开详情页
                this.detailInfo = notice;
                this.type_detail = 'letter';
                this.visible_detail = true;
            }
        },
        beforeDestroy() {
            // 组件销毁前前未读数置为 0
            this.$store.commit('setNoticeUnread', {
                type: 'letterUnreadCount',
                count: 0
            });
        },
        watch: {
            // 更新未读数
            unreadCount: {
                handler(val) {
                    this.$store.commit('setNoticeUnread', {
                        type: 'letterUnreadCount',
                        count: val
                    });
                },
                immediate: true
            },
            isDrawerShow(val) {
                // 分屏显示时, 数据置空并重新请求
                if (val) {
                    if (this.floatWindowType === 'stationLetter') {
                        this.handleShow();
                    }
                }

                // 部分数据恢复到初始状态
                this.handleHide();
            }
        }
    };
</script>
<style scoped>
.notice-item{
  display: list-item;
}
.notice-nodata img {
    width: 354px;
    margin-top: 190px;
    display: block;
    margin: 190px auto 0;
}
.notice-nodata{
    color: rgba(0, 0, 0, 0.4);
    font-size: 12px;
    text-align: center;
}
</style>
