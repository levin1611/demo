<template>
    <div :style="styleObj"
         class="commonTag">
        <slot>{{ content }}</slot>
    </div>
</template>

<script>
    export default {
        name: 'commonTag',
        props: {
            content: {
                type: String
            },
            color: {
                type: String
            }
        },
        computed: {
            styleObj() {
                return {
                    color: this.color,
                    border: `1px solid ${this.hexToRgba(this.color, 0.5)}`
                };
            }
        },
        methods: {
            // hex 格式的颜色转为 rgba 格式
            hexToRgba(hex, alpha) {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
        }
    };
</script>

<style lang="less" scoped>
    .commonTag {
        display: inline-block;
        border-radius: 6px;
        background: #FFF;
        padding: 1px 8px;

        text-align: center;
        font-size: 12px;
        line-height: 18px;
    }
</style>
