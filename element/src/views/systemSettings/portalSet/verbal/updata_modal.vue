<template>
    <Modal
            :visible.sync="updata_modal"
            :title="$t('portal_set.edit_content')"
            :close-on-click-modal="false"
            :modal-append-to-body="false">
        <div style="width:100%;padding:0 10%;margin:0 auto;" :style="{maxHeight:height}">
            <Form ref="updata_form" :model="updata_form" :rules="updata_form_rule" label-width="110px">
                <FormItem :label="$t('portal_set.abbr')" prop="abbr">
                    <Input v-model="updata_form.abbr"
                           :placeholder="$t('portal_set.abbr')"></Input>
                </FormItem>
                <FormItem :label="$t('portal_set.script')" prop="name">
                    <Input v-model="updata_form.name"
                           type="textarea"
                           :rows="6"
                           :placeholder="$t('portal_set.verbal_content')"></Input>
                </FormItem>
                <FormItem :label="$t('portal_set.classification')" prop="typeId">
                    <Select v-model="updata_form.typeId"
                            filterable
                            :placeholder="$t('portal_set.verbal_classification')">
                        <Option v-for="(item,index) in all_department"
                                :value="item.value" :key="item.value+item.label"
                                :style="{paddingLeft:item.hierarchy}"
                                :class="item.hierarchyName"
                                class="depart"
                                :label="item.label">
                        </Option>
                    </Select>
                </FormItem>
            </Form>
        </div>

        <div slot="footer">
            <Button  @click="handle_cancel">{{$t('cancel')}}</Button>
            <Button type="primary" class="chatinterfacesetting-editspeech" @click="handle_submit('updata_form')"
                    :loading="modal_loading">{{$t('confirm')}}
            </Button>
        </div>
    </Modal>
</template>

<script>
    import util from '@/libs/util';

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
            }
        },
        data() {
            const validateNameCheck = (rule, value, callback) => {
                if (this.original_name !== value) {
                    util.ajax({
                        url: `/new-privilege/user/isExistByFullName?orgId=${this.orgId}&fullName=${value}`,
                        method: 'get'
                    }).then(response => {
                        if (response.data.code === '1') {
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
                    // parentName:'',
                    typeId: null,
                    abbr: ''
                },
                updata_form_rule: {
                    abbr: [
                        { required: true, message: this.$t('portal_set.abbr_empty'), trigger: 'blur' },
                        { max: 50, message: this.$t('authority.userManagement.maxLengthLimit') + 50, trigger: 'blur' }
                        // {validator:validateNameCheck,trigger:'change'}
                    ],
                    name: [
                        { required: true, message: this.$t('portal_set.script_empty'), trigger: 'blur' },
                        { max: 2000, message: this.$t('authority.userManagement.maxLengthLimit') + 2000, trigger: 'blur' }
                    ],
                    typeId: [
                        { required: true, message: this.$t('chat.sortHolder'), trigger: 'blur', type: 'number' }
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
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.modal_loading = true;
                        this.get_updata_data(this.updata_form);
                    } else {
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
                obj.password = val.passwd;
                obj.gender = parseInt(val.sex);
                obj.departmentId = val.departmentId;
                obj.phone = val.tel;
                obj.remark = val.remark;
                obj.canChat = parseInt(val.has_chat);
                obj.canGetInquiry = parseInt(val.has_inquiries);
                obj.canFbManage = parseInt(val.has_fb_service);
                obj.typeId = val.typeId;
                util.ajax({
                    url: '/cuss-login/reply/update',
                    method: 'post',
                    data: {
                        typeId: val.typeId,
                        orgId: this.$store.state.enterpriseId,
                        name: val.name,
                        abbr: val.abbr,
                        id: val.id
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.modal_loading = false;
                        this.$Message.success(this.$t('authority.userManagement.editSuccess'));
                        this.updata_modal = false;
                        this.$emit('get_add_user');
                    } else {
                        this.$Message.error(response.data.message);
                        this.modal_loading = false;
                    }
                });
            }
        },

        watch: {
            updata_modal(val) {
                this.$emit('change_updata_modal', val);
                if (!val) {
                    this.updata_form = {
                        name: '',
                        // parentName:'',
                        typeId: null,
                        abbr: ''
                    };
                }
            },
            modal(val) {
                this.updata_modal = val;
            },
            get_updata_info(val) {
                this.updata_form = val;
                this.original_name = val.name;
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

<style scoped>
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
</style>
