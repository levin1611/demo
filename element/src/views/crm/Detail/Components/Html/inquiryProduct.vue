<template>
    <div class="inquiry-product">
        <div class="operate-area">
            <Button type="primary" @click="visible_add_product=!visible_add_product">{{ $t('crm.Html.new') }}</Button>
            <Button type="primary" @click="visible_add_product=!visible_add_product" style="margin-left:10px;">{{
                $t('crm.Html.operate_edit') }}
            </Button>
        </div>

        <Table :columns="tableColumns" :data="tableData"></Table>

        <add-inquiry-product
                :visible.sync="visible_add_product"
                :inquiryId="id"
                :productData="tableData"
                :moneyUnit="moneyUnit"
                :exchangeRate="exchangeRate"
                @refreshData="get_product_by_inquiryId">
        </add-inquiry-product>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import {mapState} from 'vuex';

    import AddInquiryProduct from '@/views/crm/Detail/Components/Modal/addInquiryProduct';

    export default {
        name: 'InquiryProduct',
        props: ['id'],
        components: {AddInquiryProduct},
        computed: {
            ...mapState([
                'enterpriseId',
                'userId',
                'fullName'
            ]),
            // 汇率转换
            exchange_moneyUnit() {
                return (moneyUnit, targetMoneyUnit) => {
                    if (!targetMoneyUnit || moneyUnit === targetMoneyUnit) {
                        return 1;
                    }
                    if (this.exchangeRate[`${moneyUnit}-${targetMoneyUnit}`]) {
                        return this.exchangeRate[`${moneyUnit}-${targetMoneyUnit}`].rate || 1;
                    } else {
                        this.get_exchangeRate(moneyUnit, targetMoneyUnit);
                        return 1;
                    }
                };
            }
        },
        data() {
            return {
                /* 表格 */
                visible_add_product: false,
                tableColumns: [
                    {
                        title: this.$t('crm.Html.productName'),
                        key: 'productName'
                    },
                    {
                        title: this.$t('crm.Html.productPrice'),
                        key: 'productPrice',
                        render: (h, params) => {
                            let temp = [h('span', {
                                style: {
                                    'vertical-align': 'middle'
                                }
                            }, params.row.productPrice)];
                            switch (params.row.moneyUnit) {
                                case 'RMB':
                                    temp.unshift(h(
                                        'Icon',
                                        {
                                            props: {
                                                size: 20,
                                                custom: 'custom custom-icon-yuan'
                                            }
                                        }
                                    ));
                                    break;
                                case 'USD':
                                    temp.unshift(h(
                                        'Icon',
                                        {
                                            props: {
                                                size: 20,
                                                custom: 'custom custom-icon-dollar'
                                            }
                                        }
                                    ));
                                    break;
                            }
                            return h('TooltipAuto', [
                                h('span', temp),
                                h('span', {
                                    slot: 'content'
                                }, temp)
                            ]);
                        }
                    },
                    {
                        title: this.$t('crm.Html.productCount'),
                        key: 'productCount'
                    },
                    {
                        title: this.$t('crm.Html.salesUnitPrice'),
                        key: 'salesUnitPrice',
                        render: (h, params) => {
                            let temp = [h('span', {
                                style: {
                                    'vertical-align': 'middle'
                                }
                            }, this.roundTo(params.row.salesUnitPrice * (this.exchange_moneyUnit)(params.row.actualMoneyUnit, this.moneyUnit)))];
                            switch (this.moneyUnit) {
                                case 'RMB':
                                    temp.unshift(h(
                                        'Icon',
                                        {
                                            props: {
                                                size: 20,
                                                custom: 'custom custom-icon-yuan'
                                            }
                                        }
                                    ));
                                    break;
                                case 'USD':
                                    temp.unshift(h(
                                        'Icon',
                                        {
                                            props: {
                                                size: 20,
                                                custom: 'custom custom-icon-dollar'
                                            }
                                        }
                                    ));
                                    break;
                            }
                            return h('TooltipAuto', [
                                h('span', temp),
                                h('span', {
                                    slot: 'content'
                                }, temp)
                            ]);
                        }
                    },
                    {
                        title: this.$t('crm.Html.productCount'),
                        key: 'productCount'
                    },
                    {
                        title: `${this.$t('crm.Html.discount')}( % )`,
                        key: 'discount'
                    },
                    {
                        title: this.$t('crm.Html.totalPrice'),
                        key: 'totalPrice',
                        render: (h, params) => {
                            let temp = [h('span', {
                                style: {
                                    'vertical-align': 'middle'
                                }
                            }, this.roundTo(params.row.totalPrice * (this.exchange_moneyUnit)(params.row.actualMoneyUnit, this.moneyUnit)))];
                            switch (this.moneyUnit) {
                                case 'RMB':
                                    temp.unshift(h(
                                        'Icon',
                                        {
                                            props: {
                                                size: 20,
                                                custom: 'custom custom-icon-yuan'
                                            }
                                        }
                                    ));
                                    break;
                                case 'USD':
                                    temp.unshift(h(
                                        'Icon',
                                        {
                                            props: {
                                                size: 20,
                                                custom: 'custom custom-icon-dollar'
                                            }
                                        }
                                    ));
                                    break;
                            }
                            return h('TooltipAuto', [
                                h('span', temp),
                                h('span', {
                                    slot: 'content'
                                }, temp)
                            ]);
                        }
                    },
                    {
                        title: this.$t('crm.Html.remark'),
                        key: 'remark'
                    }
                ],
                tableData: [],

                /* 本位币和汇率 */
                moneyUnitCode: {
                    RMB: 'CNY',
                    USD: 'USD'
                },
                moneyUnit: '',
                exchangeRate: {}
            };
        },
        methods: {
            /* 表格 */
            // 通过 inquiryId 获取产品
            get_product_by_inquiryId() {
                util.ajax({
                    url: '/crm/inquiryProduct/getProductByInquiryId',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        inquiryId: this.id
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.tableData = response.data.data.map(item => {
                            item.raw_salesUnitPrice = item.salesUnitPrice;
                            return item;
                        }) || [];
                    } else {
                        this.$Message.error(this.$t('crm.Html.error_getInquiryProduct'));
                    }
                });
            },

            /* 本位币和汇率 */
            // 获取全局本位币
            get_product_money_unit() {
                util.ajaxJson({
                    url: `/crm/productMoneyUnit/${this.enterpriseId}`
                }).then(ret => {
                    if (ret.data.code === '1') {
                        this.moneyUnit = ret.data.data.moneyUnit;
                    }
                });
            },
            // 获取汇率
            get_exchangeRate(moneyUnit, targetMoneyUnit) {
                // 如果不存在则赋初值
                if (!this.exchangeRate[`${moneyUnit}-${targetMoneyUnit}`]) {
                    this.exchangeRate[`${moneyUnit}-${targetMoneyUnit}`] = {
                        isError: true
                    };
                }

                // 返回缓存汇率
                if (!this.exchangeRate[`${moneyUnit}-${targetMoneyUnit}`].isError) {
                    return false;
                }

                // 防止重复发送请求
                if (this.exchangeRate[`${moneyUnit}-${targetMoneyUnit}`].requesting) {
                    return false;
                }

                // 如果有对应的货币单位 CODE, 发送请求
                if (this.moneyUnitCode[moneyUnit] && this.moneyUnitCode[targetMoneyUnit]) {
                    this.exchangeRate[`${moneyUnit}-${targetMoneyUnit}`].requesting = true;
                    util.ajax({
                        url: '/crm/productMoneyUnit/exchangeRate',
                        method: 'get',
                        params: {
                            // 这里后台调用的第三方接口写反了, 我也只能跟着写反
                            originalCoin: this.moneyUnitCode[targetMoneyUnit],
                            targetCoin: this.moneyUnitCode[moneyUnit]
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            let temp = {};
                            temp[`${moneyUnit}-${targetMoneyUnit}`] = {
                                isError: false,
                                updateTime: Date.now(),
                                rate: Number(res.data.data.rate)
                            };
                            this.exchangeRate = Object.assign({}, this.exchangeRate, temp);
                        } else {
                            let temp = {};
                            temp[`${moneyUnit}-${targetMoneyUnit}`] = {
                                isError: false,
                                updateTime: Date.now(),
                                rate: this.exchangeRate[`${moneyUnit}-${targetMoneyUnit}`] ? this.exchangeRate[`${moneyUnit}-${targetMoneyUnit}`].rate : 1
                            };
                            this.exchangeRate = Object.assign({}, this.exchangeRate, temp);
                            this.$Message.error(this.$t('crm.Html.error_getExchange'));
                        }
                        this.exchangeRate[`${moneyUnit}-${targetMoneyUnit}`].requesting = false;
                    });
                } else {
                    // 否则返回失败
                    this.exchangeRate[`${moneyUnit}-${targetMoneyUnit}`] = {
                        isError: true,
                        updateTime: Date.now(),
                        rate: 1
                    };
                    this.$Message.error(this.$t('crm.Html.error_currencyUnit'));
                }
            },
            // 数字/字符串转换为整数或指定位数小数
            roundTo(val, digits = 2) {
                let num = Number(val);
                let result = Number.isInteger(num) ? num : Number(num.toFixed(digits));
                // 如果小于最小精度, 则直接返回最小精度
                if (num > 0 && result === 0) {
                    result = 10 ** -digits; // 10 的负多少次方
                }
                return result;
            }
        },
        created() {
            this.get_product_by_inquiryId();
            this.get_product_money_unit();
        }
    };
</script>

<style lang="less">
    .inquiry-product {
        .operate-area {
            text-align: right;
            margin: 10px 0;
        }
    }
</style>
