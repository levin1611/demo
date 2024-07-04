<!-- 添加部门弹窗 -->
<template>
    <el-dialog 
        :width="600"
        :append-to-body="true"

        v-model="props.dialogVisible" class="custom-class-add89" status-icon
        @close="closeDialog()" :title="radioForAddRoles==1?  '批量追加角色':'批量收回角色'">
        <main class="add_form_main">
            <div class="memeberName">
                {{$t('departmentAndMember.FPCY')}}（{{ currentShowName.length }}）： 
                {{ currentShowName.join('、') }}
            </div>
            <el-input v-model="filterText" class="filterName" placeholder="请输入" />

            <div class="treeWrap">
                <el-tree
                    ref="treeRef"
                    class="filter-tree"
                    node-key="id"
                    :data="role_radio_option"
                    :props="{
                        label: 'nameCn'
                    }"
                    show-checkbox
                    :default-checked-keys="currentCheck"
                    default-expand-all
                    :filter-node-method="filterNode"
                />
            </div>
        </main>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="closeDialog()">{{$t('cancel')}}</el-button>
                <el-button type="primary" @click="submit">
                    {{$t('confirm')}}
                </el-button>
            </span>
        </template>
    </el-dialog>

</template>
  
<script setup>
import { reactive, ref, watch, toRefs, toRef, shallowRef, shallowReactive, toRaw} from 'vue';
import { getAllRole } from '@/api/role.js'; // 角色相关api请求
import { batchAuthRole, takeBackAuthRole } from '@/api/members.js'; // 角色相关api请求
import { useUserStore } from '@/pinia/modules/user.js';
import { CODESTATE } from '@/https/codeConfig';
const store = useUserStore();
// 查询当前用户下的所有角色
let response = await getAllRole({
    orgId: store.orgId,
    userId: store.userId,
    flag: 3,
    pageFlag: false
});
const filterText = ref('');
const treeRef = ref();
const props = defineProps(['dialogVisible', 'memebrName', 'oprateType', 'radioForAddRoles']);
const emit = defineEmits(['update:dialogVisible', 'callbackForAdd']);
const { radioForAddRoles } = toRefs(props);
const currentShowName = reactive([]); // 要展示的成员名称
const currentCheck = reactive([]); // 当前选中的id

let role_radio_option = []; // 角色选项
if (response.data && response.data.length > 0) {
    role_radio_option = response.data;
}

if ( props.oprateType) {
    // 如果是批量创建 需要获取所有table选中的数据 
    props.oprateType.forEach(row => {
        getNameAndRoles(row);
    });
}


watch(filterText, (val) => {
    treeRef.value && treeRef.value.filter(val);
});

function getNameAndRoles(selectRow) {
    if (!selectRow) return;
    // 获取到姓名以及 获取到当前选中的权限
    // 将当前点击的这一行存入数组中
    currentShowName.push(selectRow.cnName);
    // if (selectRow.roles && selectRow.roles.length) {
    //     selectRow.roles.forEach((ele) => {
    //         currentCheck.push(ele.id);
    //     });
    // }
}

const filterNode = (value, data) => {
    if (!value) return true;
    return data.nameCn.includes(value);
};
function closeDialog() {
    // 关闭modal弹窗
    emit('update:dialogVisible', false);
}

async function submit() {
    const roleIdList = treeRef.value.getCheckedKeys();
    if (!roleIdList.length) {
        return ElMessage.error('请先选择角色再保存');
    }
    const userIdList = props.oprateType.map(ele => ele.id);
    // 开始调用保存接口
    const params = {
        // 要传递的参数
        userId: store.userId,
        orgId: store.orgId,
        userIdList: userIdList,
        roleIdList
    };
    let res;
    if (radioForAddRoles.value == 1) {
        // 新增权限
        res = await batchAuthRole(params);
    } else {
        // 回收权限
        res = await takeBackAuthRole(params);
    }
    if (res.code == CODESTATE.SUCCESS) {
        ElMessage.success(res.messageShow);
        emit('callbackForAdd', 'success');
    } else {
        ElMessage.error(res.messageShow);
        emit('callbackForAdd', 'error');
    }
    closeDialog();
}
</script>
  
<style scoped lang="scss">
.memeberName{
    margin-bottom: 10px;
    font-size: 14px;
    line-height: 22px;
    max-height: 66px;
    overflow-y:auto ;
}
.filterName{
    margin-bottom: 16px;
}
.treeWrap{
    max-height: 350px;
    overflow-y: auto;
}
.custom-class-add89 {
    .#{$elnamespace}-select, .#{$elnamespace}-input-number{
        width: 100%;
        
    }
    .#{$elnamespace}-input-number{
        :deep{
            .#{$elnamespace}-input__inner{
                text-align: left;
            }
        }
        
    }
   
   
}
:deep{
      
      .#{$elnamespace}-tree-node__expand-icon.is-leaf{
          display: none;

      }
      .#{$elnamespace}-tree-node__content{
            background-color: transparent !important;
    }
    .#{$elnamespace}-tree-node__content:hover{
        background-color: transparent;
    }
  }
</style>
<style lang="scss">
.custom-class-add89 {
   .#{$elnamespace}-dialog__header{
        position: relative;
        height: unset;
        width: unset;
   }
}
</style>

  