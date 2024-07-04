<template>
    <div class="checkContainer">
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
            <Button type="primary" class="searchBtn" @click="getSearchList">{{ $t('crm.checkRepeat.checkBtn')}}</Button>
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
                <ul v-loading="loading">
                    <li v-for="(item, index) in searchDataList" :key="index">
                        <div class="listContent">
                            <p class="row">
                                {{$t('crm.Table.col_companyName')}}：
                                <Tooltip :content="item.companyName" effect="dark" placement="top">
                                    <span class="listName" @click="goToCompanyDetail(item)">{{item.companyName}}</span>
                                </Tooltip>
                            </p>
                            <p class="row">{{$t('crm.Table.col_customerNumber')}}：{{item.autoSeq}}</p>
                        </div>
                        <div class="listContent">
                            <p class="row">{{$t('crm.Table.col_companyManagers')}}：{{item.rightUser | rightUserFilter}}</p>
                            <p class="row">{{$t('crm.Table.col_createTime')}}：{{item.createTime | timeFormat}}</p>
                            <p class="row">{{$t('crm.Table.col_notFollowedDays')}}：{{item.notFollowedDays}}</p>
                        </div>
                    </li>
                </ul>
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
                searchName: ''
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName'
            }), // 从 vuex 中获取属性,
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ])
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
                const reg = /^[0-9]+.?[0-9]*/;
                let searchName = this.searchName;
                console.log(searchName);
                if (reg.test(this.searchName)) {
                    searchName = searchName.split(' ').join('');
                }
                this.loading = true;
                crmCustomerCheck.searchCompanyListForCrm({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    searchContent: searchName
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
                console.log('authorized', authorized);
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
            }
        },
        watch: {

        }
    };
</script>
<style scoped lang="less">
    .checkContainer{
        padding: 0 190px;
        height: 100%;
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
            padding-top: 60px;
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
                margin-top:43px;
                margin-bottom: 20px;

                span{
                    font-size: 12px;
                    font-style: normal;
                    font-weight: normal;
                    font-size: 12px;
                    color: rgba(0, 0, 0, 0.4);
                    margin-left: 8px;
                }
            }

            ul{
                height: calc(100% - 88px);
                overflow: auto;
            }

            li{
                border-bottom: 1px dashed #EFF0F4;
                margin-bottom: 12px;

                .listName{
                    color: #3B78DE;
                    font-family: PingFang SC;
                    font-size: 14px;
                    cursor: pointer;
                }
                .listContent{
                    margin-bottom:16px;
                    color: rgba(0, 0, 0, 0.8);
                    font-family: PingFang SC;
                    font-size: 12px;
                    line-height: 24px;
                    display: flex;
                    justify-content: start;
                    align-items: center;
                    .row {
                        width: 200px;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
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
