<template>
    <div>
        <Modal
            :visible="visible"
            :title="$t('clue.claim_leads')"
            :show-close="false"
            append-to-body
            width="540px"
            class="modal">
                <p class="layermain" style="margin:20px 0 10px 0;text-align: center;">
                    {{$t('clue.claim_tip')}}
                </p>
                <div slot="footer">
                    <Button  @click="$emit('update:visible', false)">{{$t('clue.cancel')}}</Button>
                    <Button type="primary" @click="confirmClaim" class="high-seas-claim-leads" :loading="confirmClaimLaoding">{{$t('clue.confirm')}}</Button>
                </div>
        </Modal>
    </div>
</template>

<script>
    import { crmClue } from '@/api/crm';
    import { mapState } from 'vuex';
    export default {
        name: 'claimClue',
        props: [
            'visible',
            'clueId'
        ],
        computed: {
            ...mapState([
                'userName',
                'fullName',
                'userId',
                'enterpriseId'
            ])
        },
        data() {
            return {
                confirmClaimLaoding: false
            };
        },
        methods: {
            /* 认领客户 */
            confirmClaim() {
                this.confirmClaimLaoding = true;
                crmClue.transfer({
                    orgId: this.enterpriseId,
                    ids: this.clueId,
                    saleId: this.userId,
                    saleName: this.fullName,
                    editUserId: this.userId,
                    editUser: this.fullName
                }).then(response => {
                    if (response.code === '1') {
                        this.$emit('update:visible', false);
                        this.$emit('chownSuccess');
                        this.$Message.success(this.$t('clue.claim_success'));
                        // 通知事件要加吗？
                    } else {
                        this.$Message.error(this.$t('clue.claim_failed'));
                    }
                    this.confirmClaimLaoding = false;
                }).catch(error => {
                    console.log(error);
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error(this.$t('clue.claim_failed'));
                    }
                    this.confirmClaimLaoding = false;
                });
            }
        }
    };
</script>

<style scoped>

</style>
