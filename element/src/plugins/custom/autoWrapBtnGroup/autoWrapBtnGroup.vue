<!-- 自动折叠按钮组 - 当空间不足时, 折叠按钮显示到"更多"下拉按钮中 -->
<!--
实现方案:
1. 默认 slot 传入全部按钮, 外部显示/"更多"下拉框/隐藏不可见的 shadow DOM, 三处各放一份, 以 slot 内以 dataKey 标识按钮, 以嵌套 class 控制内外显隐按钮
2. shadow 元素盛放所有按钮并且设置为 fixed 元素放到视图外, 以 jQuery 的 resize 插件监听 shadow 元素宽度变化(还有整个外部容器的宽度变化), 调整按钮显示
-->
<template>
    <div ref="awbg"
         class="awbg">
        <!-- 外层按钮 -->
        <div class="awbg-show">
            <slot v-bind:showBtnArr="showBtnArr"></slot>
        </div>

        <!-- 内层更多 -->
        <div v-show="showBtnArr.length !== btnArr.length"
             ref="moreBtn"
             class="awbg-more">
            <!-- 更多操作 -->
            <Poptip trigger="click"
                    placement="bottom-start"
                    :popper-class="morePopperClass">
                <!-- 触发器 - 更多按钮 -->
                <span slot="reference">
                    <slot name="moreBtn">
                        <!-- 后备内容 -->
                        <Button
                            type="text"
                            icon="custom custom-more"></Button>
                    </slot>
                </span>

                <!-- 容器 -->
                <div>
                    <!-- 下拉按钮 -->
                    <slot v-bind:showBtnArr="showBtnArr"></slot>
                </div>
            </Poptip>
        </div>

        <!-- shadow 占位 -->
        <div ref="shadowDom"
             class="awbg-shadow">
            <slot v-bind:showBtnArr="showBtnArr"></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'autoWrapBtnGroup',
        props: {
            // 所有按钮 key 数组
            btnArr: {
                type: Array,
                default() {
                    return [];
                }
            },
            // "更多按钮"下拉框 class
            popperClass: {
                type: [Array, String]
            }
        },
        data() {
            return {
                // 可显示在外部的按钮 key 数组
                showBtnArr: []
            };
        },
        computed: {
            // "更多按钮"下拉框 class
            morePopperClass() {
                // 默认 class
                let result = ['awbg-more-operate-popper'];

                // 拼接传入 class
                if (this.popperClass) {
                    result = result.concat(this.popperClass);
                }

                // 返回结果
                return result;
            }
        },
        methods: {
            // div 尺寸调整监听方法
            handleShadowDomResize() {
                // 暂存整体容器宽度
                const width_containerDom = $(this.$refs.awbg).innerWidth();
                // 暂存以隐藏的所有按钮不换行 DOM 的宽度
                const width_shadowDom = $(this.$refs.shadowDom).innerWidth();

                if (width_shadowDom > width_containerDom) {
                    // 如果按钮整体宽度大于外部容器宽度

                    // 暂存 shadow 占位 DOM 中所有按钮
                    const _shadowBtnList = $(this.$refs.shadowDom).children();
                    // 暂存"更多"按钮的占位宽度
                    const width_moreBtn = $(this.$refs.moreBtn).outerWidth(true);
                    // 以"按钮为空时也显示'更多'按钮"为基础, 逐个累加计算按钮宽度 + "更多按钮"宽度是否超过容器宽度
                    let tmpLength = width_moreBtn;
                    // 暂存要显示的按钮 key 数组
                    const showBtnArr = [];
                    // // 待确定是否要显示的按钮 key 数组
                    // // 如果已显示的按钮 + "更多"按钮长度 > 容器长度, 但去掉"更多"按钮时又小于容器长度, 则进入"比较后续按钮总长度和'更多'按钮长度"路基
                    // let pendingBtnArr = [];

                    _shadowBtnList.each((i, _btn) => {
                        // 累加本次遍历的按钮宽度
                        tmpLength += $(_btn).outerWidth(true);

                        // 当前按钮的 key
                        const btnKey = $(_btn).data('awbg-key'); // 之后也可以做"没有 key 的都隐藏"
                        if (!btnKey) {
                            // continue
                            return true;
                        }

                        // (已累加按钮宽度 + "更多按钮"宽度)超过容器宽度
                        if (tmpLength > width_containerDom) {
                            // break 终止循环
                            return false;

                            // 下面的代码是校验"是否因为显示了'更多'按钮导致本来能全部显示的按钮组也显示了'更多'"逻辑, 但发现最外层的按钮总长度判断应该就够了, 于是注释掉
                            // if (tmpLength - width_moreBtn < width_containerDom) {
                            //     // 如果只算按钮宽度, 比容器宽度要小
                            //
                            //     // 将当前按钮 key 加入到待定数组中
                            //     pendingBtnArr.push(btnKey);
                            // } else {
                            //     // 只算按钮宽度还是比容器宽度大
                            //
                            //     // 说明最终还是无法把所有按钮显示出来, 于是把之前的待定按钮数组清除掉
                            //     pendingBtnArr = [];
                            //
                            //     // break 终止循环
                            //     return false;
                            // }
                        } else {
                            // 累加后小于容器宽度

                            // 当前按钮 key 追加到显示数组中
                            showBtnArr.push(btnKey);
                        }
                    });

                    // 更新数据
                    this.showBtnArr = showBtnArr;

                    // 最终结果为"确定显示"的按钮 + "待定"的按钮(如果有的话)
                    // this.showBtnArr = showBtnArr.concat(pendingBtnArr);
                } else {
                    // 按钮整体宽度小于外部容器宽度

                    // 按钮无需隐藏到"更多"
                    this.showBtnArr = this.btnArr.slice();
                }
            }
        },
        mounted() {
            // 初始化触发一次 resize
            this.handleShadowDomResize();

            // 给容器和 shadow 占位元素加上 resize 监听
            const _$Dom = $(this.$refs.awbg);
            _$Dom.push(this.$refs.shadowDom);
            _$Dom.resize(() => this.handleShadowDomResize());
        },
        watch: {
            // slot 内容变化时视图没有响应式更新, 于是通过监听按钮数组变化, 更新视图
            btnArr: {
                handler() {
                    this.$forceUpdate();
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .awbg {
        white-space: nowrap;
        overflow: hidden;
        text-align: right;

        &-show {
            display: inline-block;

            .awbg-btn-show {
                display: inline;
            }
            .awbg-btn-inner {
                display: none;
            }
        }

        &-more {
            display: inline-block;
            margin-left: 10px;
        }

        &-shadow {
            position: fixed;
            right: -50px;
            bottom: -50px;
        }
    }
</style>

<style lang="less">
    .awbg-more-operate-popper {
        padding: 10px 0 !important;

        .awbg-btn-show {
            display: none;
        }

        .awbg-btn-inner {
            display: list-item;
            width: 100%;
            color: rgba(0, 0, 0, .6);
            min-height: 30px;
            line-height: 30px;
            font-weight: normal;
            margin: 0 !important;
            padding: 0 16px;
            border: none;
            cursor: pointer;

            &:hover {
                background-color: #F5F7FA;
                color: rgba(0, 0, 0, .6);
            }
        }
    }
</style>
