<template>
    <div style="min-width: 700px;padding:0 30px;" class="content">
        <FormTable></FormTable>
    </div>
</template>
<script>
    import FormTable from './components/form-table';
    import GoBind from './components/go-bind';

    export default {
        name: 'form_bind',
        components: {
            FormTable,
            GoBind
        },
        computed: {}
    };
</script>
