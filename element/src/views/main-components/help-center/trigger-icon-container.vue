<template>
    <div v-drag="{changeDragStatus}"
         id="triggerIcons"
         :class="{'trigger-icon-container': true, 'trigger-icon-container-hidden': !scriptLoaded}">
        <!-- 企点客服 -->
        <div id="leadscloudAdvisory"
             :class="{'service-trigger-icon': true, 'piwik_service_advisory': true, 'disableClick': dragging}">
            <Tooltip :content="$t('advisory')"
                     :popper-class="disableServiceTip ? 'visibility-hidden' : ''"
                     placement="left">
                <Icon custom="custom-service"
                      size="26"
                      @mouseenter.native="disableServiceTip = false"
                      @mouseleave.native="disableServiceTip = true"
                      class="cursor-pointer"></Icon>
            </Tooltip>
        </div>
        <!-- 分割线 -->
        <div class="trigger-icon-divider"></div>
        <!-- 帮助中心 -->
        <div @click="$emit('clickHelpIcon')"
             :class="{'help-trigger-icon': true, 'disableClick': dragging}">
            <Tooltip :content="$t('menu.helpCenter')"
                     placement="left">
                <Icon custom="custom-help-center"
                      size="26"
                      class="cursor-pointer"></Icon>
            </Tooltip>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'trigger-icon-container',
        data() {
            return {
                // mutation Observer
                observer: null,
                // 鼠标拖拽中
                dragging: false,
                // 是否禁用企点客服按钮 tooltip --- 不知道为啥, tooltip 显示时去别的页面, 再切换回来, 未 hover 也会显示 tooltip
                disableServiceTip: true,
                // script 标签是否加载完成, 加载完成后再显示图标
                scriptLoaded: false
            };
        },
        directives: {
            drag: {
                // 指令的定义
                bind: function(el, binding) {
                    // 阻止事件冒泡
                    // 不仅仅要stopPropagation，还要preventDefault
                    function pauseEvent(e) {
                        if (e.stopPropagation) e.stopPropagation();
                        if (e.preventDefault) e.preventDefault();
                        e.cancelBubble = true;
                        e.returnValue = false;
                        return false;
                    }

                    const oDiv = el; // 获取当前元素
                    oDiv.onmousedown = (e) => {
                        // 在事件中
                        e = e || window.event;
                        pauseEvent(e);

                        // 算出鼠标按下元素时的初始位置
                        let disX = e.clientX;
                        let disY = e.clientY;

                        // 获取元素的 computedStyle
                        const styleObj = window.getComputedStyle(oDiv);

                        // 鼠标移动时设置元素的定位属性
                        document.onmousemove = e => {
                            // 用鼠标移动后的位置减去鼠标的初始位置得到鼠标位移
                            const left = e.clientX - disX;
                            const top = e.clientY - disY;

                            if (left || top) {
                                // 确保移动时不触发点击内部点击事件
                                binding.value.changeDragStatus(true);

                                // 算出鼠标相对元素的位置
                                disX = e.clientX;
                                disY = e.clientY;

                                // 移动当前元素
                                oDiv.style.right = `${Number(styleObj.right.replace('px', '')) - left}px`;
                                oDiv.style.bottom = `${Number(styleObj.bottom.replace('px', '')) - top}px`;
                            }
                        };

                        // 鼠标松开时清除掉鼠标移动监听
                        document.onmouseup = (e) => {
                            document.onmousemove = null;
                            document.onmouseup = null;
                            binding.value.changeDragStatus(false);
                        };
                    };
                }
            }
        },
        methods: {
            // 监听 DOM 变化来处理当前组件层级关系, 使其看上去被遮罩层遮住
            watchVModal() {
                // 获取真正的当前组件 DOM
                const iconDom = document.getElementById('triggerIcons');

                // 定义 MutationObserver 监听
                this.observer = new MutationObserver(function(mutations) {
                    // DOM 变动后, 延时处理组件 DOM 的变动, 避免 DOM 变动未生效导致处理失败
                    setTimeout(() => {
                        // 获取遮罩层 (.v-modal)
                        const VModalDom = document.getElementsByClassName('v-modal');

                        if (VModalDom.length) {
                            // 如果有遮罩层
                            for (let i = 0; i < VModalDom.length; i++) {
                                // clone 真正的当前组件 DOM
                                const cloneIconDom = iconDom.cloneNode(true);
                                // 去掉 cloneDOM 的 id
                                cloneIconDom.removeAttribute('id');

                                // 设置 cloneDOM 的 z-index 使其小于当前 v-modal 的 z-index (如果不设置, cloneDom 可能被其他 DOM 遮挡)
                                const zIndex = VModalDom[i].style.zIndex;
                                if (zIndex) {
                                    cloneIconDom.style.zIndex = zIndex - 1;
                                }

                                // 如果 v-modal 后面没有 cloneDOM , 则插入 cloneDOM 到 v-modal 后面
                                if (!(VModalDom[i].nextElementSibling && VModalDom[i].nextElementSibling.classList.contains('trigger-icon-container'))) {
                                    VModalDom[i].insertAdjacentElement('afterend', cloneIconDom);
                                }
                            }

                            // 隐藏真正的当前组件 DOM
                            iconDom.style.display = 'none';
                        } else {
                            // 如果没有遮罩层
                            // 显示真正的当前组件 DOM
                            iconDom.style.display = 'inline-block';

                            // 去掉可能存在的之前插入的当前组件 cloneDOM
                            const helpIconDom = document.getElementsByClassName('trigger-icon-container');
                            for (let i = 0; i < helpIconDom.length; i++) {
                                if (!helpIconDom[i].id) {
                                    helpIconDom[i].parentNode.removeChild(helpIconDom[i]);
                                }
                            }
                        }
                    }, 100);
                });
                const config = {
                    attributes: true,
                    childList: true
                };

                // 开始监听
                this.observer.observe(document.body, config);
            },

            // 是否有鼠标拖动
            changeDragStatus(val) {
                this.dragging = val;
            },
            // 页面加载完成后插入企点 script
            addQQScript() {
                // 生成 script 标签
                const QQScript = document.createElement('script');
                QQScript.id = 'qd235504272615586555061300a09212d6adec1afab5';
                QQScript.src = 'https://wp.qiye.qq.com/qidian/2355042726/15586555061300a09212d6adec1afab5';

                // 追加 script 标签
                const parentNode = document.getElementById('triggerIcons').parentNode;
                parentNode.append(QQScript);

                // script 标签加载完成后显示组件, 去掉 script 标签
                QQScript.onload = () => {
                    this.scriptLoaded = true;
                    parentNode.removeChild(QQScript);
                };
            }
        },
        mounted() {
            // 监听 DOM 变化来处理当前组件层级关系, 使其看上去被遮罩层遮住
            // this.watchVModal();
            // 插入企点客服代码
            this.addQQScript();
        },
        beforeDestroy() {
            // 停止 DOM 观察
            // if (this.observer) {
            //     this.observer.disconnect();
            //     this.observer = null;
            // }
            // // 去掉可能存在的之前插入的当前组件 cloneDOM
            // const helpIconDom = document.getElementsByClassName('trigger-icon-container');
            // for (let i = 0; i < helpIconDom.length; i++) {
            //     if (!helpIconDom[i].id) {
            //         helpIconDom[i].parentNode.removeChild(helpIconDom[i]);
            //     }
            // }
        }
    };
</script>

<style lang="less" scoped>
    .trigger-icon-container {
        display: inline-block;
        position: fixed;
        right: 0;
        bottom: 25px;
        z-index: 1;
        cursor: pointer;
        text-align: center;
        color: white;

        border-radius: 20px 20px 0 20px;
        background-color: #5994f7;
        background-image: linear-gradient(153.5deg, #5994f7 0%, #5868f5 100%);
    }

    .trigger-icon-container-hidden {
        width: 0;
        height: 0;
    }

    .disableClick {
        pointer-events: none;
    }

    .service-trigger-icon {
        // border-radius: 20px 20px 0 0;
        padding: 9px;
    }

    .trigger-icon-divider {
        background-color: #7398FA;
        width: 26px;
        height: 1px;
        margin: 0 9px;
    }

    .help-trigger-icon {
        // border-radius: 0 0 0 100px / 0 11px 0 100px;
        padding: 9px;
    }
</style>
