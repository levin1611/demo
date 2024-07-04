<template>
    <div class="account-panel">
        <div class='clearfix'>
<!--            <div style="float: left">-->
<!--                <h1 class='title'>-->
<!--                    {{ $t('GA.report_account') }}-->
<!--                </h1>-->
<!--            </div>-->
            <div style="float: right;vertical-align: middle">
                <DatePicker v-model="dateValue"
                            type="daterange"
                            :clearable="false"
                            :placeholder="$t('GA.tip_selectDate')"
                            size="small"
                            @change="changeDate"
                            style="width: 240px"></DatePicker>
            </div>
        </div>
        <div class="account-body">
            <div class="account-body-content">
                <div class="account-body-chat-type-line">
                    <div class="account-body-chat-type-line-head">
                        <div class="account-body-chat-type-line-head-select"></div>
                        <div class="account-body-chat-type-line-head-select"></div>
                        <div class="account-body-chat-type-line-head-select"></div>
                        <div class="account-body-chat-type-line-head-select"></div>
                        <div class="account-body-chat-type-line-head-time"></div>
                    </div>
                </div>
            </div>
            <Row justify="center" align="middle" :gutter="16" class-name="chartRow">
                <Col :span="24" class='clearfix'>
                    <div class="xpy-shadow ">
                        <div class="chart-type-line-header clearfix ">
                            <div class="chart-type-select-data" v-for="(item, index) in chartOneSeries"
                                 :class="{'chart-one-series-active':item.active}"
                                 @click="chartOneSeriesClick($event, index)">
                                <div class="chart-type-select-data-name">
                                    <div class="square-color" :style="{background: chartColors[index]}"></div>
                                    <Select
                                        v-model="item.model"
                                        style="width:150px;float: left;"
                                        @change="chartOneSeriesChange($event, index)"
                                        :ref="`chartOneSeriesSelect${index}`"
                                        size="small"
                                        :class="{'chart-one-series-active':item.active}">
                                        <Option v-for="option in ChartSeriesList" :value="option.value"
                                                :label="option.name"
                                                :key="option.value">
                                        </Option>
                                    </Select>
                                </div>
                                <div class="chart-type-select-data-value">
                                    {{computeChartOneSeriesOverview(index)}}
                                </div>
                            </div>
                            <div class="chart-type-select-time-interval">
                                <!-- <div @click="clickTimeSelectIcon ">
                                    <Icon type="ios-clock-outline" :size="20"></Icon>
                                </div> -->
                                <Poptip
                                    placement="bottom"
                                    width="180"
                                    trigger="click">
                                    <!-- <Button slot="reference" type="text" icon="custom ios-clock-outline"></Button> -->
                                    <Icon type="ios-clock-outline" :size="20" slot="reference"></Icon>
                                    <div class="chart-type-select-time-interval-group"
                                         ref="selectGroupDiv">
                                        <div class="time-interval-checkbox-div"
                                             @click="timeIntervalCheckboxChange('day',$event)">
                                            <label class="time-interval-checkbox-label">
                                                <span class='time-interval-checkbox-span'>{{ $t('GA.period_day') }}</span>
                                                <Checkbox v-model="timeIntervalCheckboxList.day"></Checkbox>
                                            </label>
                                        </div>
                                        <div class="time-interval-checkbox-div"
                                             @click="timeIntervalCheckboxChange('week',$event)">
                                            <label class="time-interval-checkbox-label">
                                                <span class='time-interval-checkbox-span'>{{ $t('GA.period_week') }} </span>
                                                <Checkbox v-model="timeIntervalCheckboxList.week"></Checkbox>
                                            </label>
                                        </div>
                                        <div class="time-interval-checkbox-div"
                                             @click="timeIntervalCheckboxChange('moon',$event)">
                                            <label class="time-interval-checkbox-label">
                                                <span class='time-interval-checkbox-span'>{{ $t('GA.period_month') }} </span>
                                                <Checkbox v-model="timeIntervalCheckboxList.moon"></Checkbox>
                                            </label>
                                        </div>
                                    </div>
                                </Poptip>
                            </div>
                        </div>
                        <div ref="my_chart_one" id="my-chart-one" style="width:100%;height: 192px; display: inline-block"
                             class="clearfix"></div>
                    </div>
                </Col>
                <!-- 图二: 设备 -->
                <Col :span="12">
                    <div class="account-body-col-panel xpy-shadow">
                        <div class="account-body-col-panel-content">
                            <div class="account-body-col-panel-head">
                                <div class="account-body-col-panel-head-title">
                                    {{ $t('GA.device') }}
                                </div>
                                <!-- 模拟图表的图例(legend) -->
                                <div class="chart-two-category" style="font-size: 14px;">
                                    <span v-for="(type, index) in deviceTypes"
                                          :key="type">
                                        <Icon :color="chartColors_80per[index]"
                                              :size="deviceTypeIconObj[type].startsWith('custom') ? 16.5 : 20"
                                              :class="deviceTypeIconObj[type]"
                                              class="chart-two-category-icon"></Icon>
                                        <span class="chart-two-category-word">{{ $t(lang_deviceTypes[type]) }}</span>
                                    </span>
                                </div>
                            </div>
                            <div class="clearfix">
                                <div ref="my_chart_two" id="my-chart-two"></div>
                                <div class="chart-two-right-select-group">
                                    <template v-for="(item, index) in chartTwoSeries">
                                        <Select v-model="item.model" style=" "
                                                @change="chartTwoSeriesChange">
                                            <Option v-for="option in ChartSeriesList"
                                                    :value="option.value"
                                                    :label="option.name"
                                                    :key="option.value">
                                            </Option>
                                        </Select>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
                <!-- 图三: 投放网络 -->
                <Col :span="12">
                    <div class="account-body-col-panel xpy-shadow">
                        <div class="account-body-col-panel-content">
                            <div class="account-body-col-panel-head">
                                <div class="account-body-col-panel-head-title">{{ $t('GA.displayNetwork') }}</div>
                                <!-- 模拟图表的图例(legend) -->
                                <div>
                                    <div v-if="chartThreeFormatData.adNetworkType1">
                                        <div v-for="(item, index) in chartThreeFormatData.adNetworkType1.valueList"
                                             class="adNetworkType-legend">
                                            <span :style="{backgroundColor: chartColors_80per[index] }"
                                                  class="adNetworkType-legend-icon"></span>
                                            <span>{{ $t(lang_adNetworkTypes[item]) }} </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div ref="my_chart_three" id="my-chart-three"></div>
                            <div class="chart-three-right-select-group">
                                <template v-for="item in chartThreeSeries">
                                    <Select v-model="item.model" @change="chartThreeSeriesChange">
                                        <Option v-for="option in ChartSeriesList" :value="option.value"
                                                :label="option.name"
                                                :key="option.value">
                                        </Option>
                                    </Select>
                                </template>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col :span="12" v-for="item in tableTypes">
                    <div class="account-body-col-panel xpy-shadow">
                        <account-table
                            v-model="item.key === 'criteria' ? keyWordData : item.key === 'countryCriteriaId_Name' ? localData : searchWordData"
                            :tableType="item" @jumpTo="jumpTo"></account-table>
                    </div>
                </Col>
            </Row>
        </div>
    </div>
</template>

<script>
    import Utils from '@/utils';
    import _ from 'lodash';
    import accountTable from './components/accountTable';
    import { mapState } from 'vuex';
    // import switchableTable from './components/switchableTable.vue';
    // import searchTable from './components/searchTable.vue';
    // import localTable from './components/localTable.vue';
    import { adsReport } from '@/api/google/index';
    const { getAdsReport } = adsReport;

    export default {
        name: 'account',
        components: {
            accountTable
        // switchableTable,
        // searchTable,
        // localTable
        },
        props: {
            adsAccountId: String
        },
        created() {
            const endTime = new Date();
            const startTime = new Date();
            endTime.setTime(endTime.getTime() - 3600 * 1000 * 24);
            startTime.setTime(startTime.getTime() - 3600 * 1000 * 24 * 30);
            this.dateValue = [startTime, endTime];
            this.startDate = startTime.format('yyyy-MM-dd');
            this.endDate = endTime.format('yyyy-MM-dd');
            this.formatChartThreeData(1);
        },
        mounted() {
            // let that = this;
            // window.onresize = () => {
            //     return (() => {
            //         window.screenWidth = document.body.clientWidth;
            //         that.screenWidth = window.screenWidth
            //     })()
            // };
            this.getAjaxData(1);
            this.getAjaxData(2);
            this.getAjaxData(3);
            this.getReportData(4);
            this.getReportData(6);
            this.getReportData(7);
        },
        data() {
            return {
                // screenWidth: document.body.clientWidth,
                dateValue: [],
                startDate: '',
                endDate: '',
                chartColors: Utils.chartColors,
                chartColors_80per: Utils.chartColors_80per,
                chartOneAjaxData: [],
                chartTwoAjaxData: [],
                chartThreeAjaxData: [],
                chartOneFormatData: {},
                chartTwoFormatData: {},
                chartThreeFormatData: {},
                chartOneOption: {},
                chartTwoOption: {},
                chartThreeOption: {},
                myChartOne: {},
                myChartTwo: {},
                myChartThree: {},
                chartOneSeries: [
                    {
                        index: 0,
                        model: 'clicks',
                        active: true
                    },
                    {
                        index: 1,
                        model: 'impressions',
                        active: true
                    },
                    {
                        index: 2,
                        model: 'averageCpc',
                        active: true
                    },
                    {
                        index: 3,
                        model: 'cost',
                        active: true
                    }
                ],
                chartTwoSeries: [
                    {
                        index: 0,
                        model: 'cost'
                    },
                    {
                        index: 1,
                        model: 'impressions'
                    },
                    {
                        index: 2,
                        model: 'ctr'
                    },
                    {
                        index: 3,
                        model: 'conversions'
                    }
                ],
                chartThreeSeries: [
                    {
                        index: 0,
                        model: 'cost'
                    },
                    {
                        index: 1,
                        model: 'impressions'
                    },
                    {
                        index: 2,
                        model: 'ctr'
                    },
                    {
                        index: 3,
                        model: 'conversions'
                    }
                ],
                ChartSeriesList: [
                    {
                        value: 'impressions',
                        name: this.$t('GA.impressions')
                    },
                    // {
                    //     value: 'averagePosition',
                    //     name: this.$t('GA.averagePosition')
                    // },
                    {
                        value: 'averageCpc',
                        name: this.$t('GA.averageCpc')
                    },
                    {
                        value: 'clicks',
                        name: this.$t('GA.clicks')
                    },
                    {
                        value: 'costPerConversion',
                        name: this.$t('GA.costPerConversion')
                    },
                    {
                        value: 'conversions',
                        name: this.$t('GA.conversions')
                    },
                    {
                        value: 'cost',
                        name: this.$t('GA.cost')
                    },
                    {
                        value: 'ctr',
                        name: this.$t('GA.ctr')
                    },
                    {
                        value: 'conversionRate',
                        name: this.$t('GA.conversionRate')
                    }
                ],
                selectTimeIntervalGroupShow: false,
                selectTimeIntervalGroupShowCount: 0,
                timeIntervalCheckboxList: {
                    day: true,
                    week: false,
                    moon: false
                },
                timeIntervalCheckboxValueList: {
                    day: 1,
                    week: 11,
                    moon: 12
                },
                reportTimeInterval: 11,
                seriesTransfer: {
                    date: this.$t('GA.date'),
                    device: this.$t('GA.device'),
                    adNetworkType1: this.$t('GA.displayNetwork'),
                    campaignId: this.$t('GA.campaignId'),
                    campaignName: this.$t('GA.campaignName'),
                    adGroupId: this.$t('GA.adGroupId'),
                    adGroupName: this.$t('GA.adGroupName'),
                    adGroupStatus: this.$t('GA.adGroupStatus'),
                    criteria: this.$t('GA.criteria'),
                    id: this.$t('GA.id'),
                    shortHeadline: this.$t('GA.shortHeadline'),
                    countryCriteriaId: this.$t('GA.countryCriteriaId'),
                    cost: this.$t('GA.cost'),
                    impressions: this.$t('GA.impressions'),
                    clicks: this.$t('GA.clicks'),
                    conversions: this.$t('GA.conversions'),
                    ctr: this.$t('GA.ctr'),
                    averageCpc: this.$t('GA.averageCpc'),
                    costPerConversion: this.$t('GA.costPerConversion'),
                    conversionRate: this.$t('GA.conversionRate'),
                    averagePosition: this.$t('GA.averagePosition'),
                    query: this.$t('GA.searchTerms')
                },
                keyWordData: [],
                tempKeyWordData: [],
                searchWordData: [],
                tempSearchWordData: {},
                localData: [],
                tempLocalData: {},
                // 图二 设备类型
                deviceTypes: [],
                // 图二 设备类型图标包
                deviceTypeIconObj: {
                    CONNECTED_TV: 'ivu-icon ivu-icon-android-phone-landscape',
                    DESKTOP: 'ivu-icon ivu-icon-monitor',
                    MOBILE: 'ivu-icon ivu-icon-iphone',
                    OTHER: 'custom custom-through-connection',
                    TABLET: 'ivu-icon ivu-icon-ipad',
                    UNKNOWN: 'custom custom-unknown',
                    UNSPECIFIED: 'custom custom-unspecified'
                },
                columns: ['impressions', 'averagePosition', 'averageCpc', 'clicks', 'costPerConversion', 'conversions', 'cost', 'ctr', 'conversionRate'],
                tableTypes: [
                    {
                        label: this.$t('GA.criteria'),
                        link: 'keywords',
                        key: 'criteria',
                        data: 'keyWordData',
                        tempData: 'tempKeyWordData'
                    },
                    {
                        label: this.$t('GA.countryCriteriaId'),
                        link: 'territory',
                        key: 'countryCriteriaId_Name',
                        data: 'localData',
                        tempData: 'tempLocalData'
                    },
                    {
                        label: this.$t('GA.searchTerms'),
                        link: 'searchTerms',
                        key: 'query',
                        data: 'searchWordData',
                        tempData: 'tempSearchWordData'
                    }
                ]
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                window_width: 'window_width',
                allDeviceTypes: state => state.google.deviceTypes,
                lang_deviceTypes: state => state.google.lang_deviceTypes,
                adNetworkTypes: state => state.google.adNetworkTypes,
                lang_adNetworkTypes: state => state.google.lang_adNetworkTypes,
                lang_campaignStatus: state => state.google.lang_campaignStatus
            }),
            chartThreeObjectList() {
                return this.chartThreeSeries.map(item => {
                    return item.model;
                });
            }
        },
        activated() {
            if (this.myChartOne.resize) {
                this.myChartOne.resize();
            }
            if (this.myChartTwo.resize) {
                this.myChartTwo.resize();
            }
            if (this.myChartThree.resize) {
                this.myChartThree.resize();
            }
        },
        beforeDestroy() {
            [this.myChartOne, this.myChartTwo, this.myChartThree].forEach(item => {
                if (item && item.dispose) {
                    item.dispose();
                }
            });
            document.removeEventListener('click', this.onClickFunc);
        },
        watch: {
            window_width() {
                if (this.myChartOne.resize) {
                    this.myChartOne.resize();
                }
                if (this.myChartTwo.resize) {
                    this.myChartTwo.resize();
                }
                if (this.myChartThree.resize) {
                    this.myChartThree.resize();
                }
            }
        },
        methods: {
            /* 全局 */
            changeDate(date) {
                console.log('全局111', date);
                if (!date) {
                    this.startDate = '';
                    this.endDate = '';
                } else {
                    this.startDate = new Date(date[0]).format('yyyy-MM-dd');
                    this.endDate = new Date(date[1]).format('yyyy-MM-dd');
                }

                this.getAjaxData(1);
                this.getAjaxData(2);
                this.getAjaxData(3);
                this.getReportData(4);
                this.getReportData(6);
                this.getReportData(7);
            }, // 日期变换
            jumpTo(data) {
                this.$emit('jumpTo', data);
            }, // 跳转到其他表格
            /* 上三图 */
            getAjaxData(index) {
                getAdsReport({
                    orgId: this.enterpriseId,
                    reportType: 1,
                    startDate: this.startDate,
                    endDate: this.endDate,
                    displayType: index,
                    clientCustomerId: this.adsAccountId
                }).then(res => {
                    if (res.code === '1') {
                        if ([1, 11, 12].includes(index)) {
                            this.chartOneAjaxData = [];
                            const resData = res.data;

                            // 先做数据补零处理, 把接口没返回的空白日期也补上空白数据, 避免影响后续数据计算, 图表展示
                            // 定义不带日期周期(日/周/月)的空白模板数据
                            const blankObj = {
                                accountCurrencyCode: 'CNY',
                                ctr: '0%',
                                conversions: 0,
                                cost: 0,
                                averageCpc: 0,
                                clicks: 0,
                                averagePosition: ' --',
                                impressions: 0,
                                costPerConversion: 0,
                                conversionRate: '0%'
                            };
                            // 定义存放空白数据的变量
                            const allBlankData = [];
                            // 从用户选择的起始日期到结束日期, 以"天"为 step 开始遍历
                            let startTime = new Date(this.startDate).getTime();
                            const endTime = new Date(this.endDate).getTime();
                            const dayStep = 24 * 60 * 60 * 1000;
                            while (startTime <= endTime) {
                                const today = new Date(startTime);
                                switch (index) {
                                    case 1:
                                        // 周期为"日"
                                        // 直接 push
                                        allBlankData.push(Object.assign({ date: this.$options.filters.timeFormat(today) }, blankObj));
                                        break;
                                    case 11:
                                        // 周期为"周"
                                        // 按后端数据逻辑, 是返回的"周一"的日期, getDay 判断通过后 push
                                        if (today.getDay() === 1) {
                                            allBlankData.push(Object.assign({ week: this.$options.filters.timeFormat(today) }, blankObj));
                                        }
                                        break;
                                    case 12:
                                        // 周期为"月"
                                        // getDate 判断通过后 push
                                        if (today.getDate() === 1) {
                                            allBlankData.push(Object.assign({ month: this.$options.filters.timeFormat(today) }, blankObj));
                                        }
                                        break;
                                }
                                // step 步进, 进入下个循环
                                startTime += dayStep;
                            }

                            // 以接口返回的数据替换掉相应的空白数据
                            let periodAttr = 'date';
                            if (index === 11) {
                                periodAttr = 'week';
                            } else if (index === 12) {
                                periodAttr = 'month';
                            }

                            // 填入接口数据
                            allBlankData.forEach((dataItem, index) => {
                                // 在接口数据中查找当前时间周期的数据
                                const matchDataList = resData.filter(item => item[periodAttr] === dataItem[periodAttr]);
                                if (matchDataList.length) {
                                    // 同一周期多个数据, 将可直接累加的数据累加
                                    const result = matchDataList.reduce((a, b) => {
                                        // 展示次数, 点击次数, 转化次数, 花费; 可直接累加
                                        ['impressions', 'clicks', 'conversions', 'cost'].forEach(key => {
                                            a[key] = Number(a[key] || 0) + Number(b[key] || 0);
                                        });
                                        return a;
                                    });
                                    // 处理计算属性
                                    // “点击率”：点击次数/展示次数 * 100 %
                                    result.ctr = `${result.impressions ? Number((result.clicks * 100 / result.impressions).toFixed(2)) : 0}%`;
                                    // “平均每次点击费用”：费用/点击次数
                                    result.averageCpc = result.clicks ? Number((result.cost / 1000000 / result.clicks).toFixed(2)) : 0;
                                    // “平均每次转化费用”：费用/转化次数
                                    result.costPerConversion = result.conversions ? Number((result.cost / 1000000 / result.conversions).toFixed(2)) : 0;
                                    // “转化率”：转化次数/点击次数 * 100 %
                                    result.conversionRate = `${result.clicks ? Number((result.conversions * 100 / result.clicks).toFixed(2)) : 0}%`;

                                    // 返回结果
                                    allBlankData[index] = result;
                                }
                            });

                            // 得到最终结果
                            this.chartOneAjaxData = allBlankData;

                            // 格式化数据
                            this.formatChartOneData(index);
                        } else if (index === 2) {
                            this.chartTwoAjaxData = res.data;
                            this.myChartTwo = this.$echarts.init(this.$refs.my_chart_two);
                            this.formatChartTwoData();
                        } else if (index === 3) {
                            this.chartThreeAjaxData = res.data;
                            this.formatChartThreeData(2);
                        }
                    }
                });
            }, // 获取上面三图的数据,包括图一的按时间间隔显示数据
            clickTimeSelectIcon() {
                console.log('sdsadfdsfgffffffffffffffff================>');
                this.selectTimeIntervalGroupShow = true;
                if (this.selectTimeIntervalGroupShowCount === 0) {
                    this.selectTimeIntervalGroupShowCount++;
                    document.addEventListener('click', this.onClickFunc);
                }
            }, // 点击右上角时钟图标
            /* 图一 */
            formatChartOneData(index) {
                // 当前选择的时间周期属性
                let periodAttr = 'date';
                if (index === 11) {
                    periodAttr = 'week';
                } else if (index === 12) {
                    periodAttr = 'month';
                }

                // 暂存排序后的接口原始数据
                const ajaxData = _.orderBy(this.chartOneAjaxData, [periodAttr], ['asc']);
                // 暂存格式化结果数据
                const resultData = {};

                // 初始化数据 + 填入基本数据
                this.ChartSeriesList.forEach(seriesItem => {
                    // 暂存指标属性名
                    const key = seriesItem.value;
                    // 暂存结果数据
                    const valObj = {
                        total: 0,
                        valueList: [],
                        valueListNumber: [],
                        maxValue: 0,
                        percentValueList: []
                    };

                    ajaxData.forEach(dataItem => {
                        // 暂存当前指标原始数据
                        let val = dataItem[key];
                        // 处理数据, 存入原始 value 和 数值型 value
                        if (key === 'cost') {
                            // "花费"单位不一样, 特殊处理
                            val = Number(val) / 1000000;
                            valObj.valueList.push(Number(val.toFixed(2)));
                            valObj.valueListNumber.push(val);
                            valObj.total += val;
                        } else if (['impressions', 'clicks', 'conversions'].includes(key)) {
                            // 处理可直接累加的数据
                            // 无小数, 不需要四舍五入
                            valObj.valueList.push(val);
                            valObj.valueListNumber.push(Number(val));
                            valObj.total += Number(val);
                        } else if (['ctr', 'conversionRate'].includes(key)) {
                            // 处理百分比数据, 数值数据去掉百分号
                            // 之前已进行四舍五入
                            valObj.valueList.push(val);
                            valObj.valueListNumber.push(Number(val.replace('%', '')));
                        } else {
                            // 处理其他数据
                            // 有小数, 需要四舍五入下
                            valObj.valueList.push(Number(val.toFixed(2)));
                            valObj.valueListNumber.push(Number(val));
                        }
                    });

                    // 赋值结果数据
                    resultData[key] = valObj;
                });
                // 计算每类指标的最大值 + 每条数据的该指标相对于指标最大值的百分比, 用于实际显示图表(避免不同指标数量级差距太大导致图标看不出起伏)
                for (const key in resultData) {
                    resultData[key].maxValue = _.max(resultData[key].valueListNumber);
                    resultData[key].percentValueList = resultData[key].valueListNumber.map(x => x / resultData[key].maxValue);
                }
                // 处理计算数据的 total 值
                // “点击率”：点击次数/展示次数 * 100 %
                resultData.ctr.total = `${resultData.impressions.total ? Number((resultData.clicks.total * 100 / resultData.impressions.total).toFixed(2)) : 0}%`;
                // “平均每次点击费用”：费用/点击次数
                resultData.averageCpc.total = resultData.clicks.total ? Number((resultData.cost.total / resultData.clicks.total).toFixed(2)) : 0;
                // “平均每次转化费用”：费用/转化次数
                resultData.costPerConversion.total = resultData.conversions.total ? Number((resultData.cost.total / resultData.conversions.total).toFixed(2)) : 0;
                // “转化率”：转化次数/点击次数 * 100 %
                resultData.conversionRate.total = `${resultData.clicks.total ? Number((resultData.conversions.total * 100 / resultData.clicks.total).toFixed(2)) : 0}%`;
                // 费用, total 数据可能不为整数, 计算数据计算完毕后 toFixed 一下
                resultData.cost.total = Number(resultData.cost.total.toFixed(2));

                // 赋值最终结果
                this.chartOneFormatData = resultData;

                // 配置图表数据
                if (this.chartOneFormatData && JSON.stringify(this.chartOneFormatData) !== '{}') {
                    if ([1, 11, 12].includes(index)) {
                        this.setChartOneOption(ajaxData.map(dataItem => dataItem[periodAttr]), this.chartOneFormatData.clicks.percentValueList, this.chartOneFormatData.impressions.percentValueList, this.chartOneFormatData.averageCpc.percentValueList, this.chartOneFormatData.cost.percentValueList);
                    }
                }

                // 显示图表
                if (!this.myChartOne.setOption) {
                    this.myChartOne = this.$echarts.init(this.$refs.my_chart_one);
                }
                this.myChartOne.clear();
                this.myChartOne.setOption(this.chartOneOption);
            }, // 格式化已请求到的数据,设置 Option ,绘制 chart
            setChartOneOption(xAxisData, seriesOneData, seriesTwoData, seriesThreeData, seriesFourData) {
                const that = this;
                const _loadsh = _;
                this.chartOneOption = {
                    color: Utils.chartColors,
                    backgroundColor: '#fff',
                    grid: {
                        x: '5%',
                        y: '5%',
                        y2: '10%'
                    },
                    legend: {
                        show: false,
                        data: [this.$t('GA.clicks'), this.$t('GA.impressions'), this.$t('GA.averageCpc'), this.$t('GA.cost')]
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter: function(params) {
                            let res = `${params[0].axisValue}<br>`;
                            for (let i = 0; i < params.length; i++) {
                                res += `<span style=" vertical-align: middle;">
                                        <div style="display: inline-block;height: 8px;width: 8px;border-radius: 50%;background-color: ${params[i].color}"></div>
                                        ${params[i].seriesName} : ${that.chartOneFormatData[_loadsh.find(that.ChartSeriesList, ['name', params[i].seriesName]).value].valueList[params[i].dataIndex]}
                                    </span>
                                    <br>`;
                            }
                            return res;
                        }
                    },
                    xAxis: [
                        {

                            type: 'category',
                            data: xAxisData,
                            axisTick: {
                                alignWithLabel: true
                            }
                        }
                    ],
                    yAxis: {
                        show: false,
                        type: 'value',
                        axisLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        }
                    },
                    series: [
                        {
                            type: 'line',
                            name: this.$t('GA.clicks'),
                            showSymbol: false,
                            data: seriesOneData
                        },
                        {
                            name: this.$t('GA.impressions'),
                            type: 'line',
                            showSymbol: false,
                            data: seriesTwoData
                        },
                        {
                            name: this.$t('GA.averageCpc'),
                            type: 'line',
                            showSymbol: false,
                            data: seriesThreeData
                        },
                        {
                            name: this.$t('GA.cost'),
                            type: 'line',
                            showSymbol: false,
                            data: seriesFourData
                        }
                    ]
                };
            }, // 设置 Option
            computeChartOneSeriesOverview(index) {
                // 未选中要显示的数据项, 直接返回空
                if (typeof (this.chartOneFormatData[this.chartOneSeries[index].model]) === 'undefined') {
                    return;
                }

                return this.chartOneFormatData[this.chartOneSeries[index].model].total;
            }, // 显示图一四个可点击的 DIV 上的数字
            // 取四舍五入后的数字, 若为 0 , 需要继续计算, 取小数点后第一位不是 0 的值，且保留四舍五入逻辑
            getValidNumber(num) {
                let result = Math.round(num);
                // 四舍五入后得到数据为 0 , 需要继续计算, 取小数点后第一位不是 0 的值，且保留四舍五入逻辑
                if (result === 0) {
                    // 小数转换为字符串
                    result = num.toString();
                    // 小数转换为字符串后, 第一个不为 0 的数字所在 index
                    const validNumberIndex = result.search(/[1-9]/);
                    if (validNumberIndex !== -1) {
                        // 0.0...
                        const before = result.slice(0, validNumberIndex);
                        // 0 后的整数部分
                        let after = result.slice(validNumberIndex, result.length).split('');
                        // 转换整数为只有 1 位整数的小数, 随后四舍五入
                        after.splice(1, 0, '.');
                        after = Math.round(Number(after.join('')));
                        // 拼接得到四舍五入后的小数
                        result = Number(before + after);
                    } else {
                        result = num;
                    }
                }
                // 返回有效数字
                return result;
            },
            chartOneSeriesClick(e, index) {
                if (this.chartOneSeries[index].active) {
                    if (this.$refs[`chartOneSeriesSelect${index}`][0].$el.contains(e.target)) {
                        return;
                    }

                    // 所有同名的 series 都取消 active
                    const seriesModel = this.chartOneSeries[index].model;
                    this.chartOneSeries.forEach(seriesItem => {
                        if (seriesItem.model === seriesModel) {
                            seriesItem.active = false;
                        }
                    });

                    // 图表隐藏数据
                    this.myChartOne.dispatchAction({
                        type: 'legendUnSelect',
                        name: this.seriesTransfer[this.chartOneSeries[index].model]
                    });
                } else {
                    // 所有同名的 series 都 active
                    const seriesModel = this.chartOneSeries[index].model;
                    this.chartOneSeries.forEach(seriesItem => {
                        if (seriesItem.model === seriesModel) {
                            seriesItem.active = true;
                        }
                    });

                    // 图表显示数据
                    this.myChartOne.dispatchAction({
                        type: 'legendSelect',
                        name: this.seriesTransfer[this.chartOneSeries[index].model]
                    });

                    e.preventDefault();
                    e.stopPropagation();
                }
            }, // 图一四 DIV 的点击事件方法
            chartOneSeriesChange(value, index) {
                this.chartOneSeries[index].model = value;
                this.chartOneOption.legend.data[index] = this.seriesTransfer[value];
                this.chartOneOption.series[index].name = this.seriesTransfer[value];
                this.chartOneOption.series[index].data = this.chartOneFormatData[value].percentValueList;
                this.myChartOne.clear();
                this.myChartOne.setOption(this.chartOneOption);
            }, // 图一四 DIV 上的 Select 的 change 事件方法
            timeIntervalCheckboxChange(check, e) {
                console.log(check, e);
                this.selectTimeIntervalGroupShow = false;
                if (this.timeIntervalCheckboxList[check]) {
                    e.preventDefault();
                    return;
                }
                this.getAjaxData(this.timeIntervalCheckboxValueList[check]);
                Object.keys(this.timeIntervalCheckboxList).map(item => {
                    this.timeIntervalCheckboxList[item] = false;
                    if (item === check) {
                        this.timeIntervalCheckboxList[item] = true;
                        this.reportTimeInterval = this.timeIntervalCheckboxValueList[item];
                    }
                });
            }, // 按日、周、月切换

            /* 图二 */
            formatChartTwoData() {
                // 暂存接口原始数据
                const ajaxData = this.chartTwoAjaxData;
                // 暂存格式化结果数据
                const resultData = {};
                // 数据维度定义
                const SeriesList = [];
                // 暂存接口数据中包含的设备类型
                const deviceTypeArr = [];

                // 设置数据维度数组 + 初始化结果数据
                for (const key in ajaxData[0]) {
                    SeriesList.push({
                        value: key,
                        name: this.seriesTransfer[key]
                    });
                    resultData[key] = {
                        valueList: {},
                        valueListNumber: {},
                        relativelyPercentValueList: {}
                    };
                }

                // 数据处理
                ajaxData.forEach(dataItem => {
                    SeriesList.forEach(seriesItem => {
                        const key = seriesItem.value;
                        const valObj = resultData[key];

                        // 设备类型对应的多语言; 数据, legend , 模拟 legend 要用
                        const translateStr = this.lang_deviceTypes[dataItem.device];
                        const deviceType = translateStr ? this.$t(translateStr) : dataItem.device;

                        // 部分数据特殊处理
                        if (['averageCpc', 'cost', 'costPerConversion'].includes(key)) {
                            valObj.valueList[deviceType] = (dataItem[key] / 1000000).toFixed(2);
                            valObj.valueListNumber[deviceType] = (Number(dataItem[key]) / 1000000);
                            return;
                        }

                        // 其他正常数据
                        valObj.valueList[deviceType] = dataItem[key];
                        // 对含 % 的值, 去百分号并 push 到 valueListNumber
                        if (`${dataItem[key]}`.indexOf('%') > -1) {
                            const tempVal = `${dataItem[key]}`.replace(/%/, '');
                            valObj.valueListNumber[deviceType] = Number(tempVal);
                        } else {
                            // 不含 % 的值, 直接 push
                            valObj.valueListNumber[deviceType] = Number(dataItem[key]);
                        }
                    });

                    // 当前循环到的 ajaxData 对象数组中的 device 设备类型加入到设备类型数组
                    deviceTypeArr.push(dataItem.device);
                });
                for (const k in resultData) {
                    const sum = _.sum(Object.values(resultData[k].valueListNumber));
                    Object.keys(resultData[k].valueListNumber).forEach(key => {
                        let tempValue = resultData[k].valueListNumber[key];
                        if (!tempValue) {
                            tempValue = 0;
                        }
                        if (sum === 0 || Number.isNaN(sum)) {
                            tempValue = 1;
                        } else {
                            tempValue = Number((tempValue / sum).toFixed(3));
                        }
                        resultData[k].relativelyPercentValueList[key] = tempValue;
                    });
                }
                this.deviceTypes = this.allDeviceTypes.filter(item => deviceTypeArr.includes(item));

                // 赋值最终结果
                this.chartTwoFormatData = resultData;

                // 进入显示图表逻辑
                this.chartTwoSeriesChange();
            },
            setChartTwoOption(typeOne, typeTwo, typeThree, typeFour) {
                console.log('setChartTwoOption', this.chartTwoFormatData);
                if (this.chartTwoFormatData && JSON.stringify(this.chartTwoFormatData) !== '{}') {
                    const seriesList = this.setChartTwoOptionSeries(typeOne, typeTwo, typeThree, typeFour);
                    this.chartTwoOption = {
                        color: Utils.chartColors_80per,
                        animation: false,
                        grid: {
                            x: '0%',
                            x2: '0%',
                            y: '5%',
                            y2: '5%'
                        },
                        backgroundColor: '#fff',
                        legend: {
                            data: this.deviceTypes.map(item => {
                                const translateStr = this.lang_deviceTypes[item];
                                return translateStr ? this.$t(translateStr) : item;
                            }),
                            show: false
                        //            x: 50
                        },
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                lineStyle: {
                                    opacity: 0
                                }
                            },
                            formatter: (params) => {
                                let res = `${params[0].axisValue}
                                        <br>`;
                                for (let i = 0; i < params.length; i++) {
                                    res += `<span style=" vertical-align: middle;">
                                                <div style="display: inline-block;height: 8px;width: 8px;border-radius: 50%;background-color:'${params[i].color}'"></div>
                                                ${params[i].seriesName}:${this.chartTwoFormatData[_.find(this.ChartSeriesList, ['name', params[i].name]).value].valueList[params[i].seriesName]}  ${(this.chartTwoFormatData[_.find(this.ChartSeriesList, ['name', params[i].name]).value].relativelyPercentValueList[params[i].seriesName] * 100).toFixed(2)}%
                                            </span>
                                            <br>`;
                                }
                                return res;
                            }
                        },
                        // grid: {bottom:0},
                        yAxis: {
                            show: false,
                            type: 'category',
                            data: [
                                this.seriesTransfer[typeFour],
                                this.seriesTransfer[typeThree],
                                this.seriesTransfer[typeTwo],
                                this.seriesTransfer[typeOne]
                            ],
                            //              axisTick: {
                            /// /                alignWithLabel: true
                            //              }
                            axisLine: {
                                show: false
                            }
                        },
                        xAxis: {
                            max: 1,
                            show: false,
                            type: 'value'
                        //            axisLine: {
                        /// /              show: true
                        //            },
                        //            axisTick: {
                        //              show: false
                        //            }
                        },
                        series: seriesList
                    };
                }
            },
            setChartTwoOptionSeries(typeOne, typeTwo, typeThree, typeFour) {
                return this.deviceTypes.map(item => {
                    const translateStr = this.lang_deviceTypes[item];
                    const key = translateStr ? this.$t(translateStr) : item;

                    return {
                        type: 'bar',
                        name: key,
                        stack: this.$t('GA.total'),
                        barWidth: 18,
                        data: [
                            this.chartTwoFormatData[typeFour].relativelyPercentValueList[key],
                            this.chartTwoFormatData[typeThree].relativelyPercentValueList[key],
                            this.chartTwoFormatData[typeTwo].relativelyPercentValueList[key],
                            this.chartTwoFormatData[typeOne].relativelyPercentValueList[key]
                        ]
                    };
                });
            },
            chartTwoSeriesChange() {
                // 拼装图表属性
                this.setChartTwoOption(...this.chartTwoSeries.map(item => item.model));
                this.myChartTwo.clear();
                this.myChartTwo.setOption(this.chartTwoOption);
            },

            /* 图三 */
            formatChartThreeData(index) {
                // 暂存接口原始数据
                const ajaxData = this.chartThreeAjaxData;
                // 暂存格式化结果数据
                const resultData = {};
                // 数据维度定义
                const SeriesList = [];

                // 设置数据维度数组 + 初始化结果数据
                for (const key in ajaxData[0]) {
                    SeriesList.push({
                        value: key,
                        name: this.seriesTransfer[key]
                    });
                    resultData[key] = {
                        valueList: [],
                        valueListNumber: [],
                        relativelyPercentValueList: []
                    };
                }

                // 数据处理
                ajaxData.forEach(dataItem => {
                    SeriesList.forEach(seriesItem => {
                        const key = seriesItem.value;
                        const valObj = resultData[key];

                        // 部分数据特殊处理
                        if (['averageCpc', 'cost', 'costPerConversion'].includes(key)) {
                            valObj.valueList.push((dataItem[key] / 1000000).toFixed(2));
                            valObj.valueListNumber.push(Number(dataItem[key]) / 1000000);
                            return;
                        }

                        // 其他正常数据
                        valObj.valueList.push(dataItem[key]);
                        if (`${dataItem[key]}`.indexOf('%') > -1) {
                            const tempVal = `${dataItem[key]}`.replace(/%/, '');
                            valObj.valueListNumber.push(Number(tempVal));
                        } else {
                            valObj.valueListNumber.push(Number(dataItem[key]));
                        }
                    });
                });
                for (const key in resultData) {
                    resultData[key].relativelyPercentValueList = resultData[key].valueListNumber.map(x => (x / _.sum(resultData[key].valueListNumber)).toFixed(2));
                }

                // 赋值最终结果
                this.chartThreeFormatData = resultData;

                // 显示图表
                if (index === 2) {
                    if (!this.myChartThree.setOption) {
                        this.myChartThree = this.$echarts.init(this.$refs.my_chart_three);
                    }
                    this.chartThreeSeriesChange();
                }
            },
            setChartThreeOption(objectList, formatData) {
                const seriesList = this.setChartThreeOptionSeries(objectList, formatData);
                const that = this;
                const _loadsh = _;
                this.chartThreeOption = {
                    color: Utils.chartColors_80per,
                    grid: {
                        x: '0%',
                        x2: '0%',
                        y: '5%',
                        y2: '5%'
                    },
                    animation: false,
                    backgroundColor: '#fff',
                    legend: {
                        data: ['Search Network', 'Display Network'],
                        show: false
                    //            x: 50
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            lineStyle: {
                                opacity: 0
                            }
                        },
                        formatter: function(params) {
                            let res = `${params[0].axisValue}<br>`;
                            for (let i = 0; i < params.length; i++) {
                                const translateStr = that.lang_adNetworkTypes[params[i].seriesName];
                                const seriesName = translateStr ? that.$t(translateStr) : params[i].seriesName;

                                res += `<span style=" vertical-align: middle;">
                                        <div style="display: inline-block;height: 8px;width: 8px;border-radius: 50%;background-color: ${params[i].color}"></div>
                                        ${seriesName}: ${that.chartThreeFormatData[_loadsh.find(that.ChartSeriesList, ['name', params[i].name]).value].valueList[i]}  ${(that.chartThreeFormatData[_loadsh.find(that.ChartSeriesList, [
                                'name',
                                params[i].name]).value].relativelyPercentValueList[i] * 100).toFixed(2)}%
                                    </span>
                                    <br>`;
                            }
                            return res;
                        }
                    },
                    //          grid: {bottom:0},
                    yAxis:
                        {
                            show: false,
                            type: 'category',
                            data: [this.$t('GA.conversions'), this.$t('GA.clicks'), this.$t('GA.impressions'), this.$t('GA.cost')],
                            axisTick: {
                                alignWithLabel: true
                            }
                        },
                    xAxis: {
                        show: false,
                        type: 'value',
                        axisLine: {
                            show: true
                        },
                        axisTick: {
                            show: false
                        }
                    },
                    series: seriesList
                };
            },
            chartThreeSeriesChange() {
                this.setChartThreeOption(this.chartThreeObjectList, this.chartThreeFormatData);
                for (let i = 0; i < this.chartThreeObjectList.length; i++) {
                    this.chartThreeOption.yAxis.data[this.chartThreeObjectList.length - 1 - i] = this.seriesTransfer[this.chartThreeObjectList[i]];
                }
                this.myChartThree.clear();
                this.myChartThree.setOption(this.chartThreeOption);
            },
            setChartThreeOptionSeries(objectList, formatData) {
                const seriesList = [];
                console.log('formatData===>', formatData);
                if (formatData && JSON.stringify(formatData) !== '{}') {
                    for (let i = 0; i < formatData.adNetworkType1.valueList.length; i++) {
                        const series = {
                            type: 'bar',
                            name: formatData.adNetworkType1.valueList[i],
                            stack: this.$t('GA.total'),
                            barWidth: 18,
                            data: [
                                this.chartThreeFormatData[objectList[3]].relativelyPercentValueList[i],
                                this.chartThreeFormatData[objectList[2]].relativelyPercentValueList[i],
                                this.chartThreeFormatData[objectList[1]].relativelyPercentValueList[i],
                                this.chartThreeFormatData[objectList[0]].relativelyPercentValueList[i]
                            ]
                        };
                        seriesList.push(series);
                    }
                }
                return seriesList;
            },
            /* 下三图 */
            getReportData(index) {
                getAdsReport({
                    orgId: this.enterpriseId,
                    reportType: index,
                    startDate: this.startDate,
                    endDate: this.endDate,
                    clientCustomerId: this.adsAccountId
                }).then(res => {
                    if (res.code === '1') {
                        if (index === 4) {
                            this.tempKeyWordData = res.data;
                            this.filterData(0);
                        } else if (index === 6) {
                            this.tempSearchWordData = res.data;
                            this.filterData(2);
                        } else if (index === 7) {
                            this.tempLocalData = res.data;
                            this.filterData(1);
                        }
                    }
                });
            }, // 请求下面三个组件渲染的 table 的数据
            filterData(index) {
                const tempType = this.tableTypes[index];
                const tempData = this[tempType.tempData].slice(0);
                for (let i = 0; i < tempData.length; i++) {
                    for (let j = 0; j < this.columns.length; j++) {
                        const key = this.columns[j];
                        if (key === 'cost' || key === 'averageCpc' || key === 'costPerConversion') {
                            tempData[i][key] = (Number(tempData[i][key])) / 1000000;
                        } else {
                            tempData[i][key] = Number(tempData[i][key]);
                        }
                    }
                }
                this[tempType.data] = tempData;
            }, // 将下面三个组件的数据格式化

            // 这个方法不确定有啥用
            onClickFunc(e) {
            // debugger;
            // if (!this.$refs.selectGroupDiv) {

            // }
            // if (!this.$refs.selectGroupDiv.contains(e.target)) {
            //     this.selectTimeIntervalGroupShow = false;
            // }
            }
        }
    };
</script>

<style scoped lang="less">
@import "../fullChart";

.account-body-col-panel {
    height: 403px;
    overflow: auto;
}

.account-body-col-panel-head {
    /*height: 65px;*/
    height: 90px;
    /*background-color: orange;*/
}

.account-body-col-panel-head-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 18px;
    /*line-height: 65px;*/
}

.account-body-col-table-panel-head-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 18px;
    /*line-height: 65px;*/
    float: left;
}

.account-body-col-panel-content {
    padding: 25px;
    /*background-color: #e88bcf;*/
    height: 100%;
}

.chart-two-category-word {
    font-size: 14px;
}

.chart-two-category > span:not(:last-child) {
    margin: 0 20px 0 0;
}

#my-chart-two {
    width: 70%;
    height: 280px;
    float: left;
}

#my-chart-three {
    width: 70%;
    height: 280px;
    float: left;
}

.chart-two-right-select-group {
    width: 25%;
    float: left;
    padding: 15px 0;
    margin-left: 15px;
    & /deep/ .el-select{
        margin: 15px 0;
    }
    & /deep/ .el-input__inner {
        border: none;
    }
}

.chart-three-right-select-group {
    width: 25%;
    float: left;
    padding: 15px 0;
    margin-left: 15px;
    & /deep/ .el-select{
        margin: 15px 0;
    }
    & /deep/ .el-input__inner {
        border: none;
    }
}

.chart-two-category-icon {
    vertical-align: -2px;
    margin-right: 10px;
}

.adNetworkType-legend {
    margin: 0 20px 0 0;
    display: inline-block;

    &-icon {
        height: 10px;
        width: 10px;
        margin: 0 6px;
        display: inline-block;
    }
}
</style>
