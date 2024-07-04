<template>
    <el-drawer 
        v-model="props.drawerVisible" 
        class="member_detail pointer-events-auto"
        modal-class="pointer-events-none"
        @close="closeCb"
        :modal="false"
        ref="drawerRef"
        :show-close="false"
        :with-header="false">
        <main class="main_wrap"  ref="roleDrawerRef" :key="freshDetail">
            <nav class="head_area">
                <!-- 头部个人信息部分 -->
                <div class="nav_info">
                    <div class="popel_info">
                        <img :src="image" alt="头像" width="40">
                        <!-- <i class="custom  custom-touxiang"></i> -->
                        <span class="use_name">{{currentRow.cnName}}</span>
                    </div>
                    <div class="oprate_btn">
                        <el-button @click="reSendLinkByEmailBatch" v-if="currentRow.activeStatus == 1" size="normal">重发链接</el-button> <span class="line" v-if="currentRow.activeStatus == 1">|</span> 
                        <span @click="closeCb">
                            <i class="custom  custom-icon_close" style="cursor: pointer;"></i>
                        </span>
                    </div>
                </div>
                <div class="craete_info">
                    <span>{{$t('departmentAndMember.createTime')}}：{{ formateData(currentRow.createTime).value}}</span>
                    <span>{{$t('departmentAndMember.accountStatus')}}：{{ formatedeleteFlag(currentRow.deleteFlag)}}</span>
                </div>
            </nav>
            <section class="base_info">
                <div class="base_title" @click="enditBaseInfo">{{$t('departmentAndMember.baseInfo')}} 
                    <i class="custom custom custom-edit-2 editbaseInfoicon"  @click="enditBaseInfo"></i>
                </div>
                <el-row class="wrap_row_baseinfo" >
                    <el-col :span="12">
                        <div class="web_tip" 
                             v-for="(item) in (closeFlas? shortLeft : left_info)" 
                             :key="item.title" >
                            <span class="tip_lable">{{item.title}}：</span>
                            <span class="tip_content">{{item.value}}</span>
                        </div>
                    </el-col>
                    <el-col :span="12">
                        <div class="web_tip" v-for="(item) in (closeFlas? shortRight : right_info)" :key="item.title">
                            <span class="tip_lable">{{item.title}}：</span>
                            <span class="tip_content">{{item.value}}</span>
                        </div>
                    </el-col>
                </el-row>
                <span class="open_more" @click="openMoreInfo">{{ closeFlas? $t('departmentAndMember.loadMore') : $t('departmentAndMember.closeUp')}}</span>
            </section>
            
            <section :key="freshFlag">
                <!-- tab标签部分 -->
                <el-tabs
                    v-model="activeName"
                    @tab-click="handleClick"
                    class="memberDetail-tabs"
                >
                    <el-tab-pane :label="$t('departmentAndMember.SQJS')" name="first">
                        <viewMemberAuth 
                            :currentRow="currentRow"
                        />
                    </el-tab-pane>
                    <el-tab-pane label="自定义权限规则" name="second">
                        <div style="color: #606266;font-size:12px;">通过以下自定义权限规则可获得其他数据权限</div>
                        <el-table 
                            :stripe="true"
                            :data="tableData" 
                            style="width: 100%">
                            <el-table-column prop="ruleName" :label="$t('permRule.ruleName')" />
                            <el-table-column prop="shareToUser" :label="$t('memberScope')"  />
                            <el-table-column  :label="$t('operate')" width="120">
                                <el-link type="primary">详情</el-link>
                            </el-table-column>
                        </el-table>
                    </el-tab-pane>
                </el-tabs>
            </section>
        </main>
    </el-drawer>
</template>

<script setup>
import { reactive, ref, toRefs, watch, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { onClickOutside } from '@vueuse/core';
import CSSVariables from '@/style/js.module.scss';
const { elnamespace } = CSSVariables;
import viewMemberAuth from '@/views/members/modal/viewMemberAuth.vue'; // 查看用户相关的角色
import { reSendLinkByEmailBatchApi, getCustomPerList } from '@/api/members.js';
import { useUserStore } from '@/pinia/modules/user.js';
import { CODESTATE } from '@/https/codeConfig';

const store = useUserStore();
import {formateGender, formateStatus, formateRelatedDepartments, formateData, formatedeleteFlag, formateCurrency, formateTimezone} from '@/views/members/hooks.js'; // 格式化表格数据
const props = defineProps(['drawerVisible', 'currentRow', 'freshDetail', 'triggerElClass']);
const { currentRow, freshDetail } = toRefs(props);
const emits = defineEmits(['update:drawerVisible', 'editBaseInfo']);
const publicPath = process.env.BASE_URL;
const freshFlag = ref(); // 刷新详情页数据
const tableData = ref([]); // 成员的权限规则
// 关闭 drawer
const drawerRef = ref(null);

const image = `${publicPath}/image/avater.svg`;

// 回显查询到的数据

let left_info = computed(() => [ // 描述列表信息左侧部门
    {
        title: '激活状态',
        value: formateStatus(currentRow.value.activeStatus)

    },
    {
        title: '姓名',
        value: currentRow.value.cnName
    },
    {
        title: '邮箱',
        value: currentRow.value.email
    },
    {
        title: '所属部门',
        value: currentRow.value.departmentName
    },
    {
        title: '相关部门',
        value: formateRelatedDepartments(currentRow.value.relatedDepartments)
    },
    {
        title: '职位',
        value: currentRow.value.jobTitleName
    },
    {
        title: '备注',
        value: currentRow.value.remark
    },
    {
        title: '授权角色',
        value: formateRelatedDepartments(currentRow.value.roles)
    },
    // 新增字段
    {
        title: '入职日期',
        value: formateData(currentRow.value.joinTime, 'YYYY-MM-DD').value
    },
    {
        title: '微博',
        value: currentRow.value.weibo
    },
    // {
    //     title: '语言编码',
    //     value: currentRow.value.languageCode
    // },
   
    // {
    //     title: '时区',
    //     value: formateTimezone(currentRow.value.timezone) 
    // },
    // {
    //     title: '币种',
    //     value: formateCurrency(currentRow.value.currencyName) 
    // }
    // {
    //     title: 'Swift号',
    //     value: currentRow.value.swift
    // }
]);
let right_info = computed(() => [ // 描述列表信息右侧部分
    {
        title: 'ID',
        value: currentRow.value.id
    },
    {
        title: '英文名',
        value: currentRow.value.enName
    },
    {
        title: '电话',
        value: currentRow.value.mobile
    },
    {
        title: '直属主管',
        value: formateRelatedDepartments(currentRow.value.directLeaders)
    },
    {
        title: '员工编号',
        value: currentRow.value.employeeNo
    },
    {
        title: '职级',
        value: currentRow.value.jobLevelName
    },
    {
        title: '性别',
        value: formateGender(currentRow.value.gender)
    },
    // 新增字段
    {
        title: '出生日期',
        value: formateData(currentRow.value.userBirthday, 'YYYY-MM-DD').value
    },
   
    {
        title: 'QQ/MSN',
        value: currentRow.value.im
    },
    {
        title: '企业微信',
        value: currentRow.value.weChat
    }
]);
let shortLeft = computed(() => left_info.value.slice(0, 4)); // 关闭状态下的数据
let shortRight = computed(() => right_info.value.slice(0, 4));
const closeFlas = ref(true); // 展开按钮的状态
const activeName = ref('first'); // 当前激活的tab页签

function closeCb() {
    // 关闭策划事件
    // console.log('sdasdasd');
    emits('update:drawerVisible', false);
}

function openMoreInfo() {
   
    // 打开更多信息 修改容器高度
    closeFlas.value = !closeFlas.value;
}

function enditBaseInfo() {
    // 编辑基本信息弹窗
    emits('editBaseInfo');
}
// 全局逻辑
const closeDrawer = () => {
    drawerRef.value.handleClose();
};

// drawer 点击空白处关闭(个别元素忽略, 点击不关闭)
const roleDrawerRef = ref(null);
onClickOutside(
    roleDrawerRef,
    (e) => {
        console.log(e);
        closeDrawer();
    },
    {
        // 忽略外部入口的点击, 忽略 dialog 之类的点击
        ignore: props.triggerElClass.concat([`.${elnamespace}-overlay`, `.${elnamespace}-popper`])
    }
);
function reSendLinkByEmailBatch() {
    // 批量重发链接接口
    const userInfos = [
        {
            mailAddress: currentRow.value.email,
            phone: currentRow.value.mobile,
            userId: currentRow.value.id
        }
    ];
    reSendLinkByEmailBatchApi({
        orgId: store.orgId,
        userInfos
    }).then(res => {
        if (res.code === CODESTATE.SUCCESS) {
            ElMessage.success('链接已发送');
        } else {
            ElMessage.error(res.messageShow)
        }
    });
}
function getCustomPerListFn() {
    // 查询当前角色的规则列表
    getCustomPerList({
        userId: currentRow.value.id,
        orgId: store.orgId
    }).then(res => {
        tableData.value = res.data;
    });
}
watch(currentRow, () => {
    freshFlag.value = Date.now();
    getCustomPerListFn();
}, {deep: true });

onMounted(() => {
    getCustomPerListFn();
});
</script>

<style lang="scss" scoped>
.main_wrap{
    .head_area{
        border-bottom: 1px solid #e4e7ed;
        .nav_info{
            display: flex;
            justify-content: space-between;
            .popel_info{
            display: flex;
            align-items: center;
            max-width: 100%;
                img{
                    margin-right: 12px;
                    border-radius: 25%;
                }
                .use_name{
                    font-size: 18px;
                    line-height: 26px;
                    flex: 1;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
            }
            .oprate_btn{
                .line{
                    color: #dcdee0;
                    margin:  0 20px;
                }
            }
        }
        .craete_info{
            color: #606266;
            font-size: 12px;
            margin: 12px 0;
            line-height:12px;
            span{
                margin-right: 20px;
            }
        }
      
    }
    .base_info{
        padding-top: 12px;
        .base_title{
            font-size: 14px;
            color: #303133;
            line-height: 22px;
            font-weight: 600;
            margin-bottom: 12px;
            .editbaseInfoicon{
                cursor: pointer;
                margin-left: 10px;
                font-size: 16px;
                color: #606266;
            }
        }
        .web_tip{
            margin-bottom: 8px;
            line-height: 18px;
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            .tip_lable{
                color: #606266;
                font-weight: 400;
                font-size: 12px;
            }
            .tip_content{
                font-size: 14px;
                font-weight: 400;
            }
        }
        .open_more{
            color: $textlinkColor;
            font-size: 12px;
            cursor: pointer;
        }
    
    }
}
.memberDetail-tabs {
    :deep(.#{$elnamespace}-tabs__header) {
        margin-bottom: 12px;
    }
}
</style>
<style lang="scss">
.member_detail{
    margin-top: 56px;

    &.#{$elnamespace}-drawer {
        height: calc(100vh - 56px);
    }

    width: 800px !important;
    .xhl-el-drawer__body{
        padding: 10px 24px;
    }
}
</style>