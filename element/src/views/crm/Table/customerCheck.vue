<template>
    <div class="checkContainer">
        <div class="check_container_bg">
            <!-- 头部搜索框 -->
            <div class="titleSearch">
                <Input v-model="searchName"
                    class="searchInput"
                    clearable
                    @input="searchChange"
                    @blur="searchLimit"
                    @clear="clearList"
                    @keyup.enter.native="getSearchList"
                    maxlength="200"
                    :placeholder="$t('crm.checkRepeat.placeholder')"></Input>
                <Button type="primary" class="searchBtn piwik_crm_customer_check_button" @click="getSearchList">{{ $t('crm.checkRepeat.checkBtn')}}</Button>
            </div>
            <div class="checkContent">
                <!-- 初始显示的搜索图片 -->
                <img src="@/images/searchDefault.png" alt="" v-if="searchFlag">

                <!-- 查重数据为空 -->
                <div v-if="!searchFlag && !searchDataList.length" class="checkEmpty">
                    <p class="checkResultTip">{{$t('crm.checkRepeat.searchReultTip')}} {{searchName | ellipsis }} {{$t('crm.checkRepeat.searchReultTip_')}}</p>
                    <p class="checkResultText">{{$t('crm.checkRepeat.searchReultTip1')}}</p>
                    <p class="checkResultText">1、{{$t('crm.checkRepeat.searchReultTip2')}}</p>
                    <p class="checkResultText">2、<span @click="newCreate()">{{$t('crm.checkRepeat.newCustomer')}}</span></p>
                </div>

                <!-- 查重显示 -->
                <div class="checkList" v-if="!searchFlag && searchDataList.length">
                    <h3>{{$t('crm.checkRepeat.searchReultText')}}<span>{{$t('crm.checkRepeat.searchReultText1')}}</span></h3>
                    
                    <Table
                        :data="searchDataList"
                        :height="tableHeight"
                        ref="multipleTable"
                        :isCustom="true"
                        :border="true"
                        v-loading="loading"
                        :row-class-name="getRowClassName"
                        class="tabmain noBoxShadow-right noborder-table resizable-table"
                        >
                        <TableColumn
                                v-for="(item, index) in currentColumns"
                                :width="item.width"
                                :min-width="item.minWidth || 64"
                                :key="index"
                                :prop="item.key"
                                :label="item.title"
                                :show-overflow-tooltip="true"
                        >
                            <template slot-scope="scope">
                                <template v-if="item.key === 'createTime'">
                                    <span>{{ scope.row.createTime | timeFormat }}</span>
                                </template>
                                <template v-else-if="item.key === 'companyName'">
                                    <span class="listName" @click="goToCompanyDetail(scope.row)">{{scope.row.companyName}}</span>
                                </template>
                                <template v-else>
                                    <span>
                                        {{ scope.row[item.key] ? scope.row[item.key] : '-' }}
                                    </span>
                                </template>
                            </template>
                        </TableColumn>
                    </Table>
                </div>
            </div>
        </div>

        <!-- 新建客户 -->
        <NewCompany :visible.sync="newCompanyShow"
                    type="customer"
                    :mailAddress.sync="mailAddress"
                    @refreshData="getSearchList"></NewCompany>
    </div>
</template>
<script>
    import NewCompany from '@/views/crm/Detail/Components/Modal/fixed-modal-form/create-company';
    import { mapState, mapGetters } from 'vuex';
    import { crmCustomerCheck } from '@/api/crm';
    export default {
        name: 'customerCheck',
        components: { NewCompany },
        data() {
            return {
                loading: false,
                searchFlag: true,
                searchDataList: [],
                newCompanyShow: false,
                mailAddress: '',
                searchName: '',
                currentColumns: [
                    {
                        title: this.$t('crm.Table.col_companyName'),
                        key: 'companyName'
                    },
                    {
                        title: this.$t('crm.Table.col_customerNumber'),
                        key: 'autoSeq'
                    },
                    {
                        title: this.$t('crm.checkRepeat.owner'),
                        key: 'rightUser'
                    },
                    {
                        title: this.$t('crm.Table.col_createTime'),
                        key: 'createTime'
                    },
                    {
                        title: this.$t('crm.Table.col_notFollowedDays'),
                        key: 'notFollowedDays'
                    },
                    {
                        title: this.$t('crm.Table.col_followUp'),
                        key: 'followUp'
                    }
                ]
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                window_height: 'window_height'
            }), // 从 vuex 中获取属性,
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            tableHeight() {
                return this.window_height - 234;
            }
        },
        filters: {
            ellipsis(value) {
                if (!value) {
                    return '';
                }
                if (value.length > 30) {
                    return `${value.slice(0, 30)}...`;
                }
                return value;
            },
            rightUserFilter(value) {
                if (value.charAt(value.length - 1) === ',') {
                    return value.substr(0, value.length - 1);
                } else {
                    return value;
                }
            }
        },
        created() {
            // 获取全部销售人员
            this.$store.dispatch('getSalesList');
            this.$store.dispatch('getSelectOptions');
        },
        mounted() {
        },
        methods: {
            searchLimit() {
                if (this.searchName.length > 200) {
                    return this.$Message.error('搜索内容超出最大字符数 200');
                }
            },
            /* 新建客户 */
            newCreate() {
                this.newCompanyShow = true;
            },
            getSearchList() {
                if (!this.searchName.length) {
                    return this.$Message.error('搜索内容不能为空');
                }
                if (this.searchName.length > 200) {
                    return this.$Message.error('搜索内容超出最大字符数 200');
                }
                if (this.loading) {
                    return;
                }
                this.loading = true;
                crmCustomerCheck.searchCompanyListForCrm({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    searchContent: this.searchName
                }).then((res) => {
                    this.searchDataList = res || [];
                    this.searchFlag = false;
                    this.loading = false;
                }).catch((e) => {
                    console.log('e', e);
                    this.loading = false;
                });
            },
            // 跳转客户详情
            async goToCompanyDetail({ companyId }) {
                // 判断是否有"我的客户"页面权限
                if (!this.isContainsMenu('myCustomer')) {
                    // 没有"我的客户"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                    return;
                }

                // 查询该公司 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Customer',
                    id: companyId
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 公海客户, 检查是否有"公海客户"页面权限
                if (authorized === 'highseas') {
                    // 判断是否有"公海客户"页面权限
                    if (!this.isContainsMenu('highseasCustomer')) {
                        // 没有"公海客户"页面权限, 弹出提示
                        this.$Message.warning(this.$t('crm.Modal.error_haveNoPermissionHighseasCustomer'));
                        return false;
                    }
                }

                // 否则直接新窗口打开新客户详情页
                this.$viewCustomer(companyId);
            },
            clearList() {
                this.searchDataList = [];
                this.searchFlag = true;
            },
            searchChange(val) {
                if (!val) {
                    this.clearList();
                }
            },
            // 指定表格行 class name
            getRowClassName({ row, rowIndex }) {
                if (rowIndex % 2 === 0) {
                    return 'one_row_background';
                } else if (rowIndex % 2 === 1) {
                    return 'pair_row_background';
                }
                return '';
            }
        },
        watch: {

        }
    };
</script>
<style scoped lang="less">
    .checkContainer{
        padding-left: 12px;
        padding-top: 12px;
        background: #F5F6F9;
        height: 100%;
        .check_container_bg{
            background: #fff;
            box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
            border-radius: 4px 0 0 4px;
            height: 100%;
        }
        .checkContent{
            height: calc(100% - 100px);
            overflow: hidden;

            img{
                width: 408px;
                height: 160px;
                display: block;
                margin: 210px auto 0;
            }
        }
        .titleSearch{
            padding: 30px 190px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .searchInput{
                display: inline-block;
                margin-right: 30px;
                width: calc(100% - 130px);
            }

            .searchBtn{
                // width: 100px;
                height: 40px;
            }
        }

        .checkList{
            height: 100%;
            h3{
                color: rgba(0, 0, 0, 0.8);
                font-family: PingFang SC;
                font-style: normal;
                font-weight: 500;
                font-size: 16px;
                line-height: 24px;
                margin: 30px 0 20px 30px;

                span{
                    font-size: 12px;
                    font-style: normal;
                    font-weight: normal;
                    font-size: 12px;
                    color: rgba(0, 0, 0, 0.4);
                    margin-left: 8px;
                }
            }

            .listName{
                color: #3B78DE;
                font-family: PingFang SC;
                font-size: 14px;
                cursor: pointer;
                font-weight: bold;
            }

            /deep/ table{
                .pair_row_background{
                    background: #fff;
                }

                .one_row_background{
                    background: #F7F8F9;
                }
            }

            /deep/ .el-table--border th{
                .cell{
                    font-size: 14px;
                    color: #333;
                }
            }

            /deep/ .el-table--border td{
                .cell{
                    font-size: 14px;
                    color: #333;
                }
            }

            /deep/.el-table--enable-row-hover .el-table__body tr:hover > td{
                background-color: #F3F4F5;
            }

            /deep/ .el-table--border td:first-child{
                .cell{
                    padding-left: 30px;
                }
            }

            /deep/ .el-table--border th:first-child{
                .cell{
                    padding-left: 30px;
                }
            }

            .resizable-table.noborder-table {
                /deep/ th:hover {
                border-right: 2px solid #ebeef5;
                }
            }
        }

        .checkEmpty{
            width: 260px;
            margin: 63px auto 0;

            .checkResultTip{
                font-family: PingFang SC;
                font-size: 16px;
                line-height: 24px;
                color: rgba(0, 0, 0, 0.4);
                margin-bottom: 24px;
            }

            .checkResultText{
                font-family: PingFang SC;
                font-size: 14px;
                line-height: 24px;
                color: rgba(0, 0, 0, 0.8);
                margin-bottom:8px;

                span{
                    color: #3B78DE;
                    cursor: pointer;
                }
            }
        }
    }
</style>
<style lang="less">
    .checkContainer{
        .titleSearch{
            .searchInput{
                .el-input__inner{
                    height: 40px;
                }
            }
        }
    }
</style>
