<template>
    <div style="max-height:445px;overflow:auto">
        <div v-for="(info,index) in mergeList" :key="index" class="info-item">
            <div class="item-header clearfloat">
                <!-- <div class="info-title" style="margin-left:">{{info.fromNick}}</div> -->
                <div class="info-title">{{info.fromNick}}&emsp;{{info.msgTimestamp}}</div>
                <!-- <Button class="translate-btn" type="primary" v-if="info.msgType==='text'" @click="translate(info)">翻译
                </Button> -->
                <Button
                    type="primary"
                    size="small"
                    v-if="info.msgType==='text'"
                    @click="translate(info)"
                    style="width: 50px;box-sizing: border-box;padding: 5px;margin-left:10px">
                        {{$t('visitor_history.translate')}}
                </Button>
            </div>
            <div v-if="info.msgType==='text'" class="item-body">
                <span class="not-read" v-if="info.flow === 'out' && info.receiveStatus && info.receiveStatus === '2'">[{{$t('timeLine.unRead')}}]</span>
                {{info.body}}
            </div>
            <div v-else-if="info.msgType==='image'" class="item-body">
                <span class="not-read" v-if="info.flow === 'out' && info.receiveStatus && info.receiveStatus === '2'">[{{$t('timeLine.unRead')}}]</span>
                <img :src="$stm.dealImgName(info.attach,info.body)" @click="imgPreview">
            </div>
            <div v-else-if="info.msgType==='file'">
                <span class="not-read" v-if="info.flow === 'out' && info.receiveStatus && info.receiveStatus === '2'">[{{$t('timeLine.unRead')}}]</span>
                <a :href="info.attach+'&download='+info.body" target="_blank"><i class="u-icon icon-file"></i>{{info.body}}</a>
            </div>
            <div v-if="info.translateBody" class="item-translate-body">
                <span class="not-read" v-if="info.flow === 'out' && info.receiveStatus && info.receiveStatus === '2'">[{{$t('timeLine.unRead')}}]</span>
                {{info.translateBody}}
            </div>
        </div>
        <div v-if="flag" style="margin-top: 60px;text-align: center;color: #999; ">
            {{$t('timeLine.noData')}}
        </div>
    </div>
</template>
<script>
    import util from '@/libs/util.js';

    export default {
        props: {
            row: {
                type: Object,
                default() {
                    return {};
                }
            },
            fieldObj: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                flag: false,
                mergeList: []
            };
        },
        filters: {
            filterImg: function(value) {
                if (value.indexOf('{') > -1) {
                    const temp = value.replace(/'/g, '"');
                    const obj = JSON.parse(temp);
                    return obj.url;
                } else {
                    return value;
                }
            }
        },
        methods: {
            /* 获取对话  聊天记录 */
            getDialogById() {
                this.mergeList = [];
                this.flag = false;
                util.ajaxInternational({
                    url: '/visitor-chat/server/chatMessageByVisitorId',
                    method: 'post',
                    data: {
                        visitorId: this.row.visitorId
                    }
                }).then(response => {
                    if (response.data.length > 0) {
                        this.mergeList = response.data;
                    } else {
                        this.flag = true;
                    }
                });
            },
            translate(info) {
                // this.translateLoading=true
                util.ajaxInternational({
                    url: '/translation/translation',
                    method: 'post',
                    data: {
                        requestText: info.body,
                        targetLang: 'zh'
                    }
                }).then(response => {
                    // this.translateLoading=false
                    // this.inputMessage=response.data.data.translations[0].translatedText
                    this.$set(info, 'translateBody', response.data.data.translations[0].translatedText);
                });
            },
            // 显示原图片
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            }
        },
        created() {
            this.getDialogById();
        },
        watch: {
            row: {
                handler: function() {
                    this.getDialogById();
                },
                deep: true
            }
        }
    };
</script>
<style lang="less" scoped>
    .info-item {
        background-color: #F9FBFD;
        padding: 20px 0 20px 20px;
        border-top: 1px dashed #e6e6e6;
    }

    .item-header {
        margin-bottom: 10px;
        font-size: 12px;
        box-sizing: border-box;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    }

    .item-body img {
        max-width: 400px;
    }

    .not-read {
        color: #4285F4;
    }
</style>
