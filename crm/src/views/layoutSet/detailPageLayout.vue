<!-- 新建/编详情页布局 -->
<template>
    <div
        v-loading="loading"
        class="detailPageLayout"
    >
        <!-- header -->
        <div class="detailPageLayout-header">
            <!-- 返回 -->
            <span
                @click="goBack"
                class="cursor-pointer"
            >
                <!-- 图标 -->
                <!-- <svg
                    aria-hidden="true"
                    class="svg-icon"
                >
                    <use xlink:href="#custom-back"></use>
                </svg> -->
                <span class="custom custom-arrow-left" style="font-size: 24px;"></span>
                <!-- 分割线 -->
                <el-divider
                    direction="vertical"
                    class="mx-3"
                ></el-divider>
            </span>

            <!-- 标题 -->
            <span>{{ title }}</span>

            <!-- 右侧 -->
            <div
                class="detailPageLayout-header-right"
            >
                <!-- 保存 -->
                <el-button
                    type="primary"
                    @click="save"
                >{{ $t('save') }}</el-button>
            </div>
        </div>

        <!-- 布局名称 -->
        <div class="detailPageLayout-layoutName">
            <span>{{ $t('layout.layoutName') }}</span>
            <el-input
                v-model="layoutName"
                maxlength="50"
            ></el-input>
        </div>

        <!-- 头部信息 -->
        <operate-mask
            :title="$t('layout.headTitleAndImportantInfo')"
            @set="handleSet('headerInfo')"
        >
            <headerInfo
                :settingData="settingData"
                from="layoutSet"
                class="detailPageLayout-headerInfo"
            ></headerInfo>
        </operate-mask>

        <!-- 商机独有, 阶段组件 -->
        <operate-mask
            v-if="bizObjConfig.apiKey === 'opportunity'"
            :title="$t('bizObject.phaseAdvance')"
            @set="handleSet('opportunityStage')"
        >
            <opportunityStage
                :infoData="{ objectTypeId: 'test', salesStageId: 1, stageUpdateTime: (Date.now() - 191 * 3600000), winRate: '0', winProbability: '0', salesStageStatus: 1 }"
                :reqParams="allModuleProps.opportunityStage.reqParams"
                v-bind="$attrs"
                class="bizObjDetail-opportunityStage"
            ></opportunityStage>
        </operate-mask>

        <!-- tabs -->
        <operate-mask
            :title="$t('layout.tabsNTabPaneInfo')"
            @set="handleSet('tabs')"
        >
            <el-tabs
                v-model="activeTabId"
                class="detailPageLayout-tabs"
            >
                <el-tab-pane
                    v-for="tab in tabsList"
                    :key="tab.tagId || `newTab_${tab.tagName}`"
                    :label="tab.tagName"
                    :name="tab.tagId || `newTab_${tab.tagName}`"
                ></el-tab-pane>
            </el-tabs>
        </operate-mask>

        <!-- 实际显示 tab 下内容的 tabs , 隐藏 header -->
        <el-tabs
            v-model="activeTabId"
            class="noHeader detailPageLayout-compoTabs"
        >
            <el-tab-pane
                v-for="tab in tabsList"
                :key="tab.tagId || `newTab_${tab.tagName}`"
                :label="tab.tagName"
                :name="tab.tagId || `newTab_${tab.tagName}`"
                :lazy="true"
                class="detailPageLayout-tabpane"
            >
                <operate-mask
                    v-for="(module, index) in tab.moduleList"
                    :key="index"
                    :title="compoNameMap[module.moduleType]"
                    @set="triggerSetModule(module)"
                >
                    <component
                        :is="compoList[translateModuleCompoName(module.moduleType)]"
                        :settings="module"
                        :bizObjConfig="props.bizObjConfig"
                        from="layoutSet"
                        v-bind="allModuleProps[module.moduleType] || {}"
                    >{{ 'moduleType: ' }}{{ module.moduleType }}{{ '; moduleId: ' }}{{ module.moduleId }}</component>
                </operate-mask>
            </el-tab-pane>
        </el-tabs>

        <!-- 编辑 module 设置弹框 -->
        <component
            v-if="moduleSetCompoName"
            :is="compoList[moduleSetCompoName]"
            v-model:visible="visible_editingModule"
            v-model:loading="loading_editingModule"
            v-model:settings="editingModuleData"
            :operateType="operateType"
            @save="saveModuleSet"
        ></component>
    </div>

    <!-- 离开确认 弹框 -->
    <confirmDialog
        v-model:visible="visible_leaveConfirm"
        :title="$t('leaveConfirm')"
        :tip-content="$t('role.tip_leaveRoleDetail')"
        @confirm="handleLeaveConfirm"
        @cancel="handleLeaveCancel"
    ></confirmDialog>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useUserStore } from '@/pinia/modules/user';
import { useDepartmentTree } from '@/pinia/modules/departmentTree.js'; // 引入部门树相关的数据
import { useI18n } from 'vue-i18n';
import { merge, assign, cloneDeep } from 'lodash';
import { getLayoutSet, getLayoutInitData, saveLayoutSet, createLayout } from '@/api/layout';
import { queryOptionByFieldIds, getNewusers, relFieldQueryBizDataList } from '@/api/common.js';
import operateMask from '@/views/layoutSet/components/operateMask';
import { defaultEmpty, headerInfo, detailInfo, teamMember, relevantList, followup, opportunityStage } from 'xhl_lib';
// import { defaultEmpty, headerInfo, detailInfo, teamMember } from 'xhl_lib';
// import { relevantList } from '/Volumes/zhaoyingzoe/codeFilder/company/xhl_lib/xhl-ui/main.js';
import confirmDialog from '@/components/confirmDialog.vue';
import detailInfoSet from './modal/detailInfoSet.vue';
import relevantListSet from './modal/relevantListSet.vue';
import headerInfoSet from './modal/headerInfoSet.vue';
import followupSet from './modal/followupSet.vue';
import tabsSet from './modal/tabsSet.vue';
import { setGlobalState } from '@/utils/common';

// 定义 model
const visible = defineModel('visible', { type: Boolean, default: false });
// 接受外部传参
const props = defineProps({
    // 操作类型
    operateType: {
        type: String,
        default: 'new'
    },
    // 布局数据
    layoutData: {
        type: Object,
        default: () => ({})
    },
    // 布局类型数据
    layoutConfig: {
        type: Object,
        default: () => ({})
    },
    // 业务对象数据
    bizObjConfig: {
        type: Object,
        default: () => ({})
    }
});
// 定义 emit
const emits = defineEmits([
    'update:layoutData',
    'operateSuccess'
]);

// 翻译
const { t } = useI18n();

// 取 pinia 数据
const store = useUserStore();
const treeDataStore = useDepartmentTree();
await treeDataStore.apiForGetData(); // 首次查询部门树数据
const SourceWidthOutMembers = computed(() => treeDataStore.SourceWidthOutMembers); // 没有部门成员的树数据
const SourceWidthMembers = computed(() => treeDataStore.SourceWidthMembers); // 有部门成员的树数据

// 全局变量
const loading = ref(false);

// 获取布局设置
// 保存所有初始数据
let initData = null;
// 保存设置数据
const settingData = ref({});
// 获取设置数据
const getSettings = async () => {
    // 显示 loading
    loading.value = true;

    // 发送请求
    let res;
    if (props.operateType === 'new') {
        // 新建布局

        // 获取初始空白数据
        res = await getLayoutInitData({
            layoutType: props.layoutConfig.layoutType,
            objectId: props.bizObjConfig.id
        });
    } else if (props.layoutData.layoutId) {
        // 编辑/复制 布局

        // 获取现有数据
        res = await getLayoutSet({
            id: props.layoutData.layoutId
        });
    }
    // 结果处理
    if (res && res.code === 10000) {
        settingData.value = handleData(res.data);
        // 暂存初始数据, 用于新建时对比数据看是否有修改
        initData = {};
        initData.settingData = JSON.parse(JSON.stringify(settingData.value));
        initData.layoutName = layoutName.value;
    } else {
        // 请求失败

        initData = null;
        ElMessage.error(res.message);
    }

    // 取消 loading
    loading.value = false;
};
// 处理设置数据
const handleData = (data) => {
    if (!data) return {};

    // 处理布局名称
    if (data.layoutName) {
        switch (props.operateType) {
            case 'new':
                layoutName.value = '';
                break;
            case 'copy':
                layoutName.value = `${data.layoutName}1`;
                break;
            case 'edit':
            default:
                layoutName.value = data.layoutName;
        }
        // 字符上限 50
        layoutName.value = layoutName.value.trim().slice(0, 50);
    }

    // 头部信息图标处理 --- 改为从布局数据里取了
    // data.iconName = data.iconName || props.bizObjConfig.iconName;
    // if (!data.iconName) {
    //     switch (props.bizObjConfig.apiKey) {
    //         case 'lead': // 线索
    //             data.iconName = 'custom-clue';
    //             break;
    //         case 'contact': // 联系人
    //             data.iconName = 'custom-contact';
    //             break;
    //     }
    // }

    // 复制布局特殊处理
    // 去掉被复制布局中的各种 ID --- 注释掉, 后端说新建接口会自动忽略旧 ID 重新赋值
    // if (props.operateType === 'copy') {
    //     delete data.layoutId;
    //     data.id = 0;
    //     if (Array.isArray(data.layoutTagList)) {
    //         data.layoutTagList.forEach(tagItem => {
    //             delete tagItem.tagId;
    //             if (Array.isArray(tagItem.moduleList)) {
    //                 tagItem.moduleList.forEach(moduleItem => {
    //                     delete moduleItem.moduleId;
    //                     moduleItem.id = 0;
    //                 });
    //             }
    //         });
    //     }
    // }

    // 处理 tabs
    handleTabsData(data);

    return data;
};
// 处理 tabs 数据, 单独抽离出来
const handleTabsData = (data) => {
    let result = data.layoutTagList || [];
    tabsList.value = Array.isArray(result) ? result : [];

    // 处理默认 tab
    result.some(tab => {
        if (tab.defaultFlag) {
            activeTabId.value = tab.tagId || `newTab_${tab.tagName}`;
            return true;
        }
    });
    // 如果默认 tab 没有设置, 则取第一个
    if (!activeTabId.value && result[0]) {
        activeTabId.value = result[0].tagId || `newTab_${result[0].tagName}`;
    }
};

// header
// 标题
const title = computed(() => {
    switch (props.operateType) {
        case 'new':
            return t('layout.createDetailPageLayout');
        case 'edit':
            return t('layout.editDetailPageLayout');
        case 'copy':
            return t('layout.copyDetailPageLayout');
        default:
            return '';
    }
});
// 布局名称
const layoutName = ref('');
// 返回
const goBack = (force) => {
    // 如果要求强制返回, 则直接返回
    if (force === true) {
        visible.value = false;
        return;
    }

    // 新建布局时, 返回时需要判断数据是否有修改, 未保存则弹出提示框提示保存
    if (checkDataIsChanged()) {
        visible_leaveConfirm.value = true;
        return;
    }

    // 其他情况, 正常返回
    visible.value = false;
};
// 检查数据是否有变更
const checkDataIsChanged = () => {
    // 新建布局时, 判断数据是否有修改
    if (props.operateType === 'new' && initData) {
        if (
            (JSON.stringify(initData.settingData) !== JSON.stringify(settingData.value))
            || (layoutName.value !== initData.layoutName)
        ) {
            return true;
        }
    }

    // 默认 false
    return false;
};
// 保存设置
const save = async () => {
    // 布局名称空值校验
    if (!layoutName.value.trim()) {
        ElMessage.error(t('mustInputWarn', { name: t('layout.layoutName') }));
        return;
    }

    // 显示 loading
    loading.value = true;

    // 发送请求
    let res;
    let postData = {
        orgId: store.orgId,
        userId: store.userId,
        id: props.layoutData.layoutId,
        layoutName: layoutName.value.trim().slice(0, 50)
    };
    if (['new', 'copy'].includes(props.operateType)) {
        // 新建/复制布局

        // 所有布局设置数据 -- 后端说新建布局时数据里有 id 不影响
        postData = Object.assign({}, cloneDeep(settingData.value), postData);
        // 部分数据需要特殊处理
        if (Array.isArray(postData.layoutTagList)) {
            postData.layoutTagList.forEach(tagItem => {
                if (Array.isArray(tagItem.moduleList)) {
                    tagItem.moduleList.forEach(moduleItem => {
                        // 详情页配置 - 详细资料组件, layoutFieldDto 属性需要改为 selectFieldIds
                        if (moduleItem.layoutFieldDto) {
                            const tmpFieldDto = moduleItem.layoutFieldDto;
                            delete moduleItem.layoutFieldDto;

                            if (Array.isArray(tmpFieldDto.selectedList)) {
                                moduleItem.selectFieldIds = tmpFieldDto.selectedList;
                            }
                        }
                        // 相关列表组件, fieldId 改为 relationFieldId
                        if (moduleItem.moduleType === 10) {
                            if (moduleItem.fieldId && !moduleItem.relationFieldId) {
                                moduleItem.relationFieldId = moduleItem.fieldId;
                                delete moduleItem.fieldId;
                            }
                        }
                        delete moduleItem.moduleId;
                        moduleItem.id = 0;
                    });
                }
            });
        }

        // 创建布局
        res = await createLayout(postData);
    } else {
        // 编辑布局

        // 只保存布局名称, 其他布局设置的数据由各自的编辑框保存
        res = await saveLayoutSet(postData);
    }
    // 结果处理
    if (res && res.code === 10000) {
        ElMessage.success(t('saveSuccess'));

        // 发送操作成功事件给上一级别
        emits('operateSuccess', postData);
        // 关闭当前页, 返回上一级
        goBack(true);
    } else {
        // 保存失败

        ElMessage.error(res.messageShow);
    }

    // 取消 loading
    loading.value = false;
};

// tabs 组件
// 标签列表
const tabsList = ref([]);
// 默认显示的标签 id
const activeTabId = ref('');
// 组件列表
const compoList = {
    defaultEmpty,
    detailInfo,
    detailInfoSet,
    relevantList,
    relevantListSet,
    headerInfoSet,
    followupSet,
    tabsSet,
    teamMember,
    followup
};
// 组件名称多语言列表
const compoNameMap = {
    2: t('layout.detailInfo'), // 详细资料
    3: t('layout.dynamic'), // 动态
    4: t('layout.followUp'), // 跟进记录
    6: t('layout.teamMember'), // 团队成员
    8: t('layout.relatedSchedule'), // 相关日程
    9: t('layout.relatedDoc'), // 相关文档
    10: t('layout.relevantList') // 相关列表
};
// 转换 moduleType 为 UI 组件名
const translateModuleCompoName = (moduleType) => {
    let result = '';
    // 无数据, 默认返回"空数据组件"
    switch (`${moduleType}`) {
        case '2': // 详细资料组件
            result = 'detailInfo';
            break;
        case '4': // 跟进记录组件
            result = 'followup';
            break;
        case '6': // 团队成员
            result = 'teamMember';
            break;
        case '10': // 相关列表组件
            result = 'relevantList';
            break;
        default: // 默认, 返回"空数据组件"
            result = 'defaultEmpty';
            break;
    }
    return result;
};
// 组件的其他参数(给需要请求接口的组件模拟数据)
const allModuleProps = computed(() => {
    // 初始化不同对象的通用数据
    const result = {
        4: {
            reqParams: {
                getFollowupObjTypeList: {
                    api: () => {
                        return new Promise((resolve) => {
                            resolve({
                                code: 10000,
                                data: [
                                    {
                                        id: 1,
                                        name: '类型1'
                                    },
                                    {
                                        id: 2,
                                        name: '类型2'
                                    },
                                    {
                                        id: 3,
                                        name: '类型3'
                                    }
                                ]
                            });
                        });
                    },
                    reqData: {
                    }
                },
                getUserFilterOptions: {
                    api: getNewusers,
                    reqData: {
                        orgId: store.orgId,
                        userId: store.userId
                    }
                },
                getRelFieldFilterOptions: {
                    api: relFieldQueryBizDataList,
                    reqData: {}
                },
                getSelFilterOptions: {
                    api: queryOptionByFieldIds,
                    reqData: {}
                },
                getFollowupList: {
                    api: () => {
                        return new Promise((resolve) => {
                            resolve({
                                code: 10000,
                                data: {
                                    pageInfo: {
                                        list: [
                                            {
                                                id: 1,
                                                createdUser_value: '用户1',
                                                objectType_value: '类型1',
                                                content: '与销售对接',
                                                createdTime: [2023, 3, 1, 12, 0, 0, 0]
                                            },
                                            {
                                                id: 2,
                                                createdUser_value: '用户2',
                                                objectType_value: '类型2',
                                                content: '见老板',
                                                createdTime: [2023, 2, 1, 12, 0, 0, 0]
                                            },
                                            {
                                                id: 3,
                                                createdUser_value: '用户3',
                                                objectType_value: '类型3',
                                                content: '进入付款流程',
                                                createdTime: [2023, 1, 1, 12, 0, 0, 0]
                                            }
                                        ],
                                        total: 3,
                                        pageNum: 1,
                                        pageSize: 30
                                    },
                                    total: 3
                                }
                            });
                        });
                    },
                    reqData: {
                    }
                },
                delFollowup: {
                    api: () => {
                        return new Promise((resolve) => {
                            resolve({
                                code: NaN,
                                messageShow: '设置页不支持删除'
                            });
                        });
                    }
                }
            },
            departData: SourceWidthOutMembers,
            departUserData: SourceWidthMembers
        }, // 跟进记录
        6: {
            reqParams: {
                getMemberList: {
                    api: () => {
                        return new Promise((resolve) => {
                            resolve({
                                code: 10000,
                                data: {
                                    pageInfo: {
                                        list: [
                                            {
                                                memberName: '秦力',
                                                roleType: 1,
                                                permissionType: 3,
                                                sourceType: '--'
                                            },
                                            {
                                                memberName: '销售部',
                                                roleType: 2,
                                                permissionType: 2,
                                                sourceType: '内销陌生拜访客户共享-【自定义权限规则】'
                                            },
                                            {
                                                memberName: '秦立军',
                                                roleType: 2,
                                                permissionType: 0,
                                                sourceType: '从客户【鑫互联】继承'
                                            },
                                            {
                                                memberName: '李小龙',
                                                roleType: 2,
                                                permissionType: 1,
                                                sourceType: 1,
                                                operateUserName: '王芳'
                                            }
                                        ],
                                        total: 4,
                                        pageNum: 1,
                                        pageSize: 10
                                    },
                                    permissionResp: {
                                        addPermission: true,
                                        deletePermission: true,
                                        editPermission: true
                                    }
                                }
                            });
                        });
                    },
                    reqData: {
                        pageSize: 10
                    }
                },
                tableProps: {
                }
            }
        }, // 团队成员
        10: {
            reqParams: {
                getDataList: { 
                    api: () => {
                        return new Promise((resolve) => {
                            resolve({
                                code: 10000,
                                data: {
                                    list: [{}, {}],
                                    total: 2,
                                    pageNum: 1,
                                    pageSize: 10
                                }
                            });
                        });
                    },
                    reqData: {
                        orgId: store.orgId,
                        userId: store.userId
                    }
                }
            }
        } // 相关列表
    };

    // 根据对象的不同, 定制加上各种参数
    switch (props.bizObjConfig.apiKey) {
        case 'opportunity': // 商机
            // 独有的商机跟进阶段组件
            result.opportunityStage = {
                reqParams: {
                    queryStageList: {
                        api: () => {
                            return new Promise((resolve) => {
                                resolve({
                                    code: 10000,
                                    data: [
                                        {
                                            id: 1,
                                            name: '初步接洽',
                                            stageStatus: 1,
                                            winProbability: '10'
                                        },
                                        {
                                            id: 2,
                                            name: '需求确定',
                                            stageStatus: 1,
                                            winProbability: '0'
                                        },
                                        {
                                            id: 3,
                                            name: '方案/报价',
                                            stageStatus: 1,
                                            winProbability: '0'
                                        },
                                        {
                                            id: 4,
                                            name: '谈判审核',
                                            stageStatus: 1,
                                            winProbability: '0'
                                        },
                                        {
                                            id: 5,
                                            name: '赢单',
                                            stageStatus: 2,
                                            winProbability: '0'
                                        },
                                        {
                                            id: 6,
                                            name: '输单',
                                            stageStatus: 3,
                                            apiKey: 'lose',
                                            winProbability: '0'
                                        }
                                    ]
                                });
                            });
                        },
                        reqData: {}
                    },
                    queryStageDetail: {
                        api: (postData) => {
                            return new Promise((resolve) => {
                                resolve({
                                    code: 10000,
                                    data: [
                                        {
                                            id: 1,
                                            name: '初步接洽',
                                            winProbability: '0',
                                            keyFields: [],
                                            opportunityStageEventListRespList: postData.id !== 1 ? [] : [
                                                {
                                                    id: 11,
                                                    stageId: 1,
                                                    name: '10',
                                                    winProbability: '10',
                                                    fileUsageFlag: 0,
                                                    description: '',
                                                    fileInfoRespList: null,
                                                    completeFlag: 0
                                                }
                                            ],
                                            updateTime: 1715330597000
                                        }
                                    ]
                                });
                            });
                        },
                        reqData: {}
                    }
                }
            };
            break;
    }

    // return
    return result;
});

// 设置弹框
// 弹框显隐
const visible_editingModule = ref(false);
// 弹框 loading
const loading_editingModule = ref(false);
// 当前编辑中的 module 数据
const editingModuleData = ref({});
// 设置弹框组件名, 根据 module 类型显示
const moduleSetCompoName = ref('');
// 打开 header, tabs 等组件的设置弹框
const handleSet = async (compoType) => {
    // 清空原组件名, 重新渲染弹框
    moduleSetCompoName.value = '';
    await nextTick();

    // 更新编辑弹框组件名
    switch (compoType) {
        case 'headerInfo': // 头部信息
            moduleSetCompoName.value = 'headerInfoSet';
            break;
        case 'followup': // 跟进记录
            moduleSetCompoName.value = 'followupSet';
            break;
        case 'tabs': // tabs
            moduleSetCompoName.value = 'tabsSet';
            break;
    }

    if (moduleSetCompoName.value) {
        // 赋值数据
        editingModuleData.value = settingData.value;
        // 显示弹框
        visible_editingModule.value = true;
    } else {
        // 弹出提示
        ElMessage.warning(t('layout.tip_cannotSetThisCompo'));
        // 赋值数据
        editingModuleData.value = {};
        // 显示弹框
        visible_editingModule.value = false;
    }
};
// 打开 tab 下各 module 设置弹框
const triggerSetModule = async (moduleData) => {
    // 部分组件不可设置, 弹出提示 + 退出流程
    if ([6].includes(moduleData.moduleType)) {
        ElMessage.warning(t('layout.tip_cannotSetThisCompo'));
        return;
    }

    // 清空原组件名, 重新渲染弹框
    moduleSetCompoName.value = '';
    await nextTick();

    // 更新编辑弹框组件名
    const moduleCompoName = translateModuleCompoName(moduleData.moduleType);
    if (moduleCompoName !== 'defaultEmpty') {
        // 注意: compoList 里面各设置组件名要用 UI 组件名 + set 命名
        moduleSetCompoName.value = `${moduleCompoName}Set`;
    }
    // 赋值数据
    editingModuleData.value = moduleData;
    // 显示弹框
    visible_editingModule.value = true;
};
// 保存组件设置
const saveModuleSet = async (savingSetData) => {
    if (props.operateType === 'edit') {
        // 编辑布局, 调接口更新模块设置

        // 显示 loading
        loading_editingModule.value = true;

        // 组装请求数据
        let postData = {};
        const moduleName = moduleSetCompoName.value;
        // 根据当前编辑数据类型处理数据
        if (moduleName === 'headerInfoSet') {
            // 编辑头部信息

            postData.id = editingModuleData.value.layoutId;
            postData = Object.assign(postData, savingSetData);
        } else if (moduleName === 'tabsSet') {
            // 编辑 tab 标签页

            postData.id = editingModuleData.value.layoutId;
            postData.tagListEditParam = savingSetData.layoutTagList.map((item) => {
                const result = {
                    id: item.tagId,
                    tagName: item.tagName,
                    moduleListEditParam: item.moduleList.map((moduleItem) => {
                        // 暂存数据
                        const result = {
                            id: moduleItem.moduleId,
                            moduleType: moduleItem.moduleType
                        };
                        if (moduleItem.moduleType === 10) {
                            // 相关列表
                            result.relationFieldId = (moduleItem.fieldId || moduleItem.relationFieldId);
                        }

                        return result;
                    })
                };
                return result;
            });
        } else if (editingModuleData.value.moduleType) {
            // 编辑 tab 下的模块

            postData = {
                // 布局 ID
                id: props.layoutData.layoutId,
                moduleInfoEditParam: Object.assign({}, savingSetData, {
                    id: editingModuleData.value.moduleId,
                    moduleType: editingModuleData.value.moduleType
                })
            };
        } else {
            // 数据错误, 报错 return
            loading_editingModule.value = false;
            return;
        }

        // 发送请求
        const res = await saveLayoutSet(postData);

        // 请求数据处理
        if (res.code === 10000) {
            // 成功

            // 关闭弹框
            visible_editingModule.value = false;
            // 更新设置数据
            let updateData = savingSetData;
            if (moduleName === 'tabsSet') {
                // tabs 标签页编辑

                // 标签页编辑完毕后, 往往有新增的组件或 Tab 页, 需要重新获取设置数据, 否则新数据没有 id , 再次编辑会有问题
                getSettings();
            }
            updateModuleData(editingModuleData.value, updateData);
        } else {
            // 失败

            ElMessage.error(res.message);
        }

        // 取消 loading
        loading_editingModule.value = false;
    } else {
        // 新建, 复制布局, 直接更新 settings 数据, 相关数据直接在编辑布局页面点保存按钮时统一保存

        // 关闭弹框
        visible_editingModule.value = false;
        // 更新设置数据
        updateModuleData(editingModuleData.value, savingSetData);
    }
};
// 合并新编辑数据保存到组件数据中
const updateModuleData = (moduleData, savingData) => {
    // 定义合并数据模式, 默认递归合并
    let mergeMode = 'merge';

    // 根据组件类型的不同, 单独处理下待合并数据
    let updateData = {};
    if (moduleSetCompoName.value === 'headerInfoSet') {
        // 头部信息

        // 更新 settings 数据
        updateData = savingData;
        // 全量覆盖旧数据
        mergeMode = 'assign';
    } else if (['relevantListSet', 'followupSet'].includes(moduleSetCompoName.value)) {
        // 更新 settings 数据
        updateData = savingData;
        // 全量覆盖旧数据
        mergeMode = 'assign';
    } else if (moduleSetCompoName.value === 'tabsSet') {
        // tabs 设置

        // 更新 settings 数据
        updateData = {
            layoutTagList: savingData.layoutTagList
        };
        // 全量覆盖旧数据
        mergeMode = 'assign';

        // 更新 tabs 列表数据
        activeTabId.value = '';
        tabsList.value = [];
        nextTick(() => {
            handleTabsData(updateData);
        });
    } else {
        // 编辑 tab 下 module
        switch (`${moduleData.moduleType}`) {
            case '2': // 详细资料组件
                updateData = { ...savingData };
                updateData.layoutFieldDto = {
                    selectedList: updateData.selectFieldIds
                };
                delete updateData.selectFieldIds;
                // 清空旧数据的选中字段, 避免删除字段后, merge 完毕后被删字段仍然存在/字段显示有误
                moduleData.layoutFieldDto.selectedList = [];
                break;
        }
    }
    if (mergeMode === 'merge') {
        // 合并模式, 递归更新数据, 将新旧数据中的相同字段进行合并, 不同字段直接覆盖
        // 注意, merge 已修改源数据
        merge(moduleData, updateData);
    } else {
        // 否则, 直接覆盖数据
        assign(moduleData, updateData);
    }

    return moduleData;
};

// 离开确认弹框
const visible_leaveConfirm = ref(false);
// 离开确认
const handleLeaveConfirm = async () => {
    // 离开页面时通知基座, 当前页面退出编辑状态
    setGlobalState({
        editingState: {
            value: false,
            proj: 'permSys',
            triggerCompo: 'detailPageLayout',
            evtType: 'leaveConfirm'
        }
    });

    // 等一会儿, 基座可能需要路由跳转
    await nextTick();

    // 强制返回
    goBack(true);
};
// 取消离开
const handleLeaveCancel = () => {
    // 取消离开页面时通知基座
    setGlobalState({
        editingState: {
            value: true,
            proj: 'permSys',
            triggerCompo: 'detailPageLayout',
            evtType: 'leaveCancel'
        }
    });
};

// 请求数据
getSettings();

// 进入页面时通知基座, 当前页面处于编辑状态, 基座路由跳转需要
onMounted(() => {
    setGlobalState({
        editingState: {
            value: true,
            proj: 'permSys',
            triggerCompo: 'detailPageLayout',
            evtType: 'onMounted',
            beforeLeaveCb: () => {
                if (checkDataIsChanged()) {
                    // 弹出离开确认框
                    visible_leaveConfirm.value = true;

                    // 阻止基座路由跳转
                    return true;
                }

                // 默认不阻止基座路由跳转
                return false;
            }
        }
    });
});

// 离开页面时通知基座, 当前页面退出编辑状态, 基座路由跳转需要
onBeforeUnmount(() => {
    setGlobalState({
        editingState: {
            value: false,
            proj: 'permSys',
            triggerCompo: 'detailPageLayout',
            evtType: 'onBeforeUnmount'
        }
    });
});
</script>

<style lang="scss" scoped>
.detailPageLayout {
    background: var(--#{$elnamespace}-bg-color-page);
    height: 100%;
    box-sizing: border-box;
    padding: 14px 0 0 12px;

    &-header {
        margin: 0 20px 16px 0;
        display: flex;
        font-size: 16px;
        font-weight: 500;

        span {
            font-weight: var(--#{$elnamespace}-font-weight-primary);
        }

        &-right {
            flex: 1;
            text-align: right;
        }
    }

    &-layoutName {
        background: #FFF;
        margin-bottom: 12px;
        padding: 8px 12px;

        .#{$elnamespace}-input {
            width: 500px;
            margin-left: 58px;
        }

        &::before {
            content: "*";
            color: var(--#{$elnamespace}-color-danger);
            margin-right: 4px;
        }
    }

    ::v-deep &-headerInfo {
        background: #FFF;
        margin-bottom: 8px;
    }

    &-tabs {
        background: #FFF;
        padding: 4px 0 0 20px;
        z-index: 0;
        position: relative;

        :deep(.#{$elnamespace}-tabs__header) {
            margin-bottom: 1px;
        }
    }

    &-compoTabs {
        :deep(.#{$elnamespace}-tabs__content) {
            overflow: visible;
        }
    }

    ::v-deep &-tabpane {
        background: #FFF;
    }
}
</style>