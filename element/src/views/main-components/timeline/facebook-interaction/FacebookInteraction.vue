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
                  :infinite-scroll-disabled="noMore || currentTab !== 'FacebookInteraction'"
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
                    <img src="@/styles/customFont/svg/Facebook.svg"></img>
                </div>

                <!-- 时间轴内容 -->
                <FacebookItem :item="item"
                              :type="type"
                              v-on="$listeners"></FacebookItem>
            </TimelineItem>
            <p v-if="noMore" class="tileline-no-more-tip">{{$t('noticeWindow.noMore')}}</p>
        </Timeline>

<!--        <Modal v-if="showMessengerFB"-->
<!--               :visible.sync="visible"-->
<!--               width="1025px"-->
<!--               @open="handleVisibleChange(true)"-->
<!--               @close="handleVisibleChange(false)"-->
<!--               style="height: 665px;"-->
<!--               class="fb-Modal">-->
<!--            &lt;!&ndash;<FbMessenger :conversationsInfo="conversations_info" @handleUnreadCount="handleUnreadCount"></FbMessenger>&ndash;&gt;-->
<!--            <div slot="footer"></div>-->
<!--        </Modal>-->
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import FacebookItem from '@/views/main-components/timeline/facebook-interaction/facebookItem';

    export default {
        name: 'FacebookInteraction',
        components: {
            FacebookItem
        },
        props: ['companyId', 'date', 'type', 'currentTab'],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                clearfbUnreadFlag: state => state.crm.clearfbUnreadFlag,
                clearfromSendButton: state => state.crm.clearfromSendButton
            })
        },
        data() {
            return {
                isLoading: true,
                dataList: [],
                conversations_info: [], // 需要传入给fb聊天弹窗的参数
                isOpenFbMessenger: false, // 控制FbMessenger弹窗的显示
                fbUnreadNum: null, // fbMessenger未读数,
                senderIds: [], // senderIds的集合
                showMessengerFB: false,
                visible: false,
                selectedItem: {},
                pageNo: 1, // 时间轴分页
                noMore: false
            };
        },
        mounted() {
            // this.reload();
        },
        watch: {
            currentTab: {
                handler(value) {
                    console.log(value, '@@@');
                    if (value === 'FacebookInteraction') {
                        this.pageNo = 1;
                        this.noMore = false;
                        this.getList();
                    }
                },
                immediate: true
            },
            date() {
                if (this.currentTab === 'FacebookInteraction') {
                    this.pageNo = 1;
                    this.noMore = false;
                    this.getList();
                }
            },
            dataList: {
                handler(val) {
                    console.log('sdsdsdsd', val);
                    const flag = val.some(item => {
                        console.log(item.count, 'LLLKKLKLKLK');
                        if ('count' in item) {
                            return item.count != 0;
                        }
                    });
                    this.$store.state.crm.fbUnreadStatus = flag;
                    console.log(this.$store.state.crm.fbUnreadStatus, 'YYYYYY');
                },
                immediate: true
            },
            clearfbUnreadFlag(val) {
                // if(val){
                //     this.markAllUnread();
                // }
            },
            clearfromSendButton(val) {
                if (val) {
                    console.log('run once');
                    // this.reload();
                    // this.getSenderId();
                    console.log('run third');
                    this.$store.state.crm.clearfromSendButton = false;
                }
            }
        },
        methods: {
            loadMore() {
                // 正在加载中就先不请求接口了
                if (!this.isLoading) {
                    this.pageNo += 1;
                    this.getList();
                }
            },
            // 处理未读数
            // handleUnreadCount(val) {
            //     util.ajax({
            //         url: '/crm/messenger/updateUnread',
            //         method: 'put',
            //         params: {
            //             orgId: this.enterpriseId,
            //             userId: this.userId,
            //             senderId: val
            //         }
            //     }).then(res => {
            //         if (res.data.code === '1') {
            //             // 更新状态成功后相应的未读数量应该为0
            //             this.$store.state.crm.fbUnreadStatus = false;
            //             this.dataList.forEach(item => {
            //                 if (item.eventCustomVar.conversationId == val) {
            //                     item.eventCustomVar.count = 0;
            //                 }
            //             });
            //         }
            //     });
            // },
            // 处理所有未读
            // markAllUnread() {
            //     console.log('执行了markAllUnread方法');
            //     util.ajax({
            //         url: '/crm/messenger/updateUnread',
            //         method: 'put',
            //         params: {
            //             orgId: this.enterpriseId,
            //             userId: this.userId
            //         }
            //     }).then(res => {
            //         if (res.data.code === '1') {
            //             // 更新状态成功后相应的未读数量应该为0
            //             this.$store.state.crm.fbUnreadStatus = false;
            //             this.$store.state.crm.clearfbUnreadFlag = false;
            //             this.dataList.forEach(item => {
            //                 item.eventCustomVar.count = 0;
            //             });
            //         }
            //     });
            // },
            getList() {
                this.isLoading = true;

                const jsonData = {
                    orgId: this.enterpriseId,
                    startDate: Array.isArray(this.date) ? this.date[0] : undefined,
                    endDate: Array.isArray(this.date) ? this.date[1] : undefined,
                    eventCategory: 4,
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
                            return item;
                        });
                        this.dataList = this.dataList.concat(List);
                    }
                    // this.getSenderId();
                    this.isLoading = false;
                });
            },
            // 处理时间轴回复逻辑
            handleFBReply(item) {
                this.showMessengerFB = true;
                this.visible = true;
                this.selectedItem = item;
            },
            // 获取senderID
            // getSenderId() {
            //     util.ajax({
            //         url: '/crm/inquiry/getSenderIds',
            //         method: 'get',
            //         params: {
            //             orgId: this.enterpriseId,
            //             inquiryId: this.companyId
            //         }
            //     }).then(res => {
            //         if (res.data.code === '1') {
            //             if (res.data.data[0]) {
            //                 res.data.data.forEach(item => {
            //                     const temp = {
            //                         conversationId: item.senderId,
            //                         customerName: item.nickName
            //                     };
            //                     // if(this.conversations_info.indexOf(temp) === -1){
            //                     //     this.conversations_info.push(temp);
            //                     // }
            //                     this.conversations_info.push(temp);
            //                     if (this.senderIds.indexOf(item.senderId) === -1) {
            //                         this.senderIds.push(item.senderId);
            //                     }
            //                 });
            //                 const obj = {};
            //                 this.conversations_info = this.conversations_info.reduce(function(item, next) {
            //                     obj[next.conversationId] ? '' : obj[next.conversationId] = true && item.push(next);
            //                     return item;
            //                 }, []);
            //                 this.getUnreadCount();
            //                 for (let i = 0; i < this.senderIds.length; i++) {
            //                     this.getSingleBrandPage(i);
            //                 }
            //             }
            //         }
            //     });
            // },
            // 获取fb未读数
            // getUnreadCount() {
            //     util.ajaxJson({
            //         url: '/crm/messenger/getUnreadCount',
            //         method: 'post',
            //         data: {
            //             orgId: this.enterpriseId,
            //             userId: this.userId,
            //             senderIds: this.senderIds
            //         }
            //     }).then(res => {
            //         const countObj = res.data.data;
            //         if (res.data.code === '1') {
            //             this.dataList.forEach(item => {
            //                 for (let i = 0; i < this.senderIds.length; i++) {
            //                     const id = this.senderIds[i];
            //                     if (item.eventCustomVar.conversationId == id) {
            //                         this.$set(item, 'count', countObj[id]);
            //                     }
            //                 }
            //             });
            //         }
            //     });
            // },
            // 获取相关主页类型
            // getSingleBrandPage(index) {
            //     const temp = this.senderIds.slice(index, index + 1);
            //     console.log(':::LLL:', temp);
            //     util.ajaxInternationalJson({
            //         url: '/social/getBrandPageByPageIds',
            //         method: 'post',
            //         data: {
            //             userId: this.userId,
            //             orgId: this.enterpriseId,
            //             conversationIds: temp
            //         }
            //     }).then(res => {
            //         if (res.data.code === '1') {
            //             const dataList = res.data.data;
            //             this.dataList.forEach(item => {
            //                 if (item.eventCustomVar.conversationId == temp[0]) {
            //                     this.$set(item.eventCustomVar, 'homePageType', dataList[0].homePageType);
            //                     this.$set(item.eventCustomVar, 'pageId', dataList[0].providerUserId);
            //                 }
            //             });
            //         }
            //     });
            // },


            /* FB消息对话框打开/关闭 */
            handleVisibleChange(val) {
                console.log('FB消息对话框打开/关闭', val);
                if (val) {
                    // this.getSenderId();
                    this.handleClickConversationModal(this.selectedItem);
                } else {
                    this.showMessengerFB = false;
                    this.visible = false;
                    this.selectedItem = {};
                    this.handleCloseConversationModal();
                }
            }
        }
    };
</script>

<style lang="less">
    .fb-Modal .el-dialog__footer {
        padding: 0;
    }
</style>

<style lang="less" scoped>
    .fb-unread-count {
        font-size: 12px;
        color: #FA8241;
        letter-spacing: 0;
        line-height: 18px;
    }
</style>
