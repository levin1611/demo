<template>
    <div>
        <Tabs v-model="view" class="buried-tab" v-show="showTabs">
            <TabPane
                    v-for="(item,index) in viewList"
                    :key="index"
                    :label="item.label"
                    :name="item.name"
            ></TabPane>
        </Tabs>
        <component
                v-bind:is="view"
                @handleShowTabs="handleShowTabs"
                ref="settingDom">
        </component>
    </div>
</template>
<script>
    import fieldSetting from './fieldSetting';
    import formSetting from './form-setting';
    import mappingForm from './mappingForm/mapping-form';
    export default {
        name: 'form-setting-container',
        components: {
            fieldSetting,
            formSetting,
            mappingForm
        },
        data() {
            return {
                showTabs: true,
                view: 'fieldSetting',
                viewList: [
                    {
                        label: this.$t('formSet.tabs0'),
                        name: 'fieldSetting'
                    },
                    {
                        label: this.$t('formSet.tabs1'),
                        name: 'formSetting'
                    },
                    {
                        label: this.$t('formSet.tabs2'),
                        name: 'mappingForm'
                    }
                ]
            };
        },
        methods: {
            handleShowTabs(val) {
                this.showTabs = val;
            },
            getData() {
                const data = this.$refs.settingDom.handleConfirm();
                if (data) {

                }
                console.log(data);
            }
        }
    };
</script>

<style lang="less">
    .buried-tab{
        padding: 20px 30px 0;

        .el-tabs__nav-wrap::after {
            height: 1px;
        }
    }
</style>
