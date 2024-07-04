<template>
    <Modal :visible.sync="add_modal"
           :title="$t('authority.userManagement.addDepartment')"
           :append-to-body="true"
           :modal-append-to-body="false"
           :close-on-click-modal="false"
           width="520px"
           @close="$refs.add_form.resetFields()"
           class="add_department_modal">
        <div style="width:100%;padding:0 10%;margin:0 auto;overflow-x:hidden">
            <Form :model="add_form"
                  :rules="add_form_rule"
                  label-width="120px"
                  ref="add_form">
                <FormItem :label="$t('authority.userManagement.departmentName')"
                          prop="name">
                    <Input v-model="add_form.name"
                            :class="{'error': errorName}"
                           :placeholder="$t('authority.userManagement.departmentName')">
                           <span slot="suffix">{{ add_form.name.length }}/30</span>
                    </Input>
                </FormItem>
                <FormItem :label="$t('authority.ord')"
                          prop="sortNo">
                    <Input v-model.number="add_form.sortNo"
                           :placeholder="$t('authority.ord')+'(0~9999)'"
                           :maxlength="4"></Input>
                </FormItem>
                <FormItem :label="$t('authority.remark')"
                          prop="remark">
                    <Input v-model="add_form.remark"
                           :placeholder="$t('authority.remark')"></Input>
                </FormItem>
            </Form>
        </div>
        <div slot="footer">
            <Button @click="handle_cancel('add_form')">{{ $t('cancel') }}</Button>
            <Button type="primary"
                    :loading="modal_loading"
                    @click="handle_submit('add_form')">{{ $t('confirm') }}</Button>
        </div>
    </Modal>
</template>

<script>
    import { mapState } from 'vuex';
    import { userManagement } from '@/api/systemSettings/authority-management/index';
    const { isSameDeptName } = userManagement;

    export default {
        name: 'add_tree',
        props: {
            modal: {
                type: Boolean,
                default: false
            },
            loading: {
                type: Boolean,
                default: false
            },
            url: {
                type: String
            },
            get_add_form: {
                type: Object
            }
        },
        computed: {
            ...mapState([
                'enterpriseId'
            ])
        },
        data() {
            // 校验排序
            const validateNumberCheck = (rule, value, callback) => {
                const rag = /^[0-9]*$/;
                if (!rag.test(value)) {
                    callback(new Error('请输入0~9999内的数字'));
                } else {
                    callback();
                }
            };
            // 校验部门名称
            const validateDepartmentCheck = (rule, value, callback) => {
                if (value.indexOf(' ') !== -1) {
                    callback(new Error(this.$t('authority.userManagement.nameSpace')));
                }
                if (value.length >= 31) {
                    callback(new Error('部门名称长度不能超过30个字符'));
                }
                isSameDeptName({
                    orgId: this.enterpriseId,
                    name: value
                }).then(response => {
                    if (response.code === '1') {
                        callback();
                    } else {
                        callback(new Error(this.$t('authority.userManagement.nameExists')));
                    }
                }).catch(erro => {
                    callback(new Error(this.$t('authority.userManagement.nameExists')));
                });
            };
             // 校验部门名称
             const validateDepartmentCheckLen = (rule, value, callback) => {
                if (value.length >= 31) {
                    this.errorName = true;
                    callback(new Error('部门名称长度不能超过30个字符'));
                } else {
                    callback();
                    this.errorName = false;
                }
            };
            return {
                add_modal: false,
                modal_loading: false,
                add_form: {
                    name: '',
                    sortNo: '',
                    remark: ''
                },
                errorName: false,
                add_form_rule: {
                    name: [
                        {
                            required: true,
                            message: this.$t('authority.userManagement.dnameEmpty'),
                            trigger: 'blur'
                        },
                        {
                            validator: validateDepartmentCheck,
                            trigger: 'blur'
                        },
                        {
                            validator: validateDepartmentCheckLen,
                            trigger: 'change'
                        }
                    ],
                    sortNo: [
                        {
                            required: true,
                            message: this.$t('authority.userManagement.need_number'),
                            trigger: 'blur',
                            type: 'number'
                        },
                        {
                            validator: validateNumberCheck,
                            trigger: 'blur'
                        }
                    ]
                }
            };
        },
        methods: {
            // 确认新增部门
            handle_submit(name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.modal_loading = true;
                        this.$emit('set_add_tree', this.add_form);
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.addDepartmentErr'));
                    }
                });
            },
            // 取消新增部门
            handle_cancel(name) {
                this.add_modal = false;
            }
        },
        watch: {
            add_modal(val) {
                this.$emit('change_add_tree', val);
            },
            modal(val) {
                this.add_modal = val;
            },
            loading(val) {
                this.modal_loading = val;
            },
            modal_loading(val) {
                this.$emit('change_tree_loading', val);
            },
            get_add_form(val) {
                // this.add_form = val || this.add_form;
            }
        }
    };
</script>

<style scoped lang="less">
    .add_department_modal {
        /deep/ .el-form-item {
            margin-bottom: 16px;
        }
        /deep/ .el-form-item__label {
            font-size: 12px;
            text-align: right;
        }

        /deep/ .el-input {
            width: 250px;
        }
        /deep/ .error.el-input .el-input__count .el-input__count-inner {
            color: #F56C6C;
        }
        /deep/ .el-input--suffix .el-input__inner{
            padding-right: 48px;
        }
        /deep/ .el-input__suffix{
            color: rgba(0, 0, 0, .8);
        }
        /deep/ .error.el-input .el-input__suffix {
            color: #F56C6C;
        }
    }
</style>
