import { initGlobalState } from 'qiankun';
import Vue from 'vue';
import store from '../store';
import { router } from '@/router/index';

export const initialState = {
    globalStateNewMailData: {},
    globalUserInfo: {
        userId: store.state.userId,
        orgId: store.state.enterpriseId,
        fullName: store.state.fullName
    },
    // 预览文件
    pdfParams: {
        visible: true, // 显示隐藏文件预览组件
        file: {
            name: '', // 文件名称
            url: '', // 文件链接
            type: '', // 文件类型
            id: 0 // 文件id
        }
    },
    // 子应用进入/退出编辑状态
    editingState: {
        value: false, // 必填 进入/退出
        proj: '', // 子应用名称
        triggerCompo: '', // 触发状态变更的组件名称
        evtType: '', // 触发状态变更的事件类型, 目前只有 leaveConfirm
        beforeLeaveCb: null // 编辑状态下, 基座路由跳转时要执行的 callback
    },
    openWaReplayModal: {
        waAccount: '', // wa号码
        time: ''
    },
    openSendMailModal: {
        visible: '',
        rowData: {},
        time: ''
    }
}; // 全局状态池给了个默认值
const actions = initGlobalState(initialState);

actions.onGlobalStateChange((value, prev) => {
    for (const key in value) {
        // 值未变化, 不做处理
        if (JSON.stringify(value[key]) === JSON.stringify(prev[key])) {
            continue;
        }

        // 更新原始数据
        initialState[key] = value[key];

        if (key === 'globalUserInfo') {
            store.commit('setUserName', value[key].userName);
            store.commit('setFullName', value[key].fullName);
            store.commit('setUserId', {
                userId: value[key].userId,
                accId: value[key].accId
            });
            store.commit('setEnterpriseId', value[key].orgId);
        }
        if(key === 'pdfParams') {
            console.log('展示pdf预览');
            // 预览组件
            store.commit('showFilePreview', value[key].visible);
            // 将文件列表存到vuex
            store.commit('firstFileId', null);
            // 将parentId到vuex
            store.commit('setFollowUpFile', value[key].file);
        }

        if(key === 'openWaReplayModal') {
            // 打开wa快速回复框
            store.commit('updateGlobalWaReplyModal', {
                talkObj: {
                    contactsName: '',
                    eventCustomVar: {
                        toWaAccount: value[key].waAccount,
                        userBindWaAccount: ''
                    }
                }
            });
        }
        if(key === 'openSendMailModal') {
            const emails = [{
                receiverName: value[key].rowData.name,
                receiveMailAddress: value[key].rowData.email,
                followUpId: value[key].rowData.auto_column_id,
                fromClue: 1
            }];
            localStorage.setItem('leadsCloud-sendMail-contacts', JSON.stringify(emails));
            // 打开wa快速回复框
            store.commit('setQuickSendMailVisible', true);
        }
        // 子应用进入/退出编辑状态
        if (key === 'editingState') {
            if (value[key].value) {
                // 进入编辑状态

                // 离开确认弹框取消离开
                if (value[key].evtType === 'leaveCancel') {
                    // 清空暂存跳转信息
                    store.commit('setJumpingRouterInfo', null);
                }
            } else {
                // 退出编辑状态

                // 通过点击离开确认弹框退出
                if (value[key].evtType === 'leaveConfirm') {
                    // 如果有暂存跳转信息 + 与当前路由不同, 执行跳转
                    if (store.state.jumpingRouterInfo && store.state.jumpingRouterInfo.name !== router.currentRoute.name) {
                        router.push(store.state.jumpingRouterInfo);
                    }
                }

                // 清空暂存跳转信息
                store.commit('setJumpingRouterInfo', null);
            }
        }
    }
});

window.addEventListener('message', (e) => {
    // 这里处理 onGlobalStateChange 监听不到的变化 比如 子应用在iframe中
    let data = e.data;
    if(data) {
        if(data.type) {
            switch (data.type) {
                case "pdfParams":
                    console.log('message展示pdf预览');
                    // 预览组件
                    store.commit('showFilePreview', data.content.visible);
                    // 将文件列表存到vuex
                    store.commit('firstFileId', null);
                    // 将parentId到vuex
                    store.commit('setFollowUpFile',data.content.file);
                    break;
            }
        }
    }
})

// Vue.prototype.$onGlobalStateChange = actions.onGlobalStateChange;
Vue.prototype.$setGlobalState = actions.setGlobalState;
// 子应用使用方式
// 子应用初始化时
// export async function mount(props) {
//     Vue.prototype.$setGlobalState = actions.setGlobalState;
//     props.onGlobalStateChange((value, prev) => {
//         console.log('主应用传过来的', value, prev);
//         实际需求代码
//     }, true);
//     render(props);
// }
// 组件中修改
// this.$setGlobalState({
//     globalStateNewMailData: {},
//     globalUserInfo: {
//         userId: this.userId,
//         orgId: this.enterpriseId,
//         fullName: this.fullName
//     }
// });
export default actions;
