// Action 提交的是 mutation，而不是直接变更状态。
// Action 可以包含任意异步操作。

import util from '@/libs/util';
import { Message } from 'element-ui';
import i18n from '@/locale';
import Cookies from 'js-cookie';

/* 导出actions方法 */
import { showFullscreenImg } from './widgetUi';
import { initNimSDK } from './initNimSDK';
import { updateBlack } from './blacks';
import { updateFriend, addFriend, deleteFriend } from './friends';
// import { resetSearchResult, searchUsers, getUser, getUsers } from './search';
import { resetSearchResult, searchUsers, getUsers } from './search';
import { onSessions, deleteSession, setCurrSession, resetCurrSession } from './session';
import { serverStartChat, sendMsg, sendFileMsg, sendMsgReceipt, sendRobotMsg, revocateMsg, getHistoryMsgs, getTransferHistoryMsgs, resetNoMoreHistoryMsgs, continueRobotMsg, onTranslateMsg, getVisitorReception } from './msgs';
import { markSysMsgRead, resetSysMsgs, markCustomSysMsgRead, updatePersonSubscribes, updateSessionList } from './sysMsgs';
import { onlineStatus, testAnalytics, saveChatMsg, google_analytics, chatWithEmail, saveMsgId, onSDKCallbackError } from './logo';
import { taskNotice, pushNotice, msgNotice, TransferPush, otherNotice, systemNotice, wsLinkNotice, associationMsgNotice } from './chatNotice';
import { getCRMFieldAPI, getSalesList, getAllUsers, getFollowUpType, getSelectOptions } from './crm';

import { updateToolbarTriggerConfig } from './aiToolBar'

export default {
  updateRefreshState({ commit }) {
    commit('updateRefreshState')
  },
  // UI 及页面状态变更
  showFullscreenImg,
  continueRobotMsg,

  // 初始化 重新连接SDK
  initNimSDK,
  // 清空所有搜索历史纪录
  resetSearchResult,
  // 搜索用户信息
  searchUsers,
  // 更新黑名单
  updateBlack,
  // 更新好友
  addFriend,
  deleteFriend,
  updateFriend,
  // 会话列表
  onSessions,
  // 删除会话
  deleteSession,
  // 设置当前会话
  setCurrSession,
  // 重置当前会话
  resetCurrSession,
  // 发送消息
  serverStartChat,
  sendMsg,
  sendFileMsg,
  sendRobotMsg,
  // 发送消息已读回执
  sendMsgReceipt,
  // 消息撤回
  revocateMsg,
  getTransferHistoryMsgs,
  getHistoryMsgs,
  // 重置历史消息状态
  resetNoMoreHistoryMsgs,
  // 标记系统消息已读
  markSysMsgRead,
  markCustomSysMsgRead,
  resetSysMsgs,
  // 日志
  // 在线状态 obj.flag=1 在线 0离线
  onlineStatus,
  testAnalytics,
  saveChatMsg,
  google_analytics,
  chatWithEmail,
  // 更新订阅
  updatePersonSubscribes,
  updateSessionList,
  // getUser,
  getUsers,
  // 翻译
  onTranslateMsg,
  getVisitorReception,
  // 访客、消息提醒
  pushNotice,
  msgNotice,
  TransferPush,
  otherNotice,
  systemNotice,
  wsLinkNotice,
  // 自动关联提醒
  associationMsgNotice,
  // 任务提醒
  taskNotice,
  saveMsgId,
  onSDKCallbackError,

  // 请求 CRM 字段长度上限
  getCRMFieldAPI,
  getSalesList,
  getAllUsers,
  getFollowUpType,
  getSelectOptions,
  // 账号切换
  toggleAccount(store, account) {
    /**
     * @Description: 乐达美业提需求, 老板想快速切换集团下不同企业的账号查看数据
     * 具体实现为:
     * 1. 登录/切换账号时给出 relatedOrgList 在右上角用户头像下拉处显示
     * 2. 点击下拉选项触发此处"切换关联账号"
     * 3. 此处动作完全参照 login 接口, 但是去掉后续系列动作, 只对 cookie 和 localStorage 操作, 随后刷新当前页, 模拟"用户自己登录账号后刷新页面"动作
     * @author 汤一飞
     * @date 2021/1/19
     */
    util
      .ajax({
        url: '/cuss-login/relatedLogin',
        method: 'post',
        data: {
          currentOrgId: store.state.enterpriseId,
          currentUserId: store.state.userId,
          currentUserName: store.state.userName,
          targetOrgId: account.orgId,
          targetUserId: account.userId,
          targetUserName: account.userName,
        },
      })
      .then(async (response) => {
        if (response.data.code === '1') {
          localStorage.setItem('XHLLogin', 'LOGIN')

          const userData = response.data.data
          Cookies.set('accId', userData.accId)
          Cookies.set('token', userData.token)
          Cookies.set('fullName', encodeURI(userData.fullName))
          Cookies.set('userName', account.userName)
          Cookies.set('userId', userData.userId)
          Cookies.set('agentOrgList', userData.agentOrgList)
          Cookies.set('enterpriseId', userData.orgId)
          // 设置关联账号
          Cookies.set(
            'relatedAccounts',
            Array.isArray(userData.relatedOrgList)
              ? userData.relatedOrgList
              : []
          )

          // 刷新当前页
          localStorage.setItem('relatedLogin', 'true')
          location.reload()
        } else {
          if (response.data.code === '0') {
            Message.error(i18n.t('login.logErrTips'))
          } else if (response.data.code === '-1') {
            Message.error(i18n.t('login.logErrTips1'))
          } else if (response.data.code === '-2') {
            Message.error(i18n.t('login.logErrTips2'))
          } else if (response.data.code === '-3') {
            Message.error(i18n.t('login.logErrTips3'))
          }
        }
      })
      .catch((error) => {
        // Network Error
        // time out
        console.log('login time out error', error)
      })
  },
  updateToolbarTriggerConfig,
}
