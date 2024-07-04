<template>
    <div class="write-mail-btns-fix" style="background: #fff;width: 99%;">
        <!-- 发送 -->
        <Tooltip placement="top" transfer :content="sendTip" v-show="sendTip">
            <Button type="info" style="padding-left:20px;padding-right: 20px;background: #e7ecf2;border-color: #e7ecf2;cursor:default;color:rgba(110,129,154,.4);">
                {{$t('mail.writeLetter.send')}}
            </Button>
        </Tooltip>
        <Button :loading="publishLoading" type="primary" @click.stop="handleSendEmail" v-show="!sendTip" style="margin-left: 0;">
            {{$t('mail.writeLetter.send')}}
        </Button>
        <!-- 预览 -->
        <Button class="mail-preview" @click.stop="handlePreview" style="margin-right: 2px;">
            {{$t('mail.writeLetter.preview')}}
        </Button>
        <!-- 保存草稿 -->
        <Button :loading="draftLoading" @click.stop="handleSaveDraft" class="mail-save-draft" style="margin-right: 2px;">{{$t('mail.writeLetter.saveDraft')}}
        </Button>
        <!-- 取消 -->
        <Button @click="handleCancel">
            {{$t('cancel')}}
        </Button>
        <!-- 移到底部的各操作入口 -->
        <div style="display: inline-block;">
            <!-- 签名 -->
            <Dropdown trigger="click" style="margin-left: 20px;cursor: pointer;" placement="bottom-end" @command="handleSignChange">
                <Tooltip placement="top" transfer :content="$t('mail.writeLetter.signature')">
                    <Icon custom="custom custom-qianming" size=16 style="color:#xe911;"/>
                </Tooltip>
                <DropdownMenu slot="dropdown" class="mail_label_drop_down" style="max-height: 400px;overflow: auto;">
                    <DropdownItem v-for="(tag,index) in signatures " :key="index" :command="index" class="mail_label_1">
                        <span class="tag-color" :style="`background-color: ${tag.labelColor};`"></span>
                        <span :title="tag.signName" >{{tag.signName}}</span>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <span style="border-left:1px solid #D8D8D8;margin:0 12px;"></span>
            <!--紧急  暂时注释掉入口，没时间完成 -->
            <!--<Checkbox class="mail-urgent writemail-checkbox" v-model="marketingForm.priority" @change="forceUpdateChange">-->
                <!--{{$t('mail.writeLetter.urgent')}}-->
            <!--</Checkbox>-->
            <!-- 回执  暂时注释掉入口，没时间完成 -->
            <!--<Checkbox  class="mail-receipt writemail-checkbox" v-model="marketingForm.receipt_flag" @change="forceUpdateChange">-->
                <!--{{$t('mail.writeLetter.receipt')}}-->
            <!--</Checkbox>-->
            <!-- 追踪邮件 -->
            <Checkbox class="writemail-checkbox" v-model="marketingForm.mailIsTrace" @change="forceUpdateChange">
                {{$t('mail.writeLetter.tracking')}}
            </Checkbox>
        </div>

        <!-- 点击查看预览营销活动详情 -->
        <mailDetail :visible.sync="previewVisible" :mailContent="mailContent" :filesPreview="filesPreview" :marketingForm="marketingForm"></mailDetail>

        <!-- 关闭新建营销活动页面 -->
        <Modal
                class="modal-footer-margin"
                :visible.sync="confirmCloseVisible"
                :modal-append-to-body="false"
                :close-on-click-modal="false"
                width="360px">
            <p slot="title">
                <span>{{'离开确认'}}</span>
            </p>
            <div>
                <p>{{'您正在编辑内容，是否保存内容至草稿箱？'}}</p>
            </div>
            <div slot="footer">
                <Button @click="confirmCloseVisible = false">{{$t('cancel')}}</Button>
                <Button @click="handleNotSave">{{$t('mail.noSave')}}</Button>
                <Button type="primary" @click="leaveAndSaveDraft" :loading="draftLoading">{{$t('mail.saveDraft')}}</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex';
    import util from '@/libs/util';
    import mailDetail from './../mailDetail.vue';
    export default {
        name: 'footerOperate',
        props: ['currEditor', 'marketingForm', 'sendTip', 'id', 'senders'],
        data() {
            return {
                signatures: [], // 签名列表
                tagList: [],
                actId: this.id,
                defaultMailSetting: {
                    fontFamilyValue: 'arial', // 默认新建营销活动字体
                    fontSizeValue: '16px', // 默认新建营销活动字号
                    fontColorValue: '#000' // 默认新建营销活动颜色
                },
                publishLoading: false,
                draftLoading: false,
                filesPreview: [], // 附件预览
                previewVisible: false,
                mailContent: '',
                confirmCloseVisible: false, // 离开新建营销活动页面
                signatureId: 0, // 签名id
                autoSaveDraftTimer: null // 自动保存草稿定时器标志
            };
        },
        components: { mailDetail },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                qiniuHttp: 'qiniuHttp',
                window_width: 'window_width',
                window_height: 'window_height',
                // 新建营销活动页面富文本编辑器 content_style 配置中会影响邮件内容渲染的样式
                tinymce_contentStyle: state => state.mail.tinymce_contentStyle
            })
        },
        mounted() {
            if (!this.id || this.id === -1) {
                this.getSignaturesByUserId();
            }
            this.autoSaveDraft(); // 自动保存草稿
        },
        methods: {
            /* 点击新建营销活动页面下方的发送按钮的回调 --------------发送按钮----------- */
            handleSendEmail() {
                this.clickButton = 'sendMail';
                let isSurvivorEmail = false;
                if (this.senders.length) {
                    isSurvivorEmail = this.senders.some((item) => item.emailAddress === this.marketingForm.from);
                }
                if (!isSurvivorEmail) {
                    this.$Message.error('当前营销活动所使用的发件人为他人邮箱，请切换为自己的邮箱进行发件');
                    return;
                }
                this.handleSaveEmail(0, false);
            },
            /* 发送邮件前保存邮件信息 */
            saveEmail(data) {
                // 追加 iframe head 中的 style , 避免样式错误
                if (!data.content.startsWith(this.tinymce_contentStyle)) {
                    data.content = this.tinymce_contentStyle + data.content;
                }
                // 点击发送按钮 --- 如果收件人的人数为0，弹出提示语
                let recipients_count = 0;
                data.recipients_from_data.forEach((item) => {
                    recipients_count += item.contactCount;
                });
                if (recipients_count === 0) {
                    this.publishLoading = false;
                    this.draftLoading = false;
                    const str = data.mailIsDraft === 0 ? this.$t('mailMarketing.newMarketing.sendMail') : this.$t('mailMarketing.newMarketing.saveDraft');
                    this.$Message.error(`${this.$t('mailMarketing.newMarketing.selectAddressBookLimit')}${str}`);
                    return;
                }
                // 新建的发送和保存草稿 走add，编辑发送和保存草稿走update
                let dataUrl = '';
                if (data.id) {
                    dataUrl = '/business/marketing/activity/update';
                } else {
                    dataUrl = '/business/marketing/activity/add';
                }
                util.ajaxEmailMarketingJson({
                    url: dataUrl,
                    method: 'post',
                    data
                }).then(async (response) => {
                    if (response.data.code === 1) {
                        /* 邮件信息保存成功后，后端会自行调用真实发邮件的接口，无需前端处理 */
                        if (data.mailIsDraft === 0) {
                            this.publishLoading = false;
                            this.$Notice({
                                iconClass: 'custom custom-sending',
                                title: this.$t('mail.writeLetter.sendingMail')
                            });
                        } else {
                            this.draftLoading = false;
                            this.$Message.success({
                                message: this.autoSaveDraftFlag ? this.$t('mail.autoSaveDraftSuccess') : this.$t('mail.writeLetter.saveSuccTitle'),
                                duration: 3000
                            });
                        }
                        /* 邮件信息保存成功返回营销活动列表, 二次确认弹窗的保存草稿按钮需要返回列表，保存草稿不返回列表 */
                        if (data.mailIsDraft === 0 || this.saveDraftOperateType === 'confirmLeaveModal') {
                            this.handleNotSave();
                        } else {
                            this.actId = response.data.data;
                        }
                    } else if (response.data.code === 2) {
                        this.publishLoading = false;
                        this.$Message.error(this.$t('mailMarketing.newMarketing.remainingEmailsLimit'));
                    } else {
                        if (data.mailIsDraft === 0) {
                            this.publishLoading = false;
                            this.$Notice.error({
                                title: this.$t('mail.writeLetter.sendErrorTitle'),
                                message: response.data.msg
                            });
                        } else {
                            this.draftLoading = false;
                            if (this.autoSaveDraftFlag) {
                                this.$Message.error({
                                    message: response.data.msg,
                                    duration: 3000
                                });
                            } else {
                                this.$Message.error(this.$t('mail.writeLetter.saveFailTitle'));
                            }
                        }
                    }
                }).catch(error => {
                    if (data.mailIsDraft === 0) {
                        this.publishLoading = false;
                        if (/timeout of (\d+)ms exceeded/.test(error.toString())) {
                            this.$Notice.error({
                                title: this.$t('mail.writeLetter.sendTimeoutTitle'),
                                message: this.$t('mail.writeLetter.timeoutDesc')
                            });
                        } else {
                            this.$Notice.error({
                                title: this.$t('mail.writeLetter.sendErrorTitle'),
                                message: this.$t('mail.writeLetter.errorDesc')
                            });
                        }
                    } else {
                        this.draftLoading = false;
                        if (/timeout of (\d+)ms exceeded/.test(error.toString())) {
                            this.$Notice.error({
                                title: this.$t('mail.writeLetter.saveTimeoutTitle'),
                                message: this.$t('mail.writeLetter.timeoutDesc')
                            });
                        } else {
                            if (!this.autoSaveDraftFlag) {
                                this.$Notice.error({
                                    title: this.$t('mail.writeLetter.saveFailTitle'),
                                    message: this.$t('mail.writeLetter.errorDesc')
                                });
                            } else {
                                this.$Message.error({
                                    message: this.$t('mail.autoSaveDraftError'),
                                    duration: 3000
                                });
                            }
                        }
                    }
                });
            },
            /* 预览邮件 --------------------------------------预览-------------------- */
            handlePreview() {
                this.previewVisible = true;
                this.mailContent = this.currEditor.getContent().replace(/<a/g, '<a target="_blank" ');
                this.$emit('getFilesUpload', val => { this.filesPreview = val.fileList; });
            },
            /* 点击新建营销活动页面下方的存草稿按钮的回调 -----------------存草稿--------------- */
            handleSaveDraft() {
                this.clickButton = 'saveDraft';
                this.saveDraftOperateType = 'writeMailFooter';
                this.handleSaveEmail(1, false);
            },
            /* 自动保存草稿 */
            autoSaveDraft() {
                clearInterval(this.autoSaveDraftTimer);
                const vm = this;
                this.autoSaveDraftTimer = setInterval(() => {
                    vm.saveDraftOperateType = 'writeMailFooter';
                    vm.handleSaveEmail(1, true);
                }, 300000);
            },
            /* 点击新建营销活动页面底部的取消按钮时，需要判断是否需要离开确认弹窗 ------------ 取消 --------------------- */
            isNeedShowLeaveTip() {
                const data = this.mailDataFormat(0);
                const activeEditor = this.currEditor;
                const text = activeEditor.getContent({ format: 'text' });
                return data.recipients_from_data.length ||
                    data.actName.length ||
                    data.subject.length ||
                    data.nickname.length ||
                    text.trim().length ||
                    data.mailAttachmentList.length ||
                    /<img[^>]+>/.test(data.content);
            },
            // 点击取消按钮   关闭新建营销活动页面
            handleCancel() {
                if (this.isNeedShowLeaveTip()) {
                    this.confirmCloseVisible = true;
                } else {
                    this.$emit('handleView', 'tableList');
                }
            },
            // 不保存草稿
            handleNotSave() {
                this.$emit('handleView', 'tableList');
            },
            /* 确认离开新建营销活动页面的弹窗中，点击存草稿，执行存草稿的操作成功后，返回营销活动列表 */
            leaveAndSaveDraft() {
                this.saveDraftOperateType = 'confirmLeaveModal';
                this.handleSaveEmail(1, false);
            },
            /* num: 0---发送邮件 or 1---存草稿; flag: true---自动保存草稿 or false---非自动存草稿 */
            handleSaveEmail(num, flag) {
                /* 自动保存的标志更改 */
                let localTime = 0;
                this.autoSaveDraftFlag = flag;
                /* 获取到附件列表 */
                let filesUpload;
                this.$emit('getFilesUpload', val => { filesUpload = val; });
                /* 校验是否存在未上传完成的附件 */
                if (filesUpload.fileList.some(item => { return item.status !== 'finished'; })) {
                    this.$Message.warning(this.$t('mail.uploadFilesUnfinishTip'));
                    return;
                /* 校验附件的大小是否超过 6M */
                } else if (filesUpload.fileSize >= this.max_size * 1024) {
                    this.$Message.warning(`${this.$t('mail.uploadFilesOversizeTip')}${this.max_size / 1024}M`);
                    return;
                }
                // 判断点击的是存草稿还是发送，把对应的loading 设置成true
                if (num) {
                    this.draftLoading = true;
                } else {
                    this.publishLoading = true;
                }
                const data = this.mailDataFormat(num);
                if (num) {
                    if (data.content.length) {
                        data.operateType = this.autoSaveDraftFlag ? 0 : 1;
                        const reg = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
                        if (data.subject && data.subject.match(reg) && data.subject.match(reg).length) {
                            this.$Message.warning(this.$t('mail.writeLetter.subjectCheckTitle'));
                        } else {
                            this.saveEmail(data);
                        }
                    } else {
                        this.draftLoading = false;
                        this.$Notice.warning({
                            title: this.$t('mail.writeLetter.saveWarnTitle'),
                            message: this.$t('mail.writeLetter.saveWarnDesc')
                        });
                    }
                } else {
                    /**
                     * @Description: bug：发送邮件时对邮件内容进行为空校验，包含富文本编辑器默认的一行空格，需要认定为空。【ID1005117】
                     *               解决方案：获取富文本编辑器的纯文本内容。
                     * @author 杨娣
                     * @date 2020/5/19
                     */
                    const activeEditor = this.currEditor;
                    const text = activeEditor.getContent({ format: 'text' });
                    if (data.from.length &&
                        data.recipients_from_data.length &&
                        data.subject.length &&
                        (text.trim().length || /<img[^>]+>/.test(data.content))) {
                        data.operateType = 2;
                        /**
                         * @Description: 配合后端将发件接口拆分为保存邮件信息和发送邮件两个接口实现。当保存邮件信息接口保存成功后，再调用发件接口
                         *               后端开发人员：迟丽超
                         * @author 杨娣
                         * @date 2020/7/14
                         */
                        const reg = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
                        if (data.subject.match(reg) && data.subject.match(reg).length) {
                            this.$Message.warning(this.$t('mail.writeLetter.subjectCheckTitle'));
                        } else {
                            this.saveEmail(data);
                        }
                    } else {
                        this.publishLoading = false;
                        this.$Notice.warning({
                            title: this.$t('mail.writeLetter.sendWarnTitle'),
                            message: this.$t('mail.writeLetter.sendWarnDesc')
                        });
                    }
                }
            },
            /* 签名切换控制   ------------------------------------------签名------------------------ */
            handleSignChange(index) {
                /**
                 * @Description: 解决当新建营销活动页面初始显示为不使用签名的情况下，切换签名不生效的问题
                 * @author 杨娣
                 * @date 2020/6/15
                 */
                let content = this.currEditor.getContent();
                let signatureNew = '';
                let signature = '';
                // 切换签名之前获取 id='signature' 的元素
                const currEditor = tinymce.editors.find(item => item.id === 'vEditor');
                const currDoc = currEditor.iframeElement.contentDocument;
                let currSignNode = currDoc.getElementById('signature');
                if (!currSignNode) {
                    currSignNode = currDoc.getElementById('signatureNew');
                }
                let node_innerHTML = '';
                // 判断当前 id='signature' 的元素内存放的是不是签名内容
                let isSignatureId = false;
                this.signatures.forEach((item, index) => {
                    if (item.id === Number(this.signatureId)) {
                        isSignatureId = true;
                    }
                });
                // 创建一个新的元素存放之前放在 id='signature' 的元素里边的非签名内容，后边需要单独加到签名内容之前
                if (!isSignatureId && currSignNode && currSignNode.innerHTML && currSignNode.innerHTML.trim().length) {
                    node_innerHTML = document.createElement('div');
                    node_innerHTML.innerHTML = currSignNode.innerHTML.trim();
                }
                this.signatureId = (this.signatures[index] && this.signatures[index].id) || '';
                // 添加style目的：避免全局默认字体/字号/颜色设置覆盖签名样式
                if (this.signatures[index].id === '-1') {
                    signatureNew = `${node_innerHTML}<div id="signature">${this.signatures[index].signContent}</div>`;
                    signature = `${node_innerHTML}<div id="signature">${this.signatures[index].signContent}</div>`;
                } else {
                    signatureNew = `${node_innerHTML}<div id="signature" style="color:#000;font-size:16px;font-family:arial">${this.signatures[index].signContent}</div>`;
                    signature = `${node_innerHTML}<div id="signature" style="color:#000;font-size:16px;font-family:arial">${this.signatures[index].signContent}</div>`;
                }
                this.signatureNew = signatureNew;
                this.signature = signature;
                if (this.signChangeCount === 0) {
                    if (currSignNode && this.fromOrToFlag) {
                        // 将 id='signature' 的元素内的所有内容单独插入到 id='signature' 元素前边存放，才会保证插入签名之后，非签名内容不会清空
                        if (node_innerHTML !== '') {
                            currSignNode.parentElement.insertBefore(node_innerHTML,currSignNode);
                        }
                        if (this.signatures[index].id === '-1') {
                            currSignNode.innerHTML = '';
                        } else {
                            currSignNode.innerHTML = `${this.signatures[index].signContent}`;
                        }
                    } else {
                        content = `<div><br></div><div><br></div>${this.signatureNew}${content}`;
                        this.currEditor.resetContent(`<div style="font-family:${this.defaultMailSetting.fontFamilyValue};font-size:${this.defaultMailSetting.fontSizeValue};color:${this.defaultMailSetting.fontColorValue};">${content}</div>`);
                    }
                    this.signChangeCount = this.signChangeCount + 1;
                } else {
                    if (currSignNode) {
                        // 将 id='signature' 的元素内的所有内容单独插入到 id='signature' 元素前边存放，才会保证插入签名之后，非签名内容不会清空
                        if (node_innerHTML !== '') {
                            currSignNode.parentElement.insertBefore(node_innerHTML,currSignNode);
                        }
                        if (this.signatures[index].id === '-1') {
                            currSignNode.innerHTML = '';
                        } else {
                            currSignNode.innerHTML = `${this.signatures[index].signContent}`;
                        }
                    } else {
                        content = `<div><br></div><div><br></div>${this.signatureNew}${content}`;
                        this.currEditor.resetContent(`<div style="font-family:${this.defaultMailSetting.fontFamilyValue};font-size:${this.defaultMailSetting.fontSizeValue};color:${this.defaultMailSetting.fontColorValue};">${content}</div>`);
                    }
                    this.signChangeCount = this.signChangeCount + 1;
                }
                // 切换签名时触发编辑器的获取焦点的方法，获取最新的正文不能为空的提示
                tinymce.editors[0].editorManager.get('vEditor').focus()
                this.mailContent = this.currEditor.getContent();
            },
            /* 通过用户ID获取签名列表 */
            getSignaturesByUserId(signId) {
                util.ajaxMailJson({
                    url: `/mail/mailSigns/${this.$store.state.userId}`,
                    method: 'get'
                }).then(response => {
                    if (response.data.code === 1) {
                        this.signatures = response.data.data;
                        this.signatures.unshift({
                            id: '-1',
                            signName: this.$t('mail.writeLetter.withoutSignature'),
                            signContent: ''
                        });
                        this.initSignature(signId);
                    } else {
                        this.$Message.error(this.$t('mail.writeLetter.signatureErrorTip'));
                    }
                });
            },
            /* 初始化签名 */
            initSignature(signId) {
                util.ajaxMailJson({
                    url: '/mail/generalSetting/createUserId',
                    method: 'get',
                    params: {
                        createUserId: this.$store.state.userId,
                        enterpriseId: this.$store.state.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === 1) {
                        const d = response.data.data;
                        if (signId) {
                            this.signatureId = signId;
                        } else {
                            this.signatureId = d.newMailSignId;
                        }
                        this.signatures.forEach((item, index) => {
                            if (Number(item.id) === Number(this.signatureId)) {
                                this.marketingForm.mailSignIndex = index;
                            }
                        });
                        this.handleSignChange(this.marketingForm.mailSignIndex);
                    } else {
                        this.$Message.error(this.$t('mail.writeLetter.defaultSignErrorTip'));
                    }
                });
            },
            // ----------------------- 底部操作的通用方法 ------------------------------
            /* 邮件数据格式化 */
            mailDataFormat(num) {
                const marketingForm = Object.assign({}, this.marketingForm);
                const time = new Date().getTime();
                Object.keys(marketingForm).forEach(item => {
                    if (typeof marketingForm[item] === 'boolean') {
                        marketingForm[item] = marketingForm[item] ? 1 : 0;
                    }
                });
                // 获取到附件的事件对象，可以渠道附件组件的方法、属性
                let filesUpload;
                this.$emit('getFilesUpload', val => { filesUpload = val; });
                // 更新接口需要传id， 保存草稿之后的邮件会生成id，调的是 updata 接口
                if (this.actId !== -1) {
                    marketingForm.id = this.actId;
                }
                return {
                    ...marketingForm, // 定义好的表单数据
                    mailSignId: this.signatureId, // 签名id
                    content: this.currEditor.getContent(), // 邮件正文
                    traceTimeStamp: time, // 当前系统时间戳
                    mailIsDraft: num, // 确定num代表的值：1保存草稿  0发送
                    contain_attachment_flag: filesUpload.fileList.length ? 1 : 0, // 有没有附件
                    mailAttachmentList: filesUpload.fileList.map((file, index) => {
                        return {
                            fileName: file.name, // 附件名
                            fileOrder: index,
                            filePath: `${this.qiniuHttp}${file.isDataBaseFile ? file.uid : file.response ? file.response.key : ''}`, // 附件路径
                            fileSize: this.sizeConversion(file.size), // 附件大小
                            fileType: file.name.lastIndexOf('.') !== -1 ? file.name.slice(file.name.lastIndexOf('.')) : '' // 附件的类型（后缀）
                        };
                    }),
                    createUserId: this.$store.state.userId, //  用户id
                    createUserName: this.$store.state.fullName, // 用户名称
                    orgId: this.$store.state.enterpriseId, // 企业id
                    mailGroupSendingSingleShowFlag: 2, // 邮件群发单显标识 1是群发单显 0不是 2:EDM发件，固定传2
                };
            },
            /* 附件大小显示格式处理 */
            sizeConversion(size) {
                const result = Number(size);
                if (isNaN(result)) {
                    return size;
                } else {
                    const kiloByte = (result / 1024).toFixed(2);
                    if (kiloByte < 1) {
                        return `${result}Byte(s)`;
                    }
                    const megaByte = (kiloByte / 1024).toFixed(2);
                    if (megaByte < 1) {
                        return `${kiloByte}KB`;
                    }
                    const gigaByte = (megaByte / 1024).toFixed(2);
                    if (gigaByte < 1) {
                        return `${megaByte}MB`;
                    }
                    const teraByte = (gigaByte / 1024).toFixed(2);
                    if (teraByte < 1) {
                        return `${gigaByte}GB`;
                    }
                }
            },
            // 紧急多选框的值改变触发刷新
            forceUpdateChange() {
                this.$forceUpdate();
            }
        },
        watch: {},
        beforeDestroy() {
            clearInterval(this.autoSaveDraftTimer);
        }
    };
</script>
<style lang="less" scoped>
    .write-mail-btns-fix {
        padding-top: 10px;
        padding-bottom: 20px;
        position: fixed;
        bottom: -10px;
        z-index: 1;
        background: #fff;

        .writemail-checkbox {
            margin-right: 12px;
            .el-checkbox__label {
                padding-left: 7px;
            }
        }
    }
</style>
