<template>
    <Modal
            :visible.sync="add_modal"
            :title="$t('portal_set.add_script')"
            :close-on-click-modal="false"
            :modal-append-to-body="false"
            custom-class="_customModalVerbal"
             @close="$refs.add_form.resetFields()"
    >
        <div style="width:100%;padding:0 10%;margin:0 auto;" :style="{maxHeight:height}" class="add_modal_verbal">
            <Form ref="add_form" :model="add_form" :rules="add_form_rule" label-width="60px">
                <FormItem :label="$t('portal_set.abbr')" prop="name">
                    <Input v-model="add_form.name" :placeholder="$t('portal_set.abbr')" style="width: 460px"></Input>
                </FormItem>
                <FormItem :label="$t('portal_set.script')" prop="script">
                    <Input v-model="add_form.script"
                           type="textarea"
                           :rows="6"
                           :placeholder="$t('portal_set.verbal_content')"
                           style="width: 460px"></Input>
                </FormItem>
                <FormItem :label="$t('portal_set.classification')" prop="department" style="z-index: 90">
                    <Select v-model="add_form.department" filterable
                            style="width: 460px"
                            :placeholder="$t('portal_set.verbal_classification')" :disabled="add_form.open">
                        <Option v-for="(item, index) in all_department"
                                :value="item.value"
                                :key="item.value+item.label"
                                :style="{paddingLeft:item.hierarchy}"
                                :class="item.hierarchyName"
                                :title="item.label"
                                class="depart"
                                :label="item.label"
                        >
                        </Option>
                    </Select>
                </FormItem>
            </Form>
        </div>

        <div slot="footer">
            <Button  @click="handle_cancel">{{$t('cancel')}}</Button>
            <Button type="primary" @click="handle_submit('add_form')" :loading="modal_loading">{{$t('confirm')}}
            </Button>
        </div>
    </Modal>
</template>

<script>
    import util from '@/libs/util';

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
            }

        },
        data() {
            return {
                add_modal: false,
                modal_loading: false,
                add_form: {
                    name: '',
                    department: '',
                    script: ''
                },
                add_form_rule: {
                    name: [

                        { required: true, message: this.$t('portal_set.abbr_empty'), trigger: 'blur' },
                        {
                            validator: (rule, value, callback) => {
                                if (value.trim() === '') {
                                    callback(new Error(this.$t('portal_set.abbr_empty')));
                                } else {
                                    callback();
                                }
                            },
                            trigger: 'blur'
                        },
                        { max: 50, message: this.$t('authority.userManagement.maxLengthLimit') + 50, trigger: 'blur' }
                    ],
                    script: [
                        { required: true, message: this.$t('portal_set.script_empty'), trigger: 'blur' },
                        { max: 2000, message: this.$t('authority.userManagement.maxLengthLimit') + 2000, trigger: 'blur' },
                        {
                            validator: (rule, value, callback) => {
                                if (value.trim() === '') {
                                    callback(new Error(this.$t('portal_set.script_empty')));
                                } else {
                                    callback();
                                }
                            },
                            trigger: 'blur'
                        }
                    ],
                    department: [
                        { required: true, message: this.$t('chat.sortHolder'), trigger: 'change', type: 'number' }
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
            handle_submit(name) {
                console.log(this.add_form);
                this.modal_loading = true;
                this.$refs[name].validate((valid) => {
                    const addForm = this.add_form;
                    if (valid) {
                        this.get_add_data(this.add_form);
                        // this.$Message.success('Success!');
                    } else {
                        if (addForm.name && addForm.english_name && addForm.login_name &&
                            addForm.mail && addForm.password && addForm.tell && addForm.sex > -1 && addForm.department) {
                            this.$Message.error(this.$t('authority.userManagement.checkUserInfo'));
                        } else {
                            this.$Message.error(this.$t('authority.userManagement.addDepartmentErr'));
                        }
                        this.modal_loading = false;
                    }
                });
            },
            handle_cancel() {
                this.add_modal = false;
                this.modal_loading = false;
                this.add_form = { chat: 1, inquiries: 1, fb_service: 1 };
            },
            get_add_data(val) {
                const obj = {};
                obj.username = val.login_name;
                obj.departmentId = val.department;
                obj.phone = val.tell;
                obj.remark = val.remark;
                obj.canChat = parseInt(val.chat);
                obj.canGetInquiry = parseInt(val.inquiries);
                obj.canFbManage = parseInt(val.fb_service);
                util.ajax({
                    url: '/cuss-login/reply/save',
                    method: 'post',
                    data: {
                        typeId: val.department,
                        orgId: this.$store.state.enterpriseId,
                        name: val.script,
                        abbr: val.name
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.modal_loading = false;
                        this.$Message.success(this.createOrEditUser ? this.$t('authority.userManagement.editSuccess') : this.$t('portal_set.add_success'));
                        this.$emit('get_add_user');
                        this.add_modal = false;
                    } else {
                        this.$Message.error(response.data.message);
                    }
                });
            },
            change_email() {
                this.add_form.mail = this.add_form.mail.trim();
                this.add_form.login_name == '' ? this.add_form.login_name = this.add_form.mail : '';
            }

        },

        watch: {
            add_modal(val) {
                this.$emit('change_add_modal', val);
                if (!val) {
                    this.add_form = {
                        name: '',
                        script: '',
                        department: ''
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
    .add_modal_verbal /deep/ .ivu-select-dropdown {
        max-width: 258px;
    }

    .depart {
        position: relative;
        max-width: 460px;
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

</style>
