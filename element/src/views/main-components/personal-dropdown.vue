<template>
    <Row type="flex" justify="end" align="middle" class="user-dropdown-innercon">
        <div style="margin-top: 6px;">
            <Poptip style="padding: 12px 0px" v-model="showUserPannel" :popper-class="`${forbiddenClick ? 'click-forbidden-modal' : ''}`" placement="bottom-end" width="330" @show="poptipShow">
                <a class="account-avatar" :class="{'click-forbidden-modal-common': forbiddenClick}" style="position: relative;display:inline-block" href="javascript:void(0)" :title="userName" slot="reference">
                    <svg class="dropdown-avatar" aria-hidden="true" >
                        <use xlink:href="#custom-service-avatar"></use>
                    </svg>
                    <div :class="ServiceStatus" style="cursor: pointer;"></div>
                    <div id="v-step-menu-avator-click" v-if="forbiddenClick" class="click-forbidden-modal-common-child" @click.stop="stop"></div>
                </a>
                <div class="api" :class="{'click-forbidden-modal-padding': forbiddenClick}" style="font-size: 14px; padding: 0 8px" id="v-step-menu-avator" ref="personalSetBody">
                    <div class="accountTitle related-accounts">
                            <svg class="dropdown-avatar" aria-hidden="true" style="width: 40px;height: 40px;margin-right: 12px;">
                                <use xlink:href="#custom-touxiang"></use>
                            </svg>
                            <div style="width: calc(100% - 52px)">
                                <TooltipAuto :content="userName" style="font-size:16px;line-height:24px;color:#303133; font-weight: 600;"></TooltipAuto>
                                <div class="_f _j_b active">
                                    <span class="accountContent">{{orgName}}</span>
                                    <Button type="text" v-if="tenantList.length > 1" style="color: #3B78DE;float: right" @click="changeOrgId = enterpriseId;changeOrgvisible = true;">
                                        {{$t('per_setting.changeOrg')}}
                                    </Button>
                                </div>
                            </div>
                    </div>
                    <!-- 关联的其他账号列表, 可切换登录账号(集团公司才有, 目前只有乐达美业) -->
                    <!-- <div v-if="Array.isArray(relatedAccounts) && relatedAccounts.find(item => `${userId}` === `${item.userId}`)"
                         class="related-accounts">
                        <div class="setItem _j_b"
                             :class="{'item-clickable': `${userId}` !== `${item.userId}`, 'active': `${userId}` === `${item.userId}`}"
                             v-for="item in relatedAccounts"
                             :key="item.userId"
                             @click="toggleAccount(item)">
                            <TooltipAuto :content="item.userName"
                                         class="accountContent"></TooltipAuto>
                            <span v-show="`${userId}` === `${item.userId}`"
                                  style="float: right">
                                <Icon size="14"
                                      style="font-weight: bold"
                                      color="#4285F4"
                                      type="md-checkmark"/>
                            </span>
                        </div>
                    </div> -->
                    <!-- 没有关联账号, 显示当前账号登录名 -->
                    <!-- <div v-else
                         class="related-accounts">
                        <div class="setItem _j_b active">
                            <TooltipAuto :content="userName"
                                         class="accountContent"></TooltipAuto>
                            <span style="float: right">
                                <Icon size="14"
                                      style="font-weight: bold"
                                      color="#4285F4"
                                      type="md-checkmark"/>
                            </span>
                        </div>
                    </div> -->
                    <template v-if="!isWAPersonalEdition">
                        <div style="position: relative" v-if="isContainsMenu('xhl_chat') && hasChatAuthority">
                            <Spin fix v-if="updateStateLoading"></Spin>
                            <!-- 上线 -->
                            <div class="setItem item-clickable piwik_ChatSplitOnline _j_b"
                                 :class="isServiceOnline ? 'active': ''" @click="beforeIsOnline(true,1,1)">
                                <!-- <Badge is-dot type="success" :text="$t('per_setting.online')"/>-->
                                <div>
                                    <div class="online-dot"></div>
                                    {{$t('per_setting.online')}}
                                </div>
                                <span v-if="isServiceOnline" style="float: right">
                                <Icon size="14" style="font-weight: bold" color="#4285F4" type="md-checkmark"/>
                            </span>
                            </div>
                            <!-- 下线 -->
                            <div class="setItem item-clickable piwik_ChatSplitOffline _j_b"
                                 :class="!isServiceOnline ? 'active': ''" @click="beforeIsOnline(false,1,1)">
                                <div>
                                    <div class="offline-dot"></div>
                                    <!--  <Badge is-dot type="default" :text="$t('per_setting.offline')"/>-->
                                    {{$t('per_setting.offline')}}
                                </div>
                                <span v-if="!isServiceOnline" style="float: right">
                                <Icon size="14" style="font-weight: bold" color="#4285F4" type="md-checkmark"/>
                            </span>
                            </div>
                        </div>
                        <div class="setItem _f _j_b">
                            <span style="font-size: 12px;color: #666666;">{{$t('onlineService.onlineCustomer')}}</span>
                            <span class="item-clickable piwik_ChatSplitReloadService" @click="getAllEnterpriseService" style="float: right;margin-top: -2px">
                            <Icon :class="{ refreshActive : loading}" size="14" custom="custom-refresh"/>
                        </span>
                        </div>
                        <div style="position: relative">
                            <Spin fix v-if="loading"></Spin>
                            <div v-for="service in serviceList" :key="service.acctid" class="setItem">
                                <Tooltip effect="dark" :content="`${service.serverName || ''} (${service.visitorCount || 0})`" placement="bottom">
                            <span class="_personDropdownLongName"
                            >{{service.serverName + ' '}}</span>
                                </Tooltip>
                                <span>({{service.visitorCount}})</span>
                                <span style="position: absolute;right: 0">
                                <Icon v-if="service.isOnline === '1'" custom="custom custom-web-online" />
                                <span v-if="service.isOnline === '0'">
                                    <Icon v-if="service.mobileOnline === '1'" custom="custom custom-mini-program-online" />
                                </span>
                                <span v-else>
                                    <Icon v-if="service.mobileOnline === '1' && service.acctid !== AccId" custom="custom custom-mini-program-online" />
                                </span>
                            </span>
                            </div>
                        </div>
                        <div style="border-bottom: 1px solid #EAEAEA;height: 0;"></div>
                    </template>
                    <template v-if="!['customFor_12200'].includes(isCustomEdition)">
                        <div class="related-accounts" style="display: flex">
                            <!-- 增值服务清单 -->
                            <div class="setItem item-clickable" style="cursor: pointer;flex:1" slot="reference" @click="addedServicesList">{{$t('main.addedServicesList')}}</div>
                            <!-- 下载 App -->
                            <div v-if="!isWAPersonalEdition" class="setItem item-clickable" style="cursor: pointer;flex:1" slot="reference" @click="showDownLoadModal">{{$t('main.downloadApp')}}</div>
                        </div>
                        <!-- <div style="border-bottom: 1px solid #EAEAEA;height: 0;"></div> -->
                    </template>
                    <div class="related-accounts" style="display: flex">
                        <!-- 个人设置 -->
                        <div id="v-step-menu-person-set" style="flex:1" class="setItem item-clickable" :class="currentTab === 'perSetting' ? 'active' : ''"
                            @click="showPS">{{$t('per_setting.personalSetting')}}
                        </div>
                        <!-- 帮助中心 -->
                        <!-- <TriggerIconContainer v-if="isCustomEdition !== 'customFor_11802'"
                          @clickHelpIcon="handleFloatWindowChange('help')"></TriggerIconContainer> -->
                        <div class="setItem item-clickable" v-if="!['customFor_12200', 'customFor_11802'].includes(isCustomEdition)" style="cursor: pointer;flex:1" slot="reference"  @click="$emit('clickHelpIcon')">{{$t('main.helpCenter')}}</div>
                    </div>
                    <div class="related-accounts">
                        <div class="setItem item-clickable" @click="viewPass">{{$t('per_setting.viewPass')}}</div>
                    </div>
                    <!-- 退出登录 -->
                    <div class="setItem item-clickable piwik_ChatSplitLogout" style="color: #EA4335;" @click="logout">{{$t('main.logout')}}</div>

                    <div v-if="forbiddenClick" class="click-forbidden-modal-child" @click.stop="stop"></div>
                </div>
            </Poptip>
        </div>
        <Modal :visible.sync="showDownLoadModalVal"
            :title="$t('main.downloadAppTitle')"
            :append-to-body="true"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            height="369px"
            width="500px">
            <div style="text-align: center;color: rgba(0, 0, 0, 0.8);height:280px;padding-top: 0px;">
                <p style="margin:10px 0 20px;">{{$t('main.downloadAppText')}}</p>
                <img style="width:150px;height:173px;" :src="require('@/assets/images/appcode.png')" alt="" />
            </div>
        </Modal>
        <Modal :visible.sync="changeOrgvisible"
            :title="$t('per_setting.changeOrg')"
            :append-to-body="true"
            :modal-append-to-body="true"
            :close-on-click-modal="false"
            width="500px">
            <div style="padding: 0 60px;">
                <p style="margin:10px 0 20px;">{{$t('per_setting.currentTenant')}}{{orgName}}</p>
                <div style="height:406px; overflow-y: auto;">
                    <div class="tenant_list" v-for="item in tenantList" :key="item.orgId" :class="{'active': changeOrgId === `${item.orgId}`}" @click="selectOrg(item)">
                        <div class="tenant_name">
                            <span class="tenant_round">{{item.orgName.substring(0,1)}}</span>
                            <span>{{item.orgName}}</span>
                        </div>
                        <Icon custom="custom-duigou" size="20" v-if="changeOrgId === `${item.orgId}`"></Icon>
                    </div>
                </div>
            </div>
            <div slot="footer">
                <Button @click="changeOrgvisible = false">{{ $t('cancel') }}</Button>
                <Button type="primary" :loading="changeOrgLoading" @click="changeOrg">{{ $t('per_setting.changeBtn') }}</Button>
            </div>
        </Modal>
    </Row>
</template>

<script>
    import util from '@/libs/util';
    import Spin from './spin/spin.vue';
    import Cookies from 'js-cookie';
    import { mapState, mapGetters } from 'vuex';
    import * as SDK from '@/sdk/NIM_Web_SDK_v5.7.0.js';

    export default {
        name: 'personalDropdown',
        props: ['forbiddenClick', 'forcedDisplay'],
        components: {
            Spin
        },
        computed: {
            ...mapState({
                isSwitchChatState: state => state.isSwitchChatState,
                SDKCallbackState: state => state.SDKCallbackState,
                isReloadServerList: state => state.isReloadServerList,
                serviceList: state => state.serviceList,
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                AccId: state => state.AccId,
                LoginPorts: state => state.LoginPorts,
                relatedAccounts: state => state.relatedAccounts,
                hasChatAuthority: state => state.hasChatAuthority
            }),
            ...mapGetters([
                'isContainsMenu',
                'isWAPersonalEdition',
                'isCustomEdition'
            ]),
            ServiceStatus() {
                return this.isServiceOnline ? 'success-dot' : 'default-dot';
            }
        },
        data() {
            return {
                changeOrgvisible: false,
                changeOrgLoading: false,
                changeOrgId: '',
                tenantList: [],
                selectOrgData: null,
                orgName: '',
                showUserPannel: false,
                updateStateLoading: false,
                isServiceOnline: false,
                loading: true,
                currentTab: '', // 当前选中的tab
                changingOnlineStatus: null, // 正在发送请求想要变动到的在线状态
                cancelFunc: null, // 取消上一次变更在线状态请求
                showDownLoadModalVal: false,
                showStatus: false
            };
        },
        methods: {
            // 更新当前登录账号
            toggleAccount(account) {
                if (`${this.userId}` !== `${account.userId}`) {
                    this.$store.dispatch('toggleAccount', account);
                }
            },
            stop() {
                event.stopPropagation();
                return false;
            },
            changeShow(flag) {
                this.showUserPannel = flag;
            },
            /* 更新小程序状态 */
            updateWXStatus() {
                util.ajax({
                    url: '/cuss-login/mini_project/updateRunningStatus',
                    method: 'POST',
                    data: {
                        userId: this.userId,
                        runningStatus: 3
                    }
                }).then(res => {});
            },
            /* 小程序客服下线 */
            updateWXOnlineStatus() {
                util.ajaxInternational({
                    url: '/visitor-chat/server/updateEnterpriseidMobileOnlineStatusNew',
                    method: 'POST',
                    data: {
                        mobileOnline: 0,
                        operateSource: 'mini_program_outlogin',
                        accid: this.AccId
                    }
                }).then(res => {});
            },
            poptipShow() {
                if (this.showStatus) return;
                this.showStatus = true;
                if (!this.hasChatAuthority && this.$store.state.isServerOnlineChecked) {
                    this.isOnline(false, 1, 1);
                }
                this.getAllEnterpriseService();
            },
            // 给手动点击上下线按钮触发上下线也加上控制台日志
            beforeIsOnline(...args) {
                console.error('触发上下线方法, 事件类型: 手动点击上下线按钮', JSON.stringify(args), this.isServiceOnline);
                this.isOnline(...args);
            },
            /* index=1;主动改变聊天状态需要改变localStorage，以便其它tab页监听到变化；index=0;通过监听localStorage变化来改变当前聊天状态，不需要再次改变localStorage */
            /* type:1，可以清除实例；type:0，不可以清除实例 */
            isOnline(flag, index, type) {
                // 校验 flag 是否为 Boolean 型, 不是则退出流程
                if (![true, false].includes(flag)) {
                    console.error('isOnline 首个参数不为 Boolean 型, 取消变动客服状态');
                    return;
                }
                // 根据当前是否正在请求中以及请求的参数 + 当前客服在线状态, 来判断费否要取消本次 isOnline 请求
                if ([true, false].includes(this.changingOnlineStatus)) {
                    // 如果当前有"变更客服在线状态"请求
                    // 且该请求要变更到的状态和本次 isOnline 一致, 则不需要重新请求, 退出流程
                    if (this.changingOnlineStatus === flag) {
                        return;
                    } else {
                        // 否则取消上次请求准备重新请求, 准备发送新情求
                        if (typeof this.cancelFunc === 'function') {
                            this.cancelFunc();
                        }
                    }
                } else {
                    // 当前没有"更改客服在线状态"请求
                    // 且想要变动到的状态和当前状态一致, 不需要重新请求, 退出流程
                    if (this.isServiceOnline === flag) {
                        return;
                    }
                }
                const accId = Cookies.get('accId');
                console.log('Cookies', accId);
                if (!accId) {
                    this.$Message.error('请到聊天设置》客服分配规则，先设置可分配客服账号');
                    return;
                }
                // 正常请求
                // 变更 changingOnlineStatus , 标识当前正在请求变更客服在线状态
                this.changingOnlineStatus = flag;
                this.updateStateLoading = true;
                this.perSetting = '';
                const vm = this;
                util.ajaxInternational({
                    url: '/visitor-chat/server/updateEnterpriseidServiceOnlineStatusNew',
                    method: 'post',
                    data: {
                        accid: accId,
                        operateSource: 'front-end-chat',
                        onlineFlag: flag ? 1 : 0
                    },
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        // An executor function receives a cancel function as a parameter
                        vm.cancelFunc = c;
                    })
                }).then(res => {
                    console.error('上下线接口 updateEnterpriseidServiceOnlineStatusNew 确实被调用了, 外部方法传入参数为: ', flag, index, type);
                    console.error('接口参数为: ', accId, 'front-end-chat', flag ? 1 : 0);
                    console.error('是否成功? 返回 code :', res.data.code);
                    // 标识请求完成
                    this.changingOnlineStatus = null;
                    // 清空 cancelFunc
                    this.cancelFunc = null;
                    this.updateStateLoading = false;
                    if (res.data.code === '1') {
                        this.showUserPannel = false;
                        this.isServiceOnline = flag;
                        if (flag) {
                            if (index === 1) {
                                const temp = `on${Date.now()}`;
                                localStorage.setItem('chatStampList', temp);

                                this.updateWXStatus();
                                this.updateWXOnlineStatus();
                            }
                            if (!this.$store.state.nim) {
                                console.log('连接SDK');
                                // 连接SDK
                                this.$store.dispatch('initNimSDK', SDK);
                            }
                            this.$store.state.isServerOnlineChecked = true;
                        } else {
                            if (index === 1) {
                                localStorage.setItem('chatStampList', Date.now());
                            }
                            if (type === 1 && this.$store.state.nim) {
                                this.$store.commit('resetChat');
                            }
                            this.$store.state.isServerOnlineChecked = false;
                        }

                        // 当客服在线状态发送改变的时候，刷新客服在线列表
                        this.$store.state.isReloadServerList = flag;
                        /** 重置标志： 初始时开启聊天的按钮 */
                        this.$store.state.isSwitchChatState = '';
                    } else {
                        this.$Notice.error({
                            title: '更改客服状态失败，请稍后再试！',
                            desc: ''
                        });
                    }
                }).catch((error) => {
                    if (!util.axios.isCancel(error)) {
                        // 标识请求完成
                        this.changingOnlineStatus = null;
                        // 清空 cancelFunc
                        this.cancelFunc = null;
                        this.updateStateLoading = false;

                        this.$Notice.error({
                            title: '更改客服状态失败，请稍后再试！',
                            desc: ''
                        });
                    }
                });
            },
            logout() {
                this.$emit('seeUserOnline');
            },
            showPS() {
                if (this.forbiddenClick) {
                    event.stopPropagation();
                    return false;
                }
                this.showUserPannel = false;
                this.currentTab = 'perSetting';
                this.$router.push({
                    name: 'set'
                });
            },
            getAllEnterpriseService() {
                this.loading = true;
                util.ajaxInternational({
                    url: '/visitor-chat/server/getAllEnterpriseService',
                    method: 'POST',
                    data: {
                        enterpriseId: this.enterpriseId
                    }
                }).then(response => {
                    this.loading = false;
                    if (response.data) {
                        this.$store.commit('setServiceList', response.data);
                    }
                }).catch(() => {
                    this.loading = false;
                });
            },
            showDownLoadModal() {
                this.showDownLoadModalVal = true;
            },
            addedServicesList() {
                window.open('https://www.yuque.com/help.leadscloud/faq_guide/qoe5gdmdqgg058f4?singleDoc#', '_blank');
            },
            selectOrg(item) {
                this.changeOrgId = `${item.orgId}`;
                this.selectOrgData = item;
            },
            changeOrg() {
                if (this.changeOrgId === this.enterpriseId) return;
                this.changeOrgLoading = true;
                const selectOrgData = this.selectOrgData;
                this.$commonApi.userLoginForOrg({
                    orgId: selectOrgData.orgId,
                    userId: selectOrgData.userId,
                    larkId: selectOrgData.larkId,
                    accountToken: Cookies.get('accountToken')
                }).then(res => {
                    if (res.code === 10000) {
                        const { accessToken, refreshToken, accountToken } = res.data;
                        localStorage.setItem('current_tenant', JSON.stringify(selectOrgData));
                        // 设置 cookie/token
                        Cookies.set('accessToken', accessToken);
                        Cookies.set('refreshToken', refreshToken);
                        Cookies.set('accountToken', accountToken);
                        // Cookies.set('fullName', encodeURI(selectOrgData.fullName));
                        // Cookies.set('userName', selectOrgData.nickName);
                        Cookies.set('userId', selectOrgData.userId);
                        Cookies.set('enterpriseId', selectOrgData.orgId);
                        window.location.reload();
                    } else {
                        this.$Message.error(res.messageShow);
                        this.changeOrgLoading = false;
                    }
                });
            },
            viewPass() {
                const currentTenant = JSON.parse(localStorage.getItem('current_tenant'));
                const url = this.$router.resolve({
                    name: 'gatePassDetail',
                    query: {
                        value: currentTenant.larkId
                    }
                }).href;
                this.$stm.openNewWindow(url);
            }
        },
        watch: {
            showUserPannel(val) {
                // 提示步骤时强制显示
                if (this.forbiddenClick) {
                    if (!val) {
                        this.$nextTick(function() {
                            this.showUserPannel = this.forcedDisplay;
                        });
                    }
                }
            },
            isReloadServerList() {
                this.getAllEnterpriseService();
            },
            // 云信多端登录, 触发下线
            LoginPorts: {
                handler(val) {
                    console.log(`LoginPorts= ${val}`);

                    // 收到其他端下线通知
                    if (!val) {
                        console.error('触发上下线方法, 事件类型: watch LoginPorts', val);
                        /**
                         * @Description: 对云信触发下线通知的机制了解不深无法把控, 导致客户收意外到其他端下线通知自动下线
                         * 于是将原本的"收到通知调用接口上下线同步状态"改为"收到通知更新客服列表, 以客服列表的同步状态机制实现同步"
                         * @author 汤一飞
                         * @date 2023/4/10
                         */
                        // this.isOnline(Boolean(val), 0, 1);
                        this.getAllEnterpriseService();
                        this.$store.state.LoginPorts = true;

                        // 保险起见, 5s 后再调用一次接口, 避免其他标签页调用下线接口成功的时机和当前标签页重新获取在线状态的时机刚好错开
                        setTimeout(() => {
                            this.getAllEnterpriseService();
                        }, 5000);
                    }
                },
                deep: true

            },
            // 聊天界面, 左侧列表手动点击按钮上线/请求接口获取在线状态未下线后改此数据为下线, 触发上下线方法
            isSwitchChatState: {
                handler(val) {
                    if (val === 'Login') {
                        console.error('触发上下线方法, 事件类型: watch isSwitchChatState', val);
                        this.isOnline(true, 1, 1);
                    } else if (val === 'Logout') {
                        console.error('触发上下线方法, 事件类型: watch isSwitchChatState', val);
                        this.isOnline(false, 1, 1);
                    } else if (val === 'APP Login') {
                        console.error('触发上下线方法, 事件类型: watch LoginPorts(通过 isSwitchChatState 实现) --- APP Login', val);
                        this.isOnline(false, 1, 1);
                    }
                },
                deep: true
            },
            // 云信 SDK 链接状态变化, 触发上下线
            SDKCallbackState: {
                handler(val) {
                    console.log('SDKCallbackState', val);
                    if (val === 'connect') {
                        console.error('触发上下线方法, 事件类型: watch SDKCallbackState', val);
                        this.isOnline(true, 0, 0);
                    } else if (val === 'disconnect') {
                        console.error('触发上下线方法, 事件类型: watch SDKCallbackState', val);
                        this.isOnline(false, 0, 0);
                    }
                },
                deep: true
            },
            // 发现各页面设置的全局客服列表中, 当前页此客服的在线状态和客服列表中的在线状态不一致, 调用上下线方法
            serviceList: {
                handler(val) {
                    if (this.AccId && Array.isArray(val)) {
                        const server = val.find(item => item.acctid === this.AccId && item.isOnline === '1');
                        const isOnline = Boolean(server);
                        if (isOnline !== this.isServiceOnline) {
                            console.error('触发上下线方法, 事件类型: serviceList 状态不匹配', JSON.stringify(val), this.isServiceOnline);
                            this.isOnline(isOnline, 1, 1);
                        }
                    }
                },
                deep: true
            }
        },
        created() {
            if (localStorage.getItem('xhl_account_data')) {
                const accountData = JSON.parse(localStorage.getItem('xhl_account_data'));
                this.tenantList = accountData.userRelatedOrgDtoList || [];
            }
            if (localStorage.getItem('current_tenant')) {
                const currentTenant = JSON.parse(localStorage.getItem('current_tenant'));
                this.orgName = currentTenant.orgName;
            }
            this.changeOrgId = this.enterpriseId;
            this.getAllEnterpriseService();
        }
    };
</script>
<style lang="less" scoped>
    .dropdown-avatar {
        width: 30px;
        height: 30px;
        /*vertical-align: -0.15em;*/
        fill: currentColor;
        overflow: hidden;
    }

    .refreshActive {
        -webkit-animation: switch-loading 1s linear;
        animation: switch-loading 1s linear;
        -webkit-animation-iteration-count: infinite;
        animation-iteration-count: infinite;
    }
    .v-step-menu-avator {
        color: #333;
    }
    .online-dot, .offline-dot{
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 1px solid #FFFFFF;
        background-color: #e6ebf1;
    }
    .default-dot, .success-dot{
        width: 10px;
        height: 10px;
        position: absolute;
        bottom: 5px;
        right: 0;
        border-radius: 50%;
        border: 1px solid #FFFFFF;
    }
    .default-dot{
        background: #B9BFC1;
    }
    .offline-dot{
        background: #c8cbcc;
    }
    .success-dot, .online-dot {
        background: #00CC99;
    }

    .item-clickable {
        cursor: pointer;
    }

    .center-right {
        float: right;
    }

    .setItem {
        padding: 10px 0px;
        /*margin: 0 -12px;*/
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .setItem:hover {
        background-color: #f4f5f8;
    }
    .related-accounts {
        border-bottom: 1px solid #EAEAEA;
        color: #303133;
        /*padding-bottom: 5px;
        margin-bottom: 5px;*/
    }

    .accountTitle {
        width: 100%;
        padding: 0 0px 16px;
        margin-bottom: 10px;
        font-size: 12px;
        color: #303133;
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
    }

    .accountContent {
        max-width: 70%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #606266;
        font-size: 14px;
        line-height: 22px;
    }
    .tenant_list {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        background: #F5F7FA;
        margin-bottom: 2px;
        font-size: 16px;
        color: #303133;
        cursor: pointer;
        .tenant_round {
            display: inline-block;
            margin-right: 8px;
            width: 42px;
            line-height: 42px;
            background: #4285F2;
            border-radius: 50%;
            text-align: center;
            font-weight: bold;
            color: #fff;
        }
        &:hover {
            background: #E1E7EE;
        }
    }
    .tenant_list.active {
        background: #4285F2;
        color: #fff;
        .tenant_round {
            background: #fff;
            color: #4285F2;
        }

    }
</style>
