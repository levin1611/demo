<template>
    <main class="auth_rol">
        <div v-if="! currentRow.roles?.length">
            <default-empty  description="暂未授权角色，请点击上方编辑基本信息中的【授权角色】字段进行授权"/>
        </div>
        
        <div class="permis_area" v-else>
            <span class="tip_lable">角色：</span>
            <el-radio-group v-model="role_value" >
                <el-radio-button v-for="item in currentRow.roles" :title="item.name" :label="item.id" :key="item.id">{{ item.name }}</el-radio-button>
            </el-radio-group>
        </div>

        <!-- 角色详情 -->
        <RoleDetail
            v-if="visible_roleDetail"
            v-model:visible="visible_roleDetail"
            v-model:role-data="curRoleData"
            from="memebrDetail"
            :disabled="true"
            :noHeader="true"
            :noFooter="true"
            @close="visible_roleDetail = false"
        ></RoleDetail>
    </main>
</template>

<script setup>
import { reactive, ref, toRefs, watch } from 'vue';
import RoleDetail from '@/views/role-permission/roleDetail.vue';
import defaultEmpty from '@/components/defaultEmpty.vue';

const props = defineProps(['drawerVisible', 'currentRow']);
const { currentRow } = toRefs(props);

const emits = defineEmits(['update:drawerVisible', 'emitCurrentRoles']);
// 查询用户下的角色

const role_value = ref(''); // 当前选中的角色id

if (currentRow.value.roles?.length > 0) {
    // 取数组第一项默认选中
    role_value.value = currentRow.value.roles[0].id;
}

// 角色详情
// 角色详情显隐
let visible_roleDetail = ref(false);
// 当前正在操作的角色的数据
let curRoleData = ref({});
// 查看角色
const viewRole = (data) => {
    curRoleData.value = data;
    visible_roleDetail.value = true;
};
// 监听角色 id 的变化, 切换角色详情
watch(
    role_value,
    (val) => {
        if (val) {
            let curRole = currentRow.value.roles.find((item) => item.id === val);
            viewRole(Object.assign({
                nameCn: curRole.name
            }, curRole));
        } else {
            visible_roleDetail.value = false;
        }
    },
    {
        immediate: true
    }
);

</script>
<style scoped lang="scss">
.auth_rol{
    .permis_area{
        display: flex;
        align-items: center;
        // margin-bottom: 8px;
        flex-wrap: wrap;
    }
    .tip_lable{
                color: #606266;
                font-weight: 400;
                font-size: 12px;
                margin-right: 10px;
            }
    :deep{
        .#{$elnamespace}-radio-button__inner{
            border: unset;
            box-shadow:none;
            padding: unset;
            font-size: 14px;
            font-weight: 700;
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .#{$elnamespace}-radio-button__original-radio:checked + .#{$elnamespace}-radio-button__inner {
                background-color: unset;
                border: none;
                color: $textlinkColor;
               
        }
        .#{$elnamespace}-radio-button__inner:hover{
            color: unset;
        }
        .#{$elnamespace}-radio-button{
            margin-right: 32px;
        }

        .roleDetail {
            padding: 0;
        }
    }
}
</style>

