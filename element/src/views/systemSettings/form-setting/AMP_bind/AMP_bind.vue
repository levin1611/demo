<template>
    <Card :bordered="false" dis-hover style="padding:14px;">
        <div v-show="tableShow">
            <p class="annotation">
                注:请选择AMP表单与询盘云表单进行绑定，完成绑定后询盘云系统将实时获取访客在AMP网站上提交的留言信息，企业可以在【网站留言】模块统一查看。
                <Button type="primary" ghost style="float:right;">
                    <router-link :to="{name:'form_setting'}">{{$t('back')}}</router-link>
                </Button>
            </p>
            <!-- <div class="clearfloat">
                <FilterBox class="float-right">
                </FilterBox>
            </div> -->
            <Table class="noborder-table" :columns="tableColumn" :data="tableData"></Table>
        </div>
        <Bind @updateData="updateList" :ampForm="ampForm" :tableShow.sync="tableShow" v-if="!tableShow">
        </Bind>
        <Modal v-model="unbindFlag" :title="$t('facebook.bindForm.unbind')" @on-ok="unbind()">
            <div>
                {{$t('facebook.bindForm.sure_bind')}}【{{unbindForm.ampFormName}}】？<br/>
                {{$t('facebook.bindForm.unbind_tip')}}
            </div>
        </Modal>
    </Card>
</template>
<script>
    import util from '@/libs/util.js';
    import FilterBox from './filter/filter';
    import {mapState} from 'vuex';
    import Bind from './bind_relation/bind_relation';

    export default {
        name: 'AMP_bind',
        components: {
            FilterBox,
            Bind
        },
        created() {
            this.dateformat();
            this.getAMPList();
        },
        computed: {
            ...mapState({
                orgId: 'enterpriseId'
            })
        },
        data() {
            return {
                tableColumn: [
                    {title: '序号', type: 'index'},
                    {title: 'AMP表单名', key: 'ampFormName'},
                    {
                        title: '表单创建时间',
                        render: (h, params) => {
                            return h('span', new Date(params.row.createTime).format('yyyy-MM-dd'));
                        }
                    },
                    {
                        title: '状态',
                        render: (h, params) => {
                            return h('span', params.row.isDelete ? '未使用' : '使用中');
                        }
                    },
                    {
                        title: this.$t('crm.Table.operate'),
                        key: '',
                        render: (h, params) => {
                            if (params.row.bindingFlag) {
                                return h('span', {
                                    'class': {
                                        'mouse-on-gounbind': true
                                    },
                                    on: {
                                        click: () => {
                                            this.updateFlag(params.row);
                                        }
                                    }
                                }, params.row.bindingFlag ? this.$t('facebook.bindForm.gounbind') : this.$t('facebook.bindForm.gobind'));
                            } else {
                                return h('span', {
                                    /* attrs:{
                                        style:'color:#FA8241;cursor:pointer;'
                                    }, */
                                    'class': {
                                        'mouse-on-gobind': true
                                    },
                                    on: {
                                        click: () => {
                                            this.gobind(params.row);
                                        }
                                    }
                                }, params.row.bindingFlag ? this.$t('facebook.bindForm.gounbind') : this.$t('facebook.bindForm.gobind'));
                            }
                        }
                    }
                ],
                tableData: [],
                tableShow: true,
                ampForm: {},
                unbindFlag: false,
                unbindForm: {}
            };
        },
        methods: {
            getAMPList() {
                util.ajax({
                    url: '/form-cust/formamp/getAmpFormList',
                    method: 'get',
                    params: {
                        orgId: `${this.orgId}`,
                        createUserId: ''
                    }
                }).then(res => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data;
                    }
                });
            },
            updateList() {
                this.getAMPList();
            },
            /* 绑定 */
            gobind(data) {
                this.ampForm = data;
                this.tableShow = false;
            },
            /* 解绑 */
            unbind() {
                util.ajax({
                    url: '/form-cust/formamp/updateBindingFlag',
                    method: 'post',
                    data: {
                        createUserId: '',
                        providerId: 'amp',
                        ampFormId: this.unbindForm.id,
                        orgId: this.orgId
                    }
                }).then(res => {
                    if (res.data.code == 1) {
                        this.$Message.success(this.$t('facebook.bindForm.unbind_success'));
                        this.updateList();
                    }
                });
            },
            updateFlag(data) {
                this.unbindFlag = true;
                this.unbindForm = data;
            },
            dateformat() {
                Date.prototype.format = function(fmt) {
                    let o = {
                        'M+': this.getMonth() + 1, // 月份
                        'd+': this.getDate(), // 日
                        'h+': this.getHours(), // 小时
                        'm+': this.getMinutes(), // 分
                        's+': this.getSeconds(), // 秒
                        'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
                        'S': this.getMilliseconds() // 毫秒
                    };
                    if (/(y+)/.test(fmt)) {
                        fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()
                        }`).substr(4 -
                            RegExp.$1.length));
                    }
                    for (let k in o) {
                        if (new RegExp(`(${k})`).test(fmt)) {
                            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
                                ? (o[k])
                                : ((`00${o[k]}`).substr((`${o[k]}`).length)));
                        }
                    }
                    return fmt;
                };
            }
        }
    };
</script>
<style lang="less" scoped>
    .float-right {
        float: right;
    }

    .annotation {
        margin-bottom: 26px;
        font-size: 12px;
        line-height: 20px;
        color: rgba(0, 0, 0, 0.8);
    }
</style>
<style lang="less">
    .mouse-on-gobind {
        color: #FA8241;
        cursor: pointer;
    }

    .mouse-on-gobind:hover {
        text-decoration: underline;
    }

    .mouse-on-gounbind {
        color: #3b78de;
        cursor: pointer;
    }

    .mouse-on-gounbind:hover {
        color: #2d63bc;
        text-decoration: underline;
    }
</style>

