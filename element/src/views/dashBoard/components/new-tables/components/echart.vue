<template>
    <div id="chartViewBox">
        <div class="funnelBox"
              v-loading="funnelSpinShow"
              element-loading-spinner="ivu-icon ivu-icon-load-c">
            <!-- <div style="font-weight:700;font-size:16px">{{$t('crm.WorkBench.inquiryFunnelView')}}</div> -->
            <div id="chartView"></div>
        </div>
        <div style="display: none;" class="workbench-viewdistributionfunneldetails"></div>
    </div>
</template>

<script>
    import Utils from '@/utils';
    import { mapState } from 'vuex';
    import G2 from '@antv/g2';
    import { View } from '@antv/data-set';
    import { WorkBench } from '@/api/crm/index';
    const { getUserObjListExcludeDelete, getFunnelView, getCloseReason } = WorkBench;

    export default {
        name: 'echart',
        props: [
            'workBenchType',
            'from',
            'filterParameters',
            'currentCurrency',
            'kind'
        ],
        data() {
            return {
                colors: Utils.chartColors_90per,
                checkAllGroup: [],
                funnelData: [],
                funnelSpinShow: true,
                funnelchart: null,
                followUpId: 0
            };
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                orgId: state => state.enterpriseId,
                userName: state => state.userName,
                window_width: state => state.window_width,
                button_list: state => state.app.button_list,
                clue_btn_list: state => state.clue.clue_btn_list
            }) // 从 vuex 中获取属性
        },
        methods: {
            initChart() {
                this.getFunnelData();
            },
            /** 获取询盘漏斗数据 */
            getFunnelData() {
                // 显示加载遮罩
                this.funnelSpinShow = true;
                // 销毁漏斗图
                if (this.funnelchart) {
                    this.funnelchart.destroy();
                }
                // 重置漏斗数据
                this.funnelData = [];
                // 获取漏斗图视图数据
                getFunnelView({
                    orgId: this.orgId,
                    userId: this.userId,
                    admin: null,
                    saleIdList: [`${this.userId}`]
                }).then(response => {
                    // 判断响应结果是否成功
                    if (response.code === '1') {
                        // 隐藏加载遮罩
                        this.funnelSpinShow = false;
                        // 获取漏斗图数据列表
                        const dataList = response.data;
                        // 创建一个空数组dataChange用于存储计算后的漏斗图数据
                        const dataChange = [];
                        // 遍历dataList数组
                        for (let i = 0; i < dataList.length; i++) {
                            // 初始化sum变量，用于存储当前行的请求数之和
                            let sum = 0;
                            // 累加当前行的请求数，并将结果赋值给sum变量
                            sum += dataList[i].count;
                            // 创建一个对象，包含action、pv、count和id属性
                            dataChange.push({
                                action: dataList[i].inquiryState,
                                pv: sum,
                                count: dataList[i].count,
                                id: dataList[i].inquiryStateId
                            });
                        }
                        // 设置漏斗图数据
                        this.funnelData = dataChange;
                        let data = this.funnelData;
                        // 创建一个View对象，用于渲染漏斗图数据
                        const dv = new View().source(data);
                        // 对漏斗图数据进行转换，计算百分比
                        dv.transform({
                            type: 'percent',
                            field: 'pv',
                            dimension: 'action',
                            as: 'percent'
                        });
                        // 将转换后的漏斗图数据赋值给data变量
                        data = dv.rows;
                        // 创建一个G2.Chart对象，用于渲染漏斗图
                        this.funnelchart = new G2.Chart({
                            container: 'chartView',
                            forceFit: true,
                            height: 380,
                            padding: [20, 100, 20, 20]
                        });
                        // 获取漏斗图对象
                        const funnelchart = this.funnelchart;
                        const that = this;
                        // 设置漏斗图的来源数据
                        funnelchart.source(data, {
                            percent: {
                                nice: false
                            }
                        });
                        // 禁用轴线和图例
                        funnelchart.axis(false);
                        funnelchart.legend(false);
                        // 设置tooltip
                        funnelchart.tooltip({
                            showTitle: false,
                            itemTpl: '<li data-index={index} style="margin-bottom:4px;">' + '<span style="background-color:{color};" class="g2-tooltip-marker"></span>' + '{name}<br/>' + '<span style="padding-left: 16px">{key}：{count}</span><br/>' + '</li>'
                        });
                        funnelchart.coord('rect').transpose().scale(1, -1);
                        // 设置漏斗图的形状和颜色
                        funnelchart.intervalSymmetric().position('action*percent').shape('funnel').color('action', that.colors).label(
                            'action*count', function(action, count) {
                                return `${action} ${count}`;
                            },
                            {
                                offset: 35,
                                labelLine: {
                                    lineWidth: 1,
                                    stroke: 'rgba(0, 0, 0, 0.15)'
                                },
                                textStyle: {
                                    cursor: 'pointer'
                                }
                            }
                        ).tooltip('action*count', function(action, count) {
                            return {
                                name: action,
                                key: that.$t('crm.WorkBench.inquiryNumber'),
                                count: count
                            };
                        }).style({
                            // 设置鼠标悬停时的样式
                            cursor: 'pointer'
                        });
                        // data.forEach(function(obj) {
                        //   // 中间标签文本
                        //   chart.guide().text({
                        //     top: true,
                        //     position: {
                        //       action: obj.action,
                        //       percent: 'median'
                        //     },
                        //     content: parseInt(obj.percent * 100) + '%', // 显示的文本内容
                        //     style: {
                        //       fill: '#fff',
                        //       fontSize: '12',
                        //       textAlign: 'center',
                        //       shadowBlur: 2,
                        //       shadowColor: 'rgba(0, 0, 0, .45)'
                        //     }
                        //   });
                        // });
                        // 渲染漏斗图
                        funnelchart.render();
                        funnelchart.forceFit();
                        funnelchart.on('interval:click', ev => {
                            const data = ev.data;
                            if (data) {
                                that.followUpState = data._origin.action;
                                that.followUpId = data._origin.id;
                                that.jumpToInquiry();
                            }
                        });
                        // 绑定漏斗图中的中间标签点击事件
                        funnelchart.on('label:click', e => {
                            console.log(e);
                            // 判断事件对象是否存在且包含数据
                            if (e && e.data) {
                                // 获取中间标签的数据
                                const data = e.data;
                                // 赋值给followUpState和followUpId
                                that.followUpState = data.action;
                                that.followUpId = data.id;
                                // 调用that.jumpToInquiry()方法跳转到询盘列表
                                that.jumpToInquiry();
                            }
                        });
                        // }
                    }
                });
            },
            /** 点击跳转到询盘 */
            jumpToInquiry() {
                // 手动创建一个元素, 尝试解决图标上无法加追踪 class 的问题
                const temp = document.getElementsByClassName('workbench-viewdistributionfunneldetails')[0];
                if (temp) {
                    temp.click();
                }

                // console.log(this.followUpId);
                // this.$router.push({
                //     name: 'myInquiry',
                //     params: {
                //         workBench_type: this.workBenchType,
                //         screenDate:this.dateRange,
                //         followUpId:this.followUpId,
                //         saleIdList:this.workBenchType==='allInquiry'?this.checkAllGroup:[this.userId+'']
                //     }
                // })
                // 简单询盘处理如果有类似问题联系杨洋进行工厂处理
                const randomId = this.$dym.Rnum(8);
                // target 模块所要更新的key 参照 myInquiry checkRouteParams
                localStorage.setItem(`matchTargetChangeKeys${randomId}`, JSON.stringify([
                    'workBench_type',
                    'screenDate',
                    'followUpId',
                    'saleIdList'
                ]));
                // --------------------------------------------------------- split
                localStorage.setItem(`leadsCloud-workBench_type${randomId}`, this.workBenchType);
                localStorage.setItem(`leadsCloud-screenDate${randomId}`, JSON.stringify(this.dateRange));
                localStorage.setItem(`leadsCloud-followUpId${randomId}`, this.followUpId);
                localStorage.setItem(`leadsCloud-saleIdList${randomId}`, JSON.stringify(this.workBenchType === 'allInquiry' ? this.checkAllGroup : [`${this.userId}`]));
                window.open(this.$router.resolve({
                    name: 'myInquiry',
                    query: {
                        i: randomId,
                        k: `matchTargetChangeKeys${randomId}` // 定义要更新的取的listKey名
                    }
                }).href, '_blank');
            }
        },
        created() {
        },
        mounted() {
        },
        watch: {
            filterParameters: {
                handler(val) {
                    this.checkAllGroup = [];
                    this.initChart();
                },
                immediate: true,
                deep: true
            },
        }
    };
</script>

<style scoped lang="less">
    .workbench-filterButton {
        padding: 7px 9px;

        /deep/ i {
            font-size: 16px;
        }
    }
</style>

<style lang="less">
    #chartViewBox {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: rgba(0, 0, 0, 0.8);
        display: flex;

        .screenArea {
            text-align: right;
            margin-bottom: 20px;

            .sales-staff-flag {
                cursor: pointer;

                &:hover {
                    color: #FA8241;
                }
            }

            .ivu-poptip-popper {
                min-width: 90px;

                .ivu-poptip-content {
                    position: absolute;
                }
            }
        }

        .funnelBox {
            display: inline-block;
            text-align: center;
            width: 49%;
            margin: 0 auto;
            min-height: 400px;
            overflow: hidden;

            .demo-spin-icon-load {
                animation: ani-demo-spin 1s linear infinite;
            }
        }

        .checkboxgroup > label {
            display: block;
            margin-bottom: 5px;
            max-width: 120px;
            word-break: break-all;
        }
    }
</style>
