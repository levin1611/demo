// AI 微前端模块, 基座相关 Vuex
const ai = {
    state: {
        sceneSetPageVisible: false
    },
    mutations: {
        // 子应用编辑场景设置时触发此变量 阻止主应用的路由跳转
        setSceneSetPageVisible(state, data) {
            state.sceneSetPageVisible = data;
        }
    },
    getters: {
    },
    actions: {
    }
};

export default ai;
