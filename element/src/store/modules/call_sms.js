import { router } from '@/router/index';
import Vue from 'vue';
import i18n from '@/locale';

const callingSms = {
    state: {
        createdUserNotMe: false,
        smsNickName: null,
        callSmsScoketMsg: null
    },
    mutations: {
        setCreatedUserNotMe(state, data) {
            state.createdUserNotMe = data;
        },
        setSmsNickName(state, data) {
            state.smsNickName = data;
        },
        setCallSmSMsg(state, data) {
            state.callSmsScoketMsg = data;
        }
    },
    actions: {
        receiveWSMsg_CallSms({ state, commit, dispatch, rootState }, data) {
        
            const messageFromWS = data.data;
            console.log('收到通话短信消息', data,messageFromWS.from);
            if (!messageFromWS.fromMe) {
                if (messageFromWS.type == 2) {
                    // 0 未知 1结束  2 拒绝 3繁忙 4 未应答 5取消 6放弃 7 未送达 8 通话失败
                    if(messageFromWS.closePop == 1) {
                        //  如果closepop存在等于1就不更新 callsmsmsg字段 需求如此
                        console.log('关闭通话短信右侧messageFromWS.closePop');
                        Vue.prototype.$EVENTBUS.$emit('toggcloseDetail');
                        return false;
                    } 
                    if (messageFromWS.messageStatus == -1 && messageFromWS.from) {
                        // -1就是通话开始 直接打开右侧通话通知
                        console.log('打开通话短信消息弹窗')
                        Vue.prototype.$EVENTBUS.$emit('toggleViewCallingSmsCallingdetail', messageFromWS);
                    } else {
                        console.log('关闭通话短信右侧通知');
                        Vue.prototype.$EVENTBUS.$emit('toggcloseDetail')
                    }
                    // 右上角侧滑通知
                } else if (messageFromWS.type == 1) {
                    // 浏览器通知
                    dispatch('otherNotice', {
                        originalObj: data,
                        fromNick: data.data.fromName || messageFromWS.from,
                        text: messageFromWS.content,
                        tip: i18n.t('crm.WorkBench.Message'),
                        url: `${router.resolve({
                            name: 'calling_sms'
                        }).href}?from=${messageFromWS.to}&to=${messageFromWS.from}`,
                        currentPath: router.currentRoute.name
                    });
                }
            }
            commit('setCallSmSMsg', data);
        }
    }
};

export default callingSms;
