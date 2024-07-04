<template>
    <div class="wordCloudBox">
        <div ref="chart" style="height: 564px;width: 750px;"></div>
    </div>
</template>

<script>
    import * as echarts from 'echarts';
    import 'echarts-wordcloud';
    import { mapState } from 'vuex';
    const imgBase64 = 'data:image/png;base64,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';

    const baseImg = new Image();
    baseImg.src = imgBase64;

    export default {
        name: 'WordCloud',
        computed: {
            ...mapState({
                orgId: state => state.enterpriseId
            })
        },
        props: {
            keywordsDataList: {
                default: () => { return []; },
                type: Array
            }
        },
        data() {
            return {
                ecOptions: {
                    tooltip: {
                        show: true
                    },
                    // backgroundColor: '#ff6700', // canvas背景颜色
                    // canvas标题配置项
                    // title: {
                    //     text: '我是标题',
                    //     top: '0%',
                    //     left: '-1%',
                    //     textStyle: {
                    //         fontSize: 14,
                    //         color: '#3B3E41',
                    //         fontWeight: 'normal'
                    //     }
                    // },
                    series: [
                        {
                            type: 'wordCloud',
                            // shape这个属性虽然可配置，但是在词的数量不太多的时候，效果不明显，它会趋向于画一个椭圆
                            shape: 'pentagon',
                            drawOutOfBound: false,
                            // 火狐浏览器及IE浏览器下,由于这个自定义背景的设置,词云不显示,所以暂时禁用这个背景设置
                            // maskImage: baseImg, // 这个是可以自定义背景图片的，词云会按照图片的形状排布，所以有形状限制的时候，最好用背景图来实现，而且，这个背景图一定要放base64的，不然词云画不出来
                            keepAspect: true, // 更好地保持形状(词云版本2才支持这个)
                            sizeRange: [12, 50], // 文本大小范围(最小12, 最大50)
                            rotationRange: [0, 0], // 文本旋转范围,默认范围为[-90, 90]
                            rotationStep: 45, // 文本旋转步进
                            // 下面的left/top/width/height/right/bottom用于定位词云
                            // 默认放置在中心，大小为 75% x 80%。
                            left: 'center',
                            top: 'center',
                            width: '100%',
                            height: '100%',
                            right: null,
                            bottom: null,

                            // tooltip: {
                            //     formatter: function(params) {
                            //         console.error('params', params);
                            //         return params.name;
                            //     }
                            // },

                            // 用于标记画布可用性的网格大小（以像素为单位）
                            // 网格尺寸越大，单词之间的差距越大
                            gridSize: 8,

                            layoutAnimation: true, // 布局的时候是否有动画

                            textPadding: 0,
                            autoSize: {
                                enable: true,
                                minSize: 12
                            },
                            // 全局文本样式
                            textStyle: {
                                // 词云为2x版本时,颜色要放在外面才生效,有点奇怪
                                // echarts5.0 echarts-wordcloud颜色不显示问题解决方案:https://github.com/ecomfe/echarts-wordcloud/issues/114
                                color: function() {
                                    return `rgb(${[
                                        Math.round(200 + Math.random() * 160),
                                        Math.round(100 + Math.random() * 160),
                                        Math.round(150 + Math.random() * 160)
                                    ].join(',')})`;
                                },
                                normal: {
                                    fontFamily: 'sans-serif',
                                    fontWeight: 'normal' // 'bold',
                                    // 词云为1x版本时,颜色要放在normal才会生效
                                    // color() {
                                    //     return 'red';
                                    //     // 颜色随机渐变
                                    //     const colors = ['#fe9a8bb3', '#fe9a8bb3', '#fe9a8b03', '#9E87FFb3', '#9E87FFb3', '#9E87FFb3', '#fe9a8bb3', '#fe9a8bb3', '#fe9a8bb3', '#73DDFF', '#58D5FF'];
                                    //     return colors[parseInt(Math.random() * 10)];
                                    // }
                                }
                            },
                            emphasis: {
                                shadowBlur: 10,
                                shadowColor: '#333'
                            },
                            // 数据是一个数组。每个数组项都必须具有名称和值属性。
                            data: [
                                // { name: 'HTML', value: 1 },
                                // { name: 'CSS', value: 2 },
                                // { name: 'JavaScript', value: 3 }
                            ]
                        }
                    ]
                }
            };
        },
        methods: {
            // 调用resize()方法重新渲染图表
            resizeWordCloud() {
                this.chart.resize();
            },
            // 词云初始化
            initWordClund() {
                this.chart = echarts.init(this.$refs.chart);
                this.chart.setOption(this.ecOptions);

                // console.error('this.chart', this.chart);
                // 监听页面变化时,重新加载词云
                window.addEventListener('resize', this.resizeWordCloud);
            }
        },
        beforeDestroy() {
            // 移除事件
            window.removeEventListener('resize', this.resizeWordCloud);
        },
        watch: {
            keywordsDataList: {
                handler(val) {
                    let valBacked = [];
                    valBacked = val.map(item => {
                        // 如果词云的次数为0,则不显示该词云
                        if (!item.count) return false;
                        return {
                            name: item.keyword,
                            value: item.count
                        };
                    });

                    const isBelowThreshold = (item) => {
                        return item.value <= 0;
                    };

                    const isAllZero = valBacked.every(isBelowThreshold);
                    // console.error('isAllZero', isAllZero);

                    if (isAllZero) {
                        valBacked[0].value = 1;
                    }

                    this.ecOptions.series[0].data = valBacked;
                    // console.error('this.ecOptions.series[0].data', this.ecOptions.series[0].data);
                    this.initWordClund();
                },
                deep: true
            }
        }
    };
</script>

<style scoped>
    .wordCloudBox {
        display: flex;
        justify-content: center;
        position: absolute;
        top: 50%;
        margin-top: -282px;
        left: 50%;
        margin-left: -375px;
    }
</style>
