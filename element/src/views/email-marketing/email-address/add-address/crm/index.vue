<template>
  <div>
    <Form
      :model="update_form"
      :rules="update_form_rule"
      label-width="90px"
      ref="update_form"
      style="margin-top: 20px; width: 500px"
      class="modal"
    >
      <FormItem label="模块选择" prop="mode">
        <Select
          v-model="update_form.mode"
          placeholder="模块选择"
          style="width: 410px"
        >
          <Option
            v-for="item in modeList"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          ></Option>
        </Select>
      </FormItem>
    </Form>
    <!-- 自定义动态模板 -->
    <component :is="update_form.mode" :ref="update_form.mode"></component>
  </div>
</template>
<script>
    import customer from './crm-customer.vue';
    import clues from './crm-clues.vue';
    export default {
        props: [],
        data() {
            // const nameValidator = (rule, value, callback) => {
            //     if (value.trim() == '') {
            //         return callback(new Error('年龄不能为空'));
            //     } else {
            //         return callback();
            //     }
            // };
            return {
                update_form: {
                    mode: ''
                },
                modeList: [
                    { label: '线索管理', value: 'clues' },
                    { label: '客户管理', value: 'customer' }
                ],
                update_form_rule: {
                    mode: [
                        {
                            required: true,
                            message: '请输入名称',
                            trigger: 'blur'
                        }
                    ]
                }
            };
        },
        components: { customer, clues },
        methods: {
            _formValidate() {
                return new Promise((resolve, reject) => {
                    this.$refs.update_form.validate((valid) => {
                        if (valid) {
                            resolve(Object.assign(
                                this.$refs[this.update_form.mode].contactsFormForShow,
                                this.update_form
                            ));
                        } else {
                            reject(valid);
                        }
                    });
                });
            }
        }
    };
</script>
<style scoped lang="less">
.modal {
  /deep/ .el-form-item__label {
    text-align: left;
    padding-left: 10px;
  }
  /deep/ .el-form-item {
      margin-bottom: 12px;
    }
}
</style>
