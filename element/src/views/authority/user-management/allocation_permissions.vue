<template>
    <Modal :visible.sync="visible"
           :title="$t('authority.userManagement.allocaPermis')"
           :append-to-body="true"
           :modal-append-to-body="false"
           :close-on-click-modal="false"
           custom-class="allocation-permission"
           width="656px"
           @closed="handleModalChange(false)">
        <div :style="`max-height:${window_height - 300}px;overflow:auto;width:615px;margin-bottom:20px`">
            <span style="color:rgba(0,0,0,.8)">{{ $t('authority.userManagement.assInfo') }}</span>
            <div v-for="(user, index) in user_list"
                 :key="index">
                <span class="allocation-person">{{ $t('authority.userManagement.assUser') }}: {{ user.name }}</span>
                <Row class="permission-row">
                    <Col :span="7">
                        <h2>
                            {{$t('authority.functionalPermis.title')}}&nbsp;
                            <Tooltip
                                    trigger="hover"
                                    transfer
                                    placement="top"
                                    :content="$t('authority.userManagement.functionalInfo')"
                            >
                                <Icon
                                        custom="custom custom-tip"
                                        size="14"
                                        style="color:#A9B9C9;margin-bottom:2px"
                                ></Icon>
                            </Tooltip>
                        </h2>
                        <CheckboxGroup v-model="select_functional[index]"
                                       class="vertical-checkbox-group">
                            <Checkbox v-for="(item,index) in functional_list" :key="index" :label="item.label">
                                <template v-if="miniWordsLength(item.label)">
                                    <Tooltip trigger="hover" transfer :content="item.label">
                                        <span>{{item.label | miniWordsStr}}</span>
                                    </Tooltip>
                                </template>
                                <template v-else>
                                    <span>{{item.label}}</span>
                                </template>
                            </Checkbox>
                        </CheckboxGroup>
                    </Col>
                    <Col :span="7">
                        <h2>
                            {{$t('authority.adminPermis.title')}}&nbsp;
                            <Tooltip
                                    trigger="hover"
                                    transfer
                                    placement="top"
                                    :content="$t('authority.userManagement.adminInfo')"
                            >
                                <Icon
                                        custom="custom custom-tip"
                                        size="14"
                                        style="color:#A9B9C9;margin-bottom:2px"
                                ></Icon>
                            </Tooltip>
                        </h2>
                        <CheckboxGroup v-model="select_admin[index]"
                                       class="vertical-checkbox-group">
                            <Checkbox v-for="(item,index) in admin_list" :key="index" :label="item.label">
                                <template v-if="miniWordsLength(item.label)">
                                    <Tooltip trigger="hover" transfer :content="item.label">
                                        <span>{{item.label | miniWordsStr}}</span>
                                    </Tooltip>
                                </template>
                                <template v-else>
                                    <span>{{item.label}}</span>
                                </template>
                            </Checkbox>
                        </CheckboxGroup>
                    </Col>
                    <Col :span="7">
                        <h2>
                            {{$t('authority.fieldPermis.title')}}&nbsp;
                            <Tooltip
                                    trigger="hover"
                                    placement="top"
                                    transfer
                                    :content="$t('authority.userManagement.fileInfo')"
                            >
                                <Icon
                                        custom="custom custom-tip"
                                        size="14"
                                        style="color:#A9B9C9;margin-bottom:2px"
                                ></Icon>
                            </Tooltip>
                        </h2>
                        <CheckboxGroup v-model="select_field[index]"
                                       class="vertical-checkbox-group">
                            <Checkbox v-for="(item,index) in field_list" :key="index" :label="item.label">
                                <template v-if="miniWordsLength(item.label)">
                                    <Tooltip trigger="hover" transfer :content="item.label">
                                        <span>{{item.label | miniWordsStr}}</span>
                                    </Tooltip>
                                </template>
                                <template v-else>
                                    <span>{{item.label}}</span>
                                </template>
                            </Checkbox>
                        </CheckboxGroup>
                    </Col>
                </Row>
            </div>
        </div>
        <div slot="footer">
            <Button @click="handle_cancel">{{ $t('cancel') }}</Button>
            <Button type="primary"
                    :loading="modal_loading"
                    @click="handle_submit('updata_form')">{{ $t('confirm') }}</Button>
        </div>
    </Modal>
</template>

<script>
    import { mapState } from 'vuex';
    import { userManagement } from '@/api/systemSettings/authority-management/index';
    const { editPermission } = userManagement;

    export default {
        name: 'allocation_permissions',
        props: {
            modal: {
                type: Boolean,
                default: false
            },
            delete_title: {
                type: Object
            },
            user: {
                type: Array
            },
            functional_list: {
                type: Array
            },
            admin_list: {
                type: Array
            },
            field_list: {
                type: Array
            }
        },
        data() {
            return {
                visible: false,
                modal_loading: false,
                user_list: [],
                select_functional: [],
                select_admin: [],
                select_field: []
            };
        },
        computed: {
            ...mapState({
                window_height: 'window_height',
                enterpriseId: 'enterpriseId'
            })
        },
        filters: {
            // 超长字符用省略号...
            miniWordsStr(str) {
                let len = 0;
                let temp = 0;
                for (let i = 0; i < str.length; i++) {
                    const c = str.charCodeAt(i); // 单字节加1
                    if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
                        len++;
                    } else {
                        len += 2;
                    }
                    if (len <= 18) {
                        temp++;
                    }
                }
                if (len > 18) {
                    str = `${str.substring(0, temp)}...`;
                }
                return str;
            }
        },
        created() {
            /**
             * 问题：进入部门与用户管理时，network中调了两次获取三个权限的接口（调了6次），
             *      发现是user-management组件在mounted时调用了三个权限，
             *      还有 分配权限组件allocationPermissions 在created时调用了三次
             * 解决方法：使用父组件传过来的值,此组件不再单独请求数据
             */
            // this.get_functional();
            // this.get_manage();
            // this.get_field();
        },
        methods: {
            // 判断字符是否超长溢出
            miniWordsLength(str) {
                let len = 0;
                let temp = 0;
                for (let i = 0; i < str.length; i++) {
                    const c = str.charCodeAt(i); // 单字节加1
                    if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
                        len++;
                    } else {
                        len += 2;
                    }
                    if (len <= 18) {
                        temp++;
                    }
                }
                if (len > 18) {
                    return true;
                } else {
                    return false;
                }
            },
            /** 回填权限 */
            backfill() {
                // 清空原数据
                this.user_list = [];
                this.select_functional = [];
                this.select_admin = [];
                this.select_field = [];
                // 回填权限
                this.user.forEach((user, index) => {
                    if (user.functional_permissions) {
                        this.select_functional[index] = user.functional_permissions.split(',');
                    } else {
                        this.select_functional[index] = [];
                    }
                    if (user.administrative_authority) {
                        this.select_admin[index] = user.administrative_authority.split(',');
                    } else {
                        this.select_admin[index] = [];
                    }
                    if (user.field_permissions) {
                        this.select_field[index] = user.field_permissions.split(',');
                    } else {
                        this.select_field[index] = [];
                    }
                    this.user_list.push(Object.assign({}, user));
                });
            },
            get_id(val1, val2) {
                const arr = [];
                if (val1) {
                    for (let i = 0; i < val1.length; i++) {
                        for (let j = 0; j < val2.length; j++) {
                            if (val1[i] === val2[j].label) {
                                arr.push(val2[j].value);
                            }
                        }
                    }
                }
                return arr;
            },
            // 确定按钮
            handle_submit(name) {
                this.modal_loading = true;
                // 获取权限 + 权限选择校验
                const functional_id = [];
                const admin_id = [];
                const field_id = [];
                const unPass = this.user_list.some((user, index) => {
                    // 功能权限
                    functional_id[index] = this.get_id(
                        this.select_functional[index],
                        this.functional_list
                    );
                    if (functional_id[index].length === 0) {
                        this.$Message.warning(`【${this.user_list[index].name}】没有选择功能权限`);
                        return true;
                    }

                    // 管理权限
                    admin_id[index] = this.get_id(
                        this.select_admin[index],
                        this.admin_list
                    );
                    if (admin_id[index].length === 0) {
                        this.$Message.warning(`【${this.user_list[index].name}】没有选择管理权限`);
                        return true;
                    }

                    // 字段权限
                    field_id[index] = this.get_id(
                        this.select_field[index],
                        this.field_list
                    );
                    if (field_id[index].length === 0) {
                        this.$Message.warning(`【${this.user_list[index].name}】没有选择字段权限`);
                        return true;
                    }
                });
                if (unPass) {
                    this.modal_loading = false;
                    return;
                }

                // 生成请求数据
                const postData = this.user_list.map((user, index) => {
                    return {
                        orgId: this.enterpriseId,
                        userIds: [user.id],
                        fieldPermissionIds: field_id[index],
                        managePermissionIds: admin_id[index],
                        roleIds: functional_id[index]
                    };
                });

                // 发送请求
                editPermission(postData).then(res => {
                    if (res.code === '1') {
                        this.$Message.success(this.$t('authority.userManagement.permisSuccess'));
                        this.$emit('change_permission');
                        this.visible = false;
                    } else {
                        this.$Message.error(res.message);
                    }
                    this.modal_loading = false;
                }).catch(() => {
                    this.$Message.error(this.$t('crm.UniSet.error_edit'));
                    this.modal_loading = false;
                });
            },
            handle_cancel() {
                this.visible = false;
            },
            remove_functional(val) {
                this.select_functional.splice(val, 1);
            },
            remove_admin(val) {
                this.select_admin.splice(val, 1);
            },
            remove_field(val) {
                this.select_field.splice(val, 1);
            },
            get_functional() {
                this.$commonApi.getRoleAllByPage({
                    category: 2,
                    orgId: this.enterpriseId
                }).then(response => {
                    if (response.code === '1') {
                        const val = response.data.data;
                        const arr = [];
                        for (let i = 0; i < val.length; i++) {
                            const obj = {};
                            obj.label = val[i].name;
                            obj.value = val[i].id;
                            arr.push(obj);
                        }
                        this.functional_list = arr;
                    } else {
                        this.$Message.error(response.message);
                    }
                });
            },
            get_manage() {
                this.$commonApi.getManageAllByPage({
                    orgId: this.enterpriseId
                }).then(response => {
                    if (response.code === '1') {
                        const val = response.data.data;
                        const arr = [];
                        for (let i = 0; i < val.length; i++) {
                            const obj = {};
                            obj.label = val[i].name;
                            obj.value = val[i].id;
                            arr.push(obj);
                        }
                        this.admin_list = arr;
                    } else {
                        this.$Message.error(response.message);
                    }
                });
            },
            get_field() {
                this.$commonApi.getFieldAllByPage({
                    orgId: this.enterpriseId
                }).then(response => {
                    if (response.code === '1') {
                        const val = response.data.data;
                        const arr = [];
                        for (let i = 0; i < val.length; i++) {
                            const obj = {};
                            obj.label = val[i].name;
                            obj.value = val[i].id;
                            arr.push(obj);
                        }
                        this.field_list = arr;
                    } else {
                        this.$Message.error(response.message);
                    }
                });
            },
            handleModalChange(val) {
                if (!val) {
                    this.user_list = [];
                    this.select_functional = [];
                    this.select_admin = [];
                    this.select_field = [];
                }
            }
        },
        watch: {
            visible(val) {
                this.$emit('update:modal', val);
                if (val) {
                    this.backfill();
                }
            },
            modal(val) {
                this.visible = val;
            }
        }
    };
</script>

<style scoped lang="less">
    .allocation-permission {

        .allocation-person {
            font-weight: 700;
            font-size: 14px;
            margin: 20px 0;
            color: rgba(0, 0, 0, 0.8);
            display: block;
        }

        .permission-row > div {
            margin-right: 20px;
            border: 1px solid #eaeaea;
            border-radius: 4px;
            height: 201px;

            h2 {
                width: 100%;
                height: 40px;
                line-height: 40px;
                text-align: center;
                font-size: 12px;
                color: rgba(0, 0, 0, 0.8);
                font-weight: 400;
                background-color: #eaeaea;
            }

            /deep/ .el-checkbox-group {
                overflow: scroll;
                height: 160px;
                padding: 10px 15px;

                .el-checkbox {
                    height: 24px;
                    line-height: 24px;
                }
            }

            /deep/ .el-checkbox-group-item {
                margin-bottom: 8px;
                display: flex;
            }

        }
    }
</style>
