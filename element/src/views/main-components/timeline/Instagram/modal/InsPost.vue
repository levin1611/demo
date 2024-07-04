<template>
    <div v-loading="loading"
         class="instagram-container">
        <!-- 头部 -->
        <div class="instagram-header">
            <!-- 关闭按钮 -->
            <div style="float:right;">
                <!-- 关闭按钮 -->
                <Icon custom="custom custom-modal-close"
                      size="15"
                      @click="closeDialog"
                      class="cursor-pointer"/>
            </div>
        </div>

        <!-- 正体 -->
        <Scroll :on-reach-bottom="loadMore"
                :height="500"
                :distance-to-edge="10">
            <template v-if="post">
                <!-- 帖子 -->
                <div style="border-bottom:1px solid #dddee1;">
                    <!-- 轮播: 视频/图片 -->
                    <Carousel :dots="post.medias.length > 1 ? 'outside' : 'none'"
                              :arrow="post.medias.length > 1 ? 'always' : 'never'"
                              :autoplay="false"
                              class="ins-post-carousel">
                        <CarouselItem v-for="item in post.medias"
                                      :key="item.id">
                            <!-- 图片 -->
                            <template v-if="[0, 1].includes(item.mediaType)">
                                <span style="padding: 10px"
                                      class="msg-text">
                                    <img :src="item.mediaUrl"
                                         @click.stop="imgPreview($event)"
                                         class="carousel-image">
                                </span>
                            </template>
                            <!-- 视频 -->
                            <template v-else-if="item.mediaType === 2">
                                <span style="padding: 10px;"
                                      class="msg-text">
                                    <video controls
                                           controlslist="nofullscreen"
                                           class="carousel-video">
                                        <source :src="item.mediaUrl"
                                                type="video/ogg">
                                        <source :src="item.mediaUrl"
                                                type="video/mp4">
                                        Sorry, your browser doesn't support embedded videos.
                                    </video>
                                </span>
                            </template>
                        </CarouselItem>
                    </Carousel>
                    <!-- 帖子信息: 点赞数, 评论数, 发布时间 -->
                    <div style="margin: 10px 0;">
                        <!-- 点赞数, 评论数, 后端说获取不到-->
                        <!-- 发布时间 -->
                        <div>{{ post.createdAt | timeFormat("DateTime") }}</div>
                    </div>
                    <!-- 帖子文本 -->
                    <div style="margin-bottom: 20px;">
                        <!-- 格式化文本信息 -->
                        <pre v-html="post.displayTitle"></pre>
                    </div>
                </div>

                <!-- 评论 -->
                <div class="post-comments">
                    <div v-for="comment in commentList"
                         :key="comment.id"
                         class="comment-container">
                        <!-- 头像 -->
                        <div class="comment-avatar">
                            <Avatar :src="comment.profilePicUrl"
                                    :size="44"
                                    @click.native="toInsPage(comment)"
                                    class="cursor-pointer"/>
                        </div>
                        <!-- 评论内容 -->
                        <div class="comment-body">
                            <div class="comment-content">
                                <!-- 评论者账号名 -->
                                <span @click="toInsPage(comment)"
                                      class="comment-nick cursor-pointer">{{ comment.fullName }}</span>
                                <!-- 评论内容 -->
                                <span class="comment-text">{{ comment.mediaText }}</span>
                            </div>
                            <!-- 评论时间 -->
                            <div class="comment-time">{{ comment.createdAt | timeFormat("DateTime") }}</div>
                        </div>

                        <!-- 回复 -->
                        <div v-if="Array.isArray(comment.reply) && comment.reply.length"
                             style="margin: 4px 40px 0 56px;">
                            <!-- 切换 显示回复 / 隐藏回复 -->
                            <span @click="toggleReply(comment)"
                                  class="comment-reply-toggle">{{ `${showReplyCommentIds.includes(comment.id) ? $t('timeLine.hideReply') : $t('timeLine.showReply') }(${comment.reply.length})` }}</span>
                            <div v-for="secComment in comment.reply"
                                 :key="secComment.id"
                                 v-show="showReplyCommentIds.includes(comment.id)"
                                 class="comment-container">
                                <!-- 头像 -->
                                <div class="comment-avatar">
                                    <Avatar :src="secComment.profilePicUrl"
                                            :size="44"
                                            @click.native="toInsPage(secComment)"
                                            class="cursor-pointer"/>
                                </div>
                                <!-- 评论内容 -->
                                <div class="comment-body">
                                    <div class="comment-content">
                                        <!-- 评论者账号名 -->
                                        <span @click="toInsPage(secComment)"
                                              class="comment-nick cursor-pointer">{{ secComment.fullName }}</span>
                                        <!-- 评论内容 -->
                                        <span class="comment-text">{{ secComment.mediaText }}</span>
                                    </div>
                                    <!-- 评论时间 -->
                                    <div class="comment-time">{{ secComment.createdAt | timeFormat("DateTime") }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 暂无评论 -->
                <p v-if="commentList.length === 0"
                   class="text-center">{{ $t('followupReply.noComment') }}</p>
            </template>
        </Scroll>
    </div>
</template>

<script>
    import util from '@/libs/util';

    export default {
        name: 'InsPost',
        props: {
            id: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                // 七牛资源域名
                insDomain: 'https://instagram.leadscloud.com/',
                loading: false, // 界面loading
                post: null,
                commentList: [],
                pageSize: 20, // 每页请求行数
                showReplyCommentIds: [] // 要显示回复的 comment 的 id
            };
        },
        methods: {
            // 关闭弹窗
            closeDialog() {
                this.$emit('closeDialog');
            },
            loadMore() {
                this.getComments();
            },
            getPost() {
                // loading
                this.loading = true;

                // 恢复数据为初始状态
                this.post = null;
                this.commentList = [];

                // 请求帖子内容
                util.ajaxJson({
                    url: `/instagram/post/${this.id}`,
                    method: 'get'
                }).then(res => {
                    if (res.data) {
                        // 处理 medias 和 medias[i].mediaUrl
                        if (Array.isArray(res.data.medias)) {
                            res.data.medias.forEach(item => {
                                if (item.mediaUrl) {
                                    if (!item.mediaUrl.startsWith('http')) {
                                        item.mediaUrl = this.insDomain + item.mediaUrl;
                                    }
                                }
                            });
                        } else {
                            // medias 为空, 则判断 displayUrl 是否存在, 存在则以图片形式存入 medias
                            res.data.medias = [];
                            if (res.data.displayUrl) {
                                let mediaUrl = res.data.displayUrl;
                                if (!mediaUrl.startsWith('http')) {
                                    mediaUrl = this.insDomain + mediaUrl;
                                }
                                res.data.medias.push({
                                    mediaUrl,
                                    mediaType: 0,
                                    id: Date.now()
                                });
                            }
                        }
                        this.post = res.data;
                        this.getComments();
                    } else {
                        this.$Message.error(this.$t('timeLine.error_getInsPost'));
                        this.loading = false;
                    }
                }).catch(error => {
                    this.$Message.error(this.$t('timeLine.error_getInsPost'));
                    this.loading = false;
                    console.error(error);
                });
            },
            getComments() {
                this.loading = true;
                const curPage = Math.floor(this.commentList.length / this.pageSize) + 1;
                util.ajaxJson({
                    url: `/instagram/comments/${this.id}/${curPage}/${this.pageSize}`,
                    method: 'get'
                }).then(res => {
                    this.loading = false;
                    if (res.data) {
                        // 未请求到数据, 提示"已到底部"
                        if (!(Array.isArray(res.data.records) && res.data.records.length)) {
                            // 滚动到底部
                            this.$Message.success(this.$t('timeLine.noMore'));
                            return;
                        }
                        // 拼接请求到的数据
                        const result = this.commentList.concat(res.data.records);
                        // 去重
                        const ids = new Set([]);
                        result.slice().reverse().forEach((item, index, arr) => {
                            if (ids.has(item.id)) {
                                // id 重复, 数据删除
                                result.splice(arr.length - 1 - index, 1);
                            } else {
                                // id 不重复, 数据保留, 进行数据处理
                                // 处理评论的 profilePicUrl
                                if (item.profilePicUrl) {
                                    if (!item.profilePicUrl.startsWith('http')) {
                                        item.profilePicUrl = this.insDomain + item.profilePicUrl;
                                    }
                                }
                                // 处理二级评论的 profilePicUrl
                                if (Array.isArray(item.reply)) {
                                    item.reply.forEach(secComment => {
                                        if (secComment.profilePicUrl) {
                                            if (!secComment.profilePicUrl.startsWith('http')) {
                                                secComment.profilePicUrl = this.insDomain + secComment.profilePicUrl;
                                            }
                                        }
                                    });
                                }
                            }
                            ids.add(item.id);
                        });
                        // 时间正序排序并赋值
                        this.commentList = result.sort((a, b) => (new Date(a.createdAt)).getTime() - (new Date(b.createdAt)).getTime());
                    }
                }).catch(error => {
                    this.loading = false;
                    console.error(error);
                });
            },
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            },
            // 跳转到 ins 用户主页
            toInsPage(data) {
                if (data && data.username) {
                    window.open(`https://www.instagram.com/${data.username}/`, '_blank');
                }
            },
            // 切换回复的显隐
            toggleReply(comment) {
                if (this.showReplyCommentIds.includes(comment.id)) {
                    this.showReplyCommentIds = this.showReplyCommentIds.filter(item => item !== comment.id);
                } else {
                    this.showReplyCommentIds.push(comment.id);
                }
            }
        },
        watch: {
            id: {
                handler(val) {
                    if (val) {
                        this.getPost();
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less" scoped>
    .instagram-container {
        .instagram-header {
            font-size: 16px;
            height: 40px;
            line-height: 30px;
            border-bottom: 1px solid #e5e5e5;
        }
    }

    .comment-container {
        margin: 20px 0;
        clear: both;
    }

    .comment-avatar {
        float: left;
        width: 48px;
        line-height: 48px;
    }

    .comment-body {
        margin-left: 56px;
    }

    .comment-content {
        line-height: 26px;
        position: relative;
        display: flex;
    }

    .comment-nick {
        float: left;
        font-size: 14px;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.80);
        line-height: 22px;
    }

    .comment-text {
        flex: 1;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.80);
        line-height: 22px;
        margin-left: 12px;
    }

    .comment-time {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.40);
        line-height: 18px;
        margin-top: 4px;
    }

    .comment-reply-toggle {
        margin: 20px 0 12px;
        cursor: pointer;
        font-size: 12px;
        color: #3B78DE;
        line-height: 18px;
    }

    .ins-post-carousel {
        /deep/ .el-carousel__indicator {
            .el-carousel__button {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                opacity: 1;
            }

            &.is-active {
                .el-carousel__button {
                    color: #FA8241;
                    background-color: #FA8241;
                }
            }
        }

        .carousel-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            vertical-align: bottom;
        }

        .carousel-video {
            width: 100%;
            height: 100%;
            vertical-align: bottom;
        }
    }

    pre {
        font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, "\5FAE\8F6F\96C5\9ED1", Arial, sans-serif;
        word-break: break-word;
    }

    /*隐藏全屏按钮*/
    video::-webkit-media-controls-fullscreen-button {
        display: none;
    }
</style>
