<!-- 带可操作按钮的遮罩组件 -->
<template>
    <div
        ref="operateMaskRef"
        :class="{'operateMask-showMask': alwaysShow, 'operateMask-disabled': disabled}"
        class="operateMask">
        <!-- 包裹内容 -->
        <slot></slot>

        <!-- 遮罩层 -->
        <div
            v-if="!disabled"
            :class="maskClass"
            class="operateMask-mask"
        ></div>

        <!-- 遮罩层中内容 -->
        <div
            v-if="!disabled"
            :class="contentClass"
            class="operateMask-content"
        >
            <!-- 默认显示 -->
            <slot name="content">
                <!-- 左上角标题 -->
                <!-- UI 设计此元素显示在遮罩层上面, 导致跨层级时它会被覆盖, 因此改用 poppover 实现 -->
                <!-- <el-button
                    type="info"
                    size="small"
                    class="operateMask-title"
                >{{ title }}</el-button> -->

                <!-- "设置"按钮 -->
                <el-button
                    type="info"
                    size="small"
                    @click="emits('set')"
                    class="operateMask-setBtn"
                >{{ $t('settings') }}</el-button>
            </slot>
        </div>

        <!-- 左上角标题, position 定位版, 调用时需要外部配合调整样式以避免被遮挡 -->
        <div
            v-if="(showTitleType !== 'popper') && !disabled"
            :class="{'operateMask-positionTitle-show': alwaysShow}"
            class="operateMask-positionTitle"
        >
            <el-button
                type="info"
                size="small"
                class="operateMask-title"
            >{{ title }}</el-button>
        </div>

        <!-- 左上角标题, popover 版, 无被遮挡问题, 但连页面顶部 header 都遮不住它(改 header z-index 能遮住, 但怕影响其他地方) -->
        <el-popover
            v-if="(showTitleType === 'popper') && !disabled"
            virtual-triggering
            :virtual-ref="operateMaskRef"
            :visible="alwaysShow ? true : undefined"
            placement="top-start"
            :offset="0"
            :hide-after="0"
            :show-arrow="false"
            transition="none"
            popper-style="background: transparent;border: none;box-shadow: none;padding: 0;"
        >
            <el-button
                type="info"
                size="small"
                class="operateMask-title"
            >{{ title }}</el-button>
        </el-popover>
    </div>
</template>

<script setup>
import { ref } from 'vue';

// props
const props = defineProps({
    // 始终显示遮罩层
    alwaysShow: {
        type: Boolean,
        default: false
    },
    // 遮罩样式
    maskClass: {
        type: String
    },
    // 遮罩内容样式
    contentClass: {
        type: String
    },
    // 标题
    title: {
        type: String
    },
    // 显示标题方式, 'popper' 表示使用 popper 实现, 否则使用 position 定位实现
    showTitleType: {
        type: Boolean
    },
    disabled: {
        type: Boolean,
        default: false
    }
});
// emits
const emits = defineEmits([
    'set'
]);

const operateMaskRef = ref(null);
</script>

<style lang="scss" scoped>
.operateMask {
    position: relative;
    box-sizing: border-box;
    border: 1px solid #FFF;

    &-mask, &-content {
        display: none;
    }

    &-mask {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: rgba($secondaryColor, 0.1);
        z-index: 99999;
    }

    &:not(&-disabled) {
        &:hover, .operateMask-showMask {
            border: 1px dashed $secondaryColor;
            .operateMask-mask, .operateMask-content {
                display: block;
            }
        }

        &:hover {
            .operateMask-positionTitle {
                display: block;
            }
        }
    }

    // &-title {
    //     position: absolute;
    //     top: -24px;
    //     left: -1px;
    //     pointer-events: none;
    // }
    &-title {
        position: absolute;
        left: -1px;
        bottom: -1px;
        pointer-events: none;
    }

    &-setBtn {
        position: absolute;
        top: -1px;
        right: -1px;
    }

    &-positionTitle {
        display: none;
        position: absolute;
        top: -1px;
        left: 0;
    }

    &-positionTitle-show {
        display: block;
    }
}
</style>