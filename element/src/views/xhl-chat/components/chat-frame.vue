<template>
    <div class="chat-frame-container">
        <!-- 全屏时的 header -->
        <div v-if="source==='FullScreen'" class="frame-top">
            <!-- 头像 -->
            <div class="frame-top-item" style="margin-right: 8px;">
                <!--<Avatar size="large" :src="currAvatar"/>-->
                <svg class="chat-svg-avatar" aria-hidden="true">
                    <use :xlink:href="currAvatar"></use>
                </svg>
            </div>
            <!--  昵称 + ID -->
            <div class="frame-top-item">
                <div class="top-nick">
                    <span style="display: none">{{getRemark}}</span>
                    <span class="nick">{{currSessionName}}</span>
                    <div class="nick-remark" style="vertical-align: text-bottom;height: 20px">
                        <div v-if="!isEdit" style="display: flex;min-width: 100px;height: 20px;vertical-align: bottom">
                            <span class="remark-text">{{Remark}}</span>
                            <span style="margin-left: 10px;"><Icon class="edit-remark-btn piwik_ChatEditRemark"
                                                                   color="#bec2c9" custom="custom custom-remark-edit"
                                                                   size="14" @click.native="editRemark"/></span>
                        </div>
                        <Input v-else ref="remarkInput" v-model="remark" class="nick-remark-input" size="small"
                               :placeholder="$t('chat.remarkPlaceholder')" @blur="remarkName"/>
                    </div>
                </div>
                <div>
                    <span id="currVisitorId"
                          v-clipboard:copy="currVisitorId"
                          v-clipboard:success="onCopy"
                          v-clipboard:error="onError"
                          class="visitor-id">ID:{{ currVisitorId || $t('chat.notHave') }}</span>
                </div>
            </div>
            <!-- 修改状态 + 状态图标 -->
            <div class="frame-top-item" style="display: flex;align-items: center;float: right;margin-right: 10px;margin-top: 13px;">
                <crmArchiveStatus @showDetail="showCrm" :status="Number(visitorBaseInfo.crmStatus)"></crmArchiveStatus>
            </div>
            <!-- <div class="frame-top-item" style="display: flex;align-items: center;float: right;margin-right: 10px;margin-top: 13px;">
                <Dropdown v-if="['1','3'].includes(statusFlag)"
                          trigger="click"
                          @command="handleStatusUpdate">
                    <span class="frame-status-wrapper">
                        <div class="frame-status"
                             @click.stop="trigger_updateStatus">
                            {{ statusLabel }}
                            <Icon type="ios-arrow-down"></Icon>
                        </div>
                    </span>
                    <DropdownMenu slot="dropdown"
                                  class="handle-status-dropdown-menu">
                        <DropdownItem v-for="item in statusOptions"
                                      :key="item.value"
                                      :command="item.value"
                                      :disabled="statusFlag === item.value">{{ item.label }}</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <span v-show="['1','2','102'].includes(statusFlag)">
                    <span v-if="statusFlag==='1'">
                        <Button v-if="authorized_button['enterClue']" @click="changeModel(false)" style="padding: 0 7px;height: 24px;font-size: 12px;">{{$t('littleDrawer.enterClues')}}</Button>
                        <template v-if="!is_marketing_station">
                            <Button v-if="authorized_button['enterCustomer']" @click="changeModel(true)" style="padding: 0 7px;height: 24px;font-size: 12px;">{{ $t('littleDrawer.enterCustomer') }}</Button>
                        </template>
                        <template v-else>
                            <Poptip width="390" placement="bottom-end" trigger="hover">
                                <Button slot="reference" v-if="authorized_button['enterCustomer']" style="padding: 10px 11px;">{{ $t('littleDrawer.enterCustomer') }}</Button>
                                <div>{{$t('administerAMP.wordPress.errorTips')}}</div>
                            </Poptip>
                        </template>
                    </span>
                    <Tooltip :content="statusFlag === '102' ? $t('clue.inquiry') : $t('clue.clue')"
                             placement="left" v-else>
                        <svg class="svg-icon" aria-hidden="true" @click="showCrm()"
                             :style="{cursor:isShowTinyDetail ? 'not-allowed':'pointer',width:'24px', height:'24px',verticalAlign: 'bottom'}">
                            <use v-if="statusFlag === '2'" xlink:href="#custom-clue"></use>
                            <use v-else-if="statusFlag === '102'" xlink:href="#custom-inquiry"></use>
                        </svg>
                    </Tooltip>
                </span>
            </div> -->
        </div>

        <!-- 分屏时的 header -->
        <div v-else class="split-frame-top">
            <div class="chat-arrow-back piwik_ChatSplitBack" @click="backToList"
                 style="position: absolute;padding-left: 10px;cursor: pointer">
                <!--<Icon type="ios-arrow-back" size="14" />-->
                <Icon custom="custom custom-floating-window-arrow" size="14"
                      class="floating-window-header-back-arrow"></Icon>
                <span style="font-size: 14px;margin-left: 5px">{{$t('menu.xhl_chat')}}</span>
            </div>
            <span style="font-size: 16px;color: rgba(0,0,0,0.80);font-weight: bold;">{{currSessionName}}</span>
            <!-- 修改分屏时弹窗弹出逻辑 -->
            <div style="position: absolute; top: 5px; right: 0; padding-right: 10px;padding-left: 15px">
                <!--<Icon custom="custom custom-floating-window-enter-clue" style="margin-right: 23px" size="18"/>-->
                 <!-- v-if="statusFlag!=2 && statusFlag!=102" -->
                <Tooltip :content="$t('clue.history')" placement="left">
                    <Icon custom="custom custom-track-info-header" class="piwik_ChatSplitInfo" @click="showSplitInfo()"
                          size="18" style="cursor: pointer;"/>
                </Tooltip>
                <!-- <Tooltip placement="left" :content="$t('clue.clue')" v-else-if="statusFlag==2" class="logo-btn">
                    <Icon custom="custom custom-clue" size="20" @click="showSplitInfo()"
                          style="cursor: pointer;"></Icon>
                </Tooltip>
                <Tooltip placement="left" :content="$t('clue.inquiry')" v-else-if="statusFlag==102" class="logo-btn">
                    <Icon custom="custom custom-inquiry" size="20" @click="showSplitInfo()"
                          style="cursor: pointer;"></Icon>
                </Tooltip> -->
            </div>
        </div>

        <!-- 聊天窗口 -->
        <div @scroll="removeUnreadMsgs"
             id="frame-main"
             :class="classObject">
            <msg-frame :unreadMsgs.sync="unreadMsgs"></msg-frame>
        </div>

        <!-- 底部发送框 + 未读消息 badge -->
        <div class="frame-footer">
            <!-- 正在输入中区域 -->
            <div class="input-right-now"
                 :class="source==='SplitScreen'?{'input-right-now-split-screen':true}:{'input-right-now-full-screen':true}">
                <div v-if="visitorInputingInfo.isInput" style="color:red">{{currSessionName}} {{ $t('chat.isInputing') }}</div>
                <div v-if="disableChat[currVisitorId] !== true" style="padding-right:16px" class="visitor-input-content">{{$t('chat.followingIs')}}{{currSessionName}}{{$t('chat.toSendContent')}}:{{visitorInputingInfo.inputingContent}}</div>
            </div>
            <!-- 底部新消息提示 -->
            <Badge :hidden="unreadMsgs.length <= 0"
                   :value="`${unreadMsgs.length} ↓`"
                   @click.native="scrollToBottom"
                   class="chat-new-message"></Badge>
            <msg-send :to="currSessionId"
                      :parentView="source"
                      ref="msgSend"
                      @letShortcutsShow="shortCutsShow"></msg-send>
        </div>
        <!-- 话术列表 -->
        <short-cuts
                v-show="isShortcutsShow"
                :controVerbalIcon="controVerbalIcon"
                @letShortcutsShow="shortCutsShow"
                @verbalSelected="selVerbal"
                content_height="100%"
        ></short-cuts>

        <!-- 录入询盘 -->
        <clueModal v-model="inputClue"
                   :title="$t('visitor_history.add_clue')"
                   class="modal companydata"
                   :delLoading="delLoading"
                   :json_data.sync="json_data"
                   :createCustomer.sync="createCustomer"
                   feedback="google"
                   type="xhl_chat"
                   :saveClueAndInquiryClass="'chat-frame-saveClueAndInquiry'"
                   :saveClueClass="'chat-frame-saveClue'"
                   :okEnterInquiryClass="'chat-frame-enterInquiry'"
                   @returnLeadsId="changeStatusInput"
                   @on_cancle_clue="on_cancle_clue"
                   @open_close="open_close">
            <!-- :returnLeadsId="update" -->
        </clueModal>
    </div>
</template>

<script>
    import msgSend from './msg-send.vue';
    import msgFrame from './msg-frame.vue';
    import clueModal from '../../main-components/enter-clue/enter-clue.vue';
    import shortCuts from '@/views/main-components/Shortcuts.vue';
    import crmArchiveStatus from '@/views/main-components/crmArchiveStatus';
    import util from '../../../libs/util';
    import { mapState, mapActions } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';

    export default {
        name: 'chat-frame',
        components: {
            msgSend,
            msgFrame,
            clueModal,
            shortCuts,
            crmArchiveStatus
        },
        props: {
            source: {
                type: String
            }
        },
        data() {
            return {
                observer: null,
                msgHeight: 0,
                recordOldValue: '',
                firedNum: 0,
                controVerbalIcon: 0,
                Remark: '',
                remarkSessionId: '',
                isShortcutsShow: false,
                isEditRemarkShow: false,
                inputClue: false,
                remark: '', // 备注
                isEdit: false,
                statusFlag: '1',
                sourceCrmStatus: '1',
                delLoading: false,
                json_data: {},
                statusOptions: [{
                    value: '1',
                    label: this.$t('chat.noEntry')
                }, {
                    value: '3',
                    label: this.$t('chat.nothingWith')
                }],
                /**
                 * @Description: 新增底部新消息提示, 与 msg-frame 联动
                 * @author 汤一飞
                 * @date 2020/5/18
                */
                unreadMsgs: [], // 位于视口底部未读的新消息
                removeUnreadMsgs: this.$debounce((e) => {
                    if (e && e.target && e.target.id.includes('frame-main')) {
                        // 关闭 select 下拉选框
                        if (document.querySelector('.poptip-block')) {
                            document.querySelector('.poptip-block').click();
                        }
                    }
                    // 计算未读消息数
                    this.unreadMsgs = this.unreadMsgs.filter(item => {
                        const DOM_item = document.getElementById(`${item.idClient}-${item.type}`);
                        if (DOM_item) {
                            // 暂存聊天窗 Dom
                            const DOM_frame = document.getElementById('frame-main');
                            const offsetTop = DOM_item.offsetTop;
                            const scrollTop = DOM_frame.scrollTop;
                            const offsetHeight = DOM_frame.offsetHeight;
                            if (offsetTop > scrollTop + offsetHeight) {
                                // 如果消息仍在视口之下, 则继续保存在 unreadMsgs 中
                                return true;
                            }
                        }
                    });
                }, 100)// 聊天框 scroll 监听器

            };
        },

        computed: {
            ...mapState({
                orgId: state => state.enterpriseId,
                userId: state => state.userId,
                currVisitorId: state => state.currVisitorId,
                currVisitorType: state => state.currVisitorType,
                currSign: state => state.currSign,
                currAvatar: state => state.currAvatar,
                currSessionId: state => state.currSessionId,
                visitorBaseInfo: state => state.visitorBaseInfo,
                isShowTinyDetail: state => state.isShowTinyDetail,
                visitorInputStatus: state => state.visitorInputStatus,
                inputIngVisitorId: state => state.inputIngVisitorId,
                visitorInputInfos: state => state.visitorInputInfos,
                disableChat: state => state.disableChat,
                button_list: state => state.app.button_list,
                is_marketing_station: state => state.app.is_marketing_station,
                translateShow: state => state.translateShow
                // visitorInputingContent: state => state.visitorInputingContent
            }),
            authorized_button() {
                const buttonIds = BUTTON_IDS.chat;
                return {
                    enterClue: !HANDLE_BUTTON(buttonIds.enterClue, this.button_list),
                    enterCustomer: !HANDLE_BUTTON(buttonIds.enterCustomer, this.button_list)
                };
            },
            visitorInputingInfo() {
                let temp = {};
                this.visitorInputInfos.forEach(item => {
                    if (item.inputIngVisitorId === this.currVisitorId) {
                        temp = item;
                    }
                });
                return temp;
            },
            classObject() {
                return this.source === 'FullScreen' ? 'chat-full-main' : 'chat-split-main';
            },
            statusLabel() {
                const statusObj = this.statusOptions.find(item => item.value === this.statusFlag);
                return statusObj ? statusObj.label : 'unknown';
            },
            getRemark() {
                this.Remark = this.$store.state.currSign;
                this.remark = this.$store.state.currSign;
                return this.$store.state.currSign;
            },
            currSessionName() {
                return this.$store.state.currSessionName;
            }
        },
        created() {
            // 获取全部销售人员
            this.$store.dispatch('getSalesList');
            this.getXSShow();
        },
        mounted() {
            // 当输入框高度变化时，相对应的改变正在输入的位置
            const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
            const element = document.querySelector('.el-textarea__inner');
            this.observer = new MutationObserver((mutationList) => {
                for (const mutation of mutationList) {
                    console.log('mutation', mutation);
                }
                const height = getComputedStyle(element).getPropertyValue('height');
                console.log('height', height);
                if (height === this.recordOldValue) return;
                this.recordOldValue = height;
                this.msgHeight = this.recordOldValue.slice(0, this.recordOldValue.length - 2) - 0 + 80;
                this.firedNum += 1;
            });
            this.observer.observe(element, { attributes: true, attributeFilter: ['style'], attributeOldValue: true });
        },
        methods: {
            ...mapActions([
                'getVisitorReception' // 获取访客最近接待客服是否在线, 当前是否正在聊天
            ]),
            /* 分屏时返回列表 */
            backToList() {
                // 显示聊天列表
                this.$store.commit('updateCurrInterface', 'splitChatList');
                // 重置当前聊天的未读消息
                this.$store.state.nim.setCurrSession('');
            },
            /* 分屏相关start */
            /* 选中话术 */
            selVerbal(item) {
                const verbalIndex = this.currVisitorId;
                this.$store.state.msgToSentTemp[verbalIndex] = item.content.verbalContent;
                this.$store.state.msgToSentTemp = Object.assign({}, this.$store.state.msgToSentTemp);
                this.isShortcutsShow = false;
            },
            shortCutsShow(val) {
                this.isShortcutsShow = val;
            },
            /* 分屏相关end */
            showSplitInfo() {
                this.$emit('switchInfo', this.statusFlag);
            },
            onCopy() {
                this.$Message.success(this.$t('chat.copySuccess'));
            },
            onError() {
                this.$Message.error(this.$t('chat.copyFail'));
            },
            async editRemark() {
                // 判断当前 visitorId 是否可以或正在被当前客服接待, 是则可以各种操作访客数据或发消息
                const ret = await this.getVisitorReception(this.currVisitorId);
                if (ret) {
                    this.isEdit = true;
                    this.remarkSessionId = this.currSessionId;
                    // 手动聚焦输入框
                    this.$nextTick(() => {
                        this.$refs.remarkInput.focus();
                    });
                }
            },
            // 备注验证
            async remarkName() {
                // 判断当前 visitorId 是否可以或正在被当前客服接待, 是则可以各种操作访客数据或发消息
                const ret = await this.getVisitorReception(this.currVisitorId);
                if (ret) {
                    this.allowRemarkName();
                } else {
                    this.isEdit = false;
                }
            },
            // 备注
            allowRemarkName() {
                const temp = this.remark ? this.remark.trim() : '';
                if (temp.length > 256) {
                    // this.remarkLoading = false;
                    this.$Message.warning(this.$t('chat.remarkTip1'));
                    return;
                }
                // this.remarkLoading = true;
                util.ajaxInternationalJson({
                    url: '/piwik/visitorInfo/updateCategoriesOrRemark',
                    method: 'post',
                    data: {
                        visitorId: this.currVisitorId,
                        visitorAccId: this.$store.state.currSessionId,
                        visitorRemark: temp,
                        updateUserId: this.userId,
                        orgId: this.orgId
                    }
                }).then(response => {
                    // this.remarkLoading = false;
                    this.isEdit = false;
                    if (response.data.code === '1') {
                        this.$Message.success(this.$t('chat.remarkTip2'));
                        if (this.remarkSessionId === this.currSessionId) {
                            this.$store.state.currSign = temp;
                            this.Remark = this.remark;
                        }
                        // 同时修改列表中的备注
                        if (this.$store.state.chattingList[this.remarkSessionId]) {
                            this.$set(this.$store.state.chattingList[this.remarkSessionId], 'sign', temp);
                        } else if (this.$store.state.onlineList[this.remarkSessionId]) {
                            this.$set(this.$store.state.onlineList[this.remarkSessionId], 'sign', temp);
                        } else if (this.$store.state.offlineList[this.remarkSessionId]) {
                            this.$set(this.$store.state.offlineList[this.remarkSessionId], 'sign', temp);
                        }
                        // 同时修改数据源
                        this.$set(this.$store.state.personList[this.remarkSessionId], 'sign', temp);
                        this.remarkSessionId = '';
                    } else {
                        this.remark = this.Remark;
                        this.$Message.error(this.$t('chat.remarkTip3'));
                    }
                });
            },
            // 触发更新状态 dropdown 前校验是否可展开
            async trigger_updateStatus(e) {
                // 判断当前 visitorId 是否可以或正在被当前客服接待, 是则可以各种操作访客数据或发消息
                const ret = await this.getVisitorReception(this.currVisitorId);
                if (ret) {
                    // 如果可以操作, 则手动触发 dropdown 的 trigger 元素点击事件
                    e.target.parentElement.click();
                }
            },
            // 更新状态
            handleStatusUpdate(status) {
                if (this.statusFlag === status) {
                    return;
                }
                const statusObj = this.statusOptions.find(item => item.value === status);
                statusObj && this.$confirm(
                    // `${this.$t('visitor_history.confirm_to')}${statusObj.label}`,
                    `${this.$t('visitor_history.confirm_to')}访客状态${this.$t('visitor_history.set')}【${statusObj.label}】?`,
                    this.$t('visitor_history.confirm_change'),
                    {
                        showClose: true,
                        closeOnClickModal: false,
                        closeOnPressEscape: false
                    }
                ).then(() => {
                    this.changeStatus(status);
                });
            },
            // 修改状态
            async changeStatus(val) {
                // 判断当前 visitorId 是否可以或正在被当前客服接待, 是则可以各种操作访客数据或发消息
                const ret = await this.getVisitorReception(this.currVisitorId);
                if (ret) {
                    util.ajaxInternationalJson({
                        url: '/piwik/visitorInfo/updateVisitorStatus',
                        method: 'POST',
                        data: {
                            visitorId: this.currVisitorId,
                            orgId: this.orgId,
                            originalVisitorStatus: this.sourceCrmStatus,
                            visitorStatus: val,
                            updateUserId: this.userId
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            this.$store.commit('updateVisitorInfo', Object.assign(this.visitorBaseInfo, {
                                crmStatus: val
                            }));
                            // this.$Message.success(this.$t('editSuccess'));
                            switch (val) {
                                case '1':
                                    this.$Message.success(`访客状态${this.$t('visitor_history.reset_success')}`);
                                    break;
                                case '2':
                                    break;
                                case '3':
                                    this.$Message.success(`访客状态${this.$t('visitor_history.trash_success')}`);
                                    break;
                            }
                        } else {
                            res.data.message && this.$Message.error(res.data.message);
                        }
                    });
                }
            },

            changeStatusInput(clueId, status) {
                this.$store.commit('updateVisitorInfo', Object.assign(this.visitorBaseInfo, {
                    crmStatus: `${status}`
                }));
                // 如果是在小屏录入线索的话,需要回调
                if (this.source === 'SplitScreen') {
                    this.$emit('changeStatus', status);
                }
            },

            // 点击显示询盘或线索详情页
            /**
             * @Date: 2020-04-30 17:25:21
             * @LastEditors: niumkiki
             * @description:
             *      原来的逻辑如果录入的话直接弹出线索或询盘详情页
             *       现在改成：点击图标时再弹出，所以需要再点击图标时调接口获取询盘或者线索或公司id
             * @param :
             * @return:
             */
            showCrm() {
                localStorage.setItem('openSlideBarForWA', true);
                this.$store.state.isShowTinyDetail = true;
                // this.getCompanyIdByVisitorId();
                // this.getInquiryIdByVisitorId(this.currVisitorId);
            },
            /* 根据访客id获得企业或线索id */
            // getCompanyIdByVisitorId() {
            //     util.ajax({
            //         url: '/crm/entityRelation/getCompanyIdByVisitorId',
            //         method: 'post',
            //         data: {
            //             orgId: this.orgId,
            //             visitorId: this.currVisitorId
            //         }
            //     }).then(ret => {
            //         if (ret.data.code === '1') {
            //             if (ret.data.data.type === 'clueType') {
            //                 this.$store.state.currClueId = ret.data.data.clueId;
            //             } else {
            //                 this.$store.state.currCompanyId = ret.data.data.companyId;
            //             }
            //             this.$store.state.isShowTinyDetail = true;
            //             this.$store.state.currVisitorType = ret.data.data.type;
            //         }
            //     });
            // },
            /* 根据访客id获得询盘id */
            getInquiryIdByVisitorId(visitorId) {
                util.ajax({
                    url: '/crm/inquiry/getInquiryIdByVisitorId',
                    method: 'post',
                    data: {
                        orgId: this.orgId,
                        visitorId: visitorId
                    }
                }).then(async ret => {
                    if (ret.data.code === '1') {
                        // 产品要求给特定客户加上 CRM 校验负责人权限功能, 此处先设置 10110 配合测试, 测完给出 orgId 后再调整
                        if (['1001', '12034'].includes(`${this.orgId}`)) {
                            const isHavePrivilegeToOpenCrm = await this.getCrmPrivilege(ret.data.data);
                            if (!isHavePrivilegeToOpenCrm) {
                                this.$Message.error(this.$t('visitor_history.haveNoPrivilege'));
                                return;
                            }
                        }

                        if (ret.data.data.type === 1) {
                            this.$store.state.currInquiryId = ret.data.data.id[0];
                            this.$store.state.currVisitorType = 'crmType';
                        } else if (ret.data.data.type === 2) {
                            this.$store.state.currClueId = ret.data.data.id[0];
                            this.$store.state.currVisitorType = 'clueType';
                        } else {
                            this.$store.state.currVisitorType = '';
                        }
                        this.$store.state.isShowTinyDetail = true;
                    }
                });
            },
            // 判断客户是否有 CRM 数据权限
            getCrmPrivilege(data) {
                return new Promise((resolve, reject) => {
                    util.ajax({
                        url: 'crm/inquiry/getFormOrInquiryDetailInfo',
                        method: 'get',
                        params: {
                            type: data.type,
                            id: data.id[0],
                            userId: this.userId,
                            orgId: this.orgId
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            return resolve(res.data.data);
                        }
                    });
                });
            },
            on_cancle_clue(data) {
                this.inputClue = data.close;
                this.createCustomer = data.close;
            },
            open_close(data) {
                // 保存成功改变状态
                if (data.Status === 101) {
                    this.$store.commit('updateVisitorInfo', Object.assign(this.visitorBaseInfo, {
                        crmStatus: '2'
                    }));
                    /**
                     * @Date: 2020-05-11 19:37:08
                     * @LastEditors: niumkiki
                     * @description: 录入之后,不直接弹出线索或询盘详情页,需要点击图标再弹出
                     * @param :
                     * @return:
                     */
                    // this.getCompanyIdByVisitorId();
                    // this.getInquiryIdByVisitorId(this.currVisitorId);
                    // setTimeout(() => {
                    //     console.log('this.status', this.status);
                    //     console.log('this.statusFlag', this.statusFlag);
                    // }, 1500);
                }

                this.inputClue = false;
            },
            /* 获取线索表单字段 */
            getXSShow() {
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.orgId
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        this.templateId = res.data.data.template.id;
                    }
                });
            },
            // 获取访客信息
            getInfoById(visitorId) {
                return util.ajaxInternationalJson({
                    url: '/piwikRead/visitorInfo/getVisitorInfo',
                    method: 'GET',
                    params: {
                        visitorId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        res.data.data = res.data.data || {};
                        this.$store.commit('updateVisitorInfo', res.data.data);
                        return res.data.data;
                    }
                });
            },
            /* 录线索 */
            async changeModel(createCustomer) {
                /**
                 * @Date: 2020-05-15 16:21:44
                 * @LastEditors: niumkiki
                 * @description: 原来获取的是当前客服,但是并不一定该访客的客服只有当前访客,需要调接口获取,并且是当前最新的
                 * @param :
                 * @return:
                 */
                const visitInfo = await this.getInfoById(this.currVisitorId);
                this.json_data = {
                    proj: this.currVisitorId, /* 当前访客id */
                    templateId: this.templateId, /* 模板id */
                    enterpriseId: this.$store.state.enterpriseId, /* 企业id */
                    userId: this.$store.state.userId, /* 用户id */
                    userName: this.$store.state.userName, /* 用户名 */
                    // serviceName: this.$store.state.fullName, /* 客服名称 */
                    // serviceId: Cookies.get('accId'), /* 客服id */
                    serviceName: visitInfo.receptionServer, /* 客服名称 */
                    serviceId: visitInfo.receptionServerAccid,
                    crmStatus: this.sourceCrmStatus,
                    sourceUrl: this.visitorBaseInfo.firstVisitorAddress,
                    source: 4
                };
                // 判断当前 visitorId 是否可以或正在被当前客服接待, 是则可以各种操作访客数据或发消息
                const ret = await this.getVisitorReception(this.currVisitorId);
                if (ret) {
                    if (createCustomer) {
                        this.createCustomer = createCustomer;
                    }
                    this.inputClue = true;
                    // 获得最新访问id
                    util.ajaxInternationalJson({
                        url: '/piwikRead/visitorHistory/getVisitorTimeAxis',
                        method: 'GET',
                        params: {
                            visitorId: this.currVisitorId
                        }
                    }).then(response => {
                        if (response.data.code === '1' && response.data.data) {
                            this.json_data.idvisit = response.data.data[0].eventId.split('_')[1];
                        }
                    });
                }
            },
            // 如果存有该访客正在和别人聊天的state且为true
            // async isChatWithOther() {
            //     // 如果存有该访客正在和别人聊天的state且为true
            //     if (this.$store.state.isChatWithOther[this.$store.state.currSessionId]) {
            //         const warnTip = this.$store.state.ChatWithOtherTip;
            //         this.$Message.warning(warnTip);
            //         console.log('isChatWithOther false');
            //         return false;
            //     } else if (this.$store.state.isChatWithOther[this.$store.state.currSessionId] === undefined) {
            //         //                    this.remarkLoading=true
            //         /* 访客是否正在和别人聊天 */
            //         return new Promise((resolve, reject) => {
            //             util.ajaxInternational({
            //                 url: '/visitor/isVisitorOnChat',
            //                 method: 'post',
            //                 data: {
            //                     visitorServerAccId: Cookies.get('accId'),
            //                     visitorId: this.$store.state.currVisitorId
            //                 }
            //             }).then(response => {
            //                 if (response.data.code == 2) {
            //                     this.$store.state.ChatWithOtherTip = response.data.message;
            //                     this.$Message.warning(response.data.message);
            //                     this.$store.commit('updateChatWithOtherList', {
            //                         account: this.$store.state.currSessionId,
            //                         status: true
            //                     });
            //                     resolve(false);
            //                 } else {
            //                     resolve(true);
            //                 }
            //             });
            //         });
            //     } else {
            //         console.log('isChatWithOther true');
            //         return true;
            //     }
            // }
            // 滚动滚动条到 msg-frame 最底部
            scrollToBottom() {
                // 暂存聊天窗 Dom
                const DOM_frame = document.getElementById('frame-main');

                if (DOM_frame) {
                    // 滚动滚动条到最底部
                    DOM_frame.scrollTop = DOM_frame.scrollHeight;
                }
            }
        },
        watch: {
            inputIngVisitorId: {
                handler: function(val) {
                    if (val === this.currVisitorId) {
                        this.$store.commit('UpdateVisitorInputStatus', true);
                    } else {
                        this.$store.commit('UpdateVisitorInputStatus', false);
                    }
                }
            },
            // 'visitorBaseInfo.crmStatus': {
            //     handler(val) {
            //         this.statusFlag = val || '1';
            //         this.sourceCrmStatus = val || '1';
            //         if (val === '102') {
            //             this.$store.state.currVisitorType = 'crmType';
            //         } else if (val === '2') {
            //             this.$store.state.currVisitorType = 'clueType';
            //         } else if (val === '5'){ // 后端查到是5时 先按1 未建档处理
            //             this.statusFlag = '1';
            //             this.sourceCrmStatus = '1';
            //             this.$store.state.currVisitorType = '';
            //         }
            //     },
            //     immediate: true
            // }
        }
    };
</script>

<style scoped lang="less">
    .chat-frame-container {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .frame-top, .split-frame-top {
        padding: 5px 10px;
        height: 63px;
        /*line-height: 40px;*/
    }

    .frame-top {
        padding: 7px 10px 5px;
        border-bottom: 1px solid #e8e8e8;

        & /deep/ .logo-btn {
            margin-top: -3px;

            &:hover {
                cursor: pointer;
            }
        }

        & /deep/ .ivu-avatar > img {
            width: 44px;
            height: 44px;
        }

        & /deep/ .ivu-avatar-large {
            width: 46px;
            height: 46px;
        }
    }

    .frame-footer {
        position: relative;
    }

    .split-frame-top {
        position: relative;
        line-height: 60px;
        text-align: center;
    }

    .frame-top-item {
        // margin-left: 10px;
        display: inline-block;
        vertical-align: middle;

        & /deep/ .ivu-dropdown-item-selected {
            background: #fff;

            &:hover {
                background: #f5f5f5;
            }
        }
    }

    #frame-main {
        width: calc(100% + 20px) !important;
        flex: 1;
        margin-bottom:10px;
        padding: 0 35px 0 20px;
        overflow-y: scroll;
        overflow-x: hidden;
    }
</style>

<style>
    .nick-remark-input {
        width: 150px;
        margin-right: 5px;
        height: 20px;
    }

    .nick-remark-input input {
        border-top: 0;
        border-right: 0;
        border-left: 0;
    }

    .chat-arrow-back > .floating-window-header-back-arrow {
        vertical-align: unset;
    }

    .edit-remark-btn, .clue-btn {
        cursor: pointer;
    }
    .remark-text {
        max-width: 250px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .nick {
        /*color: #666666;*/
        color: rgba(0, 0, 0, 0.8);
        font-weight: bold;
    }

    .remark-block {
        display: inline-block;

        height: 20px;
        vertical-align: bottom;
        position: relative;
        padding-right: 20px;
    }

    .remark-text {
        max-width: 250px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: text-top;
        display: block;
    }

    .nick-remark {
        margin-left: 10px;
        display: inline-block;
    }

    .nick-remark, .visitor-id {
        font-size: 12px;
    }

    .visitor-id {
        cursor: pointer;
        color: rgba(0, 0, 0, 0.4);
    }

    .frame-status-wrapper {
        display: inline-block;
        margin-right: 12px;
    }

    .frame-status {
        line-height: 23px;
        display: inline-block;
        /*width: 64px;*/
        padding: 0 5px;
        height: 24px;
        border: 1px solid #4285f4;
        font-size: 12px;
        text-align: center;
        border-radius: 4px;
        color: #4285f4;
        background: transparent;
        text-decoration: none;
        outline: none;
        cursor: pointer;
        -webkit-transition: color .2s ease;
        transition: color .2s ease;
    }

    .frame-status > i {
        top: -1px;
    }

    .frame-status:hover {
        color: #4285f4;
    }

    .input-right-now {
        padding-left: 19px;
        font-size: 12px;
        line-height:18px;
        background-color: #fff;
    }

    /* .input-right-now-full-screen {
        line-height:18px;
        background-color: #fff;
    } */

    /* .input-right-now {
        line-height:18px;
        background-color: #fff;
    } */

    .visitor-input-content {
        text-overflow: -o-ellipsis-lastline;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .chat-new-message {
        position: absolute;
        top: -35px;
        right: 10px;
        cursor: pointer;
    }

    .handle-status-dropdown-menu .el-dropdown-menu__item.is-disabled {
        color: #4285f2;
        font-weight: 700;
    }
</style>
