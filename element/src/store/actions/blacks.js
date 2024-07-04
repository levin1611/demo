/*
 * 黑名单及静音列表
 */

import store from '../';
import i18n from '@/locale';
import { Message } from 'element-ui';

// 完成添加/删除黑名单，初始化获取黑名单列表，都会触发此函数
export function onBlacklist(blacks) {
    blacks = blacks.map(item => {
        if (typeof item.isBlack !== 'boolean') {
            item.isBlack = true;
        }
        return item;
    });
    console.log('blacks111');
    console.log(blacks);
    // 更新黑名单列表
    store.commit('updateBlacklist', blacks);
    // 在好友身上打上标记
    store.commit('updateFriends', blacks);
    // 更新好友信息字典
    store.commit('updateUserInfo', blacks);

    store.dispatch('updateSessionList');
}

export function onMarkInBlacklist(obj) {
    obj = obj || obj2;
    let account = obj.account;
    // 说明是自己，被别人加入黑名单
    if (account === store.state.userUID) {

    } else {
        // 说明是别人的帐号，黑名单通知
        if (typeof obj.isAdd === 'boolean') {
            onBlacklist([{
                account,
                isBlack: obj.isAdd
            }]);
        }
    }
}

export function updateBlack({ state }, { account, nick, isBlack }) {
    const nim = state.nim;
    if (account && (typeof isBlack === 'boolean')) {
        nim.markInBlacklist({
            account,
            // `true`表示加入黑名单, `false`表示从黑名单移除
            isAdd: isBlack,
            done: function(error, obj) {
                if (error) {
                    console.error(error);
                    if (isBlack) {
                        Message.error(`${i18n.t('chat.error_shield1')}${nick}${i18n.t('chat.error_shield2')}`);
                    } else {
                        Message.error(`${i18n.t('chat.error_cancelShield1')}${nick}${i18n.t('chat.error_cancelShield2')}`);
                    }
                    return;
                }
                state.isShowAddBlackModal = false;
                if (isBlack) {
                    Message.success(`${i18n.t('openBracket')}${nick}${i18n.t('chat.success_shield')}`);
                } else {
                    Message.success(`${i18n.t('openBracket')}${nick}${i18n.t('chat.success_cancelShield')}`);
                }
                console.log(`blackObj= ${obj}`);
                onMarkInBlacklist(obj);
            }
        });
    }
}
