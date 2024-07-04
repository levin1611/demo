<template>
    <div style="max-height:445px;overflow:auto">
        <div v-for="item in formList" class="info-item">
            <div class="item-header clearfloat">
                <div class="info-time">{{item.createTime | timeFormat("DateTime")}}</div>
                <div class="info-title">{{item.templateName}}</div>
            </div>
            <div class="item-body" style="margin: 15px 0">
                <div v-for="(item1,index)  in item.fields" :key="index" style="margin: 5px 0">
                    <!-- <Row class="web-tip">
                        <Col span="4">初次访问网址</Col>
                        <Col span="8">{{item.visitorInfo.firstVisitorAddress}}</Col>
                    </Row> -->
                    <span class="form-item">{{item1.label}}</span><span>{{item1.value}}</span>
                </div>

                <!-- 附加字段 -->
                <template v-if="Array.isArray(externalDataList[item.id]) && externalDataList[item.id].length">
                    <div v-for="item1 in externalDataList[item.id]"
                         :key="item1.key">
                        <!-- checkbox 框型字段 -->
                        <template v-if="item1.type === 'checkbox'">
                            <Checkbox :value="item1.value">{{ item1.label || item1.keyLabel }}</Checkbox>
                        </template>
                        <!-- 其他正常字段 -->
                        <template v-else>
                            <span class="form-item">{{ item1.label }}</span>
                            <span>{{ item1.value }}</span>
                        </template>
                    </div>
                </template>
            </div>
            <div v-if="item.showTable" class="item-table">
                <Table :data="item.tableData"
                       size="medium">
                    <TableColumn v-for="col in chartColumns.filter(col => item.tableData.some(dataItem => !['', null, undefined].includes(dataItem[col.key])))"
                                 :key="col.key"
                                 :prop="col.key"
                                 :label="col.title"
                                 :align="col.align"
                                 :width="col.width"
                                 :min-width="col.width || 64"
                                 :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <!-- 产品图片 -->
                            <template v-if="col.key === 'productImg' && scope.row.productImg">
                                <img :src="scope.row.productImg"
                                     alt=""
                                     height="40px"
                                     width="40px"
                                     style="vertical-align:middle">
                            </template>
                            <!-- 产品链接 -->
                            <template v-else-if="col.key === 'productLink' && scope.row.productLink">
                                <a :href="scope.row.productLink"
                                   target="_blank">{{ scope.row.productLink }}</a>
                            </template>
                            <!-- 含 formatter 的 column 的处理 -->
                            <template v-else-if="col.formatter">{{ (col.formatter)(scope.row) }}</template>
                            <!-- 其他 -->
                            <template v-else>{{ scope.row[col.key] }}</template>
                        </template>
                    </TableColumn>
                </Table>
            </div>

        </div>
        <div v-if="flag" style="margin-top: 60px;text-align: center;color: #999; ">
            <!-- 暂无数据 -->
            {{$t('crm.Table.noData')}}
        </div>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import Utils from '@/utils/index';

    export default {
        props: {
            row: {
                type: Object,
                default() {
                    return {};
                }
            },
            fieldObj: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                flag: false,
                formList: [],
                showTable: false,
                chartColumns: [
                    {
                        title: this.$t('visitor_history.productImage'),
                        key: 'productImg',
                        align: 'left'
                    },
                    {
                        title: this.$t('visitor_history.productName'),
                        key: 'productName',
                        align: 'left'
                    },
                    {
                        title: this.$t('visitor_history.productPage'),
                        key: 'productLink',
                        align: 'left'
                    },
                    {
                        title: this.$t('visitor_history.productQuantity'),
                        key: 'productQuantity',
                        align: 'left'
                    },
                    {
                        title: this.$t('visitor_history.productDescription'),
                        key: 'productDescription',
                        align: 'left'
                    },
                    {
                        title: this.$t('visitor_history.productRadial'),
                        key: 'productRadial',
                        align: 'left'
                    },
                    {
                        title: this.$t('visitor_history.productDiameter'),
                        key: 'productDiameter',
                        align: 'left'
                    },
                    {
                        title: this.$t('visitor_history.productSize'),
                        key: 'productSize',
                        align: 'left',
                        formatter: ({ productSize = '' }) => {
                            return productSize.replace(/\\/g, '');
                        }
                    },
                    {
                        title: this.$t('visitor_history.productItem'),
                        key: 'productItem',
                        align: 'left'
                    },
                    {
                        title: this.$t('visitor_history.productColor'),
                        key: 'productColor',
                        align: 'left'
                    }
                ],
                chartData: [
                    // {
                    //     "productId": "1859",
                    //     "productAddition": "",
                    //     "productImg": "http://www.allystone.com/wp-content/uploads/2019/08/001-118.jpg",
                    //     "productLink": "http://www.allystone.com/materials/diamond-brown/",
                    //     "id": 2,
                    //     "productName": "Diamond Brown"
                    // }, {
                    //     "productId": "940",
                    //     "productAddition": "",
                    //     "productImg": "http://www.allystone.com/wp-content/uploads/2019/07/001.jpg",
                    //     "productLink": "http://www.allystone.com/mosaic-cross-section/",
                    //     "id": 3,
                    //     "productName": "Mosaic Cross section"
                    // }
                ],
                // 网站部为某些客户添加的特殊定制字段
                externalDataList: {}
            };
        },
        methods: {
            getFormByVisitorId() {
                this.formList = [];
                this.flag = false;
                const emailReg = Utils.regExp.fullEmail;
                const telReg = Utils.regExp.fullPhone;
                util.ajax({
                    url: '/form-cust/form/getColumnValueListByVisitorId',
                    method: 'post',
                    data: {
                        visitorId: this.row.visitorId
                    }
                }).then(ret => {
                    if (ret.data.code === '1') {
                        ret.data.data.forEach(element => {
                            const fields = {};
                            element.type = 'form';
                            for (const key in element) {
                                if (key.indexOf('a100') !== -1 && this.fieldObj[key]) {
                                    let formData = element[key];
                                    if (formData.indexOf('@') != -1 && formData.length < 40 && emailReg.test(formData)) { /* 检测是邮箱格式 */
                                        const emailArr = formData.split('@');
                                        emailArr[0] = '****';
                                        formData = emailArr.join('@');
                                    } else if (key !== 'a10010' && telReg.test(formData.replace(/\s/g, ''))) { /* 去掉字符串中空格 检测是电话 */
                                        formData = `${formData.slice(0, -4)}****`;
                                    }
                                    fields[key] = {
                                        label: this.fieldObj[key].name,
                                        value: formData
                                    };
                                }
                            }

                            element.fields = fields;
                            this.productGetList(element);
                        });
                        // 留言增加排序
                        this.formList = ret.data.data.sort((a, b) => {
                            return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
                        });
                    } else {
                        this.flag = true;
                    }
                });
            },
            // 购物车信息列表展示
            productGetList(element) {
                this.$set(this.externalDataList, element.id, []);
                util.ajax({
                    url: '/form-cust/product/getList',
                    method: 'post',
                    data: {
                        orgId: element.orgId,
                        formId: element.id
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        if (Array.isArray(res.data.data.list) && res.data.data.list.length) {
                            this.showTable = true;
                            this.chartData = res.data.data.list;
                            this.$set(element, 'showTable', this.showTable);
                            this.$set(element, 'tableData', this.chartData);
                        } else {
                            this.showTable = false;
                            this.chartData = [];
                            this.$set(element, 'showTable', this.showTable);
                            this.$set(element, 'tableData', this.chartData);
                        }
                        if (Array.isArray(res.data.data.formOptionsDtoList) && res.data.data.formOptionsDtoList.length) {
                            this.externalDataList[element.id] = res.data.data.formOptionsDtoList;
                        }
                    } else {
                        this.showTable = false;
                        this.chartData = [];
                        this.$set(element, 'showTable', this.showTable);
                        this.$set(element, 'tableData', this.chartData);
                    }
                });
            }

        },
        created() {
            this.getFormByVisitorId();
        },
        watch: {
            row: {
                handler: function() {
                    this.getFormByVisitorId();
                },
                deep: true
            }
        }
    };
</script>
<style scoped>
    .info-item {
        background-color: #F9FBFD;
        padding: 20px 10px 20px 10px;
        border-top: 1px dashed #e6e6e6;
    }

</style>
<style lang="less">
    .item-table {
        border-top: 1px dashed #e6e6e6;

        .ivu-table-wrapper {
            border: none;
            padding-top: 10px;

            .ivu-table:before {
                height: 0px;
                color: #cbd6e2;
                background-color: #ffffff;
            }

            .ivu-table:after {
                width: 0px;
            }

            .ivu-table {
                th {
                    background-color: #ffffff;
                }

                a {
                    color: #3b78de;
                }

                a:hover {
                    color: #2d63bc;
                    text-decoration: underline;
                }
            }
        }
    }
</style>
