<template>
    <keep-alive>
        <component v-bind:is="view"
                   @changeView="changeView"></component>
    </keep-alive>
</template>

<script>
    import adAccountTable from './ad_account_table';
    // import binding from './binding/binding';

    export default {
        name: 'ad_account_binding',
        components: {
            adAccountTable
            // binding
        },
        data() {
            return {
                view: ''
            };
        },
        methods: {
            changeView(name) {
                this.view = name;
            }
        },
        mounted() {
            this.view = 'adAccountTable';
        }
    };
</script>
