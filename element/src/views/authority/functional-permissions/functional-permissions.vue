<template>
    <!-- 功能权限设置 -->
    <Row>
        <!-- 左侧角色列表 -->
        <Col :span="5"
             style="padding-left: 30px;border-right: 1px solid #e8eaec;">
            <!-- 标题 + 增加角色按钮 -->
            <div class="title">
                {{ $t('authority.functionalPermis.role_list') }}
                <span @click="open_add_modal"
                      class="add-role">
                    <Icon custom="custom-add"></Icon>
                </span>
            </div>

            <!-- 角色列表正体 -->
            <ul class="menu_list">
                <li v-for="item in left_menu"
                    :key="item.id"
                    @click="get_role_tree(item)"
                    :class="{ active: item.id === role_id }">
                    <!-- 角色名称 -->
                    <div :title="item.name"
                         style="float: left;width: 50%;"
                         class="ellipsis">{{ item.name }}</div>
                    &nbsp;({{ item.personCount }})
                    <!-- 删除按钮 -->
                    <span v-if="item.name !== '默认管理员'">
                        <!-- <Popconfirm placement="left"
                                    cancelButtonText=""
                                    :confirmButtonText="$t('authority.adminPermis.button_confirm')"
                                    :title="$t('authority.adminPermis.delete_info')"
                                    @onConfirm="delete_role(item)">
                            <Icon slot="reference"
                                  custom="custom-field-delete"/>
                        </Popconfirm> -->
                        <Icon custom="custom-field-delete" @click="delete_role(item)"/>
                    </span>
                </li>
            </ul>
        </Col>

        <!-- 右侧功能权限区域 -->
        <Col :span="19"
             style="padding: 0 30px;">
            <div style="height: 35px;line-height: 35px;position: relative;"
                 class="datewrap">
                <!-- 顶部标题 -->
                <div style="line-height: normal;display: inline-block;"
                     class="title">{{ $t('authority.functionalPermis.allocation_function') }}</div>
            </div>

            <!-- 权限设置 -->
            <div style="position: relative;min-height: 30vh">
                 <!-- loading -->
                 <Spin v-if="spinShow"
                       fix
                       size="large"></Spin>

                <!-- 提示语 -->
                <div class="right_explain">
                    <!-- <p>{{ $t('authority.functionalPermis.explain_one') }}</p> -->
                    <p style="color:#b8b8b8">{{ $t('authority.functionalPermis.explain_two') }}</p>
                </div>

                <!-- 顶部操作区域 -->
                <div style="margin-top: 10px">
                    <!-- 角色名输入框 -->
                    <Input v-model="roleName"
                           :disabled="is_change"
                           :placeholder="$t('authority.functionalPermis.enter_some')"
                           style="width: 200px"></Input>
                    <!-- 保存按钮 -->
                    <Button type="success"
                            :disabled="is_change"
                            icon="el-icon-upload"
                            @click="save_tree"
                            style="margin-left: 15px">{{ $t('authority.functionalPermis.button_save') }}</Button>
                </div>
                <div style="margin: 20px 0;">
                    <Button @click="openLevels(tree_data, -1)">{{$t('authority.userManagement.expandAllLevel')}}</Button>
                    <Button @click="openLevels(tree_data, 1)">{{$t('authority.userManagement.expandOneLevel')}}</Button>
                    <Button @click="openLevels(tree_data, 2)">{{$t('authority.userManagement.expandTwoLevel')}}</Button>
                    <Button @click="openLevels(tree_data, 0)">{{$t('authority.userManagement.foldAllLevel')}}</Button>
                </div>

                <!-- 权限树 -->
                <div :style="{ height: `${parseInt(content_height) - 285}px` }"
                     class="right_tree">
                    <Tree :data="tree_data"
                        :render-content="renderContent"
                        node-key="id"
                        :default-checked-keys="defaultCheckedList"
                        :default-expanded-keys="defaultExpandedKeys"
                        show-checkbox
                        multiple
                        :expand-on-click-node="false"
                        ref="update_tree"></Tree>
                </div>
            </div>
        </Col>

        <!-- 新增角色模态框 -->
        <Modal :visible.sync="visible_add_role"
               :title="$t('authority.functionalPermis.add_info')"
               :append-to-body="true"
               :modal-append-to-body="false"
               :close-on-click-modal="false"
               width="520px"
               @close="$refs.add_form.resetFields()">
            <div>
                <!-- 角色名称表单 -->
                <div style="width: 80%;margin: 10px 0;">
                    <Form :model="add_form"
                          :rules="add_form_rule"
                          label-width="80px"
                          ref="add_form"
                          style="margin-top: 20px">
                        <FormItem :label="$t('authority.functionalPermis.name')"
                                  prop="name">
                            <Input v-model="add_form.name"
                                   :placeholder="$t('authority.functionalPermis.enter_some')"></Input>
                        </FormItem>
                    </Form>
                </div>
                <!-- 功能权限树 -->
                <div style="width: 80%;margin: 0 auto;overflow-y: auto;height:300px;">
                    <Tree :data="add_tree"
                          :render-content="renderContent"
                          :props="defaultProps"
                          node-key="id"
                          :default-checked-keys="checkedKeys"
                          show-checkbox
                          @check-change="changecheckedNodes"
                          multiple
                          ref="add_authority_tree"></Tree>
                </div>
            </div>

            <!-- 底部按钮区域 -->
            <div slot="footer">
                <Button @click="handle_cancel">{{ $t('authority.functionalPermis.button_cancel') }}</Button>
                <Button type="primary"
                        @click="handle_submit('add_form')">{{ $t('authority.functionalPermis.button_add') }}</Button>
                <div style="float: left">
                    {{ $t('authority.functionalPermis.all_select') }}
                    <el-switch v-model="add_switch"
                               @change="change_add_switch">
                        <!-- <span slot="open">{{ $t('authority.functionalPermis.yes')}}</span>
                        <span slot="close">{{ $t('authority.functionalPermis.no')}}</span>-->
                    </el-switch>
                </div>
            </div>
        </Modal>
    </Row>
</template>

<script>
    import { HANDLE_ID_ARR } from '@/api/authority';
    import { mapState } from 'vuex';
    import { functionalPermissions } from '@/api/systemSettings/authority-management/index';
    const { getFunctionPermissions, updateRole, authorizationRole, checkName, addRole, saveOperateLog, deleteRole } = functionalPermissions;

    export default {
        name: 'functional-permissions',
        props: {
            content_height: {
                type: String,
                default: '800px'
            }
        },
        computed: {
            ...mapState([
                'enterpriseId',
                'userId',
                'fullName'
            ]),
            is_change() {
                return this.roleName === '默认管理员';
            }
        },
        data() {
            const trimvali = (rule, value, callback) => {
                if (!value.trim()) {
                    callback(new Error(this.$t('authority.functionalPermis.check_info')));
                } else {
                    callback();
                }
            };
            return {
                spinShow: true,
                add_switch: false,
                init_name: null,
                manager_id: null,
                roleName: null,
                tree_data: [],
                init_tree: [],
                all_tree: false,
                left_menu: [],
                is_first: true,
                role_id: 0,
                visible_add_role: false,
                add_tree: [],
                add_form: {
                    name: ''
                },
                add_form_rule: {
                    name: [
                        {
                            required: true,
                            message: this.$t('authority.functionalPermis.check_info'),
                            trigger: 'blur'
                        },
                        {
                            validator: trimvali,
                            message: this.$t('authority.functionalPermis.check_info'),
                            trigger: 'blur'
                        },
                        {
                            validator: this.check_some,
                            trigger: 'blur'
                        }
                    ]
                },
                visible: false,
                defaultCheckedList: [], // 默认选中
                defaultProps: {
                    children: 'children',
                    label: 'name'
                },
                checkedKeys: [],
                mustCheckIds: [11035, 10606, 11073], // 必须选中的 node id (邮件列表/仪表盘/邮箱设置)
                defaultExpandedKeys: []
            };
        },
        methods: {
            // 树结构节点选中状态发生变化时
            changecheckedNodes(data, data1, data2) {
                if (this.$refs.add_authority_tree.getCheckedNodes().length === 0) {
                    // 将全选按钮至为取消全选
                    this.add_switch = false;
                }
            },
            // 全选权限树
            change_add_switch(val) {
                if (val) {
                    // 全选
                    this.$refs.add_authority_tree.setCheckedNodes(this.add_tree);
                } else {
                    // 取消选中
                    this.$refs.add_authority_tree.setCheckedKeys([]);
                }

                // 批量操作后, 继续选中要求默认选中的 node
                let checkedKeys = this.$refs.add_authority_tree.getCheckedKeys();
                checkedKeys = [...new Set(checkedKeys.concat(this.mustCheckIds))];
                this.$refs.add_authority_tree.setCheckedKeys(checkedKeys);
            },
            // 提交选中的权限
            put_ajax() {
                const menuArr = this.$refs.update_tree.getCheckedNodes();
                if (menuArr.length) {
                    updateRole({
                        category: 2,
                        id: this.role_id,
                        name: this.roleName,
                        updatePerson: this.userId
                    }).then((response) => {
                        if (response.code === this.ERR_CODE) {
                            return new Promise(resolve => {
                                resolve(this.role_id);
                            });
                        }
                    }).then(data => {
                        let arr = menuArr;
                        arr = HANDLE_ID_ARR(arr);
                        authorizationRole({
                            roleId: data,
                            resourceIds: arr,
                            category: 2,
                            orgId: this.enterpriseId,
                            parentRoleId: this.manager_id
                        }).then((response) => {
                            this.visible_add_role = false;
                            if (response.code === this.ERR_CODE) {
                                this.send_actionlog(arr.join());
                                this.$Message.success(this.$t('authority.functionalPermis.update_success'));
                                this.get_left_menu();
                            } else {
                                this.$Message.error(this.$t('authority.functionalPermis.update_warning'));
                            }
                        });
                    });
                } else {
                    this.$Message.error(this.$t('authority.functionalPermis.just_info'));
                }
            },
            // 点击保存按钮
            save_tree() {
                // 当角色为空时
                if (this.roleName.trim().length === 0) {
                    return this.$Message.error(this.$t('authority.functionalPermis.check_info'));
                }
                if (this.init_name !== this.roleName) {
                    // 验证名字是否重复
                    checkName({
                        category: 2,
                        orgId: this.enterpriseId,
                        name: this.roleName
                    }).then((response) => {
                        if (response.code === this.ERR_CODE) {
                            this.init_name = this.roleName;
                            this.put_ajax();
                        } else {
                            this.$Message.error(this.$t('authority.functionalPermis.check_info_two'));
                        }
                    }).catch(erro => {
                        this.$Message.error(this.$t('authority.functionalPermis.check_info_two'));
                    });
                } else {
                    this.put_ajax();
                }
            },
            check_some(rule, value, callback) {
                // 验证名字是否重复
                checkName({
                    category: 2,
                    orgId: this.enterpriseId,
                    name: this.add_form.name
                }).then((response) => {
                    if (response.code === this.ERR_CODE) {
                        callback();
                    } else {
                        callback(new Error(this.$t('authority.functionalPermis.check_info_two')));
                    }
                }).catch(erro => {
                    callback(new Error(this.$t('authority.functionalPermis.check_info_two')));
                });
            },
            // 删除角色
            delete_role(item) {
                this.$confirm(`确定删除 ${item.name} 角色吗？`, this.$t('editSure'))
                    .then(_ => {
                        deleteRole({
                            id: item.id
                        }).then((response) => {
                            this.visible = false;
                            if (response.code === this.ERR_CODE) {
                                this.$Message.success(this.$t('authority.functionalPermis.delete_success'));
                                this.get_left_menu();
                                this.roleName = null;
                                this.tree_data = [];
                            } else {
                                this.$Message.error(response.message);
                            }
                        });
                    });
            },
            // 保存操作日志
            send_actionlog(str) {
                // 原来的接口就是这样写的,没有then操作
                saveOperateLog({
                    orgId: this.enterpriseId,
                    content: str,
                    operateUserId: this.userId,
                    operateUser: this.fullName
                });
            },
            open_add_modal() {
                // 打开新增角色弹窗
                this.visible_add_role = true;
                // 设置新增角色树的默认选中 node 为指定 node
                this.checkedKeys = this.mustCheckIds;
            },
            handle_cancel() {
                this.visible_add_role = false;
            },
            // 添加角色
            handle_submit(name) {
                this.$refs[name].validate(valid => {
                    if (valid) {
                        const menuArr = this.$refs.add_authority_tree.getCheckedNodes();
                        if (menuArr.length) {
                            addRole({
                                category: 2,
                                orgId: this.enterpriseId,
                                name: this.add_form.name,
                                createPerson: this.userId
                            }).then((response) => {
                                this.visible_add_role = false;

                                if (response.code === this.ERR_CODE) {
                                    return new Promise(resolve => {
                                        resolve(response.data);
                                    });
                                } else {
                                    this.$Message.error(this.$t('authority.functionalPermis.add_warning'));
                                }
                            }).then(data => {
                                let arr = menuArr;
                                arr = HANDLE_ID_ARR(arr);
                                authorizationRole({
                                    roleId: data,
                                    resourceIds: arr,
                                    category: 2,
                                    orgId: this.enterpriseId,
                                    parentRoleId: this.manager_id
                                }).then((response) => {
                                    this.visible_add_role = false;
                                    if (response.code === this.ERR_CODE) {
                                        this.$Message.success(this.$t('authority.functionalPermis.add_success'));
                                        this.get_left_menu();
                                    } else {
                                        this.$Message.error(this.$t('authority.functionalPermis.add_warning'));
                                    }
                                });
                            });
                        } else {
                            this.$Message.error(this.$t('authority.functionalPermis.just_info'));
                        }
                    }
                });
            },
            renderContent(h, { root, node, data }) {
                function getIcon(children) {
                    if (children.length === 0) {
                        return 'custom custom-authority-tag';
                    } else {
                        return 'custom custom-fp-paper-file';
                    }
                }

                function getColor(children) {
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
                                type: getIcon(data.children),
                                custom: getIcon(data.children)
                            },
                            style: {
                                marginRight: '8px',
                                fontSize: '18px',
                                color: getColor(data.children)
                            }
                        }),
                        h('span', data.title)
                    ])
                ]);
            },
            // 获取左侧角色列表
            get_left_menu() {
                this.$commonApi.getRoleAllByPage({
                    category: 2,
                    orgId: this.enterpriseId
                }).then((response) => {
                    if (response.code === this.ERR_CODE) {
                        let arr = null;
                        arr = response.data.data.pop(); // 删除最后一个元素
                        response.data.data.unshift(arr); // 将删除的元素添加到最前面
                        this.left_menu = response.data.data; // 左侧列表
                    } else {
                        this.$Message.error('角色列表获取失败！');
                    }
                });
            },
            /** 获取默认功能权限 初始树 有些情况用户不等默认管理员加载完毕切换其他角色 需要再次获取init_tree */
            get_init_tree() {
                return new Promise((resolve, reject) => {
                    getFunctionPermissions({
                        role_id: this.left_menu[0].id
                    }).then((response) => {
                        if (response.code === this.ERR_CODE) {
                            this.init_tree = response.data.map(item => {
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
            get_role_tree(item) {
                this.role_id = item.id;
                this.roleName = item.name;
                this.init_name = item.name;
            },
            get_tree(arr, roleName, initArr) {
                if (initArr) {
                    const selfArr = initArr.map(item => {
                        const obj = {};
                        obj.name = item.name;
                        obj.id = item.id;
                        obj.parentId = item.parentId;
                        obj.category = item.category;
                        return obj;
                    });

                    for (let i = 0; i < arr.length; i++) {
                        for (let j = 0; j < selfArr.length; j++) {
                            if (arr[i].id === selfArr[j].id) {
                                selfArr[j].check = true;
                                break;
                            }
                        }
                    }
                    arr = selfArr;
                }
                let parentArr = [];
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].parentId === 0) {
                        parentArr.push(arr[i]);
                        arr.splice(i, 1);
                        i = i - 1;
                    }
                }

                // 暂存默认选中 node ids
                const mustCheckIds = this.mustCheckIds;
                function structureParentArr(arr) {
                    return arr.map(item => {
                        const obj = {};
                        obj.title = item.name;
                        obj.id = item.id;
                        obj.parentId = item.parentId;
                        obj.checked = item.check;
                        obj.expand = false;
                        if (roleName === '默认管理员') {
                            obj.disabled = true;
                        }
                        // 默认选中 node , 不可更改选中状态
                        if (mustCheckIds.includes(item.id)) {
                            obj.checked = true;
                            obj.disabled = true;
                        }
                        obj.children = [];
                        return obj;
                    });
                }

                parentArr = structureParentArr(parentArr);
                const parentID = [];

                function buildChild(parentArr, arr) {
                    for (let j = 0; j < parentArr.length; j++) {
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i].parentId === parentArr[j].id) {
                                parentArr[j].checked = false;
                                parentID.push(parentArr[j].id);
                                const obj = {};
                                obj.title = arr[i].name;
                                obj.id = arr[i].id;
                                obj.parentId = arr[i].parentId;
                                obj.grandpa_id = parentArr[j].parentId;
                                obj.all_id = [];
                                if (parentArr[j].all_id) {
                                    obj.all_id = obj.all_id.concat(parentArr[j].all_id);
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
                                if (roleName === '默认管理员') {
                                    obj.disabled = true;
                                }
                                // 默认选中 node , 不可更改选中状态
                                if (mustCheckIds.includes(arr[i].id)) {
                                    obj.checked = true;
                                    obj.disabled = true;
                                }
                                obj.children = [];
                                parentArr[j].children.push(obj);
                                arr.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }
                    if (arr.length) {
                        for (const childItem of parentArr) {
                            if (childItem.children.length) {
                                buildChild(childItem.children, arr);
                            }
                        }
                    }

                    return parentArr;
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
                getDefaultCheckedList(buildChild(parentArr, arr));
                this.defaultCheckedList = checkedList;
                return buildChild(parentArr, arr);
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
                this.tree_data = init_treeData(treeData, false);
                const expandedIdArr = [];
                if (level === 0) {
                    /* level为0 代表用户选择的是折叠全部 则调用初始化函数将所有菜单项expand设为false */
                    this.tree_data = init_treeData(treeData, false);
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
                    this.tree_data = init_treeData(treeData, true);
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
                this.defaultExpandedKeys = expandedIdArr;
            }
        },
        created() {
            // 如果是 wa 个人版, 去掉必选限制
            if (`${this.enterpriseId}` === '11471') {
                this.mustCheckIds = [];
            }
            this.get_left_menu();
        },
        watch: {
            role_id(val) {
                if (val) {
                    this.spinShow = true;
                    getFunctionPermissions({
                        role_id: this.role_id
                    }).then(async (response) => {
                        if (response.code === this.ERR_CODE) {
                            this.defaultExpandedKeys = [];
                            if (this.roleName === '默认管理员') {
                                this.init_tree = response.data.map(item => {
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
                                response.data,
                                this.roleName,
                                this.init_tree
                            );
                            this.spinShow = false;
                        } else {
                            this.$Message.error('功能权限获取失败！');
                        }
                    });
                }
            },
            visible_add_role(val) {
                this.add_switch = false;
                if (val) {
                    this.add_form = {
                        name: ''
                    };
                    getFunctionPermissions({
                        role_id: this.manager_id
                    }).then((response) => {
                        if (response.code === this.ERR_CODE) {
                            this.add_tree = this.get_tree(response.data);
                        } else {
                            this.$Message.error('功能权限获取失败！');
                        }
                    });
                }
            },
            // 左侧角色列表
            left_menu(val, oldVal) {
                // 没有数据变化时,默认选中第一个 '默认管理员'
                if (oldVal.length === 0) {
                    for (const item of val) {
                        if (item.name === '默认管理员') {
                            this.roleName = item.name;
                            this.role_id = item.id;
                            this.manager_id = item.id;
                            break; // 终止循环
                        }
                    }
                }
            },
            // 检测新增角色的名字长度
            'add_form.name': {
                handler(val) {
                    if (val && val.length > 20) {
                        this.add_form.name = val.slice(0, 20);
                        this.$Message.info(this.$t('overLength'));
                    }
                }
            },
            // 检测角色的名字长度
            roleName: {
                handler(val) {
                    if (val && val.length > 20) {
                        this.roleName = val.slice(0, 20);
                        this.$Message.info(this.$t('overLength'));
                    }
                }
            }
        }
    };
</script>

<style lang="less" scoped>
    .title {
        margin: 10px 0;
        font-size: 16px;
        line-height: 24px;
        color: rgba(0, 0, 0, 0.8);
    }

    .menu_list {
        height: 550px;
        overflow-y: auto;
        overflow-x: hidden;

        li {
            cursor: pointer;
            list-style: none;
            line-height: 50px;
            padding-right: 10px;

            > span {
                font-size: 12px;
                display: none;
                width: 40px;
                float: right;
                text-align: center;
                margin-right: -12px;
            }

            &:hover {
                color: #4285f4;

                > span {
                    display: inline-block;
                    cursor: pointer;
                    color: #7e7e7e;
                }

                > span:hover {
                    color: #4285f4;
                }
            }
        }

        .active {
            background-color: #ffffff;
            color: #4285f4;

            > span {
                display: inline-block;
                cursor: pointer;
            }
        }
    }
</style>

<style lang="less">
    .right_tree {
        background-color: #ffffff;
        overflow-y: auto;
    }

    .right_explain {
        margin-top: 10px;

        p {
            line-height: 30px;
            color: #888888;
        }
    }
</style>
