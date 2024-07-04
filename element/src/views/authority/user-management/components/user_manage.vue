<template>
    <div class="user_manage" style="overflow-y:auto;">
        <div v-if="!manage_id && !manage_name">
            <!-- 暂无数据 -->
            {{$t('crm.Table.noData')}}
        </div>
        <div v-else>
            <div class="manage-list">
                <Button round :class="(item.manageId === current_manage_id)  ? 'active': ''"
                        v-for="item in manageList" :key="item.manageId"
                        @click="changeRole(item.manageId, item.manageName)">{{item.manageName}}
                </Button>
            </div>
            <div v-show="manage_id">
                <div class="right_explain">
                    <RadioGroup v-model="default_check"
                                class="vertical-radio-group">
                        <Radio label="self" disabled style="display: flex;align-items: center;"
                               v-if="default_check === 'self'">
                                <span style="font-size: 14px;width: 95%;white-space: normal;">
                                      {{$t('authority.adminPermis.explain_one')}}
                                </span>
                        </Radio>
                        <Radio label="not_self" disabled v-else>
                                <span style="font-size: 14px">
                                      {{$t('authority.adminPermis.custom_settings')}}
                                </span>
                        </Radio>
                    </RadioGroup>

                    <div style="margin-top: 20px;padding-bottom: 60px;margin-left: 23px"
                         v-if="default_check === 'self'">
                            <span style="font-size: 14px">
                                   {{$t('authority.adminPermis.management_type')}}
                            </span>
                        <RadioGroup v-model="power_range"
                                    @change="post_power_range">
                            <Radio :label="$t('authority.adminPermis.my_self')" style="margin-left: 15px"
                                   disabled></Radio>
                            <Radio :label="$t('authority.adminPermis.my_department')" style="margin-left: 15px"
                                   disabled></Radio>
                            <Radio :label="$t('authority.adminPermis.my_company')" style="margin-left: 15px"
                                   disabled value="true"></Radio>
                        </RadioGroup>
                    </div>

                </div>


                <Row style="padding-left: 20px" v-if="default_check !== 'self'">
                    <Col>
                        <div style="line-height: 50px;font-weight: bold">
                            <span v-if="!has_save">
                                   {{$t('authority.adminPermis.user_list_added')}}
                            </span>
                            <span v-else style="color: #0ab512">
                                      {{$t('authority.adminPermis.user_list_selected')}}
                            </span>
                        </div>
                        <Table :data="my_person"
                        >
                            <TableColumn v-for="(item, index) in my_person_columns" :key="index" :prop="item.key" :label="item.title"></TableColumn>
                        </Table>
                    </Col>
                </Row>
            </div>
        </div>
    </div>
</template>
<script>
    import { mapState } from 'vuex';
    import { administrativeAuthority } from '@/api/systemSettings/authority-management/index';
    const { manageUpdate, getManager, getManageruser } = administrativeAuthority;

    export default {
        data() {
            return {
                default_check: 'self',
                power_range: null,
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
                manage_id: 0, // 管理角色Id
                manage_name: null, // 管理角色name
                init_tree: [],
                user_list: [],
                tree_data: [],
                current_manage_id: 0, // 当前角色id
                current_manage_name: null // 当前角色name
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
            }
        },
        computed: {
            ...mapState([
                'enterpriseId'
            ]),
            has_save() {
                if (this.is_save) {
                    return true;
                } else {
                    return false;
                }
            },
            is_default() {
                if (this.default_check === 'self') {
                    return false;
                } else {
                    return true;
                }
            },
            is_manager() {
                if (this.current_manage_name === '默认管理员') {
                    return true;
                } else {
                    return false;
                }
            },
            manageList() {
                if (this.manage_id && this.manage_name) {
                    const manageNameList = this.manage_name.split(',');
                    const manageIdList = this.manage_id.split(',');
                    const manageList = manageNameList.map((item, index) => {
                        return {
                            manageName: item,
                            manageId: manageIdList[index]
                        };
                    });
                    const index = manageList.findIndex(item => item.manageName === '默认管理员');
                    if (index !== -1) {
                        const indexArr = manageList.splice(index, 1);
                        manageList.unshift(...indexArr);
                    }
                    this.current_manage_id = manageList[0].manageId;
                    this.current_manage_name = manageList[0].manageName;
                    return manageList;
                }
            }
        },
        methods: {
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
                    this.$commonApi.getUserDataList({
                        departmentId: 0,
                        orgId: this.enterpriseId,
                        pageNo: 1,
                        pageSize: 2000
                    }).then((data) => {
                        if (data.code === this.ERR_CODE) {
                            this.user_list = data.data.list;
                            this.tree_data = this.get_tree(this.init_tree, this.user_list);
                        } else {
                            this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                        }
                    }).catch(erro => {
                        this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                    });
                });
            },
            get_tree(param_arr, user_list, check_arr) {
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

                if (check_arr) {
                    for (const check_item of check_arr) {
                        for (const user_item of userList) {
                            if (check_item.userId === user_item.id) {
                                user_item.check = true;
                            }
                        }
                    }
                }
                const arr = param_arr.map(item => {
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
                    return arr.map(item => {
                        const obj = {};
                        obj.title = item.name;
                        obj.id = item.id;
                        obj.parentId = item.parentId;
                        obj.checked = item.check;
                        obj.expand = true;
                        obj.children = [];
                        /* 禁用多选框 */
                        obj.disableCheckbox = true;
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
                                obj.power = arr[i].power;
                                obj.parentId = arr[i].parentId;
                                obj.grandpa_id = parent_arr[j].parentId;
                                obj.parent_name = parent_arr[j].title;
                                /* 禁用多选框 */
                                obj.disableCheckbox = true;
                                if (arr[i].category === 1) {
                                    obj.menu = 'department';
                                } else {
                                    obj.menu = 'person';
                                }
                                obj.type = arr[i].type;
                                obj.expand = true;
                                obj.checked = arr[i].check;
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

                const new_arr = arr.concat(userList);
                return build_child(parent_arr, new_arr);
            },
            renderContent(h, { root, node, data }) {
                function get_icon(str) {
                    if (str === 'person') {
                        return 'person';
                    } else {
                        return 'person-stalker';
                    }
                }

                function get_power_str(str) {
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
                                        type: get_icon(data.type)
                                    },
                                    style: {
                                        marginRight: '8px',
                                        fontSize: get_icon(data.type) === 'person' ? '12px' : '16px'
                                    }
                                }),
                                h('span', data.title),
                                h('span', {
                                    style: {
                                        color: '#fc8c30',
                                        marginLeft: '20px',
                                        fontWeight: 900
                                    }
                                }, get_power_str(data.power))
                            ]
                        )
                    ]
                );
            },
            post_power_range(val) {
                let category = null;
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
                    updatePerson: this.user_id
                }).then((data) => {
                    if (data.code !== this.ERR_CODE) {
                        this.$Message.error(this.$t('editFail'));
                    }
                });
            },
            changeRole(manageId, manageName) {
                this.current_manage_id = manageId;
                this.current_manage_name = manageName;
                this.get_manage_news(this.current_manage_id, this.current_manage_name);
            },
            get_manage_news(id, name) {
                this.role_id = id;
                this.role_name = name;
                this.init_name = name;
                this.add_switch = false;
                getManager({
                    id
                }).then((data) => {
                    if (data.code === this.ERR_CODE) {
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
                });
            }
        },
        created() {
            this.get_update_tree();
        },
        mounted() {
            this.get_manage_news(this.current_manage_id, this.current_manage_name);
        },
        watch: {
            userInfo: {
                handler() {
                    this.manage_id = this.userInfo.manageId;
                    this.manage_name = this.userInfo.administrative_authority;
                },
                immediate: true
            },
            current_manage_id(val) {
                if (val) {
                    if (this.current_manage_name === '默认管理员') {
                        this.power_range = this.$t('authority.adminPermis.my_company');
                    } else {
                        this.power_range = null;
                    }
                    getManageruser({
                        roleId: this.current_manage_id,
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
                }
            }
        }
    };
</script>
<style lang="less" scoped>
    .manage-list {
        margin-left: 10px;
        padding-bottom: 10px;

        .active {
            border: 1px solid #4285f4;
            color: #4285f4;
            padding: 3px 12px 3px;
            box-shadow: none;
        }
    }
</style>
