<template>
    <li :id="`${msg.idClient}-${msg.type}`"
        :class="{
        'u-msg': true,
        'item-me': msg.flow === 'out',
        'item-you': msg.flow === 'in',
        'item-time': msg.type === 'timeTag',
        'item-tip': msg.type === 'tip',
        'session-chat': type === 'session'
    }">
        <!-- 时间标签 -->
        <div v-if="msg.type === 'timeTag'">{{ msg.showText }}</div>
        <!-- 未知类型(没用到) -->
        <div v-else-if="msg.type==='tip'"
             class="tip">{{ msg.showText }}</div>
        <!-- 真正收发的消息 -->
        <div v-else-if="msg.flow === 'in' || msg.flow === 'out'"
             :type="msg.type"
             :idClient="msg.idClient"
             :flow="msg.flow"
             :time="msg.time"
             @click="revocateMsg"
             style="overflow: hidden;text-align: left">
            <!-- 头像 -->
            <a class="msg-head">
                <svg aria-hidden="true"
                     class="chat-svg-avatar">
                    <use v-if="msg.flow === 'out'"
                         :xlink:href="myAvatar"></use>
                    <use v-else
                         :xlink:href="msgInAvatar"></use>
                </svg>
            </a>
            <!-- 文本消息 -->
            <span v-if="msg.type === 'text'"
                  class="msg-text">
                <pre><template v-for="(text, index) in getMatchedArr(msg.showText)"><span v-if="index % 2" v-html="packageLink(text)"></span><template v-else>{{ text }}</template></template></pre>
                <div :id="msg.idClient"></div>
                <!-- 翻译 -->
                <Poptip v-if="msg.type === 'text'"
                        width="150"
                        :options="options"
                        placement="bottom-start"
                        @hide="isShowLanguage = false"
                        class="pop-tip">
                    <!-- v-model="visible" -->
                    <!-- trigger 按钮 -->
                    <Button slot="reference"
                            type="text"
                            icon="el-icon-more"
                            class="msg-more"></Button>
                    <!-- pop 弹窗 -->
                    <div class="api">
                        <div class="poptip-block">
                            <!-- 选择语言 -->
                            <Poptip v-model="visible2"
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
                                    <div v-for="(item, index) in languageList"
                                         :key="index"
                                         @click="selectLang(item.value, msg)"
                                         class="lang-item piwik_ChatSelectLang">{{ item.label }}</div>
                                </div>
                            </Poptip>
                            <!-- 点击翻译 -->
                            <div @click="translateChat(lastTransMemory,msg)"
                                style="white-space: nowrap;"
                                 class="poptip-item piwik_ChatTranslateDialog">{{ $t('chat.translateDialog') }}{{getLastTransLanuage}}</div>
                        </div>
                    </div>
                </Poptip>
            </span>
            <!-- 未知类型(没用到) -->
            <span v-else-if="msg.type==='custom-type1'"
                  ref="mediaMsg"
                  class="msg-text"></span>
            <!-- 未知类型(没用到) -->
            <span v-else-if="msg.type==='custom-type3'"
                  ref="mediaMsg"
                  class="msg-text"></span>
            <!-- 图片消息 -->
            <span v-else-if="msg.type === 'image'"
                  class="msg-text msg-text-img-wrapper">
                <img :src="getImgDownloadUrl(msg.file)"
                     @click.stop="imgPreview($event)"
                     class="msg-img">
            </span>
            <!-- 视频消息(未用到) -->
            <span v-else-if="msg.type === 'video'"
                  class="msg-text"
                  ref="mediaMsg"></span>
            <!-- 音频消息 -->
            <span v-else-if="msg.type === 'audio'"
                  @click="playAudio(msg.audioSrc)"
                  class="msg-text">{{ msg.showText }}</span>
            <!-- 文件消息 -->
            <span v-else-if="msg.type === 'file'"
                  class="msg-text">
                <a :href="`${msg.fileLink}&download=${msg.showText}`"
                   target="_blank">
                    <i class="u-icon icon-file"></i>{{ msg.showText }}
                </a>
            </span>
            <!-- 未知类型(暂未用到) -->
            <span v-else-if="msg.type === 'robot'"
                  :class="{'msg-text': true, 'msg-robot': msg.robotFlow !== 'out' && !isRobot}">
                <div v-if="msg.robotFlow === 'out'">{{ msg.showText }}</div>
                <div v-else-if="msg.subType === 'bot'">
                  <!-- 多次下发的机器人消息 -->
                    <div v-for="(tmsgs, index) in msg.message" :key="index">
                    <!-- 多个机器人模板 -->
                        <div v-for="(tmsg, idx) in tmsgs" :key="idx">
                            <div v-if="tmsg.type === 'text'">
                                <p>{{ tmsg.text }}</p>
                            </div>
                            <div v-else-if="tmsg.type === 'image'">
                                <p>
                                    <img :src="tmsg.url">
                                </p>
                            </div>
                            <div v-else-if="tmsg.type === 'url'">
                                <a :class="tmsg.style"
                                   :href="tmsg.target"
                                   target="_blank">
                                    <div v-if="tmsg.image">
                                        <p v-for="(tmsg2, idx2) in tmsg.image" :key="idx2">
                                          <img :src="tmsg2.url">
                                        </p>
                                    </div>
                                    <div v-if="tmsg.text">
                                        <p v-for="(tmsg2, idx2) in tmsg.text" :key="idx2">{{ tmsg2.text }}</p>
                                    </div>
                                </a>
                            </div>
                            <div v-else-if="tmsg.type === 'block'">
                                <a :target="tmsg.target"
                                   :params="tmsg.params"
                                   @click="sendRobotBlockMsg(tmsg, msg)"
                                   :class="tmsg.style">
                                    <div v-if="tmsg.image">
                                        <p v-for="(tmsg2, idx2) in tmsg.image" :key="idx2">
                                          <img :src="tmsg2.url">
                                        </p>
                                    </div>
                                    <div v-if="tmsg.text">
                                        <p v-for="(tmsg2, idx2) in tmsg.text" :key="idx2">{{ tmsg2.text }}</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else-if="msg.subType === 'faq'">
                    <p>{{ msg.message.answer }}</p>
                </div>
                <span v-if="msg.robotFlow !== 'out' && !isRobot"
                      class="msg-link">
                    <a @click="continueRobotMsg(msg.content.robotAccid)"
                       class="link-right">继续对话</a>
                </span>
            </span>
            <!-- 未知类型(未用到) -->
            <span v-else-if="msg.type === 'notification'"
                  class="msg-text notify">{{msg.showText}}</span>
            <!-- 其他类型 -->
            <span v-else
                  v-text="msg.showText"
                  class="msg-text"></span>

            <!-- 发送失败标识 -->
            <span v-if="msg.status === 'fail'"
                  data-session="msg.sessionId"
                  data-id="msg.idClient"
                  class="msg-error msg-resend">
                <div class="msg-error-icon">!</div>
            </span>
        </div>
    </li>
</template>

<script type="text/javascript">
    import util from '@/libs/util';
    import utils from '@/utils';
    import { mapState } from 'vuex';
    import Vue from 'vue';
    import translateLang from '@/mixins/translateLang';

    export default {
        name: 'chat-item',
        mixins: [translateLang],
        props: {
            type: String, // 类型，chatroom, session
            rawMsg: {
                type: Object,
                default() {
                    return {};
                }
            },
            userInfos: {
                type: Object,
                default() {
                    return {};
                }
            },
            myInfo: {
                type: Object,
                default() {
                    return {};
                }
            },
            isRobot: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            lastTransMemory: {
                type: String,
                default: 'zh'
            }
        },
        computed: {
            ...mapState([
                'nim',
                'currAvatar'
            ]),
            options() {
                const container = document.querySelector('#frame-main');
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
            },
            robotInfos() {
                return this.$store.state.robotInfos;
            },
            msgInAvatar() {
                return this.currAvatar || this.defaultAvatar;
            },
            // 历史翻译语种对照
            getLastTransLanuage() {
                const obj = this.languageList.find(ele => ele.value == this.lastTransMemory);
                if (obj) {
                    return obj.label;
                } else {
                    console.log(obj);
                    console.log(this.lastTransMemory);
                    console.log(this.languageList);
                    console.log(this.languageList.length);
                    console.log(Vue.config.lang);
                    this.lastTransMemory ='zh' 
                    return Vue.config.lang === 'en-US' ? 'Chinese' : '中文';
                }
                // return this.languageList.find(ele => ele.value == this.lastTransMemory).label;
            }
        },
        data() {
            return {
                visible: false,
                visible2: false,
                msg: '',
                myAvatar: '#custom-service-avatar',
                defaultAvatar: '#custom-visitor-avatar',
                isFullImgShow: false,
                currentAudio: null,
                targetLang: 'zh-CN',
                isShowLanguage: false,
                isShowPop: false
            };
        },
        methods: {
            revocateMsg(vNode) {
                // 在会话聊天页
                if (this.$store.state.currSessionId) {
                    if (vNode && vNode.data && vNode.data.attrs) {
                        const attrs = vNode.data.attrs;
                        if (attrs.type === 'robot') {
                            return;
                        }
                        // 自己发的消息
                        if (attrs.flow === 'out') {
                            const that = this;
                            this.$vux.confirm.show({
                                title: '确定需要撤回消息',
                                onCancel() {
                                },
                                onConfirm() {
                                    that.$store.dispatch('revocateMsg', {
                                        idClient: attrs.idClient
                                    });
                                }
                            });
                        }
                    }
                }
            },
            sendRobotBlockMsg(msg, originMsg) {
                let body = '[复杂按钮模板触发消息]';
                if (msg.text && msg.text.length === 1) {
                    body = msg.text[0].text;
                }
                const robotAccid = originMsg.content.robotAccid;
                if (!this.isRobot) {
                    body = `@${this.robotInfos[robotAccid].nick} ${body}`;
                }
                if (this.type === 'session') {
                    this.$store.dispatch('sendRobotMsg', {
                        type: 'link',
                        scene: originMsg.scene,
                        to: originMsg.to,
                        robotAccid,
                        // 机器人后台消息
                        params: msg.params,
                        target: msg.target,
                        // 显示的文本消息
                        body
                    });
                } else if (this.type === 'chatroom') {
                    this.$store.dispatch('sendChatroomRobotMsg', {
                        type: 'link',
                        robotAccid,
                        // 机器人后台消息
                        params: msg.params,
                        target: msg.target,
                        // 显示的文本消息
                        body
                    });
                }
            },
            continueRobotMsg(robotAccid) {
                this.$store.dispatch('continueRobotMsg', robotAccid);
            },
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            },
            getImgDownloadUrl(file) {
                if (this.nim) {
                    return this.nim.packFileDownloadName({
                        url: file.url,
                        name: file.name
                    });
                } else {
                    return file.url;
                }
            },
            playAudio(src) {
                if (!this.currentAudio) {
                    this.currentAudio = new Audio(src);
                    this.currentAudio.play();
                    this.currentAudio.onended = () => {
                        this.currentAudio = null;
                    };
                }
            },
            selectLang(lang, msg) {
                this.targetLang = lang;
                this.isShowLanguage = false;
                this.$emit('update:lastTransMemory', lang);
                this.translateChat(lang, msg);
            },
            translateChat(lang, msg) {
                this.visible = false;
                this.visible2 = false;
                util.ajaxInternational({
                    url: '/translation/translation',
                    method: 'post',
                    data: {
                        requestText: msg.text.replace(/(\r\n|\r|\n)/g, '<br>').replace(/\s/g, '&nbsp;'),
                        targetLang: lang
                    }
                }).then(response => {
                    if (response.data) {
                        const text = response.data.data.translations[0].translatedText;
                        document.getElementById(msg.idClient).innerHTML = `<div class="text-border">${text}</div>`;
                    }
                });
                // 关闭 poptip
                document.body.click();
            },
            // 处理文本信息, 得到 [文本, 链接, 文本...] 格式的数据
            getMatchedArr(str, reg) {
                // 参数合法校验
                if (!reg) {
                    reg = utils.regExp.link;
                }
                if (!str || !reg) {
                    return [];
                }

                let tempStr = str;
                const result = [];
                while (tempStr) {
                    // 查找正则匹配第一个符合条件的字符串(正则不能是 global 匹配, 否则格式不对, 参见 MDN String.protoType.match)
                    const matchArr = tempStr.match(reg);
                    if (Array.isArray(matchArr)) {
                        // 取纯文本
                        result.push(tempStr.slice(0, matchArr.index));
                        // 取正则匹配到的字符串
                        result.push(matchArr[0]);
                        // 删除匹配字符串及其之前的字符, 剩余字符串准备下轮匹配
                        tempStr = tempStr.slice(matchArr.index + matchArr[0].length, tempStr.length);
                    } else {
                        // 未匹配成功, 结束循环
                        result.push(tempStr);
                        tempStr = '';
                    }
                }
                return result;
            },
            // 把 url 转换为 a 标签
            packageLink(url) {
                return `<a href="${url}" target="_blank">${url}</a>`;
            }
        },
        beforeMount() {
            this.$forceUpdate();
            const item = Object.assign({}, this.rawMsg);
            // 标记用户，区分聊天室、普通消息
            if (this.type === 'session') {
                // if (item.flow === 'in') {
                //     console.log(this.$store.state.currAvatar);
                //     item.avatar = this.$store.state.currAvatar ? this.$store.state.currAvatar : this.defaultAvatar;
                //     //                    }
                // } else if (item.flow === 'out') {
                //     item.avatar = this.myAvatar;
                // }
            } else {
                // 标记时间，聊天室中
                item.showTime = utils.formatDate(item.time);
            }
            if (item.type === 'timeTag') {
                // 标记发送的时间
                item.showText = item.text;
            } else if (item.type === 'text') {
                // 文本消息
                item.showText = item.text;
            } else if (item.type === 'custom') {
                // ...
            } else if (item.type === 'image') {
                // 原始图片全屏显示
                item.originLink = item.file.url;
            } else if (item.type === 'video') {
                // ...
            } else if (item.type === 'audio') {
                item.audioSrc = item.file.mp3Url;
                item.showText = `${Math.round(item.file.dur / 1000)}" 点击播放`;
            } else if (item.type === 'file') {
                item.fileLink = item.file.url;
                //                item.showText = utils.escape(item.file.name)
                item.showText = item.file.name;
            } else if (item.type === 'notification') {
                // 对于系统通知，更新下用户信息的状态
                item.showText = utils.generateChatroomSysMsg(item);
            } else if (item.type === 'tip') {
                // 对于系统通知，更新下用户信息的状态
                item.showText = item.tip;
            } else if (item.type === 'robot') {
                // ..
            } else {
                item.showText = `[${utils.mapMsgType(item)}],请到手机或电脑客户端查看`;
            }
            this.msg = item;
        },
        mounted() {
            const item = this.msg;
            // 有时序问题的操作
            this.$nextTick(() => {
                let media = null;
                if (item.type === 'image') {
                    // 图片消息缩略图
                    media = new Image();
                    media.src = `${item.file.url}?imageView&thumbnail=180x0&quality=85`;
                } else if (item.type === 'custom-type1') {
                    // 猜拳消息
                    media = new Image();
                    media.className = 'emoji-middle';
                    media.src = item.imgUrl;
                } else if (item.type === 'custom-type3') {
                    // 贴图表情
                    media = new Image();
                    media.className = 'emoji-big';
                    media.src = item.imgUrl;
                } else if (item.type === 'video') {
                    if (/(mov|mp4|ogg|webm)/i.test(item.file.ext) || /\.(mov|mp4|ogg|webm)$/i.test(item.file.name)) {
                        media = document.createElement('video');
                        media.src = item.file.url;
                        // media.width = 349;
                        // media.height = 480;
                        media.autoStart = false;
                        media.preload = 'metadata';
                        media.controls = 'controls';
                    } else {
                        const aLink = document.createElement('a');
                        aLink.href = item.file.url;
                        aLink.target = '_blank';
                        aLink.innerHTML = `<i class="u-icon icon-file"></i>${item.file.name}`;
                        this.$refs.mediaMsg.appendChild(aLink);
                    }
                }
                if (media) {
                    if (this.$refs.mediaMsg) {
                        this.$refs.mediaMsg.appendChild(media);
                    }
                    media.onload = () => {
                        this.$emit('msg-loaded');
                    };
                    media.onerror = () => {
                        this.$emit('msg-loaded');
                    };
                } else {
                    this.$emit('msg-loaded');
                }
            }); // end this.nextTick
        }
    };
</script>

<style>
    @import "chat-item.css";
</style>
