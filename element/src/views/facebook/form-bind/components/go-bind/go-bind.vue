<style lang="less" scoped>
    @import url(./go-bind.less);
</style>
<template>
    <div>
        <div class="bind-relation-title">
            <span class="text_raletion">字段匹配</span>
            <div v-if="rowInfo.bindingFlag === 0 && canBindCompanyLeads" class="bind_state">
                <Button icon="custom custom-bindleads" class="fbleadsbind-bind" type='text' @click="bind_data">
                    绑定
                </Button>
            </div>
            <div v-else class="bind_state">
                <Button icon="custom custom-field-edit" class="fbleadsbind-edit" type='text' @click="edit_data">
                    编辑
                </Button>
                <Button v-if="canUnBindCompanyLeads" icon="custom custom-unbindleads" class="fbleadsbind-unbind" type='text'
                        @click="unbind_data">解绑
                </Button>
            </div>
        </div>
        <div class="bind-container">
            <div class="title">
                <span>{{$t('facebook.bindForm.origin')}}</span>
                <span>{{$t('facebook.bindForm.goal')}}</span>
            </div>
            <div class="images">
                <div>
                    <svg class="svg-icon" aria-hidden="true"
                         style="width: 54px; height:54px;vertical-align: middle;cursor: pointer;">
                        <use xlink:href="#custom-Facebook"></use>
                    </svg>
                    <div class="describe_text_left">Facebook</div>
                </div>
                <icon custom="custom custom-arrow-solid" class="icon_jiantou"></icon>
                <div>
                    <icon custom="custom custom-main-logo" class="icon_xunpan"></icon>
                    <div class="describe_text_right">询盘云</div>
                </div>

            </div>
            <div class="match-words">
                {{$t('facebook.bindForm.match_field')}}
            </div>
            <div class="match-main">
                <!-- 匹配中的界面 -->
                <ul class="match-content clearfloat" style="padding-bottom: 20px;">
                    <li class="clearfloat" v-for="(i,index) in facebookLeadsForm" :key="index">
                        <div class="ivu-input">{{i.label}}</div>
                        <icon custom="custom custom-arrow-hollow"
                              style="font-size: 24px;color: #A9B9C9;"></icon>
                        <div class="ivu-input" v-if="i.value&&i.zhValue">{{i.zhValue}}</div>
                        <div class="ivu-input" v-else-if="i.value&&!i.zhValue">已匹配字段不存在</div>
                        <div class="ivu-input" v-else>未选择匹配字段</div>
                    </li>
                </ul>
                <!-- 下面的操作按钮 -->
                <!-- <div style="text-align: center;">
                    <Checkbox style="text-align:center" v-model="syncHighSea" disabled>
                        {{$t('facebook.bindForm.sync_sea')}}
                    </Checkbox>
                </div> -->
            </div>
            <Modal
                    :title="'匹配字段'"
                    :visible.sync="text_relation_modal"
                    :close-on-click-modal="false"
                    :modal-append-to-body="false"
                    @close="EditsyncHighSea=false"
                    width="625"
            >
                <div class="match-main" style="height: auto;">
                    <!-- 保存匹配时的界面 -->
                    <ul class="match-content matched" style="padding: 0;margin-top: 0;">
                        <li class="clearfloat" v-for="(i,index) in editFacebookLeadsForm" :key="index"
                            style="padding: 0 30px;margin-bottom: 10px;">
                            <div class="modal-ivu-input">{{i.label}}</div>
                            <icon custom="custom custom-arrow-hollow"
                                  style="font-size: 24px;color: #A9B9C9;margin: 0;margin-right: 50px;"></icon>
                            <Select v-model="i.zhValue" style="width:140px;height: 34px;" clearable @change="updateFacebookLeads(i,index,$event)">
                                <Option v-for="(item,index) in leadscloudList" :value="item.name" :key="index" :label="item.name">
                                </Option>
                            </Select>
                        </li>
                    </ul>

                </div>
                <div slot="footer">
                    <!-- <Checkbox style="float: left;padding-top: 14px;" v-model="EditsyncHighSea">
                        {{$t('facebook.bindForm.sync_sea')}}
                    </Checkbox> -->
                    <Button @click="close_modal(false)">{{$t('cancel')}}</Button>
                    <Button type="primary" @click="submit_relation()">{{$t('confirm')}}</Button>
                </div>
            </Modal>
            <Modal :visible="unbind_modal" :modal-append-to-body="false" :title="$t('facebook.bindForm.unbind')">
                <div>
                    {{$t('facebook.bindForm.sure_bind')}}【{{rowInfo.formName}}】？<br/>
                    {{$t('facebook.bindForm.unbind_tip')}}
                </div>
                <div slot="footer">
                    <Button @click="close_unbind_modal(false)">{{$t('cancel')}}</Button>
                    <Button type="primary" @click="submit_unbind()">{{$t('confirm')}}</Button>
                </div>
            </Modal>
        </div>

    </div>
</template>
<script>
    import { mapState } from 'vuex';
    import util from '../../../../../libs/util';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';

    export default {
        name: 'GoBind',
        props: {
            rowInfo: {
                type: Object,
                default() {
                    return {};
                }
            },
            facebookLeadsFormObj: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                leadscloudForm: {}, /* fb表单模板 */
                select: 'name',
                ismatching: true, // 正在匹配
                leadscloudIndexs: [],
                syncHighSea: false, /* 是否同步到公海 */
                EditsyncHighSea: false,
                text_relation_modal: false,
                leadscloudClue: {},
                leadscloudList: [],
                facebookLeadsForm: [],
                editFacebookLeadsForm: [],
                action: '',
                unbind_modal: false
            };
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                userName: state => state.userName,
                enterpriseId: state => state.enterpriseId,
                facebookList: state => state.facebook.facebookForm.facebookForm,
                button_list: state => state.app.button_list
                // leadscloudList: state => state.facebook.leadscloudList,
            }),
            canBindCompanyLeads() {
                return !HANDLE_BUTTON(BUTTON_IDS.systemSetting.facebookSetting.form.bindCompanyLeads, this.button_list);
            },
            canUnBindCompanyLeads() {
                return !HANDLE_BUTTON(BUTTON_IDS.systemSetting.facebookSetting.form.unBindCompanyLeads, this.button_list);
            }
        },
        created() {
            this.getXSShow();
            this.getFBForm();
        },
        watch: {
            facebookLeadsFormObj: {
                handler(val) {
                    if (JSON.stringify(val) !== '{}') {
                        this.facebookLeadsForm = val.facebookForm;
                        if (val.highSeaFlag === '1') {
                            this.syncHighSea = true;
                        } else {
                            this.syncHighSea = false;
                        }
                        for (let i = 0; i < this.facebookLeadsForm.length; i++) {
                            // const isHave = this.leadscloudList.find(item => {
                            //     return this.facebookLeadsForm[i].value && item.key === this.facebookLeadsForm[i].value;
                            // });
                            // console.log('isHave', isHave);
                            // // 增加表示
                            // if (!isHave) {
                            //     this.facebookLeadsForm[i].value = '';
                            //     this.facebookLeadsForm[i].delFlag = true;
                            // }
                            for (let j = 0; j < this.leadscloudList.length; j++) {
                                if (this.facebookLeadsForm[i].value) {
                                    if (this.facebookLeadsForm[i].value === this.leadscloudList[j].key) {
                                        this.facebookLeadsForm[i].zhValue = this.leadscloudList[j].name;
                                    }
                                }
                            }
                        }
                    } else {
                        this.facebookLeadsForm = [];
                    }
                },
                immediate: true
            }
        },
        methods: {
            updateFacebookLeads(i, index, $event) {
                console.log(i, index, $event);
                if (!$event) {
                    i.value = '';
                    return;
                }
                this.leadscloudList.forEach(item => {
                    if (item.name === $event) {
                        i.value = item.key;
                    }
                });
            },
            /* 通过企业id获取线索表单字段 */
            getXSShow() {
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code == 1) {
                        this.leadscloudClue = response.data.data.template;
                    }
                });
            },
            /* 获取fb表单字段 */
            getFBForm() {
                util.ajax({
                    url: '/form-cust/form/getLastedTemplate',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        cateType: 1 /* 1是fb 表单 */
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        const id = res.data.data.id; /* fb表单id */
                        this.leadscloudForm = res.data.data;
                        util.ajax({
                            url: '/form-cust/form/getColumns',
                            method: 'post',
                            data: {
                                templateId: id,
                                isShow: 1,
                                orgId: this.enterpriseId
                            }
                        }).then(res => {
                            const result = res.data.data;
                            this.leadscloudList = [];
                            for (const key in result) {
                                /* 判断是否必填项 若是在后面加星号 */
                                if (result[key].isNeed == 1) {
                                    result[key].name += '*';
                                }
                                this.leadscloudList.push({
                                    name: result[key].name,
                                    key,
                                    isNeed: result[key].isNeed
                                });
                            }
                        });
                    } else {
                        this.$Message.error(this.$t('facebook.bindForm.no_form'));
                        this.$Message.error(this.$t('facebook.bindForm.set_form'));
                    }
                }).catch(erro => {
                    this.$Message.error(this.$t('facebook.bindForm.set_form'));
                    this.$Message.error(this.$t('facebook.bindForm.no_form'));
                });
            },
            bind_data() {
                this.text_relation_modal = true;
                this.action = 'bind';
                // this.$listeners.getData();
                this.editFacebookLeadsForm = JSON.parse(JSON.stringify(this.facebookLeadsForm));
            },
            edit_data() {
                this.text_relation_modal = true;
                this.action = 'edit';
                this.editFacebookLeadsForm = JSON.parse(JSON.stringify(this.facebookLeadsForm));
                // this.EditsyncHighSea = Number(this.facebookLeadsFormObj.highSeaFlag) === 1;
            },
            unbind_data() {
                this.unbind_modal = true;
            },
            submit_relation() {
                const relation = {};
                const lcList = [];
                this.editFacebookLeadsForm.forEach((item, index) => {
                    if (item.value !== undefined && item.value !== '') {
                        relation[item.key] = item.value;
                        lcList.push(item.value);
                    }
                });
                if (this.isEmptyObject(relation)) {
                    this.$Message.warning(this.$t('facebook.bindForm.select_fields'));
                    return;
                }
                const oldLen = lcList.length;
                const newLen = Array.from(new Set(lcList)).length;
                if (oldLen == newLen) { /* 没有重复字段 */
                    const obj = {
                        relation: JSON.stringify(relation),
                        syncHighSeasFlag: this.EditsyncHighSea ? 1 : 0
                    };
                    if (this.action === 'bind') {
                        this.bindFormData(obj);
                    } else {
                        this.editFormData(obj);
                    }
                } else {
                    this.$Message({
                        message: this.$t('facebook.bindForm.repeat'),
                        type: 'warning',
                        duration: 10000,
                        showClose: true
                    });
                }
            },
            bindFormData(obj) {
                util.ajaxInternationalJson({
                    url: '/social/form/saveRelation',
                    method: 'post',
                    data: {
                        systemFormId: this.facebookLeadsFormObj.systemFormId,
                        providerUserId: this.facebookLeadsFormObj.providerUserId,
                        providerUserName: this.facebookLeadsFormObj.providerUserName,
                        providerId: this.facebookLeadsFormObj.providerId,
                        facebookFormId: this.facebookLeadsFormObj.facebookFormId,
                        formName: this.facebookLeadsFormObj.facebookFormName,
                        userId: this.userId,
                        relation: obj.relation,
                        syncHighSeasFlag: obj.syncHighSeasFlag,
                        highSeasTemplateId: this.leadscloudClue.id ? this.leadscloudClue.id : '',
                        formOrgId: this.leadscloudForm.orgId,
                        formTemplateId: this.leadscloudForm.id,
                        enterpriseId: Number(this.enterpriseId)
                    }
                })
                    .then(response => {
                        if (response.data.code === '1') {
                            this.$Message.success(this.$t('facebook.bindForm.bind_success'));
                            this.updateBindState();
                            // dispatch('updateBindState');
                            // dispatch('saveLog',JSON.stringify(data))
                        }
                    });
            },
            editFormData(obj) {
                util.ajaxInternationalJson({
                    url: '/social/form/updateRelation',
                    method: 'post',
                    data: {
                        id: this.rowInfo.id,
                        relation: obj.relation,
                        highSeaFlag: this.EditsyncHighSea ? 1 : 0
                    }
                })
                    .then(response => {
                        if (response.data.code === '1') {
                            this.$Message.success(this.$t('facebook.bindForm.status_edit_success'));
                            this.$emit('editSuccess');
                            this.text_relation_modal = false;
                            // dispatch('updateBindState');
                            // dispatch('saveLog',JSON.stringify(data))
                        }
                    });
            },
            /* 更新数据绑定状态 */
            updateBindState() {
                util.ajaxInternationalJson({
                    url: '/social/form/updateBind',
                    method: 'post',
                    params: {
                        userId: this.userId,
                        providerId: 'facebook',
                        id: this.rowInfo.id
                    }
                })
                    .then(response => {
                        if (response.data.code === '1') {
                            this.$emit('updateSuccess');
                            this.text_relation_modal = false;
                            this.rowInfo.bindingFlag = 1;
                            // rootState.eventBus.$Notice.success({
                            //   title: lang[Vue.config.lang].facebook.bindForm.status_update,
                            // })
                            // state.tableData[state.currentIndex].bindingFlag = 1;
                            // commit("setFormBindView", "FormTable")
                            // dispatch('synFacebookAnswer');
                        }
                    });
            },
            close_modal(flag) {
                this.text_relation_modal = flag;
            },
            close_unbind_modal(flag) {
                this.unbind_modal = flag;
            },
            submit_unbind() {
                const params = {
                    orgId: this.enterpriseId,
                    userId: this.rowInfo.userId,
                    providerId: 'facebook',
                    id: this.rowInfo.id,
                    facebookFormId: this.rowInfo.facebookFormId
                };
                util.ajaxInternational({
                    url: '/social/form/updateBind',
                    method: 'post',
                    params
                }).then((res) => {
                    if (res.data.code === '1') {
                        // this.saveLog(JSON.stringify(params))
                        this.$Message.success(this.$t('facebook.bindForm.unbind_success'));
                        this.$emit('unbindSuccess');
                        this.rowInfo.bindingFlag = 0;
                        this.unbind_modal = false;
                    }
                });
            },
            getLeadscloudName(index) {
                const item = this.leadscloudList[this.leadscloudIndexs[index]];
                return item ? item.name : this.$t('facebook.bindForm.not_select');
            },
            isEmptyObject(obj) { /* 判断一个对象是否为空 */
                for (const key in obj) {
                    return false;
                }
                ;
                return true;
            },
            // 保存用户匹配的字段
            save() {
                const relation = {};
                const that = this;
                const lcList = []; /* 用户选的字段 用于判断查重 */
                this.leadscloudIndexs.forEach((item, index) => {
                    if (item !== undefined && item !== '') {
                        item = parseInt(item);
                        relation[this.facebookList[index].key] = this.leadscloudList[item].key;
                        lcList.push(this.leadscloudList[item].key);
                    }
                });
                if (this.isEmptyObject(relation)) {
                    this.$Message({
                        message: '您没有选择对应关系！',
                        type: 'warning',
                        duration: 10000,
                        showClose: true
                    });
                    return;
                }
                const oldLen = lcList.length;
                const newLen = Array.from(new Set(lcList)).length;
                if (oldLen == newLen) { /* 没有重复字段 */
                    const obj = {
                        relation: JSON.stringify(relation),
                        syncHighSeasFlag: this.syncHighSea ? 1 : 0
                    };
                    this.bindFormData(obj);
                    /* 返回首页后匹配条件置空 */
                    this.ismatching = true;
                    this.leadscloudIndexs = [];
                } else {
                    this.$Message({
                        message: this.$t('facebook.bindForm.repeat'),
                        type: 'warning',
                        duration: 10000,
                        showClose: true
                    });
                }
            }
        }
    };
</script>
