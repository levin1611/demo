import { defineStore } from 'pinia';

export const useLocalStore = defineStore('local', {
    // 开启持久化
    persist: {
        enabled: true
    },
    state: () => {
        return {
            lang: 'zh-CN'
        };
    },
    getters: {},
    actions: {
        setLang(lang) {
            this.lang = lang ? lang : '';
        }
    }
});