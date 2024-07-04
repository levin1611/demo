<!-- 仪表盘 tableCard 组件通用的筛选组件 -->
<template>
    <Cascader
        :key="CascaderKey"
        v-model="selectedUserIds"
        :options="tree_data"
        :props="props"
        @change="handleChange"
        :show-all-levels="false"
        collapse-tags>
    </Cascader>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    export default {
        name: 'person-filter',
        props: [
            // 所属 card 类型
            'cardType',
            // 筛选值
            'filterValue'
        ],
        computed: {
            ...mapState({
                userId: state => state.userId,
                fullName: state => state.fullName,
                userName: state => state.userName,
                orgId: state => state.enterpriseId
            })
        },
        data() {
            return {
                /* 全局 */
                // 筛选标题,
                CascaderKey: 0,
                selectedUserIds: [],
                title: '我的企业',
                props: {
                    label: 'title',
                    children: 'children',
                    multiple: true,
                    value: 'id'
                },
                tree_data: [],
                init_tree: [],
                user_list: [],
                keywords: '', // 搜索词，
                treeItemClass: ''
            };
        },
        methods: {
            handleChange() {
                console.log(this.selectedUserIds);
                this.CascaderKey++;
            },
            /* 全局 */
            confirm() {
                console.log(this.selectedUserIds)
                const allChecked = this.$refs.departmentTree.getCheckedNodes();
                const selectedUserIds = [];
                const title = [];
                if (allChecked.length) {
                    allChecked.forEach(item => {
                        if (item.type && item.type === 'person') {
                            selectedUserIds.push(item.id);
                            title.push(item.title);
                        }
                    });
                    this.title = title.join(',');
                } else {
                    this.title = '我的企业';
                }
                this.$emit('handleFilter', 'selectedUserIds', selectedUserIds);
                this.closePoptip();
            },
            cancel() {
                // 关闭弹窗
                this.closePoptip();
            },
            /* 用户型 */
            get_update_tree() {
                util.ajax({
                    url: '/new-privilege/department/getCrmManageDepartments',
                    method: 'get',
                    params: {
                        orgId: this.orgId,
                        userId: this.userId
                    }
                }).then(({ data }) => {
                    if (data.code === '1') {
                        return new Promise((resolve) => {
                            this.init_tree = data.data;
                            if (Array.isArray(data.data) && data.data.length) {
                                resolve();
                            } else {
                                this.loading_tree = false;
                            }
                        });
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.departmentErr'));
                        this.loading_tree = false;
                    }
                }).then((data) => {
                    util
                        .ajaxJson({
                            url: '/new-privilege/user/getCrmUserByleaderUserId',
                            method: 'get',
                            params: {
                                orgId: this.orgId,
                                userId: this.userId
                            }
                        }).then(({ data }) => {
                            if (data.code === '1') {
                                this.user_list = data.data;
                                const treeData = this.get_tree(this.init_tree, this.user_list);
                                if (this.user_list.length === 1) {
                                    this.title = this.userName;
                                    this.tree_data = treeData;
                                } else {
                                    this.title = '我的企业';
                                    this.tree_data = [
                                        {
                                            title: '我的企业',
                                            id: 0,
                                            parentId: -1,
                                            checked: true,
                                            expand: true,
                                            children: treeData
                                        }
                                    ];
                                }
                            } else {
                                this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                            }
                            this.loading_tree = false;
                        });
                });
            },
            get_tree(param_arr, user_list, check_arr) {
                const userList = user_list.map((item) => {
                    const obj = {};
                    obj.parentId = item.departmentId;
                    obj.name = item.fullname;
                    obj.power = item.manageName;
                    obj.id = item.id;
                    obj.check = false;
                    obj.type = 'person';
                    if (item.canGetInquiry === 1 && !item.isDelete) {
                        return obj;
                    } else {
                        return false;
                    }
                });
                if (check_arr) {
                    for (const check_item of check_arr) {
                        for (const user_item of userList) {
                            if (check_item.userId === user_item.id) {
                                user_item.check = true;
                            }
                        }
                    }
                }
                const arr = param_arr.map((item) => {
                    const obj = {};
                    obj.parentId = item.parentId;
                    obj.name = item.name;
                    obj.id = item.id;
                    return obj;
                });
                let parent_arr = [];

                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].parentId === 0) {
                        parent_arr.push(arr[i]);
                        arr.splice(i, 1);
                        i = i - 1;
                    }
                }

                function structure_parent_arr(arr) {
                    return arr.map((item) => {
                        const obj = {};
                        obj.title = item.name;
                        obj.id = item.id;
                        obj.parentId = item.parentId;
                        obj.checked = item.check;
                        obj.expand = true;
                        obj.children = [];
                        return obj;
                    });
                }

                parent_arr = structure_parent_arr(parent_arr);

                function build_child(parent_arr, arr) {
                    /**
                     * @Description: 企业下人员列表和部门列表在后端存储的是两张表，存在人员id和部门id相同的情况
                     * 一旦出现这种情况，会导致本来应属于某一部门下的人员，出现在某一人员的子节点中，示例见bug[1002136]
                     * 解决方案为：
                     * 在获取人员列表时，每一项加上type='person'，部门列表每一项添加上type='department'，
                     * 遍历添加子节点时，加上filter，解决当传入的父节点数组中既有人员又有部门的情况，
                     * 保证只有type为department的父节点才会有children属性，才可以添加子节点
                     * @author 杨娣filter
                     * @date 2019/11/22
                     */
                    parent_arr = parent_arr.filter((item) => item.type !== 'person');
                    for (let j = 0; j < parent_arr.length; j++) {
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i].parentId === parent_arr[j].id) {
                                parent_arr[j].checked = false;
                                const obj = {};
                                obj.title = arr[i].name;
                                obj.id = arr[i].id;
                                obj.power = arr[i].power;
                                obj.parentId = arr[i].parentId;
                                obj.grandpa_id = parent_arr[j].parentId;
                                obj.parent_name = parent_arr[j].title;
                                if (arr[i].category === 1) {
                                    obj.menu = 'department';
                                } else {
                                    obj.menu = 'person';
                                }
                                obj.type = arr[i].type;
                                obj.expand = true;
                                obj.checked = arr[i].check;
                                if (arr[i].type !== 'person') {
                                    obj.children = [];
                                }
                                parent_arr[j].children.push(obj);
                                arr.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }
                    if (arr.length) {
                        for (const child_item of parent_arr) {
                            if (child_item.children.length) {
                                build_child(child_item.children, arr);
                            }
                        }
                    }

                    return parent_arr;
                }

                const new_arr = arr.concat(userList);
                return build_child(parent_arr, new_arr);
            },
            generate_child_tree(title) {
                const str_searched = title || ''; // 要搜索的文字
                const temp_tree_data = this.get_tree(this.init_tree, this.user_list, []); // 全量 tree_data

                function search_title_recursively(nodes, str_searched) {
                    return nodes.map((node) => {
                        if (node.title.includes(str_searched)) {
                            return node;
                        } else if (node.children.length) {
                            node.children = search_title_recursively(
                                node.children,
                                str_searched
                            );
                            if (node.children.length) {
                                return node;
                            } else {
                                return undefined;
                            }
                        } else {
                            return undefined;
                        }
                    }).filter((item) => item);
                }

                this.tree_data = search_title_recursively(temp_tree_data, str_searched);
            }, // 根据 id 在页面中定位常用检索, 返回值为"定位是否成功"
            closePoptip() {
                this.$refs.poptip.doClose();
            }
        },
        created() {
            if (!this.tree_data.length) {
                this.get_update_tree();
            }
        },
        mounted() {
        }
    };
</script>

<style lang="less">
   /deep/ .card-filter__title{
        padding: 0px 8px;
    }
    .card-filter {
        padding: 0;
        border: 0;

        &__trigger {
            display: flex;
            align-items: center;
            border: 1px solid #CBD6E2;
            border-radius: 4px;
            padding: 0 8px;
            line-height: 32px;
            font-size: 12px;
            cursor: pointer;
         }

        &__title {
            display: inline-block;
            padding: 0px 8px;
            max-width: 200px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        &__icon {
            padding: 0 8px;
        }

        .small-date-panel-container {
            line-height: 0;
        }
    }

    .small-date-panel-container {
        width: 100%;
        //height: 280px;
        //overflow: hidden;
    }

    .small-date-panel {
        //transform: scale(0.84);
        //transform-origin: 0 0 0;
        &.dateMothe {
            .el-month-table td .cell{
                width: 44px;
                height: 24px;
                line-height: 24px;
            }
            .el-month-table td div{
                padding: 11px 0;
            }
        }
        .el-picker-panel {
            width: 100%;
            box-shadow: none;
            margin: 0;

            .el-picker-panel__sidebar {
                width: 92px;

                .el-picker-panel__shortcut {
                    font-size: 12px;
                }

                &+.el-picker-panel__body {
                    margin-left: 92px;
                }
            }

            .el-picker-panel__body {
                min-width: 555px;

                .el-date-range-picker__header div {
                    font-size: 12px;
                }
            }
        }
    }

    .active-shortCut {
        color: #FA8241;
    }
    .filter-content {
        margin-top: 4px;
        padding: 0 16px;


        .filter-items {
            margin-top: 4px;
            max-height: 130px;
            overflow: auto;

            .el-checkbox, .el-radio {
                display: block;
                word-wrap: break-word;
                word-break: break-all;
                // margin: 5px 0;

                &__label {
                     font-size: 12px;
                 }
            }
        }
        .filter-tree {
            .el-checkbox{
                display: inline-block;
            }
        }
        .title {
            font-size: 12px;
            height: 36px;
            line-height: 36px;

            i {
                color: #7d9abe;
                margin-right: 8px;
            }
        }
    }

    .card-filter-btns {
        .el-button {
            padding: 0 17px;
            height: 33px;
            line-height: 33px;
        }

        text-align: right;
        margin: 16px 15px 10px;
    }

    .treeItem{
        background: '#F5F7FA';
    }
</style>
