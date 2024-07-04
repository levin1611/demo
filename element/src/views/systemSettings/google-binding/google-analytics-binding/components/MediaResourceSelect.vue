<template>
    <div class="sync-tracking-template">
        <div class="step-title">选择媒体资源</div>
        <div style="font-size:12px;text-align: center;">
            媒体资源:
            <Select v-model="currentMediaResource" style="width:200px;text-align:left;" @change="handleChangeSelect">
                <Option v-for="item in mediaResources" :value="`${item.webPropertyName}(${item.webPropertyId})`" :key="item.webPropertyId">
                    {{`${item.webPropertyName}(${item.webPropertyId})`}}
                </Option>
            </Select>
            <div style="margin-top:20px;text-align:center;">
                <Button type="primary" @click="handlePrev">{{$t('googleAdsBinding.accountBinding.prevStep')}}</Button>
                <Button type="primary"
                        :loading="saveLoading"
                        @click="handleSave"
                        style="margin-left:10px"
                        class="piwik_bind_google_account">
                    {{$t('save')}}
                </Button>
            </div>
        </div>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'MediaResourceSelect',
        props: {
            mediaResources: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data() {
            return {
                saveLoading: false,
                currentMediaResource: '' // 当前选中的媒体资源
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId
            })
        },
        methods: {
            handleChangeSelect() {
                this.$emit('updateSelectMediaResource', this.currentMediaResource);
            },
            handlePrev() {
                this.$emit('stepPrev', true);
            },
            handleSave() {
                this.$emit('handleSave');
            }
        },
        created() {}
    };
</script>
<style lang="less">
    .sync-tracking-template {
        width: 90%;
        font-size: 12px;

        .step-title {
            text-align: center;
            font-weight: 700;
            margin-bottom: 30px;
            font-size: 16px;
        }
    }
</style>

