<template>
    <div class="b-r">
        <Card class="table_card _b_r">
            <!-- 首列 -->
            <div class="table_header _f _j_b">
                <div class="table_header_left _f _c _j_b">
                    <!-- 标题 -->
                    <span class="table_title">
                        {{$t('dashBoardV2.Title.estimatedAmount')}}
                        <HelpTip :title="$t('dashBoardV2.tips.estimatedAmount')"></HelpTip>
                    </span>
                </div>
                <div class="_f _j_b">
                    <!-- 个人/管理 视图切换 -->
                    <div class="table_header_right">
                        <Tabs type="card" v-model="activeTab" @tab-click="handleTabClick" class="table_header_tabs">
                            <TabPane name="personal">
                                <div slot="label" :class="`piwik_personal_estimated-amount`">
                                    <span>{{$t('dashBoardV2.Table.personalView')}}</span>
                                </div>
                            </TabPane>
                            <TabPane name="manager">
                                <div slot="label" :class="`piwik_manager_estimated-amount`">
                                    <span>{{$t('dashBoardV2.Table.manageView')}}</span>
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>
                
                </div>
            </div>
            <div class="personal_panel">
                <!-- chart -->
                <div :ref="estimatedAmount" id="estimatedAmount"></div>
            </div>
        </Card>
        <deleteIcon @removeFromDashBoard="removeFromDashBoard" style="position: absolute;bottom: 0px; right: 0px"></deleteIcon>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import Utils from '@/utils';
    import { mapState, mapGetters } from 'vuex';
    import G2 from '@antv/g2';
    import { View } from '@antv/data-set';
    import deleteIcon from './deleteIcon';

    export default {
        name: 'card-estimated-amount',
        components: {
            deleteIcon
        },
        props: [],
        data() {
            return {
                activeTab: 'personal',
                colors: Utils.chartColors_90per,
                funnelchart: null, // 图表实例
                refresh_table_flag: true,
                estimatedAmount:10,
                curPage:1,
                options: [
                    {
                        value: 1,
                        label: this.$t('dashBoardV2.Settings.dealtAmount')
                    },
                    {
                        value: 2,
                        label: this.$t('dashBoardV2.Settings.dealtInquiry')
                    }
                ],
            }
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                orgId: state => state.enterpriseId,
                userName: state => state.userName,
                window_width: state => state.window_width
            }),
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ])
        },
        methods: {
            //不显示操作按钮
            removeFromDashBoard(){
                 this.$emit('removeFromDashBoard', 'cardEstimatedAmount');
            },
            //g
            handleTabClick(tab) {
                this.getData();
            },
            //初始化图形
            initChart(data){
                const funnelchart = this.funnelchart;
                const that = this;
                const dv = new View().source(data);
                dv.transform({
                    type: 'percent',
                    field: 'pv',
                    dimension: 'action',
                    as: 'percent'
                });
                data = dv.rows;
                funnelchart.clear();
                funnelchart.source(data, {
                    percent: {
                        nice: false
                    }
                });
                funnelchart.axis(false);
                funnelchart.legend(false);

                funnelchart.tooltip({
                    showTitle: false,
                    itemTpl: '<li data-index={index} style="margin-bottom:4px;">' +'<span style="background-color:{color}; border-radius: 50%;" class="g2-tooltip-marker"></span>' + '{name}<br/>' + '<span style="padding-left: 16px">{key}：{count}</span><br/>' + '</li>'
                });
                funnelchart.coord('rect').transpose().scale(1, -1);
                funnelchart.intervalSymmetric().position('action*percent').shape('funnel').color('action', that.colors).label(
                    'action*count', function(action, count) {
                        return `${action}: ${count} (${count / that.estimatedAmount}%)`;
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
                    cursor: 'pointer'
                });
                
                funnelchart.render();
                funnelchart.forceFit();
                // funnelchart.on('interval:click', ev => {
                //     const data = ev.data;
                //     if (data) {
                //         that.followUpState = data._origin.action;
                //         that.followUpId = data._origin.id;
                //         that.jumpToInquiry();
                //     }
                // });
                // funnelchart.on('label:click', e => {
                //     console.log(e);
                //     if (e && e.data) {
                //         const data = e.data;
                //         that.followUpState = data.action;
                //         that.followUpId = data.id;
                //         that.jumpToInquiry();
                //     }
                // });
            },
            //获取后台数据
            getData(){
                const orgId = this.orgId;
                const userId = this.userId;
                const data = {
                    admin :this.activeTab === 'personal'? null: 1,
                    orgId,
                    userId,
                }
                 util.ajaxJson({
                    url: '/crm/funnelview/getFunnelView',
                    method: 'post',
                    data: data
                }).then(res => {
                    if (res.data.code === '1') {
                        const dataList = res.data.data;
                        const dataChange = [];
                        for (let i = 0; i < dataList.length; i++) {
                            let sum = 0;
                            for (let j = i; j < dataList.length; j++) {
                                sum += dataList[j].count;
                            }
                            dataChange.push({
                                action: `${i+1}. ${dataList[i].inquiryState}`,
                                pv: sum,//dataList[i].count,
                                count: dataList[i].count,
                                id: dataList[i].inquiryStateId
                            });
                        }
                        this.initChart(dataChange);
                        
                    } else {
                        this.initChart([]);
                    }
                });  
            }
        },
        created() {
        },
        mounted() {
            this.funnelchart = new G2.Chart({
                container: 'estimatedAmount',
                forceFit: true,
                height: 300,
                padding: [20, 100, 20, 20]
            });
            this.getData();
        },
        beforeDestroy(){
            if (this.funnelchart) {
                this.funnelchart.destroy();
                this.funnelchart=null;
            }
        },
        watch: {
           
        }
    };
</script>

<style scoped lang="less">
    @import "./cardtables.less";
</style>
