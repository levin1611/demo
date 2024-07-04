<template>
    <Modal
        width="800px"
        title="高级筛选"
        :visible.sync="visibleModal"
        :modal-append-to-body="true"
        :append-to-body="true"
        :close-on-click-modal="false"
        @close="handleCancel">
        <advancedFiltering :filterParams="filterParams" :from="from" ref="advancedFiltering" v-if="visibleModal"></advancedFiltering>
        <div slot="footer" class="filter-footer">
            <Button style="color: #fc8c30;border: 1px solid #fc8c30;" @click="handleClear">{{$t('filter_box.empty')}}</Button>
            <Button type="primary" @click="handleConfirm" :loading="saveLoading">{{$t('mail.writeLetter.addContactModal.filter')}}</Button>
        </div>
    </Modal>
</template>
<script>
    import { mapState } from 'vuex';
    import advancedFiltering from '@/views/main-components/advancedFiltering.vue';
    export default {
        name: 'advancedFilteringModal',
        props: {
            from: {
                type: String,
                default: 'whatsapp'
            },
            visibleModal: {
                type: Boolean,
                default: true
            },
            filterParams: {
                default:() => {}
            }
        },
        components: {
            advancedFiltering
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId
            })
        },
        data() {
            return {
                saveLoading: false
            };
        },
        methods: {
            handleConfirm() {
                const data = this.$refs.advancedFiltering.handleConfirm();
                console.log('data', data)
                if (data) {
                    this.$emit('conditionParams', data);
                }
            },
            handleClear() {
                this.$refs.advancedFiltering.handleClear();
                this.$emit('conditionParams', null);
            },
            handleCancel() {
                this.$emit('update:visibleModal', false);
            }
        },
        mounted() {

        },
        created() {
        }
    };
</script>
<style lang="less" scoped>
</style>
