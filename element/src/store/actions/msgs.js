import store from '../';
import config from '../../configs';
import util from '../../utils';
import Util from '../../libs/util';
import i18n from '@/locale';
import Cookies from 'js-cookie';
import { Message } from 'element-ui';
import { getVisitorId } from './sysMsgs';

export function formatMsg(msg) {
    const nim = store.state.nim;
    if (msg.type === 'robot') {
        if (msg.content && msg.content.flag === 'bot') {
            if (msg.content.message) {
                msg.content.message = msg.content.message.map(item => {
                    switch (item.type) {
                        case 'template':
                            item.content = nim.parseRobotTemplate(item.content);
                            break;
                        case 'text':
                        case 'image':
                        case 'answer':
                            break;
                    }
                    return item;
                });
            }
        }
    }
    return msg;
}

export function onRoamingMsgs(obj) {
    const msgs = obj.msgs.map(msg => {
        return formatMsg(msg);
    });
    store.commit('updateMsgs', msgs);
}

export function onOfflineMsgs(obj) {
    const msgs = obj.msgs.map(msg => {
        store.dispatch('msgNotice', msg);
        return formatMsg(msg);
    });
    store.commit('updateMsgs', msgs);
}

export function onMsg(msg) {
    const visitorId = getVisitorId(msg.from);
    if (msg.flow === 'in') {
        store.dispatch('msgNotice', msg);
        store.dispatch('saveChatMsg', {
            msg: msg,
            flow: 'in',
            type: 2,
            visitorId: visitorId,
            toNick: store.state.fullName
        });
        store.dispatch('saveMsgId', {
            msg: msg,
            visitorId: visitorId
        });
        let content = '';
        if (msg.type === 'text') {
            /**
             * @Date: 2020-04-23 18:37:19
             * @LastEditors: niumkiki
             * @description: 设置访客正在输入内容为空
             * @param :
             * @return:
             */
            // 如果没有cookie中未读取到notChatWithOther，则需要设置cookie
            if (!Cookies.get('notChatWithOther')) {
                Cookies.set('notChatWithOther', true);
            }
            store.commit('setVisitorInputContent', { visitorId, inputContent: '', sendFlag: 1 });
            // 如果该访客之前跟客服B在聊天,客服B下线了,该访客重新刷新后,给本客服发了消息:
            // 需要先判断一下它的DisableChat是否为true,若为true,需要设置为false,让客服能够和该访客聊天,
            // 这个逻辑先不改了,等之后一飞改的时候一起改吧
            // if (store.state.disableChat) {
            //     store.commit('setDisableChat', false);
            // }
            // console.log('isChatWithOther', store.state.isChatWithOther[store.state.currSessionId]);
            // if (store.state.isChatWithOther[store.state.currSessionId]) {
            //     // 也应该设置一下该访客的chatwidthOther值
            //     store.commit('updateChatWithOtherList', {
            //         account: store.state.currSessionId,
            //         status: false
            //     });
            // }

            content = msg.text;
            // let email = content.match(/\w+?@\S+?\.com[.cn]?[;]?/mg);
            const email = content.match(/[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/mg);
            if (email) {
                store.dispatch('chatWithEmail', {
                    email: email,
                    visitorId: visitorId
                });
                // this.chatWithEmail(email);
            }
        } else {
            content = msg.file.url;
        }
        store.dispatch('testAnalytics', {
            eventName: 'ServiceReceivedSuccess',
            type: '22',
            from: msg.from,
            to: msg.to,
            remark: content
        });
    }

    msg = formatMsg(msg);
    store.commit('putMsg', msg);
    let sessionId;
    if (msg.flow === 'in') {
        sessionId = msg.from;
    } else if (msg.flow === 'out') {
        sessionId = msg.to;
    }
    // if(!store.state.isChatting[sessionId] || store.state.isChatting[sessionId] === 0){
    store.commit('updataIsChatting', {
        account: sessionId,
        type: 1
    });
    // msg-send 输入框允许输入
    store.commit('setDisableChat', {
        visitorId: visitorId,
        flag: false
    });
    // 订阅访客
    store.commit('subscribeEvent', sessionId);
    // 更新访客列表
    store.dispatch('updateSessionList');
    // }
    if (sessionId === store.state.currSessionId) {
        store.commit('updateCurrSessionMsgs', {
            type: 'put',
            msg
        });
        // 发送已读回执
        store.dispatch('sendMsgReceipt');
    }
}

function onSendMsgDone(error, msg) {
    // store.dispatch('hideLoading')
    let content = '';
    if (msg.type === 'text') {
        content = msg.text;
    } else {
        content = msg.url;
    }
    if (error) {
        store.dispatch('testAnalytics', {
            eventName: 'sendMsgDoneError',
            type: '',
            from: msg.from,
            to: msg.to,
            remark: `${content}发送失败/${error}`
        });
        // 被拉黑
        switch (error.code) {
            case 7101:
                msg.status = 'success';
                msg.isInBlackList = true;
                Message.error(error.message);
                break;
            case 'Error_Connection_Socket_State_not_Match':
                Message.error(i18n.t('chat.YX_error_code.Error_Connection_Socket_State_not_Match'));
                break;
            default:
                Message.error(error.message);
        }
    } else {
        store.dispatch('testAnalytics', {
            eventName: 'ServiceSendSuccess',
            type: '21',
            from: msg.from,
            to: msg.to,
            remark: content
        });
        // 从 visitorSessionInfo 中取访客相关数据
        const sessionInfo = store.state.visitorSessionInfo.get(msg.to);
        // 保存聊天信息
        if (sessionInfo) {
            store.dispatch('saveChatMsg', {
                msg: msg,
                flow: 'out',
                type: 3,
                visitorId: sessionInfo.visitorId,
                toNick: sessionInfo.nick
            });
        } else {
            console.error(store.state.visitorSessionInfo);
            console.error(msg);
        }
    }
    onMsg(msg);
}

// 消息撤回
export function onRevocateMsg(error, msg) {
    const nim = store.state.nim;
    if (error) {
        if (error.code === 508) {
            alert('发送时间超过2分钟的消息，不能被撤回');
        } else {
            alert(error);
        }
        return;
    }
    let tip = '';
    if (msg.from === store.state.userUID) {
        tip = '你撤回了一条消息';
    } else {
        const userInfo = store.state.userInfos[msg.from];
        if (userInfo) {
            tip = `${util.getFriendAlias(userInfo)}撤回了一条消息`;
        } else {
            tip = '对方撤回了一条消息';
        }
    }
    nim.sendTipMsg({
        isLocal: true,
        scene: msg.scene,
        to: msg.to,
        tip,
        time: msg.time,
        done: function sendTipMsgDone(error, tipMsg) {
            const idClient = msg.deletedIdClient || msg.idClient;
            store.commit('replaceMsg', {
                sessionId: msg.sessionId,
                idClient,
                msg: tipMsg
            });
            if (msg.sessionId === store.state.currSessionId) {
                store.commit('updateCurrSessionMsgs', {
                    type: 'replace',
                    idClient,
                    msg: tipMsg
                });
            }
        }
    });
}


export function revocateMsg({ state, commit }, msg) {
    const nim = state.nim;
    const { idClient } = msg;
    msg = Object.assign(msg, state.msgsMap[idClient]);
    nim.deleteMsg({
        msg,
        done: function deleteMsgDone(error) {
            onRevocateMsg(error, msg);
        }
    });
}

// 发送普通消息
export async function sendMsg({ state, commit }, obj) {
    // 判断是否建立连接, 不能建立连接则中断流程
    if (!await serverStartChat({ state, commit }, obj.to)) {
        return false;
    }
    const nim = state.nim;
    obj = obj || {};
    const type = obj.type || '';
    // store.dispatch('showLoading')
    switch (type) {
        case 'text':
            nim.sendText({
                scene: obj.scene,
                to: obj.to,
                text: obj.text,
                done: onSendMsgDone
            });
            break;
        case 'custom':
            nim.sendCustomMsg({
                scene: obj.scene,
                to: obj.to,
                pushContent: obj.pushContent,
                content: JSON.stringify(obj.content),
                done: onSendMsgDone
            });
    }
}

// 发送文件消息
// 点击上传文件、图片是通过参数fileInput传入文件选择 dom 节点或者节点 ID
// 拖拽上传文件、图片是通过参数blob传入 Blob 对象
export async function sendFileMsg({ state, commit }, obj) {
    // 判断是否建立连接, 不能建立连接则中断流程
    if (!await serverStartChat({ state, commit }, obj.to)) {
        return false;
    }
    const nim = state.nim;
    const { scene, to, content, previewedFileType } = obj;

    // 如果传入的对象是通过 previewFile 得到的云信文件对象
    if (previewedFileType) {
        nim.sendFile({
            scene,
            to,
            type: previewedFileType,
            file: content,
            uploadprogress: function(data) {
            },
            uploaderror: function() {
            },
            uploaddone: function(error, file) {
            },
            beforesend: function(msg) {
            },
            done: function(error, msg) {
                onSendMsgDone(error, msg);
            }
        });
        return;
    }

    // 文件大小校验, 最大 10M
    if (content && content.size) {
        if (content.size > 10 * Math.pow(1024, 2)) {
            Message.error(i18n.t('chat.error_fileOutSize'));
            return;
        }
    } else {
        Message.error(i18n.t('facebook.inbox.fbChat.sendFailTip'));
        return;
    }

    // 获取文件类型
    let type = 'file';
    const fileName = content.name;
    if (/\.(png|jpg|bmp|jpeg|gif)$/i.test(fileName)) {
        type = 'image';
    } else if (/\.(mov|mp4|ogg|webm)$/i.test(fileName)) {
        type = 'video';
    }
    // 发送文件
    // store.dispatch('showLoading');
    nim.sendFile({
        scene,
        to,
        type,
        blob: content,
        uploadprogress: function(data) {
        },
        uploaderror: function() {
        },
        uploaddone: function(error, file) {
        },
        beforesend: function(msg) {
        },
        done: function(error, msg) {
            onSendMsgDone(error, msg);
        }
    });
}

// 发送机器人消息
export function sendRobotMsg({ state, commit }, obj) {
    const nim = state.nim;
    let { type, scene, to, robotAccid, content, params, target, body } = obj;
    scene = scene || 'p2p';
    if (type === 'text') {
        nim.sendRobotMsg({
            scene,
            to,
            robotAccid: robotAccid || to,
            content: {
                type: 'text',
                content
            },
            body,
            done: onSendMsgDone
        });
    } else if (type === 'welcome') {
        nim.sendRobotMsg({
            scene,
            to,
            robotAccid: robotAccid || to,
            content: {
                type: 'welcome'
            },
            body,
            done: onSendMsgDone
        });
    } else if (type === 'link') {
        nim.sendRobotMsg({
            scene,
            to,
            robotAccid: robotAccid || to,
            content: {
                type: 'link',
                params,
                target
            },
            body,
            done: onSendMsgDone
        });
    }
}

// 发送消息已读回执
export function sendMsgReceipt({ state, commit }) {
    // 如果有当前会话
    const currSessionId = `p2p-${store.state.currSessionId}`;
    if (currSessionId) {
        // 只有点对点消息才发已读回执
        // if (util.parseSession(currSessionId).scene === 'p2p') {
        const msgs = store.state.currSessionMsgs;
        const nim = state.nim;
        if (state.sessionMap[currSessionId]) {
            nim.sendMsgReceipt({
                msg: state.sessionMap[currSessionId].lastMsg,
                done: sendMsgReceiptDone
            });
        }
        // }
    }
}

function sendMsgReceiptDone(error, obj) {
}

export function getHistoryMsgs({ state, commit }, obj) {
    /**
     * @Description: 注释掉下面的代码, 不从云信取历史消息, 而是从 Vuex 取(之前请求了最近 100 条消息 joinMsg 存入 Vuex:state.msgs)
     * @author 汤一飞
     * @date 2020/6/12
    */
    // const nim = state.nim;
    // if (nim) {
    //     const { scene, to, type } = obj;
    //     let options = {
    //         scene,
    //         to,
    //         reverse: false,
    //         asc: true,
    //         limit: config.localMsglimit || 20,
    //         done: function getHistoryMsgsDone(error, obj) {
    //             if (obj.msgs) {
    //                 if (obj.msgs.length === 0) {
    //                     commit('setNoMoreHistoryMsgs', {
    //                         account: to,
    //                         type: false
    //                     });
    //                 } else {
    //                     commit('setNoMoreHistoryMsgs', {
    //                         account: to,
    //                         type: true
    //                     });
    //                     const msgs = obj.msgs.map(msg => {
    //                         return formatMsg(msg);
    //                     });
    //                     commit('updateCurrSessionMsgs', {
    //                         type: 'concat',
    //                         msgs: msgs
    //                     });
    //                 }
    //             }
    //             // store.dispatch('hideLoading')
    //         }
    //     };
    //     if (state.currSessionLastMsg) {
    //         options = Object.assign(options, {
    //             lastMsgId: state.currSessionLastMsg.idServer,
    //             endTime: state.currSessionLastMsg.time
    //         });
    //     }
    //     // store.dispatch('showLoading')
    //     nim.getHistoryMsgs(options);
    // }

    // 取 to (accId)
    const { scene, to, type } = obj;
    // 单次加载限制
    const limit = config.localMsglimit || 20;
    // 获取到 Vuex 中存入的当前 accId 对应的所有聊天数据
    let msgs = state.msgs[`p2p-${to}`] || [];
    // 过滤掉已经加载到 currSessionMsgs 的消息
    const idClients = state.currSessionMsgs.map(item => item.idClient);
    msgs = msgs.filter(item => !idClients.includes(item.idClient));
    if (msgs.length === 0) {
        // 没有更多历史消息了
        commit('setNoMoreHistoryMsgs', {
            account: to,
            type: false
        });
    } else {
        // 剩余未加载消息条数
        const msgLen = msgs.length;
        // 加载 limit 条数据到 currSessionMsgs
        commit('updateCurrSessionMsgs', {
            type: 'concat',
            msgs: msgLen > limit ? msgs.slice(msgLen - limit) : msgs
        });
        // 判断是否还有历史消息
        commit('setNoMoreHistoryMsgs', {
            account: to,
            type: msgLen > limit
        });
    }
}

export function resetNoMoreHistoryMsgs({ commit }) {
    commit('resetNoMoreHistoryMsgs');
}

// 继续与机器人会话交互
export function continueRobotMsg({ commit }, robotAccid) {
    commit('continueRobotMsg', robotAccid);
}

// 消息翻译
export function onTranslateMsg({ commit }, obj) {
    const msg = obj.msg;
    const idClient = obj.idClient;
    commit('replaceMsg', {
        sessionId: msg.sessionId,
        idClient,
        msg: msg
    });
    const currSessionId = `p2p-${store.state.currSessionId}`;
    if (msg.sessionId === currSessionId) {
        commit('updateCurrSessionMsgs', {
            type: 'replace',
            idClient,
            msg: msg
        });
    }
}

// 请求接口获得转接的聊天内容
export function getTransferHistoryMsgs({ state, commit }, obj) {
    const arr = [];
    const { visitorId, visitorAccid } = obj;
    Util.ajaxInternational({
        url: '/server/lastedChatMessageByVisitorId',
        method: 'post',
        data: {
            visitorId: visitorId,
            visitorAccId: visitorAccid,
            limit: 100
        }
    }).then(response => {
        if (response.data) {
            const msgs = response.data;
            msgs.forEach(msg => {
                const timeStamp = (new Date(msg.msgTimestamp)).getTime();
                const obj = {
                    flow: msg.flow,
                    fromNick: msg.fromNick,
                    toNick: msg.toNick,
                    fromAccount: msg.fromAccount,
                    toAccount: msg.toAccount,
                    idClient: msg.idClient,
                    type: msg.msgType,
                    time: timeStamp,
                    status: 'success',
                    text: '',
                    file: {
                        url: '',
                        name: ''
                    }
                };
                if (msg.msgType === 'text') {
                    obj.text = msg.body;
                } else {
                    obj.file.url = msg.attach;
                    obj.file.name = msg.body;
                }
                arr.push(obj);
            });
            commit('joinMsg', {
                sessionId: `p2p-${visitorAccid}`,
                msgs: arr
            });
        }
    });
}

/**
 * @Description: 请求当前访客客服接待情况, 包括访客最新接待客服是否在线, 以及此访客是否已被别人接待, 访客名, 客服名
 * @author 汤一飞
 * @date 2020/5/12
*/
export function getVisitorReception({ state, commit }, visitorId) {
    const id = visitorId;
    if (id) {
        // 如果当前 visitorId 在 myVisitorIds 中(当前客服为最近接待客服且在线) , 则直接返回 true , 不需要频繁请求接口
        if (state.myVisitorIds.includes(id)) {
            // msg-send 输入框允许输入
            commit('setDisableChat', {
                visitorId: id,
                flag: false
            });
            return Promise.resolve(true);
        }
        // 取消上一次请求
        if (typeof state.disableChat[id] === 'function') {
            state.disableChat[id]();
        }
        return Util.ajaxInternational({
            url: '/visitor-chat/visitor/getVisitorServerIdInfo',
            method: 'get',
            params: {
                accId: state.AccId,
                orgId: state.enterpriseId,
                visitorId: id
            },
            cancelToken: new Util.axios.CancelToken(function executor(c) {
                // 用 canceler 作为 disableChat.visitorId , 方便取消之前的请求, 保证 disableChat.visitorId 为最新请求结果
                commit('setDisableChat', {
                    visitorId: id,
                    flag: c
                });
            })
        }).then(res => {
            const data = res.data.data;
            switch (res.data.code) {
                case '1':
                    // 可以接待 --- 当前客服是该访客的最近接待客服 或 该访客最近接待客服不在线
                    // 与后台约定 --- 如果 data 有 serverAccId , 说明"我"是最近接待客服且在线, 我下线/转接之前其他人无权操作此访客, 则存入 state.myVisitorIds ,
                    if (data && data.serverAccId) {
                        commit('updateMyVisitorIds', [id]);
                    }
                    // msg-send 输入框允许输入
                    commit('setDisableChat', {
                        visitorId: id,
                        flag: false
                    });
                    return Promise.resolve(data || true);
                case '2':
                    // 已被其他客服接待
                    // 错误提示
                    Message.error(`${i18n.t('openBracket')}${data ? data.visitorName : ''}${i18n.t('chat.error_visitorReceived1')}${data ? data.serverName : ''}${i18n.t('chat.error_visitorReceived2')}`);
                    // msg-send 输入框不允许输入
                    commit('setDisableChat', {
                        visitorId: id,
                        flag: true
                    });
                    return Promise.resolve(false);
                case '0':
                default:
                    // 查询访客信息失败
                    // 错误提示
                    Message.error(i18n.t('chat.error_getVisitorReception'));
                    return Promise.resolve(false);
            }
        }).catch(err => {
            // 查询访客信息失败
            Message.error(i18n.t('chat.error_getVisitorReception'));
            return Promise.resolve(false);
        });
    } else {
        // 参数错误
        // 错误提示
        Message.error(i18n.t('crm.InqSet.error_params'));
        return false;
    }
}

/**
 * @Description: 尝试与访客建立连接
 * 刷新/上线后跟每个访客第一次发消息前调用
 * @author 汤一飞
 * @date 2020/6/4
*/
export function serverStartChat({ state, commit }, visitorAccId) {
    // 获取当前查询的 visitorAccId
    const account = visitorAccId || state.currSessionId;
    const currVisitorId = state.currVisitorId;
    if (account) {
        // 如果当前 visitorAccId 在 isChatting 中(当前访客正在聊天) , 则直接返回 true , 不需要频繁请求接口
        if (state.isChatting[account]) {
            return true;
        }
        // 如果不在"正在聊天"列表, 则请求接口与该访客建立连接
        return Util.ajaxInternational({
            url: '/visitor-chat/visitor/serverStartChat',
            method: 'get',
            params: {
                enterpriseId: state.enterpriseId,
                visitorAcctid: account,
                serverAcctid: state.AccId,
                visitorId: currVisitorId
            }
        }).then(res => {
            const data = res.data.data;
            switch (res.data.code) {
                case '1':
                    // 成功建立连接
                    // 标为正在聊天
                    commit('updataIsChatting', {
                        account,
                        type: 1
                    });
                    return Promise.resolve(true);
                case '-1000':
                    // 已被其他客服接待
                    // 错误提示
                    Message.error(`${i18n.t('openBracket')}${data ? data.visitorName : ''}${i18n.t('chat.error_visitorReceived1')}${data ? data.serverName : ''}${i18n.t('chat.error_visitorReceived2')}`);
                    // 从 myVisitorIds 中去掉
                    commit('removeMyVisitorIds', [currVisitorId]);
                    // 从正在聊天中去掉
                    commit('updataIsChatting', {
                        account,
                        type: 0
                    });
                    return Promise.resolve(false);
                case '0':
                default:
                    // 查询访客信息失败
                    // 错误提示
                    Message.error(i18n.t('chat.error_getVisitorReception'));
                    // 从正在聊天中去掉
                    commit('updataIsChatting', {
                        account,
                        type: 0
                    });
                    return Promise.resolve(false);
            }
        }).catch(error => {
            // 与访客建立连接失败
            // 错误原因提示
            Message.error(i18n.t('chat.error_getVisitorReception'));
            // 从正在聊天中去掉
            commit('updataIsChatting', {
                account,
                type: 0
            });
            return Promise.resolve(false);
        });
    } else {
        // 参数错误
        // 错误提示
        Message.error(i18n.t('crm.InqSet.error_params'));
        // 从正在聊天中去掉
        commit('updataIsChatting', {
            account,
            type: 0
        });
        return false;
    }
}
