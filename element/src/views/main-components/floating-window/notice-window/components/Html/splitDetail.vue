<template>
    <div v-if="visible"
         class="split-container">
        <!-- 标题 -->
        <div style="margin-bottom: 0;"
             class="floating-window-header">
            <div class="floating-window-header-title notice-window-header">
                <template v-if="type === 'task'">{{ $t('message.taskInfo') }}</template>
                <template v-else-if="type === 'letter'">{{ $t('noticeWindow.msgInfo') }}</template>
            </div>
            <div class="floating-window-fix-icon">
                <Icon custom="custom-modal-close"
                      @click.native="$emit('update:visible', false)"></Icon>
            </div>
        </div>

        <div style="width: 440px;padding: 20px;">
            <TaskDetail v-if="type === 'task'"
                        :task="detailInfo"
                        :principalIds="principalIds"></TaskDetail>
            <LetterDetail v-else-if="type === 'letter'"
                          :letter='detailInfo'></LetterDetail>
        </div>
    </div>
</template>

<script>
    import TaskDetail from '@/views/main-components/floating-window/notice-window/components/Html/taskDetail';
    import LetterDetail from '@/views/main-components/floating-window/notice-window/components/Html/letterDetail';

    export default {
        name: 'splitDetail',
        components: {
            TaskDetail,
            LetterDetail
        },
        props: [
            'visible',
            'type',
            'detailInfo',
            'principalIds'
        ]
    };
</script>

<style scoped>
    .split-container {
        position: fixed;
        right: 379px;
        bottom: 0;
        height: calc(100vh - 60px);
        background-color: white;
        border-right: 1px solid rgba(0, 0, 0, 0.15);

        background-clip: padding-box;
        box-shadow: -1px -1px 3px rgba(0, 0, 0, .15);

        overflow: auto;
    }
</style>
