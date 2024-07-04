<template>
    <div>
        <Modal :visible="visible"
               v-if="visible"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal="false"
               :append-to-body="true"
               :lock-scroll="false"
               :top="'10vh'"
               :width="mail_modal_width"
               ref="currentModal"
               v-dialog-drag
               @close="close"
               :class="[{OkayModal: !isModalFullScreen},{fullScreenModal: isModalFullScreen}]">
            <!--@scroll.native.capture="close_popper"-->

            <div slot="title">
                <span style="margin-right: 5px;max-width: calc(100% - 80px);overflow: hidden;text-overflow: ellipsis; white-space: nowrap; display: inline-block;">{{mailSubject}}</span>

                <span style="cursor: pointer;float: right;padding-right: 40px;" @click.stop="modalFullScreen(false)">
                    <Tooltip placement="top" transfer :content="modalFullScreenTip" v-show="isModalFullScreen">
                        <Icon custom="custom custom-suoxiao1" size='16' style="margin-bottom: 7px;"/>
                    </Tooltip>
                    <Tooltip placement="top" transfer :content="modalFullScreenTip" v-show="!isModalFullScreen">
                        <Icon custom="custom custom-fangda2" size='16' style="margin-bottom: 7px;"/>
                    </Tooltip>
                </span>
            </div>

            <div class="writeMail">
                <WriteMail @cancel="cancel"
                           v-if="showWriteMail"
                           ref="WriteMail"
                           id="mail_detail_modal"
                           :mail_modal_width="mail_modal_width"
                           @getModalSubject="getModalSubject"
                           @modalFullScreen="modalFullScreen"
                           @sendMail="$emit('sendMail')"
                           :mailDetailMailEdit="mailDetailMailEdit"
                           :mailDetailId="mailDetailId"
                           :createUserId="createUserId"
                           :isModalFullScreen="isModalFullScreen"
                           :mailDetailReplyType="mailDetailReplyType"></WriteMail>
            </div>

            <div slot="footer">
            </div>
        </Modal>
    </div>
</template>
<script>
    import WriteMail from './write-mail.vue';
    export default {
        name: 'replyMailModal',
        components: { WriteMail },
        props: {
            visible: {
                type: Boolean
            },
            mailDetailMailEdit: {
                type: Boolean
            },
            mailDetailId: {
                type: String
            },
            createUserId: {
                type: String
            },
            mailDetailReplyType: {
                type: String
            }
        },
        computed: {},
        data() {
            return {
                showWriteMail: false,
                mailSubject: '',
                isModalFullScreen: false,
                mail_modal_width: '860px',
                modalFullScreenTip: '放大'
            };
        },
        mounted() { },
        methods: {
            cancel() {
                this.showWriteMail = false;
                this.$emit('update:visible', false);
                this.$refs.WriteMail.beforeDestroyClose();
            },
            close() {
                this.$refs.WriteMail.handleCancel();
            },
            confirm() {
                this.$emit('update:visible', false);
            },
            getDefaultSetting() {
                // zhaozhan 优化回复邮件弹框的加载速度，解决接口多次调用的问题
                // this.$refs.WriteMail.getDefaultSetting();
                // this.$refs.WriteMail.autoSaveDraft();
            },
            getModalVisible() {
                return this.visible;
            },
            getModalSubject(val) {
                this.mailSubject = val;
            },
            modalFullScreen(isFullScreen) {
                // 控制的是点击快速文本的时候弹窗如果是放大的情况点击快速文本仍然需要保持再放大的状态
                if (isFullScreen && this.isModalFullScreen) return;
                // 触发写信弹窗的全屏展示
                if (this.isModalFullScreen) {
                    this.mail_modal_width = '860px';
                    this.modalFullScreenTip = '放大';
                    this.$refs.WriteMail.textModel = false;
                    // 关闭翻译行
                    this.$refs.WriteMail.translateModel = false;
                } else {
                    const con_width = document.body.offsetWidth;
                    this.mail_modal_width = `${con_width - 60}px`;
                    this.modalFullScreenTip = '缩小';
                }
                this.isModalFullScreen = !this.isModalFullScreen;
            }
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        this.showWriteMail = true;
                    }
                },
                immediate: true
            }
        }
    };
</script>
<style lang="less">
    .writeMail .writeMailModal .el-row{
        position: static;
    }
    .OkayModal{
        .el-dialog{
            .el-dialog__header{
                padding-bottom: 0;
            }
            .el-dialog__body{
                width: 100%;
                max-height:700px;
                overflow: auto;
                padding-top:0;
                .writeMail{
                    .el-dialog{
                        .el-dialog__header{
                            padding-bottom: 10px;
                        }
                        .el-dialog__body{
                            max-height:auto;
                        }
                    }
                }
            }
        }
    }

    .fullScreenModal{
        background: rgba(0, 0, 0, 0.5);
        .el-dialog{
            margin-top:30px!important;
            margin-bottom: 30px;
            height: calc(~'100% - 60px');
            .el-dialog__header{
                padding-bottom: 0;
            }
            .el-dialog__body{
                background:#fff;
                padding-top:0;
                width:100%;
                height: calc(~'100% - 120px');
                overflow-y: auto;
                .writeMail{
                    .el-dialog {
                        margin: 0 auto !important;
                        margin-top: 15vh !important;
                        height: auto;
                        min-height: auto;
                        .el-dialog__body{
                            max-height: 60vh !important;
                            padding-top:10px;
                            width: auto;
                            height: auto;
                        }
                        .el-dialog__header{
                            padding-bottom: 10px;
                        }
                    }
                }
            }
        }
    }

</style>
