<template>
<!-- 聊天窗口 -->
    <div :style="{'height':bodyHeight+'px'}"
         class="waChatFrame">
        <!-- 聊天窗口顶部 -->
        <div class="waChatFrame-top">
            <!-- 聊天头部-头像 -->
            <div class="waChatFrame-top-avatar">
                <img v-if="currAccountInfo.chatWaAvatar"
                     :src="currAccountInfo.chatWaAvatar">
                <img v-else-if="currAccountInfo.contactWaAvatar"
                     :src="currAccountInfo.contactWaAvatar">
                <svg v-else
                     class="chat-svg-avatar"
                     aria-hidden="true">
                    <use xlink:href="#custom-visitor-avatar"></use>
                </svg>
            </div>

            <!-- 聊天头部 - 账户信息 -->
            <div class="waChatFrame-top-accountInfo">
                <!-- 昵称(+ WA 号码) -->
                <div class="waChatFrame-top-accountInfo-nick">
                    <TooltipAuto :content="(`+${currentWaAccount}` === nick) ? nick : `${nick}\xa0\xa0\xa0\xa0${currentWaAccount}`"></TooltipAuto>
                </div>

                <!-- 最后上线时间 -->
                <div v-if="['composing', 'available', 'unavailable'].includes(onlineStatus)"
                     :class="{'waChatFrame-top-accountInfo-onlineStatus': true, 'waChatFrame-top-accountInfo-onlineStatus__composing': onlineStatus === 'composing'}">
                    <!-- 输入中 -->
                    <template v-if="onlineStatus === 'composing'">{{ $t('whatsapp_manage.composing') }}</template>

                    <!-- 在线 -->
                    <template v-else-if="onlineStatus === 'available'">{{ $t('whatsapp_manage.available') }}</template>

                    <!-- 离线 -->
                    <template v-else-if="onlineStatus === 'unavailable'">
                        <template v-if="lastOnlineTimeStamp">
                            <!-- 有时间戳, 显示"最后上线于..." -->
                            {{ $t('whatsapp_manage.lastOnlineAt') }} {{ lastTimeStampFormat(lastOnlineTimeStamp) }}
                        </template>
                        <template v-else>
                            <!-- 无时间戳, 显示"最后上线于 x时间" -->
                            {{ $t('whatsapp_manage.unavailable') }}
                        </template>
                    </template>
                </div>

                <!-- 备注 -->
                <div class="waChatFrame-top-accountInfo-remark">
                    <!-- 非编辑状态 -->
                    <template v-if="!isEdit">
                        <!-- 显示备注 -->
                        <TooltipAuto v-if="whatsAppRemark"
                                     :content="whatsAppRemark">
                            <span class="waChatFrame-top-accountInfo-remark-text">{{ whatsAppRemark }}</span>
                        </TooltipAuto>

                        <!-- 编辑按钮 -->
                        <Icon custom="custom custom-remark-edit"
                              color="#bec2c9"
                              size="14"
                              @click.native="editRemark"
                              class="waChatFrame-top-accountInfo-remark-editBtn whatsapp-manage-remark"/>
                    </template>

                    <!-- 编辑状态 -->
                    <Input v-else
                           v-model="remark"
                           size="small"
                           maxlength="100"
                           :placeholder="$t('chat.remarkPlaceholder')"
                           ref="remarkInput"
                           @blur="saveRemark"/>
                </div>
            </div>

            <!-- 手动同步 WA 消息 -->
            <div v-if="whatsAppAccountInfo.loginStatus === 1"
                 @click="handleManualCollection"
                 class="waChatFrame-top-syncMsg whatsapp-manual-collection">
                <Tooltip :content="$t('whatsapp_manage.manualCollectionTip')"
                         placement="top">
                    <Icon custom="custom custom-refresh"
                          size="14"></Icon>
                </Tooltip>
            </div>

            <!-- 聊天头部--crm状态及操作按钮 -->
            <div @mouseenter="$emit('updateWAAccountCrmStatus', currentWaAccount)"
                @click="$emit('toggleShowLittleDrawer')"
                 class="frame-top-item whatsapp-crm-status cursor-pointer">
                <!-- 询盘图标 -->
                <Tooltip v-if="currAccountInfo.leadscloudStatus === 1"
                         :content="$t('clue.inquiry')"
                         placement="left">
                    <svg aria-hidden="true" :style="{width:'32px', height:'32px',verticalAlign: 'middle'}"
                         class="svg-icon piwik_whatsapp_inquiry">
                        <use xlink:href="#custom-inquiry"></use>
                    </svg>
                </Tooltip>

                <!-- 线索图标 -->
                <Tooltip v-else-if="currAccountInfo.leadscloudStatus === 2"
                         :content="$t('clue.clue')"
                         placement="left">
                    <svg aria-hidden="true" :style="{width:'32px', height:'32px',verticalAlign: 'middle'}"
                         class="svg-icon piwik_whatsapp_clue">
                        <use xlink:href="#custom-clue"></use>
                    </svg>
                </Tooltip>

                <!-- 录入按钮 -->
                <!-- $t('littleDrawer.undocumentedCustomers') : $t('littleDrawer.irrelevantCustomer') -->
                <Tooltip v-else :content="$t('littleDrawer.undocumentedCustomers')" placement="left">
<!--                    <Button @click="() => newCompanyShow = true" class="frame-status">{{$t('website.notEnter')}}</Button>-->
                    <!-- <Button @click="createClue" class="frame-status">{{$t('website.notEnter')}}</Button> -->
                    <Icon custom="custom-unfiled" size="32"></Icon>
                </Tooltip>
            </div>
        </div>

        <!-- 聊天窗口 -->
        <div id="whatsApp-main" @scroll.capture="close_popper">
            <ul id="chat-list" class="m-chat-list p-chat-list">
                <spin fix v-if="isLoading"></spin>
                <li class="u-msg item-time" :class="{loadMore:canLoadMore}"
                    v-if="canLoadMore" @click="loadMore">
                    {{$t('whatsapp_manage.loadMore')}}
                </li>
                <li class="u-msg item-time" v-else>
                    {{$t('chat.noMore')}}
                </li>
                <template v-if="isInitMsg">
                    <!-- <Scroll :on-reach-top="loadMore" :height="scrollHeight"> -->
                        <whatsAppMsgItem
                                v-for="(msg,index) in msgList"
                                :key="index"
                                :rawMsg="msg"
                                :currAccountAvatar="currAccountInfo.chatWaAvatar || currAccountInfo.contactWaAvatar"
                        ></whatsAppMsgItem>
                    <!-- </Scroll> -->
                </template>
            </ul>
            <!-- <template v-if="!isShowCRMDetail"> -->
                <!-- 【展开】访客信息详情页按钮 -->
                <!-- <i style="position:absolute;top:50%;margin-top:-20px;right:-21px;">
                    <Tooltip placement="top" transfer v-if="!isShowVisitorDetail" :content="$t('distribution.open')">
                        <svg class="svg-icon custom" @click="handleClick(true)" aria-hidden="true" style="display: inline-block;font-size:50px;cursor:pointer;">
                            <use xlink:href="#custom-zhankai"></use>
                        </svg>
                    </Tooltip>
                </i> -->
                <!-- 【收起】访客信息详情页按钮 -->
                <!-- <i style="position:absolute;top:50%;margin-top:-20px;right:-21px;">
                    <Tooltip placement="top" transfer v-if="isShowVisitorDetail" :content="$t('distribution.takeUp')">
                        <svg class="svg-icon custom" @click="handleClick(false)" aria-hidden="true" style="display: inline-block;font-size:50px;cursor:pointer;">
                            <use xlink:href="#custom-shouqi"></use>
                        </svg>
                    </Tooltip>
                </i> -->
            <!-- </template> -->
        </div>

        <!-- 聊天窗口底部 -->
        <div class="waChatFrame-footer">
            <whatsAppSend ref="whatsAppSend" :currAccountInfo="currAccountInfo" :whatsAppAccountInfo="whatsAppAccountInfo"></whatsAppSend>
        </div>
        <!-- <NewCompany
                :visible.sync="newCompanyShow"
                :WAAccount.sync="currentWaAccount"
                :WANickName="nick"
                :userBindWaAccount="whatsAppAccountInfo.whatsappAccount"
                :salesList="salesList"
                type="whatsApp"
                :corp_columns_authorized="corp_columns_authorized"
                :contact_columns_authorized="contact_columns_authorized"
                :inquiry_columns_authorized="inquiry_columns_authorized"
                :selectOptions="selectOptions"
                @refreshData="$emit('updateWAAccountCrmStatus', currentWaAccount, 'createCompany')">
        </NewCompany>

        <EnterClueModal
                v-model="newClueShow"
                :title="$t('facebook.inbox.enterClue')"
                :mask-closable="false"
                class="modal companydata"
                :saleList="salesList"
                :templateList="templateList"
                :json_data="json_data"
                type="whatsApp"
                saveClueClass="piwik-whatsApp-enter-clue"
                saveClueAndInquiryClass="piwik-whatsApp-enter-inquiry"
                okEnterInquiryClass="whatsApp_inquirySubmit"
                @on_cancle_clue="on_cancle_clue"
                @returnLeadsId="updateStatus"
                @updateInquiryStatus="updateInquiryStatus">
        </EnterClueModal>-->
    </div> 
</template>

<script>
    import whatsAppMsgItem from './whatsAppMsgItem';
    import whatsAppSend from './whatsAppSend';
    // import NewCompany from '@/views/crm/Detail/Components/Modal/fixed-modal-form/create-company';
    // import EnterClueModal from '@/views/main-components/enter-clue/enter-clue';
    import { mapState } from 'vuex';
    import util from '../../../libs/util';
    export default {
        name: 'whatsAppChat',
        props: {
            currAccountInfo: {
                type: Object,
                default() {
                    return {};
                }
            },
            whatsAppAccountInfo: {
                type: Object,
                default() {
                    return {};
                }
            },
            isShowVisitorDetail: {
                type: Boolean,
                default: false
            },
            isShowCRMDetail: {
                type: Boolean,
                default: false
            }
        },
        components: {
            whatsAppSend,
            whatsAppMsgItem,
            // NewCompany,
            // EnterClueModal
        },
        data() {
            return {
                nick: '', // 昵称
                whatsAppRemark: '',

                // 对方在线状态('composing'输入中, 'available'在线, 'unavailable'离线)
                onlineStatus: '',
                // 对方状态为离线时, 最后上线时间
                lastOnlineTimeStamp: 0,
                // 在线状态变为'输入中'时, 设置 5s 延时, 5s 后从'输入中'恢复到之前的状态
                timer_recoverFromComposing: null,

                isEdit: false,
                remark: '',
                isLoading: false,
                isInitMsg: true,
                type: 'session', // 类型，chatroom, session
                scene: 'p2p',
                isFullImgShow: false,
                msgLoadedTimer: null,
                page: 1,
                size: 20,
                whatsAppMsgList: [],
                canLoadMore: false,
                lastWAAccount: '',
                totalPages: 0, // 总页数
                cancelFunc: null, // 取消上一次请求
                close_popper: this.$debounce(e => {
                    if (e && e.target && e.target.id.includes('whatsApp-main')) {
                        // 关闭 select 下拉选框
                        if (document.querySelector('.poptip-block')) {
                            document.querySelector('.poptip-block').click();
                        }
                    }
                }, undefined, true),
                newCompanyShow: false,
                newClueShow: false,
                currentWaAccount: '',
                templateId: '', // 线索模板id
                templateList: [],
                json_data: {}
            };
        },
        computed: {
            ...mapState({
                noMoreHistoryMsgs: state => state.noMoreHistoryMsgs,
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                websocketMsgWA: state => state.whatsapp.websocketMsgWA
            }),
            bodyHeight() {
                const temp = this.window_height ? this.window_height - 60 : document.body.clientHeight - 60;
                return temp > 200 ? temp : 200;
            },
            msgList() {
                // 对 whatsAppMsgList 做 messageId 去重
                let msgList = this.whatsAppMsgList.slice();
                const ids = new Set();
                msgList = msgList.filter(item => {
                    if (!ids.has(item.messageId)) {
                        ids.add(item.messageId);
                        return true;
                    }
                });
                return msgList;
            }
        },
        updated() {
            // 当处在第一页时，保证看到最新消息
            if (this.page === 1) {
                document.getElementById('whatsApp-main').scrollTop = document.getElementById('whatsApp-main').scrollHeight;
                setTimeout(function() {
                    document.getElementById('whatsApp-main').scrollTop = document.getElementById('whatsApp-main').scrollHeight;
                }, 100);
            }
        },
        methods: {
            // 编辑备注
            async editRemark() {
                this.isEdit = true;
                // 手动聚焦输入框
                this.$nextTick(() => {
                    this.$refs.remarkInput.focus();
                });
            },
            // 失去焦点保存备注
            saveRemark() {
                // 超出字符限制提示
                const temp = this.remark ? this.remark.trim() : '';
                if (temp.length >= 100) {
                    this.$Message.warning(this.$t('whatsapp_manage.remarkTip'));
                    return;
                }
                // 当备注内容未改变时不需要调接口
                if (this.whatsAppRemark === this.remark) {
                    this.isEdit = false;
                    return;
                }
                util.ajaxInternationalJson({
                    url: '/whatsapp/contactUserRemark/update',
                    method: 'post',
                    data: {
                        contactWaAccount: this.currAccountInfo.chatWaAccount || this.currAccountInfo.contactWaAccount,
                        orgId: this.enterpriseId,
                        remark: this.remark,
                        remarkId: this.currAccountInfo.remarkId,
                        userBindWaAccount: this.currAccountInfo.userBindWaAccount,
                        userId: this.userId
                    }
                }).then(response => {
                    this.isEdit = false;
                    if (response.data.code === 1) {
                        this.whatsAppRemark = this.remark;
                        this.$Message.success(this.$t('chat.remarkTip2'));
                        this.$emit('updateSelectedRemark', this.currAccountInfo.chatWaAccount, this.remark);
                        this.$emit('updateSelectedRemark', this.currAccountInfo.contactWaAccount, this.remark);
                    } else {
                        this.remark = this.whatsAppRemark;
                        this.$Message.error(this.$t('chat.remarkTip3'));
                    }
                });
            },
            /** 加载更多 */
            loadMore() {
                this.page++;
                return new Promise(resolve => {
                    if (this.page <= this.totalPages) {
                        this.getWhatsAppMsg('add');
                    } else {
                        this.$Message.error(this.$t('whatsapp_manage.noMore'));
                    }
                });
            },
            // 请求聊天消息列表
            getWhatsAppMsg(type) {
                if (this.currAccountInfo.chatWaAccount || this.currAccountInfo.contactWaAccount) {
                    this.isLoading = true;
                    this.isInitMsg = false;
                    const CancelToken = util.axios.CancelToken;
                    const vm = this;
                    console.log(CancelToken);
                    /* 取消上一次请求，避免频繁请求接口时因接口响应速度快慢导致数据错乱 */
                    if (typeof this.cancelFunc === 'function') {
                        this.cancelFunc();
                    }
                    // 初始化时将page变为1
                    if (type === 'init') {
                        this.page = 1;
                    }
                    util.ajaxInternationalJson({
                        url: '/whatsapp/chatRecords/page',
                        method: 'post',
                        data: {
                            chatWaAccount: this.currAccountInfo.chatWaAccount || this.currAccountInfo.contactWaAccount,
                            orgId: this.enterpriseId,
                            page: `${this.page}`,
                            size: `${this.size}`,
                            userBindWaAccount: this.currAccountInfo.userBindWaAccount,
                            userId: this.userId
                        },
                        cancelToken: new util.axios.CancelToken(function executor(c) {
                            vm.cancelFunc = c;
                        })
                    }).then(ret => {
                        if (ret.data.code === 1) {
                            const total = ret.data.data.totalElements;
                            this.totalPages = ret.data.data.totalPages;
                            if (total > this.page * this.size) {
                                this.canLoadMore = true;
                            } else {
                                this.canLoadMore = false;
                            }
                            const arr = ret.data.data.content.reverse();

                            if (type === 'init') {
                                this.whatsAppMsgList = arr;
                            } else {
                                this.whatsAppMsgList = arr.concat(this.whatsAppMsgList);
                            }
                        }
                        this.isLoading = false;
                        this.isInitMsg = true;
                    });
                }
            },
            
            handleClick(isShow) {
                this.$emit('toggleShowVisitorDetail', isShow);
            },
            /* WhatsApp录入线索相关 */
            createClue() {
                this.newClueShow = true;
                this.getClueOption();
            },
            // 获取线索字段
            getClueOption() {
                this.templateList = [];
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const showList = response.data.data.show;
                        for (const key in showList) {
                            const obj = showList[key];
                            obj.key = key;
                            obj.required = showList[key].isNeed !== 0;
                            this.templateList.push(obj);
                        }
                        this.templateId = response.data.data.template.id;
                        this.json_data = {
                            templateId: this.templateId,
                            enterpriseId: this.enterpriseId,
                            source: 3,
                            userId: this.userId,
                            userName: this.userName,
                            a10052: this.currentWaAccount,
                            id: this.currentWaAccount
                        };
                    }
                });
            },
            on_cancle_clue(data) {
                this.newClueShow = data.close;
            },
            // 录入为线索后
            updateStatus(clueId, status) {
                this.newClueShow = false;
                this.clueId = clueId;
                this.$emit('updateWAAccountCrmStatus', this.currentWaAccount, 'createClue');
            },
            // 录入成询盘后
            updateInquiryStatus(clueId, status) {
                this.newClueShow = false;
                this.clueId = clueId;
                this.$emit('updateWAAccountCrmStatus', this.currentWaAccount, 'createCompany');
            },

            // 手动同步数据
            handleManualCollection() {
                util.ajaxInternationalJson({
                    url: '/whatsapp/api/syncChatHistory',
                    method: 'POST',
                    data: {
                        jid: this.whatsAppAccountInfo.whatsappAccount,
                        jidDest: this.currentWaAccount,
                        num: 500
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        this.$Message.success(this.$t('whatsapp_manage.startCollection'));
                    } else {
                        this.$Message.success(res.data.message);
                    }
                });
            },

            // 格式化最后上线时间
            lastTimeStampFormat(value) {
                /**
                 * @Description: WA 最后一次上线时间省略显示
                 * a.今天显示 "今天 时:分", 英文: "时:分 today"
                 * b.昨天显示 "昨天 时:分", 英文: "时:分 yesterday"
                 * c 本周的日期显示 "星期* 时:分", 英文: "时:分 on 星期*"
                 * d.本周之前的日期显示 "xxxx年yy月zz日 时:分", 英文: "时:分, yy月 zz, xxxx"
                 * @author 汤一飞
                 * @date 2021/8/5
                 */

                // 定义"今天", "昨天", "本周"的起始时间戳
                const nowDate = new Date();
                const todayStart = nowDate.setHours(0, 0, 0, 0);
                const yesterdayStart = todayStart - 3600 * 1000 * 24;
                let dayNo = nowDate.getDay();
                dayNo = dayNo ? dayNo - 1 : 6;
                const weekStart = todayStart - dayNo * 24 * 60 * 60 * 1000;

                // 定义年份, 月份数组
                const weekMap = [
                    this.$t('Monday'),
                    this.$t('Tuesday'),
                    this.$t('Wednesday'),
                    this.$t('Thursday'),
                    this.$t('Friday'),
                    this.$t('Saturday'),
                    this.$t('Sunday')
                ];
                const monthMap = [
                    this.$t('dashBoardV2.GoalSetting.Jan'),
                    this.$t('dashBoardV2.GoalSetting.Feb'),
                    this.$t('dashBoardV2.GoalSetting.Mar'),
                    this.$t('dashBoardV2.GoalSetting.Apr'),
                    this.$t('dashBoardV2.GoalSetting.May'),
                    this.$t('dashBoardV2.GoalSetting.Jun'),
                    this.$t('dashBoardV2.GoalSetting.Jul'),
                    this.$t('dashBoardV2.GoalSetting.Aug'),
                    this.$t('dashBoardV2.GoalSetting.Sep'),
                    this.$t('dashBoardV2.GoalSetting.Oct'),
                    this.$t('dashBoardV2.GoalSetting.Nov'),
                    this.$t('dashBoardV2.GoalSetting.Dec')
                ];

                // 获取传入时间戳对应的年, 月 ,日, 星期*, 时, 分
                const valueStamp = parseInt(value);
                const valueDate = new Date(valueStamp);
                const year = valueDate.getFullYear();
                const month = valueDate.getMonth();
                const date = valueDate.getDate();
                let day = valueDate.getDay();
                day = day ? day - 1 : 6;
                let hours = valueDate.getHours();
                hours = hours >= 10 ? hours : `0${hours}`;
                let minutes = valueDate.getMinutes();
                minutes = minutes >= 10 ? minutes : `0${minutes}`;

                // 今天显示 "今天 时:分", 英文: "时:分 today"
                if (valueStamp > todayStart) {
                    return this.$t('whatsapp_manage.lastOnlineTime_today').replace('$hours', hours).replace('$minutes', minutes);
                }

                // 昨天显示 "昨天 时:分", 英文: "时:分 yesterday"
                if (valueStamp > yesterdayStart) {
                    return this.$t('whatsapp_manage.lastOnlineTime_yesterday').replace('$hours', hours).replace('$minutes', minutes);
                }

                // 本周的日期显示 "星期* 时:分", 英文: "时:分 on 星期*"
                if (valueStamp > weekStart) {
                    return this.$t('whatsapp_manage.lastOnlineTime_weekDay').replace('$weekDay', weekMap[day]).replace('$hours', hours).replace('$minutes', minutes);
                }

                // 本周之前的日期显示 "xxxx年yy月zz日 时:分", 英文: "时:分, yy月 zz, xxxx"
                return this.$t('whatsapp_manage.lastOnlineTime_year').replace('$year', year).replace('$month', monthMap[month]).replace('$date', date).replace('$hours', hours).replace('$minutes', minutes);
            }
        },
        created() {
           
        },
        watch: {
            currAccountInfo: {
                handler(val) {
                    if (val.chatWaAccount) {
                        this.nick = val.chatWaName ? val.chatWaName : `+${val.chatWaAccount}`;
                        this.currentWaAccount = val.chatWaAccount;
                    } else {
                        this.nick = val.contactWaName ? val.contactWaName : `+${val.contactWaAccount}`;
                        this.currentWaAccount = val.contactWaAccount;
                    }
                    this.whatsAppRemark = val.remark;
                    this.remark = val.remark;
                    // 切换左侧菜单栏时会进入此判断
                    if (this.lastWAAccount !== val.chatWaAccount && this.lastWAAccount !== val.contactWaAccount) {
                        this.whatsAppMsgList = [];
                        this.isEdit = false;
                        this.getWhatsAppMsg('init');
                    }
                    this.lastWAAccount = val.chatWaAccount || val.contactWaAccount;
                },
                deep: true,
                immediate: true
            },
            currentWaAccount: {
                handler(val) {
                    if (val) {
                        this.onlineStatus = '';
                        this.lastOnlineTimeStamp = 0;
                        // 聊天对象账号变更后, 发送请求申请同步当前账号在线状态, 后端接收请求后发送 WS 消息同步
                        util.ajaxInternational({
                            url: '/whatsapp/chatRecords/presence',
                            method: 'post',
                            data: {
                                jid: this.whatsAppAccountInfo.whatsappAccount,
                                destJid: this.currentWaAccount
                            }
                        });
                    }
                },
                immediate: true
            },
            // websocket推送
            websocketMsgWA(val) {
                const websocketObj = val.whatsappAccountWebsocketCondition;

                // 收到私信推送
                console.log(val, '收到私信推送------------------------');
                if (val.WaWebsocketMessageType === 3 && (this.lastWAAccount === websocketObj.toWaAccount || this.lastWAAccount === websocketObj.fromWaAccount)) {
                    const temp = {};
                    temp.type = websocketObj.type;
                    temp.timeStamp = websocketObj.timeStamp;
                    temp.content = websocketObj.lastChatContent;
                    temp.fromMe = websocketObj.fromMe;
                    if (temp.fromMe) {
                        temp.fromWaAvatar = this.whatsAppAccountInfo.whatsappAvatar;
                    } else {
                        temp.fromWaAvatar = this.currAccountInfo.chatWaAvatar || this.currAccountInfo.contactWaAvatar;
                    }
                    temp.id = websocketObj.chatRecordsId;
                    temp.messageId = val.messageId;
                    temp.readFlag = websocketObj.readFlag;
                    temp.contentQiniuUrl = websocketObj.contentQiniuUrl;
                    temp.contentThumbnail = websocketObj.contentThumbnail;
                    this.whatsAppMsgList.push(temp);
                    // 当处在第一页时，保证看到最新消息
                    document.getElementById('whatsApp-main').scrollTop = 999999;
                    setTimeout(function() {
                        document.getElementById('whatsApp-main').scrollTop = 999999;
                    }, 1000);
                }

                if (val.WaWebsocketMessageType === 4) {
                    // 收到 WA 账号在线状态更新 WS 消息

                    // 提取数据
                    const { t, id, type } = val.presence || {};

                    if (this.currentWaAccount === id) {
                        // 此消息中的账号与当前聊天账号匹配

                        // 清除之前的定时器
                        if (this.timer_recoverFromComposing) {
                            clearTimeout(this.timer_recoverFromComposing);
                            this.timer_recoverFromComposing = null;
                        }

                        if (type === 'composing') {
                            // 如果状态为"输入中"

                            // 设置定时器, 5s 后从"输入中"状态恢复到当前状态
                            const temp = this.onlineStatus;
                            this.timer_recoverFromComposing = setTimeout(() => {
                                this.onlineStatus = temp;
                            }, 5000);
                        }

                        if (type === 'unavailable') {
                            // 如果状态为"离线"

                            // 更新"最后上线时间"
                            this.lastOnlineTimeStamp = t ? `${t}000` : 0;
                        }

                        // 更新账号在线状态
                        this.onlineStatus = type;
                    }
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .waChatFrame {
        background-color: #FFFFFF;
        display: flex;
        flex-direction: column;

        &-top {
            padding: 0 20px;
            height: 80px;
            border-bottom: 1px solid #e8e8e8;
            display: flex;
            align-items: center;

            > * {
                display: inline-block;
                vertical-align: middle;

                &:not(:last-child) {
                    margin-right: 8px;
                }

                &:last-child {
                    margin-left: 8px;
                }
            }

            &-avatar {
                > * {
                    vertical-align: middle;
                }

                img {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                }
            }

            &-accountInfo {
                flex: 1;
                overflow: hidden;

                &-nick {
                    font-size: 16px;
                    color: rgba(0, 0, 0, 0.80);
                    letter-spacing: 0;
                    line-height: 22px;
                    font-weight: 500;
                }

                &-onlineStatus, &-remark {
                    font-size: 12px;
                    color: rgba(0, 0, 0, 0.60);
                    letter-spacing: 0;
                    line-height: 18px;
                    font-weight: 400;
                }

                &-onlineStatus{
                    &__composing {
                        color: #FF752A;
                    }
                }

                &-remark {
                    display: flex;
                    align-items: center;

                    &-text {
                        flex: 1;
                    }

                    &-editBtn {
                        display: inline-block;
                        cursor: pointer;

                        &:not(:first-child) {
                            margin-left: 10px;
                        }
                    }
                }
            }

            &-syncMsg {
                margin-right: 10px;
                line-height: 32px;
                cursor: pointer;
            }

            &-crmStatus {
                cursor: pointer;

                svg {
                    width: 32px;
                    height: 32px;
                    vertical-align: middle;
                }

                &-enterBtn {
                    line-height: 23px;
                    display: inline-block;
                    /*width: 64px;*/
                    padding: 0 12px;
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
            }
        }

        #whatsApp-main {
            flex: 1;
            padding: 0 35px 0 20px;
            overflow-x: hidden;
            overflow-y: auto;
        }

        &-footer {
        }
    }
</style>
