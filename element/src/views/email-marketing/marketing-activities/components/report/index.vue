<template>
    <div class="marketing-report">
        <div class="report-header">
            <h1 class="subject">
                <Tooltip placement="top" transfer :content="$t('back')">
                    <Icon custom="custom custom-back" style="color:rgba(0,0,0,.6);margin-right: 20px;cursor: pointer;" @click="pageReturn"/>
                </Tooltip>
                <!-- 营销活动名称 -->
                {{fromData.actName}}
            </h1>
        </div>
        <!-- 报告基本信息 -->
        <div class="report-info">
            <p class="report-info-title">{{$t('mailMarketing.report.basicInfo')}}</p>
            <!-- 主题 -->
            <p class="report-info-item">{{$t('mailMarketing.report.subject')}}：{{fromData.mailSubject}}</p>
            <!-- 发件人 -->
            <p class="report-info-item">{{$t('mailMarketing.report.sender')}}：{{fromData.mailFrom}}</p>
            <!-- 收件人 -->
            <p class="report-info-item">{{$t('mailMarketing.report.recipients')}}：{{fromData.mailTo | mailToFilter}}</p>
            <!-- 发件时间 -->
            <p class="report-info-item">{{$t('mailMarketing.report.date')}}：{{fromData.mailSendDate}}</p>
            <p class="report-info-detail" @click.stop="handleRreview">{{$t('mailMarketing.report.details')}}</p>
        </div>

        <!-- 统计 -->
        <div class="report-statistics">
            <p class="report-statistics-title">{{$t('mailMarketing.report.statistics')}}</p>
            <div class="report-statistics-list">
                <div class="report-statistics-item">
                    <svg class="svg-icon" aria-hidden="true" style="width: 60px; height: 60px;margin-right:30px;">
                        <use xlink:href="#custom-icon_send"></use>
                    </svg>
                    <div class="statistics-item-text">
                        <p class="statistics-item-text">{{$t('mailMarketing.report.send')}}</p>
                        <p>
                            <span class="statistics-item-num">{{fromData.sendCount}}</span>
                        </p>
                    </div>
                </div>
                <span class="report-statistics-border"></span>
                <div class="report-statistics-item">
                    <svg class="svg-icon" aria-hidden="true" style="width: 60px; height: 60px;margin-right:30px;">
                        <use xlink:href="#custom-icon_service"></use>
                    </svg>
                    <div class="statistics-item-text">
                        <p class="statistics-item-text">{{$t('mailMarketing.report.delivered')}}</p>
                        <p>
                            <span class="statistics-item-num">{{fromData.sendedCount}}</span>
                            <span class="statistics-item-percentage">{{fromData.sendedRate}}%</span>
                        </p>
                    </div>
                </div>
                <span class="report-statistics-border"></span>
                <div class="report-statistics-item">
                    <svg class="svg-icon" aria-hidden="true" style="width: 60px; height: 60px;margin-right:30px;">
                        <use xlink:href="#custom-icon_open"></use>
                    </svg>
                    <div>
                        <p class="statistics-item-text">{{$t('mailMarketing.report.open')}}</p>
                        <p>
                            <span class="statistics-item-num">{{fromData.openedCount}}</span>
                            <span class="statistics-item-percentage">{{fromData.openedRate}}%</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <!-- 送达、未送达列表 -->
        <div class="report-table">
            <Tabs class="report-table-tab" v-model="currentTableType" @tab-click="changeTableTab">
                <TabPane :label="$t('mailMarketing.report.delivered')"  name="service"></TabPane>
                <TabPane :label="$t('mailMarketing.report.notDelivered')"  name="notDelivered"></TabPane>
            </Tabs>

            <!-- 送达、未送达的列表组件（根据切换tab的状态获取不同的数据） -->
            <service :currentTableType="currentTableType" :id="id"></service>
        </div>

        <!-- 点击查看预览营销活动详情 -->
        <mailDetail v-if="previewVisible" :visible.sync="previewVisible" :actMailId="id"></mailDetail>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import service from './service.vue';
    import mailDetail from './../mailDetail.vue';
    export default {
        name: 'marketingReport',
        props: ['id'],
        data() {
            return {
                currentTableType: 'service',
                previewVisible: false, // 控制查看的弹窗状态
                fromData: {}
            };
        },
        components: { service, mailDetail },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId'
            })
        },
        filters: {
            mailToFilter(val) {
                if (val && val.length) {
                    const arr = JSON.parse(val);
                    const result = [];
                    arr.forEach((item) => {
                        const str = `${item.addrName}(${JSON.parse(item.contacts).length})`;
                        result.push(str);
                    });
                    return result.join('; ');
                } else {
                    return '';
                }
            }
        },
        created() {
            // 初始化基本信息和统计数据
            this.getInitAndStatistics();
        },
        methods: {
            // 切换送达/未送达
            changeTableTab(tab) {
                console.log('切换送达、未送达', tab.name);
            },
            pageReturn() {
                this.$emit('handleView', 'tableList');
            },
            // 点击查看营销活动
            handleRreview() {
                this.previewVisible = true;
            },
            /** 初始化报告基本信息和统计数据 */
            getInitAndStatistics() {
                const data = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    actId: this.id
                };
                util.ajaxEmailMarketing({
                    url: '/business/marketing/report/getMailBasicInfo',
                    method: 'post',
                    data
                }).then(response => {
                    if (response.data.code === 1) {
                        const result = response.data.data;
                        for (const key in result) {
                            this.$set(this.fromData, key, result[key]);
                        }
                    } else {
                        console.log('请求失败');
                    }
                }).catch(() => {
                    console.log('请求异常')
                });
            }
        }
    };
</script>
<style lang="less">
    @import url('index.less');
</style>
