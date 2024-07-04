<template>
  
    <div>
        <!-- 使用pinia {{store}}
        {{ $t('epidemic.china') }}
        <span>1111</span>
        <div class="son">hahahahahah</div>
        <div>使用public目录下的公共文件↓</div>
        <audio controls src="/audio/notice.mp3"></audio>
        <img src="/image/11729_logo_icon.svg" alt="">
        <img src="/image/11729_logo_text.svg" alt="">
        <el-button type="primary">Primary</el-button>
        <el-select></el-select> -->
        <!-- 无字段、值选择器，&& 无字段等级选择器 && 无【不限】按钮 -->
        <!-- 自定义权限规则使用 -->
        <!-- <allPurposeFilter
            @handle-click="changeOption"
            :filterData="filterData1"
            :filterType="1"
            :levelFields="false"
            :radioType="[1,2,3]" 
            ref="setFilter"
            :conditionType="['fields','matchType','value']"
            maxLevel="5">
        </allPurposeFilter> -->

        <!-- 默认含有层级字段选择器（最多5层）、所有单选按钮、所有输入框 -->
        <!-- 新建关联字段使用 -->
        <allPurposeFilter
            :filterData="filterData2"
            :objectId="497"
            :filterType="1"
            ref="setFilter"
            :fieldsSource="fieldsSource"
            :dataSource="dataSource"
            :maxLevel="5"
            @changeObject="changeObject">
        </allPurposeFilter>

        <!-- 新建视图布局使用 -->
        <!-- <allPurposeFilter
            :filterData="filterData"
            :levelFields="false"
            :fieldsSource="fieldsSource"
            fieldsSelectorType="selectUserInfo"
            ref="setFilter">
        </allPurposeFilter> -->

        <!-- 范围选择：默认含有层级字段选择器（最多5层）、所有单选按钮、所有输入框 -->
        <!-- 查重规则使用 -->
        <!-- <allPurposeFilter
            :filterData="filterData"
            :levelFields="false"
            ref="setFilter"
            type="range"
            maxLevel="5">
        </allPurposeFilter> -->

        <!-- <representation 
            types="[1,2,3]"
            :fieldsSource="fieldsSource"
            :objectId="497"
            @changeObject="changeObject"
            maxLevel="1">
        </representation> -->

        <el-button
            type="primary"
            @click="submit"
        >{{ $t('save') }}</el-button>
        <!-- 新建/编辑布局 -->
        <!-- <globalSearchLayout
            v-model:visible="visible_editLayout"
            :operateType="curOperateType"
            :layoutConfig="curLayoutConfig"
            :layoutData="curLayoutData"
            @operateSuccess="handleOperateSuccess"
        ></globalSearchLayout> -->
    </div>
</template>
<script setup>
import { ref, computed, provide } from 'vue';
import { useI18n } from 'vue-i18n';
// 翻译
const { t } = useI18n();
// import { getCurrentInstance } from 'vue';
// import allPurposeFilter from '@/components/allPurposeFilter.vue';
import allPurposeFilter from '@/components/allPurposeFilter.vue';
import representation from '@/components/representation.vue';
// import { useUserStore } from '@/pinia/modules/user';
import globalSearchLayout from '@/views/layoutSet/globalSearchLayout';
import { findRelFilterFields } from '@/api/common'
// findRelFilterFields
const visible_editLayout = ref(true);
const curOperateType = ref('new');
const setFilter = ref();

const fieldsSource = ref({
    methods: findRelFilterFields,
    data: {
        objectId: 497
    }
})
const dataSource = ref({
    methods: findRelFilterFields,
    data: {
        objectId: 497
    }
})
// provide('fieldsSource', fieldsSource);
// provide('dataSource', dataSource);

const changeObject = (item) => {
    fieldsSource.value.data.objectId = item.id;
}

const curLayoutConfig = ref(  {
    key: 'tablePageLayout',
    layoutType: 2,
    title: t('layout.tablePageLayout'),
    btnList: ['new', 'edit', 'delete', 'copy', 'distribute']
});
const curLayoutData = ref({
    'defaultFlag': 0,
    'layoutId': 6,
    'layoutName': '列表页布局1'
});


// 可以在行内直接引用(看template中的代码), 或者使用import引用
// 使用public目录下的公共文件 / 表示public目录

// // const store = useUserStore();

// // 修改store
// // let user = {
// //     name: '222',
// //     phone: '222'
// // };
// // store.setName(user.name);
// // store.$patch({
// //     age: 3
// // });
// // 获取全局方法及属性
// const globalProperties = getCurrentInstance().appContext.config.globalProperties;
// console.log(getCurrentInstance().appContext.config.globalProperties);
// // const globalProperties = internalInstance.appContext.config.globalProperties;
// globalProperties.$commonApi.getUserDataList({
//     departmentId: 0,
//     orgId: 10110,
//     pageNo: 1,
//     pageSize: 2000
// }).then((data) => {
//     console.log(data);
// });

// // 挂载到全局
// console.log(globalProperties.$_t('menu.dashBoard'));
// globalProperties.$deepClone();

const filterData1 = ref([
    {
        searchField: { 
            id: 2994, 
            objectId: 366, 
            apiKeyValue: 'lead.apiKey1', 
            displayName: '单选select'
        },
        matchType: '$eq',
        condMode: 0, // condMode是值得时候 传value, 是字段的时候
        value: '111',
        searchRange: [{
            id: 2994, 
            objectId: 366, 
            apiKeyValue: 'lead.apiKey1', 
            displayName: '单选select'
        }]
    },
    {
        searchField: { 
            id: 2993, 
            objectId: 366, 
            apiKeyValue: 'lead.facebookLead', 
            displayName: '来源 Facebook Leads'
        },
        matchType: '$eq',
        condMode: 0, // condMode是值得时候 传value, 是字段的时候
        value: '111',
        searchRange: [{
            id: 2994, 
            objectId: 366, 
            apiKeyValue: 'lead.apiKey1', 
            displayName: '单选select'
        }]
    }
]);

const filterData2 = ref([
    {
        searchField: { 
            id: 2994, 
            objectId: 366, 
            apiKeyValue: 'lead.apiKey1', 
            displayName: '单选select'
        },
        matchType: '$eq',
        condMode: 1, // condMode是值得时候 传value, 是字段的时候
        value: '',
        searchRange: [{
            id: 2994, 
            objectId: 366, 
            apiKeyValue: 'lead.apiKey1', 
            displayName: '单选select'
        }]
    },
    {
        searchField: { 
            id: 2993, 
            objectId: 366, 
            apiKeyValue: 'lead.facebookLead', 
            displayName: '来源 Facebook Leads'
        },
        matchType: '$eq',
        condMode: 1, // condMode是值得时候 传value, 是字段的时候
        value: '',
        searchRange: [{
            id: 2994, 
            objectId: 366, 
            apiKeyValue: 'lead.apiKey1', 
            displayName: '单选select'
        }]
    }
]);

const submit = () => {
    console.log(setFilter.value.getOriginalData());
}
</script>
<style lang="scss" scoped>
._son {
    // display: $namespace;
    // display: flex;
    border: 1px solid red;
    border-radius: 2px;
}
</style>