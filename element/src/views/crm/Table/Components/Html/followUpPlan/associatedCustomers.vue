<template>
    <div class="followUpPlan-component" style="width:52%" v-loading="loading">
        <!-- <div class="progressBox">
            <div class="ready"></div>
            <div></div>
        </div> -->
        <p class="progressTip">{{$t('crm.followUpPlan.progressRate')}} {{progress}}</p>
        <div class="customers-list">
            <div class="list" v-for="item in companyList" :key="item.id">
                <div class="customers-name">
                    <p class="name" @click="jumpToDetail(item)">{{item.companyName}}</p>
                    <p class="type">{{$t('crm.Detail.corp_clientType')}}: {{item.clientType}}</p>
                </div>
                <div class="customers-status">
                    <span v-if="item.followupCustomerStatus === 0" class="writeFollowUp" @click="createFolloUp(item)">{{$t('crm.followUpPlan.writeFollowUp')}}</span>
                    <span v-if="item.followupCustomerStatus === 1" class="finished">{{$t('crm.WorkBench.finishedTask')}}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmFollowupPlan } from '@/api/crm/index';

    export default {
        name: 'associatedCustomers',
        components: {
        },
        props: [
            'planId',
            'change_flag_new_followUp'
        ],
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId'
            })
        },
        data() {
            return {
                loading: true,
                progress: '',
                companyList: []
            };
        },
        methods: {
            // 获取关联客户
            getCompanyList() {
                this.loading = true;
                crmFollowupPlan.planDetailCustomer({
                    orgId: this.orgId,
                    createUserId: this.userId,
                    id: this.planId
                }).then(res => {
                    if (res.code === '1') {
                        this.progress = res.data.progress;
                        this.companyList = res.data.list;
                    }
                    this.loading = false;
                });
            },
            createFolloUp(item) {
                this.$emit('createFolloUp', item);
            },
            jumpToDetail(item) {
                this.$emit('jumpToDetail', item);
            }
        },
        mounted() {
        },
        beforeDestroy() {
        },
        watch: {
            planId: {
                handler(val) {
                    if (val) {
                        this.getCompanyList();
                    }
                },
                immediate: true
            },
            change_flag_new_followUp: {
                handler(val) {
                    this.getCompanyList();
                }
            }

        }
    };
</script>

<style lang="less" scoped>
    .followUpPlan-component {
        .progressBox {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: nowrap;
            div {
                height: 11px;
                flex: 1;
                margin-right: 3px;
                background: #EAEAEA;
            }
            div.ready{
                background: #01BE82;
            }
        }
        .progressTip{
            padding-right: 10px;
            text-align: right;
            font-size: 12px;
            line-height: 22px;
            color: #666;
        }
        .customers-list {
            height: calc(100% - 25px);
            overflow-y: auto;
            .list {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
                .customers-name {
                    max-width: 80%;
                }
                .name {
                    cursor: pointer;
                    color: #3B78DE;
                    font-size: 14px;
                    line-height: 22px;
                    margin-bottom: 4px;
                    &:hover{
                        color: #2d63bc
                    }
                }
                .type {
                    font-size: 12px;
                    line-height: 18px;
                    color: rgba(0, 0, 0, .6);
                }
                .customers-status {
                    padding-right: 10px;
                    span{
                        font-size: 14px;
                        line-height: 22px;
                    }
                    .writeFollowUp {
                        cursor: pointer;
                        color: #3B78DE;
                        &:hover{
                            color: #2d63bc
                        }
                    }
                    .finished {
                        color: #00CC99;
                    }
                }
            }
        }
    }
</style>
