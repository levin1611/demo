<template>
    <!-- facebook收件箱 -->
    <div class="facebook-inbox">
        <Row>
            <!-- 左侧私信、评论列表 -->
            <Col :span="6" :style="{height:content_height,background:'#FAFCFF'}">
                <!-- toolbar -->
                <div class="facebook-inbox-toolbar" v-loading="brandPageLoading">
                    <!-- 当用户未绑定任何facebook账号时显示--'...去绑定' -->
                    <div v-if="allPageList.length===0" style="padding:20px 0;">
                        <span style="font-weight:bold;font-size:12px;line-height:32px;">
                            {{$t('facebook.inbox.bindPageTip')}}
                        </span>
                        <Button type="primary" style="float:right;" @click="goToBind">
                            {{$t('facebook.inbox.gotoBind')}}
                        </Button>
                    </div>
                    <!-- 当用户已绑定facebook账号时显示--选择主页下拉菜单 -->
                    <div class="toolbar-brand-page" v-else>
                         <!-- transfer transfer-class-name="facebook-inbox-page-dropdown"  @click="handlePageSelect" -->
                        <Dropdown
                            trigger="click"
                            @visible-change="handlePageVisible"
                            @command="handlePageSelect"
                            placement="bottom-start">
                                <div class="brand-page-head">
                                    <span style="position: relative;vertical-align: middle;display: inline-block;">
                                        <Avatar :src="currentBrandPageAvatar" class="avatar-small" />
                                        <svg
                                            class="svg-icon company-page-icon"
                                            aria-hidden="true"
                                            v-if="currentBrandPage.homePageType===1">
                                                <use xlink:href="#custom-facebook-company-page"></use>
                                        </svg>
                                    </span>
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
                                        <DropdownItem
                                            v-for="brandPage in allPageList"
                                            :key="brandPage.userId"
                                            :command="brandPage.userId"
                                            style="display:flex;align-items: center;">
                                                <!-- 检测token是否失效,1-有效 2-失效 -->
                                                <Row style="width:100%">
                                                    <Col :span="3">
                                                        <Badge :text="brandPage.access_status===1?'':$t('facebook.onekeyRelease.creatContent.invalid')">
                                                            <Avatar :src="brandPage.avatar" style="width: 30px; height: 30px;border-radius: 15px;" />
                                                            <svg class="svg-icon" style="position: absolute;bottom: 8px;right: 0;width:12px;" aria-hidden="true" v-if="brandPage.homePageType===1">
                                                                <use xlink:href="#custom-facebook-company-page"></use>
                                                            </svg>
                                                        </Badge>
                                                    </Col>
                                                    <Col :span="14">
                                                        <Tooltip :content="brandPage.userName" transfer  style="margin:12px 8px" :disabled="!pageMenuVisible">
                                                            <span style="font-size: 12px;">{{brandPage.userName}}</span>
                                                        </Tooltip>
                                                    </Col>
                                                    <Col :span="4"  style="padding-top:2px">
                                                        <span v-show="(brandPage.access_status==1) && (brandPage.hasNewMessage || brandPage.unreadCount || brandPage.commentUnReadCount)" style="font-size: 12px;">
                                                            <!-- min-width: 46px;text-align:end -->
                                                            {{brandPage.unreadCount > 99 ? '99+' : brandPage.unreadCount }}/{{brandPage.commentUnReadCount > 99 ? '99+' : brandPage.commentUnReadCount}}
                                                        </span>
                                                    </Col>
                                                    <Col :span="2" :offset="brandPage.hasNewMessage || brandPage.unreadCount || brandPage.commentUnReadCount? 1:5" style="padding-top:2px">
                                                        <span v-show="brandPage.access_status!==1" class="invalid-tip" @click="goToBind">{{$t('facebook.onekeyRelease.creatContent.invalid')}}</span>
                                                    </Col>
                                                </Row>
                                        </DropdownItem>
                                </DropdownMenu>
                        </Dropdown>
                        <span v-show="currentBrandPageAccessStatus!==1" class="invalid-tip-hover" @click="goToBind">{{$t('facebook.onekeyRelease.creatContent.invalid')}}</span>
                        <span class="page-message-tip" v-if="fbChatUnread">{{$t('facebook.inbox.newMessage')}}</span>
                    </div>
                    <!-- 搜索框 -->
                    <Input v-model="searchInput" :placeholder="$t('facebook.inbox.inputKeyWords')" @keyup.enter.native="handleSearch" size="large">
                        <!-- 高级搜索气泡 -->
                        <Poptip v-model="searchPopShow" slot="append" placement="bottom-end" width="350">
                            <Icon slot="reference" custom="custom custom-drop-down-triangle" size="8" style="cursor:pointer;"></Icon>
                            <div>
                                <div style="font-size: 14px;padding: 20px 0 16px 4px;">{{$t('inbox.advancedSearch')}}</div>
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
                                    <!-- 状态 -->
                                    <FormItem :label="$t('facebook.bindForm.fbstatus')" prop="checkAllGroup">
                                        <div style="display: flex;">
                                            <Checkbox
                                                :indeterminate="searchForm.indeterminate"
                                                :value="searchForm.checkAll"
                                                @click.prevent.native="handleCheckAllStatus">
                                                {{$t('filter_box.select_all')}}
                                            </Checkbox>
                                            <CheckboxGroup v-model="searchForm.checkAllGroup" @change="checkAllGroupChange" style="display:flex;flex-direction: column;margin-left: 20px;">
                                                <Checkbox :label="item.key" v-for="item in statusList" :key="item.key">{{item.value}}</Checkbox>
                                            </CheckboxGroup>
                                        </div>
                                    </FormItem>
                                    <!-- 清空、搜索按钮 -->
                                    <FormItem style="text-align: right;margin-bottom: 0;">
                                        <Button type="minor" size='small' @click="handleSearchAdvancedClear">{{$t('filter_box.empty')}}</Button>
                                        <Button type="success" size='small' class="fbinbox-advancedsearch" style="margin-left: 8px" @click="handleSearchAdvanced">{{$t('traffic.search')}}</Button>
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
                    <TabPane name="fbChat">
                        <div slot="label">
                            <Badge  :is-dot="fbChatAndCommentUnread ? fbChatAndCommentUnread.fbChatUnread > 0 : false">
                                    {{$t('facebook.inbox.chat')}}
                            </Badge>
                        </div>
                        <div v-if="!conversationLoading&&conversationList.length===0" class="empty-list">{{$t('facebook.inbox.noData')}}</div>
                        <Menu
                            v-else
                            ref="conversationMenu"
                            :active-name="currentConversationId"
                            v-loading="conversationLoading"
                            @select="handleConversationSelect"
                            >
                            <!-- :style="{'height':`${scrollHeight}px`,'overflow':'auto'}"
                            v-infinite-scroll="handleLoadConversation"
                            :infinite-scroll-distance="10"
                            infinite-scroll-immediate="false" -->
                            <Scroll :on-reach-bottom="handleLoadConversation" :distance-to-edge="10" :height="scrollHeight">
                                <MenuItem class="Facebook-all-screen-item" v-for="conversation in conversationList" :index="conversation.conversationId" :key="conversation.conversationId">
                                    <Badge :value="conversation.unreadCount" :hidden="conversation.unreadCount <= 0">
                                        <Avatar :src="conversation.conversationAvatar" class="avatar-large" />
                                    </Badge>
                                    <Tooltip :content="conversation.conversationName" transfer class="conversation-name-tooltip">
                                        <span class="conversation-name">{{conversation.conversationName | conversationNameFormat}}</span>
                                    </Tooltip>
                                    <Tooltip max-width='200' v-if="conversation.remark" :content="conversation.remark | conversationRemarkFormat" transfer class="conversation-name-tooltip">
                                        <div class="conversation-remark" v-if="conversation.remark">{{conversation.remark | conversationRemarkFormat}}</div>
                                    </Tooltip>
                                    <div>
                                        <span v-if="new Date(conversation.updateTime).toDateString()===new Date().toDateString()" class="conversation-time">{{conversation.updateTime | timeFormat("TimeHm")}}</span>
                                        <span v-else class="conversation-time">{{conversation.updateTime | timeFormat("DateTimeMd")}}</span>
                                        <span class="conversation-status" v-if="conversation.clue_status === 1">{{$t('chat.noEntry')}}</span>
                                        <span class="conversation-status" v-else-if="conversation.clue_status === 101">{{$t('chat.clue')}}</span>
                                        <span class="conversation-status" v-else-if="conversation.clue_status === 102">{{$t('chat.inquiries')}}</span>
                                        <span class="conversation-status" v-else>{{$t('chat.nothingWith')}}</span>
                                    </div>
                                </MenuItem>
                            </Scroll>
                        </Menu>
                    </TabPane>
                    <!-- 评论列表 -->
                    <TabPane name="fbComment">
                        <div slot="label">
                            <Badge  :is-dot="fbChatAndCommentUnread ? fbChatAndCommentUnread.fbCommentUnread > 0 : false">
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
                            <Scroll :on-reach-bottom="handleLoadComment" :distance-to-edge="10" :height="scrollHeight">
                                <MenuItem class="Facebook-all-screen-item" v-for="comment in commentList" :index="comment.commentorAndPostId" :key="comment.id">
                                    <Badge :value="comment.unreadCount" :hidden="comment.unreadCount <= 0">
                                        <Avatar :src="comment.picture" class="avatar-large" />
                                    </Badge>
                                    <div class="comment-info">
                                        <p>{{comment.post_content}}</p>
                                        <p>{{comment.commentator_name}} : {{comment.recent_comment_content?comment.recent_comment_content:'[图片]'}}</p>
                                    </div>
                                    <span v-if="new Date(comment.recent_comment_time).toDateString()===new Date().toDateString()" class="comment-time">{{comment.recent_comment_time | timeFormat("TimeHm")}}</span>
                                    <span v-else class="comment-time">{{comment.recent_comment_time | timeFormat("DateTimeMd")}}</span>
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
                    :selectOptions="selectOptions"
                    :corp_columns_authorized="corp_columns_authorized"
                    :inquiry_columns_authorized="inquiry_columns_authorized"
                    :contact_columns_authorized="contact_columns_authorized"
                    @handleSendMessage="handleSendMessage"
                    @updateConversationStatus="status=>conversationList[currentConversationIndex].clue_status=status"
                    @updateConversationClueStatus="updateConversationClueStatus"
                    @updateRemark="handleUpdateRemark"
                    @updateCurrentConversation="updateCurrentConversation"
                    @changeChatCurrentStatus="changeChatCurrentStatus">
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
                    :selectOptions="selectOptions"
                    :corp_columns_authorized="corp_columns_authorized"
                    :inquiry_columns_authorized="inquiry_columns_authorized"
                    :contact_columns_authorized="contact_columns_authorized"
                    @updateCommentStatus="status=>commentList[currentCommentIndex].clue_status=status"
                    @updateCommentClueStatus="updateCommentClueStatus"
                    @updateCurrentCommentAndPost="updateCurrentCommentAndPost"
                    @changeCommentCurrentStatus="changeCommentCurrentStatus">
                </fb-comment>
            </Col>
            <!-- <Col :span="7" v-if="locusSideStatus" :style="{height:content_height,border:'none', borderLeft: '1px solid #eaeaea'}">
                <LocusSide :visitorList="visitorList"/>
            </Col> -->
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
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import FbChat from './FbChat/FbChat';
    import FbComment from './FbComment/FbComment';
    import LocusSide from './components/LocusSide';
    export default {
        name: 'Inbox',
        props: {
            content_height: {
                type: String,
                default: '800px'
            }
        },
        components: { FbChat, FbComment, LocusSide },
        data() {
            return {
                locusSideStatus: false,
                /** 加这两个属性的目的是，由于显示的头像都已经转成base64，但后续录入线索的时候需要这个参数
                 ***base64的话过长，后台不能存，所以用这两个属性来存原本的头像url
                 * */
                currentNodealAvatar: '',
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
                nodealList: [],
                conversationNodealList: [],
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
                    indeterminate: false,
                    checkAll: false,
                    checkAllGroup: []
                },
                statusList: [
                    {
                        key: '1',
                        value: this.$t('chat.noEntry')
                    },
                    {
                        key: '2',
                        value: this.$t('chat.nothingWith')
                    },
                    {
                        key: '101',
                        value: this.$t('chat.clue')
                    },
                    {
                        key: '102',
                        value: this.$t('chat.inquiries')
                    }
                ],
                pageSize: 15,
                currentTab: 'fbChat', // 默认显示私信视图
                conversationSearchData: {},
                commentSearchData: {},
                noDataShow: true, // 无数据提示

                // 会话数据
                chatShow: false,
                conversationLoading: false, // 会话列表loading图标
                conversationList: [], // 会话列表
                currentConversation: {},
                currentConversationUnread: 0,
                currentConversationId: '',
                currentConversationIndex: -1,
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
                // 录入询盘所需字段
                /* 对接权限系统 */
                corp_columns_authorized: {}, // 公司所有字段
                contact_columns_authorized: {}, // 联系人所有字段
                inquiry_columns_authorized: {}, // 询盘所有字段
                selectOptions:{}
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                isFbService: state => state.isFbService,
                websocketMsgFB: state => state.facebook.websocketMsgFB,
                menu_list: state => state.app.menu_list,
                fbChatUnread: state => state.facebook.fbChatUnread,
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
            changeChatCurrentStatus(status) {
                this.conversationList[this.currentConversationIndex].clue_status = status;
            },
            changeCommentCurrentStatus(status) {
                this.commentList[this.currentCommentIndex].clue_status = status;
            },
            updateConversationClueStatus(status) {
                this.conversationList[this.currentConversationIndex].clue_status = status;
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
            getBrandPage() {
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
                    if (response.data.code === '1') {
                        this.brandPageLoading = false;
                        let dataList = response.data.data;
                        this.nodealList = JSON.parse(JSON.stringify(response.data.data));
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
                        if (this.allPageList.length > 0) {
                            if (this.allPageList[0].access_status === 1) {
                                // token有效才继续请求
                                this.handlePageSelect(this.allPageList[0].userId);
                            } else {
                                this.currentBrandPage = this.allPageList[0];
                                this.currentBrandPageAvatar = this.allPageList[0].avatar;
                                this.currentBrandPageName = this.allPageList[0].userName;
                                // 没有经过转码的主页头像
                                this.currentNodealAvatar = this.nodealList[0].avatar;
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
            handlePageSelect(name) {
                console.log('handlePageSelect', name);
                this.conversationLoading = true;
                this.commentLoading = true;
                this.letChatLoading = true;
                this.letCommentLoading = true;
                this.currentBrandPageId = name;
                this.nodealList.forEach(item => {
                    if (item.userId === name) {
                        this.currentNodealAvatar = item.avatar;
                    }
                });
                this.allPageList.forEach(item => {
                    if (item.userId === name) {
                        item.hasNewMessage = 0;
                        this.currentBrandPage = item;
                        this.currentBrandPageAvatar = item.avatar;
                        this.currentBrandPageName = item.userName;
                        this.currentBrandPageAccessToken = item.accessToken;
                        this.currentBrandPageAccessStatus = item.access_status;
                        this.currentBrandPageUserId = item.bindingUserId;
                    }
                });
                // 需要清空数据
                this.conversationList = [];
                this.conversationPage = 1;
                this.commentList = [];
                this.commentPage = 1;
                this.handleSearchAdvancedClear();
                this.searchInput = '';
                this.conversationSearchData = {};
                this.commentSearchData = {};
                this.noDataShow = false;

                if (this.currentBrandPageAccessStatus === 1) {
                    this.getPageConversations();
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
            },
            // 切换私信/评论视图
            handleViewChange(obj) {
                this.currentTab = obj.name;
                if (obj.name === 'fbChat') {
                    this.$store.state.commentVerbalInfo = [];
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
                    this.$store.state.chatVerbalInfo = [];
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
            getPageConversations() {
                this.conversationLoading = true;
                let ajaxData = {
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
                util.ajaxInternational({
                    url: '/social/getPageConversations',
                    method: 'post',
                    params: ajaxData
                }).then(response => {
                    if (response.data.code === '1') {
                        this.conversationLoading = false;
                        const dataList = response.data.data.list;
                        const nochangeList = JSON.parse(JSON.stringify(response.data.data.list));
                        this.conversationNodealList = this.conversationNodealList.concat(nochangeList);
                        this.conversationList.forEach(item => {
                            dataList.forEach((val, index) => {
                                if (val.conversationId === item.conversationId) {
                                    dataList.splice(index, 1);
                                }
                            });
                        });
                        const dealDataList = dataList;
                        this.dealConversationPic(dealDataList);
                        const completeList = dealDataList;
                        this.conversationList = this.conversationList.concat(completeList);
                        if (this.conversationPage === 1) {
                            if (this.conversationList.length > 0) {
                                this.handleConversationSelect(this.conversationList[0].conversationId);
                                // this.$nextTick(() => {
                                //     this.$refs.conversationMenu.updateActiveName();
                                // });
                            } else {
                                if (this.currentTab === 'fbChat') {
                                    this.noDataShow = true;
                                    this.chatShow = false;
                                }
                            }
                        } else {
                            if (dataList.length === 0) {
                                this.$Message.info(this.$t('facebook.inbox.noMoreMessage'));
                                this.conversationPage -= 1;
                            }
                        }
                    }
                });
            },
            // 会话列表滚动加载下一页
            handleLoadConversation() {
                this.conversationPage += 1;
                this.getPageConversations();
            },
            // 选中会话
            handleConversationSelect(name) {
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
                this.currentConversationId = name;
                // this.getLocusSideStatus();
                // this.$refs.fbChat.getLocusSideStatus();
                this.locusStatus = true;
                if (this.currentTab === 'fbChat') {
                    this.chatShow = true;
                    this.commentShow = false;
                    this.noDataShow = false;
                }
                this.letChatLoading = false;
                this.letCommentLoading = false;
                this.conversationList.forEach((item, index) => {
                    if (item.conversationId === name) {
                        this.currentConversationUnread = item.unreadCount;
                        this.currentConversation = item;
                        this.currentConversation.nodealPageAvatar = this.currentNodealAvatar;
                        this.currentConversation.currentBrandPageName = this.currentBrandPageName;
                        this.currentConversationIndex = index;
                        item.unreadCount = 0;
                    }
                });
                this.conversationNodealList.forEach((item, index) => {
                    if (item.conversationId === name) {
                        this.currentNodealCoversationAvatar = item.conversationAvatar;
                        this.currentConversation.currentNodealCoversationAvatar = item.conversationAvatar;
                    }
                });
                this.updateConversationUnread(this.currentBrandPageId);
            },
            // 更新备注
            handleUpdateRemark(data) {
                this.$set(this.conversationList[this.currentConversationIndex], 'remark', data);
            },
            // 更新会话未读消息条数
            updateConversationUnread(currentPageId) {
                util.ajaxInternational({
                    url: '/social/updateConversationUnreadStatusByConversationId',
                    method: 'post',
                    data: {
                        conversationId: this.currentConversationId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        if (this.fbChatUnread > 0) {
                            this.$store.commit('setFbChatUnread', this.fbChatUnread - this.currentConversationUnread);
                        }
                        /* 当前会话由未读变已读，应当在下拉菜单中更改相应的未读数 */
                        this.updateBrandePage(currentPageId, false);
                    }
                });
            },
            // 更新公共主页列表
            updateBrandePage(PageId, flag) {
                /* flag--当前未读数是增加 or 减少 false--减少  true--增加 */
                /* PageId--需要改变未读数的主页id */
                this.allPageList = this.allPageList.map(item => {
                    if (item.userId === PageId) {
                        if (flag) {
                            item.unreadCount += 1;
                        } else {
                            item.unreadCount -= this.currentConversationUnread;
                            item.unreadCount = item.unreadCount < 0 ? 0 : item.unreadCount;
                        }
                    }
                    return item;
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
                    const brandPicture = await this.getPostsPicturesUrl(temp.avatar);
                    temp.avatar = brandPicture;
                }
                this.currentBrandPage = this.allPageList[0];
                this.currentBrandPageAvatar = this.allPageList[0].avatar;
                this.currentBrandPageName = this.allPageList[0].userName;
            },
            // 处理私信头像
            async dealConversationPic(dataList) {
                for (let i = 0; i < dataList.length; i++) {
                    const tempObj = dataList[i];
                    const conversationPicture = await this.getPostsPicturesUrl(tempObj.conversationAvatar);
                    tempObj.conversationAvatar = conversationPicture;
                }
            },
            // 获取评论列表
            getPageComments() {
                this.commentLoading = true;
                let ajaxData = {
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
                }).then(response => {
                    if (response.data.code === '1') {
                        const list = response.data.data.list;
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
                        this.commentLoading = false;
                    }
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
                    this.searchForm.checkAllGroup = ['1', '2', '101', '102'];
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
                    startDate: this.$options.filters.timeFormat(this.searchForm.date[0]),
                    endDate: this.$options.filters.timeFormat(this.searchForm.date[1]),
                    remark: this.searchForm.remark,
                    conversationName: this.searchForm.name,
                    status: this.searchForm.checkAllGroup.join(',')
                };
                this.commentSearchData = {
                    startDate: this.$options.filters.timeFormat(this.searchForm.date[0]),
                    endDate: this.$options.filters.timeFormat(this.searchForm.date[1]),
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
                if (this.currentConversationIndex !== 0) {
                    this.currentConversation.updateTime = val;
                    this.conversationList.splice(this.currentConversationIndex, 1);
                    this.conversationList = [this.currentConversation, ...this.conversationList];
                    this.currentConversationIndex = 0;
                }
            },
            // 下拉菜单显示状态改变
            handlePageVisible(visible) {
                this.pageMenuVisible = visible;
            },
            /* 右侧聊天窗口录入线索后，更新当前选中的会话的clueId */
            updateCurrentConversation(clueId) {
                if (!this.currentConversation.clue_id) {
                    this.currentConversation.clue_id = clueId;
                    this.conversationList[this.currentConversationIndex] = this.currentConversation;
                }
            },
            /* 右侧帖子详情页录入线索后，更新当前选中的评论和帖子的clueId */
            updateCurrentCommentAndPost(clueId) {
                if (!this.currentCommentAndPost.clue_id) {
                    this.currentCommentAndPost.clue_id = clueId;
                    this.commentList[this.currentCommentIndex] = this.currentCommentAndPost;
                }
            },
            // 获取所有授权字段 + 筛选出公司/询盘/联系人授权字段 
            getCrmFields(){
                util.ajax({
                    url: '/crm/columnConfig/getFields',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        parentId: 0
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        // 暂存所有默认字段和自定义字段
                        const defaultFields = res.data.data && Array.isArray(res.data.data.default) ? res.data.data.default : [];
                        const customFields = res.data.data && Array.isArray(res.data.data.custom) ? res.data.data.custom : [];
                        // 筛选得到公司/询盘/联系人授权字段
                        this.$set(this.corp_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 1));
                        this.$set(this.corp_columns_authorized, 'custom', customFields.filter(col => col.parentId === 1));
                        this.$set(this.contact_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 2));
                        this.$set(this.contact_columns_authorized, 'custom', customFields.filter(col => col.parentId === 2));
                        this.$set(this.inquiry_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 3));
                        this.$set(this.inquiry_columns_authorized, 'custom', customFields.filter(col => col.parentId === 3));

                        // 默认字段加上必须要有的字段
                        if (Array.isArray(this.corp_columns_authorized.default)) {
                            // 如果没有公司名, 把公司名加进来
                            if (this.corp_columns_authorized.default.every(item => item.storageName !== 'companyName')) {
                                this.corp_columns_authorized.default.unshift({
                                    cname: this.$t('crm.Modal.corp_companyName'),
                                    colType: 'text',
                                    mustInput: 1,
                                    storageName: 'companyName',
                                    manually: true // 此属性表示: 本来没有权限, 是前端手动加上的
                                });
                            }
                        }
                        if (Array.isArray(this.inquiry_columns_authorized.default)) {
                            // 如果没有产品分类, 把公司名加进来
                            if (this.inquiry_columns_authorized.default.every(item => item.storageName !== 'productCategory')) {
                                this.inquiry_columns_authorized.default.unshift({
                                    cname: this.$t('crm.Modal.inq_productCategory'),
                                    colType: 'selectMultiple',
                                    mustInput: 1,
                                    storageName: 'productCategory',
                                    manually: true // 此属性表示: 本来没有权限, 是前端手动加上的
                                });
                            }
                        }
                        if (Array.isArray(this.contact_columns_authorized.default)) {
                            // 如果没有邮箱, 把公司名加进来
                            if (this.contact_columns_authorized.default.every(item => item.storageName !== 'email')) {
                                this.contact_columns_authorized.default.unshift({
                                    cname: this.$t('crm.Modal.contact_email'),
                                    colType: 'email',
                                    mustInput: 1,
                                    storageName: 'email',
                                    manually: true, // 此属性表示: 本来没有权限, 是前端手动加上的
                                    isOnlyRead:2
                                });
                            }
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                    }
                });
            },
            // 新建获取属性列表
            getSelectOptions() {
                return util.ajax({
                    url: '/crm/attr/getField',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.selectOptions = response.data.data;
                        this.selectOptions.followUp ? this.selectOptions.followUp.unshift({
                            isAvailable: 1,
                            attrId: 0,
                            sort: 0,
                            typeId: 7,
                            attrName: this.$t('crm.UniSet.defaultFollowUpStatus_inquiry')
                        }) : undefined;
                        this.$set(this.selectOptions, 'label', this.selectOptions.tag || []);
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getSelectOptions'));
                    }
                });
            },
        },
        created() {
            this.getCrmFields();
            this.getSelectOptions();
            this.getBrandPage();
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
                            this.conversationList.splice(this.currentConversationIndex, 1);
                            this.conversationList = [this.currentConversation, ...this.conversationList];
                            this.currentConversationIndex = 0;
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
                                    if (index > this.currentConversationIndex) {
                                        // 如果有新消息的会话在当前会话之后，会话列表顺序调整后当前会话索引需要加一
                                        this.currentConversationIndex += 1;
                                    }
                                    flag = 1;
                                }
                            });
                            if (flag === 0) {
                                // 发消息对象在会话列表中不存在，添加这条会话到列表中
                                // this.conversationList=[
                                //     {
                                //         clue_status:1,
                                //         clue_id:'',
                                //         conversationAvatar:val.fromAvatar,
                                //         conversationId:val.fromId,
                                //         conversationName:val.fromName,
                                //         conversationStatus:1,
                                //         pageId:val.pageId,
                                //         unreadCount:1,
                                //         updateTime:val.messageTime
                                //     },
                                //     ...this.conversationList
                                // ]
                                // this.currentConversationIndex+=1
                                util.ajaxInternational({
                                    url: '/social/getPageConversations',
                                    method: 'get',
                                    params: {
                                        pageId: this.currentBrandPageId,
                                        pageNo: 1,
                                        pageSize: 10
                                    }
                                }).then(response => {
                                    if (response.data.code === '1') {
                                        const dataList = response.data.data.list;
                                        for (const item of dataList) {
                                            if (item.conversationId === val.fromId) {
                                                this.conversationList = [item, ...this.conversationList];
                                                this.currentConversationIndex += 1;
                                            }
                                        }
                                    }
                                });
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
                } else if (val.messageType === 'facebookCommentMessage') {
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
        padding: 20px;
        .toolbar-brand-page {
            display: flex;
            height:36px;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            .brand-page-head {
                cursor: pointer;
                .avatar-small{
                    width: 36px;
                    height: 36px;
                    border-radius: 18px;
                }
                .company-page-icon {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                }
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
            .conversation-remark{
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
            .conversation-time{
                font-size: 12px;
                color: rgba(0,0,0,0.40);
                position: absolute;
                top: 0px;
                right: 20px;
            }
            .conversation-status{
                font-size: 12px;
                position: absolute;
                color: rgba(0,0,0,0.40);
                top: 25px;
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
            }
        }
        .empty-list{
            text-align: center;
            padding: 20px 0;
        }
    }
    .empty-content{
    text-align: center;
    margin-top: calc(~"50vh-75px");
}
}
</style>
