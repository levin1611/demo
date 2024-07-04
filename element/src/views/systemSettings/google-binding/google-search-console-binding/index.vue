<template>
    <div>
        <component :is="view"
                   :view="view"
                   @changeView="changeView"></component>
    </div>
</template>

<script>
    import BoundSiteList from '@/views/systemSettings/google-binding/google-search-console-binding/boundSiteList';
    import SearchConsoleBinding from '@/views/systemSettings/google-binding/google-search-console-binding/account-binding/searchConsoleBinding';

    export default {
        name: 'searchConsoleBindingIndex',
        components: {
            BoundSiteList,
            SearchConsoleBinding
        },
        data() {
            return {
                view: 'BoundSiteList'
            };
        },
        methods: {
            changeView(view, data) {
                this.view = view;
            }
        }
    };
</script>
