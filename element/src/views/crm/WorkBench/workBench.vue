<template>
    <div style="background:#fff;padding:16px">
        <!-- 顶部数字 -->
        <div class="top-card"
             v-loading="top_loading">
            <Row style="padding-bottom: 30px;">
                <Col :span="4">
                    <div style="width: 100%;margin: 30px auto 0 auto;">
                        <Button :type="workBench_type === 'myInquiry' ? 'primary' : 'default'"
                                class="piwik_crm_workBench_personalView workbench-personalview"
                                @click="handleIdentityChange('myInquiry')" style="margin: 0 auto;display: block;">{{
                            $t('crm.WorkBench.personalView') }}
                        </Button>
                        <br>
                        <Button :type="workBench_type === 'allInquiry' ? 'primary' : 'default'"
                                class="piwik_crm_workBench_managerView workbench-managementview"
                                @click="handleIdentityChange('allInquiry')" style="margin: 0 auto;display: block;">{{
                            $t('crm.WorkBench.managerView') }}
                        </Button>
                    </div>

                    <!--<Select v-model="workBench_type">-->
                    <!--<Option value="myInquiry">我的询盘</Option>-->
                    <!--<Option value="allInquiry">全部询盘</Option>-->
                    <!--</Select>-->
                </Col>
                <Col :span="5">
                    <Card class="top-card-item piwik_crm_workBench_today workbench-viewtoday'snewenquiry" shadow="never"
                          @click.native="jumpToMyInquiry('today')">
                        <p class="top-card-title">{{ $t('crm.WorkBench.todayInquiry') }}</p>
                        <br>
                        <p class="top-card-number">{{ inquiryNumber.todayTotal }}</p>
                    </Card>
                </Col>
                <Col :span="5">
                    <Card class="top-card-item piwik_crm_workBench_week workbench-viewthisweek'snewenquiry"
                          shadow="never" @click.native="jumpToMyInquiry('week')">
                        <p class="top-card-title">{{ $t('crm.WorkBench.weekInquiry') }}</p>
                        <br>
                        <p class="top-card-number">{{ inquiryNumber.weekTotal }}</p>
                    </Card>
                </Col>
                <Col :span="5">
                    <Card class="top-card-item piwik_crm_workBench_month workbench-viewthismonth'snewenquiry"
                          shadow="never" @click.native="jumpToMyInquiry('month')">
                        <p class="top-card-title">{{ $t('crm.WorkBench.monthInquiry') }}</p>
                        <br>
                        <p class="top-card-number">{{ inquiryNumber.monthTotal }}</p>
                    </Card>
                </Col>
                <Col :span="5">
                    <Card class="top-card-item piwik_crm_workBench_recent7Days workbench-view7dayswithoutfollowupinquiry"
                          shadow="never"
                          @click.native="jumpToMyInquiry('unFollow')">
                        <p class="top-card-title">{{ $t('crm.WorkBench.recent7DaysInquiry') }}</p>
                        <br>
                        <p class="top-card-number">{{ inquiryNumber.noFollowTotal }}</p>
                    </Card>
                </Col>
                <!--<Col :span="4">-->
                <!--<div style="width: 100%;margin: 30px auto 0 auto;">-->
                <!--<Button style="margin: 0 auto;display: block;background-color: #FA8241;color: #FFF;">世界时间</Button>-->
                <!--<br>-->
                <!--<Button style="margin: 0 auto;display: block;background-color: #51b7a3;color: #FFF">外汇牌价</Button>-->
                <!--</div>-->
                <!--</Col>-->
            </Row>
        </div>
        <!-- 底部组件 -->
        <div class="set-menu" style="margin-bottom: 25px">
            <ul>
                <li v-for="(item, index) in tabArr" :key="item.value"
                    :class="{'item-show': item.select, 'piwik_crm_workBench_task': item.value === 'crmTasks', 'piwik_crm_workBench_funnel': item.value === 'funnelView', 'piwik_crm_workBench_behavior': item.value === 'behaviorView', 'workbench-viewfunnelview': item.value === 'funnelView', 'workbench-viewbehaviorview': item.value === 'behaviorView'}"
                    @click="selectView(item.value,index)">
                    {{item.name}}
                    <HelpTip v-if="item.value === 'behaviorView'" :title="$t('helpTip.behaviorView')"></HelpTip>
                    <span></span>
                </li>
            </ul>
        </div>
        <div>
            <keep-alive>
                <component
                        :is="view"
                        :workBenchType="workBench_type">
                </component>
            </keep-alive>
        </div>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import crmTasks from './crm-tasks/crm-tasks.vue';
    import funnelView from './funnel-view/funnel-view.vue';
    import behaviorView from './behavior-view/behavior-view.vue';
    import { WorkBench } from '@/api/crm/index';
    const { getWorkbenchStat } = WorkBench;
    export default {
        name: 'workBench',
        components: {
            crmTasks,
            funnelView,
            behaviorView
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                button_list: state => state.app.button_list
            }), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu'
            ])
        },
        data() {
            return {
                /* 顶部询盘概况 */
                top_loading: true,
                workBench_type: 'myInquiry',
                inquiryNumber: {},
                /* 任务 */
                modleType: '',
                modleShow: false,
                taskDetail: '',
                letCalendarRefresh: false,
                fullcalendarView: 'month',
                view: 'crmTasks',
                tabArr: [
                    {
                        select: true,
                        name: this.$t('crm.WorkBench.task'),
                        value: 'crmTasks'
                    },
                    {
                        select: false,
                        name: this.$t('crm.WorkBench.funnelView'),
                        value: 'funnelView'
                    },
                    {
                        select: false,
                        name: this.$t('crm.WorkBench.behaviorView'),
                        value: 'behaviorView'
                    }
                ]
            };
        },
        methods: {
            /** 视图切换控制 */
            handleIdentityChange(type) {
                this.getInquiryNumber(type);
                this.fullcalendarView = (type === 'myInquiry') ? 'month' : 'listWeek';
            },
            /* 获取顶部详情数字 */
            getInquiryNumber(type) {
                type === 'allInquiry' ? this.workBench_type = 'allInquiry' : this.workBench_type = 'myInquiry';
                const temp = window.setTimeout(() => {
                    this.top_loading = true;
                }, 1000); // 接口返回的很快, 为了不影响视觉观感, 设置这样一个延时, 若在指定毫秒内完成请求, 则在请求中 clearTimeout
                getWorkbenchStat({
                    orgId: this.enterpriseId,
                    admin: this.workBench_type === 'allInquiry' ? 1 : null
                }).then(response => {
                    if (response.code === '1') {
                        this.inquiryNumber = response.data;
                    } else {
                        this.$Message.error(this.$t('crm.WorkBench.error_getInquiryNumber'));
                        this.inquiryNumber = {
                            todayTotal: 0,
                            weekTotal: 0,
                            monthTotal: 0,
                            noFollowTotal: 0
                        };
                    }
                    clearTimeout(temp);
                    this.top_loading = false;
                }, error => {
                    this.top_loading = false;
                }).catch(error => {
                    this.top_loading = false;
                });
            },
            /* 顶部 Card 点击跳转 */
            // jumpToMyInquiry(type) {
            //     if (type) {
            //         // console.log(this.$parent);
            //         this.$emit('jumpToMyInquiry', type);
            //     }
            // },
            jumpToMyInquiry(type) {
                if (this.isContainsMenu('myInquiry')) {
                    // 简单询盘处理如果有类似问题联系杨洋进行工厂处理
                    const randomId = this.$dym.Rnum(8);
                    // target 模块所要更新的key 参照 myInquiry checkRouteParams
                    localStorage.setItem(`matchTargetChangeKeys${randomId}`, JSON.stringify([
                        'workBench_type',
                        'workBench_number_type'
                    ]));
                    localStorage.setItem(`leadsCloud-workBench_number_type${randomId}`, type);
                    localStorage.setItem(`leadsCloud-workBench_type${randomId}`, this.workBench_type);
                    this.$stm.openNewWindow(this.$router.resolve({
                        name: 'myInquiry',
                        query: {
                            i: randomId,
                            k: `matchTargetChangeKeys${randomId}` // 定义要更新的取的listKey名
                        }
                    }).href);
                } else {
                    this.$Message.error(this.$t('crm.WorkBench.error_haveNoPermissionMyInquiry'));
                }
            },
            dateFormat() {
                Date.prototype.format = function(fmt) {
                    const o = {
                        'M+': this.getMonth() + 1, // 月份
                        'd+': this.getDate(), // 日
                        'h+': this.getHours(), // 小时
                        'm+': this.getMinutes(), // 分
                        's+': this.getSeconds(), // 秒
                        'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
                        S: this.getMilliseconds() // 毫秒
                    };
                    if (/(y+)/.test(fmt)) {
                        fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()}`).substr(4 - RegExp.$1.length));
                    }
                    for (const k in o) {
                        if (new RegExp(`(${k})`).test(fmt)) {
                            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1)
                                ? (o[k])
                                : ((`00${o[k]}`).substr((`${o[k]}`).length)));
                        }
                    }
                    return fmt;
                };
            },
            selectView(value, index) {
                this.view = value;
                this.tabArr = this.tabArr.map((item, key) => {
                    if (key === index) {
                        return {
                            name: item.name,
                            select: true,
                            value: item.value
                        };
                    } else {
                        return {
                            name: item.name,
                            select: false,
                            value: item.value
                        };
                    }
                });
            }

        },
        created() {
            this.getInquiryNumber();
            this.dateFormat();
        }
    };
</script>

<style lang="less">
    @import "../../../styles/common.less";
    @import "../Detail/Components/less/modal.less";
</style>

<style scoped lang="less">
    .top-card {
        background-color: #fff;
        -webkit-box-shadow: 0 0 4px rgba(0, 0, 0, .13);
        -moz-box-shadow: 0 0 4px rgba(0, 0, 0, .13);
        box-shadow: 0 0 4px rgba(0, 0, 0, .13);

        & /deep/ .el-col:nth-child(odd) .top-card-number {
            color: #FA8241;
        }

        & /deep/ .el-col:nth-child(even) .top-card-number {
            color: #51b7a3;
        }
    }

    .top-card-item {
        text-align: center;
        padding-top: 20px;
        cursor: pointer;
        border: none;
    }

    .top-card-number {
        font-size: 50px;
    }

    .set-menu {
        margin-top: 15px;
        border-bottom: 2px solid #ededed;
    }

    .set-menu > ul li {
        text-align: center;
        width: 33%;
        height: 52px;
        line-height: 52px;
        display: inline-block;
        cursor: pointer;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
    }

    .item-show {
        color: #fc8b2f;
    }

    .item-show span {
        width: 47px;
        height: 7px;
        border-radius: 3px;
        background-color: #fb8b2f;
        display: block;
        margin: auto;
        margin-top: -3px;
    }
</style>
