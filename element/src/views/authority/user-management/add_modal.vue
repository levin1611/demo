<template>
    <Modal :visible.sync="add_modal"
           :title="$t('authority.addUser')"
           :append-to-body="true"
           :modal-append-to-body="false"
           :close-on-click-modal="false"
           width="914px"
           top="10vh"
           @close="$refs.add_form.resetFields()"
           class="authority_add_modal">
        <div style="width:100%;overflow-x:hidden;overflow-y:auto;max-height:68vh;min-height: 250px">
            <Form :model="add_form"
                :inline="true"
                :rules="add_form_rule"
                :label-width="$lang === 'zh-CN'?'160px':'180px'"
                ref="add_form">
                <div class="title">{{$t('authority.accountInfo')}}</div>
                <div class="wrap">
                    <FormItem :label="$t('authority.userManagement.lname')"
                        prop="login_name"
                        class="width-365px">
                        <Input v-model="add_form.login_name"
                            :placeholder="$t('authority.userManagement.lnameTip')"></Input>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.passwd')"
                        prop="password"
                        class="width-365px">
                        <Input v-model="add_form.password"
                            :placeholder="$t('authority.userManagement.passwd')"
                            class="password-input">
                            <!-- 超长提示 -->
                            <div slot="suffix"
                                :class="{'password-input-overLength': add_form.password.length > 20}">{{ `${add_form.password.length}/20` }}</div>
                        </Input>
                        <!-- 系统 tip -->
                        <HelpTip :title="$t('helpTip.password')"
                                class="password-rule-tip"></HelpTip>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.name')"
                        prop="name"
                        class="width-365px">
                        <Input v-model="add_form.name"
                            :placeholder="$t('authority.userManagement.name')"></Input>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.ename')"
                        prop="english_name"
                        class="width-365px">
                        <Input v-model="add_form.english_name"
                            :placeholder="$t('authority.userManagement.ename')"></Input>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.tel')"
                        class="width-365px">
                        <Input v-model="add_form.tell"
                            :placeholder="$t('authority.userManagement.tel')"></Input>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.email')"
                        prop="mail"
                        class="width-365px">
                        <Input v-model="add_form.mail"
                            :placeholder="$t('authority.userManagement.email')"
                            @blur="change_email"></Input>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.sex')"
                        style="z-index: 100"
                        class="width-365px">
                        <Select v-model="add_form.sex"
                                :placeholder="$t('authority.userManagement.selectSex')">
                            <Option v-for="item in isSex"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"></Option>
                        </Select>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.department')"
                            prop="department"
                            style="z-index: 90"
                            class="width-365px">
                        <Select v-model="add_form.department"
                                :disabled="add_form.open"
                                filterable
                                :placeholder="$t('authority.userManagement.selectDepartment')">
                            <Option v-for="item in all_department"
                                    :key="item.value+item.label"
                                    :value="item.value"
                                    :label="item.label"
                                    :style="{ paddingLeft: item.hierarchy }"
                                    :class="`${item.hierarchyName} depart`"></Option>
                        </Select>
                    </FormItem>
                </div>
                <div class="title">{{$t('authority.rightsProfile')}}</div>
                <div class="wrap">
                    <FormItem :label="$t('authority.userManagement.functionalPermis')"
                        prop="roleIds"
                        style="z-index: 70"
                        class="width-365px">
                        <Select v-model="add_form.roleIds" multiple>
                            <Option v-for="item in functional_list"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"></Option>
                        </Select>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.adminPermis')"
                        prop="managePermissionIds"
                        style="z-index: 70"
                        class="width-365px">
                        <Select v-model="add_form.managePermissionIds" multiple>
                            <Option v-for="item in admin_list"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"></Option>
                        </Select>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.fieldPermis')"
                        prop="fieldPermissionIds"
                        style="z-index: 70"
                        class="width-365px">
                        <Select v-model="add_form.fieldPermissionIds" multiple>
                            <Option v-for="item in field_list"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"></Option>
                        </Select>
                    </FormItem>
                </div>
                <div class="title">{{$t('authority.accountRole')}}</div>
                <div class="wrap">
                    <FormItem :label="$t('authority.userManagement.hasInquiries')"
                        prop="has_inquiries"
                        style="z-index: 70"
                        class="width-365px">
                        <Select v-model="add_form.inquiries">
                            <Option v-for="item in isOK"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"></Option>
                        </Select>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.hasChat')"
                        prop="has_chat"
                        style="z-index: 80"
                        class="width-365px">
                        <Select v-model="add_form.chat">
                            <Option v-for="item in isOK"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"></Option>
                        </Select>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.isWABAService')"
                        prop="has_WABA_service"
                        style="z-index: 80"
                        class="width-365px">
                        <Select v-model="add_form.has_WABA_service">
                            <Option v-for="item in isOK"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"></Option>
                        </Select>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.isfbService')"
                        prop="has_fb_service"
                        style="z-index: 80"
                        class="width-365px">
                        <Select v-model="add_form.fb_service">
                            <Option v-for="item in isOK"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"></Option>
                        </Select>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.personInCharge')"
                        prop="has_fb_service"
                        style="z-index: 80"
                        class="width-365px">
                        <Select v-model="add_form.isDeptManager">
                            <Option v-for="item in isOK"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"></Option>
                        </Select>
                    </FormItem>
                    <FormItem :label="$t('authority.remark')"
                        prop="remark"
                        class="width-365px">
                        <Input v-model="add_form.remark" :placeholder="$t('authority.remark')"></Input>
                    </FormItem>
                </div>
            </Form>
        </div>

        <div slot="footer">
            <Button @click="handle_cancel">{{ $t('cancel') }}</Button>
            <Button type="primary"
                    :loading="modal_loading"
                    @click="handle_submit('add_form')">{{ $t('confirm') }}</Button>
        </div>
    </Modal>
</template>

<script>
    import Vue from 'vue';
    import { mapState } from 'vuex';
    import { userManagement } from '@/api/systemSettings/authority-management/index';
    const { verifyLoginName, verifyName, increaseUser } = userManagement;

    export default {
        name: 'add_modal',
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
            get_department: {
                type: Array
            },
            height: {
                type: String
            },
            createOrEditUser: {
                type: Boolean,
                default: false
            },
            orgId: {
                type: String
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
        computed: {
            ...mapState([
                'enterpriseId',
                'userName'
            ]),
            $lang() {
                return Vue.config.lang;
            }
        },
        data() {
            // 验证登录名检查
            const validateLoginNameCheck = (rule, value, callback) => {
                verifyLoginName(value).then(response => {
                    if (response.code === '1') {
                        callback();
                    } else {
                        callback(new Error(this.$t('authority.userManagement.nameExists')));
                    }
                }).catch(erro => {
                    callback(new Error(this.$t('authority.userManagement.nameExists')));
                });
            };
            // 验证名称检查
            const validateNameCheck = (rule, value, callback) => {
                verifyName({
                    orgId: this.orgId,
                    value
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
            // 验证密码
            const validePassword = (rule, value, callback) => {
                // 是否包含空格
                if (/\s/.test(value)) {
                    callback(new Error(this.$t('password_space_tip')));
                    return;
                }
                // 字符种类判断
                if (/^(\d+$|[a-z]+$|[A-Z]+$|((?=[!-~])[^\da-zA-Z])+$)/.test(value)) {
                    callback(new Error(this.$t('password_charKindCount_tip')));
                    return;
                }
                // 输入了其他类别的字符
                if (/[^!-~]/.test(value)) {
                    callback(new Error(this.$t('password_charKindError_tip')));
                    return;
                }
                callback();
            };

            return {
                add_modal: false,
                modal_loading: false,
                add_form: {
                    name: '',
                    mail: '',
                    login_name: '',
                    sex: 1,
                    english_name: '',
                    tell: '',
                    password: '',
                    department: '',
                    id: 1,
                    chat: 1,
                    inquiries: 1,
                    fb_service: 1,
                    has_WABA_service: 1,
                    isDeptManager: 2,
                    open: false,
                    remark: '',
                    roleIds: [], // 功能权限
                    managePermissionIds: [], // 管理权限
                    fieldPermissionIds: [] // 字段权限
                },
                add_form_rule: {
                    name: [
                        { required: true, message: this.$t('authority.userManagement.nameEmpty'), trigger: 'blur' },
                        { validator: validateNameCheck, trigger: 'blur' },
                        { max: 30, message: this.$t('authority.userManagement.maxLengthLimit') + 30, trigger: 'blur' }
                    ],
                    mail: [
                        { required: false, message: this.$t('authority.userManagement.emailEmpty'), trigger: 'blur' },
                        { type: 'email', message: this.$t('authority.userManagement.emailErr'), trigger: 'blur' },
                        { max: 100, message: this.$t('authority.userManagement.maxLengthLimit') + 100, trigger: 'blur' }
                    ],
                    login_name: [
                        { required: true, message: this.$t('authority.userManagement.lnameEmpty'), trigger: 'change' },
                        { validator: validateLoginNameCheck, trigger: 'blur' },
                        { max: 100, message: this.$t('authority.userManagement.maxLengthLimit') + 100, trigger: 'blur' }
                    ],
                    // sex: [
                    //     {
                    //         required: true,
                    //         message: this.$t('authority.userManagement.selectSex'),
                    //         trigger: 'change',
                    //         type: 'number'
                    //     }
                    // ],
                    english_name: [
                        { required: true, message: this.$t('authority.userManagement.enameEmpty'), trigger: 'blur' },
                        { max: 50, message: this.$t('authority.userManagement.maxLengthLimit') + 50, trigger: 'blur' }
                    ],
                    // tell: [
                    //     { required: false, message: this.$t('authority.userManagement.telEmpty'), trigger: 'blur' },
                    //     { max: 20, message: this.$t('authority.userManagement.maxLengthLimit') + 20, trigger: 'blur' }
                    // ],
                    password: [
                        { required: true, message: this.$t('new_password_tip'), trigger: 'blur' },
                        { min: 8, message: this.$t('password_min_tip'), trigger: 'blur' },
                        { max: 20, message: this.$t('password_max_tip'), trigger: ['blur', 'change'] },
                        { validator: validePassword, trigger: 'blur' }
                    ],
                    department: [
                        {
                            required: true,
                            message: this.$t('authority.userManagement.deparEmpty'),
                            trigger: 'change',
                            type: 'number'
                        }
                    ],
                    remark: [
                        { max: 50, message: this.$t('authority.userManagement.maxLengthLimit') + 50, trigger: 'blur' }
                    ],
                    roleIds: [
                        { required: true, message: this.$t('authority.userManagement.selectFunctionalPermis'), trigger: ['blur', 'change'] }
                    ],
                    managePermissionIds: [
                        { required: true, message: this.$t('authority.userManagement.selectAdminPermis'), trigger: ['blur', 'change'] }
                    ],
                    fieldPermissionIds: [
                        { required: true, message: this.$t('authority.userManagement.selectFieldPermis'), trigger: ['blur', 'change'] }
                    ]
                },
                isOK: [
                    {
                        value: 1,
                        label: this.$t('authority.yes')
                    },
                    {
                        value: 2,
                        label: this.$t('authority.no')
                    }
                ],
                isSex: [
                    {
                        value: 1,
                        label: this.$t('authority.male')
                    },
                    {
                        value: 0,
                        label: this.$t('authority.female')
                    }
                ],
                all_department: []
            };
        },
        methods: {
            // 新增用户确定按钮
            handle_submit(name) {
                this.modal_loading = true;
                // 表单校验
                this.$refs[name].validate((valid) => {
                    const addForm = this.add_form;
                    if (valid) {
                        this.get_add_data(this.add_form);
                    } else {
                        if (addForm.name && addForm.english_name && addForm.login_name &&
                            addForm.mail && addForm.password && addForm.sex > -1 && addForm.department) {
                            this.$Message.error(this.$t('authority.userManagement.checkUserInfo'));
                        } else {
                            this.$Message.error(this.$t('authority.userManagement.noEmptyWarning'));
                        }
                        this.modal_loading = false;
                    }
                });
            },
            handle_cancel() {
                this.add_modal = false;
                this.modal_loading = false;
            },
            // 校验完成后，发送新增用户的请求
            get_add_data(val) {
                const obj = {};
                obj.fullname = val.name;
                obj.realName = val.english_name;
                obj.email = val.mail;
                obj.username = val.login_name;
                obj.password = val.password;
                obj.gender = parseInt(val.sex);
                obj.departmentId = val.department;
                obj.phone = val.tell;
                obj.remark = val.remark;
                obj.canChat = parseInt(val.chat);
                obj.isDeptManager = parseInt(val.isDeptManager);
                obj.canGetInquiry = parseInt(val.inquiries);
                obj.canFbManage = parseInt(val.fb_service);
                obj.canWabaService = parseInt(val.has_WABA_service);

                increaseUser({
                    emulateJSON: true,
                    user: obj,
                    roleIds: val.roleIds,
                    managePermissionIds: val.managePermissionIds,
                    fieldPermissionIds: val.fieldPermissionIds,
                    orgId: this.enterpriseId,
                    operatorName: this.userName
                }).then(response => {
                    if (response.code === '1') {
                        this.$Message.success(this.createOrEditUser ? this.$t('authority.userManagement.editSuccess') : this.$t('portal_set.add_success'));
                        // 新增用户后,获取所有
                        this.$emit('get_add_user');
                        this.add_modal = false;
                    } else {
                        if (response.message === '本企业的已启用账号数已达上限，请联系负责人购买更多账号') {
                            // this.$Message.error(response.message);
                            this.$Message.error(this.$t('authority.userManagement.userNumLimitTip'));
                        } else {
                            this.$Message.error(response.message);
                        }
                    }
                    this.add_modal = false;
                    this.modal_loading = false;
                }).catch(() => {
                    this.add_modal = false;
                    this.modal_loading = false;
                });
            },
            change_email() {
                // this.add_form.mail = this.add_form.mail.trim();
                // this.add_form.login_name == '' ? this.add_form.login_name = this.add_form.mail : '';
            }
        },

        watch: {
            add_modal(val) {
                this.$emit('change_add_modal', val);
                if (!val) {
                    this.add_form = {
                        name: '',
                        mail: '',
                        login_name: '',
                        sex: 1,
                        english_name: '',
                        tell: '',
                        password: '',
                        department: '',
                        id: 1,
                        chat: 1,
                        inquiries: 1,
                        fb_service: 1,
                        has_WABA_service: 1,
                        open: false,
                        roleIds: [], // 功能权限
                        managePermissionIds: [], // 管理权限
                        fieldPermissionIds: [] // 字段权限
                    };
                }
            },
            modal(val) {
                this.add_modal = val;
            },
            get_department(val) {
                for (let i = 0; i < val.length; i++) {
                    if (val[i].selected) {
                        this.add_form.open = true;
                        this.add_form.department = val[i].value;
                    }
                }
                this.all_department = [];
                this.all_department = val.map(item => {
                    const obj = {};
                    obj.label = item.label;
                    obj.value = item.value;
                    obj.selected = item.selected;
                    obj.hierarchy = `${item.hierarchy * 20 + 15}px`;
                    obj.hierarchyName = `depart${item.hierarchy}`;
                    return obj;
                });
            }
        }
    };
</script>

<style scoped lang="less">
    .authority_add_modal {
        .title {
            line-height: 26px;
            margin-bottom: 10px;
            font-size: 15px;
            color: rgba(0, 0, 0, 0.8);
            font-weight: 600;
        }
        .wrap {
            margin: 0;
        }
        .width-365px {
            width: 400px;
            .el-input {
                width: 220px;
            }
            .el-select {
                width: 220px;
                /deep/ .el-select__tags{
                    max-height: 140px;
                    overflow: auto;
                }
            }
        }
        /deep/ .el-dialog__header {
            padding: 24px 30px 10px;
        }
        /deep/ .el-dialog__body {
            padding: 10px 30px;
        }
        /deep/ .el-dialog__footer {
            padding: 10px 30px 24px;
        }
        /deep/ .el-form-item {
            margin: 0 0 24px;
        }
        /deep/ .el-form-item__content {
            line-height: 34px;
        }
        /deep/ .el-form-item__label {
            line-height: 34px;
            font-size: 14px;
            text-align: right;
        }
    }
    .depart {
        position: relative;
    }
    .depart::after {
        content: "";
        display: block;
        border-top: 2px dotted #ccc;
        height: 0;
        width: 20px;
        position: absolute;
        left: 10px;
        top: 15px;
    }
    .depart::before {
        content: "";
        display: block;
        border-left: 2px dotted #ccc;
        height: 30px;
        width: 0px;
        position: absolute;
        left: 10px;
        top: 0px;
    }
    .depart1::after {
        width: 20px
    }
    .depart2::after {
        width: 40px
    }
    .depart3::after {
        width: 60px
    }
    .depart4::after {
        width: 80px
    }
    .depart5::after {
        width: 100px
    }
    .depart6::after {
        width: 120px
    }
    .depart7::after {
        width: 140px
    }
    .depart8::after {
        width: 160px
    }
    .depart9::after {
        width: 180px
    }
    .depart10::after {
        width: 200px
    }
    .depart:first-child::before {
        height: 15px;
        top: 15px;
    }
    .depart:last-child::before {
        height: 15px;
    }
    .password-rule-tip {
        position: absolute;
        right: -24px;
    }
    .password-input {
        /deep/ .el-input__inner {
            padding-right: 50px;
        }
        /deep/ .password-input-overLength {
            color: #f56c6c;
        }
    }
</style>
