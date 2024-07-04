<template>
    <div>
        <Modal
            :visible="visible"
            :title="$t('clue.go_sea')"
            :show-close="false"
            :modal-append-to-body="false"
            width="540px"
            class="modal">
                <p class="layermain" style="margin:20px 0 10px 0;text-align: center;">
                    {{$t('clue.gosea_tip')}}
                </p>
                <div slot="footer">
                    <Button  @click="$emit('update:visible', false)">{{$t('clue.cancel')}}</Button>
                    <Button class="piwik_clueSea" type="primary" :loading="throwToPublicSeaLoading" @click="throwToPublicSea">{{$t('clue.confirm')}}</Button>
                </div>
        </Modal>

    </div>
</template>

<script>
    import { crmClue } from '@/api/crm';
    import { mapState } from 'vuex';
    export default {
        name: 'throwClue',
        props: [
            'visible',
            'clueId'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName'
            })
        },
        data() {
            return {
                throwToPublicSeaLoading: false
            };
        },
        methods: {
            /* 退入公海 */
            throwToPublicSea() {
                this.throwToPublicSeaLoading = true;
                const data = {
                    orgId: this.enterpriseId,
                    ids: this.clueId,
                    saleId: -1,
                    saleName: this.$t('clue.public_sea'),
                    editUserId: this.userId,
                    editUser: this.fullName
                };
                crmClue.transfer(data).then(response => {
                    if (response.code === '1') {
                        this.$emit('update:visible', false);
                        this.$emit('chownSuccess');
                        this.$Message.success(this.$t('clue.gosea_success'));
                    } else {
                        this.$Message.error(this.$t('clue.gosea_failed'));
                    }
                    this.throwToPublicSeaLoading = false;
                }).catch(error => {
                    console.log(error);
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error(this.$t('clue.gosea_failed'));
                    }
                    this.throwToPublicSeaLoading = false;
                });
            }
        }
    };
</script>

<style scoped>

</style>
