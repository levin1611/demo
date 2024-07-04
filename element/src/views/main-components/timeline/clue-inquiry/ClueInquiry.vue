<template>
    <div v-loading="isLoading"
         :element-loading-text="$t('crm.Html.loading')"
          class="time-line-scroll"
         id="timelineBox">

        <!-- 无数据提醒 -->
        <div v-if="dataList.length === 0"
             style="margin-top: 60px;text-align: center;color: #999; ">{{ $t('timeLine.noData') }}</div>

        <!-- 时间轴 -->
        <Timeline v-else
                  class="big-icon-timeline"
                  v-infinite-scroll="loadMore"
                  :infinite-scroll-disabled="noMore || currentTab !== 'ClueInquiry'"
                  :infinite-scroll-distance="5"
                  :infinite-scroll-immediate="false">
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
            <TimelineItem v-for="item in dataList"
                          :key="item.id">
                <!-- 时间轴图标 -->
                <div slot="dot"
                     class="timeline-dot">
                    <img src="@/styles/customFont/svg/source.svg"></img>
                </div>

                <!-- 时间轴内容 -->
                <SourceItem :item="item"
                            :type="type"
                            :originalType="originalType"
                            v-on="$listeners"></SourceItem>
            </TimelineItem>
            <p v-if="noMore" class="tileline-no-more-tip">{{$t('noticeWindow.noMore')}}</p>
        </Timeline>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import SourceItem from '@/views/main-components/timeline/clue-inquiry/sourceItem';

    export default {
        name: 'ClueInquiry',
        components: {
            SourceItem
        },
        props: ['companyId', 'date', 'type', 'currentTab', 'originalType'],
        data() {
            return {
                dataList: [],
                isLoading: true,
                pageNo: 1, // 时间轴分页
                noMore: false
            };
        },
        watch: {
            currentTab: {
                handler(value) {
                    if (value == 'ClueInquiry') {
                        this.pageNo = 1;
                        this.getList();
                    }
                },
                immediate: true
            },
            date() {
                if (this.currentTab === 'ClueInquiry') {
                    this.pageNo = 1;
                    this.noMore = false;
                    this.getList();
                }
            }
        },
        computed: {
            ...mapState([
                'enterpriseId'
            ])
        },
        methods: {
            loadMore() {
                // 正在加载中就先不请求接口了
                if (!this.isLoading) {
                    this.pageNo += 1;
                    this.getList();
                }
            },
            getList() {
                this.isLoading = true;

                const jsonData = {
                    orgId: this.enterpriseId,
                    startDate: Array.isArray(this.date) ? this.date[0] : undefined,
                    endDate: Array.isArray(this.date) ? this.date[1] : undefined,
                    eventCategory: 5,
                    pageNo: this.pageNo,
                    pageSize: 20
                };

                switch (this.type) {
                    case 'clue':
                        jsonData.clueId = this.companyId;
                        break;
                    case 'inquiry':
                        jsonData.inquiryId = this.companyId;
                        break;
                    case 'customer':
                    case 'highseasCustomer':
                        jsonData.companyId = this.companyId;
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
                    // 初始时先置为空
                    if (this.pageNo === 1) {
                        this.dataList = [];
                    }
                    if (response.data.code === '1') {
                        if (response.data.data.length < 20) {
                            this.noMore = true;
                        }
                        const List = response.data.data.map(item => {
                            item.eventCustomVar = JSON.parse(item.eventCustomVar);
                            // 如果是录入询盘需要查一次线索编号
                            if (item.eventAction === '3') {
                                util.ajax({
                                    url: '/form-cust/form/getColumnValue',
                                    method: 'get',
                                    params: {
                                        id: item.eventCustomVar.clueId
                                    }
                                }).then(response => {
                                    if (response.data.code === '1') {
                                        this.$set(item.eventCustomVar, 'clueNumber', response.data.data.seqNumber);
                                    }
                                });
                            }
                            return item;
                        });
                        // 因为初次点击可能会触发两次，而上面的赋值是异步，所以有可能导致数据重复
                        if (this.pageNo === 1) {
                            this.dataList = [];
                        }
                        this.dataList = this.dataList.concat(List);
                    }
                    this.isLoading = false;
                });
            }
        }
    };
</script>
