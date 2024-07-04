export default {
    state: {
    },
    mutations: {
        /* 设置当前绑定数据的原始索引 */
        // setCurrentIndex(state, data) {
        //   state.currentIndex = data;
        // },

    },
    actions: {

        /* 初始化表格数据 */
        isEmptyObject(context, obj) { /* 判断一个对象是否为空 */
            for (let key in obj) {
                return false;
            }
            ;
            return true;
        }
    },
    getters: {}
};
