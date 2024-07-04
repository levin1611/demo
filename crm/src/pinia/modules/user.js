import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    // 开启持久化
    persist: {
        enabled: true
    },
    state: () => {
        return {
            orgId: 10166,
            userId: 70270,
            accessToken: '',
            larkId: ''
        };
    },
    getters: {},
    actions: {
        setOrgId(orgId) {
            this.orgId = orgId ? orgId : '';
        },
        setUserId(userId) {
            this.userId = userId ? userId : '';
        },
        setAccessToken(accessToken) {
            this.accessToken = accessToken ? accessToken : '';
        },
        setLarkId(larkId) {
            this.larkId = larkId ? larkId : '';
        }
    }
});