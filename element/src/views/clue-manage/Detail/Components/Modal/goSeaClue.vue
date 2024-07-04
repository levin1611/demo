<template>
    <div>
        <Modal
            :visible="visible"
            :title="$t('clue.go_sea')"
            :modal-append-to-body='false'
            width="540px"
            class="modal"
            @close="close">
                <p style="margin:20px 0 10px 0;">
                    {{ $t('clue.goSeaTip').replace(/\$field/g, selectIds.length) }}
                </p>
                <div slot="footer">
                    <Button @click="close">{{$t('clue.cancel')}}</Button>
                    <Button
                        type="primary"
                        class="piwik_transferClue"
                        @click="throwToPublicSea"
                        :loading="confirmToSeaLoading">
                            {{$t('clue.confirm')}}
                    </Button>
                </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmClue } from '@/api/crm';
    export default {
        name: 'goSeaClue',
        props: [
            'visible',
            'selectIds'
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
                confirmToSeaLoading: false // 确认转移按钮点击时增加loading
            };
        },
        methods: {
            close() {
                this.$emit('update:visible', false);
            },
            /* 退入公海 */
            throwToPublicSea() {
                this.confirmToSeaLoading = true;
                const data = {
                    orgId: this.enterpriseId,
                    ids: this.selectIds.join(','),
                    saleId: -1,
                    saleName: this.$t('clue.public_sea'),
                    editUserId: this.userId,
                    editUser: this.fullName
                };
                crmClue.transfer(data).then(response => {
                    if (response.code === '1') {
                        this.$emit('update:visible', false);
                        // 批量退入公海之后要更新数据
                        this.$emit('chownSuccess');
                        this.$Message.success(this.$t('clue.gosea_success'));
                    } else {
                        this.$Message.error(this.$t('clue.gosea_failed'));
                    }
                    this.confirmToSeaLoading = false;
                }).catch(error => {
                    console.log(error);
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error(this.$t('clue.gosea_failed'));
                    }
                    this.confirmToSeaLoading = false;
                });
            }
        }
    };
</script>

<style scoped>

</style>
