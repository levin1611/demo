/**
 * @Description: 列表调整列宽 - 邮件列表特殊处理
 * @author 汤一飞
 */

import { setTableColConfig } from '@/api/reusableApi/common';

export default {
    methods: {
        // 拖拽开始之前, 列 hover 时隐藏筛选弹窗, mousemove
        handleTableColHover(event) {
            if (document.body.style.cursor === 'col-resize' && !document.body.classList.contains('tableColResizable')) {
                // 如果当前鼠标已在调整列宽热区, 且还未加上热区 class

                // 检查当前所在表头单元格, 判断是否需要手动点击表头, 以关闭可能存在的筛选 popper
                const path = event.path || (event.composedPath && event.composedPath());
                for (const i of path) {
                    if (i.tagName === 'THEAD' && i.querySelector('.show-filter-component')) {
                        i.click();
                        break;
                    }
                }

                // 添加 class , class 作用为: 显示列右侧 border + 隐藏表头筛选框触发 icon
                document.body.classList.add('tableColResizable');
            } else if (document.body.style.cursor !== 'col-resize' && !document.body.classList.contains('tableColResizing')) {
                // 如果当前不在热区, 且不在拖动状态(无相应 class)

                // 去掉热区 class
                document.body.classList.remove('tableColResizable');
            }
        },
        // 拖拽开始, mousedown
        handleTableColResizeStart(event) {
            if (document.body.style.cursor === 'col-resize') {
                // 如果表格被点击时, body 样式为拖拽, 则说明是用户在 mousedown 拖拽表格列

                // 给 body 加上"拖拽中" class
                document.body.classList.add('tableColResizing');
            }
        },
        // 拖拽结束, el-table 的 header-dragend 钩子
        handleTableColResizeEnd(newWidth, oldWidth, column) {
            // 限制列最小宽度为 60px
            const width = (newWidth < 60) ? 60 : newWidth;
            column.width = width;

            // 更新 column 源数据的 width , 避免字段顺序调整后 width 重置
            // 更新外层 table
            let dataCol = this.mailTableColumns.find(item => item.key === column.property);
            if (dataCol) {
                // dataCol.width = width;
                dataCol.width = column.property === 'subject' ? undefined : width;
                dataCol.minWidth = width;
            }
            // 更新子 table
            dataCol = this.expandColumns.find(item => item.key === column.property);
            if (dataCol) {
                // dataCol.width = width;
                dataCol.width = column.property === 'subject' ? undefined : width;
                dataCol.minWidth = width;
            }

            // 更新 fieldStyle
            const temp = this.fieldStyle[column.property] || {};
            temp.width = width;
            this.$set(this.fieldStyle, column.property, temp);

            // body 去掉"拖拽中" class
            document.body.classList.remove('tableColResizing');
            document.body.classList.remove('tableColResizable');

            // 发送保存请求
            const postData = {
                orgId: this.orgId,
                userId: this.userId,
                type: this.columnType,
                fieldStyle: JSON.stringify(this.fieldStyle)
            };

            // 发送请求
            setTableColConfig(postData);

            // 为避免缩小列宽导致表格右侧出现空白, 刷新表格重新渲染
            this.refreshColumnFlag = false;
            if (this.currentBox === 'groupBox' && !this.groupBoxId) {
                Object.entries(this.fieldStyle).forEach(([fieldKey, fieldObj]) => {
                    // 更新最外层 table
                    const column = this.BulkMailTableColumns.find((item) => item.key === fieldKey);
                    if (column && fieldObj.width) {
                        column.width = fieldKey === 'subject' ? undefined : fieldObj.width;
                        if (fieldObj.width < column.minWidth) {
                            column.width = column.minWidth;
                        }
                        // column.minWidth = fieldObj.width;
                    }
                });
            }
            this.$nextTick(() => {
                this.refreshColumnFlag = true;
            });
        }
    }
};
