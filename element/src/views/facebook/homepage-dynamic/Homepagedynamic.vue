<template>
    <div class="fb-page-dynamic">
        <Row>
            <!-- 左侧主页列表 -->
            <Col :span="5" class="fb-page-list" :style="{height:content_height}">
                <Menu
                        ref="brandPageMenu"
                        :default-active="currentBrandPageId"
                        width="auto"
                        @select="handlePageSelect"
                >
                    <MenuItem v-for="brandPage in allPageList"
                              :key="brandPage.userId"
                              :index="brandPage.userId">
                        <!-- 检测token是否失效,1-有效 2-失效 -->
                        <Row style="width:100%">
                            <Col :span="3">
                                <span style="position: relative;vertical-align: middle;display: inline-block;top: -2px;">
                                    <Avatar :src="brandPage.avatar"
                                            :size="38"
                                            shape="circle"/>
                                    <svg
                                        class="svg-icon company-page-icon"
                                        aria-hidden="true"
                                        v-if="brandPage.homePageType===1">
                                        <use xlink:href="#custom-facebook-company-page"/>
                                    </svg>
                                </span>
                            </Col>
                            <Col :span="14" :offset="2">
                                <span v-if='brandPage.userName.length < 11' class="brand-page-name">{{brandPage.userName}}</span>
                                <Tooltip :content="brandPage.userName" transfer v-else style="display:inline-block" class="brand-page-name">
                                    <span style="font-size: 12px;">{{brandPage.userName}}</span>
                                </Tooltip>
                            </Col>
                            <Col :span="2" :offset="2" style="padding-top:2px">
                                <span v-show="brandPage.access_status!==1" class="invalid-tip" >{{$t('facebook.onekeyRelease.creatContent.invalid')}}</span>
                            </Col>
                        </Row>
                    </MenuItem>
                </Menu>
                <div style="padding:20px;">
                    <Button type="primary" long @click="addAccount" class="add-page-button">
                        <Icon custom="custom custom-add" size="12"/>
                        {{$t('facebook.homepagedynamic.addAccount')}}
                    </Button>
                </div>
            </Col>
            <!-- 中间帖子详情 -->
            <Col :span="13" :style="{height:content_height}">
                <div class="page-post-content-body">
                    <!-- 无数据展示 -->
                    <div v-if="isData" class="empty-content">
                        <img src="../../../svg/no-data.svg" alt/>
                        <p
                                style="font-size:12px;color:rgb(0,0,0,.4);margin-top:12px;"
                        >{{$t('facebook.homepagedynamic.noData')}}</p>
                    </div>
                    <Scroll
                        :on-reach-bottom="handleReachBottom"
                        :height="parseInt(content_height)"
                        :distance-to-edge="10"
                        v-else
                    >
                    <!-- <div v-else :style="{height:content_height,'overflow':'auto'}" v-infinite-scroll="handleReachBottom" :infinite-scroll-distance="10"> -->
                        <div class="page-post-content-item" v-for="(post,postindex) in posts" :key="postindex" >
                            <!-- 帖子头部主页信息 -->
                            <div class="post-content-author">
                                <span>{{accountName}}</span>
                                <span style="padding-left:12px;">{{post.created_time | timeFormat("DateTime")}}</span>
                            </div>
                            <!-- 帖子详情 -->
                            <div class="post-content-info">
                                <div v-if="post.message">
                                    <p
                                            v-for="(item,index) in post.message.split('\n')" :key="index"
                                            v-html="getUrlFromPostContent(item)"
                                    >{{item}}</p>
                                </div>
                                <div v-else-if="post.description">
                                    <p
                                            v-for="(item,index) in post.description.split('\n')" :key="index"
                                            v-html="getUrlFromPostContent(item)"
                                    >{{item}}</p>
                                </div>
                                <div v-show="post.picture">
                                    <img
                                            v-for="(pictureUrl, index) in post.picture"
                                            v-if="pictureUrl"
                                            :src="pictureUrl"
                                            :key="index"
                                            style="height: 150px;margin-right: 5px;"
                                    />
                                </div>
                            </div>
                            <!-- 评论、点赞、分享 -->
                            <div class="post-content-operate">
                                <div
                                    style="display:inline-block;margin-right:18px;vertical-align: middle;cursor:pointer;"
                                    @click="selectAct(post.id,post.link, post.permalink_url, 0)">
                                        <Icon custom="custom custom-facebook-comment" size="12"></Icon>
                                        <span>{{$t('facebook.homepagedynamic.comment')}}</span>
                                        <span v-if="post.comments">{{post.comments.summary.total_count}}</span>
                                        <span v-else>0</span>
                                </div>
                                <Tooltip placement="top" style="margin-right:18px;">
                                    <span>
                                        <Icon custom="custom custom-facebook-like" size="12"></Icon>
                                        <span>{{$t('facebook.homepagedynamic.like')}}</span>
                                        <span v-if="post.likes">{{post.likes.summary.total_count}}</span>
                                        <span v-else>0</span>
                                    </span>
                                    <div slot="content">
                                        <div
                                                class="homepage_manage_like"
                                                @click="selectAct(post.id,post.link, post.permalink_url, 1)"
                                        >{{$t('facebook.homepagedynamic.like')}}
                                        </div>
                                        <div
                                                class="homepage_manage_likeList"
                                                @click="getCommentLikes(post.id)"
                                        >{{$t('facebook.homepagedynamic.checkLike')}}
                                        </div>
                                    </div>
                                </Tooltip>
                                <span
                                    style="display:inline-block;margin-right:18px;vertical-align: middle;cursor:pointer;"
                                    class="homepage_manage_share"
                                    @click="selectAct(post.id,post.link, post.permalink_url,2, post.message, post.description)">
                                    <Icon custom="custom custom-facebook-share" size="12"></Icon>
                                    <span>{{$t('facebook.homepagedynamic.share')}}</span>
                                    <span v-if="post.shares">{{post.shares.count}}</span>
                                    <span v-else>0</span>
                                </span>
                                <!-- 因fb api升级，查看分享列表接口，所以去掉该功能 -->
                                <!-- <Tooltip placement="top">
                                   <span>
                                        <Icon custom="custom custom-facebook-share" size="12"></Icon>
                                        <span>{{$t('facebook.homepagedynamic.share')}}</span>
                                        <span v-if="post.shares">{{post.shares.count}}</span>
                                        <span v-else>0</span>
                                   </span>
                                    <div slot="content">
                                        <div
                                                class="homepage_manage_share"
                                                v-show="type"
                                                @click="selectAct(post.id,post.link, post.permalink_url,2, post.message, post.description)"
                                        >{{$t('facebook.homepagedynamic.shareAccount')}}
                                        </div>
                                        <div
                                                class="homepage_manage_shareList"
                                                @click="getCommentShares(post.id)"
                                        >{{$t('facebook.homepagedynamic.checkShare')}}
                                        </div>
                                    </div>
                                </Tooltip> -->
                            </div>
                        </div>
                    <!-- </div> -->
                    </Scroll>
                    <Spin fix v-if="postSpinShow"></Spin>
                </div>
            </Col>
            <!-- 右侧账号信息 -->
            <Col :span="6" :style="{height:content_height}">
                <div class="fb-page-info">
                    <div class="fb-page-info-title">{{$t('facebook.homepagedynamic.accountInfo')}}</div>
                    <div v-if="isDetail" style="text-align:center;">
                        <img src="../../../svg/no-data.svg" alt style="margin-top:60px;width: 100%;"/>
                        <p
                                style="font-size:12px;color:rgb(0,0,0,.4);margin-top:12px;"
                        >{{$t('facebook.homepagedynamic.noData')}}</p>
                    </div>
                    <div v-else class="fb-page-info-content">
                        <div class="page-info-avatar">
                            <Avatar :src="accountInfo.avator" size="large"/>
                            <svg
                                    class="svg-icon company-page-icon"
                                    aria-hidden="true"
                                    v-if="accountInfo.homePageType==='1'"
                            >
                                <use xlink:href="#custom-facebook-company-page"/>
                            </svg>
                        </div>
                        <p class="page-info-name">{{accountInfo.name | filterName}}</p>
                        <p class="page-info-fans">
                            {{$t('facebook.homepagedynamic.liked')}}
                            <span>{{accountInfo.fans}}</span>
                        </p>
                        <p class="page-info-link">
                            {{$t('facebook.homepagedynamic.link')}}
                            <a
                                class="header-source"
                                :href="accountInfo.link"
                                target="_blank">
                                    {{accountInfo.link}}
                            </a>
                        </p>
                        <Spin fix v-if="detailSpinShow"></Spin>
                    </div>
                </div>
            </Col>
        </Row>

        <!-- 评论详情模态框 -->
        <Modal
            :visible.sync="modal3"
            :modal-append-to-body="false"
            width="790px"
            class="post-detail-modal"
            @open="changeTextarea(true)"
            @close="changeTextarea(false)">
                <p slot="title">{{$t('facebook.homepagedynamic.comment')}}</p>
                <!-- <CommentArea v-show="type"></CommentArea> -->
                <CommentArea
                    v-if="type"
                    :isModalShow="modal3"
                    :styles="'width: 750px'"
                    :rows="3"
                    :commentIndex="1"
                    ref="commentArea"
                    @submitComments="submitComments">
                </CommentArea>
                <div>
                    <div class="comment-tips">
                        {{$t('facebook.homepagedynamic.otherComment')}}
                        <span
                                style="margin-left: 5px;cursor: pointer;"
                                @click="goToComments()"
                        >
                            <Icon type="ios-loop-strong" size="16"></Icon>
                        </span>
                    </div>
                    <div class="comment-div">
                        <div v-for="(comment,index) in totalComments" :key="index">
                            <div v-if="comment.from" style="margin: 15px 0 8px 0;" :style="(!comment.message && comment.attachment)? 'display:block':'display:flex'">
                                <Avatar :src="comment.from.picture.data.url"/>
                                <span
                                    style="padding:10px 0 0 8px;color:#4267b2;flex:1"
                                    :title="comment.from.name"
                                    class="comment-name">
                                        {{comment.from.name}}
                                </span>
                                <span style="display: block;padding-left: 48px;" v-if="!comment.message && comment.attachment" >
                                    <img
                                        :src=" comment.attachment.media.image.src"
                                        style="height: 150px;margin-right: 5px;"/>
                                </span>
                                <span style="margin:10px 8px 0 0;flex:8" v-else>{{comment.message}}</span>
                            </div>
                            <div style="cursor:pointer;" class="operation">
                                <!-- 因fb api 升级问题： 去掉点赞功能 -->
                                <!-- <span @click="cmtLikePost(comment.id)">
                                    <Icon custom="custom custom-facebook-like" size="12"></Icon>
                                    <span class="operate-item">{{$t('facebook.homepagedynamic.like')}}</span>
                                    <span class="content-span">{{comment.like_count}}</span>
                                </span> -->
                                <span @click="cmtToComment(comment.id)">
                                    <Icon custom="custom custom-facebook-comment" size="12" style="margin-right:6px;color:#3b78de"></Icon>
                                    <!-- <span class="operate-item">{{$t('facebook.homepagedynamic.comment')}}</span> -->
                                    <span class="operate-item">{{$t('facebook.homepagedynamic.reply')}}</span>
                                    <span class="content-span">{{comment.comment_count}}</span>
                                </span>
                                ·
                                <span style="color:#979797;margin:0px 10px 0 5px">{{comment.created_time  | timeFormat("DateTime")}}</span>
                                <span @click="showCommentData(index, comment)" v-if="comment.comment_count">
                                    <!-- <Icon type="navicon" size="16"></Icon> -->
                                    <span class="operate-item" v-if="comment.isShowCommentData">{{$t('facebook.homepagedynamic.PutAwayReply')}}</span>
                                    <span class="operate-item" v-else>{{$t('facebook.homepagedynamic.expandReply')}}</span>
                                </span>
                            </div>
                            <!-- <div v-show="type">
                                <div class="sunComment" v-if="isComment && cmtPostId === comment.id">
                                    <Input
                                            type="textarea"
                                            :rows="3"
                                            v-model="reMsg"
                                            class="comment-area"
                                            :maxlength="200"
                                            :placeholder="$t('facebook.homepagedynamic.overMessage')"
                                    ></Input>
                                    <div style="margin:10px 0;display: flex;justify-content: flex-end">
                                        <Button type="primary" plain @click="isComment=!isComment;reMsg=''">{{$t('cancel')}}</Button>
                                        <Button
                                                type="primary"
                                                @click="submitComments(2)"
                                                style="margin-left:8px;"
                                        >{{$t('confirm')}}
                                        </Button>
                                    </div>
                                </div>
                            </div> -->
                            <CommentArea
                                :isModalShow="modal3"
                                v-if="type && isComment && cmtPostId === comment.id"
                                :styles="'width: 700px;margin: 10px 0 0 40px;'"
                                :rows="2"
                                :commentIndex="2"
                                ref="commentArea"
                                @submitComments="submitComments">
                            </CommentArea>
                            <!-- 二级评论 -->
                            <div v-if="comment.comments" v-show="comment.isShowCommentData" style="padding: 15px 10px 0 25px;">
                                <div v-for="(toCmt,index) in comment.comments.data" style="padding: 8px 0" :key="index">
                                    <div v-if="toCmt.from" :style="(!toCmt.message && toCmt.attachment)? 'display:block':'display:flex'">
                                        <Avatar :src="toCmt.from.picture.data.url"/>
                                        <span style="padding:10px 0 0 8px;flex:1" :title="toCmt.from.name">{{toCmt.from.name}}</span>
                                        <span style="display: block;padding-left: 48px;" v-if="!toCmt.message && toCmt.attachment" >
                                            <img
                                                :src="toCmt.attachment.media.image.src"
                                                style="height: 150px;margin-right: 5px;"/>
                                        </span>
                                        <span style="margin:10px 8px 0 0;flex:8" v-else>{{toCmt.message}}</span>
                                        <!-- <span style="color: rgb(151, 151, 151);font-size: 12px;">{{toCmt.from.created_time | timeFormat("DateTime")}}</span> -->
                                    </div>
                                    <div style="cursor:pointer;" class="operation">
                                        <span @click="cmtToComment(toCmt.id)">
                                            <Icon custom="custom custom-facebook-comment" size="12" style="margin-right:6px;color:#3b78de"></Icon>
                                            <span class="operate-item">{{$t('facebook.homepagedynamic.reply')}}</span>
                                        </span>
                                        ·
                                        <span style="color:#979797;margin:0px 10px 0 5px">{{toCmt.created_time  | timeFormat("DateTime")}}</span>
                                    </div>
                                    <!-- 因fb api 升级问题： 去掉点赞功能 -->
                                    <!-- <div style="cursor:pointer;">
                                        <span @click="cmtLikePost_second(toCmt.id)">
                                            <Icon custom="custom custom-facebook-like" size="12"></Icon>
                                            <span class="operate-item">{{$t('facebook.homepagedynamic.like')}}</span>
                                            <span class="content-span">{{toCmt.like_count}}</span>
                                        </span>
                                    </div> -->
                                    <!-- <CommentArea v-show="type" :width="400"></CommentArea> -->
                                    <CommentArea
                                        v-if="type && isComment && cmtPostId === toCmt.id"
                                        :isModalShow="modal3"
                                        :styles="'width: 650px;margin: 10px 0 0 50px;'"
                                        :rows="2"
                                        :commentIndex="2"
                                        ref="commentArea"
                                        @submitComments="submitComments">
                                    </CommentArea>
                                    <!-- <div v-show="type">
                                        <div class="sunComment" v-show="isComment && cmtPostId === toCmt.id">
                                            <Input
                                                    type="textarea"
                                                    :rows="3"
                                                    v-model="reMsg"
                                                    class="comment-area"
                                                    :maxlength="200"
                                                    :placeholder="$t('facebook.homepagedynamic.overMessage')"
                                            ></Input>
                                            <div style="margin:10px 0;display: flex;justify-content: flex-end">
                                                <Button type="primary" plain @click="isComment=!isComment;">
                                                    {{$t('cancel')}}
                                                </Button>
                                                <Button
                                                        class="homepage_manage_commentSubmit"
                                                        type="primary"
                                                        @click="submitComments(2)"
                                                        style="margin-left:8px;"
                                                        :disabled="confirmFlag"
                                                >{{$t('confirm')}}
                                                </Button>
                                            </div>
                                        </div>
                                    </div> -->
                                </div>
                            </div>
                        </div>
                        <Spin size="large" fix v-if="commentSpinShow"></Spin>
                    </div>
                </div>
                <div slot="footer"></div>
                <Spin size="large" fix v-if="submitSpinShow"></Spin>
        </Modal>
        <!-- 选择账号模态框 -->
        <Modal :visible.sync="modal4" :modal-append-to-body="false" class="homepage-dynamic-select-account" width="520px">
            <p slot="title">{{$t('facebook.homepagedynamic.selectAccount')}}</p>
            <div v-show="operateType==2" style="margin-bottom: 10px">
                <Icon type="social-facebook" size="20" color="#1c2438"></Icon>
                Facebook
                <RadioGroup v-model="shareType">
                    <Radio :label="$t('facebook.homepagedynamic.public')"></Radio>
                    <Radio :label="$t('facebook.homepagedynamic.friend')"></Radio>
                    <Radio :label="$t('facebook.homepagedynamic.own')"></Radio>
                </RadioGroup>
            </div>
            <Table
                v-if="tempAccount && tempAccount.length"
                ref="selectionADdAccount"
                :show-header=false
                height="350"
                :data="tempAccount"
                class="comment-account-list">
                    <TableColumn width="50">
                        <template slot-scope="scope">
                            <Radio
                                v-model="isActive"
                                :disabled="scope.row.access_status !== 1"
                                :label="scope.$index"
                                @change="getAccessToken(scope.row.accessToken,scope.row.userId,scope.$index,scope.row.access_status)">{{''}}</Radio>
                        </template>
                    </TableColumn>
                    <TableColumn width="80">
                        <template slot-scope="scope">
                            <Avatar :src="scope.row.avatar"/>
                        </template>
                    </TableColumn>
                    <TableColumn prop="userName"></TableColumn>
                    <TableColumn width="80">
                        <template slot-scope="scope">
                            <span class="invalid-tip">{{scope.row.access_status === 1? '': $t('facebook.onekeyRelease.creatContent.invalid')}}</span>
                        </template>
                    </TableColumn>
            </Table>
            <div v-else>
                当前无有效主页可选
            </div>
            <!-- <div class="comment-account-list" style="max-height: 400px;overflow-y: auto">
                <div
                        class="comment-account-item"
                        v-for="(account,index) in tempAccount"
                        :class="{ active: isActive==index }"
                        :key="index"
                        @click="getAccessToken(account.accessToken,account.userId,index)"
                >
                    <Avatar :src="account.avatar"/>
                    <span style="padding:0 4px;" :title="account.userName">{{account.userName | filterName}}</span>
                </div>
            </div> -->
            <div slot="footer">
                <Button @click="cancel">{{$t('cancel')}}</Button>
                <Button v-if="!tempAccount.length" type="primary" @click="goToBind">{{$t('facebook.inbox.gotoBind')}}</Button>
                <Button
                    v-else-if="operateType==0"
                    type="primary"
                    @click="goToComments()"
                    id="piwik_goToComments"
                    :disabled="confirmFlag"
                >{{$t('confirm')}}
                </Button>
                <Button
                        v-else-if="operateType==1"
                        type="primary"
                        @click="likePost"
                        id="piwik_likePost"
                        :disabled="confirmFlag"
                >{{$t('confirm')}}
                </Button>
                <Button
                        v-else-if="operateType==2"
                        type="primary"
                        @click="sharePost"
                        :disabled="confirmFlag"
                >{{$t('facebook.homepagedynamic.share')}}
                </Button>
            </div>
        </Modal>
        <!-- 查看列表模态框 -->
        <Modal :visible.sync="modal5" :modal-append-to-body="false" width="520px">
            <p slot="title">{{$t('facebook.homepagedynamic.checkList')}}</p>
            <div class="comment-data-list" style="max-height: 500px;overflow-y: auto">
                <!--查看点赞列表 -->
                <div v-if="listType==0">
                    <Scroll :on-reach-bottom="handleReachListBottom">
                    <!-- <div v-infinite-scroll="handleReachListBottom" infinite-scroll-immediate="false" style="overflow:auto;"> -->
                        <div style="padding:8px;" v-for="(like,likeindex) in commentLikes" :key="likeindex">
                            <Avatar :src="like.pic_small"/>
                            <span style="padding:0 4px;" :title="like.name">{{like.name | filterName}}</span>
                        </div>
                    <!-- </div> -->
                    </Scroll>
                </div>
                <!-- 查看分享列表 -->
                <div v-if="listType==1">
                     <Scroll :on-reach-bottom="handleReachShareBottom">
                    <!-- <div v-infinite-scroll="handleReachShareBottom" infinite-scroll-immediate="false" style="overflow:auto;"> -->
                        <div style="padding:8px;" v-for="(share,index) in commentShares" :key="index">
                            <Avatar :src="share.from.picture.data.url"/>
                            <span style="padding:0 4px;"
                                  :title="share.from.name">{{share.from.name | filterName}}</span>
                        </div>
                    <!-- </div> -->
                    </Scroll>
                </div>
            </div>
            <div slot="footer"></div>
        </Modal>
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
    import $ from '@/libs/util';
    import './css/homepage.less';
    import { mapState, mapGetters } from 'vuex';
    import CommentArea from './CommentArea';

    export default {
        name: 'page',
        components: {
            CommentArea
        },
        props: {
            content_height: {
                type: String,
                default: '800px'
            }
        },
        data() {
            return {

                // 主页失效提醒
                tokenModal: false,
                canGoToBind: false,
                // 增加currentPageId
                currentPageId: '',
                count: 0,
                brandPageList: [],
                companyPageList: [],
                allPageList: [],
                accounts: [{}],
                accountInfo: [],
                posts: [],
                personalPages: [],
                brandPages: [],
                tempAccount: [],
                social: [],
                events: [],
                totalComments: [],
                commentLikes: [], // 点赞的账号
                commentShares: [], // 分享的账号
                accountName: '',
                currentBrandPage: {},
                currentBrandPageId: '',
                currentBrandPageAvatar: '',
                currentBrandPageName: '',
                currentAccessToken: '', // 当前主页账号的token
                currentAccessId: '', // 当前主页账号的ID
                selectAccessToken: '', // 弹窗选中账号的token
                selectAccessId: '', // 弹窗选中账号的ID
                shareType: this.$t('facebook.homepagedynamic.public'), // 分享的类型
                modal3: false, // 评论
                modal4: false, // 选择评论账号
                modal5: false, // 查看点赞的人
                isComment: false,
                isData: false,
                isEventData: false,
                isShowCommentData: false,
                isDetail: true,
                submitSpinShow: false, // 提交评论loading
                postSpinShow: true,
                eventSpinShow: false,
                detailSpinShow: false,
                commentSpinShow: false, // 加载评论loading
                idType: 'post', // postId的类型
                isActive: '', // 选中哪一列
                theme2: 'light',
                theme1: 'light',
                postPageNo: 1,
                eventPageNo: 1,
                likePageNo: 1,
                sharePageNo: 1,
                pageSize: 10,
                listType: '', // 0点赞列表，1分享列表
                link: '',
                postContent: '',
                value1: '',
                postId: '',
                currentId: '', // 当前查看点赞、分享的ID
                current: '', // 当前展开的评论
                cmtPostId: '',
                message: '',
                reMsg: '', // 评论的评论
                operateType: 0, // 0评论 1点赞 2分享
                type: false, // false个人，true主页
                bindingUserId: '', // 主页所有人userid
                confirmFlag: false // 用户点赞的标记 初始默认为该用户未点过赞
            };
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                enterpriseId: state => state.enterpriseId,
                isFbService: state => state.isFbService,
                menu_list: state => state.app.menu_list
            }),
            ...mapGetters([
                'isContainsMenu'
            ])
        },
        created() {
            this.canGoToBind = this.isContainsMenu('account_binding');
        },
        methods: {

            /**
             * @Date: 2020-06-03 19:31:47
             * @LastEditors: niumkiki
             * @description: 增加失效主页弹窗
             * @param :
             * @return:
             */
            // 确认绑定
            goToBind() {
                this.tokenModal = false;
                if (this.canGoToBind) {
                    window.open('#/systemSettings/facebookBinding/account_binding', '_blank');
                    // this.$router.push({
                    //     name: 'account_binding'
                    // });
                } else {
                    this.$Message.warning(this.$t('inbox.tip'));
                }
                this.modal4 = false;
            },
            cancelBind() {
                this.tokenModal = false;
            },
            // 选中主页
            handlePageSelect(name) {
                this.currentBrandPageId = name;
                this.brandPages.forEach(brand => {
                    if (
                        brand.userId === name &&
                        brand.accessToken !== this.currentAccessToken
                    ) {
                        console.log('handlePageSelect', name, brand);
                        if (brand.access_status === 1) {
                            /* 当切换至其他主页时初始化pageNo为1，并且重新请求posts数据 */
                            this.postPageNo = 1;
                            this.accountDetail(
                                brand.userId,
                                brand.accessToken,
                                brand.userName,
                                1,
                                brand.bindingUserId
                            );
                        } else {
                            this.tokenModal = true;
                            this.isData = true;
                            this.isDetail = true;
                        }

                        this.currentPageId = brand.provider_user_id;
                    }
                });
            },
            addAccount() {
                if (this.canGoToBind) {
                    // 如果当前权限目录中有账号绑定, 则跳转到账号绑定
                    this.$router.push({
                        name: 'account_binding'
                    });
                } else {
                    // 否则弹出无权限提示
                    this.$Message.warning(this.$t('noAuthorityPath1') + this.$t('menu.account_binding') + this.$t('noAuthorityPath2'));
                }
            },
            cancel() {
                this.modal3 = false;
                this.modal4 = false;
                this.message = '';
            },
            handleReachBottom() {
                this.postPageNo += 1;
                const _this = this;
                return new Promise(resolve => {
                    _this.getPostInfo(_this.currentAccessId);
                });
            },
            handleReachListBottom() {
                this.likePageNo += 1;
                return new Promise(resolve => {
                    const id = this.currentId;
                    this.getCommentLikes(id);
                });
            },
            handleReachShareBottom() {
                this.sharePageNo += 1;
                return new Promise(resolve => {
                    const id = this.currentId;
                    this.getCommentShares(id);
                });
            },
            getAccountInfo(id) {
                this.posts = [];
                this.events = [];
                this.getPostInfo(id);
            },
            isShowCmt(index) {
                if (this.isShowCommentData === true && this.current == index) {
                    return true;
                } else {
                    return false;
                }
            },
            showCommentData(index, comment) {
                this.$set(this.totalComments[index], 'isShowCommentData', !comment.isShowCommentData);
                // comment.isShowCommentData = !comment.isShowCommentData;
                // this.current = index;
                // this.isShowCommentData = !this.isShowCommentData;
            },
            getPostInfo(id) {
                const _this = this;
                $.ajaxInternational({
                    url: '/social/getAccountInfo',
                    method: 'post',
                    data: {
                        type: 'posts',
                        pageNo: this.postPageNo,
                        pageSize: this.pageSize,
                        id: id,
                        userId: this.bindingUserId
                    }
                }).then(function(response) {
                    _this.postSpinShow = false;
                    if (response.data.code === '1') {
                        let list = response.data.data.data;
                        list = list.map(item => {
                            let res = {};
                            if (item.picture) {
                                res = _this.getPostsPicturesUrl(item);
                                item.picture = '';
                                return res;
                            } else {
                                return item;
                            }
                        });
                        if (list.length > 0) {
                            _this.posts = _this.posts.concat(list);
                        } else {
                            if (_this.postPageNo == 1) {
                                _this.isData = true;
                            }
                        }
                    } else {
                        if (_this.eventPageNo == 1) {
                            _this.isData = true;
                        }
                    }
                    console.log('_this.posts----------------', _this.posts);
                });
            },
            getPostsPicturesUrl(post) {
                if (post.picture.length > 0) {
                    $.ajaxInternational({
                        url: '/social/getPictureUrl',
                        method: 'post',
                        data: {
                            link: post.picture
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            post.picture = response.data.data;
                        }
                    });
                }
                return post;
            },
            // 将图片url转成base64的接口
            getPostsPicturesUrlhl(post) {
                return new Promise((resolve, reject) => {
                    $.ajaxInternational({
                        url: '/social/getPictureUrl',
                        method: 'post',
                        data: {
                            link: post
                        }
                    })
                        .then(response => {
                            if (response.data.code === '1') {
                                resolve(response.data.data[0]);
                            }
                        });
                });
            },
            getAccountInfoDetail(id, flag) {
                const _this = this;
                $.ajaxInternational({
                    url: '/social/getAccountInfoDetail',
                    method: 'post',
                    data: {
                        id: id,
                        userId: this.bindingUserId,
                        pageType: flag
                    }
                }).then(function(response) {
                    _this.detailSpinShow = false;
                    if (response.data.code === '1') {
                        _this.accountInfo = response.data.data;
                    } else {
                        _this.isDetail = true;
                    }
                });
            },
            getBrandPage() {
                this.postSpinShow = true;
                this.companyPageList = [];
                this.brandPageList = [];
                this.allPageList = [];
                $.ajaxInternational({
                    url: '/social/getBrandPage',
                    method: 'post',
                    data: {
                        userId: this.userId,
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    this.postSpinShow = false;
                    if (response.data.code === '1') {
                        const dataList = response.data.data;
                        this.dealBrandPic(dataList);
                        for (const item of dataList) {
                            if (item.homePageType === 1) {
                                this.companyPageList.push(item);
                            } else {
                                this.brandPageList.push(item);
                            }
                        }
                        this.brandPages = dataList;
                        // if (this.brandPages.length > 0) {
                        //     this.$nextTick(() => {
                        //         this.$refs.brandPageMenu.updateActiveName();
                        //     });
                        // }
                        this.allPageList = this.companyPageList.concat(this.brandPageList);
                        if (this.allPageList.length > 0) {
                            if (this.allPageList[0].access_status === 1) {
                                // token有效才继续请求
                                this.handlePageSelect(this.allPageList[0].userId);
                            } else {
                                this.currentBrandPage = this.allPageList[0];
                                this.currentBrandPageAvatar = this.allPageList[0].avatar;
                                this.currentBrandPageName = this.allPageList[0].userName;
                                this.currentPageId = this.allPageList[0].provider_user_id;
                            }
                        } else {
                            this.isData = true;
                            this.isDetail = true;
                        }
                    }
                });
            },
            // 处理左上角公共主页头像
            async dealBrandPic(dataList) {
                for (let i = 0; i < dataList.length; i++) {
                    const temp = dataList[i];
                    const brandPicture = await this.getPostsPicturesUrlhl(temp.avatar);
                    temp.avatar = brandPicture;
                }
                this.currentBrandPage = this.allPageList[0];
                this.currentBrandPageAvatar = this.allPageList[0].avatar;
                this.currentBrandPageName = this.allPageList[0].userName;
            },
            accountDetail(id, token, name, flag, userId) {
                this.postSpinShow = true;
                this.eventSpinShow = true;
                this.detailSpinShow = true;
                this.isData = false;
                this.isDetail = false;
                this.currentAccessToken = token;
                this.currentAccessId = id;
                this.selectAccessToken = token;
                this.selectAccessId = id;
                this.accountName = name;
                this.bindingUserId = userId;
                if (flag == 1) {
                    // 1是主页，0是个人
                    this.type = true;
                } else {
                    this.type = false;
                }
                this.getAccountInfo(id);
                this.getAccountInfoDetail(id, flag);
            },
            selectAct(id, link, permalinkUrl, flag, message, description) {
                this.idType = 'post';
                this.operateType = flag;
                this.link = link || permalinkUrl;
                this.postContent = message || description;
                if (this.isFbService) {
                    this.tempAccount = this.brandPages;
                } else {
                    this.tempAccount = this.brandPageList;
                }
                const account = this.tempAccount[0];
                this.postId = id;
                this.modal4 = true;
                this.isActive = '';
                // 点开评论弹窗后,需要先获取一下第一条的信息
                this.getAccessToken(account.accessToken, account.userId, 0, account.access_status);
            },
            getAccessToken(token, id, index, accessStatus) {
                console.log('getAccessToken', token, id, index);
                this.isActive = index;
                this.selectAccessToken = token;
                this.selectAccessId = id;
                if (accessStatus !== 1) {
                    this.confirmFlag = true;
                } else {
                    this.confirmFlag = false;
                }
            },
            goToComments() {
                this.isActive = '';
                this.modal4 = false;
                this.modal3 = true;
                this.commentSpinShow = true;
                const token = this.selectAccessToken;
                const id = this.postId;
                $.ajaxInternational({
                    url: '/social/goToComments',
                    method: 'post',
                    data: {
                        id: id,
                        accessToken: token,
                        pageId: this.currentPageId
                    }
                }).then(response => {
                    if (response.data.code === '1' && response.data.data && Array.isArray(response.data.data.data)) {
                        if (response.data.data.data.length) {
                            this.$Message.success(this.$t('facebook.homepagedynamic.loadCommentSucc'));
                        } else {
                            this.$Message.success(this.$t('facebook.homepagedynamic.loadCommentEmpty'));
                        }
                        this.totalComments = response.data.data.data.map(comment => {
                            // 有客户报错没有 from 信息, 给加上兼容处理
                            if (!comment.from) {
                                comment.from = {
                                    name: this.$t('facebook.fbVisitor'),
                                    id: `${comment.id}-haveNoFrom`,
                                    picture: 'http://content.leadscloud.com/2730921213693134.jpg'
                                };
                            }

                            if (comment.comments && Array.isArray(comment.comments.data)) {
                                comment.comments.data.forEach(secComment => {
                                    if (!secComment.from) {
                                        secComment.from = {
                                            name: this.$t('facebook.fbVisitor'),
                                            id: `${secComment.id}-haveNoFrom`,
                                            picture: 'http://content.leadscloud.com/2730921213693134.jpg'
                                        };
                                    }
                                });
                            }

                            return comment;
                        });
                        this.totalComments.forEach((item, index) => {
                            this.$set(this.totalComments[index], 'isShowCommentData', true);
                        });
                    } else {
                        this.$Message.error(this.$t('facebook.homepagedynamic.loadCommentFail'));
                    }
                    this.commentSpinShow = false;
                }).catch(erro => {
                    this.$Message.error(this.$t('facebook.homepagedynamic.loadCommentFail'));
                    this.commentSpinShow = false;
                });
            },
            // 点赞/评论后重新获取评论数据
            goToCommentsNew() {
                this.commentSpinShow = true;
                const tempComments = [];
                //  this.$set(this.totalComments[index], 'isShowCommentData', !comment.isShowCommentData);
                this.totalComments.forEach(item => {
                    if (item.isShowCommentData) {
                        tempComments.push(item.id);
                    }
                });
                console.log(tempComments);
                $.ajaxInternational({
                    url: '/social/goToComments',
                    method: 'post',
                    data: {
                        id: this.postId,
                        accessToken: this.selectAccessToken,
                        pageId: this.currentPageId
                    }
                }).then(res => {
                    if (res.data.code === '1' && res.data.data && Array.isArray(res.data.data.data)) {
                        this.totalComments = res.data.data.data.map(comment => {
                            // 有客户报错没有 from 信息, 给加上兼容处理
                            if (!comment.from) {
                                comment.from = {
                                    name: this.$t('facebook.fbVisitor'),
                                    id: `${comment.id}-haveNoFrom`,
                                    picture: 'http://content.leadscloud.com/2730921213693134.jpg'
                                };
                            }

                            if (comment.comments && Array.isArray(comment.comments.data)) {
                                comment.comments.data.forEach(secComment => {
                                    if (!secComment.from) {
                                        secComment.from = {
                                            name: this.$t('facebook.fbVisitor'),
                                            id: `${secComment.id}-haveNoFrom`,
                                            picture: 'http://content.leadscloud.com/2730921213693134.jpg'
                                        };
                                    }
                                });
                            }

                            return comment;
                        });
                        if (tempComments.length) {
                            this.totalComments.forEach((item, index) => {
                                if (tempComments.includes(item.id)) {
                                    this.$set(this.totalComments[index], 'isShowCommentData', true);
                                }
                            });
                        }
                    } else {
                        this.$Message.error(this.$t('facebook.homepagedynamic.loadCommentFail'));
                    }
                    this.commentSpinShow = false;
                }).catch(erro => {
                    this.$Message.error(this.$t('facebook.homepagedynamic.loadCommentFail'));
                    this.commentSpinShow = false;
                });
            },
            /**
             * @Date: 2020-06-29 16:52:33
             * @LastEditors: niumkiki
             * @description: 迭代优化：回复按钮功能改为---点击显示回复框；再次点击收起回复框
             * @param :
             * @return:
             */
            cmtToComment(id) {
                console.log('cmtToComment', id);
                this.cmtPostId === id ? this.cmtPostId = '' : this.cmtPostId = id;
                this.idType = 'comment';
                this.isComment = true;
                this.reMsg = '';
            },
            cmtLikePost(id) {
                this.idType = 'comment';
                this.cmtPostId = id;
                this.likePostNew(id);
            },
            cmtLikePost_second(id) {
                this.likePostNew(id);
            },
            // fb API 改版--- 评论无法获取点赞列表，所以暂时只调用点赞接口
            likePostNew(id) {
                console.log('点赞 api改版测试--->');
                const selectToken = this.selectAccessToken;
                /* 用户点击确定以后改变flag的值，禁用确定按钮 */
                this.confirmFlag = true;
                this.likedFlag = false;
                // const id = this.cmtPostId;
                $.ajaxInternational({
                    url: '/social/likePost',
                    method: 'post',
                    data: {
                        postId: id,
                        accessToken: selectToken
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.$Message.success(this.$t('facebook.homepagedynamic.likeSucc'));
                    } else {
                        this.$Message.error(this.$t('facebook.inbox.fbComment.likeFail'));
                    }
                    this.confirmFlag = false;
                    // 点赞后，需要重新获取评论数据, 更新页面显示
                    this.goToComments();
                    // this.goToCommentsNew();
                }).catch(() => {
                    this.confirmFlag = false;
                });
            },
            // 因fb API 改版，原来这个方法现在只用于帖子的点赞
            likePost: function() {
                const _this = this;
                /* 点赞弹窗里选择的账号对应的token，用于点赞操作 */
                const selectToken = this.selectAccessToken;
                /* 当前账号主页的token，用于获取点赞列表 */
                const currentToken = this.currentAccessToken;
                let id;
                /* 用户点击确定以后改变flag的值，禁用确定按钮 */
                this.confirmFlag = true;
                /* 初始默认为是点赞操作 */
                this.url = '/social/likePost';
                /* 当前用户是否存在点赞列表里。为true说明存在，则用户点击时调用取消点赞的接口；为false说明不存在，则点击时调用点赞接口 */
                this.likedFlag = false;
                if (this.idType === 'post') {
                    id = this.postId;
                } else {
                    id = this.cmtPostId;
                }
                /* 首先获取当前帖子点赞列表，用于判断当前账号是否对该帖子点过赞 */
                $.ajaxInternational({
                    url: '/social/getCommentLikes',
                    method: 'post',
                    data: {
                        pageNo: this.likePageNo,
                        pageSize: this.pageSize,
                        id: id,
                        // commentId: id,
                        accessToken: currentToken
                    }
                }).then(function(response) {
                    if (response.data.code === '1') {
                        _this.commentLikes = response.data.data.data;
                        _this.likedFlag = _this.commentLikes.some(item => item.id === _this.selectAccessId);
                        /* 根据当前用户是否存在于点赞列表来决定调用哪个接口 */
                        _this.url = _this.likedFlag ? '/social/cancelLikePost' : _this.url;
                        $.ajaxInternational({
                            url: _this.url,
                            method: 'post',
                            data: {
                                postId: id,
                                accessToken: selectToken
                            }
                        }).then(function(response) {
                            _this.modal4 = false;
                            if (response.data.code === '1') {
                                if (_this.likedFlag) {
                                    _this.$Message.success(_this.$t('facebook.homepagedynamic.cancelLikeSucc'));
                                } else {
                                    _this.$Message.success(_this.$t('facebook.homepagedynamic.likeSucc'));
                                }
                                if (_this.idType === 'post') {
                                    _this.getAccountInfo(_this.currentAccessId);
                                } else {
                                    _this.goToComments();
                                }
                            } else {
                                _this.$Message.error(_this.$t('facebook.inbox.fbComment.likeFail'));
                            }
                            _this.confirmFlag = false;
                        }).catch(() => {
                            _this.confirmFlag = false;
                        });
                    } else {
                        _this.confirmFlag = false;
                    }
                }).catch(function(response) {
                    // console.log('难道走这了？');
                    _this.confirmFlag = false;
                });
            },
            sharePost() {
                const _this = this;
                /* 用户点击确定以后改变flag的值，禁用确定按钮 */
                _this.confirmFlag = true;
                let privacyType = 'EVERYONE';
                if (this.shareType == _this.$t('facebook.homepagedynamic.friend')) {
                    privacyType = ' ALL_FRIENDS';
                } else if (this.shareType == _this.$t('facebook.homepagedynamic.own')) {
                    privacyType = 'SELF';
                }
                const link = this.link;
                const token = this.selectAccessToken;
                const id = this.selectAccessId;
                const message = this.postContent ? this.postContent : '';
                $.ajaxInternational({
                    url: '/social/sharePost',
                    method: 'post',
                    data: {
                        id: id,
                        accessToken: token,
                        link: link,
                        privacyValue: privacyType,
                        message: message
                    }
                }).then(function(response) {
                    _this.isActive = '';
                    _this.modal4 = false;
                    if (response.data.code == 1) {
                        _this.$Message.success(_this.$t('facebook.homepagedynamic.shareSucc'));
                        _this.getAccountInfo(_this.currentAccessId);
                        /* 初始化confirmFlag的值 */
                        _this.confirmFlag = false;
                    } else {
                        _this.$Message.error(_this.$t('facebook.homepagedynamic.shareFail'));
                        /* 初始化confirmFlag的值 */
                        _this.confirmFlag = false;
                    }
                }).catch(() => {
                    _this.confirmFlag = false;
                });
            },
            submitComments(message, index, secuploadFileLink) {
                console.log(message, index);
                // 1评论，2评论的评论
                this.submitSpinShow = true;
                const _this = this;
                const token = this.selectAccessToken;
                /* 用户点击确定以后改变flag的值，禁用确定按钮 */
                _this.confirmFlag = true;
                let id;
                let comment;
                if (index === 1) {
                    id = this.postId;
                    this.message = message;
                    comment = this.message;
                } else {
                    id = this.cmtPostId;
                    this.reMsg = message;
                    comment = this.reMsg;
                }
                $.ajaxInternational({
                    url: '/social/comments',
                    method: 'post',
                    data: {
                        id: id,
                        accessToken: token,
                        message: comment,
                        pictureUrl: secuploadFileLink
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        /* 初始化confirmFlag的值 */
                        this.$Message.success(this.$t('facebook.homepagedynamic.commentSucc'));
                        this.getAccountInfo(this.currentAccessId);
                        this.goToComments();
                        // this.goToCommentsNew();
                        if (index == 2) {
                            this.isComment = false;
                            this.reMsg = '';
                        } else {
                            this.message = '';
                        }
                    } else {
                        /* 初始化confirmFlag的值 */
                        this.$Message.error(this.$t('facebook.homepagedynamic.commentFail'));
                    }
                    this.submitSpinShow = false;
                    this.confirmFlag = false;
                }).catch(() => {
                    this.confirmFlag = false;
                    this.submitSpinShow = false;
                    this.$Message.error(this.$t('facebook.homepagedynamic.commentFail'));
                });
            },
            getCommentLikes(id) {
                this.listType = 0;
                this.modal5 = true;
                const _this = this;
                /* 获取点赞列表时使用的token应是当前主页账号的token，而非点赞弹窗里选中账号的token，否则会导致获取列表为空。 */
                /* var token=this.selectAccessToken; */
                const token = this.currentAccessToken;
                /* if(this.currentId!==''&&this.currentId === id){ */
                if (this.currentId !== '') {
                    this.likePageNo = 1;
                    this.commentLikes = [];
                }
                this.currentId = id;
                $.ajaxInternational({
                    url: '/social/getCommentLikes',
                    method: 'post',
                    data: {
                        pageNo: this.likePageNo,
                        pageSize: this.pageSize,
                        id: id,
                        accessToken: token
                    }
                }).then(function(response) {
                    if (response.data.code === '1') {
                        _this.commentLikes = response.data.data.data;
                    }
                });
                // $.ajaxInternational({
                //     url: '/social/likeComment',
                //     method: 'post',
                //     data: {
                //         pageNo: this.likePageNo,
                //         pageSize: this.pageSize,
                //         id: id,
                //         accessToken: token,
                //         commentId: id
                //     }
                // }).then(function(response) {
                //     if (response.data.code === '1') {
                //         _this.commentLikes = response.data.data.data;
                //     }
                // });
            },
            // 查看分享
            getCommentShares(id) {
                if (this.currentId !== '') {
                    this.sharePageNo = 1;
                    this.commentShares = [];
                }
                this.currentId = id;
                this.listType = 1;
                this.modal5 = true;
                const _this = this;
                let pgType = 0;
                if (this.type) {
                    pgType = 1;
                }
                $.ajaxInternational({
                    url: '/social/getCommentShares',
                    method: 'post',
                    data: {
                        pageType: pgType,
                        postId: id,
                        userId: this.bindingUserId,
                        pageId: _this.selectAccessId,
                        pageNo: this.sharePageNo,
                        pageSize: this.pageSize
                    }
                }).then(function(response) {
                    if (response.data.code === '1') {
                        const list = response.data.data.data;
                        if (list.length > 0) {
                            for (let i = 0, L = list.length; i < L; i++) {
                                _this.commentShares.push(list[i]);
                            }
                        }
                    }
                });
            },
            changeTextarea(response) {
                if (!response) {
                    this.isComment = false;
                }
            },
            getUrlFromPostContent(postContent) {
                const reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
                let v = postContent;
                v = v.replace(
                    reg,
                    '<a target=\'_blank\' class=\'header-source\' href=\'$1$2\'>$1$2</a>'
                ); // 这里的reg就是上面的正则表达式
                return v;
            }
        },
        filters: {
            filterName: function(value) {
                if (value && value.length > 15) {
                    value = `${value.substring(0, 15)}...`;
                }
                return value;
            },
            filterTime: function(value) {
                const timeStamp = Date.parse(new Date(value));
                const newDate = new Date();
                newDate.setTime(timeStamp);
                return newDate.toLocaleString();
            }
        },
        mounted() {
            this.getBrandPage();
        },
        updated() {
        },
        watch: {
            modal3(val) {
                // this.modal3 ? '' : (this.totalComments = []);
                if (!val) {
                    this.totalComments = [];
                }
            },
            menu_list(val) {
                this.canGoToBind = this.isContainsMenu('account_binding');
            }
        }
    };
</script>

<style scoped lang="less">
    .fb-page-list {
        .invalid-tip {
            font-size: 12px;
            color: red;
            cursor: pointer;
            float: right;
        }
    }

    .post-detail-modal {
        .comment-name {
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
        }
        .operation {
            margin-left: 49px;
            > span {
                margin-right:5px;
                color:#4267b2;
            }
        }
    }

    .invalid-tip {
        font-size: 12px;
        color: red;
        float: right;
    }
</style>
