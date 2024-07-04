<template>
  <div>
    <Form
      :model="update_form"
      :rules="update_form_rule"
      label-width="90px"
      ref="update_form"
      style="margin-top: 20px"
      class="modal"
    >
      <FormItem :label="$t('mailMarketing.emailAddress.pasteMailbox')" prop="sourceContent">
        <Input
          type="textarea"
          v-model="update_form.sourceContent"
          :placeholder="$t('mailMarketing.emailAddress.pasteMailboxPl')"
          @blur="onblur"
          :rows="10"
          :disabled="isEditModel"
          style="width: 450px"
        ></Input>
      </FormItem>
    </Form>
  </div>
</template>
<script>
    export default {
        props: ['isEditModel'],
        data() {
            const reg = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
            const sourceContentValidator = (rule, value, callback) => {
                if (value.match(reg) && value.match(reg).length) {
                    return callback(new Error('不能添加表情'));
                } else {
                    return callback();
                }
            };
            return {
                update_form: {
                    sourceContent: this.$store.state.emailAddress.editRow.sourceContent
                },
                update_form_rule: {
                    sourceContent: [
                        {
                            required: true,
                            message: this.$t('mailMarketing.emailAddress.inputEmail'),
                            trigger: 'blur'
                        },
                        {
                            validator: sourceContentValidator,
                            message: this.$t('mailMarketing.emailAddress.formatError'),
                            trigger: 'blur'
                        }
                    ]
                }
            };
        },
        created() {
        },
        methods: {
            onblur(event) {
                console.log(event);
                const strArr = event.target.value.replace(/^\n+|\n+$/g, '').split(/\n/);
                const tabelArr = [];
                strArr.map((str) => {
                    tabelArr.push(str.split(/\t/));
                });
                console.log(tabelArr);
            },
            _formValidate() {
                return new Promise((resolve, reject) => {
                    this.$refs.update_form.validate((valid) => {
                        if (valid) {
                            resolve({ ...this.update_form, isCallback: 1 });
                        } else {
                            reject({ isCallback: 1 });
                        }
                    });
                });
            }
        }
    };
</script>
<style scoped lang="less" >
.modal {
  /deep/ .el-form-item__label {
    text-align: left;
    padding-left: 10px;
  }
}
</style>
