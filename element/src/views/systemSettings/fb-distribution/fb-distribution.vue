<template>
    <div class="fb-distribution">
        <!-- 标题 -->
        <h3 class="fb-distribution-title">{{ $t('menu.fb_distribution') }}</h3>

        <!-- 系统自动分配 -->
        <div class="system-automatically-assigned">
            <h4 class="service-rule-title">{{$t('distribution.title1')}}</h4>
            <departmentUserSelect
                :checkdDepartments.sync="serviceList"
                multiple="true"
                :collapseTags="false"
                width="600"
                :treeData="treeData"
                @saveServiceList="saveServiceList"
                @removeService="removeService"></departmentUserSelect>
        </div>
        <h4 class="service-rule-title">{{$t('fbDistribution.distributionRules')}}</h4>
        <div class="system-automatically-assigned">
            <!-- 规则明细 -->
            <Row>
                <!-- 分配规则 -->
                <Col :span="19"
                     class="system-automatically-assigned-right">
                    <h4 class="service-rule-title">
                        {{$t('fbDistribution.RepeatCustomersFirst')}}&nbsp;&nbsp;
                        <Tooltip :content="$t('fbDistribution.repeatCustomTip')">
                            <Icon custom="custom custom-tip" size="14"></Icon>
                        </Tooltip>
                    </h4>
                    <!-- 按对话数补齐分配 -->
                    <div class="allocate-by-number">
                        <Radio v-model="ruleOn"
                               :label="true">{{ $t('fbDistribution.allocateByNumber') }}</Radio>

                        <p class="rule-title">{{ $t('fbDistribution.distributionRules') }}</p>
                        <div class="rule-txt">
                            <p >
                                {{ $t('fbDistribution.allocationRule1') }}
                                <Tooltip :content="$t('fbDistribution.allocateByNumberTip')">
                                    <Icon custom="custom custom-tip"
                                          size="14"></Icon>
                                </Tooltip>
                            </p>
                            <p>{{ $t('fbDistribution.allocationRule2') }}</p>
                        </div>
                    </div>

                    <!-- 自定义统计周期 -->
                    <div class="statistical-cycle">
                        <Radio :value="true"
                               :label="true"
                               class="set-defaul-statistical-period-rule">
                            <span class="_lineHeight32">{{ $t('fbDistribution.customStatisticalPeriodToday') }}</span>
                        </Radio>

                        <p class="rule-title">{{ $t('fbDistribution.statisticalPeriod') }}</p>
                        <div class="rule-txt">
                            <p class="_lineHeight32"
                               style="margin-bottom:5px;width:100%"
                               :class="lang === 'zh-CN'?'':'line-breaks'">{{ $t('fbDistribution.defaultStatisticalPeriodRule') }}</p>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import { fbCommon } from '@/api/facebook/index';
    import departmentUserSelect from '@/views/main-components/departmentUserSelect.vue';
    const { getFbServiceList } = fbCommon;

    export default {
        name: 'fb-distribution',
        components: {
            departmentUserSelect
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                fullName: 'fullName',
                lang: state => state.app.lang
            })
        },
        data() {
            return {
                serviceList: [],
                ruleOn: true,
                treeData: []
            };
        },
        methods: {
            // 获取新部门数据
            getDepartmentUser() {
                this.$commonApi.getDepartmentUserTree({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    relationType: 1 // 只查直属部门
                }).then(res => {
                    if (res.code === 10000) {
                        this.treeData = this.$dym.extend(res.data, true);
                        console.log(this.treeData);
                    }
                });
            },
            // 保存客服列表
            saveServiceList(list) {
                this.serviceList = JSON.parse(JSON.stringify(list));
                this.serviceList.forEach(item => {
                    item.userName = item.serviceName;
                });
                util.ajaxJson({
                    url: '/social/facebook/user/saveUserList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userList: this.serviceList
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.serviceList = response.data.data.map(item => {
                            item.value = item.userId;
                            item.label = item.userName;
                            return item;
                        });
                        this.$Message.success(this.$t('saveSuccess'));
                    } else {
                        this.$Message.error(response.data.messageShow);
                        this.getServiceList();
                    }
                });
            },
            // 删除单个客服
            removeService(data) {
                util.ajaxJson({
                    url: '/social/facebook/user/saveUser',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: data.userId,
                        userName: data.userName,
                        useStatus: 2
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.serviceList = this.serviceList.filter(item => item.userId !== data.userId);
                        this.$Message.success(this.$t('editSuccess'));
                    } else {
                        this.$Message.error(response.data.messageShow);
                        this.getServiceList();
                    }
                });
            },
            /*  获取数据 */
            // 获取客服列表
            getServiceList() {
                getFbServiceList({
                    orgId: this.enterpriseId
                }).then(res => {
                    if (res.code === '1') {
                        this.serviceList = res.data.map(item => {
                            item.value = item.userId;
                            item.label = item.userName;
                            return item;
                        });
                    } else {
                        this.$Message.error(this.$t('fbDistribution.error_getFbServiceList'));
                    }
                });
            }
        },
        created() {
            this.getDepartmentUser();
            this.getServiceList();
        },
        watch: {
        }
    };
</script>

<style lang="less" scoped>
    .fb-distribution {
        color: #303133;
        padding: 20px 24px;
        &-title {
            font-size: 16px;
            margin-bottom: 20px;
        }
        .service-rule-title {
            font-size: 14px;
            margin-bottom: 12px;
        }
        .system-automatically-assigned {
            margin: 20px 0;

            &-left {
                display: inline-block;
            }

            &-right {
                display: inline-block;
                // margin-left: 80px;
                vertical-align: top;
            }

            &-title {
                font-size: 14px;
                color: rgba(0, 0, 0, 0.80);
                font-weight: 700;
                margin-bottom: 15px;
            }

            /deep/ .el-radio__label {
                font-size: 12px;
            }
        }

        .allocate-by-number {
            margin-top: 15px;
        }

        .rule-title {
            font-size: 12px;
            color: #A9B9C9;
            margin-left: 24px;
        }

        .rule-txt {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.8);
            margin-left: 24px;
            margin-bottom: 24px;
        }

        .service-list {
            width: 140px;
            height: 304px;
            overflow: auto;
            border: 1px solid #EAEAEA;
            border-radius: 4px;

            li {
                font-size: 12px;
                padding: 5px 11px;
            }
        }

        .line-breaks {
            word-break: keep-all
        }
    }
</style>
