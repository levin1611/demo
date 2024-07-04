<template>
    <div>
        <Modal :title="$t('crm.Modal.title_distributeCustomer')"
               :visible="visible"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               @close="handleModalClose"
               width="520px">
            <div class="distribute-customer-content">
                <div class="distribute-customer-sales" v-if="!partOfDistributeSuccess">
                    {{$t('clue.select_sales')}}
                    <Select filterable :placeholder="$t('crm.Modal.tip_select')" v-model="saleId"
                            style="width:230px;margin-left: 20px" @change="handleSaleChange">
                        <Option v-for="item in salesList" :value="item.id" :label="item.fullname">
                        </Option>
                    </Select>
                </div>
                <Spin fix v-if="isAllowanceLoading"></Spin>
                <div class="distribute-customer-sales-tips" v-if="!partOfDistributeSuccess && saleId && distributeAllowance !== -1000">
                    <span>{{saleName}}</span>
                    <span>{{$t('crm.Modal.batchDistributeTip1')}}</span>
                    <span class="distribute-customer-detail-red"> {{distributeAllowance}} </span>
                    <span>，{{$t('crm.Modal.batchDistributeTip2')}}</span>
                    <br/>
                    <span>{{`${saleName}${$t('crm.Modal.batchDistributeTip3')}`}}</span>
                </div>
                <div class="distribute-customer-sales-tips" v-else-if="!partOfDistributeSuccess && saleId && distributeAllowance === -1000">{{`${saleName}${$t('crm.Modal.batchDistributeTip4')}`}}</div>
                <div v-if="partOfDistributeSuccess" class="distribute-failed-content">
                    <div>
                        <span>{{$t('crm.Modal.batchDistributeCount')}}</span>
                        <span class="distribute-customer-detail"> {{ids.length}} </span>
                        <span>{{$t('crm.Modal.item')}}，</span>
                        <span>{{$t('crm.Modal.batchOperateSuccess')}}</span>
                        <span class="distribute-customer-detail"> {{ids.length - Number(computed_distribute_failed)}} </span>
                        <span>{{$t('crm.Modal.item')}}，</span>
                        <span>{{$t('crm.Modal.batchOperateError')}}</span>
                        <span class="distribute-customer-detail-red"> {{Number(computed_distribute_failed)}} </span>
                        <span>{{$t('crm.Modal.item')}}</span>
                    </div>
                </div>
                <div v-if="distributeFailedList.length">
                    <div v-for="(item, index) in distributeFailedList" :key="index">
                        <span>{{`${item.type === '1' ? item.list[0].errorContent : getDistributeFailedReason(item.type)}（${item.list.length}）`}}</span>
                        <span class="show-more" @click="item.isShow = !item.isShow">
                            {{item.isShow ? $t('distribution.takeUp'): $t('crm.Modal.details')}}
                            <Icon :class="item.isShow ? 'opened' : ''" size="12" custom="custom custom-show-more"></Icon>
                        </span>
                        <ul class="distribute-failed-list" v-if="item.isShow">
                            <li :title="subItem.companyName" v-for="subItem in item.list" class="distribute-failed-item ellipsis"  :key="subItem.companyId">{{subItem.companyName}}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div slot="footer">
                <Button v-if="!partOfDistributeSuccess" @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button class="piwik-crm-distribute-customer" :loading="distributeLoading" type="primary" @click="ok">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmCommon } from '@/api/crm/index';

    export default {
        name: 'BatchDistributeCustomer',
        props: [
            'visible',
            'ids'
        ],
        data() {
            return {
                distributeLoading: false, // 正在执行分配操作
                distributeAllowance: -1, // 指定负责人可分配的客户余量
                partOfDistributeSuccess: false, // 部分分配成功
                distributeFailedList: [], // 未分配成功的客户列表
                isShowDistributeFailedList: false, // 是否展开分配失败的客户列表
                saleId: '', // 当前选中的销售人员id
                saleName: '', // 当前选中的销售人员姓名
                isAllowanceLoading: false // 正在获取可认领客户余量
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                salesList: state => state.crm.salesList
            }),
            computed_distribute_failed() {
                const failedLength = this.distributeFailedList.reduce((prev, curr) => {
                    return prev + curr.list.length;
                }, 0);
                return failedLength;
            }
        },
        created() {
            // 获取全部销售人员
            !this.salesList.length && this.$store.dispatch('getSalesList');
            // this.getSalesList();
        },
        methods: {
            // 分配公海询盘
            ok() {
                if (!this.saleId) {
                    this.$Message.warning(this.$t('crm.Modal.saleEmptyWarning'));
                    return false;
                }
                if (!this.partOfDistributeSuccess) {
                    this.distributeLoading = true;
                    crmCommon.batchClaim({
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        operateUserName: this.fullName,
                        operateUserId: this.userId,
                        companyIdList: this.ids,
                        claimUserId: this.saleId,
                        claimUserName: this.saleName
                    }).then(response => {
                        this.distributeLoading = false;
                        if (response.code === '0' && Object.keys(response.data).length) {
                            this.partOfDistributeSuccess = true;
                            const tempArr = [];
                            for (const key in response.data) {
                                const obj = {};
                                obj.type = key;
                                obj.isShow = false;
                                obj.list = response.data[key];
                                tempArr.push(obj);
                            }
                            this.distributeFailedList = tempArr;
                        } else if (response.code === '1') {
                            this.$Message.success(this.$t('crm.Modal.success_distributeCustomer'));
                            this.$emit('update:visible', false);
                            this.$emit('refreshData');
                        } else {
                            const str = response.message === '' ? this.$t('crm.Modal.error_distributeCustomer') : response.message;
                            this.$Message.error(str);
                            this.$emit('update:visible', false);
                            this.$emit('refreshData');
                        }
                    }).catch((error) => {
                        console.log(error);
                        this.$Message.error('操作失败，请重试！');
                        this.distributeLoading = false;
                    });
                } else {
                    this.$emit('update:visible', false);
                    this.$emit('refreshData');
                }
            },
            cancel() {
                this.$emit('update:visible', false);
            },
            async handleSaleChange(saleId) {
                this.isAllowanceLoading = true;
                const temp = this.salesList.find(item => item.id === saleId);
                this.saleName = temp && temp.fullname ? temp.fullname : '';
                this.distributeAllowance = await this.getCustomerAllowance();
            },
            /* 获取指定负责人可以认领客户的余量 */
            getCustomerAllowance() {
                return new Promise((resolve) => {
                    crmCommon.getUserRemainLimitCount({
                        orgId: this.enterpriseId,
                        userId: this.saleId
                    }).then(res => {
                        this.isAllowanceLoading = false;
                        if (res.code === '1') {
                            if (res.data.userRemainLimit === 'true') {
                                resolve(res.data.userRemainLimitCount);
                            } else {
                                /* 如果用户未设置客户上限，则此处返回-1000，代表未设置上限 */
                                resolve(-1000);
                            }
                        }
                    });
                });
            },
            getDistributeFailedReason(distributeFailedType) {
                switch (distributeFailedType) {
                    case '1':
                        return this.$t('crm.Modal.batchOperateFailReason1');
                    case '2':
                        return this.$t('crm.Modal.batchOperateFailReason2');
                    case '3':
                        return this.$t('crm.Modal.batchOperateFailReason3');
                }
            },
            handleModalClose() {
                this.distributeAllowance = -1;
                this.partOfDistributeSuccess = false;
                this.distributeFailedList = [];
                this.isShowDistributeFailedList = false;
                this.saleId = '';
            }
        }
    };
</script>
<style lang="less" scoped>
    .distribute-customer-content {
        font-size:14px;
        color: rgba(0, 0, 0, .8);
        .distribute-customer-sales {
            height: 68px;
            line-height: 68px;
            padding-left: 32px;
        }
        .distribute-customer-sales-tips {
            padding-left: 32px;
            font-size: 12px;
        }
        .distribute-failed-content {
            margin-bottom: 10px;
        }
        .show-more{
            float: right;
            font-weight: normal;
            font-size: 12px;

            color: #3b78de;
            cursor: pointer;
            i{
                color:rgba(0,0,0,0.40);
                transition: transform .2s ease-in-out,-webkit-transform .2s ease-in-out;
                transform: scale(0.8);
                &.opened{
                    transform: rotate(180deg) scale(0.8);
                }
            }
            &:hover {
                color: #2d63bc;
                text-decoration: underline;
            }
        }
        .distribute-failed-list {
            max-height: 300px;
            overflow: auto;
            .distribute-failed-item {
                font-size: 12px;
                text-align: left;
                color: rgba(0, 0, 0, .6);
                border-bottom: 1px solid #eaeaea;
                line-height: 36px;
            }
        }
        .distribute-customer-detail {
            font-weight: 700;
        }
        .distribute-customer-detail-red {
            font-weight: 700;
            color: #ea4335;
        }
    }
</style>
