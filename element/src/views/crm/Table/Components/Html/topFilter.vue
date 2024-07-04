<template>
    <Poptip v-model="visible"
            :placement="type === 'whatsapp' ? 'right' : 'bottom-start'"
            popper-class="no-padding"
            ref="poptip"
            :trigger="trigType"
            style="line-height: 20px;">
        <!-- 触发器, 顶部检索名称/自定义检索 -->
        <template v-if="type === 'whatsapp'" slot="reference">
            <div @mouseenter="openIn200Ms(true)" @mouseleave="openIn200Ms(false)" style="width: 30px;text-align: center;line-height: 32px;cursor: pointer;">
                <Icon custom="custom custom-gaojishaixuan" size="8" style="cursor:pointer;padding-bottom: 3px;"></Icon>
            </div>
        </template>
        <div v-else slot="reference"
             class="topFilter-trigger">
            <TooltipAuto placement="top-start"
                         :content="title">
                <span style="cursor: pointer;line-height: normal;font-weight: 500;font-size: 16px;color: #2d2f2e;">{{ title }}</span>
            </TooltipAuto>
            <Icon custom="custom-menu-arrow"
                  color="#7B98B6"
                  size="10"
                  style="position: absolute;right: 0;top: 6px;cursor: pointer;"></Icon>
        </div>

        <!-- 内容 -->
        <div style="display: flex;">
            <!-- 左侧目录 -->
            <div class="topFilter-menu">
                    <ul>
                        <li @click="change_search_type('searchCommon')"
                            :class="{'filter-menu-item-active': type_search === 'searchCommon', 'filter-menu-item': true}">
                            {{ $t('crm.Table.searchCommon') }}
                        </li>
                        <li v-if="!['followUpPlan'].includes(type)" @click="change_search_type('customSearch')"
                            :class="{'filter-menu-item-active': type_search === 'customSearch', 'filter-menu-item': true}">
                            {{ $t('crm.Table.tip_customSearch') }}
                        </li>
                    </ul>
            </div>

            <!-- 右侧面板 -->
            <div class="topFilter-content" style="min-width: 490px;">
                <keep-alive>
                    <component ref="topFilterChild"
                              :is="type_search"
                               :type="type"
                               :columnType="columnType"
                               :topVisible="visible"
                               :type_search.sync="type_search"
                               :list_commonSearch.sync="list_commonSearch"
                               :id_selected_commonSearch.sync="id_selected_commonSearch"
                               :newId.sync="newId"
                               :parentSearchData.sync="parentSearchData"
                               :editSearchData.sync="editSearchData"
                               @change_title="change_title"
                               @toggle_popper="toggle_popper"
                               @prevent_close_popper="prevent_close_popper"
                               @change_search_type="change_search_type"
                               v-on="$listeners"
                               v-bind="$attrs">
                    </component>
                </keep-alive>
            </div>
        </div>
    </Poptip>
</template>

<script>
    import searchCommon from '@/views/crm/Table/Components/Html/searchCommon';
    import customSearch from '@/views/crm/Table/Components/Html/customSearch';
    import util from '@/libs/util';
    export default {
        name: 'topFilter',
        inheritAttrs: false,
        components: {
            searchCommon,
            customSearch
        },
        props: [
            'title', // 外部传入名称, 可内部更改
            'type_topFilter', // 面板类型, flag 变化时用于切换筛选面板
            'type',
            'columnType'
        ],
        // 由于常用检索可指定，需要调整参数接收
        // props: {
        //     title: {
        //         type: String,
        //         default() {
        //             return '';
        //         }
        //     },
        //     type_topFilter: {
        //         type: String
        //     },
        //     type: {
        //         type: String
        //     },
        //     // id_selected_commonSearch: {
        //     //     type: String,
        //     //     default() {
        //     //         const localSearchId = localStorage.getItem(`leadsCloud-topFilter-id-type-${this.columnType}`);
        //     //         return localSearchId || 'all';
        //     //         // return 'all';
        //     //     }
        //     // },
        //     columnType: {
        //         type: [String, Number]
        //     }
        // },
        computed: {
            // id_selected_commonSearch() {
            //     const localSearchId = localStorage.getItem(`leadsCloud-topFilter-id-type-${this.columnType}`);
            //     return localSearchId || 'all';
            // }
            userId() {
                return this.$store.state.userId;
            },
            trigType() {
                return this.type === 'whatsapp' ? 'manual' : 'click';
            }
        },
        data() {
            return {
                /* 整体 */
                visible: false,

                /* 左侧目录 */
                type_search: 'searchCommon', // 筛选面板类型

                /* 常用检索 */
                id_selected_commonSearch: 'all', // 当前常用检索 id , 放在这里是觉得以后会不会可以指定 id 进行筛选(这样的话, 应该也要同时传入常用检索条件, 避免常用检索列表中无此数据)
                list_commonSearch: [], // 常用检索列表, 放在这里是因为 "自定义检索" 面板保存常用检索时为避免重名, 需要拿到这个数据
                newId: null, // 自定义检索最新保存的 id

                /* 自定义检索 */
                parentSearchData: null, // 添加子级检索时带过去的常用检索数据
                editSearchData: null, // 要编辑的常用检索数据
                setTabType: this.$debounce((v) => {
                    // console.log(v);
                    // var xhr = new XMLHttpRequest()
                    util.ajaxWA({
                        url: '/minor/commonSearch/saveMenuMemory',
                        method: 'put',
                        data: {
                            userId: this.userId,
                            type: v === 'customSearch' ? 1 : 0
                        }
                    });
                }, 1000),
                // 200毫秒后打开popover
                timerFor200Ms: null
            };
        },
        methods: {
            /* 整体 */
            toggle_popper(val = false) {
                this.visible = val;
            }, // 切换显隐
            prevent_close_popper(val = true) {
                this.$refs.poptip.disableCloseUnderTransfer = val;
            }, // 阻止 Poptip 关闭

            /* 顶部 title */
            change_title(title) {
                this.$emit('update:title', title);
            },

            /* 左侧目录 */
            change_search_type(name) {
                this.type_search = name;
                // 关闭 部门树 浮层
                if (this.$refs.topFilterChild.$refs.departmentSelect) {
                    this.$refs.topFilterChild.$refs.departmentSelect.forEach(item => item.doClose());
                }
                // 关闭 countryArea 浮层
                if (this.$refs.topFilterChild.$refs.countryArea) {
                    this.$refs.topFilterChild.$refs.countryArea.forEach(item => item.doClose());
                }
            },

            // 关闭 poptip 框
            doClose() {
                this.toggle_popper(false);
            },
            // 在whatsapp中查询tab的记忆并且选中
            getMenuMemory() {
                util.ajaxWAJson({
                    url: 'minor/commonSearch/getMenuMemory',
                    method: 'get',
                    params: {
                        userId: this.userId
                    }
                }).then(res => {
                    // console.log(res);
                    if (res.data.code == 1 && res.data.data) {
                        if (res.data.data == 1) {
                            this.change_search_type('customSearch');
                            // this.type_search = 'customSearch';
                        } else {
                            this.change_search_type('searchCommon');
                            // this.type_search = 'searchCommon';
                        }
                    }
                });
            },
            //
            openIn200Ms(open) {
                // 鼠标移入之后200毫秒后关闭
                clearTimeout(this.timerFor200Ms);
                if (open) {
                    this.timerFor200Ms = setTimeout(() => {
                        this.visible = true;
                    }, 200);
                }
            }
        },
        watch: {
            type_topFilter() {
                this.type_search = this.type_topFilter;
            },
            type_search(val) {
                // 如果是在whatsapp 点击高级筛选tab切换时要 记录当前选中的tab
                if (this.type === 'whatsapp' && val) {
                    this.setTabType(val);
                }
            }
        },
        mounted() {
            if (this.type === 'whatsapp') {
                this.getMenuMemory();
                document.body.addEventListener('click', this.doClose);
            }
        },
        beforeDestroy() {
            if (this.type === 'whatsapp') {
                document.body.removeEventListener('click', this.doClose);
            }
        }
    };
</script>

<style lang="less" scoped>
    .filter-menu-item {
        cursor: pointer;
        position: relative;
        line-height: 32px;
        padding: 0 16px;
        white-space: normal;

        &:hover {
            background: #D4E3FF;
        }
    }

    .filter-menu-item-active {
        color: #4285F4;

        // 新版三角形, 使用三角形生成器 + position 生成
        &::after {
            display: block;
            content: '';
            position: absolute;
            right: 0;
            top: calc(~'50% - 9px');
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 9px 10px 9px 0;
            border-color: transparent #FFF transparent transparent;
        }
    }
</style>

<style lang="less">
    .topFilter{
        &-trigger {
            max-width: 200px;
            padding: 0 20px 0 0;
            display: inline-block;
            position: relative;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        &-menu {
            width: 100px;
            padding: 16px 0;
            background-color: #E6EFFF;
            font-size: 12px;
        }

        &-content {
            flex: 1;
            overflow: auto;
            min-width: 420px;
        }
    }
    .no-padding.el-popper{
        .popper__arrow{
            &::after{
                border-bottom-color: #EBEEF5;
            }
        }
    }
</style>
