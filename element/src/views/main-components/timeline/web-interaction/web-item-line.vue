<template>
    <div v-loading="isLoading" class="time-line-scroll">
        <div v-if="lineList.length === 0"
             style="margin-top: 60px;text-align: center;color: #999; ">{{ $t('timeLine.noData') }}</div>
        <Timeline v-infinite-scroll="getList"
                  :infinite-scroll-distance="5"
                  :infinite-scroll-disabled="noMore || (lineDataType !== 'trace')"
                  class="big-icon-timeline">
            <TimelineItem v-for="(item,index) in lineList"
                          :key="item.eventId">
                                          <!-- 网站交互 -->
                <template v-if="item.eventCategory == '3' && ((item.outLinkFlag != 0) || (item.outLinkFlag == 0 && item.visitorTrace.length > 1))">
                    <div slot="dot"
                         class="timeline-dot">
                        <img src="@/styles/customFont/svg/webVisit.svg"></img>
                    </div>

                    <WebItem :item="item"
                             :type="type"
                             @getVisitorAllInfoByEvent="showAccessDetail"
                            @viewContact="viewContact"
                             v-on="$listeners"></WebItem>
                </template>
            </TimelineItem>
        </Timeline>
        <p v-if="noMore" style="text-align: center;margin-bottom: 10px;">{{ $t('noticeWindow.noMore') }}</p>
           <!--访问详情-->
        <AccessDetail :visible.sync="showDetail"
                      :type="type"
                      :modalWidth="modal_width"
                      :visitorInfo="visitorInfo"
                      :item="itemInfo"
                      @updateVistorInfo="getGoogleInfoDetails"
                      :mergeInfoList="mergeInfoList"></AccessDetail>
    </div>
</template>

<script>
    import Utils from '@/utils/index';
    import i18n from '@/locale';
    import { mapState } from 'vuex';
    import { getGoogleAdInfo } from '@/api/reusableApi/common';
    import WebItem from '@/views/main-components/timeline/web-interaction/webItem';
    import AccessDetail from '@/views/main-components/timeline/Components/accessDetail';
    import { getTimeLineNew } from '@/views/visitor-history/api/visitor_old';
    export default {
        props: ['currentTab', 'visitorId', 'fieldObj', 'type', 'customerInfo', 'from', 'visitorName'],
        components: {
            WebItem,
            AccessDetail
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
                showDetail: false,
                lineList: [], // 时间轴列表
                visitorInfo: {}, // 访客信息
                itemInfo: {},
                mergeInfoList: [], // 按时间合并后的列表
                //                fieldObj:{},//自定义自段对应的信息
                chatList: [],
                traceList: [],
                webMsgList: [], // 网站留言
                list: [],
                flag: -1,
                showItem: false,

                onLineTime: '2019-06-01 00:00:00', // 上线时间--早
                timeLine: '',
                trafficSourceList: [
                    {
                        value: 1,
                        label: this.$t('visitor_history.ad_google')
                    },
                    {
                        value: 2,
                        label: this.$t('visitor_history.ad_facebook')
                    },
                    {
                        value: 3,
                        label: this.$t('visitor_history.ad_other')
                    },
                    {
                        value: 4,
                        label: this.$t('visitor_history.email_marketing')
                    },
                    {
                        value: 5,
                        label: this.$t('visitor_history.search_engine')
                    },
                    {
                        value: 6,
                        label: this.$t('visitor_history.social_network')
                    },
                    {
                        value: 7,
                        label: this.$t('visitor_history.other_referrals')
                    },
                    {
                        value: 8,
                        label: this.$t('visitor_history.direct_access')
                    }
                ],

                // 新时间轴
                // 分页加载
                pageNo: 1,
                pageSize: 20,
                noMore: false,
                // 时间轴数据类型, trace 代表接口返回的 list 和 total , 分页数据; form 代表 list2 , 一次性返回数据
                lineDataType: '',


                /**
                 * @Description: 分段加载, 避免发送过多请求(详情)导致页面卡死
                 * @author 汤一飞
                 * @date 2020/5/27
                */
                showItemCount: 0, // 当前显示的条目数
                showItemSize: 20, // 每次加载xx条
                historyTrackList: [] // currVisitorId 最近一次对话后端保存的历史轨迹
            };
        },
        created() {
            // this.timeLine = new Date(this.onLineTime).getTime();
            // this.getList();
        },
        watch: {
            currentTab: {
                handler(value) {
                    if (value === 'WebLine') {
                        this.isLoading = true;
                        this.getList(true);
                    }
                },
                immediate: true
            },
            visitorId: {
                handler(value) {
                    if (value) {
                        this.isLoading = true;
                        this.getList(true);
                    }
                }
            },
            // 解决偶现 BUG : 有时留言表单数据先于线索字段请求完. 导致处理表单数据时匹配线索字段失败, accessDetail 组件内表单不显示
            fieldObj(val) {
                if (val && Object.keys(val).length) {
                    // 网站交互条目特殊处理
                    if (this.lineList.find(item => item.eventCategory === '3')) {
                        // 如果有网站交互条目
                        this.lineList.forEach((item, index) => {
                            if (item.eventCategory === '3' && item.formList && item.formList.length) {
                                item.formList = [this.formatFormValue(item.visitorLeaveMessage.fcolumnValue)];
                                this.handleInfo(item);
                            }
                        });
                    }
                }
            }
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                currSessionName: 'currSessionName',
                currVisitorId: 'currVisitorId',
                window_width: 'window_width'
            }),
            // 弹框宽度
            modal_width() {
                return parseInt(this.window_width * 0.8);
            }
            // allLineList(){
            //     console.log(this.trackList)
            //     if(this.lineList.length){
            //         return this.lineList;
            //     }else{
            //         return this.trackList;
            //     }
            // }
        },
        methods: {
            // 获取列表数据
            async getList(isInit) {
                if (isInit) {
                    this.lineList = [];
                    this.pageNo = 1;
                    this.lineDataType = '';
                    this.noMore = false;
                }
                if (this.visitorId) {
                    // 暂存数据
                    let dataArr = [];

                    // 请求接口获取数据
                    const resData = await getTimeLineNew({
                        visitorId: this.visitorId,
                        orgId: this.enterpriseId,
                        currentPage: this.pageNo,
                        size: this.pageSize
                    });

                    // 根据接口返回, 判断显示数据的类型, 以及加载方式(分页 || 全部加载)
                    const prevType = this.lineDataType;
                    if (resData.data && resData.data.total) {
                        // 走分页
                        this.lineDataType = 'trace';
                        if (resData.data.list.length < this.pageSize) {
                            this.noMore = true;
                        }
                        dataArr = this.handleTraceLineData(resData.data.list || []);
                        this.pageNo++;
                    } else {
                        this.isLoading = false;
                        // 全部请求显示, 不滚动加载
                        this.lineDataType = 'form';
                        dataArr = this.handleFormLineData(resData.data.list2 || []);
                    }
                    // 如果接口返回导致 lineDataType 变化了, 说明家在方式也变化了, 因此清空原数据, 改用新的加载方式
                    if (prevType && prevType !== this.lineDataType) {
                        // 如果加载方式变化, 清空原数据
                        this.lineList = [];
                        this.pageNo = this.lineDataType === 'trace' ? 2 : 1;
                    }

                    if (dataArr.length) {
                        // 拼接返回数据, 查重并倒序排序
                        const temp = new Map();
                        const showDetailSet = new Set();
                        this.lineList.concat(dataArr).forEach(item => {
                            temp.set(item.eventId, item);
                            if (item.showDetail) {
                                showDetailSet.add(item.eventId);
                            }
                        });
                        this.lineList = Array.from(temp.values()).map(item => {
                            if (showDetailSet.has(item.eventId)) {
                                item.showDetail = true;
                            }
                            return item;
                        }).sort((a, b) => b.eventTime - a.eventTime);

                    }

                }
            },
            async getGoogleInfoDetails(item, all, type) {
                const info = await getGoogleAdInfo({
                    idvisit: item.idvisit,
                    orgId: this.enterpriseId,
                    url: all.eventContent
                });
                if (info && typeof info === 'object' && !(info instanceof Error)) {
                    for (const key in info) {
                        // eslint-disable-next-line no-prototype-builtins
                        if (info.hasOwnProperty(key)) {
                            const value = info[key] || '';
                            if (key && value && typeof value === 'string' && key === 'utm_device') {
                                item[key] = value.replace(/\#.*/, '');
                            } else {
                                item[key] = value;
                            }
                        }
                    }
                    item.showBtn = false;
                    this.$nextTick(function() {
                        this.$forceUpdate();
                    });
                } else {
                    this.$Message.error(this.$t('timeLine.codeErrorGoogleAd'));
                }
                return item;
            },
            // 弹出联系人详情
            showAccessDetail(item) {
                this.showDetail = true;
                this.mergeInfoList = item.mergeList?item.mergeList:[];
                this.visitorInfo = item.visitorInfo;
                this.itemInfo = item;
            },

            // 加载更多
            loadMore() {
                if (this.showItemCount >= this.lineList.length) {
                    return;
                }
                this.showItemCount += this.showItemSize;
                this.getList();
            },
            viewContact(item){
                this.$Message.error('当前联系人未建档');
            },
            // 处理接口数据
            // 处理表单数据
            formatFormValue(element) {
                // 加上 type
                element.type = 'msg';

                // 处理留言数据
                const emailReg = Utils.regExp.fullEmail;
                const telReg = Utils.regExp.fullPhone;
                const fields = {};
                for (const key in element) {
                    if (key.indexOf('a100') !== -1 && this.fieldObj[key]) {
                        let formData = element[key];
                        if (formData.indexOf('@') != -1 && formData.length < 40 && emailReg.test(formData)) { /* 检测是邮箱格式 */
                            const emailArr = formData.split('@');
                            emailArr[0] = '****';
                            formData = emailArr.join('@');
                        } else if (key !== 'a10010' && telReg.test(formData.replace(/\s/g, ''))) { /* 去掉字符串中空格 检测是电话 */
                            formData = `${formData.slice(0, -4)}****`;
                        }
                        fields[key] = {
                            type: this.fieldObj[key].type,
                            label: this.fieldObj[key].name,
                            value: formData
                        };
                    }
                }
                element.fields = fields;
                // 返回结果
                return element;
            },
            handleTraceLineData(data) {
                this.isLoading = false;
                return data.map(item => {
                    // 处理 google 广告与其他信息
                    item.visitorInfo = item.visitorInfo.trafficSource === '1' ? Object.assign(item.visitorInfo, item.adsGoogleDetailInfo || {}) : item.visitorInfo;
                    item.showBtn = !item.adsGoogleDetailInfo;
                    item.contactsName = this.visitorName ? this.visitorName : this.customerInfo.title;
                    if (Array.isArray(item.visitorChatMessage) && item.visitorChatMessage.length > 0) {
                        item.visitorChatMessage = item.visitorChatMessage.map(element => {
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

                    if (item.visitorLeaveMessage && item.visitorLeaveMessage.fcolumnValue) {
                        item.formList = [this.formatFormValue(item.visitorLeaveMessage.fcolumnValue)];

                        // 处理产品数据
                        try {
                            if (item.visitorLeaveMessage.productList) {
                                const productRes = JSON.parse(item.visitorLeaveMessage.productList);
                                if (productRes.code === '1' && Array.isArray(productRes.data.list)) {
                                    item.productList = productRes.data.list;
                                } else {
                                    item.productList = [];
                                }
                            } else {
                                item.productList = [];
                            }
                        } catch (e) {
                            console.error(item.productList);
                            item.productList = [];
                        }
                        item.showTable = item.productList.length;
                        item.tableData = item.productList;
                    } else {
                        item.formList = [];
                    }

                    if (Array.isArray(item.visitorTrace) && item.visitorTrace.length > 0) {
                        item.visitorTrace = item.visitorTrace.map(element => {
                            let temp = {
                                createTime: element.enterTime,
                                fromAddress: element.fromAddress,
                                title: element.title,
                                toAddress: element.toAddress,
                                type: 'trace'
                            };
                            if (item.piwikFlag) {
                                temp = Object.assign(temp, {
                                    currentActionName: element.currentActionName,
                                    currentActionType: element.currentActionType,
                                    currentPageType: element.currentPageType,
                                    preActionName: element.preActionName,
                                    middleActionName: element.middleActionName
                                });
                            }

                            return temp;
                        });
                    } else {
                        item.visitorTrace = [];
                    }

                    if (item.piwikFlag) {
                        const f = item.orders && Array.isArray(item.orders) && item.orders.length;
                        item.showOrderIconOrder = f && item.orders.some(v => v.idorder);
                        item.showOrderIconCart = f && item.orders.some(v => !v.idorder);
                        if (item.orders && Array.isArray(item.orders)) {
                            item.visitorTrace = item.visitorTrace.concat((item.orders || []).map(v => ({
                                ...v,
                                createTime: v.enterTime,
                                title: v.idorder ? `订单(${v.idorder})` : '购物车',
                                targetUrl: decodeURIComponent(item.visitorInfo.firstVisitorAddress),
                                type: 'traceOrder'
                            })));
                        }
                        item.outLinkFlag = item.visitorTrace.findIndex(item => {
                            return item.currentActionType == 2;
                        });
                    }

                    // 拼接 mergeList
                    this.handleInfo(item);
                    return item;
                });
            },
            handleFormLineData(data) {
                return data.map(item => {
                    const temp = this.formatFormValue(item);
                    // 处理产品数据
                    temp.productList = Array.isArray(temp.list) ? temp.list : [];
                    temp.showTable = temp.productList.length;
                    temp.tableData = temp.productList;
                    return {
                        eventId: temp.id || 0,
                        eventTime: temp.createTime || 0,
                        eventContent: temp.currentUrl || ' ',
                        mergeList: [temp],
                        showDetail: false
                    };
                });
            },
            handleInfo(item) {
                let list = [];
                list = item.visitorChatMessage.concat(item.visitorTrace, item.formList);
                list = list.sort((a, b) => {
                    return new Date(a.createTime).getTime() - new Date(b.createTime).getTime();
                });
                this.$set(item, 'mergeList', list);
            }
        }
    };
</script>

<style>
    .trace-web-title {
        color: #FF8355;
        background: #FFECE2;
        padding: 0 5px;
    }

    .info-item {
        background-color: #F9FBFD;
        /*padding: 10px 10px 0;*/
        border-top: 1px dashed #E6E6E6;
        word-break: break-word;
    }

    .info-item .item-header {
        margin-bottom: 10px;
    }

    .info-time {
        /*margin-right: 10px;*/
        float: right;
        color: #b8b8b8;
        display: inline-block;
    }

    .info-title {
        display: inline-block;
    }

    .web-tip {
        font-weight: bolder;
        line-height: 20px;
    }

    .web-link a {
        cursor: pointer;
        color: #3b78de;
    }

    .web-link:hover a {
        text-decoration: underline;
        color: #2d63bc;
    }
</style>

<!-- 时间轴 -->
<style lang="less">
    @import '~@/views/main-components/timeline/timeline.less';
</style>

<style lang="less" scoped>
    .timeline-dot-icon {
        color: white;
        line-height: 40px;
    }

    .time {
        font-size: 14px;
        font-weight: bold;
    }

    .content {
        padding-left: 5px;
    }
</style>
