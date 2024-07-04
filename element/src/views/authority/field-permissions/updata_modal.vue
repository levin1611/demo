<template>
    <Modal :visible.sync="updata_modal"
           :title="$t('authority.fieldPermis.editName')"
           :append-to-body="true"
           :modal-append-to-body="false"
           :close-on-click-modal="false"
           width="520px"
           @close="$refs.updata_form.resetFields()">
        <div style="width:80%;margin:10px auto;">
            <Form :model="updata_form"
                  :rules="updata_form_rule"
                  label-width="90px"
                  ref="updata_form"
                  style="margin-top: 20px">
                <FormItem :label="$t('authority.fieldPermis.name')"
                          prop="name">
                    <Input v-model="updata_form.name"
                           :placeholder="$t('authority.fieldPermis.name')"/>
                </FormItem>
            </Form>
        </div>
        <div slot="footer">
            <Button @click="handle_cancel('updata_form')">{{ $t('cancel') }}
            </Button>
            <Button type="primary"
                    :loading="modal_loading"
                    @click="handle_submit('updata_form')">{{ $t('confirm') }}
            </Button>
        </div>
    </Modal>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

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
            get_info: {
                type: Object
            }
        },
        computed: {
            ...mapState([
                'enterpriseId',
                'userName'
            ])
        },
        data() {
            const validateDepartmentCheck = (rule, value, callback) => {
                if (value == this.updata_name) {
                    callback();
                }
                if (value.indexOf(' ') !== -1) {
                    callback(new Error(this.$t('authority.userManagement.nameSpace')));
                }
                util.ajaxJson({
                    url: '/new-privilege/field/name',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        name: value
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        callback();
                    } else {
                        callback(new Error(this.$t('authority.userManagement.nameExists')));
                    }
                }).catch(error => {
                    callback(new Error(this.$t('authority.userManagement.nameExists')));
                });
            };
            return {
                updata_modal: false,
                modal_loading: false,
                updata_form: {
                    name: ''
                },
                updata_form_rule: {
                    name: [
                        {
                            required: true,
                            message: this.$t('authority.userManagement.dnameEmpty'),
                            trigger: 'blur'
                        },
                        {
                            validator: validateDepartmentCheck,
                            trigger: 'blur'
                        }
                    ]
                },
                updata_name: '',
                updata_id: ''
            };
        },
        methods: {
            handle_submit(name) {
                this.$refs[name].validate(valid => {
                    if (valid) {
                        this.modal_loading = true;
                        util.ajaxJson({
                            url: '/new-privilege/field/update',
                            method: 'put',
                            data: {
                                id: this.updata_id,
                                name: this.updata_form.name,
                                updatePerson: this.userName
                            }
                        }).then(response => {
                            if (response.data.code === '1') {
                                this.modal_loading = false;
                                this.$Message.success(this.$t('authority.fieldPermis.addSuccess'));
                                this.$emit('get_user');
                                this.updata_modal = false;
                            }
                        });
                        this.$emit('set_updata_modal', this.updata_form);
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.addDepartmentErr'));
                    }
                });
            },
            handle_cancel(name) {
                this.updata_modal = false;
            }
        },

        watch: {
            updata_modal(val) {
                this.$emit('change_updata_modal', val);
            },
            modal(val) {
                this.updata_modal = val;
            },
            loading(val) {
                this.modal_loading = val;
            },
            modal_loading(val) {
                this.$emit('change_tree_loading', val);
            },
            get_updata_form(val) {
                this.updata_form = val;
            },
            get_info(val) {
                this.updata_name = val.name;
                this.updata_id = val.id;
                this.updata_form.name = val.name;
            },
            'updata_form.name': {
                handler(val) {
                    if (val && val.length > 20) {
                        this.updata_form.name = val.slice(0, 20);
                        this.$Message.info(this.$t('overLength'));
                    }
                }
            }
        }
    };
</script>
