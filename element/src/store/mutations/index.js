// 更改 Vuex 的 store 中的状态的唯一方法是提交 mutation
// this.$store.commit(method, params)
import Vue from 'vue';
import store from '../';
// import cookie from '../../utils/cookie'
import Utils from '../../utils';
import util from '@/libs/util';
import config from '../../configs';
import i18n from '@/locale';
import resetMessage from '../../libs/resetMessage';
import { Message } from 'element-ui';

// 健康检查用到 Promise.any 低版本浏览器不兼容, 做兼容处理
function promiseAnyPolyfill(urlList, successCb, errorCb) {
    if (Promise.any) {
        // 支持 Promise.any , 按原逻辑走

        const ajaxList = urlList.map(url => {
            return util.axios.get(url);
        });

        Promise.any(ajaxList).then(successCb).catch(errorCb);
    } else if (Promise.all) {
        // 不支持 Promise.any , 但 Promise.all 兼容性好基本都支持

        const ajaxList = urlList.map(url => {
            return new Promise((resolve, reject) => {
                util.axios
                    .get(url)
                    .then(res => reject(res))
                    .catch(err => resolve(err));
            });
        });

        Promise.all(ajaxList).then(errorCb).catch(successCb);
    } else {
        // 都不支持, 直接进入错误回调

        errorCb();
    }
}

export default {
    // wa群发任务发送成功后,更新群发列表页面的数据
    updateWAGroupSendList(state, data) {
        state.updateWAGroupList = data;
    },
    // 控制文件预览组件显示的阈值
    setWAGroupSendVisible(state, value) {
        if(value == false) {
            state.wAGroupSendAccount = [];
            state.wAGroupSendallChecked = undefined;
        }
        state.wAGroupSendVisible = value;
    },
    setwAGroupSendAccount(state, value) {
        // wAGroupSendAccount 等待发送的wa号码数组
        state.wAGroupSendAccount = value;
    },
    setwAGroupSendallChecked(state, allChecked) {
        // wAGroupSendallChecked 是不是全选
        state.wAGroupSendallChecked = allChecked;
    },
    setIsUpgrade(state, data) {
        state.isUpgrade = data;
    },
    updateVisitorOnlineStatus(state, data) {
        state.visitorOnlineStatus = data;
    },
    setIsFixed(state, data) {
        state.isFixed = data;
    },
    setLittleDrawerMailDetailFixed(state, data) {
        state.littleDrawerMailDetailFixed = data;
    },
    setIsCrmDetailFixed(state, data) {
        state.isCrmDetailFixed = data;
    },
    setConversationStatus(state, data) {
        state.fbChatStatus = data;
    },
    setAssosiatedFbCommentInquiryId(state, data) {
        state.assosiatedFbCommentInquiryId = data;
    },
    setAssosiatedFbCommentorAndPostId(state, data) {
        state.assosiatedFbCommentorAndPostId = data;
    },
    setFbChatFromName(state, data) {
        state.autoAssosaiteFbChatFromName = data;
    },
    setFbChatInquiry(state, data) {
        state.fbChatInquiry = data;
    },
    setMailUnread(state, data) {
        state.mailUnread = data;
    },
    setEventBus(state, data) {
        state.eventBus = data;
    },
    // 设置当前账号关联的其他账号 - 从登录账号和
    setRelatedAccounts(state, arr) {
        state.relatedAccounts = Array.isArray(arr) ? arr : [];
    },
    setIsReloadServerList(state, data) {
        state.isReloadServerList = data;
    },
    setUserId(state, obj) {
        state.userId = obj.userId;
    },
    setAccId(state, id) {
        state.AccId = id;
    },
    setUserName(state, data) {
        state.userName = data;
    },
    setFullName(state, data) {
        state.fullName = data;
    },
    setEnterpriseId(state, data) {
        state.enterpriseId = data;
    },
    // 设置"是否是超管"
    setIsSuperAdmin(state, data) {
        state.isSuperAdmin = data;
    },
    setIsFbService(state, data) {
        state.isFbService = data;
        state.hadSetIsFbService = true;
    },
    // 设置是否是WABA客服
    setIsWabaService(state, data) {
        state.IsWabaService = data;
    },
    // 是否有聊天权限
    setHasChatAuthority(state, data) {
        state.hasChatAuthority = data;
    },
    // setNoticeUnread(state, data) {
    //     state.noticeUnread = data;
    // },
    updateRefreshState(state) {
        state.isRefresh = false;
    },
    updateLoading(state, status) {
        clearTimeout(state.loadingTimer);
        state.loadingTimer = setTimeout(() => {
            state.isLoading = status;
        }, 20);
    },
    updateFullscreenImage(state, obj) {
        obj = obj || {};
        if (obj.src && obj.type === 'show') {
            state.fullscreenImgSrc = obj.src;
            state.isFullscreenImgShow = true;
        } else if (obj.type === 'hide') {
            state.fullscreenImgSrc = ' ';
            state.isFullscreenImgShow = false;
        }
    },
    // 触发全屏 carousel 显隐
    updateFullCarousel(state, obj) {
        if (obj) {
            state.isFullCarouselShow = true;
            state.fullCarouselProps = obj;
        } else {
            state.isFullCarouselShow = false;
            state.fullCarouselProps = {};
        }
    },
    // 触发全屏 carousel 显隐
    updateGlobalWaReplyModal(state, obj) {
        console.log('存在全局回复框',state.globalWaReplyModalProps,obj);
        if (obj) {
            const keys = Object.keys(state.globalWaReplyModalProps)
            const newValue = Object.keys(obj);
            // key 和 newvalue都不为空代表 现在存在wa全局回复框 不能更新现有的回复框数据globalWaReplyModalProps
            if(keys.length && newValue.length){
                Message.error(i18n.t('whatsapp_manage.timeLineWhatsAppAlreadyOpen'));
                return false;
            }
            state.globalWaReplyModalProps = obj;
        } else {
            state.globalWaReplyModalProps = {};
        }
    },
    updateUserUID(state, loginInfo) {
        state.userUID = loginInfo.uid;
        state.sdktoken = loginInfo.sdktoken;
        // cookie.setCookie('uid', loginInfo.uid)
        // cookie.setCookie('sdktoken', loginInfo.sdktoken)
    },
    updateMyInfo(state, myInfo) {
        // state.myInfo = Utils.mergeObject(state.myInfo, myInfo)
    },
    updateUserInfo(state, users) {
        const userInfos = state.userInfos;
        users.forEach(user => {
            const account = user.account;
            if (account) {
                // 之前被注释，先解注看看效果
                userInfos[account] = Utils.mergeObject(userInfos[account], user);
            }
        });
        // 之前被注释，先解注看看效果
        state.userInfos = Utils.mergeObject(state.userInfos, userInfos);
    },
    updateFriends(state, friends, cutFriends = []) {
        console.log(`friends= ${JSON.stringify(friends)}`);
        const nim = state.nim;
        state.friendslist = nim.mergeFriends(state.friendslist, friends);
        // state.friendslist = nim.cutFriends(state.friendslist, cutFriends)
        state.friendslist = nim.cutFriends(state.friendslist, friends.invalid);
    },
    updateRobots(state, robots) {
        const nim = state.nim;
        robots = robots.map(item => {
            if (item.avatar) {
                item.originAvatar = item.avatar;
                item.avatar = nim.viewImageSync({
                    url: item.avatar, // 必填
                    thumbnail: { // 生成缩略图， 可选填
                        width: 40,
                        height: 40,
                        mode: 'cover'
                    }
                });
            } else {
                item.avatar = config.defaultUserIcon;
            }
            return item;
        });
        state.robotslist = robots;
        state.robotInfos = Object.create(null);
        robots.forEach(robot => {
            state.robotInfos[robot.account] = robot;
            state.robotInfosByNick[robot.nick] = robot;
        });
    },
    updateBlacklist(state, blacks) {
        const nim = state.nim;
        state.blacklist = nim.cutFriends(state.blacklist, blacks.invalid);
        const addBlacks = blacks.filter(item => {
            return item.isBlack === true;
        });
        const remBlacks = blacks.filter(item => {
            return item.isBlack === false;
        });
        // 添加黑名单
        state.blacklist = nim.mergeFriends(state.blacklist, addBlacks);
        // 解除黑名单
        state.blacklist = nim.cutFriends(state.blacklist, remBlacks);
    },
    updateSearchlist(state, obj) {
        const type = obj.type;
        switch (type) {
            case 'user':
                if (obj.list.length !== 0 || state.searchedUsers.length !== 0) {
                    state.searchedUsers = obj.list;
                } else {
                    state.searchedUsers = [];
                }
                break;
            case 'team':
                if (obj.list.length !== 0 || state.searchedTeams.length !== 0) {
                    state.searchedTeams = obj.list;
                } else {
                    state.searchedTeams = [];
                }
                break;
        }
    },
    updateSessions(state, sessions) {
        console.log('sessions');
        console.log(JSON.stringify(sessions));
        const nim = state.nim;
        for (let i = 0; i < sessions.length; i++) {
            // if (!state.personSubscribes[sessions[i].to]) {
            store.commit('subscribeEvent', sessions[i].to);
            // }
            state.personSubscribes[sessions[i].to] = state.personSubscribes[sessions[i].to] || {};
            state.personSubscribes[sessions[i].to].session = sessions[i];
        }
        state.sessionlist = nim.mergeSessions(state.sessionlist, sessions);
        console.log(JSON.stringify(state.sessionlist));
        // for (let i = 0; i < sessions.length; i++) {
        //     (function(j) {
        //         if (sessions[j].scene === 'p2p') {
        //             const tmpUser = sessions[j].to;
        //             // 如果会话列表不是好友，需要订阅关系
        //             // if (!this.cache.isFriend(tmpUser)) {
        //             //     that.subscribeMultiPortEvent([tmpUser])
        //             // }
        //             let isLoopDone = false;
        //             if (j == sessions.length - 1) {
        //                 isLoopDone = true;
        //             }
        //             state.person[tmpUser] = true;
        //             store.dispatch('getUser', {
        //                 msgEvent: tmpUser,
        //                 type: 0,
        //                 isLoopDone: isLoopDone
        //             });
        //         }
        //     })(i);
        // }
        // // state.sessionlist = state.sessionlist.filter(item => {
        // //   if (/^team-/.test(item.id)) {
        // //     return false
        // //   }
        // //   return true
        // // })
        // // state.sessionlist.sort((a, b) => {
        // //   return b.updateTime - a.updateTime
        // // })


        store.dispatch('getUsers', {
            accountList: sessions.filter(session => (session.scene === 'p2p') && (state.person[session.to] = true)).map(session => session.to)
        });

        state.sessionlist.forEach(item => {
            state.sessionMap[item.id] = item;
        });
    },
    deleteSessions(state, sessionIds) {
        const nim = state.nim;
        state.sessionlist = nim.cutSessionsByIds(state.sessionlist, sessionIds);
    },
    // 初始化，收到离线漫游消息时调用
    updateMsgs(state, msgs) {
        const nim = state.nim;
        const tempSessionMap = {};
        msgs.forEach(msg => {
            const sessionId = msg.sessionId;
            tempSessionMap[sessionId] = true;
            if (!state.msgs[sessionId]) {
                state.msgs[sessionId] = [];
            }
            // sdk会做消息去重
            state.msgs[sessionId] = nim.mergeMsgs(state.msgs[sessionId], [msg]);
            // state.msgs[sessionId].push(msg)
        });
        store.commit('updateMsgByIdClient', msgs);
        for (const sessionId in tempSessionMap) {
            state.msgs[sessionId].sort((a, b) => {
                if (a.time === b.time) {
                    // 机器人消息，回复消息时间和提问消息时间相同，提问在前，回复在后
                    if (a.type === 'robot' && b.type === 'robot') {
                        if (a.content && a.content.msgOut) {
                            return 1;
                        }
                        if (b.content && b.content.msgOut) {
                            return -1;
                        }
                    }
                }
                return a.time - b.time;
            });
            if (sessionId === state.currSessionId) {
                store.commit('updateCurrSessionMsgs', {
                    type: 'init'
                });
            }
        }
    },
    // 更新追加消息，追加一条消息
    putMsg(state, msg) {
        console.log(JSON.stringify(msg));
        const sessionId = msg.sessionId;
        if (!state.msgs[sessionId]) {
            state.msgs[sessionId] = [];
        }
        store.commit('updateMsgByIdClient', msg);
        const tempMsgs = state.msgs[sessionId];
        const lastMsgIndex = tempMsgs.length - 1;
        if (tempMsgs.length === 0 || msg.time >= tempMsgs[lastMsgIndex].time) {
            tempMsgs.push(msg);
        } else {
            for (let i = lastMsgIndex; i >= 0; i--) {
                const currMsg = tempMsgs[i];
                if (msg.time >= currMsg.time) {
                    state.msgs[sessionId].splice(i, 0, msg);
                    break;
                }
            }
        }
    },
    // 添加转接的聊天内容
    joinMsg(state, obj) {
        const tempMsgs = [];
        const sessionId = obj.sessionId;
        const msgs = obj.msgs;
        // 添加访客和不同客服对话的间隔 timeTag
        if (msgs.length) {
            // 通过 reduce 的方式, 把 timeTag 加入到不同的对话之间
            msgs.reduce((a, b) => {
                // 先把当前消息 push 进去
                tempMsgs.push(a);

                // 再根据当前消息和后一条消息的 fromAccount 和 toAccount 来判断当前消息是否为不同对话的分界点, 添加 timeTag
                if (a.flow === 'in') {
                    // 如果 a 是访客发的消息
                    if (b.flow === 'in') {
                        // 如果接下来一条消息 b 也是访客发的消息
                        if (b.toAccount !== a.toAccount) {
                            // 但是两条消息发送到的客服不一致
                            // 添加 timeTag
                            tempMsgs.push({
                                type: 'timeTag',
                                text: `${i18n.t('chat.historyMsgTip1')}${a.toNick}${i18n.t('chat.historyMsgTip2')}${a.fromNick}${i18n.t('chat.historyMsgTip3')}`,
                                idClient: sessionId + (a.time + 1),
                                time: a.time + 1
                            });
                        }
                    } else {
                        // 如果 b 是客服发送过来的消息
                        if (a.toAccount !== b.fromAccount) {
                            // 如果 b 的发送客服不是 a 之前指定的接收客服
                            // 添加 timeTag
                            tempMsgs.push({
                                type: 'timeTag',
                                text: `${i18n.t('chat.historyMsgTip1')}${a.toNick}${i18n.t('chat.historyMsgTip2')}${a.fromNick}${i18n.t('chat.historyMsgTip3')}`,
                                idClient: sessionId + (a.time + 1),
                                time: a.time + 1
                            });
                        }
                    }
                } else {
                    // 如果 a 是客服发的消息
                    if (b.flow === 'in') {
                        // 如果接下来一条消息 b 是访客发的消息
                        if (a.fromAccount !== b.toAccount) {
                            // 如果 b 发送给的客服不是 a 的发送客服
                            // 添加 timeTag
                            tempMsgs.push({
                                type: 'timeTag',
                                text: `${i18n.t('chat.historyMsgTip1')}${a.fromNick}${i18n.t('chat.historyMsgTip2')}${a.toNick}${i18n.t('chat.historyMsgTip3')}`,
                                idClient: sessionId + (a.time + 1),
                                time: a.time + 1
                            });
                        }
                    } else {
                        // 如果接下来一条消息 b 也是客服发的消息
                        if (b.fromAccount !== a.fromAccount) {
                            // 但是发送两条消息的客服不一致
                            // 添加 timeTag
                            tempMsgs.push({
                                type: 'timeTag',
                                text: `${i18n.t('chat.historyMsgTip1')}${a.fromNick}${i18n.t('chat.historyMsgTip2')}${a.toNick}${i18n.t('chat.historyMsgTip3')}`,
                                idClient: sessionId + (a.time + 1),
                                time: a.time + 1
                            });
                        }
                    }
                }
                return b;
            });

            // reduce 方式无法处理到 msgs 最后一项, 需要单独处理
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg) {
                // 先 push
                tempMsgs.push(lastMsg);
                // 添加 timeTag
                if (lastMsg.flow === 'in') {
                    // 如果是访客消息
                    if (lastMsg.toAccount !== state.AccId) {
                        // 如果访客想发送到的客服不是当前客服
                        // 添加 timeTag
                        tempMsgs.push({
                            type: 'timeTag',
                            text: `${i18n.t('chat.historyMsgTip1')}${lastMsg.toNick}${i18n.t('chat.historyMsgTip2')}${lastMsg.fromNick}${i18n.t('chat.historyMsgTip3')}`,
                            idClient: sessionId + (lastMsg.time + 1),
                            time: lastMsg.time + 1
                        });
                    }
                } else {
                    // 如果是客服消息
                    if (lastMsg.fromAccount !== state.AccId) {
                        // 如果发送消息的客服不是当前客服
                        // 添加 timeTag
                        tempMsgs.push({
                            type: 'timeTag',
                            text: `${i18n.t('chat.historyMsgTip1')}${lastMsg.fromNick}${i18n.t('chat.historyMsgTip2')}${lastMsg.toNick}${i18n.t('chat.historyMsgTip3')}`,
                            idClient: sessionId + (lastMsg.time + 1),
                            time: lastMsg.time + 1
                        });
                    }
                }
            }
        }

        // 重新存入 Vuex
        state.msgs[sessionId] = tempMsgs;

        // 如果是当前会话, 则更新当前会话消息数据
        if (sessionId === `p2p-${state.currSessionId}`) {
            store.commit('updateCurrSessionMsgs', {
                type: 'init',
                sessionId
            });
        }
    },
    // 删除消息列表消息
    deleteMsg(state, msg) {
        const sessionId = msg.sessionId;
        const tempMsgs = state.msgs[sessionId];
        if (!tempMsgs || tempMsgs.length === 0) {
            return;
        }
        const lastMsgIndex = tempMsgs.length - 1;
        for (let i = lastMsgIndex; i >= 0; i--) {
            const currMsg = tempMsgs[i];
            if (msg.idClient === currMsg.idClient) {
                state.msgs[sessionId].splice(i, 1);
                break;
            }
        }
    },
    // 替换消息列表消息，如消息撤回
    replaceMsg(state, obj) {
        const { sessionId, idClient, msg } = obj;
        const tempMsgs = state.msgs[sessionId];
        if (!tempMsgs || tempMsgs.length === 0) {
            return;
        }
        const lastMsgIndex = tempMsgs.length - 1;
        for (let i = lastMsgIndex; i >= 0; i--) {
            const currMsg = tempMsgs[i];
            console.log(idClient, currMsg.idClient, currMsg.text);
            if (idClient === currMsg.idClient) {
                state.msgs[sessionId].splice(i, 1, msg);
                break;
            }
        }
    },
    // 用idClient 更新消息，目前用于消息撤回
    updateMsgByIdClient(state, msgs) {
        if (!Array.isArray(msgs)) {
            msgs = [msgs];
        }
        const tempTime = (new Date()).getTime();
        msgs.forEach(msg => {
            // 有idClient 且 5分钟以内的消息
            if (msg.idClient && (tempTime - msg.time < 1000 * 300)) {
                state.msgsMap[msg.idClient] = msg;
            }
        });
    },
    // 更新当前会话id，用于唯一判定是否在current session状态
    updateCurrSessionId(state, obj) {
        const type = obj.type || '';
        if (type === 'destroy') {
            state.currSessionId = null;
        } else if (type === 'init') {
            if (obj.sessionId && (obj.sessionId !== state.currSessionId)) {
                state.currSessionId = obj.sessionId;
            }
        }
    },
    // 更新当前会话列表的聊天记录，包括历史消息、单聊消息等，不包括聊天室消息
    // replace: 替换idClient的消息
    updateCurrSessionMsgs(state, obj) {
        console.log(JSON.stringify(obj));
        const type = obj.type || '';
        if (type === 'destroy') { // 清空会话消息
            state.currSessionMsgs = [];
            state.currSessionLastMsg = null;
            store.commit('updateCurrSessionId', {
                type: 'destroy'
            });
        } else if (type === 'init') { // 初始化会话消息列表
            if (state.currSessionId) {
                const sessionId = `p2p-${state.currSessionId}`;
                console.log(JSON.stringify(state.msgs[sessionId]));
                let currSessionMsgs = [].concat(state.msgs[sessionId] || []);
                // 做消息截断
                const limit = config.localMsglimit; // 配置文件中配置的显示消息的条数
                const msgLen = currSessionMsgs.length; // 消息的条数
                // 如果条数大于系统配置的条数，执行的逻辑
                if (msgLen - limit > 0) {
                    store.commit('setNoMoreHistoryMsgs', {
                        account: state.currSessionId,
                        type: true
                    });
                    state.currSessionLastMsg = currSessionMsgs[msgLen - limit];
                    currSessionMsgs = currSessionMsgs.slice(msgLen - limit, msgLen);
                } else if (msgLen > 0) {
                    state.currSessionLastMsg = currSessionMsgs[0];
                } else {
                    state.currSessionLastMsg = null;
                }
                state.currSessionMsgs = [];
                let lastMsgTime = 0;
                // 判断每条消息之间的时间间隔是否大于5分，如果大于5分钟就在每条消息中间加一个时间
                currSessionMsgs.forEach(msg => {
                    if ((msg.time - lastMsgTime) > 1000 * 60 * 5) {
                        lastMsgTime = msg.time;
                        state.currSessionMsgs.push({
                            type: 'timeTag',
                            text: Utils.formatDate(msg.time, false),
                            idClient: msg.time + msg.idClient + (Date.now() + state.currSessionMsgs.length),
                            time: msg.time - 1
                        });
                    }
                    state.currSessionMsgs.push(msg);
                });
            }
        } else if (type === 'put') { // 追加一条消息
            const newMsg = obj.msg;
            let lastMsgTime = 0;
            const lenCurrMsgs = state.currSessionMsgs.length;
            if (lenCurrMsgs > 0) {
                lastMsgTime = state.currSessionMsgs[lenCurrMsgs - 1].time;
            }
            if (newMsg) {
                if ((newMsg.time - lastMsgTime) > 1000 * 60 * 5) {
                    state.currSessionMsgs.push({
                        type: 'timeTag',
                        text: Utils.formatDate(newMsg.time, false),
                        idClient: newMsg.time + newMsg.idClient + (Date.now() + state.currSessionMsgs.length),
                        time: newMsg.time - 1
                    });
                }
                state.currSessionMsgs.push(newMsg);
                // 聊天界面的聊天记录添加消息
                // state.currHistorySessionMsgs.push(newMsg)
            }
        } else if (type === 'concat') {
            // 一般用于历史消息拼接
            const currSessionMsgs = [];
            let lastMsgTime = 0;
            obj.msgs.forEach(msg => {
                if ((msg.time - lastMsgTime) > 1000 * 60 * 5) {
                    lastMsgTime = msg.time;
                    currSessionMsgs.push({
                        type: 'timeTag',
                        text: Utils.formatDate(msg.time, false),
                        idClient: msg.time + msg.idClient + (Date.now() + state.currSessionMsgs.length),
                        time: msg.time - 1
                    });
                }
                currSessionMsgs.push(msg);
            });
            currSessionMsgs.reverse();
            currSessionMsgs.forEach(msg => {
                state.currSessionMsgs.unshift(msg);
            });
            if (obj.msgs[0]) {
                state.currSessionLastMsg = obj.msgs[0];
            }
        } else if (type === 'replace') {
            const msgLen = state.currSessionMsgs.length;
            const lastMsgIndex = msgLen - 1;
            if (msgLen > 0) {
                for (let i = lastMsgIndex; i >= 0; i--) {
                    if (state.currSessionMsgs[i].idClient === obj.idClient) {
                        state.currSessionMsgs.splice(i, 1, obj.msg);
                        break;
                    }
                }
            }
        }
        // 微前端上线后, Vue.observable(基座应用 store 实例)导致此处更新后, msg-frame.vue 页面(先切到子模块再切回来)没有实时响应, 重新赋值解决
        state.currSessionMsgs = state.currSessionMsgs.slice();
    },
    updateSysMsgs(state, sysMsgs) {
        const nim = state.nim;
        if (!Array.isArray(sysMsgs)) {
            sysMsgs = [sysMsgs];
        }
        sysMsgs = sysMsgs.map(msg => {
            msg.showTime = Utils.formatDate(msg.time, false);
            return msg;
        });
        // state.sysMsgs = nim.mergeSysMsgs(state.sysMsgs, sysMsgs)
        state.sysMsgs = [].concat(nim.mergeSysMsgs(state.sysMsgs, sysMsgs));
    },
    updateSysMsgUnread(state, obj) {
        state.sysMsgUnread = obj;
    },
    updateCustomSysMsgs(state, sysMsgs) {
        const nim = state.nim;
        if (!Array.isArray(sysMsgs)) {
            sysMsgs = [sysMsgs];
        }
        sysMsgs = sysMsgs.map(msg => {
            msg.showTime = Utils.formatDate(msg.time, false);
            return msg;
        });
        // state.customSysMsgs = nim.mergeSysMsgs(state.customSysMsgs, sysMsgs)
        state.customSysMsgs = state.customSysMsgs.concat(sysMsgs);
        store.commit('updateCustomSysMsgUnread', {
            type: 'add',
            unread: sysMsgs.length
        });
    },
    updateCustomSysMsgUnread(state, obj) {
        const { type, unread } = obj;
        switch (type) {
            case 'reset':
                state.customSysMsgUnread = unread || 0;
                break;
            case 'add':
                state.customSysMsgUnread += unread;
                break;
        }
    },
    resetSysMsgs(state, obj) {
        const type = obj.type;
        switch (type) {
            case 0:
                state.sysMsgs = [];
                break;
            case 1:
                state.customSysMsgs = [];
                store.commit('updateCustomSysMsgUnread', {
                    type: 'reset'
                });
                break;
        }
    },
    setNoMoreHistoryMsgs(state, obj) {
        Vue.set(state.noMoreHistoryMsgs, obj.account, obj.type);
    },
    resetNoMoreHistoryMsgs(state) {
        // state.noMoreHistoryMsgs = false
    },
    // 存储页面 title 闪动的 setTimeout
    changeNewRemindFlag(state, val) {
        clearTimeout(store.state.newRemindFlag);
        if (val) {
            store.state.newRemindFlag = val;
        }
    },
    // 继续与机器人会话交互
    continueRobotMsg(state, robotAccid) {
        state.continueRobotAccid = robotAccid;
    },

    initChatroomInfos(state, obj) {
        state.chatroomInfos = obj;
    },
    setCurrChatroom(state, chatroomId) {
        state.currChatroomId = chatroomId;
        state.currChatroom = state.chatroomInsts[chatroomId];
        state.currChatroomMsgs = [];
        state.currChatroomInfo = {};
        state.currChatroomMembers = [];
    },
    resetCurrChatroom(state) {
        state.currChatroomId = null;
        state.currChatroom = null;
        state.currChatroomMsgs = [];
        state.currChatroomInfo = {};
        state.currChatroomMembers = [];
    },
    // 聊天室相关逻辑
    updateChatroomInfo(state, obj) {
        state.currChatroomInfo = Object.assign(state.currChatroomInfo, obj);
    },
    updateCurrChatroomMsgs(state, obj) {
        const { type, msgs } = Object.assign({}, obj);
        if (type === 'put') {
            msgs.forEach(msg => {
                const chatroomId = msg.chatroomId;
                if (chatroomId === state.currChatroomId) {
                    msgs.forEach(msg => {
                        state.currChatroomMsgs.push(msg);
                    });
                }
            });
        } else if (type === 'concat') {
            // 一般用于历史消息拼接
            const currSessionMsgs = obj.msgs;
            currSessionMsgs.reverse();
            currSessionMsgs.forEach(msg => {
                state.currSessionMsgs.unshift(msg);
            });
            if (obj.msgs[0]) {
                state.currSessionLastMsg = obj.msgs[0];
            }

            // 微前端上线后, Vue.observable(基座应用 store 实例)导致此处更新后, msg-frame.vue 页面(先切到子模块再切回来)没有实时响应, 重新赋值解决
            state.currSessionMsgs = state.currSessionMsgs.slice();
        }
    },
    getChatroomInfo(state, obj) {
        state.currChatroomInfo = obj;
    },
    updateChatroomMembers(state, obj) {
        const { type, members } = obj;
        if (type === 'destroy') {
            state.currChatroomMembers = [];
        } else if (type === 'put') {
            members.forEach(member => {
                if (member.online) {
                    state.currChatroomMembers.push(member);
                }
            });
        }
    },
    // 游客正在输入中
    UpdateVisitorInputStatus(state, status) {
        state.visitorInputStatus = status;
    },
    getInputingVisitorId(state, visitorId) {
        state.inputIngVisitorId = visitorId;
    },
    /**
     * @Date: 2020-04-24 16:14:10
     * @LastEditors: niumkiki
     * @description: 设置访客正在输入的信息和状态
     * @param :
     * @return:
     */
    setVisitorInputContent(state, obj) {
        // 判断是否有对应的访客
        const temp = state.visitorInputInfos.find(item => {
            return item.inputIngVisitorId === obj.visitorId;
        });
        // 如果有对应的访客，设置正在输入的内容
        console.log('setVisitorInputContent', JSON.stringify(temp));
        if (temp) {
            temp.inputingContent = obj.inputContent;
            if (!obj.sendFlag) {
                temp.isInput = obj.id === 103;
            }
        } else {
            let isInput;
            if (obj.sendFlag) {
                isInput = false;
            } else {
                isInput = obj.id === 103;
            }
            state.visitorInputInfos.push({
                inputIngVisitorId: obj.visitorId,
                inputingContent: obj.inputContent,
                isInput: isInput
            });
        }
        state.visitorInputInfos = state.visitorInputInfos.slice();
    },
    setDisableChat(state, obj) {
        Vue.set(state.disableChat, obj.visitorId, obj.flag);
    },
    setFlagToInput(state, flag) {
        state.flagToInput = flag;
    },
    setTranslateShow(state, flag) {
        state.translateShow = flag;
    },
    setIsHidden(state, flag) {
        state.isHidden = flag;
    },
    // 用户轨迹
    setPersonTrackList(state, obj) {
        Vue.set(state.personTrackList, obj.from, obj);
    },

    // 访客订阅
    subscribeEvent(state, account) {
        if (!state.nim) {
            // Message.warning('您尚未上线')
            resetMessage.warning('您尚未上线');
            return;
        }
        if (account) {
            const nim = state.nim;
            nim.subscribeEvent({
                type: 1,
                accounts: account.isArray ? account : [account],
                subscribeTime: 3600 * 24,
                sync: true,
                done: subscribeEventDone
            });

            function subscribeEventDone(error, obj) {
                // console.log('订阅事件' + (!error ? '成功' : '失败'), error, obj)
            }
        }
    },
    // 取消订阅
    unSubscribeEventsByAccounts(state, account) {
        if (!state.nim) {
            // Message.warning('您尚未上线')
            resetMessage.warning('您尚未上线');
            return;
        }
        if (account) {
            const nim = state.nim;
            nim.unSubscribeEventsByAccounts({
                type: 1,
                accounts: account,
                done: unSubscribeEventDone
            });

            function unSubscribeEventDone(error, obj) {
                console.log(`取消订阅事件${!error ? '成功' : '失败'}`, error, JSON.stringify(obj));
            }
        }
    },
    // 更新列表
    updateVisitorSessionList(state, obj) {
        state.chattingList = obj.chattingList;
        state.onlineList = obj.onlineList;
        state.offlineList = obj.offlineList;

        // 更新未读数
        let unreadCount = 0;
        [obj.chattingList, obj.onlineList, obj.offlineList].forEach(listObj => {
            Object.values(listObj).forEach(item => {
                unreadCount += (item.unread || 0);
            });
        });
        store.state.totalChatCount = unreadCount;

        // 检查到"要求强制刷新" + 在当前聊天页面, 则要刷新(在 chat-list 中手动触发左侧会话点击事件 enterChat)
        if (obj.forceUpdate && state.currSessionId && [obj.chattingList, obj.onlineList, obj.offlineList].some(listObj => Object.values(listObj).some(item => item.account === state.currSessionId))) {
            state.refreshCurrSession = !state.refreshCurrSession;
        }
    },
    // 更新访客
    updatePersonList(state, obj) {
        if (!state.personList[obj.account]) {
            state.personList[obj.account] = obj;
        } else {
            for (const p in obj) {
                state.personList[obj.account][p] = obj[p];
            }
        }
    },
    updateCurrTarget(state, obj) {
        state.currSessionId = obj.account;
        state.currVisitorId = obj.visitorId;
        state.currSessionName = obj.nick;
        state.currSign = obj.sign;
        state.currAvatar = obj.avatar;
        // 保存访客的部分信息到 visitorSessionInfo , 在 saveChatMsg 时使用
        if (obj.account) {
            const { nick, visitorId } = obj;
            state.visitorSessionInfo.set(obj.account, { nick, visitorId });
        }
    },
    // 更新当前会话昵称
    updateCurrSessionName(state, nick) {
        state.currSessionName = nick;
    },
    // 更新当前会话头像
    updateCurrAvatar(state, avatar) {
        state.currAvatar = avatar;
    },
    // 从 myVisitorIds (当前客服为最近接待客服且在线的访客 visitorId) 中去掉指定 visitorId
    removeMyVisitorIds(state, arr = []) {
        console.log('removeMyVisitorIds', JSON.stringify(arr));
        state.myVisitorIds = state.myVisitorIds.filter(item => !arr.includes(item));
    },
    // 加入指定 visitorId 到 myVisitorIds (当前客服为最近接待客服且在线的访客 visitorId) 中
    updateMyVisitorIds(state, arr = []) {
        console.log('updateMyVisitorIds', JSON.stringify(arr));
        state.myVisitorIds = [...new Set(state.myVisitorIds.concat(arr))];
    },
    updateChatInfo(state, obj) {
        console.log(JSON.stringify(obj));
        state.browserInfo = obj.browserInfo;
        state.browserIcon = obj.browserIcon;
        state.systemInfo = obj.systemInfo;
        state.systemIcon = obj.systemIcon;
        state.visitorIp = obj.visitorIp;
    },
    updateVisitorInfo(state, obj) {
        console.log('访客基础信息', JSON.stringify(obj));
        state.visitorBaseInfo = obj;
    },
    updataIsChatting(state, obj) {
        state.isChatting[obj.account] = obj.type;
    },
    updateCurrTrackList(state, account) {
        state.currPersonTrackList = state.personTrackList[account];
    },
    sendCustomDing(state, account) {
        if (!state.nim) {
            // Message.warning('您尚未上线')
            resetMessage.warning('您尚未上线');
            return;
        }
        const nim = state.nim;
        let content = { id: 301 };
        // ding一下功能：给游客发自定义消息，弹出提醒框。
        content = JSON.stringify(content);
        nim.sendCustomSysMsg({
            scene: 'p2p',
            to: account,
            content: content,
            cc: false,
            done: sendCustomDingDone
        });

        function sendCustomDingDone(error, msg) {
            console.log(error);
            console.log(JSON.stringify(msg));
            console.log(`发送${msg.scene}自定义系统通知${!error ? '成功' : '失败'}, id=${msg.idClient}`);
        }
    },
    sendCustomService(state, account) {
        console.log('发送flag', JSON.stringify(account), account.flag);
        if (account && account.to) {
            const nim = state.nim;
            let content = { id: account.contentId, serviceName: account.serviceName, flag: account.flag };
            // 给游客发自定义消息，要求发把游客轨迹给我发过来。
            content = JSON.stringify(content);
            nim.sendCustomSysMsg({
                scene: 'p2p',
                to: account.to,
                content: content,
                cc: false,
                done: function(error, msg) {
                    console.log(error);
                    console.log('sendCustomService11111111111111111', JSON.stringify(msg), account.flag);
                }
            });
        }
    },
    /**
     * @Date: 2020-05-11 16:49:46
     * @LastEditors: niumkiki
     * @description: 给访客发送自定义消息,使其订阅该客服
     * @param :
     * @return:
     */
    sendCustomSysMsgForSubscribesLogin(state, obj) {
        // 访客只需要单独订阅一个客服
        console.log('sendCustomSysMsgForSubscribesLogin', obj.account);
        const nim = state.nim;
        nim.sendCustomSysMsg({
            scene: 'p2p',
            to: obj.account,
            cc: false,
            content: JSON.stringify({ id: 101, login: true, OnlyFlag: obj.OnlyFlag }),
            done: function(error, msg) {
                console.log('自定义系统通知成功？');
                console.log(JSON.stringify(msg), error);
            }
        });
    },
    sendCustomSysMsg(state, account) {
        const nim = state.nim;
        let content = { id: 102 };
        // 给游客发自定义消息，要求发把游客轨迹给我发过来。
        content = JSON.stringify(content);
        nim.sendCustomSysMsg({
            scene: 'p2p',
            to: account,
            content: content,
            cc: false,
            done: sendCustomSysMsgDone
        });

        function sendCustomSysMsgDone(error, msg) {
            error && console.error(error);
            console.log(`发送${msg.scene}自定义系统通知${!error ? '成功' : '失败'}, id=${msg.idClient}`);
        }
    },
    updateAllVisitorType(state, obj) {
        state.AllVisitorType = obj;
    },
    updateCurrVisitorType(state, data) {
        state.CurrVisitorType = data.id;
    },
    updateChatViewStatus(state, status) {
        state.chatView = status;
    },
    updateModel(state, status) {
        state.clueModal = status;
    },
    updateTransfer(state, obj = false) {
        if (typeof obj === 'object') {
            state.transferInfo = obj;
            state.chatTransfer = true;
        } else {
            state.chatTransfer = obj;
        }
    },
    updateChatWithOtherList(state, obj) {
        state.isChatWithOther[obj.account] = obj.status;
    },
    confirmNotChatWithOther(state, status) {
        state.notChatWithOther = status;
    },
    // 退出账号重置聊天相关的缓存
    resetChat(state) {
        console.log('reset chat');
        /**
         * @Description: 弱网/无网环境下(测试:王志民 可重现, 我自己未重现), 云信 disconnect 失败, 会一直调用 testAnalytics 等接口请求, 造成卡顿
         * 改为 nim.destroy 直接清除 nim 实例, 并将 disconnect 内部相关逻辑移过来
         * @author 汤一飞
         * @date 2022/8/10
         */
        // if (state.nim) {
        //     state.nim.disconnect();
        // }
        state.SDKCallbackState = 'disconnect';
        store.dispatch('testAnalytics', {
            eventName: 'on disconnect',
            type: '55',
            from: '',
            to: '',
            remark: JSON.stringify('reset chat')
        });
        if (state.nim) {
            state.nim.destroy({
                done: function(err) {
                    console.log('清除实例err', err);
                    state.nim = null;
                }
            });
        }
        state.isSwitchChatState = '';
        state.totalChatCount = 0;
        state.userUID = null;
        /**
         * @Date: 2020-06-11 19:37:07
         * @LastEditors: niumkiki
         * @description: 下线时直接清空订阅
         * @param :
         * @return:
         */
        state.personSubscribes = {};
        state.currSessionId = '';
        state.currVisitorId = '';
        state.currSessionName = '';
        state.currSign = '';
        state.currAvatar = '';
        state.chattingList = [];
        state.onlineList = [];
        state.offlineList = [];
        state.startFlagArr = [];
        // 清空 myVisitorIds (当前客服为最近接待客服且在线的访客 visitorId)
        state.myVisitorIds = [];
        // 清空 disableChat
        state.disableChat = {};
        // 清空草稿
        state.msgDraft = {};
        // 清空正在聊天列表
        state.isChatting = {};
        // 清空 saveChatMsg 要用到的数据集
        state.visitorSessionInfo = new Map();
    },
    updateCurrInterface(state, value) {
        state.currInterface = value;
    },
    updateIsFirstInitSDK(state, status) {
        state.isFirstInitSDK = status;
    },
    // Main.vue 监控 window.onresize 时调用
    set_window_height(state, value) {
        state.window_height = parseInt(value) || 0;
    },
    set_window_width(state, value) {
        state.window_width = parseInt(value) || 0;
    },


    set_crm_drawer_show(state, value) {
        state.crm_drawer_show = value;
    },
    set_clue_short_info(state, value) {
        console.log('改变数据clue', value);
        state.clue_short_info = value;
    },
    set_clue_drawer_show(state, value) {
        state.clue_drawer_show = value;
    },
    set_leads_drawer_show(state, value) {
        state.leads_drawer_show = value;
    },
    set_product_drawer_show(state, value) {
        state.product_drawer_show = value;
    },
    set_visitor_drawer_show(state, value) {
        state.visitor_drawer_show = value;
    },
    set_adsSet_drawer_show(state, value) {
        state.adsSet_drawer_show = value;
    },
    isShowBlackModal(state, flag) {
        state.isShowAddBlackModal = flag;
    },
    // 设置BIpath和url的对应关系
    set_BI_urlList(state, value) {
        state.bi_report_menu = value;
    },

    // 更新在线客服列表
    setServiceList(state, value) {
        state.serviceList = Array.isArray(value) ? value : [];
    },

    setIsFullScreenImgShow(state, value) {
        state.isFullscreenImgShow = value;
    },

    // 控制文件预览组件显示的阈值
    showFilePreview(state, value) {
        state.showFilePreview = value;
    },
    // 文件预览：预览的第一个文件的id
    firstFileId(state, value) {
        state.firstFileId = value;
    },
    // 文件预览：文件储存的文件夹: 1个人文件、2公司文件、3共享文件
    fileStorageFolder(state, value) {
        state.fileStorageFolder = value;
    },
    // 组件分享后,调用一次页面的方法
    afterShare(state, value) {
        state.afterShare = value;
    },
    // 文件预览：文件预览的文件列表
    dataBaseFileList(state, value) {
        state.dataBaseFileList = value;
    },
    // 文件预览：当前的文件夹(person/company)
    currentFolderLabel(state, value) {
        state.currentFolderLabel = value;
    },

    setHomeName(state, value) {
        state.homeName = value;
    },

    setIsNoticeNewVisitor(state, value) {
        state.isNoticeNewVisitor = value;
    },

    setNotChattingWithUnreadCollect(state, value) {
        state.notChattingWithUnreadCollect = value;
    },

    setFacebookSplitShowList(state, value) {
        state.FacebookSplitShowList = value;
    },
    setIsAllowToOffLine(state, value) {
        state.isAllowToOffLine = value;
    },
    setFollowUpFile(state, value) {
        state.followUpFile = value;
    },
    updateCurrVisitorId(state, value) {
        state.currVisitorId = value;
    },
    setAutoLogoutChat(state, value) {
        state.autoLogoutChat = value;
    },

    // 调用健康检查接口获取到的访问速度最快的 wa url
    checkHealthWAUrl(state, resolveFunc) {
        // 香港线路 fkchat/hkend01/wa01 , 杭州线路 fkchat01/hkend02/wa02 , cdn线路 wa03 ,每个线路请求一次接口即可, 此处选择请求 wa01, wa02, wa03
        let urlList = [
            'https://txwa01test.leadscloud.com/whatsapp/status/health',
            'https://txwa02test.leadscloud.com/whatsapp/status/health',
            'https://txwa03test.leadscloud.com/whatsapp/status/health'
        ];
        promiseAnyPolyfill(urlList, res => {
            // 取最快返回的请求地址
            try {
                state.healthWAUrl = (new URL(res.config.url)).origin;
                // 如果此时没有 FB 健康检查 url
                if (!state.healthFBUrl) {
                    // 如果不是 cdn 线路最快(fb url 没有 cdn 线路)
                    if (!state.healthWAUrl.includes('wa03')) {
                        // 则将 wa url 健康检查结果同步给 fb url (走相同的线路)
                        state.healthFBUrl = state.healthWAUrl.replace('wa0', 'hkend0');
                    }
                }
            } catch (e) {
                // 返回有误, 恢复默认请求路径
                state.healthWAUrl = '';
            }

            // 如果外部传入了 resolve 函数
            if (resolveFunc) {
                // 如果 fb url 已经请求完毕有值, 则 resolve 让外部不再等待
                if (state.healthFBUrl) {
                    resolveFunc();
                }
            }
        }, err => {
            // 请求出错, 恢复默认请求路径
            state.healthWAUrl = '';

            // 如果外部传入了 resolve 函数
            if (resolveFunc) {
                // 如果 fb url 已经请求完毕有值, 则 resolve 让外部不再等待
                if (state.healthFBUrl) {
                    resolveFunc();
                }
            }
        });
    },

    // 调用健康检查接口获取到的访问速度最快的 facebook url
    checkHealthFBUrl(state, resolveFunc) {
        // 香港线路 fkchat/hkend01/wa01 , 杭州线路 fkchat01/hkend02/wa02 , 每个线路请求一次接口即可, 此处选择请求 hkend01, hkend02
        let urlList = [
            'https://txhkend01test.leadscloud.com/visitor-chat/actuator/info',
            'https://txhkend02test.leadscloud.com/visitor-chat/actuator/info'
        ];
        promiseAnyPolyfill(urlList, res => {
            // 否则, 取最快返回的请求地址
            try {
                // 健康检查完毕, 得到最快的 FB url
                state.healthFBUrl = (new URL(res.config.url)).origin;

                // 如果此时没有 wa 健康检查 url
                if (!state.healthWAUrl) {
                    // 将 fb url 健康检查结果同步给 wa url (走相同的线路), 让 wa url 先有值(可能它之后会有更好的, 但现在先给个能用的)
                    state.healthWAUrl = state.healthFBUrl.replace('hkend0', 'wa0');
                }
            } catch (e) {
                // 返回有误, 恢复默认请求路径
                state.healthFBUrl = '';
            }

            // 如果外部传入了 resolve 函数
            if (resolveFunc) {
                // 如果 wa url 已经请求完毕有值, 则 resolve 让外部不再等待
                if (state.healthWAUrl) {
                    resolveFunc();
                }
            }
        }, err => {
            // 请求出错, 恢复默认请求路径
            state.healthFBUrl = '';

            // 如果外部传入了 resolve 函数
            if (resolveFunc) {
                // 如果 wa url 已经请求完毕有值, 则 resolve 让外部不再等待
                if (state.healthWAUrl) {
                    resolveFunc();
                }
            }
        });
    },

    // 更新 FB 会话话术信息
    updateChatVerbalInfo(state, data) {
        state.chatVerbalInfo = Array.isArray(data) ? data : [];
    },

    // 设置询盘云版本(正常版, wa 个人版之类的)
    setVersion(state, data) {
        state.version = data;
    },
    // 设置自动翻译 发信翻译开关状态
    setautoTranslateStatusRecive(state, val) {
        state.autoTranslateStatusRecive = val;
    },
    // 设置自动翻译 目标语种
    setautoTranslatetargetLang(state, val) {
        state.autoTranslatetargetLang = val;
    },
    // 设置自动翻译 不需要翻译的语种
    setautoTranslateNoTArr(state, val) {
        state.autoTranslateNoTArr = val;
    },
    // 设置自动翻译不发送开关状态
    setautoTranslateStatusSend(state, val) {
        state.autoTranslateStatusSend = val;
    },
    // 设置不允许翻译状态
    setisInNotNeeDTranslateArr(state, val) {
        state.isInNotNeeDTranslateArr = val;
    },
    // 设置剩余字符数
    setautoTranslateCharactCount(state, val) {
        state.autoTranslateCharactCount = val;
    },
    // 主应用路有跳转时, 存储跳转信息
    setJumpingRouterInfo(state, data) {
        state.jumpingRouterInfo = data;
    },
    // update ai tool bar config
    updateToolbarTriggerConfig(state, data) {
        state.aiToolBar = data;
    },
    setCommentVerbalInfo(state, data) {
        state.commentVerbalInfo = data;
    },
    setCommentSecondVerbalInfo(state, data) {
        state.commentSecondVerbalInfo = data;
    }
};
