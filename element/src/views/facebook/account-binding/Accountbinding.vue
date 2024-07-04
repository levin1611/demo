<template>
    <div class="fb-account-binding" v-loading="getPageLoading">
        <!-- 公司主页 -->
        <p class="page-group-title">
            {{$t('facebook.companyPage')}}
            <!-- 系统 tip -->
            <HelpTip :title="$t('helpTip.companyPage')"></HelpTip>
            <!-- 绑定 facebook 账号 -->
            <Button type="primary" style="float:right;" @click="clickBindingButton">
                {{$t('facebook.accountBinding.bindAccount')}}
            </Button>
        </p>
        <div v-for="(page,pageIndex) in companyPages" :key="pageIndex" class="facebook-page-div">
            <div :class="['facebook-page-box',{'facebook-page-box-failure':page.accessStatus!=1}]">
                <!-- 头像 -->
                <div style="display:inline-block;position: relative;">
                    <Avatar :src="page.headUrl" class="box-page-avatar"/>
                    <svg class="svg-icon company-page-icon" aria-hidden="true">
                        <use xlink:href="#custom-facebook-company-page"></use>
                    </svg>
                </div>
                <!-- 主页名称 -->
                <div class="box-page-name">{{page.name}}</div>
                <!-- 删除公司主页 -->
                <Icon custom="custom custom-delete1" size="10" class="box-page-delete"
                      @click="cancelBinding(2, page)"
                      v-if="canUnBindCompanyPage"></Icon>
            </div>
            <!-- 显示失效标识 -->
            <span v-if="page.accessStatus !== 1" class="invalid-tip">
                {{$t('inbox.loseEfficacy')}}
            </span>
        </div>
        <!-- 个人主页 -->
        <p class="page-group-title">{{$t('facebook.myPage')}}</p>
        <div v-for="(account,accountIndex) in accounts" :key='account.id' style="display:flex;margin-bottom:40px;">
            <!-- 账号 -->
            <div class="each-page-group">
                <div class="facebook-page-div">
                    <div :class="['facebook-page-box',{'facebook-page-box-failure':account.accessStatus!=1}]">
                        <!-- 账号头像 -->
                        <Avatar :src="account.headUrl" class="box-page-avatar"/>
                        <!-- 账号名称 -->
                        <div class="box-page-name">{{account.accountName}}</div>
                        <!-- 删除账号 -->
                        <Icon custom="custom custom-delete1" size="10" class="box-page-delete"
                              @click="cancelBinding(1, account)"></Icon>
                    </div>
                    <!-- 显示失效标志 -->
                    <p v-if="account.accessStatus!=1" class="box-page-invalid-tip">
                        {{$t('facebook.accountBinding.invalidTip')}}
                    </p>
                </div>
                <!-- 绑定个人主页 (失效时，按钮不可点击) -->
                <Button
                    type="primary" icon="el-icon-plus"
                    :class="account.accessStatus!=1?'invalid-btn':''"
                    @click="openBingdingPageModal(account.id)">
                        {{$t('facebook.accountBinding.bindingPage')}}
                </Button>
            </div>
            <!-- 账号下已绑定的个人主页 -->
            <div class="facebook-page-content">
                <template v-for="(page,pageIndex) in pages">
                    <div v-if="account.id == page.accountId" class="facebook-page-div">
                        <div :class="['facebook-page-box',{'facebook-page-box-failure':page.accessStatus!=1}]">
                            <!-- 主页头像 -->
                            <Avatar :src="page.headUrl" class="box-page-avatar"/>
                            <!-- 主页名称 -->
                            <div class="box-page-name">{{page.name}}</div>
                            <!-- 主页操作 -->
                            <Dropdown trigger="click" @command="handlePageOperate($event, page)">
                                <a href="javascript:void(0)">
                                    <Icon custom="custom custom-facebook-more" size="14"/>
                                </a>
                                <DropdownMenu slot="dropdown">
                                    <!-- 删除个人主页 -->
                                    <DropdownItem command="1">{{$t('facebook.accountBinding.unbindPage')}}</DropdownItem>
                                    <!-- 转为公司主页 -->
                                    <DropdownItem command="2" v-if="canBindCompanyPage">
                                        {{$t('facebook.accountBinding.changeToCompany')}}
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                        <!-- 显示失效标识 -->
                        <span v-if="account.id == page.accountId && page.accessStatus !== 1" class="invalid-tip">{{$t('inbox.loseEfficacy')}}</span>
                    </div>
                </template>
            </div>
        </div>

        <!-- 绑定主页模态框 -->
        <Modal :visible.sync="bindingPageModal"
               :modal-append-to-body="false"
               :mask-closable="false"
               width="660">
            <p slot="title">
                <span>{{$t('facebook.accountBinding.addPage')}}</span>
            </p>
            <Table v-loading="bindingPageModalTableLoading"
                   height="350"
                   ref="selection"
                   :data="modalBindingPageList"
                   @selection-change="bindingPageModalTableSelectChange"
                   class="modal-binding-page noborder-table">
                    <TableColumn type="selection" width="80"></TableColumn>
                    <TableColumn :label="$t('facebook.avatar')" width="75" prop="avatar">
                         <template slot-scope="scope">
                             <img style="width:44px;height:44px;verticalAlign:middle;" :src="scope.row.headUrl" alt="">
                        </template>
                    </TableColumn>
                    <TableColumn :label="$t('facebook.accountBinding.accountName')" prop="name"></TableColumn>
                </Table>
            <div slot="footer">
                <Button @click='bindingPageModal=false'>{{$t('cancel')}}</Button>
                <Button type="primary"
                        :loading="addPageLoading"
                        @click="addPage"
                        class="piwik_bind_facebook_page">
                    {{$t('facebook.accountBinding.add')}}
                </Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import Util from '@/libs/util';
    import { mapState } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { accountBinding } from '@/api/facebook/index';
    const { getFacebookBindList, getFacebookAvatar, getAuthorizationUrl, deleteFacebookBind, unBindingAccount, getListByOauthConfigId, changePageType, getPageAccounts, addPageAccounts, bindingAccount, updateConversationPictureAndName, syncFacebookForm, syncFacebookAnswer, checkPageBindingStatus } = accountBinding;

    export default {
        name: 'account_binding',
        created() {
            // 监听 Facebook 绑定完成后重定向到的 admin.leadscloud.com/facebook.html 页面发过来的消息
            window.addEventListener('message', this.receivePostMessage, false);
            // 目前 facebook.html 可能取不到 window.opener, 取不到时用 storage 传递数据
            window.addEventListener('storage', this.onStorageFunc);
            this.getConfigList();
        },
        beforeDestroy() {
            // 解绑事件
            window.removeEventListener('message', this.receivePostMessage, false);
            window.removeEventListener('storage', this.onStorageFunc);
        },
        data() {
            return {
                getPageLoading: true,
                addPageLoading: false,
                companyPages: [], // 公司主页列表
                windowObjectReference: '',
                cancelOpenBingdingPageModalAjax: null,
                bindingPageModalTableLoading: false,
                authorizationUrlVPN: 'authorizationUrlVPN',
                authorizationUrlServer: './test.html',
                selectBindingValue: 'vpn',
                selectBindingMethods: [
                    {
                        value: 'vpn',
                        label: this.$t('facebook.accountBinding.bindWithVpn')
                    },
                    {
                        value: 'server',
                        label: this.$t('facebook.accountBinding.bindWithServer')
                    }
                ],
                accounts: [],
                pages: [],
                bindingPageModal: false,
                modal_loading: false,
                addPageSelectAccount: '',
                modalBindingPageList: [],
                bindingPageModalTableSelectList: '',
                pageIds: []
            };
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                enterpriseId: state => state.enterpriseId,
                isFbService: state => state.isFbService,
                button_list: state => state.app.button_list,
                lang: state => state.app.lang
            }),
            authorizationUrl() {
                if (this.selectBindingValue === 'vpn') {
                    return this.authorizationUrlVPN;
                } else if (this.selectBindingValue === 'server') {
                    return this.authorizationUrlServer;
                }
            },
            canBindCompanyPage() {
                return !HANDLE_BUTTON(BUTTON_IDS.systemSetting.facebookSetting.account.bindCompanyPage, this.button_list);
            },
            canUnBindCompanyPage() {
                return !HANDLE_BUTTON(BUTTON_IDS.systemSetting.facebookSetting.account.unBindCompanyPage, this.button_list);
            }
        },
        methods: {
            // 个人主页操作
            handlePageOperate(type, page) {
                if (type === '1') {
                    // 删除个人主页
                    this.cancelBinding(2, page);
                } else if (type === '2') {
                    // 转换主页为公司主页
                    this.changePageType(page);
                }
            },
            // 转换主页类型
            async changePageType(page) {
                // 获取此主页是否已被绑定为公司主页 + 相关数据
                const res_bind = await checkPageBindingStatus({
                    orgId: this.enterpriseId,
                    pageId: page.providerUserId
                });

                if (res_bind.code === '1') {
                    // 主页已被添加

                    // 暂存返回结果
                    const repeatBindingData = Array.isArray(res_bind.data) ? res_bind.data : [];

                    // 根据结果整合提示语
                    let tipStr = '';
                    if (repeatBindingData.length) {
                        // 接口返回数组, 数组项为 { pageName, userName } ,所有主页名称一致, userName 不一致
                        const pageName = repeatBindingData[0].pageName;
                        const userNameList = repeatBindingData.map(item => item.userName);
                        tipStr = this.$t('facebook.accountBinding.changePageTypeFailDetailTip').replace('$pageName', pageName).replace('$userName', userNameList.join(', '));
                        tipStr += ', ';
                    }
                    tipStr += this.$t('facebook.accountBinding.changePageTypeFailTip');

                    // 弹出解绑原有 + 确认操作框
                    this.$confirm(tipStr, this.$t('facebook.accountBinding.operateConfirm'), {
                        confirmButtonText: this.$t('confirm'),
                        cancelButtonText: this.$t('cancel'),
                        showClose: false,
                        type: 'warning'
                    }).then(_ => {
                        this.handleChangePageType(page);
                    });
                } else {
                    // 主页未被添加

                    // 弹出确认操作框
                    this.$confirm(`<p>${this.$t('facebook.accountBinding.changePageConfirm')}<strong>${page.name}</strong>${this.$t('facebook.accountBinding.turnIntoCompany')}</p>`, this.$t('mail.promptTip'), {
                        confirmButtonText: this.$t('confirm'),
                        cancelButtonText: this.$t('cancel'),
                        showClose: false,
                        dangerouslyUseHTMLString: true,
                        type: 'warning'
                    }).then(_ => {
                        this.handleChangePageType(page);
                    });
                }
            },
            // 真正处理转换主页类型
            handleChangePageType(page) {
                // 主页类型转换
                changePageType({
                    id: page.id,
                    type: 1, // （0为个人，1为企业级）
                    userId: this.userId
                }).then((response) => {
                    if (response && response.code === '1') {
                        // 解绑个人主页(如果不加这个方法的话,也会解绑个人主页)
                        // this.unBindingAccount(page.userId, [page.pageId]);
                        // 重新请求数据
                        this.getConfigList();
                    } else {
                        this.$Message.error(this.$t('crm.Table.errorOccurred'));
                    }
                }).catch(e => {
                    console.error(e);
                    this.$Message.error(this.$t('crm.Table.errorOccurred'));
                });
            },
            // 解绑主页
            unBindingAccount(userId, pageIds) {
                // 解绑操作
                return unBindingAccount({
                    userId,
                    pageIds
                });
            },
            /* 获取facebook授权地址，并打开绑定窗口 */
            clickBindingButton() {
                const name = 'childrenWindowBinding';
                const w = 1200;
                const h = 600;
                const left = (window.screen.width / 2) - (w / 2);
                const top = (window.screen.availHeight / 2) - (h / 2);
                this.windowObjectReference = window.open('', name, ` width=${w
                }, height=${h}, top=${top}, left=${left}`);
                getAuthorizationUrl({
                    userId: this.userId,
                    providerId: 'facebook',
                    orgId: this.enterpriseId
                }).then(response => {
                    if (response.code === '1') {
                        this.authorizationUrlVPN = response.data;
                        this.openBindingWindow();
                    }
                });
            },
            openBindingWindow() {
                const url = this.authorizationUrl;
                const name = 'childrenWindowBinding';
                const w = 1000;
                const h = 500;
                const left = (window.screen.width / 2) - (w / 2);
                const top = (window.screen.availHeight / 2) - (h / 2);
                this.windowObjectReference = window.open(url, name, ` width=${w
                }, height=${h}, top=${top}, left=${left}`);
            },
            // 获取主页的头像的接口
            getPostsPicturesUrl(post) {
                return new Promise((resolve, reject) => {
                    getFacebookAvatar({
                        link: post
                    }).then(response => {
                        if (response.code === '1') {
                            resolve(response.data[0]);
                        }
                    });
                });
            },
            // 获取主页的头像
            async dealPic(list) {
                for (let i = 0; i < list.length; i++) {
                    const temp = list[i];
                    const pagePicture = await this.getPostsPicturesUrl(temp.headUrl);
                    temp.headUrl = pagePicture;
                }
            },
            getConfigList() {
                this.getPageLoading = true;
                // 获取绑定账号列表
                this.companyPages = [];
                this.pages = [];
                getFacebookBindList({
                    userId: this.userId,
                    providerId: 'facebook',
                    orgId: this.enterpriseId
                }).then(response => {
                    const data = response;
                    if (data.code === '1') {
                        // 我的主页(猜测)
                        const accountsPic = data.data.accounts;
                        // 公共主页列表
                        const pagesPic = data.data.pages;
                        if (accountsPic && accountsPic.length) {
                            // 获取我的主页的头像
                            this.dealPic(accountsPic);
                        }
                        if (pagesPic && pagesPic.length) {
                            // 获取公共主页的头像
                            this.dealPic(pagesPic);
                        }
                        const currentPages = pagesPic;
                        this.accounts = accountsPic;
                        if (currentPages) {
                            for (const item of currentPages) {
                                // item.homePageType === 1 表示公司主页
                                if (item.homePageType === 1) {
                                    this.companyPages.push(item);
                                } else {
                                    // 个人主页
                                    this.pages.push(item);
                                }
                            }
                        }

                        /* 更新 Vuex "Facebook 账号绑定已失效"状态值 */
                        // 账号
                        const accounts = data.data.accounts || [];
                        // 主页
                        const pages = data.data.pages || [];
                        // 暂存"FB 是否失效"状态
                        let invalid = false;

                        // 遍历主页, 确定 FB 失效则停止遍历
                        pages.some(item => {
                            // "当前主页是否失效"状态
                            const invalidStatus = item.accessStatus !== 1;
                            if (item.homePageType === 1) {
                                // 当前主页是公司主页, 则直接以主页状态为 FB 失效状态
                                invalid = invalidStatus;
                            } else {
                                // 当前是个人主页
                                if (invalidStatus && accounts.find(account => account.id + '' === item.accountId + '')) {
                                    // 如果当前主页已失效, 且当前主页有对应的账号, 则认为 FB 已失效
                                    invalid = true;
                                }
                            }
                            // 返回结果, 如果为 true , 则终止 some 循环
                            return invalid;
                        });
                        // 设置 vuex isFBInvalid 状态
                        this.$store.commit('setIsFBInvalid', invalid);
                    } else {
                        this.accounts = [];
                    }
                    this.getPageLoading = false;
                }).catch(() => {
                    this.accounts = [];
                    this.getPageLoading = false;
                });
            },
            // 删除账号/主页 (type: 1-账号, 2-主页)
            async cancelBinding(type, obj) {
                // 解构取值
                let { id, name, pageId, userId } = obj;
                if (type === 1) {
                    name = obj.accountName;
                }

                // 设置删除确认框提示内容
                let tip = `<p>${this.$t('facebook.accountBinding.deleteContent')} <strong>${name}</strong></p>`;
                if (type === 1) {
                    tip = await this.getAccountUnbindTip(obj);
                }

                // 弹出删除确认框
                this.$confirm(tip, this.$t('facebook.accountBinding.unboundTitle'), {
                    confirmButtonText: this.$t('confirm'),
                    cancelButtonText: this.$t('cancel'),
                    showClose: false,
                    dangerouslyUseHTMLString: true,
                    type: 'warning'
                }).then(_ => {
                    // 发送删除请求
                    this.cancelBindingAjax(type, id, pageId, userId, name);
                });
            },
            // 发送删除账号/主页请求 (type: 1-账号, 2-主页)
            cancelBindingAjax(type, id, pageId, userId, name) {
                // 删除主页
                deleteFacebookBind({
                    id,
                    orgId: this.enterpriseId,
                    userId: this.userId
                }).then((response) => {
                    if (response && response.code === '1') {
                        let successTip = this.$t('deleteSuccess');
                        // 删除成功提示
                        if (type === 1) {
                            successTip = this.$t('facebook.accountBinding.deleteAccountSuccessTip1') + name + this.$t('facebook.accountBinding.deleteAccountSuccessTip2');
                        } else if (type === 2) {
                            // 解绑操作
                            this.unBindingAccount(userId, [pageId]);
                        }
                        this.$Message.success(successTip);
                        // 重新请求数据
                        this.getConfigList();
                    } else {
                        let errorTip = this.$t('deleteFail');
                        // 删除成功提示
                        if (type === 1) {
                            errorTip = this.$t('facebook.accountBinding.deleteAccountErrorTip1') + name + this.$t('facebook.accountBinding.deleteAccountErrorTip2');
                        }
                        this.$Message.error(errorTip);
                    }
                }).catch(e => {
                    console.error(e);
                    let errorTip = this.$t('deleteFail');
                    // 删除成功提示
                    if (type === 1) {
                        errorTip = this.$t('facebook.accountBinding.deleteAccountErrorTip1') + name + this.$t('facebook.accountBinding.deleteAccountErrorTip2');
                    }
                    this.$Message.error(errorTip);
                });
            },
            // 点击绑定主页按钮
            openBingdingPageModal(account) {
                const CancelToken = Util.axios.CancelToken;

                if (typeof this.cancelOpenBingdingPageModalAjax === 'function') {
                    this.cancelOpenBingdingPageModalAjax();
                }
                this.addPageSelectAccount = account;
                this.bindingPageModalTableSelectList = [],
                this.modalBindingPageList = [],
                this.bindingPageModalTableLoading = true,
                this.bindingPageModal = true;
                const that = this;
                getPageAccounts({
                    params: {
                        configId: account,
                        providerId: 'facebook'
                    },
                    cancelToken: new CancelToken(function executor(c) {
                        // An executor function receives a cancel function as a parameter
                        that.cancelOpenBingdingPageModalAjax = c;
                    })
                }).then(response => {
                    this.bindingPageModalTableLoading = false;
                    const data = response;
                    if (data.code === '1') {
                        this.modalBindingPageList = data.data.map(item => {
                            for (const page of this.companyPages) {
                                if (item.pageId === page.pageId) {
                                    item._disabled = true;
                                }
                            }
                            return item;
                        });
                    } else if (data.code === '0') {
                        this.$Message({
                            message: data.message,
                            type: 'warning',
                            duration: 0,
                            showClose: true
                        });
                    }
                });
            },
            bindingPageModalTableSelectChange(list) {
                let bpmtsl = [];
                for (let i = 0; i < list.length; i++) {
                    bpmtsl.push(list[i].pageId);
                }
                this.pageIds = bpmtsl;
                bpmtsl = bpmtsl.join(',');
                this.bindingPageModalTableSelectList = bpmtsl;
            },
            // 点击确定按钮
            addPage() {
                this.addPageLoading = true;
                if (this.bindingPageModalTableSelectList.length > 0) {
                    addPageAccounts({
                        configId: this.addPageSelectAccount,
                        accountIds: this.bindingPageModalTableSelectList,
                        homePageType: 0
                    }).then(response => {
                        const data = response;
                        if (data.code === '1') {
                            bindingAccount({
                                userId: this.userId,
                                pageIds: this.pageIds
                            }).then(response => {
                                if (response.code === '1') {
                                    this.addPageLoading = false;
                                    this.bindingPageModal = false;
                                    this.$Message.success(this.$t('facebook.accountBinding.addSuccTip'));
                                    this.getConfigList();
                                    this.syncFaceForm();
                                    this.syncFaceAnswer();
                                } else {
                                    this.addPageLoading = false;
                                    this.bindingPageModal = false;
                                    this.$Message.error(this.$t('addFail'));
                                }
                            });
                            updateConversationPictureAndName({
                                accountIds: this.bindingPageModalTableSelectList
                            }).then();
                        } else {
                            this.addPageLoading = false;

                            // 暂存返回结果
                            const resData = Array.isArray(data.data) ? data.data : [];
                            if (resData.length) {
                                // 有返回错误信息

                                // 根据返回结果整合提示语
                                let tipStr = this.$t('facebook.accountBinding.addPersonalPageFailTip');
                                if (resData.length) {
                                    tipStr += ', ';
                                    tipStr += resData.map(item => {
                                        return this.$t('facebook.accountBinding.addPersonalPageFailDetailTip').replace('$pageName', item.pageName).replace('$userName', item.userName);
                                    }).join('; ');
                                }

                                // 显示提示框
                                this.$alert(tipStr, this.$t('facebook.accountBinding.addFailed'), {
                                    confirmButtonText: this.$t('confirm'),
                                    showClose: false,
                                    type: 'warning'
                                }).then(_ => {
                                    this.bindingPageModal = false;
                                    this.getConfigList();
                                    this.syncFaceForm();
                                    this.syncFaceAnswer();
                                });
                            } else {
                                // 无返回错误信息

                                // 直接提示添加失败
                                this.$Message.error(this.$t('addFail'));
                            }
                        }
                    });
                } else {
                    this.$Message.info(this.$t('facebook.accountBinding.selectPage'));
                    this.addPageLoading = false;
                }
            },
            syncFaceForm() { /* 绑定主页后同步fb表单 */
                syncFacebookForm({
                    userId: this.userId,
                    providerId: 'facebook'
                });
            },
            syncFaceAnswer() {
                syncFacebookAnswer({
                    userId: this.userId,
                    providerId: 'facebook'
                });
            },
            // 删除账号时, 查询账号关联广告账户, 生成提示语
            getAccountUnbindTip(account) {
                return new Promise((resolve, reject) => {
                    // 定义默认提示
                    let tip = this.$t('facebook.accountBinding.unbindAccountDefaultTip');
                    getListByOauthConfigId({
                        orgId: this.enterpriseId,
                        oauthConfigId: account.id
                    }).then((response) => {
                        if (response.code === '1') {
                            let pageTips = [];
                            let adAccountTips = [];
                            // 如果有个人主页
                            const personalPages = this.pages.filter(page => account.id == page.accountId);
                            personalPages.forEach(page => {
                                pageTips.push(page.name);
                            });
                            // 如果有公司主页
                            const companyPages = this.companyPages.filter(page => account.id == page.accountId);
                            companyPages.forEach(page => {
                                pageTips.push(page.name);
                            });
                            // 如果有广告账户
                            const adAccounts = response.data;
                            adAccounts.forEach(account => {
                                adAccountTips.push(account.accountName);
                            });

                            // 拼接字符串
                            pageTips = this.joinTipStr(pageTips);
                            adAccountTips = this.joinTipStr(adAccountTips);
                            if (pageTips || adAccountTips) {
                                tip = this.$t('facebook.accountBinding.unbindAccountTips1'); // 'Facebook 个人账号解绑之后通过该账号绑定过的'
                                tip += pageTips ? (this.$t('facebook.accountBinding.unbindAccountTips2') + pageTips) : ''; // '主页'
                                tip += (pageTips && adAccountTips) ? this.$t('facebook.accountBinding.unbindAccountTips3') : ''; // '以及'
                                tip += adAccountTips ? (this.$t('facebook.accountBinding.unbindAccountTips4') + adAccountTips) : ''; // '广告账户'
                                tip += (pageTips && adAccountTips) ? this.$t('facebook.accountBinding.unbindAccountTips5') : ''; // '都'
                                tip += this.$t('facebook.accountBinding.unbindAccountTips6'); // '将被解绑，导致无法'
                                tip += pageTips ? this.$t('facebook.accountBinding.unbindAccountTips7') : ''; // '查看主页信息'
                                tip += (pageTips && adAccountTips) ? this.$t('facebook.accountBinding.unbindAccountTips8') : ''; // '和'
                                tip += adAccountTips ? this.$t('facebook.accountBinding.unbindAccountTips9') : ''; // '获取广告账户数据'
                                tip += this.$t('facebook.accountBinding.unbindAccountTips10'); // '，是否要继续？'
                            }
                        }
                        resolve(tip);
                    }).catch(err => {
                        console.error(err);
                        resolve(tip);
                    });
                });
            },
            // 拼接得到要放到提示语中的字符串, 格式为: 中文: 【A】、【B】和【C】, 英文: [A],[B] and [C]
            joinTipStr(arr) {
                if (arr.length > 0) {
                    let result = arr.slice(0, arr.length - 1).map(item => `${this.$t('openBracket')}${item}${this.$t('closedBracket')}`).join(this.lang === 'zh-CN' ? '、' : ', ');
                    if (arr.length > 1) {
                        result += this.lang === 'zh-CN' ? '和' : ' and ';
                    }
                    result += `${this.$t('openBracket')}${arr[arr.length - 1]}${this.$t('closedBracket')}`;
                    return result;
                }
                return '';
            },

            receivePostMessage(event) {
                if (event.data.code === '1') {
                    const res = event.data.data;
                    this.$Message.success(this.$t('facebook.accountBinding.bindSuccTip'));
                    /**
                     * @Description:
                     * 这部分是只有这两家企业需要多调一次接口，目前还没有上线，只是在测试环境
                     * @author 钟浩源
                     * @date
                     */
                    // if ((this.userId == 1219 && this.enterpriseId == 10330) || (this.userId == 70 && this.enterpriseId == 1002)) {
                    //     Util.ajaxInternational({
                    //         url: '/social/uploadFbAdvertisingData',
                    //         method: 'post',
                    //         params: {
                    //             userId: this.userId,
                    //             orgId: this.enterpriseId,
                    //             pageId: ''
                    //         }
                    //     }).then(response => {
                    //     });
                    // }

                    this.getConfigList();
                    // that.accounts.push({
                    //   account: res.providerUserId,
                    //   accountName: res.providerUserName,
                    //   headUrl: res.headUrl,
                    //   id: res.id,
                    //   userId: this.userId,
                    //   accessStatus:res.accessStatus
                    // })
                } else {
                    this.$Message.warning(event.data.message);
                }
            },
            // 目前 facebook.html 可能取不到 window.opener, 取不到时用 storage 传递数据
            onStorageFunc(e) {
                if (e.key === 'xhl-FB-bindRes') {
                    if (e.newValue) {
                        try {
                            const newValue = e.newValue ? JSON.parse(e.newValue) : '';
                            if (newValue) {
                                // 直接复用 postMessage 的处理方法
                                this.receivePostMessage({ data: newValue });
                            }
                        } catch (e) {
                            console.error('解析 xhl-FB-bindRes 错误');
                            console.error(e.newValue);
                        }
                        // 删除数据
                        localStorage.removeItem('xhl-FB-bindRes');
                    }
                }
            }
        }
    };
</script>

<style lang="less">
    .fb-account-binding {
        padding: 0 40px 40px;

        .invalid-tip {
            display: inline-block;
            text-align: center;
            font-size: 12px;
            color: #EA4335;
            margin-top: 6px;
        }

        .page-group-title {
            font-weight: 500;
            font-size: 16px;
            // color: rgba(0,0,0,0.80);
            color: #2d2f2e;
            margin: 30px 0;
        }

        .facebook-page-content {
            display: inline-block;
            vertical-align: top;
            width: calc(~"100%-400px");
        }

        .each-page-group {
            display: flex;
            /deep/ .el-button{
                margin: 10px 20px 0;
                height: 40px;
            }
            .invalid-btn {
                background: #E7ECF2;
                border-color: #E7ECF2;
                color: #6E819A;
                cursor: not-allowed;
                pointer-events:none
            }
        }

        .facebook-page-div {
            display: inline-block;
            margin-left: 20px;
            vertical-align: top;

            .facebook-page-box {
                display: flex;
                align-items: center;
                background: #FAFCFF;
                border: 1px solid #CBD6E2;
                border-radius: 4px;
                width: 208px;
                height: 58px;
                padding: 9px 20px;

                &-failure {
                    border: 1px solid #EA4335;
                }

                .company-page-icon {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                }

                .box-page-avatar {
                    height: 38px;
                    width: 38px;
                    border-radius: 19px;
                }

                .box-page-name {
                    display: inline-block;
                    vertical-align: middle;
                    font-size: 16px;
                    color: rgba(0, 0, 0, 0.80);
                    font-weight: 700;
                    margin: 0 10px;
                    width: calc(~"100%-38px-20px-15px");
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .box-page-delete {
                    cursor: pointer;
                    float: right;
                }
            }

            .box-page-invalid-tip {
                text-align: center;
                font-size: 12px;
                color: #EA4335;
                margin-top: 6px;
            }
        }
    }
</style>
