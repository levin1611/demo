<template>
    <Modal
            :visible.sync="updata_modal"
            :title="$t('portal_set.edit_classification')"
            :close-on-click-modal="false"
            :modal-append-to-body="false">
        <div style="width:100%;padding:0 10%;margin:0 auto;overflow-x:hidden">
            <Form ref="updata_form" :model="updata_form" :rules="updata_form_rule" label-width="90px">
                <FormItem :label="$t('portal_set.classification')" prop="name">
                    <Input v-model="updata_form.name" placeholder="分类名称"></Input>
                </FormItem>
                <FormItem :label="$t('authority.ord')" prop="sortNo">
                    <Input v-model.number="updata_form.sortNo" :placeholder="$t('authority.ord')+'(0~9999)'" :maxlength="4"
                           ></Input>
                </FormItem>
                <FormItem :label="$t('authority.remark')" prop="remark">
                    <Input v-model="updata_form.remark" :placeholder="$t('authority.remark')"></Input>
                </FormItem>
            </Form>
        </div>
        <div slot="footer">
            <Button  @click="handle_cancel">{{$t('cancel')}}</Button>
            <Button type="primary" @click="handle_submit('updata_form')" :loading="modal_loading">{{$t('confirm')}}
            </Button>
        </div>
    </Modal>
</template>

<script>
    import util from '@/libs/util';
    import Cookies from 'js-cookie';

    export default {
        name: 'updata_tree',
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
            get_updata_tree_info: {
                type: Object
            }
        },
        data() {
            const validateNumberCheck = (rule, value, callback) => {
                console.log(typeof (value));
                const rag = /^[0-9]*$/;
                if (!rag.test(value)) {
                    callback(new Error('请输入0~9999内的数字'));
                    // callback(new Error(this.$t('authority.userManagement.ordEmpty')));
                } else {
                    callback();
                }
            };
            const validateDepartmentCheck = (rule, value, callback) => {
                console.log(212132, this.get_name);
                if (value === this.get_name) {
                    callback();
                }
                util.ajaxJson({
                    url: '/new-privilege/department/isSameDeptName',
                    method: 'post',
                    data: {
                        orgId: parseInt(Cookies.get('enterpriseId')),
                        name: value
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        callback();
                    } else {
                        callback(new Error('The name already exists!'));
                    }
                });
            };
            return {
                updata_modal: false,
                modal_loading: false,
                updata_form: {
                    name: '',
                    sortNo: '',
                    remark: ''
                },
                updata_form_rule: {
                    name: [
                        { required: true, message: this.$t('authority.userManagement.dnameEmpty'), trigger: 'blur' },
                        { max: 30, message: this.$t('authority.userManagement.maxLengthLimit') + 30, trigger: 'blur' }
                        // {validator: validateDepartmentCheck, trigger: 'blur'}

                    ],
                    sortNo: [
                        { required: true, message: '请输入数字序号', trigger: 'blur', type: 'number' },
                        { validator: validateNumberCheck, trigger: 'blur' }
                    ]
                },
                get_name: ''
            };
        },
        methods: {
            handle_submit(name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.modal_loading = true;
                        this.$emit('set_updata_tree', this.updata_form);
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.editErr'));
                    }
                });
            },
            handle_cancel() {
                this.updata_modal = false;
            }

        },

        watch: {
            updata_modal(val) {
                this.$emit('change_updata_tree', val);
            },
            modal(val) {
                this.updata_modal = val;
            },
            loading(val) {
                this.modal_loading = val;
            },
            modal_loading(val) {
                this.$emit('change_tree_updata', val);
            },
            get_updata_tree_info(val) {
                this.updata_form = val;
                this.get_name = val.name;
            }

        }
    };
</script>

<style scoped>

</style>
