/*
 * SDK连接相关
 */

import Cookies from 'js-cookie';
import config from '@/configs';

import store from '../';
import i18n from '@/locale';
import { onFriends, onSyncFriendAction } from './friends';
import { onBlacklist, onMarkInBlacklist } from './blacks';
import { onMyInfo, onUserInfo } from './userInfo';
import { onSessions, onUpdateSession } from './session';
import { onRoamingMsgs, onOfflineMsgs, onMsg } from './msgs';
import { onSysMsgs, onSysMsg, onSysMsgUnread, onCustomSysMsgs, onPushEvents } from './sysMsgs';
import { Message, Notification } from 'element-ui';


// 重新初始化 NIM SDK
export function initNimSDK({ state, commit, dispatch }, SDK) {
    if (state.nim) {
        return;
    }
    if (!Cookies.get('yxToken')) {
        Message.warning(i18n.t('login_failed'));
        return;
    }
    const ACCID = Cookies.get('accId');
    state.person[ACCID] = true;
    let onSilentlyKickDisconnectCount = 0;
    state.isSDKconnect = true;
    state.isFirstInitSDK = true;
    // 初始化SDK
    state.nim = SDK.NIM.getInstance({
        debug: true && { api: 'info', style: 'font-size:12px;color:blue;background-color:rgba(0,0,0,0.1)' },
        appKey: config.appkey,
        account: ACCID,
        token: Cookies.get('yxToken'),
        db: false,
        syncSessionUnread: true,
        syncRobots: true,
        autoMarkRead: true, // 默认为true
        onconnect: function onConnect(event) {
            Notification.closeAll();
            state.SDKCallbackState = 'connect';
            Notification.success({
                title: i18n.t('chat.success_loginChat'),
                message: ''
            });
            // Notification.close('error');
            // Notification.close('willreconnect');
            // Notification.close('disconnect');
            // Notification.close('silentlyKickservice');
            dispatch('testAnalytics', {
                eventName: 'service_onConnect',
                type: '',
                from: ACCID,
                to: '',
                remark: '客服账号连接成功'
            });
            console.log('登录聊天成功！');
        },
        onerror: function onError(event) {
            dispatch('testAnalytics', {
                eventName: 'chat on error',
                type: '51',
                from: '',
                to: '',
                remark: JSON.stringify(event)
            });
            Notification.error({
                title: i18n.t('chat.chatError'),
                message: i18n.t('chat.networkError')
            });
            console.log('on error', event);
        },
        onwillreconnect: function onWillReconnect() {
            // Notification.close('willreconnect');
            Notification.warning({
                title: i18n.t('chat.chatError'),
                message: i18n.t('chat.reconnectLater')
            });
        },
        ondisconnect: function onDisconnect(error) {
            console.log('ondisconnect error', error);
            state.SDKCallbackState = 'disconnect';
            dispatch('testAnalytics', {
                eventName: 'on disconnect',
                type: '55',
                from: '',
                to: '',
                remark: JSON.stringify(error)
            });
            if (error) {
                if (error.code === 'logout') {
                    // 清除 nim 实例
                    if (state.nim) {
                        state.nim.destroy({
                            done: function(err) {
                                console.log('清除实例err', err);
                                state.nim = null;
                            }
                        });
                    }
                    Notification.success({
                        title: i18n.t('chat.success_logoutChat'),
                        message: ''
                    });
                } else {
                    if (error.reason === 'silentlyKick') {
                        onSilentlyKickDisconnectCount++;
                        dispatch('testAnalytics', {
                            eventName: 'silentlyKickservice',
                            type: '51',
                            from: '',
                            to: '',
                            remark: '客服端悄悄被踢'
                        });
                        if (onSilentlyKickDisconnectCount < 5) {
                            if (state.nim) {
                                state.nim.connect();
                            }
                        } else {
                            dispatch('testAnalytics', {
                                eventName: 'silentlyKickservice',
                                type: '52',
                                from: '',
                                to: '',
                                remark: '客服端悄悄被踢5次'
                            });
                            // Notification.close('silentlyKickservice');
                            Notification.warning({
                                title: i18n.t('chat.chatError'),
                                message: i18n.t('chat_tip')
                            });
                        }
                    } else {
                        // 因为destroy清除实例之后会触发disconnect，判断一下避免出错
                        if (state.nim) {
                            state.nim.connect();
                        }
                    }
                }
            } else {
                if (state.nim) {
                    state.nim.connect();
                }
                // Message.info(i18n.t('Dropped'))
            }
        },
        // 多端登录
        onloginportschange: function onLoginPortsChange(loginPorts) {
            console.error('当前登录帐号在其它端的状态发生改变了', loginPorts);

            // 遍历所有云信连接
            for (let i = 0; i < loginPorts.length; i++) {
                // 原来有个小程序端(现在此端已废弃), 当时使用 os 来判断是否是小程序
                // if (loginPorts[i].os.match(/object/)) {
                //     // 试了下, 小程序的 os 是 "[object Object]"

                if (['iOS', 'Android'].includes(loginPorts[i].type)) {
                    // 移动端上下线

                    if (loginPorts[i].online) {
                        // 如果当前遍历连接是登录状态

                        // 获取当前标签页所在 pc 端的聊天开启时间戳 || 1
                        const T = localStorage.getItem('chatStampList').split('n')[1] || 1;

                        if (loginPorts[i].time >= Number(T)) {
                            // 并且登录时间大于等于当前标签页所在 pc 端的时间戳(晚于 pc 端开启)

                            // 提示"当前登录帐号在其它端登录"
                            Notification.info({
                                title: i18n.t('chat.chatReminder'),
                                duration: 3000,
                                message: i18n.t('chat.loginAtOtherEnd')
                            });

                            /**
                             * @Description: LoginPorts 变更改为不直接调用下线接口下线, 而是通过"更新客服列表"触发状态同步, 因此它不会直接调用下线接口, 保险起见通过其他方式触发直接调用下线接口
                             * (试了下, 其实"更新客服列表"后状态确实是最新的, 不用直接调接口, 说明后端是做了互踢的, 但保险起见还是直接调用下)
                             * @author 汤一飞
                             * @date 2023/4/10
                             */
                            // // LoginPorts 置为 false , 触发 personal-dropdown.vue 对它的监听, 使当前 pc 页面退出登录(如果是登录状态)
                            // state.LoginPorts = false;
                            state.isSwitchChatState = 'APP Login';

                            // 退出 for 循环
                            // ? 不继续遍历了? 其他端不踢了?
                            break;
                        } else {
                            // 如果登录时间小于当前标签页所在 pc 端的时间戳(早于 pc 端开启)

                            // 踢掉当前遍历连接不是登录状态的连接
                            state.nim.kick({
                                deviceIds: [loginPorts[i].deviceId],
                                done: function (error, obj) {
                                    console.log(`踢其它端${!error ? '成功' : '失败'}`);
                                    console.log(error);
                                    console.log(obj);
                                }
                            });
                        }
                    }
                } else {
                    // 非移动端上下线

                    // // 非小程序端, 试了下我的电脑开聊天开多标签页, 是"Windows 10 64-bit"

                    if (!loginPorts[i].online && state.isAllowToOffLine) {
                        // 如果其他标签页下线 + 不是因为'其他标签页关闭'导致的的下线(这种情况会把 isAllowToOffLine 置为 false)

                        // LoginPorts 置为 false , 触发 personal-dropdown.vue 对它的监听, 使当前 pc 页面退出登录(如果是登录状态)
                        state.LoginPorts = false;

                        // ? 好像没啥作用啊
                        state.isSwitchChatState = false;
                    }
                }
            }
        },
        // 用户关系及好友关系
        onblacklist: onBlacklist,
        onsyncmarkinblacklist: onMarkInBlacklist,

        onfriends: onFriends,
        onsyncfriendaction: onSyncFriendAction,

        // 用户名片 - actions/userInfo
        onmyinfo: onMyInfo,
        onupdatemyinfo: onMyInfo,
        onusers: onUserInfo,
        onupdateuser: onUserInfo,

        // // 会话
        onsessions: onSessions,
        onupdatesession: onUpdateSession,
        // // 消息
        // 同步会话未读数
        // syncSessionUnread: true,
        onroamingmsgs: onRoamingMsgs,
        onofflinemsgs: onOfflineMsgs,
        onmsg: onMsg,
        // // 系统通知
        onsysmsg: onSysMsg,
        onofflinesysmsgs: onSysMsgs,
        onupdatesysmsg: onSysMsg, // 通过、拒绝好友申请会收到此回调

        onsysmsgunread: onSysMsgUnread,
        onupdatesysmsgunread: onSysMsgUnread,

        // onofflinecustomsysmsgs: onOfflineCustomSysMsgs,
        oncustomsysmsg: onCustomSysMsgs,
        // 监听订阅事件列表

        onpushevents: onPushEvents,
        // // 同步完成
        onsyncdone: function onSyncDone() {
            // dispatch('hideLoading')
            // 关闭loading
            state.isSDKconnect = false;
            console.log(store.state.currSessionId);
            if (store.state.currSessionId) {
                dispatch('setCurrSession', store.state.currSessionId);
            }
        }
    });
}
