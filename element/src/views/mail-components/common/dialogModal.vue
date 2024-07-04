<template>
    <Modal  :visible="visible"
            v-if="visible"
            :close-on-click-modal="closeOnClickModal"
            :close-on-press-escape="closeOnPressEscape"
            :modal-append-to-body="false"
            :append-to-body="appendToBody"
            :lock-scroll="lockScroll"
            :width="modalWidth"
            ref="dialogModal"
            :custom-class="customClass"
            :show-close="showClose"
            @open="open"
            @close="close">
        <!-- 标题 -->
        <div slot="title">
            <span style="margin-right: 5px;max-width: calc(100% - 80px);overflow: hidden;text-overflow: ellipsis; white-space: nowrap; display: inline-block;">{{title}}</span>
        </div>

        <!-- 提示文案 -->
        <div>
            <p>{{content}}</p>
        </div>

        <!-- 操作按钮 -->
        <div slot="footer">
            <Button class="" :type="cancelButtonType" @click.stop="close">{{cancelButtonText || $t('mailMarketing.cancel')}}</Button>
            <Button class="" :type="otherButtonType" @click.stop="other" v-if="otherButton">{{otherButtonText || $t('mailMarketing.cancel')}}</Button>
            <Button class="" :type="confirmButtonType" @click.stop="confirm" :disabled="disabled">{{confirmButtonText || $t('mailMarketing.confirm')}}</Button>
        </div>
    </Modal>
</template>
<script>
    export default {
        name: 'dialogModal',
        // 父组件传过来的参数
        props: {
            // 弹窗的状态
            visible: {
                type: Boolean,
            },
            // 弹窗的标题
            title: {
                type: String
            },
            // 提示内容文案
            content: {
                type: String
            },
            // 确认按钮的禁用状态
            disabled: {
                type: Boolean,
                default: false
            },
            cancelButtonText: {
                type: String,
            },
            cancelButtonType: {
                type: String,
                default: 'default'
            },
            // 是否显示其他按钮
            otherButton: {
                type: Boolean,
                default: false
            },
            // 其他按钮的文案
            otherButtonText: {
                type: String,
            },
            // 其他按钮的类型（样式效果）
            otherButtonType: {
                type: String,
                default: 'default'
            },
            // 确认按钮的文案
            confirmButtonText: {
                type: String,
            },
            // 确认按钮的类型（样式效果）
            confirmButtonType: {
                type: String,
                default: 'primary'
            },
            // 弹窗的宽度
            modalWidth: {
                type: String,
                default: '360px'
            },
            // 弹窗的自定义 类名
            customClass: {
                type: String,
            },
            // 是否在dialog出现的时将body滚动锁定，默认false
            lockScroll: {
                type: Boolean,
                default: false
            },
            // 是否将dialog插入到body之上，层级最高，嵌套dialog设置为true
            appendToBody: {
                type: Boolean,
                default: false
            },
            // 是否可以通过按下ESC关闭弹窗
            closeOnPressEscape: {
                type: Boolean,
                default: false
            },
            // 是否可以通过点击modal关闭弹窗
            closeOnClickModal: {
                type: Boolean,
                default: false
            },
            // 是否显示关闭按钮 ×
            showClose: {
                type: Boolean,
                default: true
            }
        },
        // 定义子组件
        components: {},
        // 状态、数据
        data () {
            return {}
        },
        // 实例创建完成之后调用，数据、方法初始化完成、挂载还没开始
        created () {},
        // 挂载实例之后调用一次
        mounted () {},
        // 定义方法
        methods: {
            // 打开弹窗的回调
            open () {
                this.$emit('open');
            },
            // 关闭弹窗的回调，抛出方法
            close () {
                this.$emit('update:visible', false);
            },
            // 点击确认按钮的回调，抛出方法,  otherButton 为 true 才生效
            confirm () {
                this.$emit('confirm');
            },
            // 点击other按钮的回调，抛出方法
            other () {
                this.$emit('other');
            }
        },
    }
</script>
<style lang="less" scoped>

</style>