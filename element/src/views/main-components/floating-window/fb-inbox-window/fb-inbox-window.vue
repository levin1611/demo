<template>
    <div class="facebook-inbox-window">
        <div class="facebook-inbox-window-list" v-if="FacebookSplitShowList">
            <!-- 头部 -->
            <div class="floating-window-header">
                <div class="floating-window-header-title">{{$t('FB_message')}}</div>
                <div class="floating-window-fix-icon">
                   <Tooltip :content="$t('pin')" v-if="!isFixed">
                     <Icon custom="custom custom-float-window" @click.native="handleFixed" size="16" />
                   </Tooltip>
                    <Tooltip :content="$t('unpin')" v-else>
                      <Icon custom="custom custom-fixed-window" @click.native="handleUnFixed" size="16" />
                    </Tooltip>
                    <Icon custom="custom custom-modal-close" @click="handleWindowClose" style="margin-left:20px;"></Icon>
                </div>
            </div>
            <!-- 操作栏 -->
            <div class="facebook-inbox-window-toolbar" v-loading="brandPageLoading">
                <!-- 当用户未绑定任何facebook账号时显示--'...去绑定' -->
                <div style="padding:20px 0;" v-if="allPageList.length===0">
                    <span style="font-weight:bold;font-size:12px;line-height:32px;">{{$t('facebook.inbox.bindPageTip')}}</span>
                    <Button type="primary" style="float:right;" @click="goToBind">{{$t('facebook.inbox.gotoBind')}}</Button>
                </div>
                 <!-- 当用户已绑定facebook账号时显示--选择主页下拉菜单 -->
                <div class="toolbar-brand-page" v-else>
                    <!--
                        transfer transfer-class-name="facebook-inbox-page-dropdown" -->
                    <Dropdown trigger="click" @command="handlePageSelect" @visible-change="handlePageVisible">
                        <div class="brand-page-head">
                            <Badge :text="currentBrandPageAccessStatus===1?'':$t('facebook.onekeyRelease.creatContent.invalid')">
                                <Avatar :src="currentBrandPageAvatar" class="avatar-small" />
                                <svg class="svg-icon company-page-icon" aria-hidden="true" v-if="currentBrandPage.homePageType===1">
                                    <use xlink:href="#custom-facebook-company-page"></use>
                                </svg>
                            </Badge>
                            <div class="brand-page-name">{{currentBrandPageName}}</div>
                            <Icon type="ios-arrow-down"></Icon>
                        </div>
                        <DropdownMenu
                            slot="dropdown"
                            style="width:350px;"
                            class="brand-page-dropdown">
                             <!-- :selected="brandPage.userId===currentBrandPage.userId" -->
                                <DropdownItem v-for="brandPage in allPageList" :key="brandPage.userId" :command="brandPage.userId"
                                style="height:46px;display:flex;align-items: center; ">
                                <!-- justify-content: space-between; -->
                                    <!-- 检测token是否失效,1-有效 2-失效 -->
                                    <!-- <Badge :text="brandPage.access_status===1?'':$t('facebook.onekeyRelease.creatContent.invalid')">
                                        <Avatar :src="brandPage.avatar" style="width: 30px; height: 30px;border-radius: 15px;" />
                                        <svg class="svg-icon company-page-icon"
                                        style="position: absolute;bottom: 8px;right: 0;width:12px;"
                                        aria-hidden="true" v-if="brandPage.homePageType===1">
                                            <use xlink:href="#custom-facebook-company-page"></use>
                                        </svg>
                                    </Badge>
                                    <Tooltip :content="brandPage.userName" transfer max-width="200" class="brand-page-name-tooltip"
                                    style="max-width: 100px;margin: 0 8px;" :disabled="!pageMenuVisible">
                                        <span  style="font-size: 12px;width: 100px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;vertical-align: middle;">{{brandPage.userName}}</span>
                                    </Tooltip>
                                    <span v-if="brandPage.hasNewMessage || brandPage.unreadCount" style="font-size: 12px;">{{brandPage.unreadCount}}</span> -->
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
                                        <Col :span="15">
                                            <Tooltip :content="brandPage.userName" transfer  style="margin:12px 8px" :disabled="!pageMenuVisible">
                                                <span style="font-size: 12px;">{{brandPage.userName}}</span>
                                            </Tooltip>
                                        </Col>
                                        <Col :span="3"  style="padding-top:2px">
                                            <span v-show="(brandPage.access_status==1) && (brandPage.hasNewMessage || brandPage.unreadCount)" style="font-size: 12px;">
                                                <!-- min-width: 46px;text-align:end -->
                                                {{brandPage.unreadCount > 99 ? '99+' : brandPage.unreadCount }}
                                            </span>
                                        </Col>
                                        <Col :span="2" :offset="1" style="padding-top:2px">
                                            <span v-show="brandPage.access_status!==1" class="invalid-tip" @click="goToBind">{{$t('facebook.onekeyRelease.creatContent.invalid')}}</span>
                                        </Col>
                                    </Row>
                                </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <!-- 新消息提示 -->
                    <span class="page-message-tip" v-if="fbChatUnread > 0">{{$t('facebook.inbox.newMessage')}}</span>
                </div>
                <!-- 搜索框 -->
                <Input v-model="searchInput" :placeholder="$t('facebook.inbox.inputKeyWords')" @keyup.enter.native="handleSearch" size="large">
                <!-- 高级搜索气泡 -->
                    <Poptip v-model="searchPopShow" slot="append" placement="bottom-end" width="350" transfer popper-class="facebook-inbox-window-search-form">
                        <Icon  slot="reference" custom="custom custom-drop-down-triangle" size="8" style="cursor:pointer;"></Icon>
                        <div class="api">
                            <div style="font-size: 14px;padding: 20px 0 16px 4px;">{{$t('inbox.advancedSearch')}}</div>
                            <Form ref="searchForm" :model="searchForm" label-width="40px">
                                <!-- 日期 -->
                                <FormItem :label="$t('crm.Html.date')" prop="date">
                                    <DatePicker
                                        start-placeholder="开始日期"
                                        end-placeholder="结束日期"
                                        type="daterange"
                                        :placeholder="$t('filter_box.select_time')"
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
                                                :key="item.id"
                                                :value="item.id"
                                                :label="item.fullname"></Option>
                                    </Select>
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
                                      <CheckboxGroup v-model="searchForm.checkAllGroup" @change="checkAllGroupChange" style="display:flex;flex-direction: column;">
                                        <Checkbox :label="item.key" v-for="item in statusList" :key="item.key">{{item.value}}</Checkbox>
                                      </CheckboxGroup>
                                    </div>
                                </FormItem>
                                <!-- 清空、搜索按钮 -->
                                <FormItem style="text-align: right;margin-bottom: 10px;">
                                    <Button type="primary" plain @click="handleSearchAdvancedClear">{{$t('filter_box.empty')}}</Button>
                                    <Button style="margin-left: 8px" type="primary" @click="handleSearchAdvanced">{{$t('traffic.search')}}</Button>
                                </FormItem>
                            </Form>
                        </div>
                    </Poptip>
                    <Icon slot="append" custom="custom custom-search" size="15" style="margin-left:10px;cursor:pointer;" @click.native="handleSearch" />
                </Input>
            </div>
            <!-- 无数据提示 -->
            <div v-if="!conversationLoading&&conversationList.length===0" class="empty-list">{{$t('facebook.inbox.noData')}}</div>
            <!-- 私信列表 -->
            <Menu
                v-else
                ref="conversationMenu"
                :default-active="currentConversationId"
                width=auto
                @select="handleConversationSelect"
                >
                <!-- :style="{'height':`${scrollHeight}px`,'overflow':'auto'}"
                v-infinite-scroll="handleLoadConversation"
                :infinite-scroll-distance="10"
                infinite-scroll-immediate="false" -->
                <Scroll :on-reach-bottom="handleLoadConversation" :distance-to-edge="10" :height="scrollHeight">
                    <MenuItem class="Facebook-split-item" v-for="conversation in conversationList" :index="conversation.conversationId" :key="conversation.conversationId">
                        <!-- 头像 -->
                        <Badge :value="conversation.unreadCount" :hidden="conversation.unreadCount <= 0">
                            <Avatar :src="conversation.conversationAvatar" class="avatar-large" />
                        </Badge>
                        <!-- 昵称 + 接待客服 -->
                        <div class="conversation-name">
                            <!-- 昵称 -->
                            {{ conversation.conversationName }}

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
                        <!-- 右侧时间 + CRM 录入状态 -->
                        <div>
                            <span v-if="new Date(conversation.updateTime).toDateString()===new Date().toDateString()" class="float-conversation-time">{{conversation.updateTime | timeFormat("TimeHm")}}</span>
                            <span v-else class="float-conversation-time">{{conversation.updateTime | timeFormat("DateTimeMd")}}</span>
                            <span class="float-conversation-status" v-if="conversation.clue_status === 1">{{$t('chat.noEntry')}}</span>
                            <span class="float-conversation-status" v-else-if="conversation.clue_status === 101">{{$t('chat.clue')}}</span>
                            <span class="float-conversation-status" v-else-if="conversation.clue_status === 102">{{$t('chat.inquiries')}}</span>
                            <span class="float-conversation-status" v-else>{{$t('chat.nothingWith')}}</span>
                        </div>
                    </MenuItem>
                </Scroll>
            </Menu>
            <!-- 绑定主页失效提示弹窗 -->
            <Modal :visible.sync="tokenModal" :modal-append-to-body="false" width="360" :show-close="false" :close-on-click-modal="false">
                <p slot="title" style="color:#fff;">
                  {{$t('inbox.accountfailTip')}}
                </p>
                <div style="text-align:center">
                  {{$t('inbox.accountfailTip1')}}
                </div>
                <div slot="footer">
                    <Button type="primary" @click="goToBind">{{$t('facebook.inbox.gotoBind')}}</Button>
                </div>
            </Modal>
        </div>
        <!-- 聊天组件 -->
        <chat-box
            v-else
            :conversation-id="currentConversationId"
            :conversation="currentConversation"
            :page-avatar="currentBrandPageAvatar"
            :page-id="currentBrandPageId"
            :page-name="currentBrandPageName"
            :binding-user-id="currentBrandPageUserId"
            :let-chat-loading="letChatLoading"
            :websocket-chat="websocketChat"
            @handleSendMessage="handleSendMessage"
            @updateConversationStatus="status=>conversationList[currentConversationIndex].conversationStatus=status"
            @updateClueStatus="updateClueStatus"
            @updateRemark="data=>conversationList[currentConversationIndex].remark=data"
            @backToList="backToFacebookList">
        </chat-box>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import ChatBox from './ChatBox';
    import { fbCommon } from '@/api/facebook/index';

    const { getFbServiceList, getConversationList } = fbCommon;

    export default {
        name: 'FbInboxWindow',
        props: {
            isFixed: {

            },
            floatWindowType: {

            },
            update: {

            }
        },
        components: {
            ChatBox
        },
        data() {
            return {
                searchPopShow: false,
                canGoToBind: false,
                // 主页数据
                brandPageLoading: true,
                brandPageList: [],
                companyPageList: [],
                allPageList: [],
                currentBrandPage: {},
                currentBrandPageId: '',
                currentBrandPageAvatar: '',
                currentBrandPageName: '',
                currentBrandPageAccessToken: '',
                currentBrandPageAccessStatus: 0,
                currentBrandPageUserId: '',
                pageMenuVisible: '', // 下拉菜单显示状态

                searchInput: '',
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
                currentTab: 'fbChat',
                conversationSearchData: {},
                commentSearchData: {},
                noDataShow: true,

                // 会话数据
                chatShow: false,
                conversationLoading: false,
                conversationList: [],
                currentConversation: {},
                currentConversationId: '',
                currentConversationIndex: -1,
                currentConversationUnread: 0,
                conversationPage: 1,
                letChatLoading: false,
                websocketChat: {},

                tokenModal: false,

                // 延时获取 FB 主页列表计时器 id(避免 isFbService 还未请求完毕就请求主页列表, 导致显示的主页列表有误)
                getBrandPageTimer: null
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                isFbService: state => state.isFbService,
                hadSetIsFbService: state => state.hadSetIsFbService,
                websocketMsgFB: state => state.facebook.websocketMsgFB,
                window_height: state => state.window_height,
                fbChatUnread: state => state.facebook.fbChatUnread,
                FacebookSplitShowList: state => state.FacebookSplitShowList,
                fbServiceList: state => state.facebook.fbServiceList,
                menu_list: state => state.app.menu_list
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            scrollHeight() {
                return parseInt(this.window_height) - 264;
            },
            pageNewMessage() {
                for (const item of this.brandPageList) {
                    if (item.hasNewMessage) {
                        return true;
                    }
                }
                return false;
            }
        },
        methods: {
            updateClueStatus(data) {
                this.conversationList[this.currentConversationIndex].clue_status = data.status;
                this.conversationList[this.currentConversationIndex].clue_id = data.clue_id;
                this.currentConversation.clue_status = data.status;
                this.currentConversation.clue_id = data.clue_id;
            },
            backToFacebookList() {
                this.$store.commit('setFacebookSplitShowList', true);
            },
            handleFixed() {
                this.$emit('changeFixState', true);
            },
            handleUnFixed() {
                this.$emit('changeFixState', false);
            },
            handleWindowClose() {
                this.$emit('windowClose');
            },
            goToBind() {
                this.tokenModal = false;
                if (this.canGoToBind) {
                    this.$router.push({
                        name: 'account_binding'
                    });
                } else {
                    this.$Message.warning(this.$t('inbox.tip'));
                }
            },
            // 获取公共主页列表
            getBrandPage() {
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
                if (!this.hadSetIsFbService) {
                    this.getBrandPageTimer = setTimeout(() => {
                        // 到时间后删除旧计时器 id
                        this.getBrandPageTimer = null;
                        // 重新请求主页列表
                        this.getBrandPage();
                    }, 50);

                    // 停止向下执行
                    return;
                }

                this.brandPageLoading = true;
                this.companyPageList = [];
                this.brandPageList = [];
                this.allPageList = [];
                this.conversationLoading = true;
                util.ajaxInternational({
                    url: '/social/getBrandPage',
                    method: 'post',
                    data: {
                        userId: this.userId,
                        orgId: this.enterpriseId
                    // pageType: 'ReceiveBox'
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.brandPageLoading = false;
                        this.conversationLoading = false;
                        const dataList = response.data.data.map(item => {
                            item.hasNewMessage = 0;
                            return item;
                        });
                        for (const item of dataList) {
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
                            // this.$nextTick(()=>{
                            //     this.$refs.brandPageMenu.updateActiveName()
                            // })
                            } else {
                                this.currentBrandPage = this.allPageList[0];
                                this.currentBrandPageAvatar = this.allPageList[0].avatar;
                                this.currentBrandPageName = this.allPageList[0].userName;
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
                        this.$store.commit('setFbServiceList', Array.isArray(res.data) ? res.data : []);
                    } else {
                        this.$Message.error(this.$t('fbDistribution.error_getFbServiceList'));
                    }
                });
            },
            // 获取消息未读数
            getFacebookUnread() {
                console.log('请求未读数---floatWindow');
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
            handlePageSelect(name) {
                console.log('选中主页');
                this.conversationLoading = true;
                this.commentLoading = true;
                this.letChatLoading = true;
                this.letCommentLoading = true;
                this.currentBrandPageId = name;
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

                this.handleSearchAdvancedClear();
                this.searchInput = '';
                this.conversationSearchData = {};
                this.noDataShow = false;

                if (this.currentBrandPageAccessStatus === 1) {
                    this.getPageConversations();
                } else {
                    this.tokenModal = true;
                }
            },
            // 获取会话列表
            getPageConversations() {
                this.conversationLoading = true;
                let ajaxData = {
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
                    if (res.code === '1') {
                        this.conversationLoading = false;

                        // 数据处理
                        this.conversationList = this.handleConversationList(res.data.list);

                        if (this.conversationPage !== 1) {
                            if (res.data.list.length === 0) {
                                this.$Message.info(this.$t('facebook.inbox.noMoreMessage'));
                                this.conversationPage -= 1;
                            }
                        }
                    }
                });
            },
            // 处理请求得到的对话列表数据
            handleConversationList(arr) {
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
            // 会话列表滚动加载下一页
            handleLoadConversation() {
                this.conversationPage += 1;
                console.log('会话列表滚动加载下一页------', this.conversationPage);
                this.getPageConversations();
            },
            // 选中会话
            handleConversationSelect(name) {
                console.log(name, '选中会话');
                this.currentConversationId = name;
                this.letChatLoading = false;
                this.conversationList.forEach((item, index) => {
                    if (item.conversationId === name) {
                        this.currentConversation = item;
                        this.currentConversationIndex = index;
                        this.currentConversationUnread = item.unreadCount;
                        item.unreadCount = 0;
                    // this.$set(item,'unreadCount',0)
                    }
                });
                this.$store.commit('setFacebookSplitShowList', false);
                this.$emit('drawerClosable', false);
                this.updateConversationUnread(this.currentBrandPageId);

                // 更新对话接待客服信息
                this.updateServiceInfo(this.currentConversationId);
            },
            // 获取 conversationId 最新信息, 用以更新其接待客服显示
            updateServiceInfo(conversationId) {
                getConversationList({
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
            // 更新会话未读消息条数
            updateConversationUnread(currentPageId) {
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


                this.conversationSearchData = {
                    conversationName: this.searchInput
                };

                this.getPageConversations();
            },
            // 高级搜索
            handleSearchAdvanced() {
                // 需要清空会话数据
                this.conversationList = [];
                this.conversationPage = 1;

                this.conversationSearchData = {
                    startDate: this.$options.filters.timeFormat(this.searchForm.date[0]),
                    endDate: this.$options.filters.timeFormat(this.searchForm.date[1]),
                    remark: this.searchForm.remark,
                    conversationName: this.searchForm.name,
                    userIds: this.searchForm.service.join(','),
                    status: this.searchForm.checkAllGroup.join(',')
                };

                this.getPageConversations();
                this.searchPopShow = false;
            },
            // 清空搜索数据
            handleSearchAdvancedClear() {
                this.$refs.searchForm ? this.$refs.searchForm.resetFields() : '';
                // this.$refs.searchForm.resetFields();
                this.searchForm.checkAll = false;
                this.searchForm.checkAllGroup = [];
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
                console.log(visible, 'visible-------------');
                this.pageMenuVisible = visible;
            }
        },
        created() {
            this.canGoToBind = this.isContainsMenu('account_binding');
        },
        mounted() {
            // 不知道干啥的？
            // document.getElementsByClassName('ivu-date-picker-transfer')[0].onclick = function() {
            //     event.stopPropagation();
            // };
        },
        activated() {

        },
        watch: {
            // 切换悬浮窗显隐时, 重新请求
            update: {
                handler(val) {
                    if (val && this.floatWindowType === 'inbox') {
                        this.getBrandPage();
                        // 请求 FB 主页客服
                        this.updateFbServiceList();
                        this.handleSearchAdvancedClear();
                    }
                },
                immediate: true
            },
            menu_list(val) {
                this.canGoToBind = this.isContainsMenu('account_binding');
            },
            FacebookSplitShowList(val) {
                if (val) {
                    this.currentConversation = {};
                    this.currentConversationId = '';
                }
            },
            websocketMsgFB(val) {
                console.log(val);
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
                            console.log(fbChatUnread);
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
                                getConversationList({
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
                                                this.currentConversationIndex += 1;
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
                        // 其他主页收到消息，
                        // 由于已经有新消息数量提示，因此不再做未读消息的数量增加，否则导致显示数量与实际消息数不符
                        this.updateBrandePage(val.pageId, true);
                        this.allPageList.forEach((item) => {
                            if (item.userId === val.pageId) {
                                item.hasNewMessage += 1;
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
            }
        }

    };
</script>

<style lang="less">
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

<style lang="less" scoped>
@import url('../floating-window.less');
.facebook-inbox-window {
    .facebook-inbox-window-list {
        .facebook-inbox-window-toolbar {
            padding: 0 20px;
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
        .empty-list{
            text-align: center;
            padding: 20px 0;
        }
        .Facebook-split-item {
             height: 68px;
            display: flex;
            align-items: center;
            /deep/ .el-badge__content {
                width: 18px;
                height: 18px;
                text-align: center;
            }
            /deep/ .el-badge__content.is-fixed {
                top: 10px;
                right: 12px;
            }
            .avatar-large{
                width: 46px;
                height: 46px;
                border-radius: 23px;
            }
            .conversation-name {
                font-size: 14px;
                color: rgba(0,0,0,0.80);
                font-weight: 700;
                padding: 0 10px;
                line-height: 16px;
            }
            .conversation-customerService {
                padding-top: 7px;
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
            .float-conversation-time{
                font-size: 12px;
                color: rgba(0,0,0,0.40);
                position: absolute;
                top: 0px;
                right: 20px;
            }
            .float-conversation-status{
                font-size: 12px;
                position: absolute;
                color: rgba(0,0,0,0.40);
                top: 25px;
                right: 20px;
            }
        }
    }
}
</style>
