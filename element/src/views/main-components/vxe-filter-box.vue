<template>
  <div
    ref="container"
    class="filter-component show-filter-component"
  >1222222222222
    {{sort}} {{filter}}  {{filterType}}
      <!-- Poptip 内容 -->
      <div style="font-weight: 400">
        <!-- 升序降序 -->
        <ul v-if="sort" class="filter-seq">
          <li @click="sortBy('asc')">
            <Icon custom="custom-ascending"></Icon>
            <span>{{ $t("tableFilter.ascend") }}</span>
          </li>
          <li @click="sortBy('desc')">
            <Icon custom="custom-descending"></Icon>
            <span>{{ $t("tableFilter.descend") }}</span>
          </li>
        </ul>

        <!-- 内容筛选 -->
        <div v-if="filter" class="filter-content clearfix">
          <!-- 顶部内容 -->
          <div v-if="sort" class="line"></div>
          <div class="title">
            <Icon custom="custom-table-filter"></Icon>
            <span>{{ $t("tableFilter.contentFilter") }}</span>
            <!-- 清除筛选按钮 -->
            <span v-if="filtering" @click="clear_filter" class="clear-filter">{{
              $t("tableFilter.clearFilter")
            }}</span>
          </div>

          <!-- 选项型 -->
          <template v-if="filterType === 'select'">
            <Input
              v-model="keywords"
              :placeholder="$t('tableFilter.tip_inputKeyWords')"
              @input="getCheckList"
            >
              <Icon
                slot="suffix"
                type="ios-search"
                :size="16"
                @click.native="getCheckList(keywords)"
                style="line-height: 32px; cursor: pointer"
              ></Icon>
            </Input>
            <div class="filter-items _self_filter_items">
                <Checkbox :value="checkAll"
                            v-if="selectAll && checkList.length === (
                                !blank ? allList.length
                                : allList.length + 1)"
                            :indeterminate="indeterminate"
                            @click.native.prevent="handleCheckAll">{{ $t('tableFilter.all') }}</Checkbox>
              <CheckboxGroup
                :value="checkGroup.map((item) => item.value)"
                @input="handleCheck"
              >
                <Checkbox
                  v-for="item in checkList"
                  :key="item.value"
                  :label="item.value"
                  >{{ item.label }}</Checkbox
                >
                <!-- style="overflow:hidden" -->
              </CheckboxGroup>
            </div>
          </template>
          <!-- 单选型 -->
          <template v-else-if="filterType === 'selectSingle'">
              <!-- 筛选框 -->
              <Input
                  v-model="keywords"
                  :placeholder="$t('tableFilter.tip_inputKeyWords')"
                  @input="getRadioList"
              >
                  <Icon
                      slot="suffix"
                      type="ios-search"
                      :size="16"
                      @click.native="getRadioList(keywords)"
                      style="line-height: 32px; cursor: pointer"
                  ></Icon>
              </Input>
            <div class="filter-items">
              <RadioGroup v-model="selectedSingle">
                <Radio
                  v-for="item in radioList"
                  :key="item.value"
                  :label="item.value"
                  >{{ item.label }}</Radio
                >
              </RadioGroup>
            </div>
          </template>
          <!-- 字符型 -->
          <template v-else-if="filterType === 'string'">
            <Input
              v-model="keywords"
              :placeholder="$t('tableFilter.tip_inputKeyWords')"
              @keyup.enter.native="confirm"
            ></Input>
          </template>
          <!-- 数字型 -->
          <template v-else-if="filterType === 'number'">
        <div style="display:flex;align-items:center;">
            <InputNumber
                v-model="keywordObj.$gte"
                ref="leftInput"
                :min="0"
                controls-position="right"
                @keyup.enter.native="confirm"
                @input.native="handleInput($event, 1)"
                style="width: 42%"
            ></InputNumber>
            <div style="margin: 0 3%;color: #B0B0B0;">—</div>
            <InputNumber
                v-model="keywordObj.$lte"
                ref="rightInput"
                :min="0"
                controls-position="right"
                @keyup.enter.native="confirm"
                @input.native="handleInput($event, 2)"
                style="width: 42%"
            ></InputNumber>
        </div>

          </template>
          <!-- 国家地区型 -->
          <template v-else-if="filterType === 'countryArea'">
            <CountryAreaSelect
              :countryArea.sync="countryAreaCode"
              :url="url"
              :placeholderDrop="placeholderDrop"
              inputStyle="width: 198px;"
              ref="countryArea"
            ></CountryAreaSelect>
          </template>
          <!-- 日期时间型 -->
          <template v-else-if="filterType === 'date'">
            <div class="small-date-panel-container">
              <DatePicker
                v-model="dateTimes"
                type="daterange"
                :picker-options="dateOptions"
                :inline="true"
                class="small-date-panel"
              ></DatePicker>
            </div>
          </template>
          <!-- 用户型 -->
          <template v-else-if="filterType === 'users'">
            <!--<Spin fix v-if="loading_tree"></Spin>-->
            <template v-if="init_tree.length">
              <Input
                v-model="keywords"
                :placeholder="$t('tableFilter.tip_inputKeyWords')"
                @input="generate_child_tree(keywords)"
              >
                <Icon
                  slot="suffix"
                  type="ios-search"
                  :size="16"
                  @click.native="generate_child_tree(keywords)"
                  style="line-height: 32px; cursor: pointer"
                ></Icon>
              </Input>
                <Checkbox :value="checkAll"
                            v-if="selectAll && tree_data.length && !keywords"
                            style="margin: 15px 0 0 10px;"
                            :indeterminate="indeterminate"
                            @click.native.prevent="handleCheckAll">{{ $t('tableFilter.all') }}</Checkbox>
              <div
                class="filter-items filter-tree"
                :style="{ 'max-height': '289px' }"
              >
                <Tree
                  :data="tree_data"
                  show-checkbox
                  multiple
                  default-expand-all
                  node-key="id"
                  :render-content="renderContent"
                  ref="update_tree"
                  @check-change="change_selected_userIds"
                ></Tree>
              </div>
            </template>
            <template v-else>
              <Checkbox :value="true" disabled>{{ fullName }}</Checkbox>
            </template>
          </template>
          <!-- 用户型 -->
          <template v-else-if="filterType === 'departments'">
            <template v-if="departmentsData.length">
              <Input
                v-model="keywords"
                :placeholder="$t('tableFilter.tip_inputKeyWords')"
                @input="generate_departments_data(keywords)"
              >
                <Icon
                  slot="suffix"
                  type="ios-search"
                  :size="16"
                  @click.native="generate_departments_data(keywords)"
                  style="line-height: 32px; cursor: pointer"
                ></Icon>
              </Input>
              <div
                class="filter-items filter-tree"
                :style="{ 'max-height': '289px' }"
              >
                <Tree
                  :data="departmentsTree"
                  show-checkbox
                  default-expand-all
                  node-key="id"
                  :render-content="renderContent"
                  ref="department_tree"
                  style="margin-top: 15px"
                  @check-change="change_selected_departmentIds"
                ></Tree>
              </div>
            </template>
          </template>
          <!-- 访问来源类别增加树形结构 -->
          <template v-else-if="filterType === 'trafficSource'">
            <Input
              v-model="keywords"
              :placeholder="$t('tableFilter.tip_inputKeyWords')"
            >
              <Icon
                slot="suffix"
                type="ios-search"
                :size="16"
                @click.native="findTrfficSource(keywords)"
                style="line-height: 32px; cursor: pointer"
              ></Icon>
            </Input>
            <div
              class="filter-items filter-tree"
              :style="{ 'max-height': '289px' }"
            >
              <Tree
                :data="trafficSourceList"
                show-checkbox
                node-key="id"
                :props="trafficProps"
                :default-expanded-keys="[10]"
                :default-checked-keys="selectedTrafficSourceId"
                style="margin-top: 15px"
                ref="trafficSource"
                @check-change="changeSelectTrafficSource"
              ></Tree>
            </div>
          </template>

          <!-- 底部按钮 -->
          <div class="search-btns">
            <Button @click="closePoptip" type="minor" size="small">{{
              $t("cancel")
            }}</Button>
            <Button
              type="success"
              size="small"
              @click="confirm"
              :class="class_headerscreening"
              >{{ $t("confirm") }}</Button
            >
          </div>
        </div>
      </div>
  </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: 'filter_box',
        components: {
        },
        props: [
            'columnKey', // 当前 storageName
            'columnCon', // 当前 storageName 对应的 searchCon
            'sort', // 是否允许排序
            'filter', // 是否允许筛选
            'filterType', // 筛选类型
            'url', // 数据源
            'placeholderDrop', // 默认提示
            'blank', // 不要 空(未填写)
            'dateOptions', // 日期筛选配置
            'filtering', // 是否正在筛选
            'showPopper', // 是否正在显示筛选框
            'query', // 筛选值
            'allList', // 所有可能的筛选条件
            'order_column', // 表格当前的筛选字段在数据库中的字段名
            'order_type', // 表格当前的筛选类型
            'storageName_orderColumn', // 表格当前的筛选字段的 storageName
            'columnType', // 表格页类型 1客户2联系人3询盘4公海客户5线索6公海线索7fbleads8权限部门用户管理9功能权限管理10访客历史11网站留言
            // 确认按钮 class
            'confirmBtnCls',
            'selectAll', // 是否显示全选
            'withRole' // 与用户权限挂钩, 目前只有用户型筛选用到
        ],
        computed: {
            // 因为iview table组件渲染带fixed的column时, 会渲染两个thead, fixed专门渲染一个thead
            // 所以页面中有多个相同的filterBox, props变化使poptip显示弹窗时, 第二个看不见的poptip也会弹出
            // 这个属性就是为了去掉第二个显示出来的poptip
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName'
            }),
            width_popper() {
                switch (this.filterType) {
                    case 'date':
                        return 682 - (this.dateOptions ? 0 : 92);
                    case 'users':
                        return 320;
                    case 'departments':
                        return '';
                    default:
                        return 230;
                }
            },
            class_headerscreening() {
                if (this.confirmBtnCls) {
                    return this.confirmBtnCls;
                }

                switch (`${this.columnType}`) {
                    case '1':
                        return 'customer-headerscreening';
                    case '2':
                        return 'contact-headerscreening';
                    case '3':
                        return 'inquiry-headerscreening';
                    case '4':
                        return 'highseasCustomer-headerscreening';
                    case '5':
                        return 'clue-header-screening';
                    case '7':
                        // fbleads
                        return 'leads-filterColumns-confirm';
                    case '15':
                        return 'googleOptimize-headerscreening';
                    default:
                        return '';
                }
            },
            selectedTrafficSourceId() {
                return this.selectedTrafficSource.map((item) => item.value);
            }
        },
        data() {
            return {
                /* 筛选 */
                // 所有类型通用
                showing: false, // 当前面板是否显示中
                isHidden: false, // 是否为 th.is-hidden 下的 filterBox
                keywords: '', // 搜索词
                // 数字类型的筛选组件变为两个参数
                keywordObj: {
                    $gte: 0,
                    $lte: 0
                },

                // 选择型, 负责人型
                checkList: [], // 经过关键词筛选后的所有选项
                checkGroup: [], // 选中项

                // 单选型
                radioList: [],
                selectedSingle: '',

                // 日期型
                dateTimes: [],

                // 国家地区型
                countryAreaCode: '',

                // 用户型
                loading_tree: true,
                selected_userIds: [],
                tree_data: [],
                user_list: [],
                init_tree: [],
                selectedTrafficSource: [],
                trafficSourceList: [],
                trafficProps: {
                    children: 'children',
                    label: 'label'
                },
                oldTrafficSourceList: [
                    {
                        label: this.$t('visitor_history.ad_google'),
                        id: 1
                    },
                    {
                        label: this.$t('visitor_history.ad_facebook'),
                        id: 2
                    },
                    {
                        label: this.$t('visitor_history.ad_yandex'),
                        id: 9
                    },
                    {
                        label: this.$t('visitor_history.ad_other'),
                        id: 3
                    },
                    {
                        label: this.$t('visitor_history.email_marketing'),
                        id: 4
                    },
                    {
                        label: this.$t('visitor_history.ad_cloudshare'),
                        id: 10,
                        children: [
                            {
                                label: this.$t('visitor_history.cloudshare_facebook'),
                                id: 101
                            },
                            {
                                label: this.$t('visitor_history.cloudshare_messenger'),
                                id: 102
                            },
                            {
                                label: this.$t('visitor_history.cloudshare_whatsApp'),
                                id: 103
                            },
                            {
                                label: this.$t('visitor_history.cloudshare_email'),
                                id: 104
                            },
                            {
                                label: this.$t('visitor_history.cloudshare_other'),
                                id: 105
                            }
                        ]
                    },
                    {
                        label: this.$t('visitor_history.search_engine'),
                        id: 5
                    },
                    {
                        label: this.$t('visitor_history.social_network'),
                        id: 6
                    },
                    {
                        label: this.$t('visitor_history.other_referrals'),
                        id: 7
                    },
                    {
                        label: this.$t('visitor_history.direct_access'),
                        id: 8
                    }
                ],
                departmentProps: {
                    children: 'children',
                    label: 'title'
                },
                departmentsData: [],
                departmentsTree: [],
                selected_departmentsIds: [],
                checkAll: false,
                indeterminate: false

            };
        },
        methods: {
            // input只能输入数字
            handleInput(e, index) {
                if (!e.data) {
                    return;
                };
                const _this = this;
                const number = e.target.value.match(/\d+(\.)?(\d+)?/g);

                if (index === 2) {
                    this.keywordObj.$lte = Array.isArray(number) ? number[0] : '';
                    // 延迟修改数据
                    setTimeout(() => {
                        _this.$refs.rightInput.userInput = Array.isArray(number) ? number[0] : '';
                    });
                } else {
                    this.keywordObj.$gte = Array.isArray(number) ? number[0] : '';
                    // 延迟修改数据
                    setTimeout(() => {
                        _this.$refs.leftInput.userInput = Array.isArray(number) ? number[0] : '';
                    });
                }
            },
            /**
             * @Date: 2020-07-13 11:05:45
             * @LastEditors: niumkiki
             * @description: 访客历史访问来源类别增加树结构
             * @param :
             * @return:
             */
            changeSelectTrafficSource() {
                const selectArr = this.$refs.trafficSource.getCheckedNodes();
                this.selectedTrafficSource = selectArr.map((item) => {
                    return {
                        value: item.id,
                        label: item.label
                    };
                });
            },
            findTrfficSource(title) {
                const searchStr = title || ''; // 要搜索的文字
                const temp = JSON.parse(JSON.stringify(this.oldTrafficSourceList));

                function searchTitle(nodes, searchStr) {
                    return nodes
                        .map((node) => {
                            if (node.label.includes(searchStr)) {
                                return node;
                            } else if (node.children) {
                                node.children = searchTitle(node.children, searchStr);
                                if (node.children.length) {
                                    return node;
                                } else {
                                    return undefined;
                                }
                            } else {
                                return undefined;
                            }
                        })
                        .filter((item) => item);
                }

                this.trafficSourceList = searchTitle(temp, searchStr);
            },
            /* Poptip 显隐 */
            // 国家地区还是个Poptip ，因此模拟hover,实际是click
            hover_poptip_icon() {
                if (!this.isHidden && (!this.showing || !this.showPopper)) {
                    this.$refs.reference.$el.click();
                }
            },
            show() {
                this.showing = true;
                if (!this.showPopper) {
                    this.$emit('update:showPopper', true);
                }
                switch (this.filterType) {
                    case 'string':
                        this.keywords = this.query;
                        break;
                    case 'number':
                        // show的时候,获取已查询的值 || 0
                        this.keywordObj.$gte = this.query.includes('-') ? this.query.slice(0, this.query.indexOf('-')) : 0;
                        this.keywordObj.$lte = this.query.includes('-') ? this.query.slice(this.query.indexOf('-') + 1, this.query.length) : 0;
                        break;
                    case 'date':
                        this.dateTimes = this.query;
                        this.$emit('onChangeTimeChoose', true);
                        break;
                    case 'countryArea':
                        this.countryAreaCode = this.query[0] || '';
                        break;
                    case 'select':
                        if (!this.blank) {
                            this.checkList = [...this.allList];
                        } else {
                            this.checkList = [...this.allList].concat([
                                {
                                    value: null,
                                    label: this.$t('tableFilter.defaultOption_blank')
                                }
                            ]);
                        }
                        this.$nextTick(() => {
                            this.getChecked();
                        });
                        break;
                    case 'selectSingle':
                        this.radioList = [...this.allList];
                        this.selectedSingle = this.query[0] ? this.query[0].value : '';
                        break;
                    case 'users':
                        this.selected_userIds = this.$deepClone(this.query);
                        if (this.tree_data.length) {
                            this.tree_data = this.get_tree(
                                this.init_tree,
                                this.user_list,
                                this.selected_userIds.map((item) => {
                                    const temp = {};
                                    temp.userId = item.value;
                                    return temp;
                                })
                            );
                            if (!this.blank) {
                                this.tree_data = [...this.tree_data];
                            } else {
                                this.tree_data = [...this.tree_data].concat([
                                    {
                                        checked: false,
                                        children: [],
                                        expand: true,
                                        id: -1,
                                        parentId: 0,
                                        type: 'person',
                                        title: this.$t('tableFilter.defaultOption_blank')
                                    }
                                ]);
                            }
                            if (this.selected_userIds.length) {
                                const ids = this.selected_userIds.map((item) => item.value);
                                // this.tree_data.forEach((item) => (item.checked = ids.includes(item.id)));
                                this.$refs.update_tree.setCheckedKeys(ids);
                            } else {
                                this.$refs.update_tree.setCheckedKeys([]);
                            }
                        } else {
                            this.get_update_tree();
                        }
                        break;
                    case 'departments':
                        this.selected_departmentsIds = this.$deepClone(this.query);
                        if (this.departmentsData.length) {
                            this.departmentsTree = this.get_departments_tree(this.departmentsData);
                            if (this.blank) {
                                this.departmentsTree = [...this.departmentsTree].concat([
                                    {
                                        children: [],
                                        id: -1,
                                        parentId: 0,
                                        title: this.$t('tableFilter.defaultOption_blank')
                                    }
                                ]);
                            }
                            // 选中回显用 暂不支持，
                            // if (this.selected_departmentsIds.length) {
                            //     const selected_departmentsIds = this.selected_departmentsIds.map((item) => item.value);
                            //     console.log(selected_departmentsIds);
                            //     this.$refs.department_tree.setCheckedKeys(selected_departmentsIds);
                            // }
                        } else {
                            this.getDepartmentsData();
                        }
                        break;
                    case 'trafficSource':
                        // this.clearTrafficSelect(this.oldTrafficSourceList);
                        this.selectedTrafficSource = this.$deepClone(this.query);
                        this.trafficSourceList = JSON.parse(JSON.stringify(this.oldTrafficSourceList));
                        break;
                }
                this.$emit('closeDepartmentTree');
            },
            hide() {
                this.showing = false;
                if (this.showPopper) {
                    this.$emit('update:showPopper', false);
                }
                // 重置访客来源类别的选项
                this.selectedTrafficSource = [];
                this.$refs.trafficSource && this.$refs.trafficSource.setCheckedKeys([]);
                //   组件隐藏时,恢复为0
                const _this = this;
                setTimeout(() => {
                    _this.keywordObj = {
                        $gte: 0,
                        $lte: 0
                    };
                }, 400);
                this.keywords = '';
                this.checkGroup = [];
                this.checkAll = false;
                this.indeterminate = false;
                this.selectedSingle = '';
                this.dateTimes = '';
                this.countryAreaCode = '';
                this.closePoptip();
            },

            /* 搜索框内容改变 更新多选框项
                    当前搜索规则是 同时包含所有关键字的内容 关键字以空格隔开
                */
            getCheckList(data) {
                if (!this.blank) {
                    this.checkList = this.allList.filter((item) => item.label.indexOf(this.keywords) !== -1);
                } else {
                    this.checkList = this.allList
                        .filter((item) => item.label.indexOf(this.keywords) !== -1)
                        .concat([
                            {
                                value: null,
                                label: this.$t('tableFilter.defaultOption_blank')
                            }
                        ]);
                }
                /* 不加nexttick后面的操作会在之前checkgroup的基础上做操作，出现偏差 */
                this.$nextTick(() => {
                    this.getChecked();
                });
            },
            getRadioList(data) {
                this.radioList = this.allList.filter((item) => item.label.indexOf(this.keywords) !== -1);
            },

            /* 排序 */
            sortBy(type) {
                this.$emit('update:order_type', type);
                this.$emit('update:order_column', this.columnCon);
                this.$emit('update:storageName_orderColumn', this.columnKey);
                this.$emit('updateList', this.checkAll); // 记录当前筛选字段是否显示全选
                this.closePoptip();
            },

            /* 勾选 */
            // 获取传入的选中项与筛选后的所有选项的交集, 并勾选中
            getChecked() {
                if (this.query.length > 0) {
                    const arr = [];
                    this.checkList.forEach((item) => {
                        if (this.query.map((item) => item.value).includes(item.value)) {
                            arr.push(item);
                        }
                    });
                    this.checkGroup = arr;
                    this.handleCheck(this.checkGroup.map((item) => item.value));
                }
            },
            // 勾选
            handleCheck(data) {
                if (!this.blank) {
                    this.checkGroup = data
                        .map((item) => this.allList.find((option) => option.value === item))
                        .filter((item) => !(!item || item === ''));
                } else {
                    this.checkGroup = data
                        .map((item) =>
                            this.allList
                                .concat([
                                    {
                                        value: null,
                                        label: this.$t('tableFilter.defaultOption_blank')
                                    }
                                ])
                                .find((option) => option.value === item))
                        .filter((item) => !(!item || item === ''));
                }

                if (this.checkList.length === this.checkGroup.length &&
                    (this.filterType === 'select'
                        ? (this.checkGroup.length === (!this.blank ? this.allList.length : this.allList.length + 1))
                        : !this.keywords)
                ) {
                    this.checkAll = true;
                    this.indeterminate = false;
                } else if (this.checkGroup.length > 0 &&
                    (this.filterType === 'select'
                        ? (this.checkGroup.length === (!this.blank ? this.allList.length : this.allList.length + 1))
                        : !this.keywords)
                ) {
                    this.checkAll = false;
                    this.indeterminate = true;
                } else {
                    this.indeterminate = false;
                    this.checkAll = false;
                }
            },
            // 清除筛选
            clear_filter() {
                switch (this.filterType) {
                    case 'string':
                        this.keywords = '';
                        this.$emit('update:query', this.keywords);
                        break;
                    case 'number':
                        // 清除筛选时,变为0
                        this.keywordObj = {
                            $gte: 0,
                            $lte: 0
                        };
                        this.$emit('update:query', false);
                        break;
                    case 'countryArea':
                        this.countryAreaCode = '';
                        this.$emit(
                            'update:query',
                            this.countryAreaCode
                                ? [this.countryAreaCode, this.$refs.countryArea.value_show]
                                : []
                        );
                        break;
                    case 'select':
                        this.checkGroup = [];
                        this.checkAll = false;
                        this.indeterminate = false;
                        this.$emit('update:query', this.checkGroup);
                        break;
                    case 'selectSingle':
                        this.selectedSingle = '';
                        this.$emit('update:query', []);
                        break;
                    case 'date':
                        this.dateTimes = [];
                        this.$emit('update:query', this.dateTimes);
                        break;
                    case 'users':
                        this.selected_userIds = [];
                        if (this.init_tree.length) {
                            this.tree_data = this.get_tree(this.init_tree, this.user_list, []);
                        }
                        this.$emit('update:query', this.selected_userIds);
                        break;
                    case 'departments':
                        this.selected_departmentsIds = [];
                        if (this.departmentsData.length) {
                            this.departmentsTree = this.get_departments_tree(this.departmentsData);
                        }
                        this.$emit('update:query', this.selected_departmentsIds);
                        break;
                    case 'trafficSource':
                        this.selectedTrafficSource = [];
                        this.$emit('update:query', this.selectedTrafficSource);
                        break;
                }
                this.$emit('updateList', this.checkAll); // 记录当前筛选字段是否显示全选
                this.closePoptip();
            },

            /* 确定取消 */
            confirm() {
                switch (this.filterType) {
                    case 'string':
                        this.keywords =
                            typeof this.keywords === 'string'
                                ? this.keywords.trim()
                                : this.keywords;
                        this.$emit('update:query', this.keywords);
                        break;
                    case 'number':
                        // (this.keywordObj.$gte === 0 && this.keywordObj.$lte === 0) ||
                        // 左侧的值大于右侧的值、左侧右侧的值输入都为空时
                        if ((this.keywordObj.$gte > this.keywordObj.$lte) || typeof (this.keywordObj.$gte) === 'undefined' || typeof (this.keywordObj.$lte) === 'undefined') {
                            this.$Message.warning({
                                message: this.$t('authority.pleaseEnterTheCorrectNumberRange'),
                                duration: 1500
                            });
                            return;
                        };
                        this.$emit('update:query', this.keywordObj);
                        break;
                    case 'countryArea':
                        this.$emit(
                            'update:query',
                            this.countryAreaCode
                                ? [this.countryAreaCode, this.$refs.countryArea.value_show]
                                : []
                        );
                        break;
                    case 'select':
                        this.$emit('update:query', this.checkGroup);
                        break;
                    case 'selectSingle':
                        this.$emit(
                            'update:query',
                            this.radioList.filter((item) => item.value === this.selectedSingle)
                        );
                        break;
                    case 'date':
                        this.$emit('update:query', this.dateTimes);
                        break;
                    case 'users':
                        this.$emit(
                            'update:query',
                            this.init_tree.length ? this.selected_userIds : []
                        );
                        break;
                    case 'departments':
                        this.$emit(
                            'update:query',
                            this.departmentsData.length ? this.selected_departmentsIds : []
                        );
                        break;
                    case 'trafficSource':
                        this.$emit('update:query', this.selectedTrafficSource);
                        break;
                }
                this.$emit('updateList', this.checkAll); // 记录当前筛选字段是否显示全选
                this.closePoptip();
            },
            closePoptip() {
                if (this.$refs.countryArea) {
                    this.$refs.countryArea.doClose();
                }
                this.$refs.poptip.doClose();
            },

            /* 用户型 */
            async get_update_tree() {
                let reqDepartment;
                if (this.withRole) {
                    reqDepartment = this.$commonApi.getCrmManageDepartments({
                        orgId: this.enterpriseId,
                        userId: this.userId
                    });
                } else {
                    reqDepartment = this.$commonApi.getCrmManageAllDepartments({
                        orgId: this.enterpriseId
                    });
                }
                reqDepartment.then(data => {
                    if (data.code === '1') {
                        return new Promise((resolve) => {
                            this.init_tree = data.data;
                            if (Array.isArray(data.data) && data.data.length) {
                                resolve();
                            } else {
                                this.loading_tree = false;
                            }
                        });
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.departmentErr'));
                        this.loading_tree = false;
                    }
                }).then(() => {
                    let reqUser;
                    if (this.withRole) {
                        reqUser = this.$commonApi.getCrmUserByleaderUserId({
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            status: this.columnKey === 'companyManagersBefore' ? 1 : undefined
                        });
                    } else {
                        reqUser = this.$commonApi.getCrmUserByleaderOrgId({
                            orgId: this.enterpriseId,
                            status: this.columnKey === 'companyManagersBefore' ? 1 : undefined
                        });
                    }
                    reqUser.then(data => {
                        console.error(data);
                        if (data.code === '1') {
                            this.user_list = data.data;
                            this.tree_data = this.get_tree(this.init_tree, this.user_list);
                            if (!this.blank) {
                                this.tree_data = [...this.tree_data];
                            } else {
                                this.tree_data = [...this.tree_data].concat([
                                    {
                                        checked: false,
                                        children: [],
                                        expand: true,
                                        id: -1,
                                        parentId: 0,
                                        type: 'person',
                                        title: this.$t('tableFilter.defaultOption_blank')
                                    }
                                ]);
                            }
                            if (this.selected_userIds.length) {
                                const ids = this.selected_userIds.map((item) => item.value);
                                // this.tree_data.forEach((item) => (item.checked = ids.includes(item.id)));
                                this.$refs.update_tree.setCheckedKeys(ids);
                            } else {
                                this.$refs.update_tree.setCheckedKeys([]);
                            }
                        } else {
                            this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                        }
                        this.loading_tree = false;
                    });
                });
            },
            get_tree(param_arr, user_list, check_arr) {
                const userList = user_list.map((item) => {
                    const obj = {};
                    obj.parentId = item.departmentId;
                    obj.name = item.fullname;
                    obj.power = item.manageName;
                    obj.id = item.id;
                    obj.check = false;
                    obj.type = 'person';
                    return obj;
                });

                if (check_arr) {
                    for (const check_item of check_arr) {
                        for (const user_item of userList) {
                            if (check_item.userId === user_item.id) {
                                user_item.check = true;
                            }
                        }
                    }
                }
                const arr = param_arr.map((item) => {
                    const obj = {};
                    obj.parentId = item.parentId;
                    obj.name = item.name;
                    obj.id = item.id;
                    return obj;
                });
                let parent_arr = [];

                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].parentId === 0) {
                        parent_arr.push(arr[i]);
                        arr.splice(i, 1);
                        i = i - 1;
                    }
                }

                function structure_parent_arr(arr) {
                    return arr.map((item) => {
                        const obj = {};
                        obj.title = item.name;
                        obj.id = item.id;
                        obj.parentId = item.parentId;
                        obj.checked = item.check;
                        obj.expand = true;
                        obj.children = [];
                        return obj;
                    });
                }

                parent_arr = structure_parent_arr(parent_arr);

                function build_child(parent_arr, arr) {
                    /**
                     * @Description: 企业下人员列表和部门列表在后端存储的是两张表，存在人员id和部门id相同的情况
                     * 一旦出现这种情况，会导致本来应属于某一部门下的人员，出现在某一人员的子节点中，示例见bug[1002136]
                     * 解决方案为：
                     * 在获取人员列表时，每一项加上type='person'，部门列表每一项添加上type='department'，
                     * 遍历添加子节点时，加上filter，解决当传入的父节点数组中既有人员又有部门的情况，
                     * 保证只有type为department的父节点才会有children属性，才可以添加子节点
                     * @author 杨娣
                     * @date 2019/11/22
                     */
                    parent_arr = parent_arr.filter((item) => item.type !== 'person');
                    for (let j = 0; j < parent_arr.length; j++) {
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i].parentId === parent_arr[j].id) {
                                parent_arr[j].checked = false;
                                const obj = {};
                                obj.title = arr[i].name;
                                obj.id = arr[i].id;
                                obj.power = arr[i].power;
                                obj.parentId = arr[i].parentId;
                                obj.grandpa_id = parent_arr[j].parentId;
                                obj.parent_name = parent_arr[j].title;
                                if (arr[i].category === 1) {
                                    obj.menu = 'department';
                                } else {
                                    obj.menu = 'person';
                                }
                                obj.type = arr[i].type;
                                obj.expand = true;
                                obj.checked = arr[i].check;
                                obj.children = [];
                                parent_arr[j].children.push(obj);
                                arr.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }
                    if (arr.length) {
                        for (const child_item of parent_arr) {
                            if (child_item.children.length) {
                                build_child(child_item.children, arr);
                            }
                        }
                    }

                    return parent_arr;
                }

                const new_arr = arr.concat(userList);
                return build_child(parent_arr, new_arr);
            },
            renderContent(h, { data }) {
                function get_icon(str) {
                    return str === 'person'
                        ? 'custom custom-person'
                        : 'custom custom-group';
                }

                return h('span', [
                    h('Icon', {
                        props: {
                            custom: get_icon(data.type)
                        },
                        style: {
                            marginRight: '8px',
                            fontSize: '16px'
                        }
                    }),
                    h(
                        'span',
                        {
                            attrs: {
                                title: data.title
                            },
                            style: {
                                display: 'inline-block',
                                maxWidth: '100px',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                verticalAlign: 'bottom'
                            }
                        },
                        data.title
                    )
                ]);
            },

            change_selected_userIds() {
                const person_arr = this.$refs.update_tree.getCheckedNodes();
                if (this.checkAll) {
                    this.checkAllTreeData = person_arr;
                }
                if ((this.init_tree.length + this.user_list.length) === person_arr.length) {
                    this.checkAll = true;
                    this.indeterminate = false;
                } else if (person_arr.length > 0) {
                    this.checkAll = false;
                    this.indeterminate = true;
                } else {
                    this.indeterminate = false;
                    this.checkAll = false;
                }

                this.selected_userIds = person_arr
                    .filter((item) => item.type === 'person')
                    .map((item) => {
                        return {
                            value: item.id,
                            label: item.title
                        };
                    });

            },
            generate_child_tree(title) {
                const str_searched = title || ''; // 要搜索的文字
                const temp_tree_data = this.get_tree(this.init_tree, this.user_list, []); // 全量 tree_data

                function search_title_recursively(nodes, str_searched) {
                    return nodes
                        .map((node) => {
                            if (node.title.includes(str_searched)) {
                                return node;
                            } else if (node.children.length) {
                                node.children = search_title_recursively(
                                    node.children,
                                    str_searched
                                );
                                if (node.children.length) {
                                    return node;
                                } else {
                                    return undefined;
                                }
                            } else {
                                return undefined;
                            }
                        })
                        .filter((item) => item);
                }

                this.tree_data = search_title_recursively(temp_tree_data, str_searched);
            }, // 根据 id 在页面中定位常用检索, 返回值为"定位是否成功"
            // 部门筛选相关
            getDepartmentsData() {
                this.$commonApi.getCrmManageDepartments({
                    orgId: this.enterpriseId,
                    userId: this.userId
                }).then(data => {
                    if (data.code === '1') {
                        this.departmentsData = data.data;
                        this.departmentsTree = this.get_departments_tree(data.data);
                        if (this.blank) {
                            this.departmentsTree = [...this.departmentsTree].concat([
                                {
                                    children: [],
                                    id: -1,
                                    parentId: 0,
                                    title: this.$t('tableFilter.defaultOption_blank')
                                }
                            ]);
                        }
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.departmentErr'));
                        this.loading_tree = false;
                    }
                });
            },
            change_selected_departmentIds() {
                const person_arr = this.$refs.department_tree.getCheckedNodes();
                this.selected_departmentsIds = person_arr.map((item) => {
                    return {
                        value: item.id,
                        label: item.title
                    };
                });
            },
            generate_departments_data(keywords) {
                const str_searched = keywords || ''; // 要搜索的文字
                const temp_tree_data = this.get_departments_tree(this.departmentsData); // 全量

                function search_title_recursively(nodes, str_searched) {
                    return nodes.map((node) => {
                        if (node.title.includes(str_searched)) {
                            return node;
                        } else if (node.children.length) {
                            node.children = search_title_recursively(
                                node.children,
                                str_searched
                            );
                            if (node.children.length) {
                                return node;
                            } else {
                                return undefined;
                            }
                        } else {
                            return undefined;
                        }
                    }).filter((item) => item);
                }

                this.departmentsTree = search_title_recursively(temp_tree_data, str_searched);
            },
            get_departments_tree(param_arr) {
                const arr = param_arr.map((item) => {
                    const obj = {};
                    obj.parentId = item.parentId;
                    obj.name = item.name;
                    obj.id = item.id;
                    return obj;
                });
                let parent_arr = [];

                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].parentId === 0) {
                        parent_arr.push(arr[i]);
                        arr.splice(i, 1);
                        i = i - 1;
                    }
                }

                function structure_parent_arr(arr) {
                    return arr.map((item) => {
                        const obj = {};
                        obj.title = item.name;
                        obj.id = item.id;
                        obj.parentId = item.parentId;
                        obj.children = [];
                        return obj;
                    });
                }
                parent_arr = structure_parent_arr(parent_arr);
                function build_child(parent_arr, arr) {
                    for (let j = 0; j < parent_arr.length; j++) {
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i].parentId === parent_arr[j].id) {
                                const obj = {};
                                obj.title = arr[i].name;
                                obj.id = arr[i].id;
                                obj.parentId = arr[i].parentId;
                                obj.grandpa_id = parent_arr[j].parentId;
                                obj.children = [];
                                parent_arr[j].children.push(obj);
                                arr.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }
                    if (arr.length) {
                        for (const child_item of parent_arr) {
                            if (child_item.children.length) {
                                build_child(child_item.children, arr);
                            }
                        }
                    }

                    return parent_arr;
                }
                return build_child(parent_arr, arr);
            },
            handleCheckAll() {
                if (this.indeterminate) {
                    this.checkAll = false;
                } else {
                    this.checkAll = !this.checkAll;
                }
                this.indeterminate = false;
                if (this.filterType === 'users') {
                    if (this.checkAll) {
                        this.$refs.update_tree.setCheckedNodes(this.tree_data);
                    } else {
                        this.$refs.update_tree.setCheckedKeys([]);
                    }
                }
                if (this.filterType === 'select') {
                    this.checkGroup = this.checkAll ? this.$deepClone(this.checkList) : [];
                }
            }
        },
        mounted() {
            this.isHidden = this.$refs.container.parentElement.parentElement.parentElement.classList.contains('is-hidden');
        },
        watch: {
            showPopper(val) {
                if (!this.isHidden && this.showing !== val) {
                    this.$refs.reference.$el.click();
                }
            }
        }
    };
</script>

<style lang="less">
@import url("./filter-box.less");
</style>
