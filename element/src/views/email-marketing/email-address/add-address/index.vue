<template>
  <div>
    <Modal
      :visible="visible"
      :title="$t('mailMarketing.emailAddress.addAddressBook')"
      width="600px"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :modal-append-to-body="false"
      class="modal"
    >
      <Icon
        custom="custom custom-delete1 close-btn"
        color="#677F99"
        size="15"
        @click="cancle"
      ></Icon>
      <Form
        v-if="visible"
        :model="update_form"
        :rules="update_form_rule"
        label-width="90px"
        ref="update_form"
        style="margin-top: 20px; width: 500px"
      >
        <FormItem
          :label="$t('mailMarketing.emailAddress.name')"
          prop="addrName"
          class="long-label-text"
        >
          <Input
            v-model="update_form.addrName"
            :disabled="isEditModel"
            maxlength="200"
            :placeholder="$t('mailMarketing.emailAddress.namePals')"
          ></Input>
        </FormItem>
        <FormItem
          :label="$t('mailMarketing.emailAddress.note')"
          prop="remark"
          class="long-label-text"
        >
          <Input
            v-model="update_form.remark"
            maxlength="200"
            :placeholder="$t('mailMarketing.emailAddress.notePals')"
          ></Input>
        </FormItem>
        <FormItem
          :label="$t('mailMarketing.emailAddress.addMethod')"
          prop="createType"
          class="long-label-text"
        >
          <!-- <Select
            v-model="update_form.type"
            placeholder="请选择添加方式"
            style="width: 410px"
          >
            <Option
              v-for="item in typeList"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            ></Option>
          </Select> -->
          <xhl-select
            v-model="update_form.createType"
            :followUpStatusData="typeList"
            :disabled="isEditModel"
          ></xhl-select>
        </FormItem>
      </Form>
      <!-- 自定义动态模板 -->
      <component
        v-if="update_form.createType != null"
        :is="'form' + update_form.createType"
        @progress="progress"
        :updateForm="update_form"
        :ref="'form' + update_form.createType"
        :editRow="editRow"
        :isEditModel="isEditModel"
      ></component>

      <div slot="footer">
        <template v-if="!isFinished">
          <Button @click="cancle">{{ $t("mailMarketing.emailAddress.btns.cancel") }}</Button>
          <Button type="primary" @click="ok" v-loading="okBtnLoading" :disabled="okBtnLoading"
            >{{ $t("mailMarketing.emailAddress.btns.confirm") }}
          </Button>
        </template>
        <template v-if="isFinished">
          <Button type="primary" @click="cancle">{{
            $t("mailMarketing.emailAddress.btns.confirm")
          }}</Button>
        </template>
      </div>
    </Modal>
  </div>
</template>
<script>
    import ImportData from './importData.vue';
    import addManual from './addManual.vue';
    import addCrm from './crm/index.vue';
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    export default {
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            isEditModel: Boolean
        },
        name: 'addAddress',
        components: { form1: ImportData, form0: addManual, form2: addCrm },
        computed: {
            ...mapState({
                orgId: (state) => state.enterpriseId,
                userId: (state) => state.userId,
                fullName: (state) => state.fullName,
                userName: (state) => state.userName,
                editRow: (state) => state.emailAddress.editRow
            })
        },
        data() {
            const reg = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
            const nameValidator = (rule, value, callback) => {
                if (value.trim() == '') {
                    return callback(new Error('名称不能为空'));
                } else if (value.match(reg) && value.match(reg).length) {
                    return callback(new Error('不能添加表情'));
                } else {
                    return callback();
                }
            };
            const remarkValidator = (rule, value, callback) => {
                if (!value) return callback();
                else if (value && value.trim() == '') return callback();
                else if (value.match(reg) && value.match(reg).length) {
                    return callback(new Error('不能添加表情'));
                } else {
                    return callback();
                }
            };
            return {
                isFinished: false,
                // update_form: {
                //   addrName:"",
                //   createType: "",
                //   remark: ""
                // },
                // update_form: this.editRow,
                update_form: {},
                typeList: [
                    { label: this.$t('mailMarketing.emailAddress.templateImport'), value: 1 },
                    { label: this.$t('mailMarketing.emailAddress.addManully'), value: 0 }
                    // { label: "CRM业务模块", value: "2" },
                ],
                update_form_rule: {
                    addrName: [
                        {
                            required: true,
                            message: this.$t('mailMarketing.emailAddress.nameTips'),
                            trigger: 'blur'
                        },
                        {
                            validator: nameValidator,
                            message: this.$t('mailMarketing.emailAddress.nameError'),
                            trigger: 'blur'
                        }
                    ],
                    createType: [
                        {
                            required: true,
                            message: this.$t('mailMarketing.emailAddress.chooseMethod'),
                            trigger: 'blur'
                        }
                    ],
                    remark: [
                        {
                            validator: remarkValidator,
                            message: this.$t('mailMarketing.emailAddress.noteError'),
                            trigger: 'blur'
                        }
                    ]
                },
                okBtnLoading: false
            };
        },
        methods: {
            progress(bool) {
                this.visible = bool;
            },
            cancle() {
                this.$emit('update:visible', false);
                this.$store.commit('setEditAddressRow', {});
            },
            ok() {
                if (this.isEditModel) {
                    this.okBtnLoading = true;
                    // /business/address/book/updateRemark
                    this.$util
                        .ajaxEmailMarketingJson({
                            url: '/business/address/book/updateRemark',
                            method: 'POST',
                            data: {
                                orgId: this.orgId,
                                id: this.update_form.id,
                                remark: this.update_form.remark,
                                updateUserId: this.userId,
                                updateUserName: this.fullName
                            }
                        })
                        .then((res) => {
                            this.okBtnLoading = false;
                            if (res.data.code === 1) {
                                this.$emit('update:visible', false);
                                this.$Message.success('更新成功');
                                this.$emit('refreshData');
                            } else {
                                this.$Message.error(res.data.msg);
                            }
                        })
                        .catch((res) => {
                            this.okBtnLoading = false;
                        });
                } else {
                    this.$refs.update_form.validate((valid) => {
                        if (valid) {
                            this.okBtnLoading = true;
                            this.update_form.orgId = this.orgId;
                            this.update_form.createUserId = this.userId;
                            this.update_form.updateUserName = this.fullName;
                            this.$refs[`form${this.update_form.createType}`]
                                ._formValidate(this.update_form)
                                .then((res) => {
                                    // res.isCallback取值0,1;1: 子组件表单验证完成之后需要嗲用回调,0: 表示不需要
                                    // 由于模板导入是另外一个接口，所以保存动作在子组件内部已经执行完成，所以不需要调用保存接口，用isCallback做区分
                                    if (res.isCallback) {
                                        this.$util
                                            .ajaxEmailMarketingJson({
                                                url: '/business/address/book/add',
                                                method: 'POST',
                                                data: Object.assign(this.update_form, res)
                                            })
                                            .then((res) => {
                                                this.okBtnLoading = false;
                                                if (res.data.code === 1) {
                                                    this.$emit('update:visible', false);
                                                    this.$emit('refreshData');
                                                } else {
                                                    this.$Message.error(res.data.msg);
                                                }
                                            })
                                            .catch((res) => {
                                                this.okBtnLoading = false;
                                            });
                                    } else {
                                        this.$emit('update:visible', false);
                                        this.$emit('refreshData');
                                        this.okBtnLoading = false;
                                    }
                                })
                                .catch((res) => {
                                    console.log(res);
                                    this.okBtnLoading = false;
                                });
                        } else {
                            this.okBtnLoading = false;
                        }
                    });
                }
            }
        },
        created() {
            this.update_form = JSON.parse(JSON.stringify(this.editRow));
        }
    };
</script>
<style lang="less" scoped>
.modal {
  .close-btn {
    position: absolute;
    right: 20px;
    top: 28px;
    cursor: pointer;
  }
  /deep/ .el-loading-spinner {
    margin-top: -12px;
    .circular {
      width: 21px;
      height: 21px;
    }
  }
  /deep/ .el-dialog__header {
    padding-bottom: 4px;
    padding-top: 24px;
  }
  /deep/ .el-dialog__body {
    padding-left: 30px;
    padding-right: 30px;
    max-height: 530px;
    padding-top: 0;
  }
  /deep/ .el-form-item__content {
    .el-input {
      width: 450px;
    }
    .el-select {
      width: 65%;
    }
  }
  /deep/ .el-form-item {
    margin-bottom: 12px;
  }
  .long-label-text {
    /deep/ .el-form-item__label {
      padding-right: 0;
      text-align: left;
      padding-left: 10px;
    }
  }
  /deep/ .el-select__tags {
    max-height: 200px;
    overflow: auto;
  }
}
</style>
