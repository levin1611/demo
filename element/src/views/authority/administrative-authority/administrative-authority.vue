<template>
    <!-- 管理权限设置 -->
    <Row>
        <!-- 左侧角色列表 -->
        <Col :span="5"
             style="padding-left: 30px;border-right: 1px solid #e8eaec;">
            <!-- 标题 + 增加角色按钮 -->
            <div class="title">
                {{ $t('authority.adminPermis.role_list') }}
                <span @click="visible_add_role = true"
                      class="add-role">
                    <Icon custom="custom-add"></Icon>
                </span>
            </div>

            <!-- 角色列表正体 -->
            <ul class="menu_list">
                <li v-for="item in left_menu"
                    :key="item.id"
                    @click="get_manage_news(item)"
                    :class="{ active: item.id === role_id }">
                    <!-- 角色名称 -->
                    <div :title="item.name"
                         style="float: left;width: 50%;"
                         class="ellipsis">{{ item.name }}</div>
                    &nbsp;({{ item.personCount }})
                    <!-- 删除按钮 -->
                    <span v-if="item.name !== '默认管理员'">
                        <Icon @click="delete_role(item)" custom="custom-field-delete"/>
                    </span>
                    <!-- 编辑按钮 -->
                    <span v-if="item.name !== '默认管理员'"
                          @click="visible_update_role = true">
                        <Icon custom="custom-field-edit"/>
                    </span>
                </li>
            </ul>
        </Col>

        <!-- 右侧角色权限区域 -->
        <Col :span="19"
             style="padding: 0 30px;">
            <!-- 顶部标题 -->
            <div style="height: 35px;line-height: 35px;position: relative;"
                 class="datewrap">
                <div style="line-height: normal;display: inline-block;"
                     class="title">{{ $t('authority.adminPermis.allocation_function') }}</div>
            </div>

            <!-- 权限设置 -->
            <div v-show="role_id">
                <div class="right_explain">
                    <!-- 切换: 部门管理权限设置 || 自定义设置 -->
                    <RadioGroup v-model="default_check"
                                class="vertical-radio-group">
                        <Radio label="self"
                               :disabled="is_manager">
                            <span style="font-size: 14px">{{ $t('authority.adminPermis.explain_one') }}</span>
                        </Radio>
                        <Radio label="not_self"
                               :disabled="is_manager"
                               style="margin-top: 50px">
                            <span style="font-size: 14px">{{ $t('authority.adminPermis.custom_settings') }}</span>
                        </Radio>
                    </RadioGroup>

                    <!-- 部门管理权限设置 -->
                    <div v-if="!is_default"
                         style="margin-top: -65px;padding-bottom: 60px;margin-left: 23px">
                        <span style="font-size: 14px">{{ $t('authority.adminPermis.management_type') }}</span>
                        <RadioGroup v-model="power_range"
                                    @change="post_power_range">
                            <!-- 本人 -->
                            <Radio :label="$t('authority.adminPermis.my_self')"
                                   :disabled="is_manager"
                                   style="margin-left: 15px"></Radio>
                            <!-- 本部门 -->
                            <Radio :label="$t('authority.adminPermis.my_department')"
                                   :disabled="is_manager"
                                   style="margin-left: 15px"></Radio>
                            <!-- 本公司 -->
                            <Radio :label="$t('authority.adminPermis.my_company')"
                                   :disabled="is_manager"
                                   style="margin-left: 15px"></Radio>
                        </RadioGroup>
                    </div>
                </div>

                <!-- 自定义设置顶部提醒 -->
                <div v-if="is_default"
                     style="padding-left: 20px">
                    <p>{{ $t('authority.adminPermis.explain_two') }}</p>
                </div>

                <!-- 自定义设置 -->
                <Row v-if="is_default"
                     :gutter="100"
                     style="margin-top: 15px;padding-left: 20px">
                    <!-- 已添加用户列表 -->
                    <Col :span="8">
                        <div style="line-height: 50px;font-weight: bold">
                            <span v-if="!is_save">{{ $t('authority.adminPermis.user_list_added') }}</span>
                            <span v-else
                                  style="color: #0ab512">{{ $t('authority.adminPermis.user_list_selected') }}</span>
                        </div>
                        <Table :data="my_person"
                                :isCustom="true"
                                :customEmptyText="$t('crm.Table.noData')"
                                customEmptyButtonText=""
                                :customClearMethod="clearFilterConditionByFater"
                               :height="parseInt(content_height)-280">
                            <TableColumn v-for="item in my_person_columns"
                                         :key="item.key"
                                         :prop="item.key"
                                         :label="item.title"
                                         show-overflow-tooltip></TableColumn>
                        </Table>
                    </Col>
                    <!-- 操作员选择 -->
                    <Col :span="16">
                        <!-- 标题 -->
                        <div style="line-height: 50px;font-weight: bold">{{ $t('authority.adminPermis.select_action_role') }}</div>
                        <!-- 顶部操作区域 -->
                        <div>
                            <!-- 全选 -->
                            {{ $t('authority.adminPermis.all_select') }}
                            <el-switch v-model="add_switch" @change="change_add_switch">
                            </el-switch>
                            <!-- 角色名输入框 -->
                            <Input v-model="role_name"
                                   :placeholder="$t('authority.adminPermis.enter_some')"
                                   clearable
                                   style="width: 200px;margin-left: 20px"/>
                            <!-- 保存按钮 -->
                            <Button type="success"
                                    icon="el-icon-upload"
                                    @click="save_tree"
                                    style="margin-left: 15px">{{ $t('authority.adminPermis.button_save') }}</Button>
                            <span style="margin-left: 20px"></span>
                        </div>
                        <!-- 用户树 -->
                        <div>
                            <div :style="{height:`${parseInt(content_height)-320}px`}"
                                 class="right_tree">
                                <IviewTree :data="tree_data"
                                           show-checkbox
                                           multiple
                                           :render="renderContent"
                                           ref="update_tree"
                                           @on-check-change="add_table"
                                           style="margin-top: 15px"></IviewTree>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </Col>

        <!-- 新增角色模态框 -->
        <Modal :visible.sync="visible_add_role"
               :title="$t('authority.adminPermis.addRole')"
               :append-to-body="true"
               :modal-append-to-body="false"
               :close-on-click-modal="false"
               width="520px"
               @close="$refs.add_form.resetFields()">
            <!-- 输入区域 -->
            <div>
                <div style="width: 80%;margin: 10px auto;">
                    <Form :model="add_form"
                          :rules="add_form_rule"
                          label-width="80px"
                          ref="add_form"
                          style="margin-top: 20px">
                        <FormItem :label="$t('authority.adminPermis.newRoleName')"
                                  prop="name">
                            <Input v-model="add_form.name"
                                   :placeholder="$t('authority.adminPermis.enter_some')"></Input>
                        </FormItem>
                    </Form>
                </div>
            </div>

            <!-- 底部按钮 -->
            <div slot="footer">
                <Button @click="visible_add_role = false">{{ $t('authority.adminPermis.button_cancel') }}</Button>
                <Button type="primary"
                        @click="handle_submit('add_form')">{{ $t('authority.adminPermis.button_add') }}</Button>
            </div>
        </Modal>

        <!-- 修改角色模态框 -->
        <Modal :visible.sync="visible_update_role"
               :title="$t('authority.adminPermis.update_name')"
               :append-to-body="true"
               :modal-append-to-body="false"
               :close-on-click-modal="false"
               width="520px"
               @close="$refs.update_form.resetFields()">
            <!-- 输入区域 -->
            <div>
                <div style="width: 80%;margin: 10px auto;">
                    <Form :model="update_form"
                          :rules="update_form_rule"
                          label-width="90px"
                          ref="update_form"
                          style="margin-top: 20px">
                        <FormItem :label="$t('authority.adminPermis.name')"
                                  prop="name">
                            <Input v-model="update_form.name"
                                   :placeholder="$t('authority.adminPermis.enter_some')"></Input>
                        </FormItem>
                    </Form>
                </div>
            </div>

            <!-- 底部按钮 -->
            <div slot="footer">
                <Button @click="visible_update_role = false">{{ $t('authority.adminPermis.button_cancel') }}</Button>
                <Button type="primary"
                        @click="handle_update('update_form')">{{ $t('authority.adminPermis.button_update') }}</Button>
            </div>
        </Modal>
    </Row>
</template>

<script>
    import { HANDLE_PRESON_ID_ARR } from '@/api/authority';
    import { mapState } from 'vuex';
    import resetInitComponents from '@/mixins/resetComponentViewData';
    import { administrativeAuthority } from '@/api/systemSettings/authority-management/index';
    const { manageUpdate, getManager, getManageruser, nameManage, addManagerUser, deleteManager, addManager } = administrativeAuthority;

    export default {
        mixins: [resetInitComponents],
        name: 'administrative-authority',
        props: {
            content_height: {
                type: String,
                default: '800px'
            }
        },
        computed: {
            ...mapState([
                'enterpriseId',
                'userId'
            ]),
            is_default() {
                return this.default_check !== 'self';
            },
            is_manager() {
                return this.init_name === '默认管理员';
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
                visible_update_role: false, // 修改角色时的弹窗阈值
                is_save: false,
                is_first: true,
                role_id: null,
                add_switch: false, // 全选按钮阈值
                person_name: null,
                user_list: [],
                my_person_columns: [
                    {
                        title: this.$t('authority.adminPermis.accountId'),
                        key: 'userId'
                    },
                    {
                        title: this.$t('authority.adminPermis.department'),
                        key: 'departmentName'
                    },
                    {
                        title: this.$t('crm.InqSet.contact_nickName'),
                        key: 'userName'
                    }
                ],
                my_person: [],
                power_range: null,
                default_check: 'self',
                init_name: null,
                manager_id: null,
                role_name: null,
                tree_data: [],
                init_tree: [],
                all_tree: false,
                left_menu: [],
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
                update_form: {
                    name: null
                },
                update_form_rule: {
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
                            validator: this.check_update,
                            trigger: 'blur'
                        }
                    ]
                },
                visible: false,
                updateRoleListFlag: false, // 更新角色列表的标识
                currentCategory: 0, // 当前选中角色的category
                addRoleFlag: false // 新建角色的标识
            };
        },
        methods: {
            // 更新角色
            handle_update(name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        manageUpdate({
                            id: this.role_id,
                            category: this.currentCategory,
                            orgId: this.enterpriseId,
                            name: this.update_form.name,
                            updatePerson: this.userId
                        }).then((data) => {
                            if (data.code === this.ERR_CODE) {
                                this.$Message.success(this.$t('authority.adminPermis.updateNameSuccess'));
                                this.visible_update_role = false;
                                this.init_name = this.update_form.name;
                                this.role_name = this.update_form.name;
                                this.updateRoleListFlag = true;
                                // 获取默认管理员及左侧角色列表
                                this.get_manage_user();
                            } else {
                                this.$Message.error(this.$t('authority.adminPermis.updateNameError'));
                            }
                        }).catch(erro => {
                            this.$Message.error(this.$t('authority.adminPermis.updateNameError'));
                        });
                    }
                });
            },
            // 将右侧被选中的放入左侧 已经选择用户列表
            add_table() {
                this.is_save = true;
                const personArr = this.$refs.update_tree.getCheckedNodes();
                const newArr = [];
                for (const item of personArr) {
                    const obj = {};
                    if (item.type === 'person') {
                        obj.userId = item.id;
                        obj.departmentName = item.parent_name;
                        obj.userName = item.title;
                        newArr.push(obj);
                    }
                }


                this.my_person = newArr;
            },
            // 保存后获取 已添加用户列表
            getUserCommon() {
                getManageruser({
                    roleId: this.role_id,
                    orgId: this.enterpriseId
                }).then((data) => {
                    if (data.code === this.ERR_CODE) {
                        // 已添加用户列表
                        this.my_person = data.data;
                    } else {
                        this.$Message.error(this.$t('authority.adminPermis.getAddedListFail'));
                    }
                });
            },
            // 保存字段
            save_tree() {
                this.is_save = false;
                this.power_range = null;
                // 当角色为空时
                if (this.role_name.length === 0) {
                    return this.$Message.error(this.$t('authority.adminPermis.check_info'));
                }
                // 角色名字和input中的名字不一致时
                if (this.init_name !== this.role_name) {
                    // 保存修改后的角色名称
                    nameManage({
                        orgId: this.enterpriseId,
                        name: this.role_name
                    }).then((data) => {
                        if (data.code === this.ERR_CODE) {
                            this.init_name = this.role_name;
                            return new Promise(resolve => {
                                resolve('ok');
                            });
                        } else {
                            this.$Message.error(this.$t('authority.adminPermis.nameExisted'));
                        }
                    }).then(data => {
                        if (data === 'ok') {
                            manageUpdate({
                                id: this.role_id,
                                orgId: this.enterpriseId,
                                category: 0,
                                name: this.role_name,
                                updatePerson: this.userId
                            }).then((data) => {
                                if (data.code !== this.ERR_CODE) {
                                    this.$Message.error(this.$t('editFail'));
                                } else {
                                    this.updateRoleListFlag = true;
                                    this.get_manage_user();
                                }
                            });
                            const personArr = this.$refs.update_tree.getCheckedNodes();
                            // 当没有树节点被选择时
                            if (personArr.length === 0) {
                                this.$Message.error(this.$t('authority.adminPermis.just_info'));
                                return;
                            }
                            addManagerUser({
                                orgId: this.enterpriseId,
                                roleId: this.role_id,
                                userIds: HANDLE_PRESON_ID_ARR(personArr)
                            }).then((data) => {
                                if (data.code === this.ERR_CODE) {
                                    this.$Message.success(this.$t('filter_box.save_success'));
                                    console.log('第一个接口---');
                                    // 保存后获取 已添加用户列表
                                    this.getUserCommon();
                                } else {
                                    this.$Message.error(this.$t('filter_box.save_failed'));
                                }
                            }).catch(erro => {
                                this.$Message.error(this.$t('filter_box.save_failed'));
                            });
                        }
                    });
                } else {
                    // 角色名字和input中的名字一致时
                    manageUpdate({
                        id: this.role_id,
                        category: 0,
                        orgId: this.enterpriseId,
                        name: this.role_name,
                        updatePerson: this.userId
                    }).then((data) => {
                        if (data.code !== this.ERR_CODE) {
                            this.$Message.error(this.$t('authority.userManagement.editErr'));
                        } else {
                            this.updateRoleListFlag = true;
                            this.get_manage_user();
                        }
                    });
                    // 将选中的节点组成为数组
                    const personArr = this.$refs.update_tree.getCheckedNodes();
                    // 当没有树节点被选择时
                    if (personArr.length === 0) {
                        this.$Message.error(this.$t('authority.adminPermis.just_info'));
                        return;
                    }
                    // 保存已添加用户列表
                    addManagerUser({
                        orgId: this.enterpriseId,
                        roleId: this.role_id,
                        userIds: HANDLE_PRESON_ID_ARR(personArr)
                    }).then((data) => {
                        if (data.code === this.ERR_CODE) {
                            this.$Message.success(this.$t('saveSuccess'));
                            console.log('第二个接口---');
                            // 保存后获取 已添加用户列表
                            this.getUserCommon();
                        } else {
                            this.$Message.error(this.$t('saveFail'));
                        }
                    });
                }
            },
            // 全选和全不选
            change_add_switch(val) {
                if (val) {
                    for (const item of this.tree_data) {
                        item.checked = true;
                    }
                    setTimeout(() => {
                        this.add_table();
                    }, 500);
                } else {
                    this.my_person = [];
                    this.tree_data = this.get_tree(this.init_tree, this.user_list);
                }
            },
            // 点击左侧角色列表的其中一个
            get_manage_news(item) {
                this.role_id = item.id;
                this.role_name = item.name;
                this.init_name = item.name;
                this.add_switch = false;
                getManager({
                    id: item.id
                }).then((data) => {
                    if (data.code === this.ERR_CODE) {
                        this.currentCategory = data.data.category;
                        // 根据返回的 类别 选择radio
                        switch (data.data.category) {
                            case 1:
                                this.default_check = 'self';
                                this.power_range = this.$t('authority.adminPermis.my_self');
                                break;
                            case 2:
                                this.default_check = 'self';
                                this.power_range = this.$t('authority.adminPermis.my_department');
                                break;
                            case 3:
                                this.default_check = 'self';
                                this.power_range = this.$t('authority.adminPermis.my_company');
                                break;
                            default:
                                this.default_check = 'not_self';
                        }
                    } else {
                        this.$Message.error(this.$t('authority.adminPermis.getRoleInfoFail'));
                    }
                }).catch(erro => {
                    this.$Message.error(this.$t('authority.adminPermis.getRoleInfoFail'));
                });
            },
            // 删除角色
            delete_role(item) {
                this.$confirm(`确定删除 ${item.name} 角色吗？`, this.$t('editSure'))
                    .then(_ => {
                        deleteManager({
                            id: item.id
                        }).then((data) => {
                            if (data.code === this.ERR_CODE) {
                                this.$Message.success(this.$t('deleteSuccess'));
                                this.role_id = null;
                                this.default_check = null;
                                this.updateRoleListFlag = false;
                                this.get_manage_user();
                            } else {
                                this.$Message.error(data.message);
                            }
                            this.visible = false;
                        });
                    });
            },
            // 获取默认管理员及左侧角色列表
            get_manage_user() {
                this.$commonApi.getManageAllByPage({
                    orgId: this.enterpriseId
                }).then((data) => {
                    if (data.code === this.ERR_CODE) {
                        const arr = [];
                        this.is_first = true;
                        if (this.is_first) {
                            // 排序处理
                            for (let i = 0; i < data.data.data.length; i++) {
                                if (data.data.data[i].name === '默认管理员') {
                                    if (!this.updateRoleListFlag) {
                                        this.init_name = data.data.data[i].name;
                                        this.role_id = data.data.data[i].id;
                                        this.role_name = data.data.data[i].name;
                                    }
                                    arr.push(data.data.data[i]);
                                    // 要把默认管理员放在最前面，先截掉再添加
                                    data.data.data.splice(i, 1);
                                    break;
                                }
                            }
                            this.is_first = false;
                        }
                        // 左侧角色列表添加数据
                        this.left_menu = [...arr, ...data.data.data];
                    }
                });
            },
            check_some(rule, value, callback) {
                // 保存修改后的角色名称(也是检查名字是否重复)
                nameManage({
                    orgId: this.enterpriseId,
                    name: this.add_form.name
                }).then((data) => {
                    if (data.code === this.ERR_CODE) {
                        callback();
                    } else {
                        callback(new Error(this.$t('authority.adminPermis.nameRepeated')));
                    }
                }).catch(erro => {
                    callback(new Error(this.$t('authority.adminPermis.nameRepeated')));
                });
            },
            check_update(rule, value, callback) {
                // 保存修改后的角色名称(也是检查名字是否重复)
                nameManage({
                    orgId: this.enterpriseId,
                    name: this.update_form.name
                }).then((data) => {
                    if (data.code === this.ERR_CODE) {
                        callback();
                    } else {
                        callback(new Error(this.$t('authority.adminPermis.nameRepeated')));
                    }
                }).catch(erro => {
                    callback(new Error(this.$t('authority.adminPermis.nameRepeated')));
                });
            },
            // 添加角色
            handle_submit(name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        addManager({
                            orgId: this.enterpriseId,
                            name: this.add_form.name,
                            updatePerson: this.userId,
                            createPerson: this.userId
                        }).then((data) => {
                            if (data.code === this.ERR_CODE) {
                                this.visible_add_role = false;
                                this.addRoleFlag = true;
                                this.updateRoleListFlag = true;
                                this.role_id = data.data;
                                this.init_name = this.add_form.name;
                                this.role_name = this.add_form.name;
                                this.get_manage_user();
                                this.$Message.success(this.$t('addSuccess'));
                            } else {
                                this.$Message.error(this.$t('addFail'));
                            }
                        }).catch(erro => {
                            this.$Message.error(this.$t('addFail'));
                        });
                    }
                });
            },
            // 选择管理类型
            post_power_range(val) {
                let category = '';
                switch (val) {
                    case this.$t('authority.adminPermis.my_self'):
                        category = 1;
                        break;
                    case this.$t('authority.adminPermis.my_department'):
                        category = 2;
                        break;
                    case this.$t('authority.adminPermis.my_company'):
                        category = 3;
                        break;
                }
                manageUpdate({
                    id: this.role_id,
                    category: category,
                    orgId: this.enterpriseId,
                    name: this.role_name,
                    updatePerson: this.userId
                }).then((data) => {
                    if (data.code !== this.ERR_CODE) {
                        this.$Message.error(this.$t('editFail'));
                    }
                }).catch(erro => {
                    this.$Message.error(this.$t('editFail'));
                });
            },
            // 获取用户列表
            get_user_list() {
                this.$commonApi.getUserDataList({
                    departmentId: 0,
                    orgId: this.enterpriseId,
                    pageNo: 1,
                    pageSize: 2000
                }).then((data) => {
                    if (data.code === this.ERR_CODE) {
                        this.user_list = data.data.list;
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                    }
                }).catch(erro => {
                    this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                });
            },
            // 获取用户树
            get_update_tree() {
                this.$commonApi.getDepartmentTree({
                    orgId: this.enterpriseId
                }).then((data) => {
                    if (data.code === this.ERR_CODE) {
                        return new Promise(resolve => {
                            this.init_tree = data.data.list;
                            resolve();
                        });
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.departmentErr'));
                    }
                }).then(data => {
                    // 获取一级菜单
                    this.tree_data = this.get_tree(this.init_tree, this.user_list);
                    // util.ajaxJson({
                    //     url: '/new-privilege/user/getUserDataTables',
                    //     method: 'post',
                    //     data: {
                    //         departmentId: 0,
                    //         orgId: this.enterpriseId,
                    //         pageNo: 1,
                    //         pageSize: 2000
                    //     }
                    // }).then(({ data }) => {
                    //     if (data.code === this.ERR_CODE) {
                    //         this.user_list = data.data.list;
                    //         this.tree_data = this.get_tree(this.init_tree, this.user_list);
                    //     } else {
                    //         this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                    //     }
                    // });
                });
            },
            // 渲染树内容
            renderContent(h, { root, node, data }) {
                function getIcon(str) {
                    if (str === 'person') {
                        return 'person';
                    } else {
                        return 'person-stalker';
                    }
                }

                function getPowerStr(str) {
                    if (str) {
                        return `(${str})`;
                    } else {
                        return '';
                    }
                }

                return h(
                    'span',
                    [
                        h(
                            'span',
                            [
                                h('Icon', {
                                    props: {
                                        type: getIcon(data.type)
                                    },
                                    style: {
                                        marginRight: '8px',
                                        fontSize: getIcon(data.type) === 'person' ? '12px' : '16px'
                                    }
                                }),
                                h('span', data.title),
                                h('span', {
                                    style: {
                                        color: '#FA8241',
                                        marginLeft: '20px',
                                        fontWeight: 900
                                    }
                                }, getPowerStr(data.power))
                            ]
                        )
                    ]
                );
            },
            get_tree(paramArr, user_list, checkArr) {
                // 获取到该企业下所有的人员列表
                const userList = user_list.map(item => {
                    const obj = {};
                    obj.parentId = item.departmentId;
                    obj.name = item.fullname;
                    obj.power = item.manageName;
                    obj.id = item.id;
                    obj.check = false;
                    obj.type = 'person';
                    return obj;
                });

                if (checkArr) {
                    for (const checkItem of checkArr) {
                        for (const userItem of userList) {
                            if (checkItem.userId === userItem.id) {
                                userItem.check = true;
                            }
                        }
                    }
                }
                // 获取到该企业下所有部门列表
                const arr = paramArr.map(item => {
                    const obj = {};
                    obj.parentId = item.parentId;
                    obj.name = item.name;
                    obj.id = item.id;
                    return obj;
                });
                let parentArr = [];
                // 获取到该企业下的一级菜单
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].parentId === 0) {
                        parentArr.push(arr[i]);
                        arr.splice(i, 1);
                        i = i - 1;
                    }
                }

                // 将一级菜单转化为一级树结构
                function structureParentArr(arr) {
                    return arr.map(item => {
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

                parentArr = structureParentArr(parentArr);

                function build_child(parentArr, arr) {
                    /**
                     * @Description: 企业下人员列表和部门列表在后端存储的是两张表，存在人员id和部门id相同的情况
                     * 一旦出现这种情况，会导致本来应属于某一部门下的人员，出现在某一人员的子节点中，示例见bug[1002136]
                     * 解决方案为：
                     * 在获取人员列表时，每一项加上type='person'，部门列表每一项添加上type='department'，
                     * 遍历添加子节点时，加上filter，解决当传入的父节点数组中既有人员又有部门的情况，
                     * 保证只有type为department的父节点才会有children属性，才可以添加子节点
                     * @author 杨娣
                     * @date 2019/11/22
                     */
                    parentArr = parentArr.filter(item => item.type !== 'person');
                    for (let j = 0; j < parentArr.length; j++) {
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i].parentId === parentArr[j].id) {
                                parentArr[j].checked = false;
                                const obj = {};
                                obj.title = arr[i].name;
                                obj.id = arr[i].id;
                                obj.power = arr[i].power;
                                obj.parentId = arr[i].parentId;
                                obj.grandpa_id = parentArr[j].parentId;
                                obj.parent_name = parentArr[j].title;
                                if (arr[i].category === 1) {
                                    obj.menu = 'department';
                                } else {
                                    obj.menu = 'person';
                                }
                                obj.type = arr[i].type;
                                obj.expand = true;
                                obj.checked = arr[i].check;
                                obj.children = [];
                                parentArr[j].children.push(obj);
                                arr.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }
                    if (arr.length) {
                        for (const child_item of parentArr) {
                            if (child_item.children.length) {
                                build_child(child_item.children, arr);
                            }
                        }
                    }

                    return parentArr;
                }

                // 此处arr为该企业下除一级部门外的所有部门列表，
                // userList为该企业下所有的人员列表，以上都要通过遍历添加到对应的树节点
                const newArr = arr.concat(userList);
                return build_child(parentArr, newArr);
            }
        },
        created() {
            this.get_manage_user();
            this.get_user_list();
            this.get_update_tree();
        },
        watch: {
            visible_add_role(val) {
                if (val) {
                    this.add_tree = this.tree_data.map(item => {
                        const obj = {};
                        obj.children = item.children;
                        obj.expand = true;
                        obj.checked = false;
                        obj.id = item.id;
                        obj.parentId = item.parentId;
                        obj.title = item.title;
                        return obj;
                    });
                }
            },
            // 点击左侧单个角色时获取 已添加用户列表
            role_id(val) {
                if (val) {
                    if (this.init_name === '默认管理员') {
                        this.default_check = 'self';
                        this.power_range = this.$t('authority.adminPermis.my_company');
                    } else if (this.addRoleFlag) {
                        this.default_check = 'self';
                        this.power_range = this.$t('authority.adminPermis.my_self');
                    } else {
                        this.power_range = null;
                    }
                    getManageruser({
                        roleId: this.role_id,
                        orgId: this.enterpriseId
                    }).then((data) => {
                        if (data.code === this.ERR_CODE) {
                            this.my_person = data.data;
                            this.tree_data = this.get_tree(this.init_tree, this.user_list, this.my_person);
                        } else {
                            this.$Message.error(this.$t('authority.adminPermis.getAddedListFail'));
                        }
                    }).catch(erro => {
                        this.$Message.error(this.$t('authority.adminPermis.getAddedListFail'));
                    });
                    this.addRoleFlag = false;
                }
            },
            visible_update_role(val) {
                if (val) {
                    setTimeout(() => {
                        this.update_form = {
                            name: this.role_name
                        };
                    });
                }
            },
            default_check(val) {
                if (val === 'self' && !this.power_range) {
                    this.power_range = this.$t('authority.adminPermis.my_self');
                    this.post_power_range(this.power_range);
                }
            },
            'update_form.name': {
                handler(val) {
                    if (val && val.length > 20) {
                        this.update_form.name = val.slice(0, 20);
                        this.$Message.info(this.$t('overLength'));
                    }
                }
            },
            'add_form.name': {
                handler(val) {
                    if (val && val.length > 20) {
                        this.add_form.name = val.slice(0, 20);
                        this.$Message.info(this.$t('overLength'));
                    }
                }
            },
            role_name: {
                handler(val) {
                    if (val && val.length > 20) {
                        this.role_name = val.slice(0, 20);
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
        color: rgba(0, 0, 0, 0.80);
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
                color: #4285F4;

                > span {
                    display: inline-block;
                    cursor: pointer;
                    color: #7e7e7e;

                }

                > span:hover {
                    color: #4285F4;
                }
            }
        }

        .active {
            background-color: #ffffff;
            color: #4285F4;

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
    }
</style>
