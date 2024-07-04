<template>
    <div v-loading="isLoading || loading_group"
         class="whatsapp-container twemoji-convert">
      <!-- 头部 -->
      <div class="whatsapp-header" v-if="!messageAberrant">
        <div style="float:left; max-width: 40%; overflow: hidden;white-space: nowrap;text-overflow: ellipsis">
          <Tooltip placement="top" :content="whatsAppName" v-if="whatsAppName && whatsAppName.length > 30">
            <span>{{whatsAppName.slice(0, 30) + '...'}}</span>
          </Tooltip>
          <span v-else>{{whatsAppName}}</span>
        </div>
        <div style="float:right;">
          <Icon
              size="15"
              @click="refreshBtn"
              custom="custom-icon_update"
              v-if="!isGroup"
              :class="{'refresh-btn-loading': refreshStatus}"
              style="cursor:pointer;"
          />
          <span class="refresh-btn-time" v-if="!isGroup">最近同步时间：{{ refreshTime }}</span>
          <i>
            <Icon
              size="15"
              @click="closeWhatsApp"
              custom="custom custom-modal-close"
              style="cursor:pointer;"
            />
          </i>
        </div>
      </div>
  
      <!-- 滚动区 -->
      <div id="whatsApp-main" @scroll.capture="handleFrameScroll" class="whatsapp-main-whatsappModal"
           style="height:450px;overflow-y:auto;">
          <ul>
              <!-- 滚动加载 -->
              <Scroll :on-reach-top="loadMore_top"
                      :on-reach-bottom="msgListType === 'quote' ? loadMore_bottom : undefined"
                      :distance-to-edge="10"
                      :loading-text="$t('crm.Html.loading')"
                      :height="450"
                      ref="msgScroll">
                  <whatsAppMsgItem v-for="msg in $options.filters.addMsgTimeTag(msgList)"
                                   :key="msg.messageId"
                                   :timeLineStatus="timeLineStatus"
                                   :rawMsg="msg"
                                   :isGroup="isGroup"
                                   :whatsAppAccountInfo="{ 'whatsappAccount': userBindWaAccount || undefined }"
                                   :groupInfo="groupInfo"
                                   :nick="whatsAppName"
                                   fromFlag="timeline"
                                    :transList="transList"
                                    @handleTransMsg="handleTransMsg"
                                   @scrollToQuoteMsg="handleScrollToQuoteMsg"></whatsAppMsgItem>
              </Scroll>
          </ul>
      </div>
  
        <!-- 底部 -->
        <div style="position: relative;">
            <!-- 滚动到最底部 -->
            <div v-show="visible_toBottomBtn"
                 @click="scrollToBottom"
                 class="scrollToBottom-btn">
                <svg class="svg-icon custom" aria-hidden="true">
                    <use xlink:href="#custom-scrollToBottom"></use>
                </svg>
            </div>
        </div>
    </div>
  </template>
  
  <script>
      import util from '@/libs/util';
      import { getLastPushTime } from '@/api/whatsapp';
      import { mapState } from 'vuex';
      import whatsAppMsgItem from '@/views/whatsapp-manage/whatsApp-chat-frame/whatsAppMsgItem.vue';
      import _ from 'lodash';
    import autoTranslate from '@/mixins/autoTranslate';
  
      export default {
          name: 'WhatsAppModal',
        mixins: [autoTranslate],
          props: {
              // 如果是 api群发任务详情 页面查看聊天记录,需要的userID是发送模板消息人的userId
              // 非 api群发任务详情页面查看聊天记录 ,默认值设置为0
              userIdFromApi: {
                  type: Number,
                  default: 0
              },
              // 是否定位消息的位置,接收的是一个字符串(messageId)
              whetherToLocateTheMessage: {
                  type: String,
                  default: ''
              },
              messageAberrant: {
                  type: Boolean,
                  default: false
              },
              whatsAppName: {
                  type: String,
                  default: ''
              },
              chatWaAccount: {
                  type: String,
                  default: ''
              },
              userBindWaAccount: {
                  type: String,
                  default: ''
              },
              currentLineItemId: {
                  type: String,
                  default: ''
              },
              chatType: {
                  type: String,
                  default: ''
              },
              tagWaba: {
                //  api群发广告账单中使用这个字段
                type: String,
                  default: undefined
              }
          },
          components: {
              whatsAppMsgItem
          },
          computed: {
              ...mapState({
                  enterpriseId: 'enterpriseId',
                  // 当前路由 name 数组
                  activeRouteNames: state => state.app.activeRouteNames,
                  userId: 'userId'
              }),
              msgList() {
                  return this.msgListType === 'quote' ? this.waQuoteMsgList : this.whatsAppMsgList;
              },
              // 时间轴查看聊天记录 当前查看的消息记录是否有我发的消息
              timeLineStatus() {
                  if (this.activeRouteNames.length > 1 && this.activeRouteNames[1] === 'whatsapp_management') {
                      return true;
                  }
                  return this.activeRouteNames[0] !== 'whatsapp_manage_home';
              },
              // 是否是群组对话
              isGroup() {
                  return this.chatType === '1';
              }
          },
          data() {
              return {
                  groupAutoTrans: true, // whatsapp modal可以触发自动翻译
                  // 界面loading
                  isLoading: false,
                  page: 1,
                  size: 20, // 每页请求行数
  
                  // 取消上一次正常消息请求
                  cancelFunc: null,
                  // 取消上一次引用消息请求
                  cancelFunc_quote: null,
                  // 正常的 wa 消息数组
                  whatsAppMsgList: [],
                  // 引用消息前后的 wa 消息数组
                  waQuoteMsgList: [],
                  // 页面消息显示类型, normal 显示正常消息, quote 显示引用消息数组
                  msgListType: 'normal',
                  // 是否显示"滚动到最底部"按钮
                  visible_toBottomBtn: false,
  
                  /* 群组相关 */
                  // 群组信息请求 loading
                  loading_group: false,
                  // 群组信息
                  groupInfo: {
                      account: '',
                      name: '',
                      avatar: '',
                      size: 0,
                      memberList: []
                  },
                  refreshStatus: true,
                  refreshTime: '--'
              };
          },
          created() {
              // this.getLastestWaUuid();
          },
          methods: {
              /** 关闭弹窗 */
              closeWhatsApp() {
                this.$emit('closeViewMsgVue', false);
                  document.body.click();
              },
              // 请求聊天消息列表
              getWhatsAppMsg(resolve, direction) {
                  if (this.chatWaAccount) {
                      // 如果当前不是通过 scroll 加载列表数据(没有 scroll 组件自带的 loading), 则显示 loading
                      if (!resolve) {
                          this.isLoading = true;
                      }
  
                      const vm = this;
                      /* 取消上一次请求，避免频繁请求接口时因接口响应速度快慢导致数据错乱 */
                      if (typeof this.cancelFunc === 'function') {
                          this.cancelFunc();
                      }
  
                      // 发送请求
                      util.ajaxWAJson({
                          // url: '/whatsapp/chatRecords/getOffsetChatList',
                          url: '/whatsapp/chatRecords/page',
                          method: 'post',
                          data: {
                              chatWaAccount: this.chatWaAccount,
                              orgId: this.enterpriseId,
                              userId: this.userIdFromApi !== 0 ? this.userIdFromApi : this.userId,
                              page: `${this.page}`,
                              size: `${this.size}`,
                              userBindWaAccount: this.userBindWaAccount,
                              tag: this.tagWaba
                          },
                          cancelToken: new util.axios.CancelToken(function executor(c) {
                              vm.cancelFunc = c;
                          })
                      }).then(({ data }) => {
                          // 处理返回数据
                          if (data.code === 1) {
                              if (data.data.content.length) {
                                  // 有请求到数据, 合并数据到正常消息数组
  
                                  this.mergeMsgList(data.data.content);
                              } else {
                                  // 没有请求到数据, 给出"没有更多"提示, 并将 page 退回一页
  
                                  this.$Message.info(this.$t('noticeWindow.noMore'));
                              }
                          }

                        // 手动触发翻译功能(方法在mixin中)
                        this.handleTranslate(direction, '.whatsapp-main-whatsappModal');

                          // 隐藏 loading
                          if (resolve) {
                              resolve();
                          } else if (this.whetherToLocateTheMessage) {
                              // 传一个messageId,定位消息接口需要messageId
                              const obj = {
                                  messageId: this.whetherToLocateTheMessage
                              };
                              this.refreshStatus = false;
  
                              this.handleScrollToQuoteMsg(obj);
                              return;
                          } else {
                              // 当处在第一页时，保证看到最新消息
                              if (this.page === 1 && this.msgListType === 'normal' && this.msgList.length) {
                                  this.targetMsgLocation(this.msgList[this.msgList.length - 1]);
                              }
                          }
                          this.isLoading = false;
                          // if (this.page === 1) {
                          //     this.refreshTime = new Date().format('yyyy-MM-dd hh:mm:ss');
                          // }
                          this.refreshStatus = false;
                      }).catch(error => {
                          this.isLoading = false;
                          console.log(error);
                      });
                  }
              },
              /** 加载更多 */
              loadMore_top() {
                  return this.loadMore('top');
              },
              loadMore_bottom() {
                  return this.loadMore('bottom');
              },
              loadMore(direction) {
                  // 当前显示的是引用消息
                  if (this.msgListType === 'quote') {
                      // 根据方向, 以首条/尾条引用消息为基准, 向上/下请求更多引用消息
                      return new Promise(resolve => {
                          if (direction === 'top') {
                              this.getQuoteMsgList(this.waQuoteMsgList[0], true, resolve);
                          } else {
                              this.getQuoteMsgList(this.waQuoteMsgList[this.waQuoteMsgList.length - 1], false, resolve);
                          }
                      });
                  }
  
                  // 当前显示的是正常消息, 且是滚动到底部
                  if (direction === 'top') {
                      this.page++;
                      return new Promise(resolve => {
                          this.getWhatsAppMsg(resolve, direction);
                      });
                  }
              },
              // 处理接口返回的数据(要求正常消息列表和引用消息列表都用这个方法, 方便在两者变动时判断两列表是否可合并)
              mergeMsgList(data, dataType = 'normal') {
                  // 传入数据处理
                  data.forEach(item => {
                      if (item.extendedJson) {
                          try {
                              const tmp = JSON.parse(item.extendedJson);
                              if (tmp.seconds) {
                                  item.seconds = tmp.seconds;
                              }
                          } catch (err) {
                              console.error('处理 page 接口返回数据的 extendedJson 错误');
                          }
                      }
                  });
  
                  // 暂存消息数组
                  let msgList = [];
                  if (dataType === 'quote') {
                      msgList = this.waQuoteMsgList.slice();
                  } else {
                      msgList = this.whatsAppMsgList.slice();
                  }
  
                  // 合并消息数组和接口数据
                  msgList = msgList.concat(data);
  
                  // 定义"正常消息列表和引用消息列表已合并" flag
                  let merged = false;
                  // 如果两类 msgList 有重合
                  if (this.waQuoteMsgList.find(quMsg => this.whatsAppMsgList.find(waMsg => waMsg.messageId === quMsg.messageId))) {
                      // 合并两类 msgList
                      if (dataType === 'quote') {
                          msgList = msgList.concat(this.whatsAppMsgList);
                      } else {
                          msgList = msgList.concat(this.waQuoteMsgList);
                      }
  
                      // 标识"已合并" flag 为 true , 之后再做处理
                      merged = true;
                  }
  
                  // 数组去重
                  const ids = new Set();
                  msgList = msgList.filter(item => {
                      if (!ids.has(item.messageId)) {
                          ids.add(item.messageId);
                          return true;
                      }
                  });
  
                  // 数组按时间倒序
                  msgList.sort((a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp));
  
                  // 数据赋值
                  if (merged) {
                      // 如果两种 msgList 已合并
  
                      // 清空引用消息列表
                      this.waQuoteMsgList = [];
  
                      // 赋值正常消息列表
                      this.whatsAppMsgList = msgList;
  
                      // 显示正常消息列表
                      this.msgListType = 'normal';
  
                      // 计算当前 page (为避免消息遗漏, 此处计算 page 采用 floor)
                      this.page = Math.floor(msgList.length / this.size);
                  } else if (dataType === 'quote') {
                      // 否则, 如果当前请求的是引用消息数据
  
                      // 赋值引用消息列表
                      this.waQuoteMsgList = msgList;
                  } else {
                      // 否则, 当前请求的是正常消息数据
  
                      // 赋值正常消息列表
                      this.whatsAppMsgList = msgList;
                  }
              },
  
              // 滚动到指定引用消息处
              handleScrollToQuoteMsg(msg) {
                  // 在消息数组中定位引用消息
                  const existed_waMsg = this.whatsAppMsgList.find(item => item.messageId === msg.messageId);
                  const existed_quoteMsg = this.waQuoteMsgList.find(item => item.messageId === msg.messageId);
  
                  if (existed_waMsg) {
                      // 引用消息在正常消息数组中
  
                      // 显示正常消息
                      this.msgListType = 'normal';
  
                      // 聊天界面定位到消息位置
                      this.targetMsgLocation(msg, true);
                  } else if (existed_quoteMsg) {
                      // 引用消息在引用消息数组中
  
                      // 显示正常消息
                      this.msgListType = 'quote';
  
                      // 聊天界面定位到消息位置
                      this.targetMsgLocation(msg, true);
                  } else {
                      // 引用消息当前不在任一列表中
  
                      // 显示 loading
                      this.isLoading = true;
  
                      // 清空原引用消息数组
                      this.waQuoteMsgList = [];
  
                      // 获取引用消息
                      this.getQuoteMsgList(msg, false, null, true);
                  }
              },
              // 定位到消息位置
              targetMsgLocation(msg, highlight = false) {
                  this.$nextTick(() => {
                      if (this.$refs.msgScroll && this.$refs.msgScroll.$el) {
                          const msgDomArr = this.$refs.msgScroll.$el.querySelectorAll('.u-msg');
  
                          // 获取该消息在当前显示的消息数组中的位置
                          const msgIndex = this.msgList.findIndex(item => item.messageId === msg.messageId);
  
                          // 如果页面已渲染此条消息
                          if (msgIndex !== -1 && msgDomArr[msgIndex]) {
                              // 获取此消息 dom
                              const el = msgDomArr[msgIndex];
  
                              // 滚动到视口
                              if (el.scrollIntoView) {
                                  el.scrollIntoView();
                              }
  
                              // 高亮消息, 2s 后恢复原状
                              if (highlight) {
                                  el.classList.add('quoted-msg__highlight');
                                  setTimeout(() => {
                                      el.classList.remove('quoted-msg__highlight');
                                  }, 2000);
                              }
                          }
                      }
                      // 如果有loading则,取消loading
                      this.isLoading = false;
                  });
              },
  
              // 获取引用消息前后的消息
              getQuoteMsgList(msg, isPrePage = false, resolve, highlight = false) {
                  if (!msg) {
                      console.error('未传入基准引用消息, 无法向上/下请求更多引用消息');
                      return false;
                  }
  
                  // 如果当前不是通过 scroll 加载列表数据(没有 scroll 组件自带的 loading), 则显示 loading
                  if (!resolve) {
                      this.isLoading = true;
                  }
  
                  // 显示 loading
                  this.isLoading = true;
  
                  /* 取消上一次请求，避免频繁请求接口时因接口响应速度快慢导致数据错乱 */
                  if (typeof this.cancelFunc_quote === 'function') {
                      this.cancelFunc_quote();
                  }
                  const vm = this;
  
                  // 发送请求
                  util.ajaxWAJson({
                      url: '/whatsapp/chatRecords/page',
                      method: 'post',
                      data: {
                          orgId: this.enterpriseId,
                        //   userId: this.userId,
                          userId: this.userIdFromApi !== 0 ? this.userIdFromApi : this.userId,
                          userBindWaAccount: this.userBindWaAccount,
                          chatWaAccount: this.chatWaAccount,
                          page: '1', // 实际上没用了, 但是不加报错, 就用 '1' 吧
                          size: `${this.size}`,
                          isPrePage,
                          baseMessageId: msg.messageId,
                          tag: this.tagWaba
                      },
                      cancelToken: new util.axios.CancelToken(function executor(c) {
                          vm.cancelFunc_quote = c;
                      })
                  }).then(({ data }) => {
                      // 请求数据成功, 合并返回消息数据到消息列表
                      if (data.code === 1) {
                          if (Array.isArray(data.data.content) && data.data.content.find(item => item.messageId === msg.messageId)) {
                              // 如果返回数据中包括基准消息, 则正常向下执行(合并数据, 显示)
  
                              this.mergeMsgList(data.data.content, 'quote');
                          } else {
                              // 获取引用消息超时
                              this.$Message.error(this.$t('whatsapp_manage.error_getQuotedMsgTimeout'));
                          }
                      } else if (data.code === -1) {
                          // 获取引用消息超时
                          this.$Message.error(this.$t('whatsapp_manage.error_getQuotedMsgTimeout'));
                      } else {
                          // 失败提示
                          this.$Message.error(this.$t('mail.writeLetter.addContactModal.requestErrorTip'));
                      }
  
                      // 如果请求完成后, 引用消息列表仍为空, 则显示正常列表
                      if (!this.waQuoteMsgList.length) {
                          this.msgListType = 'normal';
                      } else {
                          this.msgListType = 'quote';
                      }
  
                      // 滚动到指定消息位置
                      this.targetMsgLocation(msg, highlight);
  
                      // 隐藏 loading
                      if (resolve) {
                          resolve();
                      }
                      this.isLoading = false;
                  }).catch(err => {
                      console.error(err);
  
                      // 失败提示
                      this.$Message.error(this.$t('mail.writeLetter.addContactModal.requestErrorTip'));
  
                      // 如果请求完成后, 引用消息列表仍为空, 则显示正常列表
                      if (!this.waQuoteMsgList.length) {
                          this.msgListType = 'normal';
                      } else {
                          this.msgListType = 'quote';
                      }
  
                      // 隐藏 loading
                      this.isLoading = false;
                  });
              },
  
              handleFrameScroll: _.debounce(function(e) {
                  // 判断是否需要显示"滚动到最底部"按钮
                  if (this.msgListType === 'normal') {
                      if (this.$refs.msgScroll && this.$refs.msgScroll.$el) {
                          // 暂存消息滚动容器
                          const scrollContainer = this.$refs.msgScroll.$el.querySelector('.ivu-scroll-container');
                          // 暂存所有消息
                          const msgDomArr = scrollContainer.querySelectorAll('.u-msg');
  
                          if (msgDomArr.length) {
                              // 获取最后一条消息的高度
                              const lastMsgHeight = msgDomArr[msgDomArr.length - 1].offsetHeight;
  
                              // 滚动容器滚动距离 + 滚动容器高度 + 最后一条消息高度, 如果小于滚动容器的滚动高度, 则最后一条消息不在视口内, 显示"直达底部"按钮, 否则不显示
                              this.visible_toBottomBtn = scrollContainer.scrollTop + scrollContainer.offsetHeight + lastMsgHeight < scrollContainer.scrollHeight;
                          }
                      }
                  }

                // 触发自动翻译
                this.loadMoreAutoTransMixin();
              }, 250),
              // (切换到正常消息列表模式, )滚动到最底部
              scrollToBottom() {
                  // 显示正常的消息数组
                  this.msgListType = 'normal';
  
                  this.$nextTick(() => {
                      this.targetMsgLocation(this.msgList[this.msgList.length - 1]);
                  });
              },
  
              /* WA 群组消息相关 */
              // 获取群组详情
              async getGroupDetail() {
                  // 显示 loading
                  this.loading_group = true;
  
                  // 清除之前的数据
                  this.clearGroupInfo();
  
                  // 发送请求
                  const res = await util.ajaxWAJson({
                      url: '/whatsapp/chatRecords/getGroupParticipantList',
                      method: 'post',
                      data: {
                          orgId: this.enterpriseId,
                          userId: this.userId,
                          chatWaAccount: this.chatWaAccount,
                          userBindWaAccount: this.userBindWaAccount
                      }
                  });
  
                  // 接口返回数据处理
                  if (res.data && res.data.code === 1 && res.data.data) {
                      const { groupChatDtoList, subject, contactWaAvatar, chatSize } = res.data.data;
  
                      // 处理群成员数据
                      let memberList = Array.isArray(groupChatDtoList) ? groupChatDtoList : [];
                      // 获取"CRM 录入状态"数据, 之后追加到成员数据中
                      const res_crmStatus = await this.getWAAccountCrmStatus(memberList.map(item => item.participant));
                      memberList = memberList.map(item => {
                          const { nickName: name, chatWaAvatar: avatar, participant: waAccount, content: lastChatContent, type: lastChatType, deleteFlag, isAdmin, permission } = item;
                          return {
                              name,
                              avatar,
                              waAccount,
                              lastChatContent,
                              lastChatType,
                              deleteFlag,
                              isAdmin,
                              permission,
                              leadscloudStatus: res_crmStatus[waAccount] || ''
                          };
                      });
  
                      // 赋值
                      this.groupInfo = {
                          account: this.chatWaAccount,
                          name: subject || '',
                          avatar: contactWaAvatar || '',
                          size: chatSize || 0,
                          memberList
                      };
                  } else {
                      this.$Message.error(this.$t('whatsapp_manage.error_getGroupDetail'));
                  }
  
                  // 隐藏 loading
                  this.loading_group = false;
              },
              // 清除原有群组数据
              clearGroupInfo() {
                  this.groupInfo = {
                      account: this.chatWaAccount || '',
                      name: '',
                      avatar: '',
                      size: 0,
                      memberList: []
                  };
              },
              // 请求 CRM 状态
              async getWAAccountCrmStatus(accountList) {
                  // 传入参数校验
                  if (!(Array.isArray(accountList) && accountList.length)) {
                      this.$Message.error(this.$t('crm.InqSet.error_params'));
  
                      return [];
                  }
  
                  // 请求接口
                  const res = await util.ajaxWAJson({
                      url: '/whatsapp/contactToLeadscloudStatus/getLeadscloudStatus',
                      method: 'POST',
                      data: {
                          contactWaAccountList: accountList,
                          orgId: this.enterpriseId
                      }
                  });
  
                  // 格式化接口返回, 转换成 { waAccount: leadscloudStatus } 格式
                  const result = {};
                  if (res.data && res.data.code === 1) {
                      if (Array.isArray(res.data.data) && res.data.data.length) {
                          res.data.data.forEach(item => {
                              result[item.contactWaAccount] = item.leadscloudStatus;
                          });
                      }
                  }
  
                  // 返回结果
                  return result;
              },
              // 刷新最近更新时间
              refreshBtn() {
                  getLastPushTime({
                      orgId: this.enterpriseId,
                      userId: this.userId,
                      userBindWaAccount: this.userBindWaAccount,
                      customerWaAccount: this.chatWaAccount
                  }).then((res) => {
                      if (res.code === 1) {
                          this.refreshTime = res.data ? res.data : '--';
                      } else {
                          this.refreshTime = '--';
                      }
                  });
                  // this.page = 1;
                  // this.size = 20;
                  // this.refreshStatus = true;
                  // this.waQuoteMsgList = [];
                  // this.whatsAppMsgList = [];
                  // this.getWhatsAppMsg();
              }
          },
          watch: {
              currentLineItemId: {
                  handler(val) {
                      console.log('currentLineItemId()------', val);
                      if (val) {
                          this.whatsAppMsgList = [];
                          this.waQuoteMsgList = [];
                          this.msgListType = 'normal';
                          this.page = 1;
                          this.getWhatsAppMsg();
  
                          // return
                          if (this.messageAberrant) {
                              return;
                          }
  
                          // 是群组消息, 请求群组相关信息
                          if (this.isGroup) {
                              this.getGroupDetail();
                          } else {
                              this.refreshBtn();
                          }
                      }
                  },
                  immediate: true
              },
              // 监听显示的消息数组类型, 显示的是引用消息, 则显示"直达底部"按钮
              msgListType: {
                  handler(val) {
                      if (val === 'quote') {
                          this.visible_toBottomBtn = true;
                      }
                  }
              }
          }
      };
  </script>
  
  <style>
  .whatsapp-container .msg-more {
      display: none !important;
  }
  .whatsapp-container .msg-text {
      max-width: 50% !important;
  }
  .refresh-btn-loading {
      animation: refreshLoading 1.5s infinite linear;
  }
  @keyframes refreshLoading {
    0% {
      transform: rotate(0deg); /*动画起始位置为旋转0度*/
    }
    to {
      transform: rotate(1turn); /*动画结束位置为旋转1圈*/
    }
  }
  </style>
  
  <style lang="less" scoped>
  .whatsapp-container {
    .whatsapp-header {
      font-size: 16px;
      height: 40px;
      line-height: 30px;
      border-bottom: 1px solid #e5e5e5;
      .refresh-btn-time {
          font-size: 12px;
          margin: 0 8px;
          color: rgba(0, 0, 0, 0.6);
      }
    }
  
      .scrollToBottom-btn {
          display: inline-block;
          border-radius: 50%;
          position: absolute;
          top: -54px;
          right: 0;
          cursor: pointer;
  
          svg {
              width: 40px;
              height: 40px;
          }
      }
  }
  </style>
  