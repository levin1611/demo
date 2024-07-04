<template>
    <div v-loading="loading"
         class="instagram-container">
        <!-- 头部 -->
        <div class="instagram-header">
            <!-- 对话框名 -->
            <div style="float:left;">
                <Tooltip v-if="dialogName.length > 25"
                         :content="dialogName"
                         placement="top">
                    <span>{{ dialogName.slice(0, 25) + '...' }}</span>
                </Tooltip>
                <span v-else>{{ dialogName }}</span>
            </div>
            <!-- 关闭按钮 -->
            <div style="float:right;">
                <Icon custom="custom custom-modal-close"
                      size="15"
                      @click="closeDialog"
                      style="cursor:pointer;"/>
            </div>
        </div>
        <!-- 聊天窗口 -->
        <div @scroll.capture="close_popper">
            <ul>
                <Scroll :on-reach-top="loadMore"
                        height="500"
                        ref="msgScroll">
                    <InsDialogItem v-for="msg in msgList"
                                   :key="`${msg.id}`"
                                   :rawMsg="msg"></InsDialogItem>
                </Scroll>
            </ul>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import InsDialogItem from './InsDialogItem.vue';

    export default {
        name: 'InsDialog',
        components: {
            InsDialogItem
        },
        props: {
            dialogName: {
                type: String,
                default: ''
            },
            id: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                loading: false, // 界面loading
                pageSize: 20, // 每页请求行数
                msgList: [], // 聊天记录列表
                // 滚动完成后回调
                close_popper: this.$debounce(e => {
                    // 关闭翻译 Poptip
                    if (this.$el.querySelector('.popper-opened.msg-more')) {
                        this.$el.querySelector('.popper-opened.msg-more').click();
                    }
                }, 100)
            };
        },
        methods: {
            // 关闭弹窗
            closeDialog() {
                this.$emit('closeDialog');
            },
            // 获取聊天记录
            getDialog() {
                this.loading = true;
                const curPage = Math.floor(this.msgList.length / this.pageSize) + 1;
                util.ajaxJson({
                    url: `https://hkendtx.leadscloud.com/instagram/messages/${this.id}/${curPage}/${this.pageSize}`,
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
                        const result = this.msgList.concat(res.data.records);
                        // 去重
                        const ids = new Set([]);
                        result.slice().reverse().forEach((item, index, arr) => {
                            if (ids.has(item.id)) {
                                result.splice(arr.length - 1 - index, 1);
                            }
                            ids.add(item.id);
                        });
                        // 滚动到页面底部
                        if (this.msgList.length === 0) {
                            setTimeout(() => {
                                if (this.$refs.msgScroll && this.$refs.msgScroll.$refs.scrollContainer) {
                                    const _el = this.$refs.msgScroll.$refs.scrollContainer;
                                    _el.scrollTop = _el.scrollHeight;
                                }
                            }, 400);
                        }
                        // 时间正序排序并赋值
                        this.msgList = result.sort((a, b) => (new Date(a.createdAt)).getTime() - (new Date(b.createdAt)).getTime());
                    }
                }).catch(error => {
                    this.loading = false;
                    console.error(error);
                });
            },
            // 加载更多
            loadMore() {
                this.getDialog();
            }
        },
        watch: {
            id: {
                handler(val) {
                    this.msgList = [];
                    if (val) {
                        this.getDialog();
                    }
                },
                immediate: true
            },
            // 在此处处理加载历史消息后滚动条的滚动行为, 以及来新消息后的"未读消息"提示和滚动条
            msgList: {
                handler(newVal, oldVal) {
                    // 获取滚动条所在 DOM
                    let DOM_scrollContainer;
                    if (this.$refs.msgScroll && this.$refs.msgScroll.$refs.scrollContainer) {
                        DOM_scrollContainer = this.$refs.msgScroll.$refs.scrollContainer;
                    } else {
                        return;
                    }
                    // 加上 setTimeout 以保证是在 DOM 结构出现后再触发方法
                    setTimeout(() => {
                        if (Array.isArray(oldVal) && oldVal.length) {
                            // 对新增的历史消息的处理
                            // 获取旧数组最顶部消息
                            const topMsg = oldVal[0];
                            const DOM_topMsg = document.getElementById(`insDialogItem-${topMsg.id}`);
                            if (DOM_topMsg) {
                                // 如果最顶部消息距离消息窗内容顶部的距离超过一定大小, 则认为是加载出了更多历史数据
                                const offsetTop = DOM_topMsg.offsetTop;
                                if (offsetTop > 80) {
                                    // 于是调整消息窗滚动条位置, 使之前的最顶部消息继续显示在视口顶部, 让用户自己手动向上滑动查看历史消息
                                    DOM_scrollContainer.scrollTop = offsetTop;
                                }
                            }
                        }
                    });
                }
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
</style>
