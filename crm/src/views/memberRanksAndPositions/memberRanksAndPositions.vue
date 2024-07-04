<template>
    <div class="member-rank-positions">
        <div class="member-title">{{ $t('rankPosition.memberRanksAndPositions') }}</div>
        <elTabs
            v-model="activeName"
            class="memberRankPositions-tabs"
        >
            <elTabPane
                v-for="item in tabList"
                :key="item.name"
                :label="item.label"
                :name="item.name"
            >
                <KeepAlive>
                    <component
                        :is="item.component"
                        v-model:dialogVisible="dialogVisible"
                        v-model:userAttrInfo="userAttrInfo"
                        v-model:deleteDialogVisible="deleteDialogVisible"
                        v-model:deleteUserAttrThreshold="deleteUserAttrThreshold"
                    />
                </KeepAlive>
            </elTabPane>
        </elTabs>

        <!-- 删除提示 -->
        <elDialog
            v-model="dialogVisible"
            title="Tips"
            width="500px"
            modal-class="dialog-modal"
        >
            <template #header>
                <div class="dialog-header">{{ $t('rankPosition.deleteTips') }}</div>
            </template>
            <span class="dialog-body">{{ $t('rankPosition.membersIncluded') }}{{ userAttrInfo }} {{ $t('rankPosition.cannotBeDeleted') }}</span>
            <template #footer>
                <span class="dialog-footer">
                    <elButton class="useBrandColor" @click="dialogVisible = false">{{ $t('close') }}</elButton>
                </span>
            </template>
        </elDialog>

        <!-- 删除确认 modal -->
        <elDialog
            v-model="deleteDialogVisible"
            title="Tips"
            width="500px"
            modal-class="dialog-modal"
        >
            <template #header>
                <div class="dialog-header">{{ $t('deleteConfirmation') }}</div>
            </template>
            <span class="dialog-body">{{ activeName === 'memberRank' ? $t('rankPosition.rank') : $t('rankPosition.position') }}{{ $t('rankPosition.doYouConfirmTheDeletion') }}</span>
            <template #footer>
                <span class="dialog-footer">
                    <elButton class="useBrandColor" style="height: 36px;" @click="deleteDialogVisible = false">{{ $t('cancel') }}</elButton>
                    <elButton type="primary" style="height: 36px;" @click="deleteUserAttrThreshold = true">{{ $t('confirm') }}</elButton>
                </span>
            </template>
        </elDialog>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import memberRank from './memberRank.vue';
import memberPositions from './memberPositions.vue';
import { useI18n } from 'vue-i18n';

// 多语言
const { t } = useI18n();

// dialog
const dialogVisible = ref(false);

// 删除确认 modal
const deleteDialogVisible = ref(false);
// 确认删除阈值
const deleteUserAttrThreshold = ref(false);

// 根据属性id查询到的用户列表
const userAttrInfo = ref([]);

const activeName = ref('memberRank');
const tabList = [
    {
        label: t('rankPosition.rank'),
        name: 'memberRank',
        component: memberRank
    },
    {
        label: t('rankPosition.position'),
        name: 'memberPositions',
        component: memberPositions
    }
];

</script>
<style lang="scss" scoped>
    .dialog-modal {
        .dialog-header {
            color: #303033;
            font-size: 16px;
            font-weight: 500;
            line-height: 24px;
        }
        .dialog-body {
            color: #303133;
            font-size: 14px;
            line-height: 22px;
        }
    }

    .member-rank-positions {
        padding: 20px 0 20px 24px;
        background-color: #FFFFFF;
        .member-title {
            color: #303133;
            font-size: 16px;
            font-weight: 500;
            line-height: 24px;
        }
    }

    .memberRankPositions-tabs {
        :deep(.#{$elnamespace}-tabs__header) {
            margin-bottom: 12px;
        }
    }
</style>
