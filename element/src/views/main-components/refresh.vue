<template>

</template>

<script>
    import util from '@/libs/util';
    import Cookies from 'js-cookie';
    import store from '@/store';
    import { getQueryString } from '@/utils/dynamicDatas.js';

    export default {
        name: 'refresh',
        beforeRouteEnter(to, from, next) {
            try {
                // 获取 wa 扫码登录 uuid
                const waLoginUuid = getQueryString('waLoginUuid');

                if (waLoginUuid) {
                    // 如果存在此数据, 说明是从 wa 个人版登录页扫码后跳转到此页面, 下面处理 wa 个人版登录逻辑

                    // 相关方法定义
                    // 处理登录成功后的 cookie 和部分 vuex 逻辑, 处理完毕后才离开 refresh , 进入到真正的页面, 内容取自 login 页面
                    const handleWALoginSuccessCookie = (userData) => {
                        /* 把 login-wa 个人版里的相关操作转移过来 - 开始 */
                        // 个人版登录页都已经不和询盘云在同一个域下了, localStorage, cookies , vuex 处理都要移到 admin 的 refresh 下来

                        // 去掉"Google / Facebook 账号绑定失效 tip 已关闭"信息
                        localStorage.removeItem('invalidMsgClosed');

                        store.commit('updateIsModeRead', true);

                        // 清除 localStorage 中的"当前已打开标签页数组"
                        store.commit('clearTimerUpdateSeq');
                        localStorage.removeItem('openedWindowList');
                        // 清除本地保存的邮件接口请求判断数据
                        localStorage.removeItem('XHLMailUrl');

                        // 清空"新收邮件未读数统计数据"
                        store.commit('updateNewReceiveMails', {
                            type: 'clear'
                        });

                        // 清除"意外退出到登录界面"相关信息 --- 跳转到 wa 个人版登录页时取不到这些数据, 个人版不提示意外退出信息, refresh 页面也不好提示, 只能先去掉这部分 localStorage
                        localStorage.removeItem('quitUnexpectedlyMsg');
                        localStorage.removeItem('quitUnexpectedlyReason');
                        /* 结束 - 把 login-wa 个人版里的相关操作转移过来 */

                        store.commit('setVersion', 'WAPersonalEdition');
                        Cookies.set('leadsCloudVersion', 'WAPersonalEdition');
                        /**
                         * @Description: bug描述：切换账号登陆，查看下属邮件记忆了上个账号勾选的内容 --【ID1006234】
                         *              Bug原因：退出账号时，存储在vuex中的数据未重置完成
                         *              解决方案：账号登录成功时，将该值置为初始值。
                         * @author 杨娣
                         * @date 2020/6/6
                         */
                        store.commit('setCurrentAccountIds', []);
                        localStorage.removeItem('leadsCloud-globalSearchKeyWords');

                        // 如果登陆的账号有超管权限,添加超管权限到localStorage
                        if (userData.superAdmin) {
                            localStorage.setItem('isSuperAdmin', Boolean(userData.superAdmin));
                        }

                        store.state.app.pageOpenedList = [];

                        // 删除旧有所有 domain 的 cookie (admin.leadscloud.com, .leadscloud.com 有时会同时存在, 删除时只删除了一个后会出现问题)
                        const tmpDomainArr = document.domain.split('.');
                        for (let i = 0; tmpDomainArr.length >= 2; i++) {
                            const attrs = {
                                domain: `${i === 0 ? '' : '.'}${tmpDomainArr.join('.')}`
                            };
                            tmpDomainArr.shift();

                            Cookies.remove('accId', attrs);
                            Cookies.remove('token', attrs);
                            Cookies.remove('fullName', attrs);
                            Cookies.remove('userName', attrs);
                            Cookies.remove('userId', attrs);
                            Cookies.remove('agentOrgList', attrs);
                            Cookies.remove('enterpriseId', attrs);
                            Cookies.remove('initMenu', attrs);
                            Cookies.remove('relatedAccounts', attrs);
                            Cookies.remove('notChatWithOther', attrs);
                        }
                        // 设置 cookie
                        Cookies.set('accId', userData.accId);
                        Cookies.set('token', userData.token);
                        Cookies.set('fullName', encodeURI(userData.fullName));
                        Cookies.set('userName', userData.userName);
                        Cookies.set('userId', userData.userId);
                        Cookies.set('agentOrgList', userData.agentOrgList);
                        Cookies.set('enterpriseId', userData.orgId);
                        // 设置关联账号
                        Cookies.set('relatedAccounts', Array.isArray(userData.relatedOrgList) ? userData.relatedOrgList : []);

                        store.commit('setUserName', userData.userName);
                        store.commit('setFullName', userData.fullName);
                        store.commit('setUserId', {
                            userId: userData.userId,
                            accId: userData.accId
                        });
                        store.commit('setEnterpriseId', userData.orgId);
                        store.commit('setRelatedAccounts', Array.isArray(userData.relatedOrgList) ? userData.relatedOrgList : []);

                        localStorage.setItem('XHLLogin', 'LOGIN');

                        // 初始化聊天相关
                        store.state.personSubscribes = {};
                        store.state.isServerOnlineChecked = false;
                    };
                    const serverLogin = (enterpriseId, accid, token, serviceName, userType) => {
                        util.ajaxInternational({
                            url: '/server/serverLogin',
                            method: 'POST',
                            data: {
                                enterpriseId: enterpriseId,
                                accid: accid,
                                token: token,
                                serviceName: serviceName,
                                userType: userType
                            }
                        });
                    };
                    // 获取权限目录
                    const getMenu = (userId, enterpriseId, next) => {
                        util.ajax({
                            url: 'new-privilege/resource/getMenu',
                            method: 'GET',
                            params: {
                                userId: userId,
                                orgId: enterpriseId
                            }
                        }).then(({ data }) => {
                            if (data.code === '1') {
                                // 避免重复请求
                                Cookies.set('initMenu', '0');

                                // 处理原始数据, 更新 vuex menuList (平铺数组), 更新 vuex roleMenu (原始数据)并存入 localStorage , 更新 vuex router_map (添加动态路由 + 给左侧目录使用)
                                store.commit('set_menu_list', data.data.menuList);
                            } else {
                                alert('获取目录出错! 请重新扫码登录');
                            }

                            // 跳转到 wa
                            const homeName = 'whatsapp_chat';
                            next(vm => {
                                vm.$router.replace({
                                    name: homeName
                                });
                            });
                            store.commit('setHomeName', homeName);
                            Cookies.set('HOMEPAGE', homeName);
                        });
                    };
                    // 获取权限按钮 --- 因为 Main.vue 里有 getButtons , 这里为了减少请求, 去掉了按钮接口请求, 直接从 localStorage 中取
                    const getButtons = (userId, enterpriseId) => {
                        let buttonList;
                        try {
                            buttonList = JSON.parse(localStorage.getItem('BUTTONS'));
                        } catch (e) {
                        }
                        if (buttonList) {
                            store.commit('set_button_list', buttonList);
                        }
                    };

                    // 发送请求以便后端 set-cookie + 接口返回登录数据后前端做相应处理
                    util.ajaxWA({
                        url: '/whatsapp/person/setCookiesByJavaScript',
                        method: 'get',
                        params: {
                            tempId: waLoginUuid
                        }
                    }).then(({ data }) => {
                        // 先把 cookie 种上, 避免接口请求报错
                        handleWALoginSuccessCookie(data);

                        // 调用原登录逻辑中剩下的需要接口请求的方法 --- refresh 本身就在 Main.vue 中, 所以 Main.vue 的有调用的方法它不需要再次调用
                        serverLogin(data.orgId, data.accId, data.token, data.fullName, data.canChat);
                        getMenu(data.userId, data.orgId, next);
                        getButtons();
                    });
                } else {
                    // 不存在此数据, 则走本身 "refresh" 的逻辑 --- 做中转页跳转到指定页面 或 刷新当前页
                    const name = to.params.name || from.name;
                    if (name) {
                        next(vm => {
                            vm.$router.replace({
                                name: name,
                                params: to.params
                            });
                        });
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    };
</script>

<style scoped>

</style>
