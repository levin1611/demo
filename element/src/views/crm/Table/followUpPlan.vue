<template>
    <div class="followUp_plan crm-table-page">
        <div class="followUp_plan-header">
            <div class="followUp_plan_left">
                <!-- 改版顶部筛选 -->
                <TopFilter :title.sync="title_topFilter"
                        type="followUpPlan"
                        :columnType="columnType"
                        :filtering.sync="filtering"
                        sql_manager="queryType"
                        :allColumns="allColumns"
                        :selectOptions="selectOptions"
                        :custom_conditions.sync="addCondition"
                        :common_conditions.sync="common_conditions"
                        :conditionList1="conditionList1"
                        :conditionList2="conditionList2"
                        :getSearchCon="getSearchCon"
                        :addChangeCon1="addChangeCon1"
                        :addChangeCon2="addChangeCon2"
                        :flag_topFilter="flag_topFilter"
                        :type_topFilter="type_topFilter"
                        ref="topFilter"
                        @refreshData="refreshData_filter"></TopFilter>
            </div>
            <div class="table-operate-btns">
                <!-- 文件导出 -->
                <!-- <Tooltip :content="$t('crm.Table.exportData')" effect="dark" placement="bottom">
                    <Button v-if="authorized_button['exportData']"
                        type="text"
                        icon="custom custom-file-download"
                        @click="exportData"
                        class="piwik_download_table_followUpRecord customer-filedownload custom-file-download-border"></Button>
                </Tooltip>
                <HelpTip :title="$t('helpTip.exportData')"></HelpTip> -->

                 <!-- 按钮组 -->
                 <!-- v-if="authorized_button['newFolloUp'] || authorized_button['importData']" -->
                <span class="newCreate-btn-group" v-if="authorized_button['newPlan']">
                    <!-- 外部按钮 -->
                    <template>
                        <!-- 新建客户 -->
                        <Button type="primary"
                            @click="createPlan"
                            class="">{{ $t('crm.Table.newCompany') }}</Button>
                    </template>
                    <!-- 导入数据 -->
                    <!-- <template v-else>
                        <Button type="text"
                                @click.stop="show_import_data=true"
                                class="newCreate-btn-group-import">{{ $t('crm.Table.importData') }}</Button>
                    </template> -->

                    <!-- 下拉 导入数据 -->
                    <!-- <template v-if="authorized_button['newFolloUp'] && authorized_button['importData']">
                        <Dropdown placement="bottom-end">
                            <Button icon="custom custom-menu-arrow"
                                    class="dropIcon">
                                <span style="display: none;">_</span>
                            </Button>
                            <DropdownMenu slot="dropdown">
                                <DropdownItem @click.native.stop="show_import_data=true">
                                    <span v-if="authorized_button['importData']">{{ $t('crm.Table.importData') }}</span>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </template> -->
                </span>
            </div>
        </div>
        <div class="followUpPlanBox" :style="{height:table_height+'px'}" v-loading="tableLoading">
            <template v-if="!tableLoading && tableList.length">
                <div class="followUpPlanList">
                    <div :style="{height:table_height-40+'px'}" style="overflow-y: auto;">
                        <div v-for="(item, index) in tableList" :key="item.id" class="plan-list" :class="{currentList: item.followupPlanId === planId }" @click="handleClick(item,index)">
                            <p class="plan-title">
                                <span class="planTitle">{{item.followupPlanName}}</span>
                                <span class="planStatus"
                                    :class="{'inprogress': item.followupPlanStatus === 2,
                                            'completed': item.followupPlanStatus === 3,
                                            'overdue': item.followupPlanStatus === 4}">
                                    {{statusFilter(item.followupPlanStatus)}}
                                </span>
                            </p>
                            <p class="plan-time">{{$t('crm.followUpPlan.startDate')}}: {{item.followupPlanStartTime}} - {{item.followupPlanEndTime}}</p>
                            <p class="plan-person">{{$t('crm.followUpPlan.executor')}}: {{item.operator}}</p>
                            <p class="plan-content">{{item.followupPlanContent}}</p>
                        </div>
                    </div>
                    <!-- 分页 -->
                    <div class="small-page">
                        <Page :page-size="pageSize"
                            :page-sizes="[20, 50, 100]"
                            :total="totalNum"
                            :current-page="curPage"
                            :pager-count="5"
                            small
                            layout="total, prev, pager, next,sizes"
                            @current-change="pageChange"
                            @size-change="pageSizeChange"
                            ></Page>
                    </div>
                </div>
                <div class="followUpPlanDetailBox">
                <div class="plan-detail-top" ref="planDetailTop" v-if="detai">
                    <div class="plan-detail-title">
                        <div class="title">
                            <Icon custom="custom custom-genjinjihua"
                                size="36"
                                color="#00CC99"
                                style="margin-right:12px"></Icon>
                                <p>
                                    <Tooltip :content="detai.followupPlanName" placement="bottom-start">
                                        <span>{{detai.followupPlanName}}</span>
                                    </Tooltip>
                                </p>
                        </div>
                        <div class="btn">
                             <Button v-if="authorized_button['editPlan']"
                                type="success"
                                size="small"
                                @click="editPlan">
                                {{ $t("crm.Detail.editInquiry") }}</Button>
                            <Button v-if="authorized_button['delPlan']" @click="deleteConfirm" type="minor" size="small">{{$t("crm.Html.delete")}}</Button>
                        </div>
                    </div>
                    <Row class="plan-detail" :gutter="12">
                        <Col :span="6">
                            <p>{{$t('crm.followUpRecord.createUser')}}</p>{{detai.createUser}}
                        </Col>
                        <Col :span="6">
                            <p>{{$t('crm.followUpPlan.startDate')}}</p>{{detai.followupPlanStartTime}} - {{detai.followupPlanEndTime}}
                        </Col>
                        <Col :span="6">
                            <p>{{$t('crm.followUpPlan.executor')}}</p>{{detai.operator}}
                        </Col>
                        <Col :span="6">
                            <p>{{$t('crm.Table.col_createTime')}}</p>{{detai.createTime}}
                        </Col>
                    </Row>
                    <div class="plan-detail-content">{{detai.followupPlanContent}}</div>
                </div>
                <div class="plan-detail-tabs" :style="`height: calc(100% - ${planDetailTopHeight}px)`">
                    <Tabs v-model="currentTab">
                        <TabPane v-for="item in tabsList"
                            :label="item.label"
                            :key="item.name"
                            :name="item.name">
                        </TabPane>
                    </Tabs>
                    <component
                        :is="currentTab"
                        :planId="planId"
                        :change_flag_new_followUp="change_flag_new_followUp"
                        @createFolloUp="createFolloUp"
                        @jumpToDetail="jumpToDetail"
                        @editFollowup="editFollowup">
                    </component>
                </div>
                </div>
            </template>
            <template v-if="!tableLoading && !tableList.length">
                <div class="noDataList">
                    <img :src="require('@/assets/images/nodata.png')" alt="">
                    <p>{{$t('crm.Table.noData')}}</p>
                </div>
            </template>
        </div>
        <followUpRecordModal
            v-if="add_followup_modal"
            :visible.sync="add_followup_modal"
            :defaultCustomer.sync="currentCustomer"
            :detail="recordDetail"
            @changeFollowUp="changeFollowUp">
        </followUpRecordModal>
        <followUpPlanModal
            v-if="addFollowupPlanModal"
            :visible.sync="addFollowupPlanModal"
            :detail="editDetail"
            :userList="userList"
            @refresh="refreshData">
        </followUpPlanModal>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import Utils from '@/utils/index';
    import resetComponentViewData from '@/mixins/resetComponentViewData';
    import tableColResize from '@/mixins/tableColResize';
    import TopFilter from '@/views/crm/Table/Components/Html/topFilter';
    import ImportData from '@/views/crm/Table/Components/Modal/importData';
    import associatedCustomers from '@/views/crm/Table/Components/Html/followUpPlan/associatedCustomers';
    import record from '@/views/crm/Table/Components/Html/followUpPlan/record';
    import followUpRoute from '@/views/crm/Table/Components/Html/followUpPlan/followUpRoute';
    import followUpLog from '@/views/crm/Table/Components/Html/followUpPlan/followUpLog';
    import followUpRecordModal from '@/views/crm/Table/Components/Modal/followUpRecord/followUpRecordModal';
    import followUpPlanModal from '@/views/crm/Table/Components/Modal/followUpPlan/followUpPlanModal';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { crmCommon, crmFollowupPlan, crmFollowupRecord } from '@/api/crm/index';
    // 检索条件变化
    const addChangeCon1 = function(index) {
        this.addCondition[index].condition2 = '';
        this.addCondition[index].condition3 = '';
        switch (this.addCondition[index].condition1) {
            // 字符串型
            case 'cpCompanyName':
            case 'cpShortName':
            case 'cpMainProduct':
            case 'cpHomePage':
            case 'cpContactAddress':
            case 'cpDynamic':
            case 'iqSeqNumber':
            case 'iqDemandProducts':
            case 'iqRemark':
            case 'ctNickName':
            case 'ctEmail':
            case 'ctJobTitle':
            case 'ctJobGrade':
            case 'ctPhone':
            case 'ctWhatsApp':
            case 'ctInstagram':
            case 'ctRemark':
            case 'cpAutoSeq':
                this.addCondition[index].conditionList2 = [
                    {
                        value: '$eq',
                        label: this.$t('crm.Table.con_equal')
                    },
                    {
                        value: '$ne',
                        label: this.$t('crm.Table.con_unequal')
                    },
                    {
                        value: '$regex',
                        label: this.$t('crm.Table.con_include')
                    },
                    {
                        value: '$nregex',
                        label: this.$t('crm.Table.con_exclude')
                    }
                ];
                this.addCondition[index].condition2 = '$regex';
                this.addCondition[index].inputType = 'string';
                break;
            case 'ctSocialNetworkingPlatform':
                this.addCondition[index].conditionList2 = [
                    {
                        value: '$regex',
                        label: this.$t('crm.Table.con_include')
                    },
                    {
                        value: '$nregex',
                        label: this.$t('crm.Table.con_exclude')
                    }
                ];
                this.addCondition[index].condition2 = '$regex';
                this.addCondition[index].inputType = 'string';
                break;
            // 多选型
            case 'iqProductCategory':
            case 'iqLabel':
                if (Array.isArray(this.selectOptions[this.addCondition[index].condition1]) && this.selectOptions[this.addCondition[index].condition1].length) {
                    this.addCondition[index].conditionList2 = [
                        {
                            value: '$regex',
                            label: this.$t('crm.Table.con_include')
                        },
                        {
                            value: '$nregex',
                            label: this.$t('crm.Table.con_exclude')
                        }
                    ];

                    this.addCondition[index].condition2 = '$regex';
                    this.addCondition[index].inputType = 'array';
                    this.addCondition[index].condition3 = [];
                    this.addCondition[index].conditionList3 = this.selectOptions[this.addCondition[index].condition1].map(item => {
                        const { attrName, attrId } = item;
                        return { value: attrName, label: attrName };
                    });
                    if (this.addCondition[index].condition1 === 'iqProductCategory') {
                        this.addCondition[index].conditionList3.push({
                            value: -1, label: '空'
                        });
                    }
                } else {
                    this.addCondition[index].conditionList2 = [
                        {
                            value: '$eq',
                            label: this.$t('crm.Table.con_equal')
                        },
                        {
                            value: '$ne',
                            label: this.$t('crm.Table.con_unequal')
                        },
                        {
                            value: '$regex',
                            label: this.$t('crm.Table.con_include')
                        },
                        {
                            value: '$nregex',
                            label: this.$t('crm.Table.con_exclude')
                        }
                    ];
                    this.addCondition[index].condition2 = '$regex';
                    this.addCondition[index].inputType = 'string';
                }
                break;
            // 单选型
            case 'cpClientType':
            case 'cpScale':
            case 'iqSourceChannel':
            case 'iqSourceWay':
            case 'iqGrouping':
            case 'iqFollowUp':
                if (Array.isArray(this.selectOptions[this.addCondition[index].condition1]) && this.selectOptions[this.addCondition[index].condition1].length) {
                    this.addCondition[index].conditionList2 = [
                        {
                            value: '$eq',
                            label: this.$t('crm.Table.con_equal')
                        },
                        {
                            value: '$ne',
                            label: this.$t('crm.Table.con_unequal')
                        }
                    ];

                    this.addCondition[index].condition2 = '$eq';
                    this.addCondition[index].inputType = 'select';
                    this.addCondition[index].condition3 = '';
                    if (this.addCondition[index].condition1 === 'iqFollowUp') {
                        const followList = this.selectOptions[this.addCondition[index].condition1].map(item => {
                            const { attrName, attrId } = item;
                            return { value: attrId, label: attrName };
                        });
                        followList.splice(1, 0, {
                            value: -1,
                            label: this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry')
                        });
                        this.addCondition[index].conditionList3 = followList;
                    } else if (this.addCondition[index].condition1 === 'cpClientType') {
                        this.addCondition[index].conditionList3 = [{
                            value: -1,
                            label: this.$t('crm.UniSet.defaultFollowUpStatus_empty')
                        }].concat(this.selectOptions[this.addCondition[index].condition1].map(item => {
                            const { attrName } = item;
                            return { value: attrName, label: attrName };
                        }));
                    } else {
                        this.addCondition[index].conditionList3 = this.selectOptions[this.addCondition[index].condition1].map(item => {
                            const { attrName } = item;
                            return { value: attrName, label: attrName };
                        });
                    }
                } else {
                    this.addCondition[index].conditionList2 = [
                        {
                            value: '$eq',
                            label: this.$t('crm.Table.con_equal')
                        },
                        {
                            value: '$ne',
                            label: this.$t('crm.Table.con_unequal')
                        },
                        {
                            value: '$regex',
                            label: this.$t('crm.Table.con_include')
                        },
                        {
                            value: '$nregex',
                            label: this.$t('crm.Table.con_exclude')
                        }
                    ];
                    this.addCondition[index].condition2 = '$regex';
                    this.addCondition[index].inputType = 'string';
                }
                break;
            case 'cpCreateUser':
                this.addCondition[index].conditionList2 = [
                    {
                        value: '$eq',
                        label: this.$t('crm.Table.con_equal')
                    },
                    {
                        value: '$ne',
                        label: this.$t('crm.Table.con_unequal')
                    }
                ];
                this.addCondition[index].condition2 = '$eq';
                this.addCondition[index].inputType = 'select';
                this.addCondition[index].condition3 = '';
                this.addCondition[index].conditionList3 = [].concat(
                    [{ label: '询盘云', value: -2 }],
                    this.userList.map(item => {
                        const { fullname: label, id: value } = item;
                        return { label, value };
                    })
                );
                break;
            // 数字
            case 'cpStarLevel':
            case 'cpFollowUpCount':
            case 'cpTouchCount':
            case 'cpNotFollowedDays':
                this.addCondition[index].conditionList2 = [
                    {
                        value: '$lt',
                        label: this.$t('crm.Table.con_lessThan')
                    },
                    {
                        value: '$lte',
                        label: this.$t('crm.Table.con_lessOrEqual')
                    },
                    {
                        value: '$eq',
                        label: this.$t('crm.Table.con_equal')
                    },
                    {
                        value: '$gte',
                        label: this.$t('crm.Table.con_greaterOrEqual')
                    },
                    {
                        value: '$gt',
                        label: this.$t('crm.Table.con_greaterThan')
                    }
                ];
                this.addCondition[index].condition2 = '$eq';
                this.addCondition[index].inputType = 'number';
                this.addCondition[index].condition3 = 0;
                break;
            // Boolean
            case 'cpMarker':
            case 'ctGender':
                this.addCondition[index].conditionList2 = [
                    {
                        value: '$eq',
                        label: this.$t('crm.Table.con_equal')
                    }
                ];
                this.addCondition[index].condition2 = '$eq';
                this.addCondition[index].inputType = 'boolean';
                this.addCondition[index].condition3 = 1;
                break;
            // 时间类
            case 'cpCreateTime':
            case 'cpUpdateTime':
            case 'cpLastFollowUpTime':
            case 'ctBirthday':
                this.addCondition[index].conditionList2 = [
                    {
                        value: 'dateRange',
                        label: this.$t('crm.Table.con_periodOfTime')
                    },
                    {
                        value: '$lt',
                        label: this.$t('crm.Table.con_lessThan')
                    },
                    {
                        value: '$gt',
                        label: this.$t('crm.Table.con_greaterThan')
                    }
                ];
                this.addCondition[index].condition2 = 'dateRange';
                this.addCondition[index].inputType = 'dateRange';
                this.$nextTick(() => {
                    const end = new Date();
                    const start = new Date();
                    end.setTime(end.getTime() - 3600 * 1000 * 24);
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                    this.addCondition[index].condition3 = [start, end];
                });
                break;
            // 仪表盘-客户跟进情况概览, 带过来的筛选条件"跟进时间", 特殊处理
            case 'eventDate':
                this.addCondition[index].conditionList2 = [
                    {
                        value: 'dateRange',
                        label: this.$t('crm.Table.con_periodOfTime')
                    },
                    {
                        value: '$lte',
                        label: this.$t('crm.Table.con_lessOrEqual')
                    },
                    {
                        value: '$gte',
                        label: this.$t('crm.Table.con_greaterOrEqual')
                    }
                ];
                this.addCondition[index].condition2 = 'dateRange';
                this.addCondition[index].inputType = 'dateRange';
                this.$nextTick(() => {
                    const end = new Date();
                    const start = new Date();
                    end.setTime(end.getTime() - 3600 * 1000 * 24);
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                    this.addCondition[index].condition3 = [start, end];
                });
                break;
            // 负责人, 数组
            case 'cpCompanyManagers':
                this.addCondition[index].conditionList2 = [
                    {
                        value: '$eq',
                        label: this.$t('crm.Table.con_include') // this.$t('highSeasSetting.containsAny')
                    }
                ];
                this.addCondition[index].condition2 = '$eq';
                this.addCondition[index].inputType = 'array';
                this.addCondition[index].condition3 = [];
                this.addCondition[index].conditionList3 = this.allUsers.map(item => {
                    const { fullname: label, id: value } = item;
                    return { label, value };
                });
                break;
            // 国家地区
            case 'cpCountryArea':
                this.addCondition[index].conditionList2 = [
                    {
                        value: '$eq',
                        label: this.$t('crm.Table.con_equal')
                    },
                    {
                        value: '$ne',
                        label: this.$t('crm.Table.con_unequal')
                    }
                ];
                this.addCondition[index].condition2 = '$eq';
                this.addCondition[index].inputType = 'countryArea';
                this.addCondition[index].condition3 = '';
                break;
            // 自定义字段
            default:
                const temp = this.allColumns.find(item => item.key === this.addCondition[index].condition1);
                if (temp) {
                    switch (temp.filterType) {
                        case 'date':
                        case 'date+time':
                            this.addCondition[index].conditionList2 = [
                                {
                                    value: 'dateRange',
                                    label: this.$t('crm.Table.con_periodOfTime')
                                },
                                {
                                    value: '$lt',
                                    label: this.$t('crm.Table.con_lessThan')
                                },
                                {
                                    value: '$gt',
                                    label: this.$t('crm.Table.con_greaterThan')
                                }
                            ];
                            this.addCondition[index].condition2 = 'dateRange';
                            this.addCondition[index].inputType = 'dateRange';
                            this.$nextTick(() => {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                                this.addCondition[index].condition3 = [start, end];
                            });
                            break;
                        case 'selectMultiple':
                            this.addCondition[index].conditionList2 = [
                                {
                                    value: '$regex',
                                    label: this.$t('crm.Table.con_include')
                                },
                                {
                                    value: '$nregex',
                                    label: this.$t('crm.Table.con_exclude')
                                }
                            ];
                            this.addCondition[index].condition2 = '$regex';
                            this.addCondition[index].inputType = 'array';
                            this.addCondition[index].condition3 = [];
                            this.addCondition[index].conditionList3 = temp.option.split('?').map(item => {
                                return { value: item, label: item };
                            });
                            break;
                        case 'select':
                            this.addCondition[index].conditionList2 = [
                                {
                                    value: '$eq',
                                    label: this.$t('crm.Table.con_equal')
                                },
                                {
                                    value: '$ne',
                                    label: this.$t('crm.Table.con_unequal')
                                }
                            ];
                            this.addCondition[index].condition2 = '$eq';
                            this.addCondition[index].inputType = 'select';
                            this.addCondition[index].condition3 = '';
                            this.addCondition[index].conditionList3 = temp.option.split('?').map(item => {
                                return { value: item, label: item };
                            });
                            break;
                        case 'text':
                        case 'textarea':
                            this.addCondition[index].conditionList2 = [
                                {
                                    value: '$eq',
                                    label: this.$t('crm.Table.con_equal')
                                },
                                {
                                    value: '$ne',
                                    label: this.$t('crm.Table.con_unequal')
                                },
                                {
                                    value: '$regex',
                                    label: this.$t('crm.Table.con_include')
                                },
                                {
                                    value: '$nregex',
                                    label: this.$t('crm.Table.con_exclude')
                                }
                            ];
                            this.addCondition[index].condition2 = '$regex';
                            this.addCondition[index].inputType = 'string';
                            break;
                        default:
                            this.addCondition[index].conditionList2 = [
                                {
                                    value: '$eq',
                                    label: this.$t('crm.Table.con_equal')
                                },
                                {
                                    value: '$ne',
                                    label: this.$t('crm.Table.con_unequal')
                                },
                                {
                                    value: '$regex',
                                    label: this.$t('crm.Table.con_include')
                                },
                                {
                                    value: '$nregex',
                                    label: this.$t('crm.Table.con_exclude')
                                }
                            ];
                            this.addCondition[index].inputType = 'string';
                    }
                } else {
                    this.addCondition[index].conditionList2 = [
                        {
                            value: '$eq',
                            label: this.$t('crm.Table.con_equal')
                        },
                        {
                            value: '$ne',
                            label: this.$t('crm.Table.con_unequal')
                        },
                        {
                            value: '$regex',
                            label: this.$t('crm.Table.con_include')
                        },
                        {
                            value: '$nregex',
                            label: this.$t('crm.Table.con_exclude')
                        }
                    ];
                    this.addCondition[index].inputType = 'string';
                }
        }
    };
    const addChangeCon2 = function(index) {
        switch (this.addCondition[index].condition1) {
            // 字符串型
            case 'cpCompanyName':
            case 'cpShortName':
            case 'cpMainProduct':
            case 'cpHomePage':
            case 'cpContactAddress':
            case 'cpDynamic':
            case 'iqSeqNumber':
            case 'iqDemandProducts':
            case 'iqRemark':
            case 'ctNickName':
            case 'ctEmail':
            case 'ctJobTitle':
            case 'ctJobGrade':
            case 'ctPhone':
            case 'ctWhatsApp':
            case 'ctInstagram':
            case 'ctRemark':
            case 'ctSocialNetworkingPlatform':
            case 'cpAutoSeq':
                this.addCondition[index].condition3 = '';
                break;
            // 多选型
            case 'iqProductCategory':
            case 'iqLabel':
                this.addCondition[index].condition3 = [];
                break;
            // 单选型
            case 'cpClientType':
            case 'cpScale':
            case 'cpCreateUser':
            case 'iqSourceChannel':
            case 'iqSourceWay':
            case 'iqGrouping':
            case 'iqFollowUp':
                this.addCondition[index].condition3 = '';
                if (this.addCondition[index].condition1 === 'cpClientType' && this.addCondition[index].condition2 === '$ne') {
                    this.addCondition[index].conditionList3 = this.selectOptions[this.addCondition[index].condition1].map(item => {
                        const { attrName } = item;
                        return { value: attrName, label: attrName };
                    });
                }
                if (this.addCondition[index].condition1 === 'cpClientType' && this.addCondition[index].condition2 === '$eq') {
                    this.addCondition[index].conditionList3 = [{
                        value: -1,
                        label: this.$t('crm.UniSet.defaultFollowUpStatus_empty')
                    }].concat(this.selectOptions[this.addCondition[index].condition1].map(item => {
                        const { attrName } = item;
                        return { value: attrName, label: attrName };
                    }));
                }
                break;
            // 数字
            case 'cpStarLevel':
            case 'cpFollowUpCount':
            case 'cpTouchCount':
            case 'cpNotFollowedDays':
                this.addCondition[index].condition3 = 0;
                break;
            // Boolean
            case 'cpMarker':
            case 'ctGender':
                this.addCondition[index].condition3 = 1;
                break;
            // 时间类
            case 'cpCreateTime':
            case 'cpUpdateTime':
            case 'cpLastFollowUpTime':
            case 'ctBirthday':
            case 'eventDate':
                this.addCondition[index].inputType = 'date';
                this.addCondition[index].condition3 = '';
                if (this.addCondition[index].condition2 === 'dateRange') {
                    this.addCondition[index].inputType = 'dateRange';
                    this.addCondition[index].condition3 = [];
                }
                break;
            // 负责人, 数组
            case 'cpCompanyManagers':
                this.addCondition[index].condition3 = [];
                break;
            // 国家地区
            case 'cpCountryArea':
                this.addCondition[index].condition3 = '';
                break;
            // 自定义字段
            default:
                const temp = this.allColumns.find(item => item.key === this.addCondition[index].condition1);
                if (temp) {
                    switch (temp.filterType) {
                        case 'date':
                        case 'date+time':
                            this.addCondition[index].inputType = 'date';
                            this.addCondition[index].condition3 = '';
                            if (this.addCondition[index].condition2 === 'dateRange') {
                                this.addCondition[index].inputType = 'dateRange';
                                this.addCondition[index].condition3 = [];
                            }
                            break;
                        case 'selectMultiple':
                            this.addCondition[index].condition3 = [];
                            break;
                        case 'select':
                        case 'text':
                        case 'textarea':
                        default:
                            this.addCondition[index].condition3 = '';
                    }
                } else {
                    this.addCondition[index].condition3 = '';
                }
        }
    };
    export default {
        name: 'followUpPlan',
        mixins: [resetComponentViewData, tableColResize],
        components: {
            TopFilter,
            associatedCustomers,
            record,
            followUpRoute,
            followUpLog,
            ImportData,
            followUpRecordModal,
            followUpPlanModal
        },
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height',
                button_list: state => state.app.button_list,
                followupTypes: state => state.crm.followUpType
            }),
            ...mapGetters([
                'isHaveAuthority'
            ]),
            table_height() {
                let temp = this.window_height ? this.window_height - 118 : document.body.clientHeight - 118;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            },
            authorized_button() {
                const ids = BUTTON_IDS.followUpPlan;
                return {
                    newPlan: !HANDLE_BUTTON(ids.newPlan, this.button_list),
                    editPlan: !HANDLE_BUTTON(ids.editPlan, this.button_list),
                    delPlan: !HANDLE_BUTTON(ids.delPlan, this.button_list)
                };
            }
        },
        data() {
            return {
                // 高级筛选开始
                addChangeCon1: addChangeCon1,
                addChangeCon2: addChangeCon2,
                title_topFilter: this.$t('crm.Table.allfollowUpPlan'),
                filtering: false,
                flag_topFilter: false,
                type_topFilter: '',
                addCondition: [],
                common_conditions: [],
                conditionList1: [],
                conditionList2: [
                    {
                        value: '$eq',
                        label: this.$t('crm.Table.con_equal')
                    },
                    {
                        value: '$ne',
                        label: this.$t('crm.Table.con_unequal')
                    },
                    {
                        value: '$regex',
                        label: this.$t('crm.Table.con_include')
                    },
                    {
                        value: '$nregex',
                        label: this.$t('crm.Table.con_exclude')
                    }
                ],
                selectOptions: {},
                userList: [],
                // 高级筛选结束
                // 详情tabs
                tabsList: [
                    { label: this.$t('crm.followUpRecord.associatedCustomers'), name: 'associatedCustomers' },
                    { label: this.$t('crm.Modal.module_followUp'), name: 'record' },
                    { label: this.$t('crm.followUpPlan.followUpRoute'), name: 'followUpRoute' },
                    { label: this.$t('crm.followUpPlan.followUpLog'), name: 'followUpLog' }
                ],
                currentTab: 'associatedCustomers',
                // 详情tabs结束
                cancelFunc: null,
                // 翻页开始
                totalNum: 0, // 列表数据总条数
                curPage: 1, // 当前页码
                pageSize: 20, // 当前页显示条数
                // 翻页结束
                type: 5,
                tableLoading: true, // 表格loading
                // 列表数据
                tableList: [],
                // 表头筛选条件初始化
                config_tableFilter: {
                    followupContent: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值, 对应上述类型
                        allList: null
                    },
                    companyName: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值, 对应上述类型
                        allList: null
                    },
                    createUser: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        selectAll: true, // 增加选项 全选
                        query: [], // 筛选值, 对应上述类型
                        allList: []
                    },
                    followupType: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        selectAll: true, // 增加选项 全选
                        query: [], // 筛选值, 对应上述类型
                        allList: []
                    },
                    updateTime: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型
                        query: [], // 筛选值, 对应上述类型
                        allList: null
                    },
                    followupTime: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型
                        query: [], // 筛选值, 对应上述类型
                        allList: null
                    },
                    createTime: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型
                        query: [], // 筛选值, 对应上述类型
                        allList: null
                    },
                    targetType: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        query: [], // 筛选值, 对应上述类型
                        allList: [
                            { value: 1, label: this.$t('crm.Table.customer') },
                            { value: 2, label: this.$t('crm.Html.contact') },
                            { value: 3, label: this.$t('crm.Table.inquiry') }
                        ]
                    },
                    site: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值, 对应上述类型
                        allList: null
                    }
                },
                queryData: {
                    $and: []
                },
                queryType: 0,
                sortType: '', // 排序方式
                sort: '',
                lang_followup: {
                    followupContent: this.$t('crm.followUpRecord.followUpContent'),
                    companyName: this.$t('crm.followUpRecord.associatedCustomers'),
                    createUser: this.$t('crm.followUpRecord.createUser'),
                    followupType: this.$t('crm.followUpRecord.followUpStatus'),
                    updateTime: this.$t('crm.followUpRecord.updateTime'),
                    followupTime: this.$t('crm.followUpRecord.followUpTime'),
                    createTime: this.$t('crm.followUpRecord.createTime'),
                    targetType: this.$t('crm.followUpRecord.followUpObject'),
                    site: this.$t('crm.followUpRecord.address')
                },
                // 编辑列表显示相关
                visible_edit_columns: false,
                id_column_show_order: undefined,
                // 保存自定义检索
                columnType: 18,
                // 用户设置过的字段显示长度
                fieldStyle: {},
                reset_header_flag: true,
                allColumns: [
                    {
                        title: this.$t('crm.followUpRecord.followUpContent'),
                        key: 'followupContent',
                        class: 'canClick'
                    },
                    {
                        title: this.$t('crm.followUpRecord.associatedCustomers'),
                        key: 'companyName',
                        class: 'canClick'
                    },
                    {
                        title: this.$t('crm.followUpRecord.createUser'),
                        key: 'createUser'
                    },
                    {
                        title: this.$t('crm.followUpRecord.followUpStatus'),
                        key: 'followupType',
                        formatter: row => {
                            return this.followupTypeFilter(row.followupType);
                        }
                    },
                    {
                        title: this.$t('crm.followUpRecord.updateTime'),
                        key: 'updateTime',
                        formatter: row => {
                            return row.updateTime ? this.$options.filters.timeFormat(row.updateTime, 'yyyy-MM-dd hh:mm') : '-';
                        }
                    },
                    {
                        title: this.$t('crm.followUpRecord.followUpTime'),
                        key: 'followupTime',
                        formatter: row => {
                            return this.$options.filters.timeFormat(row.followupTime, 'yyyy-MM-dd hh:mm');
                        }
                    },
                    {
                        title: this.$t('crm.followUpRecord.createTime'),
                        key: 'createTime',
                        formatter: row => {
                            return this.$options.filters.timeFormat(row.createTime, ' yyyy-MM-dd hh:mm');
                        }
                    },
                    {
                        title: this.$t('crm.followUpRecord.followUpObject'),
                        key: 'targetType',
                        formatter: row => {
                            return this.targetTypeFilter(row.targetType);
                        }
                    },
                    {
                        title: this.$t('crm.followUpRecord.address'),
                        key: 'site'
                    }
                ],
                currentColumns: [],
                headerDisplayItem: [],
                show_import_data: false,
                change_flag_new_followUp: false,
                // 详情相关
                planId: null,
                currentIndex: null,
                // 新建跟进记录相关
                add_followup_modal: false,
                currentCustomer: null,
                recordDetail: null,
                // 新建跟进计划相关
                addFollowupPlanModal: false,
                // 编辑跟进计划相关
                detai: {},
                editDetail: {},
                planDetailTopHeight: 170
            };
        },
        created() {
            // 获取跟进方式数据
            this.getPageSize();
        },
        mounted() {
            this.$store.dispatch('getAllUsers');
            this.$store.dispatch('getFollowUpType');
            this.getSubordinateData();
            // this.handleClick({followupPlanId: 1})
        },
        methods: {
            statusFilter(val) {
                return this.$t(`crm.followUpPlan.listPlanStatus${val}`);
            },
            getSubordinateData() {
                this.$commonApi.getUsersMsgForApp({
                    orgId: this.orgId,
                    userId: this.userId
                }).then(data => {
                    if (data.code === '1') {
                        this.userList = data.data;
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                    }
                });
            },
            setFollowupTypes() {
                this.config_tableFilter.followupType.allList = this.followupTypes;
            },
            handleClick(row, index) {
                // if (this.planId === row.followupPlanId) return;
                this.detai = row;
                this.currentIndex = index;
                this.planId = row.followupPlanId;
                this.currentTab = 'associatedCustomers';
                this.$nextTick(() => {
                    this.planDetailTopHeight = this.$refs.planDetailTop.offsetHeight + 8;
                });
            },
            // 翻页
            pageChange(num) {
                this.currentIndex = null;
                this.curPage = num;
                this.getListData();
            },
            /** 改变表格每页展示数据量 */
            pageSizeChange(size) {
                this.currentIndex = null;
                this.pageSize = size;
                const data = {
                    orgId: this.orgId,
                    userId: this.userId,
                    key: 'followUpPlan',
                    value: size.toString()
                };
                crmCommon.userconfigUpdate(data);
                this.getListData();
            },
            // 初始化表头的筛选项
            init() {
                const expandTemp = [
                    // 'followupContent'
                ];
                this.allColumns = this.allColumns.map((col, index) => {
                    col.show_filter_content = false;
                    col.filtering = false;
                    if (col.key && !expandTemp.includes(col.key)) {
                        col.renderHeader = this.renderHeader_filter(index);
                    }
                    return col;
                });
                const data = {
                    orgId: this.orgId,
                    userId: this.userId,
                    type: this.columnType,
                    parentId: -1,
                    key: 'followUpRecord'
                };
                crmCommon.getCommonConfig(data).then(res => {
                    if (res.code === '1') {
                        if (res.data.fieldOrder) {
                            // 解构数据
                            const { id, showField, fieldStyle } = res.data.fieldOrder;
                            this.id_column_show_order = id;
                            if (typeof showField === 'string') {
                                const fields = showField.split(',');
                                this.headerDisplayItem = fields.filter(item => this.allHeaders.includes(item));
                            } else {
                                this.headerDisplayItem = this.allHeaders;
                            }
                            // 处理字段宽度
                            this.fieldStyle = fieldStyle ? JSON.parse(fieldStyle) : {};
                            Object.entries(this.fieldStyle).forEach(([fieldKey, fieldObj]) => {
                                const column = this.allColumns.find(item => item.key === fieldKey);
                                if (column && fieldObj.width) {
                                    column.width = fieldObj.width;
                                }
                            });
                        } else {
                            this.headerDisplayItem = this.allHeaders;
                        }
                        //  用户当前设置页数 开始
                        if (res.data.userConfig && res.data.userConfig.value) {
                            const size = parseInt(res.data.userConfig.value);
                            this.pageSize = size;
                        } else {
                            this.pageSize = 20;
                            // 没有设置过要 新增下
                            const data = {
                                orgId: this.orgId,
                                userId: this.userId,
                                key: 'followUpPlan',
                                value: this.pageSize.toString()
                            };
                            crmCommon.userconfigAdd(data);
                        }
                        this.getListData();
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                        this.tableLoading = false;
                    }
                });
            },
            getPageSize() {
                this.$util.ajaxJson({
                    url: '/crm/userconfig/get',
                    method: 'POST',
                    data: {
                        orgId: this.orgId,
                        userId: this.userId,
                        key: 'followUpPlan'
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        if (res.data.data.value === null) {
                            const data = {
                                orgId: this.orgId,
                                userId: this.userId,
                                key: 'followUpPlan',
                                value: this.pageSize.toString()
                            };
                            crmCommon.userconfigAdd(data);
                        } else {
                            const size = parseInt(res.data.data.value);
                            this.pageSize = size;
                        }
                    } else {
                        this.pageSize = 20;
                    }
                    this.type_topFilter = 'searchCommon';
                    this.flag_topFilter = !this.flag_topFilter;
                });
            },
            refreshData_filter(type) {
                this.curPage = 1;
                this.queryType = this.getQueryType(type);
                this.getListData();
            },
            refreshData() {
                this.currentIndex = null;
                this.curPage = 1;
                this.getListData();
            },
            changeFollowUp() {
                this.change_flag_new_followUp = !this.change_flag_new_followUp;
                this.getListData();
            },
            getQueryType(type) {
                let queryType = 0;
                if (type === 'mine') {
                    queryType = 1;
                } else if (type === 'subordinatePlan') {
                    queryType = 2;
                } else if (type === 'myCreatePlan') {
                    queryType = 3;
                }
                return queryType;
            },
            /** 获取跟进记录列表 */
            getListData() {
                // 取消之前的表格数据请求
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }
                // this.handleQuerys();
                const data = {
                    orgId: this.orgId,
                    createUserId: Number(this.userId),
                    pageNo: this.curPage,
                    pageSize: this.pageSize,
                    queryType: this.queryType
                };
                const vm = this;
                const cancelToken = new this.$util.axios.CancelToken(function executor(c) {
                    // An executor function receives a cancel function as a parameter
                    vm.cancelFunc = c;
                });
                this.tableLoading = true;
                crmFollowupPlan.getPlanList(data, cancelToken).then(response => {
                    this.tableLoading = false;
                    if (response.code === '1') {
                        this.tableList = response.data.list;
                        this.totalNum = response.data.count;
                        if (!response.data.list.length && this.curPage > 1) {
                            this.curPage--;
                            this.getListData();
                        }
                        if (this.tableList.length) {
                            if (!this.currentIndex) {
                                this.handleClick(this.tableList[0], 0);
                            } else {
                                const tableListLength = this.tableList.length - 1;
                                if (this.currentIndex >= tableListLength) {
                                    this.handleClick(this.tableList[tableListLength], tableListLength);
                                } else {
                                    this.handleClick(this.tableList[this.currentIndex], this.currentIndex);
                                }
                            }
                        }
                    } else {
                        this.$Message.error(response.msg);
                    }
                });
            },
            /** 处理筛选条件 */
            handleQuerys() {
                let a = [];
                switch (this.filtering) {
                    case 'search':
                        a = this.computed_addCondition;
                        break;
                    case 'searchCommon':
                        a = this.common_conditions;
                        break;
                }
                this.queryData.$and = this.computed_sqlList_tableFilter(a);
            },
            computed_sqlList_tableFilter(query) {
                return Object.entries(query).map(([key, val]) => {
                    const temp = {};
                    // 数组型 - 日期型 - 字符串型/国家地区
                    if (val.hasOwnProperty('$or')) {
                        temp.$or = val.$or;
                    } else if (val.hasOwnProperty('$and')) {
                        const timeArr = val.$and;
                        if (timeArr[0] && timeArr[1] && timeArr[0][key].$gte && timeArr[1][key].$lte) {
                            timeArr[0][key].$gte = this.$options.filters.timeFormat(timeArr[0][key].$gte);
                            timeArr[1][key].$lte = `${this.$options.filters.timeFormat(timeArr[1][key].$lte)} 23:59:59.999`;
                        }
                        temp.$and = timeArr;
                    } else {
                        temp[key] = val;
                    }
                    return temp;
                });
            },
            createPlan() {
                this.editDetail = null;
                this.addFollowupPlanModal = true;
                // 编辑跟进计划相关
            },
            // 关联客户跳详情 允许跳到公海客户详情页
            async jumpToDetail(item) {
                const authorized = await this.isHaveAuthority({
                    type: 'Customer',
                    id: item.id
                });
                if (!authorized) {
                    return;
                }
                window.open(this.$router.resolve({
                    name: 'companyDetail',
                    query: {
                        companyId: item.id
                    }
                }).href, '_blank');
            },
            // 新建跟进
            async createFolloUp(item) {
                const authorized = await this.isHaveAuthority({
                    type: 'Customer',
                    id: item.id
                });
                if (!authorized) {
                    return;
                }
                if (authorized === 'highseas') {
                    this.$Message.error(this.$t('crm.followUpPlan.authorityTip'));
                    return;
                }
                this.recordDetail = null;
                this.currentCustomer = {
                    companyId: item.id,
                    companyName: item.companyName
                };
                this.add_followup_modal = true;
            },
            // 编辑跟进
            editFollowup(item) {
                // 后端用的app返回的跟进记录列表， 字段key 及字段值有缺失，单独请求下跟进记录详情
                crmFollowupRecord.getFollowupById({ followupId: item.id }).then(res => {
                    if (res.code === '1') {
                        const data = res.data;
                        let pictures = [];
                        const resData = [];
                        if (data.pictures) {
                            pictures = JSON.parse(data.pictures);
                            if (pictures && pictures.length) {
                                pictures.forEach(item => {
                                    let obj = {};
                                    if (item.indexOf('?') > 0) {
                                        obj = {
                                            url: item.substring(0, item.indexOf('?')),
                                            name: Utils.getQueryVariable(item, 'name'),
                                            size: Utils.getQueryVariable(item, 'size'),
                                            type: Utils.getQueryVariable(item, 'type')
                                        };
                                    } else {
                                        obj = {
                                            url: item.substring(0, item.indexOf('?')),
                                            size: 0,
                                            name: this.$t('messageReport.unknown'),
                                            type: 'image'
                                        };
                                    }
                                    resData.push(obj);
                                });
                            }
                        }
                        data.pictures = resData;
                        data.attachment = data.attachment ? JSON.parse(data.attachment) : [];
                        this.recordDetail = data;
                        this.add_followup_modal = true;
                    }
                });
            },
            // 导出
            // exportData() {
            //     window.open(`${this.$util.ajaxUrl}/crm-transfer/followupDownloadOrUpload/exportExcel?orgId=${this.orgId}&userId=${this.userId}&orderColumn=${this.sort}&orderType=${this.sortType}&companyName=${this.companyName}&createUserId=${this.type === 2 ? this.userId : this.createUserId}&listType=${this.type}&query=${this.queryData.$and.length ? encodeURIComponent(JSON.stringify(this.queryData)) : ''}`, '_blank');
            // },
            editPlan() {
                this.editDetail = this.$deepClone(this.detai);
                this.addFollowupPlanModal = true;
            },
            deleteConfirm() {
                this.$confirm(this.$t('crm.followUpPlan.deleteFollowUpTip'), this.$t('crm.Html.delete'), {
                    okButtonText: this.$t('crm.Html.modal_ok'),
                    cancelButtonText: this.$t('crm.Html.modal_cancel')
                }).then(() => {
                    crmFollowupPlan.delPlan({
                        orgId: this.orgId,
                        updateUserId: this.userId,
                        id: this.detai.followupPlanId
                    }).then(response => {
                        if (response.code === '1' && response.data) {
                            this.$Message.success(this.$t('crm.UniSet.success_delete'));
                            this.getListData();
                        } else {
                            this.$Message.error(this.$t('crm.UniSet.error_delete'));
                        }
                    });
                });
            }
        },
        watch: {
            followupTypes: {
                handler(val) {
                    if (val) {
                        // 设置全部人员列表以供筛选
                        this.setFollowupTypes();
                    }
                }
            }
        },
        beforeDestroy() { }
    };
</script>
<style lang="less">
    .followUp_plan {
        .followUp_plan-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 52px;
            padding: 8px 30px 8px 20px;
            background: #fff;
            box-shadow: 0 2px 8px 0 rgba(0,0,0,.1);
            border-radius: 4px 0 0 4px;
            margin-bottom: 8px;
            .followUp_plan_left {
                width: 80%;
                margin-top: 4px;
            }
            .switch-title {
                font-size: 16px;
                color: #2d2f2e;
                cursor: pointer;
                font-weight: 500;

                .switch-title-icon{
                    margin-left: 6px;
                }
            }
            .table-operate-btns{
                position: relative;
                .newCreate-btn-group {
                    button {
                        font-size: 14px;
                        color: #fff;
                    }
                }
            }
        }
        .followUpPlanBox {
            padding-right: 16px;
            display: flex;
            justify-content: space-between;
            .followUpPlanList {
                width: 390px;
                margin-right: 8px;
                background: #fff;
                border-radius: 4px;
                box-shadow: 0 2px 8px 0 rgba(0,0,0,.1);
                .plan-list {
                    padding: 8px 20px;
                    cursor: pointer;
                    &:hover {
                        background: #FFF7F2;
                    }
                    p {
                        color: rgba(0, 0, 0, 0.8);
                        line-height: 18px;
                        font-size: 12px;
                        margin-bottom: 2px;
                    }
                    .plan-title {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        line-height: 22px;
                        .planTitle {
                            font-size: 14px;
                            width: 75%;
                            overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                        }
                        .planStatus {
                            color: #999999;
                            text-align: right;
                        }
                        .inprogress {
                            color: #FF752A;
                        }
                        .completed {
                            color: #00CC99;
                        }
                        .overdue{
                            color: #EA4335;
                        }
                    }
                    .plan-time, .plan-person{
                        color: rgba(0, 0, 0, 0.6);
                    }
                    .plan-content {
                        width: 100%;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                }
                .currentList{
                    background: #FFEBE0;
                    &:hover {
                        background: #FFF7F2;
                    }
                }
                .small-page{
                    width: 100%;
                    padding: 5px 0;
                    background: #fff;
                    border-top: #EAEAEA solid 1px;
                    text-align: center;
                }
            }
            .followUpPlanDetailBox {
                width: calc(100% - 398px);
                height: 100%;
                .plan-detail-top {
                    padding: 16px 20px 20px;
                    background: #fff;
                    margin-bottom: 8px;
                    font-size: 14px;
                    line-height: 18px;
                    color: rgba(0, 0, 0, 0.8);
                    border-radius: 4px;
                    box-shadow: 0 2px 8px 0 rgba(0,0,0,.1);
                    .plan-detail-title {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 12px;
                        .el-button--small {
                            height: 28px;
                            padding: 6px 10px;
                        }
                        .title {
                            display: flex;
                            align-items: center;
                            width: 80%;
                            p {
                                line-height: 20px;
                                width: calc(100% - 48px);
                                overflow: hidden;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                            }
                        }
                    }
                    .plan-detail {
                        margin-bottom: 12px;
                        p {
                            margin-bottom: 12px;
                            font-size: 12px;
                            line-height: 14px;
                            color: rgba(0, 0, 0, 0.6);
                        }
                    }
                    .plan-detail-content{
                        max-height: 66px;
                        line-height: 22px;
                        overflow-y: auto;
                        font-size: 14px;
                        color: rgba(0, 0, 0, 0.8);
                        white-space: pre-wrap;
                    }
                }
                .plan-detail-tabs{
                    // height: calc(100% - 166px);
                    padding: 0px 20px 20px;
                    border-radius: 4px;
                    background: #fff;
                    box-shadow: 0 2px 8px 0 rgba(0,0,0,.1);
                    .el-tabs__nav-wrap:after {
                        display: none;
                    }
                    .followUpPlan-component {
                        position: relative;
                        height: calc(100% - 41px);
                        overflow-y: auto;
                    }
                }
            }
            .noDataList{
                display: flex;
                align-items: center;
                flex-direction: column;
                justify-content: center;
                width: 100%;
                height: 100%;
                text-align: center;
                font-size: 12px;
                line-height: 18px;
                color: rgba(0, 0, 0, 0.8);
                img {
                    display: block;
                    width: 354px;
                }

            }
        }
    }
    .canClick span{
        color: #3B78DE;
        cursor: pointer;
    }
    .custom-file-download-border{
        margin: 0 8px 0 20px;
        height: 30px;
        padding: 0 8px;
        border: 1px solid #ABBFD5;
        border-radius: 4px;
    }
    .followupContent_flex {
        display: flex;
        justify-content: space-between;
        align-items: center;
        span{
            width: calc(100% - 20px);
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: normal;
        }
    }
</style>
