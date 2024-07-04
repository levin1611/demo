<template>
    <div class="post-detail" :style="`height:${bodyHeight}px`">
        <div class="post-detail-header">
            <div style="display: none">{{commentVerbalInfo}}</div>
            <div style="display: none">{{commentSecondVerbalInfo}}</div>
            <div class="post-detail-header-name">{{commentatorName}}</div>
            <div class="post-detail-header-status" v-if="commentAndPost.clue_status===1 || commentAndPost.clue_status===2">
                <Tooltip :content="commentAndPost.clue_status === 1 ?  $t('littleDrawer.undocumentedCustomers') : $t('littleDrawer.irrelevantCustomer')" placement="left">
                    <svg class="svg-icon" aria-hidden="true"
                         :style="{cursor:'pointer', width:'32px', height:'32px',verticalAlign: 'middle'}"
                         @click="$emit('changeShowDetail', true)">
                        <use xlink:href="#custom-unfiled"></use>
                    </svg>
                </Tooltip>
                <!-- <Dropdown trigger="click" @command="handleStatusUpdate" >
                    <div  class="frame-status">
                        {{commentAndPost.clue_status===2? $t('chat.nothingWith'): $t('chat.noEntry')}}
                        <Icon type="ios-arrow-down"></Icon>
                    </div>
                     <DropdownMenu slot="dropdown" class="handle-status-dropdown-menu">
                        <DropdownItem v-for="item in statusOptions" :key="item.value" :command="item.value" :class="item.class"
                            :disabled="commentAndPost.clue_status=== item.value"
                        >
                            {{ item.label }}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Icon
                  custom="custom custom-enter-clue"
                  size="24" @click.native="enterClue"
                  style="cursor: pointer;margin-left: 10px;"
                  v-if="commentAndPost.clue_status!==2"></Icon> -->
            </div>
            <div class="post-detail-header-status" v-else>
               <Tooltip :content="commentAndPost.clue_status === 102 ?  $t('clue.inquiry') : $t('clue.clue')" placement="left">
                 <svg class="svg-icon" aria-hidden="true"
                      :style="{cursor:'pointer',width:'32px', height:'32px',verticalAlign: 'middle'}"
                      @click="$emit('changeShowDetail', true)">
                   <!-- <use v-if="clueId && !inquiryId" xlink:href="#custom-clue" ></use>
                   <use v-if="inquiryId" xlink:href="#custom-inquiry" ></use> -->
                   <use v-if="commentAndPost.clue_status === 101" xlink:href="#custom-clue"></use>
                    <use v-if="commentAndPost.clue_status === 102" xlink:href="#custom-inquiry"></use>
                 </svg>
               </Tooltip>
            </div>
        </div>
        <div class="post-detail-body" >
          <!-- <Spin fix v-if="fbdetailLoading"></Spin> -->
          <Scroll :on-reach-bottom="handleReachBottom" :height="parseInt(content_height)" :distance-to-edge="10">
            <!-- <div :style="{'height':`${parseInt(content_height)}px`,'overflow':'auto'}" v-infinite-scroll="handleReachBottom" infinite-scroll-immediate="false" :infinite-scroll-distance="10"> -->

            <div class="post-detail-body-title"  >
                <Avatar :src="pageAvatar"/>
                <div style="display:inline-block;vertical-align: middle;margin: 0 10px;">
                    <p>{{post.from.name}}</p>
                    <p>{{post.created_time | timeFormat("DateTimeHm")}}</p>
                </div>
            </div>
            <Card class="post-detail-body-content">
                <pre v-html="filterUrl(post.message)"></pre>
                <!-- {{post.message}} -->
                <div v-if="post.full_picture">
                    <img
                        :src="item" style="height: 150px;margin-right: 5px;"
                        @click="imgPreview"
                        v-for="item in post.full_picture.split(',')">
                </div>
                <div v-else-if="post.type==='video'"><img :src="post.full_picture" style="width:100%" @click="imgPreview"></div>
                <div v-else-if="post.type==='link'" style="border:1px solid #dddee1;">
                    <template v-if="attachments.type==='multi_share_no_end_card'">
                        <Carousel dots="outside" arrow="always">
                            <CarouselItem v-for="(item,index) in subattachments" :key="index">
                                <div>
                                    <img :src="item.media.image.src" style="width:100%">
                                    <div style="border-top:1px solid #dddee1;padding:10px;position:relative;min-height: 60px;">
                                        <div style="font-size: 16px;font-weight: bold;margin-bottom: 10px;">{{item.title}}</div>
                                        <div>{{item.description}}</div>
                                        <div class="price-btn">{{$t('facebook.inbox.fbComment.inquiryNow')}}</div>
                                    </div>
                                </div>
                            </CarouselItem>
                        </Carousel>
                    </template>
                    <template v-else-if="attachments.type==='lead_gen'">
                        <div>
                            <img :src="attachments.media.image.src" style="width:100%">
                            <div style="border-top:1px solid #dddee1;padding:10px;position:relative">
                                <div style="font-size: 16px;font-weight: bold;margin-bottom: 10px;min-height: 60px;">{{attachments.title}}</div>
                                <div>{{attachments.description}}</div>
                                <div class="price-btn">{{$t('facebook.inbox.fbComment.inquiryNow')}}</div>
                            </div>
                        </div>
                    </template>
                </div>
            </Card>
            <div class="post-detail-body-comments">
                <div v-for="(comment,commentIndex) in commentList" :key="comment.id">
                    <Avatar :src="comment.from.picture" />
                    <span class="post-comments-from">{{comment.from.name}}</span>
                    <span :class="comment.id===currentCommentId?'current-comment':comment.class">{{comment.message}}</span>
                    <span v-show="comment.attachment" style="display: block;padding-left: 30px;">
                      <img
                      :src="comment.attachment.media.image.src"
                      alt=""
                      v-if="comment.attachment"
                      style="width: 150px;height: 150px;"
                      @click="imgPreview"
                      >
                    </span>
                    <div class="opera-area">
                        <!-- 因fb api 升级问题： 去掉点赞功能 -->
                        <!-- <span @click="likePost(comment.id)" class="fbinbox-likecomment">{{$t('facebook.inbox.fbComment.like')}}</span>
                        · -->
                        <span @click="replyComment(commentIndex,comment.id)">{{$t('facebook.inbox.fbComment.reply')}}</span>
                        ·
                        <span style="padding:0 4px;color:#979797;font-size:12px;">{{comment.created_time | timeFormat("DateTimeHm")}}</span>
                    </div>
                    <div style="margin:10px 40px" v-if="comment.comments.data.length!==0">
                        <div v-for="secComment in comment.comments.data" :key="secComment.id">
                            <Avatar :src="secComment.from.picture" />
                            <span class="post-comments-from">{{secComment.from.name}}</span>
                            <span :class="secComment.id===currentCommentId?'current-comment':secComment.class">{{secComment.message}}</span>
                            <span v-show="secComment.attachment" style="display: block;padding-left: 30px;">
                              <img
                              :src="secComment.attachment.media.image.src"
                              alt=""
                              v-if="secComment.attachment"
                              style="width: 150px;height: 150px;"
                              @click="imgPreview"
                              >
                            </span>
                            <div class="opera-area">
                                <!-- <span @click="likePost(secComment.id)" class="fbinbox-likecomment">{{$t('facebook.inbox.fbComment.like')}}</span>
                                · -->
                                <span @click="replySecComment(commentIndex,comment.id)">{{$t('facebook.inbox.fbComment.reply')}}</span>
                                ·
                                <span style="padding:0 4px;color:#979797;font-size:12px;">{{secComment.created_time | timeFormat("DateTimeHm")}}</span>
                            </div>
                        </div>
                    </div>
                    <div class="reply-input-area" v-if="commentList[commentIndex].replyModelShow">
                        <Avatar :src="pageAvatar" style="vertical-align:top;margin-right: 10px;"/>
                        <div class="input-box" style="border:1px solid #E8E8E8;display:inline-block;width:calc(100% - 42px)">
                            <Input
                                    v-model="commentList[commentIndex].replyMessage"
                                    :placeholder="$t('inbox.enterComment')"
                                    @keyup.enter.native="sendReply($event, comment.id,commentIndex,comment.replyMessage)"
                                    @focus="handleContentInputFocus"
                                    />
                            <div class="input-box-footer-left">
                                <Select v-model="language" style="width:98px;margin-right:4px;">
                                    <Option v-for="item in languageList" :value="item.value" :key="item.value" :label="item.label"></Option>
                                </Select>
                                <Icon custom="custom custom-verbal-trick" size="20" @click="showContentVerbal" style="cursor: pointer;"></Icon>
                                <self-upload
                                    ref="upload"
                                    :show-upload-list="false"
                                    :on-success="handleSecUploadSuccess"
                                    :user-type="3"
                                    :maxSize="2"
                                    action=""
                                    style="display:inline-block;cursor:pointer;margin-left:20px;">
                                    <Icon class="fbcomment-uploadimg" custom="custom custom-annex-file gtm_facebookUpload" size="19"></Icon>
                                </self-upload>
                            </div>
                            <div class="input-box-footer-right">
                                <Button :disabled="!comment.replyMessage" @click="translate(0,commentIndex)" :loading="translateLoading1">{{$t('facebook.inbox.fbChat.translate')}}</Button>
                                <Button :disabled="!comment.replyMessage" @click="sendReply($event, comment.id,commentIndex,comment.replyMessage)" :loading="sendLoading1" style="margin-left:10px;">{{$t('facebook.inbox.fbChat.send')}}</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- </div> -->
          </Scroll>
        </div>
        <div class="post-detail-footer">
            <div class="input-box">
                <Input v-model="inputMessage" id="fbCommentBox" ref="input" type="textarea" :rows="2" :placeholder="$t('placeholder.sendTip')" @keydown.enter.native="inputOnKeyDown" @blur="handleInputBlur" @focus="handleInputFocus"/>
                <div class="input-box-footer-left">
                    <Select v-model="language" style="width:98px;margin-right:15px;">
                        <Option v-for="item in languageList" :value="item.value" :key="item.value" :label="item.label"></Option>
                    </Select>
                    <Icon custom="custom custom-verbal-trick" size="20" @click="showVerbal" style="cursor: pointer;"></Icon>
                    <self-upload
                        ref="upload"
                        :show-upload-list="false"
                        :on-success="handleUploadSuccess"
                        :user-type="3"
                        :maxSize="2"
                        action=""
                        style="display:inline-block;cursor:pointer;margin-left:20px;">
                        <Icon custom="custom custom-annex-file gtm_facebookUpload" class="fbcomment-uploadimg" size="19"></Icon>
                    </self-upload>
                </div>
                <div style="padding-right: 75px;"
                     class="input-box-footer-right">
                    <Button :disabled="!inputMessage" @click="translate(1)" :loading="translateLoading2">{{$t('facebook.inbox.fbChat.translate')}}</Button>
                    <Button :disabled="!inputMessage" @click="sendComment" :loading="sendLoading" style="margin-left:10px;">{{$t('facebook.inbox.fbChat.send')}}</Button>
                </div>
            </div>
        </div>
        <testModal
                v-model="clueModal"
                :title="$t('facebook.inbox.enterClue')"
                :mask-closable="false"
                class="modal companydata"
                :delLoading="delLoading"
                :saleList="saleList"
                type="fb_comment"
                :templateList="templateList"
                :json_data="json_data"
                :commentId="currentCommentId"
                :saveClueClass="'inbox_clueSubmit'"
                :saveClueAndInquiryClass="'inbox_clueAndInquirySubmit'"
                :okEnterInquiryClass="'inbox_inquirySubmit'"
                @on_cancle_clue="on_cancle_clue"
                @returnLeadsId="updateStatus"
                @updateInquiryStatus="updateInquiryStatus">
        </testModal>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import { FACEBOOK_COMMENT } from '@/api/config.js';

    import testModal from '@/views/main-components/enter-clue/enter-clue';
    import SelfUpload from '@/views/mail/mail-home/components/write-mail/self-upload';
    export default {
        name: 'PostDetail',
        props: {
            fbdetailLoading: {
                type: Boolean,
                default: true
            },
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
            post: {
                type: Object,
                default() {
                    return {
                        from: {
                            name: '',
                            id: ''
                        }
                    };
                }
            },
            comments: {
                type: Array,
                default() {
                    return [];
                }
            },
            currentCommentId: {
                type: String,
                default: ''
            },
            pageId: {
                type: String,
                default: ''
            },
            selectShortcuts: {
                type: Object,
                default() {
                    return {};
                }
            },
            websocketComment: {
                type: Object,
                default() {
                    return {};
                }
            },
            showDetail: {
                type: Boolean,
                default: true
            },
            clue_id: {
                type: String,
                default: ''
            },
            inquiry_id: {
                type: Number,
                default: 0
            }
        },
        components: { testModal, SelfUpload },
        data() {
            return {
                attachments: [],
                subattachments: [],
                inputMessage: '',
                statusOptions: [{
                    value: 1,
                    label: this.$t('chat.noEntry'),
                    class: 'fb-post-no-entry'
                }, {
                    value: 2,
                    label: this.$t('chat.nothingWith'),
                    class: 'fb-post-nothing-with'
                }],
                languageList: [
                    {
                        value: 'en',
                        label: this.$t('facebook.translate.English')
                    },
                    {
                        value: 'zh-CN',
                        label: this.$t('facebook.translate.Chinese')
                    },
                    {
                        value: 'es',
                        label: this.$t('facebook.translate.Spanish')
                    },
                    {
                        value: 'ru',
                        label: this.$t('facebook.translate.Russian')
                    },
                    {
                        value: 'ar',
                        label: this.$t('facebook.translate.Arabic')
                    },
                    {
                        value: 'fr',
                        label: this.$t('facebook.translate.French')
                    },
                    {
                        value: 'ja',
                        label: this.$t('facebook.translate.Japanese')
                    },
                    {
                        value: 'ko',
                        label: this.$t('facebook.translate.Korean')
                    },
                    {
                        value: 'ms',
                        label: this.$t('lang.ms')
                    },
                    {
                        value: 'id',
                        label: this.$t('facebook.translate.Indonesian')
                    },
                    {
                        value: 'it',
                        label: this.$t('lang.it')
                    },
                    {
                        value: 'vi',
                        label: this.$t('facebook.translate.Vietnamese')
                    },
                    {
                        value: 'pt',
                        label: this.$t('facebook.translate.Portuguese')
                    },
                    {
                        value: 'th',
                        label: this.$t('facebook.translate.Thai')
                    },
                    {
                        value: 'tr',
                        label: this.$t('facebook.translate.Turkish')
                    }
                ],
                language: 'en',
                translateLoading1: false,
                translateLoading2: false,
                replyLoading: false,
                sendLoading: false,
                sendLoading1: false, // 二级评论发送按钮loading
                // 录入线索相关
                clueModal: false,
                json_data: {},
                saleList: [], // 销售列表
                seqNumber: '', // 线索编号
                delLoading: false, // 弹出框loading
                colObj: {},
                templateList: [], // 线索模板列表
                clueId: '',
                inquiryId: 0,
                templateId: '',
                commentListTmp: [],
                inputBlurIndex: 0,
                currentIndex: null,
                currentId: null,
                verbalType: null
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                window_height: state => state.window_height,
                commentVerbalInfo: state => state.commentVerbalInfo,
                commentSecondVerbalInfo: state => state.commentSecondVerbalInfo,
                qiniuHttp: state => state.qiniuHttp
            }),
            bodyHeight() {
                const temp = this.window_height ? this.window_height - 60 : document.body.clientHeight - 60;
                this.content_height = temp - 53 - 100 - 40;
                return temp > 200 ? temp : 200;
            },
            commentList() {
                return this.commentListTmp.map(item => {
                    this.$set(item, 'replyModelShow', false);
                    this.$set(item, 'replyMessage', '');
                    if (!item.comments) {
                        this.$set(item, 'comments', { data: [] });
                    }
                    return item;
                });
            },
            statusLabel() {
                const statusObj = this.statusOptions.find(item => item.value === this.commentAndPost.clue_status);
                return statusObj ? statusObj.label : 'unknown';
            }
        },
        methods: {
            filterUrl(val) {
                if (val) {
                    const re = /((https|http):\/\/[\S.\/]+)(?![^<]+>)/gi; // 识别链接
                    return val.replace(re, '<a style=\'text-decoration:underline;color:inherit;\' href=\'$1\' target=\'_blank\'>$1</a>');
                } else {
                    return val;
                }
            },
            // 图片预览
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            },
            handleReachBottom() {
                this.$emit('addPageNum');
            },
            // 点击最下面输入框的话术图标
            showVerbal() {
                this.$store.state.commentVerbalList = !this.$store.state.commentVerbalList;
                this.$emit('CommentVerbalIcon', 0);
                this.verbalType = 0;
            },
            // 点击评论上的话术图标
            showContentVerbal() {
                this.$store.state.commentVerbalList = !this.$store.state.commentVerbalList;
                this.$emit('CommentVerbalIcon', 1);
                this.verbalType = 1;
            },
            // 插入话术
            changeInputMsg(msg) {
                /* 插入话术优化 */
                if (this.inputBlurIndex < this.inputMessage.length) {
                    this.inputMessage = this.inputMessage.substring(0, this.inputBlurIndex) + msg + this.inputMessage.substring(this.inputBlurIndex);
                } else {
                    this.inputMessage = this.inputMessage + msg;
                }
                const tempL = msg.length;
                const dom = document.getElementById('fbCommentBox').children[0];
                // console.log('tempL', tempL);
                // console.log('this.inputBlurIndex', this.inputBlurIndex);
                if (dom.setSelectionRange) {
                    this.$nextTick(() => {
                        dom.focus();
                        dom.setSelectionRange(this.inputBlurIndex + tempL, this.inputBlurIndex + tempL);
                    });
                }
            },
            // 在上方的评论插入话术
            changeCommentInputMsg(msg) {
                /* 插入话术优化 */
                this.commentList[this.currentIndex].replyMessage += msg;
            },
            handleInputBlur(e) {
                this.inputBlurIndex = e.target.selectionStart;
            },
            handleInputFocus() {
                if (this.verbalType == 1) {
                    this.$store.state.commentVerbalList = false;
                }
            },
            handleContentInputFocus() {
                if (this.verbalType == 0) {
                    this.$store.state.commentVerbalList = false;
                }
            },
            // 发送优化
            inputOnKeyDown(e) {
                const inputKeyDownIndex = e.target.selectionStart;
                if (e.ctrlKey && e.keyCode === 13) {
                    const dom = document.getElementById('fbCommentBox').children[0];
                    this.inputMessage = `${this.inputMessage.substring(0, inputKeyDownIndex)}\n${this.inputMessage.substring(inputKeyDownIndex)}`;
                    e.returnValue = false;
                    if (dom.setSelectionRange) {
                        this.$nextTick(() => {
                            dom.blur();
                            dom.setSelectionRange(inputKeyDownIndex + 1, inputKeyDownIndex + 1);
                            dom.focus();
                        });
                    } else if (dom.createTextRange) {
                        this.$nextTick(() => {
                            const range = dom.createTextRange();
                            range.collapse(true);
                            range.moveEnd('character', inputKeyDownIndex);
                            range.moveStart('character', inputKeyDownIndex);
                            range.select();
                        });
                    }
                } else if (!e.ctrlKey && e.keyCode === 13) {
                    e.preventDefault();
                    this.sendComment();
                }
            },
            replyComment(index, id) {
                this.currentIndex = index;
                this.currentId = id;
                for (let i = 0; i < this.commentListTmp.length; i++) {
                    this.$set(this.commentListTmp[i], 'replyModelShow', false);
                }
                if (!this.commentListTmp[index].replyMessage) {
                    this.$set(this.commentListTmp[index], 'replyMessage', '');
                }
                this.$set(this.commentListTmp[index], 'replyModelShow', !this.commentListTmp[index].replyModelShow);
                if (this.$store.state.commentVerbalList === true) {
                    this.$store.state.commentVerbalList = !this.$store.state.commentVerbalList;
                }
            },
            replySecComment(index, id) {
                this.currentIndex = index;
                this.currentId = id;
                for (let i = 0; i < this.commentListTmp.length; i++) {
                    this.$set(this.commentListTmp[i], 'replyModelShow', false);
                }
                if (!this.commentListTmp[index].replyMessage) {
                    this.$set(this.commentListTmp[index], 'replyMessage', '');
                }
                this.$set(this.commentListTmp[index], 'replyModelShow', !this.commentListTmp[index].replyModelShow);
                if (this.$store.state.commentVerbalList === true) {
                    this.$store.state.commentVerbalList = !this.$store.state.commentVerbalList;
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
            // 点赞
            likePost(id) {
                util.ajaxInternational({
                    url: '/social/likePost',
                    method: 'post',
                    data: {
                        postId: id,
                        accessToken: this.pageAccessToken
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$Message.success(this.$t('facebook.inbox.fbComment.likeSucc'));
                    } else {
                        this.$Message.error(this.$t('facebook.inbox.fbComment.likeFail'));
                    }
                });
            },
            // 一级评论
            sendComment(e) {
                if (e && e.type === 'keyup') {
                    if (e.keyCode === 13) {
                        e.returnValue = false;
                    }
                }
                if (!this.sendLoading) { // 不是正在发送中
                    if (this.inputMessage.replace(/(^\s*)|(\s*$)/g, '') !== '') { // 发送内容不为空和空格
                        this.sendLoading = true;
                        util.ajaxInternational({
                            url: '/social/comments',
                            method: 'post',
                            data: {
                                id: this.post.id,
                                accessToken: this.pageAccessToken,
                                message: this.inputMessage
                            }
                        }).then(async response => {
                            this.sendLoading = false;
                            if (response.data.code === '1') {
                                this.$Message.success(this.$t('facebook.inbox.fbComment.commentSucc'));
                                this.commentListTmp.unshift({
                                    comments: {
                                        data: []
                                    },
                                    created_time: response.data.data.commentsTime,
                                    commentatorAvatar: this.pageAvatar,
                                    from: {
                                        name: this.post.from.name,
                                        id: this.post.from.id,
                                        picture: this.pageAvatar
                                    },
                                    id: response.data.data.id,
                                    message: this.inputMessage,
                                    replyModelShow: false
                                });
                                this.inputMessage = '';
                            } else if (response.data.code === '2') {
                                this.$Message.error(this.$t('inbox.commentFailTip'));
                            } else {
                                this.$Message.error(this.$t('facebook.inbox.fbComment.commentFail'));
                            }
                        });
                    } else {
                        this.$Message.warning(this.$t('facebook.inbox.fbChat.sendNullTip'));
                        if (event.keyCode == 13) {
                            return false;
                        }
                    }
                }
            },
            // 二级评论
            sendReply(e, id, index, msg) {
                if (e && e.type === 'keyup') {
                    if (e.keyCode === 13) {
                        e.returnValue = false;
                    }
                }
                if (!this.sendLoading1) { // 不是正在发送中
                    if (msg.replace(/(^\s*)|(\s*$)/g, '') !== '') { // 发送内容不为空和空格
                        this.sendLoading1 = true;
                        util.ajaxInternational({
                            url: '/social/comments',
                            method: 'post',
                            data: {
                                id: id,
                                accessToken: this.pageAccessToken,
                                message: msg
                            }
                        }).then(async response => {
                            this.sendLoading1 = false;
                            if (response.data.code === '1') {
                                this.$Message.success(this.$t('facebook.inbox.fbComment.commentSucc'));
                                this.commentListTmp[index].replyModelShow = false;
                                if (this.commentListTmp[index].comments) {
                                    this.commentListTmp[index].comments.data.push({
                                        commentatorAvatar: this.pageAvatar,
                                        created_time: response.data.data.commentsTime,
                                        from: {
                                            name: this.post.from.name,
                                            id: this.post.from.id,
                                            picture: this.pageAvatar
                                        },
                                        id: response.data.data.id,
                                        message: msg,
                                        secReplyModelShow: false
                                    });
                                } else {
                                    this.commentListTmp[index].comments = {
                                        data: []
                                    };
                                    this.commentListTmp[index].comments.data.push({
                                        commentatorAvatar: this.pageAvatar,
                                        created_time: new Date(),
                                        from: {
                                            name: this.post.from.name,
                                            id: response.data.data.id
                                        },
                                        id: response.data.data.id,
                                        message: msg,
                                        secReplyModelShow: false
                                    });
                                }
                                this.$set(this.commentListTmp[index], 'replyMessage', '');
                            } else if (response.data.code === '2') {
                                this.$Message.error(this.$t('inbox.commentFailTip'));
                            } else {
                                this.$Message.error(this.$t('facebook.inbox.fbComment.commentFail'));
                            }
                        });
                    } else {
                        this.$Message.warning(this.$t('facebook.inbox.fbChat.sendNullTip'));
                        if (event.keyCode == 13) {
                            return false;
                        }
                    }
                }
            },
            // 翻译
            translate(type, index) {
                let translateMsg = '';
                if (type) {
                    this.translateLoading2 = true;
                    translateMsg = this.inputMessage;
                } else {
                    this.translateLoading1 = true;
                    translateMsg = this.commentListTmp[index].replyMessage;
                }

                util.ajaxInternational({
                    url: '/translation/translation',
                    method: 'post',
                    data: {
                        requestText: translateMsg,
                        targetLang: this.language
                    }
                }).then(response => {
                    const translatedText = response.data.data.translations[0].translatedText;
                    if (type) {
                        this.translateLoading2 = false;
                        this.inputMessage = translatedText;
                    } else {
                        this.translateLoading1 = false;
                        this.$set(this.commentListTmp[index], 'replyMessage', translatedText);
                    }
                });
            },
            // 展开话术
            handleShortcutsShow() {
                this.$emit('letShortcutsShow', true);
            },
            // 更新状态
            handleStatusUpdate(status) {
                if (this.commentAndPost.clue_status === status) {
                    return;
                }
                const statusObj = this.statusOptions.find(item => item.value === status);
                statusObj && this.$confirm(
                    // `${this.$t('visitor_history.confirm_to')}${statusObj.label}`,
                    `${this.$t('visitor_history.confirm_to')}facebook评论${this.$t('visitor_history.set')}【${statusObj.label}】?`,
                    this.$t('visitor_history.confirm_change'),
                    {
                        showClose: true
                    }
                ).then(() => {
                    util.ajaxInternational({
                        url: '/social/updateCommentStatusById',
                        method: 'get',
                        params: {
                            id: this.commentAndPost.id,
                            status: status
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.$emit('updateCommentStatus', status);
                            // this.$Message.success(this.$t('facebook.editSuccess'));
                            switch (status) {
                                case 1:
                                    this.$Message.success(`facebook评论${this.$t('visitor_history.reset_success')}`);
                                    break;
                                // case '2':
                                //     break;
                                case 2:
                                    this.$Message.success(`facebook评论${this.$t('visitor_history.trash_success')}`);
                                    break;
                            }
                        } else {
                            this.$Message.error(response.data.message);
                        }
                    });
                });
            },
            // 录入线索成功后改变录线索状态
            updateCommentClueStatus(clueId, status) {
                util.ajaxInternational({
                    url: '/social/updateCommentClueStatusById',
                    method: 'get',
                    params: {
                        id: this.commentAndPost.id,
                        orgId: this.enterpriseId,
                        commentatorName: this.commentatorName,
                        postCreaterName: this.post.from.name,
                        postContent: this.post.message,
                        postTime: this.$options.filters.timeFormat(this.post.created_time, 'DateTime'),
                        status: status,
                        clueId: clueId,
                        pageId: this.commentAndPost.page_id,
                        userId: this.userId,
                        postId: this.commentAndPost.post_id,
                        commentId: this.currentCommentId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$emit('updateCommentClueStatus', status);
                    }
                });
            },
            /********************************
             ************* 录入线索相关********
             *********************************/
            enterClue() {
                this.getSaleList();
                this.getClueOption();
                this.clueModal = true;
            },
            on_cancle_clue(data) {
                this.clueModal = data.close;
            },
            // 评论录成线索后更新状态
            updateStatus(clueId, status) {
                this.clueModal = false;
                // console.log('录入成功改变状态', clueId, status);
                this.clueId = clueId;
                // this.$emit('get_cor_inquiry');
                // this.$emit('getCompanyIdByClueId');
                // 更新录线索状态和标记状态
                this.updateCommentClueStatus(clueId, status);
            },
            // 更新到询盘状态
            updateInquiryStatus(clueId, status) {
                this.clueModal = false;
                // console.log('录入成功改变状态', clueId, status);
                this.clueId = clueId;
                this.$emit('get_cor_inquiry');
                this.$emit('getCompanyIdByClueId');
                this.editInquiryStatus(status, clueId);
            },
            editInquiryStatus(status, clueId) {
                util.ajaxInternational({
                    url: '/social/updateCommentStatusByClueId',
                    method: 'get',
                    params: {
                        clueId: clueId,
                        status: status
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$emit('updateCommentStatus', status);
                    }
                });
            },
            // 获取线索字段
            getClueOption() {
                this.templateList = [];
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const showList = response.data.data.show;
                        for (const key in showList) {
                            const obj = showList[key];
                            obj.key = key;
                            obj.required = showList[key].isNeed !== 0;
                            this.templateList.push(obj);
                        }
                        this.templateId = response.data.data.template.id;
                        this.json_data = {
                            templateId: this.templateId,
                            source: FACEBOOK_COMMENT,
                            enterpriseId: this.enterpriseId,
                            userId: this.userId,
                            userName: this.userName,
                            visitorId: `FPL${this.commentAndPost.commentorAndPostId}`,
                            id: this.commentAndPost.id
                        };
                    }
                });
            },
            // 请求销售列表
            getSaleList() {
                this.saleList = [];
                util.ajax({
                    url: '/cuss-login/getSaleUserList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.saleList = response.data.data;
                        this.saleList.push({
                            id: -1,
                            fullname: this.$t('chat.highSeas')
                        });
                    }
                });
            },
            // 在最下方输入框中图片评论成功
            handleUploadSuccess(res, file) {
                const uploadFileLink = this.qiniuHttp + res.key;
                let uploadFileType = 'FILE';
                const type = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
                if (type === '.jpg' || type === '.jpeg' || type === '.png') {
                    uploadFileType = 'IMAGE';
                } else if (type === '.mp3' || type === '.wma') {
                    uploadFileType = 'AUDIO';
                } else if (type === '.mp4' || type === '.rmvb' || type === '.avi' || type === '.ts') {
                    uploadFileType = 'VIDEO';
                }
                this.sendLoading = true;
                util.ajaxInternational({
                    url: '/social/comments',
                    method: 'post',
                    data: {
                        id: this.post.id,
                        accessToken: this.pageAccessToken,
                        message: '',
                        pictureUrl: uploadFileLink
                    }
                }).then(async response => {
                    this.sendLoading = false;
                    if (response.data.code === '1') {
                        this.commentListTmp.push({
                            comments: {
                                data: []
                            },
                            created_time: response.data.data.commentsTime,
                            commentatorAvatar: this.pageAvatar,
                            from: {
                                name: this.post.from.name,
                                id: this.post.from.id,
                                picture: this.pageAvatar
                            },
                            id: response.data.data.id,
                            message: '',
                            replyModelShow: false,
                            attachment: {
                                media: {
                                    image: {
                                        src: uploadFileLink
                                    }
                                }
                            }
                        });
                        this.$Message.success(this.$t('facebook.inbox.fbComment.commentSucc'));
                    } else if (response.data.code === '2') {
                        this.$Message.error(this.$t('inbox.commentFailTip'));
                    } else {
                        this.$Message.error(this.$t('facebook.inbox.fbComment.commentFail'));
                    }
                });
            },
            // 在评论详情区域评论时上传图片成功
            handleSecUploadSuccess(res, file) {
                const secuploadFileLink = this.qiniuHttp + res.key;
                let secuploadFileType = 'FILE';
                const type = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
                if (type === '.jpg' || type === '.jpeg' || type === '.png') {
                    secuploadFileType = 'IMAGE';
                } else if (type === '.mp3' || type === '.wma') {
                    secuploadFileType = 'AUDIO';
                } else if (type === '.mp4' || type === '.rmvb' || type === '.avi' || type === '.ts') {
                    secuploadFileType = 'VIDEO';
                }
                this.sendLoading1 = true;
                util.ajaxInternational({
                    url: '/social/comments',
                    method: 'post',
                    data: {
                        id: this.currentId,
                        accessToken: this.pageAccessToken,
                        message: '',
                        pictureUrl: secuploadFileLink
                    }
                }).then(async response => {
                    this.sendLoading1 = false;
                    if (response.data.code === '1') {
                        if (this.commentListTmp[this.currentIndex].comments) {
                            this.commentListTmp[this.currentIndex].comments.data.push({
                                commentatorAvatar: this.pageAvatar,
                                created_time: response.data.data.commentsTime,
                                from: {
                                    name: this.post.from.name,
                                    id: this.post.from.id,
                                    picture: this.pageAvatar
                                },
                                id: response.data.data.id,
                                message: '',
                                secReplyModelShow: false,
                                attachment: {
                                    media: {
                                        image: {
                                            src: secuploadFileLink
                                        }
                                    }
                                }
                            });
                        } else {
                            this.commentListTmp[this.currentIndex].comments = {
                                data: []
                            };
                            this.commentListTmp[this.currentIndex].comments.data.push({
                                commentatorAvatar: this.pageAvatar,
                                created_time: new Date(),
                                from: {
                                    name: this.post.from.name,
                                    id: response.data.data.id
                                },
                                id: response.data.data.id,
                                message: '',
                                secReplyModelShow: false,
                                attachment: {
                                    media: {
                                        image: {
                                            src: secuploadFileLink
                                        }
                                    }
                                }
                            });
                        }
                        this.$Message.success(this.$t('facebook.inbox.fbComment.commentSucc'));
                    } else if (response.data.code === '2') {
                        this.$Message.error(this.$t('inbox.commentFailTip'));
                    } else {
                        this.$Message.error(this.$t('facebook.inbox.fbComment.commentFail'));
                    }
                });
            }
        },
        created() {

        },
        watch: {
            comments(val) {
                this.commentListTmp = val.concat();
            },
            post(val) {
                if (val.attachments) {
                    this.attachments = val.attachments.data[0];
                }
                if (val.type === 'link') {
                    if (this.attachments.type === 'multi_share_no_end_card') {
                        this.subattachments = this.attachments.subattachments.data;
                    }
                }
            },
            selectShortcuts(val) {
                this.inputMessage = val.name;
            },
            websocketComment(value) {
                // 将评论列表页通过websocket推送的头像取出
                let websocketPicture = '';
                if (localStorage.getItem('websocketPicture') !== null) {
                    websocketPicture = localStorage.getItem('websocketPicture');
                } else {
                    websocketPicture = '';
                }
                // 当有新评论时，移除现有标黄样式
                const newCommentDom = document.querySelector('.new-comment');
                const currentCommentDom = document.querySelector('.current-comment');
                if (newCommentDom !== null) {
                    newCommentDom.classList.remove('new-comment');
                }
                if (currentCommentDom !== null) {
                    currentCommentDom.classList.remove('current-comment');
                }
                if (value.postParentId === this.post.id) {
                    // 一级评论(按时间倒序显示)
                    this.commentListTmp.unshift({
                        comments: {
                            data: []
                        },
                        created_time: value.messageTime,
                        commentatorAvatar: value.fromAvatar,
                        from: {
                            name: value.fromName,
                            id: value.fromId,
                            picture: websocketPicture
                        },
                        id: value.messageId,
                        message: value.messageText,
                        replyModelShow: false,
                        class: 'new-comment'
                    });
                } else {
                    // 二级评论
                    this.commentListTmp.forEach(item => {
                        if (value.postParentId === item.id) {
                            item.comments.data.push({
                                commentatorAvatar: value.fromAvatar,
                                created_time: value.messageTime,
                                from: {
                                    name: value.fromName,
                                    id: value.fromId,
                                    picture: websocketPicture
                                },
                                id: value.messageId,
                                message: value.messageText,
                                secReplyModelShow: false,
                                class: 'new-comment'
                            });
                        }
                    });
                }
                // 清空localStorage
                localStorage.removeItem('websocketPicture');
            },
            clue_id: {
                handler() {
                    this.clueId = this.clue_id;
                },
                immediate: true
            },
            inquiry_id: {
                handler() {
                    this.inquiryId = this.inquiry_id;
                },
                immediate: true
            },
            clueId() {
                this.$emit('updateClueId', this.clueId);
            },
            commentVerbalInfo() {
                // console.log(this.commentVerbalInfo);
                if (this.commentVerbalInfo.length) {
                    this.changeInputMsg(this.commentVerbalInfo[this.commentVerbalInfo.length - 1]);
                }
            },
            commentSecondVerbalInfo() {
                // console.log(this.commentSecondVerbalInfo);
                if (this.commentSecondVerbalInfo.length) {
                    this.changeCommentInputMsg(this.commentSecondVerbalInfo[this.commentSecondVerbalInfo.length - 1]);
                }
            }
        }
    };
</script>
<style lang="less">
    .post-detail{
        display: -webkit-flex;
        display: flex;
        flex-direction: column;
        .post-detail-header{
            height: 53px;
            line-height: 53px;
            border-bottom: 1px solid #E8E8E8;
            padding: 0 10px;
            .post-detail-header-name{
                // width: 50%;
                float: left;
                color: #495060;
                font-size: 15px;
                font-weight: 700;
            }
            .post-detail-header-status{
                font-size:12px;
                // display: inline-block;
                // width: 50%;
                float: right;
                text-align: right;
                .ivu-dropdown-menu{
                    text-align: left;
                }
                .ivu-dropdown-item-selected{
                    color: #495060;
                    background: #F5F5F5;
                }
            }
        }
        .post-detail-body{
            position: relative;
            flex: 1;
            overflow-x: hidden;
            overflow-y: auto;
            padding: 10px;
            &::-webkit-scrollbar{
                width: 4px;
            }
            .post-detail-body-content{
                width: 80%;
                padding: 10px;
                margin: 10px auto;
                .price-btn{
                    border:1px solid #dddee1;
                    border-radius:4px;
                    padding:6px 15px;
                    display: inline-block;
                    position: absolute;
                    right: 20px;
                    top: 50%;
                    margin-top: -17px;
                }
            }
            .post-detail-body-comments{
                padding: 10px;
                border-top: 1px solid #E8E8E8;
                .post-comments-from{
                    color: #4267b2;
                    font-weight: 700;
                    padding: 0 4px;
                }
                .current-comment{
                    color: #FA8241;
                    font-weight: 700;
                }
                .new-comment{
                    color: #FA8241;
                    font-weight: 700;
                }
                .opera-area{
                    padding: 0 40px;
                    color: #4267b2;
                    span{
                        cursor: pointer;
                        padding: 0 4px;
                    }
                }
                .reply-input-area{
                    margin:10px 40px;
                }
            }
        }
        .post-detail-footer{
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #E8E8E8;
        }
        .input-box{
            padding: 10px;
            .ivu-input{
                border: none;
                box-shadow: none;
                -webkit-box-shadow: none;
                padding: 0;
                margin-bottom: 10px;
            }
            .input-box-footer-left{
                display: inline-block;
                width: 50%;
            }
            .input-box-footer-right{
                display: inline-block;
                width: 50%;
                text-align: right;
            }
        }
    }
</style>
