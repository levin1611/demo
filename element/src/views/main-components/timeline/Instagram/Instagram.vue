<template>
    <div v-loading="loading"
         :element-loading-text="$t('crm.Html.loading')"
          class="time-line-scroll"
         id="timelineBox">
        <!-- 无数据提醒 -->
        <div v-if="dataList.length === 0"
             style="margin-top: 60px;text-align: center;color: #999; ">{{ $t('timeLine.noData') }}
        </div>
        <!-- 时间轴 -->
        <Timeline v-else
                  class="big-icon-timeline"
                  v-infinite-scroll="loadMore"
                  :infinite-scroll-disabled="noMore || currentTab !== 'Instagram'"
                  :infinite-scroll-distance="5"
                  :infinite-scroll-immediate="false">
            <!-- 起始结点 -->
            <!-- <TimelineItem>
                <div slot="dot"
                     class="timeline-dot">
                    <Icon type="record"
                          size="12"
                          color="#e9eaec"
                          style="vertical-align: top;"></Icon>
                </div>
                <div>
                    <br>
                </div>
            </TimelineItem> -->
            <!-- 时间轴条目 -->
            <TimelineItem v-for="item in dataList"
                          :key="item.id">
                <!-- 时间轴图标 -->
                <div slot="dot"
                     class="timeline-dot">
                    <img src="@/styles/customFont/svg/Instagram.svg"></img>
                </div>

                <!-- 时间轴内容 -->
                <InstagramItem :item="item"
                               :type="type"
                               v-on="$listeners"></InstagramItem>
            </TimelineItem>

            <!-- 已全部完毕 -->
            <p v-if="noMore"
               class="tileline-no-more-tip">{{ $t('noticeWindow.noMore') }}</p>
        </Timeline>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import util from '@/libs/util';
    import InstagramItem from '@/views/main-components/timeline/Instagram/InstagramItem';

    export default {
        name: 'Instagram',
        props: ['companyId', 'date', 'type', 'currentTab'],
        data() {
            return {
                loading: true, // 页面加载中
                dataList: [], // 时间轴数据
                pageNo: 1, // 时间轴分页
                noMore: false
            };
        },
        components: {
            InstagramItem
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId'
            })
        },
        methods: {
            loadMore() {
                // 正在加载中就先不请求接口了
                if (!this.loading) {
                    this.pageNo += 1;
                    this.getList();
                }
            },
            /* 获取时间轴数据 */
            getList() {
                this.loading = true;

                const jsonData = {
                    orgId: this.enterpriseId,
                    startDate: Array.isArray(this.date) ? this.date[0] : undefined,
                    endDate: Array.isArray(this.date) ? this.date[1] : undefined,
                    eventCategory: 7,
                    pageNo: this.pageNo,
                    pageSize: 20
                };

                switch (this.type) {
                    case 'inquiry':
                        jsonData.inquiryId = this.companyId;
                        break;
                    case 'customer':
                    case 'highseasCustomer':
                        jsonData.companyId = this.companyId;
                        break;
                    case 'clue':
                        jsonData.clueId = this.companyId;
                        break;
                    case 'contact':
                        jsonData.contactsId = this.companyId;
                        break;
                }

                util.ajax({
                    url: '/crm/eventAction/getEventActionListDataInquiry',
                    method: 'post',
                    data: jsonData
                }).then(response => {
                    if (this.pageNo === 1) {
                        this.dataList = [];
                    }
                    if (response.data.code === '1') {
                        if (response.data.data.length < 20) {
                            this.noMore = true;
                        }
                        const List = response.data.data.map(item => {
                            // ins 轴数据中的 pid 和 gid 为数字, 解析时往往因为过长而被截取自动补零, 导致 id 不准, 请求不到数据, 现在在解析前先把 json 字符串中的数字 pid gid 替换为字符串
                            item.eventCustomVar = item.eventCustomVar.replace(/"pid":(\d+),/, '"pid":"$1",');
                            item.eventCustomVar = item.eventCustomVar.replace(/"gid":(\d+),/, '"gid":"$1",');
                            item.eventCustomVar = JSON.parse(item.eventCustomVar);
                            return item;
                        });
                        this.dataList = this.dataList.concat(List);
                    }
                    this.loading = false;
                });
            }
        },
        mounted() {
            this.getList();
        },
        watch: {
            currentTab: {
                handler(value) {
                    if (value == 'Instagram') {
                        this.pageNo = 1;
                        this.getList();
                    }
                },
                immediate: true
            },
            /* 时间轴中所选时间变化时，需要重新请求时间轴数据 */
            date() {
                if (this.currentTab === 'Instagram') {
                    this.pageNo = 1;
                    this.noMore = false;
                    this.getList();
                }
            }
        }
    };
</script>
