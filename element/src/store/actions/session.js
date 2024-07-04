/*
 * 会话列表
 */

import store from '../';
import util from '../../libs/util';


// 如果会话对象不是好友，需要更新好友名片
function updateSessionAccount(sessions) {
    let accountsNeedSearch = [];
    sessions.forEach(item => {
        if (item.scene === 'p2p') {
            // 如果不存在缓存资料
            if (!store.state.userInfos[item.to]) {
                accountsNeedSearch.push(item.to);
            }
        }
    });
    console.log('// 如果会话对象不是好友，需要更新好友名片');
    console.log(accountsNeedSearch);
    if (accountsNeedSearch.length > 0) {
        store.dispatch('searchUsers', {
            accounts: accountsNeedSearch
        });
    }
}

// onSessions只在实例第一次初始化完成后回调
export function onSessions(sessions) {
    console.log('init sessions');
    console.log(sessions);
    // updateSessionAccount(sessions)
    // 解决访客一直在线的bug
    // 如果是onSessions，则说明是初始化聊天，需要拿到会话访客的最近到达时间，如果不是当天就不去订阅该访客
    // 但是这样也还是有问题，不能解决是当天到达但是已经离开却还一直在线的bug
    let ids = [];
    let acct_ids = [];
    ids = sessions.map(item => {
        return item.to;
    });
    console.log('ids', ids);
    /**
     * @Description: 【ID1006956】访客聊过天后，一直没退出网页（超过24h），之后该访客二次聊天，客服这边只要刷新页面或者发生跳转，在线列表里就没有这个访客
     * @author 汤一飞
     * @date 2020/7/20
    */
    // 筛选出会话最后一条消息在最近 8 小时(和获取访客最近到达时间后进行的时间判断条件相同)内的访客 id
    const recentIds = sessions.filter(item => {
        if (item.lastMsg && item.lastMsg.time) {
            return timeInterval(item.lastMsg.time);
        }
    }).map(item => item.to);


    // 根据acct_idd获取最近到达时间
    util.ajaxInternational({
        url: '/visitor-chat/server/getVisitorLeaveStatusByAcctIds',
        method: 'post',
        data: {
            acctIds: ids.join(',')
        }
    }).then(response => {
        let unSubscribeAccounts = [];
        if (response.data.code === '1') {
            let arr = response.data.data;
            arr.map(item => {
                // 会话最后一条消息在 8 小时以内, 或访客最近到达时间在 8 小时以内, 则订阅, 否则取消订阅
                if (recentIds.includes(item.acct_id) || timeInterval(item.last_arrived_time)) {
                    acct_ids.push(item.acct_id);
                } else {
                    unSubscribeAccounts.push(item.acct_id);
                }

                // 顺手更新用户 visitorId --- visitorId 改为从后端取之后, 一般是在 getUsers 里请求接口获取, 但此接口既然返回了, 也顺便更新下
                if (store.state.personList[item.acct_id]) {
                    store.commit('updatePersonList', {
                        account: item.acct_id,
                        visitorId: item.visitor_id
                    });
                }
            });
        }
        // 取消订阅事件
        if (unSubscribeAccounts.length > 0) {
            store.commit('unSubscribeEventsByAccounts', unSubscribeAccounts);
        }
        console.log('acct_ids', acct_ids);
        if (acct_ids.length > 0) {
            sessions = sessions.filter(item => acct_ids.includes(item.to));
            store.commit('updateSessions', sessions);
        }
    });
    // store.commit('updateSessions', sessions)
}

export function onUpdateSession(session) {
    let sessions = [session];
    // updateSessionAccount(sessions)
    store.commit('updateSessions', sessions);
}

export function deleteSession({state, commit}, sessionId) {
    const nim = state.nim;
    sessionId = sessionId || '';
    let scene = null;
    let account = null;
    if (/^p2p-/.test(sessionId)) {
        scene = 'p2p';
        account = sessionId.replace(/^p2p-/, '');
    } else if (/^team-/.test(sessionId)) {
        scene = 'team';
        account = sessionId.replace(/^team-/, '');
    }
    if (account && scene) {
        nim.deleteSession({
            scene,
            to: account,
            done: function deleteServerSessionDone(error, obj) {
                if (error) {
                    alert(error);
                    return;
                }
                nim.deleteLocalSession({
                    id: sessionId,
                    done: function deleteLocalSessionDone(error, obj) {
                        if (error) {
                            alert(error);
                            return;
                        }
                        commit('deleteSessions', [sessionId]);
                    }
                });
            }
        });
    }
}

export function setCurrSession({state, commit, dispatch}, sessionId) {
    console.log(sessionId);
    const nim = state.nim;
    if (sessionId) {
        commit('updateCurrSessionId', {
            type: 'init',
            sessionId
        });
        if (nim) {
            // 如果在聊天页面刷新，此时还没有nim实例，需要在onSessions里同步
            console.log('updateCurrSessionMsgs');
            // 设置当前会话，当前会话未读数会被置为0，同时开发者会收到 onupdatesession回调
            let account = `p2p-${sessionId}`;
            nim.setCurrSession(account);
            /* 如果还没有和访客聊天，nim.setCurrSession(account)就没法更新这个访客的信息，所以自己去更新一下信息 */
            let isNotInSessionList = state.sessionlist.every(item => {
                return item.id !== account;
            });
            if (isNotInSessionList) {
                // store.dispatch('getUser', {
                //     msgEvent: sessionId,
                //     type: 0,
                //     isLoopDone: true
                // });

                store.dispatch('getUsers', {
                    accountList: [sessionId]
                });
            }
            // dispatch('updateSessionList')
            commit('updateCurrSessionMsgs', {
                type: 'init',
                sessionId
            });
            // 发送已读回执
            dispatch('sendMsgReceipt');
        }
    }
}

export function resetCurrSession({state, commit}) {
    const nim = state.nim;
    nim.resetCurrSession();
    commit('updateCurrSessionMsgs', {
        type: 'destroy'
    });
}

function timeInterval(time) {
    let nowDate = new Date(time).getTime();
    let check = new Date().getTime();
    if (nowDate >= check - 1000 * 60 * 60 * 8) {
        return true;
    } else {
        return false;
    }
}
