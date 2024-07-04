<template>
    <div class="whatsapp-manage">
        <WhatsAppReplyModal
            :visibleReplyModal="visibleReplyModal"
            v-on:closeReplyModal="closeReplyModal"
            v-on:getWhatsAppInfo="getWhatsAppInfo"
            v-on:changeLoading="changeLoading"
        />
        <Row>
            <!-- 左侧消息、通讯录列表 -->
            <Col :span="6" :style="{height:content_height,background:'#FAFCFF',boxShadow: 'inset -1px 0 0 0 #F5F5F5'}">
                <!-- toolbar -->
                <div class="whatsapp-manage-toolbar">
                    <!-- 用户未登录WA账号 -->
                    <Spin fix v-if="WAAccountLoading"></Spin>
                    <!-- 账号未登录，登陆提示和登陆按钮 -->
                    <div v-if="!whatsAppAccountInfo.whatsappAccount" style="padding:20px 0;">
                        <span style="font-weight:bold;font-size:12px;line-height:32px;">{{$t('whatsapp_manage.loginPageTip')}}</span>
                        <!-- <Button type="primary" class="whatsapp-manage-goToLogin" style="float:right;" @click="goToLogin">{{$t('whatsapp_manage.goToLogin')}}</Button> -->
                    </div>
                    <!-- 用户已登录WA账号 -->
                    <div class="toolbar-brand-page" v-else>
                        <div class="brand-page-head">
                            <Avatar v-if="whatsAppAccountInfo.whatsappAvatar" :src="whatsAppAccountInfo.whatsappAvatar" class="avatar-small" />
                            <svg v-else class="chat-svg-avatar" aria-hidden="true">
                                <use xlink:href="#custom-visitor-avatar"></use>
                            </svg>
                            <div :class="ServiceStatus"></div>
                            <div>
                                <Tooltip :content="whatsAppAccountInfo.whatsappName ? whatsAppAccountInfo.whatsappName : toggleWAAccount(whatsAppAccountInfo.whatsappAccount)" transfer class="chat-name-tooltip">
                                    <div v-if="whatsAppAccountInfo.whatsappName" class="brand-page-name">{{whatsAppAccountInfo.whatsappName}}</div>
                                    <div v-else class="brand-page-name">{{toggleWAAccount(whatsAppAccountInfo.whatsappAccount)}}</div>
                                </Tooltip>
                                <!-- 登陆失效,头像下的提示 -->
                                <div class="login_prompt login_prompt_online" v-if="whatsAppAccountInfo.loginStatus == 1">{{$t('whatsappSetting.online')}}</div>
                                <div class="login_prompt login_prompt_unonline" v-else-if="whatsAppAccountInfo.loginStatus == 5">{{$t('whatsappSetting.mobileUnconnect')}}</div>
                                <div class="login_prompt login_prompt_unonline" v-else>{{$t('whatsappSetting.loginInvalid')}}</div>
                            </div>
                        </div>
                        <!-- WA一期需求：只满足一个询盘云账号只绑定一个WA账号，新消息提示在绑定多账号下才有提示的必要，先去掉新消息的逻辑 -->
<!--                        <div v-if="hasNewWaMsg" style="color: red;font-size: 12px">新消息</div>-->
                        <div v-if="whatsAppAccountInfo.loginStatus !== 5 && whatsAppAccountInfo.loginStatus !== 1" class="invalid-tip whatsapp-manage-invalid">
                            <Button style="padding:10px 11px;" :loading="loginAgain" type="primary" class="whatsapp-manage-goToLogin piwik_whatsApp_chat_reLogin" @click="goToLogin">{{$t('whatsappSetting.loginAgain')}}</Button>
                        </div>
                        <div v-else-if="whatsAppAccountInfo.loginStatus === 5" class="whatsapp-manage-noNetwork">
                            <Tooltip :content="$t('whatsapp_manage.notNetworkTip')" placement="top">
                                <Icon class="custom custom-no-network-connection" size="24"></Icon>
                            </Tooltip>
                        </div>
                        <!-- <div v-if="whatsAppAccountInfo.loginStatus === 4" class="whatsapp-manage-logout" @click="reconnectWA">
                            <Button class="piwik_reconnect_whatsapp_manage" :loading="reconnecting" style="padding: 10px;" type="primary">重新连接</Button>
                        </div> -->
                    </div>
                    <!-- 搜索框部分 -->
                    <Input
                            v-model="WASearchKeyWords"
                            :placeholder="$t('whatsapp_manage.WASearchPlaceholder')"
                            @keyup.enter.native="handleKeyUp"
                            size="large"
                            :clearable="true"
                            @clear="whatsAppSearch">
                        <span slot="append" ref="WASearchIcon" @click="whatsAppSearch" class="piwik_whatsApp_search">
                            <Icon custom="custom custom-search" size="15" style="margin-left:10px;cursor:pointer;" />
                        </span>
                    </Input>
                </div>
                <!-- 消息列表和通讯录 -->
                <Tabs
                        size="small"
                        v-model="selectedTab"
                        :animated="false"
                        @tab-click="handleTabChange"
                        class="whatsapp-tab">
                    <TabPane name="ChatList">
                        <div slot="label" class="whatsapp-manage-chatList whatsapp-manage-label">
                            <Badge  :is-dot="WAUnreadCount ? WAUnreadCount > 0 : false">
                                {{$t('whatsapp_manage.chatList')}}
                            </Badge>
                        </div>
                        <div v-if="!chatListLoading && !chatList.length" class="empty-list">{{$t('facebook.inbox.noData')}}</div>
                        <Menu
                                v-else
                                ref="chatListMenu"
                                :default-active="activeIndex"
                                :active-name="selectedChatInfo.chatWaAccount"
                                @select="handleToggleChat"
                        >
                            <Spin fix v-if="chatListLoading"></Spin>
                            <Scroll :on-reach-bottom="getMoreChatList" :distance-to-edge="10" :height="scrollHeight">
                                <MenuItem class="WA-chatList" v-for="chat in chatList" :index="chat.id.toString()" :key="chat.id">
                                    <Badge :max="99" :value="chat.unread" :hidden="chat.unread <= 0">
                                        <Avatar v-if="chat.chatWaAvatar" :src="chat.chatWaAvatar" class="avatar-large" />
                                        <svg v-else class="chat-svg-avatar avatar-large" aria-hidden="true">
                                            <use xlink:href="#custom-visitor-avatar"></use>
                                        </svg>
                                    </Badge>
                                    <div class="WA-chatList-content">
                                        <div class="WA-chatList-content-chatWaName">
                                            <p>
                                                <Tooltip :content="chat.chatWaName ? chat.chatWaName : toggleWAAccount(chat.chatWaAccount)" transfer class="chat-name-tooltip">
                                                    <span v-if="chat.chatWaName" class="chat-name ellipsis">{{chat.chatWaName}}</span>
                                                    <span v-else class="chat-name ellipsis">{{toggleWAAccount(chat.chatWaAccount)}}</span>
                                                </Tooltip>
                                                <Tooltip v-if="chat.remark" :content="chat.remark" transfer class="chat-name-tooltip">
                                                    <div class="chat-remark" v-if="chat.remark">{{chat.remark}}</div>
                                                </Tooltip>
                                            </p>
                                            <span class="chat-time">{{timeFormat(Number(chat.lastChatTime))}}</span>
                                        </div>
                                          <!-- 输入中 -->
                                        <div v-if="chat.onlineStatus === 'composing'"
                                             style="color: #FF752A;font-size: 12px;line-height: 18px;padding-left: 10px;">{{ $t('whatsapp_manage.composing') }}</div>

                                        <!-- 最后一条消息 + 录入状态 -->
                                        <div v-else
                                             class="WA-chatList-content-lastContent">
                                            <!-- 最后一条消息 -->
                                            <p :title="chat.lastChatContent"
                                               :class="{'last-content-single':(chat.leadscloudStatus === 1 && chat.clientType),'last-content':(chat.leadscloudStatus != 1 || !chat.clientType)}">
                                                <!-- 消息发送状态图标(最后一条消息是'我'发的才显示状态图标) -->
                                                <Icon v-if="chat.fromMe && Number.isInteger(chat.readFlag)"
                                                      :custom="getReadStatusIcon(chat.readFlag)"
                                                      class="WA-chatList-content-lastContent-readStatus"></Icon>

                                                <!-- 消息体文本 -->
                                                {{ getMessageContent(chat.lastChatType, chat.lastChatContent) }}
                                            </p>

                                            <!-- 录入状态 -->
                                            <span @mouseenter="updateWAAccountCrmStatus(chat.chatWaAccount)"
                                                  class="chat-time"
                                                  style="line-height:18px;">{{ getLeadsCloudStatus(chat.leadscloudStatus) }}</span>
                                        </div>
                                         <div class="WA-chatList-content-lastContent" v-if="chat.leadscloudStatus === 1 && chat.clientType">
                                             <p class="last-content-single">
                                                <Tooltip :content="`${$t('crm.Modal.corp_clientType')} : ${chat.clientType ? chat.clientType : '-'}`" transfer placement="bottom-start">
                                                    <span>{{chat.clientType}}</span>
                                                </Tooltip>
                                            </p>
                                         </div>
                                    </div>
                                </MenuItem>
                            </Scroll>
                        </Menu>
                    </TabPane>
                    <TabPane name="ContactList" >
                        <div slot="label" class="whatsapp-manage-contactList whatsapp-manage-label">
                            {{$t('whatsapp_manage.contactList')}}
                        </div>
                        <div v-if="!contactList.length" class="empty-list">{{$t('facebook.inbox.noData')}}</div>
                        <Menu
                                v-else
                                ref="contactListMenu"
                                :active-name="selectedContactInfo.contactWaAccount"
                                @select="handleToggleChat"
                        >
                            <Spin fix v-if="contactListLoading"></Spin>
                            <Scroll :on-reach-bottom="getMoreContactList" :distance-to-edge="10" :height="scrollHeight">
                                <!-- 将联系人按照首字母分组--暂未实现 -->
                                <!--<div v-for="(contactItem, index) in contactList" :key="index">
                                    <div style="background-color: #F3F6FA;">{{contactItem.category}}</div>-->
                                <MenuItem class="WA-chatList" v-for="contact in contactList" :index="contact.id.toString()" :key="contact.id">
                                    <Avatar v-if="contact.contactWaAvatar" :src="contact.contactWaAvatar" class="avatar-large" />
                                    <svg v-else class="chat-svg-avatar avatar-large" aria-hidden="true">
                                        <use xlink:href="#custom-visitor-avatar"></use>
                                    </svg>
                                    <div class="WA-chatList-content">
                                        <div class="WA-chatList-content-chatWaName">
                                            <p>
                                                <Tooltip :content="contact.contactWaName ? contact.contactWaName : toggleWAAccount(contact.contactWaAccount)" transfer class="chat-name-tooltip">
                                                    <span v-if="contact.contactWaName" class="chat-name ellipsis">{{contact.contactWaName}}</span>
                                                    <span v-else class="chat-name ellipsis">{{toggleWAAccount(contact.contactWaAccount)}}</span>
                                                </Tooltip>
                                                <Tooltip v-if="contact.remark" :content="contact.remark" transfer class="chat-name-tooltip">
                                                    <div class="chat-remark" v-if="contact.remark">{{contact.remark}}</div>
                                                </Tooltip>
                                            </p>
                                            <span style="opacity: 0.4;position: absolute;right: 20px;font-size: 12px;" @mouseenter="updateWAAccountCrmStatus(contact.contactWaAccount)">{{ getLeadsCloudStatus(contact.leadscloudStatus) }}</span>
                                        </div>
                                        <div class="WA-chatList-content-chatWaName" v-if="contact.leadscloudStatus === 1 && contact.clientType">
                                            <p class="last-content-single" style="padding-left:10px">
                                                <Tooltip :content="`${$t('crm.Modal.corp_clientType')} : ${contact.clientType}`" transfer placement="bottom-start">
                                                    <span>{{contact.clientType}}</span>
                                                </Tooltip>
                                            </p>
                                        </div>
                                    </div>
                                </MenuItem>
                                <!-- </div>-->
                            </Scroll>
                        </Menu>
                    </TabPane>
                </Tabs>
            </Col>
            <Col :span="18">
                <!-- 中部 whatsApp 聊天框 -->
                <Col :span="littleDrawerVisible ? 14 : 24" :style="{height:content_height,background:'#fff',width:`${littleDrawerVisible ? (menuExpand ? '61.1111%': '63.7777%' ): '100%'}`}">
                    <div v-if="selectedTab === 'ChatList' && selectedChatInfo.chatWaAccount" style="position: relative;height: 100%;border-right: 1px solid #e8e8e8;">
                        <!--
                        需要传参：
                        chatWaAccount：当前会话对象的账号
                        -->
                        <whatsAppChat
                                ref="chatWindow"
                                :currAccountInfo="selectedChatInfo"
                                :whatsAppAccountInfo="whatsAppAccountInfo"
                                :WAWebsocketChat="WAWebsocketChat"
                                :isShowVisitorDetail="isShowVisitorDetail"
                                :isShowCRMDetail="isShowCRMDetail"
                                @toggleShowLittleDrawer="toggleShowLittleDrawer"
                                @updateSelectedRemark="updateSelectedRemark"
                                @updateLastChatContent="updateLastChatContent"
                                @updateWAAccountCrmStatus="updateWAAccountCrmStatus"
                                @toggleShowVisitorDetail="toggleShowVisitorDetail"
                                @toggleShowCRMDetail="toggleShowCRMDetail"></whatsAppChat>
                    </div>
                    <div v-else-if="selectedTab === 'ContactList' && selectedContactInfo.contactWaAccount" style="position: relative;height: 100%;border-right: 1px solid #e8e8e8;">
                        <!--
                        需要传参：
                        chatWaAccount：当前会话对象的账号
                        -->
                        <whatsAppChat
                                ref="chatWindow"
                                :currAccountInfo="selectedContactInfo"
                                :whatsAppAccountInfo="whatsAppAccountInfo"
                                :WAWebsocketChat="WAWebsocketChat"
                                :isShowVisitorDetail="isShowVisitorDetail"
                                :isShowCRMDetail="isShowCRMDetail"
                                @toggleShowLittleDrawer="toggleShowLittleDrawer"
                                @updateSelectedRemark="updateSelectedRemark"
                                @updateLastChatContent="updateLastChatContent"
                                @updateWAAccountCrmStatus="updateWAAccountCrmStatus"
                                @toggleShowVisitorDetail="toggleShowVisitorDetail"
                                @toggleShowCRMDetail="toggleShowCRMDetail"></whatsAppChat>
                    </div>
                    <div v-else style="position: relative;height: 100%">
                        <!-- 改为一进来就显示二维码登陆 -->
                        <showQRCode v-if="!whatsAppAccountInfo.whatsappAccount" @hasLoginSuccess="loginWA" :currentQRCode="'LargeQRCode'"></showQRCode>
                        <div v-else class="confirm-login">
                            <Icon custom="custom custom-WhatsApp" size="52" style="color: #3AC34C;"></Icon>
                            <div style="margin-top: 10px;">{{$t('whatsapp_manage.chatTip')}}</div>
                        </div>
                    </div>
                </Col>

                <!-- 右侧访客详情 -->
                <Col v-show="littleDrawerVisible"
                    :span="10" style="width:36%"
                    class="top-height chat-info">
                    <littleDrawer 
                        :visible="littleDrawerVisible"
                        :id="toWaAccount"
                        :currAccountInfo="currAccountInfo"
                        :selectOptions="selectOptions"
                        :corp_columns_authorized="corp_columns_authorized"
                        :inquiry_columns_authorized="inquiry_columns_authorized"
                        :contact_columns_authorized="contact_columns_authorized"
                        type="journeyDetail"
                        from="whatsApp"
                        @littleDrawerHidden="littleDrawerHidden"
                    ></littleDrawer>
                </Col>
                <!-- <Col :span="10"
                    v-if="isShowVisitorDetail && !isShowCRMDetail"
                    style="position: absolute;top: 0;right: 0; height: 100%; width:39.9999%"
                    class="visitor-detail-container">
                    <Tabs v-if="visitorDetailTabs.length"
                        class="visitor-tab"
                        v-model="currentVisitorTab"
                        @tab-click="getRelatedInfoByWhatsApp">
                        <TabPane v-for="tab in visitorDetailTabs"
                                :key="tab.key"
                                :name="tab.key"
                                :label="tab.title">
                        </TabPane>
                    </Tabs>
                    <Spin fix v-if="visitorDetailLoading"></Spin>
                    <component
                            :is="currentVisitorTab"
                            :visitorList="webInteractionRelatedInfo"
                            :propsData="facebookInteractionRelatedInfo"
                            :whatsAppRelatedInfo="whatsAppRelatedInfo"
                    ></component>
                </Col> -->
            </Col>
        </Row>
        <Modal
                title="提示"
                :visible.sync="showReconnectModal"
                :close-on-click-modal="false"
                :modal-append-to-body="false"
                @close="showReconnectModal = false"
                top="40vh"
                width="488px">
            <div>您的 WhatsApp 帐号已在另一个浏览器或者电脑中启用，点击“重新连接”便可继续使用询盘云登录 WhatsApp。</div>
            <div slot="footer">
                <Button @click="() => showReconnectModal = false">{{$t('cancel')}}</Button>
                <!-- 去掉了 @click="reconnectWA" 事件 <Button class="piwik_reconnect_whatsapp_manage" :loading="reconnecting" @click="reconnectWA" style="padding: 10px;" type="primary">重新连接</Button> -->
                <Button class="piwik_reconnect_whatsapp_manage" :loading="reconnecting" style="padding: 10px;" type="primary">重新连接</Button>
            </div>
        </Modal>
        <Modal
                :title="$t('mail.leaveConfirm')"
                :visible.sync="showToggleChatConfirm"
                :close-on-click-modal="false"
                :modal-append-to-body="false"
                @close="showToggleChatConfirm = false"
                top="40vh"
                width="488px">
            <div>{{$t('whatsapp_manage.toggleChatConfirmTip1')}}</div>
            <div slot="footer">
                <Button type="primary" plain @click="() => showToggleChatConfirm = false">{{$t('cancel')}}</Button>
                <Button v-if="selectedTab === 'ChatList'" @click="handleSelectChat" style="padding: 10px;" type="primary">确定</Button>
                <Button v-else @click=" handleSelectContact" style="padding: 10px;" type="primary">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    // 引入登陆弹窗组件
    import WhatsAppReplyModal from './components/WhatsAppReplyModal.vue';
    // 引入一进入就扫码登陆组件
    import showQRCode from '../systemSettings/whatsapp-setting/components/show-QR-code.vue';
    import whatsAppChat from './whatsApp-chat-frame/whatsAppChat';
    import WASearch from '@/views/main-components/search-input/search-input';
    // import WhatsAppRelatedRecords from './components/visitor-whatsApp-line';
    // import WebInteraction from '@/views/facebook/inbox/components/LocusSide';
    // import FacebookInteraction from '@/views/main-components/timeline/facebook-interaction/FacebookInteractionInfo';
    // import ClueDetail from '@/views/main-components/tiny-detail/clue-detail/ClueDetail';
    // import InquiryDetail from '@/views/main-components/tiny-detail/Inquiry-detail/InquiryDetail';
    import littleDrawer from '@/views/main-components/little-drawer/little-drawer.vue';
    import { mapState, mapGetters } from 'vuex';
    import util from '@/libs/util';
    import { getWAAccountAvatar, getWACRMStatus } from '@/api/whatsapp';
    // import state from '../../store/state';

    export default {
        name: 'WhatsAppManage',
        components: {
            whatsAppChat,
            WASearch,
            // WebInteraction,
            // FacebookInteraction,
            // WhatsAppRelatedRecords,
            // ClueDetail,
            // InquiryDetail,
            WhatsAppReplyModal,
            showQRCode,
            littleDrawer
        },
        props: {
            content_height: {
                type: String,
                default: '800px'
            }
        },
        computed: {
            ...mapState({
                orgId: state => state.enterpriseId,
                userId: state => state.userId,
                lang: state => state.app.lang,
                WAUnreadCount: state => state.whatsapp.WAUnreadCount,
                websocketMsgWA: state => state.whatsapp.websocketMsgWA,
                menuExpand: state => state.menuExpand
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            scrollHeight() {
                return parseInt(this.content_height) - 205;
            },
            // 当前对话/联系人的 WA 账号
            toWaAccount() {
                let result = '';
                if (this.selectedTab === 'ChatList') {
                    result = this.selectedChatInfo.chatWaAccount;
                } else {
                    result = this.selectedContactInfo.contactWaAccount;
                }
                return result;
            },
            // 头像右下角在线标识
            ServiceStatus() {
                return this.whatsAppAccountInfo.loginStatus == 1 ? 'success-dot' : 'default-dot';
            },
            currAccountInfo(){
                if(this.selectedTab === 'ChatList'){
                    return this.selectedChatInfo
                }else {
                    return this.selectedContactInfo
                }
            }
        },
        data() {
            return {
                loginAgain: false,
                visibleReplyModal: false, // 弹窗登陆,传参
                canGoToLogin: false, // 当前用户是否拥有WA设置的功能权限
                whatsAppAccountInfo: {}, // 当前用户登录的WA账号信息
                selectedTab: 'ChatList', // 当前显示的Tab页
                chatList: [], // 当前登录WA账号的消息列表
                contactList: [], // 当前登录WA账号的通讯录列表
                seletedWhatsAppId: '', // 当前选中的会话id
                selectedChatInfo: '', // 左侧消息列表选中项的信息
                selectedContactInfo: '', // 左侧通讯录选中项的信息
                chatListPage: 1, // 消息列表页码数
                contactListPage: 1, // 通讯录页码数
                pageSize: 15, // 消息列表每页加载条数
                WAWebsocketChat: {}, // 通过websocket推送收到的WA消息
                // hasNewWaMsg: false, // 当前登录的WA账号是否有新收到的消息
                WAAccountLoading: true, // 正在获取当前登录用户绑定的WA账号
                chatListLoading: false, // 正在获取当前登录用户绑定的WA账号的消息列表
                contactListLoading: false, // 正在获取当前登录用户绑定的WA账号的通讯录
                activeIndex: '', // 当前选中的列表项标识
                contactWaAccountList: [], // 需要查询crm状态的WhatsApp账号集合
                showReconnectModal: false, // 是否显示重新连接的提示弹窗
                reconnecting: false, // WA重连中
                WASearchKeyWords: '', // 搜索关键词
                visitorDetailLoading: false, // 正在获取右侧访客关联详情页的信息
                isShowVisitorDetail: false, // 是否显示右侧的访客关联详情页
                visitorDetailTabs: [], // 右侧显示的访客信息详情页的tab
                currentVisitorTab: '', // 当前选中的访客信息详情页的tab
                webInteractionRelatedInfo: [], // 当前WhatsApp账号关联的网站交互信息
                facebookInteractionRelatedInfo: [], // 当前WhatsApp账号关联的Facebook交互信息
                whatsAppRelatedInfo: [], // 当前WhatsApp账号关联的其他WhatsApp信息
                showToggleChatConfirm: false, // 用户切换会话时，若存在未发送的附件列表，需要进行离开确认

                corp_columns_authorized: {},
                contact_columns_authorized: {},
                inquiry_columns_authorized: {},
                salesList: [], // 获取的销售人员列表
                selectOptions: {},
                /* 多语言 */
                lang_contact: {
                    nickName: this.$t('crm.Modal.contact_nickName'),
                    jobTitle: this.$t('crm.Modal.contact_jobTitle'),
                    email: this.$t('crm.Modal.contact_email'),
                    phone: this.$t('crm.Modal.contact_phone'),
                    jobGrade: this.$t('crm.Modal.contact_jobGrade'),
                    socialNetworkingPlatform: this.$t('crm.Modal.contact_socialNetworkingPlatform'),
                    birthday: this.$t('crm.Modal.contact_birthday'),
                    gender: this.$t('crm.Modal.contact_gender'),
                    picture: this.$t('crm.Modal.contact_picture'),
                    remark: this.$t('crm.Modal.contact_remark')
                },
                lang_inquiry: {
                    productCategory: this.$t('crm.Modal.inq_productCategory'),
                    demandProducts: this.$t('crm.Modal.inq_demandProducts'),
                    inquiryScore: this.$t('crm.Modal.inq_inquiryScore'),
                    label: this.$t('crm.Modal.inq_label'),
                    sourceChannel: this.$t('crm.Modal.inq_sourceChannel'),
                    sourceWay: this.$t('crm.Modal.inq_sourceWay'),
                    grouping: this.$t('crm.Modal.inq_grouping'),
                    followUp: this.$t('crm.Modal.inq_followUp'),
                    remark: this.$t('crm.Modal.inq_remark')
                },
                lang_company: {
                    companyName: this.$t('crm.Modal.corp_companyName'),
                    starLevel: this.$t('crm.Modal.corp_starLevel'),
                    shortName: this.$t('crm.Modal.corp_shortName'),
                    countryArea: this.$t('crm.Modal.corp_countryArea'),
                    mainProduct: this.$t('crm.Modal.corp_mainProduct'),
                    scale: this.$t('crm.Modal.corp_scale'),
                    clientType: this.$t('crm.Modal.corp_clientType'),
                    homePage: this.$t('crm.Modal.corp_homePage'),
                    phone: this.$t('crm.Modal.corp_phone'),
                    fax: this.$t('crm.Modal.corp_fax'),
                    contactAddress: this.$t('crm.Modal.corp_contactAddress'),
                    relatedCompany: this.$t('crm.Modal.corp_relatedCompany'),
                    companyPicture: this.$t('crm.Modal.corp_companyPicture'),
                    companyRemark: this.$t('crm.Modal.corp_companyRemark')
                },

                /* 右侧 CRM 录入信息 */
                // 是否显示 CRM 录入信息
                isShowCRMDetail: false,
                // 在线状态变为'输入中'时, 设置 5s 延时, 5s 后从'输入中'恢复到之前的状态
                timer_recoverFromComposing: {},

                // 账号对应的 CRM 数据, 格式为 { clueId, companyId, contactsId, inquiryId }
                waRelatedCRMInfo: {},
                // 小窗相关
                littleDrawerVisible: false,
                conversationId: ''
            };
        },
        methods: {
            // 登录成功后触发的方法
            loginWA() {
                this.getWALoginAccount();
            },
            // 改变loading状态
            changeLoading(val) {
                val == true ? this.loginAgain = true : this.loginAgain = false;
            },
            // 关闭登陆弹窗
            closeReplyModal() {
                this.visibleReplyModal = false;
            },
            // wa掉线 重新连接   废弃
            /*
            goReconnection(){
                this.reconnecting = true;
                let jid = this.whatsAppAccountInfo.whatsappAccount;
                util.ajaxInternational({
                    url: '/whatsapp/waUserBind/reconnect?jid=' + jid,
                    method: 'POST',
                })
                .then(res => {
                    // SUCCESS(10000001,"重连成功"),                     //隐藏失效状态和重新链接按钮
                    // RECONNET_ERROR(10002001, "重连错误"),              //弹出登录二维码
                    // RECONNET_TIMEOUT_ERROR(10002002, "重连超时"),      //提示请保持手机联网或者弹出二维码--处理逻辑待定
                    // RECONNET_NO_AUTHINFO_ERROR(10002003, "没有认证文件"), //弹出登录二维码
                    // RECONNET_UNPAIRED_ERROR(10002004, "认证文件不匹配"),  //弹出登录二维码
                    // RECONNET_ACCESS_DENIED_ERROR(10002005, "权限拒绝"),   //弹出登录二维码
                    // RECONNET_ALREADY_LOGGEDIN_ERROR(10002006, "已经登录"), //弹出登录二维码
                    // RECONNET_ANOTHER_LOGIN_ERROR(10002007, "另一处登录"), //弹出登录二维码
                    // RECONNET_REUSE_PREVIOUS_QR_LOGIN_ERROR(10002008, "重复使用前一个二维码"); //弹出登录二维码
                    if(res.data.code == 10000001){
                    this.reconnecting = false;
                        this.whatsAppAccountInfo.loginStatus = 1;
                        this.$Message({
                            message: this.$t(res.data.message),
                            type: 'success',
                            duration: 3000
                        });
                    }else if(res.data.code == 10002001 || 10002003 || 10002004 || 10002005 || 10002006 || 10002007 || 10002008){
                        this.whatsAppAccountInfo.loginStatus = 5;
                        this.$Message({
                            message: this.$t(res.data.message),
                            type: 'error',
                            duration: 3000
                        });
                    }else if(res.data.code == 10002002){
                        this.$Message({
                            message: this.$t(res.data.message),
                            type: 'error',
                            duration: 3000
                        });
                    }
                })
                .catch(err => {
                    this.reconnecting = false;
                    console.log(err);
                    this.$Message({
                        message: this.$t(err.data.message),
                        type: 'error',
                        duration: 3000
                    });
                });
            }, */
            /* 获取当前询盘云登录用户绑定的WA账号列表 */
            getWALoginAccount() {
                util.ajaxInternational({
                    url: '/whatsapp/waUserBind/getWaUserBind',
                    method: 'GET',
                    params: {
                        orgId: this.orgId,
                        userId: this.userId
                    }
                }).then(res => {
                    /* 登录状态  0未登录成功  1登录成功  2失效  3退出登录(询盘云退出)
                        4whatsapp账号被踢掉  5手机whatsapp未联网  6在手机上把我们这个web登录给退出了 */
                    /** 3和6一样的 > 显示按钮 > 去登陆 */
                    /** 2失效 > 显示按钮 > 重新连接 */
                    /** 5手机whatsapp未联网 > 显示按钮 > 重新登陆 */
                    this.WAAccountLoading = false;
                    if (res.data.code === 1) {
                        if (res.data.data[0]) {
                            this.whatsAppAccountInfo = res.data.data[0];
                            this.getWhatsAppInfo();
                        } else {
                            this.$store.commit('setWAUnreadCount', 0);
                        }
                    }
                });
            },
            // 获取WhatsApp相关数据
            async getWhatsAppInfo() {
                const temp = JSON.parse(localStorage.getItem('leadsCloud-WA-WAAccount'));
                if (temp && temp.WAAccount) {
                    const result = await this.updateWAAccountCrmStatus(temp.WAAccount, 'globalSearch');
                    this.selectedChatInfo = {
                        leadscloudStatus: result === 0 ? result : result[0].leadscloudStatus,
                        chatWaAvatar: '',
                        contactWaAvatar: '',
                        chatWaAccount: temp.WAAccount,
                        chatWaName: temp.WAAccountName,
                        remark: temp.remark,
                        userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount
                    };
                }
                localStorage.removeItem('leadsCloud-WA-WAAccount');
                this.getWhatsAppUnreadCount();
                this.getWAChatList();
                this.getWAContactList();
            },
            // 获取当前登录用户绑定的WhatsApp未读数
            getWhatsAppUnreadCount() {
                util.ajaxInternational({
                    url: '/whatsapp/chatList/noReadCount',
                    method: 'POST',
                    data: {
                        userId: this.userId,
                        orgId: this.orgId
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        this.$store.commit('setWAUnreadCount', res.data.data);
                    }
                });
            },
            // 判断当前用户是否拥有WA设置的功能权限，有则跳转至登录页面，反之提示用户无权限
            goToLogin() {
                this.canGoToLogin = this.isContainsMenu('whatsapp_setting');
                if (this.canGoToLogin) {
                    // 如果有弹窗登陆则进行提示
                    if (this.visibleReplyModal) {
                        this.$Message({
                            message: this.$t('whatsappSetting.getQRcodeAgain'),
                            type: 'error',
                            duration: 3000
                        });
                    }
                    // 改为弹窗扫码登陆,跳转登陆暂时废弃
                    this.visibleReplyModal = true;
                    // window.open('#/systemSettings/whatsapp_setting', '_blank');
                } else {
                    this.visibleReplyModal = false;
                    this.$Message.warning(this.$t('whatsapp_manage.cannotLoginTip'));
                }
            },
            /**
             * @Description: 针对有些WA账号数据量太大导致后台写入用时长，用户绑定之后进入WA管理页面，可能列表数据未写入完成，
             *              导致拿不到列表数据的情况，当切换Tab时，此处增加判断逻辑：其一，若相应的列表数据为空，则需要重新请求列表数据。
             *              反之不请求；其二，若当前已正在请求对应的列表数据(chatListLoading或者contactListLoading为true)，则不再重复发出请求。
             * @author 杨娣
             * @date 2020/4/23
            */
            /* Tab页切换 */
            handleTabChange(tab) {
                this.selectedTab = tab.name;
                this.whatsAppSearch();
                /* 当切换tab时，要将当前选中项的未读置为已读 */
                if (tab.name === 'ChatList') {
                    // if (!this.chatListLoading && !this.chatList.length) {
                    //     this.getWAChatList();
                    // }
                    this.chatList.forEach(item => {
                        if (item.chatWaAccount === this.selectedChatInfo.chatWaAccount) {
                            this.unreadChatToRead(item.chatWaAccount);
                        }
                    });
                    if (!this.selectedChatInfo) {
                        this.isShowVisitorDetail = false;
                    }
                } else if (tab.name === 'ContactList') {
                    // if (!this.contactListLoading && !this.contactList.length) {
                    //     this.getWAContactList();
                    // }
                    this.chatList.forEach(item => {
                        if (item.chatWaAccount === this.selectedContactInfo.contactWaAccount) {
                            this.unreadChatToRead(item.chatWaAccount);
                        }
                    });
                    if (!this.selectedContactInfo) {
                        this.isShowVisitorDetail = false;
                    }
                }
            },
            /* 获取当前WA用户的消息列表 */
            getWAChatList(keyWords) {
                this.chatListLoading = true;
                util.ajaxInternationalJson({
                    url: '/whatsapp/chatList/page',
                    method: 'POST',
                    data: {
                        orgId: this.orgId,
                        page: this.chatListPage,
                        size: this.pageSize,
                        userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                        userId: this.userId,
                        queryKeyWords: keyWords
                    }
                }).then(res => {
                    this.chatListLoading = false;
                    if (res.data.code === 1) {
                        this.chatList = this.handleChatList(res.data.data.content);
                        if (!res.data.data.content.length && this.chatListPage !== 1) {
                            this.$Message.success(this.$t('whatsapp_manage.toTheEnd'));
                            this.chatListPage = this.chatListPage > 1 ? this.chatListPage - 1 : 1;
                        }
                        const temp = this.chatList.find(item => item.chatWaAccount === this.selectedChatInfo.chatWaAccount);
                        if (temp) {
                            this.activeIndex = String(temp.id);
                        }
                    } else {
                        this.chatListPage = this.chatListPage > 1 ? this.chatListPage - 1 : 1;
                    }
                }).catch(err => {
                    this.chatListLoading = false;
                    this.chatListPage = this.chatListPage > 1 ? this.chatListPage - 1 : 1;
                });
            },
            // 处理请求得到的对话列表数据
            handleChatList(arr) {
                let result;

                if (this.chatListPage === 1) {
                    result = arr;
                } else {
                    result = this.chatList.concat(arr);
                }

                return result.map(item => {
                    return {
                        ...item,
                        onlineStatus: item.onlineStatus || ''
                    };
                });
            },
            /* 获取当前WA用户的通讯录 */
            getWAContactList(keyWords) {
                this.contactListLoading = true;
                util.ajaxInternationalJson({
                    url: '/whatsapp/contact/page',
                    method: 'POST',
                    data: {
                        orgId: this.orgId,
                        page: this.contactListPage,
                        size: this.pageSize,
                        userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                        userId: this.userId,
                        queryKeyWords: keyWords
                    }
                }).then(res => {
                    this.contactListLoading = false;
                    if (res.data.code === 1) {
                        if (this.contactListPage === 1) {
                            this.contactList = res.data.data.content;
                        } else {
                            this.contactList = this.contactList.concat(res.data.data.content);
                        }
                        if (!res.data.data.content.length && this.contactListPage !== 1) {
                            this.$Message.success(this.$t('whatsapp_manage.toTheEnd'));
                            this.contactListPage = this.contactListPage > 1 ? this.contactListPage - 1 : 1;
                        }
                        /* 将联系人按照首字母分组--暂未实现 */
                        // const data = res.data.data.content;
                        // if (data.length) {
                        //     for (let i = 0; i < data.length; i++) {
                        //         if (this.contactList[i]) {
                        //             this.contactList[i].data.push(data[i]);
                        //         }
                        //     }
                        // }
                    } else {
                        this.contactListPage = this.contactListPage > 1 ? this.contactListPage - 1 : 1;
                    }
                }).catch(err => {
                    this.contactListLoading = false;
                    this.contactListPage = this.contactListPage > 1 ? this.contactListPage - 1 : 1;
                });
            },
            /* 修改消息列表或者通讯录的选中项的备注 */
            updateSelectedRemark(account, newRemark) {
                this.chatList.forEach(item => {
                    if (item.chatWaAccount === account) {
                        item.remark = newRemark;
                    }
                });
                this.contactList.forEach(item => {
                    if (item.contactWaAccount === account) {
                        item.remark = newRemark;
                    }
                });
            },
            /* 选中消息列表某一项 */
            handleToggleChat(id) {
                /**
                 * @Description: 1. 当用户在与A的会话窗口上传了附件但没有点击发送，此时切换至B的聊天窗口时，需要进行离开确认；
                 *               2. 当用户在与A的会话窗口上传了附件并点击发送，此时切换至B的聊天窗口时，需要弹出提示语。提示用户，切换之后附件
                 *               列表会清空，但仍会被发送
                 * @author 杨娣
                 * @date 2021/3/24
                */
                let isNeedToggleConfirm = false;
                let temp = [];
                this.seletedWhatsAppId = id;
                /* 获取附件列表，并且判断是否点击了发送，决定是否需要弹出弹窗确认离开 */
                if (this.$refs.chatWindow && this.$refs.chatWindow.$refs.whatsAppSend) {
                    temp = this.$refs.chatWindow.$refs.whatsAppSend.fileList;
                    isNeedToggleConfirm = temp.length && !temp.some(item => item.isSending);
                }
                if (isNeedToggleConfirm) {
                    this.showToggleChatConfirm = true;
                } else {
                    /* 附件列表不为空且点击了发送，仅做Message提示用户，同时切换会话窗口 */
                    if (temp.length && temp.some(item => item.isSending)) {
                        this.$Message.info(this.$t('whatsapp_manage.toggleChatConfirmTip2'));
                    }
                    if (this.selectedTab === 'ChatList') {
                        this.handleSelectChat();
                    } else {
                        this.handleSelectContact();
                    }
                }
            },
            handleSelectChat() {
                this.selectedChatInfo = this.chatList.find(item => item.id === Number(this.seletedWhatsAppId));
                this.unreadChatToRead(this.selectedChatInfo.chatWaAccount);
                if (this.$refs.chatWindow) {
                    this.$refs.chatWindow.newCompanyShow = false;
                }
                this.showToggleChatConfirm = false;

                // 更新当前选中联系人头像
                this.updateWAAccountAvatar(this.selectedChatInfo.chatWaAccount);
            },
            /* 滚动加载下一页 */
            getMoreChatList() {
                // this.listLoading = true;
                this.chatListPage += 1;
                this.getWAChatList();
            },
            /* 选中通讯录列表某一项 */
            handleSelectContact() {
                this.selectedContactInfo = this.contactList.find(item => item.id === Number(this.seletedWhatsAppId));
                /* 通讯录不显示WA用户的未读数，但是一个WA用户同时存在于消息列表和通讯录，并且有未读消息时，在通讯录选中该用户，
                需要将该WA用户的未读消息全部变为已读，消息列表未读状态和右上角未读数也要相应变化 */
                this.unreadChatToRead(this.selectedContactInfo.contactWaAccount);
                if (this.$refs.chatWindow) {
                    this.$refs.chatWindow.newCompanyShow = false;
                }
                this.showToggleChatConfirm = false;

                // 更新当前选中联系人头像
                this.updateWAAccountAvatar(this.selectedContactInfo.contactWaAccount);
            },
            /* 滚动加载下一页 */
            getMoreContactList() {
                // this.listLoading = true;
                this.contactListPage += 1;
                this.getWAContactList();
            },
            // 更新当前选中联系人头像
            async updateWAAccountAvatar(waAccount) {
                const result = await getWAAccountAvatar({
                    userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                    contactWaAccount: waAccount
                });

                if (result.code === 1 && result.data.contactWaAvatar) {
                    // 获取头像成功, 更新聊天列表和通讯录中相应头像
                    this.chatList.filter(item => `${item.chatWaAccount}` === `${waAccount}`).forEach((item, index) => {
                        item.chatWaAvatar = result.data.contactWaAvatar;
                    });
                    this.contactList.filter(item => `${item.contactWaAccount}` === `${waAccount}`).forEach((item, index) => {
                        item.contactWaAvatar = result.data.contactWaAvatar;
                    });
                }
            },
            /* WA账号(手机号)进行格式转换 */
            /**
             * @Description: 由于各国家电话位数和区号位数不定，暂不做区号与电话号码空格隔开的处理，相关代码注释
             * @author 杨娣
             * @date 2020/4/17
            */
            toggleWAAccount(val) {
                const str = `+${val}`;
                // const arr = str.split('');
                // arr.splice(3, 0, ' ');
                // return arr.join('');
                return str;
            },
            /* 未读标记为已读 */
            unreadChatToRead(chatAccount) {
                util.ajaxInternationalJson({
                    url: '/whatsapp/chatRecords/readMessage',
                    method: 'POST',
                    data: {
                        orgId: this.orgId,
                        chatWaAccount: chatAccount,
                        userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                        userId: this.userId
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        /* 修改未读成功后，将该WA用户的未读数置为0 */
                        this.chatList.forEach(item => {
                            if (item.chatWaAccount === chatAccount) {
                                item.unread = 0;
                            }
                        });
                        /* 修改右上角的总未读数 */
                        const unreadCount = this.chatList.reduce((prev, curr) => {
                            return prev + curr.unread;
                        }, 0);
                        this.$store.commit('setWAUnreadCount', unreadCount);
                    }
                });
            },
            /* 对不同类型的消息类型做处理 */
            getMessageContent(msgType, msgContent) {
                if (msgType) {
                    switch (Number(msgType)) {
                        case 1:
                            return msgContent;
                        case 2:
                            return this.$t('whatsapp_manage.imageType');
                        case 3:
                            return this.$t('whatsapp_manage.fileType');
                        case 4:
                            return this.$t('whatsapp_manage.videoType');
                        default:
                            return this.$t('whatsapp_manage.unSupportedType');
                    }
                } else {
                    return '';
                }
            },
            // 获取最后一条消息的发送状态对应的 icon class
            getReadStatusIcon(readFlag) {
                let icon = 'custom';

                switch (readFlag) {
                    case 0:
                        // 待投递状态
                        icon += ' custom-tobeDelivered';
                        break;
                    case 1:
                        // 已送达给对方，但对方未接收
                        icon += ' custom-delivered-and-unreceived';
                        break;
                    case 2:
                        // 已送达给对方，对方已接收
                        icon += ' custom-delivered-and-received';
                        break;
                    case 3:
                        // 对方已读
                        icon += ' custom-haveRead';
                        break;
                }

                return icon;
            },
            /* 时间转换 */
            timeFormat(timeStamp) {
                const arguDate = new Date(Number(timeStamp)).getDate();
                const arguMonth = new Date(Number(timeStamp)).getMonth();
                const arguYear = new Date(Number(timeStamp)).getFullYear();
                const currentDate = new Date().getDate();
                const currentYear = new Date().getFullYear();
                const currentMonth = new Date().getMonth();
                if (arguYear === currentYear) {
                    if (arguMonth === currentMonth) {
                        if (arguDate === currentDate) {
                            // 今天 显示时间格式为HH:mm
                            return new Date(timeStamp).format('hh:mm');
                        } else if (arguDate - currentDate === -1) {
                            // 昨天的消息显示昨天
                            return this.$t('Yesterday');
                        } else {
                            // 今年本月但不是今天和昨天的消息，显示日期
                            return new Date(timeStamp).format('MM-dd');
                        }
                    } else {
                        // 今年非本月的消息，显示日期
                        return new Date(timeStamp).format('MM-dd');
                    }
                } else {
                    // 不是今年的消息  显示年月日
                    return new Date(timeStamp).format('yyyy/MM/dd');
                }
            },
            /* 更新消息列表某WA用户的最后一条消息内容 */
            updateLastChatContent(newMsg) {
                this.chatList.forEach(item => {
                    if (item.chatWaAccount === newMsg.toWaAccount) {
                        item.lastChatContent = newMsg.content;
                    }
                });
                // 更新会话列表顺序,新消息在上
                const index = this.chatList.findIndex(item => item.chatWaAccount === newMsg.toWaAccount);
                const updateObj = this.chatList[index];
                this.chatList.splice(index, 1);
                this.chatList = [updateObj, ...this.chatList];
            },
            /* 通过WhatsApp账号获取并更新该账号的crm状态 */
            async updateWAAccountCrmStatus(WAAccount, from) {
                this.contactWaAccountList = [];
                this.contactWaAccountList.push(WAAccount);
                if (from === 'globalSearch') {
                    const temp = await this.getWAAccountCrmStatus([], from);
                    return temp;
                } else if (from === 'createCompany') {
                    await this.getCRMStatus();
                    this.get_inquiry_short_info(WAAccount);
                    
                } else if (from === 'createClue') {
                    this.chatList.forEach(item => {
                        if (item.chatWaAccount === WAAccount) {
                            item.leadscloudStatus = 2;
                        }
                        return item;
                    });
                    this.contactList.forEach(item => {
                        if (item.contactWaAccount === WAAccount) {
                            item.leadscloudStatus = 2;
                        }
                        return item;
                    });
                } else {
                    this.chatList = await this.getWAAccountCrmStatus(this.chatList);
                    this.contactList = await this.getWAAccountCrmStatus(this.contactList);
                }
            },
            getWAAccountCrmStatus(dataList = [], from) {
                return new Promise((resolve, reject) => {
                    util.ajaxInternationalJson({
                        url: '/whatsapp/contactToLeadscloudStatus/getLeadscloudStatus',
                        method: 'POST',
                        data: {
                            contactWaAccountList: this.contactWaAccountList,
                            orgId: this.orgId
                        }
                    }).then(res => {
                        if (res.data.code === 1) {
                            if (from === 'globalSearch') {
                                resolve(res.data.data);
                            } else {
                                dataList.forEach(item => {
                                    const tempIndex = res.data.data.findIndex(subItem => subItem.contactWaAccount === item.chatWaAccount || subItem.contactWaAccount === item.contactWaAccount);
                                    if (tempIndex !== -1) {
                                        this.$set(item, 'leadscloudStatus', res.data.data[tempIndex].leadscloudStatus);
                                    }
                                    return item;
                                });
                                resolve(dataList);
                            }
                        } else {
                            if (from === 'globalSearch') {
                                resolve(0);
                            } else {
                                resolve(dataList);
                            }
                        }
                    }).catch(err => {
                        if (from === 'globalSearch') {
                            resolve(0);
                        } else {
                            resolve(dataList);
                        }
                    });
                });
            },
            /* 重新连接WA，即重新登录 */
            // reconnectWA() {
            //     this.reconnecting = true;
            //     util.ajaxInternational({
            //         url: '/whatsapp/waUserBind/reconnect',
            //         method: 'POST',
            //         data: {
            //             userId: this.userId,
            //             orgId: this.orgId,
            //             whatsappAccount: this.whatsAppAccountInfo.whatsappAccount,
            //             id: this.whatsAppAccountInfo.id
            //         }
            //     }).then(res => {
            //         this.showReconnectModal = false;
            //         this.reconnecting = false;
            //         if (res.data.code === 1) {
            //             this.whatsAppAccountInfo.loginStatus = 1;
            //             this.getWhatsAppInfo();
            //         } else if (res.data.code === 2) {
            //             this.whatsAppAccountInfo.loginStatus = 2;
            //             this.$Message.error(this.$t('whatsapp_manage.reconnectInvalidTip'));
            //         } else if (res.data.code === 5) {
            //             /* 重新连接，若接口返回code为5，代表当前手机未连接到vpn，保持重新连接的状态(不需要更改loginStatus)，并提示用户 */
            //             this.$Message.error(this.$t('whatsapp_manage.reconnectNoNetworkTip'));
            //         } else {
            //             this.$Message.error(this.$t('whatsapp_manage.reconnectErrorTip'));
            //         }
            //     }).catch(err => {
            //         this.showReconnectModal = false;
            //     });
            // },
            /* ------------------------------搜索部分--------------------------- */
            /** 搜索关键词改变 */
            changeKeyword(keyword) {
                this.WASearchKeyWords = keyword.trim();
            },
            /* 搜索 */
            whatsAppSearch() {
                /**
                 * @Description: 触发搜索的场景如下：1. 切换tab时；2. 输入框------用户回车/点击搜索图标/点击清空图标/手动清空输入框
                 * @author 杨娣
                 * @date 2020/10/29
                */
                if (this.selectedTab === 'ChatList') {
                    this.chatListPage = 1;
                    this.getWAChatList(this.WASearchKeyWords ? this.WASearchKeyWords : '');
                } else {
                    this.contactListPage = 1;
                    this.getWAContactList(this.WASearchKeyWords ? this.WASearchKeyWords : '');
                }
            },
            handleKeyUp() {
                this.$refs.WASearchIcon.click();
            },
            /* 切换右侧访客信息详情页的显隐 */
            toggleShowVisitorDetail(isShowDetail) {
                this.isShowVisitorDetail = isShowDetail && this.visitorDetailTabs.length;
                if (isShowDetail && !this.visitorDetailTabs.length) {
                    this.$Message.warning('无访客关联信息');
                }
            },
            /*
            * 右侧访客关联详情页相关
            * */
            /* 根据WhatsApp账号获取关联信息 */
            getVisitorRelations() {
                this.visitorDetailLoading = true;
                if (this.toWaAccount) {
                    util.ajax({
                        url: '/crm/visitorRelation/getVisitorRelated/whatsapp',
                        method: 'GET',
                        params: {
                            toWaAccount: this.toWaAccount,
                            waBindAccount: this.whatsAppAccountInfo.whatsappAccount,
                            orgId: this.orgId
                        }
                    }).then(res => {
                        this.visitorDetailLoading = false;
                        this.visitorDetailTabs = [];
                        if (res.data.code === '1') {
                            const data = res.data.data;
                            const temp = [];
                            for (const key in data) {
                                const obj = {};
                                if (Object.prototype.hasOwnProperty.call(data, key)) {
                                    switch (key) {
                                        case '1':
                                            obj.key = 'WebInteraction';
                                            obj.title = '网站交互';
                                            obj.type = key;
                                            obj.relatedIds = data[key];
                                            break;
                                        case '2':
                                            obj.key = 'FacebookInteraction';
                                            obj.title = 'Facebook';
                                            obj.type = key;
                                            obj.relatedIds = data[key];
                                            break;
                                        case '10':
                                            obj.key = 'WhatsAppRelatedRecords';
                                            obj.title = 'WhatsApp';
                                            obj.type = key;
                                            obj.relatedIds = data[key];
                                            break;
                                    }
                                    temp.push(obj);
                                }
                            }
                            this.visitorDetailTabs = temp;
                            if (this.visitorDetailTabs.length) {
                                this.isShowVisitorDetail = true;
                                this.currentVisitorTab = this.visitorDetailTabs[0].key;
                                this.getRelatedInfoByWhatsApp({ name: this.visitorDetailTabs[0].key });
                            } else {
                                this.isShowVisitorDetail = false;
                            }
                        } else {
                            this.isShowVisitorDetail = false;
                            this.$Message.error('获取WhatsApp与访客的关联信息出错，请稍后重试!');
                        }
                    }).catch(err => {
                        this.visitorDetailLoading = false;
                        this.isShowVisitorDetail = false;
                        this.$Message.error('获取WhatsApp与访客的关联信息出错，请稍后重试!');
                    });
                }
            },
            getRelatedInfoByWhatsApp({ name }) {
                switch (name) {
                    case 'WebInteraction':
                        this.getWebInteractionRelatedInfo();
                        break;
                    case 'FacebookInteraction':
                        this.getFacebookInteractionRelatedInfo();
                        break;
                    case 'WhatsAppRelatedRecords':
                        this.getWhatsAppRelatedInfo();
                        break;
                }
            },
            getWebInteractionRelatedInfo() {
                const temp = this.visitorDetailTabs.find(item => item.key === this.currentVisitorTab);
                const tempArr = [];
                if (temp) {
                    if (temp.type === '1' && temp.relatedIds) {
                        temp.relatedIds.forEach(item => {
                            const obj = {};
                            obj.key = item.targetId;
                            obj.value = item.visitorName;
                            tempArr.push(obj);
                        });
                        this.webInteractionRelatedInfo = tempArr;
                    }
                }
            },
            getFacebookInteractionRelatedInfo() {
                const tempArr = [];
                const temp = this.visitorDetailTabs.find(item => item.key === this.currentVisitorTab);
                if (temp) {
                    if (temp.type === '2' && temp.relatedIds) {
                        temp.relatedIds.forEach(item => {
                            tempArr.push(item.targetId);
                        });
                    }
                }
                util.ajaxInternationalJson({
                    url: '/social/facebookChat/getConversationWithRecord',
                    method: 'get',
                    params: {
                        conversationIds: tempArr.join(',')
                    }
                }).then(res => {
                    this.formatMessagerData(res.data.data);
                })
            },
            getWhatsAppRelatedInfo() {
                const tempArr = [];
                const temp = this.visitorDetailTabs.find(item => item.key === this.currentVisitorTab);
                if (temp) {
                    if (temp.relatedIds && Array.isArray(temp.relatedIds)) {
                        temp.relatedIds.forEach(item => {
                            const obj = {};
                            if (item.targetId && item.userBindWaAccount) {
                                obj.chatWaAccount = item.targetId;
                                obj.userBindWaAccount = item.userBindWaAccount;
                            }
                            tempArr.push(obj);
                        });
                        this.whatsAppRelatedInfo = tempArr;
                    }
                }
            },
            // 格式化messagerData
            formatMessagerData(data) {
                this.facebookInteractionRelatedInfo = data.map((item, index) => ({
                    title: 'Facebook私信',
                    setMessager: item.account.name,
                    getMessager: item.conversation.conversationName,
                    firstMessage: item.record[0].content,
                    remark: item.conversation.remark,
                    visitorStatus: item.conversation.clueStatus,
                    time: item.conversation.updateTime,
                    setImgUrl: item.account.avatar,
                    getImgUrl: item.conversation.conversationAvatar,
                    messagerContent: item.record,
                    messageShow: index === 0,
                    originURL: ''
                }));
            },
            /* 对不同访客状态进行处理 */
            getLeadsCloudStatus(status) {
                switch (status) {
                    case 0:
                        return this.$t('website.notEnter');
                    case 1:
                        return this.$t('clue.inquiry');
                    case 2:
                        return this.$t('clue.clue');
                }
            },

            /* 右侧 CRM 详情页 */
            // 切换 CRM 详情页显隐
            toggleShowCRMDetail() {
                this.waRelatedCRMInfo = {};
                this.isShowCRMDetail = !this.isShowCRMDetail;
                if (this.isShowCRMDetail) {
                    this.getCRMStatus();
                }
            },
            // 获取当前 WA 账号关联的 CRM 数据
            async getCRMStatus() {
                if (this.toWaAccount) {
                    const result = await getWACRMStatus({
                        orgId: this.orgId,
                        targetIds: [this.toWaAccount],
                        targetType: 10
                    });

                    if (result.code === '1' && result.data && result.data[this.toWaAccount]) {
                        this.waRelatedCRMInfo = result.data[this.toWaAccount];
                    } else {
                        // 获取数据失败
                        this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    }
                } else {
                    // 参数错误
                    this.$Message.error(this.$t('crm.InqSet.error_params'));
                }
            },
            /* 获取询盘简略信息 录入询盘后使用*/
            get_inquiry_short_info(WAAccount) {
                util.ajax({
                    url: '/crm/inquiry/getInquiryAndCompany',
                    method: 'post',
                    data: {
                        id: this.waRelatedCRMInfo.inquiryId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.chatList.forEach(item => {
                            if (item.chatWaAccount === WAAccount) {
                                item.leadscloudStatus = 1;
                                item.clientType = response.data.data.clientType;
                            }
                            return item;
                        });
                        this.contactList.forEach(item => {
                            if (item.contactWaAccount === WAAccount) {
                                item.leadscloudStatus = 1;
                                item.clientType = response.data.data.clientType;
                            }
                            return item;
                        });
                        
                    }
                });
            },
            /* 获取crm参数 */
            getCrmFields(){
                // 获取所有授权字段 + 筛选出公司/询盘/联系人授权字段 
                util.ajax({
                    url: '/crm/columnConfig/getFields',
                    method: 'get',
                    params: {
                        orgId: this.orgId,
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
            getSelectOptions() {
                util.ajax({
                    url: '/crm/attr/getField',
                    method: 'post',
                    data: {
                        orgId: this.orgId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.selectOptions = response.data.data;
                        if (this.selectOptions.followUp) {
                            this.selectOptions.followUp.unshift({
                                isAvailable: 1,
                                attrId: 0,
                                sort: 0,
                                typeId: 7,
                                attrName: this.$t('crm.UniSet.defaultFollowUpStatus_inquiry')
                            });
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getSelectOptions'));
                    }
                }).catch(() => {
                    this.$Message.error(this.$t('crm.Table.error_getSelectOptions'));
                });
            },
            // 获取销售人员列表
            getSalesList() {
                util.ajax({
                    url: '/cuss-login/getSaleUserList',
                    method: 'post',
                    data: {
                        orgId: this.orgId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.salesList = [];
                        this.salesList = response.data.data;
                        this.salesList.push({
                            id: -1,
                            fullname: this.$t('clue.public_sea')
                        });
                    } else {
                        this.$Message.error(this.$t('crm.Detail.error_getSalesList'));
                    }
                }).catch(() => {
                    this.$Message.error(this.$t('crm.Detail.error_getSalesList'));
                });
            },
            
            toggleShowLittleDrawer(){
                this.littleDrawerVisible = !this.littleDrawerVisible;
            },
            littleDrawerHidden(val){
                // this.$store.state.chatView = true;
                this.littleDrawerVisible = val;
            },
        },
        mounted() {
            this.getWALoginAccount();
            this.getSalesList();
            this.getSelectOptions(); // 获取大部分下拉选项
            this.getCrmFields();
        },
        watch: {
            'whatsAppAccountInfo.loginStatus': {
                // 扫描时间线快速回复二维码登陆后,使WhatsApp页面的登陆二维码弹窗消息;
                handler(val) {
                    val === 1 ? this.visibleReplyModal = false : '';
                },
                immediate: true
            },
            websocketMsgWA: {
                handler(val) {
                    if (val.whatsAppAccountLoginStatus) {
                        this.whatsAppAccountInfo.loginStatus = val.whatsAppAccountLoginStatus;
                        if (val.whatsAppAccountLoginStatus === 4) {
                            this.showReconnectModal = true;
                        } else {
                            this.showReconnectModal = false;
                        }
                    } else {
                        const senderWAInfo = val.whatsappAccountWebsocketCondition;
                        let currentSelectedAccount = '';
                        /* 是推送给whatsApp模块的消息 */
                        if (val.pushMessageModule === 'WhatsAppModule') {
                            if (val.WaWebsocketMessageType === 2) {
                                // 此消息推送代表当前登录用户绑定的WA账号失效

                                this.whatsAppAccountInfo.loginStatus = 2;
                                /**
                                 * @Description: 询盘云帐号登录成功，vuex中存储的userId为Number类型
                                 *               刷新页面后从cookie获取到userId并存储到vuex中为String类型，
                                 *               由于不清楚其他模块对userId的使用场景，因此对于vuex中存储的类型不一致的问题不做修改
                                 *               所以此处用到this.userId的判断不可用 === ，会导致用户登录后但未刷新页面时，收到WA消息推送，
                                 *               右下角有通知但列表不能同步更新的问题
                                 * @author 杨娣
                                 * @date 2020/4/20
                                 */
                            }

                            if (val.WaWebsocketMessageType === 3) {
                                // 收到私信推送

                                if (senderWAInfo.fromMe) {
                                    // 新消息是'我'发的

                                    // 暂存"新消息所在对话在左侧对话列表中的顺序"
                                    const existInChatListIndex = this.chatList.findIndex(item => item.chatWaAccount === senderWAInfo.toWaAccount);

                                    if (existInChatListIndex !== -1) {
                                        // 新消息所在对话, 存在于左侧对话列表

                                        // 暂存该对话数据
                                        const updateObj = this.chatList[existInChatListIndex];

                                        // 更新对话数据
                                        updateObj.fromMe = senderWAInfo.fromMe;
                                        updateObj.leadscloudStatus = senderWAInfo.leadscloudStatus;
                                        updateObj.readFlag = senderWAInfo.readFlag;
                                        updateObj.messageId = val.messageId;

                                        // 更新"最后一条消息"数据
                                        updateObj.lastChatTime = senderWAInfo.timeStamp;
                                        updateObj.lastChatType = senderWAInfo.type;
                                        updateObj.lastChatContent = this.getMessageContent(senderWAInfo.type, senderWAInfo.lastChatContent);

                                        // 更新会话列表顺序, 新消息在上
                                        this.chatList.splice(existInChatListIndex, 1);
                                        this.chatList = [updateObj, ...this.chatList];
                                    } else {
                                        // 新消息所在对话, 不存在于左侧对话列表

                                        // 初始化对话数据
                                        const updateObj = {};

                                        // 更新对话数据
                                        updateObj.chatWaAccount = senderWAInfo.toWaAccount;
                                        updateObj.id = senderWAInfo.chatListId;
                                        updateObj.fromMe = senderWAInfo.fromMe;
                                        updateObj.leadscloudStatus = senderWAInfo.leadscloudStatus;
                                        updateObj.readFlag = senderWAInfo.readFlag;
                                        updateObj.messageId = val.messageId;

                                        // 更新"最后一条消息"数据
                                        updateObj.lastChatTime = senderWAInfo.timeStamp;
                                        updateObj.lastChatType = senderWAInfo.type;
                                        updateObj.lastChatContent = this.getMessageContent(senderWAInfo.type, senderWAInfo.lastChatContent);

                                        // 插入新对话到对话列表顶部
                                        this.chatList.unshift(updateObj);
                                    }
                                }

                                if (!senderWAInfo.fromMe && val.userIds.findIndex(item => item == this.userId) !== -1) {
                                    // 新消息是他人发的, 消息接收方 userIds 中包含当前登录用户，当前用户接收到消息

                                    // if (val.fromNick === this.whatsAppAccountInfo.whatsappAccount) {
                                    //     // 将来可能有一个询盘云登录用户可绑定多个WA账号的需求，
                                    //     // 所以判断一下消息指定的接收方WA账号是否为当前该登录用户选中的WA账号
                                    //     // 那么websocket推送的消息中还缺少一个接收方的WA账号
                                    // }

                                    // 暂存"新消息所在对话在左侧对话列表中的顺序"
                                    const existInChatListIndex = this.chatList.findIndex(item => item.chatWaAccount === senderWAInfo.fromWaAccount);

                                    if (existInChatListIndex !== -1) {
                                        // 发消息WA账号存在于当前消息列表中

                                        // 暂存该对话数据
                                        const updateObj = this.chatList[existInChatListIndex];

                                        // 暂存"当前会话窗口展示的 WA 用户信息"
                                        if (this.selectedTab === 'ChatList') {
                                            currentSelectedAccount = this.selectedChatInfo.chatWaAccount;
                                        } else if (this.selectedTab === 'ContactList') {
                                            currentSelectedAccount = this.selectedContactInfo.contactWaAccount;
                                        }

                                        // 处理对话未读数
                                        if (senderWAInfo.fromWaAccount === currentSelectedAccount) {
                                            // 收到的消息来自正在聊天的WA账号

                                            // 正在聊天的WA账号的所有消息标记为已读
                                            this.unreadChatToRead(currentSelectedAccount);

                                            /* 右下角消息通知的处理时，右上角未读均增加1。此处若为正在聊天的对象时，需要减去1 */
                                            const unreadCount = this.WAUnreadCount - 1;
                                            this.$store.commit('setWAUnreadCount', unreadCount > 0 ? unreadCount : 0);
                                        } else {
                                            // 收到的消息来自其他会话对象

                                            updateObj.unread += 1;
                                        }

                                        // 更新对话数据
                                        updateObj.fromMe = senderWAInfo.fromMe;
                                        updateObj.leadscloudStatus = senderWAInfo.leadscloudStatus;
                                        updateObj.readFlag = senderWAInfo.readFlag;
                                        updateObj.messageId = val.messageId;

                                        // 更新"最后一条消息"数据
                                        updateObj.lastChatTime = senderWAInfo.timeStamp;
                                        updateObj.lastChatType = senderWAInfo.type;
                                        updateObj.lastChatContent = this.getMessageContent(senderWAInfo.type, senderWAInfo.lastChatContent);

                                        // 更新会话列表顺序, 新消息在上
                                        this.chatList.splice(existInChatListIndex, 1);
                                        this.chatList = [updateObj, ...this.chatList];
                                    } else {
                                        // 新消息所在对话, 不存在于左侧对话列表

                                        // 初始化对话数据
                                        const updateObj = {};

                                        // 更新对话数据
                                        updateObj.chatWaAccount = senderWAInfo.fromWaAccount;
                                        updateObj.id = senderWAInfo.chatListId;
                                        updateObj.fromMe = senderWAInfo.fromMe;
                                        updateObj.leadscloudStatus = senderWAInfo.leadscloudStatus;
                                        updateObj.readFlag = senderWAInfo.readFlag;
                                        updateObj.messageId = val.messageId;

                                        // 更新"最后一条消息"数据
                                        updateObj.lastChatTime = senderWAInfo.timeStamp;
                                        updateObj.lastChatType = senderWAInfo.type;
                                        updateObj.lastChatContent = this.getMessageContent(senderWAInfo.type, senderWAInfo.lastChatContent);

                                        // 插入新对话到对话列表顶部
                                        this.chatList.unshift(updateObj);
                                    }
                                }
                            }

                            if (val.WaWebsocketMessageType === 4) {
                                // 收到 WA 账号在线状态更新 WS 消息

                                // 提取数据
                                const { id, type } = val.presence || {};

                                const matchedChat = this.chatList.find(item => `${item.chatWaAccount}` === `${id}`);
                                if (matchedChat) {
                                    // 此消息中的账号与当前聊天账号匹配

                                    // 清除之前的定时器
                                    if (this.timer_recoverFromComposing[id]) {
                                        clearTimeout(this.timer_recoverFromComposing[id]);
                                        delete this.timer_recoverFromComposing[id];
                                    }

                                    if (type === 'composing') {
                                        // 如果状态为"输入中"

                                        // 设置定时器, 5s 后从"输入中"状态恢复到当前状态
                                        const temp = matchedChat.onlineStatus;
                                        this.timer_recoverFromComposing[id] = setTimeout(() => {
                                            matchedChat.onlineStatus = temp;
                                        }, 5000);
                                    }

                                    // 更新账号在线状态
                                    matchedChat.onlineStatus = type;
                                }
                            }

                            if (val.WaWebsocketMessageType === 5) {
                                // 收到消息发送状态更新通知

                                const messageStatus = val.messageStatus;
                                if (messageStatus && messageStatus.messageId) {
                                    this.chatList.forEach(chat => {
                                        if (chat.messageId === messageStatus.messageId) {
                                            const readFlag = Number.isInteger(messageStatus.readFlag) ? messageStatus.readFlag : undefined;
                                            if (readFlag && !(chat.readFlag && chat.readFlag > readFlag)) {
                                                chat.readFlag = readFlag;
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            },
            WASearchKeyWords: {
                handler(val) {
                    if (!val) this.whatsAppSearch();
                }
            },
            // 'selectedChatInfo.id': {
            //     handler(val) {
            //         this.getVisitorRelations();
            //     }
            // },
            // 'selectedContactInfo.id': {
            //     handler(val) {
            //         this.getVisitorRelations();
            //     }
            // },
            // selectedTab: {
            //     handler(val) {
            //         if (this.whatsAppAccountInfo && this.whatsAppAccountInfo.whatsappAccount) {
            //             // this.getVisitorRelations();
            //         }
            //     }
            // },
            // 切换账号时关闭右侧 CRM 详情页
            toWaAccount: {
                handler(val) {
                    if(val) {
                        this.littleDrawerVisible = true;
                    }else {
                        this.littleDrawerVisible = false;
                    }
                }
            }
        }
    };
</script>

<style lang="less" scoped>
// 右下角的登陆在线提示小点
    .success-dot{
        background: #00CC99;
    }
    .default-dot{
        background: #B9BFC1;
    }
    .default-dot, .success-dot{
        width: 10px;
        height: 10px;
        position: absolute;
        bottom: 0;
        left: 32px;
        border-radius: 50%;
        border: 1px solid #FFFFFF;
        // cursor: pointer;
    }
    // 登陆提示,头像下的提示  公共样式
    .login_prompt{
        font-size: 12px;
        color: rgba(0,0,0,0.40);
        line-height: 18px;
        font-weight: 400;
        margin-left: 10px;
    }
    // 失效或提示样式
    .login_prompt_unonline{
        color: #EA4335;
    }
    .whatsapp-manage {
        .whatsapp-manage-toolbar {
            padding: 20px 20px 0 20px;
        }
        .toolbar-brand-page {
            display: flex;
            height: 38px;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            .brand-page-head {
                position: relative;
                display: flex;
                align-items: center;
                // cursor: pointer;
                .avatar-small{
                     width: 44px;
                    height: 44px;
                    border-radius: 22px;
                }
                .brand-page-name {
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
            .invalid-tip {
                font-size: 12px;
                color: red;
                // cursor: pointer;
                margin-top: 3px;
                &:hover {
                  text-decoration: underline;
                }
            }
        }
        .whatsapp-tab{
            .empty-list{
                text-align: center;
                padding: 20px 0;
            }
            .WA-chatList {
                padding: 11px 20px;
                height: 82px;
                display: flex;
                align-items: center;
                .avatar-large{
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                }
                // .chat-name-tooltip{
                //     max-width: calc(~'100%-78px');
                // }
                .chat-name{
                    font-size: 14px;
                    color: rgba(0,0,0,0.80);
                    font-weight: 700;
                    padding: 0 10px;
                    max-width: 60%;
                }
                .chat-remark{
                    display: inline-block;
                    vertical-align: middle;
                    max-width: 50px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    font-size: 12px;
                    color: rgba(0,0,0,0.40);
                }
                .chat-time{
                    line-height: 22px;
                    font-size: 12px;
                    color: rgba(0,0,0,0.40);
                    // position: absolute;
                    top: 10px;
                    right: 20px;
                }
                .chat-status{
                    font-size: 12px;
                    position: absolute;
                    color: rgba(0,0,0,0.40);
                    top: 25px;
                    right: 20px;
                }
                .contact-info{
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
                .contact-time{
                    position: absolute;
                    font-size: 12px;
                    right: 20px;
                    color: rgba(0,0,0,0.40);
                }
                /deep/ .el-badge__content {
                    width: 26px;
                    height: 18px;
                    text-align: center;
                }
                /deep/ .el-badge__content.is-fixed {
                    top: 10px;
                    right: 18px;
                }
            }
            /deep/ .el-tabs__content {
                /*padding-left: 20px;*/
            }
            /deep/ .el-tabs__nav-wrap:after {
                height: 0;
            }
            /deep/ .el-tabs__nav {
                width: 100%;
                .el-tabs__item {
                    display: inline-block;
                    height: 100%;
                    color: rgba(0,0,0,.6);
                    padding: 8px 32px 8px 16px;
                    -webkit-box-sizing: border-box;
                    box-sizing: border-box;
                    cursor: pointer;
                    text-decoration: none;
                    position: relative;
                    -webkit-transition: color .3s ease-in-out;
                    transition: color .3s ease-in-out;
                }
                .is-active {
                    color: #fc8a32;
                    font-weight: 600;
                    .whatsapp-manage-label {
                        position: relative;
                        &:after{
                            content: ' ';
                            position: absolute;
                            width: 45px;
                            height: 2px;
                            background: #fc8a32;
                            bottom: -8px;
                            left:50%;
                            transform: translateX(-50%);
                        }
                    }
                }
            }
            /deep/ .el-tabs__item {
                width: 50%;
                text-align: center;
                &.is-active {
                    font-weight: 700;
                }
            }
            /deep/ .el-badge__content.is-fixed.is-dot {
                right: -5px;
                top:20px;
                min-width: auto;
            }
            /deep/ .el-badge__content {
                background-color: #ed4014;
            }
            /deep/ .el-tab-pane {
                margin-right: 1px;
                .el-menu {
                    border: none;
                    background-color: #FAFCFF;
                    .el-menu-item {
                        background-color: #FAFCFF;
                        &:hover {
                            background-color: #EEF1F5;
                            /*box-shadow: 0 1px 8px 0 #eef1f5;*/
                        }
                    }
                    .el-menu-item.is-active {
                        background-color: #EEF1F5;
                        color: rgba(0, 0, 0, 0.8);
                        /*box-shadow: 0 1px 8px 0 #eef1f5;*/
                        &:hover {
                            background-color: #EEF1F5;
                            /*box-shadow: 0 1px 8px 0 #eef1f5;*/
                        }
                    }

                    .ivu-scroll-container {
                        overflow-y: auto;
                    }
                }
            }
            /deep/ .el-tabs__active-bar {
                display: none;
                width: 45px !important;
                left: 16%;
                margin-left: -15px;
            }
        }
        .confirm-login {
            width: 400px;
            height: 90px;
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            margin:auto;
            text-align: center;
        }
        .WA-reconnection-modal {
            position: relative;
            top: 50%;
            transform: translateY(-50%);
            margin: 0 auto;
        }
        /deep/ .el-input--suffix {
            .el-input__inner {
                padding-right: 22px;
            }
        }
        .visitor-detail-container{
            display: flex;
            flex-direction: column;
            height: 100%;
            .visitor-tab {
                /deep/ .el-tabs__header {
                    margin: 0;
                    .el-tabs__nav-wrap {
                        .el-tabs__nav-scroll {
                            padding: 10px 20px 0;
                        }
                        &:after {
                            display: none;
                        }
                    }
                }
            }
        }
        .WA-chatList-content{
            width: calc(100% - 52px);
            margin-left: 2px;
            .WA-chatList-content-chatWaName{
                width:100%;
                display: flex;
                line-height: 22px;
                padding-bottom: 2px;
                justify-content: space-between;
                p{
                    width:88%;
                    display: flex;
                    justify-content: flex-start;
                }
            }
            .WA-chatList-content-lastContent{
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                padding-left: 10px;
                .WA-chatList-content-lastContent-readStatus {
                    color: #B5B5B5;

                    &.custom-haveRead {
                        color: #28C1FF;
                    }
                }
            }
            .last-content-single{
                margin-right: 10px;
                line-height: 20px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                span{
                    display: inline-block;
                    max-width: 100%;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    padding:1px 8px;
                    border: #FFC6A7 solid 1px;
                    font-style: normal;
                    text-align: center;
                    border-radius: 10px;
                    line-height: 14px;
                    color: #FF752A ;
                }
            }
            .last-content{
                margin-right: 10px;
                // display: inline-block;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                line-height: 18px;
                white-space: break-spaces;
                overflow: hidden;
                text-overflow: ellipsis;
                
            }
            .isEnglish{
                .last-content-single{
                    max-width: 78%;
                }
                .last-content{
                    width: 78%;
                }
            }
        }
        
    }
</style>
