<template>
    <div class="seo_guide_page">
        <div class="guide_header">
            <p class="p_1">{{$t('seo.guide.selectText')}}</p>
            <p class="p_2">{{$t('seo.guide.orderText')}}</p>
        </div>
        <div class="guide_content">
            <div class="content_left">
                <div class="input_div">
                    <p class="input_title">{{$t('seo.guide.topicText')}}</p>
                    <Input type="text"
                           :placeholder="$t('seo.guide.entertopicText')"
                           maxlength="60"
                           show-word-limit
                           v-model="subjectText"
                           @keyup.enter.native="createSubject"
                           @keyup.native="watchLength($event)" >
                    </Input>
                </div>
            </div>
<!--            <Divider direction="vertical" class="content_divider"></Divider>-->
            <div class="content_right">
                <svg class="svg-icon custom" aria-hidden="true" style="font-size:64px;position: relative;left: -14px">
                    <use xlink:href="#custom-dengpao"></use>
                </svg>
                <p class="content_title">{{$t('seo.guide.howText')}}</p>
                <p class="content_content">{{$t('seo.guide.considerText')}}</p>
                <br>
                <br>
                <p class="content_content">{{$t('seo.guide.themeText')}}</p>
                <div class="content_list">
                    <ul>
                        <li class="list_list">
                            <svg class="svg-icon custom" aria-hidden="true" style="margin-right: 5px">
                                <use xlink:href="#custom-dangqianbuzhou-yiwanchengdaxiaoxiangsuCC"></use>
                            </svg>
                            <span>{{$t('seo.guide.termText')}}</span>
                        </li>
                        <li class="list_list">
                            <svg class="svg-icon custom" aria-hidden="true" style="margin-right: 5px">
                                <use xlink:href="#custom-dangqianbuzhou-yiwanchengdaxiaoxiangsuCC"></use>
                            </svg>
                            <span>{{$t('seo.guide.searchText')}}</span>
                        </li>
                        <li class="list_list">
                            <svg class="svg-icon custom" aria-hidden="true" style="margin-right: 5px">
                                <use xlink:href="#custom-dangqianbuzhou-yiwanchengdaxiaoxiangsuCC"></use>
                            </svg>
                            <span>{{$t('seo.guide.lengthText')}}</span>
                        </li>
                    </ul>
                </div>
                <p class="content_content">
                    {{ ['12200'].includes(enterpriseId) ? $t('seo.guide.examplesText12200') : $t('seo.guide.examplesText')}}
                </p>
            </div>
        </div>
        <div class="guide_bottom">
            <Button type="primary" :disabled="!subjectText.trim()" @click="createSubject">{{$t('seo.guide.createText')}}</Button>
            <Button @click="handleCancel">{{$t('seo.guide.cancelText')}}</Button>
        </div>
    </div>
</template>

<script>
    import util from '../../../../libs/util';
    import { mapState } from 'vuex';
    export default {
        name: 'seoGuide',
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId'
            })
        },
        data() {
            return {
                subjectText: ''
            }
        },
        methods: {
            handleCancel() {
                this.$store.commit('setSwitchComponent', 'seo-list');
            },
            createSubject() {
                // 调用接口
                util.ajaxAMP({
                    url: '/seotopic/create',
                    method: 'post',
                    data: {
                        name: this.subjectText.trim()
                    }
                }).then(res => {
                    if (res.data.code === 0) {
                        let id = res.data.data;
                        this.$store.commit('setSubjectId', id);
                        // 跳转到主题详情页
                        this.$store.commit('setSwitchComponent', 'seo-detail');
                    } else {
                        this.$Message.warning(res.data.msg);
                    }
                })

            },
            watchLength(e) {
                console.log(e);
                let excludeKeyCodes = [8,16, 17, 18, 20, 27, 35, 36, 37, 38, 39, 40, 45, 144, 225];
                if (this.subjectText.length === 60 && !excludeKeyCodes.includes(e.keyCode)) {
                    this.$Message.warning(this.$t('seo.guide.themeLengthText'));
                }
            }
        },
    };
</script>

<style scoped lang="less">
    @import "index";
</style>
