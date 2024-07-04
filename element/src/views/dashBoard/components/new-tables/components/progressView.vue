<template>
    <div class="progress-box">
        <div class="progress-title">
            <p></p>
            <div class="progress-legend">
                <span class="legend completionLegend"></span>
                {{$t('dashBoardV2.progress.legendCompletionValue')}}
                <span class="legend"></span>
                {{$t('dashBoardV2.progress.legendTargetValue')}}
            </div>
        </div>
        <div class="progress-list" v-loading="loading" :style="{'minHeight': tableHeight}">
            <div class="progress" v-for="item in progressList" :key="item.userId">
                <p class="name">{{filterParameters.levelType === 'department' ? item.firstDepartmentName : item.userName}}</p>
                    <Tooltip placement="top">
                        <div slot="content">
                            {{$t('dashBoardV2.progress.targetValue')}}{{item.targetValue}}
                            <br/>
                            {{$t('dashBoardV2.progress.completionValue')}}{{item.completed}}
                            <br/>
                            {{$t('dashBoardV2.progress.completionRate')}}{{item.undone}}
                        </div>
                        <div class="progress-bar">
                            <span>{{`${item.completed}, ${item.completedRate}`}}</span>
                            <Progress
                                :show-text="false"
                                :stroke-width="24"
                                :percentage="item.completedRate.substring(0,item.completedRate.length-1)"></Progress>
                        </div>
                    </Tooltip>
                <p class="progress-targetValue">
                    <Tooltip :content="item.targetValue" placement="top">
                        <span>{{item.targetValue}}</span>
                    </Tooltip>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
    import { getPerformanceTargetsNew } from '@/api/dashBoard/dashBoardV2';
    import { mapState, mapGetters } from 'vuex';
    export default {
        name: 'progressView',
        components: {
        },
        props: [
            'from',
            'filterParameters',
            'currentCurrency',
            'kind'
        ],
        data() {
            return {
                loading: false,
                // progress 相关
                progressList: [],
                monitorCurrency: ['completion']
            };
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                orgId: state => state.enterpriseId,
                userName: state => state.userName,
                window_width: state => state.window_width
            }),
            ...mapGetters(['isContainsMenu']),
            tableHeight() {
                if (this.from) {
                    return '398px';
                } else {
                    if (this.kind === 'completion') {
                        return '200px';
                    }
                    return '250px';
                }
            }
        },
        methods: {
            getData() {
                this.progressList = [];
                this.loading = true;
                getPerformanceTargetsNew({
                    currency: this.currentCurrency,
                    dimensionType: this.filterParameters.levelType === 'department' ? 1 : 2,
                    startDate: this.$dym.timeFormat(this.filterParameters.dateRange[0]),
                    endDate: this.$dym.timeFormat(this.filterParameters.dateRange[1]),
                    orgId: this.orgId,
                    userId: this.userId,
                    year: new Date(this.filterParameters.dateRange[0]).getFullYear(),
                    targetType: this.filterParameters.targetType,
                    userIdList: this.filterParameters.userIdList.length ? JSON.stringify(this.filterParameters.userIdList) : '',
                    departmentId: this.filterParameters.departmentId
                }).then(res => {
                    if (res.code === '1') {
                        this.progressList = res.data.list;
                    } else {
                        this.$message.error(res.message);
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                });
            }
        },
        created() {
        },
        mounted() {
        },
        watch: {
            filterParameters: {
                handler(val) {
                    this.getData();
                },
                immediate: true,
                deep: true
            },
            // 有的组件可能不需要币种 单独处理
            currentCurrency: {
                handler(val) {
                    if (this.monitorCurrency.includes(this.kind)) {
                        this.getData();
                    }
                }
            }
        }
    };
</script>
<style lang="less">
    .progress-box {
        .progress-title {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 12px;
            line-height: 22px;
            color: #333;
            span {
                margin-right: 40px;
            }
            .progress-legend {
                text-align: right;
                .legend {
                    margin-left: 26px;
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    background: #EAEAEA;
                    border-radius: 4px;
                    margin-right: 8px;
                    vertical-align: middle;
                }
                .completionLegend {
                    background: #FF752A;
                }
            }
        }
        .progress-list {
            height: 200px;
            overflow-y: auto;
            .progress {
                display: flex;
                align-items: center;
                margin-bottom: 18px;
                font-size: 14px;
                line-height: 18px;
                color: #333;
                .name {
                    width: 120px;
                    text-align: left;
                    overflow: hidden;
                    white-space: nowrap;
                    word-break: normal;
                    text-overflow: ellipsis;
                }
                .progress-targetValue {
                    width: 80px;
                    padding: 0 10px;
                    text-align: right;
                    overflow: hidden;
                    white-space: nowrap;
                    word-break: normal;
                    text-overflow: ellipsis;
                }
                .progress-bar {
                    width: calc(100% - 200px);
                    position: relative;
                    span {
                        position: absolute;
                        line-height: 24px;
                        color: #fff;
                        top: 0;
                        left: 16px;
                        z-index: 10;
                        text-shadow: #FF752A 1px 0 0,#FF752A 0 1px 0,#FF752A -1px 0 0, #FF752A 0 -1px 0;
                    }
                    .el-progress-bar__outer {
                        background-color: #EAEAEA;
                    }
                    .el-progress-bar__inner {
                        background-color: #FF752A;
                    }
                }
            }
        }
    }
</style>
