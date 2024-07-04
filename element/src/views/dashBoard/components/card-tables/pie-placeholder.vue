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
        name: 'pie-placeholder',
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
                        data: ['已完成', '未完成'],
                        right: 10,
                        top: 20,
                        bottom: 20,
                    },
                    grid: {
                        containLabel: true,
                        // width: '80%',
                        // height: '80%'
                        left: '5%',
                        right: '5%',
                        top: '10%',
                        bottom: '10%'
                    },
                    series: [
                        {
                            name: '1',
                            type: 'pie',
                            radius: ['0%', '80%'],
                            center: ['50%', '50%'],
                            data: [{
                                name: '已完成',
                                value: Math.round(Math.random() * 100000),
                                itemStyle: {
                                    color: '#325BCE',
                                }
                            },{
                                name: '未完成',
                                value: Math.round(Math.random() * 100000),
                                itemStyle: {
                                    color: '#1FBFB1',
                                }
                            }],
                        },
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
