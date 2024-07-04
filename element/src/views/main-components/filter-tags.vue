<template>
    <div style="position: relative;display: inline-block;vertical-align: middle;">

        <!-- 左箭头 -->
        <div class="filter-tags-arrow-left" v-if="disp_left < 0">
            <Icon type="ios-arrow-back"
                  @click.native="move_left"
                  :style="moveIconStyle"
                  class="move-icon"></Icon>
        </div>

        <!-- 所有标签 -->
        <div :style="{
                'position': 'relative',
                'display': 'inline-block',
                'overflow': 'hidden',
                'white-space': 'nowrap',
                'margin-left': disp_left < 0 ? '30px' : '0',
                'margin-right': show_arrow_right ? '30px' : '0',
                'width': ((disp_left < 0) || show_arrow_right) ? `${computedWidth - (disp_left < 0 ? 30 : 0) - (show_arrow_right ? 30 : 0)}px` : 'auto'}"
             ref="container">

            <!-- 标签容器 -->
            <div ref="tags-container"
                 :style="{ 'left': `${disp_left}px`}"
                 class="filter-tags-container">

                <!-- 排序 -->
                <Tag v-if="order_column"
                     ref="tag-sort"
                     closable
                     @click="empty_sort"
                     @close="empty_sort"
                     :style="tagMaxWidth ? `max-width: ${tagMaxWidth}px` : ''">
                    <TooltipAuto :content="$t('tableFilter.tag_sort')">
                        <Icon :custom="`custom-${order_type}ending`" color="#A9B9C9"></Icon>
                        <span class="tag-title">{{ $t('tableFilter.tag_sort') }}</span>:
                    </TooltipAuto>
                    <TooltipAuto :content="langObj[storageName_orderColumn]">
                        <span class="tag-text" :style="tagMaxWidth ? `max-width: ${tagMaxWidth - 90}px` : ''">{{ langObj[storageName_orderColumn] }}</span>
                    </TooltipAuto>
                </Tag>

                <!-- 筛选条件 -->
                <template v-for="key in tags_sorted">
                    <!-- 日期型单独弄出来做点击筛选 -->
                    <template v-if="filterConObj[key].filterType === 'date'">
                        <Poptip :width="width_popper" :key="key"
                                popper-class="filter-popper"
                                ref="poptip"
                                @show="onPopperShow"
                                @hide="onPopperHide(key)">
                            <Tag slot="reference"
                                 closable
                                 @close="remove_filterCon(key)"
                                 @click="toggle_popper(key)"
                                 :style="tagMaxWidth ? `max-width: ${tagMaxWidth}px` : ''">
                                <TooltipAuto :content="langObj[key]">
                                    <span class="tag-title">{{ langObj[key] }}</span>:
                                </TooltipAuto>
                                <TooltipAuto :content="`${ $options.filters.timeFormat(filterConObj[key].query[0]) } - ${ $options.filters.timeFormat(filterConObj[key].query[1]) }`">
                                    <span class="tag-text"
                                        :style="tagMaxWidth ? `max-width: ${tagMaxWidth - 90}px` : ''">
                                        {{ `${ $options.filters.timeFormat(filterConObj[key].query[0]) } - ${ $options.filters.timeFormat(filterConObj[key].query[1]) }` }}
                                     </span>
                                </TooltipAuto>
                            </Tag>

                            <!-- popper 内容 -->
                            <div>
                                <!-- 内容筛选 -->
                                <div class="filter-content clearfix">
                                    <div class="small-date-panel-container">
                                        <DatePicker v-model="tagValue[key]"
                                                    type="daterange"
                                                    :picker-options="dateOptions || filterConObj[key].dateOptions"
                                                    :inline="true"
                                                    @input="val => val === null ? tagValue[key] = [] : undefined"
                                                    class="small-date-panel"></DatePicker>
                                    </div>

                                    <!-- 底部按钮 -->
                                    <div class="search-btns">
                                        <Button @click="cancel" type="minor" size="small"
                                                >{{ $t('cancel') }}</Button>
                                        <Button type="success" size="small"
                                                @click="confirm">{{ $t('confirm') }}</Button>
                                    </div>
                                </div>
                            </div>
                        </Poptip>
                    </template>

                    <!-- 其他类型 Tag , 点击删除该条件 -->
                    <!-- 表格上方的筛选条件，在筛选字段为a100开头时，不显示字段名称，因为多了一个b。此处做判断，若是a100的字段
                     先截取去掉开头的b，再与langObj进行匹配显示对应名称； 杨娣  2020/06/14
                     -->
                    <template v-else>
                        <Tag closable :key="key"
                             @close="remove_filterCon(key)"
                             @click="remove_filterCon(key)"
                             :style="tagMaxWidth ? `max-width: ${tagMaxWidth}px` : ''">
                             <!-- noVal 类型: 只显示标题(且不限制宽度), 不显示内容 -->
                             <template v-if="filterConObj[key].filterType === 'noVal'">{{ langObj[key] }}</template>
                             <template v-else-if="filterConObj[key].filterType === 'string'">
                                <TooltipAuto :content="langObj[key.slice(1)]" v-if="key.indexOf('ba100') !== -1">
                                    <span class="tag-title">{{ langObj[key.slice(1)] }}</span>:
                                </TooltipAuto>
                                <TooltipAuto :content="langObj[key]" v-else>
                                    <span class="tag-title">{{ langObj[key] }}</span>:
                                </TooltipAuto>
                                <TooltipAuto :content="filterConObj[key].query">
                                    <span class="tag-text" :style="tagMaxWidth ? `max-width: ${tagMaxWidth - 90}px` : ''">{{ filterConObj[key].query }}</span>
                                </TooltipAuto>
                             </template>
                             <template v-else-if="filterConObj[key].filterType === 'number'">
                                <TooltipAuto :content="langObj[key.slice(1)]" v-if="key.indexOf('ba100') !== -1">
                                    <span class="tag-title">{{ langObj[key.slice(1)] }}</span>:
                                </TooltipAuto>
                                <TooltipAuto :content="langObj[key]" v-else>
                                    <span class="tag-title">{{ langObj[key] }}</span>:
                                </TooltipAuto>
                                <TooltipAuto :content="filterConObj[key].query">
                                    <span class="tag-text" :style="tagMaxWidth ? `max-width: ${tagMaxWidth - 90}px` : ''">{{ filterConObj[key].query }}</span>
                                </TooltipAuto>
                             </template>
                             <template v-else-if="filterConObj[key].filterType === 'select'">
                                <TooltipAuto :content="langObj[key.slice(1)]" v-if="key.indexOf('ba100') !== -1">
                                    <span class="tag-title">{{ langObj[key.slice(1)] }}</span>:
                                </TooltipAuto>
                                <TooltipAuto :content="langObj[key]" v-else>
                                    <span class="tag-title">{{ langObj[key] }}</span>:
                                </TooltipAuto>
                                <TooltipAuto :content="(filterConObj[key].selectAll && filterConObj[key].checkAll ? `${ $t('tableFilter.all')},` : '') + filterConObj[key].query.map(item => item.label).join(', ')">
                                    <span class="tag-text" :style="tagMaxWidth ? `max-width: ${tagMaxWidth - 90}px` : ''">
                                        {{ (filterConObj[key].selectAll && filterConObj[key].checkAll ? `${ $t('tableFilter.all')},` : '') + filterConObj[key].query.map(item => item.label).join(', ') }}
                                    </span>
                                </TooltipAuto>
                             </template>
                             <template v-else-if="filterConObj[key].filterType === 'selectSingle'">
                                <TooltipAuto :content="langObj[key.slice(1)]" v-if="key.indexOf('ba100') !== -1">
                                    <span class="tag-title">{{ langObj[key.slice(1)] }}</span>:
                                </TooltipAuto>
                                <TooltipAuto :content="langObj[key]" v-else>
                                    <span class="tag-title">{{ langObj[key] }}</span>:
                                </TooltipAuto>
                                <TooltipAuto :content="filterConObj[key].query.map(item => item.label).join(', ')">
                                    <span class="tag-text" :style="tagMaxWidth ? `max-width: ${tagMaxWidth - 90}px` : ''">{{ filterConObj[key].query.map(item => item.label).join(', ')  }}</span>
                                </TooltipAuto>
                             </template>
                             <template v-else-if="filterConObj[key].filterType === 'countryArea'">
                                <TooltipAuto :content="langObj[key.slice(1)]" v-if="key.indexOf('ba100') !== -1">
                                    <span class="tag-title">{{ langObj[key.slice(1)] }}</span>:
                                </TooltipAuto>
                                <TooltipAuto :content="langObj[key]" v-else>
                                    <span class="tag-title">{{ langObj[key] }}</span>:
                                </TooltipAuto>
                                <TooltipAuto :content="filterConObj[key].query[1]">
                                    <span class="tag-text" :style="tagMaxWidth ? `max-width: ${tagMaxWidth - 90}px` : ''">{{ filterConObj[key].query[1] }}</span>
                                </TooltipAuto>
                             </template>
                             <template v-else-if="['users', 'departments'].includes(filterConObj[key].filterType)">
                                <TooltipAuto :content="langObj[key.slice(1)]" v-if="key.indexOf('ba100') !== -1">
                                    <span class="tag-title">{{ langObj[key.slice(1)] }}</span>:
                                </TooltipAuto>
                                <TooltipAuto :content="langObj[key]" v-else>
                                    <span class="tag-title">{{ langObj[key] }}</span>:
                                </TooltipAuto>
                                <TooltipAuto :content="(filterConObj[key].selectAll && filterConObj[key].checkAll ? `${ $t('tableFilter.all')},` : '') + filterConObj[key].query.map(item => item.label).join(', ')">
                                    <span class="tag-text" :style="tagMaxWidth ? `max-width: ${tagMaxWidth - 90}px` : ''">
                                        {{ (filterConObj[key].selectAll && filterConObj[key].checkAll ? `${ $t('tableFilter.all')},` : '') + filterConObj[key].query.map(item => item.label).join(', ') }}
                                    </span>
                                </TooltipAuto>
                             </template>
                             <template v-else-if="filterConObj[key].filterType === 'trafficSource'">
                                <TooltipAuto :content="langObj[key.slice(1)]" v-if="key.indexOf('ba100') !== -1">
                                    <span class="tag-title">{{ langObj[key.slice(1)] }}</span>:
                                </TooltipAuto>
                                <TooltipAuto :content="langObj[key]" v-else>
                                    <span class="tag-title">{{ langObj[key] }}</span>:
                                </TooltipAuto>
                                <TooltipAuto :content="filterConObj[key].query.map(item => item.value >= 100 ? `${$t('visitor_history.ad_cloudshare')}-${item.label}` : item.label).join(', ')">
                                    <span class="tag-text"
                                        :style="tagMaxWidth ? `max-width: ${tagMaxWidth - 90}px` : ''">
                                        {{ filterConObj[key].query.map(item => item.value >= 100 ? `${$t('visitor_history.ad_cloudshare')}-${item.label}` : item.label).join(', ') }}
                                    </span>
                                </TooltipAuto>
                             </template>
                        </Tag>
                    </template>
                </template>

                <!-- 升级版筛选, 可以修改所有类型筛选标签, 先注掉 -->
                <!--<Poptip v-for="key in tags_sorted"-->
                <!--        ref="poptip"-->
                <!--        :value="key === tagKey_changing"-->
                <!--        trigger="click" popper-class="filter-popper"-->
                <!--        transfer :width="width_popper" placement="bottom">-->
                <!--    &lt;!&ndash; Tag , Poptip 触发器 &ndash;&gt;-->
                <!--    <Tag-->
                <!--            @click.native="toggle_popper(key)"-->
                <!--            closable @on-close="remove_filterCon(key)">-->
                <!--        <template v-if="filterConObj[key].filterType === 'string'">-->
                <!--            {{ langObj[key] }}: <span class="tag-text">{{ filterConObj[key].query }}</span>-->
                <!--        </template>-->
                <!--        <template v-else-if="filterConObj[key].filterType === 'select'">-->
                <!--            {{ langObj[key] }}: <span class="tag-text">{{ filterConObj[key].query.map(item => item.label).join(', ') }}</span>-->
                <!--        </template>-->
                <!--        <template v-else-if="filterConObj[key].filterType === 'selectSingle'">-->
                <!--            {{ langObj[key] }}: <span class="tag-text">{{ filterConObj[key].query.map(item => item.label).join(', ')  }}</span>-->
                <!--        </template>-->
                <!--        <template v-else-if="filterConObj[key].filterType === 'countryArea'">-->
                <!--            {{ langObj[key] }}: <span class="tag-text">{{ filterConObj[key].query[1] }}</span>-->
                <!--        </template>-->
                <!--        <template v-else-if="filterConObj[key].filterType === 'date'">-->
                <!--            {{ langObj[key] }}: <span class="tag-text">{{ `${ $options.filters.timeFormat(filterConObj[key].query[0]) } - ${ $options.filters.timeFormat(filterConObj[key].query[1]) }` }}</span>-->
                <!--        </template>-->
                <!--    </Tag>-->

                <!--    &lt;!&ndash; popper 内容 &ndash;&gt;-->
                <!--    <div slot="content">-->
                <!--        &lt;!&ndash; 内容筛选 &ndash;&gt;-->
                <!--        <div class="filter-content clearfix">-->
                <!--            &lt;!&ndash; 字符型 &ndash;&gt;-->
                <!--            <template v-if="filterConObj[key].filterType === 'string'">-->
                <!--                <Input v-model.trim="tagValue[key]" :placeholder="$t('tableFilter.tip_inputKeyWords')"></Input>-->
                <!--            </template>-->
                <!--            &lt;!&ndash; 选项型 &ndash;&gt;-->
                <!--            <template v-else-if="filterConObj[key].filterType === 'select'">-->
                <!--                <div class="filter-items">-->
                <!--                    <CheckboxGroup v-model="tagValue[key]">-->
                <!--                        <Checkbox v-for="item in list_options" :key="item.value" :label="item.value">{{ item.label }}</Checkbox>-->
                <!--                    </CheckboxGroup>-->
                <!--                </div>-->
                <!--            </template>-->
                <!--            &lt;!&ndash; 单选型 &ndash;&gt;-->
                <!--            <template v-else-if="filterConObj[key].filterType === 'selectSingle'">-->
                <!--                <div class="filter-items">-->
                <!--                    <RadioGroup v-model="tagValue[key]" vertical>-->
                <!--                        <Radio v-for="item in list_options" :key="item.value" :label="item.value">{{ item.label }}</Radio>-->
                <!--                    </RadioGroup>-->
                <!--                </div>-->
                <!--            </template>-->
                <!--            &lt;!&ndash; 国家地区型 &ndash;&gt;-->
                <!--            <template v-else-if="filterConObj[key].filterType === 'countryArea'">-->
                <!--                &lt;!&ndash; 这里加 v-if , 不然删除已选地区后不选新的关掉再次打开, 看上去空白没有回填(实际上 code 还在) &ndash;&gt;-->
                <!--                <CountryAreaSelect v-if="tagKey_changing === key" :countryArea.sync="tagValue[key]" ref="countryArea" inputStyle="width: 198px;"></CountryAreaSelect>-->
                <!--            </template>-->
                <!--            &lt;!&ndash; 日期时间型 &ndash;&gt;-->
                <!--            <template v-else-if="filterConObj[key].filterType === 'date'">-->
                <!--                <DatePicker-->
                <!--                        open-->
                <!--                        type="daterange"-->
                <!--                        :value="tagValue[key]"-->
                <!--                        @on-change="changeDate($event, key)">-->
                <!--                    <span></span>-->
                <!--                </DatePicker>-->
                <!--            </template>-->

                <!--            &lt;!&ndash; 底部按钮 &ndash;&gt;-->
                <!--            <div class="search-btns">-->
                <!--                <Button type="success" ghost style="margin-right:12px;" @click="cancel">{{ $t('cancel') }}</Button>-->
                <!--                <Button type="success" @click="confirm">{{ $t('confirm') }}</Button>-->
                <!--            </div>-->
                <!--        </div>-->
                <!--    </div>-->
                <!--</Poptip>-->
            </div>
        </div>

        <!-- 右箭头 -->
        <div v-if="show_arrow_right"
             class="filter-tags-arrow-right">
            <Icon type="ios-arrow-forward"
                  @click.native="move_right"
                  :style="moveIconStyle"
                  class="move-icon"></Icon>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash';
    export default {
        name: 'filter-tags',
        props: {
            order_column: String, // 排序字段在数据库中的数据名
            order_type: String, // 排序类型
            storageName_orderColumn: String, // 排序字段 storageName
            filterConObj: Object, // 表头筛选条件
            langObj: Object, // 多语言
            width: Number, // 外部容器宽度
            removeWidth: Number, // 去掉的容器宽度
            minWidth: Number, // 默认最小宽度
            removeble: Boolean, // 是否可移动
            dateOptions: Object,
            moveIconStyle: String,
            // tag 最大宽度
            tagMaxWidth: {
                type: Number,
                default: 300
            }
        },
        computed: {
            count_tags() {
                return Object.values(this.filterConObj).filter(valObj => valObj.hasOwnProperty('query') && ((valObj.query && valObj.query.length > 0) || typeof valObj.query === 'number')).length + (this.order_column ? 1 : 0);
            }
        },
        data() {
            return {
                computedWidth: -1,
                /* 箭头 */
                // 展示右箭头
                show_arrow_right: false,

                /* 移动 */
                // 左侧位移, 顺便控制左箭头
                disp_left: 0,
                // 位移幅度
                step_width: 100,

                /* tag 顺序数组 */
                tags_sorted: [],

                /* tag 日期型筛选 */
                datePicker_open: {},
                datePicker_value: {},

                /* tag 其他类型筛选 */
                width_popper: 230,
                tagValue: {},
                tagKey_changing: '',
                list_options: []
            };
        },
        created() {
            this.initWidth(this.$store.state.window_width);
        },
        methods: {
            // 清空排序
            empty_sort() {
                this.$emit('emptySort');
            },

            // 打开日期型筛选的筛选框
            onPopperShow() {
                this.$emit('onChangeTime', true);
            },
            onPopperHide(key) {
                if (this.tagKey_changing === key) {
                    this.tagKey_changing = '';
                }
                this.tagValue = {};
            },

            // 打开其他类型 Tag 弹出框
            toggle_popper(key) {
                // 调整弹窗宽度
                if (this.filterConObj[key].filterType === 'date') {
                    this.width_popper = 682 - ((this.dateOptions || this.filterConObj[key].dateOptions) ? 0 : 92);
                } else {
                    this.width_popper = 230;
                }

                // 控制弹窗显隐
                const tempKey = this.tagKey_changing;
                this.tagKey_changing = '';
                if (tempKey !== key) {
                    this.$nextTick(() => {
                        this.tagKey_changing = key;
                    });
                }

                // 赋初始值
                const temp = this.filterConObj[key];
                switch (temp.filterType) {
                    case 'string':
                    case 'number':
                        this.$set(this.tagValue, key, temp.query);
                        break;
                    case 'select':
                        this.$set(this.tagValue, key, temp.query.map(item => item.value));
                        if (!this.blank) {
                            this.list_options = [...temp.allList];
                        } else {
                            this.list_options = [...temp.allList].concat([
                                {
                                    value: null,
                                    label: this.$t('tableFilter.defaultOption_blank')
                                }
                            ]);
                        }
                        break;
                    case 'selectSingle':
                        this.$set(this.tagValue, key, temp.query[0] ? temp.query[0].value : '');
                        this.list_options = [...temp.allList];
                        break;
                    case 'countryArea':
                        this.$set(this.tagValue, key, temp.query[0] || '');
                        break;
                    case 'date':
                        this.$set(this.tagValue, key, temp.query);
                        break;
                }
            },

            confirm() {
                const tagValue = this.tagValue[this.tagKey_changing];
                let query = null;
                const temp = this.filterConObj[this.tagKey_changing];
                switch (temp.filterType) {
                    case 'string':
                    case 'number':
                        query = tagValue;
                        break;
                    case 'select':
                        query = this.list_options.filter(item => tagValue.includes(item.value));
                        break;
                    case 'selectSingle':
                        query = this.list_options.filter(item => item.value === tagValue);
                        break;
                    case 'countryArea':
                        // 这里使用 $refs 因为是在 v-for 中使用的 ref , 所以返回的是数组, 因为只有一个"国家地区"字段, 所以直接用 [0]
                        query = tagValue ? [tagValue, this.$refs.countryArea[0].value_show] : [];
                        break;
                    case 'date':
                        query = tagValue;
                }

                if (query !== null) {
                    const temp_filterConObj = this.$deepClone(this.filterConObj);
                    temp_filterConObj[this.tagKey_changing].query = query;
                    this.$emit('update:filterConObj', temp_filterConObj);
                    this.$emit('change_filter_tag', this.tagKey_changing, temp);
                }

                this.cancel();
            },
            cancel() {
                document.body.click();
            },

            // 去掉某个筛选条件
            remove_filterCon(key) {
                this.tags_sorted = this.tags_sorted.filter(item => item !== key);
                this.$emit('removeCon', key);
                setTimeout(() => {
                    this.showOrHiddenButton();
                }, 100);
            },

            // 点击箭头
            move_left() {
                // 如果剩下的"可位移长度"大于步幅, 则向右移动一步幅, 否则移动完所有剩余距离
                if (Math.abs(this.disp_left) > this.step_width) {
                    this.disp_left += this.step_width;
                } else if (this.disp_left < 0) {
                    this.disp_left = 0;
                }
            },
            move_right() {
                // tag 实际宽度
                const width_tags = this.$refs['tags-container'].clientWidth;
                // tag 视野宽度
                const width_container = this.$refs.container.clientWidth;

                // 如果剩下的"可位移长度"大于步幅, 则向左移动一步幅, 否则移动完所有剩余距离
                if (width_tags - width_container - Math.abs(this.disp_left) > this.step_width) {
                    this.disp_left -= this.step_width;
                } else if (width_tags - width_container - Math.abs(this.disp_left) > 0) {
                    this.disp_left = -(width_tags - width_container);
                }
            },

            // 关闭 poptip 框
            doClose() {
                if (this.$refs.poptip) {
                    this.$refs.poptip.forEach(item => item.doClose());
                }
            },
            initWidth(val) {
                const minWidth = this.minWidth || 750;
                const delVal = val - (this.removeWidth || 590);
                this.computedWidth = delVal < minWidth ? minWidth : delVal;
            },
            showOrHiddenButton: _.debounce(function() {
                // 调整按钮的显隐
                if (this.$refs['tags-container']) {
                    if (this.count_tags > 0) {
                        setTimeout(() => {
                            if (!this.$refs['tags-container']) {
                                return false;
                            };
                            const width_tags = this.$refs['tags-container'].clientWidth;
                            if (width_tags > this.computedWidth) {
                                this.show_arrow_right = true;
                            } else {
                                // 恢复初始状态
                                this.show_arrow_right = false;
                                this.disp_left = 0;
                            }
                        }, 100);
                    } else {
                        // 恢复初始状态
                        this.show_arrow_right = false;
                        this.disp_left = 0;
                    }
                }
            }, 1000)
        },
        mounted() {
        },
        watch: {
            filterConObj: {
                handler(val) {
                    this.showOrHiddenButton();
                    // 调整 tag 的顺序
                    const all_filterCon = Object.entries(this.filterConObj).filter(([key, valObj]) => key && valObj.hasOwnProperty('query') && ((valObj.query && valObj.query.length > 0) || typeof valObj.query === 'number'));
                    if (all_filterCon.length > 0) {
                        // 正在筛选中的 tag
                        const tags_filtering = all_filterCon.map(([key, valObj]) => key);
                        this.$nextTick(() => {
                            if (this.tags_sorted.length) {
                                // 去除排序 tag 数组中已经不再筛选的 tag
                                this.tags_sorted = [...new Set(this.tags_sorted.filter(item => tags_filtering.includes(item)).concat(tags_filtering))];
                            } else {
                                this.tags_sorted = tags_filtering;
                            }
                        });
                    } else {
                        this.tags_sorted = [];
                    }
                },
                deep: true,
                immediate: true
            },
            order_column: {
                handler(val) {
                    if (this.count_tags > 0) {
                        window.setTimeout(() => {
                            const width_tags = this.$refs['tags-container'].clientWidth;

                            // if (width_tags > this.width) {
                            if (width_tags > this.computedWidth) {
                                this.show_arrow_right = true;
                            } else {
                                // 恢复初始状态
                                this.show_arrow_right = false;
                                this.disp_left = 0;
                            }
                        }, 0);
                    } else {
                        // 恢复初始状态
                        this.show_arrow_right = false;
                        this.disp_left = 0;
                    }
                }
            },
            '$store.state.window_width': _.debounce(function(val) {
                this.initWidth(val);
            }, 300)

        }
    };
</script>

<style scoped lang="less">
    .tag-title{
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: 50px;
    }

    .tag-text {
        color: #4285F4;
        overflow:hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }


    .filter-tags-container {
        display: inline-block;
        position: relative;

        /deep/ .el-icon-close {
            margin-left: 0;
            color: #a9b9c9;
            font-size: 16px;
            font-weight: bold;

            &:hover {
                background-color: transparent;
            }
        }

        /deep/ .el-tag {
            height: 32px;
            line-height: 31px;
            border-radius: 16px;
            border-color: #F5F6F9;
            background-color: #F5F6F9;
            margin: 0 4px 0 0;
            color: rgba(0, 0, 0, .8);

            &:hover {
                background-color: #E6EFFF;
            }

            span{
                display: inline-block !important;
                vertical-align: top;
            }

             .el-icon-close {
                margin-left: 0;
                color: #a9b9c9;
                font-size: 16px;
                font-weight: bold;

                &:hover {
                    background-color: transparent;
                }
            }
        }
    }

    .filter-tags-arrow-left {
        display: inline-block;
        width: 30px;
        position: absolute;
        left: 0;
        top: 0;
    }

    .filter-tags-arrow-right {
        display: inline-block;
        width: 30px;
        position: absolute;
        right: 0;
        top: 0;
        text-align: right;
    }

    .move-icon {
        font-size: 18px;
        color: #c3cdd9;
        font-weight: bold;
        cursor: pointer;
    }
</style>

<style lang="less">
    @import url('./filter-box.less');
</style>
