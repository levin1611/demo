<template>
  <Form
    label-width="90px"
    ref="update_form"
    style="margin-top: 12px; width: 400px"
    :model="contactsFormForShow"
    class="clue-contact"
  >
    <FormItem :label="$t('mailMarketing.emailAddress.keyword')">
      <Input
        :disabled="filtering"
        v-model="contactsFormForShow.keywords"
        :placeholder="$t('mail.writeLetter.addContactModal.clueSearchKey')"
      >
      </Input>
    </FormItem>
    <FormItem :label="$t('mailMarketing.emailAddress.creationTime')">
      <DatePicker
        :disabled="filtering"
        type="daterange"
        split-panels
        style="width: 450px"
        v-model="contactsFormForShow.createTime"
        placement="bottom-end"
        transfer
        :placeholder="$t('mail.writeLetter.addContactModal.selectDate')"
      >
      </DatePicker>
    </FormItem>

    <FormItem
      :label="$t('mailMarketing.emailAddress.creationMethod')"
      class="long-label-text"
    >
       <xhl-select
        v-model="contactsFormForShow.createWay"
        :followUpStatusData="createWayList"
        styleCustom="width:450px"
      ></xhl-select>
      <!-- <Select
        v-model="contactsFormForShow.createWay"
        :disabled="filtering"
        clearable
        size="small"
        style="width: 450px"
      >
        <Option
          v-for="(item, index) in createWayList"
          :value="item.value"
          :label="item.label"
          :key="index"
        >
        </Option>
      </Select> -->
    </FormItem>
    <FormItem :label="$t('mailMarketing.emailAddress.EntryStaff')">
      <Input
        :disabled="filtering"
        v-model="contactsFormForShow.inputer"
        :placeholder="$t('mail.writeLetter.addContactModal.addKeywordTip')"
      >
      </Input>
    </FormItem>
    <FormItem :label="$t('mailMarketing.emailAddress.salesRep')">
      <xhl-select
        v-model="contactsFormForShow.manager"
        :isSync="true"
        url="/new-privilege/user/getAllUsersIncludeLock"
        post-method="get"
        :multiple="true"
        :dataModel="{
          id: 'manageId',
          label: 'administrator',
        }"
        styleCustom="width:450px"
      ></xhl-select>
      <!-- <Select
        :multiple="true"
        v-model="contactsFormForShow.manager"
        :disabled="filtering"
        clearable
        placeholder="请选择"
        size="small"
        style="width: 450px"
      >
        <Option
          v-for="item in managerList"
          :value="item.manageId"
          :label="item.administrator"
          :key="item.manageId"
        >
        </Option>
      </Select> -->
    </FormItem>
    <FormItem :label="$t('mailMarketing.emailAddress.followUpStatus')">
      <xhl-select
        v-model="contactsFormForShow.status"
        :followUpStatusData="followUpStatus"
        styleCustom="width:450px"
      ></xhl-select>
      <!-- <Select
        v-model="contactsFormForShow.status"
        :disabled="filtering"
        clearable
        placeholder="请选择"
        size="small"
        style="width: 450px"
      >
        <Option
          v-for="item in followUpStatus"
          :value="item.value"
          :label="item.label"
          :key="item.value"
        >
        </Option>
      </Select> -->
    </FormItem>
    <!-- <FormItem>
            <Button @click="searchContact" type="success" :loading="searchLoading">{{$t('search')}}</Button>
            <Button @click="handleClearFilter" type="minor">{{$t('filter_box.empty')}}</Button>
        </FormItem> -->
  </Form>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    export default {
        name: 'clue_contact',
        props: {
            currentPage: {
                type: Number,
                default: 1
            },
            isReset: {
                type: Boolean,
                default: false
            },
            templateId: {
                type: String,
                default: ''
            },
            hasMail: {
                type: Boolean,
                default: false
            },
            isShowContactName: {
                type: Boolean,
                default: true
            },
            isShowCompanyName: {
                type: Boolean,
                default: true
            },
            changePageOperate: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                filtering: false,
                searchLoading: false,
                dataModel: {
                    id: 'manageId',
                    label: 'administrator'
                },
                contactsFormForShow: {
                    keywords: '', // 关键字
                    createTime: [], // 创建时间
                    createWay: '', // 来源方式
                    inputer: '', // 录入人员
                    manager: [], // 负责人
                    status: '', // 跟进状态
                    defaultSearch: -1
                },
                contactsFormForSearch: {
                    keywords: '', // 关键字
                    createTime: [], // 创建时间
                    createWay: '', // 来源方式
                    inputer: '', // 录入人员
                    manager: [], // 负责人
                    status: '', // 跟进状态
                    defaultSearch: -1
                },
                createWayList: [
                    // {
                    //     value: 1,
                    //     label: this.$t('clue.history')
                    // },
                    {
                        value: 2,
                        label: this.$t('clue.web_msg')
                    },
                    {
                        value: 3,
                        label: this.$t('clue.direct_create')
                    },
                    {
                        value: 4,
                        label: this.$t('clue.web_conversation')
                    },
                    {
                        value: 5,
                        label: 'Facebook Leads'
                    },
                    {
                        value: 6,
                        label: this.$t('clue.fb_msg')
                    },
                    {
                        value: 7,
                        label: this.$t('clue.fb_comment')
                    },
                    {
                        value: 9,
                        label: this.$t('clue.data_import')
                    }
                ],
                contactList: [],
                searchData: {},
                managerList: [], // 该企业下负责人列表
                followUpStatus: [
                    { attrId: 1, attrName: this.$t('clue.unfollowed') },
                    { attrId: 2, attrName: this.$t('clue.trash') },
                    { attrId: 4, attrName: this.$t('clue.following') },
                    { attrId: 5, attrName: this.$t('clue.done') }
                ], // 跟进状态列表
                isClosePoptip: true // 是否需要关闭搜索弹窗
            };
        },
        computed: {
            ...mapState({
                enterpriseId: (state) => state.enterpriseId,
                userId: (state) => state.userId
            })
        },
        methods: {
            /* 格式化日期 */
            dateformat() {
                Date.prototype.format = function(fmt) {
                    const o = {
                        'M+': this.getMonth() + 1, // 月份
                        'd+': this.getDate(), // 日
                        'h+': this.getHours(), // 小时
                        'm+': this.getMinutes(), // 分
                        's+': this.getSeconds(), // 秒
                        'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
                        S: this.getMilliseconds() // 毫秒
                    };
                    if (/(y+)/.test(fmt)) {
                        fmt = fmt.replace(
                            RegExp.$1,
                            `${this.getFullYear()}`.substr(4 - RegExp.$1.length)
                        );
                    }
                    for (const k in o) {
                        if (new RegExp(`(${k})`).test(fmt)) {
                            fmt = fmt.replace(
                                RegExp.$1,
                                RegExp.$1.length == 1
                                    ? o[k]
                                    : `00${o[k]}`.substr(`${o[k]}`.length)
                            );
                        }
                    }
                    return fmt;
                };
            },
            /** 搜索 */
            // searchContact() {
            //     this.searchData = {};
            //     const searchData = {
            //         $and: []
            //     };
            //     let $or = [];
            //     let $and = [];
            //     this.contactsFormForSearch = this.$deepClone(this.contactsFormForShow);
            //     for (const label in this.contactsFormForSearch) {
            //         if (this.contactsFormForSearch[label]) {
            //             switch (label) {
            //                 case 'keywords':
            //                     searchData.$and.push({
            //                         $or: [
            //                             {
            //                                 a1009: {
            //                                     $regex: this.contactsFormForSearch[label]
            //                                 }
            //                             },
            //                             {
            //                                 a10010: {
            //                                     $regex: this.contactsFormForSearch[label]
            //                                 }
            //                             }
            //                         ]
            //                     });
            //                     break;
            //                 case 'createTime':
            //                     if (this.contactsFormForSearch[label][0]) {
            //                         /**
            //                          * @Description: 原接口参数startDate和endDate早已弃用。一直没暴露问题大概是没人用这个筛选。此处改为query方式传参。
            //                          * @author 杨娣
            //                          * @date 2020/7/15
            //                         */
            //                         $and = [
            //                             {
            //                                 create_time: {
            //                                     $gte: this.contactsFormForSearch[label][0].format('yyyy-MM-dd')
            //                                 }
            //                             },
            //                             {
            //                                 create_time: {
            //                                     $lte: `${this.contactsFormForSearch[label][1].format('yyyy-MM-dd')} 23:59:59.999`
            //                                 }
            //                             }
            //                         ];
            //                         searchData.$and.push({
            //                             $and
            //                         });
            //                     }
            //                     break;
            //                 case 'createWay':
            //                     searchData.$and.push({
            //                         source: {
            //                             $eq: this.contactsFormForSearch[label]
            //                         }
            //                     });
            //                     break;
            //                 case 'inputer':
            //                     searchData.$and.push({
            //                         create_user: {
            //                             $regex: this.contactsFormForSearch[label]
            //                         }
            //                     });
            //                     break;
            //                 case 'status':
            //                     searchData.$and.push({
            //                         status: {
            //                             $eq: this.contactsFormForSearch[label]
            //                         }
            //                     });
            //                     break;
            //                 case 'manager':
            //                     if (this.contactsFormForSearch[label].length) {
            //                         $or = this.contactsFormForSearch[label].map(item => {
            //                             return {
            //                                 sale_id: {
            //                                     $eq: item
            //                                 }
            //                             };
            //                         });
            //                         console.log('负责人筛选数据---------', $or);
            //                         searchData.$and.push({
            //                             $or
            //                         });
            //                     }
            //                     break;
            //                 case 'defaultSearch':
            //                     searchData.$and.push({
            //                         a10010: {
            //                             $notnull: this.contactsFormForSearch[label]
            //                         }
            //                     });
            //                     break;
            //             }
            //         } else if (label === 'status') {
            //             /**
            //              * @Description: 由于线索联系人查询的数据范围变更为是线索但不是询盘，查询接口调用/form-cust/form/getColumnValueList接口，即线索管理表头筛选的查询接口，
            //              *              所以需要增加默认筛选条件，实现过滤状态变更为询盘的线索数据。
            //              *              因此在用户未选中跟进状态的情况下，默认搜索是线索(status为1/2/4/5)但不为询盘(status为3)的数据
            //              * @author 杨娣
            //              * @date 2020/7/15
            //             */
            //             $or = this.followUpStatus.map(item => {
            //                 return {
            //                     status: {
            //                         $eq: item.value
            //                     }
            //                 };
            //             });
            //             searchData.$and.push({
            //                 $or
            //             });
            //         }
            //     }
            //     console.log(searchData);
            //     this.searchData = searchData;
            //     this.$emit('isFiltering', true);
            //     if (this.isClosePoptip) {
            //         this.filtering = true;
            //         this.searchLoading = true;
            //     }
            //     if (this.currentPage === 1) {
            //         this.getColumnValueList();
            //     } else {
            //         this.$emit('isSearch', true);
            //     }
            // },
            /** 获取列表 */
            /**
             * @Description: 接口的listType改为2，即查询的是当前用户下的线索
             * @author 杨娣
             * @date 2019/9/20
             */
            getColumnValueList(callBackType) {
                this.contactList = [];
                /**
                 * @Description: 线索联系人筛选的数据范围变更为当前登录用户本人，及其拥有管理权限的人员。
                 *               经确认，/form-cust/form/getColumnValueList已与管理权限集成，此处仅将listType由2(我的线索)更改为3(全部线索)即可
                 * @author 杨娣
                 * @date 2020/7/15
                 */
                const sendData = {
                    orgId: this.enterpriseId,
                    templateId: this.templateId,
                    userId: this.userId,
                    query: JSON.stringify(this.searchData),
                    pageSize: 20,
                    pageNo: this.currentPage,
                    listType: 3
                };
                this.$emit('update:changePageOperate', false);
                util
                    .ajax({
                        url: '/form-cust/form/getColumnValueList',
                        method: 'post',
                        data: sendData
                    })
                    .then((response) => {
                        this.filtering = false;
                        this.$emit('isFiltering', false);
                        this.searchLoading = false;
                        /**
                         * @Description: 与产品确认，当接口返回code不为1(即接口响应异常)，页面做未查询到数据的处理。所以此处不对code做1/0的判断
                         * @author 杨娣
                         * @date 2020/7/17
                         */
                        if (response.data.code) {
                            if (response.data.data && response.data.data.list) {
                                const dataList = response.data.data.list;
                                for (const item of dataList) {
                                    if (item.a10010) {
                                        // 邮箱
                                        const temp = item.a10010.substring(
                                            0,
                                            item.a10010.lastIndexOf('@')
                                        );
                                        this.contactList.push({
                                            followUpId: item.id,
                                            followUpType: 1,
                                            receiverName: this.isShowContactName
                                                ? item.a1009
                                                    ? item.a1009
                                                    : temp
                                                : temp, // 姓名
                                            receiveMailAddress: item.a10010,
                                            enterpriseName: this.isShowCompanyName
                                                ? item.a1001
                                                    ? item.a1001
                                                    : '--'
                                                : '--', // 公司名称
                                            checked: false
                                        });
                                    }
                                }
                            } else {
                                this.contactList = [];
                            }
                            if (response.data.data && this.hasMail) {
                                this.$emit('getTotalCount', response.data.data.total);
                            } else {
                                this.contactList = [];
                                this.$emit('getTotalCount', 0);
                            }
                            this.$emit('getContactList', this.contactList);
                            if (this.isClosePoptip) {
                                this.$emit('closeFilterPoptip', true);
                            }
                            this.isClosePoptip = true;
                        }
                    });
            },
            /* 清空筛选条件 */
            // handleClearFilter() {
            //     this.contactsFormForShow = this.contactsFormForSearch = {
            //         keywords: '',
            //         createTime: [],
            //         createWay: '',
            //         inputer: '',
            //         status: '',
            //         defaultSearch: -1
            //     };
            //     this.$emit('update:changePageOperate', false);
            //     this.isClosePoptip = false;
            //     if (this.currentPage !== 1) {
            //         this.$emit('isSearch');
            //     } else {
            //         this.searchContact();
            //     }
            // },
            /* 获取当前企业下负责人列表 */
            getManagerList() {
                util
                    .ajax({
                        url: '/new-privilege/user/getAllUsersIncludeLock',
                        method: 'get',
                        params: {
                            orgId: this.enterpriseId
                        }
                    })
                    .then((res) => {
                        console.log('---------', res);
                        if (res.data.code === '1') {
                            this.managerList = res.data.data;
                        }
                    });
            }
        },
        created() {
            console.log(this.isReset);
            this.$emit('getTemplateId');
            this.getManagerList();
        },
        watch: {
            /**
             * @Description: 当templateId变化时，改为调用searchContact方法，即实现初始化显示的数据是有邮件地址的
             * @author 杨娣
             * @date 2019/9/20
             */
            /* templateId:'getColumnValueList', */
            templateId: {
                handler(val) {
                    console.log('templateId变化了--------', val);
                    this.isClosePoptip = false;
                    this.searchContact();
                }
            },
            currentPage: {
                handler(val) {
                    console.log('currentPage变化了-------', val, this.changePageOperate);
                    if (val === 1 && !this.changePageOperate) {
                        this.searchContact();
                    } else {
                        this.getColumnValueList();
                    }
                }
            },
            isReset(val) {
                if (val === true) {
                    // this.contactsForm = {
                    //     keywords: '',
                    //     createTime: [],
                    //     createWay: '',
                    //     inputer: ''
                    // };
                    this.handleClearFilter();
                }
            }
        }
    };
</script>
<style lang="less" scoped>
.clue-contact {
  /deep/ .el-form-item {
    margin-bottom: 12px;
  }
  /deep/ .el-form-item__content {
    font-size: 12px;
    .el-input {
      font-size: 12px;
      width: 450px;
    }
    .el-select {
      font-size: 12px;
      width: 65%;
      .el-input {
        width: 100%;
      }
    }
  }

  /deep/ .el-form-item__label {
    text-align: left;
    padding-left: 10px;
  }
  /deep/ .el-select__tags {
    max-height: 200px;
    overflow: auto;
  }
}
</style>

