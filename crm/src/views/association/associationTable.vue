<template>
    <div class="common-table" style="padding: 20px 0 20px 24px">
        <div class="common-table-title">{{$t('association.title')}}</div>
        <div class="common-table-search">
            <label class="label">{{$t('association.fieldName1')}}</label>
            <el-select
                v-model="pageNationParams.data.parentObjId"
                @change="getChildObjectList"
                clearable
                :placeholder="$t('selectPlaceholder')"
            >
                <el-option
                    v-for="item in parentObjectList"
                    :key="item.objectId"
                    :label="item.objectName"
                    :value="item.objectId"
                />
            </el-select>
            <label class="label">{{$t('association.fieldName2')}}</label>
            <el-select
                v-model="pageNationParams.data.childObjId"
                clearable
                :placeholder="$t('selectPlaceholder')"
            >
                <el-option
                    v-for="item in childObjectList"
                    :key="item.objectId"
                    :label="item.objectName"
                    :value="item.objectId"
                />
            </el-select>
            <el-button
                @click="handleSearch"
                type="primary"
            >{{ $t('inquire') }}</el-button>
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
import { parentBizObjList, childBizObjList } from '@/api/association.js'; // api请求
// 引入 i18n 方法
const { t } = useI18n();
const store = useUserStore();
const pageNationRef = ref(null); // 分页组件的ref值
const parentObjectList = ref([]);
const childObjectList = ref([]);
const tableLoading = ref(false); // table组件的loading
const tableData = ref([]);
const pageNationParams = ref({
    url: '/v2-meta/relation/queryRelationList',
    method: 'post',
    data: {
        orgId: store.orgId,
        userId: store.userId,
        parentObjId: '',
        childObjId: ''
    }
});
const columns = ref([
    {
        label: 'association.fieldName1',
        prop: 'parentObject',
        width: ''
    },
    {
        label: 'association.fieldName2',
        prop: 'childObject',
        width: ''
    },
    {
        label: 'association.fieldName3',
        prop: 'relation',
        width: ''
    },
    {
        label: 'association.fieldName4',
        prop: 'listName',
        width: ''
    },
    {
        label: 'association.fieldName5',
        prop: 'relationDel',
        width: ''
    },
    {
        label: 'association.fieldName6',
        prop: 'visitRule',
        width: ''
    }
]);
// 获取父子对象列表
const getParentObjectList = () => {
    parentBizObjList().then((res) => {
        if (res.code === 10000) {
            parentObjectList.value = res.data;
        } else {
            ElMessage.error(res.messageShow);
        }
    });
};
getParentObjectList();
const getChildObjectList = async (val) => {
    pageNationParams.value.data.childObjId = '';
    if (val) {
        await childBizObjList({
            parentObjectId: val
        }).then((res) => {
            if (res.code === 10000) {
                childObjectList.value = res.data;
            } else {
                childObjectList.value = [];
                ElMessage.error(res.messageShow);
            }
        });
    } else {
        childObjectList.value = [];
    }
};
getChildObjectList();
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
const handleSearch = () => {
    pageNationRef.value.handleCurrentChange(1);
};
onMounted(() => {
    pageNationRef.value.handleCurrentChange(1);
});
</script>
<style lang="scss" scoped>
   
</style>