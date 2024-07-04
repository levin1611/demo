<template>
  <Form
    label-width="90px"
    ref="update_form"
    style="margin-top: 12px; width: 400px"
    :model="contactsFormForShow"
    class="customer-contact"
  >
    <FormItem :label="$t('mailMarketing.emailAddress.keyword')">
      <Input
        :disabled="filtering"
        v-model="contactsFormForShow.keywords"
        :placeholder="$t('mail.writeLetter.addContactModal.clueSearchKey')"
      >
      </Input>
    </FormItem>
    <FormItem :label="$t('mailMarketing.emailAddress.customerType')">
      <xhl-select
        v-if="filterConditions.scale"
        v-model="contactsFormForShow.clientType"
        :followUpStatusData="filterConditions.clientType"
        :dataModel="{
          id: 'attrId',
          label: 'attrName',
        }"
        styleCustom="width:450px"
      ></xhl-select>
    </FormItem>
    <FormItem :label="$t('mailMarketing.emailAddress.scale')">
      <xhl-select
        v-if="filterConditions.scale"
        v-model="contactsFormForShow.scale"
        :followUpStatusData="filterConditions.scale"
        :dataModel="{
          id: 'attrId',
          label: 'attrName',
        }"
        styleCustom="width:450px"
      ></xhl-select>
    </FormItem>
    <FormItem :label="$t('mailMarketing.emailAddress.countryRegion')">
      <country-area-select
        :disabled="filtering"
        :countryArea.sync="contactsFormForShow.countryArea"
        placeholder="请选择"
      >
      </country-area-select>
    </FormItem>
    <FormItem :label="$t('mailMarketing.emailAddress.abbreviation')">
      <Input
        :disabled="filtering"
        v-model="contactsFormForShow.keywords"
        :placeholder="$t('mail.writeLetter.addContactModal.clueSearchKey')"
      >
      </Input>
    </FormItem>
    <div v-if="!showMore" class="open-more" @click="openMore">展开更多</div>

    <template v-if="showMore">
      <FormItem :label="$t('mailMarketing.emailAddress.starLevel')">
        <Input
          style="display: inline-block; width: 200px"
          :disabled="filtering"
          v-model="contactsFormForShow['notFollowedDays'].lowerLimit"
          placeholder="请输入下限值"
          maxlength="6"
        >
        </Input>
        <span style="margin: 0 16px"> 至 </span>
        <Input
          style="display: inline-block; width: 200px"
          :disabled="filtering"
          v-model="contactsFormForShow['notFollowedDays'].upperLimit"
          placeholder="请输入上限值"
          maxlength="6"
        >
        </Input>
      </FormItem>
      <FormItem :label="$t('mailMarketing.emailAddress.productCategories')" class="long-label-text">
        <xhl-select
          v-model="contactsFormForShow.createWay"
          :followUpStatusData="createWayList"
          styleCustom="width:450px"
        ></xhl-select>
      </FormItem>

      <FormItem :label="$t('mailMarketing.emailAddress.sourceChannel')" class="long-label-text">
        <xhl-select
          v-model="contactsFormForShow.createWay"
          :followUpStatusData="createWayList"
          styleCustom="width:450px"
        ></xhl-select>
      </FormItem>

      <FormItem label="来源方式" class="long-label-text">
        <xhl-select
          v-model="contactsFormForShow.createWay"
          :followUpStatusData="createWayList"
          styleCustom="width:450px"
        ></xhl-select>
      </FormItem>

      <FormItem :label="$t('mailMarketing.emailAddress.label')" class="long-label-text">
        <xhl-select
          v-model="contactsFormForShow.createWay"
          :followUpStatusData="createWayList"
          styleCustom="width:450px"
        ></xhl-select>
      </FormItem>

      <FormItem :label="$t('mailMarketing.emailAddress.demand')" class="long-label-text">
        <xhl-select
          v-model="contactsFormForShow.createWay"
          :followUpStatusData="createWayList"
          styleCustom="width:450px"
        ></xhl-select>
      </FormItem>

      <FormItem :label="$t('mailMarketing.emailAddress.salesRep')" class="long-label-text">
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

      <FormItem :label="$t('mailMarketing.emailAddress.followUpStatus')" class="long-label-text">
        <xhl-select
          v-model="contactsFormForShow.followUpId"
          :isSync="true"
          url="/crm/attr/getList"
          :params="{ typeId: 7 }"
          post-method="post"
          :errorText="this.$t('crm.Html.error_getFollowUpStatusList')"
          :formatData="formatFollowUp"
          :dataModel="{
            id: 'attrId',
            label: 'attrName',
          }"
        ></xhl-select>
      </FormItem>

      <FormItem :label="$t('mailMarketing.emailAddress.numberOfNotFollowedDays')">
        <Input
          style="display: inline-block; width: 200px"
          :disabled="filtering"
          v-model="contactsFormForShow['notFollowedDays'].lowerLimit"
          placeholder="请输入下限值"
          maxlength="6"
        >
        </Input>
        <span style="margin: 0 16px"> 至 </span>
        <Input
          style="display: inline-block; width: 200px"
          :disabled="filtering"
          v-model="contactsFormForShow['notFollowedDays'].upperLimit"
          placeholder="请输入上限值"
          maxlength="6"
        >
        </Input>
      </FormItem>
    </template>
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
                contactsFormForShow: {
                    keywords: '', // 关键字
                    clientType: '',
                    scale: '',
                    countryArea: '', // 国家地区
                    demandProduct: '', // 需求产品
                    subUserIds: [], // 负责人
                    followUpStatus: [],
                    followUpId: '', // 跟进状态
                    notFollowedDays: {
                        lowerLimit: '',
                        upperLimit: ''
                    } // 未跟进天数
                },
                contactsFormForSearch: {
                    keywords: '', // 关键字
                    createTime: [], // 创建时间
                    createWay: '', // 来源方式
                    inputer: '', // 录入人员
                    manager: [], // 负责人
                    status: '', // 跟进状态
                    defaultSearch: -1,
                    scale: '', // 规模
                    clientType: '' // 客户类型
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
                filterConditions: {}, // 获取的筛选数据源，规模及客户类型
                followUpStatus: [
                    { value: 1, label: this.$t('clue.unfollowed') },
                    { value: 2, label: this.$t('clue.trash') },
                    { value: 4, label: this.$t('clue.following') },
                    { value: 5, label: this.$t('clue.done') }
                ], // 跟进状态列表
                isClosePoptip: true, // 是否需要关闭搜索弹窗
                showMore: false
            };
        },
        computed: {
            ...mapState({
                enterpriseId: (state) => state.enterpriseId,
                userId: (state) => state.userId
            })
        },
        methods: {
            openMore() {
                this.showMore = !this.showMore;
            },
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
            // 格式化“跟进状态”数据源
            formatFollowUp(data) {
                const followUpStatus = data
                    .filter((item) => item.isAvailable === 1)
                    .sort((a, b) => a.sort - b.sort);
                followUpStatus.unshift({
                    attrName: this.$t('crm.UniSet.defaultFollowUpStatus_inquiry'),
                    attrId: 0
                });
                followUpStatus.unshift({
                    attrName: this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry'),
                    attrId: -1
                });
                return followUpStatus;
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
            },
            getContactFilterConditions() {
                util
                    .ajax({
                        url: '/crm/mailbox/getAttrType',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId
                        }
                    })
                    .then((response) => {
                        if (response.data.code === '1') {
                            this.filterConditions = response.data.data;
                        }
                    });
            }
        },
        created() {
            console.log(this.isReset);
            this.$emit('getTemplateId');
            this.getManagerList();
            this.getContactFilterConditions();
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
.customer-contact {
  .open-more {
    font-size: 12px;
    color: #3b78de;
    text-align: center;
    width: 600px;
    cursor: pointer;
  }
  /deep/ .el-form-item {
    margin-bottom: 12px;
    width: 542px;
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

