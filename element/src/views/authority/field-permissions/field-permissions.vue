<template>
    <div>
        <!-- 字段权限设置 -->
        <Row>
            <!-- 左侧角色列表 -->
            <Col :span="5"
                 style="padding-left: 30px;border-right: 1px solid #e8eaec;">
                <!-- 标题 + 增加角色按钮 -->
                <div class="title">
                    <div>
                        {{ $t('authority.fieldPermis.userList') }}
                        <span @click="add_user"
                              class="add-role">
                            <Icon custom="custom-add"></Icon>
                        </span>
                    </div>
                </div>

                <!-- 角色列表正体 -->
                <ul class="menu_list">
                    <li v-for="(item, index) in user_list"
                        :key="index"
                        @click="get_interface(item)"
                        :class="{active: item.cur}">
                        <!-- 角色名称 -->
                        <div :title="item.name"
                             style="float: left;width: 50%;"
                             class="ellipsis">{{ item.name }}</div>
                        &nbsp;({{ item.personCount }})
                        <!-- 删除按钮 -->
                        <span v-if="item.name !== '默认管理员'">
                            <Icon custom="custom-field-delete" @click="set_remove(item)"/>
                        </span>
                        <!-- 编辑按钮 -->
                        <span v-if="item.name!=='默认管理员'"
                              @click="edit(item)">
                            <Icon custom="custom-field-edit"/>
                        </span>
                    </li>
                </ul>
            </Col>

            <!-- 右侧角色权限区域 -->
            <Col :span="19"
                 style="padding: 0 30px;">
                <fieldBox :table_height="table_height"
                          :select_user="select_user"></fieldBox>
            </Col>
        </Row>

        <!-- 新增角色模态框 -->
        <addModal :modal="add_modal"
                  @change_add_modal="change_add_modal"
                  @add_user_t="add_user_t"></addModal>

        <!-- 修改角色模态框 -->
        <updataModal :modal="updata_modal"
                     :get_info="get_updata_info"
                     @change_updata_modal="change_updata_modal"
                     @get_user="get_user"></updataModal>

    </div>
</template>

<script>
    import fieldBox from '@/views/authority/field-permissions/field_box.vue';
    import addModal from '@/views/authority/field-permissions/add_modal.vue';
    import updataModal from '@/views/authority/field-permissions/updata_modal.vue';
    import { mapState } from 'vuex';
    import { fieldPermissions } from '@/api/systemSettings/authority-management/index';
    const { deleteRole } = fieldPermissions;

    export default {
        name: 'field-permissions',
        components: {
            addModal,
            updataModal,
            fieldBox
        },
        props: {
            content_height: {
                type: String,
                default: '800px'
            }
        },
        data() {
            return {
                user_list: [],
                add_modal: false, // 添加角色弹窗阈值
                select_user: {},
                get_updata_info: {},
                updata_modal: false,
                visible: false
            };
        },
        computed: {
            ...mapState([
                'enterpriseId'
            ]),
            table_height() {
                return `${parseInt(this.content_height) - 200}px`;
            }
        },
        created() {
            this.get_user();
        },
        methods: {
            // 获取左侧角色列表
            get_user() {
                this.user_list = [];
                this.$commonApi.getFieldAllByPage({
                    orgId: this.enterpriseId
                }).then(response => {
                    if (response.code === '1') {
                        const val = response.data.data;
                        let arr = [];
                        const arr1 = [];
                        const arr2 = [];
                        for (let i = 0; i < val.length; i++) {
                            const obj = {};
                            if (val[i].name === '默认管理员') {
                                obj.name = val[i].name; // 显示名字
                                obj.id = val[i].id; // id
                                obj.personCount = val[i].personCount; // 个数
                                if (
                                    JSON.stringify(this.select_user) === '{}' ||
                                    this.select_user.id === val[i].id
                                ) { // 默认被选中
                                    obj.cur = true;
                                } else {
                                    obj.cur = false;
                                }
                                arr1.push(obj);
                            } else {
                                if (this.select_user.id === val[i].id) {
                                    obj.name = val[i].name;
                                    obj.id = val[i].id;
                                    obj.personCount = val[i].personCount;
                                    obj.cur = true;
                                    arr2.push(obj);
                                } else {
                                    obj.name = val[i].name;
                                    obj.id = val[i].id;
                                    obj.personCount = val[i].personCount;
                                    obj.cur = false;
                                    arr2.push(obj);
                                }
                            }
                        }
                        arr = arr1.concat(arr2);
                        // 默认选中第一个
                        if (!this.select_user.id) {
                            this.select_user = arr1[0];
                        }
                        this.user_list = arr;
                    }
                });
            },
            get_interface(item) {
                for (let i = 0; i < this.user_list.length; i++) {
                    this.user_list[i].cur = false;
                }
                item.cur = true;
                const obj = {};
                obj.id = item.id;
                obj.name = item.name;
                this.select_user = obj;
            },
            change_add_modal(val) {
                this.add_modal = val;
            },
            // 点击添加，弹窗显示
            add_user() {
                this.add_modal = true;
            },
            change_updata_modal(val) {
                this.updata_modal = val;
            },
            edit(e) {
                const obj = {};
                obj.id = e.id;
                obj.name = e.name;
                this.get_updata_info = obj;
                this.updata_modal = true;
            },
            // 删除角色
            set_remove(e) {
                this.$confirm(`确定删除 ${e.name} 角色吗？`, this.$t('editSure'))
                    .then(_ => {
                        deleteRole({
                            id: e.id
                        }).then(response => {
                            if (response.code === '1') {
                                this.$Message.success(this.$t('authority.fieldPermis.delUser'));
                                // 删除时给 select_user 置空,默认选中默认管理员
                                this.select_user = this.user_list[0];
                                this.get_user();
                            } else {
                                this.$Message.error(response.message);
                            }
                            this.visible = false;
                        });
                    });
            },
            add_user_t(val) {
                this.select_user = val;
                this.get_user();
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
