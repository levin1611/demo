<style lang="less" scoped>
    @import url(./bind_relation.less);
</style>
<template>
    <div>
        <Spin v-if="pageLoading"></Spin>
        <span style="margin:18px 25px;display:inline-block;font-size:12px">
    请按照以下步骤将AMP网站上的留言表单字段与询盘云中AMP表单字段相匹配，完成表单绑定。
  </span>
        <div class="bind-container">
            <div class="title">
                <span>{{$t('facebook.bindForm.origin')}}</span>
                <span>{{$t('facebook.bindForm.goal')}}</span>
            </div>
            <div class="images">
                <div>
                    <Icon custom="custom custom-AMP" size="60"></Icon>
                    <div class="logo-title">AMP</div>
                </div>
                <Icon custom="custom custom-circle-arrow" size="40"></Icon>
                <div>
                    <Icon custom="custom custom-main-logo" size="60"></Icon>
                    <div class="logo-title">询盘云</div>
                </div>
            </div>
            <div class="match-words">
                {{$t('facebook.bindForm.match_field')}}
            </div>
            <div class="match-main">
                <!-- 匹配中的界面 -->
                <ul class="match-content" v-show="ismatching">
                    <li v-for="(i,index) in ampList" :key="index">
                        <div class="ivu-input">{{i.label}}</div>
                        <Icon custom="custom custom-form-set-arrow" size="24"></Icon>
                        <Select v-model="leadscloudIndexs[index]" style="width:256px">
                            <Option v-for="(item,index) in leadscloudList" :key="index" :value="index">{{ item.name }}
                            </Option>
                        </Select>
                    </li>
                </ul>
                <!-- 保存匹配时的界面 -->
                <ul class="match-content matched" v-show="!ismatching">
                    <li v-for="(item,index) in ampList" :key="index">
                        <div class="ivu-input">{{item.label}}</div>
                        <Icon custom="custom custom-form-set-arrow" size="24"></Icon>
                        <div class="ivu-input">{{getLeadscloudName(index)}}</div>
                    </li>
                </ul>
                <!-- 下面的操作按钮 -->
                <div class="actiopns-btn">
                    <Button v-show="ismatching" type="primary" ghost @click="showTable()" class="last-step">
                        {{$t('facebook.bindForm.last')}}
                    </Button>
                    <Button v-show="ismatching" type="primary" @click="match()">{{$t('facebook.bindForm.match')}}
                    </Button>
                    <!-- 下面是匹配完的按钮 -->
                    <Button v-show="!ismatching" type="primary" ghost @click="ismatching = !ismatching"
                            class="last-step">{{$t('facebook.bindForm.last')}}
                    </Button>
                    <Button :loading="loading" v-show="!ismatching" @click="saveRelation" type="primary">
                        {{$t('save')}}
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import {mapActions, mapState} from 'vuex';
    import Vue from 'vue';
    import util from '@/libs/util';

    export default {
        name: 'bindRelation',
        props: {
            ampForm: {
                type: Object,
                default() {
                    return {};
                }
            },
            tableShow: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                ampList: [],
                select: 'name',
                ismatching: true, // 正在匹配
                leadscloudIndexs: [],
                leadscloudList: [],
                ampTemplateId: '',
                loading: false,
                pageLoading: false
            };
        },
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId'
            })
        },
        created() {
            this.getAMPForm();
            this.getLeadscloudForm();
        },
        methods: {
            getAMPForm() {
                util.ajax({
                    url: '/form-cust/formamp/getAmpFormFields',
                    method: 'get',
                    params: {
                        orgId: `${this.orgId}`,
                        ampFormId: this.ampForm.id,
                        createUserId: ''
                    }
                }).then(res => {
                    if (res.data.code == 1) {
                        this.ampList = res.data.data.ampForm;
                    }
                });
            },
            getLeadscloudForm() {
                util.ajax({
                    url: '/form-cust/form/getLastedTemplate?',
                    method: 'get',
                    params: {
                        orgId: this.orgId,
                        cateType: 2
                    }
                }).then(res => {
                    if (res.data.code) {
                        this.ampTemplateId = res.data.data.id;
                        this.getFields(this.ampTemplateId);
                    }
                });
            },
            getFields(templateId) {
                util.ajax({
                    url: '/form-cust/form/getColumns',
                    method: 'post',
                    data: {
                        orgId: this.orgId,
                        templateId,
                        isShow: 1
                    }
                }).then(res => {
                    if (res.data.code == 1) {
                        this.leadscloudList = res.data.data;
                    }
                });
            },
            getLeadscloudName(index) {
                let item = this.leadscloudList[this.leadscloudIndexs[index]];
                return item ? item.name : this.$t('facebook.bindForm.not_select');
            },
            saveRelation() {
                let relation = {};
                this.leadscloudIndexs.forEach((item, index) => {
                    if (item) {
                        relation[this.ampList[index].key] = item;
                    }
                });
                this.loading = true;
                util.ajaxJson({
                    url: '/form-cust/formamp/saveFAmpRelation',
                    method: 'post',
                    data: {
                        relation: JSON.stringify(relation),
                        ampFormId: this.ampForm.id,
                        ampFormTemplateId: this.ampTemplateId,
                        createUserId: this.userId,
                        enterpriseId: this.orgId,
                        ampFormName: this.ampForm.ampFormName,
                        providerId: 'amp'
                    }
                }).then(async res => {
                    this.loading = false;
                    if (res.data.code == 1) {
                        this.$Message.success('绑定成功！');
                        let flag = await util.ajax({
                            url: '/form-cust/formamp/updateBindingFlag',
                            method: 'post',
                            data: {
                                createUserId: '',
                                providerId: 'amp',
                                ampFormId: this.ampForm.id,
                                orgId: this.orgId
                            }
                        });
                        if (flag.data.code == 1) {
                            this.$Message.success('修改绑定状态成功！');
                            this.$emit('updateData');
                            this.$emit('update:tableShow', true);
                        } else {
                            this.$Message.error('修改绑定状态失败！');
                        }
                    } else {
                        this.$Message.error('绑定失败！');
                    }
                });
            },
            changeFlag() {
                return;
                util.ajax({
                    url: '/form-cust/formamp/updateBindingFlag',
                    method: 'post',
                    data: {
                        createUserId: '',
                        providerId: 'amp',
                        ampFormId: this.ampForm.id,
                        orgId: this.orgId
                    }
                });
            },
            match() {
                if (this.leadscloudIndexs.length > 0) {
                    /* 判断是否有重复字段 */
                    let list = this.leadscloudIndexs.filter(item => {
                        return item;
                    });
                    let oldLength = list.length;
                    let newLength = [...new Set(list)].length;
                    if (oldLength !== newLength) {
                        this.$Message.warning({message: '您的选择中有重复字段，请重新选择！', duration: 10000, closable: true});
                        return;
                    }
                    this.ismatching = !this.ismatching;
                } else {
                    this.$Message.warning('您没有选择匹配字段！');
                }
            },
            showTable() {
                this.$emit('update:tableShow', true);
            },
            isEmptyObject(obj) { /* 判断一个对象是否为空 */
                for (let key in obj) {
                    return false;
                }
                ;
                return true;
            }
            // 保存用户匹配的字段

        }
    };
</script>
