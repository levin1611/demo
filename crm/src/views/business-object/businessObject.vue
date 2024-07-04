<template>
    <div class="business-object-container">
        <div class="business-title">{{ $t('bizObject.bizObjSetting') }}</div>

        <el-tabs
            v-model="activeName"
            @tab-change="tabChange"
            class="demo-tabs">
            <el-tab-pane
                v-for="item in tabList"
                :key="item.name"
                :label="item.label"
                :name="item.name"
            >
                <KeepAlive>
                    <component
                        :is="item.component"
                    />
                </KeepAlive>
            </el-tab-pane>
        </el-tabs>

        <!-- 有 tab 时: height="calc(100vh - 228px)" -->
        <!-- 无 tab 时: height="calc(100vh - 176px)" -->
        <elTable
            :data="tableData"
            v-loading="tableLoading"
            stripe
            height="calc(100vh - 176px)"
            class="business-object-table"
        >
            <elTableColumn
                v-for="column in tableColumns"
                :key="column.prop"
                :label="column.label"
                :prop="column.prop"
                :min-width="column.minWidth"
                :width="column.width"
            >
                <!-- 图标 -->
                <template v-if="column.prop === 'icon'" #default="{ row }">
                    <span :class="['custom-icon', 'custom', row.iconName]"></span>
                </template>
                <!-- 业务对象名称 -->
                <template v-else-if="column.prop === 'displayName'" #default="{ row }">
                    <el-link type="primary" @click="goSettingPage(row)">{{ row[column.prop] }}</el-link>
                </template>
                <!-- 描述 -->
                <template v-else-if="column.prop === 'description'" #default="{ row }">
                    <el-tooltip
                        popper-class="business-object-description-box"
                        effect="light"
                        :content="`<p class='business-object-description-content'>${row[column.prop]}</p>`"
                        raw-content
                        placement="bottom"
                        show-after="500"
                    >
                        <span class="custom custom-message-text1"></span>
                    </el-tooltip>
                </template>
                <!-- 操作 -->
                <template v-else-if="column.prop === 'operation'" #default="{ row }">
                    <!-- 部门/成员不可以编辑 -->
                    <div class="operate-btn">
                        <el-link v-if="!hideTabs.includes(row.apiKey)" type="primary" @click="editRow(row)">{{ $t('edit') }}</el-link>
                        <el-link v-else type="primary" style="width: 28.33px;visibility: hidden;"></el-link>
                        <el-link type="primary" @click="goSettingPage(row)">{{ $t('settings') }}</el-link>
                    </div>
                </template>

                <template v-else #default="{ row }">
                    <span>{{ row[column.prop] }}</span>
                </template>
            </elTableColumn>
        </elTable>

        <!-- 底部分页组件 -->
        <paggenation
            ref="pageNationRef"
            @updateData="updateData"
            @changeBefore="beforeChangePage"
            :queryConfig="pageNationParams"
            :layout="layout"></paggenation>

        <!-- 编辑业务对象 -->
        <editBusinessObjects
            v-model:dialogVisible="dialogVisible"
            :currentEditBizObj="currentEditBizObj"
            :disabled="isEditSystemBiz"
            @refreshData="refreshData"
        ></editBusinessObjects>
    </div>
</template>

<script setup>
import paggenation from '@/components/pagenation.vue';
import { queryObjInfo } from '@/api/businessObjects.js';
import { CODESTATE } from '@/https/codeConfig';
import { ref, onMounted, inject, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import editBusinessObjects from './Modal/editbizObjModal.vue'; // 编辑业务对象弹窗
import { useUserStore } from '@/pinia/modules/user.js';

// 取 pinia 数据
const store = useUserStore();
// 父组件 index 当前显示的组件
const currentComponent = defineModel('currentComponent');

// 多语言
const { t } = useI18n();

const hideTabs = ['department', 'staff'];

// 当前选中的 tab
const activeName = ref('systemBusinessObjects');
// 监听 activeName 的变化, 并修改父组件 isSystemBizObj 的值
watch(activeName, (val) => {
    nextTick(() => {
        isSystemBizObj.value = val === 'systemBusinessObjects';
    });
}, { immediate: true });
// tab 列表
// const tabList = [
//     {
//         name: 'systemBusinessObjects',
//         label: t('bizObject.systemStandardBusinessObjects')
//     },
//     {
//         name: 'customBusinessObjects',
//         label: t('bizObject.customBusinessObjects')
//     }
// ];
// 
const isSystemBizObj = defineModel('isSystemBizObj');
// tab 切换
const tabChange = (name) => {
    // 切换 系统标准业务对象 和 自定义业务对象 时, 重置 pageNo 和 url 地址
    // if (activeName.value === 'systemBusinessObjects') {
    //     pageNationParams.url = 'http://192.168.72.118:8080//v2-meta/bizObj/queryObjList';
    // }

    pageNationRef.value.handleCurrentChange(1);
};

// 分页器配置
const layout = 'prev, pager, next';
// 分页组件实例
const pageNationRef = ref(null);

// table组件的loading
const tableLoading = ref(true);
// 表格数据
const tableData = ref([]);
// 表格列
const tableColumns = [
    {
        label: t('bizObject.icon'),
        prop: 'icon',
        width: 60,
        showInput: false
    },
    {
        label: t('bizObject.businessObjectName'),
        prop: 'displayName',
        minWidth: 200,
        showInput: false
    },
    {
        label: t('bizObject.describe'),
        prop: 'description',
        minWidth: 160,
        showInput: false
    },
    {
        label: t('bizObject.programIdentificationName'),
        prop: 'apiKey',
        minWidth: 240,
        showInput: false
    },
    {
        label: t('operate'),
        prop: 'operation',
        minWidth: 220,
        showInput: false
    }
];

const listQueryParams = ref({ // list接口筛选所需的参数
    orgId: store.orgId,
    predefinedFlag: 1
});

const pageNationParams = {
    // url: 'http://192.168.72.118:8080//v2-meta/bizObj/queryObjList',
    url: '/v2-meta/bizObj/queryObjList',
    method: 'post',
    data: listQueryParams.value,
    pageSize: 10
};

const updateData = (data) => {
    tableLoading.value = false;
    tableData.value = data;
    // 获取到了列表的数据
};

const beforeChangePage = () => {
    // 分页数据请求之前
    tableLoading.value = true;
};

// 获取数据
onMounted(() => {
    pageNationRef.value.handleCurrentChange();
});

// 编辑业务对象
const currentEditBizObj = ref({});
// 当前是否是编辑系统业务对象
const isEditSystemBiz = computed(() => activeName.value === 'systemBusinessObjects');
// 编辑
const editRow = (row) => {
    queryObjInfo({
        objectId: row.id
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            currentEditBizObj.value = res.data;
            dialogVisible.value = true;
        } else {
            ElMessage.error(res.messageShow);
        }
    }).catch(err => {
        console.error(err);
        ElMessage.error(err.messageShow);
    });
};

// 当前选中的行
const currentSettingRow = inject('currentSettingRow');

// 进入设置页面
const goSettingPage = (row) => {
    currentSettingRow.value = row;
    currentComponent.value = 'businessObjectSetting';
};

// 编辑业务对象
const dialogVisible = ref(false);
// 刷新数据
const refreshData = () => {
    pageNationRef.value.handleCurrentChange();
};
</script>

<style lang="scss" scoped>
.business-object-container {
    .business-title {
        color: #303133;
        font-size: 16px;
        font-weight: 500;
        line-height: 24px;
        margin-bottom: 12px;
    }

    .business-object-table {
        .custom-icon {
            font-size: 24px;
        }
    }
}
</style>
<style lang="scss">
.business-object-description-box {
    max-width: 400px;
    .business-object-description-content {
        font-size: 14px;
        line-height: 22px;
        max-height: calc(8 * 22px);
        overflow-y: auto;
    }
}

.custom-message-text1 {
    cursor: pointer;
    font-size: 18px;
    color: #606266;
    &:hover {
        color: #3B78DE;
    }
}
</style>
