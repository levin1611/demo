<template>
    <div>
        <div style="padding: 0 10px;"
             :class="{'current-reply': currentId === data.id}">
            <!-- 顶部左边, 评论人[和回复人]姓名 -->
            <span>
                <a style="cursor: auto;color: #4285f4;">{{ data.commentatorName }}</a>
                <template v-if="data.parentId !== 0">
                    {{ $t('timeLine.reply') }}
                    <a v-if="data.parentNode"
                       style="cursor: auto;color: #4285f4;">{{ data.parentNode.commentatorName }}</a>
                </template>
            </span>
            <!-- 评论时间 -->
            <span style="margin-left: 10px">{{ data.commentTime }}</span>
            <!-- 最右边, 回复按钮 -->
            <a v-if="showReply"
               @click="$listeners.reply(data)"
               style="float: right;"
               class="reply_btn">{{ $t('timeLine.reply') }}</a>
            <!-- 回复内容 -->
            <pre style="margin: 6px 0 8px 0">{{ data.commentContent }}</pre>
        </div>
        <!--<template v-if="Array.isArray(data.list) && data.list.length">-->
        <!--<ReplyTreeNode v-for="item in data.list.slice().sort((a, b) => Date.parse(b.commentTime) - Date.parse(a.commentTime))" :data="item" v-on="$listeners" :style="{'margin-top': '8px'}" :showReply="showReply"></ReplyTreeNode>-->
        <!--</template>-->
    </div>
</template>

<script>
    export default {
        name: 'replyTreeNode',
        props: [
            'data',
            'showReply',
            'currentId'
        ]
    };
</script>

<style scoped>
    .current-reply {
        background-color: #FFF4D6;
    }

    .reply_btn {
        float: right;
        color: #3b78de;
    }

    .reply_btn:hover {
        float: right;
        color: #2d63bc;
        text-decoration: underline;
    }
</style>
