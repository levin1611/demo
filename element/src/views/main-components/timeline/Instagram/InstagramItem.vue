<template>
    <!-- 时间轴条目 -->
    <div class="timeline-item">
        <!-- header -->
        <div class="item-header clearfloat">
            <!-- ins 对话: 有 gid (群组 id) -->
            <div v-if="item.eventCustomVar.gid"
                 class="item-title">{{ $t('timeLine.instagramDialog') }}</div>
            <!-- ins 评论: 有 pid (帖子 id) -->
            <div v-else-if="item.eventCustomVar.pid"
                 class="item-title">{{ $t('timeLine.instagramComment') }}</div>
            <!-- 分割线 -->
            <div class="block-line"></div>
            <!-- 来自联系人 -->
            <div @click="viewContact(item)"
                 class="header-source">{{ $t('timeLine.fromContacts') }}{{ item.contactsName }}</div>
            <!-- 时间 -->
            <div class="item-time">{{ item.eventTime | timeFormat("DateTime") }}</div>
        </div>
        <!-- body -->
        <div class="item-body">
            <!-- ins 对话 -->
            <template v-if="item.eventCustomVar.gid">
                <!-- 【xxx】 向 【xxx 群组】 发送消息 -->
                【{{ item.eventCustomVar.accountName }}】{{ $t('timeLine.towards') }}【
                <!-- 群组名(超长隐藏 tooltip 显示完整信息) -->
                <Tooltip v-if="item.eventCustomVar.title.length > 30"
                         placement="top"
                         :content="item.eventCustomVar.title">
                    <span>{{ item.eventCustomVar.title.slice(0, 30) + '...' }}</span>
                </Tooltip>
                <span v-else>{{ item.eventCustomVar.title }}</span>
                】{{ $t('timeLine.sendMessage') }}

                <!-- 显示群组名称, 可点击弹出聊天框 -->
                <Poptip width="500"
                        placement="bottom-start"
                        popper-class="pop-show"
                        @hide="handleCloseInsDialog"
                        @show="handleOpenInsDialog">
                    <!-- 消息内容 -->
                    <span slot="reference"
                          :class="`item-event piwik_${type}_timeLineItem_ins_dialog`">【
                        <Tooltip v-if="getMessageContent(item).length > 30"
                                 placement="top"
                                 :content="getMessageContent(item)">
                            <!-- 11: 标题|内容, 标题需加粗, 内容正常显示, 中间 | 不显示 -->
                            <template v-if="item.eventCustomVar.mediaType === 11">
                                <span style="font-weight: bold">{{ data.eventContent.slice(0, data.eventContent.indexOf('|')) }}</span>
                                <span>{{ data.eventContent.slice(data.eventContent.indexOf('|') + 1) }}</span>
                            </template>
                            <template v-else>
                                <span>{{ getMessageContent(item).slice(0, 30) + '...' }}</span>
                            </template>
                        </Tooltip>
                        <span v-else>{{ getMessageContent(item) }}</span>
                    】</span>
                    <!-- 对话框 poptip -->
                    <div @click="popContentClick"
                         style="min-height: 540px"
                         class="api">
                        <template v-if="showDialog">
                            <InsDialog :dialogName="item.eventCustomVar.title"
                                       :id="`${item.eventCustomVar.gid}`"
                                       @closeDialog="closeDialog"></InsDialog>
                        </template>
                    </div>
                </Poptip>
            </template>

            <!-- ins 评论 -->
            <template v-else-if="item.eventCustomVar.pid">
                <!-- xxx 评论了 xxx 的帖子 -->
                【{{ item.eventCustomVar.fromAccountName }}】{{ $t('timeLine.commented') }}【
                <!-- 发帖人账号(超长隐藏 tooltip 显示完整信息) -->
                <Tooltip v-if="item.eventCustomVar.toAccountName.length > 30"
                         placement="top"
                         :content="item.eventCustomVar.toAccountName">
                    <span>{{ item.eventCustomVar.toAccountName.slice(0, 30) + '...' }}</span>
                </Tooltip>
                <span v-else>{{ item.eventCustomVar.toAccountName }}</span>
                】{{ $t('timeLine.post') }}

                <!-- 帖子标题/图片/..., 可点击弹出评论框 -->
                <Poptip width="500"
                        placement="bottom-start"
                        popper-class="pop-show"
                        @hide="handleCloseInsDialog"
                        @show="handleOpenInsDialog">
                    <!-- 帖子内容 -->
                    <span slot="reference"
                          :class="`item-event piwik_${type}_timeLineItem_ins_post`">【
                        <!-- 帖子内容(超长隐藏 tooltip 显示完整信息) -->
                                <Tooltip v-if="getPostContent(item).length > 30"
                                         placement="top"
                                         :content="getPostContent(item)">
                                    <span>{{ getPostContent(item).slice(0, 30) + '...' }}</span>
                                </Tooltip>
                                <span v-else>{{ getPostContent(item) }}</span>
                            】</span>
                    <!-- 评论框 -->
                    <div style="min-height: 540px"
                         class="api">
                        <template v-if="showDialog">
                            <InsPost :id="`${item.eventCustomVar.pid}`"
                                     @closeDialog="closeDialog"></InsPost>
                        </template>
                    </div>
                </Poptip>
            </template>
        </div>
    </div>
</template>

<script>
    import i18n from '@/locale';
    import InsDialog from './modal/InsDialog';
    import InsPost from './modal/InsPost';

    export default {
        name: 'InstagramItem',
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
        components: {
            InsDialog,
            InsPost
        },
        data() {
            return {
                showDialog: false
            };
        },
        methods: {
            // 监听 insDialog Poptip 内部点击事件, 内部点击时关闭翻译弹窗
            popContentClick(e) {
                // 查询当前 insDialog Poptip 内部所有打开的翻译 Poptip 的 trigger 按钮
                const _triggers = e.currentTarget.querySelectorAll('.popper-opened.msg-more');
                // 逐个点击 trigger 按钮关闭翻译 Poptip
                if (_triggers.length) {
                    Array.from(_triggers).forEach(_el => {
                        _el.click();
                    });
                }
            },
            // 查看联系人详情
            viewContact(item) {
                this.$emit('viewContact', item);
            },
            // 关闭弹窗
            closeDialog() {
                document.body.click();
            },
            // 关闭弹窗回调
            handleCloseInsDialog() {
                this.showDialog = false;
            },
            // 开启弹窗回调
            handleOpenInsDialog() {
                this.showDialog = true;
            },
            // 根据最近一条对话内容的媒体类型决定时间轴上如何显示
            getMessageContent(data) {
                // 获取时间轴数据
                const { mediaType } = data.eventCustomVar;

                // 根据不同的媒体类型, 返回不同数据
                switch (mediaType) {
                    case 0: // 文本
                    case 1: // like
                    case 4: // 分享
                    case 5: // 链接
                    case 6: // 视频聊天开始/结束
                    case 7: // 修改群名之类的操作信息
                    case 11: // 标题|内容, 标题需加粗, 内容正常显示, 中间 | 不显示
                        return data.eventContent;
                    case 2: // 动图
                        return this.$t('timeLine.instagramImage');
                    case 3: // 文字 + 视频
                    case 8: // 文字 + 手机视频
                        return `${data.eventContent || this.$t('timeLine.instagramVideo')}`;
                    case 9: // 音频
                        return this.$t('timeLine.instagramAudio');
                    case 10: // 自拍视频
                        return this.$t('timeLine.instagramVideo');
                    case 12: // 文字 + 图片
                        return `${data.eventContent || this.$t('timeLine.instagramImage')}`;
                    default:
                        return '';
                }
            },
            // 根据帖子内容的媒体类型决定时间轴上如何显示
            getPostContent(data) {
                // 获取时间轴数据
                const { mediaType, title } = data.eventCustomVar;

                // 根据不同的媒体类型, 返回不同数据
                switch (mediaType) {
                    case 0: // 图片
                    case 1: // 多张图片
                        return `${title || this.$t('timeLine.instagramImage')}`;
                    case 2: // 视频
                        return `${title || this.$t('timeLine.instagramVideo')}`;
                    default:
                        return title || '';
                }
            }
        }
    };
</script>
