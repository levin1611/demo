<template>
    <div class="contents_container">
        <div class="table_time_picker">
            <span class="time_picker_time">{{$t('seo.detailDisplay.indexTimeText')}}</span>
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
        <div class="subject_content_container">
            <Card class="subject_card">
                <div slot="header">
                    <h3>{{subjectDetail['name']}}</h3>
                </div>
                <!-- 主题内容为空时候的展示 -->
                <div class="subject_body" v-if="!subjectDetail['url']">
                    <p>{{$t('seo.detailDisplay.themePageText')}}</p>
                    <Button class="add_subject add-subject" @click="addContent">{{$t('seo.detailDisplay.addContentText')}}</Button>
                </div>
                <!-- 主题内容不为空时的展示 -->
                <div v-else>
                    <Table :data="[subjectDetail]"
                           :header-cell-class-name="headerCellClass"
                           highlight-current-row
                           ref="table1"
                           size="medium"
                           class="tabmain noBoxShadow-right noborder-table"
                           fit>
                        <TableColumn v-for="item in tableColumns"
                                     :key="item.key"
                                     :prop="item.key"
                                     :label="item.title"
                                     :align="item.align || 'left'"
                                     :min-width="item.width || 80"
                                     :width="item.width || 80"
                                     :render-header="item.renderHeader"
                                     :show-overflow-tooltip="true"
                                     :fixed="item.fixed || false">
                            <template slot-scope="scope">
                                <template v-if="item.key === 'name'">
                                    <span class="linkColor">{{scope.row[item.key]}}</span>
                                </template>
                                <template v-else-if="item.key === 'operation'">
                                    <span class="hoverBtn edit-keyword" @click="editContent(scope.row.id)">{{$t('seo.detailDisplay.editText')}}</span>
                                </template>
                                <template v-else>
                                    <span>{{scope.row[item.key]}}</span>
                                </template>
                            </template>
                        </TableColumn>
                    </Table>
                </div>
            </Card>
        </div>
        <div class="sub_sub_container">
            <Card class="sub_subject_card">
                <div slot="header">
                    <h3>{{$t('seo.detailDisplay.SubthemeText')}}</h3>
                </div>
                <div class="sub_subject_table" :style="{minHeight: table_height - 550 + 'px'}">
                    <Table :data="subjectDetail['sub_topic']"
                           :header-cell-class-name="headerCellClass"
                           highlight-current-row
                           ref="table2"
                           size="medium"
                           :height="table_height"
                           class="tabmain noBoxShadow-right noborder-table"
                           fit>
                        <TableColumn v-for="item in subColumns"
                                     :key="item.key"
                                     :prop="item.key"
                                     :label="item.title"
                                     :align="item.align || 'left'"
                                     :min-width="item.width || 80"
                                     :width="item.width || 80"
                                     :render-header="item.renderHeader"
                                     :show-overflow-tooltip="true"
                                     :fixed="item.fixed || false">
                            <template slot-scope="scope">
                                <template v-if="item.key === 'name'">
                                    <p>{{scope.row['name']}}</p>
                                    <p class="linkColor" v-if="scope.row['url']">{{scope.row['url']}}</p>
                                    <p v-else>{{$t('seo.detailDisplay.noContentText')}}</p>
                                </template>
                                <template v-else-if="item.key === 'linked_status' && scope.row['url']">
                                    <span v-if="scope.row[item.key] === 1">{{$t('seo.detailDisplay.hrefText')}}</span>
                                    <span v-else style="color: #FA8241;cursor: pointer" @click="checkLink(scope.row['id'])">{{$t('seo.detailDisplay.inspectHrefText')}}</span>
                                </template>
                                <template v-else-if="item.key === 'linked_status' && !scope.row['url']">
                                    <span>--</span>
                                </template>
                                <template v-else-if="item.key === 'operation'">
                                    <span class="hoverBtn" @click="editContent(scope.row.id)">{{$t('seo.detailDisplay.editText2')}}</span>
                                </template>
                                <template v-else>
                                    <span>{{scope.row[item.key] ? scope.row[item.key] : '--'}}</span>
                                </template>
                            </template>
                        </TableColumn>
                        <div slot="empty" class="empty_content">
                            <p>{{$t('seo.detailDisplay.startText')}}</p>
                        </div>
                    </Table>
                </div>
            </Card>
        </div>
        <editContent :visible.sync="visible_content"
                     :id="editingId" v-if="visible_content"
                     @updateDetail="updateDetail"
                     :countrySelected="countrySelected"
                     :langSelected="langSelected"
                     v-on="$listeners"></editContent>
    </div>
</template>

<script>
    import editContent from './Modals/editContent';
    import util from '../../../../../libs/util';
    import { mapState } from 'vuex';
    export default {
        name: 'contentsDisplay',
        props: ['subjectDetail', 'countrySelected', 'langSelected'],
        components: {
            editContent
        },
        computed: {
            ...mapState({
                window_height: 'window_height',
                subjectDate: state => state.seo.subjectDate
            }),
            table_height() {
                let temp = this.window_height ? this.window_height - 565 : document.body.clientHeight - 565;
                if (temp < 200) {
                    temp = 200;
                }
                temp += this.loading ? 1 : 0;
                return temp;
            }
        },
        data() {
            return {
                subTableData: [],
                subColumns: [
                    {
                        key: 'name',
                        title: this.$t('seo.detailDisplay.nameText'),
                        width: '155px',
                    },
                    {
                        key: 'sessions',
                        title: this.$t('seo.detailDisplay.sessionsText'),
                    },
                    {
                        key: 'duration_avg',
                        title: this.$t('seo.detailDisplay.durationText'),
                        width: '110px'
                    },
                    {
                        key: 'bounce_rate',
                        title: this.$t('seo.detailDisplay.bounceText')
                    },
                    {
                        key: 'pageviews_avg',
                        title: this.$t('seo.detailDisplay.pageviewsText'),
                        width: '120px'
                    },
                    {
                        key: 'dialogues',
                        title: this.$t('seo.detailDisplay.dialoguesText')
                    },
                    {
                        key: 'messages',
                        title: this.$t('seo.detailDisplay.messagesText')
                    },
                    {
                        key: 'clues',
                        title: this.$t('seo.detailDisplay.cluesText')
                    },
                    {
                        key: 'linked_status',
                        title: this.$t('seo.detailDisplay.linkedText'),
                        width: '130px'
                    },
                    {
                        key: 'operation',
                        title: this.$t('seo.detailDisplay.operationText'),
                        width: '70px',
                        fixed: 'right'
                    }
                ], // 子主题表头
                tableColumns: [
                    {
                        key: 'name',
                        title: this.$t('seo.detailDisplay.name'),
                        width: '125px',
                    },
                    {
                        key: 'sessions',
                        title: this.$t('seo.detailDisplay.sessionsText')
                    },
                    {
                        key: 'duration_avg',
                        title: this.$t('seo.detailDisplay.durationText'),
                        width: '110px'
                    },
                    {
                        key: 'bounce_rate',
                        title: this.$t('seo.detailDisplay.bounceText')
                    },
                    {
                        key: 'pageviews_avg',
                        title: this.$t('seo.detailDisplay.pageviewsText'),
                        width: '100px'
                    },
                    {
                        key: 'dialogues',
                        title: this.$t('seo.detailDisplay.dialoguesText')
                    },
                    {
                        key: 'messages',
                        title: this.$t('seo.detailDisplay.messagesText')
                    },
                    {
                        key: 'clues',
                        title: this.$t('seo.detailDisplay.cluesText')
                    },
                    {
                        key: 'operation',
                        title: this.$t('seo.detailDisplay.operationText'),
                        width: '70px',
                        fixed: 'right'
                    }
                ], // 主题表头
                visible_content: false,
                editingId: null,
                loading: false,
                selectedDate: []
            }
        },
        methods: {
            headerCellClass({ column }) {
                if (!['name', 'operation'].includes(column.property)) {
                    return 'hasTipAndFilterCell';
                }
            },
            editContent(id) {
                this.editingId = id;
                this.visible_content = true;
            },
            updateDetail() {
                this.$emit('updateDetail');
            },
            addContent() {
                this.editingId = this.subjectDetail['id']
                this.visible_content = true;
            },
            editContent(row) {
                this.editingId = row;
                this.visible_content = true;
            },
            checkLink(id) {
                // 调用check接口
                util.ajaxAMP({
                    url: '/seotopic/check',
                    method: 'post',
                    data: {
                        id
                    }
                }).then(res => {
                    if (res.data.code === 0) {
                        let data = res.data.data;
                        let status = data['linked_status'];
                        if (status === 1) {
                            this.updateDetail();
                        } else {
                            this.$Message.warning(this.$t('seo.detailDisplay.noHrefText'));
                        }
                    } else {
                        this.$Message.error(res.data.msg);
                    }
                })
            },
            renderHeader_filter_main(colIndex) {
                return h => {
                    const column = this.tableColumns[colIndex];
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
            renderHeader_filter_sub(colIndex) {
                return h => {
                    const column = this.subColumns[colIndex];
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
            change_filter_tag() {
                // 更新数据
                this.$store.commit('setSubjectDate', this.selectedDate);
                // 返回列表时数据更新
                this.updateDetail();
            }
        },
        created() {
            this.subColumns = this.subColumns.map((col, index) => {
                col.renderHeader = this.renderHeader_filter_sub(index);
                return col;
            });
            this.tableColumns = this.tableColumns.map((col, index) => {
                col.renderHeader = this.renderHeader_filter_main(index);
                return col;
            });
            // todo 初始化获取列表页的时间
            this.selectedDate = this.subjectDate;
        }
    };
</script>

<style scoped lang="less">
    @import "contentsDisplay";
</style>
