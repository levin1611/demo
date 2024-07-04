<template>
    <Modal :visible="visible"
           :width="batchStatus === 2 ? '800px' : '600px'"
           :close-on-click-modal="false"
           :append-to-body="true"
           :close-on-press-escape="false"
           @close="handleClose" >
        <div slot="title">
            <h3 class="batch_title" v-if="batchStatus === 1">{{$t('facebook.leads.bulkLeadsTitle')}}</h3>
            <h3 class="batch_title" v-else>{{$t('facebook.leads.bulkLeadsTitle0')}}</h3>
        </div>
        <div class="batch_body" :style="batchStatus === 2 ? 'height: 100%' : 'height: 70px'">
            <div class="batch_body_zero" v-if="batchStatus === 0">
                <div class="batch_body_upper">
                    {{$t('facebook.leads.selectRep')}}
                </div>
                <div class="batch_body_bottom">
                    <span class="batch_body_charger">{{$t('facebook.leads.rep')}}</span>
                    <Select v-model="saleSelected" style="margin-left: 50px" size="small">
                        <Option v-for="(item, index) in salesList" :key="index" :value="item.id" :label="item.fullname"></Option>
                    </Select>
                </div>
            </div>
            <div class="batch_body_one" v-if="batchStatus === 1 && $lang==='zh-CN'">
                是否将已勾选的{{selected.length}}条 leads 批量录入为线索并分配给{{selectedName}}？点击【确定】按钮完成批量录入。
            </div>
            <div class="batch_body_one" v-if="batchStatus === 1 && $lang==='en-US'">
                Do you want to enter {{selected.length}} FB leads selected in batches as leads and assign them to {{selectedName}}? Click [OK] button to complete batch entry
            </div>
            <div class="batch_body_two" v-if="batchStatus === 2">
                <div class="batch_body_upper" v-if="$lang === 'zh-CN'">
                    Leads 批量录入线索完成，成功{{successNum}}条，失败<span style="color: #EA4335">{{failureNum}}</span>条
                </div>
                <div class="batch_body_upper" v-if="$lang === 'en-US'">
                    The batch entry of leads is completed, {{successNum}}successful,<span style="color: #EA4335">{{failureNum}}</span> failed
                </div>
                <div class="batch_body_fail_tips">
                    {{$t('facebook.leads.details')}}
                </div>
                <ul class="fail_detail_list">
                    <li v-for="(item, index) in failList" :key="index" class="fail_detail_list_item">
                        {{getFailureInfo(item)}}
                    </li>
                </ul>
            </div>
        </div>
        <div slot="footer">
            <Button @click="handleClose" v-if="batchStatus !== 2">{{$t('facebook.leads.cancel')}}</Button>
            <Button type="primary" @click="changeBatchStatus(1)" v-if="batchStatus === 0">{{$t('facebook.leads.bulkLeads')}}</Button>
            <Button type="primary" @click="handleLeadsEnter" v-if="batchStatus === 1 || batchStatus === 2">{{$t('facebook.leads.confirm')}}</Button>
        </div>
    </Modal>
</template>

<script>
    import { mapState } from 'vuex';
    import util from "../../../../libs/util";
    export default {
        name: 'batchLeads',
        props: ['visible', 'selected'],
        computed: {
            ...mapState({
                orgId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                fullName:state => state.fullName,
                $lang: state => state.app.lang,
                allSalesList: state => state.crm.salesList,
            }),
            selectedName() {
                const temp = this.salesList.find(item => item.id === this.saleSelected);
                return temp.fullname
            }
        },
        data() {
            return {
                saleSelected: '',
                salesList: [],
                isBatchConfirm: false,
                isBatchResult: false,
                batchStatus: 0,
                successNum: null,
                failureNum: null,
                failList: [],
                repeatClick:false
            }
        },
        methods: {
            handleClose() {
                if (this.batchStatus === 1) {
                    this.batchStatus = 0;
                } else {
                    this.$emit('update:visible', false);
                    this.batchStatus = 0;
                    this.$emit('refreshData');
                }
            },
            setSalesList() {
                this.salesList = this.$deepClone(this.allSalesList);
                this.salesList.push({
                    id: -1,
                    fullname: this.$t('chat.highSeas')
                });
                this.saleSelected = Number(this.userId);
            },
            changeBatchStatus(status) {
                this.batchStatus = status;
            },
            handleLeadsEnter() {
                if(this.repeatClick) return;
                this.repeatClick = true;
                if (this.batchStatus === 2) {
                    this.$emit('refreshData');
                    this.handleClose();
                    return false;
                }
                const ids = [];
                this.selected.forEach(item => {
                    ids.push(item.id);
                });
                const postData = {
                    ids: ids,
                    orgId: this.orgId,
                    createUserId: this.userId,
                    createUser: this.fullName,
                    saleId: this.saleSelected,
                    saleName: this.selectedName,
                }
                util.ajaxJson({
                    url: '/form-cust/clue/batchSaveLeads',
                    method: 'post',
                    data: postData
                }).then(res => {
                    if (res.data.code === '1') {
                        if (res.data.data.length === 0) {
                            // 标识全部成功
                            this.successNum = this.selected.length;
                            this.failureNum = 0;
                        } else {
                            const total = this.selected.length;
                            this.failList = res.data.data;
                            this.failureNum = res.data.data.length;
                            this.successNum = total - this.failureNum;
                        }

                    } else {
                        const total = this.selected.length;
                        this.failList = res.data.data;
                        this.failureNum = res.data.data.length;
                        this.successNum = total - this.failureNum;
                    }
                    this.repeatClick = false
                    this.batchStatus = 2;
                })
            },
            getFailureInfo(item) {
                let failReason = '';
                switch (item.reason) {
                    case '1':
                        // 企业不一致
                        failReason = `Lead ID:${item.leadsId}, 【企业】不一致`;
                        break;
                    case '2':
                        // 状态不对
                        failReason = `Lead ID:${item.leadsId}, 【状态】错误`;
                        break;
                    case '3':
                        // 姓名为空
                        failReason = `Lead ID:${item.leadsId}, 【姓名】为空`;
                        break;
                    case '4':
                        // 邮箱格式不正确
                        failReason = `Lead ID:${item.leadsId}, 【邮箱】格式错误`;
                        break;
                    case '5':
                        // 邮箱重复
                        failReason = `Lead ID:${item.leadsId}, 【邮箱】与【${item.seqNumber}】冲突`;
                        break;
                    case '6':
                        // 手机重复
                        failReason = `Lead ID:${item.leadsId}, 【电话】与【${item.seqNumber}】冲突`;
                        break;
                }
                return failReason
            }
        },
        created() {
            // 获取全部销售人员
            this.$store.dispatch('getSalesList');
        },
        mounted() {},
        watch: {
            allSalesList: {
                handler(val) {
                    if(val) {
                        this.setSalesList();
                    }
                }
            }
        }
    }
</script>

<style scoped lang="less">
    .fail_detail_list {
        width: 100%;
        height: 100%;
        max-height: 200px;
        overflow: scroll;
        &_item {
            font-size: 12px;
        }
    }
    .batch_title {
        font-family: PingFangSC-Medium;
        font-size: 18px;
        color: rgba(0,0,0,0.80);
        letter-spacing: 0;
        line-height: 26px;
    }
    .batch_body {
        &_upper {
            margin-bottom: 10px;
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: rgba(0,0,0,0.80);
            letter-spacing: 0;
            line-height: 18px;
        }
        &_charger {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0,0,0,0.80);
            letter-spacing: 0;
            line-height: 18px;
        }
        &_one {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0,0,0,0.80);
            letter-spacing: 0;
            line-height: 18px;
        }
        &_fail_tips {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0,0,0,0.80);
            letter-spacing: 0;
            line-height: 18px;
            margin-bottom: 10px;
        }
    }
</style>
