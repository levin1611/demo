<template>
    <div style="background-color: white;height: 100%;min-width: 1010px;">
        <Row style="height: 100%;">
            <Col :span="4"
                 style="border-right: 1px solid rgb(232, 234, 236);height: 100%;overflow: auto;">
                <Menu :default-active="view"
                      ref="universal_set_menu"
                      @select="change_view"
                      class="universal-set-menu">
                    <div style="height: 20px;"></div>
                    <MenuItem v-for="item in viewList"
                              :key="item"
                              :index="item"
                              style="width: 100%;">
                            <TooltipAuto :content="item === 'followUpWay' ? $t('crm.UniSet.followUpMode') : $t(`crm.UniSet.${item}`)"></TooltipAuto>
                    </MenuItem>
                </Menu>
            </Col>
            <Col :span="20"
                 style="height: 100%;overflow: auto;">
                <!-- 特殊的设置用单独的组件写着 -->
                <template v-if="['repeatRule', 'followUp', 'setting_label', 'productCategory', 'grouping', 'visitorType', 'autoCreateInquiry', 'followUpWay'].includes(view)">
                    <component :is="view"
                               @updateFormOption="updateFormOption"></component>
                </template>
                <!-- 通用的设置组件 -->
                <template v-else>
                    <CommonSet :type="view"
                               @updateFormOption="updateFormOption"></CommonSet>
                </template>
            </Col>
        </Row>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import CommonSet from '@/views/crm/UniversalSetting/commonSet';
    import productCategory from '@/views/crm/UniversalSetting/productCategory';
    import grouping from '@/views/crm/UniversalSetting/grouping';
    import followUp from '@/views/crm/UniversalSetting/followUp';
    import setting_label from '@/views/crm/UniversalSetting/label';
    import repeatRule from '@/views/crm/UniversalSetting/repeatRule';
    import visitorType from '@/views/crm/UniversalSetting/visitorType';
    import autoCreateInquiry from '@/views/crm/UniversalSetting/autoCreateInquiry';
    import followUpWay from '@/views/crm/UniversalSetting/followUpWay';

    export default {
        name: 'universalSetting',
        components: {
            CommonSet,
            productCategory,
            grouping,
            followUp,
            setting_label,
            repeatRule,
            visitorType,
            autoCreateInquiry,
            followUpWay

        },
        computed: {
            ...mapState([
                'userId',
                'enterpriseId'
            ])
        },
        data() {
            return {
                view: '',
                viewList: [
                    'clientType',
                    'scale',
                    'socialPlatform',
                    'productCategory',
                    'grouping',
                    'sourceChannel',
                    'sourceWay',
                    'followUp',
                    'setting_label',
                    'repeatRule',
                    'closeReason',
                    'autoCreateInquiry',
                    'visitorType',
                    'followUpWay'
                ]
            };
        },
        methods: {
            // 选择设置
            change_view(name) {
                this.view = name;
            },

            // 更改选项时, 同步更改到线索模板
            updateFormOption(options, typeId) {
                util.ajax({
                    url: '/form-cust/form/updateFormColumnOption',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        typeId: typeId,
                        options: options.join('?')
                    }
                });
                this.saveTranslate(options);
            },
            // 更改选项时, 保存多语种
            saveTranslate(arr) {
                const postData = {
                    orgId: this.enterpriseId,
                    textList: arr,
                    dest: 'zh_cn'
                };
                util.ajaxJson({
                    url: '/cuss-login/translate/save',
                    method: 'post',
                    data: JSON.stringify(postData)
                });
            }
        },
        mounted() {
            // 默认显示客户类型
            this.view = 'clientType';
        }
    };
</script>

<style lang="less">
    @import "../../../styles/common.less";
    @import "../Detail/Components/less/modal.less";

    .placeholder-style {
        display: block !important;
        color: transparent;
        border-style: dashed !important;
    }

    .uniSet-modal {
        .el-dialog__header{
            padding: 24px 30px 0;

            .el-dialog__headerbtn {
                right: 30px;
            }
        }

        .el-dialog__body {
            padding: 30px 30px;
        }

        .el-dialog__footer {
            padding: 0 30px 24px;
        }
    }
</style>

<style scoped lang="less">
    .universal-set-menu {
        /deep/ .el-menu-item {
            height: 44px;
            line-height: 22px;
            padding: 12px 30px 10px 30px;

            &.is-active {
                background: #fff8f0;
                color: #fa8241;

                &:before {
                    content: "";
                    display: block;
                    width: 3px;
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    background: #fa8241;
                }
            }
        }
    }
</style>
