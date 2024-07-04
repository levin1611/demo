<template>
    <Tooltip :effect="effect"
             :placement="placement"
             :value="value"
             :disabled="!showTooltip"
             :offset="offset"
             :transition="transition"
             :visible-arrow="visibleArrow"
             :popper-options="popperOptions"
             :open-delay="openDelay"
             :manual="manual"
             :popper-class="popperClass"
             :enterable="enterable"
             :hide-after="hideAfter"
             :tabindex="tabindex"
             @mouseIn="handleMouseInTooltip"
             ref="tooltip">
        <span style="display: block;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
            <slot>{{ content }}</slot>
        </span>
        <div slot="content">
            <slot name="content">{{ content }}</slot>
        </div>
    </Tooltip>
</template>

<script>
    import { getStyle } from 'element-ui/src/utils/dom';

    export default {
        name: 'tooltipAuto',
        props: {
            openDelay: {
                type: Number,
                default: 500
            },
            disabled: Boolean,
            manual: Boolean,
            effect: {
                type: String,
                default: 'dark'
            },
            offset: {
                default: 0
            },
            popperClass: String,
            content: String,
            visibleArrow: {
                default: true
            },
            transition: {
                type: String,
                default: 'el-fade-in-linear'
            },
            popperOptions: {
                default() {
                    return {
                        boundariesPadding: 10,
                        gpuAcceleration: false
                    };
                }
            },
            enterable: {
                type: Boolean,
                default: true
            },
            hideAfter: {
                type: Number,
                default: 0
            },
            tabindex: {
                type: Number,
                default: 0
            },
            placement: {
                type: String,
                default: 'bottom'
            },
            value: Boolean
        },
        data() {
            return {
                showTooltip: false // 鼠标滑过overflow文本时，再检查是否需要显示
            };
        },
        methods: {
            handleTooltipIn() {
                // 参考 'element-ui/packages/table/src/table-body.js' 中的 handleCellMouseEnter 方法
                const cellChild = this.$refs.tooltip.$el;
                const range = document.createRange();
                range.setStart(cellChild, 0);
                range.setEnd(cellChild, cellChild.childNodes.length);
                const rangeWidth = range.getBoundingClientRect().width;
                const padding = (parseInt(getStyle(cellChild, 'paddingLeft'), 10) || 0) + (parseInt(getStyle(cellChild, 'paddingRight'), 10) || 0);
                if ((rangeWidth + padding > cellChild.offsetWidth + 1 || cellChild.scrollWidth > cellChild.offsetWidth + 1)) {
                    this.showTooltip = true;
                }
            },
            handleTooltipOut() {
                this.showTooltip = false;
            },
            handleMouseInTooltip(boo) {
                if (boo) {
                    this.handleTooltipIn();
                } else {
                    this.handleTooltipOut();
                }
            }
        }
    };
</script>
