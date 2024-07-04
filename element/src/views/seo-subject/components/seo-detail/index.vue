<template>
    <div class="detail_container">
        <div class="detail_header">
            <div class="header_left">
                <h3 class="detail_title">{{subjectDetail.name}}</h3>
                <div class="select_container">
                    <div class="country_filter">
                        <span class="filter_name">{{$t('seo.detailIndex.countryText')}}</span>
                        <Select v-model="countrySelected" filterable class="select-country" @change="updateLocationAndLang">
                            <Option v-for="item in countryOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                                <img :src="item.flag" alt="" style="width: 20px">
                                <span class="countryName">{{item.label}}</span>
                            </Option>
                        </Select>
                    </div>
                    <div class="lang_filter">
                        <span class="filter_name">{{$t('seo.detailIndex.languageText')}}</span>
                        <Select v-model="langSelected" filterable class="select-language" @change="updateLocationAndLang">
                            <Option v-for="item in langOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"></Option>
                        </Select>
                    </div>
                </div>
            </div>
            <div class="header_right">
                <Button type="primary" @click="visible_keyword = true" :disabled="isMoreThan50" class="add-keyword">{{$t('seo.detailIndex.addText')}}</Button>
                <Button @click="backToList">{{$t('seo.detailIndex.backText')}}</Button>
            </div>
        </div>
        <div class="detail_body">
            <Tabs type="border-card" class="detail_tabs">
                <TabPane :label="$t('seo.detailIndex.themeAreaText')" class="subject-area">
                    <subjectsArea :subjectDetail.sync="subjectDetail"
                                  :countrySelected="countrySelected"
                                  :langSelected="langSelected"
                                  @updateDetails="updateDetail"
                                  @openDialog="openDialog"
                                  v-on="$listeners">
                    </subjectsArea>
                </TabPane>
                <TabPane :label="$t('seo.detailIndex.contentText')" class="content-display">
                    <contentsDisplay :subjectDetail.sync="subjectDetail"
                                     :countrySelected="countrySelected"
                                     :langSelected="langSelected"
                                     @updateDetail="updateDetail"
                                     v-on="$listeners">
                    </contentsDisplay>
                </TabPane>
            </Tabs>
        </div>
        <addKeyword :visible.sync="visible_keyword"
                    :countrySelected="countrySelected"
                    :langSelected="langSelected"
                    :seoTitle="subjectDetail['name']"
                    @openDialog="openDialog"
                    v-on="$listeners">
        </addKeyword>
<!--        <editContent :visible.sync="visible_content"-->
<!--                     v-if="visible_content"-->
<!--                     @updateDetail="updateDetail"-->
<!--                     :id="editingId">-->
<!--        </editContent>-->
    </div>
</template>

<script>
    import subjectsArea from './components/subjectsArea';
    import contentsDisplay from './components/contentsDisplay';
    import { mapState } from 'vuex';
    import util from '@/libs/util';
    // import env from '../../../../../build/env';
    import addKeyword from './components/Modals/addKeyword';
    // import editContent from './components/Modals/editContent';

    export default {
        name: 'seoDetail',
        inheritAttrs: false,
        components: {
            subjectsArea,
            contentsDisplay,
            addKeyword
            // editContent
        },
        computed: {
            ...mapState({
                subjectId: state => state.seo.subjectId,
                subjectDate: state => state.seo.subjectDate
            }),
            isMoreThan50() {
                return this.subjectDetail.sub_topic && this.subjectDetail.sub_topic.length >= 50;
            }
        },
        data() {
            return {
                subjectDetail: {}, // 主题详情相关
                countrySelected: null,
                countryOptions: [],
                langSelected: null,
                langOptions: [],
                visible_keyword: false,
                visible_content: false,
                editingId: null
            };
        },
        methods: {
            async init() {
                await this.getCountryAndLangList();
                this.getSubjectDetail();
            },
            getSubjectDetail() {
                util.ajaxAMP({
                    url: '/seotopic/detail',
                    method: 'post',
                    data: {
                        id: this.subjectId,
                        startDate: this.subjectDate[0],
                        endDate: this.subjectDate[1]
                    }
                }).then(res => {
                    if (res.data.code === 0) {
                        this.subjectDetail = Object.assign({}, res.data.data);
                        this.countrySelected = this.subjectDetail['location_id'];
                        this.langSelected = this.subjectDetail['language_id'];
                    }
                })
            },
            getCountryAndLangList() {
                return new Promise(resolve => {
                    util.ajaxInternational({
                        url: '/oversea/openAds/countryCodes',
                        method: 'post',
                    }).then(res => {
                        if (res.data.code === '1') {
                            let locations = res.data.data.location;
                            let language = res.data.data.language;
                            this.countryOptions = this.convertCountryToListArr(locations);
                            this.langOptions = this.convertLangToListArr(language);
                            resolve(true);
                        } else {
                            this.$Message.error(res.data.msg);
                            resolve(false);
                        }
                    })
                })
            },
            convertCountryToListArr(obj) {
                const keys = Object.keys(obj);
                const result = keys.map(item => {
                    return {
                        value: obj[item].id,
                        label: item,
                        flag: obj[item].img ?`${process.env.BASE_URL}/image/seoFlags/${obj[item].img}` : `${process.env.BASE_URL}/image/seoFlags/white.png`
                    }
                });
                return result;
            },
            convertLangToListArr(obj) {
                const keys = Object.keys(obj);
                const result = keys.map(item => {
                    return {
                        value: obj[item],
                        label: item
                    }
                });
                return result;
            },
            backToList() {
                this.$store.commit('setSwitchComponent', 'seo-list');
            },
            updateDetail() {
                this.getSubjectDetail();
            },
            openDialog(val) {
                // this.visible_keyword = val === 'keyword' ? true : false;
                if (val === 'content') {
                    this.getSubjectDetail();
                    // this.visible_content = true;
                } else {
                    this.visible_keyword = true
                }
            },
            updateLocationAndLang() {
                util.ajaxAMP({
                    url: '/seotopic/bindLocate',
                    method: 'post',
                    data: {
                        topic_id: this.subjectId,
                        location_id: this.countrySelected,
                        language_id: this.langSelected
                    }
                }).then(res => {
                    if (res.data.code === 0) {
                        // do nothing
                    } else {
                        this.$Message.error(res.data.msg);
                    }
                })
            }
        },
        created() {
            this.init();
        }
    };
</script>

<style scoped lang="less">
    @import "index";
</style>
