<template>
    <div>
        <div style="width: 300px">
            <Form ref="editPasswordForm" label-position="left" :label-width="labelWidth" style="padding:10px">
                <FormItem :label="$t('per_setting.langChoice')" prop="rePass">
                    <Select v-model="lang" style="width:200px" @change="handleSwitch" popper-class="_font_12" size="mini">
                        <Option v-for="item in langList" :value="item.key" :key="item.key" :label="item.lang"></Option>
                    </Select>
                </FormItem>
                <FormItem label=" ">
                    <Button @click="ok" class="piwik_langBtn" type="success" :disabled="isDisabled">{{$t('save')}}
                    </Button>
                </FormItem>
            </Form>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue';
    import Cookies from 'js-cookie';
    import { mapState } from 'vuex';

    export default {
        name: 'langSwitch',
        data() {
            return {
                isDisabled: true,
                langList: [
                    {
                        lang: 'English',
                        key: 'en-US'
                    },
                    {
                        lang: '中文',
                        key: 'zh-CN'
                    }
                ],
                lang: ''
            };
        },
        computed: {
            ...mapState({
                Lang: state => state.app.lang
            }),
            labelWidth() {
                return this.Lang === 'en-US' ? '130px' : '90px';
            }
        },
        methods: {
            handleSwitch(lang) {
                this.isDisabled = false;
                this.lang = lang;
            },
            ok() {
                this.$store.commit('switchLang', this.lang);
                localStorage.setItem('LANG', this.lang);
                this.$store.state.sourceDocumentTitle = this.$t('leads');
                this.isDisabled = true;
                this.$Message.success(this.$t('per_setting.langSetSuccess'));
                window.parent.document.title = this.$t('leads');
            }
        },
        mounted() {
            this.lang = Vue.config.lang || 'zh-CN';
        }
    };
</script>
