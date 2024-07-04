<template>
    <div class="input-box">
        <Select v-model="language" style="width:98px;">
            <Option v-for="item in languageList"
                    :key="item.value"
                    :value="item.value">{{ item.label }}</Option>
        </Select>
        <Icon custom="custom custom-dynamic-type-facebook" size="20" @click.native="handleShortcutsShow"></Icon>
        <Input v-model="inputMessage" type="textarea" :rows="3" :placeholder="$t('placeholder.sendTip')"
               @keyup.enter.native="sendMessage(inputMessage)"/>
        <div style="text-align:right;">
            <Button :disabled="!inputMessage" @click="translate" :loading="translateLoading">
                {{$t('facebook.inbox.fbChat.translate')}}
            </Button>
            <Button :disabled="!inputMessage" @click="sendMessage(inputMessage)" :loading="sendLoading"
                    style="margin:0 10px;">{{$t('facebook.inbox.fbChat.send')}}
            </Button>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import translateLang from '@/mixins/translateLang';

    export default {
        name: 'InputBox',
        mixins: [translateLang],
        props: {
            sendMessage: {
                type: Function,
                default() {
                    return {};
                }
            },
            sendLoading: {
                type: Boolean,
                default: false
            },
            isSendSuccess: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                inputMessage: '',
                language: 'en',
                translateLoading: false
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId
            })
        },
        methods: {
            // 翻译
            translate() {
                this.translateLoading = true;
                util.ajaxInternational({
                    url: '/translation/translation',
                    method: 'post',
                    data: {
                        requestText: this.inputMessage,
                        targetLang: this.language
                    }
                }).then(response => {
                    this.translateLoading = false;
                    this.inputMessage = response.data.data.translations[0].translatedText;
                });
            },
            // 展开话术
            handleShortcutsShow() {
                this.$emit('letShortcutsShow', true);
            }
        },
        created() {

        },
        watch: {
            isSendSuccess(val) {
                if (val) {
                    this.inputMessage = '';
                }
            }
        }
    };
</script>

<style lang="less">
    .input-box {
        font-size: 12px;

        .ivu-input {
            border: none;
            box-shadow: none;
            -webkit-box-shadow: none;
            font-size: 12px;
        }

        .ivu-btn {
            font-size: 12px;
            border: 1px solid #979797;
            border-radius: 4px;
            color: #495060;
        }

        .ivu-btn[disabled] {
            font-size: 12px;
            color: #ABABAB;
            background-color: #fff;
            border: 1px solid #DBDEE1;
        }
    }
</style>
