<!-- 
    支持两种布局 传参showHandleObject：{showCommonlyUsed：true} 三栏； 或两栏
    外部传递 allFieldList 所有字段
    外部传递 selectedList 选中的布局字段
    组件计算剩余的字段
    使用组件内的 getSelectList() 获取选中的字段
-->
<template>
    <div class="dragDropLayout">
        <div class="fieldList">
            <div class="field-list field-list-header">{{$t('dragDropLayout.fieldName')}}</div>
            <el-scrollbar
                ref="fieldScrollbar"
                max-height="calc(100% - 50px)"
                @scroll="fieldListScroll"
            >
                <div ref="fieldListRef">
                    <div class="field-list cursor-move" :class="{'line': item.id==='-99'}" v-for="(item, index) in fieldList" :key="index" :data-value="JSON.stringify(item)">
                        <el-tooltip
                            :content="item.name"
                            placement="top-start"
                        >
                            {{item.name}}
                        </el-tooltip>
                    </div>
                </div>
            </el-scrollbar>
        </div>
        <div class="layoutList">
            <div class="layout-list layout-list-header">{{$t('dragDropLayout.info')}}</div>
            <el-scrollbar
                ref="layoutScrollbar"
                @scroll="layoutListScroll"
                max-height="calc(100% - 50px)"
            >
                <div ref="layoutListRef" class="min-h-300">
                    <template v-if="showHandleObject.showCommonlyUsed">
                        <div class="layout-list cursor-move" v-for="(item, index) in layoutList" :key="item.id" :data-value="JSON.stringify(item)">
                            <template v-if="item.id === -99">
                                <div class="flex-2 special-border">
                                    <el-input
                                        size="small"
                                        v-model="item.name"
                                        @mouseenter="handleFocus"
                                        @mouseleave="bandleBlur"
                                        :clearable="false"
                                        maxlength="50"
                                        :placeholder="$t('dragDropLayout.placeholder_divider')"
                                        style="padding-right: 0px"
                                    />
                                </div>
                                <div class="text-right no-border-left"> 
                                    <el-checkbox v-model="item.packFlag" :label="$t('dragDropLayout.label')"/>
                                    <el-link type="primary" @click="removeLayout(item, index)">{{$t('delete')}}</el-link>
                                </div>
                            </template>
                            <template v-else>
                                <div class="flex-1">
                                    <el-tooltip
                                        :content="item.name"
                                        placement="top-start"
                                    >
                                        {{item.name}}
                                    </el-tooltip>
                                </div>
                                <div class="flex-1 no-border-left">{{item.type}}</div>
                                <div class="text-right no-border-left">
                                    <el-checkbox v-model="item.commonUseFlag" :readonly="item.deleteConfigFlag === 0" :label="$t('dragDropLayout.commonUseFlag')"/>
                                    <el-link type="primary" v-if="item.deleteConfigFlag !== 0" @click="removeLayout(item, index)">{{$t('delete')}}</el-link>
                                </div>
                                
                            </template>
                        </div>
                    </template>
                    <template v-else>
                        <div class="layout-list cursor-move" v-for="(item, index) in layoutList" :key="item.id" :data-value="JSON.stringify(item)">
                            <template v-if="item.id === -99">
                                <div class="flex-1 special-border">
                                    <el-input
                                        size="small"
                                        v-model="item.name"
                                        @mouseenter="handleFocus"
                                        @mouseleave="bandleBlur"
                                        :clearable="false"
                                        maxlength="50"
                                        :placeholder="$t('dragDropLayout.placeholder_divider')"
                                    />
                                </div>
                                <div class="text-right no-border-left">
                                    <el-checkbox v-model="item.packFlag" :label="$t('dragDropLayout.label')"/>
                                    <el-link type="primary" @click="removeLayout(item, index)">{{$t('delete')}}</el-link>
                                </div>
                            </template>
                            <template v-else>
                                <div class="flex-1">
                                    <el-tooltip
                                        :content="item.name"
                                        placement="top-start"
                                    >
                                        {{item.name}}
                                    </el-tooltip>
                                </div>
                                <div class="flex flex-2 no-border-left">
                                    <p class="flex-1">{{item.type}}</p>
                                    <div class="text-right justify-content-end">
                                        <el-link type="primary" v-if="item.deleteConfigFlag !== 0" @click="removeLayout(item, index)">{{$t('delete')}}</el-link>
                                    </div>
                                </div>
                                
                            </template>
                        </div>
                    </template>
                    <!-- <div class="layout-list cursor-move">
                        <div>线索名称</div>
                        <div>文本</div>
                        <div class="text-right">11</div>
                    </div> -->
                </div>
            </el-scrollbar>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue';
import Sortable from 'sortablejs';
import { env } from 'process';
const props = defineProps({
    allFieldList: {
        type: Array,
        default: () => [{
            'apiKey': 'entityType',
            'commonUseFlag': false,
            'id': '88',
            'name': '客户33类型',
            'packFlag': false,
            'deleteConfigFlag': 1,
            'type': '一般关系'
        }, {
            'apiKey': 'ownerId',
            'commonUseFlag': false,
            'id': '89',
            'name': '负责人',
            'packFlag': false,
            'deleteConfigFlag': 1,
            'type': '一般关系'
        }, {
            'apiKey': 'dimDepart',
            'commonUseFlag': false,
            'id': '90',
            'name': '所属部门',
            'packFlag': false,
            'deleteConfigFlag': 1,
            'type': '一般关系'
        }, {
            'apiKey': 'createdAt',
            'commonUseFlag': false,
            'id': '91',
            'name': '创建日期',
            'packFlag': false,
            'deleteConfigFlag': 1,
            'type': '日期时间类型'
        }, {
            'apiKey': 'createdBy',
            'commonUseFlag': false,
            'id': '92',
            'name': '创建人',
            'packFlag': false,
            'deleteConfigFlag': 1,
            'type': '一般关系'
        }, {
            'apiKey': 'updatedAt',
            'commonUseFlag': false,
            'id': '93',
            'name': '最新修改日期',
            'packFlag': false,
            'deleteConfigFlag': 1,
            'type': '日期时间类型'
        }, {
            'apiKey': 'updatedBy',
            'commonUseFlag': false,
            'id': '94',
            'name': '最新修改人',
            'packFlag': false,
            'deleteConfigFlag': 1,
            'type': '一般关系'
        }]
    },
    selectedList: {
        type: Array,
        default: () => [{
            'apiKey': 'createdBy',
            'commonUseFlag': false,
            'id': '92',
            'name': '创建人',
            'packFlag': false,
            'deleteConfigFlag': 0,
            'type': '一般关系'
        }, {
            'apiKey': 'updatedAt',
            'commonUseFlag': false,
            'id': '93',
            'name': '最新修改日期',
            'packFlag': false,
            'deleteConfigFlag': 1,
            'type': '日期时间类型'
        }]
    },
    showHandleObject: {
        type: Object,
        default: () => ({
            showCommonlyUsed: true
        })
    }
});
const input = ref('');
const fieldList = ref([]);
const layoutList = ref([]);
const fieldListRef = ref(null);
const layoutListRef = ref(null);
const fieldListSortable = ref(null);
const layoutListSortable = ref(null);
layoutList.value = props.selectedList.map(item => item);
onMounted(() => {
    getFieldList();
    setSortable();
});
onBeforeUnmount(() => {
    if (fieldListSortable.value) {
        fieldListSortable.value.destroy();
    }
    if (layoutListSortable.value) {
        layoutListSortable.value.destroy();
    }
});
// 获取字段列表
const getFieldList = () => {
    const selectedIds = layoutList.value.map(item => item.id);
    fieldList.value = [{
        id: -99,
        name: '分割线',
        type: 'line',
        packFlag: false,
        commonUseFlag: false,
        deleteConfigFlag: 1
    }].concat(props.allFieldList.filter(item => !selectedIds.includes(item.id)));
};
const handleFocus = () => {
    layoutListSortable.value && layoutListSortable.value.option('disabled', true);
};
const bandleBlur = () => {
    layoutListSortable.value && layoutListSortable.value.option('disabled', false);
};
const fieldScrollbar = ref(null);
const layoutScrollbar = ref(null);

const fieldListScrollTop = ref(0);
const fieldListScroll = (e) => {
    fieldListScrollTop.value = e.scrollTop;
};
const layoutListScrollTop = ref(0);
const layoutListScroll = (e) => {
    layoutListScrollTop.value = e.scrollTop;
};
// 设置拖拽
const setSortable = (type) => {
    if (!type && fieldListSortable.value) {
        fieldListSortable.value.destroy();
    }
    if (layoutListSortable.value) {
        layoutListSortable.value.destroy();
    }

    if (!type) {
        fieldListSortable.value = Sortable.create(fieldListRef.value, {
            group: {
                name: 'list',
                pull: true,
                put: false
            },
            handle: '.field-list',
            sort: false,
            animation: 120,
            // ghostClass: 'placeholder-style',
            onEnd: onEnd
            // onRemove(event) {
            // }
        });
    }
    
    layoutListSortable.value = Sortable.create(layoutListRef.value, {
        group: {
            name: 'list',
            pull: true,
            put: true
        },
        handle: '.layout-list',
        animation: 120,
        onEnd: onSortEnd
    });
};
// 从左往右拖拽
const onEnd = (evt) => {
    if (evt.pullMode) {
        const item = evt.item;
        const newIndex = evt.newIndex;
        const oldIndex = evt.oldIndex;
        const value = JSON.parse(evt.item.dataset.value);
        const fieldListData = [...fieldList.value];
        const layoutListData = [...layoutList.value];
        layoutListData.splice(newIndex, 0, value);
        if (value.type !== 'line') {
            fieldListData.splice(oldIndex, 1);
        } else {
            // 分割线

            // 名称清空
            value.name = '';
        }
        fieldList.value = [];
        layoutList.value = [];
        nextTick(() => {
            fieldList.value = [...fieldListData];
            layoutList.value = [...layoutListData];
            nextTick(() => {
                fieldScrollbar.value.setScrollTop(fieldListScrollTop.value, 0);
                layoutScrollbar.value.setScrollTop(layoutListScrollTop.value, 0);
            });
        });
    }
};

// 右侧排序拖拽
const onSortEnd = (evt) => {
    const newIndex = evt.newIndex;
    const oldIndex = evt.oldIndex;
    const layoutListData = [...layoutList.value];
    layoutListData.splice(newIndex, 0, ...layoutListData.splice(oldIndex, 1));
    layoutList.value = [];
    nextTick(() => {
        layoutList.value = layoutListData;
        nextTick(() => {
            layoutScrollbar.value.setScrollTop(layoutListScrollTop.value, 0);
        });
    });
};
// 删除布局逻辑
const removeLayout = (item, index) => {
    layoutList.value.splice(index, 1);
    getFieldList();
};
// 获取当前数据
const getSelectList = () => {
    return layoutList.value;
};

// 导出给外部使用
defineExpose({
    getSelectList
});
</script>
<style lang="scss" scoped>
    .dragDropLayout {
        display: flex;
        flex-wrap: nowrap;
        align-items: flex-start;
        font-size: 14px;
        color: #303133;
        .fieldList, .layoutList {
            height: 100%;
            overflow-y: hidden;
            border-bottom: 1px solid var(--#{$elnamespace}-border-color-lighter);
        }
        .fieldList {
            width: 150px;
        }
        .layoutList {
            flex: 1;
        }
        .field-list,.layout-list-header{
            padding: 0 12px;
            height: 46px;
            background: #fff;
            border: #EBEEF5 1px solid;
            border-collapse: collapse;
            margin-bottom: -1px;
            line-height: 46px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            &:hover {
                background: #F5F7FA;
            }
            
        }
        .field-list.line {
            color: $textlinkColor;
        }
        .layout-list {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: -1px;
            >div {
                box-sizing: unset;
                padding: 0 12px;
                height: 46px;
                line-height: 46px;
                border: #EBEEF5 1px solid;
                border-collapse: collapse;
                // margin-left: -1px;
                align-items: center;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                :deep {
                    .#{$elnamespace}-input__wrapper {
                        padding: 0;
                        box-shadow: none;
                        background: none;
                    }
                    .#{$elnamespace}-input__wrapper:hover, .#{$elnamespace}-input__wrapper.is-focus {
                        box-shadow: none;
                    }
                    .#{$elnamespace}-input__inner {
                        font-size: 14px;
                        font-weight: 600;
                        color: #303133;
                    }
                }
            }
            // >div.#{$elnamespace}-input  {
            //     height: 46px;
            //     border-right: 0;
            //     border-left: 0;
            // }
            >div.special-border {
                // border-left: #fff 1px solid;
                border-right: #fff 1px solid;
            }
            >div.text-right {
                padding-right: 24px;
            }
            >div.no-border-left {
                border-left: 0;
            }
            &:hover {
                background: #F5F7FA;
                >div.border-none{
                    border-right: #F5F7FA 1px solid;
                }
                >div.special-border {
                    // border-left: #fff 1px solid;
                    border-right: #F5F7FA 1px solid;
                }
            }
        }
        .field-list-header, .layout-list-header {
            background: #F6F6F6;
            font-weight: 600;
        }
        .text-right {
            display: flex;
            padding-right: 12px;
            align-items: center;
            justify-content: space-between;
            width: 186px;
        }
        .text-right.justify-content-end {
            justify-content: flex-end;
        }
        :deep {
            .#{$elnamespace}-button {
                color: $textlinkColor
            }
        } 
    }
</style>