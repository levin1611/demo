<template>
    <div class="timeline-item">
        <!-- FB 对话 -->
        <div v-if="item.eventAction === 'conversation'">
            <div class="item-header clearfloat">
                <div class="item-title">{{ $t('facebookInteraction.facebookMessage') }}</div>
                <div v-if="type == 'clue'">
                    <div class="block-line"></div>
                    <div @click="viewClue(item.clueId)"
                         :class="(type === 'clue' && $route.path.startsWith('/clue_manage')) ? 'header-source-current' : 'header-source'">
                        {{ $t('timeLine.fromClue') }}{{ clue_short_info.a1009 }}
                    </div>
                </div>
                <!-- 产品提出联系人详情页，在网站交互/FB交互/邮件时间轴后不需要显示“来自联系人xxx”的字样 -->
                <!-- 杨娣 2020/05/27 -->
                <div v-else-if="type !== 'contact' && type !=='journeyDetail'">
                    <div class="block-line"></div>
                    <div @click="viewContact(item)"
                         :class="type === 'contact' ? 'header-source-current' : 'header-source'">
                        {{ $t('timeLine.fromContacts') }}
                        {{ item.contactsName | filterName }}
                    </div>
                </div>
                <div class="item-time">{{ item.eventTime | timeFormat("DateTime") }}</div>
            </div>
            <div class="item-body">
                {{ $lang === 'zh-CN' ?
                `【${item.eventCustomVar.conversationName}】${$t('facebookInteraction.to')}【${item.eventCustomVar.pageName}】${$t('facebookInteraction.sendMessage')}`
                :
                `【${item.eventCustomVar.conversationName}】${$t('facebookInteraction.sendMessage')}${$t('facebookInteraction.to')}【${item.eventCustomVar.pageName}】`
                }}
                <Poptip width="500"
                        placement="bottom-start"
                        popper-class="pop-show"
                        @hide="handleCloseConversationModal"
                        @show="handleClickConversationModal(item)">
                    <span slot="reference"
                          :class="`item-event ${class_clickontheFacebookinteractivelink}`">【{{ item.eventContent != '' ? item.eventContent : $t('facebookInteraction.facebookCommentNull') }}】</span>
                    <div style="min-height: 540px"
                         class="api">
                        <template v-if="viewConversationModal && conversationClueId">
                            <ConversationModal :clueId="conversationClueId"
                                               :conversationId="conversationId"
                                               :conversationName="conversationName"
                                               :avatar="avatar"
                                               :pageId ="currentPageId"
                                               :messageList="messageList"></ConversationModal>
                        </template>
                        <template v-else-if="viewConversationModal">
                            <ConversationModal :conversationId="conversationId"
                                               :conversationName="conversationName"
                                               :avatar="avatar"
                                               :pageId ="currentPageId"
                                               :messageList="messageList"></ConversationModal>
                        </template>
                    </div>
                </Poptip>
            </div>
        </div>
        <!-- FB 评论 -->
        <div v-else-if="item.eventAction === 'comment'">
            <div class="item-header clearfloat">
                <div class="item-title">{{ $t('facebookInteraction.facebookComment') }}</div>
                <div v-if="type == 'clue'"
                     @click="viewClue(item.clueId)"
                     :class="(type === 'clue'&& $route.path.startsWith('/clue_manage')) ? 'header-source-current' : 'header-source'">
                    {{ $t('timeLine.fromClue') }}{{ clue_short_info.a1009 }}
                </div>
                <!-- 产品提出联系人详情页，在网站交互/FB交互/邮件时间轴后不需要显示“来自联系人xxx”的字样 -->
                <!-- 杨娣 2020/05/27 -->
                <div v-else-if="type !== 'contact'"
                     :class="type === 'contact' ? 'header-source-current' : 'header-source'"
                     @click="viewContact(item)">
                    {{ $t('timeLine.fromContacts') }}
                    {{ item.contactsName | filterName }}
                </div>
                <div class="item-time">{{ item.eventTime | timeFormat("DateTime") }}</div>
            </div>
            <div class="item-body">
                <!-- 评论信息: xxx 评论了 xxx 的帖子 -->
                【{{ item.eventCustomVar.commentatorName }}】{{ $t('facebookInteraction.commented') }}
                【{{ item.eventCustomVar.postCreaterName }}】{{ $t('facebookInteraction.post') }}
                <!-- 评论详情弹窗 -->
                <Poptip width="600"
                        placement="bottom-start"
                        popper-class="pop-show"
                        @hide="hidePostModal"
                        @show="handleClickPostModal(item)">
                    <!-- trigger -->
                    <span slot="reference"
                          :class="`item-event ${class_clickontheFacebookinteractivelink}`">【{{ item.eventCustomVar.postContent }}】</span>
                    <!-- content -->
                    <div style="min-height: 500px"
                         class="api">
                        <PostModal :visible="viewPostModal"
                                   :post="post"
                                   :fbComments="fbComments"
                                   :pageAvatar="pageAvatar"
                                   @addPageNum="addPageNum"></PostModal>
                    </div>
                </Poptip>
            </div>
        </div>
        <!-- FB leads -->
        <div v-else>
            <div class="item-header clearfloat">
                <div class="item-title">Facebook leads</div>
                <div v-if="type == 'clue'"
                     @click="viewClue(item.clueId)"
                     :class="(type === 'clue' && $route.path.startsWith('/clue_manage')) ? 'header-source-current' : 'header-source'">
                    {{ $t('timeLine.fromClue') }}{{ clue_short_info.a1009 }}
                </div>
                <!-- 产品提出联系人详情页，在网站交互/FB交互/邮件时间轴后不需要显示“来自联系人xxx”的字样 -->
                <!-- 杨娣 2020/05/27 -->
                <div v-else-if="type !== 'contact'"
                     @click="viewContact(item)"
                     :class="type === 'contact' ? 'header-source-current' : 'header-source'">
                    {{ $t('timeLine.fromContacts') }}
                    {{ item.contactsName | filterName }}
                </div>
                <div class="item-time">{{ item.eventTime | timeFormat("DateTime") }}</div>
            </div>
            <div class="item-body">
                【{{ item.eventUser }}】{{ $t('facebookInteraction.fillin') }}
                <Poptip placement="bottom-start"
                        @show="leadsId = item.eventCustomVar.leadsId">
                <span slot="reference"
                      :class="`item-event ${class_clickontheFacebookinteractivelink}`">
                    【{{ item.eventCustomVar.partSys }}】</span>
                    <div style="min-height: 260px;"
                         class="api">
                        <FbLeadsModal :leadsId="leadsId"></FbLeadsModal>
                    </div>
                </Poptip>
            </div>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue';
    import { mapState } from 'vuex';
    import util from '@/libs/util';
    import i18n from '@/locale';
    import ConversationModal from '@/views/main-components/timeline/facebook-interaction/modal/ConversationModal';
    import PostModal from '@/views/main-components/timeline/facebook-interaction/modal/PostModal';
    import FbLeadsModal from '@/views/main-components/timeline/facebook-interaction/modal/FbLeadsModal';

    export default {
        name: 'facebookItem',
        components: {
            ConversationModal,
            PostModal,
            FbLeadsModal
        },
        props: {
            item: {
                type: Object,
                default() {
                    return {};
                }
            },
            type: {
                type: String,
                default: ''
            }
        },
        filters: {
            filterName(value) {
                return value || i18n.t('timeLine.unknown');
            }
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                clue_short_info: 'clue_short_info'
            }),
            $lang() {
                return Vue.config.lang;
            },
            class_clickontheFacebookinteractivelink() {
                switch (this.type) {
                    case 'clue':
                        return 'clue-click-on-the-facebook-interactive-link';
                    case 'inquiry':
                        return 'inquiry-clickontheFacebookinteractivelink';
                    case 'customer':
                        return 'customer-clickontheFacebookinteractivelink';
                    case 'highseasCustomer':
                        return 'highseasCustomer-clickontheFacebookinteractivelink';
                    case 'contact':
                        return 'contact-clickontheFacebookinteractivelink';
                    default:
                        return '';
                }
            }
        },
        data() {
            return {
                currentPageId: '', // 当前主页id
                commentDetailInfo: {},
                pageNumber: 1,
                pageSize: 15,
                post: null,
                pageAvatar: '',
                fbComments: [],
                viewPostModal: false,
                viewConversationModal: false,
                idFlag: 0,
                conversationName: '',
                messageList: [],
                avatar: null,
                conversationId: '',
                pageId: '', // 对应主页ID
                leadsId: '',
                conversationClueId: ''
            };
        },
        methods: {
            // 弹出联系人详情
            viewContact(item) {
                this.$emit('viewContact', item);
            },
            // 弹出线索详情
            viewClue(clueId) {
                if (this.$route.path.startsWith('/clue_manage')) {
                    return;
                }
                this.$emit('viewClue', clueId);
            },
            // -----------------------------------------------------------------facebook相关接口
            addPageNum() {
                console.log('addPageNum');
                this.pageNumber += 1;
                this.getPostCommentDetail();
            },
            // 评论详情框显示回调
            handleClickPostModal(item) {
                // 获取评论详情
                if (item.clueId) {
                    this.getPostIdByClueId(item.clueId);
                } else {
                    this.getAssosationPostDetail(item.eventId);
                }
            },
            // 获取帖子详情 -- 自动关联
            getAssosationPostDetail(commentId) {
                util.ajaxInternationalJson({
                    url: '/social/autoAssociate/getCommentDetail',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        targetType: 2,
                        targetId: commentId
                    }
                }).then(res => {
                    console.log(res);
                    if (res.data.code === '1') {
                        const dataInfo = res.data.data;
                        this.commentDetailInfo = dataInfo;
                        this.post = JSON.parse(dataInfo.postDetail);
                        this.pageAvatar = `https://graph.facebook.com/v2.11/${this.post.from.id}/picture`;
                        if (this.pageNumber === 1) {
                            this.getPostCommentDetail();
                        }
                    }
                });
            },
            /**
             * @Date: 2020-06-15 15:48:44
             * @LastEditors: niumkiki
             * @description: 不使用原来的接口了；换成跟fb评论相同的接口；
             *               需要新加一个接口获取fb pageId 等信息
             * @param:
             * @return:
             */
            getPostIdByClueId(clueId) {
                util.ajaxInternational({
                    url: '/social/facebookComment/getCommentDetailInfo',
                    method: 'get',
                    params: {
                        clueId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.commentDetailInfo = res.data.data;
                        this.getPostDetail();
                    } else {
                        this.commentDetailInfo = {};
                        this.$Message.warning(this.$t('facebook.inbox.fbComment.postErrorTip'));
                    }
                }).catch(() => {
                    this.commentDetailInfo = {};
                    this.$Message.warning(this.$t('facebook.inbox.fbComment.postErrorTip'));
                });
            },
            getPostDetail() {
                const { pageId, userId, postId, pagePicture } = this.commentDetailInfo;
                util.ajaxInternational({
                    url: '/social/getPostDetailByPostId',
                    method: 'get',
                    params: {
                        pageId,
                        userId,
                        postId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.post = response.data.data;
                        this.pageAvatar = pagePicture;

                        if (this.pageNumber === 1) {
                            this.getPostCommentDetail();
                        }
                    } else if (response.data.code === '2') {
                        this.post = null;
                        this.$Message.warning(this.$t('inbox.accountfailTip1'));
                    } else {
                        this.post = null;
                        this.$Message.warning(this.$t('facebook.inbox.fbComment.postErrorTip'));
                    }
                }).catch(erro => {
                    this.post = null;
                    this.$Message.warning(this.$t('facebook.inbox.fbComment.postErrorTip'));
                });
            },
            // 获取评论详情
            getPostCommentDetail() {
                const { pageId, postId, commentId } = this.commentDetailInfo;
                util.ajaxInternational({
                    url: '/social/getPostCommentDetailByPostId',
                    method: 'get',
                    params: {
                        pageId,
                        userId: this.userId,
                        postId,
                        pageNo: this.pageNumber,
                        pageSize: this.pageSize
                    }
                }).then(response => {
                    console.log(response, '获取评论详情');
                    if (response.data.code === '1') {
                        if (JSON.stringify(response.data.data) === '{}') {
                            this.$Message.info(this.$t('facebook.inbox.noMoreComment'));
                        } else {
                            if (response.data.data.data.length) {
                                const list = response.data.data.data;
                                this.dealPic(list);
                                this.fbComments = this.fbComments.concat(list);
                                this.fbComments = this.fbComments.map(item => {
                                    // 有客户报错没有 from 信息, 给加上兼容处理
                                    if (!item.from) {
                                        item.from = {
                                            name: this.$t('facebook.fbVisitor'),
                                            id: `${item.id}-haveNoFrom`,
                                            picture: 'http://content.leadscloud.com/2730921213693134.jpg'
                                        };
                                    }

                                    // item.commentatorAvatar = `https://graph.facebook.com/v2.11/${item.from.id}/picture`;
                                    if (item.id === commentId) {
                                        this.$set(item, 'class', 'currentComment');
                                    }
                                    if (item.comments) {
                                        item.comments.data.forEach(i => {
                                            // 有客户报错没有 from 信息, 给加上兼容处理
                                            if (!i.from) {
                                                i.from = {
                                                    name: this.$t('facebook.fbVisitor'),
                                                    id: `${i.id}-haveNoFrom`,
                                                    picture: 'http://content.leadscloud.com/2730921213693134.jpg'
                                                };
                                            }

                                            // i.commentatorAvatar = `https://graph.facebook.com/v2.11/${i.from.id}/picture`;
                                            if (i.id === commentId) {
                                                this.$set(i, 'class', 'currentComment');
                                            }
                                        });
                                    } else {
                                        this.$set(item, 'comments', { data: [] });
                                    }
                                    return item;
                                });
                                this.viewPostModal = true;
                            }
                        }
                    }
                });
            },
            // 将评论详情中出现头像的url转成base64
            async dealPic(list) {
                const arr = [];
                for (let i = 0; i < list.length; i++) {
                    if (list[i].comments) {
                        for (let j = 0; j < list[i].comments.data.length; j++) {
                            const temp = list[i].comments.data[j].from;
                            const secImg = list[i].comments.data[j].attachment;
                            if (temp.picture) {
                                if (arr[temp.id]) {
                                    temp.picture = arr[temp.id];
                                } else {
                                    const changePicture = await this.getPostsPicturesUrl(temp.picture);
                                    temp.picture = changePicture;
                                    arr[temp.id] = changePicture;
                                }
                                if (secImg) {
                                    const secCommentPic = await this.getPostsPicturesUrl(secImg.media.image.src);
                                    secImg.media.image.src = secCommentPic;
                                }
                            } else {
                                temp.picture = 'http://content.leadscloud.com/2730921213693134.jpg';
                            }
                        }
                    }
                    const item = list[i].from;
                    const attr = list[i].attachment;
                    if (item.picture) {
                        if (arr[item.id]) {
                            item.picture = arr[item.id];
                        } else {
                            const getPicture = await this.getPostsPicturesUrl(item.picture);
                            item.picture = getPicture;
                            arr[item.id] = getPicture;
                        }
                    } else {
                        item.picture = 'http://content.leadscloud.com/2730921213693134.jpg';
                    }
                    if (attr) {
                        const commentPic = await this.getPostsPicturesUrl(attr.media.image.src);
                        attr.media.image.src = commentPic;
                    }
                }
            },
            getPostsPicturesUrl(post) {
                return new Promise((resolve, reject) => {
                    util.ajaxInternational({
                        url: '/social/getPictureUrl',
                        method: 'post',
                        data: {
                            link: post
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            resolve(response.data.data[0]);
                        }
                    });
                });
            },
            // 获取会话内容 -- 自动关联
            getAssosiationMessages() {
                this.viewConversationModal = false;
                util.ajaxInternationalJson({
                    url: '/social/autoAssociate/getConversationDetail',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        targetType: 1,
                        targetId: this.conversationId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.messageList = response.data.data.list;
                        this.avatar = response.data.data.customVar;
                        this.viewConversationModal = true;
                    }
                });
            },
            // 获取会话内容 -- 原始
            getMessages(clueId) {
                this.viewConversationModal = false;
                util.ajaxInternational({
                    url: '/social/facebookEvent/getConversationDetail',
                    method: 'get',
                    params: {
                        conversationId: this.conversationId,
                        clueId: clueId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.messageList = response.data.data.list;
                        this.avatar = JSON.parse(response.data.data.customVar);
                        this.viewConversationModal = true;
                        this.currentPageId = response.data.data.pageId; // 保存当前主页id
                    }
                });
            },
            // 评论详情弹窗关闭回调
            hidePostModal() {
                // 置空数据
                this.viewPostModal = false;
                this.fbComments = [];
                this.pageNumber = 1;
                this.post = null;
                this.commentDetailInfo = {};
                this.pageAvatar = '';
            },
            handleClickConversationModal(item) {
                this.conversationName = item.eventCustomVar.conversationName;
                this.conversationId = item.eventCustomVar.conversationId;
                this.pageId = item.eventCustomVar.pageId;
                // const temp = {
                //     conversationId: this.conversationId,
                //     customerName: this.conversationName,
                //     pageId: this.pageId
                // };
                // this.conversations_info.push(temp);
                console.log(' === == === == === = == handleClickConversationModal', item);
                if (item.eventCustomVar.clueId) {
                    this.conversationClueId = item.eventCustomVar.clueId;
                    this.getMessages(this.conversationClueId);
                } else {
                    this.conversationClueId = '';
                    this.idFlag = item.id;
                    this.getAssosiationMessages();
                }
                // this.viewConversationModal = true;
            },
            handleCloseConversationModal() {
                this.viewConversationModal = false;
                this.idFlag = 0;
                this.conversationName = '';
                this.conversationId = '';
                this.conversationClueId = '';
                // this.senderIds = [];
            }
        }
    };
</script>
