<template>
    <!-- UI 认为自定义颜色为背景色 + 文字统一白色观感差, 于是做了这个文字颜色为自定义颜色 + 背景色为自定义颜色 0.12 透明度 -->
    <Tag v-bind="$attrs"
         :hit="hit"
         :color="color | toRGBA(alpha)"
         :style="`color: ${color};border-color: ${ hit ? color : 'transparent'};`">
        <slot></slot>
    </Tag>
</template>

<script>
    export default {
        name: 'softTag',
        props: {
            color: {
                type: String,
                default: '#4285F4'
            },
            alpha: {
                type: Number,
                default: 0.12
            },
            hit: {
                type: Boolean,
                default: false
            }
        },
        filters: {
            toRGBA(hex, alpha) {
                const rgb = [];
                if (hex.includes('#')) {
                    hex = hex.substr(1);// 去除前缀 # 号
                    if (hex.length === 3) { // 处理 "#abc" 成 "#aabbcc"
                        hex = hex.replace(/(.)/g, '$1$1');
                    }
                    hex.replace(/../g, function(color) {
                        rgb.push(parseInt(color, 0x10));// 按16进制将字符串转换为数字
                    });
                    return `rgb(${rgb.join(',')},${alpha})`;
                } else {
                    return hex;
                }
            }
        }
    };
</script>
