<template>
    <div class="addAi-create">
        <Modal :visible="visible"
               :title="$t('addAi.title')"
               width="800px"
               class="addAi-modal"
               :show-close="true"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               :append-to-body="true"
               @scroll.native.capture="close_popper"
               @close="closeModal"
               ref="addAiModal">
            <div>
                <span class="addAi-tips" :class="{'englishCls': lang !== 'zh-CN'}">{{$t('addAi.freeTips')}}</span>
                <p class="addAi-little-title">
                    <span>{{$t('addAi.freeInfo')}}</span>
                    <span>{{$t('addAi.sendLimit')}}：{{sendLimit}}</span>
                </p>
            </div>
            <div class="addAi-chat">
                <div v-if="messageList.length === 0" :class="{'addAi-background-miniscreen': window_height < 750, 'englishCls': lang !== 'zh-CN' }" class="addAi-background">
                    <img class="addAi-bgimg" :src="require('@/assets/images/ai-img.png')" alt="" srcset="" width="740px" height="320px">
                    <div  class="addAi-intro">
                        <h1 :class="{'englishCls': lang !== 'zh-CN'}">{{$t('addAi.centerTitle')}}</h1>
                        <div>
                            <div class="addAi-intro-span">
                                <p>1. {{$t('addAi.content1')}}</p>
                                <p>2. {{$t('addAi.content2')}}</p>
                                <p style="margin-bottom: 12px">3. {{$t('addAi.content3')}}</p>
                                <template v-if="lang === 'zh-CN'">
                                    <p>{{$t('addAi.content4')}}<span style="color: #FF752A;font-weight: 600;">{{$t('addAi.content5')}}</span>，{{$t('addAi.content6')}}</p>
                                </template>
                                <template v-else>
                                    <p><span style="color: #FF752A;font-weight: 600;">{{$t('addAi.content5')}}</span>{{$t('addAi.content4')}}，{{$t('addAi.content6')}}</p>
                                </template>
                                <p style="margin-top: 12px">{{$t('addAi.content7')}}</p>
                            </div>
                        </div>
                    </div>
                    <img :src="require('@/assets/images/addai-chatu.png')" alt="" width="168px" height="168px" style="position: absolute;right: 60px;top: 76px;">
                </div>
                <div v-else class="addAi-chat-list" :class="{'addAi-background-miniscreen': window_height < 750}" ref="scrollDiv">
                    <div v-for="(item, index) in messageList" :class="{'addAi-chat-item-send': item.type === 'send', 'addAi-chat-item-get': item.type === 'get'}" :key="index">
                        <template v-if="item.type === 'send'">
                            <div class="addAi-chat-copy-box" v-if="!item.result">
                                <Tooltip transfer :content="$t('addAi.sendError')">
                                    <Icon custom="custom custom-fasongshibai" class="addAi-chat-item-error" size="16"></Icon>
                                </Tooltip>
                            </div>
                            <pre>{{item.content}}</pre>
                            <svg class="addAi-chat-avatar" aria-hidden="true" >
                                <use xlink:href="#custom-service-avatar"></use>
                            </svg>
                            <!-- <img :src="require('@/assets/images/addai-pic.png')" alt=""> -->
                        </template>
                        <template v-if="item.type === 'get'">
                            <img :src="require('@/assets/images/addai-pic.png')" alt="">
                            <pre>{{item.content}}</pre>
                            <div class="addAi-chat-copy-box">
                                <Icon @click="copyContent(item.content)" class="addAi-chat-item-get-copy" custom="custom custom-attachment-copy" size="18"></Icon>
                            </div>
                        </template>
                    </div>
                    <!-- <div class="addAi-chat-item-get">
                        <img :src="require('@/assets/images/addai-pic.png')" alt="">
                        <span>请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电
                            子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章
                            请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章
                            请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章请帮我写一篇电子烟的文章</span>
                    </div> -->
                </div>
                <div class="addAi-tags-box">
                    <div class="addAi-tags">
                        <span v-for="(item, index) in tagsList" :key="index" @click="fillIn(item.content)">{{item.name}}</span>
                        <!-- <span>开发信</span>
                        <span>社交媒体帖子</span>
                        <span>关键词</span>
                        <span>标题</span>
                        <span>文章大纲</span>
                        <span>文章内容</span>
                        <span>翻译</span> -->
                    </div>
                    <div class="addAi-inputMessage">
                        <Input type="textarea"
                            v-model="aiChatInput"
                            :placeholder="$t('addAi.textareaPlaceholder')"
                            resize="none"
                            show-word-limit
                            @keydown.enter.native="inputOnKeyDown"
                            style="color:#333;height: 80px;"
                            class="addAi-Send-text"
                            maxlength="500">
                        </Input>
                    </div>
                </div>
            </div>
            <div slot="footer">
                <Button type="text" class="addAi-link" @click="jumpToLink">{{$t('addAi.linkTitle')}}</Button>
                <template v-if="aiChatInput.length === 0 || sendLimit <= 0 || isSending">
                    <Tooltip transfer v-if="sendLimit <= 0" :content="$t('addAi.limitError')">
                        <Button class="disabledCls piwik_ai_send_btn" style="" type="info">
                        {{$t('addAi.send')}}
                        </Button>
                    </Tooltip>
                    <Button class="piwik_ai_send_btn" v-else-if="isSending" type="primary" loading="true">
                        {{$t('addAi.send')}}
                    </Button>
                    <Button class="disabledCls piwik_ai_send_btn" v-else-if="aiChatInput.length === 0" type="info" :disabled="true">
                        {{$t('addAi.send')}}
                    </Button>
                </template>
                <template v-else>
                    <Button type="primary" class="piwik_ai_send_btn" @click="sendMessage">
                        {{$t('addAi.send')}}
                    </Button>
                </template>
            </div>
            <!-- <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button type="primary" @click="ok" class="piwik_edit_contact" :disabled="loading">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div> -->
        </Modal>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import { getResidueLimit, getChatGdpMessage } from '@/api/addAi';
    import i18n from '@/locale';

    export default {
        name: 'addAi',
        components: {
        },
        props: [
            'visible'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                showUniq: state => state.crm.showUniq,
                allowMerge: state => state.crm.allowMerge,
                selectOptions: state => state.crm.selectOptions,
                socialPlatformIds: state => state.crm.socialPlatformIds,
                window_height: 'window_height'
            }), // 从 vuex 中获取属性
            ...mapGetters([
                // 字段长度校验
                'check_length_default',
                'check_length_custom',
                'contact_items'
            ]),
            table_height() {
                const temp = this.window_height ? this.window_height - 216 : document.body.clientHeight - 216;
                // if (temp < 200) {
                //     temp = 200;
                // }
                console.log('页面高度', temp);
                return temp;
            },
            lang() {
                return i18n.locale;
            }
        },
        data() {
            return {
                sendLimit: 0,
                aiChatInput: '',
                messageList: [],
                isSending: false,
                tagsList: [
                    {
                        name: this.$t('addAi.tagsTitle1'),
                        content: this.$t('addAi.tagsInfo1')
                    },
                    {
                        name: this.$t('addAi.tagsTitle2'),
                        content: this.$t('addAi.tagsInfo2')
                    },
                    {
                        name: this.$t('addAi.tagsTitle3'),
                        content: this.$t('addAi.tagsInfo3')
                    },
                    {
                        name: this.$t('addAi.tagsTitle4'),
                        content: this.$t('addAi.tagsInfo4')
                    },
                    {
                        name: this.$t('addAi.tagsTitle5'),
                        content: this.$t('addAi.tagsInfo5')
                    },
                    {
                        name: this.$t('addAi.tagsTitle6'),
                        content: this.$t('addAi.tagsInfo6')
                    },
                    {
                        name: this.$t('addAi.tagsTitle7'),
                        content: this.$t('addAi.tagsInfo7')
                    },
                    {
                        name: this.$t('addAi.tagsTitle8'),
                        content: this.$t('addAi.tagsInfo8')
                    }
                ],
                /* 全局 */
                cancelFunc: null,
                close_popper: this.$debounce((e) => {
                    if (e && e.target && e.target.classList.contains('el-dialog__body')) {
                        // 关闭 select 下拉选框
                        const selectEl = this.$refs.currentModal.$el.querySelector('.is-focus');
                        if (selectEl) {
                            selectEl.click();
                        }
                    }
                }, undefined, true)
            };
        },
        methods: {
            cancel() {
                this.$emit('update:visible', false);
                this.email_editing = false;
                this.contactPictures = [];
                // 页面回到顶部
                this.$refs.currentModal.$el.querySelector('.el-dialog__body').scrollTop = 0;
            },
            handleReachBottom() {},
            jumpToLink() {
                window.open('https://www.yuque.com/help.leadscloud/faq_guide/ckuqs0mc5r0whozq', '_blank');
            },
            sendMessage() {
                if (this.aiChatInput.length <= 0) return;
                if (this.isSending) return;
                if (this.sendLimit <= 0) {    
                    this.$Message.error('本周免费额度已使用完毕，欢迎下周再来体验功能');
                    return;
                }
                this.messageList.push({
                    content: this.aiChatInput,
                    type: 'send',
                    result: true
                });
                this.$nextTick(() => {
                    const scrollElem = this.$refs.scrollDiv;
                    scrollElem.scrollTo({ top: scrollElem.scrollHeight, behavior: 'smooth' });
                });
                this.isSending = true;
                setTimeout(() => {
                    this.aiChatInput = '';
                }, 100);
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }
                const vm = this;
                const cancelToken = new this.$util.axios.CancelToken(function executor(c) {
                    // An executor function receives a cancel function as a parameter
                    vm.cancelFunc = c;
                });
                getChatGdpMessage({
                    userId: this.userId,
                    orgId: this.enterpriseId,
                    orderMessage: this.aiChatInput,
                    orderMessageLength: this.aiChatInput.length
                }, cancelToken).then(res => {
                    console.log(111, res);
                    this.isSending = false;
                    if (res.code === '1') {
                        this.messageList.push({
                            content: res.data.chatGptMessage,
                            type: 'get'
                        });
                        this.getResidueLimitFun();
                        this.$nextTick(() => {
                            const scrollElem = this.$refs.scrollDiv;
                            scrollElem.scrollTo({ top: scrollElem.scrollHeight, behavior: 'smooth' });
                        });
                    } else {
                        this.messageList[this.messageList.length - 1].result = false;
                        this.$Message.error(res.message);
                    }
                }, res => {
                    this.messageList[this.messageList.length - 1].result = false;
                    this.isSending = false;
                });
            },
            inputOnKeyDown(e) {
                // 回车判断是发送还是换行
                if (e.keyCode === 13) {
                    if (e.ctrlKey || e.shiftKey) {
                        // 换行
                    } else {
                        // 发送
                        e.preventDefault();
                        this.sendMessage();
                    }
                }
            },
            closeModal() {
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }
                this.$emit('update:visible', false);
            },
            fillIn(content) {
                this.aiChatInput = content;
            },
            copyContent(content) {
                const createInput = document.createElement('textarea');
                createInput.value = content;
                document.body.appendChild(createInput);
                createInput.select(); // 选择对象
                document.execCommand('Copy'); // 执行浏览器复制命令
                this.$Message.success('复制成功');
                document.body.removeChild(createInput);
            },
            getResidueLimitFun() {
                getResidueLimit({
                    orgId: this.enterpriseId
                }).then(res => {
                    if (res.code === '1') {
                        this.sendLimit = res.data;
                    } else {
                        this.$Message.error(res.message);
                    }
                });
            }
        },
        created() {
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        this.messageList = [];
                        this.aiChatInput = '';
                        this.isSending = false;
                        this.getResidueLimitFun();
                        this.tagsList = this.tagsList;
                        if (typeof this.cancelFunc === 'function') {
                            this.cancelFunc();
                        }
                    }
                },
                immediate: true
            }
        }
    };
</script>
<style lang="less" scoped>
.addAi-modal{
    /deep/ .el-dialog{
        margin-top: 5vh!important;
    }
    .addAi-tips{
        position: absolute;
        top: 25px;
        left: 93px;
        background: #EA4335;
        border-radius: 10px 10px 10px 0px;
        line-height: 18px;
        padding: 1px 8px;
        color: #fff;
        font-size: 12px;
        &.englishCls{
            left: 137px;
        }
    }
    .addAi-little-title {
        color: #666666;
        font-size: 14px;
        justify-content: space-between;
        display: flex;
        padding: 10px 24px 12px;
    }
    .addAi-chat{
        border: 1px solid #F5F6F9;
        background: #F5F6F9;
        .addAi-tags {
            margin: 0 29px;
            span{
                width: 72px;
                height: 32px;
                border-radius: 4px;
                border: 1px solid #DCDFE5;
                padding: 7px 12px;
                color: rgba(0, 0, 0, 0.8);
                font-size: 12px;
                line-height: 32px;
                margin-right: 12px;
                background: #fff;
                cursor: pointer;
                white-space: nowrap;
            }
        }
        .addAi-background{
            margin: 60px auto 60px;
            padding: 45px 0px 0px;
            &.addAi-background-miniscreen {
                margin: 10px auto 16px;
            }
            &.englishCls{
                padding-top: 30px;
            }
            width: 740px;
            height: 320px;
            position: relative;
            // background: url('~@/assets/images/ai-img.png') no-repeat center center;
            .addAi-bgimg {
                position: absolute;
                top: 0px;
                z-index: 0;
                background: #fff;
                border-radius: 15px;
            }
            .addAi-intro {
                position: relative;
                margin: 0 30px;
                h1{
                    font-size: 22px;
                    line-height: 22px;
                    color: #FF752A;
                    font-weight: 600;
                    margin-bottom: 20px;
                    &.englishCls{
                        margin-bottom: 10px;
                    }
                }
                >div{
                    color: #333333;
                    font-size: 14px;
                    font-weight: 400;
                    display: flex;
                    .addAi-intro-span {
                        width: 449px;
                        margin-right: 37px;
                    }
                }
            }
        }
        .addAi-chat-list {
            height: 440px;
            padding: 20px 24px 0px;
            overflow-y: scroll;
            &.addAi-background-miniscreen{
                height: 346px;
            }
            & > div{
                display: flex;
                margin-bottom: 20px;
                & > pre{
                    padding: 10px;
                    color: #333333;
                    font-size: 14px;
                    line-height: 20px;
                    border-radius: 4px;
                    max-width: 554px;
                    white-space: pre-line;
                    margin: 0px;
                    font-family: inherit;
                }
                img, .addAi-chat-avatar{
                    width: 44px;
                    height: 44px;
                }
            }
            .addAi-chat-item-send{
                justify-content: flex-end;
                .addAi-chat-avatar{
                    margin-left: 16px;
                }
                pre {
                    background: #FFEBE0;
                    border: 1px solid #FBD5BF;
                }
                .addAi-chat-copy-box {
                    position: relative;
                    margin-left: 9px;
                    .addAi-chat-item-error {
                        cursor: pointer;
                        position: absolute;
                        color: #EA4335;
                        bottom: 2px;
                        right: 3px;
                    }
                }
            }
            .addAi-chat-item-get{
                pre{
                    background: #fff;
                    border: 1px solid #EAEAEA;
                }
                img{
                    margin-right: 16px;
                }
                .addAi-chat-copy-box {
                    position: relative;
                    margin-left: 9px;
                    .addAi-chat-item-get-copy {
                        cursor: pointer;
                        position: absolute;
                        color: #7B98B6;
                        bottom: 0px;
                        &:hover{
                            color: #4285F2;
                        }
                    }
                }
            }
        }
        .addAi-inputMessage {
            padding: 8px 24px 0px;
        }
        .addAi-tags-box {
            background: #F5F6F9;
            z-index: 1;
            position: relative;
            padding: 0px;
        }
    }
    .disabledCls {
        padding-left:20px;
        padding-right: 20px;
        background: #e7ecf2;
        border-color: #e7ecf2;
        cursor:default;
        color:rgba(110,129,154,.4);
    }
}
</style>
<style lang="less">
.addAi-modal .el-dialog__header{
    padding: 24px 24px 0px!important;
}
.addAi-modal .el-dialog__body {
    padding: 0px;
}
.addAi-modal .el-dialog__footer {
    background: #F5F6F9;
    padding-top: 12px;
    padding-right: 24px;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    .addAi-link {
        float: left;
        color: #3B78DE;
        font-size: 14px;
        margin-left: 4px;
        margin-top: 10px;
        &:hover{
            color: #2D63BC;
        }
    }
}
.addAi-modal .addAi-Send-text textarea {
    color:#333;
    height: 80px;
    &::placeholder{
        font-size: 14px;
    }
}
</style>
