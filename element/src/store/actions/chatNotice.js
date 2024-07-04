import Vue from 'vue';
import store from '../';
import { router } from '@/router/index';
import { getOpenedWindowList } from '@/utils/storage';
import { Message } from 'element-ui';
import i18n from '@/locale';
import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';

// 标题闪烁
let newRemindFlag = 1; // 启动闪烁

// 浏览器 - 任务通知提醒 (目前为前端自己判断, 之后应改为 ws 推送之后提醒)
export function taskNotice({ state, commit }, obj) {
    domsgNotification({
        fromNick: obj.fromNick,
        text: obj.text,
        taskName: obj.taskName || '',
        time: obj.time || '',
        type: 24,
        textObj: obj.textObj
    }, obj.tip);
}

// 云信 - 新访客提醒
export function pushNotice({ state, commit }, obj) {
    /* 是否开启访客提醒 */
    if (state.isNoticeNewVisitor) {
        const str = `新访客${obj.user.nick}`;
        if (obj.data.type === '1') {
            if (!state.visitorNoticeList[obj.user.account]) {
                state.visitorNoticeList[obj.user.account] = new Date().getTime();
                domsgNotification({
                    fromNick: '温馨提示',
                    text: str,
                    type: 4
                }, '网站新访客');
            } else {
                const time1 = new Date().getTime();
                const time2 = state.visitorNoticeList[obj.user.account];
                /* 因为游客端刷新网页就会发送一次离线、在线的事件，所以同一游客5分钟以内不再弹出访客提醒 */
                if (time1 - time2 > 300000) {
                    domsgNotification({
                        fromNick: '温馨提示',
                        text: str,
                        type: 4
                    }, '网站新访客');
                }
                state.visitorNoticeList[obj.user.account] = time1;
            }
        }
    }
    // }
}

// 云信 - 接受消息提醒
export function msgNotice({ state, commit }, obj) {
    newRemind(state.sourceDocumentTitle, '[new message]', '');
    let content = '';
    if (obj.type === 'text') {
        content = obj.text;
    } else if (obj.type === 'image') {
        content = '一张图片';
    } else if (obj.type === 'file') {
        content = '一个文件';
    }
    domsgNotification({
        fromNick: obj.fromNick,
        text: content,
        type: 4
    }, '网站访客新消息');
}

// websocket - 添加自动关联通知机制
export function associationMsgNotice({ state, commit }, obj) {
    domsgNotification({
        originalObj: obj.originalObj,
        fromNick: 'assosation',
        text: obj.text,
        type: obj.type
    }, obj.tip);
}

// 云信 - 客服转接
export function TransferPush({ state, commit }, obj) {
    domsgNotification({
        fromNick: obj.fromNick,
        text: obj.text,
        type: 4
    }, '客服转接');
}

// 其他 - 目前来看全部来自于 websocket 消息
export function otherNotice({ state, commit }, obj) {
    domsgNotification({
        originalObj: obj.originalObj,
        fromNick: obj.fromNick,
        text: obj.text,
        type: obj.type,
        url: obj.url,
        currentPath: obj.currentPath
    }, obj.tip);
}

// websocket - 系统通知
export function systemNotice({ state, commit }, obj) {
    domsgNotification(Object.assign({
        originalObj: obj,
        fromNick: '通知内容',
        type: 5
    }, obj), '系统通知');
}

// websocket - 断连通知
export function wsLinkNotice({ state, commit }, obj) {
    domsgNotification(Object.assign({
        originalObj: obj,
        fromNick: '通知内容',
        type: 5
    }, obj), '系统通知');
}

function domsgNotification(msg, txt) {

    // 获取当前询盘云标签页时间戳数组
    const openedWindowList = getOpenedWindowList();

    // 检查当前询盘云标签页标识是不是标签列表中最大的
    const flag = openedWindowList.length ? store.state.app.windowOpenTimeStamp === openedWindowList[openedWindowList.length - 1] : true;
    // 是最大的或者标签列表为空, 则允许提示; 否则为避免多个标签页重复提醒, 不提示
    if (flag) {
        // console.log('%c websocket推送了多少条的消息', 'color: blue', `${++noticeMessageListLimit.count} 条`);
        switch (msg.type) {
            case 1:
                playAudio(document.getElementById('fbMusic'));
                break;
            case 2:
            case 20:
            case 7:
            case 5:
                playAudio(document.getElementById('wsMusic'));
                break;
            case 24:
                playAudio(document.getElementById('wsMusic'));
                break;
            case 3:
                playAudio(document.getElementById('emMusic'));
                break;
            case 4:
            case 25:
                playAudio(document.getElementById('bgMusic'));
                break;
            default:
        }

        if (window.Notification) {
            if (Notification.permission === 'granted') {
                Notice(msg, txt);
                // noticeMessageListLimit.getStoreShowLimitMsg(msg, txt);
            } else {
                Notification.requestPermission().then(status => {
                    if (Notification.permission !== status) {
                        Notification.permission = status;
                    }
                    if (status === 'granted') {
                        Notice(msg, txt);
                        // noticeMessageListLimit.getStoreShowLimitMsg(msg, txt);
                    } else {
                        console.log('请求授权失败');
                        console.log(status);
                    }
                });
            }
        }
    }
}

// wa查看下属权限方法
function authorizedButton() {
    return {
        view_subordinates: !HANDLE_BUTTON(BUTTON_IDS.WhatsApp.view_subordinates, store.state.app.button_list)
    };
}

function Notice(msg, txt) {
    console.log('********', JSON.stringify(msg), txt);
    // if (true) {
    console.log('触发Notice');
    // if (!store.state.isWindowFocus) {
    // var domsgNotificationItems = yunXin.cache.domsgNotificationItems;
    // const domsgNotificationItems = store.state.domsgNotificationItems;
    let options = {};
    if (['assosation', 'facebookAssignCustomer'].includes(msg.fromNick)) {
        options = {
            // timeout: 1000000,
            body: msg.text,
            /** 改为使用询盘保存的图片的原因:发通知时总是不显示这个配置中的icon */
            // 使用询盘保存的图片作为icon,之前使用的是../../../static/img/xpylogo.png
            icon: 'https://content.leadscloud.com/773501650529572600_crmDocument.png',
            requireInteraction: msg.requireInteraction || false
        };
    } else if (['taskNotic'].includes(msg.fromNick)) {
        options = {
            // timeout: 1000000,
            body: `${msg.time} \n ${msg.taskName} \n${msg.text}`,
            /** 改为使用询盘保存的图片的原因:发通知时总是不显示这个配置中的icon */
            // 使用询盘保存的图片作为icon,之前使用的是../../../static/img/xpylogo.png
            icon: 'https://content.leadscloud.com/773501650529572600_crmDocument.png',
            requireInteraction: msg.requireInteraction || false
        };
    } else {
        options = {
            // timeout: 1000000,
            body: `${msg.fromNick}:\n${msg.text}`,
            /** 改为使用询盘保存的图片的原因:发通知时总是不显示这个配置中的icon */
            // 使用询盘保存的图片作为icon,之前使用的是../../../static/img/xpylogo.png
            icon: 'https://content.leadscloud.com/773501650529572600_crmDocument.png',
            requireInteraction: msg.requireInteraction || false
        };
    }
    const n = new Notification(txt, options);
    n.onclick = function() {
        // 调用获取wa查看下属权限的方法
        const authorized = authorizedButton();

        // 如果是通过系统websocket推送过来的消息，则需传消息id调用已读接口，更新消息状态
        console.log('Notification onclick');
        try {
            // console.log('msg.originalObj');
            // console.log(msg);
            if (msg.originalObj && msg.originalObj.pushLogId) {
                // console.log('msg.originalObj.pushLogId');
                // console.log(msg.originalObj.pushLogId);
                store.dispatch('updateWSMessage', msg.originalObj.pushLogId);
            }
        } catch (err) {
        }

        parent.window.focus();
        // // $(window.parent.document).find
        // while (domsgNotificationItems.length > 0) {
        //     domsgNotificationItems[0].close();
        //     domsgNotificationItems.shift();
        // }
        let len = 0;
        if (msg.originalObj) {
            len = ((String(msg.originalObj.pushLogId) || '').split(',') || []).length;
        }
        if (len > 1) return false;
        if (msg.url) {
            // cinnox 点击时候需要判断有没有菜单权限
            if (msg.originalObj && msg.originalObj.messageType == 'cinnoxReceiveMessage') {
                const auth = store.getters.isContainsMenu('calling_sms');
                console.log('you没有通话短信页面权限', auth);
                if (!auth) {
                    // Message.error(i18n.t('authority.permissionOfViewSubordinates'));
                    Message.error(i18n.t('authority.permissionOfViewSms'));

                    return false;
                }
            }
            window.open(msg.url, '_blank');
        }

        // 暂存 wa 消息关联所属的 wa 账号
        let userBindWaAccount = '';
        switch (msg.type) {
            case 5:
                if (msg.originalObj.messageType === 'eventAssociatedNotice') {
                    switch (msg.originalObj.relationObjType) {
                        case 1:
                            localStorage.setItem('leadsCloud-clueId', msg.originalObj.relationObjId);
                            window.open(router.resolve({
                                name: 'my_clue'
                            }).href, '_blank');
                            break;

                        case 2:
                            localStorage.setItem('leadsCloud-inquiryId', msg.originalObj.relationObjId);
                            window.open(router.resolve({
                                name: 'myInquiry'
                            }).href, '_blank');
                            break;
                    }
                } else {
                    switch (msg.relationObjType) {
                        case 1:
                            // localStorage.setItem('leadsCloud-clueId', '10110XS202012070034');
                            localStorage.setItem('leadsCloud-clueId', msg.fcolumnValue.id);
                            window.open(router.resolve({
                                name: 'my_clue'
                            }).href, '_blank');

                            // router.push({
                            //     name: `erororororo`
                            // }, () => {
                            //     setTimeout(() => {
                            //         router.replace({
                            //             name: 'my_clue',
                            //             params: {
                            //                 clueId: msg.fcolumnValue.id,
                            //                 needAuth: true
                            //             }
                            //         });
                            //     }, 200);
                            // });
                            break; // 线索
                        case '2':
                        case 4:
                            localStorage.setItem('leadsCloud-inquiryId', msg.inquiryId);
                            window.open(router.resolve({
                                name: 'myInquiry'
                            }).href, '_blank');

                            // router.push({
                            //     name: `erororororo`
                            // }, () => {
                            //     setTimeout(() => {
                            //         router.replace({
                            //             name: 'myInquiry',
                            //             params: {
                            //                 inquiryId: msg.inquiryId,
                            //             }
                            //         });
                            //     }, 200);
                            // });
                            break; // 询盘 + 跟进记录
                        case '3':
                        case 24:
                            Vue.prototype.$viewCustomer(msg.companyId);
                            break; // 客户
                        case '5':
                            break;
                        case 23:
                            Vue.prototype.$viewContact(msg.constactsId);
                            break;
                    }
                }
                break;
            case 2:
                window.open(router.resolve({
                    name: 'website_message',
                    query: {
                        contacts: msg.text
                    }
                }).href, '_blank');
                break;
            case 4:
                router.push({
                    name: 'xhl_chat'
                });
                // window.open(router.resolve({
                //     name: 'xhl_chat'
                // }).href, '_blank');
                break;
            case 1:
                if (msg.currentPath !== 'inbox') {
                    window.open(router.resolve({
                        name: 'inbox'
                    }).href, '_blank');
                    /* router.push({
                            name: 'inbox',
                        }) */
                }
                break;
            case 6:
                window.open(router.resolve({
                    name: 'fb_message'
                }).href, '_blank');
                break;
            case 7:

                console.log('跳转。。。。。。。。。。。。。。。。。。。。');
                localStorage.setItem('leadsCloud-inquiryId', msg.originalObj.inquiryId);
                window.open(router.resolve({
                    name: 'myInquiry'
                }).href, '_blank');
                break;
            case 20:
                store.commit('setReplyNoticeData', msg.originalObj.remindContent);
                break;
            case 13:
                // 暂存 wa 消息关联所属的 wa 账号
                if (msg.originalObj && msg.originalObj.whatsappAccountWebsocketCondition && msg.originalObj.whatsappAccountWebsocketCondition.userBindWaAccount) {
                    userBindWaAccount = msg.originalObj.whatsappAccountWebsocketCondition.userBindWaAccount;
                }

                // WhatsApp下属删除聊天记录时,发给超管的通知,超管点击通知后,可以跳转到指定的下属页面
                // 目前加了账号多开, 用户自己的其他账号的删除也会有这个类型的通知, 不止下属这一种情况了
                if (msg.originalObj.WaWebsocketMessageType === 19) {
                    // 如果此账号存在于未读数对象中, 则说明此账号存在于当前用户的 wa 账号列表中, 则不进行"查看下属"权限相关判断
                    if (store.state.whatsapp.waUnreadObj && store.state.whatsapp.waUnreadObj[userBindWaAccount]) {
                        // 跳转逻辑处理 - 账号多开后需要确保跳到对应账号
                        if (msg.currentPath !== 'whatsapp_chat') {
                            // 不在 wa 页面, 设置"跳转到 wa 界面相关条件"到 localStorage 后新窗口打开 wa 页面选中对应账号
                            const jumpCon = {
                                userBindWaAccount
                            };

                            localStorage.setItem('jumpWaConObj', JSON.stringify(jumpCon));

                            // 跳转 wa 界面
                            window.open(router.resolve({
                                name: 'whatsapp_chat'
                            }).href, '_blank');
                        } else {
                            // 在 wa 页面, 设置"跳转到 wa 界面相关条件" Vuex 变量触发账号更新
                            const jumpCon = {
                                userBindWaAccount
                            };
                            // 在 wa 页面, 设置"跳转到 wa 界面相关条件" Vuex 变量触发账号更新
                            store.commit('setJumpWaConObj', jumpCon);
                        }

                        // 停止向下执行"查看下属"相关判断
                        return;
                    }

                    // 判断是否有查看下属的权限,如果没有则不跳转到查看下属
                    if (!authorized.view_subordinates) {
                        Message.error(i18n.t('authority.permissionOfViewSubordinates'));
                        return;
                    }

                    const obj = {
                        whatsappAccount: msg.originalObj.whatsappAccountWebsocketCondition.userBindWaAccount, // 下属wa账号
                        chatWaName: msg.originalObj.whatsappAccountWebsocketCondition.chatWaName.replace('群组中的消息', ''), // 被删除的联系人姓名
                        userId: msg.originalObj.whatsappAccountWebsocketCondition.userId, // 下属userId
                        messageId: msg.originalObj.whatsappAccountWebsocketCondition.messageId, // 被删除的messageId
                        viewSubordinate: true, // 查看下属阈值标识
                        chatWaAccount: msg.originalObj.whatsappAccountWebsocketCondition.chatWaAccount // 被删除的联系人wa账号
                    };

                    localStorage.setItem('view-subordinate-messages', JSON.stringify(obj));

                    window.open(router.resolve({
                        name: 'whatsapp_chat'
                    }).href, '_blank');

                    return;
                }

                // 其他类型的 wa 提示
                // 跳转逻辑处理 - 账号多开后需要确保跳到对应账号
                if (msg.currentPath !== 'whatsapp_chat') {
                    // 不在 wa 页面, 设置"跳转到 wa 界面相关条件"到 localStorage 后新窗口打开 wa 页面选中对应账号
                    const jumpCon = {
                        userBindWaAccount
                    };

                    localStorage.setItem('jumpWaConObj', JSON.stringify(jumpCon));
                    // 跳转 wa 界面
                    // jumpWaForOpenWaversion 用来判断是不是点击右下角通知进入的wa聊天页面，区分是跳转到内嵌版还是专业版
                    window.open(`${router.resolve({
                        name: 'whatsapp_chat'
                    }).href}?jumpWaForOpenWaversion=notice`, '_blank');
                } else {
                    const jumpCon = {
                        userBindWaAccount
                    };
                    // 在 wa 页面, 设置"跳转到 wa 界面相关条件" Vuex 变量触发账号更新
                    store.commit('setJumpWaConObj', jumpCon);
                }
                break;
            case 17:
                store.dispatch('handleJumpToFbInbox', {
                    pageId: msg.originalObj.pageId,
                    conversationId: msg.originalObj.conversationId
                });
                break;
            case 24:
                // store.commit('setShowTaskNoticeDetail');
                store.dispatch('handleJumpToTestDetail', msg);
                break;
            case 25:
                router.push({
                    name: 'autoGenArticle'
                });
                break;
        }
    };
    // 现在注册消息会自动调用onclose并附带originalObj消息 为了不影响暂时关闭onclose接口只保留onclick关闭事件
    n.onclose = function() {
        // 如果是通过系统websocket推送过来的消息，则需传消息id调用已读接口，更新消息状态
        try {
            console.log('Notification onclose');
            console.log('msg.originalObj');
            console.log(JSON.stringify(msg.originalObj));
            if (msg.originalObj && msg.originalObj.pushLogId) {
                console.log('msg.originalObj.pushLogId');
                console.log(msg.originalObj.pushLogId);
                console.log('%c this is colored', 'background:red;color:#fff', 'this is not colored');
                store.dispatch('updateWSMessage', msg.originalObj.pushLogId);
            }
        } catch (err) {
            console.log(err, '');
        }
    };
    // domsgNotificationItems.push(n);
    // return n;
    // }
    // setTimeout(() => {
    //     n.close.bind(n);
    // }, 3 * 1000);
}

/** 处理播放音频出错 */
function playAudio(dom) {
    if (dom) {
        try {
            const src = dom.src;
            dom.currentTime = 0;
            const audio = dom.play();
            audio.then(_ => {
                // Autoplay started!
            }).catch(error => {
                console.error('音频播放出错, 可能影响新消息提醒, 请联系询盘云开发人员解决.');
                console.error('audio', error);
                dom.src = src;
                dom.play();
                // Autoplay was prevented.
                // Show a "Play" button so that user can start playback.
            });
        } catch (error) {
            console.error(error);
            alert('音频播放出错, 可能影响新消息提醒, 请刷新页面或询盘云开发人员解决。');
        }
    } else {
        alert('音频播放出错, 可能影响新消息提醒, 请刷新页面或联系询盘云开发人员解决');
    }
}

// window.onblur = function() {
//     store.state.isWindowFocus = false;
// };
// window.onfocus = function () {
//     console.log('window onfocus')
//     //newRemindFlagClose()
//     store.state.isWindowFocus = true
//     newRemindFlagClose()
// }
window.onclick = function() {
    // console.log('window click')
    // store.state.isWindowFocus = true;

    if (store.state.app.currentPageName === 'xhl_chat' || store.state.app.floatWindowType === 'xhl_chat') {
        localStorage.setItem('xhlWindowClick', Date.now());
        newRemindFlagClose();
    }
};

function newRemindFlagClose() {
    window.parent.document.title = store.state.sourceDocumentTitle;
    store.commit('changeNewRemindFlag', false);
}

function newRemind(pageTitle, showRemind, hideRemind) {
    if (newRemindFlag == 1) {
        window.parent.document.title = showRemind + pageTitle;
        newRemindFlag = 2;
    } else {
        window.parent.document.title = hideRemind + pageTitle;
        newRemindFlag = 1;
    }
    store.commit('changeNewRemindFlag', setTimeout(function() {
        newRemind(pageTitle, showRemind, hideRemind);
    }, 500));
}
