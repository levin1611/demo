/**
 * @Description: 邮件内容渲染 iframe 相关, 包括
 * 1. 渲染邮件内容
 *      1. 处理邮件内容为 HTML 文档
 *      2. 渲染 HTML 文档到邮件内容 iframe
 *      3. 打印邮件内容区域(外部传入 element , 内部包括邮件内容 iframe 和其他信息)
 * 2. 模拟邮件内容水平滚动条
 *      1. 在 iframe 底部增加指定模拟滚动条 div , 参见 /src/views/mail/mail-home/components/MailDetail.vue
 *      2. 模拟滚动条 inner 增加水平滚动监听
 *      3. 为模拟滚动条的滚动父级增加垂直滚动监听, 判断 iframe 底部进入视口, 则滚动条正常显示, iframe 底部在视口下方, 则固定 iframe 显示在视口底部
 *      4. 模拟滚动条需要有一个底部显示在视口内 offsetParent , 模拟滚动条据此实现 position: absolute 固定在视口底部功能
 * @author 汤一飞
 * @date 2021/5/28
*/

import { HTML_HIGHLIGHT } from '@/api/mail.js';

export default {
    data() {
        return {
            // 邮件自定义水平滚动条样式 -- 外部与 iframe 等宽 div 的样式
            mailScrollContainerStyleObj: {
                // 固定属性
                // 允许出现水平滚动条, 此水平滚动条即为最终显示的水平滚动条
                'overflow-x': 'auto',
                // 尽量减少滚动条占位高度
                'line-height': '0',
                // 背景透明
                'background-color': 'transparent',

                // 变动属性
                // 控制鼠标穿透, 确保滚动条不显示时鼠标不会误触滚动条
                'pointer-events': 'none',
                // 滚动条外部宽度, 因为显示区域和 offsetParent 不一定等宽, 这个也是要调整的, 避免滚动条从固定变为正常时宽度发生变化
                width: '100%',
                // 固定显示时 absolute, 正常显示时 relative
                position: 'relative',
                bottom: '0'
            },
            // 邮件自定义水平滚动条样式 -- 内部与 iframe documentElement 等宽 div 的样式
            mailScrollInnerStyleObj: {
                // 固定属性
                // 高度尽可能小
                height: '1px',
                // 背景透明
                'background-color': 'transparent',

                // 变动属性
                // 模拟 iframe 内部文档宽度, 保证外部 div 滚动条显示逻辑和 iframe 系统水平滚动条逻辑一致
                width: '0'
            },
            // 监听: iframe 所在 overflow div 发生垂直滚动
            handleMailVerticalScroll: this.$debounce(() => {
                // 暂存 iframe 元素
                const ifrEle = document.querySelector(`iframe[name="${this.mailFrameName}"]`);
                if (ifrEle) {
                    // 获取 iframe rect.bottom 和其 offsetParent rect.bottom , 以判断 iframe 底部是否在其 offsetParent 下方(还要算上指定 bottom , 避免 offsetParent 和滚动容器位置不一致)
                    const ifrRec = ifrEle.getBoundingClientRect();
                    const scrollRec = ifrEle.offsetParent.getBoundingClientRect();
                    if (ifrRec.bottom > scrollRec.bottom + this.scrollBarBottom) {
                        // iframe 底部在其 offsetParent 下方

                        // 固定显示水平滚动条在 offsetParent 底部
                        this.mailScrollContainerStyleObj.position = 'fixed';
                        this.mailScrollContainerStyleObj.bottom = `${this.scrollBarBottom}px`;
                    } else {
                        // iframe 底部不在其 offsetParent 下方

                        // 水平滚动条正常显示在原位置(iframe 之下)
                        this.mailScrollContainerStyleObj.position = 'relative';
                        this.mailScrollContainerStyleObj.bottom = '0';
                    }
                }
            }, 10),
            // 监听: iframe 下方模拟水平滚动条 发生水平滚动
            handleMailHorizontalScroll: this.$debounce((e) => {
                // 暂存 iframe window
                const ifr = window.frames[this.mailFrameName];

                // 控制 iframe documentElement 左偏移量
                if (ifr && ifr.document && ifr.document.documentElement) {
                    ifr.document.documentElement.scrollLeft = e.target.scrollLeft;
                }
            }, 10)
        };
    },
    methods: {
        // 处理邮件内容, 返回 html 字符串
        handleMailHTML(mailContent, keyword) {
            // 解析邮件内容为 Document 对象
            const parser = new DOMParser();
            const doc = parser.parseFromString(mailContent, 'text/html');
            // 邮件内容中的 base 标签会导致页面跳转时，指向 base 标签指定的地址，而非询盘云页面，因此去除全部的 base 标签
            Array.from(doc.querySelectorAll('base')).forEach(node => {
                node.remove();
            });
            // 邮件详情页的正文中超链接更改为新标签窗口打开
            Array.from(doc.querySelectorAll('a')).forEach(node => {
                node.target = '_blank';
            });
            // 邮件内容中的 script 全部去掉
            Array.from(doc.querySelectorAll('script')).forEach(node => {
                node.remove();
            });
            // 插入特定样式
            const styleNode = doc.createElement('style');
            styleNode.type = 'text/css';
            // 样式: 滚动条, 高亮
            const styleTextNode = doc.createTextNode(`
            ::-webkit-scrollbar {
                height: 8px !important;
                width: 8px !important;
                background: transparent !important;
            }

            ::-webkit-scrollbar-track {
                -webkit-box-shadow: none !important;
                background: transparent !important;
            }

            ::-webkit-scrollbar-thumb {
                height: 8px !important;
                width: 8px !important;
                border-radius: 8px !important;
                -webkit-box-shadow: none !important;
                box-shadow: none !important;
                background-color: #CBD6E2 !important;
            }

            ::-webkit-scrollbar-thumb:hover {
                background-color: #A9B9C9 !important;
            }
                        
            .XHL-highlight-keyword {
                color: #3B78DE;
            }`);
            styleNode.appendChild(styleTextNode);
            doc.head.appendChild(styleNode);

            // 如果传入关键词, 要将邮件内容中的关键词高亮显示
            if (keyword) {
                // 递归查找文本结点, 高亮关键词
                HTML_HIGHLIGHT(doc.body, keyword, 'XHL-highlight-keyword');
            }

            // 设置 body margin 默认为 0 , 避免浏览器默认样式给 body 加上 margin
            doc.body.style.margin = '0';
            // 设置 body overflow-x hidden , 不允许出现横向滚动条 --- 外部模拟水平滚动条
            doc.body.style['overflow-x'] = 'hidden';
            // 设置 body overflow-y hidden + 去掉 body 的高度限制, 避免出现右侧滚动条
            doc.body.style['overflow-y'] = 'hidden';
            doc.body.style['min-height'] = 'auto';
            doc.body.style['max-height'] = 'auto';
            doc.body.style.height = 'auto';

            // 添加高度自适应 script
            const heightWatcher = doc.createElement('script');
            heightWatcher.type = 'text/javascript';
            heightWatcher.innerHTML = `
            // 监听元素高度变化(200ms 定时查询元素 offsetHeight 是否发生变化)
            // 注意, 不同浏览器, 不同版本, 对各种 height 实现不同, documentElement 和其他元素也有区别
            // 这里是用 documentElement.offsetHeight 来获取整个文档高度, 别的元素的行为不确定, 可能要用 scrollHeight 来获取高度 
            function onElementHeightChange(elm, callback){
                var lastHeight = elm.offsetHeight, newHeight;
                (function run(){
                    newHeight = elm.offsetHeight;
                    if( lastHeight != newHeight ) {
                        callback(newHeight, lastHeight);
                    }
                    lastHeight = newHeight;

                    if( elm.onElementHeightChangeTimer ) {
                        clearTimeout(elm.onElementHeightChangeTimer);
                    }

                    // 更新 hash 值, 供外部监听获取相应传参
                    // iframe document 实际宽度
                    var hashStr = 'documentWidth=' + elm.scrollWidth + ';'
                    // iframe 元素宽度
                    hashStr += 'iframeWidth=' + window.frameElement.clientWidth + ';'
                    // 转码, 赋值
                    location.hash = encodeURIComponent(hashStr);

                    elm.onElementHeightChangeTimer = setTimeout(run, 200);
                })();
            }

            // 监听 documentElement offsetHeight 变化, 变化后设置父页面 frame 元素 height 属性为变化后的高度
            onElementHeightChange(document.documentElement, function(newHeight, oldHeight){
                console.error('onElementHeightChange', newHeight, oldHeight)
                if (window.frameElement) {
                    // 设置 frame height 为变化后的新高度 + 滚动条高度, 以避免元素底部出现水平滚动条时垂直方向不能占满
                    window.frameElement.height = (newHeight || 50) + (window.innerWidth - document.documentElement.clientWidth);
                }
            });

            // 初次加载完成时, 设置父页面 frame 元素 height 属性为 documentElement.offsetHeight
            window.addEventListener('DOMContentLoaded', function(e) {
                if (window.frameElement) {
                    // 设置 frame height 为页面高度 + 滚动条高度, 以避免元素底部出现水平滚动条时垂直方向不能占满
                    window.frameElement.height = document.documentElement.offsetHeight || document.documentElement.scrollHeight + (window.innerWidth - document.documentElement.clientWidth);
                }
            })`;
            doc.body.append(heightWatcher);

            // 设置 DOCTYPE 以避免页面内容缩小时, iframe 高度不变, 导致多出空白区域(参考 https://segmentfault.com/a/1190000014586956#item-3)
            const docType = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';

            // 返回最终的 HTML 字符串
            return docType + doc.documentElement.outerHTML;
        },
        // 渲染 html 到 iframe 中
        renderMailHTML(frameName, strHTML, callBack) {
            // 不加 $nextTick 或 $nextTick 位置放错(参见 git 文件提交日志), 可能导致内容不显示 --- 实际原因是多了一个 iframe , 不清楚咋出现的
            this.$nextTick(() => {
                // 获取指定 iframe 的 window
                let ifr = window.frames[frameName];
                if (!ifr) {
                    return;
                }

                // 清除原有 iframe , 避免其内容对新 iframe 造成影响, 同时也避免原有 iframe 中的各种监听之类的残留
                const ifrElm = ifr.frameElement;
                const newIfrElm = ifr.frameElement.cloneNode();
                ifrElm.parentElement.replaceChild(newIfrElm, ifrElm);

                // 写入新 iframe 内容
                ifr = window.frames[frameName];
                if (ifr) {
                    // 写入 HTML
                    ifr.document.open();
                    ifr.document.write(strHTML);
                    ifr.document.close();
                    // 覆盖 iframe 客户端原有的 height 样式，导致内容不显示
                    ifr.document.children[0].style.height = 'auto';

                    // 触发回调函数
                    if (callBack) {
                        callBack();
                    }
                }
            });
        },
        /**
         * @Description: 原方法打印时可能会漏掉一些内容, 或者在首页留出大量空白, 于是换成 MailDetail.vue 中的原始方法
         * @author 汤一飞
         * @date 2021/5/31
        */
        // 打印 iframe 内容
        // printMailHtml(strHTML, containerNode, frameName) {
        //     const printWin = window.open('打印窗口', '_blank');
        //     printWin.document.write(`<html><head><style media="print">* {word-wrap: break-word; word-break: break-word;}ul li {font-size: 12px;line-height: 18px;font-weight: 400; list-style-type:none;}</style></head><body>${containerNode.innerHTML}</body></html>`);
        //     printWin.document.close();
        //
        //     const innerFrame = printWin.frames[frameName];
        //     innerFrame.document.open();
        //     innerFrame.document.write(strHTML);
        //     innerFrame.addEventListener('load', function(event) {
        //         // const promiseAll = Array.from(document.querySelectorAll('img')).map(imgNode => {
        //         //     return new Promise((resolve, reject) => {
        //         //         if (imgNode.complete) {
        //         //             resolve();
        //         //         } else {
        //         //             imgNode.addEventListener('load', () => resolve());
        //         //         }
        //         //     });
        //         // });
        //         // Promise.all(promiseAll).then(() => {
        //         //     printWin.print();
        //         //     printWin.close();
        //         // });
        //         setTimeout(() => {
        //             printWin.print();
        //             printWin.close();
        //         }, 200);
        //     });
        //     innerFrame.document.close();
        //     printWin.document.close();
        // }
        printMailHtml(strHTML, containerNode, frameName, printFrameName) {
            // 初始化打印 Document
            const parser = new DOMParser();
            // 指定打印样式和 onload 打印
            const doc = parser.parseFromString(`<html><head><style media="print">* {word-wrap: break-word; word-break: break-word;}ul li {font-size: 12px;line-height: 18px;font-weight: 400; list-style-type:none;}</style></head><body onload="window.print()">${containerNode.innerHTML}</body></html>`, 'text/html');

            // 替换邮件内容 iframe 为 iframe 内部文档
            const ifr = doc.querySelector(`iframe[name=${frameName}]`);
            if (ifr) {
                ifr.outerHTML = strHTML;
            }

            // 写入数据到打印 iframe 中, 打印
            const printWin = window.frames[printFrameName];
            if (printWin) {
                printWin.document.write(doc.documentElement.outerHTML);
                printWin.document.close();
            }
        },

        /* 外部模拟水平滚动条 */
        // 监听: iframe hash 值变化
        handleIframeHashChange() {
            setTimeout(() => {
                // 暂存 iframe window
                const ifr = window.frames[this.mailFrameName];
                ifr.onhashchange = () => {
                    // hash 值解码
                    const hashVal = decodeURIComponent(ifr.location.hash);

                    if (hashVal) {
                        // 取到 iframe clientWidth
                        let temp = hashVal.match(/iframeWidth=(.*?);/);
                        // 设置模拟滚动条外部 div 宽度为 iframe clientWidth
                        if (temp[1]) {
                            this.mailScrollContainerStyleObj.width = `${temp[1]}px`;
                        }

                        // 取到 iframe document scrollWidth
                        temp = hashVal.match(/documentWidth=(.*?);/);
                        // 设置模拟滚动条内部 div 宽度为 iframe documentElement scrollWidth
                        if (temp[1]) {
                            this.mailScrollInnerStyleObj.width = `${temp[1]}px`;
                        }
                    }
                };
            }, 100);
        }
    },
    watch: {
        'mailScrollInnerStyleObj.width': {
            handler(val) {
                // 获取模拟滚动条容器
                const scrollBarDiv = this.$refs.mailIframeScroll;
                if (scrollBarDiv) {
                    // 模拟滚动条内部 div 宽度大于容器宽度时, 才允许鼠标点击滚动条区域(避免用户想点击邮件内容却点中滚动条, 导致点击无效)
                    this.mailScrollContainerStyleObj['pointer-events'] = parseFloat(val) > scrollBarDiv.clientWidth ? 'auto' : 'none';

                    // 主动触发垂直滚动方法, 判断当前滚动条应该固定显示还是正常显示
                    this.handleMailVerticalScroll();
                }
            }
        }
    }
};
