<template>
    <div class="fb-post-detail">
        <!-- loading -->
        <Spin v-if="!visible"
              fix></Spin>
        <!-- 正体 -->
        <Scroll v-else
                :on-reach-bottom="handleReachBottom"
                :height="500"
                :distance-to-edge="10">
            <template v-if="post">
                <div style="border-bottom:1px solid #dddee1;padding:10px">
                    <Avatar :src="pageAvatar"
                            style="vertical-align:baseline;"/>
                    <div style="display:inline-block">
                        <p>{{ post.from.name }}</p>
                        <p>{{ post.created_time | timeFormat('DateTime') }}</p>
                    </div>
                    <Card style="width:75%;margin:0 auto">
                        {{ post.message }}
                        <!-- <div v-if="post.picture">
                            <img :src="post.full_picture"
                                @click="imgPreview"
                                style="width:100%">
                        </div> -->
                        <!-- 有多种图片的情况 -->
                        <div v-if="post.full_picture">
                            <img
                                :src="item" style="height: 150px;margin-right: 5px;"
                                @click="imgPreview"
                                v-for="(item, index) in post.full_picture.split(',')" :key="index">
                        </div>
                        <div v-else-if="post.type === 'video'">
                            <img :src="post.full_picture"
                                @click="imgPreview"
                                style="width:100%">
                        </div>
                        <div v-else-if="post.type === 'link'"
                            style="border:1px solid #dddee1;">
                            <template v-if="attachments.type === 'multi_share_no_end_card'">
                                <Carousel indicator-position="outside"
                                        arrow="always">
                                    <CarouselItem v-for="(item, index) in subattachments" :key="index">
                                        <div>
                                            <img :src="item.media.image.src"
                                                style="width:100%">
                                            <div style="border-top:1px solid #dddee1;padding:10px;position:relative;min-height: 60px;">
                                                <div style="font-size: 16px;font-weight: bold;margin-bottom: 10px;">{{ item.title }}</div>
                                                <div>{{ item.description }}</div>
                                                <div class="price-btn">{{ $t('facebook.inbox.fbComment.inquiryNow') }}</div>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                </Carousel>
                            </template>
                            <template v-else-if="attachments.type === 'lead_gen'">
                                <div>
                                    <img :src="attachments.media.image.src"
                                        style="width:100%">
                                    <div style="border-top:1px solid #dddee1;padding:10px;position:relative">
                                        <div style="font-size: 16px;font-weight: bold;margin-bottom: 10px;min-height: 60px;">{{ attachments.title }}</div>
                                        <div>{{ attachments.description }}</div>
                                        <div class="price-btn">{{ $t('facebook.inbox.fbComment.inquiryNow') }}</div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </Card>
                </div>

                <div class="post-comments">
                    <div v-for="(comment,commentIndex) in fbComments"
                        :key="commentIndex"
                        style="margin:4px 0">
                        <Avatar :src="comment.from.picture"
                                size="small"/>
                        <span style="color:#4267b2;font-weight:700;padding:0 4px">{{ comment.from.name }}</span>
                        <span :class="comment.class">{{ comment.message }}</span>
                        <span v-show="comment.attachment" style="display: block;padding-left: 30px;">
                            <img
                                :src="comment.attachment.media.image.src"
                                alt=""
                                v-if="comment.attachment"
                                style="width: 150px;height: 150px;"
                                @click="imgPreview">
                        </span>
                        <div v-show="comment.comments.data.length !== 0"
                            style="margin:4px 40px">
                            <div v-for="(secComment,secCommentIndex) in comment.comments.data"
                                :key="secCommentIndex"
                                style="margin:4px 0">
                                <Avatar :src="secComment.from.picture"
                                        size="small"/>
                                <span style="color:#4267b2;font-weight:700;padding:0 4px">{{ secComment.from.name }}</span>
                                <span :class="secComment.class">{{ secComment.message }}</span>
                                <span v-show="secComment.attachment" style="display: block;padding-left: 30px;">
                                    <img
                                        :src="secComment.attachment.media.image.src"
                                        alt=""
                                        v-if="secComment.attachment"
                                        style="width: 150px;height: 150px;"
                                        @click="imgPreview">
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Scroll>
    </div>
</template>

<script>
    export default {
        name: 'PostModal',
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            post: {
                type: Object,
                default: null
            },
            pageAvatar: {
                type: String,
                default: ''
            },
            fbComments: {
                type: Array,
                default: null
            }
        },
        data() {
            return {
                attachments: [],
                subattachments: []
            };
        },
        methods: {
            handleReachBottom() {
                this.$emit('addPageNum');
            },
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            }
        },
        watch: {
            post: {
                handler(val) {
                    if (val) {
                        if (val.attachments) {
                            this.attachments = val.attachments.data[0];
                        }
                        if (val.type === 'link') {
                            if (this.attachments.type === 'multi_share_no_end_card') {
                                this.subattachments = this.attachments.subattachments.data;
                            }
                        }
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less">
    .fb-post-detail {
        height: 500px;
        overflow-y: auto;
        position: relative;

        .currentComment {
            color: #FA8241;
            font-weight: 700;
        }

        .newComment {
            color: #FA8241;
        }

        .comments-header {
            height: 73px;
            background: #fff;
            line-height: 25px;
            padding: 10px;
            border-bottom: 1px solid #dddee1;
        }

        .comments-content {
            width: 80%;
            margin: 0 auto;

            .price-btn {
                border: 1px solid #dddee1;
                border-radius: 4px;
                padding: 6px 15px;
                display: inline-block;
                position: absolute;
                right: 20px;
                top: 50%;
                margin-top: -17px;
            }
        }

        .post-comments {
            padding: 10px;

        }
    }
</style>
