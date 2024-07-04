import store from '../';
import { formatUserInfo } from './userInfo';
import util from '@/libs/util';
import i18n from '@/locale';
import { Notification } from 'element-ui';
import { getVisitorId } from './sysMsgs';
import dynamicDatas from '@/utils/dynamicDatas';

export function resetSearchResult({ state, commit }) {
    commit('updateSearchlist', {
        type: 'user',
        list: []
    });
    commit('updateSearchlist', {
        type: 'team',
        list: []
    });
}

// 获取用户资料数组
export function searchUsers({ state, commit }, obj) {
    let { accounts, done } = obj;
    const nim = state.nim;
    if (!Array.isArray(accounts)) {
        accounts = [accounts];
    }
    nim.getUsers({
        accounts,
        done: function searchUsersDone(error, users) {
            if (error) {
                alert(error);
                return;
            }
            commit('updateSearchlist', {
                type: 'user',
                list: users
            });
            let updateUsers = users.filter(item => {
                const account = item.account;
                if (item.account === state.userUID) {
                    return false;
                }
                const userInfo = state.userInfos[account] || {};
                if (userInfo.isFriend) {
                    return false;
                }
                return true;
            });
            updateUsers = updateUsers.map(item => {
                return formatUserInfo(item);
            });
            commit('updateUserInfo', updateUsers);
            if (done instanceof Function) {
                done(users);
            }
        }
    });
}

// 获取用户资料
// export function getUser({ state, commit }, obj) {
//     // 获取访客 AccId
//     let account;
//     if (obj.type === 1) {
//         account = obj.msgEvent.account;
//     } else {
//         account = obj.msgEvent;
//     }
//
//     // 批量 getUser 循环结束 flag
//     const isLoopDone = obj.isLoopDone;
//     // 通过云信获取用户信息
//     state.nim.getUser({
//         account: account,
//         sync: true,
//         done: getUserDone
//     });
//
//     // 获取用户信息完成回调
//     function getUserDone(error, user) {
//         console.log(error);
//         console.log(JSON.stringify(user));
//         console.log(`获取用户资料${!error ? '成功' : '失败'}`);
//
//         if (!error) {
//             // 获取用户信息成功
//             // 更新用户资料
//             commit('updatePersonList', user);
//             console.log(`obj.type= ${obj.type}`);
//
//             // obj.type = 1 收到的订阅通知事件，0 只是获取用户资料
//             if (obj.type === 1) {
//                 // 收到访客在线状态变更通知后, 判断变更时间是否在一分钟内, 超过一分钟的就不弹出新访客通知
//                 // pushNotice 中, 还有其他处理 --- 记录"上次弹出通知时间"到 vuex 中, 五分钟之内重复调用此 pushNotice 则不弹出通知
//                 try {
//                     // 离线不提示
//                     if (obj.msgEvent.value !== '3') {
//                         const timeStamp = Number(obj.msgEvent.time);
//                         if (Math.abs(timeStamp - Date.now()) < 60 * 1000) {
//                             store.dispatch('pushNotice', {
//                                 user: user,
//                                 data: obj.msgEvent
//                             });
//                         }
//                     }
//                 } catch (e) {
//                     console.error(e);
//                 }
//                 store.dispatch('updatePersonSubscribes', obj.msgEvent);
//             }
//
//             // 通过询盘云请求访客名称和备注, 避免因为 accId 被重新分配导致从云信获取的数据和询盘云存储的数据不一致
//             // 获取 visitorId
//             const visitorId = getVisitorId(account);
//             if (visitorId) {
//                 // 根据 visitorId 请求询盘云用户资料, 更新用户资料
//                 util.ajaxInternationalJson({
//                     url: '/piwikRead/visitorInfo/getVisitorInfo',
//                     method: 'GET',
//                     params: {
//                         visitorId
//                     }
//                 }).then(({ data }) => {
//                     if (data.code === '1' && data.data) {
//                         // 更新用户昵称和备注
//                         if (state.personList[account]) {
//                             commit('updatePersonList', {
//                                 account,
//                                 nick: data.data.visitorName,
//                                 sign: data.data.remark
//                             });
//                         }
//                     }
//
//                     // 循环结束判断
//                     onLoopDone();
//                 }).catch(error => {
//                     console.error('根据 visitorId 更新用户资料失败');
//
//                     // 循环结束判断
//                     onLoopDone();
//                 });
//             } else {
//                 // 循环结束判断
//                 onLoopDone();
//             }
//         } else {
//             // 获取用户信息失败
//             console.log('onSDKCallbackError');
//             // 提示用户网络连接失败
//             if (error.code === 'Error_Connection_Socket_State_not_Match') {
//                 Notification.error({
//                     title: i18n.t('chat.chatError'),
//                     message: i18n.t('chat.YX_error_code.Error_Connection_Socket_State_not_Match')
//                 });
//             }
//
//             // 循环结束判断
//             onLoopDone();
//         }
//
//         // 如果是在循环中来请求信息就等循环到最后一项时再去更新列表
//         function onLoopDone() {
//             if (obj.type !== 1) {
//                 if (isLoopDone) {
//                     store.dispatch('updateSessionList');
//                 }
//             }
//         }
//     }
// }

// 去云信 批量获取用户资料
export function getUsers({ state, commit }, dataObj) {
    console.error('云信 getUsers', dataObj);

    // 通过云信获取用户信息
    // 云信 API 文档里写的单次最多 150 个, 所以分片处理
    // 云信 API 文档链接: https://doc.yunxin.163.com/TM5MzM5Njk/docs/DA5ODQxMjY?platform=web#%E8%8E%B7%E5%8F%96%E7%94%A8%E6%88%B7%E8%B5%84%E6%96%99%E6%95%B0%E7%BB%84
    dynamicDatas.chunkArr(dataObj.accountList, 150).forEach(accounts => {
        state.nim.getUsers({
            accounts: accounts,
            sync: true,
            done: getUsersDone
        });
    });
    // 获取用户信息完成回调
    function getUsersDone(error, users) {
        if (!error) {
            // 暂存云信 accid 列表
            const accountList = [];
            // 先更新基础的用户资料, 之后请求完询盘云接口继续追加信息
            users.forEach(user => {
                accountList.push(user.account);

                // 更新用户资料
                commit('updatePersonList', user);
            });

            // 从询盘那样获取 visitorId , 访客名称, 备注; 以更新用户资料
            util.ajaxInternationalJson({
                url: '/visitor-chat/visitortrace/getVisitorIdInfo',
                method: 'POST',
                data: accountList
            }).then(({ data }) => {
                if (data.code === '1' && Array.isArray(data.data)) {
                    // 更新用户 visitorId , 昵称, 备注
                    data.data.forEach(item => {
                        if (state.personList[item.accId]) {
                            commit('updatePersonList', {
                                account: item.accId,
                                visitorId: item.visitorId,
                                nick: item.visitorName,
                                sign: item.remark
                            });
                        }
                    });

                    if (dataObj.type === 'onpushevents') {
                        // 如果从"收到订阅通知事件"过来的
                        if (Array.isArray(dataObj.msgEventList)) {
                            dataObj.msgEventList.forEach(msgEvent => {
                                const user = users.find(item => item.account === msgEvent.account);
                                if (user) {
                                    // 收到访客在线状态变更通知后, 判断变更时间是否在一分钟内, 超过一分钟的就不弹出新访客通知
                                    // pushNotice 中, 还有其他处理 --- 记录"上次弹出通知时间"到 vuex 中, 五分钟之内重复调用此 pushNotice 则不弹出通知
                                    // 离线不提示
                                    if (msgEvent.value !== '3') {
                                        const timeStamp = Number(msgEvent.time);
                                        if (Math.abs(timeStamp - Date.now()) < 60 * 1000) {
                                            store.dispatch('pushNotice', {
                                                user: user,
                                                data: msgEvent
                                            });
                                        }
                                    }
                                    store.dispatch('updatePersonSubscribes', msgEvent);
                                }
                            });
                        }
                    } else {
                        // 非订阅事件过来的, 直接走 updateSessionList (上面通过 updatePersonSubscribes 走了这个)
                        store.dispatch('updateSessionList');
                    }
                } else {
                    console.error('获取 visitorId 等数据, 接口返回有误');
                    // 保存错误日志
                    saveErrLog({
                        type: 'nim.getUsers',
                        data: { resData: data },
                        message: '云信 getUsers 后, 询盘云请求对应 visitorId , 返回数据有误'
                    });
                }
            }).catch(error => {
                console.error('根据 visitorId 更新用户资料失败');
                // 保存错误日志
                saveErrLog({
                    type: 'nim.getUsers',
                    data: { error },
                    message: '云信 getUsers 后, 询盘云请求对应 visitorId , 请求失败 或 请求成功但中间处理过程报错'
                });
            });
        } else {
            // 获取用户信息失败
            console.error('批量获取用户信息失败');
            console.error(error);

            // 提示用户网络连接失败
            if (error.code === 'Error_Connection_Socket_State_not_Match') {
                Notification.error({
                    title: i18n.t('chat.chatError'),
                    message: i18n.t('chat.YX_error_code.Error_Connection_Socket_State_not_Match')
                });
            } else {
                // 保存错误日志
                saveErrLog({
                    type: 'nim.getUsers',
                    data: { error },
                    message: '云信 getUsers 返回错误'
                });
            }
        }
    }

    // 保存错误日志
    function saveErrLog(data) {
        console.error(data);
        util.ajaxFK({
            url: '/piwik/log/webSiteLog',
            method: 'get',
            params: data
        });
    }
}
