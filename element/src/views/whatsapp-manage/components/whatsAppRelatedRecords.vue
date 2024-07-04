<template>
    <div class="mutual-container twemoji-convert"
         v-loading="isLoading"
         :element-loading-text="$t('crm.Html.loading')">
        <!-- 无数据提醒 -->
        <div v-if="recordList.length === 0"
             style="margin-top: 60px;text-align: center;color: #999; ">{{ $t('timeLine.noData') }}</div>
        <!-- 时间轴 -->
        <Timeline v-else class="timeline-whatsapp">
            <!--<TimelineItem>-->
            <!--    <div slot="dot"-->
            <!--         class="timeline-dot">-->
            <!--        <Icon type="record"-->
            <!--              size="12"-->
            <!--              color="#e9eaec"-->
            <!--              style="vertical-align: top;"></Icon>-->
            <!--    </div>-->
            <!--    <div>-->
            <!--        <br>-->
            <!--    </div>-->
            <!--</TimelineItem>-->
            <TimelineItem v-for="item in recordList"
                          :key="item.id">
                <!-- 图标 -->
                <div slot="dot"
                     class="timeline-dot">
                    <img src="@/styles/customFont/svg/WhatsApp.svg"></img>
                </div>
                <div class="timeline-item">
                    <div class="item-header clearfloat">
                        <!-- 标题 -->
                        <div class="item-title">{{ `${item.chatType}` === '1' ? $t('timeLine.whatsAppGroup') : $t('timeLine.whatsApp') }}</div>

                        <!-- 展开/收起 -->
                        <!-- isShowWAMsg 这个变量好像没起到展开收起聊天消息的作用啊? -->
                        <div style="position:relative;">
                            <div class="block-line"></div>
                            <Icon v-if="!item.isShowWAMsg" size="12" class="custom custom-show-more" @click="toggleMsgShow(item.id, true,true)"></Icon>
                            <Icon v-else size="12" class="custom custom-collapse" @click="toggleMsgShow(item.id, false)"></Icon>
                        </div>

                        <!-- 时间 -->
                        <div class="item-time">{{ item.timeStamp | timeFormat("DateTime") }}</div>
                    </div>
                    <div class="item-body">
                        <!-- 消息(x 向 y 发送消息 z) -->
                        <span class="ellipsis-3">
                            <!-- 群组消息(xx 在 yy 群发送) -->
                            <span v-if="`${item.chatType}` === '1'">
                                <span :title="item.wholeFromWaName">{{ `【${item.fromWaName ? item.fromWaName : item.fromWaAccount}】`}}</span>
                                <span>{{$t('visitor_history.on')}}</span>
                                <span :title="item.subject">{{ `【${item.subject}】` }}</span>
                                <span>{{$t('chat.send')}}</span>
                            </span>
                            <!-- 非群组消息, 中文环境显示 -->
                            <span v-else-if="$lang === 'zh-CN'">
                                <span :title="item.wholeFromWaName">{{ `【${item.fromWaName ? item.fromWaName : item.fromWaAccount}】`}}</span>
                                <span>{{$t('facebookInteraction.to')}}</span>
                                <span :title="item.wholeToWaName">{{ `【${item.toWaName ? item.toWaName : item.toWaAccount}】` }}</span>
                                <span>{{$t('chat.send')}}</span>
                            </span>
                            <!-- 非群组消息, 非中文环境显示 -->
                            <span v-else>
                                <span :title="item.wholeFromWaName">{{ `【${item.fromWaName ? item.fromWaName : item.fromWaAccount}】`}}</span>
                                <span>{{$t('chat.send')}}</span>
                                <span>{{$t('facebookInteraction.to')}}</span>
                                <span :title="item.wholeToWaName">{{ `【${item.toWaName ? item.toWaName : item.toWaAccount}】` }}</span>
                            </span>

                            <!-- 消息内容 -->
                            <span :class="`item-event-current ${class_whatsApp_GTM}`" :title="getMessageContent(item.type, item.content)">【{{ getMessageContent(item.type, item.content) }}】</span>
                        </span>

                        <!-- 访客状态 -->
                        <div>
                            <span>{{ $t('visitor_history.status') }}: </span>
                            <span>{{ getLeadsCloudStatus(item.leadscloudStatus) }}</span>
                        </div>
                    </div>

                    <!-- 聊天消息展示 -->
                    <div v-if="Array.isArray(item.msgList) && item.msgList.length"
                         :id="`msgContainer_${item.id}`"
                         class="item-msg-list" @scroll.capture="handleFrameScroll">
                         <!-- <div style="position: relative;" v-if="pageListLoading">
                            <div v-loading="pageListLoading" class="ivu-scroll-loader">
                                <Spin fix>
                                    <Icon type="ios-loading" size="18" class="ivu-scroll-spinner-icon"></Icon>
                                    <div class="ivu-scroll-loader-text">{{$t('crm.Html.loading')}}</div>
                                </Spin>

                            </div>
                         </div> -->
                        <Scroll :on-reach-top="loadMore"
                            :distance-to-edge="10"
                            :loading-text="$t('crm.Html.loading')"
                            :height="450"
                            ref="msgScroll">
                            <whatsAppMsgItem v-for="msg in $options.filters.addMsgTimeTag(item.msgList)"
                                             :key="msg.messageId"
                                             :rawMsg="msg"
                                             :nick="item.fromMe ? item.toWaName : item.fromWaName"
                                             :whatsAppAccountInfo="{ 'whatsappAccount': userBindWaAccount || undefined }"
                                             fromFlag="waRelatedDetail"
                                             @scrollToQuoteMsg="handleScrollToQuoteMsg($event, item)"></whatsAppMsgItem>
                        </Scroll>
                    </div>

                    <!-- 底部 -->
                    <div style="position: relative;">
                        <!-- 滚动到最底部 -->
                        <div v-show="item.visible_toBottomBtn"
                            @click="scrollToBottom(item)"
                            class="scrollToBottom-btn">
                            <svg class="svg-icon custom" aria-hidden="true">
                                <use xlink:href="#custom-scrollToBottom"></use>
                            </svg>
                        </div>
                    </div>
                    <!-- <div style="text-align: center;" class="item-event" v-if="!item.noMoreMsg" @click="getMoreBottomList(item.id)">点击加载更多消息记录</div> -->
                </div>
            </TimelineItem>
            <p class="tileline-no-more-tip">{{$t('noticeWindow.noMore')}}</p>
        </Timeline>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import util from '@/libs/util';
    import i18n from '@/locale';
    import whatsAppMsgItem from '@/views/whatsapp-manage/whatsApp-chat-frame/whatsAppMsgItem.vue';
    import Vue from 'vue';
    import _ from 'lodash';
    import getMsgContent from '@/mixins/getMsgContent';

    export default {
        name: 'WhatsApp',
        mixins: [getMsgContent],
        props: ['whatsAppRelatedInfo'],
        components: {
            whatsAppMsgItem
        },
        data() {
            return {
                isLoading: true, // 页面加载中
                cancelFunc: null,
                pageListLoading: false,
                recordList: [], // WhatsApp时间轴数据
                currentChatWaAccount: '', // 当前选中的WhatsApp的账号
                userBindWaAccount: '', // 当前用户绑定的WhatsApp的账号
                whatsAppName: '', // WhatsApp消息发起方的WhatsApp的昵称
                currentLineItemId: 0, // 当前点击的timeLineItem的id
                size: 20, // 每页请求行数
                selectId: '' // 选中时间轴记录的id
            };
        },
        filters: {
            filterName(value) {
                return value || i18n.t('timeLine.unknown');
            }
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                clue_short_info: 'clue_short_info',
                class_whatsApp_GTM() {
                    switch (this.type) {
                        default:
                            return '';
                    }
                }
            }),
            $lang() {
                return Vue.config.lang;
            }
        },
        methods: {
            /* 获取WhatsApp数据 */
            /**
             * @Description: whatsappChatConditionList参数格式：
             * [ { "chatWaAccount": "手机号", "userBindWaAccount": "手机号" }, { "chatWaAccount": "手机号", "userBindWaAccount": "手机号" }]
             * @author 杨娣
             * @date 2020/12/23
            */
            getRelatedWhatsAppRecordList() {
                this.isLoading = true;
                this.recordList = [];
                util.ajaxWAJson({
                    url: '/whatsapp/visitorwhatsapprelation/getVisitorWhatsappRelationDetail',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        whatsappChatConditionList: this.whatsAppRelatedInfo
                    }
                }).then(res => {
                    this.isLoading = false;
                    if (res.data.code === 1) {
                        const data = res.data.data;
                        if (data.length) {
                            data.forEach(item => {
                                item.wholeToWaName = item.toWaName && item.toWaName.length > 15 ? item.toWaName : ''; // 根据长度决定是否显示完整的原始WhatsApp昵称
                                item.wholeFromWaName = item.fromWaName && item.fromWaName.length > 15 ? item.fromWaName : '';
                                item.toWaName = item.toWaName && item.toWaName.length > 15 ? `${item.toWaName.substring(0, 14)}...` : item.toWaName; // 根据长度决定是否截取WhatsApp昵称
                                item.fromWaName = item.fromWaName && item.fromWaName.length > 15 ? `${item.fromWaName.substring(0, 14)}...` : item.fromWaName;
                                item.isShowWAMsg = false; // 是否显示WhatsApp聊天记录
                                item.msgList = []; // 聊天记录
                                item.noMoreMsg = true; // 无更多消息
                                item.page = 1; // 当前记录下WhatsApp记录起始加载的行数
                                return item;
                            });
                            this.recordList = data;
                            this.recordList.forEach((item, index) => {
                                if (index === 0) {
                                    this.toggleMsgShow(item.id, true, true);
                                }
                            });
                        }
                    }
                }).catch(err => {
                    this.isLoading = false;
                    console.log('getRelatedWhatsAppRecordList()---err', err);
                });
            },
            /* 对不同访客状态进行处理 */
            getLeadsCloudStatus(status) {
                switch (status) {
                    case 0:
                        return '未录入';
                    case 1:
                        return '询盘';
                    case 2:
                        return '线索';
                }
            },
            toggleMsgShow(id, isShow, autoTrigger) {
                this.recordList.forEach(item => {
                    if (item.id === id) {
                        item.isShowWAMsg = isShow;
                        this.currentChatWaAccount = item.fromWaAccount === item.userBindWaAccount ? item.toWaAccount : item.fromWaAccount;
                        this.userBindWaAccount = item.userBindWaAccount;
                        this.selectId = id;
                        if (isShow) {
                            this.getWhatsAppMsgList(item.id, autoTrigger);
                        } else {
                            item.visible_toBottomBtn = false;
                            item.msgList = [];
                            item.noMoreMsg = true;
                            item.page = 1;
                            this.selectId = '';
                        }
                    } else {
                        item.visible_toBottomBtn = false;
                        item.isShowWAMsg = false;
                        item.msgList = [];
                    }
                    return item;
                });
            },
            /** 获取聊天记录 */
            getWhatsAppMsgList(id, autoTrigger, resolve) {
                const temp = this.recordList.find(item => item.id === this.selectId);
                if (!temp) {
                    return;
                }
                /* 取消上一次请求，避免频繁请求接口时因接口响应速度快慢导致数据错乱 */
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }

                let msgList = temp.msgList || [];
                let that = this;
                util.ajaxWAJson({
                    // url: '/whatsapp/chatRecords/getOffsetChatList',
                    url: '/whatsapp/chatRecords/page',
                    method: 'post',
                    data: {
                        chatWaAccount: this.currentChatWaAccount,
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        page: `${temp.page}`,
                        size: `${this.size}`,
                        userBindWaAccount: this.userBindWaAccount,
                        // orderType: 'ASC'
                    },
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        that.cancelFunc = c;
                    })
                }).then(({ data }) => {
                    if (data.code === 1) {
                        // 处理返回数据
                        if (data.data.content.length) {
                            // 有请求到数据, 合并数据到正常消息数组

                            msgList = this.mergeMsgList(data.data.content, temp);
                        } else {
                            // 没有请求到数据, 给出"没有更多"提示, 并将 page 退回一页

                            // 滚动到底部
                            if (!autoTrigger) {
                                this.$Message.info(this.$t('noticeWindow.noMore'));
                            }
                            temp.page--;
                        }

                        temp.msgList = msgList;
                        if (data.data.content.length < 20) {
                            temp.noMoreMsg = true;
                        }
                        if (temp.msgList.length < data.data.totalElements) {
                            temp.noMoreMsg = false;
                        }

                        if (autoTrigger) {
                            this.targetMsgLocation(msgList[msgList.length-1],temp);
                            this.$nextTick(() => {
                                const mutual_container = document.querySelectorAll(`.timeline-whatsapp`);
                                if (mutual_container) {
                                    const whatsappTimeline = mutual_container[0].querySelectorAll(`.el-timeline-item`);
                                    const currentTimeLineIndex = this.recordList.findIndex(item => item.id === this.selectId);
                                    const currentNode = whatsappTimeline[currentTimeLineIndex]
                                    if (currentTimeLineIndex > -1 && currentNode.scrollIntoView) {
                                       currentNode.scrollIntoView(true)
                                    }
                                }
                            })
                        }
                    }
                    if (resolve) {
                        resolve();
                    }
                }).catch(error => {
                    console.log(error);
                });
            },
            /** 加载更多 */
            loadMore() {
                // 当前显示的是正常消息, 且是滚动到底部
                if (this.selectId) {
                    this.recordList.forEach(item => {
                        if (item.id === this.selectId) {
                            item.page++;
                        }
                    });
                    return new Promise(resolve => {
                        this.getWhatsAppMsgList(this.selectId,false,resolve);
                    })
                }
            },
            /** 向下加载更多 */
            // getMoreBottomList(id) {
            //     this.recordList.forEach(item => {
            //         if (item.id === id) {
            //             item.page++;
            //             this.getWhatsAppMsgList(id);
            //         }
            //     });
            // },
            // 处理接口返回的数据(要求正常消息列表和引用消息列表都用这个方法, 方便在两者变动时判断两列表是否可合并)
            mergeMsgList(data, sourceItem) {
                // 传入数据处理
                data.forEach(item => {
                    if (item.extendedJson) {
                        try {
                            const tmp = JSON.parse(item.extendedJson);
                            if (tmp.seconds) {
                                item.seconds = tmp.seconds;
                            }
                        } catch (err) {
                            console.error('处理 page 接口返回数据的 extendedJson 错误');
                        }
                    }
                    item.visible_toBottomBtn = false;
                });

                // 暂存消息数组
                let msgList = (sourceItem.msgList || []).slice();

                // 合并消息数组和接口数据
                msgList = msgList.concat(data);

                // 数组去重
                const ids = new Set();
                msgList = msgList.filter(item => {
                    if (!ids.has(item.messageId)) {
                        ids.add(item.messageId);
                        return true;
                    }
                });

                // 数组按时间正序
                msgList.sort((a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp));

                return msgList;
            },
            // 滚动到指定引用消息处
            handleScrollToQuoteMsg(msg, sourceItem) {
                const msgList = sourceItem.msgList || [];
                // 在消息数组中定位引用消息
                const existed_waMsg = msgList.find(item => item.messageId === msg.messageId);

                if (existed_waMsg) {
                    // 引用消息在正常消息数组中

                    // 聊天界面定位到消息位置
                    this.targetMsgLocation(msg, sourceItem, true);
                } else {
                    this.$Message.warning(this.$t('whatsapp_manage.tip_unSyncMsg'));
                }
            },
            // 回到底部
            scrollToBottom(sourceItem) {
                const msgList = sourceItem.msgList || [];
                const lastMsg = msgList[msgList.length-1];
                this.targetMsgLocation(lastMsg,sourceItem);
            },
            // 滚动监听 判断是否需要显示"滚动到最底部"按钮
            handleFrameScroll: _.debounce(function(e) {
                const msgContainer = document.getElementById(`msgContainer_${this.selectId}`);
                if (msgContainer) {
                    const scrollContainer = msgContainer.querySelector('.ivu-scroll-container');
                    const msgDomArr = scrollContainer.querySelectorAll('.u-msg');
                    if (msgDomArr.length) {
                        // 获取最后一条消息的高度
                        const lastMsgHeight = msgDomArr[msgDomArr.length - 1].offsetHeight;
                        // 滚动容器滚动距离 + 滚动容器高度 + 最后一条消息高度, 如果小于滚动容器的滚动高度, 则最后一条消息不在视口内, 显示"直达底部"按钮, 否则不显示
                        this.recordList.forEach(item => {
                            if (item.id === this.selectId) {
                                this.$set(item,'visible_toBottomBtn',scrollContainer.scrollTop + scrollContainer.offsetHeight + lastMsgHeight < scrollContainer.scrollHeight);
                                this.$forceUpdate()
                            }
                        });
                    }
                }
            }, 250),
            // 定位到消息位置
            targetMsgLocation(msg, sourceItem, highlight = false) {
                this.$nextTick(() => {
                    const msgContainer = document.getElementById(`msgContainer_${sourceItem.id}`);
                    if (msgContainer) {
                        const msgDomArr = msgContainer.querySelectorAll('.u-msg');

                        // 获取该消息在当前显示的消息数组中的位置
                        const msgIndex = sourceItem.msgList.findIndex(item => item.messageId === msg.messageId);

                        // 如果页面已渲染此条消息
                        if (msgIndex !== -1 && msgDomArr[msgIndex]) {
                            // 获取此消息 dom
                            const el = msgDomArr[msgIndex];

                            // 滚动到视口
                            if (el.scrollIntoView) {
                                el.scrollIntoView();
                            }

                            // 高亮消息, 2s 后恢复原状
                            if (highlight) {
                                el.classList.add('quoted-msg__highlight');
                                setTimeout(() => {
                                    el.classList.remove('quoted-msg__highlight');
                                }, 2000);
                            }
                        }
                    }
                });
            }
        },
        mounted() {
            this.getRelatedWhatsAppRecordList();
        },
        watch: {
            whatsAppRelatedInfo: {
                handler(val) {
                    this.getRelatedWhatsAppRecordList();
                }
            }
        }
    };
</script>

<style lang="less" scoped>
    .mutual-container{
        height: 100%;
        overflow: auto;
        padding: 10px 20px;
        .timeline-whatsapp {
            /*max-height: 1000px;*/
            padding: 10px 0 10px 20px;
            .item-time {
                margin-top: 20px;
            }
            .item-event {
                color: #4285F4;
                cursor: pointer;

                &:hover {
                    color: #2d63bc;
                    text-decoration: underline;
                }
            }

            /deep/ .el-timeline-item__tail {
                border-left: 1px solid #e4e7ed;
                left: 0;
            }
        }
    }
    .mutual-box{
        padding: 0 20px 10px;
        flex: 1;
        overflow: auto;
    }
    .custom-collapse {
        position: absolute;right: 10px;top: 5px;
    }
    .custom-show-more {
        position: absolute;right: 10px;top: 5px;
    }
    .ellipsis-3{
        text-overflow: -o-ellipsis-lastline;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
    }
    .item-msg-list{
        max-height: 450px;
        overflow-y: auto;
        overscroll-behavior: contain;
        -ms-scroll-chaining: contain;
    }
    .scrollToBottom-btn {
        display: inline-block;
        border-radius: 50%;
        position: absolute;
        top: -54px;
        right: 0;
        cursor: pointer;

        svg {
            width: 40px;
            height: 40px;
        }
    }
    .pageList_loading{
        border-radius: 50%;
        position: absolute;
        text-align: center;
    }
</style>
