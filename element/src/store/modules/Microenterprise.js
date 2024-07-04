
import i18n from '@/locale';
import { router } from '@/router/index';
// import { Notification } from 'element-ui';

export default {
    state: {
        unReadMsgCount: 0 // 企微未读消息数量
    },
    mutations: {
        setUnReadMsgCount(state, data) {
            if (data) {
                state.unReadMsgCount = data.private + data.chatroom;
            }
            // console.log(state.unReadMsgCount,'企业微信未读消息数量');
        },
        setUnReadMsgCountAll(state, data) {
            state.unReadMsgCount = data;
        }
    },
    getters: {},
    actions: {
        receiveWSMsg_MicroQW({ state, commit, dispatch, rootState }, data) {
            // console.log(router, 'dksksks');
            // state.unReadMsgCount++;
            // console.log(data);
            commit('setUnReadMsgCount', data.unreadCount);
            // data.data.from 为空的时候 代表只是未读消息变化
            if (!data.data.from) return;
            let content = '';
            switch (data.data.type) {
                case '2':
                    content = '[图片]'
                    break;
                case '3':
                    content = '[文件]'
                    break;   
                case '4':
                    content = '[视频]'
                    break;   
                case '5':
                    content = '[链接]'
                    break;   
                case '6':
                    content = '[图片]';
                    break;   
                case '7':
                    content = '[名片]';
                    break;   
                case '8':
                    content = '[小程序]';
                    break;  
                case '9':
                    content = '[语音]';
                    break; 
                case '10':
                    content = '[视频号]';
                    break;  
                case '10000':
                    content = '[系统消息]';
                    break;
                default:
                    content = data.data.content;
                    break;
            }
            if (data.data.isChatroom) {
                // * 0=不是群聊 1=是群聊
                dispatch('otherNotice', {
                    originalObj: data,
                    fromNick: data.data.toName,
                    text: `${data.data.fromName}: ${content}`,
                    tip: i18n.t('menu.whatsapp_microenterprise2'),
                    type: data.data.type,
                    url: router.resolve({
                        name: 'whatsapp_microenterprise'
                    }).href+`?chatType=1&hisName=${encodeURI(data.data.chatroomName)}&toQwAccount=${data.data.to}&userBindQwAccount=${data.data.userBindWxid}`,
                    currentPath: router.currentRoute.name
                });
            } else {
                dispatch('otherNotice', {
                    originalObj: data,
                    fromNick: data.data.fromName,
                    text: content,
                    tip: i18n.t('menu.whatsapp_microenterprise2'),
                    type: data.data.type,
                    url: router.resolve({
                        name: 'whatsapp_microenterprise'
                    }).href+`?chatType=0&hisName=${encodeURI(data.data.fromName)}&toQwAccount=${data.data.from}&userBindQwAccount=${data.data.userBindWxid}`,
                    currentPath: router.currentRoute.name
                });
            }
        }
    }
};
