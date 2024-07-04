<template>
    <div class="business-object-setting-container">
        <div class="title-container">
            <span class="custom custom-arrow-left back-icon" @click="backToIndex"></span>
            <span class="business-object-setting-title">{{ bizObjSettingTitle }}</span>
        </div>
        <el-tabs
            v-model="activeName"
            class="businessObjectSetting-tabs"
        >
            <el-tab-pane
                v-for="item in showTabs"
                :key="item.name"
                :label="item.label"
                :name="item.name"
                :lazy="true"
            >
                <!-- <KeepAlive> -->
                <component
                    :is="item.component"
                    v-model:bizObjTypeModalVisvible="bizObjTypeModalVisvible"
                    v-model:curEditBizObjType="curEditBizObjType"
                    v-model:lastBizObjId="lastBizObjId"
                    v-model:reactiveIdForUpdate="reactiveIdForUpdate"
                    v-model:defaultData="defaultData"
                    :currentSettingRow="currentSettingRow"
                    :activeItem="activeName"
                />
                <!-- </KeepAlive> -->
            </el-tab-pane>
        </el-tabs>
        <bizObjTypeModal
            v-model:dialogVisible="bizObjTypeModalVisvible"
            v-model:reactiveIdForUpdate="reactiveIdForUpdate"
            v-model:defaultData="defaultData"
            :curEditBizObjType="curEditBizObjType"
            :lastBizObjId="lastBizObjId"
            @clearDefaultData="clearDefaultData"
        />
    </div>
</template>

<script setup>
import { ref, inject, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import bizObjType from './components/bizObjType.vue';
import bizObjField from './components/bizObjField.vue';
import bizObjLayout from './components/bizObjLayout.vue';
import validationRuleList from '@/views/validationRuleList/validationRuleList.vue';
import duplicationCheckingRule from '@/views/duplicationCheckingRule/duplicationCheckingRule.vue';
import bizObjLeadConversionSettings from './components/bizObjLeadConversionSettings.vue';
import bizHighSeas from './components/bizHighSeas.vue';
// import teamMemberInheritSet from './components/teamMemberInheritSet.vue';
import phaseAdvanceSet from './components/phaseAdvanceSet.vue';
import bizObjFieldGroup from './components/bizObjFieldGroup.vue';
import bizObjDynamic from './components/bizObjDynamic.vue';
import privatePoolLimit from './components/privatePoolLimit.vue';
import fieldUpdateRule from './components/fieldUpdateRule.vue';
import bizObjTypeModal from './Modal/bizObjTypeModal.vue'; // 添加，编辑业务对象类型弹窗

// 当前选中的行
const currentSettingRow = inject('currentSettingRow');

const bizObjSettingTitle = computed(() => {
    const displayName = currentSettingRow.value.displayName;
    const apiKey = currentSettingRow.value.apiKey.charAt(0).toUpperCase() + currentSettingRow.value.apiKey.slice(1);
    return `${displayName}（${apiKey}）${t('settings')}`;
});

// 父组件 index 当前显示的组件
const currentComponent = defineModel('currentComponent');

// 国际化
const { t } = useI18n();

// 返回到业务对象页面
const backToIndex = () => {
    currentComponent.value = 'businessObject';
};

// 当前选中的 tab
const activeName = ref('');
// 全部 tab
const allTabs = [
    {
        name: 'bizObjType',
        label: '业务对象类型',
        component: bizObjType
    },
    {
        name: 'bizObjField',
        label: '字段',
        component: bizObjField
    },
    {
        name: 'bizObjLayout',
        label: '布局',
        component: bizObjLayout
    },
    {
        name: 'validationRuleList',
        label: '校验规则',
        component: validationRuleList
    },
    {
        name: 'duplicationCheckingRule',
        label: '查重规则',
        component: duplicationCheckingRule
    },
    {
        name: 'bizHighSeas',
        label: '公海设置',
        component: bizHighSeas
    },
    {
        name: 'bizObjLeadConversionSettings',
        label: currentSettingRow.value.apiKey == 'lead' ? '线索转化设置' : '转化规则设置',
        component: bizObjLeadConversionSettings
    },
    {
        name: 'bizObjFieldGroup',
        label: '字段组',
        component: bizObjFieldGroup
    },
    {
        name: 'bizObjDynamic',
        label: '动态',
        component: bizObjDynamic
    },
    // {
    //     name: 'teamMemberInheritSet',
    //     label: t('bizObject.teamMemberInheritSet'),
    //     component: teamMemberInheritSet
    // },
    {
        name: 'phaseAdvanceSet',
        label: t('bizObject.phaseAdvance'),
        component: phaseAdvanceSet
    },
    {
        name: 'fieldUpdateRule',
        label: t('bizObject.fieldUpdateRule'),
        component: fieldUpdateRule
    },
    {
        name: 'privatePoolLimit',
        label: t('bizObject.privatePoolLimit'),
        component: privatePoolLimit
    }
];
// 显示 tab
const showTabs = ref([]);
// 定义业务对象 apiKey 对应 Tab 的配置
const showTabConfig = {
    department: ['bizObjField'],
    staff: ['bizObjField'],
    lead: ['bizObjType', 'bizObjField', 'bizObjLayout', 'validationRuleList', 'duplicationCheckingRule', 'bizObjLeadConversionSettings', 'bizHighSeas', 'fieldUpdateRule', 'privatePoolLimit'],
    contact: ['bizObjType', 'bizObjField', 'bizObjLayout', 'validationRuleList', 'duplicationCheckingRule', 'fieldUpdateRule'],
    // 客户: 业务对象类型 字段 布局 校验规则 查重规则 新建规则(缺) 跟进规则(缺)
    // customer: ['bizObjType', 'bizObjField', 'bizObjLayout', 'validationRuleList', 'duplicationCheckingRule', 'teamMemberInheritSet'],
    customer: ['bizObjType', 'bizObjField', 'bizObjLayout', 'validationRuleList', 'duplicationCheckingRule', 'bizHighSeas', 'fieldUpdateRule', 'privatePoolLimit'],
    // 商机: 业务对象类型 字段 阶段推进 布局 校验规则 查重规则
    opportunity: ['bizObjType', 'bizObjField', 'phaseAdvanceSet', 'bizObjLayout', 'validationRuleList', 'duplicationCheckingRule', 'fieldUpdateRule'],
    // 触点: 业务对象类型 字段 布局 校验规则 转化设置(缺)
    touchPoint: ['bizObjType', 'bizObjField', 'bizObjLayout', 'validationRuleList', 'bizObjLeadConversionSettings'],
    // 触点联系人
    touchPointContact: ['bizObjType', 'bizObjField', 'bizObjLayout', 'validationRuleList', 'bizObjLeadConversionSettings', 'fieldUpdateRule'],
    // 跟进记录
    followUpRecord: ['bizObjType', 'bizObjField', 'bizObjLayout', 'validationRuleList', 'duplicationCheckingRule']
};
// 根据 apiKey 获取显示 tab
const getShowTabs = (apiKey) => {
    // 根据 apiKey 获取对应的 tabs
    const apikeyTabs = showTabConfig[apiKey];
    // 无匹配, 返回空
    if (!Array.isArray(apikeyTabs)) return [];

    // 过滤 tabList，只保留 apiKey 对应的 tabs
    return allTabs.filter(tab => apikeyTabs.includes(tab.name));
};

// 添加，编辑业务对象类型弹窗
const bizObjTypeModalVisvible = ref(false);
// 当前编辑的业务对象类型 obj
const curEditBizObjType = ref({});

// 最后一个业务对象类型 id
const lastBizObjId = ref(-1);

// 子组件监听 id 的变化, 进而获取最新的数据
const reactiveIdForUpdate = ref(0);

// 适用成员
const defaultData = ref([]);
// 清空适用成员
const clearDefaultData = () => {
    defaultData.value = [];
};

// 监听业务对象类型, 显示对应的 tabs
watch(
    () => currentSettingRow.value.apiKey,
    (val) => {
        // 设置显示 tabs
        showTabs.value = val ? getShowTabs(val) : [];
        // 设置默认选中的 tab
        activeName.value = val ? showTabs.value[0].name : '';
    },
    {
        immediate: true
    }
);
</script>

<style lang="scss" scoped>
.business-object-setting-container {
    .title-container {
        display: flex;

        .back-icon {
            cursor: pointer;
            font-size: 24px;
        }
    }
    .business-object-setting-title {
        position: relative;
        display: inline-block;
        color: #303133;
        font-size: 16px;
        font-weight: 500;
        line-height: 24px;
        margin-left: 24px;
        &::before {
            position: absolute;
            content: "";
            background-color: #E8E8E8;
            width: 1px;
        height: 18px;
            top: 3px;
            left: -12px;
        }
    }
}

.businessObjectSetting-tabs {
    :deep(.#{$elnamespace}-tabs__header) {
        margin-bottom: 12px;
    }
}
</style>
