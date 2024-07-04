<!--
 * @Description: fb主页评论弹窗中的输入框 --- 为了避免重复代码，抽取成组件
 * @Author: niumkiki
 * @Date: 2020-06-28 18:12:25
 * @LastEditTime: 2020-07-03 18:27:11
 * @LastEditors: niumkiki
-->
<template>
    <div :style="styles" class="comment-area">
        <Input
            id="fbCommentTextArea"
            v-model="message"
            type="textarea"
            :rows="rows"
            :maxlength="200"
            :placeholder="$t('facebook.homepagedynamic.overMessage') + $t('aiToolBar.orPlaceholder')"
            @mouseup.native="onIputSelect"
        ></Input>
        <div style="margin-top: 10px;">
            <div class="input-box-footer-left">
                <Select v-model="language" style="width:106px;margin-right:4px;">
                    <Option v-for="item in languageList"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"></Option>
                </Select>
                <self-upload
                    ref="upload"
                    :show-upload-list="false"
                    :user-type="3"
                    :maxSize="2"
                    action=""
                    :on-success="handleSecUploadSuccess"
                    style="display:inline-block;cursor:pointer;margin-left:20px;">
                    <Icon
                        color="#A9B9C9"
                        class="fbcomment-uploadimg"
                        custom="custom custom-img-manage gtm_facebookUpload"
                        size="19">
                    </Icon>
                </self-upload>
            </div>
            <div class="input-box-footer-right">
                <!-- <Button type="primary" plain @click="cancel">{{$t('cancel')}}</Button>
                <Button
                        type="primary"
                        @click="submitComments(1)"
                        style="margin-left:8px;"
                        :disabled="confirmFlag"
                >{{$t('confirm')}}
                </Button> -->
                <Button
                    :loading="translateLoading1"
                    :disabled="!message"
                    @click="translate(0,commentIndex)">
                    {{$t('facebook.inbox.fbChat.translate')}}
                </Button>
                <Button
                    :disabled="!message"
                    @click="submitComments()"
                    style="margin-left:10px;">
                    {{$t('facebook.inbox.fbChat.send')}}
                </Button>
                <!-- @click="sendReply($event, comment.id,commentIndex,comment.replyMessage)"
                :loading="sendLoading1" -->
            </div>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import translateLang from '@/mixins/translateLang';
    import SelfUpload from '@/views/mail/mail-home/components/write-mail/self-upload';

    // ai tool bar facebook comment
    import { getInputSelectedText, coverText, insertText } from '@/views/ai-toolbar/utils/tools'

    export default {
        mixins: [translateLang],
        components: {
            SelfUpload
        },
        props: [
            'styles',
            'rows',
            'commentIndex',
            'isModalShow'
        ],
        beforeDestroy() {
            console.log('beforeDestroy');
        },
        data() {
            return {
                // 输入框内容
                message: '',
                // 翻译相关
                language: 'en',
                translateLoading1: false // 翻译按钮loading
            };
        },
        computed: {
            ...mapState({
                qiniuHttp: state => state.qiniuHttp
            })
        },
        methods: {
            // 翻译
            translate() {
                this.translateLoading1 = true;
                util.ajaxInternational({
                    url: '/translation/translation',
                    method: 'post',
                    data: {
                        requestText: this.message,
                        targetLang: this.language
                    }
                }).then(response => {
                    const translatedText = response.data.data.translations[0].translatedText;
                    this.translateLoading1 = false;
                    this.message = translatedText;
                });
            },
            // 在评论详情区域评论时上传图片成功
            handleSecUploadSuccess(res, file) {
                const secuploadFileLink = this.qiniuHttp + res.key;
                this.sendLoading1 = true;
                this.$emit('submitComments', '', this.commentIndex, secuploadFileLink);
                // let secuploadFileType = 'FILE';
                // const type = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
                // if (type === '.jpg' || type === '.jpeg' || type === '.png') {
                //     secuploadFileType = 'IMAGE';
                // } else if (type === '.mp3' || type === '.wma') {
                //     secuploadFileType = 'AUDIO';
                // } else if (type === '.mp4' || type === '.rmvb' || type === '.avi' || type === '.ts') {
                //     secuploadFileType = 'VIDEO';
                // }
                // util.ajaxInternational({
                //     url: '/social/comments',
                //     method: 'post',
                //     data: {
                //         id: this.currentId,
                //         accessToken: this.pageAccessToken,
                //         message: '',
                //         pictureUrl: secuploadFileLink
                //     }
                // }).then(async response => {
                //     this.sendLoading1 = false;
                //     if (response.data.code === '1') {
                //         if (this.commentListTmp[this.currentIndex].comments) {
                //             this.commentListTmp[this.currentIndex].comments.data.push({
                //                 commentatorAvatar: this.pageAvatar,
                //                 created_time: response.data.data.commentsTime,
                //                 from: {
                //                     name: this.post.from.name,
                //                     id: this.post.from.id,
                //                     picture: this.pageAvatar
                //                 },
                //                 id: response.data.data.id,
                //                 message: '',
                //                 secReplyModelShow: false,
                //                 attachment: {
                //                     media: {
                //                         image: {
                //                             src: secuploadFileLink
                //                         }
                //                     }
                //                 }
                //             });
                //         } else {
                //             this.commentListTmp[this.currentIndex].comments = {
                //                 data: []
                //             };
                //             this.commentListTmp[this.currentIndex].comments.data.push({
                //                 commentatorAvatar: this.pageAvatar,
                //                 created_time: new Date(),
                //                 from: {
                //                     name: this.post.from.name,
                //                     id: response.data.data.id
                //                 },
                //                 id: response.data.data.id,
                //                 message: '',
                //                 secReplyModelShow: false,
                //                 attachment: {
                //                     media: {
                //                         image: {
                //                             src: secuploadFileLink
                //                         }
                //                     }
                //                 }
                //             });
                //         }
                //         this.$Message.success(this.$t('facebook.inbox.fbComment.commentSucc'));
                //     } else if (response.data.code === '2') {
                //         this.$Message.error(this.$t('inbox.commentFailTip'));
                //     } else {
                //         this.$Message.error(this.$t('facebook.inbox.fbComment.commentFail'));
                //     }
                // });
            },
            submitComments() {
                this.$emit('submitComments', this.message, this.commentIndex);
                this.message = '';
            },

            // ai tool bar
            onIputSelect(e) {
                const result = getInputSelectedText()
                if (result.text) {

                    const insert = (newText, insertStart, insertEnd) => {
                        this.message = newText
                        const subInput = document.getElementById("fbCommentTextArea")
                        subInput.focus()
                        this.$nextTick(() => {
                            subInput.setSelectionRange(insertStart, insertEnd)
                        })
                        this.$aiToolBar.destroy();
                    }

                    this.$aiToolBar.init({
                        type: 'inputBoxSelect',
                        value: result.text,
                        mouseX: e.clientX,
                        mouseY: e.clientY,
                        onCover: (v) => {
                            const newText = coverText(this.message, v, result)
                            insert(newText, result.start, result.start + v.length)
                        },
                        onInsert: (v) => {
                            const newText = insertText(this.message, v, result)
                            insert(newText, result.end, result.end + v.length)
                        }
                    })
                } else {
                    this.$aiToolBar.destroy()
                }
            },
        },
        watch: {
            isModalShow(newValue, oldValue) {
                if (!newValue) {
                    this.language = 'en';
                    this.message = '';
                }
            },

            // ai tool bar
            message(val) {
                if (val.toLowerCase() === '/ai') {
                    this.$aiToolBar.init({
                        type: 'inputBoxSlash',
                        onConfirm: v => {
                            this.$aiToolBar.destroy()
                            this.message = v

                            const subInput = document.getElementById("fbCommentTextArea")
                            subInput.focus()
                            this.$nextTick(() => {
                                subInput.setSelectionRange(0, v.length)
                            })
                        },
                        onAbort: () => {
                            this.message = ''
                        },
                    })
                }else {
                    this.$aiToolBar.destroy()
                }
            } 
        }
    };
</script>

<style lang="less" scoped>
    .comment-area {
        padding: 10px;
        border:1px solid #E8E8E8;
        margin-bottom: 10px;

        /deep/ .el-textarea__inner{
            border: none;
            box-shadow: none;
            -webkit-box-shadow: none;
            padding: 0;
        }
        .input-box-footer-left{
            display: inline-block;
            width: 50%;
        }
        .input-box-footer-right{
            display: inline-block;
            width: 50%;
            text-align: right;
        }
    }
</style>
