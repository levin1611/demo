<!-- 通用的 confirm dialog  applicableMember-->
<template>
    <el-popover
        placement="bottom"
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
                    type="info"
                    @close="deleteTag(firstTag[0], i)"
                >
                    <span :title="firstTag[1].name" class="custom_tag_content">{{ firstTag[1].name }}</span>
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
                            type="info"
                            @close="deleteTag(tag[0], i)"
                        >
                            <span :title="tag[1].name" class="custom_tag_content">{{ tag[1].name }}</span>
                        </el-tag>
                        <template #reference>
                            <el-tag type="info">
                                +{{otherTags.length}}
                            </el-tag>
                        </template>
                    </el-popover>
           
                </div>
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
                    :vest="item.type"
                    :defaultcheckedkeys="checkArr"
                    :data="item.data"
                    @checkChange="checkChange($event, item.type)"
                    :filterText="filterText"
                />
                <selectVue
                    v-if="item.inputType =='select'"
                    :vest="item.type"
                    :options="item.data"
                    @checkChange="checkChange($event, item.type)"
                    :defaultcheckedkeys="checkArr"
                    :filterText="filterText"/>
            </section>
        </div>

       
    </el-popover>

</template>

<script setup>
import {ref, computed, onMounted, unref, toRefs, nextTick } from 'vue';
import treeVue from '@/components/applicableMember/tree.vue';
import selectVue from '@/components/applicableMember/select.vue';
import { CODESTATE } from '@/https/codeConfig';
import { applicableMemberList } from '@/api/members.js';
import { useUserStore } from '@/pinia/modules/user.js';
const store = useUserStore(); // 当前登陆的用户信息


const props = defineProps({
    defaultData: {
        default: () => {
            return [{id: 32, name: '部门30 是 这个是租户部门用户组2054 的 下级 32', type: 3}, {id: 32, name: '新建角色', type: 2}];
        }
    },
    tabs: {
        default: () => {
            return [
                {
                    name: 'department',
                    label: '部门',
                    inputType: 'tree',
                    type: 3
                },
                {
                    name: 'subDepartments',
                    label: '部门以及下级部门',
                    inputType: 'tree',
                    type: 5
                },
                
                {
                    name: 'memberGroup',
                    label: '成员组',
                    inputType: 'select',
                    type: 4
                },
                {
                    name: 'roles',
                    label: '角色',
                    inputType: 'select',
                    type: 2
                },
                {
                    name: 'members',
                    label: '成员',
                    inputType: 'select',
                    type: 1
                },
               
            ];
        }
    },
    activeTabProp: {
        default: 'department'
    },
    listApiParams: {},
    listApi: {}
});
const {defaultData, tabs} = toRefs(props);
const emits = defineEmits(['emitLoadingDone', 'delSelItem'])
const loading = ref(false);
const filterText = ref(''); // 搜索关键词

let activeTab = ref(props.activeTabProp); // 当前激活的tabs
const popTag = ref(new Map([])); // 搜索框展示的数据

const checkArr = computed(() => Array.from(popTag.value).map(ele => ele[0]));
const firstTag = computed(() => Array.from(popTag.value) && Array.from(popTag.value)[0]); // 第一位tag
const otherTags = computed(() => Array.from(popTag.value) && Array.from(popTag.value).slice(1)); // 其余的tag
const curTabs = computed(() => tabs.value.find(ele => ele.name == activeTab.value)); // 当前选中tab的源数据
async function changeTab(tabName) {
    filterText.value = '';
   
    if (!curTabs.value.data) {
        // 选中tab时如果没值 就查询 后续就不需要再查询了
        await queryMemberList(formateMemberType(tabName), tabName);
    }

}

function formateMemberType(code) {
    let str = '';
    switch (code) {
        case 'department':
            // 部门
            str = 3;
            break;
        case 'roles':
            // 角色
            str = 2;
            break;
        case 'members':
            // 成员
            str = 1;
            break;
        case 'memberGroup':
            // 成员组
            str = 4;
            break;
        case 'subDepartments':
            // 部门以及下级部门
            str = 5;
            break;
    }
    return str;
}
async function queryMemberList(memberType) {
    // 用户以及部门列表
    loading.value = true;
    const postData = Object.assign({
        userId: store.userId,
        orgId: store.orgId,
        memberType
    }, props.listApiParams || {});
    const res = await (props.listApi || applicableMemberList)(postData);
    if (res.code == CODESTATE.SUCCESS) {
        if (curTabs.value) {
            curTabs.value.data = res.data;
        } 

    }
    loading.value = false;

}

function checkChange(data, type) {
    // 树中的复选框 状态改变时触发
    if (!data.check) {
        // check属性是false就删除 这个key
        popTag.value.delete(mapKey(type, data.data.id));
    } else {
        popTag.value.set(mapKey(type, data.data.id), unref(data.data));
    }
}

function deleteTag(mapKey) {
    popTag.value.delete(mapKey);
    emits('delSelItem', mapKey);
}
function mapKey(type, id) {
    // 设置独特的key 这个key的作用是拼接类型和id 后续在各个tab中回显自己对应type下的id
    return `${type}_${id}`;
}
function setDefaultCheck() {
    popTag.value.clear(); // 清空数据
    // 设置默认回显的数据
    defaultData.value?.forEach(ele => {
        popTag.value.set(mapKey(ele.type, ele.id), ele);
    });
}
function getCheckData() {
    // 获取当前选中的值 提供给接口使用
    return Array.from(popTag.value).map(ele => ele[1]);
}
// 导出给外部使用
defineExpose({
    getCheckData
});
onMounted(async () => {
    await changeTab(activeTab.value);
    emits('emitLoadingDone', curTabs.value.data);
    nextTick(() => {
        setDefaultCheck();
    });
});
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
}
</style>
<style lang="scss">

.custom_cetselectmuliple{
    display: flex;
    gap: 6px;
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