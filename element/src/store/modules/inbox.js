const inbox = {
    state: {
        currentPageAvatar: '', // 选中公共主页头像
        isSetStatus: '', // 选中私信状态
        commentStatus: '' // 选中评论状态

    },
    mutations: {
        setCurrentPageAvatar(state, data) {
            state.currentPageAvatar = data;
        },
        setIsSetStatus(state, data) {
            state.isSetStatus = data;
        },
        setCommentStatus(state, data) {
            state.commentStatus = data;
        }
    }
};
export default inbox;
