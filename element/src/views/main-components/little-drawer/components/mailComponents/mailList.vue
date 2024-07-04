<template>
    <div>{{$t('littleDrawer.mailList')}}</div>
</template>
<script>
    import { mapState } from 'vuex';
    export default {
        name: 'mailList',
        props: [
            'currAccountInfo'
        ],
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId'
            })
        },
        data() {
            return {

            };
        },
        watch: {

        },
        methods: {

        }
    };
</script>
<style lang="less">

</style>
