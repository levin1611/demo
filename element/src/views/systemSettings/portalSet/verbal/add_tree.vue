<template>
    <Modal
            :visible.sync="add_modal"
            :title="$t('portal_set.add_classification')"
            :close-on-click-modal="false"
            @close="$refs.add_form.resetFields()"
            :modal-append-to-body="false">
        <div style="width:100%;padding:0 10%;margin:0 auto;overflow-x:hidden">
            <Form ref="add_form" :model="add_form" :rules="add_form_rule" label-width="90px">
                <FormItem :label="$t('portal_set.classification')" prop="name">
                    <Input v-model="add_form.name" :placeholder="$t('portal_set.classify_name')"></Input>
                </FormItem>
                <FormItem :label="$t('authority.ord')" prop="sortNo">
                    <Input v-model.number="add_form.sortNo" :placeholder="$t('authority.ord')+'(0~9999)'" :maxlength="4"
                           ></Input>
                </FormItem>
                <FormItem :label="$t('authority.remark')" prop="remark">
                    <Input v-model="add_form.remark" :placeholder="$t('authority.remark')"></Input>
                </FormItem>
            </Form>
        </div>
        <div slot="footer">
            <Button  @click="handle_cancel('add_form')">{{$t('cancel')}}</Button>
            <Button type="primary" @click="handle_submit('add_form')" :loading="modal_loading">{{$t('confirm')}}
            </Button>
        </div>
    </Modal>
</template>

<script>
    import util from '@/libs/util';

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
        data() {
            const validateNumberCheck = (rule, value, callback) => {
                console.log(typeof (value));
                const rag = /^[0-9]*$/;
                if (!rag.test(value)) {
                    callback(new Error('请输入0~9999内的数字'));
                } else {
                    callback();
                }
            };
            const validateDepartmentCheck = (rule, value, callback) => {
                if (value.indexOf(' ') != -1) {
                    callback(new Error(this.$t('authority.userManagement.nameSpace')));
                }
                util.ajaxJson({
                    url: '/new-privilege/department/isSameDeptName',
                    method: 'post',
                    data: {
                        orgId: this.$store.state.enterpriseId,
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
                    name: '',
                    sortNo: '',
                    remark: ''
                },
                add_form_rule: {
                    name: [
                        { required: true, message: this.$t('authority.userManagement.dnameEmpty'), trigger: 'blur' },
                        { max: 30, message: this.$t('authority.userManagement.maxLengthLimit') + 30, trigger: 'blur' }
                    ],
                    sortNo: [
                        { required: true, message: this.$t('portal_set.need_number'), trigger: 'blur', type: 'number' },
                        { validator: validateNumberCheck, trigger: 'blur' }
                    ]
                }
            };
        },
        methods: {
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
            handle_cancel(name) {
                this.add_modal = false;
                this.add_form = {};
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
                this.add_form = val;
            }
        }
    };
</script>

<style scoped>

</style>
