<template>
    <div>
        <Modal :title="$t('material.tableLabel.SelectshareMethod')" :visible.sync="dialogVisible" :modal-append-to-body="false" width="450px"
               :before-close="handleClose">
            <div class="cloud-modal-wrapper">
                <div class="cloud-modal-icon">
                    <div class="_f _c _a_c _avency">
                        <div class="cloud-modal-circle cloud-modal-facebook facebook_btn" @click="toFacebook">
                            <svg class="svg-icon" aria-hidden="true">
                                <use xlink:href="#custom-Facebook"></use>
                            </svg>
                        </div>
                        <div class="cloud_icon_margin">
                            <span class="facebook__bottom">FaceBook</span>
                        </div>
                    </div>
                    <div class="_f _c _a_c _avency">
                        <div class="cloud-modal-circle cloud-modal-fbmessenger" @click="toFbMessenger">
                            <svg class="svg-icon" aria-hidden="true">
                                <use xlink:href="#custom-Fb-messenger"></use>
                            </svg>
                        </div>
                        <div class="cloud_icon_margin">
                            <span class="facebook__bottom">Messenger</span>
                        </div>
                    </div>
                    <div class="_f _c _a_c _avency">
                        <div class="cloud-modal-circle cloud-modal-whatsapp" @click="toWhatsApp">
                            <Icon custom="custom custom-WhatsApp1" size="18"
                                  style="cursor: pointer;color:#39C34C;"></Icon>
                        </div>
                        <div class="cloud_icon_margin">
                            <span class="facebook__bottom">WhatsApp</span>
                        </div>
                    </div>
                    <div class="_f _c _a_c _avency">
                        <div class="cloud-modal-circle cloud-modal-email" @click="toEmail">
                            <Icon custom="custom custom-email" size="12" style="cursor: pointer;color:#677F99;"></Icon>
                        </div>
                        <div class="cloud_icon_margin">
                            <span class="facebook__bottom">邮件</span>
                        </div>
                    </div>
                </div>
                <div class="cloud-modal-text" v-if="!hasChatAuthority">*尚未开通聊天权限，如有客户来访，将由客服接待</div>
            </div>
        </Modal>
        <!--邮件分享弹窗-->
        <Modal :visible.sync="dialogMailVisible" :modal-append-to-body="false" width="640px"
               :before-close="handleShareClose">
            <div slot="title" class="dialog-title">
                <span>邮件分享</span>
                <Tooltip class="item" effect="dark" content="每次最多发送30人, 每天最多发送3次" placement="top">
                    <Icon style="margin-left: 10px;vertical-align: text-bottom"
                          class="custom custom-question-tip"></Icon>
                </Tooltip>
            </div>
            <Form :model="emailForm" label-width="80px">
                <FormItem label="发件人" required>
                    <Select v-model="emailForm.from" placeholder="请选择" style="width: 480px;">
                        <Option v-for="(item, index) in senders" :key="index" :label="item.emailAddress"
                                :value="item.emailAddress"></Option>
                    </Select>
                    <span class="addContacts" :style="$lang === 'en-US' ? 'left: 70px;': 'left: 50px;'"
                          style="margin-left: 10px" @click="toEmailSet">
            <Icon v-if="senders.length === 0" class="operate_ico" custom="custom custom-admin-view"
                  style="font-size: 14px;color: #677F99;cursor: pointer"></Icon>
          </span>
                </FormItem>
                <FormItem label="收件人" required>
          <span class="addContacts" :style="$lang === 'en-US' ? 'left: 70px;': 'left: 50px;'" @click="addContacts()">
            <Icon custom="custom custom-add" size='12'/>
          </span>
                    <AdInput fromFlag="writeMail" class="mail-tag-input" @addTag="addEmail"
                             :taglist.sync="emailForm.recipients_to" :title="$t('mail.writeLetter.recipients')"
                             :type="'to'" v-bind="$attrs" v-on="$listeners">
                    </AdInput>
                </FormItem>
                <FormItem label="标题" required>
                    <Input v-model="emailForm.title" style="width: 480px;"></Input>
                </FormItem>
                <FormItem label="内容">
                    <span slot="label"> <span style="margin-left: 10px;"></span>内容</span>
                    <div class="cloud-modal-map">
                        <img v-if="ruleForm.portrait" class="cloud-modal-report" :src="ruleForm.portrait">
                        <img v-else class="cloud-modal-report" src="./images/report_big.png">
                        <span class="cloud-modal-com">{{ domainUrl }}</span>
                        <span class="cloud-modal-title-one">{{ ruleForm.title }}</span>
                        <pre class="cloud-modal-text-one">{{ ruleForm.des }}</pre>
                        <!-- <pre class="cloud-modal-text-one-nostyle" v-html="mailContent"></pre> -->
                        
                    </div>
                </FormItem>
            </Form>
            <div slot="footer" class="dialog-footer">
                <Button class="dialog-footer-cancel is-plain" @click="dialogEmailCancel">取消</Button>
                <Button type="primary" class="dialog-footer-commit share_email" :loading="loadingBtn"
                        :disabled="loadingBtn" @click="dialogEmailCommit">发送
                </Button>
            </div>
        </Modal>
        <!--WhatsApp分享弹窗-->
        <Modal title="分享到WhatsApp" :visible.sync="WhatsAppVisible" :modal-append-to-body="false" width="740px"
               height="630px" :before-close="handleShareClose">
            <div class="cloud-push-whatsapp-wrapper">
                <div class="cloud-whatsapp-head">
                    <!-- <div class="cloud-push-contacts">
                      <span class="cloud-push-text">联系人列表</span>
                      <Checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</Checkbox>
                    </div> -->
                    <template v-if="whatsAppAccountInfo && whatsAppAccountInfo.whatsappAccount">
                        <div :class="{ 'cursor-pointer': ownAccountInfoList.length > 0 }"
                             style="display: flex;align-items: center;margin-bottom: 10px;">
                            <!-- 头像 -->
                            <div @click.stop="triggerAccountPop">
                                <Avatar v-if="whatsAppAccountInfo.whatsappAvatar" :src="whatsAppAccountInfo.whatsappAvatar" class="avatar-small" />
                                <svg v-else class="chat-svg-avatar" aria-hidden="true">
                                    <use xlink:href="#custom-visitor-avatar"></use>
                                </svg>
                            </div>

                            <!-- 名称 -->
                            <TooltipAuto :key="whatsAppAccountInfo.whatsappAccount"
                                         :content="whatsAppAccountInfo.whatsappName || toggleWAAccount(whatsAppAccountInfo.whatsappAccount)"
                                         transfer
                                         class="chat-name-tooltip">
                                <div @click.stop="triggerAccountPop"
                                     class="brand-page-name">{{ whatsAppAccountInfo.whatsappName || toggleWAAccount(whatsAppAccountInfo.whatsappAccount) }}</div>
                            </TooltipAuto>

                            <!-- 多账号切换下拉 -->
                            <Poptip :disabled="ownAccountInfoList.length <= 0"
                                    trigger="click"
                                    transfer
                                    placement="bottom"
                                    popper-class="ownWaAccount-popper"
                                    ref="accountPop">
                                <div slot="reference"
                                     ref="accountPopRef">
                                    <!-- 下拉按钮 -->
                                    <template v-if="ownAccountInfoList.length">
                                        <Icon custom="custom custom-menu-arrow"
                                              color="#7B98B6"
                                              size="10"></Icon>
                                    </template>
                                </div>

                                <!-- 账号容器 -->
                                <div class="ownWaAccount-list">
                                    <!-- 账号 -->
                                    <div v-for="ownAccountInfo in ownAccountInfoList"
                                         @click="checkOwnWAAccount(ownAccountInfo)"
                                         class="ownWaAccount-item">
                                        <!-- 头像 -->
                                        <div class="ownWaAccount-avatar">
                                            <Avatar v-if="ownAccountInfo.whatsappAvatar"
                                                    :src="ownAccountInfo.whatsappAvatar"
                                                    class="avatar-small" />
                                            <svg v-else
                                                 aria-hidden="true"
                                                 class="chat-svg-avatar">
                                                <use xlink:href="#custom-visitor-avatar"></use>
                                            </svg>
                                        </div>

                                        <!-- 名称 + 在线状态 -->
                                        <div class="ownWaAccount-nickInfo">
                                            <!-- 账号名 -->
                                            <TooltipAuto :key="ownAccountInfo.whatsappAccount"
                                                         :content="ownAccountInfo.whatsappName || toggleWAAccount(ownAccountInfo.whatsappAccount)"
                                                         transfer
                                                         class="ownWaAccount-nick">{{ ownAccountInfo.whatsappName || toggleWAAccount(ownAccountInfo.whatsappAccount) }}</TooltipAuto>
                                        </div>
                                    </div>
                                </div>
                            </Poptip>
                        </div>

                        <!-- 搜索框 -->
                        <div style="width: 100%;line-height: 32px;box-sizing: border-box;padding-right: 10px;margin-bottom: 20px">
                            <ElInput v-model="whatsAppSearch"
                                     size="mini"
                                     clearable
                                     @keyup.enter.native="virtualClick('MaterialsWhatsAppSearch')"
                                     @clear="whatsAppSearchMethod">
                                <span slot="append"
                                      ref="MaterialsWhatsAppSearch"
                                      @click="whatsAppSearchMethod"
                                      class="piwik_materials_whatsApp_search">
                                    <Icon custom="custom custom-search" size="15" style="cursor:pointer;"/>
                                </span>
                            </ElInput>
                        </div>

                        <!-- 联系人列表 -->
                        <div class="cloud-push-contacts">
                            <span class="cloud-push-text">联系人列表</span>
                            <Checkbox v-model="checkAll" :indeterminate="isIndeterminate"
                                      @change="handleCheckAllChange">全选
                            </Checkbox>
                        </div>
                        <div class="cloud-push-list">
                            <div class="el-checkbox-group">
                                <Checkbox v-for="(contact, index) in contactList" v-model="contact.checked"
                                          :checked="contact.checked" :key="contact.contactWaAccount"
                                          @change="wsChangeChecked(contact.checked,index,contact)">
                                    <Avatar v-if="contact.contactWaAvatar" :src="contact.contactWaAvatar"
                                            class="chat-svg-avatar"/>
                                    <svg v-else class="chat-svg-avatar" aria-hidden="true">
                                        <use xlink:href="#custom-visitor-avatar"></use>
                                    </svg>
                                    <span v-if="contact.contactWaName"
                                          class="cloud-contact-name">{{ contact.contactWaName }}</span>
                                    <span v-else
                                          class="cloud-contact-name">{{ toggleWAAccount(contact.contactWaAccount) }}</span>
                                </Checkbox>
                            </div>
                            <!-- <CheckboxGroup v-model="checkList" @change="handleCheckedsChange">
                              <Checkbox v-for="contact in contactList" :index="contact.id.toString()" :key="contact.id" :label="contact">
                                <Avatar v-if="contact.contactWaAvatar" :src="contact.contactWaAvatar" class="chat-svg-avatar" />
                                <svg v-else class="chat-svg-avatar" aria-hidden="true">
                                  <use xlink:href="#custom-visitor-avatar"></use>
                                </svg>
                                <span v-if="contact.contactWaName" class="cloud-contact-name">{{contact.contactWaName}}</span>
                                <span v-else class="cloud-contact-name">{{toggleWAAccount(contact.contactWaAccount)}}</span>
                              </Checkbox>
                            </CheckboxGroup> -->
                        </div>
                    </template>
                    <template v-else>
                        <div class="cloud-push-contacts">
                            <span class="cloud-push-text">联系人列表</span>
                        </div>
                        <div class="cloud-push-list">
                            <div style="width: 100%;text-align:center;font-size:12px;line-height: 80px">
                                当前账号未登录WhatsApp
                            </div>
                            <div style="width: 100%;text-align:center">
                                <Button type="primary" class="dialog-footer-commit share_whatsapp" @click="goToLogin">
                                    去登录
                                </Button>
                            </div>
                        </div>
                    </template>
                </div>
                <div class="cloud-push-whatsapp-preview">
                    <div class="cloud-push-whatsapp-preview-title _f _r _j_w"
                         style="width:420px;margin: 0;height:60px;overflow:auto">
                        <div v-for="tag in cacheCheckList" :key="tag.contactWaAccount" style="margin: 0 5px 5px 0">
                            <Tag closable size="mini" type="info" @close="removeCacheCheckList(tag)">
                                {{ tag.contactWaName || toggleWAAccount(tag.contactWaAccount) }}
                            </Tag>
                        </div>
                    </div>
                    <div
                        style="width:420px;margin-top:10px;margin-bottom:16px;height: 1px;background-color:#eaeaea"></div>
                    <div class="cloud-push-whatsapp-preview-title">
                        分享预览
                    </div>
                    <div class="cloud-modal-map">
                        <img v-if="ruleForm.portrait" class="cloud-modal-report" :src="ruleForm.portrait">
                        <img v-else class="cloud-modal-report" src="./images/report_big.png">
                        <span class="cloud-modal-com">{{ domainUrl }}</span>
                        <span class="cloud-modal-title-one">{{ ruleForm.title }}</span>
                        <pre class="cloud-modal-text-one">{{ ruleForm.des }}</pre>
                        <!-- <pre class="cloud-modal-text-one-nostyle" v-html="mailContent"></pre> -->
                    </div>
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <Button class="dialog-footer-cancel is-plain" @click="dialogWhatsappCancel">取消</Button>
                <Button type="primary" class="dialog-footer-commit share_whatsapp" :loading="loadingBtn"
                        :disabled="loadingBtn || !cacheCheckList.length" @click="dialogWhatsappCommit">发送
                </Button>
            </div>
        </Modal>
        <!--选择邮箱联系人-->
        <AddContact :visible.sync="contactsModel" :addContactList.sync="addContactList" :showTabs="showTabs"
                    v-if="contactsModel" @changeContactsModel="getAddressMsg">

        </AddContact>
        <!-- 智能物料链接复制-->
        <Modal :visible.sync="copyVisible" :modal-append-to-body="false" width="450px" :before-close="handleCopyClose">
            <div class="cloud-modal-copy-wrapper">
                <p class="modal-copy-p1">智能物料链接已复制</p>
                <p class="modal-copy-p2"> Share a new product material with you</p>
                <p class="modal-copy-p2">{{ currUrl }}</p>
                <div class="cloud-preview-button messager_copy" @click="openFbMessage">
                    <icon class="custom custom-wangzhi" style="color:#FFFFFF;font-size: 18px;"></icon>
                    <span class="modal-copy-button">去Messenger粘贴给好友</span>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script>
/**
 * @Description: 产品确认，智能物料的写信通讯录弹窗，与邮件管理的写信通讯录弹窗逻辑保持完全一致(仅仅是Tab项不同);
 *               为避免再次发生邮件管理写信通讯录弹窗优化逻辑，导致智能物料产生bug的情况，此处将引用的组件改为同一个文件，
 *               使用showTabs变量控制需要显示的Tab项。原智能物料的通讯录弹窗组件弃用。望知悉。
 * @author 杨娣
 * @date 2020/8/4
 */
    import AddContact from '@/views/mail/mail-home/components/write-mail/Modal/address_book_modal';
    import AdInput from './addressee-input';
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import { getWaUserBind, getAllLoggedAccount } from '@/api/whatsapp';

    export default {
        name: 'share',
        props: ['dialogVisible'],
        components: {
            AddContact,
            AdInput
        },
        data() {
            return {
                whatsAppSearch: '',
                cacheCheckList: [],
                // 当前用户已登录的 wa 账号
                ownWhatsAppAccountList: [],
                whatsAppAccountInfo: {}, // 当前用户登录的WA账号信息
                isIndeterminate: false,
                contactList: [], // 当前登录WA账号的通讯录列表
                checkList: [],
                checkAll: false,
                loadingBtn: false,
                timerOut: null,
                ruleForm: {
                    title: '',
                    des: '',
                    portrait: 'https://content.leadscloud.com/FjIk9U8rVHGGRAWZHXRHkIxbiYIY'
                },
                rules: {
                    title: [
                        { required: true, message: '请输入标题名称', trigger: 'blur' },
                        {
                            min: 1,
                            max: 300,
                            message: '长度在 1 到 300 个字符',
                            trigger: 'blur'
                        }
                    ],
                    des: [
                        { required: true, message: '请输入描述', trigger: 'blur' },
                        {
                            min: 1,
                            max: 300,
                            message: '长度在 1 到 300 个字符',
                            trigger: 'blur'
                        }
                    ]
                },
                previewModel: false,
                selectFileModal: false,
                checked: false,
                dialogShareVisible: false,
                WhatsAppVisible: false,
                dialogMailVisible: false,
                contactsModel: false,
                copyVisible: false,
                addContactList: [], // 添加联系人列表
                data: {},
                facebookUrl: '',
                senders: [], // 发件人账号列表
                emailForm: {
                    from: '', // 发件人账号
                    recipients_to: [], // 收件人
                    message: '',
                    title: ''
                },
                dialogForm: {
                    addressee: '',
                    message: ''
                },
                receiveMailAddress: [], // 收件人地址
                id: '',
                domainUrl: '',
                hasChatAuthority: true, // 聊天权限
                senderIndex: null, // 发件人列表索引
                recieverFollowUpConditionList: [], // 发信给后端传，关联线索和询盘跟进
                currUrl: '',
                showTabs: ['clue_contact', 'customer_contact'], // 由于智能物料与邮件管理的AddContact组件为完全复用关系，此变量用于控制通讯录弹窗中显示的Tab项。
                // mailContent: ''
            };
        },
        computed: {
            ...mapState({
                qiniuHttp: state => state.qiniuHttp,
                orgId: state => state.enterpriseId,
                userId: state => state.userId,
                $lang: state => state.app.lang
            }),
            ...mapGetters(['isContainsMenu']),
            // 当前 userId 所有 wa 账号数据, 去掉当前显示的 wa 号码
            ownAccountInfoList() {
                return this.ownWhatsAppAccountList.filter(item => item.whatsappAccount !== this.whatsAppAccountInfo.whatsappAccount);
            }
        },
        beforeDestroy() {
            clearTimeout(this.timerOut);
            this.timerOut = null;
        },
        methods: {
            virtualClick(ref) {
                if (!this.$refs[ref]) return false;
                this.$refs[ref].click();
            },
            updateCacheCheckList(node) {
                if (!node) return false;
                if (Array.isArray(node)) {
                    const cacheCheckList = this.cacheCheckList;
                    node.forEach(v => {
                        const index = cacheCheckList.findIndex(m => m.contactWaAccount === v.contactWaAccount);
                        if (index === -1 && v.checked === true) cacheCheckList.push(v);
                        if (index > -1 && v.checked === false) cacheCheckList.splice(index, 1);
                    });
                    this.cacheCheckList = cacheCheckList;
                } else {
                    const index = this.cacheCheckList.findIndex(v => v.contactWaAccount === node.contactWaAccount);
                    if (index === -1 && node.checked === true) this.cacheCheckList.push(node);
                    if (index > -1 && node.checked === false) this.cacheCheckList.splice(index, 1);
                }
                console.log('updateCacheCheckList    cacheCheckList', this.cacheCheckList);
            },
            removeCacheCheckList(item) {
                if (this.contactList.some(v => v.contactWaAccount === item.contactWaAccount)) {
                    for (let index = 0; index < this.contactList.length; index++) {
                        if (this.contactList[index].contactWaAccount === item.contactWaAccount) {
                            this.contactList[index].checked = false;
                            break;
                        }
                    }
                } else {
                    item.checked = false;
                }
                this.updateCacheCheckList(item);
                this.updateCheckAllStatus();
            },
            handleCheckAllChange(val) {
                this.contactList.forEach(v => {
                    v.checked = val;
                });
                this.isIndeterminate = false;
                this.updateCacheCheckList(this.contactList);
            },
            handleCheckedsChange(value, b, c) {
            },
            updateCheckAllStatus() {
                // 更新全选状态 UI
                const checkedCount = this.contactList.filter(v => v.checked === true).length;
                this.checkAll = checkedCount === this.contactList.length;
                this.isIndeterminate =
                    checkedCount > 0 && checkedCount < this.contactList.length;
            },
            wsChangeChecked(status, index, item) {
                this.updateCacheCheckList(item);
                this.updateCheckAllStatus();
            },
            async whatsAppSearchMethod() {
                const { data } = await util
                    .ajaxWAJson({
                        url: '/whatsapp/contact/page',
                        method: 'POST',
                        data: {
                            orgId: this.orgId,
                            page: 1,
                            queryKeyWords: this.whatsAppSearch || '',
                            size: 1999,
                            userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                            userId: this.userId
                        }
                    });
                if (data && data.code === 1) {
                    this.contactList = [];
                    this.checkList = [];
                    this.$nextTick(function() {
                        const contactList = (data.data.content || []);
                        contactList.forEach(node => {
                            node.checked = this.cacheCheckList.some(v => v.contactWaAccount === node.contactWaAccount);
                        });
                        this.contactList = contactList;
                        this.updateCheckAllStatus();
                    });
                }
            },
            // 判断当前用户是否拥有WA设置的功能权限，有则跳转至登录页面，反之提示用户无权限
            goToLogin() {
                const canGoToLogin = this.isContainsMenu('whatsapp_chat');
                if (canGoToLogin) {
                    // 跳转 wa 界面
                    window.open(this.$router.resolve({
                        name: 'whatsapp_chat'
                    }).href, '_blank');
                } else {
                    this.$Message.warning(this.$t('waNumberSearch.error_noWaMenuAuthority'));
                }
            },
            // 获取分享预览的详细信息
            getshareMsg(id, hasChatAuthority) {
                // 获取分享预览详情时,清空wa选中人员
                this.cacheCheckList.length = 0;

                this.hasChatAuthority = hasChatAuthority;
                console.log('hasChatAuthority2', this.hasChatAuthority);
                this.id = id;
                const data = {
                    id: id
                };
                util
                    .ajax233({
                        url: '/push/getPush',
                        method: 'post',
                        data: data
                    })
                    .then(res => {
                        if (res.data.code === '1') {
                            this.data = res.data.data;
                            this.ruleForm.title = this.data.title;
                            this.ruleForm.des = this.data.description;
                            this.ruleForm.portrait = this.data.image;
                            // this.mailContent = this.data.editStyle;
                        } else {
                            this.$Message.error(res.data.message);
                        }
                    });
            },
            // 关闭分享方式弹窗
            handleClose() {
                this.$emit('changeShareModel', false);
                // 返回列表页
                this.$emit('toHomePage', 0);
                clearTimeout(this.timerOut);
            },
            handleShareClose() {
                // 关闭WhatsApp弹窗
                this.WhatsAppVisible = false;
                // 关闭邮件弹窗
                this.dialogMailVisible = false;
                // 返回列表页
                console.log('libiao');
                this.$emit('toHomePage', 0);
                // 刷新分享表格数据
                this.$emit('toRefreshPage', 0);
                clearTimeout(this.timerOut);
            },
            getAddressMsg(data) {
                // 选择联系人弹窗
                this.contactsModel = data;
                // 邮件分享弹窗
                this.dialogMailVisible = true;
            },
            // 获取文件的详细信息
            getShortUrl(type) {
                const data = {
                    shareId: this.id,
                    type: type
                };
                return new Promise((resolve, reject) => {
                    util
                        .ajax233({
                            url: '/push/getShortUrl',
                            method: 'post',
                            data: data
                        })
                        .then(res => {
                            if (res.data.code === '1') {
                                if (type === 'email') {
                                    this.dialogMailVisible = true;
                                } else if (type === 'whatsApp') {
                                    // 初始化勾选
                                    this.checkAll = false;
                                    this.checkList = [];
                                    this.isIndeterminate = false;
                                    this.WhatsAppVisible = true;
                                }
                                console.log('1111111');
                                resolve(res.data.data);
                            } else if (res.data.code === '-30051') {
                                this.$confirm('域名配置尚未完成，不能完成分享。', '提示', {
                                    confirmButtonText: '确定',
                                    showCancelButton: false,
                                    type: 'warning'
                                })
                                    .then(() => {
                                    })
                                    .catch(() => {
                                    });
                            } else {
                                this.$Message.error(res.data.message);
                            }
                        });
                });
            },
            async toFacebook() {
                // 关闭选择分享方式弹窗
                this.$emit('changeShareModel', false);
                const shortData = await this.getShortUrl('facebook');
                window.open(`https://www.facebook.com/dialog/share?app_id=${shortData.appId}&display=page&href=${shortData.shortUrl}&redirect_uri=https%3A%2F%2Fwww.facebook.com`);
                // 返回列表页
                this.$emit('toHomePage', 0);
                // 刷新分享表格数据
                this.$emit('toRefreshPage', 0);
            },
            async toFbMessenger() {
                // 关闭选择分享方式弹窗
                this.$emit('changeShareModel', false);
                const shortData = await this.getShortUrl('messenger');
                console.log('****', shortData.shortUrl);
                this.currUrl = shortData.shortUrl;
                const createInput = document.createElement('textarea');
                createInput.value = `Share a new product material with you\n${shortData.shortUrl}`;
                document.body.appendChild(createInput);
                createInput.select(); // 选择对象
                document.execCommand('Copy'); // 执行浏览器复制命令
                createInput.style.display = 'none';
                this.copyVisible = true;
            },
            openFbMessage() {
                this.copyVisible = false;
                window.open(' https://www.messenger.com/');
                // 返回列表页
                this.$emit('toHomePage', 0);
                // 刷新分享表格数据
                this.$emit('toRefreshPage', 0);
            },
            async toWhatsApp() {
                // 获取WhatsApp联系人列表
                await this.getWALoginAccount();
                // 关闭选择分享方式弹窗
                this.$emit('changeShareModel', false);
                const domainData = await this.getShortUrl('whatsApp');
                this.domainUrl = domainData.domain;
            },
            async toEmail() {
                // 获取发件人邮箱列表
                this.getAccountsByUserId();
                // 关闭选择分享方式弹窗
                this.$emit('changeShareModel', false);
                // 收件人、发件人不回显
                this.emailForm.from = '';
                this.emailForm.recipients_to = [];
                // 分享标题回填
                const domainData = await this.getShortUrl('email');
                this.domainUrl = domainData.domain;
                this.emailForm.title = domainData.title;
            },
            toEmailSet() {
                window.open(
                    this.$router.resolve({
                        name: 'mail_set'
                    }).href,
                    '_blank'
                );
            },
            dialogEmailCommit() {
                this.loadingBtn = true;
                const data = this.mailDataFormat();
                this.sendEmail(data);
            },
            // 整合数据
            mailDataFormat() {
                const emailForm = Object.assign({}, this.emailForm);
                const followup_arr = [];
                const recieverFollowUpConditionList = this.recieverFollowUpConditionList.slice();
                Object.keys(emailForm).forEach(item => {
                    if (typeof emailForm[item] === 'boolean') {
                        emailForm[item] = emailForm[item] ? 1 : 0;
                    }
                    if (
                        Object.prototype.toString.call(emailForm[item]) === '[object Array]'
                    ) {
                        if (item === 'recipients_to') {
                            emailForm[item].forEach(mail => {
                                recieverFollowUpConditionList.forEach(obj => {
                                    if (mail.indexOf(obj.email) !== -1) {
                                        obj = {
                                            email: obj.email,
                                            followUpId: obj.followUpId,
                                            followUpType: obj.followUpType
                                        };
                                        followup_arr.push(obj);
                                    }
                                });
                            });
                        }
                        emailForm[item] = emailForm[item].join(',');
                    }
                });
                return {
                    ...emailForm,
                    recieverFollowUpConditionList: followup_arr
                };
            },
            sendEmail(data) {
                if (this.emailForm.from === '') {
                    this.$Message.error('请输入发件人邮箱!');
                    return;
                } else if (this.emailForm.title === '') {
                    this.$Message.error('请输入标题!');
                    return;
                } else if (!this.emailForm.recipients_to.length) {
                    this.$Message.error('请选择收件人!');
                    return;
                }
                data.from = `<${data.from}>`;
                data.id = this.id;
                util
                    .ajaxShareMail({
                        url: '/push/sendEmail',
                        method: 'post',
                        data
                    })
                    .then(res => {
                        if (res.data.code === '1') {
                            this.dialogMailVisible = false;
                            this.$confirm('智能物料任务已发送', '提示', {
                                confirmButtonText: '确定',
                                showCancelButton: false,
                                type: 'warning'
                            })
                                .then(() => {
                                    // 返回列表页
                                    this.$emit('toHomePage', 0);
                                    // 刷新分享表格数据
                                    this.$emit('toRefreshPage', 0);
                                })
                                .catch(() => {
                                    // 返回列表页
                                    this.$emit('toHomePage', 0);
                                    // 刷新分享表格数据
                                    this.$emit('toRefreshPage', 0);
                                });
                        } else if (res.data.code === '-50001') {
                            this.$Message.error('邮箱格式错误!');
                        } else if (res.data.code === '-50002') {
                            this.$Message.error('邮件分享每天最多3次!');
                        } else if (res.data.code === '-50003') {
                            this.$Message.error('邮件分享最多每次30人!');
                        } else if (res.data.code === '-30703') {
                            this.$Message.error('请输入发件人邮箱!');
                        } else if (res.data.code === '-30701') {
                            this.$Message.error('邮件帐号不能为空!');
                        } else if (res.data.code === '-30704') {
                            this.$Message.error('请输入标题!');
                        } else {
                            this.$Message.error('邮件分享失败!');
                        }
                        this.loadingBtn = false;
                    });
            },
            dialogEmailCancel() {
                this.dialogMailVisible = false;
                // 返回列表页
                this.$emit('toHomePage', 0);
                // 刷新分享表格数据
                this.$emit('toRefreshPage', 0);
            },
            /* 获取当前询盘云登录用户绑定的WA账号列表 */
            getWALoginAccount() {
                // getWaUserBind({
                getAllLoggedAccount({
                    orgId: this.orgId,
                    userId: this.userId
                }).then(res => {
                    if (res.code === 1) {
                        if (Array.isArray(res.data) && res.data.length) {
                            // 暂存接口返回的, 该 userId 所有登录过的账号
                            const allAccountList = res.data;

                            /* 更新未读数 */
                            // 先置空
                            this.$store.commit('setWAUnreadCount', null);

                            // 暂存接口返回的, 该 userId 所有登录过的账号
                            const updateObj = {};
                            res.data.forEach(item => {
                                updateObj[item.whatsappAccount] = item.noRead;
                            });

                            // 更新未读数
                            this.$store.commit('setWAUnreadCount', updateObj);

                            // 更新 WA 绑定账号信息
                            this.checkCurrOwnAccountInfo(allAccountList);

                            if (this.whatsAppAccountInfo && this.whatsAppAccountInfo.whatsappAccount) {
                                this.getWAContactList();
                                this.timerOut = null;
                            } else {
                                // 持续检查
                                console.clear();
                                console.log('this.whatsAppAccountInfo', this.whatsAppAccountInfo);
                                console.log('from onekyeShare: getWALoginAccount 获取当前询盘云登录用户绑定的WA账号列表');
                                this.timerOut = setTimeout(() => {
                                    this.getWALoginAccount();
                                }, 500);
                            }
                        } else {
                            // 清空全部未读数
                            this.$store.commit('setWAUnreadCount', null);
                        }
                    }
                });
            },
            /* 获取当前WA用户的通讯录 */
            getWAContactList() {
                util
                    .ajaxWAJson({
                        url: '/whatsapp/contact/page',
                        method: 'POST',
                        data: {
                            orgId: this.orgId,
                            page: 1,
                            size: 1999,
                            userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                            userId: this.userId
                        }
                    })
                    .then(res => {
                        if (res.data.code === 1) {
                            this.contactList = [];
                            this.$nextTick(function() {
                                const contactList = (res.data.data.content || []);
                                contactList.forEach(node => {
                                    node.checked = this.cacheCheckList.some(v => v.contactWaAccount === node.contactWaAccount);
                                });
                                this.contactList = contactList;
                                this.updateCheckAllStatus();
                            });
                        } else {
                            this.$Message.error('');
                        }
                    })
                    .catch(err => {
                    });
            },
            /* WA账号(手机号)进行格式转换 */
            toggleWAAccount(val) {
                let str;
                if (val && val.startsWith('+')) {
                    str = val;
                } else {
                    str = `+${val}`;
                }
                return str;
                // const arr = str.split('');
                // arr.splice(3, 0, ' ');
                // return arr.join('');
            },
            dialogWhatsappCommit() {
                const accountSn = this.cacheCheckList
                    .map(item => item.contactWaAccount)
                    .join(';');
                const data = {
                    id: this.id,
                    accountSn: accountSn,
                    bindWhatsappAccount: this.whatsAppAccountInfo.whatsappAccount
                };
                this.loadingBtn = true;
                util
                    .ajax233({
                        url: '/push/sendWhatsapp',
                        method: 'post',
                        data: data
                    })
                    .then(res => {
                        this.loadingBtn = false;
                        if (res.data.code === '1') {
                            this.WhatsAppVisible = false;
                            this.$Message.success('分享任务已发送');
                            // 返回列表页
                            this.$emit('toHomePage', 0);
                            // 刷新分享表格数据
                            this.$emit('toRefreshPage', 0);
                        } else if (res.data.code === '-30702') {
                            this.$Message.error('whatsApp联系人不能为空!');
                        } else if (res.data.code === '-30801') {
                            this.$Message.error('whatsApp帐号未登录!');
                        } else if (res.data.code === '-30802') {
                            this.$Message.error('whatsApp帐号登录失效!');
                        } else {
                            this.$Message.error(res.data.message);
                        }
                    });
            },
            dialogWhatsappCancel() {
                this.WhatsAppVisible = false;
                // 返回列表页
                this.$emit('toHomePage', 0);
                // 刷新分享表格数据
                this.$emit('toRefreshPage', 0);
                clearTimeout(this.timerOut);
            },
            /* 通过用户ID获取发件人邮箱列表 */
            getAccountsByUserId() {
                console.log('调邮箱接口');
                util
                    .ajaxMailJson({
                        url: `/mail/mailAccountsSelect/${this.userId}`,
                        method: 'get'
                    })
                    .then(response => {
                        if (response.data.code === 1) {
                            this.senders = response.data.data;
                            /**
                             * @Description: 发件人显示：如果只有默认发件人，回显发件人邮箱；
                             * 如果没有默认发件人且只有一个可选发件人，回显发件人;
                             * 如果没有默认发件人且多个可选发件人，不回显发件人邮箱
                             * @author 翟敏
                             * @date 2020/5/25
                             */
                            if (response.data.data.length === 1) {
                                const item = response.data.data[0];
                                this.accountId = item.id;
                                this.senderIndex = 0;
                                this.emailForm.from = item.emailAddress;
                                this.defaultSendAccount = item.emailAddress;
                            }
                            response.data.data.map((item, index) => {
                                if (item.defaultSendAccountFlag === '1') {
                                    this.accountId = item.id;
                                    this.senderIndex = index;
                                    this.emailForm.from = item.emailAddress;
                                    this.defaultSendAccount = item.emailAddress;
                                }
                            });
                        } else {
                            this.$Message.error('getAccountsByUserId失败!');
                        }
                    });
            },
            /* 添加联系人 */
            addContacts() {
                event.stopPropagation();
                this.addContactList = [];
                this.contactsModel = true;
                this.placeholder = '';
                this.dialogMailVisible = false;
            },
            /**
             * @Description: 手输收件人邮箱，查询需要发给后端的用于关联线索和询盘跟进的信息
             * @author 翟敏
             * @date 2020/5/28
             */
            addEmail(emails) {
                util
                    .ajax({
                        url: 'crm/mailbox/getTypeAndIdByEmail',
                        method: 'get',
                        params: {
                            userId: this.userId,
                            orgId: this.orgId,
                            email: emails
                        }
                    })
                    .then(({ data }) => {
                        if (data.code === '1') {
                            const emailList = data.data.map(item => {
                                return {
                                    email: item.email,
                                    followUpId: item.id,
                                    followUpType: item.type
                                };
                            });
                            this.recieverFollowUpConditionList = this.recieverFollowUpConditionList.concat(emailList);
                        }
                    });
            },
            onCopy() {
                this.$Message.success('复制成功');
            },
            onError() {
                this.$Message.error('复制失败');
            },
            handleCopyClose() {
                this.copyVisible = false;
                // 返回列表页
                this.$emit('toHomePage', 0);
                // 刷新分享表格数据
                this.$emit('toRefreshPage', 0);
            },

            // 打开账号下拉弹框
            triggerAccountPop() {
                this.$refs.accountPopRef.click();
            },
            // 处理请求得到的账号列表 + 从中选择某账号作为当前显示账号
            checkCurrOwnAccountInfo(dataList) {
                // 更新账号列表, 只取未生效账号
                this.ownWhatsAppAccountList = dataList.filter(item => (`${item.loginStatus}` === '1') && (item.tag !== 'WABA'));

                // 选中首个未失效账号作为要显示的账号
                this.whatsAppAccountInfo = this.ownWhatsAppAccountList[0] || {};
            },
            // 切换登录过的账号
            checkOwnWAAccount(ownAccountInfo) {
                if (this.cacheCheckList.length) {
                    // 关闭弹框
                    this.$refs.accountPop.doClose();

                    // 弹出发起切换账号确认框
                    this.$confirm(
                        this.$t('whatsapp_manage.tip_toggleWaAccount'),
                        this.$t('whatsapp_manage.title_toggleWaAccount'),
                        {
                            showClose: false,
                            customClass: 'toggleWaAccountMsgBox',
                            // closeOnClickModal: false,
                            // closeOnPressEscape: false,
                            confirmButtonText: this.$t('whatsapp_manage.toggleWaAccount'),
                            cancelButtonText: this.$t('cancel')
                        }
                    ).then(async res => {
                        // 切换账号

                        // 取消选中
                        this.handleCheckAllChange(false);

                        // 更新 WA 绑定账号信息
                        this.whatsAppAccountInfo = ownAccountInfo;
                        // 重新获取联系人列表
                        this.contactList = [];
                        this.getWAContactList();

                        // 第一次打开此弹框确认取消后, 页面遮罩未消失, 作此处理
                        const tmp = document.querySelector('.v-modal');
                        tmp.click();
                    }).catch(() => {
                        // 第一次打开此弹框确认取消后, 页面遮罩未消失, 作此处理
                        const tmp = document.querySelector('.v-modal');
                        tmp.click();
                    });

                    return;
                }

                // 无选中账号, 正常流程切换账号
                // 更新 WA 绑定账号信息
                this.whatsAppAccountInfo = ownAccountInfo;
                // 重新获取联系人列表
                this.contactList = [];
                this.getWAContactList();
                // 关闭弹框
                this.$refs.accountPop.doClose();
            }
        },
        watch: {
            contactsModel(val) {
                console.log(val);
                console.log(this.addContactList);

                if (!val && this.addContactList) {
                    const addContactList = [...this.addContactList];
                    const recipientsTo = this.emailForm.recipients_to;
                    const standardMailAdd = [];
                    let startIndex = -1;
                    let endIndex = -1;
                    for (let i = 0; i < recipientsTo.length; i++) {
                        startIndex = recipientsTo[i].indexOf('<');
                        endIndex = recipientsTo[i].indexOf('>');
                        if (startIndex !== -1 && endIndex !== -1) {
                            standardMailAdd.push(recipientsTo[i].substring(startIndex + 1, endIndex));
                        } else {
                            standardMailAdd.push(recipientsTo[i]);
                        }
                    }
                    addContactList.map(item => {
                        if (
                            standardMailAdd.findIndex(contact => contact === item.receiveMailAddress) === -1
                        ) {
                            standardMailAdd.push(item.receiveMailAddress);
                            this.emailForm.recipients_to.push(`${item.receiverName}<${item.receiveMailAddress}>`);
                            this.receiveMailAddress.push(item.receiveMailAddress);
                            if (item.followUpType) {
                                this.recieverFollowUpConditionList.push({
                                    email: item.receiveMailAddress,
                                    followUpId: item.followUpId,
                                    followUpType: item.followUpType
                                });
                            }
                            delete item.checked;
                            delete item.clientType; // todo,后期可能不删除
                            delete item.scale;
                        } else if (
                            this.emailForm.recipients_to.findIndex(contact =>
                                contact.includes(item.receiveMailAddress)) === -1
                        ) {
                            this.emailForm.recipients_to.push(`${item.receiverName}<${item.receiveMailAddress}>`);
                            this.receiveMailAddress.push(item.receiveMailAddress);
                        }
                    });
                    // 当不为群发单显时
                    let inputStr = String(this.emailForm.recipients_to);
                    if (inputStr.length >= 3800) {
                        inputStr = inputStr.slice(0, 3799);
                        this.$Message({
                            message: this.$t('mail.writeLetter.beyondCharacterTip1'),
                            type: 'warning',
                            duration: 3000
                        });
                    }
                    if (this.emailForm.recipients_to.length > 0) {
                        this.emailForm.recipients_to = inputStr
                            .split(',')
                            .filter(function(e) {
                                return e;
                            });
                    }
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .cloud_icon_margin {
        margin-top: 10px;
    }

    .facebook__bottom {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.8);
    }

    .cloud-modal-wrapper {
        padding: 0 20px 50px;
    }

    ._avency {
        flex: 1;
    }

    .cloud-modal-icon {
        /*padding: 30px 147px;*/
        display: flex;
        flex-direction: row;
        justify-content: space-around;

        .cloud-modal-circle {
            width: 32px;
            height: 32px;
            padding: 7px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
        }

        .cloud-modal-facebook {
            border: 1px solid #3d5a96;
        }

        .cloud-modal-fbmessenger {
            border: 1px solid #0080ff;
        }

        .cloud-modal-whatsapp {
            border: 1px solid #39c34c;
        }

        .cloud-modal-email {
            border: 1px solid #677f99;
        }

        .svg-icon {
            width: 18px;
            height: 18px;
            vertical-align: middle;
        }
    }

    .cloud-modal-text {
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        letter-spacing: 0;
        line-height: 18px;
        margin-top: 16px;
        text-align: center;
    }

    .cloud-modal-map {
        border: 1px dashed #eaeaea;
        display: flex;
        flex-direction: column;
        padding: 10px;
        width: 420px;
        height: 500px;
        overflow: auto;
        .cloud-modal-report {
            width: 400px;
        }

        .cloud-modal-com {
            padding-top: 10px;
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.6);
            letter-spacing: 0;
            line-height: 18px;
        }

        .cloud-modal-title-one {
            font-family: PingFangSC-Semibold;
            font-weight: 700;
            font-size: 16px;
            color: rgba(0, 0, 0, 0.8);
            letter-spacing: 0;
            line-height: 24px;
            text-align: left;
            padding: 4px 0;
        }

        .cloud-modal-text-one {
            margin: 0;
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.8);
            letter-spacing: 0;
            line-height: 22px;
            text-align: left;
        }
        .cloud-modal-text-one-nostyle{
            margin: 0;
            letter-spacing: 0;
            line-height: 22px;
            text-align: left;
        }
    }

    .dialog-footer {
    }

    .dialog-title {
        display: flex;
        flex-direction: row;
        align-items: center;

        span {
            line-height: 24px;
            font-size: 18px;
            color: #303133;
        }
    }

    .cloud-push-whatsapp-wrapper {
        display: flex;
        flex-direction: row;

        .cloud-whatsapp-head {
            width: 260px;
            padding-right: 4px;
            border-right: 1px solid #eaeaea;
        }

        .cloud-push-contacts {
            display: flex;
            flex-direction: row;
            align-items: center;
            box-sizing: border-box;
            padding-right: 15px;
            justify-content: space-between;

            /deep/ .el-checkbox {
                display: flex;
                flex-direction: row-reverse;
                align-items: center;

                .el-checkbox__label {
                    font-family: PingFangSC-Regular;
                    font-size: 12px;
                    color: rgba(0, 0, 0, 0.8);
                    letter-spacing: 0;
                    line-height: 18px;
                    padding-right: 8px;
                }

                /*.el-checkbox__inner{*/
                /*    width: 18px;*/
                /*    height: 18px;*/
                /*}*/
                /*.el-checkbox__inner:after{*/
                /*    left: 6px;*/
                /*    top:2px;*/
                /*}*/
            }

            .cloud-push-text {
                font-family: PingFangSC-Semibold;
                font-weight: 700;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.8);
                letter-spacing: 0;
            }
        }

        .cloud-push-list {
            height: 400px;
            overflow-y: scroll;

            .avatar-small {
                width: 36px;
                height: 36px;
                border-radius: 18px;
            }

            /deep/ .el-checkbox-group {
                display: flex;
                flex-direction: column;

                .el-checkbox {
                    display: flex;
                    flex-direction: row-reverse;
                    align-items: center;
                    margin: 20px 0 0 0;
                    justify-content: space-between;

                    .el-checkbox__label {
                        padding-left: 0;
                    }

                    .el-checkbox__input {
                        margin-right: 8px;
                    }
                }
            }

            .chat-svg-avatar {
                margin-right: 12px;
            }
        }
    }

    .cloud-push-whatsapp-preview {
        padding: 0 20px;

        .cloud-push-whatsapp-preview-title {
            font-family: PingFangSC-Semibold;
            font-weight: 700;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.8);
            letter-spacing: 0;
            margin-bottom: 16px;
        }

        .clear-margin {
            margin: 0;
        }
    }

    .operate_ico:hover {
        color: #3b78de;
    }

    .input-inside {
        border: 1px solid transparent;
    }

    .cloud-modal-copy-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding-bottom: 20px;

        .modal-copy-p1 {
            font-size: 14px;
            color: rgba(0, 0, 0, 0.8);
            letter-spacing: 0;
            line-height: 22px;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .modal-copy-p2 {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.4);
            text-align: center;
            line-height: 18px;
        }
    }

    .cloud-preview-button {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        border: 1px solid #248efb;
        background: #248efb;
        border-radius: 15px;
        width: 200px;
        height: 30px;
        padding: 6px 12px;
        margin-top: 20px;

        .modal-copy-button {
            font-family: PingFangSC-Medium;
            font-size: 12px;
            color: #ffffff;
            text-align: center;
            line-height: 18px;
        }
    }

    /deep/ .el-form-item__label {
        text-align: left;
        font-size: 12px;
    }

    /deep/ .el-checkbox__inner {
        border-radius: 50%;
    }

    /deep/ .el-form-item__content {
        /*display: flex;*/
        /*flex-direction: row;*/
    }

    .brand-page-name {
        display: inline-block;
        vertical-align: middle;
        max-width: 146px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
        color: rgba(0,0,0,0.80);
        padding: 0 10px;
        font-weight: 700;
    }

    .ownWaAccount-list {
    }

    .ownWaAccount-avatar {
        .avatar-small {
            width: 44px;
            height: 44px;
            border-radius: 22px;
            border: 1px solid #EAEAEA;
        }
    }

    .ownWaAccount-item {
        display: flex;
        align-items: center;

        padding: 8px 20px;
        width: 220px;
        cursor: pointer;

        > *:not(:first-child) {
            margin-left: 12px;
        }

        &:hover {
            background: #F5F7FA;
        }
    }

    .ownWaAccount-nickInfo {
        flex: 1;
        overflow: hidden;

        .ownWaAccount-nick {
            font-weight: 500;
            color: rgba(0, 0, 0, 80%);
        }
    }
</style>

<style lang="less">
    .ownWaAccount-popper {
        &.el-popper {
            margin-top: 25px;
            padding: 10px 0;
        }
    }

    .toggleWaAccountMsgBox {
        width: 500px;
        padding: 9px 9px 24px;

        .el-message-box__message {
            font-size: 12px;
            line-height: 18px;
            color: rgba(0, 0, 0, 80%);
        }

        .el-message-box__btns {
            margin-top: 60px;
        }

        .el-button {
            height: 36px;
            font-size: 14px;
            border-radius: 4px;
        }
    }
</style>
