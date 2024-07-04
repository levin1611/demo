<template>
    <Card shadow="never" class="customs-data customs-container no-border">
        <div class="inquiry">
            <h3>{{$t('customData.search_data')}}</h3>
            <div class="inquiry-content">
                <!-- <div class="inquiry-item">
                  <DatePicker v-model="dateValue" :options="dateOptions"  type="date"  class="input"></DatePicker>
                  <span>时间：</span>
                </div> -->
                <Row type="flex" justify="space-between" style="width: calc(100% - 130px);">
                    <Col :span="6">
                        <Form label-width="80px" label-position="left">
                            <FormItem :label="$t('customData.data_source')">
                                <Select v-model="dataSource" class="input">
                                    <Option v-for="item in sourceList" :value="item.value" :key="item.value">{{
                                        item.label }}
                                    </Option>
                                </Select>
                            </FormItem>
                            <FormItem :label="$t('customData.origin')">
                                <Input v-model="originCountry" class="input"></Input>
                            </FormItem>
                        </Form>
                    </Col>
                    <Col :span="6">
                        <Form label-width="80px" label-position="left">
                            <FormItem label="HS Code">
                                <Input v-model="HSCode" class="input"></Input>
                            </FormItem>
                            <FormItem :label="$t('customData.impoter')">
                                <Input v-model="importer" class="input"></Input>
                            </FormItem>
                        </Form>
                    </Col>
                    <Col :span="8">
                        <Form label-width="80px" label-position="left">
                            <FormItem :label="$t('customData.prod_desc')">
                                <Input v-model="Description" class="input"></Input>
                            </FormItem>
                            <FormItem :label="$t('customData.exporter')">
                                <Input v-model="provider" class="input"></Input>
                            </FormItem>
                        </Form>
                    </Col>
                </Row>
                <Button @click="search" type="primary" class="center gtm_customsSearch"
                        style="width:90px;">{{$t('customData.search')}}
                </Button>
                <!-- <div class="inquiry-item">
                  <Select v-model="dataSource" class="input">
                    <Option v-for="item in sourceList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                  </Select>
                  <span>{{$t('customData.data_source')}}：</span>
                </div>
                <div class="inquiry-item">
                  <Input v-model="HSCode"  class="input"></Input>
                  <span>HS Code：</span>
                </div>
                <div class="inquiry-item">
                    <Input v-model="Description"  class="input"></Input>
                    <span>{{$t('customData.prod_desc')}}：</span>
                </div>
                <div class="inquiry-item">
                  <Input  v-model="originCountry"  class="input"></Input>
                  <span>{{$t('customData.origin')}}：</span>
                </div>
                <div class="inquiry-item">
                  <Input v-model="importer" class="input"></Input>
                  <span>{{$t('customData.impoter')}}：</span>
                </div>
                <div class="inquiry-item">
                  <Input v-model="provider" class="input"></Input>
                  <span>{{$t('customData.exporter')}}：</span>
                </div> -->
            </div>
        </div>
        <component :is="view"
                   :allList.sync="allTradeList"
                   :pagesize.sync="pagesize"
                   :total.sync="total"
                   :curpage.sync="curpage"
                   :pagesizeopts="pagesizeopts"
                   :loading.sync="loading"
                   @changePage="changePage"
                   @sizeChange="sizeChange"></component>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import customList from './customs-list';
    import timeline from './timeline';

    export default {
        name: 'customs_data',
        components: {
            customList,
            timeline
        },
        created() {
            this.dateformat();
            // this.enterpriseId = this.$store.state.enterpriseId
            // this.userId = this.$store.state.userId
            // this.userName = this.$store.state.userName
            this.stringTrim();
        },
        data() {
            return {
                view: 'customList',
                dateValue: '',
                loading: false,
                HSCode: '', /* 查询的hs编码 */
                originCountry: '', /* 原产国 */
                importer: '', /* 采购商 */
                provider: '', /* 供应商 */
                Description: '', /* 产品描述 */
                dataSource: 'all',
                allTradeList: [],
                curpage: 1,
                pagesize: 10,
                total: 0,
                pagesizeopts: [10, 20, 30, 50],
                sourceList: [
                    {
                        value: 'all',
                        label: this.$t('customData.all')
                    },
                    {
                        value: 'USA',
                        label: this.$t('customData.USA')
                    },
                    {
                        value: 'RUSSIA',
                        label: this.$t('customData.RUSSIA')
                    },
                    {
                        value: 'CHILE',
                        label: this.$t('customData.CHILE')
                    },
                    {
                        value: 'COLONBIA',
                        label: this.$t('customData.COLONBIA')
                    },
                    {
                        value: 'ECUADOR',
                        label: this.$t('customData.ECUADOR')
                    },
                    {
                        value: 'ARGENTINA',
                        label: this.$t('customData.ARGENTINA')
                    },
                    {
                        value: 'Philippins',
                        label: this.$t('customData.Philippins')
                    },
                    // {
                    //     value:'UKRAINE',
                    //     label:this.$t('customData.UKRAINE')
                    // },
                    {
                        value: 'PERU',
                        label: this.$t('customData.PERU')
                    },
                    {
                        value: 'COSTARICA',
                        label: this.$t('customData.COSTARICA')
                    },
                    // {
                    //     value:'VIETNAM',
                    //     label:this.$t('customData.VIETNAM')
                    // },
                    // {
                    //     value:'UK',
                    //     label:this.$t('customData.UK')
                    // },
                    {
                        value: 'PANAMA',
                        label: this.$t('customData.PANAMA')
                    },
                    {
                        value: 'URUGUAY',
                        label: this.$t('customData.URUGUAY')
                    },
                    {
                        value: 'MEXICO',
                        label: this.$t('customData.MEXICO')
                    },
                    {
                        value: 'PARAGUAY',
                        label: this.$t('customData.PARAGUAY')
                    },
                    {
                        value: 'KOREA',
                        label: this.$t('customData.KOREA')
                    },
                    {
                        value: 'PAKIS',
                        label: this.$t('customData.PAKIS')
                    },
                    {
                        value: 'VENEZUELA',
                        label: this.$t('customData.VENEZUELA')
                    },
                    {
                        value: 'INDIA',
                        label: this.$t('customData.INDIA')
                    }
                ],
                companyFields: [ /* 公司信息 */
                    {
                        label: this.$t('customData.Importer_Code'),
                        value: 'Importer_Code'
                    },
                    {
                        label: this.$t('customData.Importer_Department'),
                        value: 'Importer_Department'
                    },
                    {
                        label: this.$t('customData.Importer'),
                        value: 'Importer'
                    },
                    {
                        label: this.$t('customData.TYPE_OF_IMPORT'),
                        value: 'TYPE_OF_IMPORT'
                    },
                    {
                        label: this.$t('customData.provider'),
                        value: 'provider'
                    },
                    {
                        label: this.$t('customData.NOTIFYNAME'),
                        value: 'NOTIFYNAME'
                    },
                    {
                        label: this.$t('customData.Origin_Country'),
                        value: 'Origin_Country'
                    },
                    {
                        label: this.$t('customData.Product_Country'),
                        value: 'Product_Country'
                    },
                    {
                        label: this.$t('customData.SHIPPER_ADDR_1'),
                        value: 'SHIPPER_ADDR_1'
                    },
                    {
                        label: this.$t('customData.SHIPPER_ADDR_2'),
                        value: 'SHIPPER_ADDR_2'
                    },
                    {
                        label: this.$t('customData.SHIPPER_ADDR_3'),
                        value: 'SHIPPER_ADDR_3'
                    },
                    {
                        label: this.$t('customData.SHIPPER_ADDR_4'),
                        value: 'SHIPPER_ADDR_4'
                    },
                    {
                        label: this.$t('customData.Provider_Exporter_Mail'),
                        value: 'Provider_Exporter_Mail'
                    },
                    {
                        label: this.$t('customData.CONSIGNEE_ADDR_1'),
                        value: 'CONSIGNEE_ADDR_1'
                    },
                    {
                        label: this.$t('customData.CONSIGNEE_ADDR_2'),
                        value: 'CONSIGNEE_ADDR_2'
                    },
                    {
                        label: this.$t('customData.CONSIGNEE_ADDR_3'),
                        value: 'CONSIGNEE_ADDR_3'
                    },
                    {
                        label: this.$t('customData.CONSIGNEE_ADDR_4'),
                        value: 'CONSIGNEE_ADDR_4'
                    },
                    {
                        label: this.$t('customData.NOTIFY_ADDR_1'),
                        value: 'NOTIFY_ADDR_1'
                    },
                    {
                        label: this.$t('customData.NOTIFY_ADDR_2'),
                        value: 'NOTIFY_ADDR_2'
                    },
                    {
                        label: this.$t('customData.NOTIFY_ADDR_3'),
                        value: 'NOTIFY_ADDR_3'
                    },
                    {
                        label: this.$t('customData.NOTIFY_ADDR_4'),
                        value: 'NOTIFY_ADDR_4'
                    },
                    {
                        label: this.$t('customData.Code_of_the_guarantor'),
                        value: 'Code_of_the_guarantor'
                    },
                    {
                        label: this.$t('customData.The_guarantor'),
                        value: 'The_guarantor'
                    },
                    {
                        label: this.$t('customData.The_address_of_the_guarantor'),
                        value: 'The_address_of_the_guarantor'
                    },
                    {
                        label: this.$t('customData.Purchase_Country'),
                        value: 'Purchase_Country'
                    },
                    {
                        label: this.$t('customData.Provider_Country'),
                        value: 'Provider_Country'
                    },
                    {
                        label: this.$t('customData.TEL'),
                        value: 'TEL'
                    },
                    {
                        label: this.$t('customData.FAX'),
                        value: 'FAX'
                    },
                    {
                        label: this.$t('customData.EMAIL2'),
                        value: 'EMAIL2'
                    },
                    {
                        label: this.$t('customData.email'),
                        value: 'email'
                    },
                    {
                        label: this.$t('customData.contact'),
                        value: 'contact'
                    },
                    {
                        label: this.$t('customData.addr'),
                        value: 'addr'
                    },
                    {
                        label: this.$t('customData.Con_string'),
                        value: 'Con_string'
                    },
                    {
                        label: this.$t('customData.WEB'),
                        value: 'WEB'
                    }
                ],
                productFields: [ /* 产品信息 */
                    {
                        label: this.$t('customData.PRODUCT_STATUS'),
                        value: 'PRODUCT_STATUS'
                    },
                    {
                        label: this.$t('customData.Harmonized_Code'),
                        value: 'Harmonized_Code'
                    },
                    {
                        label: this.$t('customData.HS_CODE_DESC'),
                        value: 'HS_CODE_DESC'
                    },
                    {
                        label: this.$t('customData.List_item_number'),
                        value: 'List_item_number'
                    },
                    {
                        label: this.$t('customData.Brand'),
                        value: 'Brand'
                    },
                    {
                        label: this.$t('customData.Description'),
                        value: 'Description'
                    },
                    {
                        label: this.$t('customData.manufacturer'),
                        value: 'manufacturer'
                    }
                ]
            };
        },
        computed: {
            // sourceList(){
            //     return this.$store.state.customs.sourceList
            // }
        },
        methods: {
            search() {
                this.view = 'customList';
                this.curpage = 1;
                this.refreshData();
            },
            refreshData() {
                console.log(this.dateValue);
                const jsonData = {};
                jsonData.tableName = 'CustomsDataNew';
                if (this.dateValue) {
                    jsonData.Declaration_Date = this.dateValue.format('yyyy-MM-dd');
                }
                if (this.HSCode) {
                    jsonData.Harmonized_Code = this.HSCode;
                }
                if (this.Description) {
                    jsonData.Description = this.Description;
                }
                if (this.originCountry) {
                    jsonData.Origin_Country = this.originCountry;
                }
                if (this.importer) {
                    jsonData.Importer = this.importer;
                }
                if (this.provider) {
                    jsonData.provider = this.provider;
                }
                if (this.dataSource && this.dataSource != 'all') {
                    jsonData.country = this.dataSource;
                }
                this.getCustomsData(jsonData);
            },
            handleData(list) {
                list.map((item, i) => {
                    item.CIF_US = item.CIF_US ? (Number(item.CIF_US)).toFixed(2) : '—';
                    item.FOB_US = item.FOB_US ? (Number(item.FOB_US)).toFixed(2) : '—';
                    item.Quantity = item.Quantity ? (Number(item.Quantity)).toFixed(2) : '—';
                    item.CIF_FOB = `${item.CIF_US} / ${item.FOB_US}`;
                });
            },
            getCustomsData(jsonData) {
                this.loading = true;
                jsonData = Object.assign({
                    pageSize: this.pagesize, /* 页数 */
                    pageNo: this.curpage
                }, jsonData);
                util.ajax({
                    url: '/hbase-solr/solr/searchData',
                    method: 'post',
                    data: jsonData
                }).then((res) => {
                    this.loading = false;
                    if (res.data.code == 1) {
                        if (res.data.data.list != undefined) {
                            const list = res.data.data.list;
                            this.handleData(list);
                            this.allTradeList = list;
                            this.total = res.data.data.total;
                        } else {
                            this.allTradeList = [];
                            this.total = 0;
                        }
                    } else {
                        this.allTradeList = [];
                        this.total = 0;
                        this.$Message.error(this.$t('customData.data_err'));
                    }
                }).catch(error => {
                    this.loading = false;
                    // this.allTradeList = []
                    // this.$Message.error('服务器错误！');
                });
            },
            /* 分页 */
            changePage(value) {
                this.curpage = value;
                this.refreshData();
            },
            sizeChange(value) {
                this.pagesize = value;
                this.refreshData();
            },
            dateformat() {
                Date.prototype.format = function(fmt) {
                    const o = {
                        'M+': this.getMonth() + 1, // 月份
                        'd+': this.getDate(), // 日
                        'h+': this.getHours(), // 小时
                        'm+': this.getMinutes(), // 分
                        's+': this.getSeconds(), // 秒
                        'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
                        S: this.getMilliseconds() // 毫秒
                    };
                    if (/(y+)/.test(fmt)) {
                        fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()
                        }`).substr(4 -
                            RegExp.$1.length));
                    }
                    for (const k in o) {
                        if (new RegExp(`(${k})`).test(fmt)) {
                            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
                                ? (o[k])
                                : ((`00${o[k]}`).substr((`${o[k]}`).length)));
                        }
                    }
                    return fmt;
                };
            },
            stringTrim() {
                String.prototype.trim = function() {
                    return this.replace(/(^\s*)|(\s*$)/g, '');
                };
            }
        }
    };
</script>

<style scoped lang="less">
    .customs-container {
        min-width: 100%;
        height: 100%;
        position: relative;
    }

    .inquiry {
        height: 150px;
    }

    .inquiry-content {
        margin-top: 20px;
        padding-right: 16px;
        height: 120px;
    }

    .inquiry-item {
        float: left;
        height: 34px;
        width: 32%;
        margin-bottom: 20px;

        .input {
            width: 56%;
            float: right;
        }

        > span {
            display: inline-block;
            color: #999;
            float: right;
            width: 44%;
            padding-right: 12px;
            box-sizing: border-box;
            text-align: right;
            line-height: 34px;
            font-size: 12px;
        }

        /* 最后一列加宽 */

        &:nth-child(3n) {
            width: 40%;
        }

        &:nth-child(3n-2) {
            width: 27%;

            .input {
                width: 66%;
            }

            >span {
                width: 34%;
            }
        }
    }

    .center {
        position: absolute;
        right: 20px;
        top: 100px;
    }
</style>

<style lang="less">
    .customs-data {
        .inquiry {
            padding: 0 10px;

            h3 {
                font-family: PingFangSC-Medium;
                font-size: 16px;
                // color: rgba(0,0,0,0.80);
                color: #2d2f2e;
                letter-spacing: 0;
                line-height: 24px;
                font-weight: normal;
            }
        }

        .ivu-card-body {
            padding: 20px 30px 10px;
        }

        .ivu-form-item {
            margin-bottom: 20px;
        }
    }
</style>
