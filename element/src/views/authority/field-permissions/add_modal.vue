<template>
    <Modal :visible.sync="add_modal"
           :title="$t('authority.fieldPermis.addUser')"
           :append-to-body="true"
           :modal-append-to-body="false"
           :close-on-click-modal="false"
           width="520px"
           @close="$refs.add_form.resetFields()">
        <div style="width:80%;margin:10px auto;">
            <Form :model="add_form"
                  :rules="add_form_rule"
                  label-width="90px"
                  ref="add_form"
                  style="margin-top: 20px">
                <FormItem :label="$t('authority.fieldPermis.name')"
                          prop="name">
                    <Input v-model="add_form.name"
                           :placeholder="$t('authority.fieldPermis.name')"></Input>
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
    import util from '@/libs/util';
    import { mapState } from 'vuex';

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
            get_add_form: {
                type: Object
            }
        },
        computed: {
            ...mapState([
                'enterpriseId',
                'userId'
            ])
        },
        data() {
            const validateDepartmentCheck = (rule, value, callback) => {
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
                });
            };
            return {
                add_modal: false,
                modal_loading: false,
                add_form: {
                    name: ''
                },
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
                        }
                    ]
                }
            };
        },
        methods: {
            handle_submit(name) {
                this.$refs[name].validate(valid => {
                    if (valid) {
                        this.modal_loading = true;
                        util.ajaxJson({
                            url: '/new-privilege/field/add',
                            method: 'post',
                            data: {
                                createPerson: this.userId,
                                name: this.add_form.name,
                                orgId: this.enterpriseId,
                                updatePerson: this.userId
                            }
                        }).then(response => {
                            if (response.data.code === '1') {
                                this.modal_loading = false;
                                this.$Message.success(this.$t('authority.fieldPermis.addSuccess'));
                                const obj = {};
                                obj.name = this.add_form.name;
                                obj.id = response.data.data;
                                this.$emit('add_user_t', obj);
                                this.add_modal = false;
                            }
                        });
                        this.$emit('set_add_modal', this.add_form);
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.addDepartmentErr'));
                    }
                });
            },
            handle_cancel(name) {
                this.add_modal = false;
            }
        },

        watch: {
            add_modal(val) {
                this.$emit('change_add_modal', val);
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
                this.add_form = val;
            },
            'add_form.name': {
                handler(val) {
                    if (val && val.length > 20) {
                        this.add_form.name = val.slice(0, 20);
                        this.$Message.info(this.$t('overLength'));
                    }
                }
            }
        }
    };
</script>
