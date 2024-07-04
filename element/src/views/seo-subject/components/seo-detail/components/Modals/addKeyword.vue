<template>
    <Modal :visible="visible"
           width="1000px"
           :close-on-click-modal="false"
           :append-to-body="true"
           :close-on-press-escape="false"
           @close="handleClose"
           top="13vh">
        <div slot="title">
            <h3 class="keyword_title">{{$t('seo.detailAdd.addChildKeywordText')}}</h3>
        </div>
        <div class="add_subject_body">
            <div class="search_top">
                <div class="search_input">
                    <span class="input_left">{{$t('seo.detailAdd.enterKeywordText')}}</span>
                    <div class="input_right">
                        <Input maxlength="60" show-word-limit v-model="subjectKeyword" @keyup.enter.native="getKeywordAdvice"></Input>
                        <span class="search_example">{{$t('seo.detailAdd.examplesText')}}</span>
                    </div>
                </div>
                <Button type="primary" :disabled="!subjectKeyword.trim()" class="get_keyword_btn get-keyword" @click="getKeywordAdvice" :loading="loading">{{$t('seo.detailAdd.getChildText')}}</Button>
            </div>
            <div v-loading="loading" class="search_result">
                <Table :data="searchResult"
                       highlight-current-row
                       ref="table"
                       height="400"
                       max-height="600"
                       size="medium"
                       class="tabmain noBoxShadow-right noborder-table search_table">
                    <TableColumn v-for="item in currentColumns"
                                 :key="item.key"
                                 :prop="item.key"
                                 :label="item.title"
                                 :align="item.align"
                                 :min-width="item.width"
                                 :width="item.width"
                                 :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <template v-if="item.key === 'keyword'">
                                <Radio v-model="selectRadio"
                                       :label="scope.row.keyword"
                                       @change.native="getCurrentRow(scope.row)"
                                       :disabled="!scope.row.creatable"
                                       class="radio-selectable">
                                </Radio>
                            </template>
                            <template v-else-if="item.key === 'longTail'">
                                <Checkbox :value="select_tails_list.includes(scope.row.keyword) && selectRadio !== scope.row.keyword"
                                          :disabled="selectRadio === scope.row.keyword"
                                          @change="checkChange($event, scope)"></Checkbox>
                            </template>
                            <template v-else>
                                <span>{{scope.row.searchs}}</span>
                                <div class="google_search_btn" v-show="selectRadio === scope.row.keyword">
                                    <Button size="small" type="minor" icon="custom custom-search" @click="googleSearch(0)">{{$t('seo.detailAdd.googleText1')}}</Button>
                                    <Button size="small" type="minor" icon="custom custom-search" @click="googleSearch(1)">{{$t('seo.detailAdd.googleText2')}}</Button>
                                    <Button size="small" type="minor" icon="custom custom-search" @click="googleSearch(2)">{{$t('seo.detailAdd.googleText3')}}</Button>
                                </div>
                            </template>
                        </template>
                    </TableColumn>
                </Table>
            </div>
        </div>
        <div slot="footer">
            <Button type="primary"
                    :disabled="!subjectName || loading"
                    @click="saveKeyword"
                    class="save-keyword">{{$t('seo.detailAdd.saveAddText')}}</Button>
        </div>
        <editContent :visible.sync="visible_content"
                     v-if="visible_content"
                     :id="id"
                     :countrySelected="countrySelected"
                     :langSelected="langSelected"
                     @updateDetail="updateDetail"
                     v-on="$listeners"></editContent>
    </Modal>
</template>

<script>
    import util from '../../../../../../libs/util';
    import { mapState } from 'vuex';
    import editContent from './editContent';
    export default {
        name: 'addKeyword',
        props: ['visible','countrySelected', 'langSelected', 'seoTitle'],
        computed: {
            ...mapState({
                subjectId: state => state.seo.subjectId
            }),
            // 创建主题, 优先取选中的建议关键词, 否则取用户输入的字符
            subjectName() {
                return this.selectRadio || this.subjectKeyword.trim();
            }
        },
        components: {
            editContent
        },
        data() {
            return {
                subjectKeyword: '',
                searchResult: [], // 搜索关键字结果
                currentColumns: [
                    {
                        key: 'keyword',
                        title: this.$t('seo.detailAdd.themeText'),
                        align: 'left',
                        width: 300
                    },
                    {
                        key: 'searchs',
                        title: this.$t('seo.detailAdd.averageText'),
                        align: 'left',
                        width: 500
                    },
                    {
                        key: 'longTail',
                        title: this.$t('seo.detailAdd.longKeywordText'),
                        align: 'right',
                        width: 100
                    }
                ],
                selectRadio: '', // 选中的子主题
                loading: false,
                visible_content: false,
                id: null,
                select_tails_list: [], // 选中的长尾词数组
            }
        },
        methods: {
            getCurrentRow(row) {
                this.selectRadio = row.keyword;
            },
            saveKeyword() {
                this.select_tails_list = this.selectRadio ? this.select_tails_list.filter(tail => tail !== this.selectRadio) : [];
                util.ajaxAMP({
                    url: '/seotopic/create',
                    method: 'post',
                    data: {
                        name: this.subjectName,
                        parent_id: this.subjectId,
                        location_id: this.countrySelected,
                        language_id: this.langSelected,
                        longTail: this.select_tails_list
                    }
                }).then(async res => {
                    if (res.data.code === 0) {
                        this.id = res.data.data;
                        // MKT4.1.1需求要求添加子主题成功后将不会打开附加子主题内容的弹窗 因此下面的代码被注释掉
                        // this.visible_content = true;
                        // 刷新subjectArea组件
                        // 获取 子主题id
                        // 父组件调用editContent组件
                        this.$emit('openDialog', 'content');
                        // MKT4.1.1需求要求添加成功后不会关闭弹窗 因此下面的代码被注释掉
                        // this.handleClose();
                        // 刷新页面重新获取搜索数据
                        this.select_tails_list = [];
                        this.searchResult = [];
                        this.selectRadio = '';
                        this.getKeywordAdvice();
                    } else {
                        this.$Message.warning(res.data.msg);
                    }
                })
            },
            handleClose() {
                // 清空数据
                this.subjectKeyword = '';
                this.searchResult = [];
                this.selectRadio = '';
                this.select_tails_list = [];
                this.$emit('update:visible', false);
            },
            getKeywordAdvice() {
                this.loading = true;
                this.selectRadio = '';
                this.select_tails_list = [];
                // util.ajaxInternational({
                //     url: '/oversea/openAds/keywordPlanner',
                //     method: 'post',
                //     data: {
                //         language_id: this.langSelected,
                //         location_id: this.countrySelected,
                //         keyword: this.subjectKeyword
                //     }
                // })
                util.ajaxAMP({
                    url: '/seotopic/keywordPlanner',
                    method: 'post',
                    data: {
                        language_id: this.langSelected,
                        location_id: this.countrySelected,
                        keyword: this.subjectKeyword,
                        topic_id: this.subjectId
                    }
                }).then(res => {
                    this.loading = false;
                    if (res.data.code === 0) {
                        this.searchResult = res.data.data;
                        // 默认选中第一个creatable为false的
                        if (this.searchResult.length) {
                            try {
                                let index = this.searchResult.findIndex(result => result.creatable)
                                this.selectRadio = this.searchResult[index].keyword;
                            } catch {

                            }
                        }
                    }
                }).catch(e => {
                    // 错误处理 超时取消loading并提示
                    this.loading = false;
                    this.$Message.error(this.$t('seo.detailAdd.error1'));
                })
            },
            updateDetail() {
                this.$emit('openDialog', 'content');
            },
            googleSearch(status) {
                let baseUrl = 'https://www.google.com/search?';
                let params = {
                    q: this.selectRadio, // 搜索关键词
                    hl: 'en', // 限制google搜索的界面语言固定位英文
                    newwindow: 1, // 新窗口打开搜索结果
                }
                switch (status) {
                    case 0:
                        break;
                    case 1:
                        // intitle搜索 在关键词前面拼接 "allintitle:"
                        params.q = `allintitle:${this.selectRadio}`;
                        break;
                    case 2:
                        // google精确搜索 在关键词外使用双引号
                        params.q = `"${this.selectRadio}"`;
                        break;
                }
                for (let k in params) {
                    if (params[k]) {
                        baseUrl += (baseUrl.indexOf('?') < 0 ? '?' : '&') + k + '=' + params[k];
                    }
                }
                window.open(baseUrl);
            },
            checkChange(val, scope) {
                if (val) {
                    this.select_tails_list.push(scope.row.keyword);
                } else {
                    this.select_tails_list = this.select_tails_list.filter(tail => tail !== scope.row.keyword);
                }
            }
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        this.subjectKeyword = this.seoTitle || ''
                    }
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .keyword_title {
        font-family: PingFangSC-Medium;
        font-size: 18px;
        color: rgba(0,0,0,0.80);
        letter-spacing: 0;
        line-height: 26px;
    }
    .add_subject_body {
        .search_top {
            .search_input {
                display: flex;
                align-items: baseline;
            }
        }
    }
    .input_left {
        display: inline-block;
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: rgba(0,0,0,0.80);
        letter-spacing: 0;
        line-height: 18px;
        margin-right: 20px;
    }
    .input_right {
        display: flex;
        flex-direction: column;
        /deep/ .el-input {
            width: 400px;
        }
        .search_example {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0,0,0,0.60);
            letter-spacing: 0;
            line-height: 18px;
            display: inline-block;
            margin-top: 8px;
        }
    }
    .get_keyword_btn {
        margin-top: 29px;
    }
    /deep/ .is-disabled {
        background: #E7ECF2;
        border-color: #e7ecf2;
        span {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(110,129,154,0.40);
        }
    }
    .google_search_btn {
        display: inline-flex;
        justify-content: space-between;
        margin-left: 80px;
        /deep/ .el-button {
            padding: 8px;
        }
    }
    .search_table {
        /deep/ .is-disabled {
            background: none;
        }
    }

    .radio-selectable {
        user-select: auto;
    }
</style>
