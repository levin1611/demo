<template>
    <Modal
            class="add-contact"
            width="520px"
            :visible="letAddModalShow"
            :title="$t('mailSetting.addressBook.addContact')"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            @open="()=>$emit('isAddModalShow',true)"
            @close="()=>$emit('isAddModalShow',false)">
        <template>
            <Form ref="ruleName" :model="formValidate" :rules="ruleValidate" label-position="left" label-width='60px'
                  style="margin:0 40px;">
                <FormItem :label="$t('mailSetting.addressBook.tableName')" prop="name">
                    <Input v-model="formValidate.name">
                    </Input>
                </FormItem>
                <FormItem :label="$t('mailSetting.addressBook.email')" prop="email">
                    <Input v-model="formValidate.email">
                    </Input>
                </FormItem>
                <FormItem :label="$t('mailSetting.addressBook.phone')">
                    <Input v-model="formValidate.phone">
                    </Input>
                </FormItem>
                <FormItem :label="$t('mailSetting.addressBook.group')">
                    <Select v-model="formValidate.group" @change="handleGroupChange">
                        <Option :value="item.id" v-for="item in groupList" :key="item.id" :label="item.groupName"></Option>
                    </Select>
                </FormItem>
                <FormItem :label="$t('mailSetting.addressBook.remark')">
                    <Input v-model="formValidate.remark" type="textarea" :autosize="{minRows: 2,maxRows: 5}">
                    </Input>
                </FormItem>
            </Form>
        </template>
        <div slot="footer">
        <Button style="color: #fc8c30;border: 1px solid #fc8c30;" @click="handleCancel">{{$t('cancel')}}</Button>
        <Button type="primary" @click="handleSave" :loading="saveLoading">{{$t('confirm')}}</Button>
    </div>
    </Modal>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'add_contact',
        props: {
            letAddModalShow: {
                type: Boolean,
                default: false
            },
            editContactInfo: {
                type: Object
            },
            newContactInfo: {
                type: Object
            }
        },
        data() {
            return {
                // modalShow: false,
                formValidate: {
                    name: '',
                    email: '',
                    phone: '',
                    group: 0,
                    remark: ''
                },
                ruleValidate: {
                    name: [
                        { required: true, message: this.$t('mailSetting.addressBook.nameCheckTip'), trigger: 'blur' }
                    ],
                    email: [
                        { required: true, message: this.$t('mailSetting.addressBook.emailCheckTip'), trigger: 'blur' },
                        { type: 'email', message: this.$t('mailSetting.addressBook.emialFormatTip'), trigger: 'blur' }
                    ]
                },
                groupList: [{
                    id: 0,
                    groupName: '未分组'
                }],
                groupName: '未分组',
                saveLoading: false
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId
            })
        },
        methods: {
            /** 获取分组列表 */
            getGroupList() {
                this.groupList = [{
                    id: 0,
                    groupName: '未分组'
                }];
                util.ajaxMail({
                    url: '/mail/addresscontactgroup/all',
                    method: 'get',
                    params: {
                        createUserId: this.userId
                    }
                }).then(response => {
                    if (response.data.code === 1) {
                        this.groupList = this.groupList.concat(response.data.data);
                        if (this.editContactInfo.group) {
                            this.handleGroupChange(this.editContactInfo.group);
                        }
                    } else {
                        this.$Message.error('获取分组列表失败');
                    }
                }).catch(() => {
                    this.$Message.error('获取分组列表失败');
                });
            },
            /** 切换分组 */
            handleGroupChange(id) {
                this.formValidate.group = id;
                for (const item of this.groupList) {
                    if (item.id === id) {
                        this.groupName = item.groupName;
                    }
                }
            },
            /** 添加联系人保存 */
            handleSave() {
                this.$refs.ruleName.validate((valid) => {
                    if (valid) {
                        if (this.formValidate.email.replace(/(^\s*)|(\s*$)/g, '') === this.editContactInfo.email) {
                            this.handleAddContact();
                        } else {
                            util.ajaxMail({
                                // 邮箱查重
                                url: '/mail/mailaddresscontact/userAddress',
                                method: 'post',
                                data: {
                                    createUserId: this.userId,
                                    userAddress: this.formValidate.email
                                }
                            }).then(response => {
                                if (response.data.code === 1) {
                                    this.handleAddContact();
                                } else {
                                    this.$Message.error(response.data.msg);
                                }
                            }).catch(() => {
                                this.$Message.error('接口异常，请稍后重试');
                            });
                        }
                    }
                });
            },
            /** 添加联系人 */
            handleAddContact() {
                let ajaxUrl = '/mail/mailaddresscontact/add';
                let ajaxMethod = 'post';
                let jsonData = {
                    contactUserName: this.formValidate.name,
                    contactUserMail: this.formValidate.email.replace(/(^\s*)|(\s*$)/g, ''),
                    contactUserTelephone: this.formValidate.phone,
                    groupId: this.formValidate.group ? this.formValidate.group : 0,
                    groupName: this.groupName ? this.groupName : '未分组',
                    remark: this.formValidate.remark,
                    createUserId: this.userId,
                    orgId: this.enterpriseId
                };
                if (this.editContactInfo.id) {
                    ajaxUrl = '/mail/mailaddresscontact/update';
                    ajaxMethod = 'put';
                    jsonData = {
                        id: this.editContactInfo.id,
                        contactUserName: this.formValidate.name,
                        contactUserMail: this.formValidate.email.replace(/(^\s*)|(\s*$)/g, ''),
                        contactUserTelephone: this.formValidate.phone,
                        groupId: this.formValidate.group ? this.formValidate.group : 0,
                        groupName: this.groupName ? this.groupName : '未分组',
                        remark: this.formValidate.remark,
                        updateUserId: this.userId,
                        orgId: this.enterpriseId
                    };
                }
                this.saveLoading = true;
                util.ajaxMailJson({
                    url: ajaxUrl,
                    method: ajaxMethod,
                    data: jsonData
                }).then(response => {
                    this.saveLoading = false;
                    if (response.data.code === 1) {
                        this.$emit('isAddModalShow', false);
                        this.$emit('isTableUpdate', true);
                        this.$Message.success(response.data.msg);
                    } else {
                        this.$Message.error(response.data.msg);
                    }
                }).catch(() => {
                    this.$Message.error('保存失败');
                });
            },
            handleCancel() {
                this.$emit('isAddModalShow', false);
            }
        },
        created() {
            // this.getGroupList();
        },
        watch: {
            letAddModalShow: {
                handler(val) {
                    this.groupName = '未分组';
                    // 显示添加组件
                    // this.modalShow = val;
                    if (!val) {
                        // 表单重置
                        this.$refs.ruleName.resetFields();
                    } else {
                        // 获取分组数据列表
                        this.getGroupList();
                        if (this.newContactInfo && this.newContactInfo.email) {
                            this.$nextTick(() => {
                                this.$set(this.formValidate, 'email', this.newContactInfo.email);
                                this.$set(this.formValidate, 'name', this.newContactInfo.name);
                            });
                        }
                    }
                },
                immediate: true
            },
            editContactInfo(val) {
                this.formValidate = Object.assign({}, val); // 对象引用赋值
            }
        }
    };
</script>
<style lang="less" scoped>
    .add-contact {
        & /deep/ .el-dialog__title {
            font-weight: bold;
        }
        & /deep/ .el-form-item {
            font-size: 12px;
            margin-bottom: 11px;
        }
    }
</style>

