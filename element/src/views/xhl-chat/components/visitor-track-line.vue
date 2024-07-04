<template>
    <div>
        <div style="margin:5px 10px 0 -10px;background-color: #F9FBFD;padding: 0 20px"
             class="visitor-detail-item" >
            <div v-for="(track, index) in trackList" :key="index"
                 style="border-bottom: 1px dashed #dbdbdb;padding: 16px 0 10px;font-size: 12px">
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

    export default {
        name: 'visitor-track-line',
        computed: {
            ...mapState([
                'currPersonTrackList',
                'currVisitorId',
                'enterpriseId'
            ]),
            trackList() {
                try {
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
                } catch (error) {
                    console.error('error', error);
                    return [];
                }
            }
        },
        data() {
            return {
                historyTrackList: [] // currVisitorId 最近一次对话后端保存的历史轨迹
            };
        },
        methods: {
            getHistoryTrackList() {
                this.historyTrackList = [];
                util.ajaxInternationalJson({
                    url: '/piwikRead/visitorHistory/getCussLastEventTrace',
                    method: 'get',
                    params: {
                        visitorId: this.currVisitorId,
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        if (response.data.data && Array.isArray(response.data.data.visitorTraces)) {
                            this.historyTrackList = response.data.data.visitorTraces;
                        }
                    } else {
                        this.$Message.error(this.$t('visitor_history.error_getHistoryTrackList'));
                    }
                }).catch(error => {
                    this.$Message.error(this.$t('visitor_history.error_getHistoryTrackList'));
                });
            }
        },
        created() {
            this.getHistoryTrackList();
        }
    };
</script>

<style scoped>

</style>
