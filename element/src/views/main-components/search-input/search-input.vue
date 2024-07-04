<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-07-19 17:13:36
 * @LastEditTime: 2019-08-23 10:52:58
 * @LastEditors: Please set LastEditors
 -->
<template>
    <!-- 全局搜索输入框  -->
    <div @mouseenter="handleMouseenter"
         @mouseleave="handleMouseleave"
         :style="styleObj">
        <Input
                v-model="keyword"
                class="rounded-input"
                ref="input"
                @blur="isExpand(false)"
                @focus="isExpand(true)"
                @keyup.enter.native="editCompleted"
                clearable
                :maxlength="maxlength"
                :placeholder="holderText"
                :class="{ 'keyword-search-input': mini, 'nonEmpty-keyword': mini && keyword }">
            <Icon slot="suffix"
                  custom="custom custom-journey-search"
                  color="#7B98B6"
                  size="14"
                  @click.native="editCompleted"
                  class="global-search-btn-icon"
                  :class="btnClass"></Icon>
        </Input>
        <span v-show="type && type==='timeline' && !hovering && !active && !keyword" style="font-size: 14px; color: #333">{{ showText }}</span>
        <!-- 全局搜索此次未实现快速搜索下拉列表，因此全局搜索时下拉隐藏 -->
        <div v-show="!type && showDropdown && btnClass !== 'global-search'" class="select-dropdown">
            <slot name="searchDropdown"></slot>
            <!-- 举个栗子 -->
            <!-- <ul class="ivu-select-dropdown-list">
              <li class="ivu-select-item">哈哈哈</li>
            </ul> -->
        </div>
    </div>
</template>

<script>
    // import spin from '../spin/spin.vue';
    export default {
        components: [
            // spin
        ],
        props: {
            type: {
                type: String
            },
            showText: {
                type: String
            },
            // 输入框宽度
            width: {
                type: Number,
                default: 300
            },
            // placeholder文字
            holderText: {
                type: String
            },
            // 父组件接收到的搜索框的值
            parentValue: {
                type: String
            },
            // 防抖延迟时间
            delayTime: {
                type: Number,
                default: 1000
            },
            btnClass: {
                type: String,
                default: ''
            },
            maxlength: {
                type: Number,
                default: 50
            },
            mini: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            styleObj() {
                if (this.mini) {
                    return (this.keyword || this.hovering || this.active) ? {
                        width: `${this.width}px`
                    } : {};
                }
                return {
                    width: `${this.width}px`
                };
            }
        },
        watch: {
            parentValue(newV, oldV) {
                this.keyword = newV;
                if (!oldV && newV) {
                    this.showDropdown = true;
                } else if (!newV) {
                    this.showDropdown = false;
                }
            }
        },
        data() {
            return {
                keyword: this.parentValue,
                showDropdown: false,
                // 组件是否处于 hover 状态
                hovering: false,
                // input 是否 active
                active: false
            };
        },
        mounted() {
            // this.$refs.input.$refs.input.oninput = this.debounce(this.changeKeyword,1000,false)
            this.$refs.input.$on('input', this.debounce(this.changeKeyword, this.delayTime, false));
        },
        beforeDestroy() {
            // 解绑事件
            this.$refs.input.$off('input');
        },
        methods: {
            changeKeyword() {
                this.$emit('change-keyword', this.keyword);
            },
            isExpand(type) {
                this.active = type;
                this.$nextTick(() => {
                    if (!type) {
                        this.showDropdown = type;
                    } else if (this.parentValue) {
                        this.showDropdown = type;
                    }
                });
            },
            editCompleted() {
                this.$refs.input.blur();
                this.$emit('change-keyword', this.keyword);
                this.$emit('press-enter');
                this.isExpand(false);
            },
            /**
             * 防抖函数
             * @param {function} func 需要防抖的函数
             * @param {number} wait 等待时间
             * @return {function}   返回客户调用函数
             */
            debounce(func, wait, immediate) {
                let timeout;
                return function() {
                    const context = this;
                    const args = arguments;

                    if (timeout) clearTimeout(timeout);
                    if (immediate) {
                        const callNow = !timeout;
                        timeout = setTimeout(function() {
                            timeout = null;
                        }, wait);
                        if (callNow) func.apply(context, args);
                    } else {
                        timeout = setTimeout(function() {
                            func.apply(context, args);
                        }, wait);
                    }
                };
            },
            handleMouseenter() {
                this.hovering = true;
            },
            handleMouseleave() {
                this.hovering = false;
            }
        }
    };
</script>

<style lang="less" scoped>
    .rounded-input {
        font-size: 12px;
    }

    .select-dropdown {
        width: inherit;
        max-height: 200px;
        overflow: auto;
        margin: 5px 0;
        padding: 5px 0;
        background-color: #fff;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        border-radius: 4px;
        -webkit-box-shadow: 0 1px 6px rgba(0,0,0,.2);
        box-shadow: 0 1px 6px rgba(0,0,0,.2);
        position: absolute;
        z-index: 900;
        text-align: left;

        .ivu-select-dropdown-list {
            .ivu-select-item {
                font-size: 12px !important;
            }
        }
    }

    .global-search-btn-icon {
        display: inline-block;
        width: 25px;
        height: 100%;
        line-height: 32px;
        cursor: pointer;
        float: right;

        &::after {
            clear: both;
        }
    }
</style>

<style lang="less">
    .keyword-search-input {
        .el-input__inner {
            width: 5px;
            outline: none !important;
            border-radius: 16px;
            border: none;
            padding: 0 28px 0 8px;
            transition: width .4s linear;
            box-shadow: none !important;
            border-color: #dcdfe6 !important;
            background-color: #fff;

            &::-webkit-input-placeholder {
                color: #dcdfe6;
            }

            &::-moz-placeholder { /* Mozilla Firefox 4+ */
                color: #dcdfe6;
            }

            &:-ms-input-placeholder { /* Internet Explorer 10-11 */
                color: #dcdfe6;
            }
            &:focus {
                padding: 0 53px 0 8px;
            }
        }

        // .el-input__suffix-inner {
        //     display: flex;
        //     align-items: center;
        // }

        &:hover .el-input__inner, .el-input__inner:focus {
            width: 100% !important;
            border: 1px solid #dcdfe6;
            transition: width .4s linear;
        }
    }

    .nonEmpty-keyword {
        .el-input__inner {
            width: 100% !important;
            border: 1px solid #dcdfe6;
        }
    }
</style>
