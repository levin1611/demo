<template>
    <Card class="card-box dashBoardChart">
        <div class="card-box-title">
            <!-- 标题 -->
            <span class="title">{{ tableTitle }}
                <HelpTip v-if="helpTipTitle"
                         :title="helpTipTitle"
                         :iconSize="14"></HelpTip>
            </span>

            <!-- 筛选 -->
            <div class="card-box-filter">
                <!-- 时间筛选 -->
                <CardFilter class="marginRight8"
                            :cardType="kind"
                            filterType="date"
                            filterKey="dateRange"
                            :filterValue="filterParameters.dateRange"
                            @handleFilter="handleFilter"></CardFilter>

                <!-- 网站筛选 -->
                <SiteFilter v-if="filterParameters.siteId !== undefined"
                            :cardType="kind"
                            :site_list="site_list"
                            filterKey="siteId"
                            :filterValue="filterParameters.siteId"
                            @handleFilter="handleClick"
                            class="marginRight8"></SiteFilter>

                <!-- 日/月 切换 -->
                <ButtonGroup v-if="filterParameters.timeUnit !== undefined"
                             class="marginRight8">
                    <Button type="minor"
                            :class="filterParameters.timeUnit === 'date' ? 'active' : ''"
                            @click="handleClick('timeUnit', 'date')">{{ $t('dashBoardV2.Table.day') }}</Button>
                    <Button type="minor"
                            :class="filterParameters.timeUnit === 'yearMonth' ? 'active' : ''"
                            @click="handleClick('timeUnit', 'yearMonth')">{{ $t('dashBoardV2.Table.month') }}</Button>
                </ButtonGroup>

                <!-- 其他筛选条件 -->
                <slot></slot>
            </div>
        </div>

        <div class="card-box-body dashbord-table">
            <!-- 手动控制图表 legend -->
            <div v-for="item in legendList"
                 :key="item.name"
                 @click="toggleLegendItem(item)"
                 :class="{ 'dashBoardChart-chart-legend__checked': item.checked, 'dashBoardChart-chart-legend__disabled': (checkedLegendList.length === 1 && checkedLegendList[0] === item.name) }"
                 class="dashBoardChart-chart-legend">
                <div class="dashBoardChart-chart-legend-header">
                    <!--  <div class="dashBoardChart-chart-legend-color"
                         :style="{ background: item.color }"></div> -->
                    {{ item.lang }}
                    <!-- tip -->
                    <Tooltip v-if="item.helpTip"
                             :content="item.helpTip">
                        <Icon custom="custom-tip"
                              class="dashBoardChart-chart-legend-helpTip"></Icon>
                    </Tooltip>
                </div>
                <div class="dashBoardChart-chart-legend-data">
                    {{ formatNumWithCommas(statData[item.name]) }}
                </div>
            </div>

            <!-- 图表 -->
            <div ref="chart"
                 class="dashBoardChart-chart"></div>
        </div>

        <!-- 统计截止时间 -->
        <div v-if="['websiteTrafficStatus'].includes(kind) && syncTime[1]"
             class="statistics-time">{{ $t('dashBoardV2.dataOverview.statisticsTime') }}: {{ syncTime[1] }}</div>

        <!-- 删除当前组件 -->
        <deleteIcon @removeFromDashBoard="removeFromDashBoard" style="position: absolute;bottom: 0px; right: 0px"/>
    </Card>
</template>

<script>
    import { mapGetters, mapState } from 'vuex';
    import { getWebsiteTrafficStatusData } from '@/api/dashBoard/dashBoardV2';
    import CardFilter from './card-tables/card-filter.vue';
    import SiteFilter from './site-filter.vue';
    import deleteIcon from './deleteIcon';
    import { formatNumWithCommas } from '@/utils/dataProcessing';
    import elementResizeDetectorMaker from 'element-resize-detector';

    export default {
        name: 'dashBoardChart',
        components: {
            CardFilter,
            SiteFilter,
            deleteIcon
        },
        props: [
            'form',
            'kind',
            'site_list',
            'syncTime'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                allFilterParameters: state => state.dashboard.filterParameters
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            tableTitle() {
                return this.$t(`dashBoardV2.Title.${this.kind}`);
            },
            helpTipTitle() {
                return this.$t(`helpTip.${this.kind}`);
            },
            // 当前选中的图表指标的集合
            checkedLegendList() {
                return this.legendList.filter(item => item.checked).map(item => item.name);
            }
        },
        data() {
            return {
                /* 全局 */
                // 筛选条件
                filterParameters: {},
                // 接口请求条件
                filterConObj: {},

                /* legend */
                statData: {},
                legendList: [],
                legendListConfig: {
                    websiteTrafficStatus: [
                        {
                            name: 'visitorCount',
                            lang: this.$t('dashBoardV2.chart.visitorCount'),
                            color: '#325BCE',
                            checked: true
                        },
                        {
                            name: 'newVisitorCount',
                            lang: this.$t('dashBoardV2.chart.newVisitorCount'),
                            color: '#325BCE',
                            checked: false
                        },
                        {
                            name: 'visitCount',
                            lang: this.$t('dashBoardV2.chart.visitCount'),
                            color: '#325BCE',
                            checked: false
                        },
                        {
                            name: 'avgVisitDuration',
                            lang: this.$t('dashBoardV2.chart.avgVisitDuration'),
                            color: '#325BCE',
                            checked: false
                        },
                        {
                            name: 'avgVisitDepth',
                            lang: this.$t('dashBoardV2.chart.avgVisitDepth'),
                            color: '#325BCE',
                            checked: false
                        },
                        {
                            name: 'bounceRate',
                            lang: this.$t('dashBoardV2.chart.bounceRate'),
                            color: '#325BCE',
                            checked: false
                        }
                    ]
                },
                legendLang: {
                    visitorCount: this.$t('dashBoardV2.chart.visitorCount'),
                    newVisitorCount: this.$t('dashBoardV2.chart.newVisitorCount'),
                    visitCount: this.$t('dashBoardV2.chart.visitCount'),
                    avgVisitDuration: this.$t('dashBoardV2.chart.avgVisitDuration'),
                    avgVisitDepth: this.$t('dashBoardV2.chart.avgVisitDepth'),
                    bounceRate: this.$t('dashBoardV2.chart.bounceRate')
                },

                /* chart */
                observer: null, // 配合插件监听图表容器宽度 resize
                chart: null,
                chartData: [],
                chartOption: {},
                chartOptionConfig: {
                    websiteTrafficStatus: {
                        tooltip: {
                            trigger: 'axis',
                            formatter: (a0) => {
                                let str = `<div style="font-size: 16px;font-weight: 500;margin-bottom: 10px;">${a0[0].axisValueLabel}</div>`;
                                a0.forEach(item => {
                                    // title 处理
                                    const title = this.legendLang[item.seriesName];
                                    // value 处理
                                    let value = item.value;
                                    switch (item.seriesName) {
                                        case 'avgVisitDuration':
                                            value = this.chartData[item.axisValueLabel].avgVisitDurationStr;
                                            break;
                                        case 'bounceRate':
                                            value = this.chartData[item.axisValueLabel].bounceRateStr;
                                            break;
                                        default:
                                            value = formatNumWithCommas(value || '-');
                                    }
                                    // str += `<div style="background: ${item.color};display: inline-block;width: 12px;height: 12px;border-radius: 4px;margin-right: 8px;position: relative;top: 0.5px;"></div>${this.legendLang[item.seriesName]} : `;
                                    str += `${title} : `;
                                    str += `${value} <br />`;
                                });
                                return str;
                            }
                        },
                        legend: {
                            show: false,
                            selected: {
                                visitorCount: true,
                                newVisitorCount: false,
                                visitCount: false,
                                avgVisitDuration: false,
                                avgVisitDepth: false,
                                bounceRate: false
                            }
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        xAxis: {
                            type: 'category',
                            boundaryGap: false,
                            axisLine: {
                                show: false
                            },
                            axisTick: {
                                show: false
                            },
                            data: []
                        },
                        yAxis: [
                            {
                                type: 'value',
                                id: 'visitorCount',
                                name: this.$t('dashBoardV2.chart.visitorCount'),
                                show: true,
                                position: 'left',
                                inverse: false,
                                axisLine: {
                                    show: false
                                },
                                axisLabel: {
                                    show: true
                                },
                                axisTick: {
                                    lineStyle: {
                                        opacity: 0
                                    }
                                },
                                alignTicks: true
                            },
                            {
                                type: 'value',
                                id: 'newVisitorCount',
                                name: this.$t('dashBoardV2.chart.newVisitorCount'),
                                show: false,
                                position: 'left',
                                inverse: false,
                                axisLine: {
                                    show: false
                                },
                                axisLabel: {
                                    show: true
                                },
                                axisTick: {
                                    lineStyle: {
                                        opacity: 0
                                    }
                                },
                                alignTicks: true
                            },
                            {
                                type: 'value',
                                id: 'visitCount',
                                name: this.$t('dashBoardV2.chart.visitCount'),
                                show: false,
                                position: 'right',
                                inverse: false,
                                axisLine: {
                                    show: false
                                },
                                axisLabel: {
                                    show: true
                                },
                                axisTick: {
                                    lineStyle: {
                                        opacity: 0
                                    }
                                },
                                alignTicks: true
                            },
                            {
                                type: 'value',
                                id: 'avgVisitDuration',
                                name: this.$t('dashBoardV2.chart.avgVisitDuration'),
                                show: false,
                                position: 'left',
                                inverse: false,
                                axisLine: {
                                    show: false
                                },
                                axisLabel: {
                                    show: true,
                                    formatter: (value, index) => {
                                        // 根据数据最大值, 动态切换时间单位
                                        if (!value) {
                                            return 0;
                                        }
                                        if (this.maxAvgVisitDuration > 3600) {
                                            return `${parseInt(value / 3600)} ${this.$t('dashBoardV2.time.hours')}`;
                                        }
                                        if (this.maxAvgVisitDuration > 60) {
                                            return `${parseInt(value / 60)} ${this.$t('dashBoardV2.time.minutes')}`;
                                        }
                                        return `${parseInt(value / 60)} ${this.$t('dashBoardV2.time.seconds')}`;
                                    }
                                },
                                axisTick: {
                                    lineStyle: {
                                        opacity: 0
                                    }
                                },
                                alignTicks: true
                            },
                            {
                                type: 'value',
                                id: 'avgVisitDepth',
                                name: this.$t('dashBoardV2.chart.avgVisitDepth'),
                                show: false,
                                position: 'left',
                                inverse: false,
                                axisLine: {
                                    show: false
                                },
                                axisLabel: {
                                    show: true
                                },
                                axisTick: {
                                    lineStyle: {
                                        opacity: 0
                                    }
                                },
                                alignTicks: true
                            },
                            {
                                type: 'value',
                                id: 'bounceRate',
                                name: this.$t('dashBoardV2.chart.bounceRate'),
                                show: false,
                                position: 'left',
                                inverse: false,
                                axisLine: {
                                    show: false
                                },
                                axisLabel: {
                                    show: true,
                                    formatter(value, index) {
                                        // 源数据此前已转换为数值以便折线图显示, 此处再转换为百分比显示
                                        return `${value}%`;
                                    }
                                },
                                axisTick: {
                                    lineStyle: {
                                        opacity: 0
                                    }
                                },
                                alignTicks: true
                            }
                        ],
                        series: [
                            {
                                name: 'visitorCount',
                                type: 'line',
                                stack: 'visitorCount',
                                itemStyle: {
                                    color: '#325BCE'
                                },
                                data: []
                            },
                            {
                                name: 'newVisitorCount',
                                type: 'line',
                                stack: 'newVisitorCount',
                                yAxisIndex: 1,
                                itemStyle: {
                                    color: '#325BCE'
                                },
                                data: []
                            },
                            {
                                name: 'visitCount',
                                type: 'line',
                                stack: 'visitCount',
                                yAxisIndex: 2,
                                itemStyle: {
                                    color: '#325BCE'
                                },
                                data: []
                            },
                            {
                                name: 'avgVisitDuration',
                                type: 'line',
                                stack: 'avgVisitDuration',
                                yAxisIndex: 3,
                                itemStyle: {
                                    color: '#325BCE'
                                },
                                data: []
                            },
                            {
                                name: 'avgVisitDepth',
                                type: 'line',
                                stack: 'avgVisitDepth',
                                yAxisIndex: 4,
                                itemStyle: {
                                    color: '#325BCE'
                                },
                                data: []
                            },
                            {
                                name: 'bounceRate',
                                type: 'line',
                                stack: 'bounceRate',
                                yAxisIndex: 5,
                                itemStyle: {
                                    color: '#325BCE'
                                },
                                data: []
                            }
                        ]
                    }
                },

                // chartData 数据处理暂存
                // 平均访问时长最大值, 用于控制平均访问时长折线图 y 轴的显示
                maxAvgVisitDuration: 0
            };
        },
        methods: {
            /* 全局 */
            // 删除当前组件
            removeFromDashBoard() {
                this.$emit('removeFromDashBoard', this.kind);
            },
            // 数据格式处理
            formatNumWithCommas,

            /* 筛选 */
            handleFilter(data) {
                const { filterKey, filterValue } = data;
                this.handleClick(filterKey, filterValue);
            },
            handleClick(key, val) {
                this.$set(this.filterParameters, [key], val);
                const allFilterParameters = this.filterParameters;
                allFilterParameters[this.kind] = this.filterParameters;
                this.$store.commit('setFilterParameters', allFilterParameters);
            },

            /* stat 统计数据 */
            handleStatData(data) {
                const {
                    visitorCount,
                    newVisitorCount,
                    visitCount,
                    avgVisitDuration,
                    avgVisitDepth,
                    bounceRate
                } = data;

                return {
                    visitorCount,
                    newVisitorCount,
                    visitCount,
                    avgVisitDuration,
                    avgVisitDepth,
                    bounceRate
                };
            },
            // 切换指标是否勾选
            toggleLegendItem(item) {
                // 多选逻辑, 先注释掉, 目前只支持显示一个指标
                // // 至少要勾选一个指标
                // if (!item.checked || this.checkedLegendList.length > 1) {
                //     item.checked = !item.checked;
                // }

                // 单选逻辑, 目前仅支持显示一个指标
                if (!item.checked) {
                    this.legendList.forEach(legendItem => {
                        legendItem.checked = legendItem.name === item.name;
                    });
                }
            },

            /* chart */
            getChartData() {
                const postData = {
                    orgId: this.enterpriseId,
                    siteId: this.filterParameters.siteId,
                    searchType: this.filterParameters.timeUnit,
                    startDate: `${this.$dym.timeFormat(this.filterParameters.dateRange[0])} 00:00:00`,
                    endDate: `${this.$dym.timeFormat(this.filterParameters.dateRange[1])} 23:59:59`
                };
                getWebsiteTrafficStatusData(postData).then(res => {
                    // 如果请求期间站点已切换, 退出流程
                    if (this.filterParameters.siteId !== postData.siteId) {
                        return;
                    }

                    if (res.code === '1' && res.data && Array.isArray(res.data.list)) {
                        this.filterConObj = Object.assign({ index: this.checkedLegendList.join(',') }, postData);
                        this.chartData = this.handleChartData(res.data.list);
                        this.statData = this.handleStatData(res.data.total || {});
                        const valueObj = Object.values(this.chartData);
                        this.chart.setOption({
                            xAxis: {
                                data: Object.keys(this.chartData)
                            },
                            series: this.chartOption.series.map(item => {
                                item.data = valueObj.map(valItem => {
                                    return valItem[item.name] || 0;
                                });
                                return item;
                            })
                        });
                    } else {
                        // 其他失败场景

                        this.filterConObj = {};
                        this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    }
                }).catch(e => {
                    // 其他失败场景

                    console.error(e);
                    this.filterConObj = {};
                    this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                });
            },
            handleChartData(data) {
                const result = {};

                // 暂存最大平均访问时长, 用于控制平均访问时长折线图 y 轴的显示
                let maxAvgVisitDuration = 0;

                // 数据处理
                data.forEach(item => {
                    if (item.key) {
                        // 平均访问时长转换为秒, 便于折线图显示
                        const avgVisitDuration = this.convertDurationStrToSeconds(item.avgVisitDuration);
                        // 更新最大平均访问时长
                        if (maxAvgVisitDuration < avgVisitDuration) {
                            maxAvgVisitDuration = avgVisitDuration;
                        }

                        // 跳出率转换为数值, 便于折线图显示
                        let bounceRate = parseFloat(item.bounceRate);
                        if (Number.isNaN(bounceRate)) {
                            bounceRate = undefined;
                        }

                        // 暂存数据
                        result[item.key] = {
                            visitorCount: item.visitorCount,
                            newVisitorCount: item.newVisitorCount,
                            visitCount: item.visitCount,
                            avgVisitDuration,
                            // 保留原始数据, 便于 tooltip 显示
                            avgVisitDurationStr: item.avgVisitDuration,
                            avgVisitDepth: item.avgVisitDepth,
                            bounceRate,
                            // 保留原始数据, 便于 tooltip 显示
                            bounceRateStr: item.bounceRate
                        };
                    }
                });

                // 更新最大平均访问时长
                this.maxAvgVisitDuration = maxAvgVisitDuration;

                // 返回处理后的数据
                return result;
            },
            // 将'时:分:秒'时长字符串转换为秒数
            convertDurationStrToSeconds(timeStr) {
                const parts = timeStr.split(':');
                const hours = parseInt(parts[0], 10);
                const minutes = parseInt(parts[1], 10);
                const seconds = parseInt(parts[2], 10);
                return hours * 3600 + minutes * 60 + seconds;
            },

            // 刷新数据, 重绘图表
            refreshData() {
                this.getChartData();
            }
        },
        watch: {
            // 过滤条件变化时触发数据刷新
            filterParameters: {
                handler(val) {
                    if (this.timer) {
                        clearTimeout(this.timer);
                        this.timer = null;
                    }
                    this.timer = setTimeout(() => {
                        this.pageNo = 1;
                        this.tableData = [];
                        this.refreshData();
                    }, 200);
                },
                immediate: true,
                deep: true
            },
            // 选中 legend 发生变化时刷新图表
            checkedLegendList: {
                handler() {
                    if (this.chart) {
                        // 设置 legend 显隐
                        const legend = {};
                        this.legendList.forEach(item => {
                            legend[item.name] = item.checked;
                        });

                        // 控制多 Y 轴显隐
                        const yAxis = this.chartOption.yAxis;
                        if (this.checkedLegendList.length > 2) {
                            // 选中指标大于两项, 所有 y 轴都不显示了, 参照 Google search console 图标
                            yAxis.forEach(item => {
                                // 隐藏轴时要连 axisLabel 一起隐藏掉, 不然多条轴实际还在占位, 两侧显示空白, 压缩了图表显示面积
                                item.show = false;
                                item.axisLabel.show = false;
                            });
                        } else {
                            // 选中指标小于两项, 按先后顺序排列左右轴
                            const position = ['left', 'right'];
                            yAxis.forEach(item => {
                                if (legend[item.id] && position.length) {
                                    item.show = true;
                                    item.axisLabel.show = true;
                                    item.position = position.shift();
                                } else {
                                    item.show = false;
                                    item.axisLabel.show = false;
                                }
                            });
                        }

                        // 刷新图表
                        this.chart.setOption({
                            legend: {
                                selected: legend
                            },
                            yAxis
                        });
                    }

                    // 更新"接口请求参数"(导出要用)
                    this.filterConObj = Object.assign({}, this.filterConObj, { index: this.checkedLegendList.join(',') });
                }
            },
            // 当前图表的全部接口请求参数 + 显示指标
            filterConObj: {
                handler(val) {
                    this.$emit('updateTableFilterConObj', val);
                }
            }
        },
        mounted() {
            this.filterParameters = this.allFilterParameters[this.kind];
            this.legendList = this.legendListConfig[this.kind];
            this.chartOption = this.chartOptionConfig[this.kind];
            this.chart = this.$echarts.init(this.$refs.chart);
            this.chart.setOption(this.chartOption);

            // 监听聊天框容器的高度, 适时调整 scroll 的高度
            if (!this.observer) {
                const _el = this.$refs.chart;

                if (_el) {
                    // 监听聊天框容器的高度, 适时调整 scroll 的高度
                    this.observer = elementResizeDetectorMaker();

                    this.observer.listenTo(_el, (el) => {
                        this.$nextTick(() => {
                            if (this.chart && this.chart.resize) {
                                this.chart.resize();
                            }
                        });
                    });
                }
            }
        },
        beforeDestroy() {
            // 解绑定对图表容器的 resize 监听
            if (this.observer) {
                this.observer.uninstall(this.$refs.chart);
                this.observer = null;
            }

            // 清除图表实例
            if (this.chart && this.chart.dispose) {
                this.chart.dispose();
            }
        }
    };
</script>

<style lang="less">
    @import './new-tables/common.less';
</style>

<style lang="less" scoped>
    .dashBoardChart {
        background: #FFF;

        &-chart-legend {
            display: inline-flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 14px 34px 10px;
            min-width: 160px;
            margin-top: 18px;
            cursor: pointer;
            position: relative;

            &__checked {
                background: #F4F4F4;
            }

            &__disabled {
                cursor: not-allowed;
            }

            &-header {
                margin-bottom: 8px;
                font-size: 14px;
                line-height: 22px;
                color: rgba(0, 0, 0, 0.8);
            }

            &-color {
                display: inline-block;
                width: 12px;
                height: 12px;
                border-radius: 4px;
                margin-right: 8px;
                position: relative;
                top: 0.5px;
            }

            &-helpTip {
                position: absolute;
                right: 13px;
                top: 18px;
            }

            &-data {
                font-size: 28px;
                line-height: 30px;
                color: #333;
            }
        }

        &-chart {
            width: 100%;
            height: 325px;
            margin-bottom: 15px;
        }
    }

    .statistics-time {
        text-align: right;
        margin-top: 12px;
        font-size: 12px;
        line-height: 18px;
        color: #333;
    }
</style>
