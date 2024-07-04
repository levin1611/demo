<template>
    <div>
        <div class="new-chat-info-top visitor-access-track-info-top">
            <span v-if="browser" class="new-top-icon">
                <Tooltip :content="browserTip">
                    <!-- 彩色图标 -->
                    <svg class="icon" aria-hidden="true">
                        <use :xlink:href="browser"></use>
                    </svg>
                </Tooltip>
            </span>
            <span v-if="osInfo" class="new-top-icon">
                <Tooltip :content="osInfoTip">
                    <!-- 彩色图标 -->
                    <svg class="icon" aria-hidden="true">
                        <use :xlink:href="osInfo"></use>
                    </svg>
                </Tooltip>
            </span>
            <span style="float: right;margin-right: 10px">IP:{{getIP}}</span>
        </div>
        <div class="visitor-detail-item" v-if="from === 'xhl_chat'">
            <div v-for="(track, index) in trackList" style="border-bottom: 1px dashed #dbdbdb;padding: 16px 0 10px;font-size: 12px">
                <div class="track-top">
                    <span :title='track.title'
                          class="track-title" >{{ track.title | lengthFilter(20) }}</span>
                    <span class="track-time">{{ track.time | timeFormat("DateTime") }}</span>
                </div>
                <div class="item-body">
                    <div v-if="track.urlFrom">
                        <span v-if="track.urlTo">{{ $t('visitor_history.from') }}&nbsp;</span>
                        <span v-else>{{ $t('visitor_history.to') }}&nbsp;</span>
                        <a :href="track.urlFrom"
                           target="_blank"
                           style="padding-left:10px"
                           class="item-event">{{ track.urlFrom }}</a>
                    </div>
                    <div v-if="track.urlTo">
                        {{ $t('visitor_history.to') }}
                        <a :href="track.urlTo"
                           target="_blank"
                           style="padding-left:10px"
                           class="item-event">{{ track.urlTo }}</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import util from '@/libs/util';
    // facebook访客历史相关组件
    import LocusSide from '@/views/facebook/inbox/components/LocusSide';
    import WhatsAppRelatedRecords from '@/views/whatsapp-manage/components/whatsAppRelatedRecords.vue';

    export default {
        name: 'visitor-access-track',
        props: [
            'from',
            'originalType',
            'currentTab',
            'currVisitorId',
            'currAccountInfo'
        ],
        components:{
            LocusSide,
            WhatsAppRelatedRecords
        },
        computed: {
            ...mapState([
                'currPersonTrackList',
                'enterpriseId'
            ]),
            trackList() {
                // if(this.from ==='xhl_chat'){
                    let list = [];
                    if (this.currPersonTrackList) {
                        const content = this.currPersonTrackList.content;
                        if (content) {
                            const contentJson = JSON.parse(content);
                            const trackList = contentJson.xUserInfo.track;
                            if (trackList) {
                                for (let i = 0; i < trackList.length; i++) {
                                    const obj = {
                                        title: trackList[i].title,
                                        urlFrom: trackList[i].url,
                                        urlTo: '',
                                        time: trackList[i].time,
                                        flag: this.$options.filters.timeFormat(trackList[i].time)
                                    };
                                    list.push(obj);
                                }
                            }
                        }
                    }
                    // 拼接历史访问轨迹
                    if (Array.isArray(this.historyTrackList) && this.historyTrackList.length) {
                        // 格式化历史访问轨迹
                        const historyList = this.historyTrackList.map(item => {
                            return {
                                title: item.title,
                                urlFrom: item.currentActionName,
                                urlTo: '',
                                time: item.enterTime,
                                flag: this.$options.filters.timeFormat(item.enterTime)
                            };
                        });

                        let startTime = historyList[0].time;
                        startTime = (new Date(startTime)).getTime();

                        // 过滤掉早于历史轨迹最早一条消息的云信轨迹(认为该轨迹不是"最近一次会话"的轨迹)
                        list = list.filter(item => (new Date(item.time)).getTime() > startTime);
                        // 过滤掉云信轨迹中与历史轨迹重复项, 同一秒内
                        list = list.filter(item => historyList.every(track => Math.abs((new Date(track.time)).getTime() - (new Date(item.time)).getTime()) > 1000));
                        // 拼接并排序
                        list = list.concat(historyList).sort((a, b) => new Date(a.time).getTime() - (new Date(b.time)).getTime());
                    }
                    return list;
                    
                // }
                
            },
            getIP() {
                return this.$store.state.visitorBaseInfo.ipAddress || this.$t('chat.notHave');
            },
            /** 匹配浏览器对应的图标 */
            browser() {
                switch (this.$store.state.visitorBaseInfo.browser) {
                    case 'AO':
                    case 'AS':
                    case 'BR':
                    case 'CC':
                    case 'CD':
                    case 'CF':
                    case 'CH':
                    case 'CI':
                    case 'CM':
                    case 'CN':
                    case 'CP':
                    case 'CR':
                    case 'IR':
                    case 'PT':
                        this.browserTip = 'chrome';
                        return '#custom-chrome';
                    case '36':
                    case '3B':
                        this.browserTip = '360';
                        return '#custom-360';
                    case 'MF':
                    case 'SF':
                    case 'SA':
                        this.browserTip = 'safari';
                        return '#custom-safari';
                    case 'WF':
                    case 'SX':
                    case 'PX':
                    case 'MB':
                    case 'FM':
                    case 'FF':
                    case 'FE':
                    case 'FB':
                    case 'EI':
                    case 'CU':
                        this.browserTip = 'firefox';
                        return '#custom-Firefox';
                    case 'OP':
                    case 'OO':
                    case 'ON':
                    case 'OM':
                    case 'OI':
                        this.browserTip = 'opera';
                        return '#custom-opera';
                    case 'IE':
                    case 'IM':
                        this.browserTip = 'IE';
                        return '#custom-IE';
                    case 'BD':
                    case 'BS':
                        this.browserTip = 'Baidu';
                        return '#custom-baidu';
                    default:
                        this.browserTip = '';
                        return '';
                }
            },
            /** 匹配系统对应的图标 */
            osInfo() {
                /* 'Windows'、'Android'、 'iPhone'、'IPad'、'Mac'、'Lunix'、'Unix' */
                switch (this.$store.state.visitorBaseInfo.osInfo) {
                    case 'WCE':
                    case 'WIN':
                    case 'WIO':
                    case 'WMO':
                    case 'WPH':
                    case 'WRT':
                        this.osInfoTip = 'Windows';
                        return '#custom-windows';
                    case 'AND':
                    case 'CYN':
                    case 'MCD':
                    case 'MLD':
                    case 'REM':
                    case 'RZD':
                    case 'YNS':
                        this.osInfoTip = 'Android';
                        return '#custom-android';
                    case 'IOS':
                        this.osInfoTip = 'IOS';
                        return '#custom-ios';
                    default:
                        this.osInfoTip = '';
                        return '';
                }
            }
        },
        data() {
            return {
                browserTip: '',
                osInfoTip: '',
                historyTrackList: [], // currVisitorId 最近一次对话后端保存的历史轨迹
            };
        },
        watch: {
            currentTab: {
                 handler(val) {
                     if(val === 'VisitorAccessTrack') {
                        if(this.from === 'xhl_chat') {
                            this.getHistoryTrackList();
                        }else if(this.from === 'fb_chat'){
                            this.getLocusSideStatus()
                        }else if(this.from.indexOf('mail')!= -1) {
                            this.getVisitorId()
                        }
                    }
                },
                immediate: true
            }
        },
        methods: {
            // 网站我的聊天 获取实时轨迹
            getHistoryTrackList(visitorMailId) {
                const currVisitorId = visitorMailId ? visitorMailId : this.currVisitorId ? this.currVisitorId : this.$store.state.currVisitorId;
                this.historyTrackList = [];
                util.ajaxInternationalJson({
                    url: '/piwikRead/visitorHistory/getCussLastEventTrace',
                    method: 'get',
                    params: {
                        visitorId: currVisitorId,
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        if (response.data.data && Array.isArray(response.data.data.visitorTraces)) {
                            this.historyTrackList = response.data.data.visitorTraces;
                        }else{
                            this.historyTrackList = [];
                        }
                    } else {
                        this.$Message.error(this.$t('visitor_history.error_getHistoryTrackList'));
                    }
                }).catch(error => {
                    this.$Message.error(this.$t('visitor_history.error_getHistoryTrackList'));
                });
            },
            // mail 通过mail地址获取访客id
            getVisitorId() {
                
                console.log(this.currPersonTrackList)
                util.ajaxMailJson({
                    url: '/crm/monitoringrelatedvisitor/getMonitoringVisitorRelation',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        visitorType: 1,
                        visitorId: this.currAccountInfo.mailAddress
                    }
                })
                .then((res) => {
                    if(res.data.code === '1'){
                        const data = res.data.data.relationList;
                        if(data.length) {
                            let visitorMailId = data.find(item => item.visitorType === 2).visitorId;
                            this.getHistoryTrackList(visitorMailId)
                        }
                    }
                })
                
            }
            
        },
        created() {
            // if(this.from === 'xhl_chat'){
            //     this.getHistoryTrackList();
            // }else if(this.from === 'fb_chat'){
            //     this.getLocusSideStatus()
            // }
        }
    };
</script>

<style scoped>
    .visitor-detail-item{
        /* background-color: #F9FBFD */
    }
    .visitor-access-track-info-top{
        width: 100%;
        overflow: hidden;
        height: auto;
        line-height: 24px;
        padding-bottom: 14px;
    }
</style>
