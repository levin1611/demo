import Cookies from 'js-cookie';
import { userLoginForOrg } from '@/api/login';
import actions from '@/micros/actions.js';
import { useUserStore } from '@/pinia/modules/user';
const store = useUserStore();
export function loginSuccess(item, accountData, callback) {
    userLoginForOrg({
        orgId: item.orgId,
        userId: item.userId,
        larkId: item.larkId,
        accountToken: accountData.accountToken
    }).then(res => {
        if (res.code === 10000) {
            console.log(res.data);
            Cookies.set('accessToken', res.data.accessToken);
            Cookies.set('accountToken', res.data.accountToken);
            Cookies.set('token', res.data.accessToken);
            Cookies.set('refreshToken', res.data.refreshToken);
            Cookies.set('userId', item.userId);
            Cookies.set('enterpriseId', item.orgId);
            localStorage.setItem('current_tenant', JSON.stringify(item));
            localStorage.setItem('xhl_account_data', JSON.stringify(accountData));
            // Cookies.set('HOMEPAGE', 'myCustomer');
            callback();
            // 设置全局变量到状态管理器中
            store.$patch({
                orgId: item.orgId,
                userId: item.userId,
                accessToken: res.data.accessToken,
                larkId: item.larkId
            });
            actions.setGlobalState({
                globalUserInfo: {
                    userName: item.nickName,
                    fullName: item.nickName,
                    userId: item.userId,
                    accId: '',
                    orgId: item.orgId
                }
            });
            console.log('保存公共信息到store中', store.orgId);
        } else {
            ElMessage.error(code.message);
        }
    });
}

export function setGlobalState(data) {
    actions.setGlobalState(data);
}