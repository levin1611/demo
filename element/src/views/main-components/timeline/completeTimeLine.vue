<!-- 最完整的时间轴
筛选等其他操作由外部处理, 此组件仅负责根据筛选条件显示相应的时间轴条目
-->
<template>
    <div v-loading="isLoading"
         :element-loading-text="$t('crm.Html.loading')"
         class="completeTimeLine">
        <!-- 无数据提醒 -->
        <div v-show="!isLoading && lineList.length === 0"
             class="completeTimeLine__noDataTip">{{ $t('timeLine.noData') }}</div>

        <!-- 时间轴 -->
        <Timeline v-show="lineList.length"
                  v-infinite-scroll="loadMore"
                  :infinite-scroll-immediate="false"
                  :infinite-scroll-disabled="noMore"
                  :infinite-scroll-distance="10"
                  id="timelineBox"
                  class="completeTimeLine__timeline">
            <!-- 时间轴起始小圆点 -->
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

            <!-- 按类型渲染时间轴条目 -->
            <TimelineItem v-for="(item, index) in lineList"
                          :key="item.id">
                <!-- 跟进记录 -->
                <template v-if="item.eventCategory === '1'">
                    <div slot="dot"
                         class="timeline-dot">
                        <img src="@/styles/customFont/svg/followUp.svg" />
                    </div>

                    <FollowupItem :item="item"
                                  :disabled="disabled"
                                  :type="type"
                                  :originalType="originalType"
                                  :belongId="id"
                                  :reply="reply"
                                  v-on="$listeners"></FollowupItem>
                    <wechat :item="item"
                                  :disabled="disabled"
                                  :type="type"
                                  :originalType="originalType"
                                  :belongId="id"
                                  :reply="reply"
                                  v-on="$listeners"></wechat>
                </template>
                <!-- 邮件 -->
                <template v-if="item.eventCategory === '2'">
                    <div slot="dot"
                         class="timeline-dot">
                        <img v-if="item.eventCustomVar.action == 1"
                             src="@/styles/customFont/svg/sendMail.svg" />
                        <img v-else-if="item.eventCustomVar.action == 2"
                             src="@/styles/customFont/svg/receiveMail.svg" />
                        <!--<img v-else-->
                        <!--     src="@/styles/customFont/svg/mailOpenRecord.svg"></img>-->
                    </div>

                    <MailItem :item="item"
                              :replyMailVisible.sync="replyMailVisible"
                              :disabled="disabled"
                              :type="type"
                              :originalType="originalType"
                              :belongId="id"
                              :reply="reply"
                              @getMailDetail="getMailDetail"
                              @getMailDetailSubject="getMailDetailSubject"
                              v-on="$listeners"></MailItem>
                </template>
                <!-- 网站交互 -->
                <!-- 因为【ID1018382】只保留了一条"外链"类型的轨迹时，造成"数据一闪而过"现象, 此处先去掉外链限制 -->
                <!-- <template v-if="item.eventCategory === '3' && ((item.outLinkFlag != 0) || (item.outLinkFlag == 0 && item.visitorTrace.length > 1))">-->
                <template v-if="item.eventCategory === '3'">
                    <div slot="dot"
                         class="timeline-dot">
                        <img src="@/styles/customFont/svg/webVisit.svg" />
                    </div>

                    <WebItem :item="item"
                             :type="type"
                             @getVisitorAllInfoByEvent="getVisitorAllInfoByEvent"
                             v-on="$listeners"></WebItem>
                </template>
                <!-- Facebook 交互 -->
                <template v-if="item.eventCategory === '4'">
                    <div slot="dot"
                         class="timeline-dot">
                        <img src="@/styles/customFont/svg/Facebook.svg" />
                    </div>

                    <FacebookItem :item="item"
                                  :type="type"
                                  v-on="$listeners"></FacebookItem>
                </template>
                <!-- 来源 -->
                <template v-if="item.eventCategory === '5'">
                    <div slot="dot"
                         class="timeline-dot">
                        <img src="@/styles/customFont/svg/source.svg" />
                    </div>

                    <!-- 时间轴内容 -->
                    <SourceItem :item="item"
                                :type="type"
                                :originalType="originalType"
                                v-on="$listeners"></SourceItem>
                </template>
                <!-- WhatsApp -->
                <template v-if="item.eventCategory === '6'">
                    <div slot="dot"
                         class="timeline-dot">
                        <img src="@/styles/customFont/svg/WhatsApp.svg" />

                        <!-- WABA 标识 -->
<!--                        <div v-if="item.isWABA"-->
<!--                             class="WABA-icon">-->
<!--                            <img :src="`${publicPath}image/WhatsApp-business.svg`"-->
<!--                                 alt="WABA">-->
<!--                        </div>-->
                    </div>

                    <WhatsAppItem :item="item"
                                  :type="type"
                                  :originalType="originalType"
                                  @showReplyModal="showReplyModal"
                                  v-on="$listeners"></WhatsAppItem>
                </template>
                <!-- Instagram -->
                <template v-if="item.eventCategory === '7'">
                    <!-- 时间轴图标 -->
                    <div slot="dot"
                         class="timeline-dot">
                        <img src="@/styles/customFont/svg/Instagram.svg" />
                    </div>

                    <!-- 时间轴内容 -->
                    <InstagramItem :item="item"
                                   :type="type"
                                   v-on="$listeners"></InstagramItem>
                </template>
                 <!-- weChat -->
                 <template v-if="item.eventCategory === '8'">
                    <div slot="dot"
                         class="timeline-dot">
                        <img src="@/styles/customFont/svg/wechat.svg" />
                    </div>
                    <weChatItem :item="item"
                                  :type="type"
                                  :originalType="originalType"
                                  @showReplyModal="showWeChatReplyModal"
                                  v-on="$listeners"></weChatItem>
                </template>
                <!-- 通话记录 -->
                <template v-if="item.eventCategory === '10'">
                    <div slot="dot"
                         class="timeline-dot">
                         <!-- 呼入 -->
                        <img v-if="item.callType === 0" src="@/styles/customFont/svg/call_in.svg" />
                         <!-- 呼出 -->
                        <img v-else src="@/styles/customFont/svg/call_out.svg" />
                    </div>
                    <callRecordsItem :item="item"
                                  :type="type"
                                  :originalType="originalType"
                                  @showReplyModal="showWeChatReplyModal"
                                  v-on="$listeners"></callRecordsItem>
                </template>
                <!-- 短信记录 -->
                <template v-if="item.eventCategory === '9'">
                    <div slot="dot"
                         class="timeline-dot">
                        <img src="@/styles/customFont/svg/message.svg" />
                    </div>
                    <messageRecordsItem :item="item"
                                  :type="type"
                                  :originalType="originalType"
                                  @showReplyModal="showWeChatReplyModal"
                                  v-on="$listeners"></messageRecordsItem>
                </template>
                <!-- EDM邮件 -->
                <!-- <template v-if="item.eventCategory === EDMEventCategory">
                    <div slot="dot"
                         class="timeline-dot">
                        <img v-if="item.eventCustomVar.action == 1"
                             src="@/styles/customFont/svg/sendMail.svg" />
                        <img v-else-if="item.eventCustomVar.action == 2"
                             src="@/styles/customFont/svg/receiveMail.svg" />
                    </div>

                    <MailItem :item="item"
                              :replyMailVisible.sync="replyMailVisible"
                              :disabled="disabled"
                              :type="type"
                              :originalType="originalType"
                              :belongId="id"
                              :reply="reply"
                              :allUsers="allUsers"
                              @getMailDetail="getMailDetail"
                              @getMailDetailSubject="getMailDetailSubject"
                              v-on="$listeners"></MailItem>
                </template> -->
            </TimelineItem>

            <!-- 提示: 没有更多 -->
            <p v-if="noMore"
               class="timeline-no-more-tip">{{ $t('noticeWindow.noMore') }}</p>
        </Timeline>

        <!-- 邮件详情 -->
        <MailDetail :visible.sync="previewModel"
                    :disabled="disabled"
                    :id="id_previewMail"
                    :createUserId="createUserId_previewMail"
                    :type="type"
                    :originalType="originalType"
                    :modalWidth="modal_width"
                    @updateReadStatus="update_mail_readStatus"></MailDetail>

        <!--访问详情-->
        <AccessDetail :visible.sync="previewWebInfo"
                      :type="type"
                      :modalWidth="modal_width"
                      :visitorInfo="visitorInfo"
                      :item="itemInfo"
                      @updateVistorInfo="getGoogleInfoDetails"
                      :mergeInfoList="mergeInfoList"></AccessDetail>

        <!--回复/回复全部-->
        <replyMailModal
                :visible.sync="replyMailVisible"
                ref="replyMailModal"
                :mailDetailMailEdit = "mailDetailMailEdit"
                :mailDetailId = "mailDetailId"
                :mailDetailReplyType = "mailDetailReplyType"
                :createUserId="mailDetailCreateUserId"
        ></replyMailModal>
        <!-- 时间轴快速回复 -->
        <WhatsAppReplyModal v-if="switchId"
                            :visibleReplyModal.sync="visibleReplyModal"
                            :talkObj="talkObj"
                            :currUserId="whatsAppAccountInfo.userId"
                            :currOrgId="whatsAppAccountInfo.orgId"
                            ref="whatsAppReplyModal"></WhatsAppReplyModal>
        <!-- 时间轴快速回复 -->
        <repalyMicroent v-if="visibleWeChatReplyModal"
                            :talkObj="talkWeChatObj"
                            @closeQWreplay="closeQWreplay"
                            ref="weChatReplyModal"></repalyMicroent>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import Utils from '@/utils/index';
    import { mapState } from 'vuex';
    import FollowupItem from '@/views/main-components/timeline/followup/followupItem';
    import MailItem from '@/views/main-components/timeline/mail/mailItem';
    import WebItem from '@/views/main-components/timeline/web-interaction/webItem';
    import FacebookItem from '@/views/main-components/timeline/facebook-interaction/facebookItem';
    import SourceItem from '@/views/main-components/timeline/clue-inquiry/sourceItem';
    import WhatsAppItem from '@/views/main-components/timeline/WhatsApp/whatsAppItem';
    import InstagramItem from '@/views/main-components/timeline/Instagram/InstagramItem';
    import MailDetail from '@/views/main-components/timeline/Components/mailDetail';
    import AccessDetail from '@/views/main-components/timeline/Components/accessDetail';
    import replyMailModal from '@/views/main-components/timeline/Components/replyMailModal';
    import WhatsAppReplyModal from '@/views/main-components/timeline/WhatsApp/modal/WhatsAppReplyModal';
    import repalyMicroent from '@/views/main-components/timeline/Micronent/repalyMicroent';
    import weChatItem from '@/views/main-components/timeline/weChat/weChatItem';
    import callRecordsItem from '@/views/main-components/timeline/callRecords/callRecordsItem';
    import messageRecordsItem from '@/views/main-components/timeline/callRecords/messageRecordsItem';
    
    import {
        getVisitorHistoryDetailPiwik,
        getLeaveMessagePiwik
    } from '@/views/visitor-history/api/visitor_piwik';
    import { getGoogleAdBtn, getGoogleAdInfo } from '@/api/reusableApi/common';
    import timeline from '@/api/timeline';
    const { getTimeLineWaText, getTimeLineCinnoxText } = timeline;

    export default {
        name: 'completeTimeLine',
        components: {
            FollowupItem,
            MailItem,
            WebItem,
            FacebookItem,
            SourceItem,
            WhatsAppItem,
            InstagramItem,
            MailDetail,
            AccessDetail,
            replyMailModal,
            WhatsAppReplyModal,
            weChatItem,
            repalyMicroent,
            callRecordsItem,
            messageRecordsItem
        },
        props: [
            'id',
            'date',
            'keyword',
            'followUpContent',
            'flag',
            // 时间轴顶部 Tab 手动点击分类进行筛选, 统一使用此参数, 避免因为筛选数据后, Tab 数据更新导致列表触发二次筛选
            'refreshFlag',
            // 时间轴顶部 Tab 全部取消分类勾选, 数据清空, 不请求接口
            'clearFlag',
            'type',
            'originalType',
            'group',
            'group_followup',
            'group_mail',
            'group_edm',
            'countObj_mail',
            'mailType',
            'callType',
            'allChecked',
            'currentTab',
            'fieldObj',
            'disabled',
            'isScroll',
            // 是否处于邮件搜索状态(走邮件搜索接口)
            'isMailSearching',
            'publisher', // 发布人
            'contactsName' // 联系人
            // 定义的edm  eventCategory值 改一处即可
            // 'EDMEventCategory'
        ],
        data() {
            return {
                /* 全局 */
                publicPath: process.env.BASE_URL,
                // loading
                isLoading: true,
                // axios 取消请求函数 - 获取时间轴数据
                cancelFunc_getData: null,
                // axios 取消请求函数 - 获取时间轴统计数字
                cancelFunc_getCount: null,
                // 时间轴数据
                lineList: [],
                // "没有更多"标识
                noMore: false,
                // 当前分页页码
                pageNo: 1,
                // 每次加载条数
                pageSize: 20,

                // 存放回复的全部信息
                reply: {},

                /* 邮件 */
                // axios 取消请求函数 - 获取邮件搜索统计数字
                cancelFunc_getMailCount: null,
                isUpdateCount: true, // 搜索列表更新的同时，是否更新邮件相关的统计数字

                /* 网站交互 */
                // 询盘云 piwik 上线时间(2019-06-01 00:00:00), 在此之前的请求询盘云接口, 在此之后的请求 piwik 接口
                onlineTime: 1559318400000,

                /* 邮件弹窗 */
                previewModel: false,
                id_previewMail: '',
                createUserId_previewMail: '',

                /* 网站交互弹窗 */
                previewWebInfo: false,
                visitorInfo: {}, // 访客信息
                itemInfo: {},
                mergeInfoList: [], // 按时间合并后的列表
                replyMailVisible: false,
                mailDetailMailEdit: '',
                mailDetailId: '',
                mailDetailCreateUserId: '',
                mailDetailReplyType: '',

                /* wa 快速回复相关 */
                switchId: false,
                visibleReplyModal: false,
                visibleWeChatReplyModal: false,
                talkWeChatObj: null,
                // whatsAppAccountInfo: null, // 当前人whatsApp账号
                talkObj: null,
                arr_followupTypes: []
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                clue_short_info: 'clue_short_info',
                window_width: 'window_width',
                followUpType: (state) => state.crm.followUpType, // 跟进方式
                allUsers: state => state.crm.allUsers // 全部用户
            }),
            // 弹框宽度
            modal_width() {
                return parseInt(this.window_width * 0.8);
            },
            // // 接口请求的页码, 当前总条数 / 每页条数, 向下取整再加 1
            // pageNo() {
            //     return Math.floor(this.lineList.length / this.pageSize) + 1;
            // },
            // 时间轴数据 id 数组
            lineListIds() {
                return this.lineList.map(item => item.id);
            },
            // 时间轴分类筛选
            eventCategory() {
                switch (this.currentTab) {
                    case 'all':
                        // 全部轴
                        return this.allChecked ? '' : this.group.join(',');
                    case 'Remarks':
                    case 'Followup':
                        // 线索备注轴
                        // 跟进记录轴
                        return 1;
                    case 'Mail':
                        // 邮件轴
                        return 2;
                    case 'web-line':
                        // 网站交互轴
                        return 3;
                    case 'FacebookInteraction':
                        // FB 交互轴
                        return 4;
                    case 'ClueInquiry':
                        // 来源轴
                        return 5;
                    case 'WhatsApp':
                        // WA 轴
                        return 6;
                    case 'Instagram':
                        // WA 轴
                        return 7;
                    case 'weChat':
                        // WA 轴
                        return 8;
                    case 'message':
                        // 短信
                        return 9;
                    case 'call':
                        // 通话
                        return 10;
                    // case 'EDM':
                    //     // EDM 轴
                    //     return this.EDMEventCategory;
                    default:
                        return '';
                }
            },
            // 跟进记录分类筛选
            followupTypes() {
                if (this.currentTab !== 'Followup') return undefined;
                return this.allChecked ? '' : this.group_followup.join(',');
            },
            // 邮件联系人筛选
            contactIds() {
                if (this.currentTab !== 'Mail' &&  this.currentTab !== 'EDM') return undefined;
                if (this.currentTab === 'Mail') return this.group_mail === 'all' ? '' : this.group_mail === 'undefined' ? -1 : this.group_mail; // 关联来的不一定有联系人;
                if (this.currentTab === 'EDM') return this.group_edm === 'all' ? '' : this.group_edm;
            },
            // 邮件收发件类型筛选
            emailType() {
                if (this.currentTab !== 'Mail') return undefined;
                return this.mailType.join(',');
            },
            // 邮件收发件类型筛选
            callsType() {
                if (this.currentTab !== 'call') return undefined;
                return this.callType.join(',');
            },
            // 如果当前在 wa 相关页面下(WA 打开 CRM 侧滑页), 返回当前显示的 wa 绑定账号信息
            whatsAppAccountInfo() {
                if (this.wabaCurrentAccountInfo_provide) {
                    return this.wabaCurrentAccountInfo_provide();
                } else {
                    return {};
                }
            }
        },
        methods: {
            // 获取WhatsApp时间轴正文内容
            async getTimeLineWaText(data, List) {
                await getTimeLineWaText(data)
                    .then(response => {
                        const res = response.data;
                        if (response.code === 1) {
                            for (let i = 0; i < List.length; i++) {
                                for (let j = 0; j < res.length; j++) {
                                    // 传给后端一个 firstChatRecordId ,前端直接根据 firstChatRecordId 是否相等来判断就可以了
                                    if (List[i].eventCustomVar.firstChatRecordId === res[j].firstChatRecordId) {
                                        // 获取对应WhatsApp聊天记录的正文
                                        List[i].eventCustomVar.waText = res[j].text;

                                        // 如果匹配到了就退出循环,不然后续的文本可能会覆盖前面的文本
                                        break;
                                    }
                                }
                            }
                        }
                    }).catch(error => {
                        console.log(error);
                    });
            },
            // 获取WhatsApp时间轴正文内容
            async getTimeLineCinnoxText(data, List) {
                await getTimeLineCinnoxText(data)
                    .then(response => {
                        const res = response.data;
                        if (response.code === 1) {
                            List.map((item, index) => {
                                const match = res.find(record => record.chatRecordId === item.eventActionId);
                                if (match) {
                                    item.messageText = match.text;
                                }
                            });
                            // for (let i = 0; i < List.length; i++) {
                            //     for (let j = 0; j < res.length; j++) {
                            //         // 传给后端一个 firstChatRecordId ,前端直接根据 firstChatRecordId 是否相等来判断就可以了
                            //         if (List[i].eventActionId === res[j].chatRecordId) {
                            //             // 获取对应WhatsApp聊天记录的正文
                            //             List[i].messageText = res[j].text;

                            //             // 如果匹配到了就退出循环,不然后续的文本可能会覆盖前面的文本
                            //             break;
                            //         }
                            //     }
                            // }
                        }
                    }).catch(error => {
                        console.log(error);
                    });
            },
            /* 时间轴数据 */
            refreshData() {
                // 清空原有数据
                this.clearData();
                // 不是从未建档小窗进入时间轴
                // if (this.type !== 'journeyDetail') {
                //     // 请求数据
                // } else {
                //     this.getVisitorList();
                // }
                // 如果邮件有关键字搜索就走邮件关键字搜索的接口
                if (this.isMailSearching) {
                    // 走邮件搜索接口
                    this.handleSearchMail();
                } else {
                    // 更新时间轴顶部 Tab 分类和统计数字
                    this.updateCategoryListCount();

                    // 请求时间轴数据
                    this.getList();
                }
            },
            clearData() {
                // 取消之前的数据请求
                if (typeof this.cancelFunc_getData === 'function') {
                    this.cancelFunc_getData();
                }
                if (typeof this.cancelFunc_getCount === 'function') {
                    this.cancelFunc_getCount();
                }
                if (typeof this.cancelFunc_getMailCount === 'function') {
                    this.cancelFunc_getMailCount();
                }

                // 清空数据
                this.lineList = [];
                this.reply = {};
                this.isLoading = false;
                this.pageNo = 1;
                this.noMore = false;
            },
            // 获取时间轴数据
            async getList() {
                const vm = this;
                // 取消之前的数据请求
                if (typeof this.cancelFunc_getData === 'function') {
                    this.cancelFunc_getData();
                }

                // 初始化请求数据
                const seasFlag = this.originalType === 'highseasClue' || this.originalType === 'highseasCustomer' ? 1 : 0;
                const jsonData = {
                    orgId: this.enterpriseId,
                    startDate: Array.isArray(this.date) ? this.date[0] : undefined,
                    endDate: Array.isArray(this.date) ? this.date[1] : undefined,
                    eventCategory: this.eventCategory,
                    followupTypes: this.followupTypes,
                    contactIds: this.contactIds,
                    emailType: this.emailType,
                    callType: this.callsType,
                    followUpContent: this.followUpContent,
                    pageNo: this.pageNo,
                    pageSize: this.pageSize,
                    currentUserId: this.userId,
                    seasFlag,
                    publisher: this.publisher,
                    contactsName: this.contactsName
                };

                // 根据时间轴类型不同追加参数
                switch (this.type) {
                    case 'clue':
                        jsonData.clueId = this.id;
                        break;
                    case 'inquiry':
                        jsonData.inquiryId = this.id;
                        break;
                    case 'customer':
                    case 'highseasCustomer':
                        jsonData.companyId = this.id;
                        break;
                    case 'contact':
                        jsonData.contactsId = this.id;
                        break;
                }
                // jsonData.visitorId ='10110FK2021033112093795460'
                // 发送请求
                this.isLoading = true;
                util.ajaxJson({
                    url: '/crm/time/line/query/getTimeLineListData',
                    method: 'post',
                    data: jsonData,
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        // An executor function receives a cancel function as a parameter
                        vm.cancelFunc_getData = c;
                    })
                }).then(async response => {
                    if (response.data.code === '1') {
                        // 暂存数据
                        let tempArr = response.data.data;

                        // 如果数据不为空
                        if (Array.isArray(tempArr) && tempArr.length) {
                            tempArr.forEach(item => {
                                // 后台 id 为数字型, 位数太多放不下, 后台新增了一个字符串型的 eventActionId , 拿这个替换掉原来的数字型 id
                                item.id = item.eventActionId;
                            });

                            // 当返回数据少于 pageSize 条的时候显示 没有更多数据，同时禁用滚动加载，先不考虑刚好等于 pageSize 条的情况
                            if (tempArr.length < this.pageSize) {
                                this.noMore = true;
                            }

                            // 过滤掉当前已存在的数据
                            tempArr = tempArr.filter(item => !this.lineListIds.includes(item.id));

                            // 如果过滤后数组为空, 退出流程
                            if (!tempArr.length) {
                                this.isLoading = false;
                                return;
                            }
                            // 处理数据
                            const List = await this.handleEventList(tempArr);

                            // 拼接数据, 并按时间倒序排序
                            this.lineList = this.lineList.concat(List).sort((a, b) => (new Date(b.eventTime)).getTime() - (new Date(a.eventTime)).getTime());
                            // 网站交互条目特殊处理
                            if (List.find(item => item.eventCategory === '3')) {
                                // 如果有网站交互条目
                                List.forEach((line, index) => {
                                    if (line.eventCategory === '3') {
                                        // 请求访客详情
                                        this.handleTimeLineList(line);
                                        this.getFormByVisitorId(line, index);
                                    }
                                });
                            }

                            // 获取WhatsApp条目的正文
                            let list = JSON.parse(JSON.stringify(List)); // 深copy一下
                            list = list.filter(item => item.eventCategory === '6'); // 过滤出WhatsApp相关的数据

                            if (list.length) {
                                const data = [];
                                list.forEach(li => {
                                    const obj = {};
                                    obj.userBindWaAccount = li.eventCustomVar.userBindWaAccount;
                                    obj.chatWaAccount = li.eventCustomVar.toWaAccount;
                                    obj.createTime = li.eventTime;
                                    obj.userId = this.userId;
                                    obj.orgId = this.enterpriseId;
                                    obj.firstChatRecordId = li.eventCustomVar.firstChatRecordId;

                                    // 如果 userBindWaAccount 和 toWaAccount 相同的话
                                    if (li.eventCustomVar.userBindWaAccount === li.eventCustomVar.toWaAccount) {
                                        obj.chatWaAccount = li.eventCustomVar.fromWaAccount;
                                    }

                                    data.push(obj);
                                });

                                // 请求WhatsApp正文内容
                                await this.getTimeLineWaText(data, List);
                            }

                            let messageList = JSON.parse(JSON.stringify(List)); // 深copy一下
                            messageList = messageList.filter(item => item.eventCategory === '9'); // 过滤出短信相关的数据

                            if (messageList.length) {
                                const data = [];
                                messageList.forEach(li => {
                                    const obj = {};
                                    obj.userBindPhone = JSON.parse(li.eventCustomVar).userBindPhone;
                                    obj.concatPhone = JSON.parse(li.eventCustomVar).toPhone;
                                    obj.createTime = li.eventTime;
                                    obj.userId = this.userId;
                                    obj.orgId = this.enterpriseId;
                                    obj.chatRecordId = li.eventActionId;

                                    // 如果 userBindWaAccount 和 toWaAccount 相同的话
                                    if (JSON.parse(li.eventCustomVar).userBindPhone === JSON.parse(li.eventCustomVar).toPhone) {
                                        obj.chatWaAccount = JSON.parse(li.eventCustomVar).fromPhone;
                                    }

                                    data.push(obj);
                                });
                                // 请求WhatsApp正文内容
                                await this.getTimeLineCinnoxText(data, List);
                            }
                        }
                    } else {
                        if (response.data.message) {
                            this.$Message.error(this.$t('timeLine.timeLineTip'));
                        }
                    }

                    // 取消 loading
                    this.isLoading = false;
                }).catch(error => {
                    console.error(error);
                });
            },
            // 滚动加载更多
            loadMore() {
                // 正在加载中就先不请求接口了
                if (!this.isLoading) {
                    this.pageNo++;
                    if (this.isMailSearching) {
                        this.handleSearchMail();
                    } else {
                        this.getList();
                    }
                }
            },
            // 时间轴的数据处理
            async handleEventList(list) {
                // 记录跟进记录 index , 随后批量请求
                // const followupIds = [];
                list.forEach((item, index) => {
                    switch (item.eventCategory) {
                        case '1':
                            // 跟进记录/线索备注
                            // item.followup = { pictures: [] };
                            item.followup = item.followup || {};
                            // 跟进记录可上传文件，做相应拆分
                            if (item.followup.pictures && item.followup.pictures.length) {
                                const pictures = item.followup.pictures.concat();
                                const resData = [];
                                pictures.forEach(item => {
                                    let obj = {};
                                    if (item.indexOf('?') > 0) {
                                        const name = Utils.getQueryVariable(item, 'name');
                                        obj = {
                                            url: item.substring(0, item.indexOf('?')),
                                            name: name || `image${new Date().getTime()}.jpg`,
                                            size: Utils.getQueryVariable(item, 'size'),
                                            type: Utils.getQueryVariable(item, 'type'),
                                            id: Utils.getQueryVariable(item, 'id')
                                        };
                                    } else {
                                        obj = {
                                            url: item,
                                            name: `image${new Date().getTime()}.jpg`,
                                            size: -1,
                                            type: 'jpg',
                                            id: -1
                                        };
                                    }
                                    resData.push(obj);
                                });
                                item.followup.pictures = resData;
                            };
                            item.eventCustomVar = item.eventCustomVar ? JSON.parse(item.eventCustomVar) : {};
                            if (this.type === 'clue' || item.eventAction == 4) {
                                // this.getRemark(item, item.eventId, index);
                            } else {
                                // followupIds.push(item.eventId);
                                item.fullname = this.getFullName(item.followup.create_user_id);
                                item.followupType_formatted = this.format_followupType(item.followup.followup_type);
                                this.$set(this.reply, item.id, {
                                    // 查看已存在的评论和评论对话框
                                    visible: false,
                                    // input 内容
                                    content: '',
                                    // 存放要回复的评论的 id , 为 0 时表示回复跟进记录
                                    parentId: 0,
                                    // 存放要回复的评论的人的 fullName
                                    parent_commentatorName: undefined,
                                    // 存放要回复的评论的人的 id , 初始值为跟进记录填写者的 id (跟 parentId 初始值为 0 同理)
                                    parent_commentatorId: item.followup.create_user_id,
                                    // 保存中 loading
                                    loading_saving: false,
                                    // 已存在的评论
                                    comments: [],
                                    // 已存在的评论数
                                    count_comments: 0,
                                    // 请求中 loading
                                    loading_requesting: false,
                                    // 定义最后光标对象
                                    lastEditRange: undefined,

                                    // 跟进记录部分内容
                                    postType: 1,
                                    postId: item.followup.id,
                                    postContent: item.followup.followup_content,
                                    postCreatorId: item.followup.create_user_id,
                                    postCreatorName: item.fullname
                                });
                            }
                            break;
                        case '2':
                            // case this.EDMEventCategory:
                            // 邮件
                            item.eventCustomVar = JSON.parse(item.eventCustomVar);
                            item.mailDetail = {};
                            item.showDetail = false;
                            item.isRead = false;
                            item.attachments = [];
                            item.tags = [];
                            item.mailResumes = '';
                            item.contactsName = item.contactsName ? item.contactsName : this.$t('timeLine.unknown');

                            // 格式化询盘时间轴的"邮件打开记录"数据
                            if (Array.isArray(item.eventActionList) && item.eventActionList.length) {
                                item.eventActionList.forEach(eventActionItem => {
                                    eventActionItem.eventCustomVar = JSON.parse(eventActionItem.eventCustomVar);
                                });

                                // 倒序排序
                                item.eventActionList.sort((a, b) => b.eventTime - a.eventTime);
                            }

                            // 邮件评论相关
                            this.$set(this.reply, item.id, {
                                // 查看已存在的评论和评论对话框
                                visible: false,
                                // input 内容
                                content: '',
                                // 存放要回复的评论的 id , 为 0 时表示回复跟进记录
                                parentId: 0,
                                // 存放要回复的评论的人的 fullName
                                parent_commentatorName: undefined,
                                // 存放要回复的评论的人的 id , 初始值为跟进记录填写者的 id (跟 parentId 初始值为 0 同理)
                                parent_commentatorId: item.eventCustomVar.createUserId,
                                // 保存中 loading
                                loading_saving: false,
                                // 已存在的评论
                                comments: [],
                                // 已存在的评论数
                                count_comments: 0,
                                // 请求中 loading
                                loading_requesting: false,
                                // 定义最后光标对象
                                lastEditRange: undefined,

                                // 邮件记录部分内容
                                postType: 2,
                                postId: item.eventId,
                                postContent: item.eventCustomVar.mailSubject,
                                postCreatorId: item.eventCustomVar.createUserId,
                                postCreatorName: item.eventUser,
                                keyId: item.contactsId || item.clueId
                            });
                            break;
                        case '3':
                            item.formList = [];
                            break;
                        case '4':
                        case '6':
                            // 线索
                            // 这里对json字符串进行了处理: 只针对firstChatRecordId字段的值
                            // 原因：json.parse转换数字当数字超过 18 位后尾数变成0 https://blog.csdn.net/Allen_kaihui/article/details/124629922
                            item.eventCustomVar = JSON.parse(item.eventCustomVar.replace(/\"firstChatRecordId":(\d+)/g, '"firstChatRecordId":"$1"'));

                            // 如果是WhatsApp数据,则需要加一个 正文 字段
                            if (item.eventCategory === '6') {
                                item.eventCustomVar.waText = '';
                            }

                            if (['clue', 'highseasClue'].includes(this.originalType) || ['clue', 'highseasClue'].includes(this.type)) {
                                item.contactsName = this.clue_short_info.a1009 ? this.clue_short_info.a1009 : item.contactsName;
                            }
                            break;
                        case '5':
                            // 来源
                            item.eventCustomVar = JSON.parse(item.eventCustomVar);
                            break;
                        case '7':
                            // ins 轴数据中的 pid 和 gid 为数字, 解析时往往因为过长而被截取自动补零, 导致 id 不准, 请求不到数据, 现在在解析前先把 json 字符串中的数字 pid gid 替换为字符串
                            item.eventCustomVar = item.eventCustomVar.replace(/"pid":(\d+),/, '"pid":"$1",');
                            item.eventCustomVar = item.eventCustomVar.replace(/"gid":(\d+),/, '"gid":"$1",');
                            item.eventCustomVar = JSON.parse(item.eventCustomVar);
                            break;
                        case '9':

                            // 如果是WhatsApp数据,则需要加一个 正文 字段
                            if (item.eventCategory === '9') {
                                item.messageText = '';
                            }
                            break;
                    }
                });
                // 批量获取跟进记录详情
                // if (followupIds.length) {
                //     await util.ajaxJson({
                //         url: '/crm/followup/getFollowupByIds',
                //         method: 'post',
                //         data: JSON.stringify(followupIds)
                //     }).then(res => {
                //         if (res.data.code === '1') {
                //             const allData = res.data.data;
                //             followupIds.forEach(followupId => {
                //                 const item = list.find(item => item.eventId === followupId);
                //                 const followupData = allData[followupId];

                //                 if (item && followupData) {
                //                     let pictures = [];
                //                     if (followupData.pictures) {
                //                         try {
                //                             pictures = JSON.parse(followupData.pictures);
                //                         } catch (e) {
                //                             pictures = followupData.pictures.split(',');
                //                         }
                //                     }
                //                     followupData.pictures = pictures;
                //                     item.followup = followupData;
                //                     item.fullname = this.getFullName(followupData.create_user_id);
                //                     item.followupType_formatted = this.format_followupType(followupData.followup_type);
                //                     this.$set(this.reply, item.id, {
                //                         // 查看已存在的评论和评论对话框
                //                         visible: false,
                //                         // input 内容
                //                         content: '',
                //                         // 存放要回复的评论的 id , 为 0 时表示回复跟进记录
                //                         parentId: 0,
                //                         // 存放要回复的评论的人的 fullName
                //                         parent_commentatorName: undefined,
                //                         // 存放要回复的评论的人的 id , 初始值为跟进记录填写者的 id (跟 parentId 初始值为 0 同理)
                //                         parent_commentatorId: item.followup.create_user_id,
                //                         // 保存中 loading
                //                         loading_saving: false,
                //                         // 已存在的评论
                //                         comments: [],
                //                         // 已存在的评论数
                //                         count_comments: 0,
                //                         // 请求中 loading
                //                         loading_requesting: false,
                //                         // 定义最后光标对象
                //                         lastEditRange: undefined,

                //                         // 跟进记录部分内容
                //                         postType: 1,
                //                         postId: item.followup.id,
                //                         postContent: item.followup.followup_content,
                //                         postCreatorId: item.followup.create_user_id,
                //                         postCreatorName: item.fullname
                //                     });
                //                 }
                //             });
                //         }
                //     });
                // }
                // 跟进记录详情请求完毕, 继续请求评论数(跟进记录和邮件的评论)
                this.get_count_comments();

                // 时间轴中有邮件时, 获取一些基本信息
                const mailItems = list.filter(item => `${item.eventCategory}` === '2');
                if (mailItems.length) {
                    const mailIds = [];
                    const mailInfoDtoList = [];
                    mailItems.forEach(item => {
                        const mailId = item.eventId;
                        const createUserId = item.eventCustomVar.createUserId;
                        mailIds.push(mailId);
                        mailInfoDtoList.push({
                            mailId,
                            createUserId
                        });
                    });
                    util.ajaxJson({
                        url: '/mail/getMailBaseInformation',
                        method: 'post',
                        data: {
                            enterpriseId: this.enterpriseId,
                            userId: this.userId,
                            mailIds,
                            mailInfoDtoList
                        }
                    }).then(res => {
                        if (res.data.code === 1) {
                            const arr_mailInfo = res.data.data;
                            list.forEach(item => {
                                // 查找时间轴列表中是邮件的时间轴，给此条邮件时间轴赋值邮件的基本信息
                                const temp = arr_mailInfo.find(mailInfo => `${mailInfo.idString}` === `${item.eventId}`);
                                if (temp) {
                                    item.isRead = temp.mailReadFlag === '1' || false;
                                    item.attachments = temp.mailAttachmentList || [];
                                    item.tags = [];
                                    item.mailResumes = temp.mailResumes;
                                    item.mailOpenTimes = temp.mailOpenTimes || '';
                                    if (temp.labelName) {
                                        const ids = temp.labelId.split(',');
                                        const names = temp.labelName.split(',');
                                        const colors = temp.labelColor.split(',');
                                        item.tags = names.map((name, index) => {
                                            return {
                                                labelId: ids[index],
                                                labelName: names[index],
                                                labelColor: colors[index]
                                            };
                                        });
                                    }
                                }
                            });
                            this.$forceUpdate();
                        }
                    });
                }

                return list;
            },
            // 对可筛选分类时间轴, 更新时间轴统计数字到顶部标签
            updateCategoryListCount() {
                // 取消之前的数据请求
                const vm = this;
                if (typeof this.cancelFunc_getCount === 'function') {
                    this.cancelFunc_getCount();
                }

                // 拼装发送数据
                let seasFlag = this.originalType === 'highseasClue' || this.originalType === 'highseasCustomer' ? 1 : 0;
                const jsonData = {
                    orgId: this.enterpriseId,
                    startDate: Array.isArray(this.date) ? this.date[0] : undefined,
                    endDate: Array.isArray(this.date) ? this.date[1] : undefined,
                    eventCategory: '',
                    currentUserId: this.userId,
                    seasFlag
                };

                switch (this.type) {
                    case 'customer':
                    case 'highseasCustomer':
                        jsonData.companyId = this.id;
                        break;
                    case 'inquiry':
                        jsonData.inquiryId = this.id;
                        break;
                    case 'contact':
                        jsonData.contactsId = this.id;
                        break;
                    case 'clue':
                        jsonData.clueId = this.id;
                        break;
                }

                // 发送请求
                util.ajaxJson({
                    url: '/crm/time/line/query/getTimeLineStatData',
                    method: 'post',
                    data: jsonData,
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        // An executor function receives a cancel function as a parameter
                        vm.cancelFunc_getCount = c;
                    })
                }).then(response => {
                    if (response.data.code === '1') {
                        if (!Array.isArray(response.data.data)) {
                            // 更新顶部数据
                            this.$emit('updateCategoryList', []);
                            console.error('更新时间轴顶部分类和统计数据失败');
                            return;
                        }
                        /**
                         * @Description: 时间轴的categoryList中，来源标识为5。对后端来说，其后再增加任何时间轴tab,标识均大于5；
                         *               以WhatsApp为例，后端返回的categoryList中，WhatsApp位于来源之后，与需求不符；
                         *               此处对来源时间轴做特殊处理，使其始终位于时间轴tab栏的最后一项。
                         *               注：新需求需要增加tab类别时，请与产品确认好来源tab的位置。
                         * @author 杨娣
                         * @date 2020/6/30
                         */
                        const categoryList = response.data.data.filter(item => item.type !== '5');
                        const sourceLine = response.data.data.find(item => item.type === '5');
                        if (sourceLine) {
                            categoryList.push(sourceLine);
                        }
                        // 更新顶部数据
                        this.$emit('updateCategoryList', categoryList);
                    } else {
                        console.error('更新时间轴顶部分类和统计数据失败');
                    }
                });
            },

            /* 跟进记录 */
            // 获取跟进记录类型对应的文字
            format_followupType(val) {
                const temp = this.arr_followupTypes.find(item => Number(item.value) === Number(val));
                return temp ? temp.label : val;
            },
            // 获取跟进记录 createUserId 对应的 fullname
            getFullName(userId) {
                const arr = this.allUsers.filter(item => {
                    return userId == item.id;
                });
                if (arr.length > 0) {
                    return arr[0].fullname;
                } else {
                    return '';
                }
            },
            //  获取线索备注
            getRemark(item, eventId, index) {
                util.ajax({
                    url: '/form-cust/remark/getRemark',
                    method: 'post',
                    data: {
                        id: eventId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        let pictures = [];
                        if (res.data.data.pictures) {
                            try {
                                pictures = JSON.parse(res.data.data.pictures);
                            } catch (e) {
                                pictures = res.data.data.pictures.split(',');
                            }
                        }
                        res.data.data.pictures = pictures;
                        item.followup = res.data.data;
                        item.followup.followup_content = res.data.data.content;
                    } else {
                        this.$Message.error(this.$t('clue.error_getClueRemarks'));
                    }
                });
            },
            /* 评论 */
            // 获取回复数量
            get_count_comments() {
                const replyObjs = Object.values(this.reply);
                if (replyObjs.filter(item => item.postId).length) {
                    util.ajaxJson({
                        url: '/crm/comment/getTotal',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            postIds: replyObjs.filter(item => item.postId).map(item => item.postId)
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            const postTypes = [1, 2];
                            postTypes.forEach(postType => {
                                const count_obj = Object.assign({}, ...res.data.data.filter(item => `${item.postType}` === `${postType}`).map(item => {
                                    const temp = {};
                                    temp[item.postId] = item.count;
                                    return temp;
                                }));
                                replyObjs.filter(item => `${item.postType}` === `${postType}`).forEach((reply, index) => {
                                    if (reply.postId && count_obj[reply.postId]) {
                                        reply.count_comments = count_obj[reply.postId];
                                        this.$forceUpdate();
                                    }
                                });
                            });
                        } else {
                            this.$Message.error(this.$t('timeLine.followUpTip1'));
                        }
                    });
                }
            },

            /* 网站交互 */
            // 获取访客详情(除表单外)
            async handleTimeLineList(item) {
                if (item.visitorTrace) {
                    return;
                }
                const id = item.eventId;
                const idvisit = item.eventId.toString().startsWith('piwik') ? item.eventId.substring(6) : item.eventId;
                const visitorId = item.visitorId;
                if (id.startsWith('piwik')) {
                    // 获取该条会话的详情
                    const resData = await getVisitorHistoryDetailPiwik({ idvisit, visitorId });
                    if (resData.code === '1') {
                        const ingore = resData.data.visitorInfo || {};
                        // 如果网站来源是谷歌广告，则需要显示一些广告信息
                        item.visitorInfo = ingore.trafficSource === '1' ? await this.formatGoogleDatas(ingore, item) : ingore;
                        // 如果有visitorChatMessage字段，则需要改变变量的名字，以适应组件
                        if (resData.data.visitorChatMessage && resData.data.visitorChatMessage.length > 0) {
                            item.visitorChatMessage = resData.data.visitorChatMessage.map(element => {
                                return {
                                    attach: element.attach,
                                    body: element.body,
                                    flow: element.flow,
                                    fromAccount: element.fromAccount,
                                    fromNick: element.fromNick,
                                    idClient: element.idClient,
                                    createTime: element.msgTimestamp,
                                    msgType: element.msgType,
                                    toAccount: element.toAccount,
                                    type: 'chat'
                                };
                            });
                        } else {
                            item.visitorChatMessage = [];
                        }
                        item.visitorTrace = resData.data.visitorTrace.map(element => {
                            return {
                                createTime: element.enterTime,
                                fromAddress: element.fromAddress,
                                title: element.title,
                                toAddress: element.toAddress,
                                type: 'trace',
                                currentActionName: element.currentActionName,
                                currentActionType: element.currentActionType,
                                currentPageType: element.currentPageType,
                                preActionName: element.preActionName,
                                middleActionName: element.middleActionName
                            };
                        });
                        // 是否有订单信息，如果有订单信息则需要处理订单信息
                        item.orders = resData.data.orders;
                        const f = resData.data.orders && Array.isArray(resData.data.orders) && resData.data.orders.length;
                        // 显示订单列表图标,显示购物车图标
                        item.showOrderIconOrder = f && resData.data.orders.some(v => v.idorder);
                        item.showOrderIconCart = f && resData.data.orders.some(v => !v.idorder);
                        // 如果订单信息存在,则重组订单信息数据
                        if (resData.data.orders && Array.isArray(resData.data.orders)) {
                            item.visitorTrace = item.visitorTrace.concat((resData.data.orders || []).map(v => ({
                                ...v,
                                createTime: v.enterTime,
                                title: v.idorder ? `订单(${v.idorder})` : '购物车',
                                targetUrl: decodeURIComponent(item.visitorInfo.firstVisitorAddress),
                                type: 'traceOrder'
                            })));
                        }
                        item.outLinkFlag = item.visitorTrace.findIndex(item => {
                            return item.currentActionType == 2;
                        });
                    }
                    if (item.formList) {
                        this.handleInfo(item);
                    }
                } else {
                    util.ajaxInternational({
                        url: '/server/getVisitorAllInfoByEventId',
                        method: 'post',
                        data: {
                            eventId: item.eventId,
                            visitorId: item.visitorId
                        }
                    }).then(async (res) => {
                        if (res.data.code === '1') {
                            const ingore = res.data.data.visitorInfo || {};
                            item.visitorInfo = ingore.trafficSource === '1' ? await this.formatGoogleDatas(ingore, item) : ingore;
                            if (res.data.data.visitorChatMessage && res.data.data.visitorChatMessage.length > 0) {
                                item.visitorChatMessage = res.data.data.visitorChatMessage.map(element => {
                                    return {
                                        attach: element.attach,
                                        body: element.body,
                                        flow: element.flow,
                                        fromAccount: element.fromAccount,
                                        fromNick: element.fromNick,
                                        idClient: element.idClient,
                                        createTime: element.msgTimestamp,
                                        msgType: element.msgType,
                                        toAccount: element.toAccount,
                                        type: 'chat'
                                    };
                                });
                            } else {
                                item.visitorChatMessage = [];
                            }

                            item.visitorTrace = res.data.data.visitorTrace.map(element => {
                                return {
                                    createTime: element.enterTime,
                                    fromAddress: element.fromAddress,
                                    title: element.title,
                                    toAddress: element.toAddress,
                                    type: 'trace',
                                    currentActionName: element.currentActionName,
                                    currentActionType: element.currentActionType,
                                    currentPageType: element.currentPageType,
                                    preActionName: element.preActionName,
                                    middleActionName: element.middleActionName
                                };
                            });
                        }
                        if (item.formList) {
                            this.handleInfo(item);
                        }
                    });
                }
            },
            // 获取谷歌广告信息
            async formatGoogleDatas(item, all) {
                try {
                    // 获取查看谷歌广告按钮是否可用
                    const data = await getGoogleAdBtn(item.idvisit);
                    item.showBtn = data !== 1;
                    if (data === 1) {
                        // 获取谷歌广告详情
                        item = await this.getGoogleInfoDetails(item, all, 'init');
                    }
                    return item;
                } catch (error) {
                    console.error(error);
                    return item;
                }
            },
            // 获取谷歌广告详情
            async getGoogleInfoDetails(item, all, type) {
                const info = await getGoogleAdInfo({
                    idvisit: item.idvisit,
                    orgId: this.enterpriseId,
                    url: all.eventContent
                });
                if (info && typeof info === 'object' && !(info instanceof Error)) {
                    for (const key in info) {
                        if (info.hasOwnProperty(key)) {
                            const value = info[key] || '';
                            if (key && value && typeof value === 'string' && key === 'utm_device') {
                                item[key] = value.replace(/\#.*/, '');
                            } else {
                                item[key] = value;
                            }
                        }
                    }
                    item.showBtn = false;
                    this.$nextTick(function() {
                        this.$forceUpdate();
                    });
                } else {
                    this.$Message.error(this.$t('timeLine.codeErrorGoogleAd'));
                }
                return item;
            },

            // 获取表单留言
            getFormByVisitorId(item, index) {
                if (item.createTime >= this.onlineTime) {
                    this.getFormByVisitorIdP(item, index);
                } else {
                    this.getFormByVisitorIdO(item, index);
                }
            },
            async getFormByVisitorIdP(item, index) {
                item.formList = [];
                // this.webMsgList = []
                const emailReg = Utils.regExp.fullEmail;
                const telReg = Utils.regExp.fullPhone;
                const idvisit = item.eventId.toString().startsWith('piwik') ? item.eventId.substring(6) : item.eventId;
                const visitorId = item.visitorId;
                const resData = await getLeaveMessagePiwik({ idvisit, visitorId });
                if (resData.code === '1' && resData.data.length) {
                    resData.data.forEach((id, index1) => {
                        util.ajaxJson({
                            url: 'form-cust/form/getColumnValue',
                            method: 'post',
                            params: {
                                id
                            }
                        }).then(res => {
                            if (res.data.code === '1') {
                                // this.webMsgList.push(res.data.data)
                                const fields = {};
                                const element = res.data.data;
                                element.type = 'msg';
                                for (const key in element) {
                                    if (key.indexOf('a100') !== -1 && this.fieldObj[key]) {
                                        // 获取对象中的值
                                        const formData = element[key];
                                        // 显示的为明文 , 故 注释下
                                        // 邮箱检测 将邮箱进行加密(****)
                                        // if (formData.indexOf('@') != -1 && formData.length < 40 && emailReg.test(formData)) { /* 检测是邮箱格式 */
                                        //     const emailArr = formData.split('@');
                                        //     emailArr[0] = '****';
                                        //     formData = emailArr.join('@');
                                        // 非邮箱检测,加密处理(****)
                                        // } else if (key !== 'a10010' && telReg.test(formData.replace(/\s/g, ''))) { /* 去掉字符串中空格 检测是电话 */
                                        //     formData = `${formData.slice(0, -4)}****`;
                                        // }
                                        fields[key] = {
                                            type: this.fieldObj[key].type,
                                            label: this.fieldObj[key].name,
                                            value: formData
                                        };
                                    }
                                }
                                element.fields = fields;
                                item.formList.push(element);
                                if (item.visitorTrace) {
                                    this.handleInfo(item);
                                }
                            }
                        });
                    });
                } else {
                    item.formList = [];
                    if (item.visitorTrace) {
                        this.handleInfo(item);
                    }
                }
            },
            getFormByVisitorIdO(item, index) {
                item.formList = [];
                const emailReg = Utils.regExp.fullEmail;
                const telReg = Utils.regExp.fullPhone;
                if (item.visitorId) {
                    util.ajax({
                        url: '/form-cust/form/getColumnValueListByVisitorId',
                        method: 'post',
                        data: {
                            visitorId: item.visitorId
                        }
                    }).then(ret => {
                        if (ret.data.code === '1') {
                            // this.webMsgList = ret.data.data;
                            const fields = {};
                            const element = ret.data.data;
                            element.type = 'msg';
                            for (const key in element) {
                                if (key.indexOf('a100') !== -1 && this.fieldObj[key]) {
                                    const formData = element[key];
                                    // 显示明文邮箱,手机号等; 同1180行
                                    // if (formData.indexOf('@') != -1 && formData.length < 40 && emailReg.test(formData)) { /* 检测是邮箱格式 */
                                    //     const emailArr = formData.split('@');
                                    //     emailArr[0] = '****';
                                    //     formData = emailArr.join('@');
                                    // } else if (key !== 'a10010' && telReg.test(formData.replace(/\s/g, ''))) { /* 去掉字符串中空格 检测是电话 */
                                    //     formData = `${formData.slice(0, -4)}****`;
                                    // }
                                    fields[key] = {
                                        type: this.fieldObj[key].type,
                                        label: this.fieldObj[key].name,
                                        value: formData
                                    };
                                }
                            }
                            element.fields = fields;
                            item.formList.push(element);
                            if (item.visitorTrace) {
                                this.handleInfo(item);
                            }
                        }
                        // this.mergeList();
                    });
                } else {
                    // this.mergeList();
                    item.formList = [];
                    if (item.visitorTrace) {
                        this.handleInfo(item);
                    }
                }
            },
            handleInfo(item) {
                let list = [];
                list = item.visitorChatMessage.concat(item.visitorTrace, item.formList);
                list = list.sort((a, b) => {
                    return new Date(a.createTime).getTime() - new Date(b.createTime).getTime();
                });
                this.$set(item, 'mergeList', list);
            },

            /* 时间轴单客户搜索(当前仅支持邮件搜索) */
            handleSearchMail() {
                // 全部轴, 非全选状态且未勾选邮件轴, 退出搜索流程
                if (this.currentTab === 'all' && !this.allChecked && this.group.every(item => item !== '2')) {
                    this.lineList = [];
                    return;
                }

                const jsonData = {
                    orgId: this.enterpriseId,
                    startDate: Array.isArray(this.date) ? this.date[0] : undefined,
                    endDate: Array.isArray(this.date) ? this.date[1] : undefined,
                    // eventCategory: this.currentTab === 'all' ? 2 : this.currentTab === 'Mail' ? 2 : this.EDMEventCategory,
                    eventCategory: 2,
                    pageNo: this.pageNo - 1,
                    pageSize: this.pageSize,
                    searchContent: this.keyword.trim(),
                    contactIds: this.contactIds,
                    emailType: this.emailType,
                    publisher: this.publisher,
                    contactsName: this.contactsName
                };
                switch (this.type) {
                    case 'customer':
                    case 'highseasCustomer':
                        jsonData.companyId = this.id;
                        break;
                    case 'inquiry':
                        jsonData.inquiryId = this.id;
                        break;
                    case 'contact':
                        jsonData.contactsId = this.id;
                        break;
                    case 'clue':
                        jsonData.clueId = this.id;
                        break;
                }

                if (this.isUpdateCount) {
                    this.getSearchMailCount(jsonData);
                }
                this.getSearchMailList(jsonData);
            },
            // 时间轴搜索获取列表数据
            getSearchMailList(jsonData) {
                /* 列表请求意味着本次搜索动作执行完成，isUpdateCount恢复初始值 */
                this.isUpdateCount = true;

                const vm = this;
                // 取消之前的数据请求
                if (typeof this.cancelFunc_getData === 'function') {
                    this.cancelFunc_getData();
                }

                this.isLoading = true;
                util.ajaxJson({
                    url: '/es/api/time/line/searchList',
                    method: 'post',
                    data: jsonData,
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        // An executor function receives a cancel function as a parameter
                        vm.cancelFunc_getData = c;
                    })
                }).then(async res => {
                    // 暂存数据
                    let tempArr = res.data.data ? res.data.data.item : undefined;

                    // 如果数据不为空
                    if (Array.isArray(tempArr) && tempArr.length) {
                        tempArr.forEach(item => {
                            // 后台 id 为数字型, 位数太多放不下, 后台新增了一个字符串型的 eventActionId , 拿这个替换掉原来的数字型 id
                            item.id = item.eventActionId;
                        });

                        // 当返回数据少于 pageSize 条的时候显示 没有更多数据，同时禁用滚动加载，先不考虑刚好等于 pageSize 条的情况
                        if (tempArr.length < this.pageSize) {
                            this.noMore = true;
                        }

                        // 过滤掉当前已存在的数据
                        tempArr = tempArr.filter(item => !this.lineListIds.includes(item.id));

                        // 如果过滤后数组为空, 退出流程
                        if (!tempArr.length) {
                            this.isLoading = false;
                            return;
                        }

                        // 处理数据
                        const List = await this.handleEventList(tempArr);

                        // 拼接数据, 并按时间倒序排序
                        this.lineList = this.lineList.concat(List).sort((a, b) => (new Date(b.eventTime)).getTime() - (new Date(a.eventTime)).getTime());
                    }

                    // 取消 loading
                    this.isLoading = false;
                }).catch(err => {
                    this.isLoading = false;
                    if (err.message) {
                        this.$Message.error(this.$t('timeLine.timeLineSearchError'));
                    }
                });
            },
            // 时间轴搜索获取邮件数量明细
            getSearchMailCount(jsonData) {
                const vm = this;
                // 取消之前的数据请求
                if (typeof this.cancelFunc_getMailCount === 'function') {
                    this.cancelFunc_getMailCount();
                }
                util.ajaxJson({
                    url: '/es/api/time/line/searchStat',
                    method: 'post',
                    data: jsonData,
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        // An executor function receives a cancel function as a parameter
                        vm.cancelFunc_getMailCount = c;
                    })
                }).then(res => {
                    if (res.data.code === '1') {
                        const obj = {};
                        const stat = {};
                        // const edmStat = {};
                        const detailTemp = res.data.data.find(item => item.type === '2');
                        // const edmLine =  res.data.data.find(item => item.type === this.EDMEventCategory);
                        if (detailTemp && detailTemp.description) {
                            detailTemp.description.forEach(item => {
                                if (item.type === '2') {
                                    obj.receiveCount = item.totalCount;
                                } else {
                                    obj.sendCount = item.totalCount;
                                }
                            });
                            obj.totalCount = detailTemp.totalCount;
                            // obj.detail = detailTemp.detail;
                        }
                        if (detailTemp && detailTemp.detail) {
                            detailTemp.detail.map(i => {
                                const obj = {};
                                obj.name = i.typeName;
                                if (i.description && Array.isArray(i.description)) {
                                    i.description.map(i => {
                                        if (i.type === '2') {
                                            obj.receive = i.totalCount;
                                        }
                                        if (i.type === '1') {
                                            obj.send = i.totalCount;
                                        }
                                    });
                                    stat[i.type] = obj;
                                }
                            });
                        }
                        this.$emit('updateMailCount', obj);
                        this.$emit('update:countObj_mail', Object.assign({}, stat));
                        // if (edmLine && edmLine.detail) {
                        //     let totalCount = 0;
                        //     edmLine.detail.forEach(item =>{
                        //         const obj = {};
                        //         obj.name = item.typeName;
                        //         obj.totalCount = item.totalCount;
                        //         totalCount += item.totalCount;
                        //         if (obj.name && obj.type) {
                        //             edmStat[item.type] = obj;
                        //         }
                        //     })
                        //     this.$emit('updateEDMCount', totalCount);
                        //     this.$emit('update:countObjEDM', Object.assign({}, edmStat));
                        // }
                    }
                }).catch(err => {
                    if (err.message) {
                        this.$Message.error(this.$t('timeLine.timeLineSearchError'));
                    }
                });
            },

            /* 网站交互弹窗 */
            getVisitorAllInfoByEvent(item) {
                this.previewWebInfo = true;
                this.mergeInfoList = item.mergeList;
                this.visitorInfo = item.visitorInfo;
                this.itemInfo = item;
            },
            /* 邮件弹窗 */
            // 显示邮件弹窗
            getMailDetail(mail) {
                this.id_previewMail = mail.eventId;
                this.createUserId_previewMail = mail.eventCustomVar.createUserId;
                this.previewModel = true;
            },
            getMailDetailSubject(mail) {
                this.mailDetailMailEdit = mail.mailEdit;
                this.mailDetailId = mail.mailId;
                this.mailDetailCreateUserId = mail.eventCustomVar.createUserId;
                this.mailDetailReplyType = mail.replyType;
                this.replyMailVisible = true;
                // this.$nextTick(function() {
                //     this.$refs.replyMailModal.getDefaultSetting();
                // });
            },
            // 更改邮件状态为已读
            update_mail_readStatus() {
                let index = this.lineList.findIndex(item => item.eventId === this.id_previewMail);
                if (index !== -1 && !this.lineList[index].isRead) {
                    util.ajaxMailJson({
                        url: '/mail/mailReadFlag',
                        method: 'PUT',
                        data: {
                            orgId: this.enterpriseId,
                            ids: [this.id_previewMail],
                            mailReadFlag: 1,
                            updateUserId: this.userId,
                            updateUserName: this.userName
                        }
                    }).then(res => {
                        if (res.data.code === 1) {
                            index = this.lineList.findIndex(item => item.eventId === this.id_previewMail);
                            if (index !== -1) {
                                this.$set(this.lineList, index, Object.assign(this.lineList[index], { isRead: true }));
                            }

                            // 更新"新收邮件未读数统计数据", 从中剔除掉已读邮件
                            this.$store.commit('updateNewReceiveMails', {
                                type: 'removeRead',
                                data: [this.id_previewMail]
                            });
                        }
                    });
                }
            },
            confirm() {
                this.replyMailVisible = false;
            },
            // WhatsApp快速回复
            // 显示模态框
            // getWALoginAccount() {
            //     if (this.whatsAppAccountInfo) {
            //         this.checkedHasContact();
            //     } else {
            //         getWaUserBind({
            //             orgId: this.enterpriseId,
            //             userId: this.userId
            //         }).then(res => {
            //             if (res.code === 1) {
            //                 if (res.data[0]) {
            //                     this.whatsAppAccountInfo = res.data[0];
            //                     this.checkedHasContact();
            //                 } else {
            //                     this.whatsAppAccountInfo = null;
            //                     this.visibleReplyModal = true;
            //                 }
            //             }
            //         });
            //     }
            // },
            // 显示WatchApp快速回复弹框
            showReplyModal(item) {
                // 如果已显示回复框, 弹出提示并退出流程
                if (this.switchId && this.visibleReplyModal) {
                    this.$Message.error(this.$t('whatsapp_manage.timeLineWhatsAppAlreadyOpen'));
                    return;
                }

                // 否则正常显示
                this.talkObj = item;
                this.switchId = true;
                this.visibleReplyModal = true;
                // 做账号多开, 将外部的接口请求去掉, 只由回复框自己请求处理
                // this.getWALoginAccount();
            },
            // 显示企微快速回复框
            showWeChatReplyModal(item) {
                // 如果已显示回复框, 弹出提示并退出流程
                if (this.visibleWeChatReplyModal) {
                    this.$Message.error(this.$t('whatsapp_manage.timeLineWhatsAppAlreadyOpen'));
                    return;
                }

                // 否则正常显示
                this.talkWeChatObj = JSON.parse(item.eventCustomVar);
                this.visibleWeChatReplyModal = true;
                // 做账号多开, 将外部的接口请求去掉, 只由回复框自己请求处理
                // this.getWALoginAccount();
            },
            // 关闭企微快捷回复框
            closeQWreplay() {
                this.talkWeChatObj = null;
                this.visibleWeChatReplyModal = false;
            }
            // checkedHasContact() {
            //     // 暂存与"我"聊天的 WA 账号
            //     let contactWaAccount;
            //     if (`${this.talkObj.eventCustomVar.chatType}` === '1') {
            //         // 聊天方为"群组"
            //
            //         contactWaAccount = this.talkObj.eventCustomVar.toWaAccount;
            //     } else {
            //         // 聊天方为私人
            //
            //         contactWaAccount = this.talkObj.eventCustomVar.fromMe ? this.talkObj.eventCustomVar.toWaAccount : this.talkObj.eventCustomVar.fromWaAccount;
            //     }
            //
            //     // 发送请求
            //     util.ajaxInternationalJson({
            //         url: '/whatsapp/chatList/getOneChatList',
            //         method: 'POST',
            //         data: {
            //             orgId: this.enterpriseId,
            //             userId: this.userId,
            //             userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
            //             contactWaAccount
            //         }
            //     }).then(res => {
            //         if (res.data.code === 1) {
            //             this.visibleReplyModal = true;
            //         } else {
            //             this.$Message.error(this.$t('whatsapp_manage.timeLineWhatsAppNoPro'));
            //         }
            //     }).catch(error => {
            //         this.$Message.error(this.$t('whatsapp_manage.timeLineWhatsAppNoPro'));
            //     });
            // }
        },
        created() {},
        watch: {
            followUpType: {
                handler(val) {
                    if (val) {
                        this.arr_followupTypes = val;
                    }
                }
            },
            id: {
                handler(val) {
                    // id 变化, 重置时间轴数据
                    if (val) {
                        // 获取全部用户
                        this.$store.dispatch('getAllUsers');
                        this.refreshData();
                        // 关闭时间轴邮件弹窗
                        this.replyMailVisible = false;
                        // 关闭时间轴whatsAPP弹窗
                        this.visibleReplyModal = false;
                        // 切换id后重新加载whatsAPP快速回复组件
                        this.switchId = false;
                        // 切换id后重新加载wechat快速回复组件
                        this.visibleWeChatReplyModal = false;
                    }
                },
                immediate: true
            },
            // visitorId: {
            //     handler(val) {
            //         // id 变化, 重置时间轴数据
            //         if (val) {
            //             this.refreshData();
            //             // 关闭时间轴邮件弹窗
            //             this.replyMailVisible = false
            //             //关闭时间轴whatsAPP弹窗
            //             this.visibleReplyModal = false;
            //             //切换id后重新加载whatsAPP快速回复组件
            //             this.switchId = false;
            //         }
            //     },
            //     immediate: true
            // },
            currentTab() {
                // 指定要显示的时间轴分类变化, 重置时间轴数据
                this.refreshData();
            },
            group_mail(val) {
                // 邮件 tab 下拉筛选联系人时, 切换联系人不用请求邮件统计数字, 邮件搜索时用
                if (val !== 'all') {
                    this.isUpdateCount = false;
                }
            },
            // mailType(val) {
            //     if (val.length === 0) {
            //         // 如果收发信类型置空, 则马上改为全选
            //         this.$emit('update:mailType', [1, 2]);
            //     } else {
            //         // 邮件时间轴, 指定要显示的邮件联系人变化, 重置时间轴数据
            //         if (this.currentTab === 'Mail') {
            //             this.refreshData();
            //         }
            //     }
            // },
            // date() {
            //     // 时间筛选, 重置时间轴数据
            //     this.refreshData();
            // },
            // callType(val) {
            //     if (val.length === 0) {
            //         // 如果收发信类型置空, 则马上改为全选
            //         this.$emit('update:callType', [1, 2]);
            //     } else {
            //         if (this.currentTab === 'call') {
            //             this.refreshData();
            //         }
            //     }
            // },
            refreshFlag() {
                // 外部手动变更 refreshFlag , 重置时间轴数据
                this.refreshData();
            },
            clearFlag() {
                // 外部手动变更 clearFlag , 清空时间轴数据
                this.clearData();
            },
            flag(value) {
                if (value) {
                    // 外部手动变更 flag , 重置时间轴数据
                    this.refreshData();
                }
            },
            // publisher() {
            //     // 发布人筛选, 重置时间轴数据
            //     this.refreshData();
            // },
            // contactsName() {
            //     // 发布人筛选, 重置时间轴数据
            //     this.refreshData();
            // },
            // 解决偶现 BUG : 有时留言表单数据先于线索字段请求完. 导致处理表单数据时匹配线索字段失败, accessDetail 组件内表单不显示
            fieldObj(val) {
                if (val && Object.keys(val).length) {
                    // 网站交互条目特殊处理
                    if (this.lineList.find(item => item.eventCategory === '3')) {
                        // 如果有网站交互条目
                        this.lineList.forEach((line, index) => {
                            if (line.eventCategory === '3' && line.formList && line.formList.length) {
                                line.formList.forEach(element => {
                                    const fields = {};
                                    for (const key in element) {
                                        if (key.indexOf('a100') !== -1 && this.fieldObj[key]) {
                                            const formData = element[key];
                                            fields[key] = {
                                                type: this.fieldObj[key].type,
                                                label: this.fieldObj[key].name,
                                                value: formData
                                            };
                                        }
                                    }
                                    element.fields = fields;
                                });
                                this.handleInfo(line);
                            }
                        });
                    }
                }
            }
        },
        inject: ['wabaCurrentAccountInfo_provide']
    };
</script>

<style lang="less">
    @import './completeTimeLine.less';

    .timeline-no-more-tip {
        text-align: center;
        font-size: 12px;
    }
</style>

<style lang="less" scoped>
    .WABA-icon {
        position: absolute;
        bottom: 0;
        left: 28px;
        line-height: 0;
    }
</style>
