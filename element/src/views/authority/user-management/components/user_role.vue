<template>
  <div class="user-role" v-loading="loading">
    <template>
      <div>
        <div class="role-list">
          <Button
            round
            :class="(item.roleId === current_role_id)  ? 'active': ''"
            v-for="item in roleList"
            :key="item.roleId"
            @click="changeRole(item.roleId, item.roleName)"
          >{{item.roleName}}</Button>
        </div>
        <div class="role-btns">
          <Button
            @click="openLevels(tree_data, 1)"
          >{{$t('authority.userManagement.expandOneLevel')}}</Button>
          <Button
            @click="openLevels(tree_data, 2)"
          >{{$t('authority.userManagement.expandTwoLevel')}}</Button>
          <Button
            @click="openLevels(tree_data, 3)"
          >{{$t('authority.userManagement.expandThreeLevel')}}</Button>
          <Button @click="openLevels(tree_data, 0)">{{$t('authority.userManagement.foldAllLevel')}}</Button>
        </div>
        <div class="right_tree" :style="current_role_id ? 'height: 360px': 'height: 210px'">
          <Tree
            :data="tree_data"
            node-key="id"
            :default-checked-keys="defaultCheckedList"
            :default-expanded-keys="expandedIdList"
            :expand-on-click-node="false"
            show-checkbox
            multiple
            :render-content="renderContent"
            style="margin-top: 15px"
            ref="update_tree"
          ></Tree>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
    import { functionalPermissions } from '@/api/systemSettings/authority-management/index';
    const { getFunctionPermissions } = functionalPermissions;

    export default {
        data() {
            return {
                loading: false, // 暂时设为false  正常初始值设为true 当请求到数据以后变为false
                tree_data: [], // 部门树
                role_id: 0, // 角色id
                init_tree: [], // 初始树
                role_name: null,
                current_role_id: 0, // 当前选中的角色id
                current_role_name: null, // 当前选中的角色名字
                defaultCheckedList: [], // 默认选中
                expandedIdList: [], // 展开树节点的key的数组
                mustCheckIds: [11035, 10606, 10607] // 必须选中的 node id (邮件列表/仪表盘/邮箱设置)
            };
        },
        props: {
            userInfo: {
                type: Object,
                default() {
                    return {};
                }
            },
            content_height: {
                type: String,
                default: '800px'
            },
            authority_function: {
                type: Array,
                default: []
            }
        },
        computed: {
            roleList() {
                if (this.role_name && this.role_id) {
                    const roleNameList = this.role_name.split(',');
                    const roleIdList = this.role_id.split(',');
                    const roleList = roleNameList.map((item, index) => {
                        return {
                            roleName: item,
                            roleId: roleIdList[index]
                        };
                    });
                    this.current_role_id = roleList[0].roleId;
                    this.current_role_name = roleList[0].roleName;
                    return roleList;
                } else {
                    this.current_role_id = 0;
                    this.current_role_name = null;
                }
            }
        },
        methods: {
            /** 获取默认管理员 初始树 有些情况用户不等默认管理员加载完毕切换其他角色 需要再次获取init_tree */
            get_init_tree() {
                const defaultRoleId = this.authority_function.find(item => item.label === '默认管理员').value;
                return new Promise((resolve, reject) => {
                    getFunctionPermissions({
                        role_id: defaultRoleId
                    }).then((data) => {
                        if (data.code === this.ERR_CODE) {
                            this.init_tree = data.data.map(item => {
                                const obj = {};
                                obj.name = item.name;
                                obj.id = item.id;
                                obj.parentId = item.parentId;
                                obj.category = item.category;
                                return obj;
                            });
                        }
                        resolve();
                    });
                });
            },
            get_tree(arr, role_name, init_arr) {
                if (init_arr) {
                    const self_arr = init_arr.map(item => {
                        const obj = {};
                        obj.name = item.name;
                        obj.id = item.id;
                        obj.parentId = item.parentId;
                        obj.category = item.category;
                        return obj;
                    });

                    for (let i = 0; i < arr.length; i++) {
                        for (let j = 0; j < self_arr.length; j++) {
                            if (arr[i].id === self_arr[j].id) {
                                self_arr[j].check = true;
                                break;
                            }
                        }
                    }
                    arr = self_arr.filter(item => item.check === true);
                }
                let parent_arr = [];
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].parentId === 0) {
                        parent_arr.push(arr[i]);
                        arr.splice(i, 1);
                        i = i - 1;
                    }
                }

                // 暂存默认选中 node ids
                const mustCheckIds = this.mustCheckIds;
                function structure_parent_arr(arr) {
                    return arr.map(item => {
                        const obj = {};
                        obj.title = item.name;
                        obj.id = item.id;
                        obj.parentId = item.parentId;
                        obj.checked = item.check;
                        obj.expand = false;
                        /* 禁用多选框 */
                        obj.disabled = true;
                        /* 在用户详情页只做展示信息，所以禁用掉所有的多选框，不区分角色 */
                        /* if (role_name === "默认管理员") {
                             obj.disabled = true;
                            } */
                        // 默认选中 node , 不可更改选中状态
                        if (mustCheckIds.includes(item.id)) {
                            obj.checked = true;
                            obj.disabled = true;
                        }
                        obj.children = [];
                        return obj;
                    });
                }

                parent_arr = structure_parent_arr(parent_arr);

                function build_child(parent_arr, arr) {
                    for (let j = 0; j < parent_arr.length; j++) {
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i].parentId === parent_arr[j].id) {
                                parent_arr[j].checked = false;
                                const obj = {};
                                obj.title = arr[i].name;
                                obj.id = arr[i].id;
                                obj.parentId = arr[i].parentId;
                                obj.grandpa_id = parent_arr[j].parentId;
                                obj.all_id = [];
                                if (parent_arr[j].all_id) {
                                    obj.all_id = obj.all_id.concat(parent_arr[j].all_id);
                                }
                                obj.all_id.push(arr[i].parentId, arr[i].id);
                                if (arr[i].category === 1) {
                                    obj.menu = 'menu';
                                } else if (arr[i].category === 2) {
                                    obj.menu = 'function';
                                } else {
                                    obj.menu = 'fills';
                                }
                                obj.expand = false;
                                obj.checked = arr[i].check;
                                /* 禁用多选框 */
                                obj.disabled = true;
                                /* 在用户详情页只做展示信息，所以禁用掉所有的多选框，不区分角色 */
                                /* if (role_name === "默认管理员") {
                                      obj.disabled = true;
                                    } */
                                // 默认选中 node , 不可更改选中状态
                                if (mustCheckIds.includes(arr[i].id)) {
                                    obj.checked = true;
                                    obj.disabled = true;
                                }
                                obj.children = [];
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
                // 获取tree默认选中的id数组
                const checkedList = [];
                function getDefaultCheckedList(arr) {
                    arr.forEach(item => {
                        if (item.checked !== null && item.checked === true) {
                            checkedList.push(item.id);
                        }
                        if (item.children != null) {
                            getDefaultCheckedList(item.children);
                        }
                    });
                };
                getDefaultCheckedList(build_child(parent_arr, arr));
                this.defaultCheckedList = checkedList;

                return build_child(parent_arr, arr);
            },
            renderContent(h, { root, node, data }) {
                function get_icon(children) {
                    if (children.length === 0) {
                        return 'custom custom-authority-tag';
                    } else {
                        return 'custom custom-fp-paper-file';
                    }
                }

                function get_color(children) {
                    if (children.length === 0) {
                        return '#7B98B6';
                    } else {
                        return '#FBBC04';
                    }
                }

                return h('span', [
                    h('span', [
                        h('Icon', {
                            props: {
                                type: get_icon(data.children),
                                custom: get_icon(data.children)
                            },
                            style: {
                                marginRight: '8px',
                                fontSize: '18px',
                                color: get_color(data.children)
                            }
                        }),
                        h('span', data.title)
                    ])
                ]);
            },
            changeRole(roleId, roleName) {
                this.current_role_id = roleId;
                this.current_role_name = roleName;
            },
            openLevels(treeData, level) {
                /* 该方法用于将所有层级的菜单的expand全部更改为false 当用户点击展开全部时，更改为true 折叠全部为false */
                function init_treeData(arr, flag) {
                    return arr.map(item => {
                        item.expand = flag;
                        if (item.children.length > 0) {
                            init_treeData(item.children, flag);
                        }
                        return item;
                    });
                }

                const newArr = init_treeData(treeData, false);
                this.tree_data = newArr;
                const expandedIdArr = [];
                if (level === 0) {
                    /* level为0 代表用户选择的是折叠全部 则调用初始化函数将所有菜单项expand设为false */
                    init_treeData(treeData, false);
                } else if (level === 1) {
                    /* 展开一级菜单 */
                    this.tree_data = treeData.map(item => {
                        if (item.parentId === 0) {
                            item.expand = true;
                        }
                        return item;
                    });
                } else if (level === 2) {
                    /* 展开二级菜单 */
                    const res1 = treeData.map(item => {
                        if (item.parentId === 0) {
                            item.expand ? '' : (item.expand = true);
                        }
                        return item;
                    });
                    if (res1) {
                        for (let i = 0; i < res1.length; i++) {
                            const firstLevel = res1[i];
                            if (res1[i].children.length > 0) {
                                const secondLevel = res1[i].children;
                                for (let j = 0; j < secondLevel.length; j++) {
                                    if (secondLevel[j].grandpa_id === firstLevel.parentId) {
                                        secondLevel[j].expand = true;
                                    }
                                }
                            }
                        }
                    }
                    this.tree_data = res1;
                } else if (level === 3) {
                    /* 展开三级菜单 */
                    const res2 = treeData.map(item => {
                        if (item.parentId === 0) {
                            item.expand ? '' : (item.expand = true);
                            if (item.children.length > 0) {
                                const parentItem = item;
                                item.children.map(item_children => {
                                    if (item_children.grandpa_id === parentItem.parentId) {
                                        item_children.expand ? '' : (item_children.expand = true);
                                    }
                                });
                            }
                        }
                        return item;
                    });
                    if (res2) {
                        for (let i = 0; i < res2.length; i++) {
                            const firstLevel = res2[i];
                            if (firstLevel.children.length > 0) {
                                const newArr = firstLevel.children;
                                for (let j = 0; j < newArr.length; j++) {
                                    const secondLevel = newArr[j];
                                    if (secondLevel.children.length > 0) {
                                        const thirdLevel = secondLevel.children;
                                        for (let k = 0; k < thirdLevel.length; k++) {
                                            if (thirdLevel[k].grandpa_id === secondLevel.parentId) {
                                                thirdLevel[k].expand = true;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    this.tree_data = res2;
                } else {
                    /* 当用户选择展开全部时 传入的level值为-1 此时调用初始化函数 将所有菜单项的expand设为true */
                    init_treeData(treeData, true);
                }

                // 获取tree默认展开的id数组
                function getDefaultExpandedList(arr) {
                    arr.forEach(item => {
                        if (item.expand !== null && item.expand === true) {
                            expandedIdArr.push(item.id);
                        }
                        if (item.children != null) {
                            getDefaultExpandedList(item.children);
                        }
                    });
                };
                getDefaultExpandedList(this.tree_data);
                this.expandedIdList = expandedIdArr;
            }
        },
        watch: {
            userInfo: {
                handler() {
                    this.role_id = this.userInfo.roleId;
                    this.role_name = this.userInfo.functional_permissions;
                },
                immediate: true
            },
            current_role_id(val) {
                if (val) {
                    this.spinShow = true;
                    getFunctionPermissions({
                        role_id: this.current_role_id
                    }).then(async (data) => {
                        if (data.code === this.ERR_CODE) {
                            if (this.current_role_name === '默认管理员') {
                                this.init_tree = data.data.map(item => {
                                    const obj = {};
                                    obj.name = item.name;
                                    obj.id = item.id;
                                    obj.parentId = item.parentId;
                                    obj.category = item.category;
                                    return obj;
                                });
                            }
                            if (this.init_tree.length < 1) {
                                await this.get_init_tree();
                            }
                            this.tree_data = this.get_tree(
                                data.data,
                                this.current_role_name,
                                this.init_tree
                            );
                            this.spinShow = false;
                        } else {
                            this.$Message.error(this.$t('authority.userManagement.getFunctionalPermissionsFail'));
                        }
                    });
                } else {
                    if (!this.current_role_id && !this.current_role_name) {
                        this.tree_data = [];
                    }
                }
            }
        }
    };
</script>
<style lang="less" scoped>
.role-list {
  margin-left: 10px;
  margin-bottom: 10px;

  .active {
    border: 1px solid #4285f4;
    color: #4285f4;
    padding: 4px 12px;
    box-shadow: none;
  }

}

.role-btns {
  margin: 0 0 0 10px;
}
</style>
