<template>
    <Modal :visible="visible"
           :show-close="false"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           :modal-append-to-body="false"
           :destroy-on-close="true"
           width="548px"
           :height="modalHeight"
           ref="container"
           class="vertical-center-modal"
           custom-class="modal-container">
        <!-- loading -->
        <Spin fix v-if="loading"></Spin>

        <!-- 顶部 -->
        <div slot="title">
            <span style="font-weight: 700;font-size: 16x;color: rgba(0,0,0,0.80);letter-spacing: 0;line-height: 26px;">
                {{ $t('crm.Table.title_editColumns') }}
            </span>
            <span style="float: right;">
                <Icon type="md-close"
                      size="27"
                      @click.native="$emit('update:visible', false)"
                      style="cursor: pointer;color: #677F99;"></Icon>
            </span>
        </div>

        <!-- 主体 -->
        <div style="margin: 20px 0 6px;position: relative;">
            <!-- 穿梭框 -->
            <Transfer :data="col_all"
                      :value="col_show"
                      :titles="[$t('crm.Table.hidingColumns'), $t('crm.Table.showingColumns')]"
                      target-order="unshift"
                      :render-content="renderTransferContent"
                      :groupingRules=groupingRules
                      @left-check-change="change_selected_left"
                      @right-check-change="change_selected_right"
                      @change="toggle_visible"
                      @hook:mounted="getTransferHeight">
                       <div class="transfer-footer" slot="right-footer" size="small">操作</div>
                      </Transfer>
            <!-- 上下移动字段 -->
            <div class="move-up-down"
                 style="position:absolute;top:29px;right: 20px;" >
                <Button :disabled="col_selected_show.length === 0"
                        size="mini"
                        type="minor"
                        style="height: 24px"
                        icon="ivu-icon ivu-icon-md-arrow-round-up"
                        @click="move_col_to('up')"></Button>
                <!-- <br> -->
                <!-- <br> -->
                <Button :disabled="col_selected_show.length === 0"
                        size="mini"
                        type="minor"
                        style="margin-top: 20px;height: 24px"
                        icon="ivu-icon ivu-icon-md-arrow-round-down"
                        @click="move_col_to('down')"></Button>
            </div>
        </div>

        <!-- 底部 -->
        <div slot="footer"
             style="padding-top:8px">
            <Button type="primary"
                    @click="save_columns"
                    :class="class_displayfieldsave">{{ $t('crm.Table.saveShowingColumns') }}</Button>
        </div>
    </Modal>
</template>

<script>
import Sortable from 'sortablejs';
    import { mapState } from 'vuex';
    import _ from 'lodash';
    export default {
        name: 'editColumns',
        props: {
            visible: Boolean,
            allColumns: Array,
            allGroup: Array,
            group: Array,
            groupingRules: Array,
            columnType: Number, // 1客户2联系人3询盘4公海客户5线索6公海线索 7fbleads 11网站留言
            id: Number,
            templateId: String// 网站留言表单id
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId'
            }), // 从 vuex 中获取属性,
            // 存放字段对应的多语言
            langMap() {
                const temp = {};
                this.allColumns.forEach(item => {
                    temp[item.key] = item.title;
                });
                return temp;
            },
            // 存放字段对应的 parentId
            belongMap() {
                const temp = {};
                this.allColumns.forEach(item => {
                    temp[item.key] = item.parentId;
                });
                return temp;
            },
            class_displayfieldsave() {
                switch (`${this.columnType}`) {
                    case '1':
                        return 'customer-displayfieldsave';
                    case '2':
                        return 'contact-displayfieldsave';
                    case '3':
                        return 'inquiry-displayfieldsave';
                    case '4':
                        return 'highseasCustomer-displayfieldsave';
                    case '5':
                        return 'clue-edit-display-field';
                    case '6':
                        return 'highseasClue-displayfieldsave';
                    case '15':
                        return 'mail-inbox-displayfieldsave';
                    case '16':
                        return 'mail-unreadBox-displayfieldsave';
                    case '17':
                        return 'mail-starBox-displayfieldsave';
                    case '18':
                        return 'mail-draftBox-displayfieldsave';
                    case '19':
                        return 'mail-sentBox-displayfieldsave';
                    case '20':
                        return 'mail-dustbin-displayfieldsave';
                    case '21':
                        return 'mail-trash-displayfieldsave';
                    case '22':
                        return 'mail-tag-displayfieldsave';
                    case '23':
                        return 'mail-customFolder-displayfieldsave';
                    case '24':
                        return 'mail-customerBox-displayfieldsave';
                    case '25':
                        return 'mail-untreated-displayfieldsave';
                    default:
                        return '';
                }
            }
        },
        data() {
            return {
                // 所有字段
                col_all: [],
                // 显示字段
                col_show: [],
                // 选中字段
                col_selected_show: [],
                col_selected_hide: [],

                // 是否正在保存
                loading: false,

                modalHeight: '',
                transferListStyle: {
                    width: '180px',
                    height: ''
                }

            };
        },
        mounted() {
            this.getModalHeight();
            window.addEventListener('resize', this.getModalHeight);
            
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.getModalHeight);
        },
        methods: {
            renderTransferContent(h, option) {
                // console.log(h, option);
                return <span title={option.label}>{ option.label }</span>;
            },
            getModalHeight: _.debounce(function() {
                // 防抖处理
                if (document.documentElement.clientHeight > 650) {
                    this.modalHeight = document.documentElement.clientHeight - 240;
                } else {
                    this.modalHeight = document.documentElement.clientHeight - 120;
                    // this.transferListStyle.height = this.modalHeight  + 'px'
                }
                this.getTransferHeight();
            }, 300),
            // 获取transfer高度
            getTransferHeight() {
                const height = this.modalHeight - 166;
                this.transferListStyle.height = `${height}px`;
                const container = this.$refs.container.$el;
                const panels = container.querySelectorAll('.el-transfer-panel');
                if (panels.length) {
                    Object.entries(this.transferListStyle).forEach(([attr, value]) => {
                        panels.forEach(panel => {
                            panel.style[attr] = value;
                        });
                    });
                }
            },
            // 显隐切换
            toggle_visible(targetKeys, direction, moveKeys) {
                // 客户列表页, "公司名称"字段始终在显示字段第一位
                if (this.columnType === 1) {
                    const companyNameIndex = targetKeys.findIndex(item => item === 'cpCompanyName');
                    if (companyNameIndex !== -1) {
                        targetKeys.splice(companyNameIndex, 1);
                    }
                    targetKeys.unshift('cpCompanyName');
                }
                this.col_show = targetKeys;
                if (direction === 'left') {
                    this.col_selected_show.length = 0;
                } else {
                    this.col_selected_hide.length = 0;
                }
                this.handleHoverBtn();
            },

            // 记录左右两边被选中的数据
            change_selected_left(checked, changed) {
                this.col_selected_hide = checked;
                this.handleHoverBtn();
            },
            change_selected_right(checked, changed) {
                this.col_selected_show = checked;
                this.handleHoverBtn();
            },
            handleHoverBtn() {
                this.$nextTick(() => {
                    const container = this.$refs.container.$el;
                    const element = container.querySelectorAll('.move-up-down button');
                    const leftBtn = container.querySelectorAll('.el-transfer__buttons button');
                    if (leftBtn.length && this.col_selected_show.length > 0) {
                        Array.from(element).forEach(item => {
                            item.classList.add('move-button-able');
                        });
                        leftBtn[0].classList.add('move-button-able');
                        leftBtn[0].style.backgroundColor = '#fff';
                        leftBtn[0].style.border = '1px solid #cbd6e2';
                    } else if (leftBtn.length && this.col_selected_show.length === 0) {
                        Array.from(element).forEach(item => {
                            item.classList.remove('move-button-able');
                        });
                        leftBtn[0].classList.remove('move-button-able');
                        leftBtn[0].style.backgroundColor = '#e7ecf2';
                        leftBtn[0].style.border = 'none';
                    }
                    if (leftBtn.length && this.col_selected_hide.length) {
                        leftBtn[1].classList.add('move-button-able');
                        leftBtn[1].style.backgroundColor = '#fff';
                        leftBtn[1].style.border = '1px solid #cbd6e2';
                    } else if (leftBtn.length && this.col_selected_hide.length === 0) {
                        leftBtn[1].classList.remove('move-button-able');
                        leftBtn[1].style.backgroundColor = '#e7ecf2';
                        leftBtn[1].style.border = 'none';
                    }
                });
            },

            // 上下移动
            move_col_to(direction) {
                /**
                 * @Description: 对选中的项按照原数据排序
                 * @author mayuanzhi
                 * @date 2020/6/9
                */
                const arr = [];
                this.col_selected_show.forEach(item => {
                    const index = this.col_show.findIndex(col => col === item);
                    if (index > -1) {
                        arr[index] = item;
                    }
                });
                // 过滤空的元素
                this.col_selected_show = arr.filter(item => item);
                switch (direction) {
                    case 'up':
                        this.col_selected_show.forEach(item => {
                            const index = this.col_show.findIndex(col => col === item);
                            /**
                             * @Description: index > 0 改为 index > 1
                             * 新功能要求固定客户列表表格页首列为"公司名称", 因此加上此判断, 不允许其他列移动到"公司名称"之上
                             * @author 汤一飞
                             * @date 2021/6/9
                            */
                            if (index > (this.columnType === 1 ? 1 : 0) && !this.col_selected_show.includes(this.col_show[index - 1])) {
                                this.col_show.splice(index - 1, 0, ...this.col_show.splice(index, 1));
                            }
                        });
                        break;
                    case 'down':
                        this.col_selected_show.slice().reverse().forEach(item => {
                            const index = this.col_show.findIndex(col => col === item);
                            if (index + 1 < this.col_show.length && !this.col_selected_show.includes(this.col_show[index + 1])) {
                                this.col_show.splice(index + 1, 0, ...this.col_show.splice(index, 1));
                            }
                        });
                        break;
                }
            },
            // 保存设置
            save_columns() {
                if (!this.loading) {
                    this.loading = true;
                    this.$commonApi.setTableColConfig({
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        type: this.columnType,
                        id: this.id,
                        templateId: this.templateId || '',
                        showField: this.col_show.join(',')
                    }).then(response => {
                        this.loading = false;
                        if (response.code === '1') {
                            this.$Message.success(this.$t('crm.Table.success_saveShowingColumns'));
                            this.$emit('update:id', response.data);
                            this.$emit('update:group', this.col_show.slice());
                            this.$emit('update:visible', false);
                        } else {
                            this.$Message.error(this.$t('crm.Table.error_saveShowingColumns'));
                        }
                    }, error => {
                        this.loading = false;
                    }).catch(error => {
                        this.loading = false;
                    });
                }
            }
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        this.col_all = this.allGroup.map(item => {
                            return {
                                key: item,
                                label: this.langMap[item],
                                parentId: [1, 4].includes(this.columnType) ? this.belongMap[item] : undefined,
                                disabled: this.columnType === 1 && item === 'cpCompanyName'
                            };
                        });
                        this.col_show = this.group.slice();
                        this.col_selected_show = [];
                        this.col_selected_hide = [];
                        this.$nextTick(()=>{
                            const el = document.getElementsByClassName('el-transfer-panel__list')[0];
                            console.log(el)
                            Sortable.create(el, {
                                group: {
                                    name: el, // 标识拖拽范围, 这里使用 this.fieldBelong , 避免询盘设置页面三种不同 fieldBelong 的字段设置组件内部字段可相互拖动
                                    pull: false, // 内部拖拽元素不可拖出 dom
                                    put: false // 外部拖拽元素不可拖进 dom
                                },
                                animation: 120,
                                ghostClass: 'placeholder-style',
                                fallbackClass: 'iview-admin-cloned-item',
                                onEnd: (e) => {
                                    console.log(e)
                                }
                            });
                        })
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less">
    .modal-container {
        .el-transfer-panel .el-transfer-panel__header .el-checkbox .el-checkbox__label {
            font-size: 12px;
        }
        .el-transfer__buttons {
            padding: 0 20px;

            button {
                background-color: #e7ecf2;
                border: 1px solid rgb(203, 214, 226);
                color: rgb(169, 185, 201);
                padding: 0 5px 6px;
                box-sizing: border-box;
                display: block;
                height: 26px;
                width: 26px;
                font-size: 12px;
                line-height: 26px;
                margin: 0;
                &:first-child {
                    margin-bottom: 12px;
                }

                &[disabled] {
                    border: 1px solid rgb(203, 214, 226);
                    &:hover {
                        background-color: #e7ecf2;
                        border-color: #e7ecf2;
                        color: rgb(169, 185, 201);
                    }
                }
            }
        }

        .el-dialog__body {
            max-height: calc(~'100vh - 100px') !important;
            padding: 0 30px 0 !important;
            // max-height: 600px !important;
        }

        .el-dialog__footer {
            padding: 0 30px 25px !important;
        }

        .el-transfer-panel__body {
            height: calc(~'100% - 40px');

            .el-transfer-panel__list, .el-transfer-panel__group-container {
                height: 100%;

                .el-transfer-panel__item {
                    display: block;
                }
            }
        }

        .move-button-able:hover {
            color: #fff !important;
            // border:none;
            border-color: rgb(150, 187, 247) !important;
            background-color: rgb(66, 133, 244) !important;
            // padding:1px 6px 3px !important
        }
    }

    .move-up-down {
        button {
            padding: 3px 5px;
            color: #a9b9c9;
            box-shadow: none;
            display: block;

            &:nth-child(2) {
                margin: 20px 0 0;
            }
        }
    }
</style>
