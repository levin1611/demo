<template>
    <Modal :visible.sync="updata_modal"
           :title="$t('authority.userManagement.editUser')"
           :append-to-body="true"
           :modal-append-to-body="false"
           :mask-closable="false"
           width="914px"
           top="10vh"
           class="updata_user_modal">
        <div style="width:100%;overflow-x:hidden;overflow-y:auto;max-height:68vh;min-height: 250px">
            <Form :model="updata_form"
                :inline="true"
                :rules="updata_form_rule"
                :label-width="$lang === 'zh-CN'?'160px':'180px'"
                ref="updata_form">
                <div class="title">{{$t('authority.accountInfo')}}</div>
                <div class="wrap">
                    <FormItem :label="$t('authority.userManagement.lname')"
                        prop="lname"
                        class="width-365px">
                        <Input v-model="updata_form.lname"
                            :placeholder="$t('authority.userManagement.lnameTip')"></Input>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.passwd')"
                        prop="passwd"
                        class="width-365px">
                        <Input v-model="updata_form.passwd"
                            type="password"
                            :placeholder="$t('authority.userManagement.passwd')"
                            autocomplete="new-password"
                            class="password-input">
                            <!-- 超长提示 -->
                            <div slot="suffix"
                                :class="{'password-input-overLength': passwdChanged && updata_form.passwd.length > 20}">{{ `${updata_form.passwd.length}/20` }}</div>
                        </Input>
                        <!-- 系统 tip -->
                        <HelpTip :title="$t('helpTip.password')"
                                class="password-rule-tip"></HelpTip>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.name')"
                        prop="name"
                        class="width-365px">
                        <Input v-model="updata_form.name"
                            :placeholder="$t('authority.userManagement.name')"></Input>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.ename')"
                        prop="ename"
                        class="width-365px">
                        <Input v-model="updata_form.ename"
                            :placeholder="$t('authority.userManagement.ename')"></Input>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.tel')"
                        class="width-365px">
                        <Input v-model="updata_form.tel"
                            :placeholder="$t('authority.userManagement.tel')"></Input>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.email')"
                        prop="email"
                        class="width-365px">
                        <Input v-model="updata_form.email"
                            :placeholder="$t('authority.userManagement.email')"></Input>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.sex')"
                        class="width-365px">
                        <Select v-model="updata_form.sex"
                                :placeholder="$t('authority.userManagement.selectSex')">
                            <Option v-for="item in isSex"
                                    :value="item.value"
                                    :key="item.value"
                                    :label="item.label"></Option>
                        </Select>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.department')"
                        prop="department"
                        class="width-365px">
                        <Select v-model="updata_form.departmentId"
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
                    <FormItem :label="$t('per_setting.personalPhone')"
                        v-if="updata_form.phoneNumber"
                        class="width-365px">
                        <Input v-model="updata_form.phoneNumber" disabled></Input>
                        <Poptip placement="bottom-start" v-model="unbindPhonePoptip">
                            <div style="padding: 8px">
                                <p style="line-height:18px; margin-bottom: 18px">
                                    <Icon custom="custom-warning" size="14" color="#FBBC04" style="margin-right: 12px"></Icon>{{$t('per_setting.unbindPhoneTip')}}
                                </p>
                                <div style="text-align: right; margin: 0">
                                    <Button @click="closePoptip" style="height: 28px;padding: 5px 12px;">{{ $t('cancel') }} </Button>
                                    <Button type="primary"
                                        style="height: 28px;padding: 5px 12px;"
                                        :loading="modal_loading"
                                        @click="unbindPhone">{{ $t('confirm') }}
                                    </Button>
                                </div>
                            </div>
                            <Icon slot="reference" class="password-rule-tip" custom="custom-delete"
                                style="line-height:34px; cursor: pointer;"
                                color="#bec2c9"
                                size="14"></Icon>
                        </Poptip>
                    </FormItem>
                </div>
                <div class="title">{{$t('authority.rightsProfile')}}</div>
                <div class="wrap">
                    <FormItem :label="$t('authority.userManagement.functionalPermis')"
                        prop="roleIds"
                        style="z-index: 70"
                        class="width-365px">
                        <Select v-model="updata_form.roleIds" multiple>
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
                        <Select v-model="updata_form.managePermissionIds" multiple>
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
                        <Select v-model="updata_form.fieldPermissionIds" multiple>
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
                        class="width-365px">
                        <Select v-model="updata_form.has_inquiries">
                            <Option v-for="item in isOK"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"></Option>
                        </Select>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.hasChat')"
                        prop="has_chat"
                        class="width-365px">
                        <Select v-model="updata_form.has_chat">
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
                        <Select v-model="updata_form.has_WABA_service">
                            <Option v-for="item in isOK"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"></Option>
                        </Select>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.isfbService')"
                        prop="has_fb_service"
                        class="width-365px">
                        <Select v-model="updata_form.has_fb_service">
                            <Option v-for="item in isOK"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label">
                            </Option>
                        </Select>
                    </FormItem>
                    <FormItem :label="$t('authority.userManagement.personInCharge')"
                        prop="has_director"
                        style="z-index: 80"
                        class="width-365px">
                        <Select v-model="updata_form.isDeptManager">
                            <Option v-for="item in isOK"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"></Option>
                        </Select>
                    </FormItem>
                    <FormItem :label="$t('authority.remark')"
                        prop="remark"
                        class="width-365px">
                        <Input v-model="updata_form.remark"
                            :placeholder="$t('authority.remark')"></Input>
                    </FormItem>
                </div>
            </Form>
        </div>

        <div slot="footer">
            <Button @click="handle_cancel">{{ $t('cancel') }}
            </Button>
            <Button type="primary"
                    :loading="modal_loading"
                    @click="handle_submit('updata_form')">{{ $t('confirm') }}
            </Button>
        </div>
    </Modal>
</template>

<script>
    import Vue from 'vue';
    import Cookies from 'js-cookie';
    import { mapState } from 'vuex';
    import { userManagement } from '@/api/systemSettings/authority-management/index';
    import { unBundlePhone } from '@/api/personal-set/index';
    const { existUserName, verifyName, updateUser } = userManagement;

    export default {
        name: 'updata_modal',
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
            get_updata_info: {
                type: Object
            },
            height: {
                type: String
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
                'userName',
                'userId',
                'fullName'
            ]),
            $lang() {
                return Vue.config.lang;
            }
        },
        data() {
            // 验证登录名检查
            const validateLoginNameCheck = (rule, value, callback) => {
                existUserName({ userName: value, userId: this.get_updata_info.id }).then(response => {
                    if (response.code === '1' && !response.data) {
                        callback();
                    } else {
                        callback(new Error(this.$t('authority.userManagement.nameExists')));
                    }
                }).catch(erro => {
                    callback(new Error(this.$t('authority.userManagement.nameExists')));
                });
            };
            // 校验名称检查
            const validateNameCheck = (rule, value, callback) => {
                if (this.original_name !== value) {
                    verifyName({
                        orgId: this.orgId,
                        value
                    }).then(response => {
                        if (response.code === '1') {
                            callback();
                        } else {
                            callback(new Error(this.$t('authority.userManagement.nameExists')));
                        }
                    });
                } else {
                    callback();
                }
            };

            return {
                updata_modal: false,
                modal_loading: false,
                original_name: '',
                updata_form: {
                    name: '',
                    email: '',
                    lname: '',
                    sex: '',
                    ename: '',
                    tel: '',
                    passwd: '',
                    department: '',
                    id: 1,
                    has_chat: '1',
                    has_inquiries: '1',
                    has_fb_service: '1',
                    has_WABA_service: '1',
                    isDeptManager: '2',
                    departmentId: null,
                    remark: '',
                    roleIds: [],
                    managePermissionIds: [],
                    fieldPermissionIds: []
                },
                updata_form_rule: {
                    name: [
                        {
                            required: true,
                            message: this.$t('authority.userManagement.nameEmpty'),
                            trigger: 'change'
                        },
                        {
                            validator: validateNameCheck,
                            trigger: 'change'
                        }
                    ],
                    email: [
                        {
                            required: false,
                            message: this.$t('authority.userManagement.emailEmpty'),
                            trigger: 'blur'
                        },
                        {
                            type: 'email',
                            message: this.$t('authority.userManagement.emailErr'),
                            trigger: 'blur'
                        }
                    ],
                    lname: [
                        { required: true, message: this.$t('authority.userManagement.lnameEmpty'), trigger: 'blur' },
                        { validator: validateLoginNameCheck, trigger: 'blur' },
                        { max: 100, message: this.$t('authority.userManagement.maxLengthLimit') + 100, trigger: 'blur' }
                    ],
                    // sex: [
                    //     { required: true, message: 'Please select sex', trigger: 'blur' }
                    // ],
                    ename: [
                        {
                            required: true,
                            message: this.$t('authority.userManagement.enameEmpty'),
                            trigger: 'blur'
                        }
                    ],
                    // tel: [
                    //     {
                    //         required: false,
                    //         message: this.$t('authority.userManagement.telEmpty'),
                    //         trigger: 'blur'
                    //     }
                    // ],
                    passwd: [
                        { validator: this.validatePasswordChanged, trigger: 'change' }
                    ],
                    department: [
                        {
                            required: true,
                            message: this.$t('authority.userManagement.deparEmpty'),
                            trigger: 'blur'
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
                all_department: [],
                prevPasswd: '', // 原密码
                passwdChanged: false, // 原密码是否更改过
                unbindPhonePoptip: false,
                unbindPhoneLoading: false
            };
        },
        methods: {
            handle_submit(name) {
                // 如果密码未变更过, 则只保留必填规则, 避免其他字段校验失败后触发 validatePasswordChanged
                if (!this.passwdChanged) {
                    this.$set(this.updata_form_rule, 'passwd', [
                        { required: true, message: this.$t('new_password_tip'), trigger: 'blur' }
                    ]);
                }
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.modal_loading = true;
                        this.get_updata_data(this.updata_form);
                    } else {
                        // 若未校验通过, 且密码未改过, 再把 validatePasswordChanged 加回来
                        if (!this.passwdChanged) {
                            this.$set(this.updata_form_rule, 'passwd', [
                                { required: true, message: this.$t('new_password_tip'), trigger: 'blur' },
                                { validator: this.validatePasswordChanged, trigger: 'change' }
                            ]);
                        }
                        this.$Message.error(this.$t('authority.userManagement.editErr'));
                    }
                });
            },
            handle_cancel() {
                this.updata_modal = false;
                this.modal_loading = false;
            },
            get_updata_data(val) {
                const obj = {};
                obj.id = parseInt(val.id);
                obj.fullname = val.name;
                obj.realName = val.ename;
                obj.email = val.email;
                obj.username = val.lname;
                // 如果用户未手动变更
                obj.password = this.passwdChanged ? val.passwd : this.prevPasswd;
                obj.gender = parseInt(val.sex);
                obj.departmentId = val.departmentId;
                obj.phone = val.tel;
                obj.remark = val.remark;
                obj.isDeptManager = parseInt(val.isDeptManager);
                obj.canChat = parseInt(val.has_chat);
                obj.canGetInquiry = parseInt(val.has_inquiries);
                obj.canFbManage = parseInt(val.has_fb_service);
                obj.canWabaService = parseInt(val.has_WABA_service);
                updateUser({
                    emulateJSON: true,
                    user: obj,
                    roleIds: val.roleIds,
                    managePermissionIds: val.managePermissionIds,
                    fieldPermissionIds: val.fieldPermissionIds,
                    orgId: this.enterpriseId,
                    operatorName: this.userName
                }).then(response => {
                    if (response.code === '1') {
                        this.modal_loading = false;
                        this.$Message.success(this.$t('authority.userManagement.editSuccess'));
                        // 更新用户后，刷新列表 调用的刷新方法get_add_user
                        this.$emit('get_add_user');
                        this.updata_modal = false;
                        // 修改当前用户姓名之后，需要同步更新全局的fullName数据
                        if (Number(obj.id) === Number(this.userId) && obj.fullname !== this.fullName) {
                            Cookies.set('fullName', encodeURI(obj.fullname));
                            this.$store.commit('setFullName', obj.fullname);
                        }
                        // 修改当前用户姓名之后，需要同步更新全局的fullName数据
                        if (Number(obj.id) === Number(this.userId) && obj.username !== this.userName) {
                            Cookies.set('userName', obj.username);
                            this.$store.commit('setUserName', obj.username);
                        }
                    } else {
                        this.$Message.error(response.message);
                        this.modal_loading = false;
                    }
                });
            },
            validePassword(rule, value, callback) {
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
            },
            validatePasswordChanged(rule, value, callback) {
                // 用户手动变更过密码后, 修改 flag 并把 rule 设置为新规则
                this.passwdChanged = true;
                this.$set(this.updata_form_rule, 'passwd', [
                    { required: true, message: this.$t('new_password_tip'), trigger: 'blur' },
                    { min: 8, message: this.$t('password_min_tip'), trigger: 'blur' },
                    { max: 20, message: this.$t('password_max_tip'), trigger: ['blur', 'change'] },
                    { validator: this.validePassword, trigger: 'blur' }
                ]);
                this.$nextTick(() => {
                    this.$refs.updata_form.validateField('passwd');
                });
                callback();
            },
            unbindPhone() {
                if (this.unbindPhoneLoading) return;
                this.unbindPhoneLoading = true;
                unBundlePhone({
                    userId: this.updata_form.id,
                    orgId: this.orgId,
                    phone: this.updata_form.phoneNumber
                }).then(res => {
                    if (res.code === '1') {
                        this.$Message.success('解绑成功！');
                        this.$set(this.updata_form, 'phoneNumber', null);
                        // 更新用户后，刷新列表 调用的刷新方法get_add_user
                        this.$emit('get_add_user');
                    } else {
                        this.$Message.error(res.message);
                    }
                    this.unbindPhoneLoading = false;
                });
            },
            closePoptip() {
                this.unbindPhonePoptip = false;
            }
        },
        watch: {
            updata_modal(val) {
                this.$emit('change_updata_modal', val);
                if (this.$refs.updata_form) {
                    this.$refs.updata_form.resetFields();
                }
            },
            modal(val) {
                this.updata_modal = val;
            },
            get_updata_info(val) {
                this.prevPasswd = val.passwd || '';
                // 新打开编辑框时, 先把密码校验规则都去掉, 避免触发 change 事件执行密码校验
                this.$set(this.updata_form_rule, 'passwd', []);
                // console.log(this.functional_list);
                this.updata_form = JSON.parse(JSON.stringify(val));
                this.$set(this.updata_form, 'roleIds', val.roles || []);
                this.$set(this.updata_form, 'managePermissionIds', val.manages || []);
                this.$set(this.updata_form, 'fieldPermissionIds', val.fields || []);
                if (this.$refs.updata_form) {
                    this.$refs.updata_form.resetFields();
                }
                this.original_name = val.name;
                // 取值完成后, 再把密码校验规则加回来
                this.passwdChanged = false;
                this.$set(this.updata_form_rule, 'passwd', [
                    { required: true, message: this.$t('new_password_tip'), trigger: 'blur' },
                    { validator: this.validatePasswordChanged, trigger: 'change' }
                ]);
            },
            get_department(val) {
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
    .updata_user_modal {
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
            margin-bottom: 24px;
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
