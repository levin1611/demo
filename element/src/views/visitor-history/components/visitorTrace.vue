<template>
    <div style="max-height:445px;overflow:auto">
        <Timeline
            style="padding:0px 20px 16px"
            class="big-icon-timeline">
            <Spin fix v-if="isLoading">
                <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                <div>Loading</div>
            </Spin>
            <div v-if="timelineFlag" style="margin-top: 60px;text-align: center;color: #999; ">
                {{ $t('timeLine.noData') }}
            </div>
            <!-- <TimelineItem v-if="lineList.length>0">
                <div slot="dot"
                     class="timeline-dot">
                    <Icon type="record"
                          size="12"
                          color="#e9eaec"
                          style="vertical-align: top;"></Icon>
                </div>
                <div><br></div>
            </TimelineItem> -->
            <template v-if="lineList.length>0">
                <TimelineItem v-for="(item,index) in lineList" >
                    <div slot="dot"
                         class="timeline-dot">
                        <img src="@/styles/customFont/svg/webVisit.svg"></img>
                    </div>
                    <div class="timeline-item">
                        <div class="item-header clearfloat">
                            <div class="item-title">{{ $t('timeLine.siteVisit') }}</div>
                            <template v-if="item.showOrderIconOrder">
                                <i class="custom custom-normal" size='14' style="color:#ccc;line-height: 20px; padding-left:10px"></i>
                            </template>
                            <template v-if="item.showOrderIconCart">
                                <i class="custom custom-shengchengdingdan" size='14' style="color:#ccc;line-height: 20px; padding-left:10px"></i>
                            </template>
                            <div v-show="!item.showDetail" @click.stop="getDetail(item)" class="item-time">
                                <Icon custom="custom custom-show-more"></Icon>
                            </div>
                            <div v-show="item.showDetail" @click.stop="item.showDetail=false" class="item-time">
                                <Icon custom="custom custom-collapse"></Icon>
                            </div>
                            <div class="item-time">{{item.eventTime | timeFormat("DateTime")}}</div>
                        </div>
                        <div class="item-body">
                            <span v-if="row.visitorName">【{{row.visitorName}}】</span>{{ $t('timeLine.accessToThe') }}
                            <template v-if="item.eventContent">
                                <a target="_blank" :href="item.eventContent" class="item-event">【{{item.eventContent}}】</a>
                            </template>
                            <template v-else>
                                <a target="_blank" :href="item.eventContent" class="item-event" v-if="lineList[index+1]">【{{lineList[index+1].eventContent}}】</a>
                            </template>
                            <div v-if="item.showDetail" class="api">
                                <div v-for="(info,index) in item.visitorTrace" :key="index">
                                    <div v-if="info.type === 'traceOrder'" class="info-item">
                                        <div class="item-header clearfloat">
                                            <span class="info-time">{{info.createTime | timeFormat("DateTime")}}</span>
                                            <span class="trace-web-title">{{`-> ${info.title}`}}</span>
                                        </div>
                                        <div class="item-body">
                                            <div>
                                                {{info.idorder ? 'Revenue: ' : 'Revenue lest in cart: '}}<span>{{info.revenue}}</span>,Quantity: <span>{{info.items}}</span>
                                            </div>
                                            <template v-if="info.data">
                                                <div style="box-sizing:border-box;padding-left: 20px" v-for="(v,i) in info.data" :key="i">
                                                    <span>{{v.sku_name}}</span>:<span>{{v.product_name}}</span>,Quantity: <span>{{v.quantity}}</span>,Price: <span>{{v.price}}</span>
                                                </div>
                                            </template>
                                            <div v-if="info.targetUrl">
                                                {{$t('visitor_history.to')}}&nbsp; <a class="item-event" style="padding-left:10px" target="_blank" :href="info.targetUrl">{{info.targetUrl}}</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="info.type==='trace' && info.fromAddress || info.toAddress" class="info-item">
                                        <div class="item-header clearfloat">
                                            <div class="info-time">{{info.createTime | timeFormat("DateTime")}}</div>
                                            <template v-if="info.currentActionType === 3">
                                                <span class="trace-web-title">{{$t('visitor_history.fileDownload')}}:</span>
                                                <a class="item-event" style="padding-left:10px" target="_blank"
                                                :href="info.currentActionName"> {{info.currentActionName}}</a>
                                            </template>
                                            <span class="trace-web-title" v-else-if="info.currentActionType === 10">-> {{info.preActionName}} - {{info.middleActionName}} - {{info.title}}</span>
                                            <span class="trace-web-title" v-else-if="info.currentPageType === 8">{{$t('visitor_history.SearchkeywordsWithinSite')}}: {{info.title}}</span>
                                            <span class="trace-web-title" v-else-if="info.currentActionType === 2"></span>
                                            <span :class="info.title?'trace-web-title':''" v-else>{{info.title}}</span>
                                        </div>
                                        <div class="item-body"
                                            v-if="info.currentActionType == 1 || info.currentActionType == undefined">
                                            <div v-if="info.fromAddress">
                                                {{$t('visitor_history.from')}}&nbsp;
                                                <a class="item-event"
                                                    style="padding-left:10px"
                                                    target="_blank"
                                                    :href="info.fromAddress">
                                                        {{info.fromAddress}}
                                                </a>
                                            </div>
                                            <div v-if="info.toAddress">
                                                {{$t('visitor_history.to')}}&nbsp;
                                                <a class="item-event"
                                                    style="padding-left:10px"
                                                    target="_blank"
                                                    :href="info.toAddress">
                                                        {{info.toAddress}}
                                                </a>
                                            </div>
                                        </div>
                                        <div class="item-body" v-else-if="info.currentActionType === 2"></div>
                                        <div class="item-body" v-else>
                                            <div v-if="info.fromAddress || info.toAddress">
                                                {{$t('visitor_history.on')}}&nbsp;
                                                <a class="item-event"
                                                    style="padding-left:10px"
                                                    target="_blank"
                                                    :href="info.fromAddress || info.toAddress">
                                                        {{info.fromAddress|| info.toAddress}}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TimelineItem>
            </template>
        </Timeline>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import i18n from '@/locale';
    import { mapState } from 'vuex';
    import { getTimeLinePiwik, getVisitorHistoryDetailPiwik, getLeaveMessagePiwik } from '../api/visitor_piwik';
    import { getTimeLineOld, getVisitorHistoryDetailOld, getLeaveMessageOld } from '../api/visitor_old';

    export default {
        props: {
            row: {
                type: Object,
                default() {
                    return {};
                }
            },
            fieldObj: {
                type: Object,
                default() {
                    return {};
                }
            },
            timeLine: {
                type: Number
            }
        },
        mounted() {
            // this.getXSShow()
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName
            }) // 从 vuex 中获取属性
        },
        filters: {
            filterName(value) {
                return value || i18n.t('timeLine.unknown');
            },
            filterTip(tip) {
                return tip === '1' ? i18n.t('yes') : i18n.t('no');
            }
        },
        data() {
            return {
                isLoading: true,
                lineList: [],
                mergeInfoList: [], // 按时间合并后的列表
                // fieldObj:{},//自定义自段对应的信息
                webMsgList: [], // 网站留言
                chatList: [],
                traceList: [],
                timelineFlag: false
            };
        },
        methods: {
            getDetail(item) {
                this.getVisitorInfo(item);
                // this.getFormByVisitorId(item);
            },

            // 方法合成
            async getTimeline() {
                this.isLoading = true;
                this.lineList = [];
                this.timelineFlag = false;
                let reO = [];
                let reP = [];
                // 旧接口，筛选掉上线之后的数据
                // const resDataO = await getTimeLineOld(this.row.visitorId);
                // if (resDataO && resDataO.data.length > 0) {
                //     reO = resDataO.data.filter(item => item.eventTime < this.timeLine);
                // } else {
                //     reO = [];
                // }

                // piwik接口，筛选掉上线之前的数据
                const resDataP = await getTimeLinePiwik(this.row.visitorId, this.enterpriseId);
                if (resDataP && resDataP.data.length > 0) {
                    // reP = resDataP.data.filter(item => new Date(item.eventTime).getTime() > this.timeLine);
                    reP = resDataP.data;
                } else {
                    reP = [];
                }

                const temp = reP.concat(reO);
                console.log('temp', temp)
                // 没有数据
                if (temp.length === 0) {
                    this.timelineFlag = true;
                    this.isLoading = false;
                } else {
                    // 有数据
                    this.lineList = temp.map(item => {
                        return {
                            eventContent: item.eventContent,
                            eventId: item.eventId.toString().startsWith('piwik') ? item.eventId.substring(6) : item.eventId,
                            eventTime: item.eventTime,
                            piwikFlag: item.piwikFlag,
                            showDetail: false,
                            visitorInfo: {}
                        };
                    });
                    this.getDetail(this.lineList[0]);
                    this.$emit('getVisitTimes', this.lineList.length);
                    this.$emit('getFirstVisitTime', this.lineList[this.lineList.length - 1].eventTime);
                }
            },
            getVisitorInfo(item) {
                if (item.piwikFlag) {
                    this.getVisitorInfoP(item);
                } else {
                    this.getVisitorInfoO(item);
                }
            },

            async getVisitorInfoP(item) {
                if (item.visitorTrace) {
                    item.showDetail = true;
                    return;
                }
                const idvisit = item.eventId;
                const visitorId = this.row.visitorId;
                const resData = await getVisitorHistoryDetailPiwik({ idvisit, visitorId });
                console.log('resData', resData);
                if (resData.code === '1') {
                    item.visitorInfo = resData.data.visitorInfo;
                    item.visitorChatMessage = resData.data.visitorChatMessage.map(element => {
                        return {
                            attach: element.attach,
                            body: element.body,
                            flow: element.flow,
                            fromAccount: element.fromAccount,
                            fromNick: element.fromNick,
                            idClient: element.idClient,
                            createTime: element.msgTimestamp,
                            msgType: element.msgType,
                            toAccount: element.toAccount,
                            type: 'chat'
                        };
                    });
                    item.visitorTrace = resData.data.visitorTrace.map(element => {
                        return {
                            createTime: element.enterTime,
                            fromAddress: element.fromAddress,
                            title: element.title,
                            toAddress: element.toAddress,
                            type: 'trace',
                            currentActionName: element.currentActionName,
                            currentActionType: element.currentActionType,
                            currentPageType: element.currentPageType,
                            preActionName: element.preActionName,
                            middleActionName: element.middleActionName
                        };
                    });
                    // this.$emit('getVisitTimes', item.visitorTrace.length)
                }
                item.orders = resData.data.orders;
                const f = resData.data.orders && Array.isArray(resData.data.orders) && resData.data.orders.length;
                item.showOrderIconOrder = f && resData.data.orders.some(v => v.idorder);
                item.showOrderIconCart = f && resData.data.orders.some(v => !v.idorder);
                if (resData.data.orders && Array.isArray(resData.data.orders)) {
                    item.visitorTrace = item.visitorTrace.concat((resData.data.orders || []).map(v => ({
                        ...v,
                        createTime: v.enterTime,
                        title: v.idorder ? `订单(${v.idorder})` : '购物车',
                        targetUrl: decodeURIComponent(item.visitorInfo.firstVisitorAddress),
                        type: 'traceOrder'
                    })));
                }
                item.visitorTrace = item.visitorTrace.sort((a, b) => {
                    return new Date(a.createTime).getTime() - new Date(b.createTime).getTime();
                });
                this.isLoading = false;
                item.showDetail = true;
            },

            getVisitorInfoO(item) {
                if (item.visitorTrace) {
                    item.showDetail = true;
                    return;
                }
                util.ajaxInternational({
                    url: '/server/getVisitorAllInfoByEventId',
                    method: 'post',
                    data: {
                        eventId: item.eventId,
                        visitorId: this.row.visitorId
                    }
                }).then(res => {
                    if (res.data.code == 1) {
                        item.visitorInfo = res.data.data.visitorInfo;
                        if (res.data.data.visitorChatMessage && res.data.data.visitorChatMessage.length > 0) {
                            item.visitorChatMessage = res.data.data.visitorChatMessage.map(element => {
                                return {
                                    attach: element.attach,
                                    body: element.body,
                                    flow: element.flow,
                                    fromAccount: element.fromAccount,
                                    fromNick: element.fromNick,
                                    idClient: element.idClient,
                                    createTime: element.msgTimestamp,
                                    msgType: element.msgType,
                                    toAccount: element.toAccount,
                                    type: 'chat'
                                };
                            });
                        } else {
                            item.visitorChatMessage = [];
                        }
                        item.visitorTrace = res.data.data.visitorTrace.map(element => {
                            return {
                                createTime: element.enterTime,
                                fromAddress: element.fromAddress,
                                title: element.title,
                                toAddress: element.toAddress,
                                type: 'trace',
                                currentActionName: element.currentActionName,
                                currentActionType: element.currentActionType,
                                currentPageType: element.currentPageType,
                                preActionName: element.preActionName,
                                middleActionName: element.middleActionName
                            };
                        });
                        // this.$emit('getVisitTimes', item.visitorTrace.length)
                    }
                    item.visitorTrace = item.visitorTrace.sort((a, b) => {
                        return new Date(a.createTime).getTime() - new Date(b.createTime).getTime();
                    });
                    this.isLoading = false;
                    item.showDetail = true;
                });
            },

            translate(info) {
                util.ajaxInternational({
                    url: '/translation/translation',
                    method: 'post',
                    data: {
                        requestText: info.body,
                        targetLang: 'zh'
                    }
                }).then(response => {
                    this.$set(info, 'translateBody', response.data.data.translations[0].translatedText);
                });
            },

            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            }
        },
        created() {
            this.getTimeline();
        },
        watch: {
            row: {
                handler: function() {
                    this.getTimeline();
                },
                deep: true
            }
        }
    };
</script>
<style lang="less">
    @import './visitor-detail.less';
</style>
