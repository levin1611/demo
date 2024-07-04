<template>
    <div>
        <Modal :title="$t('crm.Modal.title_claimCustomer')"
               :visible="visible"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               @close="handleModalClose"
               width="520px">
            <div class="claim-customer-content">
                <!--确定要认领-->
                <!--<span v-text="companyDetail.companyName" style="font-weight:bold;margin:0 5px;"></span>-->
                <!--？-->
                <div v-if="!partOfClaimSuccess">
                    <span>{{`${$t('crm.Modal.batchClaimAllowanceTip1')}${claimAllowance}，${$t('crm.Modal.batchClaimAllowanceTip2')}`}}</span><br/>
                    <span>{{$t('crm.Modal.batchClaimAllowanceTip3')}}</span>
                </div>
                <div v-else class="claim-failed-content">
                    <div>
                        <span>{{$t('crm.Modal.batchClaimCount')}}</span>
                        <span class="claim-customer-detail"> {{ids.length}} </span>
                        <span>{{$t('crm.Modal.item')}}，</span>
                        <span>{{$t('crm.Modal.batchOperateSuccess')}}</span>
                        <span class="claim-customer-detail"> {{ids.length - Number(computed_claim_failed)}} </span>
                        <span>{{$t('crm.Modal.item')}}，</span>
                        <span>{{$t('crm.Modal.batchOperateError')}}</span>
                        <span class="claim-customer-detail-error"> {{Number(computed_claim_failed)}} </span>
                        <span>{{$t('crm.Modal.item')}}</span>
                    </div>
                </div>
                <div v-if="claimFailedList.length">
                    <div v-for="(item, index) in claimFailedList" :key="index">
                        <span>{{`${item.type === '1' ? item.list[0].errorContent : getClaimFailedReason(item.type)}（${item.list.length}）`}}</span>
                        <span class="show-more" @click="item.isShow = !item.isShow">
                        {{item.isShow ? $t('distribution.takeUp'): $t('crm.Modal.details')}}
                        <Icon :class="item.isShow ? 'opened' : ''" size="12" custom="custom custom-show-more"></Icon>
                    </span>
                        <ul class="claim-failed-list" v-if="item.isShow">
                            <li :title="subItem.companyName" v-for="subItem in item.list" class="claim-failed-item ellipsis"  :key="subItem.companyId">{{subItem.companyName}}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div slot="footer">
                <Button v-if="!partOfClaimSuccess" @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button class="piwik_batch_claim_customer" :loading="claimLoading" type="primary" @click="ok">{{ $t('crm.Modal.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmCommon } from '@/api/crm/index';

    export default {
        name: 'BatchClaimCustomer',
        props: [
            'visible',
            'ids',
            'claimAllowance'
        ],
        data() {
            return {
                claimLoading: false, // 正在执行认领操作
                partOfClaimSuccess: false, // 部分认领成功
                claimFailedList: [], // 未认领成功的客户列表
                isShowClaimFailedList: false // 是否展开认领失败的客户列表
            };
        },
        computed: {
            ...mapState([
                'enterpriseId',
                'userId',
                'fullName'
            ]),
            computed_claim_failed() {
                const failedLength = this.claimFailedList.reduce((prev, curr) => {
                    return prev + curr.list.length;
                }, 0);
                return failedLength;
            }
        },
        methods: {
            // 认领公海询盘
            ok(id) {
                if (!this.partOfClaimSuccess) {
                    this.claimLoading = true;
                    // 如果是公海侧滑页，companyIdList则是传参过来的，而不是选中的列表
                    return new Promise(resolve => {
                        crmCommon.batchClaim({
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            operateUserName: this.fullName,
                            operateUserId: this.userId,
                            companyIdList: this.ids,
                            claimUserId: this.userId,
                            claimUserName: this.fullName
                        }).then(response => {
                            this.claimLoading = false;
                            if (response.code === '0' && Object.keys(response.data).length) {
                                this.partOfClaimSuccess = true;
                                const tempArr = [];
                                for (const key in response.data) {
                                    const obj = {};
                                    obj.type = key;
                                    obj.isShow = false;
                                    obj.list = response.data[key];
                                    tempArr.push(obj);
                                }
                                this.claimFailedList = tempArr;
                                if (this.partOfClaimSuccess) {
                                    resolve(false);
                                }
                            } else if (response.code === '1') {
                                this.$Message.success(this.$t('crm.Modal.success_claimCustomer'));
                                this.$emit('update:visible', false);
                                this.$emit('refreshData');
                                resolve(true);
                            } else {
                                const str = response.message === '' ? this.$t('crm.Modal.error_claimCustomer') : response.message;
                                this.$Message.error(str);
                                this.$emit('update:visible', false);
                                this.$emit('refreshData');
                                resolve(true);
                            }
                        }).catch((error) => {
                            console.log(error);
                            this.$Message.error('操作失败，请重试！');
                            this.claimLoading = false;
                        });
                    });
                } else {
                    this.$emit('update:visible', false);
                    this.$emit('refreshData');
                }
            },
            getClaimFailedReason(claimFailedType) {
                switch (claimFailedType) {
                    case '1':
                        return this.$t('crm.Modal.batchOperateFailReason1');
                    case '2':
                        return this.$t('crm.Modal.batchOperateFailReason2');
                    case '3':
                        return this.$t('crm.Modal.batchOperateFailReason3');
                }
            },
            cancel() {
                this.$emit('update:visible', false);
            },
            handleModalClose() {
                this.partOfClaimSuccess = false;
                this.claimFailedList = [];
                this.isShowClaimFailedList = false;
            }
        }
    };
</script>
<style lang="less" scoped>
    .claim-customer-content {
        font-size:14px;
        color: rgba(0, 0, 0, .8);
        .claim-failed-content {
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
        .claim-failed-list {
            max-height: 300px;
            overflow: auto;
            .claim-failed-item {
                font-size: 12px;
                text-align: left;
                color: rgba(0, 0, 0, .6);
                border-bottom: 1px solid #eaeaea;
                line-height: 36px;
            }
        }
        .claim-customer-detail {
            font-weight: 700;
        }
        .claim-customer-detail-error {
            font-weight: 700;
            color: #ea4335;
        }
    }
</style>
