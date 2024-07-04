<template>
    <Card class="canvas_card" style="height: 100%; overflow: hidden">
        <div id="canvas_placeholder" ref="canvas_placeholder" style="width: 100%; height: 100%">
        </div>
    </Card>
</template>

<script>
    import { mapState } from 'vuex';
    import { debounce } from 'lodash';
    export default {
        name: 'canvas-placeholder',
        data() {
            return {
                myChart: null
            }
        },
        computed: {
            ...mapState([
                'window_width'
            ])
        },
        methods: {
            random(min, max) {
                return Math.floor(Math.random() * (max - min)) + min;
            },
            drawLine() {
                const myChartDom = this.$refs.canvas_placeholder;
                this.myChart = this.$echarts.init(myChartDom);
                const months = [];
                const data1 = [];
                const data2 = [];
                const data3 = [];
                for (let i = 0; i < 13; i++) {
                    months.push(`${i}月`);
                    data1.push(this.random(1, 100));
                    data2.push(this.random(1, 100));
                    data3.push(this.random(50, 100));
                }
                const chartOption = {
                    title: {
                        text: '业绩目标'
                    },
                    legend: {
                        data: ['已完成', '目标', '完成率'],
                        bottom: 0
                    },
                    grid: {
                        containLabel: true,
                        // width: '80%',
                        // height: '80%'
                        left: '5%',
                        right: '5%'
                    },
                    xAxis: [{
                        type: 'category',
                        data: months,
                        axisLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        }
                    }],
                    yAxis: [
                        {
                            type: 'value',
                            name: '金额/万元',
                            min: 0,
                            max: 100,
                            axisLine: {
                                show: false
                            },
                            axisTick: {
                                show: false
                            },
                            nameLocation: 'middle',
                            nameGap: 36,
                        },
                        {
                            type: 'value',
                            name: '完成率',
                            min: 0,
                            max: 100,
                            axisLabel: {
                                formatter: '{value}%'
                            },
                            axisLine: {
                                show: false
                            },
                            axisTick: {
                                show: false
                            },
                            nameLocation: 'middle',
                            nameGap: 36,
                        }
                    ],
                    series: [
                        {
                            name: '1',
                            type: 'bar',
                            data: data1,
                            itemStyle: {
                                color: '#325BCE',
                            }
                        },
                        {
                            name: '2',
                            type: 'bar',
                            data: data2,
                            itemStyle: {
                                color: '#1FBFB1',
                            }
                        },
                        {
                            name: '3',
                            type: 'line',
                            yAxisIndex: 1,
                            data: data3,
                            itemStyle: {
                                color: '#EE5943',
                            }
                        }
                    ]
                };
                this.myChart.setOption(chartOption);
            },
            resize: debounce(function() {
                if (this.myChart && this.myChart.resize) this.myChart.resize();
            }, 200)
        },
        mounted() {
            this.drawLine();
        },
        watch: {
            window_width(val) {
                this.resize();
            }
        }
    };
</script>

<style scoped lang="less">
    .canvas_card {
        width: 100%;
    }
    .canvas_card {
        /deep/ .el-card__body {
            height: 100%;
        }
    }
</style>
