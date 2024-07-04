<template>
    <div style="padding: 0 30px;">
        <component
            v-bind:is="view"
            :view="view"
            :checkForm.sync="checkForm"
            @changeView="changeView"
            ref="settingDom">
        </component>
    </div>
</template>
<script>
    import mappingFormList from './mapping-form-list';
    import mappingFormSet from './mapping-form-set';
    export default {
        name: '',
        components: {
            mappingFormList,
            mappingFormSet
        },
        data() {
            return {
                checkForm: null,
                view: 'mappingFormList'
            };
        },
        methods: {
            changeView(view) {
                this.view = view;
            }
        },
        watch: {
            view: {
                handler(val) {
                    if (val === 'mappingFormList') {
                        this.$emit('handleShowTabs', true);
                    } else {
                        this.$emit('handleShowTabs', false);
                    }
                }
            }
        }
    };
</script>

<style lang="scss" scoped>

</style>
