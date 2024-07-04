<template>
    <Modal
            v-model="allocation_permissions"
            :title="$t('authority.userManagement.allocaPermis')"
            class-name="allocation-permission"
            :mask-closable="false"
            @on-visible-change="handleModalChange">
        <div class="" :style="'max-height:'+(window_height-300)+'px;overflow:auto;'">
            {{$t('authority.userManagement.assInfo')}}
            <!-- <span v-for="(item,index) in user_list" :key="index">
              <span v-if="index >=1">，</span>
            </span> -->
            <div v-for="(user,index) in user_list" :key="index" style="margin: 20px 0">
                <span style="font-weight:bold;">{{$t('authority.userManagement.assUser')}}:{{user.name}}</span>
                <Row style="margin-top:10px">
                    <Col span='8' class="col_box1 col_box2" style="padding:0;">
                        <h2 class="tip" style="background-color:#dadada">{{$t('authority.functionalPermis.title')}}
                            <Poptip trigger="hover" transfer :content="$t('authority.userManagement.functionalInfo')">
                                <Icon type="help-circled" style="color:#fff"></Icon>
                            </Poptip>
                        </h2>
                        <CheckboxGroup v-model="select_functional[index]"
                                       style="padding:10px 0 10px 20px;height:150px;width:100%;overflow:hidden">
                            <div style="height:100%;overflow:auto;width:103%;">
                                <Checkbox v-for="(item,index) in functional_list" :key="index" :label="item.label"
                                          style="display:block">
                                    <!-- <span>{{item.label}}</span> -->
                                </Checkbox>
                            </div>
                        </CheckboxGroup>
                    </Col>
                    <Col span='8' class="col_box1" style="padding:0;">
                        <h2 class="tip" style="background-color:#e5e5e5">{{$t('authority.adminPermis.title')}}
                            <Poptip trigger="hover" transfer :content="$t('authority.userManagement.adminInfo')">
                                <Icon type="help-circled"
                                      style="color:#fff;background-color:#dadada;border-radius:50%"></Icon>
                            </Poptip>
                        </h2>
                        <CheckboxGroup v-model="select_admin[index]"
                                       style="padding:10px 0 10px 20px;height:150px;width:100%;overflow:hidden">
                            <div style="height:100%;overflow:auto;width:103%;">
                                <Checkbox v-for="(item,index) in admin_list" :key="index" :label="item.label"
                                          style="display:block">
                                    <!-- <span>{{item.label}}</span> -->
                                </Checkbox>
                            </div>
                        </CheckboxGroup>
                    </Col>
                    <Col span='8' class="col_box1" style="padding:0;">
                        <h2 class="tip" style="background-color:#f0f0f0">{{$t('authority.fieldPermis.title')}}
                            <Poptip trigger="hover" transfer :content="$t('authority.userManagement.fileInfo')">
                                <Icon type="help-circled"
                                      style="color:#fff;background-color:#dadada;border-radius:50%"></Icon>
                            </Poptip>
                        </h2>
                        <CheckboxGroup v-model="select_field[index]"
                                       style="padding:10px 0 10px 20px;height:150px;width:100%;overflow:hidden">
                            <div style="height:100%;overflow:auto;width:103%;">
                                <Checkbox v-for="(item,index) in field_list" :key="index" :label="item.label"
                                          style="display:block">
                                    <!-- <span>{{item.label}}</span> -->
                                </Checkbox>
                            </div>
                        </CheckboxGroup>
                    </Col>
                </Row>
            </div>
            <!-- <div style="margin: 20px 0">
              {{$t('authority.userManagement.selected')}}
              <Row style="margin-top:10px" >
                <Col span='8' class="col_box3 col_box2" style="padding:0;">
                  <h2 class="tip" style="background-color:#dadada">{{$t('authority.functionalPermis.title')}}</h2>
                  <div style="height:100px;width:100%;overflow:hidden">
                    <ul class="list">
                      <li v-for="(item,index) in select_functional">
                        {{item}}
                        <Icon style="float:right;margin-right:20px;cursor:pointer" type="ios-trash-outline" @click.native="remove_functional(index)"></Icon>
                      </li>
                    </ul>
                  </div>
                </Col>
                <Col span='8' class="col_box3" style="padding:0;">
                  <h2 class="tip" style="background-color:#e5e5e5">{{$t('authority.adminPermis.title')}}</h2>
                  <div style="height:100px;width:100%;overflow:hidden">
                    <ul class="list">
                      <li v-for="(item,index) in select_admin">
                        {{item}}
                        <Icon style="float:right;margin-right:20px;cursor:pointer" type="ios-trash-outline" @click.native="remove_admin(index)"></Icon>
                      </li>
                    </ul>
                  </div>
                </Col>
                <Col span='8' class="col_box3" style="padding:0;">
                  <h2 class="tip" style="background-color:#f0f0f0">{{$t('authority.fieldPermis.title')}}</h2>
                  <div style="height:100px;width:100%;overflow:hidden">
                    <ul class="list">
                      <li v-for="(item,index) in select_field">
                        {{item}}
                        <Icon style="float:right;margin-right:20px;cursor:pointer" type="ios-trash-outline" @click.native="remove_field(index)"></Icon>
                      </li>
                    </ul>
                  </div>
                </Col>
              </Row>
            </div> -->
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
    import { mapState } from 'vuex';

    export default {
        name: 'allocation_permissions',
        props: {
            modal: {
                type: Boolean,
                default: false
            },
            loading: {
                type: Boolean,
                default: false
            },
            delete_title: {
                type: Object
            },
            user: {
                type: Array
            }
        },
        data() {
            return {
                allocation_permissions: false,
                modal_loading: false,
                user_list: [],
                select_functional: [],
                functional_list: [],
                select_admin: [],
                admin_list: [],
                select_field: [],
                field_list: [],
                orgId: this.$store.state.enterpriseId
                // orgId:10166,

            };
        },
        computed: {
            ...mapState({
                window_height: 'window_height'
            })
        },
        created() {
            this.get_functional();
            this.get_manage();
            this.get_field();
        },
        methods: {
            /** 回填权限 */
            backfill() {
                console.log('用户列表', [...this.user]);
                this.user.forEach((user, index) => {
                    if (user.functional_permissions) {
                        this.select_functional[index] = user.functional_permissions.split(',');
                    }
                    if (user.administrative_authority) {
                        this.select_admin[index] = user.administrative_authority.split(',');
                    }
                    if (user.field_permissions) {
                        this.select_field[index] = user.field_permissions.split(',');
                    }
                });
            },
            get_id(val1, val2) {
                const arr = [];
                if (val1) {
                    for (let i = 0; i < val1.length; i++) {
                        for (let j = 0; j < val2.length; j++) {
                            if (val1[i] === val2[j].label) {
                                arr.push(val2[j].value);
                            }
                        }
                    }
                }
                /* for(let i=0;i<val1.length;i++){
                  for(let j=0;j<val2.length;j++){
                    if(val1[i] === val2[j].label){
                      arr.push(val2[j].value)
                    }
                  }
                } */
                // if(arr.length == 0){
                //   arr.push(0)
                // }
                return arr;
            },
            handle_submit(name) {
                const flag = 0;
                const functional_id = [];
                const admin_id = [];
                const field_id = [];
                for (let index = 0; index < this.user_list.length; index++) {
                    functional_id[index] = this.get_id(this.select_functional[index], this.functional_list);
                    admin_id[index] = this.get_id(this.select_admin[index], this.admin_list);
                    field_id[index] = this.get_id(this.select_field[index], this.field_list);
                    if (functional_id[index].length === 0) {
                        this.$Message.warning(`【${this.user_list[index].name}】没有选择功能权限`);
                        return;
                    } else if (admin_id[index].length === 0) {
                        this.$Message.warning(`【${this.user_list[index].name}】没有选择管理权限`);
                        return;
                    } else if (field_id[index].length === 0) {
                        this.$Message.warning(`【${this.user_list[index].name}】没有选择字段权限`);
                        return;
                    }
                }
                const postData = [];
                this.user_list.forEach((item, index) => {
                    postData.push({
                        fieldPermissionIds: field_id[index],
                        managePermissionIds: admin_id[index],
                        orgId: this.orgId,
                        roleIds: functional_id[index],
                        userIds: [item.id]
                    });
                });
                util.ajaxJson({
                    url: '/new-privilege/permission/addBatch',
                    method: 'post',
                    data: postData
                }).then(res => {
                    if (res.data.code === '1') {
                        this.$Message.success(this.$t('authority.userManagement.permisSuccess'));
                        this.$emit('change_permission');
                        this.allocation_permissions = false;
                        this.select_functional = [];
                        this.select_admin = [];
                        this.select_field = [];
                    } else {
                        this.$Message.error(res.data.message);
                    }
                });
                // let functional_id = this.get_id(this.select_functional,this.functional_list)
                // let admin_id = this.get_id(this.select_admin,this.admin_list)
                // let field_id = this.get_id(this.select_field,this.field_list)
                // let user = []
                // let val3 = this.user_list
                // for(let i=0;i<val3.length;i++){
                //   user.push(val3[i].id)
                // }
                // util.ajaxJson({
                //   url: '/new-privilege/permission/add',
                //   method: 'post',
                //   data: {
                //     fieldPermissionIds: field_id,
                //     managePermissionIds: admin_id,
                //     orgId: this.orgId,
                //     roleIds: functional_id,
                //     userIds:user
                //   }
                // }).then(response => {
                //   if(response.data.code === '1' ){
                //     this.$Message.success(this.$t('authority.userManagement.permisSuccess'));
                //     this.$emit('change_permission')
                //     this.allocation_permissions =false
                //     this.select_functional=[]
                //     this.select_admin=[]
                //     this.select_field=[]
                //   }else{
                //     this.$Message.error(response.data.message);
                //   }
                // });
                this.allocation_permissions = false;
                this.select_functional = [];
                this.select_admin = [];
                this.select_field = [];
                // let functional_id = this.get_id(this.select_functional,this.functional_list)
                // let admin_id = this.get_id(this.select_admin,this.admin_list)
                // let field_id = this.get_id(this.select_field,this.field_list)
                // let user = []
                // let val3 = this.user_list
                // for(let i=0;i<val3.length;i++){
                //   user.push(val3[i].id)
                // }
                // util.ajaxJson({
                //   url: '/new-privilege/permission/add',
                //   method: 'post',
                //   data: {
                //     fieldPermissionIds: field_id,
                //     managePermissionIds: admin_id,
                //     orgId: this.orgId,
                //     roleIds: functional_id,
                //     userIds:user
                //   }
                // }).then(response => {
                //   if(response.data.code === '1' ){
                //     this.$Message.success(this.$t('authority.userManagement.permisSuccess'));
                //     this.$emit('change_permission')
                //     this.allocation_permissions =false
                //     this.select_functional=[]
                //     this.select_admin=[]
                //     this.select_field=[]
                //   }else{
                //     this.$Message.error(response.data.message);
                //   }
                // });
            },
            handle_cancel() {
                this.allocation_permissions = false;
                this.select_functional = [];
                this.select_admin = [];
                this.select_field = [];
            },
            remove_functional(val) {
                console.log(1);
                this.select_functional.splice(val, 1);
            },
            remove_admin(val) {
                console.log(1);
                this.select_admin.splice(val, 1);
            },
            remove_field(val) {
                console.log(1);
                this.select_field.splice(val, 1);
            },
            get_functional() {
                util.ajaxJson({
                    url: '/new-privilege/role/allByPage',
                    method: 'post',
                    data: {
                        category: 2,
                        orgId: this.orgId
                        // "orgId": 10214
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const val = response.data.data.data;
                        const arr = [];
                        for (let i = 0; i < val.length; i++) {
                            const obj = {};
                            obj.label = val[i].name;
                            obj.value = val[i].id;
                            arr.push(obj);
                        }
                        this.functional_list = arr;
                    } else {
                        this.$Message.error(response.data.message);
                    }
                });
            },
            get_manage() {
                util.ajaxJson({
                    url: '/new-privilege/manage/allByPage',
                    method: 'post',
                    data: {
                        orgId: this.orgId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const val = response.data.data.data;
                        const arr = [];
                        for (let i = 0; i < val.length; i++) {
                            const obj = {};
                            obj.label = val[i].name;
                            obj.value = val[i].id;
                            arr.push(obj);
                        }
                        this.admin_list = arr;
                    } else {
                        this.$Message.error(response.data.message);
                    }
                });
            },
            get_field() {
                util.ajaxJson({
                    url: '/new-privilege/field/allByPage',
                    method: 'post',
                    data: {
                        orgId: this.orgId
                        // "orgId": 10214
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const val = response.data.data.data;
                        const arr = [];
                        for (let i = 0; i < val.length; i++) {
                            const obj = {};
                            obj.label = val[i].name;
                            obj.value = val[i].id;
                            arr.push(obj);
                        }
                        this.field_list = arr;
                    } else {
                        this.$Message.error(response.data.message);
                    }
                });
            },
            handleModalChange(val) {
                console.log(val);
                if (!val) {
                    this.select_functional = [];
                    this.select_admin = [];
                    this.select_field = [];
                }
            }
        },
        watch: {
            allocation_permissions(val) {
                this.$emit('change_allocation_permissions', val);
                if (val) {
                    this.backfill();
                }
            },
            modal(val) {
                console.log('modal改变');
                this.allocation_permissions = val;
            },
            loading(val) {
                this.modal_loading = val;
            },
            modal_loading(val) {
                this.$emit('change_delete_loading', val);
            },
            user(val) {
                this.user_list = val;
            }
        }
    };
</script>

<style scoped>
    .tip {
        width: 100%;
        height: 40px;
        line-height: 38px;
        text-align: center;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.8);
        font-weight: 400;
    }

    .col_box1 {
        border: 1px solid #dadada;
        height: 200px;
        border-left: 0;
    }

    .col_box3 {
        border: 1px solid #dadada;
        height: 150px;
        border-left: 0;
    }

    .col_box2 {
        border-left: 1px solid #dadada;
    }

    .list {
        height: 100%;
        overflow: auto;
        width: 103%
    }

    .list li {
        width: 100%;
        height: 30px;
        padding: 10px 20px;
    }
</style>
