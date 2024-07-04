<template>
    <div class="leadsBindDet">
        <Drawer
                :visible.sync="visible"
                size="75%"
                :modal="false"
                 :append-to-body="true"
                custom-class="scrollable"
                @open="toggle_drawer(true)"
                @close="toggle_drawer(false)"
        >

            <!-- <template slot="close">
                <Icon custom="custom custom-drawer-detail-close" class="right-top-close"></Icon>
            </template> -->
            <div class="content">
                <div class="content_top_title">
                    <div class="template_title">{{rowInfo.formName}}</div>
                    <Row style="margin-top: 10px">
                        <Col :span="4">
                            <div class="product-item">{{$t('facebook.bindForm.brand_page')}}</div>
                            <div class="product-item-data">{{rowInfo.brandMajorName}}</div>
                        </Col>
                        <Col :span="4">
                            <div class="product-item">{{$t('facebook.bindForm.pageType')}}</div>
                            <div class="product-item-data" v-if="rowInfo.homePageType === 1">
                                {{$t('facebook.companyPage')}}
                            </div>
                            <div class="product-item-data" v-else>{{$t('facebook.myPage')}}</div>
                        </Col>
                        <Col :span="4">
                            <div class="product-item">{{$t('facebook.bindForm.customer')}}</div>
                            <div class="product-item-data">{{rowInfo.leadsCount}}</div>
                        </Col>
                        <Col :span="4">
                            <div class="product-item">{{$t('facebook.bindForm.create_time')}}</div>
                            <div class="product-item-data">{{rowInfo.formCreateTime}}</div>
                        </Col>
                        <Col :span="4">
                            <div class="product-item">{{$t('facebook.bindForm.status')}}</div>
                            <div class="product-item-data">{{rowInfo.formUseState}}</div>
                        </Col>
                        <Col :span="4">
                            <div class="product-item">{{$t('facebook.bindForm.operate')}}</div>
                            <div class="product-item-data" v-if="rowInfo.bindingFlag === 1">已绑定</div>
                            <div class="product-item-data" v-else>未绑定</div>
                        </Col>
                    </Row>
                </div>
                <div class="row_line"></div>
                <div class="content_main">
                    <GoBind
                            :rowInfo="rowInfo"
                            :facebookLeadsFormObj="facebookLeadsFormObj"
                            v-on="$listeners"
                            v-bind="$attrs"
                            @updateSuccess="updateSuccess"
                            @editSuccess="editSuccess"
                            @unbindSuccess="unbindSuccess"></GoBind>
                </div>
            </div>

        </Drawer>
    </div>
</template>

<script>
    import GoBind from '../go-bind/go-bind';

    export default {
        props: {
            isShowDetail: {
                type: Boolean,
                default: false
            },
            rowInfo: {
                type: Object,
                default() {
                    return {};
                }
            },
            facebookLeadsFormObj: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        components: { GoBind },
        data() {
            return {
                visible: false,
                inheritAttrs: false
            };
        },
        methods: {
            unbindSuccess() {
                this.$emit('unbindData');
            },
            updateSuccess() {
                this.$emit('refrashTable');
            },
            editSuccess() {
                this.$emit('editData');
            },
            toggle_drawer(val) {
                this.bus.$emit('shrinkMenu', val);
                if (!val) {
                    this.closeDrawer();
                }
            },
            closeDrawer() {
                this.$emit('update:isShowDetail', false);
            },
            // 绑定给当前所处的 DOM (single-page) 的点击事件, 点击表格条目以外的操作将关闭最上一层 drawer
            click_blank(e) {
                let boo = true;
                let temp_el = e.target;
                while (!temp_el.classList.contains('single-page')) {
                    if (temp_el.classList.contains('el-table__row')) {
                        boo = false;
                        break;
                    } else {
                        temp_el = temp_el.parentElement;
                    }
                }
                if (boo) {
                    this.visible = false;
                    this.$emit('update:isShowDetail', false);
                }
            }

        },
        created() {

        },
        watch: {
            isShowDetail: {
                handler(val) {
                    this.visible = val;
                    console.log(`handler= ${val}`);
                    if (document.getElementsByClassName('single-page')[0]) {
                        if (val) {
                            document.getElementsByClassName('single-page')[0].addEventListener('click', this.click_blank);
                        } else {
                            document.getElementsByClassName('single-page')[0].removeEventListener('click', this.click_blank);
                        }
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less" scoped>
    /deep/ .ivu-drawer-body {
        padding: 0;
    }

    .content_top_title {
        padding: 20px 30px 0;

        .template_title {
            font-family: PingFangSC-Medium;
            font-size: 18px;
            color: rgba(0, 0, 0, 0.80);
        }

        .product-item {
            margin: 10px 0 8px;
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.60);
            letter-spacing: 0;
            line-height: 18px;
        }

        .product-item-data {
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.80);
            letter-spacing: 0;
            line-height: 22px;
        }
    }

    .row_line {
        height: 10px;
        background: #F5F6F9;
        border-radius: 2px;
        margin: 20px 0;
    }

    .right-top-close {
        font-size: 26px;
        background-color: #fff;
        color: #495060;
        opacity: .5;
        border-radius: 20%;
    }

    /deep/ .ivu-drawer-content {
        .ivu-drawer-content-no-mask {
            .ivu-drawer-close {
                top: 0;
                right: 0;
            }
        }
    }

</style>
