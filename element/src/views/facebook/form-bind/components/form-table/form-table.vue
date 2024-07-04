<style lang="less" scoped>
    @import url(./form-table.less);
</style>
<style lang="less">
    // .form-table {
    //     .ivu-poptip-title {
    //         &:after {
    //             display: none;
    //         }
    //     }
    // }
</style>

<template>
    <div class="container">
        <div class="annotation">
            <span>{{['12200'].includes(enterpriseId) ? $t('facebook.bindForm.table_tip12200') : $t('facebook.bindForm.table_tip')}}</span>
            <Button v-if="isShowBtn" type="primary" @click="syncForms" :loading="syncFormsButtonStatus">{{syncFormsButtonContent}}</Button>
        </div>
        <Poptip class="form-table" placement="bottom-end" width="460">
            <div slot="content">
                <Tabs v-model="selected_filter_tab" class="full-tab">
                    <TabPane :label="$t('crm.Table.search')" name="search"></TabPane>
                    <!-- <TabPane :label="$t('crm.Table.searchCommon')" name="searchCommon"></TabPane> -->
                </Tabs>
                <div v-show="selected_filter_tab === 'search'">
                    <div style="margin-bottom: 15px;text-align:left;">
                        <div class="filter-tips">{{$t('filter_box.tip_customSearch')}}</div>
                        <Input v-model="searchName" :placeholder="$t('filter_box.tip_customSearch')"
                               style="width: 390px"></Input>
                    </div>
                    <div style="text-align:left;">
                        <div class="filter-tips">
                            {{$t('filter_box.filter_con')}}
                        </div>
                        <div>
                            <Select v-model="condition1" class="formitem-select1" size="small"
                                    @on-change="changeCon1()">
                                <Option v-for="(item,index) in conditionList1" :key="index" :label="item.label"
                                        :value="item.value"></Option>
                            </Select>
                            <Select v-model="condition2" class="formitem-select2" size="small">
                                <Option v-for="(item, index) in conditionList2" :value="item.value" :label="item.label"
                                        :key="index"></Option>
                            </Select>
                            <div style="margin-bottom:10px;">
                                <Input v-model="condition3" v-if="inputType === 'string'" size="small"
                                       :placeholder="$t('filter_box.add_keywords')" class="condition3"></Input>
                                <InputNumber v-model="condition3" v-if="inputType === 'number'" size="small"
                                             :placeholder="$t('filter_box.enter_number')"
                                             class="condition3"></InputNumber>
                                <DatePicker :options="options" v-model="condition3" v-if="inputType === 'date'"
                                            type='daterange' placement="bottom-end"
                                            :placeholder="$t('filter_box.select_time')" size="small"
                                            class="condition3"></DatePicker>
                                <Select v-model="condition3" v-if="inputType === 'select'" class="condition3"
                                        size="small">
                                    <Option v-for="(item,index) in conditionList3" :key="index" :label="item.label"
                                            :value="item.value"></Option>
                                </Select>
                                <span @click="addConditionHandle()">
                    <Icon  size="15" class="custom custom-add-circle"
                        style='cursor:pointer;display:inline-block;'></Icon>
                </span>
                            </div>
                        </div>
                        <div class="conditionwrap">
                            <div v-for="(add,index) in addcondition" :key="index">
                                <Select v-model="add.condition1" class="formitem-select1" size="small"
                                        @on-change="addChangeCon1(index)">
                                    <Option v-for="(item,index) in add.conditionList1" :key="index" :label="item.label"
                                            :value="item.value"></Option>
                                </Select>
                                <Select v-model="add.condition2" class="formitem-select2" size="small">
                                    <Option v-for="(item, index) in add.conditionList2" :key="index" :label="item.label"
                                            :value="item.value"></Option>
                                </Select>
                                <div style="margin-bottom:10px;">
                                    <Input v-model="add.condition3" v-if="add.inputType === 'string'" size="small"
                                           :placeholder="$t('filter_box.add_keywords')" class="condition3"></Input>
                                    <InputNumber v-model="add.condition3" v-if="add.inputType === 'number'" size="small"
                                                 :placeholder="$t('filter_box.enter_number')"
                                                 class="condition3"></InputNumber>
                                    <DatePicker :options="options" v-model="add.condition3"
                                                v-if="add.inputType === 'date'" type='daterange' placement="bottom-end"
                                                :placeholder="$t('filter_box.select_time')" size="small"
                                                class="condition3"></DatePicker>
                                    <Icon  size="15" class="custom custom-reduce-circle"
                                          style='cursor:pointer;display:inline-block;'
                                          @click.native="removeclick(index)"></Icon>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="actionButtons">
                        <Button type="primary" ghost size="small" style="float:right;" @click="empty">
                            {{$t('filter_box.empty')}}
                        </Button>
                        <Button type="primary" size="small" style="margin-right:5px;float:right;"
                                @click="searchByConditions">{{$t('filter_box.filter')}}
                        </Button>
                        <!-- <Button type="primary" size="small" style="margin-right:5px;float:right;" @click="saveSearch">
                            {{$t('filter_box.save_common')}}
                        </Button> -->
                    </div>
                </div>
                <!-- <div v-show="selected_filter_tab === 'searchCommon'" style="overflow:hidden">
                    <p class="filter-tips">{{$t('filter_box.common_filter')}}</p>
                    <ul class="commentwrap">
                        <template v-if="facebookFormSearch.length">
                            <li class="eachlist" v-for="(item,index) in facebookFormSearch" :key="index"
                                :style="isSearching==index?'color:#fda359':''" @click="searchComment(index)">
                                <span class="listtitle" v-html="item.name"></span>
                                <span class="removelist" @click.stop="removeList(index)">×</span>
                            </li>
                        </template>
                        <template v-else>
                            <li>{{$t('facebook.bindForm.no_common')}}</li>
                        </template>
                    </ul>
                    <div class="actionButtons">
                        <Button size="small" class="empty" @click="empty">{{$t('filter_box.empty')}}</Button>
                    </div>
                </div> -->
            </div>
        </Poptip>
        <!-- 表格区域 -->
        <div class="table">
            <Table
                    :height="table_height"
                    v-loading="loading"
                    highlight-current-row
                    @row-click="clickRow"
                    :data="currentTableData"
                    :row-class-name="tableRowClassName"
                    class="tabmain noBoxShadow-right noborder-table"
            >
                <TableColumn :label="$t('facebook.bindForm.index') " type="index" prop="index" width="100"></TableColumn>
                <TableColumn :label="$t('facebook.bindForm.brand_page') " prop="brandMajorName"></TableColumn>
                <TableColumn :label="$t('facebook.pageType') " prop="homePageType">
                    <template slot-scope="scope">
                        <div>{{scope.row.homePageType === 1 ? $t('facebook.companyPage') : $t('facebook.myPage')}}</div>
                    </template>
                </TableColumn>
                <TableColumn :label="$t('facebook.bindForm.form_name') " prop="formName" width="200"></TableColumn>
                <TableColumn :label="$t('facebook.bindForm.customer') " prop="leadsCount" sortable></TableColumn>
                <TableColumn :label="$t('facebook.bindForm.create_time') " prop="formCreateTime" width="170"></TableColumn>
                <TableColumn :label="$t('facebook.bindForm.status') " prop="formUseState"></TableColumn>
                <TableColumn :label="$t('facebook.bindForm.operate') " prop="operate" class-name="demo-table-info-column">
                    <template slot-scope="scope">
                        <div v-if="scope.row.bindingFlag">
                            <div>{{scope.row.homePageType === 1 && !canUnBindCompanyLeads ===true ? '/':'已绑定'}}</div>
                        </div>
                        <div v-else>
                            <div>{{scope.row.homePageType === 1 && !canBindCompanyLeads ===true ? '/':'未绑定'}}</div>
                        </div>
                    </template>
                </TableColumn>
            </Table>
        </div>
        <div class="page">
            <Page
                    :total="totalpage"
                    @size-change="changePageSize"
                    @current-change="changePage"
                    layout="total, sizes, prev, pager, next, jumper"></Page>
        </div>
        <!-- 解除绑定提示框 -->
        <Modal :visible.sync="unbind" :modal-append-to-body="false" :title="$t('facebook.bindForm.unbind')">
            <div>
                {{$t('facebook.bindForm.sure_bind')}}【{{formName}}】？<br/>
                {{$t('facebook.bindForm.unbind_tip')}}
            </div>
            <Button slot="footer" class="dialog-footer">
                <Button @click="unbind = false">{{$t('cancel')}}</Button>
                <Button type="primary" @click="unbindForm">{{$t('confirm')}}</Button>
            </Button>
        </Modal>
        <leadsbindDetail
                :isShowDetail.sync="isShowDetail"
                :rowInfo="rowInfo"
                :facebookLeadsFormObj="facebookLeadsFormObj"
                v-on="$listeners"
                v-bind="$attrs"
                @refrashTable="refrashTable"
                @editData="editData"
                @unbindData="unbindData"
        ></leadsbindDetail>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import util from '@/libs/util';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import leadsbindDetail from '../leadsbindDetail/leadsbindDetail';
    import { accountBinding } from '@/api/facebook/index';
    const { getFacebookBindList } = accountBinding;


    export default {
        name: 'FormTable',
        components: { leadsbindDetail },
        data() {
            // 不能用push,会重复添加
            return {
                isShowBtn: false, // 是否显示同步按钮的阈值
                syncFormsButtonStatus: false, // 同步表单按钮状态
                syncFormsButtonContent: this.$t('facebook.bindForm.syncForms'), // 同步表单按钮的显示文本
                currentIndex: 0,
                inheritAttrs: false,
                facebookLeadsFormObj: {},
                totalpage: 0,
                currentTableData: [],
                loading: true,
                rowInfo: {},
                isShowDetail: false,
                /* 第一个选择器选项 */
                conditionList1: [
                    {
                        value: this.$t('facebook.bindForm.brand_page'),
                        label: this.$t('facebook.bindForm.brand_page'),
                        type: 'input'
                    },
                    {
                        value: this.$t('facebook.bindForm.form_name'),
                        label: this.$t('facebook.bindForm.form_name'),
                        type: 'input'
                    },
                    {
                        value: this.$t('facebook.bindForm.customer'),
                        label: this.$t('facebook.bindForm.customer'),
                        type: 'input'
                    },
                    {
                        value: this.$t('facebook.bindForm.create_time'),
                        label: this.$t('facebook.bindForm.create_time'),
                        type: 'input'
                    },
                    {
                        value: this.$t('facebook.bindForm.status'),
                        label: this.$t('facebook.bindForm.status'),
                        type: 'input'
                    }
                ],
                /* 第二个选择器选项 */
                conditionList2: [
                    { value: this.$t('filter_box.equal'), label: this.$t('filter_box.equal'), id: 1, type: 'input' },
                    { value: this.$t('filter_box.unequal'), label: this.$t('filter_box.unequal'), id: 2, type: 'input' },
                    { value: this.$t('filter_box.contain'), label: this.$t('filter_box.contain'), id: 3, type: 'input' },
                    {
                        value: this.$t('filter_box.not_contain'),
                        label: this.$t('filter_box.not_contain'),
                        id: 4,
                        type: 'input'
                    }
                ],
                options: {
                    shortcuts: [
                        {
                            text: this.$t('datepicker.today'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.yesterday'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24);
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.tswk'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                let dayNo = start.getDay();
                                dayNo = dayNo ? dayNo - 1 : 6;
                                start.setTime(start.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.ltwk'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                let dayNo = start.getDay();
                                dayNo = dayNo || 7;
                                end.setTime(end.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                start.setTime(end.getTime() - 6 * 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.tsmt'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(new Date(start.getFullYear(), start.getMonth(), 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.ltmt'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() -
                                    24 * 60 * 60 * 1000);
                                start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        }
                    ],
                    disabledDate(date) {
                        return date.valueOf() > Date.now();
                    }
                },
                /* tableHeight: window.screen.height - 345, */
                // 展示表格表头
                pageNo: 1, // 当前页数
                pageSize: 10, // 每
                filterListShow: false,
                inputType: 'string',
                condition1: '',
                condition2: '',
                condition3: '',
                conditionList3: [],
                addcondition: [],
                searchItems: [],
                filtershow: false /* 筛选面板是否显示 */,
                filtering: false /* 是否在筛选 */,
                searchName: '' /* 检索名称 */,
                selected_filter_tab: 'search',
                facebookFormSearch: [] /* 常用检索列表 */,
                isSearching: null,
                unbind: false,
                formIndex: '',
                formName: ''
            };
        },
        computed: {
            ...mapGetters(['filterTable']),
            ...mapState({
                userId: state => state.userId,
                userName: state => state.userName,
                enterpriseId: state => state.enterpriseId,
                window_height: 'window_height',
                isFbService: state => state.isFbService,
                button_list: state => state.app.button_list
            }),
            canBindCompanyLeads() {
                return !HANDLE_BUTTON(BUTTON_IDS.systemSetting.facebookSetting.form.bindCompanyLeads, this.button_list);
            },
            canUnBindCompanyLeads() {
                return !HANDLE_BUTTON(BUTTON_IDS.systemSetting.facebookSetting.form.unBindCompanyLeads, this.button_list);
            },
            tableData() {
                return this.$store.state.facebook.tableDataGone;
            },
            currentTable() {
                return this.tableData.slice((this.pageNo - 1) * this.pageSize, this.pageNo * this.pageSize);
            },
            // loading(){
            //   return this.$store.state.facebook.loading
            // },
            table_height() {
                let temp = this.window_height ? this.window_height - 236 : document.body.clientHeight - 236;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            }
        },
        created() {
            // 是否绑定facebook
            this.isBindFacebook();
            // this.getTableData()
            // this.getCommonSearch();
            this.getData();
        },
        methods: {
            // 是否绑定了facebook
            isBindFacebook() {
                getFacebookBindList({
                    userId: this.userId,
                    providerId: 'facebook',
                    orgId: this.enterpriseId
                }).then(response => {
                    if (response.code === '1') {
                        this.isShowBtn = true;
                    } else {
                        this.isShowBtn = false;
                    }
                    console.error(response);
                }).catch(error => {
                    console.error(error);
                    this.isShowBtn = false;
                });
            },
            // 同步表单方法
            syncForms() {
                this.syncFormsButtonStatus = true;
                // 同步按钮显示 同步中...
                this.syncFormsButtonContent = this.$t('facebook.bindForm.synchronizing');

                util.ajaxInternationalJson({
                    url: '/social/form/syncFaceForm',
                    method: 'get',
                    params: {
                        userId: this.userId,
                        providerId: 'facebook'
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        // 同步成功,提示“同步成功”。
                        this.$Message.success({
                            message: this.$t('facebook.bindForm.syncSucceeded'),
                            duration: 5000,
                            showClose: true
                        });
                    } else {
                        // 同步失败,提示同步失败给出失败原因。
                        this.$Message.error(response.data.message);
                    }
                    this.syncFormsButtonStatus = false;
                    // 同步按钮显示'同步表单'
                    this.syncFormsButtonContent = this.$t('facebook.bindForm.syncForms');
                }).catch(error => {
                    this.syncFormsButtonStatus = false;
                    // 同步失败
                    this.$Message.error(this.$t('facebook.bindForm.syncFailed'));
                    // 同步按钮显示'同步表单'
                    this.syncFormsButtonContent = this.$t('facebook.bindForm.syncForms');
                    console.error(error);
                });
            },
            unbindData() {
                this.getFacebookFormById(this.currentIndex);
                this.currentTableData[this.currentIndex].bindingFlag = 0;
            },
            editData() {
                this.getFacebookFormById(this.currentIndex);
            },
            refrashTable() {
                // this.getData();
                this.currentTableData[this.currentIndex].bindingFlag = 1;
                this.getFacebookFormById(this.currentIndex);
            },
            getData() {
                util.ajaxInternationalJson({
                    url: '/social/form/getFaceForms2',
                    method: 'post',
                    data: {
                        orderColumn: '',
                        orderType: 'desc',
                        homePageType: 2, // 0-个人主页，1-公司主页，2-全部
                        query: '',
                        pageNo: this.pageNo,
                        pageSize: this.pageSize,
                        startDate: '',
                        endDate: '',
                        providerId: 'facebook',
                        userId: this.userId,
                        orgId: this.enterpriseId
                    }
                })
                    .then(response => {
                        this.loading = false;
                        if (response.data.code === '1') {
                            // let result = response.data.data;
                            this.currentTableData = response.data.data.data;
                            this.totalpage = response.data.data.totalCount;
                        }
                    });
            },
            tableRowClassName({ row, rowIndex }) {
                // 把每一行的索引放进row
                row.index = rowIndex;
            },
            clickRow(data, index) {
                this.rowInfo = data;
                this.currentIndex = data.index;
                this.getFacebookFormById(data.index);
                const event = window.event || { target: {} };
                const explorer = window.navigator.userAgent;
                let selecter = '';
                if (explorer.indexOf('MSIE') >= 0 || explorer.indexOf('Opera') >= 0) {
                    const selected = document.selection.createRange();
                    selecter = selected.text;
                } else {
                    selecter = window.getSelection();
                }
                if (selecter.type === 'Range') {
                    return;
                }
                if (event.target.className === 'ivu-select-placeholder' ||
                    event.target.className === 'ivu-select-selected-value' ||
                    event.target.className === 'ivu-input' ||
                    event.target.className === 'copy' ||
                    event.target.className === 'ivu-icon ivu-icon-compose' ||
                    event.target.nodeName === 'A' ||
                    event.target.className === 'ivu-icon ivu-icon-edit' ||
                    event.target.className === 'ivu-btn ivu-btn-small ivu-btn-icon-only' ||
                    event.target.className === 'ivu-icon ivu-icon-ios-minus-outline' ||
                    event.target.className === 'ivu-icon ivu-icon-android-checkbox-outline' ||
                    event.target.className === 'ivu-icon ivu-icon-forward' ||
                    event.target.className === 'ivu-icon ivu-icon-checkmark'
                ) {
                    return;
                }
                this.isShowDetail = true;
            },
            /** 通过表单id获取表单字段 */
            getFacebookFormById(index) {
                util.ajaxInternationalJson({
                    url: '/social/form/getQuestion',
                    method: 'get',
                    params: {
                        userId: this.currentTableData[index].userId,
                        providerId: 'facebook',
                        id: this.currentTableData[index].id
                    }
                })
                    .then(response => {
                        if (response.data.code === '1') {
                            let flag = true;
                            if (response.data.data) {
                                flag = false;
                            }
                            if (flag) { /* 是个空对象 */
                                // this.$Message.error(this.$t('facebook.bindForm.no_leads'));
                                this.$Message({
                                    message: this.$t('facebook.bindForm.bind_again'),
                                    type: 'error',
                                    duration: 10000,
                                    showClose: true
                                });
                            }
                            this.facebookLeadsFormObj = response.data.data;
                            // state.facebookForm = response.data.data;
                        }
                    });
            },
            /* 字段条件组合 */
            conditionGroup(con1, con2, con3) {
                if (!con1 || con3 === '' || con3 === undefined) {
                    this.$Message.warning(this.$t('facebook.bindForm.field_bug') + this.$t('facebook.bindForm.add_con'));
                    this.searchItems = [];
                } else {
                    switch (con1) {
                        case this.$t('facebook.bindForm.brand_page'):
                            return this.keysearch('brandMajorName', con2, con3);
                            break;
                        case this.$t('facebook.bindForm.form_name'):
                            return this.keysearch('formName', con2, con3);
                            break;
                        case this.$t('facebook.bindForm.customer'):
                            return this.numSearch('leadsCount', con2, con3);
                            break;
                        case this.$t('facebook.bindForm.create_time'):
                            return this.timesearch('formCreateTime', con2, con3);
                            break;
                        case this.$t('facebook.bindForm.status'):
                            return this.keysearch('formUseState', con2, con3);
                            break;
                        default:
                            break;
                    }
                }
            },
            /* 对比条件是字符串 */
            keysearch(key, con2, con3) {
                switch (con2) {
                    case this.$t('filter_box.contain'):
                        return {
                            name: key,
                            operate: 'like',
                            type: '1',
                            value: con3.trim()
                        };
                        break;
                    case this.$t('filter_box.equal'):
                        return {
                            name: key,
                            operate: '=',
                            type: '1',
                            value: con3
                        };
                        break;
                    default:
                        break;
                }
            },
            /* 对比条件是时间 */
            timesearch(key, con2, con3) {
                return {
                    name: key,
                    type: '3',
                    dateRange: con3
                };
            },
            /* 对比条件是数字 */
            numSearch(key, con2, con3) {
                switch (con2) {
                    case this.$t('filter_box.lt'):
                        return {
                            name: key,
                            operate: '<',
                            type: '2',
                            value: con3
                        };
                        break;
                    case this.$t('filter_box.lte'):
                        return {
                            name: key,
                            operate: '<=',
                            type: '2',
                            value: con3
                        };
                        break;
                    case this.$t('filter_box.equal'):
                        return {
                            name: key,
                            operate: '=',
                            type: '2',
                            value: con3
                        };
                        break;
                    case this.$t('filter_box.gte'):
                        return {
                            name: key,
                            operate: '>=',
                            type: '2',
                            value: con3
                        };
                        break;
                    case this.$t('filter_box.gt'):
                        return {
                            name: key,
                            operate: '>',
                            type: '2',
                            value: con3
                        };
                        break;
                    default:
                        break;
                }
            },
            changeCon1() {
                console.log('changecon1', this.condition1);
                switch (this.condition1) {
                    // 数字
                    case this.$t('facebook.bindForm.customer'):
                        this.conditionList2 = [
                            {
                                value: this.$t('filter_box.lte'),
                                label: this.$t('filter_box.lte')
                            },
                            {
                                value: this.$t('filter_box.gte'),
                                label: this.$t('filter_box.gte')
                            }
                        ];
                        this.inputType = 'number';
                        this.condition2 = this.conditionList2[0].value;
                        break;
                    // 时间类
                    case this.$t('facebook.bindForm.create_time'):
                        this.conditionList2 = [
                            {
                                value: this.$t('filter_box.equal'),
                                label: this.$t('filter_box.equal')
                            }
                        ];
                        this.inputType = 'date';
                        this.condition2 = this.conditionList2[0].value;
                        break;
                    // 字符串
                    case this.$t('facebook.bindForm.brand_page'):
                    case this.$t('facebook.bindForm.form_name'):
                    case this.$t('facebook.bindForm.status'):
                        this.conditionList2 = [
                            {
                                value: this.$t('filter_box.contain'),
                                label: this.$t('filter_box.contain')
                            }
                        ];
                        this.condition2 = this.conditionList2[0].value;
                        this.inputType = 'string';
                    default:
                        break;
                }
                if (this.inputType === 'number') {
                    this.condition3 = 0;
                } else {
                    this.condition3 = '';
                }
            },
            /* 通用设置查询 */
            getCommonSearch() {
                const arr = localStorage.getItem('facebookFormSearch');
                if (arr) {
                    this.facebookFormSearch = JSON.parse(arr);
                }
            },
            unbindForm() {
                // console.log(this.enterpriseId)
                const params = {
                    orgId: this.enterpriseId,
                    // userId: this.userId,
                    userId: this.currentTable[this.formIndex].userId,
                    providerId: 'facebook',
                    id: this.currentTable[this.formIndex].id,
                    facebookFormId: this.currentTable[this.formIndex].facebookFormId
                };
                /* 更新数据绑定状态 */
                util.ajaxInternational({
                    url: '/social/form/updateBind',
                    method: 'post',
                    params
                }).then((res) => {
                    if (res.data.code === '1') {
                        this.saveLog(JSON.stringify(params));
                        this.$Message.success(this.$t('facebook.bindForm.unbind_success'));
                        this.unbind = false;
                        this.currentTable[this.formIndex].bindingFlag = 0;
                    }
                });
            },
            // 保存操作日志
            saveLog(content) {
                util.ajaxInternational({
                    url: '/social/operateLog/saveOperateLog',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        content,
                        operateUserId: this.userId,
                        operateUser: this.userName
                    }
                });
            },
            /* 翻页 */
            changePage(index) {
                console.log(index, '翻页。。');
                this.pageNo = index;
                this.loading = true;
                this.getData();
            },
            /* 切换单页数据条数 */
            changePageSize(size) {
                this.pageSize = size;
                this.loading = true;
                this.getData();
            },
            /* 选择筛选条件第一个字段时判断第二个选择框的内容 */
            addChangeCon1(index) {
                switch (this.addcondition[index].condition1) {
                    // 数字
                    case this.$t('facebook.bindForm.customer'):
                        this.addcondition[index].conditionList2 = [
                            {
                                value: this.$t('filter_box.lte'),
                                label: this.$t('filter_box.lte')
                            },
                            {
                                value: this.$t('filter_box.gte'),
                                label: this.$t('filter_box.gte')
                            }
                        ];
                        this.addcondition[index].condition2 = this.addcondition[index].conditionList2[0].value;
                        this.addcondition[index].inputType = 'number';
                        break;
                    // 时间类
                    case this.$t('facebook.bindForm.create_time'):
                        this.addcondition[index].conditionList2 = [
                            {
                                value: this.$t('filter_box.equal'),
                                label: this.$t('filter_box.equal')
                            }
                        ];
                        this.addcondition[index].condition2 = this.addcondition[index].conditionList2[0].value;
                        this.addcondition[index].inputType = 'date';
                        break;
                    // 字符串
                    case this.$t('facebook.bindForm.brand_page'):
                    case this.$t('facebook.bindForm.form_name'):
                    case this.$t('facebook.bindForm.status'):
                        this.addcondition[index].conditionList2 = [
                            {
                                value: this.$t('filter_box.contain'),
                                label: this.$t('filter_box.contain')
                            }
                        ];
                        this.addcondition[index].condition2 = this.addcondition[index].conditionList2[0].value;
                        this.addcondition[index].inputType = 'string';
                    default:
                        break;
                }
                if (this.addcondition[index].inputType === 'number') {
                    this.addcondition[index].condition3 = 0;
                } else {
                    this.addcondition[index].condition3 = '';
                }
            },
            /* 增加检索条件 */
            addConditionHandle() {
                this.addcondition.push({
                    inputType: 'string',
                    condition1: '',
                    conditionList1: this.conditionList1,
                    condition2: '',
                    conditionList2: this.conditionList2,
                    condition3: ''
                });
            },
            /* 减少检索条件 */
            removeclick(index) {
                this.addcondition.splice(index, 1);
            },
            /* 删除常用检索 */
            removeList(index) {
                this.facebookFormSearch.splice(index, 1);
                localStorage.setItem('facebookFormSearch', JSON.stringify(this.facebookFormSearch));
            },
            /* 通过检索条件查询 */
            searchByConditions() {
                this.addSearchItems();
                console.log(this.searchItems);
                if (this.searchItems.length > 0) {
                    this.filterTable(this.searchItems);
                }
            },
            /* 清空所有检索条件 */
            empty() {
                this.inputType = 'string';
                this.condition1 = '';
                this.condition2 = '';
                this.condition3 = '';
                this.addcondition = [];
                this.filtering = false;
                this.isSearching = -1;
                this.searchName = '';
                this.filterTable([]);
            },
            /* 添加所有的检索条件 */
            addSearchItems() {
                this.searchItems = [];
                const condition = this.conditionGroup(this.condition1, this.condition2, this.condition3);
                if (condition) {
                    this.searchItems.push(condition);
                }
                // 添加 除第一条外额外的检索条件
                if (this.addcondition !== []) {
                    for (let i = 0; i < this.addcondition.length; i++) {
                        this.searchItems.push(this.conditionGroup(
                            this.addcondition[i].condition1,
                            this.addcondition[i].condition2,
                            this.addcondition[i].condition3
                        ));
                    }
                }
                if (this.searchItems.length === 0) {
                    return;
                }
                console.log(this.searchItems);
                const arr = this.searchItems.map(item => item.name);
                if (arr.length !== [...new Set(arr)].length) {
                    this.$Notice.warning({
                        title: this.$t('facebook.bindForm.search_repeat'),
                        desc: this.$t('facebook.bindForm.search_only')
                    });
                    this.searchItems = [];
                }
            },

            /* 保存为常用检索 */
            saveSearch() {
                const storage = window.localStorage;
                const arr = this.facebookFormSearch;
                const names = arr.map(item => item.name).join('');
                if (names.indexOf(this.searchName) > -1) {
                    this.$Notice.warning({
                        title: this.$t('facebook.bindForm.con_empty'),
                        desc: this.$t('facebook.bindForm.rename')
                    });
                } else {
                    this.addSearchItems();
                    console.log('searchItems', this.searchItems);
                    if (this.searchItems.length) {
                        arr.push({
                            name: this.searchName,
                            searchConditionItems: this.searchItems
                        });
                        storage.setItem('facebookFormSearch', JSON.stringify(arr));
                        this.$Notice.success({
                            title: this.$t('facebook.bindForm.save_success'),
                            desc: this.$t('facebook.bindForm.search_quickly')
                        });
                    }
                }
            },
            /* 通过常用检索查询 */
            searchComment(index) {
                this.isSearching = index;
                const searchItems = this.facebookFormSearch[index].searchConditionItems;
                this.filterTable(searchItems);
            },
            /* 通过日期条件检索列表数据 */
            filterTableByDate: (state) => ({ name, dateRange }) => {
                state.tableDataGone = state.tableDataGone.filter(item => {
                    dateRange[0] = new Date(dateRange[0]);
                    dateRange[0] = new Date(dateRange[0].toLocaleDateString());
                    dateRange[1] = new Date(dateRange[1]);
                    dateRange[1].setHours(24);
                    dateRange[1] = new Date(dateRange[1].toLocaleDateString());
                    const d = new Date(item[name]);
                    return d > dateRange[0] && d < dateRange[1];
                });
            },
            /* 通过数字检索列表数据 */
            filterTableByNumber: (state) => ({ name, value, operate }) => {
                state.tableDataGone = state.tableDataGone.filter(item => {
                    const n = item[name];
                    value = Number(value);
                    return operate === '>=' ? (n >= value) : (n <= value);
                });
            },
            /* 通过关键字检索列表数据（区分大小写英文） */
            filterTableByKeyword: (state) => ({ name, value }) => {
                state.tableDataGone = state.tableDataGone.filter(item => {
                    return item[name].indexOf(value) > -1;
                });
            }
        }
    };
</script>
