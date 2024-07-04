<template>
    <div class="multilingualSet">
        <!-- 顶部语种适配切换区域 -->
        <div class="multilingualSet-top">
            <!-- 描述 -->
            <p class="multilingualSet-desc">{{ $t('languageSet.headDesc') }}</p>

            <!-- 切换单语种/多语种 -->
            <RadioGroup v-model="adaptationVal"
                        @change="handleChangeAdaptation"
                        style="margin-bottom:20px;">
                <!-- 多语种 -->
                <Radio :label="2"
                       style="margin-right:20px;">
                    <span style="margin-right:5px;">{{ $t('languageSet.multilingualAdaptation') }}</span>
                    <Tooltip :content="$t('languageSet.multilingualAdaptationTips')"
                             max-width="200"
                             placement="bottom-start">
                        <Icon custom="custom-tip"></Icon>
                    </Tooltip>
                </Radio>
                <!-- 单语种 -->
                <Radio :label="1"
                       style="margin-right:20px;">
                    <span style="margin-right:5px;">{{ $t('languageSet.singleLanguageAdaptation') }}</span>
                    <Tooltip :content="$t('languageSet.singleAdaptationTips')"
                             placement="bottom-start"
                             max-width="200">
                        <Icon custom="custom-tip"></Icon>
                    </Tooltip>
                </Radio>
            </RadioGroup>

            <!-- 语种选择 -->
            <!-- 多语种 -->
            <template v-if="adaptationVal === 2">
                <div class="language-top">
                    <!-- 固定中文不可取消选中 -->
                    <Checkbox :value="true"
                              disabled
                              style="float: left;margin-right: 30px;">{{ $t('lang.zh_CN') }}</Checkbox>

                    <!-- 其他语种勾选 -->
                    <CheckboxGroup :value="checkedLangList"
                                   @input="handleCheckLang">
                        <Checkbox v-for="item in langList"
                                  :key="item.value"
                                  :label="item.value">{{ item.label }}</Checkbox>
                    </CheckboxGroup>
                </div>
            </template>
            <!-- 单语种 -->
            <template v-if="adaptationVal === 1">
                <div class="language-top">
                    <!-- 固定中文不可取消选中 -->
                    <Radio :value="true"
                           :label="true"
                           disabled>{{ $t('lang.zh_CN') }}</Radio>

                    <!-- 其他语种勾选 -->
                    <RadioGroup v-model="singleLanguage"
                                @change="changeRadio">
                        <Radio v-for="item in langList"
                               :key="item.value"
                               :label="item.value">{{ item.label }}</Radio>
                    </RadioGroup>
                </div>
            </template>
        </div>

        <!-- 分割线 -->
        <div class="bg-line"></div>

        <!-- 表格区域 -->
        <div class="multilingualSet-table-wrapper">
            <!-- 是否选中表格行 -->
            <!-- 未选中状态, 显示标题 -->
            <div v-show="!isSelection"
                 style="line-height: 24px">
                <!-- 多语种 -->
                <div v-if="adaptationVal === 1"
                     class="table-title">{{ $t('languageSet.monolingualTable') }}</div>
                <!-- 单语种 -->
                <div v-else-if="adaptationVal === 2"
                     class="table-title">{{ $t('languageSet.multilingualTable') }}</div>

                <!-- 筛选标签 -->
                <FilterTags :order_column="order_column"
                            :order_type="order_type"
                            :storageName_orderColumn="storageName_orderColumn"
                            :filterConObj.sync="config_tableFilter"
                            :langObj="lang_multilingualSet"
                            :width="600"
                            @removeCon="remove_filter_tag"
                            @emptySort="empty_sort"
                            class="multilingualSet-filterTags"></FilterTags>
            </div>
            <!-- 选中状态, 显示多选操作区域 -->
            <div v-show="isSelection"
                 style="padding:15px 0;height:48px">
                <!-- 选中条目数量 -->
                <span style="margin-right:20px;float:left">{{ $t('languageSet.selected') }}<span
                    style="color:rgba(59,120,222,1)">{{ selectedList.length }}</span>{{ $t('languageSet.items') }}</span>

                <!-- 删除按钮 -->
                <span @click="deleteModal = true"
                      style="cursor: pointer;float:left" >
                    <Icon custom="custom custom-field-delete"
                          size="12"
                          style="margin-top:-3px"/>
                    <span style="margin-left: 5px;font-size: 12px;color: rgba(0,0,0,0.8)">{{ $t('delete') }}</span>
                </span>

                <!-- 清除选中 -->
                <Button type="text"
                        @click="clear_checked_sections"
                        style="float:right;margin-top:-3px">
                    <Icon type="md-close"
                          size="18"></Icon>
                </Button>
            </div>

            <!-- table -->
            <Table :data="tableData"
                   v-loading="loading"
                   :height="tableHeight"
                   :highlight-current-row="true"
                   :row-key="getRowKey"
                   cell-class-name="cellWithEditBtn"
                   ref="table"
                   @select-all="handleSelectionChange"
                   @select="handleSelectionChange"
                   class="tabmain noBoxShadow-right noborder-table">
                <!-- 选择列 -->
                <TableColumn type="selection"
                             width="50"
                             align="center"
                             fixed
                             :reserve-selection="true"></TableColumn>

                <!-- 语言列 -->
                <TableColumn v-for="item in tableColumns"
                             :key="item.key"
                             :prop="item.key"
                             :label="item.title"
                             :width="item.width"
                             :min-width="item.minWidth"
                             :render-header="item.renderHeader"
                             :class-name="colClassName[item.key]">
                    <template slot-scope="scope">
                        <!-- 中文列 -->
                        <template v-if="item.key === 'zh_cn'">
                            <TooltipAuto :content="scope.row[item.key]"></TooltipAuto>
                        </template>
                        <!-- 非编辑状态 -->
                        <Row v-else-if="!scope.row.editingCell[item.key]"
                              :gutter="10">
                            <Col :span="21">
                                <TooltipAuto :content="scope.row[item.key]"></TooltipAuto>
                            </Col>
                            <Col :span="3"
                                 :offset="scope.row[item.key] ? 0 : 21">
                                <span @click="scope.row.editingCell[item.key] = true">
                                    <Icon custom="custom-edit"
                                          size="12"
                                          class="multilingualSet-editBtn"></Icon>
                                </span>
                            </Col>
                        </Row>
                        <!-- 编辑状态 -->
                        <Row v-else
                             :gutter="10">
                            <Col :span="21">
                                <Input v-model="scope.row[item.key]"
                                       size="mini"/>
                            </Col>
                            <Col :span="3"
                                 :offset="scope.row[item.key] ? 0 : 21">
                                <span @click="handleCellChange(scope,item.key)">
                                    <i class="el-icon-check"
                                       style="font-size: 12px;cursor: pointer;"></i>
                                </span>
                            </Col>
                        </Row>
                    </template>
                </TableColumn>
            </Table>

            <!-- pager -->
            <div class="main-footer-page">
                <Page :current-page.sync="curPage"
                      :page-size="pageSize"
                      :total="totalNum"
                      layout="total, prev, pager, next, jumper"
                      placement="top"
                      ref="pages"
                      @current-change="changePage"
                      style="display:inline-block"></Page>
            </div>
        </div>

        <!-- 删除适配记录 -->
        <Modal :visible.sync="deleteModal"
               :title="$t('chat.warmPrompt')"
               :show-close="false"
               :modal-append-to-body="false">
            <p>{{ $t('languageSet.tip_deleteRecord') }}</p>

            <div slot="footer">
                <Button size="small"
                        @click="deleteModal=false">{{ $t('cancel') }}</Button>
                <Button type="primary"
                        size="small"
                        @click="deleteSelection">{{ $t('confirm') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import FilterTags from '@/views/main-components/filter-tags';

    export default {
        name: 'languages_set',
        components: {
            FilterTags
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                window_height: state => state.window_height
            }),
            langList() {
                return this.tableColumns.map(item => {
                    return {
                        value: item.key,
                        label: item.title
                    };
                }).filter(item => item.value !== 'zh_cn');
            },
            // 表格高度
            tableHeight() {
                let temp = this.window_height ? this.window_height - 345 : document.body.clientHeight - 345;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            },
            // 控制表格列的 class , 启用时高亮效果
            colClassName() {
                const result = {};

                // 单选
                if (this.adaptationVal === 1) {
                    this.tableColumns.forEach(item => {
                        result[item.key] = (this.singleLanguage === item.key) ? 'langCol-enabled' : 'langCol-disabled';
                    });
                }

                // 多选
                if (this.adaptationVal === 2) {
                    this.tableColumns.forEach(item => {
                        result[item.key] = this.checkedLangList.includes(item.key) ? 'langCol-enabled' : 'langCol-disabled';
                    });
                }

                // 中文列始终高亮
                result.zh_cn = 'langCol-enabled';

                return result;
            }
        },
        data() {
            return {
                /* 全局 */
                // 当前选中的"单语种/多语种"
                adaptationVal: 2,
                // 多语种选中项
                checkedLangList: [],
                // 单语种选中项
                singleLanguage: '',

                /* 表格 */
                loading: true,
                tableData: [],
                tableColumns: [
                    {
                        key: 'zh_cn',
                        title: this.$t('lang.zh_CN'),
                        align: 'center',
                        width: 140
                    },
                    {
                        key: 'zh_tw',
                        title: this.$t('lang.zh_TW'),
                        align: 'center',
                        width: 160
                    },
                    {
                        key: 'en',
                        title: this.$t('lang.en'),
                        align: 'center',
                        minWidth: 120
                    },
                    {
                        title: this.$t('lang.ru'),
                        key: 'ru',
                        align: 'center',
                        minWidth: 130
                    },
                    {
                        title: this.$t('lang.fr'),
                        key: 'fr',
                        align: 'center',
                        minWidth: 120
                    },
                    {
                        title: this.$t('lang.de'),
                        key: 'de',
                        align: 'center',
                        minWidth: 120
                    },
                    {
                        title: this.$t('lang.es'),
                        key: 'es',
                        align: 'center',
                        minWidth: 120
                    },
                    {
                        title: this.$t('lang.ja'),
                        key: 'ja',
                        align: 'center',
                        width: 160,
                        checked: false
                    },
                    {
                        title: this.$t('lang.ar'),
                        key: 'ar',
                        align: 'center',
                        minWidth: 120
                    },
                    {
                        title: this.$t('lang.ko'),
                        key: 'ko',
                        align: 'center',
                        minWidth: 120
                    },
                    {
                        title: this.$t('lang.pt'),
                        key: 'pt',
                        align: 'center',
                        minWidth: 120
                    },
                    {
                        title: this.$t('lang.it'),
                        key: 'it',
                        align: 'center',
                        minWidth: 120
                    },
                    {
                        title: this.$t('lang.th'),
                        key: 'th',
                        align: 'center',
                        minWidth: 120
                    },
                    {
                        title: this.$t('lang.ms'),
                        key: 'ms',
                        align: 'center',
                        minWidth: 120
                    },
                    {
                        title: this.$t('lang.tr'),
                        key: 'tr',
                        align: 'center',
                        minWidth: 120
                    }
                ],
                // 分页
                pageSize: 100,
                totalNum: 0,
                curPage: 1,
                // 多选
                selectedList: [],
                isSelection: false,
                /* 表头筛选 */
                // 筛选配置
                order_column: '',
                order_type: '',
                storageName_orderColumn: '',
                queryData: {
                    $and: []
                },
                config_tableFilter: {},
                lang_multilingualSet: {},

                /* 删除记录弹框 */
                deleteModal: false
            };
        },
        methods: {
            /* 全局 */
            // 获取适配语种 + 刷新表格 -- language：1单语种，2多语种
            getGroupsList() {
                this.loading = true;
                util.ajax({
                    url: '/cuss-login/translate/getConfigListNew',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId
                    }
                }).then(res => {
                    if (res.data.code === '1' && res.data.data && Array.isArray(res.data.data.list)) {
                        // 处理接口返回数据, 回填设置
                        const resLangList = res.data.data.list.map(item => {
                            // 处理特殊数据
                            switch (item) {
                                case 'zh-tw':
                                    return 'zh_tw';
                                case 'zh':
                                    return 'zh_cn';
                                default:
                                    return item;
                            }
                        }).filter(item => item !== 'zh_cn');
                        if (res.data.data.language === 1) {
                            // 单语种
                            this.adaptationVal = 1;
                            this.singleLanguage = resLangList[0];
                        } else {
                            // 多语种

                            this.adaptationVal = 2;
                            this.checkedLangList = resLangList;
                        }

                        // 获取表格数据
                        this.refreshData_filter();
                    } else {
                        this.loading = false;
                    }
                }).catch(error => {
                    console.log(error);
                    this.loading = false;
                });
            },

            /* 语种配置修改 */
            // 保存 单语种/多语种 配置
            saveConfigsNew(transTypes) {
                util.ajax({
                    url: '/cuss-login/translate/saveConfigsNew',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        transTypes,
                        language: this.adaptationVal
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        if (res.data.data) {
                            this.$Message.success(this.$t('editSuccess'));
                            this.getGroupsList();
                        }
                    } else {
                        this.$Message.error(this.$t('editFail'));
                    }
                }).catch(error => {
                    console.log(error);
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error(this.$t('editFail'));
                    }
                });
            },
            // 切换单语种/多语种
            handleChangeAdaptation() {
                // 清除表格选中项
                this.clear_checked_sections();

                let languageTemp = [];
                if (this.adaptationVal === 1) {
                    // 单语种

                    // 适配方式切换时，默认勾选英文
                    languageTemp = ['en'];
                    this.singleLanguage = 'en';
                } else if (this.adaptationVal === 2) {
                    // 多语种

                    // 全选多语种
                    languageTemp = this.langList.map(item => item.value);
                    this.checkedLangList = languageTemp;
                }
                const temp = languageTemp.filter(item => item !== 'zh_cn');
                this.saveConfigsNew(temp.join(','));
            },
            // 更改单语种适配
            changeRadio(singleVal) {
                // 清除表格选中项
                this.clear_checked_sections();

                // 保存
                this.saveConfigsNew(singleVal);
            },
            // 更改多语种适配
            handleCheckLang(cols) {
                cols = cols.filter(item => {
                    return item !== 'zh_cn';
                });
                // 至少勾选一个语种
                if (cols.length !== 0) {
                    this.checkedLangList = cols;
                } else {
                    this.$Message.error(this.$t('languageSet.error_noLangChecked'));
                    return;
                }

                // 清除表格选中项
                this.clear_checked_sections();

                // 调用接口保存
                this.saveConfigsNew(cols.join(','));
            },

            /* 表格 */
            // 获取列表数据
            refreshData() {
                this.loading = true;
                util.ajax({
                    url: '/cuss-login/translate/getList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        pageNo: this.curPage,
                        pageSize: this.pageSize,
                        orderColumn: this.order_column,
                        orderType: this.order_type,
                        query: this.queryData.$and.length ? JSON.stringify(this.queryData) : undefined
                    }
                }).then(res => {
                    if (res.data.code === '1' && res.data.data && Array.isArray(res.data.data.list)) {
                        this.totalNum = res.data.data.total;

                        // 获取标准 editingCell
                        const temp = {};
                        this.tableColumns.forEach(item => {
                            if (item.key !== 'zh_cn') {
                                temp[item.key] = false;
                            }
                        });
                        // 给表格行数据统一加上 editingCell , 编辑单元格数据用
                        this.tableData = res.data.data.list.map(item => {
                            item.editingCell = JSON.parse(JSON.stringify(temp));
                            return item;
                        });
                    } else {
                        this.tableData = [];
                        this.totalNum = 0;
                        this.$Message.error(this.$t('languageSet.getListFail'));
                    }

                    this.loading = false;
                }).catch(error => {
                    console.error(error);
                    this.tableData = [];
                    this.totalNum = 0;
                    this.$Message.error(this.$t('languageSet.getListFail'));
                    this.loading = false;
                });
            },
            // 编辑单元格文本
            handleCellChange(scope, key) {
                const id = scope.row.id;
                const translatedText = scope.row[key];

                // 文本不能为空
                if (translatedText === '') {
                    this.$Message.success(this.$t('languageSet.langTip'));
                    return false;
                }

                // 发送请求
                util.ajax({
                    url: '/cuss-login/translate/updateName',
                    method: 'post',
                    data: {
                        id: id,
                        name: key,
                        value: translatedText
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.$Message.success(this.$t('languageSet.updateSuccess'));
                    } else {
                        this.$Message.error(this.$t('languageSet.updateFailure'));
                    }
                    scope.row.editingCell[key] = false;
                });
            },
            // 改变页码
            changePage(page) {
                this.curPage = page;
                this.refreshData();
            },
            /* 多选相关 */
            getRowKey(row) {
                return row.id;
            },
            // 清除选中语言项
            clear_checked_sections() {
                this.$refs.table.clearSelection();
                this.selectedList = [];
                this.isSelection = false;
            },
            // 处理选中状态变更
            handleSelectionChange(selection) {
                if (selection.length > 0) {
                    this.isSelection = true;
                    this.selectedList = selection.map(item => {
                        return item.id;
                    });
                } else {
                    this.selectedList = [];
                    this.isSelection = false;
                }
            },
            // 删除选中项
            deleteSelection() {
                util.ajax({
                    url: '/cuss-login/translate/delete',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        ids: this.selectedList.join(',')
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.clear_checked_sections();
                        this.getGroupsList();
                        this.$Message.success(this.$t('deleteSuccess'));
                    } else {
                        this.$Message.error(this.$t('deleteFail'));
                    }
                    this.deleteModal = false;
                }).catch(error => {
                    console.log(error);
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error(this.$t('deleteFail'));
                    }
                    this.deleteModal = false;
                });
            },

            /* 表头筛选 */
            // 返回字段筛选渲染函数
            renderHeader_filter(colIndex) {
                return h => {
                    const column = this.tableColumns[colIndex];
                    /* DOM */
                    // 标题
                    const title = h('div', {
                        attrs: {
                            title: column.title
                        },
                        class: 'table-filter-title'
                    }, column.title);
                    // 排序组件
                    const sortIcons = h('span', {
                        class: {
                            'table-sort-icon-container': true
                        }
                    }, [
                        h('Icon', {
                            class: {
                                'icon-custom-on': true,
                                'icon-custom-on-active': this.order_column === column.key && this.order_type === 'asc'
                            },
                            props: {
                                type: 'md-arrow-dropup'
                            }
                        }),
                        h('Icon', {
                            class: {
                                'icon-custom-on': true,
                                'icon-custom-on-active': this.order_column === column.key && this.order_type === 'desc'
                            },
                            props: {
                                type: 'md-arrow-dropdown'
                            }
                        })
                    ]);
                    // 筛选组件
                    const filterPop = h('FilterBox', {
                        props: Object.assign({
                            showPopper: this.tableColumns[colIndex].show_filter_content,
                            filtering: this.tableColumns[colIndex].filtering,
                            columnKey: column.key,
                            columnCon: column.key,
                            order_type: this.order_type,
                            order_column: this.order_column,
                            storageName_orderColumn: this.storageName_orderColumn,
                            confirmBtnCls: ''
                        }, this.config_tableFilter[column.key]),
                        on: {
                            updateList: () => {
                                const temp = this.config_tableFilter[column.key];
                                if (temp) {
                                    // 对当前筛选项数据格式化 + 判断是否处于筛选状态, 更改 filtering 属性
                                    if (temp.query.length) {
                                        this.tableColumns = this.tableColumns.map((item, index) => {
                                            if (index === colIndex) {
                                                item.filtering = true;
                                            }
                                            return item;
                                        });
                                    } else {
                                        this.tableColumns = this.tableColumns.map((item, index) => {
                                            if (index === colIndex) {
                                                item.filtering = false;
                                            }
                                            return item;
                                        });
                                    }

                                    // 刷新列表
                                    this.refreshData_filter();
                                }
                            },
                            'update:showPopper': (val) => {
                                this.tableColumns = this.tableColumns.map((item, index) => {
                                    if (index === colIndex) {
                                        item.show_filter_content = val;
                                    } else if (val) {
                                        item.show_filter_content = false;
                                    }
                                    return item;
                                });
                            },
                            'update:query': (val) => {
                                if (this.config_tableFilter[column.key]) {
                                    this.$set(this.config_tableFilter[column.key], 'query', val);
                                }
                            },
                            'update:order_column': (val) => {
                                this.order_column = val;
                            },
                            'update:order_type': (val) => {
                                this.order_type = val;
                            },
                            'update:storageName_orderColumn': (val) => {
                                this.storageName_orderColumn = val;
                            }
                        }
                    });

                    /* 返回 DOM */
                    return h('div', {
                        class: 'table-filter-container'
                    }, [
                        title, // 标题
                        (this.order_column === column.key && this.order_type) ? sortIcons : undefined, // 排序图标
                        column.hasOwnProperty('show_filter_content') ? filterPop : undefined // 筛选组件
                    ]);
                };
            },
            // close tag 时去掉对应的筛选条件并刷新
            remove_filter_tag(key) {
                // 清空筛选条件
                const temp = this.config_tableFilter[key];
                if (temp) {
                    switch (temp.filterType) {
                        case 'string':
                        case 'number':
                            temp.query = '';
                            break;
                        case 'date':
                        case 'select':
                        case 'selectSingle':
                        case 'countryArea':
                        case 'users':
                            temp.query = [];
                            break;
                    }
                    this.$set(this.config_tableFilter, key, temp);
                }

                // 设置表格 filtering 为 false , 并从表头筛选条件对象中去掉对应筛选项
                const index = this.tableColumns.findIndex(item => item.key === key);
                if (index !== -1) {
                    const col = this.tableColumns[index];
                    col.filtering = false;
                    this.$set(this.tableColumns, index, col);
                }

                this.refreshData_filter();
            },
            // 删掉 sort tag
            empty_sort() {
                // 清空
                this.order_column = '';
                this.order_type = '';

                // 刷新
                this.refreshData_filter();
            },
            // 配置表头筛选
            handleConfigureTableFilter() {
                // 配置表头筛选 + 多语言
                const tmpConfigObj = {};
                const tmpLangObj = {};
                this.tableColumns.forEach(item => {
                    tmpConfigObj[item.key] = {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    };
                    tmpLangObj[item.key] = item.title;
                });
                this.config_tableFilter = tmpConfigObj;
                this.lang_multilingualSet = tmpLangObj;

                // 根据配置给表格列设置表头渲染函数
                this.tableColumns.forEach((col, index) => {
                    const headSet = this.config_tableFilter[col.key];
                    if (headSet && (headSet.sort || headSet.filter)) {
                        col.show_filter_content = false;
                        col.filtering = false;
                        col.renderHeader = this.renderHeader_filter(index);
                    }
                    this.$set(this.tableColumns, index, col);
                });
            },
            // 处理检索条件
            merge_query_list() {
                const result = [];

                Object.entries(this.config_tableFilter).forEach(([key, config]) => {
                    if (config.filter && config.query.length) {
                        const filterKey = this.get_search_con(key);
                        if (!filterKey) {
                            return;
                        }

                        const temp = {};
                        switch (config.filterType) {
                            case 'string':
                                temp[filterKey] = {
                                    $regex: config.query
                                };
                                result.push(temp);
                                break;
                        }
                    }
                });

                this.$set(this.queryData, '$and', result);
            },
            // 根据筛选列的 key , 返回接口所需要的查询参数名
            get_search_con(key) {
                return key || '';
            },
            // 检索并刷新表格
            refreshData_filter() {
                // 清除表格选中项
                this.clear_checked_sections();

                // 合并筛选数据
                this.merge_query_list();

                // 切换到首页
                this.curPage = 1;
                this.refreshData();
            }
        },
        created() {
            // 配置表格筛选
            this.handleConfigureTableFilter();
            this.getGroupsList();
        }
    };
</script>

<style lang="less">
    @import '../../styles/common.less';

    .multilingualSet {
        padding: 20px 30px 0;
        font-size: 12px;
        line-height: 18px;
        color: rgba(0, 0, 0, .8);

        .el-radio__label {
            font-size: 12px;
            line-height: 18px;
            color: rgba(0, 0, 0, .8);
        }

        &-editBtn {
            display: none;
            margin-left: -10px;
            cursor: pointer;
        }

        &-top {
            background-color: #fff !important;
        }

        &-desc {
            padding-top: 10px;
            margin-bottom: 20px;
            font-size: 12px;
            line-height: 18px;
            white-space: pre-wrap;
        }

        .language-top {
            font-size: 16px;
            margin-bottom: 20px;
            position: relative;

            .el-radio-group {
                display: inline;
            }
        }

        .bg-line {
            background-color: #f4f5f8 !important;
            height: 10px;
            width: calc(100% + 60px);
            margin-left: -30px;
        }

        .table-title {
            font-size: 16px;
            padding: 12px 0;
            color: rgba(0, 0, 0, .8);
            margin-right: 10px;
            display: inline-block;
        }
    }

    .tabmain .el-input__inner {
        padding: 0 7px !important;
    }

    .langCol-enabled {
        color: #606266;
    }

    .langCol-disabled {
        color: rgba(0, 6, 15, 0.4);
    }

    .cellWithEditBtn {
        &:hover {
            .multilingualSet-editBtn {
                display: inline-block;
            }
        }
    }
</style>
