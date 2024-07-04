<!-- 阶段推进设置 -->
<template>
    <div
        v-loading="loading"
        class="phaseSet"
    >

            <div class="phaseSet-body">
                <!-- 左侧目录 -->
                <div class="phaseSet-menu">
                    <!-- 选择业务动作类型 -->
                    <el-menu
                        :default-active="curActionVal"
                        @select="selectAction"
                    >
                        <el-menu-item
                            v-for="item in actionList"
                            :key="item.id"
                            :index="item.id"
                        >{{ item.name }}</el-menu-item>
                    </el-menu>
                </div>
                <div>
                    <el-radio-group
                        v-model="roleType"
                        class="phaseSet-roleType"
                    >
                        <el-radio-button
                            :value="1"
                        >阶段设置</el-radio-button>
                        <el-radio-button
                            :value="2"
                        >阶段流程</el-radio-button>
                        <!-- <el-radio-button
                            :value="3"
                        >阶段推进</el-radio-button> -->
                    </el-radio-group>
                    <el-tabs
                        :model-value="roleType"
                        class="noHeader"
                        style="position:absolute; width: calc(100% - 210px); height: 100%; overflow-y: auto;"
                    >
                        <!-- 阶段设置 -->
                        <el-tab-pane
                            :label="1"
                            :name="1"
                            :lazy="true"
                            class="phaseSet-tabpane promote-setting"
                        >
                            <stageSetting
                                :curActionVal="curActionVal"></stageSetting>
                        </el-tab-pane>
                        <!-- 阶段流程 -->
                        <el-tab-pane
                            :label="2"
                            :name="2"
                            :lazy="true"
                            class="phaseSet-tabpane"
                        >
                            <stageFlowPath
                                :isActive="roleType === 2"
                                :curActionVal="curActionVal"></stageFlowPath>
                        </el-tab-pane>
                        <!-- 阶段推进 -->
                        <el-tab-pane
                            :label="3"
                            :name="3"
                            :lazy="true"
                            class="phaseSet-tabpane"
                        >
                        <p class="promote-setting-title">商机推进控制规则：</p>
                        <div>
                            <p class="promote-setting-p">
                                <el-checkbox
                                    class="promote-setting-checkbox"
                                    v-model="checkAll"
                                ></el-checkbox>
                                <span>只能顺序操作阶段和关键事件</span><span style="color: #EA4355;">（这项配置点击保存后立即生效，无需同步）</span>
                            </p>
                            <p style="margin-left: 20px;margin-bottom: 40px">
                                勾选：只能顺序操作阶段中的工作内容（包括关键事件、关键信息、阶段审批等），不可以操作非相邻阶段上的工作内容（如果当前阶段前后阶段无必须完成的内容（如关键事件、关键信息、阶段审批）的，可以操作再相邻阶段的工作内容），其他会置灰处理。不勾选：可以操作所有阶段中的工作内容（包括关键事件、关键信息、阶段审批等）。
                            </p>
                        </div>
                        <el-button type="primary">保存</el-button>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>
    </div>
</template>

<script setup>
import { ref, inject, onMounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { queryObjTypeList } from '@/api/businessObjects.js';
import { CODESTATE } from '@/https/codeConfig';
import stageSetting from './components/stageSetting.vue';
import stageFlowPath from './components/stageFlowPath.vue';
import { useUserStore } from '@/pinia/modules/user.js';
// 取 pinia 数据
const store = useUserStore();

const props = defineProps({
    activeItem: {
        type: Number
    }
});

// 接收父组件传, 当前选中的行
const currentSettingRow = inject('currentSettingRow');

// 取当前显示的语种
const { t } = useI18n();

// 全局变量
const loading = ref(false);

const roleType = ref(1);
// 左侧目录
// 当前业务操作类型
const curActionVal = ref(1);
// 支持的业务操作动类型
const actionList = ref([]);
// 选中业务对象
const selectAction = (val) => {
    curActionVal.value = val;
};



// 阶段推进tab功能
const checkAll = ref(true);
// 请求数据

// 阶段推进tab功能
const getLeftData = () => {
    queryObjTypeList({
        orgId: store.orgId,
        userId: store.userId,
        objectId: currentSettingRow.value.id
    }).then(res => {
        if (res.code == 10000) {
            const list = res.data;
            if (list && list.length) {
                actionList.value = list;
                curActionVal.value = list[0].id;
            } else {
                ElMessage.error(t('bizObject.noMoreData'));
            }
            // tableData.value = tableData.value.concat(handleData(list));
        } else {
            ElMessage.error(res.messageShow);
        }
    }).catch(err => {
        ElMessage.error(err.messageShow);
    });
}
onMounted(() => {
    getLeftData();
})
watch(computed(() => props.activeItem), (val) => {
    console.log(val)
    if(val === 'phaseAdvanceSet') {
        getLeftData();
    }
})
</script>

<style lang="scss" scoped>
.phaseSet {
    &-roleType {
        margin-bottom: 12px;

        ::v-deep .#{$elnamespace}-radio-button {
            --#{$elnamespace}-radio-button-checked-bg-color: var(--#{$elnamespace}-color-white);
            --#{$elnamespace}-radio-button-checked-text-color: var(--#{$elnamespace}-color-primary);
            --#{$elnamespace}-radio-button-checked-border-color: var(--#{$elnamespace}-color-primary);
        }
    }

    ::v-deep &-tabpane {
        .#{$elnamespace}-checkbox {
            --#{$elnamespace}-checkbox-text-color: var(--#{$elnamespace}-text-color-primary);
        }
        .promote-setting {
            position: absolute;
            width: 100%;
            &-title {
                line-height: 22px;
                margin-bottom: 12px;
            }
            &-checkbox{
                margin-right: 8px;
                height: 20px;
            }
            &-p{
                margin-bottom: 12px;
                line-height: 22px;
            }
        }
    }

    ::v-deep &-title {
        margin-bottom: 12px;

        span {
            display: inline-block;
            margin-right: 14px;
            vertical-align: text-bottom;
            font-weight: 500;
        }
    }

    ::v-deep &-tip {
        white-space: pre;
        margin-bottom: 20px;
    }

    ::v-deep &-body {
        display: flex;
        border-right: 0;
        border-bottom: none;
    }

    ::v-deep &-menu {
        width: 200px;
        height: calc(100vh - 220px);
        border: 1px solid var(--#{$elnamespace}-border-color-light);
        margin-right: 10px;

        .#{$elnamespace}-menu {
            border: none;

            &-item {
                height: 40px;
                padding: 0 13px;

                &.is-active {
                    background-color: var(--#{$elnamespace}-menu-hover-bg-color);
                    font-weight: 700
                }
            }
        }
    }

    &-panel {
        flex: 1;
        padding: 11px 19px;

        ::v-deep .#{$elnamespace}-table {
            height: 100%;

            &__inner-wrapper {
                &::before {
                    height: 0;
                }
            }
        }
    }
}
</style>