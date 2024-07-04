/**
 * @Description: 统一管理 websocket
 * @author 汤一飞
 * @date 2021/4/23
 */
import util from '@/libs/util';
import i18n from '@/locale';
import { isObjJSON } from '@/utils/dynamicDatas';
// import { env } from '../../../build/config';
import URLs from '../../../build/url';
import { getOpenedWindowList } from '@/utils/storage';
import store from '../index';
import { Message, Notification } from 'element-ui';
const origin = location.origin;
const testWC = ['http://localhost:8080', 'https://test-crm.leadscloud.com', 'https://qa-crm.leadscloud.com'];
// import { CHILDSTORE } from '@/micros/CHILDSTORE.js';
export default {
    state: {
        // 接受 ws 消息 url
        wsBaseUrl: testWC.includes(origin) ? URLs.wss_dev_url : URLs.wss_prod_url, // env === 'production' ? URLs.wss_prod_url : URLs.wss_dev_url,
        // 发送 ws 消息 url
        wsSendUrl: testWC.includes(origin) ? URLs.wss_dev_send_url : URLs.wss_prod_send_url, // env === 'production' ? URLs.wss_prod_send_url : URLs.wss_dev_send_url,
        // 设置 ws 消息已读 url
        wsUpdateUrl: testWC.includes(origin) ? URLs.wss_prod_update : URLs.wss_dev_update, // env === 'development' ? URLs.wss_dev_update : URLs.wss_prod_update,
        // 获取历史未被推送 ws 消息 url
        wsBaseUrl_history: testWC.includes(origin) ? URLs.wss_dev_history : URLs.wss_prod_history, // env === 'production' ? URLs.wss_prod_history : URLs.wss_dev_history,

        // ws 实例
        WS: null,

        // ws 断开后是否重连
        wsNeedReconnect: true,
        // ws 是否重连中
        wsReconnecting: false,
        // 是否是初次连接 ws , 而不是重连
        isFirstConnect: true,

        // 存储当前 ws 打开时的时间戳
        websocketTimeStamp: 0,

        /**
         * @Description: 延时秒数从 2 分钟变为 30 秒
         * 发现后台在每隔一分钟调用发给前端一次"ping"字符串, 前端现在要在心跳计时器里给后台发一些数据, 如果心跳秒数少于 1 分钟, 计时器有可能永远无法触发, 无法发给后端数据
         * ps: ws 初次链接时已经发了一次数据了, 跟后台说了, 但后台还是想把 ping 改成发数据, 所以还是这么修改了
         * @author 汤一飞
         * @date 2022/6/17
         */
        // 心跳重连: 延时秒数
        timeout: 30000,
        // 心跳重连: 前端发送 ping 消息计时器
        timeoutObj: null,
        // 心跳: 服务端发送 ping 消息响应计时器
        serverTimeoutObj: null,

        // 最新一条有数据的 ws 消息
        websocketMsg: null,
        // 最新一条给 Main.vue 的 ws 消息
        websocketMsgMain: null,

        // 定时断开 ws 链接重连
        interval_doCloseAndReconnect: null,

        // ws 重连计时器句柄, N 分钟内没有重连成功, 执行客服下线等相关操作
        reconnectTimer: null,
        // 本轮重连是否已被判定为失败(N 分钟内重连失败)
        // ws 始终会继续重连, 因此需要这样一个标识, 让本轮(断开 ~ 下次 onopen)的后续重连不再设置重连计时器
        reconnectFailed: false
    },
    getters: {
        // 当前用户建立 ws 链接请求地址
        wsLinkUrl(state, getters, rootState) {
            return `${state.wsBaseUrl}/${rootState.enterpriseId}/${rootState.userId}`;
        },
        // 获取当前用户 ws 历史未推送消息请求地址
        wsHistoryUrl(state, getters, rootState) {
            return `${state.wsBaseUrl_history}${rootState.userId}`;
        }
    },
    mutations: {
        // 关闭 ws 链接 --- 注意, 仅在退出登录时调用, 重连时不要调用
        closeWS(state) {
            console.error('%c closeWS', 'color:#093;');

            // 清除检验重连是否超时的计时器
            if (state.reconnectTimer) {
                clearTimeout(state.reconnectTimer);
                state.reconnectTimer = null;
            }
            // 重置本轮重连失败标识
            state.reconnectFailed = false;

            // 避免重连
            state.wsNeedReconnect = false;
            // 设置"重连中"标识为 false
            state.wsReconnecting = false;

            // 清空原有 WS 实例
            if (state.WS) {
                // 关闭 ws 连接
                state.WS.close();
            }
            state.WS = null;

            // 恢复 isFirstConnect 状态为 true , 保证下次登录时能 send('login') 通知后端此账户登录
            state.isFirstConnect = true;

            // 取消"定时断开重连 ws"
            if (state.interval_doCloseAndReconnect) {
                clearInterval(state.interval_doCloseAndReconnect);
                state.interval_doCloseAndReconnect = null;
            }
        },
        // 创建 ws 链接
        connectSocket(state, { getters, commit, dispatch, rootState }) {
            // 不需要重连, 退出流程
            if (!state.wsNeedReconnect) {
                console.error('指明不需要重连, 退出流程');
                return;
            }

            console.error('%c connectSocket', 'color:#093;');

            // 清空原有 ws 实例
            if (state.WS) {
                // 关闭 ws 连接
                state.WS.close();
            }
            state.WS = null;

            try {
                // 连接 websocket
                if ('WebSocket' in window) {
                    state.WS = new WebSocket(getters.wsLinkUrl);

                    // 初始化 ws 相关 handle
                    commit('initEventHandle', { commit, dispatch, rootState });
                } else if ('MozWebSocket' in window) {
                    state.WS = new MozWebSocket(getters.wsLinkUrl);

                    // 初始化 ws 相关 handle
                    commit('initEventHandle', { commit, dispatch, rootState });
                } else {
                    // 设置"断开后重连"标识为 false
                    state.wsNeedReconnect = false;

                    // 浏览器不支持 websocket
                    console.error('%c 您的浏览器不支持 websocket !', 'color:#570;');
                }
            } catch (e) {
                /**
                 * @Description: 注意, new WebSocket 的报错这里是捕获不到的, 得走 onerror
                 * @author 汤一飞
                 * @date 2022/9/2
                 */
                // 打印错误信息
                console.error(e);
                // 设置"重连中"标识为 false
                commit('setWsReconnecting', false);
                // 重连
                dispatch('reconnectSocket');
            }
        },
        // 初始化 ws 相关 handle
        initEventHandle(state, { commit, dispatch, rootState }) {
            // onclose
            // 我去, 弱网环境根本触发不了, 还是得靠心跳判断是否断开链接
            state.WS.onclose = (e) => {
                console.error('%c WS.onclose', 'color:#093;');
                console.error(`websocket 断开: ${e.code} ${e.reason} ${e.wasClean}`);
                console.error(e);

                // ws 断开后, 从 localStorage.timeStampList 中去掉 websocketTimeStamp + 清空 websocketTimeStamp
                commit('removeWebsocketTimeStamp');

                // 判断是否重连
                if (state.wsNeedReconnect) {
                    /**
                     * @Description: 这里千万不能重置"重连中"状态为 false 再重连, 不然会指数级打印日志(onerror 和 onclose 不断尝试重连)
                     * @author 汤一飞
                     * @date 2022/9/2
                     */
                    // 重连标识为 true , 触发重连
                    dispatch('reconnectSocket');
                } else {
                    // 清空 ws 变量存储
                    state.WS = null;
                }

                // 清空计时器
                clearTimeout(state.timeoutObj);
                clearTimeout(state.serverTimeoutObj);
            };

            // onerror
            // 我去, 弱网环境根本触发不了, 还是得靠心跳判断是否断开链接
            state.WS.onerror = () => {
                console.error('%c WS.onerror', 'color:#093;');

                // ws 断开后, 从 localStorage.timeStampList 中去掉 websocketTimeStamp + 清空 websocketTimeStamp
                commit('removeWebsocketTimeStamp');

                // 判断是否重连
                if (state.wsNeedReconnect) {
                    /**
                     * @Description: new WebSocket 的错误在 onclose 捕获, 于是在此处做重连操作
                     * onerror 应该是有多种情况的, 不一定每种情况都要进重连流程来, 还有它和 onclose 现在纠结在一起, 以后能改还是得改
                     * @author 汤一飞
                     * @date 2022/9/2
                     */
                    // 设置"重连中"标识为 false
                    commit('setWsReconnecting', false);
                    // 重连
                    dispatch('reconnectSocket');
                } else {
                    // 清空 ws 变量存储
                    state.WS = null;
                }
            };

            // onopen
            state.WS.onopen = () => {
                console.error('%c WS.onopen', 'color:#093;');

                // 设置 XHLLogin 以供 storage 监听事件处理上下线问题
                localStorage.setItem('XHLLogin', 'LOGIN');

                // 如果是重连状态, 则触发更新在线客服列表操作
                // 在弱网环境下, 后端未收到 ws 消息会主动断开链接(目前是 5 分钟自动断开), 前端恢复网络后会重连 + 云信提示上线成功, 此时触发此 Vuex 变量变更, 在 personal-dropdown 中更新客服列表 + 当前客服在线状态
                if (state.wsReconnecting) {
                    console.error('重连成功, 更新客服列表');

                    commit('setIsReloadServerList', Date.now());
                }

                // 设置"ws 重连中"标识为 false
                commit('setWsReconnecting', false);

                // 如果有重连计时器, 则清除计时器
                if (state.reconnectTimer) {
                    clearTimeout(state.reconnectTimer);
                    state.reconnectTimer = null;
                }
                // 重置本轮重连失败标识
                state.reconnectFailed = false;

                // ws 是首次连接
                if (state.isFirstConnect) {
                    // 获取当前所有询盘云标签页标识
                    const openedWindowList = getOpenedWindowList();
                    console.error('onopen', openedWindowList);
                    // 如果 openedWindowList 数组为空或者当前标签页是开启时间最早的标签页, 说明本页面是当前窗口首个登录(进入 Main.vue)的标签页, 发送账号登录消息(触发其他标签页退出登录), 否则不发, 避免其他标签页被踢下线
                    if (!openedWindowList.length || store.state.app.windowOpenTimeStamp === Math.min(...openedWindowList)) {
                        // 发送登录消息, 服务端收到此消息后, 会向其他账号相同的 ws 连接发送 type: 'hasSameAccountLogin' 消息, 会向本连接发送 type: 'sameAccountRepeatLogin' 消息, 做相同账号登录判断用
                        console.error('sendLogin');
                        state.WS.send('login');
                    }

                    // 设置"是否首次连接"为 false
                    state.isFirstConnect = false;

                    // 请求推送历史未推送消息
                    dispatch('pushHistoryMessage');

                    // 定时断开 ws 重连
                    state.interval_doCloseAndReconnect = setInterval(() => {
                        state.WS && state.WS.close();
                    }, 600000);
                }

                // 开始心跳检测
                dispatch('heartCheck', 'init');

                // 设置 websocketTimeStamp 为当前时间戳
                commit('setWebsocketTimeStamp', Date.now());
            };

            // onmessage
            state.WS.onmessage = event => {
                console.error('%c WS.onmessage', 'color:#093;');
                // console.log(event.data);

                // 心跳检测重置
                dispatch('heartCheck');

                // N 分钟内链接失败倒计时重置
                if (state.reconnectTimer) {
                    clearTimeout(state.reconnectTimer);
                    state.reconnectTimer = null;
                }
                // 如果设置了自动退出登录 + 尚未设置本轮重连已失败 + 未设置重连计时器, 则设置重连计时器
                if (rootState.autoLogoutChat && !state.reconnectFailed && !state.reconnectTimer) {
                    // N 分钟内此计时器还没有被清除, 则执行
                    state.reconnectTimer = setTimeout(() => {
                        dispatch('handleReconnectFailedFinally');
                    }, 5 * 60 * 1000);
                }

                // console.log(isObjJSON(event.data))
                if (event.data != 'tong') {
                    if (isObjJSON(event.data)) {
                        // 更新 websocketMsg 为最新消息
                        commit('setWebsocketMsg', JSON.parse(event.data));
                        // 触发接收消息处理逻辑
                        dispatch('receiveWSMsg', JSON.parse(event.data));
                    }
                }
            };
        },

        // 设置 ws 是否需要在连接失败/断开时重连
        setWsNeedReconnect(state, data) {
            state.wsNeedReconnect = data;
        },
        // 设置 ws 重连中标识
        setWsReconnecting(state, data) {
            state.wsReconnecting = data;
        },

        // 设置 ws 打开时时间戳
        setWebsocketTimeStamp(state, data) {
            state.websocketTimeStamp = data;
        },
        // ws 关闭时从 localStorage.timeStampList 中去掉 websocketTimeStamp
        removeWebsocketTimeStamp(state) {
            state.websocketTimeStamp = 0;
        },

        // 设置心跳连接计时器
        setTimeoutObj(state, data) {
            state.timeoutObj = data;
        },
        setServerTimeoutObj(state, data) {
            state.serverTimeoutObj = data;
        },

        // 设置最新一条 websocketMsg
        setWebsocketMsg(state, data) {
            state.websocketMsg = data;
        },
        // 设置 Main.vue 需要监听的 ws 新消息(其他模块需要处理的 ws 消息, 在 onmessage 中分发给各模块, 模块自己处理)
        setWebsocketMsgMain(state, data) {
            state.websocketMsgMain = data;
        }
    },
    actions: {
        // 初始化 ws 实例
        initSocket({ getters, commit, dispatch, rootState }) {
            console.error('%c initSocket', 'color:#093;');

            // 设置"断开后重连"标识为 true
            commit('setWsNeedReconnect', true);

            // 初始化 ws
            commit('connectSocket', { getters, commit, dispatch, rootState });
        },
        // ws 重连
        reconnectSocket({ state, getters, commit, dispatch, rootState }) {
            /**
             * @Description: 这里不能去掉, 避免 onclose 里面反复调用重连
             * onerror 触发重连之前会先设置"重连中"状态, 目前看没有问题
             * @author 汤一飞
             * @date 2022/9/2
             */
            // 重连中, 则停止重连
            if (state.wsReconnecting) return;

            console.error('%c reconnectSocket', 'color:#093;');

            // 设置"重连中"标识为 true
            commit('setWsReconnecting', true);

            // 延时 2s 重连 websocket
            setTimeout(() => {
                // 没连接上会一直重连，设置延迟避免请求过多
                commit('connectSocket', { getters, commit, dispatch, rootState });
            }, 2000);
        },

        // 设置 ws 消息已读
        updateWSMessage({ state }, ids) {
            // // 创建 - 非IE6 - 第一步
            // let xhr;
            // if (window.XMLHttpRequest) {
            //     xhr = new XMLHttpRequest();
            // } else { // IE6及其以下版本浏览器
            //     xhr = new ActiveXObject('Microsoft.XMLHTTP');
            // }
            // // 接收 - 第三步
            // xhr.onreadystatechange = function () {
            //     if (xhr.readyState == 4) {
            //         const status = xhr.status;
            //         if (status >= 200 && status < 300) {
            //             // success
            //         } else {
            //             // fail
            //         }
            //     }
            // };
            // // 连接 和 发送 - 第二步
            // xhr.open('POST', state.wsUpdateUrl, false);
            // // 设置表单提交时的内容类型
            // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            // xhr.send(`ids=${ids}`);

            util.ajax({
                url: state.wsUpdateUrl,
                method: 'post',
                data: {
                    ids
                }
            });
        },
        // 推送 ws 未读的历史消息
        pushHistoryMessage({ getters }) {
            // // 创建 - 非IE6 - 第一步
            // let xhr;
            // if (window.XMLHttpRequest) {
            //     xhr = new XMLHttpRequest();
            // } else { // IE6及其以下版本浏览器
            //     xhr = new ActiveXObject('Microsoft.XMLHTTP');
            // }
            // // 接收 - 第三步
            // xhr.onreadystatechange = function() {
            //     if (xhr.readyState === 4) {
            //         const status = xhr.status;
            //         if (status >= 200 && status < 300) {
            //             // success
            //         } else {
            //             // fail
            //         }
            //     }
            // };
            // // 连接 和 发送 - 第二步
            // xhr.open('GET', getters.wsHistoryUrl);
            // xhr.send(null);

            util.ajax({
                url: getters.wsHistoryUrl,
                method: 'get'
            });
        },

        // 处理接收到的 ws 消息, 分发给其他组件
        receiveWSMsg({ state, commit, dispatch }, msgData) {
            console.log(msgData);
            // 检测前端是否接收到了ws消息,反馈给后端
            if (msgData.messagePushLogId) {
                const wsConnectionTest = {
                    type: 'message_confirm',
                    data: {
                        messagePushLogId: msgData.messagePushLogId
                    }
                };
                state.WS.send(JSON.stringify(wsConnectionTest));
            };
            switch (msgData.messageType) {
                case 'sendEnterpriseLeavemessageMessage':
                    // 推送网站留言消息(1)
                    // 网站留言相关消息处理
                    // 注意: 网站留言 vuex module 带命名空间(namespaced: true), 别人调它/它调别人, 都要加上前缀和 { root: true }
                    dispatch('website_msg/receiveWSMsg_webMsg', msgData, { root: true });
                    break;
                case 'facebookChatMessage':
                case 'facebookCommentMessage':
                case 'facebookClueCount':
                case 'facebookMessagingRead':
                case 'facebookAssignCustomerService':
                    // facebook 相关消息处理
                    // 推送Facebook聊天消息(2)
                    // 推送Facebook评论消息(3)
                    // 推送Facebook同步leads消息(6)
                    // 推送Facebook聊天已读未读标识 消息
                    // FB 对话接待客服变更提醒
                    dispatch('receiveWSMsg_facebook', msgData);
                    break;
                case 'receiveMailMessage':
                case 'sendMailMessage':
                case 'openMailTraceNotice':
                case 'batchDoRuleNotice':
                    // mail 相关消息处理
                    // 推送收件消息(4)
                    // 推送发件消息(5)
                    dispatch('receiveWSMsg_mail', msgData);
                    break;
                case 'systemNotice':
                    // 系统通知(前端发送)
                    dispatch('systemNotice', msgData);
                    commit('changeSystemNoticeFlag');
                    break;
                case 'crmTaskNotice':
                    // 任务提醒
                    dispatch('taskNotice', {
                        tip: msgData.operateType === 1 ? '新任务' : '任务提醒',
                        fromNick: 'taskNotic',
                        time: `${new Date(msgData.text.taskEndTime).format('yyyy-MM-dd hh:mm:ss ')}`,
                        taskName: msgData.text.taskName,
                        textObj: msgData.text,
                        text: (msgData.text.relatObjDescription && msgData.text.relatObjDescription !== '{}' && msgData.text.relatObjDescription !== 'null') ? (`关联对象: ${msgData.text.relatObjType === 2 ? JSON.parse(msgData.text.relatObjDescription).mailSubject : (JSON.parse(msgData.text.relatObjDescription).companyName + JSON.parse(msgData.text.relatObjDescription).inquirySeqNumber)}`) : ''
                    });
                    // 任务提醒,由于任务提醒列表合并到消息列表，更新消息列表，不更新任务列表了
                    commit('changeSystemNoticeFlag');
                    commit('changeTaskNoticeFlag');
                    break;
                case 'waImportCompletedNotice':
                    // 上传成功后socket
                    Notification.success({
                        title: 'WhatsApp号码导入完成',
                        message: msgData.text,
                        duration: 3000
                    })
                    break;
                case 'replyFollowup':
                    // 跟进记录评论/回复通知(前端发送)
                    dispatch('otherNotice', {
                        originalObj: msgData,
                        fromNick: i18n.t('facebook.inbox.comment'),
                        text: msgData.text,
                        tip: msgData.title,
                        type: 20
                    });
                    break;
                case 'onlyMsgRemindNotice':
                    // 公海预提醒通知，只需要更新消息中心，不弹窗提醒
                    commit('changeSystemNoticeFlag');
                    break;
                case 'eventAssociatedNotice':
                    // facebook、网站关联消息类型
                    dispatch('otherNotice', {
                        originalObj: msgData,
                        fromNick: '通知内容',
                        text: msgData.text,
                        tip: '新访问通知',
                        type: 5
                    });
                    break;
                case 'journeyRebuildNotice':
                    // 时间轴重建提醒
                    console.log('时间轴重建完成推送消息', msgData);
                    commit('setRebuildTimelineNotice', {
                        msgData
                    });
                    break;
                case 'downloadMailEmlNotice':
                    // 邮件打包下载eml提醒
                    dispatch('otherNotice', {
                        originalObj: msgData,
                        fromNick: '通知内容',
                        text: msgData.text,
                        tip: '系统通知',
                        type: 5
                    });
                    break;
                case 'cinnoxReceiveMessage':
                    // cinnox 通知
                    dispatch('receiveWSMsg_CallSms', msgData);
                    break;
                case 'pleaseChargeNotice':
                    // AI 功能余额不足, 弹出提示
                    dispatch('otherNotice', {
                        originalObj: msgData,
                        fromNick: '生成失败',
                        text: '当前 AI 功能剩余文章数不足，请充值后再继续使用',
                        tip: '自动化文章生成',
                        type: 25
                    });
                    break;
                default:
                    if (msgData.type) {
                        // 分发给 Main.vue 处理
                        commit('setWebsocketMsgMain', msgData);
                    } else {
                        switch (msgData.bePushedMessageType) {
                            case '9':
                                // 网站访客自动关联提醒
                                // 推送自动关联消息(9,"sendAutoAassociationMessage"),
                                dispatch('associationMsgNotice', {
                                    originalObj: msgData,
                                    text: msgData.text,
                                    type: 7,
                                    tip: i18n.t('message.systemNotice')
                                });
                                // 修改右上角小铃铛的未读数
                                commit('changeSystemNoticeFlag');
                                break;
                            case '10':
                                if (msgData.msgType == 4 || msgData.msgType == 5) {
                                    // msgType：1对话2网站留言3fbLeads4fb私信5fb评论
                                    // 给有fb账号的人推送自动关联消息(10,"sendAutoAassociationMessageOther")
                                    dispatch('receiveWSMsg_facebook', msgData);
                                }
                                break;
                            case '13':
                                // WhatsApp 相关消息处理
                                // 推送WhatsAapp收到的消息(13,"sendWhatsAppMessage")
                                dispatch('receiveWSMsg_whatsApp', msgData); // 主应用收发消息通知、WhatsApp未读数、联系人导出的通知、收发消息
                                break;
                            case '18':
                                // 1. fb发布推文后,后端接口直接返回成功的code;
                                // 2. 待后端将推文发布成功时,会推送一个websocket消息;
                                // 3. 前端根据websocket消息,更新推文列表
                                if (msgData.WaWebsocketMessageType === 20) {
                                    dispatch('receiveWSMsg_facebook', msgData);
                                }
                                break;
                            case '24':
                                // 处理企微消息通知
                                dispatch('receiveWSMsg_MicroQW', msgData);
                                break;
                            case '28':
                                // 处理outlook邮箱绑定结果通知
                                dispatch('receiveWSMsg_mail', msgData);
                                let res = JSON.parse(msgData.data);
                                if (res.code === 1) {
                                    Message({
                                        type: 'success',
                                        message: res.msg,
                                        duration: 3000,
                                        showClose: true
                                    });
                                } else if (res.code === 0) {
                                    Message({
                                        type: 'error',
                                        message: res.msg,
                                        duration: 3000,
                                        showClose: true
                                    });
                                }
                                break;
                        }
                    }
            }

            /**
             * @Description: 以下是在改 whatsapp 的 websocketMsg 监听为 websocketMsgWA 监听时, 发现监听内部各种处理逻辑的判断条件
             * 因为现在不清楚这些条件是什么关系, 先原样挪过来
             * 问后端后端也不清楚, 为避免弹出重复消息(触发两次 receiveWSMsg_whatsApp), 这里再加一个判断 bePushedMessageType !== '13'
             * @author 汤一飞
             * @date 2021/4/26
            */
            if (msgData.bePushedMessageType !== '13') {
                if (msgData.whatsAppAccountLoginStatus || msgData.pushMessageModule === 'WhatsAppModule' || [3, 12].includes(msgData.WaWebsocketMessageType)) {
                    // WhatsApp 相关消息处理
                    dispatch('receiveWSMsg_whatsApp', msgData); // 主应用收发消息通知、WhatsApp未读数、联系人导出的通知、收发消息
                }
            }
        },
        // 发送 ws 消息
        sendWSMsg({ state }, postData) {
            util.ajaxJson({
                url: state.wsSendUrl,
                method: 'post',
                data: postData
            });
        },

        // 心跳重连机制
        heartCheck({ state, commit, rootState }, data) {
            /**
             * @Description: 每次登录和收到消息时都触发此方法, 其意义为 ---
             * 1. 设置定时, 如果指定 timeout 期间未收到 ws 消息(onmessage), 则主动向服务端发送 'ping' 消息, 如果服务端指定时间内无响应, 则断开 ws 连接并执行重连
             * 2. 如果收到 ws 消息, 则清空原有计时器, 重新计时
             * @author 汤一飞
             * @date 2021/4/25
             */

            // 如果是 ws 初次链接触发心跳, 则不等定时器发送 ping 消息, 直接先发一次 userId 和 accId , 给后端做"断开 ws 链接 N 分钟后下线该客服"功能提供数据
            if (data === 'init' && state.WS && !state.wsReconnecting) {
                state.WS.send(JSON.stringify({
                    ping: {
                        userId: rootState.userId,
                        accId: rootState.AccId
                    }
                }));
            }

            // 清空原有计时器
            clearTimeout(state.timeoutObj);
            clearTimeout(state.serverTimeoutObj);

            // 设置
            commit('setTimeoutObj', setTimeout(() => {
                // 这里发送一个心跳，后端收到后，返回一个心跳消息，
                // onmessage 拿到返回的心跳就说明连接正常
                if (state.WS && !state.wsReconnecting) {
                    // ping 机制, 从发送字符串"ping", 改为发送 userId 和 accId , 给后端做"断开 ws 链接 N 分钟后下线该客服"功能提供数据
                    // state.WS.send('ping');
                    state.WS.send(JSON.stringify({
                        ping: {
                            userId: rootState.userId,
                            accId: rootState.AccId
                        }
                    }));
                    commit('setServerTimeoutObj', setTimeout(() => {
                        // 如果超过一定时间还没重置，说明后端主动断开了, 前端主动断开 ws 连接, onclose 中执行 reconnect
                        state.WS && state.WS.close();
                    }, state.timeout));
                }
            }, state.timeout));
        },

        // 在规定时间内重连失败了, 不停止 ws 重连, 但关闭云信链接 + 下线客服, 弹出提示
        handleReconnectFailedFinally({ state, commit, dispatch, rootState }) {
            // 清除检验重连是否超时的计时器
            if (state.reconnectTimer) {
                clearTimeout(state.reconnectTimer);
                state.reconnectTimer = null;
            }

            // 设置本轮重连失败标识为 true , 避免在本轮后续请求中继续设置计时器
            state.reconnectFailed = true;

            // 关闭云信链接 + (personal-dropdown watcher)触发客服下线
            if (rootState.nim) {
                commit('resetChat');

                // 弹出提示语
                // 系统内提示语 + 不自动消失
                Message({
                    message: i18n.t('chat.reconnectFailedFinally'),
                    type: 'error',
                    duration: 0,
                    showClose: true
                });
                // 浏览器通知 + 不自动消失
                dispatch('wsLinkNotice', {
                    text: i18n.t('chat.reconnectFailedFinally'),
                    requireInteraction: true
                });
            }
        }
    }
};
