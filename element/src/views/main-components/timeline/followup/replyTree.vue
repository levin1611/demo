<template>
    <div>
        <template v-for="(item, index) in unfold_data">
            <ReplyTreeNode :data="item"
                           :currentId="currentId"
                           :showReply="showReply"
                           v-on="$listeners"
                           :style="{'margin-top': '8px'}"></ReplyTreeNode>
            <div v-if="index !== unfold_data.length - 1"
                 style="height: 0;border-bottom: 1px dashed #eaeaea;"></div>
        </template>
    </div>
</template>

<script>
    import ReplyTreeNode from '@/views/main-components/timeline/followup/replyTreeNode';

    export default {
        name: 'replyTree',
        components: {
            ReplyTreeNode
        },
        props: [
            'data',
            'showReply',
            'currentId'
        ],
        computed: {
            unfold_data() {
                return Array.isArray(this.data) ? this.unfold_comments(this.data.slice()).sort((a, b) => Date.parse(b.commentTime) - Date.parse(a.commentTime)) : [];
            }
        },
        methods: {
            // 展开 comments
            unfold_comments(arr) {
                const all_comments = [];

                function unfold(arr, parentNode) {
                    arr.forEach(item => {
                        const temp = Object.assign({}, item);
                        temp.parentNode = parentNode;
                        if (Array.isArray(temp.list) && temp.list.length) {
                            const children = temp.list.slice();
                            delete temp.list;
                            all_comments.push(temp);
                            unfold(children, temp);
                        } else {
                            all_comments.push(temp);
                        }
                    });
                }

                unfold(arr);
                return all_comments;
            }
        }
    };
</script>
