<template>
    <div>
        <div class="add_container">
            <div class="back_to_list">
                <Button @click="backToList">{{$t('seo.seoAdd.backThemeText')}}</Button>
            </div>
            <div class="top_header">
                <h3 class="add_title">{{$t('seo.seoAdd.newThemeText')}}</h3>
                <div class="select_container">
                    <div class="country_filter">
                        <span class="filter_name">{{$t('seo.seoAdd.countryText')}}</span>
                        <Select v-model="countrySelected" filterable class="select-country">
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
                        <span class="filter_name">{{$t('seo.seoAdd.languageText')}}</span>
                        <Select v-model="langSelected" filterable class="select-language">
                            <Option v-for="item in langOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"></Option>
                        </Select>
                    </div>
                </div>
            </div>
            <div class="search_filter">
                <div class="search_content">
                    <p class="p_1">{{$t('seo.seoAdd.thinkText')}}</p>
                    <p class="p_2">{{$t('seo.seoAdd.answerText')}}</p>
                </div>
                <div class="search_input">
                    <Input placeholder="输入主题" v-model="subjectText" @keyup.enter.native="getKeywordAdvice"></Input>
                    <Button type="primary" :disabled="!subjectText.trim() || loading" class="get_seo_button get-seo-advice" @click="getKeywordAdvice">{{$t('seo.seoAdd.getThemeText')}}</Button>
                </div>
            </div>
            <div class="add_table">
                <div v-loading="loading" style="min-height: 100%" :style="{minHeight: table_height - 190 + 'px'}">
                    <Table :data="tableData"
                           :height="table_height"
                           :header-cell-class-name="headerCellClass"
                           highlight-current-row
                           ref="table"
                           size="medium"
                           class="tabmain noBoxShadow-right noborder-table">
                        <TableColumn v-for="item in currentColumns"
                                     :key="item.key"
                                     :prop="item.key"
                                     :label="item.title"
                                     :align="item.align || 'left'"
                                     :min-width="item.width || 64"
                                     :render-header="item.renderHeader"
                                     :show-overflow-tooltip="true">
                            <template slot-scope="scope">
                                <template v-if="item.key === 'keyword'">
                                    <Radio v-model="keywordSelected"
                                           :label="scope.row.keyword"
                                           @change.native="getCurrentRow(scope.row)"
                                           class="radio-selectable"></Radio>
                                </template>
                                <template v-else>
                                    <span>{{scope.row[item.key]}}</span>
                                </template>
                            </template>
                        </TableColumn>
                        <div slot="empty">
                            <p class="empty_content">
                                {{$t('seo.seoAdd.enterThemeText')}}
                            </p>
                        </div>
                    </Table>
                </div>
            </div>
        </div>
        <div class="add_footer">
            <Button type="primary"
                    :disabled="!subjectName || loading"
                    @click="createSubject"
                    class="create-subject">{{$t('seo.seoAdd.creatThemeText')}}</Button>
            <Button @click="backToList">{{$t('seo.seoAdd.cancel')}}</Button>
            <span v-if="subjectName">{{$t('seo.seoAdd.addNowText')}}"{{ subjectName }}{{$t('seo.seoAdd.themeText')}}"</span>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import util from '../../../../libs/util';
    import env from '../../../../../build/env';
    export default {
        name: 'seoAdd',
        computed: {
            ...mapState({
                window_height: 'window_height'
            }),
            table_height() {
                let temp = this.window_height ? this.window_height - 292 : document.body.clientHeight - 292;
                if (temp < 200) {
                    temp = 200;
                }
                temp += this.loading ? 1 : 0;
                return temp;
            },
            // 创建主题, 优先取选中的建议关键词, 否则取用户输入的字符
            subjectName() {
                return this.keywordSelected || this.subjectText.trim();
            }
        },
        data() {
            return {
                subjectText: '',
                tableData: [],
                currentColumns: [
                    {
                        key: 'keyword',
                        title: this.$t('seo.seoAdd.themeText')
                    },
                    {
                        key: 'searchs',
                        title: this.$t('seo.seoAdd.averageText')
                    },
                    {
                        key: 'competition',
                        title: this.$t('seo.seoAdd.competitionText')
                    }
                ],
                countrySelected: null, // 选中的国家
                countryOptions: [], // 国家列表
                langSelected: null, // 选中的语言
                langOptions: [], // 语言列表
                loading: false,
                keywordSelected: '' // 选中的建议 默认是第一个
            };
        },
        methods: {
            headerCellClass( {column} ) {
                return 'hasTipAndFilterCell';
            },
            init() {
                // 拉取国家， 语言下拉
                this.getCountryAndLangList();
            },
            getCountryAndLangList() {
                util.ajaxInternational({
                    url: '/oversea/openAds/countryCodes',
                    method: 'post',
                }).then(res => {
                    if (res.data.code === '1') {
                        let locations = res.data.data.location;
                        let language = res.data.data.language;
                        this.countryOptions = this.convertCountryToListArr(locations);
                        this.countrySelected = -1; // 默认美国
                        this.langOptions = this.convertLangToListArr(language);
                        this.langSelected = 1000; // 默认英语
                    }
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
            getKeywordAdvice() {
                this.loading = true;
                this.keywordSelected = '';
                // util.ajaxInternational({
                //     url: '/oversea/openAds/keywordPlanner',
                //     method: 'post',
                //     data: {
                //         language_id: this.langSelected,
                //         location_id: this.countrySelected,
                //         keyword: this.subjectText
                //     }
                // })
                util.ajaxAMP({
                    url: '/seotopic/keywordPlanner',
                    method: 'post',
                    data: {
                        language_id: this.langSelected,
                        location_id: this.countrySelected,
                        keyword: this.subjectText
                    }
                }).then(res => {
                    this.loading = false;
                    if (res.data.code === 0) {
                        this.tableData = res.data.data;
                        if (this.tableData.length) {
                            this.keywordSelected = this.tableData[0].keyword;
                        }
                    }
                }).catch(e => {
                    this.loading = false
                })
            },
            getCurrentRow(row) {
                this.keywordSelected = row.keyword;
            },
            createSubject() {
                // 数据为空校验
                if (!this.subjectName) {
                    return;
                }

                util.ajaxAMP({
                    url: '/seotopic/create',
                    method: 'post',
                    data: {
                        name: this.subjectName,
                        location_id: this.countrySelected,
                        language_id: this.langSelected
                    }
                }).then(res => {
                    if (res.data.code === 0) {
                        // 获取主题id
                        let id = res.data.data;
                        this.$store.commit('setSubjectId', id);
                        // 跳转到详情页面
                        this.$store.commit('setSwitchComponent', 'seo-detail');
                    } else {
                        // 主题重复
                        this.$Message.warning(res.data.msg);
                    }
                })
            },
            backToList() {
                this.$store.commit('setSwitchComponent', 'seo-list');
            },
            renderHeader_filter(colIndex) {
                return h => {
                    const column = this.currentColumns[colIndex];
                    const title = h('div', {
                        attrs: {
                            title: column.title
                        },
                        class: 'table-filter-title',
                        title: column.title
                    }, column.title);
                    const helpTip = !['keyword'].includes(column.key) ? h('HelpTip', {
                        class: 'table-head-tip',
                        props: {
                            title: (key => {
                                return this.$t(`helpTip.${key}`);
                            })(column.key)
                        }
                    }) : undefined;
                    return h('div', {
                        class: 'table-filter-container'
                    }, [title, (helpTip)]);
                };
            },
        },
        created() {
            this.currentColumns = this.currentColumns.map((col, index) => {
                col.renderHeader = this.renderHeader_filter(index);
                return col;
            })
            this.init();
        }
    };
</script>

<style scoped lang="less">
    @import "index";

    .radio-selectable {
        user-select: auto;
    }
</style>
