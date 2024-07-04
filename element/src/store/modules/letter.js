const letter = {
    state: {
        actionType: '',
        editingId: null
    },
    mutations: {
        setActionType(state, data) {
            state.actionType = data;
        },
        setEditingId(state, data) {
            state.editingId = data;
        }
    }
};

export default letter;
