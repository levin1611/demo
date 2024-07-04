import util from '@/libs/util';
import i18n from '@/locale';

export default {
    namespaced: true,
    state: {
        // 所有网站留言列表
        formList: [],
        // 状态更新的网站留言 id
        updatedId: null
    },
    mutations: {
        // 更新表单列表
        updateFormList(state, list) {
            state.formList = list.slice();
        },
        // 更新 updatedId
        setUpdatedId(state, val) {
            state.updatedId = val;
        }
    },
    actions: {
        // 获取所有表单及表单下未处理留言数
        getFormList({ state, rootState }) {
            // 获取未处理数
            const p1 = new Promise((resolve, reject) => {
                util.ajax({
                    url: '/form-cust/form/getUnprocessedFormValue',
                    method: 'post',
                    data: {
                        orgId: rootState.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        resolve(response.data);
                    } else {
                        resolve(false);
                    }
                }).catch(() => {
                    resolve(false);
                });
            });

            // 获取表单列表
            const p2 = new Promise((resolve, reject) => {
                util.ajax({
                    url: '/form-cust/template/getFormTemplateSortedList',
                    method: 'post',
                    data: {
                        billType: 1,
                        status: -1,
                        orgId: rootState.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        resolve(response.data);
                    } else {
                        resolve(false);
                    }
                }).catch(() => {
                    resolve(false);
                });
            });

            // 拼接处理数据
            Promise.all([p1, p2]).then((result) => {
                if (result.every(item => item)) {
                    const countToForm = result[0].data;
                    state.formList = result[1].data.filter(item => {
                        if (item.cateType !== 1) {
                            item.count = countToForm[item.id] ? parseInt(countToForm[item.id]) : 0;
                            return item;
                        }
                    });
                }
            });
        },
        // 处理 websocket 推送过来的关于网站留言的消息
        receiveWSMsg_webMsg({ rootGetters, dispatch }, msgData) {
            // 网站表单相关

            // 如果有网站留言列表, 更新表单未读数列表 + 弹出提示
            if (rootGetters.isContainsMenu('website_message')) {
                dispatch('getFormList');

                // 注意: 此 module 带命名空间(namespaced: true), 此处它调全局 action 需要加上 { root: true }
                dispatch('otherNotice', {
                    originalObj: msgData,
                    fromNick: i18n.t('main.noticeNick2'),
                    text: msgData.message,
                    tip: i18n.t('main.noticeType4'),
                    type: 2
                }, { root: true });
            }
        }
    }
};
