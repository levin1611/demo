<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div class="bg">
        <nav >{{ $t('departmentAndMember.title') }}</nav>
        <main>
            <!-- 左侧树部分 -->
            <el-row>
                <el-col :span="5">
                    <section class="tree_container">
                        <div class="tree_title">
                            <span>{{ $t('departmentAndMember.titleSecone') }}</span>
                            <!-- <span>新建</span> -->
                        </div>
                        
                        <customtree 
                            :data="SourceWidthOutMembers" 
                            :currentClickKeys="currentSelectValue"
                            @nodeClick="clicknode"
                            :wrapHeight="tHeight"
                            :noDisabled="true"
                            showSearch="input"
                            :showCount="true"
                            inputPlaceHolder="请输入部门名称"
                            @checkChange="handleCheckChange"
                        >
                            <template #default="{ params: {data, node} }" >
                                
                                <span class="oprate_area"  >
                                    <i class="custom custom custom-add tree_icon" @click.stop="addDepaetmrnt(data, node)"></i>
                                    <!-- data.parentId = 0 就是根节点 不需要 编辑 -->
                                    <i class="custom custom custom-field-edit tree_icon" v-if='data.parentId' @click.stop="addDepaetmrnt(data, node ,'edit')"></i>
                                </span>
                            </template>
                        </customtree>
                        
                    </section>

                </el-col>
                <!-- 右侧表格部分 -->
                <el-col :span="19"  style="padding: 0 0 0 19px;border-left: 1px solid rgb(232, 234, 236);">
                    <div class="right_nav" v-show="!selectCount.length">
                        <customfilter 
                            :paramList="paramList"
                            @toggleEl="toggleEl"
                            @valueChange="valueChange">
                        </customfilter>
                        <span  class="right_edit_area">
                            <!-- <span>登陆安全设置</span> -->
                            <el-dropdown split-button type="primary" @click="handleAddMemebr('createInfo')">
                                {{$t('departmentAndMember.createUser')}}
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="importDataByClick"> {{$t('departmentAndMember.PLXG')}}</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </span>
                    </div>
                    <div class="right_nav" v-show="selectCount.length">
                        <span class="right_nav_box">
                            <div class="select_nav">
                                已选择 <span class="count">{{ selectCount.length }}</span> 项目<span style="margin-right: 20px;"></span>
                                <el-button @click="openManyAddRoles">{{ $t('departmentAndMember.PLFP') }}</el-button>
                                <el-button @click="reSendLinkByEmailBatch" v-show="sendLink.length">重发链接</el-button>
                            </div>
                            <i class="custom custom-icon_close" @click="emptyCheck"></i>
                        </span>
                    </div>
                   
                
                    <el-auto-resizer style="height: auto;" v-loading="tableLoading">
                        <template #default="{ height, width }">
                            <el-table-v2 :columns="clounData" 
                                         ref="tableRef"
                                         :data="rTableData" 
                                         :width="width"
                                         :row-height="44"
                                         :fixed="true"
                                         :cache="5"
                                         :row-class="rowClass"
                                         :height="tHeight"
                                         :row-event-handlers="rowEventHanles"
                                         class="tabmain noBoxShadow-right noborder-table resizable-table custom-table" >
                                <template v-slot:header-cell="{column}" >
                                    <!-- 表头渲染的模板 -->
                                    <template v-if="column.dataKey === 'selection'">
                                        <el-checkbox
                                            :modelValue="isAll"
                                            @change="setSelect()"
                                        />
                                    </template>
                                </template>

                                <template v-slot:cell="{column,rowData}">
                                    <!-- 每个单元格渲染的模板 -->
                                    <template v-if="column.dataKey === 'selection'">
                                        <el-checkbox
                                            @click.stop
                                            :disabled="rowData.isAdmin"
                                            :modelValue ='!rowData.isAdmin? rowData.check: null'
                                            @change="changeValue(rowData)"
                                        />
                                    </template>
                                    <template v-if="column.dataKey === 'gender'">
                                        {{ rowData.gender ==2 ? '女': rowData.gender ==1 ? '男' : '未知'}}
                                    </template>
                                    <template v-if="column.dataKey === 'cnName'">
                                        <div class="table_text_overflow" :title="rowData.cnName">
                                            {{ rowData.cnName}}
                                        </div>
                                        <i v-if="rowData.isAdmin" class="custom custom-chaoguanzhanghao"></i>
                                    </template>
                                    
                                    <!-- 直属主管 -->
                                    <template v-if="column.dataKey === 'directLeaders'">
                                        <div class="table_text_overflow" :title="formateRelatedDepartments(rowData.directLeaders)">
                                            {{ formateRelatedDepartments(rowData.directLeaders)}}
                                        </div>
                                    </template>
                                    <!-- 状态 -->
                                    <template v-if="column.dataKey === 'activeStatus'">
                                        <div class="table_text_overflow" :title="formateStatus(rowData.activeStatus)">
                                            {{ formateStatus(rowData.activeStatus)}}
                                        </div>
                                    </template>

                                    <template v-if="column.dataKey === 'deleteFlag'">
                                        <div class="table_text_overflow" :title="formatedeleteFlag(rowData.deleteFlag)">
                                            {{ formatedeleteFlag(rowData.deleteFlag)}}
                                        </div>
                                    </template>

                                    <template v-if="column.dataKey === 'createTime'">
                                        <div class="table_text_overflow" :title="formateData(rowData.createTime).value">
                                            {{ formateData(rowData.createTime).value}}
                                        </div>
                                    </template>

                                    <template v-if="column.dataKey === 'updateTime'">
                                        <div class="table_text_overflow" :title="formateData(rowData.updateTime).value">
                                            {{ formateData(rowData.updateTime).value}}
                                        </div>
                                    </template>
                                    <template v-if="column.dataKey === 'userBirthday'">
                                        <div class="table_text_overflow" :title="formateData(rowData.userBirthday, 'YYYY-MM-DD').value">
                                            {{ formateData(rowData.userBirthday, 'YYYY-MM-DD').value}}
                                        </div>
                                    </template>
                                    <template v-if="column.dataKey === 'joinTime'">
                                        <div class="table_text_overflow" :title="formateData(rowData.joinTime, 'YYYY-MM-DD').value">
                                            {{ formateData(rowData.joinTime, 'YYYY-MM-DD').value}}
                                        </div>
                                    </template>
                                    <template v-if="column.dataKey === 'roles'">
                                        <div class="table_text_overflow" :title="formateRelatedDepartments(rowData.roles)">
                                            {{ formateRelatedDepartments(rowData.roles)}}
                                        </div>
                                    </template>
                                    <template v-if="column.dataKey === 'currency'">
                                        <div class="table_text_overflow" :title="formateCurrency(rowData.currency)">
                                            {{ formateCurrency(rowData.currency)}}
                                        </div>
                                    </template>
                                    <template v-if="column.dataKey === 'timezone'">
                                        <div class="table_text_overflow" :title="formateTimezone(rowData.timezone)">
                                            {{ formateTimezone(rowData.timezone)}}
                                        </div>
                                    </template>
                                    
                                 
                                    <!-- deleteFlag -->
                                </template>
                                <template v-slot:empty>
                                    <defaultEmpty></defaultEmpty>
                                </template>
                             
                            </el-table-v2>
                            <!-- 底部分页组件 -->
                            <pagenation 
                                ref="pageNationRef"
                                @updateData="updateData"
                                @changeBefore="beforeChangePage"
                                :parameter="pageNationParams"></pagenation>
                        </template>
                    </el-auto-resizer>
                </el-col>
            </el-row>

            <memberDetail 
                v-if="drawerVisible" 
                :freshDetail="freshDetail"
                :triggerElClass="['.custom-table']"
                :currentRow="currentRow"
                @editBaseInfo="handleAddMemebr('editInfo')"
                v-model:drawerVisible="drawerVisible"></memberDetail>
            <!-- // 新建和编辑部门弹窗 -->
            <addDepartment 
                v-if="dialogVisibleforAddDepartment" 
                v-model:dialogVisible="dialogVisibleforAddDepartment" 
                :currentNodeData="currentNodeData"
                @addDepartmentEmits="addDepartmentEmits"></addDepartment>
            <!-- 新建成员弹窗 -->
            <addMembers  
                v-if="dialogVisibleforAddMembers" 
                :currentRow="currentRow"
                :currentSelectMember="currentSelectValue"
                v-model:dialogVisible="dialogVisibleforAddMembers" 
                @addMembersEmits="addMembersEmits">
            </addMembers>
            <!-- 批量导入成员弹窗 -->
            <importData 
                v-if="dialogVisibleforImportData"
                @refreshData="addDepartmentEmits"
                v-model:dialogVisible="dialogVisibleforImportData" ></importData>
            <!-- 分配角色权限弹窗 -->
            <authRole 
                :oprateType="selectCount"
                :radioForAddRoles="radioForAddRoles"
                v-if="dialogVisibleforAuthRole"
                @callbackForAdd="pageNationRef.handleCurrentChange()"
                v-model:dialogVisible="dialogVisibleforAuthRole"></authRole>
            <!-- 批量分配角色弹窗 -->
            <el-dialog 
                :width="600"
                v-model="dialogVisibleforAddManyRoles" 
                status-icon
                :title="$t('departmentAndMember.PLFPJS')">
                <section class="manyForaddRoles">
                    <div style="margin-bottom: 18px;">{{$t('departmentAndMember.PLFPtips')}}</div>
                    <el-radio-group v-model="radioForAddRoles" class="ml-4">
                        <el-radio :label="1" size="large">{{$t('departmentAndMember.ZJJS')}}</el-radio>
                        <el-radio :label="2" size="large">{{$t('departmentAndMember.SHJS')}}</el-radio>
                    </el-radio-group>
                </section>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button type="primary" @click="closeSelfAndOpenAuthDialog">
                            {{ $t('departmentAndMember.nextstep') }}
                        </el-button>
                    </span>
                </template>
            </el-dialog>
        </main>
    </div>
</template>
<script setup>
import { reactive, ref, onMounted, watch, shallowReactive, unref, computed} from 'vue';
import {useCheckAll} from '@/hooks/tableCheckAll';
import {useTableHeight} from '@/hooks/tableHeight.js';

import { customfilter,customtree,defaultEmpty, pagenation } from 'xhl_lib'; // 表格树筛选组件
import { getUserAttrInfoList, reSendLinkByEmailBatchApi, getUserListTable } from '@/api/members.js';
import {getDepartmentDataTree} from '@/api/department.js';

import memberDetail from '@/views/members/modal/memberDetail.vue'; // 侧滑详情组件
import addDepartment from '@/views/members/modal/addDepartment.vue'; // 添加部门组件
import addMembers from '@/views/members/modal/addMember.vue'; // 添加部门成员弹窗
import importData from '@/views/members/modal/importData.vue'; // 批量导入成员弹窗
import authRole from '@/views/members/modal/authRole.vue';
import { getAllRole } from '@/api/role.js'; // 角色相关api请求
import {formateRelatedDepartments, formateStatus, formatedeleteFlag, formateData, formateCurrency, formateTimezone} from '@/views/members/hooks.js'; // 格式化表格数据
import { useUserStore } from '@/pinia/modules/user.js';
import { CODESTATE } from '@/https/codeConfig';
const store = useUserStore();
const {tHeight, height} = useTableHeight(174); // 表格高度

const drawerVisible = ref(false); // drawerVisible控制侧滑详情页展示状态
const radioForAddRoles = ref(1); // 追加角色还是 收回角色
import {clounData} from './config'; // 表头数据
import { useDepartmentTree, extend } from '@/pinia/modules/departmentTree.js'; // 引入部门树相关的数据
const treeDataStore = useDepartmentTree();
await treeDataStore.apiForGetData(); // 首次查询部门树数据
const SourceWidthOutMembers = computed(() => treeDataStore.SourceWidthOutMembers); // 没有部门成员的树数据
const dialogVisibleforAddDepartment = ref(false); // 控制新建部门弹窗显示与隐藏
const dialogVisibleforAddMembers = ref(false); // 控制新建部门弹窗显示与隐藏
const dialogVisibleforImportData = ref(false);
const dialogVisibleforAuthRole = ref(false); // 控制分配角色权限弹窗
const dialogVisibleforAddManyRoles = ref(false); // 批量追加角色
const freshDetail = ref(''); // 刷新详情组件
const currentNodeData = ref(); // 当前选中的树节点数据
const rTableData = ref([]); // 响应式表格数据
const {isAll, setSelect, changeValue, emptyCheck } = useCheckAll(rTableData); // v2table的复选框逻辑
const pageNationRef = ref(null); // 分页组件实例
const tableLoading = ref(true); // table组件的loading
const currentSelectValue = ref(SourceWidthOutMembers.value.length && SourceWidthOutMembers.value[0].id); // 当前选中的部门
let currentRow = ref({}); // 当前点击的 表格行
const selectCount = ref([]); // 选中的行
const sendLink = computed(() => selectCount.value.filter(ele => ele.activeStatus == 1)); // 状态邀请中的
const tableRef = ref(null); // 表格ref
const ZSZG_DATA = ref([]); // 直属主管数据
const paramList = ref({
    query: {
        Value: null,
        type: 'input',
        name: '姓名、英文名、邮箱、手机号、员工编号',
        placeholder: '姓名、英文名、邮箱、手机号、员工编号',
        notRemovable: true,
        width: '290px'
    },
    leaders: {
        Value: [],
        type: 'tree',
        name: '直属主管',
        width: '270px',
        placeholder: '请选择直属主管',
        renderTree: computed(() => ZSZG_DATA.value),
        filterType: 'input',
        onlyUser: 'onlyUser'
    },
    roleIds: {
        Value: [],
        type: 'select',
        name: '授权角色',
        placeholder: '请选择授权角色',
        options: []
    },
    jobTitles: {
        Value: [],
        type: 'select',
        name: '职位',
        placeholder: '请选择职位',
        options: [],
        OptionName: 'attrName'
    },
    jobLevels: {
        Value: [],
        type: 'select',
        name: '职级',
        placeholder: '请选择职级',
        options: [],
        OptionName: 'attrName'
    }
    
}); // 要渲染的筛选数组

const listQueryParams = { // list接口筛选所需的参数
    query: null, // 英文名称 邮箱 手机号 筛选
    leaders: [], // 直属主管
    roleIds: [], // 授权角色
    departmentId: currentSelectValue.value,
    jobLevels: [],
    jobTitles: [],
    userId: store.userId,
    orgId: store.orgId
};


const pageNationParams = {
    methods: getUserListTable,
    data: listQueryParams

};
onMounted(() => {
    pageNationRef.value.handleCurrentChange(1);
});
function updateData(data) {
    // 获取到了列表的数据
    data.forEach(ele => {
        ele.check = false;
        // 假数据 增加一个 属性
    });
    rTableData.value = data;
    tableLoading.value = false;
    // 将之前选中的数据 再次选中 发现table数据更新后之前选中的数据没有更新
    if (currentRow.value && currentRow.value.id) {
        const item = data.find(ele => ele.id == currentRow.value.id);
        if (!item) {
            // 如果数据已经被移走了 那就要 将弹窗关闭掉
            drawerVisible.value = false;
        } else {
            currentRow.value = item;
            freshDetail.value = Date.now();
        }
    }
    tableRef.value.scrollToTop(0);
}

const rowEventHanles = {
    // 虚拟表格  自定义点击事件处理
    onClick: clickRow
};

function clicknode({ data, node, treenode }) {
    // 点击树节点的事件
    listQueryParams.departmentId = data.id;
    currentSelectValue.value = data.id;
    pageNationRef.value.handleCurrentChange(1);
}

function handleCheckChange(data, check, imd) {
    // console.log(data, check, imd);
}

function clickRow(data) {
  
    // 点击表格中的某一行时打开 侧滑弹窗
    // console.log(data, 'onContextmenu');
    currentRow.value = data.rowData;
    drawerVisible.value = true;
}
function addDepaetmrnt(data, node, oprateType) {
    // oprateType操作类型 用来区分是编辑还是新增
    dialogVisibleforAddDepartment.value = true;
    currentNodeData.value = {...data, oprateType};
}
function addDepartmentEmits() {
    // 添加部门成功后的回调函数 用来更新树组件的数据
    treeDataStore.apiForGetData();
    pageNationRef.value.handleCurrentChange();

}

function addMembersEmits() {
    // 添加完部门成员之后
    treeDataStore.apiForGetData();
    pageNationRef.value.handleCurrentChange();

}
function handleAddMemebr(oprateType) {
    // 新建成员弹窗
    dialogVisibleforAddMembers.value = true;
    // 编辑模式
    if (currentRow.value) {
        currentRow.value.oprateType = oprateType;
    }
}

function valueChange(data) {
    // 参数改变的时候查询接口
    if (tableLoading.value) {
        ElMessage.warning('请稍后操作');
    } else {
        listQueryParams.query = data.query?.Value || null;
        listQueryParams.leaders = data.leaders?.Value || [];
        listQueryParams.jobLevels = data.jobLevels?.Value || [];
        listQueryParams.jobTitles = data.jobTitles?.Value || [];
        listQueryParams.roleIds = data.roleIds?.Value || [];
        pageNationRef.value.handleCurrentChange(1);

    }
}

function importDataByClick() {
    // 批量导入成员弹窗
    dialogVisibleforImportData.value = true;
}
function openAuthRole() {
    dialogVisibleforAuthRole.value = true;
}
function openManyAddRoles() {
    // 打开批量授权角色弹窗
    dialogVisibleforAddManyRoles.value = true;
}
function closeSelfAndOpenAuthDialog() {
    // 关闭上一步弹窗 然后打开下一步
    
    dialogVisibleforAddManyRoles.value = false;
    openAuthRole();
}

function resetValue(type) {
    // 清空的时候需要将dom隐藏
   
}
function toggleEl(menu) {
    // 点击筛选条件时 如果没有options则 查询选项
    // console.log(menu, '点击筛选条件', paramList.value[menu]);
    let currentTabData = paramList.value[menu];
    if(!currentTabData.options?.length) {
        switch (menu) {
            case 'jobTitles':
                // 查询职位选项
                getAttrInfoList(2);
                break;
            case 'jobLevels':
                // 查询职级选项
                getAttrInfoList(1);
                break;
            case 'roleIds':
                // 查询授权角色选项
                getAllroleOptions();
                break;
        }
    }
}

function beforeChangePage() {
    // 分页数据请求之前
    tableLoading.value = true;
}
const rowClass = ({rowData, rowIndex}) => {
    if (rowData.id === (currentRow.value && currentRow.value.id)) {
        return 'activeRow';
    } else if (rowIndex % 2 !== 0) {
        return 'stripe_dark';
    }
};
// 获取职位列表
const getAttrInfoList = (type) => {
    getUserAttrInfoList({
        orgId: store.orgId,
        type // 职级:1 职位:2
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            if (type == 2) {
                // 职位
                paramList.value.jobTitles.options = res.data;
            } else if (type == 1) {
                // 职级
                paramList.value.jobLevels.options = res.data;

            }
        } else {
            ElMessage.error(res.messageShow);
        }
    }).catch(err => {
        console.error(err);
        ElMessage.error(err.messageShow);
    });
};

function getAllroleOptions () {
    getAllRole({
        userId: store.userId,
        orgId: store.orgId,
        flag: 3,
        pageFlag: false
    }).then(res => {
        // console.log(res);
        paramList.value.roleIds.options = res.data;
    });
}
function reSendLinkByEmailBatch() {
    // 批量重发链接接口
    const userInfos = sendLink.value.map(ele => {
        return {
            mailAddress: ele.email,
            phone: ele.mobile,
            userId: ele.id
        };
    });
    reSendLinkByEmailBatchApi({
        orgId: store.orgId,
        userInfos
    }).then(res => {
        if (res.code === CODESTATE.SUCCESS) {
            ElMessage.success('链接已发送至邮箱');
            pageNationRef.value.handleCurrentChange();
        } else {
            ElMessage.error(res.messageShow)
        }
    });
}

function handleDepartData() {
    getDepartmentDataTree({
        userId: store.userId,
        orgId: store.orgId,
        relationType: 1
    }).then(response => {
        if ( response.code === 10000) {
            const copy = JSON.stringify(response.data);
            ZSZG_DATA.value = extend(JSON.parse(copy), true);
        } else {
            ElMessage(`查询部门树结构接口${response.messageShow}`);
        }
    });
}
handleDepartData();
watch(rTableData, (v) => {
    // 过滤一下选中的数据
    selectCount.value = v.filter(ele => ele.check && !ele.isAdmin);
}, {deep: true});
</script>
<style lang="scss" scoped>
.bg {
  background: #fff;

  nav {
    // height: 58px;
    box-sizing: border-box;
    padding-left: 24px;
    padding-top:12px;
    padding-bottom: 12px;
    font-size: 16px;
    font-weight:700;
  }

  main {
    border-top:1px solid rgb(232, 234, 236);
    border-left: 1px solid rgb(232, 234, 236);
    box-sizing:border-box;
    margin-left:24px;
    .tree_container {
      padding-left: 12px;
      .tree_title {
        margin: 10px 0 8px 0;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: space-between;
        font-weight:700;
        padding-right: 30px;
      }
     
    }
    .right_nav{
      display: flex;
    //   padding-top: 8px;
      align-items: center;
      ::v-deep .right_title{
        margin-top:8px;
      }
      .right_nav_box{
        margin: 10px 0;
        display: flex;
        gap: 6px;
        align-items:center;
        flex: 1;
        justify-content: space-between;
        flex-wrap: wrap;
        .select_nav{
            line-height: 32px;
            height: 32px;
            .count{
                color: $brandColor;
            }
        }
    }
      .right_edit_area{
        span{
          color: $textlinkColor;
          font-size: 12px;
          line-height: 17px;
          cursor: pointer;
          margin-right: 5px;
        }
        .newCreate-btn-group .newCreate-btn-group-newCreate {
            border-radius: 4px 0 0 4px !important;
        }
      }
    }

  }
  .oprate_area {
        display: none;
        i {
            margin-right: 8px;
            font-size:12px;
            &:hover{
                color:$textlinkColor;
            }
        }
    }
    :deep{
        .custom-tree-node:hover {
            .oprate_area {
                display: block;
            }
        }
    }
    .custom-journey-search{
        font-size: 18px;
    }
}

.manyForaddRoles{
    color: #303133;
    :deep{
        .#{$elnamespace}-radio.#{$elnamespace}-radio--large {
            margin-right: 80px;
            font-weight: 400;
            .#{$elnamespace}-radio__label{
                color: #303133;
            }
        }

    }
}
.table_text_overflow{
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.select_cus_simbal{
    position: relative;
    margin-right:10px ;
    cursor: pointer;
    .custom-close-circle{
        display: none;
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(50%,-50%);
    }
    &:hover .custom-close-circle{
        display: block;
    }
}
.custom-chaoguanzhanghao{
    color: #fbbc04;
    margin-left: 4px;
    font-size: 14px;
}
.custom-icon_close{
    cursor: pointer;
    font-size: 14px;
}
:deep{
    .#{$elnamespace}-table-v2__empty {
           top:50% !important;
           transform: translateY(-50%);
        }
}

</style>