<template>
    <Statistic
            :dimensionList="dimensionList"
            :quotaColumns="quotaColumns"
            :periodList="periodList"
            :reportUrl="'report/visitorReport/getVisitorStatList'"
            :exportUrl="'report/visitorReport/getVisitorStatListExcel'"
            :urlData="urlData"
            :idData="idData"
            :urlObj="urlObj"
            :tabs="tabs"
            @changeDimension="value=>dimension = value"></Statistic>
</template>
<script>
    import util from '@/libs/util.js';
    import { mapState } from 'vuex';
    import Statistic from '../components/statistics';

    export default {
        name: 'traffic_statistics',
        components: {
            Statistic
        },
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId'
            }),
            quotaColumns() {
                if (this.dimension.value === 8) {
                    return this.extraColumn.concat(this.partColumns);
                } else {
                    return this.partColumns;
                }
            }
        },
        data() {
            return {
                urlObj: {},
                urlData: [],
                idData: [],
                dimensionList: [
                    {
                        width: 110,
                        value: 1,
                        title: this.$t('data_report.date'),
                        key: 'dimension',
                        filter: true,
                        sort: true,
                        orderBy: 0,
                        time: true
                    },
                    {
                        width: 110,
                        value: 2,
                        title: this.$t('data_report.sourceChannel'),
                        key: 'dimension',
                        filter: true,
                        sort: true,
                        orderBy: 0
                    },
                    {
                        width: 110,
                        value: 4,
                        title: this.$t('data_report.nation'),
                        key: 'dimension',
                        filter: true,
                        sort: true,
                        orderBy: 0
                    },
                    {
                        width: 150,
                        value: 8,
                        title: this.$t('data_report.pageURLs'),
                        key: 'dimension',
                        filter: true,
                        sort: true,
                        orderBy: 0
                    }
                    // {value:9,title:'页面标题',key:'dimension',filter:true,sort:true,orderBy:0},
                ], /* 所有维度列表 */
                partColumns: [
                    {
                        width: 110,
                        title: this.$t('data_report.traffic_statistics.visitors'),
                        key: 'visitorCount',
                        filter: false,
                        sort: true,
                        orderBy: 12
                    },
                    {
                        width: 110,
                        title: this.$t('data_report.traffic_statistics.sessionCount'),
                        key: 'sessionCount',
                        filter: false,
                        sort: true,
                        orderBy: 3
                    },
                    {
                        width: 100,
                        title: this.$t('data_report.traffic_statistics.ipCount'),
                        key: 'ipCount',
                        filter: false,
                        sort: true,
                        orderBy: 4
                    },
                    {
                        width: 110,
                        title: this.$t('data_report.traffic_statistics.residenceTime'),
                        key: 'residenceTime',
                        filter: false,
                        sort: true,
                        orderBy: 5
                    },
                    {
                        width: 110,
                        title: this.$t('data_report.traffic_statistics.bounceRate'),
                        key: 'bounceRate',
                        filter: false,
                        sort: true,
                        orderBy: 6
                    },
                    {
                        width: 110,
                        title: this.$t('data_report.traffic_statistics.conversationCount'),
                        key: 'conversationCount',
                        filter: false,
                        sort: true,
                        orderBy: 7
                    },
                    {
                        width: 110,
                        title: this.$t('data_report.traffic_statistics.messageTimes'),
                        key: 'messageCount',
                        filter: false,
                        sort: true,
                        orderBy: 8
                    },
                    {
                        width: 100,
                        title: this.$t('data_report.clueCount'),
                        key: 'clueCount',
                        filter: false,
                        sort: true,
                        orderBy: 9
                    },
                    {
                        width: 100,
                        title: this.$t('data_report.inqCount'),
                        key: 'inquiryCount',
                        filter: false,
                        sort: true,
                        orderBy: 10
                    }
                ],
                extraColumn: [
                    {
                        width: 150,
                        title: this.$t('data_report.traffic_statistics.pageTitle'),
                        key: 'title',
                        filter: false,
                        sort: true,
                        orderBy: 11
                    },
                    {
                        width: 110,
                        title: this.$t('data_report.traffic_statistics.entryCount'),
                        key: 'entryCount',
                        filter: false,
                        sort: true,
                        orderBy: 1
                    },
                    {
                        width: 110,
                        title: this.$t('data_report.traffic_statistics.scanCount'),
                        key: 'scanCount',
                        filter: false,
                        sort: true,
                        orderBy: 2
                    }
                ],
                periodList: [
                    { value: '1', label: this.$t('data_report.period_list.date'), key: 'dimension' },
                    { value: '2', label: this.$t('data_report.period_list.week'), key: 'dimension' },
                    { value: '3', label: this.$t('data_report.period_list.month'), key: 'dimension' },
                    { value: '4', label: this.$t('data_report.period_list.quarter'), key: 'dimension' },
                    { value: '5', label: this.$t('data_report.period_list.year'), key: 'dimension' }
                ],
                tabs: [
                    { title: this.$t('data_report.traffic_statistics.allVisitors'), key: 'visitorType', value: 0 },
                    { title: this.$t('data_report.traffic_statistics.oldVisitors'), key: 'visitorType', value: 1 }
                ],
                dimension: {}
            };
        },
        methods: {
            /* 改变统计周期 */
            changePeriod(data) {
                this.dimensionList[0] = { ...this.dimensionList[0], ...data };
            },
            getWebsite() {
                util.ajaxInternationalJson({
                    url: '/piwik/websiteSettings/getWebsiteByOrgId',
                    method: 'get',
                    params: {
                        orgId: this.orgId
                    }
                }).then(response => {
                    this.urlData = response.data.data;
                    for (let i = 0; i < this.urlData.length; i++) {
                        this.idData.push(this.urlData[i].matomoSiteId);
                    }
                    for (let i = 0; i < this.urlData.length; i++) {
                        const temp = this.urlData;
                        this.urlObj[temp[i].matomoSiteId] = temp[i].webSiteUrl;
                    }
                });
            }
        },
        created() {
            this.getWebsite();
        }
    };
    // eslint-disable-next-line no-extend-native
    Date.prototype.format = function(fmt) {
        const o = {
            'M+': this.getMonth() + 1, // 月份
            'd+': this.getDate(), // 日
            'h+': this.getHours(), // 小时
            'm+': this.getMinutes(), // 分
            's+': this.getSeconds(), // 秒
            'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
            S: this.getMilliseconds() // 毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()
            }`).substr(4 -
                RegExp.$1.length));
        }
        for (const k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
                    ? (o[k])
                    : ((`00${o[k]}`).substr((`${o[k]}`).length)));
            }
        }
        return fmt;
    };
</script>
<style lang="less">
    @import '../css/statistic-report.less';
</style>
