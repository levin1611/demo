export default {
    data() {
        return {
            // 传入commonUserSelect组件的 树结构数据
            companyName: '',
            departmentListUsedByUser: [], // 这个是单独传给userTree组件使用的数据
            departmentList: [],
            roleList: [],
            userList: []
        };
    },
    methods: {
        /* 树结构 */
        refreshTreeData(types) {
            if (types.includes('department') || types.includes('user')) {
                this.getDepartmentList();
            }
            if (types.includes('role')) {
                this.getRoleList();
            }
            if (types.includes('user')) {
                this.getUserList();
            }
        },
        // 获取各类树所需数据
        getDepartmentList() {
            this.$commonApi.getV2DepartmentTree({
                orgId: this.enterpriseId
            }).then(response => {
                if (response.code === 10000) {
                    this.departmentList = JSON.parse(JSON.stringify(response.data.list));
                    this.departmentListUsedByUser = response.data.list;
                    this.companyName = response.data.orgName;
                } else {
                    this.$Message.error(this.$t('authority.userManagement.departmentErr'));
                }
            }).catch(error => {
                console.error(error);
                this.$Message.error(this.$t('authority.userManagement.departmentErr'));
            });
        },
        getRoleList() {
            this.$commonApi.getV2AllByPage({
                orgId: this.enterpriseId
            }).then(response => {
                if (response.code === 10000) {
                    this.roleList = response.data.map(item => {
                        item.name = item.nameCn;
                        return item;
                    });
                } else {
                    this.$Message.error(response.message);
                }
            });
        },
        getUserList() {
            this.$commonApi.getV2AllUsers({
                orgId: this.enterpriseId
            }).then((data) => {
                if (data.code === 10000) {
                    this.userList = data.data.map(item => {
                        item.fullname = item.cnName;
                        return item;
                    });
                } else {
                    this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                }
            }).catch(error => {
                console.error(error);
                this.$Message.error(this.$t('authority.userManagement.queryFailure'));
            });
        }
    }
};
