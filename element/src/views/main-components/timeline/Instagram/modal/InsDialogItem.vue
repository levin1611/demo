<template>
    <li :id="`insDialogItem-${msg.id}`"
        :class="['u-msg', 'session-chat', msg.direction === 1 ? 'item-me' : 'item-you']">
        <!-- 消息发送时间 -->
        <p class="message-time"> {{ msg.createdAt | timeFormat("DateTime") }} </p>
        <!-- 消息体 -->
        <div style="overflow: hidden;text-align: left">
            <!-- 头像 -->
            <a @click="toInsPage(msg)"
               class="msg-head">
                <!-- 用户头像 -->
                <img v-if="msg.profilePicUrl"
                     :src="msg.profilePicUrl"
                     style="width: 44px; height: 44px;border-radius: 50%"
                     class="chat-svg-avatar">
                <!-- 默认头像 -->
                <svg v-else
                     class="chat-svg-avatar"
                     aria-hidden="true">
                    <use xlink:href="#custom-visitor-avatar"></use>
                </svg>
            </a>

            <!-- 按 mediaType 渲染 -->
            <!-- 0: 文本 -->
            <!-- 1: like -->
            <!-- 4: 分享 -->
            <!-- 5: 链接 -->
            <!-- 6: 视频聊天开始/结束 -->
            <!-- 7: 修改群名之类的操作信息 -->
            <!-- 11: 标题|内容, 标题需加粗, 内容正常显示, 中间 | 不显示 -->
            <template v-if="[0, 1, 4, 5, 6, 7, 11].includes(msg.mediaType)">
                <span class="msg-text">
                    <!-- 格式化文本信息 -->
                    <pre v-html="msg.mediaText"
                         style="margin: 0"></pre>

                    <!-- 文本消息翻译 -->
                    <template v-if="msg.mediaType === 0">
                        <!-- 翻译定位用 -->
                        <div :id="msg.id"></div>

                        <!-- 翻译按钮 -->
                        <Poptip width="150"
                                :options="options"
                                placement="bottom-start"
                                @show="popperShow"
                                @hide="popperHide"
                                class="pop-tip">
                            <!-- trigger 按钮 -->
                            <Button slot="reference"
                                    type="text"
                                    icon="el-icon-more"
                                    :class="{'msg-more': true, 'popper-opened': transPopShow}"></Button>
                            <!-- pop 弹窗 -->
                            <div class="api">
                                <div class="poptip-block">
                                    <!-- 选择语言 -->
                                    <Poptip v-model="visible"
                                            :options="options"
                                            placement="right"
                                            class="lang-tip">
                                        <!-- trigger 按钮 -->
                                        <div slot="reference"
                                             class="poptip-item">{{ $t('chat.langSelect') }}
                                            <Icon type="arrow-right-b"
                                                  style="margin-left: 18px"></Icon>
                                        </div>
                                        <!-- pop 弹窗 -->
                                        <div class="api">
                                            <div v-for="item in languageList"
                                                 :key="item.value"
                                                 @click="selectLang(item.value, msg)"
                                                 class="lang-item">{{ item.label }}</div>
                                        </div>
                                    </Poptip>
                                    <div @click="translateChat('zh', msg)"
                                         class="poptip-item">{{ $t('chat.translateDialog') }}
                                    </div>
                                </div>
                            </div>
                        </Poptip>
                    </template>
                </span>
            </template>
            <!-- 2: 动图 -->
            <template v-else-if="[2].includes(msg.mediaType)">
                <span style="padding: 10px"
                      class="msg-text msg-text-img-wrapper">
                    <img :src="msg.mediaUrl"
                         @click.stop="imgPreview($event)"
                         class="msg-img">
                </span>
            </template>
            <!-- 3: 文字 + 视频 -->
            <!-- 8: 文字 + 手机视频 -->
            <template v-else-if="[3, 8].includes(msg.mediaType)">
                <span style="padding: 10px"
                      class="msg-text">
                    <!-- 格式化文本信息 -->
                    <pre v-if="msg.mediaText"
                         v-html="msg.mediaText"></pre>

                    <!-- 视频 -->
                    <video v-if="msg.mediaUrl"
                           controls
                           controlslist="nofullscreen"
                           height="220">
                        <source :src="msg.mediaUrl" type="video/ogg">
                        <source :src="msg.mediaUrl"
                                type="video/mp4">
                        Sorry, your browser doesn't support embedded videos.
                    </video>
                </span>
            </template>
            <!-- 9: 音频 -->
            <template v-else-if="msg.mediaType === 9">
                <span style="padding: 10px;"
                      class="msg-text">
                    <audio controls
                           :src="msg.mediaUrl">
                        Your browser does not support the
                        <code>audio</code> element.
                    </audio>
                </span>
            </template>
            <!-- 10: 自拍视频 -->
            <template v-else-if="[10].includes(msg.mediaType)">
                <span style="padding: 10px;"
                      class="msg-text">
                    <video controls
                           controlslist="nofullscreen"
                           height="220">
                        <source :src="msg.mediaUrl" type="video/ogg">
                        <source :src="msg.mediaUrl"
                                type="video/mp4">
                        Sorry, your browser doesn't support embedded videos.
                    </video>
                </span>
            </template>
            <!-- 12: 文字 + 图片 -->
            <template v-else-if="[12].includes(msg.mediaType)">
                <span style="padding: 10px"
                      class="msg-text">
                    <!-- 格式化文本信息 -->
                    <pre v-if="msg.mediaText"
                         v-html="msg.mediaText"></pre>

                    <!-- 图片 -->
                    <img v-if="msg.mediaUrl"
                         :src="msg.mediaUrl"
                         @click.stop="imgPreview($event)"
                         class="msg-img">
                </span>
            </template>
            <!-- 其他, 默认显示 mediaText -->
            <template v-else>
                <span class="msg-text">
                    <!-- 格式化文本信息 -->
                    <pre v-html="msg.mediaText"
                         style="margin: 0"></pre>
                </span>
            </template>
        </div>
    </li>
</template>

<script type="text/javascript">
    import util from '@/libs/util';

    export default {
        name: 'InsDialogItem',
        props: {
            rawMsg: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                // 七牛资源域名
                insDomain: 'https://instagram.leadscloud.com/',
                // 消息数据
                msg: {},

                // 翻译相关
                visible: false,
                transPopShow: false,
                targetLang: 'zh-CN'
            };
        },
        computed: {
            options() {
                const container = document.querySelector('#instagram-main');
                return {
                    modifiers: {
                        computeStyle: {
                            gpuAcceleration: false
                        },
                        preventOverflow: {
                            boundariesElement: container
                        }
                    }
                };
            }
        },
        beforeMount() {
            this.$forceUpdate();
            // 处理传入的消息数据
            const item = Object.assign({}, this.rawMsg);
            switch (item.mediaType) {
                // case 4: // 分享
                case 0: // 文本
                case 5: // 链接
                    // 链接转换为可点击状态
                    item.mediaText = item.mediaText.replace(/((https|http):\/\/[\S.\/]+)(?![^<]+>)/gi, '<a href=\'$1\' target=\'_blank\'>$1</a>');
                    break;
                case 11: // 标题|内容, 标题需加粗, 内容正常显示, 中间 | 不显示
                    const title = item.mediaText.slice(0, item.mediaText.indexOf('|'));
                    let content = item.mediaText.slice(item.mediaText.indexOf('|') + 1);
                    content = content.replace(/((https|http):\/\/[\S.\/]+)(?![^<]+>)/gi, '<a href=\'$1\' target=\'_blank\'>$1</a>');
                    item.mediaText = `<span style="font-weight: bold">${title}</span> <span>${content}</span>`;
                    break;
                case 1: // like
                case 2: // 动图
                case 3: // 视频
                case 6: // 视频聊天开始/结束
                case 7: // 修改群名之类的操作信息
                case 8: // 多类型(图片 + 文字) => 改为视频
                case 9: // 音频
                case 10: // 自拍视频
                case 12: // 图片
                    break;
                default:
                    item.mediaText = this.$t('timeLine.nonsupportTip');
                    break;
            }
            if (item.mediaUrl) {
                if (!item.mediaUrl.startsWith('http')) {
                    item.mediaUrl = this.insDomain + item.mediaUrl;
                }
            }
            if (item.profilePicUrl) {
                if (!item.profilePicUrl.startsWith('http')) {
                    item.profilePicUrl = this.insDomain + item.profilePicUrl;
                }
            }
            this.msg = item;
        },
        methods: {
            // 图片预览
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
            // 翻译消息
            selectLang(lang, msg) {
                this.targetLang = lang;
                this.translateChat(lang, msg);
            },
            translateChat(lang, msg) {
                this.visible = false;
                // 关闭 Poptip
                if (this.$el.querySelector('.popper-opened.msg-more')) {
                    this.$el.querySelector('.popper-opened.msg-more').click();
                }
                util.ajaxInternational({
                    url: '/translation/translation',
                    method: 'post',
                    data: {
                        requestText: msg.mediaText,
                        targetLang: lang
                    }
                }).then(response => {
                    if (response.data) {
                        const text = response.data.data.translations[0].translatedText;
                        document.getElementById(msg.id).innerHTML = `<div class="text-border">${text}</div>`;
                    }
                });
            },
            // 翻译弹窗显示回调
            popperShow() {
                // instagramItem 的 popContentClick 关闭完所有已打开的翻译弹窗后, 再显示当前翻译弹窗
                setTimeout(() => {
                    this.transPopShow = true;
                });
            },
            // 翻译弹窗关闭回调
            popperHide() {
                this.visible = false;
                this.transPopShow = false;
            }
        }
    };
</script>

<style>
    @import "../../../../xhl-chat/components/chat-item.css";
</style>

<style scoped>
    /*隐藏全屏按钮*/
    video::-webkit-media-controls-fullscreen-button {
        display: none;
    }
</style>
