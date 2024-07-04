export default {
    state: {
        editRow: {
            addrName: "",
            createType: "",
            remark: ""
        }
    },
    mutations: {
        setEditAddressRow(state, data) {
            state.editRow = data;
        }
    },
    actions: {
    }
};
