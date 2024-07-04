<template>
    <Card style="min-width:750px;" class="social-report">
        <!-- 表头、时间选择器 -->
        <div class="top">
            <h1 class="title">{{$t('facebook.reporting.marketingAnalysis')}}</h1>
            <div class="filter">
                <Row style="float:left">
                    <Col :span="24">
                        <DatePicker v-model="dateValue" @change="changeDate" type="daterange" :picker-options="dateLimit"
                        value-format="yyyy-MM-dd" :clearable="false" :editable="false" style="width: 200px"></DatePicker>
                    </Col>
                </Row>
            </div>
        </div>

        <div class="data" v-loading="marketingLoading">
            <Row style="padding-bottom: 30px;">
                <!-- FB主页选择菜单 -->
                <Col :span="24">
                    <div style="position: relative;margin-bottom: 80px;">
                        <Select v-model="accountId" class="user" :placeholder="$t('facebook.page')"
                                @change="getMarketing"
                                style="position: absolute;top: 20px;right: 70px;">
                            <Option value="all" :label="$t('facebook.reporting.all')"></Option>
                            <Option disabled v-if="accountLoading" value=""></Option>
                            <Option v-if="!accountList.length" value="" >
                                <span style="font-size:12px">{{$t('facebook.reporting.notHaveValidBrand')}}</span>&nbsp;
                                <a style="font-size:12px" @click="goToBind">{{$t('facebook.inbox.gotoBind')}}</a>
                            </Option>
                            <Option v-for="item in accountList" :value="item.key" :key="item.key" :label="item.value"></Option>
                        </Select>
                    </div>
                </Col>
                <!-- 粉丝数 --- 改为点赞数 -->
                <Col :span="4" class="datawrap">
                    <p class="data_title">{{$t('facebook.likers')}}</p>
                    <br>
                    <p class="data_main">
                        <img src="./images/fans.png" alt="">
                        <template v-if="accountId === 'all'">
                            <Poptip placement="bottom-start" trigger="hover" @show="marketingPoptipShow(1)">
                                <span class="number" v-html="marketingData.friendCount" slot="reference"></span>
                                <div style="position: relative">
                                    <!-- <Spin v-if="marketingPoptipLoading[1]" fix></Spin> -->
                                    <template v-loading="marketingPoptipLoading[1]">
                                        <div v-for="(item,index) in marketingPoptipData[1]" :key="index">
                                            {{ item.accountName }}: {{ item.count }}
                                        </div>
                                    </template>
                                </div>
                            </Poptip>
                        </template>
                        <template v-else>
                            <span class="number" v-html="marketingData.friendCount"></span>
                        </template>
                    </p>
                </Col>
                <!-- 帖子数 -->
                <Col :span="4" :offset="1" class="datawrap">
                    <p class="data_title">
                        {{ $t('facebook.post') }}
                        <!-- 系统 tip -->
                        <HelpTip :title="$t('helpTip.post')"></HelpTip>
                    </p>
                    <br>
                    <p class="data_main">
                        <template v-if="accountId === 'all'">
                            <Poptip placement="bottom-start" trigger="hover" @show="marketingPoptipShow(2)">
                                <span class="number" v-text="marketingData.cardCount" slot="reference"></span>
                                <div style="position: relative">
                                    <template v-loading="marketingPoptipLoading[2]">
                                        <div v-for="(item,index) in marketingPoptipData[2]" :key="index">
                                            {{ item.accountName }}: {{ item.count }}
                                        </div>
                                    </template>
                                </div>
                            </Poptip>
                        </template>
                        <template v-else>
                            <span class="number" v-text="marketingData.cardCount"></span>
                        </template>
                    </p>
                </Col>
                <!-- FB Leads -->
                <Col :span="4" :offset="1" class="datawrap">
                    <p class="data_title">FB Leads</p>
                    <br>
                    <p class="data_main">
                        <template v-if="accountId === 'all'">
                            <Poptip placement="bottom" trigger="hover" @show="marketingPoptipShow(3)">
                                <span class="number" v-text="marketingData.leadsCount" slot="reference"></span>
                                <div style="position: relative">
                                    <template v-loading="marketingPoptipLoading[3]">
                                        <div v-for="(item,index) in marketingPoptipData[3]" :key="index">
                                            {{ item.accountName }}: {{ item.count }}
                                        </div>
                                    </template>
                                </div>
                            </Poptip>
                        </template>
                        <template v-else>
                            <span class="number" v-text="marketingData.leadsCount"></span>
                        </template>
                    </p>
                </Col>
                <!-- FB私信 -->
                <Col :span="4" :offset="1" class="datawrap">
                    <p class="data_title">{{$t('facebook.reporting.fbChat')}}</p>
                    <br>
                    <p class="data_main">
                        <template v-if="accountId === 'all'">
                            <Poptip placement="bottom-end" trigger="hover" @show="marketingPoptipShow(4)">
                                <span class="number" v-text="marketingData.privateLetterCount" slot="reference"></span>
                                <div style="position: relative">
                                    <template v-loading="marketingPoptipLoading[4]">
                                        <div v-for="(item,index) in marketingPoptipData[4]" :key="index">
                                            {{ item.accountName }}: {{ item.count }}
                                        </div>
                                    </template>
                                </div>
                            </Poptip>
                        </template>
                        <template v-else>
                            <span class="number" v-text="marketingData.privateLetterCount"></span>
                        </template>
                    </p>
                </Col>
                <!-- FB评论 -->
                <Col :span="4" :offset="1" class="datawrap">
                    <p class="data_title">{{$t('facebook.reporting.fbComment')}}</p>
                    <br>
                    <p class="data_main">
                        <template v-if="accountId === 'all'">
                            <Poptip placement="bottom-end" trigger="hover" @show="marketingPoptipShow(5)">
                                <span class="number" v-text="marketingData.commentCount" slot="reference"></span>
                                <div style="position: relative">
                                    <template v-loading="marketingPoptipLoading[5]">
                                        <div v-for="(item,index) in marketingPoptipData[5]" :key="index">
                                            {{ item.accountName }}: {{ item.count }}
                                        </div>
                                    </template>
                                </div>
                            </Poptip>
                        </template>
                        <template v-else>
                            <span class="number" v-text="marketingData.commentCount"></span>
                        </template>
                    </p>
                </Col>
            </Row>
        </div>
        <!-- 访问量分析 -->
        <div class="visited">
            <h2>{{$t('facebook.reporting.trafficAnalysis')}}</h2>
            <div class="visited_main" v-loading="visitLoading">
                <div id="socialReporting_visitChart" :style="{width: '100%', height: '350px'}"></div>
                <Select v-model="visitType" class="user" :placeholder="$t('facebook.reporting.trafficType')"
                        style="position: absolute;top: 20px;right: 70px;">
                    <Option v-for="item in visitTypeList" :value="item.value" :key="item.value" :label="item.label"></Option>
                </Select>
            </div>
        </div>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import Utils from '@/utils';
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'social_reporting',
        data() {
            return {
                /* 全局 */
                userId: '',
                platformList: [
                    {
                        value: 'Facebook',
                        label: 'Facebook'
                    },
                    {
                        value: 'Twitter',
                        label: 'Twitter'
                    },
                    {
                        value: 'VK',
                        label: 'VK'
                    },
                    {
                        value: 'Linkedin',
                        label: 'Linkedin'
                    }
                ],
                platform: 'Facebook',
                startDate: '',
                endDate: '',
                dateValue: [],
                dateLimit: {
                    shortcuts: [
                        {
                            text: this.$t('facebook.reporting.yesterday'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                start.setTime(start.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('facebook.reporting.recent7days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('facebook.reporting.recent14days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 14);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('facebook.reporting.recent30days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('facebook.reporting.lastWeek'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                let dayNo = start.getDay();
                                dayNo = dayNo || 7;
                                end.setTime(end.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                start.setTime(end.getTime() - 6 * 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('facebook.reporting.lastMonth'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() - 24 * 60 * 60 * 1000);
                                start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        }
                    ],
                    disabledDate: function(date) {
                        return date.getTime() > Date.now() - 3600 * 1000 * 24 || date.getTime() < (new Date('2017-12-31')).getTime();
                    }
                },

                /* 营销分析概况 */
                accountList: [],
                accountId: 'all',
                marketingData: {
                    friendCount: 0,
                    leadsCount: 0,
                    cardCount: 0,
                    privateLetterCount: 0,
                    commentCount: 0
                },
                marketingLoading: false,
                accountLoading: false,
                marketingPoptipMap: new Map([
                    [1, this.$t('facebook.followers')],
                    [2, this.$t('facebook.post')],
                    [3, this.$t('facebook.reporting.fbLeads')],
                    [4, this.$t('facebook.reporting.fbChat')],
                    [5, this.$t('facebook.reporting.fbComment')]
                ]),
                marketingPoptipLoading: {
                    1: true,
                    2: true,
                    3: true,
                    4: true,
                    5: true
                },
                marketingPoptipData: {
                    1: [],
                    2: [],
                    3: [],
                    4: [],
                    5: []
                },

                /* 访问量分析 */
                visitType: 'all',
                visitTypeList: [
                    {
                        value: 'all',
                        label: this.$t('facebook.reporting.fbInteractive')
                    },
                    {
                        value: 'leads',
                        label: this.$t('facebook.reporting.fbLeads')
                    },
                    {
                        value: 'privateLetter',
                        label: this.$t('facebook.reporting.fbChat')
                    },
                    {
                        value: 'comment',
                        label: this.$t('facebook.reporting.fbComment')
                    }
                ],
                visitTypeListMap: new Map([
                    ['all', this.$t('facebook.reporting.fbInteractive')],
                    ['leads', this.$t('facebook.reporting.fbLeads')],
                    ['privateLetter', this.$t('facebook.reporting.fbChat')],
                    ['comment', this.$t('facebook.reporting.fbComment')]
                ]),
                visitLoading: false,
                visitData: [],
                visitChart: null,
                visitChartOption: {
                    color: Utils.chartColors_80per,
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        },
                        formatter: (params) => {
                            let str = `${params[0].axisValue}<br>${this.$t('facebook.reporting.category')}: ${this.$t('facebook.reporting.count')}`;
                            params.map(item => {
                                str += `<br>${item.marker} ${item.seriesName}: ${item.value}`;
                            });
                            return str;
                        }
                    },
                    legend: {
                        data: ['', this.$t('facebook.reporting.clue'), this.$t('facebook.reporting.inquiry')]
                    },
                    calculable: true,
                    xAxis: [
                        {
                            type: 'category',
                            axisTick: { show: false },
                            axisLine: {
                                lineStyle: {
                                    color: '#eff0f4',
                                    width: 2
                                }
                            },
                            axisLabel: {
                                color: 'rgba(0, 0, 0, .8)'
                            },
                            data: []
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            axisLine: {
                                show: false
                            },
                            splitLine: {
                                show: true,
                                lineStyle: {
                                    color: '#eff0f4',
                                    type: 'dashed'
                                }
                            }
                        }
                    ],
                    dataZoom: [],
                    series: [
                        {
                            name: '',
                            type: 'bar',
                            barGap: 0,
                            data: [],
                            itemStyle: {
                                normal: {
                                    label: {
                                        show: true,
                                        position: 'top',
                                        formatter: (params) => {
                                            if (params.data !== 0) {
                                                return params.data;
                                            } else {
                                                return '';
                                            }
                                        },
                                        textStyle: {
                                            color: '#000'
                                        }
                                    }
                                }
                            }
                        },
                        {
                            name: this.$t('facebook.reporting.clue'),
                            type: 'bar',
                            data: [],
                            itemStyle: {
                                normal: {
                                    label: {
                                        show: true,
                                        position: 'top',
                                        formatter: (params) => {
                                            if (params.data !== 0) {
                                                return params.data;
                                            } else {
                                                return '';
                                            }
                                        },
                                        textStyle: {
                                            color: '#000'
                                        }
                                    }
                                }
                            }
                        },
                        {
                            name: this.$t('facebook.reporting.inquiry'),
                            type: 'bar',
                            data: [],
                            itemStyle: {
                                normal: {
                                    label: {
                                        show: true,
                                        position: 'top',
                                        formatter: (params) => {
                                            if (params.data !== 0) {
                                                return params.data;
                                            } else {
                                                return '';
                                            }
                                        },
                                        textStyle: {
                                            color: '#000'
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            };
        },
        created: function() {
            this.userId = this.$store.state.userId;
            this.dateFormat();

            // 设置默认时间为当月
            this.startDate = (new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).format('yyyy-MM-dd');
            this.endDate = (new Date(Date.now() - 24 * 60 * 60 * 1000)).format('yyyy-MM-dd');
            this.dateValue = [this.startDate, this.endDate];
            this.getAccountList();
            this.getMarketing(this.accountId);
            this.getVisit();
        },
        mounted() {
            this.visitChart = this.$echarts.init(document.getElementById('socialReporting_visitChart'));
            this.visitChart.setOption(this.visitChartOption);
        },
        beforeDestroy() {
            if (this.visitChart && this.visitChart.dispose) {
                this.visitChart.dispose();
            }
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                window_width: 'window_width',
                window_height: 'window_height'
            }),
            ...mapGetters([
                'isContainsMenu'
            ])
        },
        methods: {
            // 去绑定
            goToBind() {
                this.accountId = 'all';
                if (this.isContainsMenu('account_binding')) {
                    window.open('#/systemSettings/facebookBinding/account_binding', '_blank');
                    // this.$router.push({
                    //     name: 'account_binding'
                    // });
                } else {
                    this.$Message.warning(this.$t('inbox.tip'));
                }
            },
            /* 全局 */
            dateFormat() {
                Date.prototype.format = function(fmt) {
                    const o = {
                        'M+': this.getMonth() + 1, // 月份
                        'd+': this.getDate(),		// 日
                        'h+': this.getHours(),		// 小时
                        'm+': this.getMinutes(),	// 分
                        's+': this.getSeconds(),	// 秒
                        'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
                        S: this.getMilliseconds() // 毫秒
                    };
                    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()}`).substr(4 - RegExp.$1.length));
                    for (const k in o) { if (new RegExp(`(${k})`).test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length))); }
                    return fmt;
                };
            },
            // 日期选择
            changeDate(val) {
                if (val.length === 2) {
                    this.startDate = val[0];
                    this.endDate = val[1];
                } else {
                    this.startDate = '';
                    this.endDate = '';
                }
                this.marketingPoptipLoading = {
                    1: true,
                    2: true,
                    3: true,
                    4: true,
                    5: true
                };
                this.getMarketing(this.accountId);
                this.getVisit();
            }, // 改变日期

            /* 营销分析概况 */
            getMarketing(val) {
                if (val === 'all') {
                    val = '';
                }
                this.marketingLoading = true;
                util.ajax({
                    url: '/report/social/getFacebookCount',
                    method: 'get',
                    timeout: 60000,
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        accountId: val,
                        startTime: this.startDate,
                        endTime: this.endDate
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.marketingData = Object.assign(this.marketingData, response.data.data);
                    } else {
                        this.$Message.error(this.$t('facebook.reporting.getMarketingFailTip'));
                    }
                    this.marketingLoading = false;
                }).catch(erro => {
                    this.$Message.error(this.$t('facebook.reporting.getMarketingFailTip'));
                });
            },
            // 获取营销分析概况
            getAccountList() {
                this.accountLoading = true;
                util.ajax({
                    url: '/report/social/getFacebookPageList',
                    method: 'get',
                    timeout: 60000,
                    params: {
                        userId: this.userId,
                        providerId: 'facebook',
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.accountList = response.data.data;
                    } else {
                        this.$Message.error(this.$t('facebook.reporting.getAccountListFailTip'));
                    }
                    this.accountLoading = false;
                }).catch(erro => {
                    this.$Message.error(this.$t('facebook.reporting.getAccountListFailTip'));
                });
            },
            // 获取已绑定 FB 主页列表
            marketingPoptipShow(type) {
                if (this.marketingPoptipLoading[type]) {
                    util.ajax({
                        url: '/report/social/getEveryPageCount',
                        method: 'get',
                        timeout: 60000,
                        params: {
                            userId: this.userId,
                            orgId: this.enterpriseId,
                            type: type,
                            providerId: 'facebook',
                            startTime: this.startDate,
                            endTime: this.endDate
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.marketingPoptipData[type] = [];
                            this.marketingPoptipData[type] = response.data.data.map(item => {
                                return {
                                    accountName: item.providerUserName,
                                    count: item.count
                                };
                            });
                            this.marketingPoptipLoading[type] = false;
                        } else {
                            this.$Message.error(`${this.marketingPoptipMap.get(type)}${this.$t('facebook.reporting.detailFailTip')}`);
                        }
                    }).catch(erro => {
                        this.$Message.error(`${this.marketingPoptipMap.get(type)}${this.$t('facebook.reporting.detailFailTip')}`);
                    });
                }
            }, // 当显示全部主页时,鼠标移动到数字上显示各个主页分别的数量

            /* 访问量分析 */
            getVisit() {
                this.visitLoading = true;
                this.visitData = [];
                util.ajax({
                    url: '/report/social/getLeadsCount',
                    method: 'get',
                    timeout: 60000,
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        startTime: this.startDate,
                        endTime: this.endDate
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.visitData = response.data.data.map(item => {
                            const temp = Object.assign({}, item);
                            temp.all = temp.privateLetter + temp.comment + temp.leads;
                            temp.allClue = temp.privateLetterClue + temp.commentClue + temp.leadsClue;
                            temp.allInquiry = temp.privateLetterInquiry + temp.commentInquiry + temp.leadsInquiry;
                            return temp;
                        });
                    } else {
                        this.$Message.error(this.$t('facebook.reporting.getVisitFailTip'));
                    }
                    this.visitLoading = false;
                }).catch(erro => {
                    this.$Message.error(this.$t('facebook.reporting.getVisitFailTip'));
                });
            } // 获取分析
        },
        watch: {

            visitLoading(val) {
                if (val === false) {
                    /* 设置图例名称 */
                    this.visitChartOption.series[0].name = this.visitTypeListMap.get(this.visitType);
                    this.visitChartOption.legend.data.splice(0, 1, this.visitTypeListMap.get(this.visitType));

                    /* 数据置空 */
                    this.visitChartOption.xAxis[0].data = []; // 时间
                    this.visitChartOption.series[0].data = []; // FB
                    this.visitChartOption.series[1].data = []; // 线索
                    this.visitChartOption.series[2].data = []; // 询盘

                    if (this.visitData.length > 0) {
                        this.visitData.map(item => {
                            this.visitChartOption.xAxis[0].data.push(item.date);
                            this.visitChartOption.series[0].data.push(item[this.visitType]);
                            this.visitChartOption.series[1].data.push(item[`${this.visitType}Clue`]);
                            this.visitChartOption.series[2].data.push(item[`${this.visitType}Inquiry`]);
                        });
                    }

                    // 数据过多则显示底部选择区域
                    this.$set(this.visitChartOption, 'dataZoom', this.visitData.length > 10 ? [
                        {
                            type: 'slider',
                            show: true,
                            startValue: this.visitData.length - 9,
                            endValue: this.visitData.length,
                            zoomLock: true
                        }
                    ] : []);

                    this.visitChart.clear();
                    this.visitChart.setOption(this.visitChartOption);
                }
            },
            visitType(val) {
                /* 设置图例名称 */
                this.visitChartOption.series[0].name = this.visitTypeListMap.get(val);
                this.visitChartOption.legend.data.splice(0, 1, this.visitTypeListMap.get(val));

                /* 数据置空 */
                this.visitChartOption.series[0].data = []; // FB
                this.visitChartOption.series[1].data = []; // 线索
                this.visitChartOption.series[2].data = []; // 询盘

                this.visitData.map(item => {
                    this.visitChartOption.series[0].data.push(item[val]);
                    this.visitChartOption.series[1].data.push(item[`${val}Clue`]);
                    this.visitChartOption.series[2].data.push(item[`${val}Inquiry`]);
                });

                this.visitChart.clear();
                this.visitChart.setOption(this.visitChartOption);
            },
            activated() {
                if (this.visitChart.resize) {
                    this.visitChart.resize();
                }
            },
            window_width() {
                if (this.visitChart.resize) {
                    this.visitChart.resize();
                }
            }
        }
    };
</script>

<style scoped>
    .top {
        width: 100%;
        height: 45px;
    }

    .title {
        font-size: 16px;
        color: #2d2f2e;
        line-height: 44px;
        float: left;
        font-weight: 500;
    }

    .filter {
        float: right;
        margin-top: 10px;
    }

    .filter >>> .el-date-editor .el-range-input {
        font-size: 12px;
    }

    .data {
        width: 100%;
        height: 171px;
        border: solid 1px #dddddd;
        border-radius: 4px;
        margin-top: 5px;
        background-color: #fff;
        position: relative;
        -webkit-box-shadow: 0 0 4px rgba(0, 0, 0, .13);
        -moz-box-shadow: 0 0 4px rgba(0, 0, 0, .13);
        box-shadow: 0 0 4px rgba(0, 0, 0, .13);
    }

    .data_title {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.8);
        text-align: center;
    }

    .data_main {
        text-align: center;
        margin-top: -10px;
    }

    .data_main > span {
        font-size: 14px;
        color: #808080;
    }

    .data_main >>> span.number {
        font-size: 40px;
        color: rgba(0, 0, 0, 0.8);
        margin: 0 5px;
    }

    .visited > h2 {
        font-size: 16px;
        color: #2d2f2e;
        line-height: 44px;
        margin-top: 20px;
        font-weight: 500;
    }

    .visited_main {
        width: 100%;
        height: 378px;
        border: solid 1px #dddddd;
        border-radius: 4px;
        padding-top: 25px;
        position: relative;
        margin-top: 5px;
        background-color: #fff;
        -webkit-box-shadow: 0 0 4px rgba(0, 0, 0, .13);
        -moz-box-shadow: 0 0 4px rgba(0, 0, 0, .13);
        box-shadow: 0 0 4px rgba(0, 0, 0, .13);
    }

    .date_wrap {
        width: 200px;
        height: 32px;
        position: absolute;
        top: 20px;
        right: 70px;
    }

    .plat {
        width: 100px;
        float: left;
        margin-right: 5px;
    }

    .user {
        width: 100px;
        float: left;
        margin-right: 5px;
    }
</style>

<style>
    .ivu-select-item {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .social-report .ivu-picker-panel-sidebar {
        width: 98px;
    }
</style>

<style scoped lang="less">
    & /deep/ .ivu-poptip-inner {
        text-align: left;
        white-space: normal;
    }
</style>
