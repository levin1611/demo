<template>
  <Card :body-style="{padding: '18px 20px 30px'}" style="border-radius: 8px">
    <!-- 客服在线时长统计 -->
    <div id="general-panel31415926" style="height: 500px;overflow: hidden" class="general-panel"></div>
<!--    <div style="position: fixed;bottom: 5px; right: 5px" v-if="isConfig">-->
<!--      <Icon custom="custom-delete-component" size="36" @click="removeFromDashBoard"></Icon>-->
<!--    </div>-->
    <deleteIcon @removeFromDashBoard="removeFromDashBoard" style="position: absolute;bottom: 0px; right: 0px"/>
  </Card>
</template>

<script>
    import util from '@/libs/util';
    import Utils from '@/utils';
    import { mapState } from 'vuex';
    import { debounce } from 'lodash';
    import deleteIcon from './deleteIcon';

    export default {
        name: 'reportPanel',
        computed: {
            ...mapState([
                'enterpriseId',
                'window_width'
            ]),
            isConfig() {
                return this.$store.state.dashboard.isConfiguring;
            }
        },
        components: {
            deleteIcon
        },
        data() {
            return {
                showLoadingOpts: {
                    text: 'loading',
                    color: '#fd7a35',
                    textColor: '#fd7a35',
                    maskColor: 'rgba(255, 255, 255, 1)',
                    zlevel: 0
                }, // 图标 loading 配置
                // 客服在线时长统计
                chart3: null,
                option3: {}
            };
        },
        methods: {

            // 获取图3数据 + 渲染
            getChart3() {
                util.ajaxInternational({
                    url: '/server/getConsumerServiceDateInfo',
                    method: 'post',
                    data: {
                        enterpriseId: this.enterpriseId,
                        days: 14
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const dateList = response.data.data.dateList;
                        const userList = response.data.data.userList;
                        const durationMap = response.data.data.durationMap;
                        const timeSeries = [];
                        const legendData = [];

                        // 格式化数据
                        for (const service of userList) {
                            if (service.id !== '8dcbac72063c4a2d8dceee8a3a5dbeea') {
                                timeSeries.push({
                                    type: 'line',
                                    name: service.fullName,
                                    symbol: 'circle',
                                    symbolSize: 6,
                                    data: durationMap[service.id]
                                });
                                // 定义聊天时长表的图例的icon为圆矩形
                                legendData.push({
                                    name: service.fullName,
                                    icon: 'roundRect'
                                });
                            }
                        }

                        // 计算得到图表的一个合适的设置数据(boundaryGap参数)
                        let dataMax = null;
                        Object.keys(durationMap).map(key => {
                            const temp = durationMap[key].map(item => {
                                return item - 0;
                            });
                            if (dataMax < Math.max(...temp)) {
                                dataMax = Math.max(...temp);
                            }
                        });
                        if (dataMax <= 0) {
                            dataMax = 1;
                        }

                        // 渲染图表
                        this.chart3.hideLoading();
                        this.option3 = {
                            backgroundColor: '#fff',
                            color: Utils.chartColors,
                            tooltip: {
                                trigger: 'axis',
                                confine: true,
                                formatter: (params) => {
                                    let tempStr = '';
                                    const tempParams = params.sort((a, b) => b.data - a.data);
                                    for (const item of tempParams) {
                                        tempStr += `${item.seriesName}: ${Math.floor(item.data / 60)}${this.$t('dashBoard.hour')} ${item.data % 60}${this.$t('dashBoard.minute')}<br/>`;
                                    }
                                    return tempStr;
                                },
                                enterable: true,
                                extraCssText: 'max-height: 200px;overflow:auto;'
                            },
                            title: {
                                text: `${this.$t('dashBoard.serviceOnlineDuration')}(${this.$t('dashBoard.hour')})`,
                                textStyle: {
                                    fontSize: 20
                                }
                                // padding: [5, 0]
                            },
                            grid: {
                                right: '15%',
                                left: '5%'
                            },
                            legend: {
                                type: 'scroll',
                                orient: 'vertical',
                                formatter: (name) => {
                                    return this.$echarts.format.truncateText(name, 100, '14px Microsoft Yahei', '…');
                                },
                                tooltip: {
                                    show: true,
                                    confine: true
                                },
                                right: 20,
                                top: 25,
                                bottom: 20,
                                data: legendData
                            },
                            xAxis: {
                                type: 'category',
                                data: dateList,
                                axisTick: {
                                    show: false,
                                    alignWithLabel: true
                                },
                                axisLine: {
                                    lineStyle: {
                                        color: '#eff0f4',
                                        width: 2
                                    }
                                },
                                axisLabel: {
                                    color: 'rgba(0, 0, 0, .8)'
                                }
                            },
                            yAxis: {
                                type: 'value',
                                axisLine: {
                                    show: false
                                },
                                axisTick: {
                                    show: false
                                },
                                interval: 60,
                                boundaryGap: [0, `${100 / Math.ceil(dataMax / 60)}%`],
                                axisLabel: {
                                    formatter(value, index) {
                                        return `${Math.ceil((value / 60))}`;
                                    }
                                },
                                splitLine: {
                                    show: true,
                                    lineStyle: {
                                        color: '#eff0f4',
                                        type: 'dashed'
                                    }
                                }
                            },
                            series: timeSeries
                        };
                        this.chart3.setOption(this.option3);
                    } else {
                        this.chart3.hideLoading();
                        this.$Message.error(this.$t('dashBoard.error_getOnlineDuration'));
                    }
                }).catch(() => {
                    this.chart3.hideLoading();
                    this.$Message.error(this.$t('dashBoard.error_getOnlineDuration'));
                });
            },
            removeFromDashBoard() {
                this.$emit('removeFromDashBoard', 'indexCanvas');
            },
            resize: debounce(function() {
                if (this.chart3 && this.chart3.resize) this.chart3.resize();
            }, 200)
        },
        mounted() {
            setTimeout(() => {
                this.chart3 = this.$echarts.init(document.getElementById('general-panel31415926'));
                this.chart3.showLoading(this.showLoadingOpts);
                this.getChart3();
            });
        },
        watch: {
            window_width(val) {
                this.resize();
            }
        }
    };
</script>
