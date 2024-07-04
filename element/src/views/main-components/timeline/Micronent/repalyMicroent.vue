<template>
    <div  >
        <div class="replayQW" v-if="false" ref="repalyModal">
                <iframe :src="qwUri" ref="replayFrame" :style="{'transform': areaFloat}" frameborder="0" width="1136" height="700"></iframe>
                <div class="loading" v-if="showLoading" v-loading="showLoading"  :element-loading-text="'loading'"></div>
                
                   <!-- 时间轴弹出框话术 pop -->
                <Poptip
                    trigger="click"
                    width="403"
                    placement="top"
                    popper-class="no-padding"
                    :disabled="inputDisabled"
                    ref="verbalPop"
                    @show="handleToggleVerbalPop(true)"
                    @hide="handleToggleVerbalPop(false)">
                <!-- trigger -->
                <span slot="reference"
                      ref="verbalTrigger"
                      class="whatsApp-verbalPop-trigger">.</span>

                <!-- content -->
                <!-- 话术 -->
                <div style="position: relative; height: 280px;">
                    <short-cuts :controVerbalIcon="0"
                                content_height="280px"
                                @letShortcutsShow="triggerVerbalPop"
                                @verbalSelected="handleSelectVerbal"
                                ></short-cuts>
                </div>
            </Poptip>
        </div>
              <!-- 话术 -->
        <dataBaseVue v-show="showDataBase" :dom="$refs.replayFrame" ref="childDatabase" :showDataBase.sync="showDataBase"
                        :selectedChatInfo="selectedChatInfo"
                        :chatWACount="chatWACount"
                        @uploadToQiwei="uploadToQiwei"
                        :currentUserInfo="currentUserInfo">
        </dataBaseVue>
        <Modal
                :title="$t('qywx.plugInTnstallationReminder')"
                :visible.sync="installNow"
                :close-on-click-modal="false"
                :modal-append-to-body="false"
                :close-on-press-escape="false"
                :show-close="true"
                @close="()=>{$emit('closeQWreplay')}"
                top="30vh"
                width="630px">
            <div style="color: #333333;">{{$t('qywx.haveToInstallPlugIn4')}}</div>

            <div style="color: #333333;">{{$t('qywx.haveToInstallPlugIn1')}}</div>
            <div style="color: #333333;">{{$t('qywx.haveToInstallPlugIn2')}}</div>
            <div style="color: #333333;">{{$t('qywx.haveToInstallPlugIn3')}}</div>
            <div slot="footer">
                <Button style="" type="primary" @click="downloadDevtool">
                    {{$t('qywx.installPlugins')}}
                </Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import dataBaseVue from './dataBase.vue';
    import ShortCuts from '@/views/main-components/Shortcuts.vue';
    import { getQWOnlineAccount, getQWContactInfo } from '@/api/microenterprise.js';
    const chromeExtensionDownloadUrl = 'https://chrome.google.com/webstore/detail/%E8%AF%A2%E7%9B%98%E4%BA%91%E6%99%BA%E8%83%BD%E5%8A%A9%E6%89%8B/mgcoclekpjhdpobdgdajbaeiombgkjni?hl=zh-CN';
    export default {
        computed: {
            ...mapState({
                orgId: state => state.enterpriseId,
                window_height: state => state.window_height,
                userId: state => state.userId,
                ElementZindex: state => state.ElementZindex
            }),
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            // 与"我"聊天的 wa 账号
            chatQWAccount() {
                // 群组
                if (this.isGroup) {
                    return this.talkObj.toQwAccount;
                }

                // 单聊
                return this.talkObj.fromMe === 0 ? this.talkObj.fromQwAccount : this.talkObj.toQwAccount;
            },
            userBindQwAccount() {
                return this.talkObj.userBindQwAccount;
            },
            // 是否是群组对话
            isGroup() {
                return `${this.talkObj.chatType}` == '1';
            }
        },
        components: {
            ShortCuts: ShortCuts,
            dataBaseVue: dataBaseVue
        },
        props: {
            talkObj: {
                type: Object,
                default: null
            }
        },
        data() {
            return {
                qwUri: 'https://qywx.leadscloud.com/#/chat?inTimeLine=true',
                // 当前选中联系人的信息
                selectedChatInfo: {},
                areaFloat: '',
                showLoading: true,
                // 话术弹框显隐
                // 翻译相关
                languageList: [
                    {
                        value: 'zh',
                        label: this.$t('lang.zh_CN')
                    },
                    {
                        value: 'zh_TW',
                        label: this.$t('lang.zh_TW')
                    },
                    {
                        value: 'en',
                        label: this.$t('lang.en')
                    },
                    {
                        value: 'es',
                        label: this.$t('lang.es')
                    },
                    {
                        value: 'ru',
                        label: this.$t('lang.ru')
                    },
                    {
                        value: 'ar',
                        label: this.$t('lang.ar')
                    },
                    {
                        value: 'fr',
                        label: this.$t('lang.fr')
                    },
                    {
                        value: 'ja',
                        label: this.$t('lang.ja')
                    },
                    {
                        value: 'ko',
                        label: this.$t('lang.ko')
                    },
                    {
                        value: 'ms',
                        label: this.$t('lang.ms')
                    },
                    {
                        value: 'id',
                        label: this.$t('lang.id')
                    },
                    {
                        value: 'it',
                        label: this.$t('lang.it')
                    },
                    {
                        value: 'vi',
                        label: this.$t('lang.vi')
                    },
                    {
                        value: 'pt',
                        label: this.$t('lang.pt')
                    },
                    {
                        value: 'th',
                        label: this.$t('lang.th')
                    },
                    {
                        value: 'tr',
                        label: this.$t('lang.tr')
                    },
                    {
                        value: 'fa',
                        label: this.$t('lang.persian')
                    },
                    {
                        value: 'de',
                        label: this.$t('lang.de')
                    },
                    {
                        value: 'nl',
                        label: this.$t('lang.nl')
                    },
                    {
                        value: 'sk',
                        label: this.$t('lang.sk')
                    },
                    {
                        value: 'cs',
                        label: this.$t('lang.cs')
                    },
                    {
                        value: 'uk',
                        label: this.$t('lang.uk')
                    },
                    {
                        value: 'iw',
                        label: this.$t('lang.iw')
                    },
                    {
                        value: 'pl',
                        label: this.$t('lang.fa')
                    }
                ],
                installNow: false,
                // 是否打开回复框
                live: false,
                // 话术 pop 显隐状态
                visible_verbalPop: false,
                showDataBase: false,
            };
        },
        mounted() {
            const origin = location.origin;
            if (origin.indexOf('admintest') > -1) {
                // 测试环境域名 默认使用线上域名
                this.qwUri = 'https://qywxtest.xhlbj.cn/#/chat?inTimeLine=true';
            }
            const isInstall = localStorage.getItem('XHL_INSTALL_DEVTOOLS');
            if (isInstall == 'false' || !isInstall) {
                this.installNow = true;
                return false;
            }
            this.isHavePremiss();
        },
        watch: {
            live(val) {
                if (val) {
                    // 打开回复框 发送消息给插件 开始模拟用户行为搜索联系人
                    // console.log(this.$refs,'ElementZindex');
                    this.$nextTick(() => {
                        // this.$refs.repalyModal.style.zIndex = this.ElementZindex -1;
                        this.opened();
                    });
                } else {
                    this.$emit('closeQWreplay');
                    // window.removeEventListener('message', this.handleReceiveMsg);
                }
            }
        },
        methods: {
            // 控制发送消息
            handleSendMsgToRepalyModal(data) {
                const iframe = this.$refs.replayFrame;
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage(data, '*');
                }
            },
            triggerVerbalPop(val) {
                if (!val) {
                    // 关闭
                    this.$refs.verbalPop.doClose();
                }
            },
            // 将资料库文件发送给企微
            uploadToQiwei(data) {
                if (Object.prototype.toString.call(data) === '[object String]') {
                    // 表示此时正在下载文件
                    this.handleSendMsgToRepalyModal({
                        type: 'XHL_ISPROCESSING',
                        data: true
                    });
                } else {
                    // console.error('将资料库文件发送给企微', data);
                    this.handleSendMsgToRepalyModal({
                        type: 'XHL_UPLOAD_TO_QIWEI',
                        data
                    });
                }
            },
            // 回复时间轴被打开
            opened() {
                getQWContactInfo({
                    friendWxid: this.chatQWAccount,
                    robotWxid: this.userBindQwAccount,
                    orgId: this.orgId,
                    userId: this.userId
                    }).then(res => {
                    // console.log(res);
                    if (res.data && res.code == 1) {
                        // remark nickname
                        // 优先使用备注搜索 没有备注则使用昵称搜索
                        this.talkObj.hisName = res.data.remark || res.data.nickname;
                        // this.talkObj.nickName = '赵建堃';
                        // console.log(this.talkObj,'talkobj');
                        // this.showLoadingforframe = false;
                        // 发送消息到企业微信页面，模拟用户进行页面上的搜索 打开企业微信回复框
                        let url = '';
                        if (this.talkObj.chatType == 1) {
                            url = `${this.$router.resolve({
                                name: 'whatsapp_microenterprise'
                            }).href}?chatType=1&hisName=${encodeURI(this.talkObj.hisName)}&toQwAccount=${this.talkObj.toQwAccount}&userBindQwAccount=${this.talkObj.userBindQwAccount}&goon=true`
                        } else if (this.talkObj.chatType == 0) {
                            let toQwAccount = this.talkObj.toQwAccount;
                            if (this.talkObj.fromMe == 0) {
                                toQwAccount = this.talkObj.fromQwAccount;
                            }
                            url = `${this.$router.resolve({
                                name: 'whatsapp_microenterprise'
                            }).href}?chatType=0&hisName=${encodeURI(this.talkObj.hisName)}&toQwAccount=${toQwAccount}&userBindQwAccount=${this.talkObj.userBindQwAccount}&goon=true`
                        }
                        window.open(url, '_blank');
                        this.live = false;
                    } else {
                        this.$Message.error('没有搜索到对应的联系人');
                        this.live = false;
                    }
                });
                // const iframe = this.$refs.replayFrame;
                // iframe.onload = () => {
                //     // console.log(event.target.contentWindow.window.length, 'dddd');
                   
                //     if (event.target.contentWindow.window.length === 0) {
                //         console.log('企微回复弹窗打开失败');
                //         this.live = false;
                //         this.$Message.error('请安装插件之后重试')
                //     }

                //     getQWContactInfo({
                //         friendWxid: this.chatQWAccount,
                //         robotWxid: this.userBindQwAccount,
                //         orgId: this.orgId,
                //         userId: this.userId
                //     }).then(res => {
                //         // console.log(res);
                //         if (res.data && res.code == 1) {
                //             // remark nickname
                //             // 优先使用备注搜索 没有备注则使用昵称搜索
                //             this.talkObj.hisName = res.data.remark || res.data.nickname;
                //             // this.talkObj.nickName = '赵建堃';

                //             console.log(this.talkObj,'talkobj');
                //             // this.showLoadingforframe = false;
                //             // 发送消息到企业微信页面，模拟用户进行页面上的搜索 打开企业微信回复框
                //             this.handleSendMsgToRepalyModal({
                //                 type: 'MOCKSEARCH',
                //                 data: JSON.stringify(this.talkObj)
                //             });
                //         } else {
                //             this.$Message.error('没有搜索到对应的联系人');
                //             this.live = false;
                //         }
                //     });
                    
                //     this.handleSendMsgToRepalyModal({
                //         type: 'XHL_LANGUAGELIST',
                //         data: {
                //             languageList: this.languageList,
                //             userInfo: { orgId: this.orgId, userId: this.userId }
                //         }
                //     });
                //     this.handleSendMsgToRepalyModal({
                //         type: 'XHL_LOGIN_USER_Info',
                //         data: {
                //             orgId: this.orgId,
                //             authorized_button: null,
                //             userId: this.userId
                //         }
                //     });
                //     // 是否有资料库权限,录线索客户权限等
                //     this.handleSendMsgToRepalyModal({
                //         type: 'AUTHORIZED',
                //         data: {
                //             databaseAuthorized: this.isContainsMenu('database')
                //         }
                //     });
                // };
                // window.addEventListener('message', this.handleReceiveMsg);
            },
            // 关闭对话框
            handleClose() {

            },
            // 选择话术
            handleSelectVerbal(item) {
                // 插入文本到输入框
                if (item && item.content) {
                    this.handleSendMsgToRepalyModal({
                        type: 'XHL_INSERT_VERBAL',
                        data: {
                            content: item.content.verbalContent
                        }
                    });
                }
            },
            // 收消息
            handleReceiveMsg(e) {
                console.log(e);
                let data = e.data;
                try {
                    data = JSON.parse(e.data);
                } catch (error) {
                    console.log('handleReceiveMsgjson格式错误34');
                }

                try {
                    const { type } = data;
                    switch (type) {
                        case 'MOVE_FRAME':
                            this.setFrameTranslate(data);
                            break;
                        case 'CLOSE_REPLAYMODAL':
                            // this.$emit('closeQWreplay');
                            this.live = false;
                            break;
                        case 'XHL_TOGGLE_DATABASE_REPLAY':
                            // 切换文件选择的弹窗
                            this.showDataBase = !this.showDataBase;
                            break;
                        case 'XHL_TOGGLE_VERBAL_REPLAYQW':
                            if (this.visible_verbalPop) {
                                // emoji pop 显示中

                                // 关闭
                                this.$refs.verbalPop.doClose();
                            } else {
                                // pop 隐藏中

                                // 显示
                                setTimeout(() => {
                                    this.$refs.verbalTrigger.click();
                                }, 0);
                            }
                            break;
                    }
                } catch (e) {
                    console.error('handleReceiveMsgjson格式错误33');
                }
            },
            // setFrameTranslate 移动frame使得对话框位于弹窗中心
            setFrameTranslate(data) {
                // console.log(data,'datadata');
                this.areaFloat = `translate(${data.data.left},-${data.data.top}px)`;
                this.$nextTick(()=>{
                    this.showLoading = false;
                })
            },
            isEmptyDomWrap() {
                return document.querySelector('.whatsLittleDrew');
            },
            /* 话术 */
            // 记录话术 poptip 显隐状态
            handleToggleVerbalPop(boo) {
                this.visible_verbalPop = boo;
            },
            // 判断有没有打开对话框的权限
            isHavePremiss() {
                getQWOnlineAccount({ orgId: this.orgId, userId: this.userId }).then(res => {
                    // console.log(res.data, this.userBindQwAccount);
                  
                    if (!res.data || res.data.length < 1) {
                        this.$emit('closeQWreplay');
                        this.$Message.error(this.$t('qywx.no_login'));
                        return false;
                    };
                    // 没有绑定账号或者 绑定的企微账号没有登录 直接提示
                    const isLogin = res.data.find(account => {
                        return account.robotWxid == this.userBindQwAccount;
                    });
                    
                    if (!isLogin || isLogin.isOnline != 1) {
                        this.$emit('closeQWreplay');
                        this.$Message.error(this.$t('qywx.no_login'));
                        return false;
                    }



                    // 以上权限都没问题 则直接打开企微回复框
                    this.live = true;
                });
            },
            downloadDevtool() {
                window.open(chromeExtensionDownloadUrl);
            }
        },
        beforeDestroy() {
            window.removeEventListener('message', this.handleReceiveMsg);
        }
    };
</script>

<style lang="less" scoped>
 .loading{
    height: 100%;
    position: absolute !IMPORTANT;
    width: 100%;
    top: 0;
    left: 0;
 }
 .replayQW{
    width: 687px;
    overflow: hidden;
     padding: 0;
    height: 650px;
    z-index: 22;
    position: fixed;
    left: 50%;
    top: 50%;
    background: #fff;
    transform: translate(-50%,-50%);
    border-radius: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3)
 }
 .whatsApp-verbalPop-trigger{
    position: absolute;
    left: 0;
    top: 58%;
 }
</style>
<style lang="less">

</style>
