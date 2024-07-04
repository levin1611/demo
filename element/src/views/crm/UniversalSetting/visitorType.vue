<template>
  <div class="universal-setting">
    <Row style="margin-bottom:14px;margin-top:30px;padding:0 16px;overflow:hidden">
      <Col :span="20"><p style="margin-top:10px; font-size:12px;padding-left:24px;color:rgba(0,0,0,0.6)">{{$t('universalSet.universalTip')}}</p></Col>
      <Col :span="3" :offset="1"><Button type="primary" @click="handleAdd" icon="plus-round">{{$t('universalSet.newSort')}}</Button></Col>
    </Row>
    <Card shadow="never">
      <!-- <div slot="title" >
        <p>{{$t('universalSet.universalTittle')}}</p>
      </div> -->
      <Form
        ref="form"
        :model="formCategories"
        label-width="85px"
        inline>
        <FormItem
            v-for="(item, index) in formCategories.items"
            :key="index"
            :label="$t('universalSet.sort') + (Number(index)+1)"
            :prop="'items.' + index + '.name'"
            :rules="[{required: true, message: $t('universalSet.sort') + (Number(index)+1) +' '+$t('universalSet.tip'), trigger: 'blur'},{validator: validNameExist, trigger: 'blur'}]" >
                <Row>
                    <Col :span="18">
                        <Input type="text" v-model="item.name" :placeholder="$t('universalSet.universalHolder')"></Input>
                    </Col>
                    <Col :span="3" :offset="1">
                        <Button type="text" icon="custom custom-field-delete" @click="handleRemove(index)"></Button>
                    </Col>
                </Row>
        </FormItem>
      </Form>
      <div style="text-align: center">
        <Button type="primary" @click="handleSubmit" style="margin-left:-35px;">{{$t('save')}}</Button>
      </div>
    </Card>
  </div>
</template>
<script>
    import util from '@/libs/util.js';
    import { changeVisitorType, addVisitorType } from '@/views/visitor-history/api/visitor_piwik';

    export default {
        name: 'universal_setting',
        data() {
            return {
                defaultFormCategories: {},
                formCategories: {
                    items: []
                }
            };
        },
        created() {
            this.getCategories();
        },
        methods: {
            validNameExist(rule, value, callback) {
                const flag = rule.field.split('.')[1] - 0;
                let re = this.formCategories.items.filter((item, index) => {
                    return index != flag;
                });

                re = re.filter(item => item.name === value);
                if (re.length != 0) {
                    console.log('444', re);
                    callback(new Error('该访客类别已存在'));
                } else {
                    callback();
                }
            },
            // 获取访客类别
            getCategories() {
                util.ajaxInternationalJson({
                    url: '/piwikRead/visitorCategories/get',
                    method: 'post',
                    data: {
                        type: 1,
                        orgId: this.$store.state.enterpriseId
                    }
                }).then(response => {
                    const { code, data } = response.data;
                    if (code === '1') {
                        this.formCategories.items = data.reverse();
                        this.defaultFormCategories = JSON.parse(JSON.stringify(this.formCategories));
                    }
                });
            },
            // 添加类别
            addCategory(name) {
                util.ajaxInternationalJson({
                    url: '/piwik/visitorCategories/add',
                    method: 'post',
                    data: {
                        orgId: this.$store.state.enterpriseId,
                        name: name,
                        type: 1
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$Message.success(this.$t('addSuccess'));
                        this.getCategories();
                    } else {
                        this.$Message.error(this.$t('addFail'));
                    }
                }).catch(error => {
                    console.log(error);
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error(this.$t('addFail'));
                    }
                });
            },
            // 删除类别
            handleRemove(index) {
                const { id } = this.formCategories.items[index];
                if (this.formCategories.items[index].type !== 'add') {
                    util.ajaxInternationalJson({
                        url: `/piwik/visitorCategories/delete/${id}`,
                        method: 'post'
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.$Message.success(this.$t('deleteSuccess'));
                            this.formCategories.items.splice(index, 1);
                            this.getCategories();
                        } else {
                            this.$Message.success(this.$t('deleteFail'));
                        }
                    }).catch(error => {
                        console.log(error);
                        if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                            this.$Message.success(this.$t('deleteFail'));
                        }
                    });
                } else {
                    this.formCategories.items.splice(index, 1);
                    this.getCategories();
                }
            },
            // 修改类别
            updateCategory(item) {
                util.ajaxInternationalJson({
                    url: '/piwik/visitorCategories/update',
                    method: 'post',
                    data: {
                        orgId: this.$store.state.enterpriseId,
                        ...item
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$Message.success(this.$t('editSuccess'));
                        this.getCategories();
                    } else {
                        this.$Message.error(this.$t('editFail'));
                    }
                }).catch(error => {
                    console.log(error);
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.success(this.$t('deleteFail'));
                    }
                });
            },
            // 点击提交
            handleAdd() {
                console.log('345');
                if (this.formCategories.items.length === 0) {
                    this.formCategories.items.push({
                        type: 'add'
                    });
                } else {
                    this.$refs.form.validate(valid => {
                        console.log('123');
                        if (valid) {
                            this.formCategories.items.push({
                                type: 'add'
                            });
                        }
                    });
                }
            },
            // 提交按钮
            handleSubmit() {
                const orgId = this.$store.state.enterpriseId;
                const changeArr = [];
                const addArr = [];
                this.$refs.form.validate(valid => {
                    if (valid) {
                        const changeRe = this.formCategories.items.filter((item, index) => {
                            return item.type === 1 && item.name && item.name !== this.defaultFormCategories.items[index].name;
                        });
                        const addRe = this.formCategories.items.filter((item, index) => {
                            return item.type === 'add';
                        });
                        changeRe.forEach(item => {
                            changeArr.push(changeVisitorType(orgId, item));
                        });
                        addRe.forEach((item, index) => {
                            setTimeout(() => {
                                addArr.push(addVisitorType(orgId, item.name));
                                if (addArr.length === addRe.length && addRe.length != 0) {
                                    // console.log("addArr",addRe,addArr,addArr.length);
                                    Promise.all(addArr).then(([...res]) => {
                                        const resData = [...res];
                                        const re = resData.every(item => {
                                            return item.code === '1';
                                        });
                                        if (re) {
                                            this.$Message.success(this.$t('addSuccess'));
                                            this.getCategories();
                                        } else {
                                            this.$Message.error(this.$t('editFail'));
                                        }
                                    }).catch(() => {
                                        if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                                            this.$Message.error(this.$t('editFail'));
                                        }
                                    });
                                }
                            }, index * 10);
                        });
                        Promise.all(changeArr).then(([...res]) => {
                            const resData = [...res];
                            // console.log('changeArr',changeArr);
                            if (resData.length === changeRe.length && changeRe.length != 0) {
                                const re = resData.every(item => {
                                    return item.code === '1';
                                });
                                if (re) {
                                    this.$Message.success(this.$t('editSuccess'));
                                    this.getCategories();
                                } else {
                                    this.$Message.error(this.$t('editFail'));
                                }
                            }
                        }).catch(() => {
                            if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                                this.$Message.error(this.$t('editFail'));
                            }
                        });
                    }
                });
            }
        }
    };
</script>
<style>
  .ivu-btn-icon-only {
      padding-top:0px;
  }

  .universal-setting .is-never-shadow {
      border: none !important;
  }
</style>


