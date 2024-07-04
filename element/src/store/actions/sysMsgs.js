import store from '../';
import { onUpdateFriend, onDeleteFriend } from './friends';
import { onRevocateMsg } from './msgs';
import util from '@/libs/util';
import Utils from '@/utils/index';
import i18n from '@/locale';
import { Message } from 'element-ui';
import _ from 'lodash';

export function onSysMsgs(sysMsgs) {
    store.commit('updateSysMsgs', sysMsgs);
}

export function onSysMsg(sysMsg) {
    switch (sysMsg.type) {
        // 在其他端添加或删除好友
        case 'addFriend':
            onUpdateFriend(null, {
                account: sysMsg.from
            });
            store.commit('updateSysMsgs', [sysMsg]);
            break;
        case 'deleteFriend':
            onDeleteFriend(null, {
                account: sysMsg.from
            });
            break;
        // 对方消息撤回
        case 'deleteMsg':
            sysMsg.sessionId = `${sysMsg.scene}-${sysMsg.from}`;
            onRevocateMsg(null, sysMsg);
            break;
    }
}

export function onSysMsgUnread(obj) {
    store.commit('updateSysMsgUnread', obj);
}

export function onCustomSysMsgs(customSysMsgs) {
    if (!Array.isArray(customSysMsgs)) {
        const who = customSysMsgs.from;
        const content = JSON.parse(customSysMsgs.content);
        const id = content.id;
        /**
         * @Date: 2020-04-23 18:01:25
         * @LastEditors: niumkiki
         * @description: 正在输入中逻辑
         * @param :
         * @return:
         */
        if (id === 103) {
            store.commit('setVisitorInputContent', content);

            if (store.state.inputIngVisitorId !== content.visitorId) {
                store.commit('getInputingVisitorId', content.visitorId);
            }
        } else if (id === 104) {
            store.commit('setVisitorInputContent', content);
            store.commit('getInputingVisitorId', '');
        }
        // 访客轨迹信息
        if (id == 100) {
            store.commit('setPersonTrackList', customSysMsgs);
            if (store.state.currSessionId === who) {
                store.commit('updateCurrTrackList', who);
            }
        }
        // 订阅访客
        if (id == 101) {
            store.commit('subscribeEvent', who);
            store.commit('sendCustomSysMsgForSubscribesLogin', { account: who });
        }
        //  收到转接通知 201
        if (id == 201) {
            // if (!store.state.personList[content.visitorAccid]) {
            store.commit('subscribeEvent', content.visitorAccid);
            // }

            const str = i18n.t('openBracket') + content.callTransferServerName + i18n.t('chat.transferTxt') + content.visitorName + i18n.t('chat.transferTxt1');
            store.dispatch('TransferPush', {
                fromNick: i18n.t('chat.warmPrompt'),
                text: str
            });
            // store.state.nim.subscribeEvent({
            //     type: 1,
            //     accounts: [content.visitorAccid],
            //     subscribeTime: 7200,
            // })
            store.commit('updateTransfer', {
                callTransferServerAccId: content.callTransferServerAccId,
                receivedTransferServerAccId: content.receivedTransferServerAccId,
                receivedTransferServerName: content.receivedTransferServerName,
                visitorAccid: content.visitorAccid,
                visitorId: content.visitorId,
                callTransferServerName: content.callTransferServerName,
                customerName: content.visitorName
            });
            //    console.log(1)
        }
        // 转接给别人成功
        if (id == 202) {
            // Vue.$Message.success(stroe.state.personList[content.visitorAccid].nick+'转接成功')
            store.state.transferComfir = false;
            store.commit('updataIsChatting', {
                account: content.visitorAccid,
                type: 0
            });
            /**
             * @Description: 因为 isChatWithOther 不再使用, 所以把下面这段注释了
             * @author 汤一飞
             * @date 2020/5/13
             */
            // store.commit('updateChatWithOtherList', {
            //     account: content.visitorAccid,
            //     status: true
            // });
            /**
             * @Date: 2020-04-27 21:21:58
             * @LastEditors: niumkiki
             * @description: 转接访客后去掉访客正在输入中
             * @param :
             * @return:
             */
            store.commit('setVisitorInputContent', {
                visitorId: content.visitorId,
                inputContent: ''
            });
            store.commit('setDisableChat', {
                visitorId: content.visitorId,
                flag: true
            });
            store.state.ChatWithOtherTip = `${content.visitorName}游客正在和客服${content.receivedTransferServerName}聊天，不可访问`;
            store.dispatch('updateSessionList');
            Message.success(`${i18n.t('openBracket')}${content.visitorName}${i18n.t('chat.transferSuccessful')}`);
            // store.commit('confirmNotChatWithOther', false);
        }
        if (id == 203) {
            store.state.transferComfir = false;
            Message.success(`${i18n.t('openBracket')}${content.visitorName}${i18n.t('chat.transferFail')}`);
            // this.$Message.error(stroe.state.personList[content.visitorAccid].nick+'转接失败')
        }
    }
    // if (!Array.isArray(customSysMsgs)) {
    //   customSysMsgs = [customSysMsgs]
    // }
    // customSysMsgs = customSysMsgs.filter(msg => {
    //   if (msg.type === 'custom') {
    //     if (msg.content) {
    //       try {
    //         let content = JSON.parse(msg.content)
    //         // 消息正在输入中
    //         if ((content.id + '') === '1') {
    //           return false
    //         }
    //       } catch (e) {}
    //     }
    //   }
    //   return true
    // })
    // if (customSysMsgs.length > 0) {
    //   store.commit('updateCustomSysMsgs', customSysMsgs)
    // }
}

// 不传obj则全部重置
export function markSysMsgRead({ state, commit }, obj) {
    const nim = state.nim;
    let sysMsgs = [];
    if (obj && obj.sysMsgs) {
        sysMsgs = obj.sysMsgs;
    } else {
        sysMsgs = state.sysMsgs;
    }
    if (Array.isArray(sysMsgs) && sysMsgs.length > 0) {
        nim.markSysMsgRead({
            sysMsgs,
            done: function(error, obj) {
            }
        });
    }
}

export function markCustomSysMsgRead({ state, commit }) {
    commit('updateCustomSysMsgUnread', {
        type: 'reset'
    });
}

export function resetSysMsgs({ state, commit }, obj) {
    commit('resetSysMsgs', obj);
}

export function onPushEvents(param) {
    console.log('onPushEvents');
    console.log(JSON.stringify(param));

    /**
     * @Description: APP 端登录将 Web 端踢下线后, 不知道为啥, Web 端会收到 value: 10001 , account 为当前客服的通知, 导致此处执行并最终显示右下角通知"网站新访客${客服名称}"
     * 参考 https://doc.yunxin.163.com/docs/TM5MzM5Njk/DkyMDk5OTQ?platformId=60179#发布事件, 10001 应该是开发者(询盘云)自定义的状态, 但前后端 + App 端都说没做过这块儿
     * @author 汤一飞
     * @date 2021/12/7
     */
    let msgEvents = Array.isArray(param.msgEvents) ? param.msgEvents : [];
    msgEvents = msgEvents.filter(item => `${item.value}` !== '10001');

    if (msgEvents.length) {
        try {
            const revertMsg = _.cloneDeep(msgEvents);
            if (Array.isArray(revertMsg)) {
                let visitorOnlineStatus = _.cloneDeep(store.state.visitorOnlineStatus) || [];
                revertMsg.forEach(item => {
                    const ev = visitorOnlineStatus.filter(v => {
                        return v.account === item.account;
                    });
                    if (ev.length) {
                        for (let k = 0; k < visitorOnlineStatus.length; k++) {
                            if (item.account === visitorOnlineStatus[k].account) {
                                visitorOnlineStatus[k].serverConfig = item.serverConfig;
                                break;
                            }
                        }
                    } else {
                        visitorOnlineStatus.push(item);
                    }
                });
                visitorOnlineStatus = _.uniqBy(visitorOnlineStatus, 'account');
                store.commit('updateVisitorOnlineStatus', visitorOnlineStatus);
            }
        } catch (error) { console.log('%c visitorOnlineStatus', 'color: red', error); }

        if (store.state.isFirstInitSDK) {
            store.commit('updateIsFirstInitSDK', false);
            // 解决访客一直在线的bug
            // 初始化聊天时会有推送通知，需要拿到这些通知中访客的最近到达时间，如果不是当天就过滤掉
            // 但是这样也还是有问题，不能解决是当天到达但是已经离开却还一直在线的bug
            const acct_ids = [];
            const ids = msgEvents.map(item => {
                return item.account;
            });
            /**
             * @Description: 【ID1006956】访客聊过天后，一直没退出网页（超过24h），之后该访客二次聊天，客服这边只要刷新页面或者发生跳转，在线列表里就没有这个访客
             * @author 汤一飞
             * @date 2020/7/20
             */
            // 筛选出最后一条访客上下线订阅通知消息在最近 8 小时(和获取访客最近到达时间后进行的时间判断条件相同)内的访客 id
            const recentIds = msgEvents.filter(item => {
                if (item.time) {
                    return !timeInterval(item.time, 480);
                }
            }).map(item => item.account);

            // 根据acct_idd获取最近到达时间
            util.ajaxInternational({
                url: '/visitor-chat/server/getVisitorLeaveStatusByAcctIds',
                method: 'post',
                data: {
                    acctIds: ids.join(',')
                }
            }).then(response => {
                const unSubscribeAccounts = [];
                if (response.data.code === '1') {
                    const arr = response.data.data;
                    arr.map(item => {
                        const last_arrived_time = new Date(item.last_arrived_time).getTime();
                        // 最后一条访客上下线订阅通知消息在 8 小时以内, 或访客最近到达时间在 8 小时以内, 则订阅, 否则取消订阅
                        if (recentIds.includes(item.acct_id) || !timeInterval(last_arrived_time, 480)) {
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
                if (acct_ids.length > 0) {
                    msgEvents = msgEvents.filter(item => acct_ids.includes(item.account));
                    toPushEvents(msgEvents);
                }
            });
        } else {
            toPushEvents(msgEvents);
        }

        // function toPushEvents(Events) {
        //     for (let i = 0; i < Events.length; i++) {
        //         // //加上闭包
        //         // (function(j){
        //         let isLoopDone = false;
        //         if (i == Events.length - 1) {
        //             isLoopDone = true;
        //         }
        //         const msgEvent = Events[i];
        //         // store.dispatch('getUser',msgEvent)
        //         store.dispatch('getUser', {
        //             msgEvent: msgEvent,
        //             type: 1,
        //             isLoopDone: isLoopDone
        //         });
        //         // })(i);
        //     }
        // }

        function toPushEvents(msgEventList) {
            store.dispatch('getUsers', {
                accountList: msgEventList.map(evt => evt.account),
                msgEventList,
                type: 'onpushevents'
            });
        }
    }
}

export function updatePersonSubscribes({ state, commit }, data) {
    if (data.account) {
        const account = data.account;
        state.personSubscribes[account] = state.personSubscribes[account] || {};
        state.personSubscribes[account][data.type] = {
            account: data.account,
            type: data.type,
            value: data.value,
            custom: data.custom,
            clientType: data.clientType,
            serverConfig: data.serverConfig,
            time: data.time,
            // 多端状态
            multiPortStatus: '',
            multiPortStatus2: '',

            timeStamp: new Date().getTime()
        };
        const tempData = state.personSubscribes[account][data.type];

        function getMultiPortStatus(customType, custom) {
            let onlineStateTemp = 0;
            const netState = {
                0: '',
                1: 'Wifi',
                2: 'WWAN',
                3: '2G',
                4: '3G',
                5: '4G'
            };
            const onlineState = {
                0: '在线',
                1: '忙碌',
                2: '离开'
            };
            let multiPortStatus = '';
            var custom = custom || {};
            if (customType !== 0) {
                // 有serverConfig.online属性，已被赋值端名称
                custom = custom[customType];
            } else if (custom[4]) {
                custom = custom[4];
                multiPortStatus = '电脑';
            } else if (custom[2]) {
                custom = custom[2];
                multiPortStatus = 'iOS';
            } else if (custom[1]) {
                custom = custom[1];
                multiPortStatus = 'Android';
            } else if (custom[16]) {
                custom = custom[16];
                multiPortStatus = 'Web';
            } else if (custom[64]) {
                custom = custom[64];
                multiPortStatus = 'Mac';
            }
            if (custom) {
                custom = JSON.parse(custom);
                if (typeof custom.net_state === 'number') {
                    const tempNetState = netState[custom.net_state];
                    if (tempNetState) {
                        // multiPortStatus += ('-' + tempNetState)
                        multiPortStatus += (`[${tempNetState}]`);
                    }
                }
                if (typeof custom.online_state === 'number') {
                    multiPortStatus += onlineState[custom.online_state];
                    onlineStateTemp = custom.online_state;
                } else {
                    multiPortStatus += '在线';
                    onlineStateTemp = 0;
                }
            }
            const obj = {
                multiPortStatus: multiPortStatus,
                onlineStateTemp: onlineStateTemp
            };
            return obj;
        }

        // demo自定义多端登录同步事件
        if (Number(data.type) === 1) {
            if (Number(data.value) === 1 || Number(data.value) === 2 || Number(data.value) === 3 || Number(data.value) === 10001) {
                const serverConfig = JSON.parse(tempData.serverConfig);
                let customType = 0;
                tempData.multiPortStatus = '';
                // 优先判断serverConfig字段
                if (serverConfig.online) {
                    if (serverConfig.online.indexOf(4) >= 0) {
                        tempData.multiPortStatus = '电脑';
                        customType = 4;
                    } else if (serverConfig.online.indexOf(2) >= 0) {
                        tempData.multiPortStatus = 'iOS';
                        customType = 2;
                    } else if (serverConfig.online.indexOf(1) >= 0) {
                        tempData.multiPortStatus = 'Android';
                        customType = 1;
                    } else if (serverConfig.online.indexOf(16) >= 0) {
                        tempData.multiPortStatus = 'Web';
                        customType = 16;
                    } else if (serverConfig.online.indexOf(64) >= 0) {
                        tempData.multiPortStatus = 'Mac';
                        customType = 64;
                    }
                }
                if (tempData.custom && (Object.keys(tempData.custom).length > 0)) {
                    const portStatusObj = getMultiPortStatus(customType, tempData.custom);
                    const portStatus = portStatusObj.multiPortStatus;
                    // 如果serverConfig里有属性而custom里没有对应属性值
                    if ((tempData.multiPortStatus !== '') && (portStatus === '')) {
                        tempData.multiPortStatus += '在线';
                        tempData.multiPortStatus2 = 1;
                    } else {
                        tempData.multiPortStatus += portStatus;
                        tempData.multiPortStatus2 = portStatusObj.onlineStateTemp === 0 ? 1 : 3;
                    }
                } else if (customType !== 0) {
                    tempData.multiPortStatus += '在线';
                    tempData.multiPortStatus2 = 1;
                } else {
                    tempData.multiPortStatus = '离线';
                    tempData.multiPortStatus2 = 3;
                    store.commit('updataIsChatting', {
                        account: data.account,
                        type: 0
                    });
                }
            }
            /**
             * @Date: 2020-05-08 18:00:45
             * @LastEditors: niumkiki
             * @description: 如果该访客离线或者关闭单独一个标签，将其正在输入的状态设置为空
             * @param :
             * @return:
             */
            if (Number(data.value) === 3) {
                const visitorId = getVisitorId(data.account);
                store.commit('setVisitorInputContent', {
                    visitorId,
                    inputContent: ''
                });
            }
        }

        store.dispatch('updateSessionList');
        return true;
    }
    return false;
}

/* 更新会话列表 */
export function updateSessionList({ state, commit }, forceUpdate) {
    const onlineList = {};
    let offlineList = {};
    const chattingList = {};
    const offlineMsg = {};
    const offlineNoMsg = {};

    const sessions = state.personSubscribes;
    console.log('updateSessionList>sessions', sessions);
    if (isEmpty(sessions)) {
        return false;
    }
    // 第一次初始化聊天时过滤掉超过24小时一直在线游客
    /* if(state.isFirstInitSDK){
        let obj={}
        let arr=[]
        let accountToVisitorId={};
        let flag=0
        for (let account in sessions) {
            /!*过滤掉没有visitorId的会话 ？？？*!/
            let visitorId=getVisitorId(account)
            // console.log('visitorId', visitorId);
            if(visitorId){
                arr.push(visitorId);
                accountToVisitorId[visitorId]=account;
            }else{
                flag=1
            }
        }
        // console.log("arr== ",arr)
        // console.log("flag=="+flag)
        // if(flag===0){
            //根据visitorId获取最近到达时间
            util.ajaxInternational({
                url: '/server/getVisitorLeaveStatus',
                method: 'post',
                data: {
                    visitorIds:arr.join(',')
                }
            }).then(response => {
                let tempArr=[];
                if(response.data.code==='1'){
                    tempArr=response.data.data
                    let nowTime = Date.now();
                    for(let i=0;i<tempArr.length;i++){
                        let time1=(new Date(tempArr[i].last_arrived_time)).getTime()
                        let key=tempArr[i].visitor_id
                        if(nowTime-time1>86400000){
                            obj[key]=false
                        }else{
                            obj[key]=true
                        }
                    }
                }
                //state.updateListOrFilter=true,直接去更新列表；state.updateListOrFilter=false，列表已经被更新了，只对订阅对象做过滤
                if(state.updateListOrFilter){
                    for (let account in sessions) {
                        // console.log(account)
                        console.log('info111')
                        var info = personListInfo(sessions[account])
                        console.log('info111 done')
                        console.log(JSON.stringify(info))
                        if (info.isonline == 3) {
                            let offlineTime=info.msgTime?info.msgTime:info.pushEventTime
                            // if (info.msgTime) {
                            // 假如不超过24小时
                            // 显示在离线
                            if(info.msgTime){
                                // if (!timeInterval(info.time, 1440)) {
                                /!*是否为当天*!/
                                if (isToday(info.time)) {
                                    // console.log('offline',account);
                                    offlineMsg[account]=info;
                                    let unreadTemp=info.unread?info.unread:0;
                                    unread+=unreadTemp;
                                }
                            }
                            /!*                        else{
                                                        if (!timeInterval(info.time, 1440)) {
                                                            offlineNoMsg[account]=info
                                                            let unreadTemp=info.unread?info.unread:0;
                                                            unread+=unreadTemp;
                                                        }
                                                    }*!/
                            /!*!//假如有消息
                            if (info.msgTime) {
                                // 假如不超过600分钟
                                // 显示在离线
                                // if (!timeInterval(info.msgTime, 600)) {
                                if (!timeInterval(info.time, 600)) {
                                    offlineList.push(info)
                                }
                                // 假如没消息
                                // 不显示
                            }*!/

                            // 假如在线
                        } else {
                            if (store.state.isChatting[account] === 1) {
                                // 假如正在聊天
                                // 显示在正在聊天
                                console.log('chatting',account);
                                chattingList[account]=info;
                            } else  {
                                // 假如不是正在聊天
                                // 显示在访客
                                if(obj[info.visitorId]){
                                    console.log('online',account);
                                    onlineList[account]=info;
                                }else{
                                    delete state.personSubscribes[account]
                                }
                            }
                            let unreadTemp=info.unread?info.unread:0;
                            unread+=unreadTemp;
                        }
                    }
                    /!*离线列表：有消息+没有消息*!/
                    offlineList=offlineMsg;
                }else{
                    let nowTime = Date.now();
                    for(let i=0;i<tempArr.length;i++){
                        let time1=(new Date(tempArr[i].last_arrived_time)).getTime();
                        let key=tempArr[i].visitor_id
                        if(nowTime-time1>86400000){
                            let accountTemp = accountToVisitorId[key];
                            delete state.personSubscribes[accountTemp];
                        }
                    }
                }
            })
            commit('updateIsFirstInitSDK',false)
        // }

    } */
    // else{
    state.updateListOrFilter = false;
    for (const account in sessions) {
        const info = personListInfo(sessions[account]);
        console.log('updateSessionList>info', info);
        // 如果没有 visitorId , 不显示在聊天列表中
        if (!info.visitorId) {
            continue;
        }

        if (info.isonline == 3) {
            // 假如不在线

            // const offlineTime = info.msgTime ? info.msgTime : info.pushEventTime;
            // if (info.msgTime) {
            // 显示在离线

            // 假如有消息
            if (info.msgTime) {
                // 假如不超过24小时
                // if (!timeInterval(info.time, 1440)) {
                /* 是否为当天 */
                if (isToday(info.time)) {
                    // console.log('offline',account);
                    offlineMsg[account] = info;
                }
            } else {
                // 没聊过天直接走的，保留30分钟
                const Stamp = new Date().getTime();
                if (info.timeStamp >= Stamp - 30 * 60 * 1000) {
                    offlineMsg[account] = info;
                }
                /* if (isToday(info.time)) {
                        offlineNoMsg[account]=info;
                        let unreadTemp=info.unread?info.unread:0;
                        unread+=unreadTemp;
                    } */
            }
            // 假如没消息
            // 不显示
            // }

            // 假如在线
        } else {
            if (store.state.isChatting[account] === 1) {
                // 假如正在聊天
                // 显示在正在聊天
                // console.log('chatting',account);
                chattingList[account] = info;
            } else {
                // 假如不是正在聊天
                // 显示在访客
                // console.log('online',account);
                onlineList[account] = info;
            }
        }
    }
    /* 离线列表：有消息+没有消息 */
    offlineList = offlineMsg;
    // }

    /**
     * @Description: 从 localStorage 中取/更新 offlineList , 来保证刷新后之前未聊过天的离线访客能正常显示在左侧列表
     * @author 汤一飞
     * @date 2020/5/23
     */
    // 从 localStorage 获取之前存入的 offlineList
    let xhl_offlineList;
    try {
        xhl_offlineList = JSON.parse(localStorage.getItem('xhl_offlineList')) || {};
    } catch (e) {
        xhl_offlineList = {};
    }
    // 处理当前 AccId 的 offlineList
    if (xhl_offlineList[state.AccId]) {
        // 过滤掉不应再保存的 offline 数据
        const result = {};
        Object.entries(xhl_offlineList[state.AccId]).forEach(([account, valObj]) => {
            // 已存在 chattingList 和 onlineList 中的去掉
            if (chattingList[account] || onlineList[account]) {
                return;
            }
            // 过滤
            // 假如有消息
            if (valObj.msgTime) {
                // 是否为当天
                if (isToday(valObj.time)) {
                    result[account] = valObj;
                }
            } else {
                // 没聊过天直接走的，保留30分钟
                if (valObj.timeStamp >= Date.now() - 30 * 60 * 1000) {
                    result[account] = valObj;
                }
            }
        });
        // 过滤结果和实际的 offlineList 合并, 再赋值给 offlineList;
        offlineList = Object.assign(result, offlineList);
        // 更新 offlineList 到 localStorage
        xhl_offlineList[state.AccId] = offlineList;
    } else {
        // 更新 offlineList 到 localStorage
        xhl_offlineList[state.AccId] = offlineList;
    }
    // 重新存入 localStorage
    localStorage.setItem('xhl_offlineList', JSON.stringify(xhl_offlineList));

    commit('updateVisitorSessionList', {
        chattingList: chattingList,
        onlineList: onlineList,
        offlineList: offlineList,
        forceUpdate
    });
}

function personListInfo(data) {
    const info = {};
    info.scene = 'p2p';

    const session = data.session || {};
    const pushEvent = data[1] || {};
    /* 如果两个对象都不为空 */
    if (!isEmpty(session.lastMsg) && !isEmpty(pushEvent)) {
        var msg = session.lastMsg;
        info.target = `${info.scene}-${msg.target}`;
        // info.crtSession = this.crtSession
        info.account = msg.target;
        //                    info.time = transTime2(msg.time)
        info.visitorId = getVisitorId(info.account);
        info.time = msg.time;
        info.msgTime = Utils.formatDate(msg.time, false);
        info.text = getLastMsg(msg);
        info.type = msg.type;
        info.pushEventTime = parseInt(pushEvent.time);
        info.unread = session.unread;
        // info.text = buildSessionMsg(msg)
        info.nick = getNick(info.account);
        info.sign = getSign(info.account);
        info.isBlack = isBlack(info.account);
        info.isonline = pushEvent.multiPortStatus2;
    } else {
        if (!isEmpty(pushEvent)) {
            info.isonline = pushEvent.multiPortStatus2;
            info.account = pushEvent.account;
            info.target = `${info.scene}-${pushEvent.account}`;
            info.visitorId = getVisitorId(info.account);
            info.time = pushEvent.time;
            // info.crtSession = this.crtSession
            info.pushEventTime = parseInt(pushEvent.time);
            info.nick = getNick(info.account);
            info.sign = getSign(info.account);
            info.isBlack = isBlack(info.account);
            info.text = null;
            info.type = '';

            info.timeStamp = pushEvent.timeStamp;
        }
        if (!isEmpty(session.lastMsg)) {
            var msg = session.lastMsg;
            info.isonline = 3;
            info.target = `${info.scene}-${msg.target}`;
            // info.crtSession = this.crtSession
            info.account = msg.target;
            info.visitorId = getVisitorId(info.account);
            info.time = msg.time;
            info.msgTime = Utils.formatDate(msg.time, false);
            info.text = getLastMsg(msg);
            info.type = msg.type;
            info.pushEventTime = parseInt(pushEvent.time);
            info.unread = session.unread;
            info.nick = getNick(info.account);
            info.sign = getSign(info.account);
            info.isBlack = isBlack(info.account);
        }
    }
    return info;
}

function getLastMsg(msg) {
    switch (msg.type) {
        case 'text':
            return msg.text;
        case 'image':
            return i18n.t('whatsapp_manage.imageType');
        case 'file':
            return i18n.t('whatsapp_manage.fileType');
        default:
            return '';
    }
}

function getSign(account) {
    let tmp = '';
    if (store.state.personList[account]) {
        tmp = store.state.personList[account].sign;
    }
    return tmp;
}

function getNick(account) {
    let nick;
    let tmp;
    if (store.state.personList[account]) {
        tmp = store.state.personList[account];
    }
    nick = tmp && tmp.nick ? tmp.nick : account;
    return nick;
}

function isBlack(account) {
    const blackList = store.state.blacklist;
    let flag = false;
    for (let i = 0; i < blackList.length; i++) {
        if (account === blackList[i].account) {
            flag = true;
        }
    }
    return flag;
}

function isToday(time) {
    time = time - 0; // 转为数字
    if (new Date(time).toDateString() === new Date().toDateString()) {
        // 今天
        return true;
    } else {
        // 之前
        return false;
    }
}

// 从 personList[i].custom 中获取 visitorId
// export function getVisitorId(account) {
//     let result = null;
//
//     // 从 personList 用户信息中, 游客端添加的 custom 信息中取 visitorId
//     if (store.state.personList[account]) {
//         const tmp = store.state.personList[account].custom;
//         // bug：如果不小心订阅到其他客服custom有可能不是对象，JSON.parse就会报异常
//         if (tmp) {
//             try {
//                 const obj = JSON.parse(tmp);
//                 result = obj.visitorId;
//             } catch (err) {
//                 console.log('err', err, tmp);
//             }
//         } else {
//             console.log(`custom no tmp= ${store.state.personList[account].custom}`);
//         }
//     }
//
//     // 如果没取到, 再试着从 personTrackList 轨迹信息中, 游客端添加的用户基本信息中取 visitorId
//     if (!result) {
//         let info = store.state.personTrackList[account];
//
//         if (info && info.content) {
//             try {
//                 info = JSON.parse(info.content);
//                 if (info.xUserInfo && info.xUserInfo.baseinfo) {
//                     result = info.xUserInfo.baseinfo.visitorId;
//                 }
//             } catch (err) {
//                 console.log('err track', err, info.content);
//             }
//         }
//     }
//
//     return result;
// }

// 从 personList[i] 中直接取 visitorId
export function getVisitorId(account) {
    let result = null;

    // 从 personList 用户信息中, 游客端添加的 custom 信息中取 visitorId
    if (store.state.personList[account]) {
        const visitorId = store.state.personList[account].visitorId;

        if (visitorId) {
            result = visitorId;
        } else {
            console.error('未从 personList 中获取到 visitorId, ', store.state.personList[account]);
        }
    }

    return result;
}

function isEmpty(obj) {
    for (const name in obj) {
        return false;
    }
    return true;
}

function timeInterval(time, interval) {
    const nowDate = new Date();
    const check = nowDate.getTime();
    if (time <= check - 1000 * 60 * interval) {
        return true;
    } else {
        return false;
    }
}
