<template>
    <div>
        <Modal
            :visible="visible"
            :title="$t('clue.transfer_clue')"
            :modal-append-to-body='false'
            width="540px"
            class="modal"
            @close="close">
                <div v-if="selectLength">{{ $t('clue.transferClueTip1')}}{{selectLength}}{{$t('clue.transferClueTip2')}}{{this.clueIds.length}}{{$t('clue.transferClueTip3')}}</div>
                <p class="layermain" style="margin:20px 0 10px 0;text-align: center;">
                    {{$t('clue.transfer_to')}}
                    <Select
                        v-model="saleId"
                        filterable
                        style="width:200px;margin-left:10px;text-align: left;"
                        @change="saleSelect">
                            <Option
                                v-for="item in salesList"
                                :value="item.id"
                                :key="item.id"
                                :label="item.fullname">
                            </Option>
                    </Select>
                </p>
                <div slot="footer">
                    <Button @click="cancelTransfer">{{$t('clue.cancel')}}</Button>
                    <Button
                        type="primary"
                        class="piwik_transferClue"
                        :class="confirmClass"
                        @click="confirmTransfer"
                        :loading="confirmTransferLoading">
                            {{$t('clue.confirm')}}
                    </Button>
                </div>
        </Modal>
    </div>
</template>

<script>
    import { crmClue } from '@/api/crm';
    import { mapState } from 'vuex';
    export default {
        name: 'transferClue',
        props: [
            'visible',
            'clueIds',
            'createUserId',
            'serviceId',
            'confirmClass',
            'selectLength'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userName: 'userName',
                userId: 'userId',
                fullName: 'fullName',
                salesList: state => state.crm.salesList
            })
        },
        data() {
            return {
                confirmTransferLoading: false, // 确认转移按钮点击时增加loading
                saleId: '',
                saleName: ''
            };
        },
        methods: {
            // 选择要转移的销售人员
            saleSelect(data) {
                this.salesList.forEach(item => {
                    if (data === item.id) {
                        this.saleName = (item.fullname).trim();
                    }
                });
            },
            close() {
                this.$emit('update:visible', false);
            },
            // 取消转移线索，数据重置为空
            cancelTransfer() {
                this.saleId = '';
                this.saleName = '';
                this.$emit('update:visible', false);
            },
            // 确认转移
            confirmTransfer() {
                // 确认要转移的销售是否为空
                if (this.saleId === '') {
                    this.$Message.info(this.$t('clue.select_transer'));
                    return false;
                }
                this.confirmTransferLoading = true;
                const dataJson = {
                    orgId: this.enterpriseId,
                    ids: this.clueIds.join(','),
                    saleId: this.saleId,
                    saleName: this.saleName,
                    editUserId: this.userId,
                    editUser: this.fullName
                };
                // 调接口更新数据
                crmClue.transfer(dataJson).then(res => {
                    if (res.code === '1') {
                        // 分发一个提醒事件
                        this.$emit('invoking', {
                            data: {
                                saleId: this.saleId,
                                createUserId: this.createUserId,
                                serviceId: this.serviceId
                            },
                            id: this.clueIds.join(','),
                            effectActionType: '3'
                        });
                        // 改变模态框显示与隐藏
                        this.$emit('update:visible', false);
                        // 转移成功
                        this.$emit('chownSuccess');
                        // 在详情页转移线索之后要更新数据
                        this.$emit('updateClueData');
                        // 重置数据为空
                        this.saleId = '';
                        this.saleName = '';
                        if (this.selectLength) {
                            this.$Message.success(this.$t('clue.transfer_success1') + this.clueIds.length + this.$t('clue.transfer_success2'));
                        } else {
                            this.$Message.success(this.$t('clue.transfer_success'));
                        }
                    } else {
                        this.$Message.error(this.$t('clue.transfer_failed'));
                    }
                    this.confirmTransferLoading = false;
                }).catch(error => {
                    console.log(error);
                    this.confirmTransferLoading = false;

                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error(this.$t('clue.transfer_failed'));
                    }
                });
            }
        }
    };
</script>

<style scoped>

</style>
