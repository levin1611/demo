<template>
    <!-- facebook收件箱 -->
    <div class="facebook-inbox">
        <Row>
            <!-- 左侧私信、评论列表 -->
            <Col :span="6" :style="{height:content_height,background:'#FAFCFF'}">
                <!-- toolbar -->
                <div class="facebook-inbox-toolbar" v-loading="brandPageLoading">
                    <!-- 当用户未绑定任何facebook账号时显示--'...去绑定' -->
                    <div v-if="allPageList.length===0" style="padding:0 0 12px;">
                        <span style="font-weight:bold;font-size:12px;line-height:32px;">
                            {{$t('facebook.inbox.bindPageTip')}}
                        </span>
                        <Button type="primary" style="float:right;" @click="goToBind">
                            {{$t('facebook.inbox.gotoBind')}}
                        </Button>
                    </div>
                    <!-- 当用户已绑定facebook账号时显示--选择主页下拉菜单 -->
                    <div class="toolbar-brand-page" v-else>
                        <div>
                            <span style="position: relative;vertical-align: middle;display: inline-block;cursor: pointer;" @click="getAvatar">
                                <Avatar :src="currentBrandPageAvatar" class="avatar-small" />
                                <svg
                                    class="svg-icon company-page-icon"
                                    aria-hidden="true"
                                    v-if="currentBrandPage.homePageType===1">
                                        <use xlink:href="#custom-facebook-company-page"></use>
                                </svg>
                            </span>
                            <!-- transfer transfer-class-name="facebook-inbox-page-dropdown"  @click="handlePageSelect" -->
                            <Dropdown trigger="click"
                                    @visible-change="handlePageVisible"
                                    @command="handlePageSelect($event)"
                                    placement="bottom-start">
                                <div class="brand-page-head">
                                    <div class="brand-page-name">
                                        {{currentBrandPageName}}
                                    </div>
                                    <Icon type="ios-arrow-down"></Icon>
                                </div>

                                <DropdownMenu
                                    slot="dropdown"
                                    style="width:350px;"
                                    class="brand-page-dropdown">
                                    <!-- :selected="brandPage.userId===currentBrandPage.userId" -->
                                    <DropdownItem v-for="brandPage in allPageList"
                                                :key="brandPage.userId"
                                                class="fbinbox-viewhomepage"
                                                :command="brandPage.userId"
                                                style="display:flex;align-items: center;">
                                        <!-- 检测token是否失效,1-有效 2-失效 -->
                                        <Row style="width:100%">
                                            <!-- 头像 -->
                                            <Col :span="3">
                                                <Badge :text="brandPage.access_status===1?'':$t('facebook.onekeyRelease.creatContent.invalid')">
                                                    <Avatar :src="brandPage.avatar" style="width: 30px; height: 30px;border-radius: 15px;" />
                                                    <svg class="svg-icon" style="position: absolute;bottom: 8px;right: 0;width:12px;" aria-hidden="true" v-if="brandPage.homePageType===1">
                                                        <use xlink:href="#custom-facebook-company-page"></use>
                                                    </svg>
                                                </Badge>
                                            </Col>
                                            <!-- 主页名 -->
                                            <Col :span="14">
                                                <Tooltip :content="brandPage.userName" transfer  style="margin:12px 8px" :disabled="!pageMenuVisible">
                                                    <span style="font-size: 12px;">{{brandPage.userName}}</span>
                                                </Tooltip>
                                            </Col>
                                            <!-- 未读数 -->
                                            <Col :span="4" style="padding-top:2px">
                                                <span v-show="(brandPage.access_status==1) && (brandPage.hasNewMessage || brandPage.unreadCount || brandPage.commentUnReadCount)" style="font-size: 12px;">
                                                    <!-- min-width: 46px;text-align:end -->
                                                    {{brandPage.unreadCount > 99 ? '99+' : brandPage.unreadCount }}/{{brandPage.commentUnReadCount > 99 ? '99+' : brandPage.commentUnReadCount}}
                                                </span>
                                            </Col>
                                            <!-- 已失效/去绑定 -->
                                            <Col :span="2" :offset="brandPage.hasNewMessage || brandPage.unreadCount || brandPage.commentUnReadCount? 1:5" style="padding-top:2px">
                                                <span v-show="brandPage.access_status!==1" class="invalid-tip" @click="goToBind">{{$t('facebook.onekeyRelease.creatContent.invalid')}}</span>
                                            </Col>
                                        </Row>
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>

                        <span v-show="currentBrandPageAccessStatus!==1" class="invalid-tip-hover" @click="goToBind">{{$t('facebook.onekeyRelease.creatContent.invalid')}}</span>
                        <span class="page-message-tip" v-if="fbChatUnread">{{$t('facebook.inbox.newMessage')}}</span>
                    </div>
                    <!-- 搜索框 -->
                    <Input v-model="searchInput" :placeholder="$t('facebook.inbox.inputKeyWords')" @keyup.enter.native="handleSearch" size="large">
                        <!-- 高级搜索气泡 -->
                        <Poptip v-model="searchPopShow" slot="append" placement="bottom-end" width="350" popper-class="facebook-inbox-poptip">
                            <Icon slot="reference" custom="custom custom-drop-down-triangle" size="8" style="cursor:pointer;"></Icon>
                            <div>
                                <div style="font-size: 14px;padding: 0px 0 16px 4px; font-weight: bold;">{{$t('inbox.advancedSearch')}}</div>
                                <Form ref="searchForm" :model="searchForm" label-width="42px">
                                    <!-- 日期 -->
                                    <FormItem :label="$t('crm.Html.date')" prop="date" >
                                        <DatePicker
                                            type="daterange"
                                            start-placeholder="开始日期"
                                            end-placeholder="结束日期"
                                            v-model="searchForm.date"
                                            style="width:100%;"
                                            transfer>
                                        </DatePicker>
                                    </FormItem>
                                    <!-- 备注 -->
                                    <FormItem :label="$t('crm.Html.remark')" prop="remark" v-show="currentTab==='fbChat'">
                                        <Input v-model="searchForm.remark" :placeholder="$t('chat.remarkPlaceholder')"></Input>
                                    </FormItem>
                                    <!-- 姓名 -->
                                    <FormItem :label="$t('portal_set.name')" prop="name">
                                        <Input v-model="searchForm.name" :placeholder="$t('placeholder.nameTip')"></Input>
                                    </FormItem>
                                    <!-- 客服 -->
                                    <FormItem :label="$t('serviceReport.service')"
                                              prop="service">
                                        <Select v-model="searchForm.service"
                                                filterable
                                                multiple
                                                size="small"
                                                style="width: 100%;">
                                            <Option v-for="item in fbServiceList"
                                                    :key="item.userId"
                                                    :value="item.userId"
                                                    :label="item.userName"></Option>
                                        </Select>
                                    </FormItem>
                                    <!-- 状态 -->
                                    <FormItem :label="$t('facebook.bindForm.fbstatus')" prop="checkAllGroup">
                                        <div style="display: flex;align-items: baseline;">
                                            <Checkbox
                                                :indeterminate="searchForm.indeterminate"
                                                :value="searchForm.checkAll"
                                                @click.prevent.native="handleCheckAllStatus">
                                                {{$t('filter_box.select_all')}}
                                            </Checkbox>
                                            <CheckboxGroup v-model="searchForm.checkAllGroup" @change="checkAllGroupChange" style="display:flex;flex-direction: column;margin-left: 20px;">
                                                <Checkbox style="line-height:22px; margin-bottom: 12px;" :label="item.key" v-for="item in statusList" :key="item.key">{{item.value}}</Checkbox>
                                            </CheckboxGroup>
                                        </div>
                                    </FormItem>
                                    <!-- 清空、搜索按钮 -->
                                    <FormItem style="text-align: right;margin-bottom: 0;">
                                        <Button type="minor" @click="handleSearchAdvancedClear">{{$t('filter_box.empty')}}</Button>
                                        <Button type="success" class="fbinbox-advancedsearch" style="margin-left: 8px" @click="handleSearchAdvanced">{{$t('traffic.search')}}</Button>
                                    </FormItem>
                                </Form>
                            </div>
                        </Poptip>
                        <Icon slot="append" class="fbinbox-keywordsearch" custom="custom custom-search" size="15" style="margin-left:10px;cursor:pointer;" @click.native="handleSearch" />
                    </Input>
                </div>
                <!-- 私信评论tab -->
                <Tabs size="small" :value="currentTab" v-model="currentTab" :animated="false" @tab-click="handleViewChange" class="inbox-tab">
                    <!-- 私信列表 -->
                    <TabPane name="fbChat" >
                        <div slot="label">
                            <Badge class="fbinbox-viewprivatemessage" :is-dot="fbChatAndCommentUnread ? fbChatAndCommentUnread.fbChatUnread > 0 : false">
                                    {{$t('facebook.inbox.chat')}}
                            </Badge>
                        </div>
                        <div v-if="!conversationLoading&&conversationList.length===0" class="empty-list">{{$t('facebook.inbox.noData')}}</div>
                        <Menu
                            v-else
                            ref="conversationMenu"
                            :active-name="currentConversationId"
                            v-loading="conversationLoading"
                            @select="beforeConversationSelect"
                            >
                            <!-- :style="{'height':`${scrollHeight}px`,'overflow':'auto'}"
                            v-infinite-scroll="handleLoadConversation"
                            :infinite-scroll-distance="10"
                            infinite-scroll-immediate="false" -->
                            <Scroll :on-reach-bottom="handleLoadConversation"
                                    :distance-to-edge="10"
                                    :height="scrollHeight"
                                    v-scroll-wheel:ivu-scroll-container="handleLoadConversation">
                                <MenuItem v-for="conversation in conversationList"
                                          :key="conversation.conversationId"
                                          :index="conversation.conversationId"
                                          class="Facebook-all-screen-item">
                                    <!-- 头像 -->
                                    <Badge :value="conversation.unreadCount" :hidden="conversation.unreadCount <= 0">
                                        <Avatar :src="conversation.conversationAvatar" class="avatar-large" />
                                    </Badge>

                                    <!-- 名称 备注 /换行/ 接待客服 -->
                                    <div style="line-height: 16px;">
                                        <!-- 名称 -->
                                        <Tooltip :content="conversation.conversationName"
                                                 transfer
                                                 class="conversation-name-tooltip">
                                            <span class="conversation-name">{{ conversation.conversationName | conversationNameFormat }}</span>
                                        </Tooltip>
                                        <!-- 备注 -->
                                        <Tooltip v-if="conversation.remark"
                                                 max-width="200"
                                                 :content="conversation.remark | conversationRemarkFormat"
                                                 transfer
                                                 class="conversation-name-tooltip">
                                            <span v-if="conversation.remark"
                                                  class="conversation-remark">{{ conversation.remark | conversationRemarkFormat }}</span>
                                        </Tooltip>
                                        <!-- 接待客服 -->
                                        <div class="conversation-customerService">
                                            <Tooltip v-if="conversation.userName"
                                                     :content="conversation.userName"
                                                     transfer>
                                                <span>
                                                    <!-- icon -->
                                                    <svg aria-hidden="true"
                                                         class="svg-icon">
                                                        <use xlink:href="#custom-customer-service"></use>
                                                    </svg>
                                                    <!-- service name -->
                                                    <span>{{ conversation.userName }}</span>
                                                </span>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <!-- 时间 + CRM 录入状态 -->
                                    <div>
                                        <span v-if="new Date(conversation.updateTime).toDateString()===new Date().toDateString()" class="conversation-time">{{conversation.updateTime | timeFormat("TimeHm")}}</span>
                                        <span v-else class="conversation-time">{{conversation.updateTime | timeFormat("DateTimeMd")}}</span>
                                        
                                        <!-- <span class="conversation-status" v-if="conversation.clue_status === 1">{{$t('chat.noEntry')}}</span>
                                        <span class="conversation-status" v-else-if="conversation.clue_status === 101">{{$t('chat.clue')}}</span>
                                        <span class="conversation-status" v-else-if="conversation.clue_status === 102">{{$t('chat.inquiries')}}</span>
                                        <span class="conversation-status" v-else>{{$t('chat.nothingWith')}}</span> -->
                                        <crmArchiveStatus class="conversation-status" size="small" :status="conversation.clue_status"></crmArchiveStatus>
                                    </div>
                                </MenuItem>
                            </Scroll>
                        </Menu>
                    </TabPane>
                    <!-- 评论列表 -->
                    <TabPane name="fbComment">
                        <div slot="label">
                            <Badge class="fbinbox-viewcomments" :is-dot="fbChatAndCommentUnread ? fbChatAndCommentUnread.fbCommentUnread > 0 : false">
                                    {{$t('facebook.inbox.comment')}}
                            </Badge>
                        </div>
                        <div v-if="!commentLoading&&commentList.length===0" class="empty-list">{{$t('facebook.inbox.noData')}}</div>
                        <Menu
                            v-else
                            ref="commentMenu"
                            :active-name="currentCommentorAndPostId"
                            v-loading="commentLoading"
                            @select="handleCommentSelect"
                          >
                            <!-- v-infinite-scroll="handleLoadComment"
                            :infinite-scroll-distance="10"
                            infinite-scroll-immediate="false"
                            :style="{'height':`${scrollHeight}px`,'overflow':'auto'}" -->
                            <Scroll :on-reach-bottom="handleLoadComment"
                                    :distance-to-edge="10"
                                    :height="scrollHeight"
                                    v-scroll-wheel:ivu-scroll-container="handleLoadComment">
                                <MenuItem class="Facebook-all-screen-item" v-for="comment in commentList" :index="comment.commentorAndPostId" :key="comment.id">
                                    <Badge :value="comment.unreadCount" :hidden="comment.unreadCount <= 0">
                                        <Avatar :src="comment.picture" class="avatar-large" />
                                    </Badge>
                                    <div class="comment-info">
                                        <p>{{comment.post_content}}</p>
                                        <p>{{comment.commentator_name}} : {{comment.recent_comment_content?comment.recent_comment_content:'[图片]'}}</p>
                                    </div>
                                    <div class="comment-time comment-info">
                                        <p v-if="new Date(comment.recent_comment_time).toDateString()===new Date().toDateString()">{{comment.recent_comment_time | timeFormat("TimeHm")}}</p>
                                        <p v-else>{{comment.recent_comment_time | timeFormat("DateTimeMd")}}</p>
                                        <p><crmArchiveStatus size="small" :status="comment.clue_status"></crmArchiveStatus></p>
                                    </div>
                                    
                                </MenuItem>
                            </Scroll>
                        </Menu>
                    </TabPane>
                </Tabs>
            </Col>
            <!-- 右侧聊天、询盘线索详情 -->
            <Col :span="locusSideStatus ? 11 : 18" :style="{height:content_height,border:'none'}">
                <!-- 无数据时显示 -->
                <div v-show="!chatShow&&noDataShow" class="empty-content">
                    <img src="../../../svg/no-data.svg" alt="">
                    <p style="font-size:12px;color:rgb(0,0,0,.4);margin-top:12px;">{{$t('facebook.homepagedynamic.noData')}}</p>
                </div>
                <!-- 聊天界面/询盘/线索详情 -->
                <fb-chat
                    ref="fbChat"
                    :key="currentConversationId?currentConversationId:'-1'"
                    v-show="chatShow"
                    :conversation-id="currentConversationId"
                    :conversation="currentConversation"
                    :page-avatar="currentBrandPageAvatar"
                    :nodealPageAvatar="currentNodealAvatar"
                    :currentNodealCoversationAvatar="currentNodealCoversationAvatar"
                    :page-id="currentBrandPageId"
                    :page-name="currentBrandPageName"
                    :binding-user-id="currentBrandPageUserId"
                    :let-chat-loading="letChatLoading"
                    :websocket-chat="websocketChat"
                    :currentBrandPage="currentBrandPage"
                    @handleSendMessage="handleSendMessage"
                    @updateConversationStatus="updateConversationClueStatus"
                    @updateConversationClueStatus="updateConversationClueStatus"
                    @updateRemark="handleUpdateRemark"
                    @updateCurrentConversation="updateCurrentConversation"
                    @changeChatCurrentStatus="updateConversationClueStatus"
                    @updateServiceInfo="updateServiceInfo">
                </fb-chat>
                <!-- 评论 -->
                <fb-comment
                    :key="currentCommentorAndPostId?currentCommentorAndPostId:'-2'"
                    v-show="commentShow"
                    :page-avatar="currentBrandPageAvatar"
                    :page-access-token="currentBrandPageAccessToken"
                    :commentor-and-post-id="currentCommentorAndPostId"
                    :commentator-name="currentCommentatorName"
                    :comment-and-post="currentCommentAndPost"
                    :currentCommentorId="currentCommentorId"
                    :binding-user-id="currentBrandPageUserId"
                    :page-id="currentBrandPageId"
                    :post-id="currentPostId"
                    :current-comment-id="currentCommentId"
                    :let-comment-loading="letCommentLoading"
                    :websocket-comment="websocketComment"
                    @updateCommentStatus="status=>commentList[currentCommentIndex].clue_status=status"
                    @updateCommentClueStatus="updateCommentClueStatus"
                    @updateCurrentCommentAndPost="updateCurrentCommentAndPost"
                    @changeCommentCurrentStatus="changeCommentCurrentStatus">
                </fb-comment>
            </Col>
          
        </Row>
        <!-- 绑定主页失效提示弹窗 -->
        <Modal
            :visible.sync="tokenModal"
            :modal-append-to-body="false"
            width="360px"
            :show-close="false"
            :close-on-click-modal="false">
                <p slot="title">
                    {{$t('inbox.accountfailTip')}}
                </p>
                <div style="text-align:center;margin-bottom: 10px;">
                {{$t('inbox.accountfailTip1')}}
                </div>
                <div slot="footer">
                    <Button @click="cancelBind">{{$t('cancel')}}</Button>
                    <Button type="primary" @click="goToBind">{{$t('facebook.inbox.gotoBind')}}</Button>
                </div>
        </Modal>

        <!-- 离开确认框 -->
        <Modal :visible.sync="showToggleChatConfirm"
               :title="$t('mail.leaveConfirm')"
               :close-on-click-modal="false"
               :modal-append-to-body="false"
               top="40vh"
               width="488px"
               @close="showToggleChatConfirm = false">
            <div>{{ $t('whatsapp_manage.toggleChatConfirmTip1') }}</div>

            <div slot="footer">
                <Button type="primary"
                        plain
                        @click="showToggleChatConfirm = false">{{ $t('cancel') }}</Button>
                <Button @click="(showToggleChatConfirm = false) || handleConversationSelect(toggleData)"
                        style="padding: 10px;"
                        type="primary">{{ $t('confirm') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import FbChat from './FbChat/FbChat';
    import FbComment from './FbComment/FbComment';
    import crmArchiveStatus from '@/views/main-components/crmArchiveStatus';
    import { fbCommon } from '@/api/facebook/index';

    const { getFbServiceList, getConversationList, getPictureUrlByPageId } = fbCommon;
  

    export default {
        name: 'Inbox',
        props: {
            content_height: {
                type: String,
                default: '800px'
            }
        },
        components: { FbChat, FbComment, crmArchiveStatus },
        data() {
            return {
                locusSideStatus: false,
                /** 加这两个属性的目的是，由于显示的头像都已经转成base64，但后续录入线索的时候需要这个参数
                 ***base64的话过长，后台不能存，所以用这两个属性来存原本的头像url
                 * */
                currentNodealAvatar: '',
                // 未经过处理(src 转 base64)的原始图片
                currentNodealCoversationAvatar: '',
                currentCommentorId: '',
                assosiateFbCommentorAndPostId: '',
                canGoToBind: false,

                // 主页数据
                brandPageLoading: true, // 主页toolbar加载图标
                pageMenuVisible: '', // 主页下拉菜单显示状态
                searchInput: '', // 搜索框
                searchPopShow: false, // 主页高级搜索气泡
                brandPageList: [],
                companyPageList: [],
                allPageList: [], // 当前用户绑定的全部主页
                currentBrandPage: {}, // 当前主页对象
                currentBrandPageId: '', // 当前主页ID
                currentBrandPageAvatar: '', // 当前主页头像
                currentBrandPageName: '', // 当前主页名称
                currentBrandPageAccessToken: '',
                currentBrandPageAccessStatus: 0,
                currentBrandPageUserId: '',

                searchForm: {
                    date: [],
                    remark: '',
                    name: '',
                    service: [],
                    indeterminate: false,
                    checkAll: false,
                    checkAllGroup: []
                },
                statusList: [
                    { value: this.$t('mail.untreatedDocumented'), key: 0 },
                    { value: this.$t('mail.clue'), key: 1 },
                    { value: this.$t('mail.contact'), key: 2 },
                    { value: this.$t('mail.customer'), key: 3 }
                    // { key: 1, value: this.$t('mail.untreatedDocumented') },
                    // { key: 2, value: this.$t('mail.my_leads') },
                    // { key: 3, value: this.$t('mail.public_leads') },
                    // { key: 4, value: this.$t('mail.other_leads') },
                    // { key: 5, value: this.$t('mail.myContact') },
                    // { key: 6, value: this.$t('mail.otherContact') },
                    // { key: 7, value: this.$t('mail.my_customers') },
                    // { key: 8, value: this.$t('mail.public_customers') },
                    // { key: 9, value: this.$t('mail.other_customers') }
                    // {
                    //     key: '1',
                    //     value: this.$t('chat.noEntry')
                    // },
                    // {
                    //     key: '2',
                    //     value: this.$t('chat.nothingWith')
                    // },
                    // {
                    //     key: '101',
                    //     value: this.$t('chat.clue')
                    // },
                    // {
                    //     key: '102',
                    //     value: this.$t('chat.inquiries')
                    // }
                ],
                pageSize: 20,
                currentTab: 'fbChat', // 默认显示私信视图
                conversationSearchData: {},
                commentSearchData: {},
                noDataShow: true, // 无数据提示

                // 会话数据
                chatShow: false,
                conversationLoading: false, // 会话列表loading图标
                conversationList: [], // 会话列表
                currentConversation: {},
                currentConversationId: '',
                conversationPage: 1, // 当前会话列表第一页
                letChatLoading: false,
                websocketChat: {},

                // 评论数据
                commentShow: false,
                commentLoading: false, // 评论列表loading图标
                commentList: [], // 评论列表
                commentPage: 1, // 当前评论列表第一页
                currentCommentorAndPostId: '',
                currentPostId: '',
                currentCommentAndPost: {},
                currentCommentatorName: '',
                currentCommentId: '',
                currentCommentIndex: -1,
                letCommentLoading: false,
                websocketComment: {},
                fbCommentUnread: 0,
                tokenModal: false, // 绑定主页失效提示弹窗
                visitorList: [],
                locusStatus: false,

                // 用户切换会话时，若存在未发送的附件列表，需要进行离开确认
                showToggleChatConfirm: false,
                toggleData: '',

                // 延时获取 FB 主页列表计时器 id(避免 isFbService 还未请求完毕就请求主页列表, 导致显示的主页列表有误)
                getBrandPageTimer: null
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                fullName: 'fullName',
                isFbService: state => state.isFbService,
                websocketMsgFB: state => state.facebook.websocketMsgFB,
                menu_list: state => state.app.menu_list,
                fbChatUnread: state => state.facebook.fbChatUnread,
                fbServiceList: state => state.facebook.fbServiceList,
                fbJumpConversationData: state => state.facebook.fbJumpConversationData,
                hadSetIsFbService: state => state.hadSetIsFbService,
                chatVerbalList: 'chatVerbalList',
                commentVerbalList: 'commentVerbalList',
                verbalInfo: 'verbalInfo'
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            scrollHeight() {
                return parseInt(this.content_height) - 205;
            },
            fbChatAndCommentUnread() {
                const res = this.allPageList.filter(item => item.userName === this.currentBrandPageName)[0];
                if (res) {
                    return { fbChatUnread: res.unreadCount, fbCommentUnread: res.commentUnReadCount };
                }
                return {};
            }
        },
        filters: {
            conversationNameFormat(name) {
                return name;
            },
            conversationRemarkFormat(remark) {
                return remark;
            }
        },
        methods: {
            // 获取主页的头像
            getAvatar() {
                getPictureUrlByPageId({
                    pageId: this.currentBrandPageId
                }).then(res => {
                    if (res.code === '1' && res.data && res.data.pictureUrl) {
                        // 更换头像的url
                        this.currentBrandPage.avatar = res.data.pictureUrl;
                        this.currentBrandPageAvatar = res.data.pictureUrl;
                    }
                });
            },
            // 获取facebook 和 主页关联关系
            // async getLocusSideStatus() {
            //     util.ajaxInternationalJson({
            //         url: `/visitor-chat/associate/relation/message/${this.currentConversationId}`,
            //         method: 'get'
            //     }).then(res => {
            //         if (res.data.length > 0) {
            //             this.locusSideStatus = true;
            //             this.visitorList = res.data.map(item => ({
            //                 key: item.visitorId,
            //                 value: item.visitorName
            //             }));
            //             // this.visitorList = [
            //             //     {
            //             //         key: '10110FK2020120310410651617',
            //             //         value: '未知3'
            //             //     },
            //             //     {
            //             //         key: '10110FK202006021957UB3A3a',
            //             //         value: '未知4'
            //             //     }
            //             // ]
            //         } else {
            //             this.locusSideStatus = false;
            //             this.visitorList = [];
            //         }
            //     })
            // },
            changeCommentCurrentStatus(status) {
                this.commentList[this.currentCommentIndex].clue_status = status;
            },
            updateConversationClueStatus(status) {
                this.currentConversation.clue_status = status;
            },
            updateCommentClueStatus(status) {
                this.commentList[this.currentCommentIndex].clue_status = status;
            },
            // “去绑定”
            goToBind() {
                this.tokenModal = false;
                if (this.canGoToBind) {
                    // this.$router.push({
                    //     name: 'account_binding'
                    // });
                    window.open('#/systemSettings/facebookBinding/account_binding', '_blank');
                } else {
                    // ？？
                    this.$Message.warning(this.$t('inbox.tip'));
                }
            },
            // 取消绑定
            cancelBind() {
                this.tokenModal = false;
            },
            // 获取公共主页列表
            getBrandPage(pageId, conversationId) {
                /**
                 * @Description: 为避免 isFBService 请求完毕之前就获取主页列表(在 FB 收件箱页面刷新偶现), 导致有公司主页客服权限的也不显示公司主页, 此处加上延时请求逻辑
                 * Main.vue 请求 FB 主页客服完毕后, 此处再请求主页列表
                 * 之后再看当前页面要不要也请求一次公司主页客服
                 * @author 汤一飞
                 * @date 2022/8/18
                 */
                // 如果延时请求期间又有重复请求, 去掉之前的延时请求计时器, 避免重复请求
                if (this.getBrandPageTimer) {
                    clearTimeout(this.getBrandPageTimer);
                    this.getBrandPageTimer = null;
                }
                // 如果还未请求完毕 isFBService , 延时请求接口, 停止向下执行
                // if (!this.hadSetIsFbService) {
                //     this.getBrandPageTimer = setTimeout(() => {
                //         // 到时间后删除旧计时器 id
                //         this.getBrandPageTimer = null;
                //         // 重新请求主页列表
                //         this.getBrandPage(pageId, conversationId);
                //     }, 50);

                //     // 停止向下执行
                //     return;
                // }
                this.brandPageLoading = true;
                this.companyPageList = [];
                this.brandPageList = [];
                this.allPageList = [];
                util.ajaxInternational({
                    url: '/social/getBrandPage',
                    method: 'post',
                    data: {
                        userId: this.userId,
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    this.brandPageLoading = false;
                    if (response.data.code === '1' && response.data.data.length) {
                        let dataList = response.data.data;
                        this.dealBrandPic(dataList); // 该方法貌似调用失败
                        dataList = dataList.map(item => {
                            item.hasNewMessage = 0;
                            return item;
                        });
                        for (const item of dataList) {
                            // homePageType为1是公司主页
                            if (item.homePageType === 1) {
                                this.companyPageList.push(item);
                            } else {
                                this.brandPageList.push(item);
                            }
                        }
                        if (this.isFbService) {
                            this.allPageList = this.companyPageList.concat(this.brandPageList);
                        } else {
                            this.allPageList = this.brandPageList;
                        }

                        /* 计算要打开的主页的 index */
                        // 暂存要自动选中的主页的 index , 默认为列表中首个主页
                        let index = 0;
                        // 但如果传入"打开指定主页"数据, 则需要打开该主页
                        let flag = false;
                        if (pageId && conversationId) {
                            const tmpIndex = this.allPageList.findIndex(item => `${item.userId}` === `${pageId}`);

                            if (tmpIndex !== -1) {
                                // flag 置为 true , 之后不需要走"打开主页指定会话"的逻辑
                                flag = true;

                                // index 重新赋值为指定主页的 index
                                index = tmpIndex;
                            } else {
                                this.$Message.error(this.$t('inbox.fbPageAccessStatusTip'));
                                console.error(`未找到对应主页, 无法切换, 传入 pageId 为: ${pageId}`);
                            }
                        }

                        if (this.allPageList.length > 0) {
                            // 自动选中之前计算得到的主页
                            this.handlePageSelect(this.allPageList[index].userId, flag);

                            // 打开当前主页指定会话
                            if (flag) {
                                this.handleOpenConversation(conversationId);
                            }
                        } else {
                            this.commentShow = false;
                            this.chatShow = false;
                            this.noDataShow = true;
                        }
                        this.getFacebookUnread();
                    }
                });
            },
            // 获取 FB 客服列表(更新 Vuex 变量用)
            updateFbServiceList() {
                getFbServiceList({
                    orgId: this.enterpriseId
                }).then(res => {
                    if (res.code === '1') {
                        const canFbManage = res.data.find(item => item.userId === Number(this.userId));
                        if (canFbManage) {
                            this.$store.commit('setIsFbService', true);
                        }
                        this.$store.commit('setFbServiceList', Array.isArray(res.data) ? res.data : []);
                    } else {
                        this.$Message.error(this.$t('fbDistribution.error_getFbServiceList'));
                    }
                    // 请求主页 + 对话, 如果有跳转带过来的参数, 传入参数等待后续处理
                    this.getBrandPage(this.fbJumpConversationData.pageId, this.fbJumpConversationData.conversationId);
                });
            },
            // 获取消息未读数
            getFacebookUnread() {
                const pageIds = [];
                for (const item of this.allPageList) {
                    if (item.access_status === 1) { pageIds.push(item.userId); }
                }
                util.ajaxInternationalJson({
                    url: '/social/getPagesUnreadConversations',
                    method: 'post',
                    data: {
                        currentUserId: this.userId,
                        pageIds: pageIds
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const dataList = response.data.data;
                        let sum = 0;
                        for (const item of dataList) {
                            sum += item.unreadCount;
                        }
                        this.$store.commit('setFbChatUnread', sum);
                    }
                });
            },
            // 选中主页
            handlePageSelect(name, isJumping) {
                const matched = this.allPageList.some(item => {
                    if (item.userId === name) {
                        // loading
                        this.conversationLoading = true;
                        this.commentLoading = true;
                        this.letChatLoading = true;
                        this.letCommentLoading = true;

                        // 设置主页
                        item.hasNewMessage = 0;
                        this.currentBrandPageId = name;
                        this.currentBrandPage = item;
                        this.currentBrandPageAvatar = item.avatar;
                        this.currentBrandPageName = item.userName;
                        this.currentBrandPageAccessToken = item.accessToken;
                        this.currentBrandPageAccessStatus = item.access_status;
                        this.currentBrandPageUserId = item.bindingUserId;
                        this.currentNodealAvatar = item.originalAvatar;

                        // 需要清空数据
                        this.conversationList = [];
                        this.conversationPage = 1;
                        this.commentList = [];
                        this.commentPage = 1;
                        this.currentConversation = {};
                        this.currentConversationId = '';
                        this.handleSearchAdvancedClear();
                        this.searchInput = '';
                        this.conversationSearchData = {};
                        this.commentSearchData = {};
                        this.noDataShow = false;

                        // 数据请求
                        if (this.currentBrandPageAccessStatus === 1) {
                            this.getPageConversations(isJumping);
                            this.getPageComments();
                        } else {
                            /**
                             * @Date: 2020-06-03 17:04:03
                             * @LastEditors: niumkiki
                             * @description: 主页失效, 弹出主页失效提醒，去掉loading, 左上交主页后边显示'失效'按钮，右侧弹窗浮层下边显示暂无数据，
                             * @param :
                             * @return:
                             */
                            this.commentShow = false;
                            this.tokenModal = true;
                            this.chatShow = false;
                            this.noDataShow = true;
                            this.conversationLoading = false;
                            this.commentLoading = false;
                            this.letChatLoading = false;
                            this.letCommentLoading = false;
                        }

                        // 已选中, 退出循环
                        return true;
                    }
                });

                if (!matched) {
                    // 主页列表中未找到传入的主页, 弹出提示

                    this.$Message.error(this.$t('inbox.fbPageAccessStatusTip'));
                }
            },
            // 切换私信/评论视图
            handleViewChange(obj) {
                this.currentTab = obj.name;
                if (obj.name === 'fbChat') {
                    this.$store.commit('setCommentVerbalInfo', []);
                    this.$store.commit('setCommentSecondVerbalInfo', []);
                    this.$store.state.commentVerbalList = false;
                    if (this.conversationList.length > 0) {
                        this.chatShow = true;
                        this.commentShow = false;
                        this.noDataShow = false;
                    } else {
                        this.chatShow = false;
                        this.commentShow = false;
                        this.noDataShow = true;
                    }
                } else {
                    this.$store.commit('updateChatVerbalInfo', []);
                    this.$store.state.chatVerbalList = false;
                    if (this.commentList.length > 0) {
                        this.commentShow = true;
                        this.chatShow = false;
                        this.noDataShow = false;
                    } else {
                        this.commentShow = false;
                        this.chatShow = false;
                        this.noDataShow = true;
                    }
                }
            },
            // 获取会话列表
            getPageConversations(noAutoSelect) {
                this.conversationLoading = true;
                let ajaxData = {
                    orgId: this.enterpriseId,
                    currentUserId: this.userId,
                    pageId: this.currentBrandPageId,
                    pageNo: this.conversationPage,
                    pageSize: this.pageSize
                };
                for (const label in this.conversationSearchData) {
                    if (this.conversationSearchData[label]) {
                        ajaxData = {
                            ...ajaxData,
                            [label]: this.conversationSearchData[label]
                        };
                    }
                }

                getConversationList(ajaxData).then(res => {
                    this.conversationLoading = false;
                    if (res.code === '1') {
                        // 数据处理
                        const resList = (res.data && Array.isArray(res.data.list)) ? res.data.list : [];
                        this.conversationList = this.handleConversationList(resList);

                        if (this.conversationPage === 1) {
                            if (this.conversationList.length > 0) {
                                // 如果没有显示传入"不需要自动选中"参数, 就自动选中第一个对话
                                if (!noAutoSelect) {
                                    this.handleConversationSelect(this.conversationList[0].conversationId);
                                    // this.$nextTick(() => {
                                    //     this.$refs.conversationMenu.updateActiveName();
                                    // });
                                }
                            } else {
                                if (this.currentTab === 'fbChat') {
                                    this.noDataShow = true;
                                    this.chatShow = false;
                                }
                            }
                        } else {
                            // 请求返回数据为空

                            if (resList.length === 0) {
                                this.$Message.info(this.$t('facebook.inbox.noMoreMessage'));
                                this.conversationPage -= 1;
                            }
                        }
                    } else {
                        // 请求失败

                        this.$Message.error(this.$t('crm.Table.errorOccurred'));
                        this.conversationPage -= 1;
                    }
                }).catch(e => {
                    // 请求失败

                    this.conversationLoading = false;
                    this.$Message.error(this.$t('crm.Table.errorOccurred'));
                    this.conversationPage -= 1;
                });
            },
            // 处理请求得到的对话列表数据
            handleConversationList(arr) {
                // 首先处理会话头像, 将 url 转换为 base64 字符串
                this.dealConversationPic(arr);

                // 暂存结果
                let result = this.conversationList.concat(arr);

                // 去重(此处要求后请求到的数据覆盖前面的数据)
                const temp = new Map();
                result.forEach(item => {
                    item.userId = item.userId || null;
                    item.userName = item.userName || '';
                    temp.set(item.conversationId, item);
                });
                result = [...temp.values()];

                // 返回数据
                return result;
            },
            // 打开指定主页的指定会话
            openPageAndConversation(data) {
                // 解构数据
                const { pageId, conversationId } = data;

                // 从当前主页列表中筛出与传入数据 pageId 一致的主页
                const fbPage = this.allPageList.find(item => `${item.userId}` === `${pageId}`);

                if (!fbPage) {
                    // 如果当前没有匹配主页, 请求接口更新主页列表(其内部新增逻辑, 如果请求完有匹配, 则打开指定会话, 如果请求完还没有, 则进入正常流程, 忽略跳转)
                    this.getBrandPage(pageId, conversationId);
                } else {
                    // 如果当前主页与传入数据 pageId 不一致, 则手动选中
                    if (`${pageId}` !== `${this.currentBrandPageId}`) {
                        this.handlePageSelect(pageId, true);
                    }

                    // 打开当前主页指定会话
                    this.handleOpenConversation(conversationId);
                }
            },
            // "打开指定会话"流程, 在打开指定主页后调用
            handleOpenConversation(conversationId) {
                // 选中主页逻辑中有判断此条件, 未通过则不请求会话和评论, 此处参照该逻辑也加上这个判断
                if (this.currentBrandPageAccessStatus === 1) {
                    // 从当前会话列表中筛出与传入数据 conversationId 一致的会话(此时也有可能是刚刚切换主页, 还未请求列表完毕, 列表为空)
                    const fbConversation = this.conversationList.find(item => `${item.conversationId}` === `${conversationId}`);

                    if (!fbConversation) {
                        // 单独请求 conversationId 对应的会话, 加入到列表中

                        // 发消息对象在会话列表中不存在，添加这条会话到列表中
                        getConversationList({
                            orgId: this.enterpriseId,
                            currentUserId: this.userId,
                            pageId: this.currentBrandPageId,
                            pageNo: 1,
                            pageSize: 10,
                            conversationIds: [conversationId].join(',')
                        }).then(res => {
                            // 再次判断当前会话列表中是否已存在会话
                            const fbConversationIndex = this.conversationList.findIndex(item => `${item.conversationId}` === `${conversationId}`);

                            if (fbConversationIndex === -1) {
                                if (res.code === '1' && res.data.list.length) {
                                    // 拼接数据
                                    let result = this.handleConversationList(res.data.list);

                                    // 将 conversationId 对应会话移到首项
                                    const tmpIndex = result.findIndex(item => `${item.conversationId}` === `${conversationId}`);
                                    result = result.splice(tmpIndex, 1).concat(result);

                                    // 更新会话列表
                                    this.conversationList = result;

                                    // 选中对话
                                    this.handleConversationSelect(conversationId);
                                } else {
                                    // 未请求到会话, 弹出错误提示
                                    this.$Message.error(this.$t('inbox.noThisConversationTip'));
                                }
                            } else {
                                // 如果当前会话与传入数据 conversationId 不一致, 则手动选中
                                if (`${conversationId}` !== `${this.currentConversationId}`) {
                                    this.handleConversationSelect(conversationId);
                                }
                            }
                        });
                    } else {
                        // 如果当前会话与传入数据 conversationId 不一致, 则手动选中
                        if (`${conversationId}` !== `${this.currentConversationId}`) {
                            this.handleConversationSelect(conversationId);
                        }
                    }
                } else {
                    // 主页已失效, 不请求会话列表, 无法打开指定会话, 弹出提示

                    this.$Message.error(this.$t('inbox.fbPageAccessStatusTip'));
                }
            },
            // 会话列表滚动加载下一页
            handleLoadConversation() {
                // 正在请求, 不往下执行, 避免重复请求
                if (this.conversationLoading) {
                    return;
                }

                // 请求下一页
                this.conversationPage += 1;
                this.getPageConversations();
            },
            beforeConversationSelect(name) {
                if (this.$refs.fbChat && this.$refs.fbChat.$refs.chatBox && this.$refs.fbChat.$refs.chatBox.fileList.length) {
                    this.toggleData = name;
                    this.showToggleChatConfirm = true;
                } else {
                    this.handleConversationSelect(name);
                }
            },
            // 选中会话
            handleConversationSelect(name) {
                console.log('handleConversationSelect', name);
                /**
                 * @Description: 由于FB的API策略更改，Messenger功能取消。此处注释掉相关接口调用，避免接口报404
                 * @author 杨娣
                 * @date 2020/4/27
                */
                // util.ajax({
                //     url: '/crm/messenger/updateUnread',
                //     method: 'put',
                //     params: {
                //         orgId: this.enterpriseId,
                //         userId: this.userId,
                //         senderId: name
                //     }
                // });
                this.$store.state.chatVerbalList = false;
                this.$store.commit('setFbChatEmailAutoAssociate', false);
                // this.getLocusSideStatus();
                // this.$refs.fbChat.getLocusSideStatus();

                const matched = this.conversationList.some(item => {
                    if (item.conversationId === name) {
                        this.locusStatus = true;
                        if (this.currentTab === 'fbChat') {
                            this.chatShow = true;
                            this.commentShow = false;
                            this.noDataShow = false;
                        }
                        this.letChatLoading = false;
                        this.letCommentLoading = false;

                        // 更新选中会话
                        this.currentConversationId = name;
                        // fb会话添加头像属性
                        item.conversationAvatar = item.conversationAvatar || '';
                        this.currentConversation = item;
                        this.currentNodealCoversationAvatar = item.originalAvatar;

                        // 更新对话接待客服信息
                        this.updateServiceInfo(this.currentConversationId);

                        // 更新会话, 主页未读数
                        const prevUnreadCount = item.unreadCount;
                        item.unreadCount = 0;
                        this.updateConversationUnread(this.currentBrandPageId, prevUnreadCount);

                        // 退出循环
                        return true;
                    }
                });

                if (!matched) {
                    // 没有匹配会话, 弹出错误提示
                    this.$Message.error(this.$t('inbox.noThisConversationTip'));
                }
            },
            // 获取 conversationId 最新信息, 用以更新其接待客服显示
            updateServiceInfo(conversationId) {
                getConversationList({
                    orgId: this.enterpriseId,
                    currentUserId: this.userId,
                    pageId: this.currentBrandPageId,
                    pageNo: 1,
                    pageSize: 10,
                    conversationIds: [conversationId].join(',')
                }).then(res => {
                    if (res.code === '1') {
                        // 再次判断当前会话列表中是否已存在会话
                        const fbConversation = this.conversationList.find(item => `${item.conversationId}` === `${conversationId}`);
                        if (fbConversation) {
                            const dataList = res.data.list;

                            if (dataList.length) {
                                const tempData = dataList[0];
                                fbConversation.userId = tempData.userId;
                                fbConversation.userName = tempData.userName;
                            }
                        }
                    }
                });
            },
            // 更新备注
            handleUpdateRemark(data) {
                this.$set(this.currentConversation, 'remark', data);
            },
            // 更新会话未读消息条数
            updateConversationUnread(currentPageId, prevUnreadCount) {
                util.ajaxInternational({
                    url: '/social/updateConversationUnreadStatusByConversationId',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        pageId: this.currentBrandPageId,
                        currentUserId: this.userId,
                        conversationId: this.currentConversationId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        if (this.fbChatUnread > 0) {
                            this.$store.commit('setFbChatUnread', this.fbChatUnread - prevUnreadCount);
                        }
                        /* 当前会话由未读变已读，应当在下拉菜单中更改相应的未读数 */
                        this.updateBrandePage(currentPageId, false, prevUnreadCount);
                    }
                });
            },
            // 更新公共主页列表未读数
            updateBrandePage(PageId, flag, prevUnreadCount) {
                /* flag--当前未读数是增加 or 减少 false--减少  true--增加 */
                /* PageId--需要改变未读数的主页id */
                this.allPageList.some(item => {
                    if (item.userId === PageId) {
                        if (flag) {
                            // 收到新消息

                            // 未读数加
                            item.unreadCount += 1;
                        } else {
                            // 点击会话变为已读, 减去相应未对数
                            item.unreadCount -= prevUnreadCount;
                            item.unreadCount = item.unreadCount < 0 ? 0 : item.unreadCount;
                        }

                        // 退出循环
                        return true;
                    }
                });
            },
            // 将图片url转成base64的接口
            getPostsPicturesUrl(post) {
                return new Promise((resolve, reject) => {
                    util.ajaxInternational({
                        url: '/social/getPictureUrl',
                        method: 'post',
                        data: {
                            link: post
                        }
                    }).then(response => {
                        if (response.data.code === 1) {
                            resolve(response.data.data[0]);
                        }
                    });
                });
            },
            // 将fb图片的url处理成base64
            async dealPic(list) {
                const arr = [];
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    // 因为评论列表中可能存在重复的，所以重复的只请求一次就可以了
                    if (item.picture) {
                        if (arr[item.commentator_id]) {
                            item.picture = arr[item.commentator_id];
                        } else {
                            const getPicture = await this.getPostsPicturesUrl(item.picture);
                            item.picture = getPicture;
                            arr[item.commentator_id] = getPicture;
                        }
                    }
                }
            },
            // 处理左上角公共主页头像
            async dealBrandPic(dataList) {
                for (let i = 0; i < dataList.length; i++) {
                    const temp = dataList[i];
                    temp.originalAvatar = temp.avatar;
                    temp.avatar = await this.getPostsPicturesUrl(temp.avatar);
                }
            },
            // 处理私信头像
            async dealConversationPic(dataList) {
                for (let i = 0; i < dataList.length; i++) {
                    const tempObj = dataList[i];

                    // 之前已经处理过的头像, 不用重复处理
                    if (!Object.prototype.hasOwnProperty.call(tempObj, 'originalAvatar')) {
                        tempObj.originalAvatar = tempObj.conversationAvatar;
                        tempObj.conversationAvatar = await this.getPostsPicturesUrl(tempObj.conversationAvatar);
                    }
                }
            },
            // 获取评论列表
            getPageComments() {
                this.commentLoading = true;
                let ajaxData = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    pageId: this.currentBrandPageId,
                    pageNo: this.commentPage,
                    pageSize: this.pageSize
                };
                for (const label in this.commentSearchData) {
                    if (this.commentSearchData[label]) {
                        ajaxData = {
                            ...ajaxData,
                            [label]: this.commentSearchData[label]
                        };
                    }
                }
                util.ajaxInternational({
                    url: '/social/getPageComments',
                    method: 'post',
                    params: ajaxData
                }).then(({ data }) => {
                    this.commentLoading = false;
                    if (data.code === '1') {
                        const list = data.data && Array.isArray(data.data.list) ? data.data.list : [];
                        this.dealPic(list);
                        const dataList = list;
                        this.commentList = this.commentList.concat(dataList);
                        if (this.commentPage === 1) {
                            if (this.commentList.length > 0) {
                                this.handleCommentSelect(this.commentList[0].commentorAndPostId);
                                // this.$nextTick(() => {
                                //     this.$refs.commentMenu.updateActiveName();
                                // });
                            } else {
                                if (this.currentTab === 'fbComment') {
                                    this.noDataShow = true;
                                    this.commentShow = false;
                                }
                            }
                        } else {
                            if (dataList.length === 0) {
                                this.$Message.info(this.$t('facebook.inbox.noMoreComment'));
                                this.commentPage -= 1;
                            }
                        }
                    } else {
                        // 请求失败

                        this.$Message.error(this.$t('crm.Table.errorOccurred'));
                        this.commentPage -= 1;
                    }
                }).catch(e => {
                    // 请求失败

                    this.commentLoading = false;
                    this.$Message.error(this.$t('crm.Table.errorOccurred'));
                    this.commentPage -= 1;
                });
            },
            // 选中评论
            handleCommentSelect(name) {
                this.$store.state.commentVerbalList = false;
                this.currentCommentorAndPostId = name;
                if (this.currentTab === 'fbComment') {
                    this.commentShow = true;
                    this.chatShow = false;
                    this.noDataShow = false;
                }
                this.letChatLoading = false;
                this.letCommentLoading = false;
                this.commentList.forEach((item, index) => {
                    if (item.commentorAndPostId === name) {
                        this.currentPostId = item.post_id;
                        this.currentCommentatorName = item.commentator_name;
                        this.currentCommentId = item.comment_id;
                        this.currentCommentAndPost = item;
                        this.currentCommentIndex = index;
                        this.currentCommentorId = item.commentator_id;
                        const readCount = item.unreadCount;
                        this.allPageList.forEach((item) => {
                            if (item.userId === this.currentBrandPageId) {
                                item.commentUnReadCount -= readCount;
                                if (item.commentUnReadCount < 0) {
                                    item.commentUnReadCount = 0;
                                }
                            }
                        });
                        item.unreadCount = 0;
                    }
                });
                this.updateCommentUnread();
            },
            // 更新评论未读数
            updateCommentUnread() {
                util.ajaxInternational({
                    url: '/social/updateCommentUnreadStatusByPostId',
                    method: 'get',
                    params: {
                        postId: this.currentPostId
                    }
                });
            },
            // 评论列表滚动加载下一页
            handleLoadComment() {
                // 正在请求, 不往下执行, 避免重复请求
                if (this.commentLoading) {
                    return;
                }

                // 请求下一页
                this.commentPage += 1;
                this.getPageComments();
            },
            // 高级搜索状态全选/取消全选
            handleCheckAllStatus() {
                if (this.searchForm.indeterminate) {
                    this.searchForm.checkAll = false;
                } else {
                    this.searchForm.checkAll = !this.searchForm.checkAll;
                }
                this.searchForm.indeterminate = false;
                if (this.searchForm.checkAll) {
                    this.searchForm.checkAllGroup = [0, 1, 2, 3];
                } else {
                    this.searchForm.checkAllGroup = [];
                }
            },
            // 高级搜索状态选项改变时触发
            checkAllGroupChange(data) {
                if (data.length === this.statusList.length) {
                    this.searchForm.indeterminate = false;
                    this.searchForm.checkAll = true;
                } else if (data.length > 0) {
                    this.searchForm.indeterminate = true;
                    this.searchForm.checkAll = false;
                } else {
                    this.searchForm.indeterminate = false;
                    this.searchForm.checkAll = false;
                }
            },
            // 搜索
            handleSearch() {
                // 需要清空会话数据
                this.conversationList = [];
                this.conversationPage = 1;
                this.commentList = [];
                this.commentPage = 1;
                this.conversationSearchData = {
                    conversationName: this.searchInput
                };
                this.commentSearchData = {
                    commentatorName: this.searchInput
                };
                this.getPageConversations();
                this.getPageComments();
            },
            // 高级搜索
            handleSearchAdvanced() {
                // 需要清空会话数据
                this.conversationList = [];
                this.conversationPage = 1;
                this.commentList = [];
                this.commentPage = 1;

                this.conversationSearchData = {
                    startDate: Array.isArray(this.searchForm.date) ? this.$options.filters.timeFormat(this.searchForm.date[0]) : '',
                    endDate: Array.isArray(this.searchForm.date) ? this.$options.filters.timeFormat(this.searchForm.date[1]) : '',
                    remark: this.searchForm.remark,
                    conversationName: this.searchForm.name,
                    userIds: this.searchForm.service.join(','),
                    status: this.searchForm.checkAllGroup.join(',')
                };
                this.commentSearchData = {
                    startDate: Array.isArray(this.searchForm.date) ? this.$options.filters.timeFormat(this.searchForm.date[0]) : '',
                    endDate: Array.isArray(this.searchForm.date) ? this.$options.filters.timeFormat(this.searchForm.date[1]) : '',
                    commentatorName: this.searchForm.name,
                    status: this.searchForm.checkAllGroup.join(',')
                };

                this.getPageConversations();
                this.getPageComments();
                this.searchPopShow = false;
            },
            // 清空搜索数据
            handleSearchAdvancedClear() {
                this.$refs.searchForm.resetFields();
                this.searchForm.checkAll = false;
                this.searchForm.indeterminate = false;
            },
            // 主动发送消息会话列表顺序改变
            handleSendMessage(val) {
                this.currentConversation.updateTime = val;
                this.conversationList = [this.currentConversation, ...this.conversationList.filter(item => `${item.conversationId}` !== `${this.currentConversation.conversationId}`)];
            },
            // 下拉菜单显示状态改变
            handlePageVisible(visible) {
                this.pageMenuVisible = visible;
            },
            /* 右侧聊天窗口录入线索后，更新当前选中的会话的clueId */
            updateCurrentConversation(clueId) {
                if (!this.currentConversation.clue_id) {
                    this.$set(this.currentConversation, 'clue_id', clueId);
                }
            },
            /* 右侧帖子详情页录入线索后，更新当前选中的评论和帖子的clueId */
            updateCurrentCommentAndPost(clueId) {
                if (!this.currentCommentAndPost.clue_id) {
                    this.currentCommentAndPost.clue_id = clueId;
                    this.commentList[this.currentCommentIndex] = this.currentCommentAndPost;
                }
            }
        },
        created() {
            // 请求 FB 主页客服
            this.updateFbServiceList();
            this.canGoToBind = this.isContainsMenu('account_binding');
        },
        mounted() {
            // document.getElementsByClassName('ivu-date-picker-transfer')[0].onclick = function() {
            //     event.stopPropagation();
            // };
            // document.getElementsByClassName('ivu-date-picker-transfer')[1].onclick = function() {
            //     event.stopPropagation();
            // };
        },
        watch: {
            menu_list(val) {
                this.canGoToBind = this.isContainsMenu('account_binding');
            },
            // websocket推送
            websocketMsgFB(val) {
                // 推送 Facebook 聊天消息
                if (val.messageType === 'facebookChatMessage') {
                    // 会话
                    if (val.pageId === this.currentBrandPageId) {
                        // 当前主页收到消息
                        if (val.fromId === this.currentConversationId) {
                            // 收到的消息来自正在聊天的对象
                            this.websocketChat = val;
                            this.updateConversationUnread(this.currentBrandPageId);
                            // 默认消息已读，分屏的未读消息数减1
                            const fbChatUnread = this.fbChatUnread - 1;
                            if (fbChatUnread <= 0) {
                                this.$store.commit('setFbChatUnread', 0);
                            } else {
                                this.$store.commit('setFbChatUnread', fbChatUnread);
                            }
                            // 更新会话列表顺序,新消息在上
                            this.currentConversation.updateTime = val.messageTime;
                            this.conversationList = [this.currentConversation, ...this.conversationList.filter(item => `${item.conversationId}` !== `${this.currentConversation.conversationId}`)];
                        } else {
                            // 收到的消息来自其他会话对象
                            let flag = 0; // 发消息对象是否在当前会话列表中存在标志 0-不存在 1=存在
                            /* 当收到的消息来自其他会话对象时，下拉菜单中对应账号的未读数加1 */
                            this.updateBrandePage(val.pageId, true);
                            this.conversationList.forEach((item, index) => {
                                if (item.conversationId === val.fromId) {
                                    // 发消息对象在会话列表中存在
                                    const msgItem = item;
                                    msgItem.unreadCount += 1;
                                    msgItem.updateTime = val.messageTime;
                                    // 更新会话列表顺序,新消息在上
                                    this.conversationList.splice(index, 1);
                                    this.conversationList = [msgItem, ...this.conversationList];
                                    flag = 1;
                                }
                            });
                            if (flag === 0) {
                                // 发消息对象在会话列表中不存在，添加这条会话到列表中
                                getConversationList({
                                    orgId: this.enterpriseId,
                                    currentUserId: this.userId,
                                    pageId: this.currentBrandPageId,
                                    pageNo: 1,
                                    pageSize: 10,
                                    conversationIds: [val.formId].join(',')
                                }).then(res => {
                                    if (res.code === '1') {
                                        const dataList = res.data.list;
                                        for (const item of dataList) {
                                            if (item.conversationId === val.fromId) {
                                                this.conversationList = [item, ...this.conversationList];
                                            }
                                        }
                                    }
                                });
                            }
                        }

                        // 更新消息所在会话的接待客服
                        // 判断当前会话列表中是否已存在会话
                        const fbConversation = this.conversationList.find(item => `${item.conversationId}` === `${val.conversationId}`);
                        if (fbConversation) {
                            // 收到 fb 私信推送, 说明此对话没有接待客服 或 接待客服为"我", 更新会话接待客服为空 或 "我"

                            if (val.afterUserId) {
                                // 有接待客服

                                if (`${val.afterUserId}` === `${this.userId}`) {
                                    // 接待客服是"我"

                                    // 更新接待客服为"我"
                                    fbConversation.userId = this.userId;
                                    fbConversation.userName = this.fullName;
                                }
                            } else {
                                // 无接待客服

                                // 更新会话接待客服为空
                                fbConversation.userId = null;
                                fbConversation.userName = '';
                            }
                        }
                    } else {
                        // 其他主页收到消息
                        this.updateBrandePage(val.pageId, true);
                        this.allPageList.forEach((item) => {
                            if (item.userId === val.pageId) {
                                item.hasNewMessage += 1;
                            }
                        });
                    }
                }

                // 推送 Facebook 评论消息
                if (val.messageType === 'facebookCommentMessage') {
                    // 评论
                    this.assosiateFbCommentorAndPostId = val.commentorAndPostId;
                    if (val.pageId === this.currentBrandPageId) {
                        // 当前主页
                        // if(val.recipientId===this.postId){
                        //     //当前帖子
                        //     this.websocketComment=val
                        // }
                        if (this.currentCommentorAndPostId === val.commentorAndPostId) {
                            // 当前评论人和帖子
                            this.websocketComment = val;
                            this.commentList[this.currentCommentIndex].recent_comment_content = val.messageText;
                            this.commentList[this.currentCommentIndex].recent_comment_time = val.messageTime;
                            this.commentList[this.currentCommentIndex].comment_id = val.messageId;

                            this.updateCommentUnread();
                        } else {
                            let flag = 0;
                            this.commentList.forEach((item, index) => {
                                if (item.commentorAndPostId === val.commentorAndPostId) {
                                    item.recent_comment_content = val.messageText;
                                    item.recent_comment_time = val.messageTime;
                                    item.comment_id = val.messageId;
                                    item.unreadCount += 1;
                                    const pageId = item.page_id;
                                    this.allPageList.find(item => item.userId === pageId).commentUnReadCount += 1;
                                    flag += 1;
                                }
                            });
                            if (flag === 0) {
                                // 收到的评论人-帖子不存在于列表中
                                util.ajaxInternational({
                                    url: '/social/getPageComments',
                                    method: 'get',
                                    params: {
                                        pageId: this.currentBrandPageId,
                                        pageNo: 1,
                                        pageSize: 10
                                    }
                                }).then(response => {
                                    if (response.data.code === '1') {
                                        const dataList = response.data.data.list;
                                        dataList.forEach(item => {
                                            if (item.commentorAndPostId === val.commentorAndPostId) {
                                                this.commentList = [item, ...this.commentList];
                                            }
                                        });
                                    }
                                });
                                // this.commentList=[
                                //     {
                                //     },
                                //     ...this.commentList
                                // ]
                                this.currentCommentIndex += 1;
                            }
                        }
                    } else {
                        // 其他主页收到消息
                        this.allPageList.forEach((item) => {
                            if (item.userId === val.pageId) {
                                item.hasNewMessage += 1;
                                item.commentUnReadCount += 1;
                            }
                        });
                    }
                }

                // FB 对话接待客服变更提醒
                if (val.messageType === 'facebookAssignCustomerService') {
                    // 判断当前会话列表中是否已存在会话
                    const fbConversation = this.conversationList.find(item => `${item.conversationId}` === `${val.conversationId}`);
                    if (fbConversation) {
                        // 更新对话接待客服信息
                        this.updateServiceInfo(val.conversationId);
                    }
                }

                if (val.bePushedMessageType === '10' && val.msgType == 5) {
                    if (this.currentCommentorAndPostId === this.assosiateFbCommentorAndPostId) {
                        this.commentList[this.currentCommentIndex].clue_status = 102;
                    } else {
                        this.commentList.forEach((item, index) => {
                            if (item.commentorAndPostId === this.assosiateFbCommentorAndPostId) {
                                this.commentList[index].clue_status = 102;
                            }
                        });
                    }
                    this.$store.commit('setAssosiatedFbCommentorAndPostId', this.currentCommentorAndPostId);
                }
            },
            searchInput() {
                !this.searchInput && this.handleSearch();
            },
            // 监听选中对话 id 的变动, 主动设置左侧对话列表中相应对话为选中状态
            currentConversationId: {
                handler(val) {
                    if (val) {
                        setTimeout(() => {
                            if (this.$refs.conversationMenu) {
                                this.$refs.conversationMenu.activeIndex = this.currentConversationId;
                            }
                        }, 0);
                    }
                }
            },
            // 监听点击 fb 分配对话通知时传过来的对话 id
            fbJumpConversationData: {
                handler(val) {
                    if (val && val.pageId && val.conversationId) {
                        // 打开指定主页的指定会话
                        this.openPageAndConversation(val);

                        // 清空原有数据
                        this.$store.commit('setFbJumpConversationData', {});
                    }
                }
            }
        }
    };
</script>

<style lang="less" scoped>
.invalid-tip-hover {
    font-size: 12px;
    color: red;
    cursor: pointer;
    float: right;
    margin-top: 5px;
    &:hover {
        text-decoration: underline;
    }
}
.brand-page-dropdown {
    max-height: 50%;
    overflow: auto;

    .el-dropdown-menu__item {
        padding: 5px 20px;
        .el-tooltip {
            line-height: 18px;
            overflow:hidden;
            text-overflow:ellipsis;
            display:-webkit-box;
            -webkit-box-orient:vertical;
            -webkit-line-clamp:1;
        }
    }
    .invalid-tip {
        font-size: 12px;
        color: red;
        cursor: pointer;
    }
}
</style>

<style lang="less">
.facebook-inbox {
    .el-col-6 {
        border-right: 1px solid rgb(232, 232, 232);
    }

    .facebook-inbox-toolbar {
        padding: 20px 20px 12px;
        .toolbar-brand-page {
            display: flex;
            height:36px;
            line-height: 35px;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            .avatar-small{
                width: 36px;
                height: 36px;
                border-radius: 18px;
            }

            // 主页右下角的icon图标
            .company-page-icon {
                position: absolute;
                bottom: 0;
                right: 0;
            }

            .brand-page-head {
                cursor: pointer;

                .brand-page-name{
                    display: inline-block;
                    vertical-align: middle;
                    max-width: 146px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    font-size: 14px;
                    color: rgba(0,0,0,0.80);
                    padding: 0 10px;
                    font-weight: 700;
                }
            }
            .page-message-tip {
                color: #EA4335;
                font-size: 12px;
            }
        }
    }
    .inbox-tab {
        .el-tabs__nav-wrap:after {
            height: 0;
        }
        .el-tabs__item.is-active {
            font-weight: 700;
        }
        .el-tabs__nav {
            width: 100%;
        }
        .el-tabs__item {
            width: 50%;
            padding: 0;
            text-align: center;
        }
        .el-badge__content.is-fixed.is-dot {
            right: -5px;
            top:20px;
        }
        .el-badge__content {
            background-color: #ed4014;
        }
        .el-tabs__active-bar {
            width: 30px !important;
            left: 25%;
            margin-left: -15px;
        }
        .el-tabs__header {
            margin: 0;
        }
        .el-menu {
            background-color: #fafcff;
            border-right: none;
        }
        .el-menu-item {
            &:hover {
                background-color: #EEF1F5;
            }
            &.is-active {
                background-color: #EEF1F5;
            }
        }
        .Facebook-all-screen-item {
            padding: 11px 20px;
            height: 68px;
            display: flex;
            align-items: center;
            .el-badge__content {
                width: 18px;
                height: 18px;
                text-align: center;
            }
            .el-badge__content.is-fixed {
                top: 10px;
                right: 12px;
            }
            .avatar-large{
                width: 46px;
                height: 46px;
                border-radius: 23px;
            }
            .conversation-name-tooltip{
                max-width: calc(~'100%-135px');
             }
            .conversation-name{
                height: initial;
                line-height: initial;
                font-size: 14px;
                color: rgba(0,0,0,0.80);
                font-weight: 700;
                padding: 0 10px;
                overflow:hidden;
                text-overflow: ellipsis;
            }
            .conversation-remark {
                display: inline-block;
                vertical-align: middle;
                max-width: 50px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-size: 12px;
                color: rgba(0,0,0,0.40);
                margin-left: 8px;
            }

            .conversation-customerService {
                padding: 7px 10px 0;
                font-weight: 500;
                font-size: 12px;
                line-height: 14px;
                color: #A9B9C9;

                > span {
                    display: flex;
                    align-items: center;
                }

                svg {
                    width: 16px;
                    height: 16px;
                    margin-right: 5px;
                }
            }

            .conversation-time{
                font-size: 12px;
                color: rgba(0,0,0,0.40);
                position: absolute;
                top: 0px;
                right: 20px;
            }
            .conversation-status{
                position: absolute;
                color: rgba(0,0,0,0.40);
                right: 20px;
            }
            .comment-info{
                margin: 0 10px;
                max-width: 50%;
                color: rgba(0, 0, 0, 0.8);
                p{
                    font-size: 12px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    line-height: 24px;
                }
            }
            .comment-time{
                position: absolute;
                font-size: 12px;
                right: 20px;
                color: rgba(0,0,0,0.40);
                text-align: right;
            }
        }
        .empty-list{
            text-align: center;
            padding: 20px 0;
        }
    }
    .empty-content{
        text-align: center;
        margin-top: calc(~"50vh - 75px");
    }
}
.facebook-inbox-poptip {
    .el-form-item {
        margin-bottom: 24px;
    }
}
</style>
