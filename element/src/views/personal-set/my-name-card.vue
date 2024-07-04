<template>
    <div class="card-body">
        <show-name-card v-if="showField===0" :showField.sync="showField"></show-name-card>
        <edit-name-card v-if="showField===1" :showField.sync="showField"></edit-name-card>
    </div>
</template>
<script>
    import ShowNameCard from './card-names/showNameCard.vue';
    import EditNameCard from './card-names/editNameCard.vue';
    export default {
        name: 'myNameCard',
        components: {
            ShowNameCard,
            EditNameCard
        },
        props: ['params'],
        data() {
            return {
                showField: 0
            };
        },
        created: function() {
            const params = this.params;
            if (params.action && params.action === 'edit') {
                this.showField = 1;
            }
        },
        methods: {

        }
    };
</script>
<style lang="less" scoped>
    .card-body {
        height: 100%;
    }
</style>
