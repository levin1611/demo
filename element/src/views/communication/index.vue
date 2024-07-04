<template>
    <div class="communication-page">
        <!-- <div>Communication</div> -->
        <Tabs v-model="activeName" @tab-click="handleClick" class="communication-page-tabs">
                <TabPane name="whatsapp_chat" v-if="isContainsMenu('whatsapp_chat')">
                    <span slot="label">
                        <Badge
                            :value="WAUnreadCount"
                            :max="99"
                            :hidden="WAUnreadCount <= 0">
                            {{$t('menu.whatsapp_chat')}}
                        </Badge>
                    </span>
                </TabPane>
                <TabPane name="xhl_chat" v-if="isContainsMenu('xhl_chat')">
                    <span slot="label">
                        <Badge
                            :value="totalChatCount"
                            :max="99"
                            :hidden="totalChatCount <= 0">
                            {{$t('menu.xhl_chat')}}
                        </Badge>
                    </span>
                </TabPane>
                <TabPane name="inbox" v-if="isContainsMenu('inbox')">
                    <span slot="label">
                        <Badge
                            :value="fbChatUnread"
                            :max="99"
                            :hidden="fbChatUnread <= 0">
                            {{$t('menu.inbox')}}
                        </Badge>
                    </span>
                </TabPane>
        </Tabs>
        <!-- <Badge :value="fbLeadsUnentry"
            :max="99"
            :hidden="fbLeadsUnentry <= 0">
            <router-link to="/communication/whatsapp_chat">{{$t('menu.whatsapp_chat')}}</router-link>
        </Badge>
        <Badge :value="totalChatCount"
            :max="99"
            :hidden="totalChatCount <= 0">
            <router-link to="/communication/xhl_chat">{{$t('menu.webChat')}}</router-link>
        </Badge>
        <Badge :value="fbLeadsUnentry"
            :max="99"
            :hidden="fbLeadsUnentry <= 0">
            <router-link to="/communication/inbox">{{$t('menu.fbchat')}}</router-link>
        </Badge> -->
        <router-view :content_height="`${this.window_height - 106}px`"></router-view>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    export default {
        name: 'communication',
        computed: {
            ...mapState({
                // whatsapp未读数
                waUnreadObj: state => state.whatsapp.waUnreadObj,
                // fb私信 未读数
                fbChatUnread: state => state.facebook.fbChatUnread,
                // 所有留言表单
                totalChatCount: state => state.totalChatCount,
                window_height: state => state.window_height
            }),
            ...mapGetters([
                'isContainsMenu',
                'isWAPersonalEdition'
            ]),
            activeName() {
                return this.$route.name;
            },
            // whatsapp未读数
            WAUnreadCount() {
                let result = 0;
                Object.values(this.waUnreadObj).forEach(item => {
                    result += item;
                });
                return result > 0 ? result : 0;
            }
        },
        props: {
        },
        data() {
            return {
            };
        },
        methods: {
            handleClick(tab) {
                this.$router.push({
                    name: tab.name
                });
            }
        }
    };
</script>

<style lang="less" scoped>
    .communication-page {
        .top-height {
            height: calc(100vh - 120px);
        }
        .communication-page-tabs {
            /deep/ .el-tabs__header {
                margin: 0 0 1px;
            }
            /deep/ .el-tabs__nav-wrap {
                padding-left: 20px;
            }
            /deep/ .el-tabs__item {
                height: 50px
            }
        }
        .el-badge {
            margin-top:10px;
            /deep/ .el-badge__content.is-fixed {
                -webkit-transform: translateY(0) translateX(140%);
                transform: translateY(0) translateX(140%);
            }
        }
    }
</style>
