<template>
    <Row class="fb-comment" :style="`height:${bodyHeight}px`" v-loading="fbCommentLoading">
        <!-- <Spin fix v-if="fbCommentLoading"></Spin> -->
        <Col :style="`width: ${littleDrawerVisible || commentVerbalList ? (menuExpand ? '61.1111%': '63.7777%' )  : '100%'}`"
            :span="chatBoxSpan ? chatBoxSpan : (littleDrawerVisible || commentVerbalList) ? 14:24">
            <post-detail
                    :commentator-name="commentatorName"
                    :post="post"
                    :page-avatar="pageAvatar"
                    :page-access-token="pageAccessToken"
                    :comment-and-post="commentAndPost"
                    :comments="comments"
                    :showDetail="showDetail"
                    :current-comment-id="currentCommentId"
                    :inquiry_id="inquiryId"
                    :clue_id="clueId"
                    :pageId="pageId"
                    :select-shortcuts="selectShortcuts"
                    :websocket-comment="websocketComment"
                    :fbdetailLoading="fbdetailLoading"
                    @CommentVerbalIcon="CommentVerbalIcon"
                    @letShortcutsShow="val=>isShortcutsShow=val"
                    @updateCommentStatus="updateCommentStatus"
                    @updateCommentClueStatus="updateCommentClueStatus"
                    @changeShowDetail="toggleShowLittleDrawer"
                    @get_cor_inquiry="get_cor_inquiry"
                    @getCompanyIdByClueId="getCompanyIdByClueId"
                    @updateClueId="updateClueId"
                    @addPageNum='addPageNum'
            >
            </post-detail>
        </Col>
        <!-- <Col :span="10" v-if="clueId && !inquiryId && showDetail">
            <clue-detail :clue-id="clueId" @changeShowDetail="changeShowDetail"
                         originalType="Fb-comment"></clue-detail>
        </Col>
        <Col :span="10" v-else-if="inquiryId && showDetail">
            <inquiry-detail :inquiryId="inquiryId" :companyId="companyId" @changeShowDetail="changeShowDetail"
                            originalType="Fb-comment"></inquiry-detail>
        </Col> -->
         <Col :span="10" style="width:35%" v-show="littleDrawerVisible">
            <littleDrawer 
                :visible="littleDrawerVisible"
                :id="postId"
                :currAccountInfo="commentAndPost"
                :selectOptions="selectOptions"
                :corp_columns_authorized="corp_columns_authorized"
                :inquiry_columns_authorized="inquiry_columns_authorized"
                :contact_columns_authorized="contact_columns_authorized"
                :fbCommentDetail="post"
                type="journeyDetail"
                from="fb_comment"
                @littleDrawerHidden="littleDrawerHidden"
                @updateCommentStatus="updateCommentStatus"
                @updateCommentClueStatus="updateCommentClueStatus"
                 @updateClueId="updateClueId"
            ></littleDrawer>
         </Col>
        <Col :span="9" v-show="commentVerbalList" style="position: absolute;top: 0;right: 0;width: 35%;height:100%">
            <transition name="slide-fade">
                <short-cuts
                        @letShortcutsShow="shortCutsShow"
                        @verbalSelected="selVerbal"
                        :controVerbalIcon="controVerbalIcon"
                ></short-cuts>
            </transition>
        </Col>
    </Row>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    import PostDetail from './components/PostDetail';
    // import Shortcuts from '../components/Shortcuts' 
    import shortCuts from '@/views/main-components/Shortcuts.vue';
    // import CompanyDetail from '@/views/main-components/tiny-detail/company-detail/CompanyDetail';
    // import ClueDetail from '@/views/main-components/tiny-detail/clue-detail/ClueDetail';
    // import InquiryDetail from '@/views/main-components/tiny-detail/Inquiry-detail/InquiryDetail';
    import littleDrawer from '@/views/main-components/little-drawer/little-drawer.vue';

    export default {
        name: 'FbComment',
        props: {
            bindingUserId: {},
            pageAvatar: {
                type: String,
                default: '',
                required: true
            },
            pageAccessToken: {
                type: String,
                default: '',
                required: true
            },
            commentorAndPostId: {
                type: String,
                default: '',
                required: true
            },
            currentCommentorId: {
                type: String,
                default: '',
                required: true
            },
            commentatorName: {
                type: String,
                default: '',
                required: true
            },
            commentAndPost: {
                type: Object,
                default() {
                    return {};
                }
            },
            pageId: {
                type: String,
                default: '',
                required: true
            },
            postId: {
                type: String,
                default: '',
                required: true
            },
            currentCommentId: {
                type: String,
                default: ''
            },
            letCommentLoading: {
                type: Boolean,
                default: false
            },
            websocketComment: {
                type: Object,
                default() {
                    return {};
                }
            },
            selectOptions: {
                type: Object,
                default() {
                    return {};
                }
            },
            // 客户表单数据
            corp_columns_authorized: {
                type: Object,
                default() {
                    return {};
                }
            },
            // 联系人表单数据
            contact_columns_authorized: {
                type: Object,
                default() {
                    return {};
                }
            },
            // 询盘表单数据
            inquiry_columns_authorized: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        components: {
            PostDetail, 
            shortCuts, 
            // CompanyDetail, 
            // ClueDetail, 
            // InquiryDetail ，
            littleDrawer
        },
        data() {
            return {
                // 弹窗新增
                littleDrawerVisible: false,
                controVerbalIcon: 0,
                fbdetailLoading: true,
                pageNumber: 1,
                pageSize: 15,
                fbCommentLoading: true,
                post: {
                    from: {
                        name: '',
                        id: ''
                    }
                },
                comments: [],
                isShortcutsShow: false,
                selectShortcuts: {},
                companyId: 0,
                chatBoxSpan: 0, // chatBox所占的span
                clueId: '',
                showDetail: false,

                /* 右上角显示询盘或操作 */
                show_operate: false,
                inquiryId: undefined,
                inquirySeqNumber: undefined,
                flag_inquiry_id_requested: false // 询盘 ID 请求完成
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                window_height: state => state.window_height,
                commentVerbalInfo: state => state.commentVerbalInfo,
                commentSecondVerbalInfo: state => state.commentSecondVerbalInfo,
                commentVerbalList: 'commentVerbalList',
                assosiatedFbCommentInquiryId: state => state.assosiatedFbCommentInquiryId,
                assosiatedFbCommentorAndPostId: state => state.assosiatedFbCommentorAndPostId,
                menuExpand: state => state.menuExpand
            }),
            bodyHeight() {
                const temp = this.window_height ? this.window_height - 60 : document.body.clientHeight - 60;
                return temp > 200 ? temp : 200;
            }
        },
        methods: {
            CommentVerbalIcon(flag) {
                this.controVerbalIcon = flag;
            },
            addPageNum() {
                this.pageNumber += 1;
                this.getPostCommentDetail();
            },
            selVerbal(item) {
                console.log(item);
                if (item.type == 0) {
                    this.$store.state.commentVerbalInfo.push(item.content.verbalContent);
                } else if (item.type == 1) {
                    this.$store.state.commentSecondVerbalInfo.push(item.content.verbalContent);
                }
            },
            shortCutsShow(val) {
                this.$store.state.commentVerbalList = val;
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
            // 获取帖子详情
            getPostDetail() {
                util.ajaxInternational({
                    url: '/social/getPostDetailByPostId',
                    method: 'get',
                    params: {
                        pageId: this.commentAndPost.page_id,
                        userId: this.bindingUserId,
                        postId: this.commentAndPost.post_id
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const post = response.data.data;
                        this.post = response.data.data;
                        if (post.attachments) {
                            this.attachments = post.attachments.data[0];
                        }
                        if (post.type === 'link') {
                            if (this.attachments.type === 'multi_share_no_end_card') {
                                this.subattachments = this.attachments.subattachments.data;
                            }
                        }
                    } else if (response.data.code === '2') {
                        this.fbCommentLoading = false;
                        this.$Message.warning(this.$t('inbox.accountfailTip1'));
                    } else {
                        this.fbCommentLoading = false;
                        this.$Message.warning(this.$t('facebook.inbox.fbComment.postErrorTip'));
                    }
                }).catch(erro => {
                    this.fbCommentLoading = false;
                    this.$Message.warning(this.$t('facebook.inbox.fbComment.postErrorTip'));
                });
            },
            // 获取评论详情
            getPostCommentDetail() {
                this.fbdetailLoading = true;
                util.ajaxInternational({
                    url: '/social/getPostCommentDetailByPostId',
                    method: 'get',
                    params: {
                        pageId: this.commentAndPost.page_id,
                        userId: this.bindingUserId,
                        postId: this.commentAndPost.post_id,
                        pageNo: this.pageNumber,
                        pageSize: this.pageSize
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.fbCommentLoading = false;
                        this.fbdetailLoading = false;
                        if (JSON.stringify(response.data.data) === '{}') {
                            this.$Message.info(this.$t('facebook.inbox.noMoreComment'));
                        } else {
                            if (response.data.data.data.length) {
                                const list = response.data.data.data;
                                this.dealPic(list);
                                this.comments = this.comments.concat(list);
                            }
                        }
                    }
                });
            },
            // 通过commentId获取询盘id
            getInquiryIdByFbCommentId() {
                util.ajaxJson({
                    url: '/crm/auto/getinquiryIdByFaceBookId',
                    method: 'post',
                    params: {
                        orgId: this.enterpriseId,
                        targetType: 2,
                        targetId: `${this.postId}_${this.currentCommentorId}`
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.inquiryId = res.data.data[0];
                    } else {
                    }
                    this.$store.commit('setAssosiatedFbCommentorAndPostId', '');
                });
            },
            // 根据线索id查客户id
            getCompanyIdByClueId() {
                util.ajax({
                    url: '/crm/entityRelation/getCompanyIdByClueId?',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        clueId: this.commentAndPost.clue_id
                    }
                }).then((response) => {
                    if (response.data.code === '1') {
                        if (response.data.data.companyId) {
                            this.companyId = response.data.data.companyId;
                        }
                    }
                });
            },
            // 获取与线索对应的询盘 Id 和 seqNumber , 如果有的话
            get_cor_inquiry() {
                this.inquiryId = undefined;
                this.inquirySeqNumber = undefined;
                this.flag_inquiry_id_requested = false;
                util.ajaxJson({
                    url: '/crm/inquiry/getInquirySeqList',
                    method: 'post',
                    data: {
                        clueIdList: [this.clueId]
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        if (res.data.data[this.clueId]) {
                            this.inquirySeqNumber = res.data.data[this.clueId].seqNumber;
                            this.inquiryId = res.data.data[this.clueId].inquiryId;
                            this.$emit('changeCommentCurrentStatus', 102);
                        }
                    } else {
                    }
                    this.flag_inquiry_id_requested = true;
                });
            },
            updateCommentStatus(status) {
                console.log('----------------------')
                console.log(this.from);
                console.log(status);
                this.$store.state.commentVerbalList = false;
                this.$emit('updateCommentStatus', status);
            },
            updateCommentClueStatus(status) {
                this.$store.state.commentVerbalList = false;
                this.$emit('updateCommentClueStatus', status);
            },
            changeShowDetail(isShow) {
                console.log('changeShowDetail()');
                this.showDetail = isShow;
                if (isShow) {
                    this.chatBoxSpan = 0;
                } else {
                    this.chatBoxSpan = 24;
                }
                /**
                 * @Date: 2020-05-06 14:48:39
                 * @LastEditors: niumkiki
                 * @description: 修改fb评论弹窗弹出逻辑
                 * @param :
                 * @return:
                 */
                if (this.commentAndPost.clue_status === 101 || this.commentAndPost.clue_status === 102) {
                    this.clueId = this.commentAndPost.clue_id;
                    if (this.clueId) {
                        this.getCompanyIdByClueId();
                        this.get_cor_inquiry();
                    } else {
                        this.getInquiryIdByFbCommentId();
                    }
                }
            },
            /* 录入线索完成后更新clueId */
            updateClueId(id) {
                if (id) {
                    this.clueId = id;
                    this.get_cor_inquiry();
                    this.$emit('updateCurrentCommentAndPost', this.clueId);
                }
            },
            onVisibilityChange() {
                // 不同浏览器 hidden 名称
                const hiddenProperty = 'hidden' in document ? 'hidden'
                    : 'webkitHidden' in document ? 'webkitHidden'
                        : 'mozHidden' in document ? 'mozHidden'
                            : null;
                if (!document[hiddenProperty]) {
                    // 切换页面后获取当前对话的状态是否有改变
                    if (this.clueId) {
                        this.getCompanyIdByClueId();
                        this.get_cor_inquiry();
                    }
                } else {
                    console.log('窗口切换了');
                }
            },
            // 小右侧框组件
            toggleShowLittleDrawer(){
                console.log('toggleShowLittleDrawertoggleShowLittleDrawertoggleShowLittleDrawer')
                this.littleDrawerVisible = !this.littleDrawerVisible;
            },
            littleDrawerHidden(val){
                this.littleDrawerVisible = val;
            },
        },
        created() {
            if (this.commentorAndPostId) {
                // this.getPostDetail();
                // this.getPostCommentDetail();
                // if (this.commentAndPost.clue_status === 101 || this.commentAndPost.clue_status === 102) {
                //     this.clueId = this.commentAndPost.clue_id;
                //     if (this.clueId) {
                //         this.getCompanyIdByClueId();
                //         this.get_cor_inquiry();
                //     } else {
                //         this.getInquiryIdByFbCommentId();
                //     }
                // }
            }
            // 不同浏览器 hidden 名称
            const hiddenProperty = 'hidden' in document ? 'hidden'
                : 'webkitHidden' in document ? 'webkitHidden'
                    : 'mozHidden' in document ? 'mozHidden'
                        : null;
            // 不同浏览器的事件名
            const visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
            document.addEventListener(visibilityChangeEvent, this.onVisibilityChange);
        },
        beforeDestroy() {
            // 不同浏览器 hidden 名称
            const hiddenProperty = 'hidden' in document ? 'hidden'
                : 'webkitHidden' in document ? 'webkitHidden'
                    : 'mozHidden' in document ? 'mozHidden'
                        : null;
            // 不同浏览器的事件名
            const visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
            document.removeEventListener(visibilityChangeEvent, this.onVisibilityChange);
        },
        watch: {
            commentorAndPostId: {
                handler(val) {
                    if(val){
                        this.getPostDetail();
                        this.getPostCommentDetail();
                        this.littleDrawerVisible = true;
                    }else{
                        this.littleDrawerVisible = false;
                    }
                },
                immediate: true
                // if (this.commentAndPost.clue_status === 101 || this.commentAndPost.clue_status === 102) {
                //     this.clueId = this.commentAndPost.clue_id;
                //     if (this.clueId) {
                //         this.getCompanyIdByClueId();
                //         this.get_cor_inquiry();
                //     } else {
                //         this.getInquiryIdByFbCommentId();
                //     }
                // }
            },
            letCommentLoading(val) {
                this.fbChatLoading = val;
            },
            commentAndPost() {
                this.clueId = this.commentAndPost.clue_id;
                // if (this.clueId) {
                //     this.getCompanyIdByClueId();
                //     this.get_cor_inquiry();
                // } else {
                //     this.getInquiryIdByFbCommentId();
                // }
            },
            assosiatedFbCommentInquiryId(val) {
                if (val) {
                    this.inquiryId = val;
                }
            },
            assosiatedFbCommentorAndPostId: {
                handler(val) {
                    // if (val) {
                    //     if (this.commentAndPost.clue_status === 101 || this.commentAndPost.clue_status === 102) {
                    //         this.getInquiryIdByFbCommentId();
                    //     }
                    // }
                },
                immediate: true
            }
        }
    };
</script>
<style lang="less">
    .fb-comment {
        .ivu-col {
            height: 100%;
        }
        .el-col-14 {
            border-right: 1px solid rgb(232, 232, 232);
        }
    }
</style>
