<!-- 通用的 confirm dialog  applicableMember-->
<template>
    <el-popover
        placement="bottom"
        :disabled="disabled"
        width="470px"
        trigger="click"
        popper-class="custom_select_tree_applicableMember"
    >
        <template #reference>
            <div class="custom_cetselectmuliple custom_input_applimember">
                <el-tag
                    v-if="firstTag"
                    :key="firstTag[1].id"
                    :closable="!firstTag[1].disabled"
                    :disabled="disabled"
                    type="info"
                    @close="deleteTag(firstTag[0], i)"
                >
                    <span :title="forMateName(firstTag[1])" class="custom_tag_content">{{  forMateName(firstTag[1]) }}</span>
                </el-tag>
                <div v-if="otherTags.length">
                    <el-popover
                        width="500px"
                        trigger="hover"
                        popper-class="custom_cetselectmuliple"
                    >
                        <el-tag
                            v-for="(tag, i) in otherTags"
                            :key="tag[1].id"
                            :closable="!tag[1].disabled"
                            :disabled="disabled"
                            type="info"
                            @close="deleteTag(tag[0], i)"
                        >
                            <span :title="forMateName(tag[1])" class="custom_tag_content">{{  forMateName(tag[1]) }}</span>
                        </el-tag>
                        <template #reference>
                            <el-tag type="info">
                                +{{otherTags.length}}
                            </el-tag>
                        </template>
                    </el-popover>
           
                </div>
                <span v-if="!firstTag" class="placeholder">请选择</span>
            </div>
        </template>
        <!-- 搜索框区域 -->
        <el-input class="filter_input" v-model="filterText" placeholder="请输入搜索关键词">
            <template #suffix>
                <el-icon class="el-input__icon">
                    <i class="custom  custom-journey-search"></i>
                </el-icon>
            </template>
        </el-input>
        <!-- tabs区域 -->
        <el-tabs v-model="activeTab"  
                 @tab-change="changeTab">
            <el-tab-pane :label="item.label" :key="item.name" :name="item.name" v-for="item in tabs">
            </el-tab-pane>
        </el-tabs>
        <!-- 内容区域 -->
        <div class="options_wrap" v-loading="loading">
            
            <section
                v-for="item in tabs" :key="item.name"
                v-show='activeTab == item.name'>
                <treeVue
                    v-if="item.inputType =='tree'"
                    :vest="item.objApiKey"
                    :defaultcheckedkeys="checkArr"
                    :defaultData="defaultData"
                    :data="item.data"
                    @checkChange="checkChange($event, item.objApiKey)"
                    :filterText="filterText"
                />
                <selectVue
                    v-if="item.inputType =='select'"
                    :vest="item.objApiKey"
                    :defaultData="defaultData"
                    :propData="{
                        name:'displayName'
                    }"
                    :options="item.data"
                    @checkChange="checkChange($event, item.objApiKey)"
                    :defaultcheckedkeys="checkArr"
                    :filterText="filterText"/>
            </section>
        </div>

       
    </el-popover>

</template>

<script setup>
import {ref, computed, onMounted, unref, toRefs, watch} from 'vue';
import treeVue from '@/components/applicableMember/tree.vue';
import selectVue from '@/components/applicableMember/select.vue';
import { CODESTATE } from '@/https/codeConfig';
import { getFieldsRange } from '@/api/members.js';
const emits = defineEmits(['setQueryData']);
// import { useUserStore } from '@/pinia/modules/user.js';
// const store = useUserStore(); // 当前登陆的用户信息


const props = defineProps({
    defaultData: {
        default: () => {
            return [{id: 3012, displayName: 'Facebook主页', objApiKey: 'contact'}, {id: 2978, displayName: '退回原因说明', objApiKey: 'lead'}];
        }
    },
    objectId: {
        default: 366
    },
    parentId: {
        default: ''
    },
    dataType: {
        default: 1
    },
    indexCurrent: {
        default: 1
    },
    disabled: {
        type: Boolean,
        default: false
    }
});
const {defaultData, objectId, dataType, parentId} = toRefs(props);
const loading = ref(false);
const filterText = ref(''); // 搜索关键词

const tabs = ref([]); // 要渲染的tabs列表
const activeTab = ref(''); // 当前激活的tabs
const popTag = ref(new Map([])); // 搜索框展示的数据

const checkArr = computed(() => Array.from(popTag.value).map(ele => ele[0]));
const firstTag = computed(() => Array.from(popTag.value) && Array.from(popTag.value)[0]); // 第一位tag
const otherTags = computed(() => Array.from(popTag.value) && Array.from(popTag.value).slice(1)); // 其余的tag
// const curTabs = computed(() => tabs.value.find(ele => ele.name == activeTab.value)); // 当前选中tab的源数据
async function changeTab(tabName) {
    // 改变tab的时候 清空筛选条件
    filterText.value = '';
}

async function queryFieids() {
    // 查询线索 联系人 客户 
    resetValue();
    loading.value = true;
    const res = await getFieldsRange({
        dataType: dataType.value,
        objectId: objectId.value
    });
    if (res.code == CODESTATE.SUCCESS) {
        const keys = Reflect.ownKeys(res.data);
        keys.forEach(ele => {
            const tabSourseData = {
                name: ele,
                label: forMateLable(ele),
                inputType: 'select',
                objApiKey: ele,
                data: res.data[ele]
            };
            tabs.value.push(tabSourseData);
        });
    } else {
        ElMessage.error(`getFieldsRange${res.messageShow}`);
    }
    // console.log(tabs.value);
    activeTab.value = tabs.value[0]?.name; // 设置选中第一个tab
    setDefaultCheck(); // 设置默认勾选的数据
    loading.value = false;
}

function forMateLable(key) {
    return key == 'contact' ? '联系人' : key == 'lead' ? '线索' : key == 'opportunity' ? '商机' : key == 'followUpRecord' ? '跟进记录' : '客户';
}

function forMateName(item) {
    return `${forMateLable(item.objApiKey)}-${item.displayName}` ;
}
function checkChange(data, objApiKey) {
    // 树中的复选框 状态改变时触发
    if (!data.check) {
        // check属性是false就删除 这个key
        popTag.value.delete(mapKey(objApiKey, data.data.id));
    } else {
        popTag.value.set(mapKey(objApiKey, data.data.id), unref(data.data));
    }
}

function deleteTag(mapKey) {
    popTag.value.delete(mapKey);
}
function mapKey(objApiKey, id) {
    // 设置独特的key 这个key的作用是拼接类型和id 后续在各个tab中回显自己对应type下的id
    return `${objApiKey}_${id}`;
}
function setDefaultCheck() {
    // 设置默认回显的数据
    defaultData.value.forEach(ele => {
        if (!ele.objApiKey && ele.apiKeyValue) {
            ele.objApiKey = ele.apiKeyValue.split('.')[0];
        }
        popTag.value.set(mapKey(ele.objApiKey, ele.id), ele);

        // 设置默认勾选并且 根据defaultData设置disabled属性
        const currentTab = tabs.value.find(tabItem => tabItem.name == ele.objApiKey);
        if(currentTab) {
            const setDisabled = currentTab.data?.find(item => item.id == ele.id);
            setDisabled && (setDisabled.disabled = ele.disabled);
        }
    });
}
function getCheckData() {
    // 获取当前选中的值 提供给接口使用
    return Array.from(popTag.value).map(ele => ele[1]);
}

function resetValue() {
    // 重置tabs 值
    tabs.value = [];
    popTag.value.clear();
    activeTab.value = '';
}
watch(popTag.value, (v) => {
    emits('setQueryData', getCheckData(), props.indexCurrent);
});
// 导出给外部使用
defineExpose({
    getCheckData
});
watch(defaultData, (v) => {
    if (v?.length > 0) {
        queryFieids();
    } else {
        resetValue();
    }
}, {immediate: true});


</script>

<style lang="scss" scoped>
.custom_input_applimember{
    width: 100%;
    min-height: 34px;
    border: 1px solid #DCDEE0;
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 5px 12px;
     box-sizing: border-box;
     flex-wrap: wrap;
     border-radius: 4px;
     .placeholder{
        color: var(--#{$elnamespace}-text-color-placeholder);
     }
}
.custom_tag_content{
    max-width: 4em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
}
.filter_input{
    margin-bottom: 8px;
}

.options_wrap{
    width: 100%;
    :deep{
        .#{$elnamespace}-tree-node__label{
                color: #303133;
        }
    }
}
</style>
<style lang="scss">

.custom_cetselectmuliple{
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    max-height: 150px;
    overflow-y: auto;
    .#{$elnamespace}-tag--info{
    background-color:#f4f4f5;
    color: #919399;
    border: 1px solid #cdd0d6;
    box-sizing: border-box;
    .#{$elnamespace}-tag__close{
        color: #919399;
        &:hover{
            background: #c0c4cc;
        color: #919399;

        }
    }

}
}

</style>