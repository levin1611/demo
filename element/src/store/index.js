import Vue from 'vue';
import Vuex from 'vuex';

import app from './modules/app';
import user from './modules/user';
import mail from './modules/mail';
import letter from './modules/letter';
import facebook from './modules/facebook';
import inbox from './modules/inbox';
import crm from './modules/crm';
import onekeyrelease from './modules/onekeyrelease';
import customs from './modules/customs';
import clue from './modules/clue';
import visitor_history from './modules/visitor_history';
import website_msg from './modules/website_msg';
import data_report from './modules/data_report';
import google from './modules/google';
import mail_window from './modules/mail_window';
import seo from './modules/seo';
import dashboard from './modules/dashboard';
import socket from './modules/socket';
import whatsapp from './modules/whatsapp';
import chat from './modules/chat'; // 网站聊天
import emailAddress from './modules/emailAddress';
import ai from './modules/ai';

import mutations from './mutations';
import actions from './actions';
import state from './state';
import microenterprise from './modules/Microenterprise'; // 企微
import callingSms from './modules/call_sms';

import aiToolBar from './modules/aiToolBar'

Vue.use(Vuex);

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters: {
    // 是否已打开侧滑页
    drawer_show: (state) => {
      return (
        state.crm_drawer_show ||
        state.clue_drawer_show ||
        state.leads_drawer_show ||
        state.product_drawer_show ||
        state.visitor_drawer_show ||
        state.adsSet_drawer_show
      )
    },
    // 当前是否是 wa 个人版
    isWAPersonalEdition: (state) => {
      // 超管权限, 可使用全部功能, 忽略 wa 个人版对功能的限制
      if (state.isSuperAdmin) {
        return false
      }

      return state.version === 'WAPersonalEdition'
    },
    // 当前是否是企业定制版
    isCustomEdition: (state) => {
      return state.version.startsWith('customFor_') ? state.version : false
    },
    // 当前选中的语种是不是在[不允许翻译语种内] 如果返回 undefine 则代表可以翻译
    isInBlackList: (state) => {
      return state.autoTranslateNoTArr.find(
        (ele) => ele === state.isInNotNeeDTranslateArr
      )
    },
  },
  modules: {
    app,
    user,
    mail,
    letter,
    facebook,
    inbox,
    crm,
    onekeyrelease,
    customs,
    clue,
    visitor_history,
    website_msg,
    data_report,
    google,
    mail_window,
    seo,
    dashboard,
    socket,
    whatsapp,
    chat,
    emailAddress,
    microenterprise,
    callingSms,
    ai,
    aiToolBar,
  },
})

export default store;
