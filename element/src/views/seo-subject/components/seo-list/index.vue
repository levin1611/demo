<template>
    <div class="seo_subjects_list">
        <div class="table_top">
            <div class="table_top_left">
                <h1>{{$t('seo.list.title')}}</h1>
                <Tooltip :content="seo_subject_contents" placement="bottom">
                    <Icon custom="custom-question-tip"></Icon>
                </Tooltip>
            </div>
            <div class="table_top_right">
                <div class="table_time_picker">
                    <!--                    <FilterTags :order_column="sort"-->
                    <!--                                :order_type="sortType"-->
                    <!--                                :filterConObj.sync="config_tableFilter"-->
                    <!--                                :langObj="seoObj"-->
                    <!--                                :storageName_orderColumn="sort"-->
                    <!--                                :width="filterComponentWidth"-->
                    <!--                                :removeWidth="1100"-->
                    <!--                                :min-width="390"-->
                    <!--                                @change_filter_tag="change_filter_tag"-->
                    <!--                                style="top: 4px">-->
                    <!--                    </FilterTags>-->
                    <span class="time_picker_time">{{$t('seo.list.indicatorTime')}}</span>
                    <DatePicker v-model="selectedDate"
                                type="daterange"
                                range-separator="-"
                                :default-value="new Date().getTime()"
                                value-format="yyyy-MM-dd"
                                format="yyyy-MM-dd"
                                @change="change_filter_tag"
                                size="small"
                                :clearable="false"
                                class="change-subject-time"></DatePicker>
                </div>

                <!-- SEO 智能生成内容 -->
                <Button @click="genSEOContent"
                        style="margin-right: 10px;"
                        class="add_seo_subject">{{ $t('seo.list.generateContent') }}</Button>

                <!-- 添加主题 -->
                <Button type="primary" class="add_seo_subject add-seo-subject" @click="addSEOSubject">{{$t('seo.list.addTheme')}}</Button>
            </div>
        </div>
        <div class="seo_subjects_table">
            <!-- 表格 -->
            <div v-loading="loading" style="min-height: 100%" :style="{minHeight:table_height-100 + 'px'}">
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
                            <template v-if="item.key === 'name'">
                                <span class="subject_columns view-subject" @click="goToDetail(scope.row)">{{scope.row.name}}</span>
                            </template>
                            <template v-else-if="item.key === 'operation'">
                                <span class="delete_columns delete-subject" @click="handleDeleteSubject(scope.row)">{{$t('seo.list.deleteText')}}</span>
                            </template>
                            <template v-else>
                                <span>{{scope.row[item.key] || '--'}}</span>
                            </template>
                        </template>
                    </TableColumn>
                    <div slot="empty" class="empty_content">
                        <p class="p_1">{{$t('seo.list.rankDes')}}</p>
                        <p class="p_2">{{$t('seo.list.keywordSeoDes')}}</p>
                        <Button type="primary" class="empty_content_button" @click="goToGuidePage">{{$t('seo.list.topicsBtn')}}</Button>
                    </div>
                </Table>
            </div>
        </div>
        <div class="seo_pagination">
            <Page :page-size="pageSize"
                  :page-sizes="pageSizeOpts"
                  :total="totalNum"
                  :current-page="curPage"
                  layout="total, prev, pager, next, sizes, jumper"
                  @current-change="changePage"
                  @size-change="pageSizeChange"
                  class="pageWrap-right"  >
            </Page>
        </div>
        <Modal :visible.sync="visible_delete"
               width="578px"
               :append-to-body="true"
               :title="$t('seo.list.deleteDefineText')">
            <p>{{$t('seo.list.tips1')}}</p>
            <p>{{$t('seo.list.tips2')}}</p>
            <div slot="footer">
                <Button @click="visible_delete=false">{{$t('seo.list.cancel')}}</Button>
                <Button type="primary" @click="deleteSubject">{{$t('seo.list.define')}}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    // import FilterTags from '@/views/main-components/filter-tags';
    import { mapState } from 'vuex';
    import util from '../../../../libs/util';

    export default {
        name: 'seoList',
        components: {
            // FilterTags,
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                window_height: 'window_height'
            }),
            table_height() {
                let temp = this.window_height ? this.window_height - 180 : document.body.clientHeight - 200;
                if (temp < 200) {
                    temp = 200;
                }
                temp += this.loading ? 1 : 0;
                return temp;
            }
        },
        data() {
            return {
                seo_subject_contents: this.$t('seo.list.titleDes'),
                date_filter: [],
                sort: '',
                sortType: 'desc',
                config_tableFilter: {
                    // 目前仅需要对日期进行帅选 后续如果有表头帅选的话 在这里添加
                    date: {
                        sort: true,
                        filter: true,
                        filterType: 'date',
                        query: [(Date.now() - 3600 * 1000 * 24 * 30), Date.now()],
                        allList: null,
                        dateOptions: null
                    }
                },
                seoObj: {
                    date: this.$t('seo.list.dateText')
                },
                filterComponentWidth: 220, // 筛选组件的宽度
                tableData: [], // 数据
                loading: false, // 表格加载
                currentColumns: [
                    {
                        key: 'name',
                        title: this.$t('seo.list.themeText'),
                        width: '200px'
                    },
                    {
                        key: 'sessions',
                        title: this.$t('seo.list.sessionsText'),
                    },
                    {
                        key: 'duration_avg',
                        title: this.$t('seo.list.durationText'),
                        width: '120px'
                    },
                    {
                        key: 'bounce_rate',
                        title: this.$t('seo.list.bounceText')
                    },
                    {
                        key: 'pageviews_avg',
                        title: this.$t('seo.list.pageviewsText'),
                        width: '120px'
                    },
                    {
                        key: 'dialogues',
                        title: this.$t('seo.list.dialoguesText')
                    },
                    {
                        key: 'messages',
                        title: this.$t('seo.list.messagesText')
                    },
                    {
                        key: 'clues',
                        title: this.$t('seo.list.cluesText')
                    },
                    {
                        key: 'operation',
                        title: this.$t('seo.list.operationText')
                    }
                ], // 表格列名称
                totalNum: 0,
                curPage: 1,
                pageSize: 20,
                maxPageNum: 1,
                pageSizeOpts: [20, 50, 100],
                subjectId: null,
                visible_delete: false, // 控制删除弹窗
                selectedDate: []
            }
        },
        methods: {
            // filterTags 组件内部修改筛选条件后触发的方法
            change_filter_tag(key) {
                this.$store.commit('setSubjectDate', this.selectedDate);
                this.getAllSubjects();
            },
            headerCellClass({ column }) {
                return 'hasTipAndFilterCell';
            },
            changePage(page) {
                if (page <= this.maxPageNum) {
                    this.curPage = page;
                    // 刷新页面
                    this.getAllSubjects();
                }
            },
            pageSizeChange(pageSize) {
                this.curPage = 1;
                this.pageSize = pageSize;
                // 是否记住
                // 刷新数据
                this.getAllSubjects();
            },
            goToGuidePage() {
                // 点击进入引导页
                this.$store.commit('setSwitchComponent', 'seo-guide');
            },
            // SEO 智能生成内容
            genSEOContent() {
                this.$emit('toggleSEOGen', true);
            },
            addSEOSubject() {
                this.$store.commit('setSwitchComponent', 'seo-add');
            },
            init() {
                // 初始化 获取网站数据
                this.getAllSubjects();
            },
            getAllSubjects() {
                this.loading = true
                util.ajaxAMP({
                    url: '/seotopic/list',
                    method: 'post',
                    data: {
                        page: this.curPage,
                        page_size: this.pageSize,
                        startDate: this.selectedDate[0],
                        endDate: this.selectedDate[1]
                    }
                }).then(res => {
                    this.loading = false
                    if (res.data.code === 0) {
                        this.tableData = res.data.data.items;
                        this.totalNum = res.data.data.total;
                        this.maxPageNum = Math.ceil(this.totalNum / this.pageSize);
                    } else {
                        this.$Message.error(this.$t('seo.list.errorMsg1'));
                    }
                }).catch(e => {
                    this.loading = false;
                    this.$Message.error(this.$t('seo.list.errorMsg1'));
                })
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
                    const helpTip = !['name', 'operation'].includes(column.key) ? h('HelpTip', {
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
            deleteSubject() {
                util.ajaxAMP({
                    url: '/seotopic/delete',
                    method: 'post',
                    data: {
                        id: this.subjectId
                    }
                }).then(res => {
                    if (res.data.code === 0) {
                        // 重新刷新页面
                        this.getAllSubjects();
                        this.visible_delete = false;
                    } else {
                        this.$Message.error(this.$t('seo.list.errorMsg2'));
                        this.visible_delete = false;
                    }
                }).catch(err => {
                    this.$Message.error(this.$t('seo.list.errorMsg2'));
                    this.visible_delete = false;
                })
            },
            handleDeleteSubject(row) {
                this.subjectId = row.id;
                this.visible_delete = true;
            },
            goToDetail(row) {
                this.$store.commit('setSubjectId', row.id);
                this.$store.commit('setSwitchComponent', 'seo-detail');
            },
            dateFormat(timeStamp) {
                let time = new Date(timeStamp);
                let y = time.getFullYear();
                let m = time.getMonth() + 1;
                m = m < 10 ? '0' + m : m;
                let d = time.getDate();
                d = d < 10 ? '0' + d : d;
                return `${y}-${m}-${d}`;
            }
        },
        created() {
            this.currentColumns = this.currentColumns.map((col, index) => {
                col.renderHeader = this.renderHeader_filter(index);
                return col;
            })
            let startDate = this.dateFormat((Date.now() - 3600 * 1000 * 24 * 31));
            let endDate = this.dateFormat(Date.now() - 3600 * 1000 * 24); // BI的数据最晚只能拿到24小时之前的
            this.selectedDate = [startDate, endDate];
            this.$store.commit('setSubjectDate', this.selectedDate);
            this.init();
        },
        mounted() {
        }
    };
</script>

<style scoped lang="less">
    @import "index.less";
</style>
