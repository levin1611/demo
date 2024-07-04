<template>
    <div>
        <div v-loading="isLoading"
            :element-loading-text="$t('crm.Html.loading')"
            class="time-line-scroll">
            <div v-if="dataList.length === 0"
                style="margin-top: 60px;text-align: center;color: #999; ">{{ $t('timeLine.noData') }}</div>
            <Timeline v-else
                    class="big-icon-timeline"
                    v-infinite-scroll="loadMore"
                    :infinite-scroll-disabled="noMore || currentTab !== 'weChat'"
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
                        <img src="@/styles/customFont/svg/WhatsApp.svg"></img>
                    </div>

                    <weChatItem :item="item"
                                :type="type"
                                @showReplyModal="showReplyModal"
                                v-on="$listeners"></weChatItem>
                </TimelineItem>
                <p v-if="noMore" class="tileline-no-more-tip">{{$t('noticeWindow.noMore')}}</p>
            </Timeline>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import util from '@/libs/util';
    import weChatItem from '@/views/main-components/timeline/weChat/weChatItem';

    export default {
        name: 'WhatsApp',
        components: {
            weChatItem
        },
        props: ['companyId', 'date', 'type', 'currentTab', 'originalType'],
        data() {
            return {
                //快速回复弹窗字段
                visibleReplyModal: false,
                isLoading: false, // 页面加载中
                dataList: [], // WhatsApp时间轴数据
                pageNo: 1, // 时间轴分页
                noMore: false,
                talkObj: null
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                clue_short_info: 'clue_short_info'
            })
        },
        methods: {
            loadMore() {
                // 正在加载中就先不请求接口了
                if (!this.isLoading) {
                    this.pageNo += 1;
                    this.getList();
                }
            },
            /* 获取WhatsApp时间轴数据 */
            getList() {
                this.isLoading = true;

                const jsonData = {
                    orgId: this.enterpriseId,
                    startDate: Array.isArray(this.date) ? this.date[0] : undefined,
                    endDate: Array.isArray(this.date) ? this.date[1] : undefined,
                    eventCategory: 6,
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
                            item.eventCustomVar = JSON.parse(item.eventCustomVar);
                            /* 产品要求：线索详情页，WhatsApp记录的消息收发方显示询盘云用户名称和线索名称，所以此处针对线索做特殊处理 */
                            // if (['clue', 'highseasClue'].includes(this.originalType) || ['clue', 'highseasClue'].includes(this.type)) {
                            //     item.contactsName = this.clue_short_info.a1009 ? this.clue_short_info.a1009 : item.contactsName;
                            // }
                            return item;
                        });
                        this.dataList = this.dataList.concat(List);
                    }
                    this.isLoading = false;
                });
            },
            showReplyModal(item){
                console.log(item)
                this.talkObj = item;
                this.visibleReplyModal = true;
            }
        },
        mounted() {
            // this.getList();
        },
        watch: {
        }
    };
</script>

<style class="less" scoped>

</style>
