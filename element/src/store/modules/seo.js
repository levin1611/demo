const seo = {
    state: {
        switchComponent: 'seo-list', // 切换组件
        subjectId: null, // 主题id
        subSubjectId: null, // 子主题id
        subjectDate: [], // 用于筛选BI数据的时间
    },
    mutations: {
        setSwitchComponent(state, data) {
            state.switchComponent = data;
        },
        setSubjectId(state, data) {
            state.subjectId = data;
        },
        setSubSubjectId(state, data) {
            state.subSubjectId = data;
        },
        setSubjectDate(state, data) {
            state.subjectDate = data;
        }
    }
};
export default seo;
