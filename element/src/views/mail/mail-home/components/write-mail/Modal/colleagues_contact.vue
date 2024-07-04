<template>
    <Form :model="contactsFormForShow" class="colleagues-contact contacts_content_conatiner">
        <Row :gutter="40" style="margin: 0;">
            <Col :span="13" style="padding:0;">
                <FormItem :label="$t('mail.writeLetter.addContactModal.name')">
                    <Input :disabled="filtering" v-model="contactsFormForShow.name"
                        :placeholder="$t('mail.writeLetter.addContactModal.enterKeywordTip')">
                    </Input>
                </FormItem>
            </Col>
            <Col :span="11" style="padding:0;">
                <FormItem :label="$t('mail.writeLetter.addContactModal.email')">
                    <Input :disabled="filtering" v-model="contactsFormForShow.email"
                        :placeholder="$t('mail.writeLetter.addContactModal.enterKeywordTip')">
                    </Input>
                </FormItem>
            </Col>
        </Row>
        <Row :gutter="40" style="margin: 0;">
            <Col :span="13" style="padding:0;">
                <FormItem :label="$t('mail.writeLetter.addContactModal.department')">
                    <Select v-model="contactsFormForShow.department" filterable clearable :disabled="filtering" size="small">
                        <Option v-for="(item,index) in all_department"
                            :value="item.value"
                            :label="item.label"
                            :key="item.value+item.label"
                            :style="{paddingLeft:item.hierarchy}"
                            :class="item.hierarchyName"
                            class="depart"
                            >
                        </Option>
                    </Select>
                </FormItem>
            </Col>
        </Row>
        <FormItem>
            <Button @click="searchContact" type="success" :loading="searchLoading" class="piwik_colleagues_contact_search_btn">{{$t('mail.writeLetter.addContactModal.filter')}}</Button>
            <Button @click="handleClearFilter" type="minor">{{$t('filter_box.empty')}}</Button>
        </FormItem>
    </Form>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    export default {
        name: 'colleagues_contact',
        props: {
            currentPage: {
                type: Number,
                default: 1
            },
            isReset: {
                type: Boolean,
                default: false
            },
            changePageOperate: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                filtering: false,
                contactsFormForShow: {
                    name: '',
                    email: '',
                    department: ''
                },
                contactsFormForSearch: {
                    name: '',
                    email: '',
                    department: ''
                },
                organization_structure: [
                    {
                        title: '',
                        expand: true,
                        id: 0,
                        num: null,
                        selected: true,
                        hierarchy: 0,
                        children: []
                    }
                ],
                department: '',
                all_department: [],
                contactList: [],
                withSearch: false,
                searchLoading: false,
                isClosePoptip: true // 是否需要关闭搜索弹窗
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId
            })
        },
        methods: {
            // 部门树初始化
            set_tree() {
                util.ajax({
                    url: '/new-privilege/department/getPureDepartmentTree',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const arr = response.data.data.list;
                        let val;
                        val = this.get_tree(arr);
                        const arr1 = this.set_tree_children(val);
                        this.organization_structure[0].children = [];
                        for (let i = 0; i < arr1.length; i++) {
                            this.organization_structure[0].children.push(arr1[i]);
                        }
                        this.organization_structure[0].title = response.data.data.orgName;

                        this.company_name = response.data.data.orgName;
                        if (this.selected_department_name === '') {
                            this.selected_department_name = response.data.data.orgName;
                        }
                        this.organization_structure[0].num = response.data.data.companyUserCount;
                        this.get_department = [];
                        this.get_department = this.get_all_department(this.organization_structure[0].children);
                        this.all_department = this.get_department.map(item => {
                            const obj = {};
                            obj.label = item.label;
                            obj.value = item.value;
                            obj.selected = item.selected;
                            obj.hierarchy = `${item.hierarchy * 20 + 15}px`;
                            obj.hierarchyName = `depart${item.hierarchy}`;
                            return obj;
                        });
                        if (JSON.stringify(this.tree_expand) == '{}') {
                            for (let i = 0; i < this.get_department.length; i++) {
                                this.tree_expand[this.get_department[i].label] = false;
                            }
                        }
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.departmentErr'));
                        this.organization_structure = [];
                    }
                });
            },
            // 部门树遍历 处理
            get_tree(arr) {
                const temp = {};
                const tree = {};
                for (const i in arr) {
                    temp[arr[i].id] = arr[i];
                }
                for (const i in temp) {
                    if (temp[i].parentId) {
                        if (!temp[temp[i].parentId].children) {
                            temp[temp[i].parentId].children = new Object();
                        }
                        temp[temp[i].parentId].children[temp[i].id] = temp[i];
                    } else {
                        tree[temp[i].id] = temp[i];
                    }
                }
                return tree;
            },
            // 遍历部门树的子节点
            set_tree_children(val) {
                const arr = [];
                let arr1 = [];

                for (const i in val) {
                    let arr2 = [];

                    arr2 = this.build_tree(val[i], 0);
                    arr.push(arr2[0]);
                }
                arr1 = this.sort_tree(arr);
                return arr1;
            },
            // 部门树按照sortNo排序
            sort_tree(val) {
                for (let i = 0; i < val.length; i++) {
                    if (val[i].children) {
                        val[i].children = this.sort_tree(val[i].children);
                    }
                }
                val = val.sort(this.compare('sortNo'));
                return val;
            },
            // 按照键值排序
            compare(property) {
                return function(a, b) {
                    const value1 = a[property];
                    const value2 = b[property];
                    return value1 - value2;
                };
            },
            // 公司部门处理
            build_tree(val, hierarchy, obj = {}) {
                hierarchy++;
                // let sel = this.selected_department_id === val.id ? true : false
                const arr = [];
                obj.title = val.name;
                obj.id = val.id;
                obj.sortNo = val.sortNo;
                obj.parentId = val.parentId;
                // obj.remark = val.remark
                obj.num = val.personCount;
                // obj.expand = this.tree_expand[val.name]
                // obj.selected = sel
                obj.children = [];
                obj.hierarchy = hierarchy;
                arr.push(obj);
                const hiera = obj.hierarchy;
                if (val.children) {
                    for (const i in val.children) {
                        obj.children.push(this.build_tree(val.children[i], hiera)[0]);
                    }
                }
                return arr;
            },
            // 获取所有部门
            get_all_department(val, arr = []) {
                for (let i = 0; i < val.length; i++) {
                    const obj = {};
                    obj.value = val[i].id;
                    obj.label = val[i].title;
                    obj.selected = val[i].selected;
                    obj.hierarchy = val[i].hierarchy;
                    arr.push(obj);
                    if (val[i].children.length !== 0) {
                        this.get_all_department(val[i].children, arr);
                    }
                }
                this.all_department = arr;
                return arr;
            },
            /** 搜索 */
            searchContact() {
                this.$emit('isFiltering', false);
                if (this.isClosePoptip) {
                    this.filtering = true;
                    this.searchLoading = true;
                }
                this.contactsFormForSearch = this.$deepClone(this.contactsFormForShow);
                if (this.currentPage === 1) {
                    this.getUserDataTables();
                } else {
                    this.$emit('isSearch', true);
                }
            },
            /** 获取列表 */
            getUserDataTables(callBackType) {
                this.contactList = [];
                const jsonData = {
                    pageNo: this.currentPage,
                    pageSize: 20,
                    orgId: this.enterpriseId,
                    isDelete: 0,
                    fullname: this.contactsFormForSearch.name,
                    email: this.contactsFormForSearch.email,
                    departmentId: this.contactsFormForSearch.department,
                };
                this.$emit('update:changePageOperate', false);
                util.ajaxJson({
                    url: 'new-privilege/user/getCorporateColleagues',
                    method: 'post',
                    data: jsonData
                }).then(response => {
                    this.filtering = false;
                    this.$emit('isFiltering', false);
                    this.searchLoading = false;
                    if (response.data.code === '1') {
                        if (response.data.data.list.length > 0) {
                            const dataList = response.data.data.list;
                            for (const item of dataList) {
                                const temp = item.email.substring(0, item.email.lastIndexOf('@'));
                                this.contactList.push({
                                    receiverName: item.fullname ? item.fullname : temp,
                                    receiveMailAddress: item.email,
                                    enterpriseName: item.departmentName ? item.departmentName : '--',
                                    checked: false
                                });
                            }
                        } else {
                            this.contactList = [];
                        }
                        this.$emit('getContactList', this.contactList);
                        this.$emit('getTotalCount', response.data.data.total);
                        if (this.isClosePoptip) {
                            this.$emit('closeFilterPoptip', true);
                        }
                        this.isClosePoptip = true;
                    } else {
                        this.isClosePoptip = true;
                        this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                    }
                });
            },
            /* 清空筛选条件 */
            handleClearFilter() {
                this.contactsFormForShow = this.contactsFormForSearch = {
                    name: '',
                    email: '',
                    department: ''
                };
                this.isClosePoptip = false;
                this.$emit('update:changePageOperate', false);
                if (this.currentPage !== 1) {
                    this.$emit('isSearch');
                } else {
                    this.searchContact();
                }
            }
        },
        created() {
            this.isClosePoptip = false;
            this.set_tree();
            this.getUserDataTables();
        },
        watch: {
            currentPage: {
                handler(val) {
                    console.log('currentPage变化了-------', val, this.changePageOperate);
                    if (val === 1 && !this.changePageOperate) {
                        this.searchContact();
                    } else {
                        this.getUserDataTables();
                    }
                }
            },
            isReset(val) {
                if (val === true) {
                    // this.contactsForm = {
                    //     name: '',
                    //     email: '',
                    //     department: ''
                    // };
                    this.handleClearFilter();
                }
            }
        }
    };
</script>
<style lang="less" scoped>
    .colleagues-contact {
        padding: 0 20px;
        /deep/ .el-form-item__content {
        font-size: 12px;
        .el-input {
            font-size: 12px;
            width: 232px;
        }
        .el-select {
            font-size: 12px;
            width: 232px;
            .el-input {
                width: 100%;
            }
        }
    }
        /deep/ .el-form-item__label {
            font-size: 12px;
            line-height: 25px;
            margin-top: 7px;
            padding-right: 0;
            text-align: left;
        }
        /deep/ .el-button--success {
            float: right;
            font-size: 12px;
            height: 33px;
            line-height: 30px;
            padding-bottom: 0;
            padding-top: 0;
            color: #fff;
            background-color: #7b98b6;
            border-color: #7b98b6;
            &:hover {
                background-color: #95adc5;
                border-color: #95adc5;
            }
        }
        /deep/ .el-button--minor {
            float: right;
            font-size: 12px;
            height: 33px;
            line-height: 30px;
            padding-bottom: 0;
            padding-top: 0;
            margin-right: 10px;
        }
    }
  .depart{position: relative;}
  .depart::after{content: "";display: block;border-top:2px dotted #ccc;height: 0;width: 20px;position: absolute;left: 10px;top: 15px;}
  .depart::before{content: "";display: block;border-left:2px dotted #ccc;height: 30px;width: 0px;position: absolute;left: 10px;top: 0px;}
  .depart1::after{width: 20px}
  .depart2::after{width: 40px}
  .depart3::after{width: 60px}
  .depart4::after{width: 80px}
  .depart5::after{width: 100px}
  .depart6::after{width: 120px}
  .depart7::after{width: 140px}
  .depart8::after{width: 160px}
  .depart9::after{width: 180px}
  .depart10::after{width: 200px}
  .depart:first-child::before{height: 15px;top: 15px;}
  .depart:last-child::before{height: 15px;}
</style>
