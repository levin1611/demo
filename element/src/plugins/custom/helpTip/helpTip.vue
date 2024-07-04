<template>
    <Tooltip
        placement="bottom-start"
        :visible-arrow="false">
        <div class="help-tip-content" slot="content">{{title}}</div>
        <template>
             <!-- 图标 -->
            <Icon :type="iconType"
                :size="iconSize"
                :color="iconColor"
                :custom="iconCustom"
                :class="iconClass"
                :style="iconStyle"></Icon>
            <!-- 自定义内容 -->
            <slot></slot>
        </template>

    </Tooltip>
    <!-- <a :href="href"
       :title="title"
       class="help-tip-container">
    </a> -->
</template>

<script>
    import Icon from '../icon';

    export default {
        name: 'HelpTip',
        components: {
            Icon
        },
        props: {
            href: {
                type: String,
                default: 'javascript:void(0);'
            },
            title: {
                type: String,
                default: '',
                required: true
            },
            iconType: {
                type: String,
                default: ''
            },
            iconSize: [Number, String],
            iconColor: String,
            iconCustom: {
                type: String,
                default: 'custom custom-tip'
            },
            iconClass: {
                type: String,
                default: ''
            },
            iconStyle: {
                type: String,
                default: ''
            }
        }
    };
</script>

<style lang="less">
    .help-tip-content {
        white-space: pre-line;
    }
</style>
