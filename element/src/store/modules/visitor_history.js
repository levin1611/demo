export default {
    namespaced: true,
    state: {
        // 状态更新的网站访客历史 id
        updatedId: null
    },
    mutations: {
        // 更新 updatedId
        setUpdatedId(state, val) {
            state.updatedId = val;
        }
    },
    actions: {
    },
    getters: {}
};
