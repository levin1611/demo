<template>
    <div v-loading="isLoading"
         :element-loading-text="$t('crm.Html.loading')"
          class="time-line-scroll"
         id="timelineBox">

        <!-- 无数据提醒 -->
        <div v-if="lineList.length === 0"
             style="margin-top: 60px;text-align: center;color: #999; ">{{ $t('timeLine.noData') }}</div>

        <!-- 时间轴 -->
        <Timeline v-else
                  class="big-icon-timeline"
                  v-infinite-scroll="loadMore"
                  :infinite-scroll-disabled="noMore || currentTab !== 'web-line'"
                  :infinite-scroll-distance="5"
                  :infinite-scroll-immediate="false">
            <!-- <TimelineItem>
                <div slot="dot"
                     class="timeline-dot">
                    <Icon type="record"
                          size="12"
                          color="#e9eaec"
                          style="vertical-align: top;"></Icon>
                </div>
                <div>
                    <br>
                </div>
            </TimelineItem> -->
            <TimelineItem v-for="(item, index) in lineList" :key="index">
                <!-- 外链：访问既有外链又有轨迹 -->
                <!-- 第一条不是外链，则隐藏外链，其它正常显示 -->
                <!-- 如果是第一，则直接显示第一条轨迹，隐藏外链(访问轨迹长度大于) -->
                <template v-if="(item.outLinkFlag != 0) || (item.outLinkFlag == 0 && item.visitorTrace.length > 1)">
                    <!-- 时间轴图标 -->
                    <div slot="dot"
                         class="timeline-dot">
                        <img src="@/styles/customFont/svg/webVisit.svg"></img>
                    </div>

                    <!-- 时间轴内容 -->
                    <WebItem :item="item"
                             :type="type"
                             @getVisitorAllInfoByEvent="getVisitorAllInfoByEvent"
                             v-on="$listeners"></WebItem>
                </template>
            </TimelineItem>

            <p v-if="noMore" class="tileline-no-more-tip">{{$t('noticeWindow.noMore')}}</p>
        </Timeline>

        <!--访问详情-->
        <AccessDetail :visible.sync="previewWebInfo"
                      :type="type"
                      :modalWidth="modal_width"
                      :visitorInfo="visitorInfo"
                      :item="itemInfo"
                      @updateVistorInfo="getGoogleInfoDetails"
                      :mergeInfoList="mergeInfoList"></AccessDetail>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import Utils from '@/utils/index';
    import { mapState } from 'vuex';
    import {
        getVisitorHistoryDetailPiwik,
        getLeaveMessagePiwik
    } from '@/views/visitor-history/api/visitor_piwik';
    import WebItem from '@/views/main-components/timeline/web-interaction/webItem';
    import AccessDetail from '@/views/main-components/timeline/Components/accessDetail';
    import { getGoogleAdBtn, getGoogleAdInfo } from '@/api/reusableApi/common';

    export default {
        name: 'final-web',
        components: {
            WebItem,
            AccessDetail
        },
        props: ['companyId', 'type', 'date', 'currentTab', 'visitorId', 'fieldObj'],
        data() {
            return {
                onLineTime: '2019-06-01 00:00:00', // 上线时间--早
                timeLine: '',
                // currContent: '',
                previewWebInfo: false,
                modal_width: '',
                isLoading: true,
                lineList: [], // 时间轴列表
                visitorInfo: {}, // 访客信息
                itemInfo: {}, // 访客信息全集
                mergeInfoList: [], // 按时间合并后的列表
                pageNo: 1, // 时间轴分页
                noMore: false
                // fieldObj:{},//自定义自段对应的信息
                // webMsgList: [], // 网站留言
                // chatList: []，
                // traceList: []
            };
        },
        created() {
            //  this.getXSShow();
            this.timeLine = new Date(this.onLineTime).getTime();
            this.modal_width = parseInt(document.body.clientWidth * 0.8);
        },
        watch: {
            currentTab: {
                handler(value) {
                    if (value === 'web-line') {
                        this.pageNo = 1;
                        this.noMore = false;
                        this.getList();
                    }
                },
                immediate: true
            },
            date() {
                if (this.currentTab === 'web-line') {
                    this.pageNo = 1;
                    this.noMore = false;
                    this.getList();
                }
            }
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId'
            })
        },
        mounted() {
            this.$nextTick(() => {
                window.addEventListener('resize', this.onResizeFunc);
            });
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.onResizeFunc);
        },
        methods: {
            loadMore() {
                // 正在加载中就先不请求接口了
                if (!this.isLoading) {
                    this.pageNo += 1;
                    this.getList();
                }
            },
            /* 请求获得字段对应的信息 */
            // getXSShow() {
            //     util.ajax({
            //         url: '/form-cust/form/getXSShow',
            //         method: 'post',
            //         data: {
            //             orgId: this.enterpriseId
            //         }
            //     }).then(ret => {
            //         if (ret.data.code === '1') {
            //             this.fieldObj = ret.data.data.show;
            //         }
            //     });
            // },
            getList() {
                this.isLoading = true;

                const jsonData = {
                    orgId: this.enterpriseId,
                    startDate: Array.isArray(this.date) ? this.date[0] : undefined,
                    endDate: Array.isArray(this.date) ? this.date[1] : undefined,
                    pageNo: this.pageNo,
                    pageSize: 20,
                    eventCategory: 3
                };

                switch (this.type) {
                    case 'clue':
                        jsonData.clueId = this.companyId;
                        break;
                    case 'inquiry':
                        jsonData.inquiryId = this.companyId;
                        break;
                    case 'customer':
                    case 'highseasCustomer':
                        jsonData.companyId = this.companyId;
                        break;
                    case 'contact':
                        jsonData.contactsId = this.companyId;
                        break;
                }

                util.ajax({
                    url: '/crm/eventAction/getEventActionListDataInquiry',
                    method: 'post',
                    data: jsonData
                }).then(ret => {
                    if (this.pageNo === 1) {
                        this.lineList = [];
                    }
                    if (ret.data.code === '1') {
                        if (ret.data.data.length < 20) {
                            this.noMore = true;
                        }
                        const List = ret.data.data;
                        // this.lineList = this.handleEventList(ret.data.data.list);
                        List.forEach((line, index) => {
                            this.handleTimeLineList(line);
                            this.getFormByVisitorId(line, index);
                        });
                        this.lineList = this.lineList.concat(List);
                    } else {
                        this.isLoading = false;
                    }
                });
            },
            async formatGoogleDatas(item, all) {
                try {
                    const data = await getGoogleAdBtn(item.idvisit);
                    item.showBtn = data !== 1;
                    if (data === 1) {
                        item = await this.getGoogleInfoDetails(item, all, 'init');
                    }
                    return item;
                } catch (error) {
                    console.error(error);
                    return item;
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
                                const formatValue = value.replace(/\#.*/, '');
                                type === 'init' ? item[key] = formatValue : this.visitorInfo[key] = formatValue;
                            } else {
                                type === 'init' ? item[key] = value : this.visitorInfo[key] = value;
                            }
                        }
                    }
                    type === 'init' ? item.showBtn = false : this.visitorInfo.showBtn = false;
                    // this.$nextTick(function() {
                    //     this.$forceUpdate();
                    // });
                } else {
                    this.$Message.error(this.$t('timeLine.codeErrorGoogleAd'));
                }
                return item;
            },
            async handleTimeLineList(item) {
                // console.log('item111',item)
                const id = item.eventId;
                this.isloading = true;
                const idvisit = item.eventId.toString().startsWith('piwik') ? item.eventId.substring(6) : item.eventId;
                const visitorId = item.visitorId;
                // console.log('piwikeventId',idvisit,visitorId,id)
                if (id.startsWith('piwik')) {
                    const resData = await getVisitorHistoryDetailPiwik({ idvisit, visitorId });
                    if (resData.code === '1') {
                        // item.visitorInfo = resData.data.visitorInfo;
                        const ingore = resData.data.visitorInfo;
                        item.visitorInfo = ingore.trafficSource === '1' ? await this.formatGoogleDatas(ingore, item) : ingore;
                        if (resData.data.visitorChatMessage && resData.data.visitorChatMessage.length > 0) {
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
                        } else {
                            item.visitorChatMessage = [];
                        }
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
                        item.outLinkFlag = item.visitorTrace.findIndex(item => {
                            return item.currentActionType == 2;
                        });
                        // console.log('item12321',item)
                        this.isLoading = false;
                    } else {
                        this.isLoading = false;
                    }
                } else {
                    console.log('oldeventId', item.eventId);
                    util.ajaxInternational({
                        url: '/server/getVisitorAllInfoByEventId',
                        method: 'post',
                        data: {
                            eventId: item.eventId,
                            visitorId: item.visitorId
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
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
                            this.isLoading = false;
                        } else {
                            this.isLoading = false;
                        }
                    });
                }
                if (item.formList) {
                    this.handleInfo(item);
                }
            },

            handleEventList(list) {
                this.reply = [];
                list.forEach((item, index) => {
                    // debugger
                    if (item.eventCategory == '3') {
                        if (new Date(item.eventTime).getTime() >= this.timeLine) {
                            if (!item.eventId.startsWith('piwik')) {
                                const tempArr = list.filter(same => {
                                    const sameEventTime = new Date(same.eventTime).getTime();
                                    const itemEventTime = new Date(item.eventTime).getTime();
                                    return same.eventCategory == '3' && (sameEventTime - itemEventTime <= 1000 || same.eventId == item.eventId);
                                });
                                if (tempArr.length >= 2) {
                                    const isHavePiwik = tempArr.find(item => {
                                        return item.eventId.startsWith('piwik');
                                    });
                                    if (!isHavePiwik) {
                                        list.forEach((item, i) => {
                                            if (item.id == tempArr[0].id) {
                                                list.splice(i, 1);
                                            }
                                        });
                                    } else {
                                        list.splice(index, 1);
                                    }
                                }
                            } else if (item.eventId.startsWith('piwik')) {
                                const tempArr = list.filter(same => {
                                    const sameEventTime = new Date(same.eventTime).getTime();
                                    const itemEventTime = new Date(item.eventTime).getTime();
                                    return same.eventCategory == '3' && (Math.abs(sameEventTime - itemEventTime) <= 1000 || same.eventId == item.eventId);
                                });
                                if (tempArr.length >= 2) {
                                    list.forEach((item, i) => {
                                        if (item.id == tempArr[0].id) {
                                            list.splice(i, 1);
                                        }
                                    });
                                }
                            }
                        } else {
                            const tempArr = list.filter(same => {
                                const sameEventTime = new Date(same.eventTime).getTime();
                                const itemEventTime = new Date(item.eventTime).getTime();
                                return same.eventCategory == '3' && (sameEventTime - itemEventTime <= 1000 || same.eventId == item.eventId);
                            });
                            if (tempArr.length >= 2) {
                                const isHavePiwik = tempArr.find(item => {
                                    return item.eventId.startsWith('piwik');
                                });
                                if (isHavePiwik) {
                                    list.forEach((item, i) => {
                                        if (item.id == tempArr[0].id) {
                                            list.splice(i, 1);
                                        }
                                    });
                                } else {
                                    list.splice(index, 1);
                                }
                            }
                        }
                    }
                });
                return list;
            },
            // 点击详情
            getVisitorAllInfoByEvent(item) {
                this.previewWebInfo = true;
                this.mergeInfoList = item.mergeList;
                this.visitorInfo = item.visitorInfo;
                this.itemInfo = item;
                // this.traceList = item.visitorTrace;
            },

            handleInfo(item) {
                let list = [];
                list = item.visitorChatMessage.concat(item.visitorTrace, item.formList);
                list = list.sort((a, b) => {
                    return new Date(a.createTime).getTime() - new Date(b.createTime).getTime();
                });
                console.log('list', list);
                this.$set(item, 'mergeList', list);
            },

            // 这里面只有游客info、trace、chat不包含form表单
            // getVisitorAllInfoByEventOld(item, id, visitorId, eventContent) {
            //     const eventId = id.startsWith('piwik') ? id.substring(6) : id;
            //     this.previewWebInfo = true;
            //     this.loading = true;
            //     this.visitorInfo = {};
            //     this.chatList = [];
            //     this.traceList = [];
            //     this.currContent = eventContent;
            //     if (id.startsWith('piwik')) {
            //         console.log('piwikeventId', eventId);
            //         util.ajaxInternationalJson({
            //             url: '/piwikRead/visitorHistory/getVisitorHistoryDetail',
            //             method: 'POST',
            //             params: {
            //                 idvisit: eventId,
            //                 visitorId: visitorId
            //             }
            //         }).then(ret => {
            //             if (ret.data.code === '1') {
            //                 this.visitorInfo = ret.data.data.visitorInfo || {};
            //                 this.chatList = ret.data.data.visitorChatMessage;
            //                 this.traceList = ret.data.data.visitorTrace;
            //             }
            //             this.getFormByVisitorId(item);
            //             this.loading = false;
            //         });
            //     } else {
            //         console.log('oldeventId', eventId);
            //         util.ajaxInternational({
            //             url: '/server/getVisitorAllInfoByEventId',
            //             method: 'post',
            //             data: {
            //                 eventId: eventId,
            //                 visitorId: visitorId
            //             }
            //         }).then(ret => {
            //             if (ret.data.code === '1') {
            //                 this.visitorInfo = ret.data.data.visitorInfo || {};
            //                 this.chatList = ret.data.data.visitorChatMessage;
            //                 this.traceList = ret.data.data.visitorTrace;
            //             }
            //             this.getFormByVisitorId(item);
            //             this.loading = false;
            //         });
            //     }
            //
            //
            //     // util.ajaxInternational({
            //     //     url: '/server/getVisitorAllInfoByEventId',
            //     //     method: 'post',
            //     //     data: {
            //     //         eventId:eventId,
            //     //         visitorId:visitorId
            //     //     }
            //     // }).then(ret=>{
            //     //     this.getFormByVisitorId(visitorId);
            //     //     if(ret.data.code === '1'){
            //     //             this.visitorInfo=ret.data.data.visitorInfo || {};
            //     //         this.chatList=ret.data.data.visitorChatMessage;
            //     //         this.traceList=ret.data.data.visitorTrace;
            //
            //     //     }
            //     // })
            // },


            // mergeList() {
            //     const temp = [];
            //     const L1 = this.chatList.length;
            //     const L2 = this.traceList.length;
            //     for (let i = 0; i < L1; i++) {
            //         const obj = {
            //             type: 'chat',
            //             time: this.chatList[i].msgTimestamp,
            //             body: this.chatList[i].body,
            //             attach: this.chatList[i].attach,
            //             flow: this.chatList[i].flow,
            //             fromAccount: this.chatList[i].fromAccount,
            //             fromNick: this.chatList[i].fromNick,
            //             idClient: this.chatList[i].idClient,
            //             msgType: this.chatList[i].msgType,
            //             toAccount: this.chatList[i].toAccount
            //         };
            //         temp.push(obj);
            //     }
            //     for (let i = 0; i < L2; i++) {
            //         const obj = {
            //             type: 'trace',
            //             time: this.traceList[i].enterTime,
            //             title: this.traceList[i].title,
            //             fromAddress: this.traceList[i].fromAddress,
            //             toAddress: this.traceList[i].toAddress,
            //             visitorId: this.traceList[i].visitorId,
            //             currentActionName: this.traceList[i].currentActionName,
            //             currentActionType: this.traceList[i].currentActionType,
            //             currentPageType: this.traceList[i].currentPageType,
            //             preActionName: this.traceList[i].preActionName,
            //             middleActionName: this.traceList[i].middleActionName
            //         };
            //         temp.push(obj);
            //     }
            //     if (this.webMsgList.length > 0) {
            //         for (let i = 0; i < this.webMsgList.length; i++) {
            //             const fields = [];
            //             for (const key in this.webMsgList[i]) {
            //                 if (key.indexOf('a1') === 0 && this.fieldObj[key]) {
            //                     const tempObj = {
            //                         name: this.fieldObj[key].name || key,
            //                         value: this.webMsgList[i][key]
            //                     };
            //                     fields.push(tempObj);
            //                 }
            //             }
            //             // if(typeof(this.webMsgList[i].createTime) == String) {
            //             //     console.log('000',this.webMsgList[i])
            //             //     this.webMsgList[i].createTime = new Date(this.webMsgList[i].createTime).getTime()
            //             // }
            //             const obj = {
            //                 type: 'msg',
            //                 title: this.webMsgList[i].templateName,
            //                 time: this.webMsgList[i].createTime,
            //                 fields: fields
            //             };
            //             temp.push(obj);
            //         }
            //     }
            //     this.mergeInfoList = temp.sort(function(a, b) {
            //         return new Date(a.time).getTime() - new Date(b.time).getTime();
            //     });
            //     console.log('mergeInfoList', this.mergeInfoList);
            // },

            getFormByVisitorId(item, index) {
                console.log('aaaaa', item);
                if (item.createTime >= this.timeLine) {
                    this.getFormByVisitorIdP(item, index);
                } else {
                    this.getFormByVisitorIdO(item, index);
                }
            },

            async getFormByVisitorIdP(item, index) {
                this.isLoading = true;
                // this.webMsgList = []
                item.formList = [];
                const emailReg = Utils.regExp.fullEmail;
                const telReg = Utils.regExp.fullPhone;
                const idvisit = item.eventId.toString().startsWith('piwik') ? item.eventId.substring(6) : item.eventId;
                const visitorId = item.visitorId;
                const temp = (this.pageNo - 1) * 20 + index; // index 为分页后的序号,需要转换成this.lineList对应的位置
                const resData = await getLeaveMessagePiwik({ idvisit, visitorId });
                if (resData.code === '1' && resData.data.length) {
                    resData.data.forEach((id, index1) => {
                        util.ajaxJson({
                            url: 'form-cust/form/getColumnValue',
                            method: 'post',
                            params: {
                                id
                            }
                        }).then(res => {
                            if (res.data.code === '1') {
                                console.log('根据id获取留言', res.data.data);
                                // this.webMsgList.push(res.data.data)
                                const fields = {};
                                const element = res.data.data;
                                element.type = 'msg';
                                for (const key in element) {
                                    console.log('根据id获取留言', key);
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
                                            label: this.fieldObj[key].name,
                                            value: formData
                                        };
                                    }
                                }
                                element.fields = fields;
                                item.formList.push(element);
                                this.$set(this.lineList, temp, item);
                                if (item.visitorTrace) {
                                    this.handleInfo(item);
                                }
                                this.isLoading = false;
                            }
                            // this.mergeList();
                        });
                    });
                } else {
                    // this.webMsgList = []
                    // this.mergeList();
                    item.formList = [];
                    this.$set(this.lineList, temp, item);
                    if (item.visitorTrace) {
                        this.handleInfo(item);
                    }
                    this.isLoading = false;
                }
            },
            getFormByVisitorIdO(item) {
                this.isLoading = true;
                item.formList = [];
                const emailReg = Utils.regExp.fullEmail;
                const telReg = Utils.regExp.fullPhone;
                if (item.visitorId) {
                    util.ajax({
                        url: '/form-cust/form/getColumnValueListByVisitorId',
                        method: 'post',
                        data: {
                            visitorId: item.visitorId
                        }
                    }).then(ret => {
                        if (ret.data.code === '1') {
                            // this.webMsgList = ret.data.data;
                            const fields = {};
                            const element = res.data.data;
                            element.type = 'msg';
                            for (const key in element) {
                                console.log('根据id获取留言', key);
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
                                        label: this.fieldObj[key].name,
                                        value: formData
                                    };
                                }
                            }
                            element.fields = fields;
                            item.formList.push(element);
                            if (item.visitorTrace) {
                                this.handleInfo(item);
                            }
                        }
                        // this.mergeList();
                    });
                } else {
                    // this.mergeList();
                    if (item.visitorTrace) {
                        this.handleInfo(item);
                    }
                }
            },

            onResizeFunc() {
                this.modal_width = parseInt(document.body.clientWidth * 0.8);
            }
        }
    };
</script>

<style>
    @import "web.css";
</style>

<style lang="less" scoped>
    .time {
        font-size: 14px;
        font-weight: bold;
    }

    .content {
        padding-left: 5px;
    }
</style>
