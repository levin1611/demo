<template>
    <div class="pageIndexing">
        <!-- title -->
        <div class="pageIndexing-header">
            <!-- 标题 -->
            <div class="pageIndexing-title">{{ $t('googleSearchConsole.title_PageIndexing') }}</div>

            <!-- 上次更新时间 -->
            <div class="pageIndexing-lastUpdateTime">{{ $t('googleSearchConsole.lastUpdateTime') }}:
                {{ statData.lastUpdateTime }}
            </div>
        </div>

        <!-- 手动控制图表 legend -->
        <div v-for="item in showLegendList"
             :key="item.name"
             @click="toggleLegendItem(item)"
             :class="{ 'pageIndexing-chart-legend__checked': item.checked, 'pageIndexing-chart-legend__disabled': (checkedLegendList.length === 1 && checkedLegendList[0] === item.name) }"
             class="pageIndexing-chart-legend">
            <div class="pageIndexing-chart-legend-header">
                <div class="pageIndexing-chart-legend-color"
                     :style="{ background: item.color }"></div>
                {{ item.lang }}
                <!-- tip -->
                <Tooltip :content="item.helpTip">
                    <Icon custom="custom-tip"
                          class="pageIndexing-chart-legend-helpTip"></Icon>
                </Tooltip>
            </div>
            <div class="pageIndexing-chart-legend-data">
                {{ statData[item.name] || '-' }}
            </div>
        </div>

        <!-- 图表 -->
        <div ref="chart"
             class="pageIndexing-chart"></div>

        <!-- 表格部分 -->
        <div class="pageIndexing-table-container">
            <!-- 表格 tabs -->
            <div class="pageIndexing-table-tabs">
                <Tabs v-model="currCompo">
                    <TabPane v-for="item in compoList"
                             :key="item.name"
                             :name="item.name"
                             :label="item.label"></TabPane>
                </Tabs>
            </div>

            <!-- 表格 -->
            <div class="pageIndexing-table">
                <keep-alive>
                    <component :is="currCompo"
                               :currSite="currSite"
                               :filterDate="filterDate"
                               :jumpData.sync="jumpData"
                               @filterNotIndexedReason="handleFilterNotIndexedReason"
                               @jumpCompo="handleJumpCompo"></component>
                </keep-alive>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { searchConsole } from '@/api/google/index';
    import NotIndexedReason from '@/views/Google-search-console/table/notIndexedReason.vue';
    import NotIndexedUrl from '@/views/Google-search-console/table/notIndexedUrl.vue';
    import IndexedUrl from '@/views/Google-search-console/table/indexedUrl.vue';

    export default {
        name: 'pageIndexing',
        components: {
            NotIndexedReason,
            NotIndexedUrl,
            IndexedUrl
        },
        props: {
            currSite: {
                type: Object,
                default() {
                    return {};
                }
            },
            filterDate: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        computed: {
            ...mapState({
                window_width: 'window_width'
            }),
            // 当前展示的 legend --- 需要根据底部显示的表格控制 legend 显隐
            showLegendList() {
                let result = this.legendList.slice();
                if (this.currCompo === 'NotIndexedUrl') {
                    result = result.filter(item => item.name === 'notIndexedPage');
                    result[0].checked = true;
                } else if (this.currCompo === 'IndexedUrl') {
                    result = result.filter(item => item.name === 'indexedPage');
                    result[0].checked = true;
                }

                return result;
            },
            // 当前选中的图表指标的集合
            checkedLegendList() {
                return this.showLegendList.filter(item => item.checked).map(item => item.name);
            }
        },
        data() {
            return {
                /* chart */
                statData: {},
                legendList: [
                    {
                        name: 'notIndexedPage',
                        lang: this.$t('googleSearchConsole.notIndexed'),
                        helpTip: this.$t('googleSearchConsole.tip_notIndexed'),
                        color: '#325BCE',
                        checked: true
                    },
                    {
                        name: 'indexedPage',
                        lang: this.$t('googleSearchConsole.indexed'),
                        helpTip: this.$t('googleSearchConsole.tip_indexed'),
                        color: '#1FBFB1',
                        checked: true
                    }
                ],
                legendLang: {
                    notIndexedPage: this.$t('googleSearchConsole.notIndexed'),
                    indexedPage: this.$t('googleSearchConsole.indexed')
                },
                chart: null,
                chartData: [],
                chart_option: {
                    tooltip: {
                        trigger: 'axis',
                        formatter: (a0) => {
                            let str = `<div style="font-size: 16px;font-weight: 500;margin-bottom: 10px;">${a0[0].axisValueLabel}</div>`;
                            a0.forEach(item => {
                                str += `<div style="background: ${item.color};display: inline-block;width: 12px;height: 12px;border-radius: 4px;margin-right: 8px;position: relative;top: 0.5px;"></div>${this.legendLang[item.seriesName]} : ${item.value} <br />`;
                            });
                            return str;
                        },
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    legend: {
                        show: false,
                        selected: {
                            notIndexedPage: true,
                            indexedPage: true
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
                        data: []
                    },
                    yAxis: {
                        type: 'value',
                        axisLine: {
                            show: false
                        }
                    },
                    series: [
                        {
                            name: 'notIndexedPage',
                            type: 'bar',
                            barWidth: '30px',
                            stack: 'pageCount',
                            emphasis: {
                                focus: 'series'
                            },
                            itemStyle: {
                                color: '#325BCE'
                            },
                            data: []
                        },
                        {
                            name: 'indexedPage',
                            type: 'bar',
                            barWidth: '30px',
                            stack: 'pageCount',
                            emphasis: {
                                focus: 'series'
                            },
                            itemStyle: {
                                color: '#1FBFB1'
                            },
                            data: []
                        }
                    ]
                },
                /**
                 * @Description: 请求图表数据的非必要参数
                 * 索引状态关键词 用法：
                 * （1）传 “提取成功” 或 “成功” 则仅返回存在已编入索引数据 传错误原因关键字如 “404” 则只返回存在该错误原因的未编入索引数据 ，如不传或为空则正常返回已编入与未编入索引数据
                 * （2）传 “onlyNotIndexed”则返回所有未添加索引的数据《主要用于直接点击未编入索引的网址的情况的柱形图》
                 * （3）点击表格网页未编入索引原因下其中一个原因跳转时 传入所点击原因 即可更新柱形图
                 */
                indexedStatusKey: '',

                /* tabs */
                currCompo: 'NotIndexedReason',
                compoList: [
                    {
                        name: 'NotIndexedReason',
                        label: this.$t('googleSearchConsole.notIndexedReason')
                    },
                    {
                        name: 'NotIndexedUrl',
                        label: this.$t('googleSearchConsole.notIndexedUrl')
                    },
                    {
                        name: 'IndexedUrl',
                        label: this.$t('googleSearchConsole.indexedUrl')
                    }
                ],
                jumpData: {}
            };
        },
        methods: {
            // 切换指标是否勾选
            toggleLegendItem(item) {
                // 至少要勾选一个指标
                if (!item.checked || this.checkedLegendList.length > 1) {
                    item.checked = !item.checked;
                }
            },

            /* chart */
            getChartData() {
                searchConsole.getPageIndexingChartData({
                    siteUrl: this.currSite.siteUrl,
                    startDate: this.filterDate[0],
                    endDate: this.filterDate[1],
                    indexedStatusKey: this.currCompo === 'NotIndexedUrl' ? this.indexedStatusKey : ''
                }).then(res => {
                    if (res.code === '1') {
                        this.chartData = this.handleChartData(res.data.items);
                        this.statData = {
                            notIndexedPage: res.data.notIndexedSum,
                            indexedPage: res.data.indexedSum,
                            lastUpdateTime: res.data.lastCrawlDate
                        };
                        const valueObj = Object.values(this.chartData);
                        this.chart.setOption({
                            xAxis: {
                                data: Object.keys(this.chartData)
                            },
                            series: this.chart_option.series.map(item => {
                                item.data = valueObj.map(valItem => {
                                    return valItem[item.name] || 0;
                                });
                                return item;
                            })
                        });
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    }
                }).catch(e => {
                    console.error(e);
                    this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                });
            },
            handleChartData(data) {
                const result = {};

                data.forEach(item => {
                    if (item.inspectionDate) {
                        result[item.inspectionDate] = {
                            notIndexedPage: item.notIndexedCount,
                            indexedPage: item.indexedCount
                        };
                    }
                });

                return result;
            },

            // 刷新数据, 重绘图表
            refreshData() {
                this.getChartData();
            },

            // 处理组件间跳转
            handleJumpCompo(val) {
                if (val && val.type !== this.currCompo) {
                    this.currCompo = val.type;
                    if (val.data) {
                        this.jumpData = val.data;
                    }
                }
            },
            // 处理未编入索引网页表格对"未编入索引原因"列做搜索引发的图表刷新
            handleFilterNotIndexedReason(val) {
                if (this.indexedStatusKey !== val) {
                    this.indexedStatusKey = val;
                    this.refreshData();
                }
            }
        },
        watch: {
            window_width: {
                handler(val) {
                    if (this.chart && this.chart.resize) {
                        this.chart.resize();
                    }
                }
            },
            // 选中 legend 发生变化时刷新图表
            checkedLegendList: {
                handler(val) {
                    if (this.chart) {
                        // 设置 legend 显隐
                        const legend = {};
                        this.legendList.forEach(item => {
                            legend[item.name] = val.includes(item.name) && item.checked;
                        });
                        // 刷新图表
                        this.chart.setOption({
                            legend: {
                                selected: legend
                            }
                        });
                    }
                }
            },
            currCompo: {
                handler(val, oldVal) {
                    // 如果当前未编入索引网页表格之前对"未编入索引原因"列有做筛选
                    if (this.indexedStatusKey) {
                        // 从"未编入索引网页表格"跳到其他表格, 图表数据需刷新
                        if (oldVal === 'NotIndexedUrl') {
                            this.refreshData();
                        }

                        // 从其他表格跳到"未编入索引网页表格"
                        if (val === 'NotIndexedUrl') {
                            // 如果是带筛选条件跳转, 则图表数据不刷新
                            if (JSON.stringify(this.jumpData) === '{}') {
                                this.refreshData();
                            }
                        }
                    }
                }
            },
            'currSite.id': {
                handler(val) {
                    if (val) {
                        this.refreshData();
                    }
                }
            },
            filterDate() {
                this.refreshData();
            }
        },
        mounted() {
            this.chart = this.$echarts.init(this.$refs.chart);
            this.chart.setOption(this.chart_option);
            this.refreshData();
        },
        destroyed() {
            if (this.chart && this.chart.dispose) {
                this.chart.dispose();
            }
        }
    };
</script>

<style lang="less" scoped>
    .pageIndexing {
        background: #FFF;
        padding: 20px 20px 0;

        &-header {
            position: relative;
        }

        &-title {
            font-weight: 600;
            font-size: 16px;
            line-height: 24px;
            color: #333;
        }

        &-lastUpdateTime {
            display: inline-block;
            position: absolute;
            right: 0;
            top: 1px;
            font-size: 14px;
            line-height: 22px;
            text-align: right;
            color: #666;
        }

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
                color: #000;
            }
        }

        &-chart {
            width: 100%;
            height: 300px;
            margin-bottom: 15px;
        }

        &-table-tabs {
            /deep/ .el-tabs__header {
                margin: 0;
            }

            /deep/ .el-tabs__nav-wrap::after {
                height: 1px;
            }
        }
    }
</style>
