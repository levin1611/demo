<template>
    <div class="common-table" style="padding: 20px 0 20px 24px">
        <div class="common-table-title">{{$t('noticeSetting.title')}}</div>
        <div class="common-table-search">
            <el-tabs v-model="pageNationParams.data.objectId" class="demo-tabs" @tab-change="handleChange">
                <el-tab-pane v-for="item in objectList"
                             :key="item.id"
                             :label="item.displayName"
                             :name="item.id"></el-tab-pane>
            </el-tabs>
        </div>
        <el-table
            v-loading="tableLoading"
            :data="tableData"
            height="calc(100vh - 220px)"
            stripe
        >
            <el-table-column
                v-for="column in columns"
                :key="column.prop"
                :prop="column.prop"
                :label="$t(column.label)"
                :width="column.width"
            >
                <template #default="{ row }">
                    <template v-if="column.prop === 'enableFlag'">
                        <el-switch
                            disabled
                            v-model="row.enableFlag"
                            width="50"
                            inline-prompt
                            @change="handleStatusChange(row)"
                            :active-text="$t('enabled')"
                            :inactive-text="$t('bizObject.disable')"
                        />
                    </template>
                    <template v-else-if="column.prop === 'operate'">
                        <span>--</span>
                    </template>
                </template>
            </el-table-column>
        </el-table>
        <paggenation
            ref="pageNationRef"
            layout="total, prev, pager, next, sizes, jumper"
            :queryConfig="pageNationParams"
            @updateData="updateData"
            @changeBefore="beforeChangePage"></paggenation>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useUserStore } from '@/pinia/modules/user.js';
import paggenation from '@/components/pagenation.vue';
import { useI18n } from 'vue-i18n';
import { updateEnableFlag } from '@/api/noticeSetting.js'; // api请求
import { queryRelationObjList } from '@/api/fieldModal.js'; // api请求
// 引入 i18n 方法
const { t } = useI18n();
const store = useUserStore();
const pageNationRef = ref(null); // 分页组件的ref值
const objectList = ref([]);
const tableLoading = ref(false); // table组件的loading
const tableData = ref([]);
const pageNationParams = ref({
    url: '/v2-meta/relation/queryRelationList',
    method: 'post',
    data: {
        orgId: store.orgId,
        userId: store.userId,
        objectId: ''
    }
});
const columns = ref([
    {
        label: 'noticeSetting.fieldName1',
        prop: 'parentObject',
        width: ''
    },
    {
        label: 'noticeSetting.fieldName2',
        prop: 'childObject',
        width: '100'
    },
    {
        label: 'noticeSetting.fieldName3',
        prop: 'relation',
        width: '150'
    },
    {
        label: 'noticeSetting.fieldName4',
        prop: 'listName',
        width: ''
    },
    {
        label: 'noticeSetting.fieldName5',
        prop: 'relationDel',
        width: ''
    },
    {
        label: 'noticeSetting.fieldName6',
        prop: 'visitRule',
        width: '150'
    },
    {
        label: 'noticeSetting.fieldName7',
        prop: 'enableFlag',
        width: '160'
    },
    {
        label: 'noticeSetting.fieldName8',
        prop: 'operate',
        width: '220'
    }
]);
// 获取父子对象列表
const getObjectList = () => {
    queryRelationObjList().then((res) => {
        if (res.code === 10000) {
            objectList.value = res.data;
            objectList.value.unshift({
                displayName: '全部',
                id: ''
            });
        } else {
            ElMessage.error(res.messageShow);
        }
    });
};
getObjectList();
// 分页请求前置处理
const beforeChangePage = () => {
    tableLoading.value = true;
};
// 分页数据请求完毕, 更新表格数据
const updateData = (data) => {
    tableData.value = data.map(item => {
        item.relation = relationState(item.relation);
        item.relationDel = relationDelState(item.relationDel);
        item.visitRule = visitRuleState(item.visitRule);
        return item;
    });
    tableLoading.value = false;
};
const relationState = (val) => {
    if (val === '28') {
        return t('fieldSet.fieldType13');
    } else if (val === '29') {
        return t('fieldSet.fieldType14');
    } else {
        return '';
    }
};
const visitRuleState = (val) => {
    if (val === 1) {
        return t('fieldSet.text1');
    } else if (val === 2) {
        return t('fieldSet.text2');
    } else {
        return '';
    }
};
const relationDelState = (val) => {
    if (val === 1) {
        return t('fieldSet.cascadeDeleteType1');
    } else if (val === 2) {
        return t('fieldSet.cascadeDeleteType2');
    } else if (val === 3) {
        return t('fieldSet.cascadeDeleteType3');
    } else {
        return '';
    }
};
const handleChange = (name) => {
    pageNationRef.value.handleCurrentChange(1);
};
// 修改状态
const handleStatusChange = (row) => {
    updateEnableFlag({
        id: row.id,
        enableFlag: row.enableFlag ? 1 : 0
    }).then(res => {
        if (res.code === 10000) {
            ElMessage.success('操作成功');
        } else {
            ElMessage.error(res.messageShow);
            row.enableFlag = !row.enableFlag;
        }
    });
};
onMounted(() => {
    pageNationRef.value.handleCurrentChange(1);
});
</script>
<style lang="scss" scoped>
   
</style>