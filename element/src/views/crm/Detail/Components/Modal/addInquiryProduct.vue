<template>
    <div>
        <!-- 新建/编辑产品正体 -->
        <Modal
                v-model="visible_save_product"
                :title="$t('crm.Modal.inquiryProduct')"
                :mask-closable="false"
                :closable="false"
                width="1000">
            <Spin fix v-if="loading"></Spin>
            <Table :columns="tableColumns" :data="computed_tableData"></Table>
            <Button type="primary" style="margin:10px 0;" @click="visible_select_product = true">{{
                $t('crm.Modal.addProduct') }}
            </Button>
            <div style="text-align:right;">
                <span>{{ $t('crm.Modal.addedProduct') }}：<span
                        style="color: #FF8355;">{{computed_tableData.length}}</span>{{ $t('crm.Modal.kind') }}</span>
                <span style="padding-left:30px;">
                    {{ $t('crm.Modal.totalAmount') }
                    <template v-if="moneyUnit === 'RMB'">
                        (<Icon custom="custom custom-icon-yuan" size="20"></Icon>)
                    </template>
                    <template v-else-if="moneyUnit === 'USD'">
                        (<Icon custom="custom custom-icon-dollar" size="20"></Icon>)
                    </template>
                    ：
                    <span style="color: #FF8355;">
                        {{ totalAmount }}
                    </span>
                </span>
            </div>

            <div slot="footer">
                <Button @click="cancel_saveProduct">{{ $t('crm.UniSet.modal_cancel') }}</Button>
                <Button @click="ok_saveProduct" type="primary">{{ $t('crm.UniSet.modal_ok') }}</Button>
            </div>
        </Modal>

        <!-- 选择产品模态框 -->
        <Modal
                v-model="visible_select_product"
                :title="$t('crm.Modal.selectProduct')"
                @on-ok="ok_select_product"
                @on-cancel="cancel_select_product"
                :mask-closable="false"
                :closable="false"
                width="800">
            <Input v-model="keywords" style="width: 400px;margin-bottom: 20px" icon="ios-search"
                   @on-enter="searchProduct" @on-click="searchProduct"
                   :placeholder="$t('crm.Modal.tip_inputSearchedProductName')"/>
            <table-list
                    ref="groupTable"
                    :keywords="keywords"
                    :tableHeight="tableHeight"
                    @getSelectIdFromChild="get_selected_product"
            ></table-list>
        </Modal>

        <!-- 可配置产品选择子产品模态框 -->
        <Modal
                v-model="visible_select_childProduct"
                :title="$t('crm.Modal.selectChildProduct')"
                @on-ok="ok_select_childProduct"
                @on-cancel="cancel_select_childProduct"
                :mask-closable="false"
                :closable="false"
                width="800"
                class="modal">
            <template v-for="(product, index) in products">
                {{ $t('crm.Html.productName') }}: {{ product.productName }}
                <br>
                <br>
                <table-list
                        :ref="`childSelect_${index}`"
                        :productId="product.id"
                        @getSelectIdFromChild="get_selected_childProduct">
                </table-list>
                <template v-if="index < products.length - 1">
                    <br>
                    <Divider></Divider>
                </template>
                <template v-else>
                    <br>
                </template>
            </template>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import {mapState} from 'vuex';

    import tableList from '@/views/product/components/table-list.vue';

    export default {
        name: 'AddInquiryProduct',
        props: {
            visible: {
                type: Boolean
            },
            inquiryId: {},
            productData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            moneyUnit: {},
            exchangeRate: {}
        },
        components: {
            tableList
        },
        computed: {
            ...mapState({
                'enterpriseId': 'enterpriseId',
                'userId': 'userId',
                'fullName': 'fullName',
                'window_height': state => state.window_height
            }),
            // 选择产品模态框表格高度, 复制过来的
            tableHeight() {
                return this.window_height - 400;
            },
            totalAmount() {
                let sum = 0;
                for (const item of this.computed_tableData) {
                    sum += item.totalPrice;
                }
                return this.roundTo(sum);
            },
            // 要发送的数据
            inquiryProductList() {
                return this.computed_tableData.concat(this.tableData.filter(item => item.isDelete && item.id)).map(item => {
                    let temp = Object.assign({}, item);
                    temp.inquiryId = this.inquiryId;
                    temp.actualMoneyUnit = this.moneyUnit;
                    temp.orgId = this.enterpriseId;
                    return temp;
                });
            },
            exchange_moneyUnit() {
                return (moneyUnit, targetMoneyUnit) => {
                    if (moneyUnit === targetMoneyUnit || !targetMoneyUnit) {
                        return 1;
                    }
                    if (this.computed_exchangeRate[`${moneyUnit}-${targetMoneyUnit}`]) {
                        return this.computed_exchangeRate[`${moneyUnit}-${targetMoneyUnit}`].rate || 1;
                    } else {
                        this.get_exchangeRate(moneyUnit, targetMoneyUnit);
                        return 1;
                    }
                };
            },
            computed_tableData() {
                let temp = this.tableData.map((item, index) => {
                    if (!item.isDelete) {
                        // 产品价格单位
                        let moneyUnit = item.moneyUnit;
                        // 要转换成的价格单位, 未请求到询盘本位币(暂时以全局本位币代替)时先用销售单价货币单位代替, 还没有就用产品价格单位
                        let targetMoneyUnit = this.moneyUnit || item.actualMoneyUnit || moneyUnit;

                        // 防止产品价格出现 null 之类的, 目前可配置产品和组合产品没弄, 这个很可能出现
                        let productPrice = this.clearToNum(item.productPrice);

                        // 如果产品价格无值, 折扣为 0 , 其他数据不处理
                        if (!productPrice) {
                            item.discount = 0;
                        }

                        // 将产品价格货币单位转换目标价格单位, 以便统一处理
                        item.productPrice = item.productPrice * (this.exchange_moneyUnit)(moneyUnit, targetMoneyUnit);

                        // blur 后调整 tableData
                        switch (item.changeType) {
                            case 'salesUnitPrice':
                                // 计算折扣
                                if (item.productPrice) {
                                    item.discount = this.roundTo(item.salesUnitPrice / item.productPrice * 100);
                                }
                                break;
                            case 'discount':
                                if (productPrice) {
                                    item.salesUnitPrice = this.roundTo(item.productPrice * item.discount / 100);
                                }
                                break;
                            case 'totalPrice':
                                if (item.productCount !== 0) {
                                    item.salesUnitPrice = this.roundTo(item.totalPrice / item.productCount);
                                }
                                // 计算折扣
                                if (item.productPrice) {
                                    item.discount = this.roundTo(item.salesUnitPrice / item.productPrice * 100);
                                }
                                break;
                            case 'productCount':
                                break;
                            default:
                                // 将销售单价货币单位转换到目标价格单位
                                let exchange_rate = (this.exchange_moneyUnit)(item.actualMoneyUnit, targetMoneyUnit);
                                // 如果销售单价货币单位和询盘本位币非同一币种, 则转换销售单价
                                if (exchange_rate !== 1) {
                                    item.salesUnitPrice = this.roundTo(this.clearToNum(item.raw_salesUnitPrice) * exchange_rate);
                                }

                                // 计算折扣
                                if (item.productPrice) {
                                    item.discount = this.roundTo(item.salesUnitPrice / item.productPrice * 100);
                                }
                        }

                        // 进行最小精度显示处理
                        let temp = this.ensureMin(item);
                        item.salesUnitPrice = temp.salesUnitPrice;
                        item.discount = temp.discount;
                        switch (item.changeType) {
                            case 'salesUnitPrice':
                            case 'discount':
                            case 'productCount':
                                item.totalPrice = this.roundTo(item.salesUnitPrice * item.productCount);
                                break;
                            case 'totalPrice':
                                // 如果是直接改动的总价, 不重新计算"精确总价", 按最后更改的结果显示
                                break;
                            default:
                                // 同上, 但加上汇率
                                item.totalPrice = this.roundTo(item.totalPrice * (this.exchange_moneyUnit)(item.actualMoneyUnit, targetMoneyUnit));
                        }

                        if (item.changeType !== 'totalPrice') {
                        }

                        // 还原产品价格
                        item.productPrice = productPrice;

                        return item;
                    }
                }).filter(item => !(!item || item === ''));
                // let temp = this.tableData.filter(item => !item.isDelete);

                return temp;
            }
        },
        data() {
            return {
                /* 添加/编辑产品模态框 */
                visible_save_product: false,
                loading: false,
                tableColumns: [
                    {
                        title: this.$t('crm.Table.operate'),
                        width: 60,
                        tooltip: false,
                        render: (h, params) => {
                            return h('div', [
                                h('Icon', {
                                    props: {
                                        type: 'ios-trash-outline',
                                        size: '16'
                                    },
                                    style: {
                                        cursor: 'pointer'
                                    },
                                    on: {
                                        click: () => {
                                            params.row.isDelete = 1;
                                            this.$set(this.tableData, params.row.index, params.row);
                                        }
                                    }
                                })
                            ]);
                        }
                    },
                    {
                        key: 'productName',
                        renderHeader: (h, params) => {
                            return h('div', [
                                h('span', {
                                    style: {
                                        color: 'red'
                                    }
                                }, '*'),
                                h('span', this.$t('crm.Html.productName'))
                            ]);
                        }
                    },
                    {
                        key: 'productPrice',
                        renderHeader: (h, params) => {
                            return h('div', [
                                h('span', {
                                    style: {
                                        color: 'red'
                                    }
                                }, '*'),
                                h('span', this.$t('crm.Html.productPrice'))
                            ]);
                        },
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
                        key: 'salesUnitPrice',
                        tooltip: false,
                        renderHeader: (h, params) => {
                            return h('div', [
                                h('span', {
                                    style: {
                                        color: 'red'
                                    }
                                }, '*'),
                                h('span', this.$t('crm.Html.salesUnitPrice'))
                            ]);
                        },
                        render: (h, params) => {
                            // 设置本位币图标
                            let Icon = [];
                            switch (this.moneyUnit) {
                                case 'RMB':
                                    Icon.push(h(
                                        'Icon',
                                        {
                                            slot: 'prefix',
                                            props: {
                                                size: 20,
                                                custom: 'custom custom-icon-yuan'
                                            }
                                        }
                                    ));
                                    break;
                                case 'USD':
                                    Icon.push(h(
                                        'Icon',
                                        {
                                            slot: 'prefix',
                                            props: {
                                                size: 20,
                                                custom: 'custom custom-icon-dollar'
                                            }
                                        }
                                    ));
                                    break;
                            }

                            return h('div', [
                                h('Input', {
                                    props: {
                                        value: params.row.salesUnitPrice
                                    },
                                    on: {
                                        'on-blur': event => {
                                            params.row.salesUnitPrice = this.roundTo(this.clearToNum(event.target.value));
                                            params.row.changeType = 'salesUnitPrice';
                                            // params.row.discount = this.roundTo(params.row.salesUnitPrice / params.row.productPrice * 100);
                                            // let temp = this.ensureMin(params.row);
                                            // params.row.salesUnitPrice = temp.salesUnitPrice;
                                            // params.row.discount = temp.discount;
                                            // params.row.totalPrice = params.row.salesUnitPrice * params.row.productCount;
                                            this.$set(this.tableData, params.row.index, params.row);
                                        }
                                    }
                                }, Icon)
                            ]);
                        }
                    },
                    {
                        key: 'productCount',
                        tooltip: false,
                        renderHeader: (h, params) => {
                            return h('div', [
                                h('span', {
                                    style: {
                                        color: 'red'
                                    }
                                }, '*'),
                                h('span', this.$t('crm.Html.productCount'))
                            ]);
                        },
                        render: (h, params) => {
                            return h('div', [
                                h('Input', {
                                    props: {
                                        value: params.row.productCount
                                    },
                                    on: {
                                        'on-blur': event => {
                                            params.row.productCount = this.roundTo(this.clearToNum(event.target.value), 1);
                                            params.row.changeType = 'productCount';
                                            // params.row.totalPrice = params.row.salesUnitPrice * params.row.productCount;
                                            this.$set(this.tableData, params.row.index, params.row);
                                        }
                                    }
                                })
                            ]);
                        }
                    },
                    {
                        title: `${this.$t('crm.Html.discount')}( % )`,
                        key: 'discount',
                        tooltip: false,
                        render: (h, params) => {
                            return h('div', [
                                h('Input', {
                                    props: {
                                        value: params.row.discount
                                    },
                                    on: {
                                        'on-blur': event => {
                                            params.row.discount = this.clearToNum(event.target.value);
                                            params.row.changeType = 'discount';
                                            // params.row.salesUnitPrice = this.roundTo(params.row.productPrice * params.row.discount / 100);
                                            // let temp = this.ensureMin(params.row);
                                            // params.row.salesUnitPrice = temp.salesUnitPrice;
                                            // params.row.discount = temp.discount;
                                            // params.row.totalPrice = params.row.salesUnitPrice * params.row.productCount;
                                            this.$set(this.tableData, params.row.index, params.row);
                                        }
                                    }
                                })
                            ]);
                        }
                    },
                    {
                        title: this.$t('crm.Html.totalPrice'),
                        key: 'totalPrice',
                        tooltip: false,
                        render: (h, params) => {
                            // 设置本位币图标
                            let Icon = [];
                            switch (this.moneyUnit) {
                                case 'RMB':
                                    Icon.push(h(
                                        'Icon',
                                        {
                                            slot: 'prefix',
                                            props: {
                                                size: 20,
                                                custom: 'custom custom-icon-yuan'
                                            }
                                        }
                                    ));
                                    break;
                                case 'USD':
                                    Icon.push(h(
                                        'Icon',
                                        {
                                            slot: 'prefix',
                                            props: {
                                                size: 20,
                                                custom: 'custom custom-icon-dollar'
                                            }
                                        }
                                    ));
                                    break;
                            }

                            return h('div', [
                                h('Input', {
                                    props: {
                                        value: params.row.totalPrice
                                    },
                                    on: {
                                        'on-blur': event => {
                                            params.row.totalPrice = this.clearToNum(event.target.value);
                                            // if (params.row.productCount !== 0) {
                                            //     params.row.salesUnitPrice = this.roundTo(params.row.totalPrice / params.row.productCount);
                                            // params.row.discount = this.roundTo(params.row.salesUnitPrice / params.row.productPrice * 100);
                                            // let temp = this.ensureMin(params.row);
                                            // params.row.salesUnitPrice = temp.salesUnitPrice;
                                            // params.row.discount = temp.discount;
                                            // params.row.totalPrice = params.row.salesUnitPrice * params.row.productCount;
                                            // }
                                            params.row.changeType = 'totalPrice';
                                            this.$set(this.tableData, params.row.index, params.row);
                                        }
                                    }
                                }, Icon)
                            ]);
                        }
                    },
                    {
                        title: this.$t('crm.Html.remark'),
                        key: 'remark',
                        tooltip: false,
                        render: (h, params) => {
                            return h('div', [
                                h('Input', {
                                    props: {
                                        value: params.row.remark
                                    },
                                    on: {
                                        'on-blur': event => {
                                            params.row.remark = event.target.value;
                                            this.tableData[params.row.index].remark = params.row.remark;
                                        }
                                    }
                                })
                            ]);
                        }
                    }
                ],
                tableData: [],
                computed_exchangeRate: {},

                /* 选择产品模态框 */
                visible_select_product: false,
                keywords: '',

                /* 选择产品模态框 */
                visible_select_childProduct: false,
                products: [],

                moneyUnitCode: {
                    RMB: 'CNY',
                    USD: 'USD'
                }
            };
        },
        methods: {
            /* 本位币 */
            // 获取全局本位币
            getProductMoneyUnit() {
                util.ajaxJson({
                    url: `/crm/productMoneyUnit/${this.enterpriseId}`,
                    method: 'get'
                }).then(response => {
                    if (response.data.code === '1') {
                        this.moneyUnit = response.data.data.moneyUnit;
                    }
                });
            },
            // 之后会改成获取当前询盘的本位币, 随后执行系列操作

            /* 数据处理 */
            // 字符串转换为浮点数
            clearToNum(val) {
                let tmp = `${val}`;
                tmp = tmp.replace(/[^\d.]/g, ''); // 清除“数字”和“.”以外的字符
                tmp = tmp.replace(/\.{2,}/g, '.'); // 只保留第一个. 清除多余的
                tmp = tmp.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');
                tmp = tmp.replace(/^(\-)*(\d+)\.(\d*).*$/, '$1$2.$3');// 只能输入两个小数
                if (tmp.indexOf('.') < 0 && tmp != '') { // 以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
                    tmp = parseFloat(tmp);
                }
                return tmp;
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
            },
            // 确保售价/折扣不会因为超出精度范围变成 0
            ensureMin({salesUnitPrice, discount, productPrice}) {
                if (salesUnitPrice === 0 || discount === 0) {
                    return {salesUnitPrice, discount};
                }

                // 最小精度最小值, 实际上因为传入之前已经被 roundTo 方法处理过了, 不会出现小于这两者的情况, 只是为了表明逻辑而写到判断语句中
                let MIN_SALE = 0.01;
                let MIN_DIS = 0.01;

                if (MIN_SALE < MIN_DIS / 100 * productPrice) {
                    if (salesUnitPrice < MIN_SALE || salesUnitPrice < MIN_DIS / 100 * productPrice) {
                        discount = MIN_DIS;
                        salesUnitPrice = this.roundTo(MIN_DIS / 100 * productPrice);
                        if (salesUnitPrice < MIN_SALE) {
                            salesUnitPrice = MIN_SALE;
                        }
                    }
                } else if (MIN_SALE > MIN_DIS / 100 * productPrice) {
                    if (salesUnitPrice < MIN_SALE || salesUnitPrice < MIN_DIS / 100 * productPrice) {
                        salesUnitPrice = MIN_SALE;
                        discount = this.roundTo(salesUnitPrice / productPrice * 100);
                        if (discount < MIN_DIS) {
                            discount = MIN_DIS;
                        }
                    }
                } else {
                    if (salesUnitPrice < MIN_SALE || discount < MIN_SALE) {
                        salesUnitPrice = MIN_SALE;
                        discount = MIN_DIS;
                    }
                }
                return {salesUnitPrice, discount};
            },

            /* 添加/编辑产品模态框 */
            ok_saveProduct() {
                this.loading = true;
                util.ajaxJson({
                    url: '/crm/inquiryProduct/save',
                    method: 'post',
                    data: {
                        inquiryProductList: this.inquiryProductList
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$emit('refreshData');
                        this.cancel_saveProduct();
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_save'));
                    }
                    this.loading = false;
                });
            },
            cancel_saveProduct() {
                this.$emit('update:visible', false);
            },

            /* 选择产品模态框 */
            // 搜索产品
            searchProduct() {
                console.log('搜索产品');
                if (this.keywords) {
                    this.$refs.groupTable.searchData();
                } else {
                    this.$Message.warning(this.$t('crm.Modal.info_inputProductName'));
                }
            },
            // 处理被选中的产品
            async get_selected_product(data) {
                console.log(data);

                let result = [];

                // 处理简单产品
                result = data.filter(product => product.productType === 1).map((item, index) => {
                    let {
                        productPriceUnit: moneyUnit,
                        id: productId,
                        productName,
                        productPrice
                    } = item;

                    return {
                        moneyUnit,
                        actualMoneyUnit: moneyUnit,
                        productId,
                        productName,
                        productPrice,
                        salesUnitPrice: productPrice,
                        raw_salesUnitPrice: productPrice,
                        productCount: 0,
                        discount: 100,
                        totalPrice: 0,
                        remark: '',
                        isDelete: 0,
                        index: this.tableData.length + index
                    };
                });

                // 处理组合产品
                let combination = data.filter(product => product.productType === 3);
                if (combination.length) {
                    let responses = await util.axios.all(combination.map(item => this.get_childProduct(item.id)));
                    let temp = [];
                    responses.forEach(res => {
                        if (res.data.code === '1') {
                            temp = temp.concat(res.data.data.productList);
                        }
                    });

                    result = result.concat(temp.map((item, index) => {
                        let {
                            productPriceUnit: moneyUnit,
                            id: productId,
                            productName,
                            productPrice
                        } = item;

                        return {
                            moneyUnit,
                            actualMoneyUnit: moneyUnit,
                            productId,
                            productName,
                            productPrice,
                            salesUnitPrice: productPrice,
                            raw_salesUnitPrice: productPrice,
                            productCount: 0,
                            discount: 100,
                            totalPrice: 0,
                            remark: '',
                            isDelete: 0,
                            index: this.tableData.length + index
                        };
                    }));
                }

                // 处理可配置产品
                this.products = data.filter(product => product.productType === 2);
                if (this.products.length) {
                    this.visible_select_childProduct = true;
                }

                this.tableData = this.tableData.concat(result);
                // this.tableData = this.tableData.concat(data.map((item, index) => {
                //     let {
                //         productPriceUnit: moneyUnit,
                //         id: productId,
                //         productName,
                //         productPrice,
                //     } = item;
                //
                //     return {
                //         moneyUnit,
                //         actualMoneyUnit: moneyUnit,
                //         productId,
                //         productName,
                //         productPrice,
                //         salesUnitPrice: productPrice,
                //         raw_salesUnitPrice: productPrice,
                //         productCount: 0,
                //         discount: 100,
                //         totalPrice: 0,
                //         remark: '',
                //         isDelete: 0,
                //         index: this.tableData.length + index
                //     };
                // }));
            },
            ok_select_product() {
                this.$refs.groupTable.callBackSelection();
                this.$refs.groupTable.cancelSelect();
                this.visible_select_product = false;
            },
            cancel_select_product() {
                this.visible_select_product = false;
                this.$refs.groupTable.cancelSelect();
            },

            /* 选择可配置产品子产品模态框 */
            get_selected_childProduct(data) {
                this.tableData = this.tableData.concat(data.map((item, index) => {
                    let {
                        productPriceUnit: moneyUnit,
                        id: productId,
                        productName,
                        productPrice
                    } = item;

                    return {
                        moneyUnit,
                        actualMoneyUnit: moneyUnit,
                        productId,
                        productName,
                        productPrice,
                        salesUnitPrice: productPrice,
                        raw_salesUnitPrice: productPrice,
                        productCount: 0,
                        discount: 100,
                        totalPrice: 0,
                        remark: '',
                        isDelete: 0,
                        index: this.tableData.length + index
                    };
                }));
            },
            ok_select_childProduct() {
                this.products.forEach((item, index) => {
                    let ref = `childSelect_${index}`;
                    this.$refs[ref][0].callBackSelection();
                    this.$refs[ref][0].cancelSelect();
                });
                this.visible_select_childProduct = false;
                this.products = [];
            },
            cancel_select_childProduct() {
                this.visible_select_product = false;
                this.products = [];
            },

            // 获取可配置产品和组合产品的子产品
            get_childProduct(productId) {
                return util.ajaxJson({
                    url: '/crm/product/page',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        id: productId,
                        pageNo: 1,
                        pageSize: 50
                    }
                });
            },
            // 获取汇率
            get_exchangeRate(moneyUnit, targetMoneyUnit) {
                // 如果不存在则赋初值
                if (!this.computed_exchangeRate[`${moneyUnit}-${targetMoneyUnit}`]) {
                    this.computed_exchangeRate[`${moneyUnit}-${targetMoneyUnit}`] = {
                        isError: true
                    };
                }

                // 返回缓存汇率
                if (!this.computed_exchangeRate[`${moneyUnit}-${targetMoneyUnit}`].isError) {
                    return false;
                }

                // 防止重复发送请求
                if (this.computed_exchangeRate[`${moneyUnit}-${targetMoneyUnit}`].requesting) {
                    return false;
                }

                // 如果有对应的货币单位 CODE, 发送请求
                if (this.moneyUnitCode[moneyUnit] && this.moneyUnitCode[targetMoneyUnit]) {
                    this.computed_exchangeRate[`${moneyUnit}-${targetMoneyUnit}`].requesting = true;
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
                            this.computed_exchangeRate = Object.assign({}, this.computed_exchangeRate, temp);
                        } else {
                            let temp = {};
                            temp[`${moneyUnit}-${targetMoneyUnit}`] = {
                                isError: false,
                                updateTime: Date.now(),
                                rate: this.computed_exchangeRate[`${moneyUnit}-${targetMoneyUnit}`] ? this.computed_exchangeRate[`${moneyUnit}-${targetMoneyUnit}`].rate : 1
                            };
                            this.computed_exchangeRate = Object.assign({}, this.computed_exchangeRate, temp);
                            this.$Message.error(this.$t('crm.Html.error_getExchange'));
                        }
                        this.computed_exchangeRate[`${moneyUnit}-${targetMoneyUnit}`].requesting = false;
                    });
                } else {
                    // 否则返回失败
                    this.computed_exchangeRate[`${moneyUnit}-${targetMoneyUnit}`] = {
                        isError: true,
                        updateTime: Date.now(),
                        rate: 1
                    };
                    this.$Message.error(this.$t('crm.Html.error_currencyUnit'));
                }
            }
        },
        created() {
            // this.getProductMoneyUnit()
        },
        watch: {
            visible(val) {
                this.visible_save_product = val;
                if (val) {
                    this.tableData = this.productData.map((item, index) => Object.assign({index}, item));
                }
            },
            productData: {
                handler(val) {
                    this.tableData = val.map((item, index) => Object.assign({index}, item));
                },
                deep: true,
                immediate: true
            },
            exchangeRate: {
                handler(val) {
                    this.computed_exchangeRate = Object.assign({}, ...Object.keys(val).map(key => {
                        let temp = {};
                        temp[key] = Object.assign({}, val[key]);
                        return temp;
                    }));
                },
                deep: true
            }
        }
    };
</script>
